---
title: Combinations
---

# Combinations

In the previous lessons on counting principles and permutations, we focused on arrangements where **order matters**. Now we turn to **combinations** — selections where **order does not matter**. Choosing items A, B, C is the same combination as choosing C, B, A.

---

## Combinations vs Permutations

| Aspect | Permutations | Combinations |
|--------|-------------|--------------|
| Order | Matters | Does not matter |
| Formula | $P(n,r) = \frac{n!}{(n-r)!}$ | $\binom{n}{r} = \frac{n!}{r!(n-r)!}$ |
| Example | Arranging 3 books on a shelf | Choosing 3 books to read |

The key insight: every combination of $r$ items corresponds to $r!$ permutations (one for each way to arrange those $r$ items). Therefore:

$$\binom{n}{r} = \frac{P(n,r)}{r!} = \frac{n!}{r!(n-r)!}$$

---

## The Combination Formula

The number of ways to choose $r$ items from $n$ distinct items (without regard to order) is:

$$\binom{n}{r} = \frac{n!}{r!(n-r)!}$$

This is read as "n choose r" and is also written as $C(n,r)$ or ${}^nC_r$.

**Example:** How many ways can you choose 3 students from a class of 10?

$$\binom{10}{3} = \frac{10!}{3! \cdot 7!} = \frac{10 \times 9 \times 8}{3 \times 2 \times 1} = 120$$

---

## Properties of Combinations

### Property 1: Boundary Values

$$\binom{n}{0} = \binom{n}{n} = 1$$

Choosing nothing or choosing everything — there is exactly one way to do each.

### Property 2: Symmetry

$$\binom{n}{r} = \binom{n}{n-r}$$

Choosing $r$ items to **include** is equivalent to choosing $n-r$ items to **exclude**.

**Example:** $\binom{10}{3} = \binom{10}{7} = 120$

### Property 3: Pascal's Rule

$$\binom{n}{r} = \binom{n-1}{r-1} + \binom{n-1}{r}$$

For any specific item, either we include it (then choose $r-1$ from the remaining $n-1$) or we exclude it (then choose $r$ from the remaining $n-1$).

### Property 4: Sum of a Row

$$\sum_{r=0}^{n} \binom{n}{r} = 2^n$$

The total number of subsets of a set with $n$ elements is $2^n$.

### Property 5: Absorption Identity

$$r \binom{n}{r} = n \binom{n-1}{r-1}$$

---

## Combinations with Repetition

When repetition is allowed (you can choose the same item more than once), the formula changes. The number of ways to choose $r$ items from $n$ types with repetition is:

$$\binom{n+r-1}{r} = \binom{n+r-1}{n-1}$$

**Example:** How many ways can you choose 4 scoops of ice cream from 3 flavors (vanilla, chocolate, strawberry)?

$$\binom{3+4-1}{4} = \binom{6}{4} = 15$$

---

## Stars and Bars Theorem

The **stars and bars** technique is a powerful method for solving combinations with repetition. It answers: in how many ways can we distribute $r$ identical objects into $n$ distinct bins?

### The Idea

Represent the $r$ objects as stars ($\star$) and use $n-1$ bars ($|$) to separate them into $n$ groups.

**Example:** Distribute 4 identical balls into 3 boxes.

We need 4 stars and 2 bars. One arrangement: $\star \star | \star | \star$ means Box 1 gets 2, Box 2 gets 1, Box 3 gets 1.

The total positions are $r + (n-1) = 4 + 2 = 6$. We choose where to place the 2 bars:

$$\binom{r+n-1}{n-1} = \binom{6}{2} = 15$$

### Stars and Bars with Constraints

**At least one in each bin:** If each bin must have at least one object, first place one object in each bin. Then distribute the remaining $r - n$ objects freely:

$$\binom{r-1}{n-1}$$

**Example:** Distribute 10 identical cookies among 4 children so each gets at least one:

$$\binom{10-1}{4-1} = \binom{9}{3} = 84$$

