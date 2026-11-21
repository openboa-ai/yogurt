# Shared motion profile source

The owner selected the motion examples as the design and behavior baseline and asked for one token foundation across components. Move the existing named CSS motion profiles to the canonical UI token source with the same duration, sampled curve and fallback. Preserve each public CSS variable name and the existing supported-browser behavior. Keep separate semantic names even when their sampled values currently match.

Generate the web variables and Native duration constants from that source. The generated duration is an input for a Native implementation, not proof of Native animation parity. Preserve runtime spring choreography until its parameters are independently mapped and qualified. Reject invalid profiles during generation. The existing motion and reduced-motion browser checks, generated output checks and installed consumers provide evidence; independent frame review and Native qualification remain separate.
