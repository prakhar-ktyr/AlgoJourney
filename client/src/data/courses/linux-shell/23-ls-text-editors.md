---
title: Text Editors — nano & vim
---

# Text Editors — nano & vim

Every Linux user needs to edit files directly in the terminal. Whether you're configuring a server, writing scripts, or fixing a config file — a terminal text editor is essential.

The two most common terminal text editors are:

- **nano** — simple, beginner-friendly
- **vim** — powerful, steep learning curve but extremely efficient

---

## Why a Terminal Text Editor?

You can't always use a graphical editor:

- **Remote servers** — SSH gives you only a terminal
- **System configuration** — editing files in `/etc/`
- **Quick edits** — faster than opening a GUI editor
- **Docker containers** — minimal environments without GUI

---

## nano — The Beginner-Friendly Editor

`nano` is the easiest terminal text editor. If you're new to Linux, start here.

---

### Opening a File

```bash
# Open an existing file
nano filename.txt

# Open a new file (creates it on save)
nano newfile.txt

# Open with line numbers displayed
nano -l filename.txt

# Open at a specific line number
nano +15 filename.txt

# Open in read-only mode
nano -v filename.txt
```

---

### The nano Interface

When you open nano, you'll see:

```bash
  GNU nano 6.2            filename.txt

|  (file content appears here)
|
|
|

^G Help    ^O Write Out  ^W Where Is   ^K Cut
^X Exit    ^R Read File  ^\ Replace    ^U Paste
```

The bottom two lines show keyboard shortcuts. The `^` symbol means **Ctrl**.

---

### Essential nano Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+O` | Save (Write Out) |
| `Ctrl+X` | Exit nano |
| `Ctrl+K` | Cut current line |
| `Ctrl+U` | Paste (Uncut) |
| `Ctrl+W` | Search (Where Is) |
| `Ctrl+\` | Search and Replace |
| `Ctrl+G` | Help |
| `Ctrl+C` | Show cursor position |

---

### Saving a File

```bash
# Press Ctrl+O to save
# nano asks for filename:
File Name to Write: filename.txt

# Press Enter to confirm
# You'll see: [ Wrote 42 lines ]
```

---

### Exiting nano

```bash
# Press Ctrl+X to exit
# If file is modified, nano asks:
Save modified buffer?  Y/N

# Press Y to save and exit
# Press N to exit without saving
# Press Ctrl+C to cancel and stay in nano
```

---

### Navigation

```bash
# Arrow keys work as expected
↑ ↓ ← →         # Move cursor

# Page navigation
Ctrl+Y           # Page up
Ctrl+V           # Page down

# Line navigation
Ctrl+A           # Go to beginning of line
Ctrl+E           # Go to end of line
Ctrl+_           # Go to specific line number
```

---

### Editing Text

```bash
# Type normally — text is inserted at cursor position

# Delete
Backspace        # Delete character before cursor
Delete           # Delete character at cursor
Ctrl+K           # Cut (delete) entire current line

# Cut and Paste
Ctrl+K           # Cut current line (can repeat for multiple lines)
Ctrl+U           # Paste the cut text

# Undo and Redo
Alt+U            # Undo
Alt+E            # Redo
```

---

### Search and Replace

```bash
# Search
Ctrl+W           # Open search
Alt+W            # Find next occurrence

# Search and Replace
Ctrl+\           # Open replace
# Choose: Y (replace), N (skip), A (all)
```

---

### Useful nano Options

```bash
# Open with line numbers
nano -l file.txt

# Open with smooth scrolling
nano -S file.txt

# Open with auto-indentation
nano -i file.txt

# Open with word wrapping
nano -w file.txt

# Open multiple files
nano file1.txt file2.txt
# Switch between files: Alt+< and Alt+>
```

---

## vim — The Powerful Editor

`vim` (Vi IMproved) is the most powerful terminal text editor. It has a steep learning curve, but once mastered, it makes you incredibly fast at editing text.

**Key concept:** vim uses **modes** — you switch between different modes to perform different actions.

---

### vim Modes

| Mode | Purpose | How to Enter |
|------|---------|-------------|
| **Normal** | Navigate, delete, copy, paste | Press `Esc` |
| **Insert** | Type and edit text | Press `i`, `a`, `o` |
| **Command** | Save, quit, search, settings | Press `:` from Normal |
| **Visual** | Select text | Press `v` from Normal |

**Remember:** When in doubt, press `Esc` to return to Normal mode!

---

### Opening Files

```bash
# Open a file
vim filename.txt

# Open at a specific line
vim +10 filename.txt

# Open multiple files
vim file1.txt file2.txt

# Open in read-only mode
vim -R filename.txt
```

---

### Your First vim Session

Here's the complete workflow:

```bash
# Step 1: Open vim
vim hello.txt

# Step 2: You're in NORMAL mode (can't type yet!)
# Press 'i' to enter INSERT mode

# Step 3: Type your text
# You'll see -- INSERT -- at the bottom

# Step 4: Press Esc to return to NORMAL mode

# Step 5: Type :wq and press Enter to save and quit
```

---

### Entering Insert Mode

From Normal mode, these keys enter Insert mode:

```bash
i    # Insert before cursor
a    # Append after cursor
I    # Insert at beginning of line
A    # Append at end of line
o    # Open new line below and insert
O    # Open new line above and insert
```

---

### Saving and Quitting

From Normal mode, type `:` to enter Command mode:

```bash
:w           # Save (write)
:q           # Quit (fails if unsaved changes)
:wq          # Save and quit
:x           # Save and quit (same as :wq)
:q!          # Force quit without saving
:w newname   # Save as a different filename
ZZ           # Save and quit (Normal mode shortcut)
```

---

### Basic Navigation (Normal Mode)

```bash
# Character movement
h    # Left
j    # Down
k    # Up
l    # Right

