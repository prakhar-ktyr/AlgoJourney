---
title: Minimum Spanning Trees
---

# Minimum Spanning Trees

A **Minimum Spanning Tree (MST)** of a connected, undirected, weighted graph is a subset of edges that connects all vertices with the **minimum total edge weight** and forms no cycles.

---

## What Is a Spanning Tree?

A spanning tree of a graph with V vertices:
- Contains exactly **V - 1** edges
- Connects **all** vertices
- Has **no cycles**

A **minimum** spanning tree is the spanning tree with the smallest sum of edge weights.

```
Original graph:                MST (total weight = 10):

    1 ---4--- 2                    1 ---4--- 2
    |  \      |                    |         
  1 |   2\    |5                 1 |         
    |     \   |                    |         
    0 ---3--- 3                    0 ---3--- 3
       3                              3

Edges in MST: (0,1,1), (0,3,3), (1,2,4)
              or: (0,1,1), (1,3,2), (1,2,4)  ← weight=7, even better!

Actually: edges (0,1,1) + (1,3,2) + (1,2,4) = 7
```

---

## Properties of MST

1. **Unique if all edge weights are distinct** — otherwise multiple MSTs may exist.
2. **Cut property** — The lightest edge crossing any cut must be in the MST.
3. **Cycle property** — The heaviest edge in any cycle cannot be in the MST.
4. **V-1 edges** — Always exactly V-1 edges for V vertices.

---

## Kruskal's Algorithm

Kruskal's uses a **greedy approach**: sort all edges by weight and add them one by one, skipping edges that would create a cycle.

### Key Insight

Use **Union-Find (Disjoint Set Union)** to efficiently check if adding an edge creates a cycle.

### Steps

1. Sort all edges by weight (ascending).
2. Initialize Union-Find with V components.
3. For each edge (u, v, w) in sorted order:
   - If `u` and `v` are in different components:
     - Add this edge to the MST.
     - Union the two components.
   - If they're in the same component: skip (would create a cycle).
4. Stop when MST has V-1 edges.

### Trace

```
Graph edges: (0,1,1), (1,3,2), (0,3,3), (1,2,4), (2,3,5), (0,2,6)
V = 4

Sort by weight: (0,1,1), (1,3,2), (0,3,3), (1,2,4), (2,3,5), (0,2,6)

Components initially: {0} {1} {2} {3}

Edge (0,1,1): 0 and 1 in different sets → ADD ✓
  Components: {0,1} {2} {3}
  MST edges: [(0,1,1)]

Edge (1,3,2): 1 and 3 in different sets → ADD ✓
  Components: {0,1,3} {2}
  MST edges: [(0,1,1), (1,3,2)]

Edge (0,3,3): 0 and 3 in SAME set → SKIP ✗

Edge (1,2,4): 1 and 2 in different sets → ADD ✓
  Components: {0,1,2,3}
  MST edges: [(0,1,1), (1,3,2), (1,2,4)]

V-1 = 3 edges found. Done!
MST total weight = 1 + 2 + 4 = 7
```

---

## Prim's Algorithm

Prim's grows the MST from a starting vertex by always adding the **cheapest edge** that connects a vertex in the MST to one outside it.

### Steps

1. Start with any vertex in the MST set.
2. Use a priority queue to track the cheapest edge to each non-MST vertex.
3. Repeatedly:
   - Extract the minimum-weight edge connecting to a non-MST vertex.
   - Add that vertex to the MST.
   - Update the priority queue with edges from the new vertex.
4. Repeat until all vertices are in the MST.

### Trace

```
Graph (adjacency list):
  0: [(1,1), (3,3), (2,6)]
  1: [(0,1), (3,2), (2,4)]
  2: [(1,4), (3,5), (0,6)]
  3: [(1,2), (0,3), (2,5)]

Start from vertex 0. MST = {0}

Priority queue: [(1, vertex 1), (3, vertex 3), (6, vertex 2)]

Step 1: Extract (1, vertex 1) → add vertex 1 to MST
  MST = {0, 1}, Edge added: (0,1,1)
  Update PQ with edges from 1:
    vertex 3: min(3, 2) = 2  → update
    vertex 2: min(6, 4) = 4  → update
  PQ: [(2, vertex 3), (4, vertex 2)]

Step 2: Extract (2, vertex 3) → add vertex 3 to MST
  MST = {0, 1, 3}, Edge added: (1,3,2)
  Update PQ with edges from 3:
    vertex 2: min(4, 5) = 4  → no change
  PQ: [(4, vertex 2)]

Step 3: Extract (4, vertex 2) → add vertex 2 to MST
  MST = {0, 1, 2, 3}, Edge added: (1,2,4)

All vertices included. Done!
MST total weight = 1 + 2 + 4 = 7
```

