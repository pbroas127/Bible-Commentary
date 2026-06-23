import type { ChapterCommentary, BookType } from '../../lib';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * CommentaryService
 * 
 * Handles commentary generation through either:
 * - Foundry Model (production) - calls OpenAI-compatible endpoint with system prompt from source control
 * - Mock data (MVP/testing)
 * 
 * System prompt is loaded from prompts/bible-commentary.system.txt and kept in source control.
 * For MVP, returns realistic mock ChapterCommentary JSON.
 */
export class CommentaryService {
  private useMockData = process.env.USE_MOCK_DATA !== 'false';
  private foundryApiEndpoint = process.env.FOUNDRY_API_ENDPOINT || '';
  private foundryDeploymentName = process.env.FOUNDRY_DEPLOYMENT_NAME || '';
  private foundryApiKey = process.env.FOUNDRY_API_KEY || '';
  private systemPrompt: string;
  private agentPrompts: { [key: string]: string } = {};
  private cache: Map<string, ChapterCommentary> = new Map();

  constructor() {
    try {
      // Load main system prompt
      const promptPath = resolve(__dirname, '../prompts/bible-commentary.system.txt');
      this.systemPrompt = readFileSync(promptPath, 'utf-8');
      console.log('System prompt loaded:', promptPath);
    } catch (error) {
      console.warn('Could not load system prompt from file:', error);
      this.systemPrompt = 'Generate Bible commentary in JSON format.';
    }

    // Load sub-agent prompts
    try {
      const agentNames = ['overview-agent', 'verses-agent', 'greek-words-agent', 'insights-agent', 'study-guide-agent', 'people-agent'];
      for (const agent of agentNames) {
        const agentPath = resolve(__dirname, `../prompts/${agent}.txt`);
        this.agentPrompts[agent] = readFileSync(agentPath, 'utf-8');
      }
      console.log('Sub-agent prompts loaded');
    } catch (error) {
      console.warn('Could not load sub-agent prompts:', error);
    }
  }

  /**
   * Generate a full chapter commentary
   */
  async generateChapter(book: string, chapter: number): Promise<ChapterCommentary> {
    // Debug logging
    console.log('generateChapter called for:', book, chapter);
    console.log('USE_MOCK_DATA env:', process.env.USE_MOCK_DATA);
    console.log('useMockData flag:', this.useMockData);
    
    // Check cache first
    const cacheKey = `${book}:${chapter}`;
    if (this.cache.has(cacheKey)) {
      console.log('Cache HIT for', cacheKey);
      return this.cache.get(cacheKey)!;
    }

    console.log('Cache MISS for', cacheKey);
    
    if (this.useMockData) {
      console.log('Using mock data');
      return this.generateMockChapter(book, chapter);
    }

    console.log('Calling Foundry agents');
    return this.generateViaFoundryAgents(book, chapter);
  }

  /**
   * Generate via Foundry Agents (multi-agent orchestration)
   * Spawns 6 sub-agents in parallel, each handling one aspect of the commentary
   * Results are merged and cached
   */
  private async generateViaFoundryAgents(book: string, chapter: number): Promise<ChapterCommentary> {
    if (!this.foundryApiEndpoint || !this.foundryDeploymentName || !this.foundryApiKey) {
      console.warn('Foundry not configured, falling back to mock data');
      return this.generateMockChapter(book, chapter);
    }

    try {
      const bookKey = book.toLowerCase();
      const cacheKey = `${bookKey}:${chapter}`;

      console.log('Spawning 6 Foundry sub-agents in parallel...');
      const startTime = Date.now();

      // Spawn all agents in parallel
      const [overview, verses, greekWords, insights, studyGuide, people] = await Promise.all([
        this.callAgent('overview-agent', bookKey, chapter),
        this.callAgent('verses-agent', bookKey, chapter),
        this.callAgent('greek-words-agent', bookKey, chapter),
        this.callAgent('insights-agent', bookKey, chapter),
        this.callAgent('study-guide-agent', bookKey, chapter),
        this.callAgent('people-agent', bookKey, chapter),
      ]);

      const elapsed = Date.now() - startTime;
      console.log(`All agents completed in ${elapsed}ms`);

      // Merge results into ChapterCommentary
      const commentary = this.mergeAgentResults(bookKey, chapter, {
        overview,
        verses,
        greekWords,
        insights,
        studyGuide,
        people,
      });

      // Cache the result
      this.cache.set(cacheKey, commentary);
      console.log('Result cached for', cacheKey);

      return commentary;
    } catch (error) {
      console.error('Error with Foundry agents:', error);
      // Fallback to mock data on error
      return this.generateMockChapter(book, chapter);
    }
  }

