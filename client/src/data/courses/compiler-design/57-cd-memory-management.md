---
title: Memory Management
---

# Memory Management

A running program needs memory for its code, variables, and dynamic data. The compiler and runtime system together manage how memory is allocated, used, and freed.

---

## Runtime Memory Layout

When a program runs, the OS gives it a virtual address space divided into regions:

```
High addresses
+---------------------------+
|        Stack              |  ← function calls, local vars
|        ↓ grows down       |
+---------------------------+
|                           |
|     (unmapped space)      |
|                           |
+---------------------------+
|        ↑ grows up         |
|        Heap               |  ← dynamic allocation (malloc/new)
+---------------------------+
|   Uninitialized data      |  ← .bss (zero-filled globals)
+---------------------------+
|   Initialized data        |  ← .data (globals with values)
+---------------------------+
|   Read-only data          |  ← .rodata (constants, strings)
+---------------------------+
|   Code (text)             |  ← .text (machine instructions)
+---------------------------+
Low addresses
```

---

## The Three Allocation Strategies

| Strategy | Location | Lifetime | Size known at |
|----------|----------|----------|---------------|
| Static | Data segment | Entire program | Compile time |
| Stack | Stack | Function scope | Compile time |
| Heap | Heap | Until freed | Runtime |

---

## Static Allocation

Variables allocated once and live for the entire program:

```c
int global_count = 0;         // static allocation (.data)
static int file_count = 0;    // static allocation (.data)
const char *VERSION = "1.0";  // pointer in .data, string in .rodata

void increment() {
    static int calls = 0;     // static allocation (persists between calls)
    calls++;
}
```

**Characteristics:**
- Address known at compile/link time
- No allocation or deallocation overhead at runtime
- Size must be fixed at compile time
- Cannot have recursive data structures

---

## Stack Allocation

The stack manages function calls using a **LIFO** (Last In, First Out) discipline:

```c
void foo(int x) {          // x allocated on stack
    int local = x + 1;    // local allocated on stack
    char buf[64];          // buf allocated on stack
    bar(local);            // new frame pushed for bar()
}                          // all locals deallocated (pop frame)
```

### Stack Frame Layout

Each function call creates a **stack frame** (also called **activation record**):

```
+---------------------------+  ← High address (caller's frame)
| Arguments (if on stack)   |
+---------------------------+
| Return address            |
+---------------------------+
| Saved frame pointer (rbp) |
+---------------------------+  ← Frame pointer (rbp)
| Local variable 1          |
+---------------------------+
| Local variable 2          |
+---------------------------+
| Saved registers           |
+---------------------------+
| Temporary values          |
+---------------------------+  ← Stack pointer (rsp)
```

### How Stack Allocation Works

```
push rbp           ; save caller's frame pointer
mov rbp, rsp       ; set up our frame pointer
sub rsp, 32        ; allocate 32 bytes for locals
...
mov rsp, rbp       ; deallocate locals
pop rbp            ; restore caller's frame pointer
ret                ; return to caller
```

**Characteristics:**
- Extremely fast: just move the stack pointer
- Automatic deallocation when function returns
- Size must be known at compile time (usually)
- Cannot outlive the function that created it

### Stack Overflow

The stack has a fixed maximum size (typically 1–8 MB):

```c
// This will overflow the stack!
void infinite_recursion() {
    char big_array[1024];
    infinite_recursion();  // each call adds ~1KB to stack
}
```

---

## Heap Allocation

The heap handles memory whose size is unknown at compile time or whose lifetime exceeds the creating function:

```c
#include <stdlib.h>

int* create_array(int n) {
    // Allocate on heap — survives after function returns
    int *arr = (int*)malloc(n * sizeof(int));
    return arr;  // valid! heap memory persists
}

void use_it() {
    int *data = create_array(100);
    // ... use data ...
    free(data);  // manually release heap memory
}
```

### malloc and free in C

