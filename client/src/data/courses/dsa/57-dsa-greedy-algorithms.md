---
title: Greedy Algorithms
---

# Greedy Algorithms

A **greedy algorithm** builds a solution step by step, always choosing the option that looks best **right now** (the locally optimal choice), hoping it leads to a globally optimal solution.

---

## When Does Greedy Work?

Greedy works when:

1. **Greedy-choice property** — a locally optimal choice leads to a globally optimal solution.
2. **Optimal substructure** — an optimal solution contains optimal solutions to sub-problems.

If either property fails, you need dynamic programming or another approach.

---

## Problem 1: Activity Selection

Given `n` activities with start and finish times, select the **maximum number** of non-overlapping activities.

### Greedy Strategy

Sort by **finish time**. Always pick the activity that finishes earliest and doesn't overlap with the last selected one.

**Why it works:** Choosing the earliest-finishing activity leaves the most room for future activities.

**Time:** O(n log n) for sorting + O(n) scan

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int activitySelection(vector<pair<int,int>>& activities) {
    // Sort by finish time
    sort(activities.begin(), activities.end(),
         [](auto& a, auto& b) { return a.second < b.second; });

    int count = 1;
    int lastFinish = activities[0].second;

    for (int i = 1; i < (int)activities.size(); i++) {
        if (activities[i].first >= lastFinish) {
            count++;
            lastFinish = activities[i].second;
        }
    }
    return count;
}

int main() {
    // {start, finish}
    vector<pair<int,int>> activities = {
        {1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9},
        {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}
    };
    cout << activitySelection(activities) << endl; // 4
    return 0;
}
```

```java
import java.util.Arrays;

public class ActivitySelection {
    public static int activitySelection(int[][] activities) {
        // Sort by finish time
        Arrays.sort(activities, (a, b) -> a[1] - b[1]);

        int count = 1;
        int lastFinish = activities[0][1];

        for (int i = 1; i < activities.length; i++) {
            if (activities[i][0] >= lastFinish) {
                count++;
                lastFinish = activities[i][1];
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] activities = {
            {1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9},
            {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}
        };
        System.out.println(activitySelection(activities)); // 4
    }
}
```

```python
def activity_selection(activities):
    # Sort by finish time
    activities.sort(key=lambda x: x[1])

    count = 1
    last_finish = activities[0][1]

    for start, finish in activities[1:]:
        if start >= last_finish:
            count += 1
            last_finish = finish
    return count

activities = [
    (1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9),
    (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)
]
print(activity_selection(activities))  # 4
```

```javascript
function activitySelection(activities) {
  // Sort by finish time
  activities.sort((a, b) => a[1] - b[1]);

  let count = 1;
  let lastFinish = activities[0][1];

  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastFinish) {
      count++;
      lastFinish = activities[i][1];
    }
  }
  return count;
}

const activities = [
  [1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9],
  [6, 10], [8, 11], [8, 12], [2, 14], [12, 16],
];
console.log(activitySelection(activities)); // 4
```

---

## Problem 2: Fractional Knapsack

Given items with weights and values, and a knapsack capacity `W`, maximize the total value. You **can take fractions** of items.

### Greedy Strategy

Sort items by **value/weight ratio** in descending order. Take as much as possible of the highest-ratio item, then move to the next.

**Time:** O(n log n)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

double fractionalKnapsack(int W, vector<pair<int,int>>& items) {
    // items: {value, weight}
    sort(items.begin(), items.end(), [](auto& a, auto& b) {
        return (double)a.first / a.second > (double)b.first / b.second;
    });

    double totalValue = 0.0;
    int remaining = W;

    for (auto& [value, weight] : items) {
        if (remaining == 0) break;
        if (weight <= remaining) {
            totalValue += value;
            remaining -= weight;
        } else {
            totalValue += (double)value * remaining / weight;
            remaining = 0;
        }
    }
    return totalValue;
}

int main() {
    vector<pair<int,int>> items = {{60, 10}, {100, 20}, {120, 30}};
    cout << fractionalKnapsack(50, items) << endl; // 240.0
    return 0;
}
```

```java
import java.util.Arrays;

public class FractionalKnapsack {
    public static double fractionalKnapsack(int W, int[][] items) {
        // items: {value, weight}
        Arrays.sort(items, (a, b) ->
            Double.compare((double) b[0] / b[1], (double) a[0] / a[1]));

        double totalValue = 0.0;
        int remaining = W;

        for (int[] item : items) {
            if (remaining == 0) break;
            int value = item[0], weight = item[1];
            if (weight <= remaining) {
                totalValue += value;
                remaining -= weight;
            } else {
                totalValue += (double) value * remaining / weight;
                remaining = 0;
            }
        }
        return totalValue;
    }

    public static void main(String[] args) {
        int[][] items = {{60, 10}, {100, 20}, {120, 30}};
        System.out.println(fractionalKnapsack(50, items)); // 240.0
    }
}
```

```python
def fractional_knapsack(W, items):
    # items: [(value, weight), ...]
    items.sort(key=lambda x: x[0] / x[1], reverse=True)

    total_value = 0.0
    remaining = W

    for value, weight in items:
        if remaining == 0:
            break
        if weight <= remaining:
            total_value += value
            remaining -= weight
        else:
            total_value += value * (remaining / weight)
            remaining = 0

    return total_value

items = [(60, 10), (100, 20), (120, 30)]
print(fractional_knapsack(50, items))  # 240.0
```

```javascript
function fractionalKnapsack(W, items) {
  // items: [[value, weight], ...]
  items.sort((a, b) => b[0] / b[1] - a[0] / a[1]);

  let totalValue = 0;
  let remaining = W;

  for (const [value, weight] of items) {
    if (remaining === 0) break;
    if (weight <= remaining) {
      totalValue += value;
      remaining -= weight;
    } else {
      totalValue += value * (remaining / weight);
      remaining = 0;
    }
  }
  return totalValue;
}

const items = [[60, 10], [100, 20], [120, 30]];
console.log(fractionalKnapsack(50, items)); // 240
```

---

## Problem 3: Jump Game

Given an array where `nums[i]` is the maximum jump length from position `i`, determine if you can reach the **last index** starting from index 0.

### Greedy Strategy

Track the **farthest index reachable**. Scan left to right; if you ever land on an index beyond the farthest reach, you're stuck.

**Time:** O(n), **Space:** O(1)

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

bool canJump(vector<int>& nums) {
    int farthest = 0;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (i > farthest) return false;
        farthest = max(farthest, i + nums[i]);
    }
    return true;
}

int main() {
    vector<int> a = {2, 3, 1, 1, 4};
    vector<int> b = {3, 2, 1, 0, 4};
    cout << canJump(a) << endl; // 1 (true)
    cout << canJump(b) << endl; // 0 (false)
    return 0;
}
```

```java
public class JumpGame {
    public static boolean canJump(int[] nums) {
        int farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) return false;
            farthest = Math.max(farthest, i + nums[i]);
        }
        return true;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2, 3, 1, 1, 4})); // true
        System.out.println(canJump(new int[]{3, 2, 1, 0, 4})); // false
    }
}
```

```python
def can_jump(nums):
    farthest = 0
    for i in range(len(nums)):
        if i > farthest:
            return False
        farthest = max(farthest, i + nums[i])
    return True

print(can_jump([2, 3, 1, 1, 4]))  # True
print(can_jump([3, 2, 1, 0, 4]))  # False
```

```javascript
function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + nums[i]);
  }
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
```

---

## Greedy vs. Dynamic Programming

| Aspect | Greedy | DP |
|--------|--------|----|
| Decisions | Irrevocable (never backtrack) | Consider all choices |
| Speed | Usually faster | Explores more states |
| Correctness | Only if greedy-choice property holds | Always correct if formulated right |
| Examples | Activity selection, Huffman coding | 0/1 Knapsack, shortest paths (Bellman-Ford) |

---

## Key Takeaways

1. Greedy algorithms are simple and fast, but only correct when the problem has the **greedy-choice property**.
2. **Proving correctness** is the hard part — use exchange arguments or show no better choice exists.
3. Classic greedy problems: activity selection, fractional knapsack, Huffman coding, Dijkstra's algorithm, minimum spanning trees (Kruskal/Prim).
4. If greedy fails (e.g., 0/1 knapsack, longest common subsequence), switch to dynamic programming.

---

Next: **Backtracking →**
