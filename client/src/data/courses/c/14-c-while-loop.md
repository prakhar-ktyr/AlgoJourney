---
title: C While Loop
---

# C While Loop

A loop runs the same block of code repeatedly. C has three loop constructs: `while`, `do ... while`, and `for`. This lesson covers the first two.

## `while` loop

```c
while (condition) {
    // body — runs as long as condition is true
}
```

The condition is checked **before** each iteration; if it's false to begin with, the body never runs.

```c
int i = 0;
while (i < 5) {
    printf("i = %d\n", i);
    i++;
}
```

Output:

```
i = 0
i = 1
i = 2
i = 3
i = 4
```

### Reading until end-of-file

A common pattern — keep reading lines until input runs out:

```c
char line[256];
while (fgets(line, sizeof line, stdin) != NULL) {
    printf("got: %s", line);
}
```

`fgets` returns `NULL` at end-of-file, ending the loop.

### Searching

```c
int find(int *arr, int n, int target) {
    int i = 0;
    while (i < n && arr[i] != target) {
        i++;
    }
    return (i < n) ? i : -1;
}
```

## `do ... while` loop

Sometimes you want the body to run **at least once** before the condition is checked. That's `do ... while`:

```c
do {
    // body
} while (condition);    /* note the trailing semicolon */
```

Classic use — re-prompting until the user enters something valid:

```c
int n;
do {
    printf("Enter a positive number: ");
    scanf("%d", &n);
} while (n <= 0);
```

## Infinite loops

A loop with a condition that never becomes false runs forever:

```c
while (1) {
    /* server main loop, embedded firmware, ... */
}
```

You exit such a loop with `break` or `return`. Some style guides spell it `for (;;)` instead — pick one and stick with it.

## `break` and `continue`

- `break` — leave the loop immediately.
- `continue` — skip the rest of this iteration; check the condition again.

```c
int i = 0;
while (i < 100) {
    i++;
    if (i % 2 == 0) continue;     // skip evens
    if (i > 10)     break;        // stop after 10
    printf("%d\n", i);
}
```

Both are covered in more detail in the **Break and Continue** lesson.

## Common mistakes

1. **Forgetting to update the loop variable** — instant infinite loop:

   ```c
   int i = 0;
   while (i < 5) {
       printf("%d\n", i);
       /* forgot i++; */
   }
   ```

2. **Off-by-one errors** — `i <= n` vs `i < n`. Decide what you really mean and stick to it. Most C loops use `i < n`.

3. **Modifying the condition variable inside the body in a confusing way:**

   ```c
   while (n > 0) {
       n -= 2;
       if (something) n += 5;       // 🤔 hard to reason about — does this end?
   }
   ```

## A complete example — Collatz sequence

The Collatz conjecture: pick any positive integer; if it's even, halve it; if odd, multiply by 3 and add 1. Repeat. Conjecture says you always end up at 1.

```c
#include <stdio.h>

int main(void) {
    long n;
    printf("Start: ");
    scanf("%ld", &n);

    long steps = 0;
    while (n != 1) {
        printf("%ld -> ", n);
        if (n % 2 == 0) n /= 2;
        else            n = 3 * n + 1;
        steps++;
    }
    printf("1\n(%ld steps)\n", steps);
    return 0;
}
```

```
Start: 27
27 -> 82 -> 41 -> ... -> 2 -> 1
(111 steps)
```
