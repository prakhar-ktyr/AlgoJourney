---
title: Syntax-Directed Definitions
---

# Syntax-Directed Definitions

A **Syntax-Directed Definition (SDD)** attaches semantic rules to grammar productions. As the parser builds the parse tree (or reduces in bottom-up parsing), it also computes **attributes** — values associated with grammar symbols.

---

## What Are Attributes?

An **attribute** is a value attached to a grammar symbol (terminal or non-terminal). Examples:

| Symbol | Attribute | Meaning |
|--------|-----------|---------|
| `NUMBER` | `.val` | Numeric value of the token |
| `expr` | `.val` | Computed value of expression |
| `decl` | `.type` | Declared type |
| `id` | `.entry` | Symbol table entry |

Attributes flow information through the parse tree, enabling **semantic computation** during or after parsing.

---

## Synthesized vs Inherited Attributes

### Synthesized Attributes

Computed from the attributes of **children** (bottom-up flow).

$$
A.s = f(X_1.a, X_2.a, \ldots, X_n.a)
$$

where $A \rightarrow X_1 X_2 \ldots X_n$ is a production and $.s$ is a synthesized attribute of $A$.

**Example**: Computing expression values.

```
Production              Semantic Rule
─────────────────────────────────────────
expr → expr₁ + term    expr.val = expr₁.val + term.val
expr → term            expr.val = term.val
term → term₁ * factor  term.val = term₁.val * factor.val
term → factor          term.val = factor.val
factor → ( expr )      factor.val = expr.val
factor → NUMBER        factor.val = NUMBER.lexval
```

For input `3 + 4 * 2`:

```
              expr.val = 11
             /    |    \
      expr.val=3  +   term.val=8
         |            /    |   \
      term.val=3  term.val=4  *  factor.val=2
         |           |               |
      factor.val=3 factor.val=4   NUMBER(2)
         |           |
      NUMBER(3)   NUMBER(4)
```

### Inherited Attributes

Computed from attributes of **parent** and/or **siblings** (top-down flow).

$$
X_i.in = g(A.a, X_1.a, \ldots, X_{i-1}.a)
$$

An inherited attribute of $X_i$ depends on the parent $A$ or left siblings.

**Example**: Type propagation in declarations.

```
Production              Semantic Rule
─────────────────────────────────────────
decl → type varlist     varlist.dtype = type.val
type → INT              type.val = integer
type → FLOAT            type.val = float
varlist → varlist₁, id  varlist₁.dtype = varlist.dtype
                        addtype(id.entry, varlist.dtype)
varlist → id            addtype(id.entry, varlist.dtype)
```

For `int x, y, z`:

```
           decl
          /    \
    type.val=int  varlist.dtype=int
        |         /      |      \
       INT   varlist.dtype=int , id(z) → type=int
             /      |      \
        varlist.dtype=int , id(y) → type=int
             |
          id(x) → type=int
```

The type flows **down** from the parent to children.

---

## S-Attributed Definitions

An SDD is **S-attributed** if it uses **only synthesized attributes**.

Properties:
- Can be evaluated in a single **bottom-up** pass.
- Natural fit for LR parsing (evaluate on each reduce).
- Yacc/Bison actions are exactly S-attributed evaluation.

**Example**: Desk calculator in Yacc:

```c
expr : expr '+' term  { $$ = $1 + $3; }  /* synthesized */
     | term           { $$ = $1; }
     ;
```

---

## L-Attributed Definitions

An SDD is **L-attributed** if each inherited attribute of $X_i$ in production $A \rightarrow X_1 X_2 \ldots X_n$ depends only on:

1. Inherited attributes of $A$ (the parent).
2. Attributes of $X_1, X_2, \ldots, X_{i-1}$ (left siblings only).

$$
X_i.\text{inherited} = f(A.\text{inherited}, X_1.\text{all}, X_2.\text{all}, \ldots, X_{i-1}.\text{all})
$$

Properties:
- Can be evaluated in a single **left-to-right** pass.
- Superset of S-attributed (every S-attributed is L-attributed).
- Natural fit for LL parsing and recursive descent.

**All S-attributed definitions are L-attributed**, but not vice versa.

$$
\text{S-attributed} \subset \text{L-attributed} \subset \text{All SDDs}
$$

---

## Annotated Parse Trees

