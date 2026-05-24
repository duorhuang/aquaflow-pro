# Reward Modal Positioning Optimization

**Date**: 2026-05-23

## Request
The tipping feature modal (reward modal) previously did not pop up immediately in view. Users had to scroll down to find it because it appeared in the middle of the team status monitoring row on the side (caused by CSS containing block issues). The user requested to modify it so the menu pops up directly where clicked, making it more intuitive and user-friendly.

## Implementation Details
1. **Fix Containing Block Issue**: Use React `createPortal` to render the modal at the document level (`document.body`) so that `fixed` positioning works relative to the viewport, bypassing the `backdrop-blur-md` containing block of the parent panel.
2. **Contextual Positioning**: Capture the mouse click coordinates (`clientX`, `clientY`) when the "Tip" button is clicked.
3. **Modal Placement**: Calculate the optimal position for the modal based on the click coordinates, ensuring it pops up directly near the interaction point while remaining fully visible within the viewport bounds (preventing overflow).
