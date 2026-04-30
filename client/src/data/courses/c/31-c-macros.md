---
title: C Macros and Preprocessor
---

# C Macros and Preprocessor

Before the compiler ever sees your code, the **preprocessor** runs through it line by line, expanding directives that begin with `#`. The output is then handed to the compiler. Understanding what the preprocessor does (and doesn't) makes a huge amount of C suddenly clear.

## Common directives

| Directive | What it does |
|-----------|--------------|
| `#include` | Paste the contents of another file in here |
| `#define` | Define a macro |
| `#undef` | Undefine a macro |
| `#if` / `#ifdef` / `#ifndef` | Conditional compilation |
| `#else` / `#elif` / `#endif` | Branches and end of conditional |
| `#error` | Stop compilation with a custom error message |
| `#warning` | Print a warning (GCC/Clang extension, standard in C23) |
| `#pragma` | Implementation-specific instruction to the compiler |

Directives have **no semicolon** and (with rare exceptions) start at column 1.

## `#include`

Two forms:

```c
#include <stdio.h>      // search system include paths
#include "myheader.h"   // search current directory first, then system paths
```

System headers (`<...>`) are the standard library and OS headers. Your own headers (`"..."`) live next to your `.c` files.

## `#define` constants

```c
#define PI         3.14159
#define MAX_USERS  100
#define GREETING   "Hello"
```

The preprocessor textually replaces every occurrence after the definition. There's no type, no scope, no respect for strings or comments — just text.

Modern advice: prefer `const` or `enum` for typed values. Use `#define` for things you can't express otherwise (header guards, conditional compilation, function-like macros).

## Function-like macros

```c
#define SQUARE(x)  ((x) * (x))
#define MAX(a, b)  ((a) > (b) ? (a) : (b))

int s = SQUARE(5);            // ((5) * (5))     == 25
int m = MAX(3 + 1, 5);        // ((3 + 1) > (5) ? (3 + 1) : (5))
```

The parentheses are crucial. Without them:

```c
#define SQUARE(x) x * x
SQUARE(2 + 3);            // becomes 2 + 3 * 2 + 3 → 11, not 25
```

Always wrap each parameter and the entire body in parentheses.

⚠️ **Macros evaluate arguments multiple times.** This is dangerous with side effects:

```c
int n = 1;
int m = MAX(n++, 5);    // n is incremented TWICE!
```

For this reason, prefer **`static inline` functions** when possible:

```c
static inline int max_int(int a, int b) {
    return a > b ? a : b;
}
```

## Header guards

When two headers `#include` each other, you get duplicate definitions. Guard every header with:

```c
/* my_module.h */
#ifndef MY_MODULE_H
#define MY_MODULE_H

/* declarations here */

#endif /* MY_MODULE_H */
```

Or use the non-standard but universally-supported:

```c
#pragma once
```

## Conditional compilation

```c
#ifdef DEBUG
    fprintf(stderr, "[debug] x=%d\n", x);
#endif
```

Compile with `-DDEBUG` to enable. With:

```c
#ifndef NDEBUG
    /* extra checks */
#endif
```

(`NDEBUG` is the standard "release mode" macro that also disables `assert`.)

You can also test values:

```c
#if defined(_WIN32)
    #include <windows.h>
#elif defined(__linux__)
    #include <unistd.h>
#elif defined(__APPLE__)
    #include <unistd.h>
#else
    #error "Unsupported platform"
#endif
```

## Predefined macros

Every compiler defines a long list of useful macros:

| Macro | Meaning |
|-------|---------|
| `__FILE__` | Current source file name (string) |
| `__LINE__` | Current line number (integer) |
| `__func__` | Enclosing function name (C99) |
| `__DATE__` | Compile date as a string |
| `__TIME__` | Compile time as a string |
| `__STDC__` | `1` if conforming to standard C |
| `__STDC_VERSION__` | C standard version (e.g. `201112L` for C11) |

Common debugging trick:

```c
#define LOG(fmt, ...) \
    fprintf(stderr, "[%s:%d %s] " fmt "\n", \
            __FILE__, __LINE__, __func__, ##__VA_ARGS__)

LOG("processing %d items", n);
```

Output:

```
[main.c:42 process_batch] processing 100 items
```

(`##__VA_ARGS__` is a GCC/Clang extension that drops the leading comma when no variadic args are provided. C23 standardizes `__VA_OPT__` for the same purpose.)

## Stringification: `#`

`#param` in a macro turns the parameter into a string literal:

```c
#define DUMP(x) printf(#x " = %d\n", x)

int age = 30;
DUMP(age);    /* prints: age = 30 */
```

## Token pasting: `##`

`a##b` glues two tokens together at preprocessing time:

```c
#define MAKE_VAR(name, n) int name##n = 0
MAKE_VAR(score, 1);    /* int score1 = 0; */
MAKE_VAR(score, 2);    /* int score2 = 0; */
```

Useful for code generation, less so in everyday code.

## Multi-line macros

Use `\` at the end of each line:

```c
#define LOG_IF(cond, msg) \
    do { \
        if (cond) fprintf(stderr, "%s\n", msg); \
    } while (0)
```

The `do { ... } while (0)` wrapper makes the macro behave as a single statement — works in `if`/`else` without surprising parsing.

## When to write a macro

Use a macro when you need:

- **Conditional compilation** (`#ifdef`).
- **Code that depends on tokens** — like generating type-specific helpers.
- **Behavior that captures `__FILE__` / `__LINE__` at the call site.**

For everything else — even constants — prefer `const`, `enum`, and `static inline` functions. They are typed, scoped, and visible to the debugger.

## Putting it together

```c
#include <stdio.h>

#define LOG(fmt, ...) \
    fprintf(stderr, "[%s:%d] " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)

#define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))

#ifdef DEBUG
    #define DBG(x) printf("DEBUG: " #x " = %d\n", (x))
#else
    #define DBG(x) ((void)0)
#endif

int main(void) {
    int values[] = { 10, 20, 30, 40 };
    LOG("array length: %zu", ARRAY_LEN(values));

    int n = 7;
    DBG(n);          /* visible only when compiled with -DDEBUG */
    return 0;
}
```

Build with `gcc -Wall -DDEBUG file.c` and you'll see the debug print; without `-DDEBUG` it vanishes — zero runtime cost.
