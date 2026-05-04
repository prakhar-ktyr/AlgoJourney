---
title: Local Optimization
---

# Local Optimization

Local optimization operates within a **single basic block** — a straight-line sequence of instructions with no branches. Because there's only one path through the block, analysis is simple and transformations are always safe.

---

## Peephole Optimization

**Peephole optimization** examines a small sliding window (the "peephole") of consecutive instructions and replaces inefficient patterns with better ones.

### Algebraic Simplification

Replace operations with simpler equivalents:

| Pattern | Replacement | Rule |
|---------|-------------|------|
| `x + 0` | `x` | Additive identity |
| `x - 0` | `x` | Subtractive identity |
| `x * 1` | `x` | Multiplicative identity |
| `x * 0` | `0` | Zero multiplication |
| `x / 1` | `x` | Division by one |
| `x ** 2` | `x * x` | Small exponent expansion |
| `x - x` | `0` | Self subtraction |
| `0 / x` | `0` | Zero divided (if $x \neq 0$) |

**Example:**

```
t1 = a * 1       →  t1 = a
t2 = t1 + 0      →  t2 = t1
t3 = b * 0       →  t3 = 0
```

### Strength Reduction

Replace expensive operations with cheaper ones:

| Expensive | Cheap | When |
|-----------|-------|------|
| `x * 2` | `x + x` or `x << 1` | Always |
| `x * 4` | `x << 2` | Always |
| `x * 2^n` | `x << n` | Power of 2 |
| `x / 2` | `x >> 1` | Unsigned or known positive |
| `x / 4` | `x >> 2` | Unsigned or known positive |
| `x % 2` | `x & 1` | Unsigned |
| `x % 2^n` | `x & (2^n - 1)` | Unsigned |

**Why?** Shifts and additions are typically 1 cycle; multiplication can be 3-5 cycles; division can be 20+ cycles.

**Example:**

```
t1 = i * 4       →  t1 = i << 2
t2 = j * 8       →  t2 = j << 3
t3 = k / 2       →  t3 = k >> 1     (if k unsigned)
t4 = n % 4       →  t4 = n & 3      (if n unsigned)
```

### Constant Folding

Evaluate expressions with all-constant operands at **compile time**:

```
t1 = 3 + 5       →  t1 = 8
t2 = 2 * 7       →  t2 = 14
t3 = 100 / 4     →  t3 = 25
t4 = 10 > 3      →  t4 = true
```

This extends to operations on known constants:

```
PI = 3.14159
t1 = PI * 2      →  t1 = 6.28318
```

### Redundant Operations

Remove operations that have no effect:

```
x = x            →  (delete)
x = x + 0       →  (delete)
x = x * 1       →  (delete)
goto L           →  (delete, if L is the very next instruction)
```

### Unreachable Code After Jump

```
goto L1
x = 5            →  (delete — unreachable)
y = x + 1        →  (delete — unreachable)
L1: ...
```

---

## Local Common Subexpression Elimination (CSE)

If the same expression is computed multiple times within a block, compute it once and reuse the result.

### Simple Example

```
t1 = a + b
t2 = a + b       →  t2 = t1
t3 = t1 * t2
```

### When is it Safe?

CSE is safe if the operands **haven't changed** between the two computations:

```
t1 = a + b
a = 7            ← a changed!
t2 = a + b       ← NOT the same as t1
```

---

## DAG of a Basic Block

A **Directed Acyclic Graph (DAG)** represents computations in a basic block, sharing common subexpressions as shared nodes.

### Building the DAG

For each instruction `x = y op z`:
1. Find or create nodes for `y` and `z`
2. Check if a node `y op z` already exists
   - If yes: make `x` point to that existing node (CSE!)
   - If no: create a new node

### Example

TAC:
```
t1 = a + b
t2 = a + b
t3 = t1 * t2
t4 = t1 * t2
c  = t3 + t4
```

DAG:

```
         [+ c]
        /      \
   [* t3,t4]  [* t3,t4]  ← same node!
      |    \
  [+ t1,t2] [+ t1,t2]    ← same node!
    /    \
  [a]    [b]
```

Simplified (shared nodes):

```
       [+ c]
      /      \
     same  same
       \  /
    [* t3,t4]
        |
    [+ t1,t2]
      /    \
    [a]    [b]
```

Optimized code from DAG:
```
t1 = a + b
t3 = t1 * t1
c  = t3 + t3
```

Six instructions → three!

---

## Local Copy Propagation

After a copy `x = y`, replace subsequent uses of `x` with `y` (until `x` or `y` is redefined).

### Example

```
t1 = a + b
x = t1           ← copy
t2 = x * 2      →  t2 = t1 * 2
t3 = x + 1      →  t3 = t1 + 1
```

After propagation, the copy `x = t1` may become dead (unused) and can be eliminated.

### When Copy Propagation Fails

```
x = y
y = 10           ← y redefined!
z = x + 1        ← must use x, not y (y has changed)
```

---

## Local Dead Code Elimination

An assignment is **dead** if its result is never used (within the block and not live-out).

### Example

```
t1 = a + b
t2 = c + d       ← t2 never used later
t3 = t1 * 2
return t3
```

`t2 = c + d` is dead → remove it:

```
t1 = a + b
t3 = t1 * 2
return t3
```

