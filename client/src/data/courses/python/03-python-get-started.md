---
title: Python Get Started
---

# Python Get Started

Unlike C, Python is **interpreted** — you don't have to compile your code before running it. You hand a `.py` file to the Python interpreter and it executes the code line by line.

## Step 1 — Install Python

### macOS

The easiest way is [Homebrew](https://brew.sh):

```bash
brew install python@3.12
```

This installs `python3` and `pip3`. Apple ships an old Python with macOS — don't use it for development.

### Linux (Debian / Ubuntu)

Most distros come with Python 3 pre-installed. Verify with `python3 --version`. If it's missing or too old:

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### Windows

Download the official installer from [python.org/downloads](https://www.python.org/downloads/). During setup, **check the box "Add Python to PATH"** — this single checkbox saves hours of frustration later.

After installation, open PowerShell and run `python --version`.

## Step 2 — Verify the installation

```bash
python3 --version
```

You should see something like `Python 3.12.4`. On Windows you may need `python` instead of `python3`.

If you see "command not found", revisit Step 1 — make sure Python is on your `PATH`.

## Step 3 — The Python REPL

Run `python3` with no arguments. You'll see a prompt:

```
Python 3.12.4 (main, Jun 21 2024, 14:09:23) [Clang 15.0.0] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

This is the **REPL** — Read, Eval, Print, Loop. Type any expression and Python evaluates it immediately:

```python
>>> 2 + 2
4
>>> "hello" * 3
'hello hello hello '
>>> import this
```

Press `Ctrl+D` (macOS/Linux) or `Ctrl+Z` then `Enter` (Windows) to exit. The REPL is amazing for trying things out.

## Step 4 — Your first script

Real programs live in files. Open any text editor (VS Code with the Python extension is a great default), create a file called **`hello.py`**, and paste:

```python
print("Hello, World!")
```

Save the file.

## Step 5 — Run

In the terminal, navigate to the folder containing `hello.py` and run:

```bash
python3 hello.py
```

You should see:

```
Hello, World!
```

That's it — you wrote and ran a real Python program.

## Useful interpreter flags

| Flag           | What it does                                                       |
| -------------- | ------------------------------------------------------------------ |
| `-V`           | Print the Python version.                                          |
| `-c "code"`    | Run a one-liner: `python3 -c "print(2**100)"`.                     |
| `-m module`    | Run a library module as a script: `python3 -m http.server`.        |
| `-i script.py` | Run the script, then drop into the REPL with all variables loaded. |
| `-W default`   | Show deprecation warnings (helpful when learning).                 |

## A slightly bigger example

```python
name = input("What is your name? ")
print(f"Hello, {name}! Welcome to Python.")
```

Run it and you'll be prompted to type your name. The `f"..."` is an **f-string**, a way to embed variables inside text — we'll see them constantly.

## What just happened?

When you ran `python3 hello.py`:

1. **Tokenizer** broke the source into tokens (`print`, `(`, `"Hello, World!"`, `)`).
2. **Parser** built an abstract syntax tree.
3. **Compiler** turned the tree into **bytecode** — a compact, low-level instruction set for the Python virtual machine.
4. **Interpreter** ran the bytecode on the Python VM.

You'll never see steps 1–3 unless you ask for them, but knowing they exist explains the `__pycache__` folders Python sometimes leaves behind — those are cached bytecode files.

You're now ready for the language itself. Onwards.
