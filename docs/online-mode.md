# Online Mode

Online mode demonstrates direct client-side integration with the CIDI Game SDK.

## Scope

- The game client imports and initializes the SDK.
- The game client calls SDK APIs directly.
- Server-side demo code is not required for the basic online flow.

## Expected Flow

1. Add the CIDI Game SDK package to the engine project.
2. Configure app identifiers, environment, and other required values.
3. Initialize the SDK during game startup.
4. Call SDK features from the demo scene or test UI.
5. Confirm SDK responses in the client log.

## Configuration

Start from [online.example.json](../shared/config-examples/online.example.json), then copy values into the engine-specific configuration location.

Do not commit production credentials.
