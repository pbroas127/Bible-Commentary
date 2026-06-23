# Bible Commentary Agent — Backend Setup (All Three)

Run the skill with **Claude**, **GitHub Copilot**, or **Azure Foundry** — choosing based on your needs.

---

## 🎯 Quick Comparison

| Feature | Claude | GitHub Copilot | Azure Foundry |
|---------|--------|---|---|
| **Cost** | Free | Free | Pay-as-you-go ($) |
| **Where** | Local CLI | VS Code | Cloud REST API |
| **Latency** | Instant | Instant | 2-5 seconds |
| **Scale** | Single user | Single user | Enterprise (auto-scale) |
| **Setup Time** | 2 min | 2 min | 15 min |
| **Storage** | Local files | Local files | Azure Blob |
| **Best For** | Dev/testing | Integrated workflow | Production |

---

## 📋 Setup: Path A — Use Claude Locally

### Step 1: Add to Copilot Skills

```bash
# Copy skill to your Copilot skills directory
cp -r bible-commentary-skill ~/.copilot/skills/

# Or on Windows:
xcopy bible-commentary-skill "%APPDATA%\Code\User\Copilot\skills\" /E
```

### Step 2: Invoke

Open Claude/Copilot and ask:

```
"Generate a commentary for Romans 8"
"Do Galatians 1"
"Break down 2 Peter 1:1-10"
```

**Output**: `{Book}-{Chapter}.html` in your project folder

---

## 📋 Setup: Path B — Use GitHub Copilot in VS Code

### Step 1: Install GitHub Copilot Extension

In VS Code:
```
1. Open Extensions (Ctrl+Shift+X)
2. Search "GitHub Copilot"
3. Click Install
4. Sign in with GitHub account
```

Or from command line:
```bash
code --install-extension GitHub.Copilot
```

### Step 2: Add Skill to VS Code Copilot

```bash
# Copy skill to Copilot skills
cp -r bible-commentary-skill ~/.copilot/skills/

# Reload VS Code
```

### Step 3: Invoke in Copilot Chat

Open Copilot Chat (Ctrl+Shift+I) and ask:

```
"@bible-commentary Generate Galatians 1"
```

Or just ask naturally (auto-triggers):
```
"Do Romans 8"
"Commentary on Ephesians 2"
"Break down 2 Peter 3"
```

**Output**: `{Book}-{Chapter}.html` in your workspace

---

## ☁️ Setup: Path C — Deploy to Azure Foundry

### Step 1: Add to Copilot Skills

```bash
# Copy skill to your Copilot skills directory
cp -r bible-commentary-skill ~/.copilot/skills/

# Or on Windows:
xcopy bible-commentary-skill "%APPDATA%\Code\User\Copilot\skills\" /E
```

### Step 2: Invoke

Open Claude/Copilot and ask:

```
"Generate a commentary for Romans 8"
"Do Galatians 1"
"Break down 2 Peter 1:1-10"
```

The agent will:
1. ✓ Validate the passage
2. ✓ Call Claude to generate structured commentary
3. ✓ Use `lib/html-generator` to create HTML
4. ✓ Save `{Book}-{Chapter}.html` locally

### Step 3: Output

Look for the HTML file in your project folder:
```
bible-commentary-skill/
├── Galatians-1.html       ← Download and open in browser
├── Romans-8.html
└── 2 Peter-1.html
```

**No server, no costs, instant output.**

---

## ☁️ Setup: Path C — Deploy to Azure Foundry

### Step 1: Create Foundry Project

```bash
# Create a new directory
mkdir my-bible-foundry
cd my-bible-foundry

# Initialize with Foundry template (using azd)
azd init -t foundry-agent-template
```

If you don't have `azd`, install it:
```bash
# macOS
brew install azure-developer-cli

# Windows (PowerShell)
winget install microsoft.azd

# Linux
curl -fsSL https://aka.ms/install-azd.sh | bash
```

### Step 2: Copy Bible Commentary Files

```bash
# Copy the skill into your Foundry project
cp -r ../bible-commentary-skill/* ./agents/bible-commentary/

# Verify
ls agents/bible-commentary/
# Expected: agent.yaml, SKILL.md, lib/, bible-commentary.agent.md, etc.
```

### Step 3: Configure Azure Environment

```bash
# Set deployment region
azd env set AZURE_LOCATION eastus

# Set environment name
azd env set AZURE_ENV_NAME bible-study-dev

# Configure the model (gpt-4 or gpt-35-turbo)
azd env set AZURE_OPENAI_MODEL gpt-4

# (Optional) Use Azure OpenAI instead of OpenAI API
azd env set AZURE_OPENAI_ENDPOINT "https://your-resource.openai.azure.com/"
azd env set AZURE_OPENAI_API_KEY "your-key-here"
```

Or edit `.env` directly:
```bash
# .env
AZURE_ENV_NAME=bible-study-dev
AZURE_LOCATION=eastus
AZURE_OPENAI_API_KEY=sk-...
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpoints=...
```

### Step 4: Provision Azure Resources

```bash
# Create resource group, storage, API Management, container registry, etc.
azd provision

# This creates:
# - Resource Group (bible-study-dev-rg)
# - Container Registry (for agent image)
# - Storage Account (for HTML outputs)
# - API Management (for REST endpoints)
# - Application Insights (for monitoring)
```

### Step 5: Deploy Agent

```bash
# Build and deploy the agent
azd deploy

# Output:
# ✓ Deploying agent...
# ✓ API endpoint: https://your-api.azurewebsites.net/api/v1/commentaries
# ✓ API Key: akey-xxxxxxxxxxxx
```

