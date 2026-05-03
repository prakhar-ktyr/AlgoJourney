---
title: Relations & Their Properties
---

# Relations & Their Properties

In everyday life, we constantly describe how things are connected: "Alice is friends with Bob," "5 is less than 10," "Paris is the capital of France." In mathematics, **relations** give us a precise way to describe these connections between objects.

---

## What Is a Binary Relation?

A **binary relation** from set $A$ to set $B$ is any subset of the Cartesian product $A \times B$.

$$R \subseteq A \times B$$

If $(a, b) \in R$, we say "$a$ is related to $b$" and write $a \mathrel{R} b$.

### Real-World Analogy

Think of a relation as a "connection rule" between two groups:
- **Students** (set $A$) and **Courses** (set $B$): the relation "is enrolled in" connects each student to the courses they take.
- **Cities** (set $A$) and **Countries** (set $B$): the relation "is located in" connects each city to its country.

### Example

Let $A = \{1, 2, 3\}$ and $B = \{a, b\}$.

The Cartesian product $A \times B = \{(1,a), (1,b), (2,a), (2,b), (3,a), (3,b)\}$.

A relation $R$ from $A$ to $B$ could be:

$$R = \{(1, a), (2, b), (3, a)\}$$

This means: 1 is related to $a$, 2 is related to $b$, and 3 is related to $a$.

---

## Relation on a Set

A **relation on a set** $A$ is a relation from $A$ to itself — that is, a subset of $A \times A$.

$$R \subseteq A \times A$$

### Example

Let $A = \{1, 2, 3, 4\}$ and define $R$ = "divides" (written $a \mid b$):

$$R = \{(1,1), (1,2), (1,3), (1,4), (2,2), (2,4), (3,3), (4,4)\}$$

Here $1 \mathrel{R} 4$ because $1$ divides $4$, but $(3, 4) \notin R$ because $3$ does not divide $4$.

### Why Relations on a Set Matter

Most interesting mathematical relations (equality, less than, divisibility, congruence) are relations on a single set. The properties we study next apply specifically to these.

---

## Representing Relations

There are three common ways to represent a relation on a finite set.

### 1. Set of Ordered Pairs

Simply list all pairs $(a, b)$ where $a \mathrel{R} b$.

**Example:** On $A = \{1, 2, 3\}$, the "less than" relation:

$$R_{<} = \{(1,2), (1,3), (2,3)\}$$

This is precise but can be bulky for large sets.

### 2. Relation Matrix (Boolean Matrix)

For $A = \{a_1, a_2, \ldots, a_n\}$, create an $n \times n$ matrix $M$ where:

$$M_{ij} = \begin{cases} 1 & \text{if } (a_i, a_j) \in R \\ 0 & \text{otherwise} \end{cases}$$

**Example:** For $A = \{1, 2, 3\}$ with $R_{<} = \{(1,2), (1,3), (2,3)\}$:

$$M = \begin{pmatrix} 0 & 1 & 1 \\ 0 & 0 & 1 \\ 0 & 0 & 0 \end{pmatrix}$$

Row $i$, column $j$ tells you whether $a_i$ is related to $a_j$.

### 3. Directed Graph (Digraph)

Draw each element as a node. Draw an arrow from $a$ to $b$ whenever $(a, b) \in R$.

**Example:** For the "divides" relation on $\{1, 2, 3, 4\}$:
- Node 1 has arrows to 1, 2, 3, 4 (1 divides everything)
- Node 2 has arrows to 2, 4
- Node 3 has an arrow to 3
- Node 4 has an arrow to 4

Self-loops (arrows from a node to itself) indicate $(a, a) \in R$.

---

## Properties of Relations

The following five properties characterize the behavior of relations on a set. Understanding them is essential for classifying relations.

### Reflexive

A relation $R$ on $A$ is **reflexive** if every element is related to itself:

$$\forall a \in A: (a, a) \in R$$

**Intuition:** "Everyone is their own friend."

