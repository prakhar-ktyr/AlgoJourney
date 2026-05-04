---
title: Register Allocation
---

# Register Allocation

Register allocation is one of the most important phases of code generation. It maps an unlimited number of IR variables (virtual registers) to a limited set of physical machine registers.

---

## The Problem

During intermediate code generation, we assume unlimited temporary variables:

```c
t1 = a + b
t2 = c * d
t3 = t1 - t2
t4 = t3 + e
```

A real machine has a **fixed** number of registers (e.g., 16 general-purpose registers on x86-64). We must decide:

- Which variables go in registers?
- Which variables get **spilled** to memory?
- Can two variables share a register?

---

## Key Insight: Liveness

Two variables can share a register **only if** they are never live at the same time.

A variable is **live** at a point if its current value may be used in the future.

```
t1 = a + b       // t1 becomes live
t2 = c * d       // t2 becomes live, t1 still live
t3 = t1 - t2     // t1 and t2 die (last use), t3 becomes live
t4 = t3 + e      // t3 dies, t4 becomes live
```

Here `t1` and `t2` are live simultaneously — they need different registers. But `t1` and `t3` are never live together — they can share a register.

---

## Interference Graph

The **interference graph** captures which variables cannot share a register:

- **Nodes** = variables (virtual registers)
- **Edges** = connect variables that are live at the same time

```
Example interference graph:

    t1 --- t2
    |       |
    t4     t3
```

If two nodes are connected, they **must** be in different registers.

---

## Graph Coloring

Register allocation reduces to **graph coloring**:

- Each color represents a physical register
- Adjacent nodes must have different colors
- We need to color the graph with $k$ colors, where $k$ = number of available registers

$$
\text{If } \chi(G) \leq k, \text{ all variables fit in registers}
$$

where $\chi(G)$ is the chromatic number of the interference graph.

### Example: 3 Registers

```
Variables: a, b, c, d
Interference edges: (a,b), (a,c), (b,c), (c,d)

Graph:
  a --- b
  |   /
  |  /
  c --- d

Color with 3 colors (R1, R2, R3):
  a → R1
  b → R2
  c → R3
  d → R1  (d doesn't interfere with a)
```

Only 3 registers needed for 4 variables!

---

## Chaitin's Algorithm

George Chaitin developed the classic register allocation algorithm:

### Phase 1: Build

Perform liveness analysis and construct the interference graph.

### Phase 2: Simplify

Repeatedly remove nodes with degree < $k$ (fewer than $k$ neighbors):

- These nodes can always be colored
- Push removed nodes onto a stack

```
If degree(n) < k:
    Remove n from graph
    Push n onto stack
```

### Phase 3: Spill

If no node has degree < $k$:

- Choose a node to **spill** (store in memory instead of register)
- Remove it from the graph
- Continue simplifying

**Spill heuristics**: pick the variable that is:
- Used least frequently
- Has the longest live range
- Not inside a loop

### Phase 4: Select

Pop nodes from the stack and assign colors:

```
While stack is not empty:
    n = pop(stack)
    Assign n a color different from all its neighbors
```

### Complete Example

```python
def chaitin_allocate(graph, k):
    stack = []
    spilled = []
    
    # Simplify
    while graph has nodes:
        node = find_node_with_degree_less_than(graph, k)
        if node:
            stack.append(node)
            remove(graph, node)
        else:
            # Must spill
            victim = choose_spill_candidate(graph)
            spilled.append(victim)
            remove(graph, victim)
    
    # Select
    coloring = {}
    while stack:
        node = stack.pop()
        used_colors = {coloring[n] for n in neighbors(node) if n in coloring}
        for color in range(k):
            if color not in used_colors:
                coloring[node] = color
                break
    
    return coloring, spilled
```

---

## Spilling

When a variable is spilled, we insert **load** and **store** instructions:

```c
// Before spilling t2:
t1 = a + b
t2 = c * d
t3 = t1 - t2

// After spilling t2 to memory location [sp+8]:
t1 = a + b
store c * d → [sp+8]    // spill store
t3 = t1 - load([sp+8])  // spill load
```

Spilling increases code size and execution time — we want to minimize it.

---

## Linear Scan Register Allocation

A simpler alternative used in **JIT compilers** (where compilation speed matters):

### Algorithm

1. Compute live intervals for each variable: $[start, end]$
2. Sort intervals by start point
3. Walk through intervals in order, assigning registers

