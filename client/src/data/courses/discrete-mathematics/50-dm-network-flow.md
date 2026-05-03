---
title: Network Flow & Matching
---

# Network Flow & Matching

Network flow is one of the most powerful frameworks in combinatorial optimization. It models problems where something (data, goods, fluid) must be transported through a network from a source to a sink, subject to capacity constraints.

## Flow Networks

A **flow network** is a directed graph $G = (V, E)$ with:

- A **source** vertex $s$ (where flow originates)
- A **sink** vertex $t$ (where flow is consumed)
- A **capacity function** $c: E \to \mathbb{R}^+$ assigning a non-negative capacity to each edge

A **flow** is a function $f: E \to \mathbb{R}^+$ satisfying:

1. **Capacity constraint**: $0 \le f(u,v) \le c(u,v)$ for all edges $(u,v) \in E$
2. **Flow conservation**: For every vertex $v \ne s, t$:

$$\sum_{u:(u,v) \in E} f(u,v) = \sum_{w:(v,w) \in E} f(v,w)$$

The **value of a flow** $|f|$ is the total flow leaving the source:

$$|f| = \sum_{v:(s,v) \in E} f(s,v)$$

### Example Flow Network

Consider a network with vertices $\{s, a, b, c, t\}$:

```
       10        8
  s ------→ a ------→ t
  |          |         ↑
  |5         |3        |7
  ↓          ↓         |
  b ------→ c --------→
       9
```

Each edge label is its capacity. A valid flow might send 8 units along $s \to a \to t$, 5 along $s \to b \to c \to t$, and 2 along $s \to a \to c \to t$ (if capacity allows).

## Cuts in Flow Networks

An **$s$-$t$ cut** is a partition of vertices into two sets $S$ and $T$ where $s \in S$ and $t \in T$.

The **capacity of a cut** $(S, T)$ is:

$$c(S, T) = \sum_{\substack{u \in S, v \in T \\ (u,v) \in E}} c(u,v)$$

A **minimum cut** is the cut with the smallest capacity among all $s$-$t$ cuts.

### Example

If $S = \{s, a\}$ and $T = \{b, c, t\}$, then the cut capacity includes all edges from $S$ to $T$: edges $(s, b)$, $(a, t)$, and $(a, c)$.

## Max-Flow Min-Cut Theorem

This fundamental theorem connects maximum flow and minimum cut:

> **Theorem (Ford & Fulkerson, 1956):** In any flow network, the maximum value of a flow equals the minimum capacity of an $s$-$t$ cut.
>
> $$\max_{f} |f| = \min_{(S,T)} c(S,T)$$

This theorem has three equivalent statements:

1. $f$ is a maximum flow
2. The residual graph $G_f$ has no augmenting path from $s$ to $t$
3. There exists a cut $(S, T)$ such that $|f| = c(S, T)$

### Residual Graph

Given a flow $f$, the **residual graph** $G_f$ has:

- **Forward edges**: $(u,v)$ with residual capacity $c_f(u,v) = c(u,v) - f(u,v)$ if $f(u,v) < c(u,v)$
- **Backward edges**: $(v,u)$ with residual capacity $c_f(v,u) = f(u,v)$ if $f(u,v) > 0$

The residual graph represents where we can push more flow (forward) or reduce existing flow (backward).

## Ford-Fulkerson Method

The Ford-Fulkerson method repeatedly finds augmenting paths in the residual graph:

1. Start with zero flow: $f(u,v) = 0$ for all edges
2. While there exists an augmenting path $p$ from $s$ to $t$ in $G_f$:
   - Find the bottleneck: $c_f(p) = \min_{(u,v) \in p} c_f(u,v)$
   - Augment flow along $p$ by $c_f(p)$
   - Update the residual graph
3. Return $f$

### Augmenting a Path

For each edge $(u,v)$ on augmenting path $p$ with bottleneck $\Delta$:

- If $(u,v)$ is a forward edge: $f(u,v) \leftarrow f(u,v) + \Delta$
- If $(u,v)$ is a backward edge: $f(v,u) \leftarrow f(v,u) - \Delta$

