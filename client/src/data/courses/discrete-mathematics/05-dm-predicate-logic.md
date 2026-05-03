---
title: Predicate Logic & Quantifiers
---

# Predicate Logic & Quantifiers

Propositional logic is powerful, but it has a major limitation — it can't express statements about **collections** of objects. Consider: "All humans are mortal." In propositional logic, this is just a single atom $p$ with no internal structure. **Predicate logic** (also called first-order logic) gives us the power to reason about objects, their properties, and relationships between them.

---

## From Propositions to Predicates

### What is a Predicate?

A **predicate** is a statement that contains one or more variables and becomes a proposition when you substitute specific values for those variables.

$$P(x): \text{"$x$ is greater than 5"}$$

- $P(3)$: "3 is greater than 5" → **False**
- $P(7)$: "7 is greater than 5" → **True**
- $P(x)$: Not true or false yet — it depends on $x$!

> **Analogy:** Think of a predicate as a **function that returns a boolean**. In programming terms, `P(x)` is like `isGreaterThanFive(x)` — it's a function definition, not a value, until you call it with an argument.

### Multi-variable Predicates

Predicates can have multiple variables:

- $Q(x, y)$: "$x$ is older than $y$"
- $R(x, y, z)$: "$x + y = z$"

> **Programming analogy:** A one-variable predicate is like `bool isEven(int x)`. A two-variable predicate is like `bool isGreater(int x, int y)`.

---

## Domain of Discourse

The **domain of discourse** (or simply **domain**) is the set of all possible values that a variable can take. It's the "universe" we're talking about.

**Examples:**
- Domain = integers: $P(x)$: "$x > 5$" — could be true for 6, 7, 8, ...
- Domain = students in a class: $P(x)$: "$x$ passed the exam"
- Domain = real numbers: $Q(x)$: "$x^2 \geq 0$" — always true!

> **Why it matters:** The statement "for all $x$, $x > 0$" is **true** if the domain is positive integers, but **false** if the domain is all integers (since $-1 \leq 0$). The domain changes the meaning!

---

## The Universal Quantifier: $\forall$ ("For All")

The universal quantifier $\forall$ asserts that a predicate is true for **every** element in the domain.

$$\forall x \, P(x) \quad \text{means "For all $x$ in the domain, $P(x)$ is true"}$$

### Examples

**Domain: all integers**

- $\forall x \, (x + 0 = x)$ — **True** (adding zero gives you the same number)
- $\forall x \, (x > 0)$ — **False** (counterexample: $x = -1$)
- $\forall x \, (x^2 \geq 0)$ — **True** (squares are always non-negative)

**Domain: students in a classroom**

- $\forall x \, \text{HasTextbook}(x)$ — "Every student has a textbook"

> **Analogy:** Think of $\forall$ as a **loop that checks every element**. If the predicate is true for ALL elements, the whole statement is true. If even ONE element makes it false, the whole thing is false.

> **Programming analogy:** `all(P(x) for x in domain)` in Python, or `domain.every(x => P(x))` in JavaScript.

### To Disprove a Universal Statement

You only need **one counterexample**!

- Claim: $\forall x \, (x^2 > x)$ for integers
- Counterexample: $x = 0$, since $0^2 = 0 \not> 0$ ✗

---

## The Existential Quantifier: $\exists$ ("There Exists")

The existential quantifier $\exists$ asserts that a predicate is true for **at least one** element in the domain.

$$\exists x \, P(x) \quad \text{means "There exists at least one $x$ such that $P(x)$ is true"}$$

### Examples

**Domain: all integers**

- $\exists x \, (x > 100)$ — **True** (e.g., $x = 101$)
- $\exists x \, (x + x = 1)$ — **False** (no integer satisfies $2x = 1$)
- $\exists x \, (x^2 = 4)$ — **True** (e.g., $x = 2$ or $x = -2$)

**Domain: people on Earth**

- $\exists x \, \text{SpeaksKlingon}(x)$ — "Someone on Earth speaks Klingon" (True!)

> **Analogy:** Think of $\exists$ as searching through a list. As soon as you find ONE element that works, you can stop — the statement is true. It's only false if you check the ENTIRE domain and find nothing.

