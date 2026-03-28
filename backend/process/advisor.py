"""
Advisor agent — matches an Incident_Record to a VT policy and explains student rights.
"""
import json
import logging

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Valid policies and their canonical contact info
# ---------------------------------------------------------------------------
VALID_POLICIES = {"Honor Code", "Title IX", "Bias Response Team", "Dean of Students"}

REQUIRED_FIELDS = {"matched_policy", "policy_ambiguous", "rights_summary", "vt_contact"}

_POLICY_CONTACTS = {
    "Bias Response Team": {
        "office": "VT Office for Civil Rights Compliance (CRCPE)",
        "url": "https://oea.vt.edu/harassment-discrimination.html",
    },
    "Title IX": {
        "office": "Virginia Tech Title IX / Safe at VT",
        "url": "https://safe.vt.edu",
    },
    "Honor Code": {
        "office": "Virginia Tech Office of Academic Integrity",
        "url": "https://honorsystem.vt.edu",
    },
    "Dean of Students": {
        "office": "Virginia Tech Dean of Students Office",
        "url": "https://dos.vt.edu",
    },
}

# Deterministic routing — bias_category → policy
_BRT_CATEGORIES = {"race", "ethnicity", "religion", "national_origin", "disability", "other"}
_TITLEIX_CATEGORIES = {"gender", "sexual_orientation"}

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a student rights advisor for Virginia Tech.\n"
    "Your job is to match a structured bias incident record to the most relevant VT policy and explain the student's rights in plain English.\n"
    "Rules:\n"
    "- Choose exactly one policy from: Honor Code, Title IX, Bias Response Team, Dean of Students.\n"
    "- Use this mapping as your primary guide:\n"
    "  * bias, race, ethnicity, religion, national_origin, disability → Bias Response Team\n"
    "  * gender, sexual_orientation, sexual harassment, sexual assault → Title IX\n"
    "  * academic misconduct, cheating, plagiarism, grade disputes → Honor Code\n"
    "  * general harassment, bullying, interpersonal conflict → Dean of Students\n"
    "- If no policy clearly matches, default to Bias Response Team and set policy_ambiguous to true.\n"
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


def _deterministic_policy(incident_record: dict) -> str | None:
    """Return a policy based on bias_category without calling the LLM, or None to let LLM decide."""
    bias_cat = incident_record.get("bias_category", "")
    if bias_cat in _BRT_CATEGORIES:
        return "Bias Response Team"
    if bias_cat in _TITLEIX_CATEGORIES:
        return "Title IX"
    return None


def advise(incident_record: dict) -> dict:
    """
    Match an Incident_Record to a VT policy and return a validated advice dict.

    Raises:
        AdvisorError: JSON parse failure or missing/invalid fields.
        BedrockError: Bedrock invocation failure (re-raised as-is).
    """
    incident_record_json = json.dumps(incident_record)
    user_message = _USER_TEMPLATE.format(incident_record_json=incident_record_json)

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

    # Override with deterministic routing — prevents LLM from picking wrong office
    deterministic = _deterministic_policy(incident_record)
    if deterministic:
        advice["matched_policy"] = deterministic
        advice["policy_ambiguous"] = False

    # Always use canonical contact info — prevents hallucinated URLs
    policy = advice["matched_policy"]
    if policy in _POLICY_CONTACTS:
        advice["vt_contact"] = _POLICY_CONTACTS[policy]

    return advice
