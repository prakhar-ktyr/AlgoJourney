---
title: The Terminal & Shell
---

# The Terminal & Shell

The terminal is your **command center** in Linux. While graphical interfaces are nice, the terminal is where the real power lies. In this lesson, you'll learn what the terminal and shell are, how they work, and how to make them your own.

---

## What is the Terminal?

A **terminal** (or terminal emulator) is a program that provides a text-based interface to your computer. You type commands, and the computer responds with text output.

```bash
# The terminal is just a window that accepts text input
# Think of it as a text message conversation with your computer

# You type:
echo "Hello, Linux!"

# Computer responds:
# Hello, Linux!
```

### Terminal vs Console vs TTY

```bash
# These terms are related but different:
echo "Console    — The physical screen + keyboard (historically)"
echo "Terminal   — A text input/output environment"
echo "TTY        — TeleTYpewriter — the hardware that started it all"
echo "Emulator   — Software that simulates a terminal"
echo ""
echo "In practice, people use these terms interchangeably."
echo "When we say 'terminal,' we mean the terminal emulator application."
```

### Popular Terminal Emulators

```bash
# Each OS has different terminal options

echo "=== Linux ==="
echo "GNOME Terminal  — Default on Ubuntu/GNOME"
echo "Konsole         — Default on KDE"
echo "Alacritty       — GPU-accelerated, fast"
echo "Kitty           — GPU-accelerated, feature-rich"
echo "Terminator      — Split panes, multiple terminals"
echo "Tilix           — Tiling terminal for GNOME"
echo ""
echo "=== macOS ==="
echo "Terminal.app    — Built-in"
echo "iTerm2          — Popular third-party (recommended)"
echo "Alacritty       — GPU-accelerated"
echo "Warp            — Modern, AI-powered"
echo ""
echo "=== Windows (with WSL) ==="
echo "Windows Terminal — Microsoft's modern terminal (recommended)"
echo "WSL terminal    — Default Ubuntu window"
```

---

## What is a Shell?

A **shell** is the program that **interprets your commands** and executes them. The terminal is just the window — the shell is the brain inside it.

```bash
# The relationship:
echo "You → Terminal (window) → Shell (interpreter) → Operating System"
echo ""
echo "The terminal displays text"
echo "The shell understands commands"
echo "The OS executes actions"
```

Think of it this way:
- **Terminal** = the TV screen
- **Shell** = the show playing on the TV
- **OS** = the real world the show is about

### What the Shell Does

```bash
# The shell:
echo "1. Displays a prompt (waiting for input)"
echo "2. Reads your command"
echo "3. Parses the command (breaks it into parts)"
echo "4. Finds the program to run"
echo "5. Executes the program"
echo "6. Displays the output"
echo "7. Goes back to step 1"
```

---

## Types of Shells

There are many shells available. Here are the most common:

### bash — Bourne Again Shell

```bash
# bash is the most common shell on Linux
echo "Full name: Bourne Again Shell"
echo "Created: 1989 by Brian Fox"
echo "Default on: Most Linux distributions"
echo "Config file: ~/.bashrc"
echo "Path: /bin/bash"
echo ""
# Check if you're using bash
echo $BASH_VERSION
# Example output: 5.2.15(1)-release
```

**Why bash is popular:**
- Default on most Linux distributions
- Huge amount of documentation and tutorials
- Excellent scripting capabilities
- POSIX-compliant (portable)
- Installed on virtually every Unix system

### zsh — Z Shell

```bash
# zsh is the default shell on macOS and gaining popularity on Linux
echo "Full name: Z Shell"
echo "Created: 1990 by Paul Falstad"
echo "Default on: macOS (since Catalina, 2019)"
echo "Config file: ~/.zshrc"
echo "Path: /bin/zsh"
echo ""
# Check if you're using zsh
echo $ZSH_VERSION
# Example output: 5.9
```

**Why zsh is popular:**
- Better auto-completion than bash
- Spelling correction
- Better globbing (pattern matching)
- Themes and plugins (Oh My Zsh!)
- Mostly compatible with bash syntax

### Other Shells

```bash
# Other shells you might encounter
echo "sh     — Original Bourne Shell (1979), minimal, POSIX"
echo "fish   — Friendly Interactive Shell, user-friendly, not POSIX"
echo "dash   — Debian Almquist Shell, fast, used for system scripts"
echo "ksh    — Korn Shell, enterprise Unix systems"
echo "tcsh   — Enhanced C Shell, BSD systems"
echo ""
# List all available shells on your system
cat /etc/shells
# Output:
# /bin/sh
# /bin/bash
# /bin/zsh
# /usr/bin/fish
# /bin/dash
```

### Shell Comparison

