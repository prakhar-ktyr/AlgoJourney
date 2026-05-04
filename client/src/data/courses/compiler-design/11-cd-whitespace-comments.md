---
title: Handling Whitespace and Comments
---

# Handling Whitespace and Comments

In this lesson, you will learn how compilers handle whitespace and comments during lexical analysis. These characters are essential for human readability but are usually irrelevant to the program's meaning — with some notable exceptions.

---

## Why Whitespace and Comments Matter

Every source file contains characters that exist purely for **human readability**:

- **Whitespace**: spaces, tabs, newlines
- **Comments**: explanatory text ignored by the compiler

The lexer must decide what to do with these characters. In most languages, it simply **discards** them. In some languages (like Python), whitespace carries **syntactic meaning**.

---

## Types of Whitespace Characters

| Character | Name | ASCII Code | Escape Sequence |
|-----------|------|-----------|-----------------|
| Space | SP | 32 | `' '` |
| Tab | HT | 9 | `'\t'` |
| Newline (Line Feed) | LF | 10 | `'\n'` |
| Carriage Return | CR | 13 | `'\r'` |
| Form Feed | FF | 12 | `'\f'` |
| Vertical Tab | VT | 11 | `'\v'` |

---

## When Whitespace Is Insignificant

In languages like **C**, **Java**, **JavaScript**, and **Rust**, whitespace only serves to **separate tokens**. These are equivalent:

```c
int main(){return 0;}
```

```c
int   main  (  )  {
    return   0 ;
}
```

Both produce the same token stream:

```
INT ID(main) LPAREN RPAREN LBRACE RETURN NUM(0) SEMI RBRACE
```

### Lexer Strategy: Skip Whitespace

The simplest strategy is to **skip** whitespace in the lexer loop:

```c
Token getNextToken(Lexer *lexer) {
    while (lexer->pos < lexer->length) {
        char c = lexer->source[lexer->pos];

        // Skip whitespace
        if (c == ' ' || c == '\t' || c == '\n' || c == '\r') {
            if (c == '\n') {
                lexer->line++;
                lexer->column = 1;
            } else {
                lexer->column++;
            }
            lexer->pos++;
            continue;
        }

        // ... recognize tokens ...
    }
    return makeToken(TOKEN_EOF, lexer->line, lexer->column);
}
```

---

## When Whitespace Matters

### Python: Indentation-Based Syntax

In Python, indentation defines block structure:

```python
def factorial(n):
    if n <= 1:
        return 1
    else:
        return n * factorial(n - 1)
```

The lexer must track indentation levels and emit special tokens:

- **INDENT**: indentation increased
- **DEDENT**: indentation decreased
- **NEWLINE**: logical end of statement

### Haskell: The Layout Rule

Haskell uses the **layout rule** where indentation determines grouping:

```
let x = 1
    y = 2
in x + y
```

The compiler inserts implicit braces and semicolons based on indentation.

### Makefiles: Tabs Are Significant

In Makefiles, recipe lines **must** begin with a tab character (not spaces):

```
target: dependencies
	command    # This MUST be a tab
```

---

## Python's INDENT/DEDENT Algorithm

Python's indentation handling is one of the most well-known whitespace-sensitive lexing approaches. Here is the algorithm in detail:

### The Indentation Stack

The lexer maintains a **stack of indentation levels**. Initially, the stack contains just `[0]`.

```python
# Pseudocode for Python's indentation algorithm
indent_stack = [0]  # Stack starts with level 0

def handle_line_start(line):
    indent = count_leading_spaces(line)

    if indent > indent_stack[-1]:
        # Indentation increased
        indent_stack.append(indent)
        emit(INDENT)
    elif indent < indent_stack[-1]:
        # Indentation decreased — may emit multiple DEDENTs
        while indent_stack[-1] > indent:
            indent_stack.pop()
            emit(DEDENT)
        if indent_stack[-1] != indent:
            error("Indentation does not match any outer level")
    # If indent == indent_stack[-1]: same level, no token
```

### Example Trace

Consider this Python code:

```python
if x > 0:
    print("positive")
    if x > 10:
        print("large")
    print("done")
print("end")
```

| Line | Indent | Stack | Tokens Emitted |
|------|--------|-------|----------------|
| `if x > 0:` | 0 | [0] | IF, ID(x), GT, NUM(0), COLON, NEWLINE |
| `    print(...)` | 4 | [0, 4] | INDENT, ID(print), ... NEWLINE |
| `    if x > 10:` | 4 | [0, 4] | IF, ID(x), GT, NUM(10), COLON, NEWLINE |
| `        print(...)` | 8 | [0, 4, 8] | INDENT, ID(print), ... NEWLINE |
| `    print(...)` | 4 | [0, 4] | DEDENT, ID(print), ... NEWLINE |
| `print(...)` | 0 | [0] | DEDENT, ID(print), ... NEWLINE |

### Handling Tabs vs Spaces

Python 3 forbids mixing tabs and spaces. The lexer should either:

1. **Reject mixed indentation** (Python 3 approach)
2. **Expand tabs** to a fixed number of spaces (Python 2 approach, tab = 8 spaces)

```c
int countIndentation(const char *line) {
    int indent = 0;
    for (int i = 0; line[i] != '\0'; i++) {
        if (line[i] == ' ') {
            indent++;
        } else if (line[i] == '\t') {
            // Round up to next multiple of TAB_SIZE
            indent = ((indent / TAB_SIZE) + 1) * TAB_SIZE;
        } else {
            break;
        }
    }
    return indent;
}
```

### At End of File

At the end of the file, the lexer emits DEDENT tokens for each remaining level on the stack (except the initial 0):

```python
def handle_eof():
    while len(indent_stack) > 1:
        indent_stack.pop()
        emit(DEDENT)
    emit(EOF)
```

---

## Comment Handling

Comments are text in source code meant for **human readers** that the compiler ignores.

### Single-Line Comments

| Language | Syntax | Example |
|----------|--------|---------|
| C99, C++, Java, JavaScript | `//` | `// this is a comment` |
| Python, Ruby, Shell | `#` | `# this is a comment` |
| Haskell | `--` | `-- this is a comment` |
| Lua | `--` | `-- this is a comment` |
| SQL | `--` | `-- this is a comment` |

Single-line comments extend from the marker to the end of the line:

```c
void skipLineComment(Lexer *lexer) {
    // Assumes we already consumed "//"
    while (lexer->pos < lexer->length && lexer->source[lexer->pos] != '\n') {
        lexer->pos++;
    }
    // Don't consume the newline — let the main loop handle it
}
```

### Multi-Line (Block) Comments

| Language | Start | End | Example |
|----------|-------|-----|---------|
| C, Java, JavaScript | `/*` | `*/` | `/* comment */` |
| Python | `"""` | `"""` | `"""docstring"""` |
| Haskell | `{-` | `-}` | `{- comment -}` |
| HTML | `<!--` | `-->` | `<!-- comment -->` |

```c
void skipBlockComment(Lexer *lexer) {
    // Assumes we already consumed "/*"
    int startLine = lexer->line;
    int startCol = lexer->column;

    while (lexer->pos < lexer->length - 1) {
        if (lexer->source[lexer->pos] == '*' &&
            lexer->source[lexer->pos + 1] == '/') {
            lexer->pos += 2;
            lexer->column += 2;
            return;  // Comment closed
        }
        if (lexer->source[lexer->pos] == '\n') {
            lexer->line++;
            lexer->column = 1;
        } else {
            lexer->column++;
        }
        lexer->pos++;
    }

    // Reached end of file without closing comment
    error("Unterminated comment starting at %d:%d", startLine, startCol);
}
```

### Nested Comments

Some languages (Haskell, Rust, Swift) allow **nested** block comments:

```
/* outer /* inner */ still in outer */
```

This requires a **depth counter**:

```c
void skipNestedComment(Lexer *lexer) {
    int depth = 1;  // Already consumed opening /*

    while (lexer->pos < lexer->length - 1 && depth > 0) {
        if (lexer->source[lexer->pos] == '/' &&
            lexer->source[lexer->pos + 1] == '*') {
            depth++;
            lexer->pos += 2;
        } else if (lexer->source[lexer->pos] == '*' &&
                   lexer->source[lexer->pos + 1] == '/') {
            depth--;
            lexer->pos += 2;
        } else {
            if (lexer->source[lexer->pos] == '\n') {
                lexer->line++;
                lexer->column = 1;
            }
            lexer->pos++;
        }
    }

    if (depth > 0) {
        error("Unterminated nested comment");
    }
}
```

### Documentation Comments

Many languages have special comment syntax for generating documentation:

| Language | Syntax | Tool |
|----------|--------|------|
| Java | `/** ... */` | Javadoc |
| Rust | `///` or `//!` | rustdoc |
| Python | `"""..."""` (docstrings) | Sphinx |
| C# | `///` with XML | XML docs |
| Go | `//` before declaration | godoc |

```c
/**
 * Calculates the factorial of n.
 * @param n A non-negative integer
 * @return n! (n factorial)
 */
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
```

For documentation comments, the lexer may need to **preserve** the comment text rather than discard it. This is typically done by:

1. Emitting a `DOC_COMMENT` token with the text as its value
2. Attaching the comment to the next AST node during parsing
3. Processing doc comments in a separate pass before lexing

---

## DFA States for Comment Scanning

A lexer DFA that handles both single-line and multi-line comments needs additional states:

```
State diagram for '/' handling:

START --'/'→ SAW_SLASH
SAW_SLASH --'/'→ LINE_COMMENT
SAW_SLASH --'*'→ BLOCK_COMMENT
SAW_SLASH --(other)→ emit DIVIDE, back to START

LINE_COMMENT --(not '\n')→ LINE_COMMENT
LINE_COMMENT --'\n'→ START (comment discarded)

BLOCK_COMMENT --(not '*')→ BLOCK_COMMENT
BLOCK_COMMENT --'*'→ MAYBE_END_BLOCK
MAYBE_END_BLOCK --'/'→ START (comment discarded)
MAYBE_END_BLOCK --'*'→ MAYBE_END_BLOCK
MAYBE_END_BLOCK --(other)→ BLOCK_COMMENT
```

Implemented as a state machine:

```c
typedef enum {
    STATE_START,
    STATE_SAW_SLASH,
    STATE_LINE_COMMENT,
    STATE_BLOCK_COMMENT,
    STATE_MAYBE_END_BLOCK
} LexerState;

void scanComment(Lexer *lexer) {
    LexerState state = STATE_SAW_SLASH;  // We already saw '/'

    while (lexer->pos < lexer->length) {
        char c = lexer->source[lexer->pos];

        switch (state) {
            case STATE_SAW_SLASH:
                if (c == '/') state = STATE_LINE_COMMENT;
                else if (c == '*') state = STATE_BLOCK_COMMENT;
                else {
                    // Not a comment — it's a division operator
                    return;  // Handle in caller
                }
                break;

            case STATE_LINE_COMMENT:
                if (c == '\n') return;  // Comment ended
                break;

            case STATE_BLOCK_COMMENT:
                if (c == '*') state = STATE_MAYBE_END_BLOCK;
                break;

            case STATE_MAYBE_END_BLOCK:
                if (c == '/') return;  // Comment ended
                else if (c != '*') state = STATE_BLOCK_COMMENT;
                break;
        }
        lexer->pos++;
    }
}
```

---

## Newline Handling

Different operating systems use different line endings:

| OS | Line Ending | Escape |
|----|-------------|--------|
| Unix/Linux/macOS | LF | `\n` |
| Windows | CR+LF | `\r\n` |
| Old Mac (pre-OS X) | CR | `\r` |

The lexer should handle all three consistently:

```c
void consumeNewline(Lexer *lexer) {
    if (lexer->source[lexer->pos] == '\r') {
        lexer->pos++;
        // CR+LF counts as one newline
        if (lexer->pos < lexer->length && lexer->source[lexer->pos] == '\n') {
            lexer->pos++;
        }
    } else if (lexer->source[lexer->pos] == '\n') {
        lexer->pos++;
    }
    lexer->line++;
    lexer->column = 1;
}
```

---

## Line Counting for Error Messages

Accurate line and column tracking is essential for meaningful error messages. The lexer should maintain:

```c
typedef struct {
    const char *source;
    int pos;       // Current position in source
    int length;    // Total source length
    int line;      // Current line number (1-based)
    int column;    // Current column number (1-based)
} Lexer;
```

Every time we advance past a character:

```c
void advance(Lexer *lexer) {
    if (lexer->source[lexer->pos] == '\n') {
        lexer->line++;
        lexer->column = 1;
    } else if (lexer->source[lexer->pos] == '\t') {
        // Tab advances to next tab stop (every 4 or 8 columns)
        lexer->column = ((lexer->column - 1) / 4 + 1) * 4 + 1;
    } else {
        lexer->column++;
    }
    lexer->pos++;
}
```

### Storing Token Locations

Each token should record where it came from:

```c
typedef struct {
    TokenType type;
    const char *text;
    int length;
    int line;
    int column;
    const char *filename;  // For multi-file projects
} Token;
```

This allows the compiler to produce error messages like:

```
main.c:42:15: error: expected ';' after expression
    int x = 5
              ^
              ;
```

---

## Preserving Comments for Tools

While compilers discard comments, other tools need them:

- **IDEs**: display tooltips from doc comments
- **Formatters** (prettier, clang-format): preserve and reformat comments
- **Documentation generators** (Javadoc, Doxygen): extract doc comments
- **Linters**: check TODO/FIXME comments

### Strategy: Trivia/Whitespace Tokens

Modern compiler frameworks (Roslyn for C#, rust-analyzer) preserve **all** text by attaching whitespace and comments as **trivia** to tokens:

```c
typedef struct {
    TokenType type;
    char *text;
    // Leading trivia (whitespace/comments before this token)
    Trivia *leadingTrivia;
    int leadingTriviaCount;
    // Trailing trivia (whitespace/comments after, up to newline)
    Trivia *trailingTrivia;
    int trailingTriviaCount;
} Token;

typedef struct {
    TriviaKind kind;  // WHITESPACE, NEWLINE, LINE_COMMENT, BLOCK_COMMENT
    char *text;
    int length;
} Trivia;
```

This approach means **no information is lost** — the original source can be reconstructed from the token stream.

---

## Complete Example: Lexer with Whitespace and Comment Handling

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

typedef enum {
    TOK_INT, TOK_FLOAT, TOK_IDENT, TOK_PLUS, TOK_MINUS,
    TOK_STAR, TOK_SLASH, TOK_SEMI, TOK_LPAREN, TOK_RPAREN,
    TOK_EOF, TOK_ERROR
} TokenType;

typedef struct {
    TokenType type;
    char text[256];
    int line;
    int column;
} Token;

typedef struct {
    const char *src;
    int pos;
    int len;
    int line;
    int col;
} Lexer;

void skipWhitespaceAndComments(Lexer *L) {
    while (L->pos < L->len) {
        char c = L->src[L->pos];

        // Skip whitespace
        if (c == ' ' || c == '\t' || c == '\r') {
            L->col++;
            L->pos++;
        } else if (c == '\n') {
            L->line++;
            L->col = 1;
            L->pos++;
        }
        // Skip single-line comment
        else if (c == '/' && L->pos + 1 < L->len && L->src[L->pos + 1] == '/') {
            L->pos += 2;
            while (L->pos < L->len && L->src[L->pos] != '\n') {
                L->pos++;
            }
        }
        // Skip block comment
        else if (c == '/' && L->pos + 1 < L->len && L->src[L->pos + 1] == '*') {
            L->pos += 2;
            L->col += 2;
            while (L->pos + 1 < L->len) {
                if (L->src[L->pos] == '\n') {
                    L->line++;
                    L->col = 1;
                } else if (L->src[L->pos] == '*' && L->src[L->pos + 1] == '/') {
                    L->pos += 2;
                    L->col += 2;
                    break;
                }
                L->pos++;
                L->col++;
            }
        } else {
            break;  // Not whitespace or comment
        }
    }
}

Token nextToken(Lexer *L) {
    skipWhitespaceAndComments(L);

    Token tok = { .line = L->line, .col = L->col };

    if (L->pos >= L->len) {
        tok.type = TOK_EOF;
        strcpy(tok.text, "EOF");
        return tok;
    }

    // ... rest of token recognition ...
    return tok;
}
```

---

## Try It Yourself

**Exercise 1**: Write a lexer function that counts the total number of lines, blank lines, comment lines, and code lines in a C source file.

**Exercise 2**: Implement Python-style INDENT/DEDENT token generation. Given this input:

```python
if True:
    x = 1
    if False:
        y = 2
    z = 3
w = 4
```

What is the token stream (focusing only on INDENT, DEDENT, and NEWLINE tokens)?

**Exercise 3**: Modify the block comment scanner to support **nested** comments. Test with:

```
/* level 1 /* level 2 */ back to level 1 */
```

**Exercise 4**: Design a lexer that preserves comments as trivia. For the input:

```c
int x = 5; // initial value
/* block */ int y = 10;
```

Show the token stream with attached trivia.

**Exercise 5**: Implement a function that normalizes all line endings (CR, LF, CR+LF) to LF before lexing. Discuss whether this should be done as a preprocessing step or integrated into the lexer.

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Whitespace (insignificant) | Skip in lexer, just separates tokens |
| Whitespace (significant) | Emit INDENT/DEDENT tokens (Python) |
| Single-line comments | Scan to end of line |
| Block comments | Scan to closing delimiter, track nesting if needed |
| Doc comments | Preserve for documentation tools |
| Line counting | Track line/column in lexer for error messages |
| Newline handling | Normalize CR, LF, CR+LF |
| Trivia preservation | Attach whitespace/comments to tokens for IDE tools |

---

## Next Lesson

In the next lesson, we will explore **Error Handling in Lexical Analysis** — what happens when the lexer encounters characters it cannot recognize, and how to recover gracefully.
