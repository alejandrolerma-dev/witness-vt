"""
Bedrock client module — wraps Claude Sonnet invocations with exponential backoff.
"""
import json
import logging
import os
import time

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Module-level constants and client — initialised once per Lambda cold start
# ---------------------------------------------------------------------------
MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"

_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
bedrock_runtime = boto3.client("bedrock-runtime", region_name=_REGION)

_MAX_RETRIES = 2
_BASE_DELAY = 1  # seconds
_RETRYABLE_ERRORS = {"ThrottlingException", "ServiceUnavailableException"}


class BedrockError(Exception):
    """Raised when a Bedrock invocation fails after retries or on a fatal error."""


def invoke(system_prompt: str, user_message: str) -> str:
    """
    Invoke Claude Sonnet via Bedrock and return the assistant's text response.

    Retries up to _MAX_RETRIES times (with exponential backoff) on
    ThrottlingException and ServiceUnavailableException.  Any other exception
    is re-raised immediately as BedrockError.

    Never logs system_prompt, user_message, or the response text.
    """
    body = json.dumps(
        {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2048,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_message}],
        }
    )

    attempt = 0
    while True:
        try:
            response = bedrock_runtime.invoke_model(
                modelId=MODEL_ID,
                contentType="application/json",
                accept="application/json",
                body=body,
            )
            response_body = json.loads(response["body"].read())
            return response_body["content"][0]["text"]

        except ClientError as exc:
            error_code = exc.response["Error"]["Code"]

            if error_code in _RETRYABLE_ERRORS:
                if attempt < _MAX_RETRIES:
                    attempt += 1
                    delay = _BASE_DELAY * (2 ** (attempt - 1))  # 1s, 2s
                    logger.info(json.dumps({"status": "bedrock_retry", "attempt": attempt}))
                    time.sleep(delay)
                    continue
                # Retries exhausted
                logger.error(
                    json.dumps({"status": "bedrock_error", "error_type": error_code})
                )
                raise BedrockError(
                    "AI service temporarily unavailable. Please try again in a moment."
                ) from exc

            # Non-retryable ClientError — fail immediately
            raise BedrockError(
                "AI service temporarily unavailable. Please try again in a moment."
            ) from exc

        except Exception as exc:
            # Any unexpected error — fail immediately, no retry
            raise BedrockError(
                "AI service temporarily unavailable. Please try again in a moment."
            ) from exc
