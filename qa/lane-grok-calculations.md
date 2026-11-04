# FitLog / Lift Tracker — Calculations and Consistency Break-Test

Lane: calculations and consistency. Target: `repo/index.html` (single-file PWA, `localStorage` key `liftTracker`). Read-only. No app file was modified.

Method: every formula below is the code in `repo/index.html`. Results that depend on language rules (`parseFloat`, `??` versus `||`, `Date` parse, `%`, `toFixed`) were executed in Node (V8) with those same expressions. Timezone cases pass an explicit `timeZone` (`America/Los_Angeles`, `Asia/Tokyo`). Date-only ISO strings follow ES: `YYYY-MM-DD` is UTC midnight.

There is no streak function in the file. Weekly behaviour is `renderDashboard` ("This Week") and `computeAnalysis` (rolling 30-day counts, gaps, strength trend). `buildUpcomingSchedule` is the only split-rhythm function. Nothing calls it.

## Proven defect index

| # | Defect | Function | Live |
| --- | --- | --- | --- |
| V01 | Negative × negative yields a positive volume | `setVolume` | yes |
| V02 | One negative sign subtracts from lifetime volume | `setVolume`, `workoutVolume` | yes |
| V03 | `Infinity` / `NaN` poison every total that adds that set | `setVolume`, `workoutVolume` | yes |
| V04 | `parseFloat` / `parseInt` accept a prefix (`135abc` → 135) | `updateWorkoutSet`, `importWorkouts` | yes |
| V05 | `1e309` stores `Infinity`; `\|\|` does not reject it | `updateWorkoutSet` | yes |
| V06 | Logged `0` is kept by `??`, hidden in the input, then copied forward as `10` | `setVolume`, `renderWorkout`, `addSetToWorkout` | yes |
| V07 | Legacy sets display `0 × 0` while volume uses the planned load | `viewWorkoutDetail` vs `setVolume` | yes |
| V08 | `""` actuals block the `??` fallback and force volume `0` | `setVolume` | yes |
| V09 | Dashboard `k` rounding prints `0.0k` for 1–49 lb | `renderDashboard`, `viewWorkoutDetail` | yes |
| V10 | Completed warm-ups count as full working volume | `setVolume` | yes |
| V11 | MET map misses Biceps, Triceps, Glutes, Cardio | `estimateCalories` | yes |
| V12 | Zero completed sets still burn the default MET for the whole duration | `estimateCalories` | yes |
| V13 | Body weight `0` becomes 180; a negative body weight makes negative calories | settings handler, `estimateCalories` | yes |
| V14 | Load multiplier is a per-set pound step and ignores sign | `estimateCalories` | yes |
| V15 | Duration `0` is treated as missing; Apple Health invents `90s × sets` | `viewWorkoutDetail`, `exportForAppleHealth` | yes |
| V16 | CSV minute rounding changes duration; sub-30s becomes `0` | `exportWorkouts`, `importWorkouts` | yes |
| V17 | `formatTime` has no hour field and prints negative clocks | `formatTime` | yes |
| V18 | Rest intervals stack, so the clock runs fast | `startRestTimer` | yes |
| V19 | Wall-clock duration is uncapped, so a forgotten timer inflates calories | `finishWorkout`, `estimateCalories` | yes |
| V20 | Plank `durationSeconds` is stored and never read | `setVolume`, `estimateCalories` | yes |
| V21 | Profile body trends read the wrong object and never render | `computeAnalysis` | yes |
| V22 | Hips (chest, neck) increasing is painted good; a 0.04 change displays as `+0.0` | `getMeasurementTrend` | yes |
| V23 | Measurement `0` cannot be saved or imported; the trend treats `0` as absent | `saveMeasurement`, `importMeasurements`, `getMeasurementTrend` | yes |
| V24 | The measurement date defaults to the UTC day | `renderMeasurements` | yes |
| V25 | `formatDate` shifts `YYYY-MM-DD` onto the previous local day in the Americas | `formatDate` | yes |
| V26 | Calendar keys use the UTC date prefix; history uses local `formatDate` | `renderCalendar`, `formatDate` | yes |
| V27 | "This Week" starts on Sunday, has no end, and counts future workouts | `renderDashboard` | yes |
| V28 | The calendar day panel shows only the first workout | `renderCalendar` | yes |
| V29 | "Log Workout" on a chosen day discards that day | `logWorkoutForDate` | yes |
| V30 | Strength trend is insertion order, weight-only, and concatenates numeric strings | `computeAnalysis`, `getAvgIntensity` | yes |
| V31 | Muscles with 0 sets are invisible; the only trained muscle is called neglected | `computeAnalysis`, `generateAdvice` | yes |
| V32 | "Percent more" is computed as `a/b×100` | `generateAdvice` | yes |
| V33 | Spoken decimals are concatenated; every number in the phrase is summed | `parseSpokenNumber`, `handleVoiceCommand` | yes |
| V34 | "done" during a rest completes the next set; "finish" does not finish the workout | `handleVoiceCommand` | yes |
| V35 | "Rest one minute" starts a 1-second timer | `handleVoiceCommand`, `parseSpokenNumber` | yes |
| V36 | Exercise names containing push/pull/chest/back/arm/day start a new workout | `parseWorkoutText` | yes |
| V37 | The unanchored `@` regex steals RPE lines and fractional reps | `parseWorkoutText` | yes |
| V38 | `kg` is stored as pounds; `3x10` is stored as 3 lb × 10 reps | `parseWorkoutText` | yes |
| V39 | `extractDate` turns `2026-11-03` into `2003-26-11` and drops the year on month names | `extractDate` | yes |
| V40 | Every recovered workout is hard-coded to 1 hour | `parseWorkoutText` | yes |
| V41 | CSV keeps negatives, truncates decimal reps, and reads `1,234.5` as `1` | `importWorkouts`, `importMeasurements` | yes |
| V42 | Re-import appends a full duplicate; same date + name collapse; first duration wins | `importWorkouts` | yes |
| V43 | Measurement import ignores the header and binds columns by position | `importMeasurements` | yes |
| V44 | The completed column accepts only `1`, `y`, `yes`, `true` | `importWorkouts` | yes |
| V45 | Heart-rate window follows a UTC date-only start; string `bpm` values concatenate | `getHeartRateForWorkout` | yes |
| V46 | Split rhythm is 1-on / N-off, and the function is never called | `buildUpcomingSchedule` | dead |

---

## Volume

### V01 — both signs negative become a normal positive load

- Input: completed set `{ actualReps: -5, actualWeight: -45 }`. Reachable from `type="number"` inputs via `updateWorkoutSet`, or from CSV (V41).
- Expected: reject a non-positive load, or keep a negative product so it cannot look like work done.
- Actual: `setVolume` returns `(-5) * (-45) = 225`. `workoutVolume` adds 225. Dashboard, history, and Apple Health `totalVolume` all count two hundred twenty-five pounds.

