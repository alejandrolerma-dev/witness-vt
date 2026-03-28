"""
Documenter agent — converts raw incident text into a structured Incident_Record JSON.
"""
import json
import logging
import os
from pathlib import Path

from shared.bedrock_client import invoke, BedrockError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ---------------------------------------------------------------------------
# Load training examples
# ---------------------------------------------------------------------------
def _load_training_examples() -> dict:
    """Load training examples from JSON file."""
    examples_path = Path(__file__).parent / "training_examples.json"
    try:
        with open(examples_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        logger.warning(f"Failed to load training examples: {exc}")
        return {"examples": [], "severity_guidelines": {}, "incident_type_guidelines": {}, "bias_category_guidelines": {}}


TRAINING_DATA = _load_training_examples()

# ---------------------------------------------------------------------------
# Valid enum values for Incident_Record fields
# ---------------------------------------------------------------------------
VALID_INCIDENT_TYPES = {"verbal", "physical", "written", "online", "property", "other"}
VALID_BIAS_CATEGORIES = {"race", "ethnicity", "religion", "gender", "sexual_orientation", "disability", "national_origin", "other"}
VALID_SEVERITY = {"low", "medium", "high"}

REQUIRED_FIELDS = {
    "incident_type",
    "date_context",
    "location_context",
    "bias_category",
    "description_summary",
    "severity_indicator",
}

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
def _build_system_prompt() -> str:
    """Build system prompt with training examples."""
    base_prompt = (
        "You are a structured data extractor for a bias incident reporting system.\n"
        "Your job is to convert a student's plain-text incident description into a structured JSON record.\n\n"
        "Rules:\n"
        "- CRITICAL: Only extract information that is EXPLICITLY stated by the student. Never infer, assume, or invent details.\n"
        "- If the student did not mention a date or time, set date_context to \"Not specified\".\n"
        "- If the student did not mention a location, set location_context to \"Not specified\".\n"
        "- If additional structured fields (when, where, witnesses) are provided separately, use those values directly.\n"
        "- Remove or replace any names, email addresses, VT IDs, phone numbers, or other identifying information with \"[REDACTED]\".\n"
        "- Do not include any PII in your output.\n"
        "- Be factual and neutral. Do not editorialize.\n"
        "- For description_summary: write a 1-3 sentence neutral summary using ONLY what the student explicitly described. Do not add context, assumptions, or details not present in the text.\n"
        "- Output only valid JSON matching the schema below. No prose, no markdown.\n\n"
    )
    
    # Add guidelines
    guidelines = "Classification Guidelines:\n\n"
    
    if TRAINING_DATA.get("incident_type_guidelines"):
        guidelines += "INCIDENT TYPES:\n"
        for itype, desc in TRAINING_DATA["incident_type_guidelines"].items():
            guidelines += f"- {itype}: {desc}\n"
        guidelines += "\n"
    
    if TRAINING_DATA.get("bias_category_guidelines"):
        guidelines += "BIAS CATEGORIES:\n"
        for category, desc in TRAINING_DATA["bias_category_guidelines"].items():
            guidelines += f"- {category}: {desc}\n"
        guidelines += "\n"
    
    if TRAINING_DATA.get("severity_guidelines"):
        guidelines += "SEVERITY INDICATORS:\n"
        for level, indicators in TRAINING_DATA["severity_guidelines"].items():
            guidelines += f"- {level.upper()}: "
            guidelines += ", ".join(indicators[:4])
            if len(indicators) > 4:
                guidelines += "..."
            guidelines += "\n"
        guidelines += "\n"
    
    # Add examples
    examples_text = ""
    if TRAINING_DATA.get("examples"):
        examples_text = "Training Examples (use these to calibrate your classifications):\n\n"
        for i, ex in enumerate(TRAINING_DATA["examples"][:6], 1):  # Use first 6 examples
            examples_text += f"Example {i}:\n"
            examples_text += f"Input: \"{ex['raw_text'][:120]}{'...' if len(ex['raw_text']) > 120 else ''}\"\n"
            examples_text += f"Classification: incident_type={ex['incident_type']}, bias_category={ex['bias_category']}, severity={ex['severity_indicator']}\n"
            examples_text += f"Reasoning: {ex['reasoning']}\n\n"
    
    return base_prompt + guidelines + examples_text


SYSTEM_PROMPT = _build_system_prompt()

_USER_TEMPLATE = (
    "Convert the following incident description into a structured JSON record.\n\n"
    "Incident description:\n"
    "<incident>\n"
    "{raw_text}\n"
    "</incident>\n"
    "{structured_fields}"
)


class DocumenterError(Exception):
    """Raised when the Documenter agent cannot produce a valid Incident_Record."""


def document(raw_text: str, structured_fields: dict | None = None) -> dict:
    """
    Convert raw incident text into a validated Incident_Record dict.

    structured_fields: optional dict with keys: when, where, witnesses
    """
    # Build structured fields block if provided
    fields_block = ""
    if structured_fields:
        lines = []
        if structured_fields.get("when"):
            lines.append(f"When it happened (provided by student): {structured_fields['when']}")
        if structured_fields.get("where"):
            lines.append(f"Where it happened (provided by student): {structured_fields['where']}")
        if structured_fields.get("witnesses") is not None:
            lines.append(f"Witnesses present: {'Yes' if structured_fields['witnesses'] else 'No'}")
        if lines:
            fields_block = "\n\nAdditional details provided by the student:\n" + "\n".join(lines)

    user_message = _USER_TEMPLATE.format(raw_text=raw_text, structured_fields=fields_block)

    # BedrockError propagates unchanged — caller handles it
    response_text = invoke(SYSTEM_PROMPT, user_message)

    try:
        record = json.loads(response_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error(json.dumps({"status": "documenter_parse_error"}))
        raise DocumenterError("Documenter returned invalid JSON.") from exc

    missing = REQUIRED_FIELDS - record.keys()
    if missing:
        logger.error(json.dumps({"status": "documenter_missing_fields", "fields": sorted(missing)}))
        raise DocumenterError(f"Documenter response missing fields: {sorted(missing)}")

    # Coerce invalid enum values to safe defaults
    if record["incident_type"] not in VALID_INCIDENT_TYPES:
        record["incident_type"] = "other"
    if record["bias_category"] not in VALID_BIAS_CATEGORIES:
        record["bias_category"] = "other"
    if record["severity_indicator"] not in VALID_SEVERITY:
        record["severity_indicator"] = "medium"

    return record
