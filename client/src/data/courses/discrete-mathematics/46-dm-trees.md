---
title: Trees — Properties & Spanning Trees
---

# Trees — Properties & Spanning Trees

Trees are among the most fundamental structures in discrete mathematics and computer science. They appear everywhere: file systems, decision processes, network design, parsing, and countless algorithms. In this lesson, we explore the formal properties of trees and the concept of spanning trees.

---

## What Is a Tree?

A **tree** is an undirected graph that is **connected** and **acyclic** (contains no cycles).

### Visual Example

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

This is a tree with 6 vertices and 5 edges.

---

## Equivalent Definitions of a Tree

The following statements are all equivalent for a graph $G$ with $n$ vertices. Any one of them can serve as the definition of a tree:

1. $G$ is connected and acyclic.
2. $G$ is connected and has exactly $n - 1$ edges.
3. $G$ is acyclic and has exactly $n - 1$ edges.
4. There is a **unique path** between every pair of vertices.
5. $G$ is connected, but removing any edge disconnects it (minimally connected).
6. $G$ is acyclic, but adding any edge creates exactly one cycle (maximally acyclic).

### Why $n - 1$ Edges?

**Proof sketch**: A connected graph needs at least $n - 1$ edges (think of building it one vertex at a time, connecting each new vertex). An acyclic graph has at most $n - 1$ edges (each edge adds at most one new vertex to the connected component). A tree satisfies both constraints simultaneously, giving exactly $n - 1$ edges.

---

## Properties of Trees

### Fundamental Properties

- A tree on $n$ vertices has exactly $n - 1$ edges.
- Every tree with $n \geq 2$ has at least 2 **leaves** (vertices of degree 1).
- Removing a leaf from a tree gives another tree (on $n - 1$ vertices).
- Adding any edge to a tree creates exactly one cycle.
- Removing any edge from a tree disconnects it into exactly two components.

### Proof: Every Tree Has At Least 2 Leaves

By the handshaking lemma: $\sum_{v \in V} \deg(v) = 2|E| = 2(n-1)$.

If a tree had 0 leaves, every vertex would have degree $\geq 2$, so the sum would be $\geq 2n > 2(n-1)$ — contradiction.

If a tree had exactly 1 leaf, the sum would be $\geq 1 + 2(n-1) = 2n - 1 > 2(n-1)$ — contradiction.

Therefore every tree has at least 2 leaves. ∎

---

## Rooted Trees

A **rooted tree** is a tree with one designated vertex called the **root**. This introduces a hierarchical (parent-child) structure.

### Terminology

| Term | Definition |
|------|-----------|
| **Root** | The designated top vertex |
| **Parent** | The vertex directly above (closer to root) on the unique path to root |
| **Child** | A vertex directly below (farther from root) |
| **Leaf** | A vertex with no children |
| **Internal node** | A vertex that is not a leaf |
| **Siblings** | Vertices sharing the same parent |
| **Depth** of $v$ | Length of the path from root to $v$ |
| **Height** of tree | Maximum depth of any vertex |
| **Subtree** rooted at $v$ | The tree consisting of $v$ and all its descendants |
| **Level $k$** | Set of all vertices at depth $k$ |

### Example

```
Root:       A          depth 0
           / \
          B   C        depth 1
         /|    \
        D E     F      depth 2
        |
        G              depth 3
```

- Height = 3
- Leaves: E, F, G
- Parent of D = B, Children of B = {D, E}
- Subtree rooted at B contains {B, D, E, G}

---

## Types of Rooted Trees

### Binary Trees

Each node has at most 2 children (left and right).

- **Full binary tree**: Every internal node has exactly 2 children.
- **Complete binary tree**: All levels filled except possibly the last, which is filled left to right.
- **Perfect binary tree**: All internal nodes have 2 children and all leaves are at the same depth.

