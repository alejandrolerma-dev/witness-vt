"""
Save Lambda handler — validates Cognito token, checks for PII fields,
writes the completed report to DynamoDB with a 90-day TTL.
"""
import json
import logging
import os
from datetime import datetime, timezone, timedelta

import boto3
from botocore.exceptions import ClientError

from shared.auth import require_auth
from shared.aggregate import record_aggregate

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}

PII_BLOCKED_KEYS = {"name", "email", "vt_id", "phone"}

TTL_DAYS = 90


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def _contains_pii_keys(obj) -> bool:
    """Recursively walk all dict keys and return True if any blocked key is found."""
    if isinstance(obj, dict):
        for key in obj:
            if key in PII_BLOCKED_KEYS:
                return True
            if _contains_pii_keys(obj[key]):
                return True
    elif isinstance(obj, list):
        for item in obj:
            if _contains_pii_keys(item):
                return True
    return False


def handler(event, context):
    # --- Auth ---
    auth_result = require_auth(event)
    if isinstance(auth_result, dict) and "statusCode" in auth_result:
        auth_result.setdefault("headers", {})
        auth_result["headers"]["Access-Control-Allow-Origin"] = "*"
        return auth_result

    claims = auth_result
    session_id = claims.get("sub")

    # --- Parse body ---
    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, ValueError):
        body = {}

    # --- PII check on full body ---
    if _contains_pii_keys(body):
        logger.info(json.dumps({"status": 400}))
        return _response(400, {"error": "Report contains disallowed fields and cannot be saved."})

    # --- Extract required fields ---
    incident_record = body.get("incident_record")
    advice = body.get("advice")
    navigation = body.get("navigation")

    if not isinstance(incident_record, dict) or not isinstance(advice, dict) or not isinstance(navigation, dict):
        logger.info(json.dumps({"status": 400}))
        return _response(400, {"error": "Report contains disallowed fields and cannot be saved."})

    # --- Write to DynamoDB ---
    now = datetime.now(timezone.utc)
    saved_at = now.isoformat()
    ttl = int((now + timedelta(days=TTL_DAYS)).timestamp())

    table_name = os.environ["DYNAMODB_TABLE_NAME"]
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    try:
        table.put_item(Item={
            "session_id": session_id,
            "saved_at": saved_at,
            "incident_record": incident_record,
            "advice": advice,
            "navigation": navigation,
            "ttl": ttl,
        })
    except ClientError:
        logger.info(json.dumps({"status": 500}))
        return _response(500, {"error": "Save failed. You can copy your report content instead."})

    # --- Write anonymous aggregate (best-effort, never blocks) ---
    record_aggregate(incident_record)

    logger.info(json.dumps({"status": 200}))
    return _response(200, {"retrieval_token": session_id, "saved_at": saved_at})
