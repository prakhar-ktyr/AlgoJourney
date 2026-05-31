---
title: Advanced Log & Status
section: Inspecting & Comparing
---

# Inspecting History: Advanced Log & Status

As your repository grows from a handful of commits to thousands, you need powerful tools to filter and inspect history.

## The Verbose Status (`git status -v`)

You already know `git status` tells you the state of the Three Trees. But if you want to know exactly _what_ changed inside the files that are currently staged, you can use the verbose flag:

```bash
git status -v
```

This will output the standard status information, followed by a full `git diff` showing the exact line-by-line changes of everything currently sitting in the Staging Area waiting to be committed.

## Advanced Log Formatting

`git log` is one of the most versatile commands in Git. Out of the box, it prints every commit with its full hash, author, date, and message. This gets overwhelming quickly.

Here are the most critical formatting flags:

### 1. The One-Liner

To condense each commit into a single line showing only the first 7 characters of the hash and the subject line:

```bash
git log --oneline
```

Output:

```text
463dc4f Add authentication middleware
f9e8d7c Add login form HTML
a1b2c3d Initial commit
```

### 2. The Stat Overview

If you want to know exactly which files were altered in each commit and how many lines were added/removed:

```bash
git log --stat
```

Output:

```text
commit 463dc4f...
Author: Jane Doe <jane@example.com>

    Add authentication middleware

 src/auth.js | 42 ++++++++++++++++++++++++++++++++++++++++++
 src/app.js  |  2 ++
 2 files changed, 44 insertions(+)
```

### 3. The Visual Graph

When working with branches and merges, visualizing the DAG (Directed Acyclic Graph) is crucial.

```bash
git log --graph --oneline --all
```

- `--graph`: Draws a text-based representation of the commit history lines on the left side.
- `--oneline`: Keeps it concise.
- `--all`: Shows history for _all_ branches, not just the one you are currently on.

Output:

```text
*   d4e5f6g Merge branch 'feature-login'
|\
| * a1b2c3d Add login form
| * z9y8x7w Add user model
* | f9e8d7c Update readme
|/
* 8g7h6i5 Initial commit
```

## Filtering the Log

Instead of scrolling through thousands of commits, you can ask Git to filter the log output.

**By Author:**

```bash
git log --author="Jane"
```

**By Date:**

```bash
git log --since="2.weeks.ago"
git log --until="2023-01-01"
```

**By Commit Message (Search):**
If you know a commit mentioned a specific Jira ticket or keyword:

```bash
git log --grep="JIRA-123"
```

**By File History:**
To see only the commits that modified a specific file:

```bash
git log -- src/auth.js
```

_(The `--` tells Git that what follows is a file path, not a branch name)._

**The Pickaxe (Search by Code Content):**
This is the most powerful filter. If you want to find the exact commit that introduced (or deleted) a specific string of code (e.g., a specific API key or function name):

```bash
git log -S "function calculateTax"
```

Git will search the actual _contents_ of every diff in history to find when that string was added or removed.
