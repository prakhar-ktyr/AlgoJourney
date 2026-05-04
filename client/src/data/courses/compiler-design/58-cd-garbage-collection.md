---
title: Garbage Collection
---

# Garbage Collection

**Garbage collection (GC)** is automatic memory management — the runtime reclaims memory that the program can no longer reach. This eliminates manual `free()` calls and prevents entire classes of memory bugs.

---

## The Core Problem

When is it safe to free an object?

```java
Object a = new Object();  // object created
Object b = a;             // two references to same object
a = null;                 // still reachable via b
b = null;                 // NOW unreachable — safe to reclaim
```

The GC must determine which objects are **reachable** (live) and which are **garbage** (unreachable).

---

## GC Roots

A **root** is a starting point for reachability analysis. An object is live if it's reachable from any root:

| Root type | Example |
|-----------|---------|
| Stack variables | Local references in active frames |
| Global/static variables | Class-level references |
| CPU registers | References currently in registers |
| JNI references | Native code holding Java refs |

```
Roots: [stack] [globals] [registers]
         |        |         |
         v        v         v
       [Obj A] → [Obj B] → [Obj C]
                    |
                    v
                  [Obj D]

[Obj E] ← not reachable from any root = GARBAGE
```

---

## Reference Counting

### How It Works

Each object maintains a count of how many references point to it:

```python
# Python uses reference counting internally
a = [1, 2, 3]   # refcount([1,2,3]) = 1
b = a            # refcount([1,2,3]) = 2
c = a            # refcount([1,2,3]) = 3
del b            # refcount([1,2,3]) = 2
del c            # refcount([1,2,3]) = 1
del a            # refcount([1,2,3]) = 0 → FREE immediately
```

### Implementation

```c
struct Object {
    int ref_count;
    // ... object data ...
};

void increment_ref(Object *obj) {
    obj->ref_count++;
}

void decrement_ref(Object *obj) {
    obj->ref_count--;
    if (obj->ref_count == 0) {
        // Decrement refs for all objects this one points to
        for each child in obj->references:
            decrement_ref(child);
        free(obj);
    }
}
```

### Advantages

- **Immediate reclamation** — objects freed as soon as they become unreachable
- **Incremental** — small cost spread across program execution
- **Simple to understand**

### The Circular Reference Problem

```python
# Creates a cycle — reference counting alone can't collect this!
class Node:
    def __init__(self):
        self.next = None

a = Node()
b = Node()
a.next = b    # a → b
b.next = a    # b → a (CYCLE!)
del a         # refcount(node_a) = 1 (b still points to it)
del b         # refcount(node_b) = 1 (a still points to it)
# Both nodes have refcount 1 but are unreachable — LEAK!
```

```
[Node A] ←→ [Node B]
refcount=1    refcount=1

No root points to either, but neither reaches 0.
```

**Solutions:**
- Augment with a cycle detector (Python does this)
- Use weak references for back-pointers
- Combine with tracing GC

---

## Mark-and-Sweep

The most fundamental tracing GC algorithm.

### Phase 1: Mark

Starting from GC roots, traverse all reachable objects and mark them:

```
Algorithm Mark(roots):
    worklist = roots
    while worklist is not empty:
        obj = worklist.pop()
        if obj.marked == false:
            obj.marked = true
            for each ref in obj.references:
                worklist.push(ref)
```

### Phase 2: Sweep

Scan the entire heap; free any object that wasn't marked:

```
Algorithm Sweep(heap):
    for each obj in heap:
        if obj.marked == true:
            obj.marked = false   // reset for next collection
        else:
            free(obj)            // garbage — reclaim it
```

### Visualization

```
Before GC:
  Roots → [A]* → [B]* → [C]*
                    ↓
                  [D]*
  
  [E] [F] → [G]     ← not reachable from roots

After Mark: A, B, C, D are marked (*)
After Sweep: E, F, G are freed
```

### Stop-the-World

Mark-and-sweep requires **pausing** the program (the "mutator") during collection:

```
Program running → PAUSE → Mark → Sweep → RESUME → Program running
                  |_______GC pause_______|
```

Long pauses are problematic for interactive or real-time applications.

### Characteristics

| Property | Value |
|----------|-------|
| Handles cycles? | Yes |
| Pause time | Proportional to heap size |
| Fragmentation | Yes (doesn't compact) |
| Throughput cost | Moderate |

---

## Copying Collection (Cheney's Algorithm)

### Idea

Divide the heap into two equal halves: **from-space** and **to-space**. Allocate only in from-space. When it fills up, copy all live objects to to-space, then swap.

```
Before GC:
FROM-SPACE: [A][garbage][B][garbage][C][garbage]
TO-SPACE:   [empty................................]

After GC:
FROM-SPACE: [empty................................]  ← now becomes to-space
TO-SPACE:   [A][B][C]............................   ← now becomes from-space
```

### Algorithm

```
Algorithm Copy_Collect():
    swap(from_space, to_space)
    scan = alloc_ptr = to_space.start
    
    // Copy roots
    for each root ref in roots:
        root ref = copy(root ref)
    
    // Breadth-first traversal (Cheney's trick)
    while scan < alloc_ptr:
        obj = object at scan
        for each ref in obj.references:
            ref = copy(ref)
        scan += size_of(obj)

Algorithm copy(obj):
    if obj has forwarding pointer:
        return forwarding_pointer
    else:
        new_addr = alloc_ptr
        memcpy(new_addr, obj, size_of(obj))
        alloc_ptr += size_of(obj)
        obj.forwarding_pointer = new_addr  // leave redirect
        return new_addr
```

### Advantages

- **No fragmentation** — live objects are compacted
- **Fast allocation** — just bump a pointer (no free list search)
- **Cost proportional to live objects** (not heap size)

### Disadvantages

- **Wastes half the heap** — only half is usable at any time
- **Must copy every live object** — expensive for long-lived data
- **Updates all pointers** — forwarding pointers handle this

---

## Generational Garbage Collection

### The Generational Hypothesis

> Most objects die young.

Empirical observation across many programs:

```
Object lifetime distribution:

  |████████████████     ← many objects die very quickly
  |███████
  |████
  |███
  |██
  |██
  |█
  |█
  |█░░░░░░░░░░░░░░░   ← few objects live a long time
  +-------------------→ lifetime
```

### Design

Divide the heap into **generations**:

```
+------------------+-------------------------+
|  Young Gen       |      Old Gen            |
|  (nursery)       |                         |
|  Collected often |  Collected rarely       |
|  Small           |  Large                  |
+------------------+-------------------------+
```

### How It Works

1. **Allocate in young generation** (fast bump-pointer)
2. **Minor GC**: collect young gen frequently (most objects are dead → fast)
3. **Promotion**: objects that survive multiple collections move to old gen
4. **Major GC**: collect old gen rarely (expensive but infrequent)

```
Allocation → [Young Gen]
                  |
            Minor GC (frequent, fast)
                  |
            Survivors → promotion after N collections
                  |
              [Old Gen]
                  |
            Major GC (rare, slower)
```

### The Write Barrier Problem

If an old-gen object points to a young-gen object, the young-gen object is reachable but not from young-gen roots:

```
Old Gen: [OldObj] ---→ [YoungObj]   ← must not collect YoungObj!
```

**Solution: Write barrier** — intercept pointer writes and record cross-generation references in a **remembered set**:

```c
// Write barrier (simplified)
void write_field(Object *obj, Object *value) {
    if (is_old(obj) && is_young(value)) {
        remembered_set.add(obj);  // track this reference
    }
    obj->field = value;
}
```

During minor GC, scan the remembered set as additional roots.

### Typical Configuration

| Generation | Size | Collection | Algorithm |
|-----------|------|------------|-----------|
| Young (Eden + Survivors) | ~1/3 heap | Every few seconds | Copying |
| Old (Tenured) | ~2/3 heap | Minutes to hours | Mark-sweep or mark-compact |

---

## Modern GC Algorithms

### G1 (Garbage First) — Java

- Divides heap into **regions** (not just two generations)
- Collects regions with most garbage first (hence "Garbage First")
- Concurrent marking (reduces pause times)
- Target: predictable pause times (e.g., < 200ms)

### ZGC — Java (since JDK 11)

- **Sub-millisecond pauses** regardless of heap size
- Uses colored pointers (metadata in pointer bits)
- Concurrent relocation (moves objects while program runs)
- Handles multi-terabyte heaps

### Shenandoah — Java

- Similar goals to ZGC (low-pause concurrent GC)
- Uses Brooks forwarding pointers
- Concurrent compaction

### Tri-Color Marking

Used by concurrent collectors to mark objects while the program is running:

| Color | Meaning |
|-------|---------|
| **White** | Not yet visited (potentially garbage) |
| **Gray** | Visited, but children not yet scanned |
| **Black** | Visited and all children scanned |

```
Start:  all objects WHITE
        roots marked GRAY

Process: while GRAY objects exist:
           pick gray object
           scan its children (mark them GRAY)
           mark object BLACK

End:    WHITE objects = garbage
        BLACK objects = live
```

**Invariant** (maintained by write barrier): A black object never directly points to a white object. This ensures correctness even as the program modifies the heap concurrently.

---

## GC Performance Metrics

| Metric | Description |
|--------|-------------|
| **Throughput** | Fraction of time spent in application (vs. GC) |
| **Latency** | Maximum pause time |
| **Footprint** | Total memory used (heap + GC metadata) |
| **Promptness** | How quickly garbage is reclaimed |

These metrics are often in tension — optimizing one may hurt another.

---

## Comparison of GC Approaches

| Algorithm | Handles cycles | Fragmentation | Pause time | Space overhead |
|-----------|---------------|---------------|------------|----------------|
| Reference counting | No | No compaction | None (incremental) | Per-object count |
| Mark-and-sweep | Yes | Yes (external) | O(heap) | Mark bit |
| Copying | Yes | None | O(live data) | 2× heap |
| Generational | Yes | Varies | Short (minor) | Write barrier |
| Concurrent (G1/ZGC) | Yes | Minimal | Sub-ms | Pointer metadata |

---

## Exercises

1. **Reference counting**: Trace the reference counts for each object:
   ```python
   a = Object()      # refcount(a) = ?
   b = Object()      # refcount(b) = ?
   a.ref = b         # refcounts?
   c = a             # refcounts?
   del a             # refcounts?
   del c             # refcounts? What gets freed?
   ```

2. **Mark-and-sweep**: Given the object graph below, identify which objects are garbage:
   ```
   Roots: [R1] → [A] → [B] → [C]
          [R2] → [D]
   Other: [E] → [F] → [E]  (cycle, not reachable from roots)
          [G] (isolated)
   ```

3. **Copying collector**: Starting with from-space containing objects A(20B), B(30B), C(10B), D(40B) where only A and C are reachable from roots, show the state of to-space after collection.

4. **Generational GC**: Explain why minor collections are fast. What would happen if the generational hypothesis didn't hold (i.e., most objects lived forever)?

5. **Tri-color invariant**: If the mutator creates a pointer from a black object to a white object without a write barrier, explain what could go wrong.

6. **Choose a GC**: For each scenario, which GC strategy fits best?
   - Real-time game engine (needs consistent frame rate)
   - Batch data processing (maximize throughput)
   - Mobile app (limited memory)
   - Long-running server (predictable response times)

---

## Summary

| Concept | Key takeaway |
|---------|-------------|
| GC purpose | Automatically reclaim unreachable memory |
| Reference counting | Simple, immediate, but can't handle cycles |
| Mark-and-sweep | Handles cycles, causes pauses |
| Copying | Eliminates fragmentation, wastes half heap |
| Generational | Exploits "most objects die young" |
| Modern GC | Concurrent, region-based, sub-ms pauses |
| Roots | Starting points for reachability (stack, globals, registers) |

Garbage collection is a key area where compiler/runtime design directly impacts application performance and developer productivity.
