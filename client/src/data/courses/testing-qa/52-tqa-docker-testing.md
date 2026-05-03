---
title: Testing with Docker & Containers
---

## Why Containers for Testing?

Containers solve the "works on my machine" problem by providing:

- **Consistent environments**: Every developer and CI runner uses the exact same setup
- **Isolation**: Tests don't interfere with each other or pollute the host system
- **Real dependencies**: Test against actual databases, message brokers, and services
- **Reproducibility**: Failures can be reproduced anywhere the container runs
- **Disposability**: Spin up fresh instances for each test run, no state leaks

## Docker Compose for Test Infrastructure

Docker Compose orchestrates multi-container test environments:

```yaml
# docker-compose.test.yml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U testuser -d testdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_port_connectivity"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Run with: `docker compose -f docker-compose.test.yml up -d --wait`

## Testcontainers: Programmatic Container Management

Testcontainers lets you spin up real Docker containers directly from test code:

- No external Docker Compose files needed
- Containers are scoped to the test lifecycle
- Random port mapping avoids conflicts
- Built-in wait strategies ensure services are ready
- Automatic cleanup after tests complete

## Database Testing with Testcontainers

Instead of mocking databases, test against real instances:

- Start a fresh database container per test class or suite
- Apply migrations before tests run
- Each test gets a clean, isolated database state
- Test actual SQL queries, constraints, and triggers
- Verify ORM mappings work with the real engine

## Parallel Test Execution with Containers

Each parallel test worker gets its own container:

- No shared state between parallel tests
- Random port assignment prevents port conflicts
- Container reuse within a worker for performance
- Resource limits prevent container sprawl

## Cleanup: Removing Containers After Tests

Proper cleanup prevents resource leaks:

- Testcontainers uses a "Ryuk" sidecar container for automatic cleanup
- Containers are removed even if tests crash
- Volumes and networks are cleaned up
- Set `TESTCONTAINERS_RYUK_DISABLED=false` in CI for safety

## Code Examples

### Python with testcontainers-python

```python
# requirements.txt (relevant deps):
# testcontainers[postgres]==4.4.0
# sqlalchemy==2.0.30
# psycopg2-binary==2.9.9
# pytest==8.2.0

import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy import create_engine, text, Column, Integer, String
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)


@pytest.fixture(scope="module")
def postgres_container():
    """Start a PostgreSQL container for the test module."""
    with PostgresContainer("postgres:16-alpine") as postgres:
        yield postgres


@pytest.fixture(scope="module")
def engine(postgres_container):
    """Create SQLAlchemy engine connected to the container."""
    engine = create_engine(postgres_container.get_connection_url())
    Base.metadata.create_all(engine)
    return engine


@pytest.fixture
def db_session(engine):
    """Provide a transactional session that rolls back after each test."""
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


class TestUserRepository:
    """Test user operations against a real PostgreSQL database."""

    def test_create_user(self, db_session):
        user = User(name="Alice", email="alice@example.com")
        db_session.add(user)
        db_session.flush()

        assert user.id is not None
        assert user.name == "Alice"

    def test_unique_email_constraint(self, db_session):
        user1 = User(name="Bob", email="bob@example.com")
        user2 = User(name="Bobby", email="bob@example.com")
        db_session.add(user1)
        db_session.flush()

        db_session.add(user2)
        with pytest.raises(Exception) as exc_info:
            db_session.flush()
        assert "unique" in str(exc_info.value).lower() or "duplicate" in str(exc_info.value).lower()

    def test_query_users(self, db_session):
        users = [
            User(name="User1", email="user1@example.com"),
            User(name="User2", email="user2@example.com"),
            User(name="User3", email="user3@example.com"),
        ]
        db_session.add_all(users)
        db_session.flush()

        result = db_session.query(User).filter(User.name.like("User%")).all()
        assert len(result) == 3

    def test_raw_sql_execution(self, db_session):
        db_session.execute(
            text("INSERT INTO users (name, email) VALUES (:name, :email)"),
            {"name": "Raw", "email": "raw@example.com"},
        )
        db_session.flush()

        row = db_session.execute(
            text("SELECT name FROM users WHERE email = :email"),
            {"email": "raw@example.com"},
        ).fetchone()
        assert row[0] == "Raw"
```

### JavaScript with testcontainers

```javascript
const { PostgreSqlContainer } = require("testcontainers");
const { Client } = require("pg");

