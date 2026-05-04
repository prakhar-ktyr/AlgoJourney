---
title: Generating IR for Expressions
---

# Generating IR for Expressions

This lesson covers how a compiler translates various kinds of expressions into three-address code (TAC). We handle arithmetic, boolean, array access, struct fields, and type conversions.

---

## Arithmetic Expressions

The AST already encodes operator precedence, so the IR generator simply walks the tree:

### Algorithm

```python
def gen_expr(node):
    if isinstance(node, Constant):
        return str(node.value)
    if isinstance(node, Variable):
        return node.name
    if isinstance(node, UnaryOp):
        arg = gen_expr(node.operand)
        t = new_temp()
        emit(f"{t} = {node.op} {arg}")
        return t
    if isinstance(node, BinaryOp):
        left = gen_expr(node.left)
        right = gen_expr(node.right)
        t = new_temp()
        emit(f"{t} = {left} {node.op} {right}")
        return t
```

### Example

Source: `result = a * b + c * d - e`

AST structure (precedence already resolved):
```
        -
       / \
      +   e
     / \
    *   *
   / \ / \
  a  b c  d
```

Generated TAC:
```
t1 = a * b
t2 = c * d
t3 = t1 + t2
t4 = t3 - e
result = t4
```

---

## Operator Precedence in IR

A key insight: **precedence is handled by the parser**, not the IR generator.

By the time we generate IR, the AST correctly represents:
- `a + b * c` as `a + (b * c)` (multiply first)
- `a - b - c` as `(a - b) - c` (left-to-right)

The IR generator just does a post-order traversal — no precedence logic needed.

---

## Boolean Expressions

Boolean expressions need special handling because of **short-circuit evaluation**.

### Short-Circuit Semantics

In most languages (C, Java, Python):
- `a && b`: if `a` is **false**, don't evaluate `b`
- `a || b`: if `a` is **true**, don't evaluate `b`

This is not just an optimization — it affects correctness:
```c
// Safe because of short-circuit:
if (ptr != NULL && ptr->value > 0) { ... }
```

### Generating Code for `&&`

Source: `x = a && b`

```
    t1 = a
    ifFalse t1 goto L_false
    t2 = b
    ifFalse t2 goto L_false
    x = 1
    goto L_end
L_false:
    x = 0
L_end:
```

### Generating Code for `||`

Source: `x = a || b`

```
    t1 = a
    if t1 goto L_true
    t2 = b
    if t2 goto L_true
    x = 0
    goto L_end
L_true:
    x = 1
L_end:
```

### Algorithm for Boolean Expressions

```python
def gen_bool(node, true_label, false_label):
    """Generate code that jumps to true_label if node is true,
       false_label if node is false."""

    if isinstance(node, AndExpr):
        # a && b: if a is false, whole thing is false
        mid_label = new_label()
        gen_bool(node.left, mid_label, false_label)
        emit(f"{mid_label}:")
        gen_bool(node.right, true_label, false_label)

    elif isinstance(node, OrExpr):
        # a || b: if a is true, whole thing is true
        mid_label = new_label()
        gen_bool(node.left, true_label, mid_label)
        emit(f"{mid_label}:")
        gen_bool(node.right, true_label, false_label)

    elif isinstance(node, NotExpr):
        # !a: swap true and false
        gen_bool(node.operand, false_label, true_label)

    elif isinstance(node, Comparison):
        left = gen_expr(node.left)
        right = gen_expr(node.right)
        emit(f"if {left} {node.op} {right} goto {true_label}")
        emit(f"goto {false_label}")
```

### Complex Example

Source: `if (a > 0 && (b < 10 || c == 1))`

```
    if a > 0 goto L1
    goto L_false
L1: if b < 10 goto L_true
    goto L2
L2: if c == 1 goto L_true
    goto L_false
L_true:
    ... (then-branch)
L_false:
    ... (else-branch or end)
```

---

## Comparison Expressions

Relational operators produce boolean results:

Source: `x = (a > b)`

```
    if a > b goto L_true
    x = 0
    goto L_end
L_true:
    x = 1
L_end:
```

Or in some compilers, directly:
```
t1 = a > b      // t1 is 0 or 1
x = t1
```

The choice depends on the target architecture.

---

## Array Access

Array elements are accessed by computing a memory offset from the base address.

### 1D Array

For array `A` with elements of size $w$ (bytes):

$$\text{addr}(A[i]) = \text{base}(A) + i \times w$$

Source: `x = A[i]`

```
t1 = i * 4          // assuming int (4 bytes)
t2 = A[t1]          // indexed load
x  = t2
```

Source: `A[i] = x + 1`

```
t1 = x + 1
t2 = i * 4
A[t2] = t1          // indexed store
```

### 2D Array (Row-Major Order)

For array `A[rows][cols]` with element size $w$:

$$\text{addr}(A[i][j]) = \text{base}(A) + (i \times \text{cols} + j) \times w$$

Source: `x = matrix[i][j]` where matrix is `int[M][N]`

