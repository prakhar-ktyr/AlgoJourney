---
title: Graph Isomorphism
---

# Graph Isomorphism

Two graphs are **isomorphic** if they have the same structure — they differ only in how their vertices are labeled. Graph isomorphism is a fundamental concept for determining when two graphs are "essentially the same."

## Intuition

Consider two social networks with the same friendship patterns but different usernames. The underlying structure is identical — we just renamed people. That's isomorphism.

Think of it as relabeling: if you can rename the vertices of one graph to get exactly the other graph, they are isomorphic.

## Formal Definition

Two graphs $G_1 = (V_1, E_1)$ and $G_2 = (V_2, E_2)$ are **isomorphic** (written $G_1 \cong G_2$) if there exists a **bijection** $\phi: V_1 \to V_2$ such that:

$$(u, v) \in E_1 \iff (\phi(u), \phi(v)) \in E_2$$

The function $\phi$ is called an **isomorphism**. It maps vertices one-to-one while preserving the edge relationship.

### Example

Graph $G_1$: vertices $\{1, 2, 3, 4\}$, edges $\{(1,2), (2,3), (3,4), (4,1)\}$

Graph $G_2$: vertices $\{a, b, c, d\}$, edges $\{(a,c), (c,b), (b,d), (d,a)\}$

The bijection $\phi(1) = a, \phi(2) = c, \phi(3) = b, \phi(4) = d$ is an isomorphism because:
- $(1,2) \in E_1 \iff (a,c) \in E_2$ ✓
- $(2,3) \in E_1 \iff (c,b) \in E_2$ ✓
- $(3,4) \in E_1 \iff (b,d) \in E_2$ ✓
- $(4,1) \in E_1 \iff (d,a) \in E_2$ ✓

Both are 4-cycles — same structure, different labels.

## Necessary Conditions for Isomorphism

If $G_1 \cong G_2$, the following must hold:

1. **Same number of vertices**: $|V_1| = |V_2|$
2. **Same number of edges**: $|E_1| = |E_2|$
3. **Same degree sequence**: The sorted list of vertex degrees must match
4. **Same number of connected components**
5. **Same number of cycles of each length**

These are necessary but **not sufficient** — two non-isomorphic graphs can satisfy all of these.

### Using Conditions to Disprove Isomorphism

Graph $A$: 4 vertices, degree sequence $[2, 2, 2, 2]$ (a 4-cycle $C_4$)

Graph $B$: 4 vertices, degree sequence $[3, 3, 1, 1]$

Since the degree sequences differ, $A \not\cong B$. We've proven non-isomorphism without checking all $4! = 24$ possible bijections.

### Counter-Example: Conditions Satisfied but Not Isomorphic

The following two graphs both have 6 vertices, 6 edges, and degree sequence $[2, 2, 2, 2, 2, 2]$:

- $G_1 = C_6$ (a single 6-cycle)
- $G_2 = C_3 \cup C_3$ (two disjoint triangles)

Same degree sequence, but $G_1$ is connected and $G_2$ is not — they are **not** isomorphic.

## Graph Invariants

A **graph invariant** is a property that is the same for all isomorphic graphs. If any invariant differs between two graphs, they cannot be isomorphic.

### Common Invariants

| Invariant | Definition |
|-----------|-----------|
| Order | Number of vertices $\|V\|$ |
| Size | Number of edges $\|E\|$ |
| Degree sequence | Sorted list of degrees |
| Girth | Length of the shortest cycle |
| Diameter | Longest shortest path between any pair |
| Chromatic number | Minimum colors for proper coloring |
| Clique number | Size of the largest complete subgraph |
| Independence number | Size of the largest independent set |
| Number of triangles | Count of $K_3$ subgraphs |
| Eigenvalues | Spectrum of the adjacency matrix |

### Using Multiple Invariants

Two graphs with 8 vertices, 12 edges, and degree sequence $[3,3,3,3,3,3,3,3]$:

- The **cube graph** $Q_3$ has girth 4 (smallest cycle is a square)
- The **complete bipartite graph** $K_{3,3}$ minus a perfect matching has girth 4 too

