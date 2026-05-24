# Request: Fix Weekly Plan Load Failure (修复加载历史周计划失败问题)

## Date
2026-05-24

## Description
When the coach attempts to click on previous weekly plans in the sidebar of `/dashboard/weekly-plan`, a toast error pops up in the top-right corner saying:
> `加载周计划失败，请重试` (Failed to load weekly plan, please try again).

This error completely prevents the coach from inspecting or modifying older training plans.

## Root Cause Analysis
1. In `app/api/weekly-plans/route.ts` and `app/api/sync/route.ts`, raw SQL queries are used to retrieve the sessions of the weekly plans from the `DailySession` table:
   ```typescript
   const sessions = await sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ${id} ORDER BY "sortOrder" ASC`;
   ```
2. While the retrieval loops properly parse the `contentBlocks` JSON column (checking if it's a string and using `JSON.parse`), they completely omit parsing for the `trainingBlocks` JSON column (used for professional training plan templates in the editor).
3. Under serverless Neon PostgreSQL, raw SQL queries return JSON fields as serialized strings (e.g. `"[...]"`).
4. Returning these raw strings directly to the client causes client-side state mapping or rendering failures when React attempts to parse or iterate over `s.trainingBlocks`.

## Resolution Plan
1. **API Upgrades**: Add explicit, safe string checks and JSON parsing for `trainingBlocks` in:
   - `app/api/weekly-plans/route.ts` (when loading a specific plan by ID)
   - `app/api/sync/route.ts` (when populating weekly plans during page load initialization)
   
   ```typescript
   if (s.trainingBlocks && typeof s.trainingBlocks === 'string') {
       try { s.trainingBlocks = JSON.parse(s.trainingBlocks); } catch {}
   }
   ```
2. **Quality Verification**: Verify that TypeScript compiles cleanly and all unit tests continue to pass.
3. **Continuous Deployment**: Stage and commit the changes in both repositories, push the fixes to the remote branch on GitHub, and deploy the new version live to production.
