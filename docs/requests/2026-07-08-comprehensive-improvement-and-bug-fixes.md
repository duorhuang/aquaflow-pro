# 2026-07-08 Comprehensive Improvement and Bug Fixes

## Request Background
The user requested to improve all parts of the website, ensuring that there are no problems remaining. This includes fixing functional bugs, styling issues, lint errors, build errors, and validating overall usability.

## Identified Issues & Areas for Improvement

### 1. Functional Bugs
- **Toast Notification Crash** (`components/common/Toast.tsx`): The map variable parameter `t` shadows the translation function `t` returned by `useLanguage()`, causing `Cannot read properties of undefined (reading 'closeNotification')` when rendering any toast notifications.
- **Client-Side Auth Guards**: Ensure no custom timers are used for redirects on the client-side.

### 2. Linting & Type Validation Errors
- **React Hook in Effect** (`app/(athlete)/workout/page.tsx`): Synchronous `setState` inside `useEffect` causes cascading renders.
- **HTML Anchor usage** (`app/error.tsx` & `app/global-error.tsx`): Using `<a>` elements for navigation instead of Next.js `<Link>`.
- **Ref access during render** (`lib/store.tsx`): Accessing and updating `useRef` directly during rendering.
- **stress-test.js require imports**: Use of `require()` in a JS file where ESLint expects standard ES imports.

### 3. Verification & Testing
- Ensure that the project builds correctly with no warnings or errors.
- Ensure that all 91 Vitest unit/component tests pass.
