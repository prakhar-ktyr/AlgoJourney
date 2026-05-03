---
title: Truth Tables & Logical Equivalences
---

# Truth Tables & Logical Equivalences

Truth tables are the Swiss Army knife of logic — they let you systematically determine the truth value of **any** compound proposition for **every** possible combination of inputs. Think of them as a spreadsheet that tests every scenario so you never miss a case.

---

## Why Truth Tables Matter

Imagine you're writing an `if` statement with multiple conditions. How do you know it covers all cases correctly? A truth table answers that question definitively. They're used in:

- **Circuit design** — every logic gate is defined by a truth table
- **Software testing** — ensuring all branches are covered
- **Database queries** — understanding complex WHERE clauses
- **Mathematical proofs** — verifying logical equivalences

---

## Building Truth Tables Systematically

### Step 1: Identify Variables

List all propositional variables (e.g., $p$, $q$, $r$).

### Step 2: Determine the Number of Rows

With $n$ variables, you need $2^n$ rows:

| Variables | Rows |
|-----------|------|
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 16 |

### Step 3: Fill in Variable Columns

Use a systematic pattern — alternate T/F values, halving the block size for each successive variable:

**For 2 variables ($p$, $q$):**

| $p$ | $q$ |
|-----|-----|
| T | T |
| T | F |
| F | T |
| F | F |

**For 3 variables ($p$, $q$, $r$):**

| $p$ | $q$ | $r$ |
|-----|-----|-----|
| T | T | T |
| T | T | F |
| T | F | T |
| T | F | F |
| F | T | T |
| F | T | F |
| F | F | T |
| F | F | F |

> **Analogy:** Think of it like a binary counter. The rightmost variable flips every row, the next flips every 2 rows, the next every 4 rows, and so on.

### Step 4: Evaluate Sub-expressions

Break the formula into sub-expressions and compute each column from the inside out.

---

## Truth Tables for All Connectives

### Negation ($\neg p$)

| $p$ | $\neg p$ |
|-----|----------|
| T | F |
| F | T |

### Conjunction ($p \land q$) — AND

Both must be true.

| $p$ | $q$ | $p \land q$ |
|-----|-----|-------------|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | F |

> **Real-world:** "You need a ticket AND an ID to enter." Only get in if you have both.

### Disjunction ($p \lor q$) — OR (inclusive)

At least one must be true.

| $p$ | $q$ | $p \lor q$ |
|-----|-----|------------|
| T | T | T |
| T | F | T |
| F | T | T |
| F | F | F |

> **Real-world:** "You can pay with cash OR card." Either works (or both!).

### Exclusive Or ($p \oplus q$) — XOR

Exactly one must be true (not both).

| $p$ | $q$ | $p \oplus q$ |
|-----|-----|--------------|
| T | T | F |
| T | F | T |
| F | T | T |
| F | F | F |

> **Real-world:** "You can have soup or salad" (at a restaurant — pick one, not both).

### Implication ($p \to q$) — IF...THEN

False only when the premise is true but the conclusion is false.

| $p$ | $q$ | $p \to q$ |
|-----|-----|-----------|
| T | T | T |
| T | F | F |
| F | T | T |
| F | F | T |

> **Real-world:** "If it rains, I'll bring an umbrella." The only way I break my promise is if it rains and I don't bring one. If it doesn't rain, my promise is trivially kept regardless.

### Biconditional ($p \leftrightarrow q$) — IF AND ONLY IF

Both have the same truth value.

| $p$ | $q$ | $p \leftrightarrow q$ |
|-----|-----|----------------------|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | T |

> **Real-world:** "You pass if and only if you score above 60%." Pass ↔ above 60%. Fail ↔ at or below 60%.

---

## Important Logical Equivalences

Two propositions are **logically equivalent** (written $\equiv$) if they have identical truth values in every row of their truth tables.

### De Morgan's Laws

$$\neg(p \land q) \equiv \neg p \lor \neg q$$
$$\neg(p \lor q) \equiv \neg p \land \neg q$$

> **Analogy:** "It's NOT the case that (I have a dog AND a cat)" means "I don't have a dog OR I don't have a cat." Negation flips AND to OR and vice versa.

**Verification of the first law:**

| $p$ | $q$ | $p \land q$ | $\neg(p \land q)$ | $\neg p$ | $\neg q$ | $\neg p \lor \neg q$ |
|-----|-----|-------------|-------------------|----------|----------|---------------------|
| T | T | T | F | F | F | F |
| T | F | F | T | F | T | T |
| F | T | F | T | T | F | T |
| F | F | F | T | T | T | T |

Columns 4 and 7 are identical — equivalence proven! ✓

### Double Negation

$$\neg(\neg p) \equiv p$$

Negating something twice returns you to the original.

### Distributive Laws

$$p \land (q \lor r) \equiv (p \land q) \lor (p \land r)$$
$$p \lor (q \land r) \equiv (p \lor q) \land (p \lor r)$$

> **Analogy:** Just like multiplying: $a \times (b + c) = ab + ac$. AND distributes over OR, and OR distributes over AND.

### Absorption Laws

$$p \lor (p \land q) \equiv p$$
$$p \land (p \lor q) \equiv p$$

> **Analogy:** "I'll go outside, or I'll go outside and it's sunny" simplifies to "I'll go outside" — the extra condition is absorbed.

### Idempotent Laws

$$p \land p \equiv p$$
$$p \lor p \equiv p$$

ANDing or ORing something with itself changes nothing.

### Identity Laws

$$p \land T \equiv p$$
$$p \lor F \equiv p$$

> T (true) is the identity for AND; F (false) is the identity for OR.

### Domination Laws

$$p \lor T \equiv T$$
$$p \land F \equiv F$$

### Complement Laws

$$p \lor \neg p \equiv T$$
$$p \land \neg p \equiv F$$

> Something is either true or not true (always T). Something can't be both true and not true (always F).

### Commutative Laws

$$p \land q \equiv q \land p$$
$$p \lor q \equiv q \lor p$$

### Associative Laws

$$(p \land q) \land r \equiv p \land (q \land r)$$
$$(p \lor q) \lor r \equiv p \lor (q \lor r)$$

---

## Tautologies, Contradictions, and Contingencies

### Tautology

A proposition that is **always true** regardless of variable values.

**Example:** $p \lor \neg p$ (Law of Excluded Middle)

| $p$ | $\neg p$ | $p \lor \neg p$ |
|-----|----------|-----------------|
| T | F | T |
| F | T | T |

Every row is T — it's a tautology!

### Contradiction

A proposition that is **always false** regardless of variable values.

**Example:** $p \land \neg p$

| $p$ | $\neg p$ | $p \land \neg p$ |
|-----|----------|-----------------|
| T | F | F |
| F | T | F |

Every row is F — it's a contradiction!

### Contingency

A proposition that is **sometimes true and sometimes false** — neither a tautology nor a contradiction.

**Example:** $p \to q$ (true in 3 rows, false in 1 row)

---

## Proving Equivalence with Truth Tables

To prove $A \equiv B$:

1. Build truth tables for both $A$ and $B$
2. Compare their output columns
3. If every row matches, they're equivalent

**Example:** Prove $(p \to q) \equiv (\neg p \lor q)$

| $p$ | $q$ | $p \to q$ | $\neg p$ | $\neg p \lor q$ |
|-----|-----|-----------|----------|-----------------|
| T | T | T | F | T |
| T | F | F | F | F |
| F | T | T | T | T |
| F | F | T | T | T |

Columns 3 and 5 match perfectly! This proves an implication is equivalent to "not p or q."

---

## Conditional Equivalences

### The Contrapositive

$$p \to q \equiv \neg q \to \neg p$$

The contrapositive is **always equivalent** to the original implication.

> **Example:** "If it rains, the ground is wet" ≡ "If the ground is NOT wet, it did NOT rain."

| $p$ | $q$ | $p \to q$ | $\neg q$ | $\neg p$ | $\neg q \to \neg p$ |
|-----|-----|-----------|----------|----------|---------------------|
| T | T | T | F | F | T |
| T | F | F | T | F | F |
| F | T | T | F | T | T |
| F | F | T | T | T | T |

Columns 3 and 6 match ✓

### The Converse

$$\text{Converse of } (p \to q) \text{ is } (q \to p)$$

The converse is **NOT** equivalent to the original!

> **Example:** "If it rains, the ground is wet" vs "If the ground is wet, it rained" — the sprinkler could have been on!

### The Inverse

$$\text{Inverse of } (p \to q) \text{ is } (\neg p \to \neg q)$$

The inverse is **NOT** equivalent to the original, but it IS equivalent to the converse.

| Statement | Form | Equivalent to original? |
|-----------|------|------------------------|
| Original | $p \to q$ | — |
| Contrapositive | $\neg q \to \neg p$ | Yes ✓ |
| Converse | $q \to p$ | No ✗ |
| Inverse | $\neg p \to \neg q$ | No ✗ |

---

## Code Example: Truth Table Generator

Let's write a program that generates and prints a truth table for logical expressions.

```cpp
#include <iostream>
#include <iomanip>
#include <vector>
#include <string>
#include <functional>
using namespace std;

void printTruthTable(const string& expression,
                     const vector<string>& vars,
                     function<bool(vector<bool>)> evaluate) {
    int n = vars.size();
    int rows = 1 << n; // 2^n rows

    // Print header
    for (const auto& v : vars) cout << setw(6) << v;
    cout << setw(12) << expression << endl;
    cout << string(6 * n + 12, '-') << endl;

    // Generate all combinations
    for (int i = 0; i < rows; i++) {
        vector<bool> values(n);
        for (int j = 0; j < n; j++) {
            // Assign values: MSB first
            values[j] = (i >> (n - 1 - j)) & 1;
            cout << setw(6) << (values[j] ? "T" : "F");
        }
        bool result = evaluate(values);
        cout << setw(12) << (result ? "T" : "F") << endl;
    }
}

int main() {
    // Truth table for: p AND q
    cout << "=== p AND q ===" << endl;
    printTruthTable("p^q", {"p", "q"}, [](vector<bool> v) {
        return v[0] && v[1];
    });

    cout << endl;

    // Truth table for: De Morgan's Law: NOT(p AND q) = (NOT p) OR (NOT q)
    cout << "=== De Morgan: ~(p^q) vs (~p v ~q) ===" << endl;
    vector<string> vars = {"p", "q"};
    int n = vars.size();
    int rows = 1 << n;

    cout << setw(6) << "p" << setw(6) << "q"
         << setw(12) << "~(p^q)" << setw(12) << "~pv~q" << endl;
    cout << string(36, '-') << endl;

    for (int i = 0; i < rows; i++) {
        bool p = (i >> 1) & 1;
        bool q = i & 1;
        bool lhs = !(p && q);
        bool rhs = (!p) || (!q);
        cout << setw(6) << (p ? "T" : "F")
             << setw(6) << (q ? "T" : "F")
             << setw(12) << (lhs ? "T" : "F")
             << setw(12) << (rhs ? "T" : "F")
             << (lhs == rhs ? "  ✓" : "  ✗") << endl;
    }

    return 0;
}
```

