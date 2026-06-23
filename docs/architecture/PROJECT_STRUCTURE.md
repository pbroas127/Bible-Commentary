# Project Structure: Bible Commentary Skill + Cloud API

## Overview

This project now has **two parallel deployment pathways**:

1. **Local Skills** (Claude/Copilot) — Existing, unchanged
2. **Cloud API** (Azure Functions) — New, REST-based

Both generate the same `ChapterCommentary` JSON and use the same `lib/html-generator` for rendering.

---

## Complete Directory Tree

```
bible-commentary-skill/
│
├── 📄 README.md                           Main documentation
├── 📄 SKILL.md                            ⭐ Claude/Copilot skill (UNCHANGED)
├── 📄 bible-commentary.agent.md           ⭐ Agent protocol (UNCHANGED)
├── 📄 package.json                        Root package.json
├── 📄 tsconfig.json                       TypeScript configuration
├── 📄 .gitignore
│
├── 📁 lib/                                ⭐ UNCHANGED - Core library
│   ├── types.ts                           ChapterCommentary interface
│   ├── html-generator.ts                  HTML rendering (client-side)
│   ├── design-system.ts                   Color themes & typography
│   ├── index.ts                           Public API exports
│   └── package.json                       Library package definition
│
├── 📁 references/                         ⭐ UNCHANGED
│   └── completed-chapters.md              Progress log
│
├── 📁 api/                                🆕 NEW - Cloud API
│   │
│   ├── 📄 package.json                    API dependencies
│   ├── 📄 tsconfig.json                   TypeScript config for API
│   ├── 📄 ARCHITECTURE.md                 🆕 Full design document
│   │
│   ├── 📁 functions/                      Azure Functions HTTP triggers
│   │   ├── get-commentary.ts              🆕 GET /api/v1/commentary/{book}/{chapter}
│   │   ├── get-search.ts                  (TODO) GET /api/v1/search?q=...
│   │   ├── get-user-highlights.ts         (TODO) GET /api/v1/user/{userId}/highlights
│   │   └── post-user-highlight.ts         (TODO) POST /api/v1/user/{userId}/highlights
│   │
│   ├── 📁 services/                       Business logic layer
│   │   ├── commentary-service.ts          🆕 Generate ChapterCommentary JSON
│   │   ├── cache-service.ts               🆕 Redis/in-memory caching
│   │   ├── search-service.ts              (TODO) Search/index logic
│   │   └── auth-service.ts                (TODO) JWT/Azure AD validation
│   │
│   └── 📁 tests/
│       ├── get-commentary.test.ts         (TODO) Unit tests
│       └── cache-service.test.ts          (TODO) Cache tests
│
├── 📁 .azure/                             🆕 Azure infrastructure & deployment
│   ├── main.bicep                         🆕 Infrastructure as Code (Azure resources)
│   ├── main.parameters.json               🆕 Deployment parameters
│   └── deployment-plan.md                 🆕 Step-by-step deployment guide
│
├── 📁 docs/                               📚 Documentation
│   └── api/
│       ├── openapi.yaml                   (TODO) REST API specification
│       ├── examples.md                    (TODO) API usage examples
│       └── deployment.md                  (TODO) Deployment runbook
│
├── 📁 web/                                (TODO) React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── 📄 azure.yaml                          🆕 Azure Developer CLI manifest
├── 📄 API_PIVOT_SUMMARY.md                🆕 This architecture overview
│
├── 📄 DUAL_BACKEND_SETUP.md               Three deployment pathways
├── 📄 BACKEND_SWITCH_REFERENCE.md         Backend comparison
├── 📄 INDEX.md                            Navigation guide
├── 📄 QUICK_START.md                      Quick start guide
└── 📄 Galatians-1.html                    ⭐ Sample generated output
    1-Peter-1.html                         ⭐ Sample generated output
```

---

## File Purposes

### 🟢 Core Library (Reusable Across All Pathways)

| File | Purpose | Status |
|------|---------|--------|
| `lib/types.ts` | TypeScript interfaces for ChapterCommentary | ✅ Complete |
| `lib/html-generator.ts` | Converts JSON → interactive HTML | ✅ Complete |
| `lib/design-system.ts` | Color schemes, typography, themes | ✅ Complete |
| `lib/index.ts` | Public API exports | ✅ Complete |

