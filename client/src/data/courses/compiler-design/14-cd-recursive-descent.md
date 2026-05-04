---
title: "Top-Down Parsing: Recursive Descent"
---

# Top-Down Parsing: Recursive Descent

In this lesson, you will learn **recursive descent parsing** — the most intuitive and widely-used technique for building parsers by hand. The idea is elegant: write one function for each grammar rule, and let function calls mirror the grammar structure.

---

## What Is Top-Down Parsing?

Top-down parsing builds the parse tree from the **root** (start symbol) down to the **leaves** (tokens):

1. Start with the start symbol
2. At each step, predict which production to use
3. Expand non-terminals by calling their corresponding functions
4. Match terminals against the input token stream

The parser "predicts" the structure of the input before seeing all of it — hence top-down parsers are also called **predictive parsers**.

---

## Recursive Descent: One Function Per Non-Terminal

The key insight: every non-terminal in the grammar becomes a **function** in the parser. The function body mirrors the production rules.

### Grammar

$$
\begin{aligned}
E &\to T\ ((+\ T)\ |\ (-\ T))^* \\
T &\to F\ ((*\ F)\ |\ (/\ F))^* \\
F &\to (E) \mid \text{num} \mid \text{id}
\end{aligned}
$$

(Using EBNF repetition `*` instead of left recursion)

### Parser Structure

```c
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

typedef enum {
    TOK_NUM, TOK_ID, TOK_PLUS, TOK_MINUS, TOK_STAR,
    TOK_SLASH, TOK_LPAREN, TOK_RPAREN, TOK_EOF
} TokenType;

typedef struct {
    TokenType type;
    double numVal;
    char name[64];
} Token;

Token currentToken;  // The lookahead token

void advance();      // Get next token from lexer
void match(TokenType expected);  // Consume if matches, error otherwise

double parseE();     // Parse Expression
double parseT();     // Parse Term
double parseF();     // Parse Factor
```

---

## The Lookahead Token

The parser always keeps **one token ahead** — the **lookahead**. This token tells the parser which production to choose:

```c
Token currentToken;  // Global lookahead

void advance() {
    currentToken = getNextToken();  // From lexer
}
```

The lookahead is consumed only when it matches what we expect.

---

## The match() Function

`match` verifies the current token and advances:

```c
void match(TokenType expected) {
    if (currentToken.type == expected) {
        advance();
    } else {
        fprintf(stderr, "Syntax error at line %d: expected %s, got %s\n",
                currentLine, tokenName(expected), tokenName(currentToken.type));
        exit(1);
    }
}
```

---

## Complete Recursive Descent Parser

Here is a full parser that **evaluates** arithmetic expressions during parsing:

```c
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <string.h>

// ===== Lexer =====
typedef enum {
    TOK_NUM, TOK_PLUS, TOK_MINUS, TOK_STAR,
    TOK_SLASH, TOK_LPAREN, TOK_RPAREN, TOK_EOF
} TokenType;

typedef struct {
    TokenType type;
    double value;
} Token;

const char *input;
int pos = 0;
Token currentToken;

Token getNextToken() {
    Token tok;

    // Skip whitespace
    while (input[pos] == ' ' || input[pos] == '\t') pos++;

    if (input[pos] == '\0') {
        tok.type = TOK_EOF;
        return tok;
    }

    char c = input[pos];

    // Number
    if (isdigit(c) || c == '.') {
        tok.type = TOK_NUM;
        tok.value = strtod(&input[pos], (char **)&input + pos);
        // Simple number parsing
        char *end;
        tok.value = strtod(input + pos, &end);
        pos = (int)(end - input);
        return tok;
    }

    pos++;
    switch (c) {
        case '+': tok.type = TOK_PLUS; break;
        case '-': tok.type = TOK_MINUS; break;
        case '*': tok.type = TOK_STAR; break;
        case '/': tok.type = TOK_SLASH; break;
        case '(': tok.type = TOK_LPAREN; break;
        case ')': tok.type = TOK_RPAREN; break;
        default:
            fprintf(stderr, "Unexpected character: '%c'\n", c);
            exit(1);
    }
    return tok;
}

void advance() {
    currentToken = getNextToken();
}

void match(TokenType expected) {
    if (currentToken.type == expected) {
        advance();
    } else {
        fprintf(stderr, "Syntax error: expected token %d, got %d\n",
                expected, currentToken.type);
        exit(1);
    }
}

// ===== Parser =====
double parseE();
double parseT();
double parseF();

// E → T (('+' | '-') T)*
double parseE() {
    double result = parseT();

    while (currentToken.type == TOK_PLUS || currentToken.type == TOK_MINUS) {
        if (currentToken.type == TOK_PLUS) {
            advance();
            result += parseT();
        } else {
            advance();
            result -= parseT();
        }
    }
    return result;
}

// T → F (('*' | '/') F)*
double parseT() {
    double result = parseF();

    while (currentToken.type == TOK_STAR || currentToken.type == TOK_SLASH) {
        if (currentToken.type == TOK_STAR) {
            advance();
            result *= parseF();
        } else {
            advance();
            double divisor = parseF();
            if (divisor == 0.0) {
                fprintf(stderr, "Error: division by zero\n");
                exit(1);
            }
            result /= divisor;
        }
    }
    return result;
}

// F → '(' E ')' | num
double parseF() {
    if (currentToken.type == TOK_LPAREN) {
        advance();  // consume '('
        double result = parseE();
        match(TOK_RPAREN);  // consume ')'
        return result;
    } else if (currentToken.type == TOK_NUM) {
        double val = currentToken.value;
        advance();
        return val;
    } else {
        fprintf(stderr, "Syntax error: expected number or '('\n");
        exit(1);
    }
}

// ===== Main =====
int main() {
    input = "3 + 5 * (2 - 1)";
    advance();  // Initialize lookahead

    double result = parseE();

    if (currentToken.type != TOK_EOF) {
        fprintf(stderr, "Syntax error: unexpected token after expression\n");
        exit(1);
    }

    printf("%s = %g\n", input, result);
    return 0;
}
```

Output:
```
3 + 5 * (2 - 1) = 8
```

---

## The Left Recursion Problem

### What Is Left Recursion?

A grammar is **left-recursive** if a non-terminal can derive itself as the leftmost symbol:

$$A \to A\alpha \mid \beta$$

### Why It Causes Infinite Recursion

If we naively translate $E \to E + T$ to code:

```c
// INFINITE LOOP — DO NOT USE!
double parseE() {
    double result = parseE();  // Calls itself immediately!
    match(TOK_PLUS);
    result += parseT();
    return result;
}
```

`parseE()` calls `parseE()` calls `parseE()`... stack overflow!

### Eliminating Left Recursion

Transform:

$$A \to A\alpha \mid \beta$$

Into:

$$
\begin{aligned}
A &\to \beta\ A' \\
A' &\to \alpha\ A' \mid \varepsilon
\end{aligned}
$$

### Example: Expression Grammar

Original (left-recursive):
$$
\begin{aligned}
E &\to E + T \mid T \\
T &\to T * F \mid F
\end{aligned}
$$

After elimination:
$$
\begin{aligned}
E &\to T\ E' \\
E' &\to +\ T\ E' \mid \varepsilon \\
T &\to F\ T' \\
T' &\to *\ F\ T' \mid \varepsilon
\end{aligned}
$$

### In Code (using loops instead of $A'$)

The $A'$ with $\varepsilon$ naturally becomes a **while loop**:

```c
// E → T E'
// E' → + T E' | ε
// Combined: E → T ('+' T)*
double parseE() {
    double result = parseT();
    while (currentToken.type == TOK_PLUS) {
        advance();
        result += parseT();
    }
    return result;
}
```

### General Left Recursion Elimination

For indirect left recursion like:

$$
\begin{aligned}
A &\to B\alpha \\
B &\to A\beta
\end{aligned}
$$

Algorithm:
1. Order non-terminals: $A_1, A_2, \ldots, A_n$
2. For each $A_i$, for each $A_j$ where $j < i$:
   - If $A_i \to A_j \gamma$, replace $A_j$ with all its alternatives
3. Eliminate direct left recursion from each $A_i$

---

## Left Factoring

### The Problem

When two alternatives for a non-terminal start with the same symbols:

$$A \to \alpha\beta_1 \mid \alpha\beta_2$$

The parser cannot decide which alternative to choose by looking at just the first token.

### The Solution

Factor out the common prefix:

$$
\begin{aligned}
A &\to \alpha\ A' \\
A' &\to \beta_1 \mid \beta_2
\end{aligned}
$$

### Example: If-Then-Else

