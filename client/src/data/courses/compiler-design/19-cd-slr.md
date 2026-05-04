---
title: SLR Parsing
---

# SLR Parsing

SLR (Simple LR) parsing is the first practical improvement over LR(0). It resolves many shift-reduce conflicts by using **FOLLOW sets** to decide when to reduce. The automaton is identical to LR(0) — only the table construction differs.

---

## The LR(0) Problem

Recall that LR(0) reduces on **all** terminals when a state has a complete item. This causes conflicts when the state also has shift items.

**Example:** State $I_2 = \{E \rightarrow T \bullet,\ T \rightarrow T \bullet * F\}$

LR(0) says:
- Reduce $E \rightarrow T$ on every terminal (including `*`)
- Shift on `*`

This is a conflict! But intuitively, we should only reduce $E \rightarrow T$ when the next token could actually follow $E$ in a valid sentence.

---

## SLR Improvement

**SLR rule:** Only reduce $A \rightarrow \alpha$ when the lookahead token is in $\text{FOLLOW}(A)$.

This is sound because:
- If we're about to reduce to $A$, whatever follows must be something that can legitimately follow $A$ in some derivation
- $\text{FOLLOW}(A)$ captures exactly those terminals

---

## FOLLOW Sets for the Expression Grammar

$$
\begin{aligned}
E &\rightarrow E + T\ |\ T \\
T &\rightarrow T * F\ |\ F \\
F &\rightarrow ( E )\ |\ \text{id}
\end{aligned}
$$

Computing FOLLOW:

$$
\begin{aligned}
\text{FOLLOW}(E) &= \{+, ), \$\} \\
\text{FOLLOW}(T) &= \{+, *, ), \$\} \\
\text{FOLLOW}(F) &= \{+, *, ), \$\}
\end{aligned}
$$

Wait — $* \in \text{FOLLOW}(T)$? Let's check:
- From $E \rightarrow T$, everything in FOLLOW($E$) is in FOLLOW($T$): $\{+, ), \$\}$
- From $T \rightarrow T * F$, the `*` follows $T$ directly

So FOLLOW($T$) = $\{+, *, ), \$\}$

But actually for reducing $E \rightarrow T$, we use FOLLOW($E$) = $\{+, ), \$\}$, which does NOT contain `*`!

---

## Resolving the Conflict

Back to state $I_2 = \{E \rightarrow T \bullet,\ T \rightarrow T \bullet * F\}$:

| Terminal | LR(0) Action | SLR Action |
|----------|---|---|
| `+` | r2/shift conflict | reduce (+ ∈ FOLLOW(E)) |
| `*` | r2/shift conflict | **shift** (* ∉ FOLLOW(E), but shift item exists) |
| `)` | reduce | reduce (+ ∈ FOLLOW(E)) |
| `$` | reduce | reduce ($ ∈ FOLLOW(E)) |
| `id` | reduce | — (no action needed) |
| `(` | reduce | — (no action needed) |

