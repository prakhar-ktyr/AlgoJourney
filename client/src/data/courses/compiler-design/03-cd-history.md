---
title: History of Compilers
---

# History of Compilers

The history of compilers is the story of how we freed programmers from writing raw machine code. From hand-coded binary instructions to AI-guided optimization, compiler technology has been one of the most impactful developments in computing.

---

## The Era Before Compilers (1940s–1950s)

### Programming in Machine Code

The earliest computers were programmed directly in **machine code** — binary sequences that the hardware could execute. Every instruction, every memory address was specified numerically.

```c
// Early machine code (conceptual):
// 0001 0010 0011 0100  — "add register 2 to register 3, store in 4"
// 
// Programmers worked with numeric op-codes and addresses.
// A simple loop might take hours to code and debug.
```

**Problems with machine code:**
- Extremely tedious and error-prone
- Architecture-specific (rewrite everything for new hardware)
- Nearly impossible to maintain or modify
- No abstraction — you think in terms of registers and addresses

### Assembly Language (Late 1940s)

The first improvement was **assembly language** — human-readable mnemonics for machine instructions:

```c
// Instead of: 0001 0010 0011 0100
// Write:      ADD R2, R3, R4

// Instead of raw addresses:
// Write:      LOAD total
//             ADD count
//             STORE total
```

Assemblers (programs that translate assembly to machine code) appeared in the late 1940s. Maurice Wilkes and his team at Cambridge built one of the first in 1949.

But assembly was still **one instruction at a time** — not much higher than machine code conceptually.

---

## The Birth of Compilers (1950s)

### Grace Hopper's A-0 System (1952)

**Grace Hopper** created what is considered the first compiler — the A-0 system for the UNIVAC I computer. It translated mathematical notation into machine code.

> "Nobody believed that I had a running compiler and nobody would touch it. They told me computers could only do arithmetic."
> — Grace Hopper

The A-0 system was more of a **loader/linker** by modern standards — it assembled previously-compiled subroutines. But it established the revolutionary idea that **a program could translate other programs**.

Hopper later developed **FLOW-MATIC** (1958), the first English-like programming language, which influenced COBOL.

### The FORTRAN Compiler (1957) — The Breakthrough

The **FORTRAN** (FORmula TRANslation) compiler, created by **John Backus** and his team at IBM, was the first true optimizing compiler for a high-level language.

**Key facts:**
- Development: 1954–1957 (approximately 18 person-years of effort)
- Target: IBM 704 computer
- Team: about 10 people
- Lines of code: ~25,000 assembly instructions for the compiler itself

**Why FORTRAN was revolutionary:**

Before FORTRAN, the common belief was that **no automatic translator could produce code as efficient as a human assembly programmer**. Backus set out to prove this wrong.

```c
// FORTRAN code (high-level, mathematical):
      DIMENSION A(100)
      DO 10 I = 1, 100
        A(I) = A(I) + 1.0
   10 CONTINUE
```

The FORTRAN compiler generated code that was **within 10-20% of hand-written assembly** — close enough that the massive productivity gain justified the small performance cost.

**Impact:**
- Proved that high-level languages were practical
- Programmer productivity increased by $5\times$ to $10\times$
- Launched the era of high-level programming
- FORTRAN is still used today in scientific computing (FORTRAN 2018 is the latest standard)

### COBOL and Portability (1959–1960)

**COBOL** (Common Business-Oriented Language) was designed to be portable across machines. Its compiler was designed so that the same COBOL source could run on different computers — a radical idea when every machine had different architecture.

$$
\text{Portability} = \text{Same source} + \text{Different compilers} \rightarrow \text{Different targets}
$$

---

## Formal Language Theory (1960s)

The 1960s brought **mathematical rigor** to compiler construction. This transformed compiler writing from an art to a science.

### Noam Chomsky's Hierarchy (1956–1959)

Chomsky's classification of formal languages directly mapped to compiler phases:

| Grammar Type | Language Class | Recognizer | Compiler Use |
|---|---|---|---|
| Type 3 (Regular) | Regular languages | Finite automaton | Lexical analysis |
| Type 2 (Context-free) | Context-free languages | Pushdown automaton | Syntax analysis |
| Type 1 (Context-sensitive) | Context-sensitive | Linear-bounded automaton | Semantic analysis |
| Type 0 (Unrestricted) | Recursively enumerable | Turing machine | — |

### BNF Notation (1959–1960)

**Backus-Naur Form** (BNF), developed by John Backus and Peter Naur for defining ALGOL 60, gave a precise way to specify programming language syntax:

```
<expression> ::= <term> | <expression> "+" <term>
<term>       ::= <factor> | <term> "*" <factor>
<factor>     ::= <number> | "(" <expression> ")"
```

BNF made grammars **machine-processable** — you could automatically generate parsers from grammar specifications.

### Key Algorithms of the 1960s

- **CYK algorithm** (Cocke-Younger-Kasami, 1965–1967): general CFG parsing in $O(n^3)$
- **Earley's algorithm** (1968): general CFG parsing, efficient for unambiguous grammars
- **Knuth's LR parsing** (1965): the theoretical foundation for efficient bottom-up parsing

$$
\text{LR}(k) = \text{Left-to-right scan, Rightmost derivation, } k \text{ tokens lookahead}
$$

---

## Parser Generators and Systematic Construction (1970s)

The 1970s made compiler construction **systematic** — instead of hand-crafting each compiler, tools could generate parts automatically.

### Lex (1975) — Lexer Generator

**Lex**, created by Mike Lesk and Eric Schmidt at Bell Labs, generates lexical analyzers from regular expression specifications:

```c
// Lex specification (simplified):
%%
[0-9]+      { return NUMBER; }
[a-zA-Z_]+  { return IDENTIFIER; }
"+"         { return PLUS; }
"*"         { return TIMES; }
[ \t\n]     { /* skip whitespace */ }
%%
```

Input: regex patterns → Output: C code implementing a DFA-based scanner.

### Yacc (1975–1978) — Parser Generator

**Yacc** (Yet Another Compiler-Compiler), created by Stephen C. Johnson at Bell Labs, generates LALR(1) parsers from grammar specifications:

```c
// Yacc specification (simplified):
%%
expr : expr '+' term   { $$ = $1 + $3; }
     | term
     ;
term : term '*' factor { $$ = $1 * $3; }
     | factor
     ;
%%
```

Together, Lex + Yacc became the standard toolkit for compiler construction. Their successors (Flex + Bison) are still widely used today.

### The Unix Connection

Lex and Yacc were developed at **Bell Labs** as part of the Unix ecosystem. The C language itself was designed to be easy to compile (single-pass, minimal lookahead), and its compiler was a showcase for these tools.

### Other 1970s Milestones

- **PASCAL compiler** (Wirth, 1970): demonstrated clean single-pass compilation
- **C compiler** (Ritchie, 1972): portable compiler that bootstrapped Unix
- **ML type inference** (Milner, 1978): automatic type deduction without annotations

---

## Optimization Revolution (1980s)

The 1980s brought sophisticated program analysis and optimization techniques.

### Static Single Assignment (SSA) Form

**SSA form** (proposed by Cytron et al., 1989; built on work from the mid-1980s) revolutionized optimization. In SSA, every variable is assigned exactly once:

```c
// Normal code:
x = 1;
x = x + 2;
y = x * 3;

// SSA form:
x1 = 1;
x2 = x1 + 2;
y1 = x2 * 3;
```

SSA makes optimization analyses much simpler because you can track exactly which definition reaches each use. Today, **every major compiler** uses SSA internally.

### Data-Flow Analysis

Systematic frameworks for analyzing how data flows through programs:

- **Reaching definitions**: which assignments can reach a given point?
- **Live variables**: which variables might be used later?
- **Available expressions**: which expressions have already been computed?

These analyses enable optimizations like:
- Dead code elimination (remove code whose results are never used)
- Common subexpression elimination (compute once, reuse result)
- Constant propagation (replace variables with known values)

### The Dragon Book (1986)

**"Compilers: Principles, Techniques, and Tools"** by Alfred Aho, Ravi Sethi, and Jeffrey Ullman became the definitive textbook. Known as the "Dragon Book" (for its cover illustration), it systematized compiler construction knowledge.

$$
\text{Dragon Book} = \text{Theory} + \text{Algorithms} + \text{Practice}
$$

The second edition (2006, with Monica Lam) remains the standard reference.

### MIPS and RISC (1980s)

The **RISC** (Reduced Instruction Set Computer) movement, led by Patterson (Berkeley) and Hennessy (Stanford), created architectures designed to be **compiler-friendly**:
- Fixed-width instructions (easier code generation)
- Many registers (simpler register allocation)
- Simple addressing modes (faster instruction selection)

The philosophy: let the compiler do the hard work of optimization, keep the hardware simple.

---

## JIT and Virtual Machines (1990s–2000s)

### Java and the JVM (1995)

Java's **"write once, run anywhere"** philosophy introduced mainstream JIT compilation:

```
Java Source → javac → Bytecode (.class) → JVM → Native Code (at runtime)
```

The **HotSpot JVM** (1999) pioneered adaptive JIT compilation:
1. Start interpreting bytecode (fast startup)
2. Profile which methods are "hot" (frequently called)
3. JIT-compile hot methods with heavy optimization
4. Deoptimize if assumptions are violated

This approach achieved **near-native performance** while retaining portability.

### Other 1990s–2000s Developments

- **GCC maturation**: became the dominant open-source compiler
- **Intel's ICC**: aggressive optimization for x86
- **Microsoft's CL**: Visual C++ compiler with link-time optimization
- **V8 JavaScript engine** (2008): brought JIT to the web

---

## The LLVM Revolution (2000s–Present)

### Chris Lattner and LLVM (2000–)

**LLVM** (originally "Low Level Virtual Machine," now just "LLVM") began as Chris Lattner's master's thesis at the University of Illinois (2000–2003). It became the most important compiler infrastructure project of the 21st century.

**Key innovation:** A well-defined, language-independent intermediate representation (LLVM IR) with a modular pass-based architecture.

```c
// LLVM IR for "return a + b":
define i32 @add(i32 %a, i32 %b) {
entry:
    %sum = add i32 %a, %b
    ret i32 %sum
}
```

### Why LLVM Changed Everything

| Aspect | Before LLVM | With LLVM |
|--------|-------------|-----------|
| New language compiler | Build entire pipeline from scratch | Write a front-end, reuse LLVM's optimizer + code gen |
| New target | Modify entire compiler | Add an LLVM back-end |
| Optimization research | Hack into monolithic compiler | Write a self-contained pass |
| Code quality | Varies by compiler | Shared world-class optimizations |

### Languages Built on LLVM

- **Clang** (C/C++/Objective-C) — replaced GCC on macOS
- **Rust** (`rustc`) — safety-focused systems language
- **Swift** — Apple's modern language
- **Julia** — scientific computing
- **Zig** — systems programming
- **Crystal** — Ruby-like compiled language

### LLVM's Impact on Industry

Apple adopted LLVM/Clang as the default compiler for all Apple platforms. This drove LLVM's maturation and funding. Today, LLVM is used by:
- Apple (Clang, Swift)
- Google (Android NDK, various internal tools)
- Sony (PlayStation SDK)
- NVIDIA (CUDA compilation)
- AMD (ROCm GPU compilation)
- ARM (embedded toolchains)

---

## GCC Evolution

The **GNU Compiler Collection** (GCC) has been the backbone of open-source compilation since 1987:

| Year | Milestone |
|------|-----------|
| 1987 | GCC 1.0 released by Richard Stallman |
| 1992 | GCC 2.0 — C++ support |
| 1997 | EGCS fork (merged back in 1999) |
| 2001 | GCC 3.0 — new optimizer framework |
| 2005 | GCC 4.0 — Tree SSA, major rewrite |
| 2012 | GCC 4.7 — C++11 support |
| 2017 | GCC 7 — C++17 support |
| 2024 | GCC 14 — continued C++23/26 support |

GCC and LLVM/Clang are the two dominant open-source compiler ecosystems today, driving each other to improve through competition.

---

## Modern Trends (2010s–Present)

### Machine Learning in Compilation

ML-guided optimization uses neural networks to make compilation decisions:
- **MLGO** (Google, 2020): ML for inlining decisions in LLVM
- **CompilerGym** (Facebook, 2021): RL environment for optimization
- Phase ordering, register allocation, vectorization decisions

### Verified Compilers

**CompCert** (Xavier Leroy, 2006–present): a C compiler formally verified in Coq. It's mathematically proven that the compiled code preserves the source program's semantics.

$$
\forall P.\; \text{CompCert}(P) \text{ terminates} \implies \text{behavior}(\text{CompCert}(P)) = \text{behavior}(P)
$$

This matters for safety-critical systems (avionics, medical devices, nuclear plants).

### Other Modern Developments

- **Polyhedral compilation**: mathematical framework for loop optimization (Polly in LLVM)
- **Domain-specific compilers**: TensorFlow XLA, Halide for image processing
- **WebAssembly** (2017): portable compilation target for the web
- **MLIR** (2019): Multi-Level IR, a framework for building custom IRs (part of LLVM)
- **Cranelift**: new compiler backend for WebAssembly and Rust debug builds

---

## Key People in Compiler History

| Person | Contribution | Era |
|--------|-------------|-----|
| Grace Hopper | First compiler concept (A-0) | 1952 |
| John Backus | FORTRAN compiler, BNF | 1957 |
| Noam Chomsky | Formal language hierarchy | 1956 |
| Peter Naur | BNF, ALGOL 60 | 1960 |
| Donald Knuth | LR parsing, analysis of algorithms | 1965 |
| Stephen Johnson | Yacc parser generator | 1975 |
| Alfred Aho | Dragon Book, string algorithms | 1986 |
| Jeffrey Ullman | Dragon Book, automata theory | 1986 |
| Chris Lattner | LLVM, Clang, Swift, MLIR | 2000s |
| Xavier Leroy | CompCert (verified compiler) | 2006 |

---

## Timeline Summary

```
1952  Grace Hopper's A-0 system
1957  FORTRAN — first optimizing compiler
1959  BNF notation, COBOL portability
1965  Knuth's LR parsing theory
1970  Pascal single-pass compiler
1975  Lex (lexer generator)
1978  Yacc (parser generator)
1986  Dragon Book published
1989  SSA form proposed
1995  Java JVM — mainstream JIT
1999  HotSpot adaptive JIT
2003  LLVM initial release
2007  Clang first release
2008  V8 JavaScript JIT engine
2010  Rust compiler (uses LLVM)
2014  Swift compiler (uses LLVM)
2017  WebAssembly standard
2019  MLIR framework
2020  ML-guided compilation (MLGO)
```

---

## Lessons from History

1. **Every "impossible" barrier fell** — high-level languages, optimization, portability
2. **Theory and practice reinforce each other** — formal grammars enabled parser generators
3. **Modularity wins** — LLVM's success came from clean separation of concerns
4. **Competition drives progress** — GCC vs LLVM made both better
5. **Compilers compound** — bootstrap compilers improve themselves generation after generation

---

## The Economics of Compiler Development

Building a production compiler is a massive undertaking:

| Compiler | Estimated Effort | Team Size | Years |
|----------|-----------------|-----------|-------|
| FORTRAN (1957) | 18 person-years | ~10 | 3 |
| GCC (ongoing) | Thousands of person-years | 100s of contributors | 37+ |
| LLVM (ongoing) | Thousands of person-years | 100s of contributors | 20+ |
| Rust compiler | Hundreds of person-years | 100s of contributors | 10+ |
| V8 JavaScript | Hundreds of person-years | ~50 full-time (Google) | 16+ |

The complexity comes from:
- Supporting entire language standards (C++ standard is 1800+ pages)
- Targeting multiple architectures
- Optimizing for diverse workloads
- Maintaining backward compatibility
- Rigorous testing (compiler bugs can affect millions of programs)

---

## How This History Connects to Our Course

Each historical development maps to a section of this course:

| Historical Development | Course Section |
|---|---|
| Assembly language & pattern matching | Section 2: Lexical Analysis |
| BNF notation & formal grammars | Section 3: Syntax Analysis |
| Type systems & program verification | Section 4: Semantic Analysis |
| IR design & three-address code | Section 5: Intermediate Code |
| SSA form & data-flow analysis | Section 6: Optimization |
| RISC architectures & register allocation | Section 7: Code Generation |
| JVM & garbage collection | Section 8: Runtime Systems |
| LLVM & JIT | Section 9: Advanced Topics |

---

## Influential Papers

For those who want to go deeper, these papers shaped the field:

| Year | Paper | Impact |
|------|-------|--------|
| 1956 | Chomsky, "Three models for description of language" | Formal language hierarchy |
| 1965 | Knuth, "On the translation of languages from left to right" | LR parsing theory |
| 1970 | Earley, "An efficient context-free parsing algorithm" | General CFG parsing |
| 1986 | Cytron et al., "An efficient method of computing SSA form" | SSA for optimization |
| 1997 | Poletto & Sarkar, "Linear scan register allocation" | Fast register allocation |
| 2004 | Lattner & Adve, "LLVM: A compilation framework..." | Modular compiler infra |
| 2006 | Leroy, "Formal certification of a compiler back-end" | CompCert verified compiler |

---

## Self-Check Questions

1. **Why was the FORTRAN compiler considered a breakthrough?**
   It proved that an automatic compiler could generate code nearly as efficient as hand-written assembly, while dramatically improving programmer productivity.

2. **What's the significance of Lex and Yacc?**
   They made compiler construction systematic — instead of hand-crafting each compiler component, you specify patterns/grammars and tools generate the code.

3. **Why is LLVM's modular design important?**
   It allows $m$ front-ends and $n$ back-ends to share optimization infrastructure, reducing the total work from $m \times n$ to $m + n$.

4. **What is a bootstrap compiler and why does it matter?**
   A compiler written in its own language. It matters because it proves the language is self-hosting and allows the compiler to benefit from its own optimizations.

5. **How did RISC architectures change compiler design?**
   RISC moved complexity from hardware to software — simpler instructions meant compilers needed better optimization (instruction scheduling, register allocation) to generate fast code.

---

## Summary

The evolution of compilers mirrors the evolution of computing itself:

$$
\text{Machine Code} \rightarrow \text{Assembly} \rightarrow \text{High-Level Languages} \rightarrow \text{VMs + JIT} \rightarrow \text{ML-Guided + Verified}
$$

From Grace Hopper convincing skeptics that programs could write programs, to LLVM enabling an explosion of new languages, compiler technology continues to be a fundamental driver of computing progress.

---

## Next Up

Now that you know where compilers came from, let's dive into **how they're structured**. The next lesson covers the **six phases of compilation** in detail.
