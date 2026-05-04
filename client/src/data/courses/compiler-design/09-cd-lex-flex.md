---
title: "Lexer Generators: Lex and Flex"
---

# Lexer Generators: Lex and Flex

Writing a lexer by hand gives you full control, but for many languages and tools, it's faster and less error-prone to **generate** a lexer automatically from a specification. Lex (and its modern replacement Flex) are the classic tools for this job. You write patterns and actions; the tool produces efficient C code.

---

## What Is Lex/Flex?

**Lex** (1975, AT&T Bell Labs) was the first widely-used lexer generator. You provide:
1. A set of regular expression patterns
2. An action (C code) for each pattern

Lex converts this into a C source file containing a complete, optimized DFA-based scanner.

**Flex** ("Fast Lex", 1987) is the open-source replacement:
- 100% compatible with Lex specifications
- Generates faster scanners (direct-coded instead of table-driven)
- Better error handling and debugging options
- Available on all Unix/Linux systems

### Installation

```
# Ubuntu/Debian
sudo apt install flex

# macOS (with Homebrew)
brew install flex

# Check version
flex --version
```

---

## Lex File Structure

A Lex/Flex specification file (conventionally `*.l` or `*.lex`) has three sections separated by `%%`:

```c
%{
/* Section 1: C Declarations */
/* #includes, global variables, function prototypes */
#include <stdio.h>
#include <stdlib.h>

int line_count = 0;
%}

/* Section 1 continued: Definitions */
/* Named regex patterns for reuse */
DIGIT    [0-9]
LETTER   [a-zA-Z]
ID       {LETTER}({LETTER}|{DIGIT}|_)*

%%
/* Section 2: Rules */
/* pattern    { action } */

{DIGIT}+        { printf("INTEGER: %s\n", yytext); }
{ID}            { printf("IDENTIFIER: %s\n", yytext); }
\n              { line_count++; }
[ \t]           { /* skip whitespace */ }
.               { printf("UNKNOWN: %s\n", yytext); }

%%
/* Section 3: User Code */
/* Additional C functions */

int main(int argc, char *argv[]) {
    yylex();  /* Start scanning */
    printf("Lines: %d\n", line_count);
    return 0;
}
```

---

## Section 1: Declarations and Definitions

### C Code Block (`%{ ... %}`)

Any C code between `%{` and `%}` is copied verbatim to the generated scanner:

```c
%{
#include <stdio.h>
#include <string.h>
#include "tokens.h"  /* Token type definitions */

int yycolumn = 1;

/* Forward declarations */
void update_location(void);
%}
```

### Definitions (Named Patterns)

Named patterns make complex rules readable:

```c
/* Character classes */
DIGIT       [0-9]
HEXDIGIT    [0-9a-fA-F]
LETTER      [a-zA-Z]
ALPHA       [a-zA-Z_]
ALNUM       [a-zA-Z0-9_]

/* Token patterns (reusable) */
INTEGER     {DIGIT}+
HEX         0[xX]{HEXDIGIT}+
FLOAT       {DIGIT}+"."{DIGIT}+([eE][+-]?{DIGIT}+)?
IDENT       {ALPHA}{ALNUM}*
STRING      \"([^"\\]|\\.)*\"
```

Use `{NAME}` in rules to reference a definition.

### Start Conditions (States)

You can define exclusive or inclusive scanner states:

```c
%x COMMENT      /* Exclusive state: only COMMENT rules active */
%s PREPROC      /* Inclusive state: PREPROC rules + default rules */
```

---

## Section 2: Rules

The heart of a Lex specification. Each rule is a regex pattern followed by a C action in braces:

```c
%%
/* Keywords */
"if"            { return TOKEN_IF; }
"else"          { return TOKEN_ELSE; }
"while"         { return TOKEN_WHILE; }
"for"           { return TOKEN_FOR; }
"return"        { return TOKEN_RETURN; }
"int"           { return TOKEN_INT; }
"float"         { return TOKEN_FLOAT_TYPE; }
"void"          { return TOKEN_VOID; }

/* Literals */
{INTEGER}       { yylval.int_val = atoi(yytext); return TOKEN_INTEGER; }
{FLOAT}         { yylval.float_val = atof(yytext); return TOKEN_FLOAT; }
{STRING}        { yylval.str_val = strdup(yytext); return TOKEN_STRING; }

/* Identifiers (after keywords!) */
{IDENT}         { yylval.str_val = strdup(yytext); return TOKEN_IDENT; }

/* Operators */
"=="            { return TOKEN_EQ; }
"!="            { return TOKEN_NEQ; }
"<="            { return TOKEN_LEQ; }
">="            { return TOKEN_GEQ; }
"&&"            { return TOKEN_AND; }
"||"            { return TOKEN_OR; }
"="             { return TOKEN_ASSIGN; }
"+"             { return TOKEN_PLUS; }
"-"             { return TOKEN_MINUS; }
"*"             { return TOKEN_STAR; }
"/"             { return TOKEN_SLASH; }
"<"             { return TOKEN_LT; }
">"             { return TOKEN_GT; }
"!"             { return TOKEN_NOT; }

/* Delimiters */
"("             { return TOKEN_LPAREN; }
")"             { return TOKEN_RPAREN; }
"{"             { return TOKEN_LBRACE; }
"}"             { return TOKEN_RBRACE; }
";"             { return TOKEN_SEMI; }
","             { return TOKEN_COMMA; }

/* Comments */
"//".*          { /* skip single-line comments */ }
"/*"            { BEGIN(COMMENT); }
<COMMENT>"*/"   { BEGIN(INITIAL); }
<COMMENT>.|\n   { /* skip comment content */ }

/* Whitespace */
[ \t\r]         { /* skip */ }
\n              { yylineno++; }

/* Error */
.               { fprintf(stderr, "Unknown char: %s\n", yytext); }
%%
```

### Key Variables in Actions

| Variable | Type | Description |
|----------|------|-------------|
| `yytext` | `char*` | Pointer to matched text |
| `yyleng` | `int` | Length of matched text |
| `yylineno` | `int` | Current line number (with `%option yylineno`) |
| `yyin` | `FILE*` | Input file (default: stdin) |
| `yyout` | `FILE*` | Output file (default: stdout) |
| `yylval` | union | Semantic value (used with Yacc/Bison) |

### Rule Ordering and Priority

Lex applies two rules for disambiguation:
1. **Longest match**: the pattern matching the most characters wins
2. **First match**: for equal-length matches, the first rule listed wins

This is why keywords must appear **before** the identifier pattern.

---

## Complete Example: Calculator Lexer

```c
%{
#include <stdio.h>
#include <stdlib.h>

typedef enum {
    TOK_NUM, TOK_PLUS, TOK_MINUS, TOK_STAR, TOK_SLASH,
    TOK_LPAREN, TOK_RPAREN, TOK_NEWLINE, TOK_EOF
} TokenType;

typedef struct {
    TokenType type;
    double value;
} Token;

Token current_token;
%}

%option noyywrap
%option yylineno

DIGIT   [0-9]
NUMBER  {DIGIT}+("."{DIGIT}+)?([eE][+-]?{DIGIT}+)?

%%

{NUMBER}    {
    current_token.type = TOK_NUM;
    current_token.value = atof(yytext);
    return TOK_NUM;
}
"+"         { current_token.type = TOK_PLUS;   return TOK_PLUS; }
"-"         { current_token.type = TOK_MINUS;  return TOK_MINUS; }
"*"         { current_token.type = TOK_STAR;   return TOK_STAR; }
"/"         { current_token.type = TOK_SLASH;  return TOK_SLASH; }
"("         { current_token.type = TOK_LPAREN; return TOK_LPAREN; }
")"         { current_token.type = TOK_RPAREN; return TOK_RPAREN; }
\n          { return TOK_NEWLINE; }
[ \t]       { /* skip whitespace */ }
.           { fprintf(stderr, "Error line %d: '%s'\n", yylineno, yytext); }

%%

int main(void) {
    int tok;
    printf("Calculator lexer. Enter expressions:\n");

    while ((tok = yylex()) != 0) {
        switch (tok) {
            case TOK_NUM:
                printf("  NUMBER(%g)\n", current_token.value);
                break;
            case TOK_PLUS:   printf("  PLUS\n"); break;
            case TOK_MINUS:  printf("  MINUS\n"); break;
            case TOK_STAR:   printf("  STAR\n"); break;
            case TOK_SLASH:  printf("  SLASH\n"); break;
            case TOK_LPAREN: printf("  LPAREN\n"); break;
            case TOK_RPAREN: printf("  RPAREN\n"); break;
            case TOK_NEWLINE: printf("  ---\n"); break;
        }
    }
    return 0;
}
```

### Build and Run

```
flex calculator.l          # Generates lex.yy.c
gcc lex.yy.c -o calc -lfl # Compile (link flex library)
echo "3.14 + 2 * (1 - 5)" | ./calc
```

**Output:**
```
Calculator lexer. Enter expressions:
  NUMBER(3.14)
  PLUS
  NUMBER(2)
  STAR
  LPAREN
  NUMBER(1)
  MINUS
  NUMBER(5)
  RPAREN
  ---
```

---

## How Lex Works Internally

When you run `flex scanner.l`, it performs these steps:

### 1. Parse the Specification

Read patterns and extract regex for each rule.

### 2. Convert Regex → NFA

Each pattern becomes an NFA using Thompson's construction.

### 3. Build Combined NFA

Merge all pattern NFAs with $\epsilon$-transitions from a common start state. Each accept state is labeled with the rule number (priority).

### 4. NFA → DFA (Subset Construction)

Convert to a deterministic automaton. Each DFA state is labeled with the **highest priority** accepting rule (if any).

### 5. Minimize DFA

Reduce states while preserving token distinctions.

### 6. Generate C Code

Output either:
- **Table-driven** (classic Lex): transition tables + interpreter loop
- **Direct-coded** (Flex): generated `switch`/`goto` statements

### Generated Code Structure

```c
/* Simplified view of Flex output */
int yylex(void) {
    while (1) {
        /* Reset to start state */
        int state = START_STATE;
        char *last_accept_pos = NULL;
        int last_accept_rule = -1;
        
        yytext = yy_current_pos;
        
        /* Scan until no transition */
        while (state != DEAD_STATE) {
            char c = *yy_current_pos++;
            state = yy_transition[state][c];
            
            if (yy_accept[state]) {
                last_accept_pos = yy_current_pos;
                last_accept_rule = yy_accept[state];
            }
        }
        
        /* Back up to last accepting position */
        yy_current_pos = last_accept_pos;
        yyleng = last_accept_pos - yytext;
        
        /* Execute the action for the matching rule */
        switch (last_accept_rule) {
            case 1: /* first pattern action */ break;
            case 2: /* second pattern action */ break;
            /* ... */
        }
    }
}
```

---

## Flex Options and Features

### Useful `%option` Directives

```c
%option noyywrap        /* Don't call yywrap() at EOF */
%option yylineno        /* Track line numbers automatically */
%option case-insensitive /* Case-insensitive matching */
%option nounput         /* Suppress unused function warning */
%option noinput         /* Suppress unused function warning */
%option reentrant       /* Generate reentrant (thread-safe) scanner */
%option prefix="my"     /* Rename yy* functions to my* */
%option debug           /* Enable debug tracing */
```

### Start Conditions (Scanner States)

Handle context-dependent scanning:

```c
%x STRING_STATE
%x COMMENT_STATE

%%

\"                      { BEGIN(STRING_STATE); }
<STRING_STATE>[^"\\]+   { /* append to string buffer */ }
<STRING_STATE>\\n       { /* append newline */ }
<STRING_STATE>\\\"      { /* append literal quote */ }
<STRING_STATE>\"        { BEGIN(INITIAL); return TOK_STRING; }

"/*"                    { BEGIN(COMMENT_STATE); }
<COMMENT_STATE>"*/"     { BEGIN(INITIAL); }
<COMMENT_STATE>.|\n     { /* discard */ }

%%
```

`BEGIN(STATE)` switches the scanner to only match rules prefixed with `<STATE>`.

### Multiple Input Files

```c
int main(int argc, char *argv[]) {
    for (int i = 1; i < argc; i++) {
        FILE *f = fopen(argv[i], "r");
        if (!f) { perror(argv[i]); continue; }
        
        yyin = f;          /* Set input file */
        yyrestart(f);      /* Reset scanner state */
        yylex();           /* Scan the file */
        fclose(f);
    }
    return 0;
}
```

---

## Flex Improvements Over Lex

| Feature | Lex | Flex |
|---------|-----|------|
| Speed | Table-driven | Direct-coded (2-3× faster) |
| Table compression | Basic | Multiple compression methods |
| Reentrant scanners | No | Yes (`%option reentrant`) |
| C++ class output | No | Yes (`%option c++`) |
| Start condition stacks | No | Yes (`yy_push_state()`) |
| Debug mode | No | Yes (`%option debug`) |
| POSIX compliance | Partial | Full |
| Interactive mode | No | Yes (`%option interactive`) |

---

## Modern Alternatives

While Flex is still widely used, newer tools offer advantages:

| Tool | Approach | Used By |
|------|----------|---------|
| **re2c** | Direct code generation (no tables) | PHP lexer |
| **Ragel** | State machines, multiple output languages | Networking parsers |
| **ANTLR** | Target-language independent lexer+parser | Many IDEs, tools |

```c
/* re2c example — embeds directly in C code */
/*!re2c
    re2c:define:YYCTYPE = char;
    re2c:yyfill:enable = 0;
    
    [0-9]+      { return TOK_NUMBER; }
    [a-zA-Z_]+  { return TOK_IDENT; }
    [ \t\n]     { goto start; }
    *           { return TOK_ERROR; }
*/
```

---

## Integration with Parsers (Preview)

In a real compiler, the lexer feeds tokens to the parser. Lex/Flex are designed to integrate with Yacc/Bison:

### Lex Side (scanner.l)

```c
%{
#include "parser.tab.h"  /* Token definitions from Bison */
%}

%%
"if"    { return IF; }
"else"  { return ELSE; }
[0-9]+  { yylval.num = atoi(yytext); return NUMBER; }
[a-z]+  { yylval.str = strdup(yytext); return IDENT; }
%%
```

### Bison Side (parser.y)

```c
%token IF ELSE NUMBER IDENT

%union {
    int num;
    char *str;
}

%type <num> NUMBER
%type <str> IDENT
```

The parser calls `yylex()` each time it needs the next token. We'll cover this integration fully in the parsing lessons.

---

## Common Pitfalls

### 1. Missing `noyywrap`

Without `%option noyywrap`, Flex calls `yywrap()` at EOF. You must either:
- Define `int yywrap(void) { return 1; }`, or
- Add `%option noyywrap`

### 2. Rule Order for Keywords

```c
/* WRONG: identifier matches keywords too */
[a-z]+      { return IDENT; }
"if"        { return IF; }     /* Never reached! */

/* RIGHT: keywords first, or use longest-match */
"if"        { return IF; }
[a-z]+      { return IDENT; }
```

Actually, Lex's longest-match rule handles `"if"` vs `[a-z]+` correctly when both match 2 characters (first-listed wins). But clarity demands putting keywords first.

### 3. Greedy Dot-Star

```c
/* WRONG: matches across multiple strings */
\".*\"      { return STRING; }

/* RIGHT: match non-quote characters */
\"[^"]*\"   { return STRING; }
```

### 4. Unmatched Input

Always include a catch-all rule at the end:
```c
.           { fprintf(stderr, "Unexpected: '%c'\n", yytext[0]); }
```

Without this, Flex uses a default rule that copies unmatched characters to stdout — confusing behavior.

---

## Building a Flex Project

### Makefile

```makefile
CC = gcc
FLEX = flex
CFLAGS = -Wall -O2

scanner: lex.yy.c
	$(CC) $(CFLAGS) -o scanner lex.yy.c -lfl

lex.yy.c: scanner.l
	$(FLEX) scanner.l

clean:
	rm -f lex.yy.c scanner

.PHONY: clean
```

### Build Steps

```
flex scanner.l       # Produces lex.yy.c
gcc lex.yy.c -o scanner -lfl
./scanner < input.txt
```

The `-lfl` flag links the Flex library (provides default `main()` and `yywrap()`). With `%option noyywrap` and your own `main()`, you can omit it.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Lex/Flex purpose | Auto-generate scanner from regex specs |
| File structure | Declarations `%%` Rules `%%` User code |
| Pattern matching | Longest match + first-listed priority |
| Key variables | `yytext`, `yyleng`, `yylineno` |
| Start conditions | Scanner states for context-dependent tokens |
| Internal mechanism | Regex → NFA → DFA → C code |
| Modern alternatives | re2c, Ragel, ANTLR |
| Integration | Designed to work with Yacc/Bison parsers |

---

## Exercises

1. Write a complete Flex specification for a JSON lexer. It should recognize: strings, numbers (integer and float), `true`, `false`, `null`, `{`, `}`, `[`, `]`, `:`, `,`.

2. Add start conditions to handle nested block comments (where `/* ... /* ... */ ... */` is one comment). Hint: maintain a nesting counter.

3. Write a Flex specification that counts the number of words, lines, and characters in input (like a simplified `wc` command).

4. Create a Flex lexer for Python-like indentation. Use a stack of indentation levels and emit INDENT/DEDENT tokens when the level changes.

5. Compare the generated `lex.yy.c` file sizes for a simple vs complex lexer specification. Measure the generated scanner's performance on a 1MB input file.

6. Write a Flex specification that handles C-style string literals with all escape sequences: `\n`, `\t`, `\\`, `\"`, `\0`, `\x41`, `\077` (octal).

7. Install re2c and rewrite the calculator lexer from this lesson using re2c syntax. Compare the generated code size and scanning speed with the Flex version.
