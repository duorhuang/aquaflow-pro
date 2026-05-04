# Player Login Failure & Password Column Empty in Coach Portal

**Date:** 2026-05-04  
**Reporter:** Coach  

## Issue 1: Players cannot log in to the player portal
Players are consistently unable to log in regardless of credentials used.

## Issue 2: Password column is empty in the Player Management section
In the coach portal's Player Management (队员管理 → /dashboard/athletes), the password column shows nothing when editing a swimmer. The table lists names, classes, and usernames correctly but passwords are blank.

## Root Cause Analysis
### Bug 1 — API strips password for everyone (not just non-coaches)
File: `app/api/swimmers/route.ts`, GET handler (lines 17–22)  
The code uses `requireAnyAuth` (accepts both coaches and athletes), then always strips the password field from all responses — even for coaches. As a result, when the coach portal loads swimmer data, all `password` fields are `undefined`.

### Bug 2 — SwimmerModal pre-fills password from store, but store has no password
File: `components/dashboard/SwimmerModal.tsx`, line 37  
When editing a swimmer, the modal sets `password` from `swimmerToEdit.password`, which is always `undefined` because the API stripped it. The password input therefore shows empty.

### Consequence for Player Login
When the coach sets a password through the modal, they see the hashed value (from a previous save, since the field was pre-filled blank). If they save without typing a new password, the PUT request is sent with an empty string `""`. The `PUT` handler only re-hashes if `data.password` exists and does NOT contain a colon (line 74), so an empty string skips re-hashing but still sets `password = ""` — breaking the stored hash and making login impossible.

## Fix Required
1. **`app/api/swimmers/route.ts`**: In the GET handler, check if the authenticated user is a coach. If so, include passwords in the response; if athlete, strip them.
2. **`components/dashboard/SwimmerModal.tsx`**: When editing, do NOT pre-fill the password field with the (potentially hashed) stored value. Instead, show a placeholder and only send the password in the PUT request if the coach actually types something new.
