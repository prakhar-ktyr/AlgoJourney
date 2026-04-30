---
title: C Recursion
---

# C Recursion

A function that **calls itself** is **recursive**. Recursion is a powerful tool for problems that can be defined in terms of smaller versions of the same problem.

## The mental model

Every recursive function needs:

1. A **base case** — a stopping condition that does **not** recurse.
2. A **recursive case** — a call to itself with a "smaller" argument that moves toward the base case.

Without a base case, recursion never stops and you crash with a **stack overflow**.

## Classic example — factorial

`n! = n × (n-1) × (n-2) × … × 1`

```c
unsigned long factorial(int n) {
    if (n <= 1) return 1;             // base case
    return n * factorial(n - 1);      // recursive case
}

int main(void) {
    for (int i = 0; i <= 6; i++) {
        printf("%d! = %lu\n", i, factorial(i));
    }
    return 0;
}
```

Output:

```
0! = 1
1! = 1
2! = 2
3! = 6
4! = 24
5! = 120
6! = 720
```

What happens for `factorial(3)`? The function calls itself, building up a stack of pending multiplications:

```
factorial(3)
 → 3 * factorial(2)
        → 2 * factorial(1)
               → 1            ← base case
        → 2 * 1     = 2
 → 3 * 2     = 6
```

Each call gets its own copy of `n` on the **call stack**. When the base case returns, each pending call resolves in reverse order.

## Another example — Fibonacci

```c
unsigned long fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}
```

This is **mathematically pretty** but **catastrophically slow** — `fib(40)` does over a billion calls because the same subproblems get recomputed. We'll see how to fix this in the dynamic-programming course.

## Recursion vs iteration

Anything you can do with recursion you can do with a loop, and vice versa. They differ in:

- **Readability** — recursion is natural for tree-like data and divide-and-conquer algorithms.
- **Stack usage** — each recursive call costs stack space; deep recursion can crash.
- **Speed** — function calls have overhead; iteration is usually faster.

For most simple counting tasks, prefer iteration:

```c
unsigned long factorial(int n) {
    unsigned long r = 1;
    for (int i = 2; i <= n; i++) r *= i;
    return r;
}
```

Reach for recursion when the problem really is recursive — tree traversal, parsing, divide-and-conquer.

## Tail recursion

A **tail call** is when the recursive call is the *very last* thing the function does — no work happens after it returns:

```c
unsigned long fact_tail(int n, unsigned long acc) {
    if (n <= 1) return acc;
    return fact_tail(n - 1, acc * n);     // tail call
}

unsigned long factorial(int n) { return fact_tail(n, 1); }
```

Some compilers optimize tail calls into loops (no extra stack frame). The C standard doesn't require this, but `-O2` with GCC and Clang often does it.

## Mutual recursion

Two functions can call each other:

```c
bool is_even(int n);
bool is_odd(int n);

bool is_even(int n) { return n == 0 ? true  : is_odd(n - 1); }
bool is_odd(int n)  { return n == 0 ? false : is_even(n - 1); }
```

Note the forward declaration of `is_odd` — without it, `is_even`'s call wouldn't compile.

## Divide and conquer — recursive binary search

```c
int bsearch_rec(const int *arr, int lo, int hi, int target) {
    if (lo > hi) return -1;                  // base: empty range
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] <  target) return bsearch_rec(arr, mid + 1, hi, target);
    /* else */              return bsearch_rec(arr, lo, mid - 1, target);
}
```

The problem shrinks by half each call — at most `log2(n)` deep, so the stack is fine even for huge arrays.

## Tree traversal

Recursion *shines* for tree-shaped data:

```c
typedef struct Node {
    int value;
    struct Node *left, *right;
} Node;

void inorder(const Node *n) {
    if (n == NULL) return;
    inorder(n->left);
    printf("%d ", n->value);
    inorder(n->right);
}
```

Compare that to writing the same with an explicit stack — the recursive version is dramatically clearer.

## Pitfalls

1. **Missing base case** → stack overflow.
2. **Recursive case doesn't shrink the problem** → stack overflow.

   ```c
   void bad(int n) {
       if (n == 0) return;
       bad(n);                  // never moves toward 0!
   }
   ```

3. **Deep recursion** — typical stacks are 1–8 MB. Recursing a million levels deep will crash; use iteration or an explicit stack data structure.
4. **Repeated work** — naive recursion can recompute the same subproblem exponentially many times (see the Fibonacci example). Use **memoization** or convert to bottom-up iteration.

## Putting it together — sum of digits

```c
#include <stdio.h>

int sum_digits(int n) {
    if (n < 0) n = -n;
    if (n < 10) return n;
    return n % 10 + sum_digits(n / 10);
}

int main(void) {
    int x = 12345;
    printf("sum_digits(%d) = %d\n", x, sum_digits(x));
    return 0;
}
```

Output:

```
sum_digits(12345) = 15
```
