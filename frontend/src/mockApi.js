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

// --- NLP helpers ---

const INCIDENT_SIGNALS = {
  physical:  [/assault/, /\bhit\b/, /punch/, /push/, /shov/, /kick/, /grab/, /chok/, /attack/, /physical/, /threw/, /spit/, /block/,/beat/, /corner/],
  online:    [/post/, /tweet/, /messag/, /\bemail\b/, /online/, /social media/, /instagram/, /facebook/, /\bdm\b/, /discord/, /snapchat/, /tiktok/, /comment/, /tagged/],
  written:   [/\bnote\b/, /\bsign\b/, /written/, /graffiti/, /letter/, /flyer/, /poster/, /whiteboard/, /chalk/],
  property:  [/damage/, /vandal/, /destroy/, /broke/, /stolen/, /stole/, /took my/, /keyed/, /slashed/, /property/],
  verbal:    [/\bsaid\b/, /\btold\b/, /called me/, /slur/, /remark/, /\bcomment/, /yell/, /shout/, /\bspoke\b/, /\bwords\b/, /\bvoice\b/, /\bmouth\b/],
};

const BIAS_SIGNALS = {
  race:               [/race/, /racial/, /racist/, /\bblack\b/, /\bwhite\b/, /\basian\b/, /hispanic/, /latino/, /latina/, /african/, /\bcolor\b/, /\bn-word\b/, /slur/],
  religion:           [/religion/, /religious/, /muslim/, /jewish/, /christian/, /hindu/, /sikh/, /faith/, /pray/, /mosque/, /church/, /temple/, /hijab/, /turban/],
  gender:             [/gender/, /\bwoman\b/, /\bwomen\b/, /\bgirl\b/, /\bman\b/, /\bmale\b/, /\bfemale\b/, /sexist/, /misogyn/, /sexu/, /\bshe\b.*\bhe\b|\bhe\b.*\bshe\b/],
  sexual_orientation: [/gay/, /lesbian/, /queer/, /\blgbt/, /bisexual/, /homophob/, /orientation/, /\bfag/, /dyke/],
  disability:         [/disabilit/, /disabled/, /wheelchair/, /\bblind\b/, /\bdeaf\b/, /mental health/, /neurodiverg/, /autis/, /adhd/],
  national_origin:    [/national origin/, /immigrant/, /foreign/, /accent/, /\bwhere.*from\b/, /citizenship/, /undocumented/, /visa/],
  ethnicity:          [/ethnic/, /ethnicity/, /heritage/, /culture/, /\btribal\b/],
};

const SEVERITY_SIGNALS = {
  high:   [/assault/, /attack/, /\bthreat/, /weapon/, /\bhit\b/, /punch/, /push/, /shov/, /kick/, /unsafe/, /scared/, /fear/, /chok/, /physical/, /hurt me/, /injured/, /bleed/, /hospital/, /police/, /repeated/, /multiple times/, /ongoing/, /stalking/],
  medium: [/remark/, /comment/, /slur/, /discriminat/, /hostile/, /harass/, /uncomfortable/, /unwelcome/, /targeted/, /excluded/, /isolated/, /mocked/, /humiliat/],
};

