---
title: Testing Interview Preparation
---

## Common Testing Interview Questions

### Fundamentals

**Q: What is the difference between verification and validation?**
- **Verification**: "Are we building the product right?" — checks that the software meets specifications (reviews, inspections, walkthroughs)
- **Validation**: "Are we building the right product?" — checks that the software meets user needs (testing, UAT, demos)

**Q: Explain the test pyramid.**
The test pyramid recommends more unit tests at the base, fewer integration tests in the middle, and the fewest end-to-end tests at the top. This structure optimizes for fast feedback, low maintenance cost, and high reliability.

**Q: What is the difference between black-box and white-box testing?**
- **Black-box**: Tests based on requirements without knowledge of internal code structure
- **White-box**: Tests based on internal logic, code paths, and implementation details

**Q: What is regression testing?**
Regression testing ensures that new changes haven't broken existing functionality. It involves re-running previously passing tests after code modifications.

**Q: Explain equivalence partitioning and boundary value analysis.**
- **Equivalence partitioning**: Divides input data into groups where all values in a group should behave the same. Test one value from each partition.
- **Boundary value analysis**: Tests at the edges of equivalence partitions (min, min+1, max-1, max) where defects commonly occur.

---

## Testing Terminology Quiz

Test your knowledge of key testing terms:

| Term | Definition |
|------|-----------|
| Test stub | A minimal implementation that returns predetermined responses |
| Test mock | An object that records interactions and can verify expected calls |
| Test fixture | The fixed state used as a baseline for running tests |
| Flaky test | A test that passes and fails intermittently without code changes |
| Test harness | The collection of software and test data for testing a program |
| Mutation testing | Introduces small code changes to verify test effectiveness |
| Smoke testing | A quick subset of tests to verify basic functionality works |
| Sanity testing | Narrow, focused testing after a minor change |
| Exploratory testing | Simultaneous learning, test design, and test execution |
| Test oracle | A mechanism for determining whether a test has passed or failed |
| Code coverage | The percentage of code executed during testing |
| Test debt | Accumulated cost of missing, incomplete, or poorly maintained tests |

---

## Test Case Design Exercises

### Exercise 1: ATM Machine

Design test cases for an ATM withdrawal feature:

**Functional Tests:**
1. Withdraw amount less than balance — success
2. Withdraw amount equal to balance — success, zero balance
3. Withdraw amount exceeding balance — error message
4. Withdraw amount exceeding daily limit — error message
5. Withdraw non-standard denomination (e.g., $7) — error or round
6. Withdraw minimum allowed amount — success
7. Withdraw with insufficient funds in ATM — out of cash message
8. Multiple withdrawals summing to daily limit — block further

**Security Tests:**
1. Three incorrect PIN attempts — card locked
2. Session timeout after inactivity — auto logout
3. Card skimmer detection — alert triggered
4. Concurrent withdrawal from same account — race condition handling

**Edge Cases:**
1. Network failure during transaction — rollback
2. Power outage mid-dispense — reconciliation
3. Account frozen/blocked — appropriate message
4. Expired card — rejection with reason

### Exercise 2: Elevator System

Design test cases for a multi-floor elevator:

**Normal Operation:**
1. Press floor button — elevator moves to requested floor
2. Multiple requests — serves in optimal order
3. Door open/close cycle — standard timing
4. Weight limit detection — alarm and door reopens

**Edge Cases:**
1. Simultaneous requests from multiple floors
2. Emergency stop button pressed mid-transit
3. Door obstruction detection
4. Power failure — emergency lowering
5. Fire alarm mode — return to ground floor
6. Maintenance mode — out of service behavior

### Exercise 3: Login Form

Design test cases for a web login form:

**Valid Scenarios:**
1. Correct username and password — redirect to dashboard
2. "Remember me" checked — persistent session
3. Login with email instead of username — success

**Invalid Scenarios:**
1. Wrong password — error message (no hint about which field)
2. Non-existent username — same error as wrong password
3. Empty username — validation error
4. Empty password — validation error
5. SQL injection attempt — sanitized, no error leak
6. XSS in username field — escaped properly

**Security:**
1. Account lockout after N failures — time-based unlock
2. CAPTCHA after repeated failures
3. Rate limiting on login endpoint
4. Session invalidation on password change
5. MFA code validation (valid, expired, reused)

---

## Bug Report Writing Exercise

### Template

