---
title: Injection Attacks
---

# Injection Attacks

Injection occurs when untrusted data is sent to an interpreter as part of a command or query, tricking it into executing unintended actions.

---

## SQL Injection

The most common and dangerous injection type.

### How it works:

Vulnerable code:
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

Attacker input: `username = admin' --`

Resulting query:
```sql
SELECT * FROM users WHERE username = 'admin' --' AND password = ''
```

The `--` comments out the password check — attacker logs in as admin.

### Types of SQL Injection:

| Type | Description |
|------|-------------|
| **In-band (Classic)** | Results shown directly in response |
| **Error-based** | Extract data from error messages |
| **UNION-based** | Combine results with another query |
| **Blind (Boolean)** | Infer data from true/false responses |
| **Blind (Time-based)** | Infer data from response delays |
| **Out-of-band** | Exfiltrate data via DNS or HTTP |

### Impact:
- Read entire database (all user data, passwords)
- Modify or delete data
- Execute OS commands (in some databases)
- Bypass authentication
- Full server compromise

### Prevention:

```javascript
// WRONG — vulnerable
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// RIGHT — parameterized query
db.query("SELECT * FROM users WHERE id = ?", [userId]);

// RIGHT — using an ORM
User.findById(userId);
```

---

## Command Injection

Inject OS commands through application inputs.

### Vulnerable code:
```javascript
const output = exec(`ping ${userInput}`);
```

### Attack:
```
userInput = "google.com; cat /etc/passwd"
```

### Prevention:
- Never pass user input to shell commands
- Use language-specific APIs instead of exec
- If unavoidable, use allowlists and strict validation

---

## NoSQL Injection

Attacks against NoSQL databases (MongoDB, etc.).

### Vulnerable code:
```javascript
db.users.find({ username: req.body.username, password: req.body.password });
```

### Attack (JSON body):
```json
{ "username": "admin", "password": { "$gt": "" } }
```

The `$gt: ""` operator matches any non-empty string — bypasses auth.

### Prevention:
```javascript
// Validate input types
if (typeof password !== "string") throw new Error("Invalid input");

// Use mongoose with schemas (enforces types)
```

---

## LDAP Injection

Target directory services.

### Vulnerable filter:
```
(&(uid=${username})(password=${password}))
```

### Attack: `username = *)(uid=*))(|(uid=*`

### Prevention:
- Escape special LDAP characters: `* ( ) \ / NUL`
- Use frameworks that handle escaping

---

## Template Injection (SSTI)

Inject code into server-side templates.

### Example (Python Jinja2):
```python
# Vulnerable
template = f"Hello {user_input}"
render_template_string(template)

# Attack input: {{ 7*7 }} → renders "Hello 49"
# Worse: {{ config.items() }} → dumps server config
```

### Prevention:
- Never use user input in template strings
- Use sandboxed template engines
- Treat templates as code, not data

---

## Prevention Summary

| Defense | Technique |
|---------|-----------|
| **Parameterized queries** | Separate data from code |
| **Input validation** | Allowlist expected formats |
| **Output encoding** | Encode before rendering |
| **ORMs** | Abstract direct query construction |
| **Least privilege** | DB user with minimal permissions |
| **WAF** | Block known injection patterns |

---

## Key Takeaways

- Injection = sending hostile data to an interpreter
- **SQL injection** is the most common and destructive
- **Parameterized queries** are the primary defense
- Never build queries by concatenating user input
- Apply defense in depth: validation + parameterization + least privilege
- Test for injection vulnerabilities regularly

---

Next, we'll learn about **Cross-Site Scripting (XSS)** →
