---
title: Procedure Calls and Stack Frames
---

# Procedure Calls and Stack Frames

Every function call creates an **activation record** (stack frame) that holds the function's local state. Understanding stack frames is essential for generating correct procedure call code.

---

## The Runtime Stack

The stack grows **downward** in memory (toward lower addresses):

```
High addresses
┌──────────────────────┐
│  main's frame        │
├──────────────────────┤
│  foo's frame         │
├──────────────────────┤
│  bar's frame         │  ← RSP (top of stack)
└──────────────────────┘
Low addresses
```

Each function call pushes a new frame; each return pops it.

---

## Stack Frame Layout

A typical x86-64 stack frame (System V ABI):

```
High addresses (caller's frame)
┌──────────────────────────────┐
│  Argument 8 (if > 6 args)    │  [rbp + 24]
│  Argument 7                  │  [rbp + 16]
├──────────────────────────────┤
│  Return address              │  [rbp + 8]   (pushed by call)
├──────────────────────────────┤
│  Saved RBP (old frame ptr)   │  [rbp]       (pushed by callee)
├──────────────────────────────┤
│  Local variable 1            │  [rbp - 8]
│  Local variable 2            │  [rbp - 16]
│  Local variable 3            │  [rbp - 24]
├──────────────────────────────┤
│  Saved callee-saved regs     │  [rbp - 32], etc.
├──────────────────────────────┤
│  (padding for alignment)     │  ← RSP
└──────────────────────────────┘
Low addresses
```

---

## Components of a Stack Frame

### Return Address

Pushed automatically by the `call` instruction. Contains the address to resume execution after the function returns.

```c
call foo       ; pushes address of next instruction onto stack
               ; then jumps to foo
```

### Saved Frame Pointer

The callee saves the caller's frame pointer so it can be restored:

```c
push rbp       ; save caller's frame pointer
mov rbp, rsp   ; establish new frame
```

### Local Variables

Allocated by subtracting from RSP:

```c
sub rsp, 32    ; allocate 32 bytes for locals
; local1 at [rbp-8]
; local2 at [rbp-16]
; local3 at [rbp-24]
; local4 at [rbp-32]
```

### Saved Registers

Callee-saved registers (RBX, R12-R15) must be preserved:

```c
push rbx       ; save if we use rbx
push r12       ; save if we use r12
```

---

## The Function Call Sequence

### Complete Call Example

```c
// C code:
int caller() {
    int x = 10;
    int result = callee(1, 2, 3);
    return result + x;
}

int callee(int a, int b, int c) {
    int local = a + b + c;
    return local * 2;
}
```

### Step 1: Caller Prepares Arguments

```c
caller:
    push rbp
    mov rbp, rsp
    sub rsp, 16          ; space for locals

    mov dword [rbp-4], 10  ; x = 10

    ; Prepare arguments for callee(1, 2, 3)
    mov edi, 1           ; arg1 in edi
    mov esi, 2           ; arg2 in esi
    mov edx, 3           ; arg3 in edx
```

### Step 2: Caller Executes CALL

```c
    call callee          ; push return address, jump to callee
```

### Step 3: Callee Prologue

```c
callee:
    push rbp             ; save caller's frame pointer
    mov rbp, rsp         ; new frame pointer
    sub rsp, 16          ; space for locals
```

### Step 4: Callee Executes Body

```c
    ; a=edi, b=esi, c=edx
    mov eax, edi         ; eax = a
    add eax, esi         ; eax = a + b
    add eax, edx         ; eax = a + b + c
    mov [rbp-4], eax     ; local = a + b + c
    
    mov eax, [rbp-4]     ; load local
    imul eax, 2          ; local * 2 (return value in eax)
```

### Step 5: Callee Epilogue and Return

```c
    mov rsp, rbp         ; deallocate locals
    pop rbp              ; restore caller's frame pointer
    ret                  ; pop return address, jump to caller
```

### Step 6: Caller Uses Return Value

```c
    ; Back in caller, result is in eax
    add eax, [rbp-4]    ; result + x
    
    mov rsp, rbp
    pop rbp
    ret
```

