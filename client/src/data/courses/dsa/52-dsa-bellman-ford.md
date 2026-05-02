---
title: Bellman-Ford Algorithm
---

# Bellman-Ford Algorithm

The Bellman-Ford algorithm finds the **shortest path** from a single source to all other vertices, even when the graph contains **negative edge weights**. It can also detect **negative-weight cycles**.

---

## Why Not Just Use Dijkstra's?

Dijkstra's algorithm assumes non-negative weights. When negative weights exist, it may finalize a vertex's distance too early, missing a shorter path through a negative edge.

Bellman-Ford takes a different approach: instead of greedily finalizing vertices, it **relaxes all edges repeatedly** until no more improvements are possible.

---

## The Core Idea: Edge Relaxation

**Relaxation** means checking if a path through edge `(u, v)` with weight `w` provides a shorter route:

```
If dist[u] + w < dist[v]:
    dist[v] = dist[u] + w    ← we found a shorter path!
```

Bellman-Ford relaxes **all edges** exactly `V-1` times. Why V-1? Because the shortest path between any two vertices can have at most V-1 edges.

---

## Step-by-Step Trace

```
Graph edges (u, v, weight):
  (0, 1, 4)
  (0, 2, 5)
  (1, 2, -3)
  (2, 3, 4)
  (3, 1, -1)

5 vertices, Source = 0

Initial distances: [0, ∞, ∞, ∞, ∞]

── Iteration 1 (relax all edges) ──
  Edge (0,1,4):  dist[0]+4 = 4 < ∞   → dist[1] = 4
  Edge (0,2,5):  dist[0]+5 = 5 < ∞   → dist[2] = 5
  Edge (1,2,-3): dist[1]+(-3) = 1 < 5 → dist[2] = 1
  Edge (2,3,4):  dist[2]+4 = 5 < ∞   → dist[3] = 5
  Edge (3,1,-1): dist[3]+(-1) = 4 = 4 → no change

Distances after iter 1: [0, 4, 1, 5, ∞]

── Iteration 2 ──
  Edge (0,1,4):  dist[0]+4 = 4 = 4   → no change
  Edge (0,2,5):  dist[0]+5 = 5 > 1   → no change
  Edge (1,2,-3): dist[1]+(-3) = 1 = 1 → no change
  Edge (2,3,4):  dist[2]+4 = 5 = 5   → no change
  Edge (3,1,-1): dist[3]+(-1) = 4 = 4 → no change

Distances after iter 2: [0, 4, 1, 5, ∞]

No changes in iteration 2 → we can stop early!

Final shortest distances from 0: [0, 4, 1, 5, ∞]
(Vertex 4 is unreachable)
```

---

## Negative Cycle Detection

After V-1 iterations, if we can still relax any edge, then a **negative cycle** exists (a cycle whose total weight is negative). Traversing such a cycle reduces the distance infinitely.

```
Negative cycle example:

  0 --1-→ 1
           |
          -2
           |
           ↓
  3 ←-1-- 2
  |
  4 (edge 3→1)
           
Cycle: 1 → 2 → 3 → 1, weight = -2 + (-1) + 4 = 1? No...

Better example:
  1 --(-3)-→ 2 --(-2)-→ 3 --(4)-→ 1
  Cycle weight: -3 + (-2) + 4 = -1 (NEGATIVE!)

Each traversal of this cycle reduces distance by 1,
so shortest distance → -∞
```

The detection works by running one more iteration (the V-th). If any distance decreases, a negative cycle is reachable from the source.

---

## Algorithm Steps

1. Initialize `dist[source] = 0`, all others `= ∞`.
2. Repeat V-1 times:
   - For each edge `(u, v, w)`:
     - If `dist[u] + w < dist[v]`, update `dist[v] = dist[u] + w`.
3. Check for negative cycles:
   - For each edge `(u, v, w)`:
     - If `dist[u] + w < dist[v]`, a negative cycle exists.

---

## Implementation

