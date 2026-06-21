const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body);
    const opts = {
      method: 'POST',
      hostname: 'localhost',
      port: 5173,
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    };
    const req = http.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve({ raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function main() {
  const email = 'monthly-test@pdfeasy.in';
  
  // We will simulate 3 funnel flows for 'merge-pdf'
  // - Flow 1: Complete conversion (drag_drop -> convert -> download)
  // - Flow 2: Processed only (drag_drop -> convert)
  // - Flow 3: Started only (drag_drop)
  
  console.log('Simulating PDF Tool Funnel Event Logging...');

  // Flow 1: Complete conversion
  console.log('\n--- Simulating Flow 1 (Complete conversion) ---');
  let res1 = await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'drag_drop' });
  console.log('Logged drag_drop:', res1.success);
  let res2 = await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'convert' });
  console.log('Logged convert:', res2.success);
  let res3 = await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'download' });
  console.log('Logged download:', res3.success);

  // Flow 2: Processed only
  console.log('\n--- Simulating Flow 2 (Convert only, no download) ---');
  await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'drag_drop' });
  await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'convert' });

  // Flow 3: Started only
  console.log('\n--- Simulating Flow 3 (Upload only, dropoff) ---');
  await post('/api/usage/log-action', { email, toolSlug: 'merge-pdf', actionType: 'drag_drop' });

  // Let's also do a few steps for another tool (e.g. 'protect-pdf')
  console.log('\n--- Simulating protect-pdf actions ---');
  await post('/api/usage/log-action', { email, toolSlug: 'protect-pdf', actionType: 'drag_drop' });
  await post('/api/usage/log-action', { email, toolSlug: 'protect-pdf', actionType: 'convert' });
  await post('/api/usage/log-action', { email, toolSlug: 'protect-pdf', actionType: 'download' });

  console.log('\n✅ Funnel action simulations complete!');
}

main().catch(console.error);
