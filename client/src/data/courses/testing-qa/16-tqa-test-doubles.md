---
title: Test Doubles Deep Dive
---

# Test Doubles Deep Dive

"Test double" is the generic term for any object that stands in for a real dependency during testing. Just as a stunt double replaces an actor in dangerous scenes, a test double replaces a real collaborator so you can test in isolation. This lesson explores all five types, when to use each, and how dependency injection makes it all possible.

---

## The Five Types of Test Doubles

| Type      | Purpose                                | Has Logic? | Verifies Calls? |
| --------- | -------------------------------------- | ---------- | --------------- |
| **Dummy** | Fills a parameter slot, never used     | No         | No              |
| **Fake**  | Working implementation (simplified)    | Yes        | No              |
| **Stub**  | Returns predetermined responses        | Minimal    | No              |
| **Mock**  | Records calls, verifies expectations   | No         | Yes             |
| **Spy**   | Wraps real object, records calls       | Yes (real) | Yes             |

---

## Dummy Objects

A dummy is passed around but never actually used. It satisfies a type requirement when the test doesn't care about that parameter.

### Python

```python
def test_report_generator_produces_pdf():
    # Arrange — logger is required but not relevant to this test
    dummy_logger = None  # Or a no-op object
    generator = ReportGenerator(logger=dummy_logger)
    data = [{"month": "Jan", "revenue": 5000}]

    # Act
    pdf = generator.generate_pdf(data)

    # Assert
    assert pdf.page_count == 1
```

### JavaScript

```javascript
test("report generator produces PDF", () => {
  // Arrange — logger is required but irrelevant
  const dummyLogger = {};
  const generator = new ReportGenerator(dummyLogger);
  const data = [{ month: "Jan", revenue: 5000 }];

  // Act
  const pdf = generator.generatePdf(data);

  // Assert
  expect(pdf.pageCount).toBe(1);
});
```

### Java

```java
@Test
void reportGeneratorProducesPdf() {
    // Arrange — logger is required but not used in this test path
    Logger dummyLogger = null;
    ReportGenerator generator = new ReportGenerator(dummyLogger);
    List<MonthlyData> data = List.of(new MonthlyData("Jan", 5000));

    // Act
    PdfDocument pdf = generator.generatePdf(data);

    // Assert
    assertEquals(1, pdf.getPageCount());
}
```

### C#

```csharp
[Fact]
public void ReportGeneratorProducesPdf()
{
    // Arrange — logger is required but irrelevant
    ILogger dummyLogger = null;
    var generator = new ReportGenerator(dummyLogger);
    var data = new[] { new MonthlyData("Jan", 5000) };

    // Act
    var pdf = generator.GeneratePdf(data);

    // Assert
    Assert.Equal(1, pdf.PageCount);
}
```

---

## Fake Objects

A fake has a working implementation but takes shortcuts that make it unsuitable for production. Common examples: in-memory database, local file system instead of cloud storage.

### Python

```python
class FakeUserRepository:
    """In-memory implementation for testing — no real database."""

    def __init__(self):
        self._users = {}
        self._next_id = 1

    def save(self, user):
        user.id = self._next_id
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def find_by_id(self, user_id):
        return self._users.get(user_id)

    def find_by_email(self, email):
        return next(
            (u for u in self._users.values() if u.email == email), None
        )

    def delete(self, user_id):
        self._users.pop(user_id, None)


def test_user_service_creates_and_retrieves_user():
    # Arrange
    fake_repo = FakeUserRepository()
    service = UserService(repository=fake_repo)

    # Act
    service.create_user("Alice", "alice@example.com")
    user = service.get_user_by_email("alice@example.com")

    # Assert
    assert user.name == "Alice"
    assert user.id == 1
```

### JavaScript

```javascript
class FakeUserRepository {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }

  save(user) {
    user.id = this.nextId++;
    this.users.set(user.id, { ...user });
    return user;
  }

  findById(id) {
    return this.users.get(id) || null;
  }

  findByEmail(email) {
    return [...this.users.values()].find((u) => u.email === email) || null;
  }

  delete(id) {
    this.users.delete(id);
  }
}

test("user service creates and retrieves user", () => {
  // Arrange
  const fakeRepo = new FakeUserRepository();
  const service = new UserService(fakeRepo);

  // Act
  service.createUser("Alice", "alice@example.com");
  const user = service.getUserByEmail("alice@example.com");

  // Assert
  expect(user.name).toBe("Alice");
  expect(user.id).toBe(1);
});
```

### Java

```java
public class FakeUserRepository implements UserRepository {
    private final Map<Long, User> users = new HashMap<>();
    private long nextId = 1;

    @Override
    public User save(User user) {
        user.setId(nextId++);
        users.put(user.getId(), user);
        return user;
    }

    @Override
    public User findById(Long id) {
        return users.get(id);
    }

    @Override
    public User findByEmail(String email) {
        return users.values().stream()
            .filter(u -> u.getEmail().equals(email))
            .findFirst()
            .orElse(null);
    }

    @Override
    public void delete(Long id) {
        users.remove(id);
    }
}

@Test
void userServiceCreatesAndRetrievesUser() {
    // Arrange
    FakeUserRepository fakeRepo = new FakeUserRepository();
    UserService service = new UserService(fakeRepo);

    // Act
    service.createUser("Alice", "alice@example.com");
    User user = service.getUserByEmail("alice@example.com");

    // Assert
    assertEquals("Alice", user.getName());
    assertEquals(1L, user.getId());
}
```

### C#

```csharp
public class FakeUserRepository : IUserRepository
{
    private readonly Dictionary<int, User> _users = new();
    private int _nextId = 1;

    public User Save(User user)
    {
        user.Id = _nextId++;
        _users[user.Id] = user;
        return user;
    }

    public User FindById(int id) =>
        _users.GetValueOrDefault(id);

    public User FindByEmail(string email) =>
        _users.Values.FirstOrDefault(u => u.Email == email);

    public void Delete(int id) =>
        _users.Remove(id);
}

[Fact]
public void UserServiceCreatesAndRetrievesUser()
{
    // Arrange
    var fakeRepo = new FakeUserRepository();
    var service = new UserService(fakeRepo);

    // Act
    service.CreateUser("Alice", "alice@example.com");
    var user = service.GetUserByEmail("alice@example.com");

    // Assert
    Assert.Equal("Alice", user.Name);
    Assert.Equal(1, user.Id);
}
```

---

## When to Use Each Type

| Situation                                      | Use          |
| ---------------------------------------------- | ------------ |
| Parameter needed but not exercised             | **Dummy**    |
| Need a working but lightweight implementation  | **Fake**     |
| Need to control what a dependency returns      | **Stub**     |
| Need to verify a method was called correctly   | **Mock**     |
| Need to verify calls while keeping real logic  | **Spy**      |

---

## Dependency Injection for Testability

Test doubles only work if you can **inject** them. Hard-coded dependencies (`new Database()` inside a class) make mocking impossible.

### The Problem: Hard-Coded Dependencies

```python
# BAD — impossible to test without a real database
class OrderService:
    def __init__(self):
        self.db = PostgresDatabase("prod_connection_string")  # Hard-coded!

    def get_order(self, order_id):
        return self.db.query("SELECT * FROM orders WHERE id = %s", order_id)
```

```javascript
// BAD — tightly coupled to real HTTP client
class WeatherService {
  async getTemperature(city) {
    const response = await fetch(`https://api.weather.com/${city}`); // Hard-coded!
    return response.json();
  }
}
```

### The Solution: Constructor Injection

Pass dependencies through the constructor so tests can substitute them.

### Python — Constructor Injection

```python
class OrderService:
    def __init__(self, repository, notifier):
        self._repository = repository
        self._notifier = notifier

    def place_order(self, items):
        order = Order(items=items)
        saved = self._repository.save(order)
        self._notifier.send_confirmation(saved.id)
        return saved


# Production
service = OrderService(
    repository=PostgresOrderRepository(connection),
    notifier=EmailNotifier(smtp_client),
)

# Test
service = OrderService(
    repository=FakeOrderRepository(),
    notifier=MagicMock(),
)
```

### JavaScript — Constructor Injection

```javascript
class OrderService {
  constructor(repository, notifier) {
    this.repository = repository;
    this.notifier = notifier;
  }

  placeOrder(items) {
    const order = new Order(items);
    const saved = this.repository.save(order);
    this.notifier.sendConfirmation(saved.id);
    return saved;
  }
}

// Production
const service = new OrderService(
  new PostgresOrderRepository(pool),
  new EmailNotifier(smtpClient),
);

// Test
const service = new OrderService(
  new FakeOrderRepository(),
  { sendConfirmation: jest.fn() },
);
```

### Java — Constructor Injection

```java
public class OrderService {
    private final OrderRepository repository;
    private final Notifier notifier;

    // Dependencies injected via constructor
    public OrderService(OrderRepository repository, Notifier notifier) {
        this.repository = repository;
        this.notifier = notifier;
    }

    public Order placeOrder(List<LineItem> items) {
        Order order = new Order(items);
        Order saved = repository.save(order);
        notifier.sendConfirmation(saved.getId());
        return saved;
    }
}

// Test
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository repository;
    @Mock Notifier notifier;
    @InjectMocks OrderService service;
}
```

### C# — Constructor Injection

```csharp
public class OrderService
{
    private readonly IOrderRepository _repository;
    private readonly INotifier _notifier;

    public OrderService(IOrderRepository repository, INotifier notifier)
    {
        _repository = repository;
        _notifier = notifier;
    }

    public Order PlaceOrder(IEnumerable<LineItem> items)
    {
        var order = new Order(items);
        var saved = _repository.Save(order);
        _notifier.SendConfirmation(saved.Id);
        return saved;
    }
}

// Test
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _mockRepo = new();
    private readonly Mock<INotifier> _mockNotifier = new();
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _service = new OrderService(_mockRepo.Object, _mockNotifier.Object);
    }
}
```

---

## Interface-Based Mocking

Define contracts (interfaces/protocols) for dependencies. This makes substitution natural and type-safe.

### Python (Protocol)

```python
from typing import Protocol


class EmailSender(Protocol):
    def send(self, to: str, subject: str, body: str) -> bool: ...


class SmtpEmailSender:
    """Production implementation."""

    def send(self, to: str, subject: str, body: str) -> bool:
        # Real SMTP logic
        return True


class FakeEmailSender:
    """Test implementation — records sent emails."""

    def __init__(self):
        self.sent_emails = []

    def send(self, to: str, subject: str, body: str) -> bool:
        self.sent_emails.append({"to": to, "subject": subject, "body": body})
        return True


def test_registration_sends_welcome_email():
    # Arrange
    fake_sender = FakeEmailSender()
    service = RegistrationService(email_sender=fake_sender)

    # Act
    service.register("alice@example.com", "password123")

    # Assert
    assert len(fake_sender.sent_emails) == 1
    assert fake_sender.sent_emails[0]["to"] == "alice@example.com"
    assert "Welcome" in fake_sender.sent_emails[0]["subject"]
```

### JavaScript (Duck typing)

```javascript
// Interface defined by convention (or JSDoc/TypeScript)
// Any object with a `send(to, subject, body)` method qualifies

class FakeEmailSender {
  constructor() {
    this.sentEmails = [];
  }

  send(to, subject, body) {
    this.sentEmails.push({ to, subject, body });
    return true;
  }
}

test("registration sends welcome email", () => {
  // Arrange
  const fakeSender = new FakeEmailSender();
  const service = new RegistrationService(fakeSender);

  // Act
  service.register("alice@example.com", "password123");

  // Assert
  expect(fakeSender.sentEmails).toHaveLength(1);
  expect(fakeSender.sentEmails[0].to).toBe("alice@example.com");
  expect(fakeSender.sentEmails[0].subject).toContain("Welcome");
});
```

### Java (Interface)

```java
public interface EmailSender {
    boolean send(String to, String subject, String body);
}

public class SmtpEmailSender implements EmailSender {
    @Override
    public boolean send(String to, String subject, String body) {
        // Real SMTP logic
        return true;
    }
}

public class FakeEmailSender implements EmailSender {
    private final List<Email> sentEmails = new ArrayList<>();

    @Override
    public boolean send(String to, String subject, String body) {
        sentEmails.add(new Email(to, subject, body));
        return true;
    }

    public List<Email> getSentEmails() {
        return Collections.unmodifiableList(sentEmails);
    }
}

@Test
void registrationSendsWelcomeEmail() {
    // Arrange
    FakeEmailSender fakeSender = new FakeEmailSender();
    RegistrationService service = new RegistrationService(fakeSender);

    // Act
    service.register("alice@example.com", "password123");

    // Assert
    assertEquals(1, fakeSender.getSentEmails().size());
    assertEquals("alice@example.com", fakeSender.getSentEmails().get(0).getTo());
    assertTrue(fakeSender.getSentEmails().get(0).getSubject().contains("Welcome"));
}
```

### C# (Interface)

```csharp
public interface IEmailSender
{
    bool Send(string to, string subject, string body);
}

public class SmtpEmailSender : IEmailSender
{
    public bool Send(string to, string subject, string body)
    {
        // Real SMTP logic
        return true;
    }
}

public class FakeEmailSender : IEmailSender
{
    public List<(string To, string Subject, string Body)> SentEmails { get; } = new();

    public bool Send(string to, string subject, string body)
    {
        SentEmails.Add((to, subject, body));
        return true;
    }
}

