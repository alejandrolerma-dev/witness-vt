"""
Process Lambda handler — runs the three-agent pipeline sequentially.
"""
import json
import logging

from shared.auth import require_auth
from shared.bedrock_client import BedrockError
from shared.sanitize import contains_pii
from process.documenter import document, DocumenterError
from process.advisor import advise, AdvisorError
from process.navigator import navigate, NavigatorError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}

_PIPELINE_ERROR_MSG = (
    "One or more AI agents are temporarily unavailable. Please try again in a moment."
)


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def handler(event, context):
    # --- Auth ---
    auth_result = require_auth(event)
    if isinstance(auth_result, dict) and "statusCode" in auth_result:
        # Inject CORS header into the 401 response from require_auth
        auth_result.setdefault("headers", {})
        auth_result["headers"]["Access-Control-Allow-Origin"] = "*"
        return auth_result

    # --- Parse body ---
    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, ValueError):
        body = {}

    raw_text = body.get("raw_text", "")

    # --- Validate raw_text ---
    if not isinstance(raw_text, str) or not raw_text.strip() or len(raw_text) > 5000:
        logger.info(json.dumps({"status": 400}))
        return _response(400, {
            "error": "Incident description is required and must be under 5000 characters."
        })

    # --- PII check ---
    if contains_pii(raw_text):
        logger.info(json.dumps({"status": 400, "reason": "pii_detected"}))
        return _response(400, {
            "error": "Your description appears to contain personal information. Please remove names, email addresses, or ID numbers before submitting."
        })

    # --- Pipeline ---
    incident_record = None
    advice = None
    navigation = None

    # Step 1: Documenter
    try:
        incident_record = document(raw_text)
    except (DocumenterError, BedrockError):
        logger.info(json.dumps({"status": 502, "failed_agent": "documenter"}))
        return _response(502, {
            "error": _PIPELINE_ERROR_MSG,
            "partial": {"incident_record": None, "advice": None, "navigation": None},
        })

    # Step 2: Advisor
    try:
        advice = advise(incident_record)
    except (AdvisorError, BedrockError):
        logger.info(json.dumps({"status": 502, "failed_agent": "advisor"}))
        return _response(502, {
            "error": _PIPELINE_ERROR_MSG,
            "partial": {"incident_record": incident_record, "advice": None, "navigation": None},
        })

    # Step 3: Navigator
    try:
        navigation = navigate(incident_record, advice)
    except (NavigatorError, BedrockError):
        logger.info(json.dumps({"status": 502, "failed_agent": "navigator"}))
        return _response(502, {
            "error": _PIPELINE_ERROR_MSG,
            "partial": {"incident_record": incident_record, "advice": advice, "navigation": None},
        })

    # --- Success ---
    logger.info(json.dumps({"status": 200}))
    return _response(200, {
        "incident_record": incident_record,
        "advice": advice,
        "navigation": navigation,
    })