### Step 6: Test via REST API

```bash
# Request a commentary
curl -X POST https://your-api.azurewebsites.net/api/v1/commentaries \
  -H "Content-Type: application/json" \
  -H "X-API-Key: akey-xxxxxxxxxxxx" \
  -d '{
    "book": "Galatians",
    "chapter": 1
  }'

# Response:
{
  "id": "comm_abc123",
  "status": "completed",
  "htmlUrl": "https://storage.../Galatians-1.html",
  "completedAt": "2024-06-20T14:32:00Z",
  "contentLength": 156284
}
```

### Step 7: Access the Web UI

Foundry provides a hosted dashboard:

```
https://foundry-dashboard.microsoft.com/agents/bible-study-dev
```

From here you can:
- ✓ Invoke the agent manually
- ✓ Monitor execution logs
- ✓ View cost and usage stats
- ✓ Manage API keys

---

## 🔄 Switching Between Backends

### Use Claude for Quick Testing

```bash
# No setup needed, just ask
"Generate Galatians 1"
```

### Use GitHub Copilot for Integrated Workflow

```bash
# In VS Code Copilot Chat
"@bible-commentary Do Galatians 1"
# Or just ask naturally
"Generate a commentary for Romans 8"
```

### Use Foundry for Production

```bash
# Deploy once, then call API
curl -X POST https://your-api.../api/v1/commentaries \
  -H "X-API-Key: akey-..." \
  -d '{"book":"Galatians","chapter":"1"}'

# View in dashboard
https://foundry-dashboard.microsoft.com/agents/...
```

---

## 📝 Environment Variables by Backend

### Claude (Local)
```bash
# No environment setup needed!
# Uses your local Copilot API key
```

### GitHub Copilot (VS Code)
```bash
# No environment setup needed!
# Uses your GitHub account + VS Code Copilot subscription
```

### Foundry (Cloud)
```bash
# Required
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_LOCATION=eastus
AZURE_ENV_NAME=bible-study-dev

# For authentication
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=your-secret

# For model (choose one)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=akey-...
# OR
OPENAI_API_KEY=sk-...

# For storage
AZURE_STORAGE_ACCOUNT_NAME=yourstorageaccount
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpoints=...

# Optional: cost controls
FOUNDRY_AGENT_TIMEOUT=300  # seconds
FOUNDRY_AGENT_MAX_TOKENS=8000
```

---

## 🎛️ Configuration by Backend

### `SKILL.md` (Used by Both)
✓ Content generation standards  
✓ Data structures  
✓ Quality guidelines  
**No changes needed** — works with both Claude and Foundry

### `bible-commentary.agent.md` (Used by Both)
✓ Agent protocol and phases  
✓ Validation logic  
✓ Output format  
**No changes needed** — agent logic is backend-agnostic

### `agent.yaml` (Foundry Only)
Specifies:
- Model type (gpt-4, gpt-35-turbo)
- Temperature & tokens
- Scaling behavior
- Timeout settings

**Customize for Foundry deployment**

### `lib/` (Used by Both)
✓ HTML generator library  
✓ Type definitions  
✓ Design system  
**No changes needed** — works with both backends

---

## 💰 Cost Comparison (Example)

### Claude (Local) — 100 commentaries
```
API calls to Claude: 100 @ ~$0.03/call = $3.00
Storage: Local (free)
Total: ~$3
```

### Foundry (Cloud) — 100 commentaries
```
Azure Foundry compute: ~$10/month
Azure Storage: ~$1/month
API calls to OpenAI: 100 @ ~$0.03/call = $3.00
Monitoring (Application Insights): ~$0.50/month
Total: ~$14.50/month
```

**Claude is cheaper for small volume; Foundry is cheaper for large volume or enterprise features.**

---

## 🎛️ Advanced: Hybrid Approach

Use **all three backends simultaneously**:

```bash
# Development (instant feedback)
Claude or GitHub Copilot via local skills

# Production (REST API, at scale)
Azure Foundry cloud deployment

# Share the same lib/ (HTML generator)
# Share the same SKILL.md (content standards)
# All three generate identical output
```

This way:
- **Developers** use Claude or Copilot locally (fast iteration)
- **End users** hit Foundry API (reliable, scalable)
- **Both** produce identical output (same `lib/html-generator`)

---

## 🐛 Troubleshooting

### Claude Path Not Working
```bash
# Ensure skill is in correct directory
ls ~/.copilot/skills/bible-commentary-skill/

# Check Copilot can see it
# Open Claude and search for "Bible Commentary" in skills

# Test with simple request
"Do Genesis 1"
```

### Foundry Deployment Fails
```bash
# Check Azure CLI is authenticated
az account show

# Verify resource group was created
az group show -n bible-study-dev-rg

# Check deployment logs
azd up --debug

# Clear and retry
azd down  # removes all resources
azd provision
azd deploy
```

### API Calls Timeout
```bash
# Increase timeout in agent.yaml
timeout: 60  # seconds

# Redeploy
azd deploy
```

---

## 📚 Related Documentation

- [QUICK_START.md](QUICK_START.md) — Fastest paths to use the skill
- [FOUNDRY_DEPLOYMENT.md](FOUNDRY_DEPLOYMENT.md) — Detailed Foundry setup
- [SKILL.md](SKILL.md) — Content generation standards
- [LIB_DEVELOPER_GUIDE.md](LIB_DEVELOPER_GUIDE.md) — How to use the HTML generator library

