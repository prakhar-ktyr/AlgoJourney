---
title: Query Depth & Complexity Limiting
---

# Query Depth & Complexity Limiting

GraphQL's flexibility is also a vulnerability. Malicious clients can craft deeply nested or expensive queries to overwhelm your server.

---

## The Problem: Deeply Nested Queries

```graphql
# Malicious query — exponential data fetching
query {
  users {
    friends {
      friends {
        friends {
          friends {
            friends {
              name
            }
          }
        }
      }
    }
  }
}
```

---

## Depth Limiting

Restrict how deeply queries can nest:

```bash
npm install graphql-depth-limit
```

```javascript
import depthLimit from "graphql-depth-limit";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)], // Max 5 levels deep
});
```

Now the malicious query above would be rejected.

---

## Query Complexity Analysis

Assign a **cost** to each field:

```graphql
type Query {
  users(first: Int = 20): [User!]!     # Cost: first * 1
}

type User {
  id: ID!          # Cost: 0
  name: String!    # Cost: 0
  posts: [Post!]!  # Cost: multiplier
}
```

```javascript
// Custom complexity estimator
const complexityEstimator = (options) => {
  const { args, childComplexity } = options;
  // List fields multiply child complexity by count
  if (args.first) return args.first * childComplexity;
  if (args.limit) return args.limit * childComplexity;
  return childComplexity + 1;
};
```

---

## Setting Complexity Limits

```javascript
const MAX_COMPLEXITY = 1000;

// In plugin
async didResolveOperation({ request, document }) {
  const complexity = getComplexity({
    schema,
    query: document,
    variables: request.variables,
    estimators: [complexityEstimator],
  });

  if (complexity > MAX_COMPLEXITY) {
    throw new GraphQLError(
      `Query complexity ${complexity} exceeds maximum ${MAX_COMPLEXITY}`,
      { extensions: { code: "QUERY_TOO_COMPLEX", complexity, max: MAX_COMPLEXITY } }
    );
  }
}
```

---

## Alias Limiting

Prevent alias-based attacks:

```graphql
# Attack: same expensive query aliased 100 times
query {
  a1: expensiveQuery { ... }
  a2: expensiveQuery { ... }
  a3: expensiveQuery { ... }
  # ... 100 more
}
```

```javascript
// Count aliases and reject if too many
const MAX_ALIASES = 10;

function checkAliases(document) {
  let count = 0;
  visit(document, {
    Field(node) {
      if (node.alias) count++;
    },
  });
  if (count > MAX_ALIASES) {
    throw new GraphQLError(`Too many aliases: ${count}`);
  }
}
```

---

## Combined Protection

```javascript
import depthLimit from "graphql-depth-limit";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimit(7),              // Max depth
  ],
  plugins: [
    complexityPlugin(1000),     // Max complexity
    aliasLimitPlugin(10),       // Max aliases
  ],
});
```

---

## Key Takeaways

- **Depth limiting** prevents deeply nested queries
- **Complexity analysis** assigns costs to fields and rejects expensive queries
- **Alias limiting** prevents repeated expensive operations
- Combine all three for comprehensive protection
- Set limits based on your API's expected usage patterns

---

Next, we'll learn about **Input Validation** →
