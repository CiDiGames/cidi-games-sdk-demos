# Unity Offline Demo

This demo shows a Unity WebGL client using the CIDI offline SDK flow through a browser bridge.

## Setup

1. Start a server from `../../servers/`.
2. Open this folder in Unity 2021.3 or later.
3. Open `Assets/Scenes/Main.unity`.
4. Select the WebGL platform.
5. Select the `CidiOffline` WebGL template under Player Settings.
6. Configure the demo server base URL and assigned CIDI proxy API key.
7. Build and run the WebGL demo.

## Required Head Scripts

The WebGL template includes the required SDK scripts in `<head>`:

```html
<script src="https://elf-resource.cidi.games/sdk/cidi-proxy-sdk.umd.js"></script>
<script src="https://app.cidi.games/sdk/cidi-sdk.js"></script>
```

## Unity UI

`Assets/Scripts/Root.cs` creates a uGUI canvas at runtime. You do not need to manually create buttons or input fields in the scene.

The UI provides:

- proxy apiKey input
- tournament score input
- game task metadata input
- game task bizDate input
- SDK action buttons
- log output panel

## WebGL Bridge

Unity WebGL cannot call browser SDK objects directly from C#. `Assets/Plugins/WebGL/CidiBridge.jslib` exposes bridge functions that call:

- `window.CiDiSDK`
- `window.CidiProxySDK.createClient(...)`

Promise results are sent back to Unity with `SendMessage`.

## Unity Startup and Local Storage

Unity WebGL runs inside its own runtime container, while the CIDI SDK scripts run in the surrounding browser page. Because of this separation, local storage and SDK state must be prepared by the page before the Unity runtime starts.

For this demo, Unity must not be loaded until `window.CiDiSDK.init()` has completed successfully. If initialization fails, the page should stop before loading Unity and show an error state. This is required before using Unity-side storage or any SDK-dependent game flow.

The important startup flow is implemented in `Assets/WebGLTemplates/CidiOffline/index.html`:

```js
// Initialize CiDiSDK first; only start Unity after it succeeds.
(async function boot() {
  try {
    if (!window.CiDiSDK || typeof window.CiDiSDK.init !== "function") {
      throw new Error("CiDiSDK is not loaded.");
    }

    await window.CiDiSDK.init();
  } catch (e) {
    loading.textContent = "Initialization failed. Please restart the app.";
    return;
  }

  await loadUnityLoader();
  await startUnity();
})();
```

Do not move SDK initialization into Unity after the WebGL runtime has already started. The host page must finish SDK initialization first, then create the Unity instance.

## Critical Integration Requirements

1. Initialize `CiDiSDK` before entering the game. The WebGL template starts Unity only after `window.CiDiSDK.init()` succeeds.
2. Configure the assigned CIDI proxy apiKey before calling proxy APIs.
3. Use browser-side storage and SDK APIs through the WebGL bridge when running inside WebGL.

## Notes

Keep server API behavior aligned with the server implementation used by this demo.

This demo is intended to demonstrate client-side integration logic. Production report data should still be validated, processed, and stored by your backend service according to your game rules.
