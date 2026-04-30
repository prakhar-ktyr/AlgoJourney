---
title: C Functions
---

# C Functions

A **function** is a named, reusable block of code. You've already used functions (`printf`, `main`); now let's write our own.

## Defining a function

```c
return_type name(parameter_list) {
    /* body */
}
```

Example:

```c
int square(int n) {
    return n * n;
}
```

- `int` — the return type. Use `void` for functions that don't return anything.
- `square` — the function name. Same identifier rules as variables.
- `(int n)` — the parameter list. Each parameter is a `type name`.
- `return n * n;` — the value sent back to the caller.

## Calling a function

```c
int s = square(5);     // s == 25
printf("%d\n", square(7));   // prints 49
```

Arguments are evaluated, then **copied** into the parameters (pass-by-value, see Pointers).

## Functions with no parameters

Use `void` to mean "takes no arguments":

```c
void greet(void) {
    puts("Hello!");
}

greet();
```

⚠️ `void greet()` (empty parens) means "unspecified parameters" in classic C, **not** "no parameters." Always write `void`.

## Functions returning nothing

Use `void`. There's no value to return:

```c
void log_warning(const char *msg) {
    fprintf(stderr, "WARNING: %s\n", msg);
}

log_warning("disk almost full");
```

A bare `return;` inside a `void` function exits early.

## Function declarations (prototypes)

C reads source code top-to-bottom. If you call `square` from `main` but `square` is defined *below* `main`, the compiler doesn't know about it yet:

```c
int main(void) {
    printf("%d\n", square(5));    // ❌ compiler doesn't know square yet
    return 0;
}

int square(int n) { return n * n; }
```

Two fixes — define above, or write a **prototype** at the top:

```c
int square(int n);              // prototype — promises the function exists

int main(void) {
    printf("%d\n", square(5));   // ✅
    return 0;
}

int square(int n) { return n * n; }
```

In multi-file projects, prototypes go in **header files** (`.h`) so other source files can call your functions.

## A complete multi-function program

```c
#include <stdio.h>

int  add(int a, int b);
int  multiply(int a, int b);
void print_result(const char *label, int value);

int main(void) {
    int sum  = add(3, 4);
    int prod = multiply(3, 4);
    print_result("sum",  sum);
    print_result("prod", prod);
    return 0;
}

int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}

void print_result(const char *label, int value) {
    printf("%s = %d\n", label, value);
}
```

Output:

```
sum = 7
prod = 12
```

## Why functions?

1. **Reuse.** Write once, call many times.
2. **Naming.** A well-named function says *what* the code does so readers don't have to figure it out from the *how*.
3. **Testing.** Small functions are easy to test in isolation.
4. **Decomposition.** A 200-line `main` becomes 10 functions of 20 lines each — far easier to reason about.

A common rule of thumb: if a function doesn't fit on your screen, it's doing too much.

## Recursion

A function can call itself:

```c
unsigned long factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

This is covered in depth in the **Recursion** lesson.

## `static` functions — file-private

Putting `static` before a function makes it **invisible** outside the current `.c` file. Use it for helpers you don't want other files to call:

```c
static int helper(int x) { ... }    // private to this file
```

Without `static`, every function is "external" and can be called from any file that has its prototype.

## `inline` functions — a hint to the compiler

```c
inline int square(int n) { return n * n; }
```

`inline` tells the compiler "consider expanding this in place rather than emitting a real function call." Modern compilers inline aggressively on their own; `inline` is mostly useful when defining short helpers in headers.

## Standard library functions

Don't reinvent the wheel — the C standard library has hundreds of functions. A tiny sample:

| Function | Header | Purpose |
|----------|--------|---------|
| `printf`, `scanf` | `<stdio.h>` | I/O |
| `strlen`, `strcpy`, `strcmp` | `<string.h>` | strings |
| `malloc`, `free`, `exit` | `<stdlib.h>` | memory, process |
| `sqrt`, `sin`, `pow` | `<math.h>` | math |
| `isdigit`, `toupper` | `<ctype.h>` | character classification |
| `time`, `clock` | `<time.h>` | time |
| `qsort`, `bsearch` | `<stdlib.h>` | searching/sorting |

Reach for the library before writing your own. It's tested, fast, and portable.

## Putting it together — temperature converter

```c
#include <stdio.h>

double f_to_c(double f) { return (f - 32.0) * 5.0 / 9.0; }
double c_to_f(double c) { return c * 9.0 / 5.0 + 32.0; }

int main(void) {
    printf("%.1f F = %.1f C\n",  98.6, f_to_c(98.6));
    printf("%.1f C = %.1f F\n",  37.0, c_to_f(37.0));
    printf("%.1f F = %.1f C\n", 212.0, f_to_c(212.0));
    return 0;
}
```

Output:

```
98.6 F = 37.0 C
37.0 C = 98.6 F
212.0 F = 100.0 C
```
