---
title: Shortest Path Algorithms
---

# Shortest Path Algorithms

Finding the shortest path between two points is one of the most fundamental problems in graph theory and computer science. From GPS navigation to internet routing, shortest path algorithms power countless applications. In this lesson, we study BFS, Dijkstra's, Bellman-Ford, and Floyd-Warshall algorithms.

---

## The Shortest Path Problem

Given a weighted graph $G = (V, E, w)$ and a source vertex $s$, the **single-source shortest path (SSSP)** problem asks: what is the minimum-weight path from $s$ to every other vertex?

The **distance** from $s$ to $v$, denoted $d(s, v)$ or $\text{dist}(v)$, is the minimum total weight of any path from $s$ to $v$. If no path exists, $d(s, v) = \infty$.

For a path $P = (v_0, v_1, \ldots, v_k)$, its weight is:

$$w(P) = \sum_{i=0}^{k-1} w(v_i, v_{i+1})$$

---

## BFS for Unweighted Graphs

When all edges have equal weight (or weight 1), **Breadth-First Search** solves SSSP optimally.

### How It Works

1. Start at source $s$ with distance 0.
2. Use a queue. For each vertex $u$ dequeued, examine all neighbors $v$.
3. If $v$ is unvisited, set $\text{dist}(v) = \text{dist}(u) + 1$ and enqueue $v$.

### Complexity

- **Time:** $O(|V| + |E|)$
- **Space:** $O(|V|)$

BFS explores vertices in non-decreasing order of distance, guaranteeing optimality for unweighted graphs.

---

## Dijkstra's Algorithm

Dijkstra's algorithm solves SSSP for graphs with **non-negative edge weights**. It is a greedy algorithm that always processes the closest unvisited vertex.

### Algorithm Steps

1. Initialize $\text{dist}(s) = 0$ and $\text{dist}(v) = \infty$ for all $v \neq s$.
2. Use a min-priority queue. Insert $s$ with priority 0.
3. While the priority queue is not empty:
   - Extract vertex $u$ with minimum distance.
   - For each neighbor $v$ of $u$:
     - If $\text{dist}(u) + w(u, v) < \text{dist}(v)$:
       - Update $\text{dist}(v) = \text{dist}(u) + w(u, v)$.
       - Update $v$'s priority in the queue (or insert $v$).

### Relaxation

The operation of checking whether we can improve the shortest path to $v$ through $u$ is called **edge relaxation**:

$$\text{dist}(v) = \min(\text{dist}(v),\ \text{dist}(u) + w(u, v))$$

### Why Non-Negative Weights?

Dijkstra's relies on the invariant that once a vertex is extracted from the priority queue, its distance is final. Negative edges can violate this — a later path through a negative edge might be shorter.

### Complexity

- With a binary heap: $O((|V| + |E|) \log |V|)$
- With a Fibonacci heap: $O(|E| + |V| \log |V|)$
- With an adjacency matrix (no heap): $O(|V|^2)$

---

## Bellman-Ford Algorithm

Bellman-Ford solves SSSP even when edges have **negative weights**. It can also detect **negative-weight cycles**.

### Algorithm Steps

1. Initialize $\text{dist}(s) = 0$ and $\text{dist}(v) = \infty$ for all $v \neq s$.
2. Repeat $|V| - 1$ times:
   - For each edge $(u, v)$ with weight $w$:
     - Relax: if $\text{dist}(u) + w < \text{dist}(v)$, set $\text{dist}(v) = \text{dist}(u) + w$.
3. **Negative cycle detection:** Do one more pass over all edges. If any distance can still be reduced, a negative cycle exists.

### Why $|V| - 1$ Iterations?

A shortest path in a graph with $|V|$ vertices has at most $|V| - 1$ edges. After $k$ iterations, Bellman-Ford has found all shortest paths using at most $k$ edges. So after $|V| - 1$ iterations, all shortest paths are found.

### Complexity

- **Time:** $O(|V| \cdot |E|)$
- **Space:** $O(|V|)$

This is slower than Dijkstra's but handles negative weights correctly.

---

## Detecting Negative Cycles

A **negative cycle** is a cycle whose total edge weight is negative. If a negative cycle is reachable from the source, shortest paths are undefined (we can keep going around the cycle to reduce the total weight indefinitely, approaching $-\infty$).

Bellman-Ford detects negative cycles in its $(|V|)$-th iteration:
- After $|V| - 1$ relaxation rounds, all shortest paths are finalized (if no negative cycle exists).
- If the $|V|$-th round still finds an improvement, a negative cycle is reachable from the source.

---

## Floyd-Warshall: All-Pairs Shortest Paths

The **Floyd-Warshall** algorithm computes shortest paths between **all pairs** of vertices simultaneously.

### Idea

Define $d^{(k)}(i, j)$ = shortest path from $i$ to $j$ using only intermediate vertices from $\{1, 2, \ldots, k\}$.

**Recurrence:**

$$d^{(k)}(i, j) = \min\left(d^{(k-1)}(i, j),\quad d^{(k-1)}(i, k) + d^{(k-1)}(k, j)\right)$$

Base case: $d^{(0)}(i, j) = w(i, j)$ if edge exists, $0$ if $i = j$, $\infty$ otherwise.

### Complexity

- **Time:** $O(|V|^3)$
- **Space:** $O(|V|^2)$

### When to Use

- When you need shortest paths between all pairs.
- Small to medium graphs (up to a few hundred vertices).
- Can detect negative cycles: if $d(i, i) < 0$ for any vertex $i$.

---

## Comparison of Algorithms

| Algorithm | Weights | Negative Cycles | Time | Use Case |
|-----------|---------|-----------------|------|----------|
| BFS | Unweighted | N/A | $O(\|V\| + \|E\|)$ | Unweighted SSSP |
| Dijkstra | Non-negative | Cannot handle | $O((\|V\| + \|E\|) \log \|V\|)$ | Weighted SSSP (no negatives) |
| Bellman-Ford | Any | Detects | $O(\|V\| \cdot \|E\|)$ | SSSP with negatives |
| Floyd-Warshall | Any | Detects | $O(\|V\|^3)$ | All-pairs shortest paths |

---

## Applications

1. **GPS and navigation:** Dijkstra's algorithm powers map routing (road weights = travel time or distance).
2. **Internet routing:** OSPF (Open Shortest Path First) uses Dijkstra's; RIP (Routing Information Protocol) uses Bellman-Ford.
3. **Social networks:** Shortest paths measure degrees of separation.
4. **Currency arbitrage:** Negative cycles in log-transformed exchange rate graphs indicate arbitrage opportunities.
5. **Game AI:** Pathfinding in grids and game maps.
6. **Network flow:** Shortest path algorithms are subroutines in max-flow and min-cost flow algorithms.

---

## Worked Example: Dijkstra's

Graph with vertices $\{A, B, C, D, E\}$, source = $A$:

| Edge | Weight |
|------|--------|
| (A,B) | 4 |
| (A,C) | 2 |
| (B,D) | 3 |
| (B,E) | 1 |
| (C,B) | 1 |
| (C,D) | 5 |
| (D,E) | 2 |

**Execution:**

| Step | Extracted | dist(A) | dist(B) | dist(C) | dist(D) | dist(E) |
|------|-----------|---------|---------|---------|---------|---------|
| Init | — | 0 | ∞ | ∞ | ∞ | ∞ |
| 1 | A | 0 | 4 | 2 | ∞ | ∞ |
| 2 | C | 0 | 3 | 2 | 7 | ∞ |
| 3 | B | 0 | 3 | 2 | 6 | 4 |
| 4 | E | 0 | 3 | 2 | 6 | 4 |
| 5 | D | 0 | 3 | 2 | 6 | 4 |

**Shortest paths from A:** A→A = 0, A→C = 2, A→C→B = 3, A→C→B→E = 4, A→C→B→D = 6.

---

## Code: Dijkstra's Algorithm

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

typedef pair<int,int> pii; // (distance, vertex)

