---
title: Graph Representations
---

# Graph Representations

To work with graphs in code, we need a way to store vertices and edges in memory. The three main representations are: **adjacency matrix**, **adjacency list**, and **edge list**. Each has trade-offs in space, speed, and convenience.

---

## The Graph We'll Represent

```
Undirected graph with 5 vertices and 6 edges:

    0 --- 1
    |   / |
    |  /  |
    | /   |
    2 --- 3
         |
         4

Vertices: {0, 1, 2, 3, 4}
Edges: {(0,1), (0,2), (1,2), (1,3), (2,3), (3,4)}
```

---

## 1. Adjacency Matrix

A 2D array of size **V × V** where `matrix[i][j] = 1` if there's an edge from vertex i to vertex j, and `0` otherwise.

```
     0  1  2  3  4
  0 [0, 1, 1, 0, 0]
  1 [1, 0, 1, 1, 0]
  2 [1, 1, 0, 1, 0]
  3 [0, 1, 1, 0, 1]
  4 [0, 0, 0, 1, 0]
```

For **undirected** graphs, the matrix is symmetric: `matrix[i][j] == matrix[j][i]`.

For **weighted** graphs, store the weight instead of 1, and use 0 or ∞ for no edge.

### Pros
- O(1) edge lookup: "Is there an edge between u and v?"
- Simple to implement

### Cons
- O(V²) space — wasteful for sparse graphs
- O(V) to find all neighbors of a vertex
- O(V²) to iterate all edges

---

## 2. Adjacency List

An array of lists. For each vertex i, `adj[i]` stores the list of vertices connected to i.

```
0 → [1, 2]
1 → [0, 2, 3]
2 → [0, 1, 3]
3 → [1, 2, 4]
4 → [3]
```

For **weighted** graphs, store pairs `(neighbor, weight)` instead of just the neighbor.

### Pros
- O(V + E) space — efficient for sparse graphs
- O(degree(v)) to find all neighbors
- Most algorithms use adjacency lists

### Cons
- O(degree(v)) edge lookup (not O(1))
- Slightly more complex than a matrix

---

## 3. Edge List

Simply a list of all edges as pairs (or triples for weighted graphs).

```
Edges: [(0,1), (0,2), (1,2), (1,3), (2,3), (3,4)]
```

For weighted: `[(0,1,5), (0,2,3), ...]` where the third value is the weight.

### Pros
- O(E) space — minimal
- Simple to store and iterate all edges
- Good for algorithms like Kruskal's MST

### Cons
- O(E) to check if a specific edge exists
- O(E) to find all neighbors of a vertex
- Rarely used alone for traversal algorithms

---

## Comparison Table

| Operation | Adjacency Matrix | Adjacency List | Edge List |
|-----------|-----------------|----------------|-----------|
| **Space** | O(V²) | O(V + E) | O(E) |
| **Add Edge** | O(1) | O(1) | O(1) |
| **Remove Edge** | O(1) | O(degree) | O(E) |
| **Check Edge (u,v)** | O(1) | O(degree(u)) | O(E) |
| **All Neighbors of v** | O(V) | O(degree(v)) | O(E) |
| **Iterate All Edges** | O(V²) | O(V + E) | O(E) |
| **Best For** | Dense graphs, quick lookups | Most algorithms (BFS, DFS, Dijkstra) | Edge-centric algorithms (Kruskal) |

---

## When to Use What?

```
┌────────────────────────────────────────────────┐
│ Sparse graph (E << V²)?  → Adjacency List     │
│ Dense graph (E ≈ V²)?    → Adjacency Matrix   │
│ Need O(1) edge lookup?   → Adjacency Matrix   │
│ BFS / DFS / Dijkstra?    → Adjacency List     │
│ Kruskal's MST?           → Edge List          │
│ Memory constrained?      → Adjacency List     │
└────────────────────────────────────────────────┘
```

---

## Full Implementation — All Three Representations

### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

// ============ ADJACENCY MATRIX ============
class GraphMatrix {
    int n;
    vector<vector<int>> matrix;

public:
    GraphMatrix(int vertices) : n(vertices), matrix(vertices, vector<int>(vertices, 0)) {}

    void addEdge(int u, int v, int weight = 1) {
        matrix[u][v] = weight;
        matrix[v][u] = weight; // remove for directed
    }

    bool hasEdge(int u, int v) {
        return matrix[u][v] != 0;
    }

