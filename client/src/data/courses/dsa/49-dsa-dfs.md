---
title: Depth-First Search
---

# Depth-First Search (DFS)

**Depth-First Search** explores a graph by going as deep as possible along each branch before backtracking. It uses a **stack** (explicitly or via recursion) and is the foundation for many graph algorithms: cycle detection, topological sort, connected components, and more.

---

## Core Idea

1. Start at a source vertex, mark it visited.
2. Visit an unvisited neighbor and repeat (go deeper).
3. When no unvisited neighbors remain, **backtrack** to the previous vertex.
4. Continue until all reachable vertices are visited.

```
BFS goes wide (level by level).
DFS goes deep (as far as possible, then backtracks).

Think of DFS like exploring a maze: always take the next unexplored
turn, and retrace your steps when you hit a dead end.
```

---

## Step-by-Step Trace

```
Graph:
    0 --- 1 --- 4
    |     |
    2 --- 3

DFS starting from vertex 0 (choosing smallest neighbor first):

Step 1: Visit 0          Stack: [0]
Step 2: Visit 1 (neighbor of 0)   Stack: [0, 1]
Step 3: Visit 3 (neighbor of 1)   Stack: [0, 1, 3]
Step 4: Visit 2 (neighbor of 3)   Stack: [0, 1, 3, 2]
Step 5: 2's neighbors (0, 3) all visited → backtrack
        Stack: [0, 1, 3]
Step 6: 3's neighbors (1, 2) all visited → backtrack
        Stack: [0, 1]
Step 7: Visit 4 (neighbor of 1)   Stack: [0, 1, 4]
Step 8: 4's neighbors (1) all visited → backtrack
        Stack: [0, 1]
Step 9: Backtrack to 0 → all done

DFS Order: 0, 1, 3, 2, 4

Tree visualization:
        0
        |
        1
       / \
      3   4
      |
      2
```

---

## DFS — Recursive Implementation

### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

void dfs(int node, const vector<vector<int>>& adj, vector<bool>& visited, vector<int>& order) {
    visited[node] = true;
    order.push_back(node);

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor, adj, visited, order);
        }
    }
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);

    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 3);
    addEdge(1, 4);
    addEdge(2, 3);

    vector<bool> visited(n, false);
    vector<int> order;

    dfs(0, adj, visited, order);

    cout << "DFS from vertex 0: ";
    for (int v : order) cout << v << " ";
    cout << endl;

    return 0;
}
```

### Java

```java
import java.util.*;

public class DFS {
    static void dfs(int node, List<List<Integer>> adj, boolean[] visited, List<Integer> order) {
        visited[node] = true;
        order.add(node);

        for (int neighbor : adj.get(node)) {
            if (!visited[neighbor]) {
                dfs(neighbor, adj, visited, order);
            }
        }
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1}, {0,2}, {1,3}, {1,4}, {2,3}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        boolean[] visited = new boolean[n];
        List<Integer> order = new ArrayList<>();

        dfs(0, adj, visited, order);

        System.out.println("DFS from vertex 0: " + order);
    }
}
```

### Python

```python
def dfs(node, adj, visited, order):
    visited[node] = True
    order.append(node)

    for neighbor in adj[node]:
        if not visited[neighbor]:
            dfs(neighbor, adj, visited, order)


n = 5
adj = [[] for _ in range(n)]
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 3)]

for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

visited = [False] * n
order = []
dfs(0, adj, visited, order)

print("DFS from vertex 0:", order)
```

### JavaScript

```javascript
function dfs(node, adj, visited, order) {
  visited[node] = true;
  order.push(node);

  for (const neighbor of adj[node]) {
    if (!visited[neighbor]) {
      dfs(neighbor, adj, visited, order);
    }
  }
}

const n = 5;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [0,2], [1,3], [1,4], [2,3]];

for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

const visited = new Array(n).fill(false);
const order = [];
dfs(0, adj, visited, order);

console.log("DFS from vertex 0:", order);
```

**Output:** `DFS from vertex 0: [0, 1, 3, 2, 4]`

---

## DFS — Iterative Implementation (Using Stack)

The iterative version avoids stack overflow for very deep graphs.

```cpp
#include <iostream>
#include <vector>
#include <stack>
using namespace std;

