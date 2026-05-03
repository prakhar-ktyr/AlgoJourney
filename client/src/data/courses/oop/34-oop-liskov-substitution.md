---
title: Liskov Substitution Principle
---

# Liskov Substitution Principle (LSP)

> "Objects of a superclass should be replaceable with objects of its subclasses without breaking the program."
> — Barbara Liskov

If `S` is a subtype of `T`, then objects of type `T` can be replaced with objects of type `S` without altering the correctness of the program.

---

## The Idea in Simple Terms

Any code that works with a parent class should also work correctly with any child class — **without surprises**.

```cpp
// If this works:
void process(Animal& animal) {
    animal.eat();
    animal.move();
}

// Then ALL of these must also work correctly:
Dog dog;    process(dog);   // ✅
Cat cat;    process(cat);   // ✅
Fish fish;  process(fish);  // ✅
```

```csharp
// If this works:
void Process(Animal animal) {
    animal.Eat();
    animal.Move();
}

// Then ALL of these must also work correctly:
Process(new Dog());   // ✅
Process(new Cat());   // ✅
Process(new Fish());  // ✅
```

```java
// If this works:
void process(Animal animal) {
    animal.eat();
    animal.move();
}

// Then ALL of these must also work correctly:
process(new Dog());     // ✅
process(new Cat());     // ✅
process(new Fish());    // ✅
```

```python
# If this works:
def process(animal):
    animal.eat()
    animal.move()

# Then ALL of these must also work correctly:
process(Dog())   # ✅
process(Cat())   # ✅
process(Fish())  # ✅
```

```javascript
// If this works:
function process(animal) {
  animal.eat();
  animal.move();
}

// Then ALL of these must also work correctly:
process(new Dog());   // ✅
process(new Cat());   // ✅
process(new Fish());  // ✅
```

---

## The Classic Violation: Square and Rectangle

```cpp
class Rectangle {
protected:
    int width_;
    int height_;
public:
    virtual void setWidth(int w) { width_ = w; }
    virtual void setHeight(int h) { height_ = h; }
    int getArea() const { return width_ * height_; }
};

class Square : public Rectangle {
public:
    void setWidth(int w) override {
        width_ = w;
        height_ = w;  // Force height = width
    }

    void setHeight(int h) override {
        width_ = h;   // Force width = height
        height_ = h;
    }
};
```

```csharp
class Rectangle {
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
    public int GetArea() => Width * Height;
}

class Square : Rectangle {
    public override int Width {
        get => base.Width;
        set { base.Width = value; base.Height = value; } // Force height = width
    }

    public override int Height {
        get => base.Height;
        set { base.Width = value; base.Height = value; } // Force width = height
    }
}
```

```java
class Rectangle {
    protected int width;
    protected int height;

    void setWidth(int w) { this.width = w; }
    void setHeight(int h) { this.height = h; }

    int getArea() { return width * height; }
}

class Square extends Rectangle {
    @Override
    void setWidth(int w) {
        this.width = w;
        this.height = w;  // Force height = width
    }

    @Override
    void setHeight(int h) {
        this.width = h;   // Force width = height
        this.height = h;
    }
}
```

```python
class Rectangle:
    def __init__(self):
        self.width = 0
        self.height = 0

    def set_width(self, w):
        self.width = w

    def set_height(self, h):
        self.height = h

    def get_area(self):
        return self.width * self.height

class Square(Rectangle):
    def set_width(self, w):
        self.width = w
        self.height = w  # Force height = width

    def set_height(self, h):
        self.width = h   # Force width = height
        self.height = h
```

```javascript
class Rectangle {
  constructor() {
    this.width = 0;
    this.height = 0;
  }

  setWidth(w) { this.width = w; }
  setHeight(h) { this.height = h; }

  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w) {
    this.width = w;
    this.height = w;  // Force height = width
  }

  setHeight(h) {
    this.width = h;   // Force width = height
    this.height = h;
  }
}
```

This seems logical — a square **is** a rectangle, right?

```cpp
void testRectangle(Rectangle& r) {
    r.setWidth(5);
    r.setHeight(4);
    assert(r.getArea() == 20);  // Expected: 5 * 4 = 20
}

Rectangle rect; testRectangle(rect);  // ✅ 20
Square sq;      testRectangle(sq);    // ❌ 16! (both became 4)
```

```csharp
void TestRectangle(Rectangle r) {
    r.Width = 5;
    r.Height = 4;
    Debug.Assert(r.GetArea() == 20);  // Expected: 5 * 4 = 20
}

TestRectangle(new Rectangle());  // ✅ 20
TestRectangle(new Square());     // ❌ 16! (both became 4)
```

```java
void testRectangle(Rectangle r) {
    r.setWidth(5);
    r.setHeight(4);
    assert r.getArea() == 20;  // Expected: 5 * 4 = 20
}

testRectangle(new Rectangle());  // ✅ 20
testRectangle(new Square());     // ❌ 16! (both became 4)
```

```python
def test_rectangle(r):
    r.set_width(5)
    r.set_height(4)
    assert r.get_area() == 20  # Expected: 5 * 4 = 20

test_rectangle(Rectangle())  # ✅ 20
test_rectangle(Square())     # ❌ 16! (both became 4)
```

```javascript
function testRectangle(r) {
  r.setWidth(5);
  r.setHeight(4);
  console.assert(r.getArea() === 20);  // Expected: 5 * 4 = 20
}

testRectangle(new Rectangle());  // ✅ 20
testRectangle(new Square());     // ❌ 16! (both became 4)
```

The `Square` class **breaks the expected behaviour** of `Rectangle`. This violates LSP.

### The Fix

```cpp
// ✅ Use a common interface instead of forcing inheritance
class Shape {
public:
    virtual int getArea() const = 0;
    virtual ~Shape() = default;
};

class Rectangle : public Shape {
    int width_, height_;
public:
    Rectangle(int w, int h) : width_(w), height_(h) { }
    int getArea() const override { return width_ * height_; }
};

class Square : public Shape {
    int side_;
public:
    Square(int side) : side_(side) { }
    int getArea() const override { return side_ * side_; }
};
```

```csharp
// ✅ Use a common interface instead of forcing inheritance
interface IShape {
    int GetArea();
}

class Rectangle : IShape {
    public int Width { get; }
    public int Height { get; }

    public Rectangle(int w, int h) { Width = w; Height = h; }
    public int GetArea() => Width * Height;
}

class Square : IShape {
    public int Side { get; }

    public Square(int side) { Side = side; }
    public int GetArea() => Side * Side;
}
```

```java
// ✅ Use a common interface instead of forcing inheritance
interface Shape {
    int getArea();
}

class Rectangle implements Shape {
    private int width, height;

    Rectangle(int w, int h) { this.width = w; this.height = h; }

    @Override
    public int getArea() { return width * height; }
}

class Square implements Shape {
    private int side;

    Square(int side) { this.side = side; }

    @Override
    public int getArea() { return side * side; }
}
```

```python
# ✅ Use a common interface instead of forcing inheritance
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def get_area(self) -> int:
        pass

class Rectangle(Shape):
    def __init__(self, w, h):
        self.width = w
        self.height = h

    def get_area(self):
        return self.width * self.height

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def get_area(self):
        return self.side * self.side
```

```javascript
// ✅ Use a common interface instead of forcing inheritance
class Shape {
  getArea() { throw new Error("Must implement getArea()"); }
}

class Rectangle extends Shape {
  constructor(w, h) {
    super();
    this.width = w;
    this.height = h;
  }

  getArea() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  getArea() { return this.side * this.side; }
}
```

---

## Rules for LSP Compliance

### 1. Preconditions Cannot Be Strengthened

A subclass shouldn't require **more** than the parent:

```cpp
class Bird {
public:
    virtual void fly(int altitude) {
        // Flies at any altitude
    }
};

class Eagle : public Bird {
public:
    void fly(int altitude) override {
        if (altitude < 1000) throw std::runtime_error("Too low!");
        // ❌ Strengthened precondition — breaks code expecting any altitude
    }
};
```

```csharp
class Bird {
    public virtual void Fly(int altitude) {
        // Flies at any altitude
    }
}

class Eagle : Bird {
    public override void Fly(int altitude) {
        if (altitude < 1000) throw new InvalidOperationException("Too low!");
        // ❌ Strengthened precondition — breaks code expecting any altitude
    }
}
```

```java
class Bird {
    void fly(int altitude) {
        // Flies at any altitude
    }
}

class Eagle extends Bird {
    @Override
    void fly(int altitude) {
        if (altitude < 1000) throw new RuntimeException("Too low!");
        // ❌ Strengthened precondition — breaks code expecting any altitude
    }
}
```

```python
class Bird:
    def fly(self, altitude):
        pass  # Flies at any altitude

class Eagle(Bird):
    def fly(self, altitude):
        if altitude < 1000:
            raise RuntimeError("Too low!")
        # ❌ Strengthened precondition — breaks code expecting any altitude
```

```javascript
class Bird {
  fly(altitude) {
    // Flies at any altitude
  }
}

class Eagle extends Bird {
  fly(altitude) {
    if (altitude < 1000) throw new Error("Too low!");
    // ❌ Strengthened precondition — breaks code expecting any altitude
  }
}
```

### 2. Postconditions Cannot Be Weakened

A subclass shouldn't deliver **less** than the parent promises:

```cpp
class Account {
public:
    double balance = 0;

    virtual double withdraw(double amount) {
        // Returns the actual withdrawn amount (always == amount if valid)
        balance -= amount;
        return amount;
    }
};

class RestrictedAccount : public Account {
public:
    double withdraw(double amount) override {
        // ❌ Might return less than requested — weakened postcondition
        double actual = std::min(amount, 100.0);
        balance -= actual;
        return actual;
    }
};
```

```csharp
class Account {
    public double Balance { get; set; }

    public virtual double Withdraw(double amount) {
        // Returns the actual withdrawn amount (always == amount if valid)
        Balance -= amount;
        return amount;
    }
}

class RestrictedAccount : Account {
    public override double Withdraw(double amount) {
        // ❌ Might return less than requested — weakened postcondition
        double actual = Math.Min(amount, 100);
        Balance -= actual;
        return actual;
    }
}
```

```java
class Account {
    double balance;

    double withdraw(double amount) {
        // Returns the actual withdrawn amount (always == amount if valid)
        balance -= amount;
        return amount;
    }
}

class RestrictedAccount extends Account {
    @Override
    double withdraw(double amount) {
        // ❌ Might return less than requested — weakened postcondition
        double actual = Math.min(amount, 100);
        balance -= actual;
        return actual;
    }
}
```

```python
class Account:
    def __init__(self):
        self.balance = 0

    def withdraw(self, amount):
        # Returns the actual withdrawn amount (always == amount if valid)
        self.balance -= amount
        return amount

class RestrictedAccount(Account):
    def withdraw(self, amount):
        # ❌ Might return less than requested — weakened postcondition
        actual = min(amount, 100)
        self.balance -= actual
        return actual
```

```javascript
class Account {
  constructor() {
    this.balance = 0;
  }

  withdraw(amount) {
    // Returns the actual withdrawn amount (always == amount if valid)
    this.balance -= amount;
    return amount;
  }
}

class RestrictedAccount extends Account {
  withdraw(amount) {
    // ❌ Might return less than requested — weakened postcondition
    const actual = Math.min(amount, 100);
    this.balance -= actual;
    return actual;
  }
}
```

### 3. Invariants Must Be Preserved

If the parent guarantees something, the child must maintain it:

```cpp
class PositiveNumber {
protected:
    int value_;
public:
    PositiveNumber(int v) {
        if (v <= 0) throw std::invalid_argument("Must be positive");
        value_ = v;
    }

    int getValue() const { return value_; }  // Always positive (invariant)
};

class MutableNumber : public PositiveNumber {
public:
    MutableNumber(int v) : PositiveNumber(v) { }

    void setValue(int v) {
        value_ = v;  // ❌ Could set to negative — breaks invariant!
    }
};
```

```csharp
class PositiveNumber {
    protected int _value;

    public PositiveNumber(int v) {
        if (v <= 0) throw new ArgumentException("Must be positive");
        _value = v;
    }

    public int Value => _value;  // Always positive (invariant)
}

class MutableNumber : PositiveNumber {
    public MutableNumber(int v) : base(v) { }

    public void SetValue(int v) {
        _value = v;  // ❌ Could set to negative — breaks invariant!
    }
}
```

```java
class PositiveNumber {
    protected int value;

    PositiveNumber(int v) {
        if (v <= 0) throw new IllegalArgumentException();
        this.value = v;
    }

    int getValue() { return value; }  // Always positive (invariant)
}

class MutableNumber extends PositiveNumber {
    MutableNumber(int v) { super(v); }

    void setValue(int v) {
        this.value = v;  // ❌ Could set to negative — breaks invariant!
    }
}
```

```python
class PositiveNumber:
    def __init__(self, v):
        if v <= 0:
            raise ValueError("Must be positive")
        self._value = v

    @property
    def value(self):
        return self._value  # Always positive (invariant)

class MutableNumber(PositiveNumber):
    def __init__(self, v):
        super().__init__(v)

    def set_value(self, v):
        self._value = v  # ❌ Could set to negative — breaks invariant!
```

```javascript
class PositiveNumber {
  constructor(v) {
    if (v <= 0) throw new Error("Must be positive");
    this._value = v;
  }

  get value() { return this._value; }  // Always positive (invariant)
}

class MutableNumber extends PositiveNumber {
  constructor(v) { super(v); }

  setValue(v) {
    this._value = v;  // ❌ Could set to negative — breaks invariant!
  }
}
```

---

## Another Example — Bird Hierarchy

```cpp
// ❌ BAD — Not all birds can fly!
class Bird {
public:
    virtual void fly() {
        std::cout << "Flying..." << std::endl;
    }
};

class Sparrow : public Bird { };  // ✅ Sparrows can fly

class Ostrich : public Bird {
public:
    void fly() override {
        throw std::runtime_error("Can't fly!");
        // ❌ Violates LSP — code expecting Bird.fly() will crash
    }
};
```

```csharp
// ❌ BAD — Not all birds can fly!
class Bird {
    public virtual void Fly() {
        Console.WriteLine("Flying...");
    }
}

class Sparrow : Bird { }  // ✅ Sparrows can fly

class Ostrich : Bird {
    public override void Fly() {
        throw new NotSupportedException("Can't fly!");
        // ❌ Violates LSP — code expecting Bird.Fly() will crash
    }
}
```

```java
// ❌ BAD — Not all birds can fly!
class Bird {
    void fly() {
        System.out.println("Flying...");
    }
}

class Sparrow extends Bird { }    // ✅ Sparrows can fly

class Ostrich extends Bird {
    @Override
    void fly() {
        throw new UnsupportedOperationException("Can't fly!");
        // ❌ Violates LSP — code expecting Bird.fly() will crash
    }
}
```

```python
# ❌ BAD — Not all birds can fly!
class Bird:
    def fly(self):
        print("Flying...")

class Sparrow(Bird):
    pass  # ✅ Sparrows can fly

class Ostrich(Bird):
    def fly(self):
        raise NotImplementedError("Can't fly!")
        # ❌ Violates LSP — code expecting Bird.fly() will crash
```

```javascript
// ❌ BAD — Not all birds can fly!
class Bird {
  fly() {
    console.log("Flying...");
  }
}

class Sparrow extends Bird { }  // ✅ Sparrows can fly

class Ostrich extends Bird {
  fly() {
    throw new Error("Can't fly!");
    // ❌ Violates LSP — code expecting Bird.fly() will crash
  }
}
```

```cpp
// ✅ GOOD — Separate the flying capability
class Bird {
public:
    virtual void eat() {
        std::cout << "Eating..." << std::endl;
    }
    virtual ~Bird() = default;
};

class Flyable {
public:
    virtual void fly() = 0;
    virtual ~Flyable() = default;
};

class Sparrow : public Bird, public Flyable {
public:
    void fly() override {
        std::cout << "Sparrow flying" << std::endl;
    }
};

class Ostrich : public Bird {
    // No fly() — Ostrich is just a Bird that eats
};

// Code that needs flying uses Flyable, not Bird
void makeFly(Flyable& f) {
    f.fly();  // Only called on things that CAN fly
}
```

```csharp
// ✅ GOOD — Separate the flying capability
class Bird {
    public virtual void Eat() {
        Console.WriteLine("Eating...");
    }
}

interface IFlyable {
    void Fly();
}

class Sparrow : Bird, IFlyable {
    public void Fly() {
        Console.WriteLine("Sparrow flying");
    }
}

class Ostrich : Bird {
    // No Fly() — Ostrich is just a Bird that eats
}

// Code that needs flying uses IFlyable, not Bird
void MakeFly(IFlyable f) {
    f.Fly();  // Only called on things that CAN fly
}
```

```java
// ✅ GOOD — Separate the flying capability
class Bird {
    void eat() {
        System.out.println("Eating...");
    }
}

interface Flyable {
    void fly();
}

class Sparrow extends Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Sparrow flying");
    }
}

class Ostrich extends Bird {
    // No fly() — Ostrich is just a Bird that eats
}

// Code that needs flying uses Flyable, not Bird
void makeFly(Flyable f) {
    f.fly();  // Only called on things that CAN fly
}
```

```python
# ✅ GOOD — Separate the flying capability
from abc import ABC, abstractmethod

class Bird:
    def eat(self):
        print("Eating...")

class Flyable(ABC):
    @abstractmethod
    def fly(self):
        pass

class Sparrow(Bird, Flyable):
    def fly(self):
        print("Sparrow flying")

class Ostrich(Bird):
    pass  # No fly() — Ostrich is just a Bird that eats

# Code that needs flying uses Flyable, not Bird
def make_fly(f):
    f.fly()  # Only called on things that CAN fly
```

```javascript
// ✅ GOOD — Separate the flying capability
class Bird {
  eat() {
    console.log("Eating...");
  }
}

// Flyable mixin
const Flyable = (Base) => class extends Base {
  fly() { throw new Error("Must implement fly()"); }
};

class Sparrow extends Flyable(Bird) {
  fly() {
    console.log("Sparrow flying");
  }
}

class Ostrich extends Bird {
  // No fly() — Ostrich is just a Bird that eats
}

// Code that needs flying checks capability
function makeFly(f) {
  if (typeof f.fly === "function") {
    f.fly();  // Only called on things that CAN fly
  }
}
```

---

## LSP Checklist

| Question | If Yes... |
|----------|-----------|
| Does the subclass throw exceptions the parent doesn't? | LSP violation |
| Does the subclass return different types? | Potential violation |
| Does the subclass ignore parent methods? | LSP violation |
| Can you pass the subclass anywhere the parent is expected? | LSP compliant |
| Does existing test code pass with the subclass? | LSP compliant |

---

## Key Takeaways

- LSP: subtypes must be **substitutable** for their base types
- If substituting a subclass **breaks** existing code, you've violated LSP
- Don't force inheritance when "is-a" doesn't truly hold
- Use **interfaces** to define capabilities separately
- Preconditions can't be strengthened, postconditions can't be weakened
- The Square/Rectangle problem is the classic LSP example

Next: **Interface Segregation Principle** — keep interfaces small and focused.
