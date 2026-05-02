---
title: "Segment Trees"
---

# Segment Trees

A **segment tree** is a binary tree data structure that allows efficient querying and updating of intervals (segments) of an array. It answers range queries — such as "what is the sum/min/max of elements from index L to R?" — in O(log N) time, while also supporting point updates in O(log N).

## The Range Query Problem

Given an array of N elements, you need to repeatedly:
1. **Query**: compute an aggregate (sum, min, max, GCD, etc.) over a range [L, R].
2. **Update**: modify a single element (or a range) in the array.

| Approach | Query | Update |
|----------|-------|--------|
| Brute force | O(N) | O(1) |
| Prefix sums | O(1) | O(N) |
| **Segment tree** | **O(log N)** | **O(log N)** |

Segment trees give the best balance when both operations are frequent.

## Structure

The segment tree is a complete binary tree where:
- **Leaf nodes** store individual array elements.
- **Internal nodes** store the aggregate of their children's ranges.

For an array of size N, the tree has at most 4N nodes (stored in a flat array for simplicity).

```
Array: [1, 3, 5, 7, 9, 11]

Segment tree (sum):
                  [36]            (0-5)
               /        \
          [9]              [27]   (0-2) (3-5)
         /   \            /    \
      [4]    [5]      [16]    [11] (0-1)(2-2)(3-4)(5-5)
      / \             /   \
    [1] [3]         [7]   [9]     (0-0)(1-1)(3-3)(4-4)
```

## Operations Explained

### Build

Recursively divide the array in half. Each leaf stores one element. Each internal node stores the merge of its two children (e.g., sum of left + right child).

### Query(L, R)

Starting from the root, at each node covering range [start, end]:
- If [start, end] is completely within [L, R] → return this node's value.
- If [start, end] is completely outside [L, R] → return identity (0 for sum, ∞ for min).
- Otherwise → recurse on both children and merge results.

### Update(index, value)

Walk from root to the leaf corresponding to `index`. Update the leaf, then propagate changes back up by recalculating each ancestor.

---

## Full Implementation

### C++

```cpp
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

class SegmentTree {
private:
    vector<int> tree;
    int n;

    void build(const vector<int>& arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    void update(int node, int start, int end, int idx, int val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        if (idx <= mid) {
            update(2 * node, start, mid, idx, val);
        } else {
            update(2 * node + 1, mid + 1, end, idx, val);
        }
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    int query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0; // outside range
        if (l <= start && end <= r) return tree[node]; // completely inside
        int mid = (start + end) / 2;
        int leftSum = query(2 * node, start, mid, l, r);
        int rightSum = query(2 * node + 1, mid + 1, end, l, r);
        return leftSum + rightSum;
    }

public:
    SegmentTree(const vector<int>& arr) {
        n = arr.size();
        tree.resize(4 * n, 0);
        build(arr, 1, 0, n - 1);
    }

    void update(int idx, int val) {
        update(1, 0, n - 1, idx, val);
    }

    int query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }
};

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTree st(arr);

    cout << "Sum [1,3]: " << st.query(1, 3) << endl;  // 3+5+7 = 15
    cout << "Sum [0,5]: " << st.query(0, 5) << endl;  // 36

    st.update(2, 10); // change index 2 from 5 to 10
    cout << "Sum [1,3] after update: " << st.query(1, 3) << endl; // 3+10+7 = 20

    return 0;
}
```

### Java

```java
public class SegmentTree {
    private int[] tree;
    private int n;

    public SegmentTree(int[] arr) {
        n = arr.length;
        tree = new int[4 * n];
        build(arr, 1, 0, n - 1);
    }

    private void build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(arr, 2 * node, start, mid);
        build(arr, 2 * node + 1, mid + 1, end);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    public void update(int idx, int val) {
        update(1, 0, n - 1, idx, val);
    }

    private void update(int node, int start, int end, int idx, int val) {
        if (start == end) {
            tree[node] = val;
            return;
        }
        int mid = (start + end) / 2;
        if (idx <= mid) {
            update(2 * node, start, mid, idx, val);
        } else {
            update(2 * node + 1, mid + 1, end, idx, val);
        }
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }

    public int query(int l, int r) {
        return query(1, 0, n - 1, l, r);
    }

    private int query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0;
        if (l <= start && end <= r) return tree[node];
        int mid = (start + end) / 2;
        int leftSum = query(2 * node, start, mid, l, r);
        int rightSum = query(2 * node + 1, mid + 1, end, l, r);
        return leftSum + rightSum;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        SegmentTree st = new SegmentTree(arr);

        System.out.println("Sum [1,3]: " + st.query(1, 3));  // 15
        System.out.println("Sum [0,5]: " + st.query(0, 5));  // 36

        st.update(2, 10);
        System.out.println("Sum [1,3] after update: " + st.query(1, 3)); // 20
    }
}
```

