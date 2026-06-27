---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Monorepo Scaffold + Express Backend Skeleton

## Objective
Create the full project directory structure, initialize the React+Vite+Tailwind frontend and Node.js+Express backend as a single monorepo, verify both dev servers start cleanly, and establish .env secret management. This is the physical foundation everything else builds on — no Google services yet.

## Context
- .gsd/SPEC.md — Tech stack decisions (React/Vite/Tailwind, Node/Express, single container)
- .gsd/ROADMAP.md — Phase 1 deliverables

## Directory Target Structure
```
civix-agent/                  ← project root (inside v2s-community-hero/)
├── client/                   ← Vite + React + Tailwind
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js        ← proxy /api → localhost:3001
│   └── package.json
├── server/                   ← Node.js + Express
│   ├── server.js             ← entry point, health check endpoint
│   ├── routes/               ← empty placeholder dirs
│   ├── agents/
│   └── package.json
├── .env                      ← secrets (gitignored)
├── .env.example              ← template (committed)
├── .gitignore
└── package.json              ← root workspace scripts
```

## Tasks

<task type="auto">
  <name>Scaffold monorepo + Vite React frontend</name>
  <files>
    civix-agent/client/ (new directory)
    civix-agent/package.json
    civix-agent/.gitignore
    civix-agent/.env.example
    civix-agent/.env
  </files>
  <action>
    Run from v2s-community-hero root:
    1. mkdir civix-agent, cd into it
    2. Create root package.json with scripts: "dev:client", "dev:server", "dev" (runs both concurrently), "build"
    3. npm install -D concurrently (for parallel dev scripts)
    4. cd client && npm create vite@latest . -- --template react
    5. npm install in client/
    6. npm install -D tailwindcss @tailwindcss/vite in client/
    7. Configure Tailwind in client/vite.config.js (add @tailwindcss/vite plugin)
    8. Add `@import "tailwindcss"` to client/src/index.css
    9. Configure vite.config.js proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
    10. Replace client/src/App.jsx with a minimal skeleton (just renders "CivixAgent" heading with Tailwind class)
    11. Create .env.example with placeholders:
        GEMINI_API_KEY=your_key_here
        FIREBASE_PROJECT_ID=
        FIREBASE_PRIVATE_KEY=
        FIREBASE_CLIENT_EMAIL=
        GOOGLE_MAPS_API_KEY=
        MUNICIPAL_WORKER_PASSPHRASE=civix2026
    12. Create .env (copy of .env.example with actual values left blank for now — user fills in after Phase 1)
    13. Create .gitignore including: .env, node_modules/, dist/, .firebase/
    - DO NOT install TypeScript — keep it JavaScript for hackathon velocity as per SPEC
    - DO NOT use pnpm workspaces or Turborepo — single root package.json with scripts is sufficient
    - Tailwind v4 uses the Vite plugin approach (@tailwindcss/vite), NOT the old postcss config approach
  </action>
  <verify>cd civix-agent/client && npm run dev → Vite dev server starts on port 5173, browser shows "CivixAgent" heading with visible Tailwind styling (not unstyled text)</verify>
  <done>
    - civix-agent/client/ exists with valid Vite+React structure
    - Tailwind is working (a bg-blue-500 class on a div renders blue in browser)
    - Vite proxy config present in vite.config.js
    - .env.example committed, .env gitignored
  </done>
</task>

<task type="auto">
  <name>Scaffold Express backend with health check</name>
  <files>
    civix-agent/server/server.js
    civix-agent/server/package.json
    civix-agent/server/routes/ (empty placeholder)
    civix-agent/server/agents/ (empty placeholder)
  </files>
  <action>
    1. mkdir civix-agent/server
    2. cd server && npm init -y
    3. npm install express cors dotenv
    4. npm install -D nodemon
    5. Create server.js:
       - require('dotenv').config({ path: '../.env' })
       - Express app on PORT 3001
       - CORS enabled for http://localhost:5173
       - GET /api/health → returns JSON { status: 'ok', service: 'CivixAgent API', timestamp: new Date().toISOString() }
       - app.listen(3001, () => console.log('CivixAgent API running on :3001'))
    6. Add "start": "node server.js" and "dev": "nodemon server.js" to server/package.json scripts
    7. Update root package.json scripts:
       "dev:client": "cd client && npm run dev"
       "dev:server": "cd server && npm run dev"  
       "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""
    - DO NOT implement any agent logic yet — just the skeleton
    - DO NOT hardcode any secrets in server.js — all via process.env
    - Use CommonJS (require/module.exports), not ESM — avoids hackathon-time module resolution issues
  </action>
  <verify>curl http://localhost:3001/api/health → returns {"status":"ok","service":"CivixAgent API","timestamp":"..."}</verify>
  <done>
    - Express server starts on :3001 without errors
    - /api/health returns valid JSON with status "ok"
    - Vite frontend can reach /api/health via proxy (fetch('/api/health') from browser returns ok)
    - nodemon auto-restarts on server.js edit
  </done>
</task>

## Success Criteria
- [ ] `npm run dev` from civix-agent/ starts both frontend (5173) and backend (3001) simultaneously
- [ ] Vite frontend renders visible Tailwind-styled content at localhost:5173
- [ ] Express /api/health returns JSON at localhost:3001/api/health
- [ ] Proxy works: browser fetch('/api/health') returns ok (no CORS error)
- [ ] .env.example is committed, .env is gitignored (git status confirms)
