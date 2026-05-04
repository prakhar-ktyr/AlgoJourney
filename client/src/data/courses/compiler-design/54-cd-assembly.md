---
title: Generating Assembly Code
---

# Generating Assembly Code

This lesson covers the final translation from IR (three-address code) to actual assembly instructions that a processor can execute.

---

## From IR to Assembly

The code generator translates each IR instruction into one or more assembly instructions:

```
IR:  t1 = a + b
ASM: mov eax, [rbp-4]    ; load a
     add eax, [rbp-8]    ; add b
     mov [rbp-12], eax   ; store t1
```

After register allocation, variables map to registers:

```
IR:  t1 = a + b    (t1→R0, a→R1, b→R2)
ASM: add R0, R1, R2
```

---

## Assembly Syntax Styles

Two major syntaxes for x86:

### Intel Syntax (destination first)

```c
mov rax, rbx         ; rax = rbx
add rax, 10          ; rax = rax + 10
mov [rbp-8], rax     ; memory[rbp-8] = rax
```

### AT&T Syntax (source first)

```c
movq %rbx, %rax      # rax = rbx
addq $10, %rax       # rax = rax + 10
movq %rax, -8(%rbp)  # memory[rbp-8] = rax
```

| Feature | Intel | AT&T |
|---------|-------|------|
| Order | dest, src | src, dest |
| Registers | rax | %rax |
| Immediates | 10 | $10 |
| Memory | [rbp-8] | -8(%rbp) |
| Size suffix | keyword (dword) | suffix (l, q) |

GCC uses AT&T by default. NASM uses Intel. We'll use **Intel syntax** for clarity.

---

## Generating Arithmetic

### Addition and Subtraction

```c
// IR: t1 = a + b
// Registers: a→rdi, b→rsi, t1→rax
mov rax, rdi
add rax, rsi

// IR: t2 = t1 - 5
sub rax, 5
```

### Multiplication

```c
// IR: t1 = a * b
// Signed multiply (result in destination register)
mov rax, rdi
imul rax, rsi        ; rax = rdi * rsi

// Three-operand form:
imul rax, rdi, 10    ; rax = rdi * 10
```

### Division

Division is more complex — uses RDX:RAX as dividend:

```c
// IR: t1 = a / b  (signed)
// a→rdi, b→rsi, t1→rax
mov rax, rdi         ; dividend low
cqo                  ; sign-extend rax into rdx:rax
idiv rsi             ; rax = quotient, rdx = remainder

// IR: t2 = a % b  (remainder)
// Same instructions, result is in rdx
```

### Negation

```c
// IR: t1 = -a
mov rax, rdi
neg rax              ; rax = -rax
```

---

## Generating Comparisons and Branches

### Comparisons

The `cmp` instruction subtracts and sets flags (without storing result):

```c
// IR: if (a < b) goto L1
cmp rdi, rsi         ; compute rdi - rsi, set flags
jl  L1               ; jump if less (signed)
```

### Conditional Jump Instructions

| IR Condition | Signed Jump | Unsigned Jump |
|-------------|-------------|---------------|
| `==` | `je` | `je` |
| `!=` | `jne` | `jne` |
| `<` | `jl` | `jb` |
| `<=` | `jle` | `jbe` |
| `>` | `jg` | `ja` |
| `>=` | `jge` | `jae` |

### Complete If-Else

```c
// IR:
// if (a > b) goto L_then
// t1 = b
// goto L_end
// L_then: t1 = a
// L_end:

cmp rdi, rsi
jg  .L_then
mov rax, rsi         ; t1 = b
jmp .L_end
.L_then:
mov rax, rdi         ; t1 = a
.L_end:
```

---

## Generating Loops

### While Loop

```c
// C: while (i < n) { sum += arr[i]; i++; }
// i→ecx, n→edx, sum→eax, arr→rdi

.L_loop:
    cmp ecx, edx
    jge .L_end           ; if i >= n, exit
    movsxd r8, ecx      ; sign-extend i for indexing
    add eax, [rdi + r8*4] ; sum += arr[i]
    inc ecx              ; i++
    jmp .L_loop
.L_end:
```

### For Loop (same structure, different initialization)

```c
// C: for (int i = 0; i < n; i++) { body; }
    xor ecx, ecx        ; i = 0
.L_for:
    cmp ecx, edx
    jge .L_done
    ; ... body ...
    inc ecx
    jmp .L_for
.L_done:
```

---

## Function Prologue and Epilogue

Every function follows a standard pattern:

### Prologue (function entry)

```c
my_function:
    push rbp             ; save old frame pointer
    mov rbp, rsp         ; establish new frame
    sub rsp, 32          ; allocate space for locals
    ; save callee-saved registers if used
    push rbx
    push r12
```

### Epilogue (function exit)

```c
    ; restore callee-saved registers
    pop r12
    pop rbx
    ; tear down frame
    mov rsp, rbp         ; deallocate locals
    pop rbp              ; restore old frame pointer
    ret                  ; return to caller
```

Or use the `leave` instruction:

```c
    pop r12
    pop rbx
    leave                ; equivalent to: mov rsp,rbp; pop rbp
    ret
```

---

## Memory Access Patterns

### Local Variables

Accessed via frame pointer (RBP) with negative offsets:

```c
// int x;    → [rbp - 4]
// int y;    → [rbp - 8]
// long z;   → [rbp - 16]

mov dword [rbp-4], 42    ; x = 42
mov eax, [rbp-4]         ; load x
```

### Array Access

