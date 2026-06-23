---
description: "Generate a comprehensive Bible commentary for a single chapter with verse-by-verse analysis"
agent: Bible Commentary Agent
argument-hint: "book=... chapter=... [endChapter=...] [theme=...]"
---

# Generate Bible Commentary

Creates a polished, downloadable HTML Bible study file for any Bible chapter with full verse-by-verse analysis, Greek/Hebrew word breakdowns, character bios, and reflection questions.

## Inputs

* `${input:book}`: (Required) Bible book name (e.g., Galatians, 2 Peter, Romans, Psalms)
* `${input:chapter}`: (Required) Chapter number to study
* `${input:endChapter:}`: (Optional) If provided, generate a range (e.g., chapter 1-3)
* `${input:theme:}`: (Optional) Focus on a specific theme (Gospel, Grace, Identity, etc.) if provided

## Requirements

1. Check `references/completed-chapters.md` first — do not regenerate already-completed chapters without user consent
2. Generate commentary covering all 8 required sections for every verse:
   - Commentary (context, argument, authorship)
   - Deeper Meaning (theology, symbolism, wow-box analogy)
   - Greek Words (2–4 words with transliteration, definition, insight)
   - Cool Points (surprising details, rhetorical moves)
   - Lesson (one actionable takeaway)
   - Questions (4 reflection questions with answers)
   - Cross-References (3–5 with explanations)
   - People (bio cards for named individuals, if present)
3. Apply the correct color scheme from `SKILL.md` based on book type
4. Ensure Greek words chosen genuinely add semantic insight, not padding
5. Ensure analogy in Deeper Meaning section is vivid and thought-provoking
6. Ensure reflection questions probe assumptions and create productive tension
7. Update `references/completed-chapters.md` upon completion with book, chapter, date generated, accent color used
8. Return downloadable `.html` file and preview link

## Output Format

- **File**: `{Book}-{Chapter}.html` (e.g., `Galatians-1.html`)
- **Mobile-optimized** dark theme with themed accent colors
- **Tabbed verse cards** with expandable sections
- **Sticky nav** with verse-range pills
- **Theme filter chips** at top
- **Footer** with metadata and Scripture source attribution
