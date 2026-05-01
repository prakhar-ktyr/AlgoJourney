---
title: Real-time Subscriptions
---

# Real-time Subscriptions

Implement production-ready GraphQL subscriptions using WebSocket for real-time features.

---

## Setup

```bash
npm install graphql-ws ws @graphql-tools/schema
```

```javascript
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";
import express from "express";

const app = express();
const httpServer = createServer(app);
const schema = makeExecutableSchema({ typeDefs, resolvers });

// WebSocket server for subscriptions
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });
const serverCleanup = useServer({ schema }, wsServer);

// Apollo Server for queries/mutations
const server = new ApolloServer({
  schema,
  plugins: [{
    async serverWillStart() {
      return { async drainServer() { await serverCleanup.dispose(); } };
    },
  }],
});

await server.start();
app.use("/graphql", express.json(), expressMiddleware(server));
httpServer.listen(4000);
```

---

## Schema

```graphql
type Message {
  id: ID!
  text: String!
  sender: User!
  channel: String!
  createdAt: String!
}

type Mutation {
  sendMessage(channel: String!, text: String!): Message!
}

type Subscription {
  messageSent(channel: String!): Message!
  userTyping(channel: String!): User!
}
```

---

## PubSub Implementation

```javascript
import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();

const resolvers = {
  Mutation: {
    sendMessage: async (_, { channel, text }, { user }) => {
      const message = await Message.create({
        text,
        sender: user.id,
        channel,
      });
      const populated = await message.populate("sender");

      // Publish to subscribers
      pubsub.publish(`MESSAGE_SENT_${channel}`, { messageSent: populated });
      return populated;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (_, { channel }) =>
        pubsub.asyncIterableIterator(`MESSAGE_SENT_${channel}`),
    },
    userTyping: {
      subscribe: (_, { channel }) =>
        pubsub.asyncIterableIterator(`USER_TYPING_${channel}`),
    },
  },
};
```

---

## Production PubSub (Redis)

The in-memory PubSub doesn't work with multiple server instances. Use Redis:

```bash
npm install graphql-redis-subscriptions ioredis
```

```javascript
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL),
  subscriber: new Redis(process.env.REDIS_URL),
});
```

---

## Authentication in Subscriptions

```javascript
const wsServer = new WebSocketServer({ server: httpServer, path: "/graphql" });

useServer({
  schema,
  context: async (ctx) => {
    // Auth from connection params
    const token = ctx.connectionParams?.authorization?.replace("Bearer ", "");
    if (!token) throw new Error("Not authenticated");
    const user = await verifyToken(token);
    return { user };
  },
  onConnect: async (ctx) => {
    const token = ctx.connectionParams?.authorization;
    if (!token) return false; // Reject connection
  },
}, wsServer);
```

---

## Client Usage

```javascript
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(createClient({
  url: "ws://localhost:4000/graphql",
  connectionParams: { authorization: `Bearer ${token}` },
}));
```

---

## Key Takeaways

- Use **graphql-ws** (modern) over subscriptions-transport-ws (deprecated)
- Separate transport: HTTP for queries/mutations, WebSocket for subscriptions
- Use **Redis PubSub** in production (supports multiple instances)
- **Authenticate** on WebSocket connection
- Publish events from mutations to notify subscribers

---

Next, we'll learn about **Custom Directives** →