`setVolume` (~1961) returns 0 only when `!s` or `!s.completed`. It multiplies the `??` results with no finite/positive check.

### V02 — one minus sign subtracts from lifetime volume

- Input: completed `{ actualReps: -5, actualWeight: 45 }` next to a real `10 × 135` set (1350 lb).
- Expected: the bad set contributes 0. Lifetime volume stays 1350.
- Actual: `setVolume` returns `-225`. `workoutVolume` returns `1125`. The profile card then hides non-positive lifetime totals (V09) while the dashboard still prints the signed `k` value.

### V03 — non-finite values poison every sum

- Input A: `{ completed: true, actualReps: Infinity, actualWeight: 100 }`.
- Input B: `{ completed: true, actualReps: 10, actualWeight: NaN }`.
- Input C: `{ completed: true, actualReps: 10, actualWeight: "135abc" }` (the string survives if it was written into `liftTracker` directly; the input path parses it first, V04).
- Expected: a non-finite load contributes 0 and leaves every other workout's total alone.
- Actual:
  - A: `setVolume` returns `Infinity`. `renderDashboard` shows `Infinityk`.
  - B: `NaN` is not nullish, so `??` keeps it. `10 * NaN` is `NaN`. That `NaN` flows through `workoutVolume` into the all-time sum, and the dashboard shows `NaNk`.
  - C: inside `setVolume`, `"135abc" * 10` is `NaN`. Same poison.

### V04 — a numeric prefix is the whole value

- Input: field `"135abc"`, `" 135 lbs"`, reps `"8.9"`; CSV cells `"135abc"`, `"10abc"`, `"8.9"`.
- Expected: reject a token unless the entire string is a number.
- Actual:
  - `updateWorkoutSet` (~3085) assigns `parseFloat(val) || 0`. `parseFloat("135abc")` is `135` (truthy, kept). `parseFloat(" 135 lbs")` is `135`. `parseFloat("abc")` is `NaN`, and `NaN || 0` is `0`. A garbage suffix becomes a real load; a garbage word becomes a silent zero.
  - `importWorkouts` (~4068) uses `parseFloat` for weight and `parseInt(..., 10)` for reps. `"135abc"` → 135 lb, `"10abc"` → 10 reps, `"8.9"` → 8 reps (`parseInt` stops at the dot).
  - Template editors (~2540) use `parseInt(this.value)||0` and `parseFloat(this.value)||0`, so the same prefix is baked into the plan before a workout starts.

`type="number"` blocks some of these keystrokes. Voice, CSV, and a direct state write do not.

### V05 — overflow stores Infinity

- Input: weight field `"1e309"` (`type="number"` accepts it).
- Expected: reject a non-finite result.
- Actual: `parseFloat("1e309")` is `Infinity`. `Infinity || 0` is `Infinity`. `setVolume` returns `Infinity`. The nearby input `"1e2"` is stored as `100` with no indication that scientific notation was expanded.

### V06 — zero means three different things

The comment on `setVolume` (~1963) says a logged 0 must stay 0, because `||` would revive the planned reps or weight.

- Input: completed `{ actualReps: 0, actualWeight: 135, reps: 10, weight: 135 }`, then "+ Working Set".
- Expected: volume is 0. The reps box shows 0. The new set copies 0 reps.
- Actual:
  1. `setVolume` uses `??`, so volume is `0 * 135 = 0`. This matches the comment.
  2. `renderWorkout` (~3055) sets `value="${s.actualReps||''}"`. `0 || ''` is `''`. The box looks blank. The history row (~3863) uses `s.actualReps||0`, so the same set shows `0` there.
  3. `addSetToWorkout` (~3114) copies `last?.actualReps || 10`. `0 || 10` is `10`. The added set is 10 × 135. That is the revival the comment describes. `actualWeight: last?.actualWeight || 0` keeps a zero weight only because the fallback is also 0.

Clearing the box takes a different route to the same stored 0: `parseFloat("")` is `NaN`, and `NaN || 0` is `0`.

### V07 — the detail row and the total disagree on legacy sets

- Input: `{ completed: true, reps: 10, weight: 135 }` with `actualReps` and `actualWeight` absent. This is the legacy shape the `setVolume` comment says it supports.
- Expected: the modal and the total both show 10 × 135 and 1350 lb.
- Actual: `setVolume` falls back through `??` and returns 1350. The detail row (~3863) renders `` `${s.actualReps||0} reps × ${s.actualWeight||0} lbs` ``, which is `0 reps × 0 lbs`, with a check mark. `exportWorkouts` (~3937) uses the same `??` fallback as `setVolume`, so the CSV contains 135 and 10 while the modal shows zeros.

### V08 — empty string is present, so the fallback never runs

- Input: `{ completed: true, actualReps: "", actualWeight: 135, reps: 10 }`.
- Expected: invalid, or the documented fallback `reps` (10 × 135 = 1350).
- Actual: `""` is not nullish. `??` keeps it. `"" * 135` is `0`. The same happens for `actualReps: false` (`false * 135 = 0`).

### V09 — "k" rounding erases small workouts and disagrees with the other totals

- Input: completed volumes 40, 49, 50, 149, 150, 999, 1049, 1350, and -500.
- Expected: dashboard, history, and profile show the same integer, or the displayed error stays under 1 lb.
- Actual: `renderDashboard` (~2050) and `viewWorkoutDetail` (~3811) always render `(volume/1000).toFixed(1) + "k"`. Executed:

  | lb | dashboard | history `toLocaleString` |
  | --- | --- | --- |
  | 40 | `0.0k` | `40` |
  | 49 | `0.0k` | `49` |
  | 50 | `0.1k` | `50` |
  | 149 | `0.1k` | `149` |
  | 150 | `0.1k` | `150` |
  | 999 | `1.0k` | `999` |
  | 1049 | `1.0k` | `1,049` |
  | 1050 | `1.1k` | `1,050` |
  | 1350 | `1.4k` | `1,350` |
  | -500 | `-0.5k` | `-500` |

  The profile card (~4988) prints the raw number when `0 < volume < 1000`, the same `k` form at or above 1000, and `—` when `volume <= 0`. A 40 lb lifetime total is `0.0k` on the dashboard, `40` on the profile, and `40 lbs` in history. A negative total is `-0.5k` on the dashboard and `—` on the profile.

  `1.1 * 1.1` is `1.2100000000000002` and `0.1 * 0.2` is `0.020000000000000004`. `setVolume` returns that raw product. `toLocaleString` usually shortens it; the stored `totalVolume` in the Apple Health JSON does not.

### V10 — warm-up sets are full volume

