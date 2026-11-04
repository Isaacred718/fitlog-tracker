# Interaction & Timing break-test lane — FitLog / Lift Tracker PWA

Scope: `index.html` (single-file app, 5,163 lines as read) and `sw.js`, read-only.
Method: adversarial code-reading, mirroring the 72-vector HOLOPLOT QA pass. Where a
claim depends only on arithmetic/parsing, the exact function body was extracted and
executed in Node to verify the output (marked "node-verified").
Line numbers are as of this reading. The working tree carries a sibling lane's
uncommitted sign-in changes (auth region ~1200–2000, `auth.html`, SW cache v8);
every section cited below for timer/voice/render/workout is byte-identical to HEAD.

Severity key: **S1** data loss / security / app trap · **S2** wrong logged data or
broken core flow · **S3** cosmetic, annoyance, or latent.

---

## A. Rest timer — timing and interval lifecycle

### 1. Starting the rest timer twice leaks a `setInterval` — double-speed countdown forever (S1, CONFIRMED)
- **Sequence:** Complete a set with rest 90 (timer starts). While it runs, complete
  another set (or tap a dashboard Quick Rest preset, or say "rest 60").
- **Expected:** The old interval is cancelled; one countdown at 1 s/s.
- **Actual:** `startRestTimer(seconds)` (line 3292) assigns
  `timerInterval = setInterval(...)` **without ever calling `clearInterval` on the
  previous id**. Both intervals now decrement the shared `timerRemaining` (2 s per
  real second), and the first interval's id is lost permanently — nothing in the
  codebase can ever clear it. It keeps firing every second for the life of the page,
  calling `updateTimerDisplay()` and `skipTimer()` on a hidden overlay.

### 2. The leaked interval poisons every later timer (S1, CONFIRMED)
- **Sequence:** Trigger vector 1, let timer B expire (its callback runs
  `skipTimer()`, which clears only the id currently stored in `timerInterval`),
  then start a fresh timer C.
- **Expected:** Timer C runs its full duration.
- **Actual:** The leaked interval A is still decrementing the shared
  `timerRemaining` and still calls `skipTimer()` whenever it sees
  `timerRemaining <= 0`; `skipTimer()` (line 3311) clears whatever id
  `timerInterval` currently holds — timer C's. C is killed early / counts at
  double speed, and the overlay vanishes mid-rest. Root cause is shared mutable
  `timerTotal`/`timerRemaining` plus single-slot `timerInterval` in
  `startRestTimer`/`skipTimer`.

### 3. Un-completing a set leaves its rest timer running (S2, CONFIRMED)
- **Sequence:** Tap a set's check → set completes, rest timer starts. Tap the same
  check again to un-complete it.
- **Expected:** Un-completing the set cancels (or at least offers to cancel) the
  rest timer it started.
- **Actual:** `toggleWorkoutSet(ei, si)` (line 3193) only starts a timer on the
  `set.completed === true` transition. The false transition does nothing — no
  `skipTimer()`, no prompt. The user rests for a set the app now shows as not done.

### 4. `lastSetPromptTimeout` handle is overwritten without clearing — stale "Stop the timer?" prompt (S2, CONFIRMED)
- **Sequence:** Complete the last set of exercise 1 (a 5 s prompt is scheduled).
  Within 5 s, complete the last set of exercise 2.
