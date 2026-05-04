---
title: Parser Generators: Yacc and Bison
---

# Parser Generators: Yacc and Bison

Writing a parser by hand (recursive descent, table-driven LR) is educational but tedious for real languages. **Parser generators** automate the process: you write a grammar, the tool writes the parser.

---

## What Is a Parser Generator?

A parser generator reads a **context-free grammar** (with embedded actions) and produces source code for a parser — typically a C file containing tables and a driver.

| Tool | Full Name | Output |
|------|-----------|--------|
| Yacc | Yet Another Compiler-Compiler | C parser |
| Bison | GNU Bison (Yacc-compatible) | C/C++ parser |
| ANTLR | ANother Tool for Language Recognition | Java/Python/C++ parser |

Yacc was created at Bell Labs in the 1970s. Bison is the free (GNU) replacement and is **fully compatible** with Yacc input files.

---

## LALR(1) Parsing

Both Yacc and Bison generate **LALR(1)** parsers — Look-Ahead LR with 1 token of lookahead.

$$
\text{LALR}(1) \subset \text{LR}(1) \supset \text{SLR}(1)
$$

LALR(1) offers a good balance:

- **Powerful enough** for most programming language grammars.
- **Compact tables** (same number of states as SLR).
- **Fast** — $O(n)$ parsing time for input of length $n$.

---

## Bison File Structure

A `.y` (or `.yy` for C++) file has three sections separated by `%%`:

```c
%{
/* C declarations — includes, globals */
#include <stdio.h>
#include <stdlib.h>

int yylex(void);
void yyerror(const char *s);
%}

/* Bison declarations — tokens, types, precedence */
%token NUMBER
%token PLUS MINUS TIMES DIVIDE
%token LPAREN RPAREN

%left PLUS MINUS
%left TIMES DIVIDE

%%
/* Grammar rules with actions */

expr:
      expr PLUS expr    { $$ = $1 + $3; }
    | expr MINUS expr   { $$ = $1 - $3; }
    | expr TIMES expr   { $$ = $1 * $3; }
    | expr DIVIDE expr  { $$ = $1 / $3; }
    | LPAREN expr RPAREN { $$ = $2; }
    | NUMBER            { $$ = $1; }
    ;

%%
/* C code — main, yyerror */

void yyerror(const char *s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main(void) {
    printf("Enter expression: ");
    yyparse();
    return 0;
}
```

### Section Breakdown

| Section | Purpose |
|---------|---------|
| `%{ ... %}` | Verbatim C code copied to output |
| Declarations | Token names, types, precedence |
| Rules (`%%`...`%%`) | Grammar productions + semantic actions |
| User code | Auxiliary functions (main, error handler) |

---

## Tokens and Types

Tokens are declared with `%token`:

```c
%token INTEGER FLOAT IDENTIFIER STRING_LITERAL
```

To associate a C type with grammar symbols:

```c
%union {
    int    ival;
    double fval;
    char  *sval;
}

%token <ival> INTEGER
%token <fval> FLOAT
%token <sval> IDENTIFIER

%type <fval> expr term factor
```

Now `$1`, `$2`, etc. in actions have the correct type.

---

## Grammar Rules and Actions

Each rule looks like:

```c
non_terminal:
      rhs_1   { /* action for production 1 */ }
    | rhs_2   { /* action for production 2 */ }
    ;
```

**Semantic values**:

- `$$` — value of the left-hand side.
- `$1`, `$2`, ... — values of RHS symbols (left to right).

### Example: Statement List

```c
stmt_list:
      stmt_list stmt  { printf("Parsed a statement.\n"); }
    | /* empty */     { /* base case */ }
    ;

stmt:
      IDENTIFIER '=' expr ';'  { set_var($1, $3); }
    | PRINT expr ';'           { printf("%d\n", $2); }
    ;
```

---

## Operator Precedence and Associativity

Bison supports precedence declarations that **resolve shift/reduce conflicts**:

```c
%left  PLUS MINUS        /* lowest precedence, left-associative */
%left  TIMES DIVIDE
%right POWER             /* highest precedence, right-associative */
%nonassoc UMINUS         /* unary minus (no associativity) */
```

Rules can reference a precedence level:

```c
expr:
      MINUS expr %prec UMINUS  { $$ = -$2; }
    ;
```

The `%prec UMINUS` tells Bison to use the precedence of `UMINUS` for this production.

### Precedence Resolution

When Bison sees a shift/reduce conflict:

1. Compare the precedence of the **lookahead token** with the precedence of the **production**.
2. Higher precedence wins.
3. If equal, use associativity (`%left` → reduce, `%right` → shift).

---

## Integration with Lex/Flex

Yacc/Bison handles **syntax**; Lex/Flex handles **lexical analysis**. They work together:

```
source code  →  [Flex lexer]  →  token stream  →  [Bison parser]  →  AST / output
```

### The Lexer File (calc.l)

