#!/usr/bin/env python3
"""
AI Cockpit telemetry hook for Claude Code.

Sends session events to the AI Cockpit API server.
Copy this file to your hooks directory, then configure
your .claude/settings.json to use it (see claude-hooks-config.json).
"""

import sys
import json
import urllib.request


API_URL = "http://localhost:7777/events"


def send_event(event_type: str):
    raw = sys.stdin.read()
    event = json.loads(raw) if raw.strip() else {}

    payload = json.dumps({
        "event_type": event_type,
        "session_id": event.get("session_id", "unknown"),
        "tool_name": event.get("tool_name", None),
        "tool_input": event.get("tool_input", None),
        "timestamp": event.get("timestamp", None),
        "input_tokens": event.get("input_tokens", None),
        "output_tokens": event.get("output_tokens", None),
    }).encode()

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=2)
    except Exception:
        pass  # Never block the agent


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: telemetry.py <event_type>", file=sys.stderr)
        sys.exit(1)
    send_event(sys.argv[1])
