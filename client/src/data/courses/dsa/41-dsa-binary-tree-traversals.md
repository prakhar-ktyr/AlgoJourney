---
title: Binary Tree Traversals
---

# Binary Tree Traversals

Traversal means visiting every node in the tree exactly once. The order in which we visit nodes defines the traversal type. There are two families: **depth-first** (inorder, preorder, postorder) and **breadth-first** (level-order).

We'll use this example tree throughout:

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

---

## Depth-First Traversals

### 1. Inorder Traversal (Left → Root → Right)

Visit the left subtree first, then the current node, then the right subtree.

**Trace on example tree:**

```
Start at 1 → go left to 2 → go left to 4 → no left
  Visit 4 → no right
Back to 2 → Visit 2 → go right to 5 → no left
  Visit 5 → no right
Back to 1 → Visit 1 → go right to 3 → no left
  Visit 3 → go right to 6 → no left
    Visit 6 → no right

Result: [4, 2, 5, 1, 3, 6]
```

#### C++

```cpp
#include <iostream>
#include <vector>
using namespace std;

void inorder(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    inorder(root->left, result);
    result.push_back(root->val);
    inorder(root->right, result);
}

// Usage:
// vector<int> result;
// inorder(root, result);
// result = [4, 2, 5, 1, 3, 6]
```

#### Java

```java
import java.util.*;

void inorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    inorder(root.left, result);
    result.add(root.val);
    inorder(root.right, result);
}

// Usage:
// List<Integer> result = new ArrayList<>();
// inorder(root, result);
// result = [4, 2, 5, 1, 3, 6]
```

#### Python

```python
def inorder(root, result=None):
    if result is None:
        result = []
    if root is None:
        return result
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)
    return result

# inorder(root) → [4, 2, 5, 1, 3, 6]
```

#### JavaScript

```javascript
function inorder(root, result = []) {
  if (root === null) return result;
  inorder(root.left, result);
  result.push(root.val);
  inorder(root.right, result);
  return result;
}

// inorder(root) → [4, 2, 5, 1, 3, 6]
```

---

### 2. Preorder Traversal (Root → Left → Right)

Visit the current node first, then the left subtree, then the right subtree.

**Trace on example tree:**

```
Visit 1 → go left
  Visit 2 → go left
    Visit 4 → no children
  go right
    Visit 5 → no children
go right
  Visit 3 → no left, go right
    Visit 6 → no children

Result: [1, 2, 4, 5, 3, 6]
```

#### C++

```cpp
void preorder(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    result.push_back(root->val);
    preorder(root->left, result);
    preorder(root->right, result);
}
```

#### Java

```java
void preorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    result.add(root.val);
    preorder(root.left, result);
    preorder(root.right, result);
}
```

#### Python

```python
def preorder(root, result=None):
    if result is None:
        result = []
    if root is None:
        return result
    result.append(root.val)
    preorder(root.left, result)
    preorder(root.right, result)
    return result

# preorder(root) → [1, 2, 4, 5, 3, 6]
```

#### JavaScript

```javascript
function preorder(root, result = []) {
  if (root === null) return result;
  result.push(root.val);
  preorder(root.left, result);
  preorder(root.right, result);
  return result;
}

// preorder(root) → [1, 2, 4, 5, 3, 6]
```

---

### 3. Postorder Traversal (Left → Right → Root)

Visit left subtree, then right subtree, then the current node.

**Trace on example tree:**

```
Go left to 2 → go left to 4
  Visit 4
Go right to 5
  Visit 5
Visit 2
Go right to 3 → no left, go right to 6
  Visit 6
Visit 3
Visit 1

Result: [4, 5, 2, 6, 3, 1]
```

#### C++

```cpp
void postorder(TreeNode* root, vector<int>& result) {
    if (root == nullptr) return;
    postorder(root->left, result);
    postorder(root->right, result);
    result.push_back(root->val);
}
```

#### Java

```java
void postorder(TreeNode root, List<Integer> result) {
    if (root == null) return;
    postorder(root.left, result);
    postorder(root.right, result);
    result.add(root.val);
}
```

#### Python

```python
def postorder(root, result=None):
    if result is None:
        result = []
    if root is None:
        return result
    postorder(root.left, result)
    postorder(root.right, result)
    result.append(root.val)
    return result

# postorder(root) → [4, 5, 2, 6, 3, 1]
```

#### JavaScript