    vector<int> neighbors(int v) {
        vector<int> result;
        for (int i = 0; i < n; i++) {
            if (matrix[v][i] != 0) result.push_back(i);
        }
        return result;
    }

    void print() {
        cout << "Adjacency Matrix:" << endl;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                cout << matrix[i][j] << " ";
            }
            cout << endl;
        }
    }
};

// ============ ADJACENCY LIST ============
class GraphList {
    int n;
    vector<vector<pair<int, int>>> adj; // {neighbor, weight}

public:
    GraphList(int vertices) : n(vertices), adj(vertices) {}

    void addEdge(int u, int v, int weight = 1) {
        adj[u].push_back({v, weight});
        adj[v].push_back({u, weight}); // remove for directed
    }

    bool hasEdge(int u, int v) {
        for (auto& [neighbor, w] : adj[u]) {
            if (neighbor == v) return true;
        }
        return false;
    }

    vector<pair<int, int>> neighbors(int v) {
        return adj[v];
    }

    void print() {
        cout << "Adjacency List:" << endl;
        for (int i = 0; i < n; i++) {
            cout << i << " → ";
            for (auto& [neighbor, weight] : adj[i]) {
                cout << "(" << neighbor << ", w=" << weight << ") ";
            }
            cout << endl;
        }
    }
};

// ============ EDGE LIST ============
class GraphEdgeList {
    int n;
    vector<tuple<int, int, int>> edges; // {u, v, weight}

public:
    GraphEdgeList(int vertices) : n(vertices) {}

    void addEdge(int u, int v, int weight = 1) {
        edges.push_back({u, v, weight});
    }

    bool hasEdge(int u, int v) {
        for (auto& [a, b, w] : edges) {
            if ((a == u && b == v) || (a == v && b == u)) return true;
        }
        return false;
    }

    void print() {
        cout << "Edge List:" << endl;
        for (auto& [u, v, w] : edges) {
            cout << "(" << u << ", " << v << ", w=" << w << ")" << endl;
        }
    }
};

int main() {
    // Build the same graph with all three representations
    GraphMatrix gm(5);
    GraphList gl(5);
    GraphEdgeList ge(5);

    vector<pair<int, int>> edges = {{0,1}, {0,2}, {1,2}, {1,3}, {2,3}, {3,4}};

    for (auto& [u, v] : edges) {
        gm.addEdge(u, v);
        gl.addEdge(u, v);
        ge.addEdge(u, v);
    }

    gm.print();
    cout << endl;
    gl.print();
    cout << endl;
    ge.print();

    cout << "\nEdge (1,3) exists? " << (gm.hasEdge(1, 3) ? "Yes" : "No") << endl;
    cout << "Edge (0,4) exists? " << (gm.hasEdge(0, 4) ? "Yes" : "No") << endl;

    return 0;
}
```

### Java

```java
import java.util.*;

public class GraphRepresentations {

    // ============ ADJACENCY MATRIX ============
    static class GraphMatrix {
        int n;
        int[][] matrix;

        GraphMatrix(int vertices) {
            n = vertices;
            matrix = new int[n][n];
        }

        void addEdge(int u, int v, int weight) {
            matrix[u][v] = weight;
            matrix[v][u] = weight; // remove for directed
        }

        void addEdge(int u, int v) { addEdge(u, v, 1); }

        boolean hasEdge(int u, int v) {
            return matrix[u][v] != 0;
        }

        List<Integer> neighbors(int v) {
            List<Integer> result = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if (matrix[v][i] != 0) result.add(i);
            }
            return result;
        }

