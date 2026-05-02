---
title: "Union-Find"
---

# Union-Find (Disjoint Set Union)

The **Union-Find** data structure (also called **Disjoint Set Union** or DSU) efficiently tracks a collection of non-overlapping sets. It supports two primary operations:

- **Find** — determine which set an element belongs to (returns the set's representative/root).
- **Union** — merge two sets into one.

## Motivation

Imagine you have N elements and you need to repeatedly:
1. Check if two elements are in the same group.
2. Merge two groups.

A naive approach using arrays takes O(N) per union. Union-Find with optimizations achieves **nearly O(1)** amortized per operation — specifically O(α(N)), where α is the inverse Ackermann function (grows incredibly slowly, ≤ 4 for all practical N).

## Key Optimizations

### Path Compression

During `find(x)`, make every node on the path from `x` to the root point directly to the root. This flattens the tree structure, ensuring future queries are faster.

```
Before find(4):       After find(4):
    1                    1
   / \                 / | \ \
  2   3               2  3  4  5
  |
  4
  |
  5
```

### Union by Rank

When merging two trees, attach the **shorter** tree under the root of the **taller** tree. This keeps the overall tree height small (at most O(log N) without path compression).

Together, path compression + union by rank give O(α(N)) amortized time per operation.

---

## Full Implementation

### C++

```cpp
#include <iostream>
#include <vector>
#include <numeric>
using namespace std;

class UnionFind {
private:
    vector<int> parent;
    vector<int> rank_;
    int components;

public:
    UnionFind(int n) : parent(n), rank_(n, 0), components(n) {
        iota(parent.begin(), parent.end(), 0); // parent[i] = i
    }

    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // path compression
        }
        return parent[x];
    }

    bool unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX == rootY) return false; // already in same set

        // union by rank
        if (rank_[rootX] < rank_[rootY]) swap(rootX, rootY);
        parent[rootY] = rootX;
        if (rank_[rootX] == rank_[rootY]) rank_[rootX]++;

        components--;
        return true;
    }

    bool connected(int x, int y) {
        return find(x) == find(y);
    }

    int getComponents() {
        return components;
    }
};

int main() {
    UnionFind uf(7);

    uf.unite(0, 1);
    uf.unite(1, 2);
    uf.unite(3, 4);
    uf.unite(5, 6);

    cout << uf.connected(0, 2) << endl; // 1 (true)
    cout << uf.connected(0, 3) << endl; // 0 (false)
    cout << "Components: " << uf.getComponents() << endl; // 3

    uf.unite(2, 4);
    cout << uf.connected(0, 3) << endl; // 1 (true)
    cout << "Components: " << uf.getComponents() << endl; // 2

    return 0;
}
```

### Java

```java
public class UnionFind {
    private int[] parent;
    private int[] rank;
    private int components;

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }

    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // path compression
        }
        return parent[x];
    }

    public boolean union(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX == rootY) return false;

        // union by rank
        if (rank[rootX] < rank[rootY]) {
            int temp = rootX;
            rootX = rootY;
            rootY = temp;
        }
        parent[rootY] = rootX;
        if (rank[rootX] == rank[rootY]) rank[rootX]++;

        components--;
        return true;
    }

    public boolean connected(int x, int y) {
        return find(x) == find(y);
    }

    public int getComponents() {
        return components;
    }

    public static void main(String[] args) {
        UnionFind uf = new UnionFind(7);

        uf.union(0, 1);
        uf.union(1, 2);
        uf.union(3, 4);
        uf.union(5, 6);

        System.out.println(uf.connected(0, 2)); // true
        System.out.println(uf.connected(0, 3)); // false
        System.out.println("Components: " + uf.getComponents()); // 3

        uf.union(2, 4);
        System.out.println(uf.connected(0, 3)); // true
        System.out.println("Components: " + uf.getComponents()); // 2
    }
}
```

### Python

```python
class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x: int, y: int) -> bool:
        root_x = self.find(x)
        root_y = self.find(y)
        if root_x == root_y:
            return False

        # union by rank
        if self.rank[root_x] < self.rank[root_y]:
            root_x, root_y = root_y, root_x
        self.parent[root_y] = root_x
        if self.rank[root_x] == self.rank[root_y]:
            self.rank[root_x] += 1

        self.components -= 1
        return True

    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)

    def get_components(self) -> int:
        return self.components


# Usage
uf = UnionFind(7)

uf.union(0, 1)
uf.union(1, 2)
uf.union(3, 4)
uf.union(5, 6)

print(uf.connected(0, 2))      # True
print(uf.connected(0, 3))      # False
print(f"Components: {uf.get_components()}")  # 3

uf.union(2, 4)
print(uf.connected(0, 3))      # True
print(f"Components: {uf.get_components()}")  # 2
```

### JavaScript

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    let rootX = this.find(x);
    let rootY = this.find(y);
    if (rootX === rootY) return false;

    // union by rank
    if (this.rank[rootX] < this.rank[rootY]) {
      [rootX, rootY] = [rootY, rootX];
    }
    this.parent[rootY] = rootX;
    if (this.rank[rootX] === this.rank[rootY]) this.rank[rootX]++;

    this.components--;
    return true;
  }

  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  getComponents() {
    return this.components;
  }
}

// Usage
const uf = new UnionFind(7);

uf.union(0, 1);
uf.union(1, 2);
uf.union(3, 4);
uf.union(5, 6);

console.log(uf.connected(0, 2));      // true
console.log(uf.connected(0, 3));      // false
console.log(`Components: ${uf.getComponents()}`); // 3

uf.union(2, 4);
console.log(uf.connected(0, 3));      // true
console.log(`Components: ${uf.getComponents()}`); // 2
```

---

## Time & Space Complexity

| Operation | Time (amortized) | Space |
|-----------|-----------------|-------|
| Find | O(α(N)) ≈ O(1) | O(1) |
| Union | O(α(N)) ≈ O(1) | O(1) |
| Construction | O(N) | O(N) |

*α(N) is the inverse Ackermann function — effectively constant for all practical inputs.*

## Applications

### 1. Kruskal's Minimum Spanning Tree

Sort all edges by weight. Process edges in order — if the two endpoints are in different sets (via `find`), add the edge to the MST and `union` them.

```
Edges sorted: (A-B, 1), (B-C, 2), (A-C, 3), (C-D, 4)

Process (A-B, 1): A and B in different sets → add, union(A, B)
Process (B-C, 2): B and C in different sets → add, union(B, C)
Process (A-C, 3): A and C in SAME set → skip (would form cycle)
Process (C-D, 4): C and D in different sets → add, union(C, D)

MST edges: (A-B, 1), (B-C, 2), (C-D, 4) — total weight = 7
```

### 2. Cycle Detection in Undirected Graphs

For each edge (u, v): if `find(u) == find(v)`, adding this edge creates a cycle. Otherwise, `union(u, v)`.

### 3. Connected Components

After processing all edges, `getComponents()` gives the number of connected components. Two nodes are in the same component iff `connected(u, v)` returns true.

### 4. Dynamic Connectivity

Union-Find handles incremental edge additions efficiently. (Note: it does **not** support edge deletions — for that you'd need a link-cut tree or offline algorithms.)

### 5. Image Processing

Labeling connected regions in binary images — each pixel is a node, adjacent same-colored pixels are unioned.

---

Next: **Segment Trees →**