---

## Implementation: Kruskal's Algorithm

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
        if (parent[x] != x)
            parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    bool unite(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false; // already in same set

        // union by rank
        if (rank_[px] < rank_[py]) swap(px, py);
        parent[py] = px;
        if (rank_[px] == rank_[py]) rank_[px]++;
        return true;
    }
};

pair<int, vector<Edge>> kruskal(int V, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    UnionFind uf(V);

    vector<Edge> mst;
    int totalWeight = 0;

    for (const auto& edge : edges) {
        if (uf.unite(edge.u, edge.v)) {
            mst.push_back(edge);
            totalWeight += edge.weight;
            if ((int)mst.size() == V - 1) break;
        }
    }

    return {totalWeight, mst};
}

int main() {
    int V = 4;
    vector<Edge> edges = {
        {0, 1, 1}, {1, 3, 2}, {0, 3, 3},
        {1, 2, 4}, {2, 3, 5}, {0, 2, 6}
    };

    auto [weight, mst] = kruskal(V, edges);

    cout << "MST total weight: " << weight << endl;
    cout << "MST edges:" << endl;
    for (const auto& e : mst) {
        cout << "  " << e.u << " -- " << e.v << " (weight " << e.weight << ")" << endl;
    }

    return 0;
}
```

```java
import java.util.*;

public class Kruskal {
    static int[] parent, rank;

    static int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    static boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;

        // union by rank
        if (rank[px] < rank[py]) { int tmp = px; px = py; py = tmp; }
        parent[py] = px;
        if (rank[px] == rank[py]) rank[px]++;
        return true;
    }

    public static void main(String[] args) {
        int V = 4;
        int[][] edges = {
            {0, 1, 1}, {1, 3, 2}, {0, 3, 3},
            {1, 2, 4}, {2, 3, 5}, {0, 2, 6}
        };

        // Sort edges by weight
        Arrays.sort(edges, (a, b) -> a[2] - b[2]);

        // Initialize Union-Find
        parent = new int[V];
        rank = new int[V];
        for (int i = 0; i < V; i++) parent[i] = i;

        List<int[]> mst = new ArrayList<>();
        int totalWeight = 0;

        for (int[] edge : edges) {
            if (union(edge[0], edge[1])) {
                mst.add(edge);
                totalWeight += edge[2];
                if (mst.size() == V - 1) break;
            }
        }

        System.out.println("MST total weight: " + totalWeight);
        System.out.println("MST edges:");
        for (int[] e : mst) {
            System.out.println("  " + e[0] + " -- " + e[1] + " (weight " + e[2] + ")");
        }
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
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # already in same set

        # union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True


def kruskal(V, edges):
    # Sort edges by weight
    edges.sort(key=lambda e: e[2])
    uf = UnionFind(V)

    mst = []
    total_weight = 0

    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
            total_weight += w
            if len(mst) == V - 1:
                break

    return total_weight, mst


# Example usage
V = 4
edges = [
    (0, 1, 1), (1, 3, 2), (0, 3, 3),
    (1, 2, 4), (2, 3, 5), (0, 2, 6),
]

weight, mst = kruskal(V, edges)
print(f"MST total weight: {weight}")
print("MST edges:")
for u, v, w in mst:
    print(f"  {u} -- {v} (weight {w})")
```

```javascript
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    let px = this.find(x);
    let py = this.find(y);
    if (px === py) return false; // already in same set

    // union by rank
    if (this.rank[px] < this.rank[py]) [px, py] = [py, px];
    this.parent[py] = px;
    if (this.rank[px] === this.rank[py]) this.rank[px]++;
    return true;
  }
}

function kruskal(V, edges) {
  // Sort edges by weight
  edges.sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(V);

  const mst = [];
  let totalWeight = 0;

  for (const [u, v, w] of edges) {
    if (uf.union(u, v)) {
      mst.push([u, v, w]);
      totalWeight += w;
      if (mst.length === V - 1) break;
    }
  }

  return { totalWeight, mst };
}

// Example usage
const V = 4;
const edges = [
  [0, 1, 1], [1, 3, 2], [0, 3, 3],
  [1, 2, 4], [2, 3, 5], [0, 2, 6],
];

