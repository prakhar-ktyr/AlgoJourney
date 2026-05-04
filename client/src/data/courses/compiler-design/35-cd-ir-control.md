---
title: Generating IR for Control Flow
---

# Generating IR for Control Flow

Control flow statements (if, while, for, switch) are translated into **labels** and **conditional/unconditional jumps** in three-address code. This lesson shows the translation patterns for each construct.

---

## If-Then-Else

### Source Pattern

```c
if (condition) {
    // then-branch
} else {
    // else-branch
}
```

### Translation Template

```
    <evaluate condition>
    ifFalse condition_result goto L_else
    <then-branch code>
    goto L_end
L_else:
    <else-branch code>
L_end:
```

### Example

Source:
```c
if (a > b) {
    max = a;
} else {
    max = b;
}
```

TAC:
```
    ifFalse a > b goto L_else
    max = a
    goto L_end
L_else:
    max = b
L_end:
```

### If Without Else

```c
if (x != 0) {
    y = 100 / x;
}
```

TAC:
```
    ifFalse x != 0 goto L_end
    t1 = 100 / x
    y  = t1
L_end:
```

### Algorithm

```python
def gen_if(node):
    else_label = new_label()
    end_label = new_label()

    # Generate condition with short-circuit
    cond = gen_expr(node.condition)
    emit(f"ifFalse {cond} goto {else_label}")

    # Then branch
    gen_stmts(node.then_body)

    if node.else_body:
        emit(f"goto {end_label}")
        emit(f"{else_label}:")
        gen_stmts(node.else_body)
        emit(f"{end_label}:")
    else:
        emit(f"{else_label}:")
```

---

## While Loops

### Source Pattern

```c
while (condition) {
    // body
}
```

### Translation Template

```
L_start:
    <evaluate condition>
    ifFalse condition_result goto L_end
    <body code>
    goto L_start
L_end:
```

### Example

Source:
```c
while (i < n) {
    sum = sum + a[i];
    i = i + 1;
}
```

TAC:
```
L_start:
    ifFalse i < n goto L_end
    t1 = i * 4
    t2 = a[t1]
    sum = sum + t2
    i = i + 1
    goto L_start
L_end:
```

### Algorithm

```python
def gen_while(node):
    start_label = new_label()
    end_label = new_label()

    # Push labels for break/continue
    loop_stack.push((start_label, end_label))

    emit(f"{start_label}:")
    cond = gen_expr(node.condition)
    emit(f"ifFalse {cond} goto {end_label}")

    gen_stmts(node.body)
    emit(f"goto {start_label}")
    emit(f"{end_label}:")

    loop_stack.pop()
```

---

## Do-While Loops

### Source Pattern

```c
do {
    // body
} while (condition);
```

### Translation Template

The body always executes **at least once**:

```
L_start:
    <body code>
    <evaluate condition>
    if condition_result goto L_start
L_end:
```

### Example

Source:
```c
do {
    n = n / 2;
    count = count + 1;
} while (n > 1);
```

TAC:
```
L_start:
    n = n / 2
    count = count + 1
    if n > 1 goto L_start
L_end:
```

Note: Do-while generates **fewer jumps** than while — no unconditional `goto` back.

---

## For Loops

### Source Pattern

```c
for (init; condition; update) {
    // body
}
```

### Desugaring to While

A `for` loop is equivalent to:

```c
init;
while (condition) {
    body;
    update;
}
```

### Translation Template

```
    <init code>
L_start:
    <evaluate condition>
    ifFalse condition_result goto L_end
    <body code>
L_continue:
    <update code>
    goto L_start
L_end:
```

Note: `continue` jumps to `L_continue` (the update), not `L_start`.

### Example

Source:
```c
for (i = 0; i < n; i = i + 1) {
    sum = sum + arr[i];
}
```

TAC:
```
    i = 0
L_start:
    ifFalse i < n goto L_end
    t1 = i * 4
    t2 = arr[t1]
    sum = sum + t2
L_continue:
    i = i + 1
    goto L_start
L_end:
```

---

## Switch/Case Statements

A `switch` can be translated as an **if-else chain** or a **jump table**:

### If-Else Chain

```
    t1 = expr
    if t1 == 1 goto L_case1
    if t1 == 2 goto L_case2
    if t1 == 3 goto L_case3
    goto L_default
L_case1:
    <stmt1>
    goto L_end
L_case2:
    <stmt2>
    goto L_end
L_case3:
    <stmt3>
    goto L_end
L_default:
    <stmt_default>
L_end:
```

### Jump Table (Dense Cases)