An **annotated parse tree** shows attribute values at each node.

### Example: `3 * 5 + 4`

Grammar with synthesized attribute `val`:

```
E → E₁ + T    E.val = E₁.val + T.val
E → T         E.val = T.val
T → T₁ * F   T.val = T₁.val * F.val
T → F         T.val = F.val
F → digit     F.val = digit.lexval
```

Annotated parse tree:

```
           E.val = 19
          / |  \
    E.val=15 +  T.val=4
       |           |
    T.val=15    F.val=4
    / |  \        |
T.val=3 * F.val=5  4
   |         |
F.val=3      5
   |
   3
```

---

## Dependency Graphs

A **dependency graph** shows which attributes depend on which others. It determines the **evaluation order**.

### Building the Graph

1. For each node in the parse tree, create a vertex for each attribute.
2. For each semantic rule $b = f(c_1, c_2, \ldots)$, draw edges from $c_1, c_2, \ldots$ to $b$.

### Example: Type Declaration

For `float x, y`:

```
        decl
       /    \
  type       varlist
  |          /   |   \
 FLOAT   varlist , id(y)
            |
          id(x)
```

Dependency edges:
- `type.val` → `varlist.dtype` (inherited flows down)
- `varlist.dtype` → `addtype(id(x))` (use in action)
- `varlist.dtype` → inner `varlist.dtype` (inherited flows down)
- inner `varlist.dtype` → `addtype(id(y))` (use in action)

### Topological Sort

Any **topological order** of the dependency graph gives a valid evaluation order. If the graph has cycles, the SDD **cannot be evaluated** — this is a design error.

For an acyclic dependency graph with $n$ attribute instances:

$$
\text{Evaluation time} = O(n)
$$

---

## Evaluation Methods

### 1. Parse-Tree Methods

Build the full parse tree, compute the dependency graph, topologically sort, evaluate.

**Pros**: Works for any non-circular SDD.
**Cons**: Requires storing the entire parse tree.

### 2. Rule-Based Methods

Analyse the grammar statically to determine a fixed evaluation order for each production.

### 3. Oblivious Methods (Passes)

Use multiple passes over the tree — each pass evaluates some attributes.

**Pass 1**: All synthesized attributes (bottom-up).
**Pass 2**: All inherited attributes (top-down).

### 4. On-the-Fly Evaluation (During Parsing)

For S-attributed SDDs (bottom-up) or L-attributed SDDs (top-down), evaluate attributes **during parsing** without building the full tree.

---

## Evaluation During Bottom-Up Parsing

In an LR parser, synthesized attributes are evaluated when a production is **reduced**.

```c
/* Parser stack holds (state, value) pairs */
/* On reduce A → X₁ X₂ X₃: */
/*   A.val = f(X₁.val, X₂.val, X₃.val) */
/*   Pop 3 items, push A with computed value */
```

### Example: Yacc/Bison Stack

```c
/* Grammar: E → E + T | T
            T → T * F | F
            F → ( E ) | num */

E : E '+' T  { $$ = $1 + $3; }   /* reduce: pop 3, push sum */
  | T        { $$ = $1; }
  ;

T : T '*' F  { $$ = $1 * $3; }
  | F        { $$ = $1; }
  ;

F : '(' E ')' { $$ = $2; }
  | NUM       { $$ = $1; }
  ;
```

The parser stack during `3 + 4 * 2`:

```
Stack                    Input         Action
─────────────────────────────────────────────────
                         3+4*2$        shift
3                        +4*2$         reduce F→num (F.val=3)
F                        +4*2$         reduce T→F (T.val=3)
T                        +4*2$         reduce E→T (E.val=3)
E                        +4*2$         shift
E+                       4*2$          shift
E+4                      *2$           reduce F→num (F.val=4)
E+F                      *2$           reduce T→F (T.val=4)
E+T                      *2$           shift
E+T*                     2$            shift
E+T*2                    $             reduce F→num (F.val=2)
E+T*F                    $             reduce T→T*F (T.val=8)
E+T                      $             reduce E→E+T (E.val=11)
E                        $             accept (result=11)
```

---

## Evaluation During Top-Down Parsing

For L-attributed SDDs, evaluate inherited attributes **before** parsing the corresponding child, and synthesized attributes **after**.

