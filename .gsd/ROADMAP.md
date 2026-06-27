# ROADMAP.md — CivixAgent

> **Current Phase**: Not Started
> **Milestone**: v1.0 — Hackathon Submission
> **Last Updated**: 2026-06-27

---

## Must-Haves (from SPEC)

- [ ] Gemini multimodal triage (classify + severity score) working end-to-end
- [ ] Spatial-semantic duplicate detection + Cluster Reinforcement
- [ ] Autonomous SLA escalation via simulated time-warp control
- [ ] Gemini-drafted grievance briefs (card + email format)
- [ ] Firestore onSnapshot real-time map with severity-colored pins
- [ ] Citizen verification ("I see this too") feeding back into severity
- [ ] Agent Activity Feed with live human-readable decision log
- [ ] Municipal Worker persona (passphrase-activated, same app)
- [ ] Closed-loop resolution: Repaired → citizen toast → confirm → close
- [ ] 20-report Bhubaneswar seed data (including stalled, escalated, resolved examples)
- [ ] Google Cloud Run deployment — publicly accessible URL
- [ ] Mobile-responsive design

---

## Phases

### Phase 1: Project Foundation and Infrastructure
**Status**: Not Started
**Objective**: Scaffold the full monorepo, configure all Google services (billing-free), and verify every integration is alive before writing any agent or feature code.
**Deliverables**:
- Vite + React frontend scaffolded with Tailwind CSS and routing skeleton
- Node.js + Express backend (server.js) with health-check endpoint
- Firebase project configured on Spark plan (Firestore, Storage, Anonymous Auth) — no billing card
- Gemini API key (Google AI Studio, aistudio.google.com) secured server-side, test call succeeds
- React-Leaflet + OpenStreetMap map renders on Bhubaneswar (no API key, no billing)
- Dockerfile builds locally and serves app+API on :8080 (Cloud Run deploy deferred to Phase 6)
- Environment variable management (.env, .env.example)
- Git repo clean with initial commit

**Requirements**: SPEC Tech Stack, SPEC Constraints (free-tier dev, single container)
**Estimated complexity**: Medium — configuration-heavy, no feature code yet
**Billing note**: Zero billing card steps in this phase. Firebase Spark + AI Studio + Leaflet = 100% free.

---

### Phase 2: Core Data Model and Real-Time Layer
**Status**: Not Started
**Objective**: Define the Firestore schema, implement onSnapshot real-time listeners, and get the live map rendering with static pins before adding agent intelligence.
**Deliverables**:
- Firestore collections schema: tickets, clusters, activityFeed, users
- Firestore security rules (Anonymous Auth-gated writes)
- onSnapshot listener wired to React map state
- React-Leaflet rendering with Leaflet.markercluster (real Firestore data now)
- Severity-colored pin system (color scale: green=low, yellow=medium, red=high, grey=resolved)
- Ticket detail sidebar/modal (static data for now)
- Firebase Storage upload utility (client-side image compression)
- Persona switcher UI (Citizen / Municipal Worker passphrase gate)

**Requirements**: SPEC F4 (Live Map), SPEC Identity Model, SPEC Notification Model (structure)
**Dependencies**: Phase 1 complete

---

### Phase 3: Agent 1 — Triage Agent (Classify, Score, Deduplicate)
**Status**: Not Started
**Objective**: Build the core agentic reasoning step — photo submission flows through Gemini multimodal classification, severity scoring, and spatial-semantic duplicate detection, resulting in a new ticket or Cluster Reinforcement appearing live on the map.
**Deliverables**:
- POST /api/report endpoint in Express
- Firebase Storage image upload (client-side compress → upload → get URL)
- Browser geolocation capture + manual map-pin fallback UI
- Gemini Vision classification (category + visual severity) with responseSchema
- Severity formula implementation: clamp(((Baseline x 0.5) + (Visual x 0.5)) + ClusterBonus, 1, 10)
- Spatial dedup check (geo-radius query within Firestore)
- Semantic dedup check (text/embedding similarity on description)
- Cluster Reinforcement logic (increment duplicate count, recalculate severity)
- Ticket written to Firestore → onSnapshot triggers map pin update
- Agent Activity Feed entry written for every triage decision
- End-to-end latency target: report to map pin under 15 seconds

**Requirements**: SPEC F1, SPEC Agent 1, SPEC Success Criteria (15s target, 85% accuracy, 90% dedup)
**Dependencies**: Phase 2 complete

---

