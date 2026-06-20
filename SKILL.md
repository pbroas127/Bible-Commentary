---
name: bible-commentary
description: >
  Use this skill whenever a user asks for Bible study, verse commentary, Scripture breakdown, or chapter analysis. Triggers include: "do [book] [chapter]", "commentary on [passage]", "break down [verse]", "study [book]", "what does [passage] mean", "explain [Bible chapter]", "give me commentary on", "Bible study on", "verse by verse", or any request to study, explain, or explore a specific Bible passage. Also trigger when the user asks to add a new chapter to an existing Bible study file, or requests Greek/Hebrew word breakdowns, character bios, cross-references, or theme tags for a Bible passage. This skill produces polished, mobile-optimized HTML files downloadable to phone — not just inline text. Always use this skill for ANY Bible passage study request, even casual ones like "what about Galatians 1" or "do 2 Peter next."
---

# Bible Commentary Skill

Produces rich, mobile-optimized HTML Bible study files with verse-by-verse commentary, deeper meaning, original Greek/Hebrew word breakdowns, personal character bios, theme tags, reflection questions with answers, cross-references, and analogies. Output is always a downloadable `.html` file the user can open on their phone — not inline text.

## Output Standard

Every chapter file must include ALL of the following for each verse section:

1. **Commentary** — What's happening in context, who's writing, what's the argument
2. **Deeper Meaning** — What's symbolically or theologically beneath the surface; include a `wow-box` analogy that makes the reader think "that's insane/beautiful"
3. **Greek Words** — 2–4 key words with: Greek character, transliteration, literal definition, and a paragraph insight explaining why that word changes how you read the passage. Only include words with genuinely meaningful payoff — not every word
4. **Cool Points** — Surprising details, historical facts, rhetorical moves, things most readers miss
5. **Lesson** — One clear, practical takeaway
6. **Questions** — 4 reflection questions, each expandable with a substantive answer (not just a restatement of the question)
7. **Cross-References** — 3–5 references with explanations of WHY they connect, not just citation
8. **People (Bios)** — Character bio cards for any named person in the passage: birth/background, key life moments, relationship to the text, death/legacy, key texts. Only include when relevant people appear.

## Design System

Use this exact HTML/CSS design — dark theme, mobile-first, teal accent color for 2 Peter style, gold for Galatians style, purple for 1 Corinthians style. Vary accent colors per book for visual distinction.

### Color Schemes by Book Type
- **Paul's letters** (Romans, Galatians, Corinthians, Ephesians, etc.): Gold `#c8a45a` accent
- **Peter's letters**: Teal `#5bb8a0` accent  
- **Gospel / narrative**: Blue `#6b9fd4` accent
- **Wisdom / poetry** (Psalms, Proverbs, Ecclesiastes): Amber `#c8a45a` with warm brown bg
- **Prophets**: Purple `#9b8ec4` accent
- **Revelation**: Deep red `#c04a4a` accent

### Required UI Elements
- Hero section with book name, chapter in italic serif, key verse quote
- Theme filter bar (chips that hide/show cards by theme)
- Sticky nav bar with verse range pills
- Overview card explaining chapter context
- Verse cards that expand on tap with inner tab system
- Tab buttons: Commentary | Deeper Meaning | Greek Words | Cool Points | Lesson | Questions | Cross-Refs | People (only show People tab when bios exist)
- Questions are expandable accordions with answers
- Footer

### CSS Variables (always include)
```css
:root {
  --bg: #0c0b09;        /* or variant per book */
  --surface: #161412;
  --surface2: #1e1b17;
  --surface3: #252118;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --accent: #c8a45a;    /* varies by book */
  --accent-bg: rgba(200,164,90,0.08);
  --text: #ede8df;
  --muted: #7d7568;
  --muted2: #a09488;
}
```

### Key Fonts
Always load from Google Fonts:
- Serif for titles/Greek words: `Playfair Display` or `Lora`
- Body: `DM Sans` or `Inter`

## Content Quality Standards

### Greek Word Breakdowns
Structure every Greek card like this:
- Greek characters (large, italic serif, accent color)
- Transliteration · "English gloss"
- Definition: literal meaning, usage range
- Insight paragraph: explain specifically why THIS word in THIS verse changes the reader's understanding. Name the word in bold within the paragraph. Connect it to the argument of the passage.

**Only use words where the Greek genuinely adds insight** — don't pad with obvious words. Good candidates: words with a broader semantic range than their English translation, words with cultural/technical meaning, words whose tense/voice/mood matters, words shared with other important passages.

