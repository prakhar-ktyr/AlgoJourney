---
title: C Pointers
---

# C Pointers

Pointers are the **defining feature of C**. They are also the feature that scares newcomers the most. The good news: once you understand the two operators `&` and `*`, you understand pointers.

## What is a pointer?

A pointer is a variable whose **value is the memory address** of another variable.

```c
int  x  = 42;
int *p  = &x;     // p holds the address of x
```

Read `int *p` as: "`p` is a pointer to an `int`."

```
        x                p
    ┌────────┐       ┌──────────┐
    │   42   │ ◄──── │ &x = 0x10 │
    └────────┘       └──────────┘
   address 0x10        address 0x18
```

## The two operators

- `&` — **address-of**: returns the address of a variable. `&x`
- `*` — **dereference**: returns the value at an address. `*p`

```c
int  x = 42;
int *p = &x;

printf("%p\n", (void*)p);   // 0x10  (the address)
printf("%d\n", *p);          // 42    (the value at that address)

*p = 99;                     // write THROUGH the pointer
printf("%d\n", x);           // 99 — modified via p
```

The two operators are inverses: `*(&x) == x`.

## Pointer types must match the pointee type

```c
int    i = 10;
double d = 3.14;

int    *pi = &i;     // ✅
double *pd = &d;     // ✅

int    *bad = &d;    // ❌ wrong type — int* cannot point to a double
```

Why does the type matter? Because the pointer needs to know how many bytes the pointee occupies. `*pi` reads 4 bytes; `*pd` reads 8.

## The null pointer — `NULL`

A pointer that doesn't point anywhere should be `NULL`:

```c
int *p = NULL;

if (p != NULL) {
    *p = 42;          // safe — only dereference when non-NULL
}
```

`NULL` is `((void*)0)` — an obviously invalid address. **Dereferencing NULL is undefined behavior** and almost always a crash. C23 introduces a `nullptr` keyword similar to C++.

## Pointers and functions — pass-by-reference

C is **pass-by-value** — every argument is copied into the function's local parameter. So this swap function does NOTHING:

```c
void bad_swap(int a, int b) {        // a, b are local copies
    int t = a; a = b; b = t;         // swaps the copies — caller is unaffected
}
```

To modify caller variables, pass their **addresses**:

```c
void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("%d %d\n", x, y);   // 2 1
    return 0;
}
```

This is the same pattern `scanf("%d", &n)` uses — you give it the address so it can write to your variable.

## Pointers and arrays — they're cousins

In most expressions, an array name **decays** into a pointer to its first element:

```c
int  arr[5] = { 10, 20, 30, 40, 50 };
int *p      = arr;          // same as &arr[0]

printf("%d\n", p[0]);       // 10
printf("%d\n", p[2]);       // 30
printf("%d\n", *(p + 2));   // 30 — the same thing
```

That equivalence is why `arr[i]` and `*(arr + i)` mean the same thing — and yes, `i[arr]` also compiles and works (don't actually do this).

The differences:

- `sizeof(arr)` → 20 (`5 * sizeof(int)`).
- `sizeof(p)` → 8 (the pointer's own size).
- `&arr` is `int (*)[5]` (pointer to array of 5), `&p` is `int **`.

## Pointer arithmetic

Adding `1` to a pointer advances it by **one element**, not one byte:

```c
int  arr[3] = { 100, 200, 300 };
int *p = arr;

printf("%d\n", *p);        // 100
p++;                       // advance one int (4 bytes on most platforms)
printf("%d\n", *p);        // 200
```

The compiler knows how big `*p` is and scales for you. Subtraction works too — `&arr[3] - &arr[0]` is `3`, not `12`.

You can iterate an array with pointer arithmetic instead of indices:

```c
int arr[] = { 1, 2, 3, 4, 5 };
int *end = arr + 5;

for (int *p = arr; p < end; p++) {
    printf("%d\n", *p);
}
```

Pointer arithmetic is only defined within a single array (and one past the end). Wandering anywhere else is undefined behavior.

## `const` with pointers

Three flavors, read **right to left**:

```c
const int *p1;     // pointer to const int — *p1 = 5; ❌ but p1 = &y; ✅
int * const p2;    // const pointer to int — *p2 = 5; ✅ but p2 = &y; ❌
const int * const p3;   // both const
```

Use `const int *` for parameters that you only **read**:

```c
size_t safe_strlen(const char *s) { ... }
```

It documents intent and lets callers pass `const` strings.

## `void *` — the generic pointer

A `void *` can hold any object pointer. You can't dereference it directly — you must cast first:

```c
int  x = 42;
void *gp = &x;
int *p   = (int*)gp;
printf("%d\n", *p);    // 42
```

`malloc`, `memcpy`, and friends use `void *` so they can accept any type.

## Pointers to pointers

Yes, a pointer can point to another pointer. Common when a function needs to modify a pointer (not just the thing it points to):

```c
void make_array(int **out, int n) {
    *out = malloc(n * sizeof **out);
}

int main(void) {
    int *arr = NULL;
    make_array(&arr, 10);
    /* ... */
    free(arr);
}
```

## Common pitfalls

1. **Dereferencing an uninitialized pointer:**

   ```c
   int *p;
   *p = 5;          // ❌ p is garbage — crash or memory corruption
   ```

2. **Dangling pointer** — using a pointer after the thing it points to no longer exists:

   ```c
   int *p;
   {
       int x = 5;
       p = &x;
   }
   printf("%d\n", *p);   // ❌ x is gone
   ```

3. **Forgetting `&` in `scanf`:**

   ```c
   int n;
   scanf("%d", n);   // ❌ should be &n — likely crash
   ```

4. **Returning a pointer to a local variable:**

   ```c
   int *bad(void) {
       int x = 42;
       return &x;     // ❌ x dies when the function returns
   }
   ```

## Putting it together

```c
#include <stdio.h>

void array_max_min(const int *arr, int n, int *max_out, int *min_out) {
    int max = arr[0], min = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    *max_out = max;
    *min_out = min;
}

int main(void) {
    int data[] = { 3, 1, 4, 1, 5, 9, 2, 6 };
    int n = sizeof data / sizeof data[0];
    int max, min;

    array_max_min(data, n, &max, &min);
    printf("max = %d, min = %d\n", max, min);
    return 0;
}
```

Output:

```
max = 9, min = 1
```

A function returning two values "by reference" via output pointers — a hallmark of idiomatic C.