```
    t1 = expr
    if t1 < 1 goto L_default
    if t1 > 3 goto L_default
    t2 = t1 - 1              // normalize to 0-based
    goto jump_table[t2]      // indexed jump
```

| Approach | Best When |
|----------|-----------|
| If-else chain | Few cases, sparse values |
| Jump table | Many cases, dense integer range |
| Binary search | Many cases, sparse values |

---

## Break and Continue

- **`break`** exits the innermost loop → `goto L_end`
- **`continue`** skips to next iteration → `goto L_continue` (or `L_start`)

### Break Example

```c
while (i < n) {
    if (arr[i] == target) break;
    i = i + 1;
}
```

TAC:
```
L_start:
    ifFalse i < n goto L_end
    t1 = i * 4
    t2 = arr[t1]
    ifFalse t2 == target goto L_skip
    goto L_end                 // ← break
L_skip:
    i = i + 1
    goto L_start
L_end:
```

### Continue Example

In a `for` loop, `continue` jumps to the **update** (not the condition):

```
    i = 0
L_start:
    ifFalse i < n goto L_end
    ... (check condition for continue)
    goto L_continue            // ← continue
L_body:
    ... (body code)
L_continue:
    i = i + 1                  // update executes!
    goto L_start
L_end:
```

---

## Nested Loops: Label Stack

For nested loops, maintain a **stack** of (continue_label, break_label) pairs:

```python
loop_stack = []  # Stack of (continue_label, break_label)

def gen_break():
    _, break_label = loop_stack[-1]  # innermost loop
    emit(f"goto {break_label}")

def gen_continue():
    continue_label, _ = loop_stack[-1]  # innermost loop
    emit(f"goto {continue_label}")
```

### Example: Nested Loops

Source:
```c
for (i = 0; i < rows; i++) {
    for (j = 0; j < cols; j++) {
        if (matrix[i][j] == target) {
            break;  // breaks inner loop only
        }
    }
}
```

TAC (abbreviated — inner break goes to `L_inner_end`):
```
    i = 0
L_outer_start:
    ifFalse i < rows goto L_outer_end
    j = 0
L_inner_start:
    ifFalse j < cols goto L_inner_end
    ...                            // compute matrix[i][j]
    ifFalse t4 == target goto L_inner_continue
    goto L_inner_end               // break (inner)
L_inner_continue:
    j = j + 1
    goto L_inner_start
L_inner_end:
    i = i + 1
    goto L_outer_start
L_outer_end:
```

---

## Short-Circuit in Conditions

Control flow conditions use short-circuit evaluation directly in the jumps:

### Example: While with Complex Condition

Source:
```c
while (i < n && arr[i] != 0) {
    sum = sum + arr[i];
    i = i + 1;
}
```

TAC (short-circuit `&&`):
```
L_start:
    ifFalse i < n goto L_end       // first condition false → exit
    t1 = i * 4
    t2 = arr[t1]
    ifFalse t2 != 0 goto L_end    // second condition false → exit
    sum = sum + t2
    i = i + 1
    goto L_start
L_end:
```

The short-circuit ensures `arr[i]` is only accessed when `i < n`.

---

## Translation Summary

| Construct | Pattern |
|-----------|---------|
| if-else | `ifFalse → else`, `goto → end` |
| while | `L_start`, `ifFalse → end`, body, `goto → start` |
| do-while | `L_start`, body, `if → start` |
| for | init, `L_start`, `ifFalse → end`, body, update, `goto → start` |
| break | `goto L_end` (innermost loop) |
| continue | `goto L_start` or `L_continue` |
| switch | chain of `if == goto` or jump table |

---

## Key Takeaways

1. All control flow reduces to **labels + conditional/unconditional jumps**
2. **While** needs two labels (start, end) and one back-edge
3. **For** desugars to while; `continue` targets the update section
4. **Break/continue** use a **label stack** for nested loops
5. **Switch** can use if-else chains or jump tables depending on case density
6. **Short-circuit** in loop conditions integrates naturally with jumps

---

## Exercises

1. Generate TAC for nested if-else that determines which quadrant a point `(x, y)` is in.

2. Generate TAC for a do-while with break:
   ```c
   do {
       x = x / 2;
       if (x < threshold) break;
       count++;
   } while (x > 0);
   ```

3. Generate TAC for a for loop with continue:
   ```c
   for (int i = 0; i < n; i++) {
       if (i % 2 == 0) continue;
       odd_sum += arr[i];
   }
   ```

4. Design a jump table for a switch with cases: 10, 11, 12, 13, 15. How do you handle the gap at 14?

5. Generate TAC for:
   ```c
   while (i < n && !done) {
       if (arr[i] == target) { result = i; done = 1; }
       else { i = i + 1; }
   }
   ```
