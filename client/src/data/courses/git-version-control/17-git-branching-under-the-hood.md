---
title: Branching Under the Hood
section: Branching Fundamentals
---

# Branching Under the Hood

Branching is Git's "killer feature". In older version control systems like SVN, branching meant literally copying all the project files into a new directory. It was slow, bloated, and discouraged.

In Git, branching is virtually instantaneous and consumes almost zero disk space. Why? Because a branch is just a **pointer**.

## The Architecture of a Branch

As we discussed in the Internals section, the Directed Acyclic Graph (DAG) is just a series of Commit objects pointing to their parents.

```text
Commit A <-- Commit B <-- Commit C
```

A branch in Git is nothing more than a text file located in `.git/refs/heads/`. This file contains the 40-character SHA-1 hash of a commit. It is a lightweight, movable pointer.

Let's say the `main` branch points to `Commit C`.

```text
Commit A <-- Commit B <-- Commit C  <-- [main]
```

## Creating a New Branch

If you create a new branch called `testing`:

```bash
git branch testing
```

Git creates a new file `.git/refs/heads/testing`, and writes the hash of `Commit C` into it.

```text
Commit A <-- Commit B <-- Commit C  <-- [main]
                                    \-- [testing]
```

Both branches now point to the exact same commit.

## The Role of HEAD

How does Git know which branch you are currently on? It uses a special pointer called `HEAD`.

`HEAD` is a file (`.git/HEAD`) that points to the currently checked-out branch.

```text
Commit A <-- Commit B <-- Commit C  <-- [main] <-- (HEAD)
                                    \-- [testing]
```

When you use `git checkout testing` (or `git switch testing`), Git simply updates the `HEAD` file to point to the `testing` branch pointer.

```text
Commit A <-- Commit B <-- Commit C  <-- [main]
                                    \-- [testing] <-- (HEAD)
```

## Making a Commit

Now, what happens if you modify a file, stage it, and commit it while on the `testing` branch?

1. Git creates `Commit D`, pointing to `Commit C` as its parent.
2. Because `HEAD` points to `testing`, Git moves the `testing` pointer forward to point to `Commit D`.

```text
Commit A <-- Commit B <-- Commit C  <-- [main]
                                 \
                                  \-- Commit D <-- [testing] <-- (HEAD)
```

Notice that the `main` branch pointer didn't move. It still points to `Commit C`. Your branches have now diverged.

## The Detached HEAD State

What happens if you use `git checkout` to move to a specific commit hash instead of a branch name?

```bash
git checkout Commit_B_Hash
```

Git will update `HEAD` to point directly to the commit object, rather than to a branch pointer. This is called a **Detached HEAD state**.

```text
Commit A <-- Commit B  <-- (HEAD)
                    \
                     \-- Commit C <-- [main]
```

In this state, if you make a new commit, it will attach to `Commit B`. But because no branch pointer is tracking your new commit, if you switch away from it, that commit will become "unreachable" and eventually be garbage collected!

If you make changes in a detached HEAD state and want to keep them, you must create a new branch pointer to anchor them:
`git branch new-fix-branch`
