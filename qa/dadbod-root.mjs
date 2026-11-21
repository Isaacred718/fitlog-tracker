// Cutover verification: root serves the redesign (with legacy migration),
// /legacy.html serves the classic app with the same data intact.
import { chromium, webkit } from 'playwright';
import { legacyJSON } from './legacy-payload.mjs';

const BASE = process.env.DADBOD_BASE ?? 'http://127.0.0.1:8943';
const { HTTPS_PROXY } = process.env;
delete process.env.HTTP_PROXY; delete process.env.HTTPS_PROXY;
delete process.env.http_proxy; delete process.env.https_proxy;
const proxy = HTTPS_PROXY ? { server: HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;

const failures = [];
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
  if (!cond) failures.push(name);
};

const engines = process.env.ONLY_ENGINE
  ? [[process.env.ONLY_ENGINE, process.env.ONLY_ENGINE === 'webkit' ? webkit : chromium]]
  : [['chromium', chromium], ['webkit', webkit]];

for (const [name, engine] of engines) {
  const browser = await engine.launch(proxy ? { proxy } : {});
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    timezoneId: 'America/New_York',
    reducedMotion: 'reduce',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((legacy) => {
    localStorage.setItem('liftTracker', legacy);
  }, legacyJSON);

  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Plan', exact: true }).waitFor({ timeout: 15000 });
  check(`[${name}] root serves the redesign (Plan tab present)`, true);
  const migrated = await page.evaluate(() => {
    const raw = localStorage.getItem('liftTracker-v3');
    const env = raw ? JSON.parse(raw) : null;
    return {
      workouts: env?.state?.workouts?.length ?? -1,
      templates: (env?.state?.templates ?? []).map((t) => t.id).join(','),
      legacyIntact: localStorage.getItem('liftTracker') === JSON.stringify(window.__lt ?? null) || !!localStorage.getItem('liftTracker'),
    };
  });
  check(`[${name}] root migrated legacy history`, migrated.workouts === 3 && migrated.templates === 'tpl-pull,tpl-legs', JSON.stringify(migrated));
  const bodyText = await page.locator('body').innerText();
  check(`[${name}] root renders the week (missed-session banner)`, /missed/i.test(bodyText));

  await page.goto(BASE + '/legacy.html', { waitUntil: 'load' });
  await page.waitForFunction(() => !!document.querySelector('#view-dashboard'), null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const classic = await page.evaluate(() => ({
    title: document.title,
    dash: !!document.querySelector('#view-dashboard'),
    workouts: (JSON.parse(localStorage.getItem('liftTracker') || '{}').workouts || []).length,
  }));
  check(`[${name}] legacy.html boots the classic app with data`, classic.workouts === 3 && classic.dash && /Dadbod Fitness/.test(classic.title), JSON.stringify(classic));

  check(`[${name}] no page errors`, errors.length === 0, errors.join(' | ').slice(0, 200));
  await browser.close();
}
console.log(failures.length ? `FAILURES: ${failures.length}` : 'ALL CUTOVER CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
