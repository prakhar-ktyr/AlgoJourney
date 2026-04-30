---
title: C Memory Management
---

# C Memory Management

So far every variable you've used has lived on the **stack** — a small (1–8 MB) area of memory that is automatically reclaimed when its function returns. The stack is fast and easy, but it can't:

- hold data whose size is only known at runtime,
- hold data that **outlives** the function that created it.

For both of those, you use the **heap** — a much larger, manually-managed pool of memory. C's interface to the heap lives in `<stdlib.h>` and consists of four functions: `malloc`, `calloc`, `realloc`, and `free`.

## `malloc` — allocate

```c
void *malloc(size_t size);
```

Asks the OS for `size` bytes and returns a pointer to them. Returns `NULL` if there isn't enough memory.

```c
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 100;
    int *arr = malloc(n * sizeof *arr);   // allocate room for 100 ints
    if (arr == NULL) {
        perror("malloc");
        return 1;
    }

    for (int i = 0; i < n; i++) arr[i] = i * i;
    printf("arr[10] = %d\n", arr[10]);    // 100

    free(arr);                             // give it back!
    return 0;
}
```

A few idioms worth memorizing:

- `sizeof *arr` (instead of `sizeof(int)`) keeps your code correct if you change the type later.
- `malloc` returns `void *`, which auto-converts to any pointer type — no cast needed in C (in C++ you would cast).
- **Always check for `NULL`.** Some allocations may fail, especially huge ones.

## `calloc` — allocate and zero

```c
void *calloc(size_t count, size_t size);
```

Same as `malloc(count * size)` but the memory is initialized to **all zero bits**:

```c
int *arr = calloc(100, sizeof *arr);     /* 100 zeroed ints */
```

Use `calloc` when you genuinely need zeros; otherwise `malloc` is faster (it doesn't have to write 400 bytes of zeros).

## `realloc` — resize

```c
void *realloc(void *ptr, size_t new_size);
```

Resizes an existing allocation. The new memory may be at a **different address**, so always assign the return value:

```c
int *bigger = realloc(arr, 200 * sizeof *arr);
if (bigger == NULL) {
    /* realloc failed — but `arr` is still valid! */
    free(arr);
    return 1;
}
arr = bigger;
```

`realloc(NULL, n)` is the same as `malloc(n)`. `realloc(p, 0)` is implementation-defined (don't rely on it).

A common pattern — a self-growing buffer:

```c
int   capacity = 16;
int   count    = 0;
int  *buf      = malloc(capacity * sizeof *buf);

void push(int v) {
    if (count == capacity) {
        capacity *= 2;                     /* grow exponentially */
        buf = realloc(buf, capacity * sizeof *buf);
    }
    buf[count++] = v;
}
```

## `free` — release

```c
void free(void *ptr);
```

Tells the heap "I'm done with this memory; you can give it to someone else." After `free`:

- The pointer is **dangling** — using it is undefined behavior.
- A common safety habit is to assign `NULL`:

  ```c
  free(arr);
  arr = NULL;
  ```

- **Double-free is undefined behavior.** Tools like Valgrind and AddressSanitizer catch it; just don't do it.
- `free(NULL)` is **safe** — it's a no-op. So you don't need to test for NULL before freeing.

## The heap-allocated string pattern

Strings of unknown length get allocated on the heap:

```c
char *str = malloc(64);
if (!str) { /* ... */ }
strcpy(str, "Hello");
/* ... */
free(str);
```

Or, the POSIX shortcut `strdup(s)` — `malloc`s a copy:

```c
char *copy = strdup(original);
/* ... */
free(copy);
```

## Heap vs stack — when to use each

| Stack | Heap |
|-------|------|
| Tiny per-thread (1–8 MB) | Large (gigabytes) |
| Lifetime tied to function | You decide the lifetime |
| Allocated automatically | Allocated by `malloc` family |
| Released automatically | Released by `free` |
| Very fast (just bumps a pointer) | Slower (general-purpose allocator) |

Default to the stack. Reach for the heap when you must.

## Common bugs

1. **Memory leak** — allocating and never freeing. Fine for short programs; deadly for long-running services.
2. **Use-after-free** — using a pointer after `free`. Often crashes; sometimes silently corrupts later allocations.
3. **Double free** — undefined behavior, frequently exploited as a security vulnerability.
4. **Out-of-bounds read/write** — e.g. writing past the end of an allocation. Corrupts unrelated data.
5. **Forgetting to check `malloc`** — dereferencing `NULL` crashes immediately, which is sometimes a *good* outcome compared to silently using bad memory.
6. **Mixing free families** — never `free` a pointer returned by `new` (in C++), `strdup`'d memory must be `free`'d (not `delete`'d), etc.

## Tools to catch leaks

- **Valgrind** — `valgrind --leak-check=full ./prog`.
- **AddressSanitizer** — compile with `gcc -fsanitize=address -g`. Catches leaks, use-after-free, out-of-bounds at runtime.
- **`-Wall -Wextra`** — the compiler catches some bugs at compile time.

## Putting it together — read all lines from stdin into a heap array

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char  **lines    = NULL;
    size_t  count    = 0;
    size_t  capacity = 0;
    char    buf[1024];

    while (fgets(buf, sizeof buf, stdin)) {
        if (count == capacity) {
            capacity = capacity ? capacity * 2 : 16;
            lines = realloc(lines, capacity * sizeof *lines);
            if (!lines) { perror("realloc"); return 1; }
        }
        lines[count] = strdup(buf);
        if (!lines[count]) { perror("strdup"); return 1; }
        count++;
    }

    /* print in reverse order */
    for (size_t i = count; i > 0; i--) {
        fputs(lines[i - 1], stdout);
    }

    /* clean up everything we allocated */
    for (size_t i = 0; i < count; i++) free(lines[i]);
    free(lines);
    return 0;
}
```

Every `malloc`/`strdup` is matched by a `free`. That's the discipline you'll carry through every C program you ever write.
