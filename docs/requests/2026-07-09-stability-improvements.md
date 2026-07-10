# 2026-07-09 Website Stability Improvements

## Request Background
The user reported two critical stability issues encountered during testing:
1. **Login Loop / Infinite Redirect**: After logging in, Chrome's native weak-password warning dialog causes the application to refresh and immediately kick the user back to the login screen, creating an infinite loop.
2. **Sync Failures and Flashing/Redirects**: After logging in, the top-right status displays "Sync unsuccessful". Clicking the Sync button triggers a page reload which redirects the user back to `/login`.

## Analysis & Root Causes
1. **API Cold-Start Failures triggering Logouts**:
   - The `/api/auth/me` endpoint had an artificial 3-second database warmup timeout. If Neon Serverless Postgres was cold, it returned a `503 Database waking up` error.
   - On the athlete side (workout, profile, archive pages), the mount-time authentication hook `api.auth.me()` caught this 503 error (or any network timeout) and immediately redirected the user to `/login`, logging them out.
2. **Empty Store causing false "Session Expired" screens**:
   - If the initial data sync failed (due to database cold start), the swimmer store initialized empty (`swimmers = []`).
   - The workout page derived `currentUser = swimmers[0]` (or by athlete ID). If the store was empty, `currentUser` was null, which triggered the "Session Expired" page and forced a redirect to login.
3. **Flashing on Sync Reloads**:
   - Reloading the page on sync errors triggered Next.js middleware. If the database was slow or the session check timed out, the user was redirected back to the login page.

## Implemented Solutions

### 1. Robust Warmup Retry Loop in Auth Endpoints
- Updated `/api/auth/me` to use the same robust retry loop as `/api/sync` (up to 3 retries of 10s each, with a 3s delay). This lets `/api/auth/me` wait patiently for the database to wake up rather than returning a 503 error after 3 seconds.
- Implemented a similar retry loop inside `warmDb` in the `/api/auth/login` route.

### 2. Smart Local Storage Session Recovery
- Modified the auth catch blocks on `workout/page.tsx`, `profile/page.tsx`, and `archive/page.tsx` to distinguish between authentication errors (401/403/invalid session) and connection/503 errors.
- On connection/503 errors, if a valid athlete ID exists in `localStorage`, the pages recover using that ID, allowing the page to render and letting the sync engine update the data automatically when the database wakes up, rather than logging the user out.

### 3. Exposing Session Validity State
- Added an `unauthenticated` state variable to the sync engine and store context.
- Distinguished between database offline status and active session expiry. The "Session Expired" screen is now only rendered if `unauthenticated` is explicitly true (meaning the server actually returned a 401/403).
