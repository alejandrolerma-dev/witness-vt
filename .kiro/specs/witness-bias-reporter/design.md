# Design Document

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        STUDENT BROWSER                          │
│                                                                 │
│   React + Tailwind (Vercel)                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │ Landing  │→ │ Describe │→ │  Review  │→ │  Save/Exit   │  │
│   │  Page    │  │Incident  │  │ Pipeline │  │   Screen     │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (JWT in Authorization header)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS API GATEWAY                            │
│   POST /session   POST /report/process   POST /report/save      │
│                   GET  /report/{id}                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │   session    │ │   process    │ │    save      │
     │   Lambda     │ │   Lambda     │ │   Lambda     │
     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
            │                │                │
            ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  AWS Cognito │ │Amazon Bedrock│ │  DynamoDB    │
     │  (anon pool) │ │Claude Sonnet │ │  (KMS enc.)  │
     └──────────────┘ │              │ └──────────────┘
                      │ 1. Documenter│
                      │ 2. Advisor   │
                      │ 3. Navigator │
                      └──────────────┘
```

### Data Flow

```
Student text
    │
    ▼
[Documenter] ──→ Incident_Record (JSON, PII stripped)
                        │
                        ▼
                  [Advisor] ──→ policy_match + rights_summary
                                        │
                                        ▼
                                  [Navigator] ──→ reporting_steps + draft_statement
                                                          │
                                                          ▼
                                                   Report (opt-in save to DynamoDB)
```

---

## Agent Prompts and Schemas

### Agent 1: Documenter

**System Prompt:**
```
You are a structured data extractor for a bias incident reporting system.
Your job is to convert a student's plain-text incident description into a structured JSON record.
Rules:
- Remove or replace any names, email addresses, VT IDs, phone numbers, or other identifying information with "[REDACTED]".
- Do not include any PII in your output.
- Be factual and neutral. Do not editorialize.
- Output only valid JSON matching the schema below. No prose, no markdown.
```

**User Message Template:**
```
Convert the following incident description into a structured JSON record.

Incident description:
<incident>
{raw_text}
</incident>
```

**Output JSON Schema:**
```json
{
  "incident_type": "string — one of: verbal, physical, written, online, property, other",
  "date_context": "string — approximate time reference extracted from text, or 'unspecified'",
  "location_context": "string — location reference extracted from text, or 'unspecified'",
  "bias_category": "string — one of: race, ethnicity, religion, gender, sexual_orientation, disability, national_origin, other",
  "description_summary": "string — 1-3 sentence neutral summary, no PII",
  "severity_indicator": "string — one of: low, medium, high"
}
```

**Input Schema (Lambda receives):**
```json
{
  "session_id": "string",
  "raw_text": "string (max 5000 chars)"
}
```

**Output Schema (Lambda returns):**
```json
{
  "incident_record": {
    "incident_type": "string",
    "date_context": "string",
    "location_context": "string",
    "bias_category": "string",
    "description_summary": "string",
    "severity_indicator": "string"
  }
}
```

---

### Agent 2: Advisor

**System Prompt:**
```
You are a student rights advisor for Virginia Tech.
Your job is to match a structured bias incident record to the most relevant VT policy and explain the student's rights in plain English.
Rules:
- Choose exactly one policy from: Honor Code, Title IX, Bias Response Team, Dean of Students.
- If no policy clearly matches, default to Bias Response Team and note the ambiguity.
- Write the rights summary in plain English, under 300 words.
- Do not include any PII. Do not reference names or identifiers.
- Output only valid JSON matching the schema below. No prose, no markdown.
```

**User Message Template:**
```
Given the following incident record, identify the applicable VT policy and explain the student's rights.

Incident record:
<record>
{incident_record_json}
</record>
```

**Output JSON Schema:**
```json
{
  "matched_policy": "string — one of: Honor Code, Title IX, Bias Response Team, Dean of Students",
  "policy_ambiguous": "boolean",
  "rights_summary": "string — plain English, max 300 words",
  "vt_contact": {
    "office": "string",
    "url": "string"
  }
}
```

**Input Schema (Lambda receives):**
```json
{
  "session_id": "string",
  "incident_record": { "...": "Incident_Record fields" }
}
```

**Output Schema (Lambda returns):**
```json
{
  "advice": {
    "matched_policy": "string",
    "policy_ambiguous": "boolean",
    "rights_summary": "string",
    "vt_contact": {
      "office": "string",
      "url": "string"
    }
  }
}
```

---

### Agent 3: Navigator

**System Prompt:**
```
You are a reporting navigator for Virginia Tech bias incidents.
Your job is to generate a step-by-step reporting path and a ready-to-file formal statement.
Rules:
- Generate numbered steps specific to the matched VT policy.
- Include estimated timelines per step where known.
- Draft a formal statement under 500 words. The statement must contain no PII.
- Write in a calm, clear, professional tone.
- Output only valid JSON matching the schema below. No prose, no markdown.
```

**User Message Template:**
```
Given the following incident record and policy advice, generate a reporting path and draft statement.

