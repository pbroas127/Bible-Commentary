# Bible Commentary API - Deployment Plan

## Phase 1: Local Development & Testing (1-2 days)

### Setup
```bash
cd api
npm install
npm run build
npm run dev
```

### Test Endpoints
```bash
# Test GET commentary endpoint
curl http://localhost:7071/api/v1/commentary/galatians/1

# Expected response: ChapterCommentary JSON (mock data)
```

### Verify
- [ ] `get-commentary.ts` compiles without errors
- [ ] Mock data returns correct ChapterCommentary shape
- [ ] Cache service works (in-memory for MVP)
- [ ] Response time: <100ms (mock) from localhost

---

## Phase 2: Azure Deployment (1-2 days)

### Prerequisites
```bash
# Install Azure CLI
brew install azure-cli  # macOS
# or https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Install Azure Functions Core Tools
brew tap azure/azure
brew install azure-functions-core-tools@4

# Install Azure Developer CLI
brew install azure/tap/azd

# Verify installations
az --version
func --version
azd version
```

### Initial Setup
```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set subscription
az account set --subscription "<subscription-id>"

# Create resource group
az group create --name bible-commentary-rg --location eastus
```

### Deploy Infrastructure
```bash
# Option 1: Using azd (recommended)
azd init --template . --branch main
azd provision
azd deploy

# Option 2: Using Bicep directly
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep \
  --parameters .azure/main.parameters.json \
  --parameters environment=dev
```

### Verify Deployment
```bash
# Get Function App URL
az functionapp show \
  --resource-group bible-commentary-rg \
  --name bible-commentary-dev-api \
  --query "defaultHostName" \
  --output tsv

# Test deployed API
curl https://<function-app-url>/api/v1/commentary/galatians/1

# Check logs
func azure functionapp logstream <function-app-name> --build remote
```

### Monitor
```bash
# View Application Insights
az monitor app-insights component show \
  --resource-group bible-commentary-rg \
  --app-id bible-commentary-dev-insights

# Stream logs
az webapp log tail \
  --resource-group bible-commentary-rg \
  --name bible-commentary-dev-api
```

---

## Phase 3: Production Hardening (2-3 days)

### Enable Redis Caching
```bash
# Deploy prod environment with Redis
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep \
  --parameters .azure/main.parameters.json \
  --parameters environment=prod

# Get Redis connection string
az redis show \
  --resource-group bible-commentary-rg \
  --name bible-commentary-prod-cache \
  --query "accessKeys.primaryKey" \
  --output tsv
```

### Enable Cosmos DB
```bash
# Get Cosmos DB connection string
az cosmosdb keys list \
  --resource-group bible-commentary-rg \
  --name bible-commentary-prod-cosmos \
  --type connection-strings

# Update Function App settings
az functionapp config appsettings set \
  --resource-group bible-commentary-rg \
  --name bible-commentary-prod-api \
  --settings "COSMOS_CONNECTION_STRING=<connection-string>"
```

### Configure CI/CD
```bash
# Create GitHub Actions workflow
# (See .github/workflows/deploy.yml)

# Prerequisites:
# 1. Create Azure Service Principal
az ad sp create-for-rbac \
  --name bible-commentary-sp \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/bible-commentary-rg

# 2. Add secret to GitHub Actions:
# AZURE_CREDENTIALS: (output from above)
```

### Load Testing
```bash
# Simulate 100 concurrent users for 5 minutes
# Using Apache JMeter or k6.io

# k6 example:
k6 run --vus 100 --duration 5m load-test.js

# Expected metrics:
# - P95 latency: <500ms
# - P99 latency: <1000ms
# - Error rate: <0.1%
```

---

## Phase 4: Monitoring & Observability (1 day)

### Set Up Alerts
```bash
# High latency alert
az monitor metrics alert create \
  --resource-group bible-commentary-rg \
  --name HighLatency \
  --scopes /subscriptions/<sub-id>/resourceGroups/bible-commentary-rg/providers/Microsoft.Web/sites/bible-commentary-prod-api \
  --condition "avg Duration > 1000" \
  --window-size 5m \
  --evaluation-frequency 1m

# Error rate alert
az monitor metrics alert create \
  --resource-group bible-commentary-rg \
  --name HighErrorRate \
  --scopes /subscriptions/<sub-id>/resourceGroups/bible-commentary-rg/providers/Microsoft.Web/sites/bible-commentary-prod-api \
  --condition "total RequestsFailed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m
```

