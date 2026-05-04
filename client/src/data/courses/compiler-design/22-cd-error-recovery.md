---
title: Error Recovery in Parsing
---

# Error Recovery in Parsing

No real-world program is always syntactically correct. A good compiler doesn't give up at the first error — it **recovers** and keeps parsing to report as many errors as possible in one pass.

---

## Why Error Recovery Matters

Without error recovery:

```
$ gcc broken.c
broken.c:3:5: error: expected ';'
```

One error, then the compiler stops. The programmer fixes it, recompiles, and finds the next error. This cycle is painfully slow.

With good error recovery:

```
$ gcc broken.c
broken.c:3:5: error: expected ';' after expression
broken.c:7:12: error: undeclared identifier 'x'
broken.c:11:1: error: expected '}'
3 errors generated.
```

The compiler **reports multiple errors** in a single run, saving the programmer time.

---

## Goals of Error Recovery

1. **Report the error clearly** — show location and nature of the problem.
2. **Resume parsing** — skip or insert tokens to get back on track.
3. **Avoid cascading errors** — don't report dozens of spurious errors caused by the first one.
4. **Never loop infinitely** — the parser must always make progress.

---

## Error Recovery Strategies

### 1. Panic Mode Recovery

The simplest and most common strategy.

**Algorithm**:
1. On error, discard input tokens until a **synchronizing token** is found.
2. Synchronizing tokens are typically statement terminators (`;`), block delimiters (`}`), or keywords (`if`, `while`).
3. Pop the parser stack until a state is found that can shift the synchronizing token.

```c
/* Pseudo-code for panic mode */
void panic_mode_recovery(Parser *p) {
    /* Discard tokens until synchronizing token */
    while (current_token != SEMICOLON &&
           current_token != RBRACE &&
           current_token != EOF) {
        advance();
    }
    /* Pop stack to matching state */
    while (!can_shift(parser_state, current_token)) {
        pop_state();
    }
}
```

**Pros**:
- Simple to implement.
- Guaranteed to terminate.
- Rarely causes cascading errors.

**Cons**:
- May skip large portions of input without checking.
- Misses errors in skipped text.

---

### 2. Phrase-Level Recovery

More refined than panic mode — the parser makes **local corrections** at the point of error.

**Techniques**:
- **Insert** a missing token (e.g., insert `;` if missing).
- **Delete** an extra token (e.g., remove duplicate operator).
- **Replace** a token (e.g., replace `:` with `;`).

```c
/* Example: phrase-level recovery for missing semicolon */
void parse_statement() {
    parse_expression();
    if (current_token == SEMICOLON) {
        advance();  /* consume ';' */
    } else {
        error("expected ';' after expression");
        /* Don't consume — assume it was just missing */
        /* Continue parsing the next statement */
    }
}
```

**Pros**:
- Minimal input is skipped.
- Good error messages ("expected X, found Y").

**Cons**:
- Difficult to avoid infinite loops (if insertion triggers same error).
- Hard to implement for all cases.

---

### 3. Error Productions

Add **extra grammar rules** that match common mistakes.

```c
/* Normal rule */
stmt: expr ';' ;

/* Error production for missing semicolon */
stmt: expr { yyerror("missing ';' after expression"); } ;

/* Error production for extra semicolons */
stmt: ';' { yyerror("unexpected ';'"); } ;
```

**Pros**:
- Very precise error messages.
- Full control over recovery.

**Cons**:
- Bloats the grammar.
- Must anticipate specific errors.
- Grammar becomes harder to maintain.

---

### 4. Global Correction (Burke-Fisher)

Find the **minimum-cost edit** (insertions, deletions, replacements) that transforms the erroneous input into a valid program.

$$
\text{cost} = \sum_{i} w(\text{edit}_i)
$$

where $w$ assigns weights to different edit operations.

**Pros**:
- Theoretically optimal correction.

**Cons**:
- Very expensive ($O(n^3)$ or worse).
- Rarely used in practice.
- May produce corrections that don't match programmer intent.

---

## Error Recovery in Yacc/Bison

Bison provides the special **`error`** pseudo-token for error recovery.

### The `error` Token

When the parser encounters an error:
1. It calls `yyerror()` to report the error.
2. It pushes the `error` token onto the stack.
3. It discards states until it finds one that can shift `error`.
4. It discards input tokens until it finds one that can follow the error recovery rule.

