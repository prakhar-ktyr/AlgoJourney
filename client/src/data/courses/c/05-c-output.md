---
title: C Output (printf)
---

# C Output — `printf`

`printf` is your window into what your program is doing. Mastering it now will make every later lesson easier.

## Printing plain text

```c
#include <stdio.h>

int main(void) {
    printf("Learning C is fun.\n");
    printf("And printf is how you say so.\n");
    return 0;
}
```

Output:

```
Learning C is fun.
And printf is how you say so.
```

Notice that `printf` does **not** add a newline automatically — you have to write `\n` yourself.

## Escape sequences

Special characters inside a string are written with a leading backslash:

| Sequence | Meaning |
|----------|---------|
| `\n` | Newline |
| `\t` | Horizontal tab |
| `\r` | Carriage return |
| `\\` | A literal backslash |
| `\"` | A literal double-quote |
| `\0` | Null byte (end-of-string marker) |
| `\a` | Bell / alert |
| `\xHH` | Byte with hex value `HH` |

Example:

```c
printf("She said, \"Hello!\"\n");
printf("Path:\tC:\\Users\\you\n");
```

Output:

```
She said, "Hello!"
Path:	C:\Users\you
```

## Format specifiers — printing values

To print a variable, you use a **format specifier** — a `%` followed by a letter that tells `printf` how to interpret the next argument.

```c
int    age   = 30;
float  pi    = 3.14f;
double e     = 2.71828;
char   grade = 'A';
char  *name  = "Ada";

printf("Name : %s\n", name);
printf("Age  : %d\n", age);
printf("Pi   : %f\n", pi);
printf("e    : %lf\n", e);
printf("Grade: %c\n", grade);
```

The most common specifiers:

| Specifier | Type | Example |
|-----------|------|---------|
| `%d` or `%i` | `int` (signed decimal) | `42` |
| `%u` | `unsigned int` | `42` |
| `%ld` | `long` | `9999999999` |
| `%lld` | `long long` | very big number |
| `%f` | `float` / `double` (decimal) | `3.140000` |
| `%lf` | `double` (with `scanf`; `%f` works for both in `printf`) | `3.140000` |
| `%e` | scientific notation | `3.140000e+00` |
| `%g` | shorter of `%f` or `%e` | `3.14` |
| `%c` | single `char` | `A` |
| `%s` | string (`char *`) | `Ada` |
| `%x` | unsigned hex (lowercase) | `2a` |
| `%X` | unsigned hex (uppercase) | `2A` |
| `%o` | unsigned octal | `52` |
| `%p` | pointer address | `0x7ffd…` |
| `%%` | a literal `%` sign | `%` |

## Width, precision, and alignment

Inside a specifier you can put `%[flags][width][.precision]type`:

```c
printf("[%5d]\n",   42);     // [   42]   width 5, right-aligned
printf("[%-5d]\n",  42);     // [42   ]   left-aligned
printf("[%05d]\n",  42);     // [00042]   zero-padded
printf("[%8.3f]\n", 3.14);   // [   3.140] width 8, 3 decimals
printf("[%.2f]\n",  3.14159);// [3.14]    2 decimals
printf("[%10s]\n",  "hi");   // [        hi]
```

Width is the *minimum* number of characters; if the value is wider, it overflows. Precision means *digits after the decimal* for `%f`, or *maximum characters* for `%s`.

## `printf` returns a value

`printf` actually returns the number of characters it printed, or a negative number on error. You can ignore it (we usually do), but it's there:

```c
int n = printf("hello\n");   // n is 6 (5 letters + newline)
```

## Common pitfalls

1. **Mismatched specifier and argument** — undefined behavior:

   ```c
   int x = 5;
   printf("%s\n", x);   // ❌ %s expects a char*, not an int — likely crash
   ```

   With `-Wall` GCC will warn you about this.

2. **Forgetting the newline** — output may not appear immediately, because `stdout` is *line-buffered* by default. If you really need an immediate flush, use `fflush(stdout);`.

3. **Printing `char` as `%d`** — that's actually fine; it prints the character's ASCII code. `printf("%d\n", 'A');` prints `65`.

## Other output functions

- `puts(s)` — prints `s` and adds a newline. Faster when you don't need formatting.
- `putchar(c)` — prints a single character.
- `fprintf(stream, ...)` — like `printf` but to any stream, e.g. `fprintf(stderr, "error\n");`.
- `sprintf(buffer, ...)` — writes the formatted output to a string instead of the screen. **Always prefer `snprintf` for safety**, which limits how many characters it writes.

```c
char msg[64];
snprintf(msg, sizeof msg, "x=%d y=%d", 3, 4);
puts(msg);   // x=3 y=4
```

You'll use `printf` in nearly every program you write. Don't hesitate to come back to this page as a reference.
