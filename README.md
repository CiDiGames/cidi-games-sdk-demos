# CIDI Game SDK Demos

CIDI Game SDK demos for Cocos Creator 2.x, Cocos Creator 3.x, Unity, and Godot.

This repository contains demo projects and demo server implementations for integrating the CIDI Game SDK.

Official documentation: [https://developdoc.cidi.games/](https://developdoc.cidi.games/)

SDK source code is not included in this repository. Follow the official documentation for SDK version requirements and acquisition notes.

## Demo Layout

Choose your client platform first, then choose the integration mode:

| Client platform | Online mode | Offline mode |
| --- | --- | --- |
| Cocos Creator 2.x | [cocos-creator-2.x/online](cocos-creator-2.x/online/README.md) | [cocos-creator-2.x/offline](cocos-creator-2.x/offline/README.md) |
| Cocos Creator 3.x | [cocos-creator-3.x/online](cocos-creator-3.x/online/README.md) | [cocos-creator-3.x/offline](cocos-creator-3.x/offline/README.md) |
| Unity | [unity/online](unity/online/README.md) | [unity/offline](unity/offline/README.md) |
| Godot | [godot/online](godot/online/README.md) | [godot/offline](godot/offline/README.md) |

## Integration Modes

- Online mode: the game client integrates with the CIDI Game SDK directly.
- Offline mode: the game client connects to a demo server, and server-side examples demonstrate related capabilities.

Each demo folder contains its own README with mode-specific setup notes.

## Server-Side Demos

Server-side examples live under [servers](servers/README.md). They can be used for online server-side OpenAPI integration and offline mode demo flows:

- [Node.js](servers/nodejs/README.md)
- [Python](servers/python/README.md)
- [Java](servers/java/README.md)
- [Go](servers/go/README.md)

## Repository Policy

- Keep SDK source code outside this repository.
- Keep client demo projects focused on SDK integration.
- Keep server-side demos in `servers/` instead of duplicating them inside every client folder.
- Avoid committing large art assets unless they are required for the demo.
- Git LFS is not required unless large binary assets become part of the repository.
