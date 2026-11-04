import { chromium, webkit } from 'playwright-core';
const pu = new URL(process.env.HTTPS_PROXY);
const proxy = { server: pu.protocol + '//' + pu.hostname + ':' + pu.port, username: decodeURIComponent(pu.username), password: decodeURIComponent(pu.password) };
const cleanEnv = { ...process.env };
delete cleanEnv.HTTP_PROXY; delete cleanEnv.HTTPS_PROXY; delete cleanEnv.http_proxy; delete cleanEnv.https_proxy;
async function tryGoto(page) {
  for (let i = 1; i <= 5; i++) {
    try {
      await page.goto('https://isaacred718.github.io/fitlog-tracker/', { waitUntil: 'load', timeout: 30000 });
      return i;
    } catch (e) {
      console.log('  goto attempt', i, 'failed:', String(e.message).split('\n')[0].slice(0, 90));
      await page.waitForTimeout(4000);
    }
  }
  return 0;
}
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ env: cleanEnv, proxy });
  const ctx = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  await ctx.addInitScript(() => { Object.defineProperty(window.navigator, 'standalone', { value: true }); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 120)));
  const tries = await tryGoto(page);
  if (!tries) { console.log(name, 'LIVE UNREACHABLE after 5 attempts (proxy tunnel)'); await browser.close(); continue; }
  console.log(name, 'loaded on attempt', tries);
  await page.waitForTimeout(3500);
  const info = await page.evaluate(async () => {
    const out = { title: document.title, dash: !!document.querySelector('#view-dashboard.active') };
    showView('settings');
    await new Promise(r => setTimeout(r, 500));
    out.pasteField = !!document.getElementById('paste-code-input');
    out.bwValue = (document.getElementById('settings-body-weight') || {}).value;
    if ('caches' in window) out.cacheKeys = await caches.keys();
    return out;
  });
  console.log(name, JSON.stringify(info), 'pageerrors:', JSON.stringify(errors.slice(0, 4)));
  await browser.close();
}
console.log('LIVE SMOKE DONE');
