---
title: Semantic Errors and Validation
---

# Semantic Errors and Validation

**Semantic errors** are mistakes that are grammatically correct (they pass parsing) but violate the meaning rules of the language. The compiler catches these during **semantic analysis**, typically while traversing the AST.

---

## Syntax vs Semantic Errors

| Aspect | Syntax Error | Semantic Error |
|--------|-------------|----------------|
| Detection | Parser | Semantic analyzer |
| Example | `if (x > 5` (missing `)`) | `int x = "hello";` |
| Nature | Structural | Logical/type-related |
| Fix | Fix grammar | Fix meaning |

A program can be syntactically perfect but semantically invalid:

```c
// Syntactically valid, semantically wrong
int result = "hello" + 3.14;
```

---

## Common Semantic Errors

### 1. Undeclared Variables

Using a variable that was never declared in the current scope:

```c
int main() {
    x = 10;  // Error: 'x' not declared
    return 0;
}
```

**Detection:** Look up the identifier in the symbol table. If not found in any enclosing scope, report an error.

### 2. Type Mismatches

Assigning or operating on incompatible types:

```c
int count = "hello";     // Error: cannot assign string to int
int arr[5] = 3 + arr;   // Error: cannot add int and array
```

```python
def greet(name: str) -> str:
    return name + 42  # Error: cannot concatenate str and int
```

**Detection:** After resolving types of both sides, check compatibility using the language's type rules.

### 3. Wrong Number of Function Arguments

Calling a function with too many or too few arguments:

```c
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(1, 2, 3);  // Error: expected 2 args, got 3
    int other = add(1);          // Error: expected 2 args, got 1
    return 0;
}
```

**Detection:** Compare the number of arguments at the call site with the function's parameter list in the symbol table.

### 4. Return Type Mismatch

Returning a value that doesn't match the declared return type:

```c
int square(int x) {
    return "not a number";  // Error: returning char* from int function
}

void doWork() {
    return 42;  // Error: void function cannot return a value
}
```

**Detection:** Check that the type of the return expression is compatible with the function's declared return type.

### 5. Break/Continue Outside Loop

Using loop control statements outside of a loop:

```c
int main() {
    int x = 5;
    break;  // Error: 'break' not inside a loop or switch
    
    if (x > 3) {
        continue;  // Error: 'continue' not inside a loop
    }
    return 0;
}
```

**Detection:** Maintain a loop nesting counter during AST traversal. If `break`/`continue` is encountered when the counter is zero, report an error.

### 6. Duplicate Declarations

Declaring the same variable twice in the same scope:

```c
void example() {
    int x = 5;
    int x = 10;  // Error: 'x' already declared in this scope
}
```

**Detection:** Before inserting into the symbol table, check if the name already exists in the **current** scope (not enclosing scopes — shadowing may be allowed).

### 7. Array Index Type

Using a non-integer as an array index:

```c
int arr[10];
float idx = 3.5;
arr[idx] = 7;  // Error (in strict languages): index must be integer
```

### 8. Accessing Members of Non-Struct

```c
int x = 5;
x.field = 10;  // Error: 'x' is not a struct/object
```

---

## Implementing Semantic Checks

Semantic validation is performed by traversing the AST and applying checks at each node type.

### Pseudocode: AST Visitor

```python
class SemanticAnalyzer:
    def __init__(self):
        self.symbol_table = SymbolTable()
        self.errors = []
        self.loop_depth = 0

    def visit(self, node):
        method_name = f"visit_{type(node).__name__}"
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)

    def visit_VarDecl(self, node):
        # Check for duplicate declaration
        if self.symbol_table.lookup_current_scope(node.name):
            self.errors.append(
                f"Line {node.line}: '{node.name}' already declared"
            )
        else:
            self.symbol_table.insert(node.name, node.type)

        # Check initializer type
        if node.init:
            init_type = self.visit(node.init)
            if not compatible(node.type, init_type):
                self.errors.append(
                    f"Line {node.line}: cannot assign {init_type} to {node.type}"
                )

    def visit_VarRef(self, node):
        # Check if variable is declared
        entry = self.symbol_table.lookup(node.name)
        if entry is None:
            self.errors.append(
                f"Line {node.line}: '{node.name}' not declared"
            )
            return "error"
        return entry.type

    def visit_FuncCall(self, node):
        entry = self.symbol_table.lookup(node.name)
        if entry is None:
            self.errors.append(
                f"Line {node.line}: function '{node.name}' not declared"
            )
            return "error"

        # Check argument count
        expected = len(entry.params)
        actual = len(node.args)
        if expected != actual:
            self.errors.append(
                f"Line {node.line}: '{node.name}' expects {expected} args, got {actual}"
            )

        # Check argument types
        for i, (param, arg) in enumerate(zip(entry.params, node.args)):
            arg_type = self.visit(arg)
            if not compatible(param.type, arg_type):
                self.errors.append(
                    f"Line {node.line}: arg {i+1} type mismatch"
                )

        return entry.return_type

    def visit_WhileStmt(self, node):
        self.loop_depth += 1
        self.visit(node.body)
        self.loop_depth -= 1

    def visit_BreakStmt(self, node):
        if self.loop_depth == 0:
            self.errors.append(
                f"Line {node.line}: 'break' outside of loop"
            )

    def visit_ReturnStmt(self, node):
        ret_type = self.visit(node.expr) if node.expr else "void"
        if not compatible(self.current_function.return_type, ret_type):
            self.errors.append(
                f"Line {node.line}: return type mismatch"
            )
```

