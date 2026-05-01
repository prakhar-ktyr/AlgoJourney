---
title: TypeScript Template Literal Types
---

# TypeScript Template Literal Types

Template literal types build on string literal types, and have the ability to expand into many strings via unions.

They use the same syntax as template literal strings in JavaScript (backticks), but are used in type positions.

---

## Basic Syntax

When used with concrete literal types, a template literal type produces a new string literal type by concatenating the contents.

```typescript
type World = "world";

// "hello world"
type Greeting = `hello ${World}`;
```

When a union is used in the interpolated position, the type is the set of every possible string literal that could be represented by each union member.

```typescript
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

// Expands to ALL combinations!
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;

// Equivalent to:
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"
```

If multiple unions are used, the resulting type is a cross-product of all unions.

```typescript
type Lang = "en" | "ja" | "pt";

// Combines all locales with all languages
type LocaleMessageIDs = `${AllLocaleIDs}_${Lang}`;
```

---

## Intrinsic String Manipulation Types

TypeScript provides several built-in string manipulation types to help with template literals:

- `Uppercase<StringType>`
- `Lowercase<StringType>`
- `Capitalize<StringType>`
- `Uncapitalize<StringType>`

```typescript
type Greeting = "Hello, world";

// "HELLO, WORLD"
type ShoutyGreeting = Uppercase<Greeting>;

// "hello, world"
type QuietGreeting = Lowercase<Greeting>;

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`;
type MainID = ASCIICacheKey<"my_app">; // "ID-MY_APP"
```

Template Literal Types are incredibly powerful for creating type-safe APIs, routing params, or tightly enforcing string patterns!
