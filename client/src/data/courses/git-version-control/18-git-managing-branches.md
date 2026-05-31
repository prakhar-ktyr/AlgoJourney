---
title: Managing Branches
section: Branching Fundamentals
---

# Managing Branches

Now that we understand the lightweight nature of branches under the hood, let's cover the commands used to manage them daily.

## Listing Branches

To see all the local branches in your repository:

```bash
git branch
```

Output:

```text
  feature-login
* main
  testing
```

The asterisk `*` indicates the branch your `HEAD` is currently pointing to (the branch you have checked out).

To see all local branches _and_ remote-tracking branches (branches that represent the state of the server):

```bash
git branch -a
```

To see the last commit on every branch:

```bash
git branch -v
```

## Creating Branches

To create a new branch pointing to the current commit:

```bash
git branch <branch-name>
```

_(Remember: This only creates the pointer. It does NOT automatically switch you to that new branch.)_

## Renaming Branches

If you misspelled a branch name, or need to adhere to a naming convention, you can rename the branch you are currently on using the `-m` (move) flag:

```bash
git branch -m feature-authentication
```

## Deleting Branches

Once you have merged a feature branch into `main`, that branch pointer is no longer useful. It is good practice to delete it to keep your branch list clean.

To safely delete a branch:

```bash
git branch -d feature-login
```

**The Safety Check:**
If you try to delete a branch that contains commits that have _not_ been merged into your current branch, Git will stop you:

```text
error: The branch 'feature-login' is not fully merged.
If you are sure you want to delete it, run 'git branch -D feature-login'.
```

This protects you from accidentally deleting unmerged work. If you truly want to discard the experimental branch and its unmerged commits, you use the capital `-D` flag:

```bash
git branch -D feature-login
```

## Merged vs Unmerged Filtering

If you have a repository with dozens of branches, it can be hard to know which ones are safe to delete. You can filter the branch list:

To see only branches that have already been merged into your current branch (safe to delete):

```bash
git branch --merged
```

To see branches that contain work not yet merged into your current branch:

```bash
git branch --no-merged
```
