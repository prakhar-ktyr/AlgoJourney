---
title: LL(1) Parsing
---

# LL(1) Parsing

In this lesson, you will learn about **LL(1) parsing** — a systematic, table-driven approach to top-down parsing. You will learn to compute FIRST and FOLLOW sets, build an LL(1) parse table, and implement a stack-based parser that uses the table to make parsing decisions.

---

## What Does LL(1) Mean?

**LL(1)** stands for:

- **L**: scan input **L**eft to right
- **L**: produce a **L**eftmost derivation
- **1**: use **1** token of lookahead

An LL(1) parser reads the input from left to right, produces a leftmost derivation, and needs only the current token to decide which production to apply — no backtracking required.

---

## Overview of the LL(1) Approach

```
Grammar → Compute FIRST sets → Compute FOLLOW sets → Build Parse Table → Parse!
```

| Step | Input | Output |
|------|-------|--------|
| 1. FIRST sets | Grammar | For each symbol, what terminals can it start with? |
| 2. FOLLOW sets | Grammar + FIRST | For each non-terminal, what can follow it? |
| 3. Parse table | FIRST + FOLLOW | Table $M[A, a]$ → which production to use |
| 4. Parsing | Table + Input | Derivation (or error) |

---

## FIRST Sets

### Definition

$\text{FIRST}(\alpha)$ is the set of **terminals** that can appear as the first symbol of any string derived from $\alpha$.

$$\text{FIRST}(\alpha) = \{ a \in \Sigma \mid \alpha \Rightarrow^* a\beta \text{ for some } \beta \}$$

If $\alpha$ can derive the empty string:

$$\text{If } \alpha \Rightarrow^* \varepsilon, \text{ then } \varepsilon \in \text{FIRST}(\alpha)$$

### Rules for Computing FIRST

1. **If $X$ is a terminal**: $\text{FIRST}(X) = \{X\}$

2. **If $X$ is a non-terminal** with production $X \to Y_1 Y_2 \cdots Y_k$:
   - Add $\text{FIRST}(Y_1) - \{\varepsilon\}$ to $\text{FIRST}(X)$
   - If $\varepsilon \in \text{FIRST}(Y_1)$: add $\text{FIRST}(Y_2) - \{\varepsilon\}$
   - If $\varepsilon \in \text{FIRST}(Y_1)$ and $\varepsilon \in \text{FIRST}(Y_2)$: add $\text{FIRST}(Y_3) - \{\varepsilon\}$
   - Continue until some $Y_i$ doesn't derive $\varepsilon$
   - If ALL $Y_i$ can derive $\varepsilon$: add $\varepsilon$ to $\text{FIRST}(X)$

3. **If $X \to \varepsilon$** is a production: $\varepsilon \in \text{FIRST}(X)$

### Algorithm

```python
def compute_first_sets(grammar):
    first = {symbol: set() for symbol in grammar.all_symbols}

    # Rule 1: FIRST of a terminal is itself
    for terminal in grammar.terminals:
        first[terminal] = {terminal}

    # Iterate until no changes
    changed = True
    while changed:
        changed = False
        for production in grammar.productions:  # A → Y1 Y2 ... Yk
            A = production.lhs
            rhs = production.rhs

            if len(rhs) == 0:  # A → ε
                if EPSILON not in first[A]:
                    first[A].add(EPSILON)
                    changed = True
                continue

            # Add FIRST(Y1), FIRST(Y2), ... as needed
            all_nullable = True
            for Yi in rhs:
                # Add FIRST(Yi) - {ε} to FIRST(A)
                for symbol in first[Yi] - {EPSILON}:
                    if symbol not in first[A]:
                        first[A].add(symbol)
                        changed = True

                # Stop if Yi cannot derive ε
                if EPSILON not in first[Yi]:
                    all_nullable = False
                    break

            # If all symbols in RHS can derive ε
            if all_nullable:
                if EPSILON not in first[A]:
                    first[A].add(EPSILON)
                    changed = True

    return first
```

### Example

Grammar:
$$
\begin{aligned}
E &\to T\ E' \\
E' &\to +\ T\ E' \mid \varepsilon \\
T &\to F\ T' \\
T' &\to *\ F\ T' \mid \varepsilon \\
F &\to (\ E\ ) \mid \text{id}
\end{aligned}
$$

