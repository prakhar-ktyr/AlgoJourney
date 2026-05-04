---
title: Introduction to Semantic Analysis
---

# Introduction to Semantic Analysis

The **lexer** checks spelling (valid tokens). The **parser** checks grammar (valid structure). **Semantic analysis** checks **meaning** — are the constructs sensible? Does `x + y` make sense when `x` is an integer and `y` is a string?

---

## What Is Semantic Analysis?

Semantic analysis is the phase that verifies the **context-sensitive** aspects of a program that cannot be expressed by a context-free grammar.

```
Source → [Lexer] → Tokens → [Parser] → AST → [Semantic Analyzer] → Annotated AST
```

### What the Parser Cannot Check

| Invalid Code | Problem | Why Parser Can't Catch |
|-------------|---------|----------------------|
| `int x; x = "hello";` | Type mismatch | Requires type information |
| `y = 5;` (y undeclared) | Undeclared variable | Requires scope tracking |
| `break;` (outside loop) | Invalid control flow | Requires context |
| `f(1, 2, 3)` (f takes 2 args) | Argument count | Requires function signature |
| `int x; int x;` | Duplicate declaration | Requires name tracking |

These are all **context-sensitive** constraints — they depend on declarations and usage contexts, not just local syntax.

---

## The Three Pillars of Semantic Analysis

### 1. Name Resolution

**Question**: For each use of a name, which declaration does it refer to?

```c
int x = 10;          /* declaration 1 */

void f(int x) {     /* declaration 2 (shadows 1) */
    printf("%d", x); /* refers to declaration 2 */
}

void g() {
    printf("%d", x); /* refers to declaration 1 */
}
```

Name resolution involves:
- Building a **symbol table** that maps names to declarations.
- Handling **scopes** (block scope, function scope, global scope).
- Detecting **undeclared** names and **duplicate** declarations.
- Resolving **shadowing** (inner scope hides outer).

### 2. Type Checking

**Question**: Are the types of expressions and operations compatible?

```c
int a = 5;
float b = 3.14;
char *s = "hello";

float c = a + b;     /* OK: int + float → float (widening) */
int d = a + s;       /* ERROR: int + char* not defined */
int e = a / 0;       /* WARNING: division by zero */
```

Type checking involves:
- Computing the **type of each expression**.
- Verifying **operator compatibility**.
- Inserting **implicit conversions** (coercions).
- Checking function **argument types** against parameters.

### 3. Flow Checking

**Question**: Is the control flow valid?

```c
void f(int x) {
    if (x > 0) {
        return x;      /* OK: returns int */
    }
    /* WARNING: not all paths return a value */
}

void g() {
    break;             /* ERROR: break outside loop */
    goto label;        /* ERROR: label not defined */
}
```

Flow checking involves:
- Ensuring **all paths return** a value (for non-void functions).
- Ensuring `break`/`continue` are inside loops.
- Detecting **unreachable code**.
- Verifying `goto` targets exist.

---

## Static vs Dynamic Semantics

### Static Semantics

Checked at **compile time**. No need to run the program.

| Check | Example |
|-------|---------|
| Type compatibility | `int x = "hello";` → error |
| Declaration before use | using undeclared `y` |
| Correct number of arguments | `f(1)` when `f` takes 2 params |
| Return type matches | `int f() { return "hi"; }` |
| Access control | accessing `private` member |

### Dynamic Semantics

Checked at **runtime**. Cannot be fully determined statically.

| Check | Example |
|-------|---------|
| Array bounds | `a[i]` where `i >= length` |
| Null dereference | `ptr->field` where `ptr == NULL` |
| Division by zero | `a / b` where `b == 0` |
| Integer overflow | `INT_MAX + 1` |
| Stack overflow | Infinite recursion |

Some languages blur the line — Rust's borrow checker performs extensive static analysis that other languages leave to runtime.

### The Undecidability Boundary

Rice's theorem tells us: **any non-trivial semantic property** of programs is undecidable in general.

$$
\text{Static analysis} \subset \text{All semantic properties}
$$

Compilers use **conservative approximations** — they may reject valid programs but never accept invalid ones (for type safety).

---

## The Symbol Table

The symbol table is the central data structure for semantic analysis.

### Structure

```python
class Symbol:
    def __init__(self, name, kind, type_info, scope_level):
        self.name = name          # "x", "f", "MyClass"
        self.kind = kind          # VARIABLE, FUNCTION, TYPE, PARAMETER
        self.type_info = type_info  # int, float, function(int)->int
        self.scope_level = scope_level
        self.line_declared = 0
        self.is_initialized = False


class SymbolTable:
    def __init__(self):
        self.scopes = [{}]  # Stack of scope dictionaries
        self.level = 0

    def enter_scope(self):
        self.level += 1
        self.scopes.append({})

    def exit_scope(self):
        self.scopes.pop()
        self.level -= 1

    def declare(self, name, symbol):
        """Add a declaration to the current scope."""
        current = self.scopes[-1]
        if name in current:
            raise SemanticError(
                f"'{name}' already declared in this scope"
            )
        current[name] = symbol

    def lookup(self, name):
        """Find a name, searching from innermost to outermost scope."""
        for scope in reversed(self.scopes):
            if name in scope:
                return scope[name]
        return None  # Not found → undeclared
```

### Scope Example

```c
int x = 1;                  // scope 0: x=int

void f(int y) {             // scope 1: y=int
    int z = x + y;          // scope 1: z=int

    if (z > 0) {
        float x = 3.14;    // scope 2: x=float (shadows outer x)
        printf("%f", x);   // uses scope 2's x (float)
    }

    printf("%d", x);       // uses scope 0's x (int)
}
```

Symbol table at deepest point:

```
Scope 2: { x: float }
Scope 1: { y: int, z: int }
Scope 0: { x: int, f: function(int)->void }
```

---

## Type System Basics

### Type Expressions

Types form a **type language**:

$$
T ::= \text{int} \mid \text{float} \mid \text{bool} \mid \text{char} \mid \text{void}
$$
$$
\mid T[] \mid T \times T \rightarrow T \mid \text{struct}\{f_1: T_1, \ldots, f_n: T_n\}
$$

### Type Equivalence

**Structural equivalence**: Two types are equal if they have the same structure.

```c
typedef struct { int x; int y; } Point;
typedef struct { int x; int y; } Vec2D;
/* Structurally equivalent (same fields, same types) */
```

**Name equivalence**: Two types are equal only if they have the same name.

```c
/* Under name equivalence, Point ≠ Vec2D even though same structure */
```

C uses **name equivalence** for structs but structural equivalence for other types.

### Type Compatibility

Types aren't always equal but may be **compatible**:

```c
int x = 5;
float y = x;    /* OK: int is compatible with float (widening) */
int z = y;      /* WARNING: float to int (narrowing, possible data loss) */
```

Type widening hierarchy:

$$
\text{char} \rightarrow \text{int} \rightarrow \text{long} \rightarrow \text{float} \rightarrow \text{double}
$$

---

## Type Checking Expressions

### Implementation

```python
class TypeChecker(ASTVisitor):
    def __init__(self, symbol_table):
        self.symtab = symbol_table
        self.errors = []

    def visit_IntLiteral(self, node):
        node.type = "int"
        return "int"

    def visit_FloatLiteral(self, node):
        node.type = "float"
        return "float"

    def visit_BoolLiteral(self, node):
        node.type = "bool"
        return "bool"

    def visit_Identifier(self, node):
        sym = self.symtab.lookup(node.name)
        if sym is None:
            self.error(node, f"undeclared identifier '{node.name}'")
            node.type = "error"
            return "error"
        node.type = sym.type_info
        return sym.type_info

    def visit_BinaryExpr(self, node):
        left_type = self.visit(node.left)
        right_type = self.visit(node.right)

        if left_type == "error" or right_type == "error":
            node.type = "error"
            return "error"

        # Arithmetic operators
        if node.op in ('+', '-', '*', '/'):
            if left_type in ("int", "float") and right_type in ("int", "float"):
                # Widening: if either is float, result is float
                if left_type == "float" or right_type == "float":
                    node.type = "float"
                else:
                    node.type = "int"
                return node.type
            else:
                self.error(node,
                    f"cannot apply '{node.op}' to {left_type} and {right_type}")
                node.type = "error"
                return "error"

        # Comparison operators
        if node.op in ('<', '>', '<=', '>=', '==', '!='):
            if self.is_numeric(left_type) and self.is_numeric(right_type):
                node.type = "bool"
                return "bool"
            elif left_type == right_type:
                node.type = "bool"
                return "bool"
            else:
                self.error(node,
                    f"cannot compare {left_type} with {right_type}")
                node.type = "error"
                return "error"

        # Logical operators
        if node.op in ('&&', '||'):
            if left_type == "bool" and right_type == "bool":
                node.type = "bool"
                return "bool"
            else:
                self.error(node,
                    f"logical '{node.op}' requires bool operands")
                node.type = "error"
                return "error"

    def visit_CallExpr(self, node):
        func_type = self.visit(node.callee)
        if not isinstance(func_type, FunctionType):
            self.error(node, "calling non-function")
            node.type = "error"
            return "error"

        # Check argument count
        if len(node.args) != len(func_type.params):
            self.error(node,
                f"expected {len(func_type.params)} args, got {len(node.args)}")

        # Check each argument type
        for i, (arg, param_type) in enumerate(zip(node.args, func_type.params)):
            arg_type = self.visit(arg)
            if not self.is_compatible(arg_type, param_type):
                self.error(arg,
                    f"argument {i+1}: expected {param_type}, got {arg_type}")

        node.type = func_type.return_type
        return func_type.return_type

    def is_numeric(self, t):
        return t in ("int", "float", "double", "char")

    def is_compatible(self, from_type, to_type):
        if from_type == to_type:
            return True
        # Widening is allowed implicitly
        widening = {
            ("char", "int"), ("char", "float"),
            ("int", "float"), ("int", "double"),
            ("float", "double"),
        }
        return (from_type, to_type) in widening

    def error(self, node, msg):
        self.errors.append(f"line {node.line}: {msg}")
```

