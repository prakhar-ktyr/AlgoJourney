---
title: Functions — Injective, Surjective, Bijective
---

# Functions — Injective, Surjective, Bijective

Functions are the most important type of relation in mathematics and computer science. Every algorithm is, at its core, a function — it takes an input and produces an output. In this lesson we formalize what a function is and classify functions by their "mapping behaviour."

---

## 1. Function as a Special Relation

A **function** $f$ from set $A$ to set $B$ (written $f: A \to B$) is a relation where:

$$\forall a \in A,\ \exists!\, b \in B \text{ such that } (a, b) \in f$$

In plain English: **every element in $A$ maps to exactly one element in $B$.**

Two conditions must hold:

| Condition | Meaning |
|-----------|---------|
| **Total** | Every element of $A$ has an image (no input is "undefined") |
| **Well-defined** | No input maps to two different outputs |

If either condition fails, the relation is **not** a function.

### Example

Let $A = \{1, 2, 3\}$, $B = \{a, b, c\}$.

- $f = \{(1,a), (2,b), (3,c)\}$ — valid function.
- $g = \{(1,a), (2,b)\}$ — **not** a function ($3$ has no image).
- $h = \{(1,a), (1,b), (2,c), (3,a)\}$ — **not** a function ($1$ maps to two outputs).

---

## 2. Domain, Codomain, and Range

| Term | Symbol | Meaning |
|------|--------|---------|
| **Domain** | $\text{dom}(f) = A$ | The set of all inputs |
| **Codomain** | $B$ | The set of *allowed* outputs |
| **Range (Image)** | $\text{im}(f) \subseteq B$ | The set of outputs that are *actually hit* |

$$\text{im}(f) = \{f(a) \mid a \in A\}$$

> The range is always a subset of the codomain: $\text{im}(f) \subseteq B$. They are equal only if $f$ is surjective.

### Example

Let $f: \mathbb{R} \to \mathbb{R}$ defined by $f(x) = x^2$.

- Domain: $\mathbb{R}$
- Codomain: $\mathbb{R}$
- Range: $[0, \infty)$ (only non-negative reals are produced)

---

## 3. Injective (One-to-One) Functions

A function $f: A \to B$ is **injective** if distinct inputs always produce distinct outputs:

$$f(a_1) = f(a_2) \implies a_1 = a_2$$

Equivalently: $a_1 \neq a_2 \implies f(a_1) \neq f(a_2)$.

### Visual Test

In an arrow diagram, **no element in $B$ has two arrows pointing to it**.

### Examples

| Function | Injective? | Reason |
|----------|-----------|--------|
| $f(x) = 2x + 1$ on $\mathbb{R}$ | Yes | Different inputs give different outputs |
| $f(x) = x^2$ on $\mathbb{R}$ | No | $f(2) = f(-2) = 4$ |
| $f(x) = x^2$ on $\mathbb{R}^+$ | Yes | Restricted to positive reals, no collisions |

### How to Prove Injectivity

Assume $f(a) = f(b)$ and show that $a = b$.

**Example:** Prove $f(x) = 3x - 7$ is injective.

$$f(a) = f(b) \implies 3a - 7 = 3b - 7 \implies 3a = 3b \implies a = b \quad \checkmark$$

---

## 4. Surjective (Onto) Functions

A function $f: A \to B$ is **surjective** if every element in the codomain is hit by at least one input:

$$\forall b \in B,\ \exists\, a \in A \text{ such that } f(a) = b$$

Equivalently: $\text{im}(f) = B$.

### Visual Test

In an arrow diagram, **every element in $B$ has at least one arrow pointing to it**.

### Examples

| Function | Surjective? | Reason |
|----------|------------|--------|
| $f: \mathbb{R} \to \mathbb{R},\ f(x) = 2x + 1$ | Yes | For any $y$, choose $x = (y-1)/2$ |
| $f: \mathbb{R} \to \mathbb{R},\ f(x) = x^2$ | No | Negative numbers are never output |
| $f: \mathbb{R} \to [0,\infty),\ f(x) = x^2$ | Yes | Codomain restricted to achievable range |

### How to Prove Surjectivity

Let $b \in B$ be arbitrary. Find an $a \in A$ such that $f(a) = b$.

**Example:** Prove $f(x) = 2x + 1$ (from $\mathbb{R}$ to $\mathbb{R}$) is surjective.

Let $y \in \mathbb{R}$. Choose $x = \frac{y - 1}{2}$. Then:

