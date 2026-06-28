---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Citizen Report UI + Backend `/api/report` Endpoint

## Objective
Build the citizen-facing "Report an Issue" flow — a full-screen modal/panel with photo upload, geolocation capture, optional text note, and a manual map-pin fallback. Wire this to a new POST `/api/report` Express endpoint that receives the payload and prepares it for the Triage Agent.

## Context
- .gsd/SPEC.md — F1 (Triage), Identity Model
- civix-agent/client/src/App.jsx
- civix-agent/client/src/lib/cloudinary.js
- civix-agent/client/src/components/PersonaSwitcher.jsx
- civix-agent/server/server.js

## Tasks

<task type="auto">
  <name>Citizen Report Modal UI</name>
  <files>
    - civix-agent/client/src/components/ReportModal.jsx
    - civix-agent/client/src/App.jsx
  </files>
  <action>
    Create `ReportModal.jsx` — a slide-up panel (only visible to `persona === 'citizen'`) with:
    1. **Photo input**: `<input type="file" accept="image/*">` — on select, calls `uploadImage(file)` from `cloudinary.js` and shows a preview + the returned `secure_url`.
    2. **Location capture**: A "Use My Location" button that calls `navigator.geolocation.getCurrentPosition`. Display the lat/lng once obtained. Add a fallback text note: "Could not get location — drop a pin on the map" (for now just show the note; actual map-click fallback is a nice-to-have).
    3. **Text note**: A `<textarea>` for optional description.
    4. **Submit button**: Calls POST `/api/report` with `{ imageUrl, location: {lat, lng}, note }` and shows a loading state while waiting.
    5. Add a floating "＋ Report Issue" button to `App.jsx` that opens the modal (only for Citizen persona).
  </action>
  <verify>
    Open http://localhost:5173, switch to Citizen, click "＋ Report Issue", upload a photo, grant location, and verify the form POSTs to localhost:3001/api/report.
    `Invoke-WebRequest http://localhost:3001/api/health` must return 200.
  </verify>
  <done>
    Modal opens, Cloudinary upload returns secure_url, geolocation resolves, and POST /api/report receives the payload (even if it 501s for now).
  </done>
</task>

<task type="auto">
  <name>POST /api/report Express Endpoint (Stub)</name>
  <files>
    - civix-agent/server/server.js
    - civix-agent/server/routes/report.js
  </files>
  <action>
    Create `server/routes/report.js` with the POST `/api/report` handler:
    - Accept body: `{ imageUrl, location: {lat, lng}, note, uid }`
    - Validate required fields (imageUrl, location) — return 400 if missing.
    - For now return `{ status: 'queued', message: 'Triage agent will process shortly' }` (200).
    - Log the incoming payload clearly so we can see it in the terminal.
    Mount the route in `server.js` using `app.use('/api', require('./routes/report'))`.
  </action>
  <verify>
    `Invoke-WebRequest http://localhost:3001/api/report -Method POST -Body '{"imageUrl":"https://example.com/test.jpg","location":{"lat":20.29,"lng":85.82}}' -ContentType 'application/json'`
    Must return HTTP 200 with `{ status: "queued" }`.
    Missing imageUrl must return 400.
  </verify>
  <done>
    /api/report accepts POST, validates, logs, and returns 200 stub response.
  </done>
</task>

## Success Criteria
- [ ] Report Modal opens from App.jsx for Citizen persona only.
- [ ] Photo compresses and uploads to Cloudinary — secure_url returned and shown.
- [ ] Geolocation captured and displayed in the form.
- [ ] POST /api/report returns 200 with `{ status: "queued" }`.
- [ ] Missing imageUrl returns 400.
