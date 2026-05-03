---
title: Set Operations
---

# Set Operations

Now that we understand what sets are and how they relate to each other, it's time to learn how to **combine** and **transform** sets. Set operations are the "arithmetic" of sets — just as you can add and multiply numbers, you can union, intersect, and complement sets. These operations appear everywhere in computer science: database queries (SQL JOINs), search filters, access control lists, and event handling.

---

## Union ($A \cup B$)

The **union** of two sets $A$ and $B$ is the set of all elements that belong to $A$ **or** $B$ (or both).

$$A \cup B = \{x \mid x \in A \text{ or } x \in B\}$$

### Analogy

Think of merging two guest lists for a joint party — everyone on either list is invited.

### Examples

$$\{1, 2, 3\} \cup \{3, 4, 5\} = \{1, 2, 3, 4, 5\}$$

$$\{a, b\} \cup \emptyset = \{a, b\}$$

$$\{1, 2\} \cup \{1, 2\} = \{1, 2\}$$

### Venn Diagram Intuition

In a Venn diagram, $A \cup B$ is the entire shaded region covering both circles.

### Key Properties of Union

- $A \cup \emptyset = A$ (identity)
- $A \cup U = U$ (domination)
- $A \cup A = A$ (idempotent)
- $A \cup B = B \cup A$ (commutative)

---

## Intersection ($A \cap B$)

The **intersection** of two sets $A$ and $B$ is the set of all elements that belong to **both** $A$ and $B$.

$$A \cap B = \{x \mid x \in A \text{ and } x \in B\}$$

### Analogy

Think of finding common friends between two people — only those who are friends with both make the list.

### Examples

$$\{1, 2, 3\} \cap \{3, 4, 5\} = \{3\}$$

$$\{a, b\} \cap \{c, d\} = \emptyset$$

$$\{1, 2, 3\} \cap \{1, 2, 3, 4, 5\} = \{1, 2, 3\}$$

### Disjoint Sets

Two sets are **disjoint** if they share no common elements:

$$A \cap B = \emptyset$$

Example: $\{1, 3, 5\}$ and $\{2, 4, 6\}$ are disjoint (odd and even numbers have no overlap).

### Key Properties of Intersection

- $A \cap U = A$ (identity)
- $A \cap \emptyset = \emptyset$ (domination)
- $A \cap A = A$ (idempotent)
- $A \cap B = B \cap A$ (commutative)

---

## Set Difference ($A - B$)

The **difference** of sets $A$ and $B$ (also written $A \setminus B$) is the set of elements in $A$ that are **not** in $B$.

$$A - B = \{x \mid x \in A \text{ and } x \notin B\}$$

### Analogy

Think of removing certain items from your shopping cart — you keep everything in your cart except what's on the "remove" list.

### Examples

$$\{1, 2, 3, 4, 5\} - \{3, 4, 5, 6, 7\} = \{1, 2\}$$

$$\{a, b, c\} - \{a\} = \{b, c\}$$

$$\{1, 2, 3\} - \emptyset = \{1, 2, 3\}$$

$$\emptyset - \{1, 2, 3\} = \emptyset$$

### Important Note

Set difference is **NOT commutative**: $A - B \neq B - A$ in general.

$$\{1, 2, 3\} - \{2, 3, 4\} = \{1\}$$
$$\{2, 3, 4\} - \{1, 2, 3\} = \{4\}$$

---

## Complement ($\overline{A}$ or $A^c$)

The **complement** of a set $A$ is the set of all elements in the universal set $U$ that are **not** in $A$.

$$\overline{A} = A^c = U - A = \{x \in U \mid x \notin A\}$$

### Analogy

If the universal set is all students in a school, and $A$ is the set of students who passed, then $\overline{A}$ is the set of students who failed.

### Examples

If $U = \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\}$ and $A = \{2, 4, 6, 8, 10\}$:

$$\overline{A} = \{1, 3, 5, 7, 9\}$$

### Key Properties of Complement

- $\overline{\overline{A}} = A$ (double complement)
- $A \cup \overline{A} = U$ (complement law)
- $A \cap \overline{A} = \emptyset$ (complement law)
- $\overline{U} = \emptyset$
- $\overline{\emptyset} = U$

---

## Symmetric Difference ($A \oplus B$)

The **symmetric difference** of $A$ and $B$ is the set of elements that belong to exactly one of the two sets (but not both).

$$A \oplus B = (A - B) \cup (B - A) = (A \cup B) - (A \cap B)$$

