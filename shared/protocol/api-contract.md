# API Contract

This document describes the shared client-to-demo-server contract used by offline mode demos.

The exact endpoints should be kept consistent across Node.js, Python, Java, and Go server examples.

## Base URL

Use the value from `shared/config-examples/offline.example.json`.

## Common Response Shape

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Check whether the demo server is running |
| POST | `/demo/session/start` | Start a demo session |
| POST | `/demo/action` | Execute a demo action |

## Error Shape

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "DEMO_ERROR",
    "message": "Human-readable error message"
  }
}
```
