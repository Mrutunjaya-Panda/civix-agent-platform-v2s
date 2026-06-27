# SPEC.md — CivixAgent Project Specification

> **Status**: `FINALIZED`
> **Hackathon**: Coding Ninjas x Google for Developers — Vibe2Ship
> **Problem Statement**: Community Hero – Hyperlocal Problem Solver
> **Last Updated**: 2026-06-27

---

## Vision

CivixAgent replaces the passive "submit and forget" civic complaint form with an **autonomous multi-agent system** that triages, routes, escalates, and closes the loop on hyperlocal infrastructure issues — without requiring a human to manage the pipeline at every step. Citizens in Bhubaneswar (and any Indian urban/semi-urban area) can report a pothole, water leak, or broken streetlight in under 60 seconds; the system autonomously classifies it, deduplicates it, routes it to the right department, escalates it if ignored, and notifies the citizen when it is resolved — all provably, transparently, and in real time.

---

## Goals

1. **Agentic Depth** — Demonstrate a real multi-agent pipeline (Triage → Routing & Escalation → Citizen Engagement) with visible, explainable autonomous decision-making that judges can watch happen live.
2. **Community Transparency** — Give every citizen real-time visibility into all open issues in their neighborhood via a live map, plus a human-readable Agent Activity Feed that proves the system is reasoning, not just storing.
3. **Closed-Loop Resolution** — Complete the full lifecycle: report → classify → route → escalate → resolve → confirm — within a single hackathon demo session using a simulated time-warp control.
4. **Google Technology Showcase** — Maximize legitimate Google tooling (Gemini, Firestore, Firebase Storage, Firebase Auth, Google Maps, Cloud Run) to score the 15% Google Technologies criterion.
5. **Demo-Ready on Day One** — Ship a publicly accessible, pre-seeded, visually stunning application that works flawlessly under live demo conditions.

---

## Non-Goals (Out of Scope for v1)

- NO Real government/municipal API integrations (all department routing is mocked/seeded)
- NO Real-world SLA timing (SLA breach runs only through the "Simulate Time" UI control)
- NO Image-based GPS inference (browser geolocation + manual map-pin tap only)
- NO Separate deployed microservices (all 3 agents run inside a single Express server.js)
- NO Native iOS/Android apps (web-only, mobile-responsive)
- NO Full OAuth / account system (Firebase Anonymous Auth for citizens; passphrase for Municipal Worker)
- NO Payment, monetization, or admin billing features
- NO Separate "AI Orchestrator Logs" persona (replaced by the Agent Activity Feed panel)
- NO Multi-language support
- NO Push notifications (in-app toast + mocked email log entry is sufficient)

---

## Users

### Primary — Urban Citizen (Reporter)
Urban/semi-urban Bhubaneswar resident, ages ~18–45. Notices a civic infrastructure issue during daily routine. Willing to spend 30–60 seconds reporting if friction is low and they trust it leads to action. Mobile-first behavior — reports with a phone camera, on the spot. Low tolerance for forms or mandatory sign-up. Needs immediate visual feedback ("my report appeared on the map") to feel the report "worked."

### Secondary — Municipal Worker (Resolver)
Local authority persona who views AI-drafted, categorized, prioritized grievance briefs in the Municipal Worker dashboard. Marks issues as "Repaired." Activated via a passphrase toggle in the UI — same app, different view.

---

## Tech Stack (Decided and Locked)

| Layer | Technology | Fallback |
|-------|-----------|---------|
| Frontend | React (Vite) + Tailwind CSS | — |
| Backend/Orchestration | Node.js + Express (single server.js) | — |
| AI/LLM | Gemini 2.5 Flash via Google AI Studio API key (aistudio.google.com — no billing card) | — |
| Database + Realtime | Firebase Firestore (onSnapshot listeners) | Supabase (last resort) |
| Image Storage | Cloudinary free tier (cloudinary.com — 25GB free, no credit card) | — |
| Auth | Firebase Anonymous Auth (citizens); passphrase toggle (Municipal Worker) | localStorage UUID (last resort) |
| Maps | React-Leaflet + OpenStreetMap + Leaflet.markercluster (no API key, no billing) | Google Maps JS API (if available) |
| Hosting | Google Cloud Run (Vite + Express unified container) | Vercel/Render (last resort) |

