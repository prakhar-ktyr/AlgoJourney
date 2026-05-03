---
title: Rules of Inference
---

# Rules of Inference

Rules of inference are the logical tools that allow us to derive new truths from established ones. Think of them as the "legal moves" in a game of logic — each rule guarantees that if your premises are true, your conclusion must also be true.

---

## Why Rules of Inference Matter

Every time you write an `if` statement, chain conditions together, or debug code by eliminating possibilities, you're applying rules of inference — often without realizing it. Understanding these rules formally helps you:

- Write airtight proofs in mathematics and computer science
- Build correct algorithms and verify their logic
- Avoid subtle reasoning errors (fallacies) that lead to bugs
- Construct valid arguments in everyday life and technical discussions

---

## The Foundation: Valid Arguments

An **argument** is a sequence of statements (premises) followed by a conclusion. An argument is **valid** if the conclusion necessarily follows from the premises.

$$
\text{Premise 1} \\
\text{Premise 2} \\
\vdots \\
\therefore \text{Conclusion}
$$

> **Real-world analogy:** Think of a recipe. If you follow each step correctly (premises), you're guaranteed to get the dish (conclusion). A valid argument is like a foolproof recipe — follow the steps, get the result.

---

## Fundamental Rules of Inference

### 1. Modus Ponens (Law of Detachment)

**If $p$ then $q$. $p$ is true. Therefore $q$ is true.**

$$
\frac{p \to q, \quad p}{\therefore q}
$$

This is the most intuitive rule. If you know "rain implies wet streets" and "it's raining," you can conclude "streets are wet."

**Example:**
- Premise 1: If the password is correct, access is granted. $(p \to q)$
- Premise 2: The password is correct. $(p)$
- Conclusion: Access is granted. $(q)$

---

### 2. Modus Tollens (Contrapositive Reasoning)

**If $p$ then $q$. $q$ is false. Therefore $p$ is false.**

$$
\frac{p \to q, \quad \neg q}{\therefore \neg p}
$$

This is like detective work — reasoning backwards from a missing consequence to deny the cause.

**Example:**
- Premise 1: If the server is running, the health check returns 200. $(p \to q)$
- Premise 2: The health check did NOT return 200. $(\neg q)$
- Conclusion: The server is NOT running. $(\neg p)$

> **Real-world analogy:** If the alarm didn't go off, the burglar didn't trip the sensor. You're reasoning from the absence of an effect back to the absence of a cause.

---

### 3. Hypothetical Syllogism (Chain Rule)

**If $p$ then $q$. If $q$ then $r$. Therefore, if $p$ then $r$.**

$$
\frac{p \to q, \quad q \to r}{\therefore p \to r}
$$

This lets you chain implications together, like connecting links in a logical chain.

**Example:**
- Premise 1: If I study, I pass the exam. $(p \to q)$
- Premise 2: If I pass the exam, I graduate. $(q \to r)$
- Conclusion: If I study, I graduate. $(p \to r)$

> **Real-world analogy:** Function composition in programming! If `f(x)` produces `y` and `g(y)` produces `z`, then `g(f(x))` produces `z`.

---

### 4. Disjunctive Syllogism (Elimination)

**Either $p$ or $q$. Not $p$. Therefore $q$.**

$$
\frac{p \lor q, \quad \neg p}{\therefore q}
$$

When you have two options and eliminate one, the other must be true.

**Example:**
- Premise 1: The bug is in the frontend or the backend. $(p \lor q)$
- Premise 2: The bug is NOT in the frontend. $(\neg p)$
- Conclusion: The bug is in the backend. $(q)$

> **Real-world analogy:** Debugging by elimination — you test one subsystem, rule it out, and conclude the problem is elsewhere.

---

### 5. Addition (Disjunction Introduction)

**$p$ is true. Therefore $p$ or $q$.**

$$
\frac{p}{\therefore p \lor q}
$$

If something is true, then "it or anything else" is also true. This might seem trivial, but it's crucial in formal proofs.

**Example:**
- Premise: The file exists. $(p)$
- Conclusion: The file exists OR the file was just created. $(p \lor q)$

---

### 6. Simplification (Conjunction Elimination)

**$p$ and $q$ is true. Therefore $p$ is true.**

$$
\frac{p \land q}{\therefore p}
$$

If you know two things are both true, you can extract either one individually.

**Example:**
- Premise: The user is authenticated AND has admin role. $(p \land q)$
- Conclusion: The user is authenticated. $(p)$

---

### 7. Conjunction (Conjunction Introduction)

**$p$ is true. $q$ is true. Therefore $p$ and $q$.**

