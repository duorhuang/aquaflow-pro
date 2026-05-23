# Fix API Client Issues

**Date:** 2026-05-22

## Request
Fix the following issues in the codebase:
1. `Internal Server Error` at `lib/api-client.ts (44:23)` in `fetchAPI`.
2. `Runtime AbortError` at `lib/api-client.ts (14:57)` where `signal is aborted without reason` when fetch timeout happens.

## Details
- `lib/api-client.ts` throwing error strings.
- `lib/api-client.ts` timeout logic using `AbortController` throws `AbortError` which isn't caught gracefully, or aborts without a reason leading to Next.js unhandled errors.

## Solution Iteration 2
1. **Increased Timeout**: Increased request timeout from 12s to 30s inside `lib/api-client.ts`. This gives the Neon serverless database (which sleeps when idle) ample time to cold-start and establish a WebSocket connection without premature cancellation.
2. **Preventing Dev Overlays**: Switched background error logging (e.g. initial parallel fetches on page load and auto-sync) from `console.error` to `console.warn` in `lib/store.tsx` and `weekly-plan/page.tsx`. This stops Next.js Dev Overlay from displaying disruptive full-screen red error popups in development for caught or handled network failures, while still correctly preserving diagnostic warnings in the browser console.