### Configure Logs
```bash
# Enable diagnostic logging to Cosmos DB
az monitor diagnostic-settings create \
  --resource /subscriptions/<sub-id>/resourceGroups/bible-commentary-rg/providers/Microsoft.Web/sites/bible-commentary-prod-api \
  --name FunctionAppLogs \
  --workspace <workspace-id> \
  --logs '[{"category":"FunctionAppLogs","enabled":true}]'
```

---

## Cost Estimate

| Service | Dev | Prod | Notes |
|---------|-----|------|-------|
| Azure Functions | $0.20/M invocations | $0.20/M invocations | 100k invocations/day = ~$0.60/mo |
| Azure Cache (Redis) | Free tier | $15-30/mo | Standard 250MB |
| Cosmos DB | $25/mo | $25-50/mo | Serverless tier, ~50 RU/s |
| Application Insights | Free (<5GB/mo) | Free | <5GB logs/mo |
| Storage (for Functions) | Free | ~$1/mo | Minimal usage |
| **Total** | ~$25-30/mo | ~$50-75/mo | Moderate volume |

---

## Rollback Plan

### If Deployment Fails
```bash
# Revert to previous deployment
az deployment group show \
  --resource-group bible-commentary-rg \
  --name <deployment-name>

# Rollback
az deployment group cancel \
  --resource-group bible-commentary-rg \
  --name <current-deployment>
```

### If API Becomes Unhealthy
```bash
# Check health
curl https://<api-url>/api/v1/health

# Restart Functions
az functionapp restart \
  --resource-group bible-commentary-rg \
  --name bible-commentary-prod-api

# If unrecoverable, switch DNS to secondary region
# (Configure via Traffic Manager if multi-region)
```

---

## Success Criteria

- ✅ API responds in <500ms (p95) from Azure
- ✅ Handles 100+ concurrent requests
- ✅ Cache hit rate >70% for popular chapters
- ✅ Error rate <0.1%
- ✅ Uptime 99.9%
- ✅ Cost <$100/month

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Local Dev | 1-2 days | [ ] |
| Phase 2: Azure Deploy | 1-2 days | [ ] |
| Phase 3: Production Hardening | 2-3 days | [ ] |
| Phase 4: Monitoring | 1 day | [ ] |
| **Total** | **5-8 days** | [ ] |

---

## Next Steps

1. **Immediate**: Test `get-commentary` endpoint locally
2. **Day 1-2**: Deploy to Azure dev environment
3. **Day 3-4**: Enable Redis and Cosmos DB for prod
4. **Day 5**: Load testing and monitoring setup
5. **Day 6**: Deploy frontend web app (React/Vue)
6. **Day 7**: End-to-end testing (API → Frontend)
7. **Day 8**: Go live to production

---

## Foundry Agent Integration

Once ready, update `commentary-service.ts`:

```typescript
// Change this:
private useMockData = process.env.USE_MOCK_DATA !== 'false';

// To this:
private useMockData = process.env.USE_MOCK_DATA !== 'false';
private foundryEndpoint = process.env.FOUNDRY_AGENT_ENDPOINT || '';
private foundryApiKey = process.env.FOUNDRY_API_KEY || '';

// Then deploy:
az functionapp config appsettings set \
  --resource-group bible-commentary-rg \
  --name bible-commentary-prod-api \
  --settings \
    "USE_MOCK_DATA=false" \
    "FOUNDRY_AGENT_ENDPOINT=<foundry-endpoint>" \
    "FOUNDRY_API_KEY=<api-key>"
```

---

## Support

- Azure Functions docs: https://learn.microsoft.com/en-us/azure/azure-functions/
- Azure Cosmos DB: https://learn.microsoft.com/en-us/azure/cosmos-db/
- Azure Cache for Redis: https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/
- Application Insights: https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview
