# Evaluation fixture read isolation

Evaluation sessions may read the isolated consumer and required runtime files. They must not read unrelated local project files or shared temporary directories, and must not write to the consumer. Before any model call, the preflight verifies the consumer is readable and independently checks denial of a sibling canary and canaries in both shared system temporary roots. A missing, unsupported or permissive sandbox fails the fixture before a model call. The check uses synthetic canaries and removes them after the preflight.

Keep network disabled and preserve the existing installed package pin and fixture write checks. Exercise the actual configured sandbox with the pinned CLI. Report the result and limits separately from model behavior.
