---
title: Git Diff
section: Inspecting & Comparing
---

# Git Diff: Comparing Trees

While `git status` tells you _which_ files have changed, `git diff` tells you exactly _what_ changed inside those files, line-by-line.

Understanding `git diff` requires you to remember the Three Trees: the Working Directory, the Staging Area, and HEAD (the repository).

## 1. Comparing Working Directory vs Staging Area

If you just run `git diff` with no arguments:

```bash
git diff
```

This compares your **Working Directory** against your **Staging Area**.

It answers the question: _"What have I changed in my files that I have NOT yet staged?"_

Output example:

```diff
diff --git a/index.html b/index.html
index 8a2b3c..9f4e2d 100644
--- a/index.html
+++ b/index.html
@@ -10,4 +10,5 @@
 <body>
     <h1>Welcome!</h1>
-    <p>Old subtitle</p>
+    <p>New and improved subtitle</p>
+    <button>Click me</button>
 </body>
```

- Lines starting with `-` (in red) were deleted.
- Lines starting with `+` (in green) were added.

## 2. Comparing Staging Area vs HEAD

Once you stage a file using `git add`, running standard `git diff` will output absolutely nothing! This confuses many beginners. Why? Because `git diff` only shows unstaged changes.

To see what you are _about to commit_, you must compare the **Staging Area** against **HEAD** (the last commit).

```bash
git diff --staged
```

_(Note: `--cached` is an exact synonym for `--staged` and is often used interchangeably)._

This answers the question: _"If I run `git commit` right now, exactly what changes will be recorded?"_

## 3. Comparing Working Directory vs HEAD

If you want to see all changes you have made since your last commit, regardless of whether they are staged or unstaged, you compare your Working Directory directly against HEAD:

```bash
git diff HEAD
```

## Comparing Branches and Commits

`git diff` is not just for comparing your active workspace. You can use it to compare any two arbitrary points in the DAG.

**Comparing two branches:**

```bash
git diff main feature-login
```

This shows the differences between the tip of the `main` branch and the tip of the `feature-login` branch.

**Comparing two specific commits:**
You can provide any two SHA-1 hashes to see the exact code difference between those two snapshots in time:

```bash
git diff a1b2c3d f9e8d7c
```

**Comparing against a time in the past:**

```bash
git diff HEAD HEAD~3
```

This compares your current commit against the commit that occurred 3 steps ago.

> [!TIP]
> If you only want to see _which files_ changed between two branches, and don't want to see the massive line-by-line code output, use the `--name-only` or `--stat` flags:
> `git diff --stat main feature-login`