const { totalWeight, mst } = kruskal(V, edges);
console.log(`MST total weight: ${totalWeight}`);
console.log("MST edges:");
for (const [u, v, w] of mst) {
  console.log(`  ${u} -- ${v} (weight ${w})`);
}
```

---

## Implementation: Prim's Algorithm

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

pair<int, vector<pair<int,int>>> prim(int V, vector<vector<pair<int,int>>>& adj) {
    vector<bool> inMST(V, false);
    vector<int> key(V, INT_MAX);   // minimum weight to reach vertex
    vector<int> parent(V, -1);

    // Min-heap: (weight, vertex)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;

    key[0] = 0;
    pq.push({0, 0});

    int totalWeight = 0;

    while (!pq.empty()) {
        auto [w, u] = pq.top();
        pq.pop();

        if (inMST[u]) continue;
        inMST[u] = true;
        totalWeight += w;

        for (auto [v, weight] : adj[u]) {
            if (!inMST[v] && weight < key[v]) {
                key[v] = weight;
                parent[v] = u;
                pq.push({weight, v});
            }
        }
    }

    // Build MST edges
    vector<pair<int,int>> mstEdges;
    for (int i = 1; i < V; i++) {
        if (parent[i] != -1) {
            mstEdges.push_back({parent[i], i});
        }
    }

    return {totalWeight, mstEdges};
}

int main() {
    int V = 4;
    vector<vector<pair<int,int>>> adj(V);

    // Undirected edges: (neighbor, weight)
    adj[0] = {{1, 1}, {3, 3}, {2, 6}};
    adj[1] = {{0, 1}, {3, 2}, {2, 4}};
    adj[2] = {{1, 4}, {3, 5}, {0, 6}};
    adj[3] = {{1, 2}, {0, 3}, {2, 5}};

    auto [weight, edges] = prim(V, adj);

    cout << "MST total weight: " << weight << endl;
    cout << "MST edges:" << endl;
    for (auto [u, v] : edges) {
        cout << "  " << u << " -- " << v << endl;
    }

    return 0;
}
```

```java
import java.util.*;

public class Prim {
    public static void main(String[] args) {
        int V = 4;
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        // Undirected edges: {neighbor, weight}
        adj.get(0).addAll(Arrays.asList(new int[]{1,1}, new int[]{3,3}, new int[]{2,6}));
        adj.get(1).addAll(Arrays.asList(new int[]{0,1}, new int[]{3,2}, new int[]{2,4}));
        adj.get(2).addAll(Arrays.asList(new int[]{1,4}, new int[]{3,5}, new int[]{0,6}));
        adj.get(3).addAll(Arrays.asList(new int[]{1,2}, new int[]{0,3}, new int[]{2,5}));

        boolean[] inMST = new boolean[V];
        int[] key = new int[V];
        int[] parent = new int[V];
        Arrays.fill(key, Integer.MAX_VALUE);
        Arrays.fill(parent, -1);

        // Min-heap: [weight, vertex]
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        key[0] = 0;
        pq.offer(new int[]{0, 0});

        int totalWeight = 0;

        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int w = top[0], u = top[1];

            if (inMST[u]) continue;
            inMST[u] = true;
            totalWeight += w;

            for (int[] edge : adj.get(u)) {
                int v = edge[0], weight = edge[1];
                if (!inMST[v] && weight < key[v]) {
                    key[v] = weight;
                    parent[v] = u;
                    pq.offer(new int[]{weight, v});
                }
            }
        }

        System.out.println("MST total weight: " + totalWeight);
        System.out.println("MST edges:");
        for (int i = 1; i < V; i++) {
            if (parent[i] != -1) {
                System.out.println("  " + parent[i] + " -- " + i);
            }
        }
    }
}
```

```python
import heapq

def prim(V, adj):
    in_mst = [False] * V
    key = [float('inf')] * V  # minimum weight to reach vertex
    parent = [-1] * V

    key[0] = 0
    # Min-heap: (weight, vertex)
    pq = [(0, 0)]
    total_weight = 0

    while pq:
        w, u = heapq.heappop(pq)

        if in_mst[u]:
            continue
        in_mst[u] = True
        total_weight += w

        for v, weight in adj[u]:
            if not in_mst[v] and weight < key[v]:
                key[v] = weight
                parent[v] = u
                heapq.heappush(pq, (weight, v))

    # Build MST edges
    mst_edges = []
    for i in range(1, V):
        if parent[i] != -1:
            mst_edges.append((parent[i], i, key[i]))

    return total_weight, mst_edges


# Example usage
V = 4
adj = [[] for _ in range(V)]

# Undirected edges: (neighbor, weight)
adj[0] = [(1, 1), (3, 3), (2, 6)]
adj[1] = [(0, 1), (3, 2), (2, 4)]
adj[2] = [(1, 4), (3, 5), (0, 6)]
adj[3] = [(1, 2), (0, 3), (2, 5)]

weight, mst = prim(V, adj)
print(f"MST total weight: {weight}")
print("MST edges:")
for u, v, w in mst:
    print(f"  {u} -- {v} (weight {w})")
```