- Input: a completed set `{ type: "warmup", actualReps: 10, actualWeight: 135 }` plus three working sets of `5 × 225`.
- Expected: a set tagged Warm-up is omitted from working volume, or the total is labeled as including warm-ups.
- Actual: `setVolume` never reads `type`. The warm-up adds 1350. `estimateCalories` also counts it in the set average (V14). `getAvgIntensity` counts it in the strength trend (V30).

---

## Calories and MET

`MET_VALUES` (~3949): Chest 5.0, Back 5.0, Legs 6.0, Shoulders 4.5, Arms 4.0, Core 4.0, Traps 4.5, Full Body 6.0, default 5.0.

`estimateCalories` (~3954):

```text
weightKg = (settings.bodyWeight || 180) * 0.453592
avgMet   = (sum over exercises of MET[muscle] * multiplier(avg set weight) * completedSetCount) / completedSetCount
calories = round(avgMet * weightKg * durationSec/3600)
```

`multiplier` is 1.15 above 100 lb, 1.0 above 50 lb, otherwise 0.85. With no completed sets, `avgMet` is hard-coded to 5.0.

Catalog muscles that actually appear on exercises include Biceps, Triceps, Glutes, and Cardio (`MUSCLE_EMOJIS`, ~880). Those keys are absent from `MET_VALUES`.

### V11 — four real muscle names miss the table

- Input: a completed biceps curl (`muscle: "Biceps"`), triceps pushdown (`"Triceps"`), hip thrust stored as Glutes, and a rowing set stored as `"Cardio"`. An Arms exercise from `EXERCISE_DB` is the control.
- Expected: biceps and triceps use the Arms MET (4.0), glutes use Legs (6.0), cardio uses a cardio MET.
- Actual: `estimateCalories` looks up `MET_VALUES[ex.muscle] || MET_VALUES.default`. Biceps, Triceps, Glutes, and Cardio all get 5.0. Arms gets 4.0. The same biceps work is 5.0 or 4.0 depending on which list the exercise came from. `computeAnalysis` remaps Biceps/Triceps → Arms and Glutes → Legs for the balance chart, so the chart and the calorie model disagree about what muscle the set was.

Default body weight 180 lb is `180 * 0.453592 = 81.64656` kg. One hour at MET 5.0 is `round(5 * 81.64656) = 408` kcal. One hour of biceps at the Arms MET would be `round(4 * 81.64656) = 327`. The miss is about 81 kcal/hour at the default body weight, before the load multiplier.

### V12 — an empty completed-set list still burns calories

- Input: a workout whose sets are all `completed: false`, `duration` 3,600,000 ms. `finishWorkout` refuses to save that shape, but `importWorkouts` can (completed column `0`, duration present).
- Expected: 0 kcal when nothing was completed. The comment says the MET is a weighted average of completed sets.
- Actual: `totalSets === 0`, so `avgMet` is forced to 5.0, and the function still multiplies by the full duration. At the default body weight that is 408 kcal for an hour of unfinished sets.

### V13 — body weight 0 is 180, and a negative body weight burns negative calories

- Input: settings field `0`, then `-10`. Handler (~560): `state.settings.bodyWeight = parseFloat(this.value) || 180`.
- Expected: `0` stored as 0 (or rejected with an error). A negative value rejected. Calories never negative.
- Actual: `parseFloat("0") || 180` is `180`, because `0` is falsy. The user cannot record 0, and a cleared/zeroed field silently uses 180 lb, which is `81.65` kg in the formula. `parseFloat("-10")` is `-10` (truthy), so it is stored. `estimateCalories` then does `round(5 * (-10 * 0.453592) * 1) = -23` for one hour at MET 5. The stat shows `-23`.
- `"180abc"` in that handler becomes 180 via `parseFloat`. A string body weight `"200abc"` written straight into state makes `weightKg` `NaN` and the calorie stat `NaN`.

### V14 — the load multiplier is a blunt per-set average

- Input: one completed set at 405 lb and one completed set at 40 lb, same muscle, 30 minutes, body weight 180.
- Expected: effort follows the heavy set (or the volume), and a negative load does not count as "light work".
- Actual: `estimateCalories` averages the two weights to 222.5, takes the `> 100` branch (×1.15), and weights each set equally regardless of reps. Swap in a bodyweight set at 0 lb and the average can fall through to ×0.85. A negative average (V01/V02) also takes the 0.85 branch (`-10 > 50` is false), so the bad set still adds a positive MET contribution while `setVolume` may be subtracting pounds.

Thresholds are absolute pounds. A 101 lb average is 1.15× and a 100 lb average is 1.0×.

### V15 — duration 0 and a missing duration are the same flag, except in Apple Health

- Input: `duration: 0` with 4 completed sets. Also `duration: null`.
- Expected: 0 ms means a zero-length session (0 kcal, 0 displayed time). A missing duration is the only case that may estimate.
- Actual:
  - `viewWorkoutDetail` (~3801) uses `w.duration ? floor(ms/1000) : 0`. Both `0` and `null` are falsy, so calories are computed with 0 seconds and render as 0. The clock line is omitted.
  - `exportForAppleHealth` (~3981) uses `w.duration ? floor(ms/1000) : completedSets * 90`. Duration `0` takes the fallback: `4 * 90 = 360` seconds. `estimateCalories` then burns 6 minutes of MET. The JSON `durationSeconds` is 360 and the in-app calorie stat is 0 for the same workout.
  - `renderHistory` (~3779) uses the same falsy test, so a 0 ms workout shows no duration chip.

### V16 — export rounds to minutes, and import believes it

- Input: durations 29,000 ms, 90,000 ms (1.5 min), 1,220,000 ms (20 min 20 sec), and a negative `-90,000` ms.
- Expected: a round trip restores the original millisecond duration, or the error stays under 1 second. A negative duration is rejected.
- Actual: `exportWorkouts` (~3934) writes `Math.round(ms/60000)` under the header `Duration (min)`. `importWorkouts` (~4062) stores `Number(cell) * 60000` when the cell is truthy.
  - 90,000 ms → `round(1.5) = 2` minutes → import `120,000` ms. Thirty seconds appear.
  - 1,220,000 ms → `round(20.333) = 20` minutes → 20 seconds disappear.
  - 29,000 ms → `round(0.483) = 0`. The cell is `0`. On import the string `"0"` is truthy, so duration becomes `Number("0") * 60000 = 0`. Display and Apple Health then treat that 0 as missing (V15) and Apple Health invents `90s × sets`.
  - `-90,000` ms is truthy, so it is exported. `Math.round(-1.5)` is `-1`. Import stores `-60,000` ms. `estimateCalories` receives a negative hour fraction and returns a negative calorie count. `formatTime` prints a negative clock (V17).
- `Number("10abc")` is `NaN`, so a dirty duration cell becomes `NaN` (falsy, then treated as missing). Weight in the same importer uses `parseFloat`, which would have kept `10`. One row, two parse policies.

### V17 — clocks do not roll over at 60 minutes

