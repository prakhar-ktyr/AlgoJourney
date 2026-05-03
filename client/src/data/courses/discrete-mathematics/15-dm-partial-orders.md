---
title: Partial Orders & Hasse Diagrams
---

# Partial Orders & Hasse Diagrams

In the previous lessons we studied relations in general. Now we focus on a specific kind of relation that captures the idea of "ordering" elements — but unlike the familiar number line, not every pair of elements needs to be comparable.

---

## 1. What Is a Partial Order?

A **partial order** (or **partial ordering**) on a set $A$ is a relation $R \subseteq A \times A$ that satisfies three properties:

| Property | Formal Statement | Intuition |
|----------|-----------------|-----------|
| **Reflexive** | $\forall a \in A,\ (a, a) \in R$ | Every element is related to itself |
| **Antisymmetric** | $(a, b) \in R \land (b, a) \in R \implies a = b$ | No two *distinct* elements point both ways |
| **Transitive** | $(a, b) \in R \land (b, c) \in R \implies (a, c) \in R$ | Chains extend naturally |

A set $A$ together with a partial order $\leq$ is called a **partially ordered set** (or **poset**), written $(A, \leq)$.

> **Memory aid:** A partial order is **RAT** — Reflexive, Antisymmetric, Transitive.

---

## 2. Classic Examples

### 2.1 $\leq$ on Integers

The usual "less than or equal to" on $\mathbb{Z}$ is a partial order:

- Reflexive: $a \leq a$ for every integer $a$.
- Antisymmetric: $a \leq b$ and $b \leq a$ imply $a = b$.
- Transitive: $a \leq b$ and $b \leq c$ imply $a \leq c$.

### 2.2 $\subseteq$ on Power Sets

Let $S = \{1, 2, 3\}$ and consider $\mathcal{P}(S)$ (the power set). The subset relation $\subseteq$ is a partial order on $\mathcal{P}(S)$:

- $A \subseteq A$ (reflexive).
- $A \subseteq B$ and $B \subseteq A$ imply $A = B$ (antisymmetric).
- $A \subseteq B$ and $B \subseteq C$ imply $A \subseteq C$ (transitive).

Here $\{1\}$ and $\{2\}$ are **incomparable** — neither is a subset of the other.

### 2.3 Divisibility on Positive Integers

Define $a \mid b$ ("$a$ divides $b$") on $\mathbb{Z}^+$:

- $a \mid a$ (reflexive, since $a = 1 \cdot a$).
- $a \mid b$ and $b \mid a$ imply $a = b$ for positive integers (antisymmetric).
- $a \mid b$ and $b \mid c$ imply $a \mid c$ (transitive).

So $(\mathbb{Z}^+, \mid)$ is a poset. Note: $3$ and $5$ are incomparable because neither divides the other.

---

## 3. Comparable vs Incomparable Elements

Given a poset $(A, \leq)$ and elements $a, b \in A$:

- $a$ and $b$ are **comparable** if $a \leq b$ or $b \leq a$.
- $a$ and $b$ are **incomparable** (written $a \parallel b$) if neither $a \leq b$ nor $b \leq a$.

The existence of incomparable pairs is what makes a partial order *partial* — not every pair is ordered.

---

## 4. Total Order vs Partial Order

A partial order where *every* pair of elements is comparable is called a **total order** (also **linear order** or **chain**).

$$\forall a, b \in A,\ a \leq b \lor b \leq a$$

| Example | Total or Partial? |
|---------|-------------------|
| $(\mathbb{Z}, \leq)$ | Total — any two integers are comparable |
| $(\mathcal{P}(\{1,2,3\}), \subseteq)$ | Partial — $\{1\}$ and $\{2\}$ are incomparable |
| $(\mathbb{Z}^+, \mid)$ | Partial — $2$ and $3$ are incomparable |

Every total order is a partial order, but not every partial order is total.

---

## 5. Hasse Diagrams

