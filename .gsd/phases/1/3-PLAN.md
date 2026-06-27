---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: React-Leaflet Map + Dockerfile Local Verification

## Objective
Get React-Leaflet + OpenStreetMap rendering with a Bhubaneswar-centered map and Leaflet.markercluster initialized (zero API key, zero billing), and verify the unified Vite+Express Dockerfile builds and runs correctly on localhost. Cloud Run deployment is intentionally deferred to Phase 6 — the card step happens once, deliberately, after everything is built and tested.

## Context
- .gsd/SPEC.md — Maps: React-Leaflet + OpenStreetMap (primary, no API key)
- .gsd/DECISIONS.md — ADR-007 updated (Leaflet.markercluster), ADR-009 (Cloud Run timing)
- civix-agent/client/src/ — add Map component
- civix-agent/ root — Dockerfile, .dockerignore

## Prerequisites
- Plans 1.1 and 1.2 must be complete and all services verified

## Tasks

<task type="auto">
  <name>React-Leaflet map component with Leaflet.markercluster</name>
  <files>
    civix-agent/client/src/components/Map.jsx   <- new
    civix-agent/client/src/App.jsx              <- import Map component
  </files>
  <action>
    1. cd client && npm install react-leaflet leaflet leaflet.markercluster
    2. Also install types for leaflet (CSS needed):
       Add to client/src/index.css:
         @import "leaflet/dist/leaflet.css";
         @import "leaflet.markercluster/dist/MarkerCluster.css";
         @import "leaflet.markercluster/dist/MarkerCluster.Default.css";
    3. Fix Leaflet default icon broken images (known Vite issue):
       In Map.jsx, before the component:
         import L from 'leaflet'
         import iconUrl from 'leaflet/dist/images/marker-icon.png'
         import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
         import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
         delete L.Icon.Default.prototype._getIconUrl
         L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })
    4. Create client/src/components/Map.jsx:
       - Use <MapContainer> from react-leaflet, center: [20.2961, 85.8245], zoom: 14
       - <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
       - Use useRef + useEffect to initialize MarkerClusterGroup from leaflet.markercluster:
           const mcg = L.markerClusterGroup()
           mapRef.current.addLayer(mcg)  <- ready for Phase 2 data binding
       - Add one placeholder L.marker([20.2961, 85.8245]).bindPopup('CivixAgent HQ').addTo(map)
       - Dark map aesthetic: use CartoDB dark tiles instead of OSM default:
           url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
       - Map container: h-[calc(100vh-64px)] w-full
    5. Update App.jsx to render <Map /> component
    - DO NOT use @googlemaps/markerclusterer — that is the Google Maps library
    - USE leaflet.markercluster (the Leaflet-native clustering library)
    - CartoDB dark tiles require no API key and are free for open-source/hackathon use
    - DO NOT add real ticket data yet — just the map shell with one static marker
    - The map must NOT show a grey blank square — common cause is missing Leaflet CSS imports
  </action>
  <verify>
    Browser at localhost:5173: Dark-themed map renders centered on Bhubaneswar (20.2961, 85.8245). One marker visible at city center. Clicking marker shows "CivixAgent HQ" popup. No console errors about icon images or missing CSS.
  </verify>
  <done>
    - Map renders at correct Bhubaneswar coordinates on dark CartoDB tiles
    - Marker icon displays correctly (not broken image)
    - MarkerClusterGroup initialized (no console errors)
    - Zero API keys required — confirmed by checking .env.example has no MAPS key
  </done>
</task>

<task type="auto">
  <name>Dockerfile + local container build verification (dev only)</name>
  <files>
    civix-agent/Dockerfile           <- new
    civix-agent/.dockerignore        <- new
    civix-agent/server/server.js     <- update to serve Vite build in production
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

    UPDATE server/server.js for production mode:
      const path = require('path')
      When NODE_ENV=production:
        app.use(express.static(path.join(__dirname, '../client/dist')))
        app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/dist/index.html')))
      CRITICAL: Static serving catch-all must come AFTER all /api/* routes

    .dockerignore:
      node_modules/
      .env
      .git/
      client/node_modules/
      server/node_modules/
      client/dist/

    LOCAL TEST ONLY (no Cloud Run yet):
      docker build -t civix-agent .
      docker run -p 8080:8080 --env-file .env -e NODE_ENV=production civix-agent
      curl http://localhost:8080/api/health

    - PORT must be 8080 — Cloud Run will require this later
    - NODE_ENV=production must work correctly — test it locally now
    - DO NOT push to Cloud Run in this plan — that is Phase 6 only
    - If Docker Desktop is not installed locally, skip the docker run test and just
      verify the Dockerfile syntax is valid: docker build succeeds = good enough for Phase 1
  </action>
  <verify>
    docker build -t civix-agent . completes without errors (all layers cached properly).
    docker run -p 8080:8080 --env-file .env -e NODE_ENV=production civix-agent:
    curl http://localhost:8080/api/health → {"status":"ok","service":"CivixAgent API"}
    Browser http://localhost:8080 → Vite React app loads with Leaflet map visible.
  </verify>
  <done>
    - Dockerfile builds without errors
    - Local container serves /api/health on :8080
    - Local container serves the Vite frontend on :8080 (not just the API)
    - Leaflet map renders correctly inside the container
    - No secrets baked into the Docker image (verified: docker inspect shows no env keys)
  </done>
</task>

## Success Criteria
- [ ] React-Leaflet dark map renders on localhost:5173 centered on Bhubaneswar
- [ ] Marker icon displays correctly (not broken), popup works
- [ ] MarkerClusterGroup initialized with no console errors
- [ ] Dockerfile builds successfully and container passes /api/health check
- [ ] Container serves Vite frontend correctly on :8080
- [ ] Zero API keys or billing setup required for any of the above

## Note on Cloud Run
Cloud Run deployment is intentionally NOT in this plan. It will be the final task of Phase 6, after the full application is built, all features tested locally and on Firebase, seed data loaded, and the demo flow verified end-to-end. The card step happens once, deliberately, at the very end.