| Feature | bash | zsh | fish | sh |
|---------|------|-----|------|----|
| **Default on** | Linux | macOS | None | Minimal systems |
| **Scripting** | Excellent | Excellent | Different syntax | Basic |
| **Auto-complete** | Good | Excellent | Excellent | Minimal |
| **Syntax highlighting** | Plugin | Plugin | Built-in | No |
| **POSIX compliant** | Yes | Mostly | No | Yes |
| **Learning resources** | Abundant | Good | Growing | Limited |
| **Speed** | Good | Good | Good | Fastest |
| **Customization** | Good | Excellent | Good | Minimal |

### Check and Change Your Shell

```bash
# What shell am I using right now?
echo $SHELL
# Output: /bin/bash or /bin/zsh

# What shell is this process?
echo $0
# Output: -bash or -zsh or bash

# List available shells
cat /etc/shells

# Change your default shell to zsh
chsh -s /bin/zsh

# Change your default shell to bash
chsh -s /bin/bash

# Start a different shell temporarily (without changing default)
bash    # Start bash
zsh     # Start zsh
exit    # Return to previous shell
```

---

## Terminal Anatomy

When you open a terminal, you see something like this:

```bash
# Typical terminal prompt:
# username@hostname:current_directory$

# Example:
# alex@ubuntu-pc:~$

# Let's break it down:
echo "alex          — Your username"
echo "@             — Separator"
echo "ubuntu-pc     — Your computer's hostname"
echo ":             — Separator"
echo "~             — Current directory (~ means home)"
echo "$             — Regular user prompt (# for root)"
```

### The Prompt Explained

```bash
# Different prompt styles you might see:

# Standard Linux:
# user@host:~/projects$

# Root user (administrator):
# root@host:/etc#
# Note: # instead of $ means you're root!

# Minimal:
# $

# macOS default (zsh):
# hostname % 

# With git branch (common customization):
# user@host:~/project (main)$
```

### Parts of a Command

```bash
# A command has three parts:
echo "command [options] [arguments]"
echo ""
echo "Examples:"
echo "ls                    — command only"
echo "ls -la                — command + options"
echo "ls -la /home          — command + options + argument"
echo "cp file1.txt file2.txt — command + two arguments"
echo ""
# Real examples:
ls              # List files in current directory
ls -l           # List with details (long format)
ls -la /var/log # List all files in /var/log with details
```

---

## Customizing the Prompt (PS1)

The prompt is controlled by the **PS1** variable. You can customize it to show whatever information you want.

### Basic Prompt Customization

```bash
# View your current prompt setting
echo $PS1

# Special characters for PS1:
echo "\u — Username"
echo "\h — Hostname (short)"
echo "\H — Hostname (full)"
echo "\w — Current directory (full path)"
echo "\W — Current directory (basename only)"
echo "\d — Date"
echo "\t — Time (24-hour HH:MM:SS)"
echo "\T — Time (12-hour)"
echo "\n — Newline"
echo "\$ — $ for regular user, # for root"
echo "\[ \] — Non-printing character wrappers (for colors)"
```

### Prompt Examples

```bash
# Simple prompt: just username and directory
PS1="\u:\W\$ "
# Result: alex:projects$

# Informative prompt
PS1="\u@\h:\w\$ "
# Result: alex@ubuntu-pc:~/projects$

# Date and time
PS1="[\d \t] \u:\w\$ "
# Result: [Sat May 03 14:30:22] alex:~/projects$

# Minimal
PS1="→ "
# Result: →

# Two-line prompt (great for long paths)
PS1="\u@\h:\w\n\$ "
# Result:
# alex@ubuntu-pc:/home/alex/Projects/my-really-long-project-name
# $
```

### Adding Colors

```bash
# Color codes for PS1
echo "Black:   \[\033[0;30m\]"
echo "Red:     \[\033[0;31m\]"
echo "Green:   \[\033[0;32m\]"
echo "Yellow:  \[\033[0;33m\]"
echo "Blue:    \[\033[0;34m\]"
echo "Purple:  \[\033[0;35m\]"
echo "Cyan:    \[\033[0;36m\]"
echo "White:   \[\033[0;37m\]"
echo "Reset:   \[\033[0m\]"

# Colorful prompt example
PS1="\[\033[0;32m\]\u\[\033[0m\]@\[\033[0;34m\]\h\[\033[0m\]:\[\033[0;33m\]\w\[\033[0m\]\$ "
# Result: alex (green) @ ubuntu-pc (blue) : ~/projects (yellow) $

# Bold colors (replace 0 with 1)
PS1="\[\033[1;32m\]\u@\h\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "
```

### Making It Permanent

```bash
# Edit your shell config file to keep your custom prompt

# For bash:
nano ~/.bashrc
# Add your PS1 line at the end of the file

# For zsh:
nano ~/.zshrc
# zsh uses PROMPT instead of PS1:
# PROMPT='%n@%m:%~%# '

# After editing, reload the config:
source ~/.bashrc    # for bash
source ~/.zshrc     # for zsh
```