```c
%{
#include "calc.tab.h"  /* Bison-generated header */
%}

%%
[0-9]+      { yylval.ival = atoi(yytext); return INTEGER; }
"+"         { return PLUS; }
"-"         { return MINUS; }
"*"         { return TIMES; }
"/"         { return DIVIDE; }
"("         { return LPAREN; }
")"         { return RPAREN; }
[ \t]       { /* skip whitespace */ }
"\n"        { return 0; /* end of input */ }
.           { fprintf(stderr, "Unknown char: %s\n", yytext); }
%%
```

### Build Process

```
flex calc.l          → lex.yy.c
bison -d calc.y      → calc.tab.c + calc.tab.h
gcc -o calc lex.yy.c calc.tab.c -lfl
```

The `-d` flag generates a **header file** with token definitions shared between lexer and parser.

---

## Complete Calculator Example

### calc.y

```c
%{
#include <stdio.h>
#include <stdlib.h>

int yylex(void);
void yyerror(const char *s);
%}

%union {
    double val;
}

%token <val> NUMBER
%type  <val> expr

%left '+' '-'
%left '*' '/'
%right UMINUS

%%

input:
      /* empty */
    | input line
    ;

line:
      '\n'
    | expr '\n'   { printf("= %g\n", $1); }
    ;

expr:
      NUMBER              { $$ = $1; }
    | expr '+' expr       { $$ = $1 + $3; }
    | expr '-' expr       { $$ = $1 - $3; }
    | expr '*' expr       { $$ = $1 * $3; }
    | expr '/' expr       {
                            if ($3 == 0) {
                                yyerror("division by zero");
                                $$ = 0;
                            } else {
                                $$ = $1 / $3;
                            }
                          }
    | '-' expr %prec UMINUS { $$ = -$2; }
    | '(' expr ')'        { $$ = $2; }
    ;

%%

void yyerror(const char *s) {
    fprintf(stderr, "Error: %s\n", s);
}

int main(void) {
    printf("Calculator (Ctrl+D to exit):\n");
    yyparse();
    return 0;
}
```

### calc.l

```c
%{
#include "calc.tab.h"
#include <stdlib.h>
%}

%%
[0-9]+(\.[0-9]+)?  { yylval.val = atof(yytext); return NUMBER; }
[-+*/()'\n']       { return yytext[0]; }
[ \t]              { /* ignore whitespace */ }
.                  { fprintf(stderr, "Bad char: '%c'\n", *yytext); }
%%

int yywrap(void) { return 1; }
```

### Running It

```
$ flex calc.l
$ bison -d calc.y
$ gcc -o calc lex.yy.c calc.tab.c -lm
$ ./calc
Calculator (Ctrl+D to exit):
3 + 4 * 2
= 11
(3 + 4) * 2
= 14
-5 + 3
= -2
```

---

## Bison Output and Debugging

### Verbose Output

```
bison -v calc.y
```

Produces `calc.output` — a human-readable description of:

- All parser states.
- Shift/reduce and reduce/reduce conflicts.
- How conflicts were resolved.

### Enabling Trace

```c
%debug   /* in declarations */

/* In main: */
#if YYDEBUG
    yydebug = 1;
#endif
```

Compile with `-DYYDEBUG=1` to see each shift, reduce, and state transition.

---

## Conflict Resolution

### Shift/Reduce Conflicts

Occur when the parser can either **shift** the next token or **reduce** a production. Bison resolves using:

1. Precedence/associativity declarations.
2. Default: **shift** (if no declaration).

### Reduce/Reduce Conflicts

Occur when two different productions can be reduced. These are almost always **grammar bugs**. Bison picks the **first** production listed.

### Example: Dangling Else

```c
stmt:
      IF expr THEN stmt
    | IF expr THEN stmt ELSE stmt
    ;
```

This causes a shift/reduce conflict. Bison's default (shift) gives the correct "match nearest if" behaviour.

---

## Modern Alternatives

### ANTLR 4

- Generates **LL(*)** parsers (top-down, unlimited lookahead).
- Targets Java, Python, C++, JavaScript, Go, and more.
- Uses `.g4` grammar files.
- Automatic AST construction.
- IDE support (ANTLRWorks, VS Code extension).

```
grammar Expr;

prog: stat+ ;
stat: expr NEWLINE        # printExpr
    | ID '=' expr NEWLINE # assign
    | NEWLINE             # blank
    ;
expr: expr ('*'|'/') expr # MulDiv
    | expr ('+'|'-') expr # AddSub
    | INT                 # int
    | ID                  # id
    | '(' expr ')'       # parens
    ;
```

### Other Tools

| Tool | Algorithm | Languages |
|------|-----------|-----------|
| PLY | LALR(1) | Python |
| Lark | Earley / LALR | Python |
| tree-sitter | GLR | C (with bindings) |
| Menhir | LR(1) | OCaml |
| Happy | LALR(1) | Haskell |

---

## Yacc/Bison vs Hand-Written Parsers

