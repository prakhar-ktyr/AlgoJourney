# AlgoJourney — Agent Instructions

MERN-stack learning platform (CS, AI, DSA tracker). Monorepo with two independent packages — `server/` (Express 5 + Mongoose 9 API) and `client/` (React 19 + Vite 6 + Tailwind 4 SPA) — orchestrated from the root `package.json` via `concurrently`. Not an npm workspaces setup; always `cd` into the relevant package to install or run scripts.

## Architecture

### Directory Map

```
server/
├── index.js              # Express app entry; exports `app` for tests
├── db.js                 # MongoDB connection (mongoose.connect)
├── routes/               # Express Routers mounted in index.js
├── models/               # One Mongoose schema per file + barrel index.js
├── middleware/            # Express middleware (auth, etc.)
└── __tests__/            # Server tests (supertest + vitest)

client/src/
├── App.jsx               # All routes registered here (React Router)
├── main.jsx              # React DOM render entry
├── pages/                # Route-level page components
├── components/           # Shared UI components
├── context/              # React Context providers (ReaderModeContext)
├── lib/                  # Utilities — api.js, slugify.js, highlight.js
├── data/                 # Static content and data registries
│   ├── courses.js        # Course registry (auto-discovers lessons via import.meta.glob)
│   ├── courses/          # Markdown lessons organized by topic
│   ├── problemResources.js # DSA notes registry (auto-discovers via import.meta.glob)
│   ├── resources/        # Markdown problem notes organized by step
│   ├── striversSheet.js  # DSA sheet data (455 problems, fixed dataset)
│   └── topics.js         # Topic/category registry (mirrors server enums)
└── test/                 # Test setup (jest-dom matchers)
```

### Key Architecture Decisions

- **Server entry guard**: `index.js` skips `connectDB()` and `app.listen()` when `NODE_ENV=test`. Preserve this guard when adding bootstrap code.
- **Server routes**: Express Routers in `routes/`, mounted in `index.js` via `app.use()`. Never add inline route handlers to `index.js`.
- **Model barrel**: Models re-exported from `models/index.js` alongside domain enums (e.g. `DSA_TOPICS`). Import from the barrel.
- **API proxy**: Dev client proxies `/api/*` → `http://localhost:5000` via `vite.config.js`. Always use relative `/api/...` paths.
- **GitHub Pages base**: Vite `base` is `/AlgoJourney/` only when `GITHUB_PAGES=true`. Use `import.meta.env.BASE_URL` or React Router relative paths — never hard-code the prefix.

### Data Flow Patterns

- **Content auto-discovery**: `courses.js` and `problemResources.js` use Vite's `import.meta.glob` to auto-discover `.md` files. New content files are picked up automatically — never import them manually. The folder structure must match the expected pattern.
- **Client–server enum mirroring**: `data/topics.js` defines `TUTORIAL_CATEGORIES` and `ALL_TOPICS` on the client; `models/Tutorial.js` and `models/DSAQuestion.js` define matching enums on the server. These must stay in sync when modified.
- **State management**: React Context for shared UI state (`ReaderModeContext`). No Redux or Zustand. Keep it this way unless a clear need emerges.
- **Persistence via localStorage**: Used for DSA progress (`dsa-progress`), language preference (`preferred-language`), and reader mode settings (`reader-mode-prefs`). Follow this pattern for new user preferences.
- **Markdown rendering**: `components/Markdown.jsx` is a custom parser/renderer (not react-markdown). See `data/courses/AUTHORING.md` for supported syntax. Don't assume standard markdown features work — verify against the renderer.

## Conventions

- **ESM everywhere** (`"type": "module"` in both packages). Use `import`/`export`; include `.js` extension on relative server imports (e.g. `import connectDB from "./db.js"`).
- **Formatting**: Prettier (`.prettierrc.json`) — 2 spaces, double quotes, semicolons, trailing commas. Husky pre-commit hook auto-formats.
- **React**: Function components only, hooks-based, JSX files use `.jsx`. Tailwind utility classes for styling — no CSS modules, styled-components, or inline styles.
- **ESLint**: `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'` — prefix intentionally-unused identifiers with uppercase or underscore.
- **Client tests**: Co-located as `*.test.jsx` next to the component. Uses `@testing-library/react` + `jest-dom` + `jsdom` environment.
- **Server tests**: Centralized in `server/__tests__/` as `*.test.js`. Uses `supertest` against the exported `app` with `NODE_ENV=test`.
- **E2E tests**: `client/e2e/` using Playwright (Chromium). For visual/interactive behavior that unit tests cannot catch.

## Constraints

These are non-negotiable. Violating any of them is a bug.

- **Never** use `require()` or CommonJS — ESM (`import`/`export`) everywhere.
- **Never** use class components — function components + hooks only.
- **Never** add inline styles or CSS modules — use Tailwind utility classes.
- **Never** hard-code `localhost` or absolute origins in client code — use relative `/api/...` paths.
- **Never** commit `.env` files — use `.env.example` for documentation.
- **Never** call `connectDB()` or `app.listen()` unconditionally — tests import `app` and a real DB connection will hang the suite.
- **Never** import content `.md` files manually — they are auto-discovered via `import.meta.glob`.
- **Never** modify `TUTORIAL_CATEGORIES` in `topics.js` without updating the corresponding server model enum, or vice versa.
- **Never** declare a task complete without a test that exercises the changed behavior.
- **Never** add a new API endpoint without updating `docs/api.md`.
- **Never** add a new env var without updating `server/.env.example` and the README.
- **Never** modify project conventions without updating this file.

## Build & Test Commands

Run from repo root unless noted. For the full list see [README.md](README.md).

```bash
npm run dev              # server (5000) + client (3000) concurrently
npm test                 # server + client test suites
npm run test:server      # server only
npm run test:client      # client only
cd client && npm run lint
cd client && npm run test:e2e   # Playwright E2E (headless Chromium)
```

## Gotchas

- Deploy workflow (`.github/workflows/deploy-pages.yml`) sets `GITHUB_PAGES=true`; verify new asset paths resolve under `/AlgoJourney/` base.
- CORS origin in `server/index.js` is hard-switched on `NODE_ENV`; extend `cors()` config rather than disabling it.
- Prettier auto-runs on commit via Husky — do not disable or skip the pre-commit hook.
- Detailed docs live in `docs/` (database schemas, API endpoints, test coverage) and `CONTRIBUTING.md` — keep them in sync when making structural changes.
- `db.js` calls `process.exit(1)` on connection failure — be aware this kills the process hard; not ideal for containers or graceful shutdown.
