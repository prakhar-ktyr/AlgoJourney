---
title: Mocking, Stubbing & Spying
---

# Mocking, Stubbing & Spying

When unit testing, you need to **isolate** the code under test from its external dependencies — databases, APIs, file systems, and other services. Mocking, stubbing, and spying are techniques that replace real dependencies with controlled stand-ins so you can test behavior in isolation.

---

## Why Mock: Isolating Units from Dependencies

Real dependencies introduce problems in tests:

| Problem              | Example                                          |
| -------------------- | ------------------------------------------------ |
| **Slow**             | Network calls take 100ms+, DB queries add lag    |
| **Non-deterministic**| APIs return different data, clocks change         |
| **Hard to trigger**  | How do you test "server returns 500"?            |
| **Side effects**     | Sending real emails, charging credit cards        |
| **Unavailable**      | Third-party service is down or rate-limited       |

Mocking solves all of these by replacing real objects with predictable, controllable substitutes.

---

## Mock vs Stub vs Spy — Definitions

| Term     | Purpose                                      | Verifies Behavior? |
| -------- | -------------------------------------------- | ------------------- |
| **Stub** | Returns predetermined data                   | No                  |
| **Mock** | Records calls; verifies interactions         | Yes                 |
| **Spy**  | Wraps real object; records + delegates       | Yes (partially)     |

- A **stub** answers questions: "When called, return this."
- A **mock** enforces expectations: "This method must be called with these args."
- A **spy** observes real behavior: "The real method ran — here's what happened."

---

## Mocking Frameworks

| Language | Framework            | Key API                        |
| -------- | -------------------- | ------------------------------ |
| Python   | `unittest.mock`      | `patch()`, `MagicMock`         |
| JS       | Jest built-in        | `jest.fn()`, `jest.spyOn()`    |
| Java     | Mockito              | `mock()`, `when()`, `verify()` |
| C#       | Moq                  | `Mock<T>`, `Setup()`, `Verify()` |

---

## Mock a Database Call

### Scenario

A `UserService` depends on a `UserRepository` to fetch users from the database. We want to test the service logic without hitting a real database.

### Python (pytest + unittest.mock)

```python
from unittest.mock import MagicMock, patch
import pytest
from user_service import UserService
from user_repository import UserRepository


class TestUserService:
    def test_get_user_returns_user_when_found(self):
        # Arrange
        mock_repo = MagicMock(spec=UserRepository)
        mock_repo.find_by_id.return_value = {
            "id": 1,
            "name": "Alice",
            "email": "alice@example.com",
        }
        service = UserService(repository=mock_repo)

        # Act
        user = service.get_user(1)

        # Assert
        assert user["name"] == "Alice"
        mock_repo.find_by_id.assert_called_once_with(1)

    def test_get_user_raises_when_not_found(self):
        # Arrange
        mock_repo = MagicMock(spec=UserRepository)
        mock_repo.find_by_id.return_value = None
        service = UserService(repository=mock_repo)

        # Act & Assert
        with pytest.raises(ValueError, match="User not found"):
            service.get_user(999)
```

### JavaScript (Jest)

```javascript
const { UserService } = require("./userService");

describe("UserService", () => {
  test("getUser returns user when found", () => {
    // Arrange
    const mockRepo = {
      findById: jest.fn().mockReturnValue({
        id: 1,
        name: "Alice",
        email: "alice@example.com",
      }),
    };
    const service = new UserService(mockRepo);

    // Act
    const user = service.getUser(1);

    // Assert
    expect(user.name).toBe("Alice");
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.findById).toHaveBeenCalledTimes(1);
  });

  test("getUser throws when not found", () => {
    // Arrange
    const mockRepo = {
      findById: jest.fn().mockReturnValue(null),
    };
    const service = new UserService(mockRepo);

    // Act & Assert
    expect(() => service.getUser(999)).toThrow("User not found");
  });
});
```

### Java (JUnit 5 + Mockito)

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @InjectMocks
    private UserService service;

    @Test
    void getUserReturnsUserWhenFound() {
        // Arrange
        User alice = new User(1L, "Alice", "alice@example.com");
        when(repository.findById(1L)).thenReturn(alice);

        // Act
        User result = service.getUser(1L);

        // Assert
        assertEquals("Alice", result.getName());
        verify(repository, times(1)).findById(1L);
    }

    @Test
    void getUserThrowsWhenNotFound() {
        // Arrange
        when(repository.findById(999L)).thenReturn(null);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            service.getUser(999L);
        });
    }
}
```

### C# (xUnit + Moq)

```csharp
using Moq;
using Xunit;

public class UserServiceTests
{
    [Fact]
    public void GetUser_ReturnsUser_WhenFound()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        mockRepo
            .Setup(r => r.FindById(1))
            .Returns(new User(1, "Alice", "alice@example.com"));
        var service = new UserService(mockRepo.Object);

        // Act
        var user = service.GetUser(1);

        // Assert
        Assert.Equal("Alice", user.Name);
        mockRepo.Verify(r => r.FindById(1), Times.Once);
    }

    [Fact]
    public void GetUser_Throws_WhenNotFound()
    {
        // Arrange
        var mockRepo = new Mock<IUserRepository>();
        mockRepo
            .Setup(r => r.FindById(999))
            .Returns((User)null);
        var service = new UserService(mockRepo.Object);

        // Act & Assert
        Assert.Throws<ArgumentException>(() => service.GetUser(999));
    }
}
```

---

## Mock an HTTP API Call

### Scenario

An `OrderService` calls an external payment gateway API. We mock the HTTP client to control responses without making real network calls.

### Python (pytest + unittest.mock)

```python
from unittest.mock import patch, MagicMock
import pytest
from order_service import OrderService


class TestOrderService:
    @patch("order_service.requests.post")
    def test_process_payment_succeeds(self, mock_post):
        # Arrange
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "transaction_id": "txn_abc123",
            "status": "approved",
        }
        mock_post.return_value = mock_response
        service = OrderService(api_key="test_key")

        # Act
        result = service.process_payment(amount=99.99, card_token="tok_visa")

        # Assert
        assert result["status"] == "approved"
        assert result["transaction_id"] == "txn_abc123"
        mock_post.assert_called_once_with(
            "https://api.payments.com/charge",
            json={"amount": 99.99, "token": "tok_visa"},
            headers={"Authorization": "Bearer test_key"},
        )

    @patch("order_service.requests.post")
    def test_process_payment_handles_gateway_error(self, mock_post):
        # Arrange
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.json.return_value = {"error": "Gateway unavailable"}
        mock_post.return_value = mock_response
        service = OrderService(api_key="test_key")

        # Act & Assert
        with pytest.raises(PaymentError, match="Gateway unavailable"):
            service.process_payment(amount=50.00, card_token="tok_visa")
```

### JavaScript (Jest)

```javascript
const axios = require("axios");
const { OrderService } = require("./orderService");

jest.mock("axios");