**Examples:**
- $\leq$ on integers: $a \leq a$ for all $a$ ✓
- $=$ on any set: $a = a$ for all $a$ ✓
- "divides" on positive integers: $a \mid a$ for all $a$ ✓

**Non-example:**
- $<$ on integers: $a < a$ is never true ✗

**Matrix test:** All diagonal entries are 1.

**Digraph test:** Every node has a self-loop.

---

### Irreflexive

A relation $R$ on $A$ is **irreflexive** if no element is related to itself:

$$\forall a \in A: (a, a) \notin R$$

**Intuition:** "Nobody can be their own parent."

**Examples:**
- $<$ on integers: $a < a$ is never true ✓
- $\neq$ on any set: $a \neq a$ is never true ✓
- "is a proper subset of": $A \subset A$ is never true ✓

**Important:** Reflexive and irreflexive are NOT opposites! A relation can be neither (some elements related to themselves, others not).

**Matrix test:** All diagonal entries are 0.

**Digraph test:** No node has a self-loop.

---

### Symmetric

A relation $R$ on $A$ is **symmetric** if whenever $a$ is related to $b$, then $b$ is related to $a$:

$$\forall a, b \in A: (a, b) \in R \implies (b, a) \in R$$

**Intuition:** "If Alice is friends with Bob, then Bob is friends with Alice."

**Examples:**
- $=$ on any set: if $a = b$ then $b = a$ ✓
- "has the same birthday as": mutual ✓
- "is a sibling of": mutual ✓

**Non-example:**
- $\leq$ on integers: $2 \leq 3$ but $3 \not\leq 2$ ✗
- "is a parent of": not mutual ✗

**Matrix test:** The matrix is symmetric ($M = M^T$), i.e., $M_{ij} = M_{ji}$.

**Digraph test:** Every arrow has a matching arrow in the opposite direction (or you can replace paired arrows with undirected edges).

---

### Antisymmetric

A relation $R$ on $A$ is **antisymmetric** if whenever $a$ is related to $b$ AND $b$ is related to $a$, then $a = b$:

$$\forall a, b \in A: (a, b) \in R \land (b, a) \in R \implies a = b$$

Equivalently: for distinct elements, you can never have both $(a, b)$ and $(b, a)$ in $R$.

**Intuition:** "If $a \leq b$ and $b \leq a$, they must be the same number."

**Examples:**
- $\leq$ on integers: if $a \leq b$ and $b \leq a$ then $a = b$ ✓
- "divides" on positive integers: if $a \mid b$ and $b \mid a$ then $a = b$ ✓
- $\subset$ (proper subset): can never have both $A \subset B$ and $B \subset A$ ✓

**Important:** Symmetric and antisymmetric are NOT opposites! A relation can be both (e.g., equality) or neither.

**Matrix test:** For all $i \neq j$, we cannot have both $M_{ij} = 1$ and $M_{ji} = 1$.

**Digraph test:** Between any two distinct nodes, there is at most one arrow.

---

### Transitive

A relation $R$ on $A$ is **transitive** if whenever $a$ is related to $b$ and $b$ is related to $c$, then $a$ is related to $c$:

$$\forall a, b, c \in A: (a, b) \in R \land (b, c) \in R \implies (a, c) \in R$$

**Intuition:** "If Alice is an ancestor of Bob, and Bob is an ancestor of Charlie, then Alice is an ancestor of Charlie."

**Examples:**
- $<$ on integers: if $a < b$ and $b < c$ then $a < c$ ✓
- $=$ on any set: if $a = b$ and $b = c$ then $a = c$ ✓
- "divides": if $a \mid b$ and $b \mid c$ then $a \mid c$ ✓
- "is a subset of": if $A \subseteq B$ and $B \subseteq C$ then $A \subseteq C$ ✓

**Non-example:**
- "is friends with": Alice friends with Bob, Bob friends with Charlie, does NOT guarantee Alice friends with Charlie ✗

