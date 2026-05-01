---
title: Role-Based Access Control
---

# Role-Based Access Control

**Access control** determines what authenticated users are allowed to do. RBAC (Role-Based Access Control) is the most widely used model, but ABAC and PBAC offer more flexibility for complex scenarios.

---

## Access Control Models Compared

| Model | Full Name | Decision Based On | Best For |
|-------|-----------|-------------------|----------|
| **RBAC** | Role-Based Access Control | User's assigned role(s) | Most applications |
| **ABAC** | Attribute-Based Access Control | User/resource/environment attributes | Complex, dynamic policies |
| **PBAC** | Policy-Based Access Control | Centralized policy rules | Enterprise, compliance-heavy |
| **DAC** | Discretionary Access Control | Resource owner's decision | File systems |
| **MAC** | Mandatory Access Control | Security labels/clearances | Military, classified systems |

---

## RBAC Fundamentals

RBAC assigns permissions to **roles**, then assigns roles to **users**. Users inherit all permissions of their roles.

```
User → Role → Permissions

Example:
  Alice → Admin → [create, read, update, delete]
  Bob   → Editor → [create, read, update]
  Carol → Viewer → [read]
```

### RBAC Components

| Component | Description |
|-----------|-------------|
| **User** | A person or system identity |
| **Role** | A named collection of permissions |
| **Permission** | An allowed action on a resource |
| **Session** | A user's active roles at a given time |

---

## Implementing RBAC

### Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL
);

CREATE TABLE user_roles (
  user_id INT REFERENCES users(id),
  role_id INT REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id),
  permission_id INT REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
```

### Middleware Example (Express)

```javascript
function authorize(...requiredRoles) {
  return (req, res, next) => {
    const userRoles = req.user.roles; // populated by auth middleware
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage
app.delete("/api/users/:id", authorize("admin"), deleteUser);
app.put("/api/posts/:id", authorize("admin", "editor"), updatePost);
app.get("/api/posts", authorize("admin", "editor", "viewer"), getPosts);
```

---

## Principle of Least Privilege

> Grant users the **minimum permissions** necessary to perform their job — nothing more.

| Practice | Example |
|----------|---------|
| Default deny | New users have no permissions until explicitly granted |
| Time-limited access | Elevated privileges expire after a set period |
| Separate admin accounts | Admins use separate accounts for privileged tasks |
| Regular access reviews | Quarterly audit of who has what access |
| Just-in-time access | Grant elevated permissions only when needed |

---

## Permission Models

### Flat Permissions

```javascript
const permissions = {
  admin: ["posts:create", "posts:read", "posts:update", "posts:delete", "users:manage"],
  editor: ["posts:create", "posts:read", "posts:update"],
  viewer: ["posts:read"],
};
```

### Hierarchical Roles

```
admin (inherits all below)
  └── editor (inherits viewer)
        └── viewer (base permissions)
```

### Resource-Based Permissions

```javascript
// Check if user can edit THIS specific resource
function canEdit(user, post) {
  if (user.roles.includes("admin")) return true;
  if (user.roles.includes("editor") && post.authorId === user.id) return true;
  return false;
}
```

---

## Access Control Matrix

An access control matrix maps subjects (users/roles) to objects (resources) and their allowed actions.

| | Posts | Users | Settings |
|---|---|---|---|
| **Admin** | CRUD | CRUD | CRUD |
| **Editor** | CRU | R | R |
| **Viewer** | R | — | — |

---

## ABAC (Attribute-Based Access Control)

ABAC makes decisions based on attributes of the user, resource, action, and environment.

```
Policy: Allow if
  user.department == resource.department AND
  user.clearance >= resource.classification AND
  environment.time is within business_hours
```

| Attribute Source | Examples |
|-----------------|----------|
| User | Role, department, clearance, location |
| Resource | Owner, classification, type, creation date |
| Action | Read, write, delete, approve |
| Environment | Time of day, IP address, device type |

### When to Choose ABAC over RBAC

| Scenario | Use ABAC |
|----------|----------|
| Policies depend on resource properties | Yes |
| Thousands of fine-grained permissions | Yes |
| Context matters (time, location) | Yes |
| Simple role hierarchy suffices | Use RBAC |

---

## PBAC (Policy-Based Access Control)

PBAC centralizes access decisions in a **policy engine** separate from application code.

```yaml
# Example policy (OPA/Rego style)
allow {
  input.user.role == "editor"
  input.action == "update"
  input.resource.author == input.user.id
}
```

Popular policy engines: **OPA (Open Policy Agent)**, **Cedar (AWS)**, **Casbin**.

---

## Common Mistakes

| Mistake | Consequence |
|---------|-------------|
| Checking roles in business logic everywhere | Hard to maintain, inconsistent enforcement |
| Not revoking access when roles change | Privilege creep |
| Using a single "admin" flag | No granularity |
| Client-side-only enforcement | Easily bypassed |
| No audit trail | Cannot detect unauthorized access |

---

## Key Takeaways

- RBAC assigns permissions to roles, not directly to users — simplifying management at scale.
- Always enforce access control on the server side; client-side checks are for UX only.
- The principle of least privilege minimizes damage from compromised accounts.
- ABAC extends RBAC with attribute-based conditions for complex, dynamic policies.
- Regularly audit access, remove stale permissions, and maintain an access control matrix.

---

[Next: Zero Trust Architecture](39-cybersecurity-zero-trust)
