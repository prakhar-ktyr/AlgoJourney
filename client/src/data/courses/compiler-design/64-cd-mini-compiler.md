---
title: Building a Mini Compiler
---

# Building a Mini Compiler

Time to put everything together! In this lesson, we build a **complete compiler** from scratch — from source code to execution. Our compiler targets a simple **stack machine**, and the entire project is written in Python.

---

## The Language: MiniLang

Our language supports:

- Integer and boolean literals
- Variables and assignment
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- `if` / `else` blocks
- `while` loops
- `print` statement

### Example Program

```
x = 10
y = 3
result = 0

while x > 0 {
    if x % 2 == 0 {
        result = result + x
    } else {
        result = result - y
    }
    x = x - 1
}

print result
```

---

## Compiler Architecture

```
Source → Lexer (tokens) → Parser (AST) → Analyzer (checked AST)
       → CodeGen (bytecode) → VM (execute)
```

---

## Phase 1: Lexer

The lexer converts source text into tokens.

```python
from enum import Enum, auto

class TokenType(Enum):
    NUMBER = auto(); TRUE = auto(); FALSE = auto()
    IDENT = auto(); IF = auto(); ELSE = auto()
    WHILE = auto(); PRINT = auto()
    PLUS = auto(); MINUS = auto(); STAR = auto()
    SLASH = auto(); PERCENT = auto(); ASSIGN = auto()
    EQ = auto(); NEQ = auto(); LT = auto(); GT = auto()
    LTE = auto(); GTE = auto()
    LBRACE = auto(); RBRACE = auto()
    LPAREN = auto(); RPAREN = auto()
    NEWLINE = auto(); EOF = auto()

class Token:
    def __init__(self, type, value, line):
        self.type, self.value, self.line = type, value, line

KEYWORDS = {
    "if": TokenType.IF, "else": TokenType.ELSE,
    "while": TokenType.WHILE, "print": TokenType.PRINT,
    "true": TokenType.TRUE, "false": TokenType.FALSE,
}

class Lexer:
    def __init__(self, source):
        self.source = source
        self.pos = 0
        self.line = 1

    def peek(self):
        return self.source[self.pos] if self.pos < len(self.source) else "\0"

    def advance(self):
        ch = self.source[self.pos]; self.pos += 1
        if ch == "\n": self.line += 1
        return ch

    def tokenize(self):
        tokens = []
        while self.pos < len(self.source):
            # Skip whitespace and comments
            while self.pos < len(self.source) and self.peek() in " \t\r":
                self.advance()
            if self.peek() == "#":
                while self.pos < len(self.source) and self.peek() != "\n":
                    self.advance()
            if self.pos >= len(self.source): break
            ch = self.peek()

            if ch == "\n":
                self.advance()
                if tokens and tokens[-1].type != TokenType.NEWLINE:
                    tokens.append(Token(TokenType.NEWLINE, "\\n", self.line))
            elif ch.isdigit():
                start = self.pos
                while self.pos < len(self.source) and self.peek().isdigit():
                    self.advance()
                tokens.append(Token(TokenType.NUMBER,
                                    int(self.source[start:self.pos]), self.line))
            elif ch.isalpha() or ch == "_":
                start = self.pos
                while self.pos < len(self.source) and (
                    self.peek().isalnum() or self.peek() == "_"):
                    self.advance()
                word = self.source[start:self.pos]
                tokens.append(Token(KEYWORDS.get(word, TokenType.IDENT),
                                    word, self.line))
            elif ch in "+-*/%{}()":
                simple = {"+": TokenType.PLUS, "-": TokenType.MINUS,
                    "*": TokenType.STAR, "/": TokenType.SLASH,
                    "%": TokenType.PERCENT, "{": TokenType.LBRACE,
                    "}": TokenType.RBRACE, "(": TokenType.LPAREN,
                    ")": TokenType.RPAREN}
                self.advance()
                tokens.append(Token(simple[ch], ch, self.line))
            elif ch in "=!<>":
                self.advance()
                if self.peek() == "=":
                    self.advance()
                    ops = {"=": TokenType.EQ, "!": TokenType.NEQ,
                           "<": TokenType.LTE, ">": TokenType.GTE}
                    tokens.append(Token(ops[ch], ch + "=", self.line))
                else:
                    ops = {"=": TokenType.ASSIGN, "<": TokenType.LT,
                           ">": TokenType.GT}
                    tokens.append(Token(ops[ch], ch, self.line))
            else:
                raise SyntaxError(f"Line {self.line}: Unexpected '{ch}'")

        tokens.append(Token(TokenType.EOF, None, self.line))
        return tokens
```

