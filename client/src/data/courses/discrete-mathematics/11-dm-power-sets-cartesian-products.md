---
title: Power Sets & Cartesian Products
---

In this lesson, we explore two fundamental constructions that build new sets from existing ones: **power sets** and **Cartesian products**. These concepts appear everywhere in mathematics and computer science — from database design to defining function spaces.

---

## Power Sets

### Definition

The **power set** of a set $A$, denoted $\mathcal{P}(A)$ (sometimes written $2^A$), is the set of **all subsets** of $A$, including the empty set $\emptyset$ and $A$ itself.

$$\mathcal{P}(A) = \{ S \mid S \subseteq A \}$$

### Simple Examples

**Example 1:** Let $A = \{1, 2\}$.

The subsets of $A$ are:
- $\emptyset$ (the empty set is a subset of every set)
- $\{1\}$
- $\{2\}$
- $\{1, 2\}$ (every set is a subset of itself)

Therefore:

$$\mathcal{P}(\{1, 2\}) = \{\emptyset, \{1\}, \{2\}, \{1, 2\}\}$$

**Example 2:** Let $B = \{a, b, c\}$.

$$\mathcal{P}(B) = \{\emptyset, \{a\}, \{b\}, \{c\}, \{a,b\}, \{a,c\}, \{b,c\}, \{a,b,c\}\}$$

That gives us 8 subsets.

**Example 3:** The power set of the empty set:

$$\mathcal{P}(\emptyset) = \{\emptyset\}$$

Note: $\mathcal{P}(\emptyset)$ is **not** empty — it contains one element (the empty set itself).

---

### Cardinality of the Power Set

**Theorem:** If $|A| = n$, then $|\mathcal{P}(A)| = 2^n$.

This is why the power set is sometimes written as $2^A$.

**Proof (Counting Argument):**

To form a subset $S \subseteq A$, we make a binary decision for each element of $A$: include it in $S$ or exclude it. For each of the $n$ elements, there are 2 choices (in or out), and these choices are independent.

By the multiplication principle:

$$|\mathcal{P}(A)| = \underbrace{2 \times 2 \times \cdots \times 2}_{n \text{ times}} = 2^n$$

**Verification with our examples:**
- $|A| = 2 \Rightarrow |\mathcal{P}(A)| = 2^2 = 4$ ✓
- $|B| = 3 \Rightarrow |\mathcal{P}(B)| = 2^3 = 8$ ✓
- $|\emptyset| = 0 \Rightarrow |\mathcal{P}(\emptyset)| = 2^0 = 1$ ✓

**Alternative Proof (Bijection with Binary Strings):**

Label the elements of $A = \{a_1, a_2, \ldots, a_n\}$. Each subset $S \subseteq A$ corresponds to a binary string $b_1 b_2 \ldots b_n$ where:

$$b_i = \begin{cases} 1 & \text{if } a_i \in S \\ 0 & \text{if } a_i \notin S \end{cases}$$

There are exactly $2^n$ binary strings of length $n$, so there are $2^n$ subsets.

---

### Properties of Power Sets

1. **$\emptyset \in \mathcal{P}(A)$** for every set $A$ (since $\emptyset \subseteq A$ always).

2. **$A \in \mathcal{P}(A)$** for every set $A$ (since $A \subseteq A$ always).

3. **$S \in \mathcal{P}(A) \iff S \subseteq A$** — membership in the power set is equivalent to being a subset.

4. **$\mathcal{P}(A) \subseteq \mathcal{P}(B) \iff A \subseteq B$** — power set inclusion mirrors set inclusion.

5. **$\mathcal{P}(A \cap B) = \mathcal{P}(A) \cap \mathcal{P}(B)$** — power set distributes over intersection.

---

### Growth of Power Sets

The power set grows **exponentially**:

| $|A|$ | $|\mathcal{P}(A)|$ |
|--------|---------------------|
| 0      | 1                   |
| 1      | 2                   |
| 5      | 32                  |
| 10     | 1,024               |
| 20     | 1,048,576           |
| 30     | 1,073,741,824       |

This exponential growth is why algorithms that enumerate all subsets (e.g., brute-force solutions) become impractical for large inputs.

---

## Cartesian Products

### Definition

The **Cartesian product** of two sets $A$ and $B$, written $A \times B$, is the set of all **ordered pairs** $(a, b)$ where $a \in A$ and $b \in B$:

$$A \times B = \{(a, b) \mid a \in A \text{ and } b \in B\}$$

The key word here is **ordered** — the pair $(a, b)$ is different from $(b, a)$ unless $a = b$.

### Simple Examples

**Example 1:** Let $A = \{1, 2\}$ and $B = \{x, y, z\}$.

$$A \times B = \{(1,x), (1,y), (1,z), (2,x), (2,y), (2,z)\}$$

**Example 2:** Let $C = \{a, b\}$.