- Input: elapsed `125 * 60 + 3` seconds (2 h 5 min 3 sec). Also `-90` seconds.
- Expected: `2:05:03`, and a negative remaining time clamped to `0:00`.
- Actual: `formatTime` (~1981) is `floor(s/60) + ":" + pad(s%60)`. The first input renders `125:03`. The second renders `-2:-30` (`(-90) % 60` is `-30` in JavaScript). The workout timer and the history chip both call `formatTime`. The rest overlay clamps with `Math.max(0, timerRemaining)` before calling it; the workout timer does not.

### V18 — starting a rest timer does not stop the previous one

- Input: complete a set with `rest: 60` (`toggleWorkoutSet` calls `startRestTimer(60)`), then complete another set 10 seconds later, or say "rest 90" while the overlay is up.
- Expected: one interval, one remaining-time value.
- Actual: `startRestTimer` (~3188) assigns `timerInterval = setInterval(...)` and never calls `clearInterval` on the previous id. Both callbacks decrement the shared `timerRemaining`. The overlay reaches 0 in about half the intended time. `skipTimer` clears only the id currently stored in `timerInterval`, so the orphaned callback keeps firing.

### V19 — calories use the raw wall clock

- Input: `startTime` at 08:00, phone locked, `finishWorkout` at 16:00, four completed sets.
- Expected: a cap, a pause, or a duration based on logged work. An 8-hour gap is not 8 hours of lifting MET.
- Actual: `finishWorkout` (~3170) sets `duration = endTime - startTime` (28,800,000 ms) with no cap. `estimateCalories` multiplies the average MET by 8 hours. At the default body weight and MET 5 that is `round(5 * 81.64656 * 8) = 3266` kcal.

### V20 — plank seconds are decorative

- Input: the built-in plank sets `{ reps: 0, weight: 0, durationSeconds: 60 }` (and 45). `startWorkoutFromTemplate` spreads the set, so `durationSeconds` is on the live object.
- Expected: a timed set contributes 60 seconds to duration or to a time-based volume, and 0 reps stays 0 when another set is added.
- Actual: `setVolume` returns `0 * 0 = 0` and never reads `durationSeconds`. `estimateCalories` never reads it either. The only time input is the workout wall clock (V19). Adding a set afterwards hits V06: `0 || 10` copies 10 reps onto the new plank set. The reps input renders blank because of `0 || ''`.

---

## Measurements and trends

`LOWER_IS_BETTER` (~3575) is `['weight', 'bodyFat', 'waist']`. `getMeasurementTrend` (~3576) paints the badge `up` (green) when the direction is "good", and `down` (red) otherwise. The arrow still follows the sign.

`saveMeasurement` (~3594) keeps a value only when `!isNaN(v) && v > 0`. `importMeasurements` uses the same `v > 0` test. History rows skip falsy values (`m.values[f.id]`).

### V21 — the profile trend reads properties that are never written

- Input: two saved measurements `{ values: { weight: 180, bodyFat: 18 } }` then `{ values: { weight: 175, bodyFat: 17 } }`. `saveMeasurement` pushes `{ id, date, values }`.
- Expected: the Body Trends card shows 180 → 175 and 18% → 17%, both green.
- Actual: `computeAnalysis` (~4667) reads `meas[0].weight` and `meas[0].bodyFat`. Both are `undefined`. `if (w0 && w1)` fails. `weightTrend` and `bodyFatTrend` stay `null`. The card at ~5017 is gated on those fields, so it never renders. The Measure tab, which calls `getMeasurementTrend` on `.values`, does show the arrows. Two surfaces, one data shape, only one of them looks at `.values`.

`slice(-2)` is the last two pushes, not the last two calendar dates. A back-filled older date becomes the "after" side of the diff if those property names were corrected.

### V22 — waist down is good, hips up is also good

- Input: waist 32 → 30, hips 40 → 42, weight 180.00 → 180.04.
- Expected: waist decrease is good. Hips are a girth like waist, so an increase is not unconditionally good. A change that rounds to 0.0 lb shows the flat badge.
- Actual: `getMeasurementTrend` marks waist `-2.0` green (`LOWER_IS_BETTER`, class `up`, arrow `↓`). Hips `+2.0` is also green (class `up`, arrow `↑`) because hips is not in the list. Chest and neck behave like hips. Both badges green while the waist-to-hip picture got worse.
- The 0.04 lb change: `diff === 0` is false, `diff.toFixed(1)` is `"0.0"`, and `(0.04/180*100).toFixed(1)` is `"0.0"`. The badge is `↑ +0.0 (+0.0%)` in green.

### V23 — zero is "not a measurement" in three places

- Input: weight `0` in the form; CSV cell `0`; a stored `values.weight = 0` next to a later `180`.
- Expected: the `setVolume` policy (a real 0 stays 0) applied consistently, or an explicit validation error. A trend from 0 is defined.
- Actual:
  - `saveMeasurement` drops `v > 0` failures, including 0 and negatives. If every field fails, the toast is "Enter at least one measurement".
  - `importMeasurements` drops them the same way. `parseFloat("0")` is 0, rejected. `parseFloat("135abc")` is 135, kept.
  - `getMeasurementTrend` returns `''` when `!previous.values[fieldId]`. `0` is falsy, so a real 0 never draws a badge. The later `prev !== 0` percent guard is unreachable for 0.
  - The history grid's `filter(f => m.values[f.id])` also hides 0. A negative stored by hand would show (it is truthy) and would get a badge. The form and the importer cannot create that negative; a hand-edited `liftTracker` blob can.

### V24 — the date picker opens on the UTC day

- Input: local time Tuesday 2026-11-03 17:00 in `America/Los_Angeles`, which is `2026-11-04T01:00:00.000Z`.
- Expected: the date input shows `2026-11-03`.
- Actual: `renderMeasurements` (~3534) sets `new Date().toISOString().split('T')[0]`. That slice is `2026-11-04`. The picker shows Wednesday. Save writes `"2026-11-04"`. `formatDate` of that date-only string then shifts it again (V25): in Los Angeles the history card reads Tuesday, Nov 3. The stored key is still November 4.
- The mirror image, Wednesday 2026-11-03 07:00 in `Asia/Tokyo` (`2026-11-02T22:00:00.000Z`), puts `2026-11-02` in the picker. The user is looking at yesterday.

---

## Dates, calendar, weekly counts

`formatDate` (~1976) is `new Date(d).toLocaleDateString(...)`.

Workouts started in the app store `new Date().toISOString()` (full timestamp) at `startWorkoutFromTemplate` / `startEmptyWorkout` (~2885, ~2943). Measurements and screenshot recovery store `YYYY-MM-DD`. CSV import stores whatever string was in the file.

`renderCalendar` (~2158) buckets workouts with `w.date.substring(0, 10)` and builds day keys in local `YYYY-MM-DD`.

### V25 — a date-only string is yesterday in the Americas

