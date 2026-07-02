const http = require('http');
const https = require('https');

async function runStressTest() {
  const url = process.argv[2] || 'http://localhost:3000';
  console.log(`Starting stress test against ${url} with 50 concurrent users...`);

  const CONCURRENT_USERS = 50;
  let successCount = 0;
  let errorCount = 0;
  let totalTime = 0;

  // We'll hit the homepage and then simulate an API request
  const simulateUserSession = async (userId) => {
    const startTime = Date.now();
    try {
      const client = url.startsWith('https') ? https : http;
      
      // Simulate loading homepage
      await new Promise((resolve, reject) => {
        const req = client.get(`${url}/`, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`Homepage failed with status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
      });

      // Simulate API call (like fetching a dashboard)
      // Since we don't have an auth token in this basic test, we'll just hit a public or simple endpoint
      // like /api/keep-alive or just the login page.
      await new Promise((resolve, reject) => {
        const req = client.get(`${url}/login?role=athlete`, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            reject(new Error(`Login page failed with status ${res.statusCode}`));
          }
        });
        req.on('error', reject);
      });

      const endTime = Date.now();
      successCount++;
      totalTime += (endTime - startTime);
    } catch (error) {
      console.error(`User ${userId} failed: ${error.message}`);
      errorCount++;
    }
  };

  const promises = [];
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    promises.push(simulateUserSession(i));
  }

  const globalStart = Date.now();
  await Promise.all(promises);
  const globalEnd = Date.now();

  console.log('--- Stress Test Results ---');
  console.log(`Total Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Successful Sessions: ${successCount}`);
  console.log(`Failed Sessions: ${errorCount}`);
  console.log(`Total Real Time Elapsed: ${globalEnd - globalStart}ms`);
  if (successCount > 0) {
    console.log(`Average Session Time: ${(totalTime / successCount).toFixed(2)}ms`);
  }

  if (errorCount > 0) {
    process.exit(1);
  }
}

runStressTest();