Computing FIRST sets:

| Symbol | FIRST |
|--------|-------|
| $E$ | $\{\ (\ ,\ \text{id}\ \}$ |
| $E'$ | $\{\ +\ ,\ \varepsilon\ \}$ |
| $T$ | $\{\ (\ ,\ \text{id}\ \}$ |
| $T'$ | $\{\ *\ ,\ \varepsilon\ \}$ |
| $F$ | $\{\ (\ ,\ \text{id}\ \}$ |

Step-by-step:
- $\text{FIRST}(F)$: from $F \to (E)$, add `(`; from $F \to \text{id}$, add `id` → $\{(, \text{id}\}$
- $\text{FIRST}(T)$: from $T \to F T'$, since $F$ cannot derive $\varepsilon$, $\text{FIRST}(T) = \text{FIRST}(F) = \{(, \text{id}\}$
- $\text{FIRST}(T')$: from $T' \to * F T'$, add `*`; from $T' \to \varepsilon$, add $\varepsilon$ → $\{*, \varepsilon\}$
- $\text{FIRST}(E)$: from $E \to T E'$, since $T$ cannot derive $\varepsilon$, $\text{FIRST}(E) = \text{FIRST}(T) = \{(, \text{id}\}$
- $\text{FIRST}(E')$: from $E' \to + T E'$, add `+`; from $E' \to \varepsilon$, add $\varepsilon$ → $\{+, \varepsilon\}$

---

## FOLLOW Sets

### Definition

$\text{FOLLOW}(A)$ is the set of terminals that can appear **immediately after** $A$ in some derivation from the start symbol.

$$\text{FOLLOW}(A) = \{ a \in \Sigma \mid S \Rightarrow^* \alpha A a \beta \text{ for some } \alpha, \beta \}$$

### Rules for Computing FOLLOW

1. **Start symbol**: $\$ \in \text{FOLLOW}(S)$ (end-of-input marker)

2. **If $A \to \alpha B \beta$** (B appears in a production):
   - Add $\text{FIRST}(\beta) - \{\varepsilon\}$ to $\text{FOLLOW}(B)$

3. **If $A \to \alpha B$** (B is at the end), OR **$A \to \alpha B \beta$** where $\varepsilon \in \text{FIRST}(\beta)$:
   - Add $\text{FOLLOW}(A)$ to $\text{FOLLOW}(B)$

### Algorithm

```python
def compute_follow_sets(grammar, first):
    follow = {nt: set() for nt in grammar.nonterminals}

    # Rule 1: $ in FOLLOW(start symbol)
    follow[grammar.start_symbol].add('$')

    changed = True
    while changed:
        changed = False
        for production in grammar.productions:  # A → X1 X2 ... Xn
            A = production.lhs
            rhs = production.rhs

            for i, B in enumerate(rhs):
                if B not in grammar.nonterminals:
                    continue  # Only compute FOLLOW for non-terminals

                # β = everything after B
                beta = rhs[i + 1:]

                # Rule 2: Add FIRST(β) - {ε} to FOLLOW(B)
                first_beta = compute_first_of_string(beta, first)
                for symbol in first_beta - {EPSILON}:
                    if symbol not in follow[B]:
                        follow[B].add(symbol)
                        changed = True

                # Rule 3: If β →* ε (or β is empty), add FOLLOW(A) to FOLLOW(B)
                if EPSILON in first_beta or len(beta) == 0:
                    for symbol in follow[A]:
                        if symbol not in follow[B]:
                            follow[B].add(symbol)
                            changed = True

    return follow
```

### Example (continuing from above)

Computing FOLLOW sets:

| Non-terminal | FOLLOW |
|-------------|--------|
| $E$ | $\{\ )\ ,\ \$\ \}$ |
| $E'$ | $\{\ )\ ,\ \$\ \}$ |
| $T$ | $\{\ +\ ,\ )\ ,\ \$\ \}$ |
| $T'$ | $\{\ +\ ,\ )\ ,\ \$\ \}$ |
| $F$ | $\{\ *\ ,\ +\ ,\ )\ ,\ \$\ \}$ |

Step-by-step:
- $\text{FOLLOW}(E)$: Start symbol → add `$`; From $F \to (E)$ → add `)` → $\{), \$\}$
- $\text{FOLLOW}(E')$: From $E \to TE'$, $E'$ is at end → add $\text{FOLLOW}(E) = \{), \$\}$
- $\text{FOLLOW}(T)$: From $E \to TE'$, $\text{FIRST}(E') - \{\varepsilon\} = \{+\}$; since $\varepsilon \in \text{FIRST}(E')$, also add $\text{FOLLOW}(E)$ → $\{+, ), \$\}$
- $\text{FOLLOW}(T')$: From $T \to FT'$, $T'$ is at end → add $\text{FOLLOW}(T) = \{+, ), \$\}$
- $\text{FOLLOW}(F)$: From $T \to FT'$, $\text{FIRST}(T') - \{\varepsilon\} = \{*\}$; since $\varepsilon \in \text{FIRST}(T')$, also add $\text{FOLLOW}(T)$ → $\{*, +, ), \$\}$

---

## LL(1) Parse Table Construction

### The Algorithm

For each production $A \to \alpha$:

1. For each terminal $a \in \text{FIRST}(\alpha)$:
   - Add $A \to \alpha$ to $M[A, a]$

2. If $\varepsilon \in \text{FIRST}(\alpha)$:
   - For each terminal $b \in \text{FOLLOW}(A)$:
     - Add $A \to \alpha$ to $M[A, b]$
   - If $\$ \in \text{FOLLOW}(A)$:
     - Add $A \to \alpha$ to $M[A, \$]$

### Implementation

```python
def build_parse_table(grammar, first, follow):
    table = {}  # table[(A, a)] = production

    for production in grammar.productions:
        A = production.lhs
        alpha = production.rhs

        # Compute FIRST(alpha)
        first_alpha = compute_first_of_string(alpha, first)

        # Rule 1: For each terminal a in FIRST(alpha)
        for a in first_alpha:
            if a != EPSILON:
                if (A, a) in table:
                    raise Exception(f"LL(1) conflict at M[{A}, {a}]")
                table[(A, a)] = production

        # Rule 2: If ε in FIRST(alpha)
        if EPSILON in first_alpha:
            for b in follow[A]:
                if (A, b) in table:
                    raise Exception(f"LL(1) conflict at M[{A}, {b}]")
                table[(A, b)] = production

    return table
```

### Example Parse Table

For our expression grammar:

| | $\text{id}$ | $+$ | $*$ | $($ | $)$ | $\$$ |
|---|---|---|---|---|---|---|
| $E$ | $E \to TE'$ | | | $E \to TE'$ | | |
| $E'$ | | $E' \to +TE'$ | | | $E' \to \varepsilon$ | $E' \to \varepsilon$ |
| $T$ | $T \to FT'$ | | | $T \to FT'$ | | |
| $T'$ | | $T' \to \varepsilon$ | $T' \to *FT'$ | | $T' \to \varepsilon$ | $T' \to \varepsilon$ |
| $F$ | $F \to \text{id}$ | | | $F \to (E)$ | | |

### How to Read the Table

$M[E', +] = E' \to +TE'$ means:

> "When the top of stack is $E'$ and the current input is $+$, use production $E' \to +TE'$"

Empty cells represent **syntax errors**.

---

## LL(1) Table-Driven Parser

The parser uses a **stack** and the **parse table** to process input:

### Algorithm

```
Initialize:
  stack = [$ , S]  ($ on bottom, start symbol on top)
  input pointer at first token

Repeat:
  Let X = top of stack
  Let a = current input token

  If X is a terminal:
    If X == a: pop X, advance input  (match!)
    Else: ERROR

  If X == $:
    If a == $: ACCEPT
    Else: ERROR

  If X is a non-terminal:
    If M[X, a] contains production X → Y1 Y2 ... Yk:
      Pop X
      Push Yk, ..., Y2, Y1 (rightmost first, so Y1 is on top)
    Else: ERROR
```

### Implementation in C

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STACK 1000
#define NUM_NONTERMS 5
#define NUM_TERMS 6

typedef enum { E, E_PRIME, T, T_PRIME, F } NonTerminal;
typedef enum { TK_ID, TK_PLUS, TK_STAR, TK_LPAREN, TK_RPAREN, TK_EOF } Terminal;

// Production: lhs -> rhs (array of symbols, negative = non-terminal)
typedef struct {
    int lhs;
    int rhs[10];
    int rhsLen;
} Production;

// Parse table: table[nonterm][term] = production index (-1 = error)
int parseTable[NUM_NONTERMS][NUM_TERMS];

// Productions
Production productions[] = {
    { E,       {-T, -E_PRIME},          2 },    // 0: E  → T E'
    { E_PRIME, {TK_PLUS, -T, -E_PRIME}, 3 },    // 1: E' → + T E'
    { E_PRIME, {},                       0 },    // 2: E' → ε
    { T,       {-F, -T_PRIME},          2 },    // 3: T  → F T'
    { T_PRIME, {TK_STAR, -F, -T_PRIME}, 3 },    // 4: T' → * F T'
    { T_PRIME, {},                       0 },    // 5: T' → ε
    { F,       {TK_LPAREN, -E, TK_RPAREN}, 3 }, // 6: F  → ( E )
    { F,       {TK_ID},                 1 },     // 7: F  → id
};

void initTable() {
    memset(parseTable, -1, sizeof(parseTable));
    parseTable[E][TK_ID]     = 0;  // E  → T E'
    parseTable[E][TK_LPAREN] = 0;  // E  → T E'
    parseTable[E_PRIME][TK_PLUS]   = 1;  // E' → + T E'
    parseTable[E_PRIME][TK_RPAREN] = 2;  // E' → ε
    parseTable[E_PRIME][TK_EOF]    = 2;  // E' → ε
    parseTable[T][TK_ID]     = 3;  // T  → F T'
    parseTable[T][TK_LPAREN] = 3;  // T  → F T'
    parseTable[T_PRIME][TK_PLUS]   = 5;  // T' → ε
    parseTable[T_PRIME][TK_STAR]   = 4;  // T' → * F T'
    parseTable[T_PRIME][TK_RPAREN] = 5;  // T' → ε
    parseTable[T_PRIME][TK_EOF]    = 5;  // T' → ε
    parseTable[F][TK_ID]     = 7;  // F  → id
    parseTable[F][TK_LPAREN] = 6;  // F  → ( E )
}

void parse(Terminal *input, int inputLen) {
    int stack[MAX_STACK];
    int top = 0;

    stack[top++] = TK_EOF;     // $ on bottom
    stack[top++] = -(int)E;    // Start symbol (negative = non-terminal)

    int ip = 0;  // Input pointer

    printf("Parsing...\n");
    printf("%-20s %-20s %s\n", "Stack", "Input", "Action");

    while (top > 0) {
        int X = stack[top - 1];  // Top of stack
        Terminal a = input[ip];

        if (X >= 0) {
            // X is a terminal
            if (X == (int)a) {
                printf("%-20s %-20s match %d\n", "...", "...", a);
                top--;  // Pop
                ip++;   // Advance input
            } else {
                printf("ERROR: expected terminal %d, got %d\n", X, a);
                return;
            }
        } else {
            // X is a non-terminal
            NonTerminal nt = (NonTerminal)(-(X));
            int prodIdx = parseTable[nt][a];

            if (prodIdx == -1) {
                printf("ERROR: no entry for M[%d, %d]\n", nt, a);
                return;
            }

            Production *prod = &productions[prodIdx];
            printf("%-20s %-20s apply production %d\n", "...", "...", prodIdx);

            top--;  // Pop non-terminal

            // Push RHS in reverse order
            for (int i = prod->rhsLen - 1; i >= 0; i--) {
                stack[top++] = prod->rhs[i];
            }
        }
    }

    if (input[ip] == TK_EOF) {
        printf("ACCEPTED!\n");
    } else {
        printf("ERROR: input not fully consumed\n");
    }
}
```

---

## Complete Parsing Trace

Parse `id + id * id`:

Input tokens: `id + id * id $`

| Stack | Input | Action |
|-------|-------|--------|
| `$ E` | `id + id * id $` | $M[E, \text{id}] = E \to TE'$ |
| `$ E' T` | `id + id * id $` | $M[T, \text{id}] = T \to FT'$ |
| `$ E' T' F` | `id + id * id $` | $M[F, \text{id}] = F \to \text{id}$ |
| `$ E' T' \text{id}` | `id + id * id $` | match id |
| `$ E' T'` | `+ id * id $` | $M[T', +] = T' \to \varepsilon$ |
| `$ E'` | `+ id * id $` | $M[E', +] = E' \to +TE'$ |
| `$ E' T +` | `+ id * id $` | match + |
| `$ E' T` | `id * id $` | $M[T, \text{id}] = T \to FT'$ |
| `$ E' T' F` | `id * id $` | $M[F, \text{id}] = F \to \text{id}$ |
| `$ E' T' \text{id}` | `id * id $` | match id |
| `$ E' T'` | `* id $` | $M[T', *] = T' \to *FT'$ |
| `$ E' T' F *` | `* id $` | match * |
| `$ E' T' F` | `id $` | $M[F, \text{id}] = F \to \text{id}$ |
| `$ E' T' \text{id}` | `id $` | match id |
| `$ E' T'` | `$` | $M[T', \$] = T' \to \varepsilon$ |
| `$ E'` | `$` | $M[E', \$] = E' \to \varepsilon$ |
| `$` | `$` | **ACCEPT** |

---

## LL(1) Conflicts

A grammar is **not LL(1)** if the parse table has cells with **multiple entries** (conflicts).

### Types of Conflicts

**FIRST/FIRST conflict**: Two productions for the same non-terminal have overlapping FIRST sets:

$$A \to \alpha \mid \beta \quad \text{where} \quad \text{FIRST}(\alpha) \cap \text{FIRST}(\beta) \neq \emptyset$$

Example:
$$S \to iEtS \mid iEtSeS$$

Both start with `i` → conflict at $M[S, i]$.

**FIRST/FOLLOW conflict**: A nullable production conflicts with another:

$$A \to \alpha \mid \varepsilon \quad \text{where} \quad \text{FIRST}(\alpha) \cap \text{FOLLOW}(A) \neq \emptyset$$

### Common Causes of Non-LL(1) Grammars

1. **Left recursion**: $E \to E + T$ (always causes conflict)
2. **Common prefixes**: not left-factored
3. **Ambiguity**: ambiguous grammars are never LL(1)
4. **Inherent limitations**: some unambiguous grammars are simply not LL(1)

### Resolution Strategies

| Problem | Solution |
|---------|----------|
| Left recursion | Eliminate left recursion |
| Common prefixes | Left factoring |
| Ambiguity | Rewrite grammar to be unambiguous |
| Not LL(1) | Use a more powerful parser (LR) or restructure |

---

## Python Implementation

Complete LL(1) parser implementation:

```python
class LL1Parser:
    def __init__(self, grammar, table):
        self.grammar = grammar
        self.table = table  # dict: (NonTerminal, Terminal) -> Production

    def parse(self, tokens):
        stack = ['$', self.grammar.start_symbol]
        tokens = tokens + ['$']
        ip = 0

        print(f"{'Stack':<30} {'Input':<30} {'Action'}")
        print("-" * 90)

        while len(stack) > 0:
            top = stack[-1]
            current = tokens[ip]

            stack_str = ' '.join(reversed(stack))
            input_str = ' '.join(tokens[ip:])

            if top in self.grammar.terminals or top == '$':
                if top == current:
                    print(f"{stack_str:<30} {input_str:<30} match '{top}'")
                    stack.pop()
                    ip += 1
                    if top == '$':
                        print("ACCEPTED!")
                        return True
                else:
                    print(f"ERROR: expected '{top}', got '{current}'")
                    return False
            else:
                # top is a non-terminal
                key = (top, current)
                if key not in self.table:
                    print(f"ERROR: no table entry for M[{top}, {current}]")
                    return False

                production = self.table[key]
                action = f"{top} -> {' '.join(production.rhs) if production.rhs else 'ε'}"
                print(f"{stack_str:<30} {input_str:<30} {action}")

                stack.pop()
                # Push RHS in reverse order
                for symbol in reversed(production.rhs):
                    stack.append(symbol)

        return ip == len(tokens)
```

---

## Error Handling in LL(1) Parsers

When an empty table cell is encountered:

### Panic Mode

Skip input tokens until we find one in the FOLLOW set of the current non-terminal:

```python
def panic_mode_recovery(self, stack, tokens, ip):
    top = stack[-1]  # Non-terminal that failed
    sync_set = self.follow[top] | {'$'}

    print(f"Error: skipping input until sync token for {top}")

    while ip < len(tokens) and tokens[ip] not in sync_set:
        ip += 1

    stack.pop()  # Pop the non-terminal
    return ip
```

### Phrase-Level Recovery

Use special error entries in the parse table that suggest recovery actions.

---

## When Is a Grammar LL(1)?

A grammar $G$ is LL(1) if and only if for every pair of productions $A \to \alpha \mid \beta$:

1. $\text{FIRST}(\alpha) \cap \text{FIRST}(\beta) = \emptyset$

2. At most one of $\alpha, \beta$ can derive $\varepsilon$

3. If $\beta \Rightarrow^* \varepsilon$, then $\text{FIRST}(\alpha) \cap \text{FOLLOW}(A) = \emptyset$

These conditions ensure every parse table cell has **at most one entry**.

---

## Try It Yourself

**Exercise 1**: Compute FIRST and FOLLOW sets for:

$$
\begin{aligned}
S &\to A B \\
A &\to a A \mid \varepsilon \\
B &\to b B \mid c
\end{aligned}
$$

**Exercise 2**: Build the LL(1) parse table for the grammar in Exercise 1 and trace the parsing of `aabc`.

**Exercise 3**: Show that this grammar is NOT LL(1):

$$S \to a S b \mid a b$$

Identify the conflict and rewrite the grammar to make it LL(1).

**Exercise 4**: Compute FIRST and FOLLOW for:

$$
\begin{aligned}
S &\to A\ a \mid b \\
A &\to A\ c \mid S\ d \mid \varepsilon
\end{aligned}
$$

Is this grammar LL(1)? If not, transform it.

**Exercise 5**: Implement a complete LL(1) parser in Python or C that:
1. Reads a grammar specification
2. Computes FIRST and FOLLOW sets
3. Builds the parse table
4. Parses input strings and reports accept/reject

Test with the expression grammar from this lesson.

**Exercise 6**: Add error recovery to your LL(1) parser. Use panic mode recovery with FOLLOW sets as synchronization points. Test with inputs that have syntax errors.

---

## Summary

| Concept | Key Idea |
|---------|----------|
| LL(1) | Left-to-right, Leftmost derivation, 1 lookahead |
| FIRST($\alpha$) | Terminals that can start strings derived from $\alpha$ |
| FOLLOW($A$) | Terminals that can appear right after $A$ |
| Parse table $M[A,a]$ | Which production to use for non-terminal $A$ with lookahead $a$ |
| Table-driven parser | Stack + table, no recursive calls needed |
| Conflicts | Multiple entries in one cell → not LL(1) |
| Resolution | Eliminate left recursion, left factor, restructure |

---

## LL(1) vs Recursive Descent

| Aspect | Recursive Descent | LL(1) Table-Driven |
|--------|-------------------|-------------------|
| Implementation | Functions for each rule | Stack + table |
| Flexibility | Easy to add semantic actions | More mechanical |
| Error messages | Can be very specific | More generic |
| Maintenance | Code must mirror grammar | Only table changes |
| Verification | Hard to prove correctness | Formal: FIRST/FOLLOW |
| Generation | Written by hand | Can be auto-generated |

Both are top-down, LL(1) parsers. Recursive descent is the "hand-coded" variant; table-driven is the "generated" variant. Real-world compilers use recursive descent for its flexibility and error message quality.

---

## Next Lesson

In the next lesson, we will turn to **bottom-up parsing** — a more powerful approach that handles a larger class of grammars. You will learn about LR parsing, shift-reduce actions, and how parser generators like yacc/bison work.
