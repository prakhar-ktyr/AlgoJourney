---
title: C++ For Loop
---

# C++ For Loop

A `for` loop bundles **initialization, condition, and update** into one line. Use it when you know how many iterations you need or when you're walking over an index range.

## Classic syntax

```cpp
for (init; condition; update) {
    // body
}
```

Example: print 1 to 10.

```cpp
for (int i = 1; i <= 10; ++i) {
    std::cout << i << ' ';
}
```

Equivalent `while` form:

```cpp
int i = 1;
while (i <= 10) {
    std::cout << i << ' ';
    ++i;
}
```

The `for` is more compact and keeps `i` scoped to the loop.

## Iteration order

1. `init` runs once before the loop.
2. `condition` is evaluated; if false, the loop ends.
3. The body runs.
4. `update` runs.
5. Go to step 2.

## Counting down

```cpp
for (int i = 10; i > 0; --i) {
    std::cout << i << ' ';
}
```

## Stepping by more than one

```cpp
for (int i = 0; i <= 100; i += 10) {
    std::cout << i << ' '; // 0 10 20 ... 100
}
```

## Iterating containers (range-based for, C++11)

This is the cleanest way to walk a container:

```cpp
#include <vector>
std::vector<int> v{10, 20, 30, 40};

for (int x : v) {
    std::cout << x << ' ';
}
```

Use a **reference** to avoid copies (and to allow modification):

```cpp
for (int& x : v) {
    x *= 2; // modifies elements in place
}

for (const auto& x : v) { // read-only access, no copy
    std::cout << x << ' ';
}
```

`auto&` lets the compiler deduce the right reference type — invaluable for complex container element types.

## Iterating with index and value (C++23 `views::enumerate`)

```cpp
#include <ranges>
for (auto [i, v] : std::views::enumerate(vec)) {
    std::cout << i << ": " << v << '\n';
}
```

For older standards, use a classic `for` with an index.

## Multiple variables

You can declare and update multiple variables:

```cpp
for (int i = 0, j = 10; i < j; ++i, --j) {
    std::cout << i << '+' << j << " = " << (i + j) << '\n';
}
```

## Nested loops

Loops inside loops handle 2-D problems:

```cpp
for (int row = 1; row <= 3; ++row) {
    for (int col = 1; col <= 3; ++col) {
        std::cout << row * col << '\t';
    }
    std::cout << '\n';
}
```

Output:

```
1   2   3
2   4   6
3   6   9
```

## Empty parts

Any of the three sections can be omitted:

```cpp
for (;;) {       // infinite loop, equivalent to while (true)
    if (done) break;
}
```

## `break` and `continue`

Same as in `while`:

- `break` exits the loop.
- `continue` jumps to the update step.

```cpp
for (int i = 0; i < 10; ++i) {
    if (i == 3) continue; // skip 3
    if (i == 7) break;    // stop before 7
    std::cout << i << ' ';
}
// prints: 0 1 2 4 5 6
```

## Putting it together

```cpp
#include <iostream>
#include <vector>

int main() {
    // Build a vector of squares from 1..10.
    std::vector<int> squares;
    for (int i = 1; i <= 10; ++i) squares.push_back(i * i);

    // Print them with their index.
    for (size_t i = 0; i < squares.size(); ++i) {
        std::cout << i + 1 << "² = " << squares[i] << '\n';
    }

    // Sum them with a range-based for.
    int total = 0;
    for (int s : squares) total += s;
    std::cout << "Sum = " << total << '\n';   // 385
    return 0;
}
```
