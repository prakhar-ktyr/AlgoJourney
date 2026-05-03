---
title: Environment Variables & Configuration
---

# Environment Variables & Configuration

Environment variables control how your shell and programs behave. They store configuration — your username, preferred editor, where to find executables, and much more. This lesson covers viewing, setting, and managing environment variables.

---

## What Are Environment Variables?

Environment variables are key-value pairs available to all processes running in a shell session. They influence program behavior without changing code.

```bash
# A variable has a NAME and a value
VARIABLE_NAME="some value"

# Environment variables are inherited by child processes
# Shell variables are local to the current shell
```

### Shell Variables vs Environment Variables

```bash
# Shell variable — local to this shell only
$ MY_VAR="hello"
$ echo $MY_VAR
hello

# This does NOT pass to child processes
$ bash -c 'echo $MY_VAR'
  (empty — not inherited)

# Environment variable — inherited by child processes
$ export MY_VAR="hello"
$ bash -c 'echo $MY_VAR'
hello
```

---

## Viewing Environment Variables

### See All Environment Variables

```bash
# Using env
$ env
HOME=/home/user
PATH=/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash
USER=user
LANG=en_US.UTF-8
...

# Using printenv (same output)
$ printenv
```

### View a Specific Variable

```bash
# Using echo
$ echo $HOME
/home/user

$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/home/user/.local/bin

# Using printenv
$ printenv HOME
/home/user

# printenv can check if a variable exists (exit code)
$ printenv HOME && echo "exists" || echo "not set"
/home/user
exists
```

### Useful Commands for Inspecting Variables

```bash
# List all with grep to search
$ env | grep -i proxy
HTTP_PROXY=http://proxy.example.com:8080

# Sort alphabetically for easier reading
$ env | sort

# Count how many variables are set
$ env | wc -l
42
```

---

## Setting Environment Variables

### Temporary (Current Session Only)

```bash
# Set and export in one line
$ export EDITOR="vim"
$ export API_KEY="abc123"

# Verify
$ echo $EDITOR
vim

# Set for a single command only (does not persist)
$ DATABASE_URL="postgres://localhost/mydb" node server.js
```

### Unsetting Variables

```bash
# Remove a variable
$ unset API_KEY
$ echo $API_KEY
  (empty)
```

---

## Common Environment Variables

| Variable  | Purpose                          | Example Value                    |
|-----------|----------------------------------|----------------------------------|
| `HOME`    | User's home directory            | `/home/user`                     |
| `USER`    | Current username                 | `user`                           |
| `SHELL`   | Default shell                    | `/bin/bash`                      |
| `PATH`    | Directories to search for commands | `/usr/local/bin:/usr/bin:/bin`  |
| `PWD`     | Current working directory        | `/home/user/projects`            |
| `OLDPWD`  | Previous working directory       | `/home/user`                     |
| `LANG`    | System locale/language           | `en_US.UTF-8`                    |
| `EDITOR`  | Default text editor              | `vim` or `nano`                  |
| `VISUAL`  | Visual editor (used by git, etc.)| `code --wait`                    |
| `TERM`    | Terminal type                    | `xterm-256color`                 |
| `PAGER`   | Default pager program            | `less`                           |
| `HOSTNAME`| Machine hostname                 | `myserver`                       |
| `LOGNAME` | Login name                       | `user`                           |
| `UID`     | User ID number                   | `1000`                           |

```bash
# View all at once
$ echo "User: $USER | Home: $HOME | Shell: $SHELL"
User: user | Home: /home/user | Shell: /bin/bash
```

---

## PATH In Depth

`PATH` is the most important environment variable. It tells the shell **where to find executable programs**.

### How PATH Works

```bash
$ echo $PATH
/usr/local/bin:/usr/bin:/bin:/home/user/.local/bin

# When you type a command, the shell searches directories left to right:
# 1. /usr/local/bin/git   ← found here? Use it!
# 2. /usr/bin/git         ← try next
# 3. /bin/git             ← try next
# 4. /home/user/.local/bin/git ← last resort
```

### Find Where a Command Lives

```bash
$ which python3
/usr/bin/python3

$ which git
/usr/local/bin/git

# Show all matches (not just first)
$ type -a python3
python3 is /usr/bin/python3
python3 is /usr/local/bin/python3
```