```c
// Allocate: request n bytes from heap
void *malloc(size_t n);

// Free: return memory to heap
void free(void *ptr);

// Allocate + zero-initialize
void *calloc(size_t count, size_t size);

// Resize existing allocation
void *realloc(void *ptr, size_t new_size);
```

---

## Memory Allocator Design

The allocator must efficiently manage a pool of memory, handling requests of varying sizes:

### Free List Approach

Maintain a linked list of free blocks:

```
Heap:
[USED 32B] → [FREE 64B] → [USED 16B] → [FREE 128B] → [USED 48B]

Free list:
HEAD → [FREE 64B] → [FREE 128B] → NULL
```

**Allocation strategies:**

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| First fit | Use first block that's large enough | Fast but causes fragmentation |
| Best fit | Use smallest block that fits | Less waste, slower search |
| Worst fit | Use largest block | Leaves bigger remainders |
| Next fit | Start search from last allocation point | Better distribution |

When allocating, the allocator may **split** a large free block:

```
Request: 32 bytes
Free block: [FREE 128B]
Result:     [USED 32B][FREE 96B]  ← split into used + smaller free
```

When freeing, the allocator may **coalesce** adjacent free blocks:

```
Before: [FREE 64B][USED 32B][FREE 48B]
                      ↓ free
After:  [FREE 64B][FREE 32B][FREE 48B]
                      ↓ coalesce
After:  [FREE 144B]  ← merged into one large block
```

### Buddy System

Divide memory into power-of-2 sized blocks:

```
Total heap: 256 bytes

Request 30 bytes → round up to 32:
  256 → split → 128 + 128
  128 → split → 64 + 64
  64  → split → 32 + 32
  Allocate one 32-byte block

Free: merge buddies back together if both free
```

The address of a block's "buddy" is found by flipping one bit:

$$\text{buddy}(x, k) = x \oplus 2^k$$

where $k$ is the block's level (size $= 2^k$).

**Advantage:** Fast coalescing — just check if buddy is free.
**Disadvantage:** Internal fragmentation (30 bytes → 32 byte block).

---

## Fragmentation

### Internal Fragmentation

Wasted space **inside** an allocated block:

```
Request: 30 bytes
Allocator gives: 32 bytes (rounds up for alignment)
Wasted: 2 bytes inside the block
```

### External Fragmentation

Enough total free memory, but no single block is large enough:

```
Free memory: [FREE 20B] ... [FREE 30B] ... [FREE 25B]
Total free: 75 bytes
Request: 50 bytes → FAILS (no contiguous 50-byte block)
```

**Solutions:**
- Compaction: move allocated blocks together (requires updating all pointers)
- Segregated free lists: separate lists for different size classes
- Memory pools: pre-allocate blocks of fixed sizes

---

## When to Use Each Strategy

| Situation | Best allocation | Why |
|-----------|----------------|-----|
| Global config | Static | Lives entire program |
| Loop counter | Stack | Short-lived, fixed size |
| Function parameters | Stack | Scoped to call |
| User input string | Heap | Size unknown at compile time |
| Linked list nodes | Heap | Dynamic number, varying lifetime |
| Large array of known size | Stack (if small) or Heap | Stack has size limits |

---

## Memory Safety Issues

### Dangling Pointers

Using memory after it's been freed:

```c
int *p = (int*)malloc(sizeof(int));
*p = 42;
free(p);
printf("%d\n", *p);  // UNDEFINED BEHAVIOR — dangling pointer!
```

### Memory Leaks

Forgetting to free allocated memory:

```c
void leak() {
    int *p = (int*)malloc(1000 * sizeof(int));
    // ... use p ...
    return;  // LEAK! p is lost, memory never freed
}
```

Over time, leaks exhaust available memory.

### Buffer Overflows

Writing past the end of an allocated region:

```c
char buf[10];
strcpy(buf, "This string is way too long!");  // overflow!
```

This corrupts adjacent memory and is a major security vulnerability.

### Double Free

Freeing the same memory twice:

```c
int *p = (int*)malloc(sizeof(int));
free(p);
free(p);  // UNDEFINED BEHAVIOR — corrupts allocator state
```

