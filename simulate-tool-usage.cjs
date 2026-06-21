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
  const tools = [
    '/merge-pdf',
    '/pdf-to-jpg',
    '/jpg-to-pdf',
    '/compress-pdf',
    '/pdf-to-word',
    '/word-to-pdf'
  ];

  console.log(`Simulating premium tool usage increments for ${email}...`);
  for (const tool of tools) {
    // Simulate 3 uses for each tool
    for (let i = 0; i < 3; i++) {
      const res = await post('/api/usage/increment', { email, toolSlug: tool });
      console.log(`[Usage Increment] ${tool} → count: ${res.count}, allowed: ${res.allowed}`);
    }
  }
  console.log('\n✅ All tool simulations complete!');
}

main().catch(console.error);
