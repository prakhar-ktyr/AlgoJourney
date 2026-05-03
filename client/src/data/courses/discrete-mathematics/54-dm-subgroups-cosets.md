---
title: Subgroups & Cosets
---

# Subgroups & Cosets

Now that we understand groups, we explore their internal structure. Subgroups are "groups within groups," and cosets partition a group into equal-sized pieces. These concepts lead to Lagrange's theorem — one of the most elegant results in group theory.

---

## Subgroup Definition

A **subgroup** $H$ of a group $(G, *)$ is a subset $H \subseteq G$ that is itself a group under the same operation $*$.

We write $H \leq G$ to denote "$H$ is a subgroup of $G$."

### Formal Definition

$H \leq G$ if and only if:
1. $H \subseteq G$ (subset)
2. $H \neq \emptyset$ (nonempty)
3. $(H, *)$ satisfies all four group axioms

Note: Associativity is inherited automatically from $G$, so we only need to verify closure, identity, and inverses within $H$.

---

## Subgroup Test (Two-Step Test)

Instead of checking all four axioms, we can use the efficient **subgroup test**:

**Theorem**: A nonempty subset $H$ of group $G$ is a subgroup if and only if for all $a, b \in H$:

$$a * b^{-1} \in H$$

This single condition guarantees:
- **Identity**: Take $a = b$, so $a * a^{-1} = e \in H$ ✓
- **Inverses**: Take $a = e$, so $e * b^{-1} = b^{-1} \in H$ ✓
- **Closure**: Since $b^{-1} \in H$, take $a$ and $(b^{-1})^{-1} = b$: $a * b \in H$ ✓

### Alternative: Two-Step Test

A nonempty subset $H \subseteq G$ is a subgroup if:
1. **Closed under operation**: For all $a, b \in H$, $a * b \in H$
2. **Closed under inverses**: For all $a \in H$, $a^{-1} \in H$

### Finite Subgroup Test

For **finite** subsets, closure alone suffices:

If $H$ is a finite nonempty subset of $G$ and $H$ is closed under $*$, then $H \leq G$.

---

## Trivial Subgroups

Every group $G$ has at least two subgroups:

1. **Trivial subgroup**: $\{e\} \leq G$
2. **Improper subgroup**: $G \leq G$

Any subgroup other than these is called a **proper nontrivial subgroup**.

---

## Examples of Subgroups

### Subgroups of $(\mathbb{Z}, +)$

The subgroups of $\mathbb{Z}$ are exactly:

$$n\mathbb{Z} = \{\ldots, -2n, -n, 0, n, 2n, \ldots\}$$

for each $n \geq 0$. That is, every subgroup consists of all multiples of some fixed integer.

- $0\mathbb{Z} = \{0\}$ (trivial)
- $1\mathbb{Z} = \mathbb{Z}$ (improper)
- $2\mathbb{Z} = \{\ldots, -4, -2, 0, 2, 4, \ldots\}$ (even integers)
- $3\mathbb{Z} = \{\ldots, -3, 0, 3, 6, \ldots\}$

### Subgroups of $(\mathbb{Z}_{12}, +)$

The subgroups of $\mathbb{Z}_{12}$ correspond to divisors of 12:

| Divisor $d$ | Subgroup $\langle d \rangle$ | Order |
|-------------|------------------------------|-------|
| 1 | $\{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11\}$ | 12 |
| 2 | $\{0, 2, 4, 6, 8, 10\}$ | 6 |
| 3 | $\{0, 3, 6, 9\}$ | 4 |
| 4 | $\{0, 4, 8\}$ | 3 |
| 6 | $\{0, 6\}$ | 2 |
| 12 | $\{0\}$ | 1 |

**Key observation**: There is exactly one subgroup of order $d$ for each divisor $d$ of 12 (since $\mathbb{Z}_{12}$ is cyclic).

### Subgroups of $S_3$

The symmetric group $S_3$ has the following subgroups:
- $\{e\}$ — order 1
- $\{e, (12)\}$, $\{e, (13)\}$, $\{e, (23)\}$ — order 2
- $\{e, (123), (132)\}$ — order 3 (the alternating group $A_3$)
- $S_3$ itself — order 6