### Use After Free

A variant of dangling pointers, particularly dangerous with reallocation:

```c
int *a = (int*)malloc(10 * sizeof(int));
free(a);
int *b = (int*)malloc(10 * sizeof(int));  // may reuse a's memory
a[0] = 999;  // corrupts b's data!
```

---

## How Languages Manage Memory

### C — Manual Management

```c
// Programmer is fully responsible
int *data = (int*)malloc(n * sizeof(int));
// ... use data ...
free(data);  // must remember to free
data = NULL; // good practice: prevent dangling pointer
```

### Java — Garbage Collection

```java
// No manual deallocation needed
String s = new String("hello");  // allocated on heap
s = null;  // object becomes eligible for GC
// GC will reclaim it automatically (eventually)
```

### Rust — Ownership System

```rust
fn main() {
    let s = String::from("hello");  // s owns the String
    let t = s;                      // ownership moves to t
    // println!("{}", s);           // ERROR: s no longer valid
    println!("{}", t);              // OK: t owns it
}   // t goes out of scope, String is freed (no GC needed)
```

Rust's approach:
- Each value has exactly one **owner**
- When the owner goes out of scope, the value is **dropped** (freed)
- No garbage collector, no manual free, no memory leaks
- Compile-time enforcement — zero runtime cost

### Python — Reference Counting + GC

```python
a = [1, 2, 3]   # list created, refcount = 1
b = a            # refcount = 2
del a            # refcount = 1
del b            # refcount = 0 → freed immediately
```

Python uses reference counting for immediate cleanup plus a cycle-detecting GC for circular references.

---

## Compiler's Role in Memory Management

The compiler decides **where** each variable goes:

```c
int global = 5;              // compiler emits in .data section

void foo(int param) {        // compiler allocates param on stack
    int local = param + 1;   // compiler allocates local on stack
    int *p = malloc(100);    // compiler generates call to malloc
    // compiler does NOT automatically free p
}
```

For stack variables, the compiler calculates the total frame size and emits a single `sub rsp, N` instruction. No per-variable allocation occurs at runtime.

---

## Exercises

1. **Draw the memory layout**: Given a program with global variables, local variables, and malloc calls, draw which variables go in which memory region.

2. **Stack frame**: For the function below, draw the stack frame showing all local variables and parameters:
   ```c
   int compute(int a, int b) {
       int sum = a + b;
       int product = a * b;
       char buffer[16];
       return sum + product;
   }
   ```

3. **Fragmentation**: Given a heap with blocks `[USED 40][FREE 20][USED 30][FREE 50][USED 10][FREE 30]`, can you allocate 60 bytes? Why or why not? What's the total free memory?

4. **Buddy system**: Starting with a 128-byte heap, show the splits needed to allocate blocks of sizes 10, 20, and 5 bytes. What's the internal fragmentation?

5. **Memory bugs**: Identify the memory error in each snippet:
   ```c
   // Snippet A
   char *s = malloc(5);
   strcpy(s, "hello");

   // Snippet B
   int *p = malloc(sizeof(int));
   free(p);
   *p = 10;

   // Snippet C
   void process() {
       int *arr = malloc(100 * sizeof(int));
       if (arr[0] == 0) return;
       free(arr);
   }
   ```

6. **Compare strategies**: Write a short paragraph comparing manual memory management (C), garbage collection (Java), and ownership (Rust) in terms of safety, performance, and programmer effort.

---

## Summary

| Concept | Key idea |
|---------|----------|
| Static allocation | Fixed at compile time, lives forever |
| Stack allocation | LIFO, automatic, fast, bounded lifetime |
| Heap allocation | Flexible, manual or GC, runtime overhead |
| Fragmentation | Wasted space from allocation patterns |
| Memory safety | Dangling pointers, leaks, overflows |
| Language approach | Manual → GC → Ownership (increasingly safe) |

Memory management is a fundamental concern that affects program correctness, performance, and security. The compiler must generate correct code for all three allocation strategies.