### Basic Usage

```c
%%

program:
      program statement
    | program error '\n'  { yyerrok; printf("Recovered at newline.\n"); }
    | /* empty */
    ;

statement:
      expr '\n'   { printf("= %g\n", $1); }
    ;
```

When a syntax error occurs, the parser:
1. Discards stack items until `program` is on top.
2. Shifts `error`.
3. Discards input until `'\n'` is found.
4. Reduces and continues.

### Special Macros

| Macro | Purpose |
|-------|---------|
| `yyerrok` | Clear the error state; resume normal parsing |
| `yyclearin` | Discard the current lookahead token |
| `YYERROR` | Manually trigger an error from an action |
| `YYRECOVERING()` | Returns true if still in error recovery |

### Suppressing Cascading Errors

After an error, Bison suppresses further error messages until **3 tokens** have been successfully shifted. This prevents cascading errors.

```c
/* The yyerrok macro resets this counter */
stmt:
      expr ';'
    | error ';'  { yyerrok; }  /* Resume immediately after ';' */
    ;
```

---

## Practical Error Recovery Patterns

### Pattern 1: Statement-Level Recovery

```c
stmt_list:
      stmt_list stmt
    | stmt_list error ';'  {
          yyerrok;
          fprintf(stderr, "  (skipping to next statement)\n");
      }
    | /* empty */
    ;
```

Skip to the next semicolon, then continue parsing statements.

### Pattern 2: Block-Level Recovery

```c
block:
      '{' stmt_list '}'
    | '{' error '}'  {
          yyerrok;
          fprintf(stderr, "  (skipping to end of block)\n");
      }
    ;
```

If an error occurs inside a block, skip to the closing brace.

### Pattern 3: Expression Recovery

```c
expr:
      expr '+' expr     { $$ = $1 + $3; }
    | expr '-' expr     { $$ = $1 - $3; }
    | '(' expr ')'     { $$ = $2; }
    | '(' error ')'    { yyerrok; $$ = 0; }  /* recover in parens */
    | NUMBER           { $$ = $1; }
    ;
```

If there's an error inside parentheses, skip to `)` and return a dummy value.

### Pattern 4: Comma-Separated Lists

```c
arg_list:
      arg_list ',' expr     { add_arg($3); }
    | arg_list ',' error    { yyerrok; }  /* skip bad argument */
    | expr                  { add_arg($1); }
    ;
```

---

## Implementing Good Error Messages

### Token Expected Messages

```c
void yyerror(const char *s) {
    fprintf(stderr, "%s:%d:%d: error: %s\n",
            filename, yylineno, yycolumn, s);
}
```

The default `yyerror` just prints "syntax error". Better messages require more work:

```c
/* Custom error with token information */
void yyerror(const char *s) {
    fprintf(stderr, "%s:%d: %s", filename, yylineno, s);
    if (yychar == IDENTIFIER)
        fprintf(stderr, " near '%s'", yylval.sval);
    else if (yychar > 0 && yychar < 128)
        fprintf(stderr, " near '%c'", yychar);
    fprintf(stderr, "\n");
}
```

### Using `%error-verbose` (Bison)

```c
%define parse.error verbose
```

This makes Bison generate messages like:

```
syntax error, unexpected '+', expecting NUMBER or '('
```

### Even Better: `%define parse.error detailed`

Available in Bison 3.6+:

```c
%define parse.error detailed
```

Produces messages with the list of expected tokens:

```
syntax error, unexpected '+', expecting one of: NUMBER, IDENTIFIER, '(', '-'
```

---

## Error Recovery in Recursive Descent

For hand-written parsers, error recovery is done with **synchronization sets**.

```c
/* FIRST and FOLLOW sets determine where to synchronize */
typedef enum { SYNC_STMT, SYNC_EXPR, SYNC_BLOCK } SyncLevel;

Token sync_tokens[] = {
    [SYNC_STMT]  = { SEMICOLON, IF, WHILE, RETURN, RBRACE, T_EOF },
    [SYNC_EXPR]  = { SEMICOLON, RPAREN, COMMA, T_EOF },
    [SYNC_BLOCK] = { RBRACE, T_EOF },
};

void synchronize(SyncLevel level) {
    while (!is_sync_token(current, level)) {
        advance();
    }
}
```

### Example: Statement Parser with Recovery

