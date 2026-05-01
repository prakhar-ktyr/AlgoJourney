---
title: Subscriptions
---

# Subscriptions

Subscriptions allow clients to receive **real-time updates** when data changes on the server.

---

## How Subscriptions Work

```
Client                         Server
  │                              │
  │── Subscribe (WebSocket) ───▶│
  │                              │
  │◀── Event 1 ────────────────│  (data changes)
  │◀── Event 2 ────────────────│  (data changes)
  │◀── Event 3 ────────────────│  (data changes)
  │                              │
  │── Unsubscribe ────────────▶│
```

Unlike queries (one response), subscriptions send **multiple responses** over time.

---

## Schema Definition

```graphql
type Subscription {
  messageAdded(channelId: ID!): Message!
  userStatusChanged: UserStatus!
  postPublished: Post!
}

type Message {
  id: ID!
  text: String!
  sender: User!
  createdAt: String!
}

type UserStatus {
  user: User!
  status: OnlineStatus!
}

enum OnlineStatus {
  ONLINE
  OFFLINE
  AWAY
}
```

---

## Client Usage

```graphql
subscription OnNewMessage($channelId: ID!) {
  messageAdded(channelId: $channelId) {
    id
    text
    sender {
      name
      avatar
    }
    createdAt
  }
}
```

Variables:

```json
{ "channelId": "general" }
```

Each time a message is added, the client receives:

```json
{
  "data": {
    "messageAdded": {
      "id": "msg-1",
      "text": "Hello everyone!",
      "sender": { "name": "Alice", "avatar": "..." },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

## Server Implementation (Apollo Server)

```javascript
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const resolvers = {
  Mutation: {
    sendMessage: async (_, { input }) => {
      const message = await Message.create(input);

      // Publish event to subscribers
      pubsub.publish(`MESSAGE_ADDED_${input.channelId}`, {
        messageAdded: message,
      });

      return message;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: (_, { channelId }) => {
        return pubsub.asyncIterableIterator(`MESSAGE_ADDED_${channelId}`);
      },
    },
  },
};
```

---

## When to Use Subscriptions

| Use Case | Good Fit? |
|----------|-----------|
| Chat messages | ✅ Yes |
| Notifications | ✅ Yes |
| Live dashboards | ✅ Yes |
| Collaborative editing | ✅ Yes |
| Infrequent updates | ❌ Use polling |
| One-time data fetch | ❌ Use query |

---

## Subscriptions vs Polling

```graphql
# Polling: client asks repeatedly
query {
  messages(channelId: "general", since: "2024-01-15T10:00:00Z") {
    id
    text
  }
}
# Run every 5 seconds...

# Subscription: server pushes when ready
subscription {
  messageAdded(channelId: "general") {
    id
    text
  }
}
# Instant delivery, no wasted requests
```

---

## Key Takeaways

- Subscriptions provide **real-time updates** via WebSocket
- Server **pushes** data to subscribed clients
- Use **PubSub** to publish events from mutations
- Great for chat, notifications, live dashboards
- Use queries/polling for infrequent or one-time data

---

Next, we'll dive deeper into the type system with **Scalar Types** →
