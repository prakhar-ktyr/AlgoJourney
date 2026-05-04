---
title: Compiler Structure and Phases
---

# Compiler Structure and Phases

A compiler is organized into **six phases**, each performing a distinct transformation on the program. Understanding these phases is the key to understanding everything else in compiler design.

---

## Overview: The Six Phases

$$
\text{Source} \xrightarrow{1} \text{Tokens} \xrightarrow{2} \text{AST} \xrightarrow{3} \text{Annotated AST} \xrightarrow{4} \text{IR} \xrightarrow{5} \text{Optimized IR} \xrightarrow{6} \text{Target Code}
$$

| Phase | Name | Input | Output |
|-------|------|-------|--------|
| 1 | Lexical Analysis | Character stream | Token stream |
| 2 | Syntax Analysis | Token stream | Parse tree / AST |
| 3 | Semantic Analysis | AST | Annotated AST |
| 4 | Intermediate Code Gen | Annotated AST | IR (three-address code) |
| 5 | Code Optimization | IR | Optimized IR |
| 6 | Code Generation | Optimized IR | Target code |

Two supporting modules work across all phases:
- **Symbol Table**: central repository of identifier information
- **Error Handler**: reports and recovers from errors at each phase

---

## Phase 1: Lexical Analysis (Scanner)

### What It Does

The **lexical analyzer** (or **scanner** / **lexer**) reads the raw source code as a stream of characters and groups them into meaningful sequences called **tokens**.

### Input → Output

$$
\text{Character stream} \xrightarrow{\text{Lexer}} \text{Token stream}
$$

### Mechanism

- Uses **regular expressions** to specify token patterns
- Implemented as a **finite automaton** (DFA)
- Strips whitespace and comments
- Tracks line/column numbers for error reporting

### Example

Given the source code:

```c
int x = 42;
```

The lexer produces:

```
Token(INT,     "int",  line=1, col=1)
Token(ID,      "x",    line=1, col=5)
Token(ASSIGN,  "=",    line=1, col=7)
Token(NUM,     "42",   line=1, col=9)
Token(SEMI,    ";",    line=1, col=11)
```

### Token Structure

Each token has:
- **Type** (category): keyword, identifier, number, operator, etc.
- **Lexeme** (text): the actual characters matched
- **Position**: line and column for error messages
- **Value** (optional): computed value for literals

### What the Lexer Handles

| Pattern | Token Type | Examples |
|---------|-----------|----------|
| `[a-zA-Z_][a-zA-Z0-9_]*` | IDENTIFIER | `count`, `myFunc`, `_temp` |
| `[0-9]+` | INTEGER | `42`, `0`, `999` |
| `[0-9]+\.[0-9]+` | FLOAT | `3.14`, `0.5` |
| `"[^"]*"` | STRING | `"hello"`, `""` |
| `if\|while\|return\|...` | KEYWORD | `if`, `while`, `return` |
| `+\|-\|*\|/\|==\|!=\|...` | OPERATOR | `+`, `==`, `<=` |

### Errors Detected