[Fact]
public void RegistrationSendsWelcomeEmail()
{
    // Arrange
    var fakeSender = new FakeEmailSender();
    var service = new RegistrationService(fakeSender);

    // Act
    service.Register("alice@example.com", "password123");

    // Assert
    Assert.Single(fakeSender.SentEmails);
    Assert.Equal("alice@example.com", fakeSender.SentEmails[0].To);
    Assert.Contains("Welcome", fakeSender.SentEmails[0].Subject);
}
```

---

## The Over-Mocking Antipattern

Over-mocking occurs when tests mock too many things, coupling the test to implementation details rather than behavior.

### Signs of Over-Mocking

1. **Tests break when you refactor** (without changing behavior)
2. **Mocking your own classes** (not external boundaries)
3. **Verifying internal method calls** between your own objects
4. **Mock chains**: `when(a.getB().getC().doThing())...`
5. **Tests mirror implementation** step-by-step

### Bad: Over-Mocked Test

```python
# BAD — mocking internal collaborators, testing implementation not behavior
def test_place_order_over_mocked():
    mock_validator = MagicMock()
    mock_validator.validate.return_value = True
    mock_calculator = MagicMock()
    mock_calculator.calculate_total.return_value = 100.00
    mock_formatter = MagicMock()
    mock_formatter.format_receipt.return_value = "Receipt #1"
    mock_repo = MagicMock()

    service = OrderService(mock_validator, mock_calculator, mock_formatter, mock_repo)
    service.place_order(items=[{"sku": "ABC", "qty": 1}])

    # Verifying every internal step — brittle!
    mock_validator.validate.assert_called_once()
    mock_calculator.calculate_total.assert_called_once()
    mock_formatter.format_receipt.assert_called_once()
    mock_repo.save.assert_called_once()
```

### Good: Mock Only at Boundaries

```python
# GOOD — mock external dependencies, verify observable behavior
def test_place_order_correctly():
    # Only mock the things that cross system boundaries
    fake_repo = FakeOrderRepository()
    mock_email = MagicMock()
    service = OrderService(repository=fake_repo, email_sender=mock_email)

    # Act
    order = service.place_order(items=[{"sku": "ABC", "qty": 1, "price": 100}])

    # Assert observable outcomes
    assert order.total == 100.00
    assert fake_repo.find_by_id(order.id) is not None
    mock_email.send_confirmation.assert_called_once_with(order.id)
```

### Guidelines to Avoid Over-Mocking

| Do                                                | Don't                                           |
| ------------------------------------------------- | ----------------------------------------------- |
| Mock I/O boundaries (DB, network, file system)    | Mock value objects or data structures            |
| Mock third-party libraries you don't control      | Mock your own utility classes                    |
| Verify observable outcomes (return values, state) | Verify internal method call sequences            |
| Use fakes for complex collaborators               | Create mocks for every single dependency         |
| Test behavior, not implementation                 | Assert how many times internal methods ran        |

---

## Full Example: DI + Test Doubles Together

Here's a complete example showing constructor injection with appropriate test doubles.

### Python

```python
from typing import Protocol
from unittest.mock import MagicMock


class PaymentGateway(Protocol):
    def charge(self, amount: float, token: str) -> dict: ...


class InventoryService(Protocol):
    def reserve(self, sku: str, quantity: int) -> bool: ...


class CheckoutService:
    def __init__(self, payments: PaymentGateway, inventory: InventoryService):
        self._payments = payments
        self._inventory = inventory

    def checkout(self, cart):
        for item in cart.items:
            if not self._inventory.reserve(item.sku, item.quantity):
                raise OutOfStockError(f"{item.sku} is out of stock")

        result = self._payments.charge(cart.total, cart.payment_token)
        if result["status"] != "approved":
            raise PaymentError("Payment declined")
        return Order(items=cart.items, total=cart.total)


# --- Tests ---

class FakeInventoryService:
    """Fake: always has stock (simplified real behavior)."""

    def __init__(self):
        self.reserved = []

    def reserve(self, sku, quantity):
        self.reserved.append((sku, quantity))
        return True


def test_checkout_charges_payment_and_reserves_inventory():
    # Arrange
    fake_inventory = FakeInventoryService()
    mock_payments = MagicMock()
    mock_payments.charge.return_value = {"status": "approved", "id": "txn_1"}

    service = CheckoutService(payments=mock_payments, inventory=fake_inventory)
    cart = Cart(
        items=[CartItem(sku="WIDGET", quantity=2)],
        total=49.99,
        payment_token="tok_test",
    )

    # Act
    order = service.checkout(cart)

    # Assert
    assert order.total == 49.99
    assert ("WIDGET", 2) in fake_inventory.reserved
    mock_payments.charge.assert_called_once_with(49.99, "tok_test")
