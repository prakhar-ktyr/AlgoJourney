---
title: Data Sources
---

# Data Sources

Data sources encapsulate data-fetching logic, keeping resolvers clean and enabling caching and batching.

---

## Why Data Sources?

Without data sources, resolvers get messy:

```javascript
// ❌ Database logic in resolvers
Query: {
  user: async (_, { id }) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },
  userPosts: async (_, { userId }) => {
    const result = await pool.query("SELECT * FROM posts WHERE author_id = $1", [userId]);
    return result.rows;
  },
}
```

With data sources:

```javascript
// ✅ Clean resolvers
Query: {
  user: (_, { id }, { dataSources }) => dataSources.users.getById(id),
  userPosts: (_, { userId }, { dataSources }) => dataSources.posts.getByAuthor(userId),
}
```

---

## Creating a Data Source

```javascript
// datasources/UserDataSource.js
export class UserDataSource {
  constructor(db) {
    this.db = db;
  }

  async getById(id) {
    const result = await this.db.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async getAll({ limit = 20, offset = 0 }) {
    const result = await this.db.query(
      "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  async create(input) {
    const result = await this.db.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [input.name, input.email]
    );
    return result.rows[0];
  }

  async update(id, input) {
    const fields = Object.keys(input).map((k, i) => `${k} = $${i + 2}`);
    const values = Object.values(input);
    const result = await this.db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  }

  async delete(id) {
    await this.db.query("DELETE FROM users WHERE id = $1", [id]);
    return true;
  }
}
```

---

## Wiring Data Sources to Context

```javascript
import { UserDataSource } from "./datasources/UserDataSource.js";
import { PostDataSource } from "./datasources/PostDataSource.js";

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => ({
      user: await authenticate(req),
      dataSources: {
        users: new UserDataSource(db),
        posts: new PostDataSource(db),
      },
    }),
  })
);
```

---

## Using in Resolvers

```javascript
const resolvers = {
  Query: {
    users: (_, { limit, offset }, { dataSources }) =>
      dataSources.users.getAll({ limit, offset }),
    user: (_, { id }, { dataSources }) =>
      dataSources.users.getById(id),
  },
  Mutation: {
    createUser: (_, { input }, { dataSources }) =>
      dataSources.users.create(input),
  },
  User: {
    posts: (parent, _, { dataSources }) =>
      dataSources.posts.getByAuthor(parent.id),
  },
};
```

---

## REST API Data Source

Fetch from external REST APIs:

```javascript
export class MovieDataSource {
  constructor() {
    this.baseUrl = "https://api.themoviedb.org/3";
    this.apiKey = process.env.TMDB_API_KEY;
  }

  async getMovie(id) {
    const res = await fetch(`${this.baseUrl}/movie/${id}?api_key=${this.apiKey}`);
    return res.json();
  }

  async searchMovies(term) {
    const res = await fetch(
      `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(term)}`
    );
    const data = await res.json();
    return data.results;
  }
}
```

---

## Key Takeaways

- Data sources **encapsulate** all data-fetching logic
- Resolvers stay **clean** — just delegate to data sources
- Create one data source **per entity** (UserDataSource, PostDataSource)
- Instantiate data sources in **context** (per-request)
- Data sources can wrap databases, REST APIs, or any data backend

---

Next, we'll learn about **Database Integration** with MongoDB →