- **Expected:** Only the newest prompt can fire, against the current timer.
- **Actual:** `toggleWorkoutSet` assigns `lastSetPromptTimeout = setTimeout(...)`
  without clearing the previous handle. The first timeout still fires, checks only
  `if (timerInterval)` (which is now exercise 2's timer), and pops
  `openConfirm('Rest Timer', 'Stop the timer?', …)` for the wrong rest. Worse,
  `startRestTimer`/`skipTimer` clear only the *latest* handle, so the stale one is
  uncancellable. See also vector 15 for what this prompt does to an open confirm.

### 5. `timerAdd` has no cap — the full-screen timer overlay can trap the app for hours (S2, CONFIRMED)
- **Sequence:** While the timer overlay is up, tap **+15s** 100 times.
- **Expected:** A sane ceiling (e.g. 10–15 min) or diminishing behaviour.
- **Actual:** `timerAdd(sec)` (line 3318) is `timerRemaining += sec; timerTotal += sec`
  with no maximum. `.timer-overlay` is `position:fixed; inset:0; z-index:300` with
  `pointer-events:all` when active (CSS line ~172), covering the bottom nav — there
  is no navigation, keyboard, or gesture escape, only the skip button. 100 taps =
  +25 minutes of trap; nothing stops 10,000 taps.

### 6. `timerSubtract` can never end the timer and distorts the progress ring (S3, CONFIRMED)
- **Sequence:** With 90 s remaining, tap **−15s** repeatedly to "skip ahead".
- **Expected:** Reaching 0 ends the timer (or subtract clamps and finishes).
- **Actual:** `timerSubtract(sec)` (line 3319) clamps `timerRemaining` to a minimum
  of **1** (`Math.max(1, …)`), so the button alone can never finish a rest — the
  user waits for the next interval tick even though the display reads 0:01. It also
  does `timerTotal = Math.max(timerTotal, timerRemaining)`, which is a no-op when
  subtracting, so the ring in `updateTimerDisplay()` (line 3305) jumps to ~99%
  while a full second still remains.

### 7. `updateTimerDisplay` divides by `timerTotal` with no zero guard (S3, CONFIRMED — latent)
- **Sequence:** Any path that reaches `startRestTimer(0)` or a negative total
  (crafted/imported set with `rest` values the UI would not produce, future callers).
- **Expected:** Progress clamps to 0–1.
- **Actual:** `progress = 1 - (timerRemaining / timerTotal)` → `NaN` or `±Infinity`
  when `timerTotal` is 0, written straight into the SVG `stroke-dashoffset`
  attribute. UI callers currently pass positive values, so this is latent, but
  there is no defensive clamp at the sink.

### 8. A running rest timer does not survive a reload — and this app reloads itself (S2, CONFIRMED mechanism / needs-device for frequency)
- **Sequence:** Start a 3-minute rest, then any reload: the iOS handoff reload
  (`maybeReloadOnReturn`), an SW-update refresh after the "Update available"
  toast, or a manual refresh.
- **Expected:** The rest timer is restored from persisted state, or the user is
  told it was cancelled.
- **Actual:** `timerTotal`/`timerRemaining`/`timerInterval` are module-level
  in-memory variables only; nothing about the timer is ever written by
  `saveState()`. After reload the overlay is gone, no timer runs, no message. The
  workout itself survives (it is persisted), so the loss is silent.

## B. Workout set logging — interaction

### 9. The workout elapsed-time interval is never cleared on finish or discard (S2, CONFIRMED)
- **Sequence:** Finish a workout (or discard it via the zero-sets confirm), then
  sit on the dashboard.
- **Expected:** The per-second elapsed ticker stops when the workout ends.
- **Actual:** `workoutTimerInterval` is cleared only at the top of the
  has-workout branch of `renderWorkout()` (line ~3119). `finishWorkout()`
  (line 3262) never clears it, the discard callback in `finishWorkout` never
  clears it, and the `!w` early-return branch of `renderWorkout()` (lines
  3089–3106) returns *before* the clear. The orphaned interval keeps a closure
  over the finished/discarded workout object and writes
  `formatTime((Date.now() - w.startTime)/1000)` into the hidden
  `#workout-timer-display` every second until the next workout is rendered.

### 10. Discarding a workout leaves the microphone live (S2, CONFIRMED)
- **Sequence:** Start voice, log nothing, Finish → "No sets completed. Discard
  this workout?" → Confirm.
- **Expected:** Voice stops when the workout ends, by either exit path.
- **Actual:** The success path of `finishWorkout()` calls
  `if (voiceListening) voiceStop();`. The discard callback
  (`state.activeWorkout = null; saveState(); showView('dashboard')`) does not —
  and it lands on the dashboard, not the workout view, so the `voiceStop()` in
  `renderWorkout()`'s empty branch never runs either. Recognition keeps
  listening (and auto-restarting, vector 29) on the dashboard indefinitely.

### 11. Starting a workout silently destroys the one already in progress (S1, CONFIRMED)
- **Sequence:** Start a workout, log several sets, go to Templates (or Dashboard)
  and tap **Start** on any template — or **Empty Workout**.
- **Expected:** A confirm: "Workout in progress — discard it and start a new one?"
- **Actual:** `startWorkoutFromTemplate(templateId)` (line 2982) and
  `startEmptyWorkout()` (line 3044) both assign `state.activeWorkout = {…}`
  unconditionally and `saveState()`. The in-progress workout is overwritten,
  never pushed to `state.workouts`, and unrecoverable. No `openConfirm` anywhere
  on either path.

### 12. `updateWorkoutSet` accepts negative, fractional and absurd values (S2, CONFIRMED)
- **Sequence:** In a set row, type reps `-5`, weight `-50`, or reps `8.9`, weight
  `999999`, then complete the set.
- **Expected:** Reps are integers ≥ 0; weight ≥ 0 and within a sane range;
  invalid entries rejected or clamped with feedback.
- **Actual:** `updateWorkoutSet(ei, si, field, val)` (line 3187) is
  `parseFloat(val) || 0` for **every** field, including `actualReps`. `parseFloat`
  keeps `-5`, `-50`, `8.9`, `999999`, and turns `1e3` into `1000`. Negative
  volume then flows into `setVolume`/`workoutVolume`, dashboard totals and
  history; fractional reps are stored and displayed. (For contrast,
  `changeWorkoutSetType` right below it *does* validate against
  `SET_TYPE_IDS` — the numeric path simply never got the same treatment.)

### 13. `addSetToWorkout` resurrects planned values over a real logged 0 (S3, CONFIRMED)
- **Sequence:** Log a set at 0 reps / 0 lbs (a failed set), then tap "+ Working"
  to add the next set.
- **Expected:** The new set copies the last set as logged (0/0), the way
  `setVolume`'s comment says 0 must be respected.
- **Actual:** `addSetToWorkout` (line 3214) uses `last?.actualReps || 10` and
  `last?.reps || 10` — the exact `||` bug the codebase fixed in `setVolume` with
  `??`. A real 0 becomes a phantom 10 in the new set's reps.

### 14. Full innerHTML re-render on every toggle destroys in-progress edits and focus (S3, needs-runtime)
- **Sequence:** Type into set 3's weight field (don't blur), then toggle set 1
  via voice ("done"), or toggle any set after editing another field whose
  `change` hasn't fired.