### Python

```python
class SegmentTree:
    def __init__(self, arr: list[int]):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self._build(arr, 1, 0, self.n - 1)

    def _build(self, arr: list[int], node: int, start: int, end: int) -> None:
        if start == end:
            self.tree[node] = arr[start]
            return
        mid = (start + end) // 2
        self._build(arr, 2 * node, start, mid)
        self._build(arr, 2 * node + 1, mid + 1, end)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def update(self, idx: int, val: int) -> None:
        self._update(1, 0, self.n - 1, idx, val)

    def _update(self, node: int, start: int, end: int, idx: int, val: int) -> None:
        if start == end:
            self.tree[node] = val
            return
        mid = (start + end) // 2
        if idx <= mid:
            self._update(2 * node, start, mid, idx, val)
        else:
            self._update(2 * node + 1, mid + 1, end, idx, val)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, l: int, r: int) -> int:
        return self._query(1, 0, self.n - 1, l, r)

    def _query(self, node: int, start: int, end: int, l: int, r: int) -> int:
        if r < start or end < l:
            return 0  # outside range
        if l <= start and end <= r:
            return self.tree[node]  # completely inside
        mid = (start + end) // 2
        left_sum = self._query(2 * node, start, mid, l, r)
        right_sum = self._query(2 * node + 1, mid + 1, end, l, r)
        return left_sum + right_sum


# Usage
arr = [1, 3, 5, 7, 9, 11]
st = SegmentTree(arr)

print(f"Sum [1,3]: {st.query(1, 3)}")   # 15
print(f"Sum [0,5]: {st.query(0, 5)}")   # 36

st.update(2, 10)
print(f"Sum [1,3] after update: {st.query(1, 3)}")  # 20
```

### JavaScript

```javascript
class SegmentTree {
  constructor(arr) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n).fill(0);
    this._build(arr, 1, 0, this.n - 1);
  }

  _build(arr, node, start, end) {
    if (start === end) {
      this.tree[node] = arr[start];
      return;
    }
    const mid = Math.floor((start + end) / 2);
    this._build(arr, 2 * node, start, mid);
    this._build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  update(idx, val) {
    this._update(1, 0, this.n - 1, idx, val);
  }

  _update(node, start, end, idx, val) {
    if (start === end) {
      this.tree[node] = val;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) {
      this._update(2 * node, start, mid, idx, val);
    } else {
      this._update(2 * node + 1, mid + 1, end, idx, val);
    }
    this.tree[node] = this.tree[2 * node] + this.tree[2 * node + 1];
  }

  query(l, r) {
    return this._query(1, 0, this.n - 1, l, r);
  }

  _query(node, start, end, l, r) {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    const leftSum = this._query(2 * node, start, mid, l, r);
    const rightSum = this._query(2 * node + 1, mid + 1, end, l, r);
    return leftSum + rightSum;
  }
}

// Usage
const arr = [1, 3, 5, 7, 9, 11];
const st = new SegmentTree(arr);

console.log(`Sum [1,3]: ${st.query(1, 3)}`);   // 15
console.log(`Sum [0,5]: ${st.query(0, 5)}`);   // 36

st.update(2, 10);
console.log(`Sum [1,3] after update: ${st.query(1, 3)}`); // 20
```

---

## Time & Space Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build | O(N) | O(N) |
| Query | O(log N) | O(log N) recursion stack |
| Update | O(log N) | O(log N) recursion stack |

Total space: O(4N) ≈ O(N) for the tree array.

## Variations & Extensions

### Range Minimum Query

Replace addition with `min`:

```
tree[node] = min(tree[2*node], tree[2*node+1]);
```

Return `INT_MAX` / `Infinity` for out-of-range nodes instead of 0.

### Lazy Propagation

For **range updates** (e.g., "add 5 to all elements in [L, R]"), lazy propagation defers updates to children until they're needed — keeping both range update and range query at O(log N).

### Persistent Segment Trees

Create a new version of the tree on each update without modifying the old version. Useful for answering queries on historical states of the array.

---

## Applications

1. **Range Sum Queries** — sum of elements in any subarray in O(log N).
2. **Range Minimum/Maximum Queries** — find min/max over a range.
3. **Count of elements in a range** — with coordinate compression.
4. **Interval scheduling** — tracking available slots.
5. **Computational geometry** — area of union of rectangles.
6. **Competitive programming** — a fundamental building block for advanced problems.

---

Congratulations! You've now covered the major advanced data structures — from tries and union-find to segment trees. These structures form the backbone of efficient algorithms in competitive programming, system design, and real-world applications. To solidify your understanding, head over to the **DSA Sheet** and practice problems that apply these concepts. Consistent practice is what turns knowledge into intuition — keep solving, keep building!
