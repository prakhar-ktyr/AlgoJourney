---
title: Planar Graphs & Euler's Formula
---

# Planar Graphs & Euler's Formula

Planar graphs are graphs that can be drawn on a flat surface (the plane) without any edges crossing. This seemingly geometric property has deep combinatorial consequences, most notably captured by Euler's formula. Understanding planarity is essential for circuit design, map coloring, and network layout.

---

## What Is a Planar Graph?

A graph $G = (V, E)$ is **planar** if it can be drawn in the plane such that no two edges cross each other (except at shared endpoints). Such a crossing-free drawing is called a **planar embedding** or **plane graph**.

### Important Distinction

- A graph is planar if *some* drawing has no crossings (even if other drawings do).
- A **plane graph** is a specific crossing-free drawing of a planar graph.

### Examples of Planar Graphs

- All trees are planar.
- Cycles $C_n$ are planar for all $n$.
- Complete graphs $K_1, K_2, K_3, K_4$ are planar.
- The Petersen graph is NOT planar.

---

## Faces of a Plane Graph

When a planar graph is drawn in the plane without crossings, it divides the plane into connected regions called **faces**.

- **Interior faces**: bounded regions enclosed by edges.
- **Exterior face** (unbounded face): the infinite region surrounding the graph.

### Example

A triangle ($K_3$) drawn in the plane has:
- 1 interior face (the region inside the triangle)
- 1 exterior face (everything outside)
- Total: 2 faces

A square ($C_4$) drawn in the plane has:
- 1 interior face
- 1 exterior face
- Total: 2 faces

---

## Euler's Formula

