---
title: Turing Machine Design and Examples
---

# Turing Machine Design and Examples

In this lesson, you will develop **TM design skills** through a series of progressively complex examples. By the end, you'll be able to design Turing Machines for a wide variety of languages — including some that are beyond the reach of pushdown automata.

---

## TM Design Methodology

When designing a Turing Machine, follow this approach:

### Step 1: Think Algorithmically

Before worrying about states and transitions, describe the algorithm in plain English:
- What does the machine need to "remember"?
- What are the high-level phases of computation?
- How does it use the tape as scratch space?

### Step 2: Choose Tape Symbols

Decide what extra symbols (beyond the input alphabet) you need:
- Markers for "crossed off" or "visited" symbols
- Separators
- Counting marks

### Step 3: Identify States

Each state should correspond to a clear "mode" of operation:
- "Scanning right looking for the first unmarked $b$"
- "Moving left to return to the start"
- "Comparing: I'm carrying a $1$ and looking for a match"

### Step 4: Write Transitions

For each (state, symbol) pair, determine what to write, where to move, and which state to enter next.

### Step 5: Trace Examples

Verify your design by tracing on both accepting and rejecting inputs.

---

## Example 1: $L = \{a^{2^n} \mid n \geq 0\}$ — Powers of 2

### The Language

$$L = \{a, aa, aaaa, aaaaaaaa, \ldots\} = \{a^1, a^2, a^4, a^8, \ldots\}$$

The string length must be a power of 2.

### Algorithm (High-Level)

1. If the string has length 1 ($a$), accept.
2. If the string has odd length greater than 1, reject.
3. Cross off every other $a$ (halving the count of unmarked $a$'s).
4. Return to the beginning and repeat from step 1.

Each pass halves the count. If we always get even counts until we reach 1, the original was a power of 2.

### Implementation Details

**Tape alphabet:** $\Gamma = \{a, X, \sqcup\}$

**States:**
- $q_0$: Start of a new pass; check if only one $a$ remains
- $q_1$: Scan right, crossing off every other $a$ (this is the "odd position" state)
- $q_2$: Scan right, passing over an $a$ without crossing it (this is the "even position" state)
- $q_3$: Scan left to return to beginning
- $q_{accept}$: String length is a power of 2
- $q_{reject}$: String length is not a power of 2

### Transition Table

| State | Read | Write | Move | Next | Comment |
|-------|------|-------|------|------|---------|
| $q_0$ | $a$ | $X$ | $R$ | $q_1$ | Mark first $a$, start pass |
| $q_0$ | $X$ | $X$ | $R$ | $q_0$ | Skip crossed-off |
| $q_0$ | $\sqcup$ | $\sqcup$ | — | $q_{reject}$ | Empty string (length 0) |
| $q_1$ | $a$ | $a$ | $R$ | $q_2$ | Skip (don't cross off) |
| $q_1$ | $X$ | $X$ | $R$ | $q_1$ | Skip crossed-off |
| $q_1$ | $\sqcup$ | $\sqcup$ | — | $q_{accept}$ | Only one $a$ was left → accept |
| $q_2$ | $a$ | $X$ | $R$ | $q_1$ | Cross off every other $a$ |
| $q_2$ | $X$ | $X$ | $R$ | $q_2$ | Skip crossed-off |
| $q_2$ | $\sqcup$ | $\sqcup$ | $L$ | $q_3$ | End of string, go back |
| $q_3$ | $a, X$ | same | $L$ | $q_3$ | Scan left |
| $q_3$ | $\sqcup$ | $\sqcup$ | $R$ | $q_0$ | Back at start, new pass |

Wait — we need to handle the case where the count is odd (and > 1). In state $q_1$, if we reach $\sqcup$ and we already crossed off at least one $a$ in this pass (meaning we're in $q_1$ after having been in $q_2$), that means odd count. Let me refine:

Actually, the key insight: if we end a pass in state $q_1$ (expecting to see another $a$ to skip), the count was odd. If we end in state $q_2$ after having crossed off at least 2, the count was even but not 1. Let me adjust:

- $q_1$ after crossing first: if $\sqcup$ → only 1 $a$ remaining (accept if this is the only surviving one from original)

Let me simplify with a clean version:

**Refined states:**
- $q_0$: Start pass, skip $X$'s to find first $a$
- $q_1$: Found first $a$ (crossed it off). Now alternate skipping/crossing.
- $q_2$: "Even position" — next $a$ should be crossed off
- $q_3$: "Odd position" — next $a$ should be kept
- $q_4$: Return to start

Actually, let me use the classic textbook version:

**Algorithm (Sipser's version):**
1. Sweep left to right, crossing off every other $a$.
2. If in step 1 the tape had exactly one $a$: accept.
3. If in step 1 the tape had an odd number of $a$'s greater than 1: reject.
4. Return head to left end.
5. Go to step 1.

### Trace on Input $aaaa$ (Accept)

**Pass 1:** Start with $aaaa$ (4 $a$'s)
- Cross off positions 1 and 3: $XaXa$ → 2 unmarked $a$'s remain

**Pass 2:** Working with the 2 remaining $a$'s
- Cross off 1 of the 2: $XXXa$ → 1 unmarked $a$ remains

**Pass 3:** Only 1 $a$ left → **Accept!** ✓

($4 \to 2 \to 1$ — halving works perfectly since $4 = 2^2$.)

### Trace on Input $aaa$ (Reject)

**Pass 1:** Start with $aaa$ (3 $a$'s)
- Cross off positions 1 and 3: $XaX$ → wait, that leaves 1 remaining but we crossed off 2, meaning the original count was odd (3). Since $3 > 1$ and odd → **Reject!** ✗

($3$ is not a power of 2.)

### Detailed Configuration Trace ($aaaa$)

| Step | Configuration | Note |
|------|---------------|------|
| 0 | $q_0 \, aaaa$ | Start pass 1 |
| 1 | $X \, q_1 \, aaa$ | Cross first $a$ |
| 2 | $Xa \, q_2 \, aa$ | Skip one (keep) |
| 3 | $XaX \, q_1 \, a$ | Cross one |
| 4 | $XaXa \, q_2 \, \sqcup$ | Skip one (keep); end of string |
| 5 | (scan left to start) | Return to beginning |
| 6 | $q_0 \, XaXa$ | Start pass 2 |
| 7 | $X \, q_0 \, aXa$ | Skip $X$ |
| 8 | $XX \, q_1 \, Xa$ | Cross $a$, skip $X$ |
| 9 | $XXX \, q_1 \, a$ | (skipped $X$) |
| 10 | $XXXa \, q_2 \, \sqcup$ | Keep this $a$; end |
| 11 | (scan left) | Return |
| 12 | $q_0 \, XXXa$ | Pass 3: find only 1 $a$ |
| 13 | Accept! | ✓ |

---

## Example 2: Palindrome Checking

### The Language

$$L = \{w \in \{a, b\}^* \mid w = w^R\}$$

Examples: $\varepsilon$, $a$, $b$, $aa$, $aba$, $abba$, $abcba$, ...

### Algorithm

1. Read the first symbol of the input. Remember it (in the state). Cross it off.
2. Move all the way to the rightmost uncrossed symbol.
3. If it matches the remembered symbol: cross it off, move back to the left.
4. If it doesn't match: reject.
5. Repeat until all symbols are crossed off (accept) or a mismatch is found (reject).

### Key Design Choices

- **States encode the "remembered" symbol:** We need separate states for "carrying an $a$" and "carrying a $b$."
- **Tape markers:** Use $X$ to mark crossed-off positions.
- **Termination:** When the head finds that all symbols between the ends are crossed off, the string is a palindrome.

### States

- $q_0$: Start — read and remember first symbol
- $q_a$: Carrying $a$, scanning right to end
- $q_b$: Carrying $b$, scanning right to end
- $q_3$: Match found, scanning left to start
- $q_{accept}$, $q_{reject}$

### Selected Transitions

| State | Read | Action | Next |
|-------|------|--------|------|
| $q_0$ | $a$ | Write $X$, R | $q_a$ |
| $q_0$ | $b$ | Write $X$, R | $q_b$ |
| $q_0$ | $X$ | R | $q_0$ |
| $q_0$ | $\sqcup$ | — | $q_{accept}$ |
| $q_a$ | $a,b$ | R | $q_a$ |
| $q_a$ | $\sqcup$ | L | $q_{a2}$ |
| $q_{a2}$ | $X$ | L | $q_{a2}$ |
| $q_{a2}$ | $a$ | Write $X$, L | $q_3$ |
| $q_{a2}$ | $b$ | — | $q_{reject}$ |
| $q_{a2}$ | $\sqcup$ | — | $q_{accept}$ |
| $q_3$ | $a,b,X$ | L | $q_3$ |
| $q_3$ | $\sqcup$ | R | $q_0$ |

(Symmetric transitions for $q_b$.)

### Trace on $abba$

1. Read $a$ from left. Scan right. Last symbol is $a$. Match! ✓
2. Read $b$ from left (position 2). Scan right. Last uncrossed is $b$. Match! ✓
3. All crossed off → **Accept!**

### Trace on $aba$

1. Read $a$ from left. Last uncrossed is $a$. Match! ✓
2. Only $b$ remains in the middle → single symbol → **Accept!**

(A single remaining symbol is always a palindrome.)

---

## Example 3: $L = \{a^n b^n c^n \mid n \geq 0\}$

### Why This Matters

This language is **not context-free** (we proved this with the Pumping Lemma). But a Turing Machine can decide it! This demonstrates that TMs are strictly more powerful than PDAs.

### Algorithm

1. If the tape is empty (or starts with $\sqcup$): accept ($n = 0$).
2. Scan to verify the input is of the form $a^* b^* c^*$ (reject if symbols are out of order).
3. On each pass:
   - Cross off one $a$ (the leftmost unmarked $a$)
   - Cross off one $b$ (the leftmost unmarked $b$)
   - Cross off one $c$ (the leftmost unmarked $c$)
4. Repeat until:
   - All three are exhausted simultaneously → **accept**
   - One runs out before the others → **reject**

### Implementation

**Tape alphabet:** $\Gamma = \{a, b, c, X, \sqcup\}$

**States:**
- $q_0$: Find and cross off leftmost $a$
- $q_1$: Scan right to find and cross off leftmost $b$
- $q_2$: Scan right to find and cross off leftmost $c$
- $q_3$: Scan left to return to start (beginning of next pass)
- $q_4$: Verify all symbols are crossed off
- $q_{accept}$, $q_{reject}$

### Key Transitions

| State | Read | Action | Next | Comment |
|-------|------|--------|------|---------|
| $q_0$ | $a$ | Write $X$, R | $q_1$ | Cross off an $a$ |
| $q_0$ | $X$ | R | $q_0$ | Skip previously crossed |
| $q_0$ | $b$ | — | $q_4$ | No more $a$'s; check all done |
| $q_0$ | $\sqcup$ | — | $q_{accept}$ | Empty input |
| $q_1$ | $a, X$ | R | $q_1$ | Skip to find $b$ |
| $q_1$ | $b$ | Write $X$, R | $q_2$ | Cross off a $b$ |
| $q_1$ | $c, \sqcup$ | — | $q_{reject}$ | No $b$ to match |
| $q_2$ | $b, X$ | R | $q_2$ | Skip to find $c$ |
| $q_2$ | $c$ | Write $X$, L | $q_3$ | Cross off a $c$ |
| $q_2$ | $\sqcup$ | — | $q_{reject}$ | No $c$ to match |
| $q_3$ | any | L | $q_3$ | Scan all the way left |
| $q_3$ | $\sqcup$ | R | $q_0$ | Restart pass |
| $q_4$ | $X$ | R | $q_4$ | Verify remaining are all $X$ |
| $q_4$ | $\sqcup$ | — | $q_{accept}$ | All matched perfectly |
| $q_4$ | $b,c$ | — | $q_{reject}$ | Leftover symbols |

### Trace on $aabbcc$

| Pass | Tape Before | Cross Off | Tape After |
|------|-------------|-----------|------------|
| 1 | $aabbcc$ | 1st $a$, 1st $b$, 1st $c$ | $XaXbXc$ |
| 2 | $XaXbXc$ | 2nd $a$, 2nd $b$, 2nd $c$ | $XXXXXX$ |
| 3 | $XXXXXX$ | No more $a$'s, check all $X$ | Accept ✓ |

### Trace on $aabbc$ (Reject)

| Pass | Tape Before | Action | Result |
|------|-------------|--------|--------|
| 1 | $aabbc$ | Cross $a$, $b$, $c$ | $XaXbX$ |
| 2 | $XaXbX$ | Cross $a$, look for $b$... found $b$, cross. Look for $c$... hit $\sqcup$ → **Reject** ✗ |

---

## Example 4: Unary Addition — $1^m 0 1^n \to 1^{m+n}$

### Problem

This is a TM that **computes a function** rather than deciding a language. Input: $1^m 0 1^n$. Output: $1^{m+n}$ left on the tape.

### Algorithm

1. Find the $0$ separator.
2. Replace it with $1$ (this adds the two blocks together, but we have one extra $1$).
3. Go to the rightmost $1$ and erase it (replace with $\sqcup$).

Wait, that gives $m + n + 1 - 1 = m + n$. But simpler:

1. Replace the $0$ with $1$.
2. Move to the far right end of the $1$'s.
3. Replace the last $1$ with $\sqcup$.
4. Halt (tape now contains $1^{m+n}$).

### States

- $q_0$: Scan right to find $0$
- $q_1$: Replace $0$ with $1$, continue right to end
- $q_2$: At end, erase last $1$
- $q_{halt}$: Done

### Trace on $11011$ ($m=2$, $n=2$)

| Step | Tape | State | Action |
|------|------|-------|--------|
| 0 | $\underline{1}1011$ | $q_0$ | Scan right for $0$ |
| 1 | $1\underline{1}011$ | $q_0$ | Keep scanning |
| 2 | $11\underline{0}11$ | $q_0$ | Found $0$! |
| 3 | $11\underline{1}11$ | $q_1$ | Replace with $1$, scan right |
| 4 | $111\underline{1}1$ | $q_1$ | Keep scanning |
| 5 | $1111\underline{1}$ | $q_1$ | Keep scanning |
| 6 | $11111\underline{\sqcup}$ | $q_1$ | Hit blank, move left |
| 7 | $1111\underline{1}$ | $q_2$ | Erase last $1$ |
| 8 | $1111\underline{\sqcup}$ | $q_{halt}$ | Done! Tape: $1111 = 1^4$ ✓ |

Result: $1^2 + 1^2 = 1^4$. ✓ ($2 + 2 = 4$)

---

## Example 5: Copy Machine — $w \to w\#w$

### Problem

Input: $w \in \{0, 1\}^*$. Output: $w\#w$ on the tape.

### Algorithm

1. Place a $\#$ marker at the end of $w$.
2. For each symbol in $w$ (left to right):
   - Read it and remember it (in state).
   - Mark it (so we know it's been copied).
   - Move right past $\#$ to the first blank after the copy area.
   - Write the remembered symbol there.
   - Return left to the next unmarked symbol in $w$.
3. After all symbols are copied, unmark all symbols in the left half.
4. Halt.

### Tape Alphabet

$\Gamma = \{0, 1, \hat{0}, \hat{1}, \#, \sqcup\}$

We use $\hat{0}$ and $\hat{1}$ as "marked" versions of $0$ and $1$.

### Key Phases

**Phase 1:** Write $\#$ at end of input.
- Scan right to blank, write $\#$.

**Phase 2:** Copy loop.
- Go back to leftmost unmarked symbol.
- Mark it ($0 \to \hat{0}$ or $1 \to \hat{1}$), remember its value.
- Scan right past $\#$, past already-copied symbols, to first blank.
- Write the remembered symbol.
- Return to left for next iteration.

**Phase 3:** Cleanup — replace $\hat{0} \to 0$ and $\hat{1} \to 1$.

### Trace on $01$

| Phase | Tape State |
|-------|------------|
| Input | $01\sqcup$ |
| After Phase 1 | $01\#\sqcup$ |
| Copy '0' | $\hat{0}1\#0\sqcup$ |
| Copy '1' | $\hat{0}\hat{1}\#01\sqcup$ |
| Cleanup | $01\#01\sqcup$ |
| Done! | Output: $01\#01$ ✓ |

---

## Example 6: Primality Testing (High-Level)

### The Language

$$L = \{w \in \{0, 1\}^* \mid w \text{ represents a prime number in binary}\}$$

### High-Level TM Description

On input $w$ (binary representation of $n$):

1. Check if $n \leq 1$: if so, reject (not prime).
2. Check if $n = 2$: if so, accept.
3. Check if $n$ is even ($n > 2$): if so, reject.
4. For each $d$ from 3 to $\lfloor\sqrt{n}\rfloor$ (odd values only):
   a. Compute $n \mod d$ (using repeated subtraction or long division on the tape).
   b. If $n \mod d = 0$: reject ($n$ is composite).
5. If no divisor found: accept ($n$ is prime).

### Why This Works

- The algorithm always halts (finite loop from 3 to $\sqrt{n}$)
- It correctly identifies primes
- It's a **decider** (never loops)
- It demonstrates that TMs can perform arithmetic

### Implementation Challenges

Actually implementing this requires:
- Binary arithmetic subroutines (comparison, division, square root)
- Multi-tape simulation on single tape (for workspace)
- The formal TM would have hundreds of states

This is why we use **high-level descriptions** — the formal details are tedious but always constructible.

---

## Subroutines in Turing Machines

Just like in programming, we can design TMs **modularly** using subroutines.

### How Subroutines Work

A subroutine is a TM that:
1. Is "called" by entering its start state
2. Performs its task
3. "Returns" by entering a special return state (instead of $q_{accept}$)
4. The calling TM resumes from where the subroutine left off

### Example: Using Copy as a Subroutine

If we need a TM that checks $w = w$ (trivially true), we might:
1. Call the **Copy** subroutine to produce $w\#w$
2. Call the **Equality Check** subroutine (like our $w\#w$ example from last lesson)

### Common Subroutines

| Subroutine | Function |
|------------|----------|
| Copy | $w \to w\#w$ |
| Shift Right | Move tape contents one cell right |
| Shift Left | Move tape contents one cell left |
| Compare | Check if two marked regions are equal |
| Increment | Add 1 to a binary number |
| Decrement | Subtract 1 from a binary number |

Using subroutines, complex TMs become manageable — just as complex programs are built from functions.

---

## Design Tips and Patterns

### Pattern 1: Mark and Sweep

Cross off symbols to keep track of what's been processed. Use different markers for different purposes.

**Use for:** Matching problems ($a^n b^n c^n$), counting, elimination.

### Pattern 2: Zig-Zag

Move back and forth across the tape, comparing or transferring information.

**Use for:** Equality checking ($w\#w$), palindromes, copying.

### Pattern 3: State as Memory

Use states to "remember" a finite amount of information (like which symbol you just read).

**Use for:** Symbol-by-symbol comparison, simple counting (mod $k$).

### Pattern 4: Shifting

Move a block of tape content left or right to make room or close gaps.

**Use for:** Insertion, deletion, output formatting.

### Pattern 5: Multiple Passes

Process the input in several sweeps, each pass doing one simple task.

**Use for:** Complex computations broken into phases.

---

## Try It Yourself

### Exercise 1

Design a TM (high-level) for $L = \{a^n b^{2n} \mid n \geq 0\}$.

<details>
<summary>Solution</summary>

**Algorithm:**
1. If input is empty, accept ($n = 0$).
2. On each pass:
   - Cross off one $a$
   - Cross off two $b$'s
3. After all $a$'s are gone, verify no $b$'s remain.

This always halts and correctly decides $L$.

</details>

### Exercise 2

Design a TM for $L = \{w \in \{0,1\}^* \mid w \text{ has equal numbers of 0's and 1's}\}$.

<details>
<summary>Solution</summary>

**Algorithm:**
1. Find the leftmost uncrossed $0$. If none exists, check that no uncrossed $1$'s remain (accept if true, reject if false).
2. Cross off the $0$.
3. Scan for the leftmost uncrossed $1$. If none exists, reject.
4. Cross off the $1$.
5. Return to start. Go to step 1.

This repeatedly pairs up $0$'s and $1$'s. If they exhaust simultaneously, accept.

</details>

### Exercise 3

Is the following TM a decider?

$M$: On input $w$:
1. If $w = \varepsilon$, accept.
2. Cross off the first and last symbols.
3. If they were the same, go to step 1 with the remaining string.
4. If they were different, reject.

<details>
<summary>Solution</summary>

Yes, $M$ is a decider. On each iteration, the string gets shorter by 2 (or 1 if odd length). Since the string is finite, the process must terminate. The machine either:
- Accepts (string is empty, meaning palindrome)
- Accepts (single symbol left after all comparisons, also palindrome)
- Rejects (mismatch found)

It never loops. So $M$ is a decider for the palindrome language.

</details>

### Exercise 4

Design a TM that takes input $1^n$ and outputs $1^{n^2}$ (squares a unary number).

<details>
<summary>Hint</summary>

Use the identity $n^2 = 1 + 3 + 5 + \cdots + (2n-1)$.

Or: copy $n$ copies of $n$ (using the copy subroutine $n$ times). Place $n$ copies of $1^n$ on the tape.

High-level: For each $a$ in the input, append $n$ ones to the output area. This requires counting the input length and using it repeatedly.

</details>

---

## Summary

| Example | Language/Task | Key Technique |
|---------|--------------|---------------|
| Powers of 2 | $\{a^{2^n}\}$ | Repeated halving (mark & sweep) |
| Palindrome | $\{w = w^R\}$ | Zig-zag comparison |
| $a^n b^n c^n$ | Beyond CFL | Triple cross-off (multi-pass) |
| Unary addition | $1^m 0 1^n \to 1^{m+n}$ | Replace & erase |
| Copy | $w \to w\#w$ | Mark, carry, write |
| Primality | Primes in binary | Arithmetic subroutines |

### Design Principles

1. **Think algorithmically first**, then formalize.
2. Use **states to encode finite memory** (what symbol was read, which phase we're in).
3. Use **tape marks** to track progress across multiple passes.
4. Build complex TMs from **subroutines**.
5. Always verify: does the machine **halt on all inputs** (if you want a decider)?

---

## What's Next?

We've seen how to design TMs for specific languages. But how powerful are they really? In the next lessons, we'll explore **TM variants** (multi-tape, nondeterministic) and prove they're all equivalent in power, leading to the remarkable **Church-Turing Thesis**.
