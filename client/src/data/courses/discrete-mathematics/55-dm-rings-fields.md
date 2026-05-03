---
title: Rings & Fields
---

# Rings & Fields

Groups have one operation. Rings add a second, and fields demand even more structure. These algebraic structures underpin modern cryptography, error-correcting codes, and computer algebra. In this lesson we build up from rings to fields, with examples at every step.

---

## Ring: Set with Two Operations

A **ring** $(R, +, \cdot)$ is a set $R$ equipped with two binary operations — addition ($+$) and multiplication ($\cdot$) — satisfying the ring axioms.

Intuitively, a ring is a structure where you can add, subtract, and multiply (but not necessarily divide).

---

## Ring Axioms

A ring $(R, +, \cdot)$ must satisfy:

### (R1) Abelian Group under Addition

$(R, +)$ is an abelian group:
- Closure: $a + b \in R$
- Associativity: $(a + b) + c = a + (b + c)$
- Identity: There exists $0 \in R$ with $a + 0 = a$
- Inverse: For every $a$, there exists $-a$ with $a + (-a) = 0$
- Commutativity: $a + b = b + a$

### (R2) Monoid under Multiplication

$(R, \cdot)$ is a monoid (closed and associative, with identity):
- Closure: $a \cdot b \in R$
- Associativity: $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
- Identity: There exists $1 \in R$ with $a \cdot 1 = 1 \cdot a = a$

> Note: Some authors don't require a multiplicative identity. A ring with $1$ is called a **ring with unity** or **unital ring**.

### (R3) Distributivity

Multiplication distributes over addition:

$$a \cdot (b + c) = a \cdot b + a \cdot c$$
$$(a + b) \cdot c = a \cdot c + b \cdot c$$

### Summary

| Property | Requirement |
|----------|-------------|
| $(R, +)$ | Abelian group |
| $(R, \cdot)$ | Monoid (associative with identity) |
| Distributivity | $a(b+c) = ab + ac$ and $(a+b)c = ac + bc$ |

---

## Examples of Rings

### Example 1: $(\mathbb{Z}, +, \cdot)$ — The Integers

The most familiar ring:
- Additive identity: $0$
- Multiplicative identity: $1$
- Commutative: $ab = ba$ ✓
- Not a field: $2$ has no multiplicative inverse in $\mathbb{Z}$

### Example 2: $(\mathbb{Z}_n, +, \cdot)$ — Integers mod $n$

- Set: $\{0, 1, 2, \ldots, n-1\}$
- Addition and multiplication modulo $n$
- Additive identity: $0$, multiplicative identity: $1$
- Always commutative
- May have zero divisors (e.g., in $\mathbb{Z}_6$: $2 \cdot 3 = 0$)

### Example 3: Matrix Rings

The set of $n \times n$ matrices over a ring $R$, denoted $M_n(R)$:
- Addition: matrix addition
- Multiplication: matrix multiplication
- **Not commutative** for $n \geq 2$ (since $AB \neq BA$ in general)
- Has zero divisors

### Example 4: Polynomial Rings

$R[x]$ = polynomials with coefficients in ring $R$:
- Addition: add corresponding coefficients
- Multiplication: convolution (distribute and collect terms)
- Example: $\mathbb{Z}[x]$, $\mathbb{R}[x]$, $\mathbb{Z}_p[x]$

### Example 5: Boolean Ring

$(\{0, 1\}, \oplus, \wedge)$ where $\oplus$ is XOR and $\wedge$ is AND:
- Additive group: $(\{0,1\}, \oplus) \cong \mathbb{Z}_2$
- Multiplication: AND
- Every element is idempotent: $a^2 = a$

---

## Commutative Rings

A ring is **commutative** if multiplication is commutative:

$$a \cdot b = b \cdot a \quad \text{for all } a, b \in R$$

| Ring | Commutative? |
|------|-------------|
| $\mathbb{Z}$ | Yes |
| $\mathbb{Z}_n$ | Yes |
| $\mathbb{R}[x]$ | Yes |
| $M_n(\mathbb{R})$, $n \geq 2$ | No |
| Quaternions $\mathbb{H}$ | No |

Most rings in number theory and cryptography are commutative.

---

## Rings with Unity

A ring has **unity** (or has an **identity element for multiplication**) if there exists $1 \in R$ such that:

$$1 \cdot a = a \cdot 1 = a \quad \text{for all } a \in R$$

We require $1 \neq 0$ (otherwise $R = \{0\}$, the trivial ring).

A **unit** in a ring is an element that has a multiplicative inverse. The set of units forms a group under multiplication:

$$R^* = \{a \in R : \exists b \in R, ab = ba = 1\}$$

Example: In $\mathbb{Z}$, the units are $\{1, -1\}$. In $\mathbb{Z}_n$, the units are $\mathbb{Z}_n^*$.

---

## Zero Divisors

An element $a \neq 0$ in a ring $R$ is a **zero divisor** if there exists $b \neq 0$ in $R$ such that:

$$a \cdot b = 0 \quad \text{or} \quad b \cdot a = 0$$

### Examples

In $\mathbb{Z}_6$:
- $2 \cdot 3 = 6 \equiv 0 \pmod{6}$
- Both 2 and 3 are zero divisors

In $\mathbb{Z}_{12}$:
- $3 \cdot 4 = 0$, $4 \cdot 6 = 0$, $6 \cdot 2 = 0$
- Zero divisors: $\{2, 3, 4, 6, 8, 9, 10\}$

In $\mathbb{Z}_7$: no zero divisors (since 7 is prime).

---

## Integral Domains

An **integral domain** is a commutative ring with unity that has **no zero divisors**.

Formally, $(D, +, \cdot)$ is an integral domain if:
1. It is a commutative ring with unity
2. For all $a, b \in D$: $ab = 0 \implies a = 0$ or $b = 0$

### Cancellation Law

In an integral domain, we have the **cancellation law**:

$$ab = ac \text{ and } a \neq 0 \implies b = c$$

This is precisely because there are no zero divisors.

### Examples

| Structure | Integral Domain? | Reason |
|-----------|-----------------|--------|
| $\mathbb{Z}$ | Yes | No zero divisors |
| $\mathbb{Z}_p$ ($p$ prime) | Yes | No zero divisors |
| $\mathbb{Z}_n$ ($n$ composite) | No | Has zero divisors |
| $\mathbb{Q}$, $\mathbb{R}$, $\mathbb{C}$ | Yes | Fields are integral domains |
| $\mathbb{Z}[x]$ | Yes | Inherited from $\mathbb{Z}$ |
| $M_2(\mathbb{R})$ | No | Not commutative, has zero divisors |

---

## Fields

A **field** $(F, +, \cdot)$ is a commutative ring with unity in which every nonzero element has a multiplicative inverse:

$$\forall a \neq 0 \in F, \exists a^{-1} \in F : a \cdot a^{-1} = 1$$

Equivalently, a field is a set where you can add, subtract, multiply, and divide (except by zero).

### Field Axioms (Complete)

$(F, +, \cdot)$ is a field if:

| # | Axiom | Statement |
|---|-------|-----------|
| F1 | Additive closure | $a + b \in F$ |
| F2 | Additive associativity | $(a+b)+c = a+(b+c)$ |
| F3 | Additive identity | $\exists 0: a + 0 = a$ |
| F4 | Additive inverse | $\exists (-a): a + (-a) = 0$ |
| F5 | Additive commutativity | $a + b = b + a$ |
| F6 | Multiplicative closure | $a \cdot b \in F$ |
| F7 | Multiplicative associativity | $(ab)c = a(bc)$ |
| F8 | Multiplicative identity | $\exists 1 \neq 0: a \cdot 1 = a$ |
| F9 | Multiplicative inverse | $\forall a \neq 0, \exists a^{-1}: a \cdot a^{-1} = 1$ |
| F10 | Multiplicative commutativity | $ab = ba$ |
| F11 | Distributivity | $a(b+c) = ab + ac$ |

### Relationship Hierarchy

$$\text{Field} \subset \text{Integral Domain} \subset \text{Commutative Ring} \subset \text{Ring}$$

Every field is an integral domain (no zero divisors because every nonzero element is a unit).

---

## Examples of Fields

### $\mathbb{Q}$ — The Rational Numbers

- Every nonzero rational $\frac{a}{b}$ has inverse $\frac{b}{a}$
- The smallest field containing $\mathbb{Z}$ (the "field of fractions" of $\mathbb{Z}$)

### $\mathbb{R}$ — The Real Numbers

- Complete ordered field
- Foundation of calculus and analysis

### $\mathbb{C}$ — The Complex Numbers

- Algebraically closed: every polynomial has a root
- $\mathbb{C} = \{a + bi : a, b \in \mathbb{R}\}$ where $i^2 = -1$

### $\mathbb{Z}_p$ — Integers mod $p$ (prime)

**Theorem**: $\mathbb{Z}_n$ is a field if and only if $n$ is prime.

**Proof**:
- If $p$ is prime, then $\gcd(a, p) = 1$ for all $a \neq 0$ in $\mathbb{Z}_p$, so every nonzero element has a modular inverse.
- If $n$ is composite, say $n = ab$ with $1 < a, b < n$, then $a \cdot b = 0$ in $\mathbb{Z}_n$, giving zero divisors (so not even an integral domain).

### $GF(p^n)$ — Galois Fields

For every prime $p$ and positive integer $n$, there exists a unique (up to isomorphism) finite field of order $p^n$, denoted $GF(p^n)$ or $\mathbb{F}_{p^n}$.

**Construction**: $GF(p^n) \cong \mathbb{Z}_p[x] / \langle f(x) \rangle$ where $f(x)$ is an irreducible polynomial of degree $n$ over $\mathbb{Z}_p$.

**Example**: $GF(2^3) = GF(8)$

Using irreducible polynomial $f(x) = x^3 + x + 1$ over $\mathbb{Z}_2$:
- Elements are polynomials of degree $\leq 2$: $\{0, 1, x, x+1, x^2, x^2+1, x^2+x, x^2+x+1\}$
- 8 elements total
- Addition: XOR of coefficients
- Multiplication: polynomial multiplication mod $f(x)$

### Finite Fields — Key Facts

- A finite field exists if and only if its order is $p^n$ for some prime $p$ and positive integer $n$
- All finite fields of the same order are isomorphic
- The multiplicative group $GF(q)^*$ is always **cyclic** of order $q - 1$
- The **characteristic** of $GF(p^n)$ is $p$ (the smallest positive integer $k$ with $\underbrace{1 + 1 + \cdots + 1}_{k} = 0$)

---

## Applications

### Error-Correcting Codes

Reed-Solomon codes operate over $GF(2^m)$:
- Used in CDs, DVDs, QR codes, deep-space communication
- Polynomial evaluation and interpolation over finite fields
- Can correct up to $t$ symbol errors where $2t = n - k$ (redundancy)

### Cryptography

1. **RSA**: Uses arithmetic in $\mathbb{Z}_n$ where $n = pq$
2. **Elliptic Curve Cryptography (ECC)**: Curves over $GF(p)$ or $GF(2^m)$
3. **AES (Advanced Encryption Standard)**: All operations in $GF(2^8)$
4. **Diffie-Hellman**: Discrete logarithm in $\mathbb{Z}_p^*$ or $GF(p^n)^*$

### Computer Algebra

- Polynomial factoring over finite fields
- Linear algebra over $GF(2)$ (binary matrices)
- Gröbner bases for solving polynomial systems

---

## Code: Verify Field Axioms for $\mathbb{Z}_p$

```cpp
#include <iostream>
#include <vector>
using namespace std;

int modPow(int base, int exp, int mod) {
    int result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp % 2 == 1) result = (result * base) % mod;
        exp /= 2;
        base = (base * base) % mod;
    }
    return result;
}

int modInverse(int a, int p) {
    return modPow(a, p - 2, p); // Fermat's little theorem
}

bool verifyFieldAxioms(int p) {
    // Check all nonzero elements have multiplicative inverses
    for (int a = 1; a < p; a++) {
        int inv = modInverse(a, p);
        if ((a * inv) % p != 1) return false;
    }

    // Check no zero divisors
    for (int a = 1; a < p; a++) {
        for (int b = 1; b < p; b++) {
            if ((a * b) % p == 0) return false;
        }
    }

    // Check distributivity
    for (int a = 0; a < p; a++) {
        for (int b = 0; b < p; b++) {
            for (int c = 0; c < p; c++) {
                int lhs = (a * ((b + c) % p)) % p;
                int rhs = ((a * b) % p + (a * c) % p) % p;
                if (lhs != rhs) return false;
            }
        }
    }

    return true;
}

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

int main() {
    for (int n = 2; n <= 20; n++) {
        bool isField = verifyFieldAxioms(n);
        cout << "Z_" << n << " is a field: " << (isField ? "Yes" : "No")
             << " (prime: " << (isPrime(n) ? "Yes" : "No") << ")" << endl;
    }

    // Show multiplicative inverses in Z_7
    int p = 7;
    cout << "\nMultiplicative inverses in Z_" << p << ":" << endl;
    for (int a = 1; a < p; a++) {
        cout << "  " << a << "^(-1) = " << modInverse(a, p) << endl;
    }

    return 0;
}
```

```csharp
using System;

class FieldVerification {
    static int ModPow(int baseVal, int exp, int mod) {
        long result = 1;
        long b = baseVal % mod;
        while (exp > 0) {
            if (exp % 2 == 1) result = (result * b) % mod;
            exp /= 2;
            b = (b * b) % mod;
        }
        return (int)result;
    }

    static int ModInverse(int a, int p) {
        return ModPow(a, p - 2, p); // Fermat's little theorem
    }

    static bool VerifyFieldAxioms(int p) {
        // Check multiplicative inverses for all nonzero elements
        for (int a = 1; a < p; a++) {
            int inv = ModInverse(a, p);
            if ((a * inv) % p != 1) return false;
        }

        // Check no zero divisors
        for (int a = 1; a < p; a++) {
            for (int b = 1; b < p; b++) {
                if ((a * b) % p == 0) return false;
            }
        }

        // Check distributivity
        for (int a = 0; a < p; a++) {
            for (int b = 0; b < p; b++) {
                for (int c = 0; c < p; c++) {
                    int lhs = (a * ((b + c) % p)) % p;
                    int rhs = ((a * b) % p + (a * c) % p) % p;
                    if (lhs != rhs) return false;
                }
            }
        }

        return true;
    }

    static bool IsPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    static void Main() {
        for (int n = 2; n <= 20; n++) {
            bool isField = VerifyFieldAxioms(n);
            Console.WriteLine($"Z_{n} is a field: {isField} (prime: {IsPrime(n)})");
        }

        int p = 7;
        Console.WriteLine($"\nMultiplicative inverses in Z_{p}:");
        for (int a = 1; a < p; a++) {
            Console.WriteLine($"  {a}^(-1) = {ModInverse(a, p)}");
        }
    }
}
```

```java
public class FieldVerification {
    static int modPow(int base, int exp, int mod) {
        long result = 1;
        long b = base % mod;
        while (exp > 0) {
            if (exp % 2 == 1) result = (result * b) % mod;
            exp /= 2;
            b = (b * b) % mod;
        }
        return (int) result;
    }

    static int modInverse(int a, int p) {
        return modPow(a, p - 2, p); // Fermat's little theorem
    }

    static boolean verifyFieldAxioms(int p) {
        // Check multiplicative inverses
        for (int a = 1; a < p; a++) {
            int inv = modInverse(a, p);
            if ((a * inv) % p != 1) return false;
        }

        // Check no zero divisors
        for (int a = 1; a < p; a++) {
            for (int b = 1; b < p; b++) {
                if ((a * b) % p == 0) return false;
            }
        }

        // Check distributivity
        for (int a = 0; a < p; a++) {
            for (int b = 0; b < p; b++) {
                for (int c = 0; c < p; c++) {
                    int lhs = (a * ((b + c) % p)) % p;
                    int rhs = ((a * b) % p + (a * c) % p) % p;
                    if (lhs != rhs) return false;
                }
            }
        }

        return true;
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        for (int n = 2; n <= 20; n++) {
            boolean isField = verifyFieldAxioms(n);
            System.out.printf("Z_%d is a field: %b (prime: %b)%n", n, isField, isPrime(n));
        }

        int p = 7;
        System.out.printf("%nMultiplicative inverses in Z_%d:%n", p);
        for (int a = 1; a < p; a++) {
            System.out.printf("  %d^(-1) = %d%n", a, modInverse(a, p));
        }
    }
}
```

```python
def mod_pow(base, exp, mod):
    """Compute base^exp mod mod efficiently."""
    result = 1
    base = base % mod
    while exp > 0:
        if exp % 2 == 1:
            result = (result * base) % mod
        exp //= 2
        base = (base * base) % mod
    return result

def mod_inverse(a, p):
    """Compute modular inverse using Fermat's little theorem."""
    return mod_pow(a, p - 2, p)

def is_prime(n):
    """Check if n is prime."""
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def verify_field_axioms(p):
    """Verify that Z_p satisfies field axioms."""
    # Check multiplicative inverses for all nonzero elements
    for a in range(1, p):
        inv = mod_inverse(a, p)
        if (a * inv) % p != 1:
            return False, f"No inverse for {a}"

    # Check no zero divisors
    for a in range(1, p):
        for b in range(1, p):
            if (a * b) % p == 0:
                return False, f"Zero divisor: {a} * {b} = 0"

    # Check distributivity
    for a in range(p):
        for b in range(p):
            for c in range(p):
                lhs = (a * ((b + c) % p)) % p
                rhs = ((a * b) % p + (a * c) % p) % p
                if lhs != rhs:
                    return False, "Distributivity fails"

    return True, "All field axioms satisfied"

# Test Z_n for n = 2 to 20
print("Field verification:")
for n in range(2, 21):
    valid, msg = verify_field_axioms(n)
    print(f"  Z_{n:2d} is a field: {str(valid):5s} (prime: {is_prime(n)})")

# Show structure of Z_7
p = 7
print(f"\nZ_{p} field structure:")
print(f"  Elements: {{0, 1, ..., {p-1}}}")
print(f"  Multiplicative inverses:")
for a in range(1, p):
    print(f"    {a}^(-1) = {mod_inverse(a, p)}")

# Multiplication table for Z_5
p = 5
print(f"\nMultiplication table for Z_{p}:")
header = "  × |" + "".join(f" {i}" for i in range(p))
print(header)
print("  " + "-" * (len(header) - 2))
for a in range(p):
    row = f"  {a} |" + "".join(f" {(a * b) % p}" for b in range(p))
    print(row)
```

```javascript
function modPow(base, exp, mod) {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  const m = BigInt(mod);
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % m;
    exp /= 2n;
    base = (base * base) % m;
  }
  return Number(result);
}

function modInverse(a, p) {
  return modPow(a, p - 2, p); // Fermat's little theorem
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function verifyFieldAxioms(p) {
  // Check multiplicative inverses
  for (let a = 1; a < p; a++) {
    const inv = modInverse(a, p);
    if ((a * inv) % p !== 1) return false;
  }

  // Check no zero divisors
  for (let a = 1; a < p; a++) {
    for (let b = 1; b < p; b++) {
      if ((a * b) % p === 0) return false;
    }
  }

  // Check distributivity
  for (let a = 0; a < p; a++) {
    for (let b = 0; b < p; b++) {
      for (let c = 0; c < p; c++) {
        const lhs = (a * ((b + c) % p)) % p;
        const rhs = ((a * b) % p + (a * c) % p) % p;
        if (lhs !== rhs) return false;
      }
    }
  }

  return true;
}

// Test Z_n for various n
console.log("Field verification:");
for (let n = 2; n <= 20; n++) {
  const isField = verifyFieldAxioms(n);
  console.log(`  Z_${n} is a field: ${isField} (prime: ${isPrime(n)})`);
}

// Show inverses in Z_7
const p = 7;
console.log(`\nMultiplicative inverses in Z_${p}:`);
for (let a = 1; a < p; a++) {
  console.log(`  ${a}^(-1) = ${modInverse(a, p)}`);
}

// Multiplication table for Z_5
const q = 5;
console.log(`\nMultiplication table for Z_${q}:`);
let header = "  × |";
for (let i = 0; i < q; i++) header += ` ${i}`;
console.log(header);
console.log("  " + "-".repeat(header.length - 2));
for (let a = 0; a < q; a++) {
  let row = `  ${a} |`;
  for (let b = 0; b < q; b++) row += ` ${(a * b) % q}`;
  console.log(row);
}
```

---

## Key Takeaways

1. **A ring** $(R, +, \cdot)$ has two operations: an abelian group under addition, a monoid under multiplication, linked by distributivity.

2. **Commutative rings** have $ab = ba$; **rings with unity** have a multiplicative identity $1$.

3. **Zero divisors** are nonzero elements whose product is zero; their absence defines **integral domains**.

4. **A field** is a commutative ring with unity where every nonzero element has a multiplicative inverse — enabling full arithmetic (add, subtract, multiply, divide).

5. **$\mathbb{Z}_p$ is a field if and only if $p$ is prime**; composite moduli have zero divisors.

6. **Galois fields** $GF(p^n)$ are finite fields of order $p^n$, constructed via irreducible polynomials, and are essential in cryptography and coding theory.

7. The hierarchy is: Field $\subset$ Integral Domain $\subset$ Commutative Ring $\subset$ Ring — each level adds constraints that unlock more algebraic power.
