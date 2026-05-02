---
title: Topological Sort
---

# Topological Sort

Topological sort produces a linear ordering of vertices in a **Directed Acyclic Graph (DAG)** such that for every directed edge `u → v`, vertex `u` comes before vertex `v` in the ordering.

---

## Why Does It Matter?

Topological sorting is used everywhere:

- **Build systems** — compiling files in dependency order (e.g., Makefiles, Webpack)
- **Task scheduling** — ordering tasks with prerequisites
- **Course prerequisites** — determining a valid order to take classes
- **Package managers** — installing dependencies before dependents

---

## Key Requirement: DAG

Topological sort is **only possible** on a DAG (Directed Acyclic Graph). If the graph has a cycle, no valid ordering exists because you'd need a vertex to come before itself.

```
Valid DAG:            Has a cycle (invalid):

  A → B → D            A → B
  ↓       ↑              ↑   ↓
  C ──────┘              D ← C
```

---

## Understanding Through an Example

Consider course prerequisites:

```
Courses and prerequisites:
  Math101 → Math201
  Math101 → CS101
  CS101   → CS201
  Math201 → CS201
  CS201   → CS301

Graph:
  Math101 → Math201 ──→ CS201 → CS301
     │                    ↑
     └────→ CS101 ───────┘

Valid orderings:
  [Math101, Math201, CS101, CS201, CS301]
  [Math101, CS101, Math201, CS201, CS301]
```

Multiple valid topological orderings can exist for the same graph.

---

## Approach 1: Kahn's Algorithm (BFS-Based)

Kahn's algorithm uses **in-degree** (number of incoming edges) to find vertices that have no dependencies.

### Steps

1. Compute the in-degree of every vertex.
2. Add all vertices with in-degree 0 to a queue.
3. While the queue is not empty:
   - Remove a vertex `u` from the queue, add it to the result.
   - For each neighbor `v` of `u`, decrement `v`'s in-degree.
   - If `v`'s in-degree becomes 0, add `v` to the queue.
4. If the result contains all vertices, it's a valid topological order. Otherwise, a cycle exists.

### Trace

```
Graph: 5 → 0, 5 → 2, 4 → 0, 4 → 1, 2 → 3, 3 → 1

Adjacency list:
  5: [0, 2]
  4: [0, 1]
  2: [3]
  3: [1]
  0: []
  1: []

In-degrees: {0:2, 1:2, 2:1, 3:1, 4:0, 5:0}

Step 1: Queue = [4, 5]  (in-degree 0)

Step 2: Process 4 → result=[4]
  Decrement 0 → in-degree[0]=1
  Decrement 1 → in-degree[1]=1
  Queue = [5]

Step 3: Process 5 → result=[4, 5]
  Decrement 0 → in-degree[0]=0  → add 0 to queue
  Decrement 2 → in-degree[2]=0  → add 2 to queue
  Queue = [0, 2]

Step 4: Process 0 → result=[4, 5, 0]
  Queue = [2]

Step 5: Process 2 → result=[4, 5, 0, 2]
  Decrement 3 → in-degree[3]=0  → add 3 to queue
  Queue = [3]

Step 6: Process 3 → result=[4, 5, 0, 2, 3]
  Decrement 1 → in-degree[1]=0  → add 1 to queue
  Queue = [1]

Step 7: Process 1 → result=[4, 5, 0, 2, 3, 1]

All 6 vertices included → valid topological order!
```

---

## Approach 2: DFS-Based

Use DFS and push a vertex onto a stack **after** all its descendants have been visited. The stack (reversed) gives the topological order.

### Steps

1. For each unvisited vertex, run DFS.
2. In DFS, mark the vertex as visited, recurse on all neighbors.
3. After processing all neighbors, push the vertex onto a stack.
4. Pop all vertices from the stack → topological order.

### Trace

```
Graph: 5 → 0, 5 → 2, 4 → 0, 4 → 1, 2 → 3, 3 → 1

DFS from 5:
  Visit 5 → Visit 0 (leaf, push 0) → Visit 2 → Visit 3 → Visit 1 (leaf, push 1)
  Push 3, Push 2, Push 5

DFS from 4:
  Visit 4 → 0 already visited, 1 already visited
  Push 4

Stack (top to bottom): [4, 5, 2, 3, 1, 0]
Result: [4, 5, 2, 3, 1, 0]  ← valid topological order
```

---

