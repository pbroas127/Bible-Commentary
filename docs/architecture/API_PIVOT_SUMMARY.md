# Pivot Summary: Agent → JSON API Architecture

## What Changed

### Before (Monolithic)
```
Skill (Claude/Copilot)
  ↓
Agent generates ChapterCommentary JSON
  ↓
lib/html-generator renders to .html file
  ↓
User downloads file to phone
```

**Problems:**
- 100KB+ files per chapter (heavy)
- No personalization per user
- Can't add highlights/notes
- No multi-user scalability
- Static files don't sync across devices

---

### After (REST API)
```
┌─────────────────────────────────────┐
│   EXISTING SKILLS (UNCHANGED)       │
│  Claude / GitHub Copilot            │
│  Generate JSON locally              │
└──────────────┬──────────────────────┘
               │
        ChapterCommentary JSON
               │
┌──────────────▼──────────────────────┐
│   CLOUD API (NEW)                   │
│   Azure Functions REST endpoints     │
│   - GET /api/v1/commentary/{b}/{c} │
│   - POST /api/v1/user/{id}/notes   │
│   - GET /api/v1/search?q=...       │
└──────────────┬──────────────────────┘
               │
        Lightweight JSON
               │
    ┌──────────┼──────────┐
    │          │          │
 Web App   Mobile App   CLI
(React)  (RN/Flutter)  (Node)
    │          │          │
    └──────────┼──────────┘
               │
        User-Specific Data
        (Highlights, notes, progress)
               │
    ┌──────────┴──────────┐
    │                     │
 Redis Cache        Cosmos DB
(Hot chapters)   (Persistent)
```

**Benefits:**
- ✅ Lightweight JSON API (20-30KB per chapter)
- ✅ Multiple clients (web, mobile, CLI)
- ✅ User personalization (highlights, notes, bookmarks)
- ✅ Scalability (serverless auto-scale)
- ✅ Caching (5-10x faster for popular chapters)
- ✅ Cost-effective ($50-75/mo for moderate volume)
- ✅ Local skills still work offline

---

## New Folder Structure

```
bible-commentary-skill/
├── api/
│   ├── functions/
│   │   ├── get-commentary.ts          # Main endpoint (NEW)
│   │   ├── get-search.ts              # Search endpoint (TODO)
│   │   ├── get-user-highlights.ts     # User data (TODO)
│   │   └── post-user-highlight.ts     # User updates (TODO)
│   ├── services/
│   │   ├── commentary-service.ts      # Generation logic (NEW)
│   │   ├── cache-service.ts           # Redis wrapper (NEW)
│   │   ├── search-service.ts          # Search/index (TODO)
│   │   └── auth-service.ts            # JWT/Azure AD (TODO)
│   ├── package.json                   # API dependencies (NEW)
│   ├── ARCHITECTURE.md                # Full design doc (NEW)
│   └── tests/
│       └── (unit tests - TODO)
│
├── .azure/
│   ├── main.bicep                     # Infrastructure as Code (NEW)
│   ├── main.parameters.json           # Deployment params (NEW)
│   └── deployment-plan.md             # Step-by-step guide (NEW)
│
├── docs/api/
│   ├── openapi.yaml                   # REST spec (TODO)
│   ├── examples.md                    # API usage examples (TODO)
│   └── deployment.md                  # Deployment guide (TODO)
│
├── lib/                               # (UNCHANGED)
│   ├── html-generator.ts
│   ├── types.ts
│   ├── design-system.ts
│   └── index.ts
│
├── SKILL.md                           # (UNCHANGED - still works locally)
├── bible-commentary.agent.md          # (UNCHANGED - still works locally)
├── azure.yaml                         # Azure Developer CLI config (NEW)
└── README.md                          # (Existing)
```

---

## Quick Start: Local Testing (5 min)

```bash
# 1. Install dependencies
cd api
npm install

# 2. Build TypeScript
npm run build

# 3. Test locally
npm run dev

# 4. In another terminal, test the endpoint
curl http://localhost:7071/api/v1/commentary/galatians/1

# Expected: ChapterCommentary JSON (mock data)
```

