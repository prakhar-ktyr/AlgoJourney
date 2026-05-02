---
title: Balanced BSTs
---

# Balanced BSTs

## Why Balance Matters

A BST's performance depends on its **height**. In the best case, a BST with `n` nodes has height $O(\log n)$. But if we insert sorted data, the tree degenerates into a linked list with height $O(n)$:

```
Insert: 1, 2, 3, 4, 5

Degenerate BST:         Balanced BST (same data):
1                              3
 \                            / \
  2                          2   4
   \                        /     \
    3                      1       5
     \
      4                 Height: 2 (log₂5 ≈ 2.3)
       \
        5

Height: 4 (= n-1)
```

| Tree Shape | Search | Insert | Delete |
|-----------|--------|--------|--------|
| Balanced | O(log n) | O(log n) | O(log n) |
| Degenerate | O(n) | O(n) | O(n) |

**Self-balancing BSTs** automatically maintain $O(\log n)$ height after every insertion and deletion.

---

## AVL Trees

Named after Adelson-Velsky and Landis (1962), AVL trees were the **first self-balancing BST**.

### Balance Factor

For every node:

$$\text{Balance Factor} = \text{height(left subtree)} - \text{height(right subtree)}$$

An AVL tree requires that every node's balance factor is **-1, 0, or 1**.

```
         30 (BF=1)
        /  \
  (BF=0) 20   40 (BF=0)
      /
    10 (BF=0)

This is a valid AVL tree.
```

```
         30 (BF=2) ← INVALID!
        /
      20 (BF=1)
      /
    10 (BF=0)

Balance factor of 30 is 2 → needs rebalancing.
```

---

## Rotations

When a node becomes unbalanced (BF = ±2), we fix it using **rotations**. There are four cases:

### Case 1: Left-Left (Right Rotation)

The imbalance is caused by insertion in the **left subtree of the left child**.

**Fix:** Single right rotation at the unbalanced node.

```
Before (Left-Left):        After (Right Rotation):
        30                        20
       /                         /  \
      20                       10    30
     /
    10

Steps:
1. 20 becomes the new root
2. 30 becomes 20's right child
3. 20's original right child (if any) becomes 30's left child
```

### Case 2: Right-Right (Left Rotation)

The imbalance is caused by insertion in the **right subtree of the right child**.

**Fix:** Single left rotation at the unbalanced node.

```
Before (Right-Right):      After (Left Rotation):
    10                          20
      \                        /  \
      20                     10    30
        \
        30

Steps:
1. 20 becomes the new root
2. 10 becomes 20's left child
3. 20's original left child (if any) becomes 10's right child
```

### Case 3: Left-Right (Left-Right Rotation)

The imbalance is caused by insertion in the **right subtree of the left child**.

**Fix:** Left rotation on left child, then right rotation on unbalanced node.

```
Before (Left-Right):       After Step 1 (Left      After Step 2 (Right
                           rotate on 10):           rotate on 30):
        30                      30                       20
       /                       /                        /  \
      10                     20                       10    30
        \                   /
        20                10

Step 1: Left rotate at node 10 → converts to Left-Left case
Step 2: Right rotate at node 30 → balanced!
```

### Case 4: Right-Left (Right-Left Rotation)

The imbalance is caused by insertion in the **left subtree of the right child**.

**Fix:** Right rotation on right child, then left rotation on unbalanced node.

```
Before (Right-Left):       After Step 1 (Right     After Step 2 (Left
                           rotate on 30):           rotate on 10):
    10                        10                        20
      \                         \                      /  \
      30                        20                   10    30
      /                           \
    20                            30

Step 1: Right rotate at node 30 → converts to Right-Right case
Step 2: Left rotate at node 10 → balanced!
```

---

## How to Identify Which Rotation to Use

After insertion, walk back up to find the first unbalanced node (BF = ±2):

| Balance Factor | Child's BF | Case | Fix |
|---------------|-----------|------|-----|
| +2 (left-heavy) | +1 or 0 | Left-Left | Right rotation |
| +2 (left-heavy) | -1 | Left-Right | Left rotate child, then right rotate |
| -2 (right-heavy) | -1 or 0 | Right-Right | Left rotation |
| -2 (right-heavy) | +1 | Right-Left | Right rotate child, then left rotate |

---

## AVL Insertion Example

Insert 5, 3, 7, 2, 4, 1 into an AVL tree:

```
Insert 5:     5(BF=0)

Insert 3:     5(BF=1)
             /
           3(BF=0)

Insert 7:     5(BF=0)
             / \
           3    7

Insert 2:     5(BF=1)
             / \
           3    7
          /
         2

Insert 4:     5(BF=1)
             / \
           3    7
          / \
         2   4

Insert 1:     5(BF=2) ← UNBALANCED!
             / \
           3    7
          / \
         2   4
        /
       1

Node 5 has BF=2, left child (3) has BF=1 → Left-Left case
Fix: Right rotation at 5

Result:       3(BF=0)
             / \
           2    5
          /    / \
         1   4    7
```

---

## Rotation Code (Pseudocode Style)

### C++

```cpp
struct AVLNode {
    int val, height;
    AVLNode *left, *right;
    AVLNode(int x) : val(x), height(0), left(nullptr), right(nullptr) {}
};

int getHeight(AVLNode* node) {
    return node ? node->height : -1;
}

int getBalance(AVLNode* node) {
    return node ? getHeight(node->left) - getHeight(node->right) : 0;
}

void updateHeight(AVLNode* node) {
    node->height = 1 + max(getHeight(node->left), getHeight(node->right));
}

AVLNode* rightRotate(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;

    // Perform rotation
    x->right = y;
    y->left = T2;

    // Update heights
    updateHeight(y);
    updateHeight(x);

    return x; // New root
}

AVLNode* leftRotate(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;

    // Perform rotation
    y->left = x;
    x->right = T2;

    // Update heights
    updateHeight(x);
    updateHeight(y);

    return y; // New root
}

AVLNode* insert(AVLNode* node, int val) {
    // Standard BST insert
    if (node == nullptr) return new AVLNode(val);
    if (val < node->val) node->left = insert(node->left, val);
    else if (val > node->val) node->right = insert(node->right, val);
    else return node; // No duplicates

    updateHeight(node);
    int balance = getBalance(node);

    // Left-Left
    if (balance > 1 && val < node->left->val)
        return rightRotate(node);
    // Right-Right
    if (balance < -1 && val > node->right->val)
        return leftRotate(node);
    // Left-Right
    if (balance > 1 && val > node->left->val) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    // Right-Left
    if (balance < -1 && val < node->right->val) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}
```

### Java

```java
class AVLNode {
    int val, height;
    AVLNode left, right;
    AVLNode(int x) { val = x; height = 0; }
}

int getHeight(AVLNode node) {
    return node != null ? node.height : -1;
}

int getBalance(AVLNode node) {
    return node != null ? getHeight(node.left) - getHeight(node.right) : 0;
}

void updateHeight(AVLNode node) {
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

AVLNode rightRotate(AVLNode y) {
    AVLNode x = y.left;
    AVLNode T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);
    return x;
}

AVLNode leftRotate(AVLNode x) {
    AVLNode y = x.right;
    AVLNode T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);
    return y;
}

AVLNode insert(AVLNode node, int val) {
    if (node == null) return new AVLNode(val);
    if (val < node.val) node.left = insert(node.left, val);
    else if (val > node.val) node.right = insert(node.right, val);
    else return node;

    updateHeight(node);
    int balance = getBalance(node);

    if (balance > 1 && val < node.left.val) return rightRotate(node);
    if (balance < -1 && val > node.right.val) return leftRotate(node);
    if (balance > 1 && val > node.left.val) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
    }
    if (balance < -1 && val < node.right.val) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
    }
    return node;
}
```

### Python

```python
class AVLNode:
    def __init__(self, val):
        self.val = val
        self.height = 0
        self.left = None
        self.right = None

def get_height(node):
    return node.height if node else -1

def get_balance(node):
    return get_height(node.left) - get_height(node.right) if node else 0

def update_height(node):
    node.height = 1 + max(get_height(node.left), get_height(node.right))

def right_rotate(y):
    x = y.left
    T2 = x.right

    x.right = y
    y.left = T2

    update_height(y)
    update_height(x)
    return x

def left_rotate(x):
    y = x.right
    T2 = y.left

    y.left = x
    x.right = T2

    update_height(x)
    update_height(y)
    return y

def insert(node, val):
    if node is None:
        return AVLNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    else:
        return node

    update_height(node)
    balance = get_balance(node)

    # Left-Left
    if balance > 1 and val < node.left.val:
        return right_rotate(node)
    # Right-Right
    if balance < -1 and val > node.right.val:
        return left_rotate(node)
    # Left-Right
    if balance > 1 and val > node.left.val:
        node.left = left_rotate(node.left)
        return right_rotate(node)
    # Right-Left
    if balance < -1 and val < node.right.val:
        node.right = right_rotate(node.right)
        return left_rotate(node)

    return node
```

### JavaScript

```javascript
class AVLNode {
  constructor(val) {
    this.val = val;
    this.height = 0;
    this.left = null;
    this.right = null;
  }
}

function getHeight(node) {
  return node ? node.height : -1;
}

function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function updateHeight(node) {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function rightRotate(y) {
  const x = y.left;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x) {
  const y = x.right;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);
  return y;
}

function insert(node, val) {
  if (node === null) return new AVLNode(val);
  if (val < node.val) node.left = insert(node.left, val);
  else if (val > node.val) node.right = insert(node.right, val);
  else return node;

  updateHeight(node);
  const balance = getBalance(node);

  if (balance > 1 && val < node.left.val) return rightRotate(node);
  if (balance < -1 && val > node.right.val) return leftRotate(node);
  if (balance > 1 && val > node.left.val) {
    node.left = leftRotate(node.left);
    return rightRotate(node);
  }
  if (balance < -1 && val < node.right.val) {
    node.right = rightRotate(node.right);
    return leftRotate(node);
  }
  return node;
}
```

---

## Why Rotations Work

A rotation restructures the tree while **preserving the BST property**:

```
Right rotation at y:
      y                x
     / \              / \
    x   C    →       A   y
   / \                  / \
  A   B                B   C

Inorder before: A, x, B, y, C
Inorder after:  A, x, B, y, C  ← Same! BST property preserved.
```

The key insight: rotations only change the **structure** (parent-child relationships), not the **ordering** of elements.

---

## Red-Black Trees (Overview)

Red-Black trees are another self-balancing BST, used in:
- Java's `TreeMap` and `TreeSet`
- C++'s `std::map` and `std::set`
- Linux kernel's process scheduler

### Properties

Every node is colored **Red** or **Black**, and the tree satisfies:

1. Every node is either red or black.
2. The root is always black.
3. Every leaf (null) is black.
4. If a node is red, both its children are black (no two consecutive reds).
5. Every path from root to a leaf has the **same number of black nodes** (black-height).

```
         8(B)
        /    \
      4(R)   12(R)
     /  \    /  \
   2(B) 6(B) 10(B) 14(B)
```

### AVL vs Red-Black

| Property | AVL Tree | Red-Black Tree |
|----------|----------|----------------|
| Balance strictness | Strictly balanced (BF ≤ 1) | Less strict (≤ 2x height diff) |
| Max height | ~1.44 log₂(n) | ~2 log₂(n) |
| Lookup speed | Slightly faster | Slightly slower |
| Insert/Delete | More rotations | Fewer rotations |
| Use case | Read-heavy workloads | Write-heavy workloads |

---

## The Guarantee: O(log n)

Both AVL and Red-Black trees guarantee that the height stays $O(\log n)$:

- **AVL:** Height ≤ $1.44 \log_2(n+2)$
- **Red-Black:** Height ≤ $2 \log_2(n+1)$

This means **all operations** (search, insert, delete) are guaranteed $O(\log n)$, regardless of insertion order.

```
Insert 1, 2, 3, 4, 5, 6, 7 into:

Regular BST:          AVL Tree:
1                        4
 \                      / \
  2                    2   6
   \                  / \ / \
    3                1  3 5  7
     \
      4             Height: 2
       \
        5           Guaranteed O(log n)!
         \
          6
           \
            7

Height: 6 (O(n))
```

---

## When to Use What

| Situation | Data Structure |
|-----------|---------------|
| Need sorted data with frequent lookups | AVL tree |
| Need sorted data with frequent inserts/deletes | Red-Black tree |
| Language standard library | Usually Red-Black (Java, C++, etc.) |
| Database indexes | B-trees (a generalization) |
| In coding interviews | Understand concepts; use language's built-in sorted containers |

---

## Key Takeaways

1. Unbalanced BSTs degrade to O(n) — self-balancing trees prevent this.
2. AVL trees use **balance factors** and **rotations** to stay within height ~1.44 log n.
3. There are exactly 4 rotation cases: LL, RR, LR, RL.
4. Rotations preserve the BST inorder property — they only change structure.
5. Red-Black trees are less strictly balanced but require fewer rotations on writes.
6. In practice, use your language's built-in sorted map/set — they're Red-Black trees internally.

---

Next: **Heaps →**
