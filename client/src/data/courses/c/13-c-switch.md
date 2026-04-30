---
title: C Switch
---

# C Switch

When you would otherwise write a long chain of `if ... else if ...` comparing the **same** variable against many constant values, a `switch` statement is cleaner.

## Basic syntax

```c
switch (expression) {
    case constant1:
        // ...
        break;
    case constant2:
        // ...
        break;
    default:
        // runs when no case matches
        break;
}
```

The `expression` must be an **integer-like** value (`int`, `char`, `enum`, etc.). Strings and floats are not allowed.

Each `case` constant must be a **compile-time constant** (a literal, a `#define`, or an `enum` value — *not* a regular `const int` variable).

## Example

```c
#include <stdio.h>

int main(void) {
    int day;

    printf("Day number (1-7): ");
    scanf("%d", &day);

    switch (day) {
        case 1: puts("Monday");    break;
        case 2: puts("Tuesday");   break;
        case 3: puts("Wednesday"); break;
        case 4: puts("Thursday");  break;
        case 5: puts("Friday");    break;
        case 6: puts("Saturday");  break;
        case 7: puts("Sunday");    break;
        default:
            puts("Not a valid day.");
            break;
    }
    return 0;
}
```

## `break` and fall-through

A `case` label is **only a jump target**. Without a `break`, execution **falls through** into the next case:

```c
int n = 1;

switch (n) {
    case 1:
        puts("one");
        // no break ↓
    case 2:
        puts("two");
        break;
    case 3:
        puts("three");
        break;
}
```

Output:

```
one
two
```

Sometimes fall-through is what you want — for grouping cases that share code:

```c
switch (ch) {
    case 'a':
    case 'e':
    case 'i':
    case 'o':
    case 'u':
        puts("vowel");
        break;
    default:
        puts("consonant");
        break;
}
```

If you intentionally fall through, leave a `// fall through` comment so reviewers know it's not a bug. Modern GCC has `__attribute__((fallthrough))` and C23 has `[[fallthrough]];`.

## `default`

`default` runs when no `case` matches. It can appear **anywhere** in the switch — but conventionally it goes last. Always include a `default`, even if it just logs an "unexpected" message — it makes intent explicit and catches new cases you forget to handle later.

## `switch` on `enum`

`enum`s are designed for this. Modern compilers will warn if you forget a case:

```c
enum Color { RED, GREEN, BLUE };

const char *name_of(enum Color c) {
    switch (c) {
        case RED:   return "red";
        case GREEN: return "green";
        case BLUE:  return "blue";
    }
    return "unknown";    // unreachable, but keeps -Wreturn-type happy
}
```

With `-Wswitch` (included in `-Wall`), GCC warns:
`enumeration value 'X' not handled in switch`. That's a great safety net.

## Why a `switch` can be faster

For a long chain of equal-constant comparisons, the compiler can turn a `switch` into a **jump table** — a single indirect jump rather than dozens of comparisons. For small switches you won't notice, but for large enums it can matter.

## When *not* to use `switch`

- **Ranges of values:** `switch` matches single constants, not `case 0..9:`. Use `if`/`else if`.
- **Floats / strings:** not allowed. Use `if`/`else if` or a lookup table.
- **Two or three cases:** `if`/`else` is often shorter and clearer.

## Putting it together

```c
#include <stdio.h>

int main(void) {
    char op;
    double a, b;

    printf("Calc: a op b (e.g. 4 + 2): ");
    if (scanf("%lf %c %lf", &a, &op, &b) != 3) {
        fprintf(stderr, "Bad input.\n");
        return 1;
    }

    switch (op) {
        case '+': printf("= %g\n", a + b); break;
        case '-': printf("= %g\n", a - b); break;
        case '*': printf("= %g\n", a * b); break;
        case '/':
            if (b == 0.0) {
                puts("Division by zero!");
            } else {
                printf("= %g\n", a / b);
            }
            break;
        default:
            printf("Unknown operator '%c'\n", op);
            break;
    }
    return 0;
}
```
