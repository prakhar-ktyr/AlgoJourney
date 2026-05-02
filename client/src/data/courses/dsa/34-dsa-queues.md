---
title: "Queues"
---

# Queues

A **queue** is a linear data structure that follows the **FIFO** (First In, First Out) principle — the first element added is the first one removed.

---

## Real-World Analogies

```
Ticket Counter:         Printer Queue:          Message Queue:
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Person1 → EXIT   │    │ Doc1 → PRINTING  │    │ Msg1 → DELIVERED │
│ Person2           │    │ Doc2              │    │ Msg2              │
│ Person3           │    │ Doc3              │    │ Msg3              │
│ Person4 ← ENTER  │    │ Doc4 ← ADDED     │    │ Msg4 ← SENT      │
└──────────────────┘    └──────────────────┘    └──────────────────┘
  front        rear       front        rear       front        rear
```

People join at the **rear** and leave from the **front** — just like any real queue (line).

---

## Queue Operations

| Operation | Description | Time Complexity |
|-----------|-------------|-----------------|
| `enqueue(x)` | Add element `x` to the rear | O(1) |
| `dequeue()` | Remove and return the front element | O(1) |
| `front()` / `peek()` | Return the front element without removing | O(1) |
| `isEmpty()` | Check if the queue is empty | O(1) |
| `size()` | Return the number of elements | O(1) |

```
enqueue(10)  enqueue(20)  enqueue(30)  dequeue()    front()
                                       returns 10   returns 20

front→[10]  front→[10,20] front→[10,20,30] front→[20,30]  front→[20,30]
     ←rear       ←rear          ←rear           ←rear           ←rear
```

---

## Implementation: Circular Array Queue

A naive array implementation wastes space as the front moves forward. A **circular array** wraps around to reuse freed space.

```
Circular Array (capacity=5):
Index:  0    1    2    3    4

After enqueue(10,20,30):
       [10] [20] [30] [  ] [  ]
        ↑front        ↑rear

After dequeue() → returns 10:
       [  ] [20] [30] [  ] [  ]
             ↑front   ↑rear

After enqueue(40,50):
       [  ] [20] [30] [40] [50]
             ↑front             ↑rear

After enqueue(60) → wraps around!
       [60] [20] [30] [40] [50]
        ↑rear↑front
```

```cpp
#include <iostream>
#include <stdexcept>
using namespace std;

class Queue {
private:
    int* arr;
    int frontIdx, rearIdx, count, capacity;

public:
    Queue(int cap = 1000) : capacity(cap), frontIdx(0), rearIdx(-1), count(0) {
        arr = new int[capacity];
    }

    ~Queue() { delete[] arr; }

    void enqueue(int val) {
        if (count == capacity) {
            throw overflow_error("Queue is full");
        }
        rearIdx = (rearIdx + 1) % capacity;
        arr[rearIdx] = val;
        count++;
    }

    int dequeue() {
        if (isEmpty()) {
            throw underflow_error("Queue is empty");
        }
        int val = arr[frontIdx];
        frontIdx = (frontIdx + 1) % capacity;
        count--;
        return val;
    }

    int front() const {
        if (isEmpty()) {
            throw underflow_error("Queue is empty");
        }
        return arr[frontIdx];
    }

    bool isEmpty() const { return count == 0; }
    int size() const { return count; }
};

int main() {
    Queue q;
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);

    cout << q.front() << endl;    // 10
    cout << q.dequeue() << endl;  // 10
    cout << q.dequeue() << endl;  // 20
    cout << q.front() << endl;    // 30
    cout << q.size() << endl;     // 1
    return 0;
}
```

```java
public class Queue {
    private int[] arr;
    private int frontIdx, rearIdx, count, capacity;

    public Queue(int capacity) {
        this.capacity = capacity;
        this.arr = new int[capacity];
        this.frontIdx = 0;
        this.rearIdx = -1;
        this.count = 0;
    }

    public Queue() { this(1000); }

    public void enqueue(int val) {
        if (count == capacity) {
            throw new RuntimeException("Queue is full");
        }
        rearIdx = (rearIdx + 1) % capacity;
        arr[rearIdx] = val;
        count++;
    }

    public int dequeue() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        int val = arr[frontIdx];
        frontIdx = (frontIdx + 1) % capacity;
        count--;
        return val;
    }

    public int front() {
        if (isEmpty()) {
            throw new RuntimeException("Queue is empty");
        }
        return arr[frontIdx];
    }

    public boolean isEmpty() { return count == 0; }
    public int size() { return count; }

    public static void main(String[] args) {
        Queue q = new Queue();
        q.enqueue(10);
        q.enqueue(20);
        q.enqueue(30);

        System.out.println(q.front());    // 10
        System.out.println(q.dequeue());  // 10
        System.out.println(q.dequeue());  // 20
        System.out.println(q.front());    // 30
        System.out.println(q.size());     // 1
    }
}
```

```python
class Queue:
    def __init__(self, capacity=1000):
        self.arr = [None] * capacity
        self.capacity = capacity
        self.front_idx = 0
        self.rear_idx = -1
        self.count = 0

    def enqueue(self, val):
        if self.count == self.capacity:
            raise OverflowError("Queue is full")
        self.rear_idx = (self.rear_idx + 1) % self.capacity
        self.arr[self.rear_idx] = val
        self.count += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        val = self.arr[self.front_idx]
        self.front_idx = (self.front_idx + 1) % self.capacity
        self.count -= 1
        return val

    def front(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.arr[self.front_idx]

    def is_empty(self):
        return self.count == 0

    def size(self):
        return self.count


q = Queue()
q.enqueue(10)
q.enqueue(20)
q.enqueue(30)

print(q.front())    # 10
print(q.dequeue())  # 10
print(q.dequeue())  # 20
print(q.front())    # 30
print(q.size())     # 1
```

```javascript
class Queue {
  constructor(capacity = 1000) {
    this.arr = new Array(capacity);
    this.capacity = capacity;
    this.frontIdx = 0;
    this.rearIdx = -1;
    this.count = 0;
  }

  enqueue(val) {
    if (this.count === this.capacity) {
      throw new Error("Queue is full");
    }
    this.rearIdx = (this.rearIdx + 1) % this.capacity;
    this.arr[this.rearIdx] = val;
    this.count++;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    const val = this.arr[this.frontIdx];
    this.frontIdx = (this.frontIdx + 1) % this.capacity;
    this.count--;
    return val;
  }

  front() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    return this.arr[this.frontIdx];
  }

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }
}

const q = new Queue();
q.enqueue(10);
q.enqueue(20);
q.enqueue(30);

console.log(q.front());    // 10
console.log(q.dequeue());  // 10
console.log(q.dequeue());  // 20
console.log(q.front());    // 30
console.log(q.size());     // 1
```

---

## Implementation: Linked List Queue

A linked list provides a naturally dynamic queue — no fixed capacity, no wasted space.

```
front                               rear
  ↓                                   ↓
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│10|next│───→│20|next│───→│30|next│───→│40|null│
└──────┘    └──────┘    └──────┘    └──────┘

dequeue() → remove from front (10)
enqueue(50) → add at rear
```

```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int d) : data(d), next(nullptr) {}
};

class LinkedQueue {
private:
    Node* frontNode;
    Node* rearNode;
    int count;

public:
    LinkedQueue() : frontNode(nullptr), rearNode(nullptr), count(0) {}

    ~LinkedQueue() {
        while (frontNode) {
            Node* temp = frontNode;
            frontNode = frontNode->next;
            delete temp;
        }
    }

    void enqueue(int val) {
        Node* newNode = new Node(val);
        if (isEmpty()) {
            frontNode = rearNode = newNode;
        } else {
            rearNode->next = newNode;
            rearNode = newNode;
        }
        count++;
    }

    int dequeue() {
        if (isEmpty()) throw runtime_error("Queue is empty");
        int val = frontNode->data;
        Node* temp = frontNode;
        frontNode = frontNode->next;
        if (!frontNode) rearNode = nullptr;
        delete temp;
        count--;
        return val;
    }

    int front() const {
        if (isEmpty()) throw runtime_error("Queue is empty");
        return frontNode->data;
    }

    bool isEmpty() const { return count == 0; }
    int size() const { return count; }
};

int main() {
    LinkedQueue q;
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);

    cout << q.dequeue() << endl;  // 10
    cout << q.front() << endl;    // 20
    cout << q.size() << endl;     // 2
    return 0;
}
```

```java
public class LinkedQueue {
    private static class Node {
        int data;
        Node next;
        Node(int d) { data = d; next = null; }
    }

    private Node frontNode, rearNode;
    private int count;

    public LinkedQueue() {
        frontNode = rearNode = null;
        count = 0;
    }

    public void enqueue(int val) {
        Node newNode = new Node(val);
        if (isEmpty()) {
            frontNode = rearNode = newNode;
        } else {
            rearNode.next = newNode;
            rearNode = newNode;
        }
        count++;
    }

    public int dequeue() {
        if (isEmpty()) throw new RuntimeException("Queue is empty");
        int val = frontNode.data;
        frontNode = frontNode.next;
        if (frontNode == null) rearNode = null;
        count--;
        return val;
    }

    public int front() {
        if (isEmpty()) throw new RuntimeException("Queue is empty");
        return frontNode.data;
    }

    public boolean isEmpty() { return count == 0; }
    public int size() { return count; }

    public static void main(String[] args) {
        LinkedQueue q = new LinkedQueue();
        q.enqueue(10);
        q.enqueue(20);
        q.enqueue(30);

        System.out.println(q.dequeue());  // 10
        System.out.println(q.front());    // 20
        System.out.println(q.size());     // 2
    }
}
```

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedQueue:
    def __init__(self):
        self.front_node = None
        self.rear_node = None
        self.count = 0

    def enqueue(self, val):
        new_node = Node(val)
        if self.is_empty():
            self.front_node = self.rear_node = new_node
        else:
            self.rear_node.next = new_node
            self.rear_node = new_node
        self.count += 1

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        val = self.front_node.data
        self.front_node = self.front_node.next
        if self.front_node is None:
            self.rear_node = None
        self.count -= 1
        return val

    def front(self):
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.front_node.data

    def is_empty(self):
        return self.count == 0

    def size(self):
        return self.count


q = LinkedQueue()
q.enqueue(10)
q.enqueue(20)
q.enqueue(30)

print(q.dequeue())  # 10
print(q.front())    # 20
print(q.size())     # 2
```

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedQueue {
  constructor() {
    this.frontNode = null;
    this.rearNode = null;
    this.count = 0;
  }

  enqueue(val) {
    const newNode = new Node(val);
    if (this.isEmpty()) {
      this.frontNode = this.rearNode = newNode;
    } else {
      this.rearNode.next = newNode;
      this.rearNode = newNode;
    }
    this.count++;
  }

  dequeue() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    const val = this.frontNode.data;
    this.frontNode = this.frontNode.next;
    if (this.frontNode === null) this.rearNode = null;
    this.count--;
    return val;
  }

  front() {
    if (this.isEmpty()) {
      throw new Error("Queue is empty");
    }
    return this.frontNode.data;
  }

  isEmpty() {
    return this.count === 0;
  }

  size() {
    return this.count;
  }
}

const q = new LinkedQueue();
q.enqueue(10);
q.enqueue(20);
q.enqueue(30);

console.log(q.dequeue());  // 10
console.log(q.front());    // 20
console.log(q.size());     // 2
```

---

## Built-in Queue Classes

```cpp
#include <iostream>
#include <queue>
using namespace std;

int main() {
    queue<int> q;
    q.push(10);     // enqueue
    q.push(20);
    q.push(30);

    cout << q.front() << endl;  // 10
    cout << q.back() << endl;   // 30
    q.pop();                    // dequeue (removes 10)
    cout << q.size() << endl;   // 2
    cout << q.empty() << endl;  // 0 (false)
    return 0;
}
```

```java
import java.util.LinkedList;
import java.util.Queue;

public class BuiltInQueue {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();
        queue.offer(10);    // enqueue
        queue.offer(20);
        queue.offer(30);

        System.out.println(queue.peek());  // 10 (front)
        System.out.println(queue.poll());  // 10 (dequeue)
        System.out.println(queue.size());  // 2
        System.out.println(queue.isEmpty()); // false
    }
}
```

```python
from collections import deque

# deque is the standard way to implement a queue in Python
q = deque()
q.append(10)     # enqueue (add to rear)
q.append(20)
q.append(30)

print(q[0])         # 10 (front/peek)
print(q.popleft())  # 10 (dequeue from front)
print(len(q))       # 2
print(not q)        # False (not empty)

# For thread-safe queues:
from queue import Queue
safe_q = Queue()
safe_q.put(10)
print(safe_q.get())  # 10
```

```javascript
// JavaScript has no built-in queue class, but arrays work for small queues.
// Note: shift() is O(n) — for performance-critical code, use a linked list.
const queue = [];
queue.push(10);     // enqueue
queue.push(20);
queue.push(30);

console.log(queue[0]);      // 10 (peek front)
console.log(queue.shift()); // 10 (dequeue — O(n))
console.log(queue.length);  // 2

// For O(1) dequeue, use a Map-based or linked-list-based queue
```

---

## Applications of Queues

| Application | How the Queue is Used |
|-------------|----------------------|
| **BFS (Breadth-First Search)** | Explore neighbors level by level |
| **CPU Scheduling** | Processes wait in a ready queue (Round Robin) |
| **Print Queue** | Documents printed in order received |
| **Message Queues** | Async communication (RabbitMQ, Kafka) |
| **Buffering** | Keyboard input buffer, streaming data |
| **Web Servers** | Request queue for handling incoming connections |

### BFS Example

BFS uses a queue to explore a graph level by level:

```
Graph:        BFS from node 1:
1 — 2         Queue: [1]    → Visit 1, enqueue neighbors 2,3
|   |         Queue: [2,3]  → Visit 2, enqueue neighbor 4
3 — 4         Queue: [3,4]  → Visit 3, enqueue neighbor 4 (already seen)
              Queue: [4]    → Visit 4

Visit order: 1, 2, 3, 4
```

---

## Array Queue vs Linked List Queue

| Feature | Circular Array | Linked List |
|---------|----------------|-------------|
| Memory | Contiguous, cache-friendly | Scattered nodes |
| Capacity | Fixed (or needs resizing) | Unlimited |
| Overhead | Minimal (just the array) | Extra pointer per node |
| enqueue/dequeue | O(1) | O(1) |
| Best for | Known max size, speed | Unknown size, no wasted space |

---

## Key Takeaways

- A queue is **FIFO** — first in, first out.
- Core operations: `enqueue`, `dequeue`, `front`, `isEmpty` — all O(1).
- **Circular array** avoids wasted space in array-based queues.
- **Linked list** queues have no capacity limit.
- Queues are essential for BFS, scheduling, and buffering.

---

Next: **Deque & Priority Queue →**
