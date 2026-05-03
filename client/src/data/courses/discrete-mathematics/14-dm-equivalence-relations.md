---
title: Equivalence Relations & Partitions
---

# Equivalence Relations & Partitions

Equivalence relations are one of the most powerful ideas in mathematics. They formalize the concept of "sameness" — grouping objects that share a common property. Whenever you sort items into categories, you're implicitly using an equivalence relation.

---

## Definition of an Equivalence Relation

A relation $R$ on a set $A$ is an **equivalence relation** if it satisfies three properties simultaneously:

1. **Reflexive:** $\forall a \in A: a \mathrel{R} a$ (everything is equivalent to itself)
2. **Symmetric:** $\forall a, b \in A: a \mathrel{R} b \implies b \mathrel{R} a$ (equivalence goes both ways)
3. **Transitive:** $\forall a, b, c \in A: a \mathrel{R} b \land b \mathrel{R} c \implies a \mathrel{R} c$ (equivalence chains together)

We often use the symbol $\sim$ for equivalence relations, writing $a \sim b$ to mean "$a$ is equivalent to $b$."

### Real-World Analogy

Think of sorting laundry by color:
- **Reflexive:** Every shirt is the same color as itself.
- **Symmetric:** If shirt A is the same color as shirt B, then shirt B is the same color as shirt A.
- **Transitive:** If shirt A matches shirt B's color, and shirt B matches shirt C's color, then shirt A matches shirt C's color.

The result? Your laundry naturally divides into piles (white, dark, colored) — these are **equivalence classes**.

---

## Examples of Equivalence Relations

### Example 1: Congruence Modulo $n$

On the integers $\mathbb{Z}$, define:

$$a \equiv b \pmod{n} \iff n \mid (a - b)$$

This means $a$ and $b$ have the same remainder when divided by $n$.

**Verification for $n = 3$:**
- **Reflexive:** $a - a = 0$, and $3 \mid 0$ ✓
- **Symmetric:** If $3 \mid (a - b)$, then $3 \mid (-(a-b)) = (b - a)$ ✓
- **Transitive:** If $3 \mid (a-b)$ and $3 \mid (b-c)$, then $3 \mid ((a-b) + (b-c)) = (a-c)$ ✓

The equivalence classes are:
- $[0] = \{\ldots, -6, -3, 0, 3, 6, 9, \ldots\}$ (remainder 0)
- $[1] = \{\ldots, -5, -2, 1, 4, 7, 10, \ldots\}$ (remainder 1)
- $[2] = \{\ldots, -4, -1, 2, 5, 8, 11, \ldots\}$ (remainder 2)

Every integer falls into exactly one class.

### Example 2: Same First Letter

On the set of English words, define:

$$w_1 \sim w_2 \iff w_1 \text{ and } w_2 \text{ start with the same letter}$$

- **Reflexive:** Every word starts with its own first letter ✓
- **Symmetric:** If "apple" has the same first letter as "ant", then "ant" has the same first letter as "apple" ✓
- **Transitive:** If word A and word B start with the same letter, and word B and word C start with the same letter, then A and C start with the same letter ✓

This gives 26 equivalence classes (one per letter of the alphabet).

### Example 3: Same Birthday

On the set of all people:

$$p_1 \sim p_2 \iff p_1 \text{ and } p_2 \text{ were born on the same date}$$

- **Reflexive:** You share a birthday with yourself ✓
- **Symmetric:** Mutual ✓
- **Transitive:** Chains correctly ✓

This partitions all people into 366 groups (one for each possible day, including Feb 29).

### Example 4: Parallel Lines

On the set of all lines in a plane:

$$\ell_1 \sim \ell_2 \iff \ell_1 \text{ is parallel to } \ell_2$$

(Convention: every line is parallel to itself.)

This groups lines by their slope/direction.

### Non-Example: "Is Friends With"

On a set of people, "is friends with" is typically:
- **Reflexive:** Debatable (are you friends with yourself?)
- **Symmetric:** Usually yes (on social media, at least)
- **Transitive:** NO! Your friend's friend isn't necessarily your friend.

Since transitivity fails, this is NOT an equivalence relation.

---

## Equivalence Classes

Given an equivalence relation $\sim$ on a set $A$ and an element $a \in A$, the **equivalence class of $a$** is:

$$[a] = \{x \in A : x \sim a\}$$

This is the set of ALL elements equivalent to $a$.

### Properties of Equivalence Classes

1. **Non-empty:** $a \in [a]$ always (by reflexivity), so $[a] \neq \emptyset$.

2. **Complete coverage:** Every element belongs to some equivalence class, so $\bigcup_{a \in A} [a] = A$.

3. **Identical or disjoint:** For any two elements $a, b \in A$:
   - Either $[a] = [b]$ (they're in the same class)
   - Or $[a] \cap [b] = \emptyset$ (they're in completely different classes)

   There's no "partial overlap."

### Why No Partial Overlap?

**Proof sketch:** Suppose $[a] \cap [b] \neq \emptyset$, so there exists $c \in [a] \cap [b]$. Then $c \sim a$ and $c \sim b$. By symmetry, $a \sim c$. By transitivity, $a \sim b$. Now for any $x \in [a]$, we have $x \sim a \sim b$, so $x \in [b]$. Similarly, any $x \in [b]$ is in $[a]$. Therefore $[a] = [b]$.

### Example: Congruence Mod 4

On $\mathbb{Z}$, define $a \sim b \iff 4 \mid (a - b)$.

The equivalence classes are:

$$[0] = \{\ldots, -8, -4, 0, 4, 8, 12, \ldots\}$$
$$[1] = \{\ldots, -7, -3, 1, 5, 9, 13, \ldots\}$$
$$[2] = \{\ldots, -6, -2, 2, 6, 10, 14, \ldots\}$$
$$[3] = \{\ldots, -5, -1, 3, 7, 11, 15, \ldots\}$$

Note: $[0] = [4] = [8] = [-4] = \ldots$ — any element of a class can serve as its **representative**.

---

## Partitions

A **partition** of a set $A$ is a collection of non-empty subsets $\{A_1, A_2, A_3, \ldots\}$ such that:

1. **Exhaustive (cover all of $A$):** $A_1 \cup A_2 \cup A_3 \cup \ldots = A$
2. **Mutually exclusive (no overlaps):** $A_i \cap A_j = \emptyset$ for all $i \neq j$

Each subset $A_i$ is called a **block** or **cell** of the partition.

### Real-World Analogy

Think of dividing students into study groups:
- Every student must be in exactly one group (no one left out, no one in two groups).
- The groups together account for everyone.
- That's a partition of the class.

### Examples

**Set:** $A = \{1, 2, 3, 4, 5, 6\}$

**Valid partitions:**
- $\{\{1, 2\}, \{3, 4\}, \{5, 6\}\}$ — pairs
- $\{\{1, 3, 5\}, \{2, 4, 6\}\}$ — odd/even
- $\{\{1\}, \{2\}, \{3\}, \{4\}, \{5\}, \{6\}\}$ — singletons (finest partition)
- $\{\{1, 2, 3, 4, 5, 6\}\}$ — one block (coarsest partition)

**Invalid partitions:**
- $\{\{1, 2\}, \{3, 4\}\}$ — missing 5 and 6
- $\{\{1, 2, 3\}, \{3, 4, 5, 6\}\}$ — element 3 appears in two blocks
- $\{\{1, 2\}, \emptyset, \{3, 4, 5, 6\}\}$ — contains an empty set

---

## The Fundamental Theorem: Equivalence Relations ↔ Partitions

This is one of the most elegant results in discrete mathematics:

> **Theorem:** There is a one-to-one correspondence between equivalence relations on a set $A$ and partitions of $A$.

This means:
1. **Every equivalence relation induces a partition:** The equivalence classes form a partition.
2. **Every partition induces an equivalence relation:** Define $a \sim b$ iff $a$ and $b$ are in the same block.

### Direction 1: Equivalence Relation → Partition

Given an equivalence relation $\sim$ on $A$, the collection of all distinct equivalence classes $\{[a] : a \in A\}$ is a partition of $A$.

**Why?**
- Each class is non-empty (reflexivity ensures $a \in [a]$).
- Classes cover $A$ (every element is in its own class).
- Classes are disjoint (we proved this above).

### Direction 2: Partition → Equivalence Relation

Given a partition $\mathcal{P} = \{A_1, A_2, \ldots\}$ of $A$, define:

$$a \sim b \iff a \text{ and } b \text{ are in the same block of } \mathcal{P}$$

**Verification:**
- **Reflexive:** $a$ is in the same block as itself ✓
- **Symmetric:** If $a$ and $b$ are in the same block, so are $b$ and $a$ ✓
- **Transitive:** If $a, b$ are in block $A_i$ and $b, c$ are in the same block as $b$ (which is $A_i$), then $a, c$ are both in $A_i$ ✓

### The Two Directions Are Inverses

If you start with an equivalence relation, form the partition, then derive the equivalence relation from that partition — you get back the original relation. And vice versa.

### Visual Summary

$$\text{Equivalence Relation on } A \xleftrightarrow{\text{1-to-1}} \text{Partition of } A$$

---

## The Quotient Set

The **quotient set** of $A$ by the equivalence relation $\sim$ is the set of all equivalence classes:

$$A / {\sim} = \{[a] : a \in A\}$$

This is read as "$A$ modulo $\sim$" or "$A$ mod $\sim$."

### Examples

1. $\mathbb{Z} / {\equiv_3}$ (integers mod 3) $= \{[0], [1], [2]\}$ — a set with 3 elements.

2. For the "same first letter" relation on English words: the quotient set has 26 elements (one per letter).

3. For the "same birthday" relation on people: the quotient set has 366 elements.

### Key Insight

The quotient set "collapses" equivalent elements into a single representative. It's a way of creating a simpler structure from a complex one by ignoring distinctions that don't matter for your purposes.

**Analogy:** When you look at a map color-coded by country, you've taken the set of all geographic points and formed the quotient set by the "same country" equivalence relation.

### Size of the Quotient Set

If $A$ is finite with $|A| = n$, and the equivalence classes have sizes $k_1, k_2, \ldots, k_m$, then:

$$|A/{\sim}| = m \quad \text{and} \quad k_1 + k_2 + \cdots + k_m = n$$

---

## Counting Equivalence Relations

How many equivalence relations exist on a set of size $n$? This equals the number of partitions of an $n$-element set, given by the **Bell number** $B_n$:

| $n$ | $B_n$ | Partitions |
|-----|--------|------------|
| 1 | 1 | $\{\{1\}\}$ |
| 2 | 2 | $\{\{1,2\}\}$, $\{\{1\},\{2\}\}$ |
| 3 | 5 | $\{\{1,2,3\}\}$, $\{\{1,2\},\{3\}\}$, $\{\{1,3\},\{2\}\}$, $\{\{2,3\},\{1\}\}$, $\{\{1\},\{2\},\{3\}\}$ |
| 4 | 15 | |
| 5 | 52 | |

Bell numbers grow rapidly — there's no simple closed form, but they satisfy the recurrence:

$$B_{n+1} = \sum_{k=0}^{n} \binom{n}{k} B_k$$

---

## Code: Finding Equivalence Classes

Let's implement algorithms to find equivalence classes given a relation or a "sameness" function.

### Python

```python
def find_equivalence_classes(A, relation):
    """
    Find equivalence classes given a set and a relation function.

    Args:
        A: iterable of elements
        relation: function(a, b) -> bool, returns True if a ~ b

    Returns:
        List of sets, each set is an equivalence class
    """
    elements = list(A)
    visited = set()
    classes = []

    for a in elements:
        if a in visited:
            continue

        # Find all elements equivalent to a
        eq_class = set()
        for b in elements:
            if relation(a, b):
                eq_class.add(b)
                visited.add(b)

        classes.append(eq_class)

    return classes


def find_classes_union_find(A, relation):
    """
    Find equivalence classes using Union-Find (more efficient).

    Works by merging elements that are related.
    """
    parent = {a: a for a in A}
    rank = {a: 0 for a in A}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  # Path compression
        return parent[x]

    def union(x, y):
        rx, ry = find(x), find(y)
        if rx == ry:
            return
        # Union by rank
        if rank[rx] < rank[ry]:
            parent[rx] = ry
        elif rank[rx] > rank[ry]:
            parent[ry] = rx
        else:
            parent[ry] = rx
            rank[rx] += 1

    # Merge all related pairs
    elements = list(A)
    for i, a in enumerate(elements):
        for b in elements[i + 1:]:
            if relation(a, b):
                union(a, b)

    # Group by representative
    from collections import defaultdict
    groups = defaultdict(set)
    for a in elements:
        groups[find(a)].add(a)

    return list(groups.values())


# Example 1: Congruence mod 3 on {0, 1, 2, ..., 11}
print("=== Congruence mod 3 on {0..11} ===")
A = set(range(12))
mod3 = lambda a, b: (a - b) % 3 == 0

classes = find_equivalence_classes(A, mod3)
for i, cls in enumerate(sorted(classes, key=min)):
    print(f"  Class {i}: {sorted(cls)}")

print(f"  Quotient set size: {len(classes)}")


# Example 2: Same last digit on {0, 1, ..., 29}
print("\n=== Same last digit on {0..29} ===")
A2 = set(range(30))
same_last_digit = lambda a, b: a % 10 == b % 10

classes2 = find_classes_union_find(A2, same_last_digit)
for cls in sorted(classes2, key=min):
    print(f"  [{min(cls)}] = {sorted(cls)}")


# Example 3: Same absolute value on {-3, -2, -1, 0, 1, 2, 3}
print("\n=== Same absolute value on {-3..3} ===")
A3 = set(range(-3, 4))
same_abs = lambda a, b: abs(a) == abs(b)

classes3 = find_equivalence_classes(A3, same_abs)
for cls in sorted(classes3, key=lambda s: abs(min(s))):
    print(f"  {sorted(cls)}")


# Verify the partition property
print("\n=== Verification ===")
all_elements = set()
for cls in classes3:
    all_elements.update(cls)
print(f"  Union of all classes = A? {all_elements == A3}")

for i, c1 in enumerate(classes3):
    for j, c2 in enumerate(classes3):
        if i < j:
            assert c1.isdisjoint(c2), "Classes overlap!"
print("  All classes disjoint? True")
```

### JavaScript

```javascript
function findEquivalenceClasses(A, relation) {
  /**
   * Find equivalence classes using a simple grouping approach.
   * @param {Array} A - The set of elements
   * @param {Function} relation - (a, b) => boolean
   * @returns {Array<Set>} - Array of equivalence classes
   */
  const elements = [...A];
  const visited = new Set();
  const classes = [];

  for (const a of elements) {
    if (visited.has(a)) continue;

    const eqClass = new Set();
    for (const b of elements) {
      if (relation(a, b)) {
        eqClass.add(b);
        visited.add(b);
      }
    }
    classes.push(eqClass);
  }

  return classes;
}

// Union-Find implementation for efficient class detection
class UnionFind {
  constructor(elements) {
    this.parent = new Map();
    this.rank = new Map();
    for (const e of elements) {
      this.parent.set(e, e);
      this.rank.set(e, 0);
    }
  }

  find(x) {
    if (this.parent.get(x) !== x) {
      this.parent.set(x, this.find(this.parent.get(x)));
    }
    return this.parent.get(x);
  }

  union(x, y) {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return;

    const rankX = this.rank.get(rx);
    const rankY = this.rank.get(ry);

    if (rankX < rankY) {
      this.parent.set(rx, ry);
    } else if (rankX > rankY) {
      this.parent.set(ry, rx);
    } else {
      this.parent.set(ry, rx);
      this.rank.set(rx, rankX + 1);
    }
  }

  getClasses() {
    const groups = new Map();
    for (const [elem] of this.parent) {
      const root = this.find(elem);
      if (!groups.has(root)) groups.set(root, new Set());
      groups.get(root).add(elem);
    }
    return [...groups.values()];
  }
}

// Example: Congruence mod 4 on {0, 1, ..., 15}
const A = Array.from({ length: 16 }, (_, i) => i);
const mod4 = (a, b) => (a - b) % 4 === 0 && (a - b) % 4 === 0
  ? true
  : (((a - b) % 4) + 4) % 4 === 0;

const uf = new UnionFind(A);
for (let i = 0; i < A.length; i++) {
  for (let j = i + 1; j < A.length; j++) {
    if (mod4(A[i], A[j])) {
      uf.union(A[i], A[j]);
    }
  }
}

console.log("Congruence mod 4 on {0..15}:");
const classes = uf.getClasses();
for (const cls of classes.sort((a, b) => Math.min(...a) - Math.min(...b))) {
  console.log(`  [${Math.min(...cls)}] = {${[...cls].sort((a, b) => a - b).join(", ")}}`);
}
console.log(`  |Z/≡₄| = ${classes.length}`);
```

### C++

```cpp
#include <iostream>
#include <vector>
#include <set>
#include <map>
#include <functional>
#include <algorithm>
#include <numeric>
using namespace std;

class UnionFind {
    vector<int> parent, rank_;
public:
    UnionFind(int n) : parent(n), rank_(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    void unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return;
        if (rank_[rx] < rank_[ry]) swap(rx, ry);
        parent[ry] = rx;
        if (rank_[rx] == rank_[ry]) rank_[rx]++;
    }
};

vector<vector<int>> findEquivalenceClasses(
    const vector<int>& A,
    function<bool(int, int)> relation
) {
    int n = A.size();
    UnionFind uf(n);

    // Merge elements that are related
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (relation(A[i], A[j])) {
                uf.unite(i, j);
            }
        }
    }

    // Group by representative
    map<int, vector<int>> groups;
    for (int i = 0; i < n; i++) {
        groups[uf.find(i)].push_back(A[i]);
    }

    vector<vector<int>> classes;
    for (auto& [rep, members] : groups) {
        sort(members.begin(), members.end());
        classes.push_back(members);
    }
    return classes;
}

int main() {
    // Congruence mod 5 on {0, 1, ..., 19}
    vector<int> A(20);
    iota(A.begin(), A.end(), 0);

    auto mod5 = [](int a, int b) {
        return ((a - b) % 5 + 5) % 5 == 0;
    };

    auto classes = findEquivalenceClasses(A, mod5);

    cout << "Congruence mod 5 on {0..19}:" << endl;
    for (auto& cls : classes) {
        cout << "  [" << cls[0] << "] = {";
        for (int i = 0; i < cls.size(); i++) {
            cout << cls[i];
            if (i < cls.size() - 1) cout << ", ";
        }
        cout << "}" << endl;
    }
    cout << "  Quotient set size: " << classes.size() << endl;

    return 0;
}
```

### Java

```java
import java.util.*;
import java.util.function.BiPredicate;
import java.util.stream.Collectors;

public class EquivalenceClasses {

    // Union-Find with path compression and union by rank
    static int[] parent, rank;

    static void init(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    static int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);
        return parent[x];
    }

    static void union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return;
        if (rank[rx] < rank[ry]) { int t = rx; rx = ry; ry = t; }
        parent[ry] = rx;
        if (rank[rx] == rank[ry]) rank[rx]++;
    }

    static List<Set<Integer>> findClasses(int[] A, BiPredicate<Integer, Integer> relation) {
        int n = A.length;
        init(n);

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (relation.test(A[i], A[j])) {
                    union(i, j);
                }
            }
        }

        Map<Integer, Set<Integer>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) {
            groups.computeIfAbsent(find(i), k -> new TreeSet<>()).add(A[i]);
        }

        return new ArrayList<>(groups.values());
    }

    public static void main(String[] args) {
        // Congruence mod 3 on {0, 1, ..., 11}
        int[] A = new int[12];
        for (int i = 0; i < 12; i++) A[i] = i;

        BiPredicate<Integer, Integer> mod3 = (a, b) -> Math.floorMod(a - b, 3) == 0;

        List<Set<Integer>> classes = findClasses(A, mod3);

        System.out.println("Congruence mod 3 on {0..11}:");
        for (Set<Integer> cls : classes) {
            int rep = cls.iterator().next();
            System.out.println("  [" + rep + "] = " + cls);
        }
        System.out.println("  |Z/≡₃| = " + classes.size());
    }
}
```

---

## Building Intuition: From Partition to Equivalence

Let's trace through a concrete example in both directions.

### Forward: Relation → Classes → Partition

**Given:** On $A = \{1, 2, 3, 4, 5, 6\}$, define $a \sim b \iff a \equiv b \pmod{3}$.

**Step 1:** Identify the relation pairs (partial list):
$(1,1), (1,4), (4,1), (4,4), (2,2), (2,5), (5,2), (5,5), (3,3), (3,6), (6,3), (6,6)$

**Step 2:** Find equivalence classes:
- $[1] = \{1, 4\}$ (remainder 1 when divided by 3)
- $[2] = \{2, 5\}$ (remainder 2)
- $[3] = \{3, 6\}$ (remainder 0)

**Step 3:** The partition is $\{\{1,4\}, \{2,5\}, \{3,6\}\}$.

### Backward: Partition → Relation

**Given:** The partition $\{\{a, b, c\}, \{d, e\}, \{f\}\}$ of set $\{a, b, c, d, e, f\}$.

**The induced relation:** Two elements are equivalent iff they share a block:
- $a \sim b, a \sim c, b \sim c$ (all in first block)
- $d \sim e$ (both in second block)
- $f \sim f$ (alone in third block)
- Plus all self-pairs: $a \sim a, b \sim b, \ldots, f \sim f$

---

## Applications of Equivalence Relations

### 1. Modular Arithmetic

The foundation of modern cryptography. Operations on $\mathbb{Z}/n\mathbb{Z}$ (integers mod $n$) power RSA, Diffie-Hellman, and elliptic curve cryptography.

### 2. Data Deduplication

In databases, records representing the "same entity" (e.g., same person with different spellings) form equivalence classes. Finding these classes is the "record linkage" problem.

### 3. Graph Connected Components

In an undirected graph, "there exists a path between $u$ and $v$" is an equivalence relation. The equivalence classes are the connected components.

### 4. Type Equivalence in Programming

In type theory, structural type equivalence (two types are equivalent if they have the same structure) is an equivalence relation used by compilers.

### 5. Image Segmentation

Pixels with "similar color" (within a threshold) form equivalence classes — this is the basis of region-growing segmentation algorithms.

---

## Refinement and Coarsening

Partitions can be compared by how finely they divide a set.

**Refinement:** Partition $\mathcal{P}_1$ **refines** $\mathcal{P}_2$ if every block of $\mathcal{P}_1$ is contained in some block of $\mathcal{P}_2$.

**Example on $\{1,2,3,4,5,6\}$:**
- $\mathcal{P}_1 = \{\{1,2\}, \{3\}, \{4,5\}, \{6\}\}$ refines
- $\mathcal{P}_2 = \{\{1,2,3\}, \{4,5,6\}\}$

because $\{1,2\} \subseteq \{1,2,3\}$, $\{3\} \subseteq \{1,2,3\}$, $\{4,5\} \subseteq \{4,5,6\}$, $\{6\} \subseteq \{4,5,6\}$.

The **finest** partition puts each element alone: $\{\{1\},\{2\},\ldots\}$.
The **coarsest** partition puts everything together: $\{\{1,2,3,\ldots\}\}$.

---

## Practice Problems

1. On $\mathbb{Z}$, define $a \sim b$ iff $a + b$ is even. Prove this is an equivalence relation and find the equivalence classes.

2. On $\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$, define $a \sim b$ iff $\gcd(a, 10) = \gcd(b, 10)$. Find all equivalence classes.

3. How many equivalence relations are there on a 4-element set? List the partitions.

4. Let $A = \{1, 2, 3, 4, 5, 6\}$ with partition $\{\{1, 3, 5\}, \{2, 4, 6\}\}$. Write out the complete equivalence relation (all pairs).

5. On the set of all $2 \times 2$ matrices, define $A \sim B$ iff $\det(A) = \det(B)$. Verify this is an equivalence relation. What are the classes?

---

## Key Takeaways

- An **equivalence relation** is reflexive, symmetric, and transitive — it captures "sameness" with respect to some property.
- Common examples include congruence mod $n$, same remainder, same first letter, and same connected component in a graph.
- The **equivalence class** $[a]$ contains all elements equivalent to $a$. Classes are either identical or completely disjoint.
- A **partition** divides a set into non-empty, non-overlapping subsets that cover the entire set.
- The **fundamental theorem** establishes a perfect correspondence: every equivalence relation gives a unique partition, and every partition gives a unique equivalence relation.
- The **quotient set** $A/{\sim}$ is the set of all equivalence classes — it "simplifies" $A$ by treating equivalent elements as one.
- **Union-Find** is an efficient data structure for computing equivalence classes, running in nearly $O(n)$ amortized time per operation.
- Equivalence relations appear everywhere: modular arithmetic, databases, graph theory, type systems, and image processing.