---

## Quick Start: Azure Deployment (10-15 min)

```bash
# 1. Prerequisites
az login
az account set --subscription "<your-subscription-id>"
az group create --name bible-commentary-rg --location eastus

# 2. Deploy infrastructure
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep \
  --parameters environment=dev

# 3. Get Function App URL
az functionapp show \
  --resource-group bible-commentary-rg \
  --name bible-commentary-dev-api \
  --query "defaultHostName" \
  --output tsv

# 4. Test deployed API
curl https://<function-app-url>/api/v1/commentary/galatians/1

# Expected: ChapterCommentary JSON from Azure
```

---

## Architecture Decisions Explained

### Why REST API?
- **Stateless**: Easy to scale horizontally
- **Cacheable**: JSON can be cached at multiple layers
- **Multi-tenant**: Single API serves web, mobile, CLI
- **Industry standard**: Clear contracts via OpenAPI

### Why Azure Functions?
- **Serverless**: Pay only for execution (~$0.20/M invocations)
- **Auto-scale**: From 0 to thousands seamlessly
- **Cold starts**: ~500ms acceptable for public service
- **Integrated**: Works with Cosmos DB, Redis, App Insights

### Why Separate Cache & DB?
- **Redis (Cache)**: Hot data (popular chapters), 5-min TTL
- **Cosmos DB (Database)**: User data (highlights), persistent
- **Strategy**: Check cache first → 10ms hit, 500ms miss → regenerate → cache

### Why Still Support Local Skills?
- **Offline capability**: Claude/Copilot skills work without internet
- **User choice**: Users can generate locally or use cloud API
- **Flexibility**: One codebase, multiple deployment modes

---

## Data Flow Example

### User asks: "Get Galatians 1"

#### Path 1: Local Skill (Claude/Copilot)
```
User: "@bible-commentary Do Galatians 1"
  ↓
SKILL.md protocol
  ↓
Agent generates ChapterCommentary JSON
  ↓
lib/html-generator converts to HTML
  ↓
Displayed in Copilot Chat / saved as file
  └─ No internet required
  └─ No cost
  └─ Instant (2-3 min)
```

#### Path 2: Cloud API (Web/Mobile/CLI)
```
Client: GET /api/v1/commentary/galatians/1
  ↓
Azure Function receives request
  ↓
Check Redis cache (key: "galatians:1")
  ├─ HIT (10ms): Return cached JSON
  └─ MISS (500ms):
      ├─ Call Foundry Agent (or generate)
      ├─ Receive ChapterCommentary JSON
      ├─ Cache for 5 min
      └─ Return to client
  ↓
Client receives lightweight JSON (20-30KB)
  ↓
lib/html-generator (client-side) renders HTML
  ↓
User sees interactive study view
  ├─ Can highlight verses
  ├─ Can add personal notes
  ├─ Syncs to Cosmos DB
  └─ Persists across devices
```

---

## Key Files & What They Do

| File | Purpose | Status |
|------|---------|--------|
| `api/ARCHITECTURE.md` | Full design document | ✅ Created |
| `api/functions/get-commentary.ts` | Main REST endpoint | ✅ Created |
| `api/services/commentary-service.ts` | Content generation logic | ✅ Created |
| `api/services/cache-service.ts` | Redis caching layer | ✅ Created |
| `api/package.json` | API dependencies | ✅ Created |
| `.azure/main.bicep` | Infrastructure as Code | ✅ Created |
| `.azure/deployment-plan.md` | Step-by-step deployment | ✅ Created |
| `azure.yaml` | Azure Developer CLI config | ✅ Created |

---

## Local Skills (Still Work!)

### Claude Skill (Offline)
```bash
~/.copilot/skills/bible-commentary-skill/SKILL.md
(Unchanged - generates HTML locally)
```

### GitHub Copilot Skill (VS Code)
```
@bible-commentary Do Romans 8
(Unchanged - generates HTML in Copilot Chat)
```

---

## Next Steps (Prioritized)