```csharp
using System;

class TruthTableGenerator
{
    static void PrintTruthTable(string expression, string[] vars,
                                Func<bool[], bool> evaluate)
    {
        int n = vars.Length;
        int rows = 1 << n; // 2^n rows

        // Print header
        foreach (var v in vars) Console.Write($"{v,6}");
        Console.WriteLine($"{expression,12}");
        Console.WriteLine(new string('-', 6 * n + 12));

        // Generate all combinations
        for (int i = 0; i < rows; i++)
        {
            bool[] values = new bool[n];
            for (int j = 0; j < n; j++)
            {
                values[j] = ((i >> (n - 1 - j)) & 1) == 1;
                Console.Write($"{(values[j] ? "T" : "F"),6}");
            }
            bool result = evaluate(values);
            Console.WriteLine($"{(result ? "T" : "F"),12}");
        }
    }

    static void Main()
    {
        // Truth table for: p AND q
        Console.WriteLine("=== p AND q ===");
        PrintTruthTable("p^q", new[] { "p", "q" },
            v => v[0] && v[1]);

        Console.WriteLine();

        // Verify De Morgan's Law
        Console.WriteLine("=== De Morgan: ~(p^q) vs (~p v ~q) ===");
        Console.WriteLine($"{"p",6}{"q",6}{"~(p^q)",12}{"~pv~q",12}");
        Console.WriteLine(new string('-', 36));

        for (int i = 0; i < 4; i++)
        {
            bool p = ((i >> 1) & 1) == 1;
            bool q = (i & 1) == 1;
            bool lhs = !(p && q);
            bool rhs = !p || !q;
            string check = lhs == rhs ? "  ✓" : "  ✗";
            Console.WriteLine($"{(p ? "T" : "F"),6}{(q ? "T" : "F"),6}" +
                            $"{(lhs ? "T" : "F"),12}{(rhs ? "T" : "F"),12}{check}");
        }
    }
}
```

```java
import java.util.function.Function;

public class TruthTableGenerator {

    static void printTruthTable(String expression, String[] vars,
                                Function<boolean[], Boolean> evaluate) {
        int n = vars.length;
        int rows = 1 << n; // 2^n rows

        // Print header
        for (String v : vars) System.out.printf("%6s", v);
        System.out.printf("%12s%n", expression);
        System.out.println("-".repeat(6 * n + 12));

        // Generate all combinations
        for (int i = 0; i < rows; i++) {
            boolean[] values = new boolean[n];
            for (int j = 0; j < n; j++) {
                values[j] = ((i >> (n - 1 - j)) & 1) == 1;
                System.out.printf("%6s", values[j] ? "T" : "F");
            }
            boolean result = evaluate.apply(values);
            System.out.printf("%12s%n", result ? "T" : "F");
        }
    }

    public static void main(String[] args) {
        // Truth table for: p AND q
        System.out.println("=== p AND q ===");
        printTruthTable("p^q", new String[]{"p", "q"},
            v -> v[0] && v[1]);

        System.out.println();

        // Verify De Morgan's Law
        System.out.println("=== De Morgan: ~(p^q) vs (~p v ~q) ===");
        System.out.printf("%6s%6s%12s%12s%n", "p", "q", "~(p^q)", "~pv~q");
        System.out.println("-".repeat(36));

        for (int i = 0; i < 4; i++) {
            boolean p = ((i >> 1) & 1) == 1;
            boolean q = (i & 1) == 1;
            boolean lhs = !(p && q);
            boolean rhs = !p || !q;
            String check = lhs == rhs ? "  ✓" : "  ✗";
            System.out.printf("%6s%6s%12s%12s%s%n",
                p ? "T" : "F", q ? "T" : "F",
                lhs ? "T" : "F", rhs ? "T" : "F", check);
        }
    }
}
```

```python
from itertools import product

def print_truth_table(expression, vars_list, evaluate):
    """Generate and print a truth table."""
    n = len(vars_list)

    # Print header
    header = "".join(f"{v:>6}" for v in vars_list) + f"{expression:>12}"
    print(header)
    print("-" * len(header))

    # Generate all combinations (True/False for each variable)
    for values in product([True, False], repeat=n):
        row = "".join(f"{'T':>6}" if v else f"{'F':>6}" for v in values)
        result = evaluate(dict(zip(vars_list, values)))
        row += f"{'T':>12}" if result else f"{'F':>12}"
        print(row)


# Truth table for: p AND q
print("=== p AND q ===")
print_truth_table("p^q", ["p", "q"], lambda v: v["p"] and v["q"])

print()

# Verify De Morgan's Law: ~(p^q) ≡ (~p v ~q)
print("=== De Morgan: ~(p^q) vs (~p v ~q) ===")
print(f"{'p':>6}{'q':>6}{'~(p^q)':>12}{'~pv~q':>12}")
print("-" * 36)

for p, q in product([True, False], repeat=2):
    lhs = not (p and q)
    rhs = (not p) or (not q)
    check = "  ✓" if lhs == rhs else "  ✗"
    print(f"{'T' if p else 'F':>6}{'T' if q else 'F':>6}"
          f"{'T' if lhs else 'F':>12}{'T' if rhs else 'F':>12}{check}")
```

```javascript
function printTruthTable(expression, vars, evaluate) {
  const n = vars.length;
  const rows = 1 << n; // 2^n rows

  // Print header
  let header = vars.map(v => v.padStart(6)).join("") +
               expression.padStart(12);
  console.log(header);
  console.log("-".repeat(header.length));

  // Generate all combinations
  for (let i = 0; i < rows; i++) {
    const values = {};
    let row = "";
    for (let j = 0; j < n; j++) {
      const val = Boolean((i >> (n - 1 - j)) & 1);
      values[vars[j]] = val;
      row += (val ? "T" : "F").padStart(6);
    }
    const result = evaluate(values);
    row += (result ? "T" : "F").padStart(12);
    console.log(row);
  }
}

// Truth table for: p AND q
console.log("=== p AND q ===");
printTruthTable("p^q", ["p", "q"], v => v.p && v.q);

console.log();

// Verify De Morgan's Law
console.log("=== De Morgan: ~(p^q) vs (~p v ~q) ===");
console.log(
  "p".padStart(6) + "q".padStart(6) +
  "~(p^q)".padStart(12) + "~pv~q".padStart(12)
);
console.log("-".repeat(36));

for (let i = 0; i < 4; i++) {
  const p = Boolean((i >> 1) & 1);
  const q = Boolean(i & 1);
  const lhs = !(p && q);
  const rhs = !p || !q;
  const check = lhs === rhs ? "  ✓" : "  ✗";
  console.log(
    (p ? "T" : "F").padStart(6) + (q ? "T" : "F").padStart(6) +
    (lhs ? "T" : "F").padStart(12) + (rhs ? "T" : "F").padStart(12) + check
  );
}
```

---

## Practice Problems

### Problem 1

Construct the truth table for $(p \lor q) \to (p \land q)$.

<details>
<summary>Solution</summary>

| $p$ | $q$ | $p \lor q$ | $p \land q$ | $(p \lor q) \to (p \land q)$ |
|-----|-----|------------|-------------|------------------------------|
| T | T | T | T | T |
| T | F | T | F | F |
| F | T | T | F | F |
| F | F | F | F | T |

This is a **contingency** — true when $p$ and $q$ have the same value, false otherwise. In fact, it's equivalent to $p \leftrightarrow q$!

</details>

### Problem 2

Use a truth table to verify: $p \to (q \to r) \equiv (p \land q) \to r$

<details>
<summary>Solution</summary>

| $p$ | $q$ | $r$ | $q \to r$ | $p \to (q \to r)$ | $p \land q$ | $(p \land q) \to r$ |
|-----|-----|-----|-----------|-------------------|-------------|---------------------|
| T | T | T | T | T | T | T |
| T | T | F | F | F | T | F |
| T | F | T | T | T | F | T |
| T | F | F | T | T | F | T |
| F | T | T | T | T | F | T |
| F | T | F | F | T | F | T |
| F | F | T | T | T | F | T |
| F | F | F | T | T | F | T |

Columns 5 and 7 are identical — equivalence proven! ✓

This is called **exportation** and is very useful in proofs.

</details>

### Problem 3

Determine whether $(p \oplus q) \oplus r \equiv p \oplus (q \oplus r)$ (is XOR associative?).

<details>
<summary>Solution</summary>

