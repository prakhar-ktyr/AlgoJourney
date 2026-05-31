---
title: Git Stash
section: Advanced Tools
---

# Git Stash: The Temporary Drawer

Imagine you are halfway through implementing a complex new feature. Your Working Directory is full of broken, uncompilable code.

Suddenly, your manager tells you there is a critical bug in production. You need to switch to the `main` branch immediately to fix it.

If you try to `git switch main`, Git will abort because your broken code conflicts with the `main` branch.

You don't want to `git commit` this broken code, because it ruins your commit history. You don't want to `git reset --hard`, because you'll lose hours of work.

The solution is `git stash`.

## Stashing Your Work

`git stash` takes all the uncommitted changes in your Working Directory and Staging Area, sweeps them up, and saves them safely in a temporary internal drawer. It then runs a `git reset --hard` to return your Working Directory to a perfectly clean state.

```bash
git stash
```

Output:

```text
Saved working directory and index state WIP on feature: a1b2c3d Add new database schema
```

Now you can freely switch to `main`, write your hotfix, commit it, and push it.

## Retrieving Stashed Work

Once the emergency is over, you switch back to your `feature` branch. You need your broken code back.

You have two options:

### 1. Pop (Apply and Delete)

```bash
git stash pop
```

This applies the saved changes back into your Working Directory, and then automatically deletes the stash from the drawer. This is the most common command.

### 2. Apply (Apply and Keep)

```bash
git stash apply
```

This applies the changes to your Working Directory, but leaves a copy in the stash drawer. This is useful if you want to apply the same stashed changes to multiple different branches.

## Managing Multiple Stashes

You can stash multiple times without popping. Git treats the stash like a stack data structure (Last In, First Out).

To see everything currently in your stash drawer:

```bash
git stash list
```

Output:

```text
stash@{0}: WIP on feature: a1b2c3d Add new database schema
stash@{1}: WIP on main: f9e8d7c Update readme
```

If you want to apply a specific older stash, you reference its ID:

```bash
git stash pop stash@{1}
```

To explicitly name your stashes so they are easier to identify in the list:

```bash
git stash save "Halfway done with the new login UI"
```

To permanently delete a stash without applying it:

```bash
git stash drop stash@{0}
```

To empty the entire drawer:

```bash
git stash clear
```