- Input: measurement or imported workout `date: "2026-11-04"`.
- Expected: every zone shows November 4.
- Actual: `new Date("2026-11-04")` is `2026-11-04T00:00:00.000Z`. `formatDate` then formats that instant locally.
  - `America/Los_Angeles`: Tuesday, Nov 3.
  - `Asia/Tokyo`: Wednesday, Nov 4.
- A full timestamp does the opposite of this bug. `2026-11-04T04:00:00.000Z` (Tuesday 20:00 in Los Angeles) formats as Tuesday, Nov 3 locally. `formatDate` is correct for instants and wrong for date-only strings. The app stores both shapes.

### V26 — history and the calendar disagree on which day a workout happened

- Input: workout finished Tuesday 2026-11-03 20:00 in Los Angeles. `date` is `2026-11-04T04:00:00.000Z`.
- Expected: history and the calendar both mark Tuesday Nov 3.
- Actual: `formatDate` shows Tuesday, Nov 3 (the local instant). `renderCalendar` keys `substring(0, 10)` = `2026-11-04` and paints the dot on Wednesday. Saturday night local that falls on Sunday UTC lands on next week's calendar while history still says Saturday.

Date-only `"2026-11-01"` (intended Sunday) is UTC midnight, which in Los Angeles is still Saturday evening. `formatDate` shows Saturday. The calendar key is the literal `2026-11-01`, so the dot is on Sunday. `renderDashboard`'s `new Date("2026-11-01") >= weekStart` compares that UTC midnight with local Sunday 00:00, so the workout can fall outside "This Week" while the calendar still dots Sunday.

`new Date("11/03/2026")` is not ISO. In V8 it parsed as local midnight (observed Tue Nov 3 2026 00:00 in the runtime zone). `new Date("2026-11-03")` is UTC midnight. The same civil day, two strings, two instants, and `formatDate` can print two different days.

### V27 — "This Week" is Sunday-onward, forever

- Input: today Wednesday 2026-11-04. One workout on Sunday Nov 1, one on Monday Nov 2, one dated 2026-12-01.
- Expected: a Sunday–Saturday or Monday–Sunday window that ends at the end of that week. The calendar labeled "This Week" uses the same window. Future dates stay out.
- Actual: `renderDashboard` (~2041) sets `weekStart` to local Sunday 00:00 via `now.getDate() - now.getDay()`, then keeps every workout with `new Date(w.date) >= weekStart`. There is no end. The December workout counts. The stat and the calendar label both say "This Week".
- The calendar week is Monday–Sunday (`(dow + 6) % 7`, ~2150). On Monday Nov 2 the dashboard window opened on Sunday Nov 1, and the visible grid is Mon Nov 2 – Sun Nov 8. Sunday's workout increments the stat and is absent from the grid. On Sunday itself the grid is the Monday that just passed through today, so the two windows only share an endpoint.

`buildUpcomingSchedule` also does `w.date.substring(0, 10)`, so its anchor day has the same UTC-prefix shift. It is dead code (V46).

### V28 — two workouts on one day, one is invisible

- Input: two workouts whose `date` prefix is `2026-11-03`, logged in that order, names "AM" and "PM".
- Expected: the day panel lists both, and the dot count matches.
- Actual: `renderCalendar` pushes both into `workoutsByDate`, draws a single dot, and renders `dw[0]` only (~2205). The panel shows "AM". "PM" is reachable from history and invisible from the calendar. Volume in the panel is `workoutVolume` of the first workout only.

### V29 — the selected day is thrown away

- Input: tap Wednesday on the calendar, then "Log Workout". `logWorkoutForDate('2026-11-04')`.
- Expected: the new workout's `date` is that Wednesday (local), so it dots the day the user selected.
- Actual: `logWorkoutForDate` (~2256) never reads `dateStr`. It opens the template list or the template editor. `startWorkoutFromTemplate` then sets `date: new Date().toISOString()`, which is "now" and is subject to V26.

### V30 — "strength" is the average of raw weights, in array order

- Input: four workouts in the last 30 days, inserted as heavy, heavy, light, light, but their `date` fields run light → heavy in time (an import appended the older sessions last). Each heavy set is `actualWeight: 200`, each light set is `100`. A fifth state uses string weights `"135"`, `"95"`, `"185"` on completed sets.
- Expected: the later calendar half is compared with the earlier calendar half. Intensity includes reps (volume or a 1RM). Numeric strings are numbers. Bodyweight work counts as something other than "ignore".
- Actual: `computeAnalysis` (~4610) filters `new Date(w.date) >= now - 30 * 86400000` and does not sort. `getAvgIntensity` (~4707) averages `actualWeight` for `completed && actualWeight > 0`. The array-order second half is the old heavy block, so the trend is `declining` while the dates say the opposite. Reps are ignored: 100 × 10 and 100 × 1 are the same intensity. Weight `0` (planks, pull-ups) fails `> 0` and drops out. The 5% bands (`* 1.05`, `* 0.95`) sit on that average.
- String weights: `0 + "135"` is `"0135"`, then `"013595185"` after the three adds. The "average" is that string coerced back to a number (`1.3595185e7` range). `"> 0"` is true for a numeric string, so this path is live for any `liftTracker` blob whose `actualWeight` was saved as a string (a sync payload or a hand edit). `setVolume` would have coerced the same strings through `*` and produced a real pound total. The two functions disagree on one state.

`avgPerWeek` is `(count / 4.3).toFixed(1)`, a string. Later `<` comparisons coerce it. The window is exactly `30 * 86400000` ms, not 30 local midnights, so a date-only workout near the boundary (UTC midnight, V25) falls in or out a few hours away from the local calendar day. Two sessions on one day count as two toward the weekly rate and pull `avgGap` down. That is "sessions per 4.3 weeks", not a streak. No function counts consecutive training days.

### V31 — the muscle you skip is not the muscle you are scolded for

- Input: 30 days containing only Back, 40 completed sets. Chest, Shoulders, Arms, Legs, Core, Cardio are at 0. Separately, a week of only Cleans (`muscle: "Full Body"`) or Shrugs (`"Traps"`).
- Expected: Chest (0 sets) is the neglected group. Full Body and Traps appear in the balance chart or in the denominator consistently.
- Actual: `computeAnalysis` builds scores only for `['Chest','Back','Shoulders','Arms','Legs','Core','Cardio']` and then drops `sets === 0` before choosing weaknesses (~4685). The weakness list is `[Back]`. `generateAdvice` (~4760) titles that "Back Is Getting Neglected" and quotes the 40 sets. Chest is never mentioned. With two muscles trained, both appear in `strengths` (top 3) and in `weaknesses` (bottom 3 of the same short list), so a muscle can be a strength and a weakness in one report.
- Full Body and Traps sets increment `totalSets` and then appear in no bar. Percents use that larger denominator, so the bars sum under 100. A week of only those lifts shows a set count in the header and an empty bar list (`hasData` is true, every listed muscle has 0 sets).

