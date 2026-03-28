import json
import logging
import os

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
}


def _response(status_code: int, body: dict) -> dict:
    logger.info(json.dumps({"status": status_code}))
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def handler(event, context):
    identity_pool_id = os.environ["IDENTITY_POOL_ID"]
    account_id = os.environ["AWS_ACCOUNT_ID"]

    try:
        client = boto3.client("cognito-identity")

        get_id_resp = client.get_id(
            AccountId=account_id,
            IdentityPoolId=identity_pool_id,
        )
        identity_id = get_id_resp["IdentityId"]

        token_resp = client.get_open_id_token(IdentityId=identity_id)
        id_token = token_resp["Token"]

        return _response(200, {
            "session_id": identity_id,
            "id_token": id_token,
            "expires_in": 3600,
        })

    except (ClientError, BotoCoreError) as exc:
        logger.error(json.dumps({"status": 500, "error_type": type(exc).__name__}))
        return _response(500, {"error": "Session initialization failed. Please try again."})

    except Exception as exc:
        logger.error(json.dumps({"status": 500, "error_type": type(exc).__name__}))
        return _response(500, {"error": "Session initialization failed. Please try again."})
