import type { ChapterCommentary, BookType } from '../../lib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { filterVersesToRange, normalizeVersesToSequentialRange } from './verse-range-utils.js';

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
    // Allow an env flag to flush cache for testing
    if (process.env.FLUSH_CACHE === 'true') {
      console.log('FLUSH_CACHE=true — clearing cache for', cacheKey);
      this.cache.delete(cacheKey);
    }
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

      // Spawn all agents in parallel, but handle verses-agent in chunked calls
      const overviewP = this.callAgent('overview-agent', bookKey, chapter);
      const greekWordsP = this.callAgent('greek-words-agent', bookKey, chapter);
      const insightsP = this.callAgent('insights-agent', bookKey, chapter);
      const studyGuideP = this.callAgent('study-guide-agent', bookKey, chapter);
      const peopleP = this.callAgent('people-agent', bookKey, chapter);

      // Prefer a full-chapter verses request first so the opening verses are not skipped.
      const fullChapterPrompt = `Generate verse-by-verse JSON for ${bookKey} chapter ${chapter}. Return the full chapter as valid JSON with a top-level "verses" array. Start with verse 1 and include every verse in order through the end of the chapter. Do not skip the opening verses or return only a later range. Return only JSON.`;
      const fullChapter = await this.callAgent('verses-agent', bookKey, chapter, fullChapterPrompt);
      let mergedVerses = filterVersesToRange((fullChapter?.verses || []), 1, 200);

      if (!mergedVerses.length || !mergedVerses.some((v: any) => Number(v.verse) === 1)) {
        const versesChunks: any[] = [];
        const chunkSize = Number(process.env.VERSE_CHUNK_SIZE) || 10;
        let startVerse = 1;
        let keepFetching = true;
        let consecutiveEmpty = 0;

        while (keepFetching && startVerse <= 200) {
          const endVerse = startVerse + chunkSize - 1;
          const userMessage = `Generate verse-by-verse JSON for ${bookKey} chapter ${chapter}, verses ${startVerse}-${endVerse}. Return only verses in that exact range. Do not substitute later verses. Return valid JSON object with a top-level "verses" array.`;
          try {
            const chunk = await this.callAgent('verses-agent', bookKey, chapter, userMessage);
            const chunkVerses = filterVersesToRange(chunk?.verses || [], startVerse, endVerse);
            if (!chunkVerses || chunkVerses.length === 0) {
              consecutiveEmpty += 1;
              if (consecutiveEmpty >= 3) {
                break;
              }
              startVerse = endVerse + 1;
              continue;
            }
            consecutiveEmpty = 0;
            versesChunks.push(chunkVerses);
            if (chunkVerses.length < chunkSize) {
              break;
            }
            startVerse = endVerse + 1;
          } catch (err) {
            console.warn('Error fetching verses chunk:', err);
            consecutiveEmpty += 1;
            if (consecutiveEmpty >= 3) break;
            startVerse += chunkSize;
            continue;
          }
        }

        const flatten = (arrs: any[]) => ([] as any[]).concat(...arrs);
        mergedVerses = flatten(versesChunks || []);
      }

      // Deduplicate by verse number and ensure numeric ordering
      const mapByVerse = new Map<string, any>();
      for (const v of mergedVerses as any[]) {
        const key = String(v?.verse || '').trim();
        if (!key) continue;
        const current = mapByVerse.get(key) as any | undefined;
        if (!current) {
          mapByVerse.set(key, v);
          continue;
        }

        mapByVerse.set(key, {
          verse: Number(current.verse || v.verse),
          text: current.text || v.text,
          commentary: (current.commentary && current.commentary.length) ? current.commentary : v.commentary,
          deeperMeaning: (current.deeperMeaning && current.deeperMeaning.length) ? current.deeperMeaning : v.deeperMeaning,
          greekWords: (current.greekWords && current.greekWords.length) ? current.greekWords : (v.greekWords || []),
          coolPoints: (current.coolPoints && current.coolPoints.length) ? current.coolPoints : (v.coolPoints || []),
          questions: (current.questions && current.questions.length) ? current.questions : (v.questions || []),
          crossReferences: (current.crossReferences && current.crossReferences.length) ? current.crossReferences : (v.crossReferences || []),
          people: (current.people && current.people.length) ? current.people : (v.people || []),
          themes: (current.themes && current.themes.length) ? current.themes : (v.themes || []),
        });
      }
      mergedVerses = Array.from(mapByVerse.values()).sort((a: any, b: any) => Number(a.verse) - Number(b.verse));

      // If the chunked calls produced no usable verses or skipped the opening range, attempt a single-shot full-chapter fallback.
      const minVerse = Number(mergedVerses[0]?.verse || 0);
      if (mergedVerses.length === 0 || minVerse > 1) {
        console.log(`Merged verses length=${mergedVerses.length}; minVerse=${minVerse}; attempting full-chapter fallback request`);
        try {
          const full = await this.callAgent('verses-agent', bookKey, chapter, `Generate verse-by-verse JSON for ${bookKey} chapter ${chapter}. Return the full chapter as valid JSON with top-level \"verses\" array.`);
          const fullVerses = filterVersesToRange((full && full.verses) || [], 1, 200);
          if (fullVerses && fullVerses.length >= mergedVerses.length) {
            // prefer the more complete full-chapter result
            mergedVerses = fullVerses.map((v: any) => ({ ...v, verse: Number(v.verse) }));
          }
        } catch (fallbackErr) {
          console.warn('Full-chapter fallback failed:', fallbackErr);
        }
      }

      const verseNumbers = mergedVerses.map((v: any) => Number(v?.verse)).filter(Number.isFinite);
      const maxObservedVerse = verseNumbers.length ? Math.max(...verseNumbers) : 0;
      if (mergedVerses.length > 0 && (maxObservedVerse > 1 || !mergedVerses.some((v: any) => Number(v.verse) === 1))) {
        console.log(`Normalizing verses to a sequential range from 1 through ${maxObservedVerse}`);
        mergedVerses = normalizeVersesToSequentialRange(mergedVerses, 1, maxObservedVerse || 200);
      }

      // Build verses object for downstream merging
      const verses = { verses: mergedVerses };

      const elapsed = Date.now() - startTime;
      console.log(`All agents completed in ${elapsed}ms`);

      // Await other agents
      const [overview, greekWords, insights, studyGuide, people] = await Promise.all([overviewP, greekWordsP, insightsP, studyGuideP, peopleP]);

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
  private async callAgent(agentName: string, book: string, chapter: number, userMessage?: string): Promise<any> {
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
              content: userMessage || `Generate for ${book} chapter ${chapter}`
            }
          ],
          temperature: 0.1,
          max_tokens: agentName === 'verses-agent' ? 8000 : 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.warn(`Agent ${agentName} returned ${response.status}:`, error);
        return {};
      }

      const data = await response.json() as any;
      // Verbose logging: save raw agent response for debugging
      try {
        const logsDir = resolve(__dirname, '../logs');
        if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
        const logPath = resolve(logsDir, `${agentName}-${book}-${chapter}-${Date.now()}.json`);
        writeFileSync(logPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Agent ${agentName} raw response saved to ${logPath}`);
      } catch (logErr) {
        console.warn('Failed to write agent debug log:', logErr);
      }

      let content = data.choices?.[0]?.message?.content;
      const finishReason = data.choices?.[0]?.finish_reason;

      if (finishReason === 'content_filter' || !content) {
        console.warn(`Agent ${agentName} blocked or empty`);
        return {};
      }

      // Helper to try parse JSON from a content string
      const tryParse = (txt: string) => {
        if (!txt || typeof txt !== 'string') return null;
        // Remove common inline markers that models sometimes inject like [truncated], [continued]
        let cleaned = txt.replace(/\[\s*(truncated|continued|cont|trunc)\s*\]/gi, '');
        // Remove stray control characters
        cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
        // Try to extract the main JSON object (first { .. last })
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace < 0 || lastBrace <= firstBrace) return null;
        let jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
        // Remove trailing commas before closing braces/brackets
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
        jsonStr = jsonStr.trim();
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          // As a fallback, attempt a looser match for a top-level object
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return null;
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (err) {
            return null;
          }
        }
      };

      // First attempt to parse
      let parsed = tryParse(content);

      // If truncated or parse failed, attempt one continuation request
      if ((!parsed && finishReason === 'length') || !parsed) {
        console.log(`Agent ${agentName} response truncated or invalid JSON; attempting continuation`);
        try {
          const contResp = await fetch(`${this.foundryApiEndpoint}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.foundryApiKey}`,
            },
            body: JSON.stringify({
              model: this.foundryDeploymentName,
              messages: [
                { role: 'system', content: agentPrompt },
                { role: 'user', content: `The previous response was cut off. Continue the JSON output. Previous content:\n\n${content}` }
              ],
              temperature: 0.1,
              max_tokens: agentName === 'verses-agent' ? 12000 : 6000,
            }),
          });

          if (contResp.ok) {
            const data2 = await contResp.json() as any;
            // Save continuation log
            try {
              const logsDir = resolve(__dirname, '../logs');
              const logPath2 = resolve(logsDir, `${agentName}-${book}-${chapter}-cont-${Date.now()}.json`);
              writeFileSync(logPath2, JSON.stringify(data2, null, 2), 'utf-8');
              console.log(`Agent ${agentName} continuation response saved to ${logPath2}`);
            } catch (logErr) {
              console.warn('Failed to write agent continuation log:', logErr);
            }

            const content2 = data2.choices?.[0]?.message?.content || '';
            // Try parse both separately and merge verses arrays if present
            const parsed1 = tryParse(content);
            const parsed2 = tryParse(content2);
            // First, if both parsed, merge verses arrays
            if (parsed1 && parsed2) {
              const merged = { ...parsed1 };
              merged.verses = (parsed1.verses || []).concat(parsed2.verses || []);
              return merged;
            }
            // Next, try parsing the concatenation of both contents (helps when JSON was split)
            const combined = `${content || ''}\n${content2 || ''}`;
            const parsedCombined = tryParse(combined);
            if (parsedCombined) return parsedCombined;

            // If one side parsed, prefer the more complete one
            if (parsed2) return parsed2;
            if (parsed1) return parsed1;

            // As a last resort, try to extract and merge "verses" arrays from fragments
            try {
              const verses1 = (content && content.match(/"verses"\s*:\s*\[([\s\S]*?)\]\s*,?/)) ? content.match(/"verses"\s*:\s*\[([\s\S]*?)\]\s*,?/)[1] : null;
              const verses2 = (content2 && content2.match(/"verses"\s*:\s*\[([\s\S]*?)\]\s*,?/)) ? content2.match(/"verses"\s*:\s*\[([\s\S]*?)\]\s*,?/)[1] : null;
              if (verses1 || verses2) {
                const arrText = `[${[verses1, verses2].filter(Boolean).join(',')}]`;
                // sanitize trailing commas
                const cleanedArr = arrText.replace(/,\s*([}\]])/g, '$1');
                const parsedArr = JSON.parse(cleanedArr);
                return { verses: parsedArr };
              }
            } catch (mergeErr) {
              // fall through
            }
          } else {
            console.warn(`Continuation request for ${agentName} returned ${contResp.status}`);
          }
        } catch (contErr) {
          console.warn('Error requesting agent continuation:', contErr);
        }
      }

      if (parsed) return parsed;

      console.warn(`No valid JSON parsed from agent ${agentName} response`);
      return {};
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

    // Group verses into logical groups. Bucket size can be configured via env var GROUP_BUCKET_SIZE
    const bucketSize = Number(process.env.GROUP_BUCKET_SIZE) || 5
    const groups: any[] = []

    for (let i = 0; i < verses.length; i += bucketSize) {
      const slice = verses.slice(i, i + bucketSize)
      const verseRange = slice.length === 1 ? `${slice[0].verse}` : `${slice[0].verse}-${slice[slice.length - 1].verse}`

      const combinedText = slice.map((v: any) => v.text || '').join(' ')

      // Aggregate data
      const commentary = slice.map((v: any) => v.commentary || '').filter(Boolean).join('\n\n')
      const deeper = slice.map((v: any) => v.deeperMeaning || '').filter(Boolean).join('\n\n')
      const questions = slice.flatMap((v: any) => {
        const verseKey = String(v.verse);
        const sg = studyGuide.find((s: any) => String(s.verse) === verseKey);
        return (sg?.questions) || [];
      })

      const groupGreek: any[] = []
      slice.forEach((v: any) => {
        const verseKey = String(v.verse);
        const g = greekWords.find((gw: any) => String(gw.verse) === verseKey)
        if (g && Array.isArray(g.greekWords)) groupGreek.push(...g.greekWords)
      })

      const lessons = slice.flatMap((v: any) => {
        const verseKey = String(v.verse);
        const insight = insights.find((i: any) => String(i.verse) === verseKey) || {}
        return insight.lesson ? [insight.lesson] : []
      })

      const coolPoints = slice.flatMap((v: any) => {
        const verseKey = String(v.verse);
        const insight = insights.find((i: any) => String(i.verse) === verseKey) || {}
        return insight.coolPoints || []
      })

      const crossRefs = slice.flatMap((v: any) => (studyGuide.find((s: any) => s.verse === v.verse)?.crossReferences || []))

      const themes = Array.from(new Set(slice.flatMap((v: any) => v.themes || []).concat(overview.themes || [])))

      groups.push({
        id: `g-${i / bucketSize + 1}`,
        verses: verseRange,
        text: combinedText,
        commentary,
        deeperMeaning: deeper,
        greekWords: groupGreek,
        lessons,
        coolPoints,
        questions,
        crossReferences: crossRefs,
        themes: themes as any,
      })
    }
    // Build chapter-level verse list (preserve original verses array so callers can access all verses)
    // If the `verses` agent returned only a subset, expand per-verse entries from groups ranges.
    let chapterVerses: any[] = [];
    const totalFromGroups = groups.reduce((acc, g) => {
      const parts = String(g.verses).split('-').map((p: any) => parseInt(p, 10));
      const start = parts[0] || 0;
      const end = parts[1] || start;
      return acc + (end - start + 1);
    }, 0);

    if (!verses || verses.length === 0 || verses.length < totalFromGroups) {
      // Expand verses from groups
      for (const g of groups) {
        const parts = String(g.verses).split('-').map((p: any) => parseInt(p, 10));
        const start = parts[0] || 1;
        const end = parts[1] || start;
        for (let v = start; v <= end; v++) {
          chapterVerses.push({
            verse: v,
            text: g.text || '',
            commentary: g.commentary || '',
            deeperMeaning: g.deeperMeaning || '',
            greekWords: g.greekWords || [],
            coolPoints: [],
            questions: g.questions || [],
            crossReferences: g.crossReferences || [],
            people: [],
            themes: g.themes || [],
          });
        }
      }
    } else {
      chapterVerses = verses.map((v: any) => {
        const verseKey = String(v.verse);
        const g = greekWords.find((gw: any) => String(gw.verse) === verseKey);
        const sg = studyGuide.find((s: any) => String(s.verse) === verseKey);
        const insight = insights.find((i: any) => String(i.verse) === verseKey) || {};
        return ({
          verse: Number(v.verse),
          text: v.text,
          commentary: v.commentary || '',
          deeperMeaning: v.deeperMeaning || '',
          greekWords: (g?.greekWords) || [],
          coolPoints: insight.coolPoints || [],
          questions: (sg?.questions) || [],
          crossReferences: (sg?.crossReferences) || [],
          people: [],
          themes: v.themes || [],
        })
      });
    }

    // Deduplicate and sort chapterVerses by verse number
    const verseMap = new Map<string, any>();
    for (const v of chapterVerses) {
      const key = String(v.verse);
      if (!verseMap.has(key)) {
        verseMap.set(key, v);
      } else {
        const existing = verseMap.get(key);
        // Merge fields, prefer existing non-empty values
        verseMap.set(key, {
          verse: existing.verse || v.verse,
          text: existing.text || v.text,
          commentary: (existing.commentary && existing.commentary.length) ? existing.commentary : v.commentary,
          deeperMeaning: (existing.deeperMeaning && existing.deeperMeaning.length) ? existing.deeperMeaning : v.deeperMeaning,
          greekWords: (existing.greekWords && existing.greekWords.length) ? existing.greekWords : (v.greekWords || []),
          coolPoints: (existing.coolPoints && existing.coolPoints.length) ? existing.coolPoints : (v.coolPoints || []),
          questions: (existing.questions && existing.questions.length) ? existing.questions : (v.questions || []),
          crossReferences: (existing.crossReferences && existing.crossReferences.length) ? existing.crossReferences : (v.crossReferences || []),
          people: (existing.people && existing.people.length) ? existing.people : (v.people || []),
          themes: (existing.themes && existing.themes.length) ? existing.themes : (v.themes || []),
        });
      }
    }

    const finalVerses = Array.from(verseMap.values()).sort((a: any, b: any) => Number(a.verse) - Number(b.verse));

    return {
      book,
      chapter,
      bookType,
      overview: overview.overview || '',
      keyVerse: overview.keyVerse || '',
      translation: 'ESV',
      generatedAt: new Date(),
      // Provide both full verse list and grouped views
      verses: finalVerses as any,
      groups: groups as any,
      crossReferences: Array.from(new Set((chapterVerses.flatMap((v: any) => v.crossReferences || [])).map((c: any) => c.passage))).map(p => ({ passage: String(p), explanation: '' })),
      keyPeople: people as any,
    } as any;
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

    // Create a few logical verse groups for the mock data
    const groups = [
      {
        id: 'g1',
        verses: '1-3',
        text: `Sample combined text for ${book} ${chapter}:1-3`,
        commentary: 'This opening section serves as a doxology and sets the theological tone for the chapter.',
        deeperMeaning: 'Peter emphasizes living hope rooted in the resurrection; this hope reorients suffering into purpose.',
        greekWords: [
          {
            word: 'pistis',
            transliteration: 'pístis',
            gloss: 'faith, trust',
            definition: "Confident trust and reliance on God's character and promises.",
            insight: 'Faith here is relational and active, not merely intellectual.',
          },
        ],
        lessons: ['Reorient your suffering through living hope', 'Anchor identity in resurrection, not circumstance'],
        questions: [
          {
            question: 'What does living hope change about how you face trials?',
            answer: 'Living hope reframes trials as refining, not merely punitive; it gives purpose and endurance.',
          },
        ],
        crossReferences: [
          { passage: 'Romans 8:11', explanation: 'Resurrection power at work in believers' },
        ],
        themes: ['Hope', 'Suffering', 'Faith'],
      },
      {
        id: 'g2',
        verses: '4-7',
        text: `Sample combined text for ${book} ${chapter}:4-7`,
        commentary: 'An explanation of how trials test faith and produce praise and glory at Christ\'s revelation.',
        deeperMeaning: 'Testing functions like fire for gold — a refining that proves genuineness.',
        greekWords: [],
        lessons: ['Trials refine character', 'Persevere with joy'],
        questions: [],
        crossReferences: [],
        themes: ['Suffering', 'Hope'],
      },
      {
        id: 'g3',
        verses: '18-19',
        text: `Sample combined text for ${book} ${chapter}:18-19`,
        commentary: 'This section contrasts the perishable ransom with the precious blood of Christ.',
        deeperMeaning: 'Redemption is costly and decisive; Christ\'s blood secures holiness and adoption.',
        greekWords: [],
        lessons: ['Recognize the cost of redemption', 'Live consecrated lives'],
        questions: [],
        crossReferences: [{ passage: 'Isaiah 53:7-9', explanation: 'Suffering servant imagery' }],
        themes: ['Redemption', 'Holiness'],
      },
    ]

    // Build a mock verses array from the groups so callers can fetch all verses
    const mockVerses: any[] = [];
    for (const g of groups) {
      // parse verse range like '1-3' or '4'
      const parts = String(g.verses).split('-').map(p => parseInt(p, 10));
      const start = parts[0] || 1;
      const end = parts[1] || start;
      for (let v = start; v <= end; v++) {
        mockVerses.push({
          verse: v,
          text: `${this.normalizeBookName(book)} ${chapter}:${v} — excerpt from mock data for ${g.id}`,
          commentary: g.commentary || '',
          deeperMeaning: g.deeperMeaning || '',
          greekWords: g.greekWords || [],
          questions: g.questions || [],
          crossReferences: g.crossReferences || [],
          themes: g.themes || [],
        });
      }
    }

    return {
      book,
      chapter,
      bookType: bookConfig.bookType,
      overview: `${this.normalizeBookName(book)} ${chapter} explores the central themes of this epistle with particular focus on faith, grace, and transformation in Christ.`,
      keyVerse: `${this.normalizeBookName(book)} ${chapter}:1-6`,
      verses: mockVerses as any,
      groups: groups as any,
      crossReferences: [
        { passage: 'Romans 1:17', explanation: 'Faith theme developed by Paul.' },
        { passage: 'Isaiah 53', explanation: 'Foundational suffering and redemption imagery.' },
      ],
      keyPeople: [
        {
          name: 'Peter',
          role: 'Apostle',
          background: 'Leader among the Twelve',
          keyMoments: ['Denial and restoration', 'Missionary leadership'],
          relationshipToPassage: 'Author addressing scattered believers',
          legacy: 'Shepherd and witness of Christ',
          keyTexts: ['Acts 2', '1 Peter 5:1-4'],
          characterType: 'apostle',
        },
      ],
    } as any
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
