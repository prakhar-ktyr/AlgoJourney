---
title: Syntax-Directed Translation
---

# Syntax-Directed Translation

**Syntax-Directed Translation (SDT)** attaches semantic rules to grammar productions. As the parser recognizes structures, it simultaneously computes attributes — types, values, code — enabling type checking, evaluation, and code generation within parsing.

---
## What Is SDT?

SDT connects **syntax** (grammar rules) with **semantics** (meaning/actions):

```
Grammar Rule:           E → E₁ + T
Semantic Action:        E.val = E₁.val + T.val
```

Every time the parser reduces by this rule, it executes the associated action.

---

## Attributes

Each grammar symbol (terminal or non-terminal) can have **attributes** — values computed during parsing.

### Synthesized Attributes

Computed from **children** (bottom-up):

```
E → E₁ + T    { E.val = E₁.val + T.val }
T → digit     { T.val = digit.lexval }
```

The parent's attribute depends on its children.

### Inherited Attributes

Computed from **parent or siblings** (top-down):

```
D → T L       { L.type = T.type }
T → int       { T.type = "int" }
L → id , L₁   { id.type = L.type; L₁.type = L.type }
```

A child receives information from its parent.

---

## S-Attributed Definitions

An SDT is **S-attributed** if it uses **only synthesized attributes**. These can be evaluated during **bottom-up (LR) parsing**.

### Example: Desk Calculator

```
E → E₁ + T    { E.val = E₁.val + T.val }
E → E₁ - T    { E.val = E₁.val - T.val }
E → T         { E.val = T.val }
T → T₁ * F    { T.val = T₁.val * F.val }
T → F         { T.val = F.val }
F → ( E )     { F.val = E.val }
F → digit     { F.val = digit.lexval }
```

### Evaluation: Bottom-Up on `3 + 5 * 2`

```
Step  Stack              Action             Value
──────────────────────────────────────────────────
1     digit(3)           shift              3
2     E                  reduce F→T→E       E.val=3
3     E + digit(5)       shift              5
4     E + T              reduce F→T         T.val=5
5     E + T * digit(2)   shift              2
6     E + T              reduce T→T*F       T.val=10
7     E                  reduce E→E+T       E.val=13
```

**Result:** $3 + 5 \times 2 = 13$ ✓

---

## L-Attributed Definitions

An SDT is **L-attributed** if each inherited attribute of a symbol on the right side depends only on:
1. Attributes of symbols **to its left** in the production
2. Inherited attributes of the **left-hand side**

L-attributed definitions can be evaluated during **top-down (LL) parsing** or a single left-to-right traversal.

### Example: Type Declaration

```
D → T L          { L.type = T.type }
T → int          { T.type = "int" }
T → float        { T.type = "float" }
L → id , L₁     { addType(id.name, L.type); L₁.type = L.type }
L → id           { addType(id.name, L.type) }
```

Parsing `int a, b, c`: The type `"int"` is inherited from `T` through `L` to each `id`.

---

## Translation Schemes

A **translation scheme** is a grammar with **embedded actions** placed at specific positions within productions:

```
E → T { print('+') } + E₁
```

The action `{ print('+') }` executes when the parser reaches that point.

### Action Placement Matters

```
A → { action1 } B { action2 } C { action3 }
```

- `action1`: executes before B is parsed
- `action2`: executes after B, before C
- `action3`: executes after C

---

## SDT in Recursive Descent Parsing

Implementing SDT in a recursive descent parser is natural — semantic actions become code within parsing functions:

