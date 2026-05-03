---
title: Euler Paths & Circuits
---

# Euler Paths & Circuits

One of the oldest problems in graph theory asks: can you traverse every edge of a graph exactly once? This question, first studied by Leonhard Euler in 1736, launched the entire field of graph theory.

---

## 1. The Königsberg Bridge Problem

The city of Königsberg (now Kaliningrad, Russia) was set on both sides of the Pregel River and included two islands connected by seven bridges. The residents wondered:

> **Is it possible to walk through the city crossing each bridge exactly once and return to the starting point?**

Euler modelled the problem as a graph:

- **Vertices** = landmasses (4 regions).
- **Edges** = bridges (7 total).

He proved that such a walk is **impossible** and, in doing so, discovered the conditions under which such traversals exist.

---

## 2. Definitions

### 2.1 Euler Path (Euler Trail)

An **Euler path** is a trail (walk with no repeated edges) that visits **every edge** of the graph exactly once.

- Vertices may be revisited.
- The path has distinct start and end vertices (unless it is a circuit).

### 2.2 Euler Circuit (Euler Tour)

An **Euler circuit** is an Euler path that **starts and ends at the same vertex** — a closed trail covering every edge exactly once.

> Key distinction from Hamiltonian paths: Euler paths concern **edges**, Hamiltonian paths concern **vertices**.

---

## 3. Existence Theorems

### 3.1 Euler Circuit — Undirected Graph

**Theorem:** A connected undirected graph has an **Euler circuit** if and only if **every vertex has even degree**.

$$
\text{Euler circuit exists} \iff \forall v \in V: \deg(v) \equiv 0 \pmod{2}
$$

### 3.2 Euler Path — Undirected Graph

**Theorem:** A connected undirected graph has an **Euler path** (but not necessarily a circuit) if and only if it has **exactly 0 or 2 vertices of odd degree**.

- If 0 odd-degree vertices → Euler **circuit** exists (start anywhere).
- If 2 odd-degree vertices → Euler **path** exists (must start at one odd-degree vertex and end at the other).
- If more than 2 odd-degree vertices → **no** Euler path exists.

### 3.3 Why These Conditions Work

Every time a trail passes through a vertex, it uses one edge to enter and one to leave — consuming 2 edges. For an interior vertex (not start/end), all edges must pair up, requiring even degree. The start and end vertices each have one unpaired edge, hence odd degree.

### 3.4 Checking the Königsberg Problem

The four landmasses had degrees 3, 3, 3, and 5 — **four** vertices of odd degree. Since this exceeds 2, no Euler path (or circuit) exists.

---

## 4. Euler Paths & Circuits in Directed Graphs

### 4.1 Directed Euler Circuit

A **directed** graph has an Euler circuit if and only if:

1. The graph is **strongly connected** (or at least every vertex with nonzero degree belongs to a single strongly connected component).
2. For every vertex: $\text{in-degree}(v) = \text{out-degree}(v)$.

### 4.2 Directed Euler Path

A directed graph has an Euler path if and only if:

1. The graph is connected (weakly — treat edges as undirected).
2. At most one vertex has $\text{out-degree} - \text{in-degree} = 1$ (start vertex).
3. At most one vertex has $\text{in-degree} - \text{out-degree} = 1$ (end vertex).
4. All other vertices have equal in-degree and out-degree.

---

## 5. Algorithms for Finding Euler Paths/Circuits

### 5.1 Fleury's Algorithm

A simple but slower approach:

1. Start at an appropriate vertex (any vertex for circuit; odd-degree vertex for path).
2. At each step, choose an edge to traverse. **Prefer non-bridge edges** — only cross a bridge if no other option exists.
3. Remove the traversed edge from the graph.
4. Repeat until all edges are used.

**Time complexity:** $O(|E|^2)$ — checking for bridges at each step is expensive.

### 5.2 Hierholzer's Algorithm

A much more efficient approach using a **stack-based** traversal:

1. Start at an appropriate vertex. Push it onto the stack.
2. While the stack is non-empty:
   - Let $u$ = top of stack.
   - If $u$ has unused edges: pick one edge $(u, v)$, mark it as used, push $v$.
   - Else: pop $u$ from the stack and add it to the **circuit** (output list).
3. The output list (reversed) is the Euler circuit/path.

**Time complexity:** $O(|V| + |E|)$ — each edge is processed exactly once.

**Why it works:** When a vertex has no more unused edges, it means we've completed a sub-circuit through it. By recording these vertices in reverse, we stitch all sub-circuits together.

---

## 6. Step-by-Step Example

Consider a graph with vertices $\{0, 1, 2, 3, 4\}$ and edges:

$$
\{(0,1), (1,2), (2,0), (0,3), (3,4), (4,0)\}
$$

