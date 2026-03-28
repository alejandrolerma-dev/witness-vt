"""
Documenter agent — converts raw incident text into a structured Incident_Record JSON.

Severity is computed DETERMINISTICALLY by Python rules after Claude extracts
incident_type and bias_category. Claude cannot override severity.
"""
import json
import logging
import os
import re

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Valid enum values
# ---------------------------------------------------------------------------
VALID_INCIDENT_TYPES = {"verbal", "physical", "written", "online", "property", "other"}
VALID_BIAS_CATEGORIES = {
    "race", "ethnicity", "religion", "gender", "sexual_orientation",
    "disability", "national_origin", "other"
}
VALID_SEVERITY = {"low", "medium", "high"}

REQUIRED_FIELDS = {
    "incident_type", "date_context", "location_context",
    "bias_category", "description_summary", "severity_indicator",
}

# ---------------------------------------------------------------------------
# Deterministic severity engine
# Rules are applied in order — first match wins (highest → lowest)
# ---------------------------------------------------------------------------

# HIGH severity keyword signals in raw text
_HIGH_SIGNALS = [
    # Physical
    r"\b(push(ed)?|shov(ed)?|hit|struck|assault(ed)?|attack(ed)?|grab(bed)?|chok(ed)?|block(ed)?)\b",
    # Threats
    r"\b(threat(en(ed)?)?|intimidat(ed)?|scar(ed)?|afraid|fear(ful)?|watch(ing)? (you|me)|follow(ing)?|stalk(ing)?)\b",
    r"\b(leave campus|get out|you('ll| will) regret|watch your back|i know where)\b",
    # Repeated / ongoing
    r"\b(again|second time|third time|keep(s)? (doing|happening)|repeated|ongoing|multiple times|every (day|week|time))\b",
    # Residence targeting
    r"\b(dorm|room|door|apartment|locker|car|vehicle)\b.{0,60}\b(slur|symbol|graffiti|note|threat|vandal)\b",
    r"\b(slur|symbol|graffiti|note|threat|vandal)\b.{0,60}\b(dorm|room|door|apartment|locker|car|vehicle)\b",
    # Stalking / monitoring
    r"\b(know(s)? my (schedule|class|location|address)|following me|watching me|tracking)\b",
    # Identity theft / impersonation
    r"\b(fake (account|profile)|impersonat(ed?|ing)|pretend(ing)? to be me)\b",
    # Disability equipment
    r"\b(wheelchair|hearing aid|cane|prosthetic|accommodation equipment)\b.{0,40}\b(mov(ed)?|hid(den)?|stolen|taken|tamper)\b",
]

# HIGH if incident_type is physical or property
_HIGH_INCIDENT_TYPES = {"physical"}

# MEDIUM keyword signals
_MEDIUM_SIGNALS = [
    # Authority figure
    r"\b(professor|instructor|ta|teaching assistant|advisor|ra|resident advisor|coach|supervisor|dean)\b",
    # Academic impact
    r"\b(grade|assignment|class|course|lab|project|group|partner|team|study group)\b.{0,60}\b(refus|exclud|avoid|won't|wouldn't|can't|couldn't)\b",
    r"\b(exclud(ed)?|left out|isolat(ed)?|ostraciz(ed)?|no one (will|wants to))\b",
    # Hostile environment
    r"\b(hostile|uncomfortable|unwelcom(e|ing)|unsafe|discriminat)\b",
    # Online harassment (non-threatening)
    r"\b(post(ed)?|messag(e|ed)|dm|comment(ed)?|group chat|meme|screenshot)\b",
]

# Property theft/damage is ALWAYS at least medium (Clery Act)
_PROPERTY_ALWAYS_MEDIUM = True


def _compute_severity(raw_text: str, incident_type: str) -> str:
    """
    Deterministically compute severity from raw text and incident_type.
    This overrides whatever Claude returned.
    """
    text_lower = raw_text.lower()

    # Physical contact is always high
    if incident_type == "physical":
        return "high"

    # Check high signals first
    for pattern in _HIGH_SIGNALS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return "high"

    # Property crime — always at least medium, high if bias-motivated signals present
    if incident_type == "property":
        # Check if there are bias-motivated signals alongside the property crime
        bias_property_signals = [
            r"\b(slur|hate|racist|homophob|transphob|antisemit|islamophob|symbol|swastika|graffiti)\b",
            r"\b(because (of|i('m| am))|targeting|on purpose|intentional)\b",
        ]
        for pattern in bias_property_signals:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return "high"
        return "medium"  # plain theft/damage without bias signals = medium

    # Check medium signals
    for pattern in _MEDIUM_SIGNALS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return "medium"

    # Default: low for single ambiguous incidents
    return "low"


