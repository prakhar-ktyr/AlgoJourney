---
title: Finite Automata in Scanner Design
---

# Finite Automata in Scanner Design

In the previous lesson, we defined token patterns using regular expressions. Now we'll see how those regex patterns are transformed into **finite automata** — the computational engines that power real lexical analyzers. This conversion process turns declarative pattern specifications into executable scanning machines.

---

## The Big Picture

The pipeline from regex to efficient scanner:

$$\text{Regex} \xrightarrow{\text{Thompson's}} \text{NFA} \xrightarrow{\text{Subset Construction}} \text{DFA} \xrightarrow{\text{Minimization}} \text{Minimal DFA} \xrightarrow{\text{Table Gen}} \text{Scanner}$$

Each step is well-defined and fully automatic — this is exactly what tools like Lex and Flex do internally.

---

## Step 1: Converting Regex to NFA (Thompson's Construction)

Thompson's construction builds an NFA from a regex using a set of simple composition rules. Each regex operation has a corresponding NFA fragment.

### Base Cases

**Single character** $a$:

```
  ──→ (start) ──a──→ ((accept))
```

Two states, one transition on character $a$.

**Empty string** $\epsilon$:

```
  ──→ ((start/accept))
```

One state that is both start and accept.

### Composition Rules

**Union** $r_1 | r_2$:

```
            ε → [NFA for r₁] → ε
           /                      \
  → (start)                        → ((accept))
           \                      /
            ε → [NFA for r₂] → ε
```

New start state with $\epsilon$-transitions to both sub-NFAs; both sub-NFA accept states connect via $\epsilon$ to new accept state.

**Concatenation** $r_1 r_2$:

```
  → [NFA for r₁] → ε → [NFA for r₂] →
```

Accept state of first becomes (via $\epsilon$) start state of second.

**Kleene star** $r^*$:

```
          ε
         ┌──────────────────────┐
         ↓                      │
  → (start) → ε → [NFA for r] → ε → ((accept))
         │                               ↑
         └───────────── ε ───────────────┘
```

The start state can skip the NFA entirely ($\epsilon$ to accept) or enter it; the NFA's accept state can loop back.

### Properties of Thompson's NFA

For a regex of length $m$:
- At most $2m$ states
- At most $4m$ transitions
- Exactly one start state, one accept state
- Each state has at most 2 outgoing transitions

### Example: NFA for `[a-z][a-z0-9]*`

This regex matches identifiers starting with a letter, followed by zero or more letters/digits.

```
  → (0) ──[a-z]──→ (1) ──ε──→ (2) ──[a-z0-9]──→ (3) ──ε──→ (2)
                               │
                               └──ε──→ ((4))
                    (1) ──ε──→ ((4))
```

State 0: start, reading first letter
State 1: read one letter
States 2-3: loop reading more alphanumerics
State 4: accept

---

## Step 2: NFA to DFA (Subset Construction)

An NFA can be in **multiple states simultaneously** (due to $\epsilon$-transitions and nondeterminism). The subset construction creates an equivalent DFA where each DFA state represents a **set of NFA states**.

### Algorithm: Subset Construction

```python
def subset_construction(nfa):
    """Convert NFA to DFA using subset construction."""
    # Start state of DFA = epsilon-closure of NFA start
    start = epsilon_closure({nfa.start_state})
    
    dfa_states = {frozenset(start)}
    worklist = [frozenset(start)]
    transitions = {}
    
    while worklist:
        current = worklist.pop()
        
        for char in alphabet:
            # Move: states reachable from current on 'char'
            moved = set()
            for state in current:
                for target in nfa.transition(state, char):
                    moved.add(target)
            
            # Epsilon-closure of moved states
            next_state = frozenset(epsilon_closure(moved))
            
            if not next_state:
                continue
                
            if next_state not in dfa_states:
                dfa_states.add(next_state)
                worklist.append(next_state)
            
            transitions[(current, char)] = next_state
    
    # DFA accept states: any DFA state containing an NFA accept state
    accept_states = {
        s for s in dfa_states if nfa.accept_state in s
    }
    
    return DFA(start, dfa_states, transitions, accept_states)


def epsilon_closure(states):
    """Find all states reachable via epsilon transitions."""
    closure = set(states)
    worklist = list(states)
    
    while worklist:
        state = worklist.pop()
        for target in nfa.epsilon_transitions(state):
            if target not in closure:
                closure.add(target)
                worklist.append(target)
    
    return closure
```

### Complexity

- Worst case: DFA has $2^n$ states for an NFA with $n$ states
- In practice: usually much fewer states (often $O(n)$)
- The exponential blowup rarely occurs for typical token patterns

---

## Step 3: DFA Minimization

Two DFA states are **equivalent** if they produce identical behavior for all possible future inputs. Minimization merges equivalent states.

### Hopcroft's Algorithm

```python
def minimize_dfa(dfa):
    """Minimize DFA using Hopcroft's algorithm."""
    # Initial partition: accept states vs non-accept states
    accept = frozenset(dfa.accept_states)
    non_accept = frozenset(dfa.states - dfa.accept_states)
    
    partition = {accept, non_accept} - {frozenset()}
    worklist = list(partition)
    
    while worklist:
        splitter = worklist.pop()
        
        for char in alphabet:
            # States that transition into 'splitter' on 'char'
            predecessors = {
                s for s in dfa.states
                if dfa.transition(s, char) in splitter
            }
            
            for group in list(partition):
                # Split group into states that go to splitter and states that don't
                intersection = group & predecessors
                difference = group - predecessors
                
                if intersection and difference:
                    # Split this group
                    partition.remove(group)
                    partition.add(frozenset(intersection))
                    partition.add(frozenset(difference))
                    
                    if group in worklist:
                        worklist.remove(group)
                        worklist.append(frozenset(intersection))
                        worklist.append(frozenset(difference))
                    else:
                        # Add smaller half
                        if len(intersection) <= len(difference):
                            worklist.append(frozenset(intersection))
                        else:
                            worklist.append(frozenset(difference))
    
    return build_minimized_dfa(partition, dfa)
```

**Time complexity:** $O(n \log n)$ where $n$ is the number of DFA states.

---

## Combined Scanner DFA

A real lexer recognizes **multiple** token types simultaneously. Here's how we build a single DFA for all tokens:

### Step 1: Build NFA for Each Token Pattern

```
Token pattern 1: regex₁ → NFA₁ (accept state labeled TOKEN_1)
Token pattern 2: regex₂ → NFA₂ (accept state labeled TOKEN_2)
Token pattern 3: regex₃ → NFA₃ (accept state labeled TOKEN_3)
...
```

### Step 2: Merge with Common Start State

Create a new start state $s_0$ with $\epsilon$-transitions to each token NFA:

```
                 ε → [NFA₁] → ((accept: TOKEN_1))
                /
  → (s₀) ──── ε → [NFA₂] → ((accept: TOKEN_2))
                \
                 ε → [NFA₃] → ((accept: TOKEN_3))
```

### Step 3: Convert Combined NFA to DFA

Apply subset construction to the merged NFA. Now each DFA state is a set of NFA states that may include accept states from **different** token patterns.

### Step 4: Resolve Conflicts

A DFA state containing accept states from multiple token NFAs means **multiple patterns match**. Resolve using **priority**:

$$\text{token\_type}(D) = \text{highest priority token among NFA accept states in } D$$

**Example:** DFA state $\{q_3^{\text{IF}}, q_7^{\text{IDENT}}\}$ — both keyword `if` and identifier match. Since keywords have higher priority → label this state as `IF`.

### Step 5: Minimize

Apply DFA minimization, but never merge states with **different** token labels.

---

## DFA-Based Scanning Algorithm

Once we have the combined, minimized DFA, scanning is straightforward:

```c
#include <stdio.h>
#include <string.h>

#define NUM_STATES 50
#define NUM_CHARS 128
#define NO_TOKEN -1

// DFA tables (generated by lexer generator)
int transition[NUM_STATES][NUM_CHARS];  // next state
int token_type[NUM_STATES];             // token at accept states, -1 otherwise
int start_state = 0;

typedef struct {
    int type;
    char *start;
    int length;
    int line;
    int col;
} Token;

Token scan_next_token(char **input, int *line, int *col) {
    char *start = *input;
    int start_col = *col;
    
    int state = start_state;
    char *current = start;
    
    // Track last accepting position
    int last_accept_state = -1;
    char *last_accept_pos = NULL;
    
    // Read characters until no transition available
    while (*current != '\0') {
        int ch = (unsigned char)*current;
        int next = transition[state][ch];
        
        if (next == -1) {
            break;  // No transition — stop
        }
        
        state = next;
        current++;
        
        // Record if this is an accepting state
        if (token_type[state] != NO_TOKEN) {
            last_accept_state = state;
            last_accept_pos = current;
        }
    }
    
    Token tok;
    
    if (last_accept_state != -1) {
        // Found a token — output it
        tok.type = token_type[last_accept_state];
        tok.start = start;
        tok.length = last_accept_pos - start;
        tok.line = *line;
        tok.col = start_col;
        
        // Advance input to end of token
        *input = last_accept_pos;
        *col += tok.length;
    } else if (*start != '\0') {
        // No match — error, skip one character
        tok.type = -2;  // ERROR token
        tok.start = start;
        tok.length = 1;
        tok.line = *line;
        tok.col = start_col;
        
        *input = start + 1;
        (*col)++;
    }
    
    return tok;
}
```

### Key Insight: Last Accepting State

The scanner doesn't stop at the **first** accepting state — it continues reading until no transition is possible, then **backs up** to the last accepting state. This implements the **longest match** rule.

**Example:** Scanning `"ifvar"` with keyword `if` and identifier patterns:

| Position | Char | State | Accepting? |
|----------|------|-------|-----------|
| 0 | `i` | 2 | No |
| 1 | `f` | 5 | Yes (IF), Yes (IDENT) |
| 2 | `v` | 7 | Yes (IDENT) |
| 3 | `a` | 7 | Yes (IDENT) |
| 4 | `r` | 7 | Yes (IDENT) |
| 5 | (end) | — | No transition |

Last accepting state at position 5 → token is IDENT `"ifvar"`.

---

## Table-Driven Scanner

The most common implementation stores the DFA as tables in memory:

### Transition Table

A 2D array `next_state[state][character]`:

```c
// For a scanner with 20 states and ASCII input
int next_state[20][128] = {
    // state 0 (start):
    //   'a'-'z' → state 1 (identifier start)
    //   '0'-'9' → state 5 (number start)
    //   '+'     → state 10
    //   ...
    [0] = { ['a'...'z'] = 1, ['0'...'9'] = 5, ['+'] = 10, ... },
    [1] = { ['a'...'z'] = 1, ['0'...'9'] = 1, ['_'] = 1, ... },
    // ...
};
```

### Accept Table

A 1D array `accept[state]` mapping state → token type (or -1 for non-accepting):

```c
int accept[20] = {
    [0] = -1,          // start state: not accepting
    [1] = TOK_IDENT,   // identifier
    [5] = TOK_INT,     // integer
    [8] = TOK_FLOAT,   // float
    [10] = TOK_PLUS,   // '+'
    // ...
};
```

### Compact Table Representation

The full $\text{states} \times \text{chars}$ table is often sparse (mostly -1 entries). Compression techniques:

**1. Character Classes:** Map characters to equivalence classes to reduce columns:

```c
// Map 128 ASCII chars to ~20 classes
int char_class[128] = {
    ['a'...'z'] = CLASS_LETTER,
    ['A'...'Z'] = CLASS_LETTER,
    ['0'...'9'] = CLASS_DIGIT,
    ['+'] = CLASS_PLUS,
    ['-'] = CLASS_MINUS,
    // ...
};

// Now table is states × classes (much smaller)
int next_state[20][20];
```

**2. Row Compression (Comb Vector):**

Store only non-empty entries with index arrays:

```c
int base[NUM_STATES];    // base index for each state
int check[TABLE_SIZE];   // verify state owns this entry
int next[TABLE_SIZE];    // next state value

int get_next(int state, int char_class) {
    int index = base[state] + char_class;
    if (check[index] == state) {
        return next[index];
    }
    return -1;  // no transition (error/dead state)
}
```

This is the technique used by Flex-generated scanners.

---

## State Minimization for Scanner Efficiency

After building the combined DFA, minimization is critical for performance:

### Before Minimization

A naive combined DFA for a language with 30 token patterns might have 200+ states.

### After Minimization

The same language typically reduces to 40-60 states — a $3\text{-}5\times$ reduction.

### Why It Matters

- **Table size:** $\text{states} \times \text{char\_classes}$ entries
- **Cache performance:** smaller tables fit in L1/L2 cache
- **Memory:** embedded systems have limited RAM

### What Can't Be Merged

States with **different token labels** are never merged, even if they have identical transitions:

```
State A: accepts INTEGER, transitions {...}
State B: accepts FLOAT,   transitions {...}  ← same transitions!
```

These stay separate because they produce different tokens.

---

## Complete Example: Building a Scanner DFA

Let's build a scanner for a tiny language with three token types:

- `INTEGER`: `[0-9]+`
- `PLUS`: `+`
- `IDENT`: `[a-z]+`

### Step 1: Individual NFAs

```
INTEGER NFA:
  → (0) ──[0-9]──→ ((1)) ──[0-9]──→ ((1))  [loops]

PLUS NFA:
  → (2) ──+──→ ((3))

IDENT NFA:
  → (4) ──[a-z]──→ ((5)) ──[a-z]──→ ((5))  [loops]
```

### Step 2: Combined NFA

```
  → (S) ──ε──→ (0) ──[0-9]──→ ((1: INTEGER))
       ──ε──→ (2) ──+──→ ((3: PLUS))
       ──ε──→ (4) ──[a-z]──→ ((5: IDENT))
```

### Step 3: Subset Construction

| DFA State | NFA States | Transitions |
|-----------|-----------|-------------|
| $D_0$ | $\{S, 0, 2, 4\}$ | digit→$D_1$, `+`→$D_2$, letter→$D_3$ |
| $D_1$ | $\{1\}$ | digit→$D_1$ |
| $D_2$ | $\{3\}$ | (none) |
| $D_3$ | $\{5\}$ | letter→$D_3$ |

### Step 4: Label Accept States

- $D_1$ contains NFA state 1 → **INTEGER**
- $D_2$ contains NFA state 3 → **PLUS**
- $D_3$ contains NFA state 5 → **IDENT**

### Step 5: DFA Transition Table

| State | digit | `+` | letter | Other |
|-------|-------|-----|--------|-------|
| $D_0$ (start) | $D_1$ | $D_2$ | $D_3$ | error |
| $D_1$ (INTEGER) | $D_1$ | — | — | — |
| $D_2$ (PLUS) | — | — | — | — |
| $D_3$ (IDENT) | — | — | $D_3$ | — |

### Scanning Example

Input: `"abc + 123"`

1. Start at $D_0$, read `a` → $D_3$ (IDENT), read `b` → $D_3$, read `c` → $D_3$, read ` ` → no transition. Last accept: $D_3$ at position 3. **Emit IDENT "abc"**.

2. Skip whitespace (handled separately). Start at $D_0$, read `+` → $D_2$ (PLUS), read ` ` → no transition. **Emit PLUS "+"**.

3. Skip whitespace. Start at $D_0$, read `1` → $D_1$ (INTEGER), read `2` → $D_1$, read `3` → $D_1$, end of input. **Emit INTEGER "123"**.

---

## Performance Analysis

### Time Complexity

For input of length $n$:
- Each character is examined at most **twice** (once forward, once on backup)
- Total scanning time: $O(n)$
- Per-character cost: one table lookup (array indexing)

### Space Complexity

- Transition table: $O(|S| \times |\Sigma|)$ entries
- With char classes: $O(|S| \times |C|)$ where $|C| \ll |\Sigma|$
- With compression: often $O(|S| + |\text{transitions}|)$

### Comparison of Approaches

| Method | Time per char | Space | Flexibility |
|--------|---------------|-------|-------------|
| Table-driven DFA | 1 table lookup | Medium | Automatic |
| Direct-coded DFA | 1 branch | Low | Manual |
| NFA simulation | $O(|S|)$ | Low | Flexible |
| Backtracking | Exponential worst case | Low | Full regex |

Table-driven DFA is the standard choice for generated scanners.

---

## Summary

| Step | Input | Output | Algorithm |
|------|-------|--------|-----------|
| 1 | Regex | NFA | Thompson's construction |
| 2 | NFA | DFA | Subset construction |
| 3 | DFA | Min DFA | Hopcroft's algorithm |
| 4 | Min DFA | Scanner | Table generation |

The combined scanner DFA:
- Handles all token patterns simultaneously
- Implements longest match automatically
- Uses priority to resolve ambiguous matches
- Runs in $O(n)$ time (linear in input length)
- Uses $O(1)$ time per character (one table lookup)

---

## Exercises

1. Construct the NFA (using Thompson's construction) for the regex `a(b|c)*d`. Show all states and transitions.

2. Apply subset construction to convert the NFA from Exercise 1 into a DFA. Show the DFA state table.

3. Given token patterns INTEGER = `[0-9]+` and FLOAT = `[0-9]+\.[0-9]+`, build the combined scanner DFA. Show how scanning `"3.14"` produces a FLOAT token (not INTEGER + DOT + INTEGER).

4. A DFA has the following transition table. Identify which states can be merged by minimization:

   | State | `a` | `b` | Accept? |
   |-------|-----|-----|---------|
   | 0 | 1 | 2 | No |
   | 1 | 3 | 4 | Yes (T1) |
   | 2 | 3 | 4 | Yes (T1) |
   | 3 | 1 | 2 | No |
   | 4 | 1 | 2 | No |

5. Explain why the scanner backs up to the "last accepting state" rather than stopping at the first accepting state. Give an example where stopping at the first would produce incorrect tokens.

6. Calculate the transition table size for a scanner with 80 states and 128 ASCII characters. How much does using 15 character equivalence classes save?

7. Implement the `epsilon_closure` function for an NFA represented as an adjacency list. Test it on an NFA with at least 5 states and 3 $\epsilon$-transitions.
