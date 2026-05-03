---
title: Vim In Depth
---

# Vim In Depth

Now that you know the basics of vim, let's explore its **full power**. This lesson covers advanced movement, editing, text objects, macros, and configuration.

---

## Advanced Movement

### Word Movement

```bash
w    # Move to start of NEXT word (stops at punctuation)
W    # Move to start of NEXT WORD (whitespace-separated)
b    # Move to start of PREVIOUS word
B    # Move to start of PREVIOUS WORD
e    # Move to END of current/next word
E    # Move to END of current/next WORD
```

The difference between `w` and `W`:

```bash
# Given: hello-world foo_bar
# w stops at: h, -, w, (space), f, _, b
# W stops at: h, (space), f
```

`W`, `B`, `E` treat everything between whitespace as one word — useful for code!

---

### Line Movement

```bash
0    # Go to column 0 (absolute start of line)
^    # Go to first non-blank character
$    # Go to end of line
g_   # Go to last non-blank character

f{c} # Find next character {c} on current line (move TO it)
F{c} # Find previous character {c} on current line
t{c} # Move Till (one before) next character {c}
T{c} # Move Till (one after) previous character {c}
;    # Repeat last f/F/t/T forward
,    # Repeat last f/F/t/T backward
```

**Example:**

```bash
# Line: const result = calculateTotal(items);
# Cursor at start
# f(    → moves to (
# t;    → moves to )  (one before ;)
```

---

### Screen Movement

```bash
H    # Move to top of screen (High)
M    # Move to middle of screen
L    # Move to bottom of screen (Low)

Ctrl+f   # Scroll forward (down) one page
Ctrl+b   # Scroll backward (up) one page
Ctrl+d   # Scroll down half page
Ctrl+u   # Scroll up half page

zz       # Center current line on screen
```

---

### File Movement

```bash
gg      # Go to first line of file
G       # Go to last line of file
10G     # Go to line 10
:10     # Go to line 10 (command mode)

%       # Jump to matching bracket ( ), [ ], { }

Ctrl+o  # Jump back to previous location
Ctrl+i  # Jump forward to next location
```

---

## The Operator + Motion Formula

vim's editing power comes from combining **operators** with **motions**:

```bash
operator + motion = action
```

### Operators

```bash
d    # Delete
c    # Change (delete and enter Insert mode)
y    # Yank (copy)
>    # Indent right
<    # Indent left
=    # Auto-indent
gU   # Make uppercase
gu   # Make lowercase
```

### Combining Operators with Motions

```bash
# Delete commands
dw    # Delete from cursor to start of next word
d$    # Delete from cursor to end of line
d0    # Delete from cursor to start of line
dG    # Delete from cursor to end of file
df)   # Delete from cursor to next )
dt"   # Delete from cursor to (but not including) next "

# Change commands
cw    # Change word (delete word, enter Insert)
c$    # Change to end of line
ci"   # Change inside quotes (see text objects below)

# Yank (copy) commands
yw    # Yank word
y$    # Yank to end of line

# Indent commands
>>    # Indent current line right
<<    # Indent current line left
=G    # Auto-indent from cursor to end of file
```

---

### The Dot Command — Repeat Last Change

The `.` (dot) command repeats your last edit. It's incredibly powerful:

```bash
# Delete a word
dw

# Now press . to delete the next word
# And again . for the next
# And again...
```

**Real-world example:**

```bash
# You want to change "foo" to "bar" on multiple lines
# On first occurrence: cw bar Esc
# On each subsequent occurrence: n .
# (n = find next, . = repeat the change)
```

---

## Text Objects

Text objects let you operate on structured text units. They're one of vim's most powerful features.

### Syntax

```bash
operator + a/i + object
# a = "a" (around) — includes surrounding characters
# i = "inner" — inside only, excludes surrounding characters
```

### Common Text Objects

```bash
iw   # Inner word
aw   # A word (includes surrounding space)
i"   # Inner double quotes
a"   # A double quote (includes the quotes)
i(   # Inner parentheses (same as ib)
a(   # A parentheses (includes parens)
i{   # Inner braces (same as iB)
a{   # A braces
it   # Inner tag (HTML/XML)
at   # A tag
```

