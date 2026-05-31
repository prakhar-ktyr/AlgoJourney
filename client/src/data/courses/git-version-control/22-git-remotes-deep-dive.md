---
title: Remotes Deep Dive
section: Remote Repositories
---

# Remote Repositories: Deep Dive

Because Git is decentralized, there is no inherent "master server." A **Remote** is simply another Git repository—usually hosted on the internet (GitHub) or a local network—that you have configured your local Git to communicate with.

A single local repository can connect to multiple remotes.

## Managing Remotes (`git remote`)

To see a list of the remote servers currently configured for your project, run:

```bash
git remote
```

Output:

```text
origin
```

`origin` is just the default name Git assigns to the server you cloned from. It is not a special keyword; you could rename it to `github` or `server1` if you wanted.

To see the actual URLs associated with those names, use the `-v` (verbose) flag:

```bash
git remote -v
```

Output:

```text
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
```

### Adding a New Remote

If you initialized an empty repository locally using `git init` and later created an empty repository on GitHub, you need to connect them. You do this by adding the remote URL manually:

```bash
git remote add origin https://github.com/user/repo.git
```

### Renaming and Removing Remotes

If a company changes its repository name, or you want to rename a remote pointer:

```bash
git remote rename origin legacy-origin
```

To permanently sever the connection to a remote server (this does not delete the code on the server, it just deletes your local pointer to it):

```bash
git remote rm origin
```

## Remote-Tracking Branches

When you clone a repository, Git doesn't just download the files. It creates special, read-only branches in your local `.git/refs/remotes/` directory. These are called **remote-tracking branches**.

They take the format `<remote>/<branch>`, for example, `origin/main`.

You cannot `git checkout` a remote-tracking branch and commit to it directly. These branches exist purely to act as bookmarks, remembering exactly where the branches on the remote server were the last time you communicated with it over the network.

If you run `git log --all --graph`, you might see a DAG that looks like this:

```text
* Commit D <-- [main] <-- (HEAD)
* Commit C <-- [origin/main]
* Commit B
```

In this scenario, your local `main` branch is one commit _ahead_ of `origin/main`. This means you have committed locally, but you have not yet pushed `Commit D` to the server.

In the next lesson, we will cover how to synchronize your local branches with these remote-tracking branches over the network.