---

## Common Semantic Errors

### 1. Undeclared Identifier

```c
int main() {
    y = 10;  /* error: 'y' undeclared */
    return 0;
}
```

### 2. Type Mismatch

```c
int x = "hello";  /* error: cannot initialize int with char* */
```

### 3. Wrong Number of Arguments

```c
int add(int a, int b) { return a + b; }
int r = add(1, 2, 3);  /* error: too many arguments */
```

### 4. Return Type Mismatch

```c
int f() {
    return "hello";  /* error: returning char* from int function */
}
```

### 5. Duplicate Declaration

```c
void g() {
    int x = 5;
    int x = 10;  /* error: 'x' already declared in this scope */
}
```

### 6. Break Outside Loop

```c
void h() {
    break;  /* error: 'break' not inside loop or switch */
}
```

### 7. Using Function as Variable

```c
int f() { return 0; }
int x = f + 1;  /* error: 'f' is a function, not a value */
```

---

## The Annotated AST

After semantic analysis, the AST is **annotated** with:

1. **Type information** on every expression node.
2. **Symbol references** linking identifiers to their declarations.
3. **Implicit conversions** inserted as new nodes.

### Before Semantic Analysis

```
Assignment
├── Identifier("y")
└── BinaryExpr(+)
    ├── Identifier("x")     // x is int
    └── FloatLiteral(3.14)
```

### After Semantic Analysis

```
Assignment (type: float)
├── Identifier("y") → symbol: {name:"y", type:float, scope:1}
└── BinaryExpr(+) (type: float)
    ├── ImplicitCast(int→float)     ← INSERTED
    │   └── Identifier("x") → symbol: {name:"x", type:int, scope:1}
    └── FloatLiteral(3.14) (type: float)
```

The implicit cast node ensures code generation knows to emit an int-to-float conversion.

---

## Semantic Analysis in Real Compilers

### GCC/Clang (C/C++)

- Multiple passes over the AST.
- Template instantiation (C++) is a major semantic task.
- Clang's error messages include "did you mean...?" suggestions using edit distance.

### Rust

- Extremely thorough static analysis.
- **Borrow checker**: ensures memory safety without garbage collection.
- **Lifetime analysis**: tracks how long references are valid.
- Many dynamic errors in C become compile-time errors in Rust.

### Java

- Type checking with generics and type erasure.
- Method overload resolution.
- Checked exceptions must be declared or caught.
- Definite assignment analysis (variables must be assigned before use).

### TypeScript

- **Structural** type system (duck typing with types).
- Type narrowing through control flow analysis.
- Union and intersection types.
- Generic constraints.

---

## Semantic Analysis Phases

Semantic analysis is often split into sub-phases:

```
AST
 │
 ├── 1. Name Resolution (build symbol table)
 │
 ├── 2. Type Inference/Checking
 │
 ├── 3. Flow Analysis (reachability, returns)
 │
 ├── 4. Constant Evaluation
 │
 └── Annotated AST (ready for IR generation)
```

Each phase may traverse the AST one or more times.

---

## Error Recovery in Semantic Analysis

Unlike parsing, semantic analysis should **continue after errors**:

```python
def visit_BinaryExpr(self, node):
    left_type = self.visit(node.left)
    right_type = self.visit(node.right)

    # Use "error" type to suppress cascading errors
    if left_type == "error" or right_type == "error":
        node.type = "error"  # Don't report further errors on this node
        return "error"

    # ... normal type checking ...
```

The **error type** (or "poison" type) propagates through expressions to prevent dozens of follow-up errors from a single mistake.

---

## Exercises

### Exercise 1: Symbol Table

Trace the symbol table for this program, showing enter/exit scope operations:

```c
int a;
float b;

void f(int x) {
    int y = x + a;
    {
        float x = b;
        y = x;
    }
    return;
}
```

