---
title: Function Composition & Inverse Functions
---

# Function Composition & Inverse Functions

Function composition is one of the most powerful ideas in mathematics and computer science. It lets us build complex transformations by chaining simpler ones together. Inverse functions let us "undo" a transformation, which is essential in cryptography, data encoding, and algorithm design.

---

## What Is Function Composition?

Given two functions $f: A \to B$ and $g: B \to C$, the **composition** of $g$ with $f$, written $g \circ f$, is a new function from $A$ to $C$ defined by:

$$(g \circ f)(x) = g(f(x))$$

We read $g \circ f$ as "$g$ composed with $f$" or "$g$ after $f$."

**Important:** We apply $f$ first, then $g$. The rightmost function is applied first.

### Example

Let $f: \mathbb{R} \to \mathbb{R}$ with $f(x) = 2x + 1$ and $g: \mathbb{R} \to \mathbb{R}$ with $g(x) = x^2$.

$$(g \circ f)(x) = g(f(x)) = g(2x + 1) = (2x + 1)^2$$

For $x = 3$:

$$(g \circ f)(3) = g(f(3)) = g(7) = 49$$

### Domain Compatibility

For $g \circ f$ to be well-defined, the **codomain of $f$** must be a subset of (or equal to) the **domain of $g$**. In other words, the output of $f$ must be a valid input for $g$.

---

## Order Matters: $g \circ f \neq f \circ g$

Composition is **not commutative** in general. Let's verify with our example:

$$(g \circ f)(x) = (2x + 1)^2$$

$$(f \circ g)(x) = f(g(x)) = f(x^2) = 2x^2 + 1$$

For $x = 3$:
- $(g \circ f)(3) = 49$
- $(f \circ g)(3) = 19$

These are clearly different! The order in which you compose functions matters enormously.

---

## Associativity of Composition

While composition is not commutative, it **is associative**. For functions $f: A \to B$, $g: B \to C$, and $h: C \to D$:

$$h \circ (g \circ f) = (h \circ g) \circ f$$

**Proof sketch:** For any $x \in A$:

$$[h \circ (g \circ f)](x) = h((g \circ f)(x)) = h(g(f(x)))$$

$$[(h \circ g) \circ f](x) = (h \circ g)(f(x)) = h(g(f(x)))$$

Both sides equal $h(g(f(x)))$, so they are the same function.

This means we can write $h \circ g \circ f$ without ambiguity.

---

## The Identity Function

The **identity function** on a set $A$, denoted $\text{id}_A$ or simply $\text{id}$, is defined as:

$$\text{id}_A(x) = x \quad \text{for all } x \in A$$

It acts as a "do nothing" function. The identity function is the **neutral element** for composition:

$$f \circ \text{id}_A = f$$

$$\text{id}_B \circ f = f$$

for any $f: A \to B$.

Think of it like multiplying by 1 — it doesn't change anything.

---

## Inverse Functions

### Definition

A function $f: A \to B$ has an **inverse** $f^{-1}: B \to A$ if:

$$f^{-1}(f(x)) = x \quad \text{for all } x \in A$$

$$f(f^{-1}(y)) = y \quad \text{for all } y \in B$$

Equivalently:

$$(f^{-1} \circ f) = \text{id}_A$$

$$(f \circ f^{-1}) = \text{id}_B$$

### When Does an Inverse Exist?

**Theorem:** A function $f: A \to B$ has an inverse if and only if $f$ is **bijective** (both injective and surjective).

- **Injective (one-to-one):** No two inputs map to the same output. This ensures $f^{-1}$ is well-defined (each output traces back to exactly one input).
- **Surjective (onto):** Every element in $B$ is hit by some element in $A$. This ensures $f^{-1}$ is defined on all of $B$.

### Example

$f: \mathbb{R} \to \mathbb{R}$ with $f(x) = 2x + 1$ is bijective.

To find $f^{-1}$: solve $y = 2x + 1$ for $x$:

$$x = \frac{y - 1}{2}$$

So $f^{-1}(y) = \frac{y - 1}{2}$.

**Verification:**

$$(f^{-1} \circ f)(x) = f^{-1}(2x + 1) = \frac{(2x + 1) - 1}{2} = x \checkmark$$

$$(f \circ f^{-1})(y) = f\left(\frac{y-1}{2}\right) = 2 \cdot \frac{y-1}{2} + 1 = y \checkmark$$

### Non-Example

$g: \mathbb{R} \to \mathbb{R}$ with $g(x) = x^2$ is **not** bijective:
- Not injective: $g(2) = g(-2) = 4$
- Not surjective: $-1$ has no preimage

Therefore $g^{-1}$ does not exist (on all of $\mathbb{R}$).

---

## Composing with Inverses

If $f$ and $g$ are both bijective, then $g \circ f$ is also bijective, and:

$$(g \circ f)^{-1} = f^{-1} \circ g^{-1}$$

Notice the **reversal of order** — like taking off shoes and socks (you put socks on first, but take them off last).

**Proof:**

