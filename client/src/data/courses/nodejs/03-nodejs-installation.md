---
title: Node.js Installation
---

# Node.js Installation

Before you write any code, you need Node.js installed on your machine. This lesson walks you through every step on macOS, Windows, and Linux.

## Check if Node.js is already installed

Open a terminal (or Command Prompt on Windows) and run:

```bash
node --version
```

If you see a version like `v20.11.0`, you already have Node.js. You can skip ahead. If you see "command not found", keep reading.

Also check npm (Node Package Manager), which ships with Node.js:

```bash
npm --version
```

## Option 1: Download from the official website (recommended for beginners)

1. Go to [https://nodejs.org](https://nodejs.org).
2. You will see two download buttons: **LTS** and **Current**. Choose **LTS** — it is the stable, recommended version.
3. Download the installer for your operating system.
4. Run the installer and follow the prompts. Accept the defaults.
5. Restart your terminal, then verify:

```bash
node --version
npm --version
```

Both commands should print version numbers.

## Option 2: Install with a version manager (recommended for developers)

A version manager lets you install **multiple versions** of Node.js and switch between them. This is essential when you work on projects that require different versions.

### nvm (macOS / Linux)

**nvm** (Node Version Manager) is the most popular choice on Unix systems.

**Install nvm:**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Close and reopen your terminal, then verify:

```bash
nvm --version
```

**Install the latest LTS version:**

```bash
nvm install --lts
```

**Switch between versions:**

```bash
nvm install 18        # install Node.js 18
nvm install 20        # install Node.js 20
nvm use 20            # switch to Node.js 20
nvm alias default 20  # make 20 the default
```

**List installed versions:**

```bash
nvm ls
```

### fnm (macOS / Linux / Windows)

**fnm** (Fast Node Manager) is a faster, cross-platform alternative written in Rust.

```bash
# macOS (Homebrew)
brew install fnm

# Linux
curl -fsSL https://fnm.vercel.app/install | bash

# Windows (winget)
winget install Schniz.fnm
```

**Usage:**

```bash
fnm install --lts
fnm use 20
fnm default 20
```

### nvm-windows (Windows)

Download the installer from the [nvm-windows releases page](https://github.com/coreybutler/nvm-windows/releases).

```bash
nvm install lts
nvm use 20.11.0
```

## Option 3: Package managers

### macOS (Homebrew)

```bash
brew install node
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install nodejs npm
```

Note: The version in apt repositories is often outdated. For the latest version, use the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

### Windows (Chocolatey)

```bash
choco install nodejs-lts
```

### Windows (winget)

```bash
winget install OpenJS.NodeJS.LTS
```

## Verify your installation

After installing, run these three commands:

```bash
node --version    # e.g., v20.11.0
npm --version     # e.g., 10.2.4
npx --version     # e.g., 10.2.4
```

- **node** — the JavaScript runtime
- **npm** — the package manager for installing libraries
- **npx** — a tool for running packages without installing them globally

## Your first Node.js program

Create a file called `hello.js`:

```javascript
console.log("Node.js is installed and working!");
console.log("Node version:", process.version);
console.log("Platform:", process.platform);
console.log("Architecture:", process.arch);
```

Run it:

```bash
node hello.js
```

You should see output like:

```
Node.js is installed and working!
Node version: v20.11.0
Platform: darwin
Architecture: arm64
```

## Understanding what you installed

When you install Node.js, you get three things:

1. **`node`** — The runtime that executes JavaScript files.
2. **`npm`** — The package manager for installing third-party libraries.
3. **`npx`** — A tool that runs npm packages without installing them globally. For example, `npx create-react-app my-app` runs `create-react-app` without a global install.

## Updating Node.js

**With nvm:**

```bash
nvm install --lts     # installs the latest LTS
nvm alias default lts/*
```

**With the installer:** Download the new version from nodejs.org and run it — it overwrites the previous installation.

**With Homebrew:**

```bash
brew upgrade node
```

## Troubleshooting

### "node: command not found"

- Your terminal does not know where `node` is. Restart the terminal after installation.
- On macOS/Linux with nvm, make sure the nvm init script is in your shell profile (`~/.bashrc`, `~/.zshrc`).

### Permission errors with npm

Never use `sudo` with npm. If you get `EACCES` errors, either:
- Use a version manager (nvm/fnm) — they install to your home directory, no `sudo` needed.
- Or change npm's default directory: `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to your `PATH`.

### Multiple Node.js installations conflicting

Use `which node` (macOS/Linux) or `where node` (Windows) to see which binary is being used. Remove duplicates or use a version manager to take control.
