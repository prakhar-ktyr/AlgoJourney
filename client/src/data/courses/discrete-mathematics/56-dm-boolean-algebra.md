---
title: Boolean Algebra
---

# Boolean Algebra

Boolean algebra is the mathematical framework for reasoning about logical values. It operates on a two-element set $\{0, 1\}$ (or $\{F, T\}$) and forms the theoretical foundation for digital circuit design, computer architecture, and database query optimization.

---

## The Boolean Domain

A **Boolean algebra** is an algebraic structure $(B, +, \cdot, \overline{\phantom{x}}, 0, 1)$ where:

- $B = \{0, 1\}$ is the carrier set
- $+$ denotes the OR operation (logical disjunction)
- $\cdot$ denotes the AND operation (logical conjunction)
- $\overline{\phantom{x}}$ denotes the NOT operation (complement)
- $0$ is the identity for OR (additive identity)
- $1$ is the identity for AND (multiplicative identity)

### Truth Tables for Basic Operations

| $a$ | $b$ | $a + b$ (OR) | $a \cdot b$ (AND) | $\overline{a}$ (NOT) |
|-----|-----|:---:|:---:|:---:|
| 0 | 0 | 0 | 0 | 1 |
| 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 | 0 |

---

## Axioms of Boolean Algebra

Boolean algebra satisfies the following axioms for all $a, b, c \in B$:

### 1. Commutative Laws

$$a + b = b + a$$
$$a \cdot b = b \cdot a$$

### 2. Associative Laws

$$a + (b + c) = (a + b) + c$$
$$a \cdot (b \cdot c) = (a \cdot b) \cdot c$$

### 3. Distributive Laws

$$a \cdot (b + c) = (a \cdot b) + (a \cdot c)$$
$$a + (b \cdot c) = (a + b) \cdot (a + c)$$

> Note: The second distributive law (OR distributes over AND) is unique to Boolean algebra — it does **not** hold in ordinary arithmetic.

### 4. Identity Laws

$$a + 0 = a$$
$$a \cdot 1 = a$$

### 5. Complement Laws

$$a + \overline{a} = 1$$
$$a \cdot \overline{a} = 0$$

---

## Derived Theorems

From the axioms, we can prove many useful identities:

### Idempotent Laws

$$a + a = a \quad \text{and} \quad a \cdot a = a$$

### Domination (Annihilation) Laws

$$a + 1 = 1 \quad \text{and} \quad a \cdot 0 = 0$$

### Absorption Laws

$$a + (a \cdot b) = a$$
$$a \cdot (a + b) = a$$

### De Morgan's Laws

$$\overline{a + b} = \overline{a} \cdot \overline{b}$$
$$\overline{a \cdot b} = \overline{a} + \overline{b}$$

### Involution (Double Complement)

$$\overline{\overline{a}} = a$$

---

## Boolean Expressions and Simplification

A **Boolean expression** is a formula built from variables, constants ($0$ and $1$), and the operations AND, OR, NOT.

### Example: Simplify $f(a,b) = a \cdot b + a \cdot \overline{b}$

$$f = a \cdot b + a \cdot \overline{b} = a \cdot (b + \overline{b}) = a \cdot 1 = a$$

### Example: Simplify $g(a,b,c) = \overline{a} \cdot b \cdot c + a \cdot b \cdot c$

$$g = b \cdot c \cdot (\overline{a} + a) = b \cdot c \cdot 1 = b \cdot c$$

### Consensus Theorem

$$a \cdot b + \overline{a} \cdot c + b \cdot c = a \cdot b + \overline{a} \cdot c$$

The term $b \cdot c$ is the **consensus term** and is redundant.

---

## Canonical Forms

Every Boolean function can be represented in two standard (canonical) forms.

### Minterms and Maxterms

For $n$ variables, a **minterm** is a product (AND) of all $n$ variables where each appears exactly once (complemented or not). A **maxterm** is a sum (OR) of all $n$ variables.

For two variables $a, b$:

