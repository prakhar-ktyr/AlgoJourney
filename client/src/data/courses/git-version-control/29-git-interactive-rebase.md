---
title: Interactive Rebasing
section: Rebasing
---

# Interactive Rebasing

Standard rebasing is used to graft your branch onto another branch. But what if you want to rewrite the history of your _own_ branch without moving it?

You can use **Interactive Rebasing** (`-i`), one of the most powerful tools in a professional Git workflow.

It allows you to look back at your recent commits, squash them together, change their commit messages, delete them entirely, or even reorder them.

## The Interactive Interface

Suppose you want to rewrite the last 4 commits on your current branch. You run:

```bash
git rebase -i HEAD~4
```

Git will open your default text editor (like Vim or Nano) with a list of the last 4 commits, ordered from oldest to newest.

```text
pick 463dc4f Add authentication middleware
pick f9e8d7c Fix typo in auth
pick a1b2c3d Add JWT validation
pick z9y8x7w WIP testing

# Rebase a2c4e6..z9y8x7w onto a2c4e6
#
# Commands:
# p, pick <commit> = use commit
# r, reword <commit> = use commit, but edit the commit message
# e, edit <commit> = use commit, but stop for amending
# s, squash <commit> = use commit, but meld into previous commit
# f, fixup <commit> = like "squash", but discard this commit's log message
# d, drop <commit> = remove commit
```

By default, every commit is marked as `pick` (keep it exactly as is). To rewrite history, you change the word `pick` to one of the other commands.

## Common Rewrites

### 1. Rewording a Commit

If you made a typo in the oldest commit message:

```text
reword 463dc4f Add authentication middleware
pick f9e8d7c Fix typo in auth
```

When you save and close the file, Git will pause on that first commit, open a new text editor, and allow you to fix the message.

### 2. Squashing Commits (The Most Common Use Case)

As developers, we often make messy "Work In Progress" (WIP) commits or "Fix typo" commits just to save our work. Before pushing to a clean main branch, we want to condense these into a single, beautiful commit.

To meld a commit into the one directly above it, change `pick` to `squash` (or `s`):

```text
pick 463dc4f Add authentication middleware
squash f9e8d7c Fix typo in auth
squash a1b2c3d Add JWT validation
drop z9y8x7w WIP testing
```

When you save and close:

1. Git will drop the `WIP testing` commit entirely, erasing that code.
2. It will meld the "Fix typo" and "Add JWT" commits into the very first commit.
3. It will open an editor asking you to write a single, unified commit message for the new mega-commit.

Your messy 4-commit history has been surgically altered into a single, professional commit, ready to be pushed!
