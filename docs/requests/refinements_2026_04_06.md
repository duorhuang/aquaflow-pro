# Refinements & Bug Fixes Request - 2026-04-06

## Request Overview
The user requested a series of fixes and refinements for the AquaFlow Pro dashboard and management tools. They emphasized completion of "all remaining tasks" including attendance statistics and publishing stability.

## Key Requirements
1.  **Attendance (Duty) Bug**:
    -   Fix the issue where the "Duty" status (interpreted as swimmer "Doody") remains green even after clicking "Clear All" (全部清除).
    -   Ensure UI state consistently reflects the actual attendance record. (Status: COMPLETED)
2.  **Weekly Plan Creation & Publishing**:
    -   Fix the "Create New Plan" button in `weekly-plan` page (currently non-responsive). (Status: COMPLETED)
    -   **Publishing Stability**: Resolve the "Publish Failure" issue when uploading many photos. Simplify the flow by removing "Save Draft".
3.  **Performance Management**:
    -   Allow coaches/swimmers to edit, delete, or retract performance records.
    -   Refine the entry and display of these records in the Athlete Dashboard. (Status: COMPLETED)
4.  **Loading Performance & Accessibility**:
    -   Address the 15-20s loading delay for the Athlete Dashboard.
    -   Add a database warming/status indicator. (Status: COMPLETED)
    -   Ensure the app is accessible in mainland China without VPN.
5.  **Complete Statistics**:
    -   Coaches need a "complete statistical result" for attendance (e.g., monthly summary grid).