### Analogies in Wow Boxes
Every Deeper Meaning section needs at least one `wow-box` with an analogy, thought experiment, or concrete picture that makes the theology land viscerally. Examples of good analogy targets:
- The iron-in-fire image for theosis (2 Pet 1:4)
- The prisoner walking back into prison for Galatian law-keeping
- The ambassador language for apostolic authority
- The sailor/wind image for inspiration

### Questions with Answers
Questions must be genuinely probing — not "do you believe this?" but questions that create productive tension, expose hidden assumptions, or invite personal application. Answers should be substantive (3–5 sentences), not just restate the question.

### Character Bios
Structure:
- Avatar circle with initials, colored per character type
- Name + role subtitle
- Bio text: background, key life moments relevant to this passage, transformation/legacy
- Key texts line at bottom

## Themes to Tag (use consistently across chapters)

Standard theme chips — use whichever apply per verse card:
- Gospel, Grace, Identity, Authority, Faith, Knowledge, Calling, Scripture, Virtue, Transformation, False Teaching, Unity, Suffering, Hope, Prayer, Love, Wisdom

## Slash Command Workflow — ALWAYS follow this when triggered

When this skill is triggered (by `/bible-commentary` or any Bible study request), follow these steps **in order** before building anything:

### Step 1 — Ask for the Book (selection menu)

Use the `ask_user_input_v0` tool to present a book selection menu. Show books grouped by type. Use multi-select: false. Example question:

> "Which book of the Bible?"

Options should cover all 66 books grouped logically. Offer at minimum:
- Old Testament: Genesis, Exodus, Psalms, Proverbs, Isaiah, Jeremiah, Ezekiel, Daniel, and other major books
- Gospels: Matthew, Mark, Luke, John
- Acts
- Paul's Letters: Romans, 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, 2 Thessalonians, 1 Timothy, 2 Timothy, Titus, Philemon
- General Letters: Hebrews, James, 1 Peter, 2 Peter, 1 John, 2 John, 3 John, Jude
- Revelation

Because `ask_user_input_v0` only supports up to 4 options per question, split into multiple questions if needed — e.g.:

**Question 1:** "Which section of the Bible?"
Options: Old Testament | Gospels & Acts | Paul's Letters | General Letters & Revelation

**Question 2 (based on answer):** "Which book?" — show only books from that section (4 at a time, or ask them to type if section has many books)

Adapt based on what's practical. The goal is a smooth 2-question flow: section → book.

### Step 2 — Ask for the Chapter

Once the book is selected, ask:

> "Which chapter of [Book Name]?"

Use `ask_user_input_v0` with numbered options for the chapters that exist in that book (e.g., Galatians has 6 chapters, show 1–6). If the book has more than 4 chapters, show them in groups or ask the user to type the number.

### Step 3 — Check if Already Built

After getting book + chapter, derive the filename:
- Normalize: lowercase, no spaces, no punctuation in book name
- Examples: `galatians2.html`, `1cor1.html`, `2peter1.html`, `romans8.html`, `john3.html`
- Check if the file already exists at `/mnt/user-data/outputs/[filename]`

**If the file EXISTS:**
- Tell the user: "I already have [Book] [Chapter] built — here it is!" 
- Present it immediately with `present_files`
- Do NOT rebuild it unless user explicitly asks

**If the file does NOT exist:**
- Tell the user you're building it now
- Proceed to build the full HTML file (see Content Build Workflow below)
- Save to `/mnt/user-data/outputs/[filename]`
- Present with `present_files`
- Also update `/home/claude/bible-commentary/references/completed-chapters.md` to log the new chapter

### Content Build Workflow (only when file doesn't exist)

1. Divide the chapter into 4–6 natural verse groupings
2. For each grouping, produce all 8 content sections (tabs)
3. Identify 2–4 Greek words with genuine payoff across the whole chapter
4. Identify named people who need bios
5. Assign themes to each verse card
6. Build the complete HTML file following the Design System below
7. Save to `/mnt/user-data/outputs/[filename]`
8. Present with `present_files`

## File Naming Convention
`[book][chapter].html` — all lowercase, no spaces  
Examples: `1cor1.html`, `galatians1.html`, `2peter1.html`, `romans8.html`, `john3.html`

## Accuracy Standards

- Never invent Greek words or definitions — only use words actually in the passage
- Cross-references must be genuinely relevant, not just thematically adjacent
- Historical/cultural claims must be accurate (Roman crucifixion shame, Corinthian rhetoric culture, etc.)
- When making an inference (e.g., "Paul was likely responding to an accusation"), flag it as inference — "the text implies" or "scholars suggest" — not as stated fact
- Character bios: distinguish what Scripture says from what tradition says

## Reference Files

See `references/completed-chapters.md` for the full HTML template and list of already-completed chapters to avoid duplication.
