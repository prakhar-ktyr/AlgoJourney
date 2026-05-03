---
title: Venn Diagrams & Set Identities
---

In this lesson, we learn how to **visualize** set operations using Venn diagrams and how to **prove** set identities rigorously using membership tables and element-chasing arguments. We also introduce the powerful **inclusion-exclusion principle**.

---

## Venn Diagrams

A **Venn diagram** represents sets as overlapping circles (or other closed curves) within a rectangle that represents the universal set $U$. The overlapping regions show how elements can belong to multiple sets simultaneously.

---

### Two-Set Venn Diagram

For two sets $A$ and $B$ within a universal set $U$, the diagram creates **four distinct regions**:

| Region | Description | Set Notation |
|--------|-------------|--------------|
| I   | Elements in $A$ only (not in $B$) | $A \cap B'$ or $A \setminus B$ |
| II  | Elements in both $A$ and $B$ | $A \cap B$ |
| III | Elements in $B$ only (not in $A$) | $B \cap A'$ or $B \setminus A$ |
| IV  | Elements in neither $A$ nor $B$ | $(A \cup B)'$ or $A' \cap B'$ |

**Visualizing operations:**

- $A \cup B$ = regions I + II + III (everything inside at least one circle)
- $A \cap B$ = region II (the overlap)
- $A \setminus B$ = region I (in $A$'s circle but outside $B$'s)
- $A'$ = regions III + IV (everything outside $A$'s circle)

---

### Three-Set Venn Diagram

For three sets $A$, $B$, and $C$, the diagram creates **eight distinct regions**:

| Region | Description | Set Notation |
|--------|-------------|--------------|
| I    | Only in $A$ | $A \cap B' \cap C'$ |
| II   | In $A$ and $B$ only | $A \cap B \cap C'$ |
| III  | Only in $B$ | $A' \cap B \cap C'$ |
| IV   | In $A$ and $C$ only | $A \cap B' \cap C$ |
| V    | In all three | $A \cap B \cap C$ |
| VI   | In $B$ and $C$ only | $A' \cap B \cap C$ |
| VII  | Only in $C$ | $A' \cap B' \cap C$ |
| VIII | In none | $A' \cap B' \cap C'$ |

Every element of $U$ falls into exactly one of these eight regions. This gives us a systematic way to analyze any set expression involving three sets.

---

### Using Venn Diagrams to Verify Identities

**Example:** Verify that $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$.

**Left side:** $A \cap (B \cup C)$
- $B \cup C$ covers regions II, III, IV, V, VI, VII
- Intersecting with $A$ (regions I, II, IV, V) gives regions II, IV, V

**Right side:** $(A \cap B) \cup (A \cap C)$
- $A \cap B$ = regions II, V
- $A \cap C$ = regions IV, V
- Union = regions II, IV, V

Both sides cover the same regions (II, IV, V), so the identity holds. ✓

---

## Membership Tables

A **membership table** (also called a truth-table approach) is a systematic way to prove set identities. For each possible combination of membership in the component sets, we compute whether an element belongs to each side of the identity.

### How It Works

For each element $x$ in the universal set, $x$ either belongs to a set ($1$) or doesn't ($0$). We evaluate both sides of the identity for all possible membership combinations.

**Example:** Prove De Morgan's Law: $(A \cup B)' = A' \cap B'$

| $x \in A$ | $x \in B$ | $A \cup B$ | $(A \cup B)'$ | $A'$ | $B'$ | $A' \cap B'$ |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 0 | 1 | 1 | 0 | 1 | 0 | 0 |
| 1 | 0 | 1 | 0 | 0 | 1 | 0 |
| 1 | 1 | 1 | 0 | 0 | 0 | 0 |

The columns for $(A \cup B)'$ and $A' \cap B'$ are identical, so the identity is proven. ✓

---

### Element-Chasing Proofs

An **element-chasing** (or element-argument) proof shows two sets are equal by proving each is a subset of the other:

$$X = Y \iff (X \subseteq Y) \text{ and } (Y \subseteq X)$$

For each direction, we pick an arbitrary element and show it belongs to the other set.

**Example:** Prove $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$.

**Proof ($\subseteq$ direction):**

