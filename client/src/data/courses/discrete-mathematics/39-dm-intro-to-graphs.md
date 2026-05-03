---
title: Introduction to Graphs
---

# Introduction to Graphs

Graphs are one of the most versatile and powerful structures in discrete mathematics. They model relationships between objects and appear everywhere — from social networks to computer networks, from road maps to molecular structures. In this lesson, we'll build a solid foundation of graph terminology and concepts.

---

## What Is a Graph?

A **graph** is a mathematical structure used to model pairwise relationships between objects. Formally, a graph is defined as:

$$G = (V, E)$$

where:

- $V$ is a finite, non-empty set of **vertices** (also called **nodes**)
- $E$ is a set of **edges** (also called **links** or **connections**) that connect pairs of vertices

Each edge represents a relationship or connection between two vertices. For example, in a social network graph, vertices represent people and edges represent friendships.

### Example

Consider a graph with:

- $V = \{A, B, C, D\}$
- $E = \{\{A, B\}, \{A, C\}, \{B, D\}, \{C, D\}\}$

This graph has 4 vertices and 4 edges. Vertex $A$ is connected to $B$ and $C$, vertex $B$ is connected to $A$ and $D$, and so on.

---

## Vertices and Edges

### Vertices (Nodes)

A **vertex** is a fundamental unit of a graph. It represents an entity or object. We typically label vertices with letters ($A, B, C, \ldots$) or numbers ($0, 1, 2, \ldots$).

The number of vertices in a graph is called the **order** of the graph:

$$|V| = n$$

### Edges (Connections)

An **edge** connects two vertices. In an undirected graph, an edge between vertices $u$ and $v$ is written as $\{u, v\}$ (an unordered pair). In a directed graph, it's written as $(u, v)$ (an ordered pair).

The number of edges in a graph is called the **size** of the graph:

$$|E| = m$$

---

## Directed vs Undirected Graphs

### Undirected Graphs

In an **undirected graph**, edges have no direction. The edge $\{u, v\}$ is the same as $\{v, u\}$. If $A$ is friends with $B$, then $B$ is also friends with $A$.

**Real-world examples:**
- Facebook friendships (mutual)
- Road networks with two-way streets
- Chemical bonds between atoms

### Directed Graphs (Digraphs)

In a **directed graph** (or **digraph**), each edge has a direction. The edge $(u, v)$ goes **from** $u$ **to** $v$, and is different from $(v, u)$. We often draw directed edges as arrows.

