---
title: Permutations
---

# Permutations

A **permutation** is an ordered arrangement of objects. Unlike combinations (which we'll cover next), the order in which items are selected **matters** in permutations. Choosing {A, B, C} is different from {C, B, A}.

## Motivation

Consider arranging books on a shelf, assigning positions in a race, or scheduling tasks. In each case, the order of selection is significant—making these permutation problems.

---

## Permutations of All $n$ Objects

The number of ways to arrange all $n$ distinct objects in a row is:

$$
n! = n \times (n-1) \times (n-2) \times \cdots \times 2 \times 1
$$

By convention, $0! = 1$.

### Example: Arranging 4 Books

How many ways can you arrange 4 distinct books on a shelf?

- Position 1: 4 choices
- Position 2: 3 choices
- Position 3: 2 choices
- Position 4: 1 choice

$$
4! = 4 \times 3 \times 2 \times 1 = 24
$$

### Example: Seating 6 People in a Row

$$
6! = 720 \text{ arrangements}
$$

---

## Permutations of $r$ Objects from $n$ (Without Repetition)

When selecting and arranging $r$ objects from a set of $n$ distinct objects (where $r \leq n$), the number of permutations is:

$$
P(n, r) = \frac{n!}{(n-r)!} = n \times (n-1) \times (n-2) \times \cdots \times (n-r+1)
$$

This is sometimes written as ${}^nP_r$, $P_r^n$, or $nPr$.

### Derivation

- First position: $n$ choices
- Second position: $n - 1$ choices
- Third position: $n - 2$ choices
- $\vdots$
- $r$-th position: $n - r + 1$ choices

$$
P(n, r) = n \times (n-1) \times \cdots \times (n - r + 1) = \frac{n!}{(n-r)!}
$$

### Example: Gold, Silver, Bronze

In a race with 10 runners, how many ways can gold, silver, and bronze medals be awarded?

$$
P(10, 3) = \frac{10!}{7!} = 10 \times 9 \times 8 = 720
$$

### Example: Electing Officers

A club of 15 members elects a president, vice-president, and secretary:

$$
P(15, 3) = 15 \times 14 \times 13 = 2{,}730
$$

### Example: Arranging Letters

How many 4-letter "words" (not necessarily meaningful) can be formed from the letters {A, B, C, D, E, F, G} without repetition?

$$
P(7, 4) = 7 \times 6 \times 5 \times 4 = 840
$$

---

## Permutations with Repetition Allowed

When repetition is allowed (each object can be chosen multiple times), the number of $r$-length sequences from $n$ objects is:

$$
n^r
$$

### Example: PIN Codes

A 4-digit PIN where each digit is 0–9 (repetition allowed):

$$
10^4 = 10{,}000
$$

### Example: Binary Strings of Length 8

$$
2^8 = 256
$$

### Example: License Plates

A plate with 3 letters followed by 3 digits (repetition allowed):

$$
26^3 \times 10^3 = 17{,}576 \times 1{,}000 = 17{,}576{,}000
$$

---

## Permutations of Multisets (Objects with Repetition)

When arranging $n$ objects where some are **identical**, we divide by the factorial of each group of repeated items to avoid counting indistinguishable arrangements.

If there are $n$ objects total with $n_1$ of type 1, $n_2$ of type 2, ..., $n_k$ of type $k$ (where $n_1 + n_2 + \cdots + n_k = n$):

$$
\frac{n!}{n_1! \cdot n_2! \cdots n_k!}
$$

### Example: Arranging MISSISSIPPI

The word MISSISSIPPI has 11 letters: M(1), I(4), S(4), P(2).

$$
\frac{11!}{1! \cdot 4! \cdot 4! \cdot 2!} = \frac{39{,}916{,}800}{1 \times 24 \times 24 \times 2} = \frac{39{,}916{,}800}{1{,}152} = 34{,}650
$$

### Example: Arranging BANANA

BANANA has 6 letters: B(1), A(3), N(2).

$$
\frac{6!}{1! \cdot 3! \cdot 2!} = \frac{720}{1 \times 6 \times 2} = \frac{720}{12} = 60
$$

### Example: Distributing Identical Balls

How many ways can you arrange 3 red, 2 blue, and 1 green ball in a row?

$$
\frac{6!}{3! \cdot 2! \cdot 1!} = \frac{720}{6 \times 2 \times 1} = 60
$$

---

## Circular Permutations

When objects are arranged in a **circle**, rotations of the same arrangement are considered identical. For $n$ distinct objects:

$$
(n-1)!
$$

### Why $(n-1)!$ ?

In a linear arrangement, we have $n!$ ways. But in a circle, each arrangement can be rotated $n$ ways to look the same. By the division rule:

$$
\frac{n!}{n} = (n-1)!
$$

### Example: 5 People at a Round Table

$$
(5-1)! = 4! = 24 \text{ arrangements}
$$

### Example: Seating 8 People in a Circle

$$
(8-1)! = 7! = 5{,}040
$$

### Circular Permutations with Fixed Position

If one person's seat is fixed (say, the host always sits at the head), the remaining $n-1$ people can be arranged in:

$$
(n-1)!
$$

This is the same formula—fixing one position removes the rotational symmetry.

### Necklace Problem (Reflections)

If the circular arrangement can also be **flipped** (like a necklace or bracelet), we divide by 2 additionally:

$$
\frac{(n-1)!}{2}
$$

For 6 beads on a necklace: $\frac{5!}{2} = \frac{120}{2} = 60$.

---

## Derangements

A **derangement** is a permutation where **no element appears in its original position**. The number of derangements of $n$ objects is denoted $D_n$ (or $!n$).

$$
D_n = n! \sum_{i=0}^{n} \frac{(-1)^i}{i!}
$$

This can also be written as:

$$
D_n = n! \left(1 - \frac{1}{1!} + \frac{1}{2!} - \frac{1}{3!} + \cdots + \frac{(-1)^n}{n!}\right)
$$

### Recursive Formula

$$
D_n = (n-1)(D_{n-1} + D_{n-2})
$$

with base cases $D_0 = 1$ and $D_1 = 0$.

### Another Useful Recurrence

$$
D_n = n \cdot D_{n-1} + (-1)^n
$$

### Small Values

| $n$ | $D_n$ | $n!$ | Probability $D_n/n!$ |
|-----|--------|------|----------------------|
| 0   | 1      | 1    | 1.000                |
| 1   | 0      | 1    | 0.000                |
| 2   | 1      | 2    | 0.500                |
| 3   | 2      | 6    | 0.333                |
| 4   | 9      | 24   | 0.375                |
| 5   | 44     | 120  | 0.367                |
| 6   | 265    | 720  | 0.368                |

As $n \to \infty$, the probability of a random permutation being a derangement approaches $1/e \approx 0.3679$.

### Example: Hat Check Problem

5 people check their hats. How many ways can the hats be returned so that nobody gets their own hat?

$$
D_5 = 5! \left(1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24} - \frac{1}{120}\right)
$$