Original:
```
stmt → "if" "(" expr ")" stmt "else" stmt
     | "if" "(" expr ")" stmt
```

Both start with `if ( expr ) stmt`. Left factored:
```
stmt      → "if" "(" expr ")" stmt else_part
else_part → "else" stmt | ε
```

In code:

```c
void parseStmt() {
    if (currentToken.type == TOK_IF) {
        advance();               // consume "if"
        match(TOK_LPAREN);       // consume "("
        parseExpr();             // parse condition
        match(TOK_RPAREN);       // consume ")"
        parseStmt();             // parse then-branch

        // Left factored: optionally parse else
        if (currentToken.type == TOK_ELSE) {
            advance();           // consume "else"
            parseStmt();         // parse else-branch
        }
    }
    // ... other statement types
}
```

---

## Building an AST Instead of Evaluating

Instead of computing values during parsing, we can build a tree:

```c
typedef enum { NODE_NUM, NODE_BINOP } NodeType;

typedef struct ASTNode {
    NodeType type;
    union {
        double numVal;
        struct {
            char op;
            struct ASTNode *left;
            struct ASTNode *right;
        } binop;
    };
} ASTNode;

ASTNode *newNum(double val) {
    ASTNode *node = malloc(sizeof(ASTNode));
    node->type = NODE_NUM;
    node->numVal = val;
    return node;
}

ASTNode *newBinOp(char op, ASTNode *left, ASTNode *right) {
    ASTNode *node = malloc(sizeof(ASTNode));
    node->type = NODE_BINOP;
    node->binop.op = op;
    node->binop.left = left;
    node->binop.right = right;
    return node;
}

// E → T (('+' | '-') T)*
ASTNode *parseE() {
    ASTNode *node = parseT();

    while (currentToken.type == TOK_PLUS || currentToken.type == TOK_MINUS) {
        char op = (currentToken.type == TOK_PLUS) ? '+' : '-';
        advance();
        ASTNode *right = parseT();
        node = newBinOp(op, node, right);
    }
    return node;
}

// T → F (('*' | '/') F)*
ASTNode *parseT() {
    ASTNode *node = parseF();

    while (currentToken.type == TOK_STAR || currentToken.type == TOK_SLASH) {
        char op = (currentToken.type == TOK_STAR) ? '*' : '/';
        advance();
        ASTNode *right = parseF();
        node = newBinOp(op, node, right);
    }
    return node;
}

// F → '(' E ')' | num
ASTNode *parseF() {
    if (currentToken.type == TOK_LPAREN) {
        advance();
        ASTNode *node = parseE();
        match(TOK_RPAREN);
        return node;
    } else if (currentToken.type == TOK_NUM) {
        ASTNode *node = newNum(currentToken.value);
        advance();
        return node;
    } else {
        fprintf(stderr, "Syntax error\n");
        exit(1);
    }
}
```

For input `3 + 5 * 2`, this builds:

```
    BinOp(+)
    /      \
  Num(3)  BinOp(*)
          /      \
        Num(5)  Num(2)
```

---

## Predictive Parsing: No Backtracking

A **predictive parser** can always decide which production to use by looking at just the **current lookahead token** — no backtracking needed.

Requirements for predictive parsing:
1. No left recursion (eliminated)
2. No common prefixes (left factored)
3. The grammar must be **LL(1)** — for each non-terminal, the lookahead uniquely determines the production

### When Backtracking Is Needed

If the grammar is not LL(1), the parser might need to try one alternative, fail, and try another:

```c
// With backtracking (inefficient)
ASTNode *parseA() {
    int savedPos = pos;
    Token savedToken = currentToken;

    // Try first alternative
    ASTNode *result = tryParseAlternative1();
    if (result != NULL) return result;

    // Failed — backtrack
    pos = savedPos;
    currentToken = savedToken;

    // Try second alternative
    return tryParseAlternative2();
}
```

Backtracking is expensive and hard to get right. We strongly prefer grammars that allow predictive (non-backtracking) parsing.

---

## Handling Operator Precedence Through Grammar Structure

The grammar itself encodes precedence:

```
Level 1 (lowest):  assignment  =
Level 2:           or          ||
Level 3:           and         &&
Level 4:           equality    == !=
Level 5:           comparison  < > <= >=
Level 6:           addition    + -
Level 7:           multiply    * / %
Level 8:           unary       ! -
Level 9 (highest): primary     () id num
```

Each level calls the next higher level:

```c
ASTNode *parseAssignment() {
    ASTNode *node = parseOr();
    if (currentToken.type == TOK_ASSIGN) {
        advance();
        ASTNode *value = parseAssignment();  // Right-associative!
        return newAssign(node, value);
    }
    return node;
}

ASTNode *parseOr() {
    ASTNode *node = parseAnd();
    while (currentToken.type == TOK_OR) {
        advance();
        node = newBinOp(OP_OR, node, parseAnd());
    }
    return node;
}

ASTNode *parseAnd() {
    ASTNode *node = parseEquality();
    while (currentToken.type == TOK_AND) {
        advance();
        node = newBinOp(OP_AND, node, parseEquality());
    }
    return node;
}

// ... and so on for each level ...

ASTNode *parseUnary() {
    if (currentToken.type == TOK_BANG) {
        advance();
        return newUnaryOp(OP_NOT, parseUnary());  // Right-associative
    }
    if (currentToken.type == TOK_MINUS) {
        advance();
        return newUnaryOp(OP_NEG, parseUnary());
    }
    return parsePrimary();
}

ASTNode *parsePrimary() {
    if (currentToken.type == TOK_NUM) {
        ASTNode *node = newNum(currentToken.value);
        advance();
        return node;
    }
    if (currentToken.type == TOK_ID) {
        ASTNode *node = newIdent(currentToken.name);
        advance();
        return node;
    }
    if (currentToken.type == TOK_LPAREN) {
        advance();
        ASTNode *node = parseAssignment();  // Back to top level inside parens
        match(TOK_RPAREN);
        return node;
    }
    error("Expected expression");
    return NULL;
}
```

---

## Error Reporting in Recursive Descent

One major advantage of recursive descent is excellent **error messages** because you know exactly what you're expecting:

```c
ASTNode *parseF() {
    if (currentToken.type == TOK_LPAREN) {
        advance();
        ASTNode *node = parseE();
        if (currentToken.type != TOK_RPAREN) {
            error("Expected ')' to match '(' at line %d", openParenLine);
        }
        match(TOK_RPAREN);
        return node;
    }

    if (currentToken.type == TOK_NUM) {
        ASTNode *node = newNum(currentToken.value);
        advance();
        return node;
    }

    if (currentToken.type == TOK_ID) {
        ASTNode *node = newIdent(currentToken.name);
        advance();
        return node;
    }

    // Detailed error message
    error("Expected expression (number, identifier, or '('), but got '%s'",
          tokenToString(currentToken));
    return NULL;
}
```

### Synchronization for Error Recovery

After an error, skip tokens until we reach a "synchronization point":

```c
void synchronize() {
    while (currentToken.type != TOK_EOF) {
        // Semicolons end statements
        if (currentToken.type == TOK_SEMI) {
            advance();
            return;
        }
        // These tokens likely start new statements
        switch (currentToken.type) {
            case TOK_IF:
            case TOK_WHILE:
            case TOK_FOR:
            case TOK_RETURN:
            case TOK_INT:
            case TOK_FLOAT:
                return;
            default:
                advance();
        }
    }
}
```

---

## A Larger Example: Statement Parser

```c
ASTNode *parseStatement() {
    switch (currentToken.type) {
        case TOK_IF:
            return parseIfStmt();
        case TOK_WHILE:
            return parseWhileStmt();
        case TOK_RETURN:
            return parseReturnStmt();
        case TOK_LBRACE:
            return parseBlock();
        case TOK_INT:
        case TOK_FLOAT:
            return parseVarDecl();
        default:
            return parseExpressionStmt();
    }
}

ASTNode *parseIfStmt() {
    match(TOK_IF);
    match(TOK_LPAREN);
    ASTNode *condition = parseExpression();
    match(TOK_RPAREN);
    ASTNode *thenBranch = parseStatement();
    ASTNode *elseBranch = NULL;
    if (currentToken.type == TOK_ELSE) {
        advance();
        elseBranch = parseStatement();
    }
    return newIfNode(condition, thenBranch, elseBranch);
}

ASTNode *parseWhileStmt() {
    match(TOK_WHILE);
    match(TOK_LPAREN);
    ASTNode *condition = parseExpression();
    match(TOK_RPAREN);
    ASTNode *body = parseStatement();
    return newWhileNode(condition, body);
}

ASTNode *parseBlock() {
    match(TOK_LBRACE);
    ASTNode *block = newBlockNode();
    while (currentToken.type != TOK_RBRACE && currentToken.type != TOK_EOF) {
        ASTNode *stmt = parseStatement();
        addToBlock(block, stmt);
    }
    match(TOK_RBRACE);
    return block;
}
```

