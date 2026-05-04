---
title: LL(1) Parser Implementation
---

# LL(1) Parser Implementation

In the previous lesson, we built LL(1) parse tables by hand. Now it's time to turn that theory into working code. A **table-driven LL(1) parser** is elegant, efficient, and forms the backbone of many real-world compiler front ends.

---

## How a Table-Driven LL(1) Parser Works

The parser uses three components:

1. **Input buffer** — the token stream (terminated by `$`)
2. **Stack** — tracks expected symbols (initialized with `$ S` where `S` is the start symbol)
3. **Parse table** — a 2D array indexed by `[non-terminal][terminal]`

### The Algorithm

```
push $ onto stack
push start symbol onto stack
set ip to first input token

repeat:
    let X = top of stack
    let a = current input token

    if X is a terminal or $:
        if X == a:
            pop stack
            advance ip
        else:
            error()
    else:  // X is a non-terminal
        if M[X, a] = X → Y1 Y2 ... Yk:
            pop stack
            push Yk, ..., Y2, Y1 onto stack (rightmost first)
        else:
            error()

until stack is empty
```

> **Key insight:** We push production symbols in **reverse order** so the leftmost symbol ends up on top.

---

## Parse Table as a 2D Array

Consider this grammar for arithmetic expressions:

$$
\begin{aligned}
E &\rightarrow T\ E' \\
E' &\rightarrow +\ T\ E'\ |\ \varepsilon \\
T &\rightarrow F\ T' \\
T' &\rightarrow *\ F\ T'\ |\ \varepsilon \\
F &\rightarrow (\ E\ )\ |\ \text{id}
\end{aligned}
$$

The parse table:

| | id | + | * | ( | ) | $ |
|---|---|---|---|---|---|---|
| E | E→TE' | | | E→TE' | | |
| E' | | E'→+TE' | | | E'→ε | E'→ε |
| T | T→FT' | | | T→FT' | | |
| T' | | T'→ε | T'→*FT' | | T'→ε | T'→ε |
| F | F→id | | | F→(E) | | |

---

## Implementation in C (Core Logic)

The C implementation uses enums for tokens/non-terminals, a 2D array for the parse table, and a stack of symbols:

```c
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

enum Token { ID, PLUS, STAR, LPAREN, RPAREN, DOLLAR };
enum NonTerm { E, EP, T, TP, F, NT_COUNT };

// Productions: index → {lhs, rhs_length, rhs_symbols}
// rhs_symbols encoded as (is_terminal, value) pairs
int parse_table[NT_COUNT][6] = {
    /*        id   +    *    (    )    $  */
    /* E  */ { 0,  -1,  -1,  0,  -1,  -1},
    /* E' */ {-1,   1,  -1, -1,   2,   2},
    /* T  */ { 3,  -1,  -1,  3,  -1,  -1},
    /* T' */ {-1,   5,   4, -1,   5,   5},
    /* F  */ { 7,  -1,  -1,  6,  -1,  -1}
};

#define MAX_STACK 200
typedef struct { int is_term; int val; } Sym;
Sym stack[MAX_STACK];
int top = -1;

void push(Sym s) { stack[++top] = s; }
Sym pop(void) { return stack[top--]; }

void parse(const char *src) {
    // Tokenizer + main loop
    push((Sym){1, DOLLAR});
    push((Sym){0, E});
    int pos = 0;
    // ... get token, match/expand loop as per algorithm above
    // Full source: see Python version below for readable reference
}
```

> The C version is ideal for embedded compilers. For the complete working code with lexer and output, see the Python implementation below — the logic is identical.

---

## Python Implementation

Here's the same parser in Python — cleaner and easier to extend:

