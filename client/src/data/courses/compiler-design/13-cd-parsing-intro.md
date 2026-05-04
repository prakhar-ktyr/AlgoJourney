---
title: Introduction to Syntax Analysis
---

# Introduction to Syntax Analysis

In this lesson, you will learn about **syntax analysis** (parsing) — the second major phase of compilation. The parser takes the flat stream of tokens produced by the lexer and organizes them into a hierarchical structure that reflects the grammatical structure of the program.

---

## What Is Parsing?

**Parsing** (syntax analysis) is the process of determining whether a sequence of tokens conforms to a grammar and, if so, building a structured representation of the program.

### Compilation Pipeline Recap

```
Source Code → [Lexer] → Token Stream → [Parser] → Parse Tree/AST
```

| Phase | Input | Output |
|-------|-------|--------|
| Lexical Analysis | Character stream | Token stream |
| **Syntax Analysis** | **Token stream** | **Parse tree / AST** |
| Semantic Analysis | AST | Annotated AST |
| Code Generation | Annotated AST | Machine code |

---

## Input and Output of the Parser

### Input: Token Stream

The parser receives tokens one at a time from the lexer:

```
INT  ID(x)  ASSIGN  NUM(3)  PLUS  NUM(5)  TIMES  NUM(2)  SEMI
```

### Output: Parse Tree or AST

For the expression `3 + 5 * 2`, the parser produces a tree that captures the structure:

```
        +
       / \
      3    *
          / \
         5   2
```

This tree shows that multiplication binds tighter than addition — a structural property that the flat token stream doesn't reveal.

---

## Context-Free Grammars (CFG)

A **context-free grammar** is the formal tool used to describe programming language syntax.

### Definition

A CFG is a 4-tuple $G = (V, \Sigma, P, S)$ where:

- $V$ = set of **non-terminal** symbols (syntactic variables)
- $\Sigma$ = set of **terminal** symbols (tokens from the lexer)
- $P$ = set of **productions** (rewriting rules)
- $S \in V$ = the **start symbol**

### Example: Simple Expressions

$$
\begin{aligned}
E &\to E + T \mid T \\
T &\to T * F \mid F \\
F &\to (E) \mid \text{id} \mid \text{num}
\end{aligned}
$$

Here:
- **Non-terminals**: $E$, $T$, $F$ (Expression, Term, Factor)
- **Terminals**: $+$, $*$, $(\ )$, $\text{id}$, $\text{num}$
- **Start symbol**: $E$
- **Productions**: the six rules above

### Reading a Production

The production $E \to E + T$ means:

> "An Expression can be rewritten as an Expression, followed by a plus sign, followed by a Term."

The symbol $\mid$ means "or" (alternative productions for the same non-terminal).

---

## Derivations

A **derivation** is a sequence of production applications that transforms the start symbol into a string of terminals.

### Example

Derive the token string `id + id * id`:

$$
\begin{aligned}
E &\Rightarrow E + T \\
  &\Rightarrow T + T \\
  &\Rightarrow F + T \\
  &\Rightarrow \text{id} + T \\
  &\Rightarrow \text{id} + T * F \\
  &\Rightarrow \text{id} + F * F \\
  &\Rightarrow \text{id} + \text{id} * F \\
  &\Rightarrow \text{id} + \text{id} * \text{id}
\end{aligned}
$$

### Leftmost vs Rightmost Derivation

- **Leftmost derivation**: always expand the leftmost non-terminal first
- **Rightmost derivation**: always expand the rightmost non-terminal first

The derivation above is a **leftmost** derivation. Both types produce the same parse tree for unambiguous grammars.

---

## Parse Trees

A **parse tree** is a graphical representation of a derivation:

- Root: start symbol
- Internal nodes: non-terminals
- Leaves: terminals (tokens)
- Children of a node: right-hand side of the production used

For `id + id * id` with the grammar above:

```
            E
          / | \
         E  +  T
         |    /|\
         T  T  *  F
         |  |     |
         F  F    id
         |  |
        id  id
```

The tree structure encodes **precedence** and **associativity**:
- `*` is deeper in the tree (higher precedence)
- `+` is at a higher level (lower precedence)

---

## The Parser's Job

Given a token stream, the parser must:

1. **Determine if the input is syntactically valid** (belongs to the language defined by the grammar)
2. **Build a parse tree** (or report a syntax error with useful diagnostics)
3. Often: **build an AST** (simplified parse tree)

If the input is not valid, the parser should:
- Report **where** the error is
- Report **what** was expected vs. what was found
- **Recover** and continue to find more errors

---

## Two Main Parsing Approaches

### Top-Down Parsing

Start from the **start symbol** and try to derive the input:

$$S \Rightarrow \cdots \Rightarrow \text{input string}$$

- Build the parse tree from **root to leaves**
- At each step, choose which production to use based on the current input token
- Examples: **Recursive descent**, **LL(1)**

```
Start:  E
        ↓ (choose E → E + T)
       E + T
      ↓       ↓
    ...       ...
    ↓           ↓
   id + id * id     ← matches input!
```

### Bottom-Up Parsing

Start from the **input tokens** and try to reduce back to the start symbol:

$$\text{input string} \Rightarrow \cdots \Rightarrow S$$

- Build the parse tree from **leaves to root**
- At each step, find a substring matching a production's RHS and reduce it
- Examples: **LR(0)**, **SLR**, **LALR**, **CLR**

```
Start:  id + id * id
        ↓ (reduce id to F)
        F + id * id
        ↓ (reduce F to T)
        T + id * id
        ↓ (reduce T to E)
        E + id * id
        ... continue reducing ...
        ↓
        E              ← reached start symbol!
```

### Comparison

| Aspect | Top-Down | Bottom-Up |
|--------|----------|-----------|
| Direction | Root → Leaves | Leaves → Root |
| Derivation | Leftmost | Rightmost (in reverse) |
| Power | Handles LL grammars | Handles LR grammars (larger class) |
| Simplicity | Easier to write by hand | Usually generated by tools |
| Error messages | Typically better | Can be harder to produce |
| Examples | Recursive descent, LL(1) | LR(0), SLR, LALR(1) |

---

## Ambiguity

A grammar is **ambiguous** if there exists a string that has **two or more** different parse trees.

### The Classic Ambiguous Grammar

$$E \to E + E \mid E * E \mid (E) \mid \text{id}$$

For `id + id * id`, this grammar produces **two** parse trees:

**Tree 1** (+ before *):
```
      E
    / | \
   E  +  E
   |    / | \
  id   E  *  E
       |     |
      id    id
```

**Tree 2** (* before +):
```
      E
    / | \
   E  *  E
  /|\     |
 E + E   id
 |   |
id  id
```

### Why Ambiguity Is a Problem

The parser must produce **exactly one** parse tree. Two trees means two different interpretations:

- Tree 1: $(a + b) * c$ → add first, then multiply
- Tree 2: $a + (b * c)$ → multiply first, then add

### Resolving Ambiguity

We resolve ambiguity by rewriting the grammar to encode:

1. **Precedence**: higher-precedence operators are "deeper" in the grammar

$$
\begin{aligned}
E &\to E + T \mid T \\
T &\to T * F \mid F \\
F &\to (E) \mid \text{id}
\end{aligned}
$$

2. **Associativity**: left-recursive rules give left associativity

- $E \to E + T$ makes `+` left-associative: `a + b + c` = `(a + b) + c`
- $E \to T + E$ would make `+` right-associative: `a + b + c` = `a + (b + c)`

---

## Operator Precedence and Associativity

### Precedence Levels

For a typical language:

| Level | Operators | Associativity |
|-------|-----------|---------------|
| 1 (lowest) | `=` (assignment) | Right |
| 2 | `\|\|` | Left |
| 3 | `&&` | Left |
| 4 | `==`, `!=` | Left |
| 5 | `<`, `>`, `<=`, `>=` | Left |
| 6 | `+`, `-` | Left |
| 7 | `*`, `/`, `%` | Left |
| 8 | `!`, `-` (unary) | Right |
| 9 (highest) | `()`, `[]`, `.` | Left |

### Grammar Encoding

Each precedence level gets its own non-terminal:

$$
\begin{aligned}
\text{Assign} &\to \text{id}\ =\ \text{Assign} \mid \text{Or} \\
\text{Or} &\to \text{Or}\ ||\ \text{And} \mid \text{And} \\
\text{And} &\to \text{And}\ \&\&\ \text{Eq} \mid \text{Eq} \\
\text{Eq} &\to \text{Eq}\ \text{==}\ \text{Rel} \mid \text{Rel} \\
\text{Rel} &\to \text{Rel}\ <\ \text{Add} \mid \text{Add} \\
\text{Add} &\to \text{Add}\ +\ \text{Mul} \mid \text{Mul} \\
\text{Mul} &\to \text{Mul}\ *\ \text{Unary} \mid \text{Unary} \\
\text{Unary} &\to\ !\ \text{Unary} \mid \text{Primary} \\
\text{Primary} &\to (\ \text{Assign}\ ) \mid \text{id} \mid \text{num}
\end{aligned}
$$

---

## BNF and EBNF Notation

### BNF (Backus-Naur Form)

Standard notation for writing grammars:

```
<expression> ::= <expression> "+" <term> | <term>
<term>       ::= <term> "*" <factor> | <factor>
<factor>     ::= "(" <expression> ")" | <id> | <num>
```

### EBNF (Extended BNF)

Adds convenience operators:

| Symbol | Meaning | Example |
|--------|---------|---------|
| `{ }` | Zero or more repetitions | `{ "," param }` |
| `[ ]` | Optional (zero or one) | `[ "else" stmt ]` |
| `( )` | Grouping | `("+" \| "-") term` |
| `\|` | Alternative | `"if" \| "while"` |

EBNF version of the expression grammar:

```
expression = term { ("+" | "-") term }
term       = factor { ("*" | "/") factor }
factor     = "(" expression ")" | id | num
```

EBNF is more compact and maps directly to code (loops for `{ }`, if-statements for `[ ]`).

---

## Grammar Design for Common Constructs

### If-Then-Else

```
stmt      → "if" "(" expr ")" stmt else_part
else_part → "else" stmt | ε
```

The **dangling else** problem: which `if` does an `else` belong to?

```c
if (a) if (b) s1; else s2;
```

Convention: `else` matches the **nearest unmatched** `if`.

### While Loops

```
stmt → "while" "(" expr ")" stmt
```

### For Loops (C-style)

```
stmt → "for" "(" expr_opt ";" expr_opt ";" expr_opt ")" stmt
expr_opt → expr | ε
```

### Function Calls

```
call      → id "(" arg_list ")"
arg_list  → expr { "," expr } | ε
```

### Variable Declarations

```
decl → type id [ "=" expr ] ";"
type → "int" | "float" | "char" | "bool"
```

### Block Statements

```
block → "{" { stmt } "}"
```

---

## Parse Tree vs Abstract Syntax Tree (AST)

The **parse tree** mirrors the grammar exactly. The **AST** is a simplified tree that retains only the essential structure:

For `3 + 5 * 2`:

**Parse Tree** (verbose):
```
            E
          / | \
         E  +  T
         |    /|\
         T  T  *  F
         |  |     |
         F  F     2
         |  |
         3  5
```

**AST** (compact):
```
    BinOp(+)
    /      \
  Num(3)  BinOp(*)
          /      \
        Num(5)  Num(2)
```

