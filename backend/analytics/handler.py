"""
Analytics Lambda handler — returns anonymous aggregate trends.

Reads from the witness-aggregates table (no PII, no TTL).
All data is purely statistical: counts by category, severity, type, location, month.
"""
import json
import logging
import os
from collections import Counter

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
}

AGGREGATE_TABLE = os.environ.get("DYNAMODB_AGGREGATE_TABLE", "witness-aggregates")

# Known VT campus locations → coordinates for heatmap
LOCATION_COORDS = {
    "torgersen hall":         {"lat": 37.2296, "lng": -80.4236},
    "newman library":         {"lat": 37.2292, "lng": -80.4186},
    "squires student center": {"lat": 37.2291, "lng": -80.4210},
    "goodwin hall":           {"lat": 37.2304, "lng": -80.4198},
    "mcbryde hall":           {"lat": 37.2285, "lng": -80.4245},
    "drill field":            {"lat": 37.2278, "lng": -80.4250},
    "dietrick":               {"lat": 37.2275, "lng": -80.4220},
    "owens":                  {"lat": 37.2265, "lng": -80.4205},
}


def _response(status_code: int, body: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body),
    }


def _match_location(loc_str):
    """Match a location string to known campus coordinates."""
    if not loc_str or loc_str == "Not specified":
        return None
    lower = loc_str.lower()
    for name, coords in LOCATION_COORDS.items():
        if name in lower:
            return {"location": loc_str, **coords}
    return {"location": loc_str, "lat": None, "lng": None}


def handler(event, context):
    """Scan the aggregates table and return summarized analytics."""
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(AGGREGATE_TABLE)

    try:
        # Scan all aggregate records (table is small — only counters)
        items = []
        response = table.scan()
        items.extend(response.get("Items", []))
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            items.extend(response.get("Items", []))
    except ClientError:
        logger.info(json.dumps({"status": 500}))
        return _response(500, {"error": "Unable to load analytics."})

    total = len(items)

    # Count by each dimension
    cat_counter = Counter(item.get("bias_category", "other") for item in items)
    sev_counter = Counter(item.get("severity", "low") for item in items)
    type_counter = Counter(item.get("incident_type", "other") for item in items)
    month_counter = Counter(item.get("month", "unknown") for item in items)

    # Location aggregation with coords
    loc_counter = Counter(item.get("location", "Not specified") for item in items)
    by_location = []
    for loc, count in loc_counter.most_common():
        match = _match_location(loc)
        if match:
            by_location.append({**match, "count": count})
        else:
            by_location.append({"location": loc, "lat": None, "lng": None, "count": count})

    result = {
        "total_reports": total,
        "by_category": [{"category": k, "count": v} for k, v in cat_counter.most_common()],
        "by_severity": [{"severity": k, "count": v} for k, v in sev_counter.most_common()],
        "by_type": [{"type": k, "count": v} for k, v in type_counter.most_common()],
        "by_location": by_location,
        "by_month": [{"month": k, "count": v} for k, v in sorted(month_counter.items())],
    }

    logger.info(json.dumps({"status": 200, "total": total}))
    return _response(200, result)
