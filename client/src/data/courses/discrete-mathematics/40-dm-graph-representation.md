---
title: Graph Representation
---

# Graph Representation

Now that we understand what graphs are, the next critical question is: **how do we store graphs in a computer?** The choice of representation affects the efficiency of every graph algorithm. In this lesson, we'll explore the major ways to represent graphs, compare their trade-offs, and implement them in code.

---

## Why Representation Matters

Different graph operations have different performance characteristics depending on how the graph is stored:

- **Checking if an edge exists** between two vertices
- **Finding all neighbors** of a vertex
- **Adding or removing** edges
- **Memory usage** for sparse vs dense graphs

There is no single "best" representation — the right choice depends on your graph's properties and which operations you perform most.

---

## Adjacency Matrix

### Concept

An **adjacency matrix** is a 2D array $A$ of size $n \times n$ (where $n = |V|$) such that:

$$A[i][j] = \begin{cases} 1 & \text{if edge } (i, j) \text{ exists} \\ 0 & \text{otherwise} \end{cases}$$

For **weighted graphs**, store the weight instead of 1:

$$A[i][j] = \begin{cases} w(i, j) & \text{if edge } (i, j) \text{ exists} \\ 0 \text{ or } \infty & \text{otherwise} \end{cases}$$

### Properties

- For an **undirected graph**, the matrix is **symmetric**: $A[i][j] = A[j][i]$
- For a **directed graph**, $A[i][j]$ may differ from $A[j][i]$
- The diagonal $A[i][i]$ represents self-loops (0 for simple graphs)
- The degree of vertex $i$: $\deg(i) = \sum_{j} A[i][j]$

### Example

Undirected graph with vertices $\{0, 1, 2, 3\}$ and edges $\{0,1\}, \{0,2\}, \{1,2\}, \{2,3\}$:

$$A = \begin{bmatrix} 0 & 1 & 1 & 0 \\ 1 & 0 & 1 & 0 \\ 1 & 1 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$

### Pros and Cons

**Advantages:** $O(1)$ edge lookup, simple to implement, efficient for dense graphs, supports matrix operations.

**Disadvantages:** Always $O(n^2)$ space, finding neighbors takes $O(n)$, wasteful for sparse graphs.

---

## Adjacency List

### Concept

An **adjacency list** stores, for each vertex, a list of its neighbors:

- `adj[i]` = list of all vertices adjacent to vertex $i$

For **weighted graphs**, each entry stores a pair $(v, w)$: neighbor and weight.

### Example

Same graph as above:

```
adj[0] → [1, 2]
adj[1] → [0, 2]
adj[2] → [0, 1, 3]
adj[3] → [2]
```

### Pros and Cons

**Advantages:** Space-efficient $O(n + m)$, optimal neighbor iteration $O(\deg(v))$, great for sparse graphs.

**Disadvantages:** Edge lookup is $O(\deg(u))$, slightly more complex to implement.

---

## Edge List

### Concept

An **edge list** is simply a collection of all edges, each stored as a pair $(u, v)$ — or triple $(u, v, w)$ for weighted graphs.

**Example:** $[(0,1), (0,2), (1,2), (2,3)]$

### Pros and Cons

