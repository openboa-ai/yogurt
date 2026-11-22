# Yogurt Native guide

The Native guide is a local macOS application for exploring the Yogurt component catalog. Its examples use the Native controls, theme and fonts in this checkout. The guide's sample state stays in memory and its actions do not contact external services.

## Run

Use macOS, Node.js, Zig 0.16.0 and Native SDK 0.11.1. Set `NATIVE_SDK_PATH` to the original SDK framework. The guide launcher uses the [Yogurt Native build command](../../packages/native/README.md#otp-focus-on-sdk-0111). From the repository root, start the guide with:

```sh
node apps/native-guide/scripts/run.mjs
```

The launcher checks the SDK and Zig versions, prepares an app-owned host under `~/.cache/yogurt/native-guide`, and reuses it while its inputs are unchanged. Set `YOGURT_NATIVE_GUIDE_CACHE` to use another cache directory. It does not remove existing files and will use another cache slot if an incomplete or unrecognized host is present. Build artifacts remain in that cache. Source changes prepare a new host.

## Manual preparation

To prepare a host manually, create a **new, disposable** SDK host in a directory outside this checkout. The preparation step replaces the scaffold's manifest and application source; do not point it at an existing project.

First create a new scaffold outside the checkout and mark it as the guide host:

```sh
cd /tmp
native init yogurt-native-guide-host --template zig-core
printf 'yogurt-native-guide\n' > yogurt-native-guide-host/.yogurt-guide-host
```

Then return to the repository root and run:

```sh
node apps/native-guide/scripts/prepare.mjs /tmp/yogurt-native-guide-host
node bin/yogurt.mjs native test /tmp/yogurt-native-guide-host
node bin/yogurt.mjs native dev /tmp/yogurt-native-guide-host
```

Preparation installs all catalog controls and blocks with the SDK installer. The guide embeds those installed templates, binds the catalog's typed views and generates the sample data separately. Rerun preparation in a fresh scaffold after updating the SDK if an installed file has local edits.

Use the list to choose a component, the previous and next buttons to navigate, and the appearance button to switch themes. Hide the list for a narrow window. AgentAvatar and Gaze provide Kai and Sol previews with the six shared animation states; the agent row, sidebar, workspace and profile examples also use the live playback. Examples are local and some interactions are not yet implemented; loading a component does not establish its visual, accessibility, or motion coverage.

## Verify the catalog

Build a disposable guide host with `node bin/yogurt.mjs native build /tmp/yogurt-native-guide-host -Doptimize=Debug -Dautomation=true`. Keep the guide in the foreground during the run so keyboard input and animation frames reach the window.

```sh
bash checks/native-gallery-journey.sh "$(command -v native)" /tmp/yogurt-native-guide-host /tmp/yogurt-review-light
```

For a dark run, set `YOGURT_NATIVE_DARK=1` and use a fresh automation host and output directory. The script checks the installed inventory against the checkout and writes `results.tsv` with before and after captures. `PASS` covers the recorded input or animation scenario. `PRESENTATION` covers the required content of a static specimen. Review captures for clipping, contrast, spacing and rendered artwork.

The application host includes SDK starter-derived code; see [LICENSE.native-sdk](LICENSE.native-sdk). The installed font retains its own license in the generated host.