We might need the **spectrum** (eigenvalues of the adjacency matrix) to distinguish them. Graphs with the same spectrum are called **cospectral** — even this doesn't always suffice!

## Checking Isomorphism: Brute Force

The naive approach tries all possible bijections:

1. Fix the vertex ordering of $G_1$: $v_1, v_2, \ldots, v_n$
2. For each permutation $\sigma$ of vertices of $G_2$:
   - Check if mapping $v_i \to \sigma(i)$ preserves all edges
3. If any permutation works, the graphs are isomorphic

There are $n!$ permutations — this is $O(n! \cdot n^2)$ in the worst case.

### Pruning Strategies

1. **Degree matching**: Only map vertices with the same degree
2. **Neighbor degree matching**: Mapped neighbors must have consistent degrees
3. **Distance preservation**: $d(u,v) = d(\phi(u), \phi(v))$

These reduce the search space significantly in practice but don't change the worst case.

## Graph Automorphisms

An **automorphism** of a graph $G$ is an isomorphism from $G$ to itself — a relabeling that produces the same graph.

The set of all automorphisms forms a group under composition, called the **automorphism group** $\text{Aut}(G)$.

### Examples

- The complete graph $K_n$ has $\text{Aut}(K_n) = S_n$ (all $n!$ permutations)
- The cycle $C_n$ has $|\text{Aut}(C_n)| = 2n$ (rotations and reflections)
- The path $P_n$ has $|\text{Aut}(P_n)| = 2$ (identity and reversal)
- An asymmetric graph has $|\text{Aut}(G)| = 1$ (only the identity)

### Connection to Isomorphism

The number of isomorphisms between two isomorphic graphs $G_1$ and $G_2$ equals $|\text{Aut}(G_1)|$. If we find one isomorphism $\phi$, then $\phi \circ \alpha$ is also an isomorphism for every automorphism $\alpha$ of $G_1$.

## Computational Complexity

The **Graph Isomorphism (GI) problem** has a unique status:

- It is in NP (a bijection can be verified in polynomial time)
- It is **not known** to be in P
- It is **not known** to be NP-complete
- No polynomial-time algorithm is known for general graphs

### Babai's Breakthrough (2015)

László Babai showed that GI can be solved in **quasipolynomial time**: $O(2^{(\log n)^c})$ for some constant $c$. This is between polynomial and exponential — a major theoretical result.

### Special Cases in Polynomial Time

GI is solvable in polynomial time for:
- Trees ($O(n \log n)$)
- Planar graphs ($O(n)$)
- Graphs of bounded degree
- Graphs of bounded treewidth
- Interval graphs

## Practical Algorithms

### Weisfeiler-Leman (WL) Method

The 1-dimensional WL method iteratively refines vertex colorings:

1. Assign initial colors based on degree
2. Refine: new color = (old color, sorted multiset of neighbor colors)
3. Repeat until stable

If the resulting color histograms differ, the graphs are **not** isomorphic. If they match, the result is inconclusive — WL may fail on some regular graphs.

### VF2 Algorithm

A practical backtracking algorithm used in chemistry (molecular graph matching) and network analysis. It explores the search tree of partial mappings with feasibility pruning.

## Code: Check Necessary Conditions for Isomorphism

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Graph {
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

    vector<int> degreeSequence() const {
        vector<int> degrees(V);
        for (int i = 0; i < V; i++)
            degrees[i] = adj[i].size();
        sort(degrees.begin(), degrees.end());
        return degrees;
    }
};

bool checkNecessaryConditions(const Graph& g1, const Graph& g2) {
    if (g1.V != g2.V) {
        cout << "Different vertex count: " << g1.V << " vs " << g2.V << endl;
        return false;
    }
    if (g1.edgeCount() != g2.edgeCount()) {
        cout << "Different edge count: " << g1.edgeCount() << " vs " << g2.edgeCount() << endl;
        return false;
    }
    if (g1.degreeSequence() != g2.degreeSequence()) {
        cout << "Different degree sequences" << endl;
        return false;
    }
    cout << "All necessary conditions satisfied (may still not be isomorphic)" << endl;
    return true;
}

