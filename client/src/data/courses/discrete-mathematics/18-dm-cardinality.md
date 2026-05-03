---
title: Cardinality & Countability
---

# Cardinality & Countability

How do you compare the "size" of infinite sets? You can't just count to infinity. The concept of **cardinality** gives us a rigorous way to measure and compare set sizes — even infinite ones. This leads to one of the most surprising results in all of mathematics: some infinities are bigger than others.

---

## Cardinality of Finite Sets

For a finite set $A$, the **cardinality** $|A|$ is simply the number of elements in $A$.

$$|\\{a, b, c\\}| = 3$$

$$|\emptyset| = 0$$

$$|\\{1, 2, 3, \ldots, n\\}| = n$$

Two finite sets have the same cardinality if and only if we can pair up their elements perfectly — a **bijection** exists between them.

---

## Comparing Infinite Sets: The Bijection Criterion

**Definition:** Two sets $A$ and $B$ have the **same cardinality**, written $|A| = |B|$, if and only if there exists a bijection $f: A \to B$.

This is the key idea: we don't need to "count" elements. We just need to show a perfect one-to-one pairing exists.

**Example:** The set of even natural numbers $E = \\{0, 2, 4, 6, \ldots\\}$ has the same cardinality as $\mathbb{N} = \\{0, 1, 2, 3, \ldots\\}$.

The bijection is $f: \mathbb{N} \to E$ defined by $f(n) = 2n$:

$$0 \leftrightarrow 0, \quad 1 \leftrightarrow 2, \quad 2 \leftrightarrow 4, \quad 3 \leftrightarrow 6, \quad \ldots$$

This is counterintuitive — the even numbers are a proper subset of $\mathbb{N}$, yet they have the same "size"! This is a hallmark of infinite sets: a proper subset can be the same size as the whole.

---

## Countably Infinite Sets

**Definition:** A set $A$ is **countably infinite** if $|A| = |\mathbb{N}|$, i.e., there exists a bijection between $A$ and the natural numbers.

A set is **countable** if it is either finite or countably infinite.

Intuitively, a set is countable if you can list all its elements in a sequence (possibly infinite): $a_0, a_1, a_2, \ldots$

---

## $\mathbb{Z}$ Is Countable: The Zigzag Argument

The integers $\mathbb{Z} = \\{\ldots, -2, -1, 0, 1, 2, \ldots\\}$ are countable. We construct a bijection $f: \mathbb{N} \to \mathbb{Z}$ by "zigzagging":

$$0, 1, -1, 2, -2, 3, -3, 4, -4, \ldots$$

Formally:

$$f(n) = \begin{cases} n/2 & \text{if } n \text{ is even} \\ -(n+1)/2 & \text{if } n \text{ is odd} \end{cases}$$

| $n$ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|-----|---|---|---|---|---|---|---|---|
| $f(n)$ | 0 | -1 | 1 | -2 | 2 | -3 | 3 | -4 |

Every integer appears exactly once, so this is a bijection.

---

## $\mathbb{Q}$ Is Countable: Cantor's Pairing

The rationals $\mathbb{Q}$ are countable. This is surprising because between any two rationals there are infinitely many others — they are "dense."

**Cantor's approach:** List all positive fractions $\frac{p}{q}$ in a grid and traverse it diagonally:

$$\frac{1}{1}, \frac{2}{1}, \frac{1}{2}, \frac{3}{1}, \frac{2}{2}, \frac{1}{3}, \frac{4}{1}, \frac{3}{2}, \frac{2}{3}, \frac{1}{4}, \ldots$$

Skip duplicates (like $\frac{2}{2} = \frac{1}{1}$), and you get a listing of all positive rationals. Combine with negatives and zero using the zigzag trick, and all of $\mathbb{Q}$ is countable.

**Cantor's pairing function** maps $\mathbb{N} \times \mathbb{N} \to \mathbb{N}$ bijectively:

$$\pi(m, n) = \frac{(m + n)(m + n + 1)}{2} + m$$

This proves $|\mathbb{N} \times \mathbb{N}| = |\mathbb{N}|$, which is key to showing $|\mathbb{Q}| = |\mathbb{N}|$.

---

## $\mathbb{R}$ Is Uncountable: Cantor's Diagonal Argument

**Theorem (Cantor, 1891):** The set of real numbers $\mathbb{R}$ is **uncountable** — there is no bijection between $\mathbb{N}$ and $\mathbb{R}$.

**Proof by contradiction:**

Assume $\mathbb{R}$ is countable. Then we can list all reals in $[0, 1)$ as:

$$r_0 = 0.d_{00}d_{01}d_{02}d_{03}\ldots$$
$$r_1 = 0.d_{10}d_{11}d_{12}d_{13}\ldots$$
$$r_2 = 0.d_{20}d_{21}d_{22}d_{23}\ldots$$
$$\vdots$$

Now construct a new real number $x = 0.x_0 x_1 x_2 \ldots$ where:

$$x_i = \begin{cases} 5 & \text{if } d_{ii} \neq 5 \\ 6 & \text{if } d_{ii} = 5 \end{cases}$$

Then $x$ differs from $r_i$ in the $i$-th decimal digit for every $i$. So $x$ is not in our list — **contradiction**!

Therefore no listing can contain all reals. $\mathbb{R}$ is uncountable. $\blacksquare$

---

## The Hierarchy of Infinities

Not all infinities are equal. Cantor established a hierarchy:

$$|\mathbb{N}| = \aleph_0 \quad \text{(aleph-null, the smallest infinity)}$$

$$|\mathbb{R}| = \mathfrak{c} = 2^{\aleph_0} \quad \text{(the cardinality of the continuum)}$$

We have:

$$\aleph_0 < \mathfrak{c}$$

The **Continuum Hypothesis** asks whether there is a cardinality strictly between $\aleph_0$ and $\mathfrak{c}$. Remarkably, this question is **independent** of the standard axioms of set theory (ZFC) — it can neither be proved nor disproved!

---

## Power Set Theorem: $|\mathcal{P}(A)| > |A|$

**Cantor's Theorem:** For any set $A$ (finite or infinite), the power set $\mathcal{P}(A)$ has strictly greater cardinality:

$$|\mathcal{P}(A)| > |A|$$

For finite sets: if $|A| = n$, then $|\mathcal{P}(A)| = 2^n > n$.

For infinite sets: there is no surjection from $A$ onto $\mathcal{P}(A)$.

**Proof sketch (by contradiction):** Suppose $f: A \to \mathcal{P}(A)$ is surjective. Define:

$$D = \\{x \in A : x \notin f(x)\\}$$

Since $f$ is surjective, $D = f(d)$ for some $d \in A$. But then:
- If $d \in D$, then $d \notin f(d) = D$ — contradiction.
- If $d \notin D$, then $d \in f(d) = D$ — contradiction.

So no surjection exists, hence $|\mathcal{P}(A)| > |A|$. $\blacksquare$

This gives an infinite tower of infinities:

$$|\mathbb{N}| < |\mathcal{P}(\mathbb{N})| < |\mathcal{P}(\mathcal{P}(\mathbb{N}))| < \cdots$$

---

## Comparing Cardinalities

| Set | Cardinality | Countable? |
|-----|-------------|------------|
| $\\{1, 2, 3\\}$ | $3$ | Yes (finite) |
| $\mathbb{N}$ | $\aleph_0$ | Yes |
| $\mathbb{Z}$ | $\aleph_0$ | Yes |
| $\mathbb{Q}$ | $\aleph_0$ | Yes |
| $\mathbb{N} \times \mathbb{N}$ | $\aleph_0$ | Yes |
| $\mathbb{R}$ | $\mathfrak{c} = 2^{\aleph_0}$ | **No** |
| $\mathcal{P}(\mathbb{N})$ | $\mathfrak{c}$ | **No** |
| Set of all functions $\mathbb{N} \to \\{0,1\\}$ | $\mathfrak{c}$ | **No** |

---

## Applications: Limits of Computation

Cardinality has profound consequences in computer science:

1. **The set of all programs is countable** — every program is a finite string over a finite alphabet, so the set of all programs has cardinality $\aleph_0$.

2. **The set of all functions $\mathbb{N} \to \mathbb{N}$ is uncountable** — it has cardinality $\mathfrak{c}$.

3. **Therefore: most functions are not computable.** There are uncountably many functions but only countably many programs. By a cardinality argument alone, "almost all" functions have no program that computes them.

This is the foundation of **uncomputability** — the Halting Problem, Busy Beaver function, and Kolmogorov complexity all connect back to this cardinality gap.

---

## Code: Pairing/Unpairing Functions for $\mathbb{N} \to \mathbb{Z}$ Bijection

Let's implement the bijection between natural numbers and integers, plus Cantor's pairing function.