---

## Shell Configuration Files

Your shell reads configuration files when it starts. Understanding these is key to customizing your environment.

### bash Configuration Files

```bash
# bash reads these files in order:

# 1. /etc/profile — System-wide, runs for ALL users at login
echo "Contains: system PATH, default settings"

# 2. ~/.bash_profile — Per-user, runs at login (OR ~/.profile)
echo "Contains: user PATH additions, environment variables"
echo "Runs: only when you log in (not every new terminal)"

# 3. ~/.bashrc — Per-user, runs for every new terminal
echo "Contains: aliases, functions, prompt, shell options"
echo "Runs: every time you open a new terminal"

# 4. ~/.bash_logout — Runs when you log out
echo "Contains: cleanup commands"
```

### Typical .bashrc Contents

```bash
# Example ~/.bashrc file

# Set prompt
PS1="\[\033[1;32m\]\u@\h\[\033[0m\]:\[\033[1;34m\]\w\[\033[0m\]\$ "

# Aliases (shortcuts for common commands)
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias mkdir='mkdir -p'
alias df='df -h'
alias free='free -h'

# History settings
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoredups:ignorespace

# Enable color support
alias ls='ls --color=auto'
alias dir='dir --color=auto'
alias grep='grep --color=auto'

# Custom functions
mkcd() {
    mkdir -p "$1" && cd "$1"
}

# Add to PATH
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"

# Set default editor
export EDITOR=vim
export VISUAL=vim
```

### zsh Configuration Files

```bash
# zsh reads these files:

# 1. /etc/zshenv → ~/.zshenv
echo "Runs: for EVERY zsh instance (even scripts)"
echo "Use for: critical environment variables"

# 2. /etc/zprofile → ~/.zprofile
echo "Runs: at login only"
echo "Use for: same as .bash_profile"

# 3. /etc/zshrc → ~/.zshrc
echo "Runs: for every interactive shell"
echo "Use for: aliases, prompt, key bindings, completions"

# 4. /etc/zlogin → ~/.zlogin
echo "Runs: after .zshrc at login"

# 5. ~/.zlogout
echo "Runs: at logout"
```

### Typical .zshrc Contents

```bash
# Example ~/.zshrc file

# Set prompt
PROMPT='%F{green}%n@%m%f:%F{blue}%~%f%# '

# Aliases
alias ll='ls -la'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# History
HISTSIZE=10000
SAVEHIST=10000
HISTFILE=~/.zsh_history
setopt HIST_IGNORE_DUPS
setopt SHARE_HISTORY

# Auto-completion
autoload -Uz compinit
compinit

# Key bindings (emacs style)
bindkey -e

# Enable correction
setopt CORRECT

# Add to PATH
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

### Reloading Configuration

```bash
# After editing config files, apply changes:

# Option 1: Source the file (applies to current terminal)
source ~/.bashrc
source ~/.zshrc

# Option 2: Start a new terminal (fresh session)
# Just close and reopen your terminal

# Option 3: Use exec to replace current shell
exec bash
exec zsh
```

---

## Terminal Shortcuts

These keyboard shortcuts work in most terminals and will **dramatically** speed up your workflow:

### Navigation Shortcuts

```bash
# Moving the cursor
echo "Ctrl + A     — Move to BEGINNING of line"
echo "Ctrl + E     — Move to END of line"
echo "Ctrl + B     — Move back one character (← arrow)"
echo "Ctrl + F     — Move forward one character (→ arrow)"
echo "Alt + B      — Move back one WORD"
echo "Alt + F      — Move forward one WORD"
echo "Ctrl + XX    — Toggle between start and current position"
```

### Editing Shortcuts

```bash
# Deleting text
echo "Ctrl + D     — Delete character under cursor (or exit if empty)"
echo "Ctrl + H     — Delete character before cursor (backspace)"
echo "Ctrl + W     — Delete word before cursor"
echo "Alt + D      — Delete word after cursor"
echo "Ctrl + K     — Delete from cursor to end of line"
echo "Ctrl + U     — Delete from cursor to beginning of line"
echo ""
# Undo and paste
echo "Ctrl + Y     — Paste last deleted text (yank)"
echo "Ctrl + _     — Undo last edit"
```

### Process Control Shortcuts

```bash
# Controlling programs
echo "Ctrl + C     — CANCEL/kill current running command"
echo "Ctrl + Z     — SUSPEND current process (send to background)"
echo "Ctrl + D     — EXIT shell (logout) / signal end-of-file"
echo "Ctrl + \\    — QUIT (sends SIGQUIT, creates core dump)"
```

### Terminal Control Shortcuts

```bash
# Managing the terminal
echo "Ctrl + L     — CLEAR screen (same as 'clear' command)"
echo "Ctrl + S     — FREEZE terminal output (stop scrolling)"
echo "Ctrl + Q     — UNFREEZE terminal (resume scrolling)"
echo "Ctrl + R     — SEARCH command history (reverse search)"
echo "Tab          — AUTO-COMPLETE command or filename"
echo "Tab Tab      — Show all possible completions"
echo "Up Arrow     — Previous command in history"
echo "Down Arrow   — Next command in history"
```

### Command History Shortcuts

```bash
# Working with history
echo "!!           — Repeat last command"
echo "!$           — Last argument of previous command"
echo "!*           — All arguments of previous command"
echo "!n           — Run command number n from history"
echo "!string      — Run last command starting with 'string'"
echo "Ctrl + R     — Search history (type to search, Enter to run)"
echo "history      — Show full command history"
echo "history 20   — Show last 20 commands"
```

---

## Tab Completion

**Tab completion** is one of the most useful features. Press Tab to auto-complete commands, filenames, and paths.

```bash
# Type partial command/filename + Tab to complete