---

## Phase 2: Parser

The parser uses **recursive descent** to build an AST.

```python
# AST node classes
class NumberLit:
    def __init__(self, value): self.value = value
class BoolLit:
    def __init__(self, value): self.value = value
class VarRef:
    def __init__(self, name): self.name = name
class BinOp:
    def __init__(self, op, left, right):
        self.op, self.left, self.right = op, left, right
class Assign:
    def __init__(self, name, expr): self.name, self.expr = name, expr
class Print:
    def __init__(self, expr): self.expr = expr
class IfElse:
    def __init__(self, condition, then_body, else_body=None):
        self.condition, self.then_body, self.else_body = (
            condition, then_body, else_body)
class While:
    def __init__(self, condition, body):
        self.condition, self.body = condition, body
class Block:
    def __init__(self, statements): self.statements = statements

class Parser:
    def __init__(self, tokens):
        self.tokens, self.pos = tokens, 0

    def peek(self): return self.tokens[self.pos]
    def advance(self):
        tok = self.tokens[self.pos]; self.pos += 1; return tok
    def expect(self, tt):
        tok = self.advance()
        if tok.type != tt:
            raise SyntaxError(f"Line {tok.line}: Expected {tt}, got {tok.type}")
        return tok
    def skip_newlines(self):
        while self.peek().type == TokenType.NEWLINE: self.advance()

    def parse_program(self):
        stmts = []; self.skip_newlines()
        while self.peek().type != TokenType.EOF:
            stmts.append(self.parse_statement()); self.skip_newlines()
        return Block(stmts)

    def parse_statement(self):
        tok = self.peek()
        if tok.type == TokenType.IF: return self.parse_if()
        if tok.type == TokenType.WHILE: return self.parse_while()
        if tok.type == TokenType.PRINT:
            self.advance(); return Print(self.parse_expr())
        if (tok.type == TokenType.IDENT and self.pos + 1 < len(self.tokens)
                and self.tokens[self.pos + 1].type == TokenType.ASSIGN):
            name = self.advance().value; self.advance()
            return Assign(name, self.parse_expr())
        return self.parse_expr()

    def parse_if(self):
        self.advance(); cond = self.parse_expr()
        then = self.parse_block(); self.skip_newlines()
        else_body = None
        if self.peek().type == TokenType.ELSE:
            self.advance(); else_body = self.parse_block()
        return IfElse(cond, then, else_body)

    def parse_while(self):
        self.advance(); cond = self.parse_expr()
        return While(cond, self.parse_block())

    def parse_block(self):
        self.expect(TokenType.LBRACE); self.skip_newlines()
        stmts = []
        while self.peek().type != TokenType.RBRACE:
            stmts.append(self.parse_statement()); self.skip_newlines()
        self.expect(TokenType.RBRACE); return Block(stmts)

    def parse_expr(self): return self.parse_comparison()

    def parse_comparison(self):
        left = self.parse_additive()
        cmp_ops = {TokenType.EQ, TokenType.NEQ, TokenType.LT,
                   TokenType.GT, TokenType.LTE, TokenType.GTE}
        while self.peek().type in cmp_ops:
            op = self.advance().value; left = BinOp(op, left, self.parse_additive())
        return left

    def parse_additive(self):
        left = self.parse_multiplicative()
        while self.peek().type in (TokenType.PLUS, TokenType.MINUS):
            op = self.advance().value
            left = BinOp(op, left, self.parse_multiplicative())
        return left

    def parse_multiplicative(self):
        left = self.parse_primary()
        while self.peek().type in (TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            op = self.advance().value; left = BinOp(op, left, self.parse_primary())
        return left

    def parse_primary(self):
        tok = self.peek()
        if tok.type == TokenType.NUMBER: self.advance(); return NumberLit(tok.value)
        if tok.type == TokenType.TRUE:   self.advance(); return BoolLit(True)
        if tok.type == TokenType.FALSE:  self.advance(); return BoolLit(False)
        if tok.type == TokenType.IDENT:  self.advance(); return VarRef(tok.value)
        if tok.type == TokenType.LPAREN:
            self.advance(); e = self.parse_expr()
            self.expect(TokenType.RPAREN); return e
        raise SyntaxError(f"Line {tok.line}: Unexpected {tok.type}")
```

