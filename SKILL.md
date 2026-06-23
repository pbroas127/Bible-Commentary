---
name: bible-commentary
description: >
  Use this skill whenever a user asks for Bible study, verse commentary, Scripture breakdown, or chapter analysis. Triggers include: "do [book] [chapter]", "commentary on [passage]", "break down [verse]", "study [book]", "what does [passage] mean", "explain [Bible chapter]", "give me commentary on", "Bible study on", "verse by verse", or any request to study, explain, or explore a specific Bible passage. Also trigger when the user asks to add a new chapter to an existing Bible study file, or requests Greek/Hebrew word breakdowns, character bios, cross-references, or theme tags for a Bible passage. This skill produces polished, mobile-optimized HTML files downloadable to phone — not just inline text. Always use this skill for ANY Bible passage study request, even casual ones like "what about Galatians 1" or "do 2 Peter next."
backends:
  - Claude (local)
  - GitHub Copilot (VS Code)
  - Azure Foundry (cloud)
---

# Bible Commentary Skill

**Runs on:** Claude (local) | GitHub Copilot (VS Code) | Azure Foundry (cloud)

Generates rich, mobile-optimized HTML Bible study files through a two-step process:
1. **Generate structured commentary data** (JSON) containing verse analysis, Greek words, questions, cross-references, themes
2. **Hydrate into HTML** using the standalone `lib/html-generator` library

The library handles all visual design, interactivity, and mobile optimization. Your job is to focus on **content quality** — the structured data that drives the HTML.

This skill works identically on Claude, GitHub Copilot, and Foundry. The data structure standards below apply to all three backends.

## Data Structure Standard

Generate commentary as structured data conforming to the `ChapterCommentary` interface (see `lib/types.ts`).

### Chapter-Level Metadata

```typescript
{
  book: "Galatians",           // Book name
  chapter: 1,                  // Chapter number
  bookType: "pauline",         // pauline | peter | gospel | acts | hebrews | james | jude | revelation | wisdom | prophets
  overview: "Paul opens...",   // 1-2 paragraph context for the entire chapter
  keyVerse: "Gal 1:6",         // Verse quote to highlight in the hero section
  translation: "ESV",          // Bible translation used (optional, defaults to ESV)
  generatedAt?: Date,          // ISO timestamp
  generatedBy?: string,        // e.g., "Claude 3.5 Sonnet"
}
```

### Verse-Level Content

Every verse must include these fields:

```typescript
{
  verse: "1",                  // "1", "2:1-3", etc.
  text: "Paul, an apostle...", // The actual verse text
  commentary: string,          // Context: what's happening, who's writing, what's the argument
  deeperMeaning: string,       // Symbolic/theological meaning; theology beneath the surface
  wowBox: string,              // Vivid analogy or thought experiment (optional but strongly encouraged)
  greekWords: [
    {
      word: "δοῦλος",          // Greek characters
      transliteration: "doulos",
      gloss: "slave",          // One-word English equivalent
      definition: "...",       // Full definition and usage range
      insight: "Why **this** word in **this** verse changes how you read it. Name the word in bold."
    }
  ],
  coolPoints: [                // Array of 3-5 surprising details or rhetorical moves
    "Paul uses the plural 'apostles' to...",
    "The word 'wonder' echoes Isaiah..."
  ],
  lesson: "string",            // One clear, practical takeaway (1-2 sentences)
  questions: [
    {
      question: "How does...",
      answer: "Substantive 3-5 sentence answer, not a restatement"
    }
  ],
  crossReferences: [
    {
      passage: "Romans 1:1",
      explanation: "Connects because Paul uses identical authority language..."
    }
  ],
  people: [                    // Optional: only include named people relevant to this passage
    {
      name: "Peter",
      role: "Apostle",
      background: "...",
      relationshipToPassage: "Peter is mentioned here because...",
      legacy: "...",
      characterType: "apostle"
    }
  ],
  themes: [
    "Authority",
    "Gospel",
    "Calling"
  ]
}
```

## Content Quality Standards

### Greek Word Selection
- **Quality over quantity** — choose 2–4 words per verse maximum
- **Genuine semantic payoff only** — words where the Greek genuinely adds insight that English translation misses
- Good candidates:
  - Words with broader semantic range than their English gloss
  - Words with cultural or technical meaning
  - Words whose tense/voice/mood matters for the argument
  - Words shared across important passages
- Bad candidates:
  - Common prepositions or articles
  - Obvious synonyms for the English gloss
  - Padding to reach a minimum count

