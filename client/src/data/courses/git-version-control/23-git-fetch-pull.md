---
title: Fetch & Pull
section: Remote Repositories
---

# Fetch and Pull

When you work on a team, other developers will push their commits to the remote server (e.g., GitHub). To see their work, you must synchronize your local repository with the remote.

This is done using `git fetch` and `git pull`.

## The Safe Way: `git fetch`

`git fetch` is the safest network command in Git.

```bash
git fetch origin
```

When you run this command, Git connects to the remote server (`origin`) and downloads all new Commits, Blobs, and Trees that you don't already have.

**Crucially, `git fetch` does NOT alter your Working Directory.**

It only updates your **remote-tracking branches** (e.g., `origin/main`).

If your coworker pushed a new commit to `main`, running `git fetch` updates your local DAG to look like this:

```text
          <-- Commit D <-- [origin/main]
         /
Commit B <-- Commit C <-- [main] <-- (HEAD)
```

Now you have the data locally. You can run `git log origin/main` to inspect your coworker's commits, or `git diff main origin/main` to see exactly what code they changed, all without touching your active workspace.

When you are ready to integrate their work, you run a standard local merge:

```bash
git merge origin/main
```

## The Convenience Way: `git pull`

Running `fetch` and then `merge` every single time is tedious. `git pull` was created as a shortcut.

```bash
git pull origin main
```

**`git pull` is literally just a wrapper command that executes two commands back-to-back:**

1. `git fetch origin main`
2. `git merge origin/main`

Because it executes a merge immediately, `git pull` _will_ alter your Working Directory. If your coworker's changes conflict with your local unpushed changes, running `git pull` will throw you directly into a merge conflict state.

### Pulling with Rebase

Many teams prefer a linear history without messy merge commits. You can configure `git pull` to perform a `rebase` instead of a `merge` in its second step.

```bash
git pull --rebase origin main
```

This fetches the latest code, temporarily moves your local commits aside, applies your coworker's commits, and then replays your commits on top. (We will cover rebasing deeply in a later section).

## Upstream Tracking Branches

If you always type `git pull origin main`, you can configure Git to remember the relationship between your local `main` branch and the remote `origin/main` branch.

This relationship is called an **upstream tracking branch**. If it is configured, you can simply type:

```bash
git pull
```

Git will automatically know to pull from `origin` into `main`. We will see how to establish this upstream link in the next lesson using `git push`.
