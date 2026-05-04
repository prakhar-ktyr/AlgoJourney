---
title: CLR and LALR Parsing
---

# CLR and LALR Parsing

CLR (Canonical LR) and LALR (Look-Ahead LR) represent the pinnacle of deterministic bottom-up parsing. CLR has maximum power but impractical table sizes; LALR achieves nearly the same power with compact tables. LALR is what **Yacc** and **Bison** actually implement.

---

## Why SLR Isn't Enough

SLR uses **global** FOLLOW sets for reduce decisions. But FOLLOW($A$) includes terminals that can follow $A$ **anywhere** in the grammar — not just in the specific context of the current state.

This over-approximation causes spurious conflicts. CLR fixes this with **per-item lookaheads**.

---

## LR(1) Items

An **LR(1) item** extends LR(0) items with a **lookahead** terminal:

$$[A \rightarrow \alpha \bullet \beta,\ a]$$

This means:
- We've seen $\alpha$ on the stack
- We expect to see $\beta$ next
- After reducing $A \rightarrow \alpha \beta$, the token $a$ should follow

The lookahead $a$ is used **only** for reduce decisions. When $\beta = \varepsilon$ (dot at end), we reduce only if the current input is exactly $a$.

### Example

$$[S \rightarrow L \bullet = R,\ \$]$$

means: we've seen $L$, expecting `=` then $R$, and after reducing the entire $S \rightarrow L = R$, we expect `$` to follow.

---

## CLR(1) Closure

The closure operation for LR(1) items is more complex because it must compute lookaheads for new items.

### Algorithm

For item $[A \rightarrow \alpha \bullet B \beta,\ a]$ in the set:
- Add $[B \rightarrow \bullet \gamma,\ b]$ for each production $B \rightarrow \gamma$
- Where $b \in \text{FIRST}(\beta a)$

The lookahead for the new item comes from what can follow $B$ in this specific context: the FIRST set of whatever comes after $B$ in the current item ($\beta$), or the inherited lookahead ($a$) if $\beta$ can derive $\varepsilon$.

$$\text{Lookahead for new item} = \text{FIRST}(\beta a)$$

### Example

