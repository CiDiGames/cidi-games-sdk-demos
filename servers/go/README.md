# Go Demo Server

Go demo server for CIDI Game SDK server-side OpenAPI integration.

This demo shows how a game server can call CiDi OpenAPI endpoints with signed requests and receive platform callbacks.

## Features

- Generates `X-Api-Key`, `X-Timestamp`, `X-Nonce`, and `X-Signature` headers.
- Verifies temporary launch tokens.
- Queries CiDiCoin balance.
- Creates and queries payment orders.
- Queries payment records.
- Reports medals, tournament scores, and daily tasks.
- Queries report and task results.
- Receives order payment callbacks and tournament score callbacks.
- Uses only the Go standard library.

## Setup

```bash
copy .env.example .env
go run ./cmd/server
```

Edit `.env` before calling real CiDi APIs.

If the current terminal does not have Go in `PATH`, use the installed Go binary directly:

```bash
C:\Go\bin\go.exe run ./cmd/server
```

## Configuration

| Variable | Description |
| --- | --- |
| `PORT` | Local demo server port |
| `CIDI_BASE_URL` | CiDi OpenAPI base URL |
| `CIDI_API_KEY` | Game API key |
| `CIDI_API_SECRET` | Game API secret |
| `CIDI_CALLBACK_SECRET` | Secret used to verify order payment callbacks |

## Common Demo Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/demo/verify` | Verify `tempToken` and receive `gameToken` |
| `GET` | `/demo/balance?gameToken=...` | Query CiDiCoin balance |
| `POST` | `/demo/orders` | Create payment order |
| `GET` | `/demo/orders/:orderNo` | Query order by CiDi order number |
| `GET` | `/demo/orders/by-game-order/:gameOrderNo` | Query order by game order number |
| `GET` | `/demo/order-records` | Query payment records |
| `POST` | `/demo/medal/report` | Report game medal |
| `GET` | `/demo/medal/ownership` | Query medal ownership |
| `POST` | `/demo/tournament/score` | Report tournament score |
| `POST` | `/demo/task/report` | Report daily task completion |
| `GET` | `/demo/task/result` | Query daily task result |
| `GET` | `/demo/report/:reportId` | Query report processing result |
| `POST` | `/callbacks/order-paid` | Receive signed order paid callback |
| `POST` | `/callbacks/tournament-score` | Receive tournament score result callback |

## Example Request

```bash
curl --request POST http://localhost:3002/demo/verify \
  --header "Content-Type: application/json" \
  --data "{\"tempToken\":\"temp_token_from_cidi_app\"}"
```

## Notes

- `api_secret` and `callback_secret` must only be used on the server.
- The signature implementation follows the document's signing algorithm section: collect query/body business params, skip empty values, sort by ASCII key, append `timestamp` and `nonce`, then calculate HMAC-SHA256.
- Keep signed business params as strings, numbers, or booleans. If a field needs JSON content, serialize it to a string before signing, for example `metadata`.
- This demo follows the same endpoint shape as the Node.js and Python demo servers so clients can switch demo server languages with minimal changes.
