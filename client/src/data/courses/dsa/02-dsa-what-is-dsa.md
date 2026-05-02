---
title: What is DSA?
---

# What is DSA?

**DSA** stands for **Data Structures and Algorithms**. It is the study of how to organize data and how to solve problems step by step.

- A **data structure** is a way of storing and organizing data so it can be accessed and modified efficiently.
- An **algorithm** is a finite sequence of well-defined instructions to solve a specific problem or perform a computation.

Together, they determine how fast your program runs and how much memory it uses.

## Why DSA matters

Every piece of software relies on DSA, whether the developer realizes it or not:

| Real-world task | Data structure | Algorithm |
|---|---|---|
| Autocomplete in a search bar | Trie | Prefix search |
| GPS navigation | Graph | Dijkstra's shortest path |
| Undo/Redo in a text editor | Stack | Push / Pop |
| Social media news feed | Heap (priority queue) | Sorting by relevance |
| Database indexing | B-Tree | Binary search |
| Spell checker | Hash set | Lookup |

Choosing the **wrong** data structure or algorithm can make your program 1,000× slower — or make it impossible to run at all on large inputs.

## Data structures overview

Data structures fall into two broad categories:

### Linear data structures

Data elements are arranged in a sequence, one after another.

- **Array** — fixed-size, contiguous block of memory; fast random access.
- **Linked List** — nodes connected by pointers; fast insertion/deletion.
- **Stack** — Last-In, First-Out (LIFO); think of a stack of plates.
- **Queue** — First-In, First-Out (FIFO); think of a line at a ticket counter.

### Non-linear data structures

Data elements are connected in hierarchical or networked relationships.

- **Tree** — a hierarchy with a root node and child nodes (e.g. file system).
- **Graph** — nodes connected by edges with no hierarchy (e.g. road map).
- **Hash Table** — maps keys to values for near-instant lookup.
- **Heap** — a special tree that keeps the minimum or maximum at the top.

## Algorithms overview

Algorithms are classified by the strategy they use:

- **Brute force** — try every possibility (simple but slow).
- **Divide and conquer** — break the problem in half, solve each half, combine (e.g. merge sort).
- **Greedy** — make the locally optimal choice at each step (e.g. coin change).
- **Dynamic programming** — solve overlapping subproblems once and cache results (e.g. Fibonacci).
- **Backtracking** — explore all paths and undo choices that lead to dead ends (e.g. Sudoku solver).
- **Graph algorithms** — traverse or find paths in graphs (BFS, DFS, Dijkstra).

## The relationship between DS and algorithms

A data structure without algorithms is just storage. An algorithm without the right data structure is slow. They work together:

```
Problem → Choose data structure → Design algorithm → Analyze complexity
```

For example, to find the shortest path between two cities:
1. **Data structure**: represent the road network as a **graph** (cities = nodes, roads = edges).
2. **Algorithm**: run **Dijkstra's algorithm** on that graph.
3. **Complexity**: runs in O(E log V) time where E is edges and V is vertices.

## What you need to succeed

- **Practice** — reading is not enough. Write the code. Run it. Break it. Fix it.
- **Patience** — some topics (recursion, DP) take time to click. That is normal.
- **Pen and paper** — draw the data structure. Trace the algorithm by hand. This builds deep understanding faster than staring at code.

Ready to set up your environment? Click **Setting Up →** to continue.
