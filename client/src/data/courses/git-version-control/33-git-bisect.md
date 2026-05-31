---
title: Git Bisect
section: Advanced Tools
---

# Git Bisect: Bug Hunting

One of the most frustrating experiences in software development is discovering a bug, but having absolutely no idea when it was introduced or which commit caused it.

If your project has 500 commits since the last known good release, testing them one by one to find the bug would take hours.

`git bisect` automates a binary search through your commit history, allowing you to find the exact commit that introduced the bug in a fraction of the time.

## How Bisect Works

A binary search works by dividing the problem in half. If you have 500 commits, `git bisect` checks out commit #250. You test the code.

- If it's broken, the bug was introduced in the first half (1-250).
- If it's good, the bug was introduced in the second half (251-500).

Git repeats this halving process. It can search through 500 commits in just 9 steps!

## Running a Manual Bisect

1. Start the bisect process:

   ```bash
   git bisect start
   ```

2. Tell Git that the current commit is broken (bad):

   ```bash
   git bisect bad
   ```

3. Tell Git the hash of an older commit where you know the code worked perfectly (good):
   ```bash
   git bisect good v1.0.0
   ```

Git will immediately check out the commit exactly halfway between the bad and good endpoints.

```text
Bisecting: 250 revisions left to test after this (roughly 8 steps)
[463dc4f...] Refactor user authentication
```

4. Now, you test the code. Run your app or your test suite.
   - If the bug is present, type: `git bisect bad`
   - If the bug is absent, type: `git bisect good`

Git will automatically check out the next commit to test. You repeat this until Git narrows it down to a single commit:

```text
a1b2c3d... is the first bad commit
commit a1b2c3d...
Author: John Doe
Date:   Wed Mar 15 14:00:00 2023

    Update dependency versions
```

You found the culprit!

5. Once you are done, reset your repository to how it was before you started:
   ```bash
   git bisect reset
   ```

## Automated Bisecting

If you have an automated script or a test suite that can detect the bug, you don't have to test manually at all!

You can provide the script to `git bisect run`. Git will execute the script on every step. If the script exits with `0`, Git marks it as "good". If it exits with anything else, Git marks it as "bad".

```bash
git bisect start HEAD v1.0.0
git bisect run npm run test
```

Git will automatically run the tests, halve the history, and spit out the exact commit that broke the build, all while you get a coffee.
