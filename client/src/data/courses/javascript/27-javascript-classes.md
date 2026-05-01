---
title: JavaScript Classes
---

# JavaScript Classes

A **class** is a template for creating objects. JavaScript's `class` syntax (ES2015+) is *syntactic sugar* over the prototype system you'll meet in the [Prototypes](javascript-prototypes) lesson — but it's the form you'll use 99% of the time.

## A first class

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  greet() {
    return `Hi, ${this.name}`;
  }
}

const u = new User("Ada", "a@b.com");
u.greet();    // "Hi, Ada"
u instanceof User; // true
```

Three important pieces:

- `constructor` runs once when you write `new User(...)`. It sets up instance state.
- Anything else inside the body is a **method**, shared by every instance via the prototype.
- You always create instances with `new`.

## Class fields

Modern JavaScript lets you declare fields directly in the body — clearer than assigning everything in the constructor:

```javascript
class Counter {
  count = 0;            // public instance field
  static instances = 0; // class-level (one per class)

  constructor() {
    Counter.instances++;
  }

  inc() { this.count++; }
}

new Counter().inc();
Counter.instances; // 1
```

## Private fields

A `#` prefix marks a field as truly private — accessible only inside the class:

```javascript
class Account {
  #balance = 0;

  deposit(amount) { this.#balance += amount; }
  get balance()   { return this.#balance; }
}

const a = new Account();
a.deposit(50);
a.balance;     // 50
a.#balance;    // ❌ SyntaxError — even reading is forbidden outside
```

Private methods work the same way: `#withdraw() { ... }`.

## Getters and setters

```javascript
class Temperature {
  #celsius = 0;

  get celsius()   { return this.#celsius; }
  set celsius(c)  { this.#celsius = c; }

  get fahrenheit()    { return this.#celsius * 9 / 5 + 32; }
  set fahrenheit(f)   { this.#celsius = (f - 32) * 5 / 9; }
}

const t = new Temperature();
t.fahrenheit = 100;
t.celsius;     // 37.77...
```

Use them sparingly — most properties don't need them. Getters that do real work surprise readers (looks like a property, runs like a function).

## Static methods and fields

`static` members belong to the **class itself**, not to instances. Use them for factory functions, constants, and related helpers.

```javascript
class User {
  static MAX_NAME_LENGTH = 50;

  static fromJSON(json) {
    return new User(json.name, json.email);
  }

  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

User.MAX_NAME_LENGTH;            // 50
const u = User.fromJSON({ name: "Ada", email: "a@b.com" });
```

You can have static methods, fields (including `#private`), getters, setters, and even static blocks for setup:

```javascript
class Config {
  static settings;
  static {
    Config.settings = loadSettings();
  }
}
```

## Methods are on the prototype

Every method you write is shared:

```javascript
class Foo {
  greet() {}
}
const a = new Foo();
const b = new Foo();
a.greet === b.greet; // true — same function
```

This is why classes are memory-efficient compared to assigning a fresh function to every instance.

If you write a method as an arrow class field, it becomes per-instance (and `this` is bound, à la `bind`):

```javascript
class Btn {
  click = () => { /* this is permanently bound */ };
}
```

That's a useful trick for React-style callbacks but costs one function per instance.

## `instanceof`

```javascript
new Date() instanceof Date;    // true
[] instanceof Array;           // true
"a" instanceof String;         // false — strings aren't String objects
```

`instanceof` walks the prototype chain. We'll see why in the [Prototypes](javascript-prototypes) lesson.

## A real example: a tiny linked list

```javascript
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  #head = null;
  #size = 0;

  get size() { return this.#size; }

  push(value) {
    const node = new Node(value);
    if (!this.#head) {
      this.#head = node;
    } else {
      let cur = this.#head;
      while (cur.next) cur = cur.next;
      cur.next = node;
    }
    this.#size++;
  }

  *[Symbol.iterator]() {
    let cur = this.#head;
    while (cur) {
      yield cur.value;
      cur = cur.next;
    }
  }
}

const list = new LinkedList();
list.push("a"); list.push("b"); list.push("c");
[...list];      // ["a", "b", "c"]
list.size;      // 3
```

That `*[Symbol.iterator]()` is what makes `for…of` and spread work — covered in [Iterators & Generators](javascript-iterators-generators).

## When to use a class

- The object has **identity** (you'll create many distinct ones).
- It bundles **state and behavior** that belong together.
- You'll **subclass** it (next lesson).
- It models a real-world entity: `User`, `Order`, `Connection`.

When you don't need any of those, plain objects and functions are usually simpler.

## Next step

Classes really shine when they extend other classes. On to inheritance.
