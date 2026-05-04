---
title: Abstract Syntax Trees
---

# Abstract Syntax Trees

After parsing confirms that input is syntactically valid, we need a **data structure** to represent the program for further processing. The **Abstract Syntax Tree (AST)** is that structure — a tree that captures the essential meaning of the source code without syntactic noise.

---

## Parse Tree vs AST

### Parse Tree (Concrete Syntax Tree)

A parse tree records **every grammar rule** applied during derivation:

For the expression `3 + 4 * 2` with grammar:

```
expr → expr + term
term → term * factor
factor → NUMBER
```

The parse tree includes all non-terminals and terminals:

```
        expr
       / | \
    expr  +  term
     |      / | \
    term  term * factor
     |     |       |
   factor factor   2
     |     |
     3     4
```

### Abstract Syntax Tree

The AST retains only the **essential structure**:

```
      +
     / \
    3   *
       / \
      4   2
```

### Key Differences

| Feature | Parse Tree | AST |
|---------|-----------|-----|
| Non-terminals | All preserved | Removed |
| Parentheses | Explicit nodes | Implicit (tree structure) |
| Operator nodes | Tokens in leaves | Internal nodes |
| Size | Large | Compact |
| Purpose | Shows derivation | Represents meaning |

---

## Why AST Is Preferred

1. **Compact**: No redundant non-terminal nodes or punctuation.
2. **Uniform**: Operators become internal nodes with operands as children.
3. **Easy to traverse**: Standard tree algorithms work.
4. **Decoupled from grammar**: Grammar changes don't always require AST changes.
5. **Foundation for later phases**: Type checking, optimisation, and code generation all work on the AST.

$$
\text{Source code} \xrightarrow{\text{Lexer}} \text{Tokens} \xrightarrow{\text{Parser}} \text{AST} \xrightarrow{\text{Semantic analysis}} \text{Annotated AST}
$$

---

## AST Node Types

A typical imperative language AST uses these node kinds:

### Expression Nodes

| Node | Children | Example |
|------|----------|---------|
| `IntLiteral` | value | `42` |
| `FloatLiteral` | value | `3.14` |
| `StringLiteral` | value | `"hello"` |
| `BoolLiteral` | value | `true` |
| `Identifier` | name | `x` |
| `BinaryExpr` | op, left, right | `a + b` |
| `UnaryExpr` | op, operand | `-x` |
| `CallExpr` | callee, args[] | `f(1, 2)` |
| `IndexExpr` | object, index | `arr[i]` |
| `MemberExpr` | object, field | `obj.x` |

### Statement Nodes

| Node | Children | Example |
|------|----------|---------|
| `ExprStmt` | expr | `f();` |
| `VarDecl` | name, type?, init? | `int x = 5;` |
| `Assignment` | target, value | `x = 10;` |
| `IfStmt` | condition, then, else? | `if (x) {...}` |
| `WhileStmt` | condition, body | `while (x) {...}` |
| `ForStmt` | init, cond, update, body | `for (...)` |
| `ReturnStmt` | value? | `return x;` |
| `Block` | statements[] | `{ ... }` |

### Declaration Nodes

| Node | Children | Example |
|------|----------|---------|
| `FuncDecl` | name, params[], returnType, body | `int f(int x) {...}` |
| `ParamDecl` | name, type | `int x` |
| `Program` | declarations[] | top-level |

---

## AST Implementation in C

### Node Definition Using Tagged Union

```c
#include <stdlib.h>
#include <string.h>

/* Forward declaration */
typedef struct ASTNode ASTNode;

/* Node types */
typedef enum {
    NODE_INT_LITERAL,
    NODE_FLOAT_LITERAL,
    NODE_IDENTIFIER,
    NODE_BINARY_EXPR,
    NODE_UNARY_EXPR,
    NODE_CALL_EXPR,
    NODE_IF_STMT,
    NODE_WHILE_STMT,
    NODE_RETURN_STMT,
    NODE_VAR_DECL,
    NODE_FUNC_DECL,
    NODE_BLOCK,
    NODE_ASSIGN,
    NODE_PROGRAM,
} NodeType;

/* Binary operators */
typedef enum {
    OP_ADD, OP_SUB, OP_MUL, OP_DIV, OP_MOD,
    OP_EQ, OP_NE, OP_LT, OP_LE, OP_GT, OP_GE,
    OP_AND, OP_OR,
} BinaryOp;

/* Unary operators */
typedef enum {
    OP_NEG, OP_NOT,
} UnaryOp;

/* AST Node structure */
struct ASTNode {
    NodeType type;
    int line;  /* source location */
    int col;

    union {
        /* NODE_INT_LITERAL */
        struct { long value; } int_literal;

        /* NODE_FLOAT_LITERAL */
        struct { double value; } float_literal;

        /* NODE_IDENTIFIER */
        struct { char *name; } identifier;

        /* NODE_BINARY_EXPR */
        struct {
            BinaryOp op;
            ASTNode *left;
            ASTNode *right;
        } binary;

        /* NODE_UNARY_EXPR */
        struct {
            UnaryOp op;
            ASTNode *operand;
        } unary;

        /* NODE_CALL_EXPR */
        struct {
            ASTNode *callee;
            ASTNode **args;
            int arg_count;
        } call;

        /* NODE_IF_STMT */
        struct {
            ASTNode *condition;
            ASTNode *then_branch;
            ASTNode *else_branch;  /* NULL if no else */
        } if_stmt;

        /* NODE_WHILE_STMT */
        struct {
            ASTNode *condition;
            ASTNode *body;
        } while_stmt;

        /* NODE_RETURN_STMT */
        struct { ASTNode *value; } return_stmt;

        /* NODE_VAR_DECL */
        struct {
            char *name;
            char *type_name;
            ASTNode *initializer;  /* NULL if none */
        } var_decl;

        /* NODE_FUNC_DECL */
        struct {
            char *name;
            char *return_type;
            ASTNode **params;
            int param_count;
            ASTNode *body;
        } func_decl;

        /* NODE_BLOCK */
        struct {
            ASTNode **stmts;
            int stmt_count;
        } block;

        /* NODE_ASSIGN */
        struct {
            ASTNode *target;
            ASTNode *value;
        } assign;

        /* NODE_PROGRAM */
        struct {
            ASTNode **decls;
            int decl_count;
        } program;
    } data;
};
```

### Constructor Functions

```c
ASTNode *ast_new(NodeType type, int line, int col) {
    ASTNode *node = calloc(1, sizeof(ASTNode));
    node->type = type;
    node->line = line;
    node->col = col;
    return node;
}

ASTNode *ast_int_literal(long value, int line, int col) {
    ASTNode *node = ast_new(NODE_INT_LITERAL, line, col);
    node->data.int_literal.value = value;
    return node;
}

ASTNode *ast_identifier(const char *name, int line, int col) {
    ASTNode *node = ast_new(NODE_IDENTIFIER, line, col);
    node->data.identifier.name = strdup(name);
    return node;
}

ASTNode *ast_binary(BinaryOp op, ASTNode *left, ASTNode *right,
                    int line, int col) {
    ASTNode *node = ast_new(NODE_BINARY_EXPR, line, col);
    node->data.binary.op = op;
    node->data.binary.left = left;
    node->data.binary.right = right;
    return node;
}

ASTNode *ast_if_stmt(ASTNode *cond, ASTNode *then_b,
                     ASTNode *else_b, int line, int col) {
    ASTNode *node = ast_new(NODE_IF_STMT, line, col);
    node->data.if_stmt.condition = cond;
    node->data.if_stmt.then_branch = then_b;
    node->data.if_stmt.else_branch = else_b;
    return node;
}
```

### Memory Management

```c
void ast_free(ASTNode *node) {
    if (!node) return;

    switch (node->type) {
        case NODE_IDENTIFIER:
            free(node->data.identifier.name);
            break;
        case NODE_BINARY_EXPR:
            ast_free(node->data.binary.left);
            ast_free(node->data.binary.right);
            break;
        case NODE_UNARY_EXPR:
            ast_free(node->data.unary.operand);
            break;
        case NODE_BLOCK:
            for (int i = 0; i < node->data.block.stmt_count; i++)
                ast_free(node->data.block.stmts[i]);
            free(node->data.block.stmts);
            break;
        /* ... other cases ... */
        default:
            break;
    }
    free(node);
}
```

---

## AST Implementation in Python

Python's dynamic typing makes AST implementation much cleaner:

```python
from dataclasses import dataclass
from typing import Optional


# Base class
@dataclass
class ASTNode:
    line: int = 0
    col: int = 0


# --- Expressions ---

@dataclass
class IntLiteral(ASTNode):
    value: int = 0


@dataclass
class FloatLiteral(ASTNode):
    value: float = 0.0


@dataclass
class StringLiteral(ASTNode):
    value: str = ""


@dataclass
class Identifier(ASTNode):
    name: str = ""


@dataclass
class BinaryExpr(ASTNode):
    op: str = ""
    left: ASTNode = None
    right: ASTNode = None


@dataclass
class UnaryExpr(ASTNode):
    op: str = ""
    operand: ASTNode = None


@dataclass
class CallExpr(ASTNode):
    callee: ASTNode = None
    args: list = None

    def __post_init__(self):
        if self.args is None:
            self.args = []


# --- Statements ---

@dataclass
class VarDecl(ASTNode):
    name: str = ""
    type_ann: Optional[str] = None
    initializer: Optional[ASTNode] = None


@dataclass
class Assignment(ASTNode):
    target: ASTNode = None
    value: ASTNode = None


@dataclass
class IfStmt(ASTNode):
    condition: ASTNode = None
    then_branch: ASTNode = None
    else_branch: Optional[ASTNode] = None


@dataclass
class WhileStmt(ASTNode):
    condition: ASTNode = None
    body: ASTNode = None


@dataclass
class ReturnStmt(ASTNode):
    value: Optional[ASTNode] = None


@dataclass
class Block(ASTNode):
    statements: list = None

    def __post_init__(self):
        if self.statements is None:
            self.statements = []


@dataclass
class FuncDecl(ASTNode):
    name: str = ""
    params: list = None
    return_type: Optional[str] = None
    body: Block = None

    def __post_init__(self):
        if self.params is None:
            self.params = []


@dataclass
class Program(ASTNode):
    declarations: list = None

    def __post_init__(self):
        if self.declarations is None:
            self.declarations = []
```

### Usage Example

```python
# Representing: if (x > 0) { return x; } else { return -x; }
ast = IfStmt(
    condition=BinaryExpr(
        op=">",
        left=Identifier(name="x"),
        right=IntLiteral(value=0)
    ),
    then_branch=Block(statements=[
        ReturnStmt(value=Identifier(name="x"))
    ]),
    else_branch=Block(statements=[
        ReturnStmt(value=UnaryExpr(op="-", operand=Identifier(name="x")))
    ])
)
```

---

## Building AST During Parsing

### In Bison (Bottom-Up)

