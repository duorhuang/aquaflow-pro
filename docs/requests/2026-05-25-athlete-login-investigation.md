# Request: Athlete Login & Connection Error Hardening

**Date**: 2026-05-25  
**Reporter**: Swimmer/Athlete

## Background
The user reported that the athlete portal (队员端) still experiences occasional cases where athletes cannot enter the system or login successfully.

## Analysis & Diagnostic Findings

1. **Stale ID "Session Expired" vs. Real DB Offline Confusion**:
   - In `app/(athlete)/workout/page.tsx`, if the database is offline or takes too long to connect, `/api/sync` will return an error (500 or 502/504).
   - The store provider in `lib/store.tsx` catches the error but sets `isLoaded` to `true` with an empty `swimmers` array `[]`.
   - The athlete's dashboard sees `isLoaded === true`, but cannot find the athlete's stored ID in the empty `swimmers` list.
   - It then misleadingly shows the **"Session Expired (无法识别您的队员身份)"** screen, prompting the user to return to login. This is highly confusing when the database/server is simply down.

2. **Faulty `allFailed` Boolean Logic in `lib/store.tsx`**:
   - The store check `const allFailed = fetchedPlans === null && fetchedSwimmers === null;` is faulty.
   - When the API sync request fails, `safeFetch(api.sync.getAll, null)` returns `null`.
   - The destructured `fetchedPlans` and `fetchedSwimmers` become `undefined` (not `null`).
   - Consequently, `allFailed` evaluates to `false` when it should be `true`. The store is falsely marked as successfully loaded with empty lists.

3. **Cloudflare Rate Limiter Header Gap**:
   - In `app/api/auth/login/route.ts`, the IP rate limiter checks `x-forwarded-for` and `x-real-ip`.
   - In Cloudflare Pages environment, the primary client IP header is `cf-connecting-ip`. Missing this header could fallback to `'unknown'`, sharing a rate-limit pool for multiple users sharing a worker isolate.

## Proposed Hardening Solutions

1. **Fix `allFailed` Logic**:
   - Update `lib/store.tsx` to set `syncStatus` to `'error'` if `syncData` is `null` or if `allFailed` is detected.
   - Evaluate `allFailed` properly when `syncData` is null or items are undefined.

2. **Premium Connection Error Screen**:
   - Update `app/(athlete)/workout/page.tsx` to distinguish between a stale local ID (real session expired) and a database loading failure.
   - If `syncStatus === 'error'` and swimmers array is empty, show a stunning "Server Connection Error" interface with a retry button instead of a misleading session expired screen.

3. **Rate Limiter Hardening**:
   - Update `getClientIP` in the login API to check `cf-connecting-ip` first.
