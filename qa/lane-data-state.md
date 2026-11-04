# FitLog / Lift Tracker — Adversarial QA: Data & State Lane

**Target:** `index.html` (5,059 lines, single-file vanilla JS PWA) + `auth.html`, repo `Isaacred718/fitlog-tracker` at `ab155de`.
**Method:** line-by-line code reading of the persistence, sync, import/export and auth-handoff code. No app files were edited. Each vector gives the exact malformed input/state, the expected correct behaviour, and what the code as written actually does, citing function names and line numbers.
**Status key:** **CONFIRMED** = the defect follows directly from the code as written. **NEEDS-RUNTIME** = code structure creates the hazard, but the exact outcome depends on browser/Firestore SDK behaviour and must be reproduced in a browser to close.
**Persistence map (for reference):** state in `localStorage['liftTracker']` (`defaultState`/`loadState`/`migrateState`/`saveState`, lines 1052–1115, `saveState` wrapped by `stampLocalUpdate` at 1943–1952); Firebase config in `localStorage['liftTrackerFirebase']` (1129–1149, 1338–1401); sync cache in `localStorage['liftTrackerSync']` (1589–1602); Firebase session mirror under `fbss:` prefix (1174–1199); iOS OIDC handoff keys `liftTrackerGoogleIdToken` / `liftTrackerAuthPending` / `liftTrackerOauthNonce` (1201–1336, `auth.html`).

---

## A. Persisted state: load, migrate, save

### 1. Wrong-typed collections with `_schemaVersion: 2` bypass all validation and crash the app
- **Input/state:** `localStorage['liftTracker']` =
  `{"_schemaVersion":2,"workouts":"not-an-array","templates":[],"measurements":[],"customExercises":[],"settings":{},"profile":null,"heartRateData":[]}`
  (also reproduces with `"workouts":{...}`, `"workouts":null`, `"templates":null`).
- **Expected:** per-field type validation on load; a non-array collection is quarantined/replaced with `[]` and the rest of the state loads.
- **Actual (CONFIRMED):** `loadState()` (1068) only checks `parsed` is a non-null object, then blindly spreads it: `state = {...state, ...parsed}`. `migrateState()` (1089) returns immediately because `current === SCHEMA_VERSION`, so its `state.workouts = state.workouts || []` repairs never run. The string/null then detonates downstream: `renderDashboard()` calls `state.workouts.filter(...)` (2043), the boot-time first-run seeding at line 4358 reads `state.templates.length`, `exportWorkouts()` calls `state.workouts.length`/`.forEach`. One wrong-typed field white-screens or half-kills the app, and every subsequent `saveState()` re-persists the poison unchanged.

### 2. The v1→v2 migration itself only repairs *falsy* wrong types
- **Input/state:** `{"_schemaVersion":1,"workouts":"x","measurements":42,"settings":"gym","customExercises":{}}` (no `_schemaVersion` at all behaves the same).
- **Expected:** migration normalises every collection to an array and `settings` to an object regardless of the incoming value.
- **Actual (CONFIRMED):** `migrateState()` (1092–1101) uses `state.workouts = state.workouts || []` etc. Truthy wrong types (`"x"`, `42`, `{}`) survive untouched; only `null`/`undefined`/`0`/`""` are replaced. The migration then stamps `_schemaVersion = 2`, permanently locking the corrupt shapes behind the Vector-1 early return on all future loads.

### 3. Future or string schema versions are silently accepted and mangled
- **Input/state:** three variants: `{"_schemaVersion":999, ...v3-shaped data}`, `{"_schemaVersion":3,...}`, `{"_schemaVersion":"2",...}`.
- **Expected:** a version newer than the app understands is refused/preserved untouched (never overwritten by an older app); a string version is coerced or rejected.
- **Actual (CONFIRMED):** in `migrateState()` (1090–1101), `999 === 2` is false and `999 < 2` is false, so nothing runs — but nothing complains either, and the trailing `localStorage.setItem` plus every later `saveState()` re-serialises the future data through v2 code paths (renders, sync) that can drop fields they don't know. `"2"` fails the strict `===` check and the `< 2` check (`"2" < 2` is false), so it is treated exactly like a future version. There is no "data from a newer version" guard anywhere.

### 4. Top-level JSON array passes the corruption check
- **Input/state:** `localStorage['liftTracker'] = '["x","y"]'` and `'[1,2,3]'`.
- **Expected:** anything that is not a plain state object is treated as corrupt (backup + defaults), as happens for primitives.
- **Actual (CONFIRMED):** `loadState()` (1073) checks `!parsed || typeof parsed !== 'object'` — an array *is* an object, so it passes. `{...state, ...["x","y"]}` produces a state with stray numeric keys `0`/`1` and default collections; the stray keys are then persisted forever by `saveState()` and uploaded inside records' parent state handling. Primitives (`'123'`, `'"hello"'`, `'null'`) do hit the catch path — the array case is the hole in the same check.

### 5. Corrupt-state backup is unbounded, unpruned, and fails exactly when storage is full
- **Input/state:** repeatedly corrupt `liftTracker` (or one corruption when localStorage is already near quota).
- **Expected:** one rolling recovery copy; if the backup write itself fails, the user is told their data could not be preserved before the original is removed.
- **Actual (CONFIRMED):** the `loadState()` catch block (1077–1085) writes `liftTracker_corrupt_<Date.now()>` on *every* failed load, never deletes old copies — each boot with a re-corrupting sync/import adds another full copy until quota pressure breaks normal saves (see Vector 7). Worse, the backup write is wrapped in `catch(_) {}`, and the code then unconditionally `removeItem('liftTracker')`: when the backup fails *because storage is full* — the most likely corruption scenario — the original is deleted with no copy and no message. The comment "Preserve the corrupt blob for recovery" is not what happens in that case.