- **Expected:** Unrelated fields keep their DOM state; only the changed row updates.
- **Actual:** `toggleWorkoutSet`, `addSetToWorkout`, `moveWorkoutSet`,
  `deleteWorkoutSet`'s callback and the voice weight path all call
  `renderWorkout()`, which replaces `#workout-exercises.innerHTML` wholesale
  (line ~3132). The focused input node is destroyed; any value that only existed
  in the DOM (not yet committed via `change`) is lost, and focus/scroll context
  resets. `updateWorkoutSet` itself deliberately does *not* re-render — the
  asymmetry is the tell.

## C. Confirm dialog and modals

### 15. `openConfirm` is single-slot: a second confirm silently replaces a pending destructive one (S1, CONFIRMED)
- **Sequence:** Tap delete on a template (confirm A opens). Before answering,
  any other `openConfirm` fires — e.g. the rest-timer prompt from vector 4, a
  measurement delete, Clear Data.
- **Expected:** Confirms queue, or the second is suppressed while one is open.
- **Actual:** `openConfirm(title, message, cb)` (line 2124) unconditionally
  overwrites `#confirm-title`/`#confirm-message`, the single global
  `confirmCallback`, and `#confirm-ok-btn.onclick`. Confirm A's callback is
  discarded without executing or notifying — the user reads prompt B, taps
  Confirm, and can never tell prompt A's action silently never happened (or,
  reversed, believes they confirmed the delete when they actually dismissed a
  timer). One shared dialog + one shared callback variable, no guard
  `if (dialog already open)`.

### 16. Cancelling a confirm leaves the stale callback armed on the OK button (S3, CONFIRMED)
- **Sequence:** Open any confirm, tap Cancel, then (without a new
  `openConfirm`) get `#confirm-ok-btn` clicked — e.g. a fast double-tap that
  lands as the dialog closes, keyboard activation, or programmatic click.
- **Expected:** Cancel disarms the pending action.
- **Actual:** `closeConfirm()` (line 2131) only removes the `open` class. It does
  not null `confirmCallback` and does not clear the `onclick` closure assigned in
  `openConfirm` (`() => { closeConfirm(); confirmCallback(); }`). The callback
  stays executable for the whole session until the next `openConfirm` replaces it.

### 17. Double-tap Finish does NOT duplicate the workout — but only by accident of synchronicity (PASS, verified by reading)
- **Sequence:** Double-tap the Finish button as fast as possible.
- **Expected:** Exactly one workout in history.
- **Actual:** Safe today: `finishWorkout()` is fully synchronous, pushes one deep
  copy, sets `state.activeWorkout = null`, and the second tap's invocation hits
  the `if (!state.activeWorkout) return;` guard. There is no debounce,
  no disabled state, and no in-flight flag, however — the first async step ever
  added to this function (e.g. an awaited sync) reopens the duplicate window.
  Flagged as a regression tripwire, not a current defect.

### 18. Template editor edits are discarded silently by an outside tap (S2, CONFIRMED)
- **Sequence:** Open a template, change several set values (each keystroke
  mutates `editingTemplate` via the inline `oninput` handlers), then tap the
  dimmed overlay by accident — the natural thumb miss on a phone.
