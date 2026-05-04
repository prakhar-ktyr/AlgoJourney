---
title: LR(0) Parsing
---

# LR(0) Parsing

LR(0) is the simplest member of the LR parsing family. While too weak for most real grammars, understanding LR(0) is essential — every other LR parser (SLR, LALR, CLR) builds directly on its concepts. Master LR(0) items, closure, GOTO, and the automaton, and the rest follows naturally.

---

## LR(0) Items

An **LR(0) item** is a production with a **dot** (•) indicating how much of the right-hand side we've seen so far.

For production $A \rightarrow X Y Z$, the items are:

$$
\begin{aligned}
A &\rightarrow \bullet X Y Z \quad \text{(haven't seen anything yet)} \\
A &\rightarrow X \bullet Y Z \quad \text{(seen X, expecting Y Z)} \\
A &\rightarrow X Y \bullet Z \quad \text{(seen X Y, expecting Z)} \\
A &\rightarrow X Y Z \bullet \quad \text{(complete — ready to reduce)}
\end{aligned}
$$

### Item Types

| Item Form | Meaning | Action |
|-----------|---------|--------|
| $A \rightarrow \alpha \bullet a \beta$ | Expecting terminal $a$ next | Shift |
| $A \rightarrow \alpha \bullet B \beta$ | Expecting non-terminal $B$ | Goto |
| $A \rightarrow \alpha \bullet$ | Production complete | Reduce |

### Augmented Grammar

Before constructing the automaton, we add a new start production:

$$S' \rightarrow S$$

This ensures a unique accept action when we reduce to $S'$.

---

## Example Grammar

We'll use this grammar throughout:

$$
\begin{aligned}
S' &\rightarrow E \quad \text{(augmented)} \\
E &\rightarrow E + T \\
E &\rightarrow T \\
T &\rightarrow T * F \\
T &\rightarrow F \\
F &\rightarrow ( E ) \\
F &\rightarrow \text{id}
\end{aligned}
$$

---

## Closure Operation

The **closure** of a set of items adds all items reachable by "expanding" non-terminals after the dot.

### Algorithm

$$
\text{CLOSURE}(I) = I \cup \{B \rightarrow \bullet \gamma \ |\ A \rightarrow \alpha \bullet B \beta \in \text{CLOSURE}(I),\ B \rightarrow \gamma \text{ is a production}\}
$$

In plain English:
1. Start with item set $I$
2. For each item $A \rightarrow \alpha \bullet B \beta$ in the set (dot before non-terminal $B$):
3. Add all productions $B \rightarrow \bullet \gamma$ to the set
4. Repeat until no new items are added

### Example

$$\text{CLOSURE}(\{S' \rightarrow \bullet E\})$$

1. Start: $S' \rightarrow \bullet E$
2. Dot before $E$ → add $E \rightarrow \bullet E + T$ and $E \rightarrow \bullet T$
3. Dot before $T$ → add $T \rightarrow \bullet T * F$ and $T \rightarrow \bullet F$
4. Dot before $F$ → add $F \rightarrow \bullet ( E )$ and $F \rightarrow \bullet \text{id}$
5. No more non-terminals after dots → done

Result (State $I_0$):

$$
\begin{aligned}
I_0 = \{&S' \rightarrow \bullet E, \\
&E \rightarrow \bullet E + T, \\
&E \rightarrow \bullet T, \\
&T \rightarrow \bullet T * F, \\
&T \rightarrow \bullet F, \\
&F \rightarrow \bullet ( E ), \\
&F \rightarrow \bullet \text{id}\}
\end{aligned}
$$

---

## GOTO Operation

**GOTO**(I, X) computes the set of items reachable from state $I$ by reading symbol $X$.

### Algorithm

$$\text{GOTO}(I, X) = \text{CLOSURE}(\{A \rightarrow \alpha X \bullet \beta\ |\ A \rightarrow \alpha \bullet X \beta \in I\})$$

Steps:
1. Find all items in $I$ with dot before $X$
2. Move the dot past $X$
3. Take the closure of the resulting set

### Example

$$\text{GOTO}(I_0, \text{id}) = \text{CLOSURE}(\{F \rightarrow \text{id} \bullet\}) = \{F \rightarrow \text{id} \bullet\}$$

(No non-terminal after the dot, so closure adds nothing.)

$$\text{GOTO}(I_0, E) = \text{CLOSURE}(\{S' \rightarrow E \bullet,\ E \rightarrow E \bullet + T\})$$

Result: $\{S' \rightarrow E \bullet,\ E \rightarrow E \bullet + T\}$

---

## Canonical Collection of LR(0) Items

The **canonical collection** $C$ is the set of all reachable item sets (states), computed by repeatedly applying GOTO to every state.

### Algorithm

```python
def canonical_collection(grammar):
    """Compute canonical collection of LR(0) item sets."""
    # Start state
    start_item = (grammar.start_production, 0)  # dot at position 0
    I0 = closure({start_item}, grammar)
    
    C = [I0]
    worklist = [I0]
    goto_table = {}
    
    while worklist:
        I = worklist.pop(0)
        i = C.index(I)
        
        for X in grammar.all_symbols:
            J = goto(I, X, grammar)
            if J and J not in C:
                C.append(J)
                worklist.append(J)
            if J:
                j = C.index(J)
                goto_table[(i, X)] = j
    
    return C, goto_table
```

---

## Complete LR(0) Automaton Construction

Let's build the full automaton for our grammar. Each state is labeled $I_n$.

### State $I_0$ (Start)

$$
\begin{aligned}
I_0: \quad &S' \rightarrow \bullet E \\
&E \rightarrow \bullet E + T \\
&E \rightarrow \bullet T \\
&T \rightarrow \bullet T * F \\
&T \rightarrow \bullet F \\
&F \rightarrow \bullet ( E ) \\
&F \rightarrow \bullet \text{id}
\end{aligned}
$$

### Transitions from $I_0$

| Symbol | GOTO | Result State |
|--------|------|-------------|
| $E$ | $I_1$ | $\{S' \rightarrow E \bullet,\ E \rightarrow E \bullet + T\}$ |
| $T$ | $I_2$ | $\{E \rightarrow T \bullet,\ T \rightarrow T \bullet * F\}$ |
| $F$ | $I_3$ | $\{T \rightarrow F \bullet\}$ |
| $($ | $I_4$ | $\{F \rightarrow ( \bullet E ),\ E \rightarrow \bullet E + T,\ E \rightarrow \bullet T,\ T \rightarrow \bullet T * F,\ T \rightarrow \bullet F,\ F \rightarrow \bullet ( E ),\ F \rightarrow \bullet \text{id}\}$ |
| id | $I_5$ | $\{F \rightarrow \text{id} \bullet\}$ |

### State $I_1$

$$I_1: \quad S' \rightarrow E \bullet, \quad E \rightarrow E \bullet + T$$

- GOTO($I_1$, $+$) = $I_6$: $\{E \rightarrow E + \bullet T,\ T \rightarrow \bullet T * F,\ T \rightarrow \bullet F,\ F \rightarrow \bullet ( E ),\ F \rightarrow \bullet \text{id}\}$

### State $I_2$

$$I_2: \quad E \rightarrow T \bullet, \quad T \rightarrow T \bullet * F$$

- GOTO($I_2$, $*$) = $I_7$: $\{T \rightarrow T * \bullet F,\ F \rightarrow \bullet ( E ),\ F \rightarrow \bullet \text{id}\}$

### State $I_3$

$$I_3: \quad T \rightarrow F \bullet$$

No transitions (dot at end = reduce state).

### State $I_4$

$$
\begin{aligned}
I_4: \quad &F \rightarrow ( \bullet E ) \\
&E \rightarrow \bullet E + T \\
&E \rightarrow \bullet T \\
&T \rightarrow \bullet T * F \\
&T \rightarrow \bullet F \\
&F \rightarrow \bullet ( E ) \\
&F \rightarrow \bullet \text{id}
\end{aligned}
$$

- GOTO($I_4$, $E$) = $I_8$: $\{F \rightarrow ( E \bullet ),\ E \rightarrow E \bullet + T\}$
- GOTO($I_4$, $T$) = $I_2$
- GOTO($I_4$, $F$) = $I_3$
- GOTO($I_4$, $($) = $I_4$
- GOTO($I_4$, id) = $I_5$

### State $I_5$

$$I_5: \quad F \rightarrow \text{id} \bullet$$

Reduce state. No transitions.

### State $I_6$

$$
\begin{aligned}
I_6: \quad &E \rightarrow E + \bullet T \\
&T \rightarrow \bullet T * F \\
&T \rightarrow \bullet F \\
&F \rightarrow \bullet ( E ) \\
&F \rightarrow \bullet \text{id}
\end{aligned}
$$

- GOTO($I_6$, $T$) = $I_9$: $\{E \rightarrow E + T \bullet,\ T \rightarrow T \bullet * F\}$
- GOTO($I_6$, $F$) = $I_3$
- GOTO($I_6$, $($) = $I_4$
- GOTO($I_6$, id) = $I_5$

### State $I_7$

$$
\begin{aligned}
I_7: \quad &T \rightarrow T * \bullet F \\
&F \rightarrow \bullet ( E ) \\
&F \rightarrow \bullet \text{id}
\end{aligned}
$$

- GOTO($I_7$, $F$) = $I_{10}$: $\{T \rightarrow T * F \bullet\}$
- GOTO($I_7$, $($) = $I_4$
- GOTO($I_7$, id) = $I_5$

### State $I_8$

$$I_8: \quad F \rightarrow ( E \bullet ), \quad E \rightarrow E \bullet + T$$

- GOTO($I_8$, $)$) = $I_{11}$: $\{F \rightarrow ( E ) \bullet\}$
- GOTO($I_8$, $+$) = $I_6$

### State $I_9$

$$I_9: \quad E \rightarrow E + T \bullet, \quad T \rightarrow T \bullet * F$$

- GOTO($I_9$, $*$) = $I_7$

### State $I_{10}$

$$I_{10}: \quad T \rightarrow T * F \bullet$$

Reduce state.

### State $I_{11}$

$$I_{11}: \quad F \rightarrow ( E ) \bullet$$

Reduce state.

---

## LR(0) Parse Table Construction

The parse table has two parts:
- **ACTION[state, terminal]** — shift, reduce, or accept
- **GOTO[state, non-terminal]** — next state after a reduction

### Construction Rules

For each state $I_i$:

1. **Shift:** If $A \rightarrow \alpha \bullet a \beta \in I_i$ and GOTO($I_i$, $a$) = $I_j$, then ACTION[$i$, $a$] = shift $j$

2. **Reduce:** If $A \rightarrow \alpha \bullet \in I_i$ (and $A \neq S'$), then ACTION[$i$, $a$] = reduce $A \rightarrow \alpha$ **for all terminals $a$**

3. **Accept:** If $S' \rightarrow S \bullet \in I_i$, then ACTION[$i$, $\$$] = accept

4. **GOTO:** If GOTO($I_i$, $A$) = $I_j$ for non-terminal $A$, then GOTO[$i$, $A$] = $j$

> **LR(0) problem:** Rule 2 says reduce on **ALL terminals**. This causes conflicts when a state has both shift and reduce items!

---

## Parse Table for Our Grammar

### ACTION Table

| State | id | + | * | ( | ) | $ |
|-------|------|------|------|------|------|------|
| 0 | s5 | | | s4 | | |
| 1 | | s6 | | | | acc |
| 2 | r2 | r2 | r2/s7 | r2 | r2 | r2 |
| 3 | r4 | r4 | r4 | r4 | r4 | r4 |
| 4 | s5 | | | s4 | | |
| 5 | r6 | r6 | r6 | r6 | r6 | r6 |
| 6 | s5 | | | s4 | | |
| 7 | s5 | | | s4 | | |
| 8 | | s6 | | | s11 | |
| 9 | r1 | r1 | r1/s7 | r1 | r1 | r1 |
| 10 | r3 | r3 | r3 | r3 | r3 | r3 |
| 11 | r5 | r5 | r5 | r5 | r5 | r5 |

**Notation:** s$n$ = shift to state $n$, r$n$ = reduce by production $n$, acc = accept

### GOTO Table

| State | E | T | F |
|-------|---|---|---|
| 0 | 1 | 2 | 3 |
| 4 | 8 | 2 | 3 |
| 6 | | 9 | 3 |
| 7 | | | 10 |

### Conflict!

Notice states 2 and 9 have **shift-reduce conflicts** (e.g., r2/s7 in state 2 under `*`). This means our grammar is **NOT LR(0)**!

This is expected — LR(0) is too weak for most practical grammars. SLR, LALR, and CLR resolve these conflicts using lookahead information.

---

## Parsing with the LR(0) Table

Despite conflicts, let's trace parsing `id * id` (assuming we resolve the conflict by choosing shift for `*`):

| Step | Stack | Input | Action |
|------|-------|-------|--------|
| 1 | 0 | id * id $ | shift, goto 5 |
| 2 | 0 5 | * id $ | reduce F → id, goto 3 |
| 3 | 0 3 | * id $ | reduce T → F, goto 2 |
| 4 | 0 2 | * id $ | shift, goto 7 |
| 5 | 0 2 7 | id $ | shift, goto 5 |
| 6 | 0 2 7 5 | $ | reduce F → id, goto 10 |
| 7 | 0 2 7 10 | $ | reduce T → T*F, goto 2 |
| 8 | 0 2 | $ | reduce E → T, goto 1 |
| 9 | 0 1 | $ | accept |

### How to Read the Stack

The stack alternates between **states** and **symbols**:
- State numbers tell the parser where it is in the automaton
- After a reduce, pop `2 * |rhs|` items (symbols + states), then look up GOTO

---

## Python Implementation

```python
class LR0Parser:
    """LR(0) parser with automaton construction."""

    def __init__(self, grammar, start_symbol):
        self.grammar = grammar  # list of (lhs, rhs) tuples
        self.start = start_symbol
        self.augmented_start = start_symbol + "'"
        self.grammar.insert(0, (self.augmented_start, [self.start]))
        
        self.terminals = set()
        self.non_terminals = set()
        for lhs, rhs in self.grammar:
            self.non_terminals.add(lhs)
            for sym in rhs:
                if sym not in [l for l, _ in self.grammar]:
                    self.terminals.add(sym)
        self.terminals.add("$")
        self.states = []
        self.transitions = {}
        self.build_automaton()

    def closure(self, items):
        """Compute closure of an item set."""
        result = set(items)
        changed = True
        while changed:
            changed = False
            for (prod_idx, dot_pos) in list(result):
                lhs, rhs = self.grammar[prod_idx]
                if dot_pos < len(rhs) and rhs[dot_pos] in self.non_terminals:
                    for i, (l, r) in enumerate(self.grammar):
                        if l == rhs[dot_pos] and (i, 0) not in result:
                            result.add((i, 0))
                            changed = True
        return frozenset(result)

    def goto(self, items, symbol):
        """Compute GOTO(items, symbol)."""
        moved = set()
        for (prod_idx, dot_pos) in items:
            lhs, rhs = self.grammar[prod_idx]
            if dot_pos < len(rhs) and rhs[dot_pos] == symbol:
                moved.add((prod_idx, dot_pos + 1))
        return self.closure(moved) if moved else frozenset()

    def build_automaton(self):
        """Build canonical collection of LR(0) item sets."""
        I0 = self.closure({(0, 0)})
        self.states = [I0]
        worklist = [I0]
        while worklist:
            I = worklist.pop(0)
            i = self.states.index(I)
            for X in self.terminals | self.non_terminals:
                J = self.goto(I, X)
                if J:
                    if J not in self.states:
                        self.states.append(J)
                        worklist.append(J)
                    self.transitions[(i, X)] = self.states.index(J)

    def print_states(self):
        for i, state in enumerate(self.states):
            print(f"\nState I{i}:")
            for (prod_idx, dot_pos) in sorted(state):
                lhs, rhs = self.grammar[prod_idx]
                items = rhs[:dot_pos] + ["•"] + rhs[dot_pos:]
                print(f"  {lhs} → {' '.join(items)}")

# Usage
grammar = [("E", ["E","+","T"]), ("E", ["T"]),
           ("T", ["T","*","F"]), ("T", ["F"]),
           ("F", ["(","E",")"]), ("F", ["id"])]
parser = LR0Parser(grammar, "E")
parser.print_states()
```

---

## LR(0) Limitations

An LR(0) grammar must satisfy: **no state contains both a complete item and a shift item** (or two different complete items).

Most real grammars fail this. For example, state $I_2$ in our example has:
- $E \rightarrow T \bullet$ (reduce)
- $T \rightarrow T \bullet * F$ (shift on `*`)

This creates a shift-reduce conflict that LR(0) cannot resolve.

### What LR(0) CAN Handle

```
S → a S b | ε
```

This grammar is LR(0) because every reduce state has items for only one production, and no state mixes shifts with reduces on the same symbol. However, such simple grammars are rare in practice.

---

## From LR(0) to SLR

The next step is **SLR parsing**, which resolves many LR(0) conflicts by using **FOLLOW sets**:

- Only reduce $A \rightarrow \alpha$ when the lookahead is in FOLLOW($A$)
- This eliminates many false conflicts

We'll cover SLR in detail in the next lesson.

---

## Try It Yourself

### Exercise 1: Build the Automaton

Construct the complete LR(0) automaton for:

$$
\begin{aligned}
S &\rightarrow A\ a\ |\ b \\
A &\rightarrow A\ c\ |\ d
\end{aligned}
$$

List all states and transitions.

### Exercise 2: Identify Conflicts

For the automaton you built in Exercise 1, construct the LR(0) parse table. Are there any conflicts? If so, which states and what type?

### Exercise 3: Parse a String

Using the expression grammar's parse table (resolving conflicts by preferring shift), trace the complete parse of `id + id + id`.

### Exercise 4: Closure Practice

Compute CLOSURE for:
- (a) $\{E \rightarrow E + \bullet T\}$
- (b) $\{F \rightarrow ( \bullet E )\}$

### Exercise 5: Grammar Design

Design a grammar that IS LR(0) for the language $\{a^n b^n\ |\ n \geq 1\}$. Verify by constructing the automaton and showing no conflicts exist.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| LR(0) item | Production + dot position showing parsing progress |
| Closure | Expand non-terminals after the dot |
| GOTO | Move dot past a symbol, take closure |
| Canonical collection | All reachable states via GOTO |
| Parse table | ACTION (shift/reduce/accept) + GOTO (state transitions) |
| LR(0) conflicts | Reduce on ALL terminals → conflicts with shifts |
| Limitation | Too weak for most grammars; SLR/LALR/CLR fix this |

---

## Next Lesson

**SLR Parsing** — we'll see how adding FOLLOW set information to reduce decisions resolves many LR(0) conflicts, making the parser practical for a wider class of grammars.