### Analogy

Think of the XOR operation in logic — an element is in the result if it's in one set or the other, but not in both. It's like finding items unique to each person's collection.

### Examples

$$\{1, 2, 3\} \oplus \{3, 4, 5\} = \{1, 2, 4, 5\}$$

$$\{a, b, c\} \oplus \{a, b, c\} = \emptyset$$

$$\{1, 2\} \oplus \emptyset = \{1, 2\}$$

### Key Properties of Symmetric Difference

- $A \oplus \emptyset = A$ (identity)
- $A \oplus A = \emptyset$ (self-inverse)
- $A \oplus B = B \oplus A$ (commutative)
- $(A \oplus B) \oplus C = A \oplus (B \oplus C)$ (associative)

The symmetric difference is essentially the XOR operation for sets, and it has the same algebraic properties as XOR in Boolean logic.

---

## Properties of Set Operations

Set operations satisfy many algebraic laws analogous to arithmetic and logic.

### Commutative Laws

$$A \cup B = B \cup A$$
$$A \cap B = B \cap A$$

### Associative Laws

$$(A \cup B) \cup C = A \cup (B \cup C)$$
$$(A \cap B) \cap C = A \cap (B \cap C)$$

### Distributive Laws

$$A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$$
$$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

Note: Both distributive laws hold for sets (unlike arithmetic where only multiplication distributes over addition).

### Absorption Laws

$$A \cup (A \cap B) = A$$
$$A \cap (A \cup B) = A$$

### De Morgan's Laws for Sets

These are among the most important and frequently used identities:

$$\overline{A \cup B} = \overline{A} \cap \overline{B}$$

$$\overline{A \cap B} = \overline{A} \cup \overline{B}$$

**In words:**
- The complement of a union is the intersection of the complements.
- The complement of an intersection is the union of the complements.

**Analogy:** "Not (A or B)" is the same as "(not A) and (not B)." If you're not on guest list A and not on guest list B, then you're not on the combined guest list.

### Proof of De Morgan's First Law

To prove $\overline{A \cup B} = \overline{A} \cap \overline{B}$:

**($\subseteq$)** Let $x \in \overline{A \cup B}$. Then $x \notin A \cup B$, meaning $x \notin A$ and $x \notin B$. So $x \in \overline{A}$ and $x \in \overline{B}$, thus $x \in \overline{A} \cap \overline{B}$.

**($\supseteq$)** Let $x \in \overline{A} \cap \overline{B}$. Then $x \in \overline{A}$ and $x \in \overline{B}$, meaning $x \notin A$ and $x \notin B$. So $x \notin A \cup B$, thus $x \in \overline{A \cup B}$.

---

## Set Identities Table

Here is a comprehensive reference table of fundamental set identities:

| Identity | Name |
|----------|------|
| $A \cup \emptyset = A$ | Identity law (union) |
| $A \cap U = A$ | Identity law (intersection) |
| $A \cup U = U$ | Domination law (union) |
| $A \cap \emptyset = \emptyset$ | Domination law (intersection) |
| $A \cup A = A$ | Idempotent law (union) |
| $A \cap A = A$ | Idempotent law (intersection) |
| $\overline{\overline{A}} = A$ | Complementation (involution) |
| $A \cup B = B \cup A$ | Commutative law (union) |
| $A \cap B = B \cap A$ | Commutative law (intersection) |
| $(A \cup B) \cup C = A \cup (B \cup C)$ | Associative law (union) |
| $(A \cap B) \cap C = A \cap (B \cap C)$ | Associative law (intersection) |
| $A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$ | Distributive law |
| $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$ | Distributive law |
| $\overline{A \cup B} = \overline{A} \cap \overline{B}$ | De Morgan's law |
| $\overline{A \cap B} = \overline{A} \cup \overline{B}$ | De Morgan's law |
| $A \cup (A \cap B) = A$ | Absorption law |
| $A \cap (A \cup B) = A$ | Absorption law |
| $A \cup \overline{A} = U$ | Complement law |
| $A \cap \overline{A} = \emptyset$ | Complement law |

---

## Generalized Unions and Intersections

When working with more than two sets, we use **generalized** (or indexed) operations.

### Generalized Union

The union of a collection of sets $A_1, A_2, \ldots, A_n$:

$$\bigcup_{i=1}^{n} A_i = A_1 \cup A_2 \cup \cdots \cup A_n = \{x \mid x \in A_i \text{ for some } i\}$$

