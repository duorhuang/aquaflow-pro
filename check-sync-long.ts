import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.route('**/cloudflareinsights.com/**', route => route.abort());

  const syncRequests: { status: number; time: number }[] = [];
  page.on('response', resp => {
    if (resp.url().includes('/api/sync')) {
      syncRequests.push({ status: resp.status(), time: Date.now() });
    }
  });

  console.log('🔄 Fresh browser context — loading homepage...');
  await page.goto('https://sw.sportsflow.best', { waitUntil: 'networkidle', timeout: 30000 });

  console.log('⏳ Waiting 2 minutes to check for repeated polling...');
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(10000);
    const elapsed = ((Date.now() - syncRequests[0]?.time || 0) / 1000).toFixed(0);
    console.log(`   ${elapsed}s elapsed — ${syncRequests.length} sync request(s) so far`);
  }

  console.log('\n=== Results ===');
  console.log(`Total /api/sync requests in 2 minutes: ${syncRequests.length}`);
  if (syncRequests.length > 1) {
    console.log('❌ FAIL — polling is still happening!');
    syncRequests.forEach((r, i) => {
      if (i > 0) console.log(`  #${i + 1}: ${r.status} (+${((r.time - syncRequests[0].time) / 1000).toFixed(1)}s)`);
    });
  } else {
    console.log('✅ PASS — only initial request, polling stopped');
  }

  await browser.close();
})();