<details>
<summary>Solution</summary>

```
Enter scope 0 (global):
  declare a: int
  declare b: float
  declare f: function(int)->void

Enter scope 1 (function f):
  declare x: int (parameter)
  declare y: int

  Enter scope 2 (block):
    declare x: float (shadows scope 1's x)
    lookup x → scope 2 (float)
    lookup y → scope 1 (int)
    assignment: y = x → WARNING: float to int narrowing
  Exit scope 2

  lookup x → scope 1 (int)
  lookup a → scope 0 (int)
Exit scope 1
```

</details>

### Exercise 2: Type Checking

For each expression, determine the type or identify the error:

```c
int a = 5;
float b = 2.5;
char c = 'x';
int *p = &a;

/* What type? */
a + b        /* 1 */
a + c        /* 2 */
p + a        /* 3 */
*p + b       /* 4 */
a > b        /* 5 */
a && b       /* 6 */
```

<details>
<summary>Solution</summary>

1. `a + b` → `float` (int widened to float)
2. `a + c` → `int` (char widened to int)
3. `p + a` → `int*` (pointer arithmetic: pointer + integer = pointer)
4. `*p + b` → `float` (*p is int, widened to float for addition)
5. `a > b` → `int` (in C, comparisons return int 0 or 1; `bool` in C++)
6. `a && b` → `int` (logical AND; in C, any non-zero is truthy)

</details>

### Exercise 3: Semantic Errors

List all semantic errors in this program:

```c
int main() {
    int x = 10;
    float y;
    int x = 20;

    z = x + y;
    x = "hello";

    if (x) {
        break;
    }

    return x + undeclared;
}
```

<details>
<summary>Solution</summary>

| Line | Error |
|------|-------|
| `int x = 20;` | Duplicate declaration of 'x' in same scope |
| `z = x + y;` | Undeclared identifier 'z' |
| `z = x + y;` | 'y' used without initialization (warning) |
| `x = "hello";` | Type mismatch: cannot assign char* to int |
| `break;` | 'break' outside of loop or switch |
| `undeclared` | Undeclared identifier 'undeclared' |

Total: 5 errors, 1 warning.

</details>

### Exercise 4: Implicit Conversions

Show the annotated AST with implicit casts for:

```c
float result = 3 + 4.5 * 2;
```

<details>
<summary>Solution</summary>

```
VarDecl(result: float)
└── initializer:
    BinaryExpr(+) : float
    ├── ImplicitCast(int → float)
    │   └── IntLiteral(3) : int
    └── BinaryExpr(*) : float
        ├── FloatLiteral(4.5) : float
        └── ImplicitCast(int → float)
            └── IntLiteral(2) : int
```

Evaluation:
- `4.5 * 2` → int 2 is cast to float 2.0, result is float 9.0
- `3 + 9.0` → int 3 is cast to float 3.0, result is float 12.0
- `result = 12.0` → direct assignment (already float)

$$3 + 4.5 \times 2 = 3 + 9.0 = 12.0$$

</details>

### Exercise 5: Flow Checking

Write a function that checks whether all paths through an `if` statement return a value:

<details>
<summary>Solution</summary>

```python
def all_paths_return(node):
    """Returns True if all execution paths through node end with a return."""

    if isinstance(node, ReturnStmt):
        return True

    if isinstance(node, Block):
        for stmt in node.statements:
            if all_paths_return(stmt):
                return True  # Found a return in this block
        return False

    if isinstance(node, IfStmt):
        # Both branches must return
        then_returns = all_paths_return(node.then_branch)
        if node.else_branch is None:
            return False  # No else → path without return exists
        else_returns = all_paths_return(node.else_branch)
        return then_returns and else_returns

    if isinstance(node, WhileStmt):
        # Can't guarantee loop executes, so can't rely on return inside
        return False

    return False


# Usage in function checking:
def check_function_returns(func_decl):
    if func_decl.return_type == "void":
        return  # No return needed

    if not all_paths_return(func_decl.body):
        error(func_decl, "not all code paths return a value")
```

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Semantic analysis | Checks meaning (context-sensitive constraints) |
| Name resolution | Links uses to declarations via symbol table |
| Type checking | Verifies operator and assignment compatibility |
| Flow checking | Validates control flow (returns, break, reachability) |
| Static semantics | Checked at compile time |
| Dynamic semantics | Checked at runtime (bounds, null, overflow) |
| Symbol table | Maps names to declarations with scope support |
| Annotated AST | AST enriched with types, symbols, implicit casts |
| Error type | Suppresses cascading errors in type checking |

Semantic analysis transforms a syntactically valid AST into a **meaningful, verified** representation ready for code generation.
