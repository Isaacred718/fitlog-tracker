# Dadbod Fitness (React app)

This directory is the new implementation of Dadbod Fitness (formerly Lift Tracker). The existing root
`index.html` remains the production GitHub Pages app until this migration is
feature-complete.

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