describe("OrderService", () => {
  let service;

  beforeEach(() => {
    service = new OrderService("test_key");
  });

  test("processPayment succeeds with valid card", async () => {
    // Arrange
    axios.post.mockResolvedValue({
      status: 200,
      data: {
        transactionId: "txn_abc123",
        status: "approved",
      },
    });

    // Act
    const result = await service.processPayment(99.99, "tok_visa");

    // Assert
    expect(result.status).toBe("approved");
    expect(result.transactionId).toBe("txn_abc123");
    expect(axios.post).toHaveBeenCalledWith(
      "https://api.payments.com/charge",
      { amount: 99.99, token: "tok_visa" },
      { headers: { Authorization: "Bearer test_key" } },
    );
  });

  test("processPayment throws on gateway error", async () => {
    // Arrange
    axios.post.mockRejectedValue({
      response: { status: 500, data: { error: "Gateway unavailable" } },
    });

    // Act & Assert
    await expect(
      service.processPayment(50.0, "tok_visa"),
    ).rejects.toThrow("Gateway unavailable");
  });
});
```

### Java (JUnit 5 + Mockito)

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private PaymentGatewayClient gatewayClient;

    @InjectMocks
    private OrderService service;

    @Test
    void processPaymentSucceeds() {
        // Arrange
        PaymentResponse response = new PaymentResponse("txn_abc123", "approved");
        when(gatewayClient.charge(anyDouble(), anyString())).thenReturn(response);

        // Act
        PaymentResponse result = service.processPayment(99.99, "tok_visa");

        // Assert
        assertEquals("approved", result.getStatus());
        assertEquals("txn_abc123", result.getTransactionId());
        verify(gatewayClient).charge(99.99, "tok_visa");
    }

    @Test
    void processPaymentThrowsOnGatewayError() {
        // Arrange
        when(gatewayClient.charge(anyDouble(), anyString()))
            .thenThrow(new PaymentException("Gateway unavailable"));

        // Act & Assert
        assertThrows(PaymentException.class, () -> {
            service.processPayment(50.00, "tok_visa");
        });
    }
}
```

### C# (xUnit + Moq)

```csharp
using Moq;
using Xunit;
using System.Threading.Tasks;

public class OrderServiceTests
{
    [Fact]
    public async Task ProcessPayment_Succeeds_WithValidCard()
    {
        // Arrange
        var mockGateway = new Mock<IPaymentGateway>();
        mockGateway
            .Setup(g => g.ChargeAsync(It.IsAny<decimal>(), It.IsAny<string>()))
            .ReturnsAsync(new PaymentResponse("txn_abc123", "approved"));
        var service = new OrderService(mockGateway.Object);

        // Act
        var result = await service.ProcessPaymentAsync(99.99m, "tok_visa");

        // Assert
        Assert.Equal("approved", result.Status);
        Assert.Equal("txn_abc123", result.TransactionId);
        mockGateway.Verify(
            g => g.ChargeAsync(99.99m, "tok_visa"),
            Times.Once
        );
    }

    [Fact]
    public async Task ProcessPayment_Throws_OnGatewayError()
    {
        // Arrange
        var mockGateway = new Mock<IPaymentGateway>();
        mockGateway
            .Setup(g => g.ChargeAsync(It.IsAny<decimal>(), It.IsAny<string>()))
            .ThrowsAsync(new PaymentException("Gateway unavailable"));
        var service = new OrderService(mockGateway.Object);

        // Act & Assert
        await Assert.ThrowsAsync<PaymentException>(
            () => service.ProcessPaymentAsync(50.00m, "tok_visa")
        );
    }
}
```

---

## Verify Interactions

Beyond checking return values, mocks let you verify **how** dependencies were called.

### Python (unittest.mock)

```python
def test_notification_sent_after_order_placed(self):
    # Arrange
    mock_notifier = MagicMock()
    mock_repo = MagicMock()
    mock_repo.save.return_value = Order(id=42, total=100.00)
    service = OrderService(repository=mock_repo, notifier=mock_notifier)

    # Act
    service.place_order(items=[{"sku": "ABC", "qty": 2}])

    # Assert — verify the notifier was called correctly
    mock_notifier.send_order_confirmation.assert_called_once_with(
        order_id=42, total=100.00
    )

    # Verify call order
    mock_repo.save.assert_called_once()
    assert mock_repo.save.call_count == 1
```

### JavaScript (Jest)

```javascript
test("sends notification after order is placed", () => {
  // Arrange
  const mockNotifier = { sendOrderConfirmation: jest.fn() };
  const mockRepo = {
    save: jest.fn().mockReturnValue({ id: 42, total: 100.0 }),
  };
  const service = new OrderService(mockRepo, mockNotifier);

  // Act
  service.placeOrder([{ sku: "ABC", qty: 2 }]);

  // Assert
  expect(mockNotifier.sendOrderConfirmation).toHaveBeenCalledWith({
    orderId: 42,
    total: 100.0,
  });
  expect(mockNotifier.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  expect(mockRepo.save).toHaveBeenCalledBefore(
    mockNotifier.sendOrderConfirmation,
  );
});
```

