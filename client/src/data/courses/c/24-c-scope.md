---
title: C Scope and Storage
---

# C Scope and Storage

**Scope** is *where* a name is visible. **Storage duration** is *how long* the variable lives. C distinguishes them more sharply than most languages — and getting them right is what makes a multi-file program work.

## Block scope (local variables)

A variable declared inside `{ ... }` is visible only there. It's created when control enters the block and destroyed when control leaves:

```c
int main(void) {
    int x = 10;        // visible from here…

    {
        int y = 20;    // y exists only inside this inner block
        printf("%d %d\n", x, y);
    }

    /* y is gone here */
    printf("%d\n", x);
    return 0;
}
```

Function parameters are also block-scoped — they live for the function's execution.

## File scope (global variables)

A variable declared **outside** any function has file scope. It's visible from its declaration to the end of the file:

```c
int counter = 0;       // file scope (global)

void bump(void) { counter++; }
int  current(void) { return counter; }
```

Use globals **sparingly**. They make code hard to test and reason about because any function can secretly modify them.

## Storage duration

Every variable has one of three storage durations:

| Duration | When created / destroyed | Examples |
|----------|--------------------------|----------|
| **automatic** | Created on entry to its block, destroyed on exit | local variables |
| **static** | Created once, lives until the program exits | globals, locals declared `static` |
| **allocated** | Lives from `malloc` to `free` | dynamic memory (next lessons) |

## `static` local variables

A `static` local keeps its value **between calls** but is still only visible inside the function:

```c
int next_id(void) {
    static int counter = 0;     // initialized once, ever
    return ++counter;
}

int main(void) {
    printf("%d\n", next_id());   // 1
    printf("%d\n", next_id());   // 2
    printf("%d\n", next_id());   // 3
    return 0;
}
```

Excellent for caches, counters, or one-time setup. The initializer runs only the first time the function is reached.

## `static` at file scope — internal linkage

Putting `static` on a **global** restricts it to the current file (no other `.c` file can see it):

```c
// audio.c
static int volume = 50;          // private to audio.c
void set_volume(int v) { volume = v; }
int  get_volume(void) { return volume; }
```

Other files calling `set_volume` and `get_volume` is fine — but they can't directly read or modify `volume`. This is C's only encapsulation mechanism.

## `extern` — sharing globals across files

To declare a global in one file and use it in another:

```c
// counters.c
int total_users = 0;             // definition

// main.c
extern int total_users;          // declaration — "exists somewhere else"

int main(void) {
    total_users++;
    return 0;
}
```

`extern` says "this variable is defined in another translation unit; the linker will resolve it." Without `extern`, the second declaration would create a *separate* variable.

The standard pattern is to put the `extern` declaration in a header file:

```c
// counters.h
extern int total_users;

// counters.c
#include "counters.h"
int total_users = 0;             // single definition
```

## Visibility vs lifetime — a summary table

| Declaration | Scope | Storage |
|-------------|-------|---------|
| `int x;` *inside a function* | block | automatic |
| `static int x;` *inside a function* | block | static |
| `int x;` *outside any function* | file (external linkage) | static |
| `static int x;` *outside any function* | file (internal linkage) | static |
| `extern int x;` | file | static (defined elsewhere) |

## Shadowing

A name in an inner scope **hides** the same name in an outer scope:

```c
int x = 1;

void f(void) {
    int x = 2;            // shadows the global
    printf("%d\n", x);    // 2

    {
        int x = 3;        // shadows again
        printf("%d\n", x);// 3
    }

    printf("%d\n", x);    // 2 — the inner one is gone
}
```

Shadowing is legal but confusing. Most style guides discourage it. Compile with `-Wshadow` to get warnings.

## Variable initialization defaults

- **Global / static** variables are zero-initialized by default.
- **Automatic** (local) variables are **uninitialized** — they contain whatever bytes were already there. *Always* initialize them.

```c
int g;                  // ✅ guaranteed 0 (global)

void f(void) {
    int local;          // ❌ garbage value
    static int s;       // ✅ guaranteed 0 (static local)
}
```

## `register` and `auto`

Two keywords you may see in old code:

- `auto` — an explicit "I want automatic storage." It's the default, so essentially never written. (In C++ and C23 it has a *different* meaning.)
- `register` — "please put this in a CPU register if you can." Modern compilers ignore this hint completely; they're better at register allocation than humans.

You can safely forget both.

## Putting it together — a thread-unsafe ID generator

```c
#include <stdio.h>

static int created_count = 0;       // file-static

int next_id(void) {
    static int local_counter = 0;   // function-static
    local_counter++;
    created_count++;
    return local_counter;
}

int total_created(void) {
    return created_count;
}

int main(void) {
    for (int i = 0; i < 4; i++) {
        printf("id=%d total=%d\n", next_id(), total_created());
    }
    return 0;
}
```

Output:

```
id=1 total=1
id=2 total=2
id=3 total=3
id=4 total=4
```

`created_count` is invisible outside this file; `local_counter` is invisible outside `next_id`. Both persist across calls.
