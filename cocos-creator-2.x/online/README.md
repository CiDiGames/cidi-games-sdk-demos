# Cocos Creator 2.x Online Demo

This demo shows direct CIDI Game SDK integration from a Cocos Creator 2.x client.

## Setup

1. Open this folder in Cocos Creator 2.x.
2. Open `assets/demo.fire`.
3. Attach `assets/scripts/root.js` to a scene node if it is not already attached.
4. Keep `autoCreateButtons` enabled if you want the demo scene to create test buttons at runtime.
5. Build for `web-mobile` or `web-desktop`.
6. Confirm the generated HTML contains this script in `<head>`:

```html
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

7. Run the web build and call `CidiSdk.initCidiSdk()` before entering the game.

The online demo only uses the browser CIDI SDK script listed above.

## Critical Integration Requirements

There are two required integration points for this online demo:

1. Call `CidiSdk.initCidiSdk()` before entering the game. Continue into the game only after the promise resolves successfully. If initialization fails, show an error state and stop the game entry flow.
2. Use `window.localStorage` for local storage. Do not use `cc.sys.localStorage` in this demo. Because of the runtime environment used by the CIDI SDK scripts, browser storage must be accessed through `window.localStorage`.

The local storage wrapper in `assets/scripts/storage.js` intentionally uses `window.localStorage`.

## Online SDK Demo Script

The demo calls the browser UMD CIDI SDK from:

- `assets/scripts/cidi.sdk.js`
- `assets/scripts/root.js`
- `assets/scripts/storage.js`
- `assets/scripts/request.js`

Available static methods:

- `configure(options)`
- `initCidiSdk()`
- `showRewardedAd()`
- `showRewardedAd(timeout)`

## Demo Server Request Wrapper

`assets/scripts/request.js` wraps the Node.js demo server endpoints with `window.fetch`.

```js
var CidiBackend = require('request');

CidiBackend.configure({
  baseURL: 'http://localhost:3000',
  timeout: 15000
});

CidiBackend.verifyTempToken('temp-token-from-cidi-app').then(function (result) {
  cc.log('Verify result:', JSON.stringify(result));
});

CidiBackend.queryBalance('game-token-from-verify').then(function (result) {
  cc.log('Balance result:', JSON.stringify(result));
});

CidiBackend.createOrder({
  gameToken: 'game-token-from-verify',
  amount: 10,
  description: 'Demo order'
}).then(function (result) {
  cc.log('Order result:', JSON.stringify(result));
}).catch(function (error) {
  cc.error('Demo server request failed:', error);
});
```

Available server methods:

- `configure(options)`
- `health()`
- `verifyTempToken(tempToken)`
- `queryBalance(gameToken)`
- `createOrder(input)`
- `queryOrder(orderNo)`
- `queryOrderByGameOrderNo(gameOrderNo)`
- `queryOrderRecords(query)`
- `reportMedal(input)`
- `queryMedalOwnership(query)`
- `reportTournamentScore(input)`
- `reportGameTask(input)`
- `queryGameTaskResult(query)`
- `queryReport(reportId)`

## Notes

SDK source code and private credentials should not be committed.
