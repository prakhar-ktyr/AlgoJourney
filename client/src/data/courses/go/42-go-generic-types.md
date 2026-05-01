---
title: Go Generic Types
---

# Go Generic Types & Constraints

This lesson covers generic structs, generic interfaces, and advanced constraint patterns.

---

## Generic Structs

```go
type Pair[T any] struct {
    First  T
    Second T
}

func NewPair[T any](a, b T) Pair[T] {
    return Pair[T]{First: a, Second: b}
}

p1 := NewPair(1, 2)
p2 := NewPair("hello", "world")
fmt.Println(p1)  // {1 2}
fmt.Println(p2)  // {hello world}
```

---

## Generic Structs with Multiple Type Parameters

```go
type KeyValue[K comparable, V any] struct {
    Key   K
    Value V
}

type Result[T any] struct {
    Data  T
    Error error
}

r := Result[int]{Data: 42, Error: nil}
```

---

## Methods on Generic Types

```go
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}

func (s *Stack[T]) Len() int {
    return len(s.items)
}
```

```go
s := &Stack[int]{}
s.Push(1)
s.Push(2)
s.Push(3)

val, _ := s.Pop()
fmt.Println(val)     // 3
fmt.Println(s.Len()) // 2
```

> [!NOTE]
> You cannot add new type parameters to methods. Methods must use the type parameters declared on the type.

---

## Generic Interfaces

```go
type Container[T any] interface {
    Add(T)
    Get(int) T
    Len() int
}
```

---

## Constraint Interfaces with Methods

```go
type Stringer interface {
    String() string
}

func PrintAll[T Stringer](items []T) {
    for _, item := range items {
        fmt.Println(item.String())
    }
}
```

---

## Combining Type Sets and Methods

```go
type Numeric interface {
    ~int | ~float64
    String() string
}
```

This constraint requires both a numeric underlying type AND a `String()` method.

---

## Type Sets (Union Constraints)

```go
type Integer interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64
}

type Unsigned interface {
    ~uint | ~uint8 | ~uint16 | ~uint32 | ~uint64
}

type Signed interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64 |
    ~float32 | ~float64
}
```

---

## The `slices` Package (Go 1.21+)

Go ships generic utility functions:

```go
import "slices"

nums := []int{3, 1, 4, 1, 5}
slices.Sort(nums)           // [1 1 3 4 5]
slices.Contains(nums, 4)    // true
idx := slices.Index(nums, 3) // 2
slices.Reverse(nums)        // [5 4 3 1 1]
```

---

## The `maps` Package (Go 1.21+)

```go
import "maps"

m := map[string]int{"a": 1, "b": 2}
keys := maps.Keys(m)     // iterator
vals := maps.Values(m)   // iterator
clone := maps.Clone(m)   // shallow copy
```

---

## Complete Example

```go
package main

import "fmt"

// Generic linked list
type Node[T any] struct {
    Value T
    Next  *Node[T]
}

type LinkedList[T any] struct {
    Head *Node[T]
    size int
}

func (l *LinkedList[T]) Prepend(val T) {
    l.Head = &Node[T]{Value: val, Next: l.Head}
    l.size++
}

func (l *LinkedList[T]) ToSlice() []T {
    result := make([]T, 0, l.size)
    for n := l.Head; n != nil; n = n.Next {
        result = append(result, n.Value)
    }
    return result
}

func (l *LinkedList[T]) Len() int {
    return l.size
}

// Generic Set
type Set[T comparable] struct {
    items map[T]struct{}
}

func NewSet[T comparable]() *Set[T] {
    return &Set[T]{items: make(map[T]struct{})}
}

func (s *Set[T]) Add(v T)          { s.items[v] = struct{}{} }
func (s *Set[T]) Has(v T) bool     { _, ok := s.items[v]; return ok }
func (s *Set[T]) Len() int         { return len(s.items) }

func main() {
    // LinkedList
    list := &LinkedList[string]{}
    list.Prepend("Go")
    list.Prepend("is")
    list.Prepend("awesome")
    fmt.Println(list.ToSlice())  // [awesome is Go]

    // Set
    s := NewSet[int]()
    s.Add(1)
    s.Add(2)
    s.Add(2)  // duplicate
    fmt.Printf("Set size: %d, has 2: %t\n", s.Len(), s.Has(2))
}
```

---

Next: file handling in Go.
