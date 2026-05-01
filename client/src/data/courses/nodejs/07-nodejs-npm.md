---
title: Node.js npm
---

# Node.js npm

**npm** (Node Package Manager) is the world's largest software registry. It ships with Node.js and gives you access to over 2 million packages — from web frameworks to utility libraries to CLI tools.

## What is npm?

npm is three things:

1. **The registry** — A massive online database of JavaScript packages at [npmjs.com](https://www.npmjs.com).
2. **The CLI tool** — A command-line program (`npm`) for installing, updating, and managing packages.
3. **The website** — Browse packages, read docs, manage organizations.

## Initializing a project

Every Node.js project starts with a `package.json` file. Create one interactively:

```bash
mkdir my-project
cd my-project
npm init
```

npm will ask you a series of questions (name, version, description, etc.). Press Enter to accept defaults.

For a quick start with all defaults:

```bash
npm init -y
```

This creates a minimal `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Installing packages

### Install a production dependency

```bash
npm install express
```

This does three things:
1. Downloads `express` and its dependencies into `node_modules/`.
2. Adds `"express"` to the `"dependencies"` section of `package.json`.
3. Updates `package-lock.json` with exact versions.

### Install a development dependency

Development dependencies are only needed during development (test frameworks, linters, build tools):

```bash
npm install --save-dev vitest
```

Or the shorthand:

```bash
npm install -D vitest
```

This adds it to `"devDependencies"` instead of `"dependencies"`.

### Install a specific version

```bash
npm install express@4.18.2
```

### Install globally

Global packages are available as CLI commands from anywhere:

```bash
npm install -g nodemon
```

> **Tip:** Prefer local installs and `npx` over global installs. Global packages can cause version conflicts between projects.

### Install all dependencies

When you clone a project that already has a `package.json`:

```bash
npm install
```

This reads `package.json` and installs everything listed in `dependencies` and `devDependencies`.

## The `node_modules` folder

When you install a package, it goes into the `node_modules/` directory in your project. This folder can be huge — it's normal for it to contain thousands of files.

**Never commit `node_modules` to git.** Add it to `.gitignore`:

```
# .gitignore
node_modules/
```

Anyone who clones your project runs `npm install` to recreate `node_modules` from `package.json`.

## Using installed packages

After installing, import the package in your code:

```javascript
// CommonJS
const express = require("express");

// ES Modules
import express from "express";
```

Node.js looks in `node_modules/` when you require/import a package by name (without a path prefix like `./`).

## Uninstalling packages

```bash
npm uninstall express
```

This removes the package from `node_modules/` and from `package.json`.

## Updating packages

### Check for outdated packages

```bash
npm outdated
```

Output:

```
Package  Current  Wanted  Latest  Location
express  4.18.2   4.18.3  5.0.0   my-project
```

- **Current** — What you have installed.
- **Wanted** — The highest version that satisfies your semver range.
- **Latest** — The newest version on the registry.

### Update packages

```bash
npm update          # update all packages to their "wanted" version
npm update express  # update a specific package
```

To jump to a new major version (e.g., express 4 → 5), you need to install it explicitly:

```bash
npm install express@latest
```

## Listing installed packages

```bash
npm list              # full dependency tree
npm list --depth=0    # only top-level packages
npm list -g --depth=0 # globally installed packages
```

## npx — Run packages without installing

`npx` runs a package's binary without a global install:

```bash
npx create-react-app my-app
npx cowsay "Hello!"
npx http-server .          # start a static file server
```

If the package isn't installed locally, npx downloads it temporarily, runs it, and cleans up.

## Useful npm commands

| Command | Description |
|---|---|
| `npm init -y` | Create package.json with defaults |
| `npm install <pkg>` | Install a package |
| `npm install -D <pkg>` | Install as dev dependency |
| `npm install` | Install all dependencies from package.json |
| `npm uninstall <pkg>` | Remove a package |
| `npm update` | Update packages to latest compatible version |
| `npm outdated` | Check for outdated packages |
| `npm list --depth=0` | List installed packages |
| `npm run <script>` | Run a script from package.json |
| `npm test` | Shorthand for `npm run test` |
| `npm start` | Shorthand for `npm run start` |
| `npm audit` | Check for security vulnerabilities |
| `npm audit fix` | Auto-fix vulnerabilities |
| `npm cache clean --force` | Clear the npm cache |
| `npm info <pkg>` | Show package details from the registry |
| `npm search <keyword>` | Search the registry |

## npm audit — Security scanning

npm can check your dependencies for known security vulnerabilities:

```bash
npm audit
```

If issues are found:

```bash
npm audit fix            # auto-fix compatible updates
npm audit fix --force    # fix with major version updates (may break things)
```

Run `npm audit` regularly and before deploying to production.

## Common mistakes

### 1. Committing `node_modules`

Never commit `node_modules` to version control. It's enormous and reproducible from `package.json` + `package-lock.json`.

### 2. Ignoring `package-lock.json`

`package-lock.json` locks exact dependency versions so every developer and CI server installs the same tree. **Commit it to git.**

### 3. Using `sudo` with npm

If you need `sudo` to install packages, your npm setup is broken. Use a version manager (nvm/fnm) instead.

### 4. Installing everything globally

Global installs cause version conflicts. Install project dependencies locally and use `npx` for CLI tools.