```cpp
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

struct Edge {
    int u, v, weight;
};

vector<int> bellmanFord(int V, vector<Edge>& edges, int src) {
    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    // Relax all edges V-1 times
    for (int i = 0; i < V - 1; i++) {
        bool updated = false;
        for (const auto& edge : edges) {
            if (dist[edge.u] != INT_MAX &&
                dist[edge.u] + edge.weight < dist[edge.v]) {
                dist[edge.v] = dist[edge.u] + edge.weight;
                updated = true;
            }
        }
        // Early termination if no updates
        if (!updated) break;
    }

    // Check for negative-weight cycles
    for (const auto& edge : edges) {
        if (dist[edge.u] != INT_MAX &&
            dist[edge.u] + edge.weight < dist[edge.v]) {
            cout << "Graph contains a negative-weight cycle!" << endl;
            return {};
        }
    }

    return dist;
}

int main() {
    int V = 5;
    vector<Edge> edges = {
        {0, 1, 4},
        {0, 2, 5},
        {1, 2, -3},
        {2, 3, 4},
        {3, 1, -1}
    };

    vector<int> dist = bellmanFord(V, edges, 0);

    if (!dist.empty()) {
        cout << "Shortest distances from vertex 0:" << endl;
        for (int i = 0; i < V; i++) {
            if (dist[i] == INT_MAX)
                cout << "  To " << i << ": unreachable" << endl;
            else
                cout << "  To " << i << ": " << dist[i] << endl;
        }
    }

    return 0;
}
```

```java
import java.util.*;

public class BellmanFord {
    static int[] bellmanFord(int V, int[][] edges, int src) {
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;

        // Relax all edges V-1 times
        for (int i = 0; i < V - 1; i++) {
            boolean updated = false;
            for (int[] edge : edges) {
                int u = edge[0], v = edge[1], w = edge[2];
                if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    updated = true;
                }
            }
            // Early termination if no updates
            if (!updated) break;
        }

        // Check for negative-weight cycles
        for (int[] edge : edges) {
            int u = edge[0], v = edge[1], w = edge[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] + w < dist[v]) {
                System.out.println("Graph contains a negative-weight cycle!");
                return null;
            }
        }

        return dist;
    }

    public static void main(String[] args) {
        int V = 5;
        int[][] edges = {
            {0, 1, 4},
            {0, 2, 5},
            {1, 2, -3},
            {2, 3, 4},
            {3, 1, -1}
        };

        int[] dist = bellmanFord(V, edges, 0);

        if (dist != null) {
            System.out.println("Shortest distances from vertex 0:");
            for (int i = 0; i < V; i++) {
                if (dist[i] == Integer.MAX_VALUE)
                    System.out.println("  To " + i + ": unreachable");
                else
                    System.out.println("  To " + i + ": " + dist[i]);
            }
        }
    }
}
```

```python
def bellman_ford(V, edges, src):
    dist = [float('inf')] * V
    dist[src] = 0

    # Relax all edges V-1 times
    for i in range(V - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        # Early termination if no updates
        if not updated:
            break

    # Check for negative-weight cycles
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            print("Graph contains a negative-weight cycle!")
            return None

    return dist


# Example usage
V = 5
edges = [
    (0, 1, 4),
    (0, 2, 5),
    (1, 2, -3),
    (2, 3, 4),
    (3, 1, -1),
]

dist = bellman_ford(V, edges, 0)

if dist is not None:
    print("Shortest distances from vertex 0:")
    for i in range(V):
        if dist[i] == float('inf'):
            print(f"  To {i}: unreachable")
        else:
            print(f"  To {i}: {dist[i]}")
```

```javascript
function bellmanFord(V, edges, src) {
  const dist = new Array(V).fill(Infinity);
  dist[src] = 0;

  // Relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    let updated = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        updated = true;
      }
    }
    // Early termination if no updates
    if (!updated) break;
  }

  // Check for negative-weight cycles
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      console.log("Graph contains a negative-weight cycle!");
      return null;
    }
  }

  return dist;
}

// Example usage
const V = 5;
const edges = [
  [0, 1, 4],
  [0, 2, 5],
  [1, 2, -3],
  [2, 3, 4],
  [3, 1, -1],
];

const dist = bellmanFord(V, edges, 0);

if (dist !== null) {
  console.log("Shortest distances from vertex 0:");
  for (let i = 0; i < V; i++) {
    if (dist[i] === Infinity) {
      console.log(`  To ${i}: unreachable`);
    } else {
      console.log(`  To ${i}: ${dist[i]}`);
    }
  }
}
```

---

