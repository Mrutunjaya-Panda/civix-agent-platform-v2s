# CivixAgent 🏛️🤖
> **Autonomous Tri-Agent Infrastructure for Bhubaneswar, India**
> An intelligent, autonomous civic issue routing and verification platform built to bridge the gap between citizens and municipal departments.

---

## 1. Project Overview
In rapidly growing municipalities like Bhubaneswar, civic complaints (e.g., open potholes, leaking pipes, blinking streetlights) are often delayed due to manual triaging errors, high volumes of duplicate reports, and delayed communication. 

**CivixAgent** addresses this problem by deploying an autonomous **Tri-Agent System** that manages the entire lifecycle of a civic issue. It acts as an automated municipal routing office:
- **For Citizens:** It provides a simple, map-based interface to snap a photo, share a location, and report issues without filling out complex forms.
- **For Municipalities:** It autonomously categorizes reports, filters out spatial duplicates, drafts detailed technical briefs with priority actions, escalates issues that breach service level agreements (SLAs), and verifies repair claims using visual intelligence before closing the ticket.
- **The Result:** Faster response times, zero duplicate ticket clutter, objective repair verification, and a closed-loop resolution system that keeps the community informed.

---

## 2. How to Use the App
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
3. You will be prompted for a passphrase. Enter **`civix2026`** and click **"Unlock"**.
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
5. *(Note: If the citizen does not confirm resolution, the ticket will automatically transition to `CLOSED` after 72 hours of simulated time via the Fast-Forward button).*

---

## 3. Technical Architecture & Agent Swarm
CivixAgent operates using a three-agent system built on top of the modular Express backend and React frontend.

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

## 4. Ticket Lifecycle States
Tickets in CivixAgent progress through the following statuses:

1. **`new`**: The ticket has been created and categorized. Agent 2 has drafted the initial grievance brief and email.
2. **`escalated`**: High or Medium severity tickets that have remained unresolved past their respective SLA thresholds (24 hours and 48 hours, respectively). They are autonomously pushed to Tier-2 attention with urgent briefings.
3. **`stalled`**: Low severity tickets (severity < 4) that have remained unresolved past 72 hours.
4. **`resolved`**: A worker has submitted proof of repair, and Agent 3 has visually verified the fix. The ticket is currently awaiting citizen confirmation.
5. **`closed`**: The issue is finalized. This happens either when a citizen confirms the resolution or automatically after 72 hours in the `resolved` state.

---

## 5. Severity Formula Explained
To ensure objective prioritization, CivixAgent implements a standardized severity score formula:

$$\text{Severity} = \text{clamp}\left( \left( (\text{Baseline} \times 0.5) + (\text{Visual} \times 0.5) \right) + \text{ClusterBonus}, \; 1, \; 10 \right)$$

### Components
- **Baseline:** A fixed severity offset assigned to each department category representing its default priority:
  - **Electricity:** 8.0 (highest safety risk)
  - **Water:** 7.0
  - **Roads:** 6.0
  - **Sanitation:** 5.0 (lowest safety risk)
- **Visual:** The raw 1–10 visual severity score generated by Agent 1's analysis of the photo (where 1 is negligible cosmetic damage, and 10 is immediate hazard/threat to life).
- **ClusterBonus:** A density multiplier calculated during the deduplication step:
  - Begins at `0` for unique tickets.
  - Adds `0.5` points for each subsequent report merged within the 50-meter radius, capped at a maximum bonus of `2.0` (which is reached at 4 duplicate reports).
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

## 6. Tech Stack
CivixAgent is engineered with a modern, lightweight, "no-card-required" technology stack:

- **React + Vite (Frontend):** Selected for rapid build times, instant Hot Module Replacement (HMR) during developer iterations, and lightweight client deployment.
- **Express.js (Backend):** Serves as the routing API layer connecting Firebase and Gemini services.
- **Cloudinary (Image Storage):** Chosen for its generous free tier and unsigned client-side upload support, eliminating the need to process heavy image files through the server CPU.
- **Firebase Firestore (NoSQL Database):** A real-time database that drives instant updates in the client map when tickets are added, modified, or escalated.
- **Firebase Anonymous Authentication:** Allows citizens to immediately submit issues and securely track their own reported tickets without typing passwords, entering credit cards, or exposing email addresses.
- **Gemini API via Google AI Studio (@google/genai SDK):** Utilizes `gemini-2.5-flash` for high-speed visual triage, brief drafting, and repair verification without requiring paid credit cards or billing setup.
- **Leaflet & OpenStreetMap (Mapping Engine):** Fully open-source geographic mapping libraries that provide a smooth, draggable live pinboard map without incurring Google Maps API usage fees.

---

## 7. What is Simulated vs. Real
To ensure transparency, here is a breakdown of what is simulated for demonstration purposes:

- **SLA Timing (Simulated):** In a production system, ticket ages accumulate in real-time. For a hackathon demo, you cannot wait 24 to 72 actual hours to observe escalation, stalling, or automatic closing behaviors. Therefore, a simulated clock is implemented. In Worker Mode, clicking the **"Fast-Forward Time (+6h)"** button increments the ticket age in the database by 6 hours instantly, forcing the background SLA cron checks to run immediately.
- **Department Dispatches (Simulated):** The emails drafted by Agent 2 and the notifications from Agent 3 are printed to the database and displayed inside the administrative brief tab rather than being dispatched to real government mail servers or SMS gateways.
- **Municipal APIs (Simulated):** The routing tables are seeded and mapped locally to demonstrate how CivixAgent can integrate with actual city planning API endpoints.

---

## 8. Future Enhancements
If developed beyond a hackathon proof-of-concept, the CivixAgent roadmap includes:

1. **Semantic Deduplication:** Transitioning from simple spatial radius checks to visual and text embedding comparison (using Gemini's embedding models) to group issues that are visually identical but slightly offset on GPS coordinates.
2. **Real Department Integration:** Direct integration with civic systems (like Bhubaneswar Municipal Corporation (BMC) SAP or work order managers).
3. **Omnichannel Report Intake:** Creating automated ingestion channels for WhatsApp, SMS, and email reports utilizing Gemini's multimodal audio and text parsing capabilities.
4. **Real Notifications:** Connecting Twilio (SMS) and SendGrid (Email) to notify citizens when repairs are completed.
5. **Multi-language Support:** Integrating Google Translation APIs to allow citizens to submit reports and read recaps in Odia, Hindi, or English.

---

## 9. Local Setup Instructions

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
