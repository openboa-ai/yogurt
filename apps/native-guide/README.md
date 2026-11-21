# Yogurt Native guide

The Native guide is a local macOS application for exploring the Yogurt component catalog. Its examples use the Native controls, theme and fonts in this checkout. The guide's sample state stays in memory and its actions do not contact external services.

## Run

Use macOS, Node.js, Zig 0.16.0 and Native SDK 0.11.1. From the repository root, start the guide with:

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
native test /tmp/yogurt-native-guide-host
native dev /tmp/yogurt-native-guide-host
```

Preparation installs the current Native theme and fonts, then generates the component examples and typed imports from this checkout's catalog. Rerun it after updating Yogurt; if an installed file conflicts with an updated source, create a fresh scaffold instead of overwriting an existing host. The scaffold, generated sources, build outputs and SDK dependencies are not part of this app's source directory.

Use the list to choose a component, the previous and next buttons to navigate, and the appearance button to switch themes. Hide the list for a narrow window. AgentAvatar and Gaze provide Kai and Sol previews with the six shared animation states. Other agent compositions do not yet show the live animation. Examples are local and some interactions are not yet implemented; loading a component does not establish its visual, accessibility, or motion coverage.

The application host includes SDK starter-derived code; see [LICENSE.native-sdk](LICENSE.native-sdk). The installed font retains its own license in the generated host.
