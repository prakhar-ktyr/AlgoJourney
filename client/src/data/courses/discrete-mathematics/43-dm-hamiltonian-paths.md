---
title: Hamiltonian Paths & Circuits
---

# Hamiltonian Paths & Circuits

While Euler paths ask "can we traverse every **edge** exactly once?", Hamiltonian paths ask the complementary question: "can we visit every **vertex** exactly once?" Despite their similar phrasing, Hamiltonian problems are fundamentally harder — there is no simple characterisation like the degree-parity condition for Euler paths.

---

## 1. Definitions

### 1.1 Hamiltonian Path

A **Hamiltonian path** is a path in a graph that visits **every vertex exactly once**.

- It traverses $n - 1$ edges (for $n$ vertices).
- Not every edge needs to be used.
- Start and end vertices are distinct.

### 1.2 Hamiltonian Cycle (Circuit)

A **Hamiltonian cycle** is a cycle that visits every vertex exactly once and returns to the starting vertex.

- It traverses exactly $n$ edges.
- Every vertex has degree exactly 2 within the cycle.

### 1.3 Hamiltonian Graph

A graph is called **Hamiltonian** if it contains a Hamiltonian cycle.

---

## 2. Euler vs Hamiltonian — Key Differences

| | Euler Path/Circuit | Hamiltonian Path/Cycle |
|---|---|---|
| **Covers** | Every **edge** exactly once | Every **vertex** exactly once |
| **Existence check** | Simple (degree conditions) | **No known efficient test** |
| **Complexity** | Polynomial — $O(|V| + |E|)$ | **NP-complete** |
| **Algorithm** | Hierholzer's (efficient) | Backtracking / DP (exponential) |

This distinction is one of the most important in computational complexity theory.

---

## 3. Complexity: Why Hamiltonian Problems Are Hard

### 3.1 NP-Completeness

Determining whether a graph has a Hamiltonian path or cycle is **NP-complete**. This means:

- No polynomial-time algorithm is known.
- It is at least as hard as every other problem in NP.
- A brute-force approach checks all $n!$ permutations of vertices.

### 3.2 Implications

- There is no simple necessary-and-sufficient condition (unlike the even-degree condition for Euler circuits).
- We rely on **sufficient conditions** (which guarantee existence but are not necessary) and **heuristic/backtracking** algorithms.

---

## 4. Sufficient Conditions

While no simple characterisation exists, several theorems provide **sufficient** conditions — if satisfied, a Hamiltonian cycle is guaranteed to exist.

### 4.1 Dirac's Theorem (1952)

**Theorem:** If $G$ is a simple graph with $n \geq 3$ vertices and every vertex satisfies:

$$
\deg(v) \geq \frac{n}{2}
$$

then $G$ has a Hamiltonian cycle.

**Intuition:** If every vertex is connected to at least half the graph, the graph is "dense enough" that you can always extend a partial path.

### 4.2 Ore's Theorem (1960)

**Theorem:** If $G$ is a simple graph with $n \geq 3$ vertices and for every pair of **non-adjacent** vertices $u, v$:

$$
\deg(u) + \deg(v) \geq n
$$

then $G$ has a Hamiltonian cycle.

> Note: Dirac's theorem is a special case of Ore's theorem (if every degree $\geq n/2$, then any pair sums to $\geq n$).

### 4.3 Other Sufficient Conditions

- **Complete graphs** $K_n$ ($n \geq 3$) always have Hamiltonian cycles.
- **Closure theorem (Bondy–Chvátal):** Repeatedly add edges between non-adjacent vertices whose degrees sum to $\geq n$. The original graph is Hamiltonian iff the closure is.

### 4.4 Necessary Condition

A simple **necessary** (but not sufficient) condition:

> If removing any $k$ vertices from $G$ produces more than $k$ connected components, then $G$ is **not** Hamiltonian.

---

## 5. The Traveling Salesman Problem (TSP)

### 5.1 Problem Statement

Given $n$ cities and the distances between each pair, find the **shortest Hamiltonian cycle** — visit every city exactly once and return to the start, minimising total distance.

### 5.2 Connection to Hamiltonian Cycles

TSP is the **optimisation version** of the Hamiltonian cycle problem:

- Deciding if a Hamiltonian cycle exists = NP-complete.
- Finding the minimum-weight Hamiltonian cycle = NP-hard.

### 5.3 Approaches to TSP

