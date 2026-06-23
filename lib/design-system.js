/**
 * Design system: color schemes, typography, and theme definitions
 * Maps book types to accent colors and CSS variables
 */
export const DESIGN_SYSTEM = {
    pauline: {
        bookType: 'pauline',
        accentColor: '#c8a45a', // Gold
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    peter: {
        bookType: 'peter',
        accentColor: '#5bb8a0', // Teal
        backgroundColor: '#0c0b09',
        fontSerif: 'Lora',
        fontSans: 'Inter'
    },
    john: {
        bookType: 'john',
        accentColor: '#6b9fd4', // Blue
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    gospel: {
        bookType: 'gospel',
        accentColor: '#6b9fd4', // Blue
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    acts: {
        bookType: 'acts',
        accentColor: '#7eb3d4', // Light Blue
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    hebrews: {
        bookType: 'hebrews',
        accentColor: '#c8a45a', // Gold (Pauline-adjacent)
        backgroundColor: '#0c0b09',
        fontSerif: 'Lora',
        fontSans: 'Inter'
    },
    james: {
        bookType: 'james',
        accentColor: '#9b8ec4', // Purple (Wisdom)
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    jude: {
        bookType: 'jude',
        accentColor: '#c04a4a', // Deep Red
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    revelation: {
        bookType: 'revelation',
        accentColor: '#c04a4a', // Deep Red
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'DM Sans'
    },
    wisdom: {
        bookType: 'wisdom',
        accentColor: '#d4a574', // Warm Amber
        backgroundColor: '#0c0b09',
        fontSerif: 'Lora',
        fontSans: 'DM Sans'
    },
    prophets: {
        bookType: 'prophets',
        accentColor: '#9b8ec4', // Purple
        backgroundColor: '#0c0b09',
        fontSerif: 'Playfair Display',
        fontSans: 'Inter'
    }
};
/**
 * Generate CSS custom property definitions for a book type
 */
export function generateCSSVariables(config) {
    const accentBg = hexToRgba(config.accentColor, 0.08);
    const border = 'rgba(255,255,255,0.07)';
    const border2 = 'rgba(255,255,255,0.12)';
    return `
:root {
  --bg: ${config.backgroundColor};
  --surface: #161412;
  --surface2: #1e1b17;
  --surface3: #252118;
  --border: ${border};
  --border2: ${border2};
  --accent: ${config.accentColor};
  --accent-bg: ${accentBg};
  --text: #ede8df;
  --muted: #7d7568;
  --muted2: #a09488;
  --font-serif: '${config.fontSerif}', serif;
  --font-sans: '${config.fontSans}', sans-serif;
}
  `.trim();
}
/**
 * Convert hex color to rgba with transparency
 */
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
/**
 * Global CSS styles (shared across all books)
 */
export const GLOBAL_CSS = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  font-size: 16px;
}

@media (prefers-color-scheme: dark) {
  html, body {
    background: var(--bg);
    color: var(--text);
  }
}

a {
  color: var(--accent);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  background: var(--accent);
  color: var(--bg);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.9;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1rem; }

p {
  margin-bottom: 1rem;
}

.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .container {
    max-width: 800px;
    padding: 0 2rem;
  }
}
`;
export const THEME_CSS = `
.hero {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  padding: 2rem 1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.hero .chapter {
  font-style: italic;
  font-size: 1.5rem;
  color: var(--muted2);
  margin-bottom: 1rem;
}

.hero .key-verse {
  font-style: italic;
  color: var(--muted);
  padding: 1rem;
  border-left: 3px solid var(--accent);
  background: var(--surface3);
  border-radius: 4px;
  max-width: 600px;
  margin: 0 auto;
}

.sticky-nav {
  position: sticky;
  top: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  z-index: 100;
}

.sticky-nav .verse-pill {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.sticky-nav .verse-pill:hover,
.sticky-nav .verse-pill.active {
  background: var(--accent);
  color: var(--bg);
}

.theme-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}

.theme-chip {
  background: var(--surface3);
  border: 1px solid var(--border);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.theme-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.theme-chip.active {
  background: var(--accent);
  color: var(--bg);
  border-color: var(--accent);
}

.overview-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.overview-card h3 {
  margin-top: 0;
  color: var(--accent);
}

.verse-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.verse-card-header {
  background: var(--surface2);
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.verse-card-header:hover {
  background: var(--surface3);
}

.verse-number {
  font-weight: 600;
  color: var(--accent);
  font-size: 1.1rem;
}

.verse-text {
  color: var(--muted2);
  font-style: italic;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.expand-icon {
  transition: transform 0.2s;
}

.verse-card-header.expanded .expand-icon {
  transform: rotate(180deg);
}

/* .verse-card-content uses native <details> elements - no max-height needed */

.verse-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
  overflow-x: auto;
}

.verse-tabs button {
  flex: 1;
  min-width: 120px;
  background: transparent;
  color: var(--muted2);
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.verse-tabs button:hover {
  color: var(--accent);
}

.verse-tabs button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: transparent;
}

.tab-content {
  padding: 1.5rem;
  display: none;
}

.tab-content.active {
  display: block;
}

.greek-word {
  background: var(--surface3);
  border-left: 3px solid var(--accent);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.greek-char {
  font-size: 1.75rem;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.greek-info {
  font-size: 0.9rem;
  color: var(--muted2);
  margin-bottom: 0.75rem;
}

.wow-box {
  background: var(--accent-bg);
  border: 2px solid var(--accent);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-style: italic;
  color: var(--text);
}

.cool-points {
  list-style-position: inside;
  padding-left: 1rem;
}

.cool-points li {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.questions-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.question-item {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.question-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.question-header:hover {
  background: var(--surface3);
}

.question-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.question-content.expanded {
  max-height: 1000px;
}

.question-content-inner {
  padding: 0 1rem 1rem 1rem;
  background: var(--bg);
}

.cross-ref {
  background: var(--surface2);
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border-left: 3px solid var(--accent);
  border-radius: 4px;
}

.cross-ref-passage {
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.cross-ref-explanation {
  color: var(--muted2);
  font-size: 0.95rem;
}

.person-bio {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.person-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.person-info {
  flex: 1;
}

.person-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--accent);
}

.person-role {
  font-size: 0.9rem;
  color: var(--muted2);
  margin-bottom: 0.5rem;
}

.person-bio-text {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.person-key-texts {
  font-size: 0.85rem;
  color: var(--muted);
}

.footer {
  background: var(--surface2);
  border-top: 1px solid var(--border);
  padding: 2rem 1rem;
  margin-top: 3rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}

.footer-metadata {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  html, body {
    font-size: 15px;
  }

  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }

  .sticky-nav {
    padding: 0.5rem;
  }

  .verse-tabs button {
    min-width: 90px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }

  .person-bio {
    flex-direction: column;
  }

  .person-avatar {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
}

/* Details/Summary collapsible sections */
details {
  margin-bottom: 0;
}

details[open] {
  padding-bottom: 1rem;
}

summary {
  cursor: pointer;
  user-select: none;
  padding: 1rem;
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
  transition: background 0.2s;
}

summary:hover {
  background: var(--surface3);
}

summary::marker {
  color: var(--accent);
}

.verse-details > summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
}

.verse-details > summary .verse-number {
  font-weight: 600;
  color: var(--accent);
  font-size: 1.1rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.verse-details > summary .verse-text {
  color: var(--muted2);
  font-style: italic;
  font-size: 0.95rem;
  flex: 1;
}

.verse-card-content {
  padding: 0 1rem;
}

.section-detail {
  margin-bottom: 0.5rem;
}

.section-title {
  padding: 0.75rem 1rem;
  background: var(--surface3);
  border-left: 3px solid var(--accent);
  font-size: 1rem;
  color: var(--accent);
  display: block;
}

.section-detail[open] > .section-title {
  border-left-color: var(--accent);
  background: var(--surface2);
}

.section-content {
  padding: 1rem;
  background: var(--bg);
}

.section-detail > summary::marker {
  display: none;
}

.section-detail > summary::before {
  content: '▶ ';
  display: inline-block;
  transition: transform 0.2s;
  color: var(--accent);
  margin-right: 0.5rem;
}

.section-detail[open] > summary::before {
  transform: rotate(90deg);
}
`;
//# sourceMappingURL=design-system.js.map