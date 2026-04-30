---
title: C For Loop
---

# C For Loop

The `for` loop is the workhorse of C. Use it whenever you know — or want to express clearly — exactly how many times you're going to iterate.

## Syntax

```c
for (init; condition; update) {
    // body
}
```

The three parts:

1. **init** — runs **once**, before the loop starts. Usually a variable declaration.
2. **condition** — checked **before** every iteration. Loop ends when this is false.
3. **update** — runs **after** every iteration, then the condition is checked again.

It's exactly equivalent to:

```c
init;
while (condition) {
    // body
    update;
}
```

## The canonical "n times" loop

```c
for (int i = 0; i < 5; i++) {
    printf("%d\n", i);
}
```

Output:

```
0
1
2
3
4
```

Notice that `i` is **declared inside** the `for` (a C99 feature). Its scope is the loop — it doesn't exist outside.

## Counting down

```c
for (int i = 10; i > 0; i--) {
    printf("%d\n", i);
}
```

## Custom step

```c
for (int i = 0; i < 100; i += 10) {
    printf("%d\n", i);    // 0 10 20 30 ... 90
}
```

## Iterating an array

The most common use of `for`:

```c
int nums[] = { 5, 2, 8, 1, 9 };
int n = sizeof(nums) / sizeof(nums[0]);

int sum = 0;
for (int i = 0; i < n; i++) {
    sum += nums[i];
}
printf("sum = %d\n", sum);
```

The `sizeof(nums) / sizeof(nums[0])` trick computes the array length at compile time — it works **only** when `nums` is a true array, not a pointer.

## Multiple init / update expressions — the comma operator

You can run more than one expression in `init` or `update` with `,`:

```c
for (int i = 0, j = 10; i < j; i++, j--) {
    printf("i=%d j=%d\n", i, j);
}
```

Use this sparingly; it's easy to abuse.

## Empty parts

Any of the three sections can be empty (but the semicolons are required):

```c
for (;;) {                 // infinite loop
    /* ... */
}

int i = 0;
for (; i < 5; i++) { ... } // init done elsewhere
```

## Nested loops

Looping inside a loop is how you walk a 2-D structure:

```c
for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 4; col++) {
        printf("(%d,%d) ", row, col);
    }
    putchar('\n');
}
```

Output:

```
(0,0) (0,1) (0,2) (0,3)
(1,0) (1,1) (1,2) (1,3)
(2,0) (2,1) (2,2) (2,3)
```

For an n×m grid the body runs **n × m** times — keep that in mind for performance.

## When `for` shines

A `for` loop puts the **counter, the bound, and the step all in one place** at the top. A reader can instantly see what the loop does. Compare:

```c
// Easy to read:
for (int i = 0; i < n; i++) {
    process(arr[i]);
}

// Same loop, harder to read:
int i = 0;
while (i < n) {
    process(arr[i]);
    i++;
}
```

Reach for `while` only when the loop's "size" depends on dynamic conditions like reading from a stream.

## Common mistakes

1. **Off-by-one** — `i < n` vs `i <= n`. For arrays of length `n`, valid indices are `0` to `n-1`, so use `<`.
2. **Modifying the loop variable inside the body** — usually a bug; if you really mean it, document it.
3. **Forgetting the increment** — instant infinite loop:

   ```c
   for (int i = 0; i < n; ) {       // missing i++
       printf("%d\n", i);
   }
   ```

4. **Using floats as loop counters** — accumulated rounding error makes the condition unreliable. Use an integer counter and convert.

## A complete example — multiplication table

```c
#include <stdio.h>

int main(void) {
    const int N = 9;

    printf("    ");
    for (int c = 1; c <= N; c++) printf("%4d", c);
    putchar('\n');

    for (int r = 1; r <= N; r++) {
        printf("%2d :", r);
        for (int c = 1; c <= N; c++) {
            printf("%4d", r * c);
        }
        putchar('\n');
    }
    return 0;
}
```

Output:

```
       1   2   3   4   5   6   7   8   9
 1 :   1   2   3   4   5   6   7   8   9
 2 :   2   4   6   8  10  12  14  16  18
 3 :   3   6   9  12  15  18  21  24  27
...
```