**Example:** Let $A_i = \{i, i+1\}$ for $i = 1, 2, 3$.
- $A_1 = \{1, 2\}$, $A_2 = \{2, 3\}$, $A_3 = \{3, 4\}$

$$\bigcup_{i=1}^{3} A_i = \{1, 2, 3, 4\}$$

### Generalized Intersection

The intersection of a collection of sets $A_1, A_2, \ldots, A_n$:

$$\bigcap_{i=1}^{n} A_i = A_1 \cap A_2 \cap \cdots \cap A_n = \{x \mid x \in A_i \text{ for all } i\}$$

**Example:** Let $B_i = \{1, 2, \ldots, 10-i\}$ for $i = 1, 2, 3$.
- $B_1 = \{1,2,\ldots,9\}$, $B_2 = \{1,2,\ldots,8\}$, $B_3 = \{1,2,\ldots,7\}$

$$\bigcap_{i=1}^{3} B_i = \{1, 2, 3, 4, 5, 6, 7\}$$

### Generalized De Morgan's Laws

$$\overline{\bigcup_{i=1}^{n} A_i} = \bigcap_{i=1}^{n} \overline{A_i}$$

$$\overline{\bigcap_{i=1}^{n} A_i} = \bigcup_{i=1}^{n} \overline{A_i}$$

### Application: Database Queries

Generalized operations correspond directly to SQL:
- $\bigcup$ → `UNION` (combine results from multiple queries)
- $\bigcap$ → `INTERSECT` (common results across queries)
- Filtering with multiple conditions: intersection of filter sets

---

## Code: Implementing All Set Operations

Let's build a complete implementation of all the set operations we've covered.

```python
class MathSet:
    """Complete set implementation with all operations."""

    def __init__(self, elements=None, universal=None):
        if elements is None:
            self.elements = []
        else:
            seen = []
            for e in elements:
                if e not in seen:
                    seen.append(e)
            self.elements = seen
        self.universal = universal  # Universal set for complement

    def __repr__(self):
        if not self.elements:
            return "∅"
        return "{" + ", ".join(str(e) for e in sorted(self.elements)) + "}"

    def contains(self, x):
        return x in self.elements

    def union(self, other):
        """A ∪ B — elements in A or B (or both)."""
        result = list(self.elements)
        for e in other.elements:
            if e not in result:
                result.append(e)
        return MathSet(result, self.universal)

    def intersection(self, other):
        """A ∩ B — elements in both A and B."""
        result = [e for e in self.elements if e in other.elements]
        return MathSet(result, self.universal)

    def difference(self, other):
        """A - B — elements in A but not in B."""
        result = [e for e in self.elements if e not in other.elements]
        return MathSet(result, self.universal)

    def complement(self):
        """A^c — elements in U but not in A."""
        if self.universal is None:
            raise ValueError("Universal set not defined")
        result = [e for e in self.universal if e not in self.elements]
        return MathSet(result, self.universal)

    def symmetric_difference(self, other):
        """A ⊕ B — elements in exactly one of A or B."""
        return self.difference(other).union(other.difference(self))

    def is_disjoint(self, other):
        """Check if A ∩ B = ∅."""
        return self.intersection(other).elements == []

    @staticmethod
    def generalized_union(sets):
        """⋃ of a collection of sets."""
        if not sets:
            return MathSet()
        result = sets[0]
        for s in sets[1:]:
            result = result.union(s)
        return result

    @staticmethod
    def generalized_intersection(sets):
        """⋂ of a collection of sets."""
        if not sets:
            return MathSet()
        result = sets[0]
        for s in sets[1:]:
            result = result.intersection(s)
        return result


# Define universal set
U = list(range(1, 11))  # {1, 2, ..., 10}

A = MathSet([1, 2, 3, 4, 5], U)
B = MathSet([3, 4, 5, 6, 7], U)
C = MathSet([5, 6, 7, 8, 9], U)

print(f"U = {MathSet(U)}")
print(f"A = {A}")
print(f"B = {B}")
print(f"C = {C}")
print()

# Basic operations
print(f"A ∪ B = {A.union(B)}")
print(f"A ∩ B = {A.intersection(B)}")
print(f"A - B = {A.difference(B)}")
print(f"B - A = {B.difference(A)}")
print(f"A^c  = {A.complement()}")
print(f"A ⊕ B = {A.symmetric_difference(B)}")
print()

# Verify De Morgan's Laws
lhs1 = A.union(B).complement()
rhs1 = A.complement().intersection(B.complement())
print(f"De Morgan's 1: (A∪B)^c = {lhs1}, A^c ∩ B^c = {rhs1}, Equal? {lhs1.elements == rhs1.elements}")

lhs2 = A.intersection(B).complement()
rhs2 = A.complement().union(B.complement())
print(f"De Morgan's 2: (A∩B)^c = {lhs2}, A^c ∪ B^c = {rhs2}, Equal? {lhs2.elements == rhs2.elements}")
print()

# Generalized operations
sets = [A, B, C]
print(f"⋃(A,B,C) = {MathSet.generalized_union(sets)}")
print(f"⋂(A,B,C) = {MathSet.generalized_intersection(sets)}")
```