```python
class SDTParser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else ('EOF', None)

    def consume(self, expected_type):
        tok = self.current()
        if tok[0] != expected_type:
            raise SyntaxError(f"Expected {expected_type}, got {tok[0]}")
        self.pos += 1
        return tok[1]

    # E → T E'
    def parse_E(self):
        val = self.parse_T()
        return self.parse_E_prime(val)

    # E' → + T {action} E' | ε   (inherited attribute: val)
    def parse_E_prime(self, inherited_val):
        tok = self.current()
        if tok[0] == 'PLUS':
            self.consume('PLUS')
            t_val = self.parse_T()
            result = inherited_val + t_val  # Semantic action
            return self.parse_E_prime(result)
        elif tok[0] == 'MINUS':
            self.consume('MINUS')
            t_val = self.parse_T()
            result = inherited_val - t_val  # Semantic action
            return self.parse_E_prime(result)
        return inherited_val

    # T → F T'
    def parse_T(self):
        val = self.parse_F()
        return self.parse_T_prime(val)

    # T' → * F {action} T' | ε
    def parse_T_prime(self, inherited_val):
        tok = self.current()
        if tok[0] == 'STAR':
            self.consume('STAR')
            f_val = self.parse_F()
            result = inherited_val * f_val
            return self.parse_T_prime(result)
        return inherited_val

    # F → ( E ) | number
    def parse_F(self):
        tok = self.current()
        if tok[0] == 'LPAREN':
            self.consume('LPAREN')
            val = self.parse_E()
            self.consume('RPAREN')
            return val
        return self.consume('NUM')


# Test: 3 + 5 * 2 = 13
tokens = [('NUM', 3), ('PLUS', '+'), ('NUM', 5), ('STAR', '*'), ('NUM', 2)]
print(SDTParser(tokens).parse_E())  # 13
```

---

## SDT in Yacc/Bison

In Yacc, actions are embedded in `{ }` within rules. `$$` is the left-hand side, `$1`, `$2`, etc. are right-hand symbols:

```c
/* Yacc specification for a calculator */
%token NUM
%%
expr : expr '+' term    { $$ = $1 + $3; }
     | expr '-' term    { $$ = $1 - $3; }
     | term             { $$ = $1; }
     ;
term : term '*' factor  { $$ = $1 * $3; }
     | term '/' factor  { $$ = $1 / $3; }
     | factor           { $$ = $1; }
     ;
factor : '(' expr ')'  { $$ = $2; }
       | NUM            { $$ = $1; }
       ;
%%
```

`$$` refers to the left-hand side value, `$1`, `$2`, etc. are right-hand symbols.

---

## Example: Translating Expressions to Postfix

Converting infix `a + b * c` to postfix `a b c * +`:

### Grammar with Postfix Actions

```
E → E₁ + T    { print('+') }
E → E₁ - T    { print('-') }
E → T
T → T₁ * F    { print('*') }
T → T₁ / F    { print('/') }
T → F
F → id        { print(id.name) }
F → num       { print(num.val) }
```

### Implementation

```python
class PostfixTranslator:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.postfix = []

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else ('EOF', None)

    def consume(self, expected=None):
        tok = self.current()
        self.pos += 1
        return tok

    def translate(self):
        self.parse_E()
        return ' '.join(self.postfix)

    def parse_E(self):
        self.parse_T()
        while self.current()[0] in ('PLUS', 'MINUS'):
            op = self.consume()
            self.parse_T()
            self.postfix.append(op[1])  # Emit operator AFTER operands

    def parse_T(self):
        self.parse_F()
        while self.current()[0] in ('STAR', 'SLASH'):
            op = self.consume()
            self.parse_F()
            self.postfix.append(op[1])

    def parse_F(self):
        tok = self.current()
        if tok[0] == 'LPAREN':
            self.consume()
            self.parse_E()
            self.consume()  # RPAREN
        elif tok[0] in ('ID', 'NUM'):
            self.consume()
            self.postfix.append(str(tok[1]))  # Emit leaf immediately


# Test: a + b * c → a b c * +
tokens = [('ID', 'a'), ('PLUS', '+'), ('ID', 'b'), ('STAR', '*'), ('ID', 'c')]
print(PostfixTranslator(tokens).translate())  # a b c * +
```

---

## Example: Generating Three-Address Code

**Three-address code (TAC)** uses at most three operands per instruction:

### Grammar with TAC Generation

```
E → E₁ + T    { E.place = newTemp()
                 emit(E.place '=' E₁.place '+' T.place) }
E → T         { E.place = T.place }
T → T₁ * F   { T.place = newTemp()
                 emit(T.place '=' T₁.place '*' F.place) }
T → F         { T.place = F.place }
F → id        { F.place = id.name }
F → num       { F.place = num.val }
```

### Implementation

