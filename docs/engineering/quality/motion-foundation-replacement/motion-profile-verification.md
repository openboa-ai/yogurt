# Motion profile verification in progress

The 52 existing CSS motion profiles were moved to the UI token source. Comparing generated CSS declarations with the previous committed CSS found no duration, fallback or sampled-curve differences. The catalog and generated token checks passed, including Web and Native duration outputs. The motion gallery browser check exercised 78 examples at 320, 768 and 1440 px without reported page errors.

An installed Native button and switch sample compiled with Zig 0.16.0 and Native SDK 0.11.1. Its three model tests and strict markup checks passed. Generated duration constants do not establish Native animation or visual parity. Runtime spring parameters, frame-by-frame comparisons, the remaining components and Native interaction qualification remain open.
