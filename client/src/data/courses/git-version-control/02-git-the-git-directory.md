---
title: The .git Directory
section: Git Internals (Deep Dive)
---

# The .git Directory

To truly master Git, you must understand that your working directory (the files you see and edit) is entirely separate from Git's internal database.

When you run `git init` in a folder, Git creates a hidden directory named `.git`.

**This `.git` folder IS the repository.** Everything else in your folder is merely a temporary "working tree" extracted from this database. If you delete the `.git` folder, your files remain safe, but your entire version control history vanishes instantly.

Let's look inside a fresh `.git` directory to see how Git stores its brain.

## Directory Structure

If you navigate into a `.git` folder and list its contents (using `ls -la`), you will see a structure like this:

```text
.git/
├── HEAD
├── config
├── description
├── hooks/
├── info/
├── objects/
└── refs/
```

Here is a breakdown of the critical components:

### 1. `config`

This file contains project-specific configuration options. This is where Git stores information about remote repositories you connect to (like GitHub URLs) and specific branch tracking configurations. It overrides your global `~/.gitconfig` file.

### 2. `hooks/`

This directory contains shell scripts that are triggered automatically when specific Git events occur. For example, a `pre-commit` hook script runs right before a commit is created. If the script fails (e.g., because a linter found an error), the commit is aborted. We will cover hooks in detail later.

### 3. `info/exclude`

This file acts exactly like a `.gitignore` file, allowing you to ignore files and patterns. However, unlike `.gitignore`, this file is not committed to the repository, meaning the ignore patterns are strictly private to your local clone.

### 4. `objects/` (The Database)

**This is the core of Git.** The `objects` directory is a simple key-value store that holds the compressed contents of every single version of every single file you have ever committed, as well as the commit metadata and directory trees.

Every object is named by a 40-character SHA-1 hash. We will dive deep into this in the next lesson.

### 5. `refs/` (Pointers)

Short for "references", this directory stores pointers to specific commit objects.

- `refs/heads/`: Contains files representing your local branches (e.g., `main`, `feature-login`). The file simply contains the 40-character SHA-1 hash of the commit that branch currently points to.
- `refs/tags/`: Contains files representing tags (like `v1.0.0`).
- `refs/remotes/`: Contains pointers to the last known state of branches on remote servers.

### 6. `HEAD`

This is a single text file that tells Git exactly what you are currently looking at in your working directory.

If you output the contents of `HEAD` while on the main branch:

```bash
cat .git/HEAD
```

Output:

```text
ref: refs/heads/main
```

It is literally just a pointer to a pointer. It tells Git: "Right now, the user has checked out the `main` branch."

## The Illusion of Branches

When beginners use Git, they often imagine branches as physical copies of directories, or heavy architectural constructs.

Looking at the `.git` directory reveals the truth: **A branch in Git is nothing more than a text file containing 40 characters.**

When you create a new branch called `testing`:

1. Git creates a new file at `.git/refs/heads/testing`.
2. It writes the exact same 40-character commit hash into that file that your current branch points to.

That's it. Creating a branch is virtually instantaneous and consumes almost zero disk space, which is why branching in Git is heavily encouraged.

In the next lesson, we will look closely at the `objects/` directory to see how Git mathematically guarantees the integrity of your code.