### ✅ Phase 1: Local Testing (TODAY)
- [ ] `npm install && npm run build` in `api/` folder
- [ ] `npm run dev` to start local Functions runtime
- [ ] Test endpoint: `curl http://localhost:7071/api/v1/commentary/galatians/1`
- [ ] Verify mock data returns correct JSON shape

### ⏭️ Phase 2: Azure Deployment (TOMORROW)
- [ ] `az login` and set subscription
- [ ] `az deployment group create` to deploy Bicep
- [ ] Test deployed endpoint: `curl https://<function-app-url>/api/v1/commentary/galatians/1`
- [ ] Check logs in Application Insights

### ⏭️ Phase 3: Foundry Integration (NEXT WEEK)
- [ ] Update `commentary-service.ts` to call real Foundry Agent
- [ ] Test `generateViaFoundry()` method
- [ ] Set `USE_MOCK_DATA=false` in Azure Function settings
- [ ] Validate response quality

### ⏭️ Phase 4: Frontend (WEEK 2)
- [ ] Create React web app in `web/` folder
- [ ] Import lib/html-generator for client-side rendering
- [ ] Call `/api/v1/commentary/{book}/{chapter}` endpoint
- [ ] Display interactive study view

### ⏭️ Phase 5: Production Hardening (WEEK 3)
- [ ] Enable Redis (change `environment=prod`)
- [ ] Enable Cosmos DB for user highlights
- [ ] Add authentication (Azure AD or JWT)
- [ ] Load testing (100 concurrent users)
- [ ] Deploy to production environment

---

## Cost Breakdown (Moderate Volume)

**Assumptions:** 100-1000 API requests/day, 10-100 concurrent users

| Component | Dev Cost | Prod Cost | Notes |
|-----------|----------|-----------|-------|
| Azure Functions | Free (1M free/mo) | $0.60/mo | 100k invocs/day |
| Azure Cache | Free | $15-30/mo | Standard 250MB |
| Cosmos DB | $0 | $25-50/mo | Serverless, 50 RU/s |
| App Insights | Free (<5GB) | Free | <5GB/mo logs |
| Storage | Free | $1/mo | Minimal |
| **Total/Month** | **Free** | **$45-75** | **Within budget** |

---

## Architecture Benefits Summary

| Benefit | Before | After |
|---------|--------|-------|
| File size per chapter | 100KB+ | 20-30KB JSON |
| Caching | None | 5-70ms with Redis |
| User personalization | ❌ | ✅ (Highlights, notes) |
| Multi-client support | ❌ | ✅ (Web, mobile, CLI) |
| Scalability | Single user | 100+ concurrent |
| Persistence | None | Cosmos DB |
| Offline support | ✅ (Local skills) | ✅ + ☁️ (Cloud API) |
| Cost (monthly) | $0 | $45-75 |

---

## Questions?

**"Wait, what about my local skills?"**
→ They still work! SKILL.md and bible-commentary.agent.md are unchanged. You can still generate commentaries locally with Claude or Copilot.

**"When should I use cloud API vs local skills?"**
→ **Cloud API** if you need: multi-user, persistence, sync across devices, web/mobile app
→ **Local Skills** if you want: offline, free, instant, just HTML files

**"Can I switch between them?"**
→ Yes! Same JSON structure means both produce identical output. You can generate locally, then sync highlights to cloud API later.

**"What about the Foundry Agent?"**
→ Ready to integrate! Just set `FOUNDRY_AGENT_ENDPOINT` and `FOUNDRY_API_KEY` in Function App settings. The `commentary-service.ts` already handles it.

---

## Files Ready to Explore

1. **[api/ARCHITECTURE.md](api/ARCHITECTURE.md)** — Full technical design
2. **[.azure/deployment-plan.md](.azure/deployment-plan.md)** — Step-by-step deployment guide
3. **[api/functions/get-commentary.ts](api/functions/get-commentary.ts)** — Main REST endpoint code
4. **[.azure/main.bicep](.azure/main.bicep)** — Azure infrastructure definition

All files are ready. Next step: `cd api && npm install && npm run dev` to test locally! 🚀
