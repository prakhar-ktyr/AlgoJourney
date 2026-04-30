---
title: C++ STL Iterators
---

# C++ STL Iterators

An **iterator** is a generalised pointer. It lets algorithms work with any container without knowing its layout — the unifying abstraction at the heart of the STL.

## The basic idea

Every standard container exposes:

```cpp
container.begin();    // iterator to the first element
container.end();      // iterator just past the last element
```

A range is the half-open `[begin, end)`. You loop while `it != end()`.

```cpp
std::vector<int> v{10, 20, 30};
for (auto it = v.begin(); it != v.end(); ++it)
    std::cout << *it << ' ';
```

`*it` reads the element, `it->member` reaches into a struct member.

## Iterator categories

Different containers offer different powers:

| Category           | Operations supported                                     | Containers                          |
| ------------------ | -------------------------------------------------------- | ----------------------------------- |
| Input              | `*it`, `++it`, `==`, `!=` (single pass, read)            | `istream_iterator`                  |
| Output             | `*it = x`, `++it` (single pass, write)                   | `ostream_iterator`, `back_inserter` |
| Forward            | input + multi-pass                                       | `forward_list`                      |
| Bidirectional      | forward + `--it`                                         | `list`, `set`, `map`                |
| Random access      | bidirectional + `it + n`, `it[n]`, `it1 - it2`, ordering | `vector`, `deque`, `array`          |
| Contiguous (C++20) | random access + memory is contiguous                     | `vector`, `array`                   |

Higher categories include all the abilities of the lower ones.

## `const`, reverse, and `cbegin`

```cpp
auto it  = v.begin();    // iterator (allows mutation)
auto cit = v.cbegin();   // const_iterator
auto rit = v.rbegin();   // reverse_iterator (++ moves toward the front)
```

Use `const` iterators when you don't intend to modify the elements.

## Range-based `for`

Almost always more readable than explicit iterators:

```cpp
for (const auto& x : v) std::cout << x;     // const ref
for (auto& x : v)        x *= 2;            // mutate
```

Under the hood it uses `begin()` / `end()`.

## Algorithms accept iterator pairs

```cpp
#include <algorithm>

std::sort(v.begin(), v.end());
auto it = std::find(v.begin(), v.end(), 42);

// Half a vector
auto mid = v.begin() + v.size() / 2;
std::sort(v.begin(), mid);
```

This is why algorithms compose: any range works.

## Iterator adapters

Adapters wrap iterators to give new behavior.

### Insert iterators

Turn an assignment into an insertion:

```cpp
std::vector<int> dst;
std::copy(src.begin(), src.end(), std::back_inserter(dst));
```

`std::back_inserter`, `std::front_inserter`, `std::inserter` all behave as output iterators that grow the container.

### Stream iterators

Treat input/output streams as ranges:

```cpp
std::vector<int> nums;
std::copy(std::istream_iterator<int>(std::cin),
          std::istream_iterator<int>(),
          std::back_inserter(nums));

std::copy(nums.begin(), nums.end(),
          std::ostream_iterator<int>(std::cout, " "));
```

### Reverse iterator

```cpp
for (auto it = v.rbegin(); it != v.rend(); ++it) std::cout << *it;
```

## Custom iterators (sketch)

To make your own container algorithm-friendly, expose `begin()` / `end()` returning an iterator type that defines the right typedefs (`value_type`, `difference_type`, …) and operators (`*`, `++`, `==`). C++20 simplifies this with **ranges** and `std::iterator_traits`.

## Common pitfalls

- **Invalidation**: `push_back` past capacity invalidates iterators into a `vector`; `erase` invalidates the erased iterator (use the returned next one).
- **Off-by-one**: ranges are `[begin, end)` — `end` is past the last element, never dereference it.
- **Mismatched containers**: comparing iterators from two different containers is undefined.

## Putting it together

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> v{4, 1, 3, 5, 2};

    // Sort descending using a reverse iterator pair
    std::sort(v.rbegin(), v.rend());

    // Copy odd numbers into another vector via back_inserter
    std::vector<int> odds;
    std::copy_if(v.begin(), v.end(),
                 std::back_inserter(odds),
                 [](int x) { return x % 2 == 1; });

    // Stream them out
    std::copy(odds.begin(), odds.end(),
              std::ostream_iterator<int>(std::cout, " "));
}
```

Next: [C++ STL Algorithms](#).