## Edmonds-Karp Algorithm

The **Edmonds-Karp algorithm** is Ford-Fulkerson with BFS to find the shortest augmenting path. This guarantees:

- Time complexity: $O(VE^2)$
- At most $O(VE)$ augmenting paths

Using BFS ensures we find the path with the fewest edges, which leads to polynomial-time termination even with irrational capacities.

### Traced Example

Network: $s \to a$ (cap 10), $s \to b$ (cap 10), $a \to b$ (cap 2), $a \to t$ (cap 4), $b \to t$ (cap 8)

**Iteration 1:** BFS finds $s \to a \to t$, bottleneck = min(10, 4) = 4. Flow = 4.

**Iteration 2:** BFS finds $s \to b \to t$, bottleneck = min(10, 8) = 8. Flow = 12.

**Iteration 3:** BFS finds $s \to a \to b \to t$ (since $a \to t$ is saturated, we go through $b$). But $b \to t$ has residual 0. Actually, the path uses remaining capacity. Bottleneck = min(6, 2, 0) — no valid path. Done!

Wait — let's recalculate. After iteration 2: $b \to t$ has residual $8 - 8 = 0$. BFS finds no path. Max flow = 12.

## Bipartite Matching as Max-Flow

A **matching** in a graph is a set of edges with no shared endpoints. In a **bipartite graph** $G = (L \cup R, E)$, we want the maximum matching.

### Reduction to Max-Flow

1. Create a source $s$ connected to every vertex in $L$ (capacity 1)
2. Create a sink $t$ connected from every vertex in $R$ (capacity 1)
3. For each edge $(u, v) \in E$ where $u \in L, v \in R$, add edge with capacity 1
4. The max-flow value equals the size of the maximum matching

$$\text{Maximum Matching} = \text{Max Flow in augmented network}$$

### Example

Workers $L = \{w_1, w_2, w_3\}$ can do jobs $R = \{j_1, j_2, j_3\}$:
- $w_1$ can do $j_1, j_2$
- $w_2$ can do $j_2, j_3$
- $w_3$ can do $j_1$

Max matching: $\{(w_1, j_2), (w_2, j_3), (w_3, j_1)\}$ — all workers assigned!

## Hall's Marriage Theorem

Hall's theorem characterizes when a **perfect matching** exists in a bipartite graph:

> **Theorem (Hall, 1935):** A bipartite graph $G = (L \cup R, E)$ has a matching that saturates every vertex in $L$ if and only if for every subset $S \subseteq L$:
>
> $$|N(S)| \ge |S|$$
>
> where $N(S)$ is the set of neighbors of $S$ in $R$.

### Interpretation

"Every group of people can be matched to distinct partners if and only if every subset of people collectively knows enough potential partners."

### Example Verification

With the workers/jobs example above:
- $N(\{w_1\}) = \{j_1, j_2\}$, $|N| = 2 \ge 1$ ✓
- $N(\{w_2\}) = \{j_2, j_3\}$, $|N| = 2 \ge 1$ ✓
- $N(\{w_3\}) = \{j_1\}$, $|N| = 1 \ge 1$ ✓
- $N(\{w_1, w_2\}) = \{j_1, j_2, j_3\}$, $|N| = 3 \ge 2$ ✓
- $N(\{w_1, w_3\}) = \{j_1, j_2\}$, $|N| = 2 \ge 2$ ✓
- $N(\{w_2, w_3\}) = \{j_1, j_2, j_3\}$, $|N| = 3 \ge 2$ ✓
- $N(\{w_1, w_2, w_3\}) = \{j_1, j_2, j_3\}$, $|N| = 3 \ge 3$ ✓

Hall's condition is satisfied → perfect matching exists.

## Applications

### Job Assignment

Assign $n$ workers to $n$ jobs where each worker can perform a subset of jobs. Model as bipartite matching — max matching gives the best assignment.

### Transportation

Ship goods from factories (sources) to warehouses (sinks) through intermediate hubs. Capacities represent road/rail limits. Max-flow finds the maximum throughput.

### Network Bandwidth

