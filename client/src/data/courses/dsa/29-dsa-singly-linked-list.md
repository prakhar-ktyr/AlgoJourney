---
title: Singly Linked List
---

# Singly Linked List

A **singly linked list** is the most basic form of a linked list. Each node stores data and a single pointer to the next node. The list ends when a node's `next` pointer is `NULL`.

```
HEAD → [10 | ●]→ [20 | ●]→ [30 | ●]→ [40 | NULL]
```

---

## Node Class

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

## Creating a Linked List

Let's build a list: `1 → 2 → 3`

```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int value) : data(value), next(nullptr) {}
};

int main() {
    Node* head = new Node(1);
    head->next = new Node(2);
    head->next->next = new Node(3);

    // head → 1 → 2 → 3 → NULL
    return 0;
}
```

```java
public class SinglyLinkedList {
    static Node head;

    public static void main(String[] args) {
        head = new Node(1);
        head.next = new Node(2);
        head.next.next = new Node(3);

        // head → 1 → 2 → 3 → null
    }
}
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)

# head → 1 → 2 → 3 → None
```

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

let head = new Node(1);
head.next = new Node(2);
head.next.next = new Node(3);

// head → 1 → 2 → 3 → null
```

---

## Traversal

Traversal means visiting every node from head to the end and processing it (e.g., printing its value).

```
START at head
WHILE current is not NULL:
    process current.data
    move to current.next
```

```cpp
void printList(Node* head) {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data << " → ";
        current = current->next;
    }
    cout << "NULL" << endl;
}
```

```java
static void printList(Node head) {
    Node current = head;
    while (current != null) {
        System.out.print(current.data + " → ");
        current = current.next;
    }
    System.out.println("NULL");
}
```

```python
def print_list(head):
    current = head
    while current:
        print(current.data, end=" → ")
        current = current.next
    print("None")
```

```javascript
function printList(head) {
  let current = head;
  let result = "";
  while (current !== null) {
    result += current.data + " → ";
    current = current.next;
  }
  console.log(result + "null");
}
```

---

## Insertion

### Insert at Head (Beginning) — O(1)

```
Before: HEAD → [10 | ●]→ [20 | ●]→ [30 | NULL]
Insert 5 at head:
After:  HEAD → [5 | ●]→ [10 | ●]→ [20 | ●]→ [30 | NULL]
```

```cpp
Node* insertAtHead(Node* head, int value) {
    Node* newNode = new Node(value);
    newNode->next = head;
    return newNode;  // new head
}
```

```java
static Node insertAtHead(Node head, int value) {
    Node newNode = new Node(value);
    newNode.next = head;
    return newNode;  // new head
}
```

```python
def insert_at_head(head, value):
    new_node = Node(value)
    new_node.next = head
    return new_node  # new head
```

```javascript
function insertAtHead(head, value) {
  const newNode = new Node(value);
  newNode.next = head;
  return newNode; // new head
}
```

### Insert at Tail (End) — O(n)

```
Before: HEAD → [10 | ●]→ [20 | ●]→ [30 | NULL]
Insert 40 at tail:
After:  HEAD → [10 | ●]→ [20 | ●]→ [30 | ●]→ [40 | NULL]
```

```cpp
Node* insertAtTail(Node* head, int value) {
    Node* newNode = new Node(value);
    if (head == nullptr) return newNode;

    Node* current = head;
    while (current->next != nullptr) {
        current = current->next;
    }
    current->next = newNode;
    return head;
}
```

```java
static Node insertAtTail(Node head, int value) {
    Node newNode = new Node(value);
    if (head == null) return newNode;

    Node current = head;
    while (current.next != null) {
        current = current.next;
    }
    current.next = newNode;
    return head;
}
```

```python
def insert_at_tail(head, value):
    new_node = Node(value)
    if head is None:
        return new_node

    current = head
    while current.next:
        current = current.next
    current.next = new_node
    return head
```

```javascript
function insertAtTail(head, value) {
  const newNode = new Node(value);
  if (head === null) return newNode;

  let current = head;
  while (current.next !== null) {
    current = current.next;
  }
  current.next = newNode;
  return head;
}
```

### Insert at a Given Position — O(n)

Position is 0-indexed (0 = head).

```
Before: HEAD → [10 | ●]→ [20 | ●]→ [30 | NULL]
Insert 15 at position 1:
After:  HEAD → [10 | ●]→ [15 | ●]→ [20 | ●]→ [30 | NULL]
```

```cpp
Node* insertAtPosition(Node* head, int value, int position) {
    Node* newNode = new Node(value);
    if (position == 0) {
        newNode->next = head;
        return newNode;
    }

    Node* current = head;
    for (int i = 0; i < position - 1 && current != nullptr; i++) {
        current = current->next;
    }

    if (current == nullptr) return head;  // position out of bounds

    newNode->next = current->next;
    current->next = newNode;
    return head;
}
```

```java
static Node insertAtPosition(Node head, int value, int position) {
    Node newNode = new Node(value);
    if (position == 0) {
        newNode.next = head;
        return newNode;
    }

    Node current = head;
    for (int i = 0; i < position - 1 && current != null; i++) {
        current = current.next;
    }

    if (current == null) return head;  // position out of bounds

    newNode.next = current.next;
    current.next = newNode;
    return head;
}
```

```python
def insert_at_position(head, value, position):
    new_node = Node(value)
    if position == 0:
        new_node.next = head
        return new_node

    current = head
    for _ in range(position - 1):
        if current is None:
            return head  # position out of bounds
        current = current.next

    if current is None:
        return head

    new_node.next = current.next
    current.next = new_node
    return head
```

```javascript
function insertAtPosition(head, value, position) {
  const newNode = new Node(value);
  if (position === 0) {
    newNode.next = head;
    return newNode;
  }

  let current = head;
  for (let i = 0; i < position - 1 && current !== null; i++) {
    current = current.next;
  }

  if (current === null) return head; // position out of bounds

  newNode.next = current.next;
  current.next = newNode;
  return head;
}
```

---

## Deletion

### Delete from Head — O(1)

```
Before: HEAD → [10 | ●]→ [20 | ●]→ [30 | NULL]
After:  HEAD → [20 | ●]→ [30 | NULL]
```

```cpp
Node* deleteFromHead(Node* head) {
    if (head == nullptr) return nullptr;
    Node* newHead = head->next;
    delete head;
    return newHead;
}
```

```java
static Node deleteFromHead(Node head) {
    if (head == null) return null;
    return head.next;
}
```

```python
def delete_from_head(head):
    if head is None:
        return None
    return head.next
```

```javascript
function deleteFromHead(head) {
  if (head === null) return null;
  return head.next;
}
```

### Delete from Tail — O(n)

```
Before: HEAD → [10 | ●]→ [20 | ●]→ [30 | NULL]
After:  HEAD → [10 | ●]→ [20 | NULL]
```

```cpp
Node* deleteFromTail(Node* head) {
    if (head == nullptr) return nullptr;
    if (head->next == nullptr) {
        delete head;
        return nullptr;
    }

    Node* current = head;
    while (current->next->next != nullptr) {
        current = current->next;
    }
    delete current->next;
    current->next = nullptr;
    return head;
}
```

```java
static Node deleteFromTail(Node head) {
    if (head == null) return null;
    if (head.next == null) return null;

    Node current = head;
    while (current.next.next != null) {
        current = current.next;
    }
    current.next = null;
    return head;
}
```

```python
def delete_from_tail(head):
    if head is None:
        return None
    if head.next is None:
        return None

    current = head
    while current.next.next:
        current = current.next
    current.next = None
    return head
```

```javascript
function deleteFromTail(head) {
  if (head === null) return null;
  if (head.next === null) return null;

  let current = head;
  while (current.next.next !== null) {
    current = current.next;
  }
  current.next = null;
  return head;
}
```

### Delete by Value — O(n)

```cpp
Node* deleteByValue(Node* head, int value) {
    if (head == nullptr) return nullptr;
    if (head->data == value) {
        Node* newHead = head->next;
        delete head;
        return newHead;
    }

    Node* current = head;
    while (current->next != nullptr && current->next->data != value) {
        current = current->next;
    }

    if (current->next != nullptr) {
        Node* toDelete = current->next;
        current->next = toDelete->next;
        delete toDelete;
    }
    return head;
}
```

```java
static Node deleteByValue(Node head, int value) {
    if (head == null) return null;
    if (head.data == value) return head.next;

    Node current = head;
    while (current.next != null && current.next.data != value) {
        current = current.next;
    }

    if (current.next != null) {
        current.next = current.next.next;
    }
    return head;
}
```

```python
def delete_by_value(head, value):
    if head is None:
        return None
    if head.data == value:
        return head.next

    current = head
    while current.next and current.next.data != value:
        current = current.next

    if current.next:
        current.next = current.next.next
    return head
```

```javascript
function deleteByValue(head, value) {
  if (head === null) return null;
  if (head.data === value) return head.next;

  let current = head;
  while (current.next !== null && current.next.data !== value) {
    current = current.next;
  }

  if (current.next !== null) {
    current.next = current.next.next;
  }
  return head;
}
```

---

## Searching — O(n)

Find whether a value exists in the list.

```cpp
bool search(Node* head, int target) {
    Node* current = head;
    while (current != nullptr) {
        if (current->data == target) return true;
        current = current->next;
    }
    return false;
}
```

```java
static boolean search(Node head, int target) {
    Node current = head;
    while (current != null) {
        if (current.data == target) return true;
        current = current.next;
    }
    return false;
}
```

```python
def search(head, target):
    current = head
    while current:
        if current.data == target:
            return True
        current = current.next
    return False
```

```javascript
function search(head, target) {
  let current = head;
  while (current !== null) {
    if (current.data === target) return true;
    current = current.next;
  }
  return false;
}
```

---

## Reversing a Singly Linked List (Iterative) — O(n)

Reversing is one of the most important linked list operations. We use three pointers: `prev`, `current`, and `next`.

### Step-by-Step Trace

```
Original: 1 → 2 → 3 → 4 → NULL

Step 1: prev=NULL, current=1, next=2
        Reverse: 1.next = NULL
        Move: prev=1, current=2
        NULL ← 1    2 → 3 → 4 → NULL

Step 2: prev=1, current=2, next=3
        Reverse: 2.next = 1
        Move: prev=2, current=3
        NULL ← 1 ← 2    3 → 4 → NULL

Step 3: prev=2, current=3, next=4
        Reverse: 3.next = 2
        Move: prev=3, current=4
        NULL ← 1 ← 2 ← 3    4 → NULL

Step 4: prev=3, current=4, next=NULL
        Reverse: 4.next = 3
        Move: prev=4, current=NULL
        NULL ← 1 ← 2 ← 3 ← 4

Result: HEAD = 4, list is 4 → 3 → 2 → 1 → NULL
```

```cpp
Node* reverse(Node* head) {
    Node* prev = nullptr;
    Node* current = head;
    Node* next = nullptr;

    while (current != nullptr) {
        next = current->next;      // save next
        current->next = prev;      // reverse pointer
        prev = current;            // advance prev
        current = next;            // advance current
    }
    return prev;  // new head
}
```

```java
static Node reverse(Node head) {
    Node prev = null;
    Node current = head;
    Node next = null;

    while (current != null) {
        next = current.next;       // save next
        current.next = prev;       // reverse pointer
        prev = current;            // advance prev
        current = next;            // advance current
    }
    return prev;  // new head
}
```

```python
def reverse(head):
    prev = None
    current = head

    while current:
        next_node = current.next   # save next
        current.next = prev        # reverse pointer
        prev = current             # advance prev
        current = next_node        # advance current

    return prev  # new head
```

```javascript
function reverse(head) {
  let prev = null;
  let current = head;
  let next = null;

  while (current !== null) {
    next = current.next;           // save next
    current.next = prev;           // reverse pointer
    prev = current;                // advance prev
    current = next;                // advance current
  }
  return prev; // new head
}
```

---

## Finding the Middle Node (Fast & Slow Pointers) — O(n)

Use two pointers: `slow` moves one step at a time, `fast` moves two steps. When `fast` reaches the end, `slow` is at the middle.

```
List: 1 → 2 → 3 → 4 → 5

Step 0: slow=1, fast=1
Step 1: slow=2, fast=3
Step 2: slow=3, fast=5  ← fast reached end

Middle = 3 ✓
```

```cpp
Node* findMiddle(Node* head) {
    Node* slow = head;
    Node* fast = head;

    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;  // middle node
}
```

```java
static Node findMiddle(Node head) {
    Node slow = head;
    Node fast = head;

    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;  // middle node
}
```

```python
def find_middle(head):
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    return slow  # middle node
```

```javascript
function findMiddle(head) {
  let slow = head;
  let fast = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; // middle node
}
```

---

## Complexity Summary

| Operation | Time | Space |
|-----------|------|-------|
| Insert at head | O(1) | O(1) |
| Insert at tail | O(n) | O(1) |
| Insert at position | O(n) | O(1) |
| Delete from head | O(1) | O(1) |
| Delete from tail | O(n) | O(1) |
| Delete by value | O(n) | O(1) |
| Search | O(n) | O(1) |
| Reverse | O(n) | O(1) |
| Find middle | O(n) | O(1) |
| Traversal | O(n) | O(1) |

---

## Key Takeaways

- A singly linked list supports efficient O(1) insertion/deletion at the head
- Traversal is always O(n) since we must follow pointers sequentially
- Reversing uses the three-pointer technique (prev, current, next)
- The fast/slow pointer trick finds the middle in a single pass
- No random access — you must traverse from the head to reach any element

Next: **Doubly Linked List →**