The AST drops:
- Non-terminal nodes that don't add meaning
- Parentheses (structure already encoded in the tree)
- Punctuation like semicolons

### AST Node Types in C

```c
typedef enum {
    NODE_NUM,
    NODE_IDENT,
    NODE_BINOP,
    NODE_UNARYOP,
    NODE_ASSIGN,
    NODE_IF,
    NODE_WHILE,
    NODE_CALL,
    NODE_BLOCK,
} NodeType;

typedef struct ASTNode {
    NodeType type;
    int line;  // Source location for error messages
    int column;
    union {
        int intVal;               // NODE_NUM
        char *name;               // NODE_IDENT
        struct {                   // NODE_BINOP
            char op;
            struct ASTNode *left;
            struct ASTNode *right;
        } binop;
        struct {                   // NODE_IF
            struct ASTNode *condition;
            struct ASTNode *thenBranch;
            struct ASTNode *elseBranch;  // NULL if no else
        } ifStmt;
    };
} ASTNode;
```

---

## Preview: Parsing Techniques

| Technique | Type | Power | Typical Use |
|-----------|------|-------|-------------|
| Recursive Descent | Top-down | LL(k) | Hand-written parsers |
| LL(1) Table-Driven | Top-down | LL(1) | Generated parsers |
| LR(0) | Bottom-up | LR(0) | Theoretical |
| SLR(1) | Bottom-up | SLR(1) | Simple generated parsers |
| LALR(1) | Bottom-up | LALR(1) | yacc/bison |
| CLR(1) | Bottom-up | LR(1) | Most powerful, large tables |
| Pratt / Precedence Climbing | Hybrid | Expression grammars | Practical hand-written |

In the following lessons, we will study these techniques in detail, starting with recursive descent parsing.

---

## Try It Yourself

**Exercise 1**: Given the grammar:

$$
\begin{aligned}
S &\to a B c \\
B &\to b B \mid \varepsilon
\end{aligned}
$$

Draw the parse tree for the string `abbc`.

**Exercise 2**: Write a context-free grammar for:
- Variable declarations: `int x;`, `float y = 3.14;`
- Assignment statements: `x = 5;`, `y = x + 1;`
- Print statements: `print(x);`, `print(x + y);`

**Exercise 3**: Show that the following grammar is ambiguous by finding a string with two different parse trees:

$$E \to E - E \mid \text{num}$$

What are the two interpretations of `5 - 3 - 1`?

**Exercise 4**: Rewrite the grammar from Exercise 3 to make subtraction **left-associative** (i.e., `5 - 3 - 1` = `(5 - 3) - 1 = 1`).

**Exercise 5**: Design a grammar for a simple language with:
- Integer and boolean types
- Arithmetic: `+`, `-`, `*`, `/`
- Comparison: `<`, `>`, `==`
- Boolean: `&&`, `||`, `!`
- `if/else` statements
- `while` loops
- Variable declarations and assignments
- Blocks with `{ }`

Define precedence and associativity for all operators.

**Exercise 6**: For the expression `a = b + c * d`, show the parse tree using the full precedence grammar from this lesson. Verify that `*` binds tighter than `+`, and both bind tighter than `=`.

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Parsing | Convert flat token stream into hierarchical tree |
| CFG | Formal grammar: terminals, non-terminals, productions, start symbol |
| Derivation | Sequence of production applications |
| Parse tree | Tree representing a derivation |
| Ambiguity | Multiple parse trees for one string — must be eliminated |
| Precedence | Encoded by grammar levels (deeper = higher precedence) |
| Associativity | Left-recursive = left-associative |
| Top-down | Root to leaves (LL parsers) |
| Bottom-up | Leaves to root (LR parsers) |
| AST | Simplified tree with only essential structure |

---

## Next Lesson

In the next lesson, we will implement our first parser: a **recursive descent** parser. You will learn how to translate a grammar directly into code where each non-terminal becomes a function.
