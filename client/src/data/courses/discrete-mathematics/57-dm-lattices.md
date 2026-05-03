---
title: Lattices
---

# Lattices

A **lattice** is a partially ordered set (poset) in which every pair of elements has both a least upper bound (join) and a greatest lower bound (meet). Lattices provide the algebraic structure underlying Boolean algebra, type systems, and many areas of computer science.

---

## Definitions

### Recall: Partially Ordered Set (Poset)

A **poset** $(S, \leq)$ is a set $S$ with a binary relation $\leq$ that is:

- **Reflexive:** $a \leq a$ for all $a \in S$
- **Antisymmetric:** if $a \leq b$ and $b \leq a$, then $a = b$
- **Transitive:** if $a \leq b$ and $b \leq c$, then $a \leq c$

### Join and Meet

For elements $a, b$ in a poset $(S, \leq)$:

- **Join** (least upper bound, LUB, supremum): $a \vee b$ is the smallest element $c$ such that $a \leq c$ and $b \leq c$
- **Meet** (greatest lower bound, GLB, infimum): $a \wedge b$ is the largest element $c$ such that $c \leq a$ and $c \leq b$

### Lattice

A poset $(L, \leq)$ is a **lattice** if for every pair $a, b \in L$, both $a \vee b$ and $a \wedge b$ exist.

Equivalently, a lattice is an algebraic structure $(L, \vee, \wedge)$ where $\vee$ and $\wedge$ are binary operations satisfying:

| Property | Join ($\vee$) | Meet ($\wedge$) |
|----------|:---:|:---:|
| Commutative | $a \vee b = b \vee a$ | $a \wedge b = b \wedge a$ |
| Associative | $a \vee (b \vee c) = (a \vee b) \vee c$ | $a \wedge (b \wedge c) = (a \wedge b) \wedge c$ |
| Idempotent | $a \vee a = a$ | $a \wedge a = a$ |
| Absorption | $a \vee (a \wedge b) = a$ | $a \wedge (a \vee b) = a$ |

---

## Examples of Lattices

### 1. Divisibility Lattice

Let $S = \{1, 2, 3, 6\}$ with the relation $a | b$ (a divides b):

- $a \vee b = \text{lcm}(a, b)$ (least common multiple)
- $a \wedge b = \gcd(a, b)$ (greatest common divisor)

For example: $2 \vee 3 = \text{lcm}(2, 3) = 6$ and $2 \wedge 6 = \gcd(2, 6) = 2$.

This is a lattice because $\gcd$ and $\text{lcm}$ always exist for any pair in $S$.

### 2. Power Set Lattice

For any set $A$, the power set $\mathcal{P}(A)$ under $\subseteq$ forms a lattice:

- $X \vee Y = X \cup Y$
- $X \wedge Y = X \cap Y$

**Example:** $A = \{1, 2\}$, so $\mathcal{P}(A) = \{\emptyset, \{1\}, \{2\}, \{1,2\}\}$.

$$\{1\} \vee \{2\} = \{1\} \cup \{2\} = \{1, 2\}$$
$$\{1\} \wedge \{2\} = \{1\} \cap \{2\} = \emptyset$$

### 3. Integers Under $\leq$

$(\mathbb{Z}, \leq)$ is a lattice where:

- $a \vee b = \max(a, b)$
- $a \wedge b = \min(a, b)$

Every pair of integers has a max and min, so this is a lattice. However, it is **not bounded** (no global maximum or minimum exists).

### 4. Non-Example

Consider $S = \{a, b, c\}$ with $a \leq c$ and $b \leq c$ but $a$ and $b$ are incomparable.

Is $a \wedge b$ defined? We need the greatest element $\leq$ both $a$ and $b$. If no such element exists in $S$, then $(S, \leq)$ is **not** a lattice.

---

## Bounded Lattice

A lattice $(L, \vee, \wedge)$ is **bounded** if it has:

- A **top element** (greatest element) $\top$ (or $1$) such that $a \leq \top$ for all $a \in L$
- A **bottom element** (least element) $\bot$ (or $0$) such that $\bot \leq a$ for all $a \in L$

Properties of bounded elements:

$$a \vee \top = \top \quad \text{and} \quad a \wedge \top = a$$
$$a \vee \bot = a \quad \text{and} \quad a \wedge \bot = \bot$$