  /**
   * Call a single Foundry agent with its specialized prompt
   */
  private async callAgent(agentName: string, book: string, chapter: number): Promise<any> {
    const agentPrompt = this.agentPrompts[agentName];
    if (!agentPrompt) {
      console.warn(`Agent prompt not found: ${agentName}`);
      return {};
    }

    try {
      const response = await fetch(`${this.foundryApiEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.foundryApiKey}`,
        },
        body: JSON.stringify({
          model: this.foundryDeploymentName,
          messages: [
            {
              role: 'system',
              content: agentPrompt
            },
            {
              role: 'user',
              content: `Generate for ${book} chapter ${chapter}`
            }
          ],
          temperature: 0.5,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.warn(`Agent ${agentName} returned ${response.status}:`, error);
        return {};
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content;
      const finishReason = data.choices?.[0]?.finish_reason;

      if (finishReason === 'content_filter' || !content) {
        console.warn(`Agent ${agentName} blocked or empty`);
        return {};
      }

      // Parse JSON from content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`No JSON in agent ${agentName} response`);
        return {};
      }

      let jsonStr = jsonMatch[0];
      // Clean JSON
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
      jsonStr = jsonStr.trimEnd();
      
      if (!jsonStr.endsWith('}')) {
        const lastBrace = jsonStr.lastIndexOf('}');
        if (lastBrace >= 0) jsonStr = jsonStr.substring(0, lastBrace + 1);
      }

      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn(`Agent ${agentName} error:`, error);
      return {};
    }
  }

  /**
   * Merge agent results into a complete ChapterCommentary
   */
  private mergeAgentResults(book: string, chapter: number, agents: any): ChapterCommentary {
    const overview = agents.overview || {};
    const verses = agents.verses?.verses || [];
    const greekWords = agents.greekWords?.verseWords || [];
    const insights = agents.insights?.verseInsights || [];
    const studyGuide = agents.studyGuide?.verseStudy || [];
    const people = agents.people?.people || [];

    // Determine bookType
    const bookTypeMap: { [key: string]: BookType } = {
      'matthew': 'gospel', 'mark': 'gospel', 'luke': 'gospel', 'john': 'gospel',
      'romans': 'pauline', 'corinthians': 'pauline', 'galatians': 'pauline',
      'ephesians': 'pauline', 'philippians': 'pauline', 'colossians': 'pauline',
      'thessalonians': 'pauline', 'timothy': 'pauline', 'titus': 'pauline', 'philemon': 'pauline',
      'hebrews': 'hebrews', 'james': 'james', 'peter': 'peter', '1peter': 'peter', '2peter': 'peter',
      '1john': 'john', '2john': 'john', '3john': 'john',
      'jude': 'jude', 'revelation': 'revelation',
      'acts': 'acts'
    };

    const bookType: BookType = (bookTypeMap[book] || 'gospel') as BookType;

    // Merge verses with additional data from other agents
    const mergedVerses = verses.map((verse: any, index: number) => {
      const greekData = greekWords.find((g: any) => g.verse === verse.verse) || {};
      const insightData = insights.find((i: any) => i.verse === verse.verse) || {};
      const studyData = studyGuide.find((s: any) => s.verse === verse.verse) || {};

      return {
        verse: verse.verse,
        text: verse.text || '',
        commentary: verse.commentary || '',
        deeperMeaning: verse.deeperMeaning || '',
        wowBox: insightData.wowBox || '',
        greekWords: greekData.greekWords || [],
        coolPoints: insightData.coolPoints || [],
        lesson: insightData.lesson || '',
        questions: studyData.questions || [],
        crossReferences: studyData.crossReferences || [],
        people: people,
        themes: overview.themes || []
      };
    });

    return {
      book,
      chapter,
      bookType,
      overview: overview.overview || '',
      keyVerse: overview.keyVerse || '',
      translation: 'ESV',
      generatedAt: new Date(),
      verses: mergedVerses
    };
  }

  /**
   * Generate mock chapter data for MVP/testing
   */
  private generateMockChapter(book: string, chapter: number): ChapterCommentary {
    const bookKey = book.toLowerCase();
    const bookTypes: Record<string, any> = {
      // Gospels
      matthew: { bookType: 'gospel', accentColor: '#6b9fd4' },
      mark: { bookType: 'gospel', accentColor: '#6b9fd4' },
      luke: { bookType: 'gospel', accentColor: '#6b9fd4' },
      john: { bookType: 'gospel', accentColor: '#6b9fd4' },
      
      // Paul's epistles
      romans: { bookType: 'pauline', accentColor: '#c8a45a' },
      corinthians: { bookType: 'pauline', accentColor: '#c8a45a' },
      '1corinthians': { bookType: 'pauline', accentColor: '#c8a45a' },
      '2corinthians': { bookType: 'pauline', accentColor: '#c8a45a' },
      galatians: { bookType: 'pauline', accentColor: '#c8a45a' },
      ephesians: { bookType: 'pauline', accentColor: '#c8a45a' },
      philippians: { bookType: 'pauline', accentColor: '#c8a45a' },
      colossians: { bookType: 'pauline', accentColor: '#c8a45a' },
      thessalonians: { bookType: 'pauline', accentColor: '#c8a45a' },
      '1thessalonians': { bookType: 'pauline', accentColor: '#c8a45a' },
      '2thessalonians': { bookType: 'pauline', accentColor: '#c8a45a' },
      timothy: { bookType: 'pauline', accentColor: '#c8a45a' },
      '1timothy': { bookType: 'pauline', accentColor: '#c8a45a' },
      '2timothy': { bookType: 'pauline', accentColor: '#c8a45a' },
      titus: { bookType: 'pauline', accentColor: '#c8a45a' },
      philemon: { bookType: 'pauline', accentColor: '#c8a45a' },
      
      // Peter
      peter: { bookType: 'peter', accentColor: '#5bb8a0' },
      '1peter': { bookType: 'peter', accentColor: '#5bb8a0' },
      '2peter': { bookType: 'peter', accentColor: '#5bb8a0' },
      
      // John
      '1john': { bookType: 'john', accentColor: '#8b6ba8' },
      '2john': { bookType: 'john', accentColor: '#8b6ba8' },
      '3john': { bookType: 'john', accentColor: '#8b6ba8' },
      
      // Other epistles
      hebrews: { bookType: 'hebrews', accentColor: '#c9865e' },
      james: { bookType: 'james', accentColor: '#7ba374' },
      jude: { bookType: 'jude', accentColor: '#a89b7e' },
      
      // Historical
      acts: { bookType: 'acts', accentColor: '#9b6b9b' },
      
      // Revelation
      revelation: { bookType: 'revelation', accentColor: '#c04a4a' },
    };

    const bookConfig = bookTypes[bookKey] || { bookType: 'pauline', accentColor: '#8b7355' };

    return {
      book,
      chapter,
      bookType: bookConfig.bookType,
      overview: `${this.normalizeBookName(book)} ${chapter} explores the central themes of this epistle with particular focus on faith, grace, and transformation in Christ.`,
      keyVerse: `${this.normalizeBookName(book)} ${chapter}:1-6`,
      verses: [
        {
          verse: '1',
          text: `Sample verse text for ${book} ${chapter}:1`,
          commentary: 'This verse introduces the main theme...',
          deeperMeaning: 'At a theological level, this verse points to the incarnational nature of God\'s work.',
          wowBox: 'Like a master building a foundation, Christ lays the groundwork for our faith.',
          greekWords: [
            {
              word: 'pistis',
              transliteration: 'pís-tis',
              gloss: 'faith, belief, trust',
              definition: 'Confident trust and reliance on God\'s character and promises.',
              insight: 'Not mere intellectual agreement, but trust-based action.',
            },
          ],
          coolPoints: ['This is rare in Paul\'s letters', 'Connects to OT tradition'],
          lesson: 'We are called to active trust, not passive agreement. Faith is lived, not merely believed.',
          questions: [
            {
              question: 'How does this verse challenge your assumptions about faith?',
              answer: 'By redefining faith as action rooted in trust, not just mental assent. This requires vulnerability and surrender.',
            },
          ],
          crossReferences: [
            {
              passage: 'Romans 1:17',
              explanation: 'Paul develops this same theme here, emphasizing the centrality of faith throughout Scripture.',
            },
          ],
          people: [
            {
              name: 'Paul',
              role: 'Apostle',
              background: 'Former Pharisee turned Christian missionary',
              keyMoments: ['Damascus Road conversion', 'Letter to Galatians'],
              relationshipToPassage: 'Author and primary voice',
              legacy: 'Shaped doctrine of justification by faith',
              keyTexts: ['Galatians 2:20', 'Romans 8:28'],
              characterType: 'apostle',
            },
          ],
          themes: ['Faith', 'Grace', 'Transformation'],
        },
      ],
    };
  }

  /**
   * Normalize book name (e.g., "1peter" → "1 Peter", "galatians" → "Galatians")
   */
  private normalizeBookName(book: string): string {
    const bookMap: Record<string, string> = {
      galatians: 'Galatians',
      romans: 'Romans',
      corinthians: '1 Corinthians',
      '1corinthians': '1 Corinthians',
      '2corinthians': '2 Corinthians',
      ephesians: 'Ephesians',
      philippians: 'Philippians',
      colossians: 'Colossians',
      '1thessalonians': '1 Thessalonians',
      '2thessalonians': '2 Thessalonians',
      '1timothy': '1 Timothy',
      '2timothy': '2 Timothy',
      titus: 'Titus',
      philemon: 'Philemon',
      hebrews: 'Hebrews',
      james: 'James',
      '1peter': '1 Peter',
      '2peter': '2 Peter',
      '1john': '1 John',
      '2john': '2 John',
      '3john': '3 John',
      jude: 'Jude',
      revelation: 'Revelation',
      matthew: 'Matthew',
      mark: 'Mark',
      luke: 'Luke',
      john: 'John',
      acts: 'Acts',
    };

    return bookMap[book.toLowerCase()] || this.capitalize(book);
  }

  private capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}
