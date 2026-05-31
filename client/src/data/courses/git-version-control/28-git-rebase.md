---
title: Rebasing
section: Rebasing
---

# Rebasing vs Merging

When you need to integrate changes from `main` into your `feature` branch, you have two options: Merge, or Rebase.

While `git merge` creates a new "Merge Commit" tying the two histories together, `git rebase` takes a fundamentally different approach. It mathematically rewrites history to create a perfectly linear, straight-line DAG.

## How Rebase Works Under the Hood

Imagine this DAG:

```text
          <-- Commit C <-- Commit D (main)
         /
Commit B
         \
          <-- Commit X <-- Commit Y (feature)
```

You are checked out on `feature`, and you run:

```bash
git rebase main
```

**Step 1: Finding the common ancestor.**
Git finds `Commit B`, where the two branches diverged.

**Step 2: Saving your work.**
Git takes all the commits you made on your feature branch (`X` and `Y`), calculates the exact diffs they introduced, and saves those diffs in a temporary cache. It then essentially runs `git reset --hard` to move your branch pointer to match `main` (`Commit D`).

```text
Commit B <-- Commit C <-- Commit D (main, feature)    [Cached: X, Y]
```

**Step 3: Replaying commits.**
Git systematically replays your cached commits, one by one, on top of `Commit D`.

Because the parent commit has changed (from B to D), the SHA-1 hash for your commits _must_ change. `Commit X` becomes `Commit X'`, and `Commit Y` becomes `Commit Y'`.

```text
Commit B <-- Commit C <-- Commit D <-- Commit X' <-- Commit Y' (feature)
```

Your history is now a perfectly straight line! When you eventually merge `feature` into `main`, it will be a clean fast-forward merge without a cluttered merge commit.

## Resolving Rebase Conflicts

Rebasing applies your commits one at a time. If `Commit X` conflicts with `Commit D`, the rebase will pause.

```text
CONFLICT (content): Merge conflict in file.txt
error: could not apply Commit X...
```

To proceed:

1. Open the file and manually resolve the conflict.
2. Run `git add file.txt` to stage the resolution.
3. Tell Git to continue the process:
   ```bash
   git rebase --continue
   ```

If you get overwhelmed and want to undo the entire operation:

```bash
git rebase --abort
```

## The Golden Rule of Rebasing

> [!CAUTION]
> **NEVER rebase commits that exist outside your repository and that people may have based work on.**

Because rebasing calculates brand new SHA-1 hashes for your commits (`X` becomes `X'`), you are effectively destroying the old commits and creating new ones that look similar.

If you push `Commit X` to GitHub, your coworker pulls it, and then you rebase your branch locally (turning it into `X'`) and force push, your coworker's local DAG will be completely broken. They will have a phantom branch pointing to an abandoned commit.

**Rebase local, unpushed branches only!**
