---
title: Church-Turing Thesis
---

# Church-Turing Thesis

In this lesson, you will learn about the **Church-Turing Thesis** — one of the most important ideas in all of computer science. It says that Turing Machines capture everything we mean by "computable."

---

## The Thesis (Informal Statement)

> **Church-Turing Thesis:** Every function that is "effectively computable" by any mechanical procedure is computable by a Turing Machine.

In simpler terms:

> **If an algorithm exists for a problem, then a Turing Machine can solve it.**

Or equivalently:

> **"Algorithm" = "Turing Machine program"**

---

## A Thesis, Not a Theorem

This is called a **thesis** (not a theorem) because:

- It relates a **formal** concept (TM-computability) to an **informal** concept ("algorithm" or "effective procedure")
- You cannot formally **prove** it — because one side isn't mathematically defined
- It can potentially be **refuted** — by finding a convincing algorithm that no TM can perform
- But it **cannot be proved** — because "algorithm" isn't a formal term

Despite being unprovable, the Church-Turing Thesis is universally accepted by computer scientists and mathematicians.

---

## Historical Development

### The Entscheidungsproblem (1928)

David Hilbert posed the **Decision Problem**:

> Is there an algorithm that, given any mathematical statement, determines whether it is true or false?

This question motivated the formal study of computation.

$$
\text{Hilbert's question: } \exists \text{ algorithm } A: \text{Statement} \to \{\text{True}, \text{False}\} \text{ ?}
$$

### Gödel's Incompleteness Theorems (1931)

Kurt Gödel showed that in any sufficiently powerful formal system:

1. There exist **true statements that cannot be proved** within the system
2. The system **cannot prove its own consistency**

This hinted that Hilbert's program was doomed — but didn't directly answer the Entscheidungsproblem.

### Church's Lambda Calculus (1936)

Alonzo Church developed the **lambda calculus** — a formal system for defining and computing functions:

$$
\lambda x.\ x + 1 \quad \text{(function that adds 1)}
$$

$$
(\lambda x.\ x + 1)\ 5 = 6 \quad \text{(applying it to 5)}
$$

Church proved that certain problems are **not lambda-definable** — giving the first formal undecidability result.

### Turing's Machine Model (1936)

Alan Turing, independently, defined his **Turing Machine** and proved:

- The Entscheidungsproblem is undecidable
- The halting problem is undecidable
- TMs formalize the notion of "mechanical computation"

### The Equivalence

Church and Turing proved that their models are **equivalent**:

$$
\text{Lambda-definable functions} = \text{Turing-computable functions}
$$

This remarkable convergence — two completely different formalizations yielding the same class — is strong evidence for the thesis.

---

## Equivalent Models of Computation

Many models have been proposed, and ALL have been proven equivalent to TMs:

### Lambda Calculus (Church, 1936)

A system based on **function abstraction and application**:

- Variables: $x, y, z, \ldots$
- Abstraction: $\lambda x.\ E$ (a function with parameter $x$ and body $E$)
- Application: $(F\ A)$ (applying function $F$ to argument $A$)

With just these three constructs, you can compute anything a TM can!

### Recursive Functions (Kleene, Gödel)

Functions built from:

- **Zero:** $Z(n) = 0$
- **Successor:** $S(n) = n + 1$
- **Projection:** $P_i^k(x_1, \ldots, x_k) = x_i$
- **Composition:** $h = f \circ g$
- **Primitive recursion:** defining $f(n+1)$ in terms of $f(n)$
- **Minimization ($\mu$-operator):** $\mu y[g(x, y) = 0]$ — find smallest $y$ making $g$ zero

The class of **$\mu$-recursive functions** = Turing-computable functions.

### Post Systems (Post, 1936)

String rewriting rules of the form:

$$
\alpha X \beta \to \gamma X \delta
$$

Equivalent to TMs in computational power.

### Register Machines (RAM Model)

An idealized computer with:

- Finite number of **registers** holding natural numbers
- Instructions: increment, decrement, jump-if-zero

This is closer to real CPU architecture:

$$
\text{INC}(R_i): \quad R_i \leftarrow R_i + 1
$$

$$
\text{DEC}(R_i): \quad R_i \leftarrow R_i - 1
$$

$$
\text{JZ}(R_i, L): \quad \text{if } R_i = 0 \text{ goto } L
$$

With just these three instructions, you can compute anything!

### Modern Programming Languages

Every general-purpose programming language is Turing-complete:

- C, C++, Java, Python, JavaScript, Rust, Go, Haskell, ...
- Assembly languages
- Even some "non-programming" systems (see below)

$$
\text{Python-computable} = \text{Java-computable} = \text{C-computable} = \text{TM-computable}
$$

### Cellular Automata

Systems like **Conway's Game of Life** (1970):

- A grid of cells, each alive or dead
- Simple local rules determine the next state
- Proven to be Turing-complete!

You can build logic gates, memory, and a full computer inside the Game of Life.

### Quantum Computers

Quantum computers:

- Use **qubits** instead of classical bits
- Can be in **superposition** of states
- Exploit **entanglement** and **interference**

Computability:

$$
\text{Quantum-computable} = \text{TM-computable}
$$

Quantum computers compute the SAME functions as classical computers. They may compute some of them **faster** (e.g., Shor's algorithm for factoring), but they cannot compute anything new.

---

## The Evidence

Why do we believe the Church-Turing Thesis? There is no proof, but overwhelming evidence:

### 1. All Models Are Equivalent

Every proposed model of computation has been shown equivalent to TMs:

$$
\text{TM} \equiv \lambda\text{-calculus} \equiv \mu\text{-recursive} \equiv \text{RAM} \equiv \text{Post} \equiv \ldots
$$

If the thesis were false, some model would compute more — but none ever has.

### 2. No Natural Counterexample

In 90+ years, no one has found a convincing example of:

- A function that is "intuitively computable" but not TM-computable
- A physical process that computes something a TM cannot

### 3. Physical Church-Turing Thesis

The stronger claim:

> Any function computable by a physical device in this universe is TM-computable.

This relates computability to physics — and so far, physics supports it.

### 4. Independent Discovery

Church, Turing, Post, and Kleene — working independently — all arrived at the same class of computable functions. This convergence is strong evidence that the class is "natural."

---

## Implications

### 1. Uncomputability Exists

If TMs capture all of computation, and we know TMs can't solve certain problems (halting problem, etc.), then:

$$
\text{Unsolvable by TM} \implies \text{Unsolvable by ANY algorithm}
$$

No programming language, no hardware, no clever trick can solve the halting problem.

### 2. Computability Is Robust

The concept of "computable" doesn't depend on:

- Which programming language you use
- How much memory you have (as long as unbounded)
- The specific hardware architecture

Computability is a **fundamental, model-independent** concept.

### 3. Universal Computation Is Minimal

Since even very simple systems (3-state TMs, cellular automata, lambda calculus) are universal, computation requires remarkably little structure.

### 4. The Limits of Algorithms

There exist:

- **Undecidable** problems: no algorithm can always give the right answer
- **Unrecognizable** problems: no algorithm can even say "yes" for all positive instances

These limits are absolute (assuming the thesis).

---

## The Extended Church-Turing Thesis

A stronger version concerns **efficiency**:

> **Extended Church-Turing Thesis (ECT):** Any problem solvable in polynomial time on a "reasonable" model of computation is solvable in polynomial time on a (probabilistic) TM.

This claims that all reasonable models are **polynomially equivalent**.

### Status of the ECT

The ECT is more controversial:

| Model | Polynomial equivalence to TM? |
|-------|:---:|
| Multi-tape TM | Yes (quadratic) |
| RAM model | Yes (polynomial) |
| Quantum computer | **Unknown!** |

Quantum computers may refute the ECT:

- **Shor's algorithm** factors $n$-digit numbers in $O(n^3)$ on a quantum computer
- Best known classical: sub-exponential (not polynomial)
- If no classical polynomial factoring exists, ECT is false for deterministic TMs

However, a modified version using **probabilistic** TMs may still hold.

---

## What the Thesis Does NOT Say

### It does NOT say "TMs are efficient"

A problem might be TM-computable but take $2^{2^{2^n}}$ steps. Computability ≠ practicality.

### It does NOT say "everything is computable"

Many specific problems are provably **uncomputatable**:

- The halting problem
- Determining if two programs compute the same function
- Hilbert's 10th problem (Diophantine equations)

### It does NOT say "physics is computable"

Whether all physical processes can be simulated by TMs is an open question in physics.

### It does NOT say anything about consciousness or intelligence

The thesis is about mathematical computation, not about minds or understanding.

---

## Turing-Complete Systems (Surprising Examples)

Some systems that are unexpectedly Turing-complete:

| System | Turing-complete? |
|--------|:---:|
| Conway's Game of Life | Yes |
| Minecraft (redstone) | Yes |
| CSS + HTML (with user interaction) | Debated |
| SQL (recursive CTEs) | Yes |
| LaTeX macro system | Yes |
| PowerPoint animations | Yes |
| Magic: The Gathering (card game) | Yes (proved 2019) |
| Rule 110 (elementary cellular automaton) | Yes (proved 2004) |

These demonstrate how "easy" it is to accidentally create a universal computer!

---

## Formal Statement (Technical)

For the mathematically inclined, the thesis can be stated as:

$$
f: \mathbb{N} \to \mathbb{N} \text{ is effectively computable} \iff f \text{ is partial recursive} \iff f \text{ is TM-computable}
$$

where "effectively computable" means computable by some idealized mechanical procedure following a finite set of explicit instructions.

---

## Connections to Other Areas

### Complexity Theory

The thesis underlies all of complexity theory:

- **P** = efficiently solvable problems (polynomial time on TM)
- **NP** = efficiently verifiable problems
- P vs NP doesn't challenge the thesis — it's about efficiency, not computability

### Programming Language Theory

Every Turing-complete language can implement any algorithm:

$$
\text{If } L_1 \text{ and } L_2 \text{ are Turing-complete: } L_1\text{-computable} = L_2\text{-computable}
$$

This is why you can (in principle) do anything in Python that you can in C.

### Artificial Intelligence

The thesis implies that if human reasoning is "algorithmic," then a TM can replicate it. But:

- Is human thought algorithmic?
- Does consciousness require something non-computable?

These remain open philosophical questions.

---

## Formal Equivalence: Lambda Calculus and TMs

### Lambda Calculus → TM

Any lambda expression can be evaluated by a TM:

1. Represent lambda terms as strings
2. Implement **beta-reduction** ($(\lambda x. M) N \to M[x := N]$) as string substitution
3. Apply reduction rules until no more reductions possible (normal form)

The TM systematically applies reductions — this is essentially what interpreters do!

### TM → Lambda Calculus

Any TM can be encoded in lambda calculus:

1. Represent the tape as a pair of lists (left of head, right of head)
2. Represent the transition function as a lambda term
3. Iteration = recursive function application (using the Y-combinator)

$$
Y = \lambda f.\ (\lambda x.\ f(x\ x))(\lambda x.\ f(x\ x))
$$

The **Y-combinator** enables recursion in lambda calculus, providing the "looping" power of TMs.

---

## Formal Equivalence: Register Machines and TMs

### Register Machine → TM

A register machine with $k$ registers can be simulated by a $(k+1)$-tape TM:

- Each register $R_i$ maps to tape $i$ (contents in unary)
- INC($R_i$): write one more $1$ on tape $i$
- DEC($R_i$): erase one $1$ from tape $i$
- JZ($R_i$, $L$): check if tape $i$ is blank, branch accordingly

### TM → Register Machine

A TM with tape alphabet $\Gamma$ can be simulated by a register machine:

- Encode the tape contents as a single number (Gödel numbering)
- Head position stored in a register
- Transitions become arithmetic operations on the encoding

This shows:

$$
\text{3 registers + 3 instructions} \equiv \text{Turing Machine}
$$

---

## Try It Yourself

### Exercise 1: Equivalence

Show that a programming language with only the following is Turing-complete:

- Integer variables
- Assignment ($x = 0$, $x = x + 1$, $x = x - 1$)
- While loops (`while x != 0 do ... end`)

*Hint:* Show you can simulate a register machine.

**Solution sketch:**

- INC($R_i$) = `Ri = Ri + 1`
- DEC($R_i$) = `Ri = Ri - 1`
- JZ($R_i$, $L$) = `while Ri != 0 do ... end` (for conditional branching, encode the program counter as a variable and use nested while loops)

### Exercise 2: Turing Completeness

Is a finite automaton (DFA) Turing-complete? Why or why not?

**Answer:** No. A DFA has only finite memory (its states). It cannot count beyond a fixed bound, so it cannot recognize $\{a^n b^n\}$. TMs can, so DFAs are strictly weaker.

### Exercise 3: Physical Computation

Give an argument for why the physical Church-Turing thesis might be false. What physical phenomenon might compute something non-TM-computable?

**Possible arguments:**

- **Hypercomputation via real numbers:** If physical quantities have infinite precision (real-valued), infinite information could be accessed in finite time
- **Closed timelike curves:** Time travel might allow "solving" the halting problem
- **Oracle computation:** Unknown physics might provide "oracle" capabilities

However, no convincing physical evidence supports any of these!

### Exercise 4: Lambda Calculus

The lambda expression $(\lambda f.\ \lambda x.\ f(f(x)))$ applies $f$ twice. What does $(\lambda f.\ \lambda x.\ f(f(f(x))))$ do?

**Answer:** It applies $f$ three times: $f(f(f(x)))$. These are the **Church numerals** — representing natural numbers in lambda calculus!

$$
\overline{n} = \lambda f.\ \lambda x.\ \underbrace{f(f(\ldots f}_{n \text{ times}}(x)\ldots))
$$

### Exercise 5: Implications

If someone claims to have an algorithm that solves the halting problem, what does the Church-Turing Thesis tell us about their claim?

**Answer:** The halting problem is provably undecidable for TMs. By the Church-Turing Thesis, it is unsolvable by ANY algorithm. Their claim must be wrong (or they've refuted the thesis, which would be a monumental discovery).

### Exercise 6: Model Comparison

Fill in the table with "Yes" or "No":

| Feature | DFA | PDA | TM | Lambda Calculus |
|---------|-----|-----|-----|-----------------|
| Finite memory only | Yes | No | No | No |
| Can count | No | Yes | Yes | Yes |
| Can compare two counts | No | No | Yes | Yes |
| Turing-complete | No | No | Yes | Yes |

### Exercise 7: Modern Languages

Python has `eval()` — a function that takes a string and executes it as code. Explain why this makes Python act like a UTM.

**Answer:** `eval(code)` takes a program description (string) and executes it, just like $U$ takes $\langle M \rangle$ and simulates it. Python is both the "hardware" (interpreter) and can process arbitrary "software" (code strings).

---

## Summary: The Landscape of Computability

$$
\begin{array}{ccc}
& \text{All problems} & \\
& \cup & \\
& \text{Recognizable (RE)} & \\
& \cup & \\
& \text{Decidable (R)} & \\
& \cup & \\
& \text{P (efficient)} & \\
\end{array}
$$

The Church-Turing Thesis tells us that "Decidable" is the same no matter which formalism we use.

---

## Key Takeaways

$$
\boxed{
\text{Computable} = \text{TM-computable} = \lambda\text{-definable} = \mu\text{-recursive} = \ldots
}
$$

1. The Church-Turing Thesis states that TMs capture all of "algorithmic computation"
2. It is a **thesis** (not a theorem) — unprovable because one side is informal
3. ALL known models of computation are equivalent to TMs
4. No counterexample has been found in 90+ years
5. The thesis implies that undecidable problems are truly unsolvable by any means
6. The Extended Church-Turing Thesis (about efficiency) is more debatable
7. Quantum computers compute the same things as TMs, possibly faster
8. The thesis is the foundation for all of computability and complexity theory

---

## What's Next?

With the Church-Turing Thesis established, we now have a solid foundation for studying **undecidability** — problems that no algorithm can solve. In the next lessons, we'll prove the halting problem undecidable and explore the rich world of uncomputability.

---