```
Title: [Component] Brief description of the issue
Severity: Critical / Major / Minor / Trivial
Priority: P1 / P2 / P3 / P4
Environment: OS, Browser, Version, Device
Preconditions: State required before reproducing

Steps to Reproduce:
1. Navigate to...
2. Enter...
3. Click...

Expected Result: What should happen
Actual Result: What actually happens
Frequency: Always / Intermittent (X/10) / Once

Attachments: Screenshots, logs, HAR files
Additional Notes: Workarounds, related issues
```

### Example Bug Report

```
Title: [Checkout] Payment fails silently when CVV contains spaces
Severity: Major
Priority: P1
Environment: Chrome 120, macOS 14.2, Production

Preconditions:
- User logged in with items in cart
- Valid credit card on file

Steps to Reproduce:
1. Navigate to /checkout
2. Select "Credit Card" payment method
3. Enter CVV as "1 2 3" (with spaces)
4. Click "Place Order"

Expected Result: Either trim spaces and process payment,
or show validation error "CVV must be 3 digits"

Actual Result: Page shows spinning loader indefinitely.
No error message. Payment not processed. Order stuck in
"pending" state. Console shows 500 error from /api/charge.

Frequency: Always (10/10)

Attachments: network-trace.har, console-errors.png
Additional Notes: CVV "123" (no spaces) works fine.
Affects all card types.
```

---

## Automation Coding Challenges

### Challenge: Test a Shopping Cart

Given a shopping cart implementation, write comprehensive tests in all four languages.

**Requirements to test:**
- Add items to cart
- Remove items from cart
- Update item quantity
- Calculate total with tax
- Apply discount codes
- Handle empty cart operations
- Prevent negative quantities

```python
import pytest
from decimal import Decimal


class ShoppingCart:
    """Shopping cart implementation to be tested."""

    def __init__(self, tax_rate=0.08):
        self.items = {}
        self.tax_rate = Decimal(str(tax_rate))
        self.discount_codes = {
            "SAVE10": Decimal("0.10"),
            "HALF50": Decimal("0.50"),
            "WELCOME": Decimal("0.15"),
        }
        self.applied_discount = None

    def add_item(self, name, price, quantity=1):
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        if price < 0:
            raise ValueError("Price cannot be negative")
        if name in self.items:
            self.items[name]["quantity"] += quantity
        else:
            self.items[name] = {
                "price": Decimal(str(price)),
                "quantity": quantity,
            }

    def remove_item(self, name):
        if name not in self.items:
            raise KeyError(f"Item '{name}' not in cart")
        del self.items[name]

    def update_quantity(self, name, quantity):
        if name not in self.items:
            raise KeyError(f"Item '{name}' not in cart")
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        self.items[name]["quantity"] = quantity

    def apply_discount(self, code):
        if code not in self.discount_codes:
            raise ValueError(f"Invalid discount code: {code}")
        self.applied_discount = code

    def get_subtotal(self):
        return sum(
            item["price"] * item["quantity"]
            for item in self.items.values()
        )

    def get_total(self):
        subtotal = self.get_subtotal()
        if self.applied_discount:
            discount = self.discount_codes[self.applied_discount]
            subtotal -= subtotal * discount
        tax = subtotal * self.tax_rate
        return round(subtotal + tax, 2)


class TestShoppingCart:
    """Comprehensive test suite for ShoppingCart."""

    @pytest.fixture
    def cart(self):
        return ShoppingCart(tax_rate=0.08)

    @pytest.fixture
    def loaded_cart(self, cart):
        cart.add_item("Widget", 9.99, 2)
        cart.add_item("Gadget", 24.99, 1)
        cart.add_item("Doohickey", 4.50, 5)
        return cart

    def test_add_item_to_empty_cart(self, cart):
        cart.add_item("Widget", 9.99)
        assert "Widget" in cart.items
        assert cart.items["Widget"]["quantity"] == 1
        assert cart.items["Widget"]["price"] == Decimal("9.99")

    def test_add_item_with_quantity(self, cart):
        cart.add_item("Widget", 9.99, 3)
        assert cart.items["Widget"]["quantity"] == 3

    def test_add_existing_item_increases_quantity(self, cart):
        cart.add_item("Widget", 9.99, 2)
        cart.add_item("Widget", 9.99, 3)
        assert cart.items["Widget"]["quantity"] == 5

    def test_add_item_negative_quantity_raises(self, cart):
        with pytest.raises(ValueError, match="Quantity must be positive"):
            cart.add_item("Widget", 9.99, -1)

    def test_add_item_zero_quantity_raises(self, cart):
        with pytest.raises(ValueError, match="Quantity must be positive"):
            cart.add_item("Widget", 9.99, 0)

    def test_add_item_negative_price_raises(self, cart):
        with pytest.raises(ValueError, match="Price cannot be negative"):
            cart.add_item("Widget", -5.00)

    def test_remove_item(self, loaded_cart):
        loaded_cart.remove_item("Widget")
        assert "Widget" not in loaded_cart.items

    def test_remove_nonexistent_item_raises(self, cart):
        with pytest.raises(KeyError):
            cart.remove_item("NonExistent")

    def test_update_quantity(self, loaded_cart):
        loaded_cart.update_quantity("Widget", 10)
        assert loaded_cart.items["Widget"]["quantity"] == 10

    def test_update_quantity_zero_raises(self, loaded_cart):
        with pytest.raises(ValueError):
            loaded_cart.update_quantity("Widget", 0)

    def test_subtotal_calculation(self, loaded_cart):
        expected = Decimal("9.99") * 2 + Decimal("24.99") + Decimal("4.50") * 5
        assert loaded_cart.get_subtotal() == expected

    def test_total_with_tax(self, cart):
        cart.add_item("Item", 100.00, 1)
        assert cart.get_total() == Decimal("108.00")

    def test_total_with_discount(self, cart):
        cart.add_item("Item", 100.00, 1)
        cart.apply_discount("SAVE10")
        expected = Decimal("100") * Decimal("0.90") * Decimal("1.08")
        assert cart.get_total() == round(expected, 2)

    def test_invalid_discount_code_raises(self, cart):
        with pytest.raises(ValueError, match="Invalid discount code"):
            cart.apply_discount("FAKECODE")

    def test_empty_cart_total_is_zero(self, cart):
        assert cart.get_total() == Decimal("0")
```

