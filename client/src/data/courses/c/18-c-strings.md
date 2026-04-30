---
title: C Strings
---

# C Strings

C has no built-in string type. A "string" in C is just an **array of `char`** with a **null terminator** (`'\0'`) marking the end. Once you understand that, the entire `<string.h>` library makes sense.

## Creating a string

Two equivalent forms:

```c
char greeting1[] = "Hello";
char greeting2[] = { 'H', 'e', 'l', 'l', 'o', '\0' };
```

Both create a 6-byte array (`H e l l o \0`). The compiler automatically appends `\0` when you use the `"..."` literal — that's the whole reason a 5-letter word needs 6 bytes.

You can also point at a string literal stored in read-only memory:

```c
const char *name = "Ada";    // pointer to a string literal
/* name[0] = 'X';   ← undefined behavior — literals are read-only */
```

## Why the null terminator?

C's standard library functions don't take a length parameter — they walk the string byte by byte until they hit `\0`. That's why every string operation is O(length).

```c
char s[] = "hi";
for (int i = 0; s[i] != '\0'; i++) {
    printf("char %d: %c\n", i, s[i]);
}
```

If you forget to terminate a string, library functions will keep reading until they find a stray `\0` somewhere in memory — leading to garbage output, crashes, or worse, security holes.

## Printing strings

Use `%s` with `printf`, or `puts` (which also adds a newline):

```c
char name[] = "World";
printf("Hello, %s!\n", name);   // Hello, World!
puts(name);                      // World\n
```

## Reading strings

`scanf` with `%s` reads up to the next whitespace — and **does not bound-check by default**:

```c
char name[20];
printf("Name: ");
scanf("%19s", name);    // ← the 19 prevents overflow into byte 20 (the \0)
```

Always include the width or you have a buffer overflow waiting to happen.

For a whole line (including spaces), use `fgets`:

```c
char line[100];
if (fgets(line, sizeof line, stdin) != NULL) {
    /* Note: fgets keeps the trailing '\n' if it fit. Strip it: */
    line[strcspn(line, "\n")] = '\0';
    printf("you said: %s\n", line);
}
```

## The `<string.h>` essentials

```c
#include <string.h>
```

| Function | What it does |
|----------|--------------|
| `strlen(s)` | Number of chars before `\0` (length) |
| `strcpy(dst, src)` | Copy `src` into `dst`. **No bounds check.** |
| `strncpy(dst, src, n)` | Copy at most `n` bytes. May not null-terminate! |
| `strcat(dst, src)` | Append `src` to `dst`. **No bounds check.** |
| `strcmp(a, b)` | Compare; 0 if equal, <0 if a<b, >0 if a>b |
| `strncmp(a, b, n)` | Compare first `n` chars |
| `strchr(s, c)` | Pointer to first `c` in `s`, or NULL |
| `strstr(haystack, needle)` | Pointer to first occurrence, or NULL |
| `strdup(s)` | Make a `malloc`'d copy (POSIX, not strict C) |

Examples:

```c
char a[20] = "Hello";
char b[]   = " World";

printf("len=%zu\n", strlen(a));        // 5
strcat(a, b);                          // a is now "Hello World"
printf("%s\n", a);

if (strcmp("apple", "banana") < 0) puts("apple comes first");
char *p = strchr(a, 'W');              // points to "World" inside a
if (p) puts(p);
```

## The `strcpy` danger

`strcpy` will happily write past the end of `dst` if `src` is too long. This is the classic stack-buffer-overflow bug:

```c
char small[5];
strcpy(small, "Hello, World!");        // ❌ writes 14 bytes into a 5-byte buffer
```

The safer alternative is `snprintf`:

```c
char buf[5];
snprintf(buf, sizeof buf, "%s", "Hello, World!");   // truncates safely
```

`snprintf` always null-terminates and respects the buffer size.

## Iterating a string character by character

```c
char s[] = "Hello";
for (char *p = s; *p != '\0'; p++) {
    putchar(*p);
}
```

This is the "pointer style" — equivalent to indexing but extremely common in C source.

## `<ctype.h>` — character classification

```c
#include <ctype.h>

isalpha(c)   /* letter? */
isdigit(c)   /* digit?  */
isspace(c)   /* whitespace? */
isupper(c)   /* upper case? */
islower(c)   /* lower case? */
toupper(c)   /* convert */
tolower(c)
```

```c
char s[] = "Hello, 2024!";
for (int i = 0; s[i]; i++) {
    s[i] = (char)toupper((unsigned char)s[i]);
}
puts(s);     // HELLO, 2024!
```

The `(unsigned char)` cast is intentional — `toupper` is undefined for negative `char` values on systems where `char` is signed.

## Strings of strings — array of `char *`

```c
const char *days[] = {
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
};
for (int i = 0; i < 7; i++) puts(days[i]);
```

Each element is a pointer to a string literal. The array itself is just 7 pointers.

## Putting it together — count vowels

```c
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char line[256];
    printf("Enter a sentence: ");
    if (!fgets(line, sizeof line, stdin)) return 1;
    line[strcspn(line, "\n")] = '\0';

    int vowels = 0;
    for (int i = 0; line[i]; i++) {
        char c = (char)tolower((unsigned char)line[i]);
        if (strchr("aeiou", c)) vowels++;
    }

    printf("\"%s\" has %d vowel(s) and %zu chars total\n",
           line, vowels, strlen(line));
    return 0;
}
```
