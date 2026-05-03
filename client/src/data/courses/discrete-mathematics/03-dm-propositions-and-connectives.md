---
title: Propositions & Logical Connectives
---

# Propositions & Logical Connectives

Logic is the foundation of all mathematics and computer science. Every `if` statement, every database query, every digital circuit is built on **propositional logic**. In this lesson, we'll learn the building blocks.

---

## What is a Proposition?

A **proposition** (or **statement**) is a declarative sentence that is either **true** or **false**, but not both.

### Examples of Propositions

| Statement | Proposition? | Truth Value |
|-----------|:---:|:---:|
| "The Earth is round." | ✅ Yes | True |
| "2 + 2 = 5" | ✅ Yes | False |
| "$7$ is a prime number." | ✅ Yes | True |
| "Paris is the capital of Germany." | ✅ Yes | False |
| "Every even number greater than 2 is the sum of two primes." | ✅ Yes | Unknown (Goldbach's conjecture) |

Even though we don't know the truth value of Goldbach's conjecture, it IS a proposition — it must be either true or false; we just haven't proven which one yet.

### NOT Propositions

| Statement | Why Not? |
|-----------|----------|
| "What time is it?" | It's a question, not a declaration |
| "Close the door!" | It's a command |
| "x + 5 = 10" | Truth depends on value of x (it's a **predicate**, covered later) |
| "This statement is false." | Paradox — neither true nor false (liar's paradox) |
| "Wow!" | Exclamation, no truth value |

### Notation

We typically use lowercase letters to represent propositions:

- $p$: "It is raining"
- $q$: "The ground is wet"
- $r$: "I will carry an umbrella"

The truth value of a proposition $p$ is denoted:
- $T$ or $1$ if $p$ is true
- $F$ or $0$ if $p$ is false

---

## Logical Connectives

Logical connectives combine simple propositions into **compound propositions**. Think of them as the "operators" of logic — just like $+$ and $\times$ combine numbers, connectives combine truth values.

---

## NOT — Negation (¬)

The **negation** of a proposition $p$ is written $\neg p$ (read "not p") and has the opposite truth value.

| $p$ | $\neg p$ |
|:---:|:---:|
| T | F |
| F | T |

### Examples

| Proposition $p$ | Negation $\neg p$ |
|----------------|-------------------|
| "It is sunny" | "It is not sunny" |
| "5 > 3" | "5 is not greater than 3" (i.e., $5 \leq 3$) |
| "The file exists" | "The file does not exist" |

### In Programming

```python
is_raining = True
not_raining = not is_raining  # False
```

```javascript
let isRaining = true;
let notRaining = !isRaining;  // false
```

### Important Note

The negation of "All students passed" is **NOT** "No students passed."

- Original: "All students passed" ($\forall$ students passed)
- Correct negation: "At least one student did not pass" ($\exists$ a student who didn't pass)

We'll explore this more when we cover quantifiers.

---

## AND — Conjunction (∧)

The **conjunction** of $p$ and $q$ is written $p \wedge q$ (read "p and q") and is true **only when both** $p$ and $q$ are true.

| $p$ | $q$ | $p \wedge q$ |
|:---:|:---:|:---:|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | F |

### Analogy

Think of AND as a **series circuit** — current flows only if BOTH switches are ON.

```
Switch A ——[ON]——Switch B——[ON]——💡 (Light ON)
Switch A ——[ON]——Switch B——[OFF]——💡 (Light OFF)
```

### Examples

| $p$ | $q$ | $p \wedge q$ | True? |
|-----|-----|-------------|:-----:|
| "It is sunny" | "It is warm" | "It is sunny AND warm" | Depends on weather |
| "$2 < 5$" | "$3$ is odd" | "$2 < 5$ AND $3$ is odd" | T (both true) |
| "$2 < 5$" | "$4$ is odd" | "$2 < 5$ AND $4$ is odd" | F ($q$ is false) |

### In Programming

```python
age = 20
has_id = True
can_enter = (age >= 18) and has_id  # True (both conditions met)
```

---

## OR — Disjunction (∨)

The **disjunction** of $p$ and $q$ is written $p \vee q$ (read "p or q") and is true **when at least one** of $p$ or $q$ is true.

| $p$ | $q$ | $p \vee q$ |
|:---:|:---:|:---:|
| T | T | T |
| T | F | T |
| F | T | T |
| F | F | F |

### Inclusive OR

This is the **inclusive OR** — it's true when one or both are true. This is the standard meaning in mathematics and most programming languages.

### Analogy

Think of OR as a **parallel circuit** — current flows if EITHER switch (or both) is ON.

### Important: Math OR ≠ Everyday English OR

In English, "or" is often **exclusive** (one or the other, not both):
- "Would you like coffee or tea?" (you pick one)

In math/logic, OR is **inclusive** (one or both):
- "$x$ is divisible by 2 or by 3" — could be both (e.g., $x = 6$)

### Examples

| $p$ | $q$ | $p \vee q$ | True? |
|-----|-----|-----------|:-----:|
| "It is sunny" | "It is warm" | "It is sunny OR warm" | True if either/both |
| "$5 > 3$" | "$2 > 7$" | "$5 > 3$ OR $2 > 7$" | T ($p$ is true) |
| "$1 > 5$" | "$2 > 7$" | "$1 > 5$ OR $2 > 7$" | F (both false) |

### In Programming

```python
is_weekend = True
is_holiday = False
day_off = is_weekend or is_holiday  # True (at least one is true)
```

---

## XOR — Exclusive OR (⊕)

The **exclusive or** of $p$ and $q$ is written $p \oplus q$ and is true **when exactly one** of $p$ or $q$ is true (but not both).

| $p$ | $q$ | $p \oplus q$ |
|:---:|:---:|:---:|
| T | T | F |
| T | F | T |
| F | T | T |
| F | F | F |

### XOR vs OR

The difference: XOR is **false** when both are true!

| $p$ | $q$ | $p \vee q$ (OR) | $p \oplus q$ (XOR) |
|:---:|:---:|:---:|:---:|
| T | T | **T** | **F** |
| T | F | T | T |
| F | T | T | T |
| F | F | F | F |

### Real-World XOR

- "You can have soup **or** salad" (restaurant menu — pick one, not both)
- A light switch: if you flip one switch, light changes state

### XOR in Computer Science

XOR is incredibly useful:
- **Swap two variables without a temp** (using XOR trick)
- **Encryption** (XOR with a key to encrypt, XOR again to decrypt)
- **Error detection** (parity bits)
- **Finding the unique element** in an array where all others appear twice

### In Programming

```python
a = True
b = False
result = a ^ b  # True (exactly one is true)
```

```javascript
let a = true;
let b = true;
let result = a ^ b;  // 0 (false — both same)
```

---

## Conditional — Implication (→)

The **conditional** (or **implication**) $p \rightarrow q$ is read "if $p$ then $q$" or "$p$ implies $q$."

- $p$ is called the **hypothesis** (or antecedent, premise)
- $q$ is called the **conclusion** (or consequent)

| $p$ | $q$ | $p \rightarrow q$ |
|:---:|:---:|:---:|
| T | T | T |
| T | F | **F** |
| F | T | T |
| F | F | T |

### The Tricky Part: Why is $F \rightarrow T$ true?

This confuses many students. Here's how to think about it:

**Think of $p \rightarrow q$ as a promise:**

"If it rains ($p$), I will bring an umbrella ($q$)."

| It rains? | Brought umbrella? | Promise broken? |
|:---------:|:-----------------:|:---------------:|
| Yes | Yes | No — promise kept ✓ |
| Yes | No | **Yes — LIAR!** ✗ |
| No | Yes | No — extra cautious, fine ✓ |
| No | No | No — rain didn't happen, promise doesn't apply ✓ |

The only way to **break** the promise is: the condition happened ($p$ is true) but you didn't follow through ($q$ is false).

If it didn't rain ($p$ is false), you can't be called a liar regardless of what you did — the promise was never activated.

### Another Way to Think About It

$p \rightarrow q$ is equivalent to $\neg p \vee q$ ("either $p$ is false, or $q$ is true").

Verify with truth table:

| $p$ | $q$ | $\neg p$ | $\neg p \vee q$ | $p \rightarrow q$ |
|:---:|:---:|:---:|:---:|:---:|
| T | T | F | T | T ✓ |
| T | F | F | F | F ✓ |
| F | T | T | T | T ✓ |
| F | F | T | T | T ✓ |

They match! So $p \rightarrow q \equiv \neg p \vee q$.

### Related Conditionals

Given the conditional $p \rightarrow q$:

| Name | Form | Example |
|------|------|---------|
| **Conditional** | $p \rightarrow q$ | If it rains, the ground is wet |
| **Converse** | $q \rightarrow p$ | If the ground is wet, it rained |
| **Inverse** | $\neg p \rightarrow \neg q$ | If it doesn't rain, the ground isn't wet |
| **Contrapositive** | $\neg q \rightarrow \neg p$ | If the ground isn't wet, it didn't rain |

**Key fact:** A conditional and its contrapositive are **logically equivalent**:

$$p \rightarrow q \equiv \neg q \rightarrow \neg p$$

But a conditional is NOT equivalent to its converse or inverse!

### In Programming

```python
# The conditional p → q in an if statement:
if is_raining:  # p
    bring_umbrella()  # q
# If not raining, we make no claim about umbrellas
```

---

## Biconditional (↔)

The **biconditional** $p \leftrightarrow q$ is read "$p$ if and only if $q$" (often abbreviated "iff").

It's true when $p$ and $q$ have the **same truth value**.

| $p$ | $q$ | $p \leftrightarrow q$ |
|:---:|:---:|:---:|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | T |

### Understanding Biconditional

$p \leftrightarrow q$ means:
- "$p$ implies $q$" AND "$q$ implies $p$"
- $p$ is true **exactly when** $q$ is true

$$p \leftrightarrow q \equiv (p \rightarrow q) \wedge (q \rightarrow p)$$

### Examples

- "You pass the course **if and only if** you score ≥ 60%"
  - Score ≥ 60% → you pass
  - You pass → your score was ≥ 60%
  
- "A triangle is equilateral **if and only if** all three sides are equal"
  - Both directions are true

### In Programming

```python
# Biconditional: p ↔ q is equivalent to (p == q)
p = True
q = True
biconditional = (p == q)  # True (same truth value)
```

---

## Operator Precedence

Just like arithmetic has PEMDAS, logic has a precedence order:

| Priority | Operator | Name | Symbol |
|:--------:|----------|------|:------:|
| 1 (highest) | Negation | NOT | $\neg$ |
| 2 | Conjunction | AND | $\wedge$ |
| 3 | Disjunction | OR | $\vee$ |
| 4 | Implication | IF-THEN | $\rightarrow$ |
| 5 (lowest) | Biconditional | IFF | $\leftrightarrow$ |

### Examples

- $\neg p \wedge q$ means $(\neg p) \wedge q$, NOT $\neg(p \wedge q)$
- $p \vee q \wedge r$ means $p \vee (q \wedge r)$, NOT $(p \vee q) \wedge r$
- $p \wedge q \rightarrow r$ means $(p \wedge q) \rightarrow r$

### Best Practice

When in doubt, **use parentheses** to make your intention clear! Both in math and in code.

---

## Translating English to Logic

One of the most practical skills: converting English sentences into logical expressions.

### Common Patterns

| English | Logic |
|---------|-------|
| "p and q" | $p \wedge q$ |
| "p but q" | $p \wedge q$ (same as "and"!) |
| "p or q" | $p \vee q$ (inclusive) |
| "either p or q" | $p \oplus q$ (often exclusive) |
| "not p" / "it is not the case that p" | $\neg p$ |
| "if p then q" / "p implies q" | $p \rightarrow q$ |
| "p only if q" | $p \rightarrow q$ |
| "p whenever q" | $q \rightarrow p$ |
| "p is necessary for q" | $q \rightarrow p$ |
| "p is sufficient for q" | $p \rightarrow q$ |
| "p if and only if q" | $p \leftrightarrow q$ |
| "p unless q" | $\neg q \rightarrow p$ (equivalently, $p \vee q$) |
| "neither p nor q" | $\neg p \wedge \neg q$ |

### Worked Examples

**Example 1:** "If it is sunny and warm, I will go to the beach."

Let:
- $s$: "It is sunny"
- $w$: "It is warm"  
- $b$: "I will go to the beach"

Translation: $(s \wedge w) \rightarrow b$

---

**Example 2:** "You can't enter unless you have a ticket."

Let:
- $e$: "You can enter"
- $t$: "You have a ticket"

"$e$ unless $t$" → $\neg t \rightarrow \neg e$ which is equivalent to $e \rightarrow t$

Meaning: entering requires a ticket. (Having a ticket is **necessary** for entry.)

---

**Example 3:** "Being a citizen is sufficient to vote, but not necessary."

Let:
- $c$: "You are a citizen"
- $v$: "You can vote"

"$c$ is sufficient for $v$": $c \rightarrow v$
"$c$ is not necessary for $v$": $\neg(v \rightarrow c)$

Combined: $(c \rightarrow v) \wedge \neg(v \rightarrow c)$

---

**Example 4:** "Neither the server is down nor the network is congested."

Let:
- $s$: "The server is down"
- $n$: "The network is congested"

Translation: $\neg s \wedge \neg n$

This is equivalent to $\neg(s \vee n)$ by De Morgan's law!

---

## Compound Propositions — Building Complex Expressions

You can combine connectives to build arbitrarily complex propositions:

**Example:** "If it is raining and I don't have an umbrella, then I will get wet."

- $r$: "It is raining"
- $u$: "I have an umbrella"
- $w$: "I will get wet"

Translation: $(r \wedge \neg u) \rightarrow w$

**Evaluating:** If $r = T$, $u = F$, $w = T$:
1. $\neg u = T$
2. $r \wedge \neg u = T \wedge T = T$
3. $(r \wedge \neg u) \rightarrow w = T \rightarrow T = T$ ✓

---

## Code Example: Truth Value Evaluator

Let's write a program that evaluates logical expressions given truth values for the variables.

```cpp
#include <iostream>
#include <string>
using namespace std;

// Logical operations
bool NOT(bool p) { return !p; }
bool AND(bool p, bool q) { return p && q; }
bool OR(bool p, bool q) { return p || q; }
bool XOR(bool p, bool q) { return p != q; }
bool IMPLIES(bool p, bool q) { return !p || q; }
bool IFF(bool p, bool q) { return p == q; }

void printTruth(bool val) {
    cout << (val ? "T" : "F");
}

int main() {
    cout << "=== Logical Connectives Truth Table ===" << endl;
    cout << "p | q | NOT p | p AND q | p OR q | p XOR q | p -> q | p <-> q" << endl;
    cout << "--|---|-------|---------|--------|---------|--------|--------" << endl;

    bool values[] = {true, false};
    for (bool p : values) {
        for (bool q : values) {
            printTruth(p); cout << " | ";
            printTruth(q); cout << " |   ";
            printTruth(NOT(p)); cout << "   |    ";
            printTruth(AND(p, q)); cout << "    |   ";
            printTruth(OR(p, q)); cout << "    |    ";
            printTruth(XOR(p, q)); cout << "    |   ";
            printTruth(IMPLIES(p, q)); cout << "    |    ";
            printTruth(IFF(p, q));
            cout << endl;
        }
    }

    // Example: Evaluate (p ∧ ¬q) → r
    cout << "\n=== Evaluating (p AND NOT q) -> r ===" << endl;
    bool p = true, q = false, r = true;
    bool result = IMPLIES(AND(p, NOT(q)), r);
    cout << "p=T, q=F, r=T: result = ";
    printTruth(result);
    cout << endl;

    return 0;
}
```

```csharp
using System;

class LogicEvaluator
{
    // Logical operations
    static bool Not(bool p) => !p;
    static bool And(bool p, bool q) => p && q;
    static bool Or(bool p, bool q) => p || q;
    static bool Xor(bool p, bool q) => p != q;
    static bool Implies(bool p, bool q) => !p || q;
    static bool Iff(bool p, bool q) => p == q;

    static string ToTruth(bool val) => val ? "T" : "F";

    static void Main()
    {
        Console.WriteLine("=== Logical Connectives Truth Table ===");
        Console.WriteLine("p | q | NOT p | p AND q | p OR q | p XOR q | p -> q | p <-> q");
        Console.WriteLine("--|---|-------|---------|--------|---------|--------|--------");

        bool[] values = { true, false };
        foreach (bool p in values)
        {
            foreach (bool q in values)
            {
                Console.WriteLine(
                    $"{ToTruth(p)} | {ToTruth(q)} |   {ToTruth(Not(p))}   |" +
                    $"    {ToTruth(And(p, q))}    |   {ToTruth(Or(p, q))}    |" +
                    $"    {ToTruth(Xor(p, q))}    |   {ToTruth(Implies(p, q))}    |" +
                    $"    {ToTruth(Iff(p, q))}");
            }
        }

        // Example: Evaluate (p ∧ ¬q) → r
        Console.WriteLine("\n=== Evaluating (p AND NOT q) -> r ===");
        bool pVal = true, qVal = false, rVal = true;
        bool result = Implies(And(pVal, Not(qVal)), rVal);
        Console.WriteLine($"p=T, q=F, r=T: result = {ToTruth(result)}");
    }
}
```

```java
public class LogicEvaluator {

    // Logical operations
    static boolean not(boolean p) { return !p; }
    static boolean and(boolean p, boolean q) { return p && q; }
    static boolean or(boolean p, boolean q) { return p || q; }
    static boolean xor(boolean p, boolean q) { return p != q; }
    static boolean implies(boolean p, boolean q) { return !p || q; }
    static boolean iff(boolean p, boolean q) { return p == q; }

    static String toTruth(boolean val) { return val ? "T" : "F"; }

    public static void main(String[] args) {
        System.out.println("=== Logical Connectives Truth Table ===");
        System.out.println("p | q | NOT p | p AND q | p OR q | p XOR q | p -> q | p <-> q");
        System.out.println("--|---|-------|---------|--------|---------|--------|--------");

        boolean[] values = {true, false};
        for (boolean p : values) {
            for (boolean q : values) {
                System.out.printf("%s | %s |   %s   |    %s    |   %s    |    %s    |   %s    |    %s%n",
                    toTruth(p), toTruth(q), toTruth(not(p)),
                    toTruth(and(p, q)), toTruth(or(p, q)),
                    toTruth(xor(p, q)), toTruth(implies(p, q)),
                    toTruth(iff(p, q)));
            }
        }

        // Example: Evaluate (p ∧ ¬q) → r
        System.out.println("\n=== Evaluating (p AND NOT q) -> r ===");
        boolean p = true, q = false, r = true;
        boolean result = implies(and(p, not(q)), r);
        System.out.println("p=T, q=F, r=T: result = " + toTruth(result));
    }
}
```

```python
def NOT(p):
    return not p

def AND(p, q):
    return p and q

def OR(p, q):
    return p or q

def XOR(p, q):
    return p != q

def IMPLIES(p, q):
    return (not p) or q

def IFF(p, q):
    return p == q

def to_truth(val):
    return "T" if val else "F"

# Print complete truth table
print("=== Logical Connectives Truth Table ===")
print("p | q | NOT p | p AND q | p OR q | p XOR q | p -> q | p <-> q")
print("--|---|-------|---------|--------|---------|--------|--------")

for p in [True, False]:
    for q in [True, False]:
        print(f"{to_truth(p)} | {to_truth(q)} |   {to_truth(NOT(p))}   |"
              f"    {to_truth(AND(p, q))}    |   {to_truth(OR(p, q))}    |"
              f"    {to_truth(XOR(p, q))}    |   {to_truth(IMPLIES(p, q))}    |"
              f"    {to_truth(IFF(p, q))}")

# Example: Evaluate (p ∧ ¬q) → r
print("\n=== Evaluating (p AND NOT q) -> r ===")
p, q, r = True, False, True
result = IMPLIES(AND(p, NOT(q)), r)
print(f"p=T, q=F, r=T: result = {to_truth(result)}")
```

```javascript
function NOT(p) { return !p; }
function AND(p, q) { return p && q; }
function OR(p, q) { return p || q; }
function XOR(p, q) { return p !== q; }
function IMPLIES(p, q) { return !p || q; }
function IFF(p, q) { return p === q; }

function toTruth(val) { return val ? "T" : "F"; }

// Print complete truth table
console.log("=== Logical Connectives Truth Table ===");
console.log("p | q | NOT p | p AND q | p OR q | p XOR q | p -> q | p <-> q");
console.log("--|---|-------|---------|--------|---------|--------|--------");

for (const p of [true, false]) {
    for (const q of [true, false]) {
        console.log(
            `${toTruth(p)} | ${toTruth(q)} |   ${toTruth(NOT(p))}   |` +
            `    ${toTruth(AND(p, q))}    |   ${toTruth(OR(p, q))}    |` +
            `    ${toTruth(XOR(p, q))}    |   ${toTruth(IMPLIES(p, q))}    |` +
            `    ${toTruth(IFF(p, q))}`
        );
    }
}

// Example: Evaluate (p ∧ ¬q) → r
console.log("\n=== Evaluating (p AND NOT q) -> r ===");
const p = true, q = false, r = true;
const result = IMPLIES(AND(p, NOT(q)), r);
console.log(`p=T, q=F, r=T: result = ${toTruth(result)}`);
```

---

## Practice Problems

### Problem 1
Let $p$ = "It is cold" and $q$ = "It is snowing." Translate each into English:

a) $\neg p$
b) $p \wedge q$
c) $p \vee q$
d) $p \rightarrow q$
e) $\neg p \wedge q$