describe("User Repository with PostgreSQL Container", () => {
  let container;
  let client;

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase("testdb")
      .withUsername("testuser")
      .withPassword("testpass")
      .start();

    client = new Client({
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    });
    await client.connect();

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL
      )
    `);
  }, 60000);

  afterAll(async () => {
    await client.end();
    await container.stop();
  });

  beforeEach(async () => {
    await client.query("DELETE FROM users");
  });

  test("should insert and retrieve a user", async () => {
    await client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
      "Alice", "alice@example.com",
    ]);

    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      "alice@example.com",
    ]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].name).toBe("Alice");
  });

  test("should enforce unique email constraint", async () => {
    await client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
      "Bob", "bob@example.com",
    ]);

    await expect(
      client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
        "Bobby", "bob@example.com",
      ])
    ).rejects.toThrow(/unique|duplicate/i);
  });

  test("should support transaction rollback", async () => {
    await client.query("BEGIN");
    await client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [
      "Charlie", "charlie@example.com",
    ]);
    await client.query("ROLLBACK");

    const result = await client.query("SELECT * FROM users WHERE name = $1", ["Charlie"]);
    expect(result.rows).toHaveLength(0);
  });
});
```

### Java with Testcontainers

```java
package com.example.repository;

import org.junit.jupiter.api.*;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class UserRepositoryContainerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("testuser")
        .withPassword("testpass");

    private Connection connection;

    @BeforeAll
    static void createSchema() throws SQLException {
        try (Connection conn = DriverManager.getConnection(
                postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
             Statement stmt = conn.createStatement()) {
            stmt.execute("""
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL
                )
            """);
        }
    }

    @BeforeEach
    void setUp() throws SQLException {
        connection = DriverManager.getConnection(
            postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword()
        );
        connection.setAutoCommit(false);
    }

    @AfterEach
    void tearDown() throws SQLException {
        connection.rollback();
        connection.close();
    }

    @Test
    void shouldInsertAndRetrieveUser() throws SQLException {
        try (PreparedStatement insert = connection.prepareStatement(
                "INSERT INTO users (name, email) VALUES (?, ?)",
                Statement.RETURN_GENERATED_KEYS)) {
            insert.setString(1, "Alice");
            insert.setString(2, "alice@example.com");
            insert.executeUpdate();

            ResultSet keys = insert.getGeneratedKeys();
            assertTrue(keys.next());
            assertTrue(keys.getInt(1) > 0);
        }
    }

    @Test
    void shouldEnforceUniqueEmailConstraint() throws SQLException {
        try (PreparedStatement insert = connection.prepareStatement(
                "INSERT INTO users (name, email) VALUES (?, ?)")) {
            insert.setString(1, "Bob");
            insert.setString(2, "bob@example.com");
            insert.executeUpdate();
        }

        try (PreparedStatement duplicate = connection.prepareStatement(
                "INSERT INTO users (name, email) VALUES (?, ?)")) {
            duplicate.setString(1, "Bobby");
            duplicate.setString(2, "bob@example.com");
            assertThrows(SQLException.class, duplicate::executeUpdate);
        }
    }
}
```

### C# with Testcontainers for .NET

```csharp
using Testcontainers.PostgreSql;
using Npgsql;
using Xunit;

namespace MyApp.Tests.Integration;

public class UserRepositoryContainerTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("testdb")
        .WithUsername("testuser")
        .WithPassword("testpass")
        .Build();

    private NpgsqlConnection _connection = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        _connection = new NpgsqlConnection(_postgres.GetConnectionString());
        await _connection.OpenAsync();

        await using var cmd = new NpgsqlCommand("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL
            )
        """, _connection);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DisposeAsync()
    {
        await _connection.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task ShouldInsertAndRetrieveUser()
    {
        await using var insertCmd = new NpgsqlCommand(
            "INSERT INTO users (name, email) VALUES (@name, @email) RETURNING id",
            _connection);
        insertCmd.Parameters.AddWithValue("name", "Alice");
        insertCmd.Parameters.AddWithValue("email", "alice@example.com");
        var id = (int)(await insertCmd.ExecuteScalarAsync())!;

        Assert.True(id > 0);

        await using var selectCmd = new NpgsqlCommand(
            "SELECT name FROM users WHERE id = @id", _connection);
        selectCmd.Parameters.AddWithValue("id", id);
        var name = (string)(await selectCmd.ExecuteScalarAsync())!;
        Assert.Equal("Alice", name);
    }

    [Fact]
    public async Task ShouldEnforceUniqueEmailConstraint()
    {
        await using var cmd1 = new NpgsqlCommand(
            "INSERT INTO users (name, email) VALUES (@name, @email)", _connection);
        cmd1.Parameters.AddWithValue("name", "Bob");
        cmd1.Parameters.AddWithValue("email", "bob@example.com");
        await cmd1.ExecuteNonQueryAsync();

        await using var cmd2 = new NpgsqlCommand(
            "INSERT INTO users (name, email) VALUES (@name, @email)", _connection);
        cmd2.Parameters.AddWithValue("name", "Bobby");
        cmd2.Parameters.AddWithValue("email", "bob@example.com");

        await Assert.ThrowsAsync<PostgresException>(() => cmd2.ExecuteNonQueryAsync());
    }

    [Fact]
    public async Task ShouldSupportTransactionRollback()
    {
        await using var transaction = await _connection.BeginTransactionAsync();
        await using var cmd = new NpgsqlCommand(
            "INSERT INTO users (name, email) VALUES (@name, @email)",
            _connection, transaction);
        cmd.Parameters.AddWithValue("name", "Charlie");
        cmd.Parameters.AddWithValue("email", "charlie@example.com");
        await cmd.ExecuteNonQueryAsync();

        await transaction.RollbackAsync();

        await using var checkCmd = new NpgsqlCommand(
            "SELECT COUNT(*) FROM users WHERE name = 'Charlie'", _connection);
        var count = (long)(await checkCmd.ExecuteScalarAsync())!;
        Assert.Equal(0, count);
    }
}
```

## Best Practices

1. **Use specific image tags**: Always pin container versions (e.g., `postgres:16-alpine`, not `postgres:latest`)
2. **Wait strategies**: Ensure containers are fully ready before running tests
3. **Resource limits**: Set memory/CPU limits to prevent containers from consuming all resources
4. **Reuse containers**: Use singleton containers for test suites to reduce startup time
5. **Network isolation**: Create dedicated Docker networks for test containers
6. **Clean state**: Reset database/state between tests rather than relying on container restart
7. **CI compatibility**: Ensure Docker-in-Docker or Docker socket mounting works in your CI environment
