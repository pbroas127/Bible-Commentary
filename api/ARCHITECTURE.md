# Bible Commentary API Architecture

## Overview

This pivot converts the Bible Commentary skill from a **monolithic agent → HTML file** model to a **modern REST API → JSON → Client Rendering** model. This enables:

- **Moderate-to-high volume** public usage (multi-tenant, per-user personalization)
- **Separation of concerns** (content generation decoupled from presentation)
- **Caching and performance** (JSON is lightweight, cacheable)
- **Multiple consumers** (web app, mobile app, CLI, third-party integrations)
- **Local skill pathways preserved** (Claude, GitHub Copilot work unchanged)

---

## Architecture Diagram

```
┌─────────────────┐
│  Local Skills   │  (Claude, Copilot)
│  (Unchanged)    │  Generate JSON locally
└────────┬────────┘
         │
    ChapterCommentary JSON
         │
┌────────▼────────────────────────────────────────┐
│         Azure Functions REST API                 │
│  (Serverless, auto-scale, pay-per-execution)    │
│                                                  │
│  ├─ GET /api/v1/commentary/{book}/{chapter}    │
│  ├─ POST /api/v1/user/{userId}/commentaries    │
│  ├─ GET /api/v1/user/{userId}/highlights      │
│  └─ GET /api/v1/search?q=faith&theme=Hope    │
└────────┬───────────────────────────────────────┘
         │
    Lightweight JSON
         │
    ┌────┴─────────────────────────────────────────────┐
    │                                                   │
┌───▼────────────┐  ┌──────────────────┐  ┌──────────────┐
│  Web App       │  │  Mobile App      │  │  CLI / API   │
│  (React/Vue)   │  │  (React Native)  │  │  Clients     │
│                │  │                  │  │              │
│ html-generator │  │  html-generator  │  │  raw JSON    │
│ + user state   │  │  + mobile layout │  │              │
└────────────────┘  └──────────────────┘  └──────────────┘
         │                  │                    │
         └──────────┬───────┴────────────────────┘
                    │
            ┌───────▼───────────┐
            │  Azure Cosmos DB  │
            │  (User data,      │
            │   highlights,     │
            │   bookmarks)      │
            └───────────────────┘
                    │
            ┌───────▼───────────┐
            │  Azure Cache      │
            │  (Redis)          │
            │  (Popular         │
            │   chapters)       │
            └───────────────────┘
```

---

## Data Flow

### 1. Content Generation (Unchanged)

**Local Skill (Claude / Copilot):**
```
User: "Do Romans 8"
  ↓
SKILL.md invokes agent (Claude or Copilot)
  ↓
Agent generates ChapterCommentary JSON
  ↓
lib/html-generator renders HTML locally
```

**Cloud API (New):**
```
Client: GET /api/v1/commentary/romans/8
  ↓
Azure Function HTTP Trigger
  ↓
Call Foundry Agent (or cached JSON)
  ↓
ChapterCommentary JSON returned
```

### 2. User Personalization (New)

```
User: Highlight verse, add note, change theme
  ↓
POST /api/v1/user/{userId}/highlights
  ↓
Cosmos DB stores user annotation
  ↓
Client re-renders HTML with personal data overlaid
```

### 3. Caching Strategy (New)

```
GET /api/v1/commentary/galatians/1
  ↓
Check Redis cache (5 min TTL for popular chapters)
  ↓
Hit  → Return cached JSON (10ms)
Miss → Generate fresh, cache it (500ms), return
```

---

## API Endpoints

### Public Endpoints (No Auth)

```
GET /api/v1/commentary/{book}/{chapter}
  Returns: ChapterCommentary JSON
  Example: /api/v1/commentary/galatians/1
  Cache: 5 min (popular chapters)
  Response Time: 10-500ms (hit/miss)

GET /api/v1/books
  Returns: Array of valid book names + metadata
  Cache: 1 hour
  Response Time: <10ms

GET /api/v1/search?q={query}&theme={theme}&limit=20
  Returns: Array of matching verses + passages
  Example: /api/v1/search?q=faith&theme=Hope&limit=20
  Cache: 15 min
  Response Time: 100-800ms
```

### Authenticated Endpoints (JWT or Azure AD)

```
POST /api/v1/user/{userId}/highlights
  Body: { bookKey: "galatians", chapter: 1, verse: 1, highlighted: true }
  Returns: Updated user highlight set
  Storage: Cosmos DB

GET /api/v1/user/{userId}/highlights
  Returns: Array of all highlights for this user
  Storage: Cosmos DB

POST /api/v1/user/{userId}/bookmarks
  Body: { bookKey: "galatians", chapter: 1, title: "My Study Notes" }
  Returns: Updated bookmark

GET /api/v1/user/{userId}/progress
  Returns: { lastStudied, totalChaptersRead, favoriteThemes, streak }
  Storage: Cosmos DB
```

---

## Deployment Stack

### Azure Services

1. **Azure Functions** (HTTP Triggers)
   - Serverless compute
   - Auto-scale (0 → thousands)
   - Pay per invocation
   - Cold start: ~500ms (acceptable for public service)

2. **Azure Cosmos DB**
   - User highlights, bookmarks, annotations
   - Global replication (future: serve multi-region)
   - RU-based pricing (pay for throughput)

3. **Azure Cache for Redis**
   - Cache popular chapters (Galatians, John, Romans)
   - 5-min TTL for hot chapters
   - Cost: ~$15-30/mo for Standard tier

