---
title: Introduction to Lexical Analysis
---

# Introduction to Lexical Analysis

**Lexical analysis** (or **scanning**) is the first phase of compilation. It reads the raw source code — a stream of individual characters — and groups them into meaningful sequences called **tokens**. Think of it as breaking a sentence into words before you can understand its grammar.

---

## What Does the Lexer Do?

$$
\text{Character Stream} \xrightarrow{\text{Lexer}} \text{Token Stream}
$$

The lexer (also called scanner or tokenizer):
1. Reads characters one at a time from the source file
2. Groups characters into **lexemes** (meaningful substrings)
3. Classifies each lexeme into a **token category**
4. Attaches relevant **attributes** (value, position)
5. Discards irrelevant characters (whitespace, comments)
6. Reports lexical errors

### Analogy

Think of reading English text. Before you can understand a sentence's grammar (syntax), your brain first identifies individual words and punctuation:

```
"The cat sat." → ["The", "cat", "sat", "."]
```

Similarly, before the parser can understand program structure, the lexer identifies individual tokens:

```c
int x = 42; → [INT, ID("x"), ASSIGN, NUM(42), SEMI]
```

---

## Key Terminology

### Token

A **token** is a pair: (token-type, optional-attribute). It represents a category of lexemes.

$$
\text{Token} = (\text{type}, \text{attribute})
$$

Examples:
- `(ID, "count")` — identifier with name "count"
- `(NUM, 42)` — numeric literal with value 42
- `(KEYWORD, "if")` — keyword
- `(PLUS, null)` — the `+` operator (no extra attribute needed)

### Lexeme

A **lexeme** is the actual sequence of characters in the source code that matches a token pattern.

| Source text | Lexeme | Token |
|---|---|---|
| `count` | `count` | ID("count") |
| `42` | `42` | NUM(42) |
| `>=` | `>=` | GEQ |
| `"hello"` | `"hello"` | STRING("hello") |
| `while` | `while` | KEYWORD_WHILE |

### Pattern

A **pattern** is a rule (typically a regular expression) that describes the set of lexemes belonging to a token type.

| Token Type | Pattern (regex) | Matching Lexemes |
|---|---|---|
| ID | `[a-zA-Z_][a-zA-Z0-9_]*` | `x`, `count`, `myVar`, `_temp` |
| NUM | `[0-9]+` | `0`, `42`, `100`, `99999` |
| FLOAT | `[0-9]+\.[0-9]+` | `3.14`, `0.5`, `100.0` |
| STRING | `"[^"]*"` | `"hello"`, `""`, `"foo bar"` |

### Relationship

$$
\text{Pattern} \xrightarrow{\text{describes}} \text{Lexeme} \xrightarrow{\text{classified as}} \text{Token}
$$

A single **pattern** matches many **lexemes**, and all those lexemes produce tokens of the same **type**.

---

## Token Categories

Every programming language defines a set of token categories. Here are the common ones:

### 1. Keywords (Reserved Words)

Words with special meaning that cannot be used as identifiers:

```c
// C keywords:
if    else   while   for     do
int   float  char    void    return
struct union  enum   typedef const
break continue switch case   default
```

Keywords are recognized by the lexer: when the scanner sees `while`, it returns `KEYWORD_WHILE` rather than `ID("while")`.

### 2. Identifiers

Names given by the programmer to variables, functions, types, etc:

```c
count       // variable name
calculateSum // function name
Node        // type/class name
MAX_SIZE    // constant name
_internal   // internal name
```

Pattern: `[a-zA-Z_][a-zA-Z0-9_]*`

The lexer checks: is this identifier actually a keyword? If yes → keyword token. If no → identifier token.

### 3. Literals (Constants)

Fixed values written directly in the code:

```c
// Integer literals
42          // decimal
0xFF        // hexadecimal
0b1010      // binary
0777        // octal

// Floating-point literals
3.14        // standard
2.5e10      // scientific notation
1.0f        // float suffix

// String literals
"hello"     // regular string
"line1\nline2"  // with escape sequences

// Character literals
'a'         // single character
'\n'        // escape sequence
'\x41'      // hex escape (= 'A')

// Boolean literals
true
false
```

### 4. Operators

Symbols representing operations:

```c
// Arithmetic
+   -   *   /   %

// Relational
<   >   <=  >=  ==  !=

// Logical
&&  ||  !

// Bitwise
&   |   ^   ~   <<  >>

// Assignment
=   +=  -=  *=  /=  %=  &=  |=  ^=  <<=  >>=

// Other
++  --  ->  .   ?   :
```

### 5. Punctuation (Delimiters)

Structural symbols:

```c
(   )       // parentheses
{   }       // braces
[   ]       // brackets
;           // statement terminator
,           // separator
```

### 6. Whitespace and Comments (Usually Discarded)

```c
// Whitespace: spaces, tabs, newlines
int    x   =   42;    // same as: int x=42;

// Single-line comment
// This is a comment

// Multi-line comment
/* This spans
   multiple lines */
```

The lexer **discards** these but may use newlines for:
- Tracking line numbers (for error messages)
- Languages where newlines are significant (Python, Go)

---

## Why Separate Lexical Analysis from Parsing?

You might ask: why not let the parser handle characters directly? There are three compelling reasons:

### 1. Simpler Design

**Lexing** deals with **regular languages** (simple patterns):
- Matching keywords, numbers, operators
- Described by regular expressions
- Recognized by finite automata (fast, no stack needed)

**Parsing** deals with **context-free languages** (nested structures):
- Matching balanced brackets, if-else, expressions
- Described by context-free grammars
- Recognized by pushdown automata (need a stack)

Separating them keeps each component simpler:

$$
\text{Regular (Type 3)} \subset \text{Context-Free (Type 2)}
$$

### 2. Efficiency

Finite automata (used by lexers) are **extremely fast** — they process each character in $O(1)$ time with no backtracking (for DFAs):

$$
\text{Lexer time complexity: } O(n) \text{ where } n = \text{source length}
$$

If the parser had to process individual characters, it would be much slower because parsing algorithms have higher per-symbol overhead.

### 3. Portability

Character-set handling (ASCII vs Unicode, line endings, encoding) is isolated in the lexer. The parser sees a clean token stream regardless of:
- Whether the source uses `\r\n` or `\n` line endings
- Whether identifiers use Unicode (e.g., `변수` in some languages)
- Whether the file is UTF-8 or UTF-16 encoded

---

## Token Attributes

Tokens carry attributes beyond just their type. These attributes are essential for later phases.

### Position (Line and Column)

Every token records where it appeared in the source file:

```c
Token(INT,    "int",    line=1, col=1)
Token(ID,     "main",   line=1, col=5)
Token(LPAREN, "(",      line=1, col=9)
```

This information is used for:
- **Error messages**: "Error at line 42, column 15"
- **Debugging**: mapping compiled code back to source
- **IDE features**: go-to-definition, hover information

### Value (For Literals)

Literal tokens carry their computed value:

```c
Token(NUM_INT,   "42",     value=42)
Token(NUM_FLOAT, "3.14",   value=3.14)
Token(STRING,    "\"hi\"", value="hi")     // quotes stripped
Token(CHAR,      "'\\n'",  value=10)       // newline = ASCII 10
```

The value is the **semantic meaning** of the lexeme, with syntactic sugar (quotes, escapes) resolved.

### Symbol Table Pointer (For Identifiers)

When the lexer sees an identifier, it enters it into (or looks it up in) the symbol table:

```c
Token(ID, "count", symtab_entry=&symbol_table["count"])
```

This allows later phases to quickly access information about the identifier (type, scope, memory location).

---

## Detailed Example: Tokenizing Real Code

Let's tokenize this C code fragment completely:

```c
if (count > 10) { total = count * price; }
```

### Character-by-Character Processing

The lexer reads: `i`, `f`, ` `, `(`, `c`, `o`, `u`, `n`, `t`, ` `, `>`, ` `, `1`, `0`, `)`, ...

### Resulting Token Stream

| # | Lexeme | Token Type | Attribute |
|---|--------|-----------|-----------|
| 1 | `if` | KEYWORD_IF | — |
| 2 | `(` | LPAREN | — |
| 3 | `count` | ID | name="count" |
| 4 | `>` | GT | — |
| 5 | `10` | NUM_INT | value=10 |
| 6 | `)` | RPAREN | — |
| 7 | `{` | LBRACE | — |
| 8 | `total` | ID | name="total" |
| 9 | `=` | ASSIGN | — |
| 10 | `count` | ID | name="count" |
| 11 | `*` | STAR | — |
| 12 | `price` | ID | name="price" |
| 13 | `;` | SEMI | — |
| 14 | `}` | RBRACE | — |

Notice:
- Whitespace between tokens is **discarded** (no whitespace tokens)
- `if` is recognized as a **keyword**, not an identifier
- `count` appears twice and gets the same token type and attribute both times
- `>` is a single-character operator (no lookahead needed here)

---

## Lookahead and the Maximal Munch Rule

### The Lookahead Problem

Sometimes the lexer can't determine the token from the current character alone. It needs to look at the **next character(s)**:

```c
< vs <= vs << vs <<=
```

When the lexer sees `<`, it doesn't know yet if the token is:
- `<` (less-than)
- `<=` (less-than-or-equal)
- `<<` (left-shift)
- `<<=` (left-shift-assign)

It must read ahead to decide.

### Examples of Lookahead

| Current | Next char(s) | Token |
|---------|-------------|-------|
| `<` | `=` | `<=` (LEQ) |
| `<` | `<` | `<<` (LSHIFT) |
| `<` | other | `<` (LT) |
| `=` | `=` | `==` (EQ) |
| `=` | other | `=` (ASSIGN) |
| `+` | `+` | `++` (INCREMENT) |
| `+` | `=` | `+=` (PLUS_ASSIGN) |
| `+` | other | `+` (PLUS) |
| `/` | `/` | `//` (line comment start) |
| `/` | `*` | `/*` (block comment start) |
| `/` | other | `/` (DIVIDE) |

### The Maximal Munch Rule

When multiple token patterns could match starting at the same position, the lexer always matches the **longest possible token**. This is called **maximal munch** (or longest match):

$$
\text{Maximal Munch: always prefer the longest matching lexeme}
$$

Examples:
- `<=` is one LEQ token, not `<` followed by `=`
- `iffy` is one identifier, not keyword `if` followed by identifier `fy`
- `3.14` is one float, not integer `3`, dot, integer `14`
- `returnx` is one identifier, not keyword `return` followed by `x`

```c
// Maximal munch in action:
int ifx = 5;    // "ifx" is an identifier, not "if" + "x"
int x = 123;    // "123" is one number, not "12" + "3"
```

### Priority Rules

When two patterns match the **same length**, priority rules decide:
1. **Keywords over identifiers**: `if` matches both keyword and identifier patterns → choose keyword
2. **Earlier rule wins**: in Lex/Flex, rules listed first have priority

```c
// In a Lex specification:
"if"        { return KEYWORD_IF; }      // Rule 1
[a-z]+      { return IDENTIFIER; }      // Rule 2
// "if" matches both rules with same length → Rule 1 wins (listed first)
```

---

## Lexical Errors

The lexer detects errors that violate token-level rules:

### Types of Lexical Errors

| Error | Example | Explanation |
|-------|---------|-------------|
| Invalid character | `int x = 5 @ 3;` | `@` is not valid in C |
| Unterminated string | `"hello` | Missing closing quote |
| Unterminated comment | `/* comment` | Missing `*/` |
| Malformed number | `3.14.15` | Double decimal point |
| Invalid escape | `"\z"` | `\z` not a valid escape |
| Number too large | `99999999999999999999` | Exceeds max literal value |

### Error Recovery Strategies

When the lexer encounters an error, it can:

1. **Panic mode**: skip characters until a valid token can start
2. **Delete a character**: remove one character and retry
3. **Insert a character**: insert a missing character (e.g., closing quote)
4. **Replace a character**: substitute one character for another
5. **Report and continue**: flag the error but produce a "best guess" token

```c
// Error recovery example:
// Source: int x = 5 @ 3;
//                   ^
// Error: unexpected character '@'
// Recovery: skip '@', continue scanning '3'
// Result: [INT, ID("x"), ASSIGN, NUM(5), ERROR('@'), NUM(3), SEMI]
```

Good error recovery lets the compiler find **multiple errors** in one pass, rather than stopping at the first problem.

---

## Implementation Approaches

There are three main ways to implement a lexer:

### 1. Hand-Coded Scanner

Write the lexer manually using `switch` statements and loops:

```c
Token getNextToken() {
    char c = nextChar();
    
    // Skip whitespace
    while (isspace(c)) c = nextChar();
    
    // Identifiers and keywords
    if (isalpha(c) || c == '_') {
        char buffer[256];
        int i = 0;
        while (isalnum(c) || c == '_') {
            buffer[i++] = c;
            c = nextChar();
        }
        buffer[i] = '\0';
        ungetChar(c);  // push back the non-matching char
        
        // Check if it's a keyword
        if (strcmp(buffer, "if") == 0) return makeToken(KEYWORD_IF);
        if (strcmp(buffer, "while") == 0) return makeToken(KEYWORD_WHILE);
        // ... more keywords ...
        
        return makeToken(IDENTIFIER, buffer);
    }
    
    // Numbers
    if (isdigit(c)) {
        int value = 0;
        while (isdigit(c)) {
            value = value * 10 + (c - '0');
            c = nextChar();
        }
        ungetChar(c);
        return makeToken(NUM_INT, value);
    }
    
    // Operators and punctuation
    switch (c) {
        case '+': return makeToken(PLUS);
        case '-': return makeToken(MINUS);
        case '*': return makeToken(STAR);
        case '=':
            if (peekChar() == '=') {
                nextChar();
                return makeToken(EQ);
            }
            return makeToken(ASSIGN);
        case '<':
            if (peekChar() == '=') {
                nextChar();
                return makeToken(LEQ);
            }
            return makeToken(LT);
        // ... more cases ...
    }
    
    // Error: unrecognized character
    reportError("unexpected character '%c'", c);
    return makeToken(ERROR);
}
```

**Pros**: full control, can be very fast, easy to debug
**Cons**: tedious for complex token sets, easy to make mistakes

### 2. Table-Driven (DFA) Scanner

Encode the DFA transitions in a table, then execute a generic driver:

```c
// DFA transition table (simplified)
// state × input → next_state
int transition[NUM_STATES][NUM_CHARS] = {
    // state 0: start state
    ['a'...'z'] = 1,   // go to identifier state
    ['0'...'9'] = 2,   // go to number state
    ['+'] = 3,         // go to plus state
    // ...
};

int accepting[NUM_STATES] = {
    [1] = TOKEN_ID,
    [2] = TOKEN_NUM,
    [3] = TOKEN_PLUS,
    // ...
};

Token scan() {
    int state = 0;
    while (true) {
        char c = nextChar();
        int next = transition[state][c];
        if (next == ERROR_STATE) break;
        state = next;
    }
    return makeToken(accepting[state]);
}
```

**Pros**: systematic, generated from regex specs, guaranteed correct
**Cons**: large tables, harder to hand-write

### 3. Generated Scanner (Lex/Flex)

Write token patterns declaratively, let a tool generate the implementation:

```c
%{
#include "tokens.h"
%}

%%
"if"            { return KEYWORD_IF; }
"while"         { return KEYWORD_WHILE; }
"return"        { return KEYWORD_RETURN; }
[a-zA-Z_][a-zA-Z0-9_]*  { return IDENTIFIER; }
[0-9]+          { return NUM_INT; }
[0-9]+\.[0-9]+  { return NUM_FLOAT; }
\"[^"]*\"       { return STRING; }
"+"             { return PLUS; }
"-"             { return MINUS; }
"*"             { return STAR; }
"/"             { return SLASH; }
"=="            { return EQ; }
"!="            { return NEQ; }
"<="            { return LEQ; }
">="            { return GEQ; }
"<"             { return LT; }
">"             { return GT; }
"="             { return ASSIGN; }
"("             { return LPAREN; }
")"             { return RPAREN; }
"{"             { return LBRACE; }
"}"             { return RBRACE; }
";"             { return SEMI; }
","             { return COMMA; }
[ \t\n]+        { /* skip whitespace */ }
"//".*          { /* skip line comment */ }
.               { reportError("unexpected: %s", yytext); }
%%
```

**Pros**: declarative, hard to get wrong, handles edge cases
**Cons**: generated code can be hard to debug, external dependency

---

## The Lexer's Interface

The lexer provides a simple interface to the parser:

```c
// The parser calls this repeatedly:
Token nextToken();

// Each call returns the next token in the source.
// When the source is exhausted, returns EOF token.
```

This is a **pull interface** — the parser asks for tokens one at a time, and the lexer produces them on demand. This is memory-efficient: the entire source doesn't need to be tokenized upfront.

```python
# Python pseudocode showing the lexer-parser interaction:
def parse():
    token = lexer.next_token()  # Get first token
    while token.type != EOF:
        # Parser uses token to build AST
        process(token)
        token = lexer.next_token()  # Get next token
```

---

## Handling Special Cases

### String Literals with Escape Sequences

```c
"hello\nworld\t\"quoted\""
```

The lexer must:
1. Recognize the opening `"`
2. Process escape sequences (`\n` → newline, `\t` → tab, `\"` → quote)
3. Detect the closing `"` (not escaped)
4. Return the processed string value

### Nested Comments

Some languages allow nested comments:

```c
/* outer /* inner */ still comment */
```

A simple regex can't match nested structures (that requires context-free power). The lexer handles this with a **counter**:

```c
int depth = 0;
// When we see "/*": depth++
// When we see "*/": depth--
// Continue scanning while depth > 0
```

### Context-Sensitive Tokens

Some tokens mean different things in different contexts:

```c
// In C++:
vector<vector<int>>   // >> could be two '>' or right-shift '>>'
// Modern C++ resolves this in the parser, not the lexer.

// In Python:
// Indentation level determines INDENT/DEDENT tokens
// The lexer tracks a stack of indentation levels
```

---

## Performance Considerations

The lexer processes **every character** of the source file, so it must be fast:

$$
\text{Lexer processes } O(n) \text{ characters where } n = |source|
$$

Optimization techniques:
- **Buffer the input**: read large blocks from disk, scan from memory
- **Minimize per-character work**: DFA transitions are a single table lookup
- **Avoid string copies**: use start/end pointers into the source buffer
- **Perfect hashing for keywords**: $O(1)$ keyword recognition

In practice, lexing is rarely the bottleneck — it typically consumes < 5% of total compilation time.

---

## Summary

| Concept | Definition |
|---------|-----------|
| Lexical analysis | Breaking source into tokens (first compiler phase) |
| Token | (type, attribute) pair representing a lexeme category |
| Lexeme | Actual character sequence matching a pattern |
| Pattern | Rule (regex) describing valid lexemes for a token type |
| Maximal munch | Always match the longest possible token |
| Lookahead | Reading ahead to determine token boundaries |
| Lexical error | Invalid characters, unterminated strings, etc. |

---

## Key Formulas

The theoretical foundation of lexical analysis:

$$
\text{Regular Expression} \xrightarrow{\text{Thompson}} \text{NFA} \xrightarrow{\text{Subset Construction}} \text{DFA} \xrightarrow{\text{Minimization}} \text{Minimal DFA}
$$

This pipeline converts human-readable regex patterns into the optimal machine (DFA) for recognizing tokens. We'll explore each step in the upcoming lessons.

---

## What's Next

In the next lesson, we'll dive into **Regular Expressions** — the mathematical formalism used to specify token patterns. You'll learn how to precisely describe what identifiers, numbers, and operators look like using the algebra of regular languages.