> **Programming analogy:** `any(P(x) for x in domain)` in Python, or `domain.some(x => P(x))` in JavaScript.

### To Disprove an Existential Statement

You must show that **no element** in the domain satisfies the predicate — much harder than disproving a universal statement.

---

## The Uniqueness Quantifier: $\exists!$ ("There Exists Exactly One")

$$\exists! x \, P(x) \quad \text{means "There is exactly one $x$ such that $P(x)$ is true"}$$

This is equivalent to saying: something exists AND it's unique.

$$\exists! x \, P(x) \equiv \exists x \, [P(x) \land \forall y \, (P(y) \to y = x)]$$

### Examples

**Domain: real numbers**

- $\exists! x \, (x + 3 = 5)$ — **True** (only $x = 2$ works)
- $\exists! x \, (x^2 = 4)$ — **False** (both $x = 2$ and $x = -2$ work — not unique!)

> **Programming analogy:** Like filtering a list and checking that the result has exactly one element:
> `len([x for x in domain if P(x)]) == 1`

---

## Nested Quantifiers

When predicates have multiple variables, we can apply different quantifiers to each. **The order of quantifiers matters!**

### Same Quantifier Nesting

$$\forall x \, \forall y \, P(x, y) \equiv \forall y \, \forall x \, P(x, y)$$

When both quantifiers are the same type, order doesn't matter.

### Mixed Quantifier Nesting — ORDER MATTERS!

Let $L(x, y)$ mean "$x$ loves $y$". Domain: all people.

$$\forall x \, \exists y \, L(x, y)$$

"For every person $x$, there exists some person $y$ that $x$ loves."
→ **Everyone loves someone** (each person may love a different someone).

$$\exists y \, \forall x \, L(x, y)$$

"There exists a person $y$ such that every person $x$ loves $y$."
→ **There's someone that everyone loves** (one specific person is loved by all).

These are VERY different statements! The first is much easier to satisfy.

### More Examples

Let $G(x, y)$ mean "$x > y$". Domain: positive integers.

| Statement | English | Truth Value |
|-----------|---------|-------------|
| $\forall x \, \forall y \, G(x, y)$ | Every number is greater than every number | False |
| $\forall x \, \exists y \, G(x, y)$ | For every number, there's a smaller one | False ($x=1$ has no smaller positive integer) |
| $\exists x \, \forall y \, G(x, y)$ | Some number is greater than all numbers | False (no largest positive integer... wait, domain is infinite) |
| $\exists x \, \exists y \, G(x, y)$ | Some number is greater than some number | True ($2 > 1$) |

> **Key Rule:** $\forall x \, \exists y$ means "$y$ can depend on $x$" (different $y$ for each $x$). $\exists y \, \forall x$ means "one fixed $y$ works for ALL $x$."

---

## Negating Quantified Statements

This is one of the most important skills in predicate logic!

### Negating Universal Statements

$$\neg \forall x \, P(x) \equiv \exists x \, \neg P(x)$$

"It's NOT the case that all $x$ satisfy $P$" ≡ "There EXISTS some $x$ that does NOT satisfy $P$"

> **Example:** "Not all students passed" ≡ "Some student failed"

### Negating Existential Statements

$$\neg \exists x \, P(x) \equiv \forall x \, \neg P(x)$$

"There does NOT exist an $x$ satisfying $P$" ≡ "For ALL $x$, $P$ is false"

> **Example:** "No one is perfect" ≡ "Everyone has at least one flaw"

### Negating Nested Quantifiers

Push the negation inward, flipping each quantifier as you pass it:

$$\neg \forall x \, \exists y \, P(x, y)$$
$$\equiv \exists x \, \neg \exists y \, P(x, y)$$
$$\equiv \exists x \, \forall y \, \neg P(x, y)$$

> **Pattern:** $\neg$ turns $\forall$ into $\exists$ and $\exists$ into $\forall$, then negates the predicate at the end.

**Example:**

Original: "Every student has at least one friend" → $\forall x \, \exists y \, \text{Friend}(x, y)$

