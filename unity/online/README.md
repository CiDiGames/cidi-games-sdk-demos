# Unity Online Demo

This demo shows direct CIDI Game SDK integration from a Unity WebGL client.

## What This Demo Includes

- A runtime-generated uGUI scene entry in `Assets/Scripts/Root.cs`.
- A WebGL bridge in `Assets/Plugins/WebGL/CidiBridge.jslib`.
- A custom WebGL template in `Assets/WebGLTemplates/CidiOnline/index.html`.
- Direct calls to `window.CiDiSDK`.

The online demo loads only the direct browser SDK and does not call demo server APIs.

## Required Host Script

The WebGL template loads the online SDK script in the HTML `<head>`:

```html
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

## Unity Startup Requirement

Unity WebGL runs inside an isolated browser runtime, so SDK initialization must happen before the Unity runtime starts. The custom WebGL template follows this order:

1. Load `cidi-sdk.js`.
2. Call `window.CiDiSDK.init()`.
3. Start the Unity loader only after initialization succeeds.

Do not move the first SDK initialization into Unity after the runtime has already started. If SDK initialization fails, the template stops booting Unity and shows an initialization failure message.

## Local Storage Requirement

For this demo environment, use browser `window.localStorage` for local persistence. Do not rely on Unity storage wrappers for SDK-related browser data, because the SDK reads and writes storage from the host page environment.

## Setup

1. Open this folder in Unity 2021.3 or a compatible Unity version.
2. Open `Assets/Scenes/Main.unity`.
3. Check `Project Settings > Player > Resolution and Presentation > WebGL Template`.
4. Select `CidiOnline`.
5. Build for WebGL.

## Demo Actions

- `Init CIDI SDK`: calls `window.CiDiSDK.init()`.
- `Show Rewarded Ad`: calls `window.CiDiSDK.showRewardedAd()`.

## Notes

SDK source code and private credentials should not be committed.
