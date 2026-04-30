---
title: C If...Else
---

# C If...Else

The `if` statement runs a block of code only when a condition is true.

## Basic `if`

```c
if (condition) {
    // runs only when condition is non-zero
}
```

Example:

```c
int score = 85;

if (score >= 50) {
    printf("You passed!\n");
}
```

The braces are optional when the body is a single statement, but **always use them**. Brace-less `if`s are responsible for some of the most famous security bugs in history (look up "Apple goto fail").

```c
if (score >= 50)
    printf("ok\n");           // works
    printf("oops\n");         // ALWAYS runs — not part of the if!
```

## `if ... else`

Run different code when the condition is false:

```c
int age = 17;

if (age >= 18) {
    printf("Adult\n");
} else {
    printf("Minor\n");
}
```

## `if ... else if ... else`

Chain conditions for multi-way branches:

```c
int grade = 73;

if (grade >= 90) {
    printf("A\n");
} else if (grade >= 80) {
    printf("B\n");
} else if (grade >= 70) {
    printf("C\n");
} else if (grade >= 60) {
    printf("D\n");
} else {
    printf("F\n");
}
```

Conditions are evaluated top to bottom; the first true one wins, the rest are skipped.

## Nested `if`

`if`s can be nested inside other `if`s. Indent properly so the structure is obvious.

```c
if (logged_in) {
    if (is_admin) {
        printf("Welcome, boss\n");
    } else {
        printf("Welcome\n");
    }
} else {
    printf("Please log in\n");
}
```

Many nested `if`s are often a sign you should refactor — extract a helper function or use early returns.

## The condition

Inside `if (...)` you can put **any** expression. A non-zero value is "true":

```c
if (count)              { ... }   // true when count != 0
if (ptr)                { ... }   // true when ptr != NULL
if (str[0])             { ... }   // true when string is non-empty
if (flags & MASK)       { ... }   // true when any of MASK's bits are set
if (strcmp(a, b) == 0)  { ... }   // strings are equal
```

Many idiomatic checks rely on the truthy/falsy convention.

## Conditional (ternary) expression

For simple "value-or-other-value" decisions, the ternary `?:` is a one-liner:

```c
int max = (a > b) ? a : b;
puts(score >= 50 ? "Pass" : "Fail");
```

Don't nest ternaries more than one level deep — write a real `if` instead.

## Common mistakes

1. **`=` instead of `==`:**

   ```c
   if (x = 5) { ... }   // ❌ assigns 5 to x, condition is always true
   if (x == 5) { ... }  // ✅
   ```

   Some programmers write `if (5 == x)` instead, so swapping makes the bad version a compile error. With `-Wall` GCC warns either way.

2. **Misplaced semicolon:**

   ```c
   if (count > 0); {       // ❌ semicolon ends the if, the block always runs
       process();
   }
   ```

3. **Comparing floats with `==`:** see the operators lesson — use a tolerance.

4. **Comparing strings with `==`:** use `strcmp(a, b) == 0`.

## A complete example

```c
#include <stdio.h>

int main(void) {
    int hour;

    printf("Enter the hour (0-23): ");
    if (scanf("%d", &hour) != 1) {
        fprintf(stderr, "Invalid input.\n");
        return 1;
    }

    if (hour < 0 || hour > 23) {
        printf("That isn't a valid hour.\n");
    } else if (hour < 12) {
        printf("Good morning!\n");
    } else if (hour < 18) {
        printf("Good afternoon!\n");
    } else {
        printf("Good evening!\n");
    }
    return 0;
}
```

Try it with different inputs:

```
Enter the hour (0-23): 9
Good morning!
```

```
Enter the hour (0-23): 14
Good afternoon!
```