```javascript
function prim(V, adj) {
  const inMST = new Array(V).fill(false);
  const key = new Array(V).fill(Infinity);
  const parent = new Array(V).fill(-1);

  key[0] = 0;
  // Simple priority queue (for clarity)
  const pq = [[0, 0]]; // [weight, vertex]
  let totalWeight = 0;

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u] = pq.shift();

    if (inMST[u]) continue;
    inMST[u] = true;
    totalWeight += w;

    for (const [v, weight] of adj[u]) {
      if (!inMST[v] && weight < key[v]) {
        key[v] = weight;
        parent[v] = u;
        pq.push([weight, v]);
      }
    }
  }

  // Build MST edges
  const mstEdges = [];
  for (let i = 1; i < V; i++) {
    if (parent[i] !== -1) {
      mstEdges.push([parent[i], i, key[i]]);
    }
  }

  return { totalWeight, mstEdges };
}

// Example usage
const V = 4;
const adj = Array.from({ length: V }, () => []);

// Undirected edges: [neighbor, weight]
adj[0] = [[1, 1], [3, 3], [2, 6]];
adj[1] = [[0, 1], [3, 2], [2, 4]];
adj[2] = [[1, 4], [3, 5], [0, 6]];
adj[3] = [[1, 2], [0, 3], [2, 5]];

const { totalWeight, mstEdges } = prim(V, adj);
console.log(`MST total weight: ${totalWeight}`);
console.log("MST edges:");
for (const [u, v, w] of mstEdges) {
  console.log(`  ${u} -- ${v} (weight ${w})`);
}
```

---

## Complexity Comparison

| Algorithm | Time | Space | Best for |
|-----------|------|-------|----------|
| Kruskal's | O(E log E) | O(V + E) | Sparse graphs (E ≈ V) |
| Prim's (binary heap) | O((V + E) log V) | O(V + E) | Dense graphs (E ≈ V²) |
| Prim's (Fibonacci heap) | O(E + V log V) | O(V + E) | Very dense graphs |

---

## Kruskal's vs Prim's

| Feature | Kruskal's | Prim's |
|---------|-----------|--------|
| Strategy | Global (sort all edges) | Local (grow from a vertex) |
| Data structure | Union-Find | Priority Queue |
| Graph format | Edge list | Adjacency list |
| Sparse graphs | Faster (fewer edges to sort) | More overhead |
| Dense graphs | Slower (many edges to sort) | More efficient |
| Disconnected graphs | Works (gives forest) | Needs modification |
| Parallel-friendly | Yes (independent edge checks) | Less so |

---

## When Multiple MSTs Exist

If some edges have equal weights, multiple valid MSTs may exist:

```
    A ---2--- B
    |         |
    2         2
    |         |
    C ---2--- D

All spanning trees have weight 6 (3 edges × 2).
Multiple valid MSTs exist:
  {AB, AC, CD}, {AB, BD, AC}, {AC, CD, BD}, ...
```

---

## Applications

- **Network design** — Laying cable/fiber with minimum total length.
- **Cluster analysis** — Remove the longest MST edges to form clusters.
- **Approximation algorithms** — MST gives a 2-approximation for the Traveling Salesman Problem.
- **Image segmentation** — Group pixels by treating the image as a graph.
- **Circuit design** — Minimize total wire length connecting components.

---

## Common Pitfalls

- **Forgetting undirected edges** — For Prim's using adjacency lists, add edges in both directions.
- **Not handling disconnected graphs** — Kruskal's naturally produces a spanning forest; Prim's needs to restart from unvisited vertices.
- **Union-Find without optimizations** — Without path compression and union by rank, find() degrades to O(V).
- **Stale entries in priority queue** — In Prim's, always check `if (inMST[u]) continue` when popping.

---

## Summary

- An MST connects all vertices with minimum total edge weight using V-1 edges.
- **Kruskal's**: sort edges, greedily add using Union-Find — great for sparse graphs.
- **Prim's**: grow from a vertex using a priority queue — great for dense graphs.
- Both produce correct MSTs; choose based on graph density.
- Union-Find with path compression + union by rank gives nearly O(1) per operation.

---

Next: **Two Pointers →**
