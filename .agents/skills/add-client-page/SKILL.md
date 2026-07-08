---
name: Add Client Page
description: How to create a new React page with routing, tests, and GitHub Pages compatibility
---

# Adding a New Client Page

Follow every step — a task is not complete until all steps are done.

## Steps

1. **Create the page component** at `client/src/pages/<PageName>.jsx`:
   - Function component only, hooks-based
   - Use Tailwind utility classes for styling — no inline styles or CSS modules
   - JSX file extension (`.jsx`, not `.js`)

2. **Register the route** in `client/src/App.jsx`:

   ```jsx
   import <PageName> from "./pages/<PageName>";
   // Inside <Routes>:
   <Route path="/<url-path>" element={<PageName />} />
   ```

3. **Create co-located test** at `client/src/pages/<PageName>.test.jsx`:
   - Use `@testing-library/react` + `jest-dom` matchers
   - Wrap with `MemoryRouter` for routing context
   - Test rendering, key UI elements, and user interactions
   - Reference pattern: `client/src/pages/HomePage.test.jsx`

4. **Add E2E tests** if the page has visual/interactive behavior:
   - Create or update a spec in `client/e2e/`
   - Playwright validates real browser rendering that unit tests cannot catch
   - Required for: themes, animations, responsive layouts, complex interactions

5. **Update GitHub Pages SPA fallback** only if introducing a new top-level URL segment:
   - Check `client/public/404.html` — it handles SPA routing on GitHub Pages

6. **Verify paths work under base path**:
   - Use React Router relative paths or `import.meta.env.BASE_URL`
   - Never hard-code `/AlgoJourney/` — the base path is only active when `GITHUB_PAGES=true`

7. **Run verification**:
   ```bash
   npm run test:client
   cd client && npm run lint
   cd client && npm run test:e2e    # if E2E tests were added/modified
   ```

## State Management

- Use React Context (`client/src/context/`) for shared UI state
- Use `localStorage` for user preferences (follow existing key patterns)
- No Redux or Zustand — keep it simple unless a clear need emerges

## Constraints

- Function components + hooks only — never class components
- Tailwind utility classes only — never inline styles or CSS modules
- Never hard-code `localhost` or absolute origins — use relative `/api/...` paths
