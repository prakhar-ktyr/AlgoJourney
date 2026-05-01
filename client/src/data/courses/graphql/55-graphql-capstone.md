---
title: Capstone: Build a Full-Stack GraphQL App
---

# Capstone: Build a Full-Stack GraphQL App

Put everything together — build a **task management app** from scratch.

---

## What You'll Build

A full-stack task management app with:

- User registration and login (JWT auth)
- Create, read, update, delete tasks
- Assign tasks to users
- Filter tasks by status, assignee, due date
- Real-time updates when tasks change
- Apollo Client + React frontend

---

## 1. Define the Schema

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  tasks: [Task!]!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  assignee: User
  dueDate: String
  createdAt: String!
  updatedAt: String!
}

enum TaskStatus { TODO, IN_PROGRESS, DONE }
enum Priority { LOW, MEDIUM, HIGH }

input CreateTaskInput {
  title: String!
  description: String
  priority: Priority = MEDIUM
  assigneeId: ID
  dueDate: String
}

input UpdateTaskInput {
  title: String
  description: String
  status: TaskStatus
  priority: Priority
  assigneeId: ID
  dueDate: String
}

input TaskFilter {
  status: TaskStatus
  priority: Priority
  assigneeId: ID
}

type Query {
  me: User!
  tasks(filter: TaskFilter, limit: Int, offset: Int): [Task!]!
  task(id: ID!): Task!
}

type Mutation {
  register(name: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
}

type Subscription {
  taskUpdated: Task!
}

type AuthPayload {
  token: String!
  user: User!
}
```

---

## 2. Server Setup

```javascript
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Models
const UserModel = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

const TaskModel = mongoose.model("Task", new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["TODO", "IN_PROGRESS", "DONE"], default: "TODO" },
  priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  dueDate: Date,
}, { timestamps: true }));

// Resolvers
const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new GraphQLError("Not authenticated", { extensions: { code: "UNAUTHENTICATED" } });
      return UserModel.findById(user.id);
    },
    tasks: (_, { filter, limit = 20, offset = 0 }) =>
      TaskModel.find(filter || {}).limit(limit).skip(offset).sort({ createdAt: -1 }),
    task: (_, { id }) => TaskModel.findById(id),
  },
  Mutation: {
    register: async (_, { name, email, password }) => {
      const hashed = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ name, email, password: hashed });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      return { token, user };
    },
    login: async (_, { email, password }) => {
      const user = await UserModel.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new GraphQLError("Invalid credentials");
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      return { token, user };
    },
    createTask: (_, { input }, { user }) => {
      if (!user) throw new GraphQLError("Not authenticated");
      return TaskModel.create(input);
    },
    updateTask: (_, { id, input }) => TaskModel.findByIdAndUpdate(id, input, { new: true }),
    deleteTask: async (_, { id }) => { await TaskModel.findByIdAndDelete(id); return true; },
  },
  Task: {
    assignee: (task) => task.assignee ? UserModel.findById(task.assignee) : null,
  },
  User: {
    tasks: (user) => TaskModel.find({ assignee: user.id }),
  },
};

// Context
const context = async ({ req }) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return { user: decoded };
    } catch { /* invalid token */ }
  }
  return {};
};

// Start
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
app.use("/graphql", express.json(), expressMiddleware(server, { context }));
```

---

## 3. React Client

```jsx
// App.jsx
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({ uri: "/graphql" });
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
}));

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <TaskBoard />
    </ApolloProvider>
  );
}
```

---

## 4. Task Board Component

```jsx
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_TASKS = gql`
  query GetTasks($filter: TaskFilter) {
    tasks(filter: $filter) { id, title, status, priority, assignee { name } }
  }
`;

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) { id, status }
  }
`;

function TaskBoard() {
  const { data, loading } = useQuery(GET_TASKS);
  const [updateTask] = useMutation(UPDATE_TASK);

  if (loading) return <p>Loading...</p>;

  const columns = ["TODO", "IN_PROGRESS", "DONE"];
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {columns.map((status) => (
        <div key={status}>
          <h2>{status}</h2>
          {data.tasks
            .filter((t) => t.status === status)
            .map((task) => (
              <div key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.priority} • {task.assignee?.name || "Unassigned"}</p>
                {status !== "DONE" && (
                  <button onClick={() => updateTask({
                    variables: {
                      id: task.id,
                      input: { status: status === "TODO" ? "IN_PROGRESS" : "DONE" },
                    },
                  })}>
                    Move →
                  </button>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
```

---

## Stretch Goals

Once the basics work, try adding:

1. **DataLoader** for the `assignee` field
2. **Optimistic updates** when moving tasks
3. **Subscriptions** for real-time task updates
4. **Pagination** with cursor-based navigation
5. **Role-based auth** (admin vs. member)

---

## Congratulations!

You've completed the **GraphQL course**! You now know how to:

- Design schemas with types, queries, mutations, and subscriptions
- Build a GraphQL server with Apollo Server and Express
- Implement authentication, authorization, and security
- Use DataLoader, caching, and federation for performance
- Build React apps with Apollo Client
- Test, monitor, and deploy GraphQL APIs

Keep building and exploring. The GraphQL ecosystem is constantly evolving!
