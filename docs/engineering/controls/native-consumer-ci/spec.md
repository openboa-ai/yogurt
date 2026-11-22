# Verify the Native SDK as an app consumer

Accepted direction. Make the Native requirement in Required CI cover the life of an app using the packaged Yogurt SDK. Exercise representative input, selection and overlay interactions using a single fixture and the app's own pinned Native SDK.

| Requirement | Evidence |
| --- | --- |
| Install and run | An empty workspace follows the packaged setup, installs public controls, launches with the standard Native CLI, builds and packages a release, then opens the binary from that package. |
| Exercise shared behavior | Both app runs verify OTP focus and blur pixels, a rating that updates the host's selected value, and a dialog that can be dismissed without saving or confirmed once. |
| Preserve the dependency | The app owns the Native pin and manifest. Both are checked for changes across the runs. A failed build or assertion fails Required CI. |
| Keep the gate practical | Use one app, one development run and one release build and package. Keep the existing Shared UI sources, contribution and hygiene prerequisites. |