**Advantages:** Simplest representation, $O(m)$ space, natural for edge-centric algorithms (e.g., Kruskal's MST).

**Disadvantages:** Edge lookup and neighbor finding both $O(m)$ — must scan entire list.

---

## Incidence Matrix

An **incidence matrix** $B$ has dimensions $n \times m$ (vertices × edges):

$$B[i][j] = \begin{cases} 1 & \text{if vertex } i \text{ is an endpoint of edge } j \\ 0 & \text{otherwise} \end{cases}$$

For directed graphs, use $-1$ for the source and $+1$ for the destination.

This is primarily used in theoretical contexts and algebraic graph theory. The $O(n \cdot m)$ space makes it impractical for programming.

---

## Comparing Representations

### Space and Time Complexity

| Operation | Adj. Matrix | Adj. List | Edge List |
|-----------|-------------|-----------|-----------|
| Check edge $(u,v)$ | $O(1)$ | $O(\deg(u))$ | $O(m)$ |
| All neighbors of $v$ | $O(n)$ | $O(\deg(v))$ | $O(m)$ |
| Add edge | $O(1)$ | $O(1)$ | $O(1)$ |
| Remove edge | $O(1)$ | $O(\deg(v))$ | $O(m)$ |
| Space | $O(n^2)$ | $O(n + m)$ | $O(m)$ |

### When to Use Which

| Scenario | Best Choice |
|----------|-------------|
| Dense graph ($m \approx n^2$) | Adjacency Matrix |
| Sparse graph ($m \ll n^2$) | Adjacency List |
| Need fast edge lookup | Adjacency Matrix |
| Need fast neighbor iteration | Adjacency List |
| Edge-centric algorithms | Edge List |
| BFS / DFS / Dijkstra's | Adjacency List |
| Floyd-Warshall | Adjacency Matrix |

**Rule of thumb:** If $m < \frac{n^2}{4}$, prefer adjacency list. Most real-world graphs are sparse, so **adjacency list is the default choice**.

---

## Code: Adjacency Matrix

```cpp
#include <iostream>
#include <vector>
using namespace std;

class GraphMatrix {
    vector<vector<int>> mat;
    int n;
    bool directed;
public:
    GraphMatrix(int n, bool dir = false) : n(n), directed(dir) {
        mat.assign(n, vector<int>(n, 0));
    }
    void addEdge(int u, int v, int w = 1) {
        mat[u][v] = w;
        if (!directed) mat[v][u] = w;
    }
    bool hasEdge(int u, int v) { return mat[u][v] != 0; }
    int degree(int v) {
        int d = 0;
        for (int j = 0; j < n; j++) if (mat[v][j]) d++;
        return d;
    }
    void display() {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) cout << mat[i][j] << " ";
            cout << "\n";
        }
    }
};

int main() {
    GraphMatrix g(5);
    g.addEdge(0,1); g.addEdge(0,2); g.addEdge(1,2);
    g.addEdge(2,3); g.addEdge(3,4);
    g.display();
    cout << "Edge(0,1): " << g.hasEdge(0,1) << ", Deg(2): " << g.degree(2) << endl;
}
```

```csharp
using System;

class GraphMatrix {
    int[,] mat;
    int n;
    bool directed;

    public GraphMatrix(int n, bool dir = false) {
        this.n = n; directed = dir;
        mat = new int[n, n];
    }
    public void AddEdge(int u, int v, int w = 1) {
        mat[u, v] = w;
        if (!directed) mat[v, u] = w;
    }
    public bool HasEdge(int u, int v) => mat[u, v] != 0;
    public int Degree(int v) {
        int d = 0;
        for (int j = 0; j < n; j++) if (mat[v, j] != 0) d++;
        return d;
    }
    public void Display() {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) Console.Write(mat[i, j] + " ");
            Console.WriteLine();
        }
    }
    static void Main() {
        var g = new GraphMatrix(5);
        g.AddEdge(0,1); g.AddEdge(0,2); g.AddEdge(1,2);
        g.AddEdge(2,3); g.AddEdge(3,4);
        g.Display();
        Console.WriteLine($"Edge(0,1): {g.HasEdge(0,1)}, Deg(2): {g.Degree(2)}");
    }
}
```

```java
public class GraphMatrix {
    private int[][] mat;
    private int n;
    private boolean directed;

    public GraphMatrix(int n, boolean directed) {
        this.n = n; this.directed = directed;
        mat = new int[n][n];
    }
    public void addEdge(int u, int v) { addEdge(u, v, 1); }
    public void addEdge(int u, int v, int w) {
        mat[u][v] = w;
        if (!directed) mat[v][u] = w;
    }
    public boolean hasEdge(int u, int v) { return mat[u][v] != 0; }
    public int degree(int v) {
        int d = 0;
        for (int j = 0; j < n; j++) if (mat[v][j] != 0) d++;
        return d;
    }
    public void display() {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) System.out.print(mat[i][j] + " ");
            System.out.println();
        }
    }
    public static void main(String[] args) {
        GraphMatrix g = new GraphMatrix(5, false);
        g.addEdge(0,1); g.addEdge(0,2); g.addEdge(1,2);
        g.addEdge(2,3); g.addEdge(3,4);
        g.display();
        System.out.println("Edge(0,1): " + g.hasEdge(0,1) + ", Deg(2): " + g.degree(2));
    }
}
```

```python
class GraphMatrix:
    def __init__(self, n, directed=False):
        self.n = n
        self.directed = directed
        self.mat = [[0] * n for _ in range(n)]

    def add_edge(self, u, v, w=1):
        self.mat[u][v] = w
        if not self.directed:
            self.mat[v][u] = w

    def has_edge(self, u, v):
        return self.mat[u][v] != 0

    def degree(self, v):
        return sum(1 for x in self.mat[v] if x != 0)

    def display(self):
        for row in self.mat:
            print(" ".join(map(str, row)))


g = GraphMatrix(5)
g.add_edge(0, 1); g.add_edge(0, 2); g.add_edge(1, 2)
g.add_edge(2, 3); g.add_edge(3, 4)
g.display()
print(f"Edge(0,1): {g.has_edge(0,1)}, Deg(2): {g.degree(2)}")
```

```javascript
class GraphMatrix {
  constructor(n, directed = false) {
    this.n = n;
    this.directed = directed;
    this.mat = Array.from({ length: n }, () => Array(n).fill(0));
  }
  addEdge(u, v, w = 1) {
    this.mat[u][v] = w;
    if (!this.directed) this.mat[v][u] = w;
  }
  hasEdge(u, v) { return this.mat[u][v] !== 0; }
  degree(v) { return this.mat[v].filter((x) => x !== 0).length; }
  display() { this.mat.forEach((row) => console.log(row.join(" "))); }
}

const g = new GraphMatrix(5);
g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(1, 2);
g.addEdge(2, 3); g.addEdge(3, 4);
g.display();
console.log(`Edge(0,1): ${g.hasEdge(0, 1)}, Deg(2): ${g.degree(2)}`);
```

---

## Code: Adjacency List

```cpp
#include <iostream>
#include <vector>
using namespace std;

class GraphList {
    vector<vector<pair<int,int>>> adj; // {neighbor, weight}
    int n;
    bool directed;
public:
    GraphList(int n, bool dir = false) : n(n), directed(dir) { adj.resize(n); }
    void addEdge(int u, int v, int w = 1) {
        adj[u].push_back({v, w});
        if (!directed) adj[v].push_back({u, w});
    }
    bool hasEdge(int u, int v) {
        for (auto& [nb, w] : adj[u]) if (nb == v) return true;
        return false;
    }
    int degree(int v) { return adj[v].size(); }
    vector<int> neighbors(int v) {
        vector<int> res;
        for (auto& [nb, w] : adj[v]) res.push_back(nb);
        return res;
    }
    void display() {
        for (int i = 0; i < n; i++) {
            cout << i << " -> ";
            for (auto& [nb, w] : adj[i]) cout << "(" << nb << ",w=" << w << ") ";
            cout << "\n";
        }
    }
};

int main() {
    GraphList g(5);
    g.addEdge(0,1); g.addEdge(0,2); g.addEdge(1,2);
    g.addEdge(2,3); g.addEdge(3,4);
    g.display();
    cout << "Edge(0,1): " << g.hasEdge(0,1) << ", Deg(2): " << g.degree(2) << endl;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class GraphList {
    List<List<(int nb, int w)>> adj;
    int n; bool directed;

    public GraphList(int n, bool dir = false) {
        this.n = n; directed = dir;
        adj = Enumerable.Range(0, n).Select(_ => new List<(int, int)>()).ToList();
    }
    public void AddEdge(int u, int v, int w = 1) {
        adj[u].Add((v, w));
        if (!directed) adj[v].Add((u, w));
    }
    public bool HasEdge(int u, int v) => adj[u].Any(e => e.nb == v);
    public int Degree(int v) => adj[v].Count;
    public List<int> Neighbors(int v) => adj[v].Select(e => e.nb).ToList();
    public void Display() {
        for (int i = 0; i < n; i++) {
            var edges = string.Join(" ", adj[i].Select(e => $"({e.nb},w={e.w})"));
            Console.WriteLine($"{i} -> {edges}");
        }
    }
    static void Main() {
        var g = new GraphList(5);
        g.AddEdge(0,1); g.AddEdge(0,2); g.AddEdge(1,2);
        g.AddEdge(2,3); g.AddEdge(3,4);
        g.Display();
        Console.WriteLine($"Edge(0,1): {g.HasEdge(0,1)}, Deg(2): {g.Degree(2)}");
        Console.WriteLine($"Neighbors of 2: {string.Join(", ", g.Neighbors(2))}");
    }
}
```

```java
import java.util.*;

public class GraphList {
    private List<List<int[]>> adj; // int[]{neighbor, weight}
    private int n;
    private boolean directed;

    public GraphList(int n, boolean directed) {
        this.n = n; this.directed = directed;
        adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    }
    public void addEdge(int u, int v) { addEdge(u, v, 1); }
    public void addEdge(int u, int v, int w) {
        adj.get(u).add(new int[]{v, w});
        if (!directed) adj.get(v).add(new int[]{u, w});
    }
    public boolean hasEdge(int u, int v) {
        return adj.get(u).stream().anyMatch(e -> e[0] == v);
    }
    public int degree(int v) { return adj.get(v).size(); }
    public void display() {
        for (int i = 0; i < n; i++) {
            System.out.print(i + " -> ");
            for (int[] e : adj.get(i)) System.out.print("(" + e[0] + ",w=" + e[1] + ") ");
            System.out.println();
        }
    }
    public static void main(String[] args) {
        GraphList g = new GraphList(5, false);
        g.addEdge(0,1); g.addEdge(0,2); g.addEdge(1,2);
        g.addEdge(2,3); g.addEdge(3,4);
        g.display();
        System.out.println("Edge(0,1): " + g.hasEdge(0,1) + ", Deg(2): " + g.degree(2));
    }
}
```

```python
from collections import defaultdict


class GraphList:
    def __init__(self, n, directed=False):
        self.n = n
        self.directed = directed
        self.adj = defaultdict(list)  # vertex -> [(neighbor, weight)]

    def add_edge(self, u, v, w=1):
        self.adj[u].append((v, w))
        if not self.directed:
            self.adj[v].append((u, w))

    def has_edge(self, u, v):
        return any(nb == v for nb, _ in self.adj[u])

    def degree(self, v):
        return len(self.adj[v])

    def neighbors(self, v):
        return [nb for nb, _ in self.adj[v]]

    def display(self):
        for i in range(self.n):
            edges = " ".join(f"({nb},w={w})" for nb, w in self.adj[i])
            print(f"{i} -> {edges}")


g = GraphList(5)
g.add_edge(0, 1); g.add_edge(0, 2); g.add_edge(1, 2)
g.add_edge(2, 3); g.add_edge(3, 4)
g.display()
print(f"Edge(0,1): {g.has_edge(0,1)}, Deg(2): {g.degree(2)}")
print(f"Neighbors of 2: {g.neighbors(2)}")
```

```javascript
class GraphList {
  constructor(n, directed = false) {
    this.n = n;
    this.directed = directed;
    this.adj = Array.from({ length: n }, () => []);
  }
  addEdge(u, v, w = 1) {
    this.adj[u].push({ nb: v, w });
    if (!this.directed) this.adj[v].push({ nb: u, w });
  }
  hasEdge(u, v) { return this.adj[u].some((e) => e.nb === v); }
  degree(v) { return this.adj[v].length; }
  neighbors(v) { return this.adj[v].map((e) => e.nb); }
  display() {
    for (let i = 0; i < this.n; i++) {
      const edges = this.adj[i].map((e) => `(${e.nb},w=${e.w})`).join(" ");
      console.log(`${i} -> ${edges}`);
    }
  }
}

const g = new GraphList(5);
g.addEdge(0, 1); g.addEdge(0, 2); g.addEdge(1, 2);
g.addEdge(2, 3); g.addEdge(3, 4);
g.display();
console.log(`Edge(0,1): ${g.hasEdge(0, 1)}, Deg(2): ${g.degree(2)}`);
console.log(`Neighbors of 2: ${g.neighbors(2)}`);
```

---

## Key Takeaways

1. The **adjacency matrix** uses a 2D array where $A[i][j] = 1$ if edge $(i,j)$ exists. It provides $O(1)$ edge lookup but requires $O(n^2)$ space.

2. The **adjacency list** stores neighbors per vertex, using $O(n + m)$ space — the go-to choice for most graph algorithms.

3. The **edge list** stores edges as pairs, ideal for edge-centric algorithms like Kruskal's MST.

4. The **incidence matrix** maps vertices to edges; used mainly in theory.

5. **Dense graphs** favor adjacency matrices; **sparse graphs** (most real-world graphs) favor adjacency lists.

6. For BFS, DFS, Dijkstra's — use adjacency list. For Floyd-Warshall or small dense graphs — use adjacency matrix.

7. Always consider scale: a 10,000-node matrix uses ~400 MB; the same sparse graph's adjacency list uses under 1 MB.

8. Understanding representations is fundamental — every graph algorithm's efficiency depends on the underlying data structure.