## Implementation: Kahn's Algorithm (BFS)

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> topologicalSortBFS(int V, vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);

    // Compute in-degrees
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) {
            inDegree[v]++;
        }
    }

    // Add all vertices with in-degree 0 to queue
    queue<int> q;
    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) {
            q.push(i);
        }
    }

    vector<int> result;

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);

        for (int v : adj[u]) {
            inDegree[v]--;
            if (inDegree[v] == 0) {
                q.push(v);
            }
        }
    }

    // If result doesn't contain all vertices, cycle exists
    if ((int)result.size() != V) {
        return {}; // cycle detected
    }

    return result;
}

int main() {
    int V = 6;
    vector<vector<int>> adj(V);
    adj[5] = {0, 2};
    adj[4] = {0, 1};
    adj[2] = {3};
    adj[3] = {1};

    vector<int> order = topologicalSortBFS(V, adj);

    cout << "Topological Order: ";
    for (int v : order) {
        cout << v << " ";
    }
    cout << endl;

    return 0;
}
```

```java
import java.util.*;

public class TopologicalSort {
    public static List<Integer> topologicalSortBFS(int V, List<List<Integer>> adj) {
        int[] inDegree = new int[V];

        // Compute in-degrees
        for (int u = 0; u < V; u++) {
            for (int v : adj.get(u)) {
                inDegree[v]++;
            }
        }

        // Add all vertices with in-degree 0 to queue
        Queue<Integer> queue = new LinkedList<>();
        for (int i = 0; i < V; i++) {
            if (inDegree[i] == 0) {
                queue.add(i);
            }
        }

        List<Integer> result = new ArrayList<>();

        while (!queue.isEmpty()) {
            int u = queue.poll();
            result.add(u);

            for (int v : adj.get(u)) {
                inDegree[v]--;
                if (inDegree[v] == 0) {
                    queue.add(v);
                }
            }
        }

        if (result.size() != V) {
            return Collections.emptyList(); // cycle detected
        }

        return result;
    }

    public static void main(String[] args) {
        int V = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        adj.get(5).addAll(Arrays.asList(0, 2));
        adj.get(4).addAll(Arrays.asList(0, 1));
        adj.get(2).add(3);
        adj.get(3).add(1);

        List<Integer> order = topologicalSortBFS(V, adj);
        System.out.println("Topological Order: " + order);
    }
}
```

```python
from collections import deque

def topological_sort_bfs(V, adj):
    in_degree = [0] * V

    # Compute in-degrees
    for u in range(V):
        for v in adj[u]:
            in_degree[v] += 1

    # Add all vertices with in-degree 0 to queue
    queue = deque()
    for i in range(V):
        if in_degree[i] == 0:
            queue.append(i)

    result = []

    while queue:
        u = queue.popleft()
        result.append(u)

        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)

    # If result doesn't contain all vertices, cycle exists
    if len(result) != V:
        return []  # cycle detected

    return result


# Example usage
V = 6
adj = [[] for _ in range(V)]
adj[5] = [0, 2]
adj[4] = [0, 1]
adj[2] = [3]
adj[3] = [1]

order = topological_sort_bfs(V, adj)
print("Topological Order:", order)
```

```javascript
function topologicalSortBFS(V, adj) {
  const inDegree = new Array(V).fill(0);

  // Compute in-degrees
  for (let u = 0; u < V; u++) {
    for (const v of adj[u]) {
      inDegree[v]++;
    }
  }

  // Add all vertices with in-degree 0 to queue
  const queue = [];
  for (let i = 0; i < V; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  const result = [];
  let front = 0;

  while (front < queue.length) {
    const u = queue[front++];
    result.push(u);

    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }

  // If result doesn't contain all vertices, cycle exists
  if (result.length !== V) {
    return []; // cycle detected
  }

  return result;
}

// Example usage
const V = 6;
const adj = Array.from({ length: V }, () => []);
adj[5] = [0, 2];
adj[4] = [0, 1];
adj[2] = [3];
adj[3] = [1];

const order = topologicalSortBFS(V, adj);
console.log("Topological Order:", order);
```

---

## Implementation: DFS-Based

```cpp
#include <iostream>
#include <vector>
#include <stack>
using namespace std;

void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited, stack<int>& st) {
    visited[u] = true;
    for (int v : adj[u]) {
        if (!visited[v]) {
            dfs(v, adj, visited, st);
        }
    }
    st.push(u); // push after all descendants are processed
}

vector<int> topologicalSortDFS(int V, vector<vector<int>>& adj) {
    vector<bool> visited(V, false);
    stack<int> st;

    for (int i = 0; i < V; i++) {
        if (!visited[i]) {
            dfs(i, adj, visited, st);
        }
    }

    vector<int> result;
    while (!st.empty()) {
        result.push_back(st.top());
        st.pop();
    }

    return result;
}

