---
title: C Structures
---

# C Structures

A **structure** (`struct`) is a custom data type that groups related variables under one name. Where arrays hold many values of the **same** type, structures hold a fixed set of values of **possibly different** types.

## Declaring a struct

```c
struct Point {
    int x;
    int y;
};
```

This creates a new type called `struct Point` with two `int` members.

## Creating struct variables

```c
struct Point a;          // a.x and a.y are uninitialized
struct Point b = { 1, 2 };
struct Point c = { .x = 3, .y = 4 };   // designated initializers (C99)

a.x = 10;
a.y = 20;
printf("(%d, %d)\n", a.x, a.y);   // (10, 20)
```

The `.` operator accesses members of a struct.

## `typedef` for shorter names

Writing `struct Point` everywhere is tedious. The idiomatic fix is `typedef`:

```c
typedef struct {
    int x;
    int y;
} Point;

Point a = { 1, 2 };
Point b = { .x = 3, .y = 4 };
printf("(%d, %d)\n", a.x, a.y);
```

You can combine the name and the typedef in one declaration:

```c
typedef struct Point {
    int x, y;
} Point;
```

This form is required when the struct refers to itself (linked-list nodes, trees), because the inner `struct Point` name is needed before the typedef is finished:

```c
typedef struct Node {
    int value;
    struct Node *next;     // can't use 'Node' yet — typedef isn't done
} Node;
```

## Structs and pointers — the `->` operator

When you have a *pointer* to a struct, use `->` instead of `.`:

```c
Point  p  = { 5, 7 };
Point *pp = &p;

printf("%d\n", (*pp).x);   // works but ugly
printf("%d\n", pp->x);     // idiomatic — same thing
```

`pp->x` is exactly `(*pp).x`. You'll use `->` constantly when working with allocated structs.

## Passing structs to functions

Structs are values — they are **copied** when passed by value. For small structs that's fine; for big ones, pass a pointer (and `const` if you don't modify):

```c
void print_point(const Point *p) {
    printf("(%d, %d)\n", p->x, p->y);
}

void shift(Point *p, int dx, int dy) {
    p->x += dx;
    p->y += dy;
}

int main(void) {
    Point pt = { 1, 1 };
    shift(&pt, 5, 7);
    print_point(&pt);     // (6, 8)
    return 0;
}
```

## Returning structs

Functions can return structs by value:

```c
Point make_point(int x, int y) {
    return (Point){ x, y };       // compound literal (C99)
}

Point origin = make_point(0, 0);
```

Returning a small struct is essentially as efficient as returning two integers — modern compilers handle it well.

## Nested structs

Structs can contain other structs:

```c
typedef struct {
    Point top_left;
    Point bottom_right;
} Rect;

Rect r = { { 0, 0 }, { 10, 5 } };
printf("width = %d\n", r.bottom_right.x - r.top_left.x);
```

## Structs and arrays

A struct can contain arrays, and arrays can contain structs:

```c
typedef struct {
    char name[32];
    int  age;
    double scores[5];
} Student;

Student class[100];
class[0] = (Student){ "Ada", 30, { 90, 85, 92, 88, 95 } };
strcpy(class[1].name, "Linus");
class[1].age = 35;
```

## Memory layout and padding

A struct's members are laid out **in declaration order** in memory, but the compiler may insert **padding** to align each member to its preferred byte boundary. This means `sizeof(struct)` may be **larger** than the sum of its members:

```c
struct Bad  { char a; int b; char c; };       // sizeof likely 12 (4 + 4 + 4)
struct Good { int b; char a; char c; };       // sizeof likely 8  (4 + 1 + 1 + 2)
```

For most code, ignore this. For hot loops or memory-constrained systems, ordering matters.

## Anonymous structs (C11)

You can nest unnamed structs and access their members directly:

```c
typedef struct {
    int id;
    struct { int x, y; };       // anonymous
} Thing;

Thing t = { 1, { 5, 7 } };
t.x = 10;                       // direct access — no .inner.x
```

## Bit fields

A struct member can be declared with a width in bits — useful for packing flags:

```c
typedef struct {
    unsigned int red   : 5;
    unsigned int green : 6;
    unsigned int blue  : 5;
} Color16;
```

Bit fields are convenient but their layout is implementation-defined — avoid for portable file formats.

## Putting it together — a tiny database

```c
#include <stdio.h>
#include <string.h>

typedef struct {
    char  name[32];
    int   id;
    float gpa;
} Student;

void print_student(const Student *s) {
    printf("[%d] %-20s gpa=%.2f\n", s->id, s->name, s->gpa);
}

Student top(const Student *arr, int n) {
    Student best = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i].gpa > best.gpa) best = arr[i];
    }
    return best;
}

int main(void) {
    Student class[] = {
        { "Ada Lovelace",   1, 3.92f },
        { "Alan Turing",    2, 3.97f },
        { "Grace Hopper",   3, 3.95f },
        { "Linus Torvalds", 4, 3.45f },
    };
    int n = sizeof class / sizeof class[0];

    for (int i = 0; i < n; i++) print_student(&class[i]);

    Student best = top(class, n);
    puts("\nTop student:");
    print_student(&best);
    return 0;
}
```

Output:

```
[1] Ada Lovelace        gpa=3.92
[2] Alan Turing         gpa=3.97
[3] Grace Hopper        gpa=3.95
[4] Linus Torvalds      gpa=3.45

Top student:
[2] Alan Turing         gpa=3.97
```
