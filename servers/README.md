# Server-Side Demos

This folder contains shared server-side demo implementations.

Server demos are shared by Cocos Creator, Unity, Godot, and Web clients. Do not duplicate server implementations inside client folders.

Some server demos show online server-side OpenAPI integration. Others may support offline mode demo flows.

## Languages

- [Node.js](nodejs/README.md)
- [Python](python/README.md)
- [Java](java/README.md)
- [Go](go/README.md)

## API Contract

All server implementations should follow `../shared/protocol/api-contract.md`.

## Configuration

Use `../shared/config-examples/offline.example.json` as the common client/server configuration reference.