**Degree check:** $\deg(0) = 4$, $\deg(1) = 2$, $\deg(2) = 2$, $\deg(3) = 2$, $\deg(4) = 2$. All even → Euler circuit exists.

**Hierholzer's trace (starting at 0):**

| Stack | Action | Circuit |
|-------|--------|---------|
| [0] | Follow 0→1 | |
| [0, 1] | Follow 1→2 | |
| [0, 1, 2] | Follow 2→0 | |
| [0, 1, 2, 0] | Follow 0→3 | |
| [0, 1, 2, 0, 3] | Follow 3→4 | |
| [0, 1, 2, 0, 3, 4] | Follow 4→0 | |
| [0, 1, 2, 0, 3, 4, 0] | No edges from 0 → pop | [0] |
| [0, 1, 2, 0, 3, 4] | No edges from 4 → pop | [0, 4] |
| [0, 1, 2, 0, 3] | No edges from 3 → pop | [0, 4, 3] |
| [0, 1, 2, 0] | No edges from 0 → pop | [0, 4, 3, 0] |
| [0, 1, 2] | No edges from 2 → pop | [0, 4, 3, 0, 2] |
| [0, 1] | No edges from 1 → pop | [0, 4, 3, 0, 2, 1] |
| [0] | No edges from 0 → pop | [0, 4, 3, 0, 2, 1, 0] |

**Euler circuit (reversed):** $0 \to 1 \to 2 \to 0 \to 3 \to 4 \to 0$

---

## 7. Code Implementations

### 7.1 Check if Euler Path/Circuit Exists

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Returns: 0 = no Euler path, 1 = Euler path (not circuit), 2 = Euler circuit
int eulerType(int n, const vector<vector<int>>& adj) {
    int oddCount = 0;
    for (int i = 0; i < n; i++) {
        if (adj[i].size() % 2 != 0) {
            oddCount++;
        }
    }

    if (oddCount == 0) return 2;       // Euler circuit
    if (oddCount == 2) return 1;       // Euler path
    return 0;                           // Neither
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);
    // Edges: 0-1, 1-2, 2-0, 0-3, 3-4, 4-0
    vector<pair<int,int>> edges = {{0,1},{1,2},{2,0},{0,3},{3,4},{4,0}};
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    int type = eulerType(n, adj);
    if (type == 2) cout << "Euler circuit exists" << endl;
    else if (type == 1) cout << "Euler path exists (not circuit)" << endl;
    else cout << "No Euler path or circuit" << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class EulerCheck {
    // Returns: 0 = none, 1 = Euler path, 2 = Euler circuit
    static int EulerType(int n, List<List<int>> adj) {
        int oddCount = 0;
        for (int i = 0; i < n; i++) {
            if (adj[i].Count % 2 != 0) {
                oddCount++;
            }
        }

        if (oddCount == 0) return 2;
        if (oddCount == 2) return 1;
        return 0;
    }

    static void Main() {
        int n = 5;
        var adj = new List<List<int>>();
        for (int i = 0; i < n; i++) adj.Add(new List<int>());

        int[][] edges = { new[]{0,1}, new[]{1,2}, new[]{2,0}, new[]{0,3}, new[]{3,4}, new[]{4,0} };
        foreach (var e in edges) {
            adj[e[0]].Add(e[1]);
            adj[e[1]].Add(e[0]);
        }

        int type = EulerType(n, adj);
        if (type == 2) Console.WriteLine("Euler circuit exists");
        else if (type == 1) Console.WriteLine("Euler path exists (not circuit)");
        else Console.WriteLine("No Euler path or circuit");
    }
}
```

```java
import java.util.*;

public class EulerCheck {
    // Returns: 0 = none, 1 = Euler path, 2 = Euler circuit
    public static int eulerType(int n, List<List<Integer>> adj) {
        int oddCount = 0;
        for (int i = 0; i < n; i++) {
            if (adj.get(i).size() % 2 != 0) {
                oddCount++;
            }
        }

        if (oddCount == 0) return 2;
        if (oddCount == 2) return 1;
        return 0;
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1},{1,2},{2,0},{0,3},{3,4},{4,0}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        int type = eulerType(n, adj);
        if (type == 2) System.out.println("Euler circuit exists");
        else if (type == 1) System.out.println("Euler path exists (not circuit)");
        else System.out.println("No Euler path or circuit");
    }
}
```

```python
def euler_type(n, adj):
    """Returns: 0 = none, 1 = Euler path, 2 = Euler circuit"""
    odd_count = sum(1 for i in range(n) if len(adj[i]) % 2 != 0)

    if odd_count == 0:
        return 2  # Euler circuit
    if odd_count == 2:
        return 1  # Euler path
    return 0      # Neither

