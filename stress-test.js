const numRequests = 50;

async function test() {
  console.log(`Starting stress test with ${numRequests} concurrent requests...`);
  const promises = [];
  
  for (let i = 0; i < numRequests; i++) {
    promises.push(
      fetch('https://sw.sportsflow.best/api/keep-alive', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).then(r => r.json()).catch(e => ({ error: e.message }))
    );
  }

  const results = await Promise.all(promises);
  const successes = results.filter(r => !r.error && r.status === 'ok').length;
  const errors = results.filter(r => r.error || r.status !== 'ok').length;
  
  console.log(`Test completed!`);
  console.log(`Successful connections: ${successes}`);
  console.log(`Failed connections: ${errors}`);
  if (errors > 0) {
     console.log("Error details:", results.filter(r => r.error || r.status !== 'ok').slice(0, 5));
  }
}

test();
