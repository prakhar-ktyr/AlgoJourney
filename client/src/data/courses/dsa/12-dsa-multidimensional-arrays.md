---
title: Multi-dimensional Arrays
---

# Multi-dimensional Arrays

A **2D array** (or matrix) is an array of arrays — a grid of values organized in rows and columns. Many DSA problems involve grids, game boards, graphs (adjacency matrices), and image processing.

## Visualizing a 2D array

```
         Col 0  Col 1  Col 2
Row 0  [  1,     2,     3  ]
Row 1  [  4,     5,     6  ]
Row 2  [  7,     8,     9  ]
```

Accessing element at row `r`, column `c`: `matrix[r][c]`

## Declaring and initializing

```cpp
#include <vector>
using namespace std;

// 3×3 matrix
vector<vector<int>> matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Create m×n matrix filled with zeros
int m = 3, n = 4;
vector<vector<int>> grid(m, vector<int>(n, 0));
```

```java
// 3×3 matrix
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Create m×n matrix filled with zeros
int m = 3, n = 4;
int[][] grid = new int[m][n]; // default 0
```

```python
# 3×3 matrix
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

# Create m×n matrix filled with zeros
m, n = 3, 4
grid = [[0] * n for _ in range(m)]
# WARNING: [[0]*n]*m creates shared references — don't use it!
```

```javascript
// 3×3 matrix
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// Create m×n matrix filled with zeros
const m = 3, n = 4;
const grid = Array.from({ length: m }, () => new Array(n).fill(0));
```

## Traversing a 2D array

### Row-major order (most common)

Visit every element row by row, left to right:

```cpp
for (int i = 0; i < matrix.size(); i++) {
    for (int j = 0; j < matrix[i].size(); j++) {
        cout << matrix[i][j] << " ";
    }
    cout << endl;
}
```

```java
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

```python
for row in matrix:
    for val in row:
        print(val, end=" ")
    print()
```

```javascript
for (const row of matrix) {
    console.log(row.join(" "));
}
```

### Column-major order

Visit every element column by column, top to bottom:

```cpp
int rows = matrix.size(), cols = matrix[0].size();
for (int j = 0; j < cols; j++) {
    for (int i = 0; i < rows; i++) {
        cout << matrix[i][j] << " ";
    }
    cout << endl;
}
```

```java
int rows = matrix.length, cols = matrix[0].length;
for (int j = 0; j < cols; j++) {
    for (int i = 0; i < rows; i++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

```python
rows, cols = len(matrix), len(matrix[0])
for j in range(cols):
    for i in range(rows):
        print(matrix[i][j], end=" ")
    print()
```

```javascript
const rows = matrix.length, cols = matrix[0].length;
for (let j = 0; j < cols; j++) {
    for (let i = 0; i < rows; i++) {
        process.stdout.write(matrix[i][j] + " ");
    }
    console.log();
}
```

## Transpose a matrix

Swap rows and columns: `result[j][i] = matrix[i][j]`

```
Original:    Transposed:
1 2 3        1 4 7
4 5 6        2 5 8
7 8 9        3 6 9
```

```cpp
vector<vector<int>> transpose(vector<vector<int>>& matrix) {
    int rows = matrix.size(), cols = matrix[0].size();
    vector<vector<int>> result(cols, vector<int>(rows));
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}
```

```java
int[][] transpose(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    int[][] result = new int[cols][rows];
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}
```

```python
def transpose(matrix):
    rows, cols = len(matrix), len(matrix[0])
    return [[matrix[i][j] for i in range(rows)] for j in range(cols)]
# Python shortcut: list(zip(*matrix))
```

```javascript
function transpose(matrix) {
    const rows = matrix.length, cols = matrix[0].length;
    const result = Array.from({ length: cols }, () => []);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = matrix[i][j];
        }
    }
    return result;
}
```

Time: O(m × n). Space: O(m × n) for the new matrix.

### In-place transpose (square matrix only)

For a square matrix, swap `matrix[i][j]` with `matrix[j][i]` for i < j:

```cpp
void transposeInPlace(vector<vector<int>>& matrix) {
    int n = matrix.size();
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            swap(matrix[i][j], matrix[j][i]);
        }
    }
}
```

```java
void transposeInPlace(int[][] matrix) {
    int n = matrix.length;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
}
```

```python
def transpose_in_place(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
```

```javascript
function transposeInPlace(matrix) {
    const n = matrix.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
}
```

## Rotate a matrix 90° clockwise

A classic interview question. The trick: **transpose, then reverse each row**.

```
Original:    After transpose:    After reversing rows:
1 2 3        1 4 7               7 4 1
4 5 6   →    2 5 8          →    8 5 2
7 8 9        3 6 9               9 6 3
```

```cpp
void rotate90(vector<vector<int>>& matrix) {
    int n = matrix.size();
    // Transpose
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            swap(matrix[i][j], matrix[j][i]);
    // Reverse each row
    for (int i = 0; i < n; i++)
        reverse(matrix[i].begin(), matrix[i].end());
}
```

```java
void rotate90(int[][] matrix) {
    int n = matrix.length;
    // Transpose
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    // Reverse each row
    for (int i = 0; i < n; i++) {
        int left = 0, right = n - 1;
        while (left < right) {
            int temp = matrix[i][left];
            matrix[i][left] = matrix[i][right];
            matrix[i][right] = temp;
            left++;
            right--;
        }
    }
}
```

```python
def rotate_90(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()
```

```javascript
function rotate90(matrix) {
    const n = matrix.length;
    // Transpose
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    // Reverse each row
    for (const row of matrix) row.reverse();
}
```

Time: O(n²). Space: O(1) — done in-place.

## When to use 2D arrays in DSA

- **Grid/maze problems** — BFS/DFS on a grid.
- **Game boards** — tic-tac-toe, chess, Sudoku.
- **Graph adjacency matrix** — `matrix[i][j] = 1` means an edge from i to j.
- **Dynamic programming** — many 2D DP problems use a table.
- **Image processing** — pixels arranged in a grid.

## Summary

- A 2D array is an array of arrays, accessed with `[row][col]`.
- Traverse row-major for standard processing, column-major when needed.
- Transpose swaps rows and columns: O(n²) time.
- Rotate 90° clockwise = transpose + reverse each row.

Next: **Common Array Problems →**
