---
title: Maintenance
section: Safety Nets & Maintenance
---

# Repository Maintenance

Git is remarkably self-sufficient. As you commit, branch, merge, and rebase, the `.git` directory handles its own internal mechanics. However, over the lifespan of a large enterprise project, the repository can become bloated or run into integrity issues.

Understanding how to maintain and repair a repository is the mark of an advanced Git user.

## Garbage Collection (`git gc`)

As we discussed in previous lessons, operations like `git reset --hard` or `git commit --amend` leave "unreachable" objects in the database. These are Blobs, Trees, and Commits that no branch or tag points to anymore.

While they serve as a safety net (recoverable via the Reflog), they eventually start taking up unnecessary disk space.

Git occasionally runs an automatic cleanup process in the background. But you can trigger it manually using the Garbage Collection command:

```bash
git gc
```

### What `git gc` does:

1. **Packs objects**: It takes thousands of individual files in `.git/objects/` and compresses them into a single highly efficient "packfile" to save disk space and improve read speeds.
2. **Prunes stale objects**: By default, it deletes any unreachable objects that are older than 2 weeks. (If you want to force it to delete _all_ unreachable objects immediately, you can use `git gc --prune=now`, though this removes your ability to use the Reflog to recover them).
3. **Packs refs**: It compresses all the individual branch pointer files in `.git/refs/` into a single `packed-refs` file.

## Repository Integrity (`git fsck`)

Because Git relies on cryptographic SHA-1 hashes, it knows immediately if a bit flips on your hard drive and corrupts a file.

To run a full diagnostic check on the mathematical integrity of your entire repository:

```bash
git fsck
```

_(fsck stands for File System Check)_.

This command verifies that every object's SHA-1 hash matches its actual content, and that all parent-child DAG pointers are valid. If a file was corrupted by a failing hard drive, `git fsck` will flag it immediately.

## Handling Large Files (Git LFS)

Git is phenomenal at tracking plain text files (code). It is terrible at tracking large binary files (videos, high-res images, compiled `.dll` or `.so` files).

Because Git tracks full snapshots (or compressed deltas), committing a 1GB video file, modifying it slightly, and committing it again will bloat your repository to 2GB. Everyone who clones the repository will have to download that 2GB history, making the clone process agonizingly slow.

**The Solution: Git Large File Storage (LFS)**

Git LFS is an open-source extension developed by GitHub, Atlassian, and others.

Instead of storing the massive binary file in the `.git/objects` database, LFS stores a tiny text pointer in Git. The actual massive file is uploaded to a dedicated LFS server.

### Using LFS

1. Install it on your machine (`git lfs install`).
2. Tell LFS which file types to track:
   ```bash
   git lfs track "*.mp4"
   ```
3. This creates a `.gitattributes` file. Commit both the `.gitattributes` file and your `.mp4` file as normal.
4. When you push, Git handles the text files, and LFS intercepts the `.mp4` and uploads it to the remote LFS storage.

## Conclusion

Congratulations! You have completed the exhaustive Git & Version Control course.

You now understand the underlying mathematical models, the internal architecture of the `.git` directory, and the advanced workflows required to manage massive enterprise codebases safely. You are no longer just memorizing commands—you truly know how Git thinks.
