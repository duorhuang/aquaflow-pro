# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/live.spec.ts >> Live Website E2E Tests - 5 Iterations >> Coach Login & Verification - Iteration 3
- Location: e2e/live.spec.ts:44:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[role="radio"]').filter({ hasText: '教练' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e9]
        - text: Next-Gen Swim Platform
      - generic [ref=e12]:
        - heading "AquaFlow PRO" [level=1] [ref=e13]:
          - generic [ref=e14]: AquaFlow
          - generic [ref=e15]: PRO
        - paragraph [ref=e16]:
          - text: 游泳队训练管理系统
          - generic [ref=e17]: 科学赋能 · 游戏化竞技 · 状态追踪
      - generic [ref=e18]:
        - link "教练登录" [ref=e19] [cursor=pointer]:
          - /url: /login?role=coach
          - img [ref=e20]
          - generic [ref=e32]: 教练登录
          - img [ref=e33]
        - link "运动员登录" [ref=e35] [cursor=pointer]:
          - /url: /login?role=athlete
          - img [ref=e36]
          - generic [ref=e39]: 运动员登录
      - generic [ref=e40]:
        - img [ref=e41]
        - generic [ref=e45]: Flow with Nature, Strive with Passion
    - generic:
      - img
      - img
      - img
  - alert [ref=e46]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Live Website E2E Tests - 5 Iterations', () => {
  4  | 
  5  |   // Test Swimmer Login and Features 5 Times
  6  |   for (let i = 1; i <= 5; i++) {
  7  |     test(`Swimmer Login & Verification - Iteration ${i}`, async ({ page }) => {
  8  |       console.log(`Swimmer Iteration ${i} starting...`);
  9  |       await page.goto('https://sw.sportsflow.best', { waitUntil: 'domcontentloaded' });
  10 |       
  11 |       // Ensure we are on Athlete tab (it defaults to athlete, so just ensure it's selected or click it)
  12 |       await page.locator('button[role="radio"]').filter({ hasText: '运动员' }).click();
  13 | 
  14 |       // Login
  15 |       await page.getByLabel('用户名').fill('ggdayup');
  16 |       await page.getByLabel('密码').fill('123456');
  17 |       
  18 |       // Find the submit button, it could say "登录", "Login", etc.
  19 |       await page.locator('button[type="submit"]').click();
  20 |       
  21 |       // Wait for successful login redirect to workout feed
  22 |       await page.waitForURL('**/workout**', { timeout: 15000 });
  23 |       
  24 |       // Verify Workout page has loaded basic content
  25 |       await expect(page.locator('body')).not.toBeEmpty();
  26 |       console.log(`Swimmer Iteration ${i}: Workout feed loaded.`);
  27 | 
  28 |       // Verify Shop feature
  29 |       await page.goto('https://sw.sportsflow.best/shop', { waitUntil: 'domcontentloaded' });
  30 |       await page.waitForTimeout(1000); // Wait for potential client-side fetch
  31 |       await expect(page.locator('body')).not.toBeEmpty();
  32 |       console.log(`Swimmer Iteration ${i}: Shop page loaded.`);
  33 | 
  34 |       // Verify Profile feature
  35 |       await page.goto('https://sw.sportsflow.best/profile', { waitUntil: 'domcontentloaded' });
  36 |       await page.waitForTimeout(1000);
  37 |       await expect(page.locator('body')).not.toBeEmpty();
  38 |       console.log(`Swimmer Iteration ${i}: Profile page loaded.`);
  39 |     });
  40 |   }
  41 | 
  42 |   // Test Coach Login and Features 5 Times
  43 |   for (let i = 1; i <= 5; i++) {
  44 |     test(`Coach Login & Verification - Iteration ${i}`, async ({ page }) => {
  45 |       console.log(`Coach Iteration ${i} starting...`);
  46 |       await page.goto('https://sw.sportsflow.best', { waitUntil: 'domcontentloaded' });
  47 |       
  48 |       // Click coach role radio button
> 49 |       await page.locator('button[role="radio"]').filter({ hasText: '教练' }).click();
     |                                                                            ^ Error: locator.click: Test timeout of 30000ms exceeded.
  50 |       
  51 |       // Login
  52 |       await page.getByLabel('用户名').fill('testcoach');
  53 |       await page.getByLabel('密码').fill('password123');
  54 |       await page.locator('button[type="submit"]').click();
  55 |       
  56 |       // Wait for dashboard
  57 |       await page.waitForURL('**/dashboard**', { timeout: 15000 });
  58 |       
  59 |       // Verify Dashboard
  60 |       await expect(page.locator('body')).not.toBeEmpty();
  61 |       console.log(`Coach Iteration ${i}: Dashboard loaded.`);
  62 |       
  63 |       // Navigate to weekly plan (Scheduling)
  64 |       await page.goto('https://sw.sportsflow.best/dashboard/weekly-plan', { waitUntil: 'domcontentloaded' });
  65 |       await page.waitForTimeout(1000);
  66 |       await expect(page.locator('body')).not.toBeEmpty();
  67 |       console.log(`Coach Iteration ${i}: Scheduling (Weekly Plan) loaded.`);
  68 |       
  69 |       // Navigate to player management
  70 |       // Using generic /dashboard/players or similar. If it fails, we will see it in the log.
  71 |       await page.goto('https://sw.sportsflow.best/dashboard', { waitUntil: 'domcontentloaded' });
  72 |       await page.waitForTimeout(1000);
  73 |       await expect(page.locator('body')).not.toBeEmpty();
  74 |       console.log(`Coach Iteration ${i}: Player management (Dashboard) loaded.`);
  75 |     });
  76 |   }
  77 | });
  78 | 
```