---
title: Proof Techniques
---

# Proof Techniques

A proof is a logical argument that establishes the truth of a mathematical statement beyond any doubt. Unlike empirical evidence that says "this seems to be true," a proof says "this MUST be true." Learning proof techniques is like learning different tools in a toolkit — each one is suited for different types of problems.

---

## Why Learn Proof Techniques?

Proofs aren't just for mathematicians. As a programmer, you:

- **Prove algorithms correct** — Does your sorting algorithm always sort? Does your search always find the target?
- **Prove complexity bounds** — Is this algorithm really $O(n \log n)$?
- **Prove security properties** — Can this protocol be broken?
- **Write better code** — Understanding proof structure helps you think about edge cases systematically.

> **Real-world analogy:** A proof is like a watertight legal argument. Just as a lawyer must convince a judge using only accepted legal principles, a mathematician must convince readers using only accepted logical rules.

---

## Technique 1: Direct Proof

A direct proof starts from known truths (axioms, definitions, previously proven theorems) and applies logical steps to arrive at the conclusion.

**Structure:**
1. Assume the hypothesis is true.
2. Use definitions, axioms, and logical rules to derive the conclusion.
3. State the conclusion.

> **Real-world analogy:** A direct proof is like giving step-by-step directions from point A to point B. Each step follows naturally from the last.

---

### Example 1: Sum of Two Even Numbers is Even

**Theorem:** If $a$ and $b$ are even integers, then $a + b$ is even.

**Proof:**

Since $a$ is even, by definition there exists an integer $k$ such that:
$$a = 2k$$

Since $b$ is even, by definition there exists an integer $m$ such that:
$$b = 2m$$

Adding these:
$$a + b = 2k + 2m = 2(k + m)$$

Let $n = k + m$. Since $k$ and $m$ are integers, $n$ is also an integer.

Therefore $a + b = 2n$, which is even by definition. $\square$

**Why this works:** We started with the definition of "even" (divisible by 2), manipulated algebraically, and showed the result matches the definition of "even."

---

### Example 2: Product of Two Odd Numbers is Odd

**Theorem:** If $a$ and $b$ are odd integers, then $a \cdot b$ is odd.

**Proof:**

Since $a$ is odd, there exists an integer $k$ such that:
$$a = 2k + 1$$

Since $b$ is odd, there exists an integer $m$ such that:
$$b = 2m + 1$$

Multiplying:
$$a \cdot b = (2k + 1)(2m + 1)$$
$$= 4km + 2k + 2m + 1$$
$$= 2(2km + k + m) + 1$$

Let $n = 2km + k + m$. Since $k$ and $m$ are integers, $n$ is also an integer.

Therefore $a \cdot b = 2n + 1$, which is odd by definition. $\square$

---

## Technique 2: Proof by Contradiction

In a proof by contradiction, you assume the opposite of what you want to prove, then show this assumption leads to a logical impossibility (a contradiction). Since the assumption leads to nonsense, it must be false — so the original statement must be true.

