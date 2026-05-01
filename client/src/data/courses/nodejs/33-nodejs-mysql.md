---
title: Node.js MySQL
---

# Node.js MySQL

MySQL is the world's most popular relational database. Node.js connects to MySQL using the `mysql2` package, which supports promises, prepared statements, and connection pooling.

## Installation

```bash
npm install mysql2
```

## Connecting

### Single connection

```javascript
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "your-password",
  database: "myapp",
});

console.log("Connected to MySQL");
```

### Connection pool (recommended for servers)

```javascript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your-password",
  database: "myapp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

A pool reuses connections instead of opening a new one for every query. Always use pools in production.

## Basic queries

```javascript
// Simple query
const [rows] = await pool.query("SELECT * FROM users");
console.log(rows);

// Query with result metadata
const [rows, fields] = await pool.query("SELECT * FROM users");
console.log(fields.map((f) => f.name)); // column names
```

## Prepared statements (parameterized queries)

**Always use prepared statements** to prevent SQL injection:

```javascript
// DANGEROUS — SQL injection!
const name = "'; DROP TABLE users; --";
await pool.query(`SELECT * FROM users WHERE name = '${name}'`);

// SAFE — parameterized query
const [rows] = await pool.execute(
  "SELECT * FROM users WHERE name = ?",
  [name],
);
```

The `?` placeholders are replaced safely by the driver — special characters are escaped.

## CRUD operations

### Create table

```javascript
await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
```

### Insert

```javascript
const [result] = await pool.execute(
  "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
  ["Alice", "alice@example.com", 30],
);

console.log("Inserted ID:", result.insertId);
console.log("Affected rows:", result.affectedRows);
```

### Select

```javascript
// All users
const [users] = await pool.query("SELECT * FROM users");

// With filter
const [users] = await pool.execute(
  "SELECT * FROM users WHERE age > ? ORDER BY name LIMIT ?",
  [25, 10],
);

// Single user
const [rows] = await pool.execute(
  "SELECT * FROM users WHERE id = ?",
  [1],
);
const user = rows[0]; // first result or undefined
```

### Update

```javascript
const [result] = await pool.execute(
  "UPDATE users SET name = ?, age = ? WHERE id = ?",
  ["Alice Smith", 31, 1],
);

console.log("Changed rows:", result.changedRows);
```

### Delete

```javascript
const [result] = await pool.execute(
  "DELETE FROM users WHERE id = ?",
  [1],
);

console.log("Deleted rows:", result.affectedRows);
```

## Transactions

Group multiple queries into an atomic operation:

```javascript
const connection = await pool.getConnection();

try {
  await connection.beginTransaction();

  await connection.execute(
    "UPDATE accounts SET balance = balance - ? WHERE id = ?",
    [100, 1],
  );

  await connection.execute(
    "UPDATE accounts SET balance = balance + ? WHERE id = ?",
    [100, 2],
  );

  await connection.commit();
  console.log("Transfer complete");
} catch (err) {
  await connection.rollback();
  console.error("Transfer failed:", err.message);
} finally {
  connection.release(); // return connection to pool
}
```

## Using with Express

```javascript
import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "myapp",
});

app.get("/api/users", async (req, res) => {
  const [users] = await pool.query("SELECT id, name, email FROM users");
  res.json(users);
});

app.get("/api/users/:id", async (req, res) => {
  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE id = ?",
    [req.params.id],
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(rows[0]);
});

app.post("/api/users", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
      [name, email, age],
    );
    res.status(201).json({ id: result.insertId, name, email, age });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    throw err;
  }
});

app.listen(3000);
```

## Key takeaways

- Use `mysql2/promise` for async/await support.
- **Always use prepared statements** (`execute` with `?` placeholders) to prevent SQL injection.
- Use connection pools in servers for performance and reliability.
- Use transactions for multi-step operations that must succeed or fail together.
- Check `result.affectedRows` and `result.insertId` for write operation results.
