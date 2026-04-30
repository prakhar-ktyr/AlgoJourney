---
title: Java While Loop
---

# Java While Loop

A loop runs a block of code repeatedly. The `while` loop runs as long as a condition stays `true`.

## `while`

```java
while (condition) {
    // body
}
```

The condition is checked **before** each iteration. If it's `false` the very first time, the body never runs.

```java
int i = 0;
while (i < 5) {
    System.out.println(i);
    i++;
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

## `do ... while`

The body runs **at least once**, then the condition is checked.

```java
int i = 10;
do {
    System.out.println(i);
    i++;
} while (i < 5);
```

Output: `10` (body ran once, then exited).

Use `do ... while` when the very first iteration should always happen — for example, prompting a user _until_ they give valid input:

```java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);
int n;
do {
    System.out.print("Enter a positive number: ");
    n = sc.nextInt();
} while (n <= 0);
```

## Beware infinite loops

If the condition never becomes `false`, the loop never ends:

```java
int i = 0;
while (i < 5) {
    System.out.println(i);
    // forgot i++  →  prints 0 forever!
}
```

Use `Ctrl-C` to terminate a runaway program.

A deliberate infinite loop is sometimes useful — exit with `break`:

```java
while (true) {
    String line = readLine();
    if (line == null) break;
    process(line);
}
```

## Common patterns

### Counting

```java
int sum = 0;
int i = 1;
while (i <= 100) {
    sum += i;
    i++;
}
System.out.println(sum);   // 5050
```

### Reading input until sentinel

```java
Scanner sc = new Scanner(System.in);
while (sc.hasNextInt()) {
    int n = sc.nextInt();
    System.out.println(n * n);
}
```

### Searching

```java
int[] nums = {3, 1, 4, 1, 5, 9, 2, 6};
int target = 5;
int idx = 0;
boolean found = false;
while (idx < nums.length && !found) {
    if (nums[idx] == target) found = true;
    else                      idx++;
}
System.out.println(found ? "at index " + idx : "not found");
```

## `while` vs `for`

When the loop is driven by a counter known up front, **`for`** (next lesson) is more idiomatic. When the number of iterations depends on a runtime condition (input, search, simulation), `while` is the natural choice.

Next: the **`for`** loop.