---

## Phase 3: Semantic Analysis

```python
class SemanticAnalyzer:
    def __init__(self):
        self.declared = set()
        self.errors = []

    def analyze(self, node):
        if isinstance(node, Block):
            for s in node.statements: self.analyze(s)
        elif isinstance(node, Assign):
            self.analyze(node.expr); self.declared.add(node.name)
        elif isinstance(node, VarRef):
            if node.name not in self.declared:
                self.errors.append(f"Undeclared variable: '{node.name}'")
        elif isinstance(node, BinOp):
            self.analyze(node.left); self.analyze(node.right)
        elif isinstance(node, Print):
            self.analyze(node.expr)
        elif isinstance(node, IfElse):
            self.analyze(node.condition); self.analyze(node.then_body)
            if node.else_body: self.analyze(node.else_body)
        elif isinstance(node, While):
            self.analyze(node.condition); self.analyze(node.body)
        return self.errors or None
```

---

## Phase 4: Code Generation

Generate instructions for a simple stack machine.

### Instruction Set

| Instruction | Description |
|---|---|
| `PUSH n` | Push integer `n` onto stack |
| `LOAD name` / `STORE name` | Load/store variable |
| `ADD, SUB, MUL, DIV, MOD` | Binary arithmetic |
| `EQ, NEQ, LT, GT, LTE, GTE` | Comparison (push 1 or 0) |
| `JMP addr` / `JZ addr` | Unconditional / conditional jump |
| `PRINT` | Pop and print top of stack |
| `HALT` | Stop execution |

### Code Generator

```python
class CodeGenerator:
    def __init__(self): self.code = []
    def emit(self, instr):
        self.code.append(instr); return len(self.code) - 1

    def generate(self, node):
        if isinstance(node, Block):
            for s in node.statements: self.generate(s)
        elif isinstance(node, NumberLit):
            self.emit(("PUSH", node.value))
        elif isinstance(node, BoolLit):
            self.emit(("PUSH_TRUE",) if node.value else ("PUSH_FALSE",))
        elif isinstance(node, VarRef):
            self.emit(("LOAD", node.name))
        elif isinstance(node, BinOp):
            self.generate(node.left); self.generate(node.right)
            ops = {"+": "ADD", "-": "SUB", "*": "MUL", "/": "DIV",
                   "%": "MOD", "==": "EQ", "!=": "NEQ", "<": "LT",
                   ">": "GT", "<=": "LTE", ">=": "GTE"}
            self.emit((ops[node.op],))
        elif isinstance(node, Assign):
            self.generate(node.expr); self.emit(("STORE", node.name))
        elif isinstance(node, Print):
            self.generate(node.expr); self.emit(("PRINT",))
        elif isinstance(node, IfElse):
            self.generate(node.condition)
            jz = self.emit(("JZ", 0))
            self.generate(node.then_body)
            if node.else_body:
                jmp = self.emit(("JMP", 0))
                self.code[jz] = ("JZ", len(self.code))
                self.generate(node.else_body)
                self.code[jmp] = ("JMP", len(self.code))
            else:
                self.code[jz] = ("JZ", len(self.code))
        elif isinstance(node, While):
            loop_start = len(self.code)
            self.generate(node.condition)
            jz = self.emit(("JZ", 0))
            self.generate(node.body)
            self.emit(("JMP", loop_start))
            self.code[jz] = ("JZ", len(self.code))
        return self.code
```