**Used by:**
- Local skills (Claude/Copilot) for HTML generation
- Cloud API (in future frontend) for client-side rendering
- Mobile apps, CLI tools, etc.

---

### 🟠 Local Skills (Existing Pathways)

| File | Purpose | Pathway | Status |
|------|---------|---------|--------|
| `SKILL.md` | Skill definition with data standards | Claude + Copilot | ✅ Complete |
| `bible-commentary.agent.md` | Agent protocol & invocation | Claude + Copilot | ✅ Complete |
| `Galatians-1.html` | Sample output (HTML file) | Downloads | ✅ Complete |
| `1-Peter-1.html` | Sample output (HTML file) | Downloads | ✅ Complete |

**How they work:**
```
User: "@bible-commentary Do Romans 8"
  ↓
SKILL.md invoked
  ↓
Agent generates JSON locally
  ↓
lib/html-generator renders HTML
  ↓
Saved or displayed locally
```

---

### 🔵 Cloud API (New Pathway)

| File | Purpose | Status |
|------|---------|--------|
| `api/functions/get-commentary.ts` | Main REST endpoint | ✅ Created |
| `api/services/commentary-service.ts` | Generate or fetch commentary | ✅ Created |
| `api/services/cache-service.ts` | Redis/memory caching layer | ✅ Created |
| `api/ARCHITECTURE.md` | Full design document | ✅ Created |
| `api/package.json` | Dependencies for API | ✅ Created |

**How it works:**
```
Client: GET /api/v1/commentary/galatians/1
  ↓
Azure Function receives request
  ↓
Check cache (Redis or in-memory)
  ├─ HIT: Return cached JSON
  └─ MISS: Generate fresh, cache, return
  ↓
Client gets lightweight JSON
  ↓
lib/html-generator (client-side) renders HTML
```

---

### 🟣 Infrastructure & Deployment

| File | Purpose | Status |
|------|---------|--------|
| `.azure/main.bicep` | Infrastructure as Code (Functions, Redis, Cosmos DB) | ✅ Created |
| `.azure/main.parameters.json` | Deployment parameters (region, environment) | ✅ Created |
| `.azure/deployment-plan.md` | Step-by-step deployment guide | ✅ Created |
| `azure.yaml` | Azure Developer CLI manifest | ✅ Created |

**How to use:**
```bash
# Deploy with single command
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep
```

---

### 📚 Documentation

| File | Purpose | Status |
|------|---------|--------|
| `API_PIVOT_SUMMARY.md` | Overview of architecture change | ✅ This file |
| `DUAL_BACKEND_SETUP.md` | Three deployment pathways explained | ✅ Complete |
| `BACKEND_SWITCH_REFERENCE.md` | Backend comparison table | ✅ Complete |
| `docs/api/openapi.yaml` | REST API specification | ⏳ TODO |
| `docs/api/examples.md` | Usage examples (curl, JavaScript, etc.) | ⏳ TODO |

---

## Development Workflow

### For Local Skills (Claude/Copilot) - Existing

**No change needed!** The skill works as before:

```bash
# User invokes in Copilot Chat or Claude
@bible-commentary Do Galatians 1

# Output: HTML file or displayed in chat
```

---

### For Cloud API - New

#### Step 1: Local Testing
```bash
cd api
npm install
npm run build
npm run dev
```

#### Step 2: Test Locally
```bash
# In another terminal
curl http://localhost:7071/api/v1/commentary/galatians/1

# Response: ChapterCommentary JSON (mock data)
```

#### Step 3: Deploy to Azure
```bash
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep
```

#### Step 4: Test in Azure
```bash
curl https://<function-app-url>/api/v1/commentary/galatians/1

# Response: ChapterCommentary JSON from Azure
```

#### Step 5: Build Frontend (TODO)
```bash
cd web
npm install
npm run dev

# Frontend calls API, renders with lib/html-generator
```

---

## Data Flow Diagrams

### Local Skill (No Internet)
```
User
  ↓
SKILL.md (Claude/Copilot)
  ↓
Generate ChapterCommentary JSON
  ↓
lib/html-generator (local)
  ↓
Save .html or display in Copilot Chat
```

