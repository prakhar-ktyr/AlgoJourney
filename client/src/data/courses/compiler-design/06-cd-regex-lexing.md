---
title: Regular Expressions for Lexical Analysis
---

# Regular Expressions for Lexical Analysis

Regular expressions are the mathematical foundation for specifying token patterns in lexical analysis. Every token in a programming language — identifiers, numbers, operators, keywords — can be described precisely using a regular expression. In this lesson, you'll learn how to write regex patterns that a lexer uses to recognize tokens.

---

## Why Regular Expressions?

A lexer needs to answer one question repeatedly: "What token starts at the current position in the source code?" Regular expressions provide a **formal, unambiguous** way to specify what each token looks like.

| Approach | Problem |
|----------|---------|
| Ad-hoc string matching | Incomplete, error-prone |
| English description | Ambiguous |
| Regular expressions | Precise, implementable |

Regular expressions are powerful enough to describe all token patterns yet simple enough to be converted automatically into efficient finite automata.

---

## Formal Regex Syntax Recap

The three fundamental operations of regular expressions over an alphabet $\Sigma$:

### 1. Union (Alternation)

$$r_1 \mid r_2$$

Matches any string matched by $r_1$ **or** $r_2$.

**Example:** `a|b` matches the string `"a"` or the string `"b"`.

### 2. Concatenation

$$r_1 \cdot r_2$$

Matches any string formed by concatenating a string from $r_1$ with a string from $r_2$.

**Example:** `ab` matches only the string `"ab"`.

### 3. Kleene Star (Zero or More)

$$r^*$$

Matches zero or more repetitions of strings from $r$.

**Example:** `a*` matches `""`, `"a"`, `"aa"`, `"aaa"`, ...

### Formal Definition

The set of regular expressions over alphabet $\Sigma$ is defined inductively:

1. $\epsilon$ (empty string) is a regex
2. For each $a \in \Sigma$, the symbol $a$ is a regex
3. If $r_1$ and $r_2$ are regex, then $r_1 \mid r_2$ is a regex (union)
4. If $r_1$ and $r_2$ are regex, then $r_1 r_2$ is a regex (concatenation)
5. If $r$ is a regex, then $r^*$ is a regex (Kleene star)

**Precedence** (highest to lowest):
1. Kleene star `*`
2. Concatenation (juxtaposition)
3. Union `|`

So `ab*|c` means `(a(b*))|c`, not `(ab)*|c`.

---

## Extended Regex for Practical Lexing

The three basic operations are theoretically complete, but writing real token patterns with only union, concatenation, and Kleene star is tedious. Practical lexer tools add syntactic sugar:

### Character Classes

Square brackets define a set of characters to match:

| Pattern | Matches |
|---------|---------|
| `[abc]` | `a`, `b`, or `c` |
| `[a-z]` | Any lowercase letter |
| `[A-Z]` | Any uppercase letter |
| `[0-9]` | Any digit |
| `[a-zA-Z]` | Any letter |
| `[a-zA-Z0-9]` | Any alphanumeric character |
| `[^0-9]` | Any character that is NOT a digit |

**Formal equivalence:**

$$[a\text{-}z] \equiv a \mid b \mid c \mid \ldots \mid z$$

### One or More: `+`

$$r^+ \equiv r \cdot r^*$$

Matches **one or more** repetitions of $r$.

**Example:** `[0-9]+` matches `"5"`, `"42"`, `"12345"` but NOT `""`.

### Optional: `?`

$$r? \equiv r \mid \epsilon$$

Matches **zero or one** occurrence of $r$.

**Example:** `[+-]?` matches `"+"`, `"-"`, or nothing (empty string).

### Escape Sequences

Special characters are escaped with backslash:

| Pattern | Matches |
|---------|---------|
| `\.` | Literal dot character |
| `\*` | Literal asterisk |
| `\+` | Literal plus sign |
| `\\` | Literal backslash |
| `\"` | Literal double quote |
| `\n` | Newline character |
| `\t` | Tab character |

### Wildcard

The dot `.` matches any single character except newline.

---

## Token Patterns as Regular Expressions

Now let's define real token patterns. Each token type in a language gets one regex:

### Integer Literals

```
[0-9]+
```

Matches: `0`, `7`, `42`, `100`, `999999`

Does not match: `3.14`, `-5` (minus is a separate operator token), `abc`

### Floating-Point Literals

```
[0-9]+\.[0-9]+
```

Matches: `3.14`, `0.5`, `100.0`, `2.718`

More complete version with optional exponent:

```
[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?
```

Matches: `3.14`, `1.5e10`, `2.0E-3`, `6.022e23`

### Identifiers

```
[a-zA-Z_][a-zA-Z0-9_]*
```

- First character: letter or underscore
- Remaining characters: letters, digits, or underscores

Matches: `x`, `count`, `_private`, `maxValue`, `item2`, `__init__`

Does not match: `2nd` (starts with digit), `my-var` (contains hyphen)

### String Literals

```
\"[^\"]*\"
```

Matches: `"hello"`, `"world"`, `""` (empty string), `"123 abc"`

> **Note:** This simple version doesn't handle escaped quotes inside strings. A more robust pattern would be: `\"([^\"\\]|\\.)*\"`

### Keywords

```
if|else|while|for|return
```

Keywords are matched as exact strings using alternation. The key challenge is distinguishing keywords from identifiers (both match `[a-zA-Z_][a-zA-Z0-9_]*`).

### Operators

```c
// Single-character operators
[+\-*/=<>!&|^~%]

// Multi-character operators
==|!=|<=|>=|&&|\|\||<<|>>|\+\+|--|->
```

### Whitespace (to skip)

```
[ \t\n\r]+
```

Matches one or more whitespace characters. The lexer matches these but discards them (no token produced).

### Comments (to skip)

Single-line comment:
```
//[^\n]*
```

Multi-line comment (simplified):
```
/\*[^*]*\*+([^/*][^*]*\*+)*/
```

---

## Regex Priority Rules

When multiple regex patterns can match at the same position, we need disambiguation rules:

### Rule 1: Longest Match (Maximal Munch)

If multiple patterns match, choose the **longest** match.

**Example:** Input `"ifvar"` with patterns for keyword `if` and identifier `[a-zA-Z_][a-zA-Z0-9_]*`:
- `if` matches 2 characters
- Identifier matches 5 characters (`ifvar`)
- **Winner:** identifier `ifvar` (longest match)

### Rule 2: Priority Ordering

If two patterns match the **same length**, choose the one listed **first** (highest priority).

**Example:** Input `"if"` with patterns:
1. Keyword `if` — matches 2 characters
2. Identifier `[a-zA-Z_][a-zA-Z0-9_]*` — matches 2 characters
- Same length → **Winner:** keyword `if` (listed first, higher priority)

### Combined Rule

$$\text{token} = \text{argmax}_{\text{priority}}(\text{patterns matching longest prefix})$$

This is why lexer specifications list keyword patterns **before** the identifier pattern.

---

## Combining Patterns: Ordered List

A complete lexer specification is an **ordered list** of (pattern, token-type) pairs:

```python
# Token specification for a simple language
# Order matters! Higher priority patterns first.

token_spec = [
    # Keywords (before identifiers!)
    (r'if',       'IF'),
    (r'else',     'ELSE'),
    (r'while',    'WHILE'),
    (r'for',      'FOR'),
    (r'return',   'RETURN'),
    (r'int',      'INT_TYPE'),
    (r'float',    'FLOAT_TYPE'),

    # Literals
    (r'[0-9]+\.[0-9]+',  'FLOAT_LIT'),    # Float before integer!
    (r'[0-9]+',          'INT_LIT'),
    (r'"[^"]*"',         'STRING_LIT'),

    # Identifiers (after keywords!)
    (r'[a-zA-Z_][a-zA-Z0-9_]*',  'IDENTIFIER'),

    # Operators (multi-char before single-char!)
    (r'==',  'EQ'),
    (r'!=',  'NEQ'),
    (r'<=',  'LEQ'),
    (r'>=',  'GEQ'),
    (r'&&',  'AND'),
    (r'\|\|', 'OR'),
    (r'=',   'ASSIGN'),
    (r'\+',  'PLUS'),
    (r'-',   'MINUS'),
    (r'\*',  'STAR'),
    (r'/',   'SLASH'),
    (r'<',   'LT'),
    (r'>',   'GT'),

    # Delimiters
    (r'\(',  'LPAREN'),
    (r'\)',  'RPAREN'),
    (r'\{',  'LBRACE'),
    (r'\}',  'RBRACE'),
    (r';',   'SEMICOLON'),
    (r',',   'COMMA'),

    # Skip whitespace
    (r'[ \t\n\r]+',  'SKIP'),

    # Error
    (r'.',   'ERROR'),
]
```

**Key ordering rules:**
1. Keywords before identifiers
2. Float literals before integer literals (so `3.14` isn't tokenized as `3`, `.`, `14`)
3. Multi-character operators before single-character (`==` before `=`)

---

## Translating Regex to Token Definitions

Here's how to systematically convert a language specification into regex patterns:

### Step 1: Identify Token Categories

Read the language specification and list all token types:
- Reserved words (keywords)
- Identifiers
- Numeric literals (integer, float)
- String literals
- Operators
- Punctuation/delimiters
- Comments (to skip)
- Whitespace (to skip)

### Step 2: Write Regex for Each Category

For each token type, write the simplest correct regex:

```
keyword_if    = "if"
keyword_else  = "else"
identifier    = [a-zA-Z_][a-zA-Z0-9_]*
integer       = [0-9]+
float         = [0-9]+"."[0-9]+
string        = \"[^\"]*\"
plus          = "+"
minus         = "-"
```

### Step 3: Order by Priority

Arrange patterns so that:
- More specific patterns come before more general ones
- Longer fixed strings come before shorter ones that are prefixes

### Step 4: Add Error Handling

Always include a catch-all pattern at the end to handle unexpected characters gracefully.

---

## Practical Example: Complete Lexer in Python

Here's a working lexer using Python's `re` module:

```python
import re

# Token specification
TOKEN_SPEC = [
    ('FLOAT',      r'[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?'),
    ('INTEGER',    r'[0-9]+'),
    ('IF',         r'if(?![a-zA-Z0-9_])'),
    ('ELSE',       r'else(?![a-zA-Z0-9_])'),
    ('WHILE',      r'while(?![a-zA-Z0-9_])'),
    ('RETURN',     r'return(?![a-zA-Z0-9_])'),
    ('IDENT',      r'[a-zA-Z_][a-zA-Z0-9_]*'),
    ('STRING',     r'"([^"\\]|\\.)*"'),
    ('EQ',         r'=='),
    ('NEQ',        r'!='),
    ('LEQ',        r'<='),
    ('GEQ',        r'>='),
    ('ASSIGN',     r'='),
    ('PLUS',       r'\+'),
    ('MINUS',      r'-'),
    ('STAR',       r'\*'),
    ('SLASH',      r'/'),
    ('LT',         r'<'),
    ('GT',         r'>'),
    ('LPAREN',     r'\('),
    ('RPAREN',     r'\)'),
    ('LBRACE',     r'\{'),
    ('RBRACE',     r'\}'),
    ('SEMI',       r';'),
    ('COMMA',      r','),
    ('NEWLINE',    r'\n'),
    ('SKIP',       r'[ \t]+'),
    ('COMMENT',    r'//[^\n]*'),
    ('ERROR',      r'.'),
]

# Compile into one big regex with named groups
token_regex = '|'.join(
    f'(?P<{name}>{pattern})' for name, pattern in TOKEN_SPEC
)
master_pattern = re.compile(token_regex)


def tokenize(source_code):
    """Tokenize source code, yielding (type, value, line, col) tuples."""
    line_num = 1
    line_start = 0

    for match in master_pattern.finditer(source_code):
        token_type = match.lastgroup
        value = match.group()
        col = match.start() - line_start + 1

        if token_type == 'NEWLINE':
            line_num += 1
            line_start = match.end()
        elif token_type == 'SKIP' or token_type == 'COMMENT':
            pass  # Ignore whitespace and comments
        elif token_type == 'ERROR':
            raise SyntaxError(
                f"Unexpected character '{value}' at line {line_num}, col {col}"
            )
        else:
            yield (token_type, value, line_num, col)


# Test the lexer
source = '''
int x = 42;
float pi = 3.14;
if (x == 42) {
    return pi;
}
'''

print("Tokens:")
print("-" * 50)
for tok_type, value, line, col in tokenize(source):
    print(f"  {tok_type:10s} | {value:15s} | line {line}, col {col}")
```

**Output:**
```
Tokens:
--------------------------------------------------
  IF         | if              | line 1, col 1
  ...
  INTEGER    | 42              | line 2, col 10
  SEMI       | ;               | line 2, col 12
  FLOAT      | 3.14            | line 3, col 13
  ...
```

---

## Word Boundary Problem

Notice the `(?![a-zA-Z0-9_])` in keyword patterns above. This is a **negative lookahead** that prevents `"ifvar"` from matching keyword `if` followed by identifier `var`.

Without word boundaries:
- Input: `"ifvar"`
- Pattern `if` matches at position 0 (length 2)
- Pattern `[a-zA-Z_][a-zA-Z0-9_]*` matches at position 0 (length 5)
- Longest match wins → `"ifvar"` is an identifier ✓

With longest-match rule, this works correctly! The problem only arises in tools that don't implement longest match. In standard lexer generators (Lex/Flex), longest match is automatic.

---

## Example: C-Style Number Literals

Real languages have complex number formats:

```
# Decimal integer
decimal    = [1-9][0-9]*|0

# Hex integer
hex        = 0[xX][0-9a-fA-F]+

# Octal integer
octal      = 0[0-7]+

# Binary integer
binary     = 0[bB][01]+

# Float
float      = [0-9]+\.[0-9]*([eE][+-]?[0-9]+)?
           | \.[0-9]+([eE][+-]?[0-9]+)?
           | [0-9]+[eE][+-]?[0-9]+

# Combined number pattern (order matters!)
number     = hex | binary | octal | float | decimal
```

**Priority ordering for numbers:**
1. Hex (`0x...`) — most specific prefix
2. Binary (`0b...`) — specific prefix
3. Octal (`0...`) — starts with 0
4. Float — contains dot or exponent
5. Decimal — general case

---

## Common Pitfalls

### 1. Greedy Matching Gone Wrong

Pattern `".*"` for strings is **greedy** — it matches from the first `"` to the **last** `"` in the input:

```
Input:  "hello" + "world"
Match:  "hello" + "world"    ← Wrong! Matches everything
```

Fix: Use `"[^"]*"` (match non-quote characters) instead of `".*"`.

### 2. Forgetting to Escape Special Characters

The dot `.` means "any character" in regex. To match a literal dot (for floats), use `\.`:

```
Wrong:  [0-9]+.[0-9]+     ← dot matches ANY character
Right:  [0-9]+\.[0-9]+    ← dot matches only '.'
```

### 3. Missing the Empty Case

Pattern `[0-9]*` can match **zero** digits (empty string). Use `[0-9]+` to require at least one digit.

### 4. Ambiguous Operator Prefixes

Input `"<="`:
- Pattern `<` matches 1 character
- Pattern `<=` matches 2 characters
- Longest match → `<=` wins ✓

Always ensure multi-character operators are in your specification!

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Basic regex ops | Union `\|`, concatenation, Kleene star `*` |
| Extended syntax | `+`, `?`, `[...]`, `.`, escape `\` |
| Token patterns | Each token type = one regex |
| Priority | Keywords > identifiers, longer > shorter |
| Longest match | Always take the longest matching prefix |
| Ordering | Specific before general, long before short |

The regex-based token specification is the **input** to a lexer generator. In the next lesson, we'll see how these regex patterns are converted into finite automata for efficient scanning.

---

## Exercises

1. Write a regex for Python-style identifiers (can't start with a digit, can contain Unicode letters in Python 3 — simplify to ASCII).

2. Write a regex for C-style multi-line comments `/* ... */`. Why is `"/\*.*\*/"` incorrect?

3. Given the input `"return1"`, explain why longest-match correctly identifies this as an identifier, not keyword `return` followed by `1`.

4. Write a complete token specification (ordered regex list) for a calculator language with: integers, floats, `+`, `-`, `*`, `/`, `(`, `)`, and whitespace.

5. The regex `[0-9]+\.?[0-9]*` is intended to match both integers and floats. What's wrong with this approach for a lexer that needs to distinguish the two types?

6. Write regex patterns for the following Python tokens:
   - Integer literal (decimal, hex, octal, binary)
   - Float literal (with optional exponent)
   - String literal (single-quoted and double-quoted, with escape sequences)

7. Explain why the order of patterns matters when your specification includes both `==` and `=`. What happens if `=` comes first with longest-match semantics?