```python
def parse_decl():
    """decl → type varlist"""
    t = parse_type()           # Returns type.val
    parse_varlist(dtype=t)     # Pass inherited attribute


def parse_varlist(dtype):
    """varlist → id (, id)*"""
    name = expect(IDENTIFIER)
    add_type(name, dtype)      # Use inherited attribute

    while match(COMMA):
        name = expect(IDENTIFIER)
        add_type(name, dtype)  # Same inherited attribute
```

---

## Translation Schemes

A **translation scheme** is an SDD where semantic actions are embedded at specific positions within productions (not just at the end).

### Notation

Actions are written in `{ }` at positions within the RHS:

```
A → X { action₁ } Y { action₂ } Z { action₃ }
```

- `action₁` executes after $X$ is parsed.
- `action₂` executes after $Y$ is parsed.
- `action₃` executes after $Z$ is parsed (same as end-of-production).

### Example: Infix to Postfix

```
expr → expr₁ + term     { print('+') }
expr → expr₁ - term     { print('-') }
expr → term
term → 0                 { print('0') }
term → 1                 { print('1') }
...
term → 9                 { print('9') }
```

For input `9 - 5 + 2`:
- Parse `9` → print `9`
- Parse `5` → print `5`
- Reduce `expr - term` → print `-`
- Parse `2` → print `2`
- Reduce `expr + term` → print `+`

Output: `9 5 - 2 +` (postfix)

---

## Handling Inherited Attributes in LR Parsing

LR parsers naturally handle synthesized attributes. Inherited attributes require tricks:

### Marker Non-Terminals

Insert a **marker** (empty production) where you need to execute an action:

```c
/* Instead of: A → { action } B C */
/* Use: A → M B C
   M → ε  { action }  */
```

In Bison:

```c
decl: type { /* This mid-rule action becomes a marker */ } varlist ;
```

Bison internally creates:

```c
decl: type @1 varlist ;
@1: /* empty */ { /* your action here */ } ;
```

### Copying Attributes

Sometimes you need to copy a value through the stack:

```c
decl: type varlist ;

/* varlist needs type.val, but it's not adjacent on stack */
/* Solution: use $0 (dangerous) or restructure grammar */

varlist: id  { add_type($1, $0); }  /* $0 = value of 'type' on stack */
```

**Warning**: `$0` accesses below the current production's stack frame. It works but is fragile and non-portable.

---

## Practical Example: Type Checking

An SDD for type-checking arithmetic expressions:

```
Production                  Semantic Rules
────────────────────────────────────────────────
E → E₁ + E₂               E.type = if (E₁.type == E₂.type)
                                       then E₁.type
                                       else if (E₁.type == float ∨ E₂.type == float)
                                            then float
                                            else error

E → E₁ * E₂               E.type = (same as above)

E → ( E₁ )                E.type = E₁.type

E → id                    E.type = lookup(id.entry).type

E → intlit                E.type = integer

E → floatlit              E.type = float
```

This defines **type widening**: `int + float → float`.

$$
\text{int} + \text{int} \rightarrow \text{int}
$$
$$
\text{int} + \text{float} \rightarrow \text{float}
$$
$$
\text{float} + \text{float} \rightarrow \text{float}
$$

---

## SDD for Simple Code Generation

Generate stack-machine code during parsing:

```
Production              Semantic Rule
─────────────────────────────────────────
E → E₁ + T            E.code = E₁.code || T.code || "ADD"
E → T                 E.code = T.code
T → T₁ * F            T.code = T₁.code || F.code || "MUL"
T → F                 T.code = F.code
F → id                F.code = "PUSH " || id.name
F → num               F.code = "PUSH " || num.val
```

For `a + b * c`:

```
T.code = "PUSH b" || "PUSH c" || "MUL"
E.code = "PUSH a" || "PUSH b" || "PUSH c" || "MUL" || "ADD"
```

Generated code:
```
PUSH a
PUSH b
PUSH c
MUL
ADD
```

---

## Circular Dependencies

An SDD is **circular** if the dependency graph has a cycle:

```
A.x depends on B.y
B.y depends on C.z
C.z depends on A.x   ← cycle!
```

Circular SDDs **cannot be evaluated**. Detecting circularity in general is undecidable, but for a specific parse tree it is $O(n)$ (DFS for back edges).

**Rule of thumb**: Keep information flowing in one direction (bottom-up or top-down), never both for the same attribute chain.

