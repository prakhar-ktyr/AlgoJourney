---
title: Database Testing
---

# Database Testing

Database testing ensures your application's data layer works correctly — that records are created, read, updated, and deleted as expected, schemas evolve safely, and tests remain isolated from each other.

## Why Test the Database Layer?

The database is often the most critical integration point in an application:

- **Data integrity** — constraints, triggers, and cascades work as designed
- **Query correctness** — complex queries return expected results
- **Performance** — queries execute within acceptable time
- **Migration safety** — schema changes don't corrupt existing data
- **Edge cases** — null handling, empty strings, boundary values

## Testing CRUD Operations

CRUD (Create, Read, Update, Delete) tests verify basic data operations:

### Create
- Valid data is persisted with correct field values
- Auto-generated fields (IDs, timestamps) are populated
- Constraint violations (unique, not-null) raise appropriate errors

### Read
- Single record retrieval by primary key
- Filtered queries return matching records only
- Empty results when no records match
- Pagination and ordering work correctly

### Update
- Modified fields are persisted
- Unmodified fields retain their values
- Optimistic locking prevents lost updates
- Updating non-existent records is handled gracefully

### Delete
- Record is removed from the database
- Cascade deletes remove dependent records
- Soft delete marks records without removing them
- Deleting non-existent records doesn't throw

## In-Memory Databases vs Test Containers

### In-Memory Databases

| Database | In-Memory Option | Best For |
|----------|-----------------|----------|
| SQLite | `:memory:` | Python, Node.js, lightweight tests |
| H2 | `jdbc:h2:mem:` | Java/Spring Boot |
| EF Core InMemory | `UseInMemoryDatabase()` | .NET applications |

**Advantages:** Instant startup, no external dependencies, very fast
**Limitations:** May lack features of production DB (stored procedures, specific SQL dialect)

### Test Containers

Run real database engines (PostgreSQL, MySQL, MongoDB) in Docker:

```
Test starts → Docker container spins up → Tests run → Container destroyed
```

**Advantages:** Exact production behavior, tests all DB-specific features
**Limitations:** Slower startup (2-10 seconds), requires Docker

## Migration Testing

Schema migrations must be tested to ensure:

1. **Forward migration** applies cleanly on empty and populated databases
2. **Data preservation** — existing records survive the migration
3. **Rollback** — down migration reverses changes correctly
4. **Idempotency** — running a migration twice doesn't break anything

### Testing Strategy

```
1. Apply migrations up to version N-1
2. Seed test data
3. Apply migration N
4. Verify data is intact and schema is correct
5. Rollback migration N
6. Verify original state is restored
```

## Transaction Rollback Strategy

Wrap each test in a database transaction, then roll back after the test completes. This provides perfect isolation without the cost of recreating the database.

**How it works:**
1. Begin transaction before test
2. Test performs all operations within this transaction
3. After test (pass or fail), roll back the transaction
4. Database is back to its original state

**Caveats:**
- Tests can't verify commit behavior
- Nested transactions may behave differently
- Some ORMs auto-commit, requiring configuration changes

## Seed Data, Fixtures, and Factories

### Seed Data
Pre-defined data loaded before tests run. Good for reference data (countries, categories).

### Fixtures
Static data files (JSON, YAML, SQL) loaded per test or test suite. Predictable but brittle if schema changes.

### Factories
Programmatic builders that create test data with sensible defaults. Only specify fields relevant to the test.

```
Factory approach:
  createUser()                    → User with all defaults
  createUser({ email: "x@y.z" }) → User with specific email, rest defaults
```

## Repository Pattern Testing

The repository pattern abstracts database access behind an interface. Testing repositories verifies that:

- The interface contract is fulfilled
- Queries map correctly to database operations
- Error cases (not found, constraint violations) are handled

## Code: Full CRUD Test Suite for a User Repository

### Python (pytest + SQLAlchemy)

