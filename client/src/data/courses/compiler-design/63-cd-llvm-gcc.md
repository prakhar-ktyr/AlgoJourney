---
title: "Modern Compiler Frameworks: LLVM and GCC"
---

# Modern Compiler Frameworks: LLVM and GCC

Modern compilers are rarely built from scratch. Instead, they leverage **compiler frameworks** — reusable infrastructure for building optimizing compilers. The two dominant frameworks are **GCC** and **LLVM**.

---

## GCC (GNU Compiler Collection)

### History

- **1987:** Richard Stallman releases GCC as part of the GNU project
- Originally "GNU C Compiler," expanded to support multiple languages
- For decades, the dominant open-source compiler
- Still the default compiler on most Linux distributions

### Supported Languages

GCC includes front-ends for:

| Front-End | Language |
|---|---|
| `gcc` | C |
| `g++` | C++ |
| `gfortran` | Fortran |
| `gccgo` | Go |
| `gnat` | Ada |
| `gdc` | D |

### GCC Architecture

```
          ┌────────┐  ┌────────┐  ┌──────────┐
          │ C (gcc)│  │C++ (g++)│ │Fortran   │  ... Front-ends
          └───┬────┘  └───┬────┘  └────┬─────┘
              │           │            │
              ▼           ▼            ▼
         ┌─────────────────────────────────┐
         │     GENERIC (language-generic    │   High-level IR
         │     tree representation)         │
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │     GIMPLE (simplified,          │   Mid-level IR
         │     three-address form)          │   (where most optimizations happen)
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │     RTL (Register Transfer       │   Low-level IR
         │     Language)                    │   (machine-dependent optimizations)
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ x86    │  │ ARM    │  │ RISC-V │    ... Back-ends
         └────────┘  └────────┘  └────────┘
```

### GCC's Three IRs

**1. GENERIC:** A tree representation close to the source language. Each front-end produces GENERIC from source code.

**2. GIMPLE:** A simplified, three-address code form used for most optimizations:

```c
// Source C code
int result = (a + b) * (c - d);

// GIMPLE representation
t1 = a + b;
t2 = c - d;
result = t1 * t2;
```

GIMPLE is where GCC performs:
- Dead code elimination
- Constant propagation
- Loop optimizations
- Inlining
- Alias analysis

**3. RTL (Register Transfer Language):** Low-level representation close to machine instructions, used for:
- Register allocation
- Instruction scheduling
- Peephole optimizations

### Using GCC

```bash
# Compile C to executable
gcc -O2 -o program program.c

# See GIMPLE output
gcc -fdump-tree-gimple program.c

# See RTL output
gcc -fdump-rtl-expand program.c

# See generated assembly
gcc -S -O2 program.c
```

### GCC Optimization Levels

| Flag | Description |
|---|---|
| `-O0` | No optimization (fastest compile, for debugging) |
| `-O1` | Basic optimizations |
| `-O2` | Standard optimizations (recommended for production) |
| `-O3` | Aggressive optimizations (may increase code size) |
| `-Os` | Optimize for size |
| `-Ofast` | `-O3` + fast-math (may break IEEE float compliance) |

---

## LLVM

### History

- **2003:** Chris Lattner starts LLVM at the University of Illinois at Urbana-Champaign (UIUC) as a research project
- **2005:** Apple hires Lattner; LLVM becomes the basis for Apple's toolchain
- **2007:** Clang (C/C++ front-end) development begins
- **Today:** LLVM powers compilers for Rust, Swift, Julia, Kotlin/Native, and many more

> **LLVM** originally stood for "Low Level Virtual Machine" but is now just a name — the project scope far exceeds virtual machines.

### LLVM Architecture

```
          ┌────────┐  ┌────────┐  ┌──────────┐
          │ Clang  │  │ Rust   │  │ Swift    │  ... Front-ends
          │(C/C++) │  │(rustc) │  │(swiftc)  │
          └───┬────┘  └───┬────┘  └────┬─────┘
              │           │            │
              ▼           ▼            ▼
         ┌─────────────────────────────────┐
         │         LLVM IR                  │   Universal IR
         │   (typed, SSA-based,             │
         │    human-readable)               │
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │     Optimization Passes          │   opt tool
         │   (hundreds of passes)           │
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │     Code Generator               │   llc tool
         │   (instruction selection,        │
         │    register allocation,          │
         │    scheduling)                   │
         └──────────────┬──────────────────┘
                        │
                        ▼
         ┌────────┐  ┌────────┐  ┌────────┐
         │ x86-64 │  │ ARM64  │  │ RISC-V │    ... Targets
         └────────┘  └────────┘  └────────┘
```

### LLVM IR: The Heart of LLVM

LLVM IR is a **typed, SSA-based** intermediate representation. It comes in three equivalent forms:

| Form | Extension | Usage |
|---|---|---|
| Human-readable assembly | `.ll` | Reading, debugging |
| Bitcode (binary) | `.bc` | Storage, linking |
| In-memory C++ objects | — | Compiler internals |

### LLVM IR Example

```c
// C source
int add(int a, int b) {
    return a + b;
}

int main() {
    int result = add(3, 4);
    return result;
}
```

```llvm
; LLVM IR output (simplified)
define i32 @add(i32 %a, i32 %b) {
entry:
  %sum = add i32 %a, %b
  ret i32 %sum
}

define i32 @main() {
entry:
  %result = call i32 @add(i32 3, i32 4)
  ret i32 %result
}
```

Key features of LLVM IR:

- **Typed:** Every value has an explicit type (`i32`, `float`, `i8*`, etc.)
- **SSA form:** Each variable is assigned exactly once (`%sum`, `%result`)
- **Explicit control flow:** Basic blocks with terminators (`br`, `ret`, `switch`)
- **Human-readable:** You can write and edit `.ll` files by hand

### Common LLVM IR Types

| Type | Description |
|---|---|
| `i1` | Boolean (1-bit integer) |
| `i8`, `i32`, `i64` | 8, 32, 64-bit integers |
| `float`, `double` | 32, 64-bit floating point |
| `i8*` | Pointer to byte |
| `[10 x i32]` | Array of 10 integers |
| `{ i32, float }` | Struct (aggregate type) |

### LLVM IR Control Flow

```llvm
; if-else in LLVM IR
define i32 @abs(i32 %x) {
entry:
  %cmp = icmp slt i32 %x, 0          ; x < 0 ?
  br i1 %cmp, label %negative, label %positive

negative:
  %neg = sub i32 0, %x                ; -x
  br label %done

positive:
  br label %done

done:
  %result = phi i32 [%neg, %negative], [%x, %positive]
  ret i32 %result
}
```

The `phi` instruction selects a value based on which predecessor block was executed — this is how SSA handles merging control flow.

### Key LLVM Tools

| Tool | Purpose |
|---|---|
| `clang` | C/C++/Objective-C front-end |
| `opt` | LLVM IR optimizer |
| `llc` | LLVM IR → machine code |
| `lli` | LLVM IR interpreter/JIT |
| `llvm-as` | `.ll` (text) → `.bc` (bitcode) |
| `llvm-dis` | `.bc` (bitcode) → `.ll` (text) |
| `llvm-link` | Link multiple `.bc` files |

### Using LLVM Tools

```bash
# C → LLVM IR (human-readable)
clang -S -emit-llvm -O2 program.c -o program.ll

# C → LLVM bitcode
clang -c -emit-llvm program.c -o program.bc

# Optimize LLVM IR
opt -O2 program.bc -o program_opt.bc

# LLVM IR → assembly
llc program_opt.bc -o program.s

# LLVM IR → executable (directly)
clang program.ll -o program

# Interpret LLVM IR
lli program.bc
```

---

## Languages Built on LLVM

LLVM's modular design makes it the foundation for many modern languages: **Rust** (rustc), **Swift** (swiftc), **Julia**, **Kotlin/Native**, **Zig**, **Crystal**, and optionally **Haskell** (GHC).

---

## LLVM Pass Infrastructure

LLVM organizes optimizations as **passes** that transform or analyze the IR.

### Types of Passes

| Pass Type | Purpose | Examples |
|---|---|---|
| **Analysis** | Gather information, don't modify IR | Dominator tree, alias analysis |
| **Transform** | Modify IR to improve it | Dead code elimination, inlining |
| **Utility** | Helper passes | Print IR, verify correctness |

### Standard Optimization Pipeline

```
LLVM IR
  │
  ├── SimplifyCFG         (clean up control flow)
  ├── SROA                (scalar replacement of aggregates)
  ├── EarlyCSE            (common subexpression elimination)
  ├── InstCombine         (algebraic simplification)
  ├── Inline              (function inlining)
  ├── GVN                 (global value numbering)
  ├── LoopRotate          (prepare loops for optimization)
  ├── LICM                (loop-invariant code motion)
  ├── LoopUnroll          (unroll small loops)
  ├── DeadStoreElim       (remove dead stores)
  ├── ADCE                (aggressive dead code elimination)
  └── GlobalDCE           (remove unused functions)
  │
  ▼
Optimized LLVM IR
```

## Writing a Simple LLVM Pass

Here's a conceptual example of an LLVM pass that counts functions:

```c
// FunctionCounter.cpp — An LLVM pass
#include "llvm/IR/Function.h"
#include "llvm/IR/Module.h"
#include "llvm/Pass.h"
#include "llvm/Support/raw_ostream.h"

using namespace llvm;

namespace {
struct FunctionCounter : public ModulePass {
    static char ID;
    FunctionCounter() : ModulePass(ID) {}

    bool runOnModule(Module &M) override {
        int count = 0;
        for (Function &F : M) {
            if (!F.isDeclaration()) {
                errs() << "Function: " << F.getName() << "\n";
                count++;
            }
        }
        errs() << "Total functions: " << count << "\n";
        return false;  // Did not modify the module
    }
};
}  // namespace

char FunctionCounter::ID = 0;
static RegisterPass<FunctionCounter> X(
    "func-count", "Count functions in module"
);
```

> **Note:** Modern LLVM uses the **New Pass Manager** with a different API, but the concept is the same — passes operate on IR units (Module, Function, Loop, etc.).

---

## GCC vs LLVM Comparison

| Feature | GCC | LLVM |
|---|---|---|
| **License** | GPL v3 | Apache 2.0 (permissive) |
| **Age** | 1987 | 2003 |
| **Primary IR** | GIMPLE + RTL | LLVM IR |
| **IR readable?** | Not easily | Yes (.ll format) |
| **Modularity** | Monolithic | Highly modular (libraries) |
| **C/C++ front-end** | Built-in | Clang (separate project) |
| **Platforms** | Broader (embedded, legacy) | Growing rapidly |
| **Optimization quality** | Excellent | Excellent |
| **Build system integration** | Traditional | CMake-based |
| **Reusability** | Difficult | Easy (library-based) |
| **Commercial adoption** | Linux, embedded | Apple, Google, ARM |

### When to Choose GCC

- Targeting older/niche platforms (GCC has more back-ends)
- Need Fortran or Ada support
- Building for Linux kernel (GCC is the primary compiler)

### When to Choose LLVM

- Building a **new language** (LLVM is designed as a reusable library)
- Need a **permissive license** for commercial use
- Want **readable IR** for debugging and research

---

## Other Frameworks

| Framework | Description |
|---|---|
| **MLIR** | Part of LLVM; multi-level IR for domain-specific compilers (ML, HPC) |
| **Cranelift** | Rust-based back-end for fast JIT compilation (used by Wasmtime) |
| **GraalVM** | Polyglot VM from Oracle; Truffle framework for auto-JIT interpreters |

---

## Try It Yourself

### Exercise 1: Generate LLVM IR

Write this C program and generate its LLVM IR:

```c
#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("5! = %d\n", factorial(5));
    return 0;
}
```

```bash
clang -S -emit-llvm -O0 factorial.c -o factorial.ll
cat factorial.ll
```

Compare `factorial.ll` at `-O0` vs `-O2`. What optimizations do you see?

### Exercise 2: Read LLVM IR

Given this LLVM IR, what does the function compute?

```llvm
define i32 @mystery(i32 %n) {
entry:
  %cmp = icmp eq i32 %n, 0
  br i1 %cmp, label %base, label %recurse

base:
  ret i32 0

recurse:
  %n1 = sub i32 %n, 1
  %r = call i32 @mystery(i32 %n1)
  %result = add i32 %r, %n
  ret i32 %result
}
```

### Exercise 3: GCC vs Clang

Compile the same program with both compilers and compare:

```bash
gcc -O2 -S program.c -o program_gcc.s
clang -O2 -S program.c -o program_clang.s
diff program_gcc.s program_clang.s
```

What differences do you observe in the generated assembly?

### Exercise 4: LLVM Optimization

Use `opt` to apply specific optimizations and observe the changes:

```bash
clang -S -emit-llvm -O0 program.c -o program.ll
opt -passes=mem2reg program.ll -S -o program_ssa.ll
opt -passes=instcombine program_ssa.ll -S -o program_opt.ll
```

Compare the three `.ll` files. How does each pass change the IR?

---

## Key Takeaways

- **GCC** is a mature, monolithic compiler supporting many languages and platforms
- **LLVM** is a modular compiler framework designed for reuse and extensibility
- **LLVM IR** is a typed, SSA-based representation that is both human-readable and machine-processable
- Modern languages (Rust, Swift, Julia) choose LLVM for its modular, library-based design
- **Passes** are the unit of optimization in both frameworks
- **MLIR**, **Cranelift**, and **GraalVM** represent the next generation of compiler infrastructure

---

**Next Lesson:** [Building a Mini Compiler →](64-cd-mini-compiler.md)
