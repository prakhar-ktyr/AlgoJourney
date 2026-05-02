---
title: Linked Lists Introduction
---

# Linked Lists Introduction

A **linked list** is a linear data structure where elements are stored in **nodes**, and each node points to the next one in the sequence. Unlike arrays, linked list elements are not stored in contiguous memory locations — they're connected through pointers (references).

---

## What Is a Node?

A node is the building block of a linked list. Each node contains:

1. **Data** — the value stored in the node
2. **Pointer(s)** — reference(s) to the next (and possibly previous) node

```
┌──────────┬──────────┐
│   Data   │   Next   │──→
└──────────┴──────────┘
       A single node
```

---

## Linked List vs Array

| Feature | Array | Linked List |
|---------|-------|-------------|
| Memory layout | Contiguous | Non-contiguous |
| Size | Fixed (static) or resizable | Dynamic |
| Access by index | O(1) | O(n) |
| Insertion at beginning | O(n) | O(1) |
| Insertion at end | O(1) amortized | O(n) or O(1) with tail |
| Deletion at beginning | O(n) | O(1) |
| Memory overhead | None | Extra pointer per node |
| Cache performance | Excellent | Poor |

**When to use a linked list:**
- Frequent insertions/deletions at the beginning
- Unknown or highly variable size
- No need for random access

**When to use an array:**
- Frequent random access by index
- Cache-friendly traversal needed
- Memory efficiency matters

---

## Text Diagram of a Linked List

```
HEAD
 │
 ▼
┌───┬───┐    ┌───┬───┐    ┌───┬───┐    ┌───┬──────┐
│ 5 │ ──┼───→│ 8 │ ──┼───→│ 3 │ ──┼───→│ 1 │ NULL │
└───┴───┘    └───┴───┘    └───┴───┘    └───┴──────┘
```

The **head** pointer keeps track of the first node. The last node's `next` pointer is `NULL` (or `None`/`null`), indicating the end of the list.

---

## Node Structure in Code

Here's how we define a node for a singly linked list in each language:

```cpp
struct Node {
    int data;
    Node* next;

    Node(int value) : data(value), next(nullptr) {}
};
```

```java
class Node {
    int data;
    Node next;

    Node(int value) {
        this.data = value;
        this.next = null;
    }
}
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
```

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}
```

---

## Types of Linked Lists

### 1. Singly Linked List

Each node points to the **next** node only. Traversal is one-directional (forward).

```
HEAD → [A | ●]→ [B | ●]→ [C | ●]→ [D | NULL]
```

- Simplest form
- Uses less memory per node (one pointer)
- Cannot traverse backward

### 2. Doubly Linked List

Each node has pointers to both the **next** and **previous** nodes. Traversal works in both directions.

```
NULL ←[●| A |●]⇄[●| B |●]⇄[●| C |●]⇄[●| D |●]→ NULL
       HEAD                                  TAIL
```

- Bidirectional traversal
- Easier deletion when you have a reference to the node
- Uses more memory per node (two pointers)

### 3. Circular Linked List

The last node points back to the **first** node instead of `NULL`, forming a circle.

**Circular Singly Linked List:**
```
HEAD → [A | ●]→ [B | ●]→ [C | ●]→ [D | ●]─┐
        ▲                                     │
        └─────────────────────────────────────┘
```

**Circular Doubly Linked List:**
```
┌─────────────────────────────────────────────────┐
│   ┌→[●| A |●]⇄[●| B |●]⇄[●| C |●]⇄[●| D |●]─┘
└───────────────────────────────────────────┘
```

- Useful for round-robin scheduling, circular buffers
- No `NULL` pointer — must be careful to avoid infinite loops

---

## Summary

| Type | Pointers per Node | Traversal | Last Node Points To |
|------|-------------------|-----------|---------------------|
| Singly | 1 (next) | Forward only | NULL |
| Doubly | 2 (prev + next) | Both directions | NULL |
| Circular Singly | 1 (next) | Forward (loops) | Head |
| Circular Doubly | 2 (prev + next) | Both (loops) | Head |

---

## Key Takeaways

- A linked list is a chain of nodes connected by pointers
- Nodes are dynamically allocated — no need to declare size upfront
- Insertion and deletion at the head are O(1)
- Random access is O(n) — you must traverse from the head
- Choose the type of linked list based on your traversal and memory needs

Next: **Singly Linked List →**
