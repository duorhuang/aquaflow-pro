# 2026-07-10 Website Stability & Core Mechanism Perfection

## Request Context
The user reports ongoing website instability, specifically:
1. **Flickering & Glitches**: Glitches or flickering when logging in and switching between pages/tasks.
2. **Synchronization Issues**: "Sync failed" state occurs frequently, and clicking it causes a full-page reload and subsequent flickering/redirects.
3. **Concurrent Sessions**: Question about whether concurrent logins cause flickering, and how updates are received.
4. **Athlete UX Clarity**: Confusion on the athlete side, lagginess, and unsmoothed transitions.

## Requirements
1. **Prioritize Basic Stability**: Perfect core login, navigation, and sync mechanisms so they do not flash, flicker, or crash.
2. **Instant/Smooth Athlete Sync**: Improve athlete-side sync, ensuring they receive updates instantly when active, without unnecessary full-page refreshes.
3. **Replace Full Page Reloads**: Ensure the "sync failed" status button triggers background re-syncs rather than destructive `window.location.reload()`.
4. **Defer Closet Feature**: Do not evolve the Closet feature until the core stability is fully verified and solid.