`muscleCounts` increments once per exercise appearance, including an exercise with zero completed sets. The chart displays `m.sets` (completed-set count), not `m.count`.

### V32 — "400% more" for a 4× gap

- Input: Chest 40 completed sets, Back 10, inside the lopsided branch (`top/bot > 3`, at least two muscles with sets).
- Expected: "300% more" (`(40-10)/10`), or the sentence "4× the volume".
- Actual: `generateAdvice` (~4786) interpolates `Math.round(topSets / botSets * 100)`, which is `400`. The sentence reads "400% more volume". The ratio is 4×, which is 300% more.

---

## Voice

`handleVoiceCommand` (~3426) lowercases the transcript and replaces every non-alphanumeric with a space before `parseSpokenNumber` (~3371). Routing order: timer skip, next-exercise, add-set, rest, weight, complete-set, then a bare number means "log reps and complete".

`parseSpokenNumber` digit rule: if any token is all digits, and every token is all digits, and there are at most 4 tokens, join them and `parseInt`. Otherwise return the first digit token. The word rule sums every number word. The plate special case `current * 100 + tens` runs only when `0 < current < 10`.

### V33 — decimals, extra numbers, and the join rule

- Input and result, after the voice cleaner (executed):

  | Utterance | Result | What a log should store |
  | --- | --- | --- |
  | `one thirty five` | `135` | 135 (this one matches the comment in the function) |
  | `135.5` | `1355` | 135.5 |
  | `10.5` | `105` | 10.5 |
  | `1 2 3 4` | `1234` | 1234 if spoken as digits |
  | `1 2 3 4 5` | `1` | 12345 |
  | `one two` | `3` | 12, the same intent as `1 2` |
  | `ten reps at one thirty five` | `46` | reps 10, weight 135 |
  | `one thirty five pounds for ten` | `145` | weight 135 (the `ten` is added because the weight branch sums the whole phrase) |
  | `two forty five` | `245` | 245 |
  | `twelve fifty` | `62` | 1250 (the plate hack refuses `current >= 10`) |
  | `oh five` | `5` | 05 / 5; "oh" is not in the map |

- Expected: the number next to the intent keyword, with a decimal point preserved. `1 2` and `one two` agree.
- Actual: `handleVoiceCommand` turns `135.5` into tokens `135` and `5`, and `parseSpokenNumber` concatenates them to `1355`. On the weight branch that calls `updateWorkoutSet(..., 'actualWeight', 1355)`. On the bare-number branch it writes `actualReps` and then `toggleWorkoutSet`, so a decimal rep count completes the set at 105 or 1355 reps.
- `ten reps at one thirty five` has no `weight`/`lb`/`pound` token, so it falls through to the reps branch. The summed value `46` is stored as reps and the set is marked done. Weight is untouched.
- `one thirty five pounds for ten` hits the weight branch (`\bpounds?\b`). The sum is 145. Reps stay whatever they were. `updateWorkoutSet` then `parseFloat(145)`, which is fine; the damage is already in the number.

`zero` returns `0`. The weight branch checks `n !== null`, so "weight zero" stores 0 (V06 then hides it). The rest branch checks `if (n)`, so "rest zero" does not start a timer.

### V34 — "done" and "finish" hit the wrong action

- Input: rest timer running, transcript `done`. Also, timer idle, transcript `finish`, and transcript `good morning`.
- Expected: `done` during rest matches the help text and the skip list (dismiss the timer). `finish` calls `finishWorkout`, the same verb as the Finish button. `good morning` is not a set completion.
- Actual: the skip test (~3432) is `\b(skip|stop|dismiss|clear|done with rest)\b`. `done` alone does not match. Execution falls through to the complete-set test (~3496), `\b(done|complete|completed|finished|finish|got it|good)\b|\bnext\b`, and `toggleWorkoutSet` marks the next open set done. The rest interval keeps running (and may be stacked, V18).
- `finish` matches that same complete-set test and toggles one set. It does not call `finishWorkout`.
- `good morning` matches `\bgood\b` and completes the current set.
- `next exercise` is safe only because the next-exercise test is earlier and returns. Bare `next` misses that test (`next` must be followed by `ex`) and completes the set.
- `add a set of 10` matches the add-set test first and returns. The `10` is ignored. The new set copies the previous load, including the `|| 10` reps bug (V06).

### V35 — units are dropped

- Input: `rest one minute`, `rest two minutes`, `rest 1 minute 30`.
- Expected: 60 seconds, 120 seconds, 90 seconds.
- Actual: the rest branch (~3472) takes `parseSpokenNumber` of the whole phrase and passes it to `startRestTimer` as seconds. `one` → `1`. `two` → `2`. `rest 1 minute 30` has digit tokens, so the function returns the first digit, `1`. The timer is 1 second. There is no `minute` entry in the word map.

---

## Screenshot parsing

`parseWorkoutText` (~4194). Set matchers, first hit wins, none of them anchored:

- `@` / `at`: `(\d+) ... (@|at) ... (\d+)` → reps, weight. Reps are integers.
- `x` / `×`: `(\d+) ... x ... (\d+)` → weight, reps.
- Bare `^(\d+)\s+(\d+)$` → reps, then weight.

A line is a new workout when it matches `push|pull|legs|upper|lower|full|chest|back|shoulder|arm|day|workout` and is not a set, or when it matches the date regex and is shorter than 40 characters. `arm` and `day` are substrings.

Recovered sets are `completed: true`. Preview volume (~4183) is `actualReps * actualWeight` with the same sign/product behaviour as `setVolume`.

### V36 — ordinary exercise names close the workout

- Input, and whether the title regex matches (executed):

  | Line | Treated as a new workout |
  | --- | --- |
  | `Push-Up` | yes (`push`) |
  | `Lat Pulldown` | yes (`pull`) |
  | `Tricep Pushdown` | yes (`push`) |
  | `Cable Pull-Through` | yes (`pull`) |
  | `Chest-Supported Row` | yes (`chest`) |
  | `Barbell Back Squat` | yes (`back`) |
  | `Shoulder Press` | yes (`shoulder`) |
  | `Monday Bench` | yes (`day`; `Monday` itself contains `day`) |
  | `Warm-up set` | yes (`Warm` contains `arm`) |
  | `Full Body` | yes (`full`) |
  | `Bench Press` | no |
  | `Hammer Curl` | no |
  | `Plank` | no |

- Expected: those lines become exercises under the current workout, and the following `135 x 10` attaches to them.
- Actual: `parseWorkoutText` pushes the previous workout, sets `currentExercise = null`, and `continue`s. The next set line has a set match but no `currentExercise`, so it is not logged. It then fails the "looks like an exercise" length test only if it is a pure set; a pure `135 x 10` becomes an exercise named `135 x 10` with no sets, and the final filter drops empty exercises. `Push-Up` and its sets disappear. `Bench Press` above it survives in the previous workout.
- A line of 60 or more characters is also skipped as an exercise name (`line.length < 60`). Its following sets attach to the previous exercise.
- A paste with no title line never creates `current`, so every exercise and set is dropped. The toast is "Could not detect any workouts."

