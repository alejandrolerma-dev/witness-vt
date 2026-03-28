"""
Aggregate tracker — writes anonymous counters when a report is saved.

Stores ONLY: incident_type, bias_category, severity, location, month.
No description, no session_id, no summary — purely statistical.
These records do NOT auto-delete (no TTL) so trends persist over time.
"""
import json
import logging
import os
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

AGGREGATE_TABLE = os.environ.get("DYNAMODB_AGGREGATE_TABLE", "witness-aggregates")


def record_aggregate(incident_record: dict) -> None:
    """
    Write a single anonymous aggregate record from a saved report.
    Failures are logged but never block the save response.
    """
    try:
        now = datetime.now(timezone.utc)
        month_key = now.strftime("%Y-%m")  # e.g. "2026-03"

        item = {
            "month": month_key,
            "timestamp": now.isoformat(),
            "incident_type": incident_record.get("incident_type", "other"),
            "bias_category": incident_record.get("bias_category", "other"),
            "severity": incident_record.get("severity_indicator", "low"),
            "location": incident_record.get("location_context", "Not specified"),
        }

        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(AGGREGATE_TABLE)
        table.put_item(Item=item)

        logger.info(json.dumps({"status": "aggregate_recorded"}))
    except (ClientError, Exception) as exc:
        # Never block the save — aggregates are best-effort
        logger.warning(json.dumps({"status": "aggregate_failed", "error": str(exc)}))
