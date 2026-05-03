---
title: Special Graphs
---

# Special Graphs

Certain graph families appear so frequently in mathematics and computer science that they have their own names, notation, and well-studied properties. Understanding these special graphs provides building blocks for solving complex problems.

## Complete Graphs $K_n$

A **complete graph** $K_n$ has $n$ vertices where every pair of distinct vertices is connected by an edge.

### Properties

- Number of edges: $|E| = \binom{n}{2} = \frac{n(n-1)}{2}$
- Every vertex has degree $n - 1$ (so $K_n$ is $(n-1)$-regular)
- Diameter: 1 (every vertex is adjacent to every other)
- Chromatic number: $\chi(K_n) = n$ (each vertex needs its own color)
- $K_n$ is $(n-1)$-connected (removing fewer than $n-1$ vertices leaves it connected)
- Number of spanning trees: $n^{n-2}$ (Cayley's formula)
- Number of Hamiltonian cycles: $\frac{(n-1)!}{2}$

### Small Examples

| Graph | Vertices | Edges | Description |
|-------|----------|-------|-------------|
| $K_1$ | 1 | 0 | Single vertex |
| $K_2$ | 2 | 1 | Single edge |
| $K_3$ | 3 | 3 | Triangle |
| $K_4$ | 4 | 6 | Tetrahedron |
| $K_5$ | 5 | 10 | First non-planar complete graph |

### Planarity

By Kuratowski's theorem, $K_5$ is the smallest non-planar complete graph. A graph is planar if and only if it contains no subdivision of $K_5$ or $K_{3,3}$.

## Bipartite Graphs

A graph $G = (V, E)$ is **bipartite** if its vertex set can be partitioned into two disjoint sets $A$ and $B$ such that every edge connects a vertex in $A$ to a vertex in $B$.

$$V = A \cup B, \quad A \cap B = \emptyset, \quad \forall (u,v) \in E: u \in A, v \in B$$

### Characterization

> **Theorem:** A graph is bipartite if and only if it contains no odd-length cycle.

This gives a simple test: run BFS/DFS and check for 2-colorability.

### Properties

- Chromatic number: $\chi(G) = 2$ (if $G$ has at least one edge)
- Maximum edges for $|A| = a, |B| = b$: $a \cdot b$
- Every tree is bipartite
- Bipartite graphs have no odd cycles

### Applications

- **Matching problems**: workers to jobs, students to courses
- **Scheduling**: time slots vs events
- **Social networks**: people vs groups they belong to

## Complete Bipartite Graphs $K_{m,n}$

A **complete bipartite graph** $K_{m,n}$ has parts of size $m$ and $n$, with every vertex in one part connected to every vertex in the other.

### Properties

- Number of edges: $|E| = m \cdot n$
- Degree of vertices in part $A$: $n$; in part $B$: $m$
- Chromatic number: $\chi(K_{m,n}) = 2$ (for $m, n \ge 1$)
- $K_{m,n}$ is planar if and only if $m \le 2$ or $n \le 2$
- $K_{3,3}$ is the smallest non-planar complete bipartite graph (utility graph)
- Number of spanning trees: $m^{n-1} \cdot n^{m-1}$
- Diameter: 2 (when $m, n \ge 1$)

### Special Cases

| Graph | Structure | Common Name |
|-------|-----------|-------------|
| $K_{1,n}$ | One center, $n$ leaves | **Star graph** $S_n$ |
| $K_{2,2}$ | Four vertices, four edges | **4-cycle** $C_4$ |
| $K_{3,3}$ | Six vertices, nine edges | **Utility graph** |

## Regular Graphs

A graph is **$k$-regular** if every vertex has degree exactly $k$.

### Properties

- Total edges: $|E| = \frac{kn}{2}$ (so $kn$ must be even)
- A 0-regular graph has no edges (empty graph)
- A 1-regular graph is a perfect matching
- A 2-regular graph is a disjoint union of cycles
- $K_n$ is $(n-1)$-regular

### Existence

A $k$-regular graph on $n$ vertices exists if and only if:
1. $k < n$
2. $kn$ is even (can't have a 3-regular graph on 5 vertices since $3 \times 5 = 15$ is odd)

### Strongly Regular Graphs

A graph is **strongly regular** with parameters $(n, k, \lambda, \mu)$ if:
- It has $n$ vertices, is $k$-regular
- Adjacent vertices have $\lambda$ common neighbors
- Non-adjacent vertices have $\mu$ common neighbors

The **Petersen graph** is strongly regular with parameters $(10, 3, 0, 1)$.

## Cycle Graphs $C_n$

The **cycle graph** $C_n$ consists of $n$ vertices forming a single cycle.

### Properties

- Vertices: $n$, Edges: $n$
- Every vertex has degree 2 (2-regular)
- Chromatic number:

$$\chi(C_n) = \begin{cases} 2 & \text{if } n \text{ is even} \\ 3 & \text{if } n \text{ is odd} \end{cases}$$

- Girth: $n$ (the shortest cycle has length $n$)
- Diameter: $\lfloor n/2 \rfloor$
- Hamiltonian (the whole graph is one cycle)
- Eulerian if and only if $n \ge 3$ (all degrees are 2, which is even)
- Number of spanning trees: $n$
- Automorphism group: dihedral group $D_n$ with $|Aut(C_n)| = 2n$

### Small Cycles

- $C_3$ = triangle = $K_3$
- $C_4$ = square = $K_{2,2}$
- $C_5$ = pentagon (smallest odd cycle that isn't $K_3$)

## Path Graphs $P_n$

The **path graph** $P_n$ has $n$ vertices connected in a line.

### Properties

- Vertices: $n$, Edges: $n - 1$
- Two endpoints have degree 1, all others have degree 2
- Chromatic number: $\chi(P_n) = 2$ (for $n \ge 2$)
- Diameter: $n - 1$
- A tree (connected, acyclic)
- Number of spanning trees: 1 (the graph itself)
- $|Aut(P_n)| = 2$ (identity and reverse)

### Relationship to Cycles

Removing any single edge from $C_n$ gives $P_n$. Adding an edge between the endpoints of $P_n$ gives $C_n$.

## Wheel Graphs $W_n$

The **wheel graph** $W_n$ is formed by connecting a single hub vertex to all vertices of a cycle $C_n$.

$$W_n = K_1 + C_n$$

### Properties

- Vertices: $n + 1$ (the $n$ cycle vertices plus the hub)
- Edges: $2n$ ($n$ cycle edges + $n$ spoke edges)
- Hub has degree $n$; cycle vertices have degree 3
- Chromatic number:

$$\chi(W_n) = \begin{cases} 3 & \text{if } n \text{ is even} \\ 4 & \text{if } n \text{ is odd} \end{cases}$$

- $W_n$ is planar for all $n \ge 3$
- $W_3 = K_4$ (the only wheel that is complete)
- Hamiltonian (start at hub, traverse cycle, return)
- 3-connected (removing fewer than 3 vertices leaves it connected)

### Example

$W_5$ has 6 vertices: a central hub connected to a 5-cycle. It has 10 edges and looks like a bicycle wheel with 5 spokes.

## Petersen Graph

The **Petersen graph** is one of the most famous graphs in graph theory. It serves as a counterexample to many conjectures.

### Construction

- 10 vertices, 15 edges
- Can be defined on 2-element subsets of $\{1,2,3,4,5\}$: two vertices are adjacent if and only if the subsets are disjoint
- Alternatively: outer 5-cycle $+ $ inner pentagram $+$ connecting edges

### Properties

- 3-regular (every vertex has degree 3)
- Girth: 5 (shortest cycle has 5 edges)
- Diameter: 2
- Chromatic number: $\chi = 3$
- Not Hamiltonian (has no Hamiltonian cycle)
- Not planar
- Strongly regular with parameters $(10, 3, 0, 1)$
- Vertex-transitive (looks the same from every vertex)
- Edge-transitive
- $|Aut| = 120 = 5! = |S_5|$

### Why It's Important

The Petersen graph is the smallest bridgeless cubic graph with no 3-edge-coloring (violates the 4-color theorem analog for edges). It's a counterexample to many overly optimistic conjectures about regular graphs.

## Hypercube Graphs $Q_n$

The **$n$-dimensional hypercube** $Q_n$ has vertices corresponding to all binary strings of length $n$, with edges between strings differing in exactly one bit.

### Properties

- Vertices: $2^n$
- Edges: $n \cdot 2^{n-1}$
- $n$-regular (each binary string has $n$ neighbors, one per bit flip)
- Diameter: $n$ (flip all bits one at a time)
- Chromatic number: $\chi(Q_n) = 2$ (bipartite — partition by parity of bit sum)
- Hamiltonian for $n \ge 2$ (Gray code gives a Hamiltonian cycle)
- Number of spanning trees: a complex formula involving $2^{2^n - n - 1}$

### Small Hypercubes

| $Q_n$ | Vertices | Edges | Structure |
|--------|----------|-------|-----------|
| $Q_1$ | 2 | 1 | Single edge $K_2$ |
| $Q_2$ | 4 | 4 | Square $C_4$ |
| $Q_3$ | 8 | 12 | Cube (3D) |
| $Q_4$ | 16 | 32 | Tesseract (4D) |

### Recursive Construction

$Q_n$ can be built from two copies of $Q_{n-1}$ by connecting corresponding vertices:

$$Q_n = Q_{n-1} \times K_2$$

This means: take two copies of $Q_{n-1}$, label one with prefix "0" and the other with prefix "1", then connect $0v$ to $1v$ for all $v$.

### Applications

- **Parallel computing**: processors connected as a hypercube
- **Error-correcting codes**: Hamming distance corresponds to graph distance
- **Gray codes**: Hamiltonian cycles in $Q_n$

## Chromatic Numbers Summary

| Graph Family | Chromatic Number |
|-------------|-----------------|
| $K_n$ | $n$ |
| $C_n$ (even) | 2 |
| $C_n$ (odd) | 3 |
| $P_n$ ($n \ge 2$) | 2 |
| $W_n$ (even) | 3 |
| $W_n$ (odd) | 4 |
| $K_{m,n}$ | 2 |
| $Q_n$ | 2 |
| Petersen | 3 |
| Tree | 2 |

## Code: Generate and Verify Special Graphs

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

class Graph {
public:
    int V;
    vector<vector<int>> adj;

    Graph(int v) : V(v), adj(v) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    int edgeCount() const {
        int count = 0;
        for (int i = 0; i < V; i++)
            count += adj[i].size();
        return count / 2;
    }

    bool isRegular() const {
        if (V == 0) return true;
        int deg = adj[0].size();
        for (int i = 1; i < V; i++)
            if ((int)adj[i].size() != deg) return false;
        return true;
    }

    int regularity() const {
        return V > 0 ? adj[0].size() : 0;
    }
};

Graph completeGraph(int n) {
    Graph g(n);
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            g.addEdge(i, j);
    return g;
}

Graph cycleGraph(int n) {
    Graph g(n);
    for (int i = 0; i < n; i++)
        g.addEdge(i, (i + 1) % n);
    return g;
}

Graph completeBipartite(int m, int n) {
    Graph g(m + n);
    for (int i = 0; i < m; i++)
        for (int j = m; j < m + n; j++)
            g.addEdge(i, j);
    return g;
}

Graph hypercube(int n) {
    int vertices = 1 << n;
    Graph g(vertices);
    for (int u = 0; u < vertices; u++)
        for (int bit = 0; bit < n; bit++) {
            int v = u ^ (1 << bit);
            if (u < v) g.addEdge(u, v);
        }
    return g;
}

int main() {
    auto k5 = completeGraph(5);
    cout << "K5: " << k5.V << " vertices, " << k5.edgeCount() << " edges, "
         << (k5.isRegular() ? "regular" : "not regular") << endl;

    auto c6 = cycleGraph(6);
    cout << "C6: " << c6.V << " vertices, " << c6.edgeCount() << " edges, "
         << (c6.isRegular() ? "regular" : "not regular") << endl;

    auto k33 = completeBipartite(3, 3);
    cout << "K3,3: " << k33.V << " vertices, " << k33.edgeCount() << " edges, "
         << (k33.isRegular() ? "regular" : "not regular") << endl;

    auto q3 = hypercube(3);
    cout << "Q3: " << q3.V << " vertices, " << q3.edgeCount() << " edges, "
         << (q3.isRegular() ? "regular" : "not regular") << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class SpecialGraphs {
    class Graph {
        public int V { get; }
        public List<int>[] Adj { get; }

        public Graph(int v) {
            V = v;
            Adj = new List<int>[v];
            for (int i = 0; i < v; i++)
                Adj[i] = new List<int>();
        }

        public void AddEdge(int u, int v) {
            Adj[u].Add(v);
            Adj[v].Add(u);
        }

        public int EdgeCount() => Adj.Sum(a => a.Count) / 2;

        public bool IsRegular() {
            if (V == 0) return true;
            int deg = Adj[0].Count;
            return Adj.All(a => a.Count == deg);
        }

        public bool IsBipartite() {
            int[] color = Enumerable.Repeat(-1, V).ToArray();
            for (int start = 0; start < V; start++) {
                if (color[start] != -1) continue;
                var queue = new Queue<int>();
                queue.Enqueue(start);
                color[start] = 0;
                while (queue.Count > 0) {
                    int u = queue.Dequeue();
                    foreach (int v in Adj[u]) {
                        if (color[v] == -1) {
                            color[v] = 1 - color[u];
                            queue.Enqueue(v);
                        } else if (color[v] == color[u]) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    }

    static Graph CompleteGraph(int n) {
        var g = new Graph(n);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                g.AddEdge(i, j);
        return g;
    }

    static Graph CycleGraph(int n) {
        var g = new Graph(n);
        for (int i = 0; i < n; i++)
            g.AddEdge(i, (i + 1) % n);
        return g;
    }

    static Graph Hypercube(int n) {
        int vertices = 1 << n;
        var g = new Graph(vertices);
        for (int u = 0; u < vertices; u++)
            for (int bit = 0; bit < n; bit++) {
                int v = u ^ (1 << bit);
                if (u < v) g.AddEdge(u, v);
            }
        return g;
    }

    static void Main() {
        var k5 = CompleteGraph(5);
        Console.WriteLine($"K5: {k5.V} vertices, {k5.EdgeCount()} edges, regular={k5.IsRegular()}");

        var c6 = CycleGraph(6);
        Console.WriteLine($"C6: {c6.V} vertices, {c6.EdgeCount()} edges, bipartite={c6.IsBipartite()}");

        var q4 = Hypercube(4);
        Console.WriteLine($"Q4: {q4.V} vertices, {q4.EdgeCount()} edges, regular={q4.IsRegular()}, bipartite={q4.IsBipartite()}");
    }
}
```

```java
import java.util.*;

public class SpecialGraphs {
    static int[][] completeGraph(int n) {
        int[][] adj = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                adj[i][j] = adj[j][i] = 1;
        return adj;
    }

    static int[][] cycleGraph(int n) {
        int[][] adj = new int[n][n];
        for (int i = 0; i < n; i++) {
            adj[i][(i + 1) % n] = 1;
            adj[(i + 1) % n][i] = 1;
        }
        return adj;
    }

    static int[][] completeBipartite(int m, int n) {
        int total = m + n;
        int[][] adj = new int[total][total];
        for (int i = 0; i < m; i++)
            for (int j = m; j < total; j++)
                adj[i][j] = adj[j][i] = 1;
        return adj;
    }

    static int[][] hypercube(int dim) {
        int vertices = 1 << dim;
        int[][] adj = new int[vertices][vertices];
        for (int u = 0; u < vertices; u++)
            for (int bit = 0; bit < dim; bit++) {
                int v = u ^ (1 << bit);
                adj[u][v] = 1;
            }
        return adj;
    }

    static int edgeCount(int[][] adj) {
        int count = 0;
        for (int i = 0; i < adj.length; i++)
            for (int j = i + 1; j < adj.length; j++)
                count += adj[i][j];
        return count;
    }

    static boolean isRegular(int[][] adj) {
        int n = adj.length;
        if (n == 0) return true;
        int deg = Arrays.stream(adj[0]).sum();
        for (int i = 1; i < n; i++)
            if (Arrays.stream(adj[i]).sum() != deg) return false;
        return true;
    }

    public static void main(String[] args) {
        int[][] k5 = completeGraph(5);
        System.out.println("K5: 5 vertices, " + edgeCount(k5) + " edges, regular=" + isRegular(k5));

        int[][] c7 = cycleGraph(7);
        System.out.println("C7: 7 vertices, " + edgeCount(c7) + " edges, regular=" + isRegular(c7));

        int[][] k34 = completeBipartite(3, 4);
        System.out.println("K3,4: 7 vertices, " + edgeCount(k34) + " edges, regular=" + isRegular(k34));

        int[][] q3 = hypercube(3);
        System.out.println("Q3: 8 vertices, " + edgeCount(q3) + " edges, regular=" + isRegular(q3));
    }
}
```

```python
class Graph:
    def __init__(self, vertices):
        self.V = vertices
        self.adj = [[] for _ in range(vertices)]

    def add_edge(self, u, v):
        self.adj[u].append(v)
        self.adj[v].append(u)

    def edge_count(self):
        return sum(len(neighbors) for neighbors in self.adj) // 2

    def is_regular(self):
        if self.V == 0:
            return True
        deg = len(self.adj[0])
        return all(len(self.adj[i]) == deg for i in range(self.V))

    def degree_sequence(self):
        return sorted(len(self.adj[i]) for i in range(self.V))

    def is_bipartite(self):
        color = [-1] * self.V
        for start in range(self.V):
            if color[start] != -1:
                continue
            queue = [start]
            color[start] = 0
            while queue:
                u = queue.pop(0)
                for v in self.adj[u]:
                    if color[v] == -1:
                        color[v] = 1 - color[u]
                        queue.append(v)
                    elif color[v] == color[u]:
                        return False
        return True


def complete_graph(n):
    """Generate K_n."""
    g = Graph(n)
    for i in range(n):
        for j in range(i + 1, n):
            g.add_edge(i, j)
    return g


def cycle_graph(n):
    """Generate C_n."""
    g = Graph(n)
    for i in range(n):
        g.add_edge(i, (i + 1) % n)
    return g


def path_graph(n):
    """Generate P_n."""
    g = Graph(n)
    for i in range(n - 1):
        g.add_edge(i, i + 1)
    return g


def complete_bipartite(m, n):
    """Generate K_{m,n}."""
    g = Graph(m + n)
    for i in range(m):
        for j in range(m, m + n):
            g.add_edge(i, j)
    return g


def wheel_graph(n):
    """Generate W_n (hub + C_n)."""
    g = Graph(n + 1)
    # Cycle among vertices 1..n
    for i in range(1, n + 1):
        g.add_edge(i, (i % n) + 1)
    # Hub (vertex 0) connects to all cycle vertices
    for i in range(1, n + 1):
        g.add_edge(0, i)
    return g


def hypercube(n):
    """Generate Q_n."""
    vertices = 1 << n
    g = Graph(vertices)
    for u in range(vertices):
        for bit in range(n):
            v = u ^ (1 << bit)
            if u < v:
                g.add_edge(u, v)
    return g


def petersen_graph():
    """Generate the Petersen graph."""
    g = Graph(10)
    # Outer cycle: 0-1-2-3-4-0
    for i in range(5):
        g.add_edge(i, (i + 1) % 5)
    # Inner pentagram: 5-7-9-6-8-5
    for i in range(5):
        g.add_edge(i + 5, ((i + 2) % 5) + 5)
    # Spokes: i to i+5
    for i in range(5):
        g.add_edge(i, i + 5)
    return g


# Demonstrate and verify
print("=== Complete Graph K5 ===")
k5 = complete_graph(5)
print(f"Vertices: {k5.V}, Edges: {k5.edge_count()}, Regular: {k5.is_regular()}")

print("\n=== Cycle Graph C6 ===")
c6 = cycle_graph(6)
print(f"Vertices: {c6.V}, Edges: {c6.edge_count()}, Bipartite: {c6.is_bipartite()}")

print("\n=== Wheel Graph W5 ===")
w5 = wheel_graph(5)
print(f"Vertices: {w5.V}, Edges: {w5.edge_count()}, Degree seq: {w5.degree_sequence()}")

print("\n=== Hypercube Q3 ===")
q3 = hypercube(3)
print(f"Vertices: {q3.V}, Edges: {q3.edge_count()}, Regular: {q3.is_regular()}, Bipartite: {q3.is_bipartite()}")

print("\n=== Petersen Graph ===")
pg = petersen_graph()
print(f"Vertices: {pg.V}, Edges: {pg.edge_count()}, Regular: {pg.is_regular()}, Bipartite: {pg.is_bipartite()}")

print("\n=== Complete Bipartite K3,4 ===")
k34 = complete_bipartite(3, 4)
print(f"Vertices: {k34.V}, Edges: {k34.edge_count()}, Bipartite: {k34.is_bipartite()}")
```

```javascript
class Graph {
  constructor(vertices) {
    this.V = vertices;
    this.adj = Array.from({ length: vertices }, () => []);
  }

  addEdge(u, v) {
    this.adj[u].push(v);
    this.adj[v].push(u);
  }

  edgeCount() {
    return this.adj.reduce((sum, neighbors) => sum + neighbors.length, 0) / 2;
  }

  isRegular() {
    if (this.V === 0) return true;
    const deg = this.adj[0].length;
    return this.adj.every((neighbors) => neighbors.length === deg);
  }

  isBipartite() {
    const color = new Array(this.V).fill(-1);
    for (let start = 0; start < this.V; start++) {
      if (color[start] !== -1) continue;
      const queue = [start];
      color[start] = 0;
      let front = 0;
      while (front < queue.length) {
        const u = queue[front++];
        for (const v of this.adj[u]) {
          if (color[v] === -1) {
            color[v] = 1 - color[u];
            queue.push(v);
          } else if (color[v] === color[u]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  degreeSequence() {
    return this.adj.map((n) => n.length).sort((a, b) => a - b);
  }
}

function completeGraph(n) {
  const g = new Graph(n);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) g.addEdge(i, j);
  return g;
}

function cycleGraph(n) {
  const g = new Graph(n);
  for (let i = 0; i < n; i++) g.addEdge(i, (i + 1) % n);
  return g;
}

function wheelGraph(n) {
  const g = new Graph(n + 1);
  for (let i = 1; i <= n; i++) g.addEdge(i, (i % n) + 1);
  for (let i = 1; i <= n; i++) g.addEdge(0, i);
  return g;
}

function hypercube(dim) {
  const vertices = 1 << dim;
  const g = new Graph(vertices);
  for (let u = 0; u < vertices; u++)
    for (let bit = 0; bit < dim; bit++) {
      const v = u ^ (1 << bit);
      if (u < v) g.addEdge(u, v);
    }
  return g;
}

function petersenGraph() {
  const g = new Graph(10);
  for (let i = 0; i < 5; i++) g.addEdge(i, (i + 1) % 5);
  for (let i = 0; i < 5; i++) g.addEdge(i + 5, ((i + 2) % 5) + 5);
  for (let i = 0; i < 5; i++) g.addEdge(i, i + 5);
  return g;
}

// Verify properties
const k5 = completeGraph(5);
console.log(`K5: ${k5.V} vertices, ${k5.edgeCount()} edges, regular=${k5.isRegular()}`);

const c6 = cycleGraph(6);
console.log(`C6: ${c6.V} vertices, ${c6.edgeCount()} edges, bipartite=${c6.isBipartite()}`);

const w5 = wheelGraph(5);
console.log(`W5: ${w5.V} vertices, ${w5.edgeCount()} edges, degrees=${w5.degreeSequence()}`);

const q3 = hypercube(3);
console.log(`Q3: ${q3.V} vertices, ${q3.edgeCount()} edges, regular=${q3.isRegular()}, bipartite=${q3.isBipartite()}`);

const pg = petersenGraph();
console.log(`Petersen: ${pg.V} vertices, ${pg.edgeCount()} edges, regular=${pg.isRegular()}, bipartite=${pg.isBipartite()}`);
```

## Key Takeaways

- **Complete graphs** $K_n$ connect every pair of vertices; they require $n$ colors and have $\binom{n}{2}$ edges
- **Bipartite graphs** have vertices split into two sets with edges only between sets; they are exactly the graphs with no odd cycles
- **Complete bipartite** $K_{m,n}$ connects every vertex in one part to every vertex in the other; $K_{3,3}$ is the utility graph
- **Regular graphs** have all vertices with the same degree; they include cycles, hypercubes, and the Petersen graph
- **Cycle graphs** $C_n$ are 2-regular; even cycles are bipartite, odd cycles need 3 colors
- **Wheel graphs** $W_n$ add a hub to a cycle; they are always planar and 3-connected
- **The Petersen graph** is a remarkable 3-regular graph that serves as a counterexample to many conjectures
- **Hypercubes** $Q_n$ encode binary strings as vertices; they are bipartite, $n$-regular, and Hamiltonian
- Recognizing these families helps quickly determine chromatic number, planarity, connectivity, and other properties