vector<int> dfsIterative(int source, const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    vector<int> order;
    stack<int> st;

    st.push(source);

    while (!st.empty()) {
        int node = st.top();
        st.pop();

        if (visited[node]) continue;
        visited[node] = true;
        order.push_back(node);

        // Push neighbors in reverse order for consistent ordering
        for (int i = adj[node].size() - 1; i >= 0; i--) {
            if (!visited[adj[node][i]]) {
                st.push(adj[node][i]);
            }
        }
    }

    return order;
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);
    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    addEdge(0, 1); addEdge(0, 2);
    addEdge(1, 3); addEdge(1, 4); addEdge(2, 3);

    cout << "DFS (iterative) from vertex 0: ";
    for (int v : dfsIterative(0, adj)) cout << v << " ";
    cout << endl;

    return 0;
}
```

```java
import java.util.*;

public class DFSIterative {
    public static List<Integer> dfsIterative(int source, List<List<Integer>> adj) {
        int n = adj.size();
        boolean[] visited = new boolean[n];
        List<Integer> order = new ArrayList<>();
        Deque<Integer> stack = new ArrayDeque<>();

        stack.push(source);

        while (!stack.isEmpty()) {
            int node = stack.pop();

            if (visited[node]) continue;
            visited[node] = true;
            order.add(node);

            List<Integer> neighbors = adj.get(node);
            for (int i = neighbors.size() - 1; i >= 0; i--) {
                if (!visited[neighbors.get(i)]) {
                    stack.push(neighbors.get(i));
                }
            }
        }

        return order;
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1}, {0,2}, {1,3}, {1,4}, {2,3}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        System.out.println("DFS (iterative) from vertex 0: " + dfsIterative(0, adj));
    }
}
```

```python
def dfs_iterative(source, adj):
    n = len(adj)
    visited = [False] * n
    order = []
    stack = [source]

    while stack:
        node = stack.pop()

        if visited[node]:
            continue
        visited[node] = True
        order.append(node)

        # Push neighbors in reverse for consistent ordering
        for neighbor in reversed(adj[node]):
            if not visited[neighbor]:
                stack.append(neighbor)

    return order


n = 5
adj = [[] for _ in range(n)]
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 3)]

for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

print("DFS (iterative) from vertex 0:", dfs_iterative(0, adj))
```

```javascript
function dfsIterative(source, adj) {
  const n = adj.length;
  const visited = new Array(n).fill(false);
  const order = [];
  const stack = [source];

  while (stack.length > 0) {
    const node = stack.pop();

    if (visited[node]) continue;
    visited[node] = true;
    order.push(node);

    // Push neighbors in reverse for consistent ordering
    for (let i = adj[node].length - 1; i >= 0; i--) {
      if (!visited[adj[node][i]]) {
        stack.push(adj[node][i]);
      }
    }
  }

  return order;
}

const n = 5;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [0,2], [1,3], [1,4], [2,3]];

for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

console.log("DFS (iterative) from vertex 0:", dfsIterative(0, adj));
```

---

## DFS on a Grid

**Problem:** Count the number of islands in a grid (`1` = land, `0` = water).

```
Grid:
  1 1 0 0 0
  1 1 0 0 0
  0 0 1 0 0
  0 0 0 1 1

Islands: 3
```

```cpp
#include <iostream>
#include <vector>
using namespace std;

void dfsGrid(vector<vector<int>>& grid, int r, int c) {
    int rows = grid.size(), cols = grid[0].size();
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] == 0) return;

    grid[r][c] = 0; // mark visited by sinking the island

    dfsGrid(grid, r + 1, c);
    dfsGrid(grid, r - 1, c);
    dfsGrid(grid, r, c + 1);
    dfsGrid(grid, r, c - 1);
}

int countIslands(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    int count = 0;

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 1) {
                count++;
                dfsGrid(grid, r, c);
            }
        }
    }

    return count;
}

