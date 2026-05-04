---
title: Intermediate Representations
---

# Intermediate Representations

An **Intermediate Representation (IR)** is a data structure or code format used internally by a compiler to represent the source program. It sits between the front-end (parsing, semantic analysis) and the back-end (code generation, optimization).

---

## Why Use an IR?

Without an IR, you would need a separate compiler for every combination of source language and target machine:

- 3 languages × 4 targets = 12 compilers

With an IR as a common interface:

- 3 front-ends + 4 back-ends = 7 components

This **decoupling** is the primary motivation:

```
Source Language → Front-End → IR → Back-End → Target Machine
```

### Benefits of IR

| Benefit | Description |
|---------|-------------|
| Portability | Same IR works across multiple targets |
| Optimization | Machine-independent optimizations on IR |
| Modularity | Front-end and back-end developed independently |
| Reuse | New language? Just write a new front-end |

---

## Levels of IR

Compilers often use multiple IRs at different levels of abstraction:

### High-Level IR (AST)

The **Abstract Syntax Tree** preserves source-level structure:

```
    +
   / \
  a   *
     / \
    b   c
```

- Close to source language
- Good for semantic analysis
- Contains type information

### Medium-Level IR (Three-Address Code)

A linear sequence of simple instructions:

```
t1 = b * c
t2 = a + t1
```

- Each instruction has at most one operator
- Explicit temporary variables
- Good for optimization

### Low-Level IR (Assembly-Like)

Close to target machine instructions:

```
LOAD R1, b
LOAD R2, c
MUL  R1, R1, R2
LOAD R2, a
ADD  R1, R2, R1
STORE R1, t2
```

- Exposes machine details (registers, memory)
- Good for register allocation and instruction scheduling

---

## Three-Address Code

The most common medium-level IR. Every instruction has the form:

$$x = y \; \text{op} \; z$$

Where:
- $x$ is the result (a name, temporary, or compiler-generated variable)
- $y$ and $z$ are operands (names, constants, or temporaries)
- $\text{op}$ is an operator

### Example

Source expression: `a = b * c + d`

Three-address code:

```
t1 = b * c
t2 = t1 + d
a  = t2
```

Each instruction uses **at most one operator** on the right-hand side.

---

## Representing Three-Address Code

### Quadruples

A quadruple has four fields: **(op, arg1, arg2, result)**

| # | op | arg1 | arg2 | result |
|---|-----|------|------|--------|
| 0 | * | b | c | t1 |
| 1 | + | t1 | d | t2 |
| 2 | = | t2 | — | a |

**Advantages:**
- Easy to reorder instructions
- Each instruction is self-contained
- Simple to implement optimizations

### Triples

A triple has three fields: **(op, arg1, arg2)** — the result is identified by the instruction's index.

| # | op | arg1 | arg2 |
|---|-----|------|------|
| 0 | * | b | c |
| 1 | + | (0) | d |
| 2 | = | a | (1) |

Here `(0)` refers to the result of instruction 0.

**Advantages:**
- Saves space (no explicit result field)

**Disadvantages:**
- Hard to reorder (references change if indices change)

### Indirect Triples

Uses a separate list of pointers into a triple array:

```
Execution order:    Triple array:
[0] → 14           14: (*, b, c)
[1] → 15           15: (+, (14), d)
[2] → 16           16: (=, a, (15))
```

**Advantage:** Can reorder the execution list without moving triples.

---

## Static Single Assignment (SSA) Form

In **SSA form**, every variable is assigned exactly once. If a variable is assigned multiple times in the source, each assignment gets a unique version:

### Original Code

```c
x = 1;
x = x + 1;
y = x * 2;
```

### SSA Form

```c
x1 = 1;
x2 = x1 + 1;
y1 = x2 * 2;
```

### The φ (Phi) Function

When control flow merges, we use a **phi function** to select the right version:

```c
// Original
if (flag) {
    x = 1;
} else {
    x = 2;
}
y = x + 3;
```

```c
// SSA Form
if (flag) {
    x1 = 1;
} else {
    x2 = 2;
}
x3 = φ(x1, x2);
y1 = x3 + 3;
```

The phi function $x_3 = \phi(x_1, x_2)$ means: "take $x_1$ if we came from the then-branch, $x_2$ if from the else-branch."

### Why SSA?

| Benefit | Explanation |
|---------|-------------|
| Simpler analysis | Each use has exactly one definition |
| Better optimization | Constant propagation, dead code elimination |
| Used by LLVM | LLVM IR is in SSA form |

---

## IR in Real Compilers

| Compiler | IR Used |
|----------|---------|
| GCC | GIMPLE (medium-level), RTL (low-level) |
| LLVM | LLVM IR (SSA-based, medium-level) |
| JVM | Java Bytecode (stack-based) |
| .NET | CIL (Common Intermediate Language) |

### LLVM IR Example