Let $x \in A \cap (B \cup C)$.
Then $x \in A$ and $x \in B \cup C$.
Since $x \in B \cup C$, either $x \in B$ or $x \in C$ (or both).

- **Case 1:** $x \in B$. Then $x \in A$ and $x \in B$, so $x \in A \cap B$, hence $x \in (A \cap B) \cup (A \cap C)$.
- **Case 2:** $x \in C$. Then $x \in A$ and $x \in C$, so $x \in A \cap C$, hence $x \in (A \cap B) \cup (A \cap C)$.

In both cases, $x \in (A \cap B) \cup (A \cap C)$. ✓

**Proof ($\supseteq$ direction):**

Let $x \in (A \cap B) \cup (A \cap C)$.
Then $x \in A \cap B$ or $x \in A \cap C$.

- **Case 1:** $x \in A \cap B$. Then $x \in A$ and $x \in B$. Since $x \in B$, we have $x \in B \cup C$. So $x \in A \cap (B \cup C)$.
- **Case 2:** $x \in A \cap C$. Then $x \in A$ and $x \in C$. Since $x \in C$, we have $x \in B \cup C$. So $x \in A \cap (B \cup C)$.

In both cases, $x \in A \cap (B \cup C)$. ✓

Since both directions hold, $A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$. $\blacksquare$

---

## Key Set Identities

Here is a comprehensive list of important set identities. In all of these, $U$ is the universal set.

### Identity Laws

$$A \cup \emptyset = A$$
$$A \cap U = A$$

### Domination Laws

$$A \cup U = U$$
$$A \cap \emptyset = \emptyset$$

### Idempotent Laws

$$A \cup A = A$$
$$A \cap A = A$$

### Complement Laws

