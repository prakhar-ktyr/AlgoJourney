---
title: Binary Search Trees
---

# Binary Search Trees

A **Binary Search Tree (BST)** is a binary tree with a special ordering property:

> For every node, **all values in the left subtree are less** than the node's value, and **all values in the right subtree are greater** than the node's value.

This property enables efficient searching, insertion, and deletion — all in **O(log n)** time for balanced trees.

---

## BST Property Visualized

```
         8
        / \
       3   10
      / \    \
     1   6   14
        / \  /
       4  7 13
```

- Every node in 3's left subtree (1) is < 3
- Every node in 3's right subtree (4, 6, 7) is > 3
- Every node in 8's left subtree (1, 3, 4, 6, 7) is < 8
- Every node in 8's right subtree (10, 13, 14) is > 8

---

## Searching in a BST

**Algorithm:** Start at root. If target equals current node, found. If target is less, go left. If target is greater, go right. If you hit null, the value doesn't exist.

```
Search for 6 in the tree above:
  8 → 6 < 8, go left
  3 → 6 > 3, go right
  6 → Found!

Search for 5:
  8 → 5 < 8, go left
  3 → 5 > 3, go right
  6 → 5 < 6, go left
  4 → 5 > 4, go right
  null → Not found!
```

### C++

```cpp
TreeNode* search(TreeNode* root, int target) {
    if (root == nullptr || root->val == target) {
        return root;
    }
    if (target < root->val) {
        return search(root->left, target);
    }
    return search(root->right, target);
}
```

### Java

```java
TreeNode search(TreeNode root, int target) {
    if (root == null || root.val == target) {
        return root;
    }
    if (target < root.val) {
        return search(root.left, target);
    }
    return search(root.right, target);
}
```

### Python

```python
def search(root, target):
    if root is None or root.val == target:
        return root
    if target < root.val:
        return search(root.left, target)
    return search(root.right, target)
```

### JavaScript

```javascript
function search(root, target) {
  if (root === null || root.val === target) {
    return root;
  }
  if (target < root.val) {
    return search(root.left, target);
  }
  return search(root.right, target);
}
```

---

## Insertion in a BST

**Algorithm:** Navigate down the tree using the BST property until you find a null spot — that's where the new node goes.

```
Insert 5 into:
         8
        / \
       3   10
      / \    \
     1   6   14

  8 → 5 < 8, go left
  3 → 5 > 3, go right
  6 → 5 < 6, go left
  null → Insert 5 here!

Result:
         8
        / \
       3   10
      / \    \
     1   6   14
        /
       5
```

### C++

```cpp
TreeNode* insert(TreeNode* root, int val) {
    if (root == nullptr) {
        return new TreeNode(val);
    }
    if (val < root->val) {
        root->left = insert(root->left, val);
    } else if (val > root->val) {
        root->right = insert(root->right, val);
    }
    // If val == root->val, duplicate — don't insert
    return root;
}
```

### Java

```java
TreeNode insert(TreeNode root, int val) {
    if (root == null) {
        return new TreeNode(val);
    }
    if (val < root.val) {
        root.left = insert(root.left, val);
    } else if (val > root.val) {
        root.right = insert(root.right, val);
    }
    return root;
}
```

### Python

```python
def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root
```

### JavaScript

```javascript
function insert(root, val) {
  if (root === null) {
    return new TreeNode(val);
  }
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else if (val > root.val) {
    root.right = insert(root.right, val);
  }
  return root;
}
```

---

## Finding Minimum and Maximum

In a BST:
- The **minimum** value is the leftmost node (keep going left).
- The **maximum** value is the rightmost node (keep going right).

```
         8
        / \
       3   10
      / \    \
     1   6   14

Min: go left from 8 → 3 → 1 (no more left) → Min = 1
Max: go right from 8 → 10 → 14 (no more right) → Max = 14
```

### C++

```cpp
TreeNode* findMin(TreeNode* root) {
    while (root->left != nullptr) {
        root = root->left;
    }
    return root;
}

TreeNode* findMax(TreeNode* root) {
    while (root->right != nullptr) {
        root = root->right;
    }
    return root;
}
```

### Java

```java
TreeNode findMin(TreeNode root) {
    while (root.left != null) {
        root = root.left;
    }
    return root;
}

TreeNode findMax(TreeNode root) {
    while (root.right != null) {
        root = root.right;
    }
    return root;
}
```

### Python

```python
def find_min(root):
    while root.left is not None:
        root = root.left
    return root

def find_max(root):
    while root.right is not None:
        root = root.right
    return root
```

### JavaScript

```javascript
function findMin(root) {
  while (root.left !== null) {
    root = root.left;
  }
  return root;
}

function findMax(root) {
  while (root.right !== null) {
    root = root.right;
  }
  return root;
}
```

---

## Inorder Traversal Gives Sorted Order

A key property of BSTs: **inorder traversal** visits nodes in ascending order.

```
         8
        / \
       3   10
      / \    \
     1   6   14
        / \  /
       4  7 13

Inorder: [1, 3, 4, 6, 7, 8, 10, 13, 14]  ← sorted!
```

This makes BSTs useful for maintaining sorted data that supports dynamic insertion and deletion.

### C++

```cpp
void inorder(TreeNode* root) {
    if (root == nullptr) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
// Output: 1 3 4 6 7 8 10 13 14
```

### Java

```java
void inorder(TreeNode root) {
    if (root == null) return;
    inorder(root.left);
    System.out.print(root.val + " ");
    inorder(root.right);
}
// Output: 1 3 4 6 7 8 10 13 14
```

### Python

```python
def inorder(root):
    if root is None:
        return
    inorder(root.left)
    print(root.val, end=" ")
    inorder(root.right)

# Output: 1 3 4 6 7 8 10 13 14
```

### JavaScript

```javascript
function inorder(root) {
  if (root === null) return;
  inorder(root.left);
  process.stdout.write(root.val + " ");
  inorder(root.right);
}
// Output: 1 3 4 6 7 8 10 13 14
```

---

## Building a BST from Values

Insert values one by one to build a BST:

```
Values: [8, 3, 10, 1, 6, 14, 4, 7, 13]

Insert 8:   8
Insert 3:   8         Insert 10:  8
           /                     / \
          3                     3  10

...continuing all insertions:

         8
        / \
       3   10
      / \    \
     1   6   14
        / \  /
       4  7 13
```

### Python (Complete Example)

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def inorder(root, result=None):
    if result is None:
        result = []
    if root is None:
        return result
    inorder(root.left, result)
    result.append(root.val)
    inorder(root.right, result)
    return result

# Build BST
values = [8, 3, 10, 1, 6, 14, 4, 7, 13]
root = None
for v in values:
    root = insert(root, v)

print(inorder(root))  # [1, 3, 4, 6, 7, 8, 10, 13, 14]
print(search(root, 7))  # TreeNode with val=7
print(search(root, 5))  # None
```

---

## Complexity

| Operation | Average Case | Worst Case (skewed) |
|-----------|-------------|-------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Find Min/Max | O(log n) | O(n) |
| Inorder | O(n) | O(n) |

The worst case happens when the tree degenerates into a linked list (e.g., inserting sorted data: 1, 2, 3, 4, 5...).

```
Balanced:          Degenerate:
    4                1
   / \                \
  2   6                2
 / \ / \                \
1  3 5  7                3
                          \
                           4

Height: O(log n)    Height: O(n)
```

This is why **balanced BSTs** (AVL trees, Red-Black trees) exist — they guarantee O(log n) height.

---

## Key Takeaways

1. BST property: left < root < right for every node.
2. Search, insert, and find min/max all follow the same pattern — compare and go left or right.
3. Inorder traversal of a BST produces sorted output.
4. Performance degrades to O(n) for skewed trees — balanced BSTs solve this.

---

Next: **BST Operations →**
