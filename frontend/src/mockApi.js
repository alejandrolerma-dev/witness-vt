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
  physical:  [/assault/, /\bhit\b/, /punch/, /push/, /shov/, /kick/, /grab/, /chok/, /attack/, /physical/, /threw/, /spit/, /block/, /beat/, /corner/, /\brape/, /molest/, /grope/, /fondl/, /forced/, /non.?consensual/],
  online:    [/post/, /tweet/, /messag/, /\bemail\b/, /online/, /social media/, /instagram/, /facebook/, /\bdm\b/, /discord/, /snapchat/, /tiktok/, /comment/, /tagged/],
  written:   [/\bnote\b/, /\bsign\b/, /written/, /graffiti/, /letter/, /flyer/, /poster/, /whiteboard/, /chalk/],
  property:  [/damage/, /vandal/, /destroy/, /broke/, /stolen/, /stole/, /took my/, /keyed/, /slashed/, /property/],
  verbal:    [/\bsaid\b/, /\btold\b/, /called me/, /slur/, /remark/, /\bcomment/, /yell/, /shout/, /\bspoke\b/, /\bwords\b/, /\bvoice\b/, /\bmouth\b/],
};

const BIAS_SIGNALS = {
  race:               [/race/, /racial/, /racist/, /\bblack\b/, /\bwhite\b/, /\basian\b/, /hispanic/, /latino/, /latina/, /african/, /\bcolor\b/, /\bn-word\b/, /slur/],
  religion:           [/religion/, /religious/, /muslim/, /jewish/, /christian/, /hindu/, /sikh/, /faith/, /pray/, /mosque/, /church/, /temple/, /hijab/, /turban/],
  gender:             [/gender/, /\bwoman\b/, /\bwomen\b/, /\bgirl\b/, /\bman\b/, /\bmale\b/, /\bfemale\b/, /sexist/, /misogyn/, /sexu/, /\bshe\b.*\bhe\b|\bhe\b.*\bshe\b/, /\brape/, /molest/, /grope/, /fondl/, /non.?consensual/, /title.?ix/],
  sexual_orientation: [/gay/, /lesbian/, /queer/, /\blgbt/, /bisexual/, /homophob/, /orientation/, /\bfag/, /dyke/],
  disability:         [/disabilit/, /disabled/, /wheelchair/, /\bblind\b/, /\bdeaf\b/, /mental health/, /neurodiverg/, /autis/, /adhd/],
  national_origin:    [/national origin/, /immigrant/, /foreign/, /accent/, /\bwhere.*from\b/, /citizenship/, /undocumented/, /visa/],
  ethnicity:          [/ethnic/, /ethnicity/, /heritage/, /culture/, /\btribal\b/],
};

