---
title: Navigating the File System
---

# Navigating the File System

You already know `cd`, but there's so much more to efficient navigation. In this lesson, you'll learn techniques that make moving around the file system fast and effortless.

---

## cd In Depth

Let's revisit `cd` with more advanced usage patterns.

### Absolute Paths

```bash
# Jump to any directory with its full path
cd /var/log
cd /etc/nginx/sites-available
cd /home/alice/Projects/webapp/src

# Works no matter where you currently are
pwd
# /tmp/some/random/place
cd /home/alice
pwd
# /home/alice
```

### Relative Paths

```bash
# Move relative to where you are
pwd
# /home/alice

cd Documents
pwd
# /home/alice/Documents

cd projects/webapp
pwd
# /home/alice/Documents/projects/webapp

# Go up and sideways
cd ../../downloads
pwd
# /home/alice/Documents/downloads
```

### Moving Up Multiple Levels

```bash
# One level up
cd ..

# Two levels up
cd ../..

# Three levels up
cd ../../..

# Up and into a different branch
cd ../../other-project/src
```

### cd Shortcuts Review

```bash
# Go home (three equivalent ways)
cd
cd ~
cd $HOME

# Go to previous directory
cd -
# Outputs: /previous/path

# Go to another user's home
cd ~bob
# Goes to /home/bob (if it exists and you have permission)
```

### Try It Yourself

```bash
# Practice: navigate and come back
cd /etc
pwd
cd -
pwd
# You're back where you started!

# Chain navigation
cd /var/log
cd -         # back to /etc
cd -         # back to /var/log
```

---

## Tab Completion

Tab completion is your **best friend**. Press Tab to auto-complete paths, commands, and more.

### Basic Tab Completion

```bash
# Type partial path, press Tab:
cd /ho<Tab>
# Completes to: cd /home/

cd /home/al<Tab>
# Completes to: cd /home/alice/

cd ~/Doc<Tab>
# Completes to: cd ~/Documents/
```

### Double-Tab for Options

When multiple matches exist, press Tab twice to see all options:

```bash
cd /etc/ap<Tab><Tab>
# Shows: apparmor/  apparmor.d/  apt/

# Type more characters to narrow it down
cd /etc/apt<Tab>
# Completes to: cd /etc/apt/
```

### Tab Completion for Commands

```bash
# Complete command names
sys<Tab><Tab>
# Shows: systemctl  systemd-analyze  sysctl ...

# Complete options (works with some commands)
ls --col<Tab>
# Completes to: ls --color
```

### Tab Completion for Files

```bash
# Complete filenames
cat /etc/host<Tab>
# Shows: hostname  hosts  hosts.allow  hosts.deny

cat /etc/hostn<Tab>
# Completes to: cat /etc/hostname
```

### Try It Yourself

```bash
# Practice tab completion:
# 1. Type: cd /u<Tab>/lo<Tab>/b<Tab>
#    Should complete to: cd /usr/local/bin/

# 2. Type: ls /etc/sys<Tab><Tab>
#    See what options are available

# 3. Type: cat /proc/cpu<Tab>
#    Should complete to: cat /proc/cpuinfo
```

> **Tip:** Train yourself to press Tab after every few characters. It's faster AND prevents typos!

---

## pushd / popd — Directory Stack

The directory stack lets you **save** directories and **return** to them later. Think of it as bookmarks.

### pushd — Push and Change

```bash
# Start in home
pwd
# /home/alice

# Push current dir and move to /etc
pushd /etc
# /etc ~ 

pwd
# /etc

# Push again, move to /var/log
pushd /var/log
# /var/log /etc ~

pwd
# /var/log
```

### popd — Pop and Return

```bash
# Return to previous directory in stack
popd
# /etc ~

pwd
# /etc

popd
# ~

pwd
# /home/alice
```

### View the Stack

```bash
# See the current directory stack
dirs
# /var/log /etc ~

# See the stack with indices
dirs -v
# 0  /var/log
# 1  /etc
# 2  ~

# Jump to a specific index
cd ~2
# Goes to ~ (index 2)
```