---

## Python Implementation

Recursive descent is naturally elegant in Python:

```python
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    @property
    def current(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return Token(TokenType.EOF, None)

    def advance(self):
        tok = self.current
        self.pos += 1
        return tok

    def match(self, expected_type):
        if self.current.type == expected_type:
            return self.advance()
        raise SyntaxError(
            f"Expected {expected_type}, got {self.current.type}"
        )

    def parse_expression(self):
        """expression = term (('+' | '-') term)*"""
        node = self.parse_term()
        while self.current.type in (TokenType.PLUS, TokenType.MINUS):
            op = self.advance()
            right = self.parse_term()
            node = BinOp(op.value, node, right)
        return node

    def parse_term(self):
        """term = factor (('*' | '/') factor)*"""
        node = self.parse_factor()
        while self.current.type in (TokenType.STAR, TokenType.SLASH):
            op = self.advance()
            right = self.parse_factor()
            node = BinOp(op.value, node, right)
        return node

    def parse_factor(self):
        """factor = '(' expression ')' | NUMBER | IDENTIFIER"""
        if self.current.type == TokenType.LPAREN:
            self.advance()
            node = self.parse_expression()
            self.match(TokenType.RPAREN)
            return node
        elif self.current.type == TokenType.NUMBER:
            tok = self.advance()
            return NumLit(tok.value)
        elif self.current.type == TokenType.IDENT:
            tok = self.advance()
            return Ident(tok.value)
        else:
            raise SyntaxError(
                f"Unexpected token: {self.current.type}"
            )
```

---

## Advantages and Disadvantages

### Advantages

| Advantage | Explanation |
|-----------|-------------|
| Simple | Direct translation from grammar to code |
| Readable | Parser code mirrors grammar structure |
| Good errors | Know exactly what's expected at each point |
| Flexible | Easy to add semantic actions, build AST, evaluate |
| No tools needed | No parser generator required |
| Debuggable | Step through with a debugger |

### Disadvantages

| Disadvantage | Explanation |
|-------------|-------------|
| Left recursion | Must eliminate — changes grammar structure |
| Limited power | Only handles LL grammars |
| Maintenance | Grammar changes require code changes |
| No formal guarantees | Easy to introduce bugs in complex grammars |
| Repetitive | Many similar functions for precedence levels |

---

## Try It Yourself

**Exercise 1**: Write a recursive descent parser that evaluates boolean expressions:
- Operators: `&&`, `||`, `!`
- Values: `true`, `false`
- Parentheses for grouping
- Precedence: `!` > `&&` > `||`

**Exercise 2**: Extend the arithmetic parser to support:
- Unary minus: `-5`, `-(3+2)`
- Power operator: `2^3^2` = `2^(3^2)` = 512 (right-associative)
- Modulo: `10 % 3`

**Exercise 3**: Eliminate left recursion from:
$$
\begin{aligned}
S &\to S a \mid S b \mid c \mid d
\end{aligned}
$$

Write the transformed grammar and implement it as a recursive descent parser.

**Exercise 4**: Left-factor this grammar and write a parser:
```
expr → ID '(' arg_list ')'    (function call)
     | ID '[' expr ']'         (array access)
     | ID                      (variable)
```

**Exercise 5**: Write a complete recursive descent parser for a simple language with:
- Variable declarations: `var x = expr;`
- Assignment: `x = expr;`
- Print: `print(expr);`
- If/else: `if (expr) { stmts } else { stmts }`
- While: `while (expr) { stmts }`

Build an AST and write a tree-walking interpreter that executes the program.

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Recursive descent | One function per non-terminal |
| Lookahead | Current token guides production choice |
| match() | Consume expected token or error |
| Left recursion elimination | Convert to loops or right recursion |
| Left factoring | Factor common prefixes |
| Predictive parsing | No backtracking with LL(1) grammar |
| Precedence | Each level calls next higher level |
| Error recovery | Synchronize at statement boundaries |

---

## Next Lesson

In the next lesson, we will formalize predictive parsing with **LL(1) parsing** — computing FIRST and FOLLOW sets, building parse tables, and implementing a table-driven parser.