int main() {
    Graph g1(4), g2(4);
    // G1: cycle 0-1-2-3-0
    g1.addEdge(0, 1); g1.addEdge(1, 2);
    g1.addEdge(2, 3); g1.addEdge(3, 0);
    // G2: cycle 0-2-1-3-0
    g2.addEdge(0, 2); g2.addEdge(2, 1);
    g2.addEdge(1, 3); g2.addEdge(3, 0);

    checkNecessaryConditions(g1, g2);
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

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

    public int EdgeCount() {
        return Adj.Sum(a => a.Count) / 2;
    }

    public List<int> DegreeSequence() {
        var degrees = Adj.Select(a => a.Count).ToList();
        degrees.Sort();
        return degrees;
    }
}

class IsomorphismChecker {
    static bool CheckNecessaryConditions(Graph g1, Graph g2) {
        if (g1.V != g2.V) {
            Console.WriteLine($"Different vertex count: {g1.V} vs {g2.V}");
            return false;
        }
        if (g1.EdgeCount() != g2.EdgeCount()) {
            Console.WriteLine($"Different edge count: {g1.EdgeCount()} vs {g2.EdgeCount()}");
            return false;
        }
        var seq1 = g1.DegreeSequence();
        var seq2 = g2.DegreeSequence();
        if (!seq1.SequenceEqual(seq2)) {
            Console.WriteLine("Different degree sequences");
            return false;
        }
        Console.WriteLine("All necessary conditions satisfied (may still not be isomorphic)");
        return true;
    }

    static void Main() {
        var g1 = new Graph(4);
        g1.AddEdge(0, 1); g1.AddEdge(1, 2);
        g1.AddEdge(2, 3); g1.AddEdge(3, 0);

        var g2 = new Graph(4);
        g2.AddEdge(0, 2); g2.AddEdge(2, 1);
        g2.AddEdge(1, 3); g2.AddEdge(3, 0);

        CheckNecessaryConditions(g1, g2);
    }
}
```

```java
import java.util.*;

public class IsomorphismChecker {
    static int[][] adj1, adj2;

    static int[] degreeSequence(int[][] adj, int V) {
        int[] degrees = new int[V];
        for (int i = 0; i < V; i++) {
            int count = 0;
            for (int j = 0; j < V; j++)
                count += adj[i][j];
            degrees[i] = count;
        }
        Arrays.sort(degrees);
        return degrees;
    }

    static int edgeCount(int[][] adj, int V) {
        int count = 0;
        for (int i = 0; i < V; i++)
            for (int j = i + 1; j < V; j++)
                count += adj[i][j];
        return count;
    }

    static boolean checkNecessaryConditions(int[][] adj1, int V1, int[][] adj2, int V2) {
        if (V1 != V2) {
            System.out.println("Different vertex count: " + V1 + " vs " + V2);
            return false;
        }
        int e1 = edgeCount(adj1, V1), e2 = edgeCount(adj2, V2);
        if (e1 != e2) {
            System.out.println("Different edge count: " + e1 + " vs " + e2);
            return false;
        }
        int[] seq1 = degreeSequence(adj1, V1);
        int[] seq2 = degreeSequence(adj2, V2);
        if (!Arrays.equals(seq1, seq2)) {
            System.out.println("Different degree sequences");
            return false;
        }
        System.out.println("All necessary conditions satisfied (may still not be isomorphic)");
        return true;
    }

    public static void main(String[] args) {
        int V = 4;
        int[][] g1 = new int[V][V];
        int[][] g2 = new int[V][V];

        // G1: cycle 0-1-2-3-0
        g1[0][1] = g1[1][0] = 1;
        g1[1][2] = g1[2][1] = 1;
        g1[2][3] = g1[3][2] = 1;
        g1[3][0] = g1[0][3] = 1;

        // G2: cycle 0-2-1-3-0
        g2[0][2] = g2[2][0] = 1;
        g2[2][1] = g2[1][2] = 1;
        g2[1][3] = g2[3][1] = 1;
        g2[3][0] = g2[0][3] = 1;

        checkNecessaryConditions(g1, V, g2, V);
    }
}
```

```python
from collections import Counter

