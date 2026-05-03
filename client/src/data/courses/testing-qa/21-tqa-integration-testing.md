---
title: Introduction to Integration Testing
---

# Introduction to Integration Testing

Integration testing verifies that multiple components work together correctly. While unit tests check individual functions in isolation, integration tests validate the interactions between modules, services, databases, and external systems.

## What Is Integration Testing?

Integration testing sits between unit tests and end-to-end tests in the testing pyramid. It validates that two or more components collaborate correctly when combined.

**Key characteristics:**
- Tests real interactions between components
- May involve actual databases, file systems, or network calls
- Slower than unit tests but faster than E2E tests
- Catches bugs that unit tests miss (interface mismatches, configuration errors)

## How It Differs from Unit Testing

| Aspect | Unit Testing | Integration Testing |
|--------|-------------|-------------------|
| Scope | Single function/class | Multiple components |
| Dependencies | Mocked/stubbed | Real or near-real |
| Speed | Milliseconds | Seconds to minutes |
| Isolation | Complete | Partial |
| Failure diagnosis | Pinpoints exact function | Indicates interaction failure |
| Setup complexity | Minimal | Moderate to high |

## Integration Points

Integration tests target the boundaries where components meet:

### Database
- ORM queries returning expected results
- Transactions committing/rolling back correctly
- Connection pooling under load

### File System
- Reading/writing configuration files
- Processing uploaded files
- Log file generation

### External APIs
- HTTP client correctly parsing responses
- Handling timeouts and retries
- Authentication token refresh flows

### Message Queues
- Publishing messages with correct format
- Consumer processing messages in order
- Dead letter queue handling

## Testing Approaches

### Top-Down Integration

Start from the highest-level module and integrate downward. Lower-level modules are replaced with stubs initially, then swapped for real implementations.

**Pros:** Tests user-facing flows early
**Cons:** Requires stubs for lower modules

### Bottom-Up Integration

Start from the lowest-level modules (database, utilities) and build upward. Drivers simulate higher-level callers.

**Pros:** No stubs needed for lower layers
**Cons:** User-facing flows tested last

### Sandwich (Hybrid) Approach

Combine top-down and bottom-up simultaneously. Top layers integrate downward while bottom layers integrate upward, meeting in the middle.

**Pros:** Parallel development, faster feedback
**Cons:** More complex coordination

## Test Database Strategies

### In-Memory Databases

Use lightweight databases that run entirely in memory:
- **SQLite** (`:memory:` mode) for Python/JS
- **H2** for Java
- **SQLite/LocalDB** for C#

**Pros:** Fast, no external dependencies
**Cons:** May differ from production DB behavior

### Test Containers

Spin up real database instances in Docker containers:
- Exact production database engine
- Disposable per test run
- Slower startup but higher fidelity

### Dedicated Test Database

A persistent database instance reserved for testing:
- Reset between test runs
- Mirrors production schema
- Useful for performance testing

## Test Isolation

Each test must start with a known state and leave no side effects:

1. **Transaction rollback** — wrap each test in a transaction, roll back after
2. **Truncate tables** — clear all data before each test
3. **Fresh database** — create/destroy database per test suite
4. **Fixtures** — load known seed data before each test

## Trade-Offs

**Advantages:**
- Catches real bugs at component boundaries
- Validates configuration and wiring
- Higher confidence than unit tests alone
- Tests actual database queries and API calls

**Disadvantages:**
- Slower execution (seconds vs milliseconds)
- More flaky (network, timing, resource contention)
- Harder to diagnose failures (which component broke?)
- Requires infrastructure (databases, containers)
- More complex setup and teardown

## Code: Testing a Service with Database Access

We'll test a `UserService` that creates and retrieves users from a database.

### Python (pytest + SQLAlchemy + SQLite)