### Practical Example

```bash
# Working on a project, need to check config files
pwd
# /home/alice/project/src/components

# Save current location and go check nginx config
pushd /etc/nginx
# Edit something...
cat nginx.conf

# Go back to where you were working
popd
pwd
# /home/alice/project/src/components
```

### Try It Yourself

```bash
# Build a stack of directories
pushd /tmp
pushd /var/log
pushd /etc

# Check the stack
dirs -v

# Pop back through each one
popd
pwd
popd
pwd
popd
pwd
```

---

## CDPATH — Auto-Search Paths

`CDPATH` tells `cd` to look in additional directories when you type a name.

### Setting Up CDPATH

```bash
# Add directories to CDPATH
export CDPATH=".:~:~/Projects:~/Documents"

# Now you can cd to subdirectories of those paths from anywhere!
cd myproject
# If ~/Projects/myproject exists, you go there!

cd notes
# If ~/Documents/notes exists, you go there!
```

### How CDPATH Works

```bash
# Without CDPATH:
cd myproject
# bash: cd: myproject: No such file or directory

# With CDPATH=.:~:~/Projects
cd myproject
# /home/alice/Projects/myproject
# It searched ~/Projects and found it!
```

### Setting CDPATH Permanently

```bash
# Add to your ~/.bashrc or ~/.zshrc:
echo 'export CDPATH=".:~:~/Projects:~/Documents"' >> ~/.bashrc

# Reload
source ~/.bashrc

# Now it works in every new terminal
```

### Try It Yourself

```bash
# Set up CDPATH for this session
export CDPATH=".:~:/etc:/var"

# Now try:
cd log
# Should go to /var/log

cd ~
cd hosts
# Won't work (hosts is a file, not a directory)

# Reset when done
unset CDPATH
```

> **Tip:** Always include `.` (current directory) at the start of CDPATH so `cd subdir` still works normally.

---

## tree — Visual Directory Structure

The `tree` command displays directories as a visual tree — much easier to understand than plain `ls`.

### Installation

```bash
# Debian/Ubuntu
sudo apt install tree

# macOS
brew install tree

# Red Hat/CentOS
sudo yum install tree
```

### Basic Usage

```bash
tree
```

**Output:**

```bash
.
├── Documents
│   ├── notes.txt
│   └── report.pdf
├── Downloads
│   └── installer.deb
├── Pictures
│   ├── photo1.jpg
│   └── photo2.png
└── scripts
    ├── backup.sh
    └── setup.sh

4 directories, 6 files
```

### Limiting Depth

```bash
# Show only 1 level deep
tree -L 1
# .
# ├── Documents
# ├── Downloads
# ├── Pictures
# └── scripts

# Show 2 levels deep
tree -L 2

# Show 3 levels of /etc
tree /etc -L 2 | head -30
```

### Useful Flags

```bash
# Show only directories (no files)
tree -d

# Show hidden files
tree -a

# Show file sizes
tree -s

# Show human-readable sizes
tree -sh

# Show permissions
tree -p

# Color output
tree -C

# Combine flags
tree -L 2 -shC
```

### Filtering

```bash
# Show only .js files
tree -P "*.js"

# Exclude node_modules
tree -I "node_modules"

# Exclude multiple patterns
tree -I "node_modules|.git|dist"

# Show only directories matching a pattern
tree -d -P "src*"
```

### Try It Yourself

```bash
# View your home directory structure
tree ~ -L 2 -d

# View a project structure (exclude clutter)
tree ~/Projects/myapp -I "node_modules|.git" -L 3

# See files with sizes
tree -sh -L 1
```

---

## Practical Navigation Scenarios

### Scenario 1: Find the Config File

```bash
# "Where is the nginx config?"

# Strategy: Check common locations
ls /etc/nginx/nginx.conf
# If it exists, open it!

# Or use find
find /etc -name "nginx.conf" 2>/dev/null
# /etc/nginx/nginx.conf

# Or use locate (faster, uses a database)
locate nginx.conf
```

### Scenario 2: Go Back to Where I Was

