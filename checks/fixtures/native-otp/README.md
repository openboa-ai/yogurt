# Native OTP consumer

This consumer pins Native CLI 0.11.1 and its empty focus cell source patch with pnpm. The lockfile records the package integrity and patch hash. pnpm produces the resolved framework when the app installs dependencies.

For a local Native guide, install this pin from the repository root and select the framework before launching the guide:

```sh
npx --yes pnpm@10.24.0 --dir checks/fixtures/native-otp install --frozen-lockfile --ignore-scripts
sdk="$PWD/checks/fixtures/native-otp/node_modules"
export NATIVE_SDK_PATH="$sdk/@native-sdk/cli"
export PATH="$sdk/.bin:$PATH"
node apps/native-guide/scripts/run.mjs
```

With Zig 0.16.0 on PATH, `bash checks/native-otp-build.sh` creates a fresh workspace and uses this pin. It installs `codeView` from the Yogurt package, generates an app-owned Zig manifest, then runs the standard Native development, build and package commands. It exercises click, Tab entry and blur in the development and packaged apps.