### Cloud API (With Internet)
```
Browser/App
  ↓
GET /api/v1/commentary/{book}/{chapter}
  ↓
Azure Function
  ├─ Check Redis cache
  │  ├─ HIT (10ms) → return cached JSON
  │  └─ MISS (500ms) → generate → cache → return
  ↓
ChapterCommentary JSON
  ↓
lib/html-generator (client-side, JavaScript)
  ↓
Interactive HTML rendered in browser
  ↓
User can add highlights, notes, etc.
  ↓
POST /api/v1/user/{userId}/highlights
  ↓
Cosmos DB (persistent storage)
```

---

## Technology Stack

### Core Library
- **TypeScript 5.0+** - Type-safe interfaces
- **Node.js 20+** - Runtime
- **No external dependencies** - Fast, lean

### API
- **Azure Functions** - Serverless compute
- **TypeScript** - Same as library
- **Redis** - Caching (production)
- **Cosmos DB** - User data (production)
- **Application Insights** - Monitoring

### Frontend (TODO)
- **React 18+** or Vue 3 - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **lib/html-generator** - HTML rendering

### Infrastructure
- **Bicep** - Infrastructure as Code
- **Azure Functions** - Serverless API
- **Azure Cache for Redis** - Caching
- **Azure Cosmos DB** - Database
- **Azure Static Web Apps** - Host frontend (optional)

---

## Environment Variables

### Development
```bash
USE_MOCK_DATA=true          # Use mock data (no Foundry call)
USE_REDIS=false             # Use in-memory cache
```

### Production
```bash
USE_MOCK_DATA=false         # Call Foundry Agent
FOUNDRY_AGENT_ENDPOINT=...  # Foundry Agent API URL
FOUNDRY_API_KEY=...         # Foundry authentication
USE_REDIS=true              # Use Azure Cache
REDIS_URL=...               # Redis connection string
```

---

## Next Immediate Steps

1. **Test locally** (5 min)
   ```bash
   cd api && npm install && npm run dev
   curl http://localhost:7071/api/v1/commentary/galatians/1
   ```

2. **Deploy to Azure** (15 min)
   ```bash
   az deployment group create \
     --resource-group bible-commentary-rg \
     --template-file .azure/main.bicep
   ```

3. **Build frontend** (Week 2)
   - Create React app that calls API
   - Use lib/html-generator for rendering
   - Add user authentication

4. **Enable Foundry integration** (Week 3)
   - Connect real Foundry Agent
   - Set environment variables
   - Test end-to-end

---

## Monitoring & Observability

### Application Insights (Auto-Enabled)
- **Request metrics**: Latency, throughput, errors
- **Dependency tracking**: API calls, database queries
- **Custom events**: Cache hits/misses, user actions
- **Availability tests**: Endpoint health checks

### Alerts (TODO)
- High latency (>1s)
- High error rate (>1%)
- Low cache hit rate (<50%)

### Logs (TODO)
- Function execution logs
- Cache operation logs
- Database query logs
- User action logs (audit trail)

---

## FAQ

**Q: Do the local skills still work?**
A: Yes! SKILL.md and bible-commentary.agent.md are unchanged. You can still generate commentaries locally.

**Q: How do I choose between local and cloud?**
A: 
- **Local** if you want: offline, free, instant
- **Cloud** if you want: multi-user, persistence, web/mobile apps

**Q: Can I use both?**
A: Yes! Generate locally, then sync highlights to cloud API later.

**Q: How much does it cost?**
A: ~$50-75/month for 100-1000 API requests/day. Local skills are free.

**Q: When is the Foundry Agent integration ready?**
A: Now! Just set environment variables and it will integrate automatically.

---

## Related Files to Read

- **[api/ARCHITECTURE.md](api/ARCHITECTURE.md)** — Full technical design
- **[.azure/deployment-plan.md](.azure/deployment-plan.md)** — Deployment steps
- **[DUAL_BACKEND_SETUP.md](DUAL_BACKEND_SETUP.md)** — Pathway comparison
- **[SKILL.md](SKILL.md)** — Local skill definition
