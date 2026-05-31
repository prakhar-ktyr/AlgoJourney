---
title: Git Push
section: Remote Repositories
---

# Git Push

When you have committed your changes locally and are ready to share them with your team (or back them up to the cloud), you use the `git push` command.

This command takes your local commits, calculates which ones the remote server is missing, uploads the necessary Blobs, Trees, and Commits, and updates the branch pointer on the server.

## Pushing an Existing Branch

If your local `main` branch is already tracking `origin/main`, pushing is as simple as:

```bash
git push
```

## Pushing a New Branch

If you created a new branch locally (e.g., `feature-login`), the remote server does not know about it yet. If you try to run `git push`, Git will reject it:

```text
fatal: The current branch feature-login has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin feature-login
```

This error is Git's way of asking: _"I see you want to push this branch, but to which remote server, and what should I name the branch on that server?"_

To upload the branch and establish the tracking link permanently, run the suggested command (often abbreviated as `-u`):

```bash
git push -u origin feature-login
```

_(In the future, you can just run `git push` from this branch)._

## Dealing with Rejected Pushes

Because Git is decentralized, it is entirely possible that while you were working offline, a coworker pushed their own commits to the `main` branch on the server.

If you try to push your local `main` branch, Git will reject it with a "non-fast-forward" error:

```text
! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/user/repo.git'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally. This is usually caused by another repository pushing
hint: to the same ref. You may want to first integrate the remote changes
hint: (e.g., 'git pull ...') before pushing again.
```

Git is protecting the server's history. It refuses to let you overwrite your coworker's commits.

**The Fix:**
You must pull their changes down to your local machine, merge them (or rebase them) with your changes, and _then_ push the combined result back up.

```bash
git pull
# Resolve any conflicts if necessary
git push
```

## Force Pushing

What if you _want_ to overwrite the server's history? (For example, if you accidentally pushed a password and used `git reset` to remove it locally).

You can force Git to overwrite the remote pointer:

```bash
git push --force
```

> [!CAUTION]
> **Never `--force` push to a shared public branch like `main`.** You will destroy your coworkers' history, causing massive headaches for the entire team. Only force push to your own personal feature branches.

### The Safer Force Push

Instead of `--force`, professionals use:

```bash
git push --force-with-lease
```

This checks the server first. If a coworker has pushed new commits to your feature branch that you haven't fetched yet, `--force-with-lease` will abort, preventing you from accidentally overwriting their work. Standard `--force` is blind and overwrites everything.
