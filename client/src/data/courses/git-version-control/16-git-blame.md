---
title: Git Blame
section: Inspecting & Comparing
---

# Git Blame: Finding Authorship

When working on a large, collaborative codebase, you will inevitably encounter a line of code that confuses you, contains a bug, or seems out of place.

Your first question will be: _"Who wrote this line, and why?"_

The `git blame` command answers exactly that.

## Annotating a File

To see the authorship annotation for an entire file, run:

```bash
git blame src/auth.js
```

### The Output Format

Git will print every single line of the file, prefixed with metadata about the _last commit_ that modified that specific line.

```text
463dc4f (Jane Doe 2023-01-10 10:00:00 -0500 1) function validateToken(token) {
463dc4f (Jane Doe 2023-01-10 10:00:00 -0500 2)   if (!token) return false;
f9e8d7c (John S.  2023-02-15 14:22:11 -0500 3)   // Added debug logging
f9e8d7c (John S.  2023-02-15 14:22:11 -0500 4)   console.log("Token received:", token);
463dc4f (Jane Doe 2023-01-10 10:00:00 -0500 5)   return jwt.verify(token, secret);
463dc4f (Jane Doe 2023-01-10 10:00:00 -0500 6) }
```

In this example:

- Jane wrote lines 1, 2, 5, and 6 in commit `463dc4f` on January 10th.
- John later added lines 3 and 4 in commit `f9e8d7c` on February 15th.

## Investigating Further

`git blame` is just the first step. Once you find the hash (`f9e8d7c`), you can use `git show` to see the full commit message and context of John's change:

```bash
git show f9e8d7c
```

This is where the value of **Semantic Commit Messages** becomes obvious. If John's commit message says "Add debug logging to track down production issue JIRA-456", you now have the exact context you needed!

## Advanced Blame Options

### 1. Specifying Line Ranges

If a file has 10,000 lines, blaming the whole file is extremely noisy. You can blame a specific range using the `-L` flag:

```bash
git blame -L 3,6 src/auth.js
```

This will only annotate lines 3 through 6.

### 2. Ignoring Whitespace

Often, a developer will re-indent a file or format it using a tool like Prettier. This changes every single line in the file, making `git blame` attribute the entire file to the person who just formatted it, hiding the original authors.

To tell Git to ignore changes that _only_ affected whitespace:

```bash
git blame -w src/auth.js
```

### 3. Detecting Moved Code

Sometimes code is moved from one file to another. `git blame` might show the person who moved the code as the author. You can ask Git to try and detect lines that were copied or moved from other files in the same commit by using the `-C` flag:

```bash
git blame -C src/auth.js
```

> [!NOTE]
> Most modern IDEs (like VS Code with the GitLens extension, or IntelliJ) have `git blame` built directly into the editor interface, often showing the blame annotation faintly at the end of the line your cursor is currently on.