```python
class LL1Parser:
    """Table-driven LL(1) parser for arithmetic expressions."""

    def __init__(self):
        # Define grammar productions
        self.productions = {
            0: ("E",  ["T", "E'"]),
            1: ("E'", ["+", "T", "E'"]),
            2: ("E'", []),              # epsilon
            3: ("T",  ["F", "T'"]),
            4: ("T'", ["*", "F", "T'"]),
            5: ("T'", []),              # epsilon
            6: ("F",  ["(", "E", ")"]),
            7: ("F",  ["id"]),
        }

        self.terminals = {"id", "+", "*", "(", ")", "$"}
        self.non_terminals = {"E", "E'", "T", "T'", "F"}

        # Parse table: M[non_terminal][terminal] = production number
        self.table = {
            "E":  {"id": 0, "(": 0},
            "E'": {"+": 1, ")": 2, "$": 2},
            "T":  {"id": 3, "(": 3},
            "T'": {"+": 5, "*": 4, ")": 5, "$": 5},
            "F":  {"id": 7, "(": 6},
        }

    def tokenize(self, text):
        """Simple tokenizer for arithmetic expressions."""
        tokens = []
        i = 0
        while i < len(text):
            if text[i].isspace():
                i += 1
            elif text[i] in "+-*/()":
                tokens.append(text[i])
                i += 1
            elif text[i].isalpha():
                j = i
                while j < len(text) and text[j].isalnum():
                    j += 1
                tokens.append("id")
                i = j
            elif text[i].isdigit():
                j = i
                while j < len(text) and text[j].isdigit():
                    j += 1
                tokens.append("id")  # treat numbers as id
                i = j
            else:
                raise ValueError(f"Unknown character: {text[i]}")
        tokens.append("$")
        return tokens

    def parse(self, text):
        """Parse input string. Returns True if accepted."""
        tokens = self.tokenize(text)
        stack = ["$", "E"]  # bottom-to-top: $ is bottom
        ip = 0  # input pointer

        print(f"Parsing: {text}")
        print(f"{'Stack':<30} {'Input':<20} {'Action'}")
        print("-" * 70)

        while stack:
            top = stack[-1]
            current = tokens[ip]

            stack_str = " ".join(reversed(stack))
            input_str = " ".join(tokens[ip:])
            
            if top in self.terminals or top == "$":
                if top == current:
                    stack.pop()
                    ip += 1
                    print(f"{stack_str:<30} {input_str:<20} match '{top}'")
                else:
                    print(f"ERROR: expected '{top}', got '{current}'")
                    return False
            elif top in self.non_terminals:
                if current in self.table.get(top, {}):
                    prod_num = self.table[top][current]
                    _, rhs = self.productions[prod_num]
                    stack.pop()
                    # Push in reverse order
                    for symbol in reversed(rhs):
                        stack.append(symbol)
                    rhs_str = " ".join(rhs) if rhs else "ε"
                    print(f"{stack_str:<30} {input_str:<20} {top} → {rhs_str}")
                else:
                    print(f"ERROR: no entry for M[{top}, {current}]")
                    return False
            else:
                print(f"ERROR: unknown symbol '{top}'")
                return False

        if ip == len(tokens) - 1 and tokens[ip] == "$":
            print("\n✓ Parsing successful!")
            return True
        else:
            print("\n✗ Parsing failed: input not consumed")
            return False


# Test the parser
parser = LL1Parser()
parser.parse("a + b * c")
parser.parse("(x + y) * z")
```

Running this produces a step-by-step trace showing how the stack evolves, tokens are matched, and productions are applied — demonstrating the `E → T E' → F T' E' → id T' E' → ...` expansion sequence.

---

## Building a Parse Tree During LL(1) Parsing

We can construct the **parse tree** while parsing by attaching children to nodes as productions are applied. The key change: the stack holds `(symbol, tree_node)` pairs.

```python
class TreeNode:
    def __init__(self, symbol, is_terminal=False):
        self.symbol = symbol
        self.is_terminal = is_terminal
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def print_tree(self, indent=0):
        prefix = "  " * indent
        label = f"'{self.symbol}'" if self.is_terminal else self.symbol
        print(f"{prefix}{label}")
        for child in self.children:
            child.print_tree(indent + 1)


class LL1ParserWithTree(LL1Parser):
    """LL(1) parser that builds a parse tree."""

    def parse_tree(self, text):
        tokens = self.tokenize(text)
        root = TreeNode("E")
        stack = [("$", None), ("E", root)]
        ip = 0

        while stack:
            top_sym, top_node = stack[-1]
            current = tokens[ip]

            if top_sym in self.terminals or top_sym == "$":
                if top_sym == current:
                    stack.pop()
                    ip += 1
                else:
                    return None
            elif top_sym in self.non_terminals:
                if current in self.table.get(top_sym, {}):
                    prod_num = self.table[top_sym][current]
                    _, rhs = self.productions[prod_num]
                    stack.pop()
                    if not rhs:
                        top_node.add_child(TreeNode("ε", True))
                    else:
                        child_nodes = []
                        for sym in rhs:
                            child = TreeNode(sym, sym in self.terminals)
                            top_node.add_child(child)
                            child_nodes.append(child)
                        for sym, node in reversed(list(zip(rhs, child_nodes))):
                            stack.append((sym, node))
                else:
                    return None

        root.print_tree()
        return root

# Usage: parser = LL1ParserWithTree(); parser.parse_tree("a + b * c")
# Output: E → T → F → 'id', T' → 'ε', E' → '+' → T → F → 'id', T' → '*' ...
```

---

## Error Recovery

When the parser encounters an error (empty table entry), we need a strategy to continue parsing and report multiple errors.

### Panic Mode Recovery

The idea: skip input tokens until we find a **synchronizing token** — one that allows parsing to resume.

**Synchronizing tokens** for a non-terminal $A$:

- Tokens in $\text{FOLLOW}(A)$ — we can pop $A$ and pretend it was matched
- Tokens in $\text{FIRST}(A)$ — we can try parsing $A$ again

```python
class LL1ParserWithRecovery(LL1Parser):
    """LL(1) parser with panic-mode error recovery."""

    def __init__(self):
        super().__init__()
        # FOLLOW sets for synchronization
        self.follow = {
            "E":  {")", "$"},
            "E'": {")", "$"},
            "T":  {"+", ")", "$"},
            "T'": {"+", ")", "$"},
            "F":  {"+", "*", ")", "$"},
        }
        # FIRST sets (without epsilon)
        self.first = {
            "E":  {"id", "("},
            "E'": {"+"},
            "T":  {"id", "("},
            "T'": {"*"},
            "F":  {"id", "("},
        }

    def parse_with_recovery(self, text):
        """Parse with panic-mode error recovery."""
        tokens = self.tokenize(text)
        stack = ["$", "E"]
        ip = 0
        errors = []

        print(f"Parsing: {text}\n")

        while stack:
            top = stack[-1]
            current = tokens[ip]

            if top in self.terminals or top == "$":
                if top == current:
                    stack.pop()
                    ip += 1
                else:
                    # Error: missing terminal
                    errors.append(
                        f"Error at position {ip}: expected '{top}', got '{current}'"
                    )
                    # Pop the expected terminal and continue
                    stack.pop()
                    print(f"  → Inserted missing '{top}'")
            elif top in self.non_terminals:
                if current in self.table.get(top, {}):
                    prod_num = self.table[top][current]
                    _, rhs = self.productions[prod_num]
                    stack.pop()
                    for symbol in reversed(rhs):
                        stack.append(symbol)
                else:
                    # Error: no table entry
                    errors.append(
                        f"Error at position {ip}: unexpected '{current}' "
                        f"(expected something in FIRST({top}))"
                    )
                    # Panic mode: skip tokens until synchronizing token
                    sync_set = self.follow[top] | self.first[top]
                    while ip < len(tokens) and tokens[ip] not in sync_set:
                        print(f"  → Skipping '{tokens[ip]}'")
                        ip += 1
                    if ip < len(tokens) and tokens[ip] in self.first[top]:
                        # Try parsing top again
                        print(f"  → Resuming with '{tokens[ip]}'")
                    else:
                        # Pop non-terminal
                        stack.pop()
                        print(f"  → Popped '{top}'")

        if errors:
            print(f"\nParsing completed with {len(errors)} error(s):")
            for err in errors:
                print(f"  {err}")
        else:
            print("\n✓ Parsing successful (no errors)")

        return len(errors) == 0


# Test error recovery
parser = LL1ParserWithRecovery()
parser.parse_with_recovery("a + + b")
print()
parser.parse_with_recovery("a * ( b + )")
```

---

### Phrase-Level Recovery

Instead of just skipping tokens, we can make **local corrections**:

| Error Situation | Recovery Action |
|---|---|
| Missing operand | Insert a dummy `id` |
| Missing operator | Insert `+` |
| Extra `)` | Delete the `)` |
| Missing `)` | Insert `)` |

```python
def phrase_level_recover(self, top, current, tokens, ip):
    """Attempt phrase-level recovery."""
    # Missing operand before operator
    if top == "F" and current in {"+", "*"}:
        print("  → Inserted missing operand")
        return "insert_id"
    
    # Extra closing paren
    if current == ")" and ")" not in self.follow.get(top, set()):
        print("  → Deleted extra ')'")
        return "skip_token"
    
    # Default: use panic mode
    return "panic"
```

---

## Complexity Analysis

For an input of $n$ tokens:

- **Time complexity:** $O(n)$ — each token is matched exactly once, and at most a constant number of stack operations per token
- **Space complexity:** $O(n)$ — stack depth proportional to parse tree height (which is $O(n)$ in worst case for right-recursive grammars)

The parse table lookup is $O(1)$ since it's a 2D array indexed by enumerated values.

---

## Complete Example: Parsing `(a + b) * c`

| Step | Stack | Input | Action |
|------|-------|-------|--------|
| 1 | `E $` | `( id + id ) * id $` | E → T E' |
| 2 | `T E' $` | `( id + id ) * id $` | T → F T' |
| 3 | `F T' E' $` | `( id + id ) * id $` | F → ( E ) |
| 4 | `( E ) T' E' $` | `( id + id ) * id $` | match `(` |
| 5 | `E ) T' E' $` | `id + id ) * id $` | E → T E' |
| ... | ... | ... | ... |
| 17 | `) T' E' $` | `) * id $` | match `)` |
| 18 | `T' E' $` | `* id $` | T' → * F T' |
| 19 | `* F T' E' $` | `* id $` | match `*` |
| 20 | `F T' E' $` | `id $` | F → id |
| 21 | `id T' E' $` | `id $` | match `id` |
| 22 | `T' E' $` | `$` | T' → ε |
| 23 | `E' $` | `$` | E' → ε |
| 24 | `$` | `$` | match `$` ✓ |

> The key insight: parenthesized sub-expression is parsed recursively (steps 5–16), then `* id` is handled by `T'` after `)` is matched.

---

## Try It Yourself

### Exercise 1: Extend the Grammar

Add subtraction and division to the grammar:

$$
\begin{aligned}
E' &\rightarrow +\ T\ E'\ |\ -\ T\ E'\ |\ \varepsilon \\
T' &\rightarrow *\ F\ T'\ |\ /\ F\ T'\ |\ \varepsilon
\end{aligned}
$$

Update the parse table and implementation to handle these operators.

### Exercise 2: Parse Table Generator

Write a program that:
1. Takes a grammar as input
2. Computes FIRST and FOLLOW sets
3. Generates the LL(1) parse table automatically
4. Reports any conflicts (not LL(1))

### Exercise 3: Error Messages

Improve the error recovery to produce messages like:
- "Missing operand before '+' on line 3"
- "Unmatched '(' — expected ')' before end of expression"

### Exercise 4: Trace Output

Modify the Python parser to output a step-by-step trace in HTML table format suitable for a web page.

### Exercise 5: Boolean Expressions

Design an LL(1) grammar for boolean expressions with `and`, `or`, `not`, and parentheses. Implement the complete parser with error recovery.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Table-driven parsing | Stack + parse table + input = simple loop |
| Production push order | Push RHS symbols in **reverse** |
| Parse tree | Attach children as productions are applied |
| Panic mode | Skip to synchronizing token, pop or retry |
| Phrase-level | Make specific local corrections |
| Complexity | $O(n)$ time, $O(n)$ space |

---

## Next Lesson

We move beyond top-down parsing to explore **bottom-up parsing** — a more powerful technique that can handle a larger class of grammars. Get ready for shift-reduce!