$$
= 120 \left(\frac{1}{2} - \frac{1}{6} + \frac{1}{24} - \frac{1}{120}\right)
$$

$$
= 120 \times \frac{60 - 20 + 5 - 1}{120} = 44
$$

### Example: Letter Misdelivery

A postal worker has 4 letters for 4 houses and delivers every letter to the wrong house:

$$
D_4 = 4! \left(1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24}\right) = 24 \times \frac{12 - 4 + 1}{24} = 9
$$

---

## Code: Computing Permutations and Derangements

```cpp
#include <iostream>
#include <vector>
using namespace std;

long long factorial(int n) {
    long long r = 1;
    for (int i = 2; i <= n; i++) r *= i;
    return r;
}

long long permutation(int n, int r) {
    long long res = 1;
    for (int i = n; i > n - r; i--) res *= i;
    return res;
}

long long derangement(int n) {
    if (n == 0) return 1;
    if (n == 1) return 0;
    long long d0 = 1, d1 = 0, cur;
    for (int i = 2; i <= n; i++) {
        cur = (i - 1) * (d1 + d0);
        d0 = d1; d1 = cur;
    }
    return d1;
}

long long multisetPerm(int n, vector<int>& g) {
    long long den = 1;
    for (int x : g) den *= factorial(x);
    return factorial(n) / den;
}

int main() {
    cout << "P(10,3) = " << permutation(10, 3) << endl;
    cout << "Circular(6) = " << factorial(5) << endl;
    for (int i = 0; i <= 6; i++)
        cout << "D(" << i << ") = " << derangement(i) << endl;
    vector<int> ms = {1,4,4,2};
    cout << "MISSISSIPPI = " << multisetPerm(11, ms) << endl;
}
```

```csharp
using System;
using System.Collections.Generic;

class Permutations {
    static long Factorial(int n) { long r = 1; for (int i = 2; i <= n; i++) r *= i; return r; }
    static long Perm(int n, int r) { long res = 1; for (int i = n; i > n-r; i--) res *= i; return res; }
    static long Derangement(int n) {
        if (n == 0) return 1; if (n == 1) return 0;
        long d0 = 1, d1 = 0, cur = 0;
        for (int i = 2; i <= n; i++) { cur = (i-1)*(d1+d0); d0 = d1; d1 = cur; }
        return d1;
    }
    static long MultisetPerm(int n, List<int> g) {
        long den = 1; foreach (int x in g) den *= Factorial(x);
        return Factorial(n) / den;
    }
    static void Main() {
        Console.WriteLine($"P(10,3) = {Perm(10,3)}");
        Console.WriteLine($"Circular(6) = {Factorial(5)}");
        for (int i = 0; i <= 6; i++) Console.WriteLine($"D({i}) = {Derangement(i)}");
        Console.WriteLine($"MISSISSIPPI = {MultisetPerm(11, new List<int>{1,4,4,2})}");
    }
}
```

