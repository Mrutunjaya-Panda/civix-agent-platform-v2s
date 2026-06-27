# PRD: CivixAgent — Autonomous Hyperlocal Civic Issue Manager

**Hackathon:** Coding Ninjas x Google for Developers — Vibe2Ship
**Problem Statement Selected:** Community Hero – Hyperlocal Problem Solver
**Document Version:** 1.0

---

## 1. Problem Statement

### What problem does this solve?
Communities routinely face recurring infrastructure issues — potholes, water leakages, damaged streetlights, overflowing waste bins — but the process of reporting them is fragmented, opaque, and passive. Citizens report an issue once, then have no visibility into whether it was received, prioritized, or ever resolved. There is no system that actively reasons about incoming reports, deduplicates redundant noise, escalates neglected issues, or closes the loop back to the citizen.

CivixAgent solves this by replacing a passive "submit and forget" reporting form with an **autonomous multi-agent system** that triages, routes, escalates, and follows up on civic issues without requiring a human to manually manage the pipeline at every step.

### Who experiences this problem?
- **Citizens** who notice and want to report local infrastructure problems but currently have no reliable way to track outcomes, leading to reporting fatigue ("why bother, nothing happens").
- **Municipal/civic workers** who receive reports through fragmented, non-prioritized channels (calls, scattered emails, paper complaints) with no severity ranking or duplicate-detection, making triage manually expensive.
- **Communities as a whole**, who lack transparency into which issues are being worked on, which are stalled, and which are simply ignored.

### Why does this problem matter now?
Civic infrastructure complaint systems (where they exist at all) are largely digitized forms with no intelligence layer — they store data but don't reason over it. With multi-modal LLMs (image understanding + structured reasoning + function calling) now mature and cheaply accessible via the Gemini API, it's newly practical to build a system that doesn't just log a report, but actively classifies, deduplicates, prioritizes, and escalates it autonomously — turning a static complaint box into an accountable, self-managing pipeline.

---

## 2. Target User

### Primary user
**Urban and semi-urban residents (ages ~18–45) in a neighborhood or municipal ward** who encounter visible public infrastructure issues in their daily routine (commuting, walking, errands) and are willing to spend 30–60 seconds reporting them if the process is fast and they believe it leads to action.

