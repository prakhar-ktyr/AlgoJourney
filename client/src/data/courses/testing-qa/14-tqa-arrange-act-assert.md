---
title: Test Structure — Arrange, Act, Assert
---

# Test Structure — Arrange, Act, Assert

The **Arrange-Act-Assert** (AAA) pattern is the most widely adopted structure for writing clear, readable unit tests. Every well-written test follows this three-phase flow, making it immediately obvious what is being tested, how it's exercised, and what the expected outcome is.

---

## The AAA Pattern Explained

```
Arrange → Set up inputs, dependencies, and preconditions
Act     → Execute the code under test
Assert  → Verify the result matches expectations
```

Each phase has a single responsibility. Mixing them creates tests that are hard to read, maintain, and debug.

---

## Arrange: Set Up Data and Preconditions

The **Arrange** phase prepares everything the test needs:

- Create objects and test data
- Configure mocks and stubs
- Set up the system state
- Define expected values

### Python (pytest)

```python
import pytest
from shopping_cart import ShoppingCart, Product


def test_cart_calculates_total_price():
    # Arrange
    cart = ShoppingCart()
    apple = Product(name="Apple", price=1.50)
    banana = Product(name="Banana", price=0.75)
    cart.add_item(apple, quantity=3)
    cart.add_item(banana, quantity=2)
    expected_total = 6.00  # (1.50 * 3) + (0.75 * 2)

    # Act
    total = cart.calculate_total()

    # Assert
    assert total == expected_total
```

### JavaScript (Jest)

```javascript
const { ShoppingCart, Product } = require("./shoppingCart");

describe("ShoppingCart", () => {
  test("calculates total price correctly", () => {
    // Arrange
    const cart = new ShoppingCart();
    const apple = new Product("Apple", 1.5);
    const banana = new Product("Banana", 0.75);
    cart.addItem(apple, 3);
    cart.addItem(banana, 2);
    const expectedTotal = 6.0;

    // Act
    const total = cart.calculateTotal();

    // Assert
    expect(total).toBe(expectedTotal);
  });
});
```

### Java (JUnit 5)

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ShoppingCartTest {

    @Test
    void calculatesTotal PriceCorrectly() {
        // Arrange
        ShoppingCart cart = new ShoppingCart();
        Product apple = new Product("Apple", 1.50);
        Product banana = new Product("Banana", 0.75);
        cart.addItem(apple, 3);
        cart.addItem(banana, 2);
        double expectedTotal = 6.00;

        // Act
        double total = cart.calculateTotal();

        // Assert
        assertEquals(expectedTotal, total, 0.001);
    }
}
```

### C# (xUnit)

```csharp
using Xunit;

public class ShoppingCartTests
{
    [Fact]
    public void CalculatesTotalPriceCorrectly()
    {
        // Arrange
        var cart = new ShoppingCart();
        var apple = new Product("Apple", 1.50m);
        var banana = new Product("Banana", 0.75m);
        cart.AddItem(apple, quantity: 3);
        cart.AddItem(banana, quantity: 2);
        var expectedTotal = 6.00m;

        // Act
        var total = cart.CalculateTotal();

        // Assert
        Assert.Equal(expectedTotal, total);
    }
}
```

---

## Act: Invoke the Method Under Test

The **Act** phase should be a single action — one method call or operation. If you need multiple actions, you probably need multiple tests.

### Python (pytest)

```python
def test_user_can_change_email():
    # Arrange
    user = User(email="old@example.com")
    new_email = "new@example.com"

    # Act
    user.change_email(new_email)

    # Assert
    assert user.email == new_email
```

### JavaScript (Jest)

```javascript
test("user can change email", () => {
  // Arrange
  const user = new User({ email: "old@example.com" });
  const newEmail = "new@example.com";

  // Act
  user.changeEmail(newEmail);

  // Assert
  expect(user.email).toBe(newEmail);
});
```

### Java (JUnit 5)

```java
@Test
void userCanChangeEmail() {
    // Arrange
    User user = new User("old@example.com");
    String newEmail = "new@example.com";

    // Act
    user.changeEmail(newEmail);

    // Assert
    assertEquals(newEmail, user.getEmail());
}
```

### C# (xUnit)

```csharp
[Fact]
public void UserCanChangeEmail()
{
    // Arrange
    var user = new User("old@example.com");
    var newEmail = "new@example.com";

    // Act
    user.ChangeEmail(newEmail);

    // Assert
    Assert.Equal(newEmail, user.Email);
}
```

---

## Assert: Verify the Outcome

The **Assert** phase checks the result. Keep assertions focused — test one logical concept per test.

### Python (pytest)

```python
def test_dividing_by_zero_raises_error():
    # Arrange
    calculator = Calculator()

    # Act & Assert (exception testing is a special case)
    with pytest.raises(ZeroDivisionError):
        calculator.divide(10, 0)


def test_password_validator_rejects_short_passwords():
    # Arrange
    validator = PasswordValidator(min_length=8)
    short_password = "abc"

    # Act
    result = validator.validate(short_password)

    # Assert
    assert result.is_valid is False
    assert "at least 8 characters" in result.error_message
```

### JavaScript (Jest)

```javascript
test("dividing by zero throws an error", () => {
  // Arrange
  const calculator = new Calculator();

  // Act & Assert
  expect(() => calculator.divide(10, 0)).toThrow("Cannot divide by zero");
});

test("password validator rejects short passwords", () => {
  // Arrange
  const validator = new PasswordValidator({ minLength: 8 });

  // Act
  const result = validator.validate("abc");

  // Assert
  expect(result.isValid).toBe(false);
  expect(result.errorMessage).toContain("at least 8 characters");
});
```

### Java (JUnit 5)

```java
@Test
void dividingByZeroThrowsException() {
    // Arrange
    Calculator calculator = new Calculator();

    // Act & Assert
    assertThrows(ArithmeticException.class, () -> {
        calculator.divide(10, 0);
    });
}

@Test
void passwordValidatorRejectsShortPasswords() {
    // Arrange
    PasswordValidator validator = new PasswordValidator(8);

    // Act
    ValidationResult result = validator.validate("abc");

    // Assert
    assertFalse(result.isValid());
    assertTrue(result.getErrorMessage().contains("at least 8 characters"));
}
```

### C# (xUnit)

```csharp
[Fact]
public void DividingByZeroThrowsException()
{
    // Arrange
    var calculator = new Calculator();

    // Act & Assert
    Assert.Throws<DivideByZeroException>(() => calculator.Divide(10, 0));
}

[Fact]
public void PasswordValidatorRejectsShortPasswords()
{
    // Arrange
    var validator = new PasswordValidator(minLength: 8);

    // Act
    var result = validator.Validate("abc");

    // Assert
    Assert.False(result.IsValid);
    Assert.Contains("at least 8 characters", result.ErrorMessage);
}
```

---

## Given-When-Then (BDD Equivalent)

**Given-When-Then** is the BDD (Behavior-Driven Development) equivalent of AAA:

| AAA       | BDD      | Purpose                          |
| --------- | -------- | -------------------------------- |
| Arrange   | Given    | The initial context              |
| Act       | When     | The event or action occurs       |
| Assert    | Then     | The expected outcome is verified |

### Python (pytest-bdd style comments)

```python
def test_loyalty_discount_applied_for_premium_members():
    # Given a premium member with a cart over $100
    member = Member(tier="premium")
    cart = ShoppingCart(owner=member)
    cart.add_item(Product("Laptop Stand", price=120.00))

    # When the discount is calculated
    discount = cart.calculate_loyalty_discount()

    # Then a 15% discount is applied
    assert discount == 18.00
```

### JavaScript (Jest)

```javascript
test("given a premium member, when cart > $100, then 15% discount applied", () => {
  // Given
  const member = new Member({ tier: "premium" });
  const cart = new ShoppingCart({ owner: member });
  cart.addItem(new Product("Laptop Stand", 120.0));

  // When
  const discount = cart.calculateLoyaltyDiscount();

  // Then
  expect(discount).toBe(18.0);
});
```

### Java (JUnit 5)

```java
@Test
@DisplayName("Given premium member, when cart > $100, then 15% discount applied")
void loyaltyDiscountAppliedForPremiumMembers() {
    // Given
    Member member = new Member(Tier.PREMIUM);
    ShoppingCart cart = new ShoppingCart(member);
    cart.addItem(new Product("Laptop Stand", 120.00));

    // When
    double discount = cart.calculateLoyaltyDiscount();

    // Then
    assertEquals(18.00, discount, 0.001);
}
```

### C# (xUnit)

```csharp
[Fact(DisplayName = "Given premium member, when cart > $100, then 15% discount applied")]
public void LoyaltyDiscountAppliedForPremiumMembers()
{
    // Given
    var member = new Member(Tier.Premium);
    var cart = new ShoppingCart(member);
    cart.AddItem(new Product("Laptop Stand", 120.00m));

    // When
    var discount = cart.CalculateLoyaltyDiscount();

    // Then
    Assert.Equal(18.00m, discount);
}
```

---

## One Concept Per Test

Each test should verify **one logical concept**. This doesn't mean one assertion — it means one behavior.

**Bad — multiple concepts in one test:**

```python
def test_user_registration():
    user = register_user("alice", "alice@example.com", "SecurePass1!")
    assert user.username == "alice"          # Concept 1: data stored
    assert user.is_active is True            # Concept 2: activation
    assert len(sent_emails) == 1             # Concept 3: email sent
    assert user.created_at is not None       # Concept 4: timestamps
