# Bible Commentary Agent — Quick Start

Choose your pathway: **Claude**, **GitHub Copilot**, or **Azure Foundry**

## ⚡ Three Pathways

### Path 1️⃣ : Claude Local (3 minutes)
```bash
# Copy skill to Copilot
cp -r bible-commentary-skill ~/.copilot/skills/

# Ask Claude:
# "Generate a commentary for Romans 8"

# Output: Romans-8.html (instant, free)
```

**Best for**: Development, single studies, zero cost

---

### Path 2️⃣ : GitHub Copilot (3 minutes)
```bash
# Copy skill to VS Code Copilot
cp -r bible-commentary-skill ~/.copilot/skills/

# Or in VS Code directly:
# Open Copilot Chat and ask:
# "@bible-commentary Generate Galatians 1"
# OR just: "Do Galatians 1" (auto-triggers)

# Output: Galatians-1.html (instant, free)
```

**Best for**: Development in VS Code, integrated workflow, zero cost

---

### Path 3️⃣ : Azure Foundry Cloud (15 minutes)
```bash
# Initialize Foundry project
azd init -t foundry-agent-template

# Copy skill files
cp -r bible-commentary-skill/* ./agents/bible-commentary/

# Deploy to Azure
azd provision    # Create resources
azd deploy       # Deploy agent

# Call via REST API
curl -X POST https://your-api.../api/v1/commentaries \
  -H "X-API-Key: your-key" \
  -d '{"book":"Romans","chapter":"8"}'

# Output: https://storage.../Romans-8.html (REST API)
```

**Best for**: Production, batch processing, enterprise scale

---

## 📚 Full Setup Guide

👉 **See [DUAL_BACKEND_SETUP.md](DUAL_BACKEND_SETUP.md)** for detailed instructions on all three backends, cost comparison, and hybrid approaches.

---

## 📋 What Each File Does

| File | Purpose |
|------|---------|
| `SKILL.md` | Complete specification for commentary content + design system |
| `bible-commentary.agent.md` | Agent protocol and phases (for Foundry) |
| `bible-commentary-chapter.prompt.md` | One-shot prompt template |
| `agent.yaml` | Foundry deployment config (models, tools, scaling) |
| `references/completed-chapters.md` | Tracking log to avoid duplicates |

---

## 🔧 Invoke the Agent

### With Claude
```
"Do a commentary on Galatians 1"
"Break down 2 Peter 1:1-11"
"Study the Gospel of Mark, chapter 5"
```

### With Foundry API
```bash
POST /api/v1/commentaries
Content-Type: application/json
X-API-Key: your-key

{
  "book": "Galatians",
  "chapter": "1"
}

# Response
{
  "id": "comm_xyz123",
  "status": "completed",
  "htmlUrl": "https://storage.../Galatians-1.html",
  "completedAt": "2024-06-20T14:32:00Z"
}
```

---

## 📱 Output Format

Every commentary is a downloadable `.html` file with:

✅ **Dark theme** — optimized for phone viewing  
✅ **Expandable verse cards** — tap to see commentary, Greek words, etc.  
✅ **Theme filters** — hide/show cards by topic (Grace, Identity, etc.)  
✅ **Q&A sections** — reflection questions with substantive answers  
✅ **Character bios** — info on people mentioned  
✅ **Cross-references** — related passages explained  
✅ **Mobile-ready** — ~150 KB, no external dependencies  

---

## 🚀 Next: Choose Your Path

**I want a beautiful web dashboard:**  
→ See [Mobile App Guide](./docs/mobile-app-setup.md)

**I want to improve the commentary quality:**  
→ Edit `SKILL.md` to adjust the design system or content specs

**I want to scale this to thousands of chapters:**  
→ See [Foundry Deployment Guide](./FOUNDRY_DEPLOYMENT.md)

**I want to build a mobile app:**  
→ Extract the HTML generator as an npm library

---

## ❓ Common Questions

**Q: Can I customize the colors?**  
A: Yes. Edit the `--accent` color in the CSS variables section of the generated HTML, or modify `SKILL.md` to change the book-type color mapping before generation.

**Q: How long does one commentary take to generate?**  
A: ~2-5 minutes per chapter depending on chapter length and API response time.

**Q: Can I batch multiple chapters at once?**  
A: Yes. Extend the agent to accept `chapters: [1, 2, 3]` and generate a series.

**Q: What if a chapter is already generated?**  
A: The agent checks `references/completed-chapters.md` and offers to extend it or create a summary instead.

**Q: Can I use a different Bible translation?**  
A: Yes. Modify the `scripture-lookup` tool in `agent.yaml` to point to a different API (e.g., Bible.com, bibleapi.com, etc.).

---

## 📞 Support

- 🐛 **Bug?** Check the `references/` folder for known issues
- 📖 **How do I use X?** See `SKILL.md` for full specs
- 🚀 **Deploy to cloud?** Follow [FOUNDRY_DEPLOYMENT.md](./FOUNDRY_DEPLOYMENT.md)
