---
title: Restore & Revert
section: Undoing & History Modification
---

# Restore and Revert

Making mistakes is inevitable. Fortunately, Git is designed as a time machine. The commands you use to undo a mistake depend entirely on whether that mistake is uncommitted, committed locally, or already pushed to a public server.

## 1. Undoing Uncommitted Changes (`git restore`)

In 2019, Git introduced `git restore` to cleanly separate the act of modifying files from `git checkout`.

### Discarding changes in the Working Directory

If you edited `index.html`, haven't staged it yet, and realize your code is completely broken, you can revert the file back to exactly how it looked in your last commit:

```bash
git restore index.html
```

_(Warning: This destroys your uncommitted work permanently. There is no undo for this undo)._

### Unstaging a file

If you accidentally ran `git add .` and staged a file you didn't mean to, you can pull it out of the Staging Area without losing the physical changes in your Working Directory:

```bash
git restore --staged config.js
```

The file `config.js` is now back in the "Modified" (unstaged) state.

## 2. Undoing Public Commits (`git revert`)

What happens if you commit a bug, push it to GitHub, and your coworkers pull it?

You **cannot** delete the commit using `git reset`. If you rewrite public history, your coworkers' local repositories will diverge from the server, causing massive conflicts.

Instead, you use `git revert`.

```bash
git revert a1b2c3d
```

### How `git revert` works

Instead of erasing the bad commit from history, `git revert` creates a **brand new commit** that introduces the exact mathematical opposite of the bad commit.

If Commit `a1b2c3d` added 5 lines of code, the revert commit will delete those exact 5 lines.

```text
Commit A <-- Commit B (The Bug) <-- Commit C (The Fix/Revert)
```

This is the only safe way to undo a mistake on a shared branch like `main`. It preserves the history (showing that the bug did exist at one point) while safely neutralizing its effects, and it can be pushed to the server normally without causing conflicts for your team.
