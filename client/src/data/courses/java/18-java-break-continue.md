---
title: Java Break and Continue
---

# Java Break and Continue

`break` and `continue` change the normal flow of a loop.

## `break` — exit a loop early

```java
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    System.out.println(i);
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

`break` jumps out of the **innermost** `for`, `while`, `do...while`, or `switch`.

### Search example

```java
int[] nums = {3, 1, 4, 1, 5, 9, 2, 6};
int target = 5;
int found = -1;

for (int i = 0; i < nums.length; i++) {
    if (nums[i] == target) {
        found = i;
        break;
    }
}
System.out.println(found);   // 4
```

## `continue` — skip to the next iteration

`continue` jumps directly to the loop's update step (or condition check, in `while`).

```java
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;   // skip even numbers
    System.out.println(i);
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

## Labeled `break` and `continue`

By default `break` exits only the innermost loop. To exit several nested loops, use a **label**:

```java
outer:
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (i * j > 6) {
            System.out.println("stopping at " + i + "," + j);
            break outer;
        }
    }
}
```

Without `break outer`, only the inner loop would exit and the outer loop would keep going.

`continue label;` jumps to the next iteration of the labeled loop:

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;
        System.out.println(i + "," + j);
    }
}
```

Labels are powerful but can hurt readability. Often a small refactor (extract a method, return early) is cleaner. Use them sparingly.

## `break` in `switch`

We already saw this in the **switch** lesson — `break` exits the `switch` to prevent fall-through. The arrow form `case ... ->` doesn't need it.

## A complete example

```java
public class FirstPrimes {
    public static void main(String[] args) {
        int n = 10;
        int found = 0;
        int candidate = 2;

        while (found < n) {
            boolean prime = true;
            for (int d = 2; d * d <= candidate; d++) {
                if (candidate % d == 0) {
                    prime = false;
                    break;
                }
            }
            if (prime) {
                System.out.print(candidate + " ");
                found++;
            }
            candidate++;
        }
    }
}
```

Output:

```
2 3 5 7 11 13 17 19 23 29
```

Next: **arrays**.
