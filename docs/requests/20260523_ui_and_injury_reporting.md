# Project Requirement: UI Adjustments and Injury Reporting

## Date: 2026-05-23

## Description
The following issues and requirements have been identified based on the latest review of the player and coach interfaces:

1.  **Background Color & Theming:** Background color changes are not clearly visible. The overall theme needs to be reviewed and correctly applied.
2.  **Plans & Elements:** General problems with plans and other elements on the interfaces (needs further investigation to identify specific elements, potentially layout/styling issues).
3.  **Injury Reporting (Player Interface):** While the coach interface has a feature for detecting/monitoring injuries, there is currently no way for players to upload or report their own injury information. This functionality must be added to the player interface.
4.  **"Today's Attendance" Section (Coach Interface):** The attendance list is too long, making the interface cumbersome. Coaches have to scroll significantly to reach the player feedback inbox.
    *   **Action:** Reduce the size of the attendance section. Make it simpler and more visually appealing (e.g., using a compact list, scrollable container, or a summary view).

## Action Items
*   [ ] Verify and fix background color implementation.
*   [ ] Implement a feature in the Player interface to allow players to report their injuries/physical conditions.
*   [ ] Refactor the "Today's Attendance" component to be more compact, ensuring it doesn't push down critical sections like the feedback inbox.