$$A \cup A' = U$$
$$A \cap A' = \emptyset$$
$$(A')' = A$$

### Commutative Laws

$$A \cup B = B \cup A$$
$$A \cap B = B \cap A$$

### Associative Laws

$$A \cup (B \cup C) = (A \cup B) \cup C$$
$$A \cap (B \cap C) = (A \cap B) \cap C$$

### Distributive Laws

$$A \cup (B \cap C) = (A \cup B) \cap (A \cup C)$$
$$A \cap (B \cup C) = (A \cap B) \cup (A \cap C)$$

### De Morgan's Laws

$$(A \cup B)' = A' \cap B'$$
$$(A \cap B)' = A' \cup B'$$

### Absorption Laws

$$A \cup (A \cap B) = A$$
$$A \cap (A \cup B) = A$$

**Proof of absorption** ($A \cup (A \cap B) = A$):

- ($\supseteq$): $A \subseteq A \cup X$ for any $X$, so $A \subseteq A \cup (A \cap B)$. ✓
- ($\subseteq$): If $x \in A \cup (A \cap B)$, then $x \in A$ or $x \in A \cap B$. In either case, $x \in A$. ✓

### Difference and Complement

$$A \setminus B = A \cap B'$$

This identity is extremely useful — it lets us rewrite set difference using intersection and complement, which are often easier to manipulate algebraically.

**Proof:** $x \in A \setminus B \iff x \in A \text{ and } x \notin B \iff x \in A \text{ and } x \in B' \iff x \in A \cap B'$. ✓

### Symmetric Difference

$$A \oplus B = (A \setminus B) \cup (B \setminus A) = (A \cup B) \setminus (A \cap B)$$

---

## The Inclusion-Exclusion Principle

### For Two Sets

When we compute $|A \cup B|$ by adding $|A| + |B|$, we **double-count** the elements in $A \cap B$. We must subtract them once:

$$|A \cup B| = |A| + |B| - |A \cap B|$$

**Example:** In a class of students, 25 study math, 20 study physics, and 10 study both. How many study at least one subject?

$$|M \cup P| = 25 + 20 - 10 = 35$$

**Why it works (Venn diagram reasoning):**

- Region I ($A$ only) has $|A| - |A \cap B|$ elements
- Region II (both) has $|A \cap B|$ elements
- Region III ($B$ only) has $|B| - |A \cap B|$ elements

Total = $(|A| - |A \cap B|) + |A \cap B| + (|B| - |A \cap B|) = |A| + |B| - |A \cap B|$ ✓

### For Three Sets

$$|A \cup B \cup C| = |A| + |B| + |C| - |A \cap B| - |A \cap C| - |B \cap C| + |A \cap B \cap C|$$

The pattern: add individual sizes, subtract pairwise intersections, add back the triple intersection.

**Example:** In a survey: 40 like tea, 30 like coffee, 25 like juice, 15 like tea and coffee, 10 like tea and juice, 8 like coffee and juice, and 5 like all three.

$$|T \cup C \cup J| = 40 + 30 + 25 - 15 - 10 - 8 + 5 = 67$$

---

## Code: Verifying Set Identities

### Exhaustive Verification

```python
from itertools import product

def verify_identity_2sets(identity_name, lhs_func, rhs_func):
    """
    Verify a set identity by testing all possible memberships.
    Functions take (in_A, in_B) and return True/False.
    """
    print(f"Verifying: {identity_name}")
    print(f"{'x∈A':<6}{'x∈B':<6}{'LHS':<6}{'RHS':<6}{'Match'}")
    print("-" * 30)

    all_match = True
    for in_A, in_B in product([False, True], repeat=2):
        lhs = lhs_func(in_A, in_B)
        rhs = rhs_func(in_A, in_B)
        match = lhs == rhs
        all_match = all_match and match
        print(f"{int(in_A):<6}{int(in_B):<6}{int(lhs):<6}{int(rhs):<6}{'✓' if match else '✗'}")

    print(f"\nIdentity {'HOLDS' if all_match else 'FAILS'}!\n")


# De Morgan's Law: (A ∪ B)' = A' ∩ B'
verify_identity_2sets(
    "(A ∪ B)' = A' ∩ B'",
    lhs_func=lambda a, b: not (a or b),
    rhs_func=lambda a, b: (not a) and (not b),
)

# Distributive Law: A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)
def verify_identity_3sets(identity_name, lhs_func, rhs_func):
    """Verify identity with 3 sets."""
    print(f"Verifying: {identity_name}")
    all_match = True
    for in_A, in_B, in_C in product([False, True], repeat=3):
        lhs = lhs_func(in_A, in_B, in_C)
        rhs = rhs_func(in_A, in_B, in_C)
        if lhs != rhs:
            all_match = False
            break

    print(f"Identity {'HOLDS' if all_match else 'FAILS'}!\n")


verify_identity_3sets(
    "A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)",
    lhs_func=lambda a, b, c: a and (b or c),
    rhs_func=lambda a, b, c: (a and b) or (a and c),
)
```

### Verifying with Concrete Sets

```python
def inclusion_exclusion_2(A, B):
    """Demonstrate inclusion-exclusion for two sets."""
    union = A | B
    intersection = A & B

    calculated = len(A) + len(B) - len(intersection)
    actual = len(union)

    print(f"A = {sorted(A)}")
    print(f"B = {sorted(B)}")
    print(f"|A| = {len(A)}, |B| = {len(B)}, |A ∩ B| = {len(intersection)}")
    print(f"|A ∪ B| by formula: {len(A)} + {len(B)} - {len(intersection)} = {calculated}")
    print(f"|A ∪ B| actual: {actual}")
    print(f"Match: {'✓' if calculated == actual else '✗'}\n")


A = {1, 2, 3, 4, 5}
B = {3, 4, 5, 6, 7}
inclusion_exclusion_2(A, B)


def verify_absorption(A, B):
    """Verify absorption law: A ∪ (A ∩ B) = A"""
    lhs = A | (A & B)
    rhs = A
    print(f"Absorption Law: A ∪ (A ∩ B) = A")
    print(f"A = {sorted(A)}, B = {sorted(B)}")
    print(f"A ∩ B = {sorted(A & B)}")
    print(f"A ∪ (A ∩ B) = {sorted(lhs)}")
    print(f"Holds: {'✓' if lhs == rhs else '✗'}\n")


verify_absorption({1, 2, 3, 4}, {3, 4, 5, 6})
```

```javascript
function verifyDeMorgan(U, A, B) {
  // (A ∪ B)' = A' ∩ B'
  const union = new Set([...A, ...B]);
  const complement = new Set([...U].filter((x) => !union.has(x)));

  const compA = new Set([...U].filter((x) => !A.has(x)));
  const compB = new Set([...U].filter((x) => !B.has(x)));
  const intersection = new Set([...compA].filter((x) => compB.has(x)));

  const lhs = [...complement].sort();
  const rhs = [...intersection].sort();

  console.log("De Morgan: (A ∪ B)' = A' ∩ B'");
  console.log(`U = {${[...U].sort()}}`);
  console.log(`A = {${[...A].sort()}}, B = {${[...B].sort()}}`);
  console.log(`(A ∪ B)' = {${lhs}}`);
  console.log(`A' ∩ B'  = {${rhs}}`);
  console.log(`Holds: ${JSON.stringify(lhs) === JSON.stringify(rhs) ? "✓" : "✗"}`);
}