Negation: "Some student has no friends" → $\exists x \, \forall y \, \neg\text{Friend}(x, y)$

---

## Bound vs Free Variables

A variable is **bound** if it's within the scope of a quantifier that applies to it. Otherwise, it's **free**.

$$\forall x \, (P(x) \land Q(x, y))$$

- $x$ is **bound** (governed by $\forall x$)
- $y$ is **free** (no quantifier governs it)

A statement with free variables is **not** a proposition — its truth value depends on what you substitute for the free variables.

> **Programming analogy:** Bound variables are like function parameters (local scope). Free variables are like global variables — their value comes from the surrounding context.

### Scope

Quantifiers have scope, just like variable declarations in code:

$$(\forall x \, P(x)) \land Q(x)$$

Here, the first $x$ is bound (inside the scope of $\forall x$), but the second $x$ is free (outside that scope). This is confusing! In practice, we rename variables to avoid such ambiguity.

---

## Translating English to Predicate Logic

This is a crucial skill. Let's work through it systematically.

### Step-by-Step Process

1. Identify the domain of discourse
2. Define predicates for properties and relationships
3. Identify quantifiers (all, some, none, etc.)
4. Combine with logical connectives

### Common English Phrases → Logic

| English | Logic |
|---------|-------|
| All X are Y | $\forall x \, (X(x) \to Y(x))$ |
| Some X are Y | $\exists x \, (X(x) \land Y(x))$ |
| No X are Y | $\forall x \, (X(x) \to \neg Y(x))$ |
| Not all X are Y | $\exists x \, (X(x) \land \neg Y(x))$ |

> **Warning:** "All X are Y" uses $\to$ (implication), NOT $\land$! "All dogs are cute" = $\forall x \, (\text{Dog}(x) \to \text{Cute}(x))$. Using $\land$ would mean "everything is a cute dog," which is wrong!

> **But:** "Some X are Y" uses $\land$ (conjunction), NOT $\to$! "Some dogs are cute" = $\exists x \, (\text{Dog}(x) \land \text{Cute}(x))$. Using $\to$ would be vacuously true for anything that isn't a dog.

### Worked Examples

**Domain: all people**

Let $S(x)$: "$x$ is a student", $H(x)$: "$x$ is happy", $F(x, y)$: "$x$ is friends with $y$"

1. "Every student is happy"
   $$\forall x \, (S(x) \to H(x))$$

2. "Some students are not happy"
   $$\exists x \, (S(x) \land \neg H(x))$$

3. "No student is friends with everyone"
   $$\forall x \, (S(x) \to \neg \forall y \, F(x, y))$$
   Or equivalently: $\forall x \, (S(x) \to \exists y \, \neg F(x, y))$

4. "There's a student who is friends with every other student"
   $$\exists x \, (S(x) \land \forall y \, (S(y) \land y \neq x \to F(x, y)))$$

5. "Everyone is friends with someone"
   $$\forall x \, \exists y \, F(x, y)$$

---

## Code Example: Checking Quantified Statements

Let's implement universal and existential quantification as functions that check whether predicates hold over finite domains.

