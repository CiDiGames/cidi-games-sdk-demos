# Offline Mode

Offline mode demonstrates a client connecting to a demo server. The server side is responsible for demonstrating related CIDI Game SDK capabilities or protocol behavior.

## Scope

- The game client connects to a local or remote demo server.
- Shared server examples live under [servers](../servers/README.md).
- Each engine demo should use the same API contract where possible.

## Expected Flow

1. Start one of the demo servers.
2. Configure the game client with the server base URL.
3. Run the engine offline demo.
4. Trigger demo actions from the client.
5. Inspect client logs and server logs.

## Configuration

Start from [offline.example.json](../shared/config-examples/offline.example.json).

Keep local development credentials out of git.