Drawing all edges of a partial order (including reflexive loops and transitive shortcuts) is cluttered. A **Hasse diagram** simplifies the picture by removing redundant information.

### Construction Rules

1. **Remove reflexive edges** — every node would have a self-loop; we just omit them.
2. **Remove transitive edges** — if $a \leq b$ and $b \leq c$, don't draw a direct edge from $a$ to $c$ (it's implied).
3. **Orient by position** — place smaller elements lower, larger elements higher. This eliminates the need for arrows.

### Example: Divisors of 12

Consider the poset $(\{1, 2, 3, 4, 6, 12\}, \mid)$. The Hasse diagram has edges only for *immediate* divisibility (called **covering relations**):

```
        12
       /  \
      4    6
      |   / \
      2  3   |
       \ |  /
         1
```

$1$ is at the bottom (divides everything), $12$ at the top (divisible by everything in the set).

---

## 6. Special Elements in a Poset

Let $(A, \leq)$ be a poset.

| Term | Definition |
|------|-----------|
| **Maximal** element $m$ | No element in $A$ is strictly greater: $\nexists\, x \in A,\ m < x$ |
| **Minimal** element $m$ | No element in $A$ is strictly less: $\nexists\, x \in A,\ x < m$ |
| **Greatest** (maximum) element $g$ | $\forall a \in A,\ a \leq g$ |
| **Least** (minimum) element $l$ | $\forall a \in A,\ l \leq a$ |

> A poset can have many maximal elements but **at most one** greatest element. If a greatest element exists, it is the unique maximal element.

### Example

In the poset $(\{2, 3, 6, 12, 24, 36\}, \mid)$:

- Minimal elements: $2, 3$ (nothing in the set divides them except themselves).
- Maximal elements: $24, 36$ (neither divides anything else in the set).
- Greatest element: none (since $24 \nmid 36$ and $36 \nmid 24$).
- Least element: none (since $2$ and $3$ are incomparable).

---

## 7. Upper & Lower Bounds, LUB and GLB

Let $(A, \leq)$ be a poset and $B \subseteq A$.

| Concept | Definition |
|---------|-----------|
| **Upper bound** of $B$ | An element $u \in A$ such that $\forall b \in B,\ b \leq u$ |
| **Lower bound** of $B$ | An element $l \in A$ such that $\forall b \in B,\ l \leq b$ |
| **Least Upper Bound (LUB)** | The smallest upper bound; also called the **join** or **supremum**, written $\sup(B)$ or $a \lor b$ |
| **Greatest Lower Bound (GLB)** | The largest lower bound; also called the **meet** or **infimum**, written $\inf(B)$ or $a \land b$ |

### Example

In $(\{1,2,3,4,6,8,12,24\}, \mid)$, let $B = \{4, 6\}$:

- Upper bounds of $B$: $12, 24$ (both are divisible by $4$ and $6$).
- LUB: $12$ (the smallest among upper bounds; $\text{lcm}(4,6) = 12$).
- Lower bounds of $B$: $1, 2$ (both divide $4$ and $6$).
- GLB: $2$ (the largest among lower bounds; $\gcd(4,6) = 2$).

A poset where every pair of elements has both a LUB and a GLB is called a **lattice**.

---

## 8. The Well-Ordering Principle

A set $S$ is **well-ordered** by $\leq$ if every non-empty subset of $S$ has a **least element**.

$$\forall B \subseteq S,\ B \neq \emptyset \implies \exists\, l \in B\ \text{such that}\ \forall b \in B,\ l \leq b$$

Key facts:

- Every well-ordered set is totally ordered (but not vice-versa).
- $(\mathbb{N}, \leq)$ is well-ordered — this is the basis for strong induction and the principle of mathematical induction.
- $(\mathbb{Z}, \leq)$ is **not** well-ordered (e.g., $\mathbb{Z}$ itself has no least element).

The Well-Ordering Principle is logically equivalent to the Axiom of Choice and Zorn's Lemma.

---

