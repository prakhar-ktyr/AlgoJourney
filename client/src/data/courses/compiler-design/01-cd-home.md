---
title: Compiler Design
---

# Compiler Design

Welcome to the **Compiler Design** course! This comprehensive journey will take you from understanding what a compiler does to building one conceptually from scratch. Whether you're a computer science student, a working developer, or someone preparing for interviews, this course will deepen your understanding of how programming languages actually work under the hood.

---

## What You'll Learn

By the end of this course, you will understand how to **build a compiler from scratch** — conceptually and practically. You'll learn:

- How source code transforms into executable machine code
- The mathematics behind parsing and language recognition
- How to write a lexer (scanner) that breaks code into tokens
- How to build a parser that creates syntax trees
- How type checking and semantic analysis work
- How compilers optimize code to run faster
- How target code is generated for real machines
- How runtime systems manage memory and execution

---

## Why Study Compiler Design?

### 1. Understand How Languages Work

Every time you write `x = a + b`, a complex pipeline transforms that text into machine instructions. Understanding this pipeline makes you a **better programmer** in any language.

### 2. Optimization Knowledge

Compilers perform dozens of optimizations. Knowing what the compiler can (and cannot) do helps you write code that's both readable and efficient.

### 3. Domain-Specific Languages (DSLs)

Modern software often uses DSLs — configuration languages, query languages, template engines. Compiler techniques let you build these tools.

### 4. Interview Preparation

Top tech companies ask about:
- Parsing algorithms and grammars
- Abstract syntax trees
- Type systems
- Code optimization techniques

### 5. Career Opportunities

Compiler engineers are among the highest-paid specialists in software engineering. Companies like Google, Apple, Meta, and NVIDIA actively hire compiler developers.

---

## Prerequisites

Before starting this course, you should be comfortable with:

| Prerequisite | Why It's Needed |
|---|---|
| Basic programming (C or Python) | We use code examples throughout |
| Data structures (trees, stacks, graphs) | ASTs, parse trees, symbol tables |
| Some automata theory (helpful, not required) | Finite automata power the lexer |
| Basic discrete math | Sets, relations, formal proofs |

Don't worry if your automata theory is rusty — we'll review the key concepts as we go!

---

## Course Roadmap

This course is organized into **9 sections** covering the complete compiler pipeline:

### Section 1: Introduction & Overview (Lessons 1–5)
What compilers are, their history, structure, and the tools used to build them. Sets the foundation for everything that follows.

### Section 2: Lexical Analysis — Scanning (Lessons 6–14)
How raw source code (a stream of characters) is broken into meaningful tokens. Covers regular expressions, finite automata (DFA/NFA), and lexer generators.

### Section 3: Syntax Analysis — Parsing (Lessons 15–28)
How token streams are organized into tree structures according to grammar rules. Covers context-free grammars, top-down parsing (LL), bottom-up parsing (LR, LALR), and parser generators.

### Section 4: Semantic Analysis (Lessons 29–35)
How meaning is assigned to syntactic structures. Type checking, scope resolution, symbol tables, and attribute grammars.

### Section 5: Intermediate Code Generation (Lessons 36–41)
How the annotated AST is translated into a platform-independent intermediate representation (three-address code, SSA form).

### Section 6: Code Optimization (Lessons 42–50)
How intermediate code is transformed to run faster or use less memory. Local and global optimizations, loop transformations, data-flow analysis.

### Section 7: Code Generation (Lessons 51–56)
How optimized IR becomes real machine code. Instruction selection, register allocation, instruction scheduling.

### Section 8: Runtime Systems (Lessons 57–61)
How compiled programs execute. Memory management, stack frames, garbage collection, dynamic linking.

### Section 9: Advanced Topics & Project (Lessons 62–65)
JIT compilation, LLVM infrastructure, verified compilers, and a capstone project tying everything together.

---

## The Compiler Pipeline

Here's how source code transforms into executable code, step by step:

```
Source Code (text)
       │
       ▼
┌─────────────┐
│  Lexer      │  Characters → Tokens
└─────────────┘
       │
       ▼
┌─────────────┐
│  Parser     │  Tokens → Parse Tree / AST
└─────────────┘
       │
       ▼
┌─────────────┐
│  Semantic   │  AST → Annotated AST (types, scopes)
│  Analyzer   │
└─────────────┘
       │
       ▼
┌─────────────┐
│  IR Gen     │  Annotated AST → Intermediate Representation
└─────────────┘
       │
       ▼
┌─────────────┐
│  Optimizer  │  IR → Optimized IR
└─────────────┘
       │
       ▼
┌─────────────┐
│  Code Gen   │  Optimized IR → Target Code
└─────────────┘
       │
       ▼
Target Code (assembly / machine code / bytecode)
```

Each phase reads from the previous phase's output and produces input for the next. Errors can be detected and reported at every stage.

---

## What Makes This Course Special

### Theory Meets Practice

Every theoretical concept is paired with a practical example. When we discuss regular expressions, you'll see them tokenize real C code. When we cover parsing algorithms, you'll trace through actual parse trees.

### Progressive Complexity

We start simple and build up. The first lexer handles just numbers and operators. By the end, you'll understand how production compilers handle entire languages.

### Multiple Perspectives

We show both:
- **Manual implementation**: writing a recursive-descent parser by hand
- **Tool-based approach**: using Lex, Yacc, ANTLR, and LLVM

### Real-World Context

Throughout the course, we reference how GCC, Clang, the JVM, V8 (JavaScript), and CPython actually implement these concepts.

---

## Complete Lesson List

### Section 1: Introduction & Overview

| # | Lesson | Topic |
|---|--------|-------|
| 01 | Course Home | Overview and roadmap (this page) |
| 02 | What is a Compiler? | Compilers, interpreters, transpilers |
| 03 | History of Compilers | From FORTRAN to LLVM |
| 04 | Compiler Structure and Phases | The six-phase pipeline |
| 05 | Introduction to Lexical Analysis | Tokens, lexemes, and patterns |

### Section 2: Lexical Analysis (Scanning)

| # | Lesson | Topic |
|---|--------|-------|
| 06 | Regular Expressions | Formal regex for token specification |
| 07 | Finite Automata (DFA) | Deterministic finite automata |
| 08 | NFA and NFA→DFA Conversion | Nondeterminism and subset construction |
| 09 | DFA Minimization | Reducing states for efficiency |
| 10 | Implementing a Lexer | Hand-coded scanner in C |
| 11 | Lexer Generators (Lex/Flex) | Automated scanner generation |
| 12 | Token Specification Patterns | Handling comments, strings, numbers |
| 13 | Error Recovery in Lexing | Panic mode and repair strategies |
| 14 | Lexer Case Study | Tokenizing a mini-language |

### Section 3: Syntax Analysis (Parsing)

| # | Lesson | Topic |
|---|--------|-------|
| 15 | Context-Free Grammars | Productions, derivations, parse trees |
| 16 | Ambiguity in Grammars | Detecting and resolving ambiguity |
| 17 | Grammar Transformations | Left factoring, eliminating left recursion |
| 18 | Top-Down Parsing Overview | Predictive and backtracking parsers |
| 19 | FIRST and FOLLOW Sets | Computing lookahead sets |
| 20 | LL(1) Parsing | Table-driven predictive parsing |
| 21 | Recursive Descent Parsing | Hand-coded top-down parsers |
| 22 | Bottom-Up Parsing Overview | Shift-reduce parsing |
| 23 | LR(0) Parsing | Items, states, and goto graph |
| 24 | SLR(1) Parsing | Simple LR with FOLLOW lookahead |
| 25 | CLR(1) and LALR(1) | Canonical LR and look-ahead LR |
| 26 | Parser Generators (Yacc/Bison) | Automated parser generation |
| 27 | Error Recovery in Parsing | Panic mode, phrase level, error productions |
| 28 | AST Construction | Building abstract syntax trees |

### Section 4: Semantic Analysis

| # | Lesson | Topic |
|---|--------|-------|
| 29 | Syntax-Directed Definitions | Attributes on grammar symbols |
| 30 | Attribute Grammars | Synthesized and inherited attributes |
| 31 | Symbol Tables | Design, scope management, hashing |
| 32 | Type Checking | Static typing, type rules, coercion |
| 33 | Type Systems | Polymorphism, inference, subtyping |
| 34 | Scope and Binding | Lexical vs dynamic scope, closures |
| 35 | Semantic Error Detection | Undeclared variables, type mismatches |

### Section 5: Intermediate Code Generation

| # | Lesson | Topic |
|---|--------|-------|
| 36 | Intermediate Representations | Why IR? Levels of abstraction |
| 37 | Three-Address Code | Quadruples, triples, indirect triples |
| 38 | SSA Form | Static Single Assignment and φ-functions |
| 39 | Control Flow in IR | Translating if/while/for to IR |
| 40 | Expressions and Assignments in IR | Arithmetic, boolean, array access |
| 41 | Procedure Calls in IR | Calling conventions in intermediate code |

### Section 6: Code Optimization

| # | Lesson | Topic |
|---|--------|-------|
| 42 | Introduction to Optimization | Goals, safety, profitability |
| 43 | Local Optimization | Peephole, algebraic simplification |
| 44 | Data-Flow Analysis Framework | Meet-over-paths, iterative algorithms |
| 45 | Reaching Definitions | Definition-use chains |
| 46 | Live Variable Analysis | Determining variable liveness |
| 47 | Loop Optimization | Invariant code motion, strength reduction |
| 48 | Global Optimization | Common subexpression elimination |
| 49 | Interprocedural Analysis | Call graphs, inlining decisions |
| 50 | Optimization Case Study | Optimizing a matrix multiply |

### Section 7: Code Generation

| # | Lesson | Topic |
|---|--------|-------|
| 51 | Code Generation Overview | From IR to machine code |
| 52 | Instruction Selection | Tree matching, BURG algorithm |
| 53 | Register Allocation | Graph coloring, linear scan |
| 54 | Instruction Scheduling | Pipeline hazards, list scheduling |
| 55 | Machine-Dependent Optimization | Target-specific peepholes |
| 56 | Code Generation Case Study | Generating x86 for a function |

### Section 8: Runtime Systems

| # | Lesson | Topic |
|---|--------|-------|
| 57 | Runtime Environment | Stack frames, activation records |
| 58 | Memory Layout | Text, data, heap, stack segments |
| 59 | Garbage Collection | Mark-sweep, copying, generational GC |
| 60 | Dynamic Linking and Loading | Shared libraries, symbol resolution |
| 61 | Exception Handling | Table-driven unwinding, setjmp/longjmp |

### Section 9: Advanced Topics & Project

| # | Lesson | Topic |
|---|--------|-------|
| 62 | JIT Compilation | Tracing JIT, method-based JIT |
| 63 | LLVM Infrastructure | IR, passes, backends |
| 64 | Verified and Secure Compilers | CompCert, translation validation |
| 65 | Capstone Project | Build a mini-compiler end to end |

---

## How to Use This Course

1. **Read sequentially** — each lesson builds on the previous ones
2. **Try the examples** — run the code snippets, trace the algorithms by hand
3. **Do the exercises** — at the end of key lessons
4. **Build as you learn** — by Section 5, you'll have enough to start your own mini-compiler

---

## Learning Path Options

### Path A: Theory-Focused (Academic)
If you're studying for exams or want deep understanding:
- Focus on formal definitions and proofs
- Work through all grammar transformations by hand
- Practice computing FIRST/FOLLOW sets
- Derive LR parsing tables manually

### Path B: Practice-Focused (Engineer)
If you want to build things:
- Focus on implementation sections
- Write a lexer in your favorite language early on
- Build a recursive-descent parser by lesson 21
- Use LLVM for the back-end (lesson 63)

### Path C: Interview Preparation
Key topics interviewers ask about:
- Lessons 6–9: Regular expressions and automata (very common!)
- Lessons 15–25: Parsing algorithms (LL vs LR)
- Lessons 44–47: Data-flow analysis
- Lessons 52–53: Register allocation (graph coloring)

---

## What You'll Build (Progressively)

By the end of this course, you'll understand how to build:

| Milestone | After Lesson | What You Can Build |
|---|---|---|
| Tokenizer | 14 | A lexer that breaks code into tokens |
| Parser | 28 | A parser that builds syntax trees |
| Type checker | 35 | A semantic analyzer that catches type errors |
| IR generator | 41 | A translator from AST to three-address code |
| Optimizer | 50 | An optimizer that improves IR |
| Code generator | 56 | A back-end that emits assembly |
| Full compiler | 65 | A complete mini-compiler end to end |

---

## Tools We'll Reference

| Tool | Purpose |
|------|---------|
| Lex / Flex | Lexer generator |
| Yacc / Bison | Parser generator |
| ANTLR | Combined lexer + parser generator |
| LLVM | Compiler infrastructure (IR, optimization, code gen) |
| GCC | GNU Compiler Collection |
| Python PLY | Python Lex-Yacc for prototyping |

---

## Compiler Design in the Real World

Understanding compiler design isn't just academic — it has immediate practical applications:

### Web Development
- **Babel** transpiles modern JavaScript to older versions
- **TypeScript** compiler checks types and emits JavaScript
- **Webpack/Vite** bundle and transform code using AST manipulation
- **CSS preprocessors** (Sass, Less) are mini-compilers
- **Template engines** (JSX, Handlebars) parse custom syntax

### Systems Programming
- **Rust's borrow checker** is a sophisticated semantic analysis phase
- **Go's compiler** is optimized for fast compilation (<1 sec for most projects)
- **C/C++ compilers** (GCC, Clang) generate highly optimized machine code
- **Zig** uses a self-hosted compiler with comptime evaluation

### Data & AI
- **SQL query planners** parse SQL and optimize execution plans (cost-based optimization)
- **TensorFlow XLA** compiles computation graphs to GPU/TPU code
- **Regular expression engines** are tiny compilers (regex → DFA)
- **Apache Spark Catalyst** optimizes query plans using compiler techniques
- **Halide** compiles image processing pipelines with schedule optimization

### DevOps & Tooling
- **Linters** (ESLint, Pylint) perform lexing + parsing + semantic checks
- **Formatters** (Prettier, Black) parse and regenerate code
- **IDE features** (autocomplete, refactoring) rely on partial compilation
- **Static analyzers** (SonarQube, Coverity) use data-flow analysis from compiler theory
- **Code generation tools** (protobuf, GraphQL codegen) are specialized compilers

---

## Common Misconceptions

| Misconception | Reality |
|---|---|
| "Compilers are obsolete — everything is interpreted now" | Even Python compiles to bytecode; JIT compilers power all modern JS engines |
| "You need a PhD to write a compiler" | A basic compiler for a simple language takes ~1000 lines of code |
| "Compiler optimization doesn't matter with modern hardware" | Compilers routinely achieve 10–100× speedups over unoptimized code |
| "Only language designers need to know this" | Every code analysis tool (linter, formatter, IDE) uses compiler techniques |
| "Compiler design is just about programming languages" | The techniques apply to databases, networking, graphics, and more |

---

## The Compiler Design Mindset

Studying compilers teaches you a particular way of thinking:

### Layered Abstraction
Each phase operates at a different **level of abstraction**. The lexer sees characters, the parser sees tokens, semantic analysis sees types. Learning to think in layers is a transferable skill.

### Formal Specification
Compilers demand precision. You'll learn to specify exactly what's valid (via grammars) and what's not. This precision carries over to API design, protocol specification, and system design.

### Transformation Pipelines
The compiler pipeline (input → transform → output, repeated) is a universal pattern:
- Unix pipes: `cat file | grep pattern | sort | uniq`
- Data engineering: extract → transform → load (ETL)
- ML pipelines: preprocess → train → evaluate → deploy

### Trade-off Analysis
Every compiler decision involves trade-offs:
- Compile time vs runtime performance
- Code size vs execution speed
- Compilation speed vs optimization level
- Generality vs specialization

---

## Mathematical Foundation

Compiler design draws on several areas of mathematics:

| Math Area | Compiler Application |
|---|---|
| Set theory | Token sets, FIRST/FOLLOW sets |
| Graph theory | Control flow graphs, interference graphs |
| Automata theory | Lexers (DFA/NFA), parsers (PDA) |
| Fixed-point theory | Data-flow analysis |
| Linear algebra | Register allocation (graph coloring) |
| Formal logic | Type systems, verification |

Don't worry — we introduce each mathematical concept as needed, with intuitive explanations and examples.

---

## Recommended Resources

While this course is self-contained, these references complement the material:

| Resource | Authors | Best For |
|---|---|---|
| *Compilers: Principles, Techniques, and Tools* (Dragon Book) | Aho, Lam, Sethi, Ullman | Comprehensive theory |
| *Engineering a Compiler* | Cooper, Torczon | Practical algorithms |
| *Modern Compiler Implementation in C/Java/ML* | Appel | Implementation-focused |
| *Crafting Interpreters* | Nystrom | Beginner-friendly, free online |
| LLVM Tutorial: *Kaleidoscope* | LLVM Project | Hands-on LLVM |
| *Programming Language Pragmatics* | Scott | Language design + implementation |
| *Types and Programming Languages* | Pierce | Type system theory |

### Online Resources

- **Godbolt Compiler Explorer** (godbolt.org): see compiler output in real-time
- **LLVM Language Reference Manual**: official IR documentation
- **Crafting Interpreters** (craftinginterpreters.com): free book with complete implementations
- **CS 143 (Stanford)**: classic compiler construction course materials available online

---

## Let's Begin!

Ready to understand how programming languages come to life? Start with the next lesson: **What is a Compiler?**

The journey from source code to machine code is one of the most elegant constructions in computer science. Let's explore it together.

---

## Quick Reference: Compilation at a Glance

$$
\text{Source} \xrightarrow{\text{Lexer}} \text{Tokens} \xrightarrow{\text{Parser}} \text{AST} \xrightarrow{\text{Semantic}} \text{Annotated AST} \xrightarrow{\text{IR Gen}} \text{IR} \xrightarrow{\text{Optimize}} \text{IR'} \xrightarrow{\text{CodeGen}} \text{Target}
$$

Each arrow represents a **phase** of the compiler. Each phase:
- Has a well-defined input and output
- Can report errors specific to that level
- Can be developed and tested independently

This modularity is what makes compiler construction both tractable and beautiful.

---

## Glossary of Key Terms

| Term | Definition |
|---|---|
| **AST** | Abstract Syntax Tree — tree representation of program structure |
| **Back-end** | Compiler component that generates target-specific code |
| **CFG** | Context-Free Grammar — rules defining valid syntax |
| **DFA** | Deterministic Finite Automaton — recognizes regular languages |
| **Front-end** | Compiler component that analyzes source language |
| **IR** | Intermediate Representation — platform-independent code form |
| **JIT** | Just-In-Time compilation — compiles at runtime |
| **Lexer** | Component that breaks source into tokens |
| **NFA** | Nondeterministic Finite Automaton — theoretical scanner model |
| **Parser** | Component that builds syntax trees from tokens |
| **SSA** | Static Single Assignment — IR where each variable assigned once |
| **Symbol table** | Data structure mapping identifiers to their attributes |
| **Three-address code** | IR format: `x = y op z` |
| **Token** | Classified unit of source text (keyword, identifier, literal) |

These terms will be defined in detail as we encounter them throughout the course.
