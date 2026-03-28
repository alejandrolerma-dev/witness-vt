# Witness — 60-Second Demo Script

## Setup (before presenting)

- Start the app in demo mode: `cd frontend && VITE_DEMO=true npm run dev`
- Open browser to `http://localhost:5173`
- Have the incident description pre-written and ready to paste (see bottom of this doc)
- Zoom browser to 125% so the audience can read the screen
- Keep this doc open on a second monitor or phone

---

## The Script

### [0:00] Landing Page

**SAY:** "This is Witness. No account. No name. No email. No VT ID. You're anonymous the moment you open it."

**DO:** Point to the Zero-PII badge (lock icon, top of card) and the "No data stored" label.

**AUDIENCE SEES:** Dark navy background, white card, ZeroPII badge with lock icon, "Start Report" button.

---

### [0:10] Start the session

**SAY:** "One click to start. We initialize an anonymous session token — nothing tied to you."

**DO:** Click **"Start Report"**.

**AUDIENCE SEES:** App transitions to the DescribeIncidentScreen. Session initializes silently in the background.

---

### [0:15] Describe the incident

**SAY:** "You describe what happened in your own words. No form fields, no checkboxes — just tell us what happened."

**DO:** Paste the incident description (see below) into the textarea.

**AUDIENCE SEES:** Text appears in the textarea, character counter updates, "Analyze Incident" button becomes active.

---

### [0:20] Submit for analysis

**SAY:** "Hit analyze — three AI agents are about to run in sequence."

**DO:** Click **"Analyze Incident"**.

**AUDIENCE SEES:** ProcessingScreen appears with a spinner and a calm loading message.

---

### [0:25] Processing screen

**SAY:** "Three agents run back-to-back: Documenter, Advisor, Navigator. Each one builds on the last. Takes about two seconds in demo mode — in production it's a few more."

**DO:** Wait. No action needed.

**AUDIENCE SEES:** Spinner, calm message, ExitButton always visible in the corner.

---

### [0:35] Documenter output

**SAY:** "The Documenter structured the incident. Notice the severity indicator — it's red because this one is high severity."

**DO:** Point to the `severity_indicator: high` field shown in red. Point out the incident type, location, and bias category fields.

**AUDIENCE SEES:** ReviewDocumenterScreen — white card with incident_type, date_context, location_context, bias_category, description_summary, severity in red.

---

### [0:42] Advisor output

**SAY:** "The Advisor matched this to Virginia Tech's Bias Response Team policy and summarized your rights — including the right to report without retaliation."

**DO:** Click **"Looks right, continue"** → ReviewAdvisorScreen appears. Point to matched_policy and the rights_summary paragraph.

**AUDIENCE SEES:** ReviewAdvisorScreen — matched policy name, rights summary, link to bias.vt.edu.

---

### [0:50] Navigator output

**SAY:** "The Navigator gives you a step-by-step action plan and — this is the key part — a draft statement that's ready to file right now."

**DO:** Click **"Continue"** → ReviewNavigatorScreen appears. Scroll briefly to show the reporting_steps list, then point to the draft_statement text block.

**AUDIENCE SEES:** ReviewNavigatorScreen — numbered reporting steps, draft statement pre-written and ready to copy.

---

### [0:55] Exit without saving — the default

**SAY:** "Notice the default action is 'Exit Without Saving.' We don't push you to store anything. Even if you do save, we only keep an anonymous session token — no name, no ID, nothing that traces back to you."

**DO:** Point to the **"Exit Without Saving"** button. Do not click yet — let the point land.

**AUDIENCE SEES:** Two buttons: "Save Report" (opt-in) and "Exit Without Saving" (default, prominent).

---

### [1:00] Exit safely

**SAY:** "Exit. Everything in memory is cleared. You were never here."

**DO:** Click **"Exit Without Saving"**.

**AUDIENCE SEES:** ExitScreen — "You've exited safely." All in-memory data cleared. No back navigation.

---

## Key talking points to weave in

- "No account required. No name. No email. No VT ID."
- "Three AI agents run in sequence — Documenter, Advisor, Navigator"
- "The draft statement is ready to file right now"
- "Even if you save, we only store an anonymous session token"

---

## Incident description to use (paste this)

> Last Tuesday evening in Torgersen Hall, third floor, I was in a study group with four other students when one of them started making racially charged remarks directed at me. The comments were made openly, in front of everyone in the group. No one said anything. I felt unsafe and left early. I want to document what happened and understand what my options are.

*(Expanded from the `description_summary` in `frontend/src/mockApi.js`. The mock API will return structured output regardless of what text is pasted in demo mode.)*
