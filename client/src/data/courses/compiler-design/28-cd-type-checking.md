---
title: Type Checking
---

# Type Checking

**Type checking** is the compiler phase that verifies type correctness by traversing the AST and applying type rules to every expression, statement, and declaration. It ensures your program won't encounter type errors at runtime.

---

## How Type Checking Works

The type checker walks the AST **bottom-up**:

1. Leaf nodes (literals, variables) have known types
2. Interior nodes compute their type from children's types
3. If children's types don't satisfy the rule → **type error**

```
        (+) : int         ← Computed: int + int = int
       /    \
    (x) : int  (3) : int  ← Known from symbol table / literal
```

---

## Type Checking Algorithm

```python
class TypeChecker:
    def __init__(self, symbol_table):
        self.symtab = symbol_table
        self.errors = []

    def check(self, node):
        """Dispatch to appropriate check method based on node type."""
        method = f"check_{node.kind}"
        checker = getattr(self, method, None)
        if checker:
            return checker(node)
        else:
            self.errors.append(f"Unknown node kind: {node.kind}")
            return None

    def check_int_literal(self, node):
        node.expr_type = "int"
        return "int"

    def check_float_literal(self, node):
        node.expr_type = "float"
        return "float"

    def check_bool_literal(self, node):
        node.expr_type = "bool"
        return "bool"

    def check_string_literal(self, node):
        node.expr_type = "string"
        return "string"

    def check_identifier(self, node):
        sym = self.symtab.lookup(node.name)
        if sym is None:
            self.errors.append(
                f"Line {node.line}: Undeclared identifier '{node.name}'"
            )
            return None
        node.expr_type = sym.sym_type
        return sym.sym_type
```

---

## Type Rules for Arithmetic

For binary arithmetic operators (`+`, `-`, `*`, `/`):

$$\frac{\Gamma \vdash e_1 : T_1 \quad \Gamma \vdash e_2 : T_2 \quad T_1, T_2 \in \{\text{int}, \text{float}\}}{\Gamma \vdash e_1 \oplus e_2 : \max(T_1, T_2)}$$

Where $\max$ follows the widening hierarchy.

```python
def check_binary_op(self, node):
    left_type = self.check(node.left)
    right_type = self.check(node.right)

    if left_type is None or right_type is None:
        return None

    op = node.operator

    # Arithmetic operators
    if op in ['+', '-', '*', '/']:
        if left_type == "int" and right_type == "int":
            node.expr_type = "int"
            return "int"
        elif left_type in ["int", "float"] and right_type in ["int", "float"]:
            node.expr_type = "float"
            # Insert coercion node if needed
            if left_type == "int":
                node.left = CoercionNode(node.left, "int", "float")
            if right_type == "int":
                node.right = CoercionNode(node.right, "int", "float")
            return "float"
        else:
            self.errors.append(
                f"Line {node.line}: Cannot apply '{op}' to "
                f"{left_type} and {right_type}"
            )
            return None

    # Modulo: integers only
    if op == '%':
        if left_type == "int" and right_type == "int":
            node.expr_type = "int"
            return "int"
        else:
            self.errors.append(
                f"Line {node.line}: Modulo requires int operands, "
                f"got {left_type} and {right_type}"
            )
            return None
```

---

## Type Rules for Comparisons

Comparison operators (`<`, `>`, `<=`, `>=`, `==`, `!=`) produce boolean results:

$$\frac{\Gamma \vdash e_1 : T \quad \Gamma \vdash e_2 : T \quad T \text{ is numeric}}{\Gamma \vdash e_1 < e_2 : \text{bool}}$$

```python
def check_comparison(self, node):
    left_type = self.check(node.left)
    right_type = self.check(node.right)

    if left_type is None or right_type is None:
        return None

    numeric_types = ["int", "float"]

    # Both must be numeric (or both must be same type for == / !=)
    if node.operator in ['==', '!=']:
        if left_type == right_type:
            node.expr_type = "bool"
            return "bool"
        elif left_type in numeric_types and right_type in numeric_types:
            node.expr_type = "bool"
            return "bool"
        else:
            self.errors.append(
                f"Line {node.line}: Cannot compare {left_type} "
                f"with {right_type}"
            )
            return None
    else:
        # <, >, <=, >=: numeric only
        if left_type in numeric_types and right_type in numeric_types:
            node.expr_type = "bool"
            return "bool"
        else:
            self.errors.append(
                f"Line {node.line}: Comparison requires numeric "
                f"types, got {left_type} and {right_type}"
            )
            return None
```