### 6. Nested record corruption: one bad record poisons every render, export and sync — no per-record isolation
- **Input/state:** `workouts: [{id:"a", name:"OK", exercises:[...valid...]}, {id:"b", name:"Bad", exercises:"oops"}]`, plus variants: a measurement `{id, date}` with no `values` object; a workout whose exercise has `sets: null`.
- **Expected:** record-level validation/quarantine; valid records still render, export and sync.
- **Actual (CONFIRMED):** guarding is inconsistent. `workoutVolume()` (1971) defensively checks `Array.isArray(w.exercises)`, but `renderDashboard()` (2046) does `w.exercises.reduce(...)` unguarded, `renderHistory()` (3778) does `w.exercises.reduce` and `w.exercises.length` unguarded, `exportWorkouts()` (3935) does `w.exercises.forEach(e => e.sets.forEach(...))` unguarded, and `renderDashboard()` reads `state.measurements[last].values.weight` (2048) unguarded. A single malformed record throws inside whichever aggregate runs first and takes down the whole view/export; there is no skip-and-report path anywhere.

### 7. `saveState()` swallows localStorage quota failure — and callers then announce success
- **Input/state:** fill localStorage to quota (large history + `liftTracker_corrupt_*` copies from Vector 5 + `fbss:` mirror from Vector 9), then log a measurement / finish a workout / save a template.
- **Expected:** a failed write surfaces "Not saved — storage full" and the success toast is suppressed; the in-memory change is flagged dirty.
- **Actual (CONFIRMED):** `saveState()` (1106–1110) catches the `setItem` exception and only `console.error`s it. It returns `void`, so callers cannot know. `saveMeasurement()` (3589–3603) pushes, calls `saveState()`, then unconditionally `showToast('Measurements saved')`; the same push→save→success-toast pattern is in `finishWorkout()`, `saveTemplate()`, `importWorkouts()`, `importMeasurements()`. The user is told data is saved; on next launch it is gone. This is the same silent-save-failure class patched in the HOLOPLOT QA pass — here it is unpatched. Compounding it, the `stampLocalUpdate` wrapper (1947–1952) stamps `state._localUpdatedAt = Date.now()` *before* the failing write, so merge logic (Vector 20) believes a save happened.

### 8. `syncFromFirestore()` persists adopted state with a bare `setItem` inside the read try/catch
- **Input/state:** quota-full device (Vector 7 conditions) that signs in and receives cloud changes.
- **Expected:** a persistence failure while applying cloud data is reported as a *save* problem; the converge-upload still runs.
- **Actual (CONFIRMED):** at line 1796, `if (changed) { localStorage.setItem('liftTracker', JSON.stringify(state)); showToast(...); }` is a bare call inside `syncFromFirestore()`'s outer try. A `QuotaExceededError` there jumps to the catch at 1803, which logs it as a *"Firestore read error"* and skips `saveSyncCache(cache)` and the trailing converge `syncToFirestore(state)` (1800). Adopted data lives only in memory, the cache is now inconsistent with memory, and the diagnostic points at the wrong subsystem. (`migrateState()` 1103 and `saveSyncCache()` 1601 likewise swallow write errors silently.)

### 9. Firebase session mirror (`fbss:`) doubles auth storage and can resurrect stale keys
- **Input/state:** normal Firebase redirect sign-in on a quota-tight iPhone PWA; also: sign out in Safari, then reopen the home-screen app.
- **Expected:** the sessionStorage mirror is size-aware, cleaned up after handoff, and never restores keys Firebase deliberately removed.
- **Actual:** `installFirebaseSessionStorageMirror()` (1185–1199) copies *every* `sessionStorage.setItem` into localStorage under `fbss:` with all exceptions swallowed — doubling the storage footprint of Firebase's (sizeable) auth entries on the most quota-constrained platform, with silent partial failure if quota is hit mid-mirror. `restoreFirebaseSessionStorage()` (1174–1183) re-injects any `fbss:` key that sessionStorage lacks, with no freshness check. Removal *is* mirrored, and `clearAuthHandoff()` wipes `fbss:` keys, which mitigates the sign-out case — status **NEEDS-RUNTIME** to prove/disprove stale-session resurrection across the Safari↔PWA storage boundary, **CONFIRMED** for the unmonitored quota doubling.

---

## B. Identity: `uid()` and Firestore document IDs

### 10. `uid()` entropy collapses and same-millisecond bulk creation collides
- **Input/state:** import a large CSV / heart-rate file, or create many records in a tight loop; force `Math.random()` values whose base-36 form is short (e.g. `0.5` → `"0.i"`).
- **Expected:** IDs unique enough that records never share an identity; a collision is detected.
- **Actual (CONFIRMED design flaw):** `uid()` (1956) is `Date.now().toString(36) + Math.random().toString(36).substr(2,5)`. `substr(2,5)` assumes 5 random chars, but `Math.random().toString(36)` drops trailing zeros — for random values like `0.5`, `0.25`, `0.75` the suffix is 1–2 chars, collapsing entropy to near the timestamp alone. Every record created inside one millisecond in a bulk loop then differs only by that weak suffix. Nothing anywhere checks for an existing ID before insert.

### 11. A duplicated ID deletes and opens the *wrong* records
- **Input/state:** two workouts (from Vector 10, a hand-edited backup, or cloud data) sharing `id: "abc"`.
- **Expected:** ID-addressed operations affect exactly one record; duplicates are detected on load/sync.
- **Actual (CONFIRMED):** `deleteWorkout(id)` (3874) and `deleteMeasurement(id)` / `deleteTemplate(id)` use `filter(x => x.id !== id)` — both records are deleted by one tap. `viewWorkoutDetail(id)` and `openTemplateEditor(id)` use `find(...)` — always the first twin, so the second is unreachable but still counted in stats/volume. `loadState()` and `syncFromFirestore()` perform no uniqueness validation.