$$
\frac{p, \quad q}{\therefore p \land q}
$$

If you've established two facts independently, you can combine them.

**Example:**
- Premise 1: The input is valid. $(p)$
- Premise 2: The database is connected. $(q)$
- Conclusion: The input is valid AND the database is connected. $(p \land q)$

---

### 8. Resolution

**$p$ or $q$. Not $p$ or $r$. Therefore $q$ or $r$.**

$$
\frac{p \lor q, \quad \neg p \lor r}{\therefore q \lor r}
$$

Resolution is the workhorse of automated theorem provers and logic programming (Prolog). It combines two clauses by "canceling" complementary literals.

**Example:**
- Premise 1: It's sunny or I'll take an umbrella. $(p \lor q)$
- Premise 2: It's not sunny or I'll wear sunscreen. $(\neg p \lor r)$
- Conclusion: I'll take an umbrella or I'll wear sunscreen. $(q \lor r)$

---

## Complete Reference Table

| # | Rule | Premises | Conclusion |
|---|------|----------|------------|
| 1 | Modus Ponens | $p \to q, \; p$ | $q$ |
| 2 | Modus Tollens | $p \to q, \; \neg q$ | $\neg p$ |
| 3 | Hypothetical Syllogism | $p \to q, \; q \to r$ | $p \to r$ |
| 4 | Disjunctive Syllogism | $p \lor q, \; \neg p$ | $q$ |
| 5 | Addition | $p$ | $p \lor q$ |
| 6 | Simplification | $p \land q$ | $p$ |
| 7 | Conjunction | $p, \; q$ | $p \land q$ |
| 8 | Resolution | $p \lor q, \; \neg p \lor r$ | $q \lor r$ |

---

## Common Fallacies

Fallacies are invalid arguments that *look* convincing but don't logically hold. Recognizing them is just as important as knowing valid rules.

### Fallacy 1: Affirming the Consequent

**Invalid form:** If $p$ then $q$. $q$ is true. Therefore $p$ is true.

$$
\frac{p \to q, \quad q}{\therefore p} \quad \text{(INVALID!)}
$$

**Why it fails:** Many different causes can produce the same effect.

**Example of the fallacy:**
- If it rained, the ground is wet. $(p \to q)$
- The ground is wet. $(q)$
- ~~Therefore it rained.~~ (WRONG — maybe the sprinklers were on!)

**In programming:** "If there's a null pointer exception, the program crashes. The program crashed. Therefore there was a null pointer exception." — Wrong! Many things cause crashes.

---

### Fallacy 2: Denying the Antecedent

**Invalid form:** If $p$ then $q$. $p$ is false. Therefore $q$ is false.

$$
\frac{p \to q, \quad \neg p}{\therefore \neg q} \quad \text{(INVALID!)}
$$

**Why it fails:** There may be other ways to reach the conclusion.

**Example of the fallacy:**
- If you have a degree, you can get this job. $(p \to q)$
- You don't have a degree. $(\neg p)$
- ~~Therefore you can't get this job.~~ (WRONG — experience might qualify you too!)

**In programming:** "If the cache is hit, the response is fast. The cache wasn't hit. Therefore the response isn't fast." — Wrong! The database might be fast too.

---

### How to Spot Fallacies

| Valid Rule | Looks Like (Fallacy) |
|-----------|---------------------|
| Modus Ponens: $p \to q, \; p \Rightarrow q$ | Affirming Consequent: $p \to q, \; q \Rightarrow p$ |
| Modus Tollens: $p \to q, \; \neg q \Rightarrow \neg p$ | Denying Antecedent: $p \to q, \; \neg p \Rightarrow \neg q$ |

> **Tip:** Valid rules work with the "front" ($p$) of the implication in Modus Ponens and the "back" ($\neg q$) in Modus Tollens. Fallacies do the reverse.

---

## Building Valid Arguments: Worked Examples

### Example 1: A Simple Chain

**Prove:** Given the premises below, show that "I will get a raise."

1. If I finish the project on time, my manager will be happy. $(p \to q)$
2. If my manager is happy, I will get a raise. $(q \to r)$
3. I finished the project on time. $(p)$

**Proof:**

| Step | Statement | Justification |
|------|-----------|---------------|
| 1 | $p \to q$ | Premise |
| 2 | $q \to r$ | Premise |
| 3 | $p$ | Premise |
| 4 | $q$ | Modus Ponens (1, 3) |
| 5 | $r$ | Modus Ponens (2, 4) |

Therefore: I will get a raise. $\square$

---

### Example 2: Elimination and Chaining

**Prove:** Given the premises below, show that "The system uses encryption."