```

### JavaScript

```javascript
class FakeInventoryService {
  constructor() {
    this.reserved = [];
  }

  reserve(sku, quantity) {
    this.reserved.push({ sku, quantity });
    return true;
  }
}

describe("CheckoutService", () => {
  test("charges payment and reserves inventory", () => {
    // Arrange
    const fakeInventory = new FakeInventoryService();
    const mockPayments = {
      charge: jest.fn().mockReturnValue({ status: "approved", id: "txn_1" }),
    };
    const service = new CheckoutService(mockPayments, fakeInventory);
    const cart = {
      items: [{ sku: "WIDGET", quantity: 2 }],
      total: 49.99,
      paymentToken: "tok_test",
    };

    // Act
    const order = service.checkout(cart);

    // Assert
    expect(order.total).toBe(49.99);
    expect(fakeInventory.reserved).toContainEqual({ sku: "WIDGET", quantity: 2 });
    expect(mockPayments.charge).toHaveBeenCalledWith(49.99, "tok_test");
  });
});
```

### Java

```java
public class FakeInventoryService implements InventoryService {
    private final List<ReservationRecord> reserved = new ArrayList<>();

    @Override
    public boolean reserve(String sku, int quantity) {
        reserved.add(new ReservationRecord(sku, quantity));
        return true;
    }

    public List<ReservationRecord> getReserved() {
        return Collections.unmodifiableList(reserved);
    }
}

@ExtendWith(MockitoExtension.class)
class CheckoutServiceTest {

    @Mock
    private PaymentGateway payments;

    private FakeInventoryService fakeInventory;
    private CheckoutService service;

    @BeforeEach
    void setUp() {
        fakeInventory = new FakeInventoryService();
        service = new CheckoutService(payments, fakeInventory);
    }

    @Test
    void chargesPaymentAndReservesInventory() {
        // Arrange
        when(payments.charge(anyDouble(), anyString()))
            .thenReturn(new ChargeResult("approved", "txn_1"));
        Cart cart = new Cart(
            List.of(new CartItem("WIDGET", 2)),
            49.99,
            "tok_test"
        );

        // Act
        Order order = service.checkout(cart);

        // Assert
        assertEquals(49.99, order.getTotal(), 0.001);
        assertEquals(1, fakeInventory.getReserved().size());
        assertEquals("WIDGET", fakeInventory.getReserved().get(0).getSku());
        verify(payments).charge(49.99, "tok_test");
    }
}
```

### C#

```csharp
public class FakeInventoryService : IInventoryService
{
    public List<(string Sku, int Quantity)> Reserved { get; } = new();

    public bool Reserve(string sku, int quantity)
    {
        Reserved.Add((sku, quantity));
        return true;
    }
}

public class CheckoutServiceTests
{
    private readonly Mock<IPaymentGateway> _mockPayments = new();
    private readonly FakeInventoryService _fakeInventory = new();
    private readonly CheckoutService _service;

    public CheckoutServiceTests()
    {
        _service = new CheckoutService(_mockPayments.Object, _fakeInventory);
    }

    [Fact]
    public void ChargesPaymentAndReservesInventory()
    {
        // Arrange
        _mockPayments
            .Setup(p => p.Charge(It.IsAny<decimal>(), It.IsAny<string>()))
            .Returns(new ChargeResult("approved", "txn_1"));
        var cart = new Cart(
            new[] { new CartItem("WIDGET", 2) },
            total: 49.99m,
            paymentToken: "tok_test"
        );

        // Act
        var order = _service.Checkout(cart);

        // Assert
        Assert.Equal(49.99m, order.Total);
        Assert.Contains(("WIDGET", 2), _fakeInventory.Reserved);
        _mockPayments.Verify(p => p.Charge(49.99m, "tok_test"), Times.Once);
    }
}
```

---

## Summary

| Concept                   | Key Takeaway                                              |
| ------------------------- | --------------------------------------------------------- |
| **Dummy**                 | Placeholder — satisfies the type, never called            |
| **Fake**                  | Lightweight working implementation for tests              |
| **Stub**                  | Canned responses to drive the code under test             |
| **Mock**                  | Verifies interactions happened as expected                |
| **Spy**                   | Observes real behavior while recording calls              |
| **Dependency Injection**  | The enabler — pass dependencies in, don't hard-code them  |
| **Interface-based**       | Define contracts so any implementation can be swapped     |
| **Avoid over-mocking**   | Mock boundaries, not internals; test behavior, not steps  |

The key insight: **test doubles are not just about isolation — they're about design**. Code that's easy to test with doubles is inherently well-designed: it has clear boundaries, single responsibilities, and explicit dependencies.
