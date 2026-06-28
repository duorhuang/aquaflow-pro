import { test, expect } from '@playwright/test';

test.describe('Comprehensive UX Audit', () => {

  // ==========================================
  // PHASE 1: PUBLIC PAGES
  // ==========================================

  test.describe('Public Pages', () => {

    test('Landing page loads correctly', async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
        if (msg.type() === 'warning') consoleWarnings.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({ path: 'audit-screenshots/01-landing-page.png', fullPage: true });

      // Check for console errors/warnings
      console.log('Landing page console errors:', consoleErrors);
      console.log('Landing page console warnings:', consoleWarnings);

      // Verify page content
      await expect(page.locator('body')).not.toBeEmpty();

      // Check for layout collapse
      const viewport = await page.viewportSize();
      console.log('Viewport:', viewport);
    });

    test('Login page loads correctly', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/02-login-page.png', fullPage: true });

      // Verify login form exists
      await expect(page.locator('input[type="text"], input[type="email"], input[name="username"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('Poolside page loads correctly', async ({ page }) => {
      await page.goto('/poolside', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/03-poolside-page.png', fullPage: true });
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('Shop page loads correctly', async ({ page }) => {
      await page.goto('/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/04-shop-page.png', fullPage: true });
      await expect(page.locator('body')).not.toBeEmpty();
    });
  });

  // ==========================================
  // PHASE 2: COACH FLOW
  // ==========================================

  test.describe('Coach Flow', () => {

    test('Coach login and dashboard', async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];
      const networkErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
        if (msg.type() === 'warning') consoleWarnings.push(msg.text());
      });

      page.on('requestfailed', req => {
        networkErrors.push(req.url());
      });

      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Switch to coach tab
      const coachRadio = page.locator('button[role="radio"]').filter({ hasText: '教练' });
      await expect(coachRadio).toBeVisible();
      await coachRadio.click();
      await page.waitForTimeout(500);

      // Fill credentials
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Wait for redirect
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'audit-screenshots/05-coach-dashboard.png', fullPage: true });

      console.log('Coach dashboard console errors:', consoleErrors);
      console.log('Coach dashboard console warnings:', consoleWarnings);
      console.log('Coach dashboard network errors:', networkErrors);

      // Verify dashboard loaded
      await expect(page.locator('body')).not.toBeEmpty();

      // Check navigation sidebar exists
      const sidebar = page.locator('nav, [class*="sidebar"], [class*="nav"]');
      const sidebarVisible = await sidebar.isVisible().catch(() => false);
      console.log('Sidebar visible:', sidebarVisible);
    });

    test('Coach dashboard - all nav links', async ({ page }) => {
      // Login first
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Test each coach route
      const coachRoutes = [
        '/dashboard',
        '/dashboard/new-plan',
        '/dashboard/athletes',
        '/dashboard/attendance',
        '/dashboard/attendance/stats',
        '/dashboard/feedbacks',
        '/dashboard/feedbacks/targeted',
        '/dashboard/schedule',
        '/dashboard/weekly-plan',
        '/dashboard/injury-monitor',
        '/dashboard/meets',
        '/settings',
      ];

      for (const route of coachRoutes) {
        console.log(`Testing coach route: ${route}`);
        await page.goto(`${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        await page.screenshot({ path: `audit-screenshots/coach-${route.replace(/\//g, '_') || 'dashboard'}.png`, fullPage: true });

        // Check for 404 or error pages
        const bodyText = await page.locator('body').innerText();
        const has404 = bodyText.includes('404') || bodyText.includes('Not Found');
        const hasError = bodyText.includes('Error') || bodyText.includes('error');

        if (has404) {
          console.log(`WARNING: ${route} appears to be a 404`);
        }
        if (hasError) {
          console.log(`WARNING: ${route} contains error text`);
        }

        await expect(page.locator('body')).not.toBeEmpty();
      }
    });

    test('Coach - create plan flow', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to new plan
      await page.goto('/dashboard/new-plan', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/06-coach-new-plan.png', fullPage: true });

      // Check for form elements
      const formInputs = await page.locator('input, textarea, select').count();
      console.log('New plan form inputs:', formInputs);

      // Check for submit button
      const submitBtn = page.locator('button[type="submit"], button:has-text("保存"), button:has-text("Save")');
      const submitVisible = await submitBtn.isVisible().catch(() => false);
      console.log('Submit button visible:', submitVisible);
    });

    test('Coach - athletes management', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to athletes
      await page.goto('/dashboard/athletes', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/07-coach-athletes.png', fullPage: true });

      // Check for athlete list
      const athleteCount = await page.locator('[class*="swimmer"], [class*="athlete"], tr, [class*="card"]').count();
      console.log('Athlete page elements:', athleteCount);
    });

    test('Coach - feedbacks page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to feedbacks
      await page.goto('/dashboard/feedbacks', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/08-coach-feedbacks.png', fullPage: true });

      // Check for feedback items
      const feedbackItems = await page.locator('[class*="feedback"], [class*="comment"], li, [class*="item"]').count();
      console.log('Feedbacks page items:', feedbackItems);
    });

    test('Coach - weekly plan page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to weekly plan
      await page.goto('/dashboard/weekly-plan', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/09-coach-weekly-plan.png', fullPage: true });

      // Check for weekly plan elements
      const weekElements = await page.locator('[class*="week"], [class*="day"], [class*="session"]').count();
      console.log('Weekly plan elements:', weekElements);
    });

    test('Coach - attendance page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to attendance
      await page.goto('/dashboard/attendance', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/10-coach-attendance.png', fullPage: true });

      // Navigate to attendance stats
      await page.goto('/dashboard/attendance/stats', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/11-coach-attendance-stats.png', fullPage: true });
    });

    test('Coach - schedule page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to schedule
      await page.goto('/dashboard/schedule', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/12-coach-schedule.png', fullPage: true });
    });

    test('Coach - settings page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to settings
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/13-coach-settings.png', fullPage: true });

      // Check for settings form
      const settingsInputs = await page.locator('input, textarea, select, button').count();
      console.log('Settings page interactive elements:', settingsInputs);
    });
  });

  // ==========================================
  // PHASE 3: ATHLETE FLOW
  // ==========================================

  test.describe('Athlete Flow', () => {

    test('Athlete login and workout page', async ({ page }) => {
      const consoleErrors: string[] = [];
      const consoleWarnings: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
        if (msg.type() === 'warning') consoleWarnings.push(msg.text());
      });

      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Switch to athlete tab
      const athleteRadio = page.locator('button[role="radio"]').filter({ hasText: '运动员' });
      await expect(athleteRadio).toBeVisible();
      await athleteRadio.click();
      await page.waitForTimeout(500);

      // Fill credentials
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Wait for redirect
      await page.waitForURL('**/workout**', { timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'audit-screenshots/14-athlete-workout.png', fullPage: true });

      console.log('Athlete workout console errors:', consoleErrors);
      console.log('Athlete workout console warnings:', consoleWarnings);

      // Verify workout page loaded
      await expect(page.locator('body')).not.toBeEmpty();
    });

    test('Athlete - profile page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/workout**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to profile
      await page.goto('/profile', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/15-athlete-profile.png', fullPage: true });

      // Check for profile elements
      const profileElements = await page.locator('input, textarea, img, [class*="profile"]').count();
      console.log('Profile page elements:', profileElements);
    });

    test('Athlete - archive page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/workout**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to archive
      await page.goto('/archive', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/16-athlete-archive.png', fullPage: true });

      // Check for archive elements
      const archiveElements = await page.locator('[class*="archive"], [class*="history"], li, [class*="item"]').count();
      console.log('Archive page elements:', archiveElements);
    });

    test('Athlete - shop page', async ({ page }) => {
      // Login
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/workout**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Navigate to shop
      await page.goto('/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/17-athlete-shop.png', fullPage: true });

      // Check for shop items
      const shopItems = await page.locator('[class*="shop"], [class*="item"], [class*="product"]').count();
      console.log('Shop page items:', shopItems);
    });
  });

  // ==========================================
  // PHASE 4: MOBILE RESPONSIVE TESTS
  // ==========================================

  test.describe('Mobile Responsive Tests', () => {

    test('Mobile viewport - landing page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/18-mobile-landing.png', fullPage: true });

      // Check for layout collapse
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      const viewportWidth = 375;

      if (bodyWidth > viewportWidth + 50) {
        console.log('WARNING: Horizontal overflow detected on mobile');
      }
    });

    test('Mobile viewport - login page', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/19-mobile-login.png', fullPage: true });

      // Verify form elements are tappable
      const submitBtn = page.locator('button[type="submit"]');
      const bbox = await submitBtn.boundingBox();
      if (bbox) {
        console.log('Submit button size:', bbox.width, 'x', bbox.height);
        if (bbox.height < 44) {
          console.log('WARNING: Submit button too small for touch target (min 44px)');
        }
      }
    });

    test('Mobile viewport - coach dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      // Login as coach
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/20-mobile-coach-dashboard.png', fullPage: true });

      // Check for horizontal overflow
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      if (bodyWidth > 375 + 50) {
        console.log('WARNING: Horizontal overflow on mobile coach dashboard');
      }
    });

    test('Mobile viewport - athlete workout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      // Login as athlete
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/workout**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/21-mobile-athlete-workout.png', fullPage: true });

      // Check for horizontal overflow
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      if (bodyWidth > 375 + 50) {
        console.log('WARNING: Horizontal overflow on mobile athlete workout');
      }
    });

    test('Tablet viewport - coach dashboard', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Login as coach
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/22-tablet-coach-dashboard.png', fullPage: true });
    });

    test('Large desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Login as coach
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/23-large-coach-dashboard.png', fullPage: true });
    });
  });

  // ==========================================
  // PHASE 5: ERROR HANDLING & EDGE CASES
  // ==========================================

  test.describe('Error Handling & Edge Cases', () => {

    test('Invalid login credentials', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      // Try invalid credentials
      await page.getByLabel('用户名').fill('invaliduser');
      await page.getByLabel('密码').fill('wrongpassword');
      await page.locator('button[type="submit"]').click();

      // Wait for error message
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'audit-screenshots/24-invalid-login.png', fullPage: true });

      // Check for error message
      const bodyText = await page.locator('body').innerText();
      const hasError = bodyText.toLowerCase().includes('error') ||
                       bodyText.includes('错误') ||
                       bodyText.includes('invalid') ||
                       bodyText.includes('incorrect');

      console.log('Invalid login shows error:', hasError);
    });

    test('Empty form submission', async ({ page }) => {
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      // Try to submit empty form
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'audit-screenshots/25-empty-form.png', fullPage: true });

      // Check for validation
      const bodyText = await page.locator('body').innerText();
      const hasValidation = bodyText.toLowerCase().includes('required') ||
                            bodyText.includes('必填') ||
                            bodyText.includes('please');

      console.log('Empty form shows validation:', hasValidation);
    });

    test('Direct access to protected routes', async ({ page }) => {
      // Try to access coach dashboard without login
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log('Direct dashboard access redirected to:', currentUrl);

      // Should redirect to login
      if (!currentUrl.includes('/login')) {
        console.log('WARNING: Protected route accessible without auth');
      }

      await page.screenshot({ path: 'audit-screenshots/26-protected-route.png', fullPage: true });
    });

    test('API endpoints accessibility', async ({ page }) => {
      const apiEndpoints = [
        '/api/keep-alive',
        '/api/swimmers',
        '/api/plans',
        '/api/feedbacks',
        '/api/attendance',
        '/api/templates',
        '/api/announcements',
      ];

      for (const endpoint of apiEndpoints) {
        const response = await page.evaluate(async (url) => {
          try {
            const res = await fetch(url);
            return { url, status: res.status, ok: res.ok };
          } catch (e: any) {
            return { url, error: e.message };
          }
        }, `${endpoint}`);

        console.log(`API ${endpoint}:`, response);
      }
    });
  });

  // ==========================================
  // PHASE 6: INTERACTION TESTS
  // ==========================================

  test.describe('Interaction Tests', () => {

    test('Navigation links work', async ({ page }) => {
      // Login as coach
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Find all navigation links
      const navLinks = await page.locator('a[href^="/dashboard"], a[href^="/settings"]').all();
      console.log('Found navigation links:', navLinks.length);

      for (const link of navLinks.slice(0, 5)) { // Test first 5
        const href = await link.getAttribute('href');
        console.log('Testing nav link:', href);

        if (href) {
          await link.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `audit-screenshots/nav-${href.replace(/\//g, '_') || 'link'}.png`, fullPage: true });

          // Go back
          await page.goBack();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('Buttons have hover states', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Find all buttons
      const buttons = await page.locator('button').all();
      console.log('Found buttons on landing page:', buttons.length);

      // Test hover on first button
      if (buttons.length > 0) {
        await buttons[0].hover();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'audit-screenshots/27-button-hover.png', fullPage: true });
      }
    });

    test('Modal/dialog interactions', async ({ page }) => {
      // Login as coach
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      await page.waitForTimeout(2000);

      // Look for modal triggers
      const modalTriggers = await page.locator('button:has-text("add"), button:has-text("创建"), button:has-text("new"), button:has-text("edit")').all();
      console.log('Found potential modal triggers:', modalTriggers.length);

      if (modalTriggers.length > 0) {
        await modalTriggers[0].click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: 'audit-screenshots/28-modal-test.png', fullPage: true });

        // Check for modal
        const modal = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]');
        const modalVisible = await modal.isVisible().catch(() => false);
        console.log('Modal visible:', modalVisible);

        // Try to close modal
        if (modalVisible) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
          const modalStillVisible = await modal.isVisible().catch(() => false);
          console.log('Modal still visible after Escape:', modalStillVisible);
        }
      }
    });
  });
});