class Graph:
    def __init__(self, vertices):
        self.V = vertices
        self.adj = [[] for _ in range(vertices)]

    def add_edge(self, u, v):
        self.adj[u].append(v)
        self.adj[v].append(u)

    def edge_count(self):
        return sum(len(neighbors) for neighbors in self.adj) // 2

    def degree_sequence(self):
        return sorted(len(neighbors) for neighbors in self.adj)

    def degree_histogram(self):
        return Counter(len(neighbors) for neighbors in self.adj)


def check_necessary_conditions(g1, g2):
    """Check necessary (but not sufficient) conditions for isomorphism."""
    if g1.V != g2.V:
        print(f"Different vertex count: {g1.V} vs {g2.V}")
        return False

    if g1.edge_count() != g2.edge_count():
        print(f"Different edge count: {g1.edge_count()} vs {g2.edge_count()}")
        return False

    if g1.degree_sequence() != g2.degree_sequence():
        print("Different degree sequences")
        return False

    print("All necessary conditions satisfied (may still not be isomorphic)")
    return True


# Example: Two isomorphic 4-cycles
g1 = Graph(4)
g1.add_edge(0, 1)
g1.add_edge(1, 2)
g1.add_edge(2, 3)
g1.add_edge(3, 0)

g2 = Graph(4)
g2.add_edge(0, 2)
g2.add_edge(2, 1)
g2.add_edge(1, 3)
g2.add_edge(3, 0)

check_necessary_conditions(g1, g2)

# Example: Non-isomorphic graphs
g3 = Graph(4)
g3.add_edge(0, 1)
g3.add_edge(0, 2)
g3.add_edge(0, 3)  # Star graph: degree sequence [3, 1, 1, 1]

print()
check_necessary_conditions(g1, g3)
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

  degreeSequence() {
    return this.adj.map((neighbors) => neighbors.length).sort((a, b) => a - b);
  }
}

function checkNecessaryConditions(g1, g2) {
  if (g1.V !== g2.V) {
    console.log(`Different vertex count: ${g1.V} vs ${g2.V}`);
    return false;
  }

  if (g1.edgeCount() !== g2.edgeCount()) {
    console.log(`Different edge count: ${g1.edgeCount()} vs ${g2.edgeCount()}`);
    return false;
  }

  const seq1 = g1.degreeSequence();
  const seq2 = g2.degreeSequence();
  if (seq1.length !== seq2.length || seq1.some((d, i) => d !== seq2[i])) {
    console.log("Different degree sequences");
    return false;
  }

  console.log(
    "All necessary conditions satisfied (may still not be isomorphic)"
  );
  return true;
}

// Example: Two isomorphic 4-cycles
const g1 = new Graph(4);
g1.addEdge(0, 1);
g1.addEdge(1, 2);
g1.addEdge(2, 3);
g1.addEdge(3, 0);

const g2 = new Graph(4);
g2.addEdge(0, 2);
g2.addEdge(2, 1);
g2.addEdge(1, 3);
g2.addEdge(3, 0);

checkNecessaryConditions(g1, g2);

// Example: Non-isomorphic graphs
const g3 = new Graph(4);
g3.addEdge(0, 1);
g3.addEdge(0, 2);
g3.addEdge(0, 3); // Star: degree sequence [3, 1, 1, 1]

console.log();
checkNecessaryConditions(g1, g3);
```

## Key Takeaways

- Two graphs are **isomorphic** if there exists an edge-preserving bijection between their vertex sets
- **Necessary conditions** (same vertex/edge count, degree sequence) can quickly disprove isomorphism but cannot prove it
- **Graph invariants** (girth, diameter, chromatic number, spectrum) provide additional distinguishing power
- **Brute-force** isomorphism checking is $O(n!)$ — impractical for large graphs
- **Graph automorphisms** capture the internal symmetry of a graph and form a group
- GI has unique complexity status: in NP, not known to be in P or NP-complete
- **Babai's 2015 result** gives quasipolynomial time $O(2^{(\log n)^c})$ for general graphs
- Practical tools (nauty, VF2, Weisfeiler-Leman) work well for most real-world instances