int main() {
    vector<vector<int>> grid = {
        {1, 1, 0, 0, 0},
        {1, 1, 0, 0, 0},
        {0, 0, 1, 0, 0},
        {0, 0, 0, 1, 1}
    };

    cout << "Number of islands: " << countIslands(grid) << endl; // 3
    return 0;
}
```

```java
public class CountIslands {
    static void dfsGrid(int[][] grid, int r, int c) {
        int rows = grid.length, cols = grid[0].length;
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] == 0) return;

        grid[r][c] = 0; // mark visited

        dfsGrid(grid, r + 1, c);
        dfsGrid(grid, r - 1, c);
        dfsGrid(grid, r, c + 1);
        dfsGrid(grid, r, c - 1);
    }

    static int countIslands(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int count = 0;

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 1) {
                    count++;
                    dfsGrid(grid, r, c);
                }
            }
        }

        return count;
    }

    public static void main(String[] args) {
        int[][] grid = {
            {1, 1, 0, 0, 0},
            {1, 1, 0, 0, 0},
            {0, 0, 1, 0, 0},
            {0, 0, 0, 1, 1}
        };

        System.out.println("Number of islands: " + countIslands(grid)); // 3
    }
}
```

```python
def dfs_grid(grid, r, c):
    rows, cols = len(grid), len(grid[0])
    if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] == 0:
        return

    grid[r][c] = 0  # mark visited

    dfs_grid(grid, r + 1, c)
    dfs_grid(grid, r - 1, c)
    dfs_grid(grid, r, c + 1)
    dfs_grid(grid, r, c - 1)


def count_islands(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                count += 1
                dfs_grid(grid, r, c)

    return count


grid = [
    [1, 1, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1],
]

print("Number of islands:", count_islands(grid))  # 3
```

```javascript
function dfsGrid(grid, r, c) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === 0) return;

  grid[r][c] = 0; // mark visited

  dfsGrid(grid, r + 1, c);
  dfsGrid(grid, r - 1, c);
  dfsGrid(grid, r, c + 1);
  dfsGrid(grid, r, c - 1);
}

function countIslands(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        count++;
        dfsGrid(grid, r, c);
      }
    }
  }

  return count;
}

const grid = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

console.log("Number of islands:", countIslands(grid)); // 3
```

---

## Cycle Detection Using DFS

### Undirected Graph

A cycle exists if during DFS we encounter a visited neighbor that is **not** the parent of the current node.

```cpp
#include <iostream>
#include <vector>
using namespace std;

bool hasCycleDFS(int node, int parent, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[node] = true;

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            if (hasCycleDFS(neighbor, node, adj, visited)) return true;
        } else if (neighbor != parent) {
            return true; // found a cycle
        }
    }

    return false;
}

bool hasCycle(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            if (hasCycleDFS(i, -1, adj, visited)) return true;
        }
    }

    return false;
}

int main() {
    // Graph with cycle: 0-1-2-0
    vector<vector<int>> adj1(3);
    adj1[0].push_back(1); adj1[1].push_back(0);
    adj1[1].push_back(2); adj1[2].push_back(1);
    adj1[2].push_back(0); adj1[0].push_back(2);

    cout << "Graph 1 has cycle? " << (hasCycle(adj1) ? "Yes" : "No") << endl; // Yes

    // Graph without cycle: 0-1-2 (tree)
    vector<vector<int>> adj2(3);
    adj2[0].push_back(1); adj2[1].push_back(0);
    adj2[1].push_back(2); adj2[2].push_back(1);

    cout << "Graph 2 has cycle? " << (hasCycle(adj2) ? "Yes" : "No") << endl; // No

    return 0;
}
```

```java
import java.util.*;

public class CycleDetection {
    static boolean hasCycleDFS(int node, int parent, List<List<Integer>> adj, boolean[] visited) {
        visited[node] = true;

        for (int neighbor : adj.get(node)) {
            if (!visited[neighbor]) {
                if (hasCycleDFS(neighbor, node, adj, visited)) return true;
            } else if (neighbor != parent) {
                return true;
            }
        }

        return false;
    }

