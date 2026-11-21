# Native sample viewport evidence

The saved-view fixture was installed with the existing Button and Switch on macOS using Native SDK 0.11.1 and Zig 0.16.0. Three model tests, strict markup checking and a ReleaseFast automation build passed.

An actual 480 × 320 canvas initially had 415.25 points of content. A wheel input moved the scroll offset to 95.25 points, bringing the Dark appearance switch and the final surface label into the viewport. The visible switch accepted one synthetic click and changed from off to on; that on state remained after resizing to 480 × 480 and back to 480 × 320. With the scroll area focused, synthetic End and Home key inputs moved its offset between 95.25 and zero. Resizing to 480 × 480 returned the scroll offset to zero and showed the content within the canvas. These observations came from the running Metal surface; a screenshot of the short scrolled state was captured during verification.

This is partial evidence. Operating the remaining controls after scrolling, operating-system accessibility, real pointer and keyboard input, and independent visual review remain to be verified. The existing switch remains 32 × 19 points and its geometry and motion are not qualified by this sample change.
