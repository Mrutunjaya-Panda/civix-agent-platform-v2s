---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Google Maps Rendering + Dockerfile + Cloud Run Verification

## Objective
Get Google Maps rendering with a visible centered map pin (Bhubaneswar), verify the unified Vite+Express Docker container builds and runs locally, and confirm the Cloud Run deployment produces a publicly accessible URL. After this plan, Phase 1 is done and the full infrastructure stack is live.

## Context
- .gsd/SPEC.md — Google Maps JS API, MarkerClusterer, Cloud Run single-container deployment
- .gsd/DECISIONS.md — ADR-007 (MarkerClusterer), SPEC fallback (Leaflet if Maps billing blocks)
- civix-agent/client/src/ — add Map component
- civix-agent/ root — Dockerfile, .dockerignore

## Prerequisites
- Plan 1.1 and 1.2 must be complete and all services verified
- Google Maps API key created in Google Cloud Console, restricted to localhost:5173 for dev
- Google Cloud project with Cloud Run API enabled, gcloud CLI authenticated

## Tasks

<task type="auto">
  <name>Google Maps component with MarkerClusterer</name>
  <files>
    civix-agent/client/src/components/Map.jsx   ← new
    civix-agent/client/src/App.jsx              ← import Map component
    civix-agent/client/index.html               ← add Maps JS API script tag
  </files>
  <action>
    1. cd client && npm install @googlemaps/markerclusterer
    2. Add Google Maps JS script to client/index.html <head>:
       <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=marker" defer></script>
       Use import.meta.env.VITE_GOOGLE_MAPS_API_KEY — but note: script src needs the key inline in the URL
       Solution: dynamically inject the script tag from a useEffect in App.jsx using the VITE_ env var
       so the key is never hardcoded in HTML (stays only in .env)
    3. Create client/src/components/Map.jsx:
       - useRef for map div, useEffect to initialize google.maps.Map
       - Center: { lat: 20.2961, lng: 85.8245 } (Master Canteen Square, Bhubaneswar)
       - Default zoom: 14
       - Map style: dark theme (use Google Maps MapId or custom styles array for dark civic aesthetic)
       - Add one placeholder AdvancedMarkerElement at center coordinates
       - Initialize MarkerClusterer with empty markers array (ready for Phase 2 data)
       - Map container: full viewport height minus header (h-[calc(100vh-64px)])
    4. Update App.jsx to render <Map /> component
    5. Add VITE_GOOGLE_MAPS_API_KEY to .env and .env.example
    - Use AdvancedMarkerElement (not deprecated Marker class) — Maps JS API v3.55+
    - If Maps API key billing setup is a genuine blocker (card required, no free tier): switch to React-Leaflet per SPEC fallback (document the swap)
    - DO NOT add real ticket data yet — just the map shell with one static pin
    - Ensure map renders at correct Bhubaneswar coordinates, not defaulting to 0,0
  </action>
  <verify>
    Browser at localhost:5173 → Google Maps renders centered on Bhubaneswar with visible dark theme, one marker pin visible at city center. No "This page can't load Google Maps correctly" error banner.
  </verify>
  <done>
    - Map renders at correct Bhubaneswar coordinates (20.2961, 85.8245)
    - Dark theme applied (not default light map)
    - MarkerClusterer initialized (no console errors about undefined)
    - VITE_GOOGLE_MAPS_API_KEY not visible in committed source code
  </done>
</task>

<task type="auto">
  <name>Dockerfile + local container build + Cloud Run deploy</name>
  <files>
    civix-agent/Dockerfile           ← new
    civix-agent/.dockerignore        ← new
    civix-agent/server/server.js     ← update to serve Vite build in production
  </files>
  <action>
    DOCKERFILE (multi-stage):
    Stage 1 — Build Vite frontend:
      FROM node:20-alpine AS builder
      WORKDIR /app/client
      COPY client/package*.json .
      RUN npm ci
      COPY client/ .
      RUN npm run build
      # Output: /app/client/dist/

    Stage 2 — Production server:
      FROM node:20-alpine
      WORKDIR /app
      COPY server/package*.json ./server/
      RUN cd server && npm ci --omit=dev
      COPY server/ ./server/
      COPY --from=builder /app/client/dist ./client/dist
      EXPOSE 8080
      ENV PORT=8080
      CMD ["node", "server/server.js"]

    UPDATE server.js for production:
      const path = require('path')
      In production (NODE_ENV=production), serve static files:
        app.use(express.static(path.join(__dirname, '../client/dist')))
        app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))
      IMPORTANT: Static serving must come AFTER all /api routes, not before

    .dockerignore:
      node_modules/
      .env
      .git/
      client/node_modules/
      server/node_modules/

    LOCAL TEST:
      docker build -t civix-agent .
      docker run -p 8080:8080 --env-file .env -e NODE_ENV=production civix-agent
      curl http://localhost:8080/api/health → {"status":"ok",...}
      Browser http://localhost:8080 → Vite app loads (Maps won't work yet — key restricted to Cloud Run URL)

    CLOUD RUN DEPLOY:
      gcloud run deploy civix-agent \
        --source . \
        --region asia-south1 \
        --allow-unauthenticated \
        --set-env-vars="GEMINI_API_KEY=...,FIREBASE_PROJECT_ID=...,..." \
        --platform managed
      (Use --source for automatic buildpack detection, or push container manually with gcloud builds submit)
    
    - PORT must be 8080 — Cloud Run requires this
    - NODE_ENV=production must be set in Cloud Run env vars
    - All .env values must be set as Cloud Run env vars (not in Dockerfile — never commit secrets)
    - After Cloud Run URL is known: update Google Maps API key restriction to allow the Cloud Run domain
  </action>
  <verify>
    1. docker run locally: curl http://localhost:8080/api/health → {"status":"ok"}
    2. Cloud Run URL (e.g. https://civix-agent-xxxx.run.app/api/health) → {"status":"ok"}
    3. Cloud Run URL loads the Vite React app in browser (no blank page)
    4. gcloud run services describe civix-agent → status: Ready
  </verify>
  <done>
    - Dockerfile builds without errors
    - Local container serves both /api/health and the Vite frontend on :8080
    - Cloud Run service is deployed and publicly accessible
    - /api/health returns ok on the public Cloud Run URL
    - NODE_ENV=production confirmed in Cloud Run service env vars
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Phase 1 full stack verification</name>
  <action>
    User verifies the complete Phase 1 stack is functional:
    1. Open the Cloud Run public URL in browser — does the app load?
    2. Open browser devtools Network tab — is GEMINI_API_KEY or FIREBASE_PRIVATE_KEY visible anywhere? (Must be NO)
    3. Open Firebase console — does the healthCheck Firestore collection have a document?
    4. Is the map centered on Bhubaneswar (not a blank grey square or 0,0 coordinates)?
    Report pass/fail for each check.
  </action>
  <verify>User confirms all 4 checks pass</verify>
  <done>All infrastructure verified live. Ready for Phase 2.</done>
</task>

## Success Criteria
- [ ] Google Maps renders on localhost:5173 centered on Bhubaneswar with dark theme
- [ ] Dockerfile builds locally and container serves app + API on :8080
- [ ] Cloud Run public URL accessible and returns ok on /api/health
- [ ] Zero secrets visible in browser devtools or committed source code
- [ ] User confirms all 4 checkpoint checks pass
