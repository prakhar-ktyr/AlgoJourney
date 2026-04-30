---
title: C Bitwise Operators
---

# C Bitwise Operators

C lets you manipulate the **individual bits** of an integer. This is essential for low-level work — flags, hardware registers, compression, hashing, network protocols.

## The operators

| Op | Name | Example | Result |
|----|------|---------|--------|
| `&` | AND | `0b1100 & 0b1010` | `0b1000` |
| `\|` | OR  | `0b1100 \| 0b1010` | `0b1110` |
| `^` | XOR | `0b1100 ^ 0b1010` | `0b0110` |
| `~` | NOT | `~0b1100` (8-bit)  | `0b11110011` |
| `<<` | left shift | `0b0011 << 2` | `0b1100` |
| `>>` | right shift | `0b1100 >> 2` | `0b0011` |

Each works **bit-by-bit** on the binary representation:

```
     1100        1100        1100
   & 1010      | 1010      ^ 1010
     ----        ----        ----
     1000        1110        0110
```

## Truth tables (per bit)

| a | b | `a & b` | `a \| b` | `a ^ b` |
|---|---|---------|----------|---------|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

XOR is "different" — `1` exactly when the two bits differ.

## Use unsigned types for bit operations

Bitwise tricks rely on a known representation. **Always use `unsigned`** types for bit manipulation:

```c
unsigned int x = 0xF0u;
unsigned int y = x & 0x0Fu;     // y == 0
```

With signed types, right shift of a negative number is implementation-defined and `~` interacts oddly with sign — frustrating bugs you don't need.

## Common bit-twiddling idioms

### Set a bit

Turn on bit `n` (using `1U << n` to keep the literal unsigned):

```c
flags |= (1U << n);
```

### Clear a bit

```c
flags &= ~(1U << n);
```

### Toggle a bit

```c
flags ^= (1U << n);
```

### Test a bit

```c
if (flags & (1U << n)) { /* bit n is set */ }
```

### Extract the low N bits

```c
unsigned low4 = x & 0x0F;        // mask off the top
```

### Check if a number is even / odd

```c
if (n & 1) /* odd */;
```

### Check if a number is a power of two

A power of two has exactly one bit set, so `n & (n-1)` is zero:

```c
bool is_pow2 = n != 0 && (n & (n - 1)) == 0;
```

### Swap two ints without a temporary

```c
a ^= b;
b ^= a;
a ^= b;
```

(A trick more famous than useful — modern compilers optimize the temporary version equally well, and the XOR version breaks if `a` and `b` are the same variable.)

### Multiply / divide by powers of two

```c
x = a << 3;     // a * 8
x = a >> 2;     // a / 4   (only safe for unsigned)
```

Compilers do this for you — write the multiplication if it's clearer.

## Shifts in detail

### Left shift `<<`

```c
3 << 2      // 12   (3 * 4)
1U << 31    // 2147483648 — one in the top bit of a 32-bit unsigned
```

Shifting **out** of the variable's width is **undefined behavior** for signed types and well-defined (truncating) for unsigned. Don't shift by a value `>= width`.

### Right shift `>>`

For **unsigned** values, fills with zeros — the obvious meaning. For **signed** values, behavior is implementation-defined: most compilers do "arithmetic right shift" (replicate the sign bit), but you should not rely on it portably. Use `unsigned`.

## Combining flags — a real example

```c
#include <stdio.h>

#define PERM_READ  (1U << 0)
#define PERM_WRITE (1U << 1)
#define PERM_EXEC  (1U << 2)

void describe(unsigned p) {
    printf("%c%c%c\n",
           (p & PERM_READ)  ? 'r' : '-',
           (p & PERM_WRITE) ? 'w' : '-',
           (p & PERM_EXEC)  ? 'x' : '-');
}

int main(void) {
    unsigned p = 0;
    p |= PERM_READ;
    p |= PERM_EXEC;
    describe(p);                    // r-x

    p ^= PERM_WRITE;                // toggle write on
    describe(p);                    // rwx

    p &= ~PERM_READ;                // clear read
    describe(p);                    // -wx
    return 0;
}
```

## Counting bits

The straightforward loop:

```c
int popcount(unsigned x) {
    int n = 0;
    while (x) {
        n += x & 1;
        x >>= 1;
    }
    return n;
}
```

The famous Kernighan trick — strips the lowest set bit each iteration, looping only as many times as there are 1-bits:

```c
int popcount(unsigned x) {
    int n = 0;
    while (x) {
        x &= x - 1;
        n++;
    }
    return n;
}
```

GCC offers `__builtin_popcount(x)` which compiles to a single CPU instruction on modern x86.

## Reading / writing bit fields

Often used in hardware drivers. Suppose a 16-bit register stores three values:

```
  bits 15-12  device id (4 bits)
  bits 11-8   revision  (4 bits)
  bits 7-0    status    (8 bits)
```

```c
uint16_t reg = read_register();

uint16_t status   = reg & 0xFF;
uint16_t revision = (reg >> 8) & 0x0F;
uint16_t dev_id   = (reg >> 12) & 0x0F;
```

To **write** the status field while preserving the others:

```c
reg = (reg & ~0xFFu) | (new_status & 0xFFu);
```

## Putting it together — print binary

```c
#include <stdio.h>

void print_binary(unsigned x, int width) {
    for (int i = width - 1; i >= 0; i--) {
        putchar(((x >> i) & 1) ? '1' : '0');
    }
    putchar('\n');
}

int main(void) {
    print_binary(13,        8);     // 00001101
    print_binary(0xCAFE,   16);     // 1100101011111110
    print_binary(~0u,      32);     // 11111111111111111111111111111111
    return 0;
}
```

Bitwise operators are how you bend bits to your will. Once they click, an entire layer of computing makes more sense.
