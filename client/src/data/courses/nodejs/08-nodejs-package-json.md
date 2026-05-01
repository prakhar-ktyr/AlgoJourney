---
title: Node.js package.json
---

# Node.js package.json

The `package.json` file is the heart of every Node.js project. It describes your project, lists its dependencies, defines scripts, and configures tools. Every npm command reads or writes to this file.

## Creating package.json

```bash
npm init          # interactive — asks questions
npm init -y       # quick — accepts all defaults
```

## Anatomy of package.json

Here is a fully annotated example:

```json
{
  "name": "my-api",
  "version": "1.0.0",
  "description": "A REST API for managing tasks",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "keywords": ["api", "tasks", "express"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "vitest": "^1.0.0",
    "eslint": "^9.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Let's break down each field.

## Core fields

### `name`

The package name. Must be lowercase, no spaces. Use hyphens for multi-word names:

```json
"name": "my-awesome-app"
```

If you publish to npm, the name must be unique on the registry.

### `version`

Follows **semantic versioning** (semver): `MAJOR.MINOR.PATCH`.

```json
"version": "1.2.3"
```

- **MAJOR** (1) — Breaking changes
- **MINOR** (2) — New features, backward-compatible
- **PATCH** (3) — Bug fixes, backward-compatible

### `description`

A short description of what the project does. Shows up in npm search results.

### `main`

The entry point when someone `require()`s your package:

```json
"main": "index.js"
```

For ESM, also set `"exports"`:

```json
"exports": {
  ".": "./index.js"
}
```

### `type`

Controls whether `.js` files use CommonJS or ES Modules:

```json
"type": "module"       // .js files use import/export
"type": "commonjs"     // .js files use require/module.exports (default)
```

## Scripts

The `scripts` field defines commands you can run with `npm run <name>`:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "build": "tsc",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint .",
  "format": "prettier --write ."
}
```

**Running scripts:**

```bash
npm run dev         # runs "nodemon index.js"
npm run lint        # runs "eslint ."
npm test            # shorthand for "npm run test"
npm start           # shorthand for "npm run start"
```

`npm test` and `npm start` are special — they don't need `run`.

### Pre and post hooks

npm automatically runs `pre<name>` before and `post<name>` after a script:

```json
"scripts": {
  "pretest": "npm run lint",
  "test": "vitest run",
  "posttest": "echo Tests passed!"
}
```

Running `npm test` will execute: `lint` → `vitest run` → `echo Tests passed!`.

## Dependencies

### `dependencies`

Packages your app needs to run in production:

```json
"dependencies": {
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "dotenv": "^16.3.1"
}
```

Installed with:

```bash
npm install express
```

### `devDependencies`

Packages needed only during development:

```json
"devDependencies": {
  "nodemon": "^3.0.0",
  "vitest": "^1.0.0",
  "eslint": "^9.0.0",
  "prettier": "^3.1.0"
}
```

Installed with:

```bash
npm install -D nodemon
```

When deploying to production, you can skip dev dependencies:

```bash
npm install --production
# or
NODE_ENV=production npm install
```

## Semver ranges

The version numbers in dependencies use **semver ranges** to control which updates are allowed:

| Range | Meaning | Example: if set to `^4.18.2` |
|---|---|---|
| `^4.18.2` | Compatible with 4.x.x (minor + patch updates) | Allows 4.18.3, 4.19.0, NOT 5.0.0 |
| `~4.18.2` | Patch updates only | Allows 4.18.3, NOT 4.19.0 |
| `4.18.2` | Exact version only | Only 4.18.2 |
| `>=4.18.2` | Any version 4.18.2 or higher | Allows 5.0.0 |
| `*` | Any version | Allows everything |

**The caret `^` is the default** when you `npm install`. It allows minor and patch updates but not major (breaking) changes.

## package-lock.json

When you install dependencies, npm generates `package-lock.json`. This file locks the **exact versions** of every package in your tree.

**Why it matters:**
- Without the lock file, `npm install` might install different versions on different machines.
- With the lock file, every developer and CI server gets identical `node_modules`.

**Rules:**
- Always commit `package-lock.json` to git.
- Never edit it manually.
- Use `npm ci` in CI/CD pipelines — it installs from the lock file exactly, faster and stricter than `npm install`.

```bash
npm ci    # clean install from lock file (deletes node_modules first)
```

## Other useful fields

### `engines`

Specify which Node.js versions your project supports:

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### `private`

Prevents accidental publishing to npm:

```json
"private": true
```

### `repository`

Link to your source code:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/user/repo.git"
}
```

### `bin`

If your package provides a CLI command:

```json
"bin": {
  "my-tool": "./bin/cli.js"
}
```

After installing globally, `my-tool` becomes available as a terminal command.

### `files`

Control which files are included when publishing:

```json
"files": ["dist/", "README.md", "LICENSE"]
```

## A real-world example

Here is a production-ready `package.json` for an Express API:

```json
{
  "name": "task-api",
  "version": "2.1.0",
  "description": "RESTful API for task management",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "nodemon": "^3.0.0",
    "prettier": "^3.1.0",
    "supertest": "^6.3.3",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "private": true,
  "license": "MIT"
}
```

## Key takeaways

- `package.json` describes your project and its dependencies.
- `dependencies` are for production, `devDependencies` are for development.
- Semver ranges (`^`, `~`) control how packages update.
- `package-lock.json` locks exact versions — always commit it.
- Use `npm ci` in CI/CD for reproducible installs.
- Scripts let you define reusable commands with `npm run`.
