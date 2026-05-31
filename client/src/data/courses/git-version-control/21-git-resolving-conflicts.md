---
title: Resolving Conflicts
section: Merging & Conflicts
---

# Resolving Merge Conflicts

Merge conflicts are the most feared aspect of Git for beginners, but once you understand how Git marks them, they become trivial to solve.

A conflict occurs during a 3-way merge when two branches have modified the exact same line of a file in different ways, or when one branch modifies a file while the other branch deletes it.

## Recognizing a Conflict

When a conflict occurs, Git pauses the merge process and outputs a warning:

```text
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

If you run `git status`, the conflicted files are listed under "Unmerged paths":

```text
Unmerged paths:
  (use "git add <file>..." to mark resolution)
        both modified:   index.html
```

## Reading Conflict Markers

When Git encounters a conflict, it directly edits the conflicted file in your Working Directory, inserting **Conflict Markers** (groups of angle brackets) to show you both sides of the argument.

If you open `index.html` in your text editor, it will look like this:

```html
<body>
  <h1>Welcome to our app</h1>
  <<<<<<< HEAD
  <button class="btn-primary">Sign In</button>
  =======
  <button class="btn-secondary">Log In</button>
  >>>>>>> feature-login
</body>
```

Here is how to read the markers:

- `<<<<<<< HEAD`: The start of the conflict. Everything between this line and the `=======` is what currently exists on your active branch (`main`).
- `=======`: The dividing line between the two conflicting versions.
- `>>>>>>> feature-login`: The end of the conflict. Everything between the divider and this line is what is being brought in from the branch you are merging (`feature-login`).

## Resolving the Conflict Manually

To resolve the conflict, you simply delete the Git markers (`<<<<<<<`, `=======`, `>>>>>>>`) and edit the code to look exactly how you want the final version to be.

You might choose the HEAD version, the feature version, or a combination of both.

```html
<body>
  <h1>Welcome to our app</h1>
  <button class="btn-primary">Log In</button>
</body>
```

## Finalizing the Merge

Once you have manually edited all conflicted files and removed all the markers, you must tell Git that the conflicts are resolved.

You do this by staging the files, just like a normal commit:

```bash
git add index.html
```

If you run `git status` now, it will say:

```text
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)
```

Finally, you run:

```bash
git commit
```

Git will automatically open your text editor with a pre-populated commit message saying `Merge branch 'feature-login'`. Save and close the editor, and the 3-way merge is complete!

## Aborting a Merge

If you get overwhelmed by a massive conflict and want to start over, you can always abort the process and return your repository to the exact state it was in before you typed `git merge`:

```bash
git merge --abort
```

## Using a Merge Tool

Manually editing text markers can be tedious for large files. Most developers configure a visual merge tool (like VS Code, IntelliJ, or Beyond Compare).

Once configured, you can run:

```bash
git mergetool
```

This opens a 3-way split-screen UI showing the "Local" version on the left, the "Remote" version on the right, and the final "Result" at the bottom, allowing you to click to accept changes block by block.
