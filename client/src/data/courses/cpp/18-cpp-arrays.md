---
title: C++ Arrays
---

# C++ Arrays

An **array** stores a fixed number of elements of the same type in contiguous memory. C++ has both **C-style arrays** and the safer **`std::array`** and **`std::vector`** wrappers.

## C-style arrays

```cpp
int  scores[5] = {90, 80, 70, 60, 50};
char vowels[]  = {'a', 'e', 'i', 'o', 'u'}; // size deduced as 5
double zeros[3]{};                          // {0.0, 0.0, 0.0}
```

Access elements by **zero-based** index:

```cpp
std::cout << scores[0] << '\n'; // 90
scores[2] = 75;
```

⚠ Out-of-bounds access is **undefined behavior** — there is no automatic check.

## Iterating

```cpp
for (int i = 0; i < 5; ++i) {
    std::cout << scores[i] << ' ';
}

for (int s : scores) {     // range-based for works on raw arrays too
    std::cout << s << ' ';
}
```

`std::size(scores)` (C++17, `<iterator>`) gives the element count safely:

```cpp
#include <iterator>
std::cout << std::size(scores) << '\n'; // 5
```

For raw arrays, you can also use `sizeof(arr) / sizeof(arr[0])`, but only inside the function where the array was declared.

## Passing arrays to functions

A C-style array decays to a pointer when passed to a function:

```cpp
void printAll(int* arr, size_t n) {
    for (size_t i = 0; i < n; ++i) std::cout << arr[i] << ' ';
}

int xs[3]{1, 2, 3};
printAll(xs, 3);
```

You **lose the size information** at the boundary — that's why we pass `n` separately.

## `std::array` — fixed-size, type-safe

```cpp
#include <array>
std::array<int, 5> scores = {90, 80, 70, 60, 50};

scores[0] = 95;
std::cout << scores.size() << '\n';  // 5 — size is part of the type
```

Benefits over raw arrays:

- Knows its size (`.size()`).
- Has iterators (`begin()`, `end()`) so STL algorithms work.
- Can be assigned and returned by value.
- `.at(i)` does bounds-checking.

## `std::vector` — dynamic-size, the workhorse

When you don't know the size up front, use `std::vector`:

```cpp
#include <vector>
std::vector<int> nums;            // empty
nums.push_back(10);
nums.push_back(20);
nums.push_back(30);

std::cout << nums.size() << '\n'; // 3
std::cout << nums[1]    << '\n'; // 20
nums.pop_back();
```

Initialize with values:

```cpp
std::vector<int> v{1, 2, 3, 4, 5};
std::vector<int> ten(10, 0);     // ten zeros
```

Iterate just like an array:

```cpp
for (int x : v) std::cout << x << ' ';
```

Vectors **grow on demand** by reallocating to a larger buffer when full. Use `.reserve(n)` if you know the eventual size to avoid intermediate reallocations.

## Multi-dimensional arrays

Raw 2-D array:

```cpp
int grid[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
};
std::cout << grid[1][2] << '\n'; // 6
```

Modern equivalent with `std::vector` (a vector of vectors):

```cpp
std::vector<std::vector<int>> grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
};
```

For a true 2-D matrix with one allocation, store as 1-D and index manually:

```cpp
std::vector<int> mat(rows * cols);
mat[r * cols + c] = value;
```

## When to use which?

| Use            | When                                                 |
| -------------- | ---------------------------------------------------- |
| C-style array  | Interop with C, very low-level / embedded code       |
| `std::array`   | Size is known at compile time                        |
| `std::vector`  | Size is dynamic or large; default for most cases     |

## Putting it together

```cpp
#include <iostream>
#include <vector>
#include <numeric>   // std::accumulate
#include <algorithm> // std::max_element

int main() {
    std::vector<int> scores{82, 91, 67, 95, 73};

    int total = std::accumulate(scores.begin(), scores.end(), 0);
    double avg = static_cast<double>(total) / scores.size();
    int best   = *std::max_element(scores.begin(), scores.end());

    std::cout << "Count:   " << scores.size() << '\n';
    std::cout << "Total:   " << total         << '\n';
    std::cout << "Average: " << avg           << '\n';
    std::cout << "Best:    " << best          << '\n';
    return 0;
}
```

Next: [C++ Structures](#).