```javascript
const { describe, test, expect, beforeEach } = require("@jest/globals");

class ShoppingCart {
  constructor(taxRate = 0.08) {
    this.items = new Map();
    this.taxRate = taxRate;
    this.discountCodes = {
      SAVE10: 0.1,
      HALF50: 0.5,
      WELCOME: 0.15,
    };
    this.appliedDiscount = null;
  }

  addItem(name, price, quantity = 1) {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (price < 0) throw new Error("Price cannot be negative");
    if (this.items.has(name)) {
      const item = this.items.get(name);
      item.quantity += quantity;
    } else {
      this.items.set(name, { price, quantity });
    }
  }

  removeItem(name) {
    if (!this.items.has(name)) throw new Error(`Item '${name}' not in cart`);
    this.items.delete(name);
  }

  updateQuantity(name, quantity) {
    if (!this.items.has(name)) throw new Error(`Item '${name}' not in cart`);
    if (quantity <= 0) throw new Error("Quantity must be positive");
    this.items.get(name).quantity = quantity;
  }

  applyDiscount(code) {
    if (!(code in this.discountCodes)) {
      throw new Error(`Invalid discount code: ${code}`);
    }
    this.appliedDiscount = code;
  }

  getSubtotal() {
    let total = 0;
    for (const item of this.items.values()) {
      total += item.price * item.quantity;
    }
    return Math.round(total * 100) / 100;
  }

  getTotal() {
    let subtotal = this.getSubtotal();
    if (this.appliedDiscount) {
      subtotal -= subtotal * this.discountCodes[this.appliedDiscount];
    }
    const tax = subtotal * this.taxRate;
    return Math.round((subtotal + tax) * 100) / 100;
  }
}

describe("ShoppingCart", () => {
  let cart;

  beforeEach(() => {
    cart = new ShoppingCart(0.08);
  });

  describe("addItem", () => {
    test("adds item to empty cart", () => {
      cart.addItem("Widget", 9.99);
      expect(cart.items.has("Widget")).toBe(true);
      expect(cart.items.get("Widget").quantity).toBe(1);
    });

    test("adds item with specified quantity", () => {
      cart.addItem("Widget", 9.99, 3);
      expect(cart.items.get("Widget").quantity).toBe(3);
    });

    test("increases quantity for existing item", () => {
      cart.addItem("Widget", 9.99, 2);
      cart.addItem("Widget", 9.99, 3);
      expect(cart.items.get("Widget").quantity).toBe(5);
    });

    test("throws on negative quantity", () => {
      expect(() => cart.addItem("Widget", 9.99, -1)).toThrow(
        "Quantity must be positive",
      );
    });

    test("throws on negative price", () => {
      expect(() => cart.addItem("Widget", -5.0)).toThrow(
        "Price cannot be negative",
      );
    });
  });

  describe("removeItem", () => {
    test("removes existing item", () => {
      cart.addItem("Widget", 9.99);
      cart.removeItem("Widget");
      expect(cart.items.has("Widget")).toBe(false);
    });

    test("throws for non-existent item", () => {
      expect(() => cart.removeItem("Ghost")).toThrow("not in cart");
    });
  });

  describe("calculations", () => {
    test("calculates subtotal correctly", () => {
      cart.addItem("A", 10.0, 2);
      cart.addItem("B", 5.5, 3);
      expect(cart.getSubtotal()).toBe(36.5);
    });

    test("calculates total with tax", () => {
      cart.addItem("Item", 100.0, 1);
      expect(cart.getTotal()).toBe(108.0);
    });

    test("applies discount before tax", () => {
      cart.addItem("Item", 100.0, 1);
      cart.applyDiscount("SAVE10");
      expect(cart.getTotal()).toBe(97.2);
    });

    test("empty cart total is zero", () => {
      expect(cart.getTotal()).toBe(0);
    });

    test("throws on invalid discount code", () => {
      expect(() => cart.applyDiscount("FAKE")).toThrow("Invalid discount code");
    });
  });
});
```