- Unrecognized characters: `@` in C code
- Unterminated strings: `"hello` (no closing quote)
- Malformed numbers: `3.14.15`
- Invalid escape sequences: `"\z"` (if `\z` isn't defined)

---

## Phase 2: Syntax Analysis (Parser)

### What It Does

The **parser** reads the token stream and organizes it into a hierarchical structure (a **parse tree** or **abstract syntax tree**) according to the grammar rules of the language.

### Input → Output

$$
\text{Token stream} \xrightarrow{\text{Parser}} \text{Parse Tree / AST}
$$

### Mechanism

- Uses **context-free grammars** (CFG) to define valid syntax
- Implemented using algorithms like **LL(1)**, **LR(1)**, **LALR(1)**
- Can be hand-written (recursive descent) or generated (Yacc/Bison)
- Enforces the structural rules of the language

### Grammar Example

A simple expression grammar in BNF:

```
<expr>   ::= <expr> "+" <term> | <term>
<term>   ::= <term> "*" <factor> | <factor>
<factor> ::= "(" <expr> ")" | NUMBER | IDENTIFIER
```

This grammar encodes **operator precedence**: multiplication binds tighter than addition.

### Example

For the expression `x = a + b * c`, the parser builds:

```
    AssignStmt
    ├── LHS: VarRef("x")
    └── RHS: BinaryExpr(+)
             ├── VarRef("a")
             └── BinaryExpr(*)
                  ├── VarRef("b")
                  └── VarRef("c")
```

Notice how the tree structure captures that `b * c` is computed first (it's deeper in the tree), then added to `a`. This is operator precedence encoded structurally.

### Parse Tree vs Abstract Syntax Tree (AST)

**Parse tree** (concrete syntax tree): includes every grammar symbol, including parentheses and intermediate non-terminals.

**AST** (abstract syntax tree): simplified — keeps only the semantically meaningful structure.

```c
// For: (a + b)
// Parse tree includes the parentheses nodes
// AST just has: BinaryExpr(+, a, b)
```

Most compilers build an **AST** directly during parsing.

### Errors Detected

- Missing semicolons: `int x = 5` (no `;`)
- Unmatched brackets: `if (x > 0 { }`
- Unexpected tokens: `int int x;`
- Missing operands: `x = + ;`

```c
// Parser error example:
int x = ;   // Error: expected expression after '='
         ^
```

---

## Phase 3: Semantic Analysis

### What It Does

**Semantic analysis** checks that the program is meaningful — not just grammatically correct. It annotates the AST with type information and verifies language rules that can't be expressed by context-free grammars.

### Input → Output

$$
\text{AST} \xrightarrow{\text{Semantic Analyzer}} \text{Annotated AST + Symbol Table}
$$

### Mechanism

- Builds and queries the **symbol table**
- Performs **type checking** and **type inference**
- Resolves **scopes** (which `x` does this reference mean?)
- Checks **declaration before use**
- Verifies **function call arguments** (count, types)

### Example

```c
int a = 5;
float b = 3.14;
float c = a + b;    // Semantic analysis: implicit int → float coercion
```

Semantic analysis determines:
1. `a` is declared as `int`, value is `5` ✓
2. `b` is declared as `float`, value is `3.14` ✓
3. `a + b`: operands are `int` and `float`
4. Implicit coercion: promote `a` to `float` before addition
5. Result type is `float`, matches declaration of `c` ✓

### The Symbol Table

The symbol table stores information about every identifier:

```
┌────────────┬──────────┬───────┬───────────┬─────────────┐
│ Name       │ Type     │ Scope │ Memory    │ Attributes  │
├────────────┼──────────┼───────┼───────────┼─────────────┤
│ a          │ int      │ main  │ offset 0  │ initialized │
│ b          │ float    │ main  │ offset 4  │ initialized │
│ c          │ float    │ main  │ offset 8  │ initialized │
│ square     │ int→int  │ global│ label     │ function    │
└────────────┴──────────┴───────┴───────────┴─────────────┘
```

### Errors Detected

- Undeclared variables: using `x` without declaring it
- Type mismatches: `int x = "hello";`
- Wrong number of function arguments: `sqrt(1, 2)` when `sqrt` takes one arg
- Duplicate declarations in same scope: `int x; int x;`
- Return type mismatch: `int f() { return "hello"; }`
- Break/continue outside loops
- Array index type: `a["hello"]` when integer expected

```c
// Semantic error examples:
int x = "hello";        // Error: cannot assign string to int
undeclared_var = 5;     // Error: 'undeclared_var' not declared
int f(int a) { return; }  // Error: non-void function returns nothing
```

---

## Phase 4: Intermediate Code Generation

### What It Does

Translates the annotated AST into a **platform-independent intermediate representation** (IR). This decouples the front-end (language-specific) from the back-end (machine-specific).

### Input → Output

$$
\text{Annotated AST} \xrightarrow{\text{IR Generator}} \text{Intermediate Code}
$$

### Common IR Forms

**Three-Address Code** — each instruction has at most three operands:

```
x = y op z    // Binary operation
x = op y      // Unary operation
x = y         // Copy
```

**Static Single Assignment (SSA)** — each variable assigned exactly once:

```
x1 = a + b
x2 = x1 * c
```

### Example

Source code:
```c
result = a + b * 5;
```

Three-address code:
```
t1 = b * 5
t2 = a + t1
result = t2
```

More complex example:
```c
if (x > 0) {
    y = x * 2;
} else {
    y = -x;
}
```

Three-address code:
```
    if x > 0 goto L1
    goto L2
L1: t1 = x * 2
    y = t1
    goto L3
L2: t2 = -x
    y = t2
L3: ...
```

### Why Use IR?

The key benefit is the **$m + n$ argument**:

- Without IR: $m$ languages × $n$ targets = $m \cdot n$ compilers
- With IR: $m$ front-ends + $n$ back-ends = $m + n$ components

For $m = 5$ languages and $n = 4$ targets:
- Without IR: $5 \times 4 = 20$ compilers needed
- With IR: $5 + 4 = 9$ components needed

$$
\text{Savings} = m \cdot n - (m + n) = 20 - 9 = 11 \text{ fewer components}
$$

### Properties of Good IR

- **Language-independent**: doesn't favor any source language
- **Machine-independent**: doesn't assume specific hardware
- **Easy to generate** from the AST
- **Easy to translate** to target code
- **Easy to optimize**: simple structure for analysis

---

## Phase 5: Code Optimization

### What It Does

Transforms the IR to produce **more efficient code** — faster execution, less memory usage, or smaller code size — without changing the program's observable behavior.

### Input → Output

$$
\text{IR} \xrightarrow{\text{Optimizer}} \text{Optimized IR}
$$

### Key Optimizations

#### Constant Folding

Evaluate constant expressions at compile time:

```c
// Before:
t1 = 3 * 4
x = t1 + y

// After (3*4 computed at compile time):
x = 12 + y
```

#### Dead Code Elimination

Remove code that can never execute or whose results are never used:

```c
// Before:
x = a + b       // x is never used later
y = c * d
return y

// After (dead assignment to x removed):
y = c * d
return y
```

#### Common Subexpression Elimination (CSE)

Avoid recomputing the same expression:

```c
// Before:
t1 = a + b
t2 = a + b     // same expression computed again
x = t1 * t2

// After:
t1 = a + b
x = t1 * t1    // reuse t1 instead of recomputing
```

#### Loop Invariant Code Motion

Move computations out of loops if they produce the same result every iteration:

```c
// Before:
for (i = 0; i < n; i++) {
    x = y * z;       // y and z don't change in loop
    a[i] = x + i;
}

// After (x = y*z moved outside):
x = y * z;
for (i = 0; i < n; i++) {
    a[i] = x + i;
}
```

#### Strength Reduction

Replace expensive operations with cheaper ones:

```c
// Before (inside loop):
t1 = i * 4      // multiplication every iteration

// After:
t1 = t1 + 4     // addition instead (initialized before loop)
```

### Optimization Levels

Most compilers offer optimization levels:

| Level | GCC/Clang Flag | Effect |
|-------|--------|--------|
| None | `-O0` | No optimization (fast compile, easy debug) |
| Basic | `-O1` | Simple optimizations |
| Standard | `-O2` | Most optimizations (good default) |
| Aggressive | `-O3` | All optimizations (may increase code size) |
| Size | `-Os` | Optimize for small binary |

### Safety Rule

An optimization is **safe** (legal) only if it preserves the program's **observable behavior**:

$$
\text{Observable}(P_{\text{original}}) = \text{Observable}(P_{\text{optimized}})
$$

Observable behavior includes: output, return values, side effects (I/O, memory writes visible to other threads).

---

## Phase 6: Code Generation

### What It Does

Translates optimized IR into the **target language** — typically assembly code or machine code for a specific processor architecture.

### Input → Output

$$
\text{Optimized IR} \xrightarrow{\text{Code Generator}} \text{Target Code (Assembly/Machine)}
$$

### Key Tasks

#### 1. Instruction Selection

Choose which target instructions implement each IR operation:

```c
// IR:
t1 = a + b

// x86 instruction selection:
mov eax, [a]      ; load a into register
add eax, [b]      ; add b to register
mov [t1], eax     ; store result
```

#### 2. Register Allocation

Map the (potentially unlimited) IR variables to a **finite set of hardware registers**:

- x86-64 has 16 general-purpose registers
- ARM has 31 general-purpose registers
- IR may use hundreds of temporary variables
- When registers run out → **spill** to memory (stack)

Register allocation is one of the hardest problems in compilation — it's equivalent to **graph coloring**, which is NP-complete in general.

$$
\text{Register allocation} \equiv k\text{-coloring of interference graph}
$$

#### 3. Instruction Scheduling

Reorder instructions to avoid pipeline stalls and maximize instruction-level parallelism:

```c
// Before (pipeline stall — second instruction waits for first):
mul r1, r2, r3    // takes 3 cycles
add r4, r1, r5    // needs r1 — must wait!

// After (schedule independent instruction between):
mul r1, r2, r3    // takes 3 cycles
mov r6, r7        // independent — executes during mul
add r4, r1, r5    // r1 now ready, no stall
```

### Example: Complete Code Generation

IR:
```
t1 = a + b
t2 = t1 * c
return t2
```

x86-64 assembly output:
```c
; Function: compute(int a, int b, int c)
; System V ABI: a in edi, b in esi, c in edx
compute:
    mov eax, edi        ; eax = a
    add eax, esi        ; eax = a + b (t1)
    imul eax, edx       ; eax = t1 * c (t2)
    ret                 ; return t2 (in eax)
```

---

## Supporting Modules

### The Symbol Table

The symbol table is a **data structure shared across all phases**. It maps identifiers to their attributes:

```
┌──────────────────────────────────────────┐
│              Symbol Table                  │
├────────┬──────┬───────┬──────┬───────────┤
│ Name   │ Type │ Scope │ Size │ Address   │
├────────┼──────┼───────┼──────┼───────────┤
│ main   │ func │ global│ -    │ 0x1000    │
│ x      │ int  │ main  │ 4B   │ rbp-4     │
│ arr    │ int[]│ main  │ 40B  │ rbp-44    │
│ helper │ func │ global│ -    │ 0x1050    │
└────────┴──────┴───────┴──────┴───────────┘
```

**Operations:**
- `insert(name, attributes)` — when declaration is processed
- `lookup(name)` — when identifier is used
- `enterScope()` / `exitScope()` — manage nested scopes

**Implementation:** typically a hash table (or stack of hash tables for nested scopes).

### The Error Handler

Errors can occur at any phase. The error handler:

1. **Records** errors with location information
2. **Reports** them in a user-friendly format
3. **Recovers** to continue finding more errors (where possible)

```c
// Error reporting format:
// filename:line:column: severity: message
main.c:7:15: error: incompatible types in assignment
    float x = "hello";
              ^~~~~~~
```

---

## Front-End vs Back-End Separation

### Front-End (Phases 1–3)

Language-dependent. Each source language needs its own front-end:
- C front-end (Clang)
- Rust front-end (rustc)
- Swift front-end

### Middle-End (Phases 4–5)

Language-independent, machine-independent. Works purely on IR:
- Optimization passes
- Analysis frameworks
- Shared across all languages

### Back-End (Phase 6)

Machine-dependent. Each target architecture needs its own back-end:
- x86-64 back-end
- ARM64 back-end
- RISC-V back-end

```
C ──────┐                        ┌──→ x86
        │                        │
Rust ───┼──→ [   LLVM IR   ] ───┼──→ ARM
        │    [optimization  ]    │
Swift ──┘    [    passes    ]    └──→ RISC-V
```

---

## Complete Example: Tracing Through All Phases

Let's trace `result = a + b * 5;` through every phase:

### Source Code
```c
result = a + b * 5;
```

### Phase 1: Lexical Analysis
```
[ID("result"), ASSIGN, ID("a"), PLUS, ID("b"), STAR, NUM(5), SEMI]
```

### Phase 2: Syntax Analysis (AST)
```
AssignStmt
├── target: VarRef("result")
└── value: BinaryExpr(+)
           ├── left: VarRef("a")
           └── right: BinaryExpr(*)
                      ├── left: VarRef("b")
                      └── right: IntLit(5)
```

### Phase 3: Semantic Analysis
- Look up `a`, `b`, `result` in symbol table → all `int` ✓
- `b * 5`: `int * int` → `int` ✓
- `a + (b*5)`: `int + int` → `int` ✓
- Assignment: `int = int` ✓

Annotated AST has type `int` on every node.

### Phase 4: IR Generation (Three-Address Code)
```
t1 = b * 5
t2 = a + t1
result = t2
```

### Phase 5: Optimization
```
// If b=3 is known constant (constant propagation):
t1 = 15          // constant folding: 3 * 5 = 15
t2 = a + 15
result = t2

// Otherwise, no optimization for this simple case
```

### Phase 6: Code Generation (x86-64)
```c
mov eax, [b]         ; load b
imul eax, eax, 5     ; eax = b * 5
add eax, [a]         ; eax = a + b*5
mov [result], eax    ; store to result
```

---

## Compiler Construction Tools

| Tool | Phase | Description |
|------|-------|-------------|
| Lex / Flex | 1 (Lexing) | Generate scanner from regex specs |
| Yacc / Bison | 2 (Parsing) | Generate LALR(1) parser from grammar |
| ANTLR | 1 + 2 | Generate LL(*) lexer + parser |
| LLVM | 4 + 5 + 6 | IR, optimization passes, code generation |
| GCC RTL | 5 + 6 | GCC's register transfer language + backends |

### Example: Using Flex + Bison

```c
// tokens.l (Flex lexer specification)
%%
[0-9]+    { yylval = atoi(yytext); return NUMBER; }
"+"       { return PLUS; }
"*"       { return TIMES; }
[ \t\n]   { /* skip whitespace */ }
%%

// parser.y (Bison grammar specification)
%%
expr : expr PLUS term   { $$ = $1 + $3; }
     | term
     ;
term : term TIMES NUMBER { $$ = $1 * $3; }
     | NUMBER
     ;
%%
```

From these specifications, Flex generates C code for a DFA-based lexer, and Bison generates C code for an LALR(1) parser — hundreds of lines of code you don't have to write by hand.

---

## Summary

| Phase | Name | Uses | Produces |
|-------|------|------|----------|
| 1 | Lexical Analysis | Regular expressions, DFA | Tokens |
| 2 | Syntax Analysis | CFG, LL/LR parsing | AST |
| 3 | Semantic Analysis | Type rules, symbol table | Annotated AST |
| 4 | IR Generation | Translation rules | Three-address code |
| 5 | Optimization | Data-flow analysis | Optimized IR |
| 6 | Code Generation | Instruction selection, register allocation | Target code |

---

## Key Takeaways

1. Each phase has a **clean interface** — well-defined input and output
2. Phases can be **developed independently** and composed
3. The **symbol table** is the shared data structure that ties phases together
4. **Front-end/back-end separation** via IR enables language × target reuse
5. Real compilers may **merge phases** for efficiency (e.g., parse + build AST simultaneously) but the conceptual separation remains

---

## Next Up

Now we'll dive deep into the first phase: **Lexical Analysis**. You'll learn how regular expressions and finite automata work together to transform raw text into structured tokens.
