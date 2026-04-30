---
title: C++ While Loop
---

# C++ While Loop

A `while` loop repeats a block of code **as long as** a condition is true.

## Syntax

```cpp
while (condition) {
    // body
}
```

Example: count down from 5.

```cpp
int n = 5;
while (n > 0) {
    std::cout << n << '\n';
    --n;
}
std::cout << "Lift off!\n";
```

Output:

```
5
4
3
2
1
Lift off!
```

The condition is checked **before** every iteration. If it is false the first time, the body never runs.

## Components of every loop

Three things make a loop terminate:

1. **Initialize** the loop variable (before the loop).
2. **Test** in the condition (when to stop).
3. **Update** the variable inside the loop body (move toward termination).

Forgetting (3) is the #1 cause of infinite loops:

```cpp
int n = 5;
while (n > 0) {
    std::cout << n << '\n';
    // forgot --n;  → infinite loop!
}
```

## `do ... while`

A `do/while` loop checks the condition **after** the body, so it runs **at least once**.

```cpp
int input;
do {
    std::cout << "Enter a positive number: ";
    std::cin >> input;
} while (input <= 0);
```

Use it when the body must execute before the condition can be evaluated meaningfully (typical for input prompts).

## Sentinel-controlled loops

Read until a special "sentinel" value:

```cpp
int n;
while (std::cin >> n && n != -1) {
    std::cout << "got " << n << '\n';
}
```

The condition `std::cin >> n` is `false` if input fails (EOF or non-integer), giving a graceful exit on bad input.

## Infinite loops on purpose

Sometimes you want to loop forever and exit by `break`:

```cpp
while (true) {
    if (shouldStop()) break;
    doWork();
}
```

This is common in event loops and command interpreters.

## `break` and `continue`

- `break` immediately exits the **innermost** loop.
- `continue` skips the rest of the body and re-evaluates the condition.

```cpp
int i = 0;
while (i < 10) {
    ++i;
    if (i % 2 == 0) continue; // skip evens
    if (i > 7)      break;    // stop at >7
    std::cout << i << ' ';
}
// prints: 1 3 5 7
```

## Common patterns

### Sum of inputs

```cpp
int x, total = 0;
while (std::cin >> x) total += x;
std::cout << "Sum = " << total << '\n';
```

### Find the first element matching a condition

```cpp
size_t i = 0;
while (i < v.size() && v[i] != target) ++i;
if (i < v.size()) std::cout << "Found at index " << i << '\n';
```

## Putting it together

```cpp
#include <iostream>

int main() {
    // Compute the digital root: keep summing digits until one digit remains.
    int n;
    std::cout << "Enter a non-negative integer: ";
    std::cin >> n;

    while (n >= 10) {
        int sum = 0;
        int x   = n;
        while (x > 0) {
            sum += x % 10;
            x   /= 10;
        }
        n = sum;
    }
    std::cout << "Digital root: " << n << '\n';
    return 0;
}
```

Sample run:

```
Enter a non-negative integer: 9875
Digital root: 2          (9+8+7+5=29 → 2+9=11 → 1+1=2)
```