$$[(f^{-1} \circ g^{-1}) \circ (g \circ f)](x) = f^{-1}(g^{-1}(g(f(x)))) = f^{-1}(f(x)) = x$$

---

## Composition in Discrete/Finite Settings

When functions are defined on finite sets, we can represent them as mappings (arrays or hash maps) and compose them by table lookup.

Let $A = \{1, 2, 3, 4\}$ and:
- $f: A \to A$ defined by $f = \{1 \mapsto 2,\ 2 \mapsto 3,\ 3 \mapsto 4,\ 4 \mapsto 1\}$
- $g: A \to A$ defined by $g = \{1 \mapsto 3,\ 2 \mapsto 1,\ 3 \mapsto 4,\ 4 \mapsto 2\}$

Then $(g \circ f)(1) = g(f(1)) = g(2) = 1$, and so on.

---

## Code: Compose Functions and Compute Inverse

Let's implement function composition for finite mappings and compute the inverse when it exists.

```cpp
#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

// Compose g after f: (g ∘ f)(x) = g(f(x))
unordered_map<int,int> compose(const unordered_map<int,int>& f,
                                const unordered_map<int,int>& g) {
    unordered_map<int,int> result;
    for (auto& [x, fx] : f) {
        if (g.count(fx)) {
            result[x] = g.at(fx);
        }
    }
    return result;
}

// Compute inverse of a bijection (returns empty if not bijective)
unordered_map<int,int> inverse(const unordered_map<int,int>& f) {
    unordered_map<int,int> inv;
    for (auto& [x, fx] : f) {
        if (inv.count(fx)) {
            // Not injective — inverse doesn't exist
            return {};
        }
        inv[fx] = x;
    }
    return inv;
}

int main() {
    unordered_map<int,int> f = {{1,2},{2,3},{3,4},{4,1}};
    unordered_map<int,int> g = {{1,3},{2,1},{3,4},{4,2}};

    auto gf = compose(f, g);
    cout << "g ∘ f:" << endl;
    for (auto& [x, y] : gf) cout << "  " << x << " -> " << y << endl;

    auto f_inv = inverse(f);
    cout << "f inverse:" << endl;
    for (auto& [x, y] : f_inv) cout << "  " << x << " -> " << y << endl;

    // Verify: f_inv ∘ f should be identity
    auto identity_check = compose(f, f_inv);
    cout << "f_inv ∘ f (should be identity):" << endl;
    for (auto& [x, y] : identity_check) cout << "  " << x << " -> " << y << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class FunctionComposition
{
    // Compose g after f: (g ∘ f)(x) = g(f(x))
    static Dictionary<int,int> Compose(Dictionary<int,int> f, Dictionary<int,int> g)
    {
        var result = new Dictionary<int,int>();
        foreach (var pair in f)
        {
            if (g.ContainsKey(pair.Value))
                result[pair.Key] = g[pair.Value];
        }
        return result;
    }

    // Compute inverse of a bijection (returns null if not bijective)
    static Dictionary<int,int> Inverse(Dictionary<int,int> f)
    {
        var inv = new Dictionary<int,int>();
        foreach (var pair in f)
        {
            if (inv.ContainsKey(pair.Value))
                return null; // Not injective
            inv[pair.Value] = pair.Key;
        }
        return inv;
    }

    static void Main()
    {
        var f = new Dictionary<int,int>{{1,2},{2,3},{3,4},{4,1}};
        var g = new Dictionary<int,int>{{1,3},{2,1},{3,4},{4,2}};

        var gf = Compose(f, g);
        Console.WriteLine("g ∘ f:");
        foreach (var p in gf) Console.WriteLine($"  {p.Key} -> {p.Value}");

        var fInv = Inverse(f);
        Console.WriteLine("f inverse:");
        foreach (var p in fInv) Console.WriteLine($"  {p.Key} -> {p.Value}");

        var identityCheck = Compose(f, fInv);
        Console.WriteLine("f_inv ∘ f (should be identity):");
        foreach (var p in identityCheck) Console.WriteLine($"  {p.Key} -> {p.Value}");
    }
}
```

```java
import java.util.HashMap;
import java.util.Map;

public class FunctionComposition {

    // Compose g after f: (g ∘ f)(x) = g(f(x))
    static Map<Integer,Integer> compose(Map<Integer,Integer> f, Map<Integer,Integer> g) {
        Map<Integer,Integer> result = new HashMap<>();
        for (Map.Entry<Integer,Integer> entry : f.entrySet()) {
            if (g.containsKey(entry.getValue())) {
                result.put(entry.getKey(), g.get(entry.getValue()));
            }
        }
        return result;
    }

    // Compute inverse (returns null if not bijective)
    static Map<Integer,Integer> inverse(Map<Integer,Integer> f) {
        Map<Integer,Integer> inv = new HashMap<>();
        for (Map.Entry<Integer,Integer> entry : f.entrySet()) {
            if (inv.containsKey(entry.getValue())) return null;
            inv.put(entry.getValue(), entry.getKey());
        }
        return inv;
    }

    public static void main(String[] args) {
        Map<Integer,Integer> f = Map.of(1,2, 2,3, 3,4, 4,1);
        Map<Integer,Integer> g = Map.of(1,3, 2,1, 3,4, 4,2);

        System.out.println("g ∘ f:");
        compose(f, g).forEach((k,v) -> System.out.println("  " + k + " -> " + v));

        Map<Integer,Integer> fInv = inverse(new HashMap<>(f));
        System.out.println("f inverse:");
        fInv.forEach((k,v) -> System.out.println("  " + k + " -> " + v));

        System.out.println("f_inv ∘ f (should be identity):");
        compose(new HashMap<>(f), fInv).forEach((k,v) ->
            System.out.println("  " + k + " -> " + v));
    }
}
```