**Matrix test:** If $M_{ij} = 1$ and $M_{jk} = 1$, then $M_{ik} = 1$ (or equivalently, $M^2$ has no 1 where $M$ has a 0, considering Boolean multiplication).

**Digraph test:** Whenever there is a path of length 2 from $a$ to $c$ (through some $b$), there is also a direct arrow from $a$ to $c$.

---

## Testing Properties with Examples

### Example 1: "Less than or equal" ($\leq$) on $\{1, 2, 3\}$

$$R = \{(1,1), (1,2), (1,3), (2,2), (2,3), (3,3)\}$$

| Property | Test | Result |
|----------|------|--------|
| Reflexive | $(1,1), (2,2), (3,3) \in R$? | ✓ Yes |
| Irreflexive | Any $(a,a) \in R$? | ✗ No (has self-loops) |
| Symmetric | $(1,2) \in R$ but $(2,1) \notin R$ | ✗ No |
| Antisymmetric | No pair $(a,b)$ and $(b,a)$ with $a \neq b$? | ✓ Yes |
| Transitive | $(1,2) \in R, (2,3) \in R, (1,3) \in R$? Check all chains | ✓ Yes |

**Conclusion:** $\leq$ is reflexive, antisymmetric, and transitive — it's a **partial order**.

### Example 2: "Not equal" ($\neq$) on $\{1, 2, 3\}$

$$R = \{(1,2), (1,3), (2,1), (2,3), (3,1), (3,2)\}$$

| Property | Test | Result |
|----------|------|--------|
| Reflexive | $(1,1) \in R$? | ✗ No |
| Irreflexive | No $(a,a) \in R$? | ✓ Yes |
| Symmetric | $(1,2) \in R$ and $(2,1) \in R$; check all | ✓ Yes |
| Antisymmetric | $(1,2) \in R$ and $(2,1) \in R$ but $1 \neq 2$ | ✗ No |
| Transitive | $(1,2) \in R, (2,1) \in R$, need $(1,1) \in R$? | ✗ No |

**Conclusion:** $\neq$ is irreflexive and symmetric, but not transitive.

### Example 3: "Divides" ($\mid$) on $\{1, 2, 3, 6\}$

$$R = \{(1,1),(1,2),(1,3),(1,6),(2,2),(2,6),(3,3),(3,6),(6,6)\}$$

| Property | Test | Result |
|----------|------|--------|
| Reflexive | $(1,1), (2,2), (3,3), (6,6) \in R$? | ✓ Yes |
| Symmetric | $(1,2) \in R$ but $(2,1) \notin R$ | ✗ No |
| Antisymmetric | Never have $a \mid b$ and $b \mid a$ with $a \neq b$ (for these numbers) | ✓ Yes |
| Transitive | $1 \mid 2$ and $2 \mid 6 \Rightarrow 1 \mid 6$ ✓; check all chains | ✓ Yes |

---

## Combining Properties

Certain combinations of properties give rise to important named relations:

### Equivalence Relation

A relation that is **reflexive + symmetric + transitive**.

**Examples:** equality, congruence mod $n$, "same color as"

**Key idea:** Groups elements into clusters where everything in a cluster is "equivalent."

### Partial Order

A relation that is **reflexive + antisymmetric + transitive**.

**Examples:** $\leq$, $\subseteq$, "divides"

**Key idea:** Arranges elements in a hierarchy where some pairs are comparable.

### Strict Partial Order

A relation that is **irreflexive + antisymmetric + transitive**.

**Examples:** $<$, $\subset$ (proper subset)

**Key idea:** Like a partial order, but no element is related to itself.

### Summary Table