## Path Reconstruction

Track the parent of each vertex to reconstruct the actual shortest path:

```python
def bellman_ford_with_path(V, edges, src):
    dist = [float('inf')] * V
    parent = [-1] * V
    dist[src] = 0

    for i in range(V - 1):
        updated = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                updated = True
        if not updated:
            break

    # Negative cycle check
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None, None

    return dist, parent


def get_path(parent, dest):
    path = []
    current = dest
    while current != -1:
        path.append(current)
        current = parent[current]
    return path[::-1]


# Usage
V = 5
edges = [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4), (3, 1, -1)]

dist, parent = bellman_ford_with_path(V, edges, 0)
if dist:
    path = get_path(parent, 3)
    print(f"Path 0→3: {path}, cost: {dist[3]}")
    # Output: Path 0→3: [0, 1, 2, 3], cost: 5
```

---

## Complexity Analysis

| Aspect | Complexity |
|--------|-----------|
| Time | O(V × E) |
| Space | O(V) |

The algorithm iterates V-1 times and checks all E edges in each iteration.

---

## Bellman-Ford vs Dijkstra

| Feature | Dijkstra | Bellman-Ford |
|---------|----------|--------------|
| Negative weights | ❌ Cannot handle | ✅ Handles correctly |
| Negative cycle detection | ❌ Not possible | ✅ Built-in |
| Time complexity | O((V+E) log V) | O(V × E) |
| Approach | Greedy | Dynamic programming |
| Best for | Non-negative weights, faster | Negative weights, cycle detection |

**Rule of thumb**: Use Dijkstra's when all weights are non-negative (it's faster). Use Bellman-Ford when negative weights exist or you need cycle detection.

---

## Why V-1 Iterations?

The shortest path between any two vertices in a graph with V vertices can contain **at most V-1 edges** (visiting each vertex at most once). After iteration `k`, we've found all shortest paths using at most `k` edges.

```
V = 4, path with most edges:

  0 → 1 → 2 → 3   (3 edges = V-1)

After iter 1: paths with ≤ 1 edge are correct
After iter 2: paths with ≤ 2 edges are correct
After iter 3: paths with ≤ 3 edges are correct ← ALL paths correct
```

---

## Optimization: Early Termination

If no distance is updated during an entire iteration, the algorithm has converged and we can stop. This doesn't change the worst case but dramatically speeds up typical cases:

```
Best case:  O(E) — if edges are in a favorable order
Worst case: O(V × E) — when improvements happen in the last iteration
```

---

## Detecting Vertices Affected by Negative Cycles

Sometimes you need to know which vertices have their shortest paths affected (set to -∞) by negative cycles:

```python
def find_negative_cycle_vertices(V, edges, src):
    dist = [float('inf')] * V
    dist[src] = 0

    # Standard V-1 relaxations
    for i in range(V - 1):
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    # Run one more iteration to find affected vertices
    affected = set()
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            affected.add(v)

    # BFS/DFS from affected vertices to find all reachable vertices
    # (they're all affected too)
    # ... (extend as needed)

    return affected
```

---

## Applications

- **Currency arbitrage** — Detect if you can profit from cyclic currency exchange (negative cycle = profit opportunity).
- **Network routing** — RIP (Routing Information Protocol) uses a distributed Bellman-Ford.
- **Constraint satisfaction** — Solve difference constraint systems.
- **Game economics** — Detect exploitable economic loops in game systems.

---

## Common Pitfalls

- **Integer overflow** — When `dist[u]` is large and weight is positive, `dist[u] + w` can overflow. Always check `dist[u] != INT_MAX` first.
- **Forgetting early termination** — Without it, you always do V-1 iterations even if the answer is found in iteration 1.
- **Confusing with Dijkstra** — Remember: Bellman-Ford processes **edges**, not vertices.
- **Edge list format** — Unlike Dijkstra which uses adjacency lists, Bellman-Ford naturally uses an **edge list**.

---

## Summary

- Bellman-Ford handles **negative edge weights** where Dijkstra fails.
- Relaxes all edges V-1 times in O(V × E) time.
- Detects **negative cycles** with one extra iteration.
- Slower than Dijkstra but more versatile.
- Use early termination to improve average-case performance.

---

Next: **Minimum Spanning Trees →**