| Approach | Time Complexity | Notes |
|----------|----------------|-------|
| Brute force | $O(n!)$ | Try all permutations |
| Dynamic programming (Held-Karp) | $O(n^2 \cdot 2^n)$ | Optimal for small $n$ |
| Branch and bound | Varies | Prunes search tree |
| Approximation (e.g., Christofides) | Polynomial | 1.5x optimal for metric TSP |
| Heuristics (nearest neighbour, 2-opt) | Polynomial | No optimality guarantee |

---

## 6. Backtracking Algorithm for Hamiltonian Path

The backtracking approach systematically tries to build a path vertex by vertex:

1. Start at a vertex; mark it visited.
2. Try to extend the path to an unvisited neighbour.
3. If the path includes all $n$ vertices → success.
4. If no unvisited neighbour can extend the path → backtrack (unmark current vertex, try next option).

### 6.1 Time Complexity

Worst case: $O(n!)$ — we may explore all permutations. In practice, pruning helps significantly for sparse graphs.

### 6.2 Optimisations

- **Degree-based pruning:** Skip vertices that would isolate unvisited portions.
- **Warnsdorff's rule** (for knight's tour): prefer vertices with fewer unvisited neighbours.
- **Early termination:** If the remaining unvisited vertices form disconnected components, backtrack immediately.

---

## 7. Code Implementations

### 7.1 Brute-Force Hamiltonian Path Finder

```cpp
#include <iostream>
#include <vector>
using namespace std;

class HamiltonianSolver {
    int n;
    vector<vector<int>> adj;
    vector<int> path;
    vector<bool> visited;

    bool solve(int pos) {
        if (pos == n) {
            return true;  // All vertices visited
        }

        for (int v = 0; v < n; v++) {
            if (!visited[v] && adj[path[pos - 1]][v]) {
                visited[v] = true;
                path[pos] = v;

                if (solve(pos + 1)) return true;

                // Backtrack
                visited[v] = false;
                path[pos] = -1;
            }
        }
        return false;
    }

public:
    HamiltonianSolver(int vertices, vector<vector<int>>& adjacency)
        : n(vertices), adj(adjacency), path(vertices, -1), visited(vertices, false) {}

    vector<int> findHamiltonianPath(int start) {
        path[0] = start;
        visited[start] = true;

        if (solve(1)) {
            return path;
        }
        return {};  // No Hamiltonian path found
    }

    bool hasHamiltonianCycle(int start) {
        path[0] = start;
        visited[start] = true;

        if (solve(1)) {
            // Check if last vertex connects back to start
            return adj[path[n - 1]][start];
        }
        return false;
    }
};

int main() {
    int n = 5;
    // Adjacency matrix
    vector<vector<int>> adj = {
        {0, 1, 0, 1, 0},
        {1, 0, 1, 1, 1},
        {0, 1, 0, 0, 1},
        {1, 1, 0, 0, 1},
        {0, 1, 1, 1, 0}
    };

    HamiltonianSolver solver(n, adj);

    vector<int> path = solver.findHamiltonianPath(0);
    if (!path.empty()) {
        cout << "Hamiltonian path: ";
        for (int v : path) cout << v << " ";
        cout << endl;
    } else {
        cout << "No Hamiltonian path exists from vertex 0" << endl;
    }

    if (solver.hasHamiltonianCycle(0)) {
        cout << "Hamiltonian cycle exists!" << endl;
    } else {
        cout << "No Hamiltonian cycle exists" << endl;
    }

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class HamiltonianSolver {
    private int n;
    private int[,] adj;
    private int[] path;
    private bool[] visited;

    public HamiltonianSolver(int vertices, int[,] adjacency) {
        n = vertices;
        adj = adjacency;
        path = new int[n];
        visited = new bool[n];
        Array.Fill(path, -1);
    }

    private bool Solve(int pos) {
        if (pos == n) return true;

        for (int v = 0; v < n; v++) {
            if (!visited[v] && adj[path[pos - 1], v] == 1) {
                visited[v] = true;
                path[pos] = v;

                if (Solve(pos + 1)) return true;

                // Backtrack
                visited[v] = false;
                path[pos] = -1;
            }
        }
        return false;
    }

    public int[] FindHamiltonianPath(int start) {
        Array.Fill(path, -1);
        Array.Fill(visited, false);
        path[0] = start;
        visited[start] = true;

        if (Solve(1)) return path;
        return null;
    }

    public bool HasHamiltonianCycle(int start) {
        Array.Fill(path, -1);
        Array.Fill(visited, false);
        path[0] = start;
        visited[start] = true;

        if (Solve(1)) {
            return adj[path[n - 1], start] == 1;
        }
        return false;
    }

    static void Main() {
        int n = 5;
        int[,] adj = {
            {0, 1, 0, 1, 0},
            {1, 0, 1, 1, 1},
            {0, 1, 0, 0, 1},
            {1, 1, 0, 0, 1},
            {0, 1, 1, 1, 0}
        };

        var solver = new HamiltonianSolver(n, adj);

        int[] path = solver.FindHamiltonianPath(0);
        if (path != null) {
            Console.WriteLine("Hamiltonian path: " + string.Join(" ", path));
        } else {
            Console.WriteLine("No Hamiltonian path exists from vertex 0");
        }

        if (solver.HasHamiltonianCycle(0)) {
            Console.WriteLine("Hamiltonian cycle exists!");
        } else {
            Console.WriteLine("No Hamiltonian cycle exists");
        }
    }
}
```

