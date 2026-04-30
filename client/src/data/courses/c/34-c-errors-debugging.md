---
title: C Errors and Debugging
---

# C Errors and Debugging

C gives you no exceptions, no stack traces, and no garbage collector. When things go wrong they go wrong silently — until they crash spectacularly. The good news: a small set of habits and tools turn debugging C from agony into a routine task.

## Compile-time errors

The compiler is your first and best debugger. Always compile with warnings enabled:

```bash
gcc -Wall -Wextra -Wpedantic -std=c11 -g main.c -o main
```

A real warning to take seriously:

```
main.c: In function 'main':
main.c:8:12: warning: 'x' is used uninitialized [-Wuninitialized]
```

Treat warnings as errors during development. With `-Werror` they actually become errors.

Other useful flags:

| Flag | Why |
|------|-----|
| `-Wshadow` | warn when an inner variable hides an outer one |
| `-Wconversion` | warn on implicit narrowing |
| `-Wstrict-prototypes` | flag old-style declarations |
| `-fsanitize=address,undefined` | runtime checks for memory & UB |
| `-g` | embed debug info for gdb / lldb |
| `-O0` | disable optimization (clearer single-stepping) |

## Runtime errors — return codes

C has no exceptions. Functions report failure through their return value:

| Convention | Used by |
|------------|---------|
| Return `NULL` on failure | `malloc`, `fopen`, `fgets`, … |
| Return a negative number | many POSIX functions |
| Return `0` for success, non-zero for an error code | `pthread_create`, `strerror_r` |

Always check:

```c
FILE *fp = fopen(path, "r");
if (fp == NULL) {
    perror(path);          // path: No such file or directory
    return 1;
}
```

## `errno`, `perror`, `strerror`

The standard library and OS set the global `errno` variable when an operation fails:

```c
#include <errno.h>
#include <string.h>
#include <stdio.h>

if (open_something(path) == NULL) {
    fprintf(stderr, "open failed: %s\n", strerror(errno));
}
```

`perror("label")` is shorthand for `fprintf(stderr, "label: %s\n", strerror(errno))`.

`errno` is reset only when a function reports failure — don't trust its value after a successful call.

## `assert` — sanity checks

```c
#include <assert.h>

int factorial(int n) {
    assert(n >= 0 && "factorial expects a non-negative input");
    /* ... */
}
```

If the condition is false, `assert` prints the file/line/expression and calls `abort()`. Compile with `-DNDEBUG` to disable all assertions for release builds (so they cost nothing at runtime).

Assertions catch programmer bugs (precondition violations). They are **not** for handling user errors — never `assert(fp != NULL)` on a file the user provided.

## `abort` and `exit`

- `exit(code)` — clean shutdown: flushes streams, calls `atexit` handlers, closes files. Returns `code` to the OS.
- `abort()` — immediate, unclean. Used by `assert`. Generates a core dump if enabled.
- `_exit(code)` (POSIX) — exits without cleanup; useful in `fork`'d children.

## A debugging session with `gdb`

Build with debug info and no optimization:

```bash
gcc -g -O0 -Wall main.c -o main
gdb ./main
```

Inside gdb:

```
(gdb) break main         # set breakpoint at main
(gdb) run arg1 arg2      # start the program with args
(gdb) next               # step over
(gdb) step               # step into
(gdb) print x            # show value of x
(gdb) print arr[3]
(gdb) print *p
(gdb) backtrace          # show call stack on a crash
(gdb) frame 2            # switch to stack frame 2
(gdb) continue           # resume
(gdb) quit
```

If your program crashes with a SIGSEGV, `gdb ./main core` (or `gdb --args ./main args` and run inside) gives you the line number and call stack. Few experiences in C are as satisfying.

## AddressSanitizer (ASan)

A modern miracle. Recompile with:

```bash
gcc -fsanitize=address,undefined -g main.c -o main
./main
```

ASan catches:

- buffer overflows (read & write)
- use-after-free
- double-free
- memory leaks (with `ASAN_OPTIONS=detect_leaks=1`)
- uninitialized reads (UBSan + MSan)

Output is human-readable and tells you exactly which line did what. Run your test suite under ASan in CI — it pays for itself immediately.

## Valgrind

Older but still excellent — works on already-built binaries (no recompile required):

```bash
valgrind --leak-check=full --track-origins=yes ./main
```

Valgrind is slower than ASan and doesn't catch quite as much, but it doesn't need a sanitizer-enabled build.

## Print-style debugging

When tools fail you, fall back on the timeless `printf`:

```c
fprintf(stderr, "[%s:%d] x = %d, p = %p\n", __FILE__, __LINE__, x, (void*)p);
```

Or the macro from the **Macros** lesson:

```c
#define LOG(fmt, ...) \
    fprintf(stderr, "[%s:%d %s] " fmt "\n", \
            __FILE__, __LINE__, __func__, ##__VA_ARGS__)
```

Always print to `stderr` — it's unbuffered and won't be lost when the program crashes.

## Common runtime mistakes — and what causes them

| Symptom | Likely cause |
|---------|--------------|
| `Segmentation fault` | dereferenced NULL, freed pointer, or out-of-bounds |
| Random different output every run | uninitialized variable |
| Crash inside `free` or `malloc` | heap corruption — earlier overflow scribbled metadata |
| Output doesn't appear before crash | stdout is buffered; use `\n` or `fflush` or `stderr` |
| Mysterious values that change as you add `printf`s | undefined behavior / aliasing problem |

When in doubt: rebuild with `-Wall -Wextra -fsanitize=address,undefined -g -O0` and run again. The cause usually surfaces immediately.

## A defensive style checklist

1. Initialize every variable.
2. Check every return value (`malloc`, `fopen`, `scanf`, …).
3. Use `const` everywhere a value shouldn't change.
4. Use `size_t` for sizes, signed types for things that can be negative.
5. Free everything you allocate; set the pointer to `NULL` after.
6. Bound every string operation (`snprintf`, `fgets`, `strncpy` + manual `'\0'`).
7. Treat compiler warnings as bugs.
8. Run tests under ASan before shipping.

C will never be "safe" the way Rust or Java are. But disciplined C is reliable C — and disciplined C engineers are the ones who built the operating systems you use every day.

## You did it

That's the end of this introductory C course. You now have:

- A working C toolchain.
- Every fundamental construct of the language.
- The pointer & memory mental model that makes systems programming possible.
- A foundation for `<stdio.h>`, `<string.h>`, `<stdlib.h>`, `<math.h>`, and friends.
- Tools and habits to debug what goes wrong.

From here, two great next steps:

1. **Build something.** A todo CLI. A tiny HTTP server. A toy interpreter. Real projects are where the lessons stick.
2. **Read great C.** The Linux kernel, SQLite, redis, lua, and the original K&R book are all rewarding reads. Picking apart how seasoned C programmers structure their code is the fastest way to grow.

Happy hacking.