A perfect binary tree of height $h$ has:
- $2^{h+1} - 1$ total vertices
- $2^h$ leaves
- $2^h - 1$ internal nodes

### $m$-ary Trees

Each node has at most $m$ children. Binary trees are the special case $m = 2$.

---

## Spanning Trees

A **spanning tree** of a graph $G = (V, E)$ is a subgraph $T = (V, E')$ such that:
- $T$ contains ALL vertices of $G$
- $T$ is a tree (connected and acyclic)
- $E' \subseteq E$

In other words, a spanning tree is a minimal connected subgraph that includes every vertex.

### Existence

A graph has a spanning tree if and only if it is **connected**. (If disconnected, we get a spanning forest — one spanning tree per connected component.)

### Properties of Spanning Trees

1. A spanning tree of a graph with $n$ vertices has exactly $n - 1$ edges.
2. Every connected graph has at least one spanning tree.
3. Adding any non-tree edge to a spanning tree creates exactly one cycle (**fundamental cycle**).
4. Removing any tree edge disconnects the spanning tree into two components, defining a **cut** (**fundamental cut**).
5. A graph can have many different spanning trees.

### Example

Consider the graph:
```
    1---2
    |\ /|
    | X  |
    |/ \|
    3---4
```

One spanning tree (of many possible):
```
    1---2
    |    |
    3   4
    (with edge 1-3 and 2-4)
```

Wait — that's not connected. Let's be precise:

Graph edges: (1,2), (1,3), (1,4), (2,3), (2,4), (3,4).

One spanning tree: {(1,2), (1,3), (1,4)} — a star centered at 1.
Another: {(1,2), (2,3), (3,4)} — a path.

---

## Finding Spanning Trees

### DFS Spanning Tree

Run Depth-First Search from any vertex. The edges used to discover new vertices form a spanning tree.

**Properties of DFS tree**:
- Non-tree edges connect ancestors to descendants (called **back edges**).
- No **cross edges** in undirected graphs.
- Useful for finding bridges, articulation points, and strongly connected components.

### BFS Spanning Tree

Run Breadth-First Search from any vertex. The edges used to discover new vertices form a spanning tree.

**Properties of BFS tree**:
- Gives shortest paths (in terms of number of edges) from the source.
- Non-tree edges connect vertices on the same level or adjacent levels.
- Useful for shortest-path problems.

---

## Cayley's Formula

**Theorem (Cayley, 1889)**: The number of labeled spanning trees of the complete graph $K_n$ is:

$$\tau(K_n) = n^{n-2}$$

### Examples

| $n$ | $n^{n-2}$ | Description |
|-----|-----------|-------------|
| 1 | 1 | Single vertex |
| 2 | 1 | One edge |
| 3 | 3 | Three possible labeled trees on 3 vertices |
| 4 | 16 | Sixteen labeled trees on 4 vertices |
| 5 | 125 | |
| 6 | 1296 | |

### Prüfer Sequence (Proof Method)

Cayley's formula can be proved by establishing a bijection between labeled trees on $n$ vertices and sequences of length $n - 2$ from $\{1, 2, \ldots, n\}$ (called **Prüfer sequences**).

- Each tree maps to a unique sequence.
- Each sequence maps to a unique tree.
- There are $n^{n-2}$ such sequences.

---

## Kirchhoff's Matrix Tree Theorem

For a general graph $G$ (not just $K_n$), the number of spanning trees can be computed using the **Laplacian matrix**.

The **Laplacian** $L = D - A$ where:
- $D$ = degree matrix (diagonal, $D_{ii} = \deg(i)$)
- $A$ = adjacency matrix

**Theorem**: The number of spanning trees of $G$ equals any cofactor of $L$ (i.e., the determinant of $L$ with one row and one column removed).

---

## Minimum Spanning Trees (Preview)

When edges have weights, we often want the spanning tree with minimum total weight. This is the **Minimum Spanning Tree (MST)** problem, solved by:

- **Kruskal's algorithm**: Add cheapest edge that doesn't create a cycle.
- **Prim's algorithm**: Grow tree from a vertex, always adding the cheapest edge to a new vertex.

Both run in $O(E \log V)$ time. (These are covered in detail in algorithm courses.)

---

## Code: Find a Spanning Tree Using DFS

Given an adjacency list, find a spanning tree by running DFS and collecting tree edges.

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> adj;
vector<bool> visited;
vector<pair<int,int>> treeEdges;

void dfs(int u) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            treeEdges.push_back({u, v});
            dfs(v);
        }
    }
}