```javascript
class MathSet {
  constructor(elements = [], universal = null) {
    this.elements = [...new Set(elements)];
    this.universal = universal;
  }

  toString() {
    if (this.elements.length === 0) return "∅";
    return `{${[...this.elements].sort((a, b) => a - b).join(", ")}}`;
  }

  union(other) {
    const result = new Set([...this.elements, ...other.elements]);
    return new MathSet([...result], this.universal);
  }

  intersection(other) {
    const otherSet = new Set(other.elements);
    const result = this.elements.filter((e) => otherSet.has(e));
    return new MathSet(result, this.universal);
  }

  difference(other) {
    const otherSet = new Set(other.elements);
    const result = this.elements.filter((e) => !otherSet.has(e));
    return new MathSet(result, this.universal);
  }

  complement() {
    if (!this.universal) throw new Error("Universal set not defined");
    const thisSet = new Set(this.elements);
    const result = this.universal.filter((e) => !thisSet.has(e));
    return new MathSet(result, this.universal);
  }

  symmetricDifference(other) {
    return this.difference(other).union(other.difference(this));
  }

  isDisjoint(other) {
    return this.intersection(other).elements.length === 0;
  }

  static generalizedUnion(sets) {
    return sets.reduce((acc, s) => acc.union(s), new MathSet());
  }

  static generalizedIntersection(sets) {
    if (sets.length === 0) return new MathSet();
    return sets.reduce((acc, s) => acc.intersection(s));
  }
}

// Define universal set
const U = Array.from({ length: 10 }, (_, i) => i + 1);

const A = new MathSet([1, 2, 3, 4, 5], U);
const B = new MathSet([3, 4, 5, 6, 7], U);
const C = new MathSet([5, 6, 7, 8, 9], U);

console.log(`A ∪ B = ${A.union(B)}`);
console.log(`A ∩ B = ${A.intersection(B)}`);
console.log(`A - B = ${A.difference(B)}`);
console.log(`A^c  = ${A.complement()}`);
console.log(`A ⊕ B = ${A.symmetricDifference(B)}`);

// Verify De Morgan's Laws
const lhs1 = A.union(B).complement();
const rhs1 = A.complement().intersection(B.complement());
console.log(`De Morgan 1: ${lhs1} === ${rhs1}? ${lhs1.toString() === rhs1.toString()}`);

// Generalized operations
console.log(`⋃(A,B,C) = ${MathSet.generalizedUnion([A, B, C])}`);
console.log(`⋂(A,B,C) = ${MathSet.generalizedIntersection([A, B, C])}`);
```

```java
import java.util.*;
import java.util.stream.*;

public class SetOperations {

    public static <T> Set<T> union(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.addAll(b);
        return result;
    }

    public static <T> Set<T> intersection(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    public static <T> Set<T> difference(Set<T> a, Set<T> b) {
        Set<T> result = new HashSet<>(a);
        result.removeAll(b);
        return result;
    }

    public static <T> Set<T> complement(Set<T> a, Set<T> universal) {
        return difference(universal, a);
    }

    public static <T> Set<T> symmetricDifference(Set<T> a, Set<T> b) {
        return union(difference(a, b), difference(b, a));
    }

    @SafeVarargs
    public static <T> Set<T> generalizedUnion(Set<T>... sets) {
        Set<T> result = new HashSet<>();
        for (Set<T> s : sets) {
            result.addAll(s);
        }
        return result;
    }

    @SafeVarargs
    public static <T> Set<T> generalizedIntersection(Set<T>... sets) {
        if (sets.length == 0) return new HashSet<>();
        Set<T> result = new HashSet<>(sets[0]);
        for (int i = 1; i < sets.length; i++) {
            result.retainAll(sets[i]);
        }
        return result;
    }

    public static void main(String[] args) {
        Set<Integer> U = new TreeSet<>(Arrays.asList(1,2,3,4,5,6,7,8,9,10));
        Set<Integer> A = new TreeSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> B = new TreeSet<>(Arrays.asList(3, 4, 5, 6, 7));
        Set<Integer> C = new TreeSet<>(Arrays.asList(5, 6, 7, 8, 9));

        System.out.println("A ∪ B = " + union(A, B));
        System.out.println("A ∩ B = " + intersection(A, B));
        System.out.println("A - B = " + difference(A, B));
        System.out.println("A^c  = " + complement(A, U));
        System.out.println("A ⊕ B = " + symmetricDifference(A, B));

        // Verify De Morgan's Law
        Set<Integer> lhs = complement(union(A, B), U);
        Set<Integer> rhs = intersection(complement(A, U), complement(B, U));
        System.out.println("De Morgan: " + lhs.equals(rhs));

        // Generalized operations
        System.out.println("⋃(A,B,C) = " + generalizedUnion(A, B, C));
        System.out.println("⋂(A,B,C) = " + generalizedIntersection(A, B, C));
    }
}
```

