---
title: C Files
---

# C Files

C reads and writes files through `FILE *` handles defined in `<stdio.h>`. The pattern is always: open, read or write, close.

## Opening a file

```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("fopen");                /* prints why it failed */
    return 1;
}
```

`fopen` returns `NULL` on failure (file not found, permission denied, …). **Always** check it. `perror("fopen")` prints something like:

```
fopen: No such file or directory
```

### Mode strings

| Mode | Meaning |
|------|---------|
| `"r"` | read; file must exist |
| `"w"` | write; truncate existing file or create new |
| `"a"` | append; create if missing |
| `"r+"` | read & write; file must exist |
| `"w+"` | read & write; truncate or create |
| `"a+"` | read & append |
| add `b` (e.g. `"rb"`) | binary mode (matters on Windows) |

For text files on Linux/macOS, `"r"` and `"rb"` are identical. On Windows, text mode translates `\r\n` ↔ `\n`. When in doubt, use `"b"`.

## Closing a file

```c
fclose(fp);
```

Closing flushes buffered writes and releases the OS handle. **Always close.** If your program crashes before `fclose`, written data may not actually be on disk.

## Writing text

```c
FILE *fp = fopen("hello.txt", "w");
if (!fp) { perror("fopen"); return 1; }

fputs("Hello, file!\n", fp);
fprintf(fp, "Pi = %.5f\n", 3.14159);

fclose(fp);
```

`fprintf` works exactly like `printf`, but takes a `FILE *` first.

## Reading text

### Line by line — `fgets`

```c
FILE *fp = fopen("hello.txt", "r");
if (!fp) { perror("fopen"); return 1; }

char line[256];
while (fgets(line, sizeof line, fp) != NULL) {
    fputs(line, stdout);     /* echo to screen */
}

fclose(fp);
```

`fgets` returns `NULL` at EOF or on error.

### Word by word — `fscanf`

```c
char word[64];
while (fscanf(fp, "%63s", word) == 1) {
    printf("got: %s\n", word);
}
```

### Char by char — `fgetc`

```c
int c;
while ((c = fgetc(fp)) != EOF) {
    putchar(c);
}
```

Note `int`, not `char`, so `EOF` is distinguishable from valid bytes.

## Binary I/O

For non-text data — images, structs, anything — use `fread` and `fwrite`. They take the count and size of items:

```c
typedef struct { int id; double price; } Item;

Item items[100] = { /* ... */ };

/* write */
FILE *fp = fopen("items.bin", "wb");
fwrite(items, sizeof(Item), 100, fp);
fclose(fp);

/* read */
fp = fopen("items.bin", "rb");
size_t n = fread(items, sizeof(Item), 100, fp);
printf("read %zu items\n", n);
fclose(fp);
```

Binary files are **not portable** across platforms with different endianness or struct padding — fine for caches, risky for shared formats.

## Standard streams

Three `FILE *` handles are always open:

| Stream | Purpose |
|--------|---------|
| `stdin`  | standard input (keyboard) |
| `stdout` | standard output (terminal) |
| `stderr` | standard error (terminal, unbuffered) |

So `printf("...")` is shorthand for `fprintf(stdout, "...")`, and `getchar()` is shorthand for `fgetc(stdin)`. Use `stderr` for errors:

```c
fprintf(stderr, "ERROR: cannot open %s\n", path);
```

This way users can redirect normal output (`>file`) without mixing in error messages.

## Seeking

You can jump around in a file:

```c
fseek(fp, 0, SEEK_END);    /* go to end */
long size = ftell(fp);     /* current position = file size */
rewind(fp);                /* back to start; same as fseek(fp, 0, SEEK_SET) */
```

Whence options for `fseek`:

- `SEEK_SET` — from start of file
- `SEEK_CUR` — from current position
- `SEEK_END` — from end of file

## Checking for errors

After any I/O call, you can check:

```c
if (ferror(fp)) {
    fprintf(stderr, "read error\n");
}
if (feof(fp)) {
    /* reached end of file */
}
clearerr(fp);    /* reset error flags */
```

## A complete example — count lines, words, chars

```c
#include <stdio.h>
#include <ctype.h>

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s <file>\n", argv[0]);
        return 1;
    }

    FILE *fp = fopen(argv[1], "r");
    if (!fp) { perror("fopen"); return 1; }

    long lines = 0, words = 0, chars = 0;
    int  c, in_word = 0;

    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\n') lines++;
        if (isspace(c)) {
            in_word = 0;
        } else if (!in_word) {
            in_word = 1;
            words++;
        }
    }

    fclose(fp);
    printf("%6ld %6ld %6ld %s\n", lines, words, chars, argv[1]);
    return 0;
}
```

That's a tiny `wc` clone. Build it:

```bash
gcc wc.c -o wc
./wc wc.c
```

## Best practices

1. **Always check `fopen`'s return value.**
2. **Always `fclose` what you `fopen`.** Consider a `goto cleanup;` block to centralize closing on error paths.
3. **Bound your reads.** `fgets(buf, sizeof buf, fp)` is safer than `fscanf("%s", buf)`.
4. **Use `"b"`** on binary data, especially if your program might run on Windows.
5. **Prefer `fprintf(stderr, ...)`** for errors — keeps stdout clean for actual output.