        void print() {
            System.out.println("Adjacency Matrix:");
            for (int i = 0; i < n; i++) {
                System.out.println(Arrays.toString(matrix[i]));
            }
        }
    }

    // ============ ADJACENCY LIST ============
    static class GraphList {
        int n;
        List<List<int[]>> adj; // each entry: {neighbor, weight}

        GraphList(int vertices) {
            n = vertices;
            adj = new ArrayList<>();
            for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        }

        void addEdge(int u, int v, int weight) {
            adj.get(u).add(new int[]{v, weight});
            adj.get(v).add(new int[]{u, weight}); // remove for directed
        }

        void addEdge(int u, int v) { addEdge(u, v, 1); }

        boolean hasEdge(int u, int v) {
            for (int[] edge : adj.get(u)) {
                if (edge[0] == v) return true;
            }
            return false;
        }

        List<int[]> neighbors(int v) {
            return adj.get(v);
        }

        void print() {
            System.out.println("Adjacency List:");
            for (int i = 0; i < n; i++) {
                System.out.print(i + " → ");
                for (int[] edge : adj.get(i)) {
                    System.out.print("(" + edge[0] + ", w=" + edge[1] + ") ");
                }
                System.out.println();
            }
        }
    }

    // ============ EDGE LIST ============
    static class GraphEdgeList {
        int n;
        List<int[]> edges; // each entry: {u, v, weight}

        GraphEdgeList(int vertices) {
            n = vertices;
            edges = new ArrayList<>();
        }

        void addEdge(int u, int v, int weight) {
            edges.add(new int[]{u, v, weight});
        }

        void addEdge(int u, int v) { addEdge(u, v, 1); }

        boolean hasEdge(int u, int v) {
            for (int[] e : edges) {
                if ((e[0] == u && e[1] == v) || (e[0] == v && e[1] == u)) return true;
            }
            return false;
        }

        void print() {
            System.out.println("Edge List:");
            for (int[] e : edges) {
                System.out.println("(" + e[0] + ", " + e[1] + ", w=" + e[2] + ")");
            }
        }
    }

    public static void main(String[] args) {
        GraphMatrix gm = new GraphMatrix(5);
        GraphList gl = new GraphList(5);
        GraphEdgeList ge = new GraphEdgeList(5);

        int[][] edges = {{0,1}, {0,2}, {1,2}, {1,3}, {2,3}, {3,4}};

        for (int[] e : edges) {
            gm.addEdge(e[0], e[1]);
            gl.addEdge(e[0], e[1]);
            ge.addEdge(e[0], e[1]);
        }

        gm.print();
        System.out.println();
        gl.print();
        System.out.println();
        ge.print();

        System.out.println("\nEdge (1,3) exists? " + gm.hasEdge(1, 3));
        System.out.println("Edge (0,4) exists? " + gm.hasEdge(0, 4));
    }
}
```

### Python

```python
class GraphMatrix:
    """Graph using adjacency matrix."""

    def __init__(self, vertices):
        self.n = vertices
        self.matrix = [[0] * vertices for _ in range(vertices)]

    def add_edge(self, u, v, weight=1):
        self.matrix[u][v] = weight
        self.matrix[v][u] = weight  # remove for directed

    def has_edge(self, u, v):
        return self.matrix[u][v] != 0

    def neighbors(self, v):
        return [i for i in range(self.n) if self.matrix[v][i] != 0]

    def print_graph(self):
        print("Adjacency Matrix:")
        for row in self.matrix:
            print(row)


class GraphList:
    """Graph using adjacency list."""

    def __init__(self, vertices):
        self.n = vertices
        self.adj = [[] for _ in range(vertices)]

    def add_edge(self, u, v, weight=1):
        self.adj[u].append((v, weight))
        self.adj[v].append((u, weight))  # remove for directed

    def has_edge(self, u, v):
        return any(neighbor == v for neighbor, _ in self.adj[u])

    def neighbors(self, v):
        return self.adj[v]

    def print_graph(self):
        print("Adjacency List:")
        for i in range(self.n):
            print(f"{i} → {self.adj[i]}")


class GraphEdgeList:
    """Graph using edge list."""

    def __init__(self, vertices):
        self.n = vertices
        self.edges = []

    def add_edge(self, u, v, weight=1):
        self.edges.append((u, v, weight))

    def has_edge(self, u, v):
        return any(
            (a == u and b == v) or (a == v and b == u)
            for a, b, _ in self.edges
        )

    def print_graph(self):
        print("Edge List:")
        for u, v, w in self.edges:
            print(f"({u}, {v}, w={w})")


# Build the same graph with all three representations
edges = [(0, 1), (0, 2), (1, 2), (1, 3), (2, 3), (3, 4)]

gm = GraphMatrix(5)
gl = GraphList(5)
ge = GraphEdgeList(5)

for u, v in edges:
    gm.add_edge(u, v)
    gl.add_edge(u, v)
    ge.add_edge(u, v)

gm.print_graph()
print()
gl.print_graph()
print()
ge.print_graph()