```python
import pytest
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserRepository:
    def __init__(self, session):
        self.session = session

    def create(self, name, email):
        user = User(name=name, email=email)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def find_by_id(self, user_id):
        return self.session.query(User).get(user_id)

    def find_by_email(self, email):
        return self.session.query(User).filter_by(email=email).first()

    def find_all(self):
        return self.session.query(User).all()

    def update(self, user_id, **kwargs):
        user = self.find_by_id(user_id)
        if user is None:
            return None
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user_id):
        user = self.find_by_id(user_id)
        if user is None:
            return False
        self.session.delete(user)
        self.session.commit()
        return True


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def repo(db_session):
    return UserRepository(db_session)


class TestUserRepositoryCreate:
    def test_creates_user_with_valid_data(self, repo):
        user = repo.create("Alice", "alice@example.com")

        assert user.id is not None
        assert user.name == "Alice"
        assert user.email == "alice@example.com"
        assert user.created_at is not None

    def test_auto_generates_id(self, repo):
        user1 = repo.create("Alice", "alice@example.com")
        user2 = repo.create("Bob", "bob@example.com")

        assert user1.id != user2.id

    def test_rejects_duplicate_email(self, repo):
        repo.create("Alice", "alice@example.com")

        with pytest.raises(Exception):
            repo.create("Bob", "alice@example.com")

    def test_rejects_null_name(self, repo):
        with pytest.raises(Exception):
            repo.create(None, "test@example.com")


class TestUserRepositoryRead:
    def test_find_by_id_returns_user(self, repo):
        created = repo.create("Alice", "alice@example.com")

        found = repo.find_by_id(created.id)

        assert found.name == "Alice"

    def test_find_by_id_returns_none_for_missing(self, repo):
        assert repo.find_by_id(999) is None

    def test_find_by_email_returns_user(self, repo):
        repo.create("Alice", "alice@example.com")

        found = repo.find_by_email("alice@example.com")

        assert found.name == "Alice"

    def test_find_all_returns_all_users(self, repo):
        repo.create("Alice", "alice@example.com")
        repo.create("Bob", "bob@example.com")
        repo.create("Charlie", "charlie@example.com")

        users = repo.find_all()

        assert len(users) == 3


class TestUserRepositoryUpdate:
    def test_updates_name(self, repo):
        user = repo.create("Alice", "alice@example.com")

        updated = repo.update(user.id, name="Alicia")

        assert updated.name == "Alicia"
        assert updated.email == "alice@example.com"

    def test_updates_email(self, repo):
        user = repo.create("Alice", "alice@example.com")

        updated = repo.update(user.id, email="alicia@example.com")

        assert updated.email == "alicia@example.com"

    def test_returns_none_for_missing_user(self, repo):
        result = repo.update(999, name="Nobody")
        assert result is None

    def test_preserves_unmodified_fields(self, repo):
        user = repo.create("Alice", "alice@example.com")

        updated = repo.update(user.id, name="Alicia")

        assert updated.email == "alice@example.com"
        assert updated.created_at is not None


class TestUserRepositoryDelete:
    def test_deletes_existing_user(self, repo):
        user = repo.create("Alice", "alice@example.com")

        result = repo.delete(user.id)

        assert result is True
        assert repo.find_by_id(user.id) is None

    def test_returns_false_for_missing_user(self, repo):
        result = repo.delete(999)
        assert result is False

    def test_does_not_affect_other_users(self, repo):
        user1 = repo.create("Alice", "alice@example.com")
        user2 = repo.create("Bob", "bob@example.com")

        repo.delete(user1.id)

        assert repo.find_by_id(user2.id) is not None
        assert len(repo.find_all()) == 1
```

### JavaScript (Jest + Knex + SQLite)

```javascript
const knex = require("knex");

class UserRepository {
  constructor(db) {
    this.db = db;
  }

  async create(name, email) {
    const [id] = await this.db("users").insert({ name, email });
    return this.db("users").where({ id }).first();
  }

  async findById(id) {
    return this.db("users").where({ id }).first() || null;
  }

  async findByEmail(email) {
    return this.db("users").where({ email }).first() || null;
  }

  async findAll() {
    return this.db("users").select("*");
  }

  async update(id, data) {
    const count = await this.db("users").where({ id }).update(data);
    if (count === 0) return null;
    return this.db("users").where({ id }).first();
  }

  async delete(id) {
    const count = await this.db("users").where({ id }).del();
    return count > 0;
  }
}

describe("UserRepository CRUD Tests", () => {
  let db;
  let repo;

  beforeAll(async () => {
    db = knex({
      client: "sqlite3",
      connection: { filename: ":memory:" },
      useNullAsDefault: true,
    });

    await db.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("name", 100).notNullable();
      table.string("email", 200).notNullable().unique();
      table.timestamp("created_at").defaultTo(db.fn.now());
    });

    repo = new UserRepository(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    await db("users").truncate();
  });

  describe("create", () => {
    test("creates user with valid data", async () => {
      const user = await repo.create("Alice", "alice@example.com");

      expect(user.id).toBeDefined();
      expect(user.name).toBe("Alice");
      expect(user.email).toBe("alice@example.com");
    });

    test("auto-generates unique IDs", async () => {
      const user1 = await repo.create("Alice", "alice@example.com");
      const user2 = await repo.create("Bob", "bob@example.com");

      expect(user1.id).not.toBe(user2.id);
    });

    test("rejects duplicate email", async () => {
      await repo.create("Alice", "alice@example.com");

      await expect(
        repo.create("Bob", "alice@example.com")
      ).rejects.toThrow();
    });
  });

  describe("read", () => {
    test("findById returns existing user", async () => {
      const created = await repo.create("Alice", "alice@example.com");

      const found = await repo.findById(created.id);

      expect(found.name).toBe("Alice");
    });

    test("findById returns null for missing user", async () => {
      const found = await repo.findById(999);
      expect(found).toBeUndefined();
    });

    test("findByEmail returns existing user", async () => {
      await repo.create("Alice", "alice@example.com");

      const found = await repo.findByEmail("alice@example.com");

      expect(found.name).toBe("Alice");
    });

    test("findAll returns all users", async () => {
      await repo.create("Alice", "alice@example.com");
      await repo.create("Bob", "bob@example.com");

      const users = await repo.findAll();

      expect(users).toHaveLength(2);
    });
  });

  describe("update", () => {
    test("updates name", async () => {
      const user = await repo.create("Alice", "alice@example.com");

      const updated = await repo.update(user.id, { name: "Alicia" });

      expect(updated.name).toBe("Alicia");
      expect(updated.email).toBe("alice@example.com");
    });

    test("returns null for missing user", async () => {
      const result = await repo.update(999, { name: "Nobody" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("deletes existing user", async () => {
      const user = await repo.create("Alice", "alice@example.com");

      const result = await repo.delete(user.id);

      expect(result).toBe(true);
      const found = await repo.findById(user.id);
      expect(found).toBeUndefined();
    });

    test("returns false for missing user", async () => {
      const result = await repo.delete(999);
      expect(result).toBe(false);
    });
  });
});
```

