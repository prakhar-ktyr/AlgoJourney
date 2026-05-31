---
title: Committing
section: The Core Workflow
---

# Committing Snapshots

Once you have carefully curated your Staging Area using `git add`, it is time to permanently record that snapshot into the repository's history.

This is accomplished with the `git commit` command.

## Creating a Commit

To create a commit with a message directly from the command line, use the `-m` flag:

```bash
git commit -m "Add authentication middleware"
```

Output:

```text
[main 463dc4f] Add authentication middleware
 2 files changed, 42 insertions(+)
 create mode 100644 src/auth.js
```

### What happens internally?

When you run `git commit`:

1. Git looks at the current state of the Staging Area (the Index).
2. It generates **Tree objects** to represent the directory structure.
3. It creates a **Commit object** containing your name, email, the timestamp, your commit message, a pointer to the top-level Tree object, and a pointer to the parent commit.
4. It calculates the SHA-1 hash for this new Commit object and saves it in `.git/objects/`.
5. Finally, it updates the `HEAD` pointer (and your current branch pointer) to point to this new commit hash (`463dc4f`).

## Omitting the `-m` flag

If you run `git commit` without the `-m` flag, Git will launch your terminal's default text editor (usually Vim or Nano).

```bash
git commit
```

The editor will open a temporary file containing commented-out instructions and the output of `git status`. You write your commit message at the top, save the file, and close the editor.

This is the preferred method for writing detailed, multi-line commit messages.

## The Semantic Commit Message

In professional environments, commit messages are incredibly important. They act as the definitive documentation for _why_ the codebase evolved the way it did.

A widely adopted standard is **Conventional Commits** (or semantic commits). It structures the subject line into a specific format: `<type>: <description>`.

Common types include:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests

**Example:**

```text
feat: add JWT token validation to login endpoint

This implements the new security requirements defined in JIRA-123.
The token is extracted from the Authorization header and validated
against the secret key. If invalid, it returns a 401 response.
```

## The Shortcut: Skip the Staging Area

If you are making a quick fix to files that Git is **already tracking** (i.e., not newly created files), you can skip the `git add` step entirely by using the `-a` (all) flag:

```bash
git commit -a -m "Fix typo in header"
```

This tells Git: "Automatically stage every modified, tracked file in the Working Directory, and commit it immediately."

> [!WARNING]
> While convenient, the `-a` flag bypasses the curation step. If you have temporary debug logs or `console.log()` statements left in other files, they will be committed automatically. Use this shortcut with caution.