---

## Type Rules for Assignment

$$\frac{\Gamma \vdash x : T_1 \quad \Gamma \vdash e : T_2 \quad T_2 \leq T_1}{\Gamma \vdash x = e : T_1}$$

Where $T_2 \leq T_1$ means $T_2$ is assignable to $T_1$ (same type or widening allowed).

```python
def check_assignment(self, node):
    # Get type of left-hand side (must be a variable)
    lhs_type = self.check(node.target)
    rhs_type = self.check(node.value)

    if lhs_type is None or rhs_type is None:
        return None

    # Exact match
    if lhs_type == rhs_type:
        return lhs_type

    # Widening allowed
    if self.can_widen(rhs_type, lhs_type):
        node.value = CoercionNode(node.value, rhs_type, lhs_type)
        return lhs_type

    # Narrowing: error (or warning)
    self.errors.append(
        f"Line {node.line}: Cannot assign {rhs_type} to {lhs_type}"
    )
    return None

def can_widen(self, from_type, to_type):
    """Check if from_type can be implicitly widened to to_type."""
    hierarchy = ['char', 'short', 'int', 'long', 'float', 'double']
    if from_type not in hierarchy or to_type not in hierarchy:
        return False
    return hierarchy.index(from_type) < hierarchy.index(to_type)
```

---

## Type Rules for Function Calls

$$\frac{\Gamma \vdash f : (T_1, \ldots, T_n) \to T_r \quad \Gamma \vdash a_i : T_i \text{ for all } i}{\Gamma \vdash f(a_1, \ldots, a_n) : T_r}$$

```python
def check_function_call(self, node):
    # Look up function in symbol table
    func_sym = self.symtab.lookup(node.func_name)

    if func_sym is None:
        self.errors.append(
            f"Line {node.line}: Undeclared function '{node.func_name}'"
        )
        return None

    if not func_sym.is_function:
        self.errors.append(
            f"Line {node.line}: '{node.func_name}' is not a function"
        )
        return None

    # Check argument count
    expected = func_sym.param_count
    actual = len(node.arguments)
    if actual != expected:
        self.errors.append(
            f"Line {node.line}: '{node.func_name}' expects "
            f"{expected} args, got {actual}"
        )
        return None

    # Check each argument's type
    for i, arg in enumerate(node.arguments):
        arg_type = self.check(arg)
        param_type = func_sym.param_types[i]

        if arg_type is None:
            continue

        if arg_type != param_type:
            if self.can_widen(arg_type, param_type):
                node.arguments[i] = CoercionNode(arg, arg_type, param_type)
            else:
                self.errors.append(
                    f"Line {node.line}: Arg {i+1} of '{node.func_name}': "
                    f"expected {param_type}, got {arg_type}"
                )

    node.expr_type = func_sym.return_type
    return func_sym.return_type
```

---

## Type Checking Statements

### If Statement

The condition must be boolean:

```python
def check_if_stmt(self, node):
    cond_type = self.check(node.condition)
    if cond_type != "bool":
        self.errors.append(
            f"Line {node.line}: If condition must be bool, got {cond_type}"
        )

    self.check(node.then_body)
    if node.else_body:
        self.check(node.else_body)
```

### While Statement

```python
def check_while_stmt(self, node):
    cond_type = self.check(node.condition)
    if cond_type != "bool":
        self.errors.append(
            f"Line {node.line}: While condition must be bool, got {cond_type}"
        )
    self.check(node.body)
```

### Return Statement

The returned value must match the function's declared return type:

```python
def check_return_stmt(self, node):
    if node.value is None:
        if self.current_return_type != "void":
            self.errors.append(
                f"Line {node.line}: Non-void function must return a value"
            )
        return

    ret_type = self.check(node.value)
    if ret_type != self.current_return_type:
        if not self.can_widen(ret_type, self.current_return_type):
            self.errors.append(
                f"Line {node.line}: Cannot return {ret_type} "
                f"from function returning {self.current_return_type}"
            )
```

---

## Type Inference Basics