---

## Cosets

### Left Cosets

Let $H \leq G$ and $a \in G$. The **left coset** of $H$ containing $a$ is:

$$aH = \{a * h : h \in H\}$$

### Right Cosets

The **right coset** of $H$ containing $a$ is:

$$Ha = \{h * a : h \in H\}$$

### Example: Cosets in $\mathbb{Z}_6$

Let $G = \mathbb{Z}_6$ and $H = \{0, 3\}$ (subgroup of order 2).

Left cosets (using additive notation $a + H$):
- $0 + H = \{0, 3\}$
- $1 + H = \{1, 4\}$
- $2 + H = \{2, 5\}$
- $3 + H = \{3, 0\} = \{0, 3\}$ (same as $0 + H$)
- $4 + H = \{4, 1\} = \{1, 4\}$ (same as $1 + H$)
- $5 + H = \{5, 2\} = \{2, 5\}$ (same as $2 + H$)

There are exactly 3 distinct cosets, partitioning $\mathbb{Z}_6$:

$$\mathbb{Z}_6 = \{0, 3\} \cup \{1, 4\} \cup \{2, 5\}$$

### Properties of Cosets

For any subgroup $H \leq G$:

1. **$a \in aH$** (since $e \in H$, so $a = ae \in aH$)
2. **$aH = bH$ if and only if $a^{-1}b \in H$**
3. **All cosets have the same size**: $|aH| = |H|$ for every $a \in G$
4. **Cosets partition $G$**: Every element belongs to exactly one coset
5. **Two cosets are either identical or disjoint**: $aH \cap bH \neq \emptyset \implies aH = bH$

---

## Lagrange's Theorem

**Theorem** (Lagrange): If $G$ is a finite group and $H \leq G$, then:

$$|H| \text{ divides } |G|$$

Moreover:

$$|G| = |H| \cdot [G : H]$$

where $[G : H]$ is the **index** of $H$ in $G$ — the number of distinct cosets of $H$ in $G$.

### Proof Sketch

1. The distinct left cosets of $H$ partition $G$
2. Each coset has exactly $|H|$ elements
3. If there are $k$ distinct cosets: $|G| = k \cdot |H|$
4. Therefore $|H|$ divides $|G|$, and $k = [G:H] = |G|/|H|$

### Example

In $S_3$ ($|S_3| = 6$):
- Possible subgroup orders: divisors of 6 = {1, 2, 3, 6}
- We found subgroups of orders 1, 2, 3, and 6 ✓
- There is **no** subgroup of order 4 or 5 (not divisors of 6)

---

## Consequences of Lagrange's Theorem

### 1. Order of Element Divides Order of Group

If $G$ is a finite group and $a \in G$, then:

$$\text{ord}(a) \text{ divides } |G|$$

**Proof**: The cyclic subgroup $\langle a \rangle = \{e, a, a^2, \ldots, a^{k-1}\}$ has order $k = \text{ord}(a)$. By Lagrange, $k$ divides $|G|$.

**Corollary**: For any $a \in G$:

$$a^{|G|} = e$$

### 2. Groups of Prime Order

If $|G| = p$ (prime), then $G$ has no proper nontrivial subgroups, and $G$ is cyclic.

**Proof**: By Lagrange, any subgroup has order dividing $p$. Since $p$ is prime, the only divisors are 1 and $p$, giving only the trivial and improper subgroups. Any non-identity element must have order $p$, hence generates all of $G$.

### 3. Fermat's Little Theorem

For prime $p$ and $a$ not divisible by $p$:

$$a^{p-1} \equiv 1 \pmod{p}$$

**Proof**: $a \in \mathbb{Z}_p^*$, which has order $p - 1$. By the corollary above, $a^{p-1} = e = 1$.

### 4. Euler's Theorem

For $\gcd(a, n) = 1$:

$$a^{\phi(n)} \equiv 1 \pmod{n}$$

**Proof**: $a \in \mathbb{Z}_n^*$, which has order $\phi(n)$.