1. The system is web-based or desktop-based. $(p \lor q)$
2. The system is not desktop-based. $(\neg q)$
3. If the system is web-based, it handles sensitive data. $(p \to r)$
4. If the system handles sensitive data, it uses encryption. $(r \to s)$

**Proof:**

| Step | Statement | Justification |
|------|-----------|---------------|
| 1 | $p \lor q$ | Premise |
| 2 | $\neg q$ | Premise |
| 3 | $p$ | Disjunctive Syllogism (1, 2) |
| 4 | $p \to r$ | Premise |
| 5 | $r$ | Modus Ponens (4, 3) |
| 6 | $r \to s$ | Premise |
| 7 | $s$ | Modus Ponens (6, 5) |

Therefore: The system uses encryption. $\square$

---

### Example 3: Using Modus Tollens and Conjunction

**Prove:** Given the premises below, show that "The code has a bug AND the tests are incomplete."

1. If all tests pass, the build is green. $(p \to q)$
2. The build is not green. $(\neg q)$
3. If not all tests pass, the code has a bug. $(\neg p \to r)$
4. The tests are incomplete. $(s)$

**Proof:**

| Step | Statement | Justification |
|------|-----------|---------------|
| 1 | $p \to q$ | Premise |
| 2 | $\neg q$ | Premise |
| 3 | $\neg p$ | Modus Tollens (1, 2) |
| 4 | $\neg p \to r$ | Premise |
| 5 | $r$ | Modus Ponens (4, 3) |
| 6 | $s$ | Premise |
| 7 | $r \land s$ | Conjunction (5, 6) |

Therefore: The code has a bug AND the tests are incomplete. $\square$

---

## Code: Simple Argument Validator

The following program validates arguments using the rules of inference. It checks whether a conclusion follows from given premises.

```python
"""
Simple Argument Validator
Demonstrates rules of inference programmatically.
"""

def modus_ponens(implication, p_value):
    """If p -> q and p is True, return q."""
    p, q = implication
    if p_value == p:
        return q
    return None

def modus_tollens(implication, not_q):
    """If p -> q and q is False, return not p."""
    p, q = implication
    if not_q == (not q):
        return not p
    return None

def hypothetical_syllogism(imp1, imp2):
    """If p -> q and q -> r, return p -> r."""
    p, q1 = imp1
    q2, r = imp2
    if q1 == q2:
        return (p, r)
    return None

def disjunctive_syllogism(disjunction, negated):
    """If p or q, and not p, return q."""
    p, q = disjunction
    if negated == (not p):
        return q
    elif negated == (not q):
        return p
    return None

# --- Demonstration ---

print("=== Rules of Inference Validator ===\n")

# Example 1: Modus Ponens
print("--- Modus Ponens ---")
# "If it rains (True), streets are wet (True)"
implication = (True, True)  # p -> q represented as (p_val, q_val)
premise_p = True
result = modus_ponens(implication, premise_p)
print(f"  p -> q: {implication}")
print(f"  p = {premise_p}")
print(f"  Conclusion (q): {result}")

# Example 2: Modus Tollens
print("\n--- Modus Tollens ---")
print("  If server running -> health check 200")
print("  Health check != 200")
print("  Conclusion: Server NOT running")
# We know: if running(True) -> healthy(True)
# We observe: not healthy (True that q is false)
result = modus_tollens((True, True), True)
print(f"  Server running: {result}")

# Example 3: Hypothetical Syllogism
print("\n--- Hypothetical Syllogism ---")
chain = hypothetical_syllogism(("study", "pass"), ("pass", "graduate"))
print(f"  study -> pass, pass -> graduate")
print(f"  Conclusion: {chain[0]} -> {chain[1]}")

# Example 4: Disjunctive Syllogism
print("\n--- Disjunctive Syllogism ---")
options = ("frontend_bug", "backend_bug")
eliminated = True  # not frontend_bug
result = disjunctive_syllogism(options, True)
print(f"  Bug is in frontend OR backend")
print(f"  NOT in frontend")
print(f"  Conclusion: Bug is in {result}")
```

