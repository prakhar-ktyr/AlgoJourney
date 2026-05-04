---
title: Exception Handling Implementation
---

# Exception Handling Implementation

Exception handling (`try`/`catch`/`throw`) is a familiar language feature, but its implementation in the compiler and runtime is surprisingly complex. Two main strategies exist, with very different performance trade-offs.

---

## Exception Handling Model

```c
try {
    // code that might throw
    risky_operation();
} catch (FileNotFound& e) {
    // handle specific exception
    log(e.what());
} catch (std::exception& e) {
    // handle general exception
    fallback();
} finally {
    // always runs (cleanup)
    close_resources();
}
```

Key operations:
- **throw**: create an exception object, transfer control to a handler
- **try**: mark a region of code as protected
- **catch**: handle a specific exception type
- **finally**: cleanup code that always runs (some languages only)

---

## The Challenge

When an exception is thrown, the runtime must:

1. Find the nearest matching `catch` handler (possibly many frames up the call stack)
2. **Unwind** intermediate stack frames (destroy local variables, run destructors)
3. Transfer control to the handler

```
Call stack when exception thrown:

main() → process() → parse() → readFile() ← THROW here
                      ↑
                    catch block here

Must unwind: readFile → parse → [catch in process]
```

---

## Strategy 1: Setjmp/Longjmp

### Concept

Use C's `setjmp()`/`longjmp()` to save and restore execution state:

```c
#include <setjmp.h>

jmp_buf handler;

void might_throw() {
    if (error_occurred) {
        longjmp(handler, 1);  // jump back to setjmp point
    }
}

void try_block() {
    if (setjmp(handler) == 0) {
        // normal path: try block
        might_throw();
    } else {
        // exception path: catch block
        printf("Caught an exception!\n");
    }
}
```

### How It Works

```
setjmp(buf):
  - Saves registers, stack pointer, program counter into buf
  - Returns 0 (normal entry)

longjmp(buf, val):
  - Restores saved state from buf
  - setjmp returns val (as if it returned again)
  - Execution continues after setjmp
```

### Implementation in a Compiler

The compiler transforms try/catch into setjmp/longjmp:

```c
// Source:
try {
    foo();
} catch (ExType& e) {
    handle(e);
}

// Compiled (conceptual):
jmp_buf __handler;
ExceptionInfo *__exception;

push_handler(&__handler);         // register handler on stack
if (setjmp(__handler) == 0) {
    foo();                        // try block
    pop_handler();                // normal exit: remove handler
} else {
    pop_handler();
    __exception = get_current_exception();
    if (is_type(__exception, ExType)) {
        handle(__exception);      // catch block
    } else {
        rethrow(__exception);     // not our type, propagate
    }
}
```

### Handler Chain

Multiple try blocks form a linked list (stack) of handlers:

```
Handler chain:
main:try → process:try → parse:try  ← current handler
     ↑          ↑            ↑
   jmp_buf    jmp_buf      jmp_buf

On throw: longjmp to top of chain → check type → if no match, pop and try next
```

### Performance Characteristics

| Path | Cost |
|------|------|
| Enter try block | **Expensive**: setjmp saves ~20 registers |
| Normal exit (no throw) | Cheap: pop handler |
| Throw | Moderate: longjmp restores state |

**Problem:** The try-entry cost is paid even when no exception occurs. Since most try blocks complete normally, this is wasteful.

---

## Strategy 2: Table-Driven (Zero-Cost Exceptions)

### Concept

Instead of saving state at runtime, embed **static tables** in the executable that map program counter (PC) ranges to exception handlers:

```
Exception Table:
+------------------+------------------+------------------+
| PC range start   | PC range end     | Handler address  |
+------------------+------------------+------------------+
| 0x401000         | 0x401050         | 0x401200         |
| 0x401060         | 0x4010A0         | 0x401300         |
+------------------+------------------+------------------+
```

### How It Works — Normal Path

Nothing happens at try block entry! No registers saved, no handler pushed. The try block is "free":

```c
try {
    // NO RUNTIME OVERHEAD HERE
    // Just execute code normally
    foo();
    bar();
}
```

The only evidence that exception handling exists is the table stored in a read-only section of the binary.

### How It Works — Throw Path

```
1. Exception is thrown
2. Runtime captures current PC (program counter)
3. Look up PC in exception tables
4. If handler found for this frame: jump to it
5. If not: unwind one frame, repeat from step 2
```

Detailed unwinding procedure:

```
Algorithm handle_exception(exception):
    while true:
        pc = current_program_counter()
        frame_info = lookup_unwind_table(pc)
        
        if frame_info has matching handler:
            // Found it! Clean up and jump
            run_cleanup_for_frame(frame_info)
            jump_to_handler(frame_info.handler_address)
        else:
            // No handler in this frame, unwind
            run_cleanup_for_frame(frame_info)  // destructors!
            restore_caller_frame(frame_info)   // pop this frame
            // continue loop in caller's frame
    
    // If no handler found anywhere: terminate
    std::terminate()
```

### The Unwind Tables

Stored in special ELF sections:

| Section | Content |
|---------|---------|
| `.eh_frame` | Frame description entries (how to unwind each frame) |
| `.eh_frame_hdr` | Index for fast lookup |
| `.gcc_except_table` | Language-specific data (catch type info) |

Each entry describes:
- How to restore the previous frame (saved registers, stack adjustments)
- What cleanup actions to run (destructors)
- What exception types this frame handles

### Performance Characteristics

| Path | Cost |
|------|------|
| Enter try block | **Zero** — nothing happens |
| Normal exit (no throw) | **Zero** — nothing to undo |
| Throw | **Expensive**: table lookups, stack walking |

This is why it's called "**zero-cost exceptions**" — no cost when exceptions don't occur. The trade-off: throwing is much more expensive.

---

## Comparison of Strategies

| Aspect | Setjmp/Longjmp | Table-Driven |
|--------|---------------|--------------|
| Try block entry cost | High (setjmp) | Zero |
| Normal exit cost | Low (pop) | Zero |
| Throw cost | Moderate | High (table lookup + unwind) |
| Code size | Smaller | Larger (tables) |
| Best for | Exceptions thrown frequently | Exceptions are rare |
| Used by | Older compilers, some C code | Modern C++ (GCC, Clang, MSVC) |

> **Key insight**: In practice, exceptions should be exceptional. The table-driven approach optimizes for the common case (no exception) at the cost of the rare case (exception thrown).

---

## Stack Unwinding

When an exception propagates through frames, **stack unwinding** ensures proper cleanup:

```c
void outer() {
    try {
        middle();
    } catch (std::exception& e) {
        // handler here
    }
}

void middle() {
    std::string s = "hello";    // has destructor
    std::vector<int> v = {1,2}; // has destructor
    inner();                     // throws!
    // s and v must be destroyed during unwinding
}

void inner() {
    throw std::runtime_error("oops");
}
```

Unwinding `middle()`:

```
1. inner() throws
2. No handler in inner() → unwind inner
3. No handler in middle() → must unwind middle:
   - Destroy v (call vector destructor)
   - Destroy s (call string destructor)
   - Restore middle's caller frame
4. Handler found in outer() → jump to catch block
```

---

## Destructors and RAII

C++ relies heavily on destructors running during unwinding (**RAII** — Resource Acquisition Is Initialization):

```c
void process_file(const char* path) {
    std::ifstream file(path);     // opens file
    std::lock_guard<std::mutex> lock(mtx);  // acquires lock
    
    // If any of this throws:
    do_stuff(file);
    do_more_stuff();
    
    // file and lock are automatically cleaned up during unwinding
    // - file's destructor closes the file
    // - lock_guard's destructor releases the mutex
}
```

The compiler must ensure destructors run for all objects constructed before the throw point, in reverse order of construction.

---

## Exception Tables in Object Files

Let's look at what the compiler actually generates:

```c
void example() {
    try {
        std::string s = "hello";
        might_throw();
    } catch (std::exception& e) {
        handle(e);
    }
}
```

The compiler emits:

```
.text:
  example:
    0x00: [allocate frame]
    0x10: [construct string s]       ← landing pad needed (destroy s)
    0x20: [call might_throw]         ← may throw
    0x30: [destroy s, normal path]
    0x40: [return]
    
    ; Landing pad (generated by compiler)
    0x50: [exception entry point]
    0x58: [destroy s]                ← cleanup
    0x60: [check exception type]
    0x68: [if match: jump to handler]
    0x70: [handler: call handle(e)]
    0x78: [if no match: resume unwinding]

.gcc_except_table:
    ; For PC range 0x10-0x30:
    ;   Landing pad: 0x50
    ;   Action: catch std::exception
```

---

## How Different Languages Implement Exceptions

### C++ (Table-driven)

```c
// Zero-cost: no overhead in try block
try { foo(); }
catch (const std::exception& e) { /* */ }
```

Uses `.eh_frame` + LSDA (Language-Specific Data Area).

### Java (Table-driven + bytecode)

```java
// Exception table in .class file
try { foo(); }
catch (IOException e) { /* */ }
```

JVM bytecode has an exception table mapping PC ranges to handler PCs. JIT compiler may use native table-driven approach.

### Python (Setjmp-like internally)

```python
try:
    foo()
except ValueError as e:
    handle(e)
```

CPython uses a frame-based approach. Each frame has a block stack tracking try blocks. Relatively expensive try entry but simple implementation.

### Go (Defer/Panic/Recover)

Go uses `defer` for cleanup and `panic`/`recover` instead of try/catch. Deferred functions run during stack unwinding.

### Rust (No exceptions — Result type)

Rust avoids exceptions entirely — errors are values returned via `Result<T, E>`. The `?` operator propagates errors with zero overhead (just a branch). `panic!` exists but is not for routine errors.

---

## Performance Implications

```
Operation                    | Table-driven | Setjmp/Longjmp
-----------------------------|-------------|----------------
Enter try (no exception)     | 0 ns        | ~50 ns
Leave try (no exception)     | 0 ns        | ~5 ns
Throw + catch (1 frame)      | ~5000 ns    | ~500 ns
Throw + catch (10 frames)    | ~15000 ns   | ~1000 ns
```

**Rule of thumb:** Use exceptions for truly exceptional conditions (file not found, out of memory), not for control flow.

The `noexcept` specifier (C++) tells the compiler a function won't throw, enabling more aggressive optimization:

---

## Exercises

1. **Setjmp/longjmp**: Trace the execution of this code. What output is produced?
   ```c
   jmp_buf buf;
   void inner() { longjmp(buf, 42); }
   void middle() { printf("A"); inner(); printf("B"); }
   void outer() {
       int val = setjmp(buf);
       if (val == 0) { printf("C"); middle(); printf("D"); }
       else { printf("E:%d", val); }
   }
   ```

2. **Table lookup**: Given this exception table, determine which handler catches an exception thrown at PC = 0x4020:
   ```
   PC Start | PC End | Handler  | Type
   0x4000   | 0x4010 | 0x4100   | IOException
   0x4010   | 0x4030 | 0x4150   | RuntimeException  ← match!
   0x4030   | 0x4050 | 0x4200   | Exception
   ```

3. **Stack unwinding**: For the code below, list the destructors that run (in order) when `inner()` throws:
   ```c
   void outer() {
       A a;
       try {
           B b;
           middle();
       } catch (...) { }
   }
   void middle() {
       C c;
       D d;
       inner();
   }
   ```

4. **Zero-cost analysis**: A function has 3 nested try blocks. Compare the runtime overhead at entry in:
   (a) Setjmp/longjmp approach
   (b) Table-driven approach

5. **Design trade-off**: You're building a compiler for an embedded system with 64KB of flash memory. Would you choose table-driven or setjmp/longjmp for exception handling? Justify your answer.

6. **Noexcept optimization**: Explain why marking a function `noexcept` can enable the compiler to generate faster code for its callers.

---

## Summary

| Concept | Key takeaway |
|---------|-------------|
| Setjmp/longjmp | Save state on try entry; fast throw, slow try |
| Table-driven | Zero cost on normal path; expensive throw |
| Stack unwinding | Run destructors frame-by-frame up the stack |
| RAII | Destructors ensure cleanup during exceptions |
| Exception tables | Static data mapping PC ranges to handlers |
| Modern choice | Table-driven dominates (exceptions should be rare) |

Understanding exception implementation helps you make informed decisions about error handling strategies and performance-sensitive code.