```java
package com.example.testing.interview;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

public class ShoppingCartTest {

    static class ShoppingCart {
        private final Map<String, CartItem> items = new HashMap<>();
        private final BigDecimal taxRate;
        private final Map<String, BigDecimal> discountCodes;
        private String appliedDiscount;

        public ShoppingCart(double taxRate) {
            this.taxRate = BigDecimal.valueOf(taxRate);
            this.discountCodes = Map.of(
                "SAVE10", new BigDecimal("0.10"),
                "HALF50", new BigDecimal("0.50"),
                "WELCOME", new BigDecimal("0.15")
            );
        }

        public void addItem(String name, double price, int quantity) {
            if (quantity <= 0)
                throw new IllegalArgumentException(
                    "Quantity must be positive");
            if (price < 0)
                throw new IllegalArgumentException(
                    "Price cannot be negative");
            items.merge(name,
                new CartItem(BigDecimal.valueOf(price), quantity),
                (existing, added) -> {
                    existing.quantity += added.quantity;
                    return existing;
                });
        }

        public void removeItem(String name) {
            if (!items.containsKey(name))
                throw new IllegalArgumentException(
                    "Item '" + name + "' not in cart");
            items.remove(name);
        }

        public void updateQuantity(String name, int quantity) {
            if (!items.containsKey(name))
                throw new IllegalArgumentException(
                    "Item not in cart");
            if (quantity <= 0)
                throw new IllegalArgumentException(
                    "Quantity must be positive");
            items.get(name).quantity = quantity;
        }

        public void applyDiscount(String code) {
            if (!discountCodes.containsKey(code))
                throw new IllegalArgumentException(
                    "Invalid discount code: " + code);
            this.appliedDiscount = code;
        }

        public BigDecimal getSubtotal() {
            return items.values().stream()
                .map(item -> item.price.multiply(
                    BigDecimal.valueOf(item.quantity)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        public BigDecimal getTotal() {
            BigDecimal subtotal = getSubtotal();
            if (appliedDiscount != null) {
                BigDecimal discount = discountCodes.get(appliedDiscount);
                subtotal = subtotal.subtract(
                    subtotal.multiply(discount));
            }
            BigDecimal tax = subtotal.multiply(taxRate);
            return subtotal.add(tax)
                .setScale(2, RoundingMode.HALF_UP);
        }
    }

    static class CartItem {
        BigDecimal price;
        int quantity;

        CartItem(BigDecimal price, int quantity) {
            this.price = price;
            this.quantity = quantity;
        }
    }

    private ShoppingCart cart;

    @BeforeEach
    void setUp() {
        cart = new ShoppingCart(0.08);
    }

    @Test
    @DisplayName("Add item to empty cart")
    void addItemToEmptyCart() {
        cart.addItem("Widget", 9.99, 1);
        assertEquals(new BigDecimal("9.99"), cart.getSubtotal());
    }

    @Test
    @DisplayName("Add same item increases quantity")
    void addSameItemIncreasesQuantity() {
        cart.addItem("Widget", 9.99, 2);
        cart.addItem("Widget", 9.99, 3);
        assertEquals(
            new BigDecimal("49.95"), cart.getSubtotal());
    }

    @Test
    @DisplayName("Remove item from cart")
    void removeItem() {
        cart.addItem("Widget", 9.99, 1);
        cart.removeItem("Widget");
        assertEquals(BigDecimal.ZERO, cart.getSubtotal());
    }

    @Test
    @DisplayName("Remove non-existent item throws")
    void removeNonExistentThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> cart.removeItem("Ghost"));
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 0, -100})
    @DisplayName("Invalid quantities throw exception")
    void invalidQuantityThrows(int qty) {
        assertThrows(IllegalArgumentException.class,
            () -> cart.addItem("Widget", 9.99, qty));
    }

    @Test
    @DisplayName("Total includes tax")
    void totalIncludesTax() {
        cart.addItem("Item", 100.00, 1);
        assertEquals(
            new BigDecimal("108.00"), cart.getTotal());
    }

    @Test
    @DisplayName("Discount applied before tax")
    void discountAppliedBeforeTax() {
        cart.addItem("Item", 100.00, 1);
        cart.applyDiscount("SAVE10");
        assertEquals(
            new BigDecimal("97.20"), cart.getTotal());
    }

    @Test
    @DisplayName("Invalid discount code throws")
    void invalidDiscountThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> cart.applyDiscount("FAKE"));
    }

    @Test
    @DisplayName("Empty cart total is zero")
    void emptyCartTotalZero() {
        assertEquals(
            new BigDecimal("0.00"), cart.getTotal());
    }
}
```

