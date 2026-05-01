---
title: JavaScript Prototypes
---

# JavaScript Prototypes

Before `class` arrived in 2015, JavaScript already had inheritance — through **prototypes**. `class` is a thin layer of sugar over the same machinery. Understanding prototypes turns "magic" into "obvious".

## Every object has a prototype

Every JavaScript object has an internal link, written `[[Prototype]]`, to another object — its **prototype**. When you read a property, the engine looks on the object first; if the property is missing, it looks on the prototype; then on the prototype's prototype; and so on, until it hits `null`.

```javascript
const animal = {
  eats: true,
  walk() { console.log("walking"); },
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.eats;   // true   — found on `animal`
rabbit.jumps;  // true   — found on `rabbit`
rabbit.walk(); // "walking" — found on `animal`
```

`Object.create(proto)` makes an object whose `[[Prototype]]` is `proto`. That's the lowest-level way to set up inheritance.

## Inspecting and changing the prototype

```javascript
Object.getPrototypeOf(rabbit) === animal; // true
Object.setPrototypeOf(rabbit, otherProto); // ❌ avoid — slow

rabbit.__proto__; // legacy alias for getPrototypeOf
```

`__proto__` works in every browser but is deprecated. Use `Object.getPrototypeOf` and `Object.create` in new code. Never call `setPrototypeOf` on a hot path — it deoptimizes the engine.

## Constructor functions and `prototype`

A regular function has a `.prototype` property. When you `new`-call the function, the new object's `[[Prototype]]` is set to that `.prototype`:

```javascript
function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return `Hi, ${this.name}`;
};

const u = new User("Ada");
u.greet();                                // "Hi, Ada"
Object.getPrototypeOf(u) === User.prototype; // true
u instanceof User;                         // true
```

This is how JavaScript inheritance actually works. The `class` syntax just bundles all of the above into a friendlier form.

```javascript
class User {
  constructor(name) { this.name = name; }
  greet() { return `Hi, ${this.name}`; }
}

// equivalent to:
function User(name) { this.name = name; }
User.prototype.greet = function () { return `Hi, ${this.name}`; };
```

## The chain in action

```javascript
class Animal { eat() { /* ... */ } }
class Dog extends Animal { bark() { /* ... */ } }

const rex = new Dog();

rex   →  Dog.prototype  →  Animal.prototype  →  Object.prototype  →  null
```

When you call `rex.eat()`, the engine starts at `rex`, sees nothing, climbs to `Dog.prototype`, sees nothing, climbs to `Animal.prototype`, finds `eat`, runs it.

## Built-in prototypes

Every value has a prototype chain ending at `Object.prototype` (objects), `Array.prototype` → `Object.prototype` (arrays), `Function.prototype` → `Object.prototype` (functions), and so on. That's why every array has `map`, every function has `bind`, every object has `toString`.

```javascript
Array.prototype.map === [].map;             // true
Object.prototype.toString.call([]);          // "[object Array]"
```

## Don't extend built-in prototypes

It's tempting to add helpers to `Array.prototype`, but it conflicts with future language additions and other libraries:

```javascript
// ❌ Don't do this
Array.prototype.first = function () { return this[0]; };
```

In 2014 a popular library added `Array.prototype.contains`; ECMAScript later picked the same name for a slightly different method, and chaos ensued. Use plain functions or your own classes instead.

## `Object.create(null)` — a "pure" map

`{}` inherits from `Object.prototype`, so it already has `toString`, `hasOwnProperty`, `__proto__`, etc. For dictionaries, that can collide with user input ("`__proto__`" as a key). Use:

```javascript
const dict = Object.create(null);
dict.foo = 1;
dict.toString;  // undefined — no inherited methods
```

(Or use a `Map`, which is designed for this — see [Map and Set](javascript-map-set).)

## Own vs inherited properties

```javascript
const proto = { a: 1 };
const obj = Object.create(proto);
obj.b = 2;

Object.hasOwn(obj, "a"); // false — inherited
Object.hasOwn(obj, "b"); // true  — own

Object.keys(obj);        // ["b"] — own enumerable only
for (const k in obj) console.log(k); // "b" then "a" — inherited too
```

Use `Object.keys` / `Object.entries` for own properties, and `Object.hasOwn` to check membership. Avoid `for…in` for serious work.

## A custom inheritance helper (just to demystify)

This is what `extends` does behind the scenes:

```javascript
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}

function Animal(name) { this.name = name; }
Animal.prototype.eat = function () { console.log(`${this.name} eats`); };

function Dog(name, breed) {
  Animal.call(this, name);   // super constructor
  this.breed = breed;
}
inherit(Dog, Animal);
Dog.prototype.bark = function () { console.log("woof"); };

const r = new Dog("Rex", "Lab");
r.eat();   // Rex eats
r.bark();  // woof
r instanceof Dog;    // true
r instanceof Animal; // true
```

The modern `class` syntax does all of this for you — and gives you `super`, private fields, and static blocks for free. Use `class`. Read the prototypes lesson once so you understand it, then reach for `class` in real code.

## When prototypes still matter

- **Reading library code** — older libraries (and many polyfills) use `Constructor.prototype.foo = ...`.
- **Performance debugging** — knowing which methods are shared via the prototype helps you reason about memory.
- **Polyfills** — adding new spec methods to existing prototypes.
- **`Object.create(null)`** — for collision-safe dictionaries.

## Next step

We've built classes and explored prototypes. Time to organize code across files: ES modules.