### Adding to PATH

```bash
# Append a new directory to PATH
$ export PATH="$PATH:/home/user/scripts"

# Prepend (higher priority — searched first)
$ export PATH="/opt/myapp/bin:$PATH"

# Verify
$ echo $PATH
/opt/myapp/bin:/usr/local/bin:/usr/bin:/bin:/home/user/scripts
```

### Make PATH Changes Permanent

```bash
# Add to ~/.bashrc (or ~/.zshrc for Zsh)
$ echo 'export PATH="$PATH:/home/user/scripts"' >> ~/.bashrc

# Reload
$ source ~/.bashrc
```

### Common PATH Additions

```bash
# User's local bin (pip install --user puts scripts here)
export PATH="$PATH:$HOME/.local/bin"

# Go binaries
export PATH="$PATH:$HOME/go/bin"

# Rust binaries
export PATH="$PATH:$HOME/.cargo/bin"

# Node.js global packages
export PATH="$PATH:$HOME/.npm-global/bin"

# Custom scripts directory
export PATH="$PATH:$HOME/bin"
```

---

## Configuration Files Loading Order

Understanding which files load when is crucial for reliable environment setup.

### Login Shell (SSH, tty login, `su -`)

```
/etc/profile           ← System-wide (all users)
  └── /etc/profile.d/*.sh  ← Drop-in system configs
~/.bash_profile        ← User-specific (checked first)
  OR ~/.bash_login     ← Fallback if no .bash_profile
  OR ~/.profile        ← Fallback if neither above exists
```

### Non-Login Interactive Shell (opening a terminal)

```
~/.bashrc              ← Loaded for every new terminal window
```

### The Common Pattern

Most users have this in `~/.bash_profile`:

```bash
# ~/.bash_profile
# Load .bashrc if it exists (so settings work in both login and non-login shells)
if [ -f ~/.bashrc ]; then
    source ~/.bashrc
fi
```

This means: **put everything in `~/.bashrc`** and it will work everywhere.

### Configuration File Purposes

| File              | When Loaded         | Best For                       |
|-------------------|--------------------|---------------------------------|
| `/etc/profile`    | Login shells       | System-wide PATH, umask         |
| `~/.bash_profile` | Login shells       | Source .bashrc, login-only stuff|
| `~/.bashrc`       | Interactive shells | Aliases, PATH, prompt, functions|
| `~/.profile`      | Login (sh/dash)    | POSIX-compatible settings       |

### Example ~/.bashrc

```bash
# ~/.bashrc — executed for every new interactive shell

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth

# PATH additions
export PATH="$PATH:$HOME/.local/bin:$HOME/bin"

# Default editors
export EDITOR="vim"
export VISUAL="code --wait"

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias gp='git pull'

# Custom prompt
export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Load local overrides if they exist
if [ -f ~/.bashrc.local ]; then
    source ~/.bashrc.local
fi
```

### Reload Configuration

```bash
# After editing .bashrc, reload it
$ source ~/.bashrc
# or
$ . ~/.bashrc
```

---

## .env Files for Applications

Many applications use `.env` files to store configuration without hard-coding values.

### .env File Format

```bash
# .env — application configuration
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
API_KEY=sk-abc123def456
PORT=3000
NODE_ENV=development
DEBUG=true
```

### Loading .env in Shell Scripts

```bash
#!/bin/bash
# Load .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Starting app on port $PORT..."
```

### Using with Docker

```bash
# Pass .env to Docker container
$ docker run --env-file .env myapp

# Or use docker-compose (reads .env automatically)
$ docker-compose up
```

> **Security Tip:** Never commit `.env` files to git! Add `.env` to your `.gitignore`.

```bash
$ echo ".env" >> .gitignore
```

---

## Aliases

Aliases are shortcuts for frequently used commands.

### Create Aliases

```bash
# Simple alias
$ alias ll='ls -la'
$ alias cls='clear'

# Alias with options
$ alias grep='grep --color=auto'
$ alias df='df -h'
$ alias du='du -h'

# Git shortcuts
$ alias gs='git status'
$ alias ga='git add'
$ alias gc='git commit'
$ alias gp='git push'
$ alias gl='git log --oneline --graph'

# Safety aliases (ask before overwrite)
$ alias rm='rm -i'
$ alias cp='cp -i'
$ alias mv='mv -i'

# Navigation
$ alias ..='cd ..'
$ alias ...='cd ../..'
$ alias ~='cd ~'
```

