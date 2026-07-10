# 2026-07-08 Setup Passcode Protection

## Request Background
The user requested to protect the coach setup page `/setup` with a password. If a password is set, the setup page should require this password before letting a teacher/coach create new accounts. Additionally, once unlocked with the password, the setup page should allow creating new accounts for other coaches (bypassing the current single-coach restriction).

## Requirements
1. **Passcode Protection Screen**: Implement a passcode challenge screen on the `/setup` page. The default passcode will be `aquaflow2026` (configurable via `process.env.SETUP_PASSCODE`).
2. **API Verification**:
   - Accept `passcode` in the POST request body of `/api/auth/register-coach`.
   - Validate `passcode` against `process.env.SETUP_PASSCODE || 'aquaflow2026'`.
   - Allow account creation when the correct passcode is provided, even if a coach already exists in the database.
