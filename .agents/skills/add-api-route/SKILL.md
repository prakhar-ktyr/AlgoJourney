---
name: Add API Route
description: How to create a new Express API route with tests and documentation, following project conventions
---

# Adding a New API Route

Follow every step — a task is not complete until all steps are done.

## Steps

1. **Create the Router** at `server/routes/<name>.js`:
   - Use ESM (`import`/`export`), include `.js` extension on relative imports
   - Export the router as default
   - Use `express.Router()`, not inline handlers in `index.js`

2. **Mount in `server/index.js`**:

   ```js
   import <name>Routes from "./routes/<name>.js";
   app.use("/api/<name>", <name>Routes);
   ```

   - Place the import with the other route imports
   - Place `app.use()` with the other route mounts

3. **Add authentication** if the route requires it:

   ```js
   import { authenticate, requireAdmin } from "../middleware/auth.js";
   router.get("/protected", authenticate, (req, res) => { ... });
   ```

4. **Create `server/__tests__/<name>.test.js`** using supertest:
   - Import `app` from `../index.js`
   - Tests run with `NODE_ENV=test` automatically (wired in `vitest.config.js`)
   - Test happy path, validation errors, auth failures, and edge cases
   - Reference pattern: `server/__tests__/auth.test.js` or `server/__tests__/health.test.js`

5. **Update `docs/api.md`** with the new endpoint(s): method, path, request body, response shape, auth requirements.

6. **Update `server/.env.example`** if the route needs new environment variables. Also document them in `README.md` under "Configure environment".

7. **Run verification**:
   ```bash
   npm run test:server
   ```

## Constraints

- Never add route handlers directly in `index.js` — always use a Router file
- Never call `connectDB()` or access the real database in tests
- ESM only — no `require()`, include `.js` on relative imports
