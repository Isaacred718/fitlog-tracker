## Goal
- Build a fitness tracker PWA (Lift Tracker) with workout logging, templates, body measurements, rest timer, custom exercises, video guides, workout split calendar, superset/giant set support, exercise autocomplete, weekly dashboard, profile/coaching tab, Apple Health export with heart rate import, nutrition-backed body-part templates, and Firebase Auth + Firestore cloud sync. Deploy to GitHub Pages for iOS access.

## Constraints & Differences
- Single-file HTML app (self-contained, no build tools)
- CSV export/import for iCloud Numbers compatibility
- Dark green theme (#8cf23a accent, #0a0f0a background)
- PWA installable on iOS via Safari "Add to Home Screen"
- localStorage persistence + cloud sync via Firebase, offline-capable via service worker
- Dashboard layout priority: Start Workout → Rest Timer → Weekly Calendar → Stats → Activity
- Profile coaching tone: Jillian Michaels-style (direct, no-nonsense, tough love)
- iOS PWA requires `signInWithRedirect` instead of popup auth

## Progress
### Done
- Complete fitness tracker PWA with workout logging, body measurements, CSV export/import, template builder, guided wizard, rest timer, 9 set types, dashboard, history, exercise catalog
- PWA: manifest.json, service worker (v3, network-first), app icons, iOS meta tags, inline SVG favicon, apple-touch-icon
- GitHub Pages deployed at `https://isaacred718.github.io/fitlog-tracker/`
- Body measurement trend indicators with green/red badges, `LOWER_IS_BETTER` array
- Custom exercise creation modal (name, muscle, equipment, tips, pro tip)
- Exercise detail modal with YouTube "Watch Video Guide" button
- Workout split calendar (weekly view), workout day dots, click-to-view detail
- Superset linking: `supersetGroup` property, colored side bars/labels in template editor, active workout, and history
- Giant set support: `toggleGiantSet(i)` links 3 adjacent exercises, dynamic "Superset" (2) vs "Giant Set" (3+) labels, dashed border treatment
- Dashboard: Start Workout at top, live workout timer bar, quick rest timer buttons
- Exercise autocomplete: `EXERCISE_DB` (214) + `EXERCISE_CATALOG` (38 with tips) merged via `getAllExercises()`
- Profile tab: 6-question assessment survey, analysis engine, coaching engine (5-7 personalized cards)
- Apple Health JSON export with MET-based calorie calculation, version 2
- Apple Shortcut documentation (`APPLE_HEALTH_SHORTCUT.md`)
- 9 body-part default templates with nutrition advice (pre/post workout + summary)
- Firebase Auth + Firestore cloud sync code integrated (Google sign-in popup/redirect, Firestore document per user, auto-sync with 2s debounce, sync status indicator)
- **Firebase Console fully configured**: Project `lift-tracker-fade7` upgraded to Identity Platform (Spark plan). Google sign-in enabled. Firestore database in `nam5` with test mode rules. `isaacred718.github.io` added to authorized domains.
- **OAuth client redirect URIs fixed** in Google Cloud Console (auto-created "Web client"):
  - Authorized JS origins: `https://isaacred718.github.io`, `http://localhost:5000`, `https://lift-tracker-fade7.firebaseapp.com`
  - Authorized redirect URIs: `https://isaacred718.github.io/__/auth/handler`, `https://lift-tracker-fade7.firebaseapp.com/__/auth/handler`, `https://lift-tracker-fade7.web.app/__/auth/handler`
- **Code fix v1**: `renderCloudUI()` added to `onAuthStateChanged` handler for signed-in case, and when navigating to Settings view
- **Code fix v2**: 
  - Added `.then()` handler to `signInWithPopup` to explicitly handle successful auth (instead of relying only on `onAuthStateChanged`)
  - Wrapped `onAuthStateChanged` async handler body in try/catch so sync errors don't block UI updates
  - Added `console.log` throughout sign-in flow for debugging
- **Firestore security rules fixed** via Firebase Rules REST API using the service account key (`~/Downloads/lift-tracker-fade7-firebase-adminsdk-fbsvc-602cf5083c.json`): created ruleset `b5a9e6e4-...` (`allow read, write: if request.auth != null`) and PATCHed release `cloud.firestore` — verified live via API
- **Code fix v3** (committed `e9ded05`, deployed):
  - `getRedirectResult()` now has a `.then()` success handler (previously errors-only, so redirect sign-in results were silently dropped)
  - `onAuthStateChanged` renders the signed-in UI **immediately**; Firestore sync runs in the background so a slow read can't leave the UI stuck on "Not signed in"
  - Redirect flow now also used for Firefox/Safari (was mobile/PWA only)
  - `auth/popup-closed-by-user` handled without an error toast
  - Service worker bumped to `lift-tracker-v4`
- **Sign-in verified working in real Chrome** (user-tested). CDP-controlled browser can't fully validate it (popups blocked by automation).
- **Code fix v4** (committed `9e58e2a`): iOS Safari tab now uses popup sign-in; redirect only for standalone PWA (iOS Safari redirect loses its result after the OAuth round trip). SW bumped to v5.
- **External PR merged** (`09d9bbe` + merge `068843a`, from branch `Perplexity-edits`): SW rewritten to stale-while-revalidate, `BYPASS_CACHE` list for auth/API domains, `APP_UPDATE` toast on new version. SW bumped to v6.
- **Voice commands added** (committed `81ca480`, merged `8c3402d`, deployed):
  - 🎤 mic button in workout header; native Web Speech API (works on iPhone Safari + Chrome), auto-restarts after browser-end
  - Commands: bare number / "N reps" → log reps + complete set + start rest (auto-advance); "done"/"next" → complete set; "weight 135"; "rest 90"; "add set"; "next exercise"; "skip"/"stop" → clear timer; unrecognized → error flash
  - `parseSpokenNumber()` handles words, digits, and "one thirty five" → 135
  - Spoken confirmations via `speechSynthesis`; Settings > Voice Commands card (enable + speak toggles, Test Voice)
  - Verified end-to-end in CDP Chrome (command routing, number parsing, all-done, stop, error paths); unit tests for parser + routing all pass

### Remaining
- Test redirect sign-in on iPhone PWA / Safari / Firefox (redirect path — most important to confirm on the actual phone)
- Test full cloud sync flow (sign in → auto-upload → sign in on other device → download)

## Key Decisions
- Firebase Auth uses `signInWithPopup` on desktop, `signInWithRedirect` on iOS/PWA (`window.navigator.standalone` + userAgent sniffing)
- Firestore document structure: `users/{uid}` with `data` field containing full state + `email`, `displayName`, `updatedAt`
- Merge strategy: compare `_localUpdatedAt` vs `updatedAt` (Firestore Timestamp), 5-second threshold — newer wins
- Firebase config stored in `localStorage('liftTrackerFirebase')` (separate from state document)
- `saveState()` wrapped with `stampLocalUpdate()` calls original (localStorage + optional Firestore push)
- Service worker cache: `lift-tracker-v3`
- Sync debounced 2s to avoid Firestore write limit; active workout skipped during sync
- `signInWithPopup` has no `.then()` handler — only `.catch()` — relies on `onAuthStateChanged` for UI updates

## Next Steps
1. Test sign-in on the live app — clear service worker cache / hard reload first
2. If popup fails, try desktop redirect flow instead
3. Test full cloud sync flow

## Critical Context
- Firebase project: `lift-tracker-fade7` (Spark with Identity Platform)
- Firebase config: `apiKey: AIzaSyAw2BlvU4QhIC-TaH-hP-ELHOpjhoEe0UE`, `authDomain: lift-tracker-fade7.firebaseapp.com`, `projectId: lift-tracker-fade7`, `storageBucket: lift-tracker-fade7.firebasestorage.app`, `messagingSenderId: 1045140412331`, `appId: 1:1045140412331:web:9668f12422e5d6a48d64ee`
- Firebase authorized domains: `localhost`, `lift-tracker-fade7.firebaseapp.com`, `lift-tracker-fade7.web.app`, `isaacred718.github.io` (Custom)
- OAuth client ID: `1045140412331-30reu9jtrqcvs3pv63e49f6qjuie83cs.apps.googleusercontent.com` — all URIs now correctly configured
- Google sign-in popup opens successfully but `onAuthStateChanged` does not fire with user after popup closes
- `getRedirectResult()` handles iOS redirect errors in `initFirebase`
- `syncFromFirestore()` handles both Firestore Timestamp objects and ISO strings
- `syncToFirestore()` strips `activeWorkout` mid-workout state from cloud payload
- `renderCloudUI()` now called on both sign-in success and sign-out
- Firebase SDKs: `firebase-app-compat`, `firebase-auth-compat`, `firebase-firestore-compat` v10.14.1 via CDN
- Service worker aggressively caches — needs SW unregister + cache clear + hard reload to pick up new code
- OAuth client changes may take 5 min to a few hours to propagate

## Relevant Files
- `/Volumes/1TB/Openwork/fitness-tracker/index.html`: Main app (~3850+ lines, single-file): Firebase SDK, cloud sync JS, sync status header, Cloud Sync settings section
- `/Volumes/1TB/Openwork/fitness-tracker/sw.js`: Service worker (network-first, CACHE_NAME=`lift-tracker-v3`)
- `/Volumes/1TB/Openwork/fitness-tracker/manifest.json`: PWA manifest
- `/Volumes/1TB/Openwork/fitness-tracker/icons/icon-192.png`, `icon-512.png`: PWA icons
- `/Volumes/1TB/Openwork/fitness-tracker/APPLE_HEALTH_SHORTCUT.md`: Apple Shortcut setup guide
- GitHub repo: `https://github.com/Isaacred718/fitlog-tracker`
- GitHub Pages: `https://isaacred718.github.io/fitlog-tracker/`
- Firebase Console: `https://console.firebase.google.com/project/lift-tracker-fade7/authentication/providers`
- Google Cloud OAuth client: `https://console.cloud.google.com/apis/credentials/oauthclient/1045140412331-30reu9jtrqcvs3pv63e49f6qjuie83cs.apps.googleusercontent.com?project=lift-tracker-fade7`

### iOS PWA Google sign-in fix (v2.1, lift-tracker-v7)
- Root cause: iOS Home Screen apps (standalone) cannot use `signInWithPopup` (no popups). `signInWithRedirect` hops through `lift-tracker-fade7.firebaseapp.com`, iOS treats that as leaving the PWA, and the OAuth result opens in Safari. Safari and the Home Screen app have **isolated storage** since iOS 16.4, so a Safari login does not sign in the PWA. Firebase also stores the pending redirect in `sessionStorage`, which iOS wipes when the PWA is killed.
- Fix:
  1. Bake default Firebase config so a fresh Home Screen install does not need to re-enter keys (isolated localStorage).
  2. iOS standalone uses Google OIDC (`response_type=id_token`) returning to same-origin `auth.html`, then `signInWithCredential`.
  3. Mirror Firebase `sessionStorage` into `localStorage` as a fallback.
  4. Service worker `lift-tracker-v7`: never cache `auth.html`; network-first for navigations.
- **Required one-time Google Cloud step:** add Authorized redirect URI `https://isaacred718.github.io/fitlog-tracker/auth.html` on OAuth client `1045140412331-30reu9jtrqcvs3pv63e49f6qjuie83cs`.
- After deploy: delete the old Home Screen icon and re-add the page (or force-close the PWA so SW v7 activates).