### Java (Mockito)

```java
@Test
void sendsNotificationAfterOrderPlaced() {
    // Arrange
    Order savedOrder = new Order(42L, 100.00);
    when(repository.save(any(Order.class))).thenReturn(savedOrder);

    // Act
    service.placeOrder(List.of(new LineItem("ABC", 2)));

    // Assert
    verify(notifier).sendOrderConfirmation(42L, 100.00);
    verify(notifier, times(1)).sendOrderConfirmation(anyLong(), anyDouble());

    // Verify order of operations
    InOrder inOrder = inOrder(repository, notifier);
    inOrder.verify(repository).save(any(Order.class));
    inOrder.verify(notifier).sendOrderConfirmation(42L, 100.00);
}
```

### C# (Moq)

```csharp
[Fact]
public void SendsNotificationAfterOrderPlaced()
{
    // Arrange
    var mockRepo = new Mock<IOrderRepository>();
    var mockNotifier = new Mock<INotifier>();
    mockRepo
        .Setup(r => r.Save(It.IsAny<Order>()))
        .Returns(new Order(42, 100.00m));
    var service = new OrderService(mockRepo.Object, mockNotifier.Object);

    // Act
    service.PlaceOrder(new[] { new LineItem("ABC", 2) });

    // Assert
    mockNotifier.Verify(
        n => n.SendOrderConfirmation(42, 100.00m),
        Times.Once
    );
    mockRepo.Verify(r => r.Save(It.IsAny<Order>()), Times.Once);
}
```

---

## Using Spies

Spies wrap real objects — they call through to the real implementation but record the calls for verification.

### Python (unittest.mock)

```python
from unittest.mock import patch


def test_logger_records_messages(self):
    # Arrange
    logger = RealLogger()

    with patch.object(logger, "info", wraps=logger.info) as spy_info:
        service = PaymentService(logger=logger)

        # Act
        service.process(amount=50.00)

        # Assert — real method was called AND we can verify
        spy_info.assert_called_once_with("Processing payment of $50.00")
```

### JavaScript (Jest)

```javascript
test("logger records messages using spy", () => {
  // Arrange
  const logger = new RealLogger();
  const spy = jest.spyOn(logger, "info");
  const service = new PaymentService(logger);

  // Act
  service.process(50.0);

  // Assert — real method was called
  expect(spy).toHaveBeenCalledWith("Processing payment of $50.00");

  // Cleanup
  spy.mockRestore();
});
```

### Java (Mockito)

```java
@Test
void loggerRecordsMessages() {
    // Arrange
    Logger realLogger = new RealLogger();
    Logger spyLogger = spy(realLogger);
    PaymentService service = new PaymentService(spyLogger);

    // Act
    service.process(50.00);

    // Assert — real method was called AND we can verify
    verify(spyLogger).info("Processing payment of $50.00");
}
```

### C# (Moq — CallBase for partial mocking)

```csharp
[Fact]
public void LoggerRecordsMessages()
{
    // Arrange
    var mockLogger = new Mock<RealLogger>() { CallBase = true };
    var service = new PaymentService(mockLogger.Object);

    // Act
    service.Process(50.00m);

    // Assert — real method was called AND we can verify
    mockLogger.Verify(l => l.Info("Processing payment of $50.00"), Times.Once);
}
```

---

## Summary

| Concept          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| **Stub**         | Provide canned answers, no verification        |
| **Mock**         | Verify interactions and expectations           |
| **Spy**          | Observe real calls while preserving behavior   |
| **Isolation**    | Test one unit without coupling to dependencies |
| **Verification** | Confirm the right methods were called          |
| **Determinism**  | Control external responses for predictability  |

Mocking is a powerful tool, but use it judiciously. Over-mocking leads to tests that verify implementation details rather than behavior — making refactoring painful. Mock at boundaries (I/O, network, database), not between your own classes.
