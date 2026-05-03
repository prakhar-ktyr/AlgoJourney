---
title: Divisibility & Prime Numbers
---

# Divisibility & Prime Numbers

Divisibility and prime numbers form the bedrock of number theory. These concepts underpin cryptography, computer science algorithms, and much of modern mathematics. In this lesson, we explore the division algorithm, divisibility properties, prime numbers, and efficient algorithms for finding and testing primes.

---

## The Division Algorithm

The **division algorithm** is a fundamental theorem that formalizes the process of dividing one integer by another.

**Theorem (Division Algorithm):** For any integers $a$ and $b$ with $b > 0$, there exist unique integers $q$ (quotient) and $r$ (remainder) such that:

$$a = bq + r, \quad 0 \leq r < b$$

- $a$ is the **dividend**
- $b$ is the **divisor**
- $q$ is the **quotient**: $q = \lfloor a / b \rfloor$
- $r$ is the **remainder**: $r = a - bq = a \mod b$

**Examples:**

- $17 = 5 \cdot 3 + 2$ → quotient $q = 3$, remainder $r = 2$
- $-11 = 4 \cdot (-3) + 1$ → quotient $q = -3$, remainder $r = 1$
- $20 = 4 \cdot 5 + 0$ → quotient $q = 5$, remainder $r = 0$

Notice that the remainder $r$ is always non-negative, even when $a$ is negative.

---

## Divisibility

**Definition:** An integer $a$ **divides** an integer $b$, written $a \mid b$, if there exists an integer $k$ such that:

$$b = ak$$

We say "$a$ is a divisor of $b$" or "$b$ is a multiple of $a$."

If $a$ does not divide $b$, we write $a \nmid b$.

**Examples:**

- $3 \mid 12$ because $12 = 3 \cdot 4$
- $7 \mid 49$ because $49 = 7 \cdot 7$
- $5 \nmid 13$ because there is no integer $k$ with $13 = 5k$

---

## Properties of Divisibility

Divisibility satisfies several important properties:

**1. Reflexivity:** For every nonzero integer $a$, $a \mid a$ (since $a = a \cdot 1$).

**2. Transitivity:** If $a \mid b$ and $b \mid c$, then $a \mid c$.

*Proof:* If $b = ak_1$ and $c = bk_2$, then $c = a(k_1 k_2)$, so $a \mid c$. $\square$

**3. Linear Combinations:** If $a \mid b$ and $a \mid c$, then $a \mid (bx + cy)$ for any integers $x, y$.

*Proof:* If $b = ak_1$ and $c = ak_2$, then $bx + cy = a(k_1 x + k_2 y)$, so $a \mid (bx + cy)$. $\square$

**4. Multiplication:** If $a \mid b$, then $a \mid bc$ for any integer $c$.

**5. Ordering:** If $a \mid b$ and $b \neq 0$, then $|a| \leq |b|$.

**6. Divisibility by 1:** $1 \mid a$ for every integer $a$.

**7. Zero divisibility:** $a \mid 0$ for every nonzero integer $a$ (since $0 = a \cdot 0$).

---

## Prime Numbers

**Definition:** An integer $p > 1$ is **prime** if its only positive divisors are $1$ and $p$ itself.

An integer $n > 1$ that is not prime is called **composite**. A composite number has at least one divisor other than $1$ and itself.

**Examples:**

- Primes: $2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, \ldots$
- Composites: $4, 6, 8, 9, 10, 12, 14, 15, 16, 18, \ldots$

Note: $1$ is neither prime nor composite by convention.

**Key observation:** $2$ is the only even prime number. Every even number greater than $2$ is divisible by $2$, hence composite.

---

## Fundamental Theorem of Arithmetic

**Theorem:** Every integer $n > 1$ can be expressed as a product of prime numbers in exactly one way (up to the order of the factors).

$$n = p_1^{e_1} \cdot p_2^{e_2} \cdot p_3^{e_3} \cdots p_k^{e_k}$$

where $p_1 < p_2 < \cdots < p_k$ are primes and $e_i \geq 1$.

**Examples:**

- $60 = 2^2 \cdot 3 \cdot 5$
- $100 = 2^2 \cdot 5^2$
- $504 = 2^3 \cdot 3^2 \cdot 7$
- $1001 = 7 \cdot 11 \cdot 13$

This unique factorization is the reason primes are called the "building blocks" of the integers.

---

## Infinitely Many Primes (Euclid's Proof)

**Theorem:** There are infinitely many prime numbers.

**Proof (Euclid, c. 300 BCE):**

Suppose, for contradiction, that there are only finitely many primes: $p_1, p_2, \ldots, p_n$.

Consider the number:

$$N = p_1 \cdot p_2 \cdot p_3 \cdots p_n + 1$$

Now $N > 1$, so by the fundamental theorem of arithmetic, $N$ has a prime factor $p$.

For each $p_i$ in our list, when we divide $N$ by $p_i$, we get remainder $1$ (since $N = p_1 p_2 \cdots p_n + 1$). So $p_i \nmid N$ for all $i$.

Therefore $p$ is not in our list, contradicting the assumption that we listed all primes. $\square$

This elegant proof demonstrates that no finite list can contain all primes.

---

## Sieve of Eratosthenes

The **Sieve of Eratosthenes** is an ancient algorithm for finding all prime numbers up to a given limit $n$.

**Algorithm:**

1. Create a list of integers from $2$ to $n$.
2. Start with the smallest unmarked number ($p = 2$).
3. Mark all multiples of $p$ (starting from $p^2$) as composite.
4. Find the next unmarked number and repeat step 3.
5. Stop when $p^2 > n$.
6. All unmarked numbers are prime.

**Why start from $p^2$?** All smaller multiples of $p$ have already been marked by smaller primes.

**Time complexity:** $O(n \log \log n)$ — remarkably efficient for generating all primes up to $n$.

---

## Prime Testing Basics

To check whether a number $n$ is prime, we only need to test divisibility by primes up to $\sqrt{n}$.

**Why?** If $n = ab$ where both $a > \sqrt{n}$ and $b > \sqrt{n}$, then $ab > n$, a contradiction. So at least one factor must be $\leq \sqrt{n}$.

**Trial Division Algorithm:**

1. If $n < 2$, it's not prime.
2. If $n = 2$ or $n = 3$, it's prime.
3. If $n$ is even or divisible by $3$, it's not prime.
4. Check divisors of the form $6k \pm 1$ up to $\sqrt{n}$.

The $6k \pm 1$ optimization works because all primes greater than $3$ are of the form $6k + 1$ or $6k - 1$ (since $6k, 6k+2, 6k+3, 6k+4$ are all divisible by $2$ or $3$).

---

## Code: Sieve of Eratosthenes

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<int> sieveOfEratosthenes(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = isPrime[1] = false;

    for (int p = 2; p * p <= n; p++) {
        if (isPrime[p]) {
            for (int multiple = p * p; multiple <= n; multiple += p) {
                isPrime[multiple] = false;
            }
        }
    }

    vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (isPrime[i]) primes.push_back(i);
    }
    return primes;
}

int main() {
    int n = 50;
    vector<int> primes = sieveOfEratosthenes(n);
    cout << "Primes up to " << n << ": ";
    for (int p : primes) cout << p << " ";
    cout << endl;
    // Output: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class Program {
    static List<int> SieveOfEratosthenes(int n) {
        bool[] isPrime = new bool[n + 1];
        Array.Fill(isPrime, true);
        isPrime[0] = isPrime[1] = false;

        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                for (int multiple = p * p; multiple <= n; multiple += p) {
                    isPrime[multiple] = false;
                }
            }
        }

        List<int> primes = new List<int>();
        for (int i = 2; i <= n; i++) {
            if (isPrime[i]) primes.Add(i);
        }
        return primes;
    }

    static void Main() {
        int n = 50;
        List<int> primes = SieveOfEratosthenes(n);
        Console.Write($"Primes up to {n}: ");
        Console.WriteLine(string.Join(" ", primes));
        // Output: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
    }
}
```

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SieveOfEratosthenes {
    public static List<Integer> sieve(int n) {
        boolean[] isPrime = new boolean[n + 1];
        Arrays.fill(isPrime, true);
        isPrime[0] = isPrime[1] = false;

        for (int p = 2; p * p <= n; p++) {
            if (isPrime[p]) {
                for (int multiple = p * p; multiple <= n; multiple += p) {
                    isPrime[multiple] = false;
                }
            }
        }

        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (isPrime[i]) primes.add(i);
        }
        return primes;
    }

    public static void main(String[] args) {
        int n = 50;
        List<Integer> primes = sieve(n);
        System.out.print("Primes up to " + n + ": ");
        primes.forEach(p -> System.out.print(p + " "));
        // Output: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
    }
}
```

```python
def sieve_of_eratosthenes(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False

    p = 2
    while p * p <= n:
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False
        p += 1

    return [i for i in range(2, n + 1) if is_prime[i]]

n = 50
primes = sieve_of_eratosthenes(n)
print(f"Primes up to {n}: {primes}")
# Output: Primes up to 50: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

```javascript
function sieveOfEratosthenes(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;

  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let multiple = p * p; multiple <= n; multiple += p) {
        isPrime[multiple] = false;
      }
    }
  }

  const primes = [];
  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) primes.push(i);
  }
  return primes;
}

