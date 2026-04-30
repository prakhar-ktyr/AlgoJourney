---
title: C Booleans
---

# C Booleans

For most of C's history there was no built-in Boolean type. Programmers used `int`: zero meant false, anything else meant true. C99 finally added a real Boolean type — and a friendly header that lets you write `bool`, `true`, and `false`.

## The C-style "Boolean" — using `int`

```c
int is_logged_in = 0;       // 0 = false
int has_account  = 1;       // 1 = true (any non-zero value is "true")

if (is_logged_in) {
    puts("welcome back");
}
```

This still works, and you'll see it in older code. Any non-zero integer is treated as true by `if`, `while`, `&&`, `||`, and `!`.

## The modern Boolean — `<stdbool.h>`

Include the header and you get three new names:

```c
#include <stdbool.h>

bool is_ready = true;
bool game_over = false;

if (is_ready && !game_over) {
    puts("Let's play!");
}
```

Behind the scenes, `bool` is a typedef for `_Bool`, a C99 type that can only hold `0` or `1`. Assigning any other value automatically becomes `1`:

```c
bool b = 42;       // b is 1, not 42
bool z = 0.0;      // z is 0
bool n = NULL;     // n is 0
```

In C23, `bool`, `true`, and `false` are official keywords and you don't need the header.

## Boolean expressions

Comparison operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) and logical operators (`&&`, `||`, `!`) all produce a `0` or `1`:

```c
bool is_adult     = (age >= 18);
bool is_weekend   = (day == SAT || day == SUN);
bool is_in_range  = (n >= 0 && n < 100);
bool is_invalid   = !is_in_range;
```

## Printing Booleans

There is no `%b` specifier. Two common idioms:

```c
bool ready = true;
printf("%d\n", ready);                            // 1
printf("%s\n", ready ? "true" : "false");         // true
```

## Common patterns

**Flag toggling:**

```c
bool dark_mode = false;

void toggle(void) {
    dark_mode = !dark_mode;   // flip true ↔ false
}
```

**Early returns** read better with `bool`:

```c
bool is_valid_password(const char *pw) {
    if (pw == NULL)             return false;
    if (strlen(pw) < 8)         return false;
    if (strchr(pw, ' ') != NULL) return false;
    return true;
}
```

**Array of flags:**

```c
bool seen[256] = { false };   // all false initially
seen['A'] = true;
if (seen[c]) { ... }
```

## Pitfalls

1. **Don't compare `bool` to `true`.**

   ```c
   if (is_ready == true) { ... }   // ❌ noisy
   if (is_ready)         { ... }   // ✅ idiomatic
   ```

2. **Don't compare a `bool`-returning function to `1`.**

   ```c
   if (strcmp(a, b) == 1) { ... }   // ❌ strcmp returns ANY positive number
   if (strcmp(a, b) > 0)  { ... }   // ✅
   ```

3. **`if (a = b)`** — the assignment-vs-equality bug, see the variables lesson. Use `-Wall` to catch it.

## Putting it together

```c
#include <stdio.h>
#include <stdbool.h>

bool is_leap_year(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

int main(void) {
    int years[] = { 1900, 2000, 2020, 2023, 2024 };
    for (int i = 0; i < 5; i++) {
        printf("%d : %s\n",
               years[i],
               is_leap_year(years[i]) ? "leap" : "not leap");
    }
    return 0;
}
```

Output:

```
1900 : not leap
2000 : leap
2020 : leap
2023 : not leap
2024 : leap
```
