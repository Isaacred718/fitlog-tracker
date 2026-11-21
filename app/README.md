# Dadbod Fitness (React app)

This directory holds the source of Dadbod Fitness (formerly Lift Tracker).
It is the live app: as of 2026-11-21 the
production build is committed both at app/dist (preview URL
https://isaacred718.github.io/fitlog-tracker/app/dist/) and at the repo root,
so https://isaacred718.github.io/fitlog-tracker/ — and the installed home
screen app — serve the redesign. The classic single-file app is preserved
at legacy.html (its sign-in helper auth.html returns there). After changing
anything in app/src: run npm run build, copy app/dist/index.html to the repo
root index.html and app/dist/assets/ over the root assets/, and commit the
source change, both build copies, and the root files together. On first launch the app migrates the legacy
liftTracker save (workouts, templates, in-progress session) into its own
store; the legacy key is left untouched for the classic app at legacy.html.

## Commands

- `npm run dev` — run the new app locally.
- `npm run build` — type-check and produce the new static site in `app/dist`.
- `npm run preview` — serve the built site locally.
- `npm test` — unit tests for prefill, plan/week status, streaks and routing (Vitest).
- `npm run typecheck` — TypeScript only.

All commands run from the repo root.

## Design system

- Dark forest background, lime accent (`#8cf23a`). Type: Barlow Condensed (display, numbers) + Barlow (body), self-hosted via Fontsource.
- Liquid Glass is reserved for chrome: floating tab bar, sticky week strip, logging dock, inline rest timer, sheets, toasts and CTAs. Content cards stay solid for contrast.
- `prefers-reduced-transparency` swaps glass for opaque surfaces; `prefers-reduced-motion` removes motion; `prefers-contrast: more` strengthens lines and secondary text.
- Every primary control is at least 56px tall and the main actions sit in the bottom thumb zone.
- Hash routes: `#/plan[/YYYY-MM-DD][/add]`, `#/progress[/settings]`, `#/library[/templates[/id]]`.

## Migration order

1. Domain types and pure utilities
2. Workout logging, rest timer, and templates
3. Imports, exports, and Apple Health integration
4. Firebase auth and Firestore sync, including the iOS PWA OIDC handoff
5. Remaining views, PWA assets, then GitHub Pages cutover