Route data packets from server to client through a network. Edge capacities represent link bandwidth. Max-flow determines the maximum data rate.

### Sports Elimination

Determine if a team can still win the league. Model remaining games as a flow network — if max-flow saturates all game-edges, the team is eliminated.

### Image Segmentation

Separate foreground from background in an image. Each pixel is a vertex; edge weights encode similarity. Minimum cut partitions pixels into two segments.

## Code: Ford-Fulkerson with BFS (Edmonds-Karp)

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <climits>
#include <cstring>
using namespace std;

class MaxFlow {
    int V;
    vector<vector<int>> capacity;
    vector<vector<int>> adj;

public:
    MaxFlow(int vertices) : V(vertices), capacity(vertices, vector<int>(vertices, 0)), adj(vertices) {}

    void addEdge(int u, int v, int cap) {
        capacity[u][v] += cap;
        adj[u].push_back(v);
        adj[v].push_back(u); // reverse edge for residual graph
    }

    int bfs(int source, int sink, vector<int>& parent) {
        fill(parent.begin(), parent.end(), -1);
        parent[source] = source;
        queue<pair<int,int>> q;
        q.push({source, INT_MAX});

        while (!q.empty()) {
            int u = q.front().first;
            int flow = q.front().second;
            q.pop();

            for (int v : adj[u]) {
                if (parent[v] == -1 && capacity[u][v] > 0) {
                    parent[v] = u;
                    int newFlow = min(flow, capacity[u][v]);
                    if (v == sink) return newFlow;
                    q.push({v, newFlow});
                }
            }
        }
        return 0;
    }

    int edmondsKarp(int source, int sink) {
        int totalFlow = 0;
        vector<int> parent(V);

        int pathFlow;
        while ((pathFlow = bfs(source, sink, parent)) > 0) {
            totalFlow += pathFlow;
            int cur = sink;
            while (cur != source) {
                int prev = parent[cur];
                capacity[prev][cur] -= pathFlow;
                capacity[cur][prev] += pathFlow;
                cur = prev;
            }
        }
        return totalFlow;
    }
};

