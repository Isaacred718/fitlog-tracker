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
  page.on('pageerror', e => errors.push(e.message.slice(0, 160)));
  const check = (label, ok, extra = '') => { console.log((ok ? 'PASS' : 'FAIL') + ' [' + name + '] ' + label + (extra ? ' :: ' + String(extra).slice(0, 120) : '')); if (!ok) failures++; };

  await page.goto(BASE + 'index.html', { waitUntil: 'load' });
  await page.waitForTimeout(2500);

  // --- corrupt v2 state is sanitized, app still boots ---
  await page.evaluate(() => {
    const bad = {
      _schemaVersion: 2,
      workouts: 'not-an-array', measurements: null, templates: [{ id: 'x', name: 'T', exercises: 'nope' }],
      customExercises: [], heartRateData: [{ date: '2026-01-01', bpm: 'fast' }, { date: '2026-01-01', bpm: 120 }],
      settings: 'junk', activeWorkout: 42,
    };
    localStorage.setItem('liftTracker', JSON.stringify(bad));
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(600);
  const sane = await page.evaluate(() => ({
    workoutsIsArray: Array.isArray(state.workouts),
    measurementsIsArray: Array.isArray(state.measurements),
    templateExercises: state.templates[0] && Array.isArray(state.templates[0].exercises),
    hrCount: state.heartRateData.length,
    settingsOk: typeof state.settings === 'object' && state.settings !== null,
    activeNull: state.activeWorkout === null,
    dashVisible: !!document.querySelector('#view-dashboard.active'),
  }));
  check('corrupt v2 state sanitized, app boots', sane.workoutsIsArray && sane.measurementsIsArray && sane.templateExercises && sane.hrCount === 1 && sane.settingsOk && sane.activeNull && sane.dashVisible, JSON.stringify(sane));

  // --- XSS: poisoned names render as text, never markup ---
  await page.evaluate(() => {
    window.__xss = 0;
    const payload = '<img src=x onerror="window.__xss=1">';
    state.customExercises.push({ id: 'evil1', name: payload, muscle: 'Chest', equipment: 'Barbell', tips: [payload], proTip: payload });
    state.workouts.push({ id: 'evilw', name: payload, date: '2026-11-02', duration: 3600000, exercises: [{ exerciseId: 'e', name: payload, muscle: 'Chest', sets: [{ reps: 10, weight: 100, actualReps: 10, actualWeight: 100, completed: true }] }] });
    saveState();
    showView('exercises');
  });
  await page.waitForTimeout(400);
  const xss1 = await page.evaluate(() => ({ xss: window.__xss, imgs: document.querySelectorAll('#view-exercises img').length }));
  await page.evaluate(() => showView('history'));
  await page.waitForTimeout(300);
  const xss2 = await page.evaluate(() => ({ xss: window.__xss, imgs: document.querySelectorAll('#view-history img').length }));
  check('stored XSS neutralized in exercises + history', xss1.xss === 0 && xss2.xss === 0 && xss1.imgs === 0 && xss2.imgs === 0, JSON.stringify({ xss1, xss2 }));

  // --- rest timer: no interval leak (double start ~= single speed) ---
  await page.evaluate(() => { startRestTimer(60); startRestTimer(60); });
  await page.waitForTimeout(2100);
  const rem = await page.evaluate(() => timerRemaining);
  check('double timer start ticks at single speed (~58)', rem >= 57 && rem <= 59, 'remaining=' + rem);
  await page.evaluate(() => skipTimer());

  // --- rest timer survives reload ---
  await page.evaluate(() => {
    state.activeWorkout = { id: 'aw1', name: 'W', date: new Date().toISOString(), startTime: Date.now(), exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [{ reps: 10, weight: 100, rest: 90, actualReps: 10, actualWeight: 100, completed: false }] }] };
    saveState();
    startRestTimer(90);
  });
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(800);
  const restored = await page.evaluate(() => ({ active: !!timerInterval, remaining: timerRemaining }));
  check('rest timer restored after reload', restored.active && restored.remaining > 80 && restored.remaining <= 90, JSON.stringify(restored));
  await page.evaluate(() => { skipTimer(); state.activeWorkout = null; saveState(); });

  // --- voice commands ---
  await page.evaluate(() => {
    state.activeWorkout = { id: 'aw2', name: 'W', date: new Date().toISOString(), startTime: Date.now(), exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [{ reps: 10, weight: 225, rest: 60, actualReps: 10, actualWeight: 225, completed: false }, { reps: 10, weight: 225, rest: 60, actualReps: 10, actualWeight: 225, completed: false }] }] };
    saveState(); renderWorkout();
  });
  const v1 = await page.evaluate(() => {
    handleVoiceCommand('good morning');
    const afterGoodMorning = state.activeWorkout.exercises[0].sets[0].completed;
    handleVoiceCommand('225.5');
    const s0 = state.activeWorkout.exercises[0].sets[0];
    return { afterGoodMorning, reps: s0.actualReps, completed: s0.completed };
  });
  check('voice: "good morning" does not complete a set', v1.afterGoodMorning === false);
  check('voice: "225.5" is 226 reps, not 2255', v1.reps === 226 && v1.completed === true, JSON.stringify(v1));
  const v2 = await page.evaluate(() => {
    handleVoiceCommand('rest one minute');
    const total = timerTotal, running = !!timerInterval;
    handleVoiceCommand('rest zero');
    return { total, running, afterZero: !!timerInterval };
  });
  check('voice: "rest one minute" starts a 60s timer', v2.total === 60 && v2.running === true, JSON.stringify(v2));
  check('voice: "rest zero" stops the timer', v2.afterZero === false);
  const v3 = await page.evaluate(() => {
    startRestTimer(60);
    handleVoiceCommand('done');
    return { timerAfter: !!timerInterval, set1Completed: state.activeWorkout.exercises[0].sets[1].completed };
  });
  check('voice: "done" during rest skips timer, does not complete set', v3.timerAfter === false && v3.set1Completed === false, JSON.stringify(v3));
  await page.evaluate(() => { state.activeWorkout = null; saveState(); });

  // --- set value clamps ---
  const clamped = await page.evaluate(() => {
    state.activeWorkout = { id: 'aw3', name: 'W', date: new Date().toISOString(), startTime: Date.now(), exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [{ reps: 10, weight: 100, rest: 60, completed: false }] }] };
    updateWorkoutSet(0, 0, 'actualReps', -5);
    const neg = state.activeWorkout.exercises[0].sets[0].actualReps;
    updateWorkoutSet(0, 0, 'actualReps', 7.6);
    const frac = state.activeWorkout.exercises[0].sets[0].actualReps;
    updateWorkoutSet(0, 0, 'actualWeight', 99999);
    const huge = state.activeWorkout.exercises[0].sets[0].actualWeight;
    state.activeWorkout = null; saveState();
    return { neg, frac, huge };
  });
  check('updateWorkoutSet clamps negatives, fractions, absurd weights', clamped.neg === 0 && clamped.frac === 8 && clamped.huge === 2000, JSON.stringify(clamped));

  // --- start guard: new workout does not silently kill active one ---
  const guard = await page.evaluate(() => {
    state.activeWorkout = { id: 'aw4', name: 'Keep Me', date: new Date().toISOString(), startTime: Date.now(), exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [] }] };
    saveState();
    startEmptyWorkout();
    const confirmOpen = document.getElementById('confirm-dialog').classList.contains('open');
    const stillMine = state.activeWorkout && state.activeWorkout.name === 'Keep Me';
    closeConfirm();
    return { confirmOpen, stillMine };
  });
  check('starting over an active workout asks first', guard.confirmOpen === true && guard.stillMine === true, JSON.stringify(guard));

  // --- confirm queue: second confirm waits its turn ---
  const queue = await page.evaluate(() => {
    const fired = [];
    openConfirm('First', 'one', () => fired.push('first'));
    openConfirm('Second', 'two', () => fired.push('second'));
    const firstShown = document.getElementById('confirm-title').textContent;
    document.getElementById('confirm-ok-btn').click();
    const secondShown = document.getElementById('confirm-title').textContent;
    closeConfirm(); // cancel second
    return { firstShown, secondShown, fired };
  });
  check('confirm queue: both shown in order, cancel disarms', queue.firstShown === 'First' && queue.secondShown === 'Second' && queue.fired.join() === 'first', JSON.stringify(queue));

  // --- dates: formatDate + calendar day + dashboard week (America/New_York) ---
  const dates = await page.evaluate(() => {
    const fd = formatDate('2026-11-03');
    // Tue Nov 3 2026, 8:00 PM local = Nov 4 01:00 UTC
    state.workouts = [
      { id: 'd1', name: 'Evening A', date: '2026-11-04T01:00:00.000Z', duration: 3600000, exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [{ reps: 10, weight: 100, actualReps: 10, actualWeight: 100, completed: true }] }] },
      { id: 'd2', name: 'Evening B', date: '2026-11-04T02:00:00.000Z', duration: 3600000, exercises: [{ exerciseId: 'e', name: 'Squat', muscle: 'Legs', sets: [{ reps: 5, weight: 200, actualReps: 5, actualWeight: 200, completed: true }] }] },
    ];
    saveState();
    calendarState.selectedDate = '2026-11-03';
    renderCalendar();
    const detail = document.querySelector('.cal-day-detail') ? document.querySelector('.cal-day-detail').innerText : '';
    return { fd, detail };
  });
  check('formatDate keeps date-only strings on their own day', /Nov 3/.test(dates.fd), dates.fd);
  check('calendar day panel lists BOTH workouts from that local day', dates.detail.includes('Evening A') && dates.detail.includes('Evening B'), dates.detail.replace(/\n/g, ' ').slice(0, 140));

  // --- analysis: trends read .values by date; weaknesses include zero-set muscles ---
  const analysis = await page.evaluate(() => {
    state.measurements = [
      { id: 'm2', date: '2026-11-02', values: { weight: 175, bodyFat: 17 } },
      { id: 'm1', date: '2026-10-20', values: { weight: 180, bodyFat: 18 } },
    ];
    // Only Back trained: Chest (never trained) must show as neglected,
    // and Back must NOT be called a weakness (the original defect).
    const backSets = Array.from({ length: 40 }, () => ({ reps: 10, weight: 100, actualReps: 10, actualWeight: 100, completed: true }));
    state.workouts = [{ id: 'bk', name: 'Back Day', date: new Date().toISOString(), duration: 3600000, exercises: [{ exerciseId: 'e', name: 'Row', muscle: 'Back', sets: backSets }] }];
    saveState();
    const a = computeAnalysis();
    return { wt: a.weightTrend, weakNames: a.weaknesses.map(w => w.name), hasChestWeak: a.weaknesses.some(w => w.name === 'Chest' && w.sets === 0), backIsWeak: a.weaknesses.some(w => w.name === 'Back') };
  });
  check('profile weight trend renders from .values in date order', !!analysis.wt && analysis.wt.from === 180 && analysis.wt.to === 175, JSON.stringify(analysis.wt));
  check('weaknesses include a never-trained muscle, trained muscle not neglected', analysis.hasChestWeak === true && analysis.backIsWeak === false, analysis.weakNames.join(','));

  // --- CSV import: dedupe + hostile numbers ---
  const csv = [
    'Date,Workout Name,Duration (min),Exercise,Muscle,Set,Type,Weight,Reps,Completed',
    '2026-11-01,Test Day,60,Bench Press,Chest,1,working,135abc,10,yes',
    '2026-11-01,Test Day,60,Bench Press,Chest,2,working,-50,10,done',
    '2026-11-01,Test Day,60,Bench Press,Chest,3,working,1e999,10,1',
    'not-a-date,Ghost,60,Bench Press,Chest,1,working,100,10,1',
  ].join('\n');
  await page.evaluate(() => { state.workouts = state.workouts.filter(w => w.name !== 'Test Day'); saveState(); });
  const fileInput = page.locator('input[onchange="importWorkouts(event)"]');
  await fileInput.setInputFiles({ name: 'w.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.waitForTimeout(700);
  await fileInput.setInputFiles({ name: 'w.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.waitForTimeout(700);
  const imp = await page.evaluate(() => {
    const mine = state.workouts.filter(w => w.name === 'Test Day');
    const ghost = state.workouts.some(w => w.name === 'Ghost');
    const vols = mine.map(w => workoutVolume(w));
    return { count: mine.length, ghost, vols };
  });
  check('CSV re-import does not duplicate', imp.count === 1, JSON.stringify(imp));
  check('CSV bad date row rejected', imp.ghost === false);
  check('CSV numbers sanitized (135abc->0 via strict parse, -50->0, 1e999->0)', imp.vols.length === 1 && imp.vols[0] === 0, JSON.stringify(imp.vols));

  // --- CSV export formula injection ---
  await page.evaluate(() => {
    state.workouts.push({ id: 'fx1', name: '=HYPERLINK("http://evil","x")', date: '2026-11-01', duration: 3600000, exercises: [{ exerciseId: 'e', name: 'Bench', muscle: 'Chest', sets: [{ reps: 10, weight: 100, actualReps: 10, actualWeight: 100, completed: true }] }] });
    saveState();
  });
  const dlPromise = page.waitForEvent('download', { timeout: 8000 }).catch(() => null);
  await page.evaluate(() => exportWorkouts());
  const dl = await dlPromise;
  let exportOk = false, exportSample = '';
  if (dl) {
    const path = await dl.path();
    const fs = await import('fs');
    const text = fs.readFileSync(path, 'utf8');
    exportSample = text.split('\n').slice(0, 3).join(' | ').slice(0, 160);
    exportOk = text.includes('"\'=HYPERLINK');
  }
  check('CSV export neutralizes formula cells', exportOk, exportSample);

  // --- volume display + setVolume edge cases (node-side via evaluate) ---
  const vols = await page.evaluate(() => ({
    neg: setVolume({ completed: true, actualReps: -5, actualWeight: -100 }),
    inf: setVolume({ completed: true, actualReps: 10, actualWeight: Infinity }),
    str: setVolume({ completed: true, actualReps: '10', actualWeight: '135' }),
    emptyActual: setVolume({ completed: true, reps: 10, weight: 100, actualReps: '', actualWeight: '' }),
    fmt40: formatVolume(40), fmt1500: formatVolume(1500),
    ft: formatTime(7503), ftNeg: formatTime(-90),
    cal0: estimateCalories([{ muscle: 'Chest', sets: [{ completed: false, actualWeight: 100 }] }], 3600),
    calBiceps: estimateCalories([{ muscle: 'Biceps', sets: [{ completed: true, actualWeight: 40 }] }], 3600),
    calArms: estimateCalories([{ muscle: 'Arms', sets: [{ completed: true, actualWeight: 40 }] }], 3600),
    calUnknown: estimateCalories([{ muscle: 'Nonsense', sets: [{ completed: true, actualWeight: 40 }] }], 3600),
  }));
  check('setVolume: negative x negative is 0, not +500', vols.neg === 0);
  check('setVolume: Infinity contributes 0', vols.inf === 0);
  check('setVolume: numeric strings coerce', vols.str === 1350);
  check('setVolume: empty-string actuals fall back to planned', vols.emptyActual === 1000);
  check('formatVolume: 40 stays "40", 1500 is "1.5k"', vols.fmt40 === '40' && vols.fmt1500 === '1.5k', vols.fmt40 + '/' + vols.fmt1500);
  check('formatTime: hours roll over, negatives clamp', vols.ft === '2:05:03' && vols.ftNeg === '0:00', vols.ft + '/' + vols.ftNeg);
  check('calories: zero completed sets burn 0', vols.cal0 === 0);
  check('calories: Biceps priced at Arms MET, not the 5.0 default', vols.calBiceps === vols.calArms && vols.calBiceps !== vols.calUnknown, vols.calBiceps + '/' + vols.calArms + '/' + vols.calUnknown);

  console.log('pageerrors [' + name + ']:', errors.slice(0, 6));
  check('no page errors during suite', errors.length === 0, errors.slice(0, 2).join(' | '));
  await browser.close();
}
console.log(failures === 0 ? 'ALL REGRESSION CHECKS PASSED' : failures + ' REGRESSION FAILURES');
process.exit(failures ? 1 : 0);