---

## Normal Subgroups (Brief)

A subgroup $N \leq G$ is **normal** (written $N \trianglelefteq G$) if for all $g \in G$:

$$gN = Ng$$

Equivalently, $gNg^{-1} = N$ for all $g \in G$ (invariant under conjugation).

### Examples

- Every subgroup of an abelian group is normal (since $gH = Hg$ always)
- $A_n \trianglelefteq S_n$ (the alternating group is normal in the symmetric group)
- In $S_3$: $\{e, (123), (132)\} \trianglelefteq S_3$, but $\{e, (12)\}$ is **not** normal

### Why Normal Subgroups Matter

Normal subgroups are exactly those for which the set of cosets forms a group (the quotient group). This is the key to building new groups from old ones.

---

## Quotient Groups (Brief)

If $N \trianglelefteq G$, the set of cosets $G/N = \{gN : g \in G\}$ forms a group under the operation:

$$(aN)(bN) = (ab)N$$

This is the **quotient group** (or factor group) of $G$ by $N$.

### Example

$G = \mathbb{Z}_6$, $N = \{0, 3\}$:

$$\mathbb{Z}_6 / N = \{\{0,3\}, \{1,4\}, \{2,5\}\}$$

This quotient group has order $6/2 = 3$ and is isomorphic to $\mathbb{Z}_3$:

| $+$ | $\{0,3\}$ | $\{1,4\}$ | $\{2,5\}$ |
|-----|-----------|-----------|-----------|
| $\{0,3\}$ | $\{0,3\}$ | $\{1,4\}$ | $\{2,5\}$ |
| $\{1,4\}$ | $\{1,4\}$ | $\{2,5\}$ | $\{0,3\}$ |
| $\{2,5\}$ | $\{2,5\}$ | $\{0,3\}$ | $\{1,4\}$ |

### The First Isomorphism Theorem

If $\phi: G \to G'$ is a group homomorphism, then:

$$G / \ker(\phi) \cong \text{im}(\phi)$$

This connects homomorphisms, normal subgroups, and quotient groups in one elegant statement.

---

## Code: Find All Subgroups of $\mathbb{Z}_n$

```cpp
#include <iostream>
#include <vector>
#include <set>
using namespace std;

vector<set<int>> findSubgroups(int n) {
    vector<set<int>> subgroups;

    // Generate cyclic subgroup for each element
    for (int a = 0; a < n; a++) {
        set<int> subgroup;
        int current = 0;
        do {
            subgroup.insert(current);
            current = (current + a) % n;
        } while (current != 0);

        // Check if this subgroup is already found
        bool found = false;
        for (const auto& s : subgroups) {
            if (s == subgroup) { found = true; break; }
        }
        if (!found) subgroups.push_back(subgroup);
    }

    return subgroups;
}

void printCosets(int n, const set<int>& H) {
    set<set<int>> cosets;
    for (int a = 0; a < n; a++) {
        set<int> coset;
        for (int h : H) {
            coset.insert((a + h) % n);
        }
        cosets.insert(coset);
    }

    cout << "  Cosets:" << endl;
    for (const auto& coset : cosets) {
        cout << "    {";
        for (auto it = coset.begin(); it != coset.end(); ++it) {
            if (it != coset.begin()) cout << ", ";
            cout << *it;
        }
        cout << "}" << endl;
    }
    cout << "  Index [G:H] = " << cosets.size() << endl;
}

int main() {
    int n = 12;
    cout << "Subgroups of Z_" << n << ":" << endl;

    auto subgroups = findSubgroups(n);
    for (const auto& H : subgroups) {
        cout << "  {";
        for (auto it = H.begin(); it != H.end(); ++it) {
            if (it != H.begin()) cout << ", ";
            cout << *it;
        }
        cout << "} (order " << H.size() << ")" << endl;
        printCosets(n, H);
        cout << endl;
    }

    // Verify Lagrange's theorem
    cout << "Lagrange check: all subgroup orders divide " << n << endl;
    for (const auto& H : subgroups) {
        cout << "  |H| = " << H.size() << ", "
             << n << " / " << H.size() << " = " << n / H.size()
             << (n % H.size() == 0 ? " ✓" : " ✗") << endl;
    }

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class SubgroupFinder {
    static List<HashSet<int>> FindSubgroups(int n) {
        var subgroups = new List<HashSet<int>>();

        for (int a = 0; a < n; a++) {
            var subgroup = new HashSet<int>();
            int current = 0;
            do {
                subgroup.Add(current);
                current = (current + a) % n;
            } while (current != 0);

            bool found = subgroups.Any(s => s.SetEquals(subgroup));
            if (!found) subgroups.Add(subgroup);
        }

        return subgroups;
    }

    static void PrintCosets(int n, HashSet<int> H) {
        var cosets = new HashSet<string>();
        for (int a = 0; a < n; a++) {
            var coset = new SortedSet<int>(H.Select(h => (a + h) % n));
            cosets.Add(string.Join(",", coset));
        }

        Console.WriteLine("  Cosets:");
        foreach (var coset in cosets) {
            Console.WriteLine($"    {{{coset}}}");
        }
        Console.WriteLine($"  Index [G:H] = {cosets.Count}");
    }

    static void Main() {
        int n = 12;
        Console.WriteLine($"Subgroups of Z_{n}:");

        var subgroups = FindSubgroups(n);
        foreach (var H in subgroups) {
            var sorted = new SortedSet<int>(H);
            Console.WriteLine($"  {{{string.Join(", ", sorted)}}} (order {H.Count})");
            PrintCosets(n, H);
            Console.WriteLine();
        }

        Console.WriteLine($"Lagrange check: all orders divide {n}");
        foreach (var H in subgroups) {
            bool divides = n % H.Count == 0;
            Console.WriteLine($"  |H| = {H.Count}, {n}/{H.Count} = {n / H.Count} {(divides ? "✓" : "✗")}");
        }
    }
}
```