```

**Good — separate tests for each concept:**

```python
def test_registration_stores_user_data():
    user = register_user("alice", "alice@example.com", "SecurePass1!")
    assert user.username == "alice"
    assert user.email == "alice@example.com"


def test_registration_activates_user_by_default():
    user = register_user("alice", "alice@example.com", "SecurePass1!")
    assert user.is_active is True


def test_registration_sends_welcome_email():
    register_user("alice", "alice@example.com", "SecurePass1!")
    assert len(sent_emails) == 1


def test_registration_sets_created_timestamp():
    user = register_user("alice", "alice@example.com", "SecurePass1!")
    assert user.created_at is not None
```

---

## Setup and Teardown

When multiple tests share the same Arrange phase, use setup/teardown hooks to avoid duplication.

### Python (pytest fixtures)

```python
import pytest
from database import Database
from user_repository import UserRepository


@pytest.fixture
def db():
    """Set up an in-memory database before each test."""
    database = Database(":memory:")
    database.create_tables()
    yield database
    database.close()


@pytest.fixture
def repo(db):
    """Provide a UserRepository backed by the test database."""
    return UserRepository(db)


def test_save_user(repo):
    # Arrange
    user = User(name="Alice", email="alice@example.com")

    # Act
    repo.save(user)

    # Assert
    assert repo.find_by_email("alice@example.com") is not None


def test_delete_user(repo):
    # Arrange
    user = User(name="Bob", email="bob@example.com")
    repo.save(user)

    # Act
    repo.delete(user.id)

    # Assert
    assert repo.find_by_email("bob@example.com") is None
```

### JavaScript (Jest)

```javascript
const { Database } = require("./database");
const { UserRepository } = require("./userRepository");

describe("UserRepository", () => {
  let db;
  let repo;

  beforeEach(() => {
    db = new Database(":memory:");
    db.createTables();
    repo = new UserRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test("saves a user", () => {
    const user = { name: "Alice", email: "alice@example.com" };

    repo.save(user);

    expect(repo.findByEmail("alice@example.com")).not.toBeNull();
  });

  test("deletes a user", () => {
    const user = { name: "Bob", email: "bob@example.com" };
    repo.save(user);

    repo.delete(user.id);

    expect(repo.findByEmail("bob@example.com")).toBeNull();
  });
});
```

### Java (JUnit 5)

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserRepositoryTest {

    private Database db;
    private UserRepository repo;

    @BeforeEach
    void setUp() {
        db = new Database(":memory:");
        db.createTables();
        repo = new UserRepository(db);
    }

    @AfterEach
    void tearDown() {
        db.close();
    }

    @Test
    void savesAUser() {
        // Arrange
        User user = new User("Alice", "alice@example.com");

        // Act
        repo.save(user);

        // Assert
        assertNotNull(repo.findByEmail("alice@example.com"));
    }

    @Test
    void deletesAUser() {
        // Arrange
        User user = new User("Bob", "bob@example.com");
        repo.save(user);

        // Act
        repo.delete(user.getId());

        // Assert
        assertNull(repo.findByEmail("bob@example.com"));
    }
}
```

### C# (xUnit)

```csharp
using Xunit;
using System;

public class UserRepositoryTests : IDisposable
{
    private readonly Database _db;
    private readonly UserRepository _repo;

    // Constructor acts as setUp (runs before each test)
    public UserRepositoryTests()
    {
        _db = new Database(":memory:");
        _db.CreateTables();
        _repo = new UserRepository(_db);
    }

    // Dispose acts as tearDown (runs after each test)
    public void Dispose()
    {
        _db.Close();
    }

    [Fact]
    public void SavesAUser()
    {
        // Arrange
        var user = new User("Alice", "alice@example.com");

        // Act
        _repo.Save(user);

        // Assert
        Assert.NotNull(_repo.FindByEmail("alice@example.com"));
    }

    [Fact]
    public void DeletesAUser()
    {
        // Arrange
        var user = new User("Bob", "bob@example.com");
        _repo.Save(user);

        // Act
        _repo.Delete(user.Id);

        // Assert
        Assert.Null(_repo.FindByEmail("bob@example.com"));
    }
}
```

---

## Summary

| Principle              | Guideline                                            |
| ---------------------- | ---------------------------------------------------- |
| **Arrange**            | Set up all preconditions clearly                     |
| **Act**                | One action — the behavior under test                 |
| **Assert**             | Verify the expected outcome                          |
| **One concept**        | Each test validates a single behavior                |
| **Given-When-Then**    | BDD naming for stakeholder-readable tests            |
| **Setup/Teardown**     | Share Arrange logic via hooks, not copy-paste        |
| **Separate phases**    | Blank lines or comments between AAA sections         |
| **Minimal Arrange**    | Only set up what this specific test needs            |

The AAA pattern isn't just a style guide — it's a communication tool. When every test follows this structure, any developer can read it and understand *what* is tested, *how* it's exercised, and *what* the expected behavior is, all in seconds.
