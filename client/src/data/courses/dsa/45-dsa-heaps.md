---
title: Heaps
---

# Heaps

A **heap** is a specialized tree-based data structure that satisfies the **heap property**. Heaps are the go-to structure for priority queues and are the foundation of **heap sort**.

---

## Heap Property

- **Max-Heap:** Every parent is **greater than or equal to** its children. The maximum element is at the root.
- **Min-Heap:** Every parent is **less than or equal to** its children. The minimum element is at the root.

```
Max-Heap:              Min-Heap:
       90                    5
      /  \                  / \
    80    70              10   15
   / \   /              / \   /
  50 60 65            20  30 40
```

---

## Complete Binary Tree Stored as Array

A heap is always a **complete binary tree** — all levels are full except possibly the last, which fills left to right. This property lets us store it efficiently in an **array** with no pointers:

```
Max-Heap:       90
               /  \
             80    70
            / \   /
          50  60 65

Array: [90, 80, 70, 50, 60, 65]
Index:   0   1   2   3   4   5
```

### Parent/Child Index Formulas (0-indexed)

| Relationship | Formula |
|-------------|---------|
| Parent of node `i` | $(i - 1) / 2$ (integer division) |
| Left child of node `i` | $2i + 1$ |
| Right child of node `i` | $2i + 2$ |

**Example:** Node at index 1 (value 80):
- Parent: (1-1)/2 = 0 → value 90 ✓
- Left child: 2(1)+1 = 3 → value 50 ✓
- Right child: 2(1)+2 = 4 → value 60 ✓

---

## Heapify Operations

### Sift Up (Bubble Up)

Used after **insertion**. Move a node up until the heap property is restored.

```
Insert 95 into max-heap:
[90, 80, 70, 50, 60, 65, 95]
                              ↑ added at end

Step 1: 95 > parent 70 (index 2) → swap
[90, 80, 95, 50, 60, 65, 70]

Step 2: 95 > parent 90 (index 0) → swap
[95, 80, 90, 50, 60, 65, 70]

Done! 95 is at root.
```

### Sift Down (Bubble Down)

Used after **extraction** (removing root). Move a node down until the heap property is restored.

```
Extract max from [90, 80, 70, 50, 60, 65]:

Step 1: Save root (90), move last element (65) to root
[65, 80, 70, 50, 60]

Step 2: 65 < max child 80 (index 1) → swap
[80, 65, 70, 50, 60]

Step 3: 65 > max child 60 (index 4) → stop
[80, 65, 70, 50, 60]

Done! Extracted 90, new max is 80.
```

---

## Full Implementation

### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

class MaxHeap {
    vector<int> heap;

    void siftUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap[i] > heap[parent]) {
                swap(heap[i], heap[parent]);
                i = parent;
            } else {
                break;
            }
        }
    }

    void siftDown(int i) {
        int size = heap.size();
        while (true) {
            int largest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;

            if (left < size && heap[left] > heap[largest]) {
                largest = left;
            }
            if (right < size && heap[right] > heap[largest]) {
                largest = right;
            }
            if (largest != i) {
                swap(heap[i], heap[largest]);
                i = largest;
            } else {
                break;
            }
        }
    }

public:
    void insert(int val) {
        heap.push_back(val);
        siftUp(heap.size() - 1);
    }

    int extractMax() {
        int maxVal = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) {
            siftDown(0);
        }
        return maxVal;
    }

    int peek() {
        return heap[0];
    }

    int size() {
        return heap.size();
    }

    bool empty() {
        return heap.empty();
    }
};

int main() {
    MaxHeap h;
    h.insert(50);
    h.insert(30);
    h.insert(80);
    h.insert(10);
    h.insert(90);

    cout << "Max: " << h.peek() << endl; // 90
    cout << "Extract: " << h.extractMax() << endl; // 90
    cout << "New max: " << h.peek() << endl; // 80
    return 0;
}
```

### Java

```java
import java.util.ArrayList;
import java.util.List;

class MaxHeap {
    private List<Integer> heap = new ArrayList<>();