```python
def compose(f: dict, g: dict) -> dict:
    """Compose g after f: (g ∘ f)(x) = g(f(x))"""
    return {x: g[fx] for x, fx in f.items() if fx in g}


def inverse(f: dict) -> dict | None:
    """Compute inverse of a bijection. Returns None if not bijective."""
    inv = {}
    for x, fx in f.items():
        if fx in inv:
            return None  # Not injective
        inv[fx] = x
    return inv


# Define finite functions on {1, 2, 3, 4}
f = {1: 2, 2: 3, 3: 4, 4: 1}
g = {1: 3, 2: 1, 3: 4, 4: 2}

gf = compose(f, g)
print("g ∘ f:", gf)

f_inv = inverse(f)
print("f inverse:", f_inv)

# Verify: f_inv ∘ f should be identity
identity_check = compose(f, f_inv)
print("f_inv ∘ f (should be identity):", identity_check)

# Composition is not commutative
fg = compose(g, f)
print("f ∘ g:", fg)
print("g ∘ f == f ∘ g?", gf == fg)
```

```javascript
// Compose g after f: (g ∘ f)(x) = g(f(x))
function compose(f, g) {
  const result = {};
  for (const [x, fx] of Object.entries(f)) {
    if (fx in g) {
      result[x] = g[fx];
    }
  }
  return result;
}

// Compute inverse of a bijection (returns null if not bijective)
function inverse(f) {
  const inv = {};
  for (const [x, fx] of Object.entries(f)) {
    if (fx in inv) return null; // Not injective
    inv[fx] = x;
  }
  return inv;
}

const f = { 1: 2, 2: 3, 3: 4, 4: 1 };
const g = { 1: 3, 2: 1, 3: 4, 4: 2 };

const gf = compose(f, g);
console.log("g ∘ f:", gf);

const fInv = inverse(f);
console.log("f inverse:", fInv);

const identityCheck = compose(f, fInv);
console.log("f_inv ∘ f (should be identity):", identityCheck);

// Demonstrate non-commutativity
const fg = compose(g, f);
console.log("f ∘ g:", fg);
console.log("g ∘ f === f ∘ g?", JSON.stringify(gf) === JSON.stringify(fg));
```

---

## Composition of Real-Valued Functions

Beyond finite mappings, composition is used constantly with real-valued functions in calculus and algorithms:

| $f(x)$ | $g(x)$ | $(g \circ f)(x)$ |
|---------|---------|-------------------|
| $2x$ | $x + 3$ | $2x + 3$ |
| $x^2$ | $\sqrt{x}$ | $|x|$ |
| $\ln(x)$ | $e^x$ | $x$ (for $x > 0$) |
| $e^x$ | $\ln(x)$ | $x$ |

The last two rows show that $\ln$ and $\exp$ are inverses of each other (on appropriate domains).

---

## Properties Summary

| Property | Holds? |
|----------|--------|
| Commutative ($g \circ f = f \circ g$) | No (in general) |
| Associative ($h \circ (g \circ f) = (h \circ g) \circ f$) | Yes |
| Identity element exists | Yes ($\text{id}$) |
| Every function has an inverse | No (only bijections) |

---

## Applications

1. **Pipelines in programming:** Unix pipes, method chaining, and functional programming's `compose`/`pipe` operators are all function composition.
2. **Cryptography:** Encryption is a bijection; decryption is its inverse. Composing multiple encryption rounds strengthens the cipher.
3. **Computer graphics:** Transformations (rotate, scale, translate) are composed via matrix multiplication — order matters!
4. **Type systems:** Function types compose: if `f: A → B` and `g: B → C`, the compiler knows `g ∘ f: A → C`.

---

## Key Takeaways

1. **Composition** $(g \circ f)(x) = g(f(x))$ applies $f$ first, then $g$.
2. **Order matters** — composition is not commutative: $g \circ f \neq f \circ g$ in general.
3. Composition **is associative**: $h \circ (g \circ f) = (h \circ g) \circ f$.
4. The **identity function** $\text{id}(x) = x$ is the neutral element for composition.
5. A function has an **inverse** $f^{-1}$ if and only if it is **bijective** (one-to-one and onto).
6. Composing a function with its inverse yields the identity: $f^{-1} \circ f = \text{id}$.
7. The inverse of a composition reverses the order: $(g \circ f)^{-1} = f^{-1} \circ g^{-1}$.
8. In code, finite function composition is simply chained lookup in mappings.
