---
title: C Constants
---

# C Constants

A **constant** is a value that cannot change while your program runs. C gives you two ways to express constants: the `const` keyword and the `#define` preprocessor directive. They look similar but work very differently.

## `const` variables

Add `const` before the type to make the variable read-only:

```c
const int MAX_LIVES = 3;
const double PI = 3.14159;

MAX_LIVES = 5;     // ❌ error: assignment of read-only variable
```

`const` variables are **real variables**: they have a type, an address, and they obey scope rules. The compiler will refuse to compile any code that tries to modify them.

### Why use `const`?

1. **Documentation.** It tells anyone reading the code (including future you) that this value won't change.
2. **Safety.** The compiler catches accidental modifications.
3. **Optimization hints.** The compiler can sometimes generate better code.

### `const` with pointers

`const` and pointers interact in a way that confuses everyone at first. There are three combinations:

```c
const int *p;          // pointer to a const int — *p cannot be modified
int * const p;         // const pointer to an int — p itself cannot change
const int * const p;   // const pointer to a const int — neither can change
```

Read right-to-left. We'll revisit this in the pointers lesson.

## `#define` — preprocessor constants

`#define` is a *preprocessor* directive. The preprocessor performs a textual find-and-replace **before** the code is compiled.

```c
#define PI         3.14159
#define MAX_LIVES  3
#define GREETING   "Hello, World!"

printf("%f\n", PI);              // becomes printf("%f\n", 3.14159);
printf("%s\n", GREETING);        // becomes printf("%s\n", "Hello, World!");
```

There's no semicolon after a `#define` — it's not a C statement.

### `#define` vs `const`

| | `const` | `#define` |
|---|---------|-----------|
| Has a type? | Yes | No (just text) |
| Has an address? | Yes | No |
| Visible in debugger? | Yes (as a variable) | No (replaced before compile) |
| Type-checked? | Yes | No |
| Scope? | Block / file scope | From the `#define` to end of file |

**Modern advice:** prefer `const` (and `enum`, see below) for **values**. Use `#define` for things that aren't values — header guards, conditional compilation, and **macros that take arguments**:

```c
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int big = MAX(3, 7);    // becomes ((3) > (7) ? (3) : (7))
```

The parentheses around each parameter and the whole expression are **essential** — without them, operator precedence will bite you. (`MAX(2 + 3, 4)` without parens could become `(2 + 3 > 4 ? 2 + 3 : 4)` which is fine, but `MAX(a, b) * 2` without outer parens becomes `(a > b ? a : b) * 2` only with them.)

## `enum` constants

For a group of related integer constants, an `enum` is cleaner than many `#define`s:

```c
enum Direction { NORTH, EAST, SOUTH, WEST };

enum Direction d = EAST;
```

`NORTH` is `0`, `EAST` is `1`, `SOUTH` is `2`, `WEST` is `3`. You can override:

```c
enum Status {
    OK         = 200,
    NOT_FOUND  = 404,
    SERVER_ERR = 500
};
```

`enum` constants are full-fledged compile-time integer constants — they can be used in `switch` cases, array sizes, etc., where regular `const int` cannot.

## String constants

A double-quoted string in your source code is a **string literal** — it lives in read-only memory.

```c
char *name = "Ada";    // ✅ pointer to a read-only string literal
name[0] = 'X';          // ❌ undefined behavior — may crash

char copy[] = "Ada";    // ✅ copy into a writable array
copy[0] = 'X';          // ✅ fine — modifies the local array
```

A safer modern style is to use `const char *` for pointers to string literals:

```c
const char *name = "Ada";
name[0] = 'X';        // ❌ caught at compile time now
```

## Numeric literal suffixes

Without a suffix, the compiler infers the type. Use suffixes to be explicit:

| Suffix | Meaning | Example |
|--------|---------|---------|
| `U` / `u` | `unsigned` | `42u` |
| `L` / `l` | `long` | `42L` |
| `LL` / `ll` | `long long` | `42LL` |
| `UL` / `ULL` | combinations | `42UL`, `42ULL` |
| `F` / `f` | `float` | `3.14f` |
| `L` / `l` | `long double` (after a float) | `3.14L` |
| `0x` *prefix* | hexadecimal | `0xFF` (255) |
| `0` *prefix* | octal | `0755` (493) |
| `0b` *prefix* | binary (GCC extension, C23 standard) | `0b1010` (10) |
| `'` *separator* | digit grouping (C23) | `1'000'000` |

```c
unsigned long pages = 4096UL;
double        eps   = 1e-9;
int           mask  = 0xFF00;
```

## Putting it all together

```c
#include <stdio.h>

#define BUFFER_SIZE 256

const double EARTH_GRAVITY = 9.81;

enum Day { MON, TUE, WED, THU, FRI, SAT, SUN };

int main(void) {
    char buffer[BUFFER_SIZE];        // ✅ enum & #define both usable here
    enum Day today = WED;

    printf("Buffer is %d bytes\n", BUFFER_SIZE);
    printf("g = %.2f m/s^2\n", EARTH_GRAVITY);
    printf("Today is day #%d of the week\n", today);
    return 0;
}
```

Constants make code easier to read and harder to break. Use them generously.