```c
%union {
    ASTNode *node;
    long     ival;
    char    *sval;
}

%token <ival> NUMBER
%token <sval> IDENTIFIER
%type <node> expr stmt program

%%

program:
      stmt_list  { $$ = ast_program($1); root = $$; }
    ;

expr:
      expr '+' expr  { $$ = ast_binary(OP_ADD, $1, $3, @$.first_line, @$.first_column); }
    | expr '-' expr  { $$ = ast_binary(OP_SUB, $1, $3, @$.first_line, @$.first_column); }
    | expr '*' expr  { $$ = ast_binary(OP_MUL, $1, $3, @$.first_line, @$.first_column); }
    | NUMBER         { $$ = ast_int_literal($1, @$.first_line, @$.first_column); }
    | IDENTIFIER     { $$ = ast_identifier($1, @$.first_line, @$.first_column); }
    ;

stmt:
      IDENTIFIER '=' expr ';'  { $$ = ast_assign(ast_identifier($1, @1.first_line, @1.first_column), $3, @$.first_line, @$.first_column); }
    | RETURN expr ';'          { $$ = ast_return($2, @$.first_line, @$.first_column); }
    ;
```

### In Recursive Descent (Top-Down)

```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def current(self):
        return self.tokens[self.pos]

    def advance(self):
        tok = self.tokens[self.pos]
        self.pos += 1
        return tok

    def expect(self, token_type):
        tok = self.current()
        if tok.type != token_type:
            raise SyntaxError(
                f"Expected {token_type}, got {tok.type} at line {tok.line}"
            )
        return self.advance()

    def parse_expr(self):
        left = self.parse_term()
        while self.current().type in ('+', '-'):
            op = self.advance().value
            right = self.parse_term()
            left = BinaryExpr(op=op, left=left, right=right)
        return left

    def parse_term(self):
        left = self.parse_factor()
        while self.current().type in ('*', '/'):
            op = self.advance().value
            right = self.parse_factor()
            left = BinaryExpr(op=op, left=left, right=right)
        return left

    def parse_factor(self):
        tok = self.current()
        if tok.type == 'NUMBER':
            self.advance()
            return IntLiteral(value=int(tok.value), line=tok.line)
        elif tok.type == 'IDENTIFIER':
            self.advance()
            return Identifier(name=tok.value, line=tok.line)
        elif tok.type == '(':
            self.advance()
            expr = self.parse_expr()
            self.expect(')')
            return expr
        else:
            raise SyntaxError(f"Unexpected token: {tok}")

    def parse_if_stmt(self):
        line = self.current().line
        self.expect('IF')
        self.expect('(')
        condition = self.parse_expr()
        self.expect(')')
        then_branch = self.parse_block()
        else_branch = None
        if self.current().type == 'ELSE':
            self.advance()
            else_branch = self.parse_block()
        return IfStmt(
            condition=condition,
            then_branch=then_branch,
            else_branch=else_branch,
            line=line
        )
```

---

## The Visitor Pattern

The **visitor pattern** separates algorithms from the AST structure. Each phase (type checker, code generator, optimizer) is a separate visitor.

### Python Visitor

```python
class ASTVisitor:
    """Base visitor — subclass and override visit_* methods."""

    def visit(self, node):
        method_name = f"visit_{type(node).__name__}"
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)

    def generic_visit(self, node):
        raise NotImplementedError(
            f"No visit method for {type(node).__name__}"
        )


class ASTPrinter(ASTVisitor):
    """Pretty-print the AST."""

    def __init__(self):
        self.indent = 0

    def _print(self, text):
        print("  " * self.indent + text)

    def visit_IntLiteral(self, node):
        self._print(f"Int({node.value})")

    def visit_Identifier(self, node):
        self._print(f"Id({node.name})")

    def visit_BinaryExpr(self, node):
        self._print(f"BinaryExpr({node.op})")
        self.indent += 1
        self.visit(node.left)
        self.visit(node.right)
        self.indent -= 1

    def visit_IfStmt(self, node):
        self._print("If")
        self.indent += 1
        self._print("Condition:")
        self.indent += 1
        self.visit(node.condition)
        self.indent -= 1
        self._print("Then:")
        self.indent += 1
        self.visit(node.then_branch)
        self.indent -= 1
        if node.else_branch:
            self._print("Else:")
            self.indent += 1
            self.visit(node.else_branch)
            self.indent -= 1
        self.indent -= 1

    def visit_Block(self, node):
        self._print("Block")
        self.indent += 1
        for stmt in node.statements:
            self.visit(stmt)
        self.indent -= 1
```

