---
title: Minimum Spanning Trees
---

# Minimum Spanning Trees

In many real-world problems — designing communication networks, laying pipelines, or wiring electrical circuits — we want to connect all points at minimum total cost. The Minimum Spanning Tree (MST) formalizes this problem. In this lesson, we explore MST theory and two classic greedy algorithms: Kruskal's and Prim's.

---

## Weighted Graphs Review

A **weighted graph** $G = (V, E, w)$ assigns a weight (or cost) $w(e)$ to each edge $e \in E$. The weight of a subgraph is the sum of all its edge weights:

$$w(H) = \sum_{e \in E(H)} w(e)$$

We typically work with undirected, connected, weighted graphs when discussing spanning trees.

---

## What Is a Spanning Tree?

A **spanning tree** of a connected graph $G = (V, E)$ is a subgraph $T = (V, E')$ such that:
- $T$ is a tree (connected and acyclic).
- $T$ includes all vertices of $G$.
- $T$ has exactly $|V| - 1$ edges.

A connected graph with $n$ vertices may have many spanning trees. For example, the complete graph $K_n$ has $n^{n-2}$ spanning trees (Cayley's formula).

---

## Minimum Spanning Tree (MST)

A **minimum spanning tree** of a weighted graph $G$ is a spanning tree $T$ with the smallest possible total edge weight:

$$\text{MST} = \arg\min_{T \text{ spanning tree}} \sum_{e \in T} w(e)$$

**Properties of MST:**
- An MST always has exactly $|V| - 1$ edges.
- If all edge weights are distinct, the MST is unique.
- If some edge weights are equal, there may be multiple MSTs (all with the same total weight).

---

## The Cut Property

The **cut property** is the theoretical foundation for why greedy MST algorithms work.

**Cut:** A partition of the vertices into two non-empty sets $S$ and $V \setminus S$.

**Crossing edge:** An edge with one endpoint in $S$ and the other in $V \setminus S$.

**Cut Property Theorem:** For any cut of the graph, the minimum-weight crossing edge belongs to some MST.

This tells us: at every step, if we pick the cheapest edge crossing some cut, we are safe — it will be part of an MST.

---

## Kruskal's Algorithm

Kruskal's algorithm builds the MST by greedily adding the cheapest edge that does not create a cycle.

### Algorithm Steps

1. Sort all edges by weight in non-decreasing order.
2. Initialize each vertex as its own component (using Union-Find).
3. For each edge $(u, v)$ in sorted order:
   - If $u$ and $v$ are in different components, add the edge to MST and merge their components.
   - Otherwise, skip the edge (it would create a cycle).
4. Stop when the MST has $|V| - 1$ edges.

### Time Complexity

- Sorting edges: $O(|E| \log |E|)$
- Union-Find operations: nearly $O(|E| \cdot \alpha(|V|))$ where $\alpha$ is the inverse Ackermann function (effectively constant).
- **Overall:** $O(|E| \log |E|)$

### Why It Works

Each edge added is the cheapest crossing edge for the cut separating the two components being merged. By the cut property, this edge belongs to an MST.

---

## Prim's Algorithm

Prim's algorithm grows the MST from a single starting vertex, always adding the cheapest edge connecting the current tree to a new vertex.

### Algorithm Steps

1. Start with any vertex $s$. Initialize the tree $T = \{s\}$.
2. Use a priority queue (min-heap) to track edges from $T$ to vertices not yet in $T$.
3. Repeat until $T$ contains all vertices:
   - Extract the minimum-weight edge $(u, v)$ where $u \in T$ and $v \notin T$.
   - Add $v$ to $T$ and add edge $(u, v)$ to the MST.
   - Update the priority queue with edges from $v$ to its neighbors not in $T$.

### Time Complexity

- With a binary heap: $O((|V| + |E|) \log |V|)$
- With a Fibonacci heap: $O(|E| + |V| \log |V|)$
- **For dense graphs** ($|E| \approx |V|^2$): Fibonacci heap gives $O(|V|^2)$, which is optimal.

### Why It Works

At each step, the tree $T$ defines a cut $(T, V \setminus T)$. The algorithm picks the minimum-weight crossing edge, which by the cut property belongs to an MST.

---

## Comparison: Kruskal vs Prim

| Aspect | Kruskal's | Prim's |
|--------|-----------|--------|
| Approach | Edge-centric (sort all edges) | Vertex-centric (grow from a vertex) |
| Data structure | Union-Find | Priority queue (min-heap) |
| Best for | Sparse graphs ($\|E\| \ll \|V\|^2$) | Dense graphs ($\|E\| \approx \|V\|^2$) |
| Complexity | $O(\|E\| \log \|E\|)$ | $O((\|V\| + \|E\|) \log \|V\|)$ |
| Parallelizable | Yes (edges are independent) | Less so (sequential growth) |
| Disconnected graphs | Produces MST forest naturally | Needs separate runs per component |

---

## Applications of MST

1. **Network design:** Laying cables, pipelines, or roads to connect cities at minimum cost.
2. **Approximation algorithms:** MST gives a 2-approximation for the Traveling Salesman Problem (TSP) on metric graphs.
3. **Clustering:** Removing the $k-1$ most expensive MST edges produces $k$ clusters (single-linkage clustering).
4. **Image segmentation:** Grouping pixels based on similarity weights.
5. **Circuit design:** Minimizing wire length in VLSI design.

---

## Worked Example

Consider the graph with vertices $\{A, B, C, D, E\}$ and edges:

| Edge | Weight |
|------|--------|
| (A,B) | 4 |
| (A,C) | 1 |
| (B,C) | 3 |
| (B,D) | 2 |
| (C,D) | 5 |
| (C,E) | 6 |
| (D,E) | 7 |

**Kruskal's execution:**
1. Sort: (A,C)=1, (B,D)=2, (B,C)=3, (A,B)=4, (C,D)=5, (C,E)=6, (D,E)=7
2. Add (A,C)=1 → components: {A,C}, {B}, {D}, {E}
3. Add (B,D)=2 → components: {A,C}, {B,D}, {E}
4. Add (B,C)=3 → components: {A,B,C,D}, {E}
5. Skip (A,B)=4 → A and B already connected
6. Skip (C,D)=5 → C and D already connected
7. Add (C,E)=6 → components: {A,B,C,D,E}

**MST weight:** $1 + 2 + 3 + 6 = 12$

---

## Code: Kruskal's Algorithm with Union-Find

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

class UnionFind {
    vector<int> parent, rank_;
public:
    UnionFind(int n) : parent(n), rank_(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }
    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank_[px] < rank_[py]) swap(px, py);
        parent[py] = px;
        if (rank_[px] == rank_[py]) rank_[px]++;
        return true;
    }
};