int main() {
    // Example: 6 vertices (0=source, 5=sink)
    MaxFlow mf(6);
    mf.addEdge(0, 1, 16);
    mf.addEdge(0, 2, 13);
    mf.addEdge(1, 2, 10);
    mf.addEdge(1, 3, 12);
    mf.addEdge(2, 1, 4);
    mf.addEdge(2, 4, 14);
    mf.addEdge(3, 2, 9);
    mf.addEdge(3, 5, 20);
    mf.addEdge(4, 3, 7);
    mf.addEdge(4, 5, 4);

    cout << "Maximum Flow: " << mf.edmondsKarp(0, 5) << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class MaxFlow {
    private int V;
    private int[,] capacity;
    private List<int>[] adj;

    public MaxFlow(int vertices) {
        V = vertices;
        capacity = new int[V, V];
        adj = new List<int>[V];
        for (int i = 0; i < V; i++)
            adj[i] = new List<int>();
    }

    public void AddEdge(int u, int v, int cap) {
        capacity[u, v] += cap;
        adj[u].Add(v);
        adj[v].Add(u);
    }

    private int Bfs(int source, int sink, int[] parent) {
        Array.Fill(parent, -1);
        parent[source] = source;
        var queue = new Queue<(int node, int flow)>();
        queue.Enqueue((source, int.MaxValue));

        while (queue.Count > 0) {
            var (u, flow) = queue.Dequeue();
            foreach (int v in adj[u]) {
                if (parent[v] == -1 && capacity[u, v] > 0) {
                    parent[v] = u;
                    int newFlow = Math.Min(flow, capacity[u, v]);
                    if (v == sink) return newFlow;
                    queue.Enqueue((v, newFlow));
                }
            }
        }
        return 0;
    }

    public int EdmondsKarp(int source, int sink) {
        int totalFlow = 0;
        int[] parent = new int[V];

        int pathFlow;
        while ((pathFlow = Bfs(source, sink, parent)) > 0) {
            totalFlow += pathFlow;
            int cur = sink;
            while (cur != source) {
                int prev = parent[cur];
                capacity[prev, cur] -= pathFlow;
                capacity[cur, prev] += pathFlow;
                cur = prev;
            }
        }
        return totalFlow;
    }

    static void Main() {
        var mf = new MaxFlow(6);
        mf.AddEdge(0, 1, 16);
        mf.AddEdge(0, 2, 13);
        mf.AddEdge(1, 2, 10);
        mf.AddEdge(1, 3, 12);
        mf.AddEdge(2, 1, 4);
        mf.AddEdge(2, 4, 14);
        mf.AddEdge(3, 2, 9);
        mf.AddEdge(3, 5, 20);
        mf.AddEdge(4, 3, 7);
        mf.AddEdge(4, 5, 4);

        Console.WriteLine("Maximum Flow: " + mf.EdmondsKarp(0, 5));
    }
}
```

```java
import java.util.*;

public class MaxFlow {
    private int V;
    private int[][] capacity;
    private List<List<Integer>> adj;

    public MaxFlow(int vertices) {
        V = vertices;
        capacity = new int[V][V];
        adj = new ArrayList<>();
        for (int i = 0; i < V; i++)
            adj.add(new ArrayList<>());
    }

    public void addEdge(int u, int v, int cap) {
        capacity[u][v] += cap;
        adj.get(u).add(v);
        adj.get(v).add(u);
    }

    private int bfs(int source, int sink, int[] parent) {
        Arrays.fill(parent, -1);
        parent[source] = source;
        Queue<int[]> queue = new LinkedList<>();
        queue.add(new int[]{source, Integer.MAX_VALUE});

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int u = curr[0], flow = curr[1];

            for (int v : adj.get(u)) {
                if (parent[v] == -1 && capacity[u][v] > 0) {
                    parent[v] = u;
                    int newFlow = Math.min(flow, capacity[u][v]);
                    if (v == sink) return newFlow;
                    queue.add(new int[]{v, newFlow});
                }
            }
        }
        return 0;
    }

    public int edmondsKarp(int source, int sink) {
        int totalFlow = 0;
        int[] parent = new int[V];

        int pathFlow;
        while ((pathFlow = bfs(source, sink, parent)) > 0) {
            totalFlow += pathFlow;
            int cur = sink;
            while (cur != source) {
                int prev = parent[cur];
                capacity[prev][cur] -= pathFlow;
                capacity[cur][prev] += pathFlow;
                cur = prev;
            }
        }
        return totalFlow;
    }

    public static void main(String[] args) {
        MaxFlow mf = new MaxFlow(6);
        mf.addEdge(0, 1, 16);
        mf.addEdge(0, 2, 13);
        mf.addEdge(1, 2, 10);
        mf.addEdge(1, 3, 12);
        mf.addEdge(2, 1, 4);
        mf.addEdge(2, 4, 14);
        mf.addEdge(3, 2, 9);
        mf.addEdge(3, 5, 20);
        mf.addEdge(4, 3, 7);
        mf.addEdge(4, 5, 4);

        System.out.println("Maximum Flow: " + mf.edmondsKarp(0, 5));
    }
}
```

```python
from collections import deque

class MaxFlow:
    def __init__(self, vertices):
        self.V = vertices
        self.capacity = [[0] * vertices for _ in range(vertices)]
        self.adj = [[] for _ in range(vertices)]

    def add_edge(self, u, v, cap):
        self.capacity[u][v] += cap
        self.adj[u].append(v)
        self.adj[v].append(u)

    def bfs(self, source, sink, parent):
        parent[:] = [-1] * self.V
        parent[source] = source
        queue = deque([(source, float('inf'))])

        while queue:
            u, flow = queue.popleft()
            for v in self.adj[u]:
                if parent[v] == -1 and self.capacity[u][v] > 0:
                    parent[v] = u
                    new_flow = min(flow, self.capacity[u][v])
                    if v == sink:
                        return new_flow
                    queue.append((v, new_flow))
        return 0

    def edmonds_karp(self, source, sink):
        total_flow = 0
        parent = [-1] * self.V

        while True:
            path_flow = self.bfs(source, sink, parent)
            if path_flow == 0:
                break
            total_flow += path_flow
            cur = sink
            while cur != source:
                prev = parent[cur]
                self.capacity[prev][cur] -= path_flow
                self.capacity[cur][prev] += path_flow
                cur = prev
        return total_flow


