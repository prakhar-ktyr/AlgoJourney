---
title: The Three Trees
section: The Core Workflow
---

# The Three Trees Architecture

To truly master Git's day-to-day workflow, you must thoroughly understand its "Three Trees" architecture.

In Git terminology, a "Tree" in this context refers to a collection of files. Git manages three distinct trees during its normal operation.

## 1. The Working Directory (Your Sandpit)

The Working Directory is the physical directory on your computer's hard drive where your project files live. This is what you see when you open your code editor or run `ls` in the terminal.

These files are pulled out of the compressed database in the `.git` directory and placed on your disk so you can see them and edit them.

Think of this as your sandbox. You can create, delete, and modify files here freely. Git is _aware_ of these changes, but it has not permanently recorded them yet.

## 2. The Staging Area (The Index)

The Staging Area (technically called "The Index" in Git internals) is a critical buffer zone.

When you decide that a set of changes in your Working Directory is ready to be committed, you don't commit them directly. Instead, you move them into the Staging Area.

The Staging Area allows you to curate exactly what goes into your next commit. If you modified 10 files in your Working Directory, but those changes actually represent two distinct bug fixes, you can use the Staging Area to group them logically:

1. Stage 5 files.
2. Commit them as "Fix Bug A".
3. Stage the remaining 5 files.
4. Commit them as "Fix Bug B".

Internally, when you stage a file, Git immediately creates a Blob object in the `.git/objects` database and updates an internal file (the Index) to point to it.

## 3. The Repository (HEAD)

The Repository is the permanent `.git` database. More specifically, in the context of the Three Trees, we refer to **HEAD**.

HEAD is a pointer to the very last commit made on your current branch. It represents the "last saved state" of the project.

When you run `git commit`, Git takes the exact current state of the Staging Area, creates a Tree object from it, creates a new Commit object pointing to that Tree, and updates HEAD to point to this new commit.

## The Lifecycle Workflow

Understanding how files move between these three trees is the essence of using Git:

1. **Checkout**: You switch to a branch. Git updates **HEAD** to point to the latest commit on that branch, populates the **Staging Area** to match, and overwrites your **Working Directory** files to match. All three trees are identical.
2. **Modify**: You edit files in your **Working Directory**. Now, the Working Directory differs from the Staging Area and HEAD.
3. **Stage**: You run `git add`. Git copies the modified files from the Working Directory into the **Staging Area**. Now, the Staging Area matches the Working Directory, but HEAD is still behind.
4. **Commit**: You run `git commit`. Git takes a snapshot of the Staging Area and permanently stores it. It moves **HEAD** forward to this new commit. All three trees are identical again!

Commands like `git status` simply compare these trees:

- If the Working Directory differs from the Staging Area, Git reports "Changes not staged for commit".
- If the Staging Area differs from HEAD, Git reports "Changes to be committed".