### 12. `docIdFor()` sanitisation maps distinct IDs onto the same Firestore document
- **Input/state:** records with IDs `"a.b"`, `"a/b"`, `"a b"`, `"a:b"`, `"a@b"` in the same collection (reachable via imported/restored/cloud data, or a future ID scheme change).
- **Expected:** document IDs are an injective encoding of record IDs (or collisions are detected).
- **Actual (CONFIRMED):** `docIdFor()` (1614–1623) does `'d' + String(base).replace(/[^A-Za-z0-9_-]/g, '_')` — all five examples become `da_b`. In Firestore they are one document (last `set(..., {merge:true})` wins, fields merged across distinct records). On download, `syncFromFirestore()` keys `localById` by the same doc ID (1725–1727), so the collision is lossy in both directions and completely silent.

### 13. Duplicate IDs are silently overwritten during cloud download
- **Input/state:** local `workouts` contains two records with the same `id` (Vector 10/11), then any sign-in triggers `syncFromFirestore()`.
- **Expected:** both records survive a sync round-trip, or a duplicate warning is raised.
- **Actual (CONFIRMED):** `syncFromFirestore()` (1725–1727) builds `localById[docIdFor(collection, r)] = r` in a `forEach` — the second twin overwrites the first in the map. The rebuilt array is `Object.values(localById)` (1760); if it differs from the local array, `state[collection]` is replaced and persisted (1795–1796). One workout disappears *because* the user signed in, with no toast distinguishing this from normal sync.

### 14. Heart-rate records dedupe on raw `date` string, not on instant
- **Input/state:** two samples `{"date":"2026-10-01","bpm":120}` and `{"date":"2026-10-01T08:00:00Z","bpm":140}` (day-only vs timestamped), and two genuinely different samples that share an identical timestamp string.
- **Expected:** dedupe on the parsed instant; distinct samples both kept.
- **Actual (CONFIRMED):** `docIdFor('heartRateData', rec)` (1616–1619) uses `rec.date` as the document base, and `importHeartRateData()` (3894–3897) dedupes via `new Map(samples.map(s => [s.date, s]))`. String equality is the identity: different string forms of the same day create two docs for one day's data, while identical strings silently overwrite (`Map.set` / doc `set`) even if the samples differ. Malformed entries make it worse — see Vector 30.

---

## C. Cloud sync merge logic

### 15. Per-record last-write-wins ignores edits that were never stamped — offline edits lose to stale cloud copies
- **Input/state:** sign in once (records acquire `_updatedAt` on upload). Go offline, edit a workout's sets. Reconnect and sign in / let `onAuthStateChanged` fire.
- **Expected:** the offline edit is recognised as newest and uploaded.
- **Actual (CONFIRMED):** record-level `_updatedAt` is written in exactly one place — inside `syncToFirestore()`'s upload loop (1651), at the moment of upload. Editing (`updateWorkoutSet` 3083, `toggleWorkoutSet` 3089, etc.) only calls `saveState()`, whose wrapper stamps `state._localUpdatedAt` (1944) — a *global* timestamp the per-record merge never reads. In `syncFromFirestore()` (1738–1746), `localT = local._updatedAt || 0` is therefore the *last upload* time, and any cloud copy with `cloudT > localT` — including the pre-edit version already in the cloud — replaces the local record (`localById[id] = rec`). `onAuthStateChanged` (1483–1488) runs `syncFromFirestore` *before* `syncToFirestore`, so the stale cloud copy wins before the edit is ever uploaded. Legacy/never-synced local records have `_updatedAt` undefined → `localT = 0`, so *any* cloud record beats them unconditionally.

### 16. `syncToFirestore()` debounce and in-progress guard drop saves with no queue and no retry
- **Input/state:** make edit A (sync runs), then edit B within 2 s, then close the app. Variant: make an edit while a slow sync is in flight on a poor connection.
- **Expected:** a trailing/queued sync guarantees the latest state is eventually uploaded; the sync status reflects unsent changes.
- **Actual (CONFIRMED):** `syncToFirestore()` (1626–1632) returns silently if `syncInProgress` is set, and returns silently if `now - lastSyncTime < 2000`. No timer, queue, or dirty flag is set in either branch, and no caller re-invokes it. `lastSyncTime` is stamped at the *start* of a sync (1631), so records added during the `await` loop — after their collection's turn has passed — are also missed until some unrelated future save happens. The status pill keeps showing the previous "synced" state throughout. If the session ends in the window, edit B never reaches Firestore.

### 17. Legacy migration's 5-second threshold discards — then deletes — newer cloud data
- **Input/state:** legacy user doc (`meta.data` blob, no `_schemaVersion`). Cloud blob saved from a phone at T; the second device has `state._localUpdatedAt` at T+3 s (or a clock skewed a few seconds fast). Also: cloud blob genuinely newer by 4 s.
- **Expected:** the newer data wins regardless of an arbitrary epsilon, and the legacy blob is deleted only after its contents are safely migrated.
- **Actual (CONFIRMED):** `migrateLegacyData()` (1819–1833) adopts the cloud blob only if `cloudTime > localTime + 5000`. In the ≤5 s window the cloud data is ignored — and the very next statement unconditionally deletes the blob (`update({data: FieldValue.delete()})`), destroying the only copy of the newer workouts. Device clock skew feeds straight into the same comparison (`_localUpdatedAt` is a wall-clock `Date.now()`, 1944), so a device 6 s fast makes genuinely older cloud data "win" over newer local data by the reverse route. The threshold converts small timing errors into permanent loss in both directions.

### 18. Deletion propagation depends entirely on a volatile, silently-resettable cache
- **Input/state:** delete a workout on device B (tombstone written). On device A, clear site data / let `liftTrackerSync` become corrupt JSON (or use a fresh browser profile) *without* deleting `liftTracker`, then sign in.
- **Expected:** deletions are a property of the data, not of one device's cache; a missing cache triggers a conservative reconciliation, not resurrection.
- **Actual (CONFIRMED):** `loadSyncCache()` (1591–1598) returns `{lastSyncedAt:0, collections:{}}` on any parse failure, silently. The "record is gone from cloud, drop it locally" pass in `syncFromFirestore()` (1751–1758) only iterates IDs present in that cache — with an empty cache it does nothing. The converge `syncToFirestore(state)` at the end (1800) then *re-uploads* A's copy of the record B deleted, resurrecting it for every device. The tombstone pass in `syncToFirestore()` (1660–1668) has the mirror-image dependency: records deleted locally are only tombstoned if they exist in the cache.

### 19. Tombstone vs local-edit race resolves by whichever stale timestamp happens to be larger
- **Input/state:** device B deletes record R at time D (tombstone `_deletedAt = D`). Device A, offline, holds R with `_updatedAt` stamped at its last upload U. Case (a) U < D with an offline edit on A; case (b) A's clock is set ahead so a later upload stamps `_updatedAt > D` for an unrelated change.
- **Expected:** an explicit conflict outcome (edit-vs-delete is surfaced, or a documented rule applies consistently).
- **Actual (CONFIRMED):** `syncFromFirestore()` (1740–1744): `if (cloud._deleted) { if (localT >= (cloud._deletedAt || cloudT)) continue; if (local) delete localById[id]; }`. Case (a): A's offline edit never re-stamped R (Vector 15), so `localT = U < D` and the edit is silently deleted on download. Case (b): an inflated `_updatedAt` makes A "win" against a legitimate later deletion, and the converge upload resurrects R everywhere. Same code, opposite data loss, decided by clock hygiene.

### 20. Settings merge is not last-write-wins at all — local always wins; profile merge dies on bad dates
- **Input/state:** change body weight / settings on device B; device A already has any value for the same key. Separately: a cloud `profile` whose `completedAt` is a non-date string, and a cloud profile with no `completedAt`.
- **Expected:** settings/profile reconcile by recency, like records claim to.
- **Actual (CONFIRMED):** `syncFromFirestore()` (1783–1791) builds `merged = Object.assign({}, meta.settings, localSettings)` — every local key overwrites the cloud key unconditionally, so a setting changed on another device *never* arrives if the key exists locally (including stale defaults). For profile (1778–1782), recency is `new Date(completedAt).getTime()`; an unparseable `completedAt` yields `NaN`, and every comparison with `NaN` is false, so that profile can never be adopted or superseded — it is permanently stuck. There are no per-key timestamps to do better with.

### 21. One poison record can abort an entire multi-collection sync, repeatedly
- **Input/state:** a record containing a field Firestore rejects (e.g. `undefined` values, or an unsupported nested value) introduced via corrupted/restored state or a malformed import, in `workouts`.
- **Expected:** per-record error isolation — the bad record is reported and skipped; other collections still sync.
- **Actual:** `syncToFirestore()` (1634–1691) wraps *all five collections plus the meta write* in a single try/catch. A throw from `colRef.doc(id).set(payload, {merge:true})` (1655) for one record aborts the remaining collections, skips `saveSyncCache(cache)` (1684) — discarding the in-memory cache updates for records that *did* upload, so they re-upload on every subsequent save — and sets status "Sync error" with no record identified. Every later `saveState()` retries and fails at the same record: sync is permanently wedged by one bad row. Status **NEEDS-RUNTIME** for the exact Firestore rejection (compat SDK `undefined`-field behaviour), **CONFIRMED** for the all-or-nothing error structure.

### 22. "Clear All Data" is undone by the cloud — cleared workouts resurrect on next sync
- **Input/state:** signed-in user taps Clear All Data (`confirmClearData`), especially while offline or within 2 s of a previous sync; then reopens the app / signs in again.
- **Expected:** clear is total and durable: local collections, profile, custom exercises, heart-rate data, and the cloud copies are all removed (or the user is told cloud data will return).
- **Actual (CONFIRMED):** `confirmClearData()` (2029–2034) clears only `templates`, `workouts`, `measurements`, `activeWorkout` — `customExercises`, `profile`, `heartRateData`, `settings` survive a button labelled "delete all workouts, templates, and measurements… cannot be undone". Cloud removal depends on `saveState()` → `syncToFirestore()` tombstoning the cached IDs (1660–1668) — which the 2-second debounce (Vector 16) can skip entirely, and which never runs offline. Meanwhile `syncFromFirestore()`'s adopt pass (1735–1747) re-adds any cloud record whose local counterpart is missing (`localT = -1`), and `syncFromFirestore` runs on every auth-state change *before* the converge upload. Net effect in the offline/debounced cases: the cleared history downloads itself back. The exact sequence is timing-dependent (**NEEDS-RUNTIME** to reproduce end-to-end); the missing local scope and the resurrection path are **CONFIRMED** in code.

---
## D. CSV export / import

### 23. CSV formula injection on workout export
- **Input/state:** a workout named `=HYPERLINK("https://evil.example","x")`, an exercise named `+2+5`, a workout name starting with `@SUM(1+1)`, or a name beginning with a tab/CR followed by `=…`. Export workouts and open `workouts.csv` in Excel / Google Sheets / Numbers (the SESSION_SUMMARY states iCloud Numbers compatibility is a design goal).
- **Expected:** spreadsheet-dangerous leading characters (`=`, `+`, `-`, `@`, tab, CR) are neutralised on export (e.g. prefixed with `'`), per OWASP CSV-injection guidance.
- **Actual (CONFIRMED):** `exportWorkouts()`'s quoting helper `q()` (3933) only wraps in double quotes and doubles embedded quotes. Quoting does **not** stop spreadsheet formula interpretation of a cell whose content starts with `=`. Date, workout name, exercise and muscle are all user-controlled and all pass through `q()` unsanitised; weight/reps are interpolated raw. A shared/exported CSV from this app is a formula-injection payload.

### 24. Measurements export does not even quote-escape, and interpolates values raw
- **Input/state:** a measurement whose `date` contains a `"` or comma (reachable via Vector 1/6 corrupted state or a hand-crafted import, Vector 28), or a `values` entry that is a string such as `=2+5` or `1,999`.
- **Expected:** same escaping discipline as the workout export, for every field.
- **Actual (CONFIRMED):** `exportMeasurements()` (4023–4029) builds rows as `'"' + m.date + '"'` — no doubling of embedded quotes — and appends each value as `,${v}` with no quoting at all. A comma in a value shifts every subsequent column; a leading `=` is a live formula (Vector 23 without even the quote wrapper); a quote in the date breaks out of the field. The two exporters in the same file follow two different, both insufficient, escaping rules.

### 25. Re-importing the app's own export duplicates everything — no dedupe in CSV import
- **Input/state:** export workouts, then import the resulting file twice (the file input's value is reset, `event.target.value = ''` at 4093, so the *same* file can be picked again immediately). Also: import a backup onto a device that already has that history.
- **Expected:** records are matched by a stable identity (or the user is warned "these dates/names already exist — import anyway?").
- **Actual (CONFIRMED):** `importWorkouts()` (4040–4095) assigns every imported workout a fresh `uid()` and unconditionally `state.workouts.push(...workouts)` (4089), followed by save + a success toast. There is no existence check of any kind. Each re-import doubles history, dashboard totals, volume and streaks, and the duplicates are then uploaded to Firestore as new records. The screenshot-recovery path *does* dedupe (Vector 29) — the CSV path, the one used for backup/restore, does not. `importMeasurements()` (4097) has the same flaw: re-importing duplicates every measurement row.

### 26. Quoted newlines in exported names shatter rows on re-import (export→import is not lossless)
- **Input/state:** a workout or exercise name containing a newline, e.g. name = `"Push Day\n(holiday)"` — legitimately producible in the UI (template/workout name fields) and correctly quoted by `q()` on export into a multi-line CSV field. Re-import that file.
- **Expected:** a real CSV parser that respects quoted fields spanning lines, so the app's own export round-trips byte-for-byte semantically (the exporter's header comment at 3931 explicitly promises "re-importing this file fully restores the workout (lossless round-trip)").
- **Actual (CONFIRMED):** `importWorkouts()` (4044) and `importMeasurements()` (4104) split the raw text with `e.target.result.split('\n')` *before* any quote handling, then run `parseCSVLine()` (4129) per fragment. A quoted newline splits one logical row into two physical fragments; the first fragment has unbalanced quotes (so `parseCSVLine`'s `inQuotes` state swallows its commas), the second fragment becomes a phantom partial row that is either dropped or mis-parsed into a bogus workout/set. The round-trip the exporter promises is broken by the importer for any name containing a newline (and a stray `\r` from CRLF files survives inside unquoted trailing fields except where `.trim()` in `parseCSVLine` happens to strip it).

### 27. Negative, `Infinity` and junk-suffixed numbers are accepted on workout import — and poison volume and persistence
- **Input/state:** detailed CSV rows with `Weight = -225, Reps = -5`; `Weight = 1e999`; `Weight = Infinity`; `Weight = 135abc`; `Duration (min) = -30` / `1e999`; `Reps = 3.9`.
- **Expected:** reject or clamp to finite, non-negative ranges; a bad row is reported and skipped, never stored.
- **Actual (CONFIRMED):** `importWorkouts()` (4068–4072, 4080–4081) uses bare `parseFloat(...) || 0` / `parseInt(...) || 0` / `Number(...)` with no `Number.isFinite` and no sign check. `-225` and `-5` pass verbatim (and −×− yields *positive* volume in `setVolume()`, 1961); `parseFloat('1e999')` and `parseFloat('Infinity')` yield `Infinity`; `parseFloat('135abc')` yields 135 silently; `parseInt('3.9')` truncates to 3. `Infinity` then hits `JSON.stringify(state)` in `saveState()`, which serialises it as `null` — so the in-memory value, the persisted value and the Firestore value are three different things, and on next load the set's weight is `null`, falling through the `??` fallbacks in `setVolume()` to planned values. Duration `Number('1e999') * 60000` is likewise `Infinity`→`null`. Contrast `importMeasurements()`/`saveMeasurement()`, which at least check `v > 0` — but see Vector 28 for why even that is insufficient.

### 28. Measurement import is header-blind, boundless, and admits `Infinity`
- **Input/state:** (a) a measurements CSV with columns in a different order than `MEASUREMENT_FIELDS` (e.g. produced by another app or a reordered spreadsheet); (b) a row with value `1e999`; (c) rows with garbage dates (`"hello"`, `""`, `"2026-13-45"`); (d) the same file imported twice.
- **Expected:** columns mapped by header name; values range-checked (finite, plausible); dates validated; duplicates detected.
- **Actual (CONFIRMED):** `importMeasurements()` (4105–4121) parses the header (`const header = parseCSVLine(lines[0])`) and then **never uses it** — values are mapped purely by position, `values[MEASUREMENT_FIELDS[j-1].id] = v`. A reordered file silently records weight as body-fat, waist as chest, etc. — wrong health data with a success toast. The only validation is `!isNaN(v) && v > 0`, which `Infinity` passes (`Infinity > 0`), so `1e999` is stored and then serialised to `null` as in Vector 27. The date is stored verbatim from `cols[0]` with no validation, and there is no dedupe (Vector 25).

### 29. CSV grouping collapses distinct workouts, the Set column is ignored, and the legacy fallback manufactures workouts
- **Input/state:** (a) two genuinely separate same-name sessions on one date (AM and PM "Push Day"); (b) a detailed CSV whose rows are deliberately ordered by set number descending; (c) a detailed CSV missing exactly one recognised header (e.g. `Workout` instead of `Workout Name`); (d) any unrelated 3-column CSV (a contacts export).
- **Expected:** (a) sessions stay separate; (b) the file's Set column determines set order; (c) a near-miss header produces a clear "unrecognised format" error; (d) non-workout files are rejected.
- **Actual (CONFIRMED):** (a) `importWorkouts()` groups by `key = date + name` in a `Map` (4062–4067) and merges exercises by exercise name only — the two sessions fuse into one workout, and two different exercises with the same name fuse too. (b) No `idxSet` is ever read (4048–4051 reads date/name/duration/exercise/muscle/type/weight/reps/completed only); sets are appended in raw file line order, and `rest` is hardcoded to 90 regardless of the original. Set `type` is passed through unvalidated against `SET_TYPE_IDS`. (c) `detailed` (4051) is all-or-nothing: one missing header flips the *entire* file into the legacy branch (4074–4088), which treats column 3 as a `'; '`-separated exercise list — for a detailed-layout file that column is *Duration*, so the import manufactures workouts whose "exercises" are duration strings, each with a fabricated 0×0 uncompleted set, pushes them, saves them, and toasts success. (d) The legacy branch accepts any row with ≥3 columns from any file whatsoever as a workout.

---

## E. Screenshot-text recovery (`parseWorkoutText`)

### 30. Ordinary prose becomes exercises and sets; substring "day" makes any line a workout title
- **Input (exact paste):**
  ```
  Push Day
  Grocery List
  2 500
  Holiday photos
  Bench Press
  printed 8 x 10
  did 12 reps at 9
  ```
- **Expected:** recovery is conservative — ambiguous lines are left unparsed and shown for review, units are not invented, and nothing is marked completed that the text didn't say.
- **Actual (CONFIRMED):** in `parseWorkoutText()` (4194–4263): the title test `/(?:push|pull|legs|…|day|workout)/i` (4231) is an unanchored substring match, so "Holi**day** photos" (and "Mon**day**", "To**day**") starts a brand-new workout, splitting the real one. Any line of 2–59 chars while a workout is open becomes an exercise (4256–4259) — "Grocery List" is now an exercise. The set regexes are unanchored and unit-blind: `setRegexAt` (4204) turns "did **12 reps at 9**" into a completed set of 12 reps × 9 lbs; `setRegexX` (4205) turns "printed **8 x 10**" into 8 lbs × 10 reps; `setRegexBare` (4206) turns "2 500" into 2 reps × 500 lbs. Kilogram figures are silently treated as pounds (`(?:lbs?|kg)?` is consumed and discarded). Every fabricated set is stored with `completed: true` (4248–4251), so phantom volume lands in history, stats and cloud sync as real training.

### 31. Invalid recovered dates and fabricated timing metadata are stored as fact
- **Input (exact paste):** a workout headed `13/45/2026 Leg Day` or `Feb 30 Push Day`, plus any valid set lines.
- **Expected:** impossible dates are rejected/flagged; recovered workouts don't claim timing that was never in the source.
- **Actual (CONFIRMED):** `extractDate()` (4265–4279) assembles `y + '-' + m + '-' + d` by string padding with no range check — `13/45/2026` becomes the stored date `"2026-13-45"` and `Feb 30` becomes `"2026-02-30"`. Downstream, `new Date(w.date)` is `Invalid Date`: the dashboard week filter (`new Date(w.date) >= weekStart`, 2044) silently excludes the workout, `formatDate()` renders "Invalid Date", and date sorts become NaN-driven and unstable. Independently, `parseWorkoutText()` stamps every recovered workout with `startTime: Date.now(), endTime: Date.now(), duration: 3600000` (4239–4242) — a fabricated exactly-one-hour duration and an import-moment timestamp, presented thereafter as the workout's real duration.

### 32. Screenshot-import dedupe is simultaneously too weak and too strong
- **Input/state:** (a) recover the same screenshot text twice after editing the recovered workout's name slightly (trailing space, date line stripped differently by `parseWorkoutText`'s title handling); (b) two genuinely different workouts with the same name on the same date.
- **Expected:** dedupe on a stable identity; a near-duplicate prompts rather than silently duplicating or silently dropping.
- **Actual (CONFIRMED):** `importParsedScreenshots()` (4281–4295) dedupes only on `(date.slice(0,10), name.toLowerCase())` equality, checked only against `state.workouts`, not within the incoming batch against a canonical form. Case (a) slips past on any name variation and duplicates. Case (b) is silently dropped — `added` just counts lower, and the toast says "N workout(s) recovered" with no mention that one was skipped as a supposed duplicate. Note the asymmetry with Vector 25: the throwaway recovery path has dedupe, the backup/restore CSV path has none.

---

## F. Firebase config import/export and the iOS OIDC handoff

### 33. Firebase config import accepts arbitrary JSON — including a pointer to an attacker's project
- **Input/state:** a file `lift-tracker-firebase-config.json` containing
  `{"apiKey": "attacker-key", "projectId": "attacker-project", "authDomain": "attacker-project.firebaseapp.com", "extra": {"anything": true}}`
  — and variants with wrong types: `{"apiKey": 12345, "projectId": {"x": 1}}`, `{"apiKey": "k", "projectId": "p", "__proto__": {...}}`.
- **Expected:** strict schema validation (all six fields present, all strings, plausible formats / known key set), and a clear warning that importing a config changes *which backend receives the user's data*.
- **Actual (CONFIRMED):** `importFirebaseConfig()` (1375–1401) checks only `if (!config.apiKey || !config.projectId)` — truthiness of two fields. Everything else, including arbitrary extra keys, is stored verbatim: `localStorage.setItem('liftTrackerFirebase', JSON.stringify(config))` (1392), then `initFirebase(config)` runs against it. A user socially engineered into importing a config file thereafter signs in to, and syncs all workout/health data to, the file author's Firebase project — a data-exfiltration path with a "Config imported & saved" success toast. Wrong-typed values pass the truthiness check too: an object `projectId` is coerced to `"[object Object]"` in the form field while the stored JSON keeps the object, so `getFirebaseConfig()` (1147) later hands `firebase.initializeApp` a config whose failure surfaces only as a generic "Config error".

### 34. Imported config does not actually take effect — split-brain between stored config and running Firebase app
- **Input/state:** app already initialised with the default/previous config (the normal case, since `initCloudOnLoad()` auto-initialises on every load, 1919–1935); then import a different, legitimate config file.
- **Expected:** either the running app re-initialises against the new config, or the UI states "saved — reload the app to apply".
- **Actual (CONFIRMED):** `importFirebaseConfig()` calls `initFirebase(config)` (1397), but `initFirebase()` returns immediately when `firebaseApp` already exists (1411–1414: "Already initialized — just update if config changed" — it does not update anything). The toast says "imported & saved", `renderCloudUI()` re-reads `getFirebaseConfig()` and displays the *new* values, while `auth`/`db` still point at the *old* project until a full page reload. Sign-ins and syncs in that window go to the previous backend under the new backend's displayed identity. `saveFirebaseConfig()` (1338) has the identical flaw.

### 35. The OIDC nonce is generated, stored — and never verified; the ID token sits in plaintext localStorage
- **Input/state:** complete the iOS home-screen OIDC flow; then inspect `liftTrackerOauthNonce` usage. Attack variant: any same-origin script/XSS (or a shared device) plants `localStorage['liftTrackerGoogleIdToken'] = <a previously captured, still-valid Google ID token for this client>` and reloads the app. Availability variant: let `signInWithCredential` fail once (expired token, transient network) after the token was stored by `auth.html`.
- **Expected:** the app verifies the returned ID token's `nonce` claim against the nonce it generated in `startIosGoogleOidc()` before calling `signInWithCredential`; an unconsumed token is not destroyed before a successful sign-in, and is not left sitting in persistent storage.
- **Actual (CONFIRMED):** `startIosGoogleOidc()` (1262–1268) generates a nonce (with a `Date.now() + Math.random()` fallback) and stores it — and nothing ever reads it back. Grep-verifiable: `liftTrackerOauthNonce` appears only in `setItem` (1266) and the two `removeItem` calls in `clearAuthHandoff()` (1207) / `clearAuthPending()` (1300). `completeGoogleIdTokenSignIn()` (1229) passes the token straight to `GoogleAuthProvider.credential(idToken)`; Firebase verifies signature/exp/aud, but the *nonce binding to this device's sign-in attempt* — the entire reason the nonce was generated — is unenforced, so a captured token is replayable from any context that can write this origin's localStorage. Storage is the other half: `auth.html` writes the raw ID token to persistent `localStorage` (not sessionStorage), where it survives until the next `initCloudOnLoad()`; and `takeStoredGoogleIdToken()` (1212–1227) *deletes* the stored token before sign-in is attempted, so a single failed `signInWithCredential` (1229–1260) permanently strands the handoff with no retry — the user must redo the whole Google round-trip. (Context from the wider diagnosis: iOS standalone storage isolation is why this token arrives via Safari at all; these are defects in the token handling *within* that constraint, not in the constraint itself.)

### 36. Heart-rate import validates the envelope, not the samples
- **Input/state:** `{"heartRateSamples": [{"date": "2026-10-01", "bpm": "150"}, {"bpm": 140}, {"date": null, "bpm": -5}, {"date": "2026-10-01", "bpm": 99999}]}`.
- **Expected:** per-sample validation (ISO date present, `bpm` a finite number in a plausible range); invalid samples counted and reported.
- **Actual (CONFIRMED):** `importHeartRateData()` (3884–3905) checks only `Array.isArray(data.heartRateSamples)`. Samples are keyed into a `Map` by raw `s.date` — the dateless and `null`-date samples collapse onto single `undefined`/`null` keys, silently discarding each other. A string `bpm` passes into `getHeartRateForWorkout()` (3911–3923), where `s.bpm > 0` coerces it for filtering but `bpms.reduce((a,b) => a+b, 0)` *string-concatenates*, producing a garbage `avg`; `99999` is accepted and squashes the chart scaling in `viewWorkoutDetail()`. The toast reports the *input file's* sample count (`data.heartRateSamples.length`), not the number actually stored after Map collapsing.