**Real-world examples:**
- Twitter follows (A follows B doesn't mean B follows A)
- Web page hyperlinks
- Prerequisites in a course schedule
- One-way streets

### Key Difference

| Property | Undirected | Directed |
|----------|-----------|----------|
| Edge notation | $\{u, v\}$ | $(u, v)$ |
| Symmetry | $\{u, v\} = \{v, u\}$ | $(u, v) \neq (v, u)$ |
| Max edges (simple) | $\frac{n(n-1)}{2}$ | $n(n-1)$ |
| Visual | Lines | Arrows |

---

## Weighted vs Unweighted Graphs

### Unweighted Graphs

In an **unweighted graph**, all edges are treated equally. There is no cost or distance associated with traversing an edge. We only care about whether a connection exists or not.

### Weighted Graphs

In a **weighted graph**, each edge $e$ has an associated numerical value $w(e)$ called its **weight**. Weights can represent:

- **Distance** (road networks)
- **Cost** (shipping routes)
- **Capacity** (network bandwidth)
- **Time** (flight durations)
- **Probability** (state transitions)

Formally, a weighted graph is a triple $G = (V, E, w)$ where $w: E \to \mathbb{R}$ is a weight function.

### Example

In a road network:
- Vertices = cities
- Edges = roads connecting cities
- Weights = distances in kilometers

The edge from City A to City B might have weight 150, meaning they are 150 km apart.

---

## Simple Graphs vs Multigraphs

### Simple Graphs

A **simple graph** has:
- No **self-loops** (an edge from a vertex to itself)
- No **multiple edges** (at most one edge between any pair of vertices)

Most theoretical discussions assume simple graphs unless stated otherwise.

### Multigraphs

A **multigraph** allows:
- **Multiple edges** (also called **parallel edges**) between the same pair of vertices

For example, two cities might be connected by multiple different roads (highway, local road, etc.).

### Pseudographs

A **pseudograph** allows both:
- Multiple edges
- Self-loops

### Summary Table

| Type | Self-loops | Multiple edges |
|------|-----------|----------------|
| Simple graph | No | No |
| Multigraph | No | Yes |
| Pseudograph | Yes | Yes |

---

## Degree of a Vertex

The **degree** of a vertex $v$, denoted $\deg(v)$, is the number of edges incident to $v$. In simpler terms, it's the number of connections a vertex has.

### Examples

If vertex $A$ is connected to vertices $B$, $C$, and $D$, then:

$$\deg(A) = 3$$

A vertex with degree 0 is called an **isolated vertex** (no connections). A vertex with degree 1 is called a **pendant vertex** or **leaf**.

### The Handshaking Lemma

One of the most fundamental results in graph theory is the **Handshaking Lemma**:

$$\sum_{v \in V} \deg(v) = 2|E|$$

**Why?** Every edge contributes exactly 2 to the total degree count — one for each of its endpoints. Think of it like a handshake: each handshake involves exactly two hands.

### Consequences of the Handshaking Lemma

1. **The sum of all degrees is always even.** Since $2|E|$ is always even, the sum of degrees must be even too.

2. **The number of vertices with odd degree is always even.** (Because an odd number of odd values can't sum to an even number.)

### Example Calculation

Consider a graph with vertices $\{A, B, C, D, E\}$ and edges:
$\{A,B\}, \{A,C\}, \{A,D\}, \{B,C\}, \{D,E\}$

- $\deg(A) = 3$
- $\deg(B) = 2$
- $\deg(C) = 2$
- $\deg(D) = 2$
- $\deg(E) = 1$

Sum of degrees $= 3 + 2 + 2 + 2 + 1 = 10 = 2 \times 5 = 2|E|$ ✓

---

## In-Degree and Out-Degree for Digraphs

In directed graphs, we distinguish between incoming and outgoing edges:

- **In-degree** of $v$, denoted $\deg^{-}(v)$: the number of edges **coming into** $v$
- **Out-degree** of $v$, denoted $\deg^{+}(v)$: the number of edges **going out of** $v$

### Directed Handshaking Lemma

For directed graphs:

$$\sum_{v \in V} \deg^{-}(v) = \sum_{v \in V} \deg^{+}(v) = |E|$$

Every directed edge contributes 1 to the out-degree of its source and 1 to the in-degree of its destination.

### Example

Consider a directed graph with edges: $(A, B), (A, C), (B, C), (C, A)$

| Vertex | In-degree | Out-degree |
|--------|-----------|------------|
| $A$ | 1 | 2 |
| $B$ | 1 | 1 |
| $C$ | 2 | 1 |
| **Sum** | **4** | **4** |

Both sums equal $|E| = 4$ ✓

### Practical Interpretation

- A web page with high **in-degree** has many pages linking to it (popular page)
- A web page with high **out-degree** has many outgoing links (hub page)
- On Twitter, **in-degree** = number of followers, **out-degree** = number of people you follow

---

## Common Graph Examples

Graphs appear in countless real-world scenarios:

### 1. Social Networks

- **Vertices**: People or accounts
- **Edges**: Friendships, follows, or interactions
- Facebook (undirected), Twitter/Instagram (directed)

### 2. Road Maps and Transportation

- **Vertices**: Intersections or cities
- **Edges**: Roads or routes
- **Weights**: Distances, travel times, or tolls
- GPS navigation uses weighted directed graphs

### 3. The World Wide Web

- **Vertices**: Web pages
- **Edges**: Hyperlinks (directed)
- Google's PageRank algorithm operates on this graph

### 4. Computer Networks

- **Vertices**: Devices (computers, routers, switches)
- **Edges**: Network connections
- **Weights**: Bandwidth or latency

### 5. Dependency Graphs

- **Vertices**: Tasks, modules, or courses
- **Edges**: Dependencies (directed)
- Package managers (npm, pip) use these to resolve installation order

### 6. Molecular Structures

- **Vertices**: Atoms
- **Edges**: Chemical bonds
- Used in computational chemistry and drug discovery

### 7. Game States

- **Vertices**: Possible game states
- **Edges**: Valid moves (directed)
- Chess engines explore this graph to find optimal moves

---

## Essential Graph Terminology

Let's consolidate all the important terms:

### Adjacency

Two vertices $u$ and $v$ are **adjacent** (or **neighbors**) if there exists an edge connecting them. We write $u \sim v$.

### Incidence

A vertex $v$ is **incident** to an edge $e$ if $v$ is one of the endpoints of $e$. Similarly, the edge $e$ is incident to vertex $v$.

### Loop (Self-loop)

A **loop** is an edge that connects a vertex to itself: $\{v, v\}$. Loops contribute 2 to the degree of the vertex (by convention).

### Isolated Vertex

An **isolated vertex** has degree 0 — it is not connected to any other vertex.

### Pendant Vertex (Leaf)

A **pendant vertex** has degree exactly 1 — it is connected to exactly one other vertex.

### Path

A **path** is a sequence of distinct vertices $v_1, v_2, \ldots, v_k$ where each consecutive pair is connected by an edge. The **length** of a path is the number of edges it contains ($k - 1$).

### Cycle

A **cycle** is a path that starts and ends at the same vertex, with no other repeated vertices. A cycle of length $k$ is denoted $C_k$.

### Connected Graph

An undirected graph is **connected** if there exists a path between every pair of vertices. If not connected, it consists of multiple **connected components**.

### Complete Graph

A **complete graph** $K_n$ is a simple graph where every pair of distinct vertices is connected by an edge. It has:

$$|E| = \binom{n}{2} = \frac{n(n-1)}{2}$$

### Subgraph

A graph $H = (V', E')$ is a **subgraph** of $G = (V, E)$ if $V' \subseteq V$ and $E' \subseteq E$.

### Bipartite Graph

A graph is **bipartite** if its vertices can be divided into two disjoint sets $U$ and $W$ such that every edge connects a vertex in $U$ to a vertex in $W$. No edge connects two vertices within the same set.

---

## Special Named Graphs

| Graph | Notation | Description |
|-------|----------|-------------|
| Complete graph | $K_n$ | All pairs connected |
| Cycle | $C_n$ | Single cycle of $n$ vertices |
| Path graph | $P_n$ | Single path of $n$ vertices |
| Complete bipartite | $K_{m,n}$ | All cross-connections between two sets |
| Petersen graph | — | Famous 3-regular graph with 10 vertices |
| Star graph | $S_n$ | One center connected to $n$ leaves |

---

## Checking Your Understanding

**Question 1:** A graph has 6 vertices, each with degree 4. How many edges does it have?

Using the Handshaking Lemma:
$$\sum \deg(v) = 6 \times 4 = 24 = 2|E|$$
$$|E| = 12$$

**Question 2:** Can a graph with 5 vertices have all vertices with odd degree?

Yes! The number of odd-degree vertices must be even, and 0 is even (none) or we could have 2 or 4 odd-degree vertices. But wait — can all 5 have odd degree? No! 5 is odd, so we can't have all 5 with odd degree (since the count of odd-degree vertices must be even).

**Question 3:** In a directed graph with 7 edges, what is the sum of all in-degrees?

By the directed handshaking lemma: $\sum \deg^{-}(v) = |E| = 7$.

---

## Key Takeaways

1. A **graph** $G = (V, E)$ consists of vertices and edges modeling pairwise relationships.

2. Graphs can be **directed** (edges have direction) or **undirected** (edges are symmetric).

3. Graphs can be **weighted** (edges have numerical values) or **unweighted**.

4. **Simple graphs** have no loops or parallel edges; **multigraphs** and **pseudographs** relax these constraints.

5. The **degree** of a vertex counts its connections. The **Handshaking Lemma** states $\sum \deg(v) = 2|E|$.

6. In directed graphs, **in-degree** counts incoming edges and **out-degree** counts outgoing edges, with $\sum \deg^{-}(v) = \sum \deg^{+}(v) = |E|$.

7. Graphs model real-world systems: social networks, road maps, web links, dependencies, and more.

8. Key terminology includes: adjacent, incident, loop, path, cycle, connected, complete, and bipartite.

9. The number of vertices with **odd degree** is always **even** — a direct consequence of the Handshaking Lemma.

10. Understanding graph basics is essential before studying graph algorithms (BFS, DFS, shortest paths, spanning trees).