```bash
# Method 1: cd -
cd /some/deep/nested/directory
cd /etc  # Oops, need to check something
# Go back:
cd -
# Back to /some/deep/nested/directory

# Method 2: pushd/popd
pushd /etc
# Check what you need...
popd
# Back to where you were

# Method 3: Save the path
MYDIR=$(pwd)
cd /etc
# ... do stuff ...
cd $MYDIR
```

### Scenario 3: Navigate a Project

```bash
# Typical web project navigation
cd ~/Projects/webapp

# Jump between source and tests
cd src/components
# ... edit ...
cd ../../tests/components
# ... run tests ...
cd ../../src/components
# ... back to editing

# Better: use pushd
pushd src/components
# ... edit ...
pushd ../../tests/components
# ... test ...
popd
# back to src/components
```

### Scenario 4: Work in Multiple Projects

```bash
# Set up aliases for frequent directories
alias proj="cd ~/Projects"
alias webapp="cd ~/Projects/webapp"
alias api="cd ~/Projects/api-server"
alias docs="cd ~/Documents"

# Now just type:
webapp
pwd
# /home/alice/Projects/webapp

api
pwd
# /home/alice/Projects/api-server
```

---

## Wildcards in Paths

Wildcards (glob patterns) let you match multiple files or directories.

### * — Match Anything

```bash
# List all .txt files
ls *.txt
# notes.txt  readme.txt  todo.txt

# List all files starting with "test"
ls test*
# test1.js  test2.js  test_utils.js

# All files in all subdirectories (one level)
ls */
```

### ? — Match Single Character

```bash
# Match exactly one character
ls file?.txt
# file1.txt  file2.txt  fileA.txt

# But NOT:
# file10.txt (two characters after "file")
# file.txt   (zero characters after "file")

ls test?.js
# test1.js  test2.js  testA.js
```

### [abc] — Match Character Set

```bash
# Match specific characters
ls file[123].txt
# file1.txt  file2.txt  file3.txt

# Match a range
ls file[a-z].txt
# filea.txt  fileb.txt  filec.txt

# Match digits
ls log[0-9].txt
# log1.txt  log2.txt  log9.txt

# Negate with ^
ls file[^0-9].txt
# fileA.txt  fileB.txt (not digits)
```

### {a,b} — Brace Expansion

```bash
# Match multiple patterns
ls {*.js,*.ts}
# All .js and .ts files

# Navigate with braces
ls /etc/{hosts,hostname,resolv.conf}
# Lists these three specific files

# Create multiple items
mkdir {src,tests,docs,config}
```

### Combining Wildcards with Navigation

```bash
# Change to any directory matching pattern
cd /var/log/ap*
# Goes to /var/log/apt/ (if it's the only match)

# List all config files in /etc
ls /etc/*.conf

# Find all README files
ls ~/Projects/*/README.md
```

### Try It Yourself

```bash
# Practice wildcards
cd /tmp

# Create test files
touch file{1..5}.txt
touch data_{a,b,c}.csv
touch report_2024_{01..12}.pdf

# Now use wildcards
ls file?.txt
ls data_*.csv
ls report_2024_0[1-6].pdf
ls *.{txt,csv}
```

---

## The Special Directories: . and ..

### . (Current Directory)

```bash
# Explicitly reference current directory
ls .
# Same as: ls

# Copy something TO here
cp /etc/hosts .
# Copies /etc/hosts to current directory

# Run a script in current directory
./run.sh
# Without ./ the shell searches PATH, not current dir

# Find files in current directory
find . -name "*.txt"
```

### .. (Parent Directory)

```bash
# Reference parent directory
ls ..
# Lists parent's contents

# Copy from parent
cp ../config.ini .

# Move file to parent
mv file.txt ..

# Multiple levels
ls ../../
cat ../../../etc/hosts
```

### Combining with Other Paths

```bash
# Go to sibling directory
cd ../sibling

# Copy between siblings
cp ../project-a/file.txt ../project-b/

# Reference relative to parent
ls ../other-project/src/

# Use in scripts for portability
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
```

---

