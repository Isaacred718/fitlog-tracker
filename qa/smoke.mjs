import { chromium, webkit } from 'playwright-core';
const URL = 'http://127.0.0.1:8931/index.html';
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0,200)); });
  await page.goto(URL, { waitUntil: 'load', timeout: 30000 }).catch(e => errors.push('goto: ' + e.message));
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => ({
    title: document.title,
    views: [...document.querySelectorAll('.view')].map(v => v.id),
    activeView: document.querySelector('.view.active')?.id || null,
    dashText: (document.getElementById('view-dashboard')?.innerText || '').slice(0, 300),
    hasState: typeof state !== 'undefined',
    workouts: typeof state !== 'undefined' ? state.workouts.length : null,
    navItems: [...document.querySelectorAll('.nav-item')].map(n => n.dataset.view),
    firebaseLoaded: typeof firebase !== 'undefined',
    currentUser: typeof currentUser !== 'undefined' ? currentUser : 'undef',
  })).catch(e => ({ evalError: e.message }));
  console.log('=== ' + name + ' ===');
  console.log(JSON.stringify(info, null, 1));
  console.log('errors:', errors.slice(0, 12));
  await browser.close();
}
