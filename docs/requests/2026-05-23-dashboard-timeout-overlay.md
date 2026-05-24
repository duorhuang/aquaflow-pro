# Request: Fix Timeout Red Overlay on Dashboard

**Date:** 2026-05-23
**Type:** Bug Fix

## Description
The user reported an issue where a red Next.js error overlay appears displaying "Request timed out for /weekly-plans" with a call stack pointing to `DashboardPage.useEffect.fetchPlans` at `app/(driver)/dashboard/page.tsx (33:31)`.

## Cause
Because the server is using `@neondatabase/serverless` and there is a known cold start latency of 20-30 seconds (or more) when connecting from China, the Next.js compilation time plus the database query time often exceeds the 45-second `REQUEST_TIMEOUT` set in `lib/api-client.ts` during local development or on slow connections. 

If the user navigates to another page (like `/dashboard/injury-monitor` in the screenshot) before the `fetchPlans` request completes, the original `useEffect`'s fetch operation is still running in the background. Once the 45-second timeout hits, the `AbortController` throws an `AbortError`. This error is caught in `fetchPlans` which logs it using `console.error()`. Next.js 14 development server intercepts this `console.error` and displays an intrusive red error overlay on the user's current screen.

## Resolution
Modified `app/(driver)/dashboard/page.tsx` to explicitly check for timeout errors in the `catch` block and return silently without invoking `console.error()`. This matches the pattern already implemented in `app/(driver)/dashboard/weekly-plan/page.tsx`.

```typescript
            } catch (error: any) {
                if (error.message?.includes('timed out')) return;
                console.error("Failed to load weekly plans", error);
            }
```

This prevents the Next.js error overlay from appearing during slow initial loads or cold starts, improving the developer and user experience.