### List All Aliases

```bash
$ alias
alias ll='ls -la'
alias gs='git status'
alias grep='grep --color=auto'
...
```

### Remove an Alias

```bash
$ unalias ll
```

### Make Aliases Permanent

Add them to `~/.bashrc`:

```bash
# Add to ~/.bashrc
alias ll='ls -la'
alias gs='git status'
alias update='sudo apt update && sudo apt upgrade -y'
```

### Functions vs Aliases

For anything complex, use a **function** instead of an alias:

```bash
# Function — can take arguments
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Usage
$ mkcd new-project
# Creates directory and cd's into it

# Extract any archive
extract() {
    case "$1" in
        *.tar.gz|*.tgz)  tar -xzvf "$1" ;;
        *.tar.bz2)       tar -xjvf "$1" ;;
        *.tar.xz)        tar -xJvf "$1" ;;
        *.tar)           tar -xvf "$1" ;;
        *.gz)            gunzip "$1" ;;
        *.bz2)           bunzip2 "$1" ;;
        *.xz)            unxz "$1" ;;
        *.zip)           unzip "$1" ;;
        *)               echo "Unknown format: $1" ;;
    esac
}
```

---

## Customizing Your Environment

### Complete Setup Example

```bash
#!/bin/bash
# setup-env.sh — Set up a new machine's environment

# Create bin directory for personal scripts
mkdir -p ~/bin

# Add to .bashrc
cat >> ~/.bashrc << 'EOF'

# === Custom Configuration ===

# PATH
export PATH="$PATH:$HOME/bin:$HOME/.local/bin"

# Editors
export EDITOR="vim"
export VISUAL="code --wait"

# History
HISTSIZE=50000
HISTFILESIZE=100000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend

# Aliases
alias ll='ls -la --color=auto'
alias la='ls -A'
alias grep='grep --color=auto'
alias gs='git status'
alias gd='git diff'
alias gl='git log --oneline --graph --all'

# Functions
mkcd() { mkdir -p "$1" && cd "$1"; }

# Prompt
export PS1='\[\e[32m\]\u\[\e[0m\]@\[\e[34m\]\h\[\e[0m\]:\[\e[33m\]\w\[\e[0m\]\$ '

# === End Custom Configuration ===
EOF

echo "Environment configured! Run: source ~/.bashrc"
```

### Per-Project Environment

```bash
# Use direnv to auto-load .envrc when entering a directory
# Install: sudo apt install direnv

# Add to ~/.bashrc
eval "$(direnv hook bash)"

# Create .envrc in project directory
$ cd ~/projects/myapp
$ echo 'export DATABASE_URL="postgres://localhost/myapp"' > .envrc
$ direnv allow

# Now DATABASE_URL is set automatically when you cd into this folder
$ cd ~/projects/myapp
direnv: loading .envrc
$ echo $DATABASE_URL
postgres://localhost/myapp
```

---

## Quick Reference

| Task                        | Command                              |
|-----------------------------|--------------------------------------|
| View all env vars           | `env` or `printenv`                  |
| View specific variable      | `echo $VAR` or `printenv VAR`        |
| Set variable (session)      | `export VAR="value"`                 |
| Unset variable              | `unset VAR`                          |
| View PATH                   | `echo $PATH`                         |
| Add to PATH                 | `export PATH="$PATH:/new/dir"`       |
| Reload .bashrc              | `source ~/.bashrc`                   |
| Create alias                | `alias name='command'`               |
| List aliases                | `alias`                              |
| Remove alias                | `unalias name`                       |
| Find command location       | `which command`                      |

---

## Summary

- **Environment variables** are key-value pairs inherited by child processes; use `export` to create them.
- **PATH** controls where the shell finds commands — extend it in `~/.bashrc`.
- **~/.bashrc** is the main config file for interactive shells; put your PATH, aliases, and functions there.
- **Aliases** save keystrokes; use **functions** for anything that needs arguments or logic.
- Use `.env` files for application secrets — never commit them to version control.
- After editing config files, `source ~/.bashrc` to apply changes immediately.
