---
title: C Syntax
---

# C Syntax

Let's revisit the "Hello, World" program, this time line by line.

```c
#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}
```

## Line 1 — `#include <stdio.h>`

Lines that start with `#` are **preprocessor directives**. They are *not* C statements; they are instructions to the preprocessor that runs before the compiler.

`#include <stdio.h>` tells the preprocessor: *find the file `stdio.h` and paste its contents here*. `stdio.h` is the **standard input/output header**. It declares the `printf` function (and `scanf`, `puts`, `fopen`, …). Without including it, the compiler has no idea what `printf` is.

The angle brackets `< >` mean "look in the system include path." For your own header files you would write `#include "myheader.h"` with double quotes.

## Line 3 — `int main(void)`

Every C program must have a function called **`main`**. That is the entry point — the operating system calls it when your program starts.

Breaking down the declaration:

- `int` — the **return type**. `main` returns an integer to the operating system. By convention, `0` means "success" and any non-zero value means "failure".
- `main` — the function's name.
- `(void)` — the **parameter list**. `void` says the function takes no parameters. (You'll later see `int main(int argc, char *argv[])`, which lets you read command-line arguments.)
- `{` — the opening brace begins the function body.

## Line 4 — `printf("Hello, World!\n");`

This is a **statement** — a single instruction that ends with a semicolon `;`. Forgetting the semicolon is the #1 beginner compile error.

`printf` is a function from `stdio.h`. It prints formatted text to standard output (your terminal). The double-quoted text is a **string literal**. The `\n` inside is an **escape sequence** that means "newline" — without it, the next thing printed would appear on the same line.

## Line 5 — `return 0;`

`return` ends the function and sends its value back to the caller. Because `main` returns an integer, returning `0` tells the OS the program completed successfully. You can verify this in a terminal after running:

```bash
./hello
echo $?      # prints 0
```

## Line 6 — `}`

The closing brace ends the function body.

## General syntax rules

### Statements end in `;`

Every statement is terminated with a semicolon. Whitespace and newlines are *almost* completely ignored — these two are equivalent:

```c
int x = 1; int y = 2; printf("%d %d\n", x, y);
```

```c
int x = 1;
int y = 2;
printf("%d %d\n", x, y);
```

The second is far more readable. **Use the second style.**

### Blocks use curly braces

Anywhere a single statement is expected, you can use a `{ ... }` block of multiple statements. Functions, `if`, `while`, and `for` all use blocks:

```c
if (x > 0) {
    printf("positive\n");
    x = 0;
}
```

### C is case-sensitive

`Main`, `main`, and `MAIN` are three different identifiers. By convention, function and variable names are `lowercase_with_underscores`, types are `CamelCase` or `snake_case_t`, and macros are `UPPER_CASE`.

### Comments

```c
// Single-line comment (C99 and later)

/* Multi-line
   comment, can span
   any number of lines. */
```

You'll see comments used everywhere in the rest of this course.

### Indentation

The compiler ignores indentation — but humans read it. Use **4 spaces** (or a single tab) per level of nesting and your future self will thank you.

## A slightly bigger example

```c
#include <stdio.h>

int main(void) {
    int a = 10;
    int b = 32;
    int sum = a + b;

    printf("%d + %d = %d\n", a, b, sum);
    return 0;
}
```

Compile and run:

```
10 + 32 = 42
```

That's it for syntax overview. Next we'll dive deep into `printf` and how to control output.
