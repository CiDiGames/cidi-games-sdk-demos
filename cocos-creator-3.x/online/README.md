# Cocos Creator 3.x Online Demo

This demo shows direct CIDI Game SDK integration from a Cocos Creator 3.x client.

Official integration documentation: https://developdoc.cidi.games/

## Setup

1. Open this folder in Cocos Creator 3.x.
2. Import the CIDI Game SDK according to the SDK documentation.
3. Add `assets/scripts/root.ts` to the default scene, usually on the `Canvas` node.
4. Configure SDK values according to the official integration documentation.
5. Run the demo scene.

## Critical Integration Requirements

All Cocos demos in this repository must follow these requirements:

1. Call `window.CiDiSDK.init()` and wait for it to resolve successfully before entering the game. If initialization fails, show an error message and stop the game entry flow.
2. Use `window.localStorage` for local persistence. Do not use `cc.sys.localStorage`. Because the CIDI SDK runs in the browser page environment, SDK-related storage must be accessed through `window.localStorage`.

The local storage wrapper in this demo intentionally uses `window.localStorage`.

## Required Head Script

The build and preview templates include the required SDK script in `<head>`:

```html
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

Templates are located at:

- `build-templates/web-desktop/index.ejs`
- `build-templates/web-mobile/index.ejs`
- `preview-template/index.ejs`

## Scripts

- `assets/scripts/cidi-sdk.ts`: direct online CIDI SDK access through `window.CiDiSDK`.
- `assets/scripts/root.ts`: demo scene component that creates test buttons at runtime.
- `assets/scripts/storage.ts`: local storage wrapper based on `window.localStorage`.
- `assets/scripts/cidi-backend.ts`: fetch wrapper for the Node.js demo server APIs.

## Report Data Handling

Report APIs in this online demo only show the client-side call flow. In a real integration, report data should be sent to your backend service first. The backend is responsible for validating player identity, checking request integrity, applying business rules, storing the report result, and calling any required CIDI server-side APIs.

Do not treat this demo as a production data processing implementation. It is intended to demonstrate how the game client organizes SDK and backend requests.

## Notes

SDK source code and private credentials should not be committed.
