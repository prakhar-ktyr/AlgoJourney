---
title: SHA-1 & The Object Database
section: Git Internals (Deep Dive)
---

# SHA-1 and the Object Database

Git is fundamentally a **Content-Addressable Filesystem**.

This means that at its core, Git is a simple key-value data store. You hand it a piece of content (like the text of your Python script), and Git hands you back a unique key. You can later use that exact key to retrieve the content.

## SHA-1 Hashing

The "key" that Git generates is a **SHA-1 hash**.

SHA-1 is a cryptographic hash function. It takes an input of any size (a single word, or a 10GB video file) and produces a fixed-size 40-character hexadecimal string.

For example, the string "Hello World" hashed with Git's specific formatting produces:
`5e1c309dae7f45e0f39b1bf3ac3cbd04c1d25b50`

### Cryptographic Guarantees

Because SHA-1 is a cryptographic hash, it possesses several vital properties:

1. **Deterministic**: The same exact input will _always_ produce the exact same 40-character hash.
2. **Collision Resistant**: It is statistically nearly impossible for two different files to accidentally generate the same hash.
3. **Avalanche Effect**: Changing even a single comma in a 10,000-line file will completely and unpredictably alter the entire 40-character hash.

This guarantees **Data Integrity**. It is impossible to change a file, a commit message, or a timestamp in Git without changing the hash of that commit. Git verifies hashes constantly. If a disk corrupts a file, Git will instantly know because the file's contents will no longer mathematically match its filename.

## The Four Object Types

Inside the `.git/objects/` directory, Git stores four distinct types of objects. Every single one is named by its SHA-1 hash.

### 1. Blobs (Files)

A **blob** (Binary Large Object) stores the _contents_ of a file.

Notice that a blob _only_ stores the contents, not the filename. If you have two files named `script.js` and `backup.js` that contain the exact same code, Git is smart enough to only store **one** blob in the database, because their SHA-1 hashes will be identical.

### 2. Trees (Directories)

A **tree** object solves the problem of filenames. A tree represents a directory. It contains a list of pointers to blobs (files) and other trees (subdirectories), along with their associated filenames and access permissions.

```text
tree 3c4e9c...
  blob 5e1c30... script.js
  blob 8f4b2d... readme.md
  tree 1a2b3c... src/
```

### 3. Commits

A **commit** object ties it all together into a snapshot of history. A commit contains:

1. A pointer to the top-level **Tree** object representing the state of the project at that moment.
2. A pointer to the **parent commit(s)** (the commit that came right before this one).
3. The author and committer names, emails, and timestamps.
4. The commit message.

Because the commit object includes a pointer to its parent, hashing the commit mathematically links it to the previous commit. This forms an unbreakable chain. If you alter a commit from a year ago, its hash changes, which means its child's hash must change to point to the new parent, causing a cascading rewrite of history down to the present day.

### 4. Annotated Tags

An annotated tag is a permanent pointer to a specific commit, usually used for release versions (e.g., `v2.0.1`). Unlike a lightweight tag (which is just a file in `refs/tags/`), an annotated tag is a full object in the database containing a tagger name, date, and a tagging message (like release notes), and it has its own SHA-1 hash.

## Plumbing vs Porcelain

Git commands are divided into two categories:

- **Porcelain**: User-friendly commands you use daily (`git add`, `git commit`, `git status`).
- **Plumbing**: Low-level commands that manipulate the internal database directly.

You can actually use a plumbing command to ask Git to read the raw contents of an object by providing its hash:

```bash
git cat-file -p <hash>
```

If you provide a Blob hash, it prints the file contents. If you provide a Commit hash, it prints the metadata and the parent pointers.

Understanding these objects is the secret to demystifying Git. A repository is not a series of diffs or changesets; it is a massive web of Blobs, Trees, and Commits pointing to one another via SHA-1 hashes.
