---
title: Merging Strategies
section: Merging & Conflicts
---

# Merging Strategies

When you have finished work on a feature branch and want to integrate those changes back into your main codebase, you use the `git merge` command.

```bash
git switch main
git merge feature-login
```

Depending on how the DAG (Directed Acyclic Graph) has evolved while you were working on your feature, Git will automatically choose one of two primary merging strategies: **Fast-forward** or **3-Way Merge**.

## 1. The Fast-Forward Merge

A fast-forward merge occurs when the branch you are merging _into_ (`main`) has not received any new commits since you branched off of it.

```text
Before Merge:
Commit A <-- Commit B (main)
                     \
                      \-- Commit C <-- Commit D (feature-login)
```

Because `main` is a direct ancestor of `feature-login`, Git doesn't actually need to do any work to merge the files. It simply takes the `main` branch pointer and physically moves it forward to point to `Commit D`.

```text
After Fast-Forward Merge:
Commit A <-- Commit B <-- Commit C <-- Commit D (main, feature-login)
```

The history remains a perfectly straight line.

### Forcing a merge commit (`--no-ff`)

Sometimes, teams prefer to preserve the historical fact that a feature branch existed, even if a fast-forward is possible. You can force Git to create a merge commit using the `--no-ff` (no fast-forward) flag:

```bash
git merge --no-ff feature-login
```

## 2. The 3-Way Merge (Recursive/Ort)

A 3-way merge occurs when both branches have received independent commits since they diverged.

```text
Before Merge:
          <-- Commit X <-- Commit Y (main)
         /
Commit B
         \
          <-- Commit C <-- Commit D (feature-login)
```

In this scenario, Git cannot simply move the `main` pointer forward, because it would abandon Commits X and Y.

Instead, Git performs a **3-Way Merge**. It looks at three specific commits to calculate the final result:

1. The tip of `main` (Commit Y)
2. The tip of `feature-login` (Commit D)
3. The **Common Ancestor** (Commit B)

Git mathematically compares Y against B, and D against B, to figure out exactly what changed on both sides. It combines all the changes together, creates a brand new snapshot, and creates a **Merge Commit** with _two_ parents.

```text
After 3-Way Merge:
          <-- Commit X <-- Commit Y <-------
         /                                  \
Commit B                                     \-- Commit Z (main)
         \                                  /
          <-- Commit C <-- Commit D <-------
```

`Commit Z` is a special commit. It doesn't contain any direct edits of its own; it simply represents the unification of the two branches.

## What if Git can't combine them?

If a developer edited `index.html` on `main` to change the background to red, and you edited the exact same line of `index.html` on `feature-login` to change the background to blue, Git's algorithm will halt.

It cannot mathematically determine which color is "correct." This results in a **Merge Conflict**, which requires human intervention. We will cover resolving conflicts in the next lesson.
