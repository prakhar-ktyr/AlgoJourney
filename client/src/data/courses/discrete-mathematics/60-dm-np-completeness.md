---
title: NP-Completeness & Reductions
---

# NP-Completeness & Reductions

The theory of NP-completeness addresses one of the deepest questions in computer science: are there problems whose solutions can be verified quickly but never found quickly? This chapter explores the boundary between tractable and intractable computation.

## Decision Problems

A **decision problem** is a computational problem with a yes/no answer:

- "Is there a path from A to B with length ≤ k?" (YES or NO)
- "Does this graph have a Hamiltonian cycle?" (YES or NO)
- "Is this number prime?" (YES or NO)

We focus on decision problems because they're the simplest to classify, and optimization problems can usually be recast as decision problems.

## Class P: Polynomial-Time Solvable

**P** is the class of decision problems solvable by a deterministic algorithm in polynomial time — $O(n^k)$ for some constant $k$.

### Examples in P

| Problem | Algorithm | Complexity |
|---------|-----------|------------|
| Sorting | Merge sort | $O(n \log n)$ |
| Shortest path | Dijkstra's | $O((V+E) \log V)$ |
| Primality testing | AKS | $O(n^6)$ (polynomial in digits) |
| Maximum matching | Edmonds' | $O(V^3)$ |
| Linear programming | Interior point | Polynomial |

Problems in P are considered **tractable** — efficiently solvable.

## Class NP: Polynomial-Time Verifiable

**NP** (Nondeterministic Polynomial time) is the class of decision problems where a "yes" answer can be **verified** in polynomial time given a certificate (proof/witness).

### Key Insight

- **Solving** might be hard.
- **Verifying** a proposed solution is easy.

### Examples in NP

| Problem | Certificate | Verification |
|---------|-------------|--------------|
| Hamiltonian Cycle | A sequence of vertices | Check it visits all vertices exactly once: $O(n)$ |
| Graph Coloring | A color assignment | Check no two adjacent vertices share a color: $O(m)$ |
| Subset Sum | A subset | Check the sum equals the target: $O(n)$ |
| SAT | A truth assignment | Evaluate the formula: $O(n)$ |

## P ⊆ NP

Every problem in P is also in NP. Why? If you can **solve** a problem in polynomial time, you can certainly **verify** a solution in polynomial time — just solve it and compare.

$$P \subseteq NP$$

The big question: does the reverse hold?

## The P vs NP Question

$$\text{Does } P = NP \text{?}$$

This is the most famous open problem in computer science (and mathematics). It asks: if a solution can be checked quickly, can it also be found quickly?

**If P = NP:**
- Every problem whose solution can be efficiently verified can also be efficiently solved.
- Cryptography (RSA, etc.) would collapse — factoring would be easy.
- Many optimization problems would become tractable.

**If P ≠ NP (widely believed):**
- There exist problems that are fundamentally harder to solve than to verify.
- Current cryptographic systems remain secure (in principle).

The Clay Mathematics Institute offers a $1,000,000 prize for a proof either way.

## NP-Complete Problems

A problem $L$ is **NP-complete** if:

1. $L \in NP$ (solutions can be verified in polynomial time).
2. Every problem in NP can be reduced to $L$ in polynomial time ($L$ is **NP-hard**).

NP-complete problems are the **hardest** problems in NP. If any one of them has a polynomial-time algorithm, then **all** problems in NP do (and P = NP).

### Venn Diagram (assuming P ≠ NP)

```
┌─────────────────────────────────────┐
│              NP                      │
│  ┌────────────────────────────────┐ │
│  │        NP-Complete             │ │
│  │  SAT, 3-SAT, Clique,          │ │
│  │  Vertex Cover, TSP, ...       │ │
│  └────────────────────────────────┘ │
│  ┌──────────┐                       │
│  │    P     │                       │
│  │ Sorting, │                       │
│  │ Shortest │                       │
│  │ path,... │                       │
│  └──────────┘                       │
│         NP-Intermediate?            │
│         (Factoring?)                │
└─────────────────────────────────────┘
```

## Polynomial-Time Reductions

A **polynomial-time reduction** from problem $A$ to problem $B$ (written $A \leq_P B$) is a polynomial-time computable function $f$ such that:

$$x \in A \iff f(x) \in B$$

**Meaning:** If we can solve $B$ efficiently, we can solve $A$ efficiently (by transforming $A$-instances into $B$-instances).

### Properties of Reductions

- If $A \leq_P B$ and $B \in P$, then $A \in P$.
- If $A \leq_P B$ and $A$ is NP-hard, then $B$ is NP-hard.
- Reductions are transitive: if $A \leq_P B$ and $B \leq_P C$, then $A \leq_P C$.

### Reduction Strategy

To prove $B$ is NP-complete:
1. Show $B \in NP$ (give a polynomial-time verifier).
2. Pick a known NP-complete problem $A$.
3. Show $A \leq_P B$ (reduce $A$ to $B$ in polynomial time).

## The Cook-Levin Theorem

**Theorem (Cook, 1971; Levin, 1973):** SAT (Boolean Satisfiability) is NP-complete.

### SAT Problem

**Input:** A Boolean formula in conjunctive normal form (CNF).

$$\phi = (x_1 \lor \neg x_2 \lor x_3) \land (\neg x_1 \lor x_2) \land (x_2 \lor \neg x_3)$$

**Question:** Is there an assignment of TRUE/FALSE to variables that makes $\phi$ true?

### Proof Sketch

Any NP problem can be solved by a nondeterministic Turing machine in polynomial time. The computation of such a machine on input $x$ can be encoded as a Boolean formula $\phi_x$ such that:
- $\phi_x$ is satisfiable $\iff$ the machine accepts $x$.
- $\phi_x$ can be constructed in polynomial time.

This was the first NP-completeness proof — the "seed" from which all others grow via reductions.

## Classic NP-Complete Problems

### 3-SAT

**Input:** A CNF formula where every clause has exactly 3 literals.

$$(x_1 \lor \neg x_2 \lor x_3) \land (\neg x_1 \lor x_4 \lor x_2) \land \ldots$$

**Reduction:** SAT $\leq_P$ 3-SAT (split larger clauses using auxiliary variables).

### Clique

**Input:** Graph $G$, integer $k$.
**Question:** Does $G$ contain a complete subgraph of size $k$?

**Reduction:** 3-SAT $\leq_P$ Clique.

### Vertex Cover

**Input:** Graph $G$, integer $k$.
**Question:** Is there a set of $k$ vertices that "covers" every edge (at least one endpoint of each edge is in the set)?

**Reduction:** Clique $\leq_P$ Vertex Cover (using complement graphs).

### Hamiltonian Cycle

**Input:** Graph $G$.
**Question:** Is there a cycle that visits every vertex exactly once?

**Reduction:** Vertex Cover $\leq_P$ Hamiltonian Cycle.

### Subset Sum

**Input:** Set $S$ of integers, target $t$.
**Question:** Is there a subset of $S$ that sums to exactly $t$?

**Reduction:** 3-SAT $\leq_P$ Subset Sum.

### Travelling Salesman Problem (TSP) — Decision Version

**Input:** Complete weighted graph, budget $B$.
**Question:** Is there a tour visiting all vertices with total weight $\leq B$?

**Reduction:** Hamiltonian Cycle $\leq_P$ TSP.

### Chain of Reductions

$$\text{SAT} \leq_P \text{3-SAT} \leq_P \text{Clique} \leq_P \text{Vertex Cover} \leq_P \text{Hamiltonian Cycle} \leq_P \text{TSP}$$

## NP-Hard

A problem is **NP-hard** if every NP problem reduces to it in polynomial time, but it **need not be in NP** itself.

- NP-complete = NP-hard ∩ NP
- The Halting Problem is NP-hard but not in NP (it's undecidable).
- Optimization versions of NP-complete problems (e.g., "find the minimum vertex cover") are NP-hard.

## Coping with NP-Completeness

Since NP-complete problems likely have no polynomial-time exact algorithms, we use:

### 1. Approximation Algorithms

Find a solution guaranteed to be within a factor of optimal:
- Vertex Cover: 2-approximation (always finds a cover at most twice optimal size).
- TSP (metric): 1.5-approximation (Christofides' algorithm).

### 2. Heuristics

No guarantee, but works well in practice:
- Genetic algorithms
- Simulated annealing
- Local search

### 3. Special Cases

Many NP-complete problems become polynomial for restricted inputs:
- 2-SAT is in P (while 3-SAT is NP-complete).
- Graph coloring is polynomial for trees.
- TSP is polynomial for certain graph structures.

### 4. Parameterized Complexity

Fixed-parameter tractable (FPT) algorithms: $O(f(k) \cdot n^c)$ where $k$ is a parameter.
- Vertex Cover of size $k$: $O(2^k \cdot n)$ — fast when $k$ is small.

### 5. Randomized Algorithms

Probabilistic approaches that are fast but may err with low probability.

## Code: Brute Force vs Polynomial Verification

This demonstrates the core of NP: verifying is easy, solving (by brute force) is exponential.

### Subset Sum — Brute Force Solver vs Verifier

```cpp
#include <iostream>
#include <vector>
#include <chrono>
using namespace std;

// Brute force: O(2^n) — try all subsets
bool subsetSumBruteForce(const vector<int>& nums, int target) {
    int n = nums.size();
    for (int mask = 0; mask < (1 << n); mask++) {
        int sum = 0;
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) sum += nums[i];
        }
        if (sum == target) return true;
    }
    return false;
}

// Verifier: O(n) — given a certificate (subset), check if it sums to target
bool verifySubsetSum(const vector<int>& nums, const vector<bool>& certificate, int target) {
    int sum = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (certificate[i]) sum += nums[i];
    }
    return sum == target;
}

int main() {
    vector<int> sizes = {10, 15, 20, 25};

    for (int n : sizes) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) nums[i] = i + 1;
        int target = n * (n + 1) / 4; // may or may not have solution

        auto start = chrono::high_resolution_clock::now();
        bool found = subsetSumBruteForce(nums, target);
        auto end = chrono::high_resolution_clock::now();
        double solveTime = chrono::duration<double, milli>(end - start).count();

        // Verification with a dummy certificate
        vector<bool> cert(n, false);
        cert[0] = true;
        start = chrono::high_resolution_clock::now();
        verifySubsetSum(nums, cert, target);
        end = chrono::high_resolution_clock::now();
        double verifyTime = chrono::duration<double, milli>(end - start).count();

        cout << "n=" << n << "  Solve: " << solveTime << "ms  Verify: "
             << verifyTime << "ms  Found: " << (found ? "yes" : "no") << endl;
    }
    return 0;
}
```

```java
import java.util.Arrays;

public class NPDemo {
    // Brute-force subset sum: O(2^n)
    static boolean subsetSumSolve(int[] nums, int target) {
        int n = nums.length;
        for (long mask = 0; mask < (1L << n); mask++) {
            int sum = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1L << i)) != 0) sum += nums[i];
            }
            if (sum == target) return true;
        }
        return false;
    }

    // Polynomial verifier: O(n)
    static boolean subsetSumVerify(int[] nums, boolean[] certificate, int target) {
        int sum = 0;
        for (int i = 0; i < nums.length; i++) {
            if (certificate[i]) sum += nums[i];
        }
        return sum == target;
    }

    public static void main(String[] args) {
        int[] sizes = {10, 15, 20, 25};

        for (int n : sizes) {
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = i + 1;
            int target = n * (n + 1) / 4;

            long start = System.nanoTime();
            boolean found = subsetSumSolve(nums, target);
            double solveMs = (System.nanoTime() - start) / 1e6;

            boolean[] cert = new boolean[n];
            cert[0] = true;
            start = System.nanoTime();
            subsetSumVerify(nums, cert, target);
            double verifyMs = (System.nanoTime() - start) / 1e6;

            System.out.printf("n=%d  Solve: %.3fms  Verify: %.6fms  Found: %s%n",
                    n, solveMs, verifyMs, found ? "yes" : "no");
        }
    }
}
```

```python
import time
from itertools import combinations

def subset_sum_brute_force(nums, target):
    """Brute force: try all 2^n subsets — O(2^n)"""
    n = len(nums)
    for r in range(n + 1):
        for combo in combinations(nums, r):
            if sum(combo) == target:
                return True, list(combo)
    return False, []

def subset_sum_verify(nums, certificate, target):
    """Polynomial verifier: O(n) — given subset indices, check sum"""
    return sum(nums[i] for i in certificate) == target

# Demonstrate the time gap between solving and verifying
for n in [10, 15, 20, 25]:
    nums = list(range(1, n + 1))
    target = n * (n + 1) // 4

    start = time.perf_counter()
    found, solution = subset_sum_brute_force(nums, target)
    solve_time = time.perf_counter() - start

    # Verify (trivial)
    certificate = [i for i, x in enumerate(nums) if x in solution] if found else [0]
    start = time.perf_counter()
    verified = subset_sum_verify(nums, certificate, target)
    verify_time = time.perf_counter() - start

    print(f"n={n:2d}  Solve: {solve_time*1000:10.3f}ms  "
          f"Verify: {verify_time*1000:.6f}ms  Found: {found}")
```

```javascript
function subsetSumBruteForce(nums, target) {
    const n = nums.length;
    for (let mask = 0; mask < (1 << n); mask++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) sum += nums[i];
        }
        if (sum === target) return true;
    }
    return false;
}

function subsetSumVerify(nums, certificate, target) {
    let sum = 0;
    for (const idx of certificate) {
        sum += nums[idx];
    }
    return sum === target;
}

const sizes = [10, 15, 20, 25];
for (const n of sizes) {
    const nums = Array.from({ length: n }, (_, i) => i + 1);
    const target = Math.floor(n * (n + 1) / 4);

    let start = performance.now();
    const found = subsetSumBruteForce(nums, target);
    const solveTime = performance.now() - start;

    start = performance.now();
    subsetSumVerify(nums, [0], target); // dummy certificate
    const verifyTime = performance.now() - start;

    console.log(`n=${n}  Solve: ${solveTime.toFixed(3)}ms  ` +
                `Verify: ${verifyTime.toFixed(6)}ms  Found: ${found}`);
}
```

```csharp
using System;
using System.Diagnostics;

class NPCompletenessDemo {
    static bool SubsetSumSolve(int[] nums, int target) {
        int n = nums.Length;
        for (long mask = 0; mask < (1L << n); mask++) {
            int sum = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1L << i)) != 0) sum += nums[i];
            }
            if (sum == target) return true;
        }
        return false;
    }

    static bool SubsetSumVerify(int[] nums, bool[] certificate, int target) {
        int sum = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (certificate[i]) sum += nums[i];
        }
        return sum == target;
    }

    static void Main() {
        int[] sizes = { 10, 15, 20, 25 };

        foreach (int n in sizes) {
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = i + 1;
            int target = n * (n + 1) / 4;

            var sw = Stopwatch.StartNew();
            bool found = SubsetSumSolve(nums, target);
            sw.Stop();
            double solveMs = sw.Elapsed.TotalMilliseconds;

            bool[] cert = new bool[n];
            cert[0] = true;
            sw.Restart();
            SubsetSumVerify(nums, cert, target);
            sw.Stop();
            double verifyMs = sw.Elapsed.TotalMilliseconds;

            Console.WriteLine($"n={n}  Solve: {solveMs:F3}ms  " +
                              $"Verify: {verifyMs:F6}ms  Found: {found}");
        }
    }
}
```

## Summary of Complexity Classes

| Class | Definition | Example |
|-------|-----------|---------|
| **P** | Solvable in poly time | Shortest path |
| **NP** | Verifiable in poly time | Subset Sum |
| **NP-complete** | Hardest in NP; all of NP reduces to it | SAT, 3-SAT, TSP |
| **NP-hard** | At least as hard as NP-complete (may not be in NP) | Halting problem |
| **co-NP** | Complement of NP problems | "Is formula unsatisfiable?" |

## Key Takeaways

- **Decision problems** have yes/no answers and form the foundation of complexity theory.
- **P** contains problems solvable in polynomial time; **NP** contains problems verifiable in polynomial time.
- $P \subseteq NP$ trivially; whether $P = NP$ is the biggest open question in CS.
- A problem is **NP-complete** if it's in NP and every NP problem reduces to it — it's the hardest in NP.
- **Polynomial-time reductions** ($A \leq_P B$) prove hardness: if the source is hard, the target is at least as hard.
- The **Cook-Levin theorem** established SAT as the first NP-complete problem; all others derive from it via reductions.
- Classic NP-complete problems include 3-SAT, Clique, Vertex Cover, Hamiltonian Cycle, Subset Sum, and TSP.
- **Coping strategies** for NP-hard problems: approximation algorithms, heuristics, exploiting special structure, parameterized algorithms, and randomization.
- The fundamental asymmetry of NP: **verifying** is polynomial, **solving** (brute-force) is exponential — this gap is the heart of computational complexity.