```csharp
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;

namespace InterviewPrep.Tests
{
    public class ShoppingCart
    {
        private readonly Dictionary<string, CartItem> _items = new();
        private readonly decimal _taxRate;
        private readonly Dictionary<string, decimal> _discountCodes;
        private string _appliedDiscount;

        public ShoppingCart(decimal taxRate = 0.08m)
        {
            _taxRate = taxRate;
            _discountCodes = new Dictionary<string, decimal>
            {
                ["SAVE10"] = 0.10m,
                ["HALF50"] = 0.50m,
                ["WELCOME"] = 0.15m,
            };
        }

        public void AddItem(string name, decimal price, int qty = 1)
        {
            if (qty <= 0)
                throw new ArgumentException("Quantity must be positive");
            if (price < 0)
                throw new ArgumentException("Price cannot be negative");
            if (_items.ContainsKey(name))
                _items[name].Quantity += qty;
            else
                _items[name] = new CartItem(price, qty);
        }

        public void RemoveItem(string name)
        {
            if (!_items.ContainsKey(name))
                throw new KeyNotFoundException(
                    $"Item '{name}' not in cart");
            _items.Remove(name);
        }

        public void UpdateQuantity(string name, int qty)
        {
            if (!_items.ContainsKey(name))
                throw new KeyNotFoundException("Item not in cart");
            if (qty <= 0)
                throw new ArgumentException("Quantity must be positive");
            _items[name].Quantity = qty;
        }

        public void ApplyDiscount(string code)
        {
            if (!_discountCodes.ContainsKey(code))
                throw new ArgumentException(
                    $"Invalid discount code: {code}");
            _appliedDiscount = code;
        }

        public decimal GetSubtotal() =>
            _items.Values.Sum(i => i.Price * i.Quantity);

        public decimal GetTotal()
        {
            var subtotal = GetSubtotal();
            if (_appliedDiscount != null)
                subtotal -= subtotal * _discountCodes[_appliedDiscount];
            return Math.Round(subtotal + subtotal * _taxRate, 2);
        }
    }

    public record CartItem(decimal Price, int Quantity)
    {
        public int Quantity { get; set; } = Quantity;
    }

    public class ShoppingCartTests
    {
        private readonly ShoppingCart _cart;

        public ShoppingCartTests()
        {
            _cart = new ShoppingCart(0.08m);
        }

        [Fact]
        public void AddItem_ToEmptyCart_AddsSuccessfully()
        {
            _cart.AddItem("Widget", 9.99m);
            Assert.Equal(9.99m, _cart.GetSubtotal());
        }

        [Fact]
        public void AddItem_ExistingItem_IncreasesQuantity()
        {
            _cart.AddItem("Widget", 9.99m, 2);
            _cart.AddItem("Widget", 9.99m, 3);
            Assert.Equal(49.95m, _cart.GetSubtotal());
        }

        [Fact]
        public void RemoveItem_ExistingItem_RemovesFromCart()
        {
            _cart.AddItem("Widget", 9.99m);
            _cart.RemoveItem("Widget");
            Assert.Equal(0m, _cart.GetSubtotal());
        }

        [Fact]
        public void RemoveItem_NonExistent_ThrowsException()
        {
            Assert.Throws<KeyNotFoundException>(
                () => _cart.RemoveItem("Ghost"));
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(0)]
        [InlineData(-100)]
        public void AddItem_InvalidQuantity_ThrowsException(int qty)
        {
            Assert.Throws<ArgumentException>(
                () => _cart.AddItem("Widget", 9.99m, qty));
        }

        [Fact]
        public void GetTotal_WithTax_CalculatesCorrectly()
        {
            _cart.AddItem("Item", 100.00m, 1);
            Assert.Equal(108.00m, _cart.GetTotal());
        }

        [Fact]
        public void GetTotal_WithDiscount_AppliesBeforeTax()
        {
            _cart.AddItem("Item", 100.00m, 1);
            _cart.ApplyDiscount("SAVE10");
            Assert.Equal(97.20m, _cart.GetTotal());
        }

        [Fact]
        public void ApplyDiscount_InvalidCode_ThrowsException()
        {
            Assert.Throws<ArgumentException>(
                () => _cart.ApplyDiscount("FAKE"));
        }

        [Fact]
        public void GetTotal_EmptyCart_ReturnsZero()
        {
            Assert.Equal(0.00m, _cart.GetTotal());
        }

        [Fact]
        public void UpdateQuantity_ValidItem_UpdatesCorrectly()
        {
            _cart.AddItem("Widget", 10.00m, 1);
            _cart.UpdateQuantity("Widget", 5);
            Assert.Equal(50.00m, _cart.GetSubtotal());
        }
    }
}
```