| $a$ | $b$ | Minterm | Notation | Maxterm | Notation |
|-----|-----|---------|----------|---------|----------|
| 0 | 0 | $\overline{a} \cdot \overline{b}$ | $m_0$ | $a + b$ | $M_0$ |
| 0 | 1 | $\overline{a} \cdot b$ | $m_1$ | $a + \overline{b}$ | $M_1$ |
| 1 | 0 | $a \cdot \overline{b}$ | $m_2$ | $\overline{a} + b$ | $M_2$ |
| 1 | 1 | $a \cdot b$ | $m_3$ | $\overline{a} + \overline{b}$ | $M_3$ |

### Sum of Products (SOP)

The SOP (or disjunctive normal form) is the OR of all minterms where $f = 1$:

$$f(a,b) = \sum m(1, 3) = \overline{a} \cdot b + a \cdot b = b$$

### Product of Sums (POS)

The POS (or conjunctive normal form) is the AND of all maxterms where $f = 0$:

$$f(a,b) = \prod M(0, 2) = (a + b) \cdot (\overline{a} + b) = b$$

Both representations are equivalent — they describe the same function.

---

## Karnaugh Maps (K-maps)

A **Karnaugh map** is a visual method for simplifying Boolean expressions. Adjacent cells differ by exactly one variable (Gray code ordering), making it easy to spot groupings.

### 2-Variable K-map

For $f(a, b)$:

```
        b=0   b=1
a=0  |  f(0,0) | f(0,1) |
a=1  |  f(1,0) | f(1,1) |
```

**Example:** $f(a,b) = \overline{a} \cdot b + a \cdot b$

```
        b=0   b=1
a=0  |   0   |   1   |
a=1  |   0   |   1   |
```

The column $b = 1$ is all 1s → simplified: $f = b$.

### 3-Variable K-map

For $f(a, b, c)$, columns use Gray code for $bc$: $00, 01, 11, 10$.

```
        bc=00  bc=01  bc=11  bc=10
a=0  |   ?   |   ?   |   ?   |   ?   |
a=1  |   ?   |   ?   |   ?   |   ?   |
```

**Example:** Simplify $f(a,b,c) = \sum m(0, 2, 4, 6)$

```
        bc=00  bc=01  bc=11  bc=10
a=0  |   1   |   0   |   0   |   1   |
a=1  |   1   |   0   |   0   |   1   |
```

Group: all cells in columns $bc = 00$ and $bc = 10$ → $\overline{c}$. Result: $f = \overline{c}$.

### 4-Variable K-map

For $f(a, b, c, d)$, both rows and columns use Gray code:

```
          cd=00  cd=01  cd=11  cd=10
ab=00  |       |       |       |       |
ab=01  |       |       |       |       |
ab=11  |       |       |       |       |
ab=10  |       |       |       |       |
```

**Example:** Simplify $f(a,b,c,d) = \sum m(0, 1, 2, 3, 4, 12)$

```
          cd=00  cd=01  cd=11  cd=10
ab=00  |   1   |   1   |   1   |   1   |
ab=01  |   1   |   0   |   0   |   0   |
ab=11  |   1   |   0   |   0   |   0   |
ab=10  |   0   |   0   |   0   |   0   |
```

Groups:
- Top row (all four): $\overline{a} \cdot \overline{b}$
- Left column cells $(0,0), (0,1), (1,1)$: covers $m_0, m_4, m_{12}$ → $\overline{c} \cdot \overline{d}$

Result: $f = \overline{a} \cdot \overline{b} + \overline{c} \cdot \overline{d}$

### K-map Grouping Rules

1. Groups must contain $2^k$ cells ($1, 2, 4, 8, 16$)
2. Groups must be rectangular
3. The map wraps around (top↔bottom, left↔right)
4. Maximize group size, minimize number of groups
5. Every 1-cell must be covered by at least one group
6. Don't-care conditions ($X$) can be included in groups if helpful

---

## Logic Gates

Boolean operations are physically implemented as **logic gates** in digital circuits.

### Basic Gates

| Gate | Symbol | Expression | Description |
|------|--------|-----------|-------------|
| AND | — | $a \cdot b$ | Output 1 only if both inputs are 1 |
| OR | — | $a + b$ | Output 1 if at least one input is 1 |
| NOT | — | $\overline{a}$ | Inverts the input |

### Universal Gates