```python
import pytest
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, nullable=False)


class UserService:
    def __init__(self, session):
        self.session = session

    def create_user(self, name, email):
        user = User(name=name, email=email)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def get_user_by_email(self, email):
        return self.session.query(User).filter_by(email=email).first()

    def get_all_users(self):
        return self.session.query(User).all()


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def user_service(db_session):
    return UserService(db_session)


class TestUserServiceIntegration:
    def test_create_user_persists_to_database(self, user_service, db_session):
        user = user_service.create_user("Alice", "alice@example.com")

        assert user.id is not None
        saved = db_session.query(User).filter_by(id=user.id).first()
        assert saved.name == "Alice"
        assert saved.email == "alice@example.com"

    def test_get_user_by_email_returns_correct_user(self, user_service):
        user_service.create_user("Bob", "bob@example.com")
        user_service.create_user("Charlie", "charlie@example.com")

        found = user_service.get_user_by_email("bob@example.com")

        assert found is not None
        assert found.name == "Bob"

    def test_get_user_by_email_returns_none_when_not_found(self, user_service):
        result = user_service.get_user_by_email("nobody@example.com")
        assert result is None

    def test_get_all_users_returns_all_created_users(self, user_service):
        user_service.create_user("Alice", "alice@example.com")
        user_service.create_user("Bob", "bob@example.com")

        users = user_service.get_all_users()

        assert len(users) == 2
        names = [u.name for u in users]
        assert "Alice" in names
        assert "Bob" in names

    def test_create_user_with_duplicate_email_raises(self, user_service):
        user_service.create_user("Alice", "alice@example.com")

        with pytest.raises(Exception):
            user_service.create_user("Alice2", "alice@example.com")
```

### JavaScript (Jest + Knex + SQLite)

```javascript
const knex = require("knex");

class UserService {
  constructor(db) {
    this.db = db;
  }

  async createUser(name, email) {
    const [id] = await this.db("users").insert({ name, email });
    return { id, name, email };
  }

  async getUserByEmail(email) {
    return this.db("users").where({ email }).first();
  }

  async getAllUsers() {
    return this.db("users").select("*");
  }
}

describe("UserService Integration Tests", () => {
  let db;
  let userService;

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
    });

    userService = new UserService(db);
  });

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    await db("users").truncate();
  });

  test("createUser persists user to database", async () => {
    const user = await userService.createUser("Alice", "alice@example.com");

    expect(user.id).toBeDefined();
    const saved = await db("users").where({ id: user.id }).first();
    expect(saved.name).toBe("Alice");
    expect(saved.email).toBe("alice@example.com");
  });

  test("getUserByEmail returns correct user", async () => {
    await userService.createUser("Bob", "bob@example.com");
    await userService.createUser("Charlie", "charlie@example.com");

    const found = await userService.getUserByEmail("bob@example.com");

    expect(found).toBeDefined();
    expect(found.name).toBe("Bob");
  });

  test("getUserByEmail returns undefined when not found", async () => {
    const result = await userService.getUserByEmail("nobody@example.com");
    expect(result).toBeUndefined();
  });

  test("getAllUsers returns all created users", async () => {
    await userService.createUser("Alice", "alice@example.com");
    await userService.createUser("Bob", "bob@example.com");

    const users = await userService.getAllUsers();

    expect(users).toHaveLength(2);
    const names = users.map((u) => u.name);
    expect(names).toContain("Alice");
    expect(names).toContain("Bob");
  });

  test("createUser with duplicate email throws", async () => {
    await userService.createUser("Alice", "alice@example.com");

    await expect(
      userService.createUser("Alice2", "alice@example.com")
    ).rejects.toThrow();
  });
});
```

### Java (JUnit 5 + Spring Boot + H2)