**Examples:**
- Power set lattice: $\bot = \emptyset$, $\top = A$
- Divisors of $n$: $\bot = 1$, $\top = n$
- $(\mathbb{Z}, \leq)$: not bounded (no top or bottom)

---

## Distributive Lattice

A lattice is **distributive** if for all $a, b, c \in L$:

$$a \wedge (b \vee c) = (a \wedge b) \vee (a \wedge c)$$

Equivalently (the dual holds automatically in distributive lattices):

$$a \vee (b \wedge c) = (a \vee b) \wedge (a \vee c)$$

**Examples of distributive lattices:**
- $(\mathbb{Z}, \min, \max)$
- $(\mathcal{P}(A), \cap, \cup)$
- Divisibility lattice of any positive integer

**Non-distributive lattices:** The "diamond" lattice $M_3$ and the "pentagon" lattice $N_5$ are the two minimal non-distributive lattices. A lattice is distributive if and only if it contains neither $M_3$ nor $N_5$ as a sublattice.

### Diamond Lattice ($M_3$)

```
        1
      / | \
     a  b  c
      \ | /
        0
```

Here $a \wedge (b \vee c) = a \wedge 1 = a$, but $(a \wedge b) \vee (a \wedge c) = 0 \vee 0 = 0 \neq a$.

---

## Complemented Lattice

In a bounded lattice, an element $a$ has a **complement** $a'$ if:

$$a \vee a' = \top \quad \text{and} \quad a \wedge a' = \bot$$

A bounded lattice is **complemented** if every element has at least one complement.

**Examples:**
- Power set lattice: complement of $X$ is $A \setminus X$ (set complement)
- In the diamond $M_3$: every non-boundary element complements every other (e.g., $a \vee b = 1$ and $a \wedge b = 0$)

> In a distributive lattice, if a complement exists, it is **unique**.

---

## Boolean Algebra as a Complemented Distributive Lattice

A **Boolean algebra** is precisely a bounded, complemented, distributive lattice.

This connects our current topic directly to the previous lesson:

| Boolean Algebra Operation | Lattice Operation |
|:---:|:---:|
| $a + b$ (OR) | $a \vee b$ (join) |
| $a \cdot b$ (AND) | $a \wedge b$ (meet) |
| $\overline{a}$ (NOT) | complement $a'$ |
| $1$ | $\top$ (top) |
| $0$ | $\bot$ (bottom) |

The axioms of Boolean algebra (commutative, associative, distributive, identity, complement) are exactly the lattice properties of a complemented distributive lattice.

**Key insight:** The power set lattice $(\mathcal{P}(A), \subseteq)$ is always a Boolean algebra (union = join, intersection = meet, set complement = complement, $\emptyset$ = bottom, $A$ = top).

---

## Hasse Diagrams of Lattices

A **Hasse diagram** represents a poset graphically:
- Elements are drawn as nodes
- If $a < b$ and there is no $c$ with $a < c < b$, draw an edge from $a$ (lower) to $b$ (upper)
- Transitivity is implied — no need to draw edges for indirect relations

### Example: Divisors of 12

$S = \{1, 2, 3, 4, 6, 12\}$ under divisibility:

```
           12
          / \
         4   6
         |  / \
         2    3
          \ /
           1
```

- $\bot = 1$, $\top = 12$
- $2 \vee 3 = \text{lcm}(2,3) = 6$
- $4 \wedge 6 = \gcd(4,6) = 2$
- Is it distributive? Yes (divisibility lattice of any integer is distributive)
- Is it complemented? Check: complement of 4 must satisfy $\gcd(4, x) = 1$ and $\text{lcm}(4, x) = 12$ → $x = 3$. Complement of 2? Need $\gcd(2,x)=1$ and $\text{lcm}(2,x)=12$ → no such $x$ in $S$. **Not complemented** → not a Boolean algebra.

### Example: Power Set of $\{a, b\}$

```
        {a, b}
        /    \
      {a}   {b}
        \    /
          ∅
```

This **is** a Boolean algebra: distributive + complemented + bounded.

---

## Sublattices

A subset $S \subseteq L$ forms a **sublattice** of $(L, \vee, \wedge)$ if $S$ is closed under both $\vee$ and $\wedge$: for all $a, b \in S$, both $a \vee b \in S$ and $a \wedge b \in S$.

