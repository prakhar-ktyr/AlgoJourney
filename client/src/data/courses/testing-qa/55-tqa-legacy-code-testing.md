---
title: Testing Legacy Code
---

# Testing Legacy Code

Legacy code is one of the biggest challenges in software engineering. In this lesson, we explore strategies for safely adding tests to existing codebases that were never designed with testability in mind.

## What Is Legacy Code?

Michael Feathers, in his seminal book *Working Effectively with Legacy Code*, defines legacy code simply as **code without tests**. This definition is powerful because it shifts the focus from age or technology to the fundamental issue: without tests, you cannot confidently make changes.

Legacy code characteristics:
- No automated test suite
- Unclear or missing documentation
- Original developers have moved on
- Fear of making changes (fragility)
- Long methods and large classes
- Tangled dependencies

## Challenges of Testing Legacy Code

### Tight Coupling

Legacy code often has classes that directly instantiate their dependencies, making it impossible to substitute test doubles.

### Global State

Singletons, static variables, and global configuration make tests interfere with each other and produce non-deterministic results.

### No Interfaces or Abstractions

Without interfaces, you cannot easily swap real implementations for mocks or stubs.

### Long Methods

Methods that do too many things are difficult to test in isolation because you cannot exercise one behavior without triggering others.

### Hidden Dependencies

Constructors that reach out to databases, file systems, or network services make instantiation in tests painful.

## The Sprout Method

When you need to add new functionality to a legacy system, the **sprout method** technique lets you write the new code in a fully tested method, then call it from the existing code.

Steps:
1. Identify where the change needs to happen
2. Write the new logic in a separate, tested method
3. Call the new method from the legacy code
4. The legacy code remains unchanged; the new code is fully covered

Benefits:
- New code is clean and tested
- Minimal risk to existing functionality
- Gradually improves the codebase

## The Wrap Method

The **wrap method** technique involves creating a new method that wraps the existing one, adding behavior before or after the original call.

Steps:
1. Rename the original method (e.g., `processOrder` → `processOrderOriginal`)
2. Create a new method with the original name
3. In the new method, call the original and add new tested behavior
4. Write tests for the wrapper logic

## Characterization Tests

Characterization tests capture the **current behavior** of the system, whether that behavior is correct or not. They serve as a safety net before refactoring.

Purpose:
- Document what the code actually does (not what it should do)
- Detect unintended changes during refactoring
- Build confidence to make structural changes

Process:
1. Write a test that calls the code
2. Let the test fail to see actual output
3. Update the assertion to match actual behavior
4. Repeat for different inputs and edge cases

## Seams

A **seam** is a place where you can alter behavior in your program without editing the source code at that point. Types of seams:

- **Object seams**: Override methods in subclasses for testing
- **Preprocessing seams**: Use macros or conditional compilation
- **Link seams**: Swap implementations at link time
- **Dependency injection seams**: Pass dependencies through constructors or setters

## Dependency Breaking Techniques

- **Extract Interface**: Create an interface from a concrete class
- **Extract Method**: Pull logic into a testable method
- **Parameterize Constructor**: Pass dependencies instead of creating them
- **Introduce Instance Delegator**: Replace static calls with instance methods
- **Subclass and Override**: Create a testing subclass that overrides problematic methods
- **Replace Global Reference**: Inject what was previously a global

## Code Examples

### Characterization Test + Dependency Breaking