```python
def linear_scan(intervals, k):
    active = []  # currently active intervals
    registers = list(range(k))
    free_regs = list(range(k))
    allocation = {}
    
    # Sort by start point
    intervals.sort(key=lambda i: i.start)
    
    for interval in intervals:
        # Expire old intervals
        expire_old(active, interval.start, free_regs)
        
        if not free_regs:
            # Spill: evict the interval ending latest
            spill(active, interval, allocation)
        else:
            reg = free_regs.pop()
            allocation[interval.var] = reg
            active.append(interval)
            active.sort(key=lambda i: i.end)
    
    return allocation
```

### Comparison

| Feature | Graph Coloring | Linear Scan |
|---------|---------------|-------------|
| Quality | Better allocation | Good enough |
| Speed | $O(n^2)$ or worse | $O(n \log n)$ |
| Use case | Ahead-of-time compilers | JIT compilers |
| Spill decisions | More precise | Approximate |

---

## Register Coalescing

**Coalescing** eliminates unnecessary copy instructions by merging variables.

```c
// Before coalescing:
t1 = a + b
t2 = t1        // copy!
t3 = t2 * c

// After coalescing (merge t1 and t2):
t1 = a + b
t3 = t1 * c    // copy eliminated
```

### When Can We Coalesce?

Two variables connected by a copy can be coalesced if they **don't interfere**:

```
If (t1, t2) is a copy and (t1, t2) ∉ interference edges:
    Merge t1 and t2 into a single node
```

### Aggressive vs Conservative Coalescing

- **Aggressive**: coalesce whenever possible (may make graph harder to color)
- **Conservative** (Briggs): coalesce only if the merged node has fewer than $k$ high-degree neighbors

---

## Iterated Register Coalescing (IRC)

The state-of-the-art algorithm combines coalescing with Chaitin's approach:

```
Repeat:
    1. Build interference graph
    2. Coalesce (conservative)
    3. Simplify (remove low-degree nodes)
    4. If stuck: freeze (give up coalescing a move)
    5. If still stuck: spill
Until graph is empty

Select: assign colors to stack (in reverse)
```

---

## Complete Walkthrough

Consider this code with 3 available registers (R0, R1, R2):

```c
a = 1
b = 2
c = a + b
d = c * 3
e = b + d
return e
```

**Step 1: Live Ranges**

```
a: [1, 3]   (defined line 1, last used line 3)
b: [2, 5]   (defined line 2, last used line 5)
c: [3, 4]   (defined line 3, last used line 4)
d: [4, 5]   (defined line 4, last used line 5)
e: [5, 6]   (defined line 5, last used line 6)
```

**Step 2: Interference Graph**

Variables live at the same time:
- After line 1: {a}
- After line 2: {a, b} → edge (a, b)
- After line 3: {b, c} → edge (b, c)
- After line 4: {b, d} → edge (b, d)
- After line 5: {e}

```
Interference graph:
  a --- b --- c
        |
        d
```

**Step 3: Color with k=3**

- a: degree 1 → simplify (push a)
- c: degree 1 → simplify (push c)
- d: degree 1 → simplify (push d)
- b: degree 0 → simplify (push b)

Select (pop order):
- b → R0
- d → R1 (not R0, neighbors: b)
- c → R1 (not R0, neighbors: b)
- a → R1 (not R0, neighbors: b)

**Result**: a→R1, b→R0, c→R1, d→R1, e→R0

Note: `a`, `c`, and `d` share R1 because they're never live together!

---

## Handling Pre-colored Nodes

Some variables must be in specific registers (function arguments, return values):

```c
// x86-64: first arg in RDI, return in RAX
int square(int x) {  // x must be in RDI
    return x * x;    // result must be in RAX
}
```

Pre-colored nodes are treated as having **infinite** spill cost — they can never be spilled.

---

## Summary

| Concept | Description |
|---------|-------------|
| Interference graph | Variables live simultaneously must differ |
| Graph coloring | $k$ colors = $k$ registers |
| Chaitin's algorithm | Simplify → Spill → Select |
| Linear scan | Fast alternative for JIT |
| Coalescing | Eliminate copies by merging variables |
| Spilling | Move variable to memory when registers exhausted |

---

## Exercises

1. Given variables with live ranges a:[1,4], b:[2,6], c:[3,5], d:[5,7], e:[1,2]:
   - Draw the interference graph
   - Color it with 3 registers

2. Apply Chaitin's algorithm to this interference graph with k=2:
   ```
   a --- b --- c
   |           |
   d --------- 
   ```
   Which variable(s) must be spilled?

3. Apply linear scan allocation with 2 registers to intervals:
   - x: [1, 5], y: [2, 4], z: [3, 8], w: [6, 9]

4. Identify which copies can be coalesced:
   ```
   t1 = a + b
   t2 = t1
   t3 = t2 + c
   t4 = t3
   ```
   Given interference edges: (t1, t3), (t2, t3)

5. Why might aggressive coalescing lead to more spills than conservative coalescing? Give an example.