```javascript
function postorder(root, result = []) {
  if (root === null) return result;
  postorder(root.left, result);
  postorder(root.right, result);
  result.push(root.val);
  return result;
}

// postorder(root) → [4, 5, 2, 6, 3, 1]
```

---

## Level-Order Traversal (BFS)

Visit all nodes level by level, from left to right. Uses a **queue**.

**Trace on example tree:**

```
Level 0: [1]
Level 1: [2, 3]
Level 2: [4, 5, 6]

Result: [1, 2, 3, 4, 5, 6]
```

#### C++

```cpp
#include <queue>

vector<int> levelOrder(TreeNode* root) {
    vector<int> result;
    if (root == nullptr) return result;

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
```

#### Java

```java
import java.util.*;

List<Integer> levelOrder(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;

    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);

    while (!queue.isEmpty()) {
        TreeNode node = queue.poll();
        result.add(node.val);

        if (node.left != null) queue.offer(node.left);
        if (node.right != null) queue.offer(node.right);
    }
    return result;
}
```

#### Python

```python
from collections import deque

def level_order(root):
    if root is None:
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

# level_order(root) → [1, 2, 3, 4, 5, 6]
```

#### JavaScript

```javascript
function levelOrder(root) {
  if (root === null) return [];

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

// levelOrder(root) → [1, 2, 3, 4, 5, 6]
```

---

## Iterative Inorder Traversal (Using Stack)

Recursive traversals can overflow the stack for very deep trees. Here's the iterative version of inorder:

**Algorithm:**
1. Start at root, push all left nodes onto stack.
2. Pop a node, visit it, then move to its right child.
3. Repeat until stack is empty and current is null.

#### C++

```cpp
#include <stack>

vector<int> inorderIterative(TreeNode* root) {
    vector<int> result;
    stack<TreeNode*> stk;
    TreeNode* curr = root;

    while (curr != nullptr || !stk.empty()) {
        // Go as far left as possible
        while (curr != nullptr) {
            stk.push(curr);
            curr = curr->left;
        }
        // Visit the node
        curr = stk.top();
        stk.pop();
        result.push_back(curr->val);
        // Move to right subtree
        curr = curr->right;
    }
    return result;
}
```

#### Java

```java
import java.util.*;

List<Integer> inorderIterative(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode curr = root;

    while (curr != null || !stack.isEmpty()) {
        while (curr != null) {
            stack.push(curr);
            curr = curr.left;
        }
        curr = stack.pop();
        result.add(curr.val);
        curr = curr.right;
    }
    return result;
}
```

#### Python

```python
def inorder_iterative(root):
    result = []
    stack = []
    curr = root

    while curr or stack:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right

    return result

# inorder_iterative(root) → [4, 2, 5, 1, 3, 6]
```

#### JavaScript

```javascript
function inorderIterative(root) {
  const result = [];
  const stack = [];
  let curr = root;

  while (curr !== null || stack.length > 0) {
    while (curr !== null) {
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();
    result.push(curr.val);
    curr = curr.right;
  }
  return result;
}

// inorderIterative(root) → [4, 2, 5, 1, 3, 6]
```

---

## Applications of Each Traversal

| Traversal | Common Use Cases |
|-----------|-----------------|
| **Inorder** | Get sorted order from BST, expression tree evaluation |
| **Preorder** | Copy/serialize a tree, prefix expression |
| **Postorder** | Delete a tree (children before parent), postfix expression, calculating directory sizes |
| **Level-order** | Shortest path in unweighted tree, printing tree level by level, connecting nodes at same level |

---

## Complexity

| Traversal | Time | Space |
|-----------|------|-------|
| All DFS (recursive) | O(n) | O(h) — recursion stack |
| All DFS (iterative) | O(n) | O(h) — explicit stack |
| Level-order (BFS) | O(n) | O(w) — queue width |

Where `n` = nodes, `h` = height, `w` = maximum width of the tree (up to n/2 for a complete tree's last level).

---

## Quick Reference

```
Inorder:    Left → Root → Right    → [4, 2, 5, 1, 3, 6]
Preorder:   Root → Left → Right    → [1, 2, 4, 5, 3, 6]
Postorder:  Left → Right → Root    → [4, 5, 2, 6, 3, 1]
Level-order: Level by level (BFS)  → [1, 2, 3, 4, 5, 6]
```

---

Next: **Binary Search Trees →**