4. **Azure Static Web Apps** (or Container Apps)
   - Host frontend (React/Vue app)
   - Integrated with Functions API
   - Free tier available

5. **Azure Storage (Blob)**
   - Pre-generated chapter cache (optional)
   - Cost: $0.01/GB/month

### Infrastructure as Code

- **Bicep** files in `.azure/` folder
- Deploy with `azd up` (single command)
- Cost estimate: $40-60/month for moderate volume

---

## Local Skill Pathways (Unchanged)

### Claude (Local)
```bash
~/.copilot/skills/bible-commentary-skill/SKILL.md
→ Invokes agent locally
→ Generates ChapterCommentary JSON
→ lib/html-generator renders HTML
→ Output: .html file
```

### GitHub Copilot (VS Code)
```
@bible-commentary Do Romans 8
→ Skill invoked in Copilot Chat
→ SKILL.md protocol executed locally
→ HTML file generated and displayed
```

---

## Moderate-Volume Service Assumptions

**Target:** 100-1000 API requests/day, 10-100 concurrent users

### Performance Requirements
- P95 response time: <500ms
- P99 response time: <1000ms
- Availability: 99.9%

### Caching Strategy
- Redis for top 50 chapters (Galatians, Romans, John, etc.)
- Static CDN for evergreen content (5-min TTL)
- Stale-while-revalidate for background refresh

### Cost Optimization
- Functions: ~$0.20/million invocations
- Redis: $15-30/mo
- Cosmos DB: ~50 RU/s = ~$25/mo
- **Total: ~$50-60/month**

---

## Implementation Phases

### Phase 1: API Foundation (Week 1)
- [ ] Create Azure Functions HTTP trigger boilerplate
- [ ] Implement `GET /api/v1/commentary/{book}/{chapter}` endpoint
- [ ] Connect to Foundry Agent (or mock generation)
- [ ] Deploy to Azure

### Phase 2: Caching & Performance (Week 2)
- [ ] Add Redis cache layer
- [ ] Implement cache invalidation strategy
- [ ] Add monitoring/observability (Application Insights)

### Phase 3: User Personalization (Week 3)
- [ ] Add Cosmos DB for user data
- [ ] Implement highlight/bookmark endpoints
- [ ] Add Azure AD authentication

### Phase 4: Web Frontend (Week 4)
- [ ] Create React/Vue web app
- [ ] Integrate lib/html-generator on client
- [ ] Add user authentication + sync

### Phase 5: Mobile & CLI (Week 5+)
- [ ] React Native mobile app
- [ ] Node.js CLI tool
- [ ] API documentation (OpenAPI/Swagger)

---

## Migration Path for Existing Users

**Existing Local Skill Users:**
- No change needed (skill works offline)
- Optional: Can sync highlights to cloud via API

**New Cloud Users:**
- Sign up → create account → API key
- Use API to fetch commentaries
- Store highlights in personal account

---

## File Structure

```
api/
├── functions/
│   ├── get-commentary.ts           # Main endpoint
│   ├── get-search.ts               # Search endpoint
│   ├── get-user-highlights.ts      # User data endpoint
│   └── post-user-highlight.ts      # User update endpoint
├── services/
│   ├── commentary-service.ts       # Commentary generation logic
│   ├── cache-service.ts            # Redis cache wrapper
│   ├── search-service.ts           # Search/index logic
│   └── auth-service.ts             # JWT/Azure AD validation
├── models/
│   └── index.ts                    # Reuse from lib/types.ts
├── tests/
│   ├── get-commentary.test.ts
│   └── cache-service.test.ts
├── ARCHITECTURE.md                 # This file
└── package.json                    # API-specific dependencies

.azure/
├── main.bicep                      # Infrastructure definition
├── main.parameters.json            # Deployment parameters
└── deployment-plan.md              # Deployment workflow

docs/api/
├── openapi.yaml                    # REST API spec
├── examples.md                     # Usage examples
└── deployment.md                   # How to deploy

lib/                                # (Existing, unchanged)
├── html-generator.ts
├── types.ts
├── design-system.ts
└── index.ts

SKILL.md                           # (Existing, unchanged)
bible-commentary.agent.md          # (Existing, unchanged)
```

---

## Next Steps

1. **Decide on Foundry Integration**
   - Use real Foundry agent for generation?
   - Or start with mock data for MVP?

2. **Choose Frontend Framework**
   - React (most common)
   - Vue (simpler)
   - Plain vanilla JS (minimal)

3. **Set Up Azure Subscription**
   - Verify Functions, Cosmos DB, Redis quotas
   - Create resource group

4. **Start with MVP**
   - Single endpoint: `GET /api/v1/commentary/{book}/{chapter}`
   - Mock data first
   - Deploy to Azure Functions
   - Test load

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Cold starts (500ms) | Warm-up function on schedule; acceptable for public service |
| Foundry agent latency | Cache aggressively; pre-generate popular chapters |
| Cosmos DB costs | Use serverless tier; implement TTL on old data |
| Concurrent user spikes | Azure Functions auto-scale; Redis for hot chapters |

---

## Success Criteria

- ✅ API responds in <500ms (p95)
- ✅ Supports 100+ concurrent users
- ✅ User highlights persist across sessions
- ✅ Frontend renders from API JSON
- ✅ Local skills still work offline
- ✅ Total cost <$100/month at moderate volume
