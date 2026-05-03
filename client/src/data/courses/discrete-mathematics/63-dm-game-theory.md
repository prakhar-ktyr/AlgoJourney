---
title: Game Theory Basics
---

# Game Theory Basics

Game theory is the mathematical study of strategic decision-making among rational agents. It provides a framework for analyzing situations where the outcome for each participant depends not only on their own choices but also on the choices made by others. Discrete mathematics — particularly combinatorics, probability, and optimization — forms the foundation of game-theoretic analysis.

## What Is Game Theory?

### Definition

Game theory models interactions between **players** who each choose **strategies** to maximize their own **payoff**, knowing that other players are doing the same.

### Components of a Game

Every game has:
- **Players**: the decision-makers (2 or more)
- **Strategies**: the possible actions each player can take
- **Payoffs**: the outcomes (utility/reward) for each combination of strategies
- **Information**: what each player knows when making decisions
- **Rules**: the order of play and constraints

### Types of Games

| Type | Description |
|------|------------|
| **Cooperative** | Players can form binding agreements |
| **Non-cooperative** | Players act independently |
| **Zero-sum** | One player's gain equals another's loss |
| **Simultaneous** | Players choose actions at the same time |
| **Sequential** | Players take turns |
| **Complete information** | All players know all payoffs |
| **Incomplete information** | Some payoffs are unknown |

## Normal Form Games: Payoff Matrices

A **normal form game** (or strategic form) represents simultaneous games using a matrix where:
- Rows represent Player 1's strategies
- Columns represent Player 2's strategies
- Each cell contains the payoffs $(u_1, u_2)$ for both players

### Example: Coordination Game

Two friends choosing where to meet (without communicating):

|  | **Coffee Shop** | **Library** |
|--|----------------|------------|
| **Coffee Shop** | $(3, 3)$ | $(0, 0)$ |
| **Library** | $(0, 0)$ | $(2, 2)$ |

Both prefer to meet at the same place. The Coffee Shop is slightly preferred by both.

### Reading Payoff Matrices

For cell $(i, j)$: the first number is Player 1's payoff (row player), the second is Player 2's payoff (column player).

A player wants to maximize **their own** payoff number.

## Dominant Strategies

### Definition

A strategy $s_i$ **strictly dominates** strategy $s_i'$ if it gives a higher payoff regardless of what the other player does:

$$u_i(s_i, s_{-i}) > u_i(s_i', s_{-i}) \quad \text{for all } s_{-i}$$

where $s_{-i}$ represents the strategies of all other players.

A strategy is **weakly dominant** if it's at least as good in all cases and strictly better in at least one.

### Example

|  | **Left** | **Right** |
|--|---------|----------|
| **Up** | $(4, 3)$ | $(2, 1)$ |
| **Down** | $(3, 2)$ | $(1, 0)$ |

For Player 1:
- Up gives 4 when opponent plays Left, 2 when opponent plays Right
- Down gives 3 when opponent plays Left, 1 when opponent plays Right
- Up $>$ Down in both cases → **Up is dominant** for Player 1

For Player 2:
- Left gives 3 when opponent plays Up, 2 when opponent plays Down
- Right gives 1 when opponent plays Up, 0 when opponent plays Down
- Left $>$ Right in both cases → **Left is dominant** for Player 2

### Iterated Elimination of Dominated Strategies (IEDS)

When not every player has a dominant strategy, we can iteratively remove dominated strategies:
1. Remove any strictly dominated strategy
2. In the reduced game, check again for dominated strategies
3. Repeat until no more strategies can be eliminated

## Nash Equilibrium

### Definition

A **Nash Equilibrium** is a strategy profile where no player can improve their payoff by unilaterally changing their strategy:

$$u_i(s_i^*, s_{-i}^*) \geq u_i(s_i, s_{-i}^*) \quad \text{for all } s_i \text{ and all players } i$$

In other words, each player's strategy is a **best response** to the other players' strategies.

### Finding Nash Equilibria in 2×2 Games

**Method: Best Response**

1. For each of Player 2's strategies, find Player 1's best response (mark with *)
2. For each of Player 1's strategies, find Player 2's best response (mark with *)
3. Cells where both players have a best response (*,*) are Nash Equilibria

### Example

|  | **Left** | **Right** |
|--|---------|----------|
| **Up** | $(3, 2)$ | $(1, 3)$ |
| **Down** | $(2, 1)$ | $(4, 2)$ |

Player 1's best responses:
- If P2 plays Left: Up (3 > 2) → mark
- If P2 plays Right: Down (4 > 1) → mark

Player 2's best responses:
- If P1 plays Up: Right (3 > 2) → mark
- If P1 plays Down: Right (2 > 1) → mark

Nash Equilibrium: (Down, Right) with payoff $(4, 2)$ — both marks coincide there.

### Properties of Nash Equilibrium

- Every finite game has at least one Nash Equilibrium (possibly in mixed strategies) — **Nash's Theorem**
- A game can have multiple Nash Equilibria
- Nash Equilibria are not necessarily optimal for all players (see Prisoner's Dilemma)

## Prisoner's Dilemma

The most famous game in game theory illustrates why rational individuals might not cooperate even when it's in their collective interest.

### Setup

Two suspects are arrested. Each can **Cooperate** (stay silent) or **Defect** (betray the other):

|  | **Cooperate** | **Defect** |
|--|--------------|-----------|
| **Cooperate** | $(-1, -1)$ | $(-3, 0)$ |
| **Defect** | $(0, -3)$ | $(-2, -2)$ |

(Payoffs represent years in prison, so less negative is better.)

### Analysis

- If the other cooperates: Defect gives 0 vs -1 → Defect is better
- If the other defects: Defect gives -2 vs -3 → Defect is better
- **Defect is a dominant strategy for both players**

Nash Equilibrium: (Defect, Defect) with payoff $(-2, -2)$.

### The Dilemma

Both players would be better off at (Cooperate, Cooperate) = $(-1, -1)$, but rational self-interest drives them to (Defect, Defect) = $(-2, -2)$.

### Real-World Examples

- Arms races between nations
- Price wars between competing firms
- Environmental pollution (individual vs collective benefit)
- Open source contributions (free-riding)

## Zero-Sum Games and the Minimax Theorem

### Definition

A **zero-sum game** is one where the total payoff is constant — one player's gain equals the other's loss:

$$u_1(s_1, s_2) + u_2(s_1, s_2) = 0 \quad \text{for all } (s_1, s_2)$$

We can represent zero-sum games with a single payoff matrix (Player 1's payoffs; Player 2's are the negatives).

### Minimax Strategy

Each player assumes the worst case:
- **Player 1 (maximizer)**: maximize the minimum payoff across opponent's responses

$$\max_{s_1} \min_{s_2} u_1(s_1, s_2)$$

- **Player 2 (minimizer)**: minimize the maximum payoff the opponent can get

$$\min_{s_2} \max_{s_1} u_1(s_1, s_2)$$

### Minimax Theorem (von Neumann, 1928)

In any finite two-player zero-sum game:

$$\max_{s_1} \min_{s_2} u_1(s_1, s_2) = \min_{s_2} \max_{s_1} u_1(s_1, s_2) = v$$

The value $v$ is the **value of the game**. This equality may require mixed strategies.

### Example

Player 1's payoff matrix:

|  | **L** | **M** | **R** |
|--|------|------|------|
| **U** | $3$ | $-1$ | $2$ |
| **D** | $-2$ | $4$ | $1$ |

Row minimums: min(3,-1,2) = -1, min(-2,4,1) = -2
Maximin = max(-1, -2) = -1 (Player 1 plays U)

Column maximums: max(3,-2) = 3, max(-1,4) = 4, max(2,1) = 2
Minimax = min(3, 4, 2) = 2 (Player 2 plays R)

Since maximin $\neq$ minimax ($-1 \neq 2$), there's no pure strategy saddle point. We need mixed strategies.

## Mixed Strategies

### Definition

A **mixed strategy** assigns a probability distribution over pure strategies:

$$\sigma_i = (p_1, p_2, \ldots, p_k) \quad \text{where } \sum_{j=1}^k p_j = 1, \; p_j \geq 0$$

The expected payoff under mixed strategies:

$$E[u_i] = \sum_{s_1} \sum_{s_2} \sigma_1(s_1) \cdot \sigma_2(s_2) \cdot u_i(s_1, s_2)$$

### Finding Mixed Strategy Nash Equilibrium (2×2)

For a 2×2 game, make the opponent **indifferent** between their strategies:

|  | **L** | **R** |
|--|------|------|
| **U** | $(a, e)$ | $(b, f)$ |
| **D** | $(c, g)$ | $(d, h)$ |

If Player 1 plays U with probability $p$:
- Player 2's payoff from L: $pe + (1-p)g$
- Player 2's payoff from R: $pf + (1-p)h$

Set equal to make P2 indifferent:
$$pe + (1-p)g = pf + (1-p)h$$
$$p = \frac{h - g}{(e - f) - (g - h)}$$

Similarly, if Player 2 plays L with probability $q$, set P1 indifferent:
$$q = \frac{d - b}{(a - c) - (b - d)}$$

## Applications of Game Theory

### Auction Design

- **First-price sealed bid**: bidders shade their bids below true value
- **Second-price (Vickrey) auction**: truthful bidding is a dominant strategy
- Revenue equivalence theorem connects different auction formats

### Network Routing

- **Selfish routing**: each user picks the fastest path, leading to congestion
- **Braess's Paradox**: adding a road can increase travel time for everyone
- **Price of anarchy**: ratio of worst Nash Equilibrium to social optimum

### Artificial Intelligence

- **Minimax algorithm**: used in chess, Go, and other perfect information games
- **Alpha-beta pruning**: efficiently explores game trees
- **Multi-agent reinforcement learning**: agents learn strategies through interaction
- **Mechanism design**: designing games/rules to achieve desired outcomes

## Code: Find Nash Equilibrium for 2×2 Games

### C++

```cpp
#include <iostream>
#include <iomanip>
using namespace std;

struct GameResult {
    bool hasPureNE;
    int pureRow, pureCol;
    double p, q; // Mixed strategy probabilities
    double value1, value2; // Expected payoffs
};

GameResult findNashEquilibrium(double payoff1[2][2], double payoff2[2][2]) {
    GameResult result = {false, -1, -1, -1, -1, 0, 0};

    // Check for pure strategy Nash Equilibria using best response
    for (int r = 0; r < 2; r++) {
        for (int c = 0; c < 2; c++) {
            bool p1BestResponse = (payoff1[r][c] >= payoff1[1 - r][c]);
            bool p2BestResponse = (payoff2[r][c] >= payoff2[r][1 - c]);
            if (p1BestResponse && p2BestResponse) {
                result.hasPureNE = true;
                result.pureRow = r;
                result.pureCol = c;
                result.value1 = payoff1[r][c];
                result.value2 = payoff2[r][c];
                cout << "Pure NE: (" << (r == 0 ? "U" : "D") << ", "
                     << (c == 0 ? "L" : "R") << ") -> ("
                     << result.value1 << ", " << result.value2 << ")" << endl;
            }
        }
    }

    // Find mixed strategy Nash Equilibrium
    // P1 plays U with prob p to make P2 indifferent
    double denom2 = (payoff2[0][0] - payoff2[0][1]) - (payoff2[1][0] - payoff2[1][1]);
    if (denom2 != 0) {
        result.p = (payoff2[1][1] - payoff2[1][0]) / denom2;
    }

    // P2 plays L with prob q to make P1 indifferent
    double denom1 = (payoff1[0][0] - payoff1[1][0]) - (payoff1[0][1] - payoff1[1][1]);
    if (denom1 != 0) {
        result.q = (payoff1[1][1] - payoff1[0][1]) / denom1;
    }

    if (result.p >= 0 && result.p <= 1 && result.q >= 0 && result.q <= 1) {
        result.value1 = result.q * payoff1[0][0] + (1 - result.q) * payoff1[0][1];
        result.value2 = result.p * payoff2[0][0] + (1 - result.p) * payoff2[1][0];
        cout << "Mixed NE: P1 plays U with p=" << result.p
             << ", P2 plays L with q=" << result.q << endl;
        cout << "Expected payoffs: (" << result.value1 << ", " << result.value2 << ")" << endl;
    }

    return result;
}

int main() {
    // Prisoner's Dilemma
    cout << "=== Prisoner's Dilemma ===" << endl;
    double pd1[2][2] = {{-1, -3}, {0, -2}};
    double pd2[2][2] = {{-1, 0}, {-3, -2}};
    findNashEquilibrium(pd1, pd2);

    cout << "\n=== Battle of the Sexes ===" << endl;
    double bs1[2][2] = {{3, 0}, {0, 2}};
    double bs2[2][2] = {{2, 0}, {0, 3}};
    findNashEquilibrium(bs1, bs2);

    return 0;
}
```

### C#

```csharp
using System;

class NashEquilibrium
{
    static void FindNashEquilibrium(double[,] payoff1, double[,] payoff2, string[] rows, string[] cols)
    {
        // Check pure strategy Nash Equilibria
        for (int r = 0; r < 2; r++)
        {
            for (int c = 0; c < 2; c++)
            {
                bool p1Best = payoff1[r, c] >= payoff1[1 - r, c];
                bool p2Best = payoff2[r, c] >= payoff2[r, 1 - c];
                if (p1Best && p2Best)
                {
                    Console.WriteLine($"Pure NE: ({rows[r]}, {cols[c]}) -> ({payoff1[r, c]}, {payoff2[r, c]})");
                }
            }
        }

        // Mixed strategy Nash Equilibrium
        double denom2 = (payoff2[0, 0] - payoff2[0, 1]) - (payoff2[1, 0] - payoff2[1, 1]);
        double denom1 = (payoff1[0, 0] - payoff1[1, 0]) - (payoff1[0, 1] - payoff1[1, 1]);

        if (denom2 != 0 && denom1 != 0)
        {
            double p = (payoff2[1, 1] - payoff2[1, 0]) / denom2;
            double q = (payoff1[1, 1] - payoff1[0, 1]) / denom1;

            if (p >= 0 && p <= 1 && q >= 0 && q <= 1)
            {
                double ev1 = q * payoff1[0, 0] + (1 - q) * payoff1[0, 1];
                double ev2 = p * payoff2[0, 0] + (1 - p) * payoff2[1, 0];
                Console.WriteLine($"Mixed NE: P1 plays {rows[0]} with p={p:F3}, P2 plays {cols[0]} with q={q:F3}");
                Console.WriteLine($"Expected payoffs: ({ev1:F3}, {ev2:F3})");
            }
        }
    }

    static void Main()
    {
        string[] rows = { "Cooperate", "Defect" };
        string[] cols = { "Cooperate", "Defect" };

        Console.WriteLine("=== Prisoner's Dilemma ===");
        double[,] pd1 = { { -1, -3 }, { 0, -2 } };
        double[,] pd2 = { { -1, 0 }, { -3, -2 } };
        FindNashEquilibrium(pd1, pd2, rows, cols);

        Console.WriteLine("\n=== Matching Pennies ===");
        string[] mp = { "Heads", "Tails" };
        double[,] mp1 = { { 1, -1 }, { -1, 1 } };
        double[,] mp2 = { { -1, 1 }, { 1, -1 } };
        FindNashEquilibrium(mp1, mp2, mp, mp);
    }
}
```

### Java

```java
public class NashEquilibrium {
    static void findNashEquilibrium(double[][] payoff1, double[][] payoff2,
                                     String[] rows, String[] cols) {
        // Check pure strategy Nash Equilibria
        for (int r = 0; r < 2; r++) {
            for (int c = 0; c < 2; c++) {
                boolean p1Best = payoff1[r][c] >= payoff1[1 - r][c];
                boolean p2Best = payoff2[r][c] >= payoff2[r][1 - c];
                if (p1Best && p2Best) {
                    System.out.printf("Pure NE: (%s, %s) -> (%.1f, %.1f)%n",
                        rows[r], cols[c], payoff1[r][c], payoff2[r][c]);
                }
            }
        }

        // Mixed strategy Nash Equilibrium
        double denom2 = (payoff2[0][0] - payoff2[0][1]) - (payoff2[1][0] - payoff2[1][1]);
        double denom1 = (payoff1[0][0] - payoff1[1][0]) - (payoff1[0][1] - payoff1[1][1]);

        if (denom2 != 0 && denom1 != 0) {
            double p = (payoff2[1][1] - payoff2[1][0]) / denom2;
            double q = (payoff1[1][1] - payoff1[0][1]) / denom1;

            if (p >= 0 && p <= 1 && q >= 0 && q <= 1) {
                double ev1 = q * payoff1[0][0] + (1 - q) * payoff1[0][1];
                double ev2 = p * payoff2[0][0] + (1 - p) * payoff2[1][0];
                System.out.printf("Mixed NE: P1 plays %s with p=%.3f, P2 plays %s with q=%.3f%n",
                    rows[0], p, cols[0], q);
                System.out.printf("Expected payoffs: (%.3f, %.3f)%n", ev1, ev2);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Prisoner's Dilemma ===");
        double[][] pd1 = {{-1, -3}, {0, -2}};
        double[][] pd2 = {{-1, 0}, {-3, -2}};
        findNashEquilibrium(pd1, pd2,
            new String[]{"Cooperate", "Defect"}, new String[]{"Cooperate", "Defect"});

        System.out.println("\n=== Battle of the Sexes ===");
        double[][] bs1 = {{3, 0}, {0, 2}};
        double[][] bs2 = {{2, 0}, {0, 3}};
        findNashEquilibrium(bs1, bs2,
            new String[]{"Opera", "Football"}, new String[]{"Opera", "Football"});
    }
}
```

### Python

```python
def find_nash_equilibrium(payoff1, payoff2, rows=("U", "D"), cols=("L", "R")):
    """Find Nash Equilibria for a 2x2 game."""
    results = []

    # Check pure strategy Nash Equilibria
    for r in range(2):
        for c in range(2):
            p1_best = payoff1[r][c] >= payoff1[1 - r][c]
            p2_best = payoff2[r][c] >= payoff2[r][1 - c]
            if p1_best and p2_best:
                print(f"Pure NE: ({rows[r]}, {cols[c]}) -> ({payoff1[r][c]}, {payoff2[r][c]})")
                results.append(("pure", rows[r], cols[c]))

    # Mixed strategy Nash Equilibrium
    # P1 plays row 0 with prob p to make P2 indifferent
    denom2 = (payoff2[0][0] - payoff2[0][1]) - (payoff2[1][0] - payoff2[1][1])
    # P2 plays col 0 with prob q to make P1 indifferent
    denom1 = (payoff1[0][0] - payoff1[1][0]) - (payoff1[0][1] - payoff1[1][1])

    if denom2 != 0 and denom1 != 0:
        p = (payoff2[1][1] - payoff2[1][0]) / denom2
        q = (payoff1[1][1] - payoff1[0][1]) / denom1

        if 0 <= p <= 1 and 0 <= q <= 1:
            ev1 = q * payoff1[0][0] + (1 - q) * payoff1[0][1]
            ev2 = p * payoff2[0][0] + (1 - p) * payoff2[1][0]
            print(f"Mixed NE: P1 plays {rows[0]} with p={p:.3f}, P2 plays {cols[0]} with q={q:.3f}")
            print(f"Expected payoffs: ({ev1:.3f}, {ev2:.3f})")
            results.append(("mixed", p, q))

    return results

# Prisoner's Dilemma
print("=== Prisoner's Dilemma ===")
pd1 = [[-1, -3], [0, -2]]
pd2 = [[-1, 0], [-3, -2]]
find_nash_equilibrium(pd1, pd2, ("Cooperate", "Defect"), ("Cooperate", "Defect"))

# Matching Pennies (zero-sum)
print("\n=== Matching Pennies ===")
mp1 = [[1, -1], [-1, 1]]
mp2 = [[-1, 1], [1, -1]]
find_nash_equilibrium(mp1, mp2, ("Heads", "Tails"), ("Heads", "Tails"))
```

### JavaScript

```javascript
function findNashEquilibrium(payoff1, payoff2, rows = ["U", "D"], cols = ["L", "R"]) {
  const results = [];

  // Check pure strategy Nash Equilibria
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      const p1Best = payoff1[r][c] >= payoff1[1 - r][c];
      const p2Best = payoff2[r][c] >= payoff2[r][1 - c];
      if (p1Best && p2Best) {
        console.log(`Pure NE: (${rows[r]}, ${cols[c]}) -> (${payoff1[r][c]}, ${payoff2[r][c]})`);
        results.push({ type: "pure", row: rows[r], col: cols[c] });
      }
    }
  }

  // Mixed strategy Nash Equilibrium
  const denom2 = (payoff2[0][0] - payoff2[0][1]) - (payoff2[1][0] - payoff2[1][1]);
  const denom1 = (payoff1[0][0] - payoff1[1][0]) - (payoff1[0][1] - payoff1[1][1]);

  if (denom2 !== 0 && denom1 !== 0) {
    const p = (payoff2[1][1] - payoff2[1][0]) / denom2;
    const q = (payoff1[1][1] - payoff1[0][1]) / denom1;

    if (p >= 0 && p <= 1 && q >= 0 && q <= 1) {
      const ev1 = q * payoff1[0][0] + (1 - q) * payoff1[0][1];
      const ev2 = p * payoff2[0][0] + (1 - p) * payoff2[1][0];
      console.log(`Mixed NE: P1 plays ${rows[0]} with p=${p.toFixed(3)}, P2 plays ${cols[0]} with q=${q.toFixed(3)}`);
      console.log(`Expected payoffs: (${ev1.toFixed(3)}, ${ev2.toFixed(3)})`);
      results.push({ type: "mixed", p, q, ev1, ev2 });
    }
  }

  return results;
}

// Prisoner's Dilemma
console.log("=== Prisoner's Dilemma ===");
findNashEquilibrium(
  [[-1, -3], [0, -2]],
  [[-1, 0], [-3, -2]],
  ["Cooperate", "Defect"],
  ["Cooperate", "Defect"]
);

// Battle of the Sexes
console.log("\n=== Battle of the Sexes ===");
findNashEquilibrium(
  [[3, 0], [0, 2]],
  [[2, 0], [0, 3]],
  ["Opera", "Football"],
  ["Opera", "Football"]
);
```

## Key Takeaways

1. **Game theory** studies strategic interactions where each player's outcome depends on everyone's choices, not just their own.
2. **Normal form games** use payoff matrices to represent simultaneous decisions; each cell shows both players' outcomes.
3. A **dominant strategy** is always best regardless of what others do — if one exists, a rational player always picks it.
4. A **Nash Equilibrium** is a state where no player benefits from unilaterally changing strategy — it represents stable outcomes.
5. The **Prisoner's Dilemma** shows that individual rationality can lead to collectively suboptimal outcomes, explaining real-world cooperation failures.
6. In **zero-sum games**, the minimax theorem guarantees an optimal strategy exists (possibly mixed), and both players' minimax values are equal.
7. **Mixed strategies** assign probabilities to actions and are essential when no pure strategy equilibrium exists — Nash proved every finite game has at least one equilibrium.
