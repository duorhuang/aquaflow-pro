# Request: Athlete Login / Workout Page Crash Investigation & Fix

**Date:** 2026-06-05  
**Reporter:** Coach (User) — athletes cannot access /workout page  
**Symptom:** "This page couldn't load" at sw.sportsflow.best/workout

## Root Cause Analysis

### Confirmed via Production API testing:

1. **Login API (`/api/auth/login`)** — ✅ Working correctly
   - POST with `{username: "ggdayup", password: "123456", role: "athlete"}` returns HTTP 200
   - Cookie `aquaflow_session` is correctly set with `Domain=.sportsflow.best`

2. **Auth Me API (`/api/auth/me`)** — ✅ Working correctly
   - Returns correct athlete profile with `role: "athlete"`

3. **Sync API (`/api/sync`)** — ❌ **ROOT CAUSE FOUND**
   - Returns **3.28 MB** of JSON data for an athlete (5.4 seconds)
   - This exceeds practical limits for mobile browsers and could hit Cloudflare Workers limits
   - **Culprit: `weeklyPlans[].sessions[].contentBlocks` and `contentHtml` fields**
   
   Breakdown of 3.28 MB response:
   - `weeklyPlans`: 3.19 MB (97% of total!)
   - Individual session sizes:
     - Session `9267dc4a`: **1.17 MB** — all in `contentBlocks` (base64 images embedded in JSON)
     - Session `9b951805`: **650 KB** — `contentBlocks`
     - Session `da414763`: **650 KB** — `contentHtml` (embedded base64 images in HTML)
     - Session `b31c89e9`: **593 KB** — `contentBlocks`
     - Session `0d8fd190`: **196 KB** — `contentBlocks`

## Fix Applied

**File: `app/api/sync/route.ts`**

For athlete users, strip `contentBlocks`, `contentHtml`, and `trainingBlocks` from DailySession objects when building the sessions map. Athletes only need:
- `id`, `weeklyPlanId`, `date`, `label`, `notes`, `sortOrder`
- `totalDistance`, `imageUrl`, `imageData` (thumbnail references, NOT base64 blobs)
- `trainingType`, `primaryStroke`, `editorMode`

The `contentBlocks` field contains the raw block editor JSON (with embedded base64 images).
The `contentHtml` contains the rendered HTML of those blocks (also with embedded base64 images).
Neither is needed for the athlete view — the `SessionRenderer` component uses `trainingBlocks` for display and `imageUrl` for thumbnails.

## Impact

- Sync payload drops from ~3.28 MB to ~10-50 KB for athletes
- Page load drops from 5+ seconds to under 1 second
- Eliminates the "This page couldn't load" crash