# Example
n = 5
adj = [[] for _ in range(n)]
edges = [(0,1),(1,2),(2,0),(0,3),(3,4),(4,0)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

result = euler_type(n, adj)
if result == 2:
    print("Euler circuit exists")
elif result == 1:
    print("Euler path exists (not circuit)")
else:
    print("No Euler path or circuit")
```

```javascript
function eulerType(n, adj) {
  // Returns: 0 = none, 1 = Euler path, 2 = Euler circuit
  let oddCount = 0;
  for (let i = 0; i < n; i++) {
    if (adj[i].length % 2 !== 0) {
      oddCount++;
    }
  }

  if (oddCount === 0) return 2;
  if (oddCount === 2) return 1;
  return 0;
}

// Example
const n = 5;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]];
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

const result = eulerType(n, adj);
if (result === 2) console.log("Euler circuit exists");
else if (result === 1) console.log("Euler path exists (not circuit)");
else console.log("No Euler path or circuit");
```

### 7.2 Hierholzer's Algorithm — Find Euler Circuit/Path

```cpp
#include <iostream>
#include <vector>
#include <stack>
#include <algorithm>
using namespace std;

vector<int> findEulerPath(int n, vector<vector<int>>& adj) {
    // Find start vertex
    int start = 0;
    for (int i = 0; i < n; i++) {
        if (adj[i].size() % 2 != 0) {
            start = i;
            break;
        }
    }

    // Track which edges are used (by index in adjacency list)
    vector<int> edgeIdx(n, 0);
    stack<int> stk;
    vector<int> circuit;

    stk.push(start);
    while (!stk.empty()) {
        int u = stk.top();
        if (edgeIdx[u] < (int)adj[u].size()) {
            int v = adj[u][edgeIdx[u]];
            edgeIdx[u]++;
            // Remove reverse edge (for undirected graphs)
            auto it = find(adj[v].begin() + edgeIdx[v], adj[v].end(), u);
            if (it != adj[v].end()) {
                swap(*it, adj[v][edgeIdx[v]]);
                edgeIdx[v]++;
            }
            stk.push(v);
        } else {
            circuit.push_back(u);
            stk.pop();
        }
    }

    reverse(circuit.begin(), circuit.end());
    return circuit;
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);
    vector<pair<int,int>> edges = {{0,1},{1,2},{2,0},{0,3},{3,4},{4,0}};
    for (auto [u, v] : edges) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    vector<int> path = findEulerPath(n, adj);
    cout << "Euler circuit: ";
    for (int v : path) cout << v << " ";
    cout << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class Hierholzer {
    static List<int> FindEulerPath(int n, List<List<int>> adj) {
        // Find start vertex
        int start = 0;
        for (int i = 0; i < n; i++) {
            if (adj[i].Count % 2 != 0) {
                start = i;
                break;
            }
        }

        int[] edgeIdx = new int[n];
        Stack<int> stack = new Stack<int>();
        List<int> circuit = new List<int>();

        stack.Push(start);
        while (stack.Count > 0) {
            int u = stack.Peek();
            if (edgeIdx[u] < adj[u].Count) {
                int v = adj[u][edgeIdx[u]];
                edgeIdx[u]++;
                // Remove reverse edge
                for (int i = edgeIdx[v]; i < adj[v].Count; i++) {
                    if (adj[v][i] == u) {
                        int temp = adj[v][i];
                        adj[v][i] = adj[v][edgeIdx[v]];
                        adj[v][edgeIdx[v]] = temp;
                        edgeIdx[v]++;
                        break;
                    }
                }
                stack.Push(v);
            } else {
                circuit.Add(u);
                stack.Pop();
            }
        }

        circuit.Reverse();
        return circuit;
    }

    static void Main() {
        int n = 5;
        var adj = new List<List<int>>();
        for (int i = 0; i < n; i++) adj.Add(new List<int>());

        int[][] edges = { new[]{0,1}, new[]{1,2}, new[]{2,0}, new[]{0,3}, new[]{3,4}, new[]{4,0} };
        foreach (var e in edges) {
            adj[e[0]].Add(e[1]);
            adj[e[1]].Add(e[0]);
        }

        List<int> path = FindEulerPath(n, adj);
        Console.WriteLine("Euler circuit: " + string.Join(" ", path));
    }
}
```

```java
import java.util.*;

