# AlgoJourney — Copilot Instructions

Before assisting with any code generation, answering architectural questions, or reviewing pull requests, read `.agents/AGENTS.md` at the workspace root. That file is the single source of truth for all project conventions, architecture, data flow patterns, and workflow checklists.

## Critical Constraints

These always apply, even without reading AGENTS.md:

- **Never** use `require()` or CommonJS — ESM (`import`/`export`) everywhere.
- **Never** use class components — function components + hooks only.
- **Never** add inline styles or CSS modules — use Tailwind utility classes.
- **Never** hard-code `localhost` or absolute origins in client code — use relative `/api/...` paths.
- **Never** commit `.env` files — use `.env.example` for documentation.
- **Never** call `connectDB()` or `app.listen()` unconditionally — tests import `app` and a real DB connection will hang the suite.
- **Never** import content `.md` files manually — they are auto-discovered via `import.meta.glob`.
- **Never** declare a task complete without a test that exercises the changed behavior.
- **Never** add a new API endpoint without updating `docs/api.md`.
- **Never** add a new env var without updating `server/.env.example` and the README.