```python
# Legacy code: tightly coupled order processor
class OrderProcessor:
    def __init__(self):
        self.db = DatabaseConnection("production_db")
        self.email_service = SmtpEmailService("smtp.company.com")

    def process_order(self, order_data):
        # Complex logic that's hard to test
        total = 0
        for item in order_data["items"]:
            price = self.db.get_price(item["sku"])
            discount = self.db.get_discount(item["sku"], order_data["customer_id"])
            total += price * item["quantity"] * (1 - discount)

        if total > 100:
            total *= 0.95  # bulk discount

        order_id = self.db.save_order(order_data["customer_id"], total)
        self.email_service.send_confirmation(order_data["email"], order_id, total)
        return order_id


# Step 1: Extract interface / use dependency injection
class OrderProcessorTestable:
    def __init__(self, db, email_service):
        self.db = db
        self.email_service = email_service

    def calculate_total(self, items, customer_id):
        """Sprout method: extracted and testable"""
        total = 0
        for item in items:
            price = self.db.get_price(item["sku"])
            discount = self.db.get_discount(item["sku"], customer_id)
            total += price * item["quantity"] * (1 - discount)

        if total > 100:
            total *= 0.95
        return total

    def process_order(self, order_data):
        total = self.calculate_total(order_data["items"], order_data["customer_id"])
        order_id = self.db.save_order(order_data["customer_id"], total)
        self.email_service.send_confirmation(order_data["email"], order_id, total)
        return order_id


# Step 2: Characterization test capturing current behavior
import unittest
from unittest.mock import Mock


class TestOrderProcessorCharacterization(unittest.TestCase):
    def setUp(self):
        self.mock_db = Mock()
        self.mock_email = Mock()
        self.processor = OrderProcessorTestable(self.mock_db, self.mock_email)

    def test_calculate_total_applies_bulk_discount_over_100(self):
        """Characterization test: documents current bulk discount behavior"""
        self.mock_db.get_price.return_value = 50.0
        self.mock_db.get_discount.return_value = 0.0

        items = [{"sku": "ITEM1", "quantity": 3}]
        total = self.processor.calculate_total(items, "CUST1")

        # 50 * 3 = 150, bulk discount: 150 * 0.95 = 142.5
        self.assertEqual(total, 142.5)

    def test_calculate_total_no_bulk_discount_under_100(self):
        """Characterization test: no discount under threshold"""
        self.mock_db.get_price.return_value = 30.0
        self.mock_db.get_discount.return_value = 0.0

        items = [{"sku": "ITEM1", "quantity": 2}]
        total = self.processor.calculate_total(items, "CUST1")

        # 30 * 2 = 60, no bulk discount
        self.assertEqual(total, 60.0)

    def test_process_order_sends_email_with_correct_total(self):
        """Characterization test: email receives calculated total"""
        self.mock_db.get_price.return_value = 25.0
        self.mock_db.get_discount.return_value = 0.1
        self.mock_db.save_order.return_value = "ORD-123"

        order_data = {
            "items": [{"sku": "A", "quantity": 2}],
            "customer_id": "C1",
            "email": "user@example.com",
        }

        result = self.processor.process_order(order_data)

        self.assertEqual(result, "ORD-123")
        self.mock_email.send_confirmation.assert_called_once_with(
            "user@example.com", "ORD-123", 45.0
        )


if __name__ == "__main__":
    unittest.main()
```

