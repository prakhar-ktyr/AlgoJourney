---
title: Groups — Definition & Examples
---

# Groups — Definition & Examples

Groups are one of the most fundamental structures in abstract algebra. A group captures the essence of symmetry and provides a unifying framework for many mathematical concepts. In this lesson, we explore what groups are, their axioms, and numerous examples.

---

## Algebraic Structure: Set + Operation

An **algebraic structure** consists of:

1. A **set** $S$ (the underlying set)
2. One or more **binary operations** on $S$

A binary operation $*$ on a set $S$ is a function:

$$* : S \times S \to S$$

that takes two elements of $S$ and produces another element of $S$.

For example:
- Addition on integers: $+ : \mathbb{Z} \times \mathbb{Z} \to \mathbb{Z}$
- Multiplication on reals: $\times : \mathbb{R} \times \mathbb{R} \to \mathbb{R}$

We write $(S, *)$ to denote the set $S$ equipped with operation $*$.

---

## Group Axioms

A **group** is an algebraic structure $(G, *)$ satisfying four axioms:

### Axiom 1: Closure

For all $a, b \in G$:

$$a * b \in G$$

The result of combining any two elements is still in the set.

### Axiom 2: Associativity

For all $a, b, c \in G$:

$$(a * b) * c = a * (b * c)$$

Parentheses don't matter when combining three or more elements.

### Axiom 3: Identity Element

There exists an element $e \in G$ such that for all $a \in G$:

$$e * a = a * e = a$$

There is a "do nothing" element.

### Axiom 4: Inverse Element

For every $a \in G$, there exists an element $a^{-1} \in G$ such that:

$$a * a^{-1} = a^{-1} * a = e$$

Every element can be "undone."

### Summary Table

| Axiom | Statement |
|-------|-----------|
| Closure | $a * b \in G$ for all $a, b \in G$ |
| Associativity | $(a * b) * c = a * (b * c)$ |
| Identity | $\exists e : e * a = a * e = a$ |
| Inverse | $\forall a, \exists a^{-1} : a * a^{-1} = e$ |

---

## Examples of Groups

### Example 1: $(\mathbb{Z}, +)$ — Integers under Addition

- **Set**: $\mathbb{Z} = \{\ldots, -2, -1, 0, 1, 2, \ldots\}$
- **Operation**: Addition
- **Closure**: Sum of two integers is an integer ✓
- **Associativity**: $(a + b) + c = a + (b + c)$ ✓
- **Identity**: $0$ (since $a + 0 = 0 + a = a$) ✓
- **Inverse**: $-a$ (since $a + (-a) = 0$) ✓

### Example 2: $(\mathbb{Z}_n, +)$ — Integers mod $n$ under Addition

- **Set**: $\mathbb{Z}_n = \{0, 1, 2, \ldots, n-1\}$
- **Operation**: Addition modulo $n$
- **Closure**: $(a + b) \mod n \in \mathbb{Z}_n$ ✓
- **Associativity**: Inherited from integer addition ✓
- **Identity**: $0$ ✓
- **Inverse**: $n - a$ (since $(a + (n-a)) \mod n = 0$) ✓

For example, in $\mathbb{Z}_5$: the inverse of $3$ is $2$ because $(3 + 2) \mod 5 = 0$.

### Example 3: $(\mathbb{Z}_n^*, \times)$ — Units mod $n$ under Multiplication

- **Set**: $\mathbb{Z}_n^* = \{a \in \mathbb{Z}_n : \gcd(a, n) = 1\}$
- **Operation**: Multiplication modulo $n$

For $n = 10$: $\mathbb{Z}_{10}^* = \{1, 3, 7, 9\}$

