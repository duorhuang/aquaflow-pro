# Request 2026-06-27: Comprehensive Review & Fixes

**Objective:**
Check every part of the website to ensure all changes and files are correct. Delete useless files to make the workspace clear. Ensure everything on the site is functioning properly.

**Key Focus Areas:**
1. Fix all login issues (including the "Session Expired" refresh loop issue we've been working on).
2. Resolve any other bugs, such as refreshing issues.
3. Review the UI to ensure it is beautiful and follows a consistent style related to swimming, water, training, and sports.
4. Verify overall functionality: ensure all buttons work, the site is not slow, and it works in both Mainland China (no VPN) and America (VPN).

**Actions to Take:**
- Resolve the session loop caused by incorrect user derivation in the store.
- Update `lib/background-themes.ts` to include premium aquatic color themes.
- Clean up the workspace by removing old test scripts or unused files.
- Perform a thorough manual testing of the whole site.
