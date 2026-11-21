import { chromium, webkit } from 'playwright-core';
import { legacyJSON } from './legacy-payload.mjs';
const BASE = process.env.DADBOD_BASE ?? 'http://127.0.0.1:8943';
const pu = new URL(process.env.HTTPS_PROXY);
const proxy = { server: pu.protocol + '//' + pu.hostname + ':' + pu.port, username: decodeURIComponent(pu.username), password: decodeURIComponent(pu.password), bypass: '127.0.0.1,localhost' };
const cleanEnv = { ...process.env };
delete cleanEnv.HTTP_PROXY; delete cleanEnv.HTTPS_PROXY; delete cleanEnv.http_proxy; delete cleanEnv.https_proxy;
let failures = 0;
const check = (engine, label, ok, extra = '') => { console.log((ok ? 'PASS' : 'FAIL') + ' [' + engine + '] ' + label + (extra ? ' :: ' + String(extra).slice(0, 140) : '')); if (!ok) failures++; };

const engines = process.env.ONLY_ENGINE ? [[process.env.ONLY_ENGINE, process.env.ONLY_ENGINE === 'webkit' ? webkit : chromium]] : [['chromium', chromium], ['webkit', webkit]];
for (const [name, engine] of engines) {
  const browser = await engine.launch({ env: cleanEnv, proxy });
  const ctx = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((json) => { localStorage.setItem('liftTracker', json); }, legacyJSON);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 140)));
  await page.goto(BASE + '/app/dist/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1800);
  const probe = await page.evaluate(() => {
    const raw = localStorage.getItem('liftTracker-v3');
    const env = raw ? JSON.parse(raw) : null;
    return {
      hasV3: !!raw,
      workouts: env?.state?.workouts?.length ?? -1,
      workoutIds: (env?.state?.workouts ?? []).map(w => w.id),
      templates: (env?.state?.templates ?? []).map(t => t.id),
      planStart: env?.state?.planStart ?? null,
      legacyIntact: localStorage.getItem('liftTracker') === JSON.stringify(JSON.parse(localStorage.getItem('liftTracker'))),
      legacyRaw: localStorage.getItem('liftTracker'),
    };
  });
  check(name, 'legacy workouts carried into the React store', probe.workouts === 3, 'workouts=' + probe.workouts);
  check(name, 'legacy workout ids preserved', ['w-nov9', 'w-nov16', 'w-nov18'].every(id => probe.workoutIds.includes(id)), probe.workoutIds.join(','));
  check(name, 'legacy templates carried over', probe.templates.includes('tpl-pull') && probe.templates.includes('tpl-legs'), probe.templates.join(','));
  check(name, 'planStart is the first legacy workout day', probe.planStart === '2026-11-09', String(probe.planStart));
  check(name, 'legacy key untouched by the React app', probe.legacyRaw === legacyJSON);
  // Set-level conversion: the null-actuals bench set must read as 8 @ 150.
  const setCheck = await page.evaluate(() => {
    const rawV3 = localStorage.getItem('liftTracker-v3');
    if (!rawV3) return null;
    const env = JSON.parse(rawV3);
    const w = env.state.workouts.find(x => x.id === 'w-nov16');
    const bench = w?.exercises.find(e => e.name === 'Bench Press');
    const s = bench?.sets[0];
    return s ? { ar: s.actualReps, aw: s.actualWeight, c: s.completed, id: bench.exerciseId } : null;
  });
  check(name, 'null actuals fall back to planned (8 @ 150, completed)', !!setCheck && setCheck.ar === 8 && setCheck.aw === 150 && setCheck.c === true, JSON.stringify(setCheck));
  check(name, 'bench-press remapped to the React catalog id', setCheck?.id === 'barbell-bench-press', String(setCheck?.id));
  check(name, 'no page errors', errors.length === 0, errors[0] || '');
  await browser.close();
}
console.log(failures === 0 ? 'ALL MIGRATION CHECKS PASSED' : failures + ' MIGRATION FAILURES');
process.exit(failures ? 1 : 0);