- **Closure**: If $\gcd(a, n) = 1$ and $\gcd(b, n) = 1$, then $\gcd(ab, n) = 1$ ✓
- **Associativity**: Inherited from integer multiplication ✓
- **Identity**: $1$ ✓
- **Inverse**: The modular inverse (exists by Bézout's identity) ✓

### Example 4: Permutation Groups

A **permutation** of a set $S$ is a bijection $\sigma : S \to S$.

The set of all permutations of $\{1, 2, \ldots, n\}$ forms the **symmetric group** $S_n$ under function composition.

For $S_3$ (permutations of 3 elements):
- $|S_3| = 3! = 6$
- Identity: $e = (1)(2)(3)$
- Example: $\sigma = (1\ 2\ 3)$ means $1 \to 2, 2 \to 3, 3 \to 1$

### Example 5: Symmetry Groups

The symmetries of a geometric figure form a group under composition.

**Symmetries of an equilateral triangle** (Dihedral group $D_3$):
- 3 rotations: $r_0$ (identity), $r_{120}$, $r_{240}$
- 3 reflections: $s_1, s_2, s_3$
- Total: $|D_3| = 6$

**Symmetries of a square** (Dihedral group $D_4$):
- 4 rotations: $r_0, r_{90}, r_{180}, r_{270}$
- 4 reflections
- Total: $|D_4| = 8$

### Non-Examples

Not every set with an operation forms a group:

- $(\mathbb{N}, +)$: No inverse for positive numbers ✗
- $(\mathbb{Z}, \times)$: No multiplicative inverse for most integers ✗
- $(\mathbb{Z}_n, \times)$: Elements with $\gcd(a, n) \neq 1$ have no inverse ✗

---

## Abelian (Commutative) Groups

A group $(G, *)$ is **abelian** (or commutative) if for all $a, b \in G$:

$$a * b = b * a$$

### Examples of Abelian Groups

| Group | Abelian? |
|-------|----------|
| $(\mathbb{Z}, +)$ | Yes |
| $(\mathbb{Z}_n, +)$ | Yes |
| $(\mathbb{Z}_n^*, \times)$ | Yes |
| $(\mathbb{R} \setminus \{0\}, \times)$ | Yes |
| $(S_n, \circ)$ for $n \geq 3$ | **No** |
| $(D_n, \circ)$ for $n \geq 3$ | **No** |

The symmetric group $S_3$ is non-abelian because:

$$\sigma \circ \tau \neq \tau \circ \sigma$$

for certain permutations $\sigma, \tau$.

---

## Order of a Group

The **order** of a group $G$, written $|G|$, is the number of elements in $G$.

| Group | Order |
|-------|-------|
| $\mathbb{Z}_n$ | $n$ |
| $\mathbb{Z}_n^*$ | $\phi(n)$ (Euler's totient) |
| $S_n$ | $n!$ |
| $D_n$ | $2n$ |

A group is **finite** if $|G| < \infty$, otherwise it is **infinite**.

---

## Order of an Element

The **order** of an element $a \in G$, written $\text{ord}(a)$ or $|a|$, is the smallest positive integer $k$ such that:

$$a^k = e$$

where $a^k = \underbrace{a * a * \cdots * a}_{k \text{ times}}$.

If no such $k$ exists, the element has **infinite order**.

### Examples

In $(\mathbb{Z}_6, +)$:
- $\text{ord}(0) = 1$ (identity)
- $\text{ord}(1) = 6$ (since $1 + 1 + \cdots + 1 = 6 \equiv 0$)
- $\text{ord}(2) = 3$ (since $2 + 2 + 2 = 6 \equiv 0$)
- $\text{ord}(3) = 2$ (since $3 + 3 = 6 \equiv 0$)
- $\text{ord}(4) = 3$ (since $4 + 4 + 4 = 12 \equiv 0$)
- $\text{ord}(5) = 6$

**Key fact**: In a finite group, $\text{ord}(a)$ always divides $|G|$.

---

## Cayley Table

A **Cayley table** (or group multiplication table) displays all products in a finite group.

### Cayley Table for $(\mathbb{Z}_4, +)$

| $+$ | 0 | 1 | 2 | 3 |
|-----|---|---|---|---|
| **0** | 0 | 1 | 2 | 3 |
| **1** | 1 | 2 | 3 | 0 |
| **2** | 2 | 3 | 0 | 1 |
| **3** | 3 | 0 | 1 | 2 |

### Cayley Table for $(\mathbb{Z}_5^*, \times)$

| $\times$ | 1 | 2 | 3 | 4 |
|-----------|---|---|---|---|
| **1** | 1 | 2 | 3 | 4 |
| **2** | 2 | 4 | 1 | 3 |
| **3** | 3 | 1 | 4 | 2 |
| **4** | 4 | 3 | 2 | 1 |

### Properties of Cayley Tables

A valid group Cayley table has:
1. Every row is a permutation of the group elements (Latin square property)
2. Every column is a permutation of the group elements
3. The identity row/column matches the header

---

## Cyclic Groups and Generators

A group $G$ is **cyclic** if there exists an element $g \in G$ such that every element of $G$ can be written as a power of $g$:

$$G = \langle g \rangle = \{g^0, g^1, g^2, \ldots\} = \{e, g, g^2, \ldots, g^{n-1}\}$$

The element $g$ is called a **generator** of $G$.

### Examples of Cyclic Groups

1. $(\mathbb{Z}_n, +)$ is cyclic with generator $1$ (since every element is $1 + 1 + \cdots + 1$)

2. $(\mathbb{Z}_6, +)$:
   - Generators: $1, 5$ (elements with $\gcd(a, 6) = 1$)
   - Non-generators: $0, 2, 3, 4$

3. $(\mathbb{Z}_7^*, \times) = \{1, 2, 3, 4, 5, 6\}$:
   - Generator $3$: $3^1=3, 3^2=2, 3^3=6, 3^4=4, 3^5=5, 3^6=1$
   - This is cyclic of order 6

### Finding Generators

An element $a \in \mathbb{Z}_n$ is a generator of $(\mathbb{Z}_n, +)$ if and only if $\gcd(a, n) = 1$.

The number of generators of $\mathbb{Z}_n$ is $\phi(n)$ (Euler's totient function).

### Properties of Cyclic Groups

- Every cyclic group is abelian
- Every subgroup of a cyclic group is cyclic
- A cyclic group of order $n$ has exactly one subgroup of order $d$ for each divisor $d$ of $n$
- Two cyclic groups of the same order are isomorphic

### The Infinite Cyclic Group

$(\mathbb{Z}, +)$ is the infinite cyclic group with generators $1$ and $-1$:

$$\mathbb{Z} = \langle 1 \rangle = \{\ldots, -2, -1, 0, 1, 2, \ldots\}$$

---

## Code: Verify Group Axioms for $\mathbb{Z}_n$

```cpp
#include <iostream>
#include <vector>
using namespace std;

bool verifyGroupAxioms(int n) {
    // Closure: (a + b) mod n is always in {0, ..., n-1} by definition
    // Associativity: inherited from integer addition

    // Verify identity (0)
    for (int a = 0; a < n; a++) {
        if ((a + 0) % n != a || (0 + a) % n != a) return false;
    }

    // Verify inverses
    for (int a = 0; a < n; a++) {
        int inv = (n - a) % n;
        if ((a + inv) % n != 0) return false;
    }

    // Verify associativity explicitly
    for (int a = 0; a < n; a++)
        for (int b = 0; b < n; b++)
            for (int c = 0; c < n; c++)
                if (((a + b) % n + c) % n != (a + (b + c) % n) % n)
                    return false;

    return true;
}

int main() {
    for (int n = 1; n <= 10; n++) {
        cout << "Z_" << n << " is a group: "
             << (verifyGroupAxioms(n) ? "Yes" : "No") << endl;
    }
    return 0;
}
```

```csharp
using System;

class GroupVerification {
    static bool VerifyGroupAxioms(int n) {
        // Verify identity element (0)
        for (int a = 0; a < n; a++) {
            if ((a + 0) % n != a) return false;
        }

        // Verify inverse for each element
        for (int a = 0; a < n; a++) {
            int inv = (n - a) % n;
            if ((a + inv) % n != 0) return false;
        }

        // Verify associativity
        for (int a = 0; a < n; a++)
            for (int b = 0; b < n; b++)
                for (int c = 0; c < n; c++)
                    if (((a + b) % n + c) % n != (a + (b + c) % n) % n)
                        return false;

        return true;
    }

    static void Main() {
        for (int n = 1; n <= 10; n++) {
            Console.WriteLine($"Z_{n} is a group: {VerifyGroupAxioms(n)}");
        }
    }
}
```

```java
public class GroupVerification {
    static boolean verifyGroupAxioms(int n) {
        // Verify identity element (0)
        for (int a = 0; a < n; a++) {
            if ((a + 0) % n != a) return false;
        }

        // Verify inverse for each element
        for (int a = 0; a < n; a++) {
            int inv = (n - a) % n;
            if ((a + inv) % n != 0) return false;
        }

        // Verify associativity
        for (int a = 0; a < n; a++)
            for (int b = 0; b < n; b++)
                for (int c = 0; c < n; c++)
                    if (((a + b) % n + c) % n != (a + (b + c) % n) % n)
                        return false;

        return true;
    }

    public static void main(String[] args) {
        for (int n = 1; n <= 10; n++) {
            System.out.printf("Z_%d is a group: %b%n", n, verifyGroupAxioms(n));
        }
    }
}
```

```python
def verify_group_axioms(n):
    """Verify that (Z_n, +) satisfies group axioms."""
    elements = list(range(n))

    # Closure: (a + b) % n is always in {0, ..., n-1}
    for a in elements:
        for b in elements:
            if (a + b) % n not in elements:
                return False, "Closure fails"

    # Associativity
    for a in elements:
        for b in elements:
            for c in elements:
                if ((a + b) % n + c) % n != (a + (b + c) % n) % n:
                    return False, "Associativity fails"

    # Identity element (0)
    for a in elements:
        if (a + 0) % n != a or (0 + a) % n != a:
            return False, "Identity fails"

    # Inverse for each element
    for a in elements:
        inv = (n - a) % n
        if (a + inv) % n != 0:
            return False, "Inverse fails"

    return True, "All axioms satisfied"

# Test for various n
for n in range(1, 11):
    valid, msg = verify_group_axioms(n)
    print(f"Z_{n} is a group: {valid} ({msg})")
```

```javascript
function verifyGroupAxioms(n) {
  const elements = Array.from({ length: n }, (_, i) => i);

  // Closure
  for (const a of elements) {
    for (const b of elements) {
      if (!elements.includes((a + b) % n)) return false;
    }
  }

  // Associativity
  for (const a of elements) {
    for (const b of elements) {
      for (const c of elements) {
        if (((a + b) % n + c) % n !== (a + (b + c) % n) % n) return false;
      }
    }
  }

  // Identity (0)
  for (const a of elements) {
    if ((a + 0) % n !== a) return false;
  }

  // Inverse
  for (const a of elements) {
    const inv = (n - a) % n;
    if ((a + inv) % n !== 0) return false;
  }

  return true;
}

// Test
for (let n = 1; n <= 10; n++) {
  console.log(`Z_${n} is a group: ${verifyGroupAxioms(n)}`);
}
```

### Finding Element Orders and Generators

```cpp
#include <iostream>
#include <vector>
using namespace std;

int elementOrder(int a, int n) {
    if (a % n == 0) return 1;
    int current = a % n;
    int order = 1;
    while (current != 0) {
        current = (current + a) % n;
        order++;
    }
    return order;
}

vector<int> findGenerators(int n) {
    vector<int> generators;
    for (int a = 0; a < n; a++) {
        if (elementOrder(a, n) == n) {
            generators.push_back(a);
        }
    }
    return generators;
}

int main() {
    int n = 12;
    cout << "Element orders in Z_" << n << ":" << endl;
    for (int a = 0; a < n; a++) {
        cout << "  ord(" << a << ") = " << elementOrder(a, n) << endl;
    }

    cout << "Generators of Z_" << n << ": ";
    for (int g : findGenerators(n)) {
        cout << g << " ";
    }
    cout << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class CyclicGroup {
    static int ElementOrder(int a, int n) {
        if (a % n == 0) return 1;
        int current = a % n;
        int order = 1;
        while (current != 0) {
            current = (current + a) % n;
            order++;
        }
        return order;
    }

    static List<int> FindGenerators(int n) {
        var generators = new List<int>();
        for (int a = 0; a < n; a++) {
            if (ElementOrder(a, n) == n) generators.Add(a);
        }
        return generators;
    }

    static void Main() {
        int n = 12;
        Console.WriteLine($"Element orders in Z_{n}:");
        for (int a = 0; a < n; a++) {
            Console.WriteLine($"  ord({a}) = {ElementOrder(a, n)}");
        }

        Console.Write($"Generators of Z_{n}: ");
        Console.WriteLine(string.Join(", ", FindGenerators(n)));
    }
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class CyclicGroup {
    static int elementOrder(int a, int n) {
        if (a % n == 0) return 1;
        int current = a % n;
        int order = 1;
        while (current != 0) {
            current = (current + a) % n;
            order++;
        }
        return order;
    }

    static List<Integer> findGenerators(int n) {
        List<Integer> generators = new ArrayList<>();
        for (int a = 0; a < n; a++) {
            if (elementOrder(a, n) == n) generators.add(a);
        }
        return generators;
    }

    public static void main(String[] args) {
        int n = 12;
        System.out.println("Element orders in Z_" + n + ":");
        for (int a = 0; a < n; a++) {
            System.out.printf("  ord(%d) = %d%n", a, elementOrder(a, n));
        }
        System.out.println("Generators of Z_" + n + ": " + findGenerators(n));
    }
}
```

```python
def element_order(a, n):
    """Find the order of element a in (Z_n, +)."""
    if a % n == 0:
        return 1
    current = a % n
    order = 1
    while current != 0:
        current = (current + a) % n
        order += 1
    return order

def find_generators(n):
    """Find all generators of cyclic group Z_n."""
    return [a for a in range(n) if element_order(a, n) == n]

def print_cayley_table(n):
    """Print the Cayley table for (Z_n, +)."""
    print(f"\nCayley table for (Z_{n}, +):")
    header = "  + | " + " ".join(f"{i:2}" for i in range(n))
    print(header)
    print("-" * len(header))
    for a in range(n):
        row = " ".join(f"{(a + b) % n:2}" for b in range(n))
        print(f" {a:2} | {row}")

n = 12
print(f"Element orders in Z_{n}:")
for a in range(n):
    print(f"  ord({a}) = {element_order(a, n)}")

print(f"\nGenerators of Z_{n}: {find_generators(n)}")
print_cayley_table(6)
```

```javascript
function elementOrder(a, n) {
  if (a % n === 0) return 1;
  let current = a % n;
  let order = 1;
  while (current !== 0) {
    current = (current + a) % n;
    order++;
  }
  return order;
}

function findGenerators(n) {
  const generators = [];
  for (let a = 0; a < n; a++) {
    if (elementOrder(a, n) === n) generators.push(a);
  }
  return generators;
}

function printCayleyTable(n) {
  console.log(`\nCayley table for (Z_${n}, +):`);
  let header = "  + |";
  for (let i = 0; i < n; i++) header += ` ${i}`;
  console.log(header);
  console.log("-".repeat(header.length));
  for (let a = 0; a < n; a++) {
    let row = `  ${a} |`;
    for (let b = 0; b < n; b++) row += ` ${(a + b) % n}`;
    console.log(row);
  }
}

const n = 12;
console.log(`Element orders in Z_${n}:`);
for (let a = 0; a < n; a++) {
  console.log(`  ord(${a}) = ${elementOrder(a, n)}`);
}
console.log(`Generators of Z_${n}:`, findGenerators(n));
printCayleyTable(6);
```

---

## Key Takeaways

1. **A group** $(G, *)$ satisfies four axioms: closure, associativity, identity, and inverse.

2. **Common groups** include $(\mathbb{Z}, +)$, $(\mathbb{Z}_n, +)$, $(\mathbb{Z}_n^*, \times)$, permutation groups $S_n$, and dihedral groups $D_n$.

3. **Abelian groups** satisfy commutativity ($a * b = b * a$); not all groups are abelian.

4. **Order of a group** $|G|$ is the number of elements; **order of an element** is the smallest power giving the identity.

5. **Cayley tables** visualize the group operation and must form a Latin square.

6. **Cyclic groups** are generated by a single element; $\mathbb{Z}_n$ is the prototypical finite cyclic group with $\phi(n)$ generators.

7. Groups appear throughout mathematics and computer science — in cryptography (modular arithmetic groups), coding theory, physics (symmetry), and algorithm design.