vector<int> dijkstra(int n, vector<vector<pii>>& adj, int src) {
    vector<int> dist(n, INT_MAX);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // outdated entry
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
    int n = 5; // 0=A, 1=B, 2=C, 3=D, 4=E
    vector<vector<pii>> adj(n);
    adj[0] = {{1,4},{2,2}};
    adj[1] = {{3,3},{4,1}};
    adj[2] = {{1,1},{3,5}};
    adj[3] = {{4,2}};

    vector<int> dist = dijkstra(n, adj, 0);
    string names[] = {"A","B","C","D","E"};
    for (int i = 0; i < n; i++) {
        cout << "dist(A," << names[i] << ") = " << dist[i] << endl;
    }
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class Dijkstra {
    static int[] ShortestPaths(int n, List<(int v, int w)>[] adj, int src) {
        int[] dist = new int[n];
        Array.Fill(dist, int.MaxValue);
        dist[src] = 0;
        var pq = new SortedSet<(int d, int v)> { (0, src) };

        while (pq.Count > 0) {
            var (d, u) = pq.Min;
            pq.Remove(pq.Min);
            if (d > dist[u]) continue;
            foreach (var (v, w) in adj[u]) {
                if (dist[u] + w < dist[v]) {
                    pq.Remove((dist[v], v));
                    dist[v] = dist[u] + w;
                    pq.Add((dist[v], v));
                }
            }
        }
        return dist;
    }

    static void Main() {
        int n = 5;
        var adj = new List<(int, int)>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<(int, int)>();
        adj[0].Add((1,4)); adj[0].Add((2,2));
        adj[1].Add((3,3)); adj[1].Add((4,1));
        adj[2].Add((1,1)); adj[2].Add((3,5));
        adj[3].Add((4,2));

        int[] dist = ShortestPaths(n, adj, 0);
        string[] names = {"A","B","C","D","E"};
        for (int i = 0; i < n; i++) {
            Console.WriteLine($"dist(A,{names[i]}) = {dist[i]}");
        }
    }
}
```

```java
import java.util.*;

public class DijkstraAlgorithm {
    static int[] dijkstra(int n, List<int[]>[] adj, int src) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        // priority queue: [distance, vertex]
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.offer(new int[]{0, src});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int d = curr[0], u = curr[1];
            if (d > dist[u]) continue;
            for (int[] edge : adj[u]) {
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
        int n = 5;
        List<int[]>[] adj = new ArrayList[n];
        for (int i = 0; i < n; i++) adj[i] = new ArrayList<>();
        adj[0].add(new int[]{1,4}); adj[0].add(new int[]{2,2});
        adj[1].add(new int[]{3,3}); adj[1].add(new int[]{4,1});
        adj[2].add(new int[]{1,1}); adj[2].add(new int[]{3,5});
        adj[3].add(new int[]{4,2});

        int[] dist = dijkstra(n, adj, 0);
        String[] names = {"A","B","C","D","E"};
        for (int i = 0; i < n; i++) {
            System.out.println("dist(A," + names[i] + ") = " + dist[i]);
        }
    }
}
```

```python
import heapq

def dijkstra(n, adj, src):
    dist = [float('inf')] * n
    dist[src] = 0
    pq = [(0, src)]  # (distance, vertex)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))

    return dist

# Build graph: 0=A, 1=B, 2=C, 3=D, 4=E
n = 5
adj = [[] for _ in range(n)]
adj[0] = [(1, 4), (2, 2)]
adj[1] = [(3, 3), (4, 1)]
adj[2] = [(1, 1), (3, 5)]
adj[3] = [(4, 2)]

dist = dijkstra(n, adj, 0)
names = ["A", "B", "C", "D", "E"]
for i in range(n):
    print(f"dist(A,{names[i]}) = {dist[i]}")
```

```javascript
function dijkstra(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  // Simple priority queue using sorted array (for clarity)
  const pq = [[0, src]]; // [distance, vertex]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
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

// Build graph: 0=A, 1=B, 2=C, 3=D, 4=E
const n = 5;
const adj = Array.from({ length: n }, () => []);
adj[0] = [[1, 4], [2, 2]];
adj[1] = [[3, 3], [4, 1]];
adj[2] = [[1, 1], [3, 5]];
adj[3] = [[4, 2]];

const dist = dijkstra(n, adj, 0);
const names = ["A", "B", "C", "D", "E"];
for (let i = 0; i < n; i++) {
  console.log(`dist(A,${names[i]}) = ${dist[i]}`);
}
```

---

## Key Takeaways

1. **BFS** solves shortest paths in unweighted graphs in $O(|V| + |E|)$ — always the first choice when edges are unweighted.
2. **Dijkstra's algorithm** is the go-to for non-negative weighted graphs, running in $O((|V| + |E|) \log |V|)$ with a binary heap.
3. **Bellman-Ford** handles negative edge weights at the cost of $O(|V| \cdot |E|)$ time, and can detect negative cycles.
4. **Floyd-Warshall** computes all-pairs shortest paths in $O(|V|^3)$ — ideal for small dense graphs or when all pairwise distances are needed.
5. **Negative cycles** make shortest paths undefined; Bellman-Ford and Floyd-Warshall can both detect them.
6. The **relaxation** principle — $\text{dist}(v) = \min(\text{dist}(v), \text{dist}(u) + w(u, v))$ — underpins all shortest path algorithms.
7. These algorithms have vast applications: GPS routing, network protocols, social network analysis, and game AI.