```java
import java.util.*;

public class HamiltonianSolver {
    private int n;
    private int[][] adj;
    private int[] path;
    private boolean[] visited;

    public HamiltonianSolver(int vertices, int[][] adjacency) {
        n = vertices;
        adj = adjacency;
        path = new int[n];
        visited = new boolean[n];
        Arrays.fill(path, -1);
    }

    private boolean solve(int pos) {
        if (pos == n) return true;

        for (int v = 0; v < n; v++) {
            if (!visited[v] && adj[path[pos - 1]][v] == 1) {
                visited[v] = true;
                path[pos] = v;

                if (solve(pos + 1)) return true;

                // Backtrack
                visited[v] = false;
                path[pos] = -1;
            }
        }
        return false;
    }

    public int[] findHamiltonianPath(int start) {
        Arrays.fill(path, -1);
        Arrays.fill(visited, false);
        path[0] = start;
        visited[start] = true;

        if (solve(1)) return path.clone();
        return null;
    }

    public boolean hasHamiltonianCycle(int start) {
        Arrays.fill(path, -1);
        Arrays.fill(visited, false);
        path[0] = start;
        visited[start] = true;

        if (solve(1)) {
            return adj[path[n - 1]][start] == 1;
        }
        return false;
    }

    public static void main(String[] args) {
        int n = 5;
        int[][] adj = {
            {0, 1, 0, 1, 0},
            {1, 0, 1, 1, 1},
            {0, 1, 0, 0, 1},
            {1, 1, 0, 0, 1},
            {0, 1, 1, 1, 0}
        };

        HamiltonianSolver solver = new HamiltonianSolver(n, adj);

        int[] path = solver.findHamiltonianPath(0);
        if (path != null) {
            System.out.print("Hamiltonian path: ");
            for (int v : path) System.out.print(v + " ");
            System.out.println();
        } else {
            System.out.println("No Hamiltonian path exists from vertex 0");
        }

        if (solver.hasHamiltonianCycle(0)) {
            System.out.println("Hamiltonian cycle exists!");
        } else {
            System.out.println("No Hamiltonian cycle exists");
        }
    }
}
```

```python
def find_hamiltonian_path(n, adj, start=0):
    """
    Find a Hamiltonian path using backtracking.
    adj: adjacency matrix (n x n), adj[i][j] = 1 if edge exists.
    Returns the path as a list of vertices, or None if not found.
    """
    path = [start]
    visited = [False] * n
    visited[start] = True

    def backtrack():
        if len(path) == n:
            return True

        current = path[-1]
        for v in range(n):
            if not visited[v] and adj[current][v] == 1:
                visited[v] = True
                path.append(v)

                if backtrack():
                    return True

                # Backtrack
                path.pop()
                visited[v] = False

        return False

    if backtrack():
        return path
    return None


def has_hamiltonian_cycle(n, adj, start=0):
    """Check if a Hamiltonian cycle exists starting from 'start'."""
    path = find_hamiltonian_path(n, adj, start)
    if path and adj[path[-1]][start] == 1:
        return True, path + [start]
    return False, None


# Example
n = 5
adj = [
    [0, 1, 0, 1, 0],
    [1, 0, 1, 1, 1],
    [0, 1, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [0, 1, 1, 1, 0]
]

path = find_hamiltonian_path(n, adj, 0)
if path:
    print("Hamiltonian path:", " -> ".join(map(str, path)))
else:
    print("No Hamiltonian path exists from vertex 0")

has_cycle, cycle = has_hamiltonian_cycle(n, adj, 0)
if has_cycle:
    print("Hamiltonian cycle:", " -> ".join(map(str, cycle)))
else:
    print("No Hamiltonian cycle exists")
```