```
t1 = i * N          // row offset (in elements)
t2 = t1 + j         // total element index
t3 = t2 * 4         // byte offset
t4 = matrix[t3]     // load
x  = t4
```

### 2D Array (Column-Major Order)

Used by Fortran:

$$\text{addr}(A[i][j]) = \text{base}(A) + (j \times \text{rows} + i) \times w$$

### General Formula

For an $n$-dimensional array $A[d_1][d_2]...[d_n]$ in row-major order, the offset for $A[i_1][i_2]...[i_n]$ is:

$$\text{offset} = \left(\sum_{k=1}^{n} i_k \prod_{m=k+1}^{n} d_m\right) \times w$$

---

## Struct Field Access

Struct fields are at fixed offsets from the struct's base address:

```c
struct Point {
    int x;    // offset 0
    int y;    // offset 4
    float z;  // offset 8
};
```

Source: `val = p.y` where `p` is a `struct Point`

```
t1 = &p + 4         // base + field offset
val = *t1           // load from computed address
```

Or using the higher-level notation:
```
val = p.y           // compiler knows offset is 4
```

### Nested Structs

```c
struct Line {
    struct Point start;  // offset 0  (size 12)
    struct Point end;    // offset 12 (size 12)
};
```

Source: `val = line.end.x`

```
t1 = &line + 12     // offset of 'end'
t2 = *t1            // 'end.x' is at offset 0 within Point
val = t2
```

Combined offset: $12 + 0 = 12$ bytes from `line` base.

---

## Type Conversions

When operands have different types, the compiler inserts **conversion instructions**.

### Widening (Implicit, Safe)

Smaller type → larger type. No data loss.

```c
int a = 5;
double b = a + 3.14;  // 'a' widened to double
```

TAC:
```
t1 = (double) a      // int → double
t2 = t1 + 3.14
b  = t2
```

### Narrowing (Explicit, Lossy)

Larger type → smaller type. May lose data.

```c
double pi = 3.14159;
int approx = (int) pi;  // explicit cast
```

TAC:
```
t1 = (int) pi        // double → int (truncates)
approx = t1
```

### Type Conversion Hierarchy

$$\text{char} \rightarrow \text{int} \rightarrow \text{long} \rightarrow \text{float} \rightarrow \text{double}$$

When mixing types in an expression, the **narrower** operand is promoted:

```c
int a = 5;
float b = 2.5;
// a + b: 'a' is promoted to float
```

TAC:
```
t1 = (float) a
t2 = t1 + b
```

### Algorithm

```python
def gen_binary_with_coercion(node):
    left = gen_expr(node.left)
    right = gen_expr(node.right)
    left_type = get_type(node.left)
    right_type = get_type(node.right)

    result_type = max_type(left_type, right_type)

    if left_type != result_type:
        t = new_temp()
        emit(f"{t} = ({result_type}) {left}")
        left = t

    if right_type != result_type:
        t = new_temp()
        emit(f"{t} = ({result_type}) {right}")
        right = t

    t = new_temp()
    emit(f"{t} = {left} {node.op} {right}")
    return t
```

---

## Complete Example

Source:
```c
double result = arr[i] * 2.0 + (double)(x + y);
```

Assuming `arr` is `int[]`, `i`, `x`, `y` are `int`:

```
t1 = i * 4              // byte offset for arr[i]
t2 = arr[t1]            // load int from array
t3 = (double) t2        // widen int → double
t4 = t3 * 2.0           // multiply (both double)
t5 = x + y              // int addition
t6 = (double) t5        // explicit cast
t7 = t4 + t6            // double addition
result = t7
```

---

## Summary

| Expression Type | Key Technique |
|----------------|---------------|
| Arithmetic | Post-order AST traversal |
| Boolean (`&&`, `||`) | Short-circuit with labels/jumps |
| Comparisons | Conditional jumps or 0/1 assignment |
| Array access | Base + index × element_size |
| Struct field | Base + field_offset |
| Type conversion | Insert cast instructions |

---

## Key Takeaways

1. The **AST handles precedence** — IR generation is a simple traversal
2. **Short-circuit evaluation** requires control flow (labels + jumps) for booleans
3. Array access computes **byte offsets** from the base address
4. **Type coercion** inserts explicit conversion instructions
5. 2D arrays use the formula $(i \times \text{cols} + j) \times w$ for row-major

---

## Exercises

1. Generate TAC for: `x = a[i] + b[j] * c[k]` (all int arrays)

2. Generate TAC with short-circuit for: `if (x > 0 && y > 0 || z == 0)`

3. Generate TAC for 2D access: `result = matrix[row][col] + matrix[col][row]` where matrix is `float[10][10]`

4. Generate TAC with type conversions for: `double d = (int_var + float_var) * long_var`

5. Write the TAC for accessing a nested struct: `value = employee.address.zipcode` given:
   ```c
   struct Address { char street[50]; char city[30]; int zipcode; };
   struct Employee { char name[40]; int id; struct Address address; };
   ```

6. Why does short-circuit evaluation affect correctness, not just performance? Give an example.

7. Generate TAC for: `flag = (a > b) && !(c <= d)`
