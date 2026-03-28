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
  physical:  [/assault/, /\bhit\b/, /punch/, /push/, /shov/, /kick/, /grab/, /chok/, /attack/, /physical/, /threw/, /spit/, /block/, /corner/, /\brape/, /molest/, /grope/, /fondl/, /forced/, /non.?consensual/,/sexual harassment/,/sexually harass/],
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
    /forced .{0,20}(sex|kiss|touch|oral|penetr)/, /non.?consensual/, /without (my )?consent/,/sexual harassment/,/sexually harass(ed|ment)?/,
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

function detectSeverity(text, incidentType) {
  const t = text.toLowerCase();
  if (incidentType === "physical") return "high";
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
  physical:  { policy: "Dean of Students", url: "https://dos.vt.edu", office: "Virginia Tech Dean of Students Office", email: "deanofstudents@vt.edu" },
  online:    { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)", email: "oea@vt.edu" },
  written:   { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)", email: "oea@vt.edu" },
  property:  { policy: "Dean of Students", url: "https://dos.vt.edu", office: "Virginia Tech Dean of Students Office", email: "deanofstudents@vt.edu" },
  verbal:    { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)", email: "oea@vt.edu" },
  other:     { policy: "Bias Response Team", url: "https://oea.vt.edu/harassment-discrimination.html", office: "VT Office for Civil Rights Compliance (CRCPE)", email: "oea@vt.edu" },
};

