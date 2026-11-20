---
name: yogurt-evaluate
description: Evaluate changes to Yogurt skills, their routing or the model used to perform a task. Use for maintainer benchmarks of quality, tokens, latency or cost across skill and model versions.
---

Choose the task family and freeze its starting inputs, SDK/skill revision, model settings and observation method. Use fresh contexts and include only the solver's inputs. Keep expected results and unreleased validation tasks with the grader. Run under the available evaluation budget.

Run deterministic fixture checks before model trials. If only the grader changed, replay the retained responses first. Use the evaluation runner's `--plan` to count calls and potential retries. Set `--max-model-calls` for the specific comparison. Expand a successful small-profile smoke test only when a new sample can resolve a decision.

Measure skill selection from observed loads. Measure outputs by running the user's task or inspecting its actual artifacts. Use a fake tracker when an action would write to GitHub. For visual decisions, compare unlabelled versions at the real size. Keep missing runtime evidence and missing billing data explicit.

Compare the current and candidate versions on paired tasks with the same model. To test model choice, keep the skill and task fixed. Collect input, cached input, output, elapsed time, retries and escalation for the entire task. Include failed attempts in cost per successful task.

Make a targeted change from a development failure. Use validation cases for selecting a version, then check it on untouched task families. Return the evidence for retaining, revising or rejecting the change. A single inexpensive success can nominate a model for a wider trial.