### Java (JUnit 5 + Spring Data JPA + H2)

```java
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@Entity
@Table(name = "users")
class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}
    public User(String name, String email) { this.name = name; this.email = email; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

class UserRepository {
    private final EntityManager em;

    public UserRepository(EntityManager em) { this.em = em; }

    public User create(String name, String email) {
        User user = new User(name, email);
        em.persist(user);
        em.flush();
        return user;
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(em.find(User.class, id));
    }

    public Optional<User> findByEmail(String email) {
        List<User> results = em.createQuery(
            "SELECT u FROM User u WHERE u.email = :email", User.class)
            .setParameter("email", email).getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<User> findAll() {
        return em.createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    public Optional<User> update(Long id, String name, String email) {
        User user = em.find(User.class, id);
        if (user == null) return Optional.empty();
        if (name != null) user.setName(name);
        if (email != null) user.setEmail(email);
        em.flush();
        return Optional.of(user);
    }

    public boolean delete(Long id) {
        User user = em.find(User.class, id);
        if (user == null) return false;
        em.remove(user);
        em.flush();
        return true;
    }
}

@DataJpaTest
class UserRepositoryCrudTest {

    @Autowired
    private TestEntityManager testEntityManager;

    private UserRepository repo;

    @BeforeEach
    void setUp() {
        repo = new UserRepository(testEntityManager.getEntityManager());
    }

    @Nested
    class CreateTests {
        @Test
        void createsUserWithValidData() {
            User user = repo.create("Alice", "alice@example.com");

            assertThat(user.getId()).isNotNull();
            assertThat(user.getName()).isEqualTo("Alice");
            assertThat(user.getEmail()).isEqualTo("alice@example.com");
            assertThat(user.getCreatedAt()).isNotNull();
        }

        @Test
        void rejectsDuplicateEmail() {
            repo.create("Alice", "alice@example.com");

            assertThatThrownBy(() -> repo.create("Bob", "alice@example.com"))
                .isInstanceOf(PersistenceException.class);
        }
    }

    @Nested
    class ReadTests {
        @Test
        void findById_returnsExistingUser() {
            User created = repo.create("Alice", "alice@example.com");

            Optional<User> found = repo.findById(created.getId());

            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo("Alice");
        }

        @Test
        void findById_returnsEmptyForMissing() {
            assertThat(repo.findById(999L)).isEmpty();
        }

        @Test
        void findAll_returnsAllUsers() {
            repo.create("Alice", "alice@example.com");
            repo.create("Bob", "bob@example.com");

            List<User> users = repo.findAll();

            assertThat(users).hasSize(2);
        }
    }

    @Nested
    class UpdateTests {
        @Test
        void updatesName() {
            User user = repo.create("Alice", "alice@example.com");

            Optional<User> updated = repo.update(user.getId(), "Alicia", null);

            assertThat(updated).isPresent();
            assertThat(updated.get().getName()).isEqualTo("Alicia");
            assertThat(updated.get().getEmail()).isEqualTo("alice@example.com");
        }

        @Test
        void returnsEmptyForMissingUser() {
            assertThat(repo.update(999L, "Nobody", null)).isEmpty();
        }
    }

    @Nested
    class DeleteTests {
        @Test
        void deletesExistingUser() {
            User user = repo.create("Alice", "alice@example.com");

            boolean result = repo.delete(user.getId());

            assertThat(result).isTrue();
            assertThat(repo.findById(user.getId())).isEmpty();
        }

        @Test
        void returnsFalseForMissingUser() {
            assertThat(repo.delete(999L)).isFalse();
        }
    }
}
```

