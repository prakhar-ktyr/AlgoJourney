---
title: Java For Loop
---

# Java For Loop

The `for` loop is the go-to loop when you know how many times to iterate.

## Classic `for`

```java
for (init; condition; update) {
    // body
}
```

- **`init`** runs once before the loop starts.
- **`condition`** is checked before each iteration; the loop ends when it becomes `false`.
- **`update`** runs after each iteration.

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

```
0
1
2
3
4
```

The loop variable `i` is **scoped to the loop** — it does not exist after the closing brace.

## Counting down

```java
for (int i = 10; i > 0; i--) {
    System.out.println(i);
}
```

## Step by more than one

```java
for (int i = 0; i <= 20; i += 2) {
    System.out.print(i + " ");   // 0 2 4 6 8 10 12 14 16 18 20
}
```

## Multiple variables

```java
for (int i = 0, j = 10; i < j; i++, j--) {
    System.out.println(i + " " + j);
}
```

## Empty parts

Any of the three parts can be omitted:

```java
int i = 0;
for ( ; i < 5; ) {
    System.out.println(i);
    i++;
}
```

`for (;;) { ... }` is an infinite loop (equivalent to `while (true)`).

## Enhanced `for` (for-each)

When you want to iterate over every element of an array or collection, prefer the **for-each** form:

```java
int[] nums = {3, 1, 4, 1, 5, 9, 2, 6};
for (int n : nums) {
    System.out.println(n);
}
```

```java
List<String> names = List.of("Ada", "Linus", "Grace");
for (String name : names) {
    System.out.println(name);
}
```

The for-each loop is read as: _"for each `n` in `nums` …"_. It hides the index — use the classic `for` if you actually need the index.

## Nested loops

Loops can contain loops. A multiplication table:

```java
for (int row = 1; row <= 5; row++) {
    for (int col = 1; col <= 5; col++) {
        System.out.printf("%4d", row * col);
    }
    System.out.println();
}
```

```
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25
```

## Common pitfalls

### Off-by-one errors

```java
for (int i = 0; i <= nums.length; i++)   // ❌ overshoots by one (uses ≤)
for (int i = 0; i < nums.length;  i++)   // ✅
```

### Modifying a collection while iterating

```java
for (String s : list) {
    if (s.isEmpty()) list.remove(s);    // ❌ ConcurrentModificationException
}
```

Use an `Iterator` directly with `iterator.remove()`, or `list.removeIf(String::isEmpty)`.

## A complete example

```java
public class Pyramid {
    public static void main(String[] args) {
        int n = 5;
        for (int row = 1; row <= n; row++) {
            for (int s = 0; s < n - row; s++) System.out.print(' ');
            for (int c = 0; c < 2 * row - 1; c++) System.out.print('*');
            System.out.println();
        }
    }
}
```

```
    *
   ***
  *****
 *******
*********
```

Next: **`break` and `continue`**.