Incident record:
<record>
{incident_record_json}
</record>

Policy advice:
<advice>
{advice_json}
</advice>
```

**Output JSON Schema:**
```json
{
  "reporting_steps": [
    {
      "step_number": "integer",
      "action": "string",
      "estimated_timeline": "string"
    }
  ],
  "draft_statement": "string — formal statement, max 500 words, no PII"
}
```

**Input Schema (Lambda receives):**
```json
{
  "session_id": "string",
  "incident_record": { "...": "Incident_Record fields" },
  "advice": { "...": "Advisor output fields" }
}
```

**Output Schema (Lambda returns):**
```json
{
  "navigation": {
    "reporting_steps": [
      {
        "step_number": 1,
        "action": "string",
        "estimated_timeline": "string"
      }
    ],
    "draft_statement": "string"
  }
}
```

---

## API Routes

All routes require `Authorization: Bearer <cognito_id_token>` header.
All responses include `Content-Type: application/json`.

### POST /session

Creates an anonymous Cognito session.

Request: (no body required)

Response `200`:
```json
{
  "session_id": "string",
  "id_token": "string",
  "expires_in": 3600
}
```

Response `500`:
```json
{ "error": "Session initialization failed. Please try again." }
```

---

### POST /report/process

Runs the full three-agent pipeline sequentially.

Request:
```json
{
  "raw_text": "string (1–5000 chars)"
}
```

Response `200`:
```json
{
  "incident_record": { "...": "Documenter output" },
  "advice": { "...": "Advisor output" },
  "navigation": { "...": "Navigator output" }
}
```

Response `400`:
```json
{ "error": "Incident description is required and must be under 5000 characters." }
```

Response `401`:
```json
{ "error": "Unauthorized." }
```

Response `502`:
```json
{
  "error": "One or more AI agents are temporarily unavailable. Please try again in a moment.",
  "partial": {
    "incident_record": "object or null",
    "advice": "object or null",
    "navigation": "object or null"
  }
}
```

---

### POST /report/save

Saves the completed report to DynamoDB (opt-in only).

Request:
```json
{
  "incident_record": { "...": "Documenter output" },
  "advice": { "...": "Advisor output" },
  "navigation": { "...": "Navigator output" }
}
```

Response `200`:
```json
{
  "retrieval_token": "string (session_id)",
  "saved_at": "ISO8601 timestamp"
}
```

Response `401`:
```json
{ "error": "Unauthorized." }
```

Response `500`:
```json
{ "error": "Save failed. You can copy your report content instead." }
```

---

### GET /report/{session_id}

Retrieves a previously saved report by retrieval token.

Response `200`:
```json
{
  "incident_record": { "...": "Documenter output" },
  "advice": { "...": "Advisor output" },
  "navigation": { "...": "Navigator output" },
  "saved_at": "ISO8601 timestamp"
}
```

Response `404`:
```json
{ "error": "No report found for this token." }
```

---

## DynamoDB Table Schema

**Table Name:** `witness-reports`

**Billing Mode:** PAY_PER_REQUEST

**Encryption:** AWS-managed KMS customer-managed key (CMK)

| Attribute | Type | Role | Notes |
|---|---|---|---|
| `session_id` | String | Partition Key (PK) | Anonymous Cognito session ID — no PII |
| `saved_at` | String | Sort Key (SK) | ISO8601 timestamp |
| `incident_record` | Map | Attribute | Documenter output JSON |
| `advice` | Map | Attribute | Advisor output JSON |
| `navigation` | Map | Attribute | Navigator output JSON |
| `ttl` | Number | Attribute | Unix epoch — items expire after 90 days |

**TTL Attribute:** `ttl` (enabled, 90-day expiry)

**GSIs:** None required for MVP.

**No PII fields:** The table schema contains no name, email, vt_id, phone, or any identifying attribute by design.

---

## Cognito Setup

**User Pool Name:** `witness-anon-pool`

**Configuration:**

| Setting | Value |
|---|---|
| Sign-in method | None (identity pool only, no username/password) |
| Self-registration | Disabled |
| MFA | Disabled |
| Email/phone verification | Disabled |
| Required attributes | None |
| Token validity | ID token: 1 hour, Refresh token: 1 day |

**Identity Pool Name:** `witness-anon-identity-pool`

| Setting | Value |
|---|---|
| Allow unauthenticated identities | Yes |
| Authentication providers | Cognito User Pool (witness-anon-pool) |

**Flow:**
1. Frontend calls `cognitoidentity.getId()` with the identity pool ID to get an anonymous `IdentityId`.
2. Frontend calls `cognitoidentity.getOpenIdToken()` to get a short-lived OpenID token.
3. Frontend exchanges the token via `POST /session` to get a signed session JWT used in all subsequent API calls.
4. Lambda validates the JWT on every request using the Cognito JWKS endpoint before processing.

**IAM Role for anonymous identity:** Read-only access to call `POST /session` only. All other permissions are granted via the validated JWT in Lambda.