| Gate | Expression | Description |
|------|-----------|-------------|
| NAND | $\overline{a \cdot b}$ | NOT-AND; output 0 only if both inputs are 1 |
| NOR | $\overline{a + b}$ | NOT-OR; output 0 if any input is 1 |

NAND and NOR are called **universal gates** because any Boolean function can be implemented using only NAND gates (or only NOR gates).

**NAND as universal:**
- NOT: $\overline{a} = \overline{a \cdot a}$ (NAND with both inputs tied)
- AND: $a \cdot b = \overline{\overline{a \cdot b}}$ (NAND followed by NAND-as-NOT)
- OR: $a + b = \overline{\overline{a} \cdot \overline{b}}$ (De Morgan's)

### XOR and XNOR

| Gate | Expression | Description |
|------|-----------|-------------|
| XOR | $a \oplus b = a\overline{b} + \overline{a}b$ | Output 1 if inputs differ |
| XNOR | $\overline{a \oplus b} = ab + \overline{a}\,\overline{b}$ | Output 1 if inputs are equal |

XOR is heavily used in parity checking, error detection, and cryptography.

---

## Applications

### Digital Circuit Design

Boolean algebra is the mathematical language of hardware design:
- Combinational circuits (adders, multiplexers, decoders) are direct implementations of Boolean functions
- K-maps and Quine-McCluskey algorithm minimize gate count → cheaper, faster, lower-power circuits

### Database Query Optimization

SQL `WHERE` clauses are Boolean expressions:

```sql
WHERE (age > 18 AND status = 'active') OR (age > 18 AND role = 'admin')
```

Using the distributive law:

```sql
WHERE age > 18 AND (status = 'active' OR role = 'admin')
```

The optimized query evaluates `age > 18` only once.

### Search Engines and Information Retrieval

Boolean retrieval models use AND, OR, NOT to combine search terms — the simplest form of document matching.

---

## Code: Evaluate and Simplify Boolean Expressions

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cmath>
using namespace std;

// Evaluate a Boolean expression given variable assignments
// Variables: a, b, c (indices 0, 1, 2)
int evaluateMinterm(int minterm, int numVars) {
    // A minterm m_i is true only for the binary encoding of i
    return minterm; // just returns the index
}

// Generate truth table for a function given as a set of minterms
void truthTable(vector<int>& minterms, int numVars) {
    int rows = 1 << numVars;
    // Header
    for (int i = numVars - 1; i >= 0; i--) {
        cout << (char)('a' + i) << " ";
    }
    cout << "| f" << endl;
    cout << string(numVars * 2 + 4, '-') << endl;

    for (int row = 0; row < rows; row++) {
        for (int i = numVars - 1; i >= 0; i--) {
            cout << ((row >> i) & 1) << " ";
        }
        // Check if this row is a minterm
        bool isMinterm = false;
        for (int m : minterms) {
            if (m == row) { isMinterm = true; break; }
        }
        cout << "| " << (isMinterm ? 1 : 0) << endl;
    }
}

// Check if two minterms differ by exactly one bit
int differByOneBit(int a, int b) {
    int diff = a ^ b;
    return (diff != 0) && ((diff & (diff - 1)) == 0);
}

// Simple Quine-McCluskey: find prime implicants for a set of minterms
void quinneMcCluskey(vector<int>& minterms, int numVars) {
    cout << "\nPrime Implicant Finding (simplified):" << endl;
    vector<pair<int, int>> implicants; // (value, mask)
    vector<bool> used(minterms.size(), false);

    // Initialize with minterms
    for (int m : minterms) {
        implicants.push_back({m, 0});
    }

    // Try to combine pairs
    vector<pair<int, int>> newImplicants;
    vector<bool> combined(implicants.size(), false);

    for (int i = 0; i < (int)implicants.size(); i++) {
        for (int j = i + 1; j < (int)implicants.size(); j++) {
            if (implicants[i].second == implicants[j].second) {
                int diff = implicants[i].first ^ implicants[j].first;
                if (diff != 0 && (diff & (diff - 1)) == 0) {
                    newImplicants.push_back({implicants[i].first & implicants[j].first, implicants[i].second | diff});
                    combined[i] = combined[j] = true;
                }
            }
        }
    }

    cout << "Prime implicants (binary, '-' = don't care):" << endl;
    // Print uncombined as prime implicants
    for (int i = 0; i < (int)implicants.size(); i++) {
        if (!combined[i]) {
            for (int bit = numVars - 1; bit >= 0; bit--) {
                if ((implicants[i].second >> bit) & 1) cout << "-";
                else cout << ((implicants[i].first >> bit) & 1);
            }
            cout << endl;
        }
    }
    for (auto& imp : newImplicants) {
        for (int bit = numVars - 1; bit >= 0; bit--) {
            if ((imp.second >> bit) & 1) cout << "-";
            else cout << ((imp.first >> bit) & 1);
        }
        cout << endl;
    }
}

int main() {
    // Example: f(a,b,c) = sum of minterms(1, 3, 5, 7) = b
    vector<int> minterms = {1, 3, 5, 7};
    int numVars = 3;

    cout << "=== Boolean Function: f(a,b,c) = Σm(1,3,5,7) ===" << endl;
    truthTable(minterms, numVars);
    quinneMcCluskey(minterms, numVars);

    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class BooleanAlgebra
{
    // Evaluate a Boolean expression represented as a truth table
    static int Evaluate(int a, int b, int c, List<int> minterms)
    {
        int index = (a << 2) | (b << 1) | c;
        return minterms.Contains(index) ? 1 : 0;
    }

    // Apply De Morgan's Law: NOT(a AND b) = NOT(a) OR NOT(b)
    static (int, int) DeMorganNand(int a, int b)
    {
        int nand = (a & b) == 1 ? 0 : 1;  // NAND
        int deMorgan = ((1 - a) | (1 - b)); // NOT a OR NOT b
        return (nand, deMorgan); // Should always be equal
    }

    // Simplify using absorption: a + a*b = a
    static string ApplyAbsorption(string expr)
    {
        // Demonstrate absorption law
        // In practice, this would parse and simplify the expression
        Console.WriteLine($"  Absorption law: a + a·b = a");
        Console.WriteLine($"  Absorption law: a · (a + b) = a");
        return expr;
    }

    // K-map simplification for 2 variables
    static string SimplifyKmap2(int[,] kmap)
    {
        // kmap[a][b] gives f(a,b)
        List<string> terms = new List<string>();

        // Check columns (b=0 or b=1 constant)
        if (kmap[0, 0] == 1 && kmap[1, 0] == 1) terms.Add("b'");
        if (kmap[0, 1] == 1 && kmap[1, 1] == 1) terms.Add("b");

        // Check rows (a=0 or a=1 constant)
        if (kmap[0, 0] == 1 && kmap[0, 1] == 1) terms.Add("a'");
        if (kmap[1, 0] == 1 && kmap[1, 1] == 1) terms.Add("a");

        // Check all ones
        if (kmap[0, 0] == 1 && kmap[0, 1] == 1 &&
            kmap[1, 0] == 1 && kmap[1, 1] == 1)
            return "1";

        if (terms.Count == 0) return "0";
        return string.Join(" + ", terms);
    }

    static void Main()
    {
        Console.WriteLine("=== Boolean Algebra Operations ===\n");

        // Truth table for f(a,b,c) = a XOR b
        Console.WriteLine("Truth table for f(a,b) = a XOR b:");
        Console.WriteLine("a  b  | f");
        Console.WriteLine("------+--");
        for (int a = 0; a <= 1; a++)
        {
            for (int b = 0; b <= 1; b++)
            {
                int f = a ^ b;
                Console.WriteLine($"{a}  {b}  | {f}");
            }
        }

        // De Morgan's verification
        Console.WriteLine("\n--- De Morgan's Law Verification ---");
        for (int a = 0; a <= 1; a++)
        {
            for (int b = 0; b <= 1; b++)
            {
                var (nand, demorgan) = DeMorganNand(a, b);
                Console.WriteLine($"a={a}, b={b}: NAND={nand}, DeMorgan={demorgan}, Equal={nand == demorgan}");
            }
        }

        // K-map simplification
        Console.WriteLine("\n--- 2-Variable K-map Simplification ---");
        int[,] kmap = { { 0, 1 }, { 0, 1 } }; // f = b
        string simplified = SimplifyKmap2(kmap);
        Console.WriteLine($"K-map: f(0,0)=0, f(0,1)=1, f(1,0)=0, f(1,1)=1");
        Console.WriteLine($"Simplified: f = {simplified}");
    }
}
```

```java
import java.util.*;

public class BooleanAlgebra {

    // Evaluate a sum-of-products expression given variable values
    static boolean evaluateSOP(boolean[] vars, List<int[]> products) {
        for (int[] product : products) {
            boolean termResult = true;
            for (int i = 0; i < vars.length; i++) {
                if (product[i] == 1 && !vars[i]) { termResult = false; break; }
                if (product[i] == 0 && vars[i]) { termResult = false; break; }
                // product[i] == -1 means don't care (variable not in term)
            }
            if (termResult) return true;
        }
        return false;
    }

    // Generate all minterms for a function
    static List<Integer> getMinterms(int numVars, java.util.function.IntPredicate func) {
        List<Integer> minterms = new ArrayList<>();
        int total = 1 << numVars;
        for (int i = 0; i < total; i++) {
            if (func.test(i)) minterms.add(i);
        }
        return minterms;
    }

    // Check if an expression is in SOP form (simplified check)
    static void printSOP(List<Integer> minterms, int numVars) {
        System.out.print("SOP: ");
        for (int i = 0; i < minterms.size(); i++) {
            int m = minterms.get(i);
            for (int bit = numVars - 1; bit >= 0; bit--) {
                char var = (char) ('a' + (numVars - 1 - bit));
                if (((m >> bit) & 1) == 1) System.out.print(var);
                else System.out.print(var + "'");
            }
            if (i < minterms.size() - 1) System.out.print(" + ");
        }
        System.out.println();
    }

    // Check if an expression is in POS form
    static void printPOS(List<Integer> minterms, int numVars) {
        int total = 1 << numVars;
        System.out.print("POS: ");
        boolean first = true;
        for (int i = 0; i < total; i++) {
            if (!minterms.contains(i)) {
                if (!first) System.out.print(" · ");
                System.out.print("(");
                for (int bit = numVars - 1; bit >= 0; bit--) {
                    char var = (char) ('a' + (numVars - 1 - bit));
                    if (((i >> bit) & 1) == 0) System.out.print(var);
                    else System.out.print(var + "'");
                    if (bit > 0) System.out.print(" + ");
                }
                System.out.print(")");
                first = false;
            }
        }
        System.out.println();
    }

    // Demonstrate Boolean identities
    static void verifyIdentities() {
        System.out.println("--- Verifying Boolean Identities ---");
        for (int a = 0; a <= 1; a++) {
            for (int b = 0; b <= 1; b++) {
                // De Morgan's: NOT(a AND b) == (NOT a) OR (NOT b)
                int lhs = 1 - (a & b);
                int rhs = (1 - a) | (1 - b);
                assert lhs == rhs : "De Morgan's failed!";

                // Absorption: a OR (a AND b) == a
                int absLhs = a | (a & b);
                assert absLhs == a : "Absorption failed!";
            }
        }
        System.out.println("All identities verified for all inputs!");
    }

    public static void main(String[] args) {
        System.out.println("=== Boolean Algebra ===\n");

        // Define f(a,b,c) = a'bc + ab'c + abc' + abc = minterms(3,5,6,7)
        int numVars = 3;
        List<Integer> minterms = Arrays.asList(3, 5, 6, 7);

        System.out.println("f(a,b,c) = Σm(3,5,6,7)");
        printSOP(minterms, numVars);
        printPOS(minterms, numVars);

        // Verify identities
        System.out.println();
        verifyIdentities();
    }
}
```

```python
from itertools import product

def truth_table(func, num_vars):
    """Generate and print a truth table for a Boolean function."""
    vars_names = [chr(ord('a') + i) for i in range(num_vars)]
    header = "  ".join(vars_names) + "  | f"
    print(header)
    print("-" * len(header))

    for values in product([0, 1], repeat=num_vars):
        result = func(*values)
        row = "  ".join(str(v) for v in values)
        print(f"{row}  | {result}")


def minterms_to_function(minterms, num_vars):
    """Create a Boolean function from a list of minterms."""
    def func(*args):
        index = 0
        for i, val in enumerate(args):
            index |= (val << (num_vars - 1 - i))
        return 1 if index in minterms else 0
    return func


def get_sop(minterms, num_vars):
    """Get Sum of Products canonical form as a string."""
    terms = []
    var_names = [chr(ord('a') + i) for i in range(num_vars)]
    for m in sorted(minterms):
        term = ""
        for i in range(num_vars):
            bit = (m >> (num_vars - 1 - i)) & 1
            if bit:
                term += var_names[i]
            else:
                term += var_names[i] + "'"
        terms.append(term)
    return " + ".join(terms)


def get_pos(minterms, num_vars):
    """Get Product of Sums canonical form as a string."""
    all_indices = set(range(1 << num_vars))
    maxterms = sorted(all_indices - set(minterms))
    var_names = [chr(ord('a') + i) for i in range(num_vars)]

    factors = []
    for m in maxterms:
        term_parts = []
        for i in range(num_vars):
            bit = (m >> (num_vars - 1 - i)) & 1
            if bit == 0:
                term_parts.append(var_names[i])
            else:
                term_parts.append(var_names[i] + "'")
        factors.append("(" + " + ".join(term_parts) + ")")
    return " · ".join(factors)


def simplify_kmap_2var(kmap):
    """Simplify a 2-variable K-map. kmap[a][b] = f(a,b)."""
    terms = []
    # Check for all ones
    if all(kmap[a][b] == 1 for a in range(2) for b in range(2)):
        return "1"
    # Check rows
    if kmap[0][0] == 1 and kmap[0][1] == 1:
        terms.append("a'")
    if kmap[1][0] == 1 and kmap[1][1] == 1:
        terms.append("a")
    # Check columns
    if kmap[0][0] == 1 and kmap[1][0] == 1:
        terms.append("b'")
    if kmap[0][1] == 1 and kmap[1][1] == 1:
        terms.append("b")
    # Check individual cells (only if not already covered)
    if not terms:
        for a in range(2):
            for b in range(2):
                if kmap[a][b] == 1:
                    t = ("a" if a else "a'") + ("b" if b else "b'")
                    terms.append(t)
    return " + ".join(terms) if terms else "0"


def verify_de_morgans():
    """Verify De Morgan's laws for all input combinations."""
    print("--- De Morgan's Law Verification ---")
    for a, b in product([0, 1], repeat=2):
        # NOT(a AND b) == (NOT a) OR (NOT b)
        lhs = 1 - (a & b)
        rhs = (1 - a) | (1 - b)
        assert lhs == rhs, f"De Morgan (NAND) failed for a={a}, b={b}"

        # NOT(a OR b) == (NOT a) AND (NOT b)
        lhs2 = 1 - (a | b)
        rhs2 = (1 - a) & (1 - b)
        assert lhs2 == rhs2, f"De Morgan (NOR) failed for a={a}, b={b}"

    print("De Morgan's laws verified for all inputs!")


if __name__ == "__main__":
    print("=== Boolean Algebra ===\n")

    # f(a,b,c) = Σm(1, 3, 5, 7) -- should simplify to c
    minterms = [1, 3, 5, 7]
    num_vars = 3
    func = minterms_to_function(minterms, num_vars)

    print(f"f(a,b,c) = Σm({', '.join(map(str, minterms))})")
    print(f"SOP: {get_sop(minterms, num_vars)}")
    print(f"POS: {get_pos(minterms, num_vars)}")
    print()

    truth_table(func, num_vars)
    print()

    verify_de_morgans()
    print()

    # K-map example
    print("--- 2-Variable K-map ---")
    kmap = [[0, 1], [0, 1]]  # f = b
    result = simplify_kmap_2var(kmap)
    print(f"K-map [[0,1],[0,1]] simplified to: f = {result}")
```

```javascript
// Boolean Algebra - Evaluation and Simplification

/**
 * Evaluate a Boolean function defined by its minterms.
 */
function evaluateFromMinterms(minterms, numVars, ...values) {
  let index = 0;
  for (let i = 0; i < numVars; i++) {
    index |= (values[i] << (numVars - 1 - i));
  }
  return minterms.includes(index) ? 1 : 0;
}

/**
 * Generate truth table for a function given by minterms.
 */
function generateTruthTable(minterms, numVars) {
  const varNames = Array.from({ length: numVars }, (_, i) =>
    String.fromCharCode(97 + i)
  );
  console.log(varNames.join("  ") + "  | f");
  console.log("-".repeat(numVars * 3 + 4));

  const total = 1 << numVars;
  for (let i = 0; i < total; i++) {
    const bits = [];
    for (let bit = numVars - 1; bit >= 0; bit--) {
      bits.push((i >> bit) & 1);
    }
    const result = minterms.includes(i) ? 1 : 0;
    console.log(bits.join("  ") + `  | ${result}`);
  }
}

/**
 * Get SOP (Sum of Products) canonical form.
 */
function getSOP(minterms, numVars) {
  const varNames = Array.from({ length: numVars }, (_, i) =>
    String.fromCharCode(97 + i)
  );
  const terms = minterms.map(m => {
    let term = "";
    for (let i = 0; i < numVars; i++) {
      const bit = (m >> (numVars - 1 - i)) & 1;
      term += bit ? varNames[i] : varNames[i] + "'";
    }
    return term;
  });
  return terms.join(" + ");
}

/**
 * Verify De Morgan's Laws for all inputs.
 */
function verifyDeMorgans() {
  console.log("--- De Morgan's Law Verification ---");
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      const nandLHS = 1 - (a & b);
      const nandRHS = (1 - a) | (1 - b);

      const norLHS = 1 - (a | b);
      const norRHS = (1 - a) & (1 - b);

      console.assert(nandLHS === nandRHS, `NAND De Morgan failed: a=${a}, b=${b}`);
      console.assert(norLHS === norRHS, `NOR De Morgan failed: a=${a}, b=${b}`);
    }
  }
  console.log("All De Morgan's laws verified!");
}

