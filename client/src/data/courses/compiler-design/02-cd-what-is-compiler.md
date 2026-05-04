---
title: What is a Compiler?
---

# What is a Compiler?

A **compiler** is a program that translates source code written in one programming language (the **source language**) into another language (the **target language**). Most commonly, the target is machine code or assembly language that a processor can execute directly.

---

## Formal Definition

$$
\text{Compiler}: \text{Source Language} \rightarrow \text{Target Language}
$$

More precisely, a compiler is a function that maps programs in language $L_s$ to semantically equivalent programs in language $L_t$:

$$
C: P_{L_s} \rightarrow P_{L_t}
$$

where the meaning (semantics) is preserved:

$$
\text{meaning}(P_{L_s}) = \text{meaning}(C(P_{L_s}))
$$

If the source program computes $f(x) = x + 1$, the compiled target program must also compute $f(x) = x + 1$ — just in a different representation.

---

## Compiler vs Interpreter

The two fundamental approaches to executing programs are **compilation** and **interpretation**. Understanding their differences is crucial.

### Compiler

A compiler translates the **entire program** into target code before any execution happens.

```
Source Code → [Compiler] → Target Code → [Execute] → Output
```

**Characteristics:**
- Translation happens once; execution happens many times
- Errors reported before execution (at compile time)
- Generated code runs fast (optimized for target machine)
- Longer development cycle (compile → run → debug)

**Languages using compilation:**
- C, C++ → machine code
- Rust → machine code (via LLVM)
- Go → machine code
- Haskell → machine code (via GHC)

### Interpreter

An interpreter executes the source program **line by line** (or statement by statement), without producing a separate target program.

```
Source Code → [Interpreter + Input] → Output
```

**Characteristics:**
- No separate translation step
- Errors discovered during execution
- Slower execution (re-analyzes code each time)
- Faster development cycle (edit → run immediately)
- Easier to implement (no code generation needed)

**Languages using interpretation:**
- Python (CPython interpreter)
- Ruby (MRI interpreter)
- JavaScript (originally interpreted)
- Bash/Shell scripts

### Comparison Table

| Feature | Compiler | Interpreter |
|---------|----------|-------------|
| Translation | Entire program at once | One statement at a time |
| Execution speed | Fast (native code) | Slower (overhead per statement) |
| Error detection | Before execution | During execution |
| Memory usage | Target program stored | Source re-read/re-analyzed |
| Debugging | Harder (optimized code) | Easier (direct source mapping) |
| Portability | Target-specific binary | Source runs anywhere with interpreter |
| Startup time | Slow (compilation needed) | Fast (immediate execution) |

### Hybrid Approach

Many modern languages use a **hybrid** approach — compile to an intermediate bytecode, then interpret (or JIT-compile) that bytecode.

```
Source Code → [Compiler] → Bytecode → [VM/Interpreter] → Output
```

**Examples of hybrid systems:**

| Language | Bytecode Format | Virtual Machine |
|----------|----------------|-----------------|
| Java | `.class` files | JVM (Java Virtual Machine) |
| Python | `.pyc` files | CPython VM |
| C# | CIL (Common Intermediate Language) | CLR (.NET runtime) |
| Kotlin | `.class` files | JVM |
| Erlang | BEAM bytecode | BEAM VM |

```python
# Python: source → bytecode → interpreted
import dis

def add(a, b):
    return a + b

# Show the bytecode Python compiles to:
dis.dis(add)
# Output:
#   LOAD_FAST    0 (a)
#   LOAD_FAST    1 (b)
#   BINARY_ADD
#   RETURN_VALUE
```

The JVM takes this further with **Just-In-Time (JIT)** compilation — it interprets bytecode initially, then compiles "hot" (frequently executed) code paths to native machine code at runtime.

---

## The Assembler

An **assembler** is a special case of a compiler where the source language is assembly language and the target is machine code.

```
Assembly (human-readable mnemonics) → [Assembler] → Machine Code (binary)
```

```c
// Assembly (x86-64):
mov eax, 5       // Load 5 into register eax
add eax, 3       // Add 3 to eax
ret              // Return

// Machine code (hex):
// B8 05 00 00 00
// 83 C0 03
// C3
```

Assembly has a nearly **one-to-one** correspondence with machine instructions, making assembly straightforward (no complex optimization needed). The assembler mainly:
- Resolves labels to addresses
- Translates mnemonics to opcodes
- Handles pseudo-instructions and directives

---

## The Transpiler (Source-to-Source Compiler)

A **transpiler** (or **transcompiler**) translates from one high-level language to another high-level language.

$$
\text{Transpiler}: L_{\text{high-level}_1} \rightarrow L_{\text{high-level}_2}
$$

**Examples:**

| Source | Target | Tool |
|--------|--------|------|
| TypeScript | JavaScript | `tsc` |
| ES6+ JavaScript | ES5 JavaScript | Babel |
| CoffeeScript | JavaScript | CoffeeScript compiler |
| Sass/SCSS | CSS | Sass compiler |
| C++ | C | Early C++ (Cfront) |

```c
// TypeScript (source)
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// JavaScript (target, after transpilation)
function greet(name) {
    return "Hello, " + name + "!";
}
```

Transpilers are increasingly common in web development, where newer language features must be converted to widely-supported older standards.

---

## Types of Compilers

### Single-Pass vs Multi-Pass

**Single-pass compiler:**
- Reads source code once, generates target code in one sweep
- Fast compilation, but limited optimization
- Language must be designed for single-pass (e.g., Pascal's forward declarations)
- Memory efficient — doesn't store entire program

**Multi-pass compiler:**
- Makes multiple passes over the source (or IR)
- Each pass performs a specific task (lexing, parsing, optimization, code gen)
- Better optimization opportunities
- Most modern compilers are multi-pass

```
Pass 1: Source → Tokens (lexical analysis)
Pass 2: Tokens → AST (syntax analysis)
Pass 3: AST → Annotated AST (semantic analysis)
Pass 4: Annotated AST → IR (intermediate code)
Pass 5: IR → Optimized IR (optimization)
Pass 6: Optimized IR → Target (code generation)
```

### Cross-Compiler

A **cross-compiler** runs on one platform (the **host**) but generates code for a different platform (the **target**).

$$
\text{Cross-compiler runs on } \text{Host} H, \text{ produces code for } \text{Target} T, \text{ where } H \neq T
$$

**Use cases:**
- Embedded systems (compile on PC, run on ARM microcontroller)
- Mobile development (compile on x86 laptop, run on ARM phone)
- OS development (compile new OS on existing OS)

```c
// Compile on x86 Linux for ARM:
// arm-linux-gnueabihf-gcc -o hello hello.c
//
// This runs on your x86 PC but produces an ARM binary
```

### Bootstrap Compiler

A **bootstrap compiler** is a compiler written in the language it compiles. This creates a chicken-and-egg problem solved by **bootstrapping**:

1. Write a minimal compiler for language $L$ in some existing language $X$
2. Use that compiler to compile a better compiler for $L$ written in $L$ itself
3. Repeat: use the new compiler to compile an even better version

**Real examples:**
- GCC is written in C (compiled by an older GCC)
- The Rust compiler (`rustc`) is written in Rust
- The Go compiler is written in Go (originally bootstrapped from C)

### Just-In-Time (JIT) Compiler

A **JIT compiler** compiles code at runtime, just before execution. It combines the portability of interpretation with the speed of compilation.

```
Source → Bytecode → [JIT at runtime] → Native Machine Code → Execute
```

**How JIT works:**
1. Initially interpret bytecode (fast startup)
2. Profile execution (identify "hot" code paths)
3. Compile hot paths to native code (optimize heavily)
4. Execute native code for hot paths (fast execution)
5. Deoptimize if assumptions are violated

**JIT examples:**
- Java HotSpot VM
- V8 (JavaScript in Chrome/Node.js)
- LuaJIT
- .NET RyuJIT

---

## The Compilation Pipeline (Detailed)

A modern compiler is divided into three major parts:

### Front-End (Language-Dependent)

The front-end understands the **source language**. If you're building compilers for C and Java, each needs its own front-end.

```
Source Code
    │
    ├── Lexical Analysis (Scanner)
    │   └── Produces: Token Stream
    │
    ├── Syntax Analysis (Parser)
    │   └── Produces: Parse Tree / AST
    │
    └── Semantic Analysis
        └── Produces: Annotated AST + Symbol Table
```

### Middle-End (Language-Independent)

The middle-end works on an **intermediate representation** (IR) that's independent of both source and target.

```
Annotated AST
    │
    ├── IR Generation
    │   └── Produces: Intermediate Code (three-address, SSA)
    │
    └── Optimization
        └── Produces: Optimized IR
```

### Back-End (Target-Dependent)

The back-end generates code for the **target machine**. If you target x86 and ARM, you need separate back-ends.

```
Optimized IR
    │
    ├── Instruction Selection
    │   └── Choose target instructions
    │
    ├── Register Allocation
    │   └── Map variables to registers
    │
    ├── Instruction Scheduling
    │   └── Order instructions for pipeline
    │
    └── Code Emission
        └── Produces: Assembly / Machine Code
```

### Why This Separation Matters

With $m$ source languages and $n$ target machines:
- **Without IR**: need $m \times n$ compilers
- **With IR**: need $m$ front-ends + $n$ back-ends = $m + n$ components

This is exactly what **LLVM** does — many front-ends (Clang for C/C++, rustc for Rust, Swift compiler) all emit LLVM IR, and LLVM provides back-ends for x86, ARM, RISC-V, etc.

---

## Input and Output

### Input: Source Code

The compiler receives source code as a **string of characters** — a flat sequence with no inherent structure:

```c
int main() { return 0; }
```

To the compiler initially, this is just: `i`, `n`, `t`, ` `, `m`, `a`, `i`, `n`, `(`, `)`, ` `, `{`, ` `, `r`, `e`, `t`, `u`, `r`, `n`, ...

### Output: Target Code

The output depends on the compiler's purpose:

| Target | Format | Example |
|--------|--------|---------|
| Machine code | Binary executable | `.exe`, ELF binary |
| Assembly | Text (human-readable) | `.s`, `.asm` files |
| Bytecode | Binary (for VM) | Java `.class`, Python `.pyc` |
| Another language | Text | TypeScript → JavaScript |
| IR | Text or binary | LLVM `.ll` or `.bc` |

---

## Error Reporting

Compilers must report errors clearly. Different phases catch different kinds of errors:

| Phase | Error Type | Example |
|-------|-----------|---------|
| Lexical | Invalid characters, malformed tokens | `@#$` in C code |
| Syntax | Grammatically incorrect structure | `if (x > 5 { }` (missing `)`) |
| Semantic | Meaningful but illegal programs | Using undeclared variable |
| (None) | Logical errors | Wrong algorithm — compiler can't catch this! |

A good compiler:
- Reports errors with **precise location** (file, line, column)
- Provides **helpful messages** (what went wrong, how to fix it)
- **Recovers** from errors to find more issues in one pass
- Distinguishes **errors** (must fix) from **warnings** (should fix)

```c
// Example: GCC error message
test.c:5:12: error: use of undeclared identifier 'y'
    int x = y + 1;
            ^
```

---

## Example: A Simple C Function Through All Phases

Let's trace this function through the entire compilation pipeline:

```c
int square(int n) {
    return n * n;
}
```

### Phase 1: Lexical Analysis
```
[INT, ID("square"), LPAREN, INT, ID("n"), RPAREN,
 LBRACE, RETURN, ID("n"), STAR, ID("n"), SEMI, RBRACE]
```

### Phase 2: Syntax Analysis (AST)
```
FunctionDecl
├── ReturnType: int
├── Name: "square"
├── Params: [(int, "n")]
└── Body:
    └── ReturnStmt
        └── BinaryExpr (*)
            ├── VarRef("n")
            └── VarRef("n")
```

### Phase 3: Semantic Analysis
- `square` is declared as `int → int`
- Parameter `n` has type `int`
- `n * n` — both operands are `int`, result is `int` ✓
- Return type matches function declaration ✓

### Phase 4: Intermediate Code (Three-Address)
```
t1 = n * n
return t1
```

### Phase 5: Optimization
```
// Already simple — no optimization needed here
// In more complex code: constant folding, dead code elimination, etc.
t1 = n * n
return t1
```

### Phase 6: Code Generation (x86-64 Assembly)
```
square:
    mov eax, edi        ; parameter n is in edi (System V ABI)
    imul eax, edi       ; eax = n * n
    ret                 ; return value in eax
```

---

## Summary

| Concept | Definition |
|---------|-----------|
| Compiler | Translates source language → target language |
| Interpreter | Executes source directly, no separate target |
| Hybrid | Compile to bytecode, then interpret/JIT |
| Assembler | Assembly → machine code |
| Transpiler | High-level → high-level translation |
| Cross-compiler | Compiles for a different target platform |
| Bootstrap | Compiler written in its own language |
| JIT | Compiles at runtime for speed |

---

## Historical Context

The distinction between compiled and interpreted languages has blurred significantly over time:

| Era | Dominant Approach | Example |
|-----|------------------|---------|
| 1950s–1970s | Pure compilation | FORTRAN, C, COBOL |
| 1980s | Compilation with runtime | C++, Ada |
| 1990s | Bytecode + VM | Java, early Python |
| 2000s | JIT everywhere | JavaScript V8, .NET CLR |
| 2010s+ | Multi-tier (AOT + JIT + interpret) | GraalVM, modern JVMs |

Modern systems like GraalVM can even compile Python and JavaScript ahead-of-time to native binaries, further blurring traditional categories.

---

## Self-Check Questions

1. **Is Python compiled or interpreted?**
   Both! CPython compiles source to `.pyc` bytecode, then interprets that bytecode. PyPy adds JIT compilation on top.

2. **Why is compiled code faster than interpreted code?**
   The compiler translates once and optimizes heavily. The interpreter re-analyzes each statement every execution, adding overhead per operation.

3. **What's the advantage of a cross-compiler?**
   You can develop on a powerful desktop machine but target embedded hardware (like an Arduino or phone) that couldn't run a compiler itself.

4. **Why do bootstrapped compilers exist?**
   Writing a compiler in its own language proves the language is powerful enough for systems programming, and allows the compiler to benefit from its own optimizations.

5. **Name three transpilers used in web development.**
   TypeScript → JavaScript (`tsc`), Sass → CSS, Babel (ES6+ → ES5).

---

## Practical Exercise

Try this mental exercise — classify each tool:

| Tool | Type |
|------|------|
| `gcc` compiling C to x86 binary | Compiler |
| `python3 script.py` | Hybrid (compile to bytecode + interpret) |
| `tsc file.ts` | Transpiler (TypeScript → JavaScript) |
| `nasm file.asm` | Assembler |
| `java Program` | Hybrid (bytecode + JIT) |
| `bash script.sh` | Interpreter |
| `arm-none-eabi-gcc` | Cross-compiler |
| `rustc --target wasm32` | Cross-compiler (Rust → WebAssembly) |

---

## Key Takeaways

1. A compiler **preserves meaning** while changing representation
2. The front-end/middle-end/back-end separation enables reuse
3. Modern systems often use **hybrid** approaches (bytecode + JIT)
4. Good error reporting is as important as correct translation
5. The same principles apply whether you're building GCC or a config-file parser

---

## Next Up

In the next lesson, we'll explore the **History of Compilers** — from the first program that could translate other programs (1952) to the LLVM revolution that powers most modern compilers today.
