"""
Cognito JWT validation shared module.
Imported by all Lambda handlers to enforce authentication.
"""
import json
import logging
import os

import requests
from jose import ExpiredSignatureError, JWTError, jwt

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Module-level JWKS cache — fetched once per Lambda cold start
# ---------------------------------------------------------------------------
_JWKS: dict | None = None


class AuthError(Exception):
    """Raised when JWT validation fails for any reason."""


def _get_jwks() -> dict:
    """Return cached JWKS, fetching from Cognito on first call."""
    global _JWKS
    if _JWKS is not None:
        return _JWKS

    region = os.environ["COGNITO_REGION"]
    pool_id = os.environ["COGNITO_USER_POOL_ID"]
    url = (
        f"https://cognito-idp.{region}.amazonaws.com/{pool_id}"
        "/.well-known/jwks.json"
    )

    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        _JWKS = resp.json()
    except Exception as exc:
        logger.error(json.dumps({"status": 401, "reason": "jwks_fetch_failed"}))
        raise AuthError("Unable to fetch JWKS") from exc

    return _JWKS


def validate_token(token: str) -> dict:
    """
    Validate a Cognito JWT and return the decoded claims dict.

    Raises AuthError on any validation failure.
    Never logs the token value or decoded claims.
    """
    region = os.environ["COGNITO_REGION"]
    pool_id = os.environ["COGNITO_USER_POOL_ID"]
    expected_issuer = (
        f"https://cognito-idp.{region}.amazonaws.com/{pool_id}"
    )

    try:
        # Decode header only to extract kid — no verification yet
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        logger.error(json.dumps({"status": 401, "reason": "invalid_token_header"}))
        raise AuthError("Invalid token header") from exc

    kid = unverified_header.get("kid")
    if not kid:
        logger.error(json.dumps({"status": 401, "reason": "missing_kid"}))
        raise AuthError("Token header missing kid")

    jwks = _get_jwks()
    matching_keys = [k for k in jwks.get("keys", []) if k.get("kid") == kid]
    if not matching_keys:
        logger.error(json.dumps({"status": 401, "reason": "kid_not_found"}))
        raise AuthError("No matching key found in JWKS")

    public_key = matching_keys[0]

    try:
        claims = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_exp": True},
            issuer=expected_issuer,
        )
    except ExpiredSignatureError as exc:
        logger.error(json.dumps({"status": 401, "reason": "token_expired"}))
        raise AuthError("Token has expired") from exc
    except JWTError as exc:
        logger.error(json.dumps({"status": 401, "reason": "token_invalid"}))
        raise AuthError("Token validation failed") from exc

    return claims


def require_auth(event: dict) -> dict | None:
    """
    Extract and validate the Bearer token from the event headers.

    Returns the decoded claims dict on success.
    Returns a 401 API Gateway response dict on failure — callers can do:

        result = require_auth(event)
        if "statusCode" in result:
            return result   # short-circuit with 401
        claims = result
    """
    headers = event.get("headers") or {}
    # API Gateway may lowercase header names
    auth_header = headers.get("Authorization") or headers.get("authorization", "")

    if not auth_header.startswith("Bearer "):
        logger.error(json.dumps({"status": 401, "reason": "missing_bearer_token"}))
        return _unauthorized_response()

    token = auth_header[len("Bearer "):]

    try:
        claims = validate_token(token)
        return claims
    except AuthError:
        return _unauthorized_response()


def _unauthorized_response() -> dict:
    return {
        "statusCode": 401,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"error": "Unauthorized."}),
    }
