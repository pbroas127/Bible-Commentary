import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import type { ChapterCommentary } from '../../lib';
import { CommentaryService } from '../services/commentary-service.js';
import { CacheService } from '../services/cache-service.js';

const commentaryService = new CommentaryService();
const cacheService = new CacheService();

export async function getCommentary(request: HttpRequest): Promise<HttpResponseInit> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Extract route parameters
    const { book, chapter } = request.params;

    if (!book || !chapter) {
      return {
        status: 400,
        headers: corsHeaders,
        jsonBody: {
          error: 'Missing required parameters: book and chapter',
          example: '/api/v1/commentary/galatians/1',
        },
      };
    }

    // Validate chapter is a number
    const chapterNum = parseInt(chapter, 10);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 150) {
      return {
        status: 400,
        headers: corsHeaders,
        jsonBody: {
          error: 'Chapter must be a valid number between 1 and 150',
        },
      };
    }

    // Check cache first
    const cacheKey = `${book.toLowerCase()}:${chapter}`;
    const cached = await cacheService.get(cacheKey);
    
    if (cached) {
      return {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 min
          'X-Cache': 'HIT',
        },
        jsonBody: cached,
      };
    }

    // Generate fresh commentary
    const commentary: ChapterCommentary = await commentaryService.generateChapter(
      book,
      chapterNum
    );

    // Validate response shape
    if (!commentary.book || !commentary.chapter || !commentary.verses) {
      return {
        status: 500,
        headers: corsHeaders,
        jsonBody: {
          error: 'Invalid commentary structure returned from generation service',
        },
      };
    }

    // Cache for 5 minutes
    await cacheService.set(cacheKey, commentary, 300);

    return {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 min
        'X-Cache': 'MISS',
      },
      jsonBody: commentary,
    };
  } catch (error) {
    console.error('Error in getCommentary:', error);

    return {
      status: 500,
      headers: corsHeaders,
      jsonBody: {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// Register HTTP route
app.http('getCommentary', {
  route: 'commentary/{book}/{chapter}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getCommentary,
});
