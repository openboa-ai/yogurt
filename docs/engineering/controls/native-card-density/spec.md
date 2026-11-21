# Native card inset

The native card uses the shared card surface and retains its existing title, detail and content slot. Its optional numeric `padding` argument defaults to 18 when omitted so existing calls retain their layout. Callers may select 16 for compact, 18 for regular or 24 for spacious presentation. The SDK resolves the numeric template argument as the card's uniform inset.

Verify that existing calls without `padding` compile and keep the 18 inset, and that explicit 16, 18 and 24 values compile and render without changing the content or slot. Check all three densities in a native runtime before claiming visual parity.