**Theorem (Euler's Formula)**: For any connected planar graph with $V$ vertices, $E$ edges, and $F$ faces:

$$V - E + F = 2$$

This is one of the most elegant results in mathematics. The quantity $V - E + F$ is called the **Euler characteristic** of the plane.

### Proof Sketch (by induction on edges)

**Base case**: A tree on $V$ vertices has $E = V - 1$ edges and $F = 1$ face (only the exterior). Check: $V - (V-1) + 1 = 2$. ✓

**Inductive step**: If the graph has a cycle, remove one edge from that cycle. This merges two faces into one, so $E$ decreases by 1 and $F$ decreases by 1. The formula $V - E + F$ remains unchanged. Continue until we reach a spanning tree.

### Verification Examples

| Graph | $V$ | $E$ | $F$ | $V - E + F$ |
|-------|-----|-----|-----|-------------|
| Single vertex | 1 | 0 | 1 | 2 |
| Single edge | 2 | 1 | 1 | 2 |
| Triangle $K_3$ | 3 | 3 | 2 | 2 |
| $K_4$ | 4 | 6 | 4 | 2 |
| Cube graph $Q_3$ | 8 | 12 | 6 | 2 |

---

## Corollaries of Euler's Formula

These corollaries provide **necessary conditions** for planarity — powerful tools for proving a graph is NOT planar.

### Corollary 1: Edge Bound

For a connected planar graph with $V \geq 3$:

$$E \leq 3V - 6$$

**Proof**: Every face is bounded by at least 3 edges. Counting edge-face incidences: $2E \geq 3F$ (each edge borders exactly 2 faces). So $F \leq \frac{2E}{3}$. Substituting into Euler's formula:

$$V - E + F = 2 \implies F = 2 - V + E$$

$$2 - V + E \leq \frac{2E}{3}$$

$$6 - 3V + 3E \leq 2E$$

$$E \leq 3V - 6$$

### Corollary 2: Triangle-Free Edge Bound

For a connected planar graph with $V \geq 3$ and **no triangles** (no 3-cycles):

$$E \leq 2V - 4$$

**Proof**: If there are no triangles, every face is bounded by at least 4 edges. So $2E \geq 4F$, giving $F \leq \frac{E}{2}$. Substituting:

$$2 - V + E \leq \frac{E}{2} \implies E \leq 2V - 4$$

### Corollary 3: Minimum Degree Bound

Every planar graph has a vertex of degree at most 5:

$$\delta(G) \leq 5$$

**Proof**: By handshaking, $\sum \deg(v) = 2E \leq 2(3V-6) = 6V - 12 < 6V$. If every vertex had degree $\geq 6$, the sum would be $\geq 6V$, a contradiction.

---

## $K_5$ and $K_{3,3}$ Are NOT Planar

### $K_5$ Is Not Planar

$K_5$ has $V = 5$ vertices and $E = 10$ edges. Check:

$$3V - 6 = 3(5) - 6 = 9$$

Since $E = 10 > 9 = 3V - 6$, the edge bound is violated. Therefore $K_5$ is **not planar**.

### $K_{3,3}$ Is Not Planar

$K_{3,3}$ has $V = 6$ vertices and $E = 9$ edges. The simple bound gives $3V - 6 = 12 \geq 9$, which doesn't help. But $K_{3,3}$ is bipartite, so it has no odd cycles — in particular, no triangles. Apply the triangle-free bound:

$$2V - 4 = 2(6) - 4 = 8$$

Since $E = 9 > 8 = 2V - 4$, the triangle-free bound is violated. Therefore $K_{3,3}$ is **not planar**.

---

## Kuratowski's Theorem

The non-planarity of $K_5$ and $K_{3,3}$ is not just examples — these two graphs characterize ALL non-planar graphs.

**Theorem (Kuratowski, 1930)**: A graph is planar if and only if it contains no **subdivision** of $K_5$ or $K_{3,3}$ as a subgraph.

A **subdivision** of a graph $H$ is obtained by inserting vertices of degree 2 along edges of $H$ (replacing an edge with a path).

### Equivalent Formulation (Wagner's Theorem)

A graph is planar if and only if it has no **minor** isomorphic to $K_5$ or $K_{3,3}$.

A **minor** is obtained by edge contractions and vertex/edge deletions.

### Practical Implication

To prove a graph is non-planar, you need to find a subgraph that is a subdivision of $K_5$ or $K_{3,3}$.

---

## Graph Duality

Every plane graph $G$ has a **dual graph** $G^*$:

- Each face of $G$ becomes a vertex of $G^*$.
- Each edge of $G$ separating two faces becomes an edge connecting the corresponding vertices in $G^*$.

### Properties of Duals

- $(G^*)^* = G$ for 3-connected planar graphs.
- If $G$ has $V$ vertices, $E$ edges, and $F$ faces, then $G^*$ has $F$ vertices, $E$ edges, and $V$ faces.
- Euler's formula is preserved: $F - E + V = 2$.
- A spanning tree in $G$ corresponds to the complement of a spanning tree in $G^*$.

### Example

The dual of the tetrahedron graph ($K_4$) is itself another $K_4$ — it is **self-dual**.

---

## Code: Verify Euler's Formula and Planarity Bounds

```cpp
#include <iostream>
#include <vector>
using namespace std;

struct PlanarityCheck {
    int V, E, F;
    bool hasTriangles;

    bool verifyEulerFormula() const {
        return (V - E + F == 2);
    }

    bool checkEdgeBound() const {
        // Necessary condition: E <= 3V - 6
        if (V < 3) return true;
        return E <= 3 * V - 6;
    }

    bool checkTriangleFreeEdgeBound() const {
        // If no triangles: E <= 2V - 4
        if (V < 3) return true;
        if (!hasTriangles) {
            return E <= 2 * V - 4;
        }
        return true; // Bound doesn't apply if graph has triangles
    }

    void report() const {
        cout << "V=" << V << ", E=" << E << ", F=" << F << endl;
        cout << "Euler's formula (V-E+F=2): "
             << (verifyEulerFormula() ? "HOLDS" : "FAILS") << endl;
        cout << "Edge bound (E <= 3V-6 = " << 3*V-6 << "): "
             << (checkEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR") << endl;
        if (!hasTriangles) {
            cout << "Triangle-free bound (E <= 2V-4 = " << 2*V-4 << "): "
                 << (checkTriangleFreeEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR") << endl;
        }
    }
};

int main() {
    // Test K5
    cout << "=== K5 ===" << endl;
    PlanarityCheck k5 = {5, 10, 0, true};
    k5.report();

    cout << "\n=== K3,3 ===" << endl;
    PlanarityCheck k33 = {6, 9, 0, false};
    k33.report();

    cout << "\n=== K4 (planar) ===" << endl;
    PlanarityCheck k4 = {4, 6, 4, true};
    k4.report();

    cout << "\n=== Cube Q3 (planar) ===" << endl;
    PlanarityCheck cube = {8, 12, 6, false};
    cube.report();

    return 0;
}
```

```csharp
using System;

class PlanarityCheck
{
    public int V, E, F;
    public bool HasTriangles;

    public bool VerifyEulerFormula() => V - E + F == 2;

    public bool CheckEdgeBound()
    {
        if (V < 3) return true;
        return E <= 3 * V - 6;
    }

    public bool CheckTriangleFreeEdgeBound()
    {
        if (V < 3) return true;
        if (!HasTriangles) return E <= 2 * V - 4;
        return true;
    }

    public void Report()
    {
        Console.WriteLine($"V={V}, E={E}, F={F}");
        Console.WriteLine($"Euler's formula (V-E+F=2): " +
            $"{(VerifyEulerFormula() ? "HOLDS" : "FAILS")}");
        Console.WriteLine($"Edge bound (E <= 3V-6 = {3*V-6}): " +
            $"{(CheckEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR")}");
        if (!HasTriangles)
        {
            Console.WriteLine($"Triangle-free bound (E <= 2V-4 = {2*V-4}): " +
                $"{(CheckTriangleFreeEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR")}");
        }
    }

    static void Main()
    {
        Console.WriteLine("=== K5 ===");
        new PlanarityCheck { V=5, E=10, F=0, HasTriangles=true }.Report();

        Console.WriteLine("\n=== K3,3 ===");
        new PlanarityCheck { V=6, E=9, F=0, HasTriangles=false }.Report();

        Console.WriteLine("\n=== K4 (planar) ===");
        new PlanarityCheck { V=4, E=6, F=4, HasTriangles=true }.Report();

        Console.WriteLine("\n=== Cube Q3 (planar) ===");
        new PlanarityCheck { V=8, E=12, F=6, HasTriangles=false }.Report();
    }
}
```

```java
public class PlanarityCheck {
    int V, E, F;
    boolean hasTriangles;

    PlanarityCheck(int V, int E, int F, boolean hasTriangles) {
        this.V = V;
        this.E = E;
        this.F = F;
        this.hasTriangles = hasTriangles;
    }

    boolean verifyEulerFormula() {
        return V - E + F == 2;
    }

    boolean checkEdgeBound() {
        if (V < 3) return true;
        return E <= 3 * V - 6;
    }

    boolean checkTriangleFreeEdgeBound() {
        if (V < 3) return true;
        if (!hasTriangles) return E <= 2 * V - 4;
        return true;
    }

    void report() {
        System.out.println("V=" + V + ", E=" + E + ", F=" + F);
        System.out.println("Euler's formula (V-E+F=2): " +
            (verifyEulerFormula() ? "HOLDS" : "FAILS"));
        System.out.println("Edge bound (E <= 3V-6 = " + (3*V-6) + "): " +
            (checkEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR"));
        if (!hasTriangles) {
            System.out.println("Triangle-free bound (E <= 2V-4 = " + (2*V-4) + "): " +
                (checkTriangleFreeEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR"));
        }
    }

    public static void main(String[] args) {
        System.out.println("=== K5 ===");
        new PlanarityCheck(5, 10, 0, true).report();

        System.out.println("\n=== K3,3 ===");
        new PlanarityCheck(6, 9, 0, false).report();

        System.out.println("\n=== K4 (planar) ===");
        new PlanarityCheck(4, 6, 4, true).report();

        System.out.println("\n=== Cube Q3 (planar) ===");
        new PlanarityCheck(8, 12, 6, false).report();
    }
}
```

```python
class PlanarityCheck:
    def __init__(self, V, E, F, has_triangles):
        self.V = V
        self.E = E
        self.F = F
        self.has_triangles = has_triangles

    def verify_euler_formula(self):
        """Check if V - E + F = 2."""
        return self.V - self.E + self.F == 2

    def check_edge_bound(self):
        """Necessary condition for planarity: E <= 3V - 6."""
        if self.V < 3:
            return True
        return self.E <= 3 * self.V - 6

    def check_triangle_free_bound(self):
        """For triangle-free graphs: E <= 2V - 4."""
        if self.V < 3:
            return True
        if not self.has_triangles:
            return self.E <= 2 * self.V - 4
        return True

    def report(self):
        print(f"V={self.V}, E={self.E}, F={self.F}")
        euler = "HOLDS" if self.verify_euler_formula() else "FAILS"
        print(f"Euler's formula (V-E+F=2): {euler}")
        bound = 3 * self.V - 6
        edge_ok = "SATISFIED" if self.check_edge_bound() else "VIOLATED - NOT PLANAR"
        print(f"Edge bound (E <= 3V-6 = {bound}): {edge_ok}")
        if not self.has_triangles:
            tf_bound = 2 * self.V - 4
            tf_ok = "SATISFIED" if self.check_triangle_free_bound() else "VIOLATED - NOT PLANAR"
            print(f"Triangle-free bound (E <= 2V-4 = {tf_bound}): {tf_ok}")


# Test cases
print("=== K5 ===")
PlanarityCheck(5, 10, 0, True).report()

print("\n=== K3,3 ===")
PlanarityCheck(6, 9, 0, False).report()

print("\n=== K4 (planar) ===")
PlanarityCheck(4, 6, 4, True).report()

print("\n=== Cube Q3 (planar) ===")
PlanarityCheck(8, 12, 6, False).report()
```

```javascript
class PlanarityCheck {
  constructor(V, E, F, hasTriangles) {
    this.V = V;
    this.E = E;
    this.F = F;
    this.hasTriangles = hasTriangles;
  }

  verifyEulerFormula() {
    return this.V - this.E + this.F === 2;
  }

  checkEdgeBound() {
    if (this.V < 3) return true;
    return this.E <= 3 * this.V - 6;
  }

  checkTriangleFreeBound() {
    if (this.V < 3) return true;
    if (!this.hasTriangles) return this.E <= 2 * this.V - 4;
    return true;
  }

  report() {
    console.log(`V=${this.V}, E=${this.E}, F=${this.F}`);
    const euler = this.verifyEulerFormula() ? "HOLDS" : "FAILS";
    console.log(`Euler's formula (V-E+F=2): ${euler}`);
    const bound = 3 * this.V - 6;
    const edgeOk = this.checkEdgeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR";
    console.log(`Edge bound (E <= 3V-6 = ${bound}): ${edgeOk}`);
    if (!this.hasTriangles) {
      const tfBound = 2 * this.V - 4;
      const tfOk = this.checkTriangleFreeBound() ? "SATISFIED" : "VIOLATED - NOT PLANAR";
      console.log(`Triangle-free bound (E <= 2V-4 = ${tfBound}): ${tfOk}`);
    }
  }
}