print(f"\nEdge (1,3) exists? {gm.has_edge(1, 3)}")
print(f"Edge (0,4) exists? {gm.has_edge(0, 4)}")
```

### JavaScript

```javascript
// ============ ADJACENCY MATRIX ============
class GraphMatrix {
  constructor(vertices) {
    this.n = vertices;
    this.matrix = Array.from({ length: vertices }, () =>
      new Array(vertices).fill(0)
    );
  }

  addEdge(u, v, weight = 1) {
    this.matrix[u][v] = weight;
    this.matrix[v][u] = weight; // remove for directed
  }

  hasEdge(u, v) {
    return this.matrix[u][v] !== 0;
  }

  neighbors(v) {
    const result = [];
    for (let i = 0; i < this.n; i++) {
      if (this.matrix[v][i] !== 0) result.push(i);
    }
    return result;
  }

  print() {
    console.log("Adjacency Matrix:");
    for (const row of this.matrix) {
      console.log(row.join(" "));
    }
  }
}

// ============ ADJACENCY LIST ============
class GraphList {
  constructor(vertices) {
    this.n = vertices;
    this.adj = Array.from({ length: vertices }, () => []);
  }

  addEdge(u, v, weight = 1) {
    this.adj[u].push([v, weight]);
    this.adj[v].push([u, weight]); // remove for directed
  }

  hasEdge(u, v) {
    return this.adj[u].some(([neighbor]) => neighbor === v);
  }

  neighbors(v) {
    return this.adj[v];
  }

  print() {
    console.log("Adjacency List:");
    for (let i = 0; i < this.n; i++) {
      const edges = this.adj[i].map(([n, w]) => `(${n}, w=${w})`).join(" ");
      console.log(`${i} → ${edges}`);
    }
  }
}

// ============ EDGE LIST ============
class GraphEdgeList {
  constructor(vertices) {
    this.n = vertices;
    this.edges = [];
  }

  addEdge(u, v, weight = 1) {
    this.edges.push([u, v, weight]);
  }

  hasEdge(u, v) {
    return this.edges.some(
      ([a, b]) => (a === u && b === v) || (a === v && b === u)
    );
  }

  print() {
    console.log("Edge List:");
    for (const [u, v, w] of this.edges) {
      console.log(`(${u}, ${v}, w=${w})`);
    }
  }
}

// Build the same graph with all three representations
const edges = [[0,1], [0,2], [1,2], [1,3], [2,3], [3,4]];

const gm = new GraphMatrix(5);
const gl = new GraphList(5);
const ge = new GraphEdgeList(5);

for (const [u, v] of edges) {
  gm.addEdge(u, v);
  gl.addEdge(u, v);
  ge.addEdge(u, v);
}

gm.print();
console.log();
gl.print();
console.log();
ge.print();

console.log(`\nEdge (1,3) exists? ${gm.hasEdge(1, 3)}`);
console.log(`Edge (0,4) exists? ${gm.hasEdge(0, 4)}`);
```

---

## Sample Output (All Representations)

```
Adjacency Matrix:
0 1 1 0 0
1 0 1 1 0
1 1 0 1 0
0 1 1 0 1
0 0 0 1 0

Adjacency List:
0 → (1, w=1) (2, w=1)
1 → (0, w=1) (2, w=1) (3, w=1)
2 → (0, w=1) (1, w=1) (3, w=1)
3 → (1, w=1) (2, w=1) (4, w=1)
4 → (3, w=1)

Edge List:
(0, 1, w=1)
(0, 2, w=1)
(1, 2, w=1)
(1, 3, w=1)
(2, 3, w=1)
(3, 4, w=1)

Edge (1,3) exists? Yes
Edge (0,4) exists? No
```

---

## Directed & Weighted Example

For a **directed, weighted** graph, simply don't add the reverse edge and store weights:

```
    0 --5→ 1 --3→ 2
    |             ↑
    +-----7-------+
```

In adjacency list: `adj[0] = [(1, 5), (2, 7)]`, `adj[1] = [(2, 3)]`, `adj[2] = []`

---

## Key Takeaways

1. **Adjacency Matrix** — best for dense graphs and O(1) edge checks.
2. **Adjacency List** — best for most algorithms; efficient for sparse graphs.
3. **Edge List** — best for edge-centric algorithms like Kruskal's.
4. Most competitive programming and real-world code uses **adjacency lists**.
5. For weighted graphs, store `(neighbor, weight)` pairs in the list.

---

Next: **Breadth-First Search →**