```cpp
#include <iostream>
#include <vector>
#include <functional>
#include <string>
using namespace std;

// Universal quantifier: check if predicate holds for ALL elements
template<typename T>
bool forAll(const vector<T>& domain, function<bool(T)> predicate) {
    for (const auto& x : domain) {
        if (!predicate(x)) return false;
    }
    return true;
}

// Existential quantifier: check if predicate holds for SOME element
template<typename T>
bool exists(const vector<T>& domain, function<bool(T)> predicate) {
    for (const auto& x : domain) {
        if (predicate(x)) return true;
    }
    return false;
}

// Uniqueness quantifier: check if predicate holds for EXACTLY ONE element
template<typename T>
bool existsUnique(const vector<T>& domain, function<bool(T)> predicate) {
    int count = 0;
    for (const auto& x : domain) {
        if (predicate(x)) {
            count++;
            if (count > 1) return false;
        }
    }
    return count == 1;
}

// Nested quantifier: forAll x, exists y such that P(x, y)
template<typename T>
bool forAllExists(const vector<T>& domain,
                  function<bool(T, T)> predicate) {
    for (const auto& x : domain) {
        bool found = false;
        for (const auto& y : domain) {
            if (predicate(x, y)) { found = true; break; }
        }
        if (!found) return false;
    }
    return true;
}

int main() {
    vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

    // ∀x (x > 0): "All numbers are positive"
    bool allPositive = forAll<int>(numbers, [](int x) { return x > 0; });
    cout << "All positive: " << (allPositive ? "true" : "false") << endl;

    // ∃x (x % 2 == 0): "Some number is even"
    bool someEven = exists<int>(numbers, [](int x) { return x % 2 == 0; });
    cout << "Some even: " << (someEven ? "true" : "false") << endl;

    // ∃!x (x*x == 9 and x > 0): "Exactly one positive square root of 9"
    bool uniqueSqrt = existsUnique<int>(numbers,
        [](int x) { return x * x == 9; });
    cout << "Unique sqrt of 9 in domain: " << (uniqueSqrt ? "true" : "false") << endl;

    // ∀x ∃y (x + y == 11): "For every x, there's a y that sums to 11"
    bool pairSum = forAllExists<int>(numbers,
        [](int x, int y) { return x + y == 11; });
    cout << "Every x has partner summing to 11: "
         << (pairSum ? "true" : "false") << endl;

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

class PredicateLogic
{
    // Universal quantifier: ∀x P(x)
    static bool ForAll<T>(IEnumerable<T> domain, Func<T, bool> predicate)
    {
        return domain.All(predicate);
    }

    // Existential quantifier: ∃x P(x)
    static bool Exists<T>(IEnumerable<T> domain, Func<T, bool> predicate)
    {
        return domain.Any(predicate);
    }

    // Uniqueness quantifier: ∃!x P(x)
    static bool ExistsUnique<T>(IEnumerable<T> domain, Func<T, bool> predicate)
    {
        return domain.Count(predicate) == 1;
    }

    // Nested: ∀x ∃y P(x, y)
    static bool ForAllExists<T>(IEnumerable<T> domain,
                                 Func<T, T, bool> predicate)
    {
        return domain.All(x => domain.Any(y => predicate(x, y)));
    }

    // Nested: ∃y ∀x P(x, y)
    static bool ExistsForAll<T>(IEnumerable<T> domain,
                                 Func<T, T, bool> predicate)
    {
        return domain.Any(y => domain.All(x => predicate(x, y)));
    }

    static void Main()
    {
        var numbers = Enumerable.Range(1, 10).ToList();

        // ∀x (x > 0): All numbers are positive
        Console.WriteLine($"All positive: {ForAll(numbers, x => x > 0)}");

        // ∃x (x % 2 == 0): Some number is even
        Console.WriteLine($"Some even: {Exists(numbers, x => x % 2 == 0)}");

        // ∃!x (x² == 9): Exactly one x where x² = 9 (in 1..10, only 3)
        Console.WriteLine($"Unique sqrt of 9: {ExistsUnique(numbers, x => x * x == 9)}");

        // ∀x ∃y (x + y == 11)
        Console.WriteLine($"Every x has partner summing to 11: " +
            $"{ForAllExists(numbers, (x, y) => x + y == 11)}");

        // ∃y ∀x (x + y > 0) — is there a y making all sums positive?
        Console.WriteLine($"Exists y, all x+y > 0: " +
            $"{ExistsForAll(numbers, (x, y) => x + y > 0)}");
    }
}
```

