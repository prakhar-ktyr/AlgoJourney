---
title: Set Theory Basics
---

# Set Theory Basics

Set theory is the foundation of modern mathematics. Nearly every mathematical structure — from numbers to functions to probability spaces — is built on sets. Understanding sets gives you the vocabulary and tools to reason precisely about collections of objects, which is essential in computer science for data structures, databases, type systems, and algorithms.

---

## What Is a Set?

A **set** is an unordered collection of distinct elements. Think of it like a bag of unique items where:

- **Order doesn't matter**: $\{1, 2, 3\}$ is the same set as $\{3, 1, 2\}$
- **No duplicates**: $\{1, 1, 2, 3\}$ is the same as $\{1, 2, 3\}$

### Real-World Analogies

- A **playlist** where each song appears only once (order doesn't matter for membership)
- A **guest list** for a party — either you're on the list or you're not
- A **collection of unique usernames** in a database

### Formal Definition

A set is a well-defined collection of distinct objects, called **elements** or **members** of the set. "Well-defined" means that for any object, we can definitively say whether it belongs to the set or not.

---

## Set Notation

There are several ways to describe a set.

### Roster Method (Listing)

Explicitly list all elements between curly braces:

$$A = \{1, 2, 3, 4, 5\}$$

$$\text{Vowels} = \{a, e, i, o, u\}$$

$$\text{Colors} = \{\text{red}, \text{green}, \text{blue}\}$$

For large sets with an obvious pattern, use ellipsis:

$$\text{Even} = \{2, 4, 6, 8, \ldots\}$$

$$B = \{1, 2, 3, \ldots, 100\}$$

### Set-Builder Notation

Describe elements by a property they satisfy:

$$A = \{x \mid x \text{ is a positive integer less than 6}\}$$

This reads: "A is the set of all $x$ such that $x$ is a positive integer less than 6."

More examples:

$$\text{Even} = \{x \mid x = 2k \text{ for some integer } k\}$$

$$S = \{x \in \mathbb{R} \mid x^2 < 9\} = \{x \in \mathbb{R} \mid -3 < x < 3\}$$

The vertical bar $\mid$ (or colon $:$) means "such that."

### Special Number Sets

Mathematics uses standard symbols for common number sets:

| Symbol | Name | Description |
|--------|------|-------------|
| $\mathbb{N}$ | Natural numbers | $\{0, 1, 2, 3, \ldots\}$ (sometimes starts at 1) |
| $\mathbb{Z}$ | Integers | $\{\ldots, -2, -1, 0, 1, 2, \ldots\}$ |
| $\mathbb{Z}^+$ | Positive integers | $\{1, 2, 3, \ldots\}$ |
| $\mathbb{Q}$ | Rational numbers | $\{p/q \mid p, q \in \mathbb{Z}, q \neq 0\}$ |
| $\mathbb{R}$ | Real numbers | All points on the number line |
| $\mathbb{C}$ | Complex numbers | $\{a + bi \mid a, b \in \mathbb{R}\}$ |

These sets have a hierarchy: $\mathbb{N} \subseteq \mathbb{Z} \subseteq \mathbb{Q} \subseteq \mathbb{R} \subseteq \mathbb{C}$

---

## Membership

The most fundamental relationship in set theory is **membership** — whether an element belongs to a set.

### Element Of ($\in$)

If $x$ is an element of set $A$, we write:

$$x \in A$$

Examples:
- $3 \in \{1, 2, 3, 4, 5\}$
- $\pi \in \mathbb{R}$
- $-5 \in \mathbb{Z}$

### Not Element Of ($\notin$)

If $x$ is NOT an element of set $A$, we write:

$$x \notin A$$

Examples:
- $6 \notin \{1, 2, 3, 4, 5\}$
- $\sqrt{2} \notin \mathbb{Q}$
- $0.5 \notin \mathbb{Z}$

### Important Distinction

Sets can contain other sets as elements. Be careful:

- $\{1\} \neq 1$ — the set containing 1 is not the same as the number 1
- $1 \in \{1, 2, 3\}$ — TRUE (1 is an element)
- $\{1\} \in \{1, 2, 3\}$ — FALSE (the set $\{1\}$ is not an element)
- $\{1\} \in \{\{1\}, 2, 3\}$ — TRUE (the set $\{1\}$ is an element of this set)

---

## The Empty Set

The **empty set** is the set with no elements at all, denoted:

$$\emptyset \quad \text{or} \quad \{\}$$

Think of it as an empty bag — the bag exists, but nothing is inside.

### Properties of the Empty Set

- $|\emptyset| = 0$ (its cardinality is zero)
- For every object $x$: $x \notin \emptyset$
- The empty set is a subset of every set (we'll prove this soon)
- $\emptyset \neq \{0\}$ — the empty set is NOT the set containing zero
- $\emptyset \neq \{\emptyset\}$ — the empty set is NOT the set containing the empty set

### Why Is $\emptyset$ Important?

In programming, the empty set corresponds to:
- An empty array `[]` (with no duplicates)
- An empty `Set()` object
- A query returning no results
- An intersection of disjoint categories

---

## The Universal Set

The **universal set** $U$ is the set of all elements under consideration in a particular context.

$$U = \text{the "universe of discourse"}$$

Examples:
- In a number theory course: $U = \mathbb{Z}$
- In a survey of students: $U = \text{all students in the class}$
- In character encoding: $U = \text{all Unicode characters}$

The universal set provides a boundary — we only consider elements within $U$. This prevents paradoxes and keeps our reasoning well-defined.

---

## Subsets

A set $A$ is a **subset** of set $B$ if every element of $A$ is also an element of $B$.

### Subset ($\subseteq$)

$$A \subseteq B \iff \forall x (x \in A \rightarrow x \in B)$$

This reads: "$A$ is a subset of $B$ if and only if for every $x$, if $x$ is in $A$ then $x$ is in $B$."

Examples:
- $\{1, 2\} \subseteq \{1, 2, 3, 4\}$ ✓
- $\{a, e\} \subseteq \{a, e, i, o, u\}$ ✓
- $\mathbb{N} \subseteq \mathbb{Z}$ ✓
- $\{1, 2, 3\} \subseteq \{1, 2, 3\}$ ✓ (every set is a subset of itself)

### Proper Subset ($\subset$)

A set $A$ is a **proper subset** of $B$ if $A \subseteq B$ and $A \neq B$ (i.e., $B$ has at least one element not in $A$).

$$A \subset B \iff A \subseteq B \text{ and } A \neq B$$

Examples:
- $\{1, 2\} \subset \{1, 2, 3\}$ ✓ (proper — 3 is in $B$ but not $A$)
- $\{1, 2, 3\} \subset \{1, 2, 3\}$ ✗ (not proper — they're equal)

### Key Facts About Subsets

1. **Every set is a subset of itself**: $A \subseteq A$ for any set $A$
2. **The empty set is a subset of every set**: $\emptyset \subseteq A$ for any set $A$
3. **Transitivity**: if $A \subseteq B$ and $B \subseteq C$, then $A \subseteq C$

### Why Is $\emptyset \subseteq A$ Always True?

The statement $\emptyset \subseteq A$ means: "for all $x$, if $x \in \emptyset$ then $x \in A$."

Since nothing is in $\emptyset$, the hypothesis "$x \in \emptyset$" is always false. A conditional with a false hypothesis is **vacuously true**. So the statement holds for every set $A$.

---

## Set Equality

Two sets are **equal** if and only if they contain exactly the same elements:

$$A = B \iff (A \subseteq B \text{ and } B \subseteq A)$$

This gives us a standard technique for proving two sets are equal: show each is a subset of the other.

### Examples

- $\{1, 2, 3\} = \{3, 2, 1\}$ (order doesn't matter)
- $\{1, 1, 2, 3\} = \{1, 2, 3\}$ (duplicates don't matter)
- $\{x \in \mathbb{Z} \mid x^2 = 4\} = \{-2, 2\}$

### Proving Set Equality

To prove $A = B$:

**Step 1** — Show $A \subseteq B$: Pick an arbitrary $x \in A$ and show $x \in B$.

**Step 2** — Show $B \subseteq A$: Pick an arbitrary $x \in B$ and show $x \in A$.

**Example**: Prove that $\{x \in \mathbb{Z} \mid x \text{ is even}\} = \{x \in \mathbb{Z} \mid x = 2k \text{ for some } k \in \mathbb{Z}\}$.

Both descriptions define the same set of even integers, and each element of one satisfies the condition of the other.

---

## Cardinality

The **cardinality** of a set is the number of distinct elements it contains, denoted $|A|$.

### Finite Sets

$$|{a, b, c}| = 3$$

$$|\{1, 2, 3, \ldots, 100\}| = 100$$

$$|\emptyset| = 0$$

$$|\{a, a, b\}| = 2 \quad \text{(duplicates don't count)}$$

### Infinite Sets

Some sets have infinitely many elements:
- $|\mathbb{N}| = \aleph_0$ (aleph-null — countably infinite)
- $|\mathbb{Z}| = \aleph_0$
- $|\mathbb{R}| = \mathfrak{c}$ (uncountably infinite, strictly larger)

For this course, we'll mostly work with finite sets.

### Power Set

The **power set** of $A$, denoted $\mathcal{P}(A)$ or $2^A$, is the set of all subsets of $A$.

$$\text{If } A = \{1, 2\}, \text{ then } \mathcal{P}(A) = \{\emptyset, \{1\}, \{2\}, \{1, 2\}\}$$

**Key fact**: If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.

This is because each element is either included or excluded from a subset — 2 choices per element.

---

## Code: Implementing a Set and Basic Operations

Let's implement a basic set structure and the operations we've learned.

```python
class MySet:
    """A simple set implementation demonstrating set theory basics."""

    def __init__(self, elements=None):
        """Create a set from a list, removing duplicates."""
        if elements is None:
            self.elements = []
        else:
            # Remove duplicates while preserving first occurrence
            seen = []
            for e in elements:
                if e not in seen:
                    seen.append(e)
            self.elements = seen

    def __repr__(self):
        return "{" + ", ".join(str(e) for e in self.elements) + "}"

    def contains(self, x):
        """Check membership: x ∈ A"""
        return x in self.elements

    def cardinality(self):
        """Return |A| — the number of elements."""
        return len(self.elements)

    def is_empty(self):
        """Check if this is the empty set."""
        return len(self.elements) == 0

    def is_subset_of(self, other):
        """Check if self ⊆ other."""
        for elem in self.elements:
            if not other.contains(elem):
                return False
        return True

    def is_proper_subset_of(self, other):
        """Check if self ⊂ other (subset but not equal)."""
        return self.is_subset_of(other) and not self.equals(other)

    def equals(self, other):
        """Check set equality: A = B iff A ⊆ B and B ⊆ A."""
        return self.is_subset_of(other) and other.is_subset_of(self)

    def power_set(self):
        """Return the power set P(A)."""
        result = [[]]
        for elem in self.elements:
            result += [subset + [elem] for subset in result]
        return [MySet(subset) for subset in result]


# Demonstrations
A = MySet([1, 2, 3, 2, 1])  # Duplicates removed
B = MySet([1, 2, 3, 4, 5])
empty = MySet()

print(f"A = {A}")               # {1, 2, 3}
print(f"B = {B}")               # {1, 2, 3, 4, 5}
print(f"|A| = {A.cardinality()}")  # 3
print(f"2 ∈ A? {A.contains(2)}")   # True
print(f"7 ∈ A? {A.contains(7)}")   # False
print(f"A ⊆ B? {A.is_subset_of(B)}")  # True
print(f"A ⊂ B? {A.is_proper_subset_of(B)}")  # True
print(f"A = A? {A.equals(A)}")     # True
print(f"∅ ⊆ A? {empty.is_subset_of(A)}")  # True
print(f"P({{1,2}}) = {[str(s) for s in MySet([1,2]).power_set()]}")
```

```javascript
class MySet {
  constructor(elements = []) {
    // Remove duplicates
    this.elements = [...new Set(elements)];
  }

  toString() {
    return `{${this.elements.join(", ")}}`;
  }

  contains(x) {
    return this.elements.includes(x);
  }

  cardinality() {
    return this.elements.length;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  isSubsetOf(other) {
    return this.elements.every((elem) => other.contains(elem));
  }

  isProperSubsetOf(other) {
    return this.isSubsetOf(other) && !this.equals(other);
  }

  equals(other) {
    return this.isSubsetOf(other) && other.isSubsetOf(this);
  }

  powerSet() {
    let result = [[]];
    for (const elem of this.elements) {
      result = result.concat(result.map((subset) => [...subset, elem]));
    }
    return result.map((subset) => new MySet(subset));
  }
}

// Demonstrations
const A = new MySet([1, 2, 3, 2, 1]);
const B = new MySet([1, 2, 3, 4, 5]);
const empty = new MySet();

console.log(`A = ${A}`);                    // {1, 2, 3}
console.log(`|A| = ${A.cardinality()}`);    // 3
console.log(`2 ∈ A? ${A.contains(2)}`);     // true
console.log(`A ⊆ B? ${A.isSubsetOf(B)}`);   // true
console.log(`A ⊂ B? ${A.isProperSubsetOf(B)}`); // true
console.log(`∅ ⊆ A? ${empty.isSubsetOf(A)}`);   // true
```

```java
import java.util.*;
import java.util.stream.*;

public class SetTheory {

    public static <T> boolean isMember(Set<T> set, T element) {
        return set.contains(element);
    }

    public static <T> boolean isSubset(Set<T> a, Set<T> b) {
        return b.containsAll(a);
    }

    public static <T> boolean isProperSubset(Set<T> a, Set<T> b) {
        return isSubset(a, b) && !a.equals(b);
    }

    public static <T> Set<Set<T>> powerSet(Set<T> set) {
        Set<Set<T>> result = new HashSet<>();
        result.add(new HashSet<>());

        for (T element : set) {
            Set<Set<T>> newSubsets = new HashSet<>();
            for (Set<T> subset : result) {
                Set<T> newSubset = new HashSet<>(subset);
                newSubset.add(element);
                newSubsets.add(newSubset);
            }
            result.addAll(newSubsets);
        }
        return result;
    }

    public static void main(String[] args) {
        Set<Integer> A = new HashSet<>(Arrays.asList(1, 2, 3));
        Set<Integer> B = new HashSet<>(Arrays.asList(1, 2, 3, 4, 5));
        Set<Integer> empty = new HashSet<>();

        System.out.println("A = " + A);
        System.out.println("|A| = " + A.size());
        System.out.println("2 ∈ A? " + isMember(A, 2));
        System.out.println("A ⊆ B? " + isSubset(A, B));
        System.out.println("A ⊂ B? " + isProperSubset(A, B));
        System.out.println("∅ ⊆ A? " + isSubset(empty, A));
        System.out.println("P({1,2}) = " + powerSet(new HashSet<>(Arrays.asList(1, 2))));
    }
}
```

```cpp
#include <iostream>
#include <set>
#include <vector>
using namespace std;

template <typename T>
bool isSubset(const set<T>& a, const set<T>& b) {
    for (const auto& elem : a) {
        if (b.find(elem) == b.end()) return false;
    }
    return true;
}

template <typename T>
bool isProperSubset(const set<T>& a, const set<T>& b) {
    return isSubset(a, b) && a != b;
}

template <typename T>
vector<set<T>> powerSet(const set<T>& s) {
    vector<set<T>> result;
    result.push_back({});  // Empty set

    for (const auto& elem : s) {
        int currentSize = result.size();
        for (int i = 0; i < currentSize; i++) {
            set<T> newSubset = result[i];
            newSubset.insert(elem);
            result.push_back(newSubset);
        }
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
    set<int> A = {1, 2, 3};
    set<int> B = {1, 2, 3, 4, 5};
    set<int> empty = {};

    cout << "A = "; printSet(A); cout << endl;
    cout << "|A| = " << A.size() << endl;
    cout << "2 ∈ A? " << (A.count(2) ? "true" : "false") << endl;
    cout << "A ⊆ B? " << (isSubset(A, B) ? "true" : "false") << endl;
    cout << "A ⊂ B? " << (isProperSubset(A, B) ? "true" : "false") << endl;
    cout << "∅ ⊆ A? " << (isSubset(empty, A) ? "true" : "false") << endl;

    cout << "P({1,2}) = ";
    set<int> small = {1, 2};
    auto ps = powerSet(small);
    for (const auto& subset : ps) {
        printSet(subset);
        cout << " ";
    }
    cout << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class SetTheory
{
    static bool IsSubset<T>(HashSet<T> a, HashSet<T> b)
    {
        return a.IsSubsetOf(b);
    }

    static bool IsProperSubset<T>(HashSet<T> a, HashSet<T> b)
    {
        return a.IsProperSubsetOf(b);
    }

    static List<HashSet<T>> PowerSet<T>(HashSet<T> set)
    {
        var result = new List<HashSet<T>> { new HashSet<T>() };

        foreach (var element in set)
        {
            var newSubsets = result
                .Select(subset => new HashSet<T>(subset) { element })
                .ToList();
            result.AddRange(newSubsets);
        }
        return result;
    }

    static void Main()
    {
        var A = new HashSet<int> { 1, 2, 3 };
        var B = new HashSet<int> { 1, 2, 3, 4, 5 };
        var empty = new HashSet<int>();

        Console.WriteLine($"A = {{{string.Join(", ", A)}}}");
        Console.WriteLine($"|A| = {A.Count}");
        Console.WriteLine($"2 ∈ A? {A.Contains(2)}");
        Console.WriteLine($"A ⊆ B? {IsSubset(A, B)}");
        Console.WriteLine($"A ⊂ B? {IsProperSubset(A, B)}");
        Console.WriteLine($"∅ ⊆ A? {IsSubset(empty, A)}");

        var small = new HashSet<int> { 1, 2 };
        var ps = PowerSet(small);
        Console.Write("P({1,2}) = ");
        foreach (var subset in ps)
        {
            Console.Write($"{{{string.Join(", ", subset)}}} ");
        }
        Console.WriteLine();
    }
}
```

---

## Common Mistakes to Avoid

| Mistake | Why It's Wrong |
|---------|---------------|
| Confusing $\in$ with $\subseteq$ | $1 \in \{1,2,3\}$ but $1 \not\subseteq \{1,2,3\}$; use $\{1\} \subseteq \{1,2,3\}$ |
| Writing $\emptyset = \{0\}$ | The empty set has no elements; $\{0\}$ has one element (zero) |
| Assuming sets are ordered | $\{1,2,3\} = \{3,1,2\}$; sets have no inherent order |
| Counting duplicates | $|\{a, a, b\}| = 2$, not 3 |
| Confusing $\subset$ and $\subseteq$ | $\subset$ excludes equality; $\subseteq$ allows it |

---

## Key Takeaways

1. A **set** is an unordered collection of distinct elements — no duplicates, no order.
2. Sets can be described by **roster notation** (listing) or **set-builder notation** (property).
3. **Membership** ($\in$ and $\notin$) is the fundamental relationship between elements and sets.
4. The **empty set** $\emptyset$ has no elements and is a subset of every set.
5. The **universal set** $U$ defines the context or "universe" of all elements under discussion.
6. $A \subseteq B$ means every element of $A$ is in $B$; $A \subset B$ adds the requirement $A \neq B$.
7. **Set equality** is proven by showing mutual subset relationships: $A \subseteq B$ and $B \subseteq A$.
8. **Cardinality** $|A|$ counts distinct elements; the power set has $2^{|A|}$ elements.
9. Sets form the language of mathematics — mastering them unlocks everything from logic to probability to algorithm analysis.
