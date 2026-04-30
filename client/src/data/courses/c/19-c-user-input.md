---
title: C User Input
---

# C User Input

To read what the user types, C uses functions from `<stdio.h>`. Each one has trade-offs around safety and convenience.

## `scanf`

`scanf` is the mirror of `printf` — it reads formatted input from `stdin`.

```c
#include <stdio.h>

int main(void) {
    int age;
    printf("Age? ");
    scanf("%d", &age);                  // note the &  → address of age
    printf("You are %d years old.\n", age);
    return 0;
}
```

The `&` is the **address-of** operator. `scanf` needs to know *where* to store the result, so you pass the address of the variable, not the variable itself. (Strings are an exception, because an array name already decays to a pointer.)

### Reading multiple values

Whitespace in the format string matches any amount of whitespace in the input — including newlines:

```c
int x, y;
scanf("%d %d", &x, &y);          // reads two integers separated by spaces
```

### Reading a string

`%s` reads up to the next whitespace. **Always** specify a maximum width:

```c
char name[32];
scanf("%31s", name);             // never write more than 31 chars + the '\0'
```

### Always check the return value

`scanf` returns the **number of items successfully read**. Use it:

```c
int n;
if (scanf("%d", &n) != 1) {
    fprintf(stderr, "Not a valid number.\n");
    return 1;
}
```

If the user types `abc` instead of an integer, `scanf` returns `0`, leaves `abc` in the input buffer, and you get an infinite loop if you try to re-read without clearing. To clear:

```c
int c;
while ((c = getchar()) != '\n' && c != EOF) { /* discard */ }
```

## `fgets` — safer line input

For real programs, prefer `fgets`. It reads up to `n-1` characters or up to the newline, whichever comes first, and always null-terminates:

```c
char line[100];
if (fgets(line, sizeof line, stdin) != NULL) {
    line[strcspn(line, "\n")] = '\0';   // strip trailing '\n' if present
    printf("you said: %s\n", line);
}
```

`fgets` returns `NULL` on end-of-file or error, which makes loops natural:

```c
char line[256];
while (fgets(line, sizeof line, stdin) != NULL) {
    /* process line */
}
```

You can then **parse** the line with `sscanf`:

```c
int x, y;
if (sscanf(line, "%d %d", &x, &y) == 2) {
    printf("x=%d y=%d\n", x, y);
}
```

The `fgets` + `sscanf` combo is the modern idiomatic way to read user input in C — safer than raw `scanf` because it limits the buffer.

## Reading a single character

`getchar()` reads one `int` (a byte cast to int, or `EOF`):

```c
int c = getchar();
if (c != EOF) putchar(c);
```

`int`, not `char`, because `EOF` (typically `-1`) must be distinguishable from any valid byte.

A common idiom — print every char until EOF (Ctrl-D on Unix, Ctrl-Z + Enter on Windows):

```c
int c;
while ((c = getchar()) != EOF) {
    putchar(c);
}
```

## `fflush(stdout)` — show the prompt before reading

Prompts that don't end with `\n` may not appear because `stdout` is line-buffered:

```c
printf("Type something: ");      // user sees nothing yet!
fflush(stdout);                   // force the prompt out
char line[64];
fgets(line, sizeof line, stdin);
```

Either call `fflush(stdout)` or end the prompt with `\n`.

## Common input recipes

### Read an integer in a range, retrying on bad input

```c
int read_int_in_range(int low, int high) {
    char line[64];
    while (1) {
        printf("[%d-%d]: ", low, high);
        fflush(stdout);
        if (!fgets(line, sizeof line, stdin)) exit(1);
        int n;
        if (sscanf(line, "%d", &n) == 1 && n >= low && n <= high) {
            return n;
        }
        puts("Try again.");
    }
}
```

### Read a yes/no answer

```c
char answer[8];
printf("Continue? [y/n] ");
fflush(stdout);
fgets(answer, sizeof answer, stdin);
if (answer[0] == 'y' || answer[0] == 'Y') {
    /* ... */
}
```

## Putting it together

```c
#include <stdio.h>
#include <string.h>

int main(void) {
    char name[64];
    int  age;

    printf("What is your name? ");
    fflush(stdout);
    if (!fgets(name, sizeof name, stdin)) return 1;
    name[strcspn(name, "\n")] = '\0';

    printf("Hi %s, how old are you? ", name);
    fflush(stdout);

    char buf[32];
    if (!fgets(buf, sizeof buf, stdin) || sscanf(buf, "%d", &age) != 1) {
        puts("Couldn't read age.");
        return 1;
    }

    printf("Welcome, %s! In 10 years you will be %d.\n", name, age + 10);
    return 0;
}
```

Sample run:

```
What is your name? Ada
Hi Ada, how old are you? 36
Welcome, Ada! In 10 years you will be 46.
```