const n = 50;
const primes = sieveOfEratosthenes(n);
console.log(`Primes up to ${n}:`, primes);
// Output: Primes up to 50: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
```

---

## Code: Primality Check

```cpp
#include <iostream>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2 || n == 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;

    for (int i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    int testNumbers[] = {1, 2, 7, 15, 23, 100, 997};
    for (int n : testNumbers) {
        cout << n << " is " << (isPrime(n) ? "prime" : "not prime") << endl;
    }
    return 0;
}
```

```csharp
using System;

class Program {
    static bool IsPrime(int n) {
        if (n < 2) return false;
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;

        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }

    static void Main() {
        int[] testNumbers = { 1, 2, 7, 15, 23, 100, 997 };
        foreach (int n in testNumbers) {
            Console.WriteLine($"{n} is {(IsPrime(n) ? "prime" : "not prime")}");
        }
    }
}
```

```java
public class PrimalityCheck {
    public static boolean isPrime(int n) {
        if (n < 2) return false;
        if (n == 2 || n == 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;

        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        int[] testNumbers = {1, 2, 7, 15, 23, 100, 997};
        for (int n : testNumbers) {
            System.out.println(n + " is " + (isPrime(n) ? "prime" : "not prime"));
        }
    }
}
```

```python
def is_prime(n):
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False

    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

test_numbers = [1, 2, 7, 15, 23, 100, 997]
for n in test_numbers:
    status = "prime" if is_prime(n) else "not prime"
    print(f"{n} is {status}")
```

```javascript
function isPrime(n) {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;

  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

const testNumbers = [1, 2, 7, 15, 23, 100, 997];
testNumbers.forEach((n) => {
  const status = isPrime(n) ? "prime" : "not prime";
  console.log(`${n} is ${status}`);
});
```

---

## Worked Examples

**Example 1:** Find the prime factorization of $360$.

$$360 = 2 \cdot 180 = 2^2 \cdot 90 = 2^3 \cdot 45 = 2^3 \cdot 3 \cdot 15 = 2^3 \cdot 3^2 \cdot 5$$

**Example 2:** Is $91$ prime?

We check primes up to $\sqrt{91} \approx 9.5$: check $2, 3, 5, 7$.
- $91 / 7 = 13$ → $91 = 7 \times 13$

So $91$ is composite.

**Example 3:** Use the sieve to find primes up to $30$.

Start: $2, 3, 4, 5, 6, 7, 8, 9, 10, \ldots, 30$

- Cross out multiples of $2$ (from $4$): ~~4~~, ~~6~~, ~~8~~, ~~10~~, ~~12~~, ~~14~~, ~~16~~, ~~18~~, ~~20~~, ~~22~~, ~~24~~, ~~26~~, ~~28~~, ~~30~~
- Cross out multiples of $3$ (from $9$): ~~9~~, ~~15~~, ~~21~~, ~~27~~
- Cross out multiples of $5$ (from $25$): ~~25~~
- $7^2 = 49 > 30$, so we stop.

Primes: $2, 3, 5, 7, 11, 13, 17, 19, 23, 29$

---

## Common Divisibility Rules

These handy rules help quickly determine divisibility:

| Divisor | Rule |
|---------|------|
| $2$ | Last digit is even |
| $3$ | Sum of digits is divisible by $3$ |
| $4$ | Last two digits form a number divisible by $4$ |
| $5$ | Last digit is $0$ or $5$ |
| $6$ | Divisible by both $2$ and $3$ |
| $9$ | Sum of digits is divisible by $9$ |
| $11$ | Alternating sum of digits is divisible by $11$ |

**Example:** Is $5,\!346$ divisible by $3$?

Sum of digits: $5 + 3 + 4 + 6 = 18$, and $3 \mid 18$, so yes.

---

## Key Takeaways

- The **division algorithm** guarantees unique quotient and remainder: $a = bq + r$ with $0 \leq r < b$.
- **Divisibility** ($a \mid b$) means $b = ak$ for some integer $k$; it is transitive and closed under linear combinations.
- A **prime** number $p > 1$ has no positive divisors other than $1$ and $p$.
- The **fundamental theorem of arithmetic** states every integer $> 1$ has a unique prime factorization.
- There are **infinitely many primes** (Euclid's proof by contradiction).
- The **Sieve of Eratosthenes** efficiently finds all primes up to $n$ in $O(n \log \log n)$ time.
- To test primality of $n$, check divisibility only up to $\sqrt{n}$; the $6k \pm 1$ optimization skips obvious non-primes.
- These concepts are foundational for cryptography (RSA), hashing, and many algorithms in computer science.