| Aspect | Yacc/Bison | Recursive Descent |
|--------|-----------|-------------------|
| Grammar changes | Edit `.y` file, regenerate | Rewrite parser code |
| Error messages | Generic (but customisable) | Easy to customise |
| Performance | Table-driven, fast | Inline code, fast |
| Grammar class | LALR(1) | LL(k) / ad hoc |
| Maintenance | Grammar is documentation | Code is the grammar |

Many production compilers (GCC, Ruby, PostgreSQL) started with Yacc/Bison and some later switched to hand-written parsers for better error recovery.

---

## Common Pitfalls

### 1. Forgetting Return in Lexer

```c
/* BAD — no return, token is consumed silently */
[0-9]+   { yylval.ival = atoi(yytext); }

/* GOOD */
[0-9]+   { yylval.ival = atoi(yytext); return INTEGER; }
```

### 2. Type Mismatch

```c
%union { int ival; char *sval; }
%token <ival> NUMBER
%type <sval> expr   /* BUG: expr action assigns int to sval */
```

### 3. Left Recursion Is Fine

Unlike LL parsers, LR parsers **prefer** left recursion:

```c
/* GOOD for Bison — left recursive */
list: list ',' item | item ;

/* BAD for Bison — right recursive (uses more stack) */
list: item ',' list | item ;
```

---

## Exercises

### Exercise 1: Boolean Expression Parser

Write a Bison grammar for boolean expressions with:
- Operators: `AND`, `OR`, `NOT`
- Precedence: `NOT` > `AND` > `OR`
- Parentheses for grouping

<details>
<summary>Solution</summary>

```c
%token TRUE FALSE
%token AND OR NOT
%token LPAREN RPAREN

%left OR
%left AND
%right NOT

%%

expr:
      expr OR expr      { $$ = $1 || $3; }
    | expr AND expr     { $$ = $1 && $3; }
    | NOT expr          { $$ = !$2; }
    | LPAREN expr RPAREN { $$ = $2; }
    | TRUE              { $$ = 1; }
    | FALSE             { $$ = 0; }
    ;
```

</details>

### Exercise 2: Adding Exponentiation

Extend the calculator grammar to support `^` (power) that is:
- Right-associative: `2^3^4` = $2^{(3^4)}$
- Higher precedence than `*` and `/`

<details>
<summary>Solution</summary>

```c
%left '+' '-'
%left '*' '/'
%right '^'

%%

expr:
      expr '+' expr  { $$ = $1 + $3; }
    | expr '-' expr  { $$ = $1 - $3; }
    | expr '*' expr  { $$ = $1 * $3; }
    | expr '/' expr  { $$ = $1 / $3; }
    | expr '^' expr  { $$ = pow($1, $3); }
    | '(' expr ')'  { $$ = $2; }
    | NUMBER         { $$ = $1; }
    ;
```

</details>

### Exercise 3: Multi-Statement Language

Write a Bison grammar for a mini-language:
```
x = 5;
y = x + 3;
print y;
```

<details>
<summary>Solution</summary>

```c
%token IDENTIFIER NUMBER PRINT ASSIGN SEMI

%%

program:
      program statement
    | /* empty */
    ;

statement:
      IDENTIFIER ASSIGN expr SEMI
          { set_variable($1, $3); }
    | PRINT expr SEMI
          { printf("%d\n", $2); }
    ;

expr:
      expr '+' expr       { $$ = $1 + $3; }
    | expr '-' expr       { $$ = $1 - $3; }
    | expr '*' expr       { $$ = $1 * $3; }
    | expr '/' expr       { $$ = $1 / $3; }
    | '(' expr ')'        { $$ = $2; }
    | NUMBER              { $$ = $1; }
    | IDENTIFIER          { $$ = get_variable($1); }
    ;
```

</details>

### Exercise 4: Conflict Analysis

Given this grammar, identify the conflict and explain how Bison resolves it:

```c
stmt:
      IF expr THEN stmt
    | IF expr THEN stmt ELSE stmt
    | OTHER
    ;
```

<details>
<summary>Solution</summary>

**Conflict**: Shift/reduce conflict on `ELSE` token.

When the parser has seen `IF expr THEN stmt` and the lookahead is `ELSE`:
- **Reduce** interprets it as a complete if-then statement.
- **Shift** continues to parse the else clause.

**Bison's resolution**: Default is to **shift**, which associates `ELSE` with the nearest `IF` — the standard "dangling else" resolution used by most languages.

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Yacc/Bison | LALR(1) parser generators from grammar files |
| File structure | Declarations, rules (with actions), user code |
| `%left`, `%right` | Resolve shift/reduce conflicts via precedence |
| Integration | Flex provides tokens, Bison provides parser |
| `$$`, `$1`... | Semantic value of LHS and RHS symbols |
| ANTLR | Modern alternative — LL(*), multi-language |

Parser generators transform grammar design into working parsers in minutes rather than days. Master the grammar specification and let the tool handle the tedious table construction.
