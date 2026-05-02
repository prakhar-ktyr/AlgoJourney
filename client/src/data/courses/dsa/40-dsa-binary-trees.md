---
title: Binary Trees
---

# Binary Trees

A **binary tree** is a hierarchical data structure where each node has **at most two children**, referred to as the **left child** and the **right child**. Binary trees are the foundation for many advanced data structures like BSTs, heaps, and segment trees.

---

## Terminology

| Term | Meaning |
|------|---------|
| **Root** | The topmost node (no parent) |
| **Leaf** | A node with no children |
| **Edge** | Connection between parent and child |
| **Height** | Longest path from root to a leaf |
| **Depth** | Distance from root to a given node |
| **Level** | Set of nodes at the same depth |
| **Subtree** | A node plus all its descendants |

---

## Types of Binary Trees

### 1. Full Binary Tree

Every node has **0 or 2** children (never just 1).

```
        1
       / \
      2   3
     / \
    4   5
```

### 2. Complete Binary Tree

All levels are fully filled **except possibly the last**, which is filled from left to right.

```
        1
       / \
      2   3
     / \  /
    4  5  6
```

### 3. Perfect Binary Tree

All internal nodes have 2 children **and** all leaves are at the same level.

```
        1
       / \
      2   3
     / \ / \
    4  5 6  7
```

### 4. Degenerate (Skewed) Tree

Every internal node has only **one** child — essentially a linked list.

```
    1
     \
      2
       \
        3
         \
          4
```

---

## Properties & Formulas

| Property | Formula |
|----------|---------|
| Max nodes at level `l` | $2^l$ |
| Max nodes in tree of height `h` | $2^{h+1} - 1$ |
| Min height for `n` nodes | $\lfloor \log_2 n \rfloor$ |
| Number of leaves in a perfect tree of height `h` | $2^h$ |
| For any binary tree: `leaves = internal nodes with 2 children + 1` | $L = I + 1$ |

---

## TreeNode Structure

### C++

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;

    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
```

### Java

```java
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int x) {
        val = x;
        left = null;
        right = null;
    }
}
```

### Python

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None
```

### JavaScript

```javascript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}
```

---

## Building a Tree Manually

Let's build this tree:

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

### C++

```cpp
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);
    root->right->right = new TreeNode(6);

    cout << "Root: " << root->val << endl;           // 1
    cout << "Left child: " << root->left->val << endl; // 2
    cout << "Right child: " << root->right->val << endl; // 3
    return 0;
}
```

### Java

```java
public class Main {
    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);

        System.out.println("Root: " + root.val);           // 1
        System.out.println("Left child: " + root.left.val); // 2
        System.out.println("Right child: " + root.right.val); // 3
    }
}
```

### Python

```python
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)
root.right.right = TreeNode(6)

print("Root:", root.val)           # 1
print("Left child:", root.left.val) # 2
print("Right child:", root.right.val) # 3
```

### JavaScript

```javascript
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);
root.right.right = new TreeNode(6);

console.log("Root:", root.val);           // 1
console.log("Left child:", root.left.val); // 2
console.log("Right child:", root.right.val); // 3
```

---

## Counting Nodes

Count the total number of nodes in a binary tree using recursion:

**Idea:** Total nodes = 1 (current) + nodes in left subtree + nodes in right subtree.

### C++

```cpp
int countNodes(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}
```

### Java

```java
int countNodes(TreeNode root) {
    if (root == null) return 0;
    return 1 + countNodes(root.left) + countNodes(root.right);
}
```

### Python

```python
def count_nodes(root):
    if root is None:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)
```

### JavaScript

```javascript
function countNodes(root) {
  if (root === null) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}
```

For our example tree: `countNodes(root)` → **6**

---

## Finding the Height of a Tree

The height is the number of edges on the longest path from root to a leaf.

**Idea:** Height = 1 + max(height of left subtree, height of right subtree). An empty tree has height -1.

### C++

```cpp
int height(TreeNode* root) {
    if (root == nullptr) return -1;
    return 1 + max(height(root->left), height(root->right));
}
```

### Java

```java
int height(TreeNode root) {
    if (root == null) return -1;
    return 1 + Math.max(height(root.left), height(root.right));
}
```

### Python

```python
def height(root):
    if root is None:
        return -1
    return 1 + max(height(root.left), height(root.right))
```

### JavaScript

```javascript
function height(root) {
  if (root === null) return -1;
  return 1 + Math.max(height(root.left), height(root.right));
}
```

For our example tree:

```
        1          ← level 0
       / \
      2   3        ← level 1
     / \   \
    4   5   6      ← level 2

Height = 2 (longest path: 1 → 2 → 4 or 1 → 2 → 5 or 1 → 3 → 6)
```

---

## Complexity Summary

| Operation | Time | Space |
|-----------|------|-------|
| Count nodes | O(n) | O(h) recursion stack |
| Find height | O(n) | O(h) recursion stack |
| Access a node | O(n) worst case | — |

Where `n` = number of nodes and `h` = height of tree. For a balanced tree, $h = O(\log n)$.

---

## Key Takeaways

1. A binary tree allows at most 2 children per node.
2. Different tree types (full, complete, perfect) have different structural guarantees.
3. Recursion is the natural way to operate on trees — most algorithms follow the pattern: process root, recurse left, recurse right.
4. Height and node count are foundational operations you'll use repeatedly.

---

Next: **Binary Tree Traversals →**