const SEVERITY_SIGNALS = {
  high:   [
    // Sexual violence & sexual harassment
    /\brape[ds]?\b/, /\braped\b/, /\brapin/, /sexual(ly)? assault/, /sexual(ly)? violen/, /molest/, /grope[ds]?/, /fondl/,
    /forced .{0,20}(sex|kiss|touch|oral|penetr)/, /non.?consensual/, /without (my )?consent/,
    /sexual(ly)? harass/, /sexual(ly)? miscon/, /sexual(ly)? abus/,
    // Physical violence
    /assault/, /attack/, /\bhit\b/, /punch/, /push/, /shov/, /kick/, /chok/, /stab/, /weapon/, /\bgun\b/, /\bknife\b/, /beat/,
    // Threats & fear
    /\bthreat/, /intimidat/, /unsafe/, /scared/, /\bfear/, /\bafraid/, /watch your back/, /you('ll| will) regret/,
    /kill/, /\bdie\b/, /\bdeath\b/,
    // Physical harm indicators
    /hurt me/, /injur/, /bleed/, /hospital/, /ambulance/, /police/, /911/,
    // Stalking
    /stalk/, /follow(ing|ed) me/, /watching me/, /tracking/,
    // Repeated/ongoing
    /repeated/, /multiple times/, /ongoing/, /every (day|week|time)/, /again and again/, /keeps? (doing|happening)/,
    // Residence targeting
    /\b(dorm|room|door)\b.{0,40}\b(slur|symbol|graffiti|threat|vandal)\b/,
  ],
  medium: [
    /remark/, /comment/, /slur/, /discriminat/, /hostile/, /harass/, /uncomfortable/, /unwelcome/,
    /targeted/, /excluded/, /isolated/, /mocked/, /humiliat/,
    // Authority figures
    /professor/, /instructor/, /\bta\b/, /advisor/, /\bra\b/, /coach/, /supervisor/,
    // Property
    /vandal/, /damage/, /destroy/, /broke/, /stolen/, /stole/,
  ],
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

function resolveRelativeDate(match) {
  const now = new Date();
  const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lower = match.toLowerCase().trim();

  if (/^today$|^this morning$|^this afternoon$|^this evening$|^tonight$/.test(lower)) {
    return fmt(now);
  }
  if (lower === 'yesterday') {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    return fmt(d);
  }

  const daysAgoMatch = lower.match(/^(a few|several|two|three|(\d+))\s+(days|weeks)\s+ago$/);
  if (daysAgoMatch) {
    const unit = daysAgoMatch[3];
    const numMap = { 'a few': 3, 'several': 5, 'two': 2, 'three': 3 };
    const num = numMap[daysAgoMatch[1]] || parseInt(daysAgoMatch[2]) || 3;
    const d = new Date(now);
    d.setDate(d.getDate() - (unit === 'weeks' ? num * 7 : num));
    return fmt(d);
  }

  const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const lastDayMatch = lower.match(/^(?:last|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
  if (lastDayMatch) {
    const target = dayNames.indexOf(lastDayMatch[1]);
    const current = now.getDay();
    let diff = current - target;
    if (diff <= 0) diff += 7;
    if (lower.startsWith('last') && diff < 7) diff += 7;
    const d = new Date(now); d.setDate(d.getDate() - diff);
    return fmt(d);
  }

  return match.trim();
}

function extractDateContext(text) {
  const patterns = [
    /(?:last|this)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:yesterday|today|tonight|this morning|this afternoon|this evening)/i,
    /(?:on\s+)?(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
    /\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/,
    /(?:a few|several|two|three|\d+)\s+(?:days|weeks)\s+ago/i,
    /(?:during|after|before)\s+(?:class|lecture|lab|practice|the game|the event|the meeting)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return resolveRelativeDate(m[0]);
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
  physical:  { policy: "Dean of Students", url: "https://dos.vt.edu", office: "Virginia Tech Dean of Students Office" },
  online:    { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)" },
  written:   { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)" },
  property:  { policy: "Dean of Students", url: "https://dos.vt.edu", office: "Virginia Tech Dean of Students Office" },
  verbal:    { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)" },
  other:     { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)" },
};

const BIAS_POLICY_MAP = {
  gender:             { policy: "Title IX", url: "https://safe.vt.edu", office: "Virginia Tech Title IX / Safe at VT" },
  sexual_orientation: { policy: "Title IX", url: "https://safe.vt.edu", office: "Virginia Tech Title IX / Safe at VT" },
};

function _resolvePolicy(incidentType, biasCategory) {
  if (BIAS_POLICY_MAP[biasCategory]) return BIAS_POLICY_MAP[biasCategory];
  return POLICY_MAP[incidentType] || POLICY_MAP.other;
}

function buildAdvice(incidentType, biasCategory, severity) {
  const p = _resolvePolicy(incidentType, biasCategory);
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
  const p = _resolvePolicy(incidentType, biasCategory);
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
      estimated_timeline: "Schedule within 1-2 weeks",
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

// --- Persistent store for demo retrieval (survives refresh within same tab) ---
const STORAGE_KEY = 'witness_demo_reports';

function _loadReports() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function _saveToStorage(token, report) {
  const reports = _loadReports();
  reports[token] = report;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
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
  const token = "demo-token-" + Math.random().toString(36).slice(2, 10);
  const saved_at = new Date().toISOString();
  _saveToStorage(token, { incident_record: incidentRecord, advice, navigation, saved_at });
  return { retrieval_token: token, saved_at };
}

export async function retrieveReport(sessionId) {
  await delay(400);
  const report = _loadReports()[sessionId];
  if (!report) {
    return { error: "No report found for this token." };
  }
  return report;
}
