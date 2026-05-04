---
title: Just-In-Time Compilation
---

# Just-In-Time Compilation

In previous lessons, we studied **ahead-of-time (AOT)** compilation — the entire program is compiled before execution. But many modern languages use a different approach: **Just-In-Time (JIT)** compilation, which compiles code **during** execution for better performance.

---

## What Is JIT Compilation?

A **JIT compiler** translates code to native machine code **at runtime**, right before (or during) execution.

```
Source Code → Bytecode → [JIT Compiler] → Native Machine Code → CPU
```

Instead of interpreting bytecode instruction by instruction, the JIT compiler identifies frequently executed code and compiles it to fast native code.

> **Key Idea:** Combine the portability of interpretation with the speed of compilation.

---

## AOT vs JIT Compilation

| Feature | AOT (Ahead-of-Time) | JIT (Just-in-Time) |
|---|---|---|
| **When compiled** | Before execution | During execution |
| **Startup time** | Fast (already compiled) | Slower (compilation overhead) |
| **Peak performance** | Good | Can be better (runtime info) |
| **Portability** | Platform-specific binary | Portable bytecode |
| **Optimization** | Static analysis only | Uses runtime profiling data |
| **Examples** | C, C++, Rust, Go | Java, JavaScript, C#, Python (PyPy) |

**AOT** knows nothing about actual runtime behavior. **JIT** can observe what the program actually does and optimize accordingly.

---

## How JIT Works

A JIT system typically follows this workflow:

### Step 1: Interpret First

The program starts by interpreting bytecode. This is slow but has zero compilation overhead.

```
function add(a, b) {
    return a + b;
}
```

The interpreter runs `add()` directly from bytecode.

### Step 2: Identify Hot Code

The runtime **profiles** execution, counting how many times each function or loop runs.

```
for (let i = 0; i < 1000000; i++) {
    add(i, i + 1);  // Called 1,000,000 times → HOT!
}
```

Code that runs frequently is called **hot code**. A counter threshold (e.g., 10,000 invocations) triggers compilation.

### Step 3: Compile to Native Code

The JIT compiler translates hot bytecode into optimized native machine instructions.

```
; Native x86 for add(a, b)
mov eax, edi      ; a → eax
add eax, esi      ; eax += b
ret               ; return eax
```

### Step 4: Patch and Execute

The runtime **patches** call sites to jump to the compiled native code instead of the interpreter.

```
Before:  call INTERPRETER_add
After:   call NATIVE_add_0x7f3a...
```

Future calls to `add()` execute native code directly — much faster!

---

## Tiered Compilation

Modern JIT systems use **multiple tiers** of compilation, trading compilation time for code quality:

```
┌─────────────┐     ┌──────────────┐     ┌────────────────────┐
│ Interpreter  │ ──→ │ Baseline JIT  │ ──→ │  Optimizing JIT     │
│ (Tier 0)     │     │ (Tier 1)      │     │  (Tier 2)           │
│ No compile   │     │ Fast compile  │     │  Slow compile       │
│ Slowest exec │     │ Medium exec   │     │  Fastest exec       │
└─────────────┘     └──────────────┘     └────────────────────┘
```

### Why Tiers?

- **Tier 0 (Interpreter):** Zero startup cost. Good for code that runs once.
- **Tier 1 (Baseline JIT):** Quick compilation, moderate speedup. Good for warm code.
- **Tier 2 (Optimizing JIT):** Expensive compilation, maximum speedup. Only for very hot code.

This avoids wasting time optimizing code that barely runs.

---

## Real-World JIT Examples

### 1. JVM HotSpot (Java)

The most mature JIT system:

```
Java Source → javac → Bytecode (.class) → JVM HotSpot JIT → Native Code
```

- **C1 compiler:** Fast baseline compilation (Tier 1)
- **C2 compiler:** Aggressive optimizing compilation (Tier 2)
- Profiling guides inlining, loop unrolling, escape analysis

```java
// HotSpot can inline this after profiling
public int sum(int[] arr) {
    int total = 0;
    for (int x : arr) {
        total += x;
    }
    return total;
}
```

### 2. V8 (JavaScript — Chrome, Node.js)

```
JavaScript → Parser → Bytecode (Ignition) → TurboFan JIT → Native Code
```

- **Ignition:** Bytecode interpreter (Tier 0)
- **TurboFan:** Optimizing compiler with speculative optimization
- Uses **inline caches** to speed up property access

```javascript
// V8 profiles types: if add() always receives numbers,
// TurboFan compiles a fast integer-addition path
function add(a, b) {
    return a + b;
}
```

### 3. .NET RyuJIT (C#)

```
C# → Roslyn → IL (Intermediate Language) → RyuJIT → Native Code
```

- Single-tier JIT (compiles all methods on first call)
- Tiered compilation added in .NET Core 3.0+
- Supports **ReadyToRun (R2R)** for hybrid AOT+JIT

### 4. LuaJIT

One of the fastest JIT compilers ever built:

- **Tracing JIT** architecture (see below)
- Generates extremely efficient machine code
- Often faster than C for certain workloads

---

## Profiling-Guided Optimization

JIT compilers collect **runtime profiles** to make better optimization decisions than AOT compilers.

### What Profiles Capture

| Profile Data | Optimization Enabled |
|---|---|
| Call frequency | Inlining decisions |
| Branch direction | Branch prediction hints |
| Actual types seen | Type specialization |
| Loop trip counts | Loop unrolling decisions |
| Memory access patterns | Cache optimization |

### Example: Type Specialization

```javascript
function multiply(a, b) {
    return a * b;
}

// Profile: a and b are ALWAYS integers
// JIT generates: integer multiply (fast)
// Instead of: generic multiply with type checks (slow)
```

### Example: Inlining with Profile Data

```java
// Profile shows: shape is always Circle
void draw(Shape shape) {
    shape.render();  // Virtual call
}

// JIT inlines Circle.render() directly:
void draw(Shape shape) {
    // Inlined Circle.render() code here
    // + guard: if shape is NOT Circle, deoptimize
}
```

---

## Deoptimization

JIT compilers make **speculative assumptions** based on profiles. When assumptions become invalid, the JIT must **deoptimize** — fall back to slower code.

### How Deoptimization Works

```
1. JIT compiles add(a, b) assuming a and b are always integers
2. Guard check: if (typeof a !== 'number') → deoptimize
3. Someone calls add("hello", "world")
4. Guard fails → deoptimize!
5. Fall back to interpreter or recompile with new assumptions
```

### Deoptimization Triggers

- **Type change:** A variable that was always an integer suddenly becomes a string
- **Hidden class change:** Object shape changes unexpectedly
- **New code loaded:** A subclass overrides an inlined method
- **Rare branch taken:** An exception path that was never profiled

```javascript
function process(x) {
    return x.value + 1;  // JIT assumes x always has .value
}

process({ value: 42 });    // Fine — matches assumption
process({ value: 42, extra: true });  // Different shape → deoptimize!
```

> **Deoptimization is expensive** but necessary for correctness. Good JIT compilers minimize it through careful speculation.

---

## Tracing JIT

A **tracing JIT** takes a fundamentally different approach from a **method JIT**.

### How Tracing JIT Works

Instead of compiling entire methods, a tracing JIT:

1. **Interprets** code and profiles it
2. Identifies a **hot loop**
3. **Records a trace** — the exact sequence of operations executed in one iteration
4. **Compiles the trace** into native code with guards

```python
# Original code
def search(items, target):
    for item in items:
        if item.active:
            if item.name == target:
                return item
    return None
```

```
# Recorded trace (one iteration where item.active=True, match fails):
GUARD: item.active == True
LOAD: item.name
COMPARE: item.name == target
GUARD: comparison == False
JUMP: back to loop start
```

The trace is a **straight-line** sequence — no branches, just guards. This is very efficient to compile and execute.

### Trace Trees

When a guard fails frequently, the JIT records a **side trace** from that point:

```
Main trace: A → B → C → D → (loop back)
                  ↓
Side trace:       B' → E → F → (loop back)
```

This builds a **trace tree** covering different execution paths.

---

## Method JIT vs Tracing JIT

| Feature | Method JIT | Tracing JIT |
|---|---|---|
| **Compilation unit** | Entire method | Linear trace (loop iteration) |
| **Handles branches** | Compiles all paths | Only compiles taken path |
| **Best for** | General code | Loop-heavy code |
| **Deoptimization** | Per-method | Per-guard in trace |
| **Examples** | HotSpot C2, V8 TurboFan | LuaJIT, PyPy |
| **Complexity** | Higher | Lower compiler, but trace management adds complexity |

### When to Use Each

- **Method JIT:** Better for applications with many short methods and diverse control flow
- **Tracing JIT:** Better for tight numerical loops and repetitive patterns

---

## JIT Compilation Techniques Summary

| Technique | Description |
|---|---|
| **Inline caching** | Cache method lookup results at call sites |
| **On-stack replacement (OSR)** | Switch from interpreter to compiled code mid-execution |
| **Escape analysis** | Allocate objects on stack instead of heap if they don't escape |
| **Loop unrolling** | Duplicate loop body to reduce branch overhead |
| **Dead code elimination** | Remove code that profiling shows is never reached |
| **Constant folding** | Evaluate constant expressions at compile time |
| **Type specialization** | Generate code for specific observed types |

---

## JIT Warmup and Steady State

JIT performance follows a characteristic curve:

```
Performance
    │
    │            ┌──────── Steady state (optimized)
    │           /
    │          / ← Optimization kicks in
    │         /
    │   ─────/  ← Baseline JIT
    │  /
    │ / ← Interpretation
    │/
    └──────────────────────── Time
         Warmup period
```

- **Warmup:** Performance is poor while profiling and compiling
- **Steady state:** After hot code is compiled, performance plateaus at near-native speed

> **Benchmark tip:** Always warm up JIT before measuring! Run the benchmark loop several times before timing.

---

## Try It Yourself

### Exercise 1: JIT Observation

Run this Java program and observe JIT warmup:

```java
public class JITDemo {
    static long fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        // Warmup rounds
        for (int round = 0; round < 10; round++) {
            long start = System.nanoTime();
            fib(35);
            long elapsed = (System.nanoTime() - start) / 1_000_000;
            System.out.println("Round " + round + ": " + elapsed + " ms");
        }
    }
}
```

**Expected:** Early rounds are slower (interpreted), later rounds are faster (JIT compiled).

### Exercise 2: Deoptimization

Explain why this JavaScript code might cause deoptimization in V8:

```javascript
function getLength(obj) {
    return obj.length;
}

getLength([1, 2, 3]);      // Array
getLength("hello");         // String
getLength({ length: 5 });   // Plain object
```

### Exercise 3: Trace Recording

Given this loop, write the trace a tracing JIT would record:

```python
total = 0
for i in range(100):
    if i % 2 == 0:
        total += i
    else:
        total += i * 2
```

Record the trace for the case where `i` is even.

### Exercise 4: Tier Decision

A function is called 500 times. Your JIT system has these thresholds:
- Tier 1 (baseline): 100 calls
- Tier 2 (optimizing): 5,000 calls

At what point is each tier triggered? If the function is only called 500 times total, is Tier 2 ever reached?

### Exercise 5: AOT vs JIT Trade-offs

For each scenario, recommend AOT or JIT and explain why:

1. A command-line tool that runs for < 1 second
2. A long-running web server
3. A mobile app with limited battery
4. A scientific simulation running for hours
5. An embedded system with 64 KB RAM

---

## Key Takeaways

- **JIT compilation** combines interpretation flexibility with compiled-code speed
- **Tiered compilation** balances startup time and peak performance
- **Profiling-guided optimization** makes JIT potentially faster than AOT
- **Deoptimization** ensures correctness when speculative assumptions fail
- **Tracing JIT** excels at loop-heavy workloads by recording linear execution paths
- Modern languages (Java, JavaScript, C#, Python via PyPy) all rely heavily on JIT technology

---

**Next Lesson:** [Domain-Specific Languages →](62-cd-dsl.md)
