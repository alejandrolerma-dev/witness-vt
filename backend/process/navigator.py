"""
Navigator agent — generates a step-by-step reporting path and draft formal statement.
"""
import json
import logging

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Required fields
# ---------------------------------------------------------------------------
REQUIRED_FIELDS = {"reporting_steps", "draft_statement"}
REQUIRED_STEP_FIELDS = {"step_number", "action", "estimated_timeline"}

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a reporting navigator for Virginia Tech bias incidents.\n"
    "Your job is to generate a step-by-step reporting path and a ready-to-file formal statement.\n"
    "Rules:\n"
    "- Generate numbered steps specific to the matched VT policy.\n"
    "- Include estimated timelines per step where known.\n"
    "- Draft a formal statement under 500 words. The statement must contain no PII.\n"
    "- Write in a calm, clear, professional tone.\n"
    "- Output only valid JSON matching the schema below. No prose, no markdown."
)

_USER_TEMPLATE = (
    "Given the following incident record and policy advice, generate a reporting path and draft statement.\n\n"
    "Incident record:\n"
    "<record>\n"
    "{incident_record_json}\n"
    "</record>\n\n"
    "Policy advice:\n"
    "<advice>\n"
    "{advice_json}\n"
    "</advice>"
)


class NavigatorError(Exception):
    """Raised when the Navigator agent cannot produce a valid navigation response."""


def navigate(incident_record: dict, advice: dict) -> dict:
    """
    Generate a reporting path and draft statement from an Incident_Record and advice.

    Raises:
        NavigatorError: JSON parse failure or missing/invalid fields.
        BedrockError: Bedrock invocation failure (re-raised as-is).
    """
    incident_record_json = json.dumps(incident_record)
    advice_json = json.dumps(advice)
    user_message = _USER_TEMPLATE.format(
        incident_record_json=incident_record_json,
        advice_json=advice_json,
    )

    # BedrockError propagates unchanged — caller handles it
    response_text = invoke(SYSTEM_PROMPT, user_message)

    try:
        navigation = json.loads(response_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error(json.dumps({"status": "navigator_parse_error"}))
        raise NavigatorError("Navigator returned invalid JSON.") from exc

    missing = REQUIRED_FIELDS - navigation.keys()
    if missing:
        logger.error(json.dumps({"status": "navigator_missing_fields", "fields": sorted(missing)}))
        raise NavigatorError(f"Navigator response missing fields: {sorted(missing)}")

    reporting_steps = navigation.get("reporting_steps")
    if not isinstance(reporting_steps, list) or len(reporting_steps) == 0:
        logger.error(json.dumps({"status": "navigator_empty_steps"}))
        raise NavigatorError("Navigator response has empty or invalid reporting_steps.")

    for i, step in enumerate(reporting_steps):
        missing_step_fields = REQUIRED_STEP_FIELDS - step.keys()
        if missing_step_fields:
            logger.error(json.dumps({"status": "navigator_invalid_step", "index": i}))
            raise NavigatorError(
                f"Step {i} missing fields: {sorted(missing_step_fields)}"
            )

    return navigation