const BIAS_POLICY_MAP = {
  gender:             { policy: "Title IX", url: "https://safe.vt.edu", office: "Virginia Tech Title IX / Safe at VT", email: "titleix@vt.edu" },
  sexual_orientation: { policy: "Title IX", url: "https://safe.vt.edu", office: "Virginia Tech Title IX / Safe at VT", email: "titleix@vt.edu" },
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
    vt_contact: { office: p.office, url: p.url, email: p.email },
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

// --- Persistent store for demo retrieval (localStorage = survives tabs, refresh, browser restart) ---
const STORAGE_KEY = 'witness_demo_reports';
const AGGREGATE_KEY = 'witness_demo_aggregates';

function _loadReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function _saveToStorage(token, report) {
  const reports = _loadReports();
  reports[token] = report;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function _loadAggregates() {
  try {
    return JSON.parse(localStorage.getItem(AGGREGATE_KEY)) || [];
  } catch { return []; }
}

function _recordAggregate(incidentRecord) {
  const aggregates = _loadAggregates();
  const now = new Date();
  aggregates.push({
    incident_type: incidentRecord.incident_type || 'other',
    bias_category: incidentRecord.bias_category || 'other',
    severity: incidentRecord.severity_indicator || 'low',
    location: incidentRecord.location_context || 'Not specified',
    month: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    timestamp: now.toISOString(),
  });
  localStorage.setItem(AGGREGATE_KEY, JSON.stringify(aggregates));
}

// --- Emergency detection ---

const EMERGENCY_PATTERNS = [
  /\b(suicid|kill (my|him|her|them)self|end (my|their) life|don'?t want to (live|be alive))\b/i,
  /\b(want(ing)? to die|better off dead|no reason to live)\b/i,
  /\b(has a (gun|knife|weapon)|bomb threat|active shooter|brought a weapon)\b/i,
  /\b(being attacked|attacking me|won'?t let me leave|can'?t (escape|get away|leave))\b/i,
  /\b(locked (me )?in|holding me|trapped|hostage)\b/i,
  /\b(need(s)? (help|911) (now|immediately|right now)|call (the )?police|in (immediate )?danger)\b/i,
  /\b(life.?threatening|medical emergency)\b/i,
];

const EMERGENCY_RESOURCES = [
  { name: "Emergency Services", contact: "911", description: "For immediate danger or medical emergency", type: "phone" },
  { name: "VT Police", contact: "540-231-6411", description: "Virginia Tech Police Department — available 24/7", type: "phone" },
  { name: "988 Suicide & Crisis Lifeline", contact: "988", description: "Free, confidential support 24/7 — call or text", type: "phone" },
  { name: "Crisis Text Line", contact: "Text HOME to 741741", description: "Free crisis counseling via text message", type: "text" },
  { name: "Cook Counseling Center", contact: "540-231-6557", description: "VT campus mental health — same-day appointments available", type: "phone" },
];

function detectEmergency(text) {
  const t = text.toLowerCase();
  for (const p of EMERGENCY_PATTERNS) {
    if (p.test(t)) return { detected: true, resources: EMERGENCY_RESOURCES };
  }
  return null;
}

// --- Support resources ---

const BASE_RESOURCES = [
  { name: "Cook Counseling Center", contact: "540-231-6557", url: "https://ucc.vt.edu", description: "Free confidential counseling for all VT students — same-day crisis appointments available", type: "counseling" },
  { name: "Dean of Students Office", contact: "540-231-3787", url: "https://dos.vt.edu", description: "Advocacy, emergency funding, and academic support during difficult situations", type: "advocacy" },
];

const CATEGORY_RESOURCES = {
  gender: [
    { name: "Women's Center at Virginia Tech", contact: "540-231-7806", url: "https://womenscenter.vt.edu", description: "Support, advocacy, and programming for gender-based concerns", type: "support" },
    { name: "CARES (Survivors Support)", contact: "540-231-0045", url: "https://safe.vt.edu", description: "Confidential 24/7 support — does NOT trigger a mandatory report", type: "crisis" },
  ],
  sexual_orientation: [
    { name: "LGBTQ+ Resource Center", contact: "540-231-3785", url: "https://lgbtq.vt.edu", description: "Community, support groups, and advocacy for LGBTQ+ students", type: "support" },
    { name: "CARES (Survivors Support)", contact: "540-231-0045", url: "https://safe.vt.edu", description: "Confidential 24/7 support — does NOT trigger a mandatory report", type: "crisis" },
  ],
  race: [
    { name: "Black Cultural Center", contact: "540-231-1834", url: "https://mlfs.vt.edu/bcc.html", description: "Community space, programming, and support for Black students", type: "support" },
    { name: "Multicultural Programs & Services", contact: "540-231-1820", url: "https://mlfs.vt.edu", description: "Advocacy and resources for students of color", type: "support" },
  ],
  ethnicity: [
    { name: "Multicultural Programs & Services", contact: "540-231-1820", url: "https://mlfs.vt.edu", description: "Advocacy and resources for underrepresented students", type: "support" },
  ],
  religion: [
    { name: "Interfaith Engagement", contact: "540-231-3787", url: "https://dos.vt.edu", description: "Interfaith support and religious accommodation advocacy", type: "support" },
  ],
  national_origin: [
    { name: "Cranwell International Center", contact: "540-231-6527", url: "https://international.vt.edu", description: "Immigration advising, advocacy, and support for international students", type: "support" },
  ],
  disability: [
    { name: "Services for Students with Disabilities", contact: "540-231-3788", url: "https://ssd.vt.edu", description: "Accommodation support and disability rights advocacy", type: "support" },
  ],
};

const HIGH_SEVERITY_RESOURCES = [
  { name: "VT Police Department", contact: "540-231-6411", url: "https://police.vt.edu", description: "For incidents involving physical harm, threats, or criminal activity", type: "safety" },
  { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", description: "Free, confidential 24/7 crisis support", type: "crisis" },
];

function getSupportResources(biasCategory, severity) {
  const resources = [...BASE_RESOURCES];
  if (CATEGORY_RESOURCES[biasCategory]) resources.push(...CATEGORY_RESOURCES[biasCategory]);
  if (severity === "high") resources.push(...HIGH_SEVERITY_RESOURCES);
  return resources;
}

// --- Impact stats (demo data) ---

export async function getStats() {
  await delay(300);
  const aggregates = _loadAggregates();
  const now = new Date();
  const thisMonth = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const thisMonthCount = aggregates.filter(a => a.month === thisMonth).length;
  return { total_reports: aggregates.length, reports_this_month: thisMonthCount };
}

// --- Analytics data (computed from anonymous aggregates — no PII) ---

// Known VT campus locations → verified coordinates from campus-maps.com
const LOCATION_COORDS_MAP = {
  "torgersen":              { lat: 37.229750, lng: -80.420201 },
  "newman":                 { lat: 37.228934, lng: -80.419214 },
  "library":                { lat: 37.228934, lng: -80.419214 },
  "squires":                { lat: 37.229555, lng: -80.418018 },
  "student center":         { lat: 37.229555, lng: -80.418018 },
  "goodwin":                { lat: 37.231016, lng: -80.424402 },
  "mcbryde":                { lat: 37.230527, lng: -80.421695 },
  "burruss":                { lat: 37.229053, lng: -80.423766 },
  "norris":                 { lat: 37.229705, lng: -80.423364 },
  "drill field":            { lat: 37.227500, lng: -80.422000 },
  "drillfield":             { lat: 37.227500, lng: -80.422000 },
  "dietrick":               { lat: 37.224545, lng: -80.421081 },
  "d2":                     { lat: 37.224545, lng: -80.421081 },
  "dining":                 { lat: 37.224545, lng: -80.421081 },
  "owens":                  { lat: 37.226621, lng: -80.418954 },
  "derring":                { lat: 37.228996, lng: -80.425619 },
  "randolph":               { lat: 37.230719, lng: -80.423192 },
  "whittemore":             { lat: 37.231016, lng: -80.424402 },
  "hahn":                   { lat: 37.228445, lng: -80.426381 },
  "lavery":                 { lat: 37.231215, lng: -80.422822 },
  "davidson":               { lat: 37.226858, lng: -80.424973 },
  "robeson":                { lat: 37.228150, lng: -80.425169 },
  "hancock":                { lat: 37.230386, lng: -80.424461 },
  "henderson":              { lat: 37.230348, lng: -80.416905 },
  "pamplin":                { lat: 37.228671, lng: -80.424670 },
  "war memorial":           { lat: 37.226354, lng: -80.420636 },
  "cassell":                { lat: 37.222591, lng: -80.418962 },
  "ambler johnston":        { lat: 37.223129, lng: -80.420917 },
  "slusher":                { lat: 37.225243, lng: -80.421668 },
  "pritchard":              { lat: 37.224201, lng: -80.419440 },
  "eggleston":              { lat: 37.227420, lng: -80.420091 },
  "dorm":                   { lat: 37.223129, lng: -80.420917 },
  "residence":              { lat: 37.223129, lng: -80.420917 },
  "campus":                 { lat: 37.228000, lng: -80.422000 },
  "parking":                { lat: 37.219660, lng: -80.413788 },
};

function _matchLocation(locStr) {
  if (!locStr || locStr === 'Not specified') return null;
  const lower = locStr.toLowerCase();
  for (const [name, coords] of Object.entries(LOCATION_COORDS_MAP)) {
    if (lower.includes(name)) return { location: locStr, ...coords };
  }
  return { location: locStr, lat: null, lng: null };
}

export async function getAnalytics() {
  await delay(500);
  const aggregates = _loadAggregates();

  // Count by each dimension from the anonymous aggregate records
  const catCounts = {};
  const sevCounts = {};
  const typeCounts = {};
  const locCounts = {};
  const monthCounts = {};

  for (const a of aggregates) {
    catCounts[a.bias_category] = (catCounts[a.bias_category] || 0) + 1;
    sevCounts[a.severity] = (sevCounts[a.severity] || 0) + 1;
    typeCounts[a.incident_type] = (typeCounts[a.incident_type] || 0) + 1;
    locCounts[a.location] = (locCounts[a.location] || 0) + 1;
    monthCounts[a.month] = (monthCounts[a.month] || 0) + 1;
  }

  return {
    total_reports: aggregates.length,
    by_category: Object.entries(catCounts).map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    by_severity: Object.entries(sevCounts).map(([severity, count]) => ({ severity, count }))
      .sort((a, b) => b.count - a.count),
    by_type: Object.entries(typeCounts).map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    by_location: Object.entries(locCounts).map(([loc, count]) => {
      const match = _matchLocation(loc);
      return match ? { ...match, count } : { location: loc, count, lat: null, lng: null };
    }).sort((a, b) => b.count - a.count),
    by_month: Object.entries(monthCounts).map(([month, count]) => ({ month, count })),
  };
}

// --- Exports ---

export async function processIncident(rawText, structuredFields) {
  await delay(1500);

  const dateContext = structuredFields?.when || extractDateContext(rawText);
  const locationContext = structuredFields?.where || extractLocationContext(rawText);
  const incidentType = detectIncidentType(rawText);
  const biasCategory = detectBiasCategory(rawText);
  const severity = detectSeverity(rawText, incidentType);
  const summary = buildSummary(rawText, incidentType, biasCategory, severity);

  const result = {
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
    support_resources: getSupportResources(biasCategory, severity),
  };

  const emergency = detectEmergency(rawText);
  if (emergency) result.emergency = emergency;

  return result;
}

export async function saveReport(incidentRecord, advice, navigation) {
  await delay(600);
  const token = "demo-token-" + Math.random().toString(36).slice(2, 10);
  const saved_at = new Date().toISOString();
  _saveToStorage(token, { incident_record: incidentRecord, advice, navigation, saved_at });
  // Record anonymous aggregate (persists in localStorage across sessions)
  _recordAggregate(incidentRecord);
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
