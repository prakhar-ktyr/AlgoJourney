---
title: Paths, Walks, Cycles & Connectivity
---

# Paths, Walks, Cycles & Connectivity

Understanding how vertices connect through sequences of edges is fundamental to graph theory. In this lesson we formalise the notions of **walks**, **trails**, **paths**, and **cycles**, then explore what it means for a graph to be *connected* and how to verify connectivity algorithmically.

---

## 1. Walks, Trails, Paths & Cycles

### 1.1 Walk

A **walk** in a graph $G = (V, E)$ is a finite alternating sequence of vertices and edges:

$$
v_0,\; e_1,\; v_1,\; e_2,\; v_2,\; \dots,\; e_k,\; v_k
$$

where each $e_i = \{v_{i-1}, v_i\} \in E$. Vertices and edges **may repeat**.

- **Length** of the walk = number of edges traversed = $k$.
- A walk is **closed** if $v_0 = v_k$.

### 1.2 Trail

A **trail** is a walk in which **no edge is repeated** (vertices may still repeat).

### 1.3 Path

A **path** is a walk in which **no vertex is repeated** (and therefore no edge is repeated either).

> A path is the strictest form — no repetitions at all.

### 1.4 Cycle

A **cycle** (or **circuit**) is a closed trail of length $\geq 3$ in which the only repeated vertex is $v_0 = v_k$.

| Concept | Edges repeat? | Vertices repeat? | Closed? |
|---------|:---:|:---:|:---:|
| Walk | Yes | Yes | Maybe |
| Trail | No | Yes | Maybe |
| Path | No | No | No |
| Cycle | No | Only start = end | Yes |

### 1.5 Examples

Consider a graph with vertices $\{A, B, C, D\}$ and edges $\{AB, BC, CD, DA, AC\}$:

- $A \to B \to C \to A \to D$ — walk (vertex $A$ repeats), trail (no edge repeats).
- $A \to B \to C \to D$ — path (no repetitions).
- $A \to B \to C \to A$ — cycle of length 3.
- $A \to B \to A \to B$ — walk but **not** a trail (edge $AB$ repeats).

---

## 2. Connected Graphs

### 2.1 Definition (Undirected)

An undirected graph $G$ is **connected** if for every pair of vertices $u, v \in V$ there exists a path from $u$ to $v$.

If $G$ is not connected it splits into **connected components** — maximal connected subgraphs.

$$
\text{Number of connected components} = k \geq 1
$$

A graph is connected iff $k = 1$.

### 2.2 Connected Components

A **connected component** of $G$ is a subgraph $H$ such that:

1. $H$ is connected.
2. No vertex in $H$ is adjacent to any vertex outside $H$.

For example, a graph on 6 vertices with edges $\{AB, BC, DE\}$ has three components: $\{A,B,C\}$, $\{D,E\}$, and $\{F\}$.

---

## 3. Connectivity in Directed Graphs

For **directed graphs** (digraphs), connectivity is more nuanced.

### 3.1 Strongly Connected

A digraph is **strongly connected** if for every ordered pair $(u, v)$ there is a directed path from $u$ to $v$ **and** from $v$ to $u$.

### 3.2 Weakly Connected

A digraph is **weakly connected** if replacing all directed edges with undirected edges makes the underlying graph connected.

### 3.3 Strongly Connected Components (SCCs)

A **strongly connected component** is a maximal subset $S \subseteq V$ such that every vertex in $S$ is reachable from every other vertex in $S$ via directed paths.

Algorithms to find SCCs include **Kosaraju's** and **Tarjan's** algorithms (covered in DSA courses).

---

## 4. Graph Traversal: BFS and DFS

Two systematic ways to visit all vertices reachable from a source.

### 4.1 Breadth-First Search (BFS)

BFS explores vertices **level by level** — it visits all neighbours of the current vertex before moving deeper.

**Algorithm outline:**

1. Start from source $s$; mark it visited; enqueue it.
2. While the queue is non-empty:
   - Dequeue vertex $u$.
   - For each neighbour $v$ of $u$: if $v$ is not visited, mark it visited and enqueue it.

**Properties:**

- Time complexity: $O(|V| + |E|)$.
- Finds **shortest path** (fewest edges) in unweighted graphs.
- Uses a **queue** (FIFO).

### 4.2 Depth-First Search (DFS)

DFS explores as **deep** as possible before backtracking.

**Algorithm outline:**

1. Start from source $s$; mark it visited.
2. For each unvisited neighbour $v$ of $s$: recursively call DFS on $v$.

**Properties:**

- Time complexity: $O(|V| + |E|)$.
- Useful for cycle detection, topological sorting, finding components.
- Uses a **stack** (explicit or call stack).

---

## 5. Testing Connectivity

### 5.1 Undirected Graphs

To check if an undirected graph is connected:

1. Run BFS (or DFS) from any vertex $s$.
2. If all $|V|$ vertices are visited, the graph is connected.
3. Otherwise, the unvisited vertices belong to other components.

To **find all components**: repeat BFS/DFS from unvisited vertices until every vertex is assigned to a component.