```java
import java.util.List;
import java.util.function.Predicate;
import java.util.function.BiPredicate;
import java.util.stream.IntStream;

public class PredicateLogic {

    // Universal quantifier: ∀x P(x)
    static <T> boolean forAll(List<T> domain, Predicate<T> predicate) {
        return domain.stream().allMatch(predicate);
    }

    // Existential quantifier: ∃x P(x)
    static <T> boolean exists(List<T> domain, Predicate<T> predicate) {
        return domain.stream().anyMatch(predicate);
    }

    // Uniqueness quantifier: ∃!x P(x)
    static <T> boolean existsUnique(List<T> domain, Predicate<T> predicate) {
        return domain.stream().filter(predicate).count() == 1;
    }

    // Nested: ∀x ∃y P(x, y)
    static <T> boolean forAllExists(List<T> domain, BiPredicate<T, T> predicate) {
        return domain.stream().allMatch(x ->
            domain.stream().anyMatch(y -> predicate.test(x, y)));
    }

    // Nested: ∃y ∀x P(x, y)
    static <T> boolean existsForAll(List<T> domain, BiPredicate<T, T> predicate) {
        return domain.stream().anyMatch(y ->
            domain.stream().allMatch(x -> predicate.test(x, y)));
    }

    public static void main(String[] args) {
        List<Integer> numbers = IntStream.rangeClosed(1, 10)
            .boxed().toList();

        // ∀x (x > 0): All numbers are positive
        System.out.println("All positive: " +
            forAll(numbers, x -> x > 0));

        // ∃x (x % 2 == 0): Some number is even
        System.out.println("Some even: " +
            exists(numbers, x -> x % 2 == 0));

        // ∃!x (x² == 9): Exactly one x where x² = 9
        System.out.println("Unique sqrt of 9: " +
            existsUnique(numbers, x -> x * x == 9));

        // ∀x ∃y (x + y == 11)
        System.out.println("Every x has partner summing to 11: " +
            forAllExists(numbers, (x, y) -> x + y == 11));

        // ∃y ∀x (x + y > 0)
        System.out.println("Exists y, all x+y > 0: " +
            existsForAll(numbers, (x, y) -> x + y > 0));
    }
}
```

```python
from typing import Callable, TypeVar, Iterable

T = TypeVar("T")


def for_all(domain: Iterable[T], predicate: Callable[[T], bool]) -> bool:
    """Universal quantifier: ∀x P(x)"""
    return all(predicate(x) for x in domain)


def exists(domain: Iterable[T], predicate: Callable[[T], bool]) -> bool:
    """Existential quantifier: ∃x P(x)"""
    return any(predicate(x) for x in domain)


def exists_unique(domain: list[T], predicate: Callable[[T], bool]) -> bool:
    """Uniqueness quantifier: ∃!x P(x)"""
    return sum(1 for x in domain if predicate(x)) == 1


def for_all_exists(domain: list[T], predicate: Callable[[T, T], bool]) -> bool:
    """Nested quantifier: ∀x ∃y P(x, y)"""
    return all(any(predicate(x, y) for y in domain) for x in domain)


def exists_for_all(domain: list[T], predicate: Callable[[T, T], bool]) -> bool:
    """Nested quantifier: ∃y ∀x P(x, y)"""
    return any(all(predicate(x, y) for x in domain) for y in domain)


# --- Demonstrations ---
numbers = list(range(1, 11))  # [1, 2, ..., 10]

# ∀x (x > 0): All numbers are positive
print(f"All positive: {for_all(numbers, lambda x: x > 0)}")

# ∃x (x % 2 == 0): Some number is even
print(f"Some even: {exists(numbers, lambda x: x % 2 == 0)}")

# ∃!x (x² == 9): Exactly one x where x² = 9 (in 1..10, only x=3)
print(f"Unique sqrt of 9: {exists_unique(numbers, lambda x: x * x == 9)}")

# ∀x ∃y (x + y == 11): For every x, there's a y that sums to 11
print(f"Every x has partner summing to 11: "
      f"{for_all_exists(numbers, lambda x, y: x + y == 11)}")

# ∃y ∀x (x + y > 0): Some y makes all sums positive
print(f"Exists y, all x+y > 0: "
      f"{exists_for_all(numbers, lambda x, y: x + y > 0)}")

# Demonstrate negation: ¬∀x P(x) ≡ ∃x ¬P(x)
print("\n--- Negation Demo ---")
P = lambda x: x < 8  # "x is less than 8"
print(f"∀x (x < 8): {for_all(numbers, P)}")
print(f"∃x ¬(x < 8): {exists(numbers, lambda x: not P(x))}")
print(f"¬∀x P(x) ≡ ∃x ¬P(x): {(not for_all(numbers, P)) == exists(numbers, lambda x: not P(x))}")
```

```javascript
// Universal quantifier: ∀x P(x)
function forAll(domain, predicate) {
  return domain.every(predicate);
}

// Existential quantifier: ∃x P(x)
function exists(domain, predicate) {
  return domain.some(predicate);
}

// Uniqueness quantifier: ∃!x P(x)
function existsUnique(domain, predicate) {
  return domain.filter(predicate).length === 1;
}

// Nested: ∀x ∃y P(x, y)
function forAllExists(domain, predicate) {
  return domain.every(x => domain.some(y => predicate(x, y)));
}

// Nested: ∃y ∀x P(x, y)
function existsForAll(domain, predicate) {
  return domain.some(y => domain.every(x => predicate(x, y)));
}

// --- Demonstrations ---
const numbers = Array.from({ length: 10 }, (_, i) => i + 1); // [1..10]

// ∀x (x > 0): All numbers are positive
console.log(`All positive: ${forAll(numbers, x => x > 0)}`);

// ∃x (x % 2 === 0): Some number is even
console.log(`Some even: ${exists(numbers, x => x % 2 === 0)}`);

// ∃!x (x² === 9): Exactly one x where x² = 9
console.log(`Unique sqrt of 9: ${existsUnique(numbers, x => x * x === 9)}`);

// ∀x ∃y (x + y === 11): For every x, there's a y that sums to 11
console.log(`Every x has partner summing to 11: ${
  forAllExists(numbers, (x, y) => x + y === 11)}`);

// ∃y ∀x (x + y > 0): Some y makes all sums positive
console.log(`Exists y, all x+y > 0: ${
  existsForAll(numbers, (x, y) => x + y > 0)}`);

// Demonstrate negation: ¬∀x P(x) ≡ ∃x ¬P(x)
console.log("\n--- Negation Demo ---");
const P = x => x < 8;
console.log(`∀x (x < 8): ${forAll(numbers, P)}`);
console.log(`∃x ¬(x < 8): ${exists(numbers, x => !P(x))}`);
console.log(`¬∀x P(x) ≡ ∃x ¬P(x): ${
  (!forAll(numbers, P)) === exists(numbers, x => !P(x))}`);
```

---

## Practice Problems

### Problem 1

Let the domain be all integers. Translate to predicate logic:

1. "Every integer has a successor"
2. "There is no largest integer"
3. "Between any two distinct integers, there's another number" (false for integers, but think about it!)

<details>
<summary>Solution</summary>

Let $S(x, y)$ mean "$y$ is the successor of $x$" (i.e., $y = x + 1$), and $G(x, y)$ mean "$x > y$".

1. $\forall x \, \exists y \, (y = x + 1)$ ✓ (True — every integer has a next one)

2. $\neg \exists x \, \forall y \, (x \geq y)$, or equivalently: $\forall x \, \exists y \, (y > x)$ ✓ (True — you can always add 1)

3. $\forall x \, \forall y \, (x \neq y \to \exists z \, ((x < z \land z < y) \lor (y < z \land z < x)))$ — **False** for integers! Between 1 and 2, there's no integer. (This IS true for real numbers — that's "density.")

</details>

### Problem 2

Negate each statement and express in English:

1. $\forall x \, \exists y \, (x + y = 0)$ — "Every number has an additive inverse"
2. $\exists x \, \forall y \, (x \cdot y = y)$ — "There exists a multiplicative identity"

<details>
<summary>Solution</summary>

1. $\neg[\forall x \, \exists y \, (x + y = 0)] \equiv \exists x \, \forall y \, (x + y \neq 0)$

   English: "There exists a number that has no additive inverse" (i.e., some number $x$ such that no $y$ satisfies $x + y = 0$).

   Note: This negation is **false** for integers (every integer $x$ has inverse $-x$).

2. $\neg[\exists x \, \forall y \, (x \cdot y = y)] \equiv \forall x \, \exists y \, (x \cdot y \neq y)$

   English: "For every number $x$, there's some $y$ such that $x \cdot y \neq y$" (no number works as a universal multiplicative identity).

   Note: This negation is **false** because $x = 1$ satisfies the original ($1 \cdot y = y$ for all $y$).

</details>

### Problem 3

Let $F(x, y)$ mean "$x$ is a friend of $y$". Domain: all people. Translate:

1. "Everybody has at least one friend"
2. "Nobody is friends with everyone"
3. "There's someone who has no friends at all"
4. "If Alice is friends with Bob, then Bob is friends with Alice" (friendship is symmetric)

<details>
<summary>Solution</summary>

1. $\forall x \, \exists y \, F(x, y)$

2. $\neg \exists x \, \forall y \, F(x, y)$, equivalently: $\forall x \, \exists y \, \neg F(x, y)$
   (Everyone has at least one non-friend)

3. $\exists x \, \forall y \, \neg F(x, y)$

4. $\forall x \, \forall y \, (F(x, y) \to F(y, x))$
   (Note: We could write $F(\text{Alice}, \text{Bob}) \to F(\text{Bob}, \text{Alice})$ for the specific case, but the general symmetric property is the standard formulation.)

</details>

### Problem 4

Determine the truth value (domain: positive integers):

1. $\forall x \, \exists y \, (y = 2x)$ — "Every number has a double"
2. $\exists y \, \forall x \, (y = 2x)$ — "Some number is double of every number"
3. $\forall x \, \forall y \, (x \leq y \lor y \leq x)$ — "Any two numbers are comparable"
4. $\exists! x \, (x \cdot x = x)$ — "There's exactly one number that squared equals itself"

<details>
<summary>Solution</summary>

1. **True** — For any positive integer $x$, we can take $y = 2x$ which is also a positive integer.

2. **False** — No single $y$ can equal $2 \cdot 1 = 2$ AND $2 \cdot 2 = 4$ AND $2 \cdot 3 = 6$ ... simultaneously. This shows why quantifier order matters!

3. **True** — Positive integers are totally ordered: given any $x$ and $y$, either $x \leq y$ or $y \leq x$.

4. **True** — In positive integers, only $x = 1$ satisfies $x^2 = x$ (since $1^2 = 1$). (Note: if domain were all integers, $x = 0$ would also work, making it false.)

</details>

---

## Common Mistakes to Avoid

| Mistake | Why it's Wrong | Correct Form |
|---------|---------------|--------------|
| $\forall x \, (S(x) \land H(x))$ for "all students are happy" | Says EVERYTHING is a happy student | $\forall x \, (S(x) \to H(x))$ |
| $\exists x \, (S(x) \to H(x))$ for "some student is happy" | Vacuously true for any non-student | $\exists x \, (S(x) \land H(x))$ |
| Treating $\forall x \exists y$ same as $\exists y \forall x$ | Order changes meaning drastically | Analyze each case separately |
| Negating $\forall x P(x)$ as $\forall x \neg P(x)$ | This says NOTHING satisfies P | $\exists x \, \neg P(x)$ |

---

## Key Takeaways

1. **Predicates** are "boolean functions" — they become propositions only when you plug in specific values or quantify over them.

2. **Domain of discourse** is critical — the same statement can be true or false depending on what set of objects you're considering.

3. **$\forall$ (for all)** requires the predicate to hold for EVERY element. One counterexample disproves it. Think: `array.every()`.

4. **$\exists$ (there exists)** requires the predicate to hold for AT LEAST ONE element. One example proves it. Think: `array.some()`.

5. **Quantifier order matters!** $\forall x \exists y$ ("for each $x$, a possibly different $y$ works") is weaker than $\exists y \forall x$ ("one $y$ works for everything").

6. **Negation flips quantifiers:** $\neg\forall$ becomes $\exists\neg$, and $\neg\exists$ becomes $\forall\neg$. Push the negation inward, flipping as you go.

7. **"All X are Y"** uses implication ($\to$); **"Some X are Y"** uses conjunction ($\land$). This is the #1 translation error — don't mix them up!

8. **Bound variables** are governed by a quantifier; **free variables** make the expression not yet a proposition. Always ensure your final logical sentence has no free variables.
