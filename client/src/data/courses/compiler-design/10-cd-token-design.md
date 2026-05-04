---
title: Token Design and Attributes
---

# Token Design and Attributes

Designing the right set of tokens is a crucial early decision in compiler construction. Tokens are the bridge between raw source text and structured parsing — get them wrong and the rest of the compiler suffers. This lesson covers how to design token sets, what attributes to attach, and how real languages handle tokenization.

---

## What Makes a Good Token Set?

A well-designed token set has these properties:

| Property | Description |
|----------|-------------|
| **Complete** | Every valid source character sequence maps to some token |
| **Unambiguous** | No character sequence maps to multiple token types |
| **Minimal** | Don't create distinctions the parser doesn't need |
| **Informative** | Carry enough information for later stages |
| **Efficient** | Can be recognized quickly by the scanner |

The key trade-off: too few token types overloads the parser with work; too many complicates the lexer and grammar.

---

## Token Categories in Detail

### Keywords (Reserved Words)

Keywords are identifiers that the language reserves for special syntax:

```c
// C keywords (32 in C89, 44 in C11)
auto     break    case     char     const    continue
default  do       double   else     enum     extern
float    for      goto     if       inline   int
long     register restrict return   short    signed
sizeof   static   struct   switch   typedef  union
unsigned void     volatile while    _Bool    _Complex
```

**Design decisions:**
- Are keywords **case-sensitive**? (C: yes, SQL: no, Pascal: no)
- Can keywords be used as identifiers in some contexts? (Context-sensitive keywords in C#: `get`, `set`, `value`, `async`)
- How many? Too many burden programmers; too few require verbose alternatives

**Recognition strategy:** Keywords look like identifiers. The lexer scans the full word as an identifier, then checks against the keyword list:

$$\text{scan\_identifier}(s) = \begin{cases} \text{KEYWORD\_}x & \text{if } s \in \text{keywords} \\ \text{IDENTIFIER} & \text{otherwise} \end{cases}$$

### Identifiers

User-defined names for variables, functions, types, etc.

```c
// Typical identifier rules
// C/Java: [a-zA-Z_][a-zA-Z0-9_]*
// Python 3: includes Unicode letters
// Rust: [a-zA-Z_][a-zA-Z0-9_]* (raw identifiers: r#keyword)
// Haskell: lowercase start = value, uppercase start = type/constructor

int my_variable = 10;
float calculateArea(float radius);
struct LinkedList *head;
```

**Design decisions:**
- Maximum length? (Most modern languages: unlimited)
- Case sensitivity? (C/Java: yes; SQL/Pascal: no)
- Unicode support? (Python 3, Rust, Swift: yes)
- Special prefixes? (PHP `$var`, Ruby `@instance`, `@@class`)

### Integer Literals

Numbers without fractional parts:

```c
// Decimal
42
1000000
0

// Hexadecimal (prefix 0x or 0X)
0xFF
0X1A3F
0x0

// Octal (prefix 0 in C, 0o in Python/Rust)
0777        // C-style octal
0o777       // Python/Rust-style octal

// Binary (prefix 0b or 0B)
0b10101010
0B1111_0000   // With digit separators (C++14, Java, Python, Rust)
```

**Digit separators** improve readability:
```c
1_000_000       // One million (C++14, Python, Rust, Java)
0xFF_FF_FF_FF   // Hex with separators
0b1111_0000     // Binary with separators
```

**Type suffixes:**
```c
42L             // long
42LL            // long long
42U             // unsigned
42ULL           // unsigned long long
42i64           // Rust: 64-bit integer
```

**Regex for decimal integers:**
$$\text{INTEGER} = [1\text{-}9][0\text{-}9]^* \mid 0$$

**Regex for all integer formats:**
```
INTEGER = HEX | BINARY | OCTAL | DECIMAL
HEX     = 0[xX][0-9a-fA-F]([0-9a-fA-F_]*[0-9a-fA-F])?
BINARY  = 0[bB][01]([01_]*[01])?
OCTAL   = 0[oO]?[0-7]([0-7_]*[0-7])?
DECIMAL = [1-9]([0-9_]*[0-9])? | 0
```

### Floating-Point Literals

Numbers with fractional parts or exponents:

```c
// Basic float
3.14
0.5
100.0

// Scientific notation
1.5e10      // 1.5 × 10¹⁰
2.0E-3      // 2.0 × 10⁻³
6.022e23    // Avogadro's number

// Without leading/trailing digits (language-dependent)
.5          // 0.5 (allowed in C, not in some languages)
5.          // 5.0 (allowed in C)

// Type suffixes
3.14f       // float (not double) in C/C++
3.14d       // explicit double in some languages
3.14_f64    // Rust: 64-bit float
```

**Regex:**
```
FLOAT = DIGIT+ "." DIGIT+ EXPONENT?
      | DIGIT+ EXPONENT
      | "." DIGIT+ EXPONENT?

EXPONENT = [eE][+-]? DIGIT+
DIGIT    = [0-9]
```

**Tricky case — is `1.toString()` a float or method call?**
- JavaScript: `1.toString()` is an error, need `(1).toString()` or `1..toString()`
- Lexer sees `1.` and might greedily match a float

### String Literals

```c
// Basic strings
"hello world"
"line 1\nline 2"    // With escape sequences
""                   // Empty string

// Escape sequences
"\n"    // newline
"\t"    // tab
"\r"    // carriage return
"\\"    // backslash
"\""    // double quote
"\'"    // single quote
"\0"    // null character
"\x41"  // hex: character 'A'
"\101"  // octal: character 'A'
"\u0041"  // Unicode: character 'A'
"\U0001F600"  // Unicode: emoji 😀
```

**Multi-line strings:**
```python
# Python triple-quoted
"""
This is a
multi-line string
"""

# Rust raw strings
r#"No \escapes here"#
r##"Can contain "# inside"##
```

**String interpolation (affects lexing significantly):**
```python
# Python f-strings
f"Hello {name}, you are {age} years old"
# The lexer must handle nested expressions inside strings!
```

**Regex for simple strings:**
```
STRING = '"' ([^"\\] | '\\' .)* '"'
```

### Character Literals

```c
// Single characters
'a'
'Z'
'0'

// Escape sequences
'\n'    // newline
'\t'    // tab
'\\'    // backslash
'\''    // single quote
'\0'    // null
'\x41'  // hex: 'A'

// Unicode (in some languages)
'\u0041'    // Unicode code point
```

**Regex:**
```
CHAR = "'" ([^'\\] | "\\" .) "'"
```

### Operators and Punctuation

```c
// Arithmetic
+   -   *   /   %

// Comparison
==  !=  <   >   <=  >=

// Logical
&&  ||  !

// Bitwise
&   |   ^   ~   <<  >>

// Assignment
=   +=  -=  *=  /=  %=
&=  |=  ^=  <<= >>=

// Other
++  --          // Increment/decrement
->              // Arrow (pointer dereference in C, lambda in Java/C#)
.               // Member access
::              // Scope resolution (C++, Rust)
?   :           // Ternary
??              // Null coalescing (C#, JavaScript)
?.              // Optional chaining
...             // Spread/rest (JavaScript), range (Rust)
```

**Maximal munch for operators:**

Input `"x-->0"`:
- Tokens: `x`, `--`, `>`, `0` (not `x`, `-`, `->`, `0`)
- The lexer greedily takes `--` first (longest match from `-`)

This is why C requires a space in `a -- -b` vs `a - --b`.

### Special Tokens

```c
// End of file
TOKEN_EOF       // Signals end of input

// Newline (for whitespace-sensitive languages)
TOKEN_NEWLINE   // Python, Go (for automatic semicolons)

// Indentation (Python)
TOKEN_INDENT    // Indentation increased
TOKEN_DEDENT    // Indentation decreased

// Preprocessor (C/C++)
TOKEN_HASH      // Start of preprocessor directive
```

---

## Token Attributes

A token is more than just a type — it carries **attributes** that later compiler stages need.

### Literal Values

For numeric and string literals, store the actual value:

```c
typedef union {
    long long int_value;      // For integer literals
    double float_value;       // For float literals
    char *string_value;       // For string literals (heap allocated)
    char char_value;          // For character literals
} TokenValue;
```

**Why store the value?**
- The parser needs to build AST nodes with actual values
- Semantic analysis checks for overflow (`99999999999999` might not fit in `int`)
- Code generation emits the actual constant

### Symbol Table Entries

For identifiers, store a pointer to the symbol table entry:

```c
typedef struct {
    TokenType type;
    union {
        long long int_val;
        double float_val;
        char *str_val;
        struct SymbolEntry *sym;  // For identifiers
    } attr;
    SourceLocation loc;
} Token;
```

The lexer can create symbol table entries during scanning:
1. Scan identifier text
2. Look up in symbol table (hash table)
3. If not found, create new entry
4. Store pointer in token attribute

### Source Location

Every token should record where it came from:

```c
typedef struct {
    const char *filename;   // Source file name
    int line;               // Line number (1-based)
    int column;             // Column number (1-based)
    int offset;             // Byte offset from start of file
    int length;             // Length of token in bytes
} SourceLocation;
```

**Why track location?**
- Error messages: `"error at line 42, col 15: undeclared variable 'x'"`
- Debugger: map machine code back to source lines
- IDE features: go-to-definition, find-references
- Source maps: map minified/compiled code to original source

---

## Keyword Recognition Strategies

For a language with $k$ keywords, how do we efficiently check if an identifier is a keyword?

### Strategy 1: Perfect Hash Function

A **perfect hash function** maps $k$ keywords to $k$ distinct integers with no collisions:

$$h: \text{keywords} \to \{0, 1, \ldots, k-1\}$$

```c
// Generated by 'gperf' tool
// Input: list of keywords
// Output: C code with perfect hash function

static unsigned int hash(const char *str, int len) {
    static const unsigned char table[] = {
        /* ... generated lookup table ... */
    };
    return len + table[(unsigned char)str[0]]
               + table[(unsigned char)str[len-1]];
}

TokenType lookup_keyword(const char *str, int len) {
    if (len >= MIN_WORD_LENGTH && len <= MAX_WORD_LENGTH) {
        unsigned int key = hash(str, len);
        if (key <= MAX_HASH_VALUE) {
            const char *s = wordlist[key].name;
            if (s && *s == *str && !memcmp(s + 1, str + 1, len - 1)) {
                return wordlist[key].token_type;
            }
        }
    }
    return TOKEN_IDENTIFIER;
}
```

**Tool:** `gperf` generates perfect hash functions from keyword lists.

### Strategy 2: Trie (Nested Switch)

In practice, implemented as nested switches on first character (used by Clang):

```c
TokenType trie_lookup(const char *str, int len) {
    switch (str[0]) {
        case 'i':
            if (len == 2 && str[1] == 'f') return TOKEN_IF;
            if (len == 3 && str[1] == 'n' && str[2] == 't') return TOKEN_INT;
            break;
        case 'e':
            if (len == 4 && memcmp(str, "else", 4) == 0) return TOKEN_ELSE;
            break;
        case 'w':
            if (len == 5 && memcmp(str, "while", 5) == 0) return TOKEN_WHILE;
            break;
        case 'r':
            if (len == 6 && memcmp(str, "return", 6) == 0) return TOKEN_RETURN;
            break;
    }
    return TOKEN_IDENTIFIER;
}
```

### Strategy 3: Hash Table

A general-purpose hash table initialized with all keywords at startup. Lookup is $O(1)$ expected time with a good hash function.

### Comparison

| Strategy | Setup | Lookup Time | Space | Best For |
|----------|-------|-------------|-------|----------|
| Perfect hash | `gperf` tool | $O(1)$ | Minimal | Fixed keyword sets |
| Trie/switch | Manual | $O(k)$ | Code | Small keyword sets |
| Hash table | Init function | $O(1)$ avg | Dynamic | Large/changing sets |

---

## Token Representation in Code

### Enum for Token Types

```c
// tokens.h
typedef enum {
    // Single-character tokens
    TOKEN_LPAREN = 0, TOKEN_RPAREN, TOKEN_LBRACE, TOKEN_RBRACE,
    TOKEN_LBRACKET, TOKEN_RBRACKET,
    TOKEN_COMMA, TOKEN_DOT, TOKEN_SEMICOLON,
    TOKEN_PLUS, TOKEN_MINUS, TOKEN_STAR, TOKEN_SLASH, TOKEN_PERCENT,
    TOKEN_AMPERSAND, TOKEN_PIPE, TOKEN_CARET, TOKEN_TILDE,
    
    // One or two character tokens
    TOKEN_BANG, TOKEN_BANG_EQ,
    TOKEN_EQ, TOKEN_EQ_EQ,
    TOKEN_LT, TOKEN_LT_EQ, TOKEN_LT_LT,
    TOKEN_GT, TOKEN_GT_EQ, TOKEN_GT_GT,
    TOKEN_PLUS_PLUS, TOKEN_MINUS_MINUS,
    TOKEN_ARROW, TOKEN_DOT_DOT,
    
    // Literals
    TOKEN_IDENT,
    TOKEN_INT_LIT,
    TOKEN_FLOAT_LIT,
    TOKEN_STRING_LIT,
    TOKEN_CHAR_LIT,
    
    // Keywords
    TOKEN_IF, TOKEN_ELSE, TOKEN_WHILE, TOKEN_FOR, TOKEN_DO,
    TOKEN_RETURN, TOKEN_BREAK, TOKEN_CONTINUE,
    TOKEN_INT, TOKEN_FLOAT, TOKEN_CHAR, TOKEN_VOID,
    TOKEN_STRUCT, TOKEN_ENUM, TOKEN_TYPEDEF,
    TOKEN_CONST, TOKEN_STATIC, TOKEN_EXTERN,
    TOKEN_SIZEOF, TOKEN_NULL,
    
    // Special
    TOKEN_EOF,
    TOKEN_ERROR,
    
    TOKEN_COUNT  // Total number of token types
} TokenType;
```

### Token Struct with Attribute Union

```c
typedef struct {
    TokenType type;
    
    // Source location
    const char *file;
    int line;
    int col;
    
    // Lexeme (the actual text)
    const char *lexeme_start;
    int lexeme_length;
    
    // Semantic value (depends on token type)
    union {
        long long int_value;        // TOKEN_INT_LIT
        double float_value;         // TOKEN_FLOAT_LIT
        struct {
            char *data;
            int length;
        } string_value;             // TOKEN_STRING_LIT
        char char_value;            // TOKEN_CHAR_LIT
        int symbol_id;              // TOKEN_IDENT (symbol table index)
    } value;
} Token;
```

---

## Real-World Token Design Examples

### C Language Tokens

C has a relatively small, well-defined token set:

| Category | Count | Examples |
|----------|-------|---------|
| Keywords | 44 (C11) | `if`, `else`, `for`, `while`, `int`, `struct`, ... |
| Identifiers | 1 type | `my_var`, `printf`, `main` |
| Integer constants | 1 type | `42`, `0xFF`, `0b101`, `077` |
| Float constants | 1 type | `3.14`, `1e10`, `0.5f` |
| Char constants | 1 type | `'a'`, `'\n'`, `'\x41'` |
| String literals | 1 type | `"hello"`, `"line\n"` |
| Operators | ~45 | `+`, `-`, `*`, `->`, `<<=`, ... |
| Punctuators | ~10 | `(`, `)`, `{`, `}`, `;`, `,`, ... |

**Interesting C lexing challenges:**
- `0x` prefix makes hex; `0` prefix makes octal
- `L"wide string"` and `u8"utf8 string"` — letter prefixes on strings
- `->` is one token, but `- >` is two tokens
- Trigraphs: `??=` means `#` (thankfully deprecated)

### Python Tokens

Python has unique lexing requirements:

| Category | Notes |
|----------|-------|
| INDENT/DEDENT | Generated from indentation levels |
| NEWLINE | Significant (statement terminator) |
| String prefixes | `f""`, `r""`, `b""`, `rb""` |
| Decorators | `@` as a token |
| Walrus operator | `:=` (Python 3.8+) |
| Match/case | Soft keywords (Python 3.10+) |

```python
# Python's tokenize module output for: x = 42 + y
# NAME     'x'        (1, 0)  (1, 1)
# OP       '='        (1, 2)  (1, 3)
# NUMBER   '42'       (1, 4)  (1, 6)
# OP       '+'        (1, 7)  (1, 8)
# NAME     'y'        (1, 9)  (1, 10)
# NEWLINE  '\n'       (1, 10) (1, 11)
```

### JavaScript Tokens

JavaScript has context-dependent lexing:

| Challenge | Description |
|-----------|-------------|
| Regex vs division | `/regex/` vs `a / b` — depends on context! |
| Template literals | `` `hello ${expr} world` `` — nested lexing |
| ASI | Automatic Semicolon Insertion affects tokenization |
| Unicode identifiers | `const π = 3.14;` is valid |

This is why JavaScript lexers often need parser feedback (context-dependent scanning).

---

## Token Stream Representation

The output of the lexer is a **stream of tokens**. The most common approach is a **buffered stream** with bounded lookahead:

```c
#define LOOKAHEAD_MAX 3

typedef struct {
    Lexer lexer;
    Token buffer[LOOKAHEAD_MAX];
    int buffer_count;
} TokenStream;

Token peek_token(TokenStream *ts, int ahead) {
    while (ts->buffer_count <= ahead) {
        ts->buffer[ts->buffer_count++] = get_next_token(&ts->lexer);
    }
    return ts->buffer[ahead];
}

Token consume_token(TokenStream *ts) {
    Token tok = peek_token(ts, 0);
    for (int i = 1; i < ts->buffer_count; i++) {
        ts->buffer[i-1] = ts->buffer[i];
    }
    ts->buffer_count--;
    return tok;
}
```

Other approaches: **lazy iterator** (low memory, no lookahead) or **eager array** (random access, higher memory).

---

## Summary

| Aspect | Key Decisions |
|--------|--------------|
| Token categories | Keywords, identifiers, literals, operators, delimiters, specials |
| Integer formats | Decimal, hex, octal, binary, digit separators |
| Float formats | Decimal point, scientific notation, type suffixes |
| String formats | Escapes, raw strings, multi-line, interpolation |
| Attributes | Literal values, symbol table pointers, source location |
| Keyword lookup | Perfect hash, trie, or hash table |
| Representation | Enum type + union value + source location |
| Token stream | Lazy iterator, eager array, or buffered stream |

Good token design serves the **entire** compiler pipeline:
- Lexer: tokens are recognizable by regex / finite automata
- Parser: tokens provide right level of abstraction for grammar rules
- Semantic analysis: token attributes carry needed information
- Error reporting: source locations enable helpful messages

---

## Exercises

1. Design a token set for a subset of SQL. Include: `SELECT`, `FROM`, `WHERE`, `AND`, `OR`, `INSERT`, `UPDATE`, `DELETE`, identifiers, integer literals, string literals (`'single-quoted'`), comparison operators, `*`, `,`, `.`, `(`, `)`, `;`.

2. Implement a perfect hash function (by hand or using `gperf`) for the 8 keywords: `if`, `else`, `while`, `for`, `return`, `int`, `float`, `void`.

3. Write a function that converts an integer literal token (handling decimal, hex, octal, and binary) into its actual numeric value. Handle overflow detection for 32-bit and 64-bit integers.

4. Design tokens for a language with string interpolation like `"Hello ${name}!"`. How does the lexer handle the nested expression? (Hint: consider a stack of scanner states.)

5. Compare the token sets of C, Python, and JavaScript. Which has the most complex lexing requirements and why?

6. Implement a `TokenStream` with 2-token lookahead. Write a simple expression parser that uses `peek_token(0)` and `peek_token(1)` to make parsing decisions.

7. Design a token set for a configuration file format (like TOML or YAML). Include: section headers, key-value pairs, strings, integers, floats, booleans, arrays, and comments.
