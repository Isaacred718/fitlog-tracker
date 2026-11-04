# FitLog / Lift Tracker — Break-Test & QA Pass, 2026-11-03

Adversarial QA in the same style as the HOLOPLOT pass: three independent
break-test lanes designed vectors from the code, every confirmed defect was
patched in the same pass, and the patched build was exercised in real
Chromium and WebKit engines (Playwright, iPhone viewport, America/New_York).

## Lanes

| Lane | Source | Vectors |
| --- | --- | --- |
| Data & State | subagent, code-reading | 37 (`qa/lane-data-state.md`) |
| Interaction & Timing | subagent, code-reading + node-verified parsers | 38 (`qa/lane-interaction.md`) |
| Calculations & Consistency | Grok on the idw-1 Mac cluster (hit its free usage limit after writing the full report) | 46 (`qa/lane-grok-calculations.md`) |

121 vectors total, with overlap between lanes. Cluster note: of the Mac
agents, only Grok was usable that day (Claude not logged in, Codex 401,
Gemini config error, OpenCode/Pi unresponsive, Linux guest waiting on a
Tailscale check).

## Headline fix: home-screen Google sign-in (paste-a-code)

Root cause: iOS standalone web apps have storage isolated from Safari, so
the OIDC token that landed in Safari could never reach the home-screen
app. Per Isaac's decision, standalone mode stays and sign-in now works by
carrying a code across:

- `auth.html` shows an `LT1.` sign-in code with a Copy button (and keeps
  "continue in Safari" as a secondary path).
- Settings gains a "Paste sign-in code" field in standalone mode.
- The app verifies the token's issuer, audience, expiry, and the nonce
  and `state` it stored before leaving (both were previously unchecked;
  the nonce was generated and never read anywhere).
- The stored token is no longer deleted before the sign-in attempt runs.
- Starting the OIDC trip no longer requires the Firebase SDK to be
  loaded; a bad code is reported as bad immediately, a good code gets a
  grace window for the SDK.
- `auth.html` is no longer auto-redirected away before the code is seen.

## Defects patched (by area)

**State & persistence** — schema-v2 state is now sanitized on every load
(wrong-typed collections, per-record coercion, duplicate-id repair);
`saveState()` reports quota failures instead of silently losing data;
corrupt-state backups are pruned to one.

**Sync** — saves inside the 2 s debounce window are queued and flushed
instead of dropped; locally edited records no longer lose to their own
stale cloud copies; payloads are scrubbed of undefined/non-finite fields
that used to reject whole batches; Clear All Data now tombstones cloud
records so cleared data cannot resurrect, with an adoption guard for
records the cache never knew; legacy blob is only deleted when adopted
or genuinely older; `docIdFor()` appends a hash so distinct ids cannot
collide into one document, and cloud docs are keyed by record identity
so the format change cannot duplicate a library; Firebase config imports
are validated and honestly applied (reload when one is already running).

**CSV / imports** — formula-injection neutralisation on both exports;
import dedupe by workout signature; strict number parsing (`135abc`,
`-50`, `1e999` become 0 instead of 135 / negative / Infinity); dates
validated; measurement import maps columns by header name; file-size
caps; heart-rate samples validated and deduped by instant; the Completed
column also accepts `done`/`complete`/`x`.

**Timers & workout flow** — rest-timer interval leak fixed (a second
start no longer ticks at double speed); rest timer persists across
reloads; finishing or discarding a workout stops the elapsed clock, the
rest timer, and the microphone; starting a workout over one in progress
asks first; calendar "Log Workout" now applies the selected date;
confirm dialogs queue instead of silently replacing each other and
disarm on cancel; template-editor closes confirm before discarding
unsaved edits; set inputs are clamped (no negative/fractional/absurd
values); template move bounds checked; `showView` renders before
committing navigation.