```java
import java.util.*;

public class SubgroupFinder {
    static List<Set<Integer>> findSubgroups(int n) {
        List<Set<Integer>> subgroups = new ArrayList<>();

        for (int a = 0; a < n; a++) {
            Set<Integer> subgroup = new TreeSet<>();
            int current = 0;
            do {
                subgroup.add(current);
                current = (current + a) % n;
            } while (current != 0);

            boolean found = subgroups.stream().anyMatch(s -> s.equals(subgroup));
            if (!found) subgroups.add(subgroup);
        }

        return subgroups;
    }

    static void printCosets(int n, Set<Integer> H) {
        Set<Set<Integer>> cosets = new HashSet<>();
        for (int a = 0; a < n; a++) {
            Set<Integer> coset = new TreeSet<>();
            for (int h : H) {
                coset.add((a + h) % n);
            }
            cosets.add(coset);
        }

        System.out.println("  Cosets:");
        for (Set<Integer> coset : cosets) {
            System.out.println("    " + coset);
        }
        System.out.println("  Index [G:H] = " + cosets.size());
    }

    public static void main(String[] args) {
        int n = 12;
        System.out.println("Subgroups of Z_" + n + ":");

        List<Set<Integer>> subgroups = findSubgroups(n);
        for (Set<Integer> H : subgroups) {
            System.out.println("  " + H + " (order " + H.size() + ")");
            printCosets(n, H);
            System.out.println();
        }

        System.out.println("Lagrange check: all orders divide " + n);
        for (Set<Integer> H : subgroups) {
            boolean divides = n % H.size() == 0;
            System.out.printf("  |H| = %d, %d/%d = %d %s%n",
                H.size(), n, H.size(), n / H.size(), divides ? "✓" : "✗");
        }
    }
}
```

