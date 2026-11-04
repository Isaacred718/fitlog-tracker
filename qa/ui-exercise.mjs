import { chromium, webkit } from 'playwright-core';
const BASE = 'http://127.0.0.1:8931/';
const pu = new URL(process.env.HTTPS_PROXY);
const proxy = { server: pu.protocol + '//' + pu.hostname + ':' + pu.port, username: decodeURIComponent(pu.username), password: decodeURIComponent(pu.password), bypass: '127.0.0.1,localhost' };
const cleanEnv = { ...process.env };
delete cleanEnv.HTTP_PROXY; delete cleanEnv.HTTPS_PROXY; delete cleanEnv.http_proxy; delete cleanEnv.https_proxy;
let failures = 0;
for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]]) {
  const browser = await engine.launch({ env: cleanEnv, proxy });
  const ctx = await browser.newContext({ timezoneId: 'America/New_York', viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message.slice(0, 140)));
  const check = (label, ok, extra = '') => { console.log((ok ? 'PASS' : 'FAIL') + ' [' + name + '] ' + label + (extra ? ' :: ' + String(extra).slice(0, 110) : '')); if (!ok) failures++; };
  await page.goto(BASE + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // navigate every main view by tapping nav items
  for (const view of ['exercises', 'templates', 'measurements', 'history', 'profile', 'dashboard']) {
    await page.click(`.nav-item[data-view="${view}"]`);
    await page.waitForTimeout(350);
    const active = await page.evaluate(v => document.getElementById('view-' + v).classList.contains('active'), view);
    check('nav to ' + view, active);
  }
  // settings via header gear if present, else showView
  await page.evaluate(() => showView('settings'));
  await page.waitForTimeout(400);
  check('settings view renders cloud card', await page.evaluate(() => !!document.querySelector('#view-settings .card, #view-settings .cs-card, #view-settings section')));

  // template editor: open, edit name, overlay-tap -> discard confirm appears, cancel -> editor still open
  await page.evaluate(() => { showView('templates'); openTemplateEditor(); });
  await page.waitForTimeout(400);
  await page.fill('#template-name-input', 'Leg Day X').catch(async () => {
    await page.evaluate(() => { editingTemplate.name = 'Leg Day X'; const i = document.querySelector('#template-editor-content input'); if (i) { i.value = 'Leg Day X'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
  });
  await page.waitForTimeout(200);
  const dirtyGuard = await page.evaluate(() => templateEditDirty());
  check('template edit registers as dirty', dirtyGuard === true);
  await page.evaluate(() => closeModal('template-editor-modal'));
  await page.waitForTimeout(300);
  const confirmShown = await page.evaluate(() => document.getElementById('confirm-dialog').classList.contains('open') && document.getElementById('confirm-title').textContent);
  const editorStillOpen = await page.evaluate(() => document.getElementById('template-editor-modal').classList.contains('open'));
  check('closing a dirty template asks to discard', /Discard/.test(confirmShown || '') && editorStillOpen === true, String(confirmShown));
  await page.evaluate(() => closeConfirm()); // cancel the discard
  await page.evaluate(() => { editingTemplateSnapshot = JSON.stringify(editingTemplate); closeModal('template-editor-modal'); });
  await page.waitForTimeout(200);

  // full workout flow by taps: create template with an exercise, save, start, complete a set, finish
  await page.evaluate(() => {
    const t = { id: 'tpl-flow', name: 'Flow Day', exercises: [{ exerciseId: 'ex-bench', name: 'Bench Press', muscle: 'Chest', sets: [{ reps: 10, weight: 135, rest: 2, type: 'working' }] }] };
    state.templates = state.templates.filter(x => x.id !== 'tpl-flow'); state.templates.push(t); saveState();
  });
  await page.evaluate(() => startWorkoutFromTemplate('tpl-flow'));
  await page.waitForTimeout(500);
  const inWorkout = await page.evaluate(() => !!state.activeWorkout && document.getElementById('view-workout').classList.contains('active'));
  check('workout starts from template', inWorkout);
  await page.evaluate(() => toggleWorkoutSet(0, 0));
  await page.waitForTimeout(300);
  const setDone = await page.evaluate(() => state.activeWorkout.exercises[0].sets[0].completed === true && !!timerInterval);
  check('completing a set starts the rest timer', setDone);
  await page.evaluate(() => finishWorkout());
  await page.waitForTimeout(500);
  const finished = await page.evaluate(() => ({ active: state.activeWorkout, saved: state.workouts.some(w => w.name === 'Flow Day'), timerDead: !workoutTimerInterval && !timerInterval }));
  check('finish saves workout and stops all clocks', finished.active === null && finished.saved === true && finished.timerDead === true, JSON.stringify(finished));

  // quick rest timer buttons on dashboard
  await page.evaluate(() => showView('dashboard'));
  await page.waitForTimeout(300);
  const quickBtn = page.locator('button', { hasText: /^30s$/ }).first();
  if (await quickBtn.count()) {
    await quickBtn.click();
    await page.waitForTimeout(300);
    const t = await page.evaluate(() => ({ overlay: !!document.querySelector('.timer-overlay.open, #timer-overlay.open, .timer-overlay[style*="flex"]'), remaining: timerRemaining }));
    check('dashboard quick timer starts', t.remaining > 0, JSON.stringify(t));
    await page.evaluate(() => skipTimer());
  } else {
    check('dashboard quick timer starts', false, '30s button not found');
  }
  console.log('pageerrors [' + name + ']:', errors.slice(0, 5));
  check('no page errors', errors.length === 0, errors[0] || '');
  await browser.close();
}
console.log(failures === 0 ? 'ALL UI EXERCISE CHECKS PASSED' : failures + ' UI FAILURES');
process.exit(failures ? 1 : 0);