```c
// int arr[10]; base at [rbp-48]
// arr[i] = 5; where i is in ecx

movsxd rax, ecx               ; sign-extend index
mov dword [rbp-48+rax*4], 5   ; arr[i] = 5
```

### Pointer Dereference

```c
// int *p; p is in rdi
// *p = 10
mov dword [rdi], 10

// int val = *p
mov eax, [rdi]
```

---

## System V AMD64 Calling Convention

### Argument Passing

```c
// C: result = foo(1, 2, 3, 4, 5, 6, 7, 8)
mov edi, 1           ; arg1
mov esi, 2           ; arg2
mov edx, 3           ; arg3
mov ecx, 4           ; arg4
mov r8d, 5           ; arg5
mov r9d, 6           ; arg6
push 8               ; arg8 (pushed right-to-left)
push 7               ; arg7
call foo
add rsp, 16          ; clean up stack args
; result in eax
```

### Caller-Saved vs Callee-Saved

```c
// Before calling a function, save caller-saved registers you need:
mov [rbp-8], r10     ; save r10 (caller-saved)
call some_function
mov r10, [rbp-8]     ; restore r10

// Callee must preserve: RBX, RBP, R12-R15
my_func:
    push rbx         ; save callee-saved register
    ; ... use rbx ...
    pop rbx          ; restore before returning
    ret
```

---

## Complete Example: TAC to x86-64

### Source Function

```c
int max(int a, int b) {
    if (a > b)
        return a;
    else
        return b;
}
```

### Three-Address Code

```
max(a, b):
    if a > b goto L1
    t1 = b
    goto L2
L1: t1 = a
L2: return t1
```

### Generated x86-64 Assembly

```c
    .globl max
    .type max, @function
max:
    ; a is in edi, b is in esi (System V ABI)
    ; No prologue needed (leaf function, no locals)
    cmp edi, esi
    jg .L1
    mov eax, esi     ; return b
    ret
.L1:
    mov eax, edi     ; return a
    ret
```

---

## Larger Example: Factorial

### Source

```c
int factorial(int n) {
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

### Generated Assembly

```c
    .globl factorial
    .type factorial, @function
factorial:
    ; n is in edi
    mov eax, 1           ; result = 1
    mov ecx, 2           ; i = 2
.L_loop:
    cmp ecx, edi         ; i <= n?
    jg .L_done
    imul eax, ecx        ; result *= i
    inc ecx              ; i++
    jmp .L_loop
.L_done:
    ret                  ; return result (in eax)
```

---

## Simple Code Generator Implementation

A pattern-matching code generator in Python:

```python
def generate_assembly(tac_instructions, reg_alloc):
    asm = []
    
    for instr in tac_instructions:
        if instr.op == 'add':
            dst = reg_alloc[instr.result]
            src1 = reg_alloc[instr.arg1]
            src2 = reg_alloc[instr.arg2]
            if dst == src1:
                asm.append(f"    add {dst}, {src2}")
            else:
                asm.append(f"    mov {dst}, {src1}")
                asm.append(f"    add {dst}, {src2}")
        
        elif instr.op == 'load':
            dst = reg_alloc[instr.result]
            asm.append(f"    mov {dst}, [{instr.arg1}]")
        
        elif instr.op == 'store':
            src = reg_alloc[instr.arg1]
            asm.append(f"    mov [{instr.result}], {src}")
        
        elif instr.op == 'if_lt':
            src1 = reg_alloc[instr.arg1]
            src2 = reg_alloc[instr.arg2]
            asm.append(f"    cmp {src1}, {src2}")
            asm.append(f"    jl {instr.result}")
        
        elif instr.op == 'goto':
            asm.append(f"    jmp {instr.result}")
        
        elif instr.op == 'label':
            asm.append(f"{instr.result}:")
        
        elif instr.op == 'return':
            src = reg_alloc[instr.arg1]
            if src != 'eax':
                asm.append(f"    mov eax, {src}")
            asm.append(f"    ret")
    
    return '\n'.join(asm)
```

---

## Peephole Optimizations on Assembly

After generation, simple local patterns can be improved:

```c
// Redundant move
mov rax, rbx
mov rbx, rax       // remove: rax already equals rbx

// Strength reduction
imul rax, 2        →  add rax, rax   (shift left by 1)
imul rax, 8        →  shl rax, 3

// Dead store elimination
mov [rbp-8], rax
mov [rbp-8], rbx   // first store is dead, remove it
```

---

## Summary

| IR Operation | x86-64 Instruction(s) |
|-------------|----------------------|
| `a + b` | `add` |
| `a - b` | `sub` |
| `a * b` | `imul` |
| `a / b` | `cqo` + `idiv` |
| `if a < b goto L` | `cmp` + `jl L` |
| `goto L` | `jmp L` |
| `return a` | `mov eax, a` + `ret` |
| `call f(x)` | `mov edi, x` + `call f` |

---

## Exercises

1. Translate this TAC to x86-64 assembly with register allocation {a→edi, b→esi, t1→eax, t2→ecx}:
   ```
   t1 = a + b
   t2 = t1 * a
   return t2
   ```

2. Generate x86-64 assembly for:
   ```c
   int abs(int x) {
       if (x < 0) return -x;
       return x;
   }
   ```

3. Write the complete x86-64 assembly (with prologue/epilogue) for a function that takes 8 integer arguments and returns their sum.

4. What is wrong with this generated code? How would a peephole optimizer fix it?
   ```
   mov rax, rbx
   mov rcx, rax
   add rcx, 1
   mov rax, rcx
   ```