# Command completion
sys  # Press Tab →  system (or shows: systemctl, systemd, ...)
systemc  # Press Tab → systemctl

# File/path completion
cd /ho  # Press Tab → cd /home/
cd /home/al  # Press Tab → cd /home/alex/

# Double-Tab shows all possibilities
ls /etc/ap  # Press Tab Tab →
# apache2/  apparmor/  apparmor.d/  apt/

# It even completes options for some commands (bash-completion)
git ch  # Press Tab → shows: checkout, cherry, cherry-pick
```

### Installing Better Completion

```bash
# Ubuntu/Debian — install bash-completion
sudo apt install bash-completion

# Add to .bashrc if not already there
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi

# For zsh — completion is built-in but can be enhanced
# Add to .zshrc:
autoload -Uz compinit && compinit
```

---

## Practical Examples

Let's put it all together with some real-world examples:

### Example 1: Explore Your System

```bash
# Who am I and where am I?
whoami
# alex

pwd
# /home/alex

# What's in my home directory?
ls -la ~
# Shows all files including hidden ones (.bashrc, .config, etc.)

# How long has this system been running?
uptime
# 14:22:33 up 3 days, 2:14, 1 user, load average: 0.52, 0.48, 0.39

# What shell am I using?
echo "Shell: $SHELL"
echo "Version: $BASH_VERSION"
# Shell: /bin/bash
# Version: 5.2.15(1)-release
```

### Example 2: Customize Your Environment

```bash
# Add a useful alias
echo "alias projects='cd ~/Projects && ls'" >> ~/.bashrc

# Reload config
source ~/.bashrc

# Now just type 'projects' to jump to your Projects folder
projects
```

### Example 3: Use History Effectively

```bash
# Search for a previous command
# Press Ctrl+R, then type part of the command
# (reverse-i-search)`apt': sudo apt install vim

# Run the last command with sudo
sudo !!

# Run the last command that started with 'git'
!git

# See your most-used commands
history | awk '{print $2}' | sort | uniq -c | sort -rn | head -10
```

### Example 4: Multiple Commands

```bash
# Run commands sequentially (always runs all)
echo "first" ; echo "second" ; echo "third"

# Run next command only if previous succeeded (&&)
mkdir new-project && cd new-project && git init

# Run next command only if previous failed (||)
cd /nonexistent || echo "Directory doesn't exist!"

# Combine them
mkdir my-dir && echo "Created!" || echo "Failed!"
```

---

## Summary

```bash
echo "=== Key Takeaways ==="
echo ""
echo "1. Terminal = the window; Shell = the command interpreter"
echo "2. bash = default on Linux; zsh = default on macOS"
echo "3. PS1 variable controls your prompt appearance"
echo "4. .bashrc / .zshrc = your shell configuration"
echo "5. Tab completion saves massive amounts of typing"
echo "6. Ctrl+C cancels, Ctrl+L clears, Ctrl+R searches history"
echo "7. Customize your environment — make it yours"
echo "8. source ~/.bashrc applies config changes immediately"
```

---

## Practice Exercises

Try these in your terminal:

```bash
# 1. Check what shell you're using
echo $SHELL
echo $0

# 2. View your shell config
cat ~/.bashrc    # or cat ~/.zshrc

# 3. Create an alias
alias hi='echo "Hello from the terminal!"'
hi

# 4. Customize your prompt temporarily
PS1="[\t] \W → "
# Changes back when you open a new terminal (not permanent)

# 5. Use history search
# Press Ctrl+R and type "echo"
# It finds your last command containing "echo"

# 6. Practice tab completion
# Type: /etc/pa  then press Tab
# Type: ls /usr/lo  then press Tab

# 7. Chain commands
whoami && echo "is using" && echo $SHELL
```

---

*Next lesson: Navigating the File System →*
