# Bible Commentary Skill

Generates rich, mobile-optimized HTML Bible study files via a **two-stage architecture**:

1. **Content Generation** — Structured commentary data (JSON) with verse analysis, Greek words, questions, cross-references
2. **HTML Hydration** — Standalone `lib/html-generator` library converts data → mobile-optimized HTML

This separation lets the HTML generator be reused across platforms (CLI, API, mobile app, web).

**Runs on:** Claude (local) | GitHub Copilot (VS Code) | Azure Foundry (cloud)

---

## 📖 Quick Navigation

👉 **Get started:** [QUICK_START.md](QUICK_START.md) — Choose Claude, Copilot, or Foundry (3-15 min)  
👉 **Deployment:** [docs/deployment/](docs/deployment/) — Foundry setup, multi-backend hybrid setup, backend switching  
👉 **Architecture:** [docs/architecture/](docs/architecture/) — Project structure, refactoring history, design decisions  

## Core Files

- `SKILL.md` — Content generation standards (what data to produce)
- `bible-commentary.agent.md` — Foundry agent protocol
- `bible-commentary-chapter.prompt.md` — One-shot prompt for single chapter
- `agent.yaml` — Foundry deployment config
- `lib/` — Standalone HTML generator library
  - `types.ts` — TypeScript data structure definitions
  - `html-generator.ts` — Core renderer (data → HTML)
  - `design-system.ts` — Color themes, CSS, typography
  - `index.ts` — Public API exports
- `references/completed-chapters.md` — Completion log

## 🏗️ Architecture

```
User Request (e.g., "Galatians 1")
    ↓
[Agent] Input validation → Claude generates structured data
    ↓
[lib/html-generator] Converts ChapterCommentary → HTML
    ↓
[Output] {Book}-{Chapter}.html
```

**Key benefit**: The `lib/` folder is a **standalone, reusable library** that can be used in:
- ✅ Foundry agents
- ✅ Node.js/Express APIs
- ✅ React/Next.js web apps
- ✅ React Native mobile apps
- ✅ CLI tools
- ✅ Static site generators

## 🚀 Deployment Options

### Option 1: Use with Claude / Copilot (Local)

**Fastest, free, best for development**

```bash
cp -r bible-commentary-skill ~/.copilot/skills/
# Then ask Claude or Copilot: "Generate a commentary for Romans 8"
```

See [QUICK_START.md](QUICK_START.md) — 3 minute setup.

### Option 2: Use with GitHub Copilot in VS Code (Local)

**Integrated workflow, free (with subscription), VS Code native**

```bash
# 1. Install GitHub Copilot extension
code --install-extension GitHub.Copilot

# 2. Copy skill
cp -r bible-commentary-skill ~/.copilot/skills/

# 3. Open Copilot Chat (Ctrl+Shift+I) and ask:
# "@bible-commentary Generate Galatians 1"
# OR just: "Do Romans 8"
```

See [QUICK_START.md](QUICK_START.md) — 3 minute setup.

### Option 3: Deploy to Azure Foundry (Cloud)

**Scalable, REST API, best for production**

```bash
azd init -t foundry-agent-template
cp -r bible-commentary-skill/* ./agents/bible-commentary/
azd provision && azd deploy
```

See [FOUNDRY_DEPLOYMENT.md](FOUNDRY_DEPLOYMENT.md) — detailed 15 minute setup.

### Option 4: Use Library in Your Own Project

Extract `lib/` as a reusable package:

```bash
# Copy lib/ to your project
cp -r lib/ your-project/lib/bible-commentary-generator/

# Or publish to npm as public package
npm publish
```

Then import and use:

```typescript
import { generateCommentaryHTML } from '@bible-commentary-generator'
import type { ChapterCommentary } from '@bible-commentary-generator'

// Somewhere, you have structured commentary data from Claude:
const data: ChapterCommentary = { 
  book: 'Galatians',
  chapter: 1,
  bookType: 'pauline',
  overview: '...',
  keyVerse: '...',
  verses: [...]
}

// Convert to HTML
const html = generateCommentaryHTML(data)

// Write or return
fs.writeFileSync('Galatians-1.html', html)
```

See [LIB_DEVELOPER_GUIDE.md](LIB_DEVELOPER_GUIDE.md) — how to use the HTML generator library.

### Option 5: Run All Three Simultaneously (Hybrid)

Use **Claude or Copilot locally for development** + **Foundry API for production**:

```bash
# Developers use local skill for quick iteration
~/.copilot/skills/bible-commentary-skill/

# End users hit the production API
https://your-foundry-api.../api/v1/commentaries

# All three share the same lib/ and SKILL.md
# Identical output, different deployment targets
```

See [DUAL_BACKEND_SETUP.md](DUAL_BACKEND_SETUP.md) — how to run all three.

---

## 📊 Backend Comparison

| | Claude | Copilot | Foundry |
|---|---|---|---|
| Setup | 3 min | 3 min | 15 min |
| Cost | $0.03/call | $10-20/mo | $14-18/mo + usage |
| Best for | Dev | Integrated Dev | Production |
| Storage | Local | Local | Azure Blob |

See [BACKEND_SWITCH_REFERENCE.md](BACKEND_SWITCH_REFERENCE.md) for full details.

---

## 📖 Full Documentation

| Guide | Purpose |
|-------|---------|
| [QUICK_START.md](QUICK_START.md) | Choose Claude or Foundry — 3-15 min setup |
| [DUAL_BACKEND_SETUP.md](DUAL_BACKEND_SETUP.md) | Detailed setup for both, cost comparison, hybrid approach |
| [FOUNDRY_DEPLOYMENT.md](FOUNDRY_DEPLOYMENT.md) | Step-by-step Foundry cloud deployment |
| [LIB_DEVELOPER_GUIDE.md](LIB_DEVELOPER_GUIDE.md) | How to use the HTML generator library |
| [SKILL.md](SKILL.md) | Content generation standards (used by both) |
| [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) | Architecture explanation & before/after |

## 🔧 Using with Other AI Systems

The core instructions in `SKILL.md` are platform-agnostic. To use with ChatGPT, Gemini, etc.:

1. Open `SKILL.md` and copy everything **below** the second `---` line
2. Paste into the AI's custom-instructions / system-prompt / knowledge field
3. Optionally attach `references/completed-chapters.md` to track completed chapters

## 🎯 Quick Start

**Generate Galatians 1 commentary:**
```
Prompt: "Generate a Bible commentary for Galatians 1"
```

**Invoke the agent directly (Foundry):**
```bash
curl -X POST https://your-foundry-endpoint/api/v1/commentaries \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"book": "Galatians", "chapter": "1"}'
```

## 📱 Output Format

Every commentary generates a downloadable HTML file with:
- Dark theme optimized for mobile
- Verse-by-verse expandable cards
- Theme filter chips
- Greek/Hebrew word analysis
- Character bios
- Reflection Q&A
- Cross-references
- Sticky navigation

Example output: `Galatians-1.html` (~150 KB, mobile-ready)
