# Use Yogurt well in another project

Draft 1 for review. Owners proposed for this change are the Yogurt maintainer and the adopting product's UI owner. [Design and acceptance](spec.md)

A product developer should be able to describe what a person needs to do and get a working interface that looks, reads and behaves like OpenBoa. The developer can also ask for just a design decision, a review of an existing screen or help reporting a shared defect.

Current and future OpenBoa projects should be able to find, pin and use Yogurt independently. They share tokens, primitives, interaction behavior and brand language. Each team controls its own navigation, facts, commands, permissions and release. A frequently repeated combination can become a shared preset when examples demonstrate the same interaction contract.

**Success.** A new agent can work from a consumer's installed version, reuse the available controls, test the person's task and route a missing capability to the right owner. A maintainer can tell whether a revised skill improves those outcomes and how much time and model usage one successful task takes.

**Failure worth catching.** A cheaper model completes a screen quickly, but labels a submitted request as finished. The code passes the token checker, the visual review uses only a still image and a retry files the same upstream issue twice. Each mistake needs an observable test.

This proposal extends [project adoption](../../../intents/adoption/I19-adopt-a-release/intent.md) and [finding design guidance](../../../intents/guidance/I17-find-design-guidance/intent.md).