**Example:** In the divisibility lattice of 30 ($\{1, 2, 3, 5, 6, 10, 15, 30\}$), the subset $\{1, 2, 3, 6\}$ is a sublattice.

---

## Lattice Homomorphisms

A function $f: L_1 \to L_2$ between lattices is a **lattice homomorphism** if:

$$f(a \vee b) = f(a) \vee f(b) \quad \text{and} \quad f(a \wedge b) = f(a) \wedge f(b)$$

If $f$ is also a bijection, it's a **lattice isomorphism** — the two lattices have the same structure.

---

## Code: Check if a Poset is a Lattice

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Represent a poset as an adjacency matrix (reachability)
// reach[i][j] = true means i <= j
class Poset {
    int n;
    vector<vector<bool>> reach;

public:
    Poset(int n, vector<pair<int,int>>& relations) : n(n), reach(n, vector<bool>(n, false)) {
        // Reflexive
        for (int i = 0; i < n; i++) reach[i][i] = true;
        // Add given relations
        for (auto& [a, b] : relations) reach[a][b] = true;
        // Transitive closure (Floyd-Warshall)
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (reach[i][k] && reach[k][j]) reach[i][j] = true;
    }

    bool leq(int a, int b) { return reach[a][b]; }

    // Find join (LUB) of a and b; returns -1 if not exists
    int join(int a, int b) {
        int result = -1;
        for (int c = 0; c < n; c++) {
            if (leq(a, c) && leq(b, c)) { // c is upper bound
                if (result == -1 || leq(c, result)) {
                    result = c;
                }
            }
        }
        // Verify it's actually the least upper bound
        if (result != -1) {
            for (int c = 0; c < n; c++) {
                if (leq(a, c) && leq(b, c) && !leq(result, c)) {
                    return -1; // No unique LUB
                }
            }
        }
        return result;
    }

    // Find meet (GLB) of a and b; returns -1 if not exists
    int meet(int a, int b) {
        int result = -1;
        for (int c = 0; c < n; c++) {
            if (leq(c, a) && leq(c, b)) { // c is lower bound
                if (result == -1 || leq(result, c)) {
                    result = c;
                }
            }
        }
        // Verify it's actually the greatest lower bound
        if (result != -1) {
            for (int c = 0; c < n; c++) {
                if (leq(c, a) && leq(c, b) && !leq(c, result)) {
                    return -1;
                }
            }
        }
        return result;
    }

    bool isLattice() {
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (join(i, j) == -1 || meet(i, j) == -1) {
                    cout << "Not a lattice: no join/meet for (" << i << ", " << j << ")" << endl;
                    return false;
                }
            }
        }
        return true;
    }
};

