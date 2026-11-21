// Video guide checks: the classic app's per-exercise YouTube tutorial link,
// restored in the redesign's Library rows and active-workout cards.
import { chromium, webkit } from 'playwright';
import { legacyJSON } from './legacy-payload.mjs';

const BASE = process.env.DADBOD_BASE ?? 'http://127.0.0.1:8943';
const APP = process.env.DADBOD_APP_PATH ?? '/index.html';
const { HTTPS_PROXY } = process.env;
delete process.env.HTTP_PROXY; delete process.env.HTTPS_PROXY;
delete process.env.http_proxy; delete process.env.https_proxy;
const proxy = HTTPS_PROXY ? { server: HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined;

const failures = [];
const check = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
  if (!cond) failures.push(name);
};
const yt = (n) => `https://www.youtube.com/results?search_query=${encodeURIComponent(n + ' exercise form tutorial')}`;

const engines = process.env.ONLY_ENGINE
  ? [[process.env.ONLY_ENGINE, process.env.ONLY_ENGINE === 'webkit' ? webkit : chromium]]
  : [['chromium', chromium], ['webkit', webkit]];

for (const [name, engine] of engines) {
  const browser = await engine.launch(proxy ? { proxy } : {});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'America/New_York', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript((legacy) => { localStorage.setItem('liftTracker', legacy); }, legacyJSON);

  await page.goto(BASE + APP, { waitUntil: 'load' });
  await page.getByRole('link', { name: 'Library', exact: true }).click();
  const row = page.locator('.catalog-item', { hasText: 'Face Pull' });
  const libLink = row.getByRole('link', { name: /video guide for Face Pull/i });
  await libLink.waitFor({ timeout: 10000 });
  check(`[${name}] library row has a video guide button`, true);
  check(`[${name}] library link matches the classic URL`, (await libLink.getAttribute('href')) === yt('Face Pull'), await libLink.getAttribute('href'));
  check(`[${name}] library link opens a new tab`, (await libLink.getAttribute('target')) === '_blank');

  await page.getByRole('link', { name: 'Plan', exact: true }).click();
  await page.getByRole('button', { name: 'Pull Day', exact: true }).click();
  const cardLink = page.getByRole('link', { name: /video guide for Deadlift/i });
  await cardLink.waitFor({ timeout: 10000 });
  check(`[${name}] workout card has a video guide link`, true);
  check(`[${name}] workout link matches the classic URL`, (await cardLink.getAttribute('href')) === yt('Deadlift'), await cardLink.getAttribute('href'));

  // The link must actually open YouTube in a popup. Egress to youtube.com is
  // unreliable from this sandbox, so intercept and record the attempted URL.
  let attempted = '';
  await ctx.route('https://www.youtube.com/**', (route) => { attempted = route.request().url(); return route.abort(); });
  // The fixed dock overlays the lower viewport; scroll the link clear of it
  // first, the way a user flicks the list up before tapping.
  await cardLink.evaluate((el) => { el.scrollIntoView({ block: 'center' }); window.scrollBy(0, 140); });
  const [popup] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 8000 }).catch(() => null),
    cardLink.click(),
  ]);
  await page.waitForTimeout(600);
  check(`[${name}] clicking opens YouTube search in a new page`, !!popup && attempted === yt('Deadlift'), attempted.slice(0, 90) || 'no popup');
  if (popup) await popup.close();
  await ctx.unrouteAll({ behavior: 'wait' }).catch(() => {});

  check(`[${name}] no page errors`, errors.length === 0, errors.join(' | ').slice(0, 160));
  await browser.close();
}
console.log(failures.length ? `FAILURES: ${failures.length}` : 'ALL VIDEO GUIDE CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
