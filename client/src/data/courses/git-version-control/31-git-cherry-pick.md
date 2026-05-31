---
title: Cherry Pick
section: Advanced Tools
---

# Cherry Picking Commits

`git cherry-pick` allows you to grab a specific, individual commit from any branch and graft a copy of it onto your current branch, without merging the rest of the branch.

## The Scenario

Imagine you are working on an experimental `feature-v2` branch. Over the course of 10 commits, you accidentally fix a critical bug in production, but the rest of the `feature-v2` code is heavily broken and cannot be merged into `main` for months.

You need that one specific bugfix commit (`a1b2c3d`) applied to `main` right now.

1. Switch to `main`:
   ```bash
   git switch main
   ```
2. Cherry-pick the hash:
   ```bash
   git cherry-pick a1b2c3d
   ```

## Under the Hood

Git calculates the diff introduced by `a1b2c3d`, applies that exact patch to `main`, and creates a brand new commit (with a new SHA-1 hash) containing those changes.

If the patch conflicts with the current state of `main`, Git will pause and ask you to resolve the conflict, exactly like a standard merge.

You can also cherry-pick a range of commits:

```bash
git cherry-pick a1b2c3d..f9e8d7c
```

> [!WARNING]
> Use cherry-picking sparingly. Because it creates duplicate commits with the exact same code but different SHA-1 hashes, it can cause confusion later if the original branch is eventually merged into `main`. Git will see two identical sets of changes from different hashes.
