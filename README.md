<<<<<<< HEAD
# ResourceLoop

**Access More. Own Less. Share Smarter.**

ResourceLoop is an AI-powered equipment rental, resource sharing, and institutional asset utilisation platform designed for engineering students, project teams, researchers, college laboratories, makerspaces, equipment owners, and institutional administrators.

---

## 🌟 Key Features

1. **Resource Marketplace**: Discover, filter, and inspect verified equipment, electronics, lab instruments, workstations, 3D printers, and tools with specifications, eligibility requirements, and rental policies.
2. **SmartFind Equipment Request System**: Request hard-to-find or missing instruments. When not listed, students broadcast structured requests with budget, dates, and technical requirements.
3. **AI-Assisted Resource & Alternative Matching**: Server-side Google Gemini integration parses natural language equipment queries (e.g. *"I need an oscilloscope for 3 days under ₹800"*), matches registered inventory, and suggests technically sound alternatives with explanations, with deterministic fallback when AI is unavailable.
4. **Digital Trust Passport**: Resource-specific qualification and eligibility verification. Handles safety training, institutional clearance, and approval records without reductive public credit scores.
5. **FairShare Allocation & Waitlists**: Concurrency-safe booking management, conflict prevention, fair usage limits, and waiting-list queueing.
6. **Digital Check-In & Return**: Pre-checkout condition documentation, accessory confirmation checklists, return verification, and discrepancy recording.
7. **Incident & Damage Management**: Structured reporting of malfunctions, damaged items, or missing accessories with dispute resolution tracking.
8. **Resource Maintenance Operations**: Equipment servicing logs, fault ticketing, and automatic booking lockouts for units undergoing repair or calibration.
9. **Institutional Analytics**: Real-time asset utilisation rates (`(Booked Hours / Available Hours) * 100`), demand heatmaps, and estimated purchase capital avoided.
10. **Immutable Audit Trail**: Append-only log of critical state transitions and security-sensitive events.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **Database & Auth**: Firebase Authentication & Cloud Firestore Enterprise Edition
- **AI**: Google Gemini API (`@google/genai`) using model `gemini-3.8-flash`
- **Build & Dev**: Vite

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env` (or configure secrets in Google AI Studio):
```bash
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="https://your-app-url"
PORT=3000
```

### 2. Run in Development
```bash
npm run dev
```
The server boots at `http://localhost:3000` with Express handling `/api/*` routes and Vite handling the frontend client.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Security & Data Integrity

- **Backend Authorization**: Verified role permissions for students, owners, institution managers, and administrators.
- **Rule Hardening**: Firestore rules enforcing document validation, identity parity (`request.auth.uid`), and immutability.
- **Safe AI Boundary**: Gemini API runs strictly on the server-side proxy; secrets are never passed to the browser, and AI outputs are validated against real catalog inventory.
=======
# CodeHackProject
>>>>>>> 475352eca17d61db126d589ce28f095c85cf063d