---

## Error Collection and Reporting

A good compiler doesn't stop at the first error. It **collects** errors and reports them all:

```python
class ErrorCollector:
    def __init__(self):
        self.errors = []    # Fatal problems
        self.warnings = []  # Non-fatal suggestions

    def error(self, line, col, message):
        self.errors.append(f"error:{line}:{col}: {message}")

    def warning(self, line, col, message):
        self.warnings.append(f"warning:{line}:{col}: {message}")

    def report(self):
        for w in self.warnings:
            print(w)
        for e in self.errors:
            print(e)
        if self.errors:
            print(f"\n{len(self.errors)} error(s) found. Compilation failed.")
```

### Example Output

```
warning:5:10: unused variable 'temp'
error:8:5: 'counter' not declared in this scope
error:12:12: cannot assign 'float' to 'int*'
error:15:1: function 'calculate' expects 2 arguments, got 3

3 error(s) found. Compilation failed.
```

---

## Warnings vs Errors

| Aspect | Warning | Error |
|--------|---------|-------|
| Compilation | Continues | Stops (or no code gen) |
| Severity | Potential problem | Definite problem |
| Examples | Unused variable, implicit cast | Type mismatch, undeclared var |
| Flag | `-Wall`, `-Wextra` | Always reported |

### Common Warnings

- Unused variables or parameters
- Implicit type narrowing (`double` → `int`)
- Unreachable code after `return`
- Missing `return` in non-void function (some compilers treat as error)
- Comparing signed and unsigned integers

---

## Semantic Analysis Passes

Some compilers perform semantic analysis in **multiple passes**:

### Pass 1: Declaration Collection

- Scan all top-level declarations (functions, classes, globals)
- Build initial symbol table entries
- Allows forward references

### Pass 2: Type Resolution

- Resolve type names to actual types
- Expand type aliases
- Check for circular type definitions

### Pass 3: Body Checking

- Traverse function bodies
- Validate expressions, assignments, control flow
- Check all semantic rules

### Why Multiple Passes?

```c
// This requires forward reference support:
void foo() {
    bar();  // 'bar' not yet declared if single-pass
}

void bar() {
    foo();
}
```

With two passes, the first pass collects both `foo` and `bar`, so the second pass can validate both calls.

---

## Type Compatibility Rules

A key part of semantic checking is determining when types are **compatible**:

```python
def compatible(target, source):
    """Can 'source' be assigned to 'target'?"""
    if target == source:
        return True

    # Widening conversions (implicit)
    widening = {
        ("float", "int"),
        ("double", "float"),
        ("double", "int"),
        ("long", "int"),
    }
    if (target, source) in widening:
        return True

    # Pointer to NULL
    if target.endswith("*") and source == "null":
        return True

    return False
```

---

## Summary

| Error Type | Detection Method |
|-----------|-----------------|
| Undeclared variable | Symbol table lookup fails |
| Type mismatch | Type comparison after resolution |
| Wrong arg count | Compare call args with declaration |
| Return type mismatch | Compare return expr with function type |
| Break outside loop | Loop depth counter == 0 |
| Duplicate declaration | Symbol already in current scope |

---

## Key Takeaways

1. Semantic errors are **logically wrong** but syntactically valid
2. The **symbol table** is essential for most semantic checks
3. A good compiler **reports all errors**, not just the first one
4. **Warnings** flag suspicious code; **errors** prevent compilation
5. **Multiple passes** enable forward references and cleaner analysis
6. Type compatibility rules define what assignments and operations are legal

---

## Exercises

1. Identify all semantic errors in this program:
   ```c
   int main() {
       float x = "test";
       int y;
       int y = 5;
       z = x + 1;
       break;
       return "done";
   }
   ```

2. Write pseudocode for a semantic check that detects unreachable code after a `return` statement.

3. Should implicit narrowing (`double` → `int`) be a warning or an error? Justify your answer.

4. Explain why a two-pass approach is needed for mutual recursion in C.

5. Design a semantic rule for checking that a `switch` statement has no duplicate `case` values.

6. Write a `visit_Assignment` method that checks type compatibility and reports errors with line numbers.

7. How would you detect that a non-void function might not return a value on all paths?