int main() {
    // Example 1: Divisors of 6 = {1, 2, 3, 6} under divisibility
    // Elements: 0=1, 1=2, 2=3, 3=6
    cout << "=== Divisors of 6: {1, 2, 3, 6} ===" << endl;
    vector<pair<int,int>> rels1 = {{0,1}, {0,2}, {1,3}, {2,3}};
    Poset p1(4, rels1);
    cout << "Is lattice: " << (p1.isLattice() ? "Yes" : "No") << endl;
    cout << "join(2,3) [i.e., lcm(2,3)=6 → index 3]: " << p1.join(1, 2) << endl;
    cout << "meet(2,3) [i.e., gcd(2,3)=1 → index 0]: " << p1.meet(1, 2) << endl;

    // Example 2: Not a lattice — three incomparable elements with a top
    // Elements: 0=bottom, 1=a, 2=b, 3=top, but no edges between a and b to bottom
    cout << "\n=== Non-lattice example ===" << endl;
    vector<pair<int,int>> rels2 = {{0,1}, {0,2}, {1,3}, {2,3}};
    // Actually this IS a lattice (diamond). Let's make a non-lattice:
    // Elements: 0=a, 1=b, 2=c with a<=c, b<=c but no relation between a,b and no bottom
    vector<pair<int,int>> rels3 = {{0,2}, {1,2}};
    Poset p2(3, rels3);
    cout << "Is lattice: " << (p2.isLattice() ? "Yes" : "No") << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class LatticeChecker
{
    private int n;
    private bool[,] reach;

    public LatticeChecker(int n, List<(int, int)> relations)
    {
        this.n = n;
        reach = new bool[n, n];

        // Reflexive
        for (int i = 0; i < n; i++) reach[i, i] = true;

        // Add relations
        foreach (var (a, b) in relations) reach[a, b] = true;

        // Transitive closure
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (reach[i, k] && reach[k, j])
                        reach[i, j] = true;
    }

    private bool Leq(int a, int b) => reach[a, b];

    public int Join(int a, int b)
    {
        int result = -1;
        for (int c = 0; c < n; c++)
        {
            if (Leq(a, c) && Leq(b, c))
            {
                if (result == -1 || Leq(c, result))
                    result = c;
            }
        }
        // Verify LUB
        if (result != -1)
        {
            for (int c = 0; c < n; c++)
            {
                if (Leq(a, c) && Leq(b, c) && !Leq(result, c))
                    return -1;
            }
        }
        return result;
    }

    public int Meet(int a, int b)
    {
        int result = -1;
        for (int c = 0; c < n; c++)
        {
            if (Leq(c, a) && Leq(c, b))
            {
                if (result == -1 || Leq(result, c))
                    result = c;
            }
        }
        // Verify GLB
        if (result != -1)
        {
            for (int c = 0; c < n; c++)
            {
                if (Leq(c, a) && Leq(c, b) && !Leq(c, result))
                    return -1;
            }
        }
        return result;
    }

    public bool IsLattice()
    {
        for (int i = 0; i < n; i++)
        {
            for (int j = i + 1; j < n; j++)
            {
                if (Join(i, j) == -1)
                {
                    Console.WriteLine($"  No join for ({i}, {j})");
                    return false;
                }
                if (Meet(i, j) == -1)
                {
                    Console.WriteLine($"  No meet for ({i}, {j})");
                    return false;
                }
            }
        }
        return true;
    }

    public bool IsDistributive()
    {
        if (!IsLattice()) return false;
        for (int a = 0; a < n; a++)
            for (int b = 0; b < n; b++)
                for (int c = 0; c < n; c++)
                {
                    int lhs = Meet(a, Join(b, c));
                    int rhs = Join(Meet(a, b), Meet(a, c));
                    if (lhs != rhs) return false;
                }
        return true;
    }

    static void Main()
    {
        Console.WriteLine("=== Lattice Checker ===\n");

        // Divisors of 6: {1,2,3,6} → indices {0,1,2,3}
        var rels = new List<(int, int)> { (0, 1), (0, 2), (1, 3), (2, 3) };
        var lattice = new LatticeChecker(4, rels);

        Console.WriteLine("Divisors of 6 = {1, 2, 3, 6}");
        Console.WriteLine($"Is lattice: {lattice.IsLattice()}");
        Console.WriteLine($"Is distributive: {lattice.IsDistributive()}");
        Console.WriteLine($"Join(1, 2) = {lattice.Join(1, 2)}"); // lcm(2,3)=6 → index 3
        Console.WriteLine($"Meet(1, 2) = {lattice.Meet(1, 2)}"); // gcd(2,3)=1 → index 0

        // Non-lattice: {a, b, c} with a≤c, b≤c only
        Console.WriteLine("\n{a, b, c} with a≤c and b≤c only:");
        var rels2 = new List<(int, int)> { (0, 2), (1, 2) };
        var nonLattice = new LatticeChecker(3, rels2);
        Console.WriteLine($"Is lattice: {nonLattice.IsLattice()}");
    }
}
```

```java
import java.util.*;

public class Lattice {

    private int n;
    private boolean[][] reach;

    public Lattice(int n, int[][] relations) {
        this.n = n;
        this.reach = new boolean[n][n];

        // Reflexive
        for (int i = 0; i < n; i++) reach[i][i] = true;

        // Add relations
        for (int[] rel : relations) reach[rel[0]][rel[1]] = true;

        // Transitive closure
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (reach[i][k] && reach[k][j])
                        reach[i][j] = true;
    }

    private boolean leq(int a, int b) { return reach[a][b]; }

    public int join(int a, int b) {
        int result = -1;
        for (int c = 0; c < n; c++) {
            if (leq(a, c) && leq(b, c)) {
                if (result == -1 || leq(c, result)) result = c;
            }
        }
        if (result != -1) {
            for (int c = 0; c < n; c++) {
                if (leq(a, c) && leq(b, c) && !leq(result, c)) return -1;
            }
        }
        return result;
    }

    public int meet(int a, int b) {
        int result = -1;
        for (int c = 0; c < n; c++) {
            if (leq(c, a) && leq(c, b)) {
                if (result == -1 || leq(result, c)) result = c;
            }
        }
        if (result != -1) {
            for (int c = 0; c < n; c++) {
                if (leq(c, a) && leq(c, b) && !leq(c, result)) return -1;
            }
        }
        return result;
    }

    public boolean isLattice() {
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (join(i, j) == -1 || meet(i, j) == -1) {
                    System.out.println("  No join/meet for (" + i + ", " + j + ")");
                    return false;
                }
            }
        }
        return true;
    }

    public boolean isDistributive() {
        if (!isLattice()) return false;
        for (int a = 0; a < n; a++)
            for (int b = 0; b < n; b++)
                for (int c = 0; c < n; c++) {
                    int lhs = meet(a, join(b, c));
                    int rhs = join(meet(a, b), meet(a, c));
                    if (lhs != rhs) return false;
                }
        return true;
    }

    public boolean isBounded() {
        // Check for bottom (element <= all others)
        boolean hasBottom = false, hasTop = false;
        for (int i = 0; i < n; i++) {
            boolean isBot = true, isTop = true;
            for (int j = 0; j < n; j++) {
                if (!leq(i, j)) isBot = false;
                if (!leq(j, i)) isTop = false;
            }
            if (isBot) hasBottom = true;
            if (isTop) hasTop = true;
        }
        return hasBottom && hasTop;
    }

    public static void main(String[] args) {
        System.out.println("=== Lattice Checker ===\n");

        // Divisors of 12: {1,2,3,4,6,12} → indices {0,1,2,3,4,5}
        // 1|2, 1|3, 1|4, 1|6, 1|12, 2|4, 2|6, 2|12, 3|6, 3|12, 4|12, 6|12
        int[][] rels = {{0,1},{0,2},{0,3},{0,4},{0,5},{1,3},{1,4},{1,5},{2,4},{2,5},{3,5},{4,5}};
        Lattice lat = new Lattice(6, rels);

        System.out.println("Divisors of 12 = {1,2,3,4,6,12}:");
        System.out.println("Is lattice: " + lat.isLattice());
        System.out.println("Is bounded: " + lat.isBounded());
        System.out.println("Is distributive: " + lat.isDistributive());
        System.out.println("join(2,3) [lcm]: element " + lat.join(1, 2)); // → 4 (=6)
        System.out.println("meet(4,6) [gcd]: element " + lat.meet(3, 4)); // → 1 (=2)
    }
}
```

```python
class Poset:
    """A finite poset represented by its Hasse diagram (direct relations)."""

    def __init__(self, elements, relations):
        """
        elements: list of element labels
        relations: list of (a, b) meaning a <= b (direct/covering relations)
        """
        self.elements = elements
        self.n = len(elements)
        self.index = {e: i for i, e in enumerate(elements)}

        # Build reachability matrix (transitive closure)
        self.reach = [[False] * self.n for _ in range(self.n)]
        for i in range(self.n):
            self.reach[i][i] = True  # Reflexive
        for a, b in relations:
            self.reach[self.index[a]][self.index[b]] = True

        # Floyd-Warshall for transitive closure
        for k in range(self.n):
            for i in range(self.n):
                for j in range(self.n):
                    if self.reach[i][k] and self.reach[k][j]:
                        self.reach[i][j] = True

    def leq(self, a, b):
        """Check if a <= b in the poset."""
        return self.reach[self.index[a]][self.index[b]]

    def join(self, a, b):
        """Find the join (LUB) of a and b. Returns None if it doesn't exist."""
        ai, bi = self.index[a], self.index[b]
        upper_bounds = [k for k in range(self.n)
                        if self.reach[ai][k] and self.reach[bi][k]]
        if not upper_bounds:
            return None
        # Find the least among upper bounds
        for candidate in upper_bounds:
            if all(self.reach[candidate][ub] or candidate == ub
                   for ub in upper_bounds):
                # candidate <= all upper bounds? No, we want candidate that all UBs are >= candidate
                pass
        # Correct: LUB is the UB that is <= all other UBs
        for candidate in upper_bounds:
            if all(self.reach[candidate][ub] for ub in upper_bounds):
                return self.elements[candidate]
        return None

    def meet(self, a, b):
        """Find the meet (GLB) of a and b. Returns None if it doesn't exist."""
        ai, bi = self.index[a], self.index[b]
        lower_bounds = [k for k in range(self.n)
                        if self.reach[k][ai] and self.reach[k][bi]]
        if not lower_bounds:
            return None
        # GLB is the LB that is >= all other LBs
        for candidate in lower_bounds:
            if all(self.reach[lb][candidate] for lb in lower_bounds):
                return self.elements[candidate]
        return None

    def is_lattice(self):
        """Check if this poset is a lattice."""
        for i in range(self.n):
            for j in range(i + 1, self.n):
                a, b = self.elements[i], self.elements[j]
                if self.join(a, b) is None:
                    print(f"  No join for ({a}, {b})")
                    return False
                if self.meet(a, b) is None:
                    print(f"  No meet for ({a}, {b})")
                    return False
        return True

    def is_distributive(self):
        """Check if the lattice is distributive."""
        if not self.is_lattice():
            return False
        for a in self.elements:
            for b in self.elements:
                for c in self.elements:
                    # a ∧ (b ∨ c) should equal (a ∧ b) ∨ (a ∧ c)
                    bc_join = self.join(b, c)
                    lhs = self.meet(a, bc_join)
                    ab_meet = self.meet(a, b)
                    ac_meet = self.meet(a, c)
                    rhs = self.join(ab_meet, ac_meet)
                    if lhs != rhs:
                        return False
        return True

    def is_bounded(self):
        """Check if the lattice has top and bottom elements."""
        has_bottom = any(
            all(self.reach[i][j] for j in range(self.n))
            for i in range(self.n)
        )
        has_top = any(
            all(self.reach[j][i] for j in range(self.n))
            for i in range(self.n)
        )
        return has_bottom and has_top