```java
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import jakarta.persistence.*;
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

    // Getters, setters, constructors omitted for brevity
    public User() {}
    public User(String name, String email) { this.name = name; this.email = email; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}

class UserService {
    private final EntityManager em;

    public UserService(EntityManager em) { this.em = em; }

    public User createUser(String name, String email) {
        User user = new User(name, email);
        em.persist(user);
        em.flush();
        return user;
    }

    public Optional<User> getUserByEmail(String email) {
        List<User> results = em.createQuery(
            "SELECT u FROM User u WHERE u.email = :email", User.class)
            .setParameter("email", email)
            .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public List<User> getAllUsers() {
        return em.createQuery("SELECT u FROM User u", User.class).getResultList();
    }
}

@DataJpaTest
@Import(UserService.class)
class UserServiceIntegrationTest {

    @Autowired
    private EntityManager entityManager;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(entityManager);
    }

    @Test
    void createUser_persistsToDatabase() {
        User user = userService.createUser("Alice", "alice@example.com");

        assertThat(user.getId()).isNotNull();
        User saved = entityManager.find(User.class, user.getId());
        assertThat(saved.getName()).isEqualTo("Alice");
        assertThat(saved.getEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void getUserByEmail_returnsCorrectUser() {
        userService.createUser("Bob", "bob@example.com");
        userService.createUser("Charlie", "charlie@example.com");

        Optional<User> found = userService.getUserByEmail("bob@example.com");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Bob");
    }

    @Test
    void getUserByEmail_returnsEmptyWhenNotFound() {
        Optional<User> result = userService.getUserByEmail("nobody@example.com");
        assertThat(result).isEmpty();
    }

    @Test
    void getAllUsers_returnsAllCreatedUsers() {
        userService.createUser("Alice", "alice@example.com");
        userService.createUser("Bob", "bob@example.com");

        List<User> users = userService.getAllUsers();

        assertThat(users).hasSize(2);
        assertThat(users).extracting(User::getName)
            .containsExactlyInAnyOrder("Alice", "Bob");
    }

    @Test
    void createUser_withDuplicateEmail_throws() {
        userService.createUser("Alice", "alice@example.com");

        assertThatThrownBy(() ->
            userService.createUser("Alice2", "alice@example.com"))
            .isInstanceOf(PersistenceException.class);
    }
}
```

### C# (xUnit + EF Core InMemory + WebApplicationFactory)

```csharp
using Microsoft.EntityFrameworkCore;
using Xunit;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}

public class UserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context) { _context = context; }

    public async Task<User> CreateUserAsync(string name, string email)
    {
        var user = new User { Name = name, Email = email };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        return await _context.Users.ToListAsync();
    }
}

public class UserServiceIntegrationTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly UserService _service;

    public UserServiceIntegrationTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _context.Database.EnsureCreated();
        _service = new UserService(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task CreateUser_PersistsToDatabase()
    {
        var user = await _service.CreateUserAsync("Alice", "alice@example.com");

        Assert.True(user.Id > 0);
        var saved = await _context.Users.FindAsync(user.Id);
        Assert.Equal("Alice", saved!.Name);
        Assert.Equal("alice@example.com", saved.Email);
    }

    [Fact]
    public async Task GetUserByEmail_ReturnsCorrectUser()
    {
        await _service.CreateUserAsync("Bob", "bob@example.com");
        await _service.CreateUserAsync("Charlie", "charlie@example.com");

        var found = await _service.GetUserByEmailAsync("bob@example.com");

        Assert.NotNull(found);
        Assert.Equal("Bob", found!.Name);
    }

    [Fact]
    public async Task GetUserByEmail_ReturnsNullWhenNotFound()
    {
        var result = await _service.GetUserByEmailAsync("nobody@example.com");
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllUsers_ReturnsAllCreatedUsers()
    {
        await _service.CreateUserAsync("Alice", "alice@example.com");
        await _service.CreateUserAsync("Bob", "bob@example.com");

        var users = await _service.GetAllUsersAsync();

        Assert.Equal(2, users.Count);
        Assert.Contains(users, u => u.Name == "Alice");
        Assert.Contains(users, u => u.Name == "Bob");
    }
}
```

## Summary

Integration testing bridges the gap between isolated unit tests and full system tests. By testing real interactions — especially database operations — you catch bugs that mocks would hide. The key is balancing test speed with fidelity: use in-memory databases for fast feedback and test containers for production-like validation.

**Next:** We'll dive deeper into database testing strategies, including migrations, seed data, and repository pattern testing.
