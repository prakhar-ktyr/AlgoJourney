---
title: C Unions
---

# C Unions

A `union` looks like a `struct` but **all members share the same memory**. The size of a union is the size of its largest member. Only one member is "alive" at a time.

## Declaring

```c
union Number {
    int    i;
    float  f;
    char   bytes[4];
};
```

A `union Number` is **4 bytes** (the size of an `int` or a `float`). Reading `n.i` and `n.f` interprets the same bytes two different ways.

## Using

```c
#include <stdio.h>

union Number {
    int    i;
    float  f;
    char   bytes[4];
};

int main(void) {
    union Number n;

    n.i = 0x40490FDB;          // bit pattern of pi as a float
    printf("as int:   %d\n",   n.i);
    printf("as float: %.6f\n", n.f);
    for (int i = 0; i < 4; i++) {
        printf("byte %d : 0x%02X\n", i, (unsigned char)n.bytes[i]);
    }
    return 0;
}
```

Sample output (little-endian x86):

```
as int:   1078530011
as float: 3.141593
byte 0 : 0xDB
byte 1 : 0x0F
byte 2 : 0x49
byte 3 : 0x40
```

That's exactly how `float` is stored in IEEE 754 — and a union lets you peek at it.

## Why use unions?

### Saving memory

If a value can be one of several types but only one at a time, a union avoids paying for all of them:

```c
typedef enum { TAG_INT, TAG_FLOAT, TAG_STRING } Tag;

typedef struct {
    Tag tag;
    union {
        int    i;
        float  f;
        char  *s;
    } as;
} Value;
```

This **tagged union** pattern is how dynamic languages, JSON parsers, and AST nodes are typically implemented in C.

```c
Value v;
v.tag  = TAG_FLOAT;
v.as.f = 3.14f;

switch (v.tag) {
    case TAG_INT:    printf("%d\n",  v.as.i); break;
    case TAG_FLOAT:  printf("%f\n",  v.as.f); break;
    case TAG_STRING: printf("%s\n",  v.as.s); break;
}
```

### Type punning

Reinterpreting a value's bytes — extracting the bits of a `float` as an `int`, or splitting a 32-bit register into 4 bytes. The union approach is well-defined in C; using a `(int*)` cast on a `float*` is **not**.

```c
union { float f; uint32_t bits; } pun = { .f = 3.14f };
printf("0x%08x\n", pun.bits);    // raw IEEE-754 representation
```

## Pitfalls

1. **Reading a member you didn't write** is undefined-ish behavior in earlier C standards. C99 and later do allow it for type punning through unions (but not through casts) — it's called "common initial sequence" / "type-punning via union" and is widely supported.
2. **Strings in a union** — only the pointer fits, not the string itself. Storing a `char[32]` in a union with an `int` makes the union 32 bytes.
3. **Anonymous unions** (C11): like anonymous structs, they let you skip the inner name.

   ```c
   typedef struct {
       Tag tag;
       union { int i; float f; char *s; };  // no name
   } Value;

   v.i = 5;       // direct, no v.as.i
   ```

4. **No constructor / destructor** — switching active member doesn't free anything. If your union holds a `malloc`'d pointer, **you** must remember to free it before overwriting.

## A worked example — IPv4 address

A `uint32_t` IP address can also be viewed as four bytes:

```c
#include <stdio.h>
#include <stdint.h>

typedef union {
    uint32_t value;
    uint8_t  octets[4];
} IPv4;

int main(void) {
    IPv4 ip;
    ip.octets[0] = 192;     /* network byte order: write big-endian */
    ip.octets[1] = 168;
    ip.octets[2] = 1;
    ip.octets[3] = 100;

    printf("hex:    0x%08X\n", ip.value);
    printf("dotted: %u.%u.%u.%u\n",
           ip.octets[0], ip.octets[1], ip.octets[2], ip.octets[3]);
    return 0;
}
```

(The order of bytes in `value` depends on the machine's endianness — that's a real constraint of unions.)

## When NOT to use a union

- For two values you need at the **same time** — that's a struct.
- For polymorphism with rich behavior — C++ has classes; in C, function pointers and tagged unions cover most needs.

Unions are an advanced tool. Most C code never uses one — but tagged unions are a beautiful pattern when the data calls for it.