<details>
<summary><strong>Solutions</strong></summary>

a) "It is not cold."
b) "It is cold and it is snowing."
c) "It is cold or it is snowing (or both)."
d) "If it is cold, then it is snowing."
e) "It is not cold and it is snowing."

</details>

### Problem 2
Determine the truth value of each compound proposition, given $p = T$, $q = F$, $r = T$:

a) $p \wedge q$
b) $p \vee q$
c) $\neg p \vee r$
d) $p \rightarrow q$
e) $(p \wedge r) \rightarrow q$
f) $p \leftrightarrow r$

<details>
<summary><strong>Solutions</strong></summary>

a) $T \wedge F = F$
b) $T \vee F = T$
c) $F \vee T = T$
d) $T \rightarrow F = F$
e) $(T \wedge T) \rightarrow F = T \rightarrow F = F$
f) $T \leftrightarrow T = T$

</details>

### Problem 3
Translate into logical notation:

a) "If the password is correct and the account is not locked, then access is granted."
b) "The alarm sounds if and only if a door or window is opened."
c) "You won't pass unless you study."

<details>
<summary><strong>Solutions</strong></summary>

Let $p$ = "password correct", $l$ = "account locked", $a$ = "access granted", $s$ = "alarm sounds", $d$ = "door opened", $w$ = "window opened", $pass$ = "you pass", $study$ = "you study"

a) $(p \wedge \neg l) \rightarrow a$
b) $s \leftrightarrow (d \vee w)$
c) $\neg study \rightarrow \neg pass$, equivalently: $pass \rightarrow study$

</details>

---

## Key Takeaways

- A **proposition** is a statement that is either true or false (not both, not neither)
- The five main **connectives** are: NOT ($\neg$), AND ($\wedge$), OR ($\vee$), implication ($\rightarrow$), biconditional ($\leftrightarrow$)
- **XOR** ($\oplus$) is exclusive or — true when exactly one operand is true
- The **conditional** $p \rightarrow q$ is false ONLY when $p$ is true and $q$ is false
- A conditional equals its **contrapositive** ($\neg q \rightarrow \neg p$) but NOT its converse or inverse
- The **biconditional** $p \leftrightarrow q$ means both directions of implication hold
- **Precedence**: NOT > AND > OR > → > ↔ (use parentheses when in doubt!)
- Translating English to logic is a critical skill — watch out for tricky words like "unless," "only if," and "necessary/sufficient"

---

*Next lesson: Truth Tables & Logical Equivalences — we'll build truth tables systematically and discover powerful laws for simplifying logical expressions.*
