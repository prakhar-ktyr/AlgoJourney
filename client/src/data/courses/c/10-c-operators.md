---
title: C Operators
---

# C Operators

Operators perform computations and comparisons on values. C has more operators than most languages — let's go through them by category.

## Arithmetic operators

| Operator | Meaning | Example | Result |
|----------|---------|---------|--------|
| `+` | addition | `7 + 2` | `9` |
| `-` | subtraction / negation | `7 - 2` | `5` |
| `*` | multiplication | `7 * 2` | `14` |
| `/` | division | `7 / 2` | `3` (int!) or `3.5` (float) |
| `%` | modulo (remainder) | `7 % 2` | `1` |

⚠️ **Integer division truncates toward zero.** `7 / 2` is `3`, not `3.5`. To get a fractional result, at least one operand must be a floating-point type:

```c
int a = 7, b = 2;
double r1 = a / b;            // 3.0  ❌ surprise
double r2 = (double)a / b;    // 3.5  ✅
double r3 = a / (double)b;    // 3.5  ✅
```

The `%` operator only works on integer types. For floating-point remainder, use `fmod` from `<math.h>`:

```c
#include <math.h>
double r = fmod(7.5, 2.0);   // 1.5
```

## Assignment operators

`=` assigns the right-hand value to the left-hand variable.

```c
int x = 10;
x = 20;        // x is now 20
```

C provides shortcut **compound assignments** for every arithmetic and bitwise operator:

| Operator | Same as |
|----------|---------|
| `x += 5`  | `x = x + 5` |
| `x -= 5`  | `x = x - 5` |
| `x *= 2`  | `x = x * 2` |
| `x /= 2`  | `x = x / 2` |
| `x %= 3`  | `x = x % 3` |
| `x &= m`  | `x = x & m` |
| `x \|= m` | `x = x \| m` |
| `x ^= m`  | `x = x ^ m` |
| `x <<= n` | `x = x << n` |
| `x >>= n` | `x = x >> n` |

## Increment & decrement

```c
int i = 5;
i++;     // i is 6  (post-increment)
++i;     // i is 7  (pre-increment)
i--;     // i is 6
--i;     // i is 5
```

Pre vs. post matters when the expression is used as a value:

```c
int a = 5;
int b = a++;      // b is 5 (old a), then a becomes 6

int c = 5;
int d = ++c;      // c becomes 6, then d is 6
```

⚠️ **Don't modify the same variable twice in one expression** — it's undefined behavior:

```c
int i = 1;
int x = i++ + i++;     // ❌ undefined
a[i] = i++;            // ❌ undefined
```

## Comparison (relational) operators

| Operator | Meaning |
|----------|---------|
| `==` | equal |
| `!=` | not equal |
| `<`  | less than |
| `>`  | greater than |
| `<=` | less than or equal |
| `>=` | greater than or equal |

Each returns `1` (true) or `0` (false) — they are integer expressions.

```c
int age = 18;
int can_vote = (age >= 18);   // can_vote == 1
```

⚠️ **Never compare strings with `==`.** That compares pointers, not contents. Use `strcmp` from `<string.h>`:

```c
if (strcmp(name, "admin") == 0) { ... }  // strings equal when strcmp returns 0
```

⚠️ **Never compare floats with `==`.** Compare the absolute difference:

```c
#include <math.h>
if (fabs(a - b) < 1e-9) { ... }
```

## Logical operators

| Operator | Meaning |
|----------|---------|
| `&&` | logical AND |
| `\|\|` | logical OR |
| `!`  | logical NOT |

In C, **anything non-zero is true; zero is false** (no separate boolean type required, although `<stdbool.h>` provides one).

```c
if (x > 0 && x < 100) { ... }
if (name == NULL || name[0] == '\0') { ... }
if (!ready) { ... }
```

`&&` and `||` are **short-circuit** — the right side is only evaluated if needed. This lets you write safety checks like:

```c
if (p != NULL && p->value > 0) { ... }   // safe: p->value isn't touched if p is NULL
```

## Bitwise operators

These work on the individual bits of integer values. Covered in depth in the **Bitwise Operators** lesson, but the syntax:

| Operator | Meaning |
|----------|---------|
| `&`  | bitwise AND |
| `\|` | bitwise OR |
| `^`  | bitwise XOR |
| `~`  | bitwise NOT (one's complement) |
| `<<` | left shift |
| `>>` | right shift |

```c
unsigned int flags = 0;
flags |= 0x01;      // turn on bit 0
flags |= 0x04;      // turn on bit 2
if (flags & 0x04) { ... }   // is bit 2 on?
```

## The conditional (ternary) operator

The only operator that takes three operands:

```
condition ? value_if_true : value_if_false
```

Useful for short, in-line decisions:

```c
int max = (a > b) ? a : b;
puts(score >= 50 ? "Pass" : "Fail");
```

Don't nest more than one level — chained ternaries become unreadable. Use `if`/`else` instead.

## `sizeof`

Returns the size in bytes of a type or value, evaluated at compile time:

```c
printf("%zu\n", sizeof(int));         // 4 on most platforms
printf("%zu\n", sizeof(double));      // 8

int arr[10];
printf("%zu\n", sizeof(arr) / sizeof(arr[0]));   // 10 — array length trick
```

## The comma operator

A comma separates two expressions; both are evaluated, and the value of the whole expression is the **right** one:

```c
int a = (printf("step 1\n"), 42);   // prints "step 1", a == 42
```

You'll see it most often inside `for` loops:

```c
for (int i = 0, j = 10; i < j; i++, j--) { ... }
```

## Operator precedence (cheat sheet)

When in doubt, **add parentheses**. The ones you should memorize:

1. `()`, `[]`, `->`, `.`, postfix `++` `--`
2. unary `!`, `~`, `+`, `-`, prefix `++` `--`, `*`, `&`, `(type)`, `sizeof`
3. `*`, `/`, `%`
4. `+`, `-`
5. `<<`, `>>`
6. `<`, `<=`, `>`, `>=`
7. `==`, `!=`
8. `&`
9. `^`
10. `|`
11. `&&`
12. `||`
13. `?:`
14. `=`, `+=`, `-=`, …
15. `,`

A famous gotcha: `&` and `|` have **lower** precedence than `==` and `!=`. So `if (x & 1 == 0)` parses as `if (x & (1 == 0))`, which is `if (x & 0)`, which is always false. Write `if ((x & 1) == 0)`.

## Try it

```c
#include <stdio.h>

int main(void) {
    int a = 17, b = 5;
    printf("a + b = %d\n", a + b);
    printf("a - b = %d\n", a - b);
    printf("a * b = %d\n", a * b);
    printf("a / b = %d  (integer)\n", a / b);
    printf("a %% b = %d  (remainder)\n", a % b);
    printf("a / b = %.2f  (float)\n", (double)a / b);

    int n = 4;
    n += 6;
    printf("n after +=6 : %d\n", n);
    printf("max(a,b)    : %d\n", a > b ? a : b);
    return 0;
}
```

Output:

```
a + b = 22
a - b = 12
a * b = 85
a / b = 3  (integer)
a % b = 2  (remainder)
a / b = 3.40  (float)
n after +=6 : 10
max(a,b)    : 17
```
