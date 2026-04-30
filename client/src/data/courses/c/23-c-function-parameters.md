---
title: C Function Parameters
---

# C Function Parameters

C is a **pass-by-value** language: every argument you pass to a function is **copied** into the corresponding parameter. To change a caller's variable, you must pass its address.

## Pass by value

```c
void increment(int n) {
    n = n + 1;        // modifies the local copy
}

int main(void) {
    int x = 10;
    increment(x);
    printf("%d\n", x);   // 10 — unchanged
    return 0;
}
```

The function received a *copy* of `x`. Any change inside `increment` died with the function.

## Pass by reference (via pointer)

To modify the caller's variable, take a pointer:

```c
void increment(int *n) {
    *n = *n + 1;       // dereference and modify
}

int main(void) {
    int x = 10;
    increment(&x);     // pass the address
    printf("%d\n", x); // 11
    return 0;
}
```

Same pattern as `scanf("%d", &x)` — pass the **address** so the function can write back through it.

## Passing arrays

When you pass an array, what's actually passed is a **pointer to the first element** — the array "decays." These three signatures are equivalent:

```c
void f(int *arr, int n);
void f(int  arr[], int n);
void f(int  arr[10], int n);
```

So inside the function, `sizeof(arr)` is the **pointer size**, not the array size. You must always pass the length separately:

```c
int sum(const int *arr, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) s += arr[i];
    return s;
}

int main(void) {
    int data[] = { 1, 2, 3, 4, 5 };
    int n = sizeof data / sizeof data[0];   // computed in caller, where it's still an array
    printf("%d\n", sum(data, n));            // 15
    return 0;
}
```

The `const` says "I won't modify the array" — good documentation, and the compiler will catch accidents.

## 2-D arrays

For multi-dimensional arrays, all dimensions **except the first** must be specified:

```c
void print_grid(int rows, int g[][4]) {
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < 4; c++) {
            printf("%d ", g[r][c]);
        }
        putchar('\n');
    }
}
```

C99 allows variable-size dimensions if you pass them first:

```c
void print_grid(int rows, int cols, int g[rows][cols]) { ... }
```

## Passing strings

Since strings are arrays of `char`, you pass a pointer:

```c
size_t my_strlen(const char *s) {
    size_t len = 0;
    while (s[len] != '\0') len++;
    return len;
}
```

`const char *` is the canonical "I will not modify this string" parameter.

## Returning multiple values

C functions return one value, but you can return more by using **output pointers**:

```c
void divmod(int a, int b, int *quotient, int *remainder) {
    *quotient  = a / b;
    *remainder = a % b;
}

int main(void) {
    int q, r;
    divmod(17, 5, &q, &r);
    printf("17 / 5 = %d remainder %d\n", q, r);
    return 0;
}
```

Or return a `struct` (covered in the **Structures** lesson):

```c
typedef struct { int q, r; } DivResult;
DivResult divmod(int a, int b) { return (DivResult){ a / b, a % b }; }
```

## Default arguments? (No.)

C does **not** support default parameter values. Every argument must be passed explicitly. The closest you can get:

```c
void log_msg(const char *level, const char *msg);

#define log_info(msg) log_msg("INFO", (msg))   // wrapper macro
```

## Variable number of arguments — variadic

A function like `printf` accepts any number of arguments. You declare such a function with `...`:

```c
#include <stdarg.h>
#include <stdio.h>

int sum_all(int count, ...) {
    va_list ap;
    va_start(ap, count);
    int total = 0;
    for (int i = 0; i < count; i++) {
        total += va_arg(ap, int);
    }
    va_end(ap);
    return total;
}

int main(void) {
    printf("%d\n", sum_all(4, 10, 20, 30, 40));   // 100
    return 0;
}
```

Variadic functions are useful but error-prone — there's no compile-time type checking on the variadic args. Use sparingly.

## Function pointers — passing behavior

You can pass a **function** to a function. The parameter type is "pointer to function":

```c
void apply(int *arr, int n, int (*op)(int)) {
    for (int i = 0; i < n; i++) {
        arr[i] = op(arr[i]);
    }
}

int square(int x) { return x * x; }
int negate(int x) { return -x; }

int main(void) {
    int data[] = { 1, 2, 3, 4 };
    apply(data, 4, square);
    /* data is now { 1, 4, 9, 16 } */
    apply(data, 4, negate);
    /* data is now { -1, -4, -9, -16 } */
    return 0;
}
```

The standard library uses this for `qsort`, `bsearch`, signal handlers, etc.

## Recap

| Want to … | Pass as |
|-----------|---------|
| Read a value | `int x` |
| Modify the caller's variable | `int *x` |
| Read an array | `const int *arr, int n` |
| Modify an array | `int *arr, int n` |
| Read a string | `const char *s` |
| Get a return value back | use the function's return type |
| Get multiple values back | output pointers (`int *out1, int *out2`) or a struct |
