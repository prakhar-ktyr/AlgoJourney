---
title: Git Reflog
section: Safety Nets & Maintenance
---

# Git Reflog: The Ultimate Safety Net

In Git, there is a saying: **"If it has been committed, it is almost impossible to lose."**

Even if you use dangerous commands like `git reset --hard` or `git branch -D` to destroy commits and branches, those Commit, Tree, and Blob objects still exist in the `.git/objects/` database. They are just "unreachable" because no branch pointer is pointing to them anymore.

But how do you find the SHA-1 hash of a commit you deleted so you can recover it?

Enter the **Reflog** (Reference Log).

## What is the Reflog?

While `git log` shows the history of your code, `git reflog` shows the history of your `HEAD` pointer.

Every single time your `HEAD` pointer moves—whether you commit, switch branches, rebase, reset, or pull—Git secretly records where it moved from and where it moved to in a local, private log.

```bash
git reflog
```

Output:

```text
a1b2c3d HEAD@{0}: reset: moving to HEAD~1
f9e8d7c HEAD@{1}: commit: Add dangerous bug
a1b2c3d HEAD@{2}: checkout: moving from feature to main
```

This log is kept entirely local to your machine. It is never pushed to a remote server. By default, entries stay in the reflog for 30 to 90 days.

## Recovering Lost Commits

Let's look at the scenario above.

1. You were on `main`.
2. You created `Commit f9e8d7c` ("Add dangerous bug").
3. You panicked and ran `git reset --hard HEAD~1` to nuke the commit.

The commit is gone from `git log`. But the reflog remembers that at `HEAD@{1}`, your pointer was sitting right on `f9e8d7c`.

If you realize you actually _did_ need some code from that nuked commit, you can simply use the hash from the reflog to get it back!

You can check it out to look at it:

```bash
git checkout f9e8d7c
```

Or you can create a brand new branch right there to rescue it permanently:

```bash
git branch rescue-branch f9e8d7c
```

Or you can just cherry-pick it back onto your current branch.

## Recovering from a Bad Rebase

If you perform an Interactive Rebase, squash 10 commits together, and then realize you made a horrible mistake and broke your repository, standard undo commands won't help you because the DAG has been completely rewritten.

But the `reflog` remembers exactly where your branch pointer was before the rebase started.

You simply find the hash in `git reflog` before the `rebase (start)` entry, and run:

```bash
git reset --hard <old-hash>
```

Your branch pointer instantly snaps back to the old, un-rebased commits, completely undoing the rebase.