## 9. Code — Check If a Relation Is a Partial Order

Given a set and a list of pairs representing a relation, we verify reflexivity, antisymmetry, and transitivity.

```cpp
#include <iostream>
#include <vector>
#include <set>
#include <algorithm>
using namespace std;

struct PartialOrderChecker {
    set<int> elements;
    set<pair<int,int>> relation;

    bool isReflexive() {
        for (int a : elements) {
            if (relation.find({a, a}) == relation.end())
                return false;
        }
        return true;
    }

    bool isAntisymmetric() {
        for (auto& [a, b] : relation) {
            if (a != b && relation.count({b, a}))
                return false;
        }
        return true;
    }

    bool isTransitive() {
        for (auto& [a, b] : relation) {
            for (auto& [c, d] : relation) {
                if (b == c && !relation.count({a, d}))
                    return false;
            }
        }
        return true;
    }

    bool isPartialOrder() {
        return isReflexive() && isAntisymmetric() && isTransitive();
    }
};

int main() {
    PartialOrderChecker checker;
    checker.elements = {1, 2, 3, 6};
    // Divisibility relation on {1, 2, 3, 6}
    checker.relation = {
        {1,1},{2,2},{3,3},{6,6},
        {1,2},{1,3},{1,6},{2,6},{3,6}
    };

    cout << "Is partial order: "
         << (checker.isPartialOrder() ? "Yes" : "No") << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class PartialOrderChecker
{
    private HashSet<int> elements;
    private HashSet<(int, int)> relation;

    public PartialOrderChecker(HashSet<int> elems, HashSet<(int, int)> rel)
    {
        elements = elems;
        relation = rel;
    }

    public bool IsReflexive()
    {
        return elements.All(a => relation.Contains((a, a)));
    }

    public bool IsAntisymmetric()
    {
        return relation.All(pair =>
            pair.Item1 == pair.Item2 || !relation.Contains((pair.Item2, pair.Item1)));
    }

    public bool IsTransitive()
    {
        foreach (var (a, b) in relation)
            foreach (var (c, d) in relation)
                if (b == c && !relation.Contains((a, d)))
                    return false;
        return true;
    }

    public bool IsPartialOrder()
    {
        return IsReflexive() && IsAntisymmetric() && IsTransitive();
    }

    static void Main()
    {
        var elems = new HashSet<int> { 1, 2, 3, 6 };
        var rel = new HashSet<(int, int)>
        {
            (1,1),(2,2),(3,3),(6,6),
            (1,2),(1,3),(1,6),(2,6),(3,6)
        };

        var checker = new PartialOrderChecker(elems, rel);
        Console.WriteLine($"Is partial order: {checker.IsPartialOrder()}");
    }
}
```

```java
import java.util.*;

public class PartialOrderChecker {
    private Set<Integer> elements;
    private Set<List<Integer>> relation;

    public PartialOrderChecker(Set<Integer> elements, Set<List<Integer>> relation) {
        this.elements = elements;
        this.relation = relation;
    }

    public boolean isReflexive() {
        for (int a : elements) {
            if (!relation.contains(List.of(a, a)))
                return false;
        }
        return true;
    }

    public boolean isAntisymmetric() {
        for (List<Integer> pair : relation) {
            int a = pair.get(0), b = pair.get(1);
            if (a != b && relation.contains(List.of(b, a)))
                return false;
        }
        return true;
    }

    public boolean isTransitive() {
        for (List<Integer> p1 : relation) {
            for (List<Integer> p2 : relation) {
                if (p1.get(1).equals(p2.get(0))) {
                    if (!relation.contains(List.of(p1.get(0), p2.get(1))))
                        return false;
                }
            }
        }
        return true;
    }

    public boolean isPartialOrder() {
        return isReflexive() && isAntisymmetric() && isTransitive();
    }

    public static void main(String[] args) {
        Set<Integer> elems = new HashSet<>(Set.of(1, 2, 3, 6));
        Set<List<Integer>> rel = new HashSet<>(Set.of(
            List.of(1,1), List.of(2,2), List.of(3,3), List.of(6,6),
            List.of(1,2), List.of(1,3), List.of(1,6),
            List.of(2,6), List.of(3,6)
        ));

        PartialOrderChecker checker = new PartialOrderChecker(elems, rel);
        System.out.println("Is partial order: " + checker.isPartialOrder());
    }
}
```

