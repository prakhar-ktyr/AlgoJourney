---
title: BST Operations
---

# BST Operations

Now that we understand basic BST structure, search, and insertion, let's tackle the more complex operations: **deletion**, **validation**, **finding the kth smallest element**, and **lowest common ancestor**.

---

## Deletion in a BST

Deletion is the trickiest BST operation because we must maintain the BST property after removing a node. There are **three cases**:

### Case 1: Node is a Leaf (no children)

Simply remove it.

```
Delete 4:
     5              5
    / \     →      / \
   3   7          3   7
  / \            /
 2   4          2
```

### Case 2: Node has One Child

Replace the node with its child.

```
Delete 3 (has left child only):
     5              5
    / \     →      / \
   3   7          2   7
  /
 2
```

### Case 3: Node has Two Children

Find the **inorder successor** (smallest node in right subtree), copy its value to the node being deleted, then delete the successor (which has at most one child).

```
Delete 5 (has two children):
     5              6
    / \     →      / \
   3   7          3   7
  / \  /         / \
 2  4 6         2   4

Step 1: Find inorder successor of 5 → 6 (leftmost in right subtree)
Step 2: Replace 5's value with 6
Step 3: Delete the original 6 (leaf node)
```

### Implementation

#### C++

```cpp
TreeNode* deleteNode(TreeNode* root, int key) {
    if (root == nullptr) return nullptr;

    if (key < root->val) {
        root->left = deleteNode(root->left, key);
    } else if (key > root->val) {
        root->right = deleteNode(root->right, key);
    } else {
        // Found the node to delete

        // Case 1 & 2: No child or one child
        if (root->left == nullptr) {
            TreeNode* temp = root->right;
            delete root;
            return temp;
        }
        if (root->right == nullptr) {
            TreeNode* temp = root->left;
            delete root;
            return temp;
        }

        // Case 3: Two children
        // Find inorder successor (smallest in right subtree)
        TreeNode* successor = root->right;
        while (successor->left != nullptr) {
            successor = successor->left;
        }
        root->val = successor->val;
        root->right = deleteNode(root->right, successor->val);
    }
    return root;
}
```

#### Java

```java
TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;

    if (key < root.val) {
        root.left = deleteNode(root.left, key);
    } else if (key > root.val) {
        root.right = deleteNode(root.right, key);
    } else {
        // Case 1 & 2
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;

        // Case 3: Two children
        TreeNode successor = root.right;
        while (successor.left != null) {
            successor = successor.left;
        }
        root.val = successor.val;
        root.right = deleteNode(root.right, successor.val);
    }
    return root;
}
```

#### Python

```python
def delete_node(root, key):
    if root is None:
        return None

    if key < root.val:
        root.left = delete_node(root.left, key)
    elif key > root.val:
        root.right = delete_node(root.right, key)
    else:
        # Case 1 & 2
        if root.left is None:
            return root.right
        if root.right is None:
            return root.left

        # Case 3: Two children
        successor = root.right
        while successor.left is not None:
            successor = successor.left
        root.val = successor.val
        root.right = delete_node(root.right, successor.val)

    return root
```

#### JavaScript

```javascript
function deleteNode(root, key) {
  if (root === null) return null;

  if (key < root.val) {
    root.left = deleteNode(root.left, key);
  } else if (key > root.val) {
    root.right = deleteNode(root.right, key);
  } else {
    // Case 1 & 2
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;

    // Case 3: Two children
    let successor = root.right;
    while (successor.left !== null) {
      successor = successor.left;
    }
    root.val = successor.val;
    root.right = deleteNode(root.right, successor.val);
  }
  return root;
}
```

---

## Validating a BST

A common mistake is checking only `left.val < root.val < right.val` for each node. That's not enough! We need to check that **all** nodes in the left subtree are less than root, not just the immediate child.

```
      5
     / \
    1   6
       / \
      3   7     ← INVALID! 3 < 5 but it's in the right subtree
```

**Correct approach:** Pass down valid ranges (min, max) for each node.

#### C++

```cpp
bool isValidBST(TreeNode* root, long minVal = LONG_MIN, long maxVal = LONG_MAX) {
    if (root == nullptr) return true;
    if (root->val <= minVal || root->val >= maxVal) return false;
    return isValidBST(root->left, minVal, root->val) &&
           isValidBST(root->right, root->val, maxVal);
}
```

#### Java

```java
boolean isValidBST(TreeNode root) {
    return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
}

boolean validate(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return validate(node.left, min, node.val) &&
           validate(node.right, node.val, max);
}
```

#### Python

```python
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if root is None:
        return True
    if root.val <= min_val or root.val >= max_val:
        return False
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))
```

#### JavaScript

```javascript
function isValidBST(root, min = -Infinity, max = Infinity) {
  if (root === null) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) &&
         isValidBST(root.right, root.val, max);
}
```

**Alternative approach:** Do an inorder traversal and check if the result is strictly increasing.

```python
def is_valid_bst_inorder(root):
    prev = float('-inf')

    def inorder(node):
        nonlocal prev
        if node is None:
            return True
        if not inorder(node.left):
            return False
        if node.val <= prev:
            return False
        prev = node.val
        return inorder(node.right)

    return inorder(root)
```

---

## Finding the Kth Smallest Element

Since inorder traversal of a BST gives sorted order, the kth smallest element is the kth node visited during inorder traversal.

```
         5
        / \
       3   7
      / \   \
     2   4   8
    /
   1

Inorder: [1, 2, 3, 4, 5, 7, 8]
1st smallest = 1
3rd smallest = 3
5th smallest = 5
```

#### C++

```cpp
int kthSmallest(TreeNode* root, int k) {
    int count = 0;
    int result = 0;

    function<void(TreeNode*)> inorder = [&](TreeNode* node) {
        if (node == nullptr || count >= k) return;
        inorder(node->left);
        count++;
        if (count == k) {
            result = node->val;
            return;
        }
        inorder(node->right);
    };

    inorder(root);
    return result;
}
```

#### Java

```java
int count = 0;
int result = 0;

int kthSmallest(TreeNode root, int k) {
    count = 0;
    result = 0;
    inorder(root, k);
    return result;
}

void inorder(TreeNode node, int k) {
    if (node == null || count >= k) return;
    inorder(node.left, k);
    count++;
    if (count == k) {
        result = node.val;
        return;
    }
    inorder(node.right, k);
}
```

#### Python

```python
def kth_smallest(root, k):
    count = [0]
    result = [None]

    def inorder(node):
        if node is None or count[0] >= k:
            return
        inorder(node.left)
        count[0] += 1
        if count[0] == k:
            result[0] = node.val
            return
        inorder(node.right)

    inorder(root)
    return result[0]
```

#### JavaScript

```javascript
function kthSmallest(root, k) {
  let count = 0;
  let result = null;

  function inorder(node) {
    if (node === null || count >= k) return;
    inorder(node.left);
    count++;
    if (count === k) {
      result = node.val;
      return;
    }
    inorder(node.right);
  }

  inorder(root);
  return result;
}
```

**Time:** O(H + k) where H is the height. **Space:** O(H) for the recursion stack.

---

## Lowest Common Ancestor (LCA) in BST

The **lowest common ancestor** of two nodes `p` and `q` is the deepest node that is an ancestor of both.

In a BST, we can exploit the ordering property:
- If both `p` and `q` are less than current node → LCA is in the left subtree.
- If both are greater → LCA is in the right subtree.
- Otherwise, current node is the LCA (the paths to p and q diverge here).

```
         6
        / \
       2   8
      / \ / \
     0  4 7  9
       / \
      3   5

LCA(2, 8) = 6  (one left, one right of 6)
LCA(2, 4) = 2  (4 is in 2's subtree)
LCA(3, 5) = 4  (both in 4's subtree)
```

#### C++

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    while (root != nullptr) {
        if (p->val < root->val && q->val < root->val) {
            root = root->left;
        } else if (p->val > root->val && q->val > root->val) {
            root = root->right;
        } else {
            return root;
        }
    }
    return nullptr;
}
```

#### Java

```java
TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    while (root != null) {
        if (p.val < root.val && q.val < root.val) {
            root = root.left;
        } else if (p.val > root.val && q.val > root.val) {
            root = root.right;
        } else {
            return root;
        }
    }
    return null;
}
```

#### Python

```python
def lowest_common_ancestor(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root
    return None
```

#### JavaScript

```javascript
function lowestCommonAncestor(root, p, q) {
  while (root !== null) {
    if (p.val < root.val && q.val < root.val) {
      root = root.left;
    } else if (p.val > root.val && q.val > root.val) {
      root = root.right;
    } else {
      return root;
    }
  }
  return null;
}
```

**Time:** O(H). **Space:** O(1) for iterative version.

---

## Complexity Summary

| Operation | Time (avg) | Time (worst) | Space |
|-----------|-----------|-------------|-------|
| Delete | O(log n) | O(n) | O(h) |
| Validate | O(n) | O(n) | O(h) |
| Kth Smallest | O(H + k) | O(n) | O(h) |
| LCA | O(H) | O(n) | O(1) iterative |

---

## Key Takeaways

1. **Deletion** has three cases — the two-children case uses the inorder successor.
2. **Validation** requires checking the entire valid range, not just immediate children.
3. **Kth smallest** leverages inorder traversal's sorted property.
4. **LCA in BST** is elegant — just follow where both values lead you.
5. All operations degrade to O(n) on skewed trees — balanced BSTs fix this.

---

Next: **Balanced BSTs →**
