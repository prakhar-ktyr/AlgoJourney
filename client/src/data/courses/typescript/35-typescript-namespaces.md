---
title: TypeScript Namespaces
---

# TypeScript Namespaces

Namespaces are a TypeScript-specific way to organize code. They are simply named JavaScript objects in the global namespace.

> [!NOTE]
> Namespaces are a legacy feature. In modern TypeScript development, ES Modules (`import`/`export`) are preferred over namespaces. However, you will still see namespaces in older codebases or when dealing with certain declaration files.

---

## Defining a Namespace

You define a namespace using the `namespace` keyword. Everything inside a namespace is hidden from the outside unless explicitly exported using the `export` keyword.

```typescript
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  // We export the class so it can be used outside the namespace
  export class LettersOnlyValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  // We export this interface too
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
}
```

---

## Using a Namespace

Because the exported elements belong to the namespace, you must access them by prefixing them with the namespace name.

```typescript
// We access LettersOnlyValidator through the Validation namespace
const validator = new Validation.LettersOnlyValidator();

console.log(validator.isAcceptable("Hello")); // true
console.log(validator.isAcceptable("123")); // false
```

---

## Nested Namespaces

Namespaces can be nested within other namespaces to create complex organizational structures.

```typescript
namespace Shapes {
  export namespace Polygons {
    export class Triangle {}
    export class Square {}
  }
}

const sq = new Shapes.Polygons.Square();
```

---

## Modules vs Namespaces

- **Modules** declare their dependencies. They also provide better code isolation, can be lazy-loaded, and map directly to how Node.js and modern browsers handle imports.
- **Namespaces** group logically related objects. They are globally accessible, which can lead to variable naming collisions and make it hard to track dependencies across files.

Always prefer ES Modules in new projects!