### Phase 4: Agent 2 — Routing and Escalation Agent + Time-Warp Control
**Status**: Not Started
**Objective**: Build the "watch the agent act on its own" demo moment — department routing, Gemini-drafted briefs (card + email), and autonomous SLA escalation triggered by the Simulate Time control.
**Deliverables**:
- Config-driven department routing table (4 departments, extensible)
- Gemini function-calling for grievance brief generation (ticket card JSON + email body string)
- Brief rendering in Municipal Worker view (card + email copy)
- Simulated clock state stored in Firestore (simulatedHours field)
- "Simulate Time" button (+6h per click) in Municipal Worker and demo panel
- SLA monitoring logic: HIGH 24h / MEDIUM 48h / LOW 72h thresholds
- Autonomous escalation: status update + brief re-draft + Activity Feed entry
- Ticket status progression: Open → In Progress → Escalated (Tier 2) → Resolved
- Agent Activity Feed entries for routing and escalation events

**Requirements**: SPEC F2, SPEC Agent 2, SPEC SLA thresholds, SPEC Department Routing Table
**Dependencies**: Phase 3 complete

---

### Phase 5: Agent 3 — Citizen Engagement and Closed-Loop Resolution
**Status**: Not Started
**Objective**: Close the lifecycle gap — municipal worker resolves a ticket, citizen gets notified in-app, confirms resolution, ticket closes. The full loop visible to judges.
**Deliverables**:
- Municipal Worker "Mark as Repaired" action
- Real-time in-app toast notification to original citizen's browser (Firestore onSnapshot → toast)
- Mocked "Email dispatched" log entry in Agent Activity Feed
- Citizen confirmation button (appears when their ticket is marked Repaired)
- Confirmation flow: confirm → status = Closed, Activity Feed: "Loop complete"
- No-confirmation flow: ticket stays open, flagged for re-escalation after timeout
- Citizen verification ("I see this too") on existing tickets with severity feedback
- Per-citizen verification count visible in their profile/activity summary

**Requirements**: SPEC F3, SPEC F5, SPEC Agent 3, SPEC Notification Model
**Dependencies**: Phase 4 complete

---

### Phase 6: Seed Data, Demo Polish, and Cloud Run Deployment
**Status**: Not Started
**Objective**: Load all pre-seeded Bhubaneswar demo data, apply full visual polish, validate the complete demo flow end-to-end, and deploy to Cloud Run with a public URL.
**Deliverables**:
- scripts/seed.js — reproducible Firestore seed script
  - 20 reports across Bhubaneswar neighborhoods
  - 3 duplicate pairs (cluster dedup demo)
  - 1 pre-stalled LOW ticket (70 simulated hours old, shown Stalled on load)
  - 1 HIGH pothole cluster at Tier 2 escalation
  - 1 resolved water leakage with citizen confirmation
  - Demo Data visual distinction (subtle pin marker + badge)
- Full visual design polish (dark mode, glassmorphism, smooth animations, micro-interactions)
- Mobile-responsive layout verified on 375px viewport
- Agent Activity Feed real-time animation (entries slide in, not static)
- Demo script / flow tested: submit → classify → route → simulate escalation → resolve → confirm
- Dockerfile finalized (Vite build + Express server in one container)
- Full local+Firebase end-to-end demo flow verified before any cloud deploy
- Cloud Run deployment — DELIBERATE FINAL STEP (requires billing card for identity verification once)
  - All env vars set in Cloud Run (Gemini key, Firebase config — no Maps key needed)
  - Public URL verified: /api/health returns ok, app loads, Firestore onSnapshot works
  - This is the only billing-card step in the entire project, done once, at the end

**Requirements**: SPEC Demo Seed Data, SPEC Success Criteria (zero errors during demo), SPEC Constraints
**Dependencies**: Phase 5 complete

---

## Phase Dependency Map

```
Phase 1 (Infrastructure)
    |
Phase 2 (Data Model + Real-Time Layer)
    |
Phase 3 (Agent 1 — Triage)
    |
Phase 4 (Agent 2 — Routing + Escalation)
    |
Phase 5 (Agent 3 — Citizen Engagement)
    |
Phase 6 (Seed + Polish + Deploy)
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Google Maps API key billing/restriction issues | Medium | High | Fallback to React-Leaflet (documented) |
| Gemini API rate limits during demo | Low | Critical | Cache last triage result; AI Studio key as backup |
| Firestore onSnapshot latency spikes | Low | High | Optimistic UI updates before Firestore confirms |
| Cloud Run cold start on demo day | Medium | Medium | Keep-alive ping configured, test before demo |
| Image upload size exceeding free tier | Low | Low | Client-side compression to <500KB before upload |
| 15-second triage target missed | Medium | High | Parallelize Storage upload + Gemini call; show skeleton loading immediately |
