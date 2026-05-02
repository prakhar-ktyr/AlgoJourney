---
title: Arrays Introduction
---

# Arrays Introduction

An **array** is the most fundamental data structure in computer science — a contiguous block of memory that stores a fixed number of elements of the same type, accessible by index.

## What is an array?

Think of an array as a row of numbered lockers:

```
Index:   0     1     2     3     4
       +-----+-----+-----+-----+-----+
Value: | 10  | 20  | 30  | 40  | 50  |
       +-----+-----+-----+-----+-----+
```

- **Index** — the position number, starting from 0.
- **Element** — the value stored at a position.
- **Size/Length** — the total number of elements.

## Why arrays matter

Arrays are the building block for nearly every other data structure:
- Strings are arrays of characters.
- Hash tables use arrays internally.
- Heaps are represented as arrays.
- Dynamic arrays (vectors, lists) are arrays that resize automatically.

## Declaring and initializing arrays

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Fixed-size array (C-style)
    int arr[5] = {10, 20, 30, 40, 50};

    // Dynamic array (preferred in modern C++)
    vector<int> v = {10, 20, 30, 40, 50};

    // Access by index
    cout << arr[0] << endl;  // 10
    cout << v[2] << endl;    // 30

    // Size
    cout << v.size() << endl; // 5

    return 0;
}
```

```java
public class ArrayDemo {
    public static void main(String[] args) {
        // Fixed-size array
        int[] arr = {10, 20, 30, 40, 50};

        // Access by index
        System.out.println(arr[0]);  // 10
        System.out.println(arr[2]);  // 30

        // Length
        System.out.println(arr.length); // 5

        // ArrayList (dynamic array)
        // import java.util.ArrayList;
        // ArrayList<Integer> list = new ArrayList<>();
        // list.add(10); list.add(20); ...
    }
}
```

```python
# Python lists are dynamic arrays
arr = [10, 20, 30, 40, 50]

# Access by index
print(arr[0])   # 10
print(arr[2])   # 30
print(arr[-1])  # 50 (negative indexing!)

# Length
print(len(arr)) # 5
```

```javascript
// JavaScript arrays are dynamic
const arr = [10, 20, 30, 40, 50];

// Access by index
console.log(arr[0]);   // 10
console.log(arr[2]);   // 30

// Length
console.log(arr.length); // 5
```

## Memory layout

Arrays store elements in **contiguous** (side-by-side) memory locations. This is why index-based access is O(1): the computer calculates the memory address directly.

```
Address of arr[i] = base_address + i × element_size
```

For example, if an integer is 4 bytes and the array starts at address 1000:
- `arr[0]` → 1000
- `arr[1]` → 1004
- `arr[2]` → 1008
- `arr[3]` → 1012

No scanning required — just arithmetic.

## Array operations and their complexities

| Operation | Time | Notes |
|---|---|---|
| Access by index | O(1) | Direct address calculation |
| Search (unsorted) | O(n) | Must check every element |
| Search (sorted) | O(log n) | Binary search |
| Insert at end | O(1)* | Amortized for dynamic arrays |
| Insert at beginning | O(n) | Must shift all elements right |
| Insert at middle | O(n) | Must shift elements right |
| Delete at end | O(1) | Just reduce the size |
| Delete at beginning | O(n) | Must shift all elements left |
| Delete at middle | O(n) | Must shift elements left |

*Dynamic arrays may need to resize (copy everything to a bigger array), but this happens rarely enough that it averages out to O(1) per insertion.

## Traversing an array

The most basic operation — visiting every element:

```cpp
vector<int> arr = {10, 20, 30, 40, 50};

// Index-based loop
for (int i = 0; i < arr.size(); i++) {
    cout << arr[i] << " ";
}
// Output: 10 20 30 40 50

// Range-based loop (modern C++)
for (int x : arr) {
    cout << x << " ";
}
```

```java
int[] arr = {10, 20, 30, 40, 50};

// Index-based loop
for (int i = 0; i < arr.length; i++) {
    System.out.print(arr[i] + " ");
}

// Enhanced for loop
for (int x : arr) {
    System.out.print(x + " ");
}
```

```python
arr = [10, 20, 30, 40, 50]

# Direct iteration
for x in arr:
    print(x, end=" ")

# With index
for i, x in enumerate(arr):
    print(f"arr[{i}] = {x}")
```

```javascript
const arr = [10, 20, 30, 40, 50];

// for loop
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}

// for...of
for (const x of arr) {
    console.log(x);
}

// forEach
arr.forEach((x, i) => console.log(`arr[${i}] = ${x}`));
```

## Static vs. dynamic arrays

| Feature | Static array | Dynamic array |
|---|---|---|
| Size | Fixed at creation | Grows automatically |
| Memory | Exact allocation | May over-allocate |
| Resize | Not possible | Doubles capacity when full |
| Example | `int arr[100]` (C++) | `vector<int>` (C++), `ArrayList` (Java), `list` (Python), `Array` (JS) |

In DSA, we almost always use dynamic arrays because problems rarely tell you the exact size in advance.

## Common pitfalls

1. **Off-by-one errors** — arrays are 0-indexed, so the last valid index is `length - 1`, not `length`.
2. **Out-of-bounds access** — accessing `arr[n]` when the array has n elements crashes (or causes undefined behavior in C++).
3. **Confusing size and capacity** — in dynamic arrays, capacity (allocated space) can be larger than size (number of elements).

## Summary

- Arrays are contiguous blocks of memory with O(1) index access.
- They are the foundation of most data structures.
- Dynamic arrays (vector, ArrayList, list) resize automatically and are preferred for DSA.
- Insertion/deletion at the beginning or middle is O(n) due to shifting.

Next: **Array Operations →**