```c
void parse_statement(void) {
    switch (current_token.type) {
        case IF:     parse_if_stmt();     break;
        case WHILE:  parse_while_stmt();  break;
        case RETURN: parse_return_stmt(); break;
        case LBRACE: parse_block();       break;
        default:
            if (is_expr_start(current_token)) {
                parse_expr_stmt();
            } else {
                error_at(current_token,
                    "expected statement, found '%s'",
                    token_name(current_token.type));
                synchronize(SYNC_STMT);
            }
    }
}
```

---

## Error Messages from Real Compilers

### Clang (C/C++)

Clang is famous for excellent error messages:

```
test.c:3:12: error: expected ';' after expression
    int x = 5
              ^
              ;
test.c:5:5: error: use of undeclared identifier 'y'
    y = 10;
    ^
```

Features:
- **Caret** pointing to the exact error location.
- **Fix-it hints** suggesting corrections.
- **Range highlighting** showing the relevant expression.

### Rust Compiler

```
error[E0308]: mismatched types
 --> src/main.rs:3:24
  |
3 |     let x: i32 = "hello";
  |            ---   ^^^^^^^ expected `i32`, found `&str`
  |            |
  |            expected due to this
```

Features:
- **Error codes** (E0308) linking to detailed explanations.
- **Multi-line spans** with annotations.
- **Suggestions** with `help:` messages.

### GCC

```
test.c:3:5: error: expected '=', ',', ';', 'asm' or '__attribute__' before 'x'
    3 | int x y;
      |     ^
```

---

## Measuring Error Recovery Quality

### Metrics

1. **Precision**: How many reported errors are real (not cascading)?
2. **Coverage**: How many real errors are reported?
3. **Resumption distance**: How much valid input is skipped?

$$
\text{Precision} = \frac{\text{real errors reported}}{\text{total errors reported}}
$$

$$
\text{Coverage} = \frac{\text{real errors reported}}{\text{total real errors}}
$$

### The Three-Token Rule

Bison's built-in heuristic: after an error, suppress further error messages until 3 tokens have been successfully shifted. This simple rule works surprisingly well in practice.

---

## Common Error Recovery Mistakes

### 1. Infinite Recovery Loop

```c
/* BAD: error rule that doesn't consume input */
stmt: error { yyerrok; }  /* Will loop forever! */

/* GOOD: require a synchronizing token */
stmt: error ';' { yyerrok; }
```

### 2. Over-Eager Recovery

```c
/* BAD: recovers too aggressively */
program: error { yyerrok; }  /* Swallows everything */

/* GOOD: recover at appropriate granularity */
stmt: error ';' { yyerrok; }
```

### 3. Cascading Error Floods

```c
/* Without yyerrok, each token generates a new error */
stmt_list:
      stmt_list error ';'   /* No yyerrok — errors cascade */
    ;

/* GOOD */
stmt_list:
      stmt_list error ';'  { yyerrok; }
    ;
```

---

## Advanced: Error Recovery with Contexts

For complex languages, different contexts need different recovery:

```c
%{
static int in_function = 0;
static int in_loop = 0;
%}

%%

function_def:
      type IDENTIFIER '(' params ')' '{' {in_function = 1;}
      stmt_list
      '}' {in_function = 0;}
    | type IDENTIFIER '(' error ')' '{' { yyerrok; in_function = 1; }
      stmt_list
      '}' {in_function = 0;}
    ;

loop_stmt:
      WHILE '(' expr ')' '{' { in_loop = 1; }
      stmt_list
      '}' { in_loop = 0; }
    | WHILE '(' error ')' '{' { yyerrok; in_loop = 1; }
      stmt_list
      '}' { in_loop = 0; }
    ;
```

---

## Error Recovery Strategy Comparison

| Strategy | Implementation | Quality | Use Case |
|----------|---------------|---------|----------|
| Panic mode | Easy | Fair | Most parsers |
| Phrase-level | Moderate | Good | Hand-written parsers |
| Error productions | Moderate | Excellent | Known error patterns |
| Global correction | Hard | Optimal | Research / IDEs |

---

## Exercises

### Exercise 1: Panic Mode Implementation

Given this grammar, add `error` rules for panic-mode recovery at both statement and block level:

```c
program: stmt_list ;
stmt_list: stmt_list stmt | /* empty */ ;
stmt: assignment | if_stmt | while_stmt | block ;
block: '{' stmt_list '}' ;
```

<details>
<summary>Solution</summary>

```c
program: stmt_list ;

stmt_list:
      stmt_list stmt
    | stmt_list error ';'  { yyerrok; }   /* statement-level */
    | /* empty */
    ;

stmt:
      assignment
    | if_stmt
    | while_stmt
    | block
    ;

block:
      '{' stmt_list '}'
    | '{' error '}'  { yyerrok; }  /* block-level */
    ;
```

</details>

### Exercise 2: Cascading Error Prevention

This grammar reports too many errors for a single mistake. Fix it:

```c
expr:
      expr '+' expr
    | expr '*' expr
    | NUMBER
    | IDENTIFIER
    ;

stmt:
      expr ';'
    | error
    ;
```

<details>
<summary>Solution</summary>

```c
expr:
      expr '+' expr
    | expr '*' expr
    | '(' expr ')'
    | '(' error ')'  { yyerrok; $$ = 0; }  /* recover inside parens */
    | NUMBER
    | IDENTIFIER
    ;

stmt:
      expr ';'
    | error ';'  { yyerrok; }  /* consume up to ';' and reset */
    ;
```

Key changes:
1. Error rule in `stmt` requires `;` synchronization.
2. Added `yyerrok` to resume normal parsing.
3. Added parenthesized error recovery for expressions.

</details>

### Exercise 3: Custom Error Messages

Write a `yyerror` function that:
1. Shows filename and line number.
2. Shows the unexpected token.
3. Lists expected tokens (hint: use Bison's `%define parse.error verbose`).

<details>
<summary>Solution</summary>

```c
%define parse.error verbose
%locations

%%
/* ... grammar ... */
%%

void yyerror(YYLTYPE *loc, const char *s) {
    fprintf(stderr, "%s:%d:%d: error: %s\n",
            current_filename,
            loc->first_line,
            loc->first_column,
            s);

    /* Print the source line */
    const char *line = get_source_line(loc->first_line);
    if (line) {
        fprintf(stderr, "    %s\n", line);
        /* Print caret */
        fprintf(stderr, "    ");
        for (int i = 0; i < loc->first_column - 1; i++)
            fprintf(stderr, " ");
        fprintf(stderr, "^\n");
    }
}
```

With `%define parse.error verbose`, the string `s` already contains "unexpected TOKEN, expecting TOKEN1 or TOKEN2".

</details>

### Exercise 4: Recovery in Recursive Descent

Write a recursive descent parser for simple assignments (`id = expr ;`) with error recovery. Use synchronization to the next `;` on error.

<details>
<summary>Solution</summary>

```c
#include <stdio.h>
#include <stdbool.h>

typedef enum { T_ID, T_NUM, T_ASSIGN, T_PLUS,
               T_SEMI, T_EOF, T_ERROR } TokenType;

typedef struct { TokenType type; int value; char name[32]; } Token;

Token current;
bool had_error = false;

void advance(void);
void error(const char *msg);
void synchronize(void);
int parse_expr(void);

void parse_assignment(void) {
    if (current.type != T_ID) {
        error("expected identifier");
        synchronize();
        return;
    }
    char name[32];
    strcpy(name, current.name);
    advance();

    if (current.type != T_ASSIGN) {
        error("expected '='");
        synchronize();
        return;
    }
    advance();

    int value = parse_expr();

    if (current.type != T_SEMI) {
        error("expected ';' after assignment");
        /* Don't synchronize — just continue */
    } else {
        advance();
    }

    if (!had_error)
        printf("%s = %d\n", name, value);
    had_error = false;
}

void synchronize(void) {
    while (current.type != T_SEMI && current.type != T_EOF) {
        advance();
    }
    if (current.type == T_SEMI) advance();
    had_error = false;
}
```

</details>

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Panic mode | Discard tokens to synchronizing point; simple and robust |
| Phrase-level | Local correction (insert/delete/replace tokens) |
| Error productions | Grammar rules matching common mistakes |
| Bison `error` token | Built-in panic-mode recovery mechanism |
| `yyerrok` | Reset error state to resume normal parsing |
| Three-token rule | Suppress cascading errors until 3 tokens shifted |
| Good messages | Show location, context, expected alternatives, fix-its |

A compiler that gives clear, plentiful error messages in one pass is a compiler programmers love to use.
