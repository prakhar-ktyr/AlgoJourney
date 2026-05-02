---
title: Graphs Introduction
---

# Graphs Introduction

A **graph** is one of the most versatile data structures in computer science. It models relationships between objects — social networks, road maps, web pages, dependencies, and much more.

---

## What Is a Graph?

A graph **G** consists of:

- **Vertices (Nodes)** — the objects (often labeled V or n)
- **Edges (Links)** — the connections between objects (often labeled E or m)

We write **G = (V, E)**.

```
Example graph with 5 vertices and 6 edges:

    0 --- 1
    |   / |
    |  /  |
    | /   |
    2 --- 3
         |
         4
```

Here V = {0, 1, 2, 3, 4} and E = {(0,1), (0,2), (1,2), (1,3), (2,3), (3,4)}.

---

## Directed vs Undirected Graphs

### Undirected Graph

Edges have **no direction**. If there's an edge between A and B, you can traverse it both ways.

```
  A --- B     (A connects to B AND B connects to A)
```

**Examples:** Facebook friendships, road networks (two-way streets).

### Directed Graph (Digraph)

Edges have a **direction** — an arrow from one vertex to another.

```
  A --→ B     (A connects to B, but NOT B to A)
```

**Examples:** Twitter follows, web links, task dependencies.

---

## Weighted vs Unweighted Graphs

### Unweighted Graph

All edges are equal — no cost/distance associated.

```
  A --- B --- C
```

### Weighted Graph

Each edge carries a **weight** (cost, distance, time, etc.).

```
  A --5-- B --3-- C
       \        /
        \--7--/
```

**Examples:** Road distances, flight costs, network latency.

---

## Key Terminology

| Term | Definition |
|------|-----------|
| **Degree** | Number of edges connected to a vertex. In directed graphs: **in-degree** (incoming) and **out-degree** (outgoing). |
| **Path** | A sequence of vertices where each adjacent pair is connected by an edge. |
| **Cycle** | A path that starts and ends at the same vertex (with at least one edge). |
| **Connected** | An undirected graph where every vertex is reachable from every other vertex. |
| **Connected Component** | A maximal set of vertices such that there is a path between every pair. |
| **DAG** | Directed Acyclic Graph — a directed graph with no cycles. |
| **Self-loop** | An edge from a vertex to itself. |
| **Multi-graph** | A graph that allows multiple edges between the same pair of vertices. |
| **Simple graph** | No self-loops, no multiple edges between the same pair. |

---

## Degree Examples

```
Undirected graph:

    0 --- 1 --- 2
    |           |
    3 ----------+

Degree of 0 = 2 (edges to 1 and 3)
Degree of 1 = 2 (edges to 0 and 2)
Degree of 2 = 2 (edges to 1 and 3)
Degree of 3 = 2 (edges to 0 and 2)
```

```
Directed graph:

    0 --→ 1 --→ 2
    ↑           |
    +----← 3 ←-+

In-degree of 0 = 1 (from 3)
Out-degree of 0 = 1 (to 1)
In-degree of 2 = 1 (from 1)
Out-degree of 2 = 1 (to 3)
```

---

## Connected Components

```
Component 1:     Component 2:

  0 --- 1          4 --- 5
  |               
  2               

This graph has 2 connected components.
```

---

## Paths and Cycles

```
Graph:
    0 --- 1
    |     |
    3 --- 2

Path from 0 to 2: 0 → 1 → 2  (length 2)
Another path:     0 → 3 → 2  (length 2)
Cycle:            0 → 1 → 2 → 3 → 0  (length 4)
```

---

## Real-World Examples

| Domain | Vertices | Edges |
|--------|----------|-------|
| Social Network | People | Friendships / Follows |
| Web | Pages | Hyperlinks |
| Maps | Intersections | Roads |
| Airline | Airports | Flights (weighted by cost/time) |
| Course Prerequisites | Courses | "Must take before" (directed) |
| Computer Network | Routers/Devices | Cables/Connections |
| Dependency Manager | Packages | Dependencies (directed) |