# Word movement
w    # Next word (start)
e    # Next word (end)
b    # Previous word (start)

# Line movement
0    # Beginning of line
^    # First non-blank character
$    # End of line

# Screen movement
Ctrl+f    # Page forward (down)
Ctrl+b    # Page backward (up)
H         # Top of screen (High)
M         # Middle of screen
L         # Bottom of screen (Low)

# File movement
gg   # Go to first line
G    # Go to last line
10G  # Go to line 10
```

---

### Basic Editing (Normal Mode)

```bash
# Delete
x      # Delete character under cursor
X      # Delete character before cursor (backspace)
dd     # Delete entire line
dw     # Delete word
d$     # Delete to end of line
D      # Delete to end of line (same as d$)

# Copy (Yank)
yy     # Copy (yank) entire line
yw     # Copy word
y$     # Copy to end of line

# Paste
p      # Paste after cursor
P      # Paste before cursor

# Undo and Redo
u      # Undo last change
Ctrl+r # Redo (undo the undo)

# Replace
r      # Replace single character under cursor
R      # Enter Replace mode (overtype)

# Change (delete and enter Insert mode)
cw     # Change word
cc     # Change entire line
c$     # Change to end of line
C      # Change to end of line (same as c$)
```

---

### Repeating Commands

One of vim's superpowers — repeat commands with a number:

```bash
5dd    # Delete 5 lines
3yy    # Copy 3 lines
10j    # Move down 10 lines
4dw    # Delete 4 words
2p     # Paste 2 times
```

---

### Search (Normal Mode)

```bash
/pattern    # Search forward for "pattern"
?pattern    # Search backward for "pattern"
n           # Next match (same direction)
N           # Next match (opposite direction)
*           # Search forward for word under cursor
#           # Search backward for word under cursor
```

---

### Example: Editing a Configuration File

```bash
# Open the file
vim /etc/hosts

# Navigate to the line you want to edit
# Use j/k to move up/down, or /pattern to search

# Press 'i' to enter Insert mode
# Make your changes
# Press Esc to return to Normal mode

# Save with :w (may need :w! for root-owned files with sudo)
# Or :wq to save and quit
```

---

## nano vs vim — When to Use Which

| Scenario | Recommended | Why |
|----------|-------------|-----|
| Quick config edit | nano | Simple, fast for one-time edits |
| Writing scripts | vim | Efficient for coding |
| Server emergency | nano | No learning curve needed |
| Daily development | vim | Speed pays off long-term |
| First time on Linux | nano | Focus on the task, not the editor |
| Complex text manipulation | vim | Macros, regex, text objects |

---

### The Practical Approach

```bash
# For beginners: Use nano for everything initially
nano ~/.bashrc

# As you grow comfortable: Learn vim basics
vimtutor    # Built-in vim tutorial (takes ~30 minutes)

# Eventually: Use vim for most editing
vim ~/.bashrc
```

---

## vimtutor — Learn vim Interactively

vim comes with a built-in interactive tutorial:

```bash
# Start the vim tutorial
vimtutor
```

This takes about 30 minutes and teaches you the essentials through hands-on practice. It's the **best way** to learn vim.

---

## Quick Reference: nano

```bash
# File operations
Ctrl+O    Save
Ctrl+X    Exit
Ctrl+R    Insert file

# Editing
Ctrl+K    Cut line
Ctrl+U    Paste
Alt+U     Undo
Alt+E     Redo

# Navigation
Ctrl+A    Start of line
Ctrl+E    End of line
Ctrl+Y    Page up
Ctrl+V    Page down
Ctrl+_    Go to line

# Search
Ctrl+W    Search
Ctrl+\    Replace
Alt+W     Next match
```

---

## Quick Reference: vim

```bash
# Modes
i         Enter Insert mode
Esc       Return to Normal mode
:         Enter Command mode
v         Enter Visual mode

# Save/Quit
:w        Save
:q        Quit
:wq       Save and quit
:q!       Quit without saving

# Navigation
h j k l   Left, Down, Up, Right
w b       Next/previous word
0 $       Start/end of line
gg G      Start/end of file

# Editing
dd        Delete line
yy        Copy line
p         Paste
u         Undo
Ctrl+r    Redo
x         Delete character

# Search
/text     Search forward
n N       Next/previous match
```

---

## Practice Exercises

```bash
# Exercise 1: Create and edit a file with nano
nano /tmp/practice.txt
# Type some text, save with Ctrl+O, exit with Ctrl+X

# Exercise 2: Open the file in vim
vim /tmp/practice.txt
# Press i, add a line, press Esc, type :wq

# Exercise 3: Use vimtutor
vimtutor
# Complete at least Lesson 1

# Exercise 4: Edit your .bashrc with nano
nano ~/.bashrc
# Add a comment: # Edited with nano
# Save and exit

# Exercise 5: Practice vim navigation
vim /etc/passwd
# Use j/k to scroll, /root to search, :q to quit (read-only)

# Exercise 6: Create a script with your preferred editor
nano /tmp/myscript.sh
# OR
vim /tmp/myscript.sh
# Write: #!/bin/bash
#        echo "Hello from my script!"
# Save, then: chmod +x /tmp/myscript.sh && /tmp/myscript.sh
```

---

## Summary

- **nano** is simple and beginner-friendly — great for quick edits
- **vim** is powerful and efficient — worth learning for daily use
- vim uses modes: Normal (navigate), Insert (type), Command (save/quit)
- Start with nano, learn vim gradually through `vimtutor`
- Both editors are available on virtually every Linux system