$$f(x) = 2 \cdot \frac{y-1}{2} + 1 = y - 1 + 1 = y \quad \checkmark$$

---

## 5. Bijective (One-to-One Correspondence)

A function is **bijective** if it is both injective and surjective:

$$\text{Bijective} = \text{Injective} + \text{Surjective}$$

A bijection establishes a **perfect pairing** between elements of $A$ and $B$. Every element in $A$ maps to a unique element in $B$, and every element in $B$ is mapped to.

### Key Consequence

If $f: A \to B$ is bijective and $A, B$ are finite, then $|A| = |B|$.

This is how we formally prove two sets have the same cardinality — even for infinite sets!

### Examples

| Function | Bijective? |
|----------|-----------|
| $f: \mathbb{R} \to \mathbb{R},\ f(x) = 2x + 1$ | Yes (injective + surjective) |
| $f: \mathbb{Z} \to \mathbb{Z},\ f(n) = n + 5$ | Yes |
| $f: \mathbb{R} \to \mathbb{R},\ f(x) = x^3$ | Yes |
| $f: \mathbb{R} \to \mathbb{R},\ f(x) = x^2$ | No (not injective, not surjective) |

### Inverse Functions

A bijection $f: A \to B$ has an **inverse** $f^{-1}: B \to A$ satisfying:

$$f^{-1}(f(a)) = a \quad \text{and} \quad f(f^{-1}(b)) = b$$

Only bijections have inverses that are themselves functions.

---

## 6. Summary Table

| Property | Condition | Arrow Diagram Clue |
|----------|-----------|-------------------|
| Injective | No two inputs share an output | No element in $B$ has $\geq 2$ incoming arrows |
| Surjective | Every output is used | No element in $B$ has $0$ incoming arrows |
| Bijective | Both | Every element in $B$ has exactly $1$ incoming arrow |

For finite sets $|A| = m$, $|B| = n$:

- Injective requires $m \leq n$
- Surjective requires $m \geq n$
- Bijective requires $m = n$

---

## 7. Floor and Ceiling Functions

Two important functions in discrete mathematics and programming:

### Floor Function $\lfloor x \rfloor$

The **floor** of $x$ is the greatest integer less than or equal to $x$:

$$\lfloor x \rfloor = \max\{n \in \mathbb{Z} \mid n \leq x\}$$

Examples: $\lfloor 3.7 \rfloor = 3$, $\lfloor -2.3 \rfloor = -3$, $\lfloor 5 \rfloor = 5$.

### Ceiling Function $\lceil x \rceil$

The **ceiling** of $x$ is the least integer greater than or equal to $x$:

$$\lceil x \rceil = \min\{n \in \mathbb{Z} \mid n \geq x\}$$

Examples: $\lceil 3.2 \rceil = 4$, $\lceil -2.7 \rceil = -2$, $\lceil 5 \rceil = 5$.

### Useful Identities

- $\lfloor x \rfloor \leq x < \lfloor x \rfloor + 1$
- $\lceil x \rceil - 1 < x \leq \lceil x \rceil$
- $\lfloor -x \rfloor = -\lceil x \rceil$
- $\lceil -x \rceil = -\lfloor x \rfloor$
- For integer $n$: $\lfloor x + n \rfloor = \lfloor x \rfloor + n$

### Application in CS

The number of bits needed to represent a positive integer $n$ is $\lfloor \log_2 n \rfloor + 1$.

The number of pages needed for $n$ items with $k$ items per page is $\lceil n/k \rceil$.

---

## 8. Pigeonhole Principle (Preview)

The **Pigeonhole Principle** is a direct consequence of function properties:

> If $f: A \to B$ and $|A| > |B|$, then $f$ **cannot** be injective.

In everyday language: if you put $n + 1$ pigeons into $n$ holes, at least one hole contains at least two pigeons.

### Simple Applications

1. In any group of 13 people, at least two share a birth month (13 people, 12 months).
2. In any set of 27 English words, at least two start with the same letter (27 words, 26 letters).
3. Among any 5 integers, at least two have the same remainder when divided by 4 (5 numbers, 4 possible remainders: 0, 1, 2, 3).

We will explore the Pigeonhole Principle in depth in a later lesson.

---

## 9. Code — Check Injective, Surjective, Bijective

Given a function as a mapping (dictionary/map from domain elements to codomain elements), and the full codomain, we determine its type.