### C# (xUnit + EF Core InMemory)

```csharp
using Microsoft.EntityFrameworkCore;
using Xunit;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().Property(u => u.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.Email).IsRequired().HasMaxLength(200);
    }
}

public class UserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) { _context = context; }

    public async Task<User> CreateAsync(string name, string email)
    {
        var user = new User { Name = name, Email = email };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> FindByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> FindAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> UpdateAsync(int id, string? name = null, string? email = null)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;
        if (name != null) user.Name = name;
        if (email != null) user.Email = email;
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }
}

public class UserRepositoryCrudTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly UserRepository _repo;

    public UserRepositoryCrudTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();
        _repo = new UserRepository(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task Create_PersistsUserWithValidData()
    {
        var user = await _repo.CreateAsync("Alice", "alice@example.com");

        Assert.True(user.Id > 0);
        Assert.Equal("Alice", user.Name);
        Assert.Equal("alice@example.com", user.Email);
    }

    [Fact]
    public async Task Create_AutoGeneratesUniqueIds()
    {
        var user1 = await _repo.CreateAsync("Alice", "alice@example.com");
        var user2 = await _repo.CreateAsync("Bob", "bob@example.com");

        Assert.NotEqual(user1.Id, user2.Id);
    }

    [Fact]
    public async Task FindById_ReturnsExistingUser()
    {
        var created = await _repo.CreateAsync("Alice", "alice@example.com");

        var found = await _repo.FindByIdAsync(created.Id);

        Assert.NotNull(found);
        Assert.Equal("Alice", found!.Name);
    }

    [Fact]
    public async Task FindById_ReturnsNullForMissing()
    {
        var found = await _repo.FindByIdAsync(999);
        Assert.Null(found);
    }

    [Fact]
    public async Task FindByEmail_ReturnsCorrectUser()
    {
        await _repo.CreateAsync("Alice", "alice@example.com");

        var found = await _repo.FindByEmailAsync("alice@example.com");

        Assert.NotNull(found);
        Assert.Equal("Alice", found!.Name);
    }

    [Fact]
    public async Task FindAll_ReturnsAllUsers()
    {
        await _repo.CreateAsync("Alice", "alice@example.com");
        await _repo.CreateAsync("Bob", "bob@example.com");

        var users = await _repo.FindAllAsync();

        Assert.Equal(2, users.Count);
    }

    [Fact]
    public async Task Update_ModifiesName()
    {
        var user = await _repo.CreateAsync("Alice", "alice@example.com");

        var updated = await _repo.UpdateAsync(user.Id, name: "Alicia");

        Assert.NotNull(updated);
        Assert.Equal("Alicia", updated!.Name);
        Assert.Equal("alice@example.com", updated.Email);
    }

    [Fact]
    public async Task Update_ReturnsNullForMissing()
    {
        var result = await _repo.UpdateAsync(999, name: "Nobody");
        Assert.Null(result);
    }

    [Fact]
    public async Task Delete_RemovesExistingUser()
    {
        var user = await _repo.CreateAsync("Alice", "alice@example.com");

        var result = await _repo.DeleteAsync(user.Id);

        Assert.True(result);
        Assert.Null(await _repo.FindByIdAsync(user.Id));
    }

    [Fact]
    public async Task Delete_ReturnsFalseForMissing()
    {
        var result = await _repo.DeleteAsync(999);
        Assert.False(result);
    }

    [Fact]
    public async Task Delete_DoesNotAffectOtherUsers()
    {
        var user1 = await _repo.CreateAsync("Alice", "alice@example.com");
        var user2 = await _repo.CreateAsync("Bob", "bob@example.com");

        await _repo.DeleteAsync(user1.Id);

        Assert.NotNull(await _repo.FindByIdAsync(user2.Id));
        var all = await _repo.FindAllAsync();
        Assert.Single(all);
    }
}
```

## Summary

Database testing gives you confidence that your data layer is correct. Use in-memory databases for fast, isolated tests during development, and test containers for production-fidelity checks in CI. The repository pattern makes your data access testable and swappable.

**Key takeaways:**
- Test all CRUD operations with both happy paths and edge cases
- Use transaction rollback or database recreation for isolation
- Factories are more maintainable than fixtures for test data
- Always test constraint violations (unique, not-null, foreign keys)

**Next:** We'll explore API testing fundamentals — testing HTTP endpoints from the outside.
