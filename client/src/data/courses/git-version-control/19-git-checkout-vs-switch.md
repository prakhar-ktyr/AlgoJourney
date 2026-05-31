---
title: Checkout vs Switch
section: Branching Fundamentals
---

# Checkout vs Switch

To move your `HEAD` pointer from one branch to another, and simultaneously update your Working Directory to match that branch, you use commands that "switch" branches.

Historically, this was done using `git checkout`. In 2019 (Git version 2.23), a new command called `git switch` was introduced to make the process safer and more intuitive for beginners.

## The Historic Problem with `git checkout`

`git checkout` is an overloaded command. It does two entirely different things depending on the arguments you pass it:

1. **Changing Branches**: `git checkout main` moves `HEAD` to the `main` branch and updates all your files.
2. **Restoring Files**: `git checkout -- file.txt` discards local modifications in `file.txt`, restoring it to the state it was in at the last commit.

Because one command modifies the DAG pointer, and the other destructively overwrites uncommitted local files, beginners often found it confusing and dangerous.

## The Modern Solution: `switch` and `restore`

To resolve this, the Git maintainers split the functionality of `checkout` into two explicitly named, safer commands:

1. **`git switch`**: Exclusively used for changing branches.
2. **`git restore`**: Exclusively used for modifying files in the Working Directory or Staging Area (covered in the Undoing Changes section).

## Using `git switch`

To switch to an existing branch:

```bash
git switch feature-login
```

### Creating and Switching Simultaneously

The most common branching workflow is creating a new branch and immediately switching to it.

Instead of doing this in two steps:

```bash
git branch feature-payment
git switch feature-payment
```

You can use the `-c` (create) flag:

```bash
git switch -c feature-payment
```

_(If you are reading older tutorials, the `checkout` equivalent of this is `git checkout -b feature-payment`)_.

## Switching with Uncommitted Changes

What happens if you modify a file in your Working Directory, don't commit it, and then try to switch branches?

Git will attempt to carry those uncommitted modifications over to the new branch.

However, if the branch you are switching to has _different_ committed content in that exact same file, bringing your local changes over would cause a conflict. In this scenario, Git prioritizes safety and aborts the switch:

```text
error: Your local changes to the following files would be overwritten by checkout:
        src/auth.js
Please commit your changes or stash them before you switch branches.
Aborting
```

To resolve this, you must either:

1. `git commit` the changes on the current branch.
2. `git stash` the changes (saving them in a temporary drawer).
3. Use `git switch --discard-changes` (DANGEROUS: permanently destroys your uncommitted work).
