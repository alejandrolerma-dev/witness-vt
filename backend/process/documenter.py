"""
Documenter agent — converts raw incident text into a structured Incident_Record JSON.
Uses few-shot examples from incident_examples.json for accurate classification.
"""
import json
import logging
import os

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Valid enum values
# ---------------------------------------------------------------------------
VALID_INCIDENT_TYPES = {"verbal", "physical", "written", "online", "property", "other"}
VALID_BIAS_CATEGORIES = {"race", "ethnicity", "religion", "gender", "sexual_orientation", "disability", "national_origin", "other"}
VALID_SEVERITY = {"low", "medium", "high"}

REQUIRED_FIELDS = {
    "incident_type",
    "date_context",
    "location_context",
    "bias_category",
    "description_summary",
    "severity_indicator",
}

# ---------------------------------------------------------------------------
# Load few-shot examples once at module level
# ---------------------------------------------------------------------------
def _load_examples() -> str:
    """Load incident examples and format them as few-shot prompt context."""
    try:
        examples_path = os.path.join(os.path.dirname(__file__), "incident_examples.json")
        with open(examples_path, "r") as f:
            data = json.load(f)

        lines = ["CLASSIFICATION GUIDELINES:", ""]

        # Severity guidelines
        lines.append("Severity levels:")
        for level, criteria in data["severity_guidelines"].items():
            lines.append(f"  {level.upper()}: " + "; ".join(criteria[:3]))  # top 3 criteria
        lines.append("")

        # Few-shot examples (use first 6 to keep token count reasonable)
        lines.append("EXAMPLES (use these to calibrate your classifications):")
        for ex in data["examples"][:6]:
            lines.append(f'Input: "{ex["raw_text"]}"')
            lines.append(f'→ incident_type: {ex["incident_type"]}, bias_category: {ex["bias_category"]}, severity_indicator: {ex["severity_indicator"]}')
            lines.append(f'  Reason: {ex["reasoning"]}')
            lines.append("")

        return "\n".join(lines)
    except Exception:
        return ""  # fail silently — prompt still works without examples


_FEW_SHOT_CONTEXT = _load_examples()

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a structured data extractor for a bias incident reporting system at Virginia Tech.\n"
    "Your job is to convert a student's plain-text incident description into a structured JSON record.\n\n"
    + _FEW_SHOT_CONTEXT + "\n"
    "RULES:\n"
    "- CRITICAL: Only extract information EXPLICITLY stated by the student. Never infer, assume, or invent details.\n"
    "- If the student did not mention a date or time, set date_context to \"Not specified\".\n"
    "- If the student did not mention a location, set location_context to \"Not specified\".\n"
    "- If additional structured fields (when, where, witnesses) are provided, use those values directly.\n"
    "- Remove or replace any names, email addresses, VT IDs, phone numbers with \"[REDACTED]\".\n"
    "- For description_summary: write 1-3 sentences using ONLY what the student explicitly described. No added context.\n"
    "- For severity_indicator: use the guidelines and examples above. Default to 'medium' if unclear — do NOT default to 'high'.\n"
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

    structured_fields: optional dict with keys: when, where, witnesses
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

    # Coerce invalid enum values to safe defaults
    if record["incident_type"] not in VALID_INCIDENT_TYPES:
        record["incident_type"] = "other"
    if record["bias_category"] not in VALID_BIAS_CATEGORIES:
        record["bias_category"] = "other"
    if record["severity_indicator"] not in VALID_SEVERITY:
        record["severity_indicator"] = "medium"

    return record
