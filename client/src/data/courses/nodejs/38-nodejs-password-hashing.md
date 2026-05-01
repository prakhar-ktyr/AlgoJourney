---
title: Node.js Password Hashing
---

# Node.js Password Hashing

**Never store passwords in plain text.** If your database is compromised, every user's password is exposed. Instead, store a cryptographic hash — a one-way transformation that can't be reversed.

## Why not just hash with SHA-256?

Simple hashing algorithms (MD5, SHA-256) are **too fast**. An attacker with a GPU can try billions of hashes per second. Password hashing algorithms like **bcrypt** are intentionally slow, making brute-force attacks impractical.

| Algorithm | Speed | Purpose |
|-----------|-------|---------|
| MD5 / SHA-256 | Billions/sec | File checksums, data integrity |
| bcrypt | ~100/sec | Password hashing |
| scrypt | Configurable | Password hashing (memory-hard) |
| argon2 | Configurable | Password hashing (modern, recommended) |

## bcrypt

bcrypt is the most widely used password hashing library in Node.js.

```bash
npm install bcrypt
```

### Hashing a password

```javascript
import bcrypt from "bcrypt";

const password = "mySecurePassword123";
const saltRounds = 10; // cost factor (higher = slower + more secure)

// Async (recommended)
const hash = await bcrypt.hash(password, saltRounds);
console.log(hash);
// $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

The hash includes: algorithm identifier (`$2b$`), cost factor (`$10$`), salt (22 chars), and the hash (31 chars) — all in one string.

### Comparing a password

```javascript
const password = "mySecurePassword123";
const hash = "$2b$10$N9qo8uLOickgx2ZMRZoMye..."; // stored hash

const match = await bcrypt.compare(password, hash);

if (match) {
  console.log("Password is correct");
} else {
  console.log("Wrong password");
}
```

`bcrypt.compare` extracts the salt from the stored hash and re-hashes the input — you never need to store the salt separately.

### Salt rounds (cost factor)

The salt rounds parameter controls how slow the hashing is:

| Salt Rounds | ~Time per hash | Use case |
|-------------|---------------|----------|
| 8 | ~40ms | Development / testing |
| 10 | ~100ms | Good default |
| 12 | ~300ms | Higher security |
| 14 | ~1s | Maximum practical security |

Higher = more secure but slower. **10 is the standard recommendation.**

```javascript
// Benchmark on your hardware
import bcrypt from "bcrypt";

for (let rounds = 8; rounds <= 14; rounds++) {
  const start = Date.now();
  await bcrypt.hash("test", rounds);
  console.log(`Rounds ${rounds}: ${Date.now() - start}ms`);
}
```

## Using bcrypt with Express + MongoDB

### User model

```javascript
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  name: { type: String, required: true },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never return password in JSON
userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
```

### Registration

```javascript
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  try {
    const user = new User({ name, email, password });
    await user.save(); // pre-save hook hashes the password

    res.status(201).json({ message: "User created", user }); // password excluded by toJSON
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already registered" });
    }
    throw err;
  }
});
```

### Login

```javascript
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Issue token or create session
  // const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "24h" });

  res.json({ message: "Logged in", user });
});
```

**Security note**: Always return the same error message for "user not found" and "wrong password" — this prevents attackers from discovering valid email addresses.

### Password change

```javascript
app.put("/api/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }

  const user = await User.findById(req.user.userId);
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  user.password = newPassword; // pre-save hook will hash it
  await user.save();

  res.json({ message: "Password changed" });
});
```

## Timing attack prevention

`bcrypt.compare` is timing-safe — it takes the same amount of time whether the password is correct or not. This prevents attackers from guessing passwords based on response time.

**Never do this**:

```javascript
// WRONG — vulnerable to timing attacks
if (storedHash === manuallyComputedHash) { ... }
```

**Always use `bcrypt.compare`.**

## Key takeaways

- **Never store plain-text passwords.** Use bcrypt (or argon2) to hash them.
- Use `bcrypt.hash(password, 10)` to hash and `bcrypt.compare(input, hash)` to verify.
- The hash includes the salt — no need to store it separately.
- Use Mongoose `pre("save")` hooks to hash automatically before saving.
- Use 10 salt rounds as a default; benchmark on your hardware.
- Return identical error messages for "user not found" and "wrong password."