Some languages don't require explicit type annotations — the compiler **infers** types.

### Simple Inference

```c
auto x = 5;        // Compiler infers: x is int
auto y = 3.14;     // Compiler infers: y is double
auto z = x + y;    // Compiler infers: z is double (int + double → double)
```

### Hindley-Milner Type Inference

The **Hindley-Milner** (HM) algorithm is the foundation of type inference in languages like ML, Haskell, and OCaml.

**Key idea:** Assign type variables, then solve constraints.

The HM algorithm:
1. Assign fresh type variables: $a : \alpha$, $b : \beta$, return: $\gamma$
2. From `a + b`, generate constraint: $\alpha$ and $\beta$ support `+`
3. From return, generate: $\gamma = \alpha + \beta$
4. **Unify** constraints to find most general types

### Unification

Unification finds the most general substitution that makes two types equal:

$$\text{unify}(\alpha, \text{int}) \Rightarrow \alpha = \text{int}$$
$$\text{unify}(\alpha \to \beta, \text{int} \to \text{bool}) \Rightarrow \alpha = \text{int}, \beta = \text{bool}$$

---

## Type Errors and Error Messages

Good error messages help programmers fix bugs quickly:

### Bad Error Messages

```
Error: type mismatch
Error: incompatible types
```

### Good Error Messages

```
Line 15: Cannot assign 'string' to variable 'count' of type 'int'
Line 23: Function 'add' expects 2 arguments (int, int), got 3
Line 31: Operator '+' not defined for types 'string' and 'int'
         Hint: Did you mean to convert to string? Use str(x) + y
Line 45: Cannot return 'float' from function declared to return 'int'
         Hint: Use explicit cast: return (int)result;
```

### Error Recovery

After a type error, the checker should continue to find more errors:

```python
def check_with_recovery(self, node):
    result = self.check(node)
    if result is None:
        # Assign a "poison" type to prevent cascading errors
        node.expr_type = "error"
        return "error"
    return result
```

---

## Putting It All Together

Here's how type checking fits in the compilation pipeline:

```
Source Code
    ↓
[Lexer] → Tokens
    ↓
[Parser] → AST
    ↓
[Symbol Table Builder] → Populated Symbol Table
    ↓
[Type Checker] → Annotated AST + Errors    ← WE ARE HERE
    ↓
[Code Generator] → Target Code
```

The type checker:
1. Uses the symbol table to look up variable/function types
2. Traverses the AST bottom-up
3. Computes and annotates each node with its type
4. Inserts coercion nodes where implicit conversions are needed
5. Reports errors for type violations

---

## Exercises

**Exercise 1:** Given these declarations, type-check each expression:

```c
int a = 5;
float b = 2.0;
char c = 'x';
bool flag = true;
```

- `a + b`
- `a % b`
- `a > b`
- `flag && (a < b)`
- `c + 1`
- `flag + a`

**Exercise 2:** Implement type checking for array indexing:

$$\frac{\Gamma \vdash arr : \text{array}(T, n) \quad \Gamma \vdash idx : \text{int}}{\Gamma \vdash arr[idx] : T}$$

**Exercise 3:** Write a type inference function that determines the type of:

```python
x = 5
y = x + 3.0
z = y > 2
```

Without any type annotations, what types are inferred for x, y, z?

**Exercise 4:** Extend the SimpleTypeChecker to support:
- String type with concatenation (`+`)
- Boolean operators (`&&`, `||`, `!`)
- Print function that accepts any type

**Exercise 5:** For each line, state what error the type checker should report:

```c
int x = "hello";        // Line 1
float y = x + true;     // Line 2
int z = foo(1, 2, 3);   // Line 3 (foo takes 2 params)
bool b = 5;             // Line 4
char *p = 42;           // Line 5
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Algorithm | Bottom-up AST traversal |
| Arithmetic | Widening: int + float → float |
| Comparison | Always produces bool |
| Assignment | RHS must be compatible with LHS type |
| Functions | Check arg count and types, return type |
| Coercion | Insert conversion nodes for implicit widening |
| Inference | Assign type variables, unify constraints |
| Errors | Report clearly with line, types, and hints |

---

## Next Steps

In the next lesson, we'll study **Scope and Binding** — how the compiler resolves which declaration a name refers to, especially with nested scopes and closures.
