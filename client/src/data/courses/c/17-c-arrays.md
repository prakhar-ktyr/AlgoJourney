---
title: C Arrays
---

# C Arrays

An **array** is a fixed-size, contiguous block of values of the same type. Arrays are the foundation that strings, dynamic data structures, and most low-level data manipulation are built on top of.

## Declaring an array

```c
type name[size];
```

Examples:

```c
int     scores[5];          // 5 ints — values are uninitialized!
double  prices[100];
char    grade[10];
```

The `size` must be a compile-time constant in standard C90; from C99 onward, **variable-length arrays (VLAs)** allow a runtime size, but VLAs allocate on the stack and are best avoided for large or untrusted sizes.

## Initializing

You can initialize an array when you declare it:

```c
int primes[] = { 2, 3, 5, 7, 11 };       // size inferred → 5
int zeros[10] = { 0 };                   // first element 0, rest auto-zeroed
int specific[5] = { [2] = 42 };          // designated initializer (C99)
```

If you give fewer initializers than the size, the rest become zero. If you give more, it's a compile error.

## Reading and writing elements

Indexing starts at **zero**:

```c
int scores[5] = { 10, 20, 30, 40, 50 };

printf("%d\n", scores[0]);     // 10
printf("%d\n", scores[4]);     // 50

scores[2] = 99;
printf("%d\n", scores[2]);     // 99
```

⚠️ **C does NOT check array bounds.** Writing to `scores[5]` (one past the end) is **undefined behavior** — your program might crash, silently overwrite another variable, or corrupt the stack. This is the most common source of security vulnerabilities in C. Always know the size and stay inside it.

## Iterating

The classic loop:

```c
int n = sizeof(scores) / sizeof(scores[0]);

for (int i = 0; i < n; i++) {
    printf("%d\n", scores[i]);
}
```

`sizeof(scores) / sizeof(scores[0])` works only when `scores` is a real array in scope — once an array is passed to a function, it **decays to a pointer** and `sizeof` gives the pointer size, not the array's. We'll see this in the functions/pointers lessons.

## Multi-dimensional arrays

Arrays of arrays. A 3 × 4 matrix:

```c
int grid[3][4] = {
    { 1, 2, 3, 4 },
    { 5, 6, 7, 8 },
    { 9, 10, 11, 12 }
};

printf("%d\n", grid[1][2]);   // 7

for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 4; c++) {
        printf("%4d", grid[r][c]);
    }
    putchar('\n');
}
```

In memory, `grid` is laid out **row-major**: `grid[0][0], grid[0][1], grid[0][2], grid[0][3], grid[1][0], …`. That matters for performance (CPU caches love sequential access — iterate the rightmost index in the innermost loop).

## Memory layout

An array's elements live in **contiguous memory**. The address of element `i` is `&arr[0] + i` — exactly the pointer arithmetic you'll meet next lesson. That's why arrays are O(1) to index and why they decay to pointers so naturally.

```c
int a[5] = { 10, 20, 30, 40, 50 };
printf("%p\n", (void*)&a[0]);   // e.g. 0x7ffd…00
printf("%p\n", (void*)&a[1]);   // 0x7ffd…04   (4 bytes later)
```

## Common patterns

**Find the maximum:**

```c
int max = arr[0];
for (int i = 1; i < n; i++) {
    if (arr[i] > max) max = arr[i];
}
```

**Reverse in place:**

```c
for (int i = 0, j = n - 1; i < j; i++, j--) {
    int tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}
```

**Copy:** there's no `=` between arrays. You must loop or use `memcpy`:

```c
#include <string.h>
memcpy(dest, src, n * sizeof(int));
```

## Variable-length arrays (VLAs)

C99 added arrays whose size is determined at runtime:

```c
int n = 10;
int buffer[n];     // VLA — allocated on the stack
```

VLAs are convenient but risky:

- They live on the **stack**, which is small (usually a few MB). A large `n` will crash with a stack overflow.
- They are **optional** in C11 and later — some compilers (notably MSVC) don't support them.

For dynamic-size storage, prefer `malloc` (covered in the **Memory Management** lesson).

## Array vs pointer (preview)

This is a famous source of confusion. They are **not the same thing**, but in many expressions an array name **decays** to a pointer to its first element:

```c
int arr[5] = { 1, 2, 3, 4, 5 };
int *p = arr;          // legal — arr decays to &arr[0]
printf("%d\n", p[2]);  // 3 — pointers can be indexed too
printf("%d\n", *(arr + 2));   // 3 — arrays support pointer arithmetic
```

But `sizeof(arr)` is `20` (5 × 4 bytes), while `sizeof(p)` is `8` (or 4) — the pointer size. We'll dig into this in the next two lessons.

## Putting it together

```c
#include <stdio.h>

int main(void) {
    int  n;
    int  data[100];

    printf("How many numbers? ");
    scanf("%d", &n);
    if (n < 1 || n > 100) { puts("Out of range."); return 1; }

    printf("Enter %d integers: ", n);
    for (int i = 0; i < n; i++) {
        scanf("%d", &data[i]);
    }

    long sum = 0;
    int  min = data[0], max = data[0];
    for (int i = 0; i < n; i++) {
        sum += data[i];
        if (data[i] < min) min = data[i];
        if (data[i] > max) max = data[i];
    }

    printf("sum=%ld  min=%d  max=%d  avg=%.2f\n",
           sum, min, max, (double)sum / n);
    return 0;
}
```