if __name__ == "__main__":
    print("=== Lattice Checker ===\n")

    # Divisors of 6: {1, 2, 3, 6}
    elements = [1, 2, 3, 6]
    relations = [(1, 2), (1, 3), (2, 6), (3, 6)]
    poset = Poset(elements, relations)

    print("Divisors of 6 = {1, 2, 3, 6}:")
    print(f"  Is lattice: {poset.is_lattice()}")
    print(f"  Is bounded: {poset.is_bounded()}")
    print(f"  Is distributive: {poset.is_distributive()}")
    print(f"  join(2, 3) = {poset.join(2, 3)}")  # lcm(2,3) = 6
    print(f"  meet(2, 3) = {poset.meet(2, 3)}")  # gcd(2,3) = 1

    # Power set of {a, b}
    print("\nPower set of {a, b}:")
    elements2 = ["∅", "{a}", "{b}", "{a,b}"]
    relations2 = [("∅", "{a}"), ("∅", "{b}"), ("{a}", "{a,b}"), ("{b}", "{a,b}")]
    poset2 = Poset(elements2, relations2)
    print(f"  Is lattice: {poset2.is_lattice()}")
    print(f"  Is bounded: {poset2.is_bounded()}")
    print(f"  Is distributive: {poset2.is_distributive()}")

    # Non-lattice example
    print("\nNon-lattice: {a, b, c} with a≤c, b≤c only:")
    elements3 = ["a", "b", "c"]
    relations3 = [("a", "c"), ("b", "c")]
    poset3 = Poset(elements3, relations3)
    print(f"  Is lattice: {poset3.is_lattice()}")
