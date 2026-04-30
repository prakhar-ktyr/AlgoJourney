---
title: C Get Started
---

# C Get Started

Unlike Python or JavaScript, C is a **compiled** language. You write source code in a `.c` file, run it through a compiler, and the compiler produces a stand-alone executable program that the operating system can run directly.

The standard compiler on Linux and macOS is **GCC** (the GNU Compiler Collection). On Windows you can use **MSVC** (from Visual Studio), **MinGW-w64** (a Windows port of GCC), or the **Windows Subsystem for Linux** (WSL).

## Step 1 — Install a C compiler

### Linux (Debian / Ubuntu)

```bash
sudo apt update
sudo apt install build-essential
```

`build-essential` installs `gcc`, `g++`, `make`, and the standard C library headers all at once.

### macOS

```bash
xcode-select --install
```

This installs the Apple-shipped Clang compiler. Clang is command-line-compatible with GCC, so every example in this course works unchanged.

### Windows

The easiest path is to install **MSYS2** from [msys2.org](https://www.msys2.org), then in the MSYS2 shell run:

```bash
pacman -S mingw-w64-ucrt-x86_64-gcc
```

Or, install **WSL2** (`wsl --install` in PowerShell as administrator) and follow the Linux instructions inside it.

## Step 2 — Verify the compiler is installed

Open a terminal and run:

```bash
gcc --version
```

You should see something like `gcc (Ubuntu 13.2.0-23ubuntu4) 13.2.0`. If you see "command not found", revisit Step 1.

## Step 3 — Write your first program

Open any text editor (VS Code is great), create a file called **`hello.c`**, and paste the following:

```c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```

Save the file.

## Step 4 — Compile

In the terminal, navigate to the folder containing `hello.c` and run:

```bash
gcc hello.c -o hello
```

What this does:

- `gcc` — invoke the compiler.
- `hello.c` — your source file.
- `-o hello` — name the output executable `hello` (use `-o hello.exe` on Windows).

If you see no output, the compile succeeded. If you see errors, read them carefully — the compiler tells you exactly which line is wrong.

## Step 5 — Run

```bash
./hello
```

You should see:

```
Hello, World!
```

Congratulations — you just wrote, compiled, and ran a real C program.

## Useful compiler flags

Get into the habit of using these flags from day one:

| Flag | What it does |
|------|---------------|
| `-Wall` | Enable **all** the common warnings. |
| `-Wextra` | Enable even more warnings. |
| `-std=c11` | Use the C11 standard (or `c17`, `c99`). |
| `-g` | Include debugging information so a debugger can show source lines. |
| `-O2` | Optimize for speed (use for release builds). |
| `-o name` | Name the output file. |

A good "always-on" command for learning is:

```bash
gcc -Wall -Wextra -std=c11 -g hello.c -o hello
```

Warnings are your friend. Treat every warning as a bug to be fixed.

## What just happened?

When you ran `gcc hello.c -o hello`, four things happened in order:

1. **Preprocessing** — the compiler expanded `#include <stdio.h>` and any other `#` directives into a single big text file.
2. **Compilation** — that text was translated to assembly language for your CPU.
3. **Assembly** — assembly was turned into machine code (an *object file*).
4. **Linking** — the object file was combined with the C standard library to produce the final executable.

You'll learn to control each of these stages later. For now, the important thing is: you have a working setup. On to the language itself.