### Text Object Examples

```bash
# Given: const msg = "Hello, World!";
# Cursor anywhere inside the quotes:

di"   # Delete inside quotes → const msg = "";
ci"   # Change inside quotes → const msg = "|" (Insert mode)
yi"   # Yank inside quotes → copies "Hello, World!"

# Given: function calculate(x, y, z) {
# Cursor inside parentheses:

di(   # Delete inside parens → function calculate() {
ci(   # Change inside parens → function calculate(|) {

# Given: <div class="container">content</div>
# Cursor inside the tag:

dit   # Delete inner tag → <div class="container"></div>
ci{   # Change inside braces (enter insert mode inside empty braces)
```

---

## Visual Mode

Visual mode lets you select text before applying operations.

### Three Visual Modes

```bash
v      # Character-wise visual mode
V      # Line-wise visual mode
Ctrl+v # Block (column) visual mode
```

---

### Character Visual Mode (v)

```bash
# Press v, then move to select characters
v + motion    # Select text
# Then apply an operator:
d    # Delete selection
y    # Yank selection
c    # Change selection
>    # Indent selection
U    # Uppercase selection
u    # Lowercase selection
```

---

### Line Visual Mode (V)

```bash
# Press V to select entire lines
V + j/k    # Select multiple lines
# Then apply operator
Vd         # Delete current line
V5jd       # Delete current + 5 lines below
V5j>       # Indent 6 lines
```

---

### Block Visual Mode (Ctrl+v)

Block mode selects a **rectangle** of text — perfect for columns:

```bash
# Insert text on multiple lines:
# 1. Ctrl+v to enter block mode
# 2. Select the lines (j/k)
# 3. Press I (capital i) to insert
# 4. Type your text
# 5. Press Esc — text appears on all lines!

# Example: Comment out multiple lines
# Ctrl+v → 3j → I → # → Esc
```

---

## Search and Replace

### Search

```bash
/pattern     # Search forward
?pattern     # Search backward
n            # Next match
N            # Previous match
*            # Search word under cursor (forward)
#            # Search word under cursor (backward)

# Search options
/pattern\c   # Case insensitive search
/pattern\C   # Case sensitive search
/\vpattern   # "Very magic" — regex without escaping
```

---

### Search and Replace (Substitute)

```bash
# Replace first occurrence on current line
:s/old/new/

# Replace ALL occurrences on current line
:s/old/new/g

# Replace all occurrences in entire file
:%s/old/new/g

# Replace with confirmation
:%s/old/new/gc
# y = yes, n = no, a = all remaining, q = quit, l = last (replace and quit)

# Replace in a range of lines (lines 5 to 20)
:5,20s/old/new/g

# Replace in visually selected area
# Select with V, then type :s/old/new/g

# Case-insensitive replace
:%s/old/new/gi

# Use regex in replacement
:%s/\(\w\+\)/"\1"/g    # Wrap each word in quotes
```

**Practical examples:**

```bash
# Replace all tabs with 4 spaces
:%s/\t/    /g

# Remove trailing whitespace
:%s/\s\+$//g

# Change variable name (whole word only)
:%s/\<oldName\>/newName/g
```

---

## Working with Multiple Files

### Buffers

```bash
:e filename     # Open a file in a new buffer
:ls             # List all open buffers
:bn             # Go to next buffer
:bp             # Go to previous buffer
:b3             # Go to buffer number 3
:bd             # Close current buffer (buffer delete)
:bufdo %s/old/new/g   # Run command on all buffers
```

---

### Split Windows

```bash
# Horizontal split
:sp filename    # Open file in horizontal split

# Vertical split
:vsp filename   # Open file in vertical split

# Navigate between splits
Ctrl+w h    # Move to left split
Ctrl+w j    # Move to split below
Ctrl+w k    # Move to split above
Ctrl+w l    # Move to right split

# Close splits
:close      # Close current split
:only       # Close all splits except current
```

