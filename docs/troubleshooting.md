# Troubleshooting

Use this page to collect common setup and runtime issues across engines and server demos.

## SDK Not Found

- Confirm the CIDI Game SDK was acquired separately.
- Confirm the SDK package is imported into the engine project.
- Confirm the SDK version matches [sdk-version.md](sdk-version.md).

## Client Cannot Connect To Server

- Confirm the demo server is running.
- Confirm the client is using the correct server URL.
- Confirm local firewall or emulator networking settings allow the connection.

## Credentials Or App Configuration Fail

- Compare local configuration with the examples in [shared/config-examples](../shared/config-examples).
- Do not use production credentials in committed demo files.

## Engine Project Does Not Open

- Confirm the required engine version.
- Remove generated cache folders and reopen the project.
- Check engine-specific README files for extra setup notes.
