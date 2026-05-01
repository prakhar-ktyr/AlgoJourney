---
title: JavaScript Best Practices
---

# JavaScript Best Practices

You now know the language. This final lesson is the distilled wisdom that turns "code that works" into "code your team can live with."

## Project hygiene

- **Use a package manager.** `npm`, `pnpm`, or `yarn`. Commit the lockfile.
- **Use Node ≥ 20 (LTS).** Pin the version in `.nvmrc` or `package.json`'s `engines` field.
- **Pick a linter and a formatter.**
  - **ESLint** — catches bugs (`no-unused-vars`, `no-floating-promises`, `eqeqeq`).
  - **Prettier** — formats code; eliminate every formatting argument.
- **Use TypeScript** — or at least JSDoc with `// @ts-check`. Most "production-grade" JavaScript codebases are typed today.
- **Write tests** — see the previous lesson.
- **Set up CI** — run lint + test on every push.
- **Use `.editorconfig`** so spaces vs tabs match your team's style automatically.

## Modern syntax to default to

- `const` first, `let` only when reassigning, never `var`.
- Arrow functions for callbacks; method shorthand for object methods.
- Template literals over `+` concatenation.
- Destructuring + default values for function parameters.
- Spread `...` for shallow copies and merges.
- Optional chaining `?.` and nullish coalescing `??` over manual undefined checks.
- `===` and `!==` everywhere. The only `==` is `value == null`.
- ES modules (`import`/`export`), not CommonJS, in new code.

## Asynchronicity

- Prefer `async`/`await` over `.then` chains.
- **Always** check `response.ok` after `fetch`.
- Run independent work in parallel with `Promise.all`.
- Never `await` inside `forEach`. Use `for…of` or `Promise.all(arr.map(...))`.
- Attach `.catch` (or surround with `try/catch`) — unhandled rejections crash Node.
- Pass an `AbortSignal` to long-running operations so they can be cancelled.

## Functions and modules

- Each function should do one thing — short, named after what it returns.
- Prefer **pure** functions when you can. They're trivial to test.
- Default to **named exports**. Reserve default exports for one-thing-per-file modules (a class, a React component).
- Keep modules small. If a file passes ~300 lines, ask whether it should split.
- Avoid circular imports — they work, but are a sign that two modules want to be one.

## Data and immutability

- Treat function arguments as **read-only**. Return new objects/arrays instead of mutating in place.
- Reach for `[...arr]`, `{...obj}`, and the immutable methods (`toSorted`, `toReversed`, `with`) where available.
- For deep clones, `structuredClone(value)` — handles dates, maps, sets, cycles.
- For deep updates, libraries like **Immer** make immutable code feel mutable.

## Naming

- `camelCase` for variables and functions. `PascalCase` for classes and components. `UPPER_SNAKE_CASE` for module-level constants.
- Names are *contracts*. Misleading names (a `getUser` function that also writes to a log) are worse than verbose ones.
- Booleans usually start with `is`, `has`, `can`, `should` (`isReady`, `hasAccess`, `canEdit`).
- Functions usually start with a verb (`create`, `fetch`, `format`).
- Plural for collections (`users`), singular for items (`user`).

## Errors

- Always throw `Error` (or a subclass), never strings.
- Make custom error classes for distinct failure modes (`ValidationError`, `NotFoundError`).
- Add a `cause` (`new Error("...", { cause: err })`) when wrapping a lower-level failure.
- Don't swallow errors. If you `catch`, either handle it meaningfully or re-throw.
- Validate inputs at boundaries (HTTP handlers, public functions) — trust internals.

## Performance and correctness

- **Don't optimize prematurely.** Measure first (`console.time`, browser profiler).
- Hot loops: prefer `for` over `forEach`/`map` when every microsecond counts.
- For many lookups, `Set`/`Map` (`O(1)`) beat `Array.includes` (`O(n)`).
- Cache expensive results — `useMemo` (React), `lru-cache` (Node), or a hand-rolled `Map`.
- Debounce/throttle high-frequency events (`scroll`, `input`, `resize`).
- Lazy-load with dynamic `import()` for code that isn't on the critical path.

## Security

- Treat all external data as **untrusted** — validate it before use.
- Never use `innerHTML` (or `dangerouslySetInnerHTML` in React) with untrusted strings. Use `textContent` or a templating library that escapes.
- Don't roll your own crypto. Use `crypto.subtle` in browsers, `node:crypto` in Node, or a vetted library like `bcrypt` for passwords.
- Don't put secrets in client-side code or in `localStorage`.
- Use `HttpOnly`, `Secure`, `SameSite=Lax` cookies for auth tokens.
- Keep dependencies updated. Run `npm audit` and tools like Dependabot.

## Logging and observability

- Don't `console.log` in production code paths — use a logger (`pino`, `winston`) you can level-filter.
- Log structured data (JSON), not strings — easier to query.
- Add request IDs / trace IDs — they're indispensable when debugging distributed systems.
- Capture unhandled errors at the top level (`window.onerror`, `process.on("uncaughtException")`).

## Documentation

- Write JSDoc on every exported function and class. Modern editors use it for autocomplete.
- A good `README.md` answers: what, install, run, test, deploy, troubleshoot.
- Comments explain **why**. The **what** is the code itself.
- Keep an `AGENTS.md` / `copilot-instructions.md` for AI assistants too — same idea, faster onboarding.

## Code review checklist (for yourself, before pushing)

1. **Does it work?** Run it and try the unhappy paths.
2. **Tests?** New tests for new code; updated tests for changed code.
3. **Lint?** No warnings, no `eslint-disable` without a comment explaining why.
4. **Types?** No `any`. No `// @ts-ignore` without a comment.
5. **Security?** No secrets, no SQL/HTML built by string concat, inputs validated.
6. **Naming?** Could a stranger guess what this does from the name?
7. **Dead code?** Removed.
8. **TODO/FIXME?** Linked to an issue or removed.
9. **Public API change?** Update the README and CHANGELOG.

## Things to **stop** doing

- `var` (use `const`/`let`).
- `==` (use `===`).
- `with`, `eval`, `new Function(...)` — almost always the wrong tool.
- `arguments` — use rest parameters.
- Mutating function inputs.
- Catching errors and silently dropping them.
- Mixing async styles in one function (callbacks + then + await).
- `for…in` on arrays.
- "Stringly-typed" code — magic strings everywhere; centralize them in constants or enums.

## A 60-second skeleton for a real Node project

```
my-app/
├── package.json         # type: module
├── tsconfig.json        # or jsconfig.json
├── .eslintrc.cjs
├── .prettierrc
├── .editorconfig
├── .nvmrc
├── .env.example
├── README.md
├── src/
│   ├── index.js         # entry
│   ├── lib/             # pure helpers
│   ├── services/        # business logic
│   └── routes/          # HTTP handlers
└── tests/
```

That's it — every project that grows beyond 100 lines benefits from this structure.

## Where to go next

You've covered the core language. From here:

- **TypeScript** — types make everything you've learned safer.
- **A framework** — React, Vue, Svelte, or SolidJS for UIs; Next.js, Remix, SvelteKit for full-stack apps.
- **Node ecosystem** — Express/Fastify/Hono for servers; Prisma/Drizzle for databases.
- **Tooling** — Vite, esbuild, Rollup; pnpm workspaces; Turborepo.
- **The web platform** — Service Workers, Web Components, WebGL, WebAssembly.

JavaScript is huge. You will keep learning. The good news: now that you understand the core, every new tool will feel familiar.

Happy hacking. ✨