**Structure:**
1. Assume the negation of the theorem (assume it's false).
2. Use logical reasoning to derive a contradiction.
3. Conclude the original statement must be true.

> **Real-world analogy:** It's like a detective proving someone is innocent by showing that if they were guilty, they'd have to be in two places at once — impossible! So they must be innocent.

---

### Example 1: $\sqrt{2}$ is Irrational

**Theorem:** $\sqrt{2}$ is irrational (cannot be expressed as a fraction $\frac{a}{b}$ where $a, b$ are integers with $b \neq 0$).

**Proof:**

Assume, for the sake of contradiction, that $\sqrt{2}$ IS rational.

Then we can write $\sqrt{2} = \frac{a}{b}$ where $a$ and $b$ are integers with no common factors (the fraction is in lowest terms).

Squaring both sides:
$$2 = \frac{a^2}{b^2}$$

Therefore:
$$a^2 = 2b^2$$

This means $a^2$ is even, which implies $a$ is even (since the square of an odd number is odd).

Since $a$ is even, we can write $a = 2k$ for some integer $k$.

Substituting:
$$(2k)^2 = 2b^2$$
$$4k^2 = 2b^2$$
$$2k^2 = b^2$$

This means $b^2$ is even, which implies $b$ is even.

**Contradiction!** We assumed $a$ and $b$ have no common factors, but we've shown both $a$ and $b$ are even — they share a factor of 2.

Since our assumption leads to a contradiction, the assumption must be false. Therefore $\sqrt{2}$ is irrational. $\square$

---

### Example 2: There Are Infinitely Many Primes

**Theorem:** There are infinitely many prime numbers.

**Proof (Euclid's proof):**

Assume, for the sake of contradiction, that there are only finitely many primes.

Let's list all of them: $p_1, p_2, p_3, \ldots, p_n$.

Now consider the number:
$$N = p_1 \cdot p_2 \cdot p_3 \cdots p_n + 1$$

$N$ is the product of all primes plus 1.

Now, what happens when we divide $N$ by any prime $p_i$ in our list?

$$N \div p_i = (p_1 \cdot p_2 \cdots p_n) \div p_i + \frac{1}{p_i}$$

The first part is an integer, but $\frac{1}{p_i}$ is not (since $p_i \geq 2$).

So $N$ is NOT divisible by any prime in our list. This means either:
- $N$ itself is prime (a prime not in our list), or
- $N$ has a prime factor not in our list.

Either way, there exists a prime not in our supposedly complete list.

**Contradiction!** We assumed our list contained ALL primes.

Therefore there must be infinitely many primes. $\square$

> **Why this matters in CS:** This proof guarantees that prime-based cryptography (RSA) will never "run out" of primes to use for keys.

---

## Technique 3: Proof by Contrapositive

The contrapositive of "$p \to q$" is "$\neg q \to \neg p$". These are logically equivalent, so proving one proves the other. Sometimes the contrapositive is easier to prove directly.

**Structure:**
1. Instead of proving "if $p$ then $q$," prove "if not $q$ then not $p$."
2. Use a direct proof on the contrapositive.

> **Real-world analogy:** Instead of proving "if you studied, you passed," you prove "if you didn't pass, you didn't study." Same statement, different angle — sometimes the second is easier to show.

---

### Example: If $n^2$ is Even, Then $n$ is Even

**Theorem:** For any integer $n$, if $n^2$ is even, then $n$ is even.

**Proof (by contrapositive):**

We prove the contrapositive: "If $n$ is NOT even (i.e., $n$ is odd), then $n^2$ is NOT even (i.e., $n^2$ is odd)."

Assume $n$ is odd. Then $n = 2k + 1$ for some integer $k$.

$$n^2 = (2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$$

Let $m = 2k^2 + 2k$. Since $k$ is an integer, $m$ is an integer.

Therefore $n^2 = 2m + 1$, which is odd.

We've proven the contrapositive, so the original statement holds. $\square$

**Why contrapositive?** Trying to prove "if $n^2$ is even then $n$ is even" directly is awkward — how do you "undo" a square? But proving "odd input gives odd output" is straightforward multiplication.

---

## Technique 4: Proof by Cases (Exhaustive Proof)

When a statement covers multiple scenarios, you can prove it by handling each case separately.

**Structure:**
1. Identify all possible cases that cover the entire domain.
2. Prove the statement holds in each case.
3. Since all cases are covered, the statement is universally true.

> **Real-world analogy:** Like testing software — if you verify the code works for every possible input category, you know it always works.

---

### Example: $|ab| = |a| \cdot |b|$

**Theorem:** For all real numbers $a$ and $b$, $|ab| = |a| \cdot |b|$.

**Proof:**

We consider all combinations of signs for $a$ and $b$.

**Case 1:** $a \geq 0$ and $b \geq 0$.
Then $ab \geq 0$, so $|ab| = ab = |a| \cdot |b|$. ✓

**Case 2:** $a \geq 0$ and $b < 0$.
Then $ab \leq 0$, so $|ab| = -(ab) = a \cdot (-b) = |a| \cdot |b|$. ✓

**Case 3:** $a < 0$ and $b \geq 0$.
Then $ab \leq 0$, so $|ab| = -(ab) = (-a) \cdot b = |a| \cdot |b|$. ✓

**Case 4:** $a < 0$ and $b < 0$.
Then $ab > 0$, so $|ab| = ab = (-a)(-b) = |a| \cdot |b|$. ✓

All cases yield $|ab| = |a| \cdot |b|$. $\square$

---

## Technique 5: Existence Proofs

An existence proof shows that something with a certain property exists. There are two flavors:

### Constructive Existence Proof

You explicitly provide an example that satisfies the property.

**Theorem:** There exists an integer that can be expressed as the sum of two cubes in two different ways.

**Proof:** The number $1729$ satisfies this:
$$1729 = 1^3 + 12^3 = 9^3 + 10^3$$

Since we've exhibited such a number, it exists. $\square$

(This is the famous "Hardy-Ramanujan number" or "taxicab number.")

---

### Non-Constructive Existence Proof

You prove something must exist without actually finding it.

**Theorem:** There exist irrational numbers $a$ and $b$ such that $a^b$ is rational.

**Proof:**

Consider $\sqrt{2}^{\sqrt{2}}$. This number is either rational or irrational.

**Case 1:** If $\sqrt{2}^{\sqrt{2}}$ is rational, then we're done — let $a = b = \sqrt{2}$ (both irrational), and $a^b$ is rational.

**Case 2:** If $\sqrt{2}^{\sqrt{2}}$ is irrational, let $a = \sqrt{2}^{\sqrt{2}}$ and $b = \sqrt{2}$.

Then:
$$a^b = \left(\sqrt{2}^{\sqrt{2}}\right)^{\sqrt{2}} = \sqrt{2}^{\sqrt{2} \cdot \sqrt{2}} = \sqrt{2}^2 = 2$$

Which is rational. ✓

In either case, such $a$ and $b$ exist. $\square$

> **Note:** We proved existence without knowing which case is actually true! (It turns out Case 2 holds — $\sqrt{2}^{\sqrt{2}}$ is irrational by the Gelfond-Schneider theorem.)

---

## Technique 6: Counterexamples (Disproving Universal Statements)

To disprove a universal claim ("for all $x$, $P(x)$"), you only need ONE counterexample.

**Claim (FALSE):** Every odd number is prime.

**Counterexample:** $9 = 3 \times 3$ is odd but not prime. $\square$

---

**Claim (FALSE):** For all $n \geq 1$, $n^2 + n + 41$ is prime.

**Counterexample:** Let $n = 40$:
$$40^2 + 40 + 41 = 1600 + 40 + 41 = 1681 = 41^2$$

Not prime. $\square$

(This formula actually gives primes for $n = 0$ through $n = 39$, which makes the false claim tempting!)

---

**Claim (FALSE):** If $a \mid bc$, then $a \mid b$ or $a \mid c$.

**Counterexample:** Let $a = 6$, $b = 4$, $c = 3$.
- $bc = 12$ and $6 \mid 12$ ✓
- But $6 \nmid 4$ and $6 \nmid 3$. $\square$

---

## Choosing the Right Technique

| Situation | Technique |
|-----------|-----------|
| Can build from hypothesis to conclusion step by step | Direct Proof |
| The conclusion is hard to approach directly | Contrapositive |
| The statement says something does NOT exist or is NOT possible | Contradiction |
| The domain naturally splits into distinct cases | Proof by Cases |
| Need to show something exists | Existence Proof (constructive or non-constructive) |
| Want to disprove a universal claim | Counterexample |

---

## Code: Verify Claims Programmatically

While programs can't replace formal proofs, they can verify specific cases, find counterexamples, and build intuition.

```python
"""
Proof Verification Tools
Demonstrates computational approaches to testing mathematical claims.
"""

import math

def verify_even_sum(num_tests=1000):
    """Direct proof verification: sum of two evens is even."""
    import random
    for _ in range(num_tests):
        a = random.randint(-10000, 10000) * 2  # guaranteed even
        b = random.randint(-10000, 10000) * 2  # guaranteed even
        result = a + b
        if result % 2 != 0:
            return f"COUNTEREXAMPLE FOUND: {a} + {b} = {result}"
    return f"Verified for {num_tests} random cases: sum of two evens is always even"


def verify_sqrt2_irrational(max_denominator=100000):
    """
    Attempt to find a rational approximation of sqrt(2).
    Shows that no fraction a/b exactly equals sqrt(2).
    """
    sqrt2 = math.sqrt(2)
    closest_error = float('inf')
    closest_fraction = None

    for b in range(1, max_denominator + 1):
        a = round(sqrt2 * b)
        error = abs(a / b - sqrt2)
        if error < closest_error:
            closest_error = error
            closest_fraction = (a, b)

    a, b = closest_fraction
    print(f"Closest fraction found: {a}/{b}")
    print(f"  Value: {a/b:.15f}")
    print(f"  sqrt(2): {sqrt2:.15f}")
    print(f"  Error: {closest_error:.2e}")
    print(f"  Exact match? {'YES' if closest_error == 0 else 'NO (never will be!)'}")


def find_primes_counterexample():
    """
    If there were finitely many primes, their product + 1
    would contradict the assumption. Let's see this in action.
    """
    primes = [2, 3, 5, 7, 11, 13]
    product_plus_one = math.prod(primes) + 1

    print(f"Primes in our 'complete' list: {primes}")
    print(f"Product + 1 = {product_plus_one}")

    # Check if any prime in our list divides it
    for p in primes:
        if product_plus_one % p == 0:
            print(f"  {p} divides {product_plus_one}? YES")
        else:
            print(f"  {p} divides {product_plus_one}? NO")

    # Factor the number
    n = product_plus_one
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)

    print(f"  Actual factors: {factors}")
    print(f"  New prime(s) found NOT in original list: "
          f"{[f for f in set(factors) if f not in primes]}")


def test_universal_claim():
    """
    Test: Is n^2 + n + 41 always prime?
    Find the counterexample!
    """
    print("Testing: n^2 + n + 41 is prime for all n >= 0")
    print()

    def is_prime(n):
        if n < 2:
            return False
        for i in range(2, int(math.sqrt(n)) + 1):
            if n % i == 0:
                return False
        return True

    for n in range(50):
        value = n**2 + n + 41
        prime = is_prime(value)
        if not prime:
            print(f"  COUNTEREXAMPLE at n={n}: {n}^2 + {n} + 41 = {value}")
            # Show factorization
            for d in range(2, value):
                if value % d == 0:
                    print(f"    {value} = {d} x {value // d}")
                    break
            return n
        else:
            if n < 5 or n == 39:
                print(f"  n={n}: {value} is prime ✓")

    return None


# Run demonstrations
print("=" * 50)
print("PROOF VERIFICATION DEMONSTRATIONS")
print("=" * 50)

print("\n1. Verifying Even Sum Property (Direct Proof)")
print("-" * 40)
print(verify_even_sum())

print("\n2. Testing sqrt(2) Irrationality")
print("-" * 40)
verify_sqrt2_irrational()

print("\n3. Euclid's Proof in Action")
print("-" * 40)
find_primes_counterexample()

print("\n4. Finding Counterexamples")
print("-" * 40)
test_universal_claim()
```

```javascript
/**
 * Proof Verification Tools - JavaScript
 * Computationally verify mathematical claims and find counterexamples.
 */

// --- Direct Proof Verification ---
function verifyOddProduct(numTests = 10000) {
  // Verify: product of two odd numbers is always odd
  let verified = 0;

  for (let i = 0; i < numTests; i++) {
    const a = Math.floor(Math.random() * 10000) * 2 + 1; // odd
    const b = Math.floor(Math.random() * 10000) * 2 + 1; // odd
    const product = a * b;

    if (product % 2 === 0) {
      console.log(`COUNTEREXAMPLE: ${a} * ${b} = ${product} (even!)`);
      return false;
    }
    verified++;
  }

  console.log(`Verified: product of two odds is odd (${verified} tests)`);
  return true;
}

// --- Proof by Contradiction: Infinite Primes ---
function euclidProofDemo(primeList) {
  // Given a "complete" list of primes, find a contradiction
  const product = primeList.reduce((acc, p) => acc * p, 1);
  const N = product + 1;

  console.log(`\nAssumed all primes: [${primeList}]`);
  console.log(`Product + 1 = ${N}`);

  // Show N is not divisible by any prime in the list
  const divisible = primeList.filter((p) => N % p === 0);
  console.log(`Divisible by listed primes? ${divisible.length > 0 ? divisible : "NONE"}`);

  // Find actual smallest prime factor
  for (let d = 2; d * d <= N; d++) {
    if (N % d === 0) {
      console.log(`Smallest prime factor: ${d} (NOT in our list!) → Contradiction!`);
      return;
    }
  }
  console.log(`${N} is itself prime (NOT in our list!) → Contradiction!`);
}

// --- Counterexample Finder ---
function findCounterexample(claim, maxN = 1000) {
  // Test a universal claim and find first counterexample
  for (let n = 0; n <= maxN; n++) {
    if (!claim(n)) {
      return n;
    }
  }
  return null; // No counterexample found in range
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// --- Run Demonstrations ---
console.log("=== Proof Verification (JavaScript) ===\n");

// 1. Direct proof verification
console.log("1. Odd × Odd = Odd (Direct Proof Check)");
verifyOddProduct();

// 2. Contradiction demo
console.log("\n2. Euclid's Infinite Primes (Contradiction)");
euclidProofDemo([2, 3, 5, 7, 11, 13]);

// 3. Finding counterexamples
console.log("\n3. Counterexample Search");

// False claim: all primes are odd
const ce1 = findCounterexample((n) => {
  if (!isPrime(n)) return true; // skip non-primes
  return n % 2 !== 0; // claim: prime => odd
});
console.log(`"All primes are odd" → Counterexample: ${ce1}`);

// False claim: n^2 + n + 41 is always prime
const ce2 = findCounterexample((n) => isPrime(n * n + n + 41));
console.log(`"n²+n+41 is always prime" → Counterexample: n=${ce2}, value=${ce2 * ce2 + ce2 + 41}`);
```

```cpp
#include <iostream>
#include <vector>
#include <cmath>
#include <numeric>

/**
 * Proof Verification Tools - C++
 * Demonstrates computational proof verification.
 */

bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

// Verify direct proof: sum of two evens is even
void verifyEvenSum() {
    std::cout << "1. Direct Proof: Even + Even = Even\n";
    bool allPassed = true;

    for (int a = -100; a <= 100; a += 2) {
        for (int b = -100; b <= 100; b += 2) {
            if ((a + b) % 2 != 0) {
                std::cout << "   COUNTEREXAMPLE: " << a << " + " << b << "\n";
                allPassed = false;
            }
        }
    }

    if (allPassed) {
        std::cout << "   Verified for all even pairs in [-100, 100]\n";
    }
}

// Euclid's proof of infinite primes
void euclidProofDemo() {
    std::cout << "\n2. Contradiction: Infinite Primes\n";
    std::vector<int> primes = {2, 3, 5, 7, 11, 13};

    long long product = 1;
    for (int p : primes) product *= p;
    long long N = product + 1;

    std::cout << "   Assumed complete list: {2,3,5,7,11,13}\n";
    std::cout << "   Product + 1 = " << N << "\n";

    // Check divisibility
    for (int p : primes) {
        std::cout << "   " << N << " % " << p << " = " << (N % p) << "\n";
    }

    // Find actual factors
    std::cout << "   Prime factorization of " << N << ": ";
    long long temp = N;
    for (long long d = 2; d * d <= temp; d++) {
        while (temp % d == 0) {
            std::cout << d << " ";
            temp /= d;
        }
    }
    if (temp > 1) std::cout << temp;
    std::cout << "\n   → Contains primes NOT in original list!\n";
}

// Find counterexample to n^2 + n + 41 being always prime
void findCounterexample() {
    std::cout << "\n3. Counterexample: n^2 + n + 41\n";

    for (int n = 0; n < 50; n++) {
        long long value = (long long)n * n + n + 41;
        if (!isPrime(value)) {
            std::cout << "   First counterexample at n=" << n << "\n";
            std::cout << "   " << n << "^2 + " << n << " + 41 = " << value << "\n";

            // Show factorization
            for (long long d = 2; d * d <= value; d++) {
                if (value % d == 0) {
                    std::cout << "   " << value << " = " << d << " × " << value / d << "\n";
                    break;
                }
            }
            return;
        }
    }
}

int main() {
    std::cout << "=== Proof Verification (C++) ===\n\n";
    verifyEvenSum();
    euclidProofDemo();
    findCounterexample();
    return 0;
}
```

---

## Common Mistakes in Proofs

| Mistake | Example | Fix |
|---------|---------|-----|
| Assuming what you're trying to prove | "Assume $\sqrt{2}$ is irrational..." when that's the goal | Use contradiction: assume the OPPOSITE |
| Not covering all cases | Proving for positive $n$ but forgetting $n = 0$ | List all cases explicitly |
| Using examples as proof | "It works for $n = 1, 2, 3$, so it's always true" | Examples verify but don't prove; use a general argument |
| Dividing by zero | Dividing both sides by $(a - b)$ when $a = b$ | Always check denominators aren't zero |
| Circular reasoning | Using the conclusion as a step in the proof | Trace each step back to premises only |

---

## Proof Writing Tips

1. **State what you're proving** clearly at the beginning.
2. **Declare your technique**: "We proceed by contradiction..." or "We prove the contrapositive..."
3. **Define your variables**: "Let $n$ be an arbitrary integer..."
4. **Justify every step**: Each statement should follow from a definition, axiom, or previous step.
5. **End clearly**: Use $\square$ (QED) to signal the proof is complete.
6. **Be precise with quantifiers**: "For all" vs "there exists" changes everything.

---

## Key Takeaways

- **Direct proof** is your default tool — try it first when you can build from hypothesis to conclusion.
- **Proof by contradiction** is powerful for impossibility results (something CANNOT exist or CANNOT happen).
- **Contrapositive** is a lifesaver when the direct approach is awkward — it's logically equivalent but often algebraically simpler.
- **Proof by cases** is ideal when the domain naturally partitions into distinct scenarios.
- **Constructive existence proofs** are preferred (they give you an actual example), but non-constructive proofs are valid too.
- **One counterexample kills a universal claim** — you never need to check every case to disprove something.
- Programs can find counterexamples and verify finite cases, but formal proofs remain necessary for universal truths over infinite domains.
- Choosing the right technique is half the battle — match the structure of your claim to the appropriate method.
