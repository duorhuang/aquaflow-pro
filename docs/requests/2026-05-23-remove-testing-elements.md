# Remove Testing Elements from Live Version

**Date:** 2026-05-23
**Status:** FIXED
## Request
Don't arbitrarily add things that weren't there before; just stick to the standard content. While it is fine to have this for testing purposes, ensure that once it is synced to the live version, those elements are completely removed. We should not have that kind of thing in the final product at all.

## Implementation Notes
- Removed the "快速添加训练块" (Quick add blocks) section from `PlanEditor.tsx` as it was an arbitrarily added mock/test element.
- Added null-safety for `block.items` to prevent runtime crashes caused by undefined `items` data being rendered.
