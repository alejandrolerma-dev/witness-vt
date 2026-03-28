"""
Retrieve Lambda handler — validates Cognito token, queries DynamoDB by
session_id, returns the most recent saved report or 404.
"""
import json
import logging
import os

import boto3
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from shared.auth import require_auth

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}


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
        auth_result.setdefault("headers", {})
        auth_result["headers"]["Access-Control-Allow-Origin"] = "*"
        return auth_result

    # --- Extract session_id from path ---
    session_id = (event.get("pathParameters") or {}).get("session_id")

    # --- Query DynamoDB ---
    table_name = os.environ["DYNAMODB_TABLE_NAME"]
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    try:
        result = table.query(
            KeyConditionExpression=Key("session_id").eq(session_id),
            ScanIndexForward=False,  # descending by sort key (saved_at)
            Limit=1,
        )
    except ClientError:
        logger.info(json.dumps({"status": 500}))
        return _response(500, {"error": "Retrieval failed. Please try again."})

    items = result.get("Items", [])
    if not items:
        logger.info(json.dumps({"status": 404}))
        return _response(404, {"error": "No report found for this token."})

    item = items[0]
    logger.info(json.dumps({"status": 200}))
    return _response(200, {
        "incident_record": item["incident_record"],
        "advice": item["advice"],
        "navigation": item["navigation"],
        "saved_at": item["saved_at"],
    })
