"""
Unit tests for shared.bedrock_client — throttle retry path and happy path.
Run with:  python -m unittest backend/tests/test_bedrock_client.py
       or: pytest backend/tests/test_bedrock_client.py
"""
import json
import sys
import os
import unittest
from unittest.mock import MagicMock, call, patch

from botocore.exceptions import ClientError

# Make sure the backend/shared package is importable when running from repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.bedrock_client import BedrockError, invoke


def _throttle_error():
    return ClientError(
        {"Error": {"Code": "ThrottlingException", "Message": "Rate exceeded"}},
        "InvokeModel",
    )


def _validation_error():
    return ClientError(
        {"Error": {"Code": "ValidationException", "Message": "Bad input"}},
        "InvokeModel",
    )


def _success_response():
    mock_resp = MagicMock()
    mock_resp["body"].read.return_value = json.dumps(
        {"content": [{"text": "test response"}]}
    ).encode()
    return mock_resp


class TestBedrockClientThrottle(unittest.TestCase):

    @patch("shared.bedrock_client.time.sleep")
    @patch("shared.bedrock_client.bedrock_runtime.invoke_model")
    def test_throttle_retries_and_raises(self, mock_invoke, mock_sleep):
        """ThrottlingException → 3 total calls, exponential backoff 1s+2s, BedrockError raised."""
        mock_invoke.side_effect = _throttle_error()

        with self.assertRaises(BedrockError) as ctx:
            invoke("sys", "user")

        # 3 total calls: initial + 2 retries
        self.assertEqual(mock_invoke.call_count, 3)

        # Exponential backoff: 1s then 2s
        mock_sleep.assert_has_calls([call(1), call(2)])
        self.assertEqual(mock_sleep.call_count, 2)

        # User-friendly message
        self.assertEqual(
            str(ctx.exception),
            "AI service temporarily unavailable. Please try again in a moment.",
        )

    @patch("shared.bedrock_client.time.sleep")
    @patch("shared.bedrock_client.bedrock_runtime.invoke_model")
    def test_success_on_first_try(self, mock_invoke, mock_sleep):
        """Happy path — returns text content, no retries."""
        mock_resp = MagicMock()
        mock_resp.__getitem__ = lambda self, key: MagicMock(
            read=lambda: json.dumps({"content": [{"text": "test response"}]}).encode()
        ) if key == "body" else None
        mock_invoke.return_value = mock_resp

        result = invoke("sys", "user")

        self.assertEqual(result, "test response")
        self.assertEqual(mock_invoke.call_count, 1)
        mock_sleep.assert_not_called()

    @patch("shared.bedrock_client.time.sleep")
    @patch("shared.bedrock_client.bedrock_runtime.invoke_model")
    def test_non_retryable_error_raises_immediately(self, mock_invoke, mock_sleep):
        """ValidationException → BedrockError raised immediately, no retries."""
        mock_invoke.side_effect = _validation_error()

        with self.assertRaises(BedrockError):
            invoke("sys", "user")

        self.assertEqual(mock_invoke.call_count, 1)
        mock_sleep.assert_not_called()


if __name__ == "__main__":
    unittest.main()