- **Expected:** Unsaved-changes guard, or edits auto-persist.
- **Actual:** The global `.modal-overlay` click handler (near `openModal`/
  `closeModal`, ~line 4420) closes any modal when the overlay itself is clicked.
  There is no dirty check and no draft save; `saveTemplate()` (line 2766) is the
  only persistence path. All edits vanish with no toast and no undo.

## D. Rendering / XSS — user-controlled text into innerHTML

Method note: `escHtml(str)` (line 4432) is defined, but a full-file grep finds it
used in exactly **four** places: the template-name input value (line ~2575),
and the screenshot-recovery preview (lines ~4285–4287), which is the one safe
sink and serves as the positive control. Everything below is a sink where
user-controlled strings are interpolated raw. The canonical payload for all of
them: create a custom exercise (or template/workout) named
`<img src=x onerror=alert(document.domain)>` — `saveCustomExercise()` (line
3829) stores `name`, `tips`, `proTip` from raw input values with no sanitisation.

### 19. Stored XSS via custom exercise name/tips in the exercise catalog and detail modal (S1, CONFIRMED pattern)
- **Sequence:** Save the payload as a custom exercise name (and again as a
  multi-line Form Tip), then open Exercises, then tap the exercise.
- **Expected:** Name and tips render as inert text everywhere.
- **Actual:** `filterExercises()` (line 2444) interpolates `${e.name}`,
  `${e.muscle}`, `${e.equipment}` raw; `showExerciseDetail(id)` (line 2464)
  interpolates `${e.name}`, every tip `${t}`, and `${e.proTip}` raw into
  `#exercise-detail-content.innerHTML`. Tips are free multi-line user text —
  the easiest payload carrier in the app.

### 20. Stored XSS via exercise name in the active-workout screen (S1, CONFIRMED pattern)
- **Sequence:** Add the payload-named custom exercise to a workout.
- **Expected:** Inert text in the workout header row.
- **Actual:** `renderWorkout()` interpolates `${ex.name}` and `${ex.muscle}` raw
  into `#workout-exercises.innerHTML` (line ~3145). This fires mid-workout,
  in the app's most-used view, on every re-render.