vector<pair<int,int>> findSpanningTree(int n) {
    visited.assign(n, false);
    treeEdges.clear();
    dfs(0); // Start DFS from vertex 0
    return treeEdges;
}

int main() {
    int n = 6;
    adj.resize(n);
    auto addEdge = [](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    // Create a connected graph with extra edges (not a tree)
    addEdge(0, 1); addEdge(0, 2); addEdge(1, 2);
    addEdge(1, 3); addEdge(2, 4); addEdge(3, 4);
    addEdge(3, 5); addEdge(4, 5);

    auto tree = findSpanningTree(n);
    cout << "Spanning tree edges (" << tree.size() << " edges):" << endl;
    for (auto& [u, v] : tree) {
        cout << "  " << u << " -- " << v << endl;
    }
    cout << "Vertices: " << n << ", Tree edges: " << tree.size() << endl;
    cout << "Verified: n-1 = " << n-1 << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class SpanningTree
{
    static List<int>[] adj;
    static bool[] visited;
    static List<(int, int)> treeEdges;

    static void Dfs(int u)
    {
        visited[u] = true;
        foreach (int v in adj[u])
        {
            if (!visited[v])
            {
                treeEdges.Add((u, v));
                Dfs(v);
            }
        }
    }

    static List<(int, int)> FindSpanningTree(int n)
    {
        visited = new bool[n];
        treeEdges = new List<(int, int)>();
        Dfs(0);
        return treeEdges;
    }

    static void Main()
    {
        int n = 6;
        adj = new List<int>[n];
        for (int i = 0; i < n; i++) adj[i] = new List<int>();

        void AddEdge(int u, int v) { adj[u].Add(v); adj[v].Add(u); }

        AddEdge(0, 1); AddEdge(0, 2); AddEdge(1, 2);
        AddEdge(1, 3); AddEdge(2, 4); AddEdge(3, 4);
        AddEdge(3, 5); AddEdge(4, 5);

        var tree = FindSpanningTree(n);
        Console.WriteLine($"Spanning tree edges ({tree.Count} edges):");
        foreach (var (u, v) in tree)
            Console.WriteLine($"  {u} -- {v}");
        Console.WriteLine($"Vertices: {n}, Tree edges: {tree.Count}");
        Console.WriteLine($"Verified: n-1 = {n - 1}");
    }
}
```

```java
import java.util.*;

public class SpanningTree {
    static List<List<Integer>> adj;
    static boolean[] visited;
    static List<int[]> treeEdges;

    static void dfs(int u) {
        visited[u] = true;
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                treeEdges.add(new int[]{u, v});
                dfs(v);
            }
        }
    }

    static List<int[]> findSpanningTree(int n) {
        visited = new boolean[n];
        treeEdges = new ArrayList<>();
        dfs(0);
        return treeEdges;
    }

    public static void main(String[] args) {
        int n = 6;
        adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1},{0,2},{1,2},{1,3},{2,4},{3,4},{3,5},{4,5}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        List<int[]> tree = findSpanningTree(n);
        System.out.println("Spanning tree edges (" + tree.size() + " edges):");
        for (int[] e : tree)
            System.out.println("  " + e[0] + " -- " + e[1]);
        System.out.println("Vertices: " + n + ", Tree edges: " + tree.size());
        System.out.println("Verified: n-1 = " + (n - 1));
    }
}
```

```python
def find_spanning_tree_dfs(n, adj):
    """Find a spanning tree using DFS. Returns list of tree edges."""
    visited = [False] * n
    tree_edges = []

    def dfs(u):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                tree_edges.append((u, v))
                dfs(v)

    dfs(0)  # Start from vertex 0
    return tree_edges


