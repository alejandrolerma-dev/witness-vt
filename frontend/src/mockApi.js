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

function detectIncidentType(text) {
  const t = text.toLowerCase();
  if (/assault|hit|punch|push|shov|kick|grab|touch|attack|physical/.test(t)) return "physical";
  if (/post|tweet|messag|text|email|online|social media|instagram|facebook|dm|comment/.test(t)) return "online";
  if (/note|sign|written|graffiti|letter|flyer|poster/.test(t)) return "written";
  if (/damage|vandal|destroy|broke|stolen|property/.test(t)) return "property";
  if (/said|told|called|slur|remark|comment|verbal|yell|shout|spoke/.test(t)) return "verbal";
  return "other";
}

function detectBiasCategory(text) {
  const t = text.toLowerCase();
  if (/race|racial|racist|black|white|asian|hispanic|latino|african/.test(t)) return "race";
  if (/religion|religious|muslim|jewish|christian|hindu|faith|pray/.test(t)) return "religion";
  if (/gender|woman|man|female|male|sexist|misogyn/.test(t)) return "gender";
  if (/gay|lesbian|queer|lgbt|sexual orientation|homophob/.test(t)) return "sexual_orientation";
  if (/disabilit|disabled|wheelchair|blind|deaf/.test(t)) return "disability";
  if (/ethnic|ethnicity|national origin|immigrant|foreign/.test(t)) return "ethnicity";
  return "other";
}

function detectSeverity(text) {
  const t = text.toLowerCase();
  if (/assault|attack|threat|weapon|physical|hit|punch|push|shov|kick|unsafe|scared|fear/.test(t)) return "high";
  if (/remark|comment|slur|discriminat|hostile|harass/.test(t)) return "medium";
  return "low";
}

export async function processIncident(rawText, structuredFields) {
  await delay(1500);
  const dateContext = structuredFields?.when || 'Not specified';
  const locationContext = structuredFields?.where || 'Not specified';
  const trimmed = rawText.trim();
  const summary = trimmed.length > 180
    ? trimmed.slice(0, 180).replace(/\s+\S*$/, '') + '…'
    : trimmed;
  return {
    incident_record: {
      incident_type: detectIncidentType(rawText),
      date_context: dateContext,
      location_context: locationContext,
      bias_category: detectBiasCategory(rawText),
      description_summary: summary,
      severity_indicator: detectSeverity(rawText),
    },
    advice: {
      matched_policy: "Bias Response Team",
      policy_ambiguous: false,
      rights_summary:
        "As a Virginia Tech student, you have the right to report this incident to the Bias Response Team without fear of retaliation. The team will review your report confidentially and connect you with appropriate support resources. You may also choose to pursue a formal complaint through the Office for Equity and Accessibility. You are not required to identify yourself in your initial report.",
      vt_contact: {
        office: "VT Office for Civil Rights Compliance (CRCPE)",
        url: "https://oea.vt.edu/harassment-discrimination.html",
      },
    },
    navigation: {
      reporting_steps: [
        {
          step_number: 1,
          action: "Submit an online report to VT Civil Rights Compliance at oea.vt.edu/harassment-discrimination.html",
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