```python
def is_reflexive(elements, relation):
    """Check if every element is related to itself."""
    return all((a, a) in relation for a in elements)


def is_antisymmetric(relation):
    """Check that no two distinct elements relate both ways."""
    for (a, b) in relation:
        if a != b and (b, a) in relation:
            return False
    return True


def is_transitive(relation):
    """Check that chains extend: (a,b) and (b,c) imply (a,c)."""
    for (a, b) in relation:
        for (c, d) in relation:
            if b == c and (a, d) not in relation:
                return False
    return True


def is_partial_order(elements, relation):
    """A relation is a partial order if it's reflexive, antisymmetric, and transitive."""
    return (is_reflexive(elements, relation)
            and is_antisymmetric(relation)
            and is_transitive(relation))


# Example: divisibility on {1, 2, 3, 6}
elements = {1, 2, 3, 6}
relation = {
    (1,1), (2,2), (3,3), (6,6),
    (1,2), (1,3), (1,6), (2,6), (3,6)
}

print(f"Is partial order: {is_partial_order(elements, relation)}")
```

```javascript
function isReflexive(elements, relation) {
  const relSet = new Set(relation.map(([a, b]) => `${a},${b}`));
  return elements.every((a) => relSet.has(`${a},${a}`));
}

function isAntisymmetric(relation) {
  const relSet = new Set(relation.map(([a, b]) => `${a},${b}`));
  for (const [a, b] of relation) {
    if (a !== b && relSet.has(`${b},${a}`)) return false;
  }
  return true;
}

function isTransitive(relation) {
  const relSet = new Set(relation.map(([a, b]) => `${a},${b}`));
  for (const [a, b] of relation) {
    for (const [c, d] of relation) {
      if (b === c && !relSet.has(`${a},${d}`)) return false;
    }
  }
  return true;
}

function isPartialOrder(elements, relation) {
  return (
    isReflexive(elements, relation) &&
    isAntisymmetric(relation) &&
    isTransitive(relation)
  );
}

// Divisibility on {1, 2, 3, 6}
const elements = [1, 2, 3, 6];
const relation = [
  [1,1],[2,2],[3,3],[6,6],
  [1,2],[1,3],[1,6],[2,6],[3,6],
];

console.log("Is partial order:", isPartialOrder(elements, relation));
```

---

## 10. Practice Problems

1. Draw the Hasse diagram for $(\{1, 2, 3, 4, 5, 6, 10, 12, 15, 30\}, \mid)$.
2. Identify all maximal and minimal elements in the poset from problem 1.
3. Find LUB and GLB of $\{4, 6\}$ and of $\{2, 5\}$ in that poset.
4. Is the alphabetical ordering of English words a total order? Why?
5. Prove that the intersection of two partial orders on the same set is also a partial order.

---

## Key Takeaways

- A **partial order** is a relation that is reflexive, antisymmetric, and transitive (RAT).
- A set with a partial order is called a **poset**.
- Not every pair of elements needs to be comparable — that's what makes it *partial*.
- A **total order** is a partial order where every pair is comparable.
- **Hasse diagrams** strip away redundant edges (reflexive and transitive) for clean visualization.
- **Maximal/minimal** elements have nothing above/below them; **greatest/least** elements dominate everything.
- **LUB (join)** and **GLB (meet)** generalize max and min to partial orders.
- The **Well-Ordering Principle** guarantees a least element in every non-empty subset — the foundation of induction.
- In the divisibility poset, LUB corresponds to LCM and GLB corresponds to GCD.
