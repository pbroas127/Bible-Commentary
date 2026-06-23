# Bible Commentary Agent — Foundry Deployment Guide

This guide walks you through deploying the Bible Commentary Agent to Microsoft Foundry for cloud-hosted, scalable Bible study generation.

## Prerequisites

- ✅ Azure subscription with Foundry enabled
- ✅ Azure Developer CLI (`azd`) installed
- ✅ OpenAI API key (or use Azure OpenAI)
- ✅ Git (for version control)

## Step 1: Set Up Your Foundry Project

### 1.1 Create a new Foundry agent project

```bash
# Create a project directory
mkdir my-bible-app
cd my-bible-app

# Initialize with Foundry template
azd init -t foundry-agent-template
```

This scaffolds:
```
├── agents/
│   └── bible-commentary/        # ← Copy our files here
├── infra/
│   ├── main.bicep
│   └── main.parameters.json
├── .env
├── azure.yaml
└── README.md
```

### 1.2 Copy the Bible Commentary files

```bash
# Copy the skill files into the agents directory
cp -r ../bible-commentary-skill/* ./agents/bible-commentary/

# Verify structure
ls -la agents/bible-commentary/
# Expected:
#   agent.yaml
#   bible-commentary.agent.md
#   bible-commentary-chapter.prompt.md
#   SKILL.md
#   references/completed-chapters.md
```

## Step 2: Configure Environment Variables

### 2.1 Set up local environment (`.env`)

```bash
# Create/edit .env
azd env set AZURE_ENV_NAME bible-commentary-dev
azd env set AZURE_LOCATION eastus
azd env set FOUNDRY_RESOURCE_GROUP bible-study-rg
```

### 2.2 Set up secrets (stored in Azure Key Vault)

```bash
# OpenAI API configuration
azd env set OPENAI_API_KEY "sk-your-openai-key"
azd env set OPENAI_MODEL "gpt-4-turbo"
azd env set OPENAI_API_ENDPOINT "https://api.openai.com/v1"

# Scripture data source (optional — for cross-references)
azd env set SCRIPTURE_API_KEY "your-scripture-db-key"
azd env set SCRIPTURE_API_ENDPOINT "https://api.scripture.bible/v1"

# Azure Storage for generated HTMLs
azd env set AZURE_STORAGE_CONNECTION_STRING "DefaultEndpointsProtocol=https;..."
azd env set STORAGE_CONTAINER_NAME "bible-commentaries"

# Monitoring
azd env set APPLICATION_INSIGHTS_KEY "your-app-insights-key"
```

## Step 3: Provision Azure Resources

### 3.1 Set up infrastructure with Bicep

The included `infra/main.bicep` will provision:
- Azure AI Foundry service
- Azure Storage account (for HTML outputs)
- Application Insights (for monitoring)
- Key Vault (for secrets)
- API Management (optional, for rate limiting)

```bash
# Provision resources
azd provision

# This creates:
# - Resource group: bible-study-rg
# - AI Foundry project
# - Storage account for outputs
# - Monitoring dashboards
```

### 3.2 Verify provisioning

```bash
# Check deployed resources
az resource list --resource-group bible-study-rg

# Get the Foundry endpoint
az ai project show -n bible-commentary-agent -g bible-study-rg
```

## Step 4: Deploy the Agent

### 4.1 Package the agent

```bash
# azd handles packaging automatically, but verify your agent.yaml is valid
cat agents/bible-commentary/agent.yaml

# Key sections to verify:
# - name: bible-commentary-agent
# - model: gpt-4-turbo
# - tools: defined correctly
# - deployment.platform: azure-ai-foundry
```

### 4.2 Deploy to Foundry

```bash
# Deploy the agent and infrastructure
azd deploy

# This will:
# 1. Build the agent Docker image
# 2. Push to Azure Container Registry
# 3. Deploy to Azure Container Apps
# 4. Register the agent in Foundry
# 5. Set up monitoring and logging
```

### 4.3 Verify deployment

```bash
# Get the deployed agent endpoint
azd env list | grep FOUNDRY_ENDPOINT

# Test the agent
curl -X POST https://your-foundry-endpoint/api/v1/commentaries \
  -H "X-API-Key: $(azd env list | grep API_KEY | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -d '{
    "book": "Galatians",
    "chapter": "1"
  }'
```

