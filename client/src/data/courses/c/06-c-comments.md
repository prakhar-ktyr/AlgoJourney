---
title: C Comments
---

# C Comments

Comments are notes for humans. The compiler ignores them completely. Use them to explain *why* code does something — the code itself already says *what*.

## Single-line comments

Anything from `//` to the end of the line is a comment.

```c
// This entire line is a comment.
int speed = 60;   // The trailing part of this line is too.
```

`//` was officially added in **C99**. Every modern compiler supports it.

## Multi-line comments

Anything between `/*` and the next `*/` is a comment, even across many lines.

```c
/*
 * Convert miles per hour to kilometers per hour.
 * Formula: km/h = mph * 1.609
 */
double mph_to_kmh(double mph) {
    return mph * 1.609;
}
```

Multi-line comments **cannot be nested**:

```c
/* outer /* inner */ still outer */   // ❌ compile error
```

The first `*/` closes the comment, leaving `still outer */` as broken code.

## Commenting out code

A handy debugging trick: temporarily disable a block of code by wrapping it.

```c
// printf("about to crash\n");
/*
for (int i = 0; i < 10; i++) {
    do_something(i);
}
*/
```

Most editors have a keyboard shortcut for this (in VS Code: **Ctrl+/**).

## Documentation comments

There is no built-in "doc comment" syntax in C, but a popular convention (used by Doxygen) is to start a multi-line comment with an extra `*`:

```c
/**
 * Compute the factorial of a non-negative integer.
 *
 * @param n The number to compute n! for. Must be >= 0.
 * @return  n! (n factorial), or 1 if n == 0.
 */
unsigned long factorial(int n);
```

Tools like Doxygen can scan a codebase and turn comments like this into HTML documentation.

## Best practices

1. **Explain *why*, not *what*.** The code already shows what it does. A comment like `// add 1 to i` is noise. `// skip the header byte before the payload` is gold.
2. **Keep comments truthful.** A wrong comment is worse than no comment. Update or delete a comment whenever you change the code it describes.
3. **Don't over-comment trivial code.** `int age = 30; // age` is annoying.
4. **Use comments to flag work in progress** — `// TODO: handle empty list` or `// FIXME: leaks memory on error path` are searchable across a project.
5. **Prefer good names over comments.** A function called `compute_total_with_tax(items, rate)` doesn't need a comment explaining what it does.

## Try it

```c
#include <stdio.h>

int main(void) {
    /*
     * This program demonstrates that comments
     * have absolutely no effect on output.
     */
    printf("Hello\n");   // even this trailing one is ignored
    // printf("This line never runs.\n");
    return 0;
}
```

Output:

```
Hello
```