**Voice** — decimals survive (`225.5` is 226 reps, not 2255; "two point
five" is 2.5); "rest one minute" is 60 s; "rest zero" and "done" stop
the timer instead of completing a set; "good morning" no longer
completes a set; voice-set values are clamped.

**Calculations & dates** — `setVolume` coerces operands (negative ×
negative, Infinity, and string concatenation can no longer poison
totals; empty-string actuals fall back to planned values like missing
ones); one `formatVolume` everywhere (40 lb no longer displays as
"0.0k"); `formatTime` rolls into hours and clamps negatives; calories:
Biceps/Triceps/Glutes/Cardio got real MET values, zero completed sets
burn zero, body weight is validated (0/negative no longer store or
compute), workout duration is capped at 12 h; one local-day key
(`localDateKey`) drives `formatDate`, the calendar, and the dashboard
week, so evening workouts stop landing on the wrong day; the dashboard
week is the same Monday–Sunday window the calendar shows, with an end;
the calendar day panel lists every workout that day; profile Body
Trends read `values` in date order (they previously read properties
that don't exist and never rendered); strength trend compares
chronological halves with numeric coercion; coaching weaknesses include
never-trained muscles and never overlap strengths; "400% more" for a
4× gap is now 300%; measurement trends treat 0 as a real value, tiny
changes show flat, and hips count as lower-is-better; screenshot
recovery converts kg to lb, treats a bare "3x10" as sets × reps,
parses ISO dates correctly, validates dates, and no longer fabricates
a 1-hour duration.

**XSS** — `escHtml` (now also escaping single quotes) is applied across
exercises, workouts, templates, history, calendar, dashboard, profile,
nutrition, coaching cards, and the cloud account card (previously used
in only a handful of places), and cloud-adopted records are sanitized
on arrival.

**Service worker** — the APP_UPDATE toast was dead code (its condition
could never be true where it lived); it now fires from the navigation
branch. A failed CDN script fetch no longer falls back to `index.html`
(which the browser then parsed as JavaScript).

**Also found by the rig** — the Settings body-weight field is static
HTML whose `value="${...}"` was never interpolated, so it always
rendered blank; it now syncs from state on render.

## Considered and deliberately not changed

- Warm-up sets count toward volume (V10): they are real work moved;
  the set type is already shown in the detail view.
- CSV export keeps whole minutes (V16): the column is labelled
  "Duration (min)"; changing the format would break re-import of
  existing exports.
- Plank `durationSeconds` contributes no volume (V20): timed holds
  have no load × reps volume; calories still accrue via wall-clock
  duration.
- Chest/neck trend direction left as higher-is-better (goal-dependent,
  unlike waist/hips girth).
- `buildUpcomingSchedule` split projection (V46) is dead code — never
  called; left in place rather than deleted blind.
- A 0 measurement value still cannot be *entered* (weight/circumference
  of 0 is not a measurement), but stored 0s now render and trend
  correctly.

## Verification

- `qa/regression.mjs` — 32 checks per engine (corrupt state, XSS, timer
  leak + persistence, voice, clamps, guards, confirm queue, dates,
  calendar, analysis, CSV import/export, volume/calorie math):
  **all pass in Chromium and WebKit**, zero page errors.
- `qa/ui-exercise.mjs` — every nav view tapped, template dirty-guard,
  full template → workout → set → finish flow by taps, quick timer:
  **all pass in both engines**.
- `qa/auth-test.mjs` — 13 checks per engine for the paste-a-code flow:
  all client-side checks pass in both engines. The one live-network
  case (a correctly bound but fake-signed code must be rejected by
  Firebase itself) passed when the test rig's proxy let the Firebase
  CDN through, and reports "Sign-in is not ready yet" (no crash, no
  false success) when it does not; the rig's proxy intermittently
  tunnel-fails `www.gstatic.com` for both the original and patched
  builds.
- Baseline parity: the unmodified app and the patched app both boot
  with zero page errors on a clean load.

## Not testable in the rig (needs Isaac's iPhone)

- The real standalone round-trip: home-screen app → Safari code page →
  copy → paste back. The code format, verification, and UI were all
  exercised in-engine with fabricated tokens; only a real Google-issued
  token on the device settles it end to end.
- Real finger interactions, the file pickers, and voice recognition
  itself (the parser and routing were tested; the microphone was not).
- Firestore merge behaviour against the live project (merge logic was
  code-reviewed and unit-reasoned; no test account was available).