### Solving Equations with Stars and Bars

Find the number of non-negative integer solutions to $x_1 + x_2 + x_3 = 7$:

$$\binom{7+3-1}{3-1} = \binom{9}{2} = 36$$

Find the number of positive integer solutions to $x_1 + x_2 + x_3 = 7$:

$$\binom{7-1}{3-1} = \binom{6}{2} = 15$$

---

## Computing Combinations — Code

### Basic Combination Calculation

```cpp
#include <iostream>
#include <vector>
using namespace std;

// Compute C(n, r) using iterative multiplication to avoid overflow
long long combination(int n, int r) {
    if (r > n - r) r = n - r; // Use symmetry
    long long result = 1;
    for (int i = 0; i < r; i++) {
        result *= (n - i);
        result /= (i + 1);
    }
    return result;
}

int main() {
    cout << "C(10, 3) = " << combination(10, 3) << endl;  // 120
    cout << "C(20, 7) = " << combination(20, 7) << endl;  // 77520
    return 0;
}
```

```csharp
using System;

class Combinations {
    // Compute C(n, r) iteratively
    static long Combination(int n, int r) {
        if (r > n - r) r = n - r; // Use symmetry
        long result = 1;
        for (int i = 0; i < r; i++) {
            result *= (n - i);
            result /= (i + 1);
        }
        return result;
    }

    static void Main() {
        Console.WriteLine($"C(10, 3) = {Combination(10, 3)}");  // 120
        Console.WriteLine($"C(20, 7) = {Combination(20, 7)}");  // 77520
    }
}
```

```java
public class Combinations {
    // Compute C(n, r) iteratively
    static long combination(int n, int r) {
        if (r > n - r) r = n - r; // Use symmetry
        long result = 1;
        for (int i = 0; i < r; i++) {
            result *= (n - i);
            result /= (i + 1);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println("C(10, 3) = " + combination(10, 3));  // 120
        System.out.println("C(20, 7) = " + combination(20, 7));  // 77520
    }
}
```

```python
def combination(n, r):
    """Compute C(n, r) iteratively."""
    if r > n - r:
        r = n - r  # Use symmetry
    result = 1
    for i in range(r):
        result *= (n - i)
        result //= (i + 1)
    return result

print(f"C(10, 3) = {combination(10, 3)}")  # 120
print(f"C(20, 7) = {combination(20, 7)}")  # 77520
```

```javascript
function combination(n, r) {
  // Compute C(n, r) iteratively
  if (r > n - r) r = n - r; // Use symmetry
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= (n - i);
    result /= (i + 1);
  }
  return result;
}

console.log(`C(10, 3) = ${combination(10, 3)}`);  // 120
console.log(`C(20, 7) = ${combination(20, 7)}`);  // 77520
```

---

## Generating All Combinations — Code

### Generate All r-Combinations of a Set

```cpp
#include <iostream>
#include <vector>
using namespace std;

void generateCombinations(vector<int>& arr, int r, int start,
                          vector<int>& current, vector<vector<int>>& result) {
    if ((int)current.size() == r) {
        result.push_back(current);
        return;
    }
    for (int i = start; i < (int)arr.size(); i++) {
        current.push_back(arr[i]);
        generateCombinations(arr, r, i + 1, current, result);
        current.pop_back();
    }
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    int r = 3;
    vector<int> current;
    vector<vector<int>> result;
    generateCombinations(arr, r, 0, current, result);

    cout << "All 3-combinations of {1,2,3,4,5}:" << endl;
    for (auto& combo : result) {
        cout << "{ ";
        for (int x : combo) cout << x << " ";
        cout << "}" << endl;
    }
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class GenerateCombinations {
    static void Generate(int[] arr, int r, int start,
                         List<int> current, List<List<int>> result) {
        if (current.Count == r) {
            result.Add(new List<int>(current));
            return;
        }
        for (int i = start; i < arr.Length; i++) {
            current.Add(arr[i]);
            Generate(arr, r, i + 1, current, result);
            current.RemoveAt(current.Count - 1);
        }
    }

    static void Main() {
        int[] arr = {1, 2, 3, 4, 5};
        int r = 3;
        var result = new List<List<int>>();
        Generate(arr, r, 0, new List<int>(), result);

        Console.WriteLine("All 3-combinations of {1,2,3,4,5}:");
        foreach (var combo in result) {
            Console.WriteLine("{ " + string.Join(", ", combo) + " }");
        }
    }
}
```

