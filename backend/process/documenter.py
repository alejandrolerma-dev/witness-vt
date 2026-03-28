"""
Documenter agent — converts raw incident text into a structured Incident_Record JSON.
"""
import json
import logging

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Valid enum values for Incident_Record fields
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
# Prompts
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a structured data extractor for a bias incident reporting system.\n"
    "Your job is to convert a student's plain-text incident description into a structured JSON record.\n"
    "Rules:\n"
    "- CRITICAL: Only extract information that is EXPLICITLY stated by the student. Never infer, assume, or invent details.\n"
    "- If the student did not mention a date or time, set date_context to \"Not specified\".\n"
    "- If the student did not mention a location, set location_context to \"Not specified\".\n"
    "- If additional structured fields (when, where, witnesses) are provided separately, use those values directly.\n"
    "- Remove or replace any names, email addresses, VT IDs, phone numbers, or other identifying information with \"[REDACTED]\".\n"
    "- Do not include any PII in your output.\n"
    "- Be factual and neutral. Do not editorialize.\n"
    "- For description_summary: write a 1-3 sentence neutral summary using ONLY what the student explicitly described. Do not add context, assumptions, or details not present in the text.\n"
    "- For severity_indicator, use these criteria strictly:\n"
    "  * high: explicit physical threat, physical assault, or repeated targeted harassment described\n"
    "  * medium: verbal bias incident, discriminatory remarks, or single hostile interaction\n"
    "  * low: ambiguous situation, microaggression, or uncertain if bias-motivated\n"
    "  * Default to medium if unclear — do NOT default to high.\n"
    "- Output only valid JSON matching the schema below. No prose, no markdown."
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
    # Build structured fields block if provided
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

    # BedrockError propagates unchanged — caller handles it
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