```cpp
#include <iostream>
#include <cmath>
using namespace std;

// Bijection N -> Z (zigzag encoding)
int natToInt(int n) {
    if (n % 2 == 0) return n / 2;
    else return -(n + 1) / 2;
}

// Inverse: Z -> N
int intToNat(int z) {
    if (z >= 0) return 2 * z;
    else return -2 * z - 1;
}

// Cantor pairing function: N x N -> N
int cantorPair(int m, int n) {
    return (m + n) * (m + n + 1) / 2 + m;
}

// Cantor unpairing: N -> (N, N)
pair<int,int> cantorUnpair(int z) {
    int w = (int)floor((sqrt(8.0 * z + 1) - 1) / 2.0);
    int t = w * (w + 1) / 2;
    int m = z - t;
    int n = w - m;
    return {m, n};
}

int main() {
    cout << "N -> Z bijection (first 10):" << endl;
    for (int n = 0; n < 10; n++) {
        int z = natToInt(n);
        cout << "  " << n << " <-> " << z;
        cout << "  (inverse check: " << intToNat(z) << ")" << endl;
    }

    cout << "\nCantor pairing (first few pairs):" << endl;
    for (int m = 0; m < 4; m++) {
        for (int n = 0; n < 4; n++) {
            int paired = cantorPair(m, n);
            auto [um, un] = cantorUnpair(paired);
            cout << "  (" << m << "," << n << ") -> " << paired;
            cout << " -> (" << um << "," << un << ")" << endl;
        }
    }
    return 0;
}
```

```csharp
using System;

class Cardinality
{
    // Bijection N -> Z (zigzag)
    static int NatToInt(int n) => n % 2 == 0 ? n / 2 : -(n + 1) / 2;

    // Inverse: Z -> N
    static int IntToNat(int z) => z >= 0 ? 2 * z : -2 * z - 1;

    // Cantor pairing: N x N -> N
    static int CantorPair(int m, int n) => (m + n) * (m + n + 1) / 2 + m;

    // Cantor unpairing: N -> (int, int)
    static (int, int) CantorUnpair(int z)
    {
        int w = (int)Math.Floor((Math.Sqrt(8.0 * z + 1) - 1) / 2.0);
        int t = w * (w + 1) / 2;
        int m = z - t;
        int n = w - m;
        return (m, n);
    }

    static void Main()
    {
        Console.WriteLine("N -> Z bijection (first 10):");
        for (int n = 0; n < 10; n++)
        {
            int z = NatToInt(n);
            Console.WriteLine($"  {n} <-> {z}  (inverse: {IntToNat(z)})");
        }

        Console.WriteLine("\nCantor pairing (first few pairs):");
        for (int m = 0; m < 4; m++)
        {
            for (int n = 0; n < 4; n++)
            {
                int paired = CantorPair(m, n);
                var (um, un) = CantorUnpair(paired);
                Console.WriteLine($"  ({m},{n}) -> {paired} -> ({um},{un})");
            }
        }
    }
}
```

```java
public class Cardinality {

    // Bijection N -> Z (zigzag encoding)
    static int natToInt(int n) {
        return n % 2 == 0 ? n / 2 : -(n + 1) / 2;
    }

    // Inverse: Z -> N
    static int intToNat(int z) {
        return z >= 0 ? 2 * z : -2 * z - 1;
    }

    // Cantor pairing function: N x N -> N
    static int cantorPair(int m, int n) {
        return (m + n) * (m + n + 1) / 2 + m;
    }

    // Cantor unpairing: N -> [m, n]
    static int[] cantorUnpair(int z) {
        int w = (int) Math.floor((Math.sqrt(8.0 * z + 1) - 1) / 2.0);
        int t = w * (w + 1) / 2;
        int m = z - t;
        int n = w - m;
        return new int[]{m, n};
    }

    public static void main(String[] args) {
        System.out.println("N -> Z bijection (first 10):");
        for (int n = 0; n < 10; n++) {
            int z = natToInt(n);
            System.out.printf("  %d <-> %d  (inverse: %d)%n", n, z, intToNat(z));
        }

        System.out.println("\nCantor pairing (first few pairs):");
        for (int m = 0; m < 4; m++) {
            for (int n = 0; n < 4; n++) {
                int paired = cantorPair(m, n);
                int[] unpaired = cantorUnpair(paired);
                System.out.printf("  (%d,%d) -> %d -> (%d,%d)%n",
                    m, n, paired, unpaired[0], unpaired[1]);
            }
        }
    }
}
```