```

```javascript
class Poset {
  /**
   * @param {string[]} elements - Element labels
   * @param {Array<[string, string]>} relations - Pairs [a, b] meaning a <= b
   */
  constructor(elements, relations) {
    this.elements = elements;
    this.n = elements.length;
    this.index = {};
    elements.forEach((e, i) => { this.index[e] = i; });

    // Build reachability matrix
    this.reach = Array.from({ length: this.n }, () =>
      Array(this.n).fill(false)
    );
    for (let i = 0; i < this.n; i++) this.reach[i][i] = true;
    for (const [a, b] of relations) {
      this.reach[this.index[a]][this.index[b]] = true;
    }

    // Transitive closure (Floyd-Warshall)
    for (let k = 0; k < this.n; k++)
      for (let i = 0; i < this.n; i++)
        for (let j = 0; j < this.n; j++)
          if (this.reach[i][k] && this.reach[k][j])
            this.reach[i][j] = true;
  }

  leq(a, b) {
    return this.reach[this.index[a]][this.index[b]];
  }

  join(a, b) {
    const ai = this.index[a], bi = this.index[b];
    const upperBounds = [];
    for (let k = 0; k < this.n; k++) {
      if (this.reach[ai][k] && this.reach[bi][k]) upperBounds.push(k);
    }
    if (upperBounds.length === 0) return null;

    for (const candidate of upperBounds) {
      if (upperBounds.every(ub => this.reach[candidate][ub])) {
        return this.elements[candidate];
      }
    }
    return null;
  }

