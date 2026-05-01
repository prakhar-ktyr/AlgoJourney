---
title: Database Integration
---

# Database Integration

Connect your GraphQL API to MongoDB using Mongoose for persistent data storage.

---

## Setup

```bash
npm install mongoose
```

```javascript
// db.js
import mongoose from "mongoose";

export async function connectDB() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("Connected to MongoDB");
}
```

---

## Define Models

```javascript
// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

// models/Post.js
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT" },
  tags: [String],
}, { timestamps: true });

export default mongoose.model("Post", postSchema);
```

---

## Schema

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  role: Role!
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  body: String!
  author: User!
  status: PostStatus!
  tags: [String!]!
  createdAt: String!
}

enum Role { USER ADMIN }
enum PostStatus { DRAFT PUBLISHED }

type Query {
  users: [User!]!
  user(id: ID!): User
  posts(status: PostStatus): [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post
  deletePost(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
  password: String!
}

input CreatePostInput {
  title: String!
  body: String!
  tags: [String!]
}

input UpdatePostInput {
  title: String
  body: String
  status: PostStatus
  tags: [String!]
}
```

---

## Resolvers

```javascript
import User from "./models/User.js";
import Post from "./models/Post.js";

const resolvers = {
  Query: {
    users: () => User.find({}),
    user: (_, { id }) => User.findById(id),
    posts: (_, { status }) => {
      const filter = status ? { status } : {};
      return Post.find(filter).sort({ createdAt: -1 });
    },
    post: (_, { id }) => Post.findById(id),
  },

  Mutation: {
    createUser: (_, { input }) => User.create(input),
    createPost: (_, { input }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return Post.create({ ...input, author: user.id });
    },
    updatePost: (_, { id, input }) =>
      Post.findByIdAndUpdate(id, input, { new: true }),
    deletePost: async (_, { id }) => {
      await Post.findByIdAndDelete(id);
      return true;
    },
  },

  // Relationship resolvers
  User: {
    posts: (parent) => Post.find({ author: parent.id }),
  },
  Post: {
    author: (parent) => User.findById(parent.author),
  },
};
```

---

## Mongoose ID Mapping

Mongoose uses `_id`, but GraphQL expects `id`:

```javascript
// Option 1: Virtual (automatic with Mongoose)
// Mongoose automatically creates a virtual `id` from `_id`

// Option 2: Explicit resolver
Post: {
  id: (parent) => parent._id.toString(),
}
```

Mongoose virtuals handle this by default — `doc.id` returns `_id` as a string.

---

## Key Takeaways

- Use **Mongoose** for MongoDB integration with GraphQL
- Define models with schemas and use them in **resolvers**
- Resolve **relationships** with separate field resolvers
- Mongoose virtual `id` maps `_id` automatically
- Keep resolvers thin — delegate complex logic to models/data sources

---

Next, we'll learn about **Relationships & Nested Resolvers** →
