---
title: C Memory Address
---

# C Memory Address

Every variable lives somewhere in your computer's memory. C, unlike Python or Java, lets you see and work with those memory addresses directly. This is the gateway to pointers — let's start gentle.

## What is an address?

Memory is a giant array of bytes. Each byte has a unique numeric **address** — usually represented as a hexadecimal number like `0x7ffd_5a4c_8e10`. When you declare a variable, the compiler assigns it a chunk of memory at some address.

```
            address          contents
       ┌───────────────┬──────────────┐
0x...10 │      x       │      42      │   int x = 42;
       ├───────────────┼──────────────┤
0x...18 │      y       │     3.14     │   double y = 3.14;
       └───────────────┴──────────────┘
```

## The `&` operator — "address of"

Prefix a variable with `&` to get its address:

```c
#include <stdio.h>

int main(void) {
    int x = 42;
    printf("x lives at address %p\n", (void*)&x);
    printf("x's value is        %d\n", x);
    return 0;
}
```

Sample output:

```
x lives at address 0x7ffd5a4c8e10
x's value is        42
```

The `(void*)` cast is the portable way to print a pointer with `%p`.

The actual hex value will differ from run to run — modern operating systems randomize addresses for security (a feature called **ASLR**).

## Why addresses matter

You've already used `&` once — with `scanf`:

```c
int n;
scanf("%d", &n);    // scanf needs to know WHERE to write the result
```

That's the most common everyday use of `&`. Functions that need to **modify** a caller's variable always take its address.

## The size of a variable

`sizeof(x)` tells you how many bytes a variable occupies. Variables of bigger types live in bigger chunks:

```c
#include <stdio.h>

int main(void) {
    char   c = 'A';
    int    i = 42;
    double d = 3.14;

    printf("c at %p, %zu bytes\n", (void*)&c, sizeof c);
    printf("i at %p, %zu bytes\n", (void*)&i, sizeof i);
    printf("d at %p, %zu bytes\n", (void*)&d, sizeof d);
    return 0;
}
```

Output (typical):

```
c at 0x7ffd...3f, 1 bytes
i at 0x7ffd...38, 4 bytes
d at 0x7ffd...30, 8 bytes
```

Notice how the addresses are typically *close together but not adjacent* — the compiler often inserts padding for alignment.

## Addresses of array elements

An array's elements live in **contiguous memory**:

```c
int arr[5] = { 10, 20, 30, 40, 50 };

for (int i = 0; i < 5; i++) {
    printf("&arr[%d] = %p   (value = %d)\n",
           i, (void*)&arr[i], arr[i]);
}
```

Output:

```
&arr[0] = 0x7ffd...10  (value = 10)
&arr[1] = 0x7ffd...14  (value = 20)
&arr[2] = 0x7ffd...18  (value = 30)
&arr[3] = 0x7ffd...1c  (value = 40)
&arr[4] = 0x7ffd...20  (value = 50)
```

The addresses are 4 bytes apart — `sizeof(int) == 4`. This is the reason **pointer arithmetic** works the way it does (next lesson): `&arr[i]` is the same as `arr + i`.

## Addresses can be stored in a *pointer*

A **pointer** is just a variable whose value is an address:

```c
int  x = 42;
int *p = &x;          // p holds the address of x

printf("&x  = %p\n", (void*)&x);
printf("p   = %p\n", (void*)p);    // same address
printf("*p  = %d\n", *p);          // 42 — "follow the pointer"
```

The `*` in `int *p` is part of the **declaration** — it says "p is a pointer to int." The `*p` in `printf` is the **dereference operator** — "give me the value at this address."

We'll spend the entire next lesson on pointers. For now, the takeaway: **you can talk about a variable by its address using `&`.**

## Reading addresses with the debugger

The debugger (gdb, lldb, or VS Code's UI) is fantastic for this. With a binary built using `-g`:

```bash
gcc -g -O0 prog.c -o prog
gdb ./prog
(gdb) break main
(gdb) run
(gdb) p x         # value of x
(gdb) p &x        # address of x
```

Seeing the addresses change between runs is a great way to internalize that they're *real* numbers picked at runtime.

## Putting it together

```c
#include <stdio.h>

void grow(int *value) {            // takes an ADDRESS
    *value = *value + 1;            // writes through the address
}

int main(void) {
    int score = 9;

    printf("score is %d at %p\n", score, (void*)&score);
    grow(&score);                   // pass the address
    printf("score is now %d\n", score);
    return 0;
}
```

Output:

```
score is 9 at 0x7ffe5d8b0d3c
score is now 10
```

That `&score` in the call to `grow` is exactly what `scanf` needed. Now we're ready to talk about pointers in earnest.
