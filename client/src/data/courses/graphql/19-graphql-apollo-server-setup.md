---
title: Setting Up Apollo Server
---

# Setting Up Apollo Server

**Apollo Server** is the most popular GraphQL server for Node.js. Let's build a working server from scratch.

---

## Installation

```bash
mkdir graphql-api && cd graphql-api
npm init -y
npm install @apollo/server graphql
```

Add to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  }
}
```

---

## Minimal Server

```javascript
// index.js
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// Schema
const typeDefs = `#graphql
  type Query {
    hello: String!
    greeting(name: String!): String!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    hello: () => "Hello, World!",
    greeting: (_, { name }) => `Hello, ${name}!`,
  },
};

// Create and start server
const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`🚀 Server ready at ${url}`);
```

```bash
node index.js
# 🚀 Server ready at http://localhost:4000/
```

Visit `http://localhost:4000` — Apollo Server includes an interactive explorer.

---

## With Express

For more control (middleware, REST endpoints alongside GraphQL):

```bash
npm install @apollo/server express cors
```

```javascript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";

const typeDefs = `#graphql
  type Query {
    hello: String!
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello from Express + Apollo!",
  },
};

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use(cors());
app.use(express.json());
app.use("/graphql", expressMiddleware(server));

// REST endpoints still work
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(4000, () => console.log("Server running on port 4000"));
```

---

## Testing Your Server

Using curl:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ hello }"}'
```

Response:

```json
{ "data": { "hello": "Hello from Express + Apollo!" } }
```

---

## Project Structure

```
graphql-api/
├── index.js            ← Server entry point
├── schema/
│   ├── typeDefs.js     ← Schema definitions
│   └── resolvers.js    ← Resolver functions
├── models/             ← Database models
├── datasources/        ← Data fetching logic
└── middleware/         ← Auth, logging, etc.
```

---

## Separating Schema

```javascript
// schema/typeDefs.js
export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, email: String!): User!
  }
`;
```

```javascript
// schema/resolvers.js
export const resolvers = {
  Query: {
    users: () => [...],
    user: (_, { id }) => ...,
  },
  Mutation: {
    createUser: (_, { name, email }) => ...,
  },
};
```

---

## Key Takeaways

- **Apollo Server** is the standard GraphQL server for Node.js
- Two setup options: **standalone** (simple) or **Express** (more control)
- Schema is defined with `typeDefs` (SDL) and `resolvers` (functions)
- Built-in **Apollo Explorer** for testing queries
- Separate schema into `typeDefs.js` and `resolvers.js` for organization

---

Next, we'll learn about **Resolvers** — the functions that fetch data →