# Example usage
mf = MaxFlow(6)
mf.add_edge(0, 1, 16)
mf.add_edge(0, 2, 13)
mf.add_edge(1, 2, 10)
mf.add_edge(1, 3, 12)
mf.add_edge(2, 1, 4)
mf.add_edge(2, 4, 14)
mf.add_edge(3, 2, 9)
mf.add_edge(3, 5, 20)
mf.add_edge(4, 3, 7)
mf.add_edge(4, 5, 4)

print("Maximum Flow:", mf.edmonds_karp(0, 5))  # Output: 23
```

```javascript
class MaxFlow {
  constructor(vertices) {
    this.V = vertices;
    this.capacity = Array.from({ length: vertices }, () =>
      new Array(vertices).fill(0)
    );
    this.adj = Array.from({ length: vertices }, () => []);
  }

  addEdge(u, v, cap) {
    this.capacity[u][v] += cap;
    this.adj[u].push(v);
    this.adj[v].push(u);
  }

  bfs(source, sink, parent) {
    parent.fill(-1);
    parent[source] = source;
    const queue = [[source, Infinity]];
    let front = 0;

    while (front < queue.length) {
      const [u, flow] = queue[front++];
      for (const v of this.adj[u]) {
        if (parent[v] === -1 && this.capacity[u][v] > 0) {
          parent[v] = u;
          const newFlow = Math.min(flow, this.capacity[u][v]);
          if (v === sink) return newFlow;
          queue.push([v, newFlow]);
        }
      }
    }
    return 0;
  }

  edmondsKarp(source, sink) {
    let totalFlow = 0;
    const parent = new Array(this.V);

    let pathFlow;
    while ((pathFlow = this.bfs(source, sink, parent)) > 0) {
      totalFlow += pathFlow;
      let cur = sink;
      while (cur !== source) {
        const prev = parent[cur];
        this.capacity[prev][cur] -= pathFlow;
        this.capacity[cur][prev] += pathFlow;
        cur = prev;
      }
    }
    return totalFlow;
  }
}

// Example usage
const mf = new MaxFlow(6);
mf.addEdge(0, 1, 16);
mf.addEdge(0, 2, 13);
mf.addEdge(1, 2, 10);
mf.addEdge(1, 3, 12);
mf.addEdge(2, 1, 4);
mf.addEdge(2, 4, 14);
mf.addEdge(3, 2, 9);
mf.addEdge(3, 5, 20);
mf.addEdge(4, 3, 7);
mf.addEdge(4, 5, 4);

console.log("Maximum Flow:", mf.edmondsKarp(0, 5)); // Output: 23
```

## Complexity Summary

| Algorithm | Time Complexity | Notes |
|-----------|----------------|-------|
| Ford-Fulkerson (DFS) | $O(E \cdot \|f^*\|)$ | Depends on max flow value |
| Edmonds-Karp (BFS) | $O(VE^2)$ | Polynomial, independent of capacities |
| Dinic's Algorithm | $O(V^2 E)$ | Faster in practice |
| Push-Relabel | $O(V^2 E)$ or $O(V^3)$ | Best for dense graphs |

## Key Takeaways

- A **flow network** models transportation of resources through a directed graph with capacity constraints
- The **max-flow min-cut theorem** states that the maximum flow equals the minimum cut capacity — a deep duality result
- **Ford-Fulkerson** finds max-flow by repeatedly augmenting along paths in the residual graph
- **Edmonds-Karp** (BFS-based) guarantees $O(VE^2)$ time complexity
- **Bipartite matching** reduces elegantly to max-flow by adding a super-source and super-sink
- **Hall's theorem** gives a necessary and sufficient condition for a perfect matching
- Network flow has diverse applications: assignment, routing, scheduling, image segmentation, and more
