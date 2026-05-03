---
title: Test Data Management
---

## What Is Test Data Management?

Test data management (TDM) is the process of planning, creating, maintaining, and cleaning up the data needed to run tests. Good TDM ensures tests are:

- **Reliable**: Consistent results regardless of execution order
- **Independent**: No dependence on shared mutable state
- **Realistic**: Data resembles production scenarios
- **Compliant**: Sensitive data is handled according to privacy regulations

---

## Test Data Strategies

### Static Test Data

Pre-defined data checked into the repository or loaded from fixtures.

**Pros**: Simple, deterministic, fast  
**Cons**: Brittle, grows stale, hard to maintain at scale

### Dynamic Test Data

Data generated at runtime by the test itself.

**Pros**: Tests are self-contained, data is always fresh  
**Cons**: Slightly slower, requires factory/builder infrastructure

### Synthetic Test Data

Artificially generated data that mimics production patterns without containing real user information.

**Pros**: Safe, scalable, can model edge cases  
**Cons**: May not capture real-world complexity

### Production-Sanitized Data

Copies of production data with sensitive fields anonymized or masked.

**Pros**: Realistic distributions, catches real-world edge cases  
**Cons**: Expensive to maintain, privacy risk if sanitization is incomplete

---

## Factories and Builders

Factories and builders provide a programmatic way to create test data with sensible defaults while allowing customization per test.

### Why Use Factories?

- **DRY**: Define defaults once, override only what matters for each test
- **Readable**: Tests clearly show which fields are significant
- **Maintainable**: When the schema changes, update the factory — not every test
- **Composable**: Build complex object graphs by combining factories

### Factory Libraries by Language

| Language | Library | Approach |
|----------|---------|----------|
| Python | Factory Boy | Declarative factory classes |
| JavaScript | Fishery | Builder pattern with traits |
| Java | Instancio | Reflection-based generation |
| C# | AutoFixture | Convention-based creation |

---

## Data Anonymization

When using production data for testing, personally identifiable information (PII) must be anonymized.

### Common PII Fields

- Names, email addresses, phone numbers
- Social security numbers, tax IDs
- Credit card numbers, bank accounts
- IP addresses, physical addresses
- Dates of birth, medical records

### Anonymization Techniques

| Technique | Description | Example |
|-----------|-------------|---------|
| **Masking** | Replace characters with placeholders | `john@email.com` → `j***@e****.com` |
| **Substitution** | Replace with fake but realistic values | `John Smith` → `Alice Johnson` |
| **Shuffling** | Rearrange values within a column | Swap names between rows |
| **Hashing** | One-way transform | `email` → `sha256(email + salt)` |
| **Generalization** | Reduce precision | `1990-03-15` → `1990-01-01` |
| **Nulling** | Remove the value entirely | `555-0123` → `null` |

### Best Practices

- Anonymize before copying data out of production
- Maintain referential integrity after anonymization
- Use deterministic anonymization (same input → same output) to preserve relationships

---

## Test Data Lifecycle

### Create → Use → Cleanup

1. **Create**: Generate data before or during the test using factories, fixtures, or API calls
2. **Use**: The test interacts with the data — reads, updates, validates
3. **Cleanup**: Remove or reset data after the test to prevent leakage

### Lifecycle Patterns

| Pattern | Description | Best For |
|---------|-------------|----------|
| **Setup/teardown** | Create in `beforeEach`, destroy in `afterEach` | Unit and integration tests |
| **Transaction rollback** | Wrap each test in a transaction, roll back after | Database tests |
| **Ephemeral environments** | Spin up fresh database per test suite | CI pipelines |

---

## Shared Test Data Antipatterns

### The Shared Database

Multiple tests read and write to the same database rows. Tests become order-dependent and flaky.

**Fix**: Each test creates its own data.

### The Mystery Guest

Tests depend on data created elsewhere (a seed script, another test). It is unclear what data the test needs.

**Fix**: Make all required data explicit in the test setup.

### The Generous Leftovers

Tests leave behind data that unintentionally satisfies later tests. Removing those tests breaks others.

**Fix**: Clean up after every test; run tests in random order to catch dependencies.

### The Production Snapshot

Tests depend on a snapshot of production that quickly becomes outdated as the schema evolves.

**Fix**: Generate data programmatically; use migrations to keep schemas in sync.

### The Snowflake

Hand-crafted data with so many interdependencies that no one can understand or modify it.