```cpp
#include <iostream>
#include <set>
#include <vector>
#include <algorithm>
using namespace std;

template <typename T>
set<T> setUnion(const set<T>& a, const set<T>& b) {
    set<T> result(a);
    result.insert(b.begin(), b.end());
    return result;
}

template <typename T>
set<T> setIntersection(const set<T>& a, const set<T>& b) {
    set<T> result;
    for (const auto& elem : a) {
        if (b.count(elem)) result.insert(elem);
    }
    return result;
}

template <typename T>
set<T> setDifference(const set<T>& a, const set<T>& b) {
    set<T> result;
    for (const auto& elem : a) {
        if (!b.count(elem)) result.insert(elem);
    }
    return result;
}

template <typename T>
set<T> setComplement(const set<T>& a, const set<T>& universal) {
    return setDifference(universal, a);
}

template <typename T>
set<T> symmetricDifference(const set<T>& a, const set<T>& b) {
    return setUnion(setDifference(a, b), setDifference(b, a));
}

template <typename T>
set<T> generalizedUnion(const vector<set<T>>& sets) {
    set<T> result;
    for (const auto& s : sets) {
        result.insert(s.begin(), s.end());
    }
    return result;
}

template <typename T>
set<T> generalizedIntersection(const vector<set<T>>& sets) {
    if (sets.empty()) return {};
    set<T> result = sets[0];
    for (size_t i = 1; i < sets.size(); i++) {
        result = setIntersection(result, sets[i]);
    }
    return result;
}

template <typename T>
void printSet(const set<T>& s) {
    cout << "{";
    bool first = true;
    for (const auto& elem : s) {
        if (!first) cout << ", ";
        cout << elem;
        first = false;
    }
    cout << "}";
}

int main() {
    set<int> U = {1,2,3,4,5,6,7,8,9,10};
    set<int> A = {1, 2, 3, 4, 5};
    set<int> B = {3, 4, 5, 6, 7};
    set<int> C = {5, 6, 7, 8, 9};

    cout << "A ∪ B = "; printSet(setUnion(A, B)); cout << endl;
    cout << "A ∩ B = "; printSet(setIntersection(A, B)); cout << endl;
    cout << "A - B = "; printSet(setDifference(A, B)); cout << endl;
    cout << "A^c  = "; printSet(setComplement(A, U)); cout << endl;
    cout << "A ⊕ B = "; printSet(symmetricDifference(A, B)); cout << endl;

    // Verify De Morgan's Law
    auto lhs = setComplement(setUnion(A, B), U);
    auto rhs = setIntersection(setComplement(A, U), setComplement(B, U));
    cout << "De Morgan: " << (lhs == rhs ? "true" : "false") << endl;

    // Generalized operations
    vector<set<int>> sets = {A, B, C};
    cout << "⋃(A,B,C) = "; printSet(generalizedUnion(sets)); cout << endl;
    cout << "⋂(A,B,C) = "; printSet(generalizedIntersection(sets)); cout << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class SetOperations
{
    static HashSet<T> Union<T>(HashSet<T> a, HashSet<T> b)
    {
        var result = new HashSet<T>(a);
        result.UnionWith(b);
        return result;
    }

    static HashSet<T> Intersection<T>(HashSet<T> a, HashSet<T> b)
    {
        var result = new HashSet<T>(a);
        result.IntersectWith(b);
        return result;
    }

    static HashSet<T> Difference<T>(HashSet<T> a, HashSet<T> b)
    {
        var result = new HashSet<T>(a);
        result.ExceptWith(b);
        return result;
    }

    static HashSet<T> Complement<T>(HashSet<T> a, HashSet<T> universal)
    {
        return Difference(universal, a);
    }

    static HashSet<T> SymmetricDifference<T>(HashSet<T> a, HashSet<T> b)
    {
        var result = new HashSet<T>(a);
        result.SymmetricExceptWith(b);
        return result;
    }

    static HashSet<T> GeneralizedUnion<T>(params HashSet<T>[] sets)
    {
        var result = new HashSet<T>();
        foreach (var s in sets) result.UnionWith(s);
        return result;
    }

    static HashSet<T> GeneralizedIntersection<T>(params HashSet<T>[] sets)
    {
        if (sets.Length == 0) return new HashSet<T>();
        var result = new HashSet<T>(sets[0]);
        for (int i = 1; i < sets.Length; i++) result.IntersectWith(sets[i]);
        return result;
    }

    static string SetToString<T>(HashSet<T> s)
    {
        var sorted = s.OrderBy(x => x).Select(x => x.ToString());
        return "{" + string.Join(", ", sorted) + "}";
    }

    static void Main()
    {
        var U = new HashSet<int>(Enumerable.Range(1, 10));
        var A = new HashSet<int> { 1, 2, 3, 4, 5 };
        var B = new HashSet<int> { 3, 4, 5, 6, 7 };
        var C = new HashSet<int> { 5, 6, 7, 8, 9 };

        Console.WriteLine($"A ∪ B = {SetToString(Union(A, B))}");
        Console.WriteLine($"A ∩ B = {SetToString(Intersection(A, B))}");
        Console.WriteLine($"A - B = {SetToString(Difference(A, B))}");
        Console.WriteLine($"A^c  = {SetToString(Complement(A, U))}");
        Console.WriteLine($"A ⊕ B = {SetToString(SymmetricDifference(A, B))}");

        // Verify De Morgan's Law
        var lhs = Complement(Union(A, B), U);
        var rhs = Intersection(Complement(A, U), Complement(B, U));
        Console.WriteLine($"De Morgan: {lhs.SetEquals(rhs)}");

        // Generalized operations
        Console.WriteLine($"⋃(A,B,C) = {SetToString(GeneralizedUnion(A, B, C))}");
        Console.WriteLine($"⋂(A,B,C) = {SetToString(GeneralizedIntersection(A, B, C))}");
    }
}
```