int main() {
    int n = 5; // vertices: 0=A, 1=B, 2=C, 3=D, 4=E
    vector<Edge> edges = {
        {0,1,4}, {0,2,1}, {1,2,3}, {1,3,2}, {2,3,5}, {2,4,6}, {3,4,7}
    };
    sort(edges.begin(), edges.end());

    UnionFind uf(n);
    vector<Edge> mst;
    int totalWeight = 0;

    for (auto& e : edges) {
        if (uf.unite(e.u, e.v)) {
            mst.push_back(e);
            totalWeight += e.weight;
            if ((int)mst.size() == n - 1) break;
        }
    }

    cout << "MST edges:" << endl;
    for (auto& e : mst) {
        cout << e.u << " -- " << e.v << " (weight " << e.weight << ")" << endl;
    }
    cout << "Total MST weight: " << totalWeight << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class Edge : IComparable<Edge> {
    public int U, V, Weight;
    public Edge(int u, int v, int weight) { U = u; V = v; Weight = weight; }
    public int CompareTo(Edge other) => Weight.CompareTo(other.Weight);
}

class UnionFind {
    private int[] parent, rank;
    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    public int Find(int x) {
        if (parent[x] != x) parent[x] = Find(parent[x]);
        return parent[x];
    }
    public bool Unite(int x, int y) {
        int px = Find(x), py = Find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) (px, py) = (py, px);
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }
}