```
define i32 @add(i32 %a, i32 %b) {
entry:
  %result = add i32 %a, %b
  ret i32 %result
}
```

---

## Stack-Based vs Register-Based IR

Besides three-address code, there are two other common IR paradigms:

### Stack-Based IR

Used by the JVM and .NET CLR. Operations pop operands from a stack and push results:

```
// Expression: a + b * c
push a
push b
push c
mul        // pops b, c; pushes b*c
add        // pops a, b*c; pushes a+b*c
```

**Advantages:**
- Compact representation (no named temporaries)
- Easy to generate
- Simple interpreter

**Disadvantages:**
- Hard to optimize (implicit operand locations)
- Doesn't map well to register machines

### Register-Based IR

Like three-address code but with explicit virtual registers:

```
// Expression: a + b * c
r1 = load b
r2 = load c
r3 = mul r1, r2
r4 = load a
r5 = add r4, r3
```

**Advantages:**
- Maps directly to hardware
- Easier to optimize

**Disadvantages:**
- More verbose
- Needs register allocation

### Comparison

| Feature | Stack-Based | Register-Based | Three-Address |
|---------|-------------|----------------|---------------|
| Operands | Implicit (stack) | Explicit registers | Named variables |
| Code size | Compact | Larger | Medium |
| Optimization | Harder | Easier | Easy |
| Example | JVM bytecode | Dalvik (Android) | GCC GIMPLE |

---

## DAG Representation

A **Directed Acyclic Graph (DAG)** is an optimized version of an AST that shares common sub-expressions:

### Example

Expression: `a + a * (b - c) + (b - c) * d`

AST has duplicate `(b - c)` nodes. The DAG shares them:

```
        +
       / \
      +   *
     / \ / \
    a   *   d
       / \
      a   -     ← shared node
         / \
        b   c
```

**Benefit:** The DAG makes common sub-expression elimination obvious — the shared node is computed only once.

### Constructing a DAG

```python
def build_dag_node(op, left, right):
    # Check if this node already exists
    key = (op, left, right)
    if key in dag_nodes:
        return dag_nodes[key]
    # Create new node
    node = DAGNode(op, left, right)
    dag_nodes[key] = node
    return node
```

---

## IR Design Considerations

When designing an IR, compiler writers must balance:

| Factor | Trade-off |
|--------|-----------|
| Level of abstraction | High → easy to generate; Low → easy to optimize |
| Expressiveness | More detail → more optimization; Less → simpler |
| Portability | Abstract → more targets; Concrete → better code |
| Complexity | Rich IR → better optimization; Simple → faster compilation |

### Questions to Ask

1. How many source languages will use this IR?
2. How many target machines will it support?
3. What optimizations must be performed?
4. How fast must compilation be?

---

## Summary Table

| IR Type | Level | Example | Use Case |
|---------|-------|---------|----------|
| AST | High | Tree nodes | Semantic analysis |
| DAG | High | Shared tree | Common sub-expression |
| Three-address code | Medium | `t1 = a + b` | Optimization |
| SSA | Medium | `x1, x2, ...` | Advanced optimization |
| Stack-based | Medium | `push`, `add` | VM bytecode |
| RTL / Assembly-like | Low | `LOAD R1, x` | Code generation |

---

## Key Takeaways

1. **IR decouples** front-end from back-end — the core architectural benefit
2. **Three-address code** is the most common medium-level IR
3. **Quadruples** are easiest to manipulate; triples save space
4. **SSA form** simplifies data-flow analysis and optimization
5. Real compilers often use **multiple IRs** at different stages
6. **Stack-based** IRs are compact but harder to optimize
7. **DAGs** expose common sub-expressions for elimination

---

## Exercises

1. Convert the expression `(a + b) * (c - d) / e` into three-address code.

2. Represent the following TAC as quadruples and triples:
   ```
   t1 = a + b
   t2 = t1 * c
   t3 = t2 - d
   x  = t3
   ```

3. Convert this code to SSA form:
   ```c
   x = 5;
   if (y > 0) {
       x = x + y;
   }
   z = x * 2;
   ```

4. Why can't you simply reorder triples? What problem arises?

5. A compiler supports 5 source languages and 4 target architectures. How many components are needed (a) without an IR, (b) with a common IR?

6. Explain why LLVM uses SSA form for its IR. What optimizations does it enable?

7. Write the quadruple representation for: `if (a < b) goto L1`

8. Draw the DAG for: `x = (a + b) * c + (a + b) * d`. How many multiplications does the DAG reveal?

9. Convert the expression `a + b * c` to stack-based IR (push/pop instructions).

10. Compare the JVM (stack-based) and LLVM (register-based) IRs. Which is easier to optimize and why?

---

## Next Steps

In the following lessons, we will explore:
- **Semantic Errors** — what the IR must correctly reject
- **Three-Address Code** — detailed instruction types
- **IR generation** — translating expressions and control flow
