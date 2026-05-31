---
title: Git Reset
section: Undoing & History Modification
---

# Git Reset: The Time Machine

If `git revert` is the safe way to undo a public mistake, `git reset` is the aggressive way to erase local mistakes.

`git reset` actually moves the `HEAD` pointer and your branch pointer backward in time, rewriting the DAG.

Because it rewrites history, **you should never use `git reset` on commits that have already been pushed to a shared remote.**

## The Three Levels of Reset

To master `git reset`, you must return to the Three Trees: The Repository (HEAD), the Staging Area, and the Working Directory.

`git reset` can alter one, two, or all three of these trees simultaneously, depending on the flag you use.

Suppose your history looks like this, and you want to erase `Commit C`:

```text
Commit A <-- Commit B <-- Commit C <-- (HEAD, main)
```

### 1. Soft Reset (`--soft`)

```bash
git reset --soft HEAD~1
```

- **HEAD**: Moved back to Commit B.
- **Staging Area**: Untouched.
- **Working Directory**: Untouched.

**Result**: Git moves your branch pointer backward, but it leaves all the code from Commit C sitting perfectly in your Staging Area, ready to be committed again.
_Use case_: You made a commit, but immediately realized you forgot to include a file. You `--soft` reset, `git add` the forgotten file, and commit again.

### 2. Mixed Reset (`--mixed`)

This is the default mode if you don't provide a flag.

```bash
git reset --mixed HEAD~1
```

- **HEAD**: Moved back to Commit B.
- **Staging Area**: Wiped clean (matches Commit B).
- **Working Directory**: Untouched.

**Result**: Git moves the pointer back and empties your Staging Area. However, all the code from Commit C is still sitting safely in your Working Directory as "unstaged changes."
_Use case_: You made a massive commit and realize it should have been broken up into three smaller, atomic commits. You `--mixed` reset, and now you can carefully `git add` and commit the files in smaller chunks.

### 3. Hard Reset (`--hard`)

```bash
git reset --hard HEAD~1
```

- **HEAD**: Moved back to Commit B.
- **Staging Area**: Wiped clean.
- **Working Directory**: Wiped clean (matches Commit B).

**Result**: Total destruction. Git moves the pointer back and completely overwrites your physical files on your hard drive to match Commit B. All the code from Commit C is instantly vaporized.
_Use case_: You spent the last hour writing terrible code, you hate it, and you want to completely nuke the Working Directory and return to a clean slate.

> [!WARNING]
> `git reset --hard` is one of the few commands in Git that will permanently destroy uncommitted work. Always use `git status` before running a hard reset to ensure you don't have uncommitted files you care about.
