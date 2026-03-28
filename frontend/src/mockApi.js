// Mock API responses for demo mode (VITE_DEMO=true)
// Simulates realistic delays without requiring live AWS credentials

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function createSession() {
  await delay(400);
  return {
    session_id: "demo-session-" + Math.random().toString(36).slice(2, 10),
    id_token: "demo-token",
    expires_in: 3600,
  };
}

export async function processIncident(rawText, structuredFields) {
  await delay(1500);
  // Use structured fields if provided, otherwise fall back to "Not specified"
  const dateContext = structuredFields?.when || 'Not specified';
  const locationContext = structuredFields?.where || 'Not specified';
  return {
    incident_record: {
      incident_type: "verbal",
      date_context: dateContext,
      location_context: locationContext,
      bias_category: "race",
      description_summary:
        "A student reported being subjected to racially charged remarks during a study group session. The remarks were directed at the student and made in front of peers.",
      severity_indicator: "high",
    },
    advice: {
      matched_policy: "Bias Response Team",
      policy_ambiguous: false,
      rights_summary:
        "As a Virginia Tech student, you have the right to report this incident to the Bias Response Team without fear of retaliation. The team will review your report confidentially and connect you with appropriate support resources. You may also choose to pursue a formal complaint through the Office for Equity and Accessibility. You are not required to identify yourself in your initial report.",
      vt_contact: {
        office: "Virginia Tech Bias Response Team",
        url: "https://www.inclusive.vt.edu/resources/brt.html",
      },
    },
    navigation: {
      reporting_steps: [
        {
          step_number: 1,
          action: "Submit an online report to the Bias Response Team at inclusive.vt.edu/resources/brt.html",
          estimated_timeline: "Can be done immediately, 24/7",
        },
        {
          step_number: 2,
          action:
            "A Bias Response Team coordinator will contact you within 3 business days to discuss next steps",
          estimated_timeline: "Within 3 business days",
        },
        {
          step_number: 3,
          action:
            "Optionally, request a meeting with the Office for Equity and Accessibility to explore formal complaint options",
          estimated_timeline: "Schedule within 1–2 weeks",
        },
        {
          step_number: 4,
          action:
            "Document any additional incidents or witnesses in writing for your records",
          estimated_timeline: "Ongoing",
        },
      ],
      draft_statement:
        "I am submitting this report to document a bias incident that occurred on [date] at [location] at Virginia Tech. During a study group session, I was subjected to racially charged remarks directed at me in the presence of other students. This conduct created a hostile and unwelcoming environment that interfered with my ability to participate fully in academic activities. I am requesting that the Bias Response Team review this matter and provide guidance on available support resources and next steps. I am prepared to provide additional information as needed.",
    },
  };
}

export async function saveReport(incidentRecord, advice, navigation) {
  await delay(600);
  return {
    retrieval_token: "demo-token-" + Math.random().toString(36).slice(2, 10),
    saved_at: new Date().toISOString(),
  };
}

export async function retrieveReport(sessionId) {
  await delay(400);
  return { error: "No report found for this token." };
}