### V37 — `@` and `x` match a substring

- Input and `matchSet` result (executed against the same regexes):

  | Line | Stored |
  | --- | --- |
  | `5 @ 225` | 5 reps @ 225 |
  | `135 x 10` | 135 lb × 10 reps |
  | `10 x 135` | 10 lb × 135 reps |
  | `8.5 @ 135` | 5 reps @ 135 (the match is the substring `5 @ 135`) |
  | `135 x 8.5` | 135 lb × 8 reps |
  | `135 x 8-12` | 135 lb × 8 reps |
  | `135 x 5 @ 8` | 5 reps @ 8 lb (the `@` regex runs first) |
  | `3 sets of 10 @ 135` | one set, 10 @ 135 |
  | `Set 1: 135 x 10` | 135 × 10 (works; the regex is unanchored, so the `Set 1:` prefix does not matter) |

- Expected: `8.5 @ 135` is 8.5 reps at 135. `135 x 5 @ 8` is 135 lb × 5 at RPE 8. `3 sets of 10 @ 135` is three sets. `10 x 135` follows one declared convention.
- Actual: the values in the table. Volume of a swapped `10 x 135` is still `10 * 135 = 1350`, so the preview total looks right while `getAvgIntensity` (V30) and the MET multiplier (V14) see a 10 lb set of 135 reps. Fractional reps are not representable: the reps groups are `\d+` only.

### V38 — kilograms and "3x10" are pound math

- Input: `100 kg x 5`, `5 @ 100kg`, `3x10`, `• 3x10`.
- Expected: kilograms converted (100 kg → 220.462 lb) before a total labeled `lbs`. `3x10` on a bodyweight line is 3 sets of 10, or 10 reps at 0, not 3 pounds.
- Actual: both regexes allow an optional `kg` suffix and never multiply by 2.20462. Stored weight is 100. Preview text says `lbs`. `3x10` hits the `x` regex as weight 3, reps 10, one set, volume 30. The comment above `stripNoise` cites `• 3x10` as a line the parser is meant to recognize; recognition succeeds and the meaning is wrong.

### V39 — dates come out invalid or in the wrong year

- Input and `extractDate` (executed):

  | Text | Returned |
  | --- | --- |
  | `11/3/2026` | `2026-11-03` |
  | `3/11/2026` | `2026-03-11` (month/day fixed as US, so 3 Nov and 11 Mar are the same shape) |
  | `13/01/2026` | `2026-13-01` (invalid month) |
  | `2026-11-03` | `2003-26-11` (the matcher takes `26-11-03`, the 2-digit year `03` becomes `2003`) |
  | `Nov 3, 2024` | `2026-11-03` (month name keeps the day, replaces the year with `getFullYear()`) |
  | `December 15, 2024` | `2026-12-15` |
  | `11/3/99` | `2099-11-03` |
  | `Push Day 11/3/2026` | date `2026-11-03`; the name replace uses an anchored date regex, so a date that is not at column 0 stays inside the workout name |

- Expected: ISO dates stay ISO, month names keep their year, day 13 in the first slot is day-month or a hard error, and `formatDate` of the result is that civil day.
- Actual: the strings above are what get stored. `formatDate("2026-13-01")` and `formatDate("2003-26-11")` are `Invalid Date`. The calendar key is the first 10 characters of that invalid string, so the workout is not on any real day. It still sits in `state.workouts` and still adds volume.

### V40 — every recovery is one hour long

- Input: a one-set note, or a two-hour session, parsed by `parseScreenshotText`.
- Expected: duration unknown, so calories are omitted, or a duration parsed from the text.
- Actual: `parseWorkoutText` sets `duration: 3600000`, `startTime` and `endTime` both `Date.now()` (their difference is ~0, which contradicts `duration`). `importParsedScreenshots` pushes that object. `viewWorkoutDetail` then calls `estimateCalories` with 3600 seconds: about 408 kcal at the default body weight and MET 5 (muscle is `''` on recovered exercises, so the default MET is certain). `importParsedScreenshots` dedupes on `(date slice, lowercased name)` and skips the duplicate. A second session on the same day with the same title is dropped.

---

## CSV and other numeric imports

`exportWorkouts` writes one row per set: date, name, duration minutes, exercise, muscle, set index, type, weight, reps, completed `1`/`0`. Weight and reps use the `??` fallback (V07). Numbers are not passed through the quote helper.

`importWorkouts` groups rows by `date + "\0" + name` (a literal NUL). Duration is taken from the first row of the group. `completed` defaults to `true` when the column is absent, otherwise `/^(1|y|yes|true)$/i`.

### V41 — the importer's numeric rules contradict the zero comment

- Input rows (detailed header present):
  - weight `-45`, reps `-5`, completed `1`
  - weight `1,234.5`, reps `8.5`, completed `1`
  - weight `Infinity`, reps `10`, completed `1`
  - weight `NaN`, reps `10`, completed `1`
- Expected: negatives rejected; thousands separators honored; `8.5` reps kept; non-finite cells rejected. A real `0` stays `0`.
- Actual:
  - `parseFloat("-45") || 0` is `-45`. `parseInt("-5", 10) || 0` is `-5`. Both are truthy. The set is stored and V01 turns it into `+225` lb of volume.
  - `parseFloat("1,234.5")` is `1`. `parseInt("8.5", 10)` is `8`. A 1,234.5 × 8.5 set is imported as 1 × 8.
  - `parseFloat("Infinity")` is `Infinity`, kept (V03, V05).
  - `parseFloat("NaN")` is `NaN`, and `NaN || 0` is `0`. Infinity survives a round trip; NaN becomes 0.
  - A genuine `0` weight is kept (`parseFloat("0") || 0` is `0`), which matches `setVolume` and contradicts the measurement importer (V23).

`parseInt("0x10", 10)` is `0`. A hex-looking reps cell imports as 0 reps.

### V42 — duplicates, merges, and the first duration

- Input: import the same file twice. Separately, two real sessions that share the date string `2026-11-03` and the name `Push`, with the duration cell blank on row 1 and `45` on row 2.
- Expected: a second import does not double lifetime volume. Distinct sessions stay distinct. Duration is the max, or the value from any row that has one.
- Actual: `importWorkouts` ends with `state.workouts.push(...workouts)` and has no identity check. Screenshot import does dedupe (V40); CSV import does not. Totals double.
- The group key is the raw date string plus NUL plus name. Two `Push` sessions on `2026-11-03` become one workout. The NUL is also a raw `U+0000` in `index.html` (~4059), which is why some search tools stop and call the file binary.
- Duration is assigned only inside `if (!w)`. The blank first cell is falsy, so `duration` is `null`, and the later `45` is ignored. After import, V15 treats that as "no duration".

