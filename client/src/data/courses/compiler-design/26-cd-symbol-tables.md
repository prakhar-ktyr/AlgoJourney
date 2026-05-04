---
title: Symbol Tables
---

# Symbol Tables

A **symbol table** is a data structure used by a compiler to store information about identifiers (variables, functions, types, etc.) encountered in the source program. It is one of the most important components of a compiler.

---

## Why Do We Need Symbol Tables?

When you write code like:

```c
int x = 10;
float y = 3.14;
x = x + 1;
```

The compiler needs to remember:
- `x` is an integer variable
- `y` is a float variable
- `x` has already been declared (so redeclaration is an error)
- The assignment `x = x + 1` is valid (int + int → int)

The **symbol table** stores all this information.

---

## What Information Is Stored?

Each entry in the symbol table contains:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | The identifier string | `x`, `myFunc` |
| **Type** | Data type | `int`, `float`, `char*` |
| **Scope** | Where it's visible | `global`, `local`, `block` |
| **Memory Location** | Address or offset | offset 0, 4, 8... |
| **Size** | Bytes occupied | 4, 8, 1... |
| **Line Number** | Where declared | line 5 |
| **Parameters** | For functions | `(int, float)` |

---

## Symbol Table Operations

The symbol table supports these core operations:

### 1. Insert (Define)

Add a new identifier to the table.

```c
// When the compiler sees:
int count = 0;

// It inserts:
// name="count", type=INT, scope=current, offset=next_available
```

### 2. Lookup (Search)

Find an identifier in the table.

```c
// When the compiler sees:
count = count + 1;

// It looks up "count" to verify:
// - It has been declared
// - Its type (for type checking)
// - Its memory location (for code generation)
```

### 3. Enter Scope

Create a new scope level (entering a function, block, etc.).

```c
void foo() {       // Enter scope level 1
    int x = 5;
    if (x > 0) {  // Enter scope level 2
        int y = 10;
    }              // Exit scope level 2
}                  // Exit scope level 1
```

### 4. Exit Scope

Remove or hide identifiers from the current scope.

---

## Implementation: Hash Table with Scope Chaining

The most common implementation uses a **hash table** combined with a **scope stack**.

### Hash Function

A simple hash function for identifier names:

$$h(name) = \left(\sum_{i=0}^{n-1} name[i] \times 31^i\right) \mod \text{TABLE\_SIZE}$$

### Basic Structure

```c
#define TABLE_SIZE 211
#define MAX_SCOPES 50

typedef struct Symbol {
    char name[64];
    char type[32];
    int scope_level;
    int offset;
    int line_declared;
    int is_function;
    int param_count;
    struct Symbol *next;  // For hash chaining
} Symbol;

typedef struct ScopeTable {
    Symbol *buckets[TABLE_SIZE];
    int scope_level;
    int next_offset;
} ScopeTable;

typedef struct SymbolTable {
    ScopeTable *scopes[MAX_SCOPES];
    int current_scope;
} SymbolTable;
```

---

## Scope Management: Stack of Scope Tables

Each time we enter a new scope, we push a new scope table onto the stack. When we exit, we pop it.

```
Stack of Scopes:
┌─────────────────┐
│ Scope 2 (block) │  ← current (top)
├─────────────────┤
│ Scope 1 (func)  │
├─────────────────┤
│ Scope 0 (global)│
└─────────────────┘
```

### Lookup Strategy

When looking up a name, search from the **top** of the stack downward:

1. Check current scope (top)
2. If not found, check enclosing scope
3. Continue until global scope
4. If still not found → **undeclared identifier error**

---

## Complete Implementation

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TABLE_SIZE 211
#define MAX_SCOPES 50

typedef struct Symbol {
    char name[64];
    char type[32];
    int scope_level;
    int offset;
    int line_declared;
    int is_function;
    int param_count;
    struct Symbol *next;
} Symbol;

typedef struct ScopeTable {
    Symbol *buckets[TABLE_SIZE];
    int scope_level;
    int next_offset;
} ScopeTable;

typedef struct SymbolTable {
    ScopeTable *scopes[MAX_SCOPES];
    int current_scope;
} SymbolTable;

// Hash function
unsigned int hash(const char *name) {
    unsigned int h = 0;
    while (*name) {
        h = h * 31 + (*name);
        name++;
    }
    return h % TABLE_SIZE;
}

// Create a new symbol table
SymbolTable *create_symbol_table() {
    SymbolTable *st = calloc(1, sizeof(SymbolTable));
    st->current_scope = -1;
    return st;
}

// Enter a new scope
void enter_scope(SymbolTable *st) {
    st->current_scope++;
    st->scopes[st->current_scope] = calloc(1, sizeof(ScopeTable));
    st->scopes[st->current_scope]->scope_level = st->current_scope;
    st->scopes[st->current_scope]->next_offset = 0;
    printf("Entering scope level %d\n", st->current_scope);
}

// Exit current scope
void exit_scope(SymbolTable *st) {
    printf("Exiting scope level %d\n", st->current_scope);
    // Free all symbols in current scope
    ScopeTable *scope = st->scopes[st->current_scope];
    for (int i = 0; i < TABLE_SIZE; i++) {
        Symbol *sym = scope->buckets[i];
        while (sym) {
            Symbol *temp = sym;
            sym = sym->next;
            free(temp);
        }
    }
    free(scope);
    st->scopes[st->current_scope] = NULL;
    st->current_scope--;
}

// Insert a symbol into current scope
int insert_symbol(SymbolTable *st, const char *name,
                  const char *type, int line, int is_func) {
    ScopeTable *scope = st->scopes[st->current_scope];
    unsigned int idx = hash(name);

    // Check if already declared in current scope
    Symbol *existing = scope->buckets[idx];
    while (existing) {
        if (strcmp(existing->name, name) == 0) {
            printf("Error: '%s' already declared in scope %d\n",
                   name, st->current_scope);
            return 0;  // Duplicate
        }
        existing = existing->next;
    }

    // Create new symbol
    Symbol *sym = calloc(1, sizeof(Symbol));
    strncpy(sym->name, name, 63);
    strncpy(sym->type, type, 31);
    sym->scope_level = st->current_scope;
    sym->line_declared = line;
    sym->is_function = is_func;

    // Assign offset
    int size = 4;  // Default 4 bytes
    if (strcmp(type, "double") == 0) size = 8;
    if (strcmp(type, "char") == 0) size = 1;
    sym->offset = scope->next_offset;
    scope->next_offset += size;

    // Insert at head of chain
    sym->next = scope->buckets[idx];
    scope->buckets[idx] = sym;

    printf("Inserted '%s' (type=%s, scope=%d, offset=%d)\n",
           name, type, st->current_scope, sym->offset);
    return 1;
}

// Lookup a symbol (searches all scopes from current to global)
Symbol *lookup_symbol(SymbolTable *st, const char *name) {
    for (int s = st->current_scope; s >= 0; s--) {
        ScopeTable *scope = st->scopes[s];
        unsigned int idx = hash(name);
        Symbol *sym = scope->buckets[idx];
        while (sym) {
            if (strcmp(sym->name, name) == 0) {
                return sym;
            }
            sym = sym->next;
        }
    }
    return NULL;  // Not found
}

// Lookup only in current scope
Symbol *lookup_current_scope(SymbolTable *st, const char *name) {
    ScopeTable *scope = st->scopes[st->current_scope];
    unsigned int idx = hash(name);
    Symbol *sym = scope->buckets[idx];
    while (sym) {
        if (strcmp(sym->name, name) == 0) {
            return sym;
        }
        sym = sym->next;
    }
    return NULL;
}
```

---

## Example Usage

```c
int main() {
    SymbolTable *st = create_symbol_table();

    // Global scope
    enter_scope(st);
    insert_symbol(st, "printf", "function", 1, 1);
    insert_symbol(st, "globalVar", "int", 2, 0);

    // Function scope
    enter_scope(st);
    insert_symbol(st, "x", "int", 5, 0);
    insert_symbol(st, "y", "float", 6, 0);

    // Block scope
    enter_scope(st);
    insert_symbol(st, "x", "double", 8, 0);  // Shadows outer x

    // Lookup tests
    Symbol *s = lookup_symbol(st, "x");
    if (s) printf("Found 'x': type=%s, scope=%d\n", s->type, s->scope_level);
    // Prints: Found 'x': type=double, scope=2

    s = lookup_symbol(st, "globalVar");
    if (s) printf("Found 'globalVar': type=%s, scope=%d\n", s->type, s->scope_level);
    // Prints: Found 'globalVar': type=int, scope=0

    exit_scope(st);  // Exit block
    exit_scope(st);  // Exit function
    exit_scope(st);  // Exit global

    free(st);
    return 0;
}
```

**Output:**
```
Entering scope level 0
Inserted 'printf' (type=function, scope=0, offset=0)
Inserted 'globalVar' (type=int, scope=0, offset=4)
Entering scope level 1
Inserted 'x' (type=int, scope=1, offset=0)
Inserted 'y' (type=float, scope=1, offset=4)
Entering scope level 2
Inserted 'x' (type=double, scope=2, offset=0)
Found 'x': type=double, scope=2
Found 'globalVar': type=int, scope=0
Exiting scope level 2
Exiting scope level 1
Exiting scope level 0
```

---

## Symbol Table Entries by Category

### Variable Entry

```
Name: count
Type: int
Scope: 1 (function body)
Offset: 8
Size: 4
Line: 12
```

### Function Entry

```
Name: add
Type: int
Scope: 0 (global)
Return Type: int
Parameters: [(int, a), (int, b)]
Param Count: 2
Line: 20
```

### Type Entry (for user-defined types)

```
Name: Point
Type: struct
Scope: 0 (global)
Size: 8
Fields: [(int, x, offset=0), (int, y, offset=4)]
Line: 3
```

---

## Handling Shadowing

**Shadowing** occurs when a variable in an inner scope has the same name as one in an outer scope:

```c
int x = 10;          // Global x

void foo() {
    int x = 20;      // Local x shadows global x
    printf("%d", x); // Prints 20
}
```

Our lookup strategy naturally handles this — searching from the innermost scope first means the local `x` is found before the global `x`.

---

## Common Errors Detected via Symbol Tables

| Error | Detection |
|-------|-----------|
| Undeclared variable | Lookup returns NULL |
| Duplicate declaration | Insert finds name in current scope |
| Type mismatch | Lookup returns wrong type |
| Wrong number of arguments | Function entry has param_count |
| Use before declaration | Line of use < line of declaration |

---

## Exercises

**Exercise 1:** Trace the symbol table contents after each line:

```c
int a = 1;
float b = 2.0;
void foo(int c) {
    int a = 3;
    {
        float c = 4.0;
    }
}
```

**Exercise 2:** What does `lookup("a")` return when called:
- Inside the inner block of `foo`?
- At global scope after `foo` definition?

**Exercise 3:** Extend the Python implementation to:
- Track memory offsets for each variable
- Support function entries with parameter lists
- Print the full symbol table at any point

**Exercise 4:** Implement a `print_all_visible()` function that shows all symbols visible from the current scope (handling shadowing correctly).

**Exercise 5:** Given this code, identify which lines produce symbol table errors:

```c
int x = 5;
int x = 10;       // Line 2
y = 20;           // Line 3
int foo(int a) {
    float a;      // Line 5
    return a;
}
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Purpose | Store identifier information for semantic analysis |
| Operations | Insert, lookup, enter/exit scope |
| Implementation | Hash table + scope stack |
| Lookup order | Innermost scope → outermost scope |
| Shadowing | Inner declarations hide outer ones |
| Error detection | Undeclared, duplicate, type mismatch |

---

## Next Steps

In the next lesson, we'll explore **Type Systems** — how compilers classify values and enforce type rules using the information stored in symbol tables.
