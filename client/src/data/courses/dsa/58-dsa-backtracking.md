---
title: Backtracking
---

# Backtracking

**Backtracking** is a systematic way to explore all possible solutions by building candidates incrementally and abandoning ("backtracking") a path as soon as it's clear it cannot lead to a valid solution.

---

## The Explore → Choose → Unchoose Pattern

Every backtracking algorithm follows this skeleton:

```
function backtrack(state):
    if state is a complete solution:
        record/return the solution
        return

    for each choice in available choices:
        if choice is valid:
            make the choice          (CHOOSE)
            backtrack(new state)     (EXPLORE)
            undo the choice          (UNCHOOSE)
```

The **unchoose** step is what distinguishes backtracking from plain recursion — it restores state so other branches can be explored.

---

## Problem 1: N-Queens

Place `n` queens on an `n×n` chessboard so no two queens attack each other (same row, column, or diagonal).

### Approach

- Place queens row by row.
- For each row, try every column; skip if it's attacked.
- Track columns and diagonals using sets.

**Time:** O(n!) in the worst case

```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class NQueens {
    int n;
    vector<vector<string>> solutions;
    vector<int> cols, diag1, diag2; // column and diagonal trackers

public:
    vector<vector<string>> solve(int size) {
        n = size;
        cols.assign(n, 0);
        diag1.assign(2 * n, 0);
        diag2.assign(2 * n, 0);
        vector<string> board(n, string(n, '.'));
        backtrack(board, 0);
        return solutions;
    }

private:
    void backtrack(vector<string>& board, int row) {
        if (row == n) {
            solutions.push_back(board);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols[col] || diag1[row - col + n] || diag2[row + col])
                continue;
            // Choose
            board[row][col] = 'Q';
            cols[col] = diag1[row - col + n] = diag2[row + col] = 1;
            // Explore
            backtrack(board, row + 1);
            // Unchoose
            board[row][col] = '.';
            cols[col] = diag1[row - col + n] = diag2[row + col] = 0;
        }
    }
};

int main() {
    NQueens nq;
    auto solutions = nq.solve(4);
    cout << "Number of solutions: " << solutions.size() << endl; // 2
    for (auto& board : solutions) {
        for (auto& row : board) cout << row << "\n";
        cout << "\n";
    }
    return 0;
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class NQueens {
    private int n;
    private List<List<String>> solutions = new ArrayList<>();
    private boolean[] cols, diag1, diag2;

    public List<List<String>> solve(int size) {
        n = size;
        cols = new boolean[n];
        diag1 = new boolean[2 * n];
        diag2 = new boolean[2 * n];
        char[][] board = new char[n][n];
        for (char[] row : board) java.util.Arrays.fill(row, '.');
        backtrack(board, 0);
        return solutions;
    }

    private void backtrack(char[][] board, int row) {
        if (row == n) {
            List<String> snapshot = new ArrayList<>();
            for (char[] r : board) snapshot.add(new String(r));
            solutions.add(snapshot);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols[col] || diag1[row - col + n] || diag2[row + col])
                continue;
            board[row][col] = 'Q';
            cols[col] = diag1[row - col + n] = diag2[row + col] = true;
            backtrack(board, row + 1);
            board[row][col] = '.';
            cols[col] = diag1[row - col + n] = diag2[row + col] = false;
        }
    }

    public static void main(String[] args) {
        NQueens nq = new NQueens();
        List<List<String>> solutions = nq.solve(4);
        System.out.println("Number of solutions: " + solutions.size()); // 2
        for (List<String> board : solutions) {
            for (String row : board) System.out.println(row);
            System.out.println();
        }
    }
}
```

```python
def solve_n_queens(n):
    solutions = []
    cols = set()
    diag1 = set()  # row - col
    diag2 = set()  # row + col

    def backtrack(row, board):
        if row == n:
            solutions.append(["".join(r) for r in board])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            # Choose
            board[row][col] = "Q"
            cols.add(col)
            diag1.add(row - col)
            diag2.add(row + col)
            # Explore
            backtrack(row + 1, board)
            # Unchoose
            board[row][col] = "."
            cols.remove(col)
            diag1.remove(row - col)
            diag2.remove(row + col)

    board = [["." for _ in range(n)] for _ in range(n)]
    backtrack(0, board)
    return solutions

solutions = solve_n_queens(4)
print(f"Number of solutions: {len(solutions)}")  # 2
for board in solutions:
    for row in board:
        print(row)
    print()
```

```javascript
function solveNQueens(n) {
  const solutions = [];
  const cols = new Set();
  const diag1 = new Set(); // row - col
  const diag2 = new Set(); // row + col

  function backtrack(row, board) {
    if (row === n) {
      solutions.push(board.map((r) => r.join("")));
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col))
        continue;
      // Choose
      board[row][col] = "Q";
      cols.add(col);
      diag1.add(row - col);
      diag2.add(row + col);
      // Explore
      backtrack(row + 1, board);
      // Unchoose
      board[row][col] = ".";
      cols.delete(col);
      diag1.delete(row - col);
      diag2.delete(row + col);
    }
  }

  const board = Array.from({ length: n }, () => Array(n).fill("."));
  backtrack(0, board);
  return solutions;
}

const solutions = solveNQueens(4);
console.log(`Number of solutions: ${solutions.length}`); // 2
solutions.forEach((board) => {
  board.forEach((row) => console.log(row));
  console.log();
});
```

---

## Problem 2: Subsets (Power Set)

Given a set of distinct integers, return all possible subsets.

### Approach

At each index, you have two choices: **include** the element or **skip** it.

**Time:** O(2^n), **Space:** O(n) recursion depth

```cpp
#include <iostream>
#include <vector>
using namespace std;

void backtrack(vector<int>& nums, int start, vector<int>& current,
               vector<vector<int>>& result) {
    result.push_back(current);
    for (int i = start; i < (int)nums.size(); i++) {
        current.push_back(nums[i]);       // Choose
        backtrack(nums, i + 1, current, result); // Explore
        current.pop_back();                // Unchoose
    }
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    backtrack(nums, 0, current, result);
    return result;
}

int main() {
    vector<int> nums = {1, 2, 3};
    auto result = subsets(nums);
    for (auto& subset : result) {
        cout << "[";
        for (int i = 0; i < (int)subset.size(); i++)
            cout << (i ? "," : "") << subset[i];
        cout << "] ";
    }
    // [] [1] [1,2] [1,2,3] [1,3] [2] [2,3] [3]
    return 0;
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class Subsets {
    public static List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] nums, int start,
                                  List<Integer> current,
                                  List<List<Integer>> result) {
        result.add(new ArrayList<>(current));
        for (int i = start; i < nums.length; i++) {
            current.add(nums[i]);           // Choose
            backtrack(nums, i + 1, current, result); // Explore
            current.remove(current.size() - 1);       // Unchoose
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        System.out.println(subsets(nums));
        // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
    }
}
```

```python
def subsets(nums):
    result = []

    def backtrack(start, current):
        result.append(current[:])  # record a copy
        for i in range(start, len(nums)):
            current.append(nums[i])       # Choose
            backtrack(i + 1, current)     # Explore
            current.pop()                 # Unchoose

    backtrack(0, [])
    return result

print(subsets([1, 2, 3]))
# [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

```javascript
function subsets(nums) {
  const result = [];

  function backtrack(start, current) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]); // Choose
      backtrack(i + 1, current); // Explore
      current.pop(); // Unchoose
    }
  }

  backtrack(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));
// [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

---

## Problem 3: Permutations

Given an array of distinct integers, return all possible permutations.

### Approach

- Use a `used` set to track which elements are already in the current permutation.
- At each step, try every unused element.

**Time:** O(n! × n)

```cpp
#include <iostream>
#include <vector>
using namespace std;

void backtrack(vector<int>& nums, vector<bool>& used,
               vector<int>& current, vector<vector<int>>& result) {
    if ((int)current.size() == (int)nums.size()) {
        result.push_back(current);
        return;
    }
    for (int i = 0; i < (int)nums.size(); i++) {
        if (used[i]) continue;
        used[i] = true;               // Choose
        current.push_back(nums[i]);
        backtrack(nums, used, current, result); // Explore
        current.pop_back();            // Unchoose
        used[i] = false;
    }
}

vector<vector<int>> permute(vector<int>& nums) {
    vector<vector<int>> result;
    vector<int> current;
    vector<bool> used(nums.size(), false);
    backtrack(nums, used, current, result);
    return result;
}

int main() {
    vector<int> nums = {1, 2, 3};
    auto result = permute(nums);
    cout << "Total permutations: " << result.size() << endl; // 6
    for (auto& perm : result) {
        for (int x : perm) cout << x << " ";
        cout << "\n";
    }
    return 0;
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class Permutations {
    public static List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(nums, new boolean[nums.length], new ArrayList<>(), result);
        return result;
    }

    private static void backtrack(int[] nums, boolean[] used,
                                  List<Integer> current,
                                  List<List<Integer>> result) {
        if (current.size() == nums.length) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            current.add(nums[i]);
            backtrack(nums, used, current, result);
            current.remove(current.size() - 1);
            used[i] = false;
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        List<List<Integer>> result = permute(nums);
        System.out.println("Total permutations: " + result.size()); // 6
        System.out.println(result);
    }
}
```

```python
def permute(nums):
    result = []

    def backtrack(current, used):
        if len(current) == len(nums):
            result.append(current[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True            # Choose
            current.append(nums[i])
            backtrack(current, used)  # Explore
            current.pop()             # Unchoose
            used[i] = False

    backtrack([], [False] * len(nums))
    return result

print(permute([1, 2, 3]))
# [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

```javascript
function permute(nums) {
  const result = [];

  function backtrack(current, used) {
    if (current.length === nums.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; // Choose
      current.push(nums[i]);
      backtrack(current, used); // Explore
      current.pop(); // Unchoose
      used[i] = false;
    }
  }

  backtrack([], Array(nums.length).fill(false));
  return result;
}

console.log(permute([1, 2, 3]));
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

---

## Visualizing the Recursion Tree (Subsets of [1,2,3])

```
                        []
                /        |        \
            [1]         [2]       [3]
           /    \        |
       [1,2]  [1,3]   [2,3]
         |
     [1,2,3]
```

Each node is a valid subset. The tree is explored depth-first; backtracking happens when we return from a recursive call and pop the last element.

---

## Pruning

Backtracking becomes powerful when you **prune** branches early:

- **N-Queens:** skip columns/diagonals already attacked.
- **Sudoku:** skip numbers already in row/column/box.
- **Constraint satisfaction:** check constraints before recursing.

Without pruning, backtracking degenerates into brute-force enumeration.

---

## Key Takeaways

1. Backtracking = DFS + pruning. It explores a decision tree and abandons invalid paths early.
2. The **choose → explore → unchoose** pattern is the universal template.
3. Time complexity is exponential (O(2^n) for subsets, O(n!) for permutations) — pruning reduces the constant but not the asymptotic class.
4. Classic backtracking problems: N-Queens, Sudoku solver, word search, combination sum, graph coloring.

---

Next: **Dynamic Programming Introduction →**