**Secondary user (for the demo's closed-loop requirement):** A municipal worker / local authority persona who receives AI-drafted, categorized, prioritized issue briefs and marks issues as resolved.

### Goals, frustrations, and behaviors
- **Goals:** Report an issue in seconds without filling long forms; know that the report is going somewhere real; see progress without having to follow up manually; feel their voice/vote matters when others confirm the same issue.
- **Frustrations:** Existing reporting channels (calls, generic government apps, social media posts) feel like shouting into a void — no acknowledgment, no status, no resolution visibility. Duplicate effort (multiple people reporting the same pothole with no shared tracking) feels wasteful.
- **Behaviors:** Primarily mobile-first reporting (photo taken in the moment, on the spot). Low tolerance for friction — multi-step forms or mandatory account creation before reporting will cause drop-off. High trust sensitivity — wants to see their report visibly logged (on a map, with a status) almost immediately to feel it "worked."

---

## 3. Core Features (MVP Only)

These are the **3–5 must-have features** for v1. Everything else is explicitly deferred (see Section 4: Out of Scope).

### Feature 1: Smart Triage Agent (Report → Classify → Deduplicate)
Citizens submit a photo + location (auto-captured via browser geolocation, manual map-pin fallback if denied/unavailable) with an optional short text note. The Triage Agent uses Gemini's multimodal capabilities to classify the issue type (Roads, Water, Electricity, Sanitation), assign an explainable severity score (1–10, based on issue type baseline risk + visual scale cues + existing nearby report count), and run a spatial-semantic duplicate check (geo-radius query + image/text similarity) to either create a new ticket or register the submission as a "Cluster Reinforcement" on an existing ticket.

*Why it's must-have:* This is the core agentic reasoning step and the primary driver of the "Agentic Depth" and "Innovation" scoring criteria — without it, the app is just a form with a map.

### Feature 2: Routing & Autonomous Escalation Agent
Once triaged, the Routing Agent assigns the ticket to a (mocked, seeded) civic department based on category, drafts a structured grievance brief using Gemini function-calling, and tracks ticket age. A demo-facing **"Simulate Time"** control advances a simulated clock; if a ticket crosses its SLA threshold unresolved, the agent autonomously re-evaluates and escalates the ticket's status and priority without manual intervention, and re-drafts the brief for higher-tier attention.

*Why it's must-have:* This is the single clearest "watch the agent act on its own" demo moment, and it's what proves autonomous decision-making rather than static classification.

### Feature 3: Closed-Loop Resolution Flow
A **Municipal Worker Mode** (persona switcher in the UI) lets a second role view AI-drafted briefs, see prioritized tickets, and mark an issue "Repaired." This triggers the Citizen Engagement Agent to notify the original reporter and request confirmation. Citizen confirmation closes the ticket; if not confirmed within a window, it stays open for re-escalation.

*Why it's must-have:* Closes the lifecycle gap — without this, the system can escalate forever with no resolution path, which is both a real product flaw and a guaranteed question from judges.

### Feature 4: Live Community Map & Verification Feed
A real-time map (Firestore `onSnapshot` listeners — no manual refresh) shows all open issues as pins, color-coded by severity/status. Nearby citizens can verify ("I see this too") an existing issue rather than create a duplicate; verification count feeds back into the severity/priority score. Pin updates and verification counts reflect live across all open clients.

*Why it's must-have:* Delivers the explicitly-required "Community verification," "Real-time issue tracking," and "Geo-location and mapping" features from the original problem statement, and is a strong live-demo moment (judges watch a pin update in real time across two screens).

### Feature 5: Agent Activity Feed (transparency panel)
A lightweight, collapsible panel (not a separate full persona) showing a human-readable log of agent decisions as they happen — e.g., *"Detected 3 similar reports within 50m → merged → priority bumped to HIGH"* or *"Ticket #14 unresolved past SLA → autonomously escalated to Tier 2."*

*Why it's must-have:* This is the feature that visibly proves agentic reasoning to judges rather than asking them to take your word for it — directly serves the 20% Agentic Depth criterion.

### Nice to Have (NOT required for v1 launch)
- Gemini Vision landmark cross-referencing for location verification (stretch goal only if `navigator.geolocation` + manual pin isn't sufficient)
- Gamification/leaderboard scoring beyond a simple per-user verified-report counter
- Predictive hotspot analytics beyond basic cluster-density flagging
- Push notifications (in-app/email notification is sufficient for v1)
- Multi-language support

---

## 4. Out of Scope

Explicitly **not building** in v1 — stated here to prevent scope creep when prompting AI coding tools:

- ❌ **Real government/municipal API integrations.** Department routing uses a small seeded/mocked dataset of categories and contact templates, not live integration with any real civic authority system.
- ❌ **Real-world SLA timing.** SLA breach detection runs only through the simulated "Time-Warp" clock control, not real elapsed wall-clock days.
- ❌ **Image-based location inference as the primary geolocation method** (e.g., detecting GPS from EXIF metadata or inferring "this photo was taken inside a vehicle/home"). Browser geolocation + manual pin is the only required mechanism.
- ❌ **Three fully separate deployed microservices for the three agents.** All agents run within a single deployed application with an internal orchestration layer — one stable, publicly accessible Google Cloud URL.
- ❌ **Native mobile apps (iOS/Android).** Web-only, mobile-responsive.
- ❌ **User authentication beyond lightweight identification.** A simple name/session-based identity (no full OAuth/account system) is sufficient for v1 unless time permits Google Auth.
- ❌ **Payment, monetization, or admin billing features** — not relevant to this product.
- ❌ **Three-way persona switcher with a fully separate "AI Orchestrator Logs" mode.** Replaced by the lightweight Agent Activity Feed panel (Feature 5) accessible from both Citizen and Municipal Worker modes.

---

## 5. Success Metrics

How we'll know the product (and the hackathon submission) is working:

1. **Agent Decision Accuracy Rate** — % of submitted reports correctly classified (category + severity) on first pass without requiring manual override, measured against a test set of ~20–30 seeded sample reports. Target: ≥85%.
2. **Duplicate Suppression Rate** — % of intentionally duplicate test submissions (same issue, different citizen) correctly merged into a Cluster Reinforcement rather than creating a redundant ticket. Target: ≥90% on test cases.
3. **End-to-End Loop Completion Time (Demo Metric)** — time taken, live, to go from "citizen submits report" → "agent triages, routes, and displays on map" with no manual intervention. Target: under 15 seconds, to prove autonomous, non-blocking agent execution during the live demo.

*(Post-hackathon / real-world framing, if extended: Daily Active Reporters, Issue Resolution Rate, Average Time-to-Resolution — included here for completeness but not the primary judging-window metrics.)*

---

## 6. Technical Assumptions

### Preferred tech stack — Google-ecosystem-first, by design
This hackathon scores "Usage of Google Technologies" at 15%, so the stack deliberately maximizes legitimate Google tooling rather than treating it as incidental. Below is the **primary stack**, followed by an explicit **fallback contingency** in case of billing, quota, or access issues during the build — decided now, not improvised under deadline pressure.

**Primary stack (Google-first):**
- **Frontend:** React.js (Vite framework) — chosen explicitly over Next.js for hackathon velocity. Vite eliminates SSR/CSR boundary bugs, hydration errors, and server/client component confusion that commonly waste debugging time under deadline pressure, and AI coding tools (Antigravity, Cursor, Claude Code) generate cleaner, more predictable output against Vite's simpler build model. Tailwind CSS for styling.
- **Backend/Orchestration:** A **unified Node.js + Express backend** running as a single `server.js` process within the same monorepo as the frontend — not a separate deployed service. This Express layer *is* the Central Orchestrator: it exposes simple REST endpoints (e.g., `POST /api/report`), imports the three agent modules as internal JavaScript utilities, and securely holds the Gemini API key server-side (never exposed client-side, preventing key leakage/abuse via browser devtools). This structure compiles into a single container for straightforward Cloud Run deployment.
- **Database & Real-time layer:** Firebase Firestore — native real-time listeners (`onSnapshot`) power the live map and verification feed without manual refresh
- **AI/LLM layer:** Gemini API (Gemini 2.5 Flash or current equivalent) for multimodal classification, `responseSchema` structured outputs between agents, and function-calling for drafted briefs
- **Maps:** Google Maps Platform (JavaScript API) for rendering and pins, as primary — set up correctly once with the API key restricted to your specific deployed domain (a one-time, ~5-minute configuration step) to eliminate the "blank map" failure mode at its actual root cause, rather than avoiding the integration entirely. This preserves a third visible Google-technology touchpoint (alongside Gemini + Firestore) for the 15% Google Technologies score.
- **Hosting/Deployment:** Google Cloud Run (or Firebase App Hosting) — satisfies the mandatory "deployed on Google Cloud, publicly accessible" submission requirement. The unified Vite + Express structure compiles cleanly into a single container, simplifying this deployment step significantly versus a Next.js SSR deployment.
- **Auth (optional):** Firebase Authentication if time permits; otherwise a lightweight session-based identifier for v1

**Fallback contingency plan — IF Google Cloud billing, free-tier quota limits, or API access becomes a blocker mid-build:**
- **Gemini API → stays as-is regardless.** This is non-negotiable: it's the core "Agentic Depth" and "Google Technologies" engine. If the standard Gemini API key hits issues, fall back to **Google AI Studio's free-tier API key** before considering any non-Google LLM, since switching the model provider entirely would directly cost the 15% Google Technologies score.
- **Firestore → Supabase (Postgres) or a lightweight in-memory/local JSON store for the demo only**, if Firestore billing/quota becomes a blocker. Real-time listeners would need to be re-implemented via Supabase's real-time subscriptions (similar capability, different syntax) — acceptable as a last resort, but document this substitution honestly in the Google Doc submission if it happens, since "Usage of Google Technologies" scoring depends on what's actually deployed.
- **Cloud Run → Vercel or Render**, if Google Cloud deployment/billing setup becomes a blocker close to deadline. This is the most acceptable fallback since hosting platform is the least-weighted Google-technology touchpoint compared to Gemini itself — but it should be the **last** piece swapped, not the first, since "deployed on Google Cloud" is explicitly named in the mandatory submission requirements.
- **Google Maps Platform → React-Leaflet + OpenStreetMap**, if Maps Platform billing/API-key setup is a blocker despite correct domain-restricted configuration. Leaflet requires no API key and cannot fail due to billing/restriction issues, making it a clean, zero-risk substitute. This swap costs you one visible Google-technology touchpoint, but Gemini + Firestore + Cloud Run alone still represent solid, defensible Google Technologies usage for the 15% criterion — so this remains an acceptable trade if Maps setup genuinely becomes a time sink, just not the default starting choice.

**Priority order if forced to fall back (highest cost to swap → lowest):** Gemini API (avoid swapping at almost any cost) → Cloud Run hosting (swap only if truly blocked) → Firestore (acceptable swap, document it) → Maps Platform (swappable to Leaflet if setup becomes a genuine time sink, lowest scoring impact of the four).

### Platform
**Web, mobile-responsive.** Mobile-first design priority (most real-world reporting happens on a phone in the moment), but no native app build — a responsive web app accessed via mobile browser satisfies the use case and the "publicly accessible deployed link" submission requirement.

### Integrations needed
- **Gemini API** — core reasoning/classification/drafting engine across all three agents (see fallback note above — Google AI Studio key as backup, not a different model provider)
- **Browser Geolocation API** (`navigator.geolocation`) — primary location capture; manual map-pin tap as fallback
- **Google Maps Platform (JavaScript API)** — map rendering, pin display; requires a one-time API key restricted to the deployed domain (React-Leaflet + OpenStreetMap as documented fallback only, if billing/setup genuinely blocks progress)
- **Google Cloud Run (or Firebase App Hosting)** — deployment target, satisfying the mandatory submission requirement (Vercel/Render as documented fallback only)
- **Firebase Authentication (optional/lightweight)** — only if time permits; otherwise a simple session-based identifier is acceptable for v1
- *Not needed:* Stripe or any payment processor; OpenAI API or other non-Google LLM providers (Gemini is the required/preferred model family for this Google-co-hosted hackathon, and should not be swapped even under the fallback plan above)

---

## 7. Open Questions

Things still needing a decision before or during development:

1. **Severity scoring formula precision** — what exact weighting between issue-type baseline risk, visual scale cues, and duplicate/cluster count produces the most defensible, explainable severity score? Needs a concrete rubric defined and hardcoded before demo day so it's consistent and explainable in Q&A.
2. **Seeded department/category dataset** — what specific mock list of departments (e.g., Roads Dept, Water Board, Electricity Board, Sanitation Dept) and routing rules will we hardcode, and do we need placeholder contact "email" targets for the drafted briefs to look complete?
3. **Identity/session model** — is a full Google Auth (Firebase Auth) integration worth the build time for the demo, or is a lightweight name-based session sufficient to support per-user verification counts and the Municipal Worker persona switch?
4. **SLA threshold values** — what simulated time threshold (e.g., 48 simulated hours) triggers autonomous escalation, and should this vary by severity (high-severity issues escalate faster than low-severity ones)?
5. **Seed data volume for demo** — how many pre-seeded sample reports/tickets do we load before the live demo so the map and activity feed don't look empty, and do we generate these manually or have an agent generate plausible synthetic reports for testing?

---

## Appendix: Multi-Agent Architecture Reference

```
[INCOMING CITIZEN EVENT]
         |
         v
+--------------------------+
| Central Orchestrator     |  <-- Express router (single server.js process)
| (State Validation Node)  |      Typed Events & Real-time State (Firestore)
+--------------------------+
    |          |          |
    v          v          v
+--------+ +----------+ +------------+
| Agent 1| | Agent 2  | | Agent 3    |
| Triage | | Routing &| | Citizen    |
| (Vision| | SLA      | | Engagement |
+--------+ +----------+ +------------+
```

- **Implementation note:** The Central Orchestrator is implemented as an **Express router** within the unified `server.js` backend. It imports the three agent modules as internal JavaScript utilities/functions (not separate services or processes), receives citizen events via REST endpoints (e.g., `POST /api/report`), and reads/writes state through Firebase Firestore listeners for real-time propagation to connected clients.
- **Agent 1 (Triage):** classify category + severity, spatial-semantic dedup check → emits `TRIAGE_COMPLETE`
- **Agent 2 (Routing & Escalation):** department assignment, brief drafting, SLA monitoring via `SLA_CHECK_TICK` → emits `ROUTING_UPDATED`
- **Agent 3 (Citizen Engagement):** notifications, verification requests, resolution confirmation, leaderboard updates → emits `USER_NOTIFICATION_DISPATCHED`
- All inter-agent payloads enforced via Gemini `responseSchema` typed contracts to prevent malformed-data crashes downstream.
- Deployed as **one application, one public URL, one container** — React (Vite) frontend + Express backend compiled together, deployed via Cloud Run — with agents as internal orchestrated modules, not separate microservices.