// Test cases
console.log("=== K5 ===");
new PlanarityCheck(5, 10, 0, true).report();

console.log("\n=== K3,3 ===");
new PlanarityCheck(6, 9, 0, false).report();

console.log("\n=== K4 (planar) ===");
new PlanarityCheck(4, 6, 4, true).report();

console.log("\n=== Cube Q3 (planar) ===");
new PlanarityCheck(8, 12, 6, false).report();
```

---

## Planarity Testing Algorithms

While the bounds above can prove non-planarity, they are only necessary conditions. To definitively test planarity, efficient algorithms exist:

| Algorithm | Year | Time Complexity |
|-----------|------|----------------|
| Hopcroft-Tarjan | 1974 | $O(V)$ |
| Booth-Lueker (PQ-tree) | 1976 | $O(V)$ |
| Boyer-Myrvold | 2004 | $O(V)$ |
| de Fraysseix-Rosenstiehl | 2006 | $O(V)$ |

All achieve linear time, though the implementations are complex. For practical purposes, libraries like Boost (C++) or NetworkX (Python) provide planarity testing.

---

## Summary Table

| Property | Formula / Condition |
|----------|-------------------|
| Euler's formula | $V - E + F = 2$ |
| General edge bound | $E \leq 3V - 6$ |
| Triangle-free bound | $E \leq 2V - 4$ |
| Max chromatic number | $\chi(G) \leq 4$ (Four Color Theorem) |
| Min degree | $\delta(G) \leq 5$ |
| Non-planar obstruction | Contains subdivision of $K_5$ or $K_{3,3}$ |

---

## Key Takeaways

1. A **planar graph** can be drawn in the plane with no edge crossings.
2. **Euler's formula** $V - E + F = 2$ holds for every connected planar graph — it connects vertices, edges, and faces.
3. The corollary $E \leq 3V - 6$ provides a quick test: if a graph has too many edges, it cannot be planar.
4. For triangle-free graphs, the tighter bound $E \leq 2V - 4$ applies.
5. $K_5$ and $K_{3,3}$ are the "smallest" non-planar graphs; **Kuratowski's theorem** says every non-planar graph contains a subdivision of one of these.
6. **Graph duality** swaps faces and vertices, providing a powerful structural perspective.
7. Planarity can be tested in linear time $O(V)$, though the algorithms are non-trivial.
