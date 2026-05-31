---
title: Init & Clone
section: The Core Workflow
---

# Initializing and Cloning

Every Git project begins by creating a local repository. There are two commands that accomplish this, depending on whether you are starting a new project from scratch or joining an existing one.

## Creating a Repository (`git init`)

If you have an existing folder of code on your computer that you want to start tracking, or if you are starting a brand new project, you use `git init`.

```bash
cd /path/to/my/project
git init
```

Output:

```text
Initialized empty Git repository in /path/to/my/project/.git/
```

### What actually happens?

As we learned in the Internals section, `git init` simply creates the hidden `.git` subdirectory with the skeletal framework needed to track files (`objects`, `refs`, `HEAD`, etc.).

At this point, Git is watching the directory, but **no files are tracked yet**. Your repository's object database is entirely empty. If you run `git status`, it will list all your existing files as "Untracked".

## Copying a Repository (`git clone`)

If you want to contribute to an open-source project or join a team, you need a copy of their repository. You do this using `git clone`.

```bash
git clone https://github.com/facebook/react.git
```

### What actually happens?

`git clone` is actually a wrapper command that automates several lower-level Git steps:

1. It creates a new directory named `react` on your local machine.
2. It navigates into that directory and runs `git init` to create the `.git` folder.
3. It adds the remote URL to your configuration (naming it `origin` by default).
4. It connects to the server and downloads **every single commit and object** from the entire history of the project into your local `.git/objects` database.
5. It runs `git checkout` to extract the files from the most recent commit on the default branch into your Working Directory.

Because Git is decentralized, after `git clone` finishes, you possess a 100% complete, independent backup of the entire project history.

### The Four Cloning Protocols

Git supports four different network protocols for cloning repositories:

1. **Local Protocol**: You can literally clone a repository from one folder on your hard drive to another.
   ```bash
   git clone /path/to/local/repo
   ```
2. **HTTP/HTTPS**: The most common protocol for public repositories. Requires a Personal Access Token for authentication.
   ```bash
   git clone https://github.com/user/repo.git
   ```
3. **SSH**: The preferred protocol for enterprise development. Requires SSH keys configured on both your machine and the server.
   ```bash
   git clone git@github.com:user/repo.git
   ```
4. **Git Protocol**: A special daemon protocol (starts with `git://`). It is the fastest protocol but provides absolutely zero authentication or encryption. It is rarely used today outside of highly controlled internal network environments.

In the next lesson, we will begin moving files through the Three Trees.
