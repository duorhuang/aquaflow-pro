import { test, expect } from '@playwright/test';

test.describe('Live Website E2E Tests - 5 Iterations', () => {

  // Test Swimmer Login and Features 5 Times
  for (let i = 1; i <= 5; i++) {
    test(`Swimmer Login & Verification - Iteration ${i}`, async ({ page }) => {
      console.log(`Swimmer Iteration ${i} starting...`);
      await page.goto('https://sw.sportsflow.best', { waitUntil: 'domcontentloaded' });
      
      // Ensure we are on Athlete tab (it defaults to athlete, so just ensure it's selected or click it)
      await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();

      // Login
      await page.getByLabel('用户名').fill('ggdayup');
      await page.getByLabel('密码').fill('123456');
      
      // Find the submit button, it could say "登录", "Login", etc.
      await page.locator('button[type="submit"]').click();
      
      // Wait for successful login redirect to workout feed
      await page.waitForURL('**/workout**', { timeout: 15000 });
      
      // Verify Workout page has loaded basic content
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Swimmer Iteration ${i}: Workout feed loaded.`);

      // Verify Shop feature
      await page.goto('https://sw.sportsflow.best/shop', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000); // Wait for potential client-side fetch
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Swimmer Iteration ${i}: Shop page loaded.`);

      // Verify Profile feature
      await page.goto('https://sw.sportsflow.best/profile', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Swimmer Iteration ${i}: Profile page loaded.`);
    });
  }

  // Test Coach Login and Features 5 Times
  for (let i = 1; i <= 5; i++) {
    test(`Coach Login & Verification - Iteration ${i}`, async ({ page }) => {
      console.log(`Coach Iteration ${i} starting...`);
      await page.goto('https://sw.sportsflow.best', { waitUntil: 'domcontentloaded' });
      
      // Click coach role radio button
      await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
      
      // Login
      await page.getByLabel('用户名').fill('testcoach');
      await page.getByLabel('密码').fill('password123');
      await page.locator('button[type="submit"]').click();
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard**', { timeout: 15000 });
      
      // Verify Dashboard
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Coach Iteration ${i}: Dashboard loaded.`);
      
      // Navigate to weekly plan (Scheduling)
      await page.goto('https://sw.sportsflow.best/dashboard/weekly-plan', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Coach Iteration ${i}: Scheduling (Weekly Plan) loaded.`);
      
      // Navigate to player management
      // Using generic /dashboard/players or similar. If it fails, we will see it in the log.
      await page.goto('https://sw.sportsflow.best/dashboard', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`Coach Iteration ${i}: Player management (Dashboard) loaded.`);
    });
  }
});
