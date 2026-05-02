---
title: Breadth-First Search
---

# Breadth-First Search (BFS)

**Breadth-First Search** explores a graph level by level, visiting all neighbors of the current vertex before moving deeper. It uses a **queue** (FIFO) and is the go-to algorithm for finding the **shortest path in an unweighted graph**.

---

## Core Idea

1. Start at a source vertex, mark it visited, enqueue it.
2. Dequeue a vertex, process it, and enqueue all its unvisited neighbors.
3. Repeat until the queue is empty.

```
Think of it like dropping a stone in water — ripples expand outward
in concentric circles (levels).

Level 0:  source
Level 1:  all direct neighbors of source
Level 2:  neighbors of level-1 vertices (not already visited)
...
```

---

## Step-by-Step Trace

```
Graph:
    0 --- 1 --- 4
    |     |
    2 --- 3

BFS starting from vertex 0:

Step 1: Queue = [0]         Visited = {0}
Step 2: Dequeue 0           Visit neighbors: 1, 2
        Queue = [1, 2]      Visited = {0, 1, 2}
Step 3: Dequeue 1           Visit neighbors: 4, 3 (0 already visited)
        Queue = [2, 4, 3]   Visited = {0, 1, 2, 4, 3}
Step 4: Dequeue 2           Visit neighbors: (0, 3 already visited)
        Queue = [4, 3]      Visited = {0, 1, 2, 4, 3}
Step 5: Dequeue 4           Visit neighbors: (1 already visited)
        Queue = [3]         Visited = {0, 1, 2, 4, 3}
Step 6: Dequeue 3           Visit neighbors: (1, 2 already visited)
        Queue = []          Visited = {0, 1, 2, 4, 3}

BFS Order: 0, 1, 2, 4, 3

Level visualization:
  Level 0: [0]
  Level 1: [1, 2]
  Level 2: [4, 3]
```

---

## BFS Implementation

### C++

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> bfs(int source, const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<bool> visited(n, false);
    vector<int> order;
    queue<int> q;

    visited[source] = true;
    q.push(source);

    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        order.push_back(curr);

        for (int neighbor : adj[curr]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }

    return order;
}

int main() {
    int n = 5;
    vector<vector<int>> adj(n);

    // Build graph
    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    addEdge(0, 1);
    addEdge(0, 2);
    addEdge(1, 3);
    addEdge(1, 4);
    addEdge(2, 3);

    cout << "BFS from vertex 0: ";
    for (int v : bfs(0, adj)) {
        cout << v << " ";
    }
    cout << endl;

    return 0;
}
```

### Java

```java
import java.util.*;

public class BFS {
    public static List<Integer> bfs(int source, List<List<Integer>> adj) {
        int n = adj.size();
        boolean[] visited = new boolean[n];
        List<Integer> order = new ArrayList<>();
        Queue<Integer> queue = new LinkedList<>();

        visited[source] = true;
        queue.offer(source);

        while (!queue.isEmpty()) {
            int curr = queue.poll();
            order.add(curr);

            for (int neighbor : adj.get(curr)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.offer(neighbor);
                }
            }
        }

        return order;
    }

    public static void main(String[] args) {
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        // Build graph
        int[][] edges = {{0,1}, {0,2}, {1,3}, {1,4}, {2,3}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        System.out.println("BFS from vertex 0: " + bfs(0, adj));
    }
}
```

### Python

```python
from collections import deque

def bfs(source, adj):
    n = len(adj)
    visited = [False] * n
    order = []
    queue = deque([source])
    visited[source] = True

    while queue:
        curr = queue.popleft()
        order.append(curr)

        for neighbor in adj[curr]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append(neighbor)

    return order


# Build graph
n = 5
adj = [[] for _ in range(n)]
edges = [(0, 1), (0, 2), (1, 3), (1, 4), (2, 3)]

for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

print("BFS from vertex 0:", bfs(0, adj))
```

### JavaScript

```javascript
function bfs(source, adj) {
  const n = adj.length;
  const visited = new Array(n).fill(false);
  const order = [];
  const queue = [source];
  visited[source] = true;

  while (queue.length > 0) {
    const curr = queue.shift();
    order.push(curr);

    for (const neighbor of adj[curr]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }

  return order;
}

// Build graph
const n = 5;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [0,2], [1,3], [1,4], [2,3]];

for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

