# HTML Generator Library — Developer Guide

The `lib/` folder is a **standalone, reusable library** for converting structured Bible commentary data into mobile-optimized HTML.

## Quick Start

### 1. Import the library

```typescript
import { generateCommentaryHTML } from './lib'
import type { ChapterCommentary } from './lib'
```

### 2. Create structured data

```typescript
const commentary: ChapterCommentary = {
  book: 'Galatians',
  chapter: 1,
  bookType: 'pauline',
  overview: 'Paul opens his epistle to the churches of Galatia with an apostolic greeting and immediately transitions to rebuke...',
  keyVerse: 'Galatians 1:6 — I am astonished that you are so quickly deserting him who called you in the grace of Christ and are turning to a different gospel.',
  translation: 'ESV',
  verses: [
    {
      verse: '1',
      text: 'Paul, an apostle—not from men nor through man, but through Jesus Christ and God the Father, who raised him from the dead—',
      commentary: 'Paul opens with his authority. Unlike other apostles who knew Jesus in the flesh, Paul grounds his apostolic credentials in his encounter with the risen Christ.',
      deeperMeaning: 'Authority in God\'s kingdom comes not through lineage or institutional approval, but through direct divine encounter.',
      wowBox: 'Imagine someone claiming to be a general without a commission, yet they march out and command troops successfully because they carry the emperor\'s signet ring. That\'s Paul\'s position—his authority looks illegitimate to Jerusalem insiders until you see the seal: Christ himself.',
      greekWords: [
        {
          word: 'ἀπόστολος',
          transliteration: 'apostolos',
          gloss: 'apostle',
          definition: 'One sent with a mission; an envoy carrying authority from the sender.',
          insight: 'Paul uses this word to claim he wasn\'t self-appointed but **apostolos**—he was sent directly by Christ. This is his entire defense against critics claiming he\'s a second-tier apostle.'
        }
      ],
      coolPoints: [
        'Paul names himself immediately—unusual for the era\'s rhetorical conventions, which would flatter the audience first.',
        'He emphasizes "not from men" twice, drilling in that his authority doesn\'t come from Jerusalem\'s approval.'
      ],
      lesson: 'Authentic spiritual authority comes from personal transformation through encounter with Christ, not from institutional credentials.',
      questions: [
        {
          question: 'How does Paul\'s claim of apostolic authority based on a post-resurrection encounter differ from the other apostles\' position?',
          answer: 'The Twelve witnessed Jesus during his earthly ministry and were directly commissioned. Paul, by contrast, was an opponent who encountered the risen Christ. This makes him vulnerable to the charge of being a lesser apostle or false teacher. Yet Paul argues that Christ-encounter is what matters, not chronological proximity. This raises the question: What makes someone a legitimate leader in God\'s kingdom—tradition, institutional position, or transformed relationship with Christ?'
        },
        {
          question: 'Why do you think Paul felt the need to defend his apostolic authority before even addressing the Galatian problem?',
          answer: 'His opponents in Galatia were likely undermining his authority, suggesting he wasn\'t a "real" apostle. By establishing his credentials upfront—before his rebuke—Paul inoculates his argument. He\'s saying: "You should listen to me because I speak with Christ\'s authority, not because I\'m trying to win you over personally."'
        }
      ],
      crossReferences: [
        {
          passage: '1 Corinthians 9:1-2',
          explanation: 'Paul uses similar language to defend his apostolicity in Corinth, emphasizing his encounter with the risen Jesus and the fruit of his ministry.'
        },
        {
          passage: 'Acts 9:1-19',
          explanation: 'The account of Paul\'s encounter with the risen Christ on the Damascus Road—the event he\'s referencing as the source of his authority.'
        }
      ],
      themes: ['Authority', 'Gospel', 'Calling']
    }
    // ... more verses
  ]
}
```

### 3. Generate HTML

```typescript
const html = generateCommentaryHTML(commentary)
```

### 4. Save or serve

```typescript
// Save to file
import fs from 'fs'
fs.writeFileSync(`${commentary.book}-${commentary.chapter}.html`, html)

// Or return from API
app.post('/api/generate-commentary', (req, res) => {
  const html = generateCommentaryHTML(req.body)
  res.setHeader('Content-Type', 'text/html')
  res.send(html)
})
```

---

## Data Structure Reference

### `ChapterCommentary` (top-level)