---

## Exercises

### Exercise 1: Annotated Parse Tree

Given the grammar:

```
S → E $
E → E + T | T
T → T * F | F
F → ( E ) | digit
```

Draw the annotated parse tree for `(3 + 2) * 4` with synthesized attribute `val`.

<details>
<summary>Solution</summary>

```
           S
           |
        E.val = 20
           |
        T.val = 20
       /   |   \
  T.val=5  *  F.val=4
     |            |
  F.val=5       digit(4)
  /   |   \
 ( E.val=5 )
   / | \
E.val=3 + T.val=2
  |          |
T.val=3   F.val=2
  |          |
F.val=3   digit(2)
  |
digit(3)
```

Computation: $(3 + 2) \times 4 = 5 \times 4 = 20$ ✓

</details>

### Exercise 2: Inherited Attribute

Write an SDD that uses an inherited attribute to convert binary numbers to decimal.

Grammar: `B → B₁ D | D`, where `D → 0 | 1`

Hint: Each digit's position determines its weight: $d \times 2^{\text{pos}}$

<details>
<summary>Solution</summary>

First, compute the length (synthesized), then pass position (inherited):

```
Production          Semantic Rules
─────────────────────────────────────────
B → B₁ D           B.val = B₁.val + D.val × 2^D.pos
                    B₁.pos = B.pos    (inherited — not needed if restructured)

/* Better approach: right-recursive with position */
N → D N₁           D.pos = N.len - 1
                    N₁.pos = N.pos  (adjust)
                    N.val = D.val × 2^D.pos + N₁.val
N → D              D.pos = 0
                    N.val = D.val
D → 0              D.val = 0
D → 1              D.val = 1
```

For `101`: $1 \times 2^2 + 0 \times 2^1 + 1 \times 2^0 = 4 + 0 + 1 = 5$

</details>

### Exercise 3: Dependency Graph

Draw the dependency graph for this SDD and determine evaluation order:

```
A → B C       A.s = B.s + C.s
              C.i = B.s
B → b         B.s = b.val
C → c         C.s = C.i * c.val
```

<details>
<summary>Solution</summary>

Dependencies:
- `b.val` → `B.s` (synthesized)
- `B.s` → `C.i` (inherited: parent to child, using sibling)
- `c.val` → `C.s` (synthesized, plus C.i)
- `C.i` → `C.s` (inherited used in synthesized computation)
- `B.s` → `A.s` (synthesized)
- `C.s` → `A.s` (synthesized)

Evaluation order (topological sort):
1. `b.val` (given by lexer)
2. `c.val` (given by lexer)
3. `B.s = b.val`
4. `C.i = B.s`
5. `C.s = C.i * c.val`
6. `A.s = B.s + C.s`

This is an L-attributed definition (C.i depends only on left sibling B.s).

</details>

### Exercise 4: Translation Scheme

Write a translation scheme that converts infix expressions to **prefix** notation.

<details>
<summary>Solution</summary>

```
E → { print('+') } E₁ + T     /* Won't work in LR! Need restructuring */
```

Better approach — use synthesized string attributes:

```
E → E₁ + T       E.pre = "+ " || E₁.pre || T.pre
E → T            E.pre = T.pre
T → T₁ * F       T.pre = "* " || T₁.pre || F.pre
T → F            T.pre = F.pre
F → num          F.pre = str(num.val)
F → id           F.pre = id.name
```

For `3 + 4 * 2`:
- `F.pre = "3"`, `T.pre = "3"`, `E₁.pre = "3"`
- `F.pre = "4"`, `T₁.pre = "4"`
- `F.pre = "2"`
- `T.pre = "* 4 2"`
- `E.pre = "+ 3 * 4 2"`

Output: `+ 3 * 4 2` ✓

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Attribute | Value attached to a grammar symbol |
| Synthesized | Computed from children (bottom-up) |
| Inherited | Computed from parent/siblings (top-down) |
| S-attributed | Only synthesized; evaluated during LR parsing |
| L-attributed | Inherited from left only; evaluated during LL parsing |
| Dependency graph | Shows evaluation order; must be acyclic |
| Translation scheme | Actions embedded within productions |
| Annotated parse tree | Shows all computed attribute values |

Syntax-directed definitions bridge **syntax** and **semantics** — they define how meaning is computed as structure is recognized.
