---
title: Python Introduction
---

# Python Introduction

## What is Python?

Python is a **high-level, interpreted, dynamically-typed, general-purpose programming language**. It was created by **Guido van Rossum** in the late 1980s and first released in 1991. The name has nothing to do with snakes — Guido was a fan of _Monty Python's Flying Circus_.

Python's design philosophy is summed up in **The Zen of Python**, a short poem you can read at any time by typing `import this` in the interpreter:

> Beautiful is better than ugly. Explicit is better than implicit. Simple is better than complex. Readability counts.

That focus on readability is why Python is everywhere today.

## Where Python is used

- **Data science & analytics** — pandas, NumPy, Jupyter notebooks.
- **Machine learning & AI** — PyTorch, TensorFlow, scikit-learn, Hugging Face.
- **Web backends** — Django, Flask, FastAPI (Instagram, Pinterest, Reddit's old stack).
- **Automation & scripting** — system administration, build pipelines, scraping.
- **Scientific computing** — astronomy, biology, physics simulations.
- **Education** — the default first language at most universities.
- **DevOps tooling** — Ansible, SaltStack, OpenStack.
- **Game prototyping & desktop apps** — pygame, Tkinter, PyQt.

## Why learn Python?

1. **Readable.** Code looks like pseudocode. You can teach it to non-programmers.
2. **Batteries included.** The standard library covers HTTP, JSON, CSV, threading, sqlite, and dozens more — no `npm install` required.
3. **Huge ecosystem.** PyPI hosts over 500,000 packages. Whatever you want to do, someone has packaged it.
4. **Beginner-to-expert path.** You can write a one-line script today and a distributed ML system next year — same language, same tooling.
5. **Job market.** Python consistently ranks #1 or #2 on every developer survey (TIOBE, Stack Overflow, GitHub).

## What Python is _not_

Python's strengths come with trade-offs you should know about up front:

- **Not the fastest language.** Pure Python is 10–100× slower than C for CPU-bound work. Libraries like NumPy work around this by calling C under the hood.
- **Dynamically typed.** Type errors happen at runtime, not compile time. We'll cover **type hints** later, which restore much of the safety.
- **Whitespace-sensitive.** Indentation isn't decoration — it defines blocks. New programmers love this; some veterans hate it.
- **The GIL.** The reference interpreter (CPython) has a _Global Interpreter Lock_ that limits true CPU parallelism in threads. For parallel CPU work you use processes or `asyncio`.

## Python 2 vs Python 3

You may stumble on old tutorials that mention `print "hello"` (no parentheses) or `xrange`. That's **Python 2**, which reached end-of-life on January 1, 2020. **Always use Python 3.** This course assumes Python 3.10 or newer; everything works identically on 3.11, 3.12, and 3.13.

## Versions of Python you may hear about

| Version | Year | Highlights                                            |
| ------- | ---- | ----------------------------------------------------- | ------------------------------------- |
| 3.6     | 2016 | f-strings, type hints standardized                    |
| 3.8     | 2019 | walrus operator `:=`, positional-only params          |
| 3.9     | 2020 | dict union `                                          | `, built-in generic types `list[int]` |
| 3.10    | 2021 | structural pattern matching (`match`/`case`)          |
| 3.11    | 2022 | 10–60 % faster, much better tracebacks                |
| 3.12    | 2023 | per-interpreter GIL groundwork, f-string improvements |
| 3.13    | 2024 | optional free-threaded build, JIT preview             |

## Implementations

The "Python" you download from python.org is **CPython** — the reference implementation, written in C. There are others:

- **PyPy** — a just-in-time-compiled Python; often 4–10× faster for pure Python code.
- **MicroPython** — Python for microcontrollers (a few KB of RAM).
- **Jython** — Python on the JVM.
- **IronPython** — Python on .NET.

We'll use CPython for the entire course.

## Next step

Now that you know what Python is and why it matters, let's install it and run your first program.