```typescript
interface ChapterCommentary {
  book: string                    // "Galatians", "2 Peter", "Romans", etc.
  chapter: number                 // 1, 2, 3, etc.
  bookType: BookType              // 'pauline' | 'peter' | 'gospel' | etc.
  overview: string                // 1-2 paragraph context for the chapter
  keyVerse: string                // Verse quote for the hero section
  verses: VerseCommentary[]        // Array of verse data
  translation?: string            // "ESV", "NIV", "NKJV" (defaults to "ESV")
  generatedAt?: Date              // ISO timestamp
  generatedBy?: string            // e.g., "Claude 3.5 Sonnet"
}
```

### `VerseCommentary` (verse-level)

```typescript
interface VerseCommentary {
  verse: string                   // "1", "2:3", "1-5", etc.
  text: string                    // The actual verse text
  commentary: string              // Context: what's happening, argument, historical notes
  deeperMeaning: string           // Theological/symbolic meaning
  wowBox?: string                 // (Optional) Vivid analogy or thought experiment
  greekWords: GreekWord[]         // 2-4 key words max
  coolPoints: string[]            // 3-5 surprising details or facts
  lesson: string                  // One actionable takeaway (1-2 sentences)
  questions: ReflectionQuestion[] // 4 probing questions with answers
  crossReferences: CrossReference[] // 3-5 related passages
  people?: PersonBio[]            // (Optional) Named people in the passage
  themes: Theme[]                 // 2-4 theme tags
}
```

### `GreekWord`

```typescript
interface GreekWord {
  word: string                    // Greek characters: "δοῦλος"
  transliteration: string         // Romanized: "doulos"
  gloss: string                   // One-word English: "slave"
  definition: string              // Full definition and usage range
  insight: string                 // Why this word matters in this verse
                                  // (Name the word in **bold**)
}
```

### `ReflectionQuestion`

```typescript
interface ReflectionQuestion {
  question: string                // Probing question (not yes/no)
  answer: string                  // Substantive 3-5 sentence answer
}
```

### `CrossReference`

```typescript
interface CrossReference {
  passage: string                 // "Romans 6:1-10"
  explanation: string             // Why it connects to this verse
}
```

### `PersonBio`

```typescript
interface PersonBio {
  name: string                    // "Peter", "Timothy"
  role: string                    // "Apostle", "Disciple"
  background: string              // Brief background
  keyMoments: string[]            // Key life moments relevant to this passage
  relationshipToPassage: string   // Why they appear here
  legacy: string                  // What they left behind
  keyTexts?: string[]             // e.g., ["Galatians 1:1", "1 Corinthians 9:1"]
  characterType?: 'apostle' | 'disciple' | 'opponent' | 'supporter' | 'named-person'
}
```

### `BookType` enum

```typescript
type BookType = 
  | 'pauline'     // Romans, Galatians, Corinthians, Ephesians, Philippians, Colossians, etc.
  | 'peter'       // 1 Peter, 2 Peter
  | 'john'        // 1 John, 2 John, 3 John
  | 'gospel'      // Matthew, Mark, Luke, John
  | 'acts'        // Acts
  | 'hebrews'     // Hebrews
  | 'james'       // James
  | 'jude'        // Jude
  | 'revelation'  // Revelation
  | 'wisdom'      // Psalms, Proverbs, Ecclesiastes
  | 'prophets'    // Isaiah, Jeremiah, etc.
```

### `Theme` enum

```typescript
type Theme =
  | 'Gospel'
  | 'Grace'
  | 'Identity'
  | 'Authority'
  | 'Faith'
  | 'Knowledge'
  | 'Calling'
  | 'Scripture'
  | 'Virtue'
  | 'Transformation'
  | 'False Teaching'
  | 'Unity'
  | 'Suffering'
  | 'Hope'
  | 'Prayer'
  | 'Love'
  | 'Wisdom'
```

---

## Customization

### Change Colors

Edit `lib/design-system.ts`:

```typescript
export const DESIGN_SYSTEM: Record<BookType, DesignConfig> = {
  pauline: {
    bookType: 'pauline',
    accentColor: '#FFD700',  // Change from gold to bright yellow
    backgroundColor: '#0c0b09',
    fontSerif: 'Playfair Display',
    fontSans: 'DM Sans'
  },
  // ...
}
```

### Change Fonts

```typescript
peter: {
  bookType: 'peter',
  accentColor: '#5bb8a0',
  backgroundColor: '#0c0b09',
  fontSerif: 'Georgia',      // Change from Lora
  fontSans: 'Segoe UI'       // Change from Inter
}
```

### Add Custom CSS

Extend `THEME_CSS` in `design-system.ts` or inject custom styles when generating:

```typescript
const html = generateCommentaryHTML(commentary)
const customCSS = `
  .verse-card { 
    border-radius: 12px;  /* Increase from 8px */
  }
`
const finalHTML = html.replace('</style>', customCSS + '</style>')
```

---

## Design System

### Book Type Colors

| Type | Accent | Meaning |
|------|--------|---------|
| pauline | Gold #c8a45a | Authority, doctrine |
| peter | Teal #5bb8a0 | Stability, nature |
| gospel | Blue #6b9fd4 | Sky, revelation |
| wisdom | Amber #d4a574 | Warmth, enlightenment |
| revelation | Deep Red #c04a4a | Fire, judgment |

### Typography

- **Serif** (titles, Greek): Playfair Display, Lora, Georgia
- **Sans** (body): DM Sans, Inter, Segoe UI

### Dark Theme Colors

```
--bg: #0c0b09           /* Main background */
--surface: #161412      /* Cards, panels */
--surface2: #1e1b17     /* Darker panels */
--surface3: #252118     /* Darkest containers */
--text: #ede8df         /* Main text */
--muted: #7d7568        /* Secondary text */
--muted2: #a09488       /* Tertiary text */
--accent: varies        /* Book-type color */
```

---

## Interactive Features (Built-in)

The generated HTML includes:

✅ **Expandable verse cards** — tap to reveal full commentary  
✅ **Tabbed sections** — Commentary, Deeper, Greek, Cool Points, Lesson, Q&A, Cross-Refs, People  
✅ **Theme filters** — hide/show verses by topic  
✅ **Sticky navigation** — jump to verse ranges  
✅ **Expandable questions** — tap to reveal answers  
✅ **Mobile-optimized** — responsive, dark mode, touch-friendly  
✅ **Self-contained** — no external dependencies, works offline  

All JavaScript is **embedded** in the HTML—no external scripts to load.

---

## API Reference

### `generateCommentaryHTML(data: ChapterCommentary): string`

**Parameters:**
- `data` — Structured commentary object

**Returns:**
- Complete HTML string (self-contained, ready to save/serve)

**Example:**
```typescript
const html = generateCommentaryHTML(commentaryData)
// Output: "<!DOCTYPE html>\n<html lang="en">\n<head>..."
```

### `generateCSSVariables(config: DesignConfig): string`

**Parameters:**
- `config` — Design configuration object

**Returns:**
- CSS custom property definitions

**Example:**
```typescript
const cssVars = generateCSSVariables(DESIGN_SYSTEM.pauline)
// Output: ":root { --bg: #0c0b09; --accent: #c8a45a; ... }"
```

---

## Troubleshooting

### Empty verse cards
**Problem**: Verses appear but content is missing.  
**Solution**: Ensure each verse has all required fields: `commentary`, `deeperMeaning`, `lesson`, `greekWords`, `coolPoints`, `questions`, `crossReferences`, `themes`.

### Styling issues
**Problem**: Colors or fonts not applying correctly.  
**Solution**: Check `bookType` is valid. Ensure book type is in `DESIGN_SYSTEM`.

### Performance (large chapters)
**Problem**: HTML file is too large.  
**Solution**: Limit Greek words to 2-4 per verse; limit cool points and questions.

### Mobile layout breaks
**Problem**: Content runs off screen on phones.  
**Solution**: Library handles responsive design. If custom CSS was injected, ensure media queries are present.

---

## Examples

### Generate and Serve API

```javascript
const express = require('express')
const { generateCommentaryHTML } = require('./lib')
const app = express()

app.post('/api/commentary', express.json(), (req, res) => {
  try {
    const html = generateCommentaryHTML(req.body)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(html)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(3000)
```

### CLI Tool

```bash
#!/usr/bin/env node
const fs = require('fs')
const { generateCommentaryHTML } = require('./lib')

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: generate-commentary <input.json>')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
const html = generateCommentaryHTML(data)
const outputFile = `${data.book}-${data.chapter}.html`

fs.writeFileSync(outputFile, html)
console.log(`✓ Generated ${outputFile}`)
```

### React Component

```jsx
import { generateCommentaryHTML } from '@bible-commentary/skill/lib'

export function CommentaryViewer({ data }) {
  const html = generateCommentaryHTML(data)
  return <iframe srcDoc={html} />
}
```

---

## Publishing to NPM

When ready to share:

```bash
# Update package.json version
npm version patch

# Publish
npm publish --access public
```

Then install in any project:

```bash
npm install @bible-commentary/skill
```

And use:

```typescript
import { generateCommentaryHTML } from '@bible-commentary/skill'
```