console.log("BFS from vertex 0:", bfs(0, adj));
```

**Output:** `BFS from vertex 0: [0, 1, 2, 3, 4]`

---

## Shortest Path in Unweighted Graph

BFS naturally finds the shortest path (minimum number of edges) from the source to every reachable vertex.

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

vector<int> shortestPath(int source, const vector<vector<int>>& adj) {
    int n = adj.size();
    vector<int> dist(n, -1); // -1 means unreachable
    queue<int> q;

    dist[source] = 0;
    q.push(source);

    while (!q.empty()) {
        int curr = q.front();
        q.pop();

        for (int neighbor : adj[curr]) {
            if (dist[neighbor] == -1) {
                dist[neighbor] = dist[curr] + 1;
                q.push(neighbor);
            }
        }
    }

    return dist;
}

int main() {
    int n = 6;
    vector<vector<int>> adj(n);
    auto addEdge = [&](int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    };

    addEdge(0, 1); addEdge(0, 2);
    addEdge(1, 3); addEdge(2, 3);
    addEdge(3, 4); addEdge(4, 5);

    vector<int> dist = shortestPath(0, adj);
    for (int i = 0; i < n; i++) {
        cout << "Distance from 0 to " << i << " = " << dist[i] << endl;
    }
    return 0;
}
```

```java
import java.util.*;

public class ShortestPathBFS {
    public static int[] shortestPath(int source, List<List<Integer>> adj) {
        int n = adj.size();
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        Queue<Integer> queue = new LinkedList<>();

        dist[source] = 0;
        queue.offer(source);

        while (!queue.isEmpty()) {
            int curr = queue.poll();
            for (int neighbor : adj.get(curr)) {
                if (dist[neighbor] == -1) {
                    dist[neighbor] = dist[curr] + 1;
                    queue.offer(neighbor);
                }
            }
        }

        return dist;
    }

    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

        int[][] edges = {{0,1}, {0,2}, {1,3}, {2,3}, {3,4}, {4,5}};
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }

        int[] dist = shortestPath(0, adj);
        for (int i = 0; i < n; i++) {
            System.out.println("Distance from 0 to " + i + " = " + dist[i]);
        }
    }
}
```

```python
from collections import deque

def shortest_path(source, adj):
    n = len(adj)
    dist = [-1] * n  # -1 means unreachable
    dist[source] = 0
    queue = deque([source])

    while queue:
        curr = queue.popleft()
        for neighbor in adj[curr]:
            if dist[neighbor] == -1:
                dist[neighbor] = dist[curr] + 1
                queue.append(neighbor)

    return dist


n = 6
adj = [[] for _ in range(n)]
edges = [(0, 1), (0, 2), (1, 3), (2, 3), (3, 4), (4, 5)]

for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)

dist = shortest_path(0, adj)
for i in range(n):
    print(f"Distance from 0 to {i} = {dist[i]}")
```

```javascript
function shortestPath(source, adj) {
  const n = adj.length;
  const dist = new Array(n).fill(-1);
  const queue = [source];
  dist[source] = 0;

  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of adj[curr]) {
      if (dist[neighbor] === -1) {
        dist[neighbor] = dist[curr] + 1;
        queue.push(neighbor);
      }
    }
  }

  return dist;
}

const n = 6;
const adj = Array.from({ length: n }, () => []);
const edges = [[0,1], [0,2], [1,3], [2,3], [3,4], [4,5]];

for (const [u, v] of edges) {
  adj[u].push(v);
  adj[v].push(u);
}

const dist = shortestPath(0, adj);
for (let i = 0; i < n; i++) {
  console.log(`Distance from 0 to ${i} = ${dist[i]}`);
}
```

**Output:**
```
Distance from 0 to 0 = 0
Distance from 0 to 1 = 1
Distance from 0 to 2 = 1
Distance from 0 to 3 = 2
Distance from 0 to 4 = 3
Distance from 0 to 5 = 4
```

---

## BFS on a Grid (2D Matrix)

Grids are implicit graphs. Each cell connects to its 4 (or 8) neighbors.

**Problem:** Find the shortest path from top-left to bottom-right in a grid where `0` = passable and `1` = wall.

```
Grid:
  0 0 0 1
  1 1 0 1
  0 0 0 0
  0 1 1 0

Path (shortest = 7 steps):
  S → → .
  . . ↓ .
  . . ↓ →
  . . . D
```

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int bfsGrid(vector<vector<int>>& grid) {
    int rows = grid.size(), cols = grid[0].size();
    if (grid[0][0] == 1 || grid[rows - 1][cols - 1] == 1) return -1;

    vector<vector<int>> dist(rows, vector<int>(cols, -1));
    queue<pair<int, int>> q;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};

    dist[0][0] = 0;
    q.push({0, 0});

    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();

        for (int d = 0; d < 4; d++) {
            int nr = r + dx[d];
            int nc = c + dy[d];

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                && grid[nr][nc] == 0 && dist[nr][nc] == -1) {
                dist[nr][nc] = dist[r][c] + 1;
                q.push({nr, nc});
            }
        }
    }

    return dist[rows - 1][cols - 1];
}