---

## Phase 5: Virtual Machine

```python
class VM:
    def __init__(self, code):
        self.code, self.stack, self.variables = code, [], {}
        self.pc, self.output = 0, []

    def run(self):
        while self.pc < len(self.code):
            op, *args = self.code[self.pc]
            if op == "PUSH":      self.stack.append(args[0])
            elif op == "PUSH_TRUE":  self.stack.append(1)
            elif op == "PUSH_FALSE": self.stack.append(0)
            elif op == "LOAD":    self.stack.append(self.variables[args[0]])
            elif op == "STORE":   self.variables[args[0]] = self.stack.pop()
            elif op in ("ADD","SUB","MUL","DIV","MOD",
                        "EQ","NEQ","LT","GT","LTE","GTE"):
                b, a = self.stack.pop(), self.stack.pop()
                result = {
                    "ADD": a+b, "SUB": a-b, "MUL": a*b,
                    "MOD": a%b,
                    "EQ": int(a==b), "NEQ": int(a!=b),
                    "LT": int(a<b), "GT": int(a>b),
                    "LTE": int(a<=b), "GTE": int(a>=b),
                }.get(op)
                if op == "DIV":
                    if b == 0: raise RuntimeError("Division by zero")
                    result = a // b
                self.stack.append(result)
            elif op == "JMP":
                self.pc = args[0]; continue
            elif op == "JZ":
                if self.stack.pop() == 0:
                    self.pc = args[0]; continue
            elif op == "PRINT":
                val = self.stack.pop()
                self.output.append(str(val)); print(val)
            elif op == "HALT": break
            self.pc += 1
        return self.output
```

---

## Putting It All Together

```python
def compile_and_run(source):
    tokens = Lexer(source).tokenize()
    ast = Parser(tokens).parse_program()
    errs = SemanticAnalyzer().analyze(ast)
    if errs:
        for e in errs: print(f"Error: {e}")
        return
    codegen = CodeGenerator()
    code = codegen.generate(ast)
    code.append(("HALT",))
    return VM(code).run()

# Test: arithmetic
compile_and_run("print 2 + 3 * 4")         # Output: 14

# Test: sum 1..10
compile_and_run("""
sum = 0
i = 1
while i <= 10 {
    sum = sum + i
    i = i + 1
}
print sum
""")                                         # Output: 55
```

---

## Viewing Generated Bytecode

For `print 2 + 3 * 4`:

```
0: PUSH 2    1: PUSH 3    2: PUSH 4    3: MUL    4: ADD    5: PRINT    6: HALT
```

---

## Extensions

You can extend MiniLang further:

- **Functions:** Add `func name(args) { ... }` with `CALL`/`RET` instructions and a call stack
- **Arrays:** Add `arr = [1, 2, 3]` with `MAKE_ARRAY`/`INDEX` instructions
- **Strings:** Add string literals with a string pool in the VM

---

## Try It Yourself

### Exercise 1: Trace Execution

Hand-trace the VM execution for `x = 5; y = x + 3; print y`. Show the stack and variables after each instruction.

### Exercise 2: Add Logical Operators

Add `and` and `or` to the lexer, parser, and code generator.

### Exercise 3: Add `for` Loops

Add `for i = 0 to 10 { print i }`. Hint: desugar it to a `while` loop.

### Exercise 4: Better Errors

Add line numbers and source context to error messages.

---

## Key Takeaways

- A compiler is a **pipeline**: lexer → parser → analyzer → code generator → executor
- Each phase has a clear responsibility and well-defined input/output
- A **recursive descent parser** is simple and effective for small languages
- **Stack machine code** is easy to generate and execute
- Even a toy compiler illustrates real compiler concepts: tokenization, AST construction, semantic analysis, and code generation
- Extensions (functions, arrays, strings) build naturally on the same architecture

---

**Next Lesson:** [Course Summary and Next Steps →](65-cd-summary.md)