---

## Registers

Registers are vim's clipboard system. vim has many registers for storing text.

```bash
# Named registers (a-z)
"ayy     # Yank line into register a
"ap      # Paste from register a

# View registers
:reg             # Show all registers

# Special registers
""       # Default register (last delete/yank)
"0       # Last yank
"1-"9    # Last 9 deletes (1 = most recent)
"+       # System clipboard
"_       # Black hole register (delete without saving)
```

**System clipboard integration:**

```bash
# Copy to system clipboard
"+yy     # Yank line to system clipboard

# Paste from system clipboard
"+p      # Paste from system clipboard
```

---

## Macros

Macros let you **record** a sequence of commands and **replay** them.

### Recording a Macro

```bash
qa       # Start recording into register 'a'
# ... perform your edits ...
q        # Stop recording
```

### Playing a Macro

```bash
@a       # Play macro in register 'a'
@@       # Repeat last played macro
5@a      # Play macro 'a' five times
```

### Practical Example: Add Quotes with a Macro

```bash
# Before:
apple
banana
cherry
grape

# Record: qa → 0 → i" → Esc → A" → Esc → j → q
# Result after @a on each line:
"apple"
"banana"
"cherry"
"grape"

# Apply to all remaining lines:
# Go to line 2, then: 3@a
```

---

## .vimrc Configuration

The `~/.vimrc` file customizes vim's behavior.

A practical starter `.vimrc`:

```bash
" === Display ===
set number              " Show line numbers
set relativenumber      " Relative line numbers
set cursorline          " Highlight current line
set showmatch           " Highlight matching brackets
syntax on               " Enable syntax highlighting

" === Indentation ===
set tabstop=4           " Tab = 4 spaces visually
set shiftwidth=4        " Indent = 4 spaces
set expandtab           " Use spaces instead of tabs
set autoindent          " Copy indent from current line
set smartindent         " Smart auto-indenting

" === Search ===
set incsearch           " Search as you type
set hlsearch            " Highlight search results
set ignorecase          " Case insensitive search
set smartcase           " Unless uppercase is used

" === Behavior ===
set mouse=a             " Enable mouse support
set clipboard=unnamedplus  " Use system clipboard
set scrolloff=8         " Keep 8 lines above/below cursor
set noswapfile          " Disable swap files

" === Key Mappings ===
let mapleader = " "     " Set leader key to space
nnoremap <leader>w :w<CR>        " Space+w to save
nnoremap <leader>q :q<CR>        " Space+q to quit

" === Split Navigation ===
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l
```

---

## Practice Exercises

```bash
# Exercise 1: Text objects practice
# Open a code file and try:
# ci" — change inside quotes
# da( — delete around parentheses
# yi{ — yank inside braces

# Exercise 2: Block visual mode
# Create a file with 5 lines, add "# " to all of them using Ctrl+v

# Exercise 3: Search and replace
# Open a file and:
# :%s/\<old\>/new/gc — replace with confirmation

# Exercise 4: Macros
# Create a list of words (one per line)
# Record a macro to wrap each in quotes
# Play the macro on all lines

# Exercise 5: Split windows
# Open two files side by side:
# vim file1.txt
# :vsp file2.txt
# Navigate with Ctrl+w h/l

# Exercise 6: Create your .vimrc
# Copy the starter config from this lesson
# Customize it to your preferences
```

---

## Summary

- Use **motions** (`w`, `b`, `f`, `t`, `0`, `$`, `gg`, `G`) for fast navigation
- **Operators + motions** (`dw`, `ci"`, `y$`) combine for powerful editing
- **Text objects** (`iw`, `i"`, `a(`) operate on structured text
- **Visual mode** (`v`, `V`, `Ctrl+v`) for selection-based editing
- **Search and replace** (`:%s/old/new/g`) for bulk changes
- **Macros** (`qa...q`, `@a`) automate repetitive edits
- **Registers** store multiple yanked/deleted texts
- Configure vim with `~/.vimrc` for your workflow
- Extend with plugins via vim-plug
