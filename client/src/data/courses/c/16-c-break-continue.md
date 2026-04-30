---
title: C Break and Continue
---

# C Break and Continue

`break` and `continue` are two small keywords that change how a loop flows.

## `break`

`break` exits the **innermost** loop (or `switch`) immediately:

```c
for (int i = 0; i < 100; i++) {
    if (i == 5) {
        break;       // jump out of the for loop
    }
    printf("%d\n", i);
}
puts("done");
```

Output:

```
0
1
2
3
4
done
```

### Searching with `break`

A typical use — stop as soon as you find what you're looking for:

```c
int target = 7;
int found_at = -1;

for (int i = 0; i < n; i++) {
    if (arr[i] == target) {
        found_at = i;
        break;
    }
}

if (found_at >= 0) printf("found at %d\n", found_at);
else               puts("not found");
```

### Reading until a sentinel value

```c
int x;
while (scanf("%d", &x) == 1) {
    if (x == -1) break;     // stop when user enters -1
    printf("got %d\n", x);
}
```

## `continue`

`continue` skips the rest of the **current** iteration and jumps to the loop's update / condition step:

```c
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;    // skip evens
    printf("%d\n", i);
}
```

Output:

```
1
3
5
7
9
```

### `continue` in `while`

In a `while` or `do-while`, `continue` jumps straight to the condition test — be sure your loop variable still advances, or you'll get an infinite loop:

```c
int i = 0;
while (i < 10) {
    if (i == 3) continue;     // ❌ infinite loop — i never reaches 4
    i++;
}
```

A safer rewrite:

```c
int i = 0;
while (i < 10) {
    i++;
    if (i == 3) continue;
    /* ... */
}
```

## `break` only breaks one level

There is no `break 2` to escape from nested loops. The C-idiomatic ways to break out of multiple loops are:

**1. A flag variable:**

```c
bool done = false;
for (int i = 0; i < n && !done; i++) {
    for (int j = 0; j < m; j++) {
        if (matrix[i][j] == target) {
            done = true;
            break;
        }
    }
}
```

**2. Refactor into a function:**

```c
int find(int matrix[][M], int n, int target) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < M; j++) {
            if (matrix[i][j] == target) return i;
        }
    }
    return -1;
}
```

A `return` walks straight out of all enclosing loops.

**3. `goto`** — yes, really. Used sparingly for breaking out of deep loops, `goto label;` is considered acceptable in C:

```c
for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        if (matrix[i][j] == target) {
            goto found;
        }
    }
}
found:
/* handle the result */
```

`goto` has a bad reputation, but for "leave several nested loops" it's idiomatic in C.

## `break` in `switch`

You already saw `break` in the **Switch** lesson. A `break` ends the current `case`. A `continue` does **not** affect a switch — if a switch is inside a loop, `continue` applies to the loop, not the switch.

## Putting it together — prime sieve fragment

```c
#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int n = 30;

    for (int x = 2; x <= n; x++) {
        bool prime = true;
        for (int d = 2; d * d <= x; d++) {
            if (x % d == 0) {
                prime = false;
                break;          // no need to keep checking
            }
        }
        if (!prime) continue;   // skip non-primes
        printf("%d ", x);
    }
    putchar('\n');
    return 0;
}
```

Output:

```
2 3 5 7 11 13 17 19 23 29
```
