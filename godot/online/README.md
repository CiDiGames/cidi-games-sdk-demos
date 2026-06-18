# Godot Online Demo

This demo shows direct CIDI Game SDK integration from a Godot Web client.

Official integration documentation: https://developdoc.cidi.games/

## What This Demo Includes

- A generated main scene at `scenes/main.tscn`.
- A startup script at `scripts/main.gd`.
- A browser SDK bridge in `web-template/cidi_online.html`.
- A thin Godot bridge wrapper at `scripts/cidi_sdk.gd`.
- A local storage wrapper at `scripts/browser_storage.gd`.
- A Web export preset in `export_presets.cfg`.
- A custom Web HTML shell at `web-template/cidi_online.html`.

The online demo loads only the direct browser SDK and does not call demo server APIs.

## Required Host Script

The Web export shell loads the online SDK script in `<head>`:

```html
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

## Critical Integration Requirements

All Godot demos in this repository must follow these requirements:

1. Call `window.CiDiSDK.init()` and wait for it to resolve successfully before entering the game. If initialization fails, show an error message and stop the game entry flow.
2. Use browser `window.localStorage` for SDK-related local persistence in Web exports.
3. Serve the exported Web build from a web server. Do not open `index.html` directly with `file://`.

The custom Web shell implements the startup order before `engine.startGame()`. Browser SDK promises are handled in JavaScript by `window.CidiGodotOnline`; GDScript reads the initialized SDK state from the Web shell and starts runtime SDK actions, such as rewarded ads, through Godot `JavaScriptBridge`. Runtime SDK results are pushed back to Godot through a single registered JavaScript callback instead of per-frame polling or a request queue. Local persistence is also wrapped by the Web shell, but the implementation must still use browser `window.localStorage`.

Godot gameplay code can use the SDK wrapper with GDScript `await` style:

```gdscript
var init_result = _sdk.init_cidi_sdk()
var ad_result = await _sdk.show_rewarded_ad_async(30000)
```

The wrapper converts browser SDK results into Godot dictionaries with `success`, `result`, `code`, and `message` fields.

## Web Origin Notes

This demo does not add its own HTTPS or localhost check in the HTML shell. The exported page starts CIDI SDK initialization and lets Godot or the browser SDK report the actual environment error.

For local testing, `http://localhost` or `http://127.0.0.1` may be accepted by the browser as a local development origin. For LAN testing with an IP address such as `http://192.168.x.x`, the browser, Godot export options, or CIDI SDK may still require a secure origin depending on the enabled Web features. The desktop Godot editor run is useful for checking scene layout only; SDK calls are expected to fail outside a Web export.

## Setup

1. Open this folder in Godot 4.6 or a compatible Godot 4.x version.
2. Open `scenes/main.tscn`.
3. Confirm that the main scene is set to `res://scenes/main.tscn`.
4. Use the `Web` export preset.
5. Build the Web export.

## Demo Actions

- `Init CIDI SDK`: calls `window.CiDiSDK.init()`.
- `Show Rewarded Ad`: calls `window.CiDiSDK.showRewardedAd()`.
- `Save Local State`: writes demo data through `window.localStorage`.
- `Read Local State`: reads demo data through `window.localStorage`.

## Report Data Handling

Report APIs in an online client demo should only show the client-side call flow. In a real integration, report data should be sent to your backend service first. The backend is responsible for validating player identity, checking request integrity, applying business rules, storing the report result, and calling any required CIDI server-side APIs.

Do not treat this demo as a production data processing implementation. It is intended to demonstrate how the game client organizes SDK and browser calls.

## Notes

SDK source code and private credentials should not be committed.