```python
class TACGenerator:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.temp_count = 0
        self.code = []

    def new_temp(self):
        self.temp_count += 1
        return f"t{self.temp_count}"

    def emit(self, instruction):
        self.code.append(instruction)

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else ('EOF', None)

    def consume(self, expected=None):
        tok = self.current()
        self.pos += 1
        return tok

    def generate(self):
        place = self.parse_E()
        return place, self.code

    def parse_E(self):
        place = self.parse_T()
        while self.current()[0] in ('PLUS', 'MINUS'):
            op = self.consume()
            right_place = self.parse_T()
            temp = self.new_temp()
            self.emit(f"{temp} = {place} {op[1]} {right_place}")
            place = temp
        return place

    def parse_T(self):
        place = self.parse_F()
        while self.current()[0] in ('STAR', 'SLASH'):
            op = self.consume()
            right_place = self.parse_F()
            temp = self.new_temp()
            self.emit(f"{temp} = {place} {op[1]} {right_place}")
            place = temp
        return place

    def parse_F(self):
        tok = self.current()
        if tok[0] == 'LPAREN':
            self.consume()
            place = self.parse_E()
            self.consume()  # RPAREN
            return place
        self.consume()
        return tok[1] if tok[0] == 'ID' else str(tok[1])


# Test: a + b * c - d
tokens = [
    ('ID', 'a'), ('PLUS', '+'), ('ID', 'b'),
    ('STAR', '*'), ('ID', 'c'), ('MINUS', '-'), ('ID', 'd')
]
gen = TACGenerator(tokens)
result, code = gen.generate()
for line in code:
    print(f"  {line}")
# Output:
#   t1 = b * c
#   t2 = a + t1
#   t3 = t2 - d
```

### TAC for Control Flow

For if-else statements:

```
  <evaluate condition>
  ifFalse cond goto Lfalse
  <then body>
  goto Lend
Lfalse:
  <else body>
Lend:
```

For while loops:

```
Lbegin:
  <evaluate condition>
  ifFalse cond goto Lend
  <body>
  goto Lbegin
Lend:
```

### Example: Translating a While Loop

Source:
```c
while (i < 10) {
    sum = sum + i;
    i = i + 1;
}
```

Generated TAC:
```
L1:
  t1 = i < 10
  ifFalse t1 goto L2
  t2 = sum + i
  sum = t2
  t3 = i + 1
  i = t3
  goto L1
L2:
```

---

## Comparison: S-Attributed vs L-Attributed

| Feature | S-Attributed | L-Attributed |
|---------|-------------|--------------|
| Attributes | Synthesized only | Synthesized + inherited |
| Evaluation | Bottom-up | Left-to-right, top-down |
| Parser type | LR (shift-reduce) | LL (recursive descent) |
| Complexity | Simpler | More powerful |
| Use case | Expression evaluation | Type propagation, code gen |

---

## Exercises

**Exercise 1:** Write an SDT that evaluates `2 * (3 + 4) - 1`. Show the bottom-up evaluation steps.

**Exercise 2:** Convert to postfix using the translation scheme:
- `a * b + c * d`
- `(a + b) * (c - d)`

**Exercise 3:** Generate three-address code for:

```c
x = a * b + c / d - e;
```

**Exercise 4:** Write an SDT that translates an if-else into TAC with labels:

```c
if (a > b) { max = a; } else { max = b; }
```

**Exercise 5:** Is this grammar S-attributed or L-attributed? Explain:

```
S → A B        { S.val = A.val + B.val }
A → a          { A.val = 1 }
B → b          { B.val = A.val * 2 }
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| SDT | Grammar rules + semantic actions |
| Synthesized | Computed from children (bottom-up) |
| Inherited | Computed from parent/siblings (top-down) |
| S-attributed | Only synthesized; works with LR parsing |
| L-attributed | Left-to-right; works with LL parsing |
| Postfix translation | Emit operators after operands |
| TAC generation | Each instruction ≤ 3 operands |
| Translation schemes | Actions embedded in grammar rules |

---

## Next Steps

In the next lesson, we'll study **Intermediate Code Generation** — producing structured IRs (TAC, SSA) for optimization and final code generation.
