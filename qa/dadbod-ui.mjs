import { chromium, webkit } from 'playwright-core';
import { writeFileSync, readFileSync } from 'node:fs';
import { legacyJSON } from './legacy-payload.mjs';
const BASE = process.env.DADBOD_BASE ?? 'http://127.0.0.1:8943';
const pu = new URL(process.env.HTTPS_PROXY);
const proxy = { server: pu.protocol + '//' + pu.hostname + ':' + pu.port, username: decodeURIComponent(pu.username), password: decodeURIComponent(pu.password), bypass: '127.0.0.1,localhost' };
const cleanEnv = { ...process.env };
delete cleanEnv.HTTP_PROXY; delete cleanEnv.HTTPS_PROXY; delete cleanEnv.http_proxy; delete cleanEnv.https_proxy;
let failures = 0;
const check = (engine, label, ok, extra = '') => { console.log((ok ? 'PASS' : 'FAIL') + ' [' + engine + '] ' + label + (extra ? ' :: ' + String(extra).slice(0, 130) : '')); if (!ok) failures++; };
const v3 = (page) => page.evaluate(() => { const r = localStorage.getItem('liftTracker-v3'); return r ? JSON.parse(r).state : null; });

for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ env: cleanEnv, proxy });
  const ctx = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 390, height: 844 } });
  await ctx.addInitScript((json) => { localStorage.setItem('liftTracker', json); }, legacyJSON);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 140)));
  page.on('dialog', d => d.accept());
  await page.goto(BASE + '/app/dist/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const heights = {};
  const measure = async (label, locator) => { const box = await locator.first().boundingBox().catch(() => null); if (box) heights[label] = Math.round(box.height); return box; };

  // --- Plan with migrated data: missed Friday Leg Day, rest Saturday
  let bodyText = await page.locator('body').innerText();
  check(name, 'missed banner shows Friday Leg Day', /Missed Friday/.test(bodyText) && /Leg Day/.test(bodyText));
  check(name, 'today is a rest day panel', /Rest day/.test(bodyText));
  await measure('nav tab', page.locator('.tab-bar .tab'));
  await measure('week strip day', page.locator('.week-strip button, .strip-day, [class*=strip] button'));

  // --- Move the missed session to today
  await page.locator('button', { hasText: 'Move to today' }).click();
  await page.waitForTimeout(500);
  bodyText = await page.locator('body').innerText();
  check(name, 'banner gone and Leg Day now planned today', !/Missed Friday/.test(bodyText) && /Start Leg Day/.test(bodyText));

  // --- Start the session: squats prefilled from Nov 18 (5,5,4 @ 185)
  await page.locator('button', { hasText: 'Start Leg Day' }).click();
  await page.waitForTimeout(600);
  bodyText = await page.locator('body').innerText();
  check(name, 'workout opens with the dock on set 1', /Barbell Squat/.test(bodyText) && /Set 1 of 3/.test(bodyText));
  const weightInput = page.locator('.dock input[type="number"]').first();
  check(name, 'weight prefilled at 185', (await weightInput.inputValue()) === '185', await weightInput.inputValue());
  await measure('stepper button', page.locator('.dock .step-btn'));
  await measure('plate chip', page.locator('.dock .chip-plate'));
  // keyboard step must follow the configured step of 5 (was a hard-coded 1)
  await weightInput.focus();
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(250);
  check(name, 'weight input ArrowUp steps by 5', (await weightInput.inputValue()) === '190', await weightInput.inputValue());
  await page.locator('.dock button[aria-label="Add 10 pounds"]').click();
  await page.waitForTimeout(200);
  await page.locator('.dock button[aria-label="Remove 5 pounds"]').click();
  await page.waitForTimeout(200);
  check(name, 'plate chips adjust the weight', (await weightInput.inputValue()) === '195', await weightInput.inputValue());
  const repsInput = page.locator('.dock input[type="number"]').nth(1);
  await page.locator('.dock .stepper').nth(1).locator('.step-btn').nth(1).click();
  await page.waitForTimeout(200);
  check(name, 'reps stepper reaches 6', (await repsInput.inputValue()) === '6', await repsInput.inputValue());
  const doneBtn = page.locator('.dock .done-btn');
  await measure('Done button', doneBtn);
  await doneBtn.click();
  await page.waitForTimeout(500);
  // --- Rest timer: appears, +15s works, Skip clears
  const restBar = page.locator('.rest-bar');
  check(name, 'rest timer appears after Done', await restBar.count() === 1);
  const restText1 = await restBar.innerText().catch(() => '');
  await page.locator('.rest-bar button', { hasText: '+15s' }).click();
  await page.waitForTimeout(300);
  const restText2 = await restBar.innerText().catch(() => '');
  check(name, '+15s extends the rest', restText1 !== restText2, restText1.split('\n')[0] + ' -> ' + restText2.split('\n')[0]);
  await page.locator('.rest-bar button', { hasText: 'Skip' }).click();
  await page.waitForTimeout(300);
  check(name, 'Skip clears the rest timer', (await page.locator('.rest-bar').count()) === 0);
  bodyText = await page.locator('body').innerText();
  check(name, 'dock advanced to set 2', /Set 2 of 3/.test(bodyText));
  // --- Finish the remaining sets from the dock
  await page.locator('.dock .done-btn').click(); await page.waitForTimeout(350);
  await page.locator('.dock .done-btn').click(); await page.waitForTimeout(500);
  bodyText = await page.locator('body').innerText();
  check(name, 'dock reports all sets logged', /All 3 sets logged/.test(bodyText));
  await page.locator('button', { hasText: 'Finish workout' }).click();
  await page.waitForTimeout(600);
  bodyText = await page.locator('body').innerText();
  check(name, 'summary celebrates the session with volume 2,835 and a PR', /Session logged/.test(bodyText) && /2,835/.test(bodyText) && /New best/.test(bodyText), bodyText.match(/Session logged[\s\S]{0,200}/)?.[0].replace(/\n/g, ' '));
  let state = await v3(page);
  check(name, 'history now holds 4 workouts', state.workouts.length === 4, String(state.workouts.length));

  // --- Library: catalog bests reflect migrated + new data
  await page.click('a[href="#/library"]');
  await page.waitForTimeout(500);
  bodyText = await page.locator('body').innerText();
  check(name, 'bench best carried over (150 lb)', /Barbell Bench Press/.test(bodyText) && /150\s*lb best/.test(bodyText.replace(/\n/g, ' ')));
  check(name, 'squat best updated to 195 lb', /195\s*lb best/.test(bodyText.replace(/\n/g, ' ')));
  // search keeps focus and filters (Sheet focus fix)
  const search = page.locator('.search-field input');
  await search.click();
  await page.keyboard.type('dead', { delay: 60 });
  await page.waitForTimeout(300);
  const searchState = await search.evaluate(el => ({ v: el.value, focused: document.activeElement === el }));
  check(name, 'library search filters without losing focus', searchState.v === 'dead' && searchState.focused, JSON.stringify(searchState));
  bodyText = await page.locator('body').innerText();
  check(name, 'search narrows to Deadlift', /Deadlift/.test(bodyText) && !/Barbell Bench Press/.test(bodyText));

  // --- Templates: delete clears plan refs; toast queue keeps both Undos
  await page.click('a[href="#/library/templates"]');
  await page.waitForTimeout(400);
  await page.locator('a.template-card', { hasText: 'Pull Day' }).click();
  await page.waitForTimeout(400);
  await page.locator('button', { hasText: 'Delete template' }).click();
  await page.waitForTimeout(400);
  state = await v3(page);
  check(name, 'deleting Pull Day clears its Wednesday plan slot', state.weekPlan['3'] === null && !state.templates.some(t => t.id === 'tpl-pull'));
  let toastText = await page.locator('.toast').innerText().catch(() => '');
  check(name, 'first toast offers Undo for Pull Day', /Pull Day deleted/.test(toastText), toastText.replace(/\n/g, ' '));
  await page.locator('a.template-card', { hasText: 'Leg Day' }).click();
  await page.waitForTimeout(400);
  await page.locator('button', { hasText: 'Delete template' }).click();
  await page.waitForTimeout(400);
  toastText = await page.locator('.toast').innerText().catch(() => '');
  check(name, 'second delete queues behind the first toast', /Pull Day deleted/.test(toastText), toastText.replace(/\n/g, ' '));
  await page.locator('.toast-undo').click();
  await page.waitForTimeout(400);
  state = await v3(page);
  toastText = await page.locator('.toast').innerText().catch(() => '');
  check(name, 'first Undo restores Pull Day and its plan slot', state.templates.some(t => t.id === 'tpl-pull') && state.weekPlan['3'] === 'tpl-pull');
  check(name, 'queued toast surfaces with its own Undo', /Leg Day deleted/.test(toastText), toastText.replace(/\n/g, ' '));
  await page.locator('.toast-undo').click();
  await page.waitForTimeout(400);
  state = await v3(page);
  check(name, 'second Undo restores Leg Day', state.templates.some(t => t.id === 'tpl-legs'));
  check(name, 'queued Undos compose: both templates and both plan slots survive', state.templates.some(t => t.id === 'tpl-pull') && state.templates.some(t => t.id === 'tpl-legs') && state.weekPlan['3'] === 'tpl-pull' && state.weekPlan['5'] === 'tpl-legs', JSON.stringify(state.weekPlan));

  // --- Malformed route must not white-screen
  await page.goto(BASE + '/app/dist/index.html#/library/templates/%ZZ', { waitUntil: 'load' });
  await page.waitForTimeout(700);
  bodyText = await page.locator('body').innerText();
  check(name, 'malformed template route shows not-found, no crash', /Template not found/.test(bodyText));

  // --- Progress + Settings: backup round trip
  await page.goto(BASE + '/app/dist/index.html#/progress', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  bodyText = await page.locator('body').innerText();
  check(name, 'progress shows history with the new session first', /Progress/.test(bodyText) && /Leg Day/.test(bodyText));
  await page.locator('a[href="#/progress/settings"]').click().catch(async () => { await page.goto(BASE + '/app/dist/index.html#/progress/settings'); });
  await page.waitForTimeout(600);
  const wedSelect = page.locator('.plan-rows select').nth(2); // WEEK_ORDER: Mon, Tue, Wed...
  const allSelects = await page.locator('.plan-rows select').evaluateAll(els => els.map(el => el.value)).catch(() => []);
  check(name, 'settings plan shows Pull Day on Wednesday', (await wedSelect.inputValue()) === 'tpl-pull', JSON.stringify(allSelects) + ' @ ' + page.url());
  const downloadPromise = page.waitForEvent('download', { timeout: 8000 });
  await page.locator('button', { hasText: 'Download backup' }).click();
  const download = await downloadPromise;
  const backupPath = '/tmp/dadbod-backup-' + name + '.json';
  await download.saveAs(backupPath);
  const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
  check(name, 'backup includes planStart and activeWorkout fields', 'planStart' in backup && 'activeWorkout' in backup && Array.isArray(backup.workouts));
  backup.templates = backup.templates.map(t => t.id === 'tpl-pull' ? { ...t, name: 'Pull Day X' } : t);
  const importPath = '/tmp/dadbod-import-' + name + '.json';
  writeFileSync(importPath, JSON.stringify(backup));
  await page.setInputFiles('input[type="file"]', importPath);
  // The success toast may queue behind the download toast; wait for it.
  await page.waitForFunction(() => document.querySelector('.toast')?.textContent?.includes('Backup restored'), null, { timeout: 9000 }).catch(() => {});
  bodyText = await page.locator('body').innerText();
  check(name, 'restore reports success', /Backup restored/.test(bodyText), (await page.locator('.toast').innerText().catch(() => '(no toast)')).replace(/\n/g, ' '));
  state = await v3(page);
  check(name, 'restored data replaced the template name', state.templates.some(t => t.name === 'Pull Day X'));
  backup.templates = backup.templates.map(t => t.id === 'tpl-pull' ? { ...t, name: 'Pull Day' } : t);
  writeFileSync(importPath, JSON.stringify(backup));
  await page.setInputFiles('input[type="file"]', importPath);
  await page.waitForFunction(() => document.querySelector('.toast')?.textContent?.includes('Backup restored'), null, { timeout: 9000 }).catch(() => {});

  // --- Persistence across reload, then the legacy app still boots untouched
  await page.goto(BASE + '/app/dist/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  state = await v3(page);
  check(name, 'state persists across reload', state.workouts.length === 4 && state.templates.some(t => t.id === 'tpl-pull'));
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const legacyProbe = await page.evaluate(() => {
    try { return { workouts: state.workouts.length, templates: state.templates.length, key: localStorage.getItem('liftTracker') === null ? 'missing' : 'present' }; }
    catch (e) { return { error: String(e) }; }
  }).catch(e => ({ error: String(e).slice(0, 80) }));
  check(name, 'legacy app boots with its own data intact', legacyProbe.workouts === 3, JSON.stringify(legacyProbe));
  console.log('[' + name + '] control heights:', JSON.stringify(heights));
  check(name, 'primary controls at least 56px (nav, stepper, Done)', (heights['nav tab'] ?? 0) >= 56 && (heights['stepper button'] ?? 0) >= 56 && (heights['Done button'] ?? 0) >= 56, JSON.stringify(heights));
  check(name, 'no page errors in the React app flows', errors.length === 0, errors[0] || '');
  await browser.close();
}
console.log(failures === 0 ? 'ALL UI CHECKS PASSED' : failures + ' UI FAILURES');
process.exit(failures ? 1 : 0);