Given $[S' \rightarrow \bullet S,\ \$]$:
- $S$ after dot, $\beta = \varepsilon$, lookahead = $
- FIRST($\varepsilon \cdot \$$) = {$}
- Add $[S \rightarrow \bullet L = R,\ \$]$ and $[S \rightarrow \bullet R,\ \$]$

For $[S \rightarrow \bullet L = R,\ \$]$:
- $L$ after dot, $\beta = {=}R$, lookahead = $
- FIRST($= R \cdot \$$) = {=}
- Add $[L \rightarrow \bullet * R,\ =]$ and $[L \rightarrow \bullet \text{id},\ =]$

Notice: the lookahead is `=`, not `$` — this is the crucial difference from SLR!

---

## CLR(1) GOTO

The GOTO operation works the same as LR(0), but carries lookaheads along:

$$\text{GOTO}(I, X) = \text{CLOSURE}(\{[A \rightarrow \alpha X \bullet \beta,\ a]\ |\ [A \rightarrow \alpha \bullet X \beta,\ a] \in I\})$$

---

## Complete CLR(1) Example

Grammar:

$$
\begin{aligned}
S' &\rightarrow S \\
S &\rightarrow L = R\ |\ R \\
L &\rightarrow * R\ |\ \text{id} \\
R &\rightarrow L
\end{aligned}
$$

This grammar is NOT SLR (as we showed in the previous lesson) but IS CLR(1).

### State $I_0$

$$
\begin{aligned}
I_0: \quad &[S' \rightarrow \bullet S,\ \$] \\
&[S \rightarrow \bullet L = R,\ \$] \\
&[S \rightarrow \bullet R,\ \$] \\
&[L \rightarrow \bullet * R,\ =/\$] \\
&[L \rightarrow \bullet \text{id},\ =/\$] \\
&[R \rightarrow \bullet L,\ \$]
\end{aligned}
$$

Note: $L$ appears in two contexts:
- In $S \rightarrow L = R$: lookahead for $L$-productions is `=` (FIRST of `= R $`)
- In $R \rightarrow L$: lookahead for $L$-productions is `$` (FIRST of `$`)

Combined: $[L \rightarrow \bullet * R,\ =/\$]$ means two items merged for clarity.

### Key State (Resolving the SLR Conflict)

$$I_2: \quad [S \rightarrow L \bullet = R,\ \$], \quad [R \rightarrow L \bullet,\ \$]$$

Now the reduce item $[R \rightarrow L \bullet,\ \$]$ says: reduce **only on `$`**.

- On input `=`: shift (from first item)
- On input `$`: reduce $R \rightarrow L$

**No conflict!** The per-item lookahead `$` is more precise than FOLLOW($R$) = {=, $}.

---

## CLR Parse Table Construction

Same as SLR, except the reduce rule uses the **item's lookahead** instead of FOLLOW:

1. **Shift:** If $[A \rightarrow \alpha \bullet a \beta,\ b] \in I_i$ and GOTO($I_i$, $a$) = $I_j$:
$$\text{ACTION}[i, a] = \text{shift } j$$

2. **Reduce:** If $[A \rightarrow \alpha \bullet,\ a] \in I_i$ (and $A \neq S'$):
$$\text{ACTION}[i, a] = \text{reduce } A \rightarrow \alpha$$

3. **Accept:** If $[S' \rightarrow S \bullet,\ \$] \in I_i$:
$$\text{ACTION}[i, \$] = \text{accept}$$

---

## The CLR Problem: Table Size

CLR tables can be **enormous**. States that differ only in lookaheads are treated as separate states.

For a typical programming language grammar:
- LR(0)/SLR: ~300 states
- CLR(1): ~1000+ states

This motivated the development of LALR.

---

## LALR(1): The Practical Solution

**LALR(1)** merges CLR states that have the **same core** (same LR(0) items, possibly different lookaheads).

### The Core of a State

The **core** of an LR(1) state is the set of items with lookaheads removed:

$$\text{core}(\{[A \rightarrow \alpha \bullet \beta,\ a],\ [A \rightarrow \alpha \bullet \beta,\ b]\}) = \{A \rightarrow \alpha \bullet \beta\}$$

### Merging States

If two CLR states have the same core, merge them by **unioning** their lookahead sets:

$$\{[A \rightarrow \alpha \bullet,\ a]\} \cup \{[A \rightarrow \alpha \bullet,\ b]\} \Rightarrow \{[A \rightarrow \alpha \bullet,\ a/b]\}$$

### Result

- Same number of states as LR(0)/SLR
- More precise than SLR (uses merged lookaheads, not global FOLLOW)
- Slightly less powerful than CLR (merging can introduce conflicts)

---

## LALR Construction Example

### CLR States Before Merging

Suppose CLR gives us:

$$
\begin{aligned}
I_4: \quad &[C \rightarrow d \bullet,\ c/d] \\
I_7: \quad &[C \rightarrow d \bullet,\ \$]
\end{aligned}
$$

These have the same core: $\{C \rightarrow d \bullet\}$

### After LALR Merge

$$I_{47}: \quad [C \rightarrow d \bullet,\ c/d/\$]$$

Now we reduce $C \rightarrow d$ on input $c$, $d$, or `$`.

---

## LALR vs CLR: When Merging Causes Conflicts

Merging can introduce **reduce-reduce conflicts** that didn't exist in CLR:

### Example

CLR states (no conflict):
$$
\begin{aligned}
I_a: \quad &[A \rightarrow \alpha \bullet,\ a],\ [B \rightarrow \beta \bullet,\ b] \\
I_b: \quad &[A \rightarrow \alpha \bullet,\ b],\ [B \rightarrow \beta \bullet,\ a]
\end{aligned}
$$

After LALR merge:
$$I_{ab}: \quad [A \rightarrow \alpha \bullet,\ a/b],\ [B \rightarrow \beta \bullet,\ a/b]$$

Now on input $a$: reduce to $A$ or $B$? **Reduce-reduce conflict!**

> In practice, this is extremely rare. LALR handles virtually all programming language grammars.

---

## Complete LALR Construction Algorithm

### Method 1: Build CLR, Then Merge

```python
def build_lalr_from_clr(clr_states):
    """Merge CLR states with same core to get LALR states."""
    # Group states by core
    core_groups = {}
    for state in clr_states:
        core = frozenset((prod, dot) for (prod, dot, _) in state)
        if core not in core_groups:
            core_groups[core] = []
        core_groups[core].append(state)
    
    # Merge each group
    lalr_states = []
    state_map = {}  # old state index -> new state index
    
    for core, group in core_groups.items():
        # Union all lookaheads
        merged = {}
        for state in group:
            for (prod, dot, lookahead) in state:
                key = (prod, dot)
                if key not in merged:
                    merged[key] = set()
                merged[key].add(lookahead)
        
        lalr_state = frozenset(
            (prod, dot, frozenset(las))
            for (prod, dot), las in merged.items()
        )
        lalr_states.append(lalr_state)
        
        # Map old indices to new
        for state in group:
            old_idx = clr_states.index(state)
            state_map[old_idx] = len(lalr_states) - 1
    
    return lalr_states, state_map
```

### Method 2: Efficient LALR (Propagation)

Building full CLR first is expensive. The efficient method:

1. Build the LR(0) automaton (like SLR)
2. Determine lookaheads for each item by **propagation**:
   - Some lookaheads are **spontaneously generated** (from FIRST computations)
   - Others **propagate** from one item to another through GOTO transitions
3. Iterate until no new lookaheads are added (fixed point)

This is the algorithm used by real tools like Bison — it avoids constructing the full CLR automaton.

---

## Comparison Table

| Feature | LR(0) | SLR(1) | LALR(1) | CLR(1) |
|---------|--------|--------|---------|--------|
| Lookahead for reduce | All terminals | FOLLOW(A) | Per-state merged | Per-item exact |
| Number of states | $N$ | $N$ | $N$ | $N$ to $\sim 10N$ |
| Power | Weakest | Moderate | Strong | Maximum |
| Conflicts | Many | Some | Rare | None* |
| Used by | — | Simple tools | Yacc, Bison | Theoretical |
| Practical | No | Sometimes | **Yes** | Rarely (table too big) |

*For unambiguous grammars within LR(1).

---

## The Grammar Hierarchy

$$\text{LR}(0) \subset \text{SLR}(1) \subset \text{LALR}(1) \subset \text{CLR}(1)$$

Each class strictly contains the previous one:

| Grammar | LR(0) | SLR(1) | LALR(1) | CLR(1) |
|---------|:---:|:---:|:---:|:---:|
| $S \rightarrow a$ | ✓ | ✓ | ✓ | ✓ |
| $E \rightarrow E+T \mid T$ | ✗ | ✓ | ✓ | ✓ |
| $S \rightarrow L=R \mid R$ | ✗ | ✗ | ✓ | ✓ |
| Rare pathological cases | ✗ | ✗ | ✗ | ✓ |

**SLR ⊂ LALR:** The grammar $S \rightarrow L = R \mid R$, $L \rightarrow *R \mid \text{id}$, $R \rightarrow L$ is LALR(1) but not SLR(1).

**LALR ⊂ CLR:** There exist grammars where LALR merging creates reduce-reduce conflicts, but CLR has none. These are exceedingly rare in practice.

---

## LALR in Practice: Yacc/Bison

Yacc (Yet Another Compiler-Compiler) and its GNU successor Bison use LALR(1) parsing. Here's how they handle ambiguity:

### Precedence and Associativity

```c
%token NUM ID
%left '+' '-'       /* lowest precedence, left-associative */
%left '*' '/'       /* higher precedence, left-associative */
%right UMINUS       /* highest precedence, right-associative */

%%
expr : expr '+' expr        { $$ = $1 + $3; }
     | expr '-' expr        { $$ = $1 - $3; }
     | expr '*' expr        { $$ = $1 * $3; }
     | expr '/' expr        { $$ = $1 / $3; }
     | '-' expr %prec UMINUS { $$ = -$2; }
     | '(' expr ')'         { $$ = $2; }
     | NUM                  { $$ = $1; }
     ;
%%
```

These declarations resolve shift-reduce conflicts:
- `%left '+' '-'` → on conflict between shifting `+` and reducing an expr with `+`, reduce (left-associative)
- Higher precedence operators shift over lower ones

### Conflict Resolution Rules

| Situation | Resolution |
|-----------|-----------|
| Shift-reduce, same precedence, left-assoc | Reduce |
| Shift-reduce, same precedence, right-assoc | Shift |
| Shift-reduce, shift op has higher prec | Shift |
| Shift-reduce, reduce op has higher prec | Reduce |
| Reduce-reduce | Use first rule listed (with warning) |

---

## LALR vs Recursive Descent (LL)

Modern compilers use either approach:

| Aspect | LALR (Bison) | Recursive Descent (LL) |
|--------|-------------|----------------------|
| Grammar style | Natural (left-recursive OK) | Must avoid left recursion |
| Error messages | Often poor | Excellent (hand-tuned) |
| Maintenance | Edit grammar file | Edit code directly |
| Debugging | Hard (table-driven) | Easy (step through code) |
| Examples | PostgreSQL, Ruby, PHP | GCC, Clang, Go, Rust |

> **Trend:** Many modern compilers use hand-written recursive descent for better error messages, even though LALR is theoretically more powerful.

---

## Practical Implementation

```python
class LALRTableBuilder:
    """Build LALR(1) parse table from grammar (high-level structure)."""

    def __init__(self, grammar):
        self.grammar = grammar
        self.lr0_states = []
        self.lalr_lookaheads = {}
        self.action_table = {}
        self.goto_table = {}
        self.conflicts = []

    def build(self):
        """Full LALR table construction pipeline."""
        self.build_lr0_automaton()      # Step 1: LR(0) states
        self.compute_lookaheads()       # Step 2: propagate lookaheads
        self.build_tables()             # Step 3: ACTION + GOTO
        if self.conflicts:
            for c in self.conflicts:
                print(f"  Conflict: {c}")
            return False
        return True

    def build_tables(self):
        """Construct ACTION and GOTO using LALR lookaheads."""
        for i, state in enumerate(self.lr0_states):
            for item in state:
                prod_idx, dot_pos = item
                lhs, rhs = self.grammar[prod_idx]
                if dot_pos < len(rhs):
                    sym = rhs[dot_pos]
                    j = self.transitions.get((i, sym))
                    if j is not None:
                        if sym in self.terminals:
                            self.set_action(i, sym, ("shift", j))
                        else:
                            self.goto_table[(i, sym)] = j
                else:
                    if prod_idx == 0:
                        self.set_action(i, "$", ("accept", None))
                    else:
                        for la in self.lalr_lookaheads.get((i, item), set()):
                            self.set_action(i, la, ("reduce", prod_idx))

    def set_action(self, state, terminal, action):
        key = (state, terminal)
        if key in self.action_table and self.action_table[key] != action:
            existing = self.action_table[key]
            ctype = "shift-reduce" if existing[0] != action[0] else "reduce-reduce"
            self.conflicts.append(f"State {state}, '{terminal}': {ctype}")
        self.action_table[key] = action
```

---

## Summary of the LR Family

```
Parser Type    Lookahead Source         Table Size    Power
───────────    ────────────────         ──────────    ─────
LR(0)          None (all terminals)     Small         Minimal
SLR(1)         FOLLOW(A) — global       Small         Moderate
LALR(1)        Merged per-state         Small         High
CLR(1)         Exact per-item           Large         Maximum
```

### Decision Guide

- **Learning:** Start with LR(0), understand items and automaton
- **Simple projects:** SLR(1) if grammar allows
- **Production use:** LALR(1) via Yacc/Bison
- **Maximum power needed:** CLR(1) or GLR (generalized LR)

---

## Try It Yourself

### Exercise 1: LR(1) Items

Construct the LR(1) item sets for:

$$
\begin{aligned}
S' &\rightarrow S \\
S &\rightarrow C C \\
C &\rightarrow c C\ |\ d
\end{aligned}
$$

Show all states with lookaheads.

### Exercise 2: LALR Merge

Given the CLR states from Exercise 1, identify which states can be merged (same core) and produce the LALR states.

### Exercise 3: SLR vs LALR

For the grammar $S \rightarrow L = R \mid R$, $L \rightarrow *R \mid \text{id}$, $R \rightarrow L$:
- Show the SLR conflict
- Show how CLR/LALR resolves it
- Trace parsing `id = * id`

### Exercise 4: Conflict Analysis

Create a grammar that is:
- (a) LALR(1) but not SLR(1)
- (b) CLR(1) but not LALR(1) (hint: this requires a grammar where merging causes a reduce-reduce conflict)

### Exercise 5: Yacc Grammar

Write a Yacc/Bison grammar for a simple calculator supporting:
- Integers and floating-point numbers
- `+`, `-`, `*`, `/`, `^` (exponentiation)
- Parentheses
- Unary minus
- Correct precedence and associativity

---

## Key Takeaways

| Concept | Key Point |
|---------|-----------|
| LR(1) items | LR(0) item + specific lookahead terminal |
| CLR closure | Computes FIRST(βa) for new item lookaheads |
| LALR merge | Combine states with same core, union lookaheads |
| Hierarchy | LR(0) ⊂ SLR ⊂ LALR ⊂ CLR |
| Practice | LALR is what Yacc/Bison use — the industry standard |
| Trade-off | CLR = max power, huge tables; LALR = nearly same power, small tables |
| Modern trend | Hand-written recursive descent for better error messages |

---

## What's Next

With parsing complete, we move to **semantic analysis** — type checking, scope resolution, and building the symbol table. The parser gives us a tree; now we give it meaning.