    static boolean hasCycle(List<List<Integer>> adj) {
        int n = adj.size();
        boolean[] visited = new boolean[n];

        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                if (hasCycleDFS(i, -1, adj, visited)) return true;
            }
        }

        return false;
    }

    public static void main(String[] args) {
        // Graph with cycle
        List<List<Integer>> adj1 = new ArrayList<>();
        for (int i = 0; i < 3; i++) adj1.add(new ArrayList<>());
        adj1.get(0).add(1); adj1.get(1).add(0);
        adj1.get(1).add(2); adj1.get(2).add(1);
        adj1.get(2).add(0); adj1.get(0).add(2);

        System.out.println("Graph 1 has cycle? " + hasCycle(adj1)); // true

        // Graph without cycle (tree)
        List<List<Integer>> adj2 = new ArrayList<>();
        for (int i = 0; i < 3; i++) adj2.add(new ArrayList<>());
        adj2.get(0).add(1); adj2.get(1).add(0);
        adj2.get(1).add(2); adj2.get(2).add(1);

        System.out.println("Graph 2 has cycle? " + hasCycle(adj2)); // false
    }
}
```

```python
def has_cycle_dfs(node, parent, adj, visited):
    visited[node] = True

    for neighbor in adj[node]:
        if not visited[neighbor]:
            if has_cycle_dfs(neighbor, node, adj, visited):
                return True
        elif neighbor != parent:
            return True

    return False


def has_cycle(adj):
    n = len(adj)
    visited = [False] * n

    for i in range(n):
        if not visited[i]:
            if has_cycle_dfs(i, -1, adj, visited):
                return True

    return False


# Graph with cycle: 0-1-2-0
adj1 = [[1, 2], [0, 2], [1, 0]]
print("Graph 1 has cycle?", has_cycle(adj1))  # True

# Graph without cycle (tree): 0-1-2
adj2 = [[1], [0, 2], [1]]
print("Graph 2 has cycle?", has_cycle(adj2))  # False
```

```javascript
function hasCycleDFS(node, parent, adj, visited) {
  visited[node] = true;

  for (const neighbor of adj[node]) {
    if (!visited[neighbor]) {
      if (hasCycleDFS(neighbor, node, adj, visited)) return true;
    } else if (neighbor !== parent) {
      return true;
    }
  }

  return false;
}

function hasCycle(adj) {
  const n = adj.length;
  const visited = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      if (hasCycleDFS(i, -1, adj, visited)) return true;
    }
  }

  return false;
}

// Graph with cycle: 0-1-2-0
const adj1 = [[1, 2], [0, 2], [1, 0]];
console.log("Graph 1 has cycle?", hasCycle(adj1)); // true

// Graph without cycle (tree): 0-1-2
const adj2 = [[1], [0, 2], [1]];
console.log("Graph 2 has cycle?", hasCycle(adj2)); // false
```

---

## Finding Connected Components

Run DFS from each unvisited vertex — each DFS call discovers one component.

```cpp
#include <iostream>
#include <vector>
using namespace std;

void dfs(int node, const vector<vector<int>>& adj, vector<bool>& visited, vector<int>& component) {
    visited[node] = true;
    component.push_back(node);

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfs(neighbor, adj, visited, component);
        }
    }
}

vector<vector<int>> findComponents(const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    vector<vector<int>> components;

    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            vector<int> component;
            dfs(i, adj, visited, component);
            components.push_back(component);
        }
    }

    return components;
}

int main() {
    // Graph with 3 components: {0,1,2}, {3,4}, {5}
    int n = 6;
    vector<vector<int>> adj(n);
    adj[0].push_back(1); adj[1].push_back(0);
    adj[1].push_back(2); adj[2].push_back(1);
    adj[3].push_back(4); adj[4].push_back(3);

    auto components = findComponents(adj);
    cout << "Number of connected components: " << components.size() << endl;
    for (int i = 0; i < components.size(); i++) {
        cout << "Component " << i << ": ";
        for (int v : components[i]) cout << v << " ";
        cout << endl;
    }

    return 0;
}
```

```java
import java.util.*;