| $p$ | $q$ | $r$ | $p \oplus q$ | $(p \oplus q) \oplus r$ | $q \oplus r$ | $p \oplus (q \oplus r)$ |
|-----|-----|-----|--------------|------------------------|--------------|------------------------|
| T | T | T | F | T | F | T |
| T | T | F | F | F | T | F |
| T | F | T | T | F | T | F |
| T | F | F | T | T | F | T |
| F | T | T | T | F | F | F |
| F | T | F | T | T | T | T |
| F | F | T | F | T | T | T |
| F | F | F | F | F | F | F |

Yes! Columns 5 and 7 match — **XOR is associative**. ✓

</details>

### Problem 4

Show that $\neg(p \to q) \equiv p \land \neg q$.

<details>
<summary>Solution</summary>

| $p$ | $q$ | $p \to q$ | $\neg(p \to q)$ | $\neg q$ | $p \land \neg q$ |
|-----|-----|-----------|-----------------|----------|-----------------|
| T | T | T | F | F | F |
| T | F | F | T | T | T |
| F | T | T | F | F | F |
| F | F | T | F | T | F |

Columns 4 and 6 match ✓

Intuition: The only way an implication fails is when the hypothesis is true but the conclusion is false — which is exactly $p \land \neg q$.

</details>

### Problem 5

Classify each as tautology, contradiction, or contingency:
1. $(p \land q) \lor (\neg p \lor \neg q)$
2. $(p \to q) \land (p \land \neg q)$
3. $p \to (p \lor q)$

<details>
<summary>Solution</summary>

**1.** $(p \land q) \lor (\neg p \lor \neg q)$

Note: $\neg p \lor \neg q \equiv \neg(p \land q)$ by De Morgan's. So this becomes $(p \land q) \lor \neg(p \land q)$, which is always true by the complement law. **Tautology** ✓

**2.** $(p \to q) \land (p \land \neg q)$

$p \to q$ means $\neg p \lor q$. Combined with $p \land \neg q$: we need $(\neg p \lor q) \land p \land \neg q$. Since $p$ is true, $\neg p$ is false, so $\neg p \lor q$ becomes $q$. But we also need $\neg q$. Can't have both $q$ and $\neg q$. **Contradiction** ✓

**3.** $p \to (p \lor q)$

This says "if $p$ is true, then $p \lor q$ is true." Since $p$ being true guarantees $p \lor q$ is true, the implication always holds. **Tautology** ✓

</details>

---

## Summary of Key Equivalences (Reference Card)

| Name | Equivalence |
|------|-------------|
| De Morgan's | $\neg(p \land q) \equiv \neg p \lor \neg q$ |
| De Morgan's | $\neg(p \lor q) \equiv \neg p \land \neg q$ |
| Double Negation | $\neg(\neg p) \equiv p$ |
| Implication | $p \to q \equiv \neg p \lor q$ |
| Contrapositive | $p \to q \equiv \neg q \to \neg p$ |
| Biconditional | $p \leftrightarrow q \equiv (p \to q) \land (q \to p)$ |
| Exportation | $p \to (q \to r) \equiv (p \land q) \to r$ |
| Absorption | $p \lor (p \land q) \equiv p$ |
| Distributive | $p \land (q \lor r) \equiv (p \land q) \lor (p \land r)$ |

---

## Key Takeaways

1. **Truth tables are mechanical** — with $n$ variables you get $2^n$ rows. Fill them systematically and you'll never miss a case.
2. **De Morgan's Laws** are the most frequently used equivalences — memorize them! Negation swaps AND/OR and negates both parts.
3. **Implication** ($p \to q$) is equivalent to $\neg p \lor q$ — this conversion is used constantly in proofs and programming.
4. **Contrapositive** is always equivalent to the original; converse and inverse are NOT.
5. A **tautology** is always true, a **contradiction** is always false, and a **contingency** is sometimes true and sometimes false.
6. To **prove equivalence**, build truth tables for both sides and verify all rows match.
7. These equivalences form the toolbox for simplifying complex logical expressions — both in mathematical proofs and in code optimization.
