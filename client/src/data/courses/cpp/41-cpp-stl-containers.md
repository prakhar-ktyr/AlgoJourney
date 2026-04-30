---
title: C++ STL Containers
---

# C++ STL Containers

The Standard Template Library (STL) provides a family of containers, each tuned for different access patterns. Pick the one whose performance characteristics match your usage.

## Sequence containers

Store elements in a linear order.

| Container              | Header           | Strengths                                        | Watch out for                            |
| ---------------------- | ---------------- | ------------------------------------------------ | ---------------------------------------- |
| `std::array<T,N>`      | `<array>`        | Fixed compile-time size, on the stack, fastest.  | Size is part of the type.                |
| `std::vector<T>`       | `<vector>`       | Dynamic array, contiguous storage, default pick. | Insert/erase in the middle is O(n).      |
| `std::deque<T>`        | `<deque>`        | Fast push/pop at **both** ends.                  | Not contiguous; iterator math is slower. |
| `std::list<T>`         | `<list>`         | Fast insert/erase anywhere.                      | No random access; cache-unfriendly.      |
| `std::forward_list<T>` | `<forward_list>` | Singly-linked, smallest list.                    | One-direction iteration only.            |

```cpp
std::array<int, 4>  a{1, 2, 3, 4};
std::deque<int>     d{1, 2, 3};
d.push_front(0);
std::list<int>      lst{1, 2, 3};
lst.insert(std::next(lst.begin()), 99);
```

## Associative containers

Store key/value pairs sorted by key. Implemented as balanced trees → O(log n) operations.

| Container            | Behaviour                          |
| -------------------- | ---------------------------------- |
| `std::set<K>`        | Unique keys, sorted.               |
| `std::multiset<K>`   | Duplicate keys allowed.            |
| `std::map<K,V>`      | Unique keys, sorted, value lookup. |
| `std::multimap<K,V>` | Duplicate keys allowed.            |

```cpp
#include <map>

std::map<std::string, int> ages;
ages["ada"]   = 36;
ages["alan"]  = 41;

if (auto it = ages.find("ada"); it != ages.end())
    std::cout << it->second;

for (const auto& [name, age] : ages)
    std::cout << name << ": " << age << '\n';      // iterates in sorted order
```

## Unordered (hash) containers

Hash table backed → average **O(1)** operations, no ordering.

| Container                      | Behaviour                    |
| ------------------------------ | ---------------------------- |
| `std::unordered_set<K>`        | Unique keys, hashed.         |
| `std::unordered_multiset<K>`   | Duplicates allowed.          |
| `std::unordered_map<K,V>`      | Unique keys, hashed, lookup. |
| `std::unordered_multimap<K,V>` | Duplicates allowed.          |

```cpp
#include <unordered_map>

std::unordered_map<std::string, int> count;
for (const auto& w : words) ++count[w];        // operator[] inserts default-constructed V
```

For custom key types, supply a hash:

```cpp
struct PointHash {
    std::size_t operator()(const Point& p) const noexcept {
        return std::hash<int>{}(p.x) ^ (std::hash<int>{}(p.y) << 1);
    }
};
std::unordered_map<Point, int, PointHash> grid;
```

## Container adapters

Built on top of other containers and expose a restricted interface.

```cpp
#include <stack>
#include <queue>

std::stack<int>          s;       // LIFO; default uses std::deque
std::queue<int>          q;       // FIFO
std::priority_queue<int> pq;      // max-heap by default
```

Min-heap variation:

```cpp
std::priority_queue<int, std::vector<int>, std::greater<>> minHeap;
```

## Choosing a container — quick guide

```text
Need an array?              std::array (fixed) / std::vector (dynamic)
Push/pop both ends?         std::deque
Frequent middle insert?     std::list (rare in practice)
Sorted lookup?              std::map / std::set
Fastest lookup, no order?   std::unordered_map / std::unordered_set
LIFO/FIFO/priority?         std::stack / std::queue / std::priority_queue
```

When in doubt: **`vector` first, switch only if profiling demands it.** Cache locality usually wins.

## Putting it together

```cpp
#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <vector>

int main() {
    // Word count using a map (sorted output)
    std::vector<std::string> words = {"the", "quick", "brown", "fox",
                                       "jumps", "over", "the", "lazy", "dog", "the"};

    std::map<std::string, int> count;
    for (const auto& w : words) ++count[w];

    // Print top 3 most frequent using a min-heap
    using Pair = std::pair<int, std::string>;
    std::priority_queue<Pair, std::vector<Pair>, std::greater<>> top;
    for (const auto& [w, c] : count) {
        top.emplace(c, w);
        if (top.size() > 3) top.pop();
    }

    std::vector<Pair> result;
    while (!top.empty()) { result.push_back(top.top()); top.pop(); }
    for (auto it = result.rbegin(); it != result.rend(); ++it)
        std::cout << it->second << " " << it->first << '\n';
}
```