  meet(a, b) {
    const ai = this.index[a], bi = this.index[b];
    const lowerBounds = [];
    for (let k = 0; k < this.n; k++) {
      if (this.reach[k][ai] && this.reach[k][bi]) lowerBounds.push(k);
    }
    if (lowerBounds.length === 0) return null;

    for (const candidate of lowerBounds) {
      if (lowerBounds.every(lb => this.reach[lb][candidate])) {
        return this.elements[candidate];
      }
    }
    return null;
  }

  isLattice() {
    for (let i = 0; i < this.n; i++) {
      for (let j = i + 1; j < this.n; j++) {
        const a = this.elements[i], b = this.elements[j];
        if (this.join(a, b) === null) {
          console.log(`  No join for (${a}, ${b})`);
          return false;
        }
        if (this.meet(a, b) === null) {
          console.log(`  No meet for (${a}, ${b})`);
          return false;
        }
      }
    }
    return true;
  }

  isDistributive() {
    if (!this.isLattice()) return false;
    for (const a of this.elements) {
      for (const b of this.elements) {
        for (const c of this.elements) {
          const bcJoin = this.join(b, c);
          const lhs = this.meet(a, bcJoin);
          const abMeet = this.meet(a, b);
          const acMeet = this.meet(a, c);
          const rhs = this.join(abMeet, acMeet);
          if (lhs !== rhs) return false;
        }
      }
    }
    return true;
  }

  isBounded() {
    let hasBottom = false, hasTop = false;
    for (let i = 0; i < this.n; i++) {
      if (this.elements.every((_, j) => this.reach[i][j])) hasBottom = true;
      if (this.elements.every((_, j) => this.reach[j][i])) hasTop = true;
    }
    return hasBottom && hasTop;
  }
}

// --- Main ---
console.log("=== Lattice Checker ===\n");

// Divisors of 6
const elements = ["1", "2", "3", "6"];
const relations = [["1", "2"], ["1", "3"], ["2", "6"], ["3", "6"]];
const poset = new Poset(elements, relations);

console.log("Divisors of 6 = {1, 2, 3, 6}:");
console.log(`  Is lattice: ${poset.isLattice()}`);
console.log(`  Is bounded: ${poset.isBounded()}`);
console.log(`  Is distributive: ${poset.isDistributive()}`);
console.log(`  join(2, 3) = ${poset.join("2", "3")}`); // 6
console.log(`  meet(2, 3) = ${poset.meet("2", "3")}`); // 1

// Non-lattice
console.log("\nNon-lattice: {a, b, c} with a≤c, b≤c only:");
const poset2 = new Poset(["a", "b", "c"], [["a", "c"], ["b", "c"]]);
console.log(`  Is lattice: ${poset2.isLattice()}`);
```

---

## Key Takeaways

1. A **lattice** is a poset where every pair of elements has a join (LUB, $\vee$) and a meet (GLB, $\wedge$) — this guarantees a rich algebraic structure.

2. Key examples include the **power set lattice** ($\cup$ as join, $\cap$ as meet) and the **divisibility lattice** ($\text{lcm}$ as join, $\gcd$ as meet).

3. A **bounded lattice** has a top ($\top$) and bottom ($\bot$) element; a **distributive lattice** satisfies $a \wedge (b \vee c) = (a \wedge b) \vee (a \wedge c)$.

4. A **Boolean algebra** is exactly a **complemented distributive lattice** — this connects lattice theory directly to the Boolean algebra studied in the previous lesson.

5. **Hasse diagrams** provide a compact visual representation of a poset's structure, making it easy to identify joins, meets, and complements at a glance.

6. Lattice theory underpins **type systems** (subtype hierarchies), **static analysis** (abstract interpretation), **database theory** (functional dependencies), and **formal concept analysis**.