```java
public class Permutations {
    static long factorial(int n) { long r = 1; for (int i = 2; i <= n; i++) r *= i; return r; }
    static long perm(int n, int r) { long res = 1; for (int i = n; i > n-r; i--) res *= i; return res; }
    static long derangement(int n) {
        if (n == 0) return 1; if (n == 1) return 0;
        long d0 = 1, d1 = 0, cur = 0;
        for (int i = 2; i <= n; i++) { cur = (i-1)*(d1+d0); d0 = d1; d1 = cur; }
        return d1;
    }
    static long multisetPerm(int n, int[] g) {
        long den = 1; for (int x : g) den *= factorial(x);
        return factorial(n) / den;
    }
    public static void main(String[] args) {
        System.out.println("P(10,3) = " + perm(10,3));
        System.out.println("Circular(6) = " + factorial(5));
        for (int i = 0; i <= 6; i++) System.out.println("D("+i+") = " + derangement(i));
        System.out.println("MISSISSIPPI = " + multisetPerm(11, new int[]{1,4,4,2}));
    }
}
```

```python
from math import factorial

def perm(n, r):
    result = 1
    for i in range(n, n - r, -1):
        result *= i
    return result

def derangement(n):
    if n == 0: return 1
    if n == 1: return 0
    d0, d1 = 1, 0
    for i in range(2, n + 1):
        d0, d1 = d1, (i - 1) * (d1 + d0)
    return d1

def multiset_perm(n, groups):
    den = 1
    for g in groups:
        den *= factorial(g)
    return factorial(n) // den

print(f"P(10,3) = {perm(10, 3)}")
print(f"Circular(6) = {factorial(5)}")
for i in range(7):
    print(f"D({i}) = {derangement(i)}")
print(f"MISSISSIPPI = {multiset_perm(11, [1,4,4,2])}")
```

```javascript
function factorial(n) {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}
function perm(n, r) {
  let res = 1n;
  for (let i = BigInt(n); i > BigInt(n - r); i--) res *= i;
  return res;
}
function derangement(n) {
  if (n === 0) return 1n;
  if (n === 1) return 0n;
  let d0 = 1n, d1 = 0n, cur;
  for (let i = 2; i <= n; i++) { cur = BigInt(i-1)*(d1+d0); d0 = d1; d1 = cur; }
  return d1;
}
function multisetPerm(n, groups) {
  let den = 1n;
  for (const g of groups) den *= factorial(g);
  return factorial(n) / den;
}

console.log(`P(10,3) = ${perm(10, 3)}`);
console.log(`Circular(6) = ${factorial(5)}`);
for (let i = 0; i <= 6; i++) console.log(`D(${i}) = ${derangement(i)}`);
console.log(`MISSISSIPPI = ${multisetPerm(11, [1,4,4,2])}`);
```

### Output

```
P(10,3) = 720
Circular(6) = 120
D(0) = 1
D(1) = 0
D(2) = 1
D(3) = 2
D(4) = 9
D(5) = 44
D(6) = 265
MISSISSIPPI = 34650
```

---

## Practice Problems

1. How many ways can 7 people stand in a line?
2. Compute $P(12, 4)$.
3. How many distinct arrangements of the word COMMITTEE exist?
4. In how many ways can 6 keys be arranged on a key ring?
5. A class of 20 students writes an exam. If no two students get the same score, in how many ways can the top 5 be ranked?
6. Compute $D_6$ (derangements of 6 objects).

<details>
<summary><strong>Solutions</strong></summary>

1. $7! = 5{,}040$
2. $P(12, 4) = 12 \times 11 \times 10 \times 9 = 11{,}880$
3. COMMITTEE: C(1), O(1), M(2), I(1), T(2), E(2) → $\frac{9!}{2! \cdot 2! \cdot 2!} = \frac{362{,}880}{8} = 45{,}360$
4. Key ring (circular + flippable): $\frac{(6-1)!}{2} = \frac{120}{2} = 60$
5. $P(20, 5) = 20 \times 19 \times 18 \times 17 \times 16 = 1{,}860{,}480$
6. $D_6 = 5(D_5 + D_4) = 5(44 + 9) = 5 \times 53 = 265$

</details>

---

## Key Takeaways

- **Permutation** = ordered arrangement. Order matters!
- **All $n$ objects:** $n!$ arrangements.
- **$r$ from $n$ (no repetition):** $P(n,r) = \frac{n!}{(n-r)!}$.
- **With repetition:** $n^r$ sequences of length $r$ from $n$ types.
- **Multiset permutations:** $\frac{n!}{n_1! n_2! \cdots n_k!}$ — divide out identical items.
- **Circular permutations:** $(n-1)!$ (rotations are equivalent); divide by 2 further for necklaces.
- **Derangements:** $D_n = n! \sum_{i=0}^{n} \frac{(-1)^i}{i!}$ — no item in its original position. Probability → $1/e$.
- Use the **recurrence** $D_n = (n-1)(D_{n-1} + D_{n-2})$ for efficient computation.