public class ConnectedComponents {
    static void dfs(int node, List<List<Integer>> adj, boolean[] visited, List<Integer> component) {
        visited[node] = true;
        component.add(node);

        for (int neighbor : adj.get(node)) {
            if (!visited[neighbor]) {
                dfs(neighbor, adj, visited, component);
            }
        }
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        adj.get(0).add(1); adj.get(1).add(0);
        adj.get(1).add(2); adj.get(2).add(1);
        adj.get(3).add(4); adj.get(4).add(3);

        boolean[] visited = new boolean[n];
        List<List<Integer>> components = new ArrayList<>();

        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                List<Integer> component = new ArrayList<>();
                dfs(i, adj, visited, component);
                components.add(component);
            }
        }

        System.out.println("Number of connected components: " + components.size());
        for (int i = 0; i < components.size(); i++) {
            System.out.println("Component " + i + ": " + components.get(i));
        }
    }
}
```

```python
def dfs(node, adj, visited, component):
    visited[node] = True
    component.append(node)

    for neighbor in adj[node]:
        if not visited[neighbor]:
            dfs(neighbor, adj, visited, component)


def find_components(adj):
    n = len(adj)
    visited = [False] * n
    components = []

    for i in range(n):
        if not visited[i]:
            component = []
            dfs(i, adj, visited, component)
            components.append(component)

    return components


# Graph with 3 components: {0,1,2}, {3,4}, {5}
n = 6
adj = [[] for _ in range(n)]
adj[0].append(1); adj[1].append(0)
adj[1].append(2); adj[2].append(1)
adj[3].append(4); adj[4].append(3)

components = find_components(adj)
print(f"Number of connected components: {len(components)}")
for i, comp in enumerate(components):
    print(f"Component {i}: {comp}")
```

```javascript
function dfs(node, adj, visited, component) {
  visited[node] = true;
  component.push(node);

  for (const neighbor of adj[node]) {
    if (!visited[neighbor]) {
      dfs(neighbor, adj, visited, component);
    }
  }
}

function findComponents(adj) {
  const n = adj.length;
  const visited = new Array(n).fill(false);
  const components = [];

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const component = [];
      dfs(i, adj, visited, component);
      components.push(component);
    }
  }

  return components;
}

// Graph with 3 components: {0,1,2}, {3,4}, {5}
const n = 6;
const adj = Array.from({ length: n }, () => []);
adj[0].push(1); adj[1].push(0);
adj[1].push(2); adj[2].push(1);
adj[3].push(4); adj[4].push(3);

const components = findComponents(adj);
console.log(`Number of connected components: ${components.length}`);
components.forEach((comp, i) => {
  console.log(`Component ${i}: [${comp.join(", ")}]`);
});
```

**Output:**
```
Number of connected components: 3
Component 0: [0, 1, 2]
Component 1: [3, 4]
Component 2: [5]
```

---

## Time and Space Complexity

| | Complexity |
|---|---|
| **Time** | O(V + E) — each vertex and edge is processed once |
| **Space** | O(V) — for visited array + recursion stack (or explicit stack) |

---

## BFS vs DFS Comparison

| Feature | BFS | DFS |
|---------|-----|-----|
| Data structure | Queue | Stack (or recursion) |
| Exploration | Level by level | Deep first, then backtrack |
| Shortest path (unweighted) | Yes | No |
| Memory usage | O(width of graph) | O(depth of graph) |
| Cycle detection | Possible | Natural fit |
| Topological sort | Kahn's algorithm | Natural fit |
| Connected components | Works | Works |

---

## When to Use DFS

- **Cycle detection** — check for back edges during traversal.
- **Connected components** — each DFS from an unvisited node finds one.
- **Topological sort** — post-order DFS on a DAG.
- **Path finding** — especially when you need any path (not shortest).
- **Maze solving** — explore all paths.
- **Strongly connected components** (Tarjan's, Kosaraju's).
- **Detecting bridges and articulation points.**

---

## Common Mistakes

1. **Forgetting the parent check in cycle detection** — the edge back to parent is not a cycle in undirected graphs.
2. **Stack overflow on deep graphs** — use iterative DFS for graphs with 10⁵+ vertices in a single chain.
3. **Not handling disconnected graphs** — always loop over all vertices and start DFS from unvisited ones.

---

## Key Takeaways

1. DFS uses a **stack** (recursion or explicit) and explores deeply before backtracking.
2. Time complexity: **O(V + E)** — same as BFS.
3. DFS does **not** find shortest paths (use BFS for that).
4. DFS is the natural choice for **cycle detection**, **connected components**, and **topological sort**.
5. For very deep graphs, prefer the **iterative** version to avoid stack overflow.

---

Next: **Topological Sort →**
