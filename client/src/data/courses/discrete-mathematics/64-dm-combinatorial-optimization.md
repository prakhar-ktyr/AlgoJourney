---
title: Combinatorial Optimization
---

# Combinatorial Optimization

Combinatorial optimization is the study of finding the best solution from a finite (but typically very large) set of possible solutions. Unlike continuous optimization where calculus applies, combinatorial optimization deals with discrete structures — selecting subsets, orderings, or assignments that maximize or minimize an objective function subject to constraints.

## Optimization Over Discrete Structures

### What Makes It Different?

In continuous optimization, we can use gradients to "slide" toward the optimum. In combinatorial optimization:
- The solution space is discrete (no derivatives)
- The number of feasible solutions is often exponential: $O(2^n)$ or $O(n!)$
- Exhaustive search is usually infeasible
- We need clever algorithmic strategies

### Common Problem Types

| Problem | Decision | Solution Space |
|---------|----------|---------------|
| Knapsack | Which items to take? | $2^n$ subsets |
| Traveling Salesman | Which order to visit cities? | $n!$ permutations |
| Graph Coloring | Which color per vertex? | $k^n$ colorings |
| Scheduling | Which job at which time? | Complex combinations |
| Minimum Spanning Tree | Which edges to include? | All spanning trees |

### Objective Function and Constraints

Every optimization problem has:
- **Decision variables**: what we control (e.g., include item $i$ or not)
- **Objective function**: what we want to optimize (maximize profit, minimize cost)
- **Constraints**: rules the solution must satisfy (weight limit, time limit)

Formally:

$$\text{minimize (or maximize) } f(x)$$
$$\text{subject to } x \in S$$

where $S$ is the set of feasible solutions.

## Greedy Algorithms

### The Greedy Approach

A **greedy algorithm** builds a solution step by step, making the locally optimal choice at each step, hoping this leads to a globally optimal solution.

**When greedy works:**
- The problem has the **greedy choice property**: a locally optimal choice leads to a globally optimal solution
- The problem has **optimal substructure**: an optimal solution contains optimal solutions to subproblems

### Activity Selection Problem

**Problem**: Given $n$ activities with start and finish times, select the maximum number of non-overlapping activities.

**Greedy strategy**: Always pick the activity that finishes earliest among compatible activities.

**Why it works**: By finishing early, we leave the most room for remaining activities.

**Algorithm**:
1. Sort activities by finish time
2. Select the first activity
3. For each subsequent activity, select it if its start time $\geq$ the finish time of the last selected activity

**Time complexity**: $O(n \log n)$ for sorting + $O(n)$ for selection = $O(n \log n)$

### Fractional Knapsack

**Problem**: Given items with weights $w_i$ and values $v_i$, and a knapsack of capacity $W$, maximize value. You can take fractions of items.

**Greedy strategy**: Sort by value-to-weight ratio $\frac{v_i}{w_i}$ in descending order. Take items greedily, taking a fraction of the last item if needed.

**Why it works**: Taking the highest value-per-weight first maximizes the rate at which we fill value into the knapsack.

**Note**: This does NOT work for 0-1 knapsack (where you must take whole items). Example:
- Capacity $W = 10$
- Item A: weight 6, value 6 (ratio 1.0)
- Item B: weight 5, value 5 (ratio 1.0)
- Item C: weight 5, value 5 (ratio 1.0)
- Greedy takes A first → can only fit one of B or C → value 11
- Optimal: take B + C → value 10... actually greedy is right here

Better counterexample:
- Capacity $W = 10$
- Item A: weight 6, value 7 (ratio 1.17)
- Item B: weight 5, value 5 (ratio 1.0)
- Item C: weight 5, value 5 (ratio 1.0)
- Greedy takes A → remaining capacity 4, can't fit B or C → value 7
- Optimal: take B + C → value 10

## Dynamic Programming

### The DP Approach

**Dynamic programming** solves optimization problems by:
1. Breaking the problem into overlapping subproblems
2. Solving each subproblem once and storing the result
3. Combining subproblem solutions to build the optimal solution

**Two key properties**:
- **Optimal substructure**: optimal solution contains optimal solutions to subproblems
- **Overlapping subproblems**: the same subproblems are solved multiple times in a naive recursive approach

### 0-1 Knapsack Problem

**Problem**: Given $n$ items with weights $w_i$ and values $v_i$, and a knapsack capacity $W$, find the maximum value achievable by selecting whole items (no fractions).

**DP formulation**:

Let $dp[i][j]$ = maximum value using items $1, \ldots, i$ with capacity $j$.

**Recurrence**:

$$dp[i][j] = \begin{cases} dp[i-1][j] & \text{if } w_i > j \text{ (can't take item } i\text{)} \\ \max(dp[i-1][j], \; dp[i-1][j - w_i] + v_i) & \text{otherwise} \end{cases}$$

**Base case**: $dp[0][j] = 0$ for all $j$ (no items → zero value)

**Answer**: $dp[n][W]$

**Time complexity**: $O(nW)$ — pseudo-polynomial (depends on value of $W$, not just input size)

**Space optimization**: since each row only depends on the previous row, we can use a 1D array updated right-to-left.

### Longest Common Subsequence (LCS)

**Problem**: Given two sequences $X = x_1, \ldots, x_m$ and $Y = y_1, \ldots, y_n$, find the longest subsequence common to both.

**DP formulation**:

Let $dp[i][j]$ = length of LCS of $X[1..i]$ and $Y[1..j]$.

**Recurrence**:

$$dp[i][j] = \begin{cases} dp[i-1][j-1] + 1 & \text{if } x_i = y_j \\ \max(dp[i-1][j], \; dp[i][j-1]) & \text{otherwise} \end{cases}$$

**Base case**: $dp[0][j] = dp[i][0] = 0$

**Time complexity**: $O(mn)$

**Example**: $X = $ "ABCBDAB", $Y = $ "BDCAB"
- LCS = "BCAB" (length 4)

## Greedy vs Dynamic Programming

| Aspect | Greedy | Dynamic Programming |
|--------|--------|-------------------|
| **Approach** | Make locally optimal choice | Consider all subproblem solutions |
| **Optimality** | Not always optimal | Always optimal (if applicable) |
| **Time** | Usually faster | Usually slower |
| **Space** | Usually $O(1)$ extra | Often $O(n \times W)$ or similar |
| **When to use** | Greedy choice property holds | Overlapping subproblems + optimal substructure |
| **Proof needed** | Must prove greedy works | Correctness follows from recurrence |

### Decision Guide

1. Can you make a greedy choice that never needs revision? → **Greedy**
2. Does the problem have overlapping subproblems? → **DP**
3. Is the greedy solution provably optimal? → **Greedy** (faster)
4. Counterexample to greedy exists? → **DP** (or other approach)

## Branch and Bound

### Concept

**Branch and bound** is a systematic enumeration technique for solving combinatorial optimization problems exactly.

**Key ideas**:
1. **Branch**: divide the problem into smaller subproblems (like a decision tree)
2. **Bound**: compute bounds on the best possible solution in each branch
3. **Prune**: if a branch's bound is worse than the best known solution, skip it entirely

### How It Works

1. Start with the full problem
2. **Branch**: split into subproblems (e.g., include item $i$ vs. exclude item $i$)
3. For each subproblem, compute:
   - A **lower bound** (for minimization) or **upper bound** (for maximization) on the best solution in that branch
4. If the bound is worse than the current best solution, **prune** the branch
5. Otherwise, recurse

### Example: 0-1 Knapsack

For knapsack, we can use the fractional knapsack solution as an upper bound:
- The fractional solution $\geq$ the 0-1 solution (fractions only help)
- If the fractional bound for a branch is worse than our current best integer solution, prune

Branch and bound can be exponential in the worst case but often performs well in practice.

## Integer Linear Programming (ILP)

### Concept

**Linear Programming (LP)** optimizes a linear objective subject to linear constraints:

$$\text{maximize } c^T x$$
$$\text{subject to } Ax \leq b, \; x \geq 0$$

**Integer Linear Programming (ILP)** adds the constraint that some or all variables must be integers:

$$x_i \in \mathbb{Z}$$

### Why ILP Matters

Many combinatorial problems can be formulated as ILPs:
- **Knapsack**: $x_i \in \{0, 1\}$, maximize $\sum v_i x_i$, subject to $\sum w_i x_i \leq W$
- **TSP**: binary variables for edge inclusion
- **Scheduling**: binary assignment variables

### LP Relaxation

Solving the LP relaxation (allowing fractional values) gives a bound on the ILP solution:
- For maximization: LP optimum $\geq$ ILP optimum
- This bound is used in branch and bound

ILP is NP-hard in general, but modern solvers (Gurobi, CPLEX) handle large instances effectively.

## Approximation Algorithms

### Motivation

For NP-hard problems, finding exact solutions is infeasible for large inputs. **Approximation algorithms** find solutions that are guaranteed to be within a factor of optimal.

### Approximation Ratio

An algorithm has approximation ratio $\alpha$ if for all instances:

$$\frac{\text{ALG}}{\text{OPT}} \geq \alpha \quad \text{(for maximization, } \alpha \leq 1\text{)}$$

$$\frac{\text{ALG}}{\text{OPT}} \leq \alpha \quad \text{(for minimization, } \alpha \geq 1\text{)}$$

### Examples

| Problem | Algorithm | Ratio |
|---------|-----------|-------|
| Vertex Cover | Take both endpoints of any edge | 2-approximation |
| TSP (triangle ineq.) | Christofides' algorithm | 1.5-approximation |
| Set Cover | Greedy (pick largest set) | $O(\ln n)$-approximation |
| MAX-SAT | Random assignment | 0.5-approximation |

### Polynomial-Time Approximation Scheme (PTAS)

A PTAS achieves a $(1 + \epsilon)$-approximation for any fixed $\epsilon > 0$, in time polynomial in $n$ (but possibly exponential in $1/\epsilon$).

Example: the 0-1 knapsack problem has a fully polynomial-time approximation scheme (FPTAS) — polynomial in both $n$ and $1/\epsilon$.

## Code: Knapsack DP Solution

### C++

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Item {
    int weight;
    int value;
    string name;
};

int knapsack(vector<Item>& items, int capacity) {
    int n = items.size();
    // dp[i][w] = max value using first i items with capacity w
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= capacity; w++) {
            // Don't take item i
            dp[i][w] = dp[i - 1][w];
            // Take item i (if it fits)
            if (items[i - 1].weight <= w) {
                dp[i][w] = max(dp[i][w],
                    dp[i - 1][w - items[i - 1].weight] + items[i - 1].value);
            }
        }
    }

    // Backtrack to find which items were selected
    cout << "Selected items: ";
    int w = capacity;
    for (int i = n; i >= 1; i--) {
        if (dp[i][w] != dp[i - 1][w]) {
            cout << items[i - 1].name << " ";
            w -= items[i - 1].weight;
        }
    }
    cout << endl;

    return dp[n][capacity];
}

int main() {
    vector<Item> items = {
        {2, 3, "A"},
        {3, 4, "B"},
        {4, 5, "C"},
        {5, 8, "D"},
        {9, 10, "E"}
    };
    int capacity = 10;

    int maxValue = knapsack(items, capacity);
    cout << "Maximum value: " << maxValue << endl;
    cout << "Knapsack capacity: " << capacity << endl;

    return 0;
}
```

### C#

```csharp
using System;
using System.Collections.Generic;

class Knapsack
{
    static int Solve(int[] weights, int[] values, string[] names, int capacity)
    {
        int n = weights.Length;
        int[,] dp = new int[n + 1, capacity + 1];

        // Fill DP table
        for (int i = 1; i <= n; i++)
        {
            for (int w = 0; w <= capacity; w++)
            {
                dp[i, w] = dp[i - 1, w]; // Don't take item i
                if (weights[i - 1] <= w)
                {
                    dp[i, w] = Math.Max(dp[i, w],
                        dp[i - 1, w - weights[i - 1]] + values[i - 1]);
                }
            }
        }

        // Backtrack to find selected items
        Console.Write("Selected items: ");
        int remaining = capacity;
        for (int i = n; i >= 1; i--)
        {
            if (dp[i, remaining] != dp[i - 1, remaining])
            {
                Console.Write($"{names[i - 1]} ");
                remaining -= weights[i - 1];
            }
        }
        Console.WriteLine();

        return dp[n, capacity];
    }

    static void Main()
    {
        int[] weights = { 2, 3, 4, 5, 9 };
        int[] values = { 3, 4, 5, 8, 10 };
        string[] names = { "A", "B", "C", "D", "E" };
        int capacity = 10;

        int maxValue = Solve(weights, values, names, capacity);
        Console.WriteLine($"Maximum value: {maxValue}");
        Console.WriteLine($"Knapsack capacity: {capacity}");
    }
}
```

### Java

```java
public class Knapsack {
    static int solve(int[] weights, int[] values, String[] names, int capacity) {
        int n = weights.length;
        int[][] dp = new int[n + 1][capacity + 1];

        // Fill DP table
        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= capacity; w++) {
                dp[i][w] = dp[i - 1][w]; // Don't take item i
                if (weights[i - 1] <= w) {
                    dp[i][w] = Math.max(dp[i][w],
                        dp[i - 1][w - weights[i - 1]] + values[i - 1]);
                }
            }
        }

        // Backtrack to find selected items
        System.out.print("Selected items: ");
        int remaining = capacity;
        for (int i = n; i >= 1; i--) {
            if (dp[i][remaining] != dp[i - 1][remaining]) {
                System.out.print(names[i - 1] + " ");
                remaining -= weights[i - 1];
            }
        }
        System.out.println();

        return dp[n][capacity];
    }

    public static void main(String[] args) {
        int[] weights = {2, 3, 4, 5, 9};
        int[] values = {3, 4, 5, 8, 10};
        String[] names = {"A", "B", "C", "D", "E"};
        int capacity = 10;

        int maxValue = solve(weights, values, names, capacity);
        System.out.println("Maximum value: " + maxValue);
        System.out.println("Knapsack capacity: " + capacity);
    }
}
```

### Python

```python
def knapsack(weights, values, names, capacity):
    """Solve 0-1 knapsack using dynamic programming."""
    n = len(weights)
    # dp[i][w] = max value using first i items with capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # Fill DP table
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]  # Don't take item i
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1])

    # Backtrack to find selected items
    selected = []
    remaining = capacity
    for i in range(n, 0, -1):
        if dp[i][remaining] != dp[i - 1][remaining]:
            selected.append(names[i - 1])
            remaining -= weights[i - 1]

    return dp[n][capacity], selected

# Example
weights = [2, 3, 4, 5, 9]
values = [3, 4, 5, 8, 10]
names = ["A", "B", "C", "D", "E"]
capacity = 10

max_value, selected = knapsack(weights, values, names, capacity)
print(f"Selected items: {selected}")
print(f"Maximum value: {max_value}")
print(f"Knapsack capacity: {capacity}")

# Verify: print item details
print("\nItem details:")
total_weight = 0
for name in selected:
    idx = names.index(name)
    print(f"  {name}: weight={weights[idx]}, value={values[idx]}")
    total_weight += weights[idx]
print(f"Total weight used: {total_weight}/{capacity}")
```

### JavaScript

```javascript
function knapsack(weights, values, names, capacity) {
  const n = weights.length;
  // dp[i][w] = max value using first i items with capacity w
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  // Fill DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // Don't take item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }

  // Backtrack to find selected items
  const selected = [];
  let remaining = capacity;
  for (let i = n; i >= 1; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      selected.push(names[i - 1]);
      remaining -= weights[i - 1];
    }
  }

  return { maxValue: dp[n][capacity], selected };
}

// Example
const weights = [2, 3, 4, 5, 9];
const values = [3, 4, 5, 8, 10];
const names = ["A", "B", "C", "D", "E"];
const capacity = 10;

const { maxValue, selected } = knapsack(weights, values, names, capacity);
console.log(`Selected items: ${selected.join(", ")}`);
console.log(`Maximum value: ${maxValue}`);
console.log(`Knapsack capacity: ${capacity}`);

// Verify
let totalWeight = 0;
console.log("\nItem details:");
for (const name of selected) {
  const idx = names.indexOf(name);
  console.log(`  ${name}: weight=${weights[idx]}, value=${values[idx]}`);
  totalWeight += weights[idx];
}
console.log(`Total weight used: ${totalWeight}/${capacity}`);
```

## Key Takeaways

1. **Combinatorial optimization** finds the best solution from exponentially many possibilities over discrete structures — brute force is usually infeasible.
2. **Greedy algorithms** make locally optimal choices at each step; they're fast but only work when the greedy choice property holds (activity selection, fractional knapsack, MST).
3. **Dynamic programming** systematically solves overlapping subproblems and guarantees optimality; the 0-1 knapsack is a classic example with $O(nW)$ time complexity.
4. **Greedy vs DP**: use greedy when you can prove local choices lead to global optimum; use DP when you need to consider all options (no valid greedy exists).
5. **Branch and bound** systematically explores the solution space while pruning provably suboptimal branches using bounds — it's exact but potentially exponential.
6. **Integer Linear Programming** can model most combinatorial problems as optimization over integer variables with linear constraints; modern solvers handle surprisingly large instances.
7. **Approximation algorithms** provide polynomial-time solutions with provable quality guarantees for NP-hard problems — essential when exact solutions are too expensive.
