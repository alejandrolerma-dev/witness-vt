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
    "- Remove or replace any names, email addresses, VT IDs, phone numbers, or other identifying information with \"[REDACTED]\".\n"
    "- Do not include any PII in your output.\n"
    "- Be factual and neutral. Do not editorialize.\n"
    "- Output only valid JSON matching the schema below. No prose, no markdown."
)

_USER_TEMPLATE = (
    "Convert the following incident description into a structured JSON record.\n\n"
    "Incident description:\n"
    "<incident>\n"
    "{raw_text}\n"
    "</incident>"
)


class DocumenterError(Exception):
    """Raised when the Documenter agent cannot produce a valid Incident_Record."""


def document(raw_text: str) -> dict:
    """
    Convert raw incident text into a validated Incident_Record dict.

    Raises:
        DocumenterError: JSON parse failure or missing required fields.
        BedrockError: Bedrock invocation failure (re-raised as-is).
    """
    user_message = _USER_TEMPLATE.format(raw_text=raw_text)

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
