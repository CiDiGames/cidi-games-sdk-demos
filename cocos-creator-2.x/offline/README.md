# Cocos Creator 2.x Offline Demo

This demo shows a Cocos Creator 2.x client connecting to a demo server.

## Setup

1. Open this folder with Cocos Creator 2.4.x.
2. Open `assets/demo.fire`.
3. Attach `assets/scripts/root.js` to a scene node if it is not already attached.
4. Set `proxyApiKey` on the `root.js` component to the assigned CIDI proxy API key.
5. Keep `autoCreateButtons` enabled if you want the demo scene to create test buttons at runtime.
6. Build for `web-mobile` or `web-desktop`.
7. Confirm the generated HTML contains these scripts in `<head>`:

```html
<script src="https://elf-resource.cidi.games/sdk/cidi-proxy-sdk.umd.js"></script>
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

8. Run the web build and call `CidiSdk.initCidiSdk()` before entering the game.

The build templates already include the required SDK scripts:

- `build-templates/web-mobile/index.html`
- `build-templates/web-desktop/index.html`

## Notes

Keep server API behavior aligned with the server implementation used by this demo.

## Critical Integration Requirements

There are two required integration points for this offline demo:

1. Call `CidiSdk.initCidiSdk()` before entering the game. Continue into the game only after the promise resolves successfully. If initialization fails, show an error state and stop the game entry flow.
2. Use `window.localStorage` for local storage. Do not use `cc.sys.localStorage` in this demo. Because of the runtime environment used by the CIDI SDK scripts, browser storage must be accessed through `window.localStorage`.

The local storage wrapper in `assets/scripts/storage.js` intentionally uses `window.localStorage`.

## Offline SDK Demo Script

The demo calls the browser UMD proxy SDK and rewarded ad SDK from:

- `assets/scripts/cidi.sdk.js`
- `assets/scripts/root.js`
- `assets/scripts/storage.js`

Attach `assets/scripts/root.js` to a scene node. It creates demo buttons at runtime when `autoCreateButtons` is enabled.

Use it from another Cocos script:

```js
var CidiSdk = require('cidi.sdk');

CidiSdk.configure({
  baseURL: 'https://elf-proxy.cidi.games/api/v1',
  apiKey: 'replace-with-cidi-proxy-api-key'
});

CidiSdk.initCidiSdk()
  .then(function () {
    cc.log('CIDI SDK initialized. Enter the game now.');
  })
  .catch(function (error) {
    cc.error('CIDI SDK init failed:', error);
  });

CidiSdk.login()
  .then(function (success) {
    cc.log('Login result:', success);
  })
  .catch(function (error) {
    cc.error('CIDI login error:', error);
  });

CidiSdk.showRewardedAd()
  .then(function (success) {
    cc.log('Rewarded ad result:', success);
  })
  .catch(function (error) {
    cc.error('CIDI rewarded ad error:', error);
  });
```

Configure the SDK helper before calling proxy APIs:

- `baseURL`: defaults to `https://elf-proxy.cidi.games/api/v1`
- `apiKey`: replace the placeholder value with the assigned proxy apiKey
- `rewardedAdTimeout`: defaults to `300000`

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

## Web Build Templates

This project includes Cocos Creator 2.x web build templates:

- `build-templates/web-mobile/index.html`
- `build-templates/web-desktop/index.html`

Use the `CIDI head scripts` block in each template to add scripts that must appear in the published HTML `<head>`.

Do not edit generated files under `build/` directly. Update the template files instead, then rebuild from Cocos Creator.