### Cascading Elimination

Removing dead code may make other code dead:

```
t1 = a + b
t2 = t1 * 2      ← only use of t1
t3 = c + d
return t3
```

`t2` is dead → remove. Now `t1` is also dead → remove:

```
t3 = c + d
return t3
```

---

## Value Numbering

**Value numbering** assigns a number to each computed value. Expressions that produce the same value get the same number, enabling CSE without textual matching.

### Algorithm

Maintain a hash table mapping `(operator, value_num1, value_num2)` → `value_number`:

```python
value_table = {}   # expression → value number
var_to_vn = {}     # variable → its current value number
next_vn = 0

def get_value_number(var):
    if var is a constant:
        key = ("const", var)
    else:
        key = var
    if key not in var_to_vn:
        var_to_vn[key] = new_number()
    return var_to_vn[key]

def process_instruction(x, op, y, z):
    vn_y = get_value_number(y)
    vn_z = get_value_number(z)
    expr = (op, vn_y, vn_z)
    
    if expr in value_table:
        # Reuse existing computation
        var_to_vn[x] = value_table[expr]
    else:
        # New value
        vn = new_number()
        value_table[expr] = vn
        var_to_vn[x] = vn
```

### Example

```
a = x + y       VN: a=#1, expr(+,x,y)=#1
b = x + y       VN: b=#1 (same expr!) → b = a
c = a + b       VN: c=#2, expr(+,#1,#1)=#2
d = a + a       VN: d=#2 (same!) → d = c
```

### Commutativity

For commutative operators, sort operands:
- `a + b` and `b + a` should hash the same
- `a * b` and `b * a` should hash the same

```python
if op in ('+', '*'):
    vn_y, vn_z = sorted([vn_y, vn_z])
```

---

## Combining Optimizations

Optimizations work best in combination. A typical local optimization pass:

```
1. Build DAG (identifies CSE)
2. Apply constant folding on DAG nodes
3. Apply algebraic simplification
4. Generate optimized code from DAG
5. Apply copy propagation
6. Apply dead code elimination
```

### Complete Example

**Original block:**
```
t1 = 2 * 3
t2 = a + t1
t3 = a + 6
t4 = t2
t5 = t4 * 1
t6 = t5 + 0
result = t6
```

**After constant folding:**
```
t1 = 6
t2 = a + 6
t3 = a + 6
t4 = t2
t5 = t4 * 1
t6 = t5 + 0
result = t6
```

**After CSE** (`a + 6` computed twice):
```
t1 = 6
t2 = a + 6
t3 = t2
t4 = t2
t5 = t4 * 1
t6 = t5 + 0
result = t6
```

**After copy propagation** (`t3=t2`, `t4=t2`):
```
t1 = 6
t2 = a + 6
t5 = t2 * 1
t6 = t5 + 0
result = t6
```

**After algebraic simplification** (`*1`, `+0`):
```
t1 = 6
t2 = a + 6
t5 = t2
t6 = t5
result = t6
```

**After copy propagation and dead code elimination:**
```
result = a + 6
```

From 7 instructions to 1!

---

## Peephole Optimization on Machine Code

Peephole also applies at the assembly level:

| Pattern | Optimized |
|---------|-----------|
| `mov R1, R2` then `mov R2, R1` | Remove second |
| `add R1, 0` | Remove |
| `jmp L` where L is next instruction | Remove |
| `push R1` then `pop R1` | Remove both |
| `load R1, [addr]` then `store R1, [addr]` | Remove store |

---

## Limitations of Local Optimization

Local optimization cannot:
- Move computations across basic block boundaries
- Optimize loops (loop body is usually a separate block)
- Propagate information from one block to another

These require **global optimization** (next lessons).

---

## Summary

| Technique | What It Does |
|-----------|--------------|
| Algebraic simplification | Replace with simpler equivalent |
| Strength reduction | Replace expensive ops with cheap ones |
| Constant folding | Evaluate constants at compile time |
| Local CSE | Eliminate redundant computations |
| DAG construction | Visualize and exploit sharing |
| Copy propagation | Replace copies with original |
| Dead code elimination | Remove unused assignments |
| Value numbering | Detect same values via numbering |

---

## Exercises

1. **Optimize this basic block** using all local techniques:
   ```
   t1 = b * 1
   t2 = a + t1
   t3 = b
   t4 = a + t3
   t5 = t2 * t4
   t6 = t5 + 0
   ```
   Show each step.

2. **Build a DAG** for this block and generate optimized code:
   ```
   a = b + c
   d = b + c
   e = a - d
   f = a - d
   g = e * f
   ```

3. **Apply value numbering** to:
   ```
   a = x * y
   b = x * y
   c = a + b
   d = a + a
   ```
   Assign value numbers and identify redundancies.

4. **Apply strength reduction** where possible:
   ```
   t1 = i * 16
   t2 = j * 7
   t3 = k * 32
   t4 = n / 8
   t5 = m % 16
   ```
   Which ones can be replaced? Which cannot?

5. **Perform cascading dead code elimination** on:
   ```
   a = x + y
   b = a * 2
   c = x - y
   d = c + 1
   e = c + 1
   return e
   ```

6. **Explain** why local CSE requires checking that operands haven't been redefined. Give an example where incorrectly applying CSE produces wrong results.
