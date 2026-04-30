---
title: C Introduction
---

# C Introduction

## What is C?

C is a **general-purpose, compiled, statically-typed programming language**. It was created by **Dennis Ritchie** at Bell Labs between 1969 and 1973 to rewrite the UNIX operating system in a portable, high-level way. Before C, operating systems were written almost entirely in assembly language, which had to be re-written from scratch for every new CPU.

C struck a remarkable balance: it gives you the speed and low-level control of assembly while looking and reading like a high-level language. That balance is the reason C is still everywhere, more than 50 years later.

## Where C is used today

- **Operating systems** — Linux, the Windows NT kernel, macOS XNU, Android's lower layers.
- **Embedded systems & firmware** — microcontrollers, IoT devices, automotive ECUs, medical devices.
- **Databases** — PostgreSQL, MySQL, SQLite, Redis are written in C.
- **Language runtimes** — CPython (the reference Python interpreter), Node.js's `libuv`, the Ruby MRI, PHP, Lua.
- **Compilers and tooling** — GCC, Clang, the LLVM project's libraries.
- **Networking** — Nginx, OpenSSL, much of the Linux networking stack.
- **Graphics and games** — many game engines have a C core; OpenGL itself is a C API.

## Why learn C?

1. **You learn how the machine works.** Variables become memory addresses; arrays become pointer arithmetic. Concepts that are hidden in JavaScript or Python are visible in C.
2. **C makes you a better programmer in any language.** Garbage collection, references, value vs reference semantics — all become obvious once you've managed memory by hand.
3. **It's the lingua franca.** Almost every operating system exposes its API in C. Want to call the Linux kernel? Use C. Want to write a Python extension? Use C.
4. **It's fast.** C compiles directly to machine code with no runtime overhead. When milliseconds matter, C wins.
5. **It's small.** The entire language fits in a thin book. There are no classes, no inheritance, no decorators, no async/await — just functions, structs, and pointers.

## What C is *not*

C is honest about being a low-level language, and that honesty has costs:

- There is **no garbage collector**. If you allocate memory, you must free it.
- There is **no built-in string type**. Strings are arrays of `char` ending in `\0`.
- There is **no exception system**. Errors are returned as integer codes.
- There is **no bounds checking**. Writing past the end of an array is undefined behavior.
- The standard library is **small**. No HTTP client, no JSON parser, no regex (until C11, and still rarely used).

These constraints are why C is fast. They are also why a careless C program can crash spectacularly. This course will teach you how to write C *carefully*.

## Versions of C

C has been formally standardized several times. The major standards you may hear about:

| Standard | Year | Highlights |
|----------|------|------------|
| K&R C    | 1978 | The original, from the Kernighan & Ritchie book |
| ANSI C / C89 / C90 | 1989/1990 | First international standard |
| C99      | 1999 | `//` comments, `inline`, variable-length arrays, `<stdbool.h>` |
| C11      | 2011 | Threads, atomics, `_Generic` |
| C17      | 2018 | Bug-fix release of C11 |
| C23      | 2024 | `nullptr`, `bool` keyword, attributes |

Everything in this course works on **C99 and newer**, which is what every modern compiler defaults to.

## Next step

Now that you know what C is and why it matters, let's install a compiler and run your first program.