int main() {
    vector<vector<int>> grid = {
        {0, 0, 0, 1},
        {1, 1, 0, 1},
        {0, 0, 0, 0},
        {0, 1, 1, 0}
    };

    int result = bfsGrid(grid);
    cout << "Shortest path length: " << result << endl; // 7
    return 0;
}
```

```java
import java.util.*;

public class BFSGrid {
    public static int bfsGrid(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        if (grid[0][0] == 1 || grid[rows - 1][cols - 1] == 1) return -1;

        int[][] dist = new int[rows][cols];
        for (int[] row : dist) Arrays.fill(row, -1);

        int[] dx = {0, 0, 1, -1};
        int[] dy = {1, -1, 0, 0};

        Queue<int[]> queue = new LinkedList<>();
        dist[0][0] = 0;
        queue.offer(new int[]{0, 0});

        while (!queue.isEmpty()) {
            int[] cell = queue.poll();
            int r = cell[0], c = cell[1];

            for (int d = 0; d < 4; d++) {
                int nr = r + dx[d];
                int nc = c + dy[d];

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
                    && grid[nr][nc] == 0 && dist[nr][nc] == -1) {
                    dist[nr][nc] = dist[r][c] + 1;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }

        return dist[rows - 1][cols - 1];
    }

    public static void main(String[] args) {
        int[][] grid = {
            {0, 0, 0, 1},
            {1, 1, 0, 1},
            {0, 0, 0, 0},
            {0, 1, 1, 0}
        };

        System.out.println("Shortest path length: " + bfsGrid(grid)); // 7
    }
}
```

```python
from collections import deque

def bfs_grid(grid):
    rows, cols = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[rows - 1][cols - 1] == 1:
        return -1

    dist = [[-1] * cols for _ in range(rows)]
    dist[0][0] = 0
    queue = deque([(0, 0)])

    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    while queue:
        r, c = queue.popleft()

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols \
               and grid[nr][nc] == 0 and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                queue.append((nr, nc))

    return dist[rows - 1][cols - 1]


grid = [
    [0, 0, 0, 1],
    [1, 1, 0, 1],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
]

print("Shortest path length:", bfs_grid(grid))  # 7
```

```javascript
function bfsGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  if (grid[0][0] === 1 || grid[rows - 1][cols - 1] === 1) return -1;

  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  const queue = [[0, 0]];
  dist[0][0] = 0;

  const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
          && grid[nr][nc] === 0 && dist[nr][nc] === -1) {
        dist[nr][nc] = dist[r][c] + 1;
        queue.push([nr, nc]);
      }
    }
  }

  return dist[rows - 1][cols - 1];
}

const grid = [
  [0, 0, 0, 1],
  [1, 1, 0, 1],
  [0, 0, 0, 0],
  [0, 1, 1, 0],
];

console.log("Shortest path length:", bfsGrid(grid)); // 7
```

---

## Time and Space Complexity

| | Complexity |
|---|---|
| **Time** | O(V + E) — each vertex and edge is processed once |
| **Space** | O(V) — for the visited array and queue |

For grids: V = rows × cols, E ≤ 4 × V, so **O(rows × cols)**.

---

## When to Use BFS

- **Shortest path in unweighted graph** — BFS guarantees minimum edges.
- **Level-order traversal** — process nodes layer by layer.
- **Finding connected components** — run BFS from each unvisited node.
- **Checking bipartiteness** — color nodes by level; conflict = not bipartite.
- **Multi-source BFS** — start with multiple sources in the queue (e.g., "rotten oranges" problem).

---

## Common Mistakes

1. **Forgetting to mark visited before enqueueing** — leads to duplicate processing and TLE.
2. **Marking visited when dequeuing instead of enqueueing** — causes the same node to be added multiple times.
3. **Using BFS for weighted graphs** — BFS only works for unweighted shortest paths. Use Dijkstra for weighted.

---

## Key Takeaways

1. BFS uses a **queue** and explores level by level.
2. It finds the **shortest path** (fewest edges) in unweighted graphs.
3. Time complexity: **O(V + E)**.
4. Mark nodes visited **when enqueueing**, not when dequeuing.
5. Works on grids by treating cells as vertices and valid moves as edges.

---

Next: **Depth-First Search →**
