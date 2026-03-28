"""
Shared PII detection module.
Never logs the text being checked — only logs detection status.
"""
import re
import json
import logging

logger = logging.getLogger()

_PII_PATTERNS = [
    # Email
    re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"),
    # VT PID format (e.g. ab1234, abc12345)
    re.compile(r"\b[a-zA-Z]{2,3}\d{4,6}\b"),
    # SSN
    re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b"),
    # Phone number
    re.compile(r"\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
]


def contains_pii(text: str) -> bool:
    """Return True if text matches any known PII pattern."""
    for pattern in _PII_PATTERNS:
        if pattern.search(text):
            logger.info(json.dumps({"status": "pii_detected"}))
            return True
    return False