$$C \times C = \{(a,a), (a,b), (b,a), (b,b)\}$$

**Example 3:** Cartesian product with the empty set:

$$A \times \emptyset = \emptyset$$

If either set is empty, the Cartesian product is empty (there are no elements to pair).

---

### Cardinality of the Cartesian Product

**Theorem:** $|A \times B| = |A| \cdot |B|$

**Proof:** For each element $a \in A$, we can pair it with every element in $B$, giving $|B|$ pairs. Since there are $|A|$ choices for the first component:

$$|A \times B| = |A| \cdot |B|$$

**Verification:** $|\{1,2\}| \cdot |\{x,y,z\}| = 2 \cdot 3 = 6$ ✓

---

### Non-Commutativity

In general, $A \times B \neq B \times A$.

**Example:** Let $A = \{1, 2\}$ and $B = \{a\}$.

- $A \times B = \{(1, a), (2, a)\}$
- $B \times A = \{(a, 1), (a, 2)\}$

These are different sets because $(1, a) \neq (a, 1)$ — order matters in ordered pairs.

**When are they equal?**
- $A \times B = B \times A$ when $A = B$, or when $A = \emptyset$, or when $B = \emptyset$.

---

### Cartesian Product Is Not Associative

$(A \times B) \times C \neq A \times (B \times C)$ in a strict set-theoretic sense:

- $(A \times B) \times C$ contains elements like $((a, b), c)$ — a pair whose first element is itself a pair.
- $A \times (B \times C)$ contains elements like $(a, (b, c))$ — a pair whose second element is a pair.

However, there is a natural correspondence between them, so we often write $A \times B \times C$ without parentheses when working with ordered triples.

---

### $n$-ary Cartesian Products

We can extend the Cartesian product to any number of sets:

$$A_1 \times A_2 \times \cdots \times A_n = \{(a_1, a_2, \ldots, a_n) \mid a_i \in A_i \text{ for each } i\}$$

The elements are called **$n$-tuples** (ordered sequences of $n$ elements).

**Cardinality:**

$$|A_1 \times A_2 \times \cdots \times A_n| = |A_1| \cdot |A_2| \cdots |A_n|$$

**Special case:** When all sets are the same, $A^n = A \times A \times \cdots \times A$ ($n$ times).

- $\mathbb{R}^2 = \mathbb{R} \times \mathbb{R}$ is the 2D plane.
- $\mathbb{R}^3 = \mathbb{R} \times \mathbb{R} \times \mathbb{R}$ is 3D space.
- $\{0, 1\}^n$ is the set of all binary strings of length $n$ (with $2^n$ elements).

---

## Applications

### Coordinate Systems

The Cartesian coordinate plane is literally $\mathbb{R} \times \mathbb{R} = \mathbb{R}^2$. Each point $(x, y)$ is an ordered pair from the Cartesian product of the real numbers with itself. This is why it's called the "Cartesian" plane — named after René Descartes.

### Database Tables (Relations)

A database table with columns of types $T_1, T_2, \ldots, T_n$ stores rows that are elements of $T_1 \times T_2 \times \cdots \times T_n$.

For example, a `Students` table with columns `(ID: Integer, Name: String, GPA: Float)` stores tuples from $\mathbb{Z} \times \text{String} \times \mathbb{R}$.

### Function Domains

A function $f: A \to B$ is formally defined as a subset of $A \times B$ satisfying certain properties. The Cartesian product provides the "space" of all possible input-output pairs.

### Combinatorial Search

Enumerating all subsets (power set) or all combinations (Cartesian product) is the basis of brute-force algorithms and backtracking solutions.

---

## Code: Generating Power Sets and Cartesian Products

### Power Set Generation

```python
def power_set(s):
    """Generate the power set of a list s."""
    elements = list(s)
    n = len(elements)
    result = []

    # Use binary representation: each number 0 to 2^n - 1
    # represents a subset
    for i in range(2**n):
        subset = []
        for j in range(n):
            if i & (1 << j):  # Check if j-th bit is set
                subset.append(elements[j])
        result.append(subset)

    return result


# Example usage
A = {1, 2, 3}
ps = power_set(A)
print(f"Set A = {A}")
print(f"|P(A)| = {len(ps)}")
print("Subsets:")
for subset in ps:
    print(f"  {set(subset) if subset else '{}'}")
```

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<vector<int>> powerSet(vector<int>& elements) {
    int n = elements.size();
    int totalSubsets = 1 << n;  // 2^n
    vector<vector<int>> result;

    for (int mask = 0; mask < totalSubsets; mask++) {
        vector<int> subset;
        for (int j = 0; j < n; j++) {
            if (mask & (1 << j)) {
                subset.push_back(elements[j]);
            }
        }
        result.push_back(subset);
    }
    return result;
}

