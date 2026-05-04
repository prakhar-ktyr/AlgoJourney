---
title: Backpatching
---

# Backpatching

When generating code in a **single pass**, we often need to emit jump instructions before knowing their target addresses. Backpatching is the technique that solves this problem elegantly.

---

## The Problem: Forward References

Consider translating an if-else statement:

```c
if (x > 0) {
    y = 1;
} else {
    y = -1;
}
```

When we generate the conditional jump for `x > 0`, we don't yet know where the else-branch starts:

```
100: if x > 0 goto ???    ← Don't know target yet!
101: goto ???             ← Don't know where "after else" is!
102: y = 1
103: goto ???             ← Don't know end address!
104: y = -1
105: ...                  ← NOW we know the targets
```

In a two-pass approach, the first pass collects addresses and the second fills them in. **Backpatching** does it in a single pass.

---

## The Backpatching Technique

Instead of leaving blanks, we:

1. **Record** the addresses of incomplete jumps in lists
2. **Continue** generating code
3. When we finally know the target, **patch** all jumps in the list to point there

---

## Core Operations

### `makelist(i)`

Creates a new list containing only address `i`:

$$\text{makelist}(i) = \{i\}$$

### `merge(p1, p2)`

Concatenates two lists of addresses:

$$\text{merge}(p_1, p_2) = p_1 \cup p_2$$

### `backpatch(list, target)`

Fills in `target` as the jump destination for every instruction in `list`:

$$\forall\, i \in \text{list}: \text{instruction}[i].\text{target} = \text{target}$$

---

## Backpatching for Boolean Expressions

Boolean expressions used in conditions need **short-circuit evaluation**. Each boolean expression $E$ has two lists:

- **truelist**: jumps that should go to where $E$ is true
- **falselist**: jumps that should go to where $E$ is false

### Relational Expression: `a < b`

```
100: if a < b goto ___
101: goto ___
```

- `E.truelist = makelist(100)`
- `E.falselist = makelist(101)`

### Boolean OR: `E1 || E2`

If $E_1$ is true, the whole expression is true (short-circuit). If $E_1$ is false, we must evaluate $E_2$.

**Rule:**
```
backpatch(E1.falselist, address_of_E2)
E.truelist  = merge(E1.truelist, E2.truelist)
E.falselist = E2.falselist
```

### Boolean AND: `E1 && E2`

If $E_1$ is false, the whole expression is false. If $E_1$ is true, evaluate $E_2$.

**Rule:**
```
backpatch(E1.truelist, address_of_E2)
E.truelist  = E2.truelist
E.falselist = merge(E1.falselist, E2.falselist)
```

### Boolean NOT: `!E`

Simply swap the lists:

```
E'.truelist  = E.falselist
E'.falselist = E.truelist
```

---

## Example: `a < b || c > d && e == f`

Parsing as `a < b || (c > d && e == f)`:

**Step 1:** Generate code for `a < b`
```
100: if a < b goto ___
101: goto ___
```
- `E1.truelist = {100}`, `E1.falselist = {101}`

**Step 2:** Generate code for `c > d`
```
102: if c > d goto ___
103: goto ___
```
- `E2.truelist = {102}`, `E2.falselist = {103}`

**Step 3:** Generate code for `e == f`
```
104: if e == f goto ___
105: goto ___
```
- `E3.truelist = {104}`, `E3.falselist = {105}`

**Step 4:** Apply AND rule for `c > d && e == f`:
```
backpatch(E2.truelist={102}, 104)   → instruction 102 now: "if c > d goto 104"
E4.truelist  = E3.truelist = {104}
E4.falselist = merge({103}, {105}) = {103, 105}
```

**Step 5:** Apply OR rule for `a < b || E4`:
```
backpatch(E1.falselist={101}, 102)  → instruction 101 now: "goto 102"
E.truelist  = merge({100}, {104}) = {100, 104}
E.falselist = {103, 105}
```

Final code with partial patching:
```
100: if a < b goto ___     ← still in truelist
101: goto 102
102: if c > d goto 104
103: goto ___              ← still in falselist
104: if e == f goto ___    ← still in truelist
105: goto ___              ← still in falselist
```

The remaining addresses get patched when we know the true/false destinations (from the enclosing statement).

---

## Backpatching for If-Else

Grammar production:

```
S → if (E) M S1 else N M S2
```

Where:
- $M$ is a **marker** that records the current instruction address
- $N$ generates an unconditional jump (to skip the else-part after the if-part)

**Semantic rules:**

```
M.addr = nextInstr()           // marker saves current address

// For N:
N.nextlist = makelist(nextInstr())
emit("goto ___")

// For if-else:
backpatch(E.truelist, M1.addr)     // true → S1
backpatch(E.falselist, M2.addr)    // false → S2
S.nextlist = merge(S1.nextlist, N.nextlist, S2.nextlist)
```

### Concrete Example

```c
if (x > 0) {
    y = 1;
} else {
    y = -1;
}
z = 0;
```

Generation step by step:

```
100: if x > 0 goto ___     E.truelist = {100}
101: goto ___               E.falselist = {101}
```
Marker M1: addr = 102
```
102: y = 1
103: goto ___               N.nextlist = {103}
```
Marker M2: addr = 104
```
104: y = -1
```

Now backpatch:
- `backpatch({100}, 102)` → `100: if x > 0 goto 102`
- `backpatch({101}, 104)` → `101: goto 104`
- `S.nextlist = merge({103}, S2.nextlist)`

When we reach `z = 0` at address 105:
- `backpatch(S.nextlist, 105)` → `103: goto 105`

Final code:
```
100: if x > 0 goto 102
101: goto 104
102: y = 1
103: goto 105
104: y = -1
105: z = 0
```

---

## Backpatching for While Loops

Grammar production:

```
S → while M1 (E) M2 S1
```

**Semantic rules:**

```
backpatch(E.truelist, M2.addr)      // condition true → loop body
backpatch(S1.nextlist, M1.addr)     // after body → back to condition
S.nextlist = E.falselist            // condition false → exit loop
emit("goto M1.addr")               // unconditional jump back
```

### Example

```c
while (i < 10) {
    i = i + 1;
}
sum = 0;
```

Marker M1: addr = 100
```
100: if i < 10 goto ___     E.truelist = {100}
101: goto ___               E.falselist = {101}
```
Marker M2: addr = 102
```
102: t1 = i + 1
103: i = t1
104: goto ___               S1.nextlist = {104} (or emit goto directly)
```

Backpatch:
- `backpatch({100}, 102)` → `100: if i < 10 goto 102`
- Emit `goto 100` at end of body or backpatch S1.nextlist to M1
- `S.nextlist = {101}`

When we know next statement is at 105:
- `backpatch({101}, 105)` → `101: goto 105`

Final:
```
100: if i < 10 goto 102
101: goto 105
102: t1 = i + 1
103: i = t1
104: goto 100
105: sum = 0
```

---

## Backpatching for Nested Conditions

```c
if (a > 0 && b > 0) {
    c = 1;
}
d = 2;
```

**Step 1:** `a > 0`
```
100: if a > 0 goto ___      E1.truelist = {100}
101: goto ___               E1.falselist = {101}
```

**Step 2:** `b > 0`
```
102: if b > 0 goto ___      E2.truelist = {102}
103: goto ___               E2.falselist = {103}
```

**Step 3:** AND: `backpatch(E1.truelist, 102)`
```
E.truelist = {102}
E.falselist = merge({101}, {103}) = {101, 103}
```

**Step 4:** Marker M1 = 104
```
104: c = 1
```

**Step 5:** Backpatch if-statement:
- `backpatch(E.truelist={102}, 104)` → `102: if b > 0 goto 104`
- `S.nextlist = merge(S1.nextlist, E.falselist) = merge({}, {101, 103})`

**Step 6:** `d = 2` at address 105:
- `backpatch({101, 103}, 105)`

Final:
```
100: if a > 0 goto 102
101: goto 105
102: if b > 0 goto 104
103: goto 105
104: c = 1
105: d = 2
```

---

## Implementation Sketch

```python
class Instruction:
    def __init__(self, op, arg1=None, arg2=None, target=None):
        self.op = op
        self.arg1 = arg1
        self.arg2 = arg2
        self.target = target  # None means "to be patched"

code = []  # List of instructions

def next_instr():
    """Return address of next instruction to be generated."""
    return len(code)

def emit(op, arg1=None, arg2=None, target=None):
    """Emit an instruction, return its address."""
    addr = len(code)
    code.append(Instruction(op, arg1, arg2, target))
    return addr

def makelist(addr):
    """Create list with single address."""
    return [addr]

def merge(list1, list2):
    """Merge two address lists."""
    return list1 + list2

def backpatch(addr_list, target):
    """Set target for all instructions in list."""
    for addr in addr_list:
        code[addr].target = target
```

---

## Why Backpatching Matters

| Approach | Passes | Memory | Use Case |
|----------|--------|--------|----------|
| Two-pass | 2 | Stores all code | Simple, clear |
| Backpatching | 1 | Lists of addresses | Efficient, single-pass compilers |

Backpatching is essential in **syntax-directed translation** where we want to generate code as we parse, without a separate pass to resolve forward references.

---

## Summary

- **Problem**: jump targets unknown when jump is generated
- **Solution**: maintain lists of incomplete jumps, patch later
- **Three operations**: `makelist`, `merge`, `backpatch`
- **Boolean expressions**: truelist/falselist propagation
- **Control flow**: markers record addresses for backpatching

---

## Exercises

1. **Generate backpatched code** for:
   ```c
   if (a > 0 || b > 0) {
       x = 1;
   } else {
       x = 2;
   }
   y = 3;
   ```
   Show all lists and backpatch operations at each step.

2. **Generate code** for a while loop with a compound condition:
   ```c
   while (i < n && arr[i] != 0) {
       sum = sum + arr[i];
       i = i + 1;
   }
   ```

3. **Trace the backpatching** for nested if:
   ```c
   if (a > 0) {
       if (b > 0) {
           c = 1;
       }
   }
   d = 2;
   ```

4. **Implement** the `makelist`, `merge`, and `backpatch` functions in C. Use a linked list where each instruction stores a "next" pointer into the list of patches.

5. **Explain** why the marker nonterminal $M$ is necessary. What happens if we don't record the instruction address at certain points?

6. **Generate backpatched code** for:
   ```c
   if (!(a > 0 && b > 0)) {
       x = 0;
   }
   ```
   Show how NOT swaps the true/false lists.