```javascript
// Legacy code: tightly coupled notification service
class NotificationService {
  constructor() {
    this.db = new ProductionDatabase();
    this.smsGateway = new TwilioGateway(process.env.TWILIO_KEY);
  }

  async notifyUsers(eventType, payload) {
    const users = await this.db.getUsersForEvent(eventType);
    const results = [];
    for (const user of users) {
      if (user.preferences[eventType] === "sms") {
        await this.smsGateway.send(user.phone, payload.message);
        results.push({ userId: user.id, channel: "sms", sent: true });
      } else {
        results.push({ userId: user.id, channel: "none", sent: false });
      }
    }
    await this.db.logNotifications(results);
    return results;
  }
}

// Step 1: Break dependency - parameterize constructor
class NotificationServiceTestable {
  constructor(db, smsGateway) {
    this.db = db;
    this.smsGateway = smsGateway;
  }

  // Sprout method: extracted filtering logic
  filterUsersForSms(users, eventType) {
    return users.filter((u) => u.preferences[eventType] === "sms");
  }

  async notifyUsers(eventType, payload) {
    const users = await this.db.getUsersForEvent(eventType);
    const smsUsers = this.filterUsersForSms(users, eventType);
    const results = [];

    for (const user of smsUsers) {
      await this.smsGateway.send(user.phone, payload.message);
      results.push({ userId: user.id, channel: "sms", sent: true });
    }

    const skippedUsers = users.filter((u) => !smsUsers.includes(u));
    for (const user of skippedUsers) {
      results.push({ userId: user.id, channel: "none", sent: false });
    }

    await this.db.logNotifications(results);
    return results;
  }
}

// Step 2: Characterization tests
const { describe, it, expect, vi } = await import("vitest");

describe("NotificationServiceTestable - Characterization", () => {
  function createMocks() {
    return {
      db: {
        getUsersForEvent: vi.fn(),
        logNotifications: vi.fn(),
      },
      smsGateway: { send: vi.fn() },
    };
  }

  it("sends SMS to users with sms preference", async () => {
    const { db, smsGateway } = createMocks();
    const service = new NotificationServiceTestable(db, smsGateway);

    db.getUsersForEvent.mockResolvedValue([
      { id: "u1", phone: "+1234", preferences: { alert: "sms" } },
      { id: "u2", phone: "+5678", preferences: { alert: "email" } },
    ]);
    db.logNotifications.mockResolvedValue(undefined);
    smsGateway.send.mockResolvedValue(undefined);

    const results = await service.notifyUsers("alert", {
      message: "Server down",
    });

    expect(smsGateway.send).toHaveBeenCalledWith("+1234", "Server down");
    expect(smsGateway.send).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      { userId: "u1", channel: "sms", sent: true },
      { userId: "u2", channel: "none", sent: false },
    ]);
  });

  it("filterUsersForSms returns only sms-opted users", () => {
    const { db, smsGateway } = createMocks();
    const service = new NotificationServiceTestable(db, smsGateway);

    const users = [
      { id: "1", preferences: { promo: "sms" } },
      { id: "2", preferences: { promo: "email" } },
      { id: "3", preferences: { promo: "sms" } },
    ];

    const result = service.filterUsersForSms(users, "promo");
    expect(result.map((u) => u.id)).toEqual(["1", "3"]);
  });

  it("logs all notification results to database", async () => {
    const { db, smsGateway } = createMocks();
    const service = new NotificationServiceTestable(db, smsGateway);

    db.getUsersForEvent.mockResolvedValue([
      { id: "u1", phone: "+111", preferences: { update: "sms" } },
    ]);
    db.logNotifications.mockResolvedValue(undefined);
    smsGateway.send.mockResolvedValue(undefined);

    await service.notifyUsers("update", { message: "New version" });

    expect(db.logNotifications).toHaveBeenCalledWith([
      { userId: "u1", channel: "sms", sent: true },
    ]);
  });
});
```

