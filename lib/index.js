/**
 * Bible Commentary HTML Generator Library
 *
 * A standalone, reusable library for converting structured Bible commentary data
 * into mobile-optimized HTML.
 *
 * Usage:
 *
 *   import { generateCommentaryHTML } from './lib'
 *   import type { ChapterCommentary } from './lib'
 *
 *   const commentary: ChapterCommentary = {
 *     book: 'Galatians',
 *     chapter: 1,
 *     bookType: 'pauline',
 *     overview: '...',
 *     keyVerse: '...',
 *     verses: [...]
 *   }
 *
 *   const html = generateCommentaryHTML(commentary)
 *   fs.writeFileSync('Galatians-1.html', html)
 */
export { generateCommentaryHTML } from './html-generator';
export { DESIGN_SYSTEM, generateCSSVariables, GLOBAL_CSS, THEME_CSS } from './design-system';
//# sourceMappingURL=index.js.map