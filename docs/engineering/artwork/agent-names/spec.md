# Match agent names to avatar combinations

Accepted direction. Pair each of the 1,170 current avatar combinations with one short English display name. Ship the same fixed pairs for Web and Native. Each app chooses which pair to use and owns random selection, duplicate handling and persistence.

The canonical table holds the name, fitted variant ID and palette token. The variant and color together identify the pair. Keep existing pairs stable when adding future data. Keep Kai and Sol available to their existing identities. Export the JSON directly for Web and generate the equivalent Zig constants for Native. Apps may take a name from any row or use its suggested appearance. The SDK distributes data and the app implements selection.

Verify exactly 1,170 case-insensitively distinct single-word names and one row for every supported variant and color combination. Check both outputs against the canonical table and import them from a packaged SDK. If the source contains an invalid, missing or duplicate pair, generation reports the offending data.
