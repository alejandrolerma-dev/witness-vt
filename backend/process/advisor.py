"""
Advisor agent — matches an Incident_Record to a VT policy and explains student rights.
"""
import json
import logging

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Valid policies
# ---------------------------------------------------------------------------
VALID_POLICIES = {"Honor Code", "Title IX", "Bias Response Team", "Dean of Students"}

REQUIRED_FIELDS = {"matched_policy", "policy_ambiguous", "rights_summary", "vt_contact"}

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a student rights advisor for Virginia Tech.\n"
    "Your job is to match a structured bias incident record to the most relevant VT policy and explain the student's rights in plain English.\n"
    "Rules:\n"
    "- Choose exactly one policy from: Honor Code, Title IX, Bias Response Team, Dean of Students.\n"
    "- If no policy clearly matches, default to Bias Response Team and note the ambiguity.\n"
    "- Write the rights summary in plain English, under 300 words.\n"
    "- Do not include any PII. Do not reference names or identifiers.\n"
    "- Output only valid JSON matching the schema below. No prose, no markdown."
)

_USER_TEMPLATE = (
    "Given the following incident record, identify the applicable VT policy and explain the student's rights.\n\n"
    "Incident record:\n"
    "<record>\n"
    "{incident_record_json}\n"
    "</record>"
)


class AdvisorError(Exception):
    """Raised when the Advisor agent cannot produce a valid advice response."""


def advise(incident_record: dict) -> dict:
    """
    Match an Incident_Record to a VT policy and return a validated advice dict.

    Raises:
        AdvisorError: JSON parse failure or missing/invalid fields.
        BedrockError: Bedrock invocation failure (re-raised as-is).
    """
    incident_record_json = json.dumps(incident_record)
    user_message = _USER_TEMPLATE.format(incident_record_json=incident_record_json)

    # BedrockError propagates unchanged — caller handles it
    response_text = invoke(SYSTEM_PROMPT, user_message)

    try:
        advice = json.loads(response_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error(json.dumps({"status": "advisor_parse_error"}))
        raise AdvisorError("Advisor returned invalid JSON.") from exc

    missing = REQUIRED_FIELDS - advice.keys()
    if missing:
        logger.error(json.dumps({"status": "advisor_missing_fields", "fields": sorted(missing)}))
        raise AdvisorError(f"Advisor response missing fields: {sorted(missing)}")

    # Validate vt_contact sub-fields
    vt_contact = advice.get("vt_contact")
    if not isinstance(vt_contact, dict) or "office" not in vt_contact or "url" not in vt_contact:
        logger.error(json.dumps({"status": "advisor_invalid_vt_contact"}))
        raise AdvisorError("Advisor response has invalid or missing vt_contact fields.")

    # Coerce invalid policy to safe default
    if advice["matched_policy"] not in VALID_POLICIES:
        advice["matched_policy"] = "Bias Response Team"
        advice["policy_ambiguous"] = True

    return advice