### 21. Stored XSS via workout/template names across dashboard, history, calendar, templates (S1, CONFIRMED pattern)
- **Sequence:** Name a template with the payload (template names are free text
  via the editor's name input), start a workout from it, finish it, then browse
  Dashboard / History / the calendar / Templates.
- **Expected:** Inert text in every list and detail.
- **Actual:** All raw: `renderDashboard()` recent list `${w.name}` and active
  bar `${aw.name}`; `renderHistory()` `${w.name}` and
  `${w.exercises.map(e => e.name).join(', ')}`; `viewWorkoutDetail(id)`
  (line 3900) `${w.name}`, `${e.name}`, `${w.nutrition.pre/post}`;
  `renderCalendar()` day detail `${w.name}`; `renderTemplates()`
  `${t.name}`, `${e.name}`; `renderTemplateExercises()` `${ex.name}`;
  `showNutritionInfo()` (line 3013) `${w.name}`, `${w.nutrition.pre/post}`;
  `openAddExerciseModal`'s list (line 2781) `${e.name}`. One poisoned name
  executes on essentially every screen, and because records sync through
  Firestore, the payload **propagates to the user's other devices** and fires
  there on render.

### 22. Attribute/JS-string injection through record ids in inline `onclick` handlers (S2, CONFIRMED pattern / exploitation needs an imported record)
- **Sequence:** A workout/template/measurement whose `id` contains a single
  quote — e.g. synced from another client, restored from legacy data, or
  otherwise imported — is rendered in any list; tap it.
- **Expected:** Ids are treated as opaque data (event listeners or encoded attrs).
- **Actual:** Ids are interpolated into single-quoted JS string literals inside
  HTML attributes throughout: `onclick="viewWorkoutDetail('${w.id}')"`,
  `onclick="startWorkoutFromTemplate('${t.id}')"`,
  `onclick="deleteWorkout('${w.id}')"`, `onclick="deleteMeasurement('${m.id}')"`,
  `onclick="showExerciseDetail('${e.id}')"`, etc. An id like
  `x');alert(1);//` breaks out of the string and executes in page context.
  Locally generated ids come from `uid()` (alphanumeric, safe), so exploitation
  needs a crafted record to arrive via sync/import — but nothing anywhere
  validates id shape on load, sync-down, or import.

### 23. `escHtml` itself is incomplete and fragile (S3, CONFIRMED)
- **Sequence:** Rely on `escHtml` in any single-quoted attribute context, or pass
  it a non-string.
- **Expected:** A general-purpose escaper.
- **Actual:** It escapes `& < > "` but **not `'`** — unsafe for the
  single-quoted contexts this codebase favours (vector 22's handlers are the
  standing example). And `(str || '').replace(...)` throws
  `TypeError: (str || "").replace is not a function` for a truthy non-string
  (e.g. a numeric name from imported JSON), turning a render into a crash —
  see vector 31 for what a throwing render leaves on screen.

### 24. Screenshot-recovery preview is the positive control — it passes (PASS, verified by reading)
- **Sequence:** Paste screenshot text whose workout/exercise names contain HTML.
- **Actual:** `parseScreenshotText`'s preview (lines ~4285–4287) wraps name and
  date in `escHtml(...)` and the set values are parser-produced numbers. This is
  the only render path that escapes, which proves the pattern was known — it
  just never got applied to the other ~38 `innerHTML` writes (42 total in file).

## E. Voice commands — parser and routing

Verified by extracting `parseSpokenNumber` (line 3475) verbatim and running it,
behind `handleVoiceCommand`'s actual preprocessing
(`raw.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')`, line 3530), in Node.

### 25. A decimal dictation becomes a 100× integer: "225.5" → 2255 reps (S1, node-verified)
- **Sequence:** During a workout, say "two twenty-five point five" as digits —
  i.e. the recogniser returns the transcript `225.5` — as a bare number command.
- **Expected:** 225.5, or a clean rejection of decimals for reps.
- **Actual:** Preprocessing deletes the `.` **into a space**: `225.5` → `"225 5"`.
  `parseSpokenNumber` sees all-digit tokens (≤ 4) and **joins** them:
  `parseInt("225" + "5")` = **2255**. `handleVoiceCommand` then logs 2255 reps
  and completes the set. Same run: `"8.5"` → **85**. Any fractional weight or
  rep count spoken in digit form is silently multiplied by 10 per decimal digit.

### 26. Spoken decimals in words are added, not fractioned: "two point five" → 7 (S2, node-verified)
- **Sequence:** Say "weight two point five" (a 2.5 lb microplate — a real gym case).
- **Expected:** 2.5 lbs, or "decimals not supported".
- **Actual:** `point` is not in `wordMap` and is skipped; the parser sums the
  remaining numbers: 2 + 5 = **7 lbs** logged and confirmed aloud by
  `speakConfirm`. Digit form fares no better: "weight 225.5 pounds" returns the
  first digit token only, **225** — so the fractional part is variously
  dropped, added, or concatenated depending on phrasing, never correct.

### 27. "Rest zero" completes a set with 0 reps instead of touching the timer (S1, CONFIRMED by trace + node-verified parse)
- **Sequence:** Say "rest zero" (or "rest 0").
- **Expected:** Zero-length rest rejected, or timer simply not started; the
  current set is untouched.
- **Actual:** The rest branch in `handleVoiceCommand` is
  `if (/\brest\b/.test(t)) { const n = parseSpokenNumber(t); if (n) { … return; } }`
  — `n === 0` is falsy, so it **falls through** every later branch until the
  bare-number branch, whose guard is `n !== null` (0 passes). It then does
  `updateWorkoutSet(pos…, 'actualReps', 0)` + `toggleWorkoutSet(...)`: the
  current set is **completed at 0 reps** by a command that was about the timer.

### 28. No range clamp anywhere on the voice path: "nine hundred ninety nine thousand" → 999,000 (S2, node-verified)
- **Sequence:** Say that phrase as a bare number or after "weight".
- **Expected:** Reps/weight clamp to human ranges (say ≤ 10,000 lbs, ≤ 1,000 reps)
  or the command is rejected as implausible.
- **Actual:** `parseSpokenNumber` returns **999000** (verified), and the voice
  branches pass it straight to `updateWorkoutSet`, which (vector 12) validates
  nothing. The bogus value is saved, synced, and poisons volume totals, PR-style
  stats and the dashboard. Speech-recognition mishearings get the same free pass.

### 29. Parser vocabulary gaps silently rescale numbers: "one million" → 1 (S3, node-verified)
- **Sequence:** Say "weight one million" (or any phrase using *million*, or a
  mishearing like "ate" for eight).
- **Expected:** Unsupported words reject the whole number rather than rescaling it.
- **Actual:** Unknown tokens are `continue`d past in `parseSpokenNumber`;
  *million* is absent from `wordMap`, so the result is **1** — and because the
  number is non-null, the command executes at 1 lb / 1 rep instead of flashing
  "not recognized". Partial parses always execute; there is no all-tokens-must-
  be-numeric-words check. (Also verified: the compound rule
  `current * 100 + v` makes "one thirty five" → 135 correctly, but
  "eleven thirty" → 41 and "twenty twenty four" → 44.)

### 30. Command precedence traps: "skip" means the timer, never the set — and alternatives are ignored (S3, CONFIRMED)
- **Sequence:** With a rest timer running, say "skip this set". Separately, have
  the recogniser's top alternative be a near-miss ("ate reps") while a correct
  alternative exists in slots 2–3.
- **Expected:** Intent disambiguation, or at least trying the other alternatives.
- **Actual:** The first branch of `handleVoiceCommand` intercepts
  skip/stop/dismiss/clear whenever `timerInterval` is set and calls
  `skipTimer()` — the set is not skipped, and the user gets "Timer skipped" as
  if that were the request. And `voiceStart` sets
  `voiceRecognition.maxAlternatives = 3` but `onresult` only ever reads
  `e.results[i][0].transcript` — alternatives 2 and 3 are requested and thrown
  away, so a top-slot mishearing is final.

### 31. Recognition restarts forever; the restart loop has no backoff or give-up (S3, CONFIRMED)
- **Sequence:** Leave voice on and stop speaking / move out of mic range.
- **Expected:** After repeated no-speech ends, recognition stands down.
- **Actual:** `voiceRecognition.onend` (in `voiceStart`, line 3352) restarts
  after 250 ms whenever `voiceListening` is true, and `onerror` explicitly does
  **not** stop for `no-speech`. On iOS Safari, which ends recognition sessions
  aggressively, this is a permanent 250 ms restart churn — mic indicator and
  battery — until the user manually toggles voice off or finishes the workout
  by the non-discard path (vector 10).

## F. Navigation, view switching, and save/sync timing

### 32. Rapid consecutive saves are dropped by the sync "debounce" — no trailing flush (S2, CONFIRMED)
- **Sequence:** While signed in, log three sets in quick succession (each
  `toggleWorkoutSet`/`updateWorkoutSet` calls `saveState()` → `syncToFirestore`).
- **Expected:** All changes eventually reach Firestore (true debounce with a
  trailing call, or a dirty flag retried after the in-flight sync).
- **Actual:** `syncToFirestore(data)` (line 1721) begins:
  `if (!currentUser || !db || syncInProgress) return;` and
  `if (now - lastSyncTime < 2000) return;`. Both guards **return and discard** —
  there is no timer, queue, or dirty flag. Any save inside the 2 s window or
  during an in-flight sync is simply never uploaded unless a *later* save
  happens to fall outside the window. Fast logging (exactly the voice-command
  flow) is precisely the pattern that loses cloud sync; local state is fine,
  so the loss is invisible until another device is checked.

### 33. `showView` commits the navigation before the render that can throw (S2, CONFIRMED)
- **Sequence:** Switch to a view whose render hits a malformed record — e.g.
  Dashboard with a synced/imported workout lacking an `exercises` array.
- **Expected:** A failing render leaves the previous view intact, or is caught.
- **Actual:** `showView(name)` (line 2103) first removes `.active` from every
  view, activates the target, toggles nav highlighting and scrolls — **then**
  calls the render function, uncaught. `renderDashboard()` immediately does
  `w.exercises.reduce(...)` unguarded (and `renderHistory`/`renderWorkout` have
  similar unguarded spots), so one bad record throws after the switch: the user
  lands on an empty active view with the nav claiming they're there, and every
  retry re-throws. There is no error boundary anywhere in the navigation path.

### 34. Calendar "Log Workout" discards the date the user selected (S2, CONFIRMED)
- **Sequence:** On the dashboard calendar, navigate to another week, tap a past
  or future day, tap **Log Workout**.
- **Expected:** The new workout is dated to the selected day.
- **Actual:** `logWorkoutForDate(dateStr)` (line 2365) accepts `dateStr` and
  never uses it — it just routes to Templates or the template editor. When the
  workout is then started, `startWorkoutFromTemplate` stamps
  `date: new Date().toISOString()` (today). The day the user explicitly picked
  in `selectCalendarDate` is silently dropped; there is no UI hint of this.

### 35. Template-editor numeric inputs: negatives survive, decimals truncate, empty becomes a saved 0 (S2, CONFIRMED)
- **Sequence:** In the template editor, set a set's reps to `-5`, weight to
  `-50`, reps to `8.9`, then clear a rest field; Save.
- **Expected:** Same validation as any numeric field should have: ≥ 0,
  integers for reps/rest, empty = "unset" not 0.
- **Actual:** The inline handlers (in `renderTemplateExercises`, lines 2649–2651) are
  `oninput="…sets[si].reps=parseInt(this.value)||0"` and
  `weight=parseFloat(this.value)||0`. `|| 0` catches only NaN/empty-as-NaN and
  real 0; `-5` and `-50` are truthy and pass straight through; `parseInt`
  truncates `8.9` to `8`; clearing a field writes a literal 0 into the model on
  the first keystroke. `saveTemplate()` then validates only name non-empty and
  ≥ 1 exercise — the poisoned sets save, and later seed workouts (vector 12's
  negative volume, rest values that defeat the `set.rest > 0` timer guard).

### 36. `moveTemplateExercise` swaps without bounds checks (S3, CONFIRMED — latent)
- **Sequence:** Invoke a move at either end of the list (the rendered buttons
  are `disabled` at the ends, so this needs keyboard/programmatic invocation
  or a stale render after a deletion).
- **Expected:** Out-of-range moves are no-ops, as in `moveWorkoutSet`, which
  checks `to < 0 || to >= sets.length`.
- **Actual:** `moveTemplateExercise(i, dir)` (line 2759) computes `j = i + dir`
  and swaps unconditionally — an out-of-range `j` writes `undefined` into the
  array, and the next `renderTemplateExercises()` throws on `ex.supersetGroup`.
  The workout-side twin got the guard; the template-side one did not.

## G. Service worker and standalone detection

### 37. The SW "APP_UPDATE" notification is dead code — users are never told to refresh (S2, CONFIRMED)
- **Sequence:** Deploy a new `index.html`; an existing user opens the app and
  uses subresources/assets.
- **Expected:** On detecting changed content, the SW posts `APP_UPDATE` and the
  page shows the "Update available — refresh" toast (the listener exists,
  line ~4545).
- **Actual:** In `sw.js`, navigations return early through the dedicated
  `isNavigate` branch, so in the final stale-while-revalidate branch
  `isNavigate` is **always false** — yet the update check inside it is gated on
  `if (cached && isNavigate)`. The `postMessage({type: 'APP_UPDATE'})` can never
  execute. Combined with cache-first serving for non-navigations, users can run
  stale code indefinitely with the toast path unreachable. (Independently:
  the auth/bypass branch answers a failed fetch with
  `caches.match('./index.html')`, i.e. an HTML shell for non-HTML requests.)

### 38. Standalone/auth-mode detection edge cases (needs-device)
- **Sequence:** (a) iPad with "Request Desktop Website" or iPadOS desktop-class
  UA; (b) Android Chrome installed PWA (standalone via `display-mode`);
  (c) desktop Mac Safari added to Dock.
- **Expected:** Each lands on a sign-in path that works in that shell.
- **Actual (by reading):** `signInWithGoogle()` (line ~1710s region) branches on
  `isIosStandalonePwa()` only. `isIosDevice()` leans on UA regex plus
  `platform === 'MacIntel' && maxTouchPoints > 1`, which classifies an iPad in
  desktop mode as iOS (probably right) but would equally classify any future
  touch-capable Mac, and classifies nothing on Android: an Android standalone
  PWA falls into the `signInWithPopup` path, where standalone shells commonly
  block or orphan popups, and the only fallback is the popup-blocked →
  `signInWithRedirect` path, which has the same cross-context result-loss
  problem the iOS OIDC flow was built to escape. These need on-device
  verification per shell; the code has no Android-standalone branch at all.

---

## Summary table

### Confirmed by code reading (incl. node-verified arithmetic)

| # | Defect | Sev |
|---|--------|-----|
| 1 | `startRestTimer` leaks a `setInterval` on every restart — double-speed countdown, interval never clearable | S1 |
| 2 | Leaked interval keeps decrementing shared state and `skipTimer()`s later, unrelated timers | S1 |
| 15 | `openConfirm` single-slot: a second confirm silently replaces a pending destructive confirm's callback | S1 |
| 19–21 | Stored XSS: custom-exercise name/tips/proTip and workout/template names interpolated raw into `innerHTML` on catalog, detail, workout, dashboard, history, calendar, templates, nutrition sinks; sync propagates the payload across devices | S1 |
| 11 | Starting a template/empty workout silently overwrites and discards the active workout — no confirm | S1 |
| 27 | Voice "rest zero"/"rest 0" falls through the falsy guard and completes the current set at 0 reps | S1 |
| 25 | Voice digit decimals concatenate: "225.5" → 2255, "8.5" → 85 (preprocessing + token join) | S1 |
| 3 | Un-completing a set leaves its rest timer running | S2 |
| 4 | `lastSetPromptTimeout` handle overwritten without clear — stale prompt fires against the wrong timer | S2 |
| 5 | `timerAdd` uncapped; full-screen overlay (z-300, pointer-events all) traps navigation for the duration | S2 |
| 8 | Rest timer is memory-only; the app's own reload paths (handoff reload, update refresh) kill it silently | S2 |
| 9 | Workout elapsed `setInterval` never cleared on finish/discard or in `renderWorkout`'s empty branch | S2 |
| 10 | Discard-workout path never calls `voiceStop()` — mic stays live on the dashboard | S2 |
| 12 | `updateWorkoutSet` `parseFloat \|\| 0` for all fields: negatives, fractional reps, 999999, `1e3` all stored | S2 |
| 18 | Template-editor edits lost silently on overlay-tap close; no dirty guard or draft | S2 |
| 22 | Record ids interpolated into single-quoted `onclick` JS strings — JS-string breakout for crafted/synced ids | S2 |
| 26 | Voice word decimals add instead of fractioning: "two point five" → 7 lbs (digit form drops to 225) | S2 |
| 28 | No clamp on voice numbers: "nine hundred ninety nine thousand" → 999,000 logged | S2 |
| 32 | `syncToFirestore` 2 s / in-flight guards drop saves with no trailing flush — rapid (voice) logging loses cloud sync | S2 |
| 33 | `showView` activates the target view before its uncaught render; one malformed record bricks that view | S2 |
| 34 | `logWorkoutForDate(dateStr)` never uses the selected date; workout is stamped today | S2 |
| 35 | Template set inputs: negatives pass (`\|\| 0` only catches NaN/0), decimals truncate, clear writes 0; `saveTemplate` validates none of it | S2 |
| 37 | SW `APP_UPDATE` gated on `cached && isNavigate` in a branch where `isNavigate` is always false — update toast unreachable | S2 |
| 6 | `timerSubtract` clamps at 1 s (button can never finish a rest) and leaves ring at ~99% | S3 |
| 7 | `updateTimerDisplay` divides by unguarded `timerTotal` — NaN/Infinity stroke offset at total 0 | S3 |
| 13 | `addSetToWorkout` uses `\|\|` — a real logged 0 reps/weight resurrects as 10/planned in the copied set | S3 |
| 16 | `closeConfirm` doesn't clear `confirmCallback`/OK `onclick` — stale action stays armed after Cancel | S3 |
| 23 | `escHtml` doesn't escape `'` and throws on truthy non-strings | S3 |
| 29 | Parser skips unknown words and executes the partial number: "one million" → 1 | S3 |
| 30 | "Skip" during a timer always means the timer; recognition alternatives 2–3 requested but never read | S3 |
| 31 | Voice `onend` restart loop (250 ms) with no backoff/give-up; `no-speech` never stops it | S3 |
| 36 | `moveTemplateExercise` has no bounds check (its workout twin does) — swap with `undefined`, next render throws | S3 |

### Passes (checked, not defects)

| # | Check | Result |
|---|-------|--------|
| 17 | Double-tap Finish duplicating a workout | Guarded — `finishWorkout` is synchronous and nulls `activeWorkout` before returning; second tap hits the null guard. No debounce exists, so any future async step reopens it. |
| 24 | Screenshot-recovery preview escaping | Correct — `escHtml` on names/dates, numeric set values. The only escaping render path in the file. |
| — | `formatTime` workout-elapsed for normal values | Correct for `s ≥ 0`; negative/NaN inputs render as `-1:-30` / `NaN:NaN` (arithmetic node-verified) but need a corrupt `startTime` to reach the UI — folded into vector 9/33 notes rather than counted as a standalone defect. |

### Needs runtime / device test

| # | Item | Why it can't be settled by reading |
|---|------|-------------------------------------|
| 14 | Focus/DOM loss when `renderWorkout` rebuilds during an uncommitted edit, incl. voice-triggered re-renders | Depends on browser focus/change-event ordering and scroll behaviour |
| 22 | End-to-end exploit of the id-in-onclick pattern | Pattern is confirmed; requires a crafted record arriving via sync/import to fire |
| 38 | iOS desktop-mode iPad, Android standalone popup sign-in, Mac Dock web-app classification | UA/`display-mode`/popup behaviour is shell- and OS-version-specific |
| 8 | How often the handoff/SW reload actually interrupts a live rest in practice | Mechanism confirmed in code; frequency is a device-workflow question |
| 1/2 | Exact user-visible countdown rate after a double start (2× vs stutter) | Leak and shared-state corruption are confirmed; the precise visual symptom depends on tick alignment |

*End of Interaction & Timing lane report — 38 vectors: 34 confirmed defects (9 S1, 16 S2, 9 S3), 2 passes, and 2 vectors (14, 38) that are primarily runtime/device questions, plus runtime sub-questions on vectors 8 and 22.*
