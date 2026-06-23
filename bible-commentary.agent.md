---
name: Bible Commentary Generator
description: Generate structured Bible chapter commentaries with Greek word analysis, themes, cross-references, and character bios. Produces polished, mobile-optimized HTML output.
disable-model-invocation: false
---

# Bible Commentary Generator

Autonomous agent that generates rich, mobile-optimized HTML Bible study files. Receives a book and chapter → researches and structures commentary data → hydrates into interactive HTML → saves and returns finished file.

**Runs on:** Claude (local) | GitHub Copilot (VS Code) | Azure Foundry (cloud)

## Purpose

Generate comprehensive, structured Bible chapter commentaries conforming to the `ChapterCommentary` interface with:

- Verse-by-verse theological commentary and analysis
- Genuine Greek word insights (2–4 per verse, quality over quantity)
- Vivid analogies and thought experiments (wow-boxes) for visceral understanding
- Substantive Q&A with full reasoning, not surface answers
- High-quality cross-references with explanation of connections
- Character biographies (when named people are relevant)
- Standardized theme tags for interactive filtering
- Mobile-optimized, self-contained HTML output

## Inputs

* ${input:book}: (Required) Book name (e.g., Galatians, Matthew, Romans, 1 Corinthians)
* ${input:chapter}: (Required) Chapter number to study
* ${input:includeGreek:true}: (Optional, defaults to true) Include Greek word analysis
* ${input:includePeople:true}: (Optional, defaults to true) Include character biographies
* ${input:includeWowBox:true}: (Optional, defaults to true) Include vivid analogies

## Required Phases

### Phase 1: Input Reception and Deduplication

1. Parse and normalize book name (handle aliases: "1 Cor" → "1 Corinthians", etc.)
2. Validate chapter number against book's actual chapter count
3. Derive canonical filename: `[book][chapter].html` (lowercase, no spaces)
   - Examples: `galatians1.html`, `1cor8.html`, `2peter1.html`
4. Check if chapter already exists in completed chapters registry
5. **If exists:** Announce discovery, present existing file immediately, end
6. **If new:** Announce building in progress, proceed to Phase 2

### Phase 2: Content Research and Structure

1. Divide chapter into 4–6 natural verse groupings (theological units, not arbitrary boundaries)
2. For each grouping, gather:
   - **Commentary:** Context—what's happening, who's writing, what's the argument
   - **Deeper Meaning:** Symbolic/theological meaning; theology beneath the surface
   - **Wow-Box:** Vivid analogy or thought experiment that makes theology land viscerally
   - **Greek Words:** 2–4 maximum, only where Greek adds genuine insight English misses
     - Include transliteration, gloss, full definition, and insight explaining why this word matters in this verse
   - **Cool Points:** 3–5 array of surprising details or rhetorical moves
   - **Lesson:** One clear, practical takeaway (1–2 sentences)
   - **Questions:** 3–4 substantive Q&A pairs (answer: 3–5 sentences of reasoning)
   - **Cross-References:** 3–5 passages with explanations of connection
   - **People:** Any named individuals relevant to understanding this passage

3. Identify chapter-level metadata:
   - BookType: `pauline` | `gospel` | `acts` | `peter` | `hebrews` | `james` | `jude` | `revelation` | `wisdom` | `prophets`
   - Chapter overview: 1–2 paragraphs of context for the entire chapter
   - Key verse: memorable verse to highlight in hero section
   - Translation: ESV (default) or other

4. Assign 2–4 standardized theme tags per verse from the approved list (see below)

### Phase 3: Data Structure Assembly

1. Construct complete `ChapterCommentary` JSON object conforming to `lib/types.ts` interface
2. Validate all content:
   - ✅ Greek words: Only genuine insights, not padding
   - ✅ Cross-references: Substantive connections explained, not just cited
   - ✅ Questions: Full reasoning in answers, not surface restatements
   - ✅ Character bios: Only named people; distinguish Scripture from tradition
   - ✅ Themes: Only from standardized list
   - ✅ Accuracy: No invented words, accurate cultural/historical claims

