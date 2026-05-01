---
title: Node.js MongoDB
---

# Node.js MongoDB

MongoDB is the most popular NoSQL database for Node.js. It stores data as flexible JSON-like documents instead of rigid tables, making it a natural fit for JavaScript applications.

## What is MongoDB?

- **Document database** — data is stored as JSON-like documents (BSON internally)
- **No schema required** — documents in the same collection can have different fields
- **Scalable** — built for horizontal scaling and high availability
- **Flexible queries** — rich query language, aggregation pipeline, full-text search

### Document vs relational

```
Relational (SQL)              MongoDB
───────────────               ─────────
Database                      Database
Table                         Collection
Row                           Document
Column                        Field
JOIN                          Embedded documents / $lookup
```

## Setting up MongoDB

### Option 1: MongoDB Atlas (cloud — recommended for beginners)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a free cluster (M0 tier).
3. Create a database user with a password.
4. Whitelist your IP address (or use `0.0.0.0/0` for development).
5. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/mydb`

### Option 2: Local installation

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Connection string for local
# mongodb://localhost:27017/mydb
```

## The MongoDB Node.js driver

```bash
npm install mongodb
```

### Connecting

```javascript
import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

try {
  await client.connect();
  console.log("Connected to MongoDB");

  const db = client.db("myapp");
  const users = db.collection("users");

  // Use the collection...
} finally {
  await client.close();
}
```

## CRUD operations

### Create (insert)

```javascript
// Insert one document
const result = await users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  age: 30,
  createdAt: new Date(),
});
console.log("Inserted ID:", result.insertedId);

// Insert many documents
const result2 = await users.insertMany([
  { name: "Bob", email: "bob@example.com", age: 25 },
  { name: "Charlie", email: "charlie@example.com", age: 35 },
]);
console.log("Inserted count:", result2.insertedCount);
```

### Read (find)

```javascript
// Find one document
const user = await users.findOne({ email: "alice@example.com" });
console.log(user);

// Find many documents
const allUsers = await users.find({}).toArray();
console.log(allUsers);

// Find with filter
const youngUsers = await users.find({ age: { $lt: 30 } }).toArray();

// Find with projection (select specific fields)
const names = await users
  .find({}, { projection: { name: 1, email: 1, _id: 0 } })
  .toArray();

// Sort, limit, skip
const page = await users
  .find({})
  .sort({ name: 1 })      // 1 = ascending, -1 = descending
  .skip(0)                  // skip first N documents
  .limit(10)                // return max 10
  .toArray();
```

### Query operators

```javascript
// Comparison
{ age: { $gt: 25 } }       // greater than
{ age: { $gte: 25 } }      // greater than or equal
{ age: { $lt: 30 } }       // less than
{ age: { $lte: 30 } }      // less than or equal
{ age: { $ne: 25 } }       // not equal
{ age: { $in: [25, 30] } } // in array

// Logical
{ $and: [{ age: { $gt: 20 } }, { age: { $lt: 30 } }] }
{ $or: [{ name: "Alice" }, { name: "Bob" }] }

// String matching (regex)
{ name: { $regex: /^A/i } } // names starting with A (case-insensitive)

// Existence
{ phone: { $exists: true } }  // has a phone field
```

### Update

```javascript
// Update one document
await users.updateOne(
  { email: "alice@example.com" },      // filter
  { $set: { age: 31, updatedAt: new Date() } }, // update
);

// Update many documents
await users.updateMany(
  { age: { $lt: 30 } },
  { $set: { category: "young" } },
);

// Update operators
{ $set: { name: "Alice" } }       // set a field
{ $unset: { phone: "" } }         // remove a field
{ $inc: { loginCount: 1 } }       // increment
{ $push: { tags: "admin" } }      // add to array
{ $pull: { tags: "guest" } }      // remove from array
{ $addToSet: { tags: "admin" } }  // add to array if not present

// Upsert — insert if not found
await users.updateOne(
  { email: "dave@example.com" },
  { $set: { name: "Dave", age: 28 } },
  { upsert: true },
);
```

### Delete

```javascript
// Delete one
await users.deleteOne({ email: "alice@example.com" });

// Delete many
const result = await users.deleteMany({ age: { $lt: 18 } });
console.log("Deleted:", result.deletedCount);
```

## Indexes

Indexes speed up queries. Without them, MongoDB scans every document:

```javascript
// Create an index on email (unique)
await users.createIndex({ email: 1 }, { unique: true });

// Compound index
await users.createIndex({ age: 1, name: 1 });

// Text index (for full-text search)
await users.createIndex({ name: "text", bio: "text" });
const results = await users.find({ $text: { $search: "developer" } }).toArray();
```

## Aggregation pipeline

For complex queries (GROUP BY, JOIN, computed fields):

```javascript
const result = await users.aggregate([
  { $match: { age: { $gte: 18 } } },
  { $group: {
    _id: "$category",
    count: { $sum: 1 },
    avgAge: { $avg: "$age" },
  }},
  { $sort: { count: -1 } },
]).toArray();
```

## Using with Express

```javascript
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(express.json());

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("myapp");
const users = db.collection("users");

app.get("/api/users", async (req, res) => {
  const result = await users.find({}).toArray();
  res.json(result);
});

app.get("/api/users/:id", async (req, res) => {
  const user = await users.findOne({ _id: new ObjectId(req.params.id) });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

app.post("/api/users", async (req, res) => {
  const result = await users.insertOne(req.body);
  res.status(201).json({ _id: result.insertedId, ...req.body });
});

app.listen(3000);
```

## Key takeaways

- MongoDB stores JSON-like documents in collections.
- Use the `mongodb` package for the official Node.js driver.
- CRUD: `insertOne`/`insertMany`, `find`/`findOne`, `updateOne`/`updateMany`, `deleteOne`/`deleteMany`.
- Use indexes to speed up queries.
- The aggregation pipeline handles complex data transformations.
- For most applications, use **Mongoose** (next lesson) instead of the raw driver — it adds schemas, validation, and more.
