---
title: C Data Types
---

# C Data Types

C is a **statically-typed** language: every variable's type is fixed at compile time, and the compiler will refuse to mix incompatible types without an explicit conversion. Knowing the built-in types is essential.

## The fundamental types

| Type | Typical size | Typical range | `printf` |
|------|--------------|---------------|----------|
| `char` | 1 byte | −128 to 127 (or 0–255 if `unsigned`) | `%c` (as char) / `%d` (as number) |
| `short` | 2 bytes | −32,768 to 32,767 | `%hd` |
| `int` | 4 bytes | ≈ −2.1 × 10⁹ to 2.1 × 10⁹ | `%d` |
| `long` | 4 or 8 bytes | platform-dependent | `%ld` |
| `long long` | 8 bytes | ≈ −9.2 × 10¹⁸ to 9.2 × 10¹⁸ | `%lld` |
| `float` | 4 bytes | ≈ ±3.4 × 10³⁸, ~7 decimal digits | `%f` |
| `double` | 8 bytes | ≈ ±1.7 × 10³⁰⁸, ~15 decimal digits | `%lf` (or `%f`) |
| `long double` | 8, 12, or 16 bytes | even bigger | `%Lf` |

> ⚠️ Sizes are **not** mandated by the standard; only minimums. `int` is *at least* 16 bits, `long` *at least* 32, `long long` *at least* 64. On most modern desktop OSes you'll get the "Typical size" column above.

For exact-width integers, include `<stdint.h>` and use:

```c
#include <stdint.h>

int8_t   tiny    =  -42;
int16_t  small   = 1000;
int32_t  medium  = 1000000;
int64_t  large   = 9000000000;
uint8_t  byte    = 0xFF;
uint64_t big_pos = 18000000000ULL;
```

These types are **portable** — `int32_t` is always exactly 32 bits, on every platform.

## Signed and unsigned

By default integer types are **signed** (can hold negatives). Add `unsigned` to make them non-negative with double the positive range:

```c
unsigned int positive_only = 4000000000u;
unsigned char byte = 200;
```

Mixing signed and unsigned is a famous source of bugs:

```c
int    a = -1;
unsigned int b = 1;
if (a < b) printf("yes\n");      // surprisingly prints nothing!
```

Why? `a` is converted to `unsigned`, becoming a huge positive number, which is **not** less than 1.

## Floating-point types

```c
float  f = 3.14f;       // note the 'f' suffix → float literal
double d = 3.14;        // no suffix → double literal
long double ld = 3.14L; // 'L' → long double literal
```

Without the `f`, the literal `3.14` is a `double`. Assigning it to a `float` works (with implicit conversion) but the compiler may warn about precision loss with `-Wfloat-conversion`.

⚠️ Floating-point math is **not exact**. `0.1 + 0.2` is not exactly `0.3` — it's `0.30000000000000004`. Never compare floats with `==`; compare the absolute difference against a small epsilon.

## The `char` type

`char` is technically an integer type holding one byte. You can use it as a number *or* as a character:

```c
char c = 'A';
printf("%c\n", c);      // A
printf("%d\n", c);      // 65   (its ASCII code)
c = c + 1;
printf("%c\n", c);      // B
```

Whether plain `char` is signed or unsigned is **implementation-defined**. If you care, write `signed char` or `unsigned char` explicitly.

## `void`

`void` means "no type." You see it in three places:

```c
void print_hello(void);     // function takes no parameters
void *ptr;                  // generic pointer (any type)
return;                     // inside a void function — no value returned
```

You cannot declare a variable of type `void` — there is nothing to store.

## `_Bool` and `bool`

A true Boolean type was added in C99. The keyword is `_Bool`, but if you `#include <stdbool.h>` you get the friendlier names `bool`, `true`, and `false`:

```c
#include <stdbool.h>

bool is_ready = true;
if (is_ready) {
    puts("Go!");
}
```

C23 makes `bool`, `true`, and `false` keywords with no header needed.

## `sizeof`

The `sizeof` operator returns the number of **bytes** a type or value occupies. It's evaluated at compile time and returns a `size_t`.

```c
#include <stdio.h>
#include <stddef.h>     // for size_t

int main(void) {
    printf("char        : %zu bytes\n", sizeof(char));
    printf("int         : %zu bytes\n", sizeof(int));
    printf("long        : %zu bytes\n", sizeof(long));
    printf("long long   : %zu bytes\n", sizeof(long long));
    printf("float       : %zu bytes\n", sizeof(float));
    printf("double      : %zu bytes\n", sizeof(double));
    printf("void *      : %zu bytes\n", sizeof(void *));
    return 0;
}
```

`%zu` is the format specifier for `size_t`.

## Type conversions

When you mix types, C automatically converts the "smaller" one to the "larger" one. This is **implicit conversion** (or *promotion*):

```c
int    a = 5;
double b = 2.0;
double c = a + b;     // a is promoted to double, c == 7.0
```

For an **explicit conversion** (a *cast*), put the target type in parentheses:

```c
double pi    = 3.14;
int    whole = (int)pi;   // whole == 3 — fractional part discarded
```

Casts are powerful but dangerous. Don't reach for one to silence a warning — figure out *why* the warning is there first.

A classic gotcha — integer division:

```c
int x = 7, y = 2;
double r = x / y;          // r == 3.0 (integer division first!)
double r2 = (double)x / y; // r2 == 3.5 ✅
```

## `enum` — named integer constants

Although covered later in depth, you should know the syntax:

```c
enum Color { RED, GREEN, BLUE };
enum Color c = GREEN;     // c == 1
```

`RED` is `0`, `GREEN` is `1`, `BLUE` is `2`. They are just `int` constants in disguise.

## Putting it together

```c
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

int main(void) {
    int32_t  population = 1000000;
    uint8_t  health     = 100;
    double   temperature = -3.7;
    char     grade      = 'A';
    bool     game_over  = false;

    printf("Population : %d\n", population);
    printf("Health     : %u\n", health);
    printf("Temp       : %.1f °C\n", temperature);
    printf("Grade      : %c\n", grade);
    printf("Game over? : %s\n", game_over ? "yes" : "no");
    return 0;
}
```

Picking the right type for the data you're storing is one of the most fundamental skills in C. When in doubt: `int` for counts and indices, `double` for math, `char` for letters, `size_t` for sizes, `bool` for true/false.
