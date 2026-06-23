# Backend Switch Reference

Quick lookup for switching between Claude, GitHub Copilot, and Azure Foundry.

## Setup Checklist

### ✅ Claude (Local)

- [ ] Copy skill to `~/.copilot/skills/bible-commentary-skill/`
- [ ] Set `OPENAI_API_KEY` env var (if using OpenAI API directly)
- [ ] Open Claude and test: `"Do Galatians 1"`
- [ ] Check output folder for `Galatians-1.html`

### ✅ GitHub Copilot (VS Code)

- [ ] Install GitHub Copilot extension in VS Code
- [ ] Sign in with GitHub account
- [ ] Copy skill to `~/.copilot/skills/bible-commentary-skill/`
- [ ] Reload VS Code
- [ ] Open Copilot Chat (Ctrl+Shift+I)
- [ ] Test: `"Generate Galatians 1"`
- [ ] Check workspace folder for `Galatians-1.html`

### ✅ Azure Foundry (Cloud)

- [ ] Install `azd` CLI
- [ ] Azure subscription with Foundry enabled
- [ ] Run `azd init -t foundry-agent-template`
- [ ] Copy Bible Commentary files to `./agents/bible-commentary/`
- [ ] Run `azd provision` (creates resources)
- [ ] Run `azd deploy` (deploys agent)
- [ ] Get API endpoint from deployment output
- [ ] Test with `curl` command (see below)

---

## Invocation Commands

### Claude

```bash
# Interactive (ask Claude directly)
"Generate a commentary for Galatians 1"
"Do Ephesians 2"
"Break down 2 Peter 3:1-10"

# Output: {Book}-{Chapter}.html in current folder
```

### GitHub Copilot (VS Code)

```bash
# In Copilot Chat (Ctrl+Shift+I)
"@bible-commentary Generate Galatians 1"

# Or just ask naturally (auto-triggers)
"Do Ephesians 2"
"Break down 2 Peter 3"
"Verse by verse study of Romans 8"

# Output: {Book}-{Chapter}.html in workspace folder
```

### Foundry

```bash
# REST API
curl -X POST https://your-api.../api/v1/commentaries \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akey-xxxxxxxxxxxx" \
  -d '{
    "book": "Galatians",
    "chapter": 1
  }'

# Output: JSON response with HTML URL
{
  "id": "comm_abc123",
  "status": "completed",
  "htmlUrl": "https://storage.../Galatians-1.html"
}
```

---

## File Differences

| File | Claude | Copilot | Foundry | Changes? |
|------|--------|---------|---------|----------|
| `SKILL.md` | ✓ (data standards) | ✓ (data standards) | ✓ (data standards) | No |
| `bible-commentary.agent.md` | ✓ (phases) | ✓ (phases) | ✓ (phases) | No |
| `lib/` (html-generator) | ✓ (renders HTML) | ✓ (renders HTML) | ✓ (renders HTML) | No |
| `agent.yaml` | ✗ | ✗ | ✓ (Foundry config) | Foundry only |
| `references/completed-chapters.md` | ✓ (local log) | ✓ (local log) | ✓ (shared log) | Both local use |

**Key insight**: The core agent logic is identical. Only deployment differs.

---

## Environment Setup

### Claude
```bash
# .env (optional)
OPENAI_API_KEY=sk-...
```

### Foundry
```bash
# .env (required)
AZURE_ENV_NAME=bible-study-dev
AZURE_LOCATION=eastus
AZURE_SUBSCRIPTION_ID=...

# Choose one model backend:
# Option A: Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=akey-...

# Option B: OpenAI API
OPENAI_API_KEY=sk-...

# Storage
AZURE_STORAGE_ACCOUNT_NAME=youraccount
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpoints=...
```

---

## Model Selection

### Claude Path

Model is **managed by Claude/Copilot**, typically:
- GPT-4 (default)
- GPT-3.5-Turbo (faster)
- Claude 3.5 Sonnet (if integrated)

No configuration needed.

### Foundry Path

Edit `agent.yaml` to choose:

```yaml
agent:
  model: gpt-4                    # or gpt-35-turbo
  temperature: 0.7               # Lower = more deterministic
  maxTokens: 8000                # Limit response size
```

Then redeploy:
```bash
azd deploy
```

---

## Cost

### Claude
```
~$0.03 per commentary
(cost depends on OpenAI API pricing)
```

### GitHub Copilot
```
$10-20/month Copilot subscription
(unlimited commentaries)
```

