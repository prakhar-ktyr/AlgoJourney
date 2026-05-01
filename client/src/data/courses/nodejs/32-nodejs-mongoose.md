---
title: Node.js Mongoose
---

# Node.js Mongoose

Mongoose is an **ODM** (Object Data Modeling) library for MongoDB. It adds schemas, validation, type casting, query helpers, and middleware on top of the MongoDB driver. Most Node.js + MongoDB applications use Mongoose.

## Installation

```bash
npm install mongoose
```

## Connecting to MongoDB

```javascript
import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/myapp");
console.log("Connected to MongoDB");
```

With options:

```javascript
await mongoose.connect(process.env.MONGODB_URI, {
  dbName: "myapp",
});
```

## Defining a schema

A schema defines the shape of documents in a collection:

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  age: {
    type: Number,
    min: [0, "Age cannot be negative"],
    max: [150, "Age seems too high"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user",
  },
  tags: [String],
  address: {
    street: String,
    city: String,
    country: { type: String, default: "US" },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

## Schema types

| Type | Example |
|---|---|
| `String` | `"Alice"` |
| `Number` | `42`, `3.14` |
| `Boolean` | `true` |
| `Date` | `new Date()` |
| `Buffer` | Binary data |
| `ObjectId` | `mongoose.Schema.Types.ObjectId` |
| `Array` | `[String]`, `[{ name: String }]` |
| `Map` | `Map<String, Number>` |
| `Mixed` | Any type (no validation) |

## Creating a model

```javascript
const User = mongoose.model("User", userSchema);
// Model name "User" → collection name "users" (lowercase, pluralized)
```

## CRUD operations

### Create

```javascript
// Method 1: new + save
const user = new User({ name: "Alice", email: "alice@example.com", age: 30 });
await user.save();

// Method 2: create (shorthand)
const user2 = await User.create({
  name: "Bob",
  email: "bob@example.com",
  age: 25,
});

// Method 3: insertMany
await User.insertMany([
  { name: "Charlie", email: "charlie@example.com" },
  { name: "Diana", email: "diana@example.com" },
]);
```

### Read

```javascript
// Find all
const users = await User.find();

// Find with filter
const youngUsers = await User.find({ age: { $lt: 30 } });

// Find one
const alice = await User.findOne({ email: "alice@example.com" });

// Find by ID
const user = await User.findById("65a1b2c3d4e5f6a7b8c9d0e1");

// Select specific fields
const names = await User.find().select("name email -_id");

// Sort, limit, skip (pagination)
const page = await User.find()
  .sort({ createdAt: -1 })
  .skip(0)
  .limit(10);

// Count
const count = await User.countDocuments({ isActive: true });

// Check existence
const exists = await User.exists({ email: "alice@example.com" });
```

### Update

```javascript
// Find and update (returns the updated document)
const user = await User.findByIdAndUpdate(
  "65a1b2c3d4e5f6a7b8c9d0e1",
  { $set: { age: 31 } },
  { new: true, runValidators: true },
);

// Update one
await User.updateOne(
  { email: "alice@example.com" },
  { $set: { age: 31 } },
);

// Update many
await User.updateMany(
  { isActive: false },
  { $set: { deletedAt: new Date() } },
);
```

> **Important:** Pass `{ runValidators: true }` to apply schema validation on updates. By default, validators only run on `save()`.

### Delete

```javascript
await User.findByIdAndDelete("65a1b2c3d4e5f6a7b8c9d0e1");
await User.deleteOne({ email: "alice@example.com" });
await User.deleteMany({ isActive: false });
```

## Validation

Mongoose validates documents before saving:

```javascript
try {
  const user = await User.create({ name: "", email: "invalid" });
} catch (err) {
  if (err.name === "ValidationError") {
    for (const field in err.errors) {
      console.log(`${field}: ${err.errors[field].message}`);
    }
  }
}
```

### Custom validators

```javascript
const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    validate: {
      validator: (v) => v.length >= 8,
      message: "Password must be at least 8 characters",
    },
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (v) {
        return v === this.password;
      },
      message: "Passwords do not match",
    },
  },
});
```

## Middleware (hooks)

Run code before or after certain operations:

```javascript
// Before save — hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined; // don't store
  next();
});

// After save — log
userSchema.post("save", function (doc) {
  console.log(`User ${doc.name} saved`);
});

// Before find — exclude inactive users
userSchema.pre(/^find/, function (next) {
  this.where({ isActive: { $ne: false } });
  next();
});
```

## Instance methods

```javascript
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Usage
const user = await User.findOne({ email: "alice@example.com" });
const isMatch = await user.comparePassword("mypassword");
```

## Static methods

```javascript
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Usage
const user = await User.findByEmail("Alice@Example.com");
```

## Virtual properties

```javascript
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Include virtuals in JSON output
userSchema.set("toJSON", { virtuals: true });
```

## Relationships (populate)

### References

```javascript
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Post = mongoose.model("Post", postSchema);

// Create a post
await Post.create({ title: "My Post", content: "...", author: user._id });

// Populate the author field
const post = await Post.findById(postId).populate("author", "name email");
console.log(post.author.name); // "Alice"
```

## Using with Express

```javascript
import express from "express";
import mongoose from "mongoose";
import User from "./models/User.js";

const app = express();
app.use(express.json());

await mongoose.connect("mongodb://localhost:27017/myapp");

app.get("/api/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    throw err;
  }
});

app.listen(3000);
```

## Key takeaways

- Mongoose adds schemas, validation, and middleware on top of MongoDB.
- Define schemas with types, validators, defaults, and constraints.
- Use `Model.create()`, `find()`, `findByIdAndUpdate()`, `deleteOne()` for CRUD.
- Pass `{ runValidators: true }` on updates to enforce schema validation.
- Use middleware (`pre`/`post` hooks) for automatic processing.
- Use `populate()` to resolve references between collections.