## Step 5: Set Up Monitoring & Logging

### 5.1 View logs

```bash
# Stream agent logs
azd logs --all

# Or view in Azure Portal
# → Resource Group → Foundry Project → Application Insights → Logs
```

### 5.2 Configure continuous evaluation (optional)

```bash
# Create an evaluation dataset
az ai agent evaluation create \
  --resource-group bible-study-rg \
  --project-name bible-commentary-agent \
  --dataset-name test-passages.jsonl
```

## Step 6: Integrate with Frontend (Optional)

### 6.1 Build a web UI

Example React component:

```jsx
import { useState } from 'react'

export function BiblCommentaryUI() {
  const [book, setBook] = useState('Galatians')
  const [chapter, setChapter] = useState('1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    const response = await fetch('https://your-foundry-endpoint/api/v1/commentaries', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.REACT_APP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ book, chapter })
    })
    const data = await response.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div>
      <input placeholder="Book" value={book} onChange={e => setBook(e.target.value)} />
      <input placeholder="Chapter" value={chapter} onChange={e => setChapter(e.target.value)} />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Commentary'}
      </button>
      {result && (
        <a href={result.htmlUrl} download>
          Download {book} {chapter}
        </a>
      )}
    </div>
  )
}
```

### 6.2 Deploy the frontend

```bash
# Option A: Azure Static Web Apps
azd up --from-code ./frontend

# Option B: Vercel (if using Next.js)
vercel deploy
```

## Step 7: Managing the Agent

### 7.1 Update the agent

```bash
# Edit agent.yaml or .agent.md files
# Then redeploy:
azd deploy

# Or push incrementally:
git add agents/bible-commentary/
git commit -m "Update commentary logic"
azd deploy
```

### 7.2 Monitor performance

```bash
# View metrics
az monitor metrics list \
  --resource-group bible-study-rg \
  --resource-type "Microsoft.AI/projects"

# Set up alerts
az monitor metrics alert create \
  --resource-group bible-study-rg \
  --name HighErrorRate \
  --description "Alert if agent error rate > 5%"
```

### 7.3 Scale the agent

Update `agent.yaml`:

```yaml
deployment:
  scaling:
    minReplicas: 2        # Minimum running instances
    maxReplicas: 10       # Maximum for auto-scale
    targetUtilization: 0.7
```

Then redeploy:

```bash
azd deploy
```

## Step 8: Cost Optimization

### 8.1 Estimate costs

```bash
# Preview what you'll be charged
az pricing calculator estimates

# Or use the Foundry cost calculator
# → Azure Portal → Foundry Resource → Cost Analysis
```

### 8.2 Reduce costs

- **Use Flex Consumption** instead of Standard for variable workloads
- **Batch requests** — process multiple commentaries in one invocation
- **Enable caching** in Azure API Management (optional add-on)
- **Schedule cleanup** — archive old commentaries to cold storage tier

## Troubleshooting

### Agent fails to deploy

```bash
# Check logs
azd logs --all --output json | jq '.[] | select(.level=="ERROR")'

# Validate agent.yaml syntax
az ai agent validate --file agents/bible-commentary/agent.yaml

# Check secrets are set
azd env list
```

### API returns 403 (Unauthorized)

```bash
# Verify API key is correct
azd env set X-API-Key "your-new-key"

# Check RBAC roles
az role assignment list --resource-group bible-study-rg
```

### Slow response times

```bash
# Increase model context window or reduce verse count
# Edit agent.yaml:
agent:
  maxTokens: 12000  # Increase from 8000

# Scale up replicas
azd deploy  # with updated minReplicas/maxReplicas
```

## Next Steps

✅ **Now live!** Your agent is deployed and accessible via REST API.

- Build a **frontend UI** to interact with the API
- Set up **continuous evaluation** to improve prompt quality
- Create a **mobile app** wrapper using React Native or Expo
- Configure **webhooks** to integrate with Slack, Discord, Teams
- Enable **fine-tuning** on your commentary patterns for domain-specific models

See [README.md](../README.md) for more options.