const U = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
const A = new Set([1, 2, 3, 4]);
const B = new Set([3, 4, 5, 6]);
verifyDeMorgan(U, A, B);
```

```java
import java.util.HashSet;
import java.util.Set;

public class SetIdentities {

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

    public static <T> Set<T> complement(Set<T> universal, Set<T> a) {
        Set<T> result = new HashSet<>(universal);
        result.removeAll(a);
        return result;
    }

    public static void main(String[] args) {
        Set<Integer> U = Set.of(1, 2, 3, 4, 5, 6, 7, 8);
        Set<Integer> A = Set.of(1, 2, 3, 4);
        Set<Integer> B = Set.of(3, 4, 5, 6);

        // Verify De Morgan's Law: (A ∪ B)' = A' ∩ B'
        Set<Integer> lhs = complement(U, union(A, B));
        Set<Integer> rhs = intersection(complement(U, A), complement(U, B));

        System.out.println("De Morgan: (A ∪ B)' = A' ∩ B'");
        System.out.println("LHS = " + lhs);
        System.out.println("RHS = " + rhs);
        System.out.println("Holds: " + lhs.equals(rhs));
    }
}
```

---

## Proof Strategies Summary

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| Venn Diagram | Intuition, 2-3 sets | Visual, fast | Not rigorous for proofs |
| Membership Table | Any number of sets | Mechanical, complete | Gets large with many sets |
| Element-Chasing | Formal proofs | Rigorous, elegant | Requires logical reasoning |
| Algebraic | Simplification | Efficient for known identities | Must know the laws |

---

## Practice Problems

1. Use a membership table to prove $(A \cap B)' = A' \cup B'$.

2. Prove the absorption law $A \cap (A \cup B) = A$ using element-chasing.

3. In a class of 100 students: 60 take math, 45 take science, and 20 take both. How many take neither?

4. Show using a Venn diagram that $A \setminus (B \cap C) = (A \setminus B) \cup (A \setminus C)$.

5. Prove or disprove: $A \cup (B \cap C) = (A \cup B) \cap C$.

6. Use inclusion-exclusion for 3 sets: in a group of 200 people, 120 speak English, 90 speak French, 70 speak Spanish, 50 speak English and French, 40 speak English and Spanish, 30 speak French and Spanish, and 20 speak all three. How many speak at least one language?

---

## Key Takeaways

- **Venn diagrams** provide visual intuition for set operations — 2 sets create 4 regions, 3 sets create 8 regions.
- **Membership tables** provide a mechanical, exhaustive method to verify identities by checking all possible membership combinations.
- **Element-chasing** proofs are the gold standard for rigor: show $X \subseteq Y$ and $Y \subseteq X$ by tracking an arbitrary element.
- **Absorption laws** ($A \cup (A \cap B) = A$ and $A \cap (A \cup B) = A$) simplify expressions where a set appears multiple times.
- The identity $A \setminus B = A \cap B'$ converts difference to intersection, enabling algebraic manipulation.
- **Inclusion-exclusion** corrects for overcounting: $|A \cup B| = |A| + |B| - |A \cap B|$.
- Set identities mirror logical equivalences — De Morgan's, distributive, and complement laws hold in both domains.
- Always verify identities computationally when in doubt — a single counterexample disproves a claim.
