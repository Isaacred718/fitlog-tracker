# Apple Watch bridge — plan (written 2026-11-21, not built)

Goal: log sets from the Apple Watch during a workout, by voice dictation on
the Watch mic or simple taps, without touching the phone.

## Why this shape

watchOS cannot run the web app (no PWA support, no service workers), and a
native Watch app means a full Swift build plus an iPhone companion app —
disproportionate for set logging. Apple Shortcuts does run on the Watch,
supports Dictate Text on the Watch mic, menus, and web requests, and can be
triggered by Siri or a complication. So the Watch side is a Shortcut; the
bridge is a one-way cloud inbox; the app applies what lands.

## Architecture

    Watch Shortcut (Siri / tap)
      -> POST command JSON to a private Firestore inbox doc
      -> Dadbod Fitness (during an active workout) polls the inbox,
         applies each command to the live session, then clears it

- Backend: the existing Firebase project (lift-tracker-fade7), Firestore
  REST from the Shortcut (no SDK needed), fetch-based polling in the app.
- Addressing: one inbox document per user at `watchInbox/<token>`, where
  <token> is a random 128-bit string the app generates (Settings -> Watch).
  The token is the address and the credential in one; knowing it is the
  only way in. Firestore rules get one narrow block: read/write on
  `watchInbox/{token}` without auth, everything else unchanged. This is a
  deliberate, documented tradeoff for a single-user app; rotating the token
  in Settings revokes the old Shortcut instantly.
- The Shortcut holds the token in one variable at the top, pasted once
  during setup. Setup instructions ship inside the Shortcut as a comment.

## Command set (v1, deliberately small)

Commands target the app's current focus (the set the logging dock is on):

- `{"cmd":"log","weight":225,"reps":5}` — set actuals on the focused set
  and complete it (rest timer starts, focus advances, same as tapping Done).
- `{"cmd":"done"}` — complete the focused set exactly as planned/prefilled.
- `{"cmd":"weight","weight":225}` — change the focused set's weight only.
- `{"cmd":"reps","reps":8}` — change the focused set's reps only.
- `{"cmd":"undo"}` — un-complete the last completed set (fat-finger repair).

Each command carries a client-generated id and timestamp. The app keeps the
last applied id in its store, so a command is never applied twice, and
ignores anything older than 10 minutes (a Shortcut fired at home must not
land in tonight's session).

## Watch UX

One Shortcut, "Log Set", with a menu when run by tap:

- "Log weight and reps" -> Dictate Text -> parse two numbers (accepts
  "225 for 5", "225, 5", "225 by 5") -> POST `log`.
- "Set done" -> POST `done` (no dictation; one tap from the Watch face).
- "Change weight" -> Dictate one number -> POST `weight`.
- Speak-back confirmation on the Watch ("Logged 225 for 5") from the POST
  response body, so he never looks at the phone.

Siri path: "Hey Siri, Log Set" then the same dictation prompt.

## App side (React)

- Settings -> Watch section: shows bridge status, generates/rotates the
  token, shows the setup steps and the Shortcut install link.
- Poller: active only while a workout is in progress — every 5 seconds and
  on visibilitychange/foreground. Applies commands through the existing
  store actions (updateSet + completeSet semantics), so prefill, PR
  detection, rest timer and undo toasts all behave as if he tapped.
- Feedback: each applied command fires the normal toast ("Watch: logged
  225 x 5"). A command that arrives with no active workout is dropped with
  a stored note surfaced next launch ("2 Watch logs arrived with no
  workout running").
- No other behavior changes. Local-only caveat stands: the redesign has
  no full cloud sync yet, so Watch logs live where all redesign logs live,
  on the phone. If/when the Firebase sync port (app README step 4) lands,
  the inbox should move behind his real sign-in and the token retired.

## Build order when greenlit

1. Firestore rules block for `watchInbox/{token}` + deploy rules (needs
   Isaac's Firebase CLI/console login — the one step that is his).
2. App: token generation + Settings UI + poller + command applier, with
   unit tests for parsing/applying and a Playwright pass that posts fake
   commands to an emulator/local stub and watches them land.
3. The Shortcut, built once and exported as an iCloud install link.
4. Real-device check on his Watch + phone: dictate at working-set noise
   levels, confirm speak-back, confirm the phone applies within ~5s.

## Phase 2 (only if v1 earns it)

- Native Watch app (Swift) with WatchConnectivity: real buttons, haptics
  on rest-timer end, no cloud hop. Revisit after a few weeks of v1 use.
- Rest-timer control from the Watch (start/+15s/skip mirror the dock).
- In-app voice logging on the phone mic (the classic app had voice; the
  redesign does not yet) — separate small feature, same parser.
