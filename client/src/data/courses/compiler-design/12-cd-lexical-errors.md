---
title: Error Handling in Lexical Analysis
---

# Error Handling in Lexical Analysis

In this lesson, you will learn how a lexer handles **errors** — characters and sequences that don't form valid tokens. Good error handling is crucial for a usable compiler: it should report clear messages and recover gracefully to find as many errors as possible in one pass.

---

## Why Lexical Errors Occur

The lexer reads the source file character by character and tries to form valid tokens. An error occurs when:

1. The lexer encounters a character that **cannot start any token**
2. A token is started but **cannot be completed** (e.g., unterminated string)
3. A character sequence is **partially valid** but doesn't match any full token pattern

The lexer is the compiler's first line of defense. If it cannot form a valid token stream, later phases (parsing, semantic analysis) cannot work correctly.

---

## Types of Lexical Errors

### 1. Unrecognized Characters

Characters that are not part of any token pattern in the language:

```c
int main() {
    int x = 5;
    int y = x @ 3;  // '@' is not a valid operator in C
    return 0;
}
```

Error:
```
main.c:3:15: error: unexpected character '@'
```

### 2. Unterminated String Literals

A string that starts but never reaches its closing quote:

```python
message = "Hello, world
print(message)
```

Error:
```
example.py:1:11: error: unterminated string literal (detected at line 1)
```

### 3. Unterminated Block Comments

A block comment opened but never closed:

```c
/* This comment
   never ends
int main() {
    return 0;
}
```

Error:
```
main.c:1:1: error: unterminated comment started here
```

### 4. Invalid Number Formats

Numbers that start with a valid prefix but are malformed:

```c
int a = 0x;        // hex prefix without digits
int b = 0b;        // binary prefix without digits
int c = 3.14.15;   // multiple decimal points
int d = 1e;        // exponent without value
int e = 0xGG;      // invalid hex digits
```

### 5. Invalid Escape Sequences

Escape sequences in strings that aren't recognized:

```c
char *s = "hello \q world";  // \q is not a valid escape
```

### 6. Characters Illegal in Context

Characters that are valid in some contexts but not others:

```c
int 2fast = 10;    // identifier cannot start with digit
float .5 = 0.5;   // unexpected '.' at start of statement
```

---

## Error Recovery Strategies

When the lexer encounters an error, it must decide how to **continue** so it can find more errors in the rest of the file.

### Strategy 1: Panic Mode Recovery

The simplest approach — **skip characters** until we find something that looks like a valid token start:

```c
Token recoverFromError(Lexer *lexer) {
    int startLine = lexer->line;
    int startCol = lexer->column;
    char badChar = lexer->source[lexer->pos];

    // Record the error
    reportError(lexer, "Unexpected character '%c'", badChar);

    // Skip the bad character
    advance(lexer);

    // Continue skipping until we find a valid token start
    while (lexer->pos < lexer->length) {
        char c = lexer->source[lexer->pos];
        if (isalpha(c) || isdigit(c) || c == '"' || c == '\'' ||
            c == '(' || c == ')' || c == '{' || c == '}' ||
            c == ';' || c == '+' || c == '-' || c == '*') {
            break;  // Found a likely valid token start
        }
        advance(lexer);
    }

    return makeErrorToken(startLine, startCol);
}
```

### Strategy 2: Delete a Character

Simply remove the offending character and retry:

```c
// Input: "in@t x = 5;"
// Delete '@', retry → "int x = 5;"
Token handleError_delete(Lexer *lexer) {
    reportError(lexer, "Unexpected character '%c', ignoring",
                lexer->source[lexer->pos]);
    advance(lexer);  // Skip the bad character
    return getNextToken(lexer);  // Try again
}
```

### Strategy 3: Insert a Missing Character

If the lexer can guess what's missing, insert it:

```c
// Input: unterminated string "hello
// Insert closing quote, emit the string token
Token handleUnterminatedString(Lexer *lexer) {
    reportError(lexer, "Unterminated string literal, inserting closing quote");
    // Return the string token with whatever text we collected
    return makeStringToken(lexer->tokenStart, lexer->pos);
}
```

### Strategy 4: Replace a Character

If a character is close to a valid one, replace it:

```c
// This is rarely used in practice since we can't reliably guess intent
// Example: '`' might be meant as '\'' in some contexts
```

### Strategy 5: Transpose Adjacent Characters

Swap two characters that may have been typed in wrong order:

```c
// Input: "teh" → might be "the"
// Useful for identifiers but typically handled at later stages
```

### Choosing a Strategy

In practice, most lexers use **panic mode** combined with **error tokens**:

$$
\text{Practical strategy} = \text{Report error} + \text{Emit error token} + \text{Skip to next valid start}
$$

---

## What Makes a Good Error Message?

A good error message has four components:

### 1. Source Location

```
filename:line:column: severity: message
```

Example:
```
parser.c:42:15: error: unterminated string literal
```

### 2. What Was Found

Show the actual problematic character or sequence:

```
error: unexpected character '\x07' (BEL)
```

### 3. What Was Expected (if possible)

```
error: expected closing '"' for string started at line 10
```

### 4. Suggestion for Fix

```
error: invalid suffix 'f' on integer literal
  note: did you mean to use a float literal? Try '3.14f' instead of '314f'
```

### Anatomy of a Great Error Message

```
src/main.rs:15:9: error: unterminated string literal
   |
15 |     let s = "hello
   |             ^ unclosed string
   |
   = help: add a closing `"` at the end of the string
```

---

## Examples from Real Compilers

### Rust Compiler (rustc)

Rust is known for excellent error messages:

```
error: unterminated double quote string
 --> src/main.rs:2:13
  |
2 |     let s = "hello
  |             ^

error: expected one of `.`, `;`, `?`, `}`, or an operator, found `world`
 --> src/main.rs:3:5
  |
2 |     let s = "hello
  |                   - expected one of `.`, `;`, `?`, `}`, or an operator
3 |     world";
  |     ^^^^^ unexpected token
```

### Clang (C/C++ Compiler)

```
test.c:3:15: error: expected ';' after expression
    int x = 5
              ^
              ;
test.c:5:9: warning: unknown escape sequence '\q'
    "hello\q"
        ^~
```

### GCC

```
test.c:3:15: error: stray '@' in program
    3 |     int y = x @ 3;
      |               ^
```

---

## Implementing Error Recovery in the Lexer

Here is a complete lexer with error handling:

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>

#define MAX_ERRORS 100

typedef enum {
    TOK_INT, TOK_IDENT, TOK_STRING, TOK_PLUS, TOK_MINUS,
    TOK_STAR, TOK_SLASH, TOK_ASSIGN, TOK_SEMI, TOK_LPAREN,
    TOK_RPAREN, TOK_LBRACE, TOK_RBRACE, TOK_EOF, TOK_ERROR
} TokenType;

typedef struct {
    TokenType type;
    char text[256];
    int line;
    int column;
} Token;

typedef struct {
    char message[512];
    int line;
    int column;
} LexError;

typedef struct {
    const char *source;
    int pos;
    int length;
    int line;
    int column;
    LexError errors[MAX_ERRORS];
    int errorCount;
    bool hadError;
} Lexer;

void addError(Lexer *lexer, const char *fmt, ...) {
    if (lexer->errorCount >= MAX_ERRORS) return;

    LexError *err = &lexer->errors[lexer->errorCount++];
    err->line = lexer->line;
    err->column = lexer->column;
    lexer->hadError = true;

    va_list args;
    va_start(args, fmt);
    vsnprintf(err->message, sizeof(err->message), fmt, args);
    va_end(args);
}

Token scanString(Lexer *lexer) {
    Token tok = { .type = TOK_STRING, .line = lexer->line, .column = lexer->column };
    int start = lexer->pos;
    char quote = lexer->source[lexer->pos];
    lexer->pos++;  // consume opening quote

    int i = 0;
    while (lexer->pos < lexer->length) {
        char c = lexer->source[lexer->pos];

        if (c == quote) {
            lexer->pos++;  // consume closing quote
            tok.text[i] = '\0';
            return tok;
        }

        if (c == '\n') {
            addError(lexer, "Unterminated string literal");
            tok.type = TOK_ERROR;
            tok.text[i] = '\0';
            return tok;
        }

        if (c == '\\') {
            lexer->pos++;
            if (lexer->pos >= lexer->length) {
                addError(lexer, "Unexpected end of file in escape sequence");
                tok.type = TOK_ERROR;
                break;
            }
            char escaped = lexer->source[lexer->pos];
            switch (escaped) {
                case 'n': tok.text[i++] = '\n'; break;
                case 't': tok.text[i++] = '\t'; break;
                case '\\': tok.text[i++] = '\\'; break;
                case '"': tok.text[i++] = '"'; break;
                case '\'': tok.text[i++] = '\''; break;
                default:
                    addError(lexer, "Unknown escape sequence '\\%c'", escaped);
                    tok.text[i++] = escaped;
                    break;
            }
        } else {
            tok.text[i++] = c;
        }
        lexer->pos++;
    }

    // Reached EOF without closing quote
    addError(lexer, "Unterminated string literal (reached end of file)");
    tok.type = TOK_ERROR;
    tok.text[i] = '\0';
    return tok;
}

Token getNextToken(Lexer *lexer) {
    // Skip whitespace
    while (lexer->pos < lexer->length) {
        char c = lexer->source[lexer->pos];
        if (c == ' ' || c == '\t' || c == '\r') {
            lexer->pos++;
            lexer->column++;
        } else if (c == '\n') {
            lexer->pos++;
            lexer->line++;
            lexer->column = 1;
        } else {
            break;
        }
    }

    if (lexer->pos >= lexer->length) {
        return (Token){ .type = TOK_EOF, .text = "EOF",
                        .line = lexer->line, .column = lexer->column };
    }

    Token tok = { .line = lexer->line, .column = lexer->column };
    char c = lexer->source[lexer->pos];

    // String literals
    if (c == '"' || c == '\'') {
        return scanString(lexer);
    }

    // Numbers
    if (isdigit(c)) {
        // ... number scanning with error handling ...
    }

    // Identifiers
    if (isalpha(c) || c == '_') {
        // ... identifier scanning ...
    }

    // Single-character tokens
    switch (c) {
        case '+': tok.type = TOK_PLUS; break;
        case '-': tok.type = TOK_MINUS; break;
        case '*': tok.type = TOK_STAR; break;
        case '/': tok.type = TOK_SLASH; break;
        case '=': tok.type = TOK_ASSIGN; break;
        case ';': tok.type = TOK_SEMI; break;
        case '(': tok.type = TOK_LPAREN; break;
        case ')': tok.type = TOK_RPAREN; break;
        case '{': tok.type = TOK_LBRACE; break;
        case '}': tok.type = TOK_RBRACE; break;
        default:
            // UNRECOGNIZED CHARACTER — Error!
            addError(lexer, "Unexpected character '%c' (0x%02x)", c, (unsigned char)c);
            tok.type = TOK_ERROR;
            tok.text[0] = c;
            tok.text[1] = '\0';
            lexer->pos++;
            lexer->column++;
            return tok;
    }

    tok.text[0] = c;
    tok.text[1] = '\0';
    lexer->pos++;
    lexer->column++;
    return tok;
}
```

---

## Error Tokens

Instead of stopping at the first error, emit a **special error token** and let the parser decide:

```c
typedef enum {
    // ... normal tokens ...
    TOK_ERROR_UNEXPECTED_CHAR,
    TOK_ERROR_UNTERMINATED_STRING,
    TOK_ERROR_UNTERMINATED_COMMENT,
    TOK_ERROR_INVALID_NUMBER,
    TOK_ERROR_INVALID_ESCAPE,
} TokenType;
```

The parser can then:

1. **Skip** error tokens and try to continue parsing
2. **Synchronize** by looking for known token patterns (`;`, `}`, etc.)
3. **Report** accumulated errors at the end

---

## Collecting Multiple Errors

A production compiler should find **as many errors as possible** in one pass:

```c
void lexAll(Lexer *lexer) {
    Token tok;
    do {
        tok = getNextToken(lexer);
        if (tok.type != TOK_ERROR) {
            addToTokenList(tok);
        }
        // Don't stop on error — continue lexing
    } while (tok.type != TOK_EOF);

    // Report all errors at the end
    if (lexer->errorCount > 0) {
        fprintf(stderr, "Found %d lexical error(s):\n", lexer->errorCount);
        for (int i = 0; i < lexer->errorCount; i++) {
            LexError *e = &lexer->errors[i];
            fprintf(stderr, "  %d:%d: %s\n", e->line, e->column, e->message);
        }
    }
}
```

### Error Limits

To avoid flooding the user with errors (which often cascade from one mistake), most compilers have a limit:

```c
#define MAX_ERRORS_BEFORE_ABORT 20

if (lexer->errorCount >= MAX_ERRORS_BEFORE_ABORT) {
    fprintf(stderr, "Too many errors, aborting.\n");
    exit(1);
}
```

---

## Error Recovery for Specific Cases

### Unterminated Strings

```c
Token recoverUnterminatedString(Lexer *lexer) {
    // Strategy: treat newline or EOF as end of string
    addError(lexer, "Unterminated string literal");

    // Collect text up to newline or EOF
    while (lexer->pos < lexer->length && lexer->source[lexer->pos] != '\n') {
        lexer->pos++;
    }

    // Return partial string token so parser can continue
    return makeToken(TOK_STRING, ...);
}
```

### Invalid Number Formats

```c
Token recoverInvalidNumber(Lexer *lexer) {
    // Input: "0x" without hex digits
    addError(lexer, "Expected hex digits after '0x'");

    // Return the number 0 as a recovery value
    return makeIntToken(0, ...);
}
```

### Unterminated Comments

```c
void recoverUnterminatedComment(Lexer *lexer) {
    // Skip to EOF — everything after /* is consumed
    addError(lexer, "Unterminated block comment (started at %d:%d)",
             startLine, startCol);
    lexer->pos = lexer->length;
}
```

---

## Testing Error Handling

Error handling code needs tests just like normal code:

```python
# test_lexer_errors.py
import pytest
from lexer import Lexer, TokenType

def test_unrecognized_character():
    lexer = Lexer("x @ y")
    tokens = lexer.tokenize()
    assert tokens[0].type == TokenType.IDENT  # x
    assert tokens[1].type == TokenType.ERROR   # @
    assert tokens[2].type == TokenType.IDENT   # y
    assert len(lexer.errors) == 1
    assert "@" in lexer.errors[0].message

def test_unterminated_string():
    lexer = Lexer('"hello\nworld"')
    tokens = lexer.tokenize()
    assert any(t.type == TokenType.ERROR for t in tokens)
    assert "unterminated" in lexer.errors[0].message.lower()

def test_unterminated_comment():
    lexer = Lexer("/* never closed")
    tokens = lexer.tokenize()
    assert len(lexer.errors) == 1
    assert "unterminated" in lexer.errors[0].message.lower()

def test_invalid_hex_number():
    lexer = Lexer("0x 0xGG 0xFF")
    tokens = lexer.tokenize()
    assert len(lexer.errors) >= 1  # At least "0x" without digits

def test_invalid_escape():
    lexer = Lexer(r'"hello\q"')
    tokens = lexer.tokenize()
    assert len(lexer.errors) == 1
    assert "escape" in lexer.errors[0].message.lower()

def test_multiple_errors():
    lexer = Lexer('@ $ % ^')
    tokens = lexer.tokenize()
    assert lexer.error_count == 4
    # All should be reported with correct positions

def test_recovery_continues():
    """After an error, lexer should continue finding valid tokens."""
    lexer = Lexer("int @ x = 5;")
    tokens = lexer.tokenize()
    valid = [t for t in tokens if t.type != TokenType.ERROR]
    # Should find: int, x, =, 5, ;
    assert len(valid) >= 5
```

---

## Error Message Formatting

Here is a helper function that prints source-annotated error messages:

```c
void printAnnotatedError(const char *source, const char *filename,
                         int line, int column, const char *message) {
    // Print header
    fprintf(stderr, "%s:%d:%d: error: %s\n", filename, line, column, message);

    // Find the line in source
    const char *lineStart = source;
    for (int i = 1; i < line; i++) {
        lineStart = strchr(lineStart, '\n');
        if (!lineStart) return;
        lineStart++;
    }

    // Find line end
    const char *lineEnd = strchr(lineStart, '\n');
    if (!lineEnd) lineEnd = lineStart + strlen(lineStart);

    // Print the source line
    int lineLen = (int)(lineEnd - lineStart);
    fprintf(stderr, " %4d | %.*s\n", line, lineLen, lineStart);

    // Print the caret pointer
    fprintf(stderr, "      | ");
    for (int i = 1; i < column; i++) {
        fprintf(stderr, " ");
    }
    fprintf(stderr, "^\n");
}
```

Output:
```
main.c:3:15: error: unexpected character '@'
    3 |     int y = x @ 3;
      |               ^
```

---

## Error Recovery Philosophy

The **goal** of error recovery is not to fix the code — it is to allow the compiler to continue analysis and report **additional** useful errors.

Good error recovery:
- Reports the **actual problem** clearly
- Does not generate **spurious errors** (false positives from earlier mistakes)
- Allows **useful later errors** to be detected
- Does not **mask** real errors

Bad error recovery:
- One typo triggers 50 cascading error messages
- Recovery "fixes" something incorrectly, hiding a real bug
- Skips too much, missing errors in skipped code

### The Cascade Problem

One error can trigger many others:

```c
int x = "hello    // Missing closing quote
int y = 5;       // Lexer may think this is inside the string
int z = 10;      // And this too
```

Solution: **Synchronize** at strong boundaries like newlines or semicolons:

```c
if (errorType == ERROR_UNTERMINATED_STRING) {
    // Skip to end of line as sync point
    while (lexer->pos < lexer->length && lexer->source[lexer->pos] != '\n') {
        lexer->pos++;
    }
}
```

---

## Try It Yourself

**Exercise 1**: Write a lexer that handles these error cases and produces clear messages:
- Unterminated string: `"hello`
- Invalid character: `int x = 5 @ 3;`
- Unterminated comment: `/* open`
- Invalid number: `0b012` (binary with invalid digit 2)

**Exercise 2**: Implement the `printAnnotatedError` function for **multi-line** errors (e.g., showing both the start of an unterminated comment and where EOF was reached).

**Exercise 3**: Given the input:
```
int @@ x = "hello
y = 3.14.15;
```
List all lexical errors that should be reported, with line:column positions.

**Exercise 4**: Implement an error recovery strategy that limits cascading errors. After encountering an error, skip to the next semicollon or newline before resuming tokenization.

**Exercise 5**: Compare error messages from GCC, Clang, and Rust for the same mistake (e.g., an unterminated string). Which gives the best message? Why?

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Error types | Unrecognized char, unterminated string/comment, bad number |
| Panic mode | Skip to next valid token start |
| Error tokens | Emit special token, let parser handle |
| Good messages | Location + what found + what expected + suggestion |
| Multiple errors | Collect all, report at end, limit cascading |
| Testing | Test error cases as thoroughly as success cases |
| Recovery goal | Find more errors, don't generate false ones |

---

## Next Lesson

In the next lesson, we will move from **lexical analysis** to **syntax analysis** (parsing). You will learn about context-free grammars, derivations, parse trees, and the two main approaches to parsing.