# ---------------------------------------------------------------------------
# Load few-shot examples for Claude's incident_type / bias_category extraction
# ---------------------------------------------------------------------------
def _load_examples() -> str:
    try:
        examples_path = os.path.join(os.path.dirname(__file__), "incident_examples.json")
        with open(examples_path, "r") as f:
            data = json.load(f)

        lines = ["CLASSIFICATION EXAMPLES (for incident_type and bias_category only):", ""]
        for ex in data["examples"][:10]:
            lines.append(f'Input: "{ex["raw_text"]}"')
            lines.append(f'→ incident_type: {ex["incident_type"]}, bias_category: {ex["bias_category"]}')
            lines.append("")
        return "\n".join(lines)
    except Exception:
        return ""


_FEW_SHOT_CONTEXT = _load_examples()

# ---------------------------------------------------------------------------
# Prompts — Claude only classifies incident_type, bias_category, and extracts text fields
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a structured data extractor for a bias incident reporting system at Virginia Tech.\n"
    "Your job is to convert a student's plain-text incident description into a structured JSON record.\n\n"
    + _FEW_SHOT_CONTEXT
    + "\nRULES:\n"
    "- CRITICAL: Only extract information EXPLICITLY stated by the student. Never infer, assume, or invent details.\n"
    "- If the student did not mention a date or time, set date_context to \"Not specified\".\n"
    "- If the student did not mention a location, set location_context to \"Not specified\".\n"
    "- If additional structured fields (when, where, witnesses) are provided, use those values directly.\n"
    "- Remove or replace any names, email addresses, VT IDs, phone numbers with \"[REDACTED]\".\n"
    "- For description_summary: write 1-3 sentences using ONLY what the student explicitly described. No added context.\n"
    "- For severity_indicator: set it to \"medium\" — the system will compute the real severity automatically.\n"
    "- Be factual and neutral. Do not editorialize.\n"
    "- Output only valid JSON. No prose, no markdown, no explanation."
)

_USER_TEMPLATE = (
    "Convert the following incident description into a structured JSON record.\n\n"
    "Incident description:\n"
    "<incident>\n"
    "{raw_text}\n"
    "</incident>\n"
    "{structured_fields}"
)


class DocumenterError(Exception):
    """Raised when the Documenter agent cannot produce a valid Incident_Record."""


def document(raw_text: str, structured_fields: dict | None = None) -> dict:
    """
    Convert raw incident text into a validated Incident_Record dict.
    Severity is computed deterministically — Claude's severity value is ignored.
    """
    fields_block = ""
    if structured_fields:
        lines = []
        if structured_fields.get("when"):
            lines.append(f"When it happened (provided by student): {structured_fields['when']}")
        if structured_fields.get("where"):
            lines.append(f"Where it happened (provided by student): {structured_fields['where']}")
        if structured_fields.get("witnesses") is not None:
            lines.append(f"Witnesses present: {'Yes' if structured_fields['witnesses'] else 'No'}")
        if lines:
            fields_block = "\n\nAdditional details provided by the student:\n" + "\n".join(lines)

    user_message = _USER_TEMPLATE.format(raw_text=raw_text, structured_fields=fields_block)

    response_text = invoke(SYSTEM_PROMPT, user_message)

    try:
        record = json.loads(response_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error(json.dumps({"status": "documenter_parse_error"}))
        raise DocumenterError("Documenter returned invalid JSON.") from exc

    missing = REQUIRED_FIELDS - record.keys()
    if missing:
        logger.error(json.dumps({"status": "documenter_missing_fields", "fields": sorted(missing)}))
        raise DocumenterError(f"Documenter response missing fields: {sorted(missing)}")

    # Coerce invalid enum values
    if record["incident_type"] not in VALID_INCIDENT_TYPES:
        record["incident_type"] = "other"
    if record["bias_category"] not in VALID_BIAS_CATEGORIES:
        record["bias_category"] = "other"

    # ── OVERRIDE severity with deterministic rule engine ──────────────────
    # Claude's severity value is discarded. We compute it from the raw text.
    record["severity_indicator"] = _compute_severity(raw_text, record["incident_type"])

    return record
