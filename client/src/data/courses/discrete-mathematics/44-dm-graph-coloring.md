---
title: Graph Coloring
---

# Graph Coloring

Graph coloring is one of the most important and widely studied problems in graph theory. The idea is simple: assign "colors" to elements of a graph (usually vertices) subject to certain constraints. Despite its simplicity, graph coloring has deep theoretical implications and numerous practical applications.

---

## Vertex Coloring

A **vertex coloring** (or proper coloring) of a graph $G$ is an assignment of colors to vertices such that **no two adjacent vertices share the same color**.

More formally, a proper $k$-coloring is a function $c: V \to \{1, 2, \ldots, k\}$ such that for every edge $(u, v) \in E$, we have $c(u) \neq c(v)$.

### Example

Consider a triangle (cycle of length 3, $C_3$):

```
    A
   / \
  B---C
```

- We cannot color it with 2 colors (try: if A=Red, B=Blue, then C must differ from both A and B — impossible with only 2 colors).
- We need at least 3 colors: A=Red, B=Blue, C=Green.

---

## Chromatic Number

The **chromatic number** $\chi(G)$ of a graph $G$ is the minimum number of colors needed for a proper vertex coloring of $G$.

### Key Facts

- $\chi(K_n) = n$ — a complete graph on $n$ vertices needs $n$ colors (every vertex is adjacent to every other).
- $\chi(C_n) = 2$ if $n$ is even, $\chi(C_n) = 3$ if $n$ is odd.
- $\chi(G) = 1$ if and only if $G$ has no edges (an independent set).
- $\chi(G) \leq \Delta(G) + 1$ where $\Delta(G)$ is the maximum degree (Brooks' theorem tightens this for most graphs).

### Bounds on Chromatic Number

$$\omega(G) \leq \chi(G) \leq \Delta(G) + 1$$

where $\omega(G)$ is the **clique number** (size of the largest complete subgraph). The lower bound comes from the fact that a clique of size $k$ requires $k$ distinct colors.

**Brooks' Theorem**: For a connected graph $G$ that is neither a complete graph nor an odd cycle:

$$\chi(G) \leq \Delta(G)$$

---

## Greedy Coloring Algorithm

The **greedy coloring** algorithm processes vertices one by one and assigns each vertex the smallest color not used by its already-colored neighbors.

### Algorithm Steps

1. Order the vertices as $v_1, v_2, \ldots, v_n$.
2. For each vertex $v_i$ (in order):
   - Look at the colors assigned to its already-processed neighbors.
   - Assign $v_i$ the smallest positive integer not in that set.

### Properties

- Greedy coloring always produces a valid coloring.
- It uses at most $\Delta(G) + 1$ colors (since any vertex has at most $\Delta(G)$ neighbors).
- The result depends on the vertex ordering — some orderings give optimal colorings, others don't.
- Finding the optimal ordering is as hard as finding $\chi(G)$ itself (NP-hard in general).

---

## Bipartite Graphs and 2-Colorability

A graph is **bipartite** if and only if $\chi(G) = 2$ (assuming the graph has at least one edge).

Equivalently, a graph is bipartite if and only if it contains no odd-length cycle. This gives us a practical way to test bipartiteness: run BFS/DFS and try to 2-color the graph. If you find a conflict, the graph is not bipartite (and thus $\chi(G) \geq 3$).

### Testing 2-Colorability

1. Start BFS from any vertex, color it 0.
2. Color all its neighbors 1.
3. Color their uncolored neighbors 0, and so on.
4. If you ever find an edge between two vertices of the same color, the graph is NOT 2-colorable.

---

## The Four Color Theorem

**Theorem**: Every planar graph can be properly colored with at most 4 colors.

$$\chi(G) \leq 4 \quad \text{for every planar graph } G$$

This famous theorem was first conjectured in 1852 and proven in 1976 by Appel and Haken using computer assistance — one of the first major theorems proved with computer aid.

### Historical Notes

- **Five Color Theorem** (easier to prove): Every planar graph is 5-colorable. This can be shown using induction and Euler's formula.
- The Four Color Theorem implies that any map (countries as vertices, shared borders as edges) can be colored with 4 colors so no neighboring countries share a color.

---

## Applications of Graph Coloring

### 1. Map Coloring

The original motivation: color regions of a map so that adjacent regions have different colors.

### 2. Scheduling

- **Exam scheduling**: Each exam is a vertex; edges connect exams with common students. Colors represent time slots. The chromatic number gives the minimum number of slots needed.
- **Task scheduling**: Tasks that conflict (share a resource) cannot run simultaneously.

### 3. Register Allocation (Compilers)

In compiler optimization, variables are vertices. An edge connects two variables that are "live" at the same time (both needed simultaneously). Colors represent CPU registers. The chromatic number gives the minimum registers needed.

### 4. Frequency Assignment

Radio towers that are close together cannot use the same frequency (interference). Model as a graph coloring problem to minimize the number of distinct frequencies.

### 5. Sudoku

A Sudoku puzzle is equivalent to coloring a specific graph with 9 colors!

---

## Code: Greedy Graph Coloring

Given an adjacency list, implement greedy coloring and return the color assignment.

```cpp
#include <iostream>
#include <vector>
#include <set>
using namespace std;

// Greedy graph coloring
// Returns a vector where result[i] = color assigned to vertex i
vector<int> greedyColoring(int n, const vector<vector<int>>& adj) {
    vector<int> color(n, -1); // -1 means uncolored

    for (int u = 0; u < n; u++) {
        // Find colors used by adjacent vertices
        set<int> usedColors;
        for (int v : adj[u]) {
            if (color[v] != -1) {
                usedColors.insert(color[v]);
            }
        }
        // Assign the smallest available color
        int c = 0;
        while (usedColors.count(c)) {
            c++;
        }
        color[u] = c;
    }
    return color;
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);
    // Add edges (undirected)
    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };
    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 2);
    addEdge(1, 3);
    addEdge(2, 3);
    addEdge(3, 4);

    vector<int> result = greedyColoring(n, adj);
    int numColors = *max_element(result.begin(), result.end()) + 1;
    cout << "Chromatic number (upper bound): " << numColors << endl;
    for (int i = 0; i < n; i++) {
        cout << "Vertex " << i << " -> Color " << result[i] << endl;
    }
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class GraphColoring
{
    // Greedy graph coloring
    static int[] GreedyColoring(int n, List<int>[] adj)
    {
        int[] color = new int[n];
        Array.Fill(color, -1); // -1 means uncolored

        for (int u = 0; u < n; u++)
        {
            // Find colors used by adjacent vertices
            HashSet<int> usedColors = new HashSet<int>();
            foreach (int v in adj[u])
            {
                if (color[v] != -1)
                    usedColors.Add(color[v]);
            }
            // Assign the smallest available color
            int c = 0;
            while (usedColors.Contains(c))
                c++;
            color[u] = c;
        }
        return color;
    }

    static void Main()
    {
        int n = 5;
        List<int>[] adj = new List<int>[n];
        for (int i = 0; i < n; i++)
            adj[i] = new List<int>();

        void AddEdge(int u, int v) { adj[u].Add(v); adj[v].Add(u); }
        AddEdge(0, 1);
        AddEdge(0, 2);
        AddEdge(1, 2);
        AddEdge(1, 3);
        AddEdge(2, 3);
        AddEdge(3, 4);

        int[] result = GreedyColoring(n, adj);
        int numColors = result.Max() + 1;
        Console.WriteLine($"Chromatic number (upper bound): {numColors}");
        for (int i = 0; i < n; i++)
            Console.WriteLine($"Vertex {i} -> Color {result[i]}");
    }
}
```

```java
import java.util.*;

public class GraphColoring {
    // Greedy graph coloring
    public static int[] greedyColoring(int n, List<List<Integer>> adj) {
        int[] color = new int[n];
        Arrays.fill(color, -1); // -1 means uncolored

        for (int u = 0; u < n; u++) {
            // Find colors used by adjacent vertices
            Set<Integer> usedColors = new HashSet<>();
            for (int v : adj.get(u)) {
                if (color[v] != -1) {
                    usedColors.add(color[v]);
                }
            }
            // Assign the smallest available color
            int c = 0;
            while (usedColors.contains(c)) c++;
            color[u] = c;
        }
        return color;
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        // Add edges (undirected)
        int[][] edges = {{0,1},{0,2},{1,2},{1,3},{2,3},{3,4}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        int[] result = greedyColoring(n, adj);
        int numColors = Arrays.stream(result).max().getAsInt() + 1;
        System.out.println("Chromatic number (upper bound): " + numColors);
        for (int i = 0; i < n; i++)
            System.out.println("Vertex " + i + " -> Color " + result[i]);
    }
}
```

```python
def greedy_coloring(n, adj):
    """Greedy graph coloring algorithm."""
    color = [-1] * n  # -1 means uncolored

    for u in range(n):
        # Find colors used by adjacent vertices
        used_colors = set()
        for v in adj[u]:
            if color[v] != -1:
                used_colors.add(color[v])
        # Assign the smallest available color
        c = 0
        while c in used_colors:
            c += 1
        color[u] = c

    return color


# Example usage
n = 5
adj = [[] for _ in range(n)]

def add_edge(u, v):
    adj[u].append(v)
    adj[v].append(u)

edges = [(0,1), (0,2), (1,2), (1,3), (2,3), (3,4)]
for u, v in edges:
    add_edge(u, v)

result = greedy_coloring(n, adj)
num_colors = max(result) + 1
print(f"Chromatic number (upper bound): {num_colors}")
for i in range(n):
    print(f"Vertex {i} -> Color {result[i]}")
```

```javascript
function greedyColoring(n, adj) {
  // Greedy graph coloring algorithm
  const color = new Array(n).fill(-1); // -1 means uncolored

  for (let u = 0; u < n; u++) {
    // Find colors used by adjacent vertices
    const usedColors = new Set();
    for (const v of adj[u]) {
      if (color[v] !== -1) {
        usedColors.add(color[v]);
      }
    }
    // Assign the smallest available color
    let c = 0;
    while (usedColors.has(c)) c++;
    color[u] = c;
  }
  return color;
}

// Example usage
const n = 5;
const adj = Array.from({ length: n }, () => []);

function addEdge(u, v) {
  adj[u].push(v);
  adj[v].push(u);
}

const edges = [[0,1],[0,2],[1,2],[1,3],[2,3],[3,4]];
edges.forEach(([u, v]) => addEdge(u, v));

const result = greedyColoring(n, adj);
const numColors = Math.max(...result) + 1;
console.log(`Chromatic number (upper bound): ${numColors}`);
for (let i = 0; i < n; i++) {
  console.log(`Vertex ${i} -> Color ${result[i]}`);
}
```

---

## Complexity of Graph Coloring

| Problem | Complexity |
|---------|-----------|
| Is $G$ 1-colorable? | $O(1)$ — only if $E = \emptyset$ |
| Is $G$ 2-colorable? | $O(V + E)$ — BFS/DFS bipartiteness check |
| Is $G$ 3-colorable? | NP-complete |
| Is $G$ $k$-colorable ($k \geq 3$)? | NP-complete |
| Find $\chi(G)$ | NP-hard |

This is why we rely on heuristics (like greedy coloring) and special cases (planar, bipartite) in practice.

---

## Edge Coloring (Brief)

While vertex coloring is the most common, **edge coloring** assigns colors to edges so no two edges sharing a vertex have the same color.

- The minimum number of edge colors needed is the **chromatic index** $\chi'(G)$.
- **Vizing's Theorem**: $\Delta(G) \leq \chi'(G) \leq \Delta(G) + 1$.

---

## Key Takeaways

1. **Vertex coloring** assigns colors to vertices so no adjacent pair shares a color.
2. The **chromatic number** $\chi(G)$ is the minimum colors needed; finding it is NP-hard in general.
3. The **greedy algorithm** assigns the smallest available color to each vertex in order — simple, always valid, uses at most $\Delta(G) + 1$ colors.
4. A graph is **bipartite** if and only if $\chi(G) \leq 2$ (equivalently, no odd cycle).
5. The **Four Color Theorem** guarantees every planar graph is 4-colorable.
6. Applications span scheduling, compiler register allocation, frequency assignment, and map coloring.
7. For $k \geq 3$, determining if $\chi(G) \leq k$ is NP-complete — there's no known efficient algorithm for general graphs.