```java
// Legacy code: tightly coupled report generator
public class ReportGenerator {
    private DatabaseConnection db = new DatabaseConnection("jdbc:prod/reports");
    private PdfRenderer renderer = new PdfRenderer();

    public byte[] generateMonthlyReport(int month, int year) {
        List<SalesRecord> records = db.querySales(month, year);
        double total = 0;
        double tax = 0;
        for (SalesRecord record : records) {
            total += record.getAmount();
            tax += record.getAmount() * 0.08;
        }
        Map<String, Object> data = new HashMap<>();
        data.put("total", total);
        data.put("tax", tax);
        data.put("records", records);
        data.put("period", month + "/" + year);
        return renderer.render("monthly_template", data);
    }
}

// Step 1: Break dependencies - extract interface + parameterize
public interface SalesDataSource {
    List<SalesRecord> querySales(int month, int year);
}

public interface ReportRenderer {
    byte[] render(String template, Map<String, Object> data);
}

// Step 2: Refactored with dependency injection and sprout method
public class ReportGeneratorTestable {
    private final SalesDataSource dataSource;
    private final ReportRenderer renderer;
    private static final double TAX_RATE = 0.08;

    public ReportGeneratorTestable(SalesDataSource dataSource, ReportRenderer renderer) {
        this.dataSource = dataSource;
        this.renderer = renderer;
    }

    // Sprout method: testable calculation logic
    public ReportSummary calculateSummary(List<SalesRecord> records) {
        double total = 0;
        double tax = 0;
        for (SalesRecord record : records) {
            total += record.getAmount();
            tax += record.getAmount() * TAX_RATE;
        }
        return new ReportSummary(total, tax);
    }

    public byte[] generateMonthlyReport(int month, int year) {
        List<SalesRecord> records = dataSource.querySales(month, year);
        ReportSummary summary = calculateSummary(records);

        Map<String, Object> data = new HashMap<>();
        data.put("total", summary.getTotal());
        data.put("tax", summary.getTax());
        data.put("records", records);
        data.put("period", month + "/" + year);
        return renderer.render("monthly_template", data);
    }
}

// Step 3: Characterization tests with Mockito
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReportGeneratorCharacterizationTest {
    private SalesDataSource mockDataSource;
    private ReportRenderer mockRenderer;
    private ReportGeneratorTestable generator;

    @BeforeEach
    void setUp() {
        mockDataSource = mock(SalesDataSource.class);
        mockRenderer = mock(ReportRenderer.class);
        generator = new ReportGeneratorTestable(mockDataSource, mockRenderer);
    }

    @Test
    void calculateSummary_computesTotalAndTax() {
        // Characterization: captures the 8% tax calculation behavior
        List<SalesRecord> records = List.of(
            new SalesRecord("item1", 100.0),
            new SalesRecord("item2", 50.0)
        );

        ReportSummary summary = generator.calculateSummary(records);

        assertEquals(150.0, summary.getTotal(), 0.001);
        assertEquals(12.0, summary.getTax(), 0.001); // 150 * 0.08
    }

    @Test
    void calculateSummary_emptyRecords_returnsZeros() {
        ReportSummary summary = generator.calculateSummary(List.of());

        assertEquals(0.0, summary.getTotal(), 0.001);
        assertEquals(0.0, summary.getTax(), 0.001);
    }

    @Test
    void generateMonthlyReport_passesCorrectDataToRenderer() {
        List<SalesRecord> records = List.of(new SalesRecord("x", 200.0));
        when(mockDataSource.querySales(3, 2024)).thenReturn(records);
        when(mockRenderer.render(anyString(), anyMap())).thenReturn(new byte[]{1, 2, 3});

        byte[] result = generator.generateMonthlyReport(3, 2024);

        assertNotNull(result);
        verify(mockRenderer).render(eq("monthly_template"), argThat(map ->
            map.get("total").equals(200.0) &&
            map.get("tax").equals(16.0) &&
            map.get("period").equals("3/2024")
        ));
    }
}
```

