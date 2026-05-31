---
title: Ignoring Files
section: The Core Workflow
---

# Ignoring Files

Almost every repository contains files that you absolutely _do not_ want Git to track.

Examples include:

- Compiled binaries (`.exe`, `.o`, `build/`)
- Third-party dependency folders (`node_modules/`, `vendor/`)
- System files (`.DS_Store` on macOS, `Thumbs.db` on Windows)
- Temporary log files (`*.log`)
- Secrets and API Keys (`.env`, `credentials.json`)

If you don't ignore these files, they will constantly show up in `git status` as "Untracked," cluttering your terminal and increasing the risk of accidentally committing them via `git add .`.

## The `.gitignore` File

To tell Git to systematically ignore certain files, you create a text file named exactly `.gitignore` in the root of your repository.

Inside this file, you list patterns for Git to match against.

### Glob Pattern Syntax

Git uses standard globbing patterns (similar to shell wildcard patterns):

- `*`: Matches zero or more characters. (e.g., `*.log` matches `error.log` and `debug.log`)
- `?`: Matches a single character.
- `[abc]`: Matches any one character listed in the brackets.
- `/`: Used to specify directories.
  - If placed at the start (`/build`), it matches the `build` directory _only_ at the root of the project, not `src/build`.
  - If placed at the end (`build/`), it matches the `build` directory anywhere in the project.
- `!`: Negates a pattern. (e.g., ignore all `.log` files _except_ `important.log`).
- `#`: Used for comments.

**Example `.gitignore` file:**

```text
# Ignore macOS system files
.DS_Store

# Ignore all log files
*.log

# BUT do not ignore this specific log file
!important.log

# Ignore the node_modules directory anywhere
node_modules/

# Ignore the build directory only at the root
/build/

# Ignore .env files containing passwords
.env
```

## The "Already Tracked" Problem

A very common mistake beginners make is committing a file, and _then_ deciding they want to ignore it.

They add the file to `.gitignore`, but to their surprise, Git keeps tracking the changes!

> [!IMPORTANT]
> **`.gitignore` only prevents untracked files from being added.** If a file is _already_ tracked in the repository, adding it to `.gitignore` does absolutely nothing. Git will continue to track it.

### How to ignore an already-tracked file

If you accidentally committed a `.env` file and need to remove it from Git's tracking _without_ deleting it from your local hard drive, you must use the `git rm --cached` command.

```bash
git rm --cached .env
```

This removes the file from the Staging Area (and therefore, the next commit), but leaves the actual physical file safely in your Working Directory. Now that it is untracked, your `.gitignore` rules will apply to it.
