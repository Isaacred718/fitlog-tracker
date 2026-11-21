// Per-set effort (RPE) checks: rate in the dock, badge on the set row,
// averages in the finish summary, persistence across reload.
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
  const store = () => page.evaluate(() => JSON.parse(localStorage.getItem('liftTracker-v3')).state);

  await page.goto(BASE + APP, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Leg Day', exact: true }).click();
  const chip = (v) => page.getByRole('button', { name: new RegExp(`^RPE ${v}\\b`) });
  await chip(9).waitFor({ timeout: 10000 });
  check(`[${name}] dock shows effort chips for the focused set`, true);

  await chip(9).click();
  let s = await store();
  check(`[${name}] tapping a chip rates the focused set`, s.activeWorkout.exercises[0].sets[0].rpe === 9, JSON.stringify(s.activeWorkout.exercises[0].sets[0]));
  await chip(9).click();
  s = await store();
  check(`[${name}] tapping the active chip clears the rating`, s.activeWorkout.exercises[0].sets[0].rpe === undefined);
  await chip(9).click();

  await page.locator('.dock .cta.done-btn').click(); // complete set 1
  await page.locator('.rpe-tag', { hasText: 'RPE 9' }).waitFor({ timeout: 8000 });
  check(`[${name}] completed set row shows its RPE badge`, true);

  await chip(8).click(); // focus advanced to set 2
  await page.locator('.dock .cta.done-btn').click();
  await page.locator('.dock .cta.done-btn').click(); // set 3, unrated
  s = await store();
  const sets = s.activeWorkout.exercises[0].sets;
  check(`[${name}] ratings stick per set`, sets[0].rpe === 9 && sets[1].rpe === 8 && sets[2].rpe === undefined, JSON.stringify(sets.map((x) => x.rpe)));

  await page.locator('.finish-btn').click();
  await page.getByText(/Average effort/).waitFor({ timeout: 10000 });
  const summary = await page.locator('.summary-card').first().innerText();
  check(`[${name}] finish summary shows the effort baseline`, /Average effort\s+RPE 8\.5\s+across 2 rated sets/.test(summary), summary.replace(/\n/g, ' / ').slice(0, 220));
  check(`[${name}] per-exercise line carries its average`, /Squat[\s\S]*RPE 8\.5/.test(summary));

  await page.reload({ waitUntil: 'load' });
  await page.getByText(/Average effort/).waitFor({ timeout: 10000 });
  s = await store();
  check(`[${name}] ratings persist across reload`, s.workouts.at(-1).exercises[0].sets[0].rpe === 9);

  await page.getByRole('link', { name: 'Progress', exact: true }).click();
  const hist = await page.locator('.history-item').first().innerText();
  check(`[${name}] progress history shows session RPE`, /RPE 8\.5/.test(hist), hist.replace(/\n/g, ' | ').slice(0, 140));

  check(`[${name}] no page errors`, errors.length === 0, errors.join(' | ').slice(0, 160));
  await browser.close();
}
console.log(failures.length ? `FAILURES: ${failures.length}` : 'ALL RPE CHECKS PASSED');
process.exit(failures.length ? 1 : 0);
