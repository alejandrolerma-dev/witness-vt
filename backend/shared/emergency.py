"""
Emergency detection — scans raw incident text for signals of immediate danger.

If detected, the response includes emergency contact info that the frontend
surfaces prominently BEFORE the normal AI analysis flow.
"""
import re

# --- Crisis signal patterns (any single match triggers emergency) ---
_CRISIS_PATTERNS = [
    # Suicidal ideation
    r"\b(suicid|kill (my|him|her|them)self|end (my|their) life|don'?t want to (live|be alive))\b",
    r"\b(want(ing)? to die|better off dead|no reason to live)\b",
    # Active weapon / bomb threat
    r"\b(has a (gun|knife|weapon)|bomb threat|active shooter|brought a weapon)\b",
    # Ongoing physical danger
    r"\b(being attacked|attacking me|won'?t let me leave|can'?t (escape|get away|leave))\b",
    r"\b(locked (me )?in|holding me|trapped|hostage)\b",
    # Immediate safety
    r"\b(need(s)? (help|911) (now|immediately|right now)|call (the )?police|in (immediate )?danger)\b",
    r"\b(life.?threatening|medical emergency)\b",
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in _CRISIS_PATTERNS]

# --- Emergency resources ---
EMERGENCY_RESOURCES = [
    {
        "name": "Emergency Services",
        "contact": "911",
        "description": "For immediate danger or medical emergency",
        "type": "phone",
    },
    {
        "name": "VT Police",
        "contact": "540-231-6411",
        "description": "Virginia Tech Police Department — available 24/7",
        "type": "phone",
    },
    {
        "name": "988 Suicide & Crisis Lifeline",
        "contact": "988",
        "description": "Free, confidential support 24/7 — call or text",
        "type": "phone",
    },
    {
        "name": "Crisis Text Line",
        "contact": "Text HOME to 741741",
        "description": "Free crisis counseling via text message",
        "type": "text",
    },
    {
        "name": "Cook Counseling Center",
        "contact": "540-231-6557",
        "description": "VT campus mental health — same-day appointments available",
        "type": "phone",
    },
]


def detect_emergency(raw_text: str) -> dict | None:
    """
    Scan raw text for crisis signals. Returns emergency dict if detected, None otherwise.
    """
    text_lower = raw_text.lower()
    for pattern in _COMPILED:
        if pattern.search(text_lower):
            return {
                "detected": True,
                "resources": EMERGENCY_RESOURCES,
            }
    return None