### 5.2 Directed Graphs — Strong Connectivity

To test strong connectivity:

1. Run DFS from any vertex $s$. If not all vertices are reached → **not** strongly connected.
2. Reverse all edges (transpose graph).
3. Run DFS from $s$ again on the transposed graph. If not all vertices are reached → **not** strongly connected.
4. If both DFS runs reach all vertices → **strongly connected**.

---

## 6. Bridges and Cut Vertices

### 6.1 Bridge (Cut Edge)

An edge $e \in E$ is a **bridge** if removing it increases the number of connected components.

In other words, $e = \{u, v\}$ is a bridge iff there is no other path between $u$ and $v$.

### 6.2 Cut Vertex (Articulation Point)

A vertex $v$ is a **cut vertex** if removing it (and all its incident edges) disconnects the graph (or increases the number of components).

### 6.3 Finding Bridges and Cut Vertices

Tarjan's algorithm uses DFS with **discovery times** and **low-link values** to identify bridges and articulation points in $O(|V| + |E|)$ time.

- $\text{disc}[u]$: the time when $u$ is first discovered.
- $\text{low}[u]$: the smallest discovery time reachable from the subtree rooted at $u$.

An edge $(u, v)$ is a bridge if $\text{low}[v] > \text{disc}[u]$.

---

## 7. Code Implementations

We represent graphs using an **adjacency list**. Vertices are numbered $0$ to $n-1$.

### 7.1 BFS Implementation

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> bfs(int start, const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    vector<int> order;
    queue<int> q;

    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return order;
}

int main() {
    int n = 6;
    vector<vector<int>> adj(n);
    // Add edges (undirected)
    adj[0].push_back(1); adj[1].push_back(0);
    adj[0].push_back(2); adj[2].push_back(0);
    adj[1].push_back(3); adj[3].push_back(1);
    adj[2].push_back(4); adj[4].push_back(2);
    adj[4].push_back(5); adj[5].push_back(4);

    vector<int> result = bfs(0, adj);
    cout << "BFS order: ";
    for (int v : result) cout << v << " ";
    cout << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class Graph {
    static List<int> BFS(int start, List<List<int>> adj) {
        int n = adj.Count;
        bool[] visited = new bool[n];
        List<int> order = new List<int>();
        Queue<int> queue = new Queue<int>();

        visited[start] = true;
        queue.Enqueue(start);

        while (queue.Count > 0) {
            int u = queue.Dequeue();
            order.Add(u);

            foreach (int v in adj[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.Enqueue(v);
                }
            }
        }
        return order;
    }

    static void Main() {
        int n = 6;
        var adj = new List<List<int>>();
        for (int i = 0; i < n; i++) adj.Add(new List<int>());

        // Add edges (undirected)
        adj[0].Add(1); adj[1].Add(0);
        adj[0].Add(2); adj[2].Add(0);
        adj[1].Add(3); adj[3].Add(1);
        adj[2].Add(4); adj[4].Add(2);
        adj[4].Add(5); adj[5].Add(4);

        List<int> result = BFS(0, adj);
        Console.WriteLine("BFS order: " + string.Join(" ", result));
    }
}
```

```java
import java.util.*;

public class GraphBFS {
    public static List<Integer> bfs(int start, List<List<Integer>> adj) {
        int n = adj.size();
        boolean[] visited = new boolean[n];
        List<Integer> order = new ArrayList<>();
        Queue<Integer> queue = new LinkedList<>();

        visited[start] = true;
        queue.add(start);

        while (!queue.isEmpty()) {
            int u = queue.poll();
            order.add(u);

            for (int v : adj.get(u)) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.add(v);
                }
            }
        }
        return order;
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        adj.get(0).add(1); adj.get(1).add(0);
        adj.get(0).add(2); adj.get(2).add(0);
        adj.get(1).add(3); adj.get(3).add(1);
        adj.get(2).add(4); adj.get(4).add(2);
        adj.get(4).add(5); adj.get(5).add(4);

        List<Integer> result = bfs(0, adj);
        System.out.println("BFS order: " + result);
    }
}
```

```python
from collections import deque

def bfs(start, adj):
    n = len(adj)
    visited = [False] * n
    order = []
    queue = deque([start])
    visited[start] = True

    while queue:
        u = queue.popleft()
        order.append(u)

        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                queue.append(v)

    return order

# Example usage
n = 6
adj = [[] for _ in range(n)]
edges = [(0,1), (0,2), (1,3), (2,4), (4,5)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

print("BFS order:", bfs(0, adj))
```

```javascript
function bfs(start, adj) {
  const n = adj.length;
  const visited = new Array(n).fill(false);
  const order = [];
  const queue = [start];
  visited[start] = true;

  while (queue.length > 0) {
    const u = queue.shift();
    order.push(u);

    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true;
        queue.push(v);
      }
    }
  }
  return order;
}

// Example usage
const n = 6;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [0,2], [1,3], [2,4], [4,5]];
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

