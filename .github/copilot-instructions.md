# AlgoJourney — Copilot Instructions

MERN-stack learning platform (CS, AI, DSA tracker). Two npm workspaces orchestrated from the repo root: [server/](server/) (Express 5 + Mongoose 9 API) and [client/](client/) (React 19 + Vite 6 + Tailwind 4 SPA). See [README.md](README.md) for full setup and feature list.

## Architecture

- **Monorepo, not a workspaces package**: dependencies live in `client/` and `server/`. Always `cd` into the relevant folder when installing or running scripts; the root `package.json` only orchestrates via `concurrently`.
- **Server entry**: [server/index.js](server/index.js) — Express app exported as default for tests; `connectDB()` and `app.listen()` are skipped when `NODE_ENV=test`. Preserve this guard when adding bootstrap code.
- **Server routes**: live under [server/routes/](server/routes/) as Express Routers mounted in `index.js`. Add new routes here — do not add inline `app.get()`/`app.post()` calls to `index.js`.
- **Models**: ESM, one schema per file under [server/models/](server/models/), re-exported from [server/models/index.js](server/models/index.js). Domain enums (e.g. `DSA_TOPICS`, `TUTORIAL_CATEGORIES`) are exported alongside the model — import from the barrel.
- **Client routing**: all routes registered in [client/src/App.jsx](client/src/App.jsx); pages in [client/src/pages/](client/src/pages/), shared UI in [client/src/components/](client/src/components/), static content in [client/src/data/](client/src/data/).
- **API proxy**: dev client proxies `/api/*` → `http://localhost:5000` via [client/vite.config.js](client/vite.config.js). Always call the API through relative `/api/...` paths, never hard-code the server origin.
- **GitHub Pages base path**: Vite `base` switches to `/AlgoJourney/` only when `GITHUB_PAGES=true`. Don't hard-code the prefix in routes or asset URLs — use Vite's `import.meta.env.BASE_URL` or React Router's relative paths.

## Conventions

- **ESM everywhere** (`"type": "module"` in both packages). Use `import`/`export`, include the `.js` extension on relative server imports (e.g. `import connectDB from "./db.js"`).
- **Formatting**: Prettier ([.prettierrc.json](.prettierrc.json)) — 2 spaces, double quotes, semicolons, trailing commas. Husky pre-commit hook auto-formats staged files; no manual formatting needed.
- **React**: function components only, hooks-based, JSX files use `.jsx`. Tailwind utility classes for styling — no CSS modules, styled-components, or inline styles.
- **ESLint** ([client/eslint.config.js](client/eslint.config.js)) enforces `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` — prefix intentionally-unused identifiers with an uppercase letter or underscore.
- **Tests are co-located**: client unit/integration tests live next to the component as `*.test.jsx`; server tests live under [server/**tests**/](server/__tests__/) as `*.test.js`. Vitest is the runner in both packages.
- **E2E tests** live under [client/e2e/](client/e2e/) using Playwright (Chromium). E2E tests validate real browser behavior — styling, interactions, navigation flows. Run via `cd client && npm run test:e2e`.
- **Server tests** use `supertest` against the exported `app` and must run with `NODE_ENV=test` so DB/listen are skipped (already wired via [server/vitest.config.js](server/vitest.config.js)).
- **Client tests** rely on `@testing-library/react` + `jest-dom` matchers loaded from [client/src/test/setup.js](client/src/test/setup.js). Use `jsdom` environment (already configured).

## Constraints

- **Never** use `require()` or CommonJS — ESM (`import`/`export`) everywhere.
- **Never** use class components — function components + hooks only.
- **Never** add inline styles or CSS modules — use Tailwind utility classes.
- **Never** hard-code `localhost` or absolute origins in client code — use relative `/api/...` paths.
- **Never** commit `.env` files — use `.env.example` for documentation.
- **Never** call `connectDB()` or `app.listen()` unconditionally — tests import `app` and a real DB connection will hang the suite.
- **Never** add both `copilot-instructions.md` and `AGENTS.md`; this repo standardises on the former.

## Adding Features

- **New API route**: create a Router in `server/routes/<name>.js`, mount it in [server/index.js](server/index.js) via `app.use()`. Add a matching `*.test.js` under `__tests__/` using `supertest`.
- **New Mongoose model**: create `server/models/<Name>.js`, export the model as default plus any enum constants, then re-export from [server/models/index.js](server/models/index.js). Add a `*.model.test.js` covering required-field validation (mirror [server/**tests**/user.model.test.js](server/__tests__/user.model.test.js)).
- **New page**: add component under `client/src/pages/`, register the route in [client/src/App.jsx](client/src/App.jsx), and add a sibling `*.test.jsx`. Update [client/public/404.html](client/public/404.html) handling only if introducing new top-level segments (GitHub Pages SPA fallback).
- **New UI feature with visual behavior** (themes, animations, responsive layouts, interactive components): add Playwright E2E tests under [client/e2e/](client/e2e/) that validate the feature in a real browser. Unit tests alone cannot catch CSS/styling bugs.
- **New lesson content**: follow [client/src/data/courses/AUTHORING.md](client/src/data/courses/AUTHORING.md) for supported markdown syntax, interactive features, and language-specific content.
- **New DSA problem notes**: follow [client/src/data/resources/AUTHORING.md](client/src/data/resources/AUTHORING.md) for file naming, frontmatter, sections, per-language overrides, and multiple solutions.
- **Env vars**: read via `process.env.*` on the server only; never expose secrets to the client. Document any new variable in [README.md](README.md) under "Configure environment".

## After Making Changes

Before declaring a task done:

1. **Run the relevant test suite** (`npm run test:server`, `npm run test:client`, or `npm test` for both). Add or update tests for any behaviour you changed — never ship code without a passing test that exercises it.
2. **Run E2E tests** if you touched UI, styling, or interactions: `cd client && npm run test:e2e`. Add Playwright tests for any visual behavior that unit tests cannot verify (theme rendering, CSS specificity, computed styles, responsive layout, user flows).
3. **Run the linter** for the touched workspace (`cd client && npm run lint`).
4. **Update documentation in the same change**: keep [README.md](README.md) accurate, update this file when conventions change, update [CONTRIBUTING.md](CONTRIBUTING.md) or the relevant `AUTHORING.md` when content authoring rules change, and refresh `server/.env.example` whenever a new env var is introduced.

## Build & Test Commands

Run from repo root unless noted:

```bash
npm run install:all      # install client + server deps
npm run dev              # start server (5000) + client (3000) concurrently
npm test                 # run server + client test suites
npm run test:server      # vitest run (server only)
npm run test:client      # vitest run (client only)
npm run test:coverage    # vitest with coverage (both)
npm run build            # production build of client → client/dist/
cd client && npm run lint
cd client && npm run test:e2e     # Playwright E2E tests (headless Chromium)
cd client && npm run test:e2e:ui  # Playwright visual UI (local dev with display)
```

## Gotchas

- The deploy workflow ([.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)) sets `GITHUB_PAGES=true`; verify any new asset paths still resolve under the `/AlgoJourney/` base.
- CORS origin in [server/index.js](server/index.js) is hard-switched on `NODE_ENV`; when adding new client origins, extend the `cors()` config rather than disabling it.
- Prettier auto-runs on commit via Husky — do not disable or skip the pre-commit hook.
- Detailed docs live in [docs/](docs/) (database schemas, API endpoints, test coverage) and [CONTRIBUTING.md](CONTRIBUTING.md) — keep them in sync when making structural changes.
