---
title: Git Worktree
section: Advanced Tools
---

# Git Worktree

By default, a Git repository has one `.git` directory and exactly one Working Directory. If you need to look at two branches at the same time, you normally have to clone the entire repository twice into two separate folders on your hard drive.

`git worktree` solves this elegantly. It allows you to have multiple Working Directories on your hard drive, all powered by a single underlying `.git` database.

## The Scenario

You are deep into writing a complex algorithm on `feature-algo`. It's currently compiling.
Your manager asks you to review a Pull Request on the `ui-fixes` branch immediately.

If you use `git switch`, you have to tear down your dev server, stash your changes, switch, review, switch back, and restart your server.

## Creating a Worktree

Instead, you can create a second Working Directory alongside your current one:

```bash
# git worktree add <path-to-new-folder> <branch-name>
git worktree add ../repo-ui-review ui-fixes
```

Git creates a brand new folder named `repo-ui-review` sitting right next to your current project folder. Inside that folder, the `ui-fixes` branch is checked out.

You can now open a second VS Code window in that new folder, run a second dev server, and test the UI branch, while your original algorithm branch stays completely untouched in your first folder.

## Managing Worktrees

To list all active worktrees attached to your repository:

```bash
git worktree list
```

Output:

```text
/Users/jane/Projects/repo            123abcd [feature-algo]
/Users/jane/Projects/repo-ui-review  456defg [ui-fixes]
```

## Removing a Worktree

When you are done with the review, you simply delete the folder, and tell Git to prune the tracking so it knows the worktree is gone:

```bash
rm -rf ../repo-ui-review
git worktree prune
```

Alternatively, Git provides a dedicated remove command:

```bash
git worktree remove ../repo-ui-review
```

Worktrees save massive amounts of disk space and cloning time for large monorepos, and allow true parallel multitasking without the overhead of stashing.
