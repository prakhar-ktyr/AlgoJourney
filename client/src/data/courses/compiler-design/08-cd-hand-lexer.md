---
title: Building a Hand-Coded Lexer
---

# Building a Hand-Coded Lexer

While lexer generators like Lex/Flex are powerful, many production compilers use **hand-written lexers**. GCC, Clang, Go, Rust, V8 (JavaScript), and CPython all hand-code their lexers. In this lesson, you'll learn why and how to build one from scratch.

---

## Why Hand-Code a Lexer?

| Advantage | Explanation |
|-----------|-------------|
| **Performance** | Hand-tuned code can be 2-5× faster than generated tables |
| **Error messages** | Full control over error reporting with context |
| **Flexibility** | Easy to handle context-sensitive tokens |
| **No dependencies** | No external tool required in build process |
| **Debugging** | Easier to step through and understand |
| **Special cases** | Handle irregular tokens (heredocs, interpolation) naturally |

### Real-World Examples

- **GCC/Clang** (C/C++): hand-coded for speed and preprocessor integration
- **Go compiler**: hand-coded lexer in `go/scanner` package
- **Rust compiler**: hand-coded in `rustc_lexer`
- **V8** (JavaScript): hand-coded for performance
- **CPython**: hand-coded for indentation-sensitive lexing

---

## Basic Structure

Every hand-coded lexer follows this pattern:

```c
Token getNextToken() {
    skipWhitespaceAndComments();
    
    char c = peek();
    
    if (c == '\0') return makeToken(TOKEN_EOF);
    if (isAlpha(c) || c == '_') return scanIdentifierOrKeyword();
    if (isDigit(c)) return scanNumber();
    if (c == '"') return scanString();
    if (c == '\'') return scanChar();
    
    // Operators and punctuation
    return scanOperator();
}
```

The key idea: **look at the first character** to determine what kind of token we're reading, then call a specialized scanning function.

---

## Input Handling: Peek and Advance

The lexer needs to read the source character by character with the ability to look ahead:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

typedef struct {
    const char *source;   // Source code string
    const char *start;    // Start of current token
    const char *current;  // Current position
    int line;             // Current line number
    int col;              // Current column number
    int start_col;        // Column where current token started
} Lexer;

void lexer_init(Lexer *lexer, const char *source) {
    lexer->source = source;
    lexer->start = source;
    lexer->current = source;
    lexer->line = 1;
    lexer->col = 1;
    lexer->start_col = 1;
}

// Look at current character without consuming it
char peek(Lexer *lexer) {
    return *lexer->current;
}

// Look at next character (one ahead)
char peek_next(Lexer *lexer) {
    if (*lexer->current == '\0') return '\0';
    return lexer->current[1];
}

// Consume current character and advance
char advance(Lexer *lexer) {
    char c = *lexer->current;
    lexer->current++;
    if (c == '\n') {
        lexer->line++;
        lexer->col = 1;
    } else {
        lexer->col++;
    }
    return c;
}

// Check if current char matches expected, consume if yes
int match(Lexer *lexer, char expected) {
    if (*lexer->current == '\0') return 0;
    if (*lexer->current != expected) return 0;
    advance(lexer);
    return 1;
}

// Check if we've reached end of source
int is_at_end(Lexer *lexer) {
    return *lexer->current == '\0';
}
```

---

## Token Representation

```c
typedef enum {
    // Literals
    TOKEN_INTEGER,
    TOKEN_FLOAT,
    TOKEN_STRING,
    TOKEN_CHAR,
    
    // Keywords
    TOKEN_IF,
    TOKEN_ELSE,
    TOKEN_WHILE,
    TOKEN_FOR,
    TOKEN_RETURN,
    TOKEN_INT,
    TOKEN_VOID,
    
    // Identifiers
    TOKEN_IDENTIFIER,
    
    // Operators
    TOKEN_PLUS,
    TOKEN_MINUS,
    TOKEN_STAR,
    TOKEN_SLASH,
    TOKEN_ASSIGN,
    TOKEN_EQ,
    TOKEN_NEQ,
    TOKEN_LT,
    TOKEN_GT,
    TOKEN_LEQ,
    TOKEN_GEQ,
    TOKEN_AND,
    TOKEN_OR,
    TOKEN_NOT,
    
    // Delimiters
    TOKEN_LPAREN,
    TOKEN_RPAREN,
    TOKEN_LBRACE,
    TOKEN_RBRACE,
    TOKEN_LBRACKET,
    TOKEN_RBRACKET,
    TOKEN_SEMICOLON,
    TOKEN_COMMA,
    TOKEN_DOT,
    
    // Special
    TOKEN_EOF,
    TOKEN_ERROR
} TokenType;

typedef struct {
    TokenType type;
    const char *start;  // Pointer to start of token in source
    int length;         // Length of token text
    int line;           // Source line
    int col;            // Source column
} Token;

Token make_token(Lexer *lexer, TokenType type) {
    Token token;
    token.type = type;
    token.start = lexer->start;
    token.length = (int)(lexer->current - lexer->start);
    token.line = lexer->line;
    token.col = lexer->start_col;
    return token;
}

Token error_token(Lexer *lexer, const char *message) {
    Token token;
    token.type = TOKEN_ERROR;
    token.start = message;
    token.length = strlen(message);
    token.line = lexer->line;
    token.col = lexer->col;
    return token;
}
```

---

## Scanning Different Token Types

### Skipping Whitespace and Comments

```c
void skip_whitespace(Lexer *lexer) {
    for (;;) {
        char c = peek(lexer);
        switch (c) {
            case ' ':
            case '\t':
            case '\r':
                advance(lexer);
                break;
            case '\n':
                advance(lexer);
                break;
            case '/':
                if (peek_next(lexer) == '/') {
                    // Single-line comment: skip to end of line
                    while (peek(lexer) != '\n' && !is_at_end(lexer)) {
                        advance(lexer);
                    }
                } else if (peek_next(lexer) == '*') {
                    // Block comment: skip to */
                    advance(lexer);  // skip '/'
                    advance(lexer);  // skip '*'
                    while (!is_at_end(lexer)) {
                        if (peek(lexer) == '*' && peek_next(lexer) == '/') {
                            advance(lexer);  // skip '*'
                            advance(lexer);  // skip '/'
                            break;
                        }
                        advance(lexer);
                    }
                } else {
                    return;  // '/' is an operator, not a comment
                }
                break;
            default:
                return;
        }
    }
}
```

### Scanning Numbers

```c
Token scan_number(Lexer *lexer) {
    // We already know current char is a digit
    TokenType type = TOKEN_INTEGER;
    
    // Read digits
    while (isdigit(peek(lexer))) {
        advance(lexer);
    }
    
    // Check for hex: 0x...
    if ((lexer->current - lexer->start == 1) &&
        *lexer->start == '0' && (peek(lexer) == 'x' || peek(lexer) == 'X')) {
        advance(lexer);  // skip 'x'
        while (isxdigit(peek(lexer))) {
            advance(lexer);
        }
        return make_token(lexer, TOKEN_INTEGER);
    }
    
    // Check for decimal point (float)
    if (peek(lexer) == '.' && isdigit(peek_next(lexer))) {
        type = TOKEN_FLOAT;
        advance(lexer);  // consume '.'
        
        while (isdigit(peek(lexer))) {
            advance(lexer);
        }
    }
    
    // Check for exponent
    if (peek(lexer) == 'e' || peek(lexer) == 'E') {
        type = TOKEN_FLOAT;
        advance(lexer);  // consume 'e'/'E'
        
        if (peek(lexer) == '+' || peek(lexer) == '-') {
            advance(lexer);  // consume sign
        }
        
        if (!isdigit(peek(lexer))) {
            return error_token(lexer, "Expected digit after exponent");
        }
        
        while (isdigit(peek(lexer))) {
            advance(lexer);
        }
    }
    
    return make_token(lexer, type);
}
```

### Scanning Identifiers and Keywords

```c
// Keyword table
typedef struct {
    const char *name;
    int length;
    TokenType type;
} Keyword;

static Keyword keywords[] = {
    {"if",     2, TOKEN_IF},
    {"else",   4, TOKEN_ELSE},
    {"while",  5, TOKEN_WHILE},
    {"for",    3, TOKEN_FOR},
    {"return", 6, TOKEN_RETURN},
    {"int",    3, TOKEN_INT},
    {"void",   4, TOKEN_VOID},
    {NULL,     0, TOKEN_EOF}  // Sentinel
};

TokenType check_keyword(const char *start, int length) {
    for (int i = 0; keywords[i].name != NULL; i++) {
        if (keywords[i].length == length &&
            memcmp(start, keywords[i].name, length) == 0) {
            return keywords[i].type;
        }
    }
    return TOKEN_IDENTIFIER;
}

Token scan_identifier(Lexer *lexer) {
    // Read alphanumeric and underscore characters
    while (isalnum(peek(lexer)) || peek(lexer) == '_') {
        advance(lexer);
    }
    
    // Check if it's a keyword
    int length = (int)(lexer->current - lexer->start);
    TokenType type = check_keyword(lexer->start, length);
    
    return make_token(lexer, type);
}
```

### Scanning Strings

```c
Token scan_string(Lexer *lexer) {
    advance(lexer);  // consume opening '"'
    
    while (peek(lexer) != '"' && !is_at_end(lexer)) {
        if (peek(lexer) == '\n') {
            return error_token(lexer, "Unterminated string (newline in string)");
        }
        
        // Handle escape sequences
        if (peek(lexer) == '\\') {
            advance(lexer);  // consume '\'
            
            switch (peek(lexer)) {
                case 'n': case 't': case 'r': case '\\':
                case '"': case '\'': case '0':
                    advance(lexer);
                    break;
                case 'x':
                    // Hex escape: \x41
                    advance(lexer);
                    if (!isxdigit(peek(lexer))) {
                        return error_token(lexer, "Invalid hex escape");
                    }
                    advance(lexer);
                    if (isxdigit(peek(lexer))) advance(lexer);
                    break;
                default:
                    return error_token(lexer, "Invalid escape sequence");
            }
        } else {
            advance(lexer);
        }
    }
    
    if (is_at_end(lexer)) {
        return error_token(lexer, "Unterminated string");
    }
    
    advance(lexer);  // consume closing '"'
    return make_token(lexer, TOKEN_STRING);
}
```

### Scanning Operators

Multi-character operators require lookahead:

```c
Token scan_operator(Lexer *lexer) {
    char c = advance(lexer);
    
    switch (c) {
        // Single-character tokens (unambiguous)
        case '(': return make_token(lexer, TOKEN_LPAREN);
        case ')': return make_token(lexer, TOKEN_RPAREN);
        case '{': return make_token(lexer, TOKEN_LBRACE);
        case '}': return make_token(lexer, TOKEN_RBRACE);
        case '[': return make_token(lexer, TOKEN_LBRACKET);
        case ']': return make_token(lexer, TOKEN_RBRACKET);
        case ';': return make_token(lexer, TOKEN_SEMICOLON);
        case ',': return make_token(lexer, TOKEN_COMMA);
        case '.': return make_token(lexer, TOKEN_DOT);
        case '+': return make_token(lexer, TOKEN_PLUS);
        case '-': return make_token(lexer, TOKEN_MINUS);
        case '*': return make_token(lexer, TOKEN_STAR);
        case '/': return make_token(lexer, TOKEN_SLASH);
        
        // Two-character tokens (need lookahead)
        case '=':
            if (match(lexer, '=')) return make_token(lexer, TOKEN_EQ);
            return make_token(lexer, TOKEN_ASSIGN);
        
        case '!':
            if (match(lexer, '=')) return make_token(lexer, TOKEN_NEQ);
            return make_token(lexer, TOKEN_NOT);
        
        case '<':
            if (match(lexer, '=')) return make_token(lexer, TOKEN_LEQ);
            return make_token(lexer, TOKEN_LT);
        
        case '>':
            if (match(lexer, '=')) return make_token(lexer, TOKEN_GEQ);
            return make_token(lexer, TOKEN_GT);
        
        case '&':
            if (match(lexer, '&')) return make_token(lexer, TOKEN_AND);
            return error_token(lexer, "Expected '&&'");
        
        case '|':
            if (match(lexer, '|')) return make_token(lexer, TOKEN_OR);
            return error_token(lexer, "Expected '||'");
        
        default:
            return error_token(lexer, "Unexpected character");
    }
}
```

---

## Position Tracking for Error Reporting

Good error messages need precise source locations:

```c
void report_error(Lexer *lexer, Token *token, const char *message) {
    fprintf(stderr, "Error at line %d, col %d: %s\n",
            token->line, token->col, message);
    
    // Print the offending line
    const char *line_start = token->start;
    while (line_start > lexer->source && *(line_start - 1) != '\n') {
        line_start--;
    }
    const char *line_end = token->start;
    while (*line_end != '\n' && *line_end != '\0') {
        line_end++;
    }
    
    fprintf(stderr, "  %.*s\n", (int)(line_end - line_start), line_start);
    
    // Print caret pointing to the error
    int offset = (int)(token->start - line_start);
    fprintf(stderr, "  %*s", offset, "");
    for (int i = 0; i < token->length && i < 20; i++) {
        fprintf(stderr, "^");
    }
    fprintf(stderr, "\n");
}
```

**Example output:**
```
Error at line 3, col 15: Unterminated string
  x = "hello world
              ^^^^^^^^^^^^^
```

---

## Complete Lexer: Putting It Together

```c
Token get_next_token(Lexer *lexer) {
    skip_whitespace(lexer);
    
    // Mark start of new token
    lexer->start = lexer->current;
    lexer->start_col = lexer->col;
    
    if (is_at_end(lexer)) {
        return make_token(lexer, TOKEN_EOF);
    }
    
    char c = peek(lexer);
    
    // Identifiers and keywords
    if (isalpha(c) || c == '_') {
        return scan_identifier(lexer);
    }
    
    // Numbers
    if (isdigit(c)) {
        return scan_number(lexer);
    }
    
    // Strings
    if (c == '"') {
        return scan_string(lexer);
    }
    
    // Everything else (operators, punctuation)
    return scan_operator(lexer);
}
```

---

## Testing the Lexer

A test harness to verify lexer output:

```c
void test_lexer(const char *source) {
    Lexer lexer;
    lexer_init(&lexer, source);
    
    printf("Source: %s\n", source);
    printf("%-12s %-15s %s\n", "Type", "Value", "Location");
    printf("%-12s %-15s %s\n", "----", "-----", "--------");
    
    for (;;) {
        Token tok = get_next_token(&lexer);
        printf("%-12s %-15.*s line %d, col %d\n",
               token_name(tok.type),
               tok.length, tok.start, tok.line, tok.col);
        if (tok.type == TOKEN_EOF || tok.type == TOKEN_ERROR) break;
    }
    printf("\n");
}

int main(void) {
    test_lexer("int x = 42;");
    test_lexer("if (x >= 10) { return x + 1; }");
    test_lexer("float pi = 3.14e2;");
    return 0;
}
```

**Expected output for** `"int x = 42;"`:
```
Type         Value           Location
----         -----           --------
INT_TYPE     int             line 1, col 1
IDENT        x               line 1, col 5
ASSIGN       =               line 1, col 7
INTEGER      42              line 1, col 9
SEMI         ;               line 1, col 11
EOF                          line 1, col 12
```

---

## Handling Context-Sensitive Tokens

Some tokens depend on context (hard for generated lexers, easy for hand-coded):

### Example: `>>` in C++ Templates

In `vector<vector<int>>`, the `>>` should be two `>` tokens, not a right-shift operator. A hand-coded lexer can check parser state:

```c
case '>':
    if (match(lexer, '>') && !in_template_context) {
        return make_token(lexer, TOKEN_RSHIFT);
    }
    if (match(lexer, '=')) return make_token(lexer, TOKEN_GEQ);
    return make_token(lexer, TOKEN_GT);
```

### Example: Python Indentation

Python's INDENT/DEDENT tokens require tracking indentation levels — trivial in a hand-coded lexer, impossible in a standard regex-based generator.

---

## Summary

| Component | Purpose |
|-----------|---------|
| `peek()` / `advance()` | Character-level input |
| `skip_whitespace()` | Ignore non-token characters |
| `scan_number()` | Integer and float literals |
| `scan_identifier()` | Identifiers + keyword check |
| `scan_string()` | String literals with escapes |
| `scan_operator()` | Operators with lookahead |
| `make_token()` | Package result with position |

A hand-coded lexer is typically 200-500 lines for a simple language, and can be written in an afternoon. The structure is always the same: peek at the first character, dispatch to the appropriate scanner, return a token with source location.

---

## Exercises

1. Extend the lexer to handle single-character literals (`'a'`, `'\n'`, `'\x41'`). Add `TOKEN_CHAR` and write the `scan_char()` function.

2. Add support for hexadecimal (`0xFF`), octal (`0o77`), and binary (`0b1010`) integer literals to `scan_number()`.

3. Modify the lexer to track and report **all** errors in a file rather than stopping at the first one. Use a "panic mode" that skips to the next whitespace or delimiter.

4. Implement a lexer for a language with Python-style indentation. Your lexer should emit `INDENT` and `DEDENT` tokens by tracking a stack of indentation levels.

5. Write a benchmark comparing your hand-coded lexer against Python's `re`-based tokenizer. Tokenize a 10,000-line source file and measure the time.

6. Add support for multi-line strings (triple-quoted `"""..."""`) to the string scanner.

7. Implement the "double buffer" technique and compare its performance against the simple string-based approach when lexing a 1MB source file.
