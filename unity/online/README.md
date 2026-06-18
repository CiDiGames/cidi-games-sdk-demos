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

## Critical Integration Requirements

All Unity demos in this repository must follow these requirements:

1. Call `window.CiDiSDK.init()` and wait for it to resolve successfully before loading the Unity game code. If initialization fails, show an error message and do not start Unity.
2. Use Unity `PlayerPrefs` for local persistence inside the Unity project.

The WebGL template implements this startup order in `Assets/WebGLTemplates/CidiOnline/index.html`. Do not move the first SDK initialization into Unity after the runtime has already started.

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
