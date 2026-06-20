# Bible Commentary Skill

Generates rich, mobile-optimized HTML Bible study files — verse-by-verse commentary,
Greek/Hebrew word breakdowns, character bios, theme tags, reflection questions, and
cross-references. Output is a downloadable `.html` file, not inline text.

## Files

- `SKILL.md` — the full instruction set (output standard + design system + HTML/CSS spec)
- `references/completed-chapters.md` — log of chapters already produced

## Using this with Claude

Drop the whole folder into your Claude skills directory (e.g. a user-skills folder).
Claude reads the YAML frontmatter at the top of `SKILL.md` to know when to trigger it.

## Using this with a different AI (ChatGPT, Gemini, etc.)

The YAML frontmatter (the `name:` / `description:` block between the `---` lines at the
top of `SKILL.md`) is an Anthropic/Claude convention used only for auto-triggering. Other
systems don't need it. To port the skill:

1. Open `SKILL.md` and ignore the frontmatter block.
2. Copy everything *below* the second `---` line — that's the actual instructions.
3. Paste it into the other AI's custom-instructions / system-prompt / "knowledge" field
   (e.g. a Custom GPT's Instructions box, or a Gemini Gem's setup).
4. Optionally attach `references/completed-chapters.md` as a knowledge file so it doesn't
   repeat chapters.

The design system and output spec are plain instructions, so they transfer cleanly to any
capable model.