int main() {
    vector<int> A = {1, 2, 3};
    auto ps = powerSet(A);

    cout << "|P(A)| = " << ps.size() << endl;
    for (auto& subset : ps) {
        cout << "{ ";
        for (int x : subset) cout << x << " ";
        cout << "}" << endl;
    }
    return 0;
}
```

```javascript
function powerSet(elements) {
  const n = elements.length;
  const result = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) {
        subset.push(elements[j]);
      }
    }
    result.push(subset);
  }
  return result;
}

// Example
const A = [1, 2, 3];
const ps = powerSet(A);
console.log(`|P(A)| = ${ps.length}`);
ps.forEach((s) => console.log(`  {${s.join(", ")}}`));
```

### Cartesian Product Generation

```python
from itertools import product

def cartesian_product(A, B):
    """Compute A x B manually."""
    return [(a, b) for a in A for b in B]


def n_ary_cartesian(*sets):
    """Compute the n-ary Cartesian product of multiple sets."""
    if not sets:
        return [()]
    result = [()]
    for s in sets:
        result = [t + (x,) for t in result for x in s]
    return result


# Example usage
A = [1, 2]
B = ['x', 'y', 'z']

print("A × B =", cartesian_product(A, B))
print("|A × B| =", len(cartesian_product(A, B)))

# Using itertools for n-ary product
C = ['a', 'b']
print("\nA × B × C =", list(product(A, B, C)))
print("|A × B × C| =", len(A) * len(B) * len(C))
```

```java
import java.util.ArrayList;
import java.util.List;

public class CartesianProduct {

    public static <A, B> List<String> cartesianProduct(List<A> setA, List<B> setB) {
        List<String> result = new ArrayList<>();
        for (A a : setA) {
            for (B b : setB) {
                result.add("(" + a + ", " + b + ")");
            }
        }
        return result;
    }

    public static void main(String[] args) {
        List<Integer> A = List.of(1, 2);
        List<String> B = List.of("x", "y", "z");

        List<String> product = cartesianProduct(A, B);
        System.out.println("A × B = " + product);
        System.out.println("|A × B| = " + product.size());
    }
}
```

---

### Recursive Power Set (Alternative Approach)

```python
def power_set_recursive(elements):
    """Generate power set using recursion."""
    if not elements:
        return [[]]

    first = elements[0]
    rest = elements[1:]

    # Get all subsets that don't include the first element
    subsets_without = power_set_recursive(rest)

    # Add the first element to each of those subsets
    subsets_with = [[first] + s for s in subsets_without]

    return subsets_without + subsets_with


# Example
result = power_set_recursive([1, 2, 3])
print(f"Power set (recursive): {len(result)} subsets")
for s in result:
    print(f"  {s}")
```

---

## Common Pitfalls

1. **Confusing $\in$ and $\subseteq$ with power sets:**
   - $\{1\} \in \mathcal{P}(\{1,2\})$ ✓ (the set $\{1\}$ is a member of the power set)
   - $\{1\} \subseteq \mathcal{P}(\{1,2\})$ ✗ (the element 1 is not a subset in the power set)
   - $\{\{1\}\} \subseteq \mathcal{P}(\{1,2\})$ ✓ (a set containing $\{1\}$, which is a member)

2. **Forgetting the empty set:** $\emptyset$ is always in $\mathcal{P}(A)$.

3. **Assuming commutativity:** Remember $(a, b) \neq (b, a)$ unless $a = b$.

4. **Confusing sets and tuples:** $\{1, 2\} = \{2, 1\}$ but $(1, 2) \neq (2, 1)$.

---

## Practice Problems

1. List all elements of $\mathcal{P}(\{a, b, c, d\})$. How many are there?

2. If $|A| = 5$, how many elements does $\mathcal{P}(\mathcal{P}(A))$ have?

3. Let $A = \{1, 2, 3\}$ and $B = \{a, b\}$. List all elements of $A \times B$ and $B \times A$. Are they equal?

4. How many elements are in $\{0, 1\}^4$? List them all.

5. Prove that $\mathcal{P}(A \cap B) = \mathcal{P}(A) \cap \mathcal{P}(B)$.

---

## Key Takeaways

- The **power set** $\mathcal{P}(A)$ is the set of all subsets of $A$, always including $\emptyset$ and $A$ itself.
- $|\mathcal{P}(A)| = 2^{|A|}$ — each element has a binary choice (in or out), giving exponential growth.
- The **Cartesian product** $A \times B$ is the set of all ordered pairs $(a, b)$ with $a \in A$, $b \in B$.
- $|A \times B| = |A| \cdot |B|$ — the multiplication principle in action.
- Cartesian products are **not commutative**: $A \times B \neq B \times A$ in general.
- $n$-ary Cartesian products generalize to tuples and underpin coordinate geometry, databases, and combinatorial enumeration.
- Power sets and Cartesian products are the building blocks for more advanced topics like relations, functions, and probability spaces.