Re-imported sets get `rest: 90` regardless of the original rest. The set index column is not read; order is file order.

### V43 — measurement columns are positional

- Input: a CSV whose header is `Date,Waist,Weight,...` with a first data row `2026-11-03,32,180`.
- Expected: waist 32, weight 180, matched by header name. `exportMeasurements` writes names in `MEASUREMENT_FIELDS` order, and a reordered file still means what its header says.
- Actual: `importMeasurements` (~4105) parses the header and never uses it. Column `j` is written to `MEASUREMENT_FIELDS[j-1]`. Column 1 is always `weight`. The row stores `weight: 32`, `bodyFat: 180`. `getMeasurementTrend` then scores a 32 lb body weight. `parseFloat` prefix rules from V04 apply (`"32in"` → 32). Cells `<= 0` are dropped (V23).

Export writes each value unquoted. A number has no comma, so the app's own file round-trips the positions. A spreadsheet that reorders or inserts a column does not.

### V44 — "done" means not done

- Input: a detailed CSV whose Completed cells are `done`, `x`, `complete`, or `2`. Also a file with no Completed column.
- Expected: those words import as completed. A missing column is the ambiguous one and should not silently complete every set.
- Actual: the test is `/^(1|y|yes|true)$/i` only when the column exists. `done`, `x`, `complete`, and `2` are all false. Every set imports with `completed: false`. `setVolume` then returns 0 for the whole file, and V12 can still assign calories if a duration is present. When the column is absent, `completed` is forced `true`, so a weight/reps file with no flag counts every row toward volume, including warm-ups (V10).

### V45 — heart rate uses the workout instant, and string bpm values concatenate

- Input: workout `date: "2026-11-04"` (date-only), duration 1 hour, samples at local Tuesday evening in Los Angeles with numeric `bpm`. Separately, samples `{ bpm: "80" }`, `{ bpm: "90" }`, `{ bpm: "100" }` inside a window that does match.
- Expected: the window is the local session. Average of 80, 90, 100 is 90. `bpm` of 0 or a non-number is ignored.
- Actual: `getHeartRateForWorkout` (~3906) sets `start = new Date(workout.date).getTime()`. For a date-only string that is UTC midnight (V25), i.e. Tuesday 16:00 in Los Angeles on the previous calendar day. `end = start + duration`. Samples from the user's actual Wednesday session can miss the window; samples from Tuesday afternoon can hit it. A missing `duration` uses `start + 3600000` (one hour). A negative duration makes `end < start`, so the filter returns nothing.
- `s.bpm > 0` is true for the string `"80"`. `bpms.reduce((a, b) => a + b, 0)` does `0 + "80" = "080"`, then `"080" + "90" + "100" = "08090100"`. `Math.round(that / 3)` is `2696700`. The modal shows an average heart rate of 2,696,700. JSON numbers are fine; string bpm values in the imported file are not. `Math.min`/`Math.max` coerce and stay correct, so min and max can look sane next to a ruined average.

---

## Dead schedule math

### V46 — the split projector trains one day per cycle

- Input: a template whose name contains `Push/Pull/Legs` (`SPLIT_TYPES` days = 6), last workout date present, `buildUpcomingSchedule(14, {})`.
- Expected: a 6-on / 1-off cycle (or whatever the product defines for PPL), and the function actually rendered.
- Actual: nothing in `index.html` calls `buildUpcomingSchedule`. If it were called, `restDays = 7 - splitDays` and the workout test is `daysSinceLast % (restDays + 1) === 0`. That is one training day followed by `restDays` rest days, not `splitDays` training days. Executed over 14 days (`W` = planned, `r` = rest), starting at day 1:

  | Split | days | pattern |
  | --- | --- | --- |
  | PPL | 6 | `r W` repeating (1 on / 1 off) |
  | Upper/Lower | 4 | `r r r W` repeating |
  | Full Body | 3 | `r r r r W` repeating |
  | Bro | 5 | `r r W` repeating |

  The anchor date is `substring(0, 10) + "T00:00:00"` (local midnight of the UTC prefix, V26). An invalid anchor makes `daysSinceLast` `NaN`, `NaN % n` is `NaN`, and `=== 0` fails, so every projected day is rest.

---

## Zero, non-finite, and partial-parse matrix

Same class of input, six policies:

| Input | `setVolume` (`??`, then `*`) | `updateWorkoutSet` (`parseFloat \|\| 0`) | `addSetToWorkout` (`\|\|`) | `importWorkouts` | `saveMeasurement` / `importMeasurements` | `estimateCalories` body weight (`\|\| 180`) |
| --- | --- | --- | --- | --- | --- | --- |
| `0` | stays 0, volume 0 | stores 0 | reps become 10 | stores 0 | dropped | becomes 180 |
| `""` / missing | `""` blocks fallback and yields 0; `null`/`undefined` fall back to planned | stores 0 | falls back to 10 reps | empty reps → 0 | dropped | missing → 180 |
| `-5` | kept; two minuses become a positive volume | stored | copied (truthy) | stored | dropped | stored; calories go negative |
| `135abc` | `*` yields `NaN` if the string is already stored | stores 135 | copies 135 | stores 135 (`parseInt` reps too) | stores 135 | `parseFloat` stores 135 |
| `1,234.5` | numeric multiply | `parseFloat` → `1` if passed as text | — | weight `1` | weight `1` | — |
| `Infinity` | poisons the sum | stored (`Infinity \|\| 0`) | copied | stored | `Infinity > 0`, stored | — |
| `NaN` | poisons the sum | stores 0 | `NaN \|\| 10` is 10 | stores 0 | dropped (`isNaN`) | `NaN \|\| 180` is 180 |

Duration adds a seventh policy: `Number(cell)` (no prefix parse), then `0` and `NaN` are later treated as "missing" by every `w.duration ?` test, and Apple Health replaces that missing value with `90 * completedSets` seconds.

---

## What is consistent

- `setVolume` does keep a numeric `0` when the field is `0` and not `""`, and it does fall back for `null` and `undefined`. The bugs are the other operators around it.
- `one thirty five` and `two hundred thirty five` parse as 135. The plate special case works while `current < 10`.
- `5 @ 225` and `135 x 10` and `Set 1: 135 x 10` match the convention the comments describe.
- A full ISO workout timestamp formats on the correct local civil day. The calendar key is the part that moves it.
- `importParsedScreenshots` refuses a second copy with the same date prefix and name. CSV import does not.
- `parseCSVLine` handles quotes and doubled quotes. The numeric bugs above happen after a successful split.
- `finishWorkout` refuses to archive a session with zero completed sets. Imports are the path that creates that shape anyway (V12).