### Wow-Box Analogies
Structure: analogy, thought experiment, or concrete picture that makes the theology land viscerally.

Examples of good targets:
- The iron-in-fire image for theosis (2 Pet 1:4)
- The prisoner walking back into prison for law-keeping (Gal 3)
- The ambassador language for apostolic authority
- The sailor/wind image for inspiration

The analogy should be:
- ✅ Vivid and concrete (not abstract)
- ✅ Something the reader has experienced or can imagine
- ✅ Surprising enough to create a "wow" moment
- ✅ Directly connected to the theological point

### Questions with Answers
Structure: **Substantive reflection questions** (not surface agreement).

Requirements:
- ✅ Probe assumptions, expose tensions, invite application
- ✅ Create productive discomfort or curiosity
- ✅ NOT "Do you believe this?" or "Did you know...?"
- ✅ Answers: 3–5 full sentences with reasoning, not restatements

Example:
```
❌ Bad: "What does it mean to have faith?"
       Answer: "Faith means to have faith."

✅ Good: "How does Paul's claim of apostolic authority challenge your view of who gets to define orthodoxy?"
       Answer: "Paul grounds his authority not in Jerusalem's approval but in his direct encounter with Christ (Gal 1:11-12). This suggests that spiritual authenticity comes through personal transformation, not institutional validation. For modern readers, this raises hard questions: Who decides what's true in your faith community? Can the Spirit move outside official structures? Paul's answer implicitly says yes."
```

### Character Bios
Include only when the person is **named in the passage** and **relevant to understanding it**.

Fields:
- Name + role (e.g., "Peter, Apostle")
- Background (who they are, key life moments)
- Relationship to this passage (why they appear here, what their presence means)
- Key texts (if applicable)
- Legacy (if relevant)

Avoid:
- Lengthy biographies of ancillary figures
- Information not connected to the passage
- Speculation beyond Scripture

### Cross-Reference Quality
Structure: passage + **explanation of why it connects**.

Requirements:
- ✅ 3–5 references per verse
- ✅ Explain the connection, don't just cite
- ✅ Show thematic, linguistic, or theological links
- ✅ Prioritize earlier/parallel texts over commentary-generated connections

Example:
```
✅ Good: "Romans 6:1-10 — Paul uses similar 'dying with Christ' language and asks the same question: if grace abounds, why not sin? Both passages ground ethical living in union with Christ rather than law."

❌ Bad: "See also Romans 6:1-10"
```

## Theme Tags (Use Consistently)

Apply 2–4 theme tags per verse. Use from this standardized list:

- **Gospel** — core gospel message, cross/resurrection
- **Grace** — unmerited favor, free gift
- **Identity** — who we are in Christ, status change
- **Authority** — power, rule, jurisdiction
- **Faith** — trust, belief, confidence
- **Knowledge** — understanding, revelation, knowing God
- **Calling** — vocation, purpose, election
- **Scripture** — references, fulfillment, Word
- **Virtue** — character qualities, fruits of Spirit
- **Transformation** — change, sanctification, new creation
- **False Teaching** — error, heresy, deception
- **Unity** — togetherness, oneness, reconciliation
- **Suffering** — hardship, persecution, affliction
- **Hope** — confidence in future, assurance
- **Prayer** — petition, intercession, communion
- **Love** — agape, self-giving, commitment
- **Wisdom** — discernment, prudence, insight

Example:
```typescript
verses: [
  {
    verse: "1",
    // ...
    themes: ["Authority", "Gospel", "Calling"]  // 3 tags for this verse
  },
  {
    verse: "2",
    // ...
    themes: ["Identity", "Grace"]  // 2 tags for this verse
  }
]
```

---

## HTML Output (Automated)

The `lib/html-generator` library handles all visual presentation:

✅ **Design System** — Color schemes per book type  
✅ **CSS Variables** — Theme colors, typography, spacing  
✅ **Responsive Layout** — Mobile-first, dark theme  
✅ **Interactive UI** — Tabs, accordions, filters  
✅ **Google Fonts** — Serif (Playfair Display / Lora) + Sans (DM Sans / Inter)  

When you generate structured commentary data, the library automatically:
1. Detects book type → applies correct accent color
2. Renders verse cards with 8 tabbed sections
3. Makes questions expandable
4. Adds theme filter chips
5. Embeds sticky navigation
6. Outputs self-contained HTML (no external dependencies)

See `lib/design-system.ts` for color mappings and CSS specifications.

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
