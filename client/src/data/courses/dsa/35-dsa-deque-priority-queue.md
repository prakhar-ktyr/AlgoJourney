---
title: "Deque & Priority Queue"
---

# Deque & Priority Queue

Beyond basic stacks and queues, two powerful variations handle more complex scenarios: the **deque** (double-ended queue) and the **priority queue**.

---

## Deque (Double-Ended Queue)

A **deque** allows insertion and removal from **both ends** — front and rear — in O(1) time. It combines the powers of a stack and a queue.

```
               ← removeFront        addFront →
              ┌────┬────┬────┬────┬────┐
              │ 10 │ 20 │ 30 │ 40 │ 50 │
              └────┴────┴────┴────┴────┘
               ← addFront           removeRear →

Operations:
  addFront(x)    — insert at front
  addRear(x)     — insert at rear
  removeFront()  — remove from front
  removeRear()   — remove from rear
  peekFront()    — view front element
  peekRear()     — view rear element
```

### Deque as Stack or Queue

| Use as... | Operations Used |
|-----------|----------------|
| Stack (LIFO) | `addRear` + `removeRear` (or `addFront` + `removeFront`) |
| Queue (FIFO) | `addRear` + `removeFront` |

---

### Built-in Deque in All Languages

```cpp
#include <iostream>
#include <deque>
using namespace std;

int main() {
    deque<int> dq;

    // Add to both ends
    dq.push_back(10);     // [10]
    dq.push_back(20);     // [10, 20]
    dq.push_front(5);     // [5, 10, 20]
    dq.push_front(1);     // [1, 5, 10, 20]

    cout << dq.front() << endl;  // 1
    cout << dq.back() << endl;   // 20

    // Remove from both ends
    dq.pop_front();  // removes 1 → [5, 10, 20]
    dq.pop_back();   // removes 20 → [5, 10]

    cout << dq.size() << endl;   // 2

    // Random access (like a vector)
    cout << dq[0] << endl;  // 5
    cout << dq[1] << endl;  // 10
    return 0;
}
```

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class DequeExample {
    public static void main(String[] args) {
        Deque<Integer> dq = new ArrayDeque<>();

        // Add to both ends
        dq.addLast(10);     // [10]
        dq.addLast(20);     // [10, 20]
        dq.addFirst(5);     // [5, 10, 20]
        dq.addFirst(1);     // [1, 5, 10, 20]

        System.out.println(dq.peekFirst()); // 1
        System.out.println(dq.peekLast());  // 20

        // Remove from both ends
        dq.removeFirst();  // removes 1 → [5, 10, 20]
        dq.removeLast();   // removes 20 → [5, 10]

        System.out.println(dq.size()); // 2
    }
}
```

```python
from collections import deque

dq = deque()

# Add to both ends
dq.append(10)       # deque([10])
dq.append(20)       # deque([10, 20])
dq.appendleft(5)    # deque([5, 10, 20])
dq.appendleft(1)    # deque([1, 5, 10, 20])

print(dq[0])        # 1 (front)
print(dq[-1])       # 20 (rear)

# Remove from both ends
dq.popleft()        # removes 1 → deque([5, 10, 20])
dq.pop()            # removes 20 → deque([5, 10])

print(len(dq))      # 2

# Bonus: maxlen creates a bounded deque (auto-discards from opposite end)
bounded = deque(maxlen=3)
bounded.append(1)   # deque([1])
bounded.append(2)   # deque([1, 2])
bounded.append(3)   # deque([1, 2, 3])
bounded.append(4)   # deque([2, 3, 4]) — 1 is auto-removed from front!
```

```javascript
// JavaScript has no built-in Deque. A simple implementation:
class Deque {
  constructor() {
    this.items = {};
    this.frontIdx = 0;
    this.rearIdx = 0;
  }

  addFront(val) {
    this.frontIdx--;
    this.items[this.frontIdx] = val;
  }

  addRear(val) {
    this.items[this.rearIdx] = val;
    this.rearIdx++;
  }

  removeFront() {
    if (this.isEmpty()) throw new Error("Deque is empty");
    const val = this.items[this.frontIdx];
    delete this.items[this.frontIdx];
    this.frontIdx++;
    return val;
  }

  removeRear() {
    if (this.isEmpty()) throw new Error("Deque is empty");
    this.rearIdx--;
    const val = this.items[this.rearIdx];
    delete this.items[this.rearIdx];
    return val;
  }

  peekFront() {
    if (this.isEmpty()) throw new Error("Deque is empty");
    return this.items[this.frontIdx];
  }

  peekRear() {
    if (this.isEmpty()) throw new Error("Deque is empty");
    return this.items[this.rearIdx - 1];
  }

  isEmpty() {
    return this.rearIdx - this.frontIdx === 0;
  }

  size() {
    return this.rearIdx - this.frontIdx;
  }
}

const dq = new Deque();
dq.addRear(10);
dq.addRear(20);
dq.addFront(5);
dq.addFront(1);

console.log(dq.peekFront()); // 1
console.log(dq.peekRear());  // 20
dq.removeFront();            // removes 1
dq.removeRear();             // removes 20
console.log(dq.size());      // 2
```

---

## Priority Queue

A **priority queue** is an abstract data type where each element has a **priority**. Elements are dequeued in order of priority, not insertion order.

```
Regular Queue (FIFO):          Priority Queue:
Enqueue: A, B, C, D           Enqueue: A(p=3), B(p=1), C(p=2), D(p=1)
Dequeue: A, B, C, D           Dequeue: B, D, C, A  (lowest priority # first)

  ┌───────────────────┐         ┌───────────────────┐
  │ A → B → C → D     │         │ B(1) → D(1) → C(2) → A(3) │
  └───────────────────┘         └───────────────────┘
  Order of insertion             Order of priority
```

### How Priority Queue Differs from Regular Queue

| Feature | Regular Queue | Priority Queue |
|---------|---------------|----------------|
| Ordering | FIFO (insertion order) | By priority |
| Dequeue | Oldest element | Highest-priority element |
| Implementation | Array or linked list | Binary heap (typically) |
| Enqueue | O(1) | O(log n) |
| Dequeue | O(1) | O(log n) |
| Peek | O(1) | O(1) |

### Min-Heap vs Max-Heap

- **Min-heap (min-priority queue):** smallest element has highest priority → dequeued first.
- **Max-heap (max-priority queue):** largest element has highest priority → dequeued first.

```
Min-Heap:                Max-Heap:
      1                        9
    /   \                    /   \
   3     5                  7     8
  / \   /                  / \   /
 7   4 6                  3   4 5

peek() = 1               peek() = 9
```

---

### Built-in Priority Queue in All Languages

```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    // Max-heap (default in C++)
    priority_queue<int> maxPQ;
    maxPQ.push(30);
    maxPQ.push(10);
    maxPQ.push(50);
    maxPQ.push(20);

    cout << maxPQ.top() << endl;  // 50 (largest)
    maxPQ.pop();
    cout << maxPQ.top() << endl;  // 30

    // Min-heap
    priority_queue<int, vector<int>, greater<int>> minPQ;
    minPQ.push(30);
    minPQ.push(10);
    minPQ.push(50);
    minPQ.push(20);

    cout << minPQ.top() << endl;  // 10 (smallest)
    minPQ.pop();
    cout << minPQ.top() << endl;  // 20

    // Priority queue with custom objects
    struct Task {
        int priority;
        string name;
        bool operator>(const Task& other) const {
            return priority > other.priority;
        }
    };

    priority_queue<Task, vector<Task>, greater<Task>> taskQueue;
    taskQueue.push({3, "Low priority"});
    taskQueue.push({1, "High priority"});
    taskQueue.push({2, "Medium priority"});

    while (!taskQueue.empty()) {
        cout << taskQueue.top().name << endl;
        taskQueue.pop();
    }
    // High priority → Medium priority → Low priority

    return 0;
}
```

```java
import java.util.PriorityQueue;
import java.util.Collections;

public class PriorityQueueExample {
    public static void main(String[] args) {
        // Min-heap (default in Java)
        PriorityQueue<Integer> minPQ = new PriorityQueue<>();
        minPQ.offer(30);
        minPQ.offer(10);
        minPQ.offer(50);
        minPQ.offer(20);

        System.out.println(minPQ.peek());  // 10 (smallest)
        minPQ.poll();
        System.out.println(minPQ.peek());  // 20

        // Max-heap
        PriorityQueue<Integer> maxPQ = new PriorityQueue<>(Collections.reverseOrder());
        maxPQ.offer(30);
        maxPQ.offer(10);
        maxPQ.offer(50);
        maxPQ.offer(20);

        System.out.println(maxPQ.peek());  // 50 (largest)
        maxPQ.poll();
        System.out.println(maxPQ.peek());  // 30

        // Custom comparator
        PriorityQueue<int[]> taskQueue = new PriorityQueue<>(
            (a, b) -> a[0] - b[0]  // Sort by priority (index 0)
        );
        taskQueue.offer(new int[]{3, 1}); // priority 3
        taskQueue.offer(new int[]{1, 2}); // priority 1
        taskQueue.offer(new int[]{2, 3}); // priority 2

        while (!taskQueue.isEmpty()) {
            int[] task = taskQueue.poll();
            System.out.println("Priority: " + task[0] + ", ID: " + task[1]);
        }
        // Priority 1 → 2 → 3
    }
}
```

```python
import heapq

# Python's heapq is a min-heap
nums = [30, 10, 50, 20]
heapq.heapify(nums)  # Transform list into a heap in O(n)

print(heapq.heappop(nums))  # 10 (smallest)
print(heapq.heappop(nums))  # 20

heapq.heappush(nums, 5)
print(heapq.heappop(nums))  # 5

# Max-heap trick: negate values
max_heap = []
for val in [30, 10, 50, 20]:
    heapq.heappush(max_heap, -val)

print(-heapq.heappop(max_heap))  # 50 (largest)
print(-heapq.heappop(max_heap))  # 30

# Priority queue with tuples (priority, data)
task_queue = []
heapq.heappush(task_queue, (3, "Low priority"))
heapq.heappush(task_queue, (1, "High priority"))
heapq.heappush(task_queue, (2, "Medium priority"))

while task_queue:
    priority, name = heapq.heappop(task_queue)
    print(f"{name} (priority {priority})")
# High priority (1) → Medium priority (2) → Low priority (3)
```

```javascript
// JavaScript has no built-in priority queue.
// Here's a min-heap implementation:
class MinPriorityQueue {
  constructor() {
    this.heap = [];
  }

  enqueue(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) throw new Error("Queue is empty");
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  peek() {
    if (this.isEmpty()) throw new Error("Queue is empty");
    return this.heap[0];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.heap[parent] <= this.heap[idx]) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }

  _sinkDown(idx) {
    const length = this.heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left < length && this.heap[left] < this.heap[smallest]) {
        smallest = left;
      }
      if (right < length && this.heap[right] < this.heap[smallest]) {
        smallest = right;
      }
      if (smallest === idx) break;

      [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
      idx = smallest;
    }
  }
}

const pq = new MinPriorityQueue();
pq.enqueue(30);
pq.enqueue(10);
pq.enqueue(50);
pq.enqueue(20);

console.log(pq.dequeue()); // 10
console.log(pq.dequeue()); // 20
console.log(pq.peek());    // 30
console.log(pq.size());    // 2
```

---

## Applications

### Deque Applications

| Application | How the Deque is Used |
|-------------|----------------------|
| **Sliding Window Maximum** | Maintain a monotonic deque of indices |
| **Palindrome Checking** | Compare characters from both ends |
| **Work Stealing** | Threads steal tasks from the rear of other threads' deques |
| **Undo/Redo** | Recent actions at rear, oldest at front (bounded history) |
| **Browser History** | Navigate forward and backward |

### Priority Queue Applications

| Application | How the Priority Queue is Used |
|-------------|-------------------------------|
| **Dijkstra's Algorithm** | Always process the closest unvisited node |
| **A* Pathfinding** | Expand the most promising node |
| **Job Scheduling** | Execute highest-priority jobs first |
| **Huffman Coding** | Build the tree by always merging two smallest frequencies |
| **Merge K Sorted Lists** | Always pick the smallest head among all lists |
| **Event-Driven Simulation** | Process events in chronological order |
| **Median Finding** | Two heaps (max-heap for left half, min-heap for right) |

### Example: Dijkstra's Shortest Path (Simplified)

```
Graph (weighted):
A —(4)→ B —(1)→ D
|        |
(2)     (3)
↓        ↓
C —(5)→ D

Priority Queue processes nodes by shortest known distance:
  Start at A (dist=0)
  PQ: [(0,A)]
  Process A → update B(4), C(2)
  PQ: [(2,C), (4,B)]
  Process C → update D(2+5=7)
  PQ: [(4,B), (7,D)]
  Process B → update D(4+1=5, better!)
  PQ: [(5,D)]
  Process D → done!

Shortest: A→B→D = 5
```

---

## Complexity Summary

| Data Structure | Insert | Remove (priority) | Peek | Space |
|---------------|--------|-------------------|------|-------|
| Deque | O(1) either end | O(1) either end | O(1) | O(n) |
| Priority Queue (heap) | O(log n) | O(log n) | O(1) | O(n) |
| Unsorted array PQ | O(1) | O(n) | O(n) | O(n) |
| Sorted array PQ | O(n) | O(1) | O(1) | O(n) |

The binary heap gives the best overall balance for priority queues, which is why all standard library implementations use it.

---

## Key Takeaways

- A **deque** supports O(1) insertion/removal at both ends — use it when you need both stack and queue behavior.
- A **priority queue** orders elements by priority, not arrival time — implemented with a binary heap for O(log n) insert/remove.
- Both are essential building blocks: deques power sliding-window algorithms, priority queues power shortest-path and scheduling algorithms.
- Use your language's built-in implementations (`std::deque`, `std::priority_queue`, `ArrayDeque`, `PriorityQueue`, `heapq`, `collections.deque`) rather than writing your own in production.

---

Next: **Hash Tables →**