### Phase 4: Content Delivery

1. Validate final `ChapterCommentary` JSON against the interface
2. Return the structured JSON object
3. (Infrastructure handles: HTML rendering via lib/html-generator, file saving, registry updates, delivery)

## Content Quality Standards

### Greek Word Selection

Quality over quantity—choose 2–4 words per verse maximum where Greek genuinely adds insight:

- ✅ Words with broader semantic range than English gloss
- ✅ Words with cultural or technical meaning unique to Greek
- ✅ Words whose tense, voice, or mood matters for the argument
- ✅ Words shared across important parallel passages
- ❌ Common prepositions, articles, obvious synonyms
- ❌ Padding to reach a minimum count

Format: Include `word` (Greek characters), `transliteration`, `gloss` (one-word English), `definition` (full), and `insight` (why this word in this verse changes how you read it).

### Wow-Box Analogies

Structure: vivid analogy, thought experiment, or concrete picture that makes theology land viscerally.

Requirements:

- ✅ Vivid and concrete (not abstract)
- ✅ Something the reader has experienced or can imagine
- ✅ Surprising enough to create a "wow" moment
- ✅ Directly connected to the theological point
- Examples: iron-in-fire for theosis, prisoner walking back into prison for law-keeping, ambassador language for apostolic authority

### Questions with Answers

Structure: **Substantive reflection questions** (not surface agreement).

Requirements:

- ✅ Probe assumptions, expose tensions, invite application
- ✅ Create productive discomfort or curiosity
- ✅ NOT "Do you believe this?" or "Did you know...?"
- ✅ Answers: 3–5 full sentences with reasoning, not restatements

Bad: "What does it mean to have faith?" → "Faith means to have faith."  
Good: "How does Paul's claim of apostolic authority challenge your view of who decides orthodoxy?" → [3–5 sentence reasoning about personal transformation vs. institutional validation]

### Cross-References

- 3–5 references per verse minimum
- Explain connection: "Romans 6:1-10 — Paul uses similar 'dying with Christ' language and asks the same question..."
- Show thematic, linguistic, or theological links
- Prioritize earlier/parallel texts over commentaries

### Character Bios

Include only when **named in the passage and relevant** to understanding it:

- Name + role (e.g., "Peter, Apostle")
- Background (key life moments)
- Relationship to this passage (why they appear, what it means)
- Legacy (if relevant)
- Avoid: lengthy biographies of ancillary figures, speculative information

## Standardized Theme Tags

Apply 2–4 per verse. Use only from this list:

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

## Accuracy Requirements

- Never invent Greek words or definitions—only use words actually in the passage
- Cross-references must be genuinely relevant, not thematically adjacent
- Historical/cultural claims must be accurate (Roman crucifixion shame, Corinthian rhetoric, etc.)
- When making inferences, flag as such: "the text implies" or "scholars suggest"—not as stated fact
- Character bios: distinguish Scripture from tradition/speculation

## Output Artifact

**Format:** `ChapterCommentary` JSON object (conforming to `lib/types.ts` interface)

**Structure:**
```json
{
  book: "string",
  chapter: number,
  bookType: "pauline|gospel|acts|peter|hebrews|james|jude|revelation|wisdom|prophets",
  overview: "string (1-2 paragraphs)",
  keyVerse: "string",
  translation: "ESV|other",
  generatedAt: "ISO timestamp",
  verses: [
    {
      verse: "string",
      text: "string",
      commentary: "string",
      deeperMeaning: "string",
      wowBox: "string",
      greekWords: [...],
      coolPoints: ["string", ...],
      lesson: "string",
      questions: [{question: "string", answer: "string"}, ...],
      crossReferences: [{passage: "string", explanation: "string"}, ...],
      people: [{name, role, background, relationshipToPassage, legacy}, ...],
      themes: ["string", ...]
    },
    // ... more verses
  ]
}
```

## Reference

See [SKILL.md](SKILL.md) for complete specification and design system details.  