---

## Frame Pointer vs Stack Pointer

### With Frame Pointer (RBP)

```c
push rbp
mov rbp, rsp
sub rsp, 32

; Access locals with fixed offsets from RBP:
mov eax, [rbp-8]     ; always correct, regardless of pushes
```

**Advantages**: simple, debugger-friendly, locals at fixed offsets.

**Disadvantage**: uses one register (RBP) that could hold data.

### Without Frame Pointer (omit-frame-pointer)

```c
sub rsp, 32

; Access locals relative to RSP:
mov eax, [rsp+24]    ; offset changes if you push/pop!
```

**Advantages**: frees RBP for general use (+1 register).

**Disadvantage**: offsets change, harder to debug, compiler must track RSP precisely.

GCC: `-fomit-frame-pointer` (default at `-O1` and above).

---

## Stack Frames in Memory

Tracing a call chain `main → foo → bar`:

```
Address   Content              Frame
────────────────────────────────────────
0x7FF0    main's locals        main
0x7FE8    saved RBP (0)
0x7FE0    return addr → OS
────────────────────────────────────────
0x7FD8    foo's local2         foo
0x7FD0    foo's local1
0x7FC8    saved RBP (0x7FE8)
0x7FC0    return addr → main
────────────────────────────────────────
0x7FB8    bar's local1         bar
0x7FB0    saved RBP (0x7FC8)   ← RBP
0x7FA8    (alignment pad)      ← RSP
────────────────────────────────────────
```

Following the saved RBP chain: bar's RBP → foo's frame → main's frame. This is how debuggers produce **stack traces**.

---

## Handling Many Arguments

When more than 6 integer arguments (System V AMD64):

```c
// C: func(1, 2, 3, 4, 5, 6, 7, 8, 9)
// Args 1-6: registers
mov edi, 1       ; arg1
mov esi, 2       ; arg2
mov edx, 3       ; arg3
mov ecx, 4       ; arg4
mov r8d, 5       ; arg5
mov r9d, 6       ; arg6

// Args 7-9: pushed right-to-left
push 9           ; arg9
push 8           ; arg8
push 7           ; arg7
call func
add rsp, 24      ; caller cleans up 3 stack args × 8 bytes
```

Inside `func`, stack args are accessed above the return address:

```c
; arg7 at [rbp+16]
; arg8 at [rbp+24]
; arg9 at [rbp+32]
```

---

## Nested Functions and Static Links

Some languages (Pascal, nested Python functions) allow inner functions to access outer function's variables:

```python
def outer():
    x = 10
    def inner():
        return x + 1   # accesses outer's x!
    return inner()
```

### Static Link (Access Link)

Each frame stores a pointer to its **enclosing function's frame**:

```
outer's frame:
  x = 10             [rbp_outer - 8]
  
inner's frame:
  static_link → outer's frame   [rbp_inner - 8]
```

To access `x` from `inner`:

```c
; In inner:
mov rax, [rbp-8]         ; load static link (pointer to outer's frame)
mov eax, [rax-8]         ; load outer's x
```

For deeper nesting (level difference $d$), follow $d$ static links:

$$
\text{access} = \underbrace{\text{link} \to \text{link} \to \cdots \to \text{link}}_{d \text{ times}} \to \text{variable}
$$

---

## Variable-Length Allocations

### alloca / Variable-Length Arrays

```c
void func(int n) {
    int arr[n];   // size not known at compile time!
    // ...
}
```

Generated code adjusts RSP at runtime:

```c
func:
    push rbp
    mov rbp, rsp
    
    ; Allocate n integers (n is in edi)
    movsxd rax, edi
    shl rax, 2           ; n * 4 bytes
    sub rsp, rax         ; allocate on stack
    and rsp, -16         ; maintain 16-byte alignment
    
    mov rdi, rsp         ; arr = current stack top
    ; ... use arr ...
    
    mov rsp, rbp         ; restore (deallocates VLA)
    pop rbp
    ret
```

