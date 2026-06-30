# CivixAgent 🏛️🤖

[![Hackathon: Vibe2Ship](https://img.shields.io/badge/Hackathon-Vibe2Ship-blueviolet?style=flat-square)](https://github.com/Mrutunjaya-Panda/civix-agent-platform-v2s)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-success?logo=google-cloud&style=flat-square)](https://civix-agent-934098648599.us-central1.run.app/)
[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react&style=flat-square)](#)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite&style=flat-square)](#)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&style=flat-square)](#)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-ffca28?logo=firebase&style=flat-square)](#)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-2.5%20Flash-blue?logo=google&style=flat-square)](#)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Autonomous Tri-Agent Infrastructure for Bhubaneswar, India**
> An intelligent, autonomous civic issue routing and verification platform built to bridge the gap between citizens and municipal departments.

> [!TIP]
> **Try it now:** Visit the live demo, click **"Report Issue Here"** to upload an issue, then toggle to **"Worker"** mode in the top-right (passphrase: `civix2026`) to watch the AI agents triage, escalate, and verify repair claims autonomously!

---

## 📌 Table of Contents
1. [🏛️ 1. Project Overview](#️-1-project-overview)
2. [📱 2. How to Use the App](#-2-how-to-use-the-app)
3. [🤖 3. Technical Architecture & Agent Swarm](#-3-technical-architecture--agent-swarm)
4. [🔄 4. Ticket Lifecycle States](#-4-ticket-lifecycle-states)
5. [🧮 5. Severity Formula Explained](#-5-severity-formula-explained)
6. [🛠️ 6. Tech Stack](#️-6-tech-stack)
7. [🧪 7. What is Simulated vs. Real](#-7-what-is-simulated-vs-real)
8. [🚀 8. Future Enhancements](#-8-future-enhancements)
9. [💻 9. Local Setup Instructions](#-9-local-setup-instructions)

---

## 🏛️ 1. Project Overview
In rapidly growing municipalities like Bhubaneswar, civic complaints (e.g., open potholes, leaking pipes, blinking streetlights) are often delayed due to manual triaging errors, high volumes of duplicate reports, and delayed communication. 

**CivixAgent** addresses this problem by deploying an autonomous **Tri-Agent System** that manages the entire lifecycle of a civic issue. It acts as an automated municipal routing office:
- **For Citizens:** It provides a simple, map-based interface to snap a photo, share a location, and report issues without filling out complex forms.
- **For Municipalities:** It autonomously categorizes reports, filters out spatial duplicates, drafts detailed technical briefs with priority actions, escalates issues that breach service level agreements (SLAs), and verifies repair claims using visual intelligence before closing the ticket.
- **The Result:** Faster response times, zero duplicate ticket clutter, objective repair verification, and a closed-loop resolution system that keeps the community informed.

---

## 📱 2. How to Use the App
Follow these step-by-step instructions to experience the full capabilities of CivixAgent. The application features a dual-persona interface (Citizen and Municipal Worker) that allows you to simulate the entire citizen-to-municipality loop in real-time.

### Step 1: Report an Issue as a Citizen
1. Locate the green **"Report Issue Here"** button at the bottom of the map.
2. A modal will pop up. Upload a photo of a civic issue (e.g., a pothole or waste dump).
3. Select the location on the interactive map where the issue was spotted.
4. Add an optional description note (e.g., *"Large water leak flooding the footpath"*).
5. Click **"Submit Civic Report"**.
6. The system will trigger **Agent 1 (Triage)** which classifies the issue, calculates severity, routes it to the correct department, and displays the AI reasoning overlay instantly on the map.

### Step 2: Switch to Municipal Worker Mode
1. In the top-right corner of the screen, click the **Persona Switcher** toggle.
2. Select **"Worker"**.
3. You will be prompted for a passphrase. 
> [!TIP]
> **Worker Passphrase:** Enter **`civix2026`** in the prompt and click **"Unlock"** to access the municipal workspace tools.
4. The interface will switch to Worker Mode, revealing new administrative tools:
   - A floating **"Fast-Forward Time (+6h)"** button at the bottom of the screen.
   - An administrative control panel in the ticket detail sidebar for submitting repair proof.

### Step 3: Administer SLA & Escalate (Fast-Forward Time)
1. Select the ticket you just created (or select the pre-seeded high-severity sinkhole ticket).
2. Look at the ticket age in the sidebar. Click **"Fast-Forward Time (+6h)"** several times.
3. As the simulated age passes SLA thresholds (e.g., 24 hours for High-severity issues), watch the **Agent Transparency Feed** (bottom-left) and the ticket status.
4. **Agent 2 (Routing & Escalation)** will autonomously detect the breach, transition the status to **`ESCALATED`**, and generate a highly urgent grievance brief and email.

### Step 4: Resolve the Ticket (Worker Repair Submission)
1. Select the ticket you wish to resolve.
2. Scroll to the footer in the sidebar to the **"Submit Repair Proof"** section.
3. Upload an image demonstrating that the repair has been completed.
4. Click **"Submit for Verification"**.
5. **Agent 3 (Verification)** will compare the original complaint photo with the repair photo.
   - *If they don't match or the repair is insufficient:* Agent 3 will reject it and log the feedback.
   - *If approved:* The ticket status will transition to **`RESOLVED`**, and a professional citizen-facing recap is generated.

### Step 5: Close the Loop (Citizen Confirmation)
1. Switch the persona switcher back to **"Citizen"**.
2. Open your resolved ticket.
3. You will see the **"Confirm Resolution"** button along with the Agent 3 visual recap and repair photo.
4. Click **"Confirm Resolution"** to permanently close the ticket and change its status to **`CLOSED`**.
> [!NOTE]
> **Auto-Close Inactivity Timeout:** If the citizen does not manually confirm a resolution, the ticket will automatically transition to `CLOSED` after **72 hours** of simulated time.

### Step 6: Reset Demo Data 🔄 (Worker Only)
If you want to clear your test data and restart the demonstration from a clean slate, you can restore the default seeding:
1. Switch the persona switcher in the top-right corner of the screen to **"Worker"** (passphrase: `civix2026`).
2. Inside the **Persona Switcher** panel, look for the **"Admin Controls"** section at the bottom.
3. Click the **"Reset Demo Data"** button.
4. Confirm the destructive action by clicking **"Confirm Reset"** to trigger the system reinitialization.

> [!TIP]
> **What the Reset Does & Why it Exists:** This instantly wipes all current ticket and activity data from the database and restores the original curated demo dataset (the same 20 seeded reports with the pre-built stalled, escalated, and resolved-awaiting-confirmation scenarios). It exists so that evaluators or repeated demo sessions can always start from a clean, consistent state rather than accumulating test clutter.

---

## 🤖 3. Technical Architecture & Agent Swarm
CivixAgent operates using a three-agent system built on top of the modular Express backend and React frontend.

> [!NOTE]
> **Flowchart Color Code Key:** 
> - **Green Nodes:** Citizen actions and user-facing entry points.
> - **Purple Nodes:** Autonomous AI agent decisions and LLM generations.
> - **Orange Nodes:** Municipal worker processes and actions.
> - **Grey Nodes:** System calculations, routing tables, and automated decision branches.

```mermaid
graph TD
    %% Define Styles
    classDef citizen fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff
    classDef agent fill:#6366f1,stroke:#4f46e5,stroke-width:2px,color:#fff
    classDef worker fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#333
    classDef system fill:#64748b,stroke:#475569,stroke-width:2px,color:#fff

    Start([Citizen Submits Issue Report]) --> A1[Agent 1: Triage Agent <br/>Classifies Category & Visual Severity]
    A1 --> DedupCheck{Spatial Dedup Check<br/>Same category within 50m?}
    
    %% Branch: Duplicate Match
    DedupCheck -- Yes: Cluster Hit --> MergeTicket[Merge Report into Existing Ticket<br/>Increment duplicateCount]
    MergeTicket --> CalcClusterBonus[Calculate Cluster Bonus<br/>Math.min duplicateCount * 0.5, 2.0]
    CalcClusterBonus --> RecalcSev[Recalculate Ticket Severity<br/>Formula updated]
    RecalcSev --> ClusteredLog[Write Cluster Log to Activity Feed]
    ClusteredLog --> ReturnClustered[Return status: 'clustered' to Client]
    
    %% Branch: New Ticket
    DedupCheck -- No: Unique Report --> CreateTicket[Create New Ticket<br/>Status: 'new', duplicateCount: 0]
    CreateTicket --> ReturnOk[Return status: 'ok' to Client]
    
    %% Background Work for New Ticket
    ReturnOk --> AsyncAgent2[Agent 2: Routing Agent<br/>Drafts Grievance Brief & Email]
    AsyncAgent2 --> UpdateTicketBrief[Update Ticket with brief details]
    UpdateTicketBrief --> RoutingLog[Write Triage & Routing Logs to Activity Feed]
    
    %% SLA Loop / Fast-Forward
    RoutingLog --> OpenState[Ticket in 'new' status]
    OpenState --> SimulateTime{Fast-Forward Time<br/>Adds +6h simulatedAge}
    
    %% SLA Escalation Branches
    SimulateTime --> SLACheck{Unresolved past SLA?}
    SLACheck -- "Sev >= 7 & Age >= 24h" --> Escalate[Status -> 'escalated']
    SLACheck -- "Sev 4..6.9 & Age >= 48h" --> Escalate
    SLACheck -- "Sev < 4 & Age >= 72h" --> Stall[Status -> 'stalled']
    SLACheck -- No breach --> OpenState
    
    Escalate --> UrgentBrief[Agent 2 Drafts Urgent Brief]
    UrgentBrief --> EscalationLog[Write Escalation Log to Activity Feed]
    EscalationLog --> EscalatedState[Ticket remains open as Escalated]
    
    Stall --> StallLog[Write Stalled Log to Activity Feed]
    StallLog --> StalledState[Ticket remains open as Stalled]
    
    %% Repair Flow
    OpenState --> RepairAction[Worker Uploads Repair Proof<br/>Submit for Verification]
    EscalatedState --> RepairAction
    StalledState --> RepairAction
    
    RepairAction --> Agent3[Agent 3: Verification Agent<br/>Gemini compares original & repair photos]
    Agent3 --> Agent3Check{Verify Repair?}
    
    %% Repair Verification Branch
    Agent3Check -- Rejected --> RejectLog[Write REJECTED Log to Activity Feed<br/>Status remains unchanged]
    RejectLog --> OpenState
    
    Agent3Check -- Approved --> ResolveTicket[Update Status -> 'resolved'<br/>Record resolvedAtAge & agentRecap]
    ResolveTicket --> ResolutionLog[Write RESOLUTION Log to Activity Feed<br/>Dispatches email to citizen]
    
    %% Confirmation Flow
    ResolutionLog --> ResolvedState[Ticket in 'resolved' status]
    ResolvedState --> ConfirmAction{Citizen Action / Timeout}
    
    ConfirmAction -- Citizen Confirms Resolution --> CloseTicket[Update Status -> 'closed']
    ConfirmAction -- "Timeout: Age - resolvedAtAge >= 72h" --> CloseTicket
    
    CloseTicket --> CloseLog[Write CLOSED Log to Activity Feed]
    CloseLog --> End([Closed - Loop Complete])

    %% Class assignment
    class Start,ConfirmAction citizen
    class A1,AsyncAgent2,Agent3 agent
    class RepairAction,SimulateTime worker
    class End,DedupCheck,SLACheck,Agent3Check system
```

---

### Technical Roles and File Structure

#### 1. Agent 1: Triage Agent
- **File Location:** [`server/agents/triage.js`](file:///D:/Antigravity%20IDE%20&%20Projects/Projects/v2s-community-hero/civix-agent/server/agents/triage.js)
- **Function:** `triageReport(params)`
- **Role:** Handles intake. Converts the Cloudinary photo to a base64 string, sends it alongside the citizen note to the Gemini API (`gemini-2.5-flash`) using a structured JSON schema constraint. It maps the report into one of four departments (Roads, Water, Electricity, Sanitation), rates the visual severity (1-10), and generates a concise technical justification.
- **Recalculation:** Employs the `calcSeverity` utility to calculate the baseline severity score (detailed in Section 5).

#### 2. Deduplication Helper (Agent 1 Extension)
- **File Location:** [`server/agents/dedup.js`](file:///D:/Antigravity%20IDE%20&%20Projects/Projects/v2s-community-hero/civix-agent/server/agents/dedup.js)
- **Function:** `findNearbyTickets(params)`
- **Role:** Performs spatial filtering to prevent department spam. Whenever a ticket is submitted, it queries Firestore for all unresolved tickets in the same category. It calculates spatial distance on the earth surface (in meters) via the Haversine formula. If another issue of the same category is within **50 meters**, it collapses the submission, adds a `clusterBonus`, and reinforces the primary ticket's severity.

#### 3. Agent 2: Routing & Escalation Agent
- **File Location:** [`server/agents/routing.js`](file:///D:/Antigravity%20IDE%20&%20Projects/Projects/v2s-community-hero/civix-agent/server/agents/routing.js)
- **Function:** `draftGrievanceBrief(ticket, isEscalation)`
- **Role:** Translates raw sensor data into administrative action. Runs asynchronously in the background. It takes the triaged ticket data and prompts Gemini to draft a structured briefing. If called with `isEscalation = true` due to an SLA breach, the prompt adopts an urgent tone.
- **Outputs:** 
  1. A structured metadata `card` (containing a short `title`, a 2-sentence `summary`, and 3 actionable `priority_actions`).
  2. A professional department dispatch `email` body.

#### 4. Agent 3: Citizen Engagement & Verification Agent
- **File Location:** [`server/agents/verification.js`](file:///D:/Antigravity%20IDE%20&%20Projects/Projects/v2s-community-hero/civix-agent/server/agents/verification.js)
- **Function:** `verifyRepair(originalImageUrl, repairImageUrl, category)`
- **Role:** Replaces manual audit checklists. When a worker submits a repair photo, Agent 3 receives the original complaint image and the worker's repair image. It prompts Gemini Vision to compare the two states directly and returns:
  1. `isRepaired` (Boolean): A strict evaluation of whether the defect has been visually fixed.
  2. `recap` (String): A community-friendly message thanking the citizen (if approved) or explaining what remains broken (if rejected).

---

## 🔄 4. Ticket Lifecycle States
CivixAgent enforces a strict, state-machine lifecycle for every ticket to prevent tasks from falling through the cracks:

| Status | Trigger / Criteria | What Happens Next |
| :--- | :--- | :--- |
| **`new`** | Initial citizen ticket submission. | Agent 1 triages and Agent 2 drafts the initial grievance brief and email. Ticket awaits municipal worker inspection. |
| **`escalated`** | Ticket remains unresolved past its SLA threshold (Age $\ge$ 24h for High severity, $\ge$ 48h for Medium severity). | Status is updated automatically during time simulation; Agent 2 generates a highly urgent Tier-2 escalation brief and email. |
| **`stalled`** | Low-severity ticket (Severity < 4) remains unresolved past 72h. | Status is updated automatically; ticket is flagged as stalled. |
| **`resolved`** | Municipal worker uploads repair proof, and Agent 3 visually verifies the fix. | Ticket waits in a resolved queue for the citizen to confirm the fix. |
| **`closed`** | Citizen clicks "Confirm Resolution", or the ticket reaches 72h in the `resolved` state without citizen action. | Ticket is permanently archived, and the issue resolution loop is complete. |

### SLA Threshold Limits

| Severity Band | Score Range | SLA Threshold | Action on Breach |
| :--- | :--- | :--- | :--- |
| **HIGH** | $\ge 7.0$ | **24 Hours** | Status becomes `escalated`; Agent 2 drafts urgent brief. |
| **MEDIUM** | $4.0$ to $6.9$ | **48 Hours** | Status becomes `escalated`; Agent 2 drafts urgent brief. |
| **LOW** | $< 4.0$ | **72 Hours** | Status becomes `stalled`; Agent 2 drafts brief. |

---

## 🧮 5. Severity Formula Explained
To ensure objective prioritization, CivixAgent implements a standardized severity score formula:

$$\text{Severity} = \text{clamp}\left( \left( (\text{Baseline} \times 0.5) + (\text{Visual} \times 0.5) \right) + \text{ClusterBonus}, \; 1, \; 10 \right)$$

### Department Baseline Offsets

| Department | Baseline Score | Primary Risk / Reasoning |
| :--- | :--- | :--- |
| **Electricity** | `8.0` | **Highest safety risk:** Live wires, dark streets, power surges pose immediate physical dangers. |
| **Water** | `7.0` | **High resource risk:** Burst mains waste water, flood neighborhoods, and block traffic. |
| **Roads** | `6.0` | **Medium traffic/physical risk:** Potholes and road damage disrupt mobility and cause vehicular damage. |
| **Sanitation** | `5.0` | **Lowest immediate safety risk:** Waste accumulation and sewer blocks cause hygienic issues but lower immediate physical harm. |

### Formula Variable Definitions
- **Baseline:** The default severity offset of the category (see table above).
- **Visual:** The raw 1–10 visual severity score generated by Agent 1's analysis of the photo (1 is negligible cosmetic damage, 10 is an immediate threat to life).
- **ClusterBonus:** A density multiplier calculated during the deduplication step:
  - Begins at `0` for unique tickets.
  - Adds `0.5` points for each subsequent report merged within the 50-meter radius, capped at a maximum bonus of `2.0` (reached at 4 duplicate reports).
- **Clamp:** Restricts the final value strictly within the `[1.0, 10.0]` range.
- **Rounding:** Rounded to one decimal place.

### Worked Example:
A citizen reports a broken road pothole.
1. **Intake Triage:**
   - The department is classified as **Roads** (Baseline = `6.0`).
   - Gemini Vision rates the visual severity of the pothole image as `8.0`.
   - The initial score (ClusterBonus = `0`):
     $$\text{Severity} = (6.0 \times 0.5) + (8.0 \times 0.5) + 0 = 3.0 + 4.0 = 7.0$$
     *Status:* `new`, Severity: `7.0` (HIGH priority, SLA: 24h).
2. **Deduplication Reinforcement:**
   - Two other citizens report the same pothole within 50 meters. The system merges these reports.
   - Duplicate count becomes `2` (the initial report + 2 duplicates).
   - Cluster Bonus is calculated:
     $$\text{ClusterBonus} = \text{Math.min}(2 \times 0.5, 2.0) = 1.0$$
   - The severity recalculates:
     $$\text{Severity} = (6.0 \times 0.5) + (8.0 \times 0.5) + 1.0 = 3.0 + 4.0 + 1.0 = 8.0$$
     *Status:* `new`, Severity: `8.0` (HIGH priority, SLA: 24h).

---

## 🛠️ 6. Tech Stack
CivixAgent is engineered with a modern, lightweight, "no-card-required" technology stack:

| Technology | Role | Why Chosen (No-Card / Free Tier Friendly) |
| :--- | :--- | :--- |
| **React + Vite** | Frontend Framework | Fast build times, instant Hot Module Replacement (HMR) for rapid development, and a highly responsive single-page client. |
| **Express.js** | Backend Server API | Provides a lightweight, scalable middleware layer to connect the client, Firestore, and the Gemini API. |
| **Cloudinary** | Image Storage | Generous free tier and unsigned client-side upload support, avoiding heavy image uploads through the server CPU. |
| **Firebase Firestore** | NoSQL Real-time Database | Subsecond syncing to the frontend client map whenever issues are updated, escalated, or resolved. |
| **Firebase Anonymous Auth** | Authentication | Allows immediate ticket reporting and tracking for citizens without requiring logins, passwords, or exposing emails. |
| **Gemini API (`gemini-2.5-flash`)** | AI Swarm Core | Speed and multimodal capability for visual triage, routing briefs, and visual verification. Google AI Studio provides a free key tier without requiring a billing credit card. |
| **Leaflet & OpenStreetMap** | Map Engine | Open-source geographic rendering and dragging pin boards. Zero billing or API key constraints, unlike Google Maps. |

---

## 🧪 7. What is Simulated vs. Real
To ensure transparency, here is a breakdown of what is simulated for demonstration purposes:

> [!IMPORTANT]
> **Transparency: Simulation Details**
> - **SLA Timing:** A simulated clock is used since hackathon judges cannot wait real days to see escalations. Clicking the **"Fast-Forward Time (+6h)"** button adds 6 simulated hours to all active tickets in the database.
> - **Department Dispatches:** Grievance briefs and email contents are written directly to Firestore and rendered in the admin panel rather than sent to real mail servers.
> - **Municipal APIs:** The routing tables and contacts use seeded data representing Bhubaneswar municipal bodies.

---

## 🚀 8. Future Enhancements
If developed beyond a hackathon proof-of-concept, the CivixAgent roadmap includes:

1. **Semantic Deduplication:** Transitioning from simple spatial radius checks to visual and text embedding comparison (using Gemini's embedding models) to group issues that are visually identical but slightly offset on GPS coordinates.
2. **Real Department Integration:** Direct integration with civic systems (like Bhubaneswar Municipal Corporation (BMC) SAP or work order managers).
3. **Omnichannel Report Intake:** Creating automated ingestion channels for WhatsApp, SMS, and email reports utilizing Gemini's multimodal audio and text parsing capabilities.
4. **Real Notifications:** Connecting Twilio (SMS) and SendGrid (Email) to notify citizens when repairs are completed.
5. **Multi-language Support:** Integrating Google Translation APIs to allow citizens to submit reports and read recaps in Odia, Hindi, or English.

> [!IMPORTANT]
> **⚖️ Hackathon-Scope Design Decisions & Production-Readiness Paths**
> 
> *Read this section to understand which choices were made for hackathon demo purposes vs. production constraints.*
> 
> During the hackathon development of CivixAgent, certain design choices were deliberately simplified to optimize usability, streamline the evaluation process for judges, and prevent dead-ends during demo walkthroughs. These are conscious, engineered tradeoffs with clear paths to production-readiness:
> 
> 1. **🔑 Shared Worker Passphrase vs. Authenticated Accounts**
>    - *⚙️ Design Decision:* Municipal Worker Mode currently uses a single shared passphrase rather than individual worker accounts.
>    - *💡 Rationale:* This keeps the demo immediately accessible to judges without requiring the provisioning and sharing of individual worker credentials for evaluation.
>    - *⚠️ Production Tradeoff:* A shared passphrase means actions cannot be attributed to a specific worker, which compromises real-world accountability.
>    - *🛠️ Production Fix:* Replace the shared passphrase with individual authenticated worker accounts (e.g., Firebase email/password or SSO tied to municipal employee IDs) so every action is logged against a specific, accountable worker identity.
> 
> ---
> 
> 2. **⏱️ Auto-Close Without Human Review**
>    - *⚙️ Design Decision:* The 72-hour citizen-confirmation timeout currently auto-closes a resolved ticket with no human review step.
>    - *💡 Rationale:* This exists specifically to demonstrate the full ticket lifecycle without dead-end states during a short demo window.
>    - *⚠️ Production Tradeoff:* In production, an unreviewed auto-close could finalize a dispute the citizen never actually confirmed was fixed.
>    - *🛠️ Production Fix:* Route timed-out, unconfirmed tickets to a human supervisor review queue instead of auto-closing silently.

---

## 💻 9. Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- A Google AI Studio API Key (obtain free at [https://aistudio.google.com](https://aistudio.google.com))
- A Firebase Project (with Firestore, Storage, and Anonymous Authentication enabled)
- A Cloudinary account (Free tier) with an **unsigned upload preset** enabled in *Settings $\to$ Upload*.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mrutunjaya-Panda/civix-agent-platform-v2s.git
   cd civix-agent-platform-v2s/civix-agent
   ```

2. **Install dependencies:**
   Install root, client, and server dependencies:
   ```bash
   # Install root concurrently runner
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   
   cd ..
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `civix-agent` directory:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your keys:
   ```env
   GEMINI_API_KEY=your_google_ai_studio_key_here
   
   # Firebase Admin SDK (Server)
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   
   # Firebase Client SDK (Client)
   VITE_FIREBASE_API_KEY=your_firebase_web_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   
   # Cloudinary Upload
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset_name
   
   # Worker Passphrase (default: civix2026)
   MUNICIPAL_WORKER_PASSPHRASE=civix2026
   ```

4. **Seed the Database:**
   To pre-populate Firestore with test cases for the demo scenarios (e.g. stalled streetlight, escalated sinkhole):
   ```bash
   npm run seed
   ```

5. **Run the Development Server:**
   From the `civix-agent` directory, run:
   ```bash
   npm run dev
   ```
   This command starts the client on [http://localhost:5173](http://localhost:5173) and the backend API server on [http://localhost:3001](http://localhost:3001) concurrently.