## Combining Commands for Navigation

### Chaining with &&

```bash
# Move and list
cd /var/log && ls -la

# Create and enter a directory
mkdir -p new_project && cd new_project

# Go somewhere, do something, come back
cd /etc && cat hosts && cd -
```

### Subshells for Temporary Navigation

```bash
# Navigate in a subshell (doesn't affect your current directory)
(cd /etc && cat hostname)
pwd
# Still in your original directory!

# Useful for scripts
(cd /tmp && ./cleanup.sh)
# You never actually moved
```

### Finding and Navigating

```bash
# Find a file and go to its directory
cd $(dirname $(find ~ -name "special.conf" -print -quit 2>/dev/null))

# Find directories and choose one
find ~/Projects -type d -name "src" | head -5
# Then cd to the one you want

# Use fzf for interactive navigation (if installed)
cd $(find ~ -type d | fzf)
```

---

## Navigation Efficiency Tips

### Create Shortcuts

```bash
# Add to ~/.bashrc or ~/.zshrc:

# Quick aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Project shortcuts
alias p="cd ~/Projects"
alias dl="cd ~/Downloads"

# Function to make and enter directory
mkcd() {
  mkdir -p "$1" && cd "$1"
}
```

### Use History for Navigation

```bash
# Search history for cd commands
history | grep "^.*cd " | tail -10

# Reverse search (Ctrl+R)
# Press Ctrl+R, type part of a path
# It finds the last matching command
```

### Bookmark Directories

```bash
# Simple bookmark system using variables
export PROJ=~/Projects/webapp
export CONFIG=/etc/nginx

# Navigate using bookmarks
cd $PROJ
cd $CONFIG/sites-available
```

---

## Exercises

### Exercise 1: Tab Completion Race

```bash
# Navigate to these paths using minimal keystrokes (Tab heavily):
# /usr/local/share/
# /etc/systemd/system/
# /var/log/apt/

# Count your keystrokes — can you do each in under 15?
cd /u<Tab>lo<Tab>sh<Tab>
cd /e<Tab>sy<Tab>sy<Tab>
cd /v<Tab>lo<Tab>ap<Tab>
```

### Exercise 2: pushd/popd Workflow

```bash
# 1. Start at home
cd ~

# 2. Push to /etc
pushd /etc

# 3. Push to /var/log
pushd /var/log

# 4. Push to /tmp
pushd /tmp

# 5. Check your stack
dirs -v

# 6. Pop back through each directory
popd && pwd
popd && pwd
popd && pwd
```

### Exercise 3: Wildcard Navigation

```bash
# Create a practice structure
mkdir -p /tmp/nav-practice/{src,test,docs,config}
touch /tmp/nav-practice/src/{main,utils,helpers}.js
touch /tmp/nav-practice/test/{main,utils}.test.js
touch /tmp/nav-practice/docs/{readme,guide,api}.md

# Now navigate and list:
cd /tmp/nav-practice
ls src/*.js
ls test/*.test.js
ls docs/[rg]*.md
ls {src,test}/*.js
```

### Exercise 4: Efficient Navigation

```bash
# Set up aliases and test them:
alias proj="cd ~/Projects"
alias home="cd ~"

# Create a mkcd function:
mkcd() { mkdir -p "$1" && cd "$1"; }

# Test it:
mkcd /tmp/my-new-project
pwd
# /tmp/my-new-project

# Navigate using cd -
cd /etc
cd -
# Back to /tmp/my-new-project
```

---

## Summary

You now have a full toolkit for efficient navigation:

- **cd** with absolute/relative paths, `~`, `-`, `..`
- **Tab completion** — your biggest time-saver
- **pushd/popd** — directory bookmarking
- **CDPATH** — auto-search for directories
- **tree** — visual directory exploration
- **Wildcards** — `*`, `?`, `[abc]`, `{a,b}`
- **Aliases and functions** — custom shortcuts

The key to speed is **practice**. Force yourself to use Tab completion and `cd -` until they become muscle memory!

In the next lesson, you'll learn to create files and directories — building your own structures in the file system.