The conflict is resolved! When we see `*` in state $I_2$, we shift (because `*` is not in FOLLOW($E$), so we shouldn't reduce $E \rightarrow T$).

---

## SLR Parse Table Construction

### Algorithm

1. Build the LR(0) automaton (canonical collection, same as before)
2. For each state $I_i$:

   **Shift:** If $A \rightarrow \alpha \bullet a \beta \in I_i$ and GOTO($I_i$, $a$) = $I_j$, then:
   $$\text{ACTION}[i, a] = \text{shift } j$$

   **Reduce:** If $A \rightarrow \alpha \bullet \in I_i$ (and $A \neq S'$), then:
   $$\text{ACTION}[i, a] = \text{reduce } A \rightarrow \alpha \quad \text{for all } a \in \text{FOLLOW}(A)$$

   **Accept:** If $S' \rightarrow S \bullet \in I_i$, then:
   $$\text{ACTION}[i, \$] = \text{accept}$$

3. For non-terminal transitions:
   $$\text{If GOTO}(I_i, A) = I_j, \text{ then GOTO}[i, A] = j$$

4. Any empty entries are **errors**

---

## Complete SLR Parse Table

Using our expression grammar and the 12 states from the LR(0) automaton:

### ACTION Table

| State | id | + | * | ( | ) | $ |
|-------|------|------|------|------|------|------|
| 0 | s5 | | | s4 | | |
| 1 | | s6 | | | | acc |
| 2 | | r2 | s7 | | r2 | r2 |
| 3 | | r4 | r4 | | r4 | r4 |
| 4 | s5 | | | s4 | | |
| 5 | | r6 | r6 | | r6 | r6 |
| 6 | s5 | | | s4 | | |
| 7 | s5 | | | s4 | | |
| 8 | | s6 | | | s11 | |
| 9 | | r1 | s7 | | r1 | r1 |
| 10 | | r3 | r3 | | r3 | r3 |
| 11 | | r5 | r5 | | r5 | r5 |

### GOTO Table

| State | E | T | F |
|-------|---|---|---|
| 0 | 1 | 2 | 3 |
| 4 | 8 | 2 | 3 |
| 6 | | 9 | 3 |
| 7 | | | 10 |

### Productions for Reference

| Number | Production |
|--------|-----------|
| 1 | $E \rightarrow E + T$ |
| 2 | $E \rightarrow T$ |
| 3 | $T \rightarrow T * F$ |
| 4 | $T \rightarrow F$ |
| 5 | $F \rightarrow ( E )$ |
| 6 | $F \rightarrow \text{id}$ |

**No conflicts!** This grammar is SLR(1).

---

## Parsing Trace: `id + id * id`

Let's trace the complete parse step by step:

| Step | State Stack | Symbol Stack | Input | Action |
|------|-------------|--------------|-------|--------|
| 1 | 0 | $ | id + id * id $ | shift 5 |
| 2 | 0 5 | $ id | + id * id $ | reduce F→id (GOTO[0,F]=3) |
| 3 | 0 3 | $ F | + id * id $ | reduce T→F (GOTO[0,T]=2) |
| 4 | 0 2 | $ T | + id * id $ | reduce E→T (GOTO[0,E]=1) |
| 5 | 0 1 | $ E | + id * id $ | shift 6 |
| 6 | 0 1 6 | $ E + | id * id $ | shift 5 |
| 7 | 0 1 6 5 | $ E + id | * id $ | reduce F→id (GOTO[6,F]=3) |
| 8 | 0 1 6 3 | $ E + F | * id $ | reduce T→F (GOTO[6,T]=9) |
| 9 | 0 1 6 9 | $ E + T | * id $ | shift 7 |
| 10 | 0 1 6 9 7 | $ E + T * | id $ | shift 5 |
| 11 | 0 1 6 9 7 5 | $ E + T * id | $ | reduce F→id (GOTO[7,F]=10) |
| 12 | 0 1 6 9 7 10 | $ E + T * F | $ | reduce T→T*F (GOTO[6,T]=9) |
| 13 | 0 1 6 9 | $ E + T | $ | reduce E→E+T (GOTO[0,E]=1) |
| 14 | 0 1 | $ E | $ | accept ✓ |

### Understanding the Reduce Step

At step 9, state 9 has items $\{E \rightarrow E + T \bullet,\ T \rightarrow T \bullet * F\}$:
- Lookahead is `*`
- `*` ∈ FOLLOW(T) but `*` ∉ FOLLOW(E)
- The shift item $T \rightarrow T \bullet * F$ says shift on `*`
- **Action:** shift (not reduce) → correctly handles precedence!

---

## SLR Parser Implementation

```python
class SLRParser:
    """SLR(1) parser implementation."""

    def __init__(self, action_table, goto_table, productions):
        """
        action_table: dict of (state, terminal) -> (action, value)
            action = 'shift', 'reduce', or 'accept'
            value = state (for shift) or production index (for reduce)
        goto_table: dict of (state, non_terminal) -> state
        productions: list of (lhs, rhs_length) tuples
        """
        self.action = action_table
        self.goto = goto_table
        self.productions = productions

    def parse(self, tokens):
        """Parse a token list. Returns True if accepted."""
        tokens = tokens + ["$"]
        stack = [0]  # state stack
        ip = 0

        print(f"{'Step':<5} {'Stack':<20} {'Input':<20} {'Action'}")
        print("-" * 65)
        step = 1

        while True:
            state = stack[-1]
            token = tokens[ip]
            stack_str = " ".join(map(str, stack))
            input_str = " ".join(tokens[ip:])

            key = (state, token)
            if key not in self.action:
                print(f"{step:<5} {stack_str:<20} {input_str:<20} ERROR")
                return False

            action, value = self.action[key]

            if action == "shift":
                print(f"{step:<5} {stack_str:<20} {input_str:<20} shift {value}")
                stack.append(token)
                stack.append(value)
                ip += 1
            elif action == "reduce":
                lhs, rhs_len = self.productions[value]
                # Pop 2 * rhs_len items (symbols + states)
                if rhs_len > 0:
                    stack = stack[:-(2 * rhs_len)]
                top_state = stack[-1]
                stack.append(lhs)
                stack.append(self.goto[(top_state, lhs)])
                print(f"{step:<5} {stack_str:<20} {input_str:<20} reduce {value}")
            elif action == "accept":
                print(f"{step:<5} {stack_str:<20} {input_str:<20} ACCEPT")
                return True

            step += 1


# Build tables for the expression grammar
action = {
    (0, "id"): ("shift", 5), (0, "("): ("shift", 4),
    (1, "+"): ("shift", 6), (1, "$"): ("accept", None),
    (2, "+"): ("reduce", 2), (2, "*"): ("shift", 7),
    (2, ")"): ("reduce", 2), (2, "$"): ("reduce", 2),
    (3, "+"): ("reduce", 4), (3, "*"): ("reduce", 4),
    (3, ")"): ("reduce", 4), (3, "$"): ("reduce", 4),
    (4, "id"): ("shift", 5), (4, "("): ("shift", 4),
    (5, "+"): ("reduce", 6), (5, "*"): ("reduce", 6),
    (5, ")"): ("reduce", 6), (5, "$"): ("reduce", 6),
    (6, "id"): ("shift", 5), (6, "("): ("shift", 4),
    (7, "id"): ("shift", 5), (7, "("): ("shift", 4),
    (8, "+"): ("shift", 6), (8, ")"): ("shift", 11),
    (9, "+"): ("reduce", 1), (9, "*"): ("shift", 7),
    (9, ")"): ("reduce", 1), (9, "$"): ("reduce", 1),
    (10, "+"): ("reduce", 3), (10, "*"): ("reduce", 3),
    (10, ")"): ("reduce", 3), (10, "$"): ("reduce", 3),
    (11, "+"): ("reduce", 5), (11, "*"): ("reduce", 5),
    (11, ")"): ("reduce", 5), (11, "$"): ("reduce", 5),
}

goto_table = {
    (0, "E"): 1, (0, "T"): 2, (0, "F"): 3,
    (4, "E"): 8, (4, "T"): 2, (4, "F"): 3,
    (6, "T"): 9, (6, "F"): 3,
    (7, "F"): 10,
}

# (lhs, rhs_length)
productions = [
    ("E'", 1),  # 0: E' → E
    ("E", 3),   # 1: E → E + T
    ("E", 1),   # 2: E → T
    ("T", 3),   # 3: T → T * F
    ("T", 1),   # 4: T → F
    ("F", 3),   # 5: F → ( E )
    ("F", 1),   # 6: F → id
]

parser = SLRParser(action, goto_table, productions)
print("Parsing: id + id * id\n")
parser.parse(["id", "+", "id", "*", "id"])
print("\n\nParsing: (id + id) * id\n")
parser.parse(["(", "id", "+", "id", ")", "*", "id"])
```

---

## When SLR Fails

SLR uses **global** FOLLOW sets, which can be too imprecise. A grammar is NOT SLR if, for some state $I_i$:

$$\text{FOLLOW}(A) \cap \text{FOLLOW}(B) \neq \emptyset$$

where both $A \rightarrow \alpha \bullet$ and $B \rightarrow \beta \bullet$ are in $I_i$, or if:

$$\text{FOLLOW}(A) \cap \{\text{symbols after dot in shift items}\} \neq \emptyset$$

### Classic Non-SLR Example

```
S → L = R | R
L → * R | id
R → L
```

State containing: $\{S \rightarrow L \bullet = R,\ R \rightarrow L \bullet\}$

- Shift on `=` (from first item)
- Reduce $R \rightarrow L$ when lookahead ∈ FOLLOW($R$)

But FOLLOW($R$) = $\{=, \$\}$ (since $L = R$ has `=` following things that can be $R$... actually let's compute carefully):

FOLLOW($R$): From $S \rightarrow L = R$, we get $ ∈ FOLLOW(R). From $L \rightarrow * R$, whatever follows $L$ follows $R$. FOLLOW($L$) includes `=` (from $S \rightarrow L = R$). So `=` ∈ FOLLOW($R$).

Now in our state:
- Shift on `=` (from $S \rightarrow L \bullet = R$)
- Reduce $R \rightarrow L$ on `=` (because `=` ∈ FOLLOW($R$))

**Conflict!** This grammar is LR(1) but not SLR(1). We need CLR or LALR to handle it.

---

## SLR vs LR(0) Comparison

| Aspect | LR(0) | SLR(1) |
|--------|-------|--------|
| Automaton | Same | Same |
| Reduce condition | All terminals | Only FOLLOW(A) |
| Table size | Same | Same |
| Power | Very limited | Handles most expression grammars |
| Conflicts | Many | Fewer (FOLLOW resolves them) |

The hierarchy:

$$\text{LR}(0) \subset \text{SLR}(1) \subset \text{LALR}(1) \subset \text{CLR}(1)$$

---

## Formal SLR Condition

A grammar $G$ is **SLR(1)** if and only if for every state $I_i$ in the canonical collection:

1. For any item $A \rightarrow \alpha \bullet a \beta$ in $I_i$ and any complete item $B \rightarrow \gamma \bullet$ in $I_i$:
$$a \notin \text{FOLLOW}(B)$$

2. For any two complete items $A \rightarrow \alpha \bullet$ and $B \rightarrow \beta \bullet$ in $I_i$:
$$\text{FOLLOW}(A) \cap \text{FOLLOW}(B) = \emptyset$$

If either condition is violated, the grammar is not SLR(1).

---

## Another Complete Example

Consider the grammar:

$$
\begin{aligned}
S' &\rightarrow S \\
S &\rightarrow A\ a\ |\ b \\
A &\rightarrow A\ c\ |\ d
\end{aligned}
$$

### States

$$
\begin{aligned}
I_0: \quad &S' \rightarrow \bullet S,\ S \rightarrow \bullet A a,\ S \rightarrow \bullet b,\ A \rightarrow \bullet A c,\ A \rightarrow \bullet d \\
I_1: \quad &S' \rightarrow S \bullet \\
I_2: \quad &S \rightarrow A \bullet a,\ A \rightarrow A \bullet c \\
I_3: \quad &S \rightarrow b \bullet \\
I_4: \quad &A \rightarrow d \bullet \\
I_5: \quad &S \rightarrow A a \bullet \\
I_6: \quad &A \rightarrow A c \bullet
\end{aligned}
$$

### FOLLOW Sets

- FOLLOW($S$) = {$}
- FOLLOW($A$) = {$a$, $c$}

### SLR Table Check

State $I_4$ has $A \rightarrow d \bullet$. Reduce on FOLLOW($A$) = {$a$, $c$}.

No conflicts — this grammar IS SLR(1).

### Parse Table

| State | a | b | c | d | $ | S | A |
|-------|---|---|---|---|---|---|---|
| 0 | | s3 | | s4 | | 1 | 2 |
| 1 | | | | | acc | | |
| 2 | s5 | | s6 | | | | |
| 3 | | | | | r2 | | |
| 4 | r4 | | r4 | | | | |
| 5 | | | | | r1 | | |
| 6 | r3 | | r3 | | | | |

---

## Error Detection in SLR Parsing

SLR detects errors as soon as an invalid token is seen — specifically, when ACTION[state, token] is empty.

```python
def parse_with_errors(self, tokens):
    """Parse with error reporting."""
    tokens = tokens + ["$"]
    stack = [0]
    ip = 0

    while True:
        state = stack[-1]
        token = tokens[ip]
        key = (state, token)

        if key not in self.action:
            # Determine what was expected
            expected = [t for (s, t) in self.action if s == state]
            print(f"Syntax error at token '{token}' (position {ip})")
            print(f"  Expected one of: {expected}")
            print(f"  State stack: {stack}")
            return False

        action, value = self.action[key]
        # ... continue parsing ...
```

---

## Try It Yourself

### Exercise 1: Build SLR Table

Construct the SLR parse table for:

$$
\begin{aligned}
S &\rightarrow A\ B \\
A &\rightarrow a\ |\ \varepsilon \\
B &\rightarrow b\ |\ \varepsilon
\end{aligned}
$$

Compute FOLLOW sets and verify no conflicts.

### Exercise 2: Trace Parse

Using the expression grammar's SLR table, trace the complete parse of `(id) + id * (id + id)`.

### Exercise 3: Conflict Detection

Show that the following grammar is NOT SLR(1):

$$
\begin{aligned}
S &\rightarrow L = R\ |\ R \\
L &\rightarrow * R\ |\ \text{id} \\
R &\rightarrow L
\end{aligned}
$$

Identify the specific state and conflict.

### Exercise 4: Grammar Transformation

Rewrite the non-SLR grammar from Exercise 3 to make it SLR(1). Verify your answer by constructing the conflict-free table.

### Exercise 5: Implementation

Extend the Python SLR parser to:
1. Build the parse table automatically from a grammar
2. Report whether the grammar is SLR(1)
3. List all conflicts if it isn't

---

## Summary

| Concept | Key Point |
|---------|-----------|
| SLR improvement | Reduce only when lookahead ∈ FOLLOW(LHS) |
| Same automaton | LR(0) states, just smarter reduce decisions |
| Resolves precedence | `*` not in FOLLOW(E), so shift wins |
| Limitation | FOLLOW is global — may still have false conflicts |
| Not SLR | When FOLLOW sets overlap in a state with multiple reduces/shifts |
| Next step | LALR uses per-state lookaheads for even more power |

---

## Next Lesson

We'll explore **CLR and LALR parsing** — the most powerful practical parsers. CLR uses exact lookahead per item, and LALR cleverly merges CLR states to keep tables small while retaining most of CLR's power.
