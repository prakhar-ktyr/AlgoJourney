---
title: C++ STL Algorithms
---

# C++ STL Algorithms

`<algorithm>` and `<numeric>` are home to ~100 generic functions that operate on iterator ranges. Reach for them before writing a hand-rolled loop — they're well-tested, often parallel-ready, and signal intent.

## The general shape

```cpp
std::algorithm(begin, end, ...);
```

Most accept a **predicate** (a callable) for filtering or comparison.

## Non-modifying queries

```cpp
std::vector<int> v{4, 1, 5, 9, 2, 6, 5, 3};

bool has5 = std::any_of(v.begin(), v.end(), [](int x){ return x == 5; });
int  evens = std::count_if(v.begin(), v.end(), [](int x){ return x % 2 == 0; });

auto it    = std::find(v.begin(), v.end(), 9);
auto [mn, mx] = std::minmax_element(v.begin(), v.end());
```

Companions: `all_of`, `none_of`, `find_if`, `find_if_not`, `mismatch`, `equal`, `search`, `adjacent_find`.

## Modifying

```cpp
std::vector<int> dst(v.size());
std::copy(v.begin(), v.end(), dst.begin());
std::transform(v.begin(), v.end(), dst.begin(), [](int x){ return x * x; });
std::replace_if(v.begin(), v.end(), [](int x){ return x < 0; }, 0);
std::reverse(v.begin(), v.end());
std::rotate(v.begin(), v.begin() + 2, v.end());
```

## Removing — the erase-remove idiom

`remove` / `remove_if` shuffle "kept" elements to the front and return an iterator to the new end. The container is unchanged in size — pair it with `erase`:

```cpp
v.erase(std::remove_if(v.begin(), v.end(),
                       [](int x){ return x % 2 == 0; }),
        v.end());
```

C++20 simplifies this with `std::erase_if(v, pred)`.

## Sorting and ordering

```cpp
std::sort(v.begin(), v.end());                          // ascending
std::sort(v.begin(), v.end(), std::greater<>());        // descending
std::stable_sort(v.begin(), v.end());                   // preserves equal-element order
std::partial_sort(v.begin(), v.begin() + 3, v.end());   // first 3 are smallest, sorted
std::nth_element(v.begin(), v.begin() + k, v.end());    // k-th element in place

std::partition(v.begin(), v.end(), [](int x){ return x < 0; });
```

## Binary search (sorted ranges only)

```cpp
bool ok    = std::binary_search(v.begin(), v.end(), 5);
auto lower = std::lower_bound(v.begin(), v.end(), 5);   // first ≥ 5
auto upper = std::upper_bound(v.begin(), v.end(), 5);   // first > 5
auto [lo, hi] = std::equal_range(v.begin(), v.end(), 5);
```

## Numeric algorithms (`<numeric>`)

```cpp
#include <numeric>

int sum     = std::accumulate(v.begin(), v.end(), 0);
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<>());
int dot     = std::inner_product(a.begin(), a.end(), b.begin(), 0);
std::partial_sum(v.begin(), v.end(), prefix.begin());     // running totals
std::iota(v.begin(), v.end(), 0);                          // 0,1,2,3,...
int gcd     = std::gcd(48, 18);
```

`std::reduce` (C++17) is like `accumulate` but unordered → can be parallelised.

## Set operations on sorted ranges

```cpp
std::vector<int> out;
std::set_union(a.begin(), a.end(), b.begin(), b.end(), std::back_inserter(out));
std::set_intersection(a.begin(), a.end(), b.begin(), b.end(), std::back_inserter(out));
std::set_difference (a.begin(), a.end(), b.begin(), b.end(), std::back_inserter(out));
```

## Heap operations

```cpp
std::make_heap(v.begin(), v.end());            // build a max-heap in place
std::push_heap(v.begin(), v.end());            // after pushing a value
std::pop_heap (v.begin(), v.end()); v.pop_back();
std::sort_heap(v.begin(), v.end());            // O(n log n) heapsort
```

## Parallel execution (C++17)

Many algorithms accept an execution policy:

```cpp
#include <execution>
std::sort(std::execution::par, v.begin(), v.end());
auto sum = std::reduce(std::execution::par_unseq, v.begin(), v.end());
```

The runtime decides how to spread work across threads / SIMD lanes.

## Ranges (C++20) — a glimpse

`<ranges>` adds composable views over algorithms:

```cpp
#include <ranges>

auto squaresOfEvens = v
    | std::views::filter([](int x){ return x % 2 == 0; })
    | std::views::transform([](int x){ return x * x; });

for (int x : squaresOfEvens) std::cout << x << ' ';
```

Lazy, no temporary vectors — and reads top-down.

## Putting it together

```cpp
#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> v{5, 3, 8, 1, 9, 2, 7, 4, 6};

    std::sort(v.begin(), v.end());

    int sum  = std::accumulate(v.begin(), v.end(), 0);
    int evens = std::count_if(v.begin(), v.end(), [](int x){ return x % 2 == 0; });

    std::cout << "sorted:";
    for (int x : v) std::cout << ' ' << x;
    std::cout << "\nsum   = " << sum << "\nevens = " << evens << '\n';
}
```
