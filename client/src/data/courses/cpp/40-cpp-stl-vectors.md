---
title: C++ STL Vectors
---

# C++ STL Vectors

`std::vector<T>` is a **dynamic array** — the workhorse container of the STL. It stores its elements in a contiguous block of memory and grows automatically when needed.

```cpp
#include <vector>
```

## Creating a vector

```cpp
std::vector<int> a;                  // empty
std::vector<int> b(5);               // five zeros
std::vector<int> c(5, 42);           // five 42s
std::vector<int> d{1, 2, 3, 4};      // initializer list
std::vector<int> e = d;              // copy
```

## Adding and removing

```cpp
std::vector<int> v;
v.push_back(10);                     // append
v.emplace_back(20);                  // construct in place
v.pop_back();                        // remove the last element

v.insert(v.begin() + 1, 99);         // insert at position 1
v.erase(v.begin());                  // remove first element
v.clear();                            // remove all
```

`push_back` is amortised O(1). `insert` / `erase` in the middle are O(n) because elements shift.

## Accessing elements

```cpp
v[0];          // no bounds check (fast, undefined if out of range)
v.at(0);       // bounds checked, throws std::out_of_range
v.front();     // first
v.back();      // last
v.data();      // raw T* pointer to the buffer (for C APIs)
```

## Size, capacity, reserve

`size()` is the number of elements; `capacity()` is how many it can hold before reallocation.

```cpp
std::vector<int> v;
v.reserve(1000);     // allocate room for 1000 — no future reallocs up to that size
for (int i = 0; i < 1000; ++i) v.push_back(i);
```

Use `reserve` whenever you know the final size — it avoids repeated allocations and pointer/iterator invalidation.

`shrink_to_fit()` returns unused capacity to the system (non-binding hint).

## Iterating

```cpp
for (int x : v)            std::cout << x;       // by value (copy)
for (const int& x : v)     std::cout << x;       // by const ref
for (int& x : v)           x *= 2;               // mutate

for (auto it = v.begin(); it != v.end(); ++it) std::cout << *it;
```

## Sorting and searching

`<algorithm>` provides generic operations that work on any iterator pair:

```cpp
#include <algorithm>

std::sort(v.begin(), v.end());                       // ascending
std::sort(v.begin(), v.end(), std::greater<>());     // descending
auto it = std::find(v.begin(), v.end(), 42);
bool ok = std::binary_search(v.begin(), v.end(), 42);   // requires sorted
```

## 2D vectors

```cpp
std::vector<std::vector<int>> grid(rows, std::vector<int>(cols, 0));
grid[i][j] = 1;
```

For numerical work, prefer a single flat vector with manual indexing — it's faster and cache-friendlier.

## Iterator invalidation

Operations that may move elements (`push_back` past capacity, `insert`, `erase`, `resize`) **invalidate** iterators and pointers into the vector. Don't hold them across mutations.

## Removing while iterating — erase-remove

```cpp
v.erase(std::remove_if(v.begin(), v.end(),
                       [](int x) { return x % 2 == 0; }),
        v.end());
```

C++20 simplifies this to `std::erase_if(v, pred)`.

## When **not** to use `vector`

| Need                            | Better choice                     |
| ------------------------------- | --------------------------------- |
| Fast insert/erase in the middle | `std::list` / `std::deque`        |
| Lookup by key                   | `std::unordered_map` / `std::map` |
| Fixed compile-time size         | `std::array`                      |
| Stack only                      | `std::stack` (over `vector`)      |

## Putting it together

```cpp
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v{4, 1, 5, 9, 2, 6, 5, 3};
    std::sort(v.begin(), v.end());

    int total = std::accumulate(v.begin(), v.end(), 0);
    auto it   = std::find(v.begin(), v.end(), 5);

    std::cout << "size = " << v.size() << '\n';
    std::cout << "sum  = " << total    << '\n';
    if (it != v.end())
        std::cout << "first 5 at index " << (it - v.begin()) << '\n';
}
```