**Fix**: Use factories with clear defaults and minimal customization per test.

---

## Code: Factory/Builder Pattern for Test Data

### Python (Factory Boy)

```python
import factory
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import List
import random
import string


@dataclass
class Address:
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "US"


@dataclass
class User:
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    address: Address
    created_at: date
    tags: List[str] = field(default_factory=list)


class AddressFactory(factory.Factory):
    class Meta:
        model = Address

    street = factory.Faker("street_address")
    city = factory.Faker("city")
    state = factory.Faker("state_abbr")
    zip_code = factory.Faker("zipcode")
    country = "US"


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    username = factory.LazyAttribute(
        lambda obj: f"user_{obj.id}_{''.join(random.choices(string.ascii_lowercase, k=4))}"
    )
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    full_name = factory.Faker("name")
    is_active = True
    address = factory.SubFactory(AddressFactory)
    created_at = factory.LazyFunction(date.today)
    tags = factory.LazyFunction(list)


# Usage in tests
def test_active_user_can_login():
    user = UserFactory()
    assert user.is_active is True
    assert "@example.com" in user.email


def test_inactive_user_cannot_login():
    user = UserFactory(is_active=False)
    assert user.is_active is False


def test_user_with_specific_address():
    user = UserFactory(
        address=AddressFactory(state="CA", city="San Francisco"),
        tags=["premium", "beta"],
    )
    assert user.address.state == "CA"
    assert "premium" in user.tags


def test_batch_creation():
    users = UserFactory.build_batch(10)
    assert len(users) == 10
    assert len(set(u.id for u in users)) == 10  # All unique IDs
```

### JavaScript (Fishery)

```javascript
import { Factory } from "fishery";

class Address {
  constructor({ street, city, state, zipCode, country = "US" }) {
    this.street = street;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
    this.country = country;
  }
}

class User {
  constructor({ id, username, email, fullName, isActive, address, createdAt, tags = [] }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.fullName = fullName;
    this.isActive = isActive;
    this.address = address;
    this.createdAt = createdAt;
    this.tags = tags;
  }
}

const addressFactory = Factory.define(() => ({
  street: "123 Test Street",
  city: "Testville",
  state: "TX",
  zipCode: "12345",
  country: "US",
}));

const userFactory = Factory.define(({ sequence, params, transientParams }) => {
  const id = sequence;
  const username = params.username || `user_${id}`;
  const address = params.address || addressFactory.build();

  return new User({
    id,
    username,
    email: params.email || `${username}@example.com`,
    fullName: params.fullName || `Test User ${id}`,
    isActive: params.isActive ?? true,
    address,
    createdAt: params.createdAt || new Date().toISOString().split("T")[0],
    tags: params.tags || [],
  });
});

// Traits for common variations
const adminFactory = Factory.define(({ sequence }) => {
  const base = userFactory.build({ tags: ["admin"] });
  return { ...base, username: `admin_${sequence}`, tags: ["admin", "staff"] };
});

// Usage in tests
function testActiveUserCanLogin() {
  const user = userFactory.build();
  console.assert(user.isActive === true);
  console.assert(user.email.includes("@example.com"));
}

function testInactiveUser() {
  const user = userFactory.build({ isActive: false });
  console.assert(user.isActive === false);
}

function testUserWithSpecificAddress() {
  const user = userFactory.build({
    address: addressFactory.build({ state: "CA", city: "San Francisco" }),
    tags: ["premium", "beta"],
  });
  console.assert(user.address.state === "CA");
  console.assert(user.tags.includes("premium"));
}

function testBatchCreation() {
  const users = userFactory.buildList(10);
  console.assert(users.length === 10);
  const ids = new Set(users.map((u) => u.id));
  console.assert(ids.size === 10); // All unique
}

testActiveUserCanLogin();
testInactiveUser();
testUserWithSpecificAddress();
testBatchCreation();
console.log("All factory tests passed");
```

### Java (Instancio)