    private void siftUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap.get(i) > heap.get(parent)) {
                swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    private void siftDown(int i) {
        int size = heap.size();
        while (true) {
            int largest = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;

            if (left < size && heap.get(left) > heap.get(largest)) {
                largest = left;
            }
            if (right < size && heap.get(right) > heap.get(largest)) {
                largest = right;
            }
            if (largest != i) {
                swap(i, largest);
                i = largest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        int temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }

    public void insert(int val) {
        heap.add(val);
        siftUp(heap.size() - 1);
    }

    public int extractMax() {
        int max = heap.get(0);
        heap.set(0, heap.get(heap.size() - 1));
        heap.remove(heap.size() - 1);
        if (!heap.isEmpty()) {
            siftDown(0);
        }
        return max;
    }

    public int peek() {
        return heap.get(0);
    }

    public int size() {
        return heap.size();
    }

    public static void main(String[] args) {
        MaxHeap h = new MaxHeap();
        h.insert(50);
        h.insert(30);
        h.insert(80);
        h.insert(10);
        h.insert(90);

        System.out.println("Max: " + h.peek());        // 90
        System.out.println("Extract: " + h.extractMax()); // 90
        System.out.println("New max: " + h.peek());     // 80
    }
}
```

### Python

```python
class MaxHeap:
    def __init__(self):
        self.heap = []

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i] > self.heap[parent]:
                self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
                i = parent
            else:
                break

    def _sift_down(self, i):
        size = len(self.heap)
        while True:
            largest = i
            left = 2 * i + 1
            right = 2 * i + 2

            if left < size and self.heap[left] > self.heap[largest]:
                largest = left
            if right < size and self.heap[right] > self.heap[largest]:
                largest = right

            if largest != i:
                self.heap[i], self.heap[largest] = self.heap[largest], self.heap[i]
                i = largest
            else:
                break

    def insert(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)

    def extract_max(self):
        max_val = self.heap[0]
        self.heap[0] = self.heap[-1]
        self.heap.pop()
        if self.heap:
            self._sift_down(0)
        return max_val

    def peek(self):
        return self.heap[0]

    def size(self):
        return len(self.heap)


# Usage
h = MaxHeap()
h.insert(50)
h.insert(30)
h.insert(80)
h.insert(10)
h.insert(90)

print("Max:", h.peek())          # 90
print("Extract:", h.extract_max()) # 90
print("New max:", h.peek())       # 80
```

### JavaScript

```javascript
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  _siftUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[i] > this.heap[parent]) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(i) {
    const size = this.heap.length;
    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < size && this.heap[left] > this.heap[largest]) {
        largest = left;
      }
      if (right < size && this.heap[right] > this.heap[largest]) {
        largest = right;
      }
      if (largest !== i) {
        [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
        i = largest;
      } else {
        break;
      }
    }
  }

  insert(val) {
    this.heap.push(val);
    this._siftUp(this.heap.length - 1);
  }

  extractMax() {
    const max = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    if (this.heap.length > 0) {
      this._siftDown(0);
    }
    return max;
  }

  peek() {
    return this.heap[0];
  }

  size() {
    return this.heap.length;
  }
}

// Usage
const h = new MaxHeap();
h.insert(50);
h.insert(30);
h.insert(80);
h.insert(10);
h.insert(90);

console.log("Max:", h.peek());          // 90
console.log("Extract:", h.extractMax()); // 90
console.log("New max:", h.peek());       // 80
```

---

## Building a Heap from an Array

Given an unsorted array, we can build a heap in **O(n)** time (not O(n log n)!) using bottom-up heapify:

**Algorithm:** Start from the last non-leaf node and sift down each node.

```
Array: [4, 10, 3, 5, 1]

Start from index (n/2 - 1) = 1 (last non-leaf)

Index 1 (val 10): children are 5, 1. 10 > both → no swap
Index 0 (val 4): children are 10, 3. Max child = 10 → swap

After sift down from index 0:
[10, 4, 3, 5, 1] → 4's children: 5, 1. 5 > 4 → swap
[10, 5, 3, 4, 1]

Result: [10, 5, 3, 4, 1] — valid max-heap!
```

### Python (Build Heap)

```python
def build_max_heap(arr):
    n = len(arr)
    # Start from last non-leaf node
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n)

def sift_down(arr, i, size):
    while True:
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2

        if left < size and arr[left] > arr[largest]:
            largest = left
        if right < size and arr[right] > arr[largest]:
            largest = right

        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            i = largest
        else:
            break

# Usage
arr = [4, 10, 3, 5, 1]
build_max_heap(arr)
print(arr)  # [10, 5, 3, 4, 1]
```

### Why O(n) and not O(n log n)?

Most nodes are near the bottom of the tree and need very few swaps:
- Half the nodes are leaves (0 swaps)
- Quarter of nodes need at most 1 swap
- Only 1 node (root) might need log(n) swaps

The math works out to: $\sum_{h=0}^{\log n} \frac{n}{2^{h+1}} \cdot O(h) = O(n)$

---

## Heap Sort

Use a max-heap to sort in ascending order:

1. Build a max-heap from the array.
2. Repeatedly extract the max and place it at the end.

```
[4, 10, 3, 5, 1]

Step 1: Build max-heap → [10, 5, 3, 4, 1]

