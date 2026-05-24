# Training Plan Types and Background Synchronization

**Date**: 2026-05-23

## Description
The user noticed that the training background changes based on different training plans and durations. However, the system currently does not allow selecting specific training types from the plan (e.g., whether today is a sprint, a recovery session, or a specific swimming stroke). As a result, the training background cannot change accordingly.

## Requirements
1. **Selection Feature for Training Session Types**: Add a selection feature before or when creating the training plan where the coach can specify the type of session (e.g., "recovery swim", "sprint", etc.).
2. **Daily Stroke/Method Selection**: Within the weekly training schedule, ensure that a specific swimming style or method can be selected for each day.
3. **Synchronization**: Synchronize this training type information to the athletes' side of the app.
4. **Background Updates**: The system must successfully update and change the training background based on the selected criteria (training type/stroke).