```cpp
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

struct FunctionAnalyzer {
    unordered_map<int, int> mapping;  // domain -> codomain
    unordered_set<int> codomain;

    bool isInjective() {
        unordered_set<int> seen;
        for (auto& [key, value] : mapping) {
            if (seen.count(value)) return false;
            seen.insert(value);
        }
        return true;
    }

    bool isSurjective() {
        unordered_set<int> range;
        for (auto& [key, value] : mapping) {
            range.insert(value);
        }
        for (int b : codomain) {
            if (!range.count(b)) return false;
        }
        return true;
    }

    bool isBijective() {
        return isInjective() && isSurjective();
    }

    void analyze() {
        cout << "Injective:  " << (isInjective() ? "Yes" : "No") << endl;
        cout << "Surjective: " << (isSurjective() ? "Yes" : "No") << endl;
        cout << "Bijective:  " << (isBijective() ? "Yes" : "No") << endl;
    }
};

int main() {
    FunctionAnalyzer f;
    f.mapping = {{1, 2}, {2, 4}, {3, 6}, {4, 8}};
    f.codomain = {2, 4, 6, 8};

    cout << "f(x) = 2x on {1,2,3,4} -> {2,4,6,8}:" << endl;
    f.analyze();

    cout << endl;

    FunctionAnalyzer g;
    g.mapping = {{1, 1}, {2, 1}, {3, 2}};
    g.codomain = {1, 2, 3};

    cout << "g: {1,2,3} -> {1,2,3} with g(1)=g(2)=1, g(3)=2:" << endl;
    g.analyze();

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class FunctionAnalyzer
{
    private Dictionary<int, int> mapping;
    private HashSet<int> codomain;

    public FunctionAnalyzer(Dictionary<int, int> mapping, HashSet<int> codomain)
    {
        this.mapping = mapping;
        this.codomain = codomain;
    }

    public bool IsInjective()
    {
        var seen = new HashSet<int>();
        foreach (var value in mapping.Values)
        {
            if (!seen.Add(value)) return false;
        }
        return true;
    }

    public bool IsSurjective()
    {
        var range = new HashSet<int>(mapping.Values);
        return codomain.All(b => range.Contains(b));
    }

    public bool IsBijective() => IsInjective() && IsSurjective();

    public void Analyze()
    {
        Console.WriteLine($"  Injective:  {IsInjective()}");
        Console.WriteLine($"  Surjective: {IsSurjective()}");
        Console.WriteLine($"  Bijective:  {IsBijective()}");
    }

    static void Main()
    {
        var f = new FunctionAnalyzer(
            new Dictionary<int, int> { {1,2}, {2,4}, {3,6}, {4,8} },
            new HashSet<int> { 2, 4, 6, 8 }
        );
        Console.WriteLine("f(x) = 2x on {1,2,3,4} -> {2,4,6,8}:");
        f.Analyze();

        Console.WriteLine();

        var g = new FunctionAnalyzer(
            new Dictionary<int, int> { {1,1}, {2,1}, {3,2} },
            new HashSet<int> { 1, 2, 3 }
        );
        Console.WriteLine("g: {1,2,3} -> {1,2,3} with g(1)=g(2)=1, g(3)=2:");
        g.Analyze();
    }
}
```

```java
import java.util.*;

public class FunctionAnalyzer {
    private Map<Integer, Integer> mapping;
    private Set<Integer> codomain;

    public FunctionAnalyzer(Map<Integer, Integer> mapping, Set<Integer> codomain) {
        this.mapping = mapping;
        this.codomain = codomain;
    }

    public boolean isInjective() {
        Set<Integer> seen = new HashSet<>();
        for (int value : mapping.values()) {
            if (!seen.add(value)) return false;
        }
        return true;
    }

    public boolean isSurjective() {
        Set<Integer> range = new HashSet<>(mapping.values());
        for (int b : codomain) {
            if (!range.contains(b)) return false;
        }
        return true;
    }

    public boolean isBijective() {
        return isInjective() && isSurjective();
    }

    public void analyze() {
        System.out.println("  Injective:  " + isInjective());
        System.out.println("  Surjective: " + isSurjective());
        System.out.println("  Bijective:  " + isBijective());
    }

    public static void main(String[] args) {
        Map<Integer, Integer> fMap = Map.of(1,2, 2,4, 3,6, 4,8);
        Set<Integer> fCodomain = Set.of(2, 4, 6, 8);
        FunctionAnalyzer f = new FunctionAnalyzer(fMap, fCodomain);
        System.out.println("f(x) = 2x on {1,2,3,4} -> {2,4,6,8}:");
        f.analyze();

        System.out.println();

        Map<Integer, Integer> gMap = Map.of(1,1, 2,1, 3,2);
        Set<Integer> gCodomain = Set.of(1, 2, 3);
        FunctionAnalyzer g = new FunctionAnalyzer(gMap, gCodomain);
        System.out.println("g: {1,2,3} -> {1,2,3} with g(1)=g(2)=1, g(3)=2:");
        g.analyze();
    }
}
```

```python
def is_injective(mapping):
    """Check if no two inputs map to the same output."""
    values = list(mapping.values())
    return len(values) == len(set(values))


def is_surjective(mapping, codomain):
    """Check if every codomain element is hit."""
    range_set = set(mapping.values())
    return codomain.issubset(range_set)


def is_bijective(mapping, codomain):
    """Both injective and surjective."""
    return is_injective(mapping) and is_surjective(mapping, codomain)


def analyze(name, mapping, codomain):
    print(f"{name}:")
    print(f"  Injective:  {is_injective(mapping)}")
    print(f"  Surjective: {is_surjective(mapping, codomain)}")
    print(f"  Bijective:  {is_bijective(mapping, codomain)}")
    print()


# Example 1: f(x) = 2x on {1,2,3,4} -> {2,4,6,8}
f = {1: 2, 2: 4, 3: 6, 4: 8}
f_codomain = {2, 4, 6, 8}
analyze("f(x) = 2x", f, f_codomain)

# Example 2: not injective, not surjective
g = {1: 1, 2: 1, 3: 2}
g_codomain = {1, 2, 3}
analyze("g with g(1)=g(2)=1, g(3)=2", g, g_codomain)
```

```javascript
function isInjective(mapping) {
  const values = Object.values(mapping);
  return values.length === new Set(values).size;
}

function isSurjective(mapping, codomain) {
  const range = new Set(Object.values(mapping));
  return codomain.every((b) => range.has(b));
}

function isBijective(mapping, codomain) {
  return isInjective(mapping) && isSurjective(mapping, codomain);
}

function analyze(name, mapping, codomain) {
  console.log(`${name}:`);
  console.log(`  Injective:  ${isInjective(mapping)}`);
  console.log(`  Surjective: ${isSurjective(mapping, codomain)}`);
  console.log(`  Bijective:  ${isBijective(mapping, codomain)}`);
  console.log();
}

// Example 1: f(x) = 2x on {1,2,3,4} -> {2,4,6,8}
const f = { 1: 2, 2: 4, 3: 6, 4: 8 };
const fCodomain = [2, 4, 6, 8];
analyze("f(x) = 2x", f, fCodomain);

// Example 2: not injective, not surjective
const g = { 1: 1, 2: 1, 3: 2 };
const gCodomain = [1, 2, 3];
analyze("g with g(1)=g(2)=1, g(3)=2", g, gCodomain);
```

---

## 10. Practice Problems

1. Prove that $f: \mathbb{Z} \to \mathbb{Z}$ defined by $f(n) = 3n - 4$ is injective but not surjective.
2. Let $A = \{1,2,3,4\}$ and $B = \{a,b,c\}$. How many surjective functions exist from $A$ to $B$?
3. Show that $f: \mathbb{R} \to \mathbb{R}$ defined by $f(x) = x^3 + x$ is bijective.
4. Compute $\lfloor -3.5 \rfloor$, $\lceil -3.5 \rceil$, $\lfloor 7 \rfloor$, $\lceil 7.01 \rceil$.
5. Using the Pigeonhole Principle, prove that among any 6 integers, at least two have the same remainder mod 5.

---

## Key Takeaways

- A **function** maps each input to exactly one output — it must be total and well-defined.
- **Domain** = set of inputs; **codomain** = allowed outputs; **range** = actual outputs.
- **Injective**: no collisions — distinct inputs give distinct outputs ($f(a) = f(b) \implies a = b$).
- **Surjective**: full coverage — every codomain element is hit.
- **Bijective**: both injective and surjective — a perfect one-to-one correspondence.
- Only bijections have **inverse functions**.
- **Floor** $\lfloor x \rfloor$ rounds down; **ceiling** $\lceil x \rceil$ rounds up.
- The **Pigeonhole Principle** says an injective function requires $|A| \leq |B|$ — more pigeons than holes means collisions are inevitable.
- For finite sets: injective needs $|A| \leq |B|$, surjective needs $|A| \geq |B|$, bijective needs $|A| = |B|$.
