---
title: C Variables
---

# C Variables

A **variable** is a named region of memory that holds a value. In C, every variable has:

1. A **type** — what kind of data it holds (`int`, `float`, `char`, …).
2. A **name** — the identifier you use to refer to it.
3. A **value** — the data currently stored at that location.
4. An **address** — where in memory the value lives (you'll meet this when we discuss pointers).

## Declaring a variable

The general form is:

```c
type name = value;
```

Examples:

```c
int    age   = 30;
float  price = 19.99f;
double pi    = 3.14159265358979;
char   grade = 'A';
```

You can declare without initializing, then assign later:

```c
int score;
score = 100;
```

⚠️ **Warning:** an uninitialized local variable contains *garbage* — whatever bytes were already in that memory. Reading it before assigning is **undefined behavior**.

```c
int x;
printf("%d\n", x);   // ❌ could print anything; modern compilers warn
```

Always initialize, or assign before the first use.

## Multiple variables of the same type

You can declare several at once, separated by commas:

```c
int a, b, c;
int x = 1, y = 2, z = 3;
```

Use sparingly — one declaration per line is usually clearer.

## Constants — variables that can't change

Prefix the type with `const`:

```c
const double PI = 3.14159;
PI = 3.14;          // ❌ error: assignment of read-only variable 'PI'
```

You'll see more on constants in a later lesson.

## Naming rules

C identifier rules:

- Must start with a **letter** (`a–z`, `A–Z`) or an **underscore** `_`.
- Subsequent characters may be letters, digits, or underscores.
- **Case-sensitive**: `count`, `Count`, and `COUNT` are three different variables.
- Cannot be a **reserved keyword** (`int`, `if`, `return`, `while`, …).
- Maximum length is *implementation-defined* but always at least 31 characters for external names.

Valid:

```c
int counter;
int _internal;
int player2_score;
int häufig;          // ✅ since C99 with UTF-8 source, though unusual
```

Invalid:

```c
int 2nd_player;      // ❌ starts with a digit
int total-cost;      // ❌ '-' not allowed
int return;          // ❌ reserved word
```

## Naming conventions

Conventions vary by project, but the most common in modern C are:

| Kind | Style | Example |
|------|-------|---------|
| Local variable | `lowercase_with_underscores` | `player_score` |
| Function | `lowercase_with_underscores` | `compute_total` |
| Type (`typedef`) | `snake_case_t` | `node_t` |
| Macro / `#define` | `UPPER_CASE` | `MAX_USERS` |
| Global constant | `UPPER_CASE` | `BUFFER_SIZE` |

Pick a convention, then be consistent across your codebase.

## Assignment is not equality

The `=` operator **assigns**. Two equal signs `==` test for equality. Mixing them up is a classic bug:

```c
int x = 5;

if (x = 10) {        // ❌ assigns 10 to x, then checks if 10 is non-zero (true)
    printf("oops\n");
}

if (x == 10) {       // ✅ tests whether x equals 10
    printf("yes\n");
}
```

## Multiple assignment

`=` returns the value assigned, so chaining works:

```c
int a, b, c;
a = b = c = 0;       // all three become 0
```

## Putting it all together

```c
#include <stdio.h>

int main(void) {
    char  initial   = 'J';
    int   age       = 28;
    float height_m  = 1.78f;
    const double GRAVITY = 9.81;

    age = age + 1;   // happy birthday!

    printf("Initial : %c\n", initial);
    printf("Age     : %d\n", age);
    printf("Height  : %.2f m\n", height_m);
    printf("Gravity : %.2f m/s^2 (constant)\n", GRAVITY);
    return 0;
}
```

Run it:

```
Initial : J
Age     : 29
Height  : 1.78 m
Gravity : 9.81 m/s^2 (constant)
```

Now that you can store data, the next lesson explains every primitive **type** that data can have.