### Foundry
```
Base: $10-15/month (Azure resources)
+ $0.03 per API call (model cost)
+ ~$1/month (storage)

Total: ~$14-18/month + usage
```

**Best value**: GitHub Copilot if you already have subscription; Claude for free; Foundry at scale (1000+ commentaries/month).

---

## Response Time

### Claude
**Instant** (2-10 seconds, depends on Claude load)

### GitHub Copilot
**Instant** (2-10 seconds, depends on Copilot API load)

### Foundry
**2-5 seconds** (API + cold start on first call, then faster)

---

## Scaling

### Claude
- Single user
- Limited by your API key rate limits
- Good for: personal projects, development

### GitHub Copilot
- Single developer per VS Code instance
- Great for: integrated VS Code workflow
- Can be shared with team via saved HTML files

### Foundry
- Multi-user / REST API
- Auto-scales to 1000s of concurrent requests
- Can handle enterprise workloads
- Good for: production, team access, integrations

---

## Monitoring & Logs

### Claude
```bash
# Check local output
ls -la *.html

# View last generation log
cat references/completed-chapters.md
```

### GitHub Copilot
```bash
# Check workspace output
ls -la *.html

# View generation log
cat references/completed-chapters.md

# View Copilot Chat history
# (In VS Code, check Chat panel)
```

### Foundry
```bash
# View deployment logs
azd deploy --debug

# Live logs
az webapp log tail -n your-app -g your-rg

# Application Insights dashboard
https://portal.azure.com
  → Application Insights → Search → Traces

# REST API response
curl ... | jq '.id'  # Get request ID
# Then search request ID in Application Insights
```

---

## Data Storage

### Claude
```
Local file system
└── {Book}-{Chapter}.html
```

Location: wherever you ran the agent

### GitHub Copilot
```
VS Code workspace folder
└── {Book}-{Chapter}.html
```

Location: your VS Code workspace root

### Foundry
```
Azure Blob Storage
├── {Book}-{Chapter}.html
└── {Book}-{Chapter}-logs.json
```

Access:
```bash
# List all commentaries
az storage blob list -c $CONTAINER --connection-string $CONN_STR

# Download
az storage blob download -c $CONTAINER -n Galatians-1.html \
  --connection-string $CONN_STR
```

---

## Switching Workflows

### Use Claude While Developing

```bash
# Update content quality guidelines
vim SKILL.md

# Test immediately with Claude
"Generate Galatians 1"

# View output
open Galatians-1.html

# Iterate quickly
```

### Switch to Foundry for Production

```bash
# Once happy with output quality
# Deploy to Foundry
azd deploy

# Test via API
curl -X POST https://your-api.../api/v1/commentaries \
  -H "X-API-Key: akey-..." \
  -d '{"book":"Galatians","chapter":"1"}'

# Monitor in dashboard
https://foundry-dashboard.microsoft.com
```

### Use Both Simultaneously

```bash
# Developers use Claude for development
~/.copilot/skills/bible-commentary-skill/

# Production system uses Foundry API
https://your-api.../api/v1/commentaries

# Both share same lib/ and SKILL.md
# Ensures consistent output
```

---

## Troubleshooting by Path

### Claude Not Working
```bash
# Check skill is installed
ls ~/.copilot/skills/bible-commentary-skill/

# Verify Copilot recognizes it
# (Search "Bible" in Copilot skills)

# Test with simple request
"Do Genesis 1"

# Check for errors in Claude UI
```

### GitHub Copilot Not Working
```bash
# Check GitHub Copilot extension installed
code --list-extensions | grep -i copilot

# Verify skill is installed
ls ~/.copilot/skills/bible-commentary-skill/

# Check GitHub account is authenticated
# (Look for GitHub icon in VS Code)

# Reload VS Code
# Ctrl+Shift+P → Developer: Reload Window

# Test in Copilot Chat
"Do Genesis 1"
```

### Foundry Not Working
```bash
# Check deployment status
azd up --debug

# View logs
az webapp log tail -n your-app -g your-rg

# Check API key
azd env list

# Test endpoint
curl -v https://your-api.../api/v1/commentaries \
  -H "X-API-Key: $(azd env get-values | grep API_KEY)"
```

---

## See Also

- [QUICK_START.md](QUICK_START.md) — 3-15 min setup
- [DUAL_BACKEND_SETUP.md](DUAL_BACKEND_SETUP.md) — Full setup with cost comparison
- [FOUNDRY_DEPLOYMENT.md](FOUNDRY_DEPLOYMENT.md) — Detailed Foundry steps
- [SKILL.md](SKILL.md) — Content standards (same for both)