### C Visitor (Function Pointers)

```c
/* Visitor function type */
typedef void (*VisitFn)(ASTNode *node, void *context);

/* Visitor table */
typedef struct {
    VisitFn visit_int_literal;
    VisitFn visit_identifier;
    VisitFn visit_binary;
    VisitFn visit_unary;
    VisitFn visit_if_stmt;
    VisitFn visit_while_stmt;
    VisitFn visit_block;
    /* ... */
} ASTVisitor;

/* Dispatch function */
void ast_accept(ASTNode *node, ASTVisitor *visitor, void *ctx) {
    switch (node->type) {
        case NODE_INT_LITERAL:
            visitor->visit_int_literal(node, ctx);
            break;
        case NODE_IDENTIFIER:
            visitor->visit_identifier(node, ctx);
            break;
        case NODE_BINARY_EXPR:
            visitor->visit_binary(node, ctx);
            break;
        case NODE_IF_STMT:
            visitor->visit_if_stmt(node, ctx);
            break;
        case NODE_BLOCK:
            visitor->visit_block(node, ctx);
            break;
        /* ... */
    }
}
```

---

## AST Transformations

Once you have an AST, you can transform it:

### Constant Folding

```python
class ConstantFolder(ASTVisitor):
    """Evaluate constant expressions at compile time."""

    def visit_BinaryExpr(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)

        # If both sides are literals, fold
        if isinstance(left, IntLiteral) and isinstance(right, IntLiteral):
            if node.op == '+':
                return IntLiteral(value=left.value + right.value)
            elif node.op == '*':
                return IntLiteral(value=left.value * right.value)
            # ... other ops

        # Otherwise return (possibly simplified) node
        return BinaryExpr(op=node.op, left=left, right=right)

    def visit_IntLiteral(self, node):
        return node

    def visit_Identifier(self, node):
        return node
```

### Example

Input AST for `2 + 3 * 4`:

```
BinaryExpr(+)
├── IntLiteral(2)
└── BinaryExpr(*)
    ├── IntLiteral(3)
    └── IntLiteral(4)
```

After constant folding:

```
IntLiteral(14)
```

---

## Real-World ASTs

### Python's `ast` Module

Python exposes its own AST:

```python
import ast

source = "x = 2 + 3 * y"
tree = ast.parse(source)
print(ast.dump(tree, indent=2))
```

Output:

```
Module(
  body=[
    Assign(
      targets=[Name(id='x', ctx=Store())],
      value=BinOp(
        left=Constant(value=2),
        op=Add(),
        right=BinOp(
          left=Constant(value=3),
          op=Mult(),
          right=Name(id='y', ctx=Load()))))],
  type_ignores=[])
```

### Clang AST

```
$ clang -Xclang -ast-dump -fsyntax-only test.c
```

Produces a detailed dump of the C AST with types, source locations, and implicit conversions.

---

## Exercises

### Exercise 1: Draw the AST

Draw the AST for: `a = b + c * (d - e)`

<details>
<summary>Solution</summary>

```
Assignment
├── Identifier(a)
└── BinaryExpr(+)
    ├── Identifier(b)
    └── BinaryExpr(*)
        ├── Identifier(c)
        └── BinaryExpr(-)
            ├── Identifier(d)
            └── Identifier(e)
```

Note: parentheses are not in the AST — the tree structure encodes precedence.

</details>

### Exercise 2: AST Node Classes

Define Python dataclasses for a `ForStmt` node representing:
```c
for (init; condition; update) { body }
```

<details>
<summary>Solution</summary>

```python
@dataclass
class ForStmt(ASTNode):
    init: Optional[ASTNode] = None       # initialization (VarDecl or Assignment)
    condition: Optional[ASTNode] = None  # loop condition expression
    update: Optional[ASTNode] = None     # update expression
    body: Block = None                   # loop body
```