class Kruskal {
    static void Main() {
        int n = 5;
        var edges = new List<Edge> {
            new Edge(0,1,4), new Edge(0,2,1), new Edge(1,2,3),
            new Edge(1,3,2), new Edge(2,3,5), new Edge(2,4,6), new Edge(3,4,7)
        };
        edges.Sort();

        var uf = new UnionFind(n);
        var mst = new List<Edge>();
        int totalWeight = 0;

        foreach (var e in edges) {
            if (uf.Unite(e.U, e.V)) {
                mst.Add(e);
                totalWeight += e.Weight;
                if (mst.Count == n - 1) break;
            }
        }

        Console.WriteLine("MST edges:");
        foreach (var e in mst) {
            Console.WriteLine($"{e.U} -- {e.V} (weight {e.Weight})");
        }
        Console.WriteLine($"Total MST weight: {totalWeight}");
    }
}
```

```java
import java.util.*;

public class Kruskal {
    static int[] parent, rank;

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    static boolean unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }

    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0,1,4},{0,2,1},{1,2,3},{1,3,2},{2,3,5},{2,4,6},{3,4,7}};
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);

        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        List<int[]> mst = new ArrayList<>();
        int totalWeight = 0;

        for (int[] e : edges) {
            if (unite(e[0], e[1])) {
                mst.add(e);
                totalWeight += e[2];
                if (mst.size() == n - 1) break;
            }
        }

        System.out.println("MST edges:");
        for (int[] e : mst) {
            System.out.println(e[0] + " -- " + e[1] + " (weight " + e[2] + ")");
        }
        System.out.println("Total MST weight: " + totalWeight);
    }
}
```

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def unite(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True

def kruskal(n, edges):
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(n)
    mst = []
    total_weight = 0

    for u, v, w in edges:
        if uf.unite(u, v):
            mst.append((u, v, w))
            total_weight += w
            if len(mst) == n - 1:
                break

    return mst, total_weight

# Example: 0=A, 1=B, 2=C, 3=D, 4=E
edges = [(0,1,4), (0,2,1), (1,2,3), (1,3,2), (2,3,5), (2,4,6), (3,4,7)]
mst, total = kruskal(5, edges)

print("MST edges:")
for u, v, w in mst:
    print(f"  {u} -- {v} (weight {w})")
print(f"Total MST weight: {total}")
```

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  unite(x, y) {
    let px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) [px, py] = [py, px];
    this.parent[py] = px;
    if (this.rank[px] === this.rank[py]) this.rank[px]++;
    return true;
  }
}

function kruskal(n, edges) {
  edges.sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(n);
  const mst = [];
  let totalWeight = 0;

  for (const [u, v, w] of edges) {
    if (uf.unite(u, v)) {
      mst.push([u, v, w]);
      totalWeight += w;
      if (mst.length === n - 1) break;
    }
  }

  return { mst, totalWeight };
}

// Example: 0=A, 1=B, 2=C, 3=D, 4=E
const edges = [[0,1,4],[0,2,1],[1,2,3],[1,3,2],[2,3,5],[2,4,6],[3,4,7]];
const { mst, totalWeight } = kruskal(5, edges);

console.log("MST edges:");
mst.forEach(([u, v, w]) => console.log(`  ${u} -- ${v} (weight ${w})`));
console.log(`Total MST weight: ${totalWeight}`);
```

---

## Key Takeaways

1. A **Minimum Spanning Tree** connects all vertices of a weighted graph with the minimum total edge weight using exactly $|V| - 1$ edges.
2. The **cut property** guarantees that the lightest edge crossing any cut belongs to some MST — this is why greedy algorithms work.
3. **Kruskal's algorithm** sorts edges globally and uses Union-Find to avoid cycles — best for sparse graphs at $O(|E| \log |E|)$.
4. **Prim's algorithm** grows the MST from a vertex using a priority queue — best for dense graphs at $O((|V| + |E|) \log |V|)$.
5. MSTs have wide applications: network design, clustering, approximation algorithms, and image segmentation.
6. If all edge weights are distinct, the MST is **unique**; otherwise multiple MSTs may exist with the same total weight.
