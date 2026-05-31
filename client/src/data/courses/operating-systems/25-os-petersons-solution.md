---
title: "Peterson's Solution"
---

# Peterson's Solution

In the previous lesson, we saw that using only a turn variable or only flags fails to satisfy all three requirements of the critical section problem. **Peterson's Solution** elegantly combines both approaches — intent flags AND a turn variable — to create the first correct software-only solution for two processes. In this lesson, we study the algorithm, formally prove its correctness, trace through its execution, and discuss its limitations on modern hardware.

---

## Peterson's Algorithm

Proposed by **Gary L. Peterson** in 1981, this algorithm solves the critical section problem for two processes using two shared variables.

### Shared Variables

```c
bool flag[2] = {false, false};  /* flag[i] = true means Pi wants to enter */
int turn;                        /* Whose turn it is to enter (tie-breaker) */
```

### The Algorithm

```c
/* Process Pi (where i = 0 or 1, j = 1-i) */
while (true) {
    /* ----- Entry Section ----- */
    flag[i] = true;       /* Step 1: Declare intent to enter */
    turn = j;             /* Step 2: Give the other process priority */
    while (flag[j] && turn == j)
        ;  /* busy wait — wait if other wants in AND it's their turn */

    /* ----- Critical Section ----- */
    critical_section();

    /* ----- Exit Section ----- */
    flag[i] = false;      /* Declare intent to leave */

    /* ----- Remainder Section ----- */
    remainder_section();
}
```

### The Key Insight

The genius of Peterson's Solution is in the line `turn = j`. After declaring "I want to enter" (`flag[i] = true`), the process politely says "but you can go first" (`turn = j`). This **deference** prevents deadlock while still allowing a process to enter if the other doesn't want to.

```text
  Process Pi's entry:
  ┌─────────────────────────────────────────────────┐
  │  1. flag[i] = true    → "I want to enter"      │
  │  2. turn = j          → "But you go first"      │
  │  3. while(flag[j] && turn==j)                    │
  │     Wait IF:                                     │
  │       - Other wants in (flag[j] is true)         │
  │       - AND it's their turn (turn == j)          │
  │     Enter IF:                                    │
  │       - Other doesn't want in (flag[j] is false) │
  │       - OR it's my turn (turn == i)              │
  └─────────────────────────────────────────────────┘
```

---

## Proof of Correctness

We now formally prove that Peterson's Solution satisfies all three requirements.

### Proof of Mutual Exclusion

**Claim:** $P_0$ and $P_1$ cannot both be in their critical sections simultaneously.

**Proof by contradiction:**

Assume both $P_0$ and $P_1$ are in their critical sections. For $P_i$ to enter its CS, the while loop condition must be false, meaning:

- $P_0$ entered CS → $\neg(flag[1] \wedge turn = 1)$ → $flag[1] = false \vee turn = 0$
- $P_1$ entered CS → $\neg(flag[0] \wedge turn = 0)$ → $flag[0] = false \vee turn = 1$

Since both are in CS, both must have set their flags to `true` (Step 1):

- $flag[0] = true$ and $flag[1] = true$

So the conditions simplify to:

- $P_0$ entered because $turn = 0$
- $P_1$ entered because $turn = 1$

But `turn` is a single variable — it cannot be both 0 and 1 simultaneously. **Contradiction!** ∎

| Statement                               | Reason                                               |
| --------------------------------------- | ---------------------------------------------------- |
| Both $P_0$ and $P_1$ in CS (assumption) | For contradiction                                    |
| $flag[0] = true$ and $flag[1] = true$   | Both executed Step 1 before entering                 |
| $P_0$ entered → $turn = 0$              | Since $flag[1] = true$, only $turn = 0$ lets P0 past |
| $P_1$ entered → $turn = 1$              | Since $flag[0] = true$, only $turn = 1$ lets P1 past |
| $turn = 0$ AND $turn = 1$               | Impossible → Contradiction ∎                         |

### Proof of Progress

**Claim:** If the CS is free and some process wants to enter, a process will enter in finite time.

**Proof:**

Suppose $P_i$ wants to enter (sets $flag[i] = true$, $turn = j$). Consider cases:

1. **$flag[j] = false$**: $P_j$ doesn't want to enter. The while condition is immediately false → $P_i$ enters. ✓

2. **$flag[j] = true$**: Both want to enter. `turn` was last set to either $i$ or $j$:
   - If $turn = i$: $P_i$'s condition ($flag[j] \wedge turn = j$) is false → $P_i$ enters. ✓
   - If $turn = j$: $P_j$'s condition ($flag[i] \wedge turn = i$) is false → $P_j$ enters. ✓

In all cases, at least one process enters. The decision is made only by processes wanting to enter (not by processes in their remainder section). ∎

### Proof of Bounded Waiting

**Claim:** After $P_i$ requests entry, $P_j$ can enter at most once before $P_i$ enters.

**Proof:**

After $P_i$ sets $flag[i] = true$ and $turn = j$:

- If $P_j$ is not in CS and not trying, $P_i$ enters immediately.
- If $P_j$ is in CS, it will exit and set $flag[j] = false$. Now $P_i$'s while condition is false → $P_i$ enters.
- If $P_j$ re-enters the entry section, it sets $turn = i$. Now $P_i$'s condition ($flag[j] \wedge turn = j$) is false (since $turn = i \neq j$) → $P_i$ enters.

So after $P_i$ requests entry, $P_j$ enters at most **one more time** before $P_i$ gets in. The bound $B = 1$. ∎

---

## Execution Trace

### Scenario 1: Only P0 Wants to Enter

```text
Time   P0                              P1              flag[0]  flag[1]  turn
────   ──────────────────────          ────              ──────   ──────   ────
 t0    flag[0] = true                  (remainder)      true     false    —
 t1    turn = 1                        (remainder)      true     false    1
 t2    while(flag[1] && turn==1)       (remainder)      true     false    1
       → false (flag[1] is false)
 t3    ENTER CS                                         true     false    1
 t4    ...critical section...                           true     false    1
 t5    flag[0] = false                                  false    false    1
```

P0 enters immediately because P1 doesn't want in ($flag[1] = false$).

### Scenario 2: Both Want to Enter — P0 Sets Turn Last

```text
Time   P0                         P1                      flag[0]  flag[1]  turn
────   ────────────────────       ────────────────────     ──────   ──────   ────
 t0    flag[0] = true                                     true     false    —
 t1                                flag[1] = true          true     true     —
 t2                                turn = 0                true     true     0
 t3    turn = 1                                           true     true     1
 t4    while(flag[1]&&turn==1)    while(flag[0]&&turn==0)
       → TRUE, WAIT               → FALSE (turn=1≠0)
 t5    WAIT                        ENTER CS                true     true     1
 t6    WAIT                        ...critical section...  true     true     1
 t7                                flag[1] = false         true     false    1
 t8    while(flag[1]&&turn==1)
       → FALSE (flag[1] is false)
 t9    ENTER CS                                            true     false    1
```

Both want in; `turn` was set to 1 last (by P0 writing `turn = 1`). Since `turn = 1`, P0 waits (it's P1's turn). P1 enters, finishes, sets $flag[1] = false$, and then P0 enters.

### Scenario 3: Both Want to Enter — P1 Sets Turn Last

```text
Time   P0                         P1                      flag[0]  flag[1]  turn
────   ────────────────────       ────────────────────     ──────   ──────   ────
 t0    flag[0] = true              flag[1] = true          true     true     —
 t1    turn = 1                                           true     true     1
 t2                                turn = 0                true     true     0
 t3    while(flag[1]&&turn==1)    while(flag[0]&&turn==0)
       → FALSE (turn=0≠1)        → TRUE, WAIT
 t4    ENTER CS                    WAIT                    true     true     0
```

Now P0 enters because `turn = 0` (P1's last write made `turn = 0`).

> [!TIP]
> The last process to write `turn = j` is the one that "yields" priority. Whichever process writes `turn` **last** ends up waiting, while the other enters. This is the tie-breaking mechanism.

---

## Limitation: Only Two Processes

Peterson's Solution as presented works for exactly **two** processes. Extending it to $N$ processes requires the **Filter Algorithm**.

---

## Modern Hardware Issue: Instruction Reordering

Peterson's Solution assumes that memory operations occur in **program order**. However, modern CPUs and compilers routinely **reorder instructions** for performance.

### The Problem

```c
/* Process P0 */
flag[0] = true;    /* Write to flag[0] */
turn = 1;          /* Write to turn */
while (flag[1] && turn == 1)
    ;  /* Read flag[1] and turn */
```

A modern CPU might reorder the two writes:

```text
Original order:               Reordered (by CPU):
1. flag[0] = true            1. turn = 1
2. turn = 1                  2. flag[0] = true

This reordering can break mutual exclusion!
```

If the CPU executes `turn = 1` before `flag[0] = true`, there's a window where $P_1$ sees `flag[0] = false` and enters the CS, then $P_0$ also enters — violating mutual exclusion.

### Memory Barriers / Fences

A **memory barrier** (or **fence**) is a hardware instruction that prevents the CPU from reordering memory operations across the barrier.

| Barrier Type                     | Effect                                                |
| -------------------------------- | ----------------------------------------------------- |
| **Full fence** (`mfence` on x86) | No loads or stores can be reordered across this point |
| **Store fence** (`sfence`)       | No stores can be reordered past this point            |
| **Load fence** (`lfence`)        | No loads can be reordered past this point             |

### Fixed Peterson's with Memory Barriers

```c
/* Process Pi */
flag[i] = true;
turn = j;
__sync_synchronize();   /* Full memory barrier (GCC built-in) */
while (flag[j] && turn == j)
    ;

/* Critical Section */
critical_section();

flag[i] = false;
```

### The volatile Keyword

In C, `volatile` prevents the **compiler** from reordering or optimizing away accesses to a variable. However, it does NOT prevent **CPU** reordering.

```c
volatile bool flag[2];   /* Compiler won't optimize away reads/writes */
volatile int turn;       /* But CPU can still reorder! */
```

| Keyword/Mechanism | Prevents Compiler Reordering |    Prevents CPU Reordering     |
| ----------------- | :--------------------------: | :----------------------------: |
| `volatile`        |              ✅              |               ❌               |
| Memory barrier    |              ✅              |               ✅               |
| `atomic` (C11)    |              ✅              | ✅ (with appropriate ordering) |

> [!WARNING]
> On x86, Peterson's Solution often appears to work without barriers because x86 has a relatively strong memory model (Total Store Order). But on ARM, RISC-V, or PowerPC (which have weaker memory models), it will almost certainly fail without barriers.

---

## Filter Algorithm: Peterson's Generalized to N Processes

The **Filter Algorithm** (by Peterson, 1981) extends the two-process solution to $N$ processes using $N-1$ levels.

### Shared Variables

```c
int level[N];     /* level[i] = the current level of process i (0..N-1) */
int victim[N];    /* victim[L] = the process that yields at level L */
/* Initialize: all level[i] = 0 */
```

### The Algorithm

```c
/* Process Pi wants to enter CS */
for (int L = 1; L < N; L++) {
    level[i] = L;
    victim[L] = i;

    /* Wait while there exists some other process at a higher
       or equal level AND I am the victim at this level */
    while (exists_k_ne_i(level[k] >= L) && victim[L] == i)
        ;  /* busy wait */
}

/* Critical Section */
critical_section();

/* Exit */
level[i] = 0;
```

### How the Filter Works

Think of the algorithm as a **tournament** with $N-1$ rounds. At each level, at least one process is filtered out (the victim). After $N-1$ levels, exactly one process remains.

```text
Level 0:  P0  P1  P2  P3  P4    ← All processes start here
              │       │
Level 1:  P0  P1  P2  P3        ← One filtered out (victim)
              │   │
Level 2:  P0  P1  P2            ← Another filtered out
              │
Level 3:  P0  P1                ← Another filtered out
              │
Level 4:  P0                    ← Only one remains → enters CS
```

### Properties of the Filter Algorithm

| Property         | Satisfied? | Explanation                                        |
| ---------------- | ---------- | -------------------------------------------------- |
| Mutual Exclusion | ✅         | At most one process passes through all N-1 levels  |
| Progress         | ✅         | At each level, the victim yields; others advance   |
| Bounded Waiting  | ✅         | A process waits at most $N-1$ passes at each level |
| Fairness         | ⚠️ Limited | Does not guarantee FIFO ordering                   |

---

## Lamport's Bakery Algorithm

For completeness, here is another classical $N$-process solution by **Leslie Lamport** (1974), inspired by take-a-number bakery systems:

```c
bool choosing[N] = {false};
int number[N] = {0};

/* Process Pi */
choosing[i] = true;
number[i] = max(number[0], ..., number[N-1]) + 1;
choosing[i] = false;

for (int j = 0; j < N; j++) {
    while (choosing[j])
        ;  /* Wait for Pj to finish choosing */
    while (number[j] != 0 &&
           (number[j] < number[i] ||
            (number[j] == number[i] && j < i)))
        ;  /* Wait if Pj has lower number (or same number, lower ID) */
}

/* Critical Section */
critical_section();

number[i] = 0;  /* Exit */
```

> "The name derives from bakeries where you take a ticket and wait for your number to be called."
> — _Leslie Lamport_

| Feature          | Filter Algorithm | Bakery Algorithm                    |
| ---------------- | ---------------- | ----------------------------------- |
| Processes        | N                | N                                   |
| Shared variables | $O(N)$           | $O(N)$                              |
| Bounded waiting  | Yes              | Yes (FIFO)                          |
| Fairness         | Limited          | **FIFO** (first-come, first-served) |
| Space complexity | $2N$             | $2N$                                |
| Practical use    | Educational      | Educational                         |

---

## Why Software Solutions Are Rarely Used

Despite their elegance, pure software solutions like Peterson's are rarely used in practice:

| Reason                         | Explanation                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------ |
| **Memory reordering**          | Modern CPUs reorder reads and writes, breaking correctness assumptions         |
| **Busy waiting**               | Threads spin in a loop, wasting CPU cycles                                     |
| **Complexity for N processes** | Algorithms become complex and have high contention                             |
| **Hardware support available** | Modern CPUs provide atomic instructions (CAS, TAS) that are simpler and faster |
| **OS primitives available**    | Mutexes, semaphores, and condition variables are battle-tested                 |

> [!NOTE]
> Peterson's Solution remains important educationally — it teaches the fundamental concepts of flags, turn variables, deference, and correctness proofs that underpin all synchronization mechanisms.

---

## Try It Yourself

**Exercise 1:** Trace through Peterson's Algorithm for the following scenario: P0 and P1 both want to enter the CS. P1 executes `flag[1] = true` and `turn = 0` before P0 executes any entry code. Show the full execution trace.

:::details Solution

```text
Time   P1                         P0                      flag[0]  flag[1]  turn
────   ────────────────────       ────────────────────     ──────   ──────   ────
 t0    flag[1] = true                                     false    true     —
 t1    turn = 0                                           false    true     0
 t2    while(flag[0]&&turn==0)                            false    true     0
       → FALSE (flag[0]=false)
 t3    ENTER CS                                           false    true     0
 t4                                flag[0] = true          true     true     0
 t5                                turn = 1                true     true     1
 t6                                while(flag[1]&&turn==1)
                                   → TRUE (flag[1]=true, turn=1)
 t7    ...in CS...                 WAIT                    true     true     1
 t8    flag[1] = false             WAIT                    true     false    1
 t9                                while(flag[1]&&turn==1)
                                   → FALSE (flag[1]=false)
 t10                               ENTER CS                true     false    1
```

P1 enters first because P0 hasn't declared intent yet. P0 waits until P1 finishes.
:::

**Exercise 2:** What happens in Peterson's Solution if we swap the two lines in the entry section (i.e., `turn = j` before `flag[i] = true`)? Does mutual exclusion still hold?

:::details Solution

```c
/* MODIFIED (incorrect) order */
turn = j;             /* Step 1: set turn FIRST */
flag[i] = true;       /* Step 2: declare intent SECOND */
while (flag[j] && turn == j) ;
```

**Mutual exclusion is VIOLATED.** Consider:

```text
t0: P0 executes turn = 1
t1: P1 executes turn = 0
t2: P1 executes flag[1] = true
t3: P1 checks: while(flag[0] && turn==0) → FALSE (flag[0] is still false!)
t4: P1 ENTERS CS
t5: P0 executes flag[0] = true
t6: P0 checks: while(flag[1] && turn==1) → turn=0, not 1 → FALSE
t7: P0 ENTERS CS ← BOTH IN CS! VIOLATION!
```

The problem is that between `turn = j` and `flag[i] = true`, the other process can see our flag as false and enter. The order matters: **intent first, then deference**.
:::

---

## Key Takeaways

- **Peterson's Solution** combines two ideas: **intent flags** (declaring desire to enter) and a **turn variable** (yielding priority to the other).
- The algorithm satisfies all three requirements: **Mutual Exclusion** (proven by contradiction — `turn` can't be two values), **Progress** (at least one enters when CS is free), and **Bounded Waiting** (at most one other entry before a requester gets in).
- The "last writer of `turn` waits" principle is the elegant tie-breaking mechanism that prevents deadlock.
- Peterson's Solution works only for **two processes**. The **Filter Algorithm** and **Bakery Algorithm** generalize to $N$ processes.
- On **modern hardware**, instruction reordering by CPUs breaks Peterson's correctness. **Memory barriers** (`mfence`) or **C11 atomics** are required to fix this.
- `volatile` prevents compiler reordering but does NOT prevent CPU reordering — it is insufficient on its own.
- Pure software solutions are primarily of **educational value** today — practical systems use hardware atomic instructions and OS-provided synchronization primitives.
