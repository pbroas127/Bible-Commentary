# Bible Commentary Web App

Modern React frontend for Bible Commentary API.

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Configuration

### Environment Variables

Create a `.env` file in the `web/` folder:

```env
VITE_API_URL=http://localhost:7071
```

**For local development:**
```env
VITE_API_URL=http://localhost:7071
```

**For Azure deployment:**
```env
VITE_API_URL=https://bible-commentary-prod-api.azurewebsites.net
```

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Deploy to Azure Static Web Apps or any static hosting.

## Architecture

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Client-side HTML rendering** using `@bible-commentary/skill` library
- **REST API integration** via `commentary-api.ts` service
- **Dark theme** optimized for reading Scripture

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx      # Book/chapter selector
│   │   └── CommentaryDisplay.tsx # HTML renderer
│   ├── services/
│   │   └── commentary-api.ts   # API client
│   ├── styles/
│   │   ├── index.css          # Global styles
│   │   └── [component].css    # Component-specific styles
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Entry point
├── public/
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript config
└── package.json
```

## Features

✨ **Full-featured Bible study app:**
- Search by book and chapter
- Contextual commentary from API
- Interactive HTML rendering
- Dark theme for comfortable reading
- Mobile-responsive design
- Client-side caching (via browser)

## API Integration

The app communicates with the Bible Commentary REST API:

```typescript
// Fetch commentary JSON
const commentary = await CommentaryAPI.getCommentary('galatians', 1)

// Render to HTML (client-side, using lib/html-generator)
const html = await CommentaryAPI.renderCommentary(commentary)

// Or combined:
const html = await CommentaryAPI.loadCommentary('galatians', 1)
```

## Deployment

### Azure Static Web Apps

```bash
npm run build

# Deploy dist/ folder to Azure Static Web Apps
az staticwebapp create \
  --name bible-commentary-web \
  --resource-group bible-commentary-rg \
  --location eastus \
  --source ./dist
```

### Environment Configuration in Azure

Set `VITE_API_URL` in Static Web Apps environment:

```bash
az staticwebapp appsettings set \
  --name bible-commentary-web \
  --setting-name VITE_API_URL=https://bible-commentary-prod-api.azurewebsites.net
```

## Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Dependencies

- **React 18** - UI framework
- **Vite 5** - Build tool
- **TypeScript 5** - Type safety
- **@bible-commentary/skill** - HTML generation library

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
