const http = require('http');
const puppeteer = require('puppeteer');
const path = require('path');

const SECRET = 'pdfeasy-admin-secret-2024';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body || {});
    const opts = {
      method,
      hostname: 'localhost',
      port: 5173,
      path,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': SECRET,
      }
    };
    if (body) {
      opts.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }
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
    if (body) req.write(dataStr);
    req.end();
  });
}

async function main() {
  console.log('1. Triggering Weekly Pass unlock for weekly-user@pdfeasy.in...');
  const unlockRes = await request('POST', '/api/usage/unlock', {
    email: 'weekly-user@pdfeasy.in',
    planId: 'weekly'
  });
  console.log('Unlock API Response:', unlockRes);

  console.log('\n2. Launching Puppeteer to take a screenshot of the Admin Dashboard...');
  const browser = await puppeteer.launch({
    headless: true, // run headless since it's an automated background check
    defaultViewport: null,
    args: ['--no-sandbox', '--window-size=1280,850']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  try {
    console.log('Navigating to Admin page...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('Clicking "Use password instead"...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('password'));
      if (btn) btn.click();
    });

    console.log('Waiting for password input...');
    await page.waitForSelector('input[placeholder="Admin password"]', { timeout: 5000 });

    console.log('Entering password...');
    await page.type('input[placeholder="Admin password"]', 'pdfeasy-admin-2024', { delay: 50 });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('Access Dashboard'));
      if (btn) btn.click();
    });

    console.log('Waiting for dashboard view to load...');
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Payments'));
    }, { timeout: 10000 });

    console.log('Navigating to Payments tab...');
    await page.evaluate(() => {
      const tab = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent.includes('Payments'));
      if (tab) tab.click();
    });

    console.log('Waiting for payment table to refresh...');
    await new Promise(r => setTimeout(r, 4000));
    
    const screenshotPath = path.join(__dirname, 'admin_weekly_test_result.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`\n📸 Screenshot captured at: ${screenshotPath}`);

  } catch (err) {
    console.error('Test run failed:', err);
    try {
      const errorPath = path.join(__dirname, 'admin_weekly_test_error.png');
      await page.screenshot({ path: errorPath });
      console.log(`📸 Failure screenshot captured at: ${errorPath}`);
      console.log('Current Page URL:', page.url());
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('Page Text Snippet:', bodyText.substring(0, 500));
    } catch (e) {
      console.error('Failed to capture error details:', e);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
