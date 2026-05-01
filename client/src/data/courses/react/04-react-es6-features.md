---
title: React ES6 Features
---

# React ES6 Features

React uses ES6 (ECMAScript 2015) heavily. 

Before starting with React, it's beneficial to be familiar with some core ES6 features. Even if you don't know them all, this quick review will help you understand React code better.

## 1. Arrow Functions

Arrow functions allow us to write shorter function syntax. They are used extensively in React for writing functional components and handling events.

**Old Syntax (ES5):**
```javascript
hello = function() {
  return "Hello World!";
}
```

**New Syntax (ES6):**
```javascript
hello = () => {
  return "Hello World!";
}
```

If the function has only one statement, and the statement returns a value, you can remove the brackets and the `return` keyword:

```javascript
hello = () => "Hello World!";
```

## 2. Variables (`let` and `const`)

Before ES6, there was only one way of defining your variables: with the `var` keyword.
ES6 introduced `let` and `const`.

* **`let`**: Use this for variables whose value can change (mutable). It has block scope.
* **`const`**: Use this for variables whose value should NOT change (immutable). It also has block scope. 

In React, you will mostly use `const`. Only use `let` when you know the value will change.

```javascript
const name = "Alice";
let age = 25;
age = 26; // This is fine
name = "Bob"; // ERROR! Assignment to constant variable.
```

## 3. Destructuring

Destructuring makes it easy to extract values from arrays, or properties from objects, into distinct variables. This is heavily used in React for extracting **props**.

**Object Destructuring:**
```javascript
const user = {
  firstName: "John",
  lastName: "Doe",
  age: 30
};

// Instead of: const firstName = user.firstName;
const { firstName, age } = user;

console.log(firstName); // Output: John
console.log(age);       // Output: 30
```

**Array Destructuring:**
```javascript
const colors = ["red", "green", "blue"];
const [firstColor, secondColor] = colors;

console.log(firstColor); // Output: red
```

## 4. Spread Operator (`...`)

The spread operator `...` allows us to quickly copy all or part of an existing array or object into another array or object.

**Merging Arrays:**
```javascript
const numbersOne = [1, 2, 3];
const numbersTwo = [4, 5, 6];
const numbersCombined = [...numbersOne, ...numbersTwo];
// [1, 2, 3, 4, 5, 6]
```

**Copying Objects:**
```javascript
const user1 = { name: "John", age: 30 };
const user2 = { ...user1, location: "USA" };
// { name: "John", age: 30, location: "USA" }
```

## 5. Array Methods (map, filter)

React uses array methods like `.map()` extensively to render lists of items.

**The `.map()` method:**
The `map()` method creates a new array by performing a function on each array element.

```javascript
const myArray = ['apple', 'banana', 'orange'];

const myList = myArray.map((item) => {
  return "<p>" + item + "</p>";
});
// myList is now ["<p>apple</p>", "<p>banana</p>", "<p>orange</p>"]
```

## 6. Ternary Operator

The ternary operator is a simplified conditional operator like if/else. It is heavily used in React to render different components based on a condition (Conditional Rendering).

Syntax: `condition ? <expression if true> : <expression if false>`

```javascript
const authenticated = true;

// If authenticated is true, render Welcome, else render Login
const result = authenticated ? "Welcome back!" : "Please log in.";
```

With these ES6 concepts under your belt, you are fully prepared to dive into React!