function score(text, signals) {
  const t = text.toLowerCase();
  const scores = {};
  for (const [category, patterns] of Object.entries(signals)) {
    scores[category] = patterns.filter(p => p.test(t)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : null;
}

function detectIncidentType(text) {
  return score(text, INCIDENT_SIGNALS) || "other";
}

function detectBiasCategory(text) {
  return score(text, BIAS_SIGNALS) || "other";
}

function detectSeverity(text) {
  const t = text.toLowerCase();
  const high = SEVERITY_SIGNALS.high.filter(p => p.test(t)).length;
  const medium = SEVERITY_SIGNALS.medium.filter(p => p.test(t)).length;
  if (high >= 1) return "high";
  if (medium >= 1) return "medium";
  return "low";
}

function extractDateContext(text) {
  const patterns = [
    /(?:last|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:yesterday|today|tonight|this morning|this afternoon|this evening)/i,
    /(?:on\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
    /\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/,
    /(?:a few|several|two|three)\s+(?:days|weeks)\s+ago/i,
    /(?:during|after|before)\s+(?:class|lecture|lab|practice|the game|the event|the meeting)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0].trim();
  }
  return "Not specified";
}

function extractLocationContext(text) {
  const patterns = [
    /(?:in|at|near|outside|inside|by)\s+([A-Z][a-zA-Z\s]{2,30}(?:Hall|Building|Center|Library|Gym|Stadium|Dorm|House|Lab|Cafe|Dining|Lot|Field|Court|Park|Office|Room|Floor))/,
    /(?:in|at)\s+(the\s+[a-zA-Z\s]{2,25}(?:hall|building|center|library|gym|dorm|cafe|dining|office|room|floor))/i,
    /([A-Z][a-zA-Z]+\s+Hall)/,
    /(?:floor|room|suite)\s+\d+/i,
    /(?:on|at)\s+(?:campus|main street|the quad|the drill field)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return (m[1] || m[0]).trim();
  }
  return "Not specified";
}

function buildSummary(text, incidentType, biasCategory, severity) {
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const core = sentences.slice(0, 2).join(' ').trim();
  const typeLabel = incidentType === "other" ? "incident" : `${incidentType} incident`;
  const biasLabel = biasCategory === "other" ? "bias" : biasCategory.replace("_", " ") + "-based bias";
  const severityLabel = severity === "high" ? "serious" : severity === "medium" ? "hostile" : "uncomfortable";
  return `A student reported a ${severityLabel} ${typeLabel} involving ${biasLabel}. ${core.length > 20 ? core : text.trim().slice(0, 200)}`.trim();
}

const POLICY_MAP = {
  physical:  { policy: "Dean of Students Office", url: "https://dos.vt.edu", office: "Dean of Students Office" },
  online:    { policy: "VT IT Security & Bias Response Team", url: "https://bias.vt.edu", office: "VT Bias Response Team" },
  written:   { policy: "VT Bias Response Team", url: "https://bias.vt.edu", office: "VT Bias Response Team" },
  property:  { policy: "VT Police Department & Dean of Students", url: "https://vtpd.vt.edu", office: "VT Police Department" },
  verbal:    { policy: "VT Bias Response Team", url: "https://bias.vt.edu", office: "VT Bias Response Team" },
  other:     { policy: "Office for Equity and Accessibility", url: "https://oea.vt.edu", office: "Office for Equity and Accessibility" },
};

function buildAdvice(incidentType, biasCategory, severity) {
  const p = POLICY_MAP[incidentType] || POLICY_MAP.other;
  const urgency = severity === "high"
    ? "Given the serious nature of this incident, we strongly encourage you to report as soon as possible and consider contacting VT Police if you feel unsafe."
    : severity === "medium"
    ? "You have the right to report this incident confidentially without fear of retaliation."
    : "Even if you are unsure whether this qualifies as a bias incident, you are encouraged to document and report it.";
  return {
    matched_policy: p.policy,
    policy_ambiguous: false,
    rights_summary: `As a Virginia Tech student, you have the right to report this ${biasCategory.replace("_", " ")}-related incident to the ${p.office}. ${urgency} The office will review your report confidentially and connect you with appropriate support resources. You are not required to identify yourself in your initial report.`,
    vt_contact: { office: p.office, url: p.url },
  };
}

function buildNavigation(incidentType, biasCategory, severity, dateContext, locationContext) {
  const p = POLICY_MAP[incidentType] || POLICY_MAP.other;
  const steps = [
    {
      step_number: 1,
      action: `Submit a report to the ${p.office} at ${p.url}`,
      estimated_timeline: "Can be done immediately, 24/7",
    },
    {
      step_number: 2,
      action: severity === "high"
        ? "If you feel unsafe or the incident involved physical harm, contact VT Police at 540-231-6411 or dial 911"
        : `A coordinator from ${p.office} will follow up within 3 business days`,
      estimated_timeline: severity === "high" ? "Immediately if needed" : "Within 3 business days",
    },
    {
      step_number: 3,
      action: "Optionally, request a meeting with the Office for Equity and Accessibility to explore formal complaint options",
      estimated_timeline: "Schedule within 1–2 weeks",
    },
    {
      step_number: 4,
      action: "Document any additional incidents, witnesses, or evidence in writing for your records",
      estimated_timeline: "Ongoing",
    },
  ];

  const dateStr = dateContext !== "Not specified" ? `on ${dateContext}` : "recently";
  const locStr = locationContext !== "Not specified" ? `at ${locationContext}` : "on campus";
  const draft = `I am submitting this report to document a ${biasCategory.replace("_", " ")}-related ${incidentType} incident that occurred ${dateStr} ${locStr} at Virginia Tech. ${severity === "high" ? "The incident involved serious conduct that made me feel unsafe." : "The conduct created a hostile and unwelcoming environment."} I am requesting that the ${p.office} review this matter and provide guidance on available support resources and next steps. I am prepared to provide additional information as needed.`;

  return { reporting_steps: steps, draft_statement: draft };
}

// --- Exports ---

export async function processIncident(rawText, structuredFields) {
  await delay(1500);

  const dateContext = structuredFields?.when || extractDateContext(rawText);
  const locationContext = structuredFields?.where || extractLocationContext(rawText);
  const incidentType = detectIncidentType(rawText);
  const biasCategory = detectBiasCategory(rawText);
  const severity = detectSeverity(rawText);
  const summary = buildSummary(rawText, incidentType, biasCategory, severity);

  return {
    incident_record: {
      incident_type: incidentType,
      date_context: dateContext,
      location_context: locationContext,
      bias_category: biasCategory,
      description_summary: summary,
      severity_indicator: severity,
    },
    advice: buildAdvice(incidentType, biasCategory, severity),
    navigation: buildNavigation(incidentType, biasCategory, severity, dateContext, locationContext),
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