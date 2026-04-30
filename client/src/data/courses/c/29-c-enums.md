---
title: C Enums
---

# C Enums

An **enumeration** is a custom integer type whose values have human-friendly names. Use enums to give meaning to "magic numbers" — the alternative is a sea of `0`, `1`, `2`s in your code.

## Declaring an enum

```c
enum Color { RED, GREEN, BLUE };

enum Color c = GREEN;
printf("%d\n", c);     // 1
```

By default, the first name is `0` and each subsequent name is one more than the previous. So `RED == 0`, `GREEN == 1`, `BLUE == 2`.

## Custom values

You can assign explicit values:

```c
enum Status {
    OK         = 0,
    NOT_FOUND  = 404,
    SERVER_ERR = 500
};
```

Or mix — names without an explicit value continue counting from the previous one:

```c
enum Day {
    MON = 1,    /* 1 */
    TUE,        /* 2 */
    WED,        /* 3 */
    THU,        /* 4 */
    FRI,        /* 5 */
    SAT = 100,  /* 100 */
    SUN         /* 101 */
};
```

## `typedef` for shorter names

Same idiom as structs:

```c
typedef enum {
    TASK_PENDING,
    TASK_RUNNING,
    TASK_DONE,
    TASK_FAILED
} TaskState;

TaskState s = TASK_RUNNING;
```

## Enum vs `#define`

You could write:

```c
#define RED   0
#define GREEN 1
#define BLUE  2
```

But `enum` is better because:

1. **Type-checked.** `enum Color` is a real type. With `-Wenum-compare` the compiler warns when you mix enums.
2. **Visible in the debugger.** `gdb` shows `RED` instead of `0`.
3. **Switch coverage warnings.** `-Wswitch` warns if a `switch` over an enum forgets a case.
4. **Grouped.** Adding a new value requires only one line in the enum declaration.

## Enums in `switch`

Enums and switches are made for each other:

```c
const char *task_label(TaskState s) {
    switch (s) {
        case TASK_PENDING: return "pending";
        case TASK_RUNNING: return "running";
        case TASK_DONE:    return "done";
        case TASK_FAILED:  return "failed";
    }
    return "unknown";   /* keeps -Wreturn-type happy */
}
```

If you later add `TASK_CANCELLED` to the enum, GCC with `-Wall` will tell you exactly which switches need updating.

## Bit-flag enums

When the values are powers of two, you can OR them together to combine flags:

```c
typedef enum {
    PERM_NONE  = 0,
    PERM_READ  = 1 << 0,    /* 1 */
    PERM_WRITE = 1 << 1,    /* 2 */
    PERM_EXEC  = 1 << 2,    /* 4 */
    PERM_ALL   = PERM_READ | PERM_WRITE | PERM_EXEC
} Permission;

int perms = PERM_READ | PERM_WRITE;
if (perms & PERM_WRITE) {
    /* user can write */
}
```

The `1 << n` notation makes the bit positions obvious.

## Underlying type

Each enum has an underlying integer type. The standard says it's "compatible with some integer type that the implementation chooses" — so don't assume it's `int` if you're writing for embedded hardware. C23 lets you specify the underlying type explicitly:

```c
enum Color : unsigned char { RED, GREEN, BLUE };   /* C23 only */
```

## Iterating an enum

C does not provide a way to iterate the names of an enum at runtime. The common workaround is a sentinel and a parallel array:

```c
typedef enum {
    DAY_MON, DAY_TUE, DAY_WED, DAY_THU, DAY_FRI, DAY_SAT, DAY_SUN,
    DAY_COUNT       /* sentinel — equals 7, the number of real days */
} Day;

const char *day_names[DAY_COUNT] = {
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
};

for (int d = 0; d < DAY_COUNT; d++) {
    printf("%d : %s\n", d, day_names[d]);
}
```

## Putting it together

```c
#include <stdio.h>

typedef enum {
    OP_ADD, OP_SUB, OP_MUL, OP_DIV
} Op;

double calc(Op op, double a, double b) {
    switch (op) {
        case OP_ADD: return a + b;
        case OP_SUB: return a - b;
        case OP_MUL: return a * b;
        case OP_DIV: return b == 0 ? 0 : a / b;
    }
    return 0;
}

int main(void) {
    printf("3+4 = %g\n", calc(OP_ADD, 3, 4));
    printf("3-4 = %g\n", calc(OP_SUB, 3, 4));
    printf("3*4 = %g\n", calc(OP_MUL, 3, 4));
    printf("3/4 = %g\n", calc(OP_DIV, 3, 4));
    return 0;
}
```

Output:

```
3+4 = 7
3-4 = -1
3*4 = 12
3/4 = 0.75
```
