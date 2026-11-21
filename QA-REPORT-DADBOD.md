# Dadbod Fitness redesign — QA pass (2026-11-21)

Scope: PR #2 (redesign/dadbod-liquid-glass, merged as f8ab6e1) — deep QA of the
React app in app/, fixes, and a working live deployment. Method: two
token-bounded cluster lanes on idw-2 (OpenCode UI/interaction review, Claude
parity review) plus a local Playwright rig in Chromium and WebKit at iPhone
size (390x844, America/New_York) driving every control against a realistic
legacy payload (qa/legacy-payload.mjs).

## The headline fix: saved data now actually carries over

The PR claimed "same localStorage key and shape", but the store persisted to
a new key (liftTracker-v3, zustand envelope) while every existing user has
their history under liftTracker (raw schema v2). The redesign opened empty.
app/src/lib/legacy.ts now migrates on first launch: workouts, templates and
an in-progress session are converted (null actuals fall back to planned
numbers, matching the legacy app's own math; unknown set types repaired;
renamed exercises remapped — bench-press -> barbell-bench-press,
face-pulls -> face-pull, barbell-bicep-curl -> barbell-curl,
barbell-back-squat -> barbell-squat, plus name matching) and the weekly plan
is rebuilt from the Push/Pull/Leg template names. The legacy key is never
touched: the root app still owns it (sync, measurements, heart-rate data the
redesign does not model yet). 10 new unit tests cover the converter.

## Defects fixed

- Toast/Undo composition (found by the rig, worse than the lane's version):
  snapshot-based Undo restored whole prior states, so undoing two queued
  deletes in order resurrected the first delete's collateral — a deleted
  template's plan slot was silently re-deleted. All destructive Undos are
  now surgical inverses that compose in any order; discard-workout Undo no
  longer resurrects over a newer session; removeSet no longer shows an
  "removed" toast when it refuses (last set).
- A second toast no longer discards the first toast's Undo: toasts queue.
- Malformed route (#/library/templates/%ZZ) crashed rendering on an
  unguarded decodeURIComponent; now falls through to Template not found.
- Sheet refocused its panel on every parent render (inline onClose),
  stealing focus from the picker search; focus/trap now run once on mount.
- Stepper number input ignored its step prop (hard-coded 0.5/1); the weight
  dock's keyboard step is now the configured 5, template rest 15.
- completeSet was not idempotent (re-completing restarted the rest timer);
  uncompleteSet left the rest timer running. Both fixed.
- Deleting a template left dangling weekPlan/planOverrides references;
  they are cleared on delete and restored by its Undo.
- Missed-session banner: "Move to today" onto an already-trained today
  buried the session (day reads done, session never surfaces); the banner
  now targets tomorrow in that case.
- Backup export omitted activeWorkout and planStart, and there was no way
  to restore a backup at all. Export is complete and Settings now has a
  validated Restore (reuses the migration converter as the normalizer).
- finishWorkout duration capped at 12h, matching the legacy app.
- Root app: last "Lift Tracker" strings renamed to Dadbod Fitness
  (settings subtitle, wrong-app error, iOS sign-in notes, auth.html code
  page); service worker cache bumped to lift-tracker-v9.

## Deployment

GitHub Pages serves the repo root, so the React app was not reachable live
(/app/ serves the raw Vite source, which cannot run). The production build
is now committed at app/dist/ (base './', hashed assets) and live at
https://isaacred718.github.io/fitlog-tracker/app/dist/. The root app remains
the production PWA, unchanged except the renames above. app/README.md
documents the rebuild-and-commit-dist step.

## Verification

- Unit: 22 vitest tests pass (12 pre-existing + 10 migration).
- Migration rig (qa/dadbod-migration.mjs): legacy payload loads with ids,
  templates, planStart and set-level conversion intact in both engines;
  legacy key byte-identical afterwards.
- UI rig (qa/dadbod-ui.mjs): 72 checks, all passing in Chromium and WebKit —
  missed-banner move, prefill (185 from last session), stepper/chip/keyboard
  editing, rest timer +15s/Skip, finish flow (volume 2,835 lb, PR flag),
  catalog bests from migrated data (Bench 150, Squat 195), search focus,
  delete/undo composition, malformed route, backup export/import round
  trip, persistence across reload, legacy app coexistence.
- Touch targets measured: nav 58px, week strip 74px, steppers 64px, plate
  chips 56px, Done 64px — the 56px claim holds.
- Zero page errors across all flows in both engines.

## Lanes

- OpenCode (idw-2): 12 findings (qa/lane-ui.md) — 10 fixed above; the
  PlanScreen "log another session" branch was adjudicated as intended
  behavior once dangling template refs were fixed; the empty-sheet focus
  trap edge was fixed with the Sheet change.
- Claude parity lane stopped early: it misread the clone state and halted
  rather than guessing. Parity was closed directly instead — volume and
  duration semantics, finish behavior, set-field normalization and the
  exercise-id alias table were all verified against the legacy source and
  are embodied in the converter and its tests.

## Still open (unchanged from the PR's own follow-up list)

- The React app has no Firebase sync, supersets UI, set-type editing or
  voice; the root app keeps those and remains the production PWA. Root
  cutover stays gated on migration step 4 (sync) in app/README.md.
- The React catalog lists 19 exercises vs the legacy 214; migrated history
  for other exercises displays everywhere, and recent exercises (including
  custom ones) are offered in the workout screen, but the Library catalog
  and picker only cover the 19.
- Measurements, heart-rate data and profile stay only in the legacy save.
- Moving a missed session onto a day with a different planned session
  replaces that day's plan (explicit user action; accepted).

## Addendum (2026-11-21, later): root cutover + video guides

At Isaac's word the redesign was promoted to the root: the production build
now sits at the repo root (index.html + assets/), so the main Pages URL and
the installed home-screen app serve Dadbod Fitness. The classic app is
preserved byte-for-byte at legacy.html and auth.html returns there, keeping
its sync and paste-code sign-in flow self-contained. Service worker bumped
to lift-tracker-v10; its offline fallback now answers only navigations with
the app shell (a failed module script gets a 504, never HTML). The redesign
also links the PWA manifest (absolute path, valid from root and /app/dist/).

This also explains the "looks different as a web app" report: the manifest
start_url always pointed at the root, so a home-screen save opened the
classic app while Safari showed the /app/dist/ preview. The redesign itself
was already standalone-ready (viewport-fit=cover, safe-area insets
throughout).

Restored from the classic app at Isaac's request: the per-exercise video
guide. The classic exercise detail linked "Watch Video Guide" to a YouTube
search for "<exercise> exercise form tutorial"; the redesign now has the
same link as a play button on every Library catalog row and a "Video guide"
action on the active workout card (lib/videoGuide.ts, components/
VideoGuide.tsx, unit-tested URL construction).

Verification for the addendum: 24 unit tests; qa/dadbod-root.mjs (root
serves the redesign with migration, legacy.html boots the classic app with
its data, zero page errors), qa/dadbod-video.mjs (Library and workout-card
links match the classic URL byte-for-byte and open YouTube in a new page),
and the full migration + UI suites — all passing in Chromium. WebKit could
not be re-run in this pass: the sandbox VM's WebKit build is missing a
system library (libgstgl) and the package manager is in a broken state;
the identical app shell passed both engines the same morning, and today's
changes are markup/links verified in Chromium.