### 37. Unbounded import files: no size check on any import path
- **Input/state:** a 200 MB "CSV" (or a small file that decompresses/expands into hundreds of thousands of rows), fed to workout import, measurement import, heart-rate import, or Firebase config import.
- **Expected:** a file-size ceiling and a row/record ceiling, rejected with a message before the content is read into memory.
- **Actual (CONFIRMED):** none of `importWorkouts()` (4040), `importMeasurements()` (4099), `importHeartRateData()` (3886) or `importFirebaseConfig()` (1377) inspects `file.size`. Each does `reader.readAsText(file)` on the whole file, then `importWorkouts` additionally materialises `split('\n')` plus a parsed array per line plus a second workouts array — several full copies of the content in memory at once. On the target platform (iPhone PWA) this is a reliable tab-kill / app-freeze, and a mid-import kill after `state.workouts.push` but before a successful `saveState()` leaves memory and storage diverged (compounding Vector 7).

---

## Summary table

| # | Vector (short name) | Severity | Status |
|---|---|---|---|
| 1 | Wrong-typed collections at schema v2 bypass migration, crash app | **Critical** | Confirmed by code reading |
| 2 | v1→v2 migration only repairs falsy wrong types | High | Confirmed by code reading |
| 3 | Future/string `_schemaVersion` silently accepted | Medium | Confirmed by code reading |
| 4 | Top-level JSON array passes corruption check | Low | Confirmed by code reading |
| 5 | Corrupt-state backups unbounded; backup failure still deletes original | High | Confirmed by code reading |
| 6 | One malformed record poisons renders/exports (no per-record isolation) | High | Confirmed by code reading |
| 7 | `saveState()` quota failure swallowed; callers toast success anyway | **Critical** | Confirmed by code reading |
| 8 | `syncFromFirestore` bare `setItem` misreports quota as read error, skips converge | Medium | Confirmed by code reading |
| 9 | `fbss:` mirror doubles auth storage; possible stale-key resurrection | Medium | Confirmed (quota) / Needs runtime test (resurrection) |
| 10 | `uid()` entropy collapse, same-ms collisions | High | Confirmed by code reading (design) |
| 11 | Duplicate IDs: delete/filter and find hit the wrong records | High | Confirmed by code reading |
| 12 | `docIdFor()` sanitisation collisions (`a.b` = `a/b` = `a b`) | High | Confirmed by code reading |
| 13 | Duplicate IDs silently overwritten on cloud download | High | Confirmed by code reading |
| 14 | Heart-rate identity is the raw `date` string | Medium | Confirmed by code reading |
| 15 | Offline edits never re-stamp `_updatedAt`; stale cloud wins on sign-in | **Critical** | Confirmed by code reading |
| 16 | Sync debounce/in-progress guard drops saves, no queue/retry | High | Confirmed by code reading |
| 17 | Legacy migration 5 s threshold discards then *deletes* newer cloud data | **Critical** | Confirmed by code reading |
| 18 | Deletion propagation depends on volatile, silently-reset sync cache | High | Confirmed by code reading |
| 19 | Tombstone vs edit race decided by stale/clock-skewed timestamps | High | Confirmed by code reading |
| 20 | Settings merge: local always wins; profile merge NaN-stuck on bad dates | Medium | Confirmed by code reading |
| 21 | One poison record wedges all sync (single try/catch, cache discarded) | High | Needs runtime test (SDK rejection) / Confirmed (structure) |
| 22 | Clear All Data incomplete locally; cleared data resurrects from cloud | High | Confirmed (scope) / Needs runtime test (sequence) |
| 23 | CSV formula injection in workout export | High | Confirmed by code reading |
| 24 | Measurements export: no quote escaping, raw value interpolation | Medium | Confirmed by code reading |
| 25 | CSV import has no dedupe — re-import duplicates everything | High | Confirmed by code reading |
| 26 | Quoted newlines shatter rows — export→import round-trip not lossless | Medium | Confirmed by code reading |
| 27 | CSV import accepts negative / `Infinity` / junk-suffixed numbers | High | Confirmed by code reading |
| 28 | Measurement import header-blind, boundless, admits `Infinity` | High | Confirmed by code reading |
| 29 | CSV grouping fuses sessions; Set column ignored; legacy fallback fabricates workouts | Medium | Confirmed by code reading |
| 30 | Screenshot parser turns prose into completed exercises/sets | High | Confirmed by code reading |
| 31 | Screenshot parser stores impossible dates + fabricated 1 h duration | Medium | Confirmed by code reading |
| 32 | Screenshot dedupe too weak (duplicates) and too strong (silent drops) | Medium | Confirmed by code reading |
| 33 | Firebase config import accepts arbitrary JSON / attacker's project | High | Confirmed by code reading |
| 34 | Imported config not applied (`initFirebase` early return) — split-brain | High | Confirmed by code reading |
| 35 | OIDC nonce never verified; ID token in plaintext localStorage, deleted before use succeeds | High | Confirmed by code reading |
| 36 | Heart-rate import validates envelope only; string `bpm` corrupts averages | Medium | Confirmed by code reading |
| 37 | No size/row limits on any import — memory exhaustion on iPhone PWA | Medium | Confirmed by code reading |

**Counts:** 37 vectors. Confirmed by code reading: 34 fully, plus the structural half of #9, #21, #22. Needs runtime test to close: #9 (stale `fbss:` resurrection across Safari/PWA boundary), #21 (exact Firestore compat-SDK rejection of poisoned fields), #22 (end-to-end resurrection sequence/timing).

**Cross-cutting theme:** the app validates *envelopes* (is it an object? is it an array? does a key exist?) but almost never *contents* (field types, ranges, finiteness, identity uniqueness). Every ingestion path — localStorage load, Firestore download, CSV import, screenshot parse, heart-rate import, config import — trusts what it is given, and every storage path (`saveState`, `saveSyncCache`, the `fbss:` mirror) swallows its own failures. The result is a system where corruption enters silently at any of six doors, is persisted and synced as truth, and surfaces only as a crash, a wrong total, or missing history far from the cause.