int main() {
    int V = 6;
    vector<vector<int>> adj(V);
    adj[5] = {0, 2};
    adj[4] = {0, 1};
    adj[2] = {3};
    adj[3] = {1};

    vector<int> order = topologicalSortDFS(V, adj);

    cout << "Topological Order: ";
    for (int v : order) {
        cout << v << " ";
    }
    cout << endl;

    return 0;
}
```

```java
import java.util.*;

public class TopologicalSortDFS {
    private static void dfs(int u, List<List<Integer>> adj,
                            boolean[] visited, Deque<Integer> stack) {
        visited[u] = true;
        for (int v : adj.get(u)) {
            if (!visited[v]) {
                dfs(v, adj, visited, stack);
            }
        }
        stack.push(u); // push after all descendants are processed
    }

    public static List<Integer> topologicalSortDFS(int V, List<List<Integer>> adj) {
        boolean[] visited = new boolean[V];
        Deque<Integer> stack = new ArrayDeque<>();

        for (int i = 0; i < V; i++) {
            if (!visited[i]) {
                dfs(i, adj, visited, stack);
            }
        }

        List<Integer> result = new ArrayList<>();
        while (!stack.isEmpty()) {
            result.add(stack.pop());
        }

        return result;
    }

    public static void main(String[] args) {
        int V = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());

        adj.get(5).addAll(Arrays.asList(0, 2));
        adj.get(4).addAll(Arrays.asList(0, 1));
        adj.get(2).add(3);
        adj.get(3).add(1);

        List<Integer> order = topologicalSortDFS(V, adj);
        System.out.println("Topological Order: " + order);
    }
}
```

```python
def topological_sort_dfs(V, adj):
    visited = [False] * V
    stack = []

    def dfs(u):
        visited[u] = True
        for v in adj[u]:
            if not visited[v]:
                dfs(v)
        stack.append(u)  # push after all descendants are processed

    for i in range(V):
        if not visited[i]:
            dfs(i)

    return stack[::-1]  # reverse the stack


# Example usage
V = 6
adj = [[] for _ in range(V)]
adj[5] = [0, 2]
adj[4] = [0, 1]
adj[2] = [3]
adj[3] = [1]

order = topological_sort_dfs(V, adj)
print("Topological Order:", order)
```

```javascript
function topologicalSortDFS(V, adj) {
  const visited = new Array(V).fill(false);
  const stack = [];

  function dfs(u) {
    visited[u] = true;
    for (const v of adj[u]) {
      if (!visited[v]) {
        dfs(v);
      }
    }
    stack.push(u); // push after all descendants are processed
  }

  for (let i = 0; i < V; i++) {
    if (!visited[i]) {
      dfs(i);
    }
  }

  return stack.reverse();
}

// Example usage
const V = 6;
const adj = Array.from({ length: V }, () => []);
adj[5] = [0, 2];
adj[4] = [0, 1];
adj[2] = [3];
adj[3] = [1];

const order = topologicalSortDFS(V, adj);
console.log("Topological Order:", order);
```

---

## Complexity Analysis

| Approach | Time | Space |
|----------|------|-------|
| Kahn's (BFS) | O(V + E) | O(V) |
| DFS-based | O(V + E) | O(V) |

Both approaches visit every vertex and edge exactly once.

---

## Comparing the Two Approaches

| Feature | Kahn's (BFS) | DFS-based |
|---------|--------------|-----------|
| Cycle detection | Built-in (result size < V) | Needs extra tracking (back-edge detection) |
| Lexicographic order | Use a min-heap instead of queue | Harder to achieve |
| Implementation | Iterative | Recursive (or explicit stack) |
| Unique ordering | Easier to enforce constraints | Less flexible |

---

## Applications

1. **Build systems** — Compile source files in dependency order (Make, Gradle, Bazel).
2. **Package managers** — Install dependencies before the packages that need them (npm, apt).
3. **Task scheduling** — Order tasks so that prerequisites finish first.
4. **Course planning** — Determine a valid sequence of courses given prerequisites.
5. **Data processing pipelines** — Execute stages in correct order (Apache Airflow).
6. **Spreadsheet evaluation** — Calculate cells in order of formula dependencies.

---

## Common Pitfalls

- **Forgetting the DAG requirement** — Always check for cycles before assuming a valid ordering.
- **Not handling disconnected graphs** — Make sure to start DFS/BFS from all unvisited vertices.
- **Confusing with simple sorting** — Topological sort orders vertices by dependency, not by value.

---

## Summary

- Topological sort orders DAG vertices so dependencies come first.
- **Kahn's algorithm** (BFS): use in-degree, great for cycle detection.
- **DFS approach**: post-order + reverse, elegant but cycle detection needs extra work.
- Both run in O(V + E) time.

---

Next: **Dijkstra's Algorithm →**