```java
import java.util.*;

public class GenerateCombinations {
    static void generate(int[] arr, int r, int start,
                         List<Integer> current, List<List<Integer>> result) {
        if (current.size() == r) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < arr.length; i++) {
            current.add(arr[i]);
            generate(arr, r, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        int r = 3;
        List<List<Integer>> result = new ArrayList<>();
        generate(arr, r, 0, new ArrayList<>(), result);

        System.out.println("All 3-combinations of {1,2,3,4,5}:");
        for (List<Integer> combo : result) {
            System.out.println(combo);
        }
    }
}
```

```python
from itertools import combinations

def generate_combinations(arr, r):
    """Generate all r-combinations using backtracking."""
    result = []

    def backtrack(start, current):
        if len(current) == r:
            result.append(current[:])
            return
        for i in range(start, len(arr)):
            current.append(arr[i])
            backtrack(i + 1, current)
            current.pop()

    backtrack(0, [])
    return result

arr = [1, 2, 3, 4, 5]
r = 3
print(f"All 3-combinations of {{1,2,3,4,5}}:")
for combo in generate_combinations(arr, r):
    print(combo)

# Using Python's built-in itertools
print("\nUsing itertools:")
for combo in combinations(arr, r):
    print(list(combo))
```

```javascript
function generateCombinations(arr, r) {
  const result = [];

  function backtrack(start, current) {
    if (current.length === r) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

const arr = [1, 2, 3, 4, 5];
const r = 3;
console.log("All 3-combinations of {1,2,3,4,5}:");
for (const combo of generateCombinations(arr, r)) {
  console.log(combo);
}
```

---

## Practical Applications

### Committee Selection

How many ways can a committee of 5 be chosen from 8 men and 6 women if it must have exactly 3 men and 2 women?

$$\binom{8}{3} \times \binom{6}{2} = 56 \times 15 = 840$$

### Card Hands

How many 5-card poker hands can be dealt from a standard 52-card deck?

$$\binom{52}{5} = \frac{52!}{5! \cdot 47!} = 2,598,960$$

### Distributing Identical Objects

How many ways to put 12 identical apples into 4 distinct baskets?

$$\binom{12+4-1}{4-1} = \binom{15}{3} = 455$$

---

## Common Mistakes to Avoid

1. **Confusing with permutations:** If you select 3 people for distinct roles (president, VP, secretary), that's a permutation. If you select 3 people for a committee (no roles), that's a combination.

2. **Forgetting constraints in stars and bars:** For "at least one per bin," subtract first before applying the formula.

3. **Not simplifying with symmetry:** Computing $\binom{100}{98}$ is much easier as $\binom{100}{2} = 4950$.

4. **Overflow in computation:** Always use the iterative approach (multiplying and dividing in sequence) rather than computing full factorials.

---

## Key Takeaways

- A **combination** is an unordered selection: $\binom{n}{r} = \frac{n!}{r!(n-r)!}$.
- **Symmetry** ($\binom{n}{r} = \binom{n}{n-r}$) simplifies calculations and confirms that choosing items to include is equivalent to choosing items to exclude.
- **Combinations with repetition** use $\binom{n+r-1}{r}$ — the stars and bars technique transforms the problem into placing dividers among objects.
- **Stars and bars** is the go-to method for distributing identical objects into distinct bins (or finding non-negative integer solutions to equations).
- Always ask: does order matter? If yes → permutation. If no → combination.
- Use the iterative formula in code to avoid integer overflow from large factorials.
