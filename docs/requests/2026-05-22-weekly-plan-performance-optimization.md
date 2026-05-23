# Weekly Plan Loading Performance Optimization

**Date:** 2026-05-22

## Request
Optimize the performance and user experience when loading and viewing previous/past weekly plans on the weekly plan dashboard page.
Specifically:
- Reduce the extremely high latency (lag) when loading the list of weekly plans and clicking on a plan in the sidebar.
- Improve database query efficiency for daily training sessions.
- Provide visual feedback (loading indicators) and instant navigation for past plans.

## Details & Analysis
1. **Inefficient Database Querying (`SELECT * FROM "DailySession"`)**:
   - The `/api/weekly-plans` GET handler (used to list all plans for the sidebar) fetched **every single daily training session in the database** to filter them in memory, rather than querying only the necessary ones.
   - This loaded massive base64 image data and large rich text contents for every session ever created, which slows down the API drastically as the database grows.
2. **Missing `sessions` in Athlete Sync**:
   - The `/api/sync` endpoint retrieved weekly plans but omitted their associated daily sessions, which caused the athlete's workout fallback rendering (deriving daily plans from weekly plan sessions) to fail.
3. **No UI Loading State or Caching**:
   - When a coach clicked on a past plan in the sidebar list, there was no loading indicator or visual feedback, leaving the user with a frozen-feeling UI for several seconds while the fetch completed.
   - Clicking between different past plans repeatedly triggered new fetch requests instead of instantly loading them from memory.

## Proposed Optimization Solution
1. **Optimize `/api/weekly-plans` List GET Handler**:
   - Restrict the daily session query to return only the `id` and `weeklyPlanId` columns of the sessions matching the returned plans. This completely bypasses loading massive image data and parsing rich text into memory.
2. **Optimize `/api/sync` GET Handler**:
   - Query only the daily sessions belonging to the published plans in a single batch, and populate their content blocks properly.
3. **Introduce Memory Caching and Visual Loading States**:
   - Add a React-level detail cache `planDetailsCache` mapping `planId -> planDetails` so that selecting previously opened plans is completely instant.
   - Introduce a `loadingPlanId` state to show a loading spinner on the selected plan in the sidebar list, and show a polished loading overlay in the editor panel to make the application feel responsive.
