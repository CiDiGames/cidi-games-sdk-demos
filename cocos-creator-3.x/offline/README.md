# Cocos Creator 3.x Offline Demo

This demo shows a Cocos Creator 3.x client connecting to a demo server.

Official integration documentation: https://developdoc.cidi.games/

## Setup

1. Start a server from `../../servers/`.
2. Open this folder in Cocos Creator 3.x.
3. Add `assets/scripts/root.ts` to the default scene, usually on the `Canvas` node.
4. Set `proxyApiKey` on the `root.ts` component to the assigned CIDI proxy API key.
5. Keep `autoCreateButtons` enabled if you want the demo scene to create test buttons at runtime.
6. Apply values based on `../../shared/config-examples/offline.example.json`.
7. Run the demo scene and trigger proxy-backed actions.

## Required Head Scripts

The build and preview templates include the required SDK scripts in `<head>`:

```html
<script src="https://elf-resource.cidi.games/sdk/cidi-proxy-sdk.umd.js"></script>
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

Templates are located at:

- `build-templates/web-desktop/index.ejs`
- `build-templates/web-mobile/index.ejs`
- `preview-template/index.ejs`

## Critical Integration Requirements

There are two required integration points for this offline demo:

1. Call `CidiSdk.initCidiSdk()` before entering the game. Continue into the game only after the promise resolves successfully. If initialization fails, show an error state and stop the game entry flow.
2. Use `window.localStorage` for local storage. Do not use `cc.sys.localStorage` in this demo. Because of the runtime environment used by the CIDI SDK scripts, browser storage must be accessed through `window.localStorage`.

The local storage wrapper in `assets/scripts/storage.ts` intentionally uses `window.localStorage`.

## Offline SDK Demo Script

The demo calls the browser UMD proxy SDK and rewarded ad SDK from:

- `assets/scripts/cidi-sdk.ts`
- `assets/scripts/root.ts`
- `assets/scripts/storage.ts`

Attach `assets/scripts/root.ts` to a scene node. It creates demo buttons at runtime when `autoCreateButtons` is enabled.

Configure the SDK helper before calling proxy APIs:

- `baseURL`: defaults to `https://elf-proxy.cidi.games/api/v1`
- `apiKey`: replace the placeholder value with the assigned proxy apiKey
- `rewardedAdTimeout`: defaults to `30000`

Available static methods:

- `configure(options)`
- `initCidiSdk()`
- `login()`
- `reportMedal()`
- `queryMedalOwnership()`
- `reportTournamentScore(score)`
- `reportGameTask(metadata)`
- `queryGameTaskResult(bizDate)`
- `showRewardedAd()`
- `showRewardedAd(timeout)`

Methods return promises. The script intentionally calls `CidiProxySDK` and `CiDiSDK` directly. `showRewardedAd(...)` prepares `CiDiSDK` by calling `CiDiSDK.init()` when that SDK method exists. It logs demo results in the Cocos console and rejects SDK errors.

For rewarded ads, only `result.success === true` is treated as success.

## Notes

Keep server API behavior aligned with `../../shared/protocol/api-contract.md`.