```javascript
/**
 * Argument Validator - JavaScript Implementation
 * Validates logical arguments using rules of inference.
 */

class ArgumentValidator {
  constructor() {
    this.premises = [];
    this.conclusions = [];
  }

  addPremise(type, ...args) {
    this.premises.push({ type, args });
  }

  // Apply Modus Ponens: p -> q, p |- q
  applyModusPonens(implication, fact) {
    if (implication.antecedent === fact) {
      return implication.consequent;
    }
    return null;
  }

  // Apply Modus Tollens: p -> q, !q |- !p
  applyModusTollens(implication, negatedConsequent) {
    if (negatedConsequent === `NOT(${implication.consequent})`) {
      return `NOT(${implication.antecedent})`;
    }
    return null;
  }

  // Apply Disjunctive Syllogism: p OR q, NOT p |- q
  applyDisjunctiveSyllogism(disjunction, negated) {
    if (negated === `NOT(${disjunction.left})`) {
      return disjunction.right;
    }
    if (negated === `NOT(${disjunction.right})`) {
      return disjunction.left;
    }
    return null;
  }

  // Validate a complete argument
  validate(premises, conclusion) {
    const derived = new Set();
    const steps = [];

    for (const premise of premises) {
      if (premise.type === "fact") {
        derived.add(premise.value);
        steps.push(`  Known: ${premise.value}`);
      }
    }

    for (const premise of premises) {
      if (premise.type === "implication" && derived.has(premise.antecedent)) {
        const result = this.applyModusPonens(premise, premise.antecedent);
        if (result) {
          derived.add(result);
          steps.push(`  Modus Ponens: ${premise.antecedent} -> ${result}`);
        }
      }
    }

    const isValid = derived.has(conclusion);
    return { isValid, steps, derived: [...derived] };
  }
}

// --- Demonstration ---
const validator = new ArgumentValidator();

const premises = [
  { type: "fact", value: "project_done" },
  { type: "implication", antecedent: "project_done", consequent: "manager_happy" },
  { type: "implication", antecedent: "manager_happy", consequent: "get_raise" },
];

const result = validator.validate(premises, "get_raise");
console.log("Argument Valid:", result.isValid);
console.log("Derivation Steps:");
result.steps.forEach((s) => console.log(s));
console.log("All derived facts:", result.derived);
```

```java
import java.util.*;

/**
 * Argument Validator - Demonstrates rules of inference.
 */
public class ArgumentValidator {

    // Represents an implication: antecedent -> consequent
    record Implication(String antecedent, String consequent) {}

    public static String modusPonens(Implication imp, Set<String> facts) {
        if (facts.contains(imp.antecedent())) {
            return imp.consequent();
        }
        return null;
    }

    public static String modusTollens(Implication imp, Set<String> negatedFacts) {
        if (negatedFacts.contains(imp.consequent())) {
            return "NOT(" + imp.antecedent() + ")";
        }
        return null;
    }

    public static boolean validateArgument(
            List<Implication> implications,
            Set<String> knownFacts,
            String goal) {

        Set<String> derived = new HashSet<>(knownFacts);
        boolean changed = true;

        while (changed) {
            changed = false;
            for (Implication imp : implications) {
                String result = modusPonens(imp, derived);
                if (result != null && !derived.contains(result)) {
                    derived.add(result);
                    System.out.println("  Derived: " + result +
                        " (from " + imp.antecedent() + " -> " + imp.consequent() + ")");
                    changed = true;
                }
            }
        }

        return derived.contains(goal);
    }

    public static void main(String[] args) {
        List<Implication> rules = List.of(
            new Implication("study", "pass_exam"),
            new Implication("pass_exam", "graduate"),
            new Implication("graduate", "get_job")
        );

        Set<String> facts = new HashSet<>(Set.of("study"));

        System.out.println("Given: study is true");
        System.out.println("Rules: study->pass, pass->graduate, graduate->job");
        System.out.println("\nDerivation:");

        boolean valid = validateArgument(rules, facts, "get_job");
        System.out.println("\nConclusion 'get_job' is " + (valid ? "VALID" : "INVALID"));
    }
}
```

---

## Practice Tips

1. **Identify the rule:** When you see an argument, try to match it to one of the eight rules.
2. **Watch for fallacies:** Before accepting a conclusion, check you're not affirming the consequent or denying the antecedent.
3. **Chain rules together:** Complex proofs combine multiple rules — practice building step-by-step derivations.
4. **Think computationally:** Each rule is like a function that takes premises and returns a conclusion.

---

## Key Takeaways

- **Modus Ponens** and **Modus Tollens** are the two most commonly used rules — master them first.
- **Hypothetical Syllogism** lets you chain implications (like function composition).
- **Disjunctive Syllogism** is the logical basis of debugging by elimination.
- **Resolution** powers automated theorem provers and Prolog-style logic programming.
- **Affirming the Consequent** and **Denying the Antecedent** are the two most common fallacies — always check you're applying rules in the correct direction.
- Valid arguments guarantee truth-preservation: if premises are true, the conclusion MUST be true.
- Building proofs is about selecting the right rule at each step and applying it to known facts until you reach your goal.