---

## Connecting Set Operations to Programming

| Set Operation | Python | SQL | Boolean Logic |
|---------------|--------|-----|---------------|
| $A \cup B$ | `A \| B` or `A.union(B)` | `UNION` | OR |
| $A \cap B$ | `A & B` or `A.intersection(B)` | `INTERSECT` | AND |
| $A - B$ | `A - B` or `A.difference(B)` | `EXCEPT` | AND NOT |
| $\overline{A}$ | `U - A` | `NOT IN` | NOT |
| $A \oplus B$ | `A ^ B` or `A.symmetric_difference(B)` | (custom) | XOR |

Understanding the mathematical foundation behind these operations helps you:
- Write correct database queries
- Design efficient algorithms for filtering and searching
- Reason about access control and permissions
- Analyze event-driven systems (event listeners as sets)

---

## Key Takeaways

1. **Union** ($A \cup B$) collects all elements from both sets — think "OR."
2. **Intersection** ($A \cap B$) keeps only shared elements — think "AND."
3. **Difference** ($A - B$) removes elements of $B$ from $A$ — think "AND NOT." It is not commutative.
4. **Complement** ($\overline{A}$) is everything in the universe not in $A$ — think "NOT."
5. **Symmetric difference** ($A \oplus B$) keeps elements in exactly one set — think "XOR."
6. **De Morgan's Laws** connect complement with union/intersection: $\overline{A \cup B} = \overline{A} \cap \overline{B}$ and $\overline{A \cap B} = \overline{A} \cup \overline{B}$.
7. Set operations satisfy **commutative**, **associative**, **distributive**, and **absorption** laws.
8. **Generalized unions/intersections** extend operations to arbitrarily many sets using $\bigcup$ and $\bigcap$ notation.
9. Every set operation has a direct counterpart in programming (Python sets, SQL queries, bitwise logic).