console.log("BFS order:", bfs(0, adj));
```

### 7.2 DFS Implementation

```cpp
#include <iostream>
#include <vector>
using namespace std;

void dfs(int u, const vector<vector<int>>& adj, vector<bool>& visited, vector<int>& order) {
    visited[u] = true;
    order.push_back(u);

    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited, order);
        }
    }
}

int countComponents(int n, const vector<vector<int>>& adj) {
    vector<bool> visited(n, false);
    int components = 0;

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            vector<int> order;
            dfs(i, adj, visited, order);
            components++;
        }
    }
    return components;
}

int main() {
    int n = 7;
    vector<vector<int>> adj(n);
    // Component 1: 0-1-2
    adj[0].push_back(1); adj[1].push_back(0);
    adj[1].push_back(2); adj[2].push_back(1);
    // Component 2: 3-4
    adj[3].push_back(4); adj[4].push_back(3);
    // Component 3: 5-6
    adj[5].push_back(6); adj[6].push_back(5);

    cout << "Number of components: " << countComponents(n, adj) << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class GraphDFS {
    static void DFS(int u, List<List<int>> adj, bool[] visited, List<int> order) {
        visited[u] = true;
        order.Add(u);

        foreach (int v in adj[u]) {
            if (!visited[v]) {
                DFS(v, adj, visited, order);
            }
        }
    }

    static int CountComponents(int n, List<List<int>> adj) {
        bool[] visited = new bool[n];
        int components = 0;

        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                List<int> order = new List<int>();
                DFS(i, adj, visited, order);
                components++;
            }
        }
        return components;
    }

    static void Main() {
        int n = 7;
        var adj = new List<List<int>>();
        for (int i = 0; i < n; i++) adj.Add(new List<int>());

        adj[0].Add(1); adj[1].Add(0);
        adj[1].Add(2); adj[2].Add(1);
        adj[3].Add(4); adj[4].Add(3);
        adj[5].Add(6); adj[6].Add(5);

        Console.WriteLine("Number of components: " + CountComponents(n, adj));
    }
}
```

```java
import java.util.*;

public class GraphDFS {
    public static void dfs(int u, List<List<Integer>> adj, boolean[] visited, List<Integer> order) {
        visited[u] = true;
        order.add(u);

        for (int v : adj.get(u)) {
            if (!visited[v]) {
                dfs(v, adj, visited, order);
            }
        }
    }

    public static int countComponents(int n, List<List<Integer>> adj) {
        boolean[] visited = new boolean[n];
        int components = 0;

        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                List<Integer> order = new ArrayList<>();
                dfs(i, adj, visited, order);
                components++;
            }
        }
        return components;
    }

    public static void main(String[] args) {
        int n = 7;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        adj.get(0).add(1); adj.get(1).add(0);
        adj.get(1).add(2); adj.get(2).add(1);
        adj.get(3).add(4); adj.get(4).add(3);
        adj.get(5).add(6); adj.get(6).add(5);

        System.out.println("Number of components: " + countComponents(n, adj));
    }
}
```

```python
def dfs(u, adj, visited, order):
    visited[u] = True
    order.append(u)

    for v in adj[u]:
        if not visited[v]:
            dfs(v, adj, visited, order)

def count_components(n, adj):
    visited = [False] * n
    components = 0

    for i in range(n):
        if not visited[i]:
            order = []
            dfs(i, adj, visited, order)
            components += 1

    return components

# Example: 3 components
n = 7
adj = [[] for _ in range(n)]
edges = [(0,1), (1,2), (3,4), (5,6)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

print("Number of components:", count_components(n, adj))
```

```javascript
function dfs(u, adj, visited, order) {
  visited[u] = true;
  order.push(u);

  for (const v of adj[u]) {
    if (!visited[v]) {
      dfs(v, adj, visited, order);
    }
  }
}

function countComponents(n, adj) {
  const visited = new Array(n).fill(false);
  let components = 0;

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const order = [];
      dfs(i, adj, visited, order);
      components++;
    }
  }
  return components;
}

// Example: 3 components
const n = 7;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [1,2], [3,4], [5,6]];
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

console.log("Number of components:", countComponents(n, adj));
```

---

## 8. Key Takeaways

1. **Walk → Trail → Path** is a hierarchy of increasing restriction (repetitions of edges, then vertices, are disallowed).
2. A **cycle** is a closed trail with no repeated vertices except the start/end.
3. An undirected graph is **connected** if every pair of vertices has a path between them; otherwise it decomposes into **connected components**.
4. Directed graphs distinguish **strong** connectivity (directed paths both ways) from **weak** connectivity (connected when ignoring direction).
5. **BFS** (queue-based) and **DFS** (stack/recursion-based) both run in $O(|V| + |E|)$ and can determine connectivity by checking whether all vertices are visited from a single source.
6. **Bridges** and **cut vertices** are critical structural elements whose removal disconnects the graph; they can be found efficiently with Tarjan's algorithm.
7. Connectivity is the foundation for nearly every graph algorithm — always verify a graph is connected (or identify its components) before applying path-finding algorithms.
