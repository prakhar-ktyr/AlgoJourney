---
title: Tracking Files
section: The Core Workflow
---

# Tracking and Staging Files

Once you have initialized a repository, every file in your Working Directory exists in one of two fundamental states:

1. **Untracked**: The file exists on your hard drive, but Git has no record of it in the repository.
2. **Tracked**: Git knows about the file.

Tracked files can further exist in three states: **Unmodified**, **Modified**, or **Staged**.

## Checking File States (`git status`)

The `git status` command is the window into the Three Trees. It tells you exactly where your files currently sit.

```bash
git status
```

Output on a brand new repository with a single file (`script.js`):

```text
On branch main
No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        script.js

nothing added to commit but untracked files present (use "git add" to track)
```

## Moving Files to the Staging Area (`git add`)

To tell Git to begin tracking an untracked file, or to stage a modified tracked file, you use the `git add` command.

```bash
git add script.js
```

### What happens internally?

When you run `git add script.js`, Git reads the contents of `script.js`, compresses it, hashes it with SHA-1, and writes it directly into the `.git/objects/` database as a Blob.

It then updates the Staging Area (the Index) to say: "The file `script.js` should point to this new Blob hash in the next commit."

### Adding Multiple Files

You can add multiple files simultaneously:

```bash
git add file1.txt file2.txt
```

You can add an entire directory:

```bash
git add src/
```

The most common shortcut is to add _all_ untracked and modified files in the current directory and its subdirectories using a period (`.`):

```bash
git add .
```

## The Staging Area is a Snapshot, not a Link

A critical concept for beginners to grasp is that `git add` takes a **snapshot** of the file at the exact moment you run the command.

Imagine this sequence:

1. You edit `script.js` to add a new function.
2. You run `git add script.js` (The Staging Area now contains the function).
3. You realize you forgot a semicolon, so you edit `script.js` again and save it.
4. You run `git commit`.

**The commit will NOT include the semicolon!**

When you ran `git add` the first time, Git captured the file exactly as it was. The second edit modified the Working Directory, but you did not restage it.

If you run `git status` after step 3, you will see a fascinating output:

```text
Changes to be committed:
        modified:   script.js

Changes not staged for commit:
        modified:   script.js
```

Git is telling you that `script.js` is simultaneously staged (the version without the semicolon) and modified (the version with the semicolon). To include the semicolon in the commit, you must run `git add script.js` a second time to update the Staging Area snapshot.