/**
 * Simplify using Boolean algebra rules (demonstration).
 */
function demonstrateSimplification() {
  console.log("\n--- Simplification Examples ---");

  // f = a·b + a·b' = a·(b + b') = a·1 = a
  console.log("f = a·b + a·b'");
  console.log("  = a·(b + b')  [Distributive]");
  console.log("  = a·1          [Complement]");
  console.log("  = a            [Identity]");

  // Verify by truth table
  console.log("\nVerification:");
  for (const a of [0, 1]) {
    for (const b of [0, 1]) {
      const original = (a & b) | (a & (1 - b));
      const simplified = a;
      console.log(`  a=${a}, b=${b}: original=${original}, simplified=${simplified}, match=${original === simplified}`);
    }
  }
}

// Main
console.log("=== Boolean Algebra ===\n");

const minterms = [1, 3, 5, 7]; // f(a,b,c) = c
const numVars = 3;

console.log(`f(a,b,c) = Σm(${minterms.join(", ")})`);
console.log(`SOP: ${getSOP(minterms, numVars)}\n`);

generateTruthTable(minterms, numVars);
console.log();

verifyDeMorgans();
demonstrateSimplification();
```

---

## Key Takeaways

1. **Boolean algebra** operates on $\{0, 1\}$ with AND ($\cdot$), OR ($+$), and NOT ($\overline{\phantom{x}}$), governed by axioms that enable systematic simplification.

2. **Canonical forms** — SOP (sum of minterms) and POS (product of maxterms) — provide standard representations for any Boolean function.

3. **Karnaugh maps** offer a visual, fast method for simplifying Boolean expressions with up to 4–5 variables by exploiting adjacency in Gray-coded grids.

4. **De Morgan's Laws** ($\overline{a + b} = \overline{a} \cdot \overline{b}$ and $\overline{a \cdot b} = \overline{a} + \overline{b}$) are fundamental for converting between AND/OR forms and for understanding universal gates.

5. **NAND and NOR gates** are universal — any circuit can be built from only one type, making them the building blocks of real hardware.

6. Boolean algebra connects directly to **digital circuit design**, **database query optimization**, and **formal verification** of systems.