```javascript
function findHamiltonianPath(n, adj, start = 0) {
  // Find a Hamiltonian path using backtracking
  // adj: adjacency matrix (n x n)
  const path = [start];
  const visited = new Array(n).fill(false);
  visited[start] = true;

  function backtrack() {
    if (path.length === n) return true;

    const current = path[path.length - 1];
    for (let v = 0; v < n; v++) {
      if (!visited[v] && adj[current][v] === 1) {
        visited[v] = true;
        path.push(v);

        if (backtrack()) return true;

        // Backtrack
        path.pop();
        visited[v] = false;
      }
    }
    return false;
  }

  if (backtrack()) return path;
  return null;
}

function hasHamiltonianCycle(n, adj, start = 0) {
  const path = findHamiltonianPath(n, adj, start);
  if (path && adj[path[path.length - 1]][start] === 1) {
    return { exists: true, cycle: [...path, start] };
  }
  return { exists: false, cycle: null };
}

// Example
const n = 5;
const adj = [
  [0, 1, 0, 1, 0],
  [1, 0, 1, 1, 1],
  [0, 1, 0, 0, 1],
  [1, 1, 0, 0, 1],
  [0, 1, 1, 1, 0]
];

const path = findHamiltonianPath(n, adj, 0);
if (path) {
  console.log("Hamiltonian path:", path.join(" -> "));
} else {
  console.log("No Hamiltonian path exists from vertex 0");
}

const { exists, cycle } = hasHamiltonianCycle(n, adj, 0);
if (exists) {
  console.log("Hamiltonian cycle:", cycle.join(" -> "));
} else {
  console.log("No Hamiltonian cycle exists");
}
```

---

## 8. Classic Examples

### 8.1 Knight's Tour

A knight on an $n \times n$ chessboard must visit every square exactly once. This is a Hamiltonian path problem on the graph where vertices are squares and edges connect squares a knight's move apart.

- For $n \geq 5$, solutions exist.
- Warnsdorff's heuristic efficiently finds tours in practice.

### 8.2 Dodecahedron

The dodecahedron graph (20 vertices, each of degree 3) is Hamiltonian — a Hamiltonian cycle exists. In fact, this was one of the first recreational puzzles involving Hamiltonian cycles (Hamilton's "Icosian Game," 1857).

### 8.3 Petersen Graph

The Petersen graph (10 vertices, 3-regular) is **not** Hamiltonian — no Hamiltonian cycle exists, though Hamiltonian paths do exist.

---

## 9. Comparing Sufficient Conditions — Example

Consider $K_5$ (complete graph on 5 vertices): every vertex has degree 4.

- **Dirac's theorem:** $\deg(v) = 4 \geq 5/2 = 2.5$ ✓ → Hamiltonian cycle guaranteed.
- **Ore's theorem:** For any non-adjacent pair... but in $K_5$ all pairs are adjacent, so the condition is vacuously true ✓.

Now consider a cycle graph $C_5$: every vertex has degree 2.

- **Dirac's theorem:** $\deg(v) = 2 < 5/2 = 2.5$ ✗ → theorem does not apply.
- But $C_5$ **is** Hamiltonian (the cycle itself is a Hamiltonian cycle).

This illustrates that Dirac's/Ore's conditions are **sufficient but not necessary**.

---

## 10. Key Takeaways

1. A **Hamiltonian path** visits every **vertex** exactly once; a **Hamiltonian cycle** returns to the start.
2. Unlike Euler paths, there is **no simple necessary-and-sufficient** condition for Hamiltonian paths — the problem is **NP-complete**.
3. **Dirac's theorem**: $\deg(v) \geq n/2$ for all $v$ guarantees a Hamiltonian cycle. **Ore's theorem**: $\deg(u) + \deg(v) \geq n$ for all non-adjacent pairs guarantees the same.
4. The **Traveling Salesman Problem** is the optimisation version — find the shortest Hamiltonian cycle.
5. **Backtracking** is the standard algorithmic approach: try to extend a partial path, backtrack when stuck. Worst case: $O(n!)$.
6. The contrast between Euler (polynomial, neat conditions) and Hamilton (NP-complete, no neat conditions) is a landmark result in complexity theory.
7. Practical approaches for large instances include dynamic programming ($O(n^2 \cdot 2^n)$), branch and bound, and heuristic methods.
