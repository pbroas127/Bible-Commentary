/**
 * HTML Generator: converts structured commentary data into mobile-optimized HTML
 *
 * Usage:
 *   const html = generateCommentaryHTML(commentaryData)
 *   fs.writeFileSync(`${book}-${chapter}.html`, html)
 */
import { ChapterCommentary } from './types';
export declare function generateCommentaryHTML(data: ChapterCommentary): string;
export default generateCommentaryHTML;
//# sourceMappingURL=html-generator.d.ts.map