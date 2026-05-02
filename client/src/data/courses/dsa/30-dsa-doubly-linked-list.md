---
title: Doubly Linked List
---

# Doubly Linked List

A **doubly linked list** (DLL) is a linked list where each node has two pointers: one to the **next** node and one to the **previous** node. This allows traversal in both directions.

```
NULL ← [●| 10 |●] ⇄ [●| 20 |●] ⇄ [●| 30 |●] ⇄ [●| 40 |●] → NULL
        HEAD                                         TAIL
```

---

## Node Structure

Each node contains three fields:
1. `prev` — pointer to the previous node
2. `data` — the stored value
3. `next` — pointer to the next node

```
         ┌──────┬──────┬──────┐
         │ prev │ data │ next │
         └──────┴──────┴──────┘
```

```cpp
struct Node {
    int data;
    Node* prev;
    Node* next;

    Node(int value) : data(value), prev(nullptr), next(nullptr) {}
};
```

```java
class Node {
    int data;
    Node prev;
    Node next;

    Node(int value) {
        this.data = value;
        this.prev = null;
        this.next = null;
    }
}
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None
```

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}
```

---

## Doubly Linked List Class

We maintain both `head` and `tail` pointers for efficient operations at both ends.

```cpp
class DoublyLinkedList {
public:
    Node* head;
    Node* tail;

    DoublyLinkedList() : head(nullptr), tail(nullptr) {}
};
```

```java
class DoublyLinkedList {
    Node head;
    Node tail;

    DoublyLinkedList() {
        head = null;
        tail = null;
    }
}
```

```python
class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
```

```javascript
class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }
}
```

---

## Insert at Head — O(1)

```
Before: NULL ← [20 |●] ⇄ [●| 30 |●] → NULL
Insert 10 at head:
After:  NULL ← [10 |●] ⇄ [●| 20 |●] ⇄ [●| 30 |●] → NULL
```

```cpp
void insertAtHead(int value) {
    Node* newNode = new Node(value);
    if (head == nullptr) {
        head = tail = newNode;
    } else {
        newNode->next = head;
        head->prev = newNode;
        head = newNode;
    }
}
```

```java
void insertAtHead(int value) {
    Node newNode = new Node(value);
    if (head == null) {
        head = tail = newNode;
    } else {
        newNode.next = head;
        head.prev = newNode;
        head = newNode;
    }
}
```

```python
def insert_at_head(self, value):
    new_node = Node(value)
    if self.head is None:
        self.head = self.tail = new_node
    else:
        new_node.next = self.head
        self.head.prev = new_node
        self.head = new_node
```

```javascript
insertAtHead(value) {
  const newNode = new Node(value);
  if (this.head === null) {
    this.head = this.tail = newNode;
  } else {
    newNode.next = this.head;
    this.head.prev = newNode;
    this.head = newNode;
  }
}
```

---

## Insert at Tail — O(1)

With a `tail` pointer, inserting at the end is constant time!

```
Before: NULL ← [10 |●] ⇄ [●| 20 |●] → NULL
Insert 30 at tail:
After:  NULL ← [10 |●] ⇄ [●| 20 |●] ⇄ [●| 30 |●] → NULL
```

```cpp
void insertAtTail(int value) {
    Node* newNode = new Node(value);
    if (tail == nullptr) {
        head = tail = newNode;
    } else {
        newNode->prev = tail;
        tail->next = newNode;
        tail = newNode;
    }
}
```

```java
void insertAtTail(int value) {
    Node newNode = new Node(value);
    if (tail == null) {
        head = tail = newNode;
    } else {
        newNode.prev = tail;
        tail.next = newNode;
        tail = newNode;
    }
}
```

```python
def insert_at_tail(self, value):
    new_node = Node(value)
    if self.tail is None:
        self.head = self.tail = new_node
    else:
        new_node.prev = self.tail
        self.tail.next = new_node
        self.tail = new_node
```

```javascript
insertAtTail(value) {
  const newNode = new Node(value);
  if (this.tail === null) {
    this.head = this.tail = newNode;
  } else {
    newNode.prev = this.tail;
    this.tail.next = newNode;
    this.tail = newNode;
  }
}
```

---

## Insert at Position — O(n)

Position is 0-indexed.

```cpp
void insertAtPosition(int value, int position) {
    if (position == 0) {
        insertAtHead(value);
        return;
    }

    Node* current = head;
    for (int i = 0; i < position - 1 && current != nullptr; i++) {
        current = current->next;
    }

    if (current == nullptr) return;  // out of bounds

    if (current->next == nullptr) {
        insertAtTail(value);
        return;
    }

    Node* newNode = new Node(value);
    newNode->next = current->next;
    newNode->prev = current;
    current->next->prev = newNode;
    current->next = newNode;
}
```

```java
void insertAtPosition(int value, int position) {
    if (position == 0) {
        insertAtHead(value);
        return;
    }

    Node current = head;
    for (int i = 0; i < position - 1 && current != null; i++) {
        current = current.next;
    }

    if (current == null) return;  // out of bounds

    if (current.next == null) {
        insertAtTail(value);
        return;
    }

    Node newNode = new Node(value);
    newNode.next = current.next;
    newNode.prev = current;
    current.next.prev = newNode;
    current.next = newNode;
}
```

```python
def insert_at_position(self, value, position):
    if position == 0:
        self.insert_at_head(value)
        return

    current = self.head
    for _ in range(position - 1):
        if current is None:
            return  # out of bounds
        current = current.next

    if current is None:
        return

    if current.next is None:
        self.insert_at_tail(value)
        return

    new_node = Node(value)
    new_node.next = current.next
    new_node.prev = current
    current.next.prev = new_node
    current.next = new_node
```

```javascript
insertAtPosition(value, position) {
  if (position === 0) {
    this.insertAtHead(value);
    return;
  }

  let current = this.head;
  for (let i = 0; i < position - 1 && current !== null; i++) {
    current = current.next;
  }

  if (current === null) return; // out of bounds

  if (current.next === null) {
    this.insertAtTail(value);
    return;
  }

  const newNode = new Node(value);
  newNode.next = current.next;
  newNode.prev = current;
  current.next.prev = newNode;
  current.next = newNode;
}
```

---

## Delete from Head — O(1)

```
Before: NULL ← [10 |●] ⇄ [●| 20 |●] ⇄ [●| 30 |●] → NULL
After:  NULL ← [20 |●] ⇄ [●| 30 |●] → NULL
```

```cpp
void deleteFromHead() {
    if (head == nullptr) return;

    if (head == tail) {
        delete head;
        head = tail = nullptr;
        return;
    }

    Node* toDelete = head;
    head = head->next;
    head->prev = nullptr;
    delete toDelete;
}
```

```java
void deleteFromHead() {
    if (head == null) return;

    if (head == tail) {
        head = tail = null;
        return;
    }

    head = head.next;
    head.prev = null;
}
```

```python
def delete_from_head(self):
    if self.head is None:
        return

    if self.head == self.tail:
        self.head = self.tail = None
        return

    self.head = self.head.next
    self.head.prev = None
```

```javascript
deleteFromHead() {
  if (this.head === null) return;

  if (this.head === this.tail) {
    this.head = this.tail = null;
    return;
  }

  this.head = this.head.next;
  this.head.prev = null;
}
```

---

## Delete from Tail — O(1)

Unlike singly linked lists where this is O(n), doubly linked lists can delete from the tail in O(1) because we have the `prev` pointer!

```
Before: NULL ← [10 |●] ⇄ [●| 20 |●] ⇄ [●| 30 |●] → NULL
After:  NULL ← [10 |●] ⇄ [●| 20 |●] → NULL
```

```cpp
void deleteFromTail() {
    if (tail == nullptr) return;

    if (head == tail) {
        delete tail;
        head = tail = nullptr;
        return;
    }

    Node* toDelete = tail;
    tail = tail->prev;
    tail->next = nullptr;
    delete toDelete;
}
```

```java
void deleteFromTail() {
    if (tail == null) return;

    if (head == tail) {
        head = tail = null;
        return;
    }

    tail = tail.prev;
    tail.next = null;
}
```

```python
def delete_from_tail(self):
    if self.tail is None:
        return

    if self.head == self.tail:
        self.head = self.tail = None
        return

    self.tail = self.tail.prev
    self.tail.next = None
```

```javascript
deleteFromTail() {
  if (this.tail === null) return;

  if (this.head === this.tail) {
    this.head = this.tail = null;
    return;
  }

  this.tail = this.tail.prev;
  this.tail.next = null;
}
```

---

## Delete at Position — O(n)

```cpp
void deleteAtPosition(int position) {
    if (head == nullptr) return;

    if (position == 0) {
        deleteFromHead();
        return;
    }

    Node* current = head;
    for (int i = 0; i < position && current != nullptr; i++) {
        current = current->next;
    }

    if (current == nullptr) return;  // out of bounds

    if (current == tail) {
        deleteFromTail();
        return;
    }

    current->prev->next = current->next;
    current->next->prev = current->prev;
    delete current;
}
```

```java
void deleteAtPosition(int position) {
    if (head == null) return;

    if (position == 0) {
        deleteFromHead();
        return;
    }

    Node current = head;
    for (int i = 0; i < position && current != null; i++) {
        current = current.next;
    }

    if (current == null) return;  // out of bounds

    if (current == tail) {
        deleteFromTail();
        return;
    }

    current.prev.next = current.next;
    current.next.prev = current.prev;
}
```

```python
def delete_at_position(self, position):
    if self.head is None:
        return

    if position == 0:
        self.delete_from_head()
        return

    current = self.head
    for _ in range(position):
        if current is None:
            return  # out of bounds
        current = current.next

    if current is None:
        return

    if current == self.tail:
        self.delete_from_tail()
        return

    current.prev.next = current.next
    current.next.prev = current.prev
```

```javascript
deleteAtPosition(position) {
  if (this.head === null) return;

  if (position === 0) {
    this.deleteFromHead();
    return;
  }

  let current = this.head;
  for (let i = 0; i < position && current !== null; i++) {
    current = current.next;
  }

  if (current === null) return; // out of bounds

  if (current === this.tail) {
    this.deleteFromTail();
    return;
  }

  current.prev.next = current.next;
  current.next.prev = current.prev;
}
```

---

## Bidirectional Traversal

One of the main advantages of a DLL — traverse forward **and** backward.

### Forward Traversal (Head → Tail)

```cpp
void traverseForward() {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data << " ⇄ ";
        current = current->next;
    }
    cout << "NULL" << endl;
}
```

```java
void traverseForward() {
    Node current = head;
    while (current != null) {
        System.out.print(current.data + " ⇄ ");
        current = current.next;
    }
    System.out.println("NULL");
}
```

```python
def traverse_forward(self):
    current = self.head
    while current:
        print(current.data, end=" ⇄ ")
        current = current.next
    print("None")
```

```javascript
traverseForward() {
  let current = this.head;
  let result = "";
  while (current !== null) {
    result += current.data + " ⇄ ";
    current = current.next;
  }
  console.log(result + "null");
}
```

### Backward Traversal (Tail → Head)

```cpp
void traverseBackward() {
    Node* current = tail;
    while (current != nullptr) {
        cout << current->data << " ⇄ ";
        current = current->prev;
    }
    cout << "NULL" << endl;
}
```

```java
void traverseBackward() {
    Node current = tail;
    while (current != null) {
        System.out.print(current.data + " ⇄ ");
        current = current.prev;
    }
    System.out.println("NULL");
}
```

```python
def traverse_backward(self):
    current = self.tail
    while current:
        print(current.data, end=" ⇄ ")
        current = current.prev
    print("None")
```

```javascript
traverseBackward() {
  let current = this.tail;
  let result = "";
  while (current !== null) {
    result += current.data + " ⇄ ";
    current = current.prev;
  }
  console.log(result + "null");
}
```

---

## Singly vs Doubly Linked List

| Feature | Singly LL | Doubly LL |
|---------|-----------|-----------|
| Memory per node | 1 pointer | 2 pointers |
| Traverse forward | Yes | Yes |
| Traverse backward | No | Yes |
| Insert at head | O(1) | O(1) |
| Insert at tail | O(n) without tail ptr | O(1) with tail ptr |
| Delete from head | O(1) | O(1) |
| Delete from tail | O(n) | O(1) |
| Delete given node | O(n) need prev | O(1) have prev |
| Implementation | Simpler | More complex |
| Use case | Simple lists, stacks | Browsers (back/forward), LRU cache |

---

## Complete Implementation

Here's a full working example:

```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* prev;
    Node* next;
    Node(int value) : data(value), prev(nullptr), next(nullptr) {}
};

class DoublyLinkedList {
public:
    Node* head;
    Node* tail;

    DoublyLinkedList() : head(nullptr), tail(nullptr) {}

    void insertAtHead(int value) {
        Node* newNode = new Node(value);
        if (!head) { head = tail = newNode; return; }
        newNode->next = head;
        head->prev = newNode;
        head = newNode;
    }

    void insertAtTail(int value) {
        Node* newNode = new Node(value);
        if (!tail) { head = tail = newNode; return; }
        newNode->prev = tail;
        tail->next = newNode;
        tail = newNode;
    }

    void deleteFromHead() {
        if (!head) return;
        if (head == tail) { delete head; head = tail = nullptr; return; }
        Node* temp = head;
        head = head->next;
        head->prev = nullptr;
        delete temp;
    }

    void deleteFromTail() {
        if (!tail) return;
        if (head == tail) { delete tail; head = tail = nullptr; return; }
        Node* temp = tail;
        tail = tail->prev;
        tail->next = nullptr;
        delete temp;
    }

    void print() {
        Node* curr = head;
        while (curr) {
            cout << curr->data;
            if (curr->next) cout << " ⇄ ";
            curr = curr->next;
        }
        cout << endl;
    }
};

int main() {
    DoublyLinkedList dll;
    dll.insertAtTail(10);
    dll.insertAtTail(20);
    dll.insertAtTail(30);
    dll.insertAtHead(5);
    dll.print();           // 5 ⇄ 10 ⇄ 20 ⇄ 30
    dll.deleteFromHead();
    dll.deleteFromTail();
    dll.print();           // 10 ⇄ 20
    return 0;
}
```

```java
public class DoublyLinkedList {
    Node head, tail;

    static class Node {
        int data;
        Node prev, next;
        Node(int value) { data = value; prev = null; next = null; }
    }

    void insertAtHead(int value) {
        Node newNode = new Node(value);
        if (head == null) { head = tail = newNode; return; }
        newNode.next = head;
        head.prev = newNode;
        head = newNode;
    }

    void insertAtTail(int value) {
        Node newNode = new Node(value);
        if (tail == null) { head = tail = newNode; return; }
        newNode.prev = tail;
        tail.next = newNode;
        tail = newNode;
    }

    void deleteFromHead() {
        if (head == null) return;
        if (head == tail) { head = tail = null; return; }
        head = head.next;
        head.prev = null;
    }

    void deleteFromTail() {
        if (tail == null) return;
        if (head == tail) { head = tail = null; return; }
        tail = tail.prev;
        tail.next = null;
    }

    void print() {
        Node curr = head;
        while (curr != null) {
            System.out.print(curr.data);
            if (curr.next != null) System.out.print(" ⇄ ");
            curr = curr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        DoublyLinkedList dll = new DoublyLinkedList();
        dll.insertAtTail(10);
        dll.insertAtTail(20);
        dll.insertAtTail(30);
        dll.insertAtHead(5);
        dll.print();           // 5 ⇄ 10 ⇄ 20 ⇄ 30
        dll.deleteFromHead();
        dll.deleteFromTail();
        dll.print();           // 10 ⇄ 20
    }
}
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.prev = None
        self.next = None


class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_at_head(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = self.tail = new_node
            return
        new_node.next = self.head
        self.head.prev = new_node
        self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.tail is None:
            self.head = self.tail = new_node
            return
        new_node.prev = self.tail
        self.tail.next = new_node
        self.tail = new_node

    def delete_from_head(self):
        if self.head is None:
            return
        if self.head == self.tail:
            self.head = self.tail = None
            return
        self.head = self.head.next
        self.head.prev = None

    def delete_from_tail(self):
        if self.tail is None:
            return
        if self.head == self.tail:
            self.head = self.tail = None
            return
        self.tail = self.tail.prev
        self.tail.next = None

    def print_list(self):
        current = self.head
        parts = []
        while current:
            parts.append(str(current.data))
            current = current.next
        print(" ⇄ ".join(parts))


dll = DoublyLinkedList()
dll.insert_at_tail(10)
dll.insert_at_tail(20)
dll.insert_at_tail(30)
dll.insert_at_head(5)
dll.print_list()           # 5 ⇄ 10 ⇄ 20 ⇄ 30
dll.delete_from_head()
dll.delete_from_tail()
dll.print_list()           # 10 ⇄ 20
```

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  insertAtHead(value) {
    const newNode = new Node(value);
    if (this.head === null) { this.head = this.tail = newNode; return; }
    newNode.next = this.head;
    this.head.prev = newNode;
    this.head = newNode;
  }

  insertAtTail(value) {
    const newNode = new Node(value);
    if (this.tail === null) { this.head = this.tail = newNode; return; }
    newNode.prev = this.tail;
    this.tail.next = newNode;
    this.tail = newNode;
  }

  deleteFromHead() {
    if (this.head === null) return;
    if (this.head === this.tail) { this.head = this.tail = null; return; }
    this.head = this.head.next;
    this.head.prev = null;
  }

  deleteFromTail() {
    if (this.tail === null) return;
    if (this.head === this.tail) { this.head = this.tail = null; return; }
    this.tail = this.tail.prev;
    this.tail.next = null;
  }

  print() {
    let current = this.head;
    const parts = [];
    while (current !== null) {
      parts.push(current.data);
      current = current.next;
    }
    console.log(parts.join(" ⇄ "));
  }
}

const dll = new DoublyLinkedList();
dll.insertAtTail(10);
dll.insertAtTail(20);
dll.insertAtTail(30);
dll.insertAtHead(5);
dll.print();           // 5 ⇄ 10 ⇄ 20 ⇄ 30
dll.deleteFromHead();
dll.deleteFromTail();
dll.print();           // 10 ⇄ 20
```

---

## Key Takeaways

- Doubly linked lists trade extra memory (one more pointer per node) for bidirectional traversal
- With a `tail` pointer, both insert and delete at both ends are O(1)
- Deleting a node when you already have a reference to it is O(1) — no need to find the previous node
- DLLs are the foundation for many real-world structures: browser history, LRU caches, text editors

Next: **Linked List Problems →**
