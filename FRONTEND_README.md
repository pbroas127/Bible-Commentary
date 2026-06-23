# Frontend - React Web App

## Three Deployment Pathways for Bible Commentary

### ✅ Pathway 1: Local Skill (Claude/Copilot) — Offline
**Best for:** Personal Bible study, no internet needed
- Uses local `.copilot/skills/` folder
- Runs in VS Code with Claude or GitHub Copilot
- Generates HTML files locally
- Free (no Azure costs)

**Run:**
```bash
# Invoke in VS Code with Ctrl+Shift+I
@bible-commentary-skill do galatians 1
```

**Output:** Self-contained HTML file (Galatians-1.html, 1-Peter-1.html, etc.)

---

### ⚡ Pathway 2: REST API + Web Frontend (This Frontend)
**Best for:** Shared study, web access, mobile browsers
- REST API runs in Azure Functions
- Web app in React (this folder)
- Real-time commentary generation
- Multi-user support with caching

**Run:**
```bash
# Terminal 1: Start API (if local dev)
cd api
npm run dev

# Terminal 2: Start web frontend
cd web
npm install
npm run dev
```

**Access:** `http://localhost:5173`

**Deploy to Azure:**
```bash
# Deploy API to Azure Functions
az deployment group create \
  --resource-group bible-commentary-rg \
  --template-file .azure/main.bicep

# Deploy frontend to Azure Static Web Apps
npm run build
az staticwebapp create \
  --name bible-commentary-web \
  --resource-group bible-commentary-rg \
  --source ./web/dist
```

---

### 🚀 Pathway 3: Azure Foundry Agent (Cloud)
**Best for:** Production service, AI-powered features, scale to millions
- Hosted agent on Microsoft Foundry
- REST API + caching + database
- Persistent user data (highlights, notes)
- Enterprise-grade SLA

**Run:**
```bash
# Via Foundry SDK (coming soon)
const commentary = await foundry.invoke('bible-commentary', {
  book: 'galatians',
  chapter: 1,
})
```

**Cost:**
- Local skill: **$0**
- REST API + Frontend: **$50-75/month** (Azure Functions + Cache + DB)
- Foundry: **$14-18/month + usage** (managed)

---

## Web Frontend Features

✨ **Full-featured study app:**
- 📖 Search by book and chapter (20 Bible books)
- 💾 Client-side HTML rendering (no server needed)
- 🌙 Dark theme optimized for reading
- 📱 Mobile-responsive (iOS/Android)
- ⚡ Fast caching via browser
- 🔗 Share links to chapters

## Setup

### Local Development

1. **Prerequisites:**
   - Node.js 20+
   - npm 10+

2. **Install:**
   ```bash
   cd web
   npm install
   ```

3. **Configure API endpoint:**
   ```bash
   cp .env.example .env
   # Edit .env:
   # VITE_API_URL=http://localhost:7071  (local API)
   # Or point to Azure deployment
   ```

4. **Start dev server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Production Build

```bash
npm run build
npm run preview
```

Output: `dist/` folder (static HTML/CSS/JS)

## Architecture

```
┌─────────────────────────────────────────┐
│  Web Browser (React Frontend)           │
│  ├─ SearchBar component                │
│  ├─ CommentaryDisplay component        │
│  └─ commentary-api service             │
└──────────────┬──────────────────────────┘
               │
        Calls /api/v1/commentary/{book}/{chapter}
               │
               ▼
       ┌───────────────────────┐
       │  REST API Response    │
       │  (ChapterCommentary   │
       │   JSON)               │
       └───────────────────────┘
               │
     Client-side HTML rendering using
     @bible-commentary/skill library
               │
               ▼
       ┌───────────────────────┐
       │  Self-contained HTML  │
       │  (no more requests)   │
       └───────────────────────┘
```

## File Structure

```
web/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx       # Book/chapter selector
│   │   ├── SearchBar.css
│   │   ├── CommentaryDisplay.tsx
│   │   └── CommentaryDisplay.css
│   ├── services/
│   │   └── commentary-api.ts   # API client
│   ├── styles/
│   │   ├── index.css          # Global + utilities
│   │   └── App.css            # App layout
│   ├── App.tsx                # Main component
│   ├── App.css
│   └── main.tsx               # Entry point
├── public/
│   └── vite.svg
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Roadmap

### Phase 1 (Complete)
- [x] React scaffold with TypeScript
- [x] SearchBar component
- [x] CommentaryDisplay component
- [x] API client service
- [x] Vite build setup

### Phase 2 (Ready to implement)
- [ ] User authentication (Entra ID)
- [ ] Save highlights & notes to Cosmos DB
- [ ] Reading progress tracking
- [ ] Bookmark chapters
- [ ] Theme preferences (save to local storage)

### Phase 3 (Optional)
- [ ] Offline mode (service worker)
- [ ] Bible search across all commentaries
- [ ] Compare translations
- [ ] Greek/Hebrew lexicon integration
- [ ] Notes export to PDF

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite 5** - Fast build tool
- **CSS3** - Responsive design
- **@bible-commentary/skill** - Commentary rendering

## Deployment Options

### Option A: Local (development only)
```bash
npm run dev
```

### Option B: Static Hosting (Firebase, Netlify, Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Option C: Azure Static Web Apps
```bash
npm run build
az staticwebapp create \
  --name bible-commentary-web \
  --resource-group bible-commentary-rg \
  --location eastus \
  --source ./web/dist
```

### Option D: Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## Troubleshooting

**Issue: API returns 404**
- Ensure API is running: `cd api && npm run dev`
- Check VITE_API_URL in .env

**Issue: Blank page**
- Check browser console for errors
- Verify API response shape matches ChapterCommentary interface

**Issue: Slow loading**
- Enable browser caching (HTTP cache headers)
- Consider Redis caching in API layer

## Support

For issues, questions, or feature requests, see the main project README.

---

**Made with ❤️ for Bible study**