# Example: connected graph with cycles
n = 6
adj = [[] for _ in range(n)]

def add_edge(u, v):
    adj[u].append(v)
    adj[v].append(u)

edges = [(0,1), (0,2), (1,2), (1,3), (2,4), (3,4), (3,5), (4,5)]
for u, v in edges:
    add_edge(u, v)

tree = find_spanning_tree_dfs(n, adj)
print(f"Spanning tree edges ({len(tree)} edges):")
for u, v in tree:
    print(f"  {u} -- {v}")
print(f"Vertices: {n}, Tree edges: {len(tree)}")
print(f"Verified: n-1 = {n - 1}")
```

```javascript
function findSpanningTreeDFS(n, adj) {
  // Find a spanning tree using DFS
  const visited = new Array(n).fill(false);
  const treeEdges = [];

  function dfs(u) {
    visited[u] = true;
    for (const v of adj[u]) {
      if (!visited[v]) {
        treeEdges.push([u, v]);
        dfs(v);
      }
    }
  }

  dfs(0); // Start from vertex 0
  return treeEdges;
}

// Example: connected graph with cycles
const n = 6;
const adj = Array.from({ length: n }, () => []);

function addEdge(u, v) {
  adj[u].push(v);
  adj[v].push(u);
}

const edges = [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[3,5],[4,5]];
edges.forEach(([u, v]) => addEdge(u, v));

const tree = findSpanningTreeDFS(n, adj);
console.log(`Spanning tree edges (${tree.length} edges):`);
for (const [u, v] of tree) {
  console.log(`  ${u} -- ${v}`);
}
console.log(`Vertices: ${n}, Tree edges: ${tree.length}`);
console.log(`Verified: n-1 = ${n - 1}`);
```

---

## Comparison: DFS Tree vs BFS Tree

| Property | DFS Tree | BFS Tree |
|----------|----------|----------|
| Discovery order | Deep first | Level by level |
| Non-tree edges | Back edges only | Same/adjacent level |
| Path to root | Not necessarily shortest | Shortest path (unweighted) |
| Use cases | Cycle detection, SCC, bridges | Shortest path, level-order |

---

## Applications of Trees

| Application | How Trees Are Used |
|-------------|-------------------|
| File systems | Directory hierarchy |
| HTML/XML | Document Object Model (DOM) |
| Databases | B-trees, B+ trees for indexing |
| Compilers | Abstract Syntax Trees (AST) |
| Networks | Spanning trees for broadcast |
| AI/Games | Decision trees, game trees |
| Biology | Phylogenetic trees |
| Compression | Huffman coding trees |

---

## Key Takeaways

1. A **tree** is a connected, acyclic graph — equivalently, a connected graph with $n - 1$ edges, or one with a unique path between every pair of vertices.
2. Trees have at least 2 leaves. Removing a leaf from a tree yields another tree.
3. **Rooted trees** introduce parent-child hierarchy with concepts like depth, height, and subtrees.
4. A **spanning tree** is a subgraph that is a tree containing all vertices — it exists iff the graph is connected.
5. Spanning trees can be found via **DFS** (back edges are non-tree edges) or **BFS** (gives shortest-path tree).
6. **Cayley's formula**: $K_n$ has $n^{n-2}$ labeled spanning trees.
7. The **Matrix Tree Theorem** (Kirchhoff) computes the number of spanning trees for any graph using the Laplacian determinant.
8. Trees are ubiquitous in CS — from file systems and databases to compilers and network protocols.
