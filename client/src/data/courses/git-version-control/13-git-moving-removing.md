---
title: Moving & Removing
section: The Core Workflow
---

# Moving and Removing Files

Because Git tightly tracks the state of your Working Directory, renaming, moving, or deleting files requires a bit of care.

While you _can_ use your standard operating system commands (like `rm` or `mv`), Git provides its own built-in commands (`git rm` and `git mv`) that make the process much smoother by automatically updating the Staging Area.

## Removing Files (`git rm`)

If you want to completely delete a tracked file from both your Working Directory and your Git repository, you use `git rm`.

```bash
git rm deprecated_script.js
```

### What happens internally?

1. Git physically deletes the file `deprecated_script.js` from your hard drive.
2. Git removes the file from the Staging Area (the Index).

If you run `git status` after this command, you will see the deletion is already staged and ready to be committed:

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        deleted:    deprecated_script.js
```

### What if I use standard `rm`?

If you just delete the file using your OS (e.g., right-clicking and hitting delete, or running `rm deprecated_script.js` in the terminal), Git notices the file is missing from the Working Directory, but it is _still_ in the Staging Area.

Your `git status` will look like this:

```text
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
        deleted:    deprecated_script.js
```

To finish the job, you must run `git rm deprecated_script.js` (or `git add deprecated_script.js`) to update the Staging Area. Using `git rm` initially just saves you a step.

### Removing from Git but keeping locally (`--cached`)

As mentioned in the `.gitignore` lesson, if you want to stop tracking a file but keep it on your hard drive, use the `--cached` flag:

```bash
git rm --cached config.json
```

## Moving and Renaming Files (`git mv`)

In Git, renaming a file and moving a file to a new directory are the exact same operation. You are just changing its path.

```bash
git mv old_name.txt new_name.txt
```

### What happens internally?

1. Git renames the file on your hard drive.
2. Git stages the deletion of the old file name.
3. Git stages the addition of the new file name.

`git status` output:

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        renamed:    old_name.txt -> new_name.txt
```

### Does Git track file renames?

Technically, **no**. Git does not explicitly store a "rename" record in its database.

Because Git only cares about contents (hashing Blobs), if it sees a file disappear (`old.txt`) and a new file appear (`new.txt`) with the exact same Blob hash, it dynamically deduces: "Ah, this must be a rename!"

This is why `git mv` is technically just a convenient shortcut for:

```bash
mv old.txt new.txt
git rm old.txt
git add new.txt
```

Git figures out the rest automatically.