| Combination | Name | Example |
|-------------|------|---------|
| Reflexive + Symmetric + Transitive | Equivalence relation | $=, \equiv \pmod{n}$ |
| Reflexive + Antisymmetric + Transitive | Partial order | $\leq, \subseteq, \mid$ |
| Irreflexive + Antisymmetric + Transitive | Strict partial order | $<, \subset$ |
| Reflexive + Symmetric | Tolerance relation | "lives near" |
| Irreflexive + Symmetric | — | $\neq$ (but $\neq$ isn't transitive) |

---

## Code: Representing a Relation and Checking Properties

Let's implement a relation checker that takes a set and a relation (as a list of pairs) and tests all five properties.

### Python

```python
def is_reflexive(A, R):
    """Check if every element is related to itself."""
    for a in A:
        if (a, a) not in R:
            return False
    return True


def is_irreflexive(A, R):
    """Check if no element is related to itself."""
    for a in A:
        if (a, a) in R:
            return False
    return True


def is_symmetric(A, R):
    """Check if (a,b) in R implies (b,a) in R."""
    for (a, b) in R:
        if (b, a) not in R:
            return False
    return True


def is_antisymmetric(A, R):
    """Check if (a,b) in R and (b,a) in R implies a == b."""
    for (a, b) in R:
        if a != b and (b, a) in R:
            return False
    return True


def is_transitive(A, R):
    """Check if (a,b) in R and (b,c) in R implies (a,c) in R."""
    for (a, b) in R:
        for (c, d) in R:
            if b == c and (a, d) not in R:
                return False
    return True


def classify_relation(A, R):
    """Classify a relation by checking all properties."""
    R_set = set(R)  # Convert to set for O(1) lookup

    props = {
        "Reflexive": is_reflexive(A, R_set),
        "Irreflexive": is_irreflexive(A, R_set),
        "Symmetric": is_symmetric(A, R_set),
        "Antisymmetric": is_antisymmetric(A, R_set),
        "Transitive": is_transitive(A, R_set),
    }

    return props


# Example: "less than or equal" on {1, 2, 3}
A = {1, 2, 3}
R_leq = [(a, b) for a in A for b in A if a <= b]

print("Relation: ≤ on {1, 2, 3}")
print(f"Pairs: {R_leq}")
props = classify_relation(A, R_leq)
for prop, value in props.items():
    print(f"  {prop}: {value}")

# Check if it's a partial order
if props["Reflexive"] and props["Antisymmetric"] and props["Transitive"]:
    print("  → This is a PARTIAL ORDER")

print()

# Example: "divides" on {1, 2, 3, 6}
A2 = {1, 2, 3, 6}
R_div = [(a, b) for a in A2 for b in A2 if b % a == 0]

print("Relation: divides on {1, 2, 3, 6}")
props2 = classify_relation(A2, R_div)
for prop, value in props2.items():
    print(f"  {prop}: {value}")
```

### JavaScript

```javascript
function isReflexive(A, R) {
  // Check if every element is related to itself
  for (const a of A) {
    if (!R.has(`${a},${a}`)) return false;
  }
  return true;
}

function isIrreflexive(A, R) {
  // Check if no element is related to itself
  for (const a of A) {
    if (R.has(`${a},${a}`)) return false;
  }
  return true;
}

function isSymmetric(A, R) {
  // Check if (a,b) in R implies (b,a) in R
  for (const pair of R) {
    const [a, b] = pair.split(",").map(Number);
    if (!R.has(`${b},${a}`)) return false;
  }
  return true;
}

function isAntisymmetric(A, R) {
  // Check if (a,b) in R and (b,a) in R implies a === b
  for (const pair of R) {
    const [a, b] = pair.split(",").map(Number);
    if (a !== b && R.has(`${b},${a}`)) return false;
  }
  return true;
}

function isTransitive(A, R) {
  // Check if (a,b) in R and (b,c) in R implies (a,c) in R
  for (const pair1 of R) {
    const [a, b] = pair1.split(",").map(Number);
    for (const pair2 of R) {
      const [c, d] = pair2.split(",").map(Number);
      if (b === c && !R.has(`${a},${d}`)) return false;
    }
  }
  return true;
}

// Build relation as a Set of "a,b" strings for O(1) lookup
function buildRelation(pairs) {
  return new Set(pairs.map(([a, b]) => `${a},${b}`));
}

// Example: ≤ on {1, 2, 3}
const A = [1, 2, 3];
const pairs = [];
for (const a of A) {
  for (const b of A) {
    if (a <= b) pairs.push([a, b]);
  }
}

const R = buildRelation(pairs);

console.log("Relation: ≤ on {1, 2, 3}");
console.log(`  Reflexive: ${isReflexive(A, R)}`);
console.log(`  Irreflexive: ${isIrreflexive(A, R)}`);
console.log(`  Symmetric: ${isSymmetric(A, R)}`);
console.log(`  Antisymmetric: ${isAntisymmetric(A, R)}`);
console.log(`  Transitive: ${isTransitive(A, R)}`);
```

### C++

```cpp
#include <iostream>
#include <set>
#include <vector>
#include <utility>
using namespace std;

typedef set<pair<int,int>> Relation;
typedef set<int> Set;

bool isReflexive(const Set& A, const Relation& R) {
    for (int a : A) {
        if (R.find({a, a}) == R.end()) return false;
    }
    return true;
}

bool isIrreflexive(const Set& A, const Relation& R) {
    for (int a : A) {
        if (R.find({a, a}) != R.end()) return false;
    }
    return true;
}

bool isSymmetric(const Set& A, const Relation& R) {
    for (auto& [a, b] : R) {
        if (R.find({b, a}) == R.end()) return false;
    }
    return true;
}

bool isAntisymmetric(const Set& A, const Relation& R) {
    for (auto& [a, b] : R) {
        if (a != b && R.find({b, a}) != R.end()) return false;
    }
    return true;
}

bool isTransitive(const Set& A, const Relation& R) {
    for (auto& [a, b] : R) {
        for (auto& [c, d] : R) {
            if (b == c && R.find({a, d}) == R.end()) return false;
        }
    }
    return true;
}

int main() {
    Set A = {1, 2, 3, 6};
    Relation R;

    // Build "divides" relation
    for (int a : A) {
        for (int b : A) {
            if (b % a == 0) R.insert({a, b});
        }
    }

    cout << "Relation: divides on {1, 2, 3, 6}" << endl;
    cout << "  Reflexive: " << (isReflexive(A, R) ? "Yes" : "No") << endl;
    cout << "  Irreflexive: " << (isIrreflexive(A, R) ? "Yes" : "No") << endl;
    cout << "  Symmetric: " << (isSymmetric(A, R) ? "Yes" : "No") << endl;
    cout << "  Antisymmetric: " << (isAntisymmetric(A, R) ? "Yes" : "No") << endl;
    cout << "  Transitive: " << (isTransitive(A, R) ? "Yes" : "No") << endl;

    return 0;
}
```

### Java

```java
import java.util.*;

public class RelationChecker {

    public static boolean isReflexive(Set<Integer> A, Set<String> R) {
        for (int a : A) {
            if (!R.contains(a + "," + a)) return false;
        }
        return true;
    }

    public static boolean isIrreflexive(Set<Integer> A, Set<String> R) {
        for (int a : A) {
            if (R.contains(a + "," + a)) return false;
        }
        return true;
    }

    public static boolean isSymmetric(Set<Integer> A, Set<String> R) {
        for (String pair : R) {
            String[] parts = pair.split(",");
            int a = Integer.parseInt(parts[0]);
            int b = Integer.parseInt(parts[1]);
            if (!R.contains(b + "," + a)) return false;
        }
        return true;
    }

    public static boolean isAntisymmetric(Set<Integer> A, Set<String> R) {
        for (String pair : R) {
            String[] parts = pair.split(",");
            int a = Integer.parseInt(parts[0]);
            int b = Integer.parseInt(parts[1]);
            if (a != b && R.contains(b + "," + a)) return false;
        }
        return true;
    }

    public static boolean isTransitive(Set<Integer> A, Set<String> R) {
        for (String pair1 : R) {
            String[] p1 = pair1.split(",");
            int a = Integer.parseInt(p1[0]);
            int b = Integer.parseInt(p1[1]);
            for (String pair2 : R) {
                String[] p2 = pair2.split(",");
                int c = Integer.parseInt(p2[0]);
                int d = Integer.parseInt(p2[1]);
                if (b == c && !R.contains(a + "," + d)) return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Set<Integer> A = new HashSet<>(Arrays.asList(1, 2, 3, 6));
        Set<String> R = new HashSet<>();

        // Build "divides" relation
        for (int a : A) {
            for (int b : A) {
                if (b % a == 0) R.add(a + "," + b);
            }
        }

        System.out.println("Relation: divides on {1, 2, 3, 6}");
        System.out.println("  Reflexive: " + isReflexive(A, R));
        System.out.println("  Irreflexive: " + isIrreflexive(A, R));
        System.out.println("  Symmetric: " + isSymmetric(A, R));
        System.out.println("  Antisymmetric: " + isAntisymmetric(A, R));
        System.out.println("  Transitive: " + isTransitive(A, R));
    }
}
```

---

## Visualizing Properties at a Glance

Here's a quick mental checklist when you encounter a new relation:

1. **Reflexive?** → Look at the diagonal. Are all self-pairs present?
2. **Irreflexive?** → Are NO self-pairs present?
3. **Symmetric?** → Is the matrix symmetric? Can you swap every pair?
4. **Antisymmetric?** → For different elements, is there at most one direction?
5. **Transitive?** → Can you "chain" any two connected arrows and still find a direct arrow?

---

## Common Pitfalls

1. **"Reflexive" vs "Irreflexive" are not complements.** A relation can be neither if some elements have self-loops and others don't.

2. **"Symmetric" vs "Antisymmetric" are not complements.** The equality relation is BOTH symmetric and antisymmetric. A relation with some mutual pairs and some one-way pairs is NEITHER.

3. **Transitivity is the trickiest to check.** You must verify ALL chains, not just a few. Missing even one chain means the relation is not transitive.

4. **Empty relation on a non-empty set:** The empty relation ($R = \emptyset$) is irreflexive, symmetric, antisymmetric, and transitive (vacuously true for the last three). It is NOT reflexive (unless $A = \emptyset$).

5. **Universal relation** ($R = A \times A$): reflexive, symmetric, transitive, but NOT antisymmetric (unless $|A| \leq 1$).

---

## Practice Problems

1. Let $A = \{1, 2, 3, 4\}$ and $R = \{(a,b) : a + b \leq 5\}$. Determine which properties $R$ has.

2. On the set of all people, consider the relation "has met." Which properties does it satisfy?

3. On $\mathbb{Z}$, define $a \mathrel{R} b$ iff $a^2 = b^2$. Check all five properties.

4. Find a relation on $\{1, 2, 3\}$ that is symmetric and transitive but NOT reflexive.

5. Prove that if a relation is both symmetric and antisymmetric, it must be a subset of the identity relation.

---

## Key Takeaways

- A **binary relation** from $A$ to $B$ is a subset of $A \times B$; a relation **on** a set is a subset of $A \times A$.
- Relations can be represented as **sets of pairs**, **matrices**, or **directed graphs** — choose the representation that makes the problem easiest.
- The five key properties — **reflexive, irreflexive, symmetric, antisymmetric, transitive** — characterize how a relation behaves.
- These properties are **independent**: knowing one tells you nothing about the others (with few exceptions).
- Specific combinations yield important structures: **equivalence relations** (reflexive + symmetric + transitive) and **partial orders** (reflexive + antisymmetric + transitive).
- Always test properties by checking **all** relevant pairs, not just a few examples — one counterexample disproves a property.
- The matrix and digraph representations give visual shortcuts: diagonal entries for reflexivity, matrix symmetry for the symmetric property, and path checking for transitivity.