Fallback priority (highest cost to swap to lowest): Gemini API → Cloud Run → Firestore
Note on billing: Gemini (AI Studio key, free), Firestore + Auth (Firebase Spark plan, free), Image Storage (Cloudinary free tier, no card), Maps (Leaflet, free). Cloud Run requires card for identity verification — deliberately deferred to the FINAL phase only.
Note on Firebase Storage: Firebase Storage now requires Blaze (paid) plan — replaced with Cloudinary. ADR-011.

---

## Multi-Agent Architecture

```
[INCOMING CITIZEN EVENT]
         |
         v
+--------------------------+
| Central Orchestrator     |  <-- Express router (server.js)
| (State Validation Node)  |      Typed Events and Real-time State (Firestore)
+--------------------------+
    |          |          |
    v          v          v
+--------+ +----------+ +------------+
| Agent 1| | Agent 2  | | Agent 3    |
| Triage | | Routing &| | Citizen    |
| Vision | | Escalation| | Engagement |
+--------+ +----------+ +------------+
```

### Agent 1 — Triage Agent
- Input: photo (Firebase Storage URL) + location (lat/lng) + optional text note
- Uses Gemini Vision to classify category (Roads / Water / Electricity / Sanitation)
- Severity formula: clamp(((Baseline x 0.5) + (Visual x 0.5)) + ClusterBonus, 1, 10)
  - Baseline: Roads=6, Water=7, Electricity=8, Sanitation=5
  - Visual: Gemini Vision 1-10 damage assessment from photo
  - ClusterBonus: min(nearby_duplicates x 0.5, 2), capped at +2
- Runs spatial-semantic duplicate check (geo-radius query + text/image similarity)
- Emits: TRIAGE_COMPLETE → creates new ticket OR registers Cluster Reinforcement on existing

### Agent 2 — Routing and Escalation Agent
- Input: TRIAGE_COMPLETE event
- Assigns ticket to mocked department based on category
- Drafts structured grievance brief (ticket card view + email body format) via Gemini function-calling
- Monitors simulated ticket age vs. SLA thresholds:
  - HIGH severity (7-10): escalate after 24 simulated hours
  - MEDIUM severity (4-6.9): escalate after 48 simulated hours
  - LOW severity (1-3.9): flag stalled after 72 simulated hours
- Each "Simulate Time" button click = +6 simulated hours
- Emits: ROUTING_UPDATED

### Agent 3 — Citizen Engagement Agent
- Input: status change events (resolved, escalated, verified)
- Fires in-app real-time toast notification to original reporter's browser
- Logs mocked "email dispatched" entry in Agent Activity Feed
- Handles citizen resolution confirmation flow (confirm closes ticket; no response flags for re-escalation)
- Emits: USER_NOTIFICATION_DISPATCHED

All inter-agent payloads enforced via Gemini responseSchema typed contracts.

---

## Department Routing Table

| Category | Department | Mock Contact | Severity Baseline |
|----------|-----------|-------------|------------------|
| Roads | Roads and Infrastructure Dept | roads@civix.demo | 6 |
| Water | Water Supply Board | water@civix.demo | 7 |
| Electricity | Electricity Distribution Board | power@civix.demo | 8 |
| Sanitation | Sanitation and Waste Dept | sanitation@civix.demo | 5 |

Architecture is config-driven — adding new categories requires only a routing table entry, no code changes.

---

## Features (MVP)

### F1 — Smart Triage Agent (Report → Classify → Deduplicate)
Photo + location → Gemini multimodal classification → severity score → duplicate check → new ticket or Cluster Reinforcement

