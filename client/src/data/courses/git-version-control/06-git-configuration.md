---
title: Configuration
section: Setup & Configuration
---

# Configuring Git

Git comes with a powerful configuration system that controls the look, feel, and operational behavior of your repositories.

The tool used to modify these settings is the `git config` command.

## The Three Levels of Configuration

Git configurations cascade. Settings at a more specific level override settings at a broader level.

1. **System Level (`--system`)**: Applies to every user on the entire computer. Stored in `/etc/gitconfig` (on Unix systems). Rarely used unless managing a shared server.
2. **Global Level (`--global`)**: Applies to the current operating system user. Stored in your home directory at `~/.gitconfig` (or `~/.config/git/config`). This is where you put your personal name and email.
3. **Local Level (`--local`)**: Applies only to the specific repository you are currently in. Stored in `.git/config` inside the project folder. This is the default if you specify no flags.

## Setting Your Identity (Mandatory)

The very first thing you must do after installing Git is set your name and email.

Because Git commits are permanent cryptographic snapshots, the author's identity is permanently baked into the commit hash. Git will actually prevent you from creating a commit if these are not set.

```bash
git config --global user.name "Jane Doe"
git config --global user.email "jane@example.com"
```

> [!TIP]
> If you are contributing to a specific company project and need to use your corporate email instead of your personal GitHub email, navigate to that project's directory and run the command _without_ the `--global` flag:
> `git config user.email "jane@megacorp.com"`
> The local setting will override the global setting for that repository only.

## Setting the Default Branch Name

Historically, Git initialized new repositories with a default branch named `master`. The modern industry standard has shifted to `main`.

You can configure your global installation to automatically use `main` whenever you run `git init`:

```bash
git config --global init.defaultBranch main
```

## Setting the Default Text Editor

When Git needs you to type a commit message (or resolve a merge conflict), it will open the default terminal editor (usually Vim or Nano).

If you prefer a different editor, you can configure it. For example, to use VS Code:

```bash
git config --global core.editor "code --wait"
```

_(The `--wait` flag tells the terminal to wait until you close the VS Code window before proceeding)._

## Helpful Global Configurations

Here are a few configurations that significantly improve the daily developer experience:

**1. Auto-setup remote tracking:**
By default, when you push a new branch, Git complains that it has no upstream tracking branch and requires you to type `git push --set-upstream origin my-branch`. You can force Git to do this automatically:

```bash
git config --global push.autoSetupRemote true
```

**2. Better diffs:**
To make conflict resolution and `git diff` outputs cleaner and easier to read:

```bash
git config --global merge.conflictstyle zdiff3
```

## Viewing Your Configuration

To see a list of all active configurations (and which file they are being read from), use the `--list` and `--show-origin` flags:

```bash
git config --list --show-origin
```

Output:

```text
file:/Users/jane/.gitconfig  user.name=Jane Doe
file:/Users/jane/.gitconfig  user.email=jane@example.com
file:/Users/jane/.gitconfig  init.defaultbranch=main
file:.git/config             remote.origin.url=https://github.com/example/repo.git
```
