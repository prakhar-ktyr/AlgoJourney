---
title: Binary Trees & Tree Traversals
---

# Binary Trees & Tree Traversals

Binary trees are one of the most important data structures in computer science. They provide efficient ways to organize, search, and process hierarchical data. In this lesson, we explore the structure of binary trees, their properties, and the fundamental traversal algorithms.

---

## What Is a Binary Tree?

A **binary tree** is a rooted tree in which every node has **at most two children**, referred to as the **left child** and the **right child**.

Formally, a binary tree $T$ is either:
- Empty (null), or
- A node $r$ (the root) with a left subtree $T_L$ and a right subtree $T_R$, where both $T_L$ and $T_R$ are binary trees.

This recursive definition makes binary trees naturally suited to recursive algorithms.

---

## Types of Binary Trees

### Full Binary Tree

A binary tree is **full** (or strictly binary) if every node has either 0 or 2 children. No node has exactly one child.

- If a full binary tree has $n$ internal nodes, it has $n + 1$ leaves.

### Complete Binary Tree

A binary tree is **complete** if every level is fully filled except possibly the last level, which is filled from left to right.

- A complete binary tree with $n$ nodes has height $h = \lfloor \log_2 n \rfloor$.
- Used as the underlying structure for binary heaps.

### Perfect Binary Tree

A binary tree is **perfect** if all internal nodes have exactly 2 children and all leaves are at the same depth.

- A perfect binary tree of height $h$ has exactly $2^{h+1} - 1$ nodes.
- It has $2^h$ leaves.

---

## Height and Node Count Relationships

Let $n$ be the number of nodes and $h$ be the height of a binary tree (height = length of the longest root-to-leaf path).

**Key inequalities:**

$$h \leq n - 1$$

This maximum height occurs when the tree degenerates into a linked list (each node has only one child).

$$n \leq 2^{h+1} - 1$$

This maximum node count occurs for a perfect binary tree.

Equivalently, the minimum height for $n$ nodes is:

$$h \geq \lfloor \log_2 n \rfloor$$

**Summary table:**

| Tree Type | Height $h$ | Nodes $n$ |
|-----------|-----------|-----------|
| Degenerate (worst) | $n - 1$ | $h + 1$ |
| Perfect (best) | $\lfloor \log_2 n \rfloor$ | $2^{h+1} - 1$ |
| Complete | $\lfloor \log_2 n \rfloor$ | between $2^h$ and $2^{h+1} - 1$ |

---

## Tree Traversals

Traversal means visiting every node in a specific order. There are four standard traversals for binary trees.

### Pre-order Traversal (Root → Left → Right)

Visit the root first, then recursively traverse the left subtree, then the right subtree.

**Use case:** Copying a tree, generating prefix expressions.

### In-order Traversal (Left → Root → Right)

Recursively traverse the left subtree, visit the root, then recursively traverse the right subtree.

**Use case:** For a BST, in-order traversal visits nodes in sorted order.

### Post-order Traversal (Left → Right → Root)

Recursively traverse the left subtree, then the right subtree, then visit the root.

**Use case:** Deleting a tree (children before parent), evaluating postfix expressions.

### Level-order Traversal (Breadth-First)

Visit nodes level by level, from left to right at each level. Uses a queue.

**Use case:** Finding the shortest path in unweighted trees, printing tree level by level.

---

## Traversal Example

Consider this binary tree:

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

| Traversal | Order |
|-----------|-------|
| Pre-order | 1, 2, 4, 5, 3, 6 |
| In-order | 4, 2, 5, 1, 3, 6 |
| Post-order | 4, 5, 2, 6, 3, 1 |
| Level-order | 1, 2, 3, 4, 5, 6 |

---

## Building a Tree from Traversals

Given two traversals, we can uniquely reconstruct the binary tree (under certain conditions).

### From Pre-order + In-order

1. The first element of pre-order is the root.
2. Find the root in in-order — elements to the left form the left subtree, elements to the right form the right subtree.
3. Recurse on each subtree.

### From In-order + Post-order

1. The last element of post-order is the root.
2. Find the root in in-order to split left and right subtrees.
3. Recurse.

**Note:** Pre-order + Post-order alone is **not** sufficient to uniquely determine a binary tree (ambiguity arises when a node has only one child).

---

## Binary Search Trees (BST)

A **binary search tree** is a binary tree where for every node $v$:
- All values in the left subtree of $v$ are less than $v$'s value.
- All values in the right subtree of $v$ are greater than $v$'s value.

This property enables efficient searching:
- **Search:** $O(h)$ time
- **Insert:** $O(h)$ time
- **Delete:** $O(h)$ time

For a balanced BST, $h = O(\log n)$, giving logarithmic operations. For a degenerate BST, $h = O(n)$, giving linear operations.

---

## Expression Trees

An **expression tree** represents arithmetic expressions. Internal nodes are operators, and leaves are operands.

For the expression $(3 + 5) \times 2$:

```
        ×
       / \
      +   2
     / \
    3   5
```

- **In-order traversal** → infix: 3 + 5 × 2 (needs parentheses for correctness)
- **Pre-order traversal** → prefix: × + 3 5 2
- **Post-order traversal** → postfix: 3 5 + 2 ×

Expression trees are used in compilers to represent and evaluate expressions.

---

## Code: Implementing Tree Traversals

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

void preorder(TreeNode* root, vector<int>& result) {
    if (!root) return;
    result.push_back(root->val);
    preorder(root->left, result);
    preorder(root->right, result);
}

void inorder(TreeNode* root, vector<int>& result) {
    if (!root) return;
    inorder(root->left, result);
    result.push_back(root->val);
    inorder(root->right, result);
}

void postorder(TreeNode* root, vector<int>& result) {
    if (!root) return;
    postorder(root->left, result);
    postorder(root->right, result);
    result.push_back(root->val);
}

vector<int> levelOrder(TreeNode* root) {
    vector<int> result;
    if (!root) return result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* node = q.front();
        q.pop();
        result.push_back(node->val);
        if (node->left) q.push(node->left);
        if (node->right) q.push(node->right);
    }
    return result;
}

int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);
    root->right->right = new TreeNode(6);

    vector<int> pre, in, post;
    preorder(root, pre);
    inorder(root, in);
    postorder(root, post);
    vector<int> level = levelOrder(root);

    cout << "Pre-order: ";
    for (int v : pre) cout << v << " ";
    cout << "\nIn-order: ";
    for (int v : in) cout << v << " ";
    cout << "\nPost-order: ";
    for (int v : post) cout << v << " ";
    cout << "\nLevel-order: ";
    for (int v : level) cout << v << " ";
    cout << endl;
    return 0;
}
```

```csharp
using System;
using System.Collections.Generic;

class TreeNode {
    public int Val;
    public TreeNode Left, Right;
    public TreeNode(int val) { Val = val; Left = null; Right = null; }
}

class BinaryTreeTraversals {
    static void Preorder(TreeNode root, List<int> result) {
        if (root == null) return;
        result.Add(root.Val);
        Preorder(root.Left, result);
        Preorder(root.Right, result);
    }

    static void Inorder(TreeNode root, List<int> result) {
        if (root == null) return;
        Inorder(root.Left, result);
        result.Add(root.Val);
        Inorder(root.Right, result);
    }

    static void Postorder(TreeNode root, List<int> result) {
        if (root == null) return;
        Postorder(root.Left, result);
        Postorder(root.Right, result);
        result.Add(root.Val);
    }

    static List<int> LevelOrder(TreeNode root) {
        var result = new List<int>();
        if (root == null) return result;
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0) {
            var node = queue.Dequeue();
            result.Add(node.Val);
            if (node.Left != null) queue.Enqueue(node.Left);
            if (node.Right != null) queue.Enqueue(node.Right);
        }
        return result;
    }

    static void Main() {
        var root = new TreeNode(1);
        root.Left = new TreeNode(2);
        root.Right = new TreeNode(3);
        root.Left.Left = new TreeNode(4);
        root.Left.Right = new TreeNode(5);
        root.Right.Right = new TreeNode(6);

        var pre = new List<int>();
        var inOrd = new List<int>();
        var post = new List<int>();
        Preorder(root, pre);
        Inorder(root, inOrd);
        Postorder(root, post);
        var level = LevelOrder(root);

        Console.WriteLine("Pre-order: " + string.Join(", ", pre));
        Console.WriteLine("In-order: " + string.Join(", ", inOrd));
        Console.WriteLine("Post-order: " + string.Join(", ", post));
        Console.WriteLine("Level-order: " + string.Join(", ", level));
    }
}
```

```java
import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; left = null; right = null; }
}

public class BinaryTreeTraversals {
    static void preorder(TreeNode root, List<Integer> result) {
        if (root == null) return;
        result.add(root.val);
        preorder(root.left, result);
        preorder(root.right, result);
    }

    static void inorder(TreeNode root, List<Integer> result) {
        if (root == null) return;
        inorder(root.left, result);
        result.add(root.val);
        inorder(root.right, result);
    }

    static void postorder(TreeNode root, List<Integer> result) {
        if (root == null) return;
        postorder(root.left, result);
        postorder(root.right, result);
        result.add(root.val);
    }

    static List<Integer> levelOrder(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            result.add(node.val);
            if (node.left != null) queue.add(node.left);
            if (node.right != null) queue.add(node.right);
        }
        return result;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);

        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        preorder(root, pre);
        inorder(root, in);
        postorder(root, post);
        List<Integer> level = levelOrder(root);

        System.out.println("Pre-order: " + pre);
        System.out.println("In-order: " + in);
        System.out.println("Post-order: " + post);
        System.out.println("Level-order: " + level);
    }
}
```

```python
from collections import deque

class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def preorder(root):
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def inorder(root):
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def postorder(root):
    if not root:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]

def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result

# Build tree
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)
root.right.right = TreeNode(6)

print("Pre-order:", preorder(root))
print("In-order:", inorder(root))
print("Post-order:", postorder(root))
print("Level-order:", level_order(root))
```

```javascript
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function preorder(root) {
  if (!root) return [];
  return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

function inorder(root) {
  if (!root) return [];
  return [...inorder(root.left), root.val, ...inorder(root.right)];
}

function postorder(root) {
  if (!root) return [];
  return [...postorder(root.left), ...postorder(root.right), root.val];
}

function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

// Build tree
const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);
root.right.right = new TreeNode(6);

console.log("Pre-order:", preorder(root));
console.log("In-order:", inorder(root));
console.log("Post-order:", postorder(root));
console.log("Level-order:", levelOrder(root));
```

---

## Key Takeaways

1. **Binary trees** restrict each node to at most two children, enabling efficient recursive algorithms.
2. **Full, complete, and perfect** binary trees have specific structural properties that affect height and node count.
3. The height $h$ of a binary tree satisfies $\lfloor \log_2 n \rfloor \leq h \leq n - 1$, where $n$ is the number of nodes.
4. **Four traversal strategies** — pre-order, in-order, post-order, and level-order — each visit nodes in a different sequence and suit different applications.
5. A binary tree can be **uniquely reconstructed** from pre-order + in-order or in-order + post-order (but not pre-order + post-order alone).
6. **Binary search trees** leverage the ordering property for efficient search, insert, and delete operations.
7. **Expression trees** represent arithmetic expressions and connect traversals to prefix, infix, and postfix notation.