### F2 — Routing and Autonomous Escalation Agent
Department assignment → Gemini-drafted grievance brief (card + email) → SLA monitoring → autonomous escalation without manual intervention

### F3 — Closed-Loop Resolution Flow
Municipal Worker marks "Repaired" → Citizen Engagement Agent fires in-app toast + mocked email log → citizen confirms → ticket closes → no confirmation → re-escalation flag

### F4 — Live Community Map and Verification Feed
Firestore onSnapshot real-time map with Google Maps JS API, severity-colored pins, MarkerClusterer for density, citizen "I see this too" verification (feeds back into severity score)

### F5 — Agent Activity Feed (Transparency Panel)
Collapsible panel showing human-readable log of agent decisions in real time:
- "3 similar reports within 50m detected → merged → priority bumped to HIGH"
- "Ticket #14 unresolved past 24h SLA → autonomously escalated to Tier 2"
- "Email drafted and dispatched to citizen [name] — Resolution confirmed"

---

## Demo Seed Data (Bhubaneswar)

- 20 pre-seeded reports centered on Master Canteen Square / Rajpath area (~20.2961N, 85.8245E)
- Spread across: Saheed Nagar, Kharvel Nagar, Unit 4, Nayapalli, Raj Mahal Square
- 3 duplicate pairs — same-location reports from different citizen names (demos cluster dedup)
- 1 pre-stalled LOW-severity ticket — created with timestamp ~70 simulated hours in the past, shown as "Stalled" on page load
- 1 HIGH-severity pothole cluster — pre-seeded at Tier 2 escalation state
- 1 resolved water leakage — fully closed with citizen confirmation (demos closed-loop on load)
- Pre-seeded tickets visually distinguished from live-submitted reports (subtle pin style + "Demo Data" badge)
- Generated by reproducible scripts/seed.js script

---

## Constraints

- Timeline: Hackathon deadline — all features demo-ready, no partial states at submission
- Budget: Free tier only across all Google services
- Platform: Web-only, mobile-responsive (no native builds)
- Auth: Firebase Anonymous Auth maximum — no full OAuth for v1
- Agents: All 3 as internal Express modules, not separate services
- SLA: Simulated only (no real wall-clock time tracking)
- Location: Browser geolocation + manual map-pin tap (no EXIF GPS extraction)
- Images: Client-side compressed before upload to Firebase Storage

---

## Success Criteria

- [ ] 85% or higher classification accuracy on a 20-30 report test set
- [ ] 90% or higher duplicate suppression rate on intentional same-issue test submissions
- [ ] Report to triage to map pin displayed in under 15 seconds end-to-end live demo
- [ ] Full lifecycle demo completable in under 5 minutes
- [ ] App loads with pre-seeded data showing all 3 lifecycle states (open, escalated, resolved) without setup clicks
- [ ] Zero blank map / auth error / Firestore permission errors during live demo
- [ ] Publicly accessible Google Cloud Run URL operational at submission time

---

## Identity Model

| Persona | Auth Method | Activation |
|---------|------------|-----------|
| Citizen | Firebase Anonymous Auth (silent, auto) | Automatic on first visit |
| Municipal Worker | Same Firebase UID + passphrase toggle in UI | Passphrase entry in UI |

---

## Notification Model

| Event | In-App Toast | Agent Activity Feed |
|-------|-------------|-------------------|
| Report submitted | "Report received and being analyzed" | "Triage Agent processing report #N" |
| Ticket created | "Issue logged — Ticket #N" | "Category: Roads, Severity: 8.2 → Routed to Roads Dept" |
| Cluster reinforcement | "Your report added to existing cluster #N" | "Duplicate detected → Cluster reinforcement, priority bumped" |
| Escalation | "Your issue has been escalated to Tier 2" | "Ticket #N unresolved past Xh SLA → escalated autonomously" |
| Resolved | "Your issue has been marked as Repaired!" | "Email drafted and dispatched to [name] — awaiting confirmation" |
| Confirmed | "Thank you for confirming — ticket closed" | "Ticket #N closed. Loop complete." |