```java
import org.instancio.Instancio;
import org.instancio.Model;
import static org.instancio.Select.field;

import java.time.LocalDate;
import java.util.List;

public class TestDataFactories {

    public record Address(String street, String city, String state,
                          String zipCode, String country) {}

    public record User(int id, String username, String email,
                       String fullName, boolean isActive,
                       Address address, LocalDate createdAt,
                       List<String> tags) {}

    // Define reusable models (like factory definitions)
    private static final Model<Address> ADDRESS_MODEL = Instancio.of(Address.class)
        .set(field(Address::country), "US")
        .toModel();

    private static final Model<User> USER_MODEL = Instancio.of(User.class)
        .set(field(User::isActive), true)
        .set(field(User::createdAt), LocalDate.now())
        .set(field(User::tags), List.of())
        .supply(field(User::address), () -> Instancio.create(ADDRESS_MODEL))
        .generate(field(User::email), gen -> gen.text().pattern("#a#a#a@example.com"))
        .toModel();

    // Factory methods for common patterns
    public static User createUser() {
        return Instancio.create(USER_MODEL);
    }

    public static User createInactiveUser() {
        return Instancio.of(USER_MODEL)
            .set(field(User::isActive), false)
            .create();
    }

    public static User createUserWithAddress(String state, String city) {
        Address address = Instancio.of(ADDRESS_MODEL)
            .set(field(Address::state), state)
            .set(field(Address::city), city)
            .create();
        return Instancio.of(USER_MODEL)
            .set(field(User::address), address)
            .create();
    }

    public static List<User> createUsers(int count) {
        return Instancio.ofList(USER_MODEL)
            .size(count)
            .create();
    }

    // Usage in tests
    public static void main(String[] args) {
        // Basic user
        User user = createUser();
        assert user.isActive() : "Default user should be active";
        assert user.email().contains("@example.com") : "Email should use example domain";

        // Inactive user
        User inactive = createInactiveUser();
        assert !inactive.isActive() : "Should be inactive";

        // User with specific address
        User caUser = createUserWithAddress("CA", "San Francisco");
        assert "CA".equals(caUser.address().state());
        assert "San Francisco".equals(caUser.address().city());

        // Batch creation
        List<User> users = createUsers(10);
        assert users.size() == 10;
        long uniqueIds = users.stream().mapToInt(User::id).distinct().count();
        assert uniqueIds == 10 : "All IDs should be unique";

        System.out.println("All factory tests passed");
    }
}
```

### C# (AutoFixture)

```csharp
using AutoFixture;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

public record Address(string Street, string City, string State, string ZipCode, string Country);
public record User(int Id, string Username, string Email, string FullName,
                   bool IsActive, Address Address, DateTime CreatedAt, List<string> Tags);

public static class TestDataFactory
{
    private static readonly Fixture _fixture = new();

    static TestDataFactory()
    {
        _fixture.Customize<Address>(c => c
            .With(a => a.Country, "US").With(a => a.State, "TX"));
        _fixture.Customize<User>(c => c
            .With(u => u.IsActive, true)
            .With(u => u.CreatedAt, DateTime.Today)
            .With(u => u.Tags, new List<string>())
            .With(u => u.Email, () => $"user_{Guid.NewGuid():N}@example.com"));
    }

    public static User CreateUser(bool isActive = true, Address? address = null,
                                   List<string>? tags = null)
    {
        var user = _fixture.Create<User>();
        return user with
        {
            IsActive = isActive,
            Address = address ?? user.Address,
            Tags = tags ?? user.Tags
        };
    }

    public static List<User> CreateUsers(int count)
        => Enumerable.Range(0, count).Select(_ => CreateUser()).ToList();
}

// Usage in tests
public static class FactoryTests
{
    public static void Main()
    {
        var user = TestDataFactory.CreateUser();
        Debug.Assert(user.IsActive);
        Debug.Assert(user.Email.Contains("@example.com"));

        var inactive = TestDataFactory.CreateUser(isActive: false);
        Debug.Assert(!inactive.IsActive);

        var address = new Address("100 Main St", "San Francisco", "CA", "94102", "US");
        var caUser = TestDataFactory.CreateUser(address: address, tags: new() { "premium" });
        Debug.Assert(caUser.Address.State == "CA");
        Debug.Assert(caUser.Tags.Contains("premium"));

        var users = TestDataFactory.CreateUsers(10);
        Debug.Assert(users.Count == 10);
        Console.WriteLine("All factory tests passed");
    }
}
```

---

## Summary

Effective test data management is the foundation of a reliable test suite. Key takeaways:

- Choose the right **strategy** (static, dynamic, synthetic, or sanitized) based on your testing goals
- Use **factories and builders** to create data programmatically with sensible defaults
- **Anonymize** production data before using it in test environments
- Follow the **create → use → cleanup** lifecycle to prevent test pollution
- Avoid antipatterns like shared databases, mystery guests, and generous leftovers
