---
title: Dijkstra's Algorithm
---

# Dijkstra's Algorithm

Dijkstra's algorithm finds the **shortest path** from a single source vertex to all other vertices in a weighted graph with **non-negative edge weights**.

---

## The Problem

Given a weighted graph and a starting vertex, find the minimum cost to reach every other vertex.

```
Example graph:

        10
   0 ────────→ 1
   |           / |
 5 |        3/   | 1
   |        /    |
   ↓      ↓     ↓
   2 ────→ 3 ──→ 4
      2        6

Shortest paths from vertex 0:
  0 → 0: cost 0
  0 → 1: cost 8  (0→2→3→1)
  0 → 2: cost 5  (0→2)
  0 → 3: cost 7  (0→2→3)
  0 → 4: cost 9  (0→2→3→1→4)
```

---

## The Greedy Idea

Dijkstra's algorithm works on a simple **greedy** principle:

> Always process the unvisited vertex with the smallest known distance.

Once a vertex is processed, its distance is finalized and never updated again. This greedy choice works because all edge weights are non-negative — taking a detour through other vertices can never produce a shorter path.

---

## Step-by-Step Trace

```
Graph (adjacency list with weights):
  0: [(1,10), (2,5)]
  1: [(3,3), (4,1)]
  2: [(3,2)]
  3: [(1,3), (4,6)]
  4: []

Source = 0
Initial distances: [0, ∞, ∞, ∞, ∞]

Step 1: Pick vertex 0 (dist=0)
  Update 1: min(∞, 0+10) = 10
  Update 2: min(∞, 0+5) = 5
  Distances: [0, 10, 5, ∞, ∞]
  Processed: {0}

Step 2: Pick vertex 2 (dist=5) — smallest unprocessed
  Update 3: min(∞, 5+2) = 7
  Distances: [0, 10, 5, 7, ∞]
  Processed: {0, 2}

Step 3: Pick vertex 3 (dist=7)
  Update 1: min(10, 7+3) = 10 → no change (equal)
  Update 4: min(∞, 7+6) = 13
  Distances: [0, 10, 5, 7, 13]
  Processed: {0, 2, 3}

Step 4: Pick vertex 1 (dist=10)
  Update 3: min(7, 10+3) = 7 → no change
  Update 4: min(13, 10+1) = 11
  Distances: [0, 10, 5, 7, 11]
  Processed: {0, 2, 3, 1}

Step 5: Pick vertex 4 (dist=11)
  No outgoing edges
  Distances: [0, 10, 5, 7, 11]
  Processed: {0, 2, 3, 1, 4}

Final shortest distances from 0: [0, 10, 5, 7, 11]
```

---

## Algorithm (Priority Queue Version)

1. Initialize distances: `dist[source] = 0`, all others `= ∞`.
2. Insert `(0, source)` into a min-priority queue.
3. While the priority queue is not empty:
   - Extract the vertex `u` with minimum distance.
   - If `u` is already processed, skip it.
   - Mark `u` as processed.
   - For each neighbor `v` with edge weight `w`:
     - If `dist[u] + w < dist[v]`:
       - Update `dist[v] = dist[u] + w`
       - Insert `(dist[v], v)` into the priority queue.
4. `dist[]` now contains shortest distances from source.

---

## Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

vector<int> dijkstra(int V, vector<vector<pair<int,int>>>& adj, int src) {
    vector<int> dist(V, INT_MAX);
    // Min-heap: (distance, vertex)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        // Skip if we've already found a better path
        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    return dist;
}

int main() {
    int V = 5;
    vector<vector<pair<int,int>>> adj(V);

    // Edge: (destination, weight)
    adj[0] = {{1, 10}, {2, 5}};
    adj[1] = {{3, 3}, {4, 1}};
    adj[2] = {{3, 2}};
    adj[3] = {{1, 3}, {4, 6}};

    vector<int> dist = dijkstra(V, adj, 0);

    cout << "Shortest distances from vertex 0:" << endl;
    for (int i = 0; i < V; i++) {
        cout << "  To " << i << ": " << dist[i] << endl;
    }

    return 0;
}
```

```java
import java.util.*;

public class Dijkstra {
    public static int[] dijkstra(int V, List<List<int[]>> adj, int src) {
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);

        // Min-heap: [distance, vertex]
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);

        dist[src] = 0;
        pq.offer(new int[]{0, src});

        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];

            // Skip if we've already found a better path
            if (d > dist[u]) continue;

            for (int[] edge : adj.get(u)) {
                int v = edge[0], w = edge[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.offer(new int[]{dist[v], v});
                }
            }
        }

        return dist;
    }

    public static void main(String[] args) {
        int V = 5;
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        // Edge: {destination, weight}
        adj.get(0).add(new int[]{1, 10});
        adj.get(0).add(new int[]{2, 5});
        adj.get(1).add(new int[]{3, 3});
        adj.get(1).add(new int[]{4, 1});
        adj.get(2).add(new int[]{3, 2});
        adj.get(3).add(new int[]{1, 3});
        adj.get(3).add(new int[]{4, 6});

        int[] dist = dijkstra(V, adj, 0);

        System.out.println("Shortest distances from vertex 0:");
        for (int i = 0; i < V; i++) {
            System.out.println("  To " + i + ": " + dist[i]);
        }
    }
}
```

```python
import heapq