Usage:
```python
# for (int i = 0; i < 10; i = i + 1) { ... }
ForStmt(
    init=VarDecl(name="i", type_ann="int", initializer=IntLiteral(value=0)),
    condition=BinaryExpr(op="<", left=Identifier(name="i"), right=IntLiteral(value=10)),
    update=Assignment(
        target=Identifier(name="i"),
        value=BinaryExpr(op="+", left=Identifier(name="i"), right=IntLiteral(value=1))
    ),
    body=Block(statements=[...])
)
```

</details>

### Exercise 3: AST Printer

Write a visitor that converts an AST back to source code (pretty printing).

<details>
<summary>Solution</summary>

```python
class CodeGenerator(ASTVisitor):
    def visit_IntLiteral(self, node):
        return str(node.value)

    def visit_Identifier(self, node):
        return node.name

    def visit_BinaryExpr(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)
        return f"({left} {node.op} {right})"

    def visit_UnaryExpr(self, node):
        operand = self.visit(node.operand)
        return f"({node.op}{operand})"

    def visit_Assignment(self, node):
        target = self.visit(node.target)
        value = self.visit(node.value)
        return f"{target} = {value};"

    def visit_IfStmt(self, node):
        cond = self.visit(node.condition)
        then = self.visit(node.then_branch)
        result = f"if ({cond}) {then}"
        if node.else_branch:
            els = self.visit(node.else_branch)
            result += f" else {els}"
        return result

    def visit_Block(self, node):
        stmts = "\n".join(f"  {self.visit(s)}" for s in node.statements)
        return f"{{\n{stmts}\n}}"

    def visit_ReturnStmt(self, node):
        if node.value:
            return f"return {self.visit(node.value)};"
        return "return;"
```

</details>

### Exercise 4: Constant Folding

Implement constant folding for the following operations: `+`, `-`, `*`, `/` (integer division). Test with: `(2 + 3) * (10 - 4) / 2`

Expected result: `IntLiteral(15)`

<details>
<summary>Solution</summary>

```python
class ConstantFolder(ASTVisitor):
    def visit_IntLiteral(self, node):
        return node

    def visit_BinaryExpr(self, node):
        left = self.visit(node.left)
        right = self.visit(node.right)

        if isinstance(left, IntLiteral) and isinstance(right, IntLiteral):
            l, r = left.value, right.value
            if node.op == '+': return IntLiteral(value=l + r)
            if node.op == '-': return IntLiteral(value=l - r)
            if node.op == '*': return IntLiteral(value=l * r)
            if node.op == '/' and r != 0: return IntLiteral(value=l // r)

        return BinaryExpr(op=node.op, left=left, right=right)

    def visit_Identifier(self, node):
        return node


# Test
tree = BinaryExpr(
    op='/',
    left=BinaryExpr(
        op='*',
        left=BinaryExpr(op='+', left=IntLiteral(value=2), right=IntLiteral(value=3)),
        right=BinaryExpr(op='-', left=IntLiteral(value=10), right=IntLiteral(value=4))
    ),
    right=IntLiteral(value=2)
)

folder = ConstantFolder()
result = folder.visit(tree)
print(result)  # IntLiteral(value=15)
```

$(2 + 3) \times (10 - 4) \div 2 = 5 \times 6 \div 2 = 15$ ✓

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Parse tree | Records every grammar derivation step |
| AST | Captures essential meaning, discards syntax noise |
| Node types | Expressions, statements, declarations |
| Tagged union (C) | `struct` with `enum` type and `union` of data |
| Dataclasses (Python) | Clean inheritance-based node hierarchy |
| Visitor pattern | Separates tree structure from algorithms |
| Constant folding | Evaluate compile-time expressions in AST |

The AST is the **central data structure** in a compiler — every subsequent phase reads from or transforms it.
