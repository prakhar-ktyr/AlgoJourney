---
title: Amending Commits
section: Undoing & History Modification
---

# Amending Commits

One of the most common scenarios in daily development is realizing you made a minor mistake _immediately_ after running `git commit`.

Perhaps you misspelled the commit message, or you forgot to stage a tiny configuration file.

Instead of creating a brand new commit that says "Fix typo in previous commit," or using a complex `git reset --soft`, Git provides a dedicated shortcut: `git commit --amend`.

## How to Amend a Commit

Let's say you committed a new feature, but forgot to include the updated `README.md`.

1. Stage the forgotten file:
   ```bash
   git add README.md
   ```
2. Run the amend command:
   ```bash
   git commit --amend
   ```

Git will open your text editor, showing your previous commit message. You can edit the message if you want, save, and close.

Git will seamlessly bundle the newly staged `README.md` and the new message into the previous commit.

## Amending Without Editing the Message

If you only forgot a file and don't want to change the commit message, you can bypass the text editor entirely using `--no-edit`:

```bash
git commit --amend --no-edit
```

## What Happens Under the Hood?

It is crucial to understand that `git commit --amend` **does not actually alter the existing commit.**

Because Commits are hashed via SHA-1, they are mathematically immutable. If you change the contents (by adding a file) or the metadata (by changing the message), the hash _must_ change.

When you run `--amend`, Git actually:

1. Creates a brand new Commit object with the new data.
2. Points `HEAD` to this new Commit.
3. Abandons the old Commit (which will eventually be garbage collected).

### The Golden Rule of Amending

Because amending creates a brand new SHA-1 hash, it rewrites history.

Therefore, the same rule applies to `--amend` as it does to `git reset`: **Never amend a commit that you have already pushed to a shared remote repository.**

If you push Commit `A`, your coworker pulls Commit `A`, and then you amend it to Commit `A2` and force push it, your coworker's history is now out of sync with the server, leading to chaotic merge conflicts. Only amend local, unpushed commits!
