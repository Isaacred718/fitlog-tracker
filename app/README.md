# React migration workspace

This directory is the new implementation of Lift Tracker. The existing root
`index.html` remains the production GitHub Pages app until this migration is
feature-complete.

## Commands

- `npm run dev` — run the new app locally.
- `npm run build` — type-check and produce the new static site in `app/dist`.
- `npm run preview` — serve the built site locally.

## Migration order

1. Domain types and pure utilities
2. Workout logging, rest timer, and templates
3. Imports, exports, and Apple Health integration
4. Firebase auth and Firestore sync, including the iOS PWA OIDC handoff
5. Remaining views, PWA assets, then GitHub Pages cutover