```python
import math


def nat_to_int(n: int) -> int:
    """Bijection N -> Z using zigzag encoding."""
    if n % 2 == 0:
        return n // 2
    else:
        return -(n + 1) // 2


def int_to_nat(z: int) -> int:
    """Inverse: Z -> N."""
    if z >= 0:
        return 2 * z
    else:
        return -2 * z - 1


def cantor_pair(m: int, n: int) -> int:
    """Cantor pairing function: N x N -> N."""
    return (m + n) * (m + n + 1) // 2 + m


def cantor_unpair(z: int) -> tuple[int, int]:
    """Cantor unpairing: N -> (N, N)."""
    w = int(math.floor((math.sqrt(8 * z + 1) - 1) / 2))
    t = w * (w + 1) // 2
    m = z - t
    n = w - m
    return (m, n)


# Demonstrate N <-> Z bijection
print("N -> Z bijection (first 10):")
for n in range(10):
    z = nat_to_int(n)
    print(f"  {n} <-> {z}  (inverse check: {int_to_nat(z)})")

# Demonstrate Cantor pairing
print("\nCantor pairing (first few pairs):")
for m in range(4):
    for n in range(4):
        paired = cantor_pair(m, n)
        um, un = cantor_unpair(paired)
        print(f"  ({m},{n}) -> {paired} -> ({um},{un})")

# Verify bijectivity: first 20 naturals should unpair uniquely
print("\nFirst 20 naturals unpaired:")
for z in range(20):
    print(f"  {z} -> {cantor_unpair(z)}")
```

```javascript
// Bijection N -> Z (zigzag encoding)
function natToInt(n) {
  return n % 2 === 0 ? n / 2 : -(n + 1) / 2;
}

// Inverse: Z -> N
function intToNat(z) {
  return z >= 0 ? 2 * z : -2 * z - 1;
}

// Cantor pairing function: N x N -> N
function cantorPair(m, n) {
  return ((m + n) * (m + n + 1)) / 2 + m;
}

// Cantor unpairing: N -> [m, n]
function cantorUnpair(z) {
  const w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
  const t = (w * (w + 1)) / 2;
  const m = z - t;
  const n = w - m;
  return [m, n];
}

// Demonstrate N <-> Z bijection
console.log("N -> Z bijection (first 10):");
for (let n = 0; n < 10; n++) {
  const z = natToInt(n);
  console.log(`  ${n} <-> ${z}  (inverse check: ${intToNat(z)})`);
}

// Demonstrate Cantor pairing
console.log("\nCantor pairing (first few pairs):");
for (let m = 0; m < 4; m++) {
  for (let n = 0; n < 4; n++) {
    const paired = cantorPair(m, n);
    const [um, un] = cantorUnpair(paired);
    console.log(`  (${m},${n}) -> ${paired} -> (${um},${un})`);
  }
}

// Show that pairing is bijective for first 20 naturals
console.log("\nFirst 20 naturals unpaired:");
for (let z = 0; z < 20; z++) {
  console.log(`  ${z} -> (${cantorUnpair(z)})`);
}
```

---

## Intuition: Why Does This Matter?

The pairing functions above are not just mathematical curiosities — they have real uses:

1. **Database indexing:** Cantor pairing encodes two keys into one unique integer (used in spatial indexing).
2. **Gödel numbering:** Encodes logical formulas as natural numbers — the foundation of Gödel's incompleteness theorems.
3. **Interleaving streams:** The zigzag bijection lets you fairly enumerate elements from two infinite streams.
4. **Compression & hashing:** Pairing functions create unique encodings without collisions.

---

## Summary of Proof Techniques

| Goal | Technique |
|------|-----------|
| Show $|A| = |B|$ | Construct a bijection $f: A \to B$ |
| Show $A$ is countable | List elements as $a_0, a_1, a_2, \ldots$ |
| Show $A$ is uncountable | Cantor's diagonal argument (assume a listing, derive contradiction) |
| Show $|A| \leq |B|$ | Construct an injection $f: A \to B$ |
| Show $|A| < |B|$ | Show injection exists but no bijection (e.g., power set theorem) |

---

## Key Takeaways

1. **Cardinality** measures set size; two sets have the same cardinality iff a bijection exists between them.
2. A set is **countably infinite** if it has the same cardinality as $\mathbb{N}$ (you can list all elements).
3. $\mathbb{Z}$ and $\mathbb{Q}$ are both countable despite appearing "larger" — the zigzag and diagonal traversal techniques prove this.
4. $\mathbb{R}$ is **uncountable** — Cantor's diagonal argument shows no listing can capture all reals.
5. The hierarchy $\aleph_0 < \mathfrak{c} < |\mathcal{P}(\mathbb{R})| < \cdots$ shows infinitely many levels of infinity.
6. **Cantor's Theorem** ($|\mathcal{P}(A)| > |A|$) guarantees there is no largest infinity.
7. Since programs are countable but functions are uncountable, **most functions are not computable** — a foundational result in theoretical CS.
8. **Pairing functions** provide concrete bijections $\mathbb{N} \times \mathbb{N} \to \mathbb{N}$ with applications in encoding, hashing, and logic.