Frame pointer is **essential** here — we can't compute local offsets from RSP since it moves.

---

## Tail Call Optimization

A **tail call** is a function call immediately followed by a return:

```c
int factorial(int n, int acc) {
    if (n <= 1) return acc;
    return factorial(n-1, acc*n);  // tail call!
}
```

### Without Optimization (new frame each call)

```
factorial(5,1) → factorial(4,5) → factorial(3,20) → factorial(2,60) → factorial(1,120)
Stack depth: 5 frames
```

### With Tail Call Optimization (reuse frame)

```c
factorial:
    cmp edi, 1
    jle .L_base
    ; Tail call: reuse current frame
    imul esi, edi        ; acc = acc * n
    dec edi              ; n = n - 1
    jmp factorial        ; jump, don't call!
.L_base:
    mov eax, esi
    ret
```

Stack depth: **1 frame** regardless of input! Converts recursion to iteration.

### When TCO Applies

- The call is the **last** thing before return
- No cleanup needed after the call returns
- Caller and callee have compatible frame layouts

---

## Complete Trace Example

Trace `main` calling `add(3, 4)`:

```c
add:
    push rbp             ; save main's RBP
    mov rbp, rsp         ; new frame
    mov [rbp-4], edi     ; save a (3)
    mov [rbp-8], esi     ; save b (4)
    mov eax, [rbp-4]
    add eax, [rbp-8]     ; sum = 7
    leave
    ret

main:
    push rbp
    mov rbp, rsp
    sub rsp, 16
    mov edi, 3
    mov esi, 4
    call add             ; push return addr, jump
    mov [rbp-4], eax     ; result = 7
    mov eax, [rbp-4]
    leave
    ret
```

Stack during `add`:

```
0x7FC8  return addr → main   (pushed by call)
0x7FC0  saved RBP (main's)   ← RBP
0x7FB8  3 (a copy)
0x7FB0  4 (b copy)           ← RSP
```

After `ret`, stack unwinds to main's frame.

---

## Compiler's Responsibility

The compiler must generate code that:

1. **Correctly follows the calling convention** (args in right registers/stack positions)
2. **Preserves callee-saved registers** (save/restore RBX, R12-R15 if used)
3. **Maintains stack alignment** (16-byte aligned before `call`)
4. **Handles variable-size frames** (VLAs require frame pointer)
5. **Enables debugging** (frame pointer chain, DWARF unwind info)

---

## Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Return address | `[rbp+8]` | Where to resume after return |
| Saved RBP | `[rbp]` | Links to caller's frame |
| Locals | `[rbp-N]` | Function's local variables |
| Saved registers | Below locals | Preserve callee-saved regs |
| Stack arguments | `[rbp+16...]` | Arguments beyond 6 |

The call sequence:

$$
\text{Caller: args} \to \text{call} \to \text{Callee: prologue} \to \text{body} \to \text{epilogue} \to \text{ret} \to \text{Caller: use result}
$$

---

## Exercises

1. Draw the complete stack layout when `c()` is executing in:
   ```c
   void a() { int x = 1; b(); }
   void b() { int y = 2; c(); }
   void c() { int z = 3; }
   ```

2. Write the x86-64 assembly for this function, including proper prologue/epilogue:
   ```c
   long swap_add(long *xp, long *yp) {
       long x = *xp;
       long y = *yp;
       *xp = y;
       *yp = x;
       return x + y;
   }
   ```

3. A function uses registers RBX, R12, and R13. Write its prologue and epilogue, ensuring 16-byte stack alignment with 24 bytes of local space.

4. Convert this recursive function to use tail call optimization:
   ```c
   int sum(int n) {
       if (n == 0) return 0;
       return n + sum(n-1);
   }
   ```
   (Hint: add an accumulator parameter)

5. In a language with nested functions, `inner` is defined inside `middle`, which is defined inside `outer`. How many static links must `inner` follow to access a variable in `outer`?

6. If a function has 8 integer parameters and 3 local `long` variables, what is the total size of its stack frame? Draw the layout.
