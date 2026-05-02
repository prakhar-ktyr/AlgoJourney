---
title: Trees Introduction
---

# Trees Introduction

A **tree** is a hierarchical data structure made up of nodes connected by edges. Unlike arrays or linked lists that are linear, trees branch out — making them perfect for representing hierarchical relationships.

---

## What Is a Tree?

A tree consists of:

- **Nodes** — the elements that store data
- **Edges** — the connections between nodes
- A single **root** node at the top (no parent)
- Every other node has exactly **one parent**
- Nodes can have zero or more **children**

```
         A          ← Root
       / | \
      B  C  D       ← Children of A
     / \    |
    E   F   G       ← Children of B and D
       / \
      H   I         ← Children of F
```

---

## Tree Terminology

| Term | Definition |
|------|-----------|
| **Root** | The topmost node (no parent) |
| **Parent** | A node that has children |
| **Child** | A node connected below another node |
| **Leaf** | A node with no children (terminal node) |
| **Edge** | Connection between a parent and child |
| **Sibling** | Nodes that share the same parent |
| **Ancestor** | Any node on the path from a node to the root |
| **Descendant** | Any node reachable going downward from a node |
| **Subtree** | A node and all its descendants |

### Depth, Height, and Level

```
Level 0:        A          ← depth 0, height 3
              /   \
Level 1:     B     C       ← depth 1
            / \     \
Level 2:   D   E    F      ← depth 2
          /
Level 3: G                  ← depth 3, height 0 (leaf)
```

| Term | Definition |
|------|-----------|
| **Depth** of a node | Number of edges from root to that node |
| **Height** of a node | Number of edges on the longest path from that node to a leaf |
| **Height** of tree | Height of the root node |
| **Level** | Set of all nodes at a given depth |

In the example above:
- Depth of `F` = 2 (A→C→F, two edges)
- Height of `B` = 2 (B→D→G, two edges to deepest leaf)
- Height of tree = 3

---

## Tree Properties

1. **A tree with N nodes has exactly N-1 edges**
2. **There is exactly one path between any two nodes**
3. **A tree is connected** — every node is reachable from the root
4. **A tree has no cycles** — no circular paths exist
5. **Removing any edge disconnects the tree** into two subtrees

---

## Types of Trees

### Binary Tree

Each node has **at most 2 children** (left and right).

```
        10
       /  \
      5    15
     / \     \
    3   7    20
```

### Binary Search Tree (BST)

A binary tree where for every node:
- All values in the **left subtree** are **less** than the node
- All values in the **right subtree** are **greater** than the node

```
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13
```

Searching is efficient: O(log n) on average because you eliminate half the tree at each step.

### Balanced Tree

A tree where the heights of left and right subtrees differ by at most 1 for every node. Ensures O(log n) operations.

```
Balanced:           Unbalanced (degenerate):
      4                 1
     / \                 \
    2   6                 2
   / \ / \                 \
  1  3 5  7                 3
                             \
                              4
                               \
                                5
```

Examples: AVL trees, Red-Black trees, B-trees.

### N-ary Tree (General Tree)

Each node can have **any number of children**.

```
         Company
       /    |    \
    Eng   Sales  Marketing
   / | \    |      / \
  FE BE  ML  US   SEO  Ads
```

### Other Tree Types

| Type | Description |
|------|-------------|
| **Complete Binary Tree** | All levels filled except possibly the last; last level filled left-to-right |
| **Full Binary Tree** | Every node has 0 or 2 children |
| **Perfect Binary Tree** | All internal nodes have 2 children, all leaves at same level |
| **Trie (Prefix Tree)** | Specialized tree for string operations |
| **Heap** | Complete binary tree with heap property (min/max) |

```
Full:          Complete:       Perfect:
    1              1               1
   / \           / \             / \
  2   3         2   3           2   3
 / \           / \   \         / \ / \
4   5         4   5   6       4  5 6  7
```

---

## Real-World Examples

### File System

```
/
├── home/
│   ├── user/
│   │   ├── documents/
│   │   │   ├── report.pdf
│   │   │   └── notes.txt
│   │   └── pictures/
│   │       └── photo.jpg
│   └── admin/
└── etc/
    └── config.cfg
```

### HTML DOM

```
html
├── head
│   ├── title
│   └── meta
└── body
    ├── header
    │   └── nav
    ├── main
    │   ├── article
    │   └── aside
    └── footer
```

### Organization Chart

```
           CEO
         /     \
       CTO     CFO
      / | \      \
   VP1 VP2 VP3  Controller
   /     \
 Team1  Team2
```

### Decision Tree

```
         Is it raining?
          /          \
       Yes            No
      /                \
  Take umbrella?    Go outside!
    /       \
  Yes       No
   |         |
Go out    Stay home
```

---

## Representing a Tree in Code

The most common representation uses nodes with pointers/references to children.

### C++

```cpp
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

// Binary tree node
struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;

    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

// N-ary tree node
struct NaryNode {
    int data;
    vector<NaryNode*> children;

    NaryNode(int val) : data(val) {}
};

// Build a sample binary tree
TreeNode* buildSampleTree() {
    //         1
    //        / \
    //       2   3
    //      / \   \
    //     4   5   6
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);
    root->right->right = new TreeNode(6);
    return root;
}

// Count nodes in tree
int countNodes(TreeNode* root) {
    if (root == nullptr) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}

// Find height of tree
int height(TreeNode* root) {
    if (root == nullptr) return -1; // -1 for edge-based height
    return 1 + max(height(root->left), height(root->right));
}

// Print tree level by level (BFS)
void printLevelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);

    while (!q.empty()) {
        int levelSize = q.size();
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front();
            q.pop();
            cout << node->data << " ";
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        cout << endl;
    }
}

int main() {
    TreeNode* root = buildSampleTree();

    cout << "Level order traversal:" << endl;
    printLevelOrder(root);
    // 1
    // 2 3
    // 4 5 6

    cout << "Number of nodes: " << countNodes(root) << endl; // 6
    cout << "Height of tree: " << height(root) << endl;      // 2

    // Clean up (in production, use smart pointers)
    // Omitted for brevity
    return 0;
}
```

### Java

```java
import java.util.*;

public class TreeIntro {
    // Binary tree node
    static class TreeNode {
        int data;
        TreeNode left, right;

        TreeNode(int data) {
            this.data = data;
            this.left = null;
            this.right = null;
        }
    }

    // N-ary tree node
    static class NaryNode {
        int data;
        List<NaryNode> children;

        NaryNode(int data) {
            this.data = data;
            this.children = new ArrayList<>();
        }
    }

    // Build a sample binary tree
    static TreeNode buildSampleTree() {
        //         1
        //        / \
        //       2   3
        //      / \   \
        //     4   5   6
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);
        return root;
    }

    // Count nodes
    static int countNodes(TreeNode root) {
        if (root == null) return 0;
        return 1 + countNodes(root.left) + countNodes(root.right);
    }

    // Find height
    static int height(TreeNode root) {
        if (root == null) return -1;
        return 1 + Math.max(height(root.left), height(root.right));
    }

    // Print level order (BFS)
    static void printLevelOrder(TreeNode root) {
        if (root == null) return;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.add(root);

        while (!queue.isEmpty()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.poll();
                System.out.print(node.data + " ");
                if (node.left != null) queue.add(node.left);
                if (node.right != null) queue.add(node.right);
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        TreeNode root = buildSampleTree();

        System.out.println("Level order traversal:");
        printLevelOrder(root);
        // 1
        // 2 3
        // 4 5 6

        System.out.println("Number of nodes: " + countNodes(root)); // 6
        System.out.println("Height of tree: " + height(root));      // 2
    }
}
```

### Python

```python
from collections import deque


class TreeNode:
    """Binary tree node."""
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


class NaryNode:
    """N-ary tree node."""
    def __init__(self, data):
        self.data = data
        self.children = []


def build_sample_tree():
    """
    Build:
            1
           / \
          2   3
         / \   \
        4   5   6
    """
    root = TreeNode(1)
    root.left = TreeNode(2)
    root.right = TreeNode(3)
    root.left.left = TreeNode(4)
    root.left.right = TreeNode(5)
    root.right.right = TreeNode(6)
    return root


def count_nodes(root):
    """Count total nodes in tree."""
    if root is None:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)


def height(root):
    """Find height of tree (edge-based)."""
    if root is None:
        return -1
    return 1 + max(height(root.left), height(root.right))


def print_level_order(root):
    """Print tree level by level (BFS)."""
    if not root:
        return
    queue = deque([root])

    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(str(node.data))
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        print(" ".join(level))


# Usage
root = build_sample_tree()

print("Level order traversal:")
print_level_order(root)
# 1
# 2 3
# 4 5 6

print(f"Number of nodes: {count_nodes(root)}")  # 6
print(f"Height of tree: {height(root)}")         # 2
```

### JavaScript

```javascript
class TreeNode {
  constructor(data) {
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class NaryNode {
  constructor(data) {
    this.data = data;
    this.children = [];
  }
}

function buildSampleTree() {
  //         1
  //        / \
  //       2   3
  //      / \   \
  //     4   5   6
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  root.right.right = new TreeNode(6);
  return root;
}

function countNodes(root) {
  if (root === null) return 0;
  return 1 + countNodes(root.left) + countNodes(root.right);
}

function height(root) {
  if (root === null) return -1;
  return 1 + Math.max(height(root.left), height(root.right));
}

function printLevelOrder(root) {
  if (!root) return;
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.data);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    console.log(level.join(" "));
  }
}

// Usage
const root = buildSampleTree();

console.log("Level order traversal:");
printLevelOrder(root);
// 1
// 2 3
// 4 5 6

console.log("Number of nodes:", countNodes(root)); // 6
console.log("Height of tree:", height(root));      // 2
```

---

## Tree vs Other Data Structures

| Feature | Array | Linked List | Tree |
|---------|-------|-------------|------|
| Structure | Linear | Linear | Hierarchical |
| Search | O(n) or O(log n) sorted | O(n) | O(log n) balanced |
| Insert | O(n) | O(1) at head | O(log n) balanced |
| Delete | O(n) | O(1) if node known | O(log n) balanced |
| Hierarchy | No | No | Yes |
| Random Access | O(1) | O(n) | O(log n) |

---

## When to Use Trees

| Scenario | Why Trees? |
|----------|-----------|
| File systems | Natural hierarchy of directories/files |
| HTML/XML parsing | DOM is a tree |
| Databases (B-trees) | Efficient disk-based searching |
| Autocomplete (Tries) | Prefix-based string lookup |
| Priority queues (Heaps) | Fast min/max extraction |
| Expression evaluation | Parse trees for math expressions |
| Routing tables | Decision trees for network routing |
| Game AI | Minimax trees, Monte Carlo tree search |

---

## Visualizing a Tree

Here's a helpful way to visualize tree structure in text:

```
Tree with values [1, 2, 3, 4, 5, 6, 7]:

        ┌───── 7
    ┌── 3
    │   └───── 6
 ── 1
    │   ┌───── 5
    └── 2
        └───── 4

Or as a directory listing:

1
├── 2
│   ├── 4
│   └── 5
└── 3
    ├── 6
    └── 7
```

---

## Key Takeaways

- Trees are hierarchical, non-linear data structures
- Every tree has a root, and each node (except root) has exactly one parent
- Key metrics: depth (distance from root), height (distance to farthest leaf)
- Binary trees (max 2 children) are the most commonly used variant
- BSTs enable O(log n) search by maintaining an ordering invariant
- Balanced trees guarantee O(log n) by preventing degeneration into a linked list
- Trees appear everywhere: file systems, databases, compilers, networking, AI
- Coming up: we'll explore binary tree traversals and operations in depth

---

Next: **Binary Trees →**
