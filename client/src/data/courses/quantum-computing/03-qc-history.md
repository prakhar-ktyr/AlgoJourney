---
title: History of Quantum Computing
---

# History of Quantum Computing

The story of quantum computing spans decades of breakthroughs in physics, mathematics, and computer science. Understanding this history helps you appreciate where the field stands today and where it's headed.

---

## The Quantum Mechanics Foundation (1900–1930s)

Quantum computing wouldn't exist without quantum mechanics. Here are the key physics milestones:

### 1900 — Max Planck's Quantum Hypothesis

Max Planck proposed that energy is emitted in discrete packets called **quanta**, not as a continuous wave. This was the birth of quantum theory.

$$E = h\nu$$

where $E$ is energy, $h$ is Planck's constant ($6.626 \times 10^{-34}$ J·s), and $\nu$ is frequency.

### 1905 — Einstein's Photoelectric Effect

Albert Einstein showed that light comes in discrete packets (**photons**), providing evidence for quantization and earning him the Nobel Prize.

### 1925–1926 — Quantum Mechanics Formalized

- **Werner Heisenberg** developed matrix mechanics.
- **Erwin Schrödinger** developed wave mechanics and his famous equation:

$$i\hbar\frac{\partial}{\partial t}|\psi\rangle = \hat{H}|\psi\rangle$$

### 1927 — Heisenberg Uncertainty Principle

You cannot simultaneously know the exact position and momentum of a particle:

$$\Delta x \cdot \Delta p \geq \frac{\hbar}{2}$$

### 1935 — EPR Paradox & Entanglement

Einstein, Podolsky, and Rosen (EPR) described a thought experiment that highlighted the "spooky" correlations between entangled particles. Schrödinger coined the term **entanglement**.

---

## The Idea Takes Shape (1980s)

### 1980 — Paul Benioff

Paul Benioff described the first quantum mechanical model of a Turing machine, showing that a computer could in principle operate under quantum mechanical rules.

### 1981 — Richard Feynman's Vision

At a physics conference at MIT, Richard Feynman made a groundbreaking observation:

> "Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical."

He argued that classical computers cannot efficiently simulate quantum systems, but a **quantum computer** could. This is widely considered the birth of the quantum computing idea.

### 1985 — David Deutsch's Universal Quantum Computer

David Deutsch at Oxford formalized the concept of a **universal quantum computer** — a quantum Turing machine that could simulate any physical process. He also proposed the **Deutsch algorithm**, the first quantum algorithm to demonstrate a speedup over classical computation.

---

## The Algorithm Revolution (1990s)

### 1992 — Deutsch-Jozsa Algorithm

David Deutsch and Richard Jozsa created an algorithm that could determine whether a function is constant or balanced with a single query — an exponential speedup over classical approaches.

### 1994 — Peter Shor's Factoring Algorithm

**Shor's algorithm** was a watershed moment. Peter Shor at Bell Labs showed that a quantum computer could factor large numbers in polynomial time:

- **Classical best**: Sub-exponential time (number field sieve)
- **Quantum (Shor's)**: $O((\log N)^3)$ — polynomial time

This meant RSA encryption (the backbone of internet security) could be broken by a sufficiently powerful quantum computer. The world took notice.

### 1995 — Quantum Error Correction

Peter Shor and Andrew Steane independently developed **quantum error correction codes**, showing that quantum computation could be made fault-tolerant despite the fragility of quantum states.

### 1996 — Lov Grover's Search Algorithm

**Grover's algorithm** showed that quantum computers could search an unsorted database of $N$ items in $O(\sqrt{N})$ time — a quadratic speedup over the classical $O(N)$.

### 1998 — First Experimental Implementations

- Scientists at Oxford, MIT, and Los Alamos built small quantum computers using **NMR (Nuclear Magnetic Resonance)** techniques.
- A 2-qubit quantum computer solved Deutsch's problem for the first time.

---

## The Hardware Race (2000s)

### 2001 — Shor's Algorithm Demonstrated

IBM and Stanford used a 7-qubit NMR quantum computer to factor the number 15 into 3 × 5 using Shor's algorithm. While trivial mathematically, it was a landmark proof of concept.

### 2007 — D-Wave Founded

D-Wave Systems, a Canadian company, built the first commercial **quantum annealer** — a specialized quantum device for optimization problems (not a universal quantum computer).

### 2009 — Yale Creates First Solid-State Qubit Processor

Researchers at Yale demonstrated the first solid-state quantum processor, using **superconducting qubits** — the technology that would become dominant.

---

## The NISQ Era (2010s–Present)

**NISQ** stands for **Noisy Intermediate-Scale Quantum** — coined by John Preskill in 2018. It describes today's quantum computers: useful but error-prone, with 50–1,000+ qubits.

### 2016 — IBM Quantum Experience

IBM launched the first cloud-accessible quantum computer, allowing anyone to run quantum circuits through a web browser. This democratized quantum computing.

### 2019 — Google's Quantum Supremacy

Google's **Sycamore** processor (53 qubits) performed a specific calculation in 200 seconds that Google claimed would take the world's best supercomputer 10,000 years. This was the first claim of **quantum supremacy** (also called "quantum advantage").

> IBM disputed the 10,000-year claim, arguing classical simulation could be done in 2.5 days with enough storage.

### 2021 — IBM's 127-Qubit Eagle

IBM released the **Eagle** processor with 127 qubits, their most powerful at the time.

### 2023 — IBM's 1,121-Qubit Condor

IBM unveiled **Condor**, the first quantum processor to break the 1,000-qubit barrier. They also introduced **Heron**, a 133-qubit processor with improved error rates.

### 2024 — Microsoft's Topological Qubits

Microsoft announced progress on **topological qubits**, which could be inherently more error-resistant than current designs.

---

## Key Milestones Summary

| Year | Event |
|------|-------|
| 1900 | Planck introduces quanta |
| 1935 | EPR paradox / entanglement |
| 1981 | Feynman proposes quantum simulation |
| 1985 | Deutsch: universal quantum computer |
| 1994 | Shor's algorithm |
| 1996 | Grover's algorithm |
| 2001 | First experimental Shor's (factor 15) |
| 2016 | IBM cloud quantum computer |
| 2019 | Google quantum supremacy claim |
| 2023 | IBM 1,121-qubit Condor |

---

## Key Takeaways

- Quantum computing grew from quantum mechanics (1900s) through theoretical foundations (1980s–90s) to real hardware (2000s–present).
- Shor's and Grover's algorithms in the 1990s proved quantum computers could offer real speedups.
- We're in the **NISQ era** — quantum computers are powerful enough to demonstrate advantage but not yet reliable enough for production use.
- The field is advancing rapidly, with companies like IBM, Google, Microsoft, and many startups competing.

---

## Try It Yourself

**Research question**: Look up the latest quantum computing milestone. What's the current qubit count record? Has anyone demonstrated a practical quantum advantage for a real-world problem?

Next, we'll compare **Classical vs Quantum Computing** side by side →
