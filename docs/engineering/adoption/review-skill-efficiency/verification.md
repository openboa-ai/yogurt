# Review evaluation findings

A single routing trial with the existing review skill passed and used 250,649 input tokens, including 215,168 cached tokens, and 2,002 output tokens. A single trial of a shorter-discovery instruction also passed and used 316,862 input tokens, including 280,064 cached tokens, and 2,039 output tokens. Both used the same model and installed SDK. Actual charges were unavailable. These samples do not establish an efficiency improvement, so the candidate instruction was not adopted.

The second trace revealed reads from shared temporary directories outside the consumer fixture. The prior sibling-only preflight did not test that boundary. Synthetic canaries confirmed that the current configured sandbox still permits those reads even with additional deny entries. Nesting an operating-system sandbox was rejected by the host. The evaluator now tests synthetic canaries in the shared temporary roots before every model call and reports the fixture unavailable when isolation fails. No further model trial is qualified on this host until that preflight passes. The trace itself remains outside the product package.

The evaluator was then run with the updated preflight against an isolated fixture. It reported `fixture-unavailable` and recorded no token usage or model trace, confirming that the model step did not run after the synthetic canary was readable.