```python
def find_subgroups(n):
    """Find all subgroups of (Z_n, +)."""
    subgroups = []

    for a in range(n):
        # Generate cyclic subgroup <a>
        subgroup = set()
        current = 0
        while True:
            subgroup.add(current)
            current = (current + a) % n
            if current == 0:
                break

        if subgroup not in subgroups:
            subgroups.append(subgroup)

    return subgroups

def find_cosets(n, H):
    """Find all left cosets of H in Z_n."""
    cosets = []
    covered = set()

    for a in range(n):
        if a in covered:
            continue
        coset = frozenset((a + h) % n for h in H)
        cosets.append(coset)
        covered.update(coset)

    return cosets

def verify_lagrange(n):
    """Verify Lagrange's theorem for Z_n."""
    subgroups = find_subgroups(n)

    print(f"Subgroups of Z_{n}:")
    for H in subgroups:
        H_sorted = sorted(H)
        print(f"  {H_sorted} (order {len(H)})")

        cosets = find_cosets(n, H)
        print(f"  Cosets:")
        for coset in cosets:
            print(f"    {sorted(coset)}")
        print(f"  Index [G:H] = {len(cosets)}")
        print(f"  |G| = |H| * [G:H] → {n} = {len(H)} * {len(cosets)} ✓")
        print()

    # Lagrange check
    print(f"Lagrange's theorem: all |H| divide |G| = {n}")
    for H in subgroups:
        divides = n % len(H) == 0
        print(f"  |H| = {len(H)}: {n} / {len(H)} = {n // len(H)} {'✓' if divides else '✗'}")

verify_lagrange(12)
```

```javascript
function findSubgroups(n) {
  const subgroups = [];

  for (let a = 0; a < n; a++) {
    const subgroup = new Set();
    let current = 0;
    do {
      subgroup.add(current);
      current = (current + a) % n;
    } while (current !== 0);

    // Check if already found
    const sorted = [...subgroup].sort((x, y) => x - y).join(",");
    const alreadyExists = subgroups.some(
      (s) => [...s].sort((x, y) => x - y).join(",") === sorted
    );
    if (!alreadyExists) subgroups.push(subgroup);
  }

  return subgroups;
}

function findCosets(n, H) {
  const cosets = [];
  const covered = new Set();

  for (let a = 0; a < n; a++) {
    if (covered.has(a)) continue;
    const coset = new Set([...H].map((h) => (a + h) % n));
    cosets.push(coset);
    for (const elem of coset) covered.add(elem);
  }

  return cosets;
}

function verifyLagrange(n) {
  const subgroups = findSubgroups(n);

  console.log(`Subgroups of Z_${n}:`);
  for (const H of subgroups) {
    const sorted = [...H].sort((a, b) => a - b);
    console.log(`  {${sorted.join(", ")}} (order ${H.size})`);

    const cosets = findCosets(n, H);
    console.log(`  Cosets:`);
    for (const coset of cosets) {
      console.log(`    {${[...coset].sort((a, b) => a - b).join(", ")}}`);
    }
    console.log(`  Index [G:H] = ${cosets.length}`);
    console.log(`  |G| = |H| * [G:H] → ${n} = ${H.size} * ${cosets.length}`);
    console.log();
  }

  console.log(`Lagrange check: all |H| divide ${n}`);
  for (const H of subgroups) {
    const divides = n % H.size === 0;
    console.log(`  |H| = ${H.size}: ${n}/${H.size} = ${n / H.size} ${divides ? "✓" : "✗"}`);
  }
}

verifyLagrange(12);
```

---

## Key Takeaways

1. **A subgroup** $H \leq G$ is a subset of $G$ that is itself a group under the same operation.

2. **Subgroup test**: Check that $H$ is nonempty and closed under the operation and inverses (or equivalently, $ab^{-1} \in H$ for all $a, b \in H$).

3. **Cosets** $aH = \{ah : h \in H\}$ partition the group into equal-sized pieces; each coset has exactly $|H|$ elements.

4. **Lagrange's theorem**: $|H|$ divides $|G|$. The number of cosets (index) equals $|G|/|H|$.

5. **Consequences**: The order of any element divides $|G|$; groups of prime order are cyclic; Fermat's little theorem and Euler's theorem follow directly.

6. **Normal subgroups** ($gN = Ng$) allow construction of quotient groups $G/N$, which are central to understanding group structure.

7. For cyclic groups $\mathbb{Z}_n$, subgroups correspond exactly to divisors of $n$, making the subgroup lattice easy to determine.