def dijkstra(V, adj, src):
    dist = [float('inf')] * V
    dist[src] = 0

    # Min-heap: (distance, vertex)
    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)

        # Skip if we've already found a better path
        if d > dist[u]:
            continue

        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist


# Example usage
V = 5
adj = [[] for _ in range(V)]

# Edge: (destination, weight)
adj[0] = [(1, 10), (2, 5)]
adj[1] = [(3, 3), (4, 1)]
adj[2] = [(3, 2)]
adj[3] = [(1, 3), (4, 6)]

dist = dijkstra(V, adj, 0)

print("Shortest distances from vertex 0:")
for i in range(V):
    print(f"  To {i}: {dist[i]}")
```

```javascript
function dijkstra(V, adj, src) {
  const dist = new Array(V).fill(Infinity);
  dist[src] = 0;

  // Simple priority queue using an array (for clarity)
  // In production, use a proper min-heap
  const pq = [[0, src]]; // [distance, vertex]

  while (pq.length > 0) {
    // Find and remove minimum
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();

    // Skip if we've already found a better path
    if (d > dist[u]) continue;

    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        pq.push([dist[v], v]);
      }
    }
  }

  return dist;
}

// Example usage
const V = 5;
const adj = Array.from({ length: V }, () => []);

// Edge: [destination, weight]
adj[0] = [[1, 10], [2, 5]];
adj[1] = [[3, 3], [4, 1]];
adj[2] = [[3, 2]];
adj[3] = [[1, 3], [4, 6]];

const dist = dijkstra(V, adj, 0);

console.log("Shortest distances from vertex 0:");
for (let i = 0; i < V; i++) {
  console.log(`  To ${i}: ${dist[i]}`);
}
```

---

## Reconstructing the Shortest Path

To find the actual path (not just the distance), track the **parent** of each vertex:

```python
import heapq

def dijkstra_with_path(V, adj, src):
    dist = [float('inf')] * V
    parent = [-1] * V
    dist[src] = 0

    pq = [(0, src)]

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                heapq.heappush(pq, (dist[v], v))

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
adj = [[] for _ in range(V)]
adj[0] = [(1, 10), (2, 5)]
adj[1] = [(3, 3), (4, 1)]
adj[2] = [(3, 2)]
adj[3] = [(1, 3), (4, 6)]

dist, parent = dijkstra_with_path(V, adj, 0)
path = get_path(parent, 4)
print(f"Shortest path 0→4: {path}, cost: {dist[4]}")
# Output: Shortest path 0→4: [0, 2, 3, 1, 4], cost: 11
```

---

## Complexity Analysis

| Implementation | Time | Space |
|----------------|------|-------|
| Binary heap (priority queue) | O((V + E) log V) | O(V + E) |
| Fibonacci heap | O(V log V + E) | O(V + E) |
| Simple array (no heap) | O(V²) | O(V) |

The binary heap version is the most practical. Use the array version for dense graphs (E ≈ V²).

---

## Why No Negative Weights?

Dijkstra's relies on the fact that once a vertex is processed, its distance is final. With negative weights, a later path through a negative edge could improve an already-finalized distance.

```
Counter-example:

    0 --5--> 1
    |         |
    2        -4
    |         |
    v         v
    2 --1--> 3

Dijkstra processes 2 (dist=2) before discovering 0→1→3→2 (dist=5-4+1=2).
But what if the -4 edge made it 0→1→3 = 1, which is less than
the direct path? Dijkstra wouldn't catch it.
```

For graphs with negative weights, use **Bellman-Ford** (next lesson).

---

## Common Pitfalls

- **Using with negative weights** — Produces incorrect results. Use Bellman-Ford instead.
- **Not skipping stale entries** — Without the `if (d > dist[u]) continue` check, you process vertices multiple times, wasting time.
- **Integer overflow** — When adding `dist[u] + w`, ensure it doesn't overflow. Use `long` for large weights.
- **Undirected graphs** — Add edges in both directions when building the adjacency list.

---

## Applications

- **GPS navigation** — Finding shortest routes between locations.
- **Network routing** — OSPF protocol uses Dijkstra's for routing packets.
- **Flight booking** — Finding cheapest flights with connections.
- **Game pathfinding** — Moving characters through weighted terrain.

---

## Summary

- Dijkstra's finds shortest paths from a single source in O((V+E) log V).
- Uses a greedy approach with a priority queue.
- Requires **non-negative** edge weights.
- Track parent pointers to reconstruct actual paths.

---

Next: **Bellman-Ford →**
