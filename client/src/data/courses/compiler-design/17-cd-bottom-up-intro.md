---
title: Bottom-Up Parsing Overview
---

# Bottom-Up Parsing Overview

Bottom-up parsing is the most powerful and widely used parsing technique in real compilers. Unlike top-down parsing (which starts from the start symbol and works down), bottom-up parsing starts from the **input tokens** and works up to the start symbol by **reducing** substrings to non-terminals.

---

## Top-Down vs Bottom-Up

| Aspect | Top-Down (LL) | Bottom-Up (LR) |
|--------|---------------|-----------------|
| Direction | Start symbol → input | Input → start symbol |
| Derivation | Leftmost | Rightmost (in reverse) |
| Tree construction | Root → leaves | Leaves → root |
| Power | Limited (no left recursion) | Handles larger class of grammars |
| Used by | Recursive descent, LL(1) | Yacc, Bison, most production parsers |

> **Key insight:** Bottom-up parsing traces a **rightmost derivation in reverse**. Each reduction step undoes one step of a rightmost derivation.

---

## Shift-Reduce Parsing

The fundamental mechanism of bottom-up parsing uses four actions:

### The Four Actions

| Action | Description |
|--------|-------------|
| **Shift** | Move the next input token onto the stack |
| **Reduce** | Replace a sequence of symbols on top of the stack with a non-terminal (apply a production in reverse) |
| **Accept** | Input is fully parsed — the stack contains only the start symbol |
| **Error** | No valid action exists — syntax error |

### The Stack and Input

```
Stack              Input              Action
─────              ─────              ──────
$                  id + id * id $     shift
$ id               + id * id $        reduce F → id
$ F                + id * id $        reduce T → F
$ T                + id * id $        reduce E → T
$ E                + id * id $        shift
$ E +              id * id $          shift
$ E + id           * id $             reduce F → id
$ E + F            * id $             reduce T → F
$ E + T            * id $             shift
$ E + T *          id $               shift
$ E + T * id       $                  reduce F → id
$ E + T * F        $                  reduce T → T * F
$ E + T            $                  reduce E → E + T
$ E                $                  accept ✓
```

---

## Handles

A **handle** is the specific substring on top of the stack that should be reduced next.

### Formal Definition

A handle of a right-sentential form $\gamma$ is a production $A \rightarrow \beta$ and a position in $\gamma$ where $\beta$ can be found, such that replacing $\beta$ with $A$ produces the previous right-sentential form in the derivation.

### Example

Given the grammar:

$$
\begin{aligned}
E &\rightarrow E + T\ |\ T \\
T &\rightarrow T * F\ |\ F \\
F &\rightarrow (E)\ |\ \text{id}
\end{aligned}
$$

Rightmost derivation of `id + id * id`:

$$
E \Rightarrow E + T \Rightarrow E + T * F \Rightarrow E + T * \text{id} \Rightarrow E + F * \text{id} \Rightarrow E + \text{id} * \text{id} \Rightarrow T + \text{id} * \text{id} \Rightarrow F + \text{id} * \text{id} \Rightarrow \text{id} + \text{id} * \text{id}
$$

Reading this derivation **in reverse** gives us the sequence of reductions:

| Right-sentential form | Handle | Reduce to |
|---|---|---|
| id + id * id | id (first) | F |
| F + id * id | F | T |
| T + id * id | T | E |
| E + id * id | id (second) | F |
| E + F * id | F | T |
| E + T * id | id (third) | F |
| E + T * F | T * F | T |
| E + T | E + T | E |

> **The key challenge of bottom-up parsing:** identifying the correct handle at each step!

---

## Viable Prefixes

A **viable prefix** is any prefix of a right-sentential form that can appear on the stack during a valid shift-reduce parse. It never extends past the handle.

$$\text{Viable prefix} = \text{prefix of a right-sentential form that does not go beyond the handle}$$

Why this matters:
- The stack always contains a viable prefix
- If we can recognize viable prefixes, we know when to shift and when to reduce
- LR parsing automates this recognition using a **finite automaton**

### Example

For the sentential form `E + T * F`:
- `E`, `E +`, `E + T`, `E + T *`, `E + T * F` are all viable prefixes
- `E + T * F +` is NOT a viable prefix (goes past the handle `T * F`)

---

## Shift-Reduce Conflicts

Sometimes the parser can't decide between shifting and reducing:

### Shift-Reduce Conflict

```
Stack: $ ... if E then S
Input: else ...

Should we:
  (a) Shift 'else' onto the stack?   → matches if-then-else
  (b) Reduce 'if E then S' to S?     → matches if-then (dangling else!)
```

This is the classic **dangling else** problem. Most parsers resolve it by preferring **shift** (associating `else` with the nearest `if`).

### Reduce-Reduce Conflict

When two different productions could both reduce the symbols on top of the stack:

```
Grammar:
  A → a b
  B → a b

Stack: $ ... a b
Input: ...

Should we reduce to A or B?
```

Reduce-reduce conflicts indicate an **ambiguous grammar** (or at least one the parser can't handle). They must be resolved by rewriting the grammar or using precedence/associativity declarations.

---

## Complete Shift-Reduce Example

Let's trace `id + id * id` with the expression grammar:

```
Grammar:
  (1) E → E + T
  (2) E → T
  (3) T → T * F
  (4) T → F
  (5) F → ( E )
  (6) F → id
```

```
Step  Stack            Input              Action
────  ─────            ─────              ──────
 1    $                id + id * id $     shift
 2    $ id             + id * id $        reduce by (6): F → id
 3    $ F              + id * id $        reduce by (4): T → F
 4    $ T              + id * id $        reduce by (2): E → T
 5    $ E              + id * id $        shift
 6    $ E +            id * id $          shift
 7    $ E + id         * id $             reduce by (6): F → id
 8    $ E + F          * id $             reduce by (4): T → F
 9    $ E + T          * id $             shift  ← NOT reduce!
10    $ E + T *        id $               shift
11    $ E + T * id     $                  reduce by (6): F → id
12    $ E + T * F      $                  reduce by (3): T → T * F
13    $ E + T          $                  reduce by (1): E → E + T
14    $ E              $                  accept ✓
```

**Critical decision at step 9:** Why shift instead of reduce?

If we reduced `E + T` to `E` at step 9, we'd get `E * id`, which can't be parsed! The `*` has higher precedence than `+`, so we must shift to build `T * F` first.

> Bottom-up parsing naturally handles **operator precedence** — the grammar structure encodes it.

---

## Why Bottom-Up Is More Powerful

### LL(1) Limitations

LL(1) parsers cannot handle:
- **Left-recursive grammars** (must be transformed)
- **Common prefixes** without factoring
- Many naturally-written programming language grammars

### LR Advantages

LR parsers can handle:
- Left-recursive grammars directly
- A strictly larger class of grammars
- Most programming language constructs without grammar transformation

$$\text{LL}(1) \subset \text{LR}(1)$$

### Formal Power Comparison

Every LL(1) grammar is also LR(1), but not vice versa. For example:

```
S → a A | b B
A → c A | d
B → c B | d
```

This is LR(1) but NOT LL(1) — both `A` and `B` start with `c`, causing a prediction conflict for LL parsers. An LR parser handles it by deferring the decision until enough context is on the stack.

---

## The LR Parsing Family

LR parsing comes in several variants, differing in power and table size:

```
                    Grammar Classes
    ┌─────────────────────────────────────────┐
    │                 CLR(1)                   │
    │    ┌───────────────────────────────┐    │
    │    │           LALR(1)             │    │
    │    │    ┌─────────────────────┐    │    │
    │    │    │       SLR(1)        │    │    │
    │    │    │  ┌─────────────┐    │    │    │
    │    │    │  │   LR(0)     │    │    │    │
    │    │    │  └─────────────┘    │    │    │
    │    │    └─────────────────────┘    │    │
    │    └───────────────────────────────┘    │
    └─────────────────────────────────────────┘
```

| Parser | Lookahead | Table Size | Used By |
|--------|-----------|------------|---------|
| **LR(0)** | None | Small | Educational; very limited |
| **SLR(1)** | FOLLOW sets | Moderate | Simple languages |
| **LALR(1)** | Merged lookaheads | Same as SLR | Yacc, Bison, most tools |
| **CLR(1)** | Full lookahead | Large (often impractical) | Theoretical maximum |

### Key Characteristics

- **LR(0):** No lookahead — decides purely based on stack state
- **SLR(1):** Uses FOLLOW sets to resolve conflicts
- **LALR(1):** Uses precise lookaheads computed per state — more powerful than SLR
- **CLR(1):** Full canonical LR — maximum power, but tables can be huge

In practice, **LALR(1)** hits the sweet spot: nearly as powerful as CLR(1) but with tables the same size as SLR(1).

---

## Parser Generator Workflow

Real compilers use **parser generators** that automate LR table construction:

```
┌──────────────┐     ┌──────────────────┐     ┌───────────────┐
│   Grammar    │────→│ Parser Generator  │────→│  Parse Table  │
│  (.y file)   │     │  (Yacc/Bison)    │     │  + Driver Code│
└──────────────┘     └──────────────────┘     └───────────────┘
```

Example Yacc/Bison grammar:

```c
%token ID NUM
%left '+' '-'
%left '*' '/'

%%
expr : expr '+' expr
     | expr '-' expr
     | expr '*' expr
     | expr '/' expr
     | '(' expr ')'
     | ID
     | NUM
     ;
%%
```

The `%left` declarations resolve shift-reduce conflicts by specifying operator associativity and precedence.

---

## Shift-Reduce Parsing in Python

Here's a simple (but not efficient) shift-reduce parser for demonstration:

```python
def shift_reduce_parse(grammar, input_tokens):
    """
    Simple shift-reduce parser (brute-force handle finding).
    Not practical — just for understanding the concept.
    """
    stack = []
    ip = 0
    tokens = input_tokens + ["$"]
    
    step = 1
    print(f"{'Step':<5} {'Stack':<25} {'Input':<20} {'Action'}")
    print("-" * 70)
    
    while True:
        stack_str = " ".join(["$"] + stack)
        input_str = " ".join(tokens[ip:])
        
        # Check if we can accept
        if stack == [grammar["start"]] and tokens[ip] == "$":
            print(f"{step:<5} {stack_str:<25} {input_str:<20} ACCEPT")
            return True
        
        # Try to find a handle (check productions in priority order)
        reduced = False
        for lhs, rhs_list in grammar["rules"]:
            for rhs in rhs_list:
                rhs_symbols = rhs.split()
                n = len(rhs_symbols)
                if stack[-n:] == rhs_symbols:
                    # Found a handle — reduce
                    action = f"reduce {lhs} → {rhs}"
                    print(f"{step:<5} {stack_str:<25} {input_str:<20} {action}")
                    stack = stack[:-n]
                    stack.append(lhs)
                    reduced = True
                    break
            if reduced:
                break
        
        if not reduced:
            # Shift
            if ip < len(tokens) - 1:
                action = f"shift '{tokens[ip]}'"
                print(f"{step:<5} {stack_str:<25} {input_str:<20} {action}")
                stack.append(tokens[ip])
                ip += 1
            else:
                print(f"{step:<5} {stack_str:<25} {input_str:<20} ERROR")
                return False
        
        step += 1


# Define grammar (rules in reduction priority order)
grammar = {
    "start": "E",
    "rules": [
        ("F", ["id", "( E )"]),
        ("T", ["T * F", "F"]),
        ("E", ["E + T", "T"]),
    ]
}

# Parse
shift_reduce_parse(grammar, ["id", "+", "id", "*", "id"])
```

> **Note:** This brute-force approach doesn't know *when* to reduce vs shift. Real LR parsers use the parse table to make this decision in $O(1)$.

---

## Comparison Summary

| Feature | LL Parsing | LR Parsing |
|---------|-----------|------------|
| Construction direction | Top-down | Bottom-up |
| Derivation | Leftmost | Rightmost (reverse) |
| Decision point | At production choice | At reduce vs shift |
| Left recursion | ❌ Must eliminate | ✅ Handles directly |
| Grammar power | Weaker | Stronger |
| Error detection | At first wrong token | At first impossible reduction |
| Implementation | Simpler (recursive descent) | Requires table generator |
| Real-world use | GCC (hand-written), ANTLR | Yacc, Bison, most tools |

---

## Try It Yourself

### Exercise 1: Trace by Hand

Trace the shift-reduce parse of `(id + id) * id` using the expression grammar. Show every step including the stack, remaining input, and action.

### Exercise 2: Identify Conflicts

For this grammar:

$$
\begin{aligned}
S &\rightarrow \text{if}\ E\ \text{then}\ S\ |\ \text{if}\ E\ \text{then}\ S\ \text{else}\ S\ |\ a \\
E &\rightarrow b
\end{aligned}
$$

Show where a shift-reduce conflict occurs during parsing of `if b then if b then a else a`.

### Exercise 3: Handle Identification

Given the rightmost derivation:

$$S \Rightarrow aABe \Rightarrow aAde \Rightarrow aAbcde \Rightarrow aabcde$$

Identify the handle at each step (reading the derivation in reverse).

### Exercise 4: Grammar Power

Give an example of a grammar that is:
- (a) LR(1) but not LL(1)
- (b) Not LR(1) (ambiguous)

### Exercise 5: Precedence

Explain how the grammar:

$$
\begin{aligned}
E &\rightarrow E + T\ |\ T \\
T &\rightarrow T * F\ |\ F \\
F &\rightarrow \text{id}
\end{aligned}
$$

...encodes that `*` has higher precedence than `+` through its structure alone (without any explicit precedence declarations).

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Bottom-up | Reduce input tokens to start symbol |
| Shift-reduce | Four actions: shift, reduce, accept, error |
| Handle | Substring to reduce next (rightmost in reverse) |
| Viable prefix | What's on the stack — never extends past handle |
| Conflicts | Shift-reduce (ambiguity) or reduce-reduce (grammar issue) |
| LR family | LR(0) ⊂ SLR ⊂ LALR ⊂ CLR |
| Practice | LALR(1) used by most parser generators |

---

## Next Lesson

We'll build the machinery for **LR(0) parsing** — constructing the LR(0) automaton with items, closure, and GOTO operations. This forms the foundation for all LR parsers.