---

## Simple Graph Code (Undirected, Unweighted)

Let's represent this graph in code:

```
    0 --- 1
    |   / |
    |  /  |
    | /   |
    2 --- 3
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n = 4; // number of vertices
    vector<vector<int>> adj(n);

    // Add undirected edges
    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 2);
    addEdge(1, 3);
    addEdge(2, 3);

    // Print adjacency list
    for (int i = 0; i < n; i++) {
        cout << i << ": ";
        for (int neighbor : adj[i]) {
            cout << neighbor << " ";
        }
        cout << endl;
    }

    // Print degree of each vertex
    for (int i = 0; i < n; i++) {
        cout << "Degree of " << i << " = " << adj[i].size() << endl;
    }

    return 0;
}
```

```java
import java.util.*;

public class GraphIntro {
    public static void main(String[] args) {
        int n = 4; // number of vertices
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            adj.add(new ArrayList<>());
        }

        // Add undirected edges
        addEdge(adj, 0, 1);
        addEdge(adj, 0, 2);
        addEdge(adj, 1, 2);
        addEdge(adj, 1, 3);
        addEdge(adj, 2, 3);

        // Print adjacency list
        for (int i = 0; i < n; i++) {
            System.out.println(i + ": " + adj.get(i));
        }

        // Print degree of each vertex
        for (int i = 0; i < n; i++) {
            System.out.println("Degree of " + i + " = " + adj.get(i).size());
        }
    }

    static void addEdge(List<List<Integer>> adj, int u, int v) {
        adj.get(u).add(v);
        adj.get(v).add(u);
    }
}
```

```python
def main():
    n = 4  # number of vertices
    adj = [[] for _ in range(n)]

    def add_edge(u, v):
        adj[u].append(v)
        adj[v].append(u)

    add_edge(0, 1)
    add_edge(0, 2)
    add_edge(1, 2)
    add_edge(1, 3)
    add_edge(2, 3)

    # Print adjacency list
    for i in range(n):
        print(f"{i}: {adj[i]}")

    # Print degree of each vertex
    for i in range(n):
        print(f"Degree of {i} = {len(adj[i])}")

main()
```

```javascript
function main() {
  const n = 4; // number of vertices
  const adj = Array.from({ length: n }, () => []);

  function addEdge(u, v) {
    adj[u].push(v);
    adj[v].push(u);
  }

  addEdge(0, 1);
  addEdge(0, 2);
  addEdge(1, 2);
  addEdge(1, 3);
  addEdge(2, 3);

  // Print adjacency list
  for (let i = 0; i < n; i++) {
    console.log(`${i}: [${adj[i].join(", ")}]`);
  }

  // Print degree of each vertex
  for (let i = 0; i < n; i++) {
    console.log(`Degree of ${i} = ${adj[i].length}`);
  }
}

main();
```

**Output:**
```
0: [1, 2]
1: [0, 2, 3]
2: [0, 1, 3]
3: [1, 2]
Degree of 0 = 2
Degree of 1 = 3
Degree of 2 = 3
Degree of 3 = 2
```

---

## Types of Graphs Summary

```
┌─────────────────────────────────────────────────┐
│              Graph Classification                │
├─────────────────────────────────────────────────┤
│                                                 │
│  By Direction:     Undirected │ Directed         │
│  By Weight:        Unweighted │ Weighted         │
│  By Cycles:        Cyclic     │ Acyclic (DAG)    │
│  By Connectivity:  Connected  │ Disconnected     │
│  By Density:       Sparse     │ Dense            │
│                                                 │
│  Sparse: E ≈ V               │
│  Dense:  E ≈ V²              │
└─────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. A graph = vertices + edges connecting them.
2. Directed graphs have one-way edges; undirected have two-way.
3. Weighted graphs assign costs to edges.
4. Degree = number of edges at a vertex.
5. A connected component is a group of mutually reachable vertices.
6. Graphs appear everywhere — maps, networks, dependencies, social media.

---

Next: **Graph Representations →**