---

## Behavioral Interview Questions

### "Tell me about a time you found a critical bug"

**STAR Framework:**
- **Situation**: Context of the project and your role
- **Task**: What you were responsible for
- **Action**: Steps you took to find and report the bug
- **Result**: Impact of finding it (money saved, users protected)

**Example Answer:**
"During a payment system migration, I noticed the new API was returning success for duplicate charge attempts. I wrote a test that submitted the same idempotency key twice and verified both charges went through. The bug would have double-charged approximately 2% of users. I documented the issue with a reproducible test case, and the team fixed it before the release."

### Other Common Behavioral Questions

- "How do you prioritize which tests to write first?"
- "Describe a time you disagreed with a developer about a bug severity"
- "How do you handle testing when requirements are unclear?"
- "Tell me about a time automation saved significant manual effort"
- "How do you stay current with testing tools and practices?"

---

## System Design for Test Infrastructure

### Design a CI/CD Test Pipeline

**Requirements:**
- Support 500+ microservices
- Run tests on every pull request
- Provide results within 15 minutes
- Handle flaky test detection and quarantine

**Key Components:**
1. **Test orchestrator**: Distributes tests across parallel runners
2. **Test selection**: Only run tests affected by changed code
3. **Flaky detection**: Track test pass rates, quarantine unreliable tests
4. **Result aggregation**: Dashboard with trends and analytics
5. **Environment management**: Spin up isolated environments per PR
6. **Artifact storage**: Store screenshots, logs, coverage reports

### Design a Load Testing Platform

**Requirements:**
- Generate 100K+ concurrent users
- Support multiple protocols (HTTP, WebSocket, gRPC)
- Provide real-time metrics during tests
- Replay production traffic patterns

**Architecture:**
1. **Distributed agents**: Containerized load generators across regions
2. **Scenario engine**: Script-based user journey definitions
3. **Metrics pipeline**: Real-time streaming to time-series database
4. **Correlation engine**: Map performance metrics to infrastructure
5. **Baseline comparison**: Automatic regression detection

---

## Tips for Testing Interviews

1. **Always ask clarifying questions** before designing test cases
2. **Think about edge cases** — interviewers want to see thoroughness
3. **Consider non-functional requirements** (performance, security, accessibility)
4. **Know the trade-offs** between testing approaches
5. **Be ready to code** — many interviews include live test writing
6. **Understand CI/CD** — testing doesn't exist in isolation
7. **Practice explaining your thought process** aloud
8. **Know your tools** — be specific about frameworks you've used
