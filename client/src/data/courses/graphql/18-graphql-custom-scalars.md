---
title: Custom Scalars
---

# Custom Scalars

Custom scalars extend GraphQL's type system with domain-specific types like dates, URLs, and emails.

---

## Why Custom Scalars?

Built-in scalars don't cover common types:

```graphql
type User {
  createdAt: String!    # Is this ISO 8601? Unix timestamp? Who knows?
  email: String!        # Any string? Or validated email?
  website: String       # URL or just text?
}
```

Custom scalars add meaning and validation:

```graphql
type User {
  createdAt: DateTime!  # Always ISO 8601
  email: Email!         # Validated email format
  website: URL          # Validated URL
}
```

---

## Defining Custom Scalars

Schema:

```graphql
scalar DateTime
scalar Email
scalar URL
scalar JSON
scalar PositiveInt

type User {
  id: ID!
  email: Email!
  website: URL
  createdAt: DateTime!
  metadata: JSON
  age: PositiveInt
}
```

---

## Implementing Custom Scalars

```javascript
import { GraphQLScalarType, Kind } from "graphql";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO 8601 date-time string",

  // Server → Client (serializing for response)
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return new Date(value).toISOString();
    throw new Error("DateTime must be a Date or date string");
  },

  // Client → Server (parsing from variable)
  parseValue(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error("Invalid DateTime");
    return date;
  },

  // Client → Server (parsing from inline literal)
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) throw new Error("Invalid DateTime");
      return date;
    }
    throw new Error("DateTime must be a string");
  },
});
```

---

## Using graphql-scalars Library

Don't reinvent the wheel:

```bash
npm install graphql-scalars
```

```javascript
import {
  DateTimeResolver,
  EmailAddressResolver,
  URLResolver,
  JSONResolver,
  PositiveIntResolver,
} from "graphql-scalars";

const resolvers = {
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  URL: URLResolver,
  JSON: JSONResolver,
  PositiveInt: PositiveIntResolver,
};
```

Available scalars: DateTime, Email, URL, JSON, UUID, PhoneNumber, PostalCode, Currency, and many more.

---

## Common Custom Scalars

| Scalar | Format | Example |
|--------|--------|---------|
| `DateTime` | ISO 8601 | `"2024-01-15T10:30:00Z"` |
| `Date` | Date only | `"2024-01-15"` |
| `Email` | RFC 5322 | `"user@example.com"` |
| `URL` | Valid URL | `"https://example.com"` |
| `JSON` | Any JSON | `{"key": "value"}` |
| `UUID` | RFC 4122 | `"550e8400-e29b-..."` |
| `PositiveInt` | > 0 | `42` |

---

## Key Takeaways

- Custom scalars add **validation and semantics** to fields
- Implement three methods: `serialize`, `parseValue`, `parseLiteral`
- Use **graphql-scalars** library for common types (DateTime, Email, URL)
- Custom scalars enforce data formats at the **schema level**
- They improve API clarity and reduce bugs

---

Next, we'll start building a real server with **Setting Up Apollo Server** →