Step 2: Swap root with last, reduce heap size, sift down
[1, 5, 3, 4, | 10]  → sift down → [5, 4, 3, 1, | 10]
[1, 4, 3, | 5, 10]  → sift down → [4, 1, 3, | 5, 10]
[3, 1, | 4, 5, 10]  → sift down → [3, 1, | 4, 5, 10]
[1, | 3, 4, 5, 10]  → done

Result: [1, 3, 4, 5, 10] — sorted!
```

### C++

```cpp
void heapSort(vector<int>& arr) {
    int n = arr.size();

    // Build max-heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDown(arr, i, n);
    }

    // Extract elements one by one
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        siftDown(arr, 0, i);
    }
}

void siftDown(vector<int>& arr, int i, int size) {
    while (true) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < size && arr[left] > arr[largest]) largest = left;
        if (right < size && arr[right] > arr[largest]) largest = right;

        if (largest != i) {
            swap(arr[i], arr[largest]);
            i = largest;
        } else break;
    }
}
```

### Java

```java
void heapSort(int[] arr) {
    int n = arr.length;

    // Build max-heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDown(arr, i, n);
    }

    // Extract elements
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        siftDown(arr, 0, i);
    }
}

void siftDown(int[] arr, int i, int size) {
    while (true) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < size && arr[left] > arr[largest]) largest = left;
        if (right < size && arr[right] > arr[largest]) largest = right;

        if (largest != i) {
            int temp = arr[i];
            arr[i] = arr[largest];
            arr[largest] = temp;
            i = largest;
        } else break;
    }
}
```

### Python

```python
def heap_sort(arr):
    n = len(arr)

    # Build max-heap
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, i, n)

    # Extract elements
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        sift_down(arr, 0, i)

def sift_down(arr, i, size):
    while True:
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2

        if left < size and arr[left] > arr[largest]:
            largest = left
        if right < size and arr[right] > arr[largest]:
            largest = right

        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            i = largest
        else:
            break

# Usage
arr = [4, 10, 3, 5, 1, 8, 7]
heap_sort(arr)
print(arr)  # [1, 3, 4, 5, 7, 8, 10]
```

### JavaScript

```javascript
function heapSort(arr) {
  const n = arr.length;

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }

  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    siftDown(arr, 0, i);
  }
}

function siftDown(arr, i, size) {
  while (true) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size && arr[left] > arr[largest]) largest = left;
    if (right < size && arr[right] > arr[largest]) largest = right;

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      i = largest;
    } else break;
  }
}

// Usage
const arr = [4, 10, 3, 5, 1, 8, 7];
heapSort(arr);
console.log(arr); // [1, 3, 4, 5, 7, 8, 10]
```

---

## Complexity Summary

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| Insert | O(log n) | Sift up from bottom |
| Extract Max/Min | O(log n) | Sift down from root |
| Peek (get max/min) | O(1) | Always at index 0 |
| Build Heap | O(n) | Bottom-up heapify |
| Heap Sort | O(n log n) | Build + n extractions |
| Space (heap sort) | O(1) | In-place! |

---

## Min-Heap vs Max-Heap

To convert any max-heap implementation to a min-heap, just flip the comparison:

```python
# Max-heap: parent > children
if self.heap[i] > self.heap[parent]:  # sift up
if arr[left] > arr[largest]:          # sift down

# Min-heap: parent < children
if self.heap[i] < self.heap[parent]:  # sift up
if arr[left] < arr[smallest]:         # sift down
```

Most languages provide a built-in min-heap / priority queue:
- **C++:** `priority_queue<int>` (max-heap by default; use `greater<int>` for min)
- **Java:** `PriorityQueue<Integer>` (min-heap by default)
- **Python:** `heapq` module (min-heap)
- **JavaScript:** No built-in — implement yourself or use a library

---

## Common Applications

1. **Priority Queues** — process highest/lowest priority item first
2. **Dijkstra's Algorithm** — shortest path with min-heap
3. **Kth Largest/Smallest Element** — maintain a heap of size k
4. **Merge K Sorted Lists** — use min-heap to pick next smallest
5. **Median Maintenance** — two heaps (max-heap for lower half, min-heap for upper half)
6. **Heap Sort** — O(n log n) in-place sorting

---

## Key Takeaways

1. A heap is a complete binary tree satisfying the heap property (max or min).
2. Array representation eliminates pointer overhead — parent/child found via index math.
3. Insert = append + sift up. Extract = swap root with last + sift down.
4. Building a heap is O(n), not O(n log n) — bottom-up is key.
5. Heap sort is O(n log n) and in-place, but not stable.
6. Use your language's priority queue for production code; implement from scratch to learn.

---

Next: **Graphs Introduction →**