public class Hierholzer {
    public static List<Integer> findEulerPath(int n, List<List<Integer>> adj) {
        // Find start vertex
        int start = 0;
        for (int i = 0; i < n; i++) {
            if (adj.get(i).size() % 2 != 0) {
                start = i;
                break;
            }
        }

        int[] edgeIdx = new int[n];
        Deque<Integer> stack = new ArrayDeque<>();
        List<Integer> circuit = new ArrayList<>();

        stack.push(start);
        while (!stack.isEmpty()) {
            int u = stack.peek();
            if (edgeIdx[u] < adj.get(u).size()) {
                int v = adj.get(u).get(edgeIdx[u]);
                edgeIdx[u]++;
                // Remove reverse edge
                List<Integer> neighbors = adj.get(v);
                for (int i = edgeIdx[v]; i < neighbors.size(); i++) {
                    if (neighbors.get(i) == u) {
                        Collections.swap(neighbors, i, edgeIdx[v]);
                        edgeIdx[v]++;
                        break;
                    }
                }
                stack.push(v);
            } else {
                circuit.add(u);
                stack.pop();
            }
        }

        Collections.reverse(circuit);
        return circuit;
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1},{1,2},{2,0},{0,3},{3,4},{4,0}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        List<Integer> path = findEulerPath(n, adj);
        System.out.println("Euler circuit: " + path);
    }
}
```

```python
def find_euler_path(n, adj):
    """Hierholzer's algorithm for undirected graphs."""
    # Find start vertex (odd-degree vertex, or 0 if all even)
    start = 0
    for i in range(n):
        if len(adj[i]) % 2 != 0:
            start = i
            break

    # Use a list of sets for O(1) edge removal
    graph = [list(neighbors) for neighbors in adj]
    edge_idx = [0] * n

    stack = [start]
    circuit = []

    while stack:
        u = stack[-1]
        if edge_idx[u] < len(graph[u]):
            v = graph[u][edge_idx[u]]
            edge_idx[u] += 1
            # Remove reverse edge
            for i in range(edge_idx[v], len(graph[v])):
                if graph[v][i] == u:
                    graph[v][i], graph[v][edge_idx[v]] = graph[v][edge_idx[v]], graph[v][i]
                    edge_idx[v] += 1
                    break
            stack.append(v)
        else:
            circuit.append(stack.pop())

    circuit.reverse()
    return circuit

# Example
n = 5
adj = [[] for _ in range(n)]
edges = [(0,1),(1,2),(2,0),(0,3),(3,4),(4,0)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

path = find_euler_path(n, adj)
print("Euler circuit:", " -> ".join(map(str, path)))
```

```javascript
function findEulerPath(n, adj) {
  // Hierholzer's algorithm for undirected graphs
  // Find start vertex
  let start = 0;
  for (let i = 0; i < n; i++) {
    if (adj[i].length % 2 !== 0) {
      start = i;
      break;
    }
  }

  // Copy adjacency lists
  const graph = adj.map(neighbors => [...neighbors]);
  const edgeIdx = new Array(n).fill(0);

  const stack = [start];
  const circuit = [];

  while (stack.length > 0) {
    const u = stack[stack.length - 1];
    if (edgeIdx[u] < graph[u].length) {
      const v = graph[u][edgeIdx[u]];
      edgeIdx[u]++;
      // Remove reverse edge
      for (let i = edgeIdx[v]; i < graph[v].length; i++) {
        if (graph[v][i] === u) {
          [graph[v][i], graph[v][edgeIdx[v]]] = [graph[v][edgeIdx[v]], graph[v][i]];
          edgeIdx[v]++;
          break;
        }
      }
      stack.push(v);
    } else {
      circuit.push(stack.pop());
    }
  }

  circuit.reverse();
  return circuit;
}

// Example
const n = 5;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]];
for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

const path = findEulerPath(n, adj);
console.log("Euler circuit:", path.join(" -> "));
```

---

## 8. Applications of Euler Paths

| Application | Description |
|-------------|-------------|
| **Circuit board routing** | Trace every connection without retracing |
| **DNA sequencing** | de Bruijn graphs use Euler paths to reconstruct sequences |
| **Network routing** | Visit every link for inspection (e.g., snow plowing) |
| **Puzzle solving** | "Draw without lifting pen" puzzles |
| **Chinese Postman Problem** | Find minimum-cost route traversing every edge |

---

## 9. Key Takeaways

1. An **Euler path** traverses every **edge** exactly once; an **Euler circuit** also returns to the start.
2. **Existence check** (undirected): count odd-degree vertices — 0 means circuit, 2 means path only, more means neither.
3. **Directed graphs**: require balanced in/out-degrees for circuits; at most one vertex with surplus out-degree (start) and one with surplus in-degree (end) for paths.
4. **Fleury's algorithm** is conceptually simple ($O(|E|^2)$) but slow due to repeated bridge detection.
5. **Hierholzer's algorithm** finds an Euler path/circuit in $O(|V| + |E|)$ time using a stack-based approach.
6. The Königsberg bridge problem (1736) was the catalyst for graph theory as a mathematical discipline.
7. Euler path problems have practical applications in circuit design, genome assembly, and route planning.
