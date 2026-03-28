# Witness

**Anonymous, AI-powered bias incident reporting for Virginia Tech students.**

Witness eliminates every barrier to reporting campus bias incidents. No account, no name, no email — a student goes from "something happened to me" to a formal statement ready to file in under 60 seconds.

**Live:** [witness-vt.vercel.app](https://witness-vt.vercel.app)

---

## The Problem

Campus bias incidents at Virginia Tech are dramatically underreported. Students stay silent because they fear retaliation, don't understand the process, and don't know how to write a formal complaint. Witness removes all of these barriers.

## How It Works

```
Open app (no signup) → Describe what happened → 3 AI agents analyze →
Review record → See your rights → Get action plan + draft statement →
One-click email to the right office → Save with QR code → Exit safely
```

### Three AI Agents

1. **Documenter** — Extracts incident type, bias category, location, and date from free-form text. Severity is computed by a deterministic Python rule engine (15+ regex patterns) — Claude cannot override it.
2. **Advisor** — Matches the incident to the correct VT policy (Bias Response Team, Title IX, Dean of Students, Honor Code) using hard-coded routing rules. Contact URLs come from a verified canonical map — never hallucinated.
3. **Navigator** — Generates a step-by-step reporting plan with timelines and a draft formal statement ready to file immediately.

### Key Features

- **Zero PII** — No signup, no login, no personal data stored. Auth token lives in memory only.
- **Emergency Detection** — Scans for crisis signals (suicidal ideation, active threats) and surfaces 911, VT Police, 988 Lifeline before AI analysis.
- **Take Action Email** — Pre-filled mailto link to the correct VT office with the draft statement as the body. One click to send.
- **QR Code Retrieval** — Report data embedded directly in the QR code. Scan on any device — works cross-device without a backend.
- **Support Resources** — Tailored to the bias category: Cook Counseling, LGBTQ+ Center, Black Cultural Center, CARES, Cranwell International Center, SSD, and more.
- **Analytics Dashboard** — Real-time campus trends from anonymous aggregates. Severity distribution, bias category breakdown, incident type, and an interactive OpenStreetMap heatmap with verified GPS coordinates for 35+ VT buildings.
- **Two-Tier Privacy Model** — Individual reports auto-delete after 90 days. Anonymous aggregate counters (type, category, severity, location, month — no description, no session ID) persist so trends are visible over time.
- **PDF Export** — Print-ready formatted report with incident record, rights, steps, and draft statement.
- **PWA** — Installable progressive web app with offline support.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Hosting | Vercel |
| Auth | AWS Cognito Identity Pools (anonymous) |
| AI | Claude Sonnet on AWS Bedrock (3-agent pipeline) |
| Database | AWS DynamoDB (KMS encrypted, 90-day TTL, PITR) |
| Backend | AWS Lambda (Python) + API Gateway |
| Infra | AWS CloudFormation (IaC) |
| Map | Leaflet + OpenStreetMap |
| QR | qrcode.react |

## Architecture

```
Frontend (React/Vite/Vercel)
    │
    ▼ HTTPS + Bearer JWT
API Gateway
    │
    ├── POST /session      → Lambda → Cognito (anonymous identity)
    ├── POST /report/process → Lambda → Bedrock (3 Claude agents)
    ├── POST /report/save   → Lambda → DynamoDB (report + aggregate)
    ├── GET  /report/{id}   → Lambda → DynamoDB (retrieve by token)
    └── GET  /analytics     → Lambda → DynamoDB (aggregate trends)
```

### Privacy at Every Layer

| Layer | Protection |
|-------|-----------|
| Frontend | No signup, token in memory only, no browser history |
| Auth | Cognito anonymous UUID — no personal attributes |
| Processing | PII scanner blocks emails/IDs/SSNs, Claude instructed to redact names |
| Storage | KMS encryption at rest, 90-day TTL auto-delete, PITR backup |
| Analytics | Separate table, no description/session ID, no TTL |
| Exit | All in-memory data cleared, no back navigation |

## Running Locally

```bash
cd frontend
npm install
VITE_DEMO=true npm run dev
```

Opens at `http://localhost:5173` in demo mode (no AWS credentials needed).

## Project Structure

```
witness-vt/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # State machine (10 screens)
│   │   ├── api.js                     # API client (real or demo mode)
│   │   ├── mockApi.js                 # Full client-side NLP pipeline
│   │   ├── i18n.jsx                   # Multi-language support (EN/ES/ZH)
│   │   ├── screens/                   # 11 screen components
│   │   ├── components/                # Reusable UI (EmergencyBanner, SupportResources, TakeActionCard, etc.)
│   │   └── utils/exportPdf.js         # Print-ready PDF generation
│   └── public/                        # PWA manifest + service worker
├── backend/
│   ├── process/                       # 3-agent pipeline (documenter, advisor, navigator)
│   ├── save/                          # DynamoDB write + aggregate tracking
│   ├── retrieve/                      # Token-based report retrieval
│   ├── session/                       # Cognito anonymous auth
│   ├── analytics/                     # Aggregate trend endpoint
│   └── shared/                        # Bedrock client, auth, PII detection, emergency detection, support resources, VT policy KB
└── infra/                             # CloudFormation templates (Cognito, DynamoDB, KMS, IAM, API Gateway)
```

## Hackathon

Built at the **AWS Kiro x CS Careers Hackathon** at Virginia Tech, March 28, 2026.

## Team

Built by Virginia Tech students.

## License

MIT
