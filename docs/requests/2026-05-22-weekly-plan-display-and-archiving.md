# Request: Weekly Plan Display Segmentation and Collapsible Archiving

**Date:** 2026-05-22

## Requirements
1. **Sidebar Plan Partitioning**:
   - Limit the main active sidebar list to display recent plans (e.g., plans within the last 2 months, or the 8 to 10 most recent plans, capping at 15 plans).
   - Order all items sequentially by date (`weekStart`) in chronological order.
2. **Archived Plans Folder**:
   - Place all older plans (older than 2 months or beyond the top 10-15 plans) into a separate collapsible folder ("历史归档" / "Archived Plans").
   - This older plans section should remain collapsed by default to prevent visual clutter and reduce active DOM element load, but the user can expand it to find older plans if needed.
3. **Optimized Load**:
   - Ensure the UI remains highly responsive and clicking interaction is extremely smooth.

## Proposed Implementation Detail
- Parse and sort the retrieved weekly plans in the React component.
- Separate plans into a `recentPlans` array (plans within the last 60 days, up to a maximum of 10 plans) and an `archivedPlans` array (all older plans).
- Render `recentPlans` directly in the sidebar list.
- Render a collapsible Accordion/Folder component in the sidebar for `archivedPlans`. When expanded, it renders the list of archived plans in chronological order.