```csharp
// Legacy code: tightly coupled user registration
public class UserRegistration
{
    public bool Register(string email, string password, string name)
    {
        var db = new SqlDatabase("Server=prod;Database=users");
        var hasher = new BcryptHasher();
        var mailer = new SmtpMailer("smtp.company.com", 587);

        if (db.UserExists(email))
            return false;

        string hashed = hasher.Hash(password);
        db.InsertUser(email, hashed, name);
        mailer.SendWelcome(email, name);
        return true;
    }
}

// Step 1: Define interfaces (seams for testing)
public interface IUserDatabase
{
    bool UserExists(string email);
    void InsertUser(string email, string hashedPassword, string name);
}

public interface IPasswordHasher
{
    string Hash(string password);
}

public interface IMailer
{
    void SendWelcome(string email, string name);
}

// Step 2: Refactored with dependency injection
public class UserRegistrationTestable
{
    private readonly IUserDatabase _db;
    private readonly IPasswordHasher _hasher;
    private readonly IMailer _mailer;

    public UserRegistrationTestable(IUserDatabase db, IPasswordHasher hasher, IMailer mailer)
    {
        _db = db;
        _hasher = hasher;
        _mailer = mailer;
    }

    // Sprout method: validation logic extracted and testable
    public ValidationResult ValidateRegistration(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            return ValidationResult.Invalid("Invalid email format");
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return ValidationResult.Invalid("Password must be at least 8 characters");
        if (_db.UserExists(email))
            return ValidationResult.Invalid("User already exists");
        return ValidationResult.Valid();
    }

    public bool Register(string email, string password, string name)
    {
        var validation = ValidateRegistration(email, password);
        if (!validation.IsValid)
            return false;

        string hashed = _hasher.Hash(password);
        _db.InsertUser(email, hashed, name);
        _mailer.SendWelcome(email, name);
        return true;
    }
}

// Step 3: Characterization tests with Moq
using Xunit;
using Moq;

public class UserRegistrationCharacterizationTests
{
    private readonly Mock<IUserDatabase> _mockDb;
    private readonly Mock<IPasswordHasher> _mockHasher;
    private readonly Mock<IMailer> _mockMailer;
    private readonly UserRegistrationTestable _registration;

    public UserRegistrationCharacterizationTests()
    {
        _mockDb = new Mock<IUserDatabase>();
        _mockHasher = new Mock<IPasswordHasher>();
        _mockMailer = new Mock<IMailer>();
        _registration = new UserRegistrationTestable(
            _mockDb.Object, _mockHasher.Object, _mockMailer.Object);
    }

    [Fact]
    public void Register_ExistingUser_ReturnsFalse()
    {
        // Characterization: existing behavior returns false for duplicates
        _mockDb.Setup(d => d.UserExists("taken@example.com")).Returns(true);

        bool result = _registration.Register("taken@example.com", "password123", "John");

        Assert.False(result);
        _mockDb.Verify(d => d.InsertUser(It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public void Register_NewUser_HashesPasswordAndSendsEmail()
    {
        // Characterization: captures the registration flow
        _mockDb.Setup(d => d.UserExists("new@example.com")).Returns(false);
        _mockHasher.Setup(h => h.Hash("securePass1")).Returns("hashed_value");

        bool result = _registration.Register("new@example.com", "securePass1", "Jane");

        Assert.True(result);
        _mockDb.Verify(d => d.InsertUser("new@example.com", "hashed_value", "Jane"));
        _mockMailer.Verify(m => m.SendWelcome("new@example.com", "Jane"));
    }

    [Theory]
    [InlineData("", "password123", "Invalid email format")]
    [InlineData("bademail", "password123", "Invalid email format")]
    [InlineData("good@email.com", "short", "Password must be at least 8 characters")]
    public void ValidateRegistration_InvalidInput_ReturnsError(
        string email, string password, string expectedError)
    {
        var result = _registration.ValidateRegistration(email, password);

        Assert.False(result.IsValid);
        Assert.Equal(expectedError, result.ErrorMessage);
    }

    [Fact]
    public void ValidateRegistration_ValidNewUser_ReturnsValid()
    {
        _mockDb.Setup(d => d.UserExists("new@test.com")).Returns(false);

        var result = _registration.ValidateRegistration("new@test.com", "strongPassword1");

        Assert.True(result.IsValid);
    }
}
```

## Summary

Testing legacy code requires patience, discipline, and a toolkit of techniques:

| Technique | When to Use |
|-----------|-------------|
| Sprout Method | Adding new functionality |
| Wrap Method | Adding behavior around existing code |
| Characterization Tests | Before any refactoring |
| Seams | Finding places to inject test doubles |
| Dependency Breaking | Making code instantiable in tests |

The key principle: **never refactor without tests, and never add tests without understanding the current behavior first**. Characterization tests give you a safety net; dependency breaking techniques give you the ability to write focused unit tests. Together, they transform untestable legacy code into a maintainable, well-tested system.
