---
title: Component & DOM Testing
---

# Component & DOM Testing

Component testing verifies that individual UI components render correctly and respond to user interactions as expected—without requiring a full application context or browser session.

## Why Test Components in Isolation?

- **Speed**: Component tests run in milliseconds, not seconds
- **Reliability**: No network, database, or browser flakiness
- **Focused feedback**: Failures pinpoint exactly which component broke
- **Refactoring safety**: Catch regressions immediately

## Core Principles

### Test Behavior, Not Implementation

Bad: Testing that a state variable changed to `true`
Good: Testing that clicking a button makes content visible

### Test From the User's Perspective

Query elements the way a user would find them:
1. By role (button, heading, textbox) — most accessible
2. By label text — what the user reads
3. By text content — what's displayed
4. By test ID — last resort for elements without semantic meaning

### Arrange-Act-Assert

1. **Arrange**: Render the component with specific props
2. **Act**: Simulate user interaction
3. **Assert**: Verify the expected outcome

## React Testing Library + Vitest (JavaScript)

React Testing Library encourages testing components the way users interact with them, discouraging tests that rely on implementation details.

### Rendering and Querying

```python
# Python: Testing rendered HTML with BeautifulSoup
# Useful for server-rendered templates (Flask, Django)

from bs4 import BeautifulSoup
import pytest


def render_user_card(username, email, is_admin=False):
    """Simulate a template rendering function."""
    admin_badge = '<span class="badge badge-admin">Admin</span>' if is_admin else ""
    return f"""
    <div class="user-card" data-testid="user-card">
        <h2 class="user-name">{username}</h2>
        <p class="user-email">{email}</p>
        {admin_badge}
        <button class="btn-edit">Edit Profile</button>
    </div>
    """


class TestUserCard:
    """Test the UserCard template rendering."""

    def test_renders_username(self):
        html = render_user_card("Alice", "alice@example.com")
        soup = BeautifulSoup(html, "html.parser")
        name_element = soup.find("h2", class_="user-name")
        assert name_element is not None
        assert name_element.text == "Alice"

    def test_shows_admin_badge_for_admins(self):
        html = render_user_card("Alice", "alice@example.com", is_admin=True)
        soup = BeautifulSoup(html, "html.parser")
        badge = soup.find("span", class_="badge-admin")
        assert badge is not None
        assert badge.text == "Admin"

    def test_hides_admin_badge_for_regular_users(self):
        html = render_user_card("Bob", "bob@example.com", is_admin=False)
        soup = BeautifulSoup(html, "html.parser")
        assert soup.find("span", class_="badge-admin") is None

    def test_has_edit_button(self):
        html = render_user_card("Alice", "alice@example.com")
        soup = BeautifulSoup(html, "html.parser")

        button = soup.find("button", class_="btn-edit")
        assert button is not None
        assert button.text == "Edit Profile"
```

```javascript
// JavaScript: React Testing Library - Rendering and Querying
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import UserCard from "./UserCard";

describe("UserCard", () => {
  const defaultProps = {
    username: "Alice",
    email: "alice@example.com",
    isAdmin: false,
    onEdit: vi.fn(),
  };

  it("renders the username as a heading", () => {
    render(<UserCard {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Alice" })).toBeInTheDocument();
  });

  it("renders the email address", () => {
    render(<UserCard {...defaultProps} />);

    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("shows admin badge when user is admin", () => {
    render(<UserCard {...defaultProps} isAdmin={true} />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("hides admin badge for regular users", () => {
    render(<UserCard {...defaultProps} isAdmin={false} />);

    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renders the edit button", () => {
    render(<UserCard {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /edit profile/i })
    ).toBeInTheDocument();
  });
});
```

```java
// Java: JSoup for testing server-rendered HTML templates
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class UserCardTemplateTest {

    private TemplateEngine templateEngine;

    @BeforeEach
    void setUp() {
        templateEngine = new TemplateEngine();
    }

    @Test
    void shouldRenderUsername() {
        String html = templateEngine.render("user-card", Map.of(
            "username", "Alice",
            "email", "alice@example.com",
            "isAdmin", false
        ));

        Document doc = Jsoup.parse(html);
        Element nameElement = doc.selectFirst(".user-name");
        assertNotNull(nameElement);
        assertEquals("Alice", nameElement.text());
    }

    @Test
    void shouldShowAdminBadgeForAdmins() {
        String html = templateEngine.render("user-card", Map.of(
            "username", "Alice",
            "email", "alice@example.com",
            "isAdmin", true
        ));

        Document doc = Jsoup.parse(html);
        Element badge = doc.selectFirst(".badge-admin");
        assertNotNull(badge);
        assertEquals("Admin", badge.text());
    }

    @Test
    void shouldHideAdminBadgeForRegularUsers() {
        String html = templateEngine.render("user-card", Map.of(
            "username", "Bob",
            "email", "bob@example.com",
            "isAdmin", false
        ));

        Document doc = Jsoup.parse(html);
        assertNull(doc.selectFirst(".badge-admin"));
    }
}
```

```csharp
// C#: bUnit for Blazor component testing
using Bunit;
using Xunit;
using MyApp.Components;

namespace MyApp.Tests.Components;

public class UserCardTests : TestContext
{
    [Fact]
    public void ShouldRenderUsername()
    {
        var cut = RenderComponent<UserCard>(parameters => parameters
            .Add(p => p.Username, "Alice")
            .Add(p => p.Email, "alice@example.com")
            .Add(p => p.IsAdmin, false)
        );

        var heading = cut.Find("h2.user-name");
        heading.MarkupMatches("<h2 class=\"user-name\">Alice</h2>");
    }

    [Fact]
    public void ShouldShowAdminBadgeForAdmins()
    {
        var cut = RenderComponent<UserCard>(parameters => parameters
            .Add(p => p.Username, "Alice")
            .Add(p => p.Email, "alice@example.com")
            .Add(p => p.IsAdmin, true)
        );

        var badge = cut.Find(".badge-admin");
        Assert.Equal("Admin", badge.TextContent);
    }

    [Fact]
    public void ShouldHideAdminBadgeForRegularUsers()
    {
        var cut = RenderComponent<UserCard>(parameters => parameters
            .Add(p => p.Username, "Bob")
            .Add(p => p.Email, "bob@example.com")
            .Add(p => p.IsAdmin, false)
        );

        Assert.Throws<ElementNotFoundException>(() => cut.Find(".badge-admin"));
    }

    [Fact]
    public void ShouldHaveEditButton()
    {
        var cut = RenderComponent<UserCard>(parameters => parameters
            .Add(p => p.Username, "Alice")
            .Add(p => p.Email, "alice@example.com")
            .Add(p => p.IsAdmin, false)
        );

        var button = cut.Find("button.btn-edit");
        Assert.Equal("Edit Profile", button.TextContent);
    }
}
```

## Testing User Interactions

User events simulate real user behavior—clicking, typing, selecting. Always prefer `userEvent` over `fireEvent` in React Testing Library as it more closely simulates actual browser behavior.

### Forms and Input

```python
# Python: Testing form behavior with Selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestContactForm:
    """Test the contact form component."""

    def setup_method(self):
        options = Options()
        options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 10)
        self.driver.get("http://localhost:3000/contact")

    def teardown_method(self):
        self.driver.quit()

    def test_submit_button_disabled_when_form_empty(self):
        submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        assert not submit_btn.is_enabled()

    def test_shows_validation_error_for_invalid_email(self):
        email_input = self.driver.find_element(By.ID, "email")
        email_input.send_keys("not-an-email")
        email_input.send_keys(Keys.TAB)

        error = self.wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, ".email-error"))
        )
        assert "valid email" in error.text.lower()
```

```javascript
// JavaScript: Testing forms with React Testing Library
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ContactForm from "./ContactForm";

describe("ContactForm", () => {
  it("submit button is disabled when form is empty", () => {
    render(<ContactForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("enables submit when all fields are valid", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello there!");

    expect(screen.getByRole("button", { name: /send/i })).toBeEnabled();
  });

  it("calls onSubmit with form data", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ContactForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/message/i), "Test message");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@example.com",
      message: "Test message",
    });
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm onSubmit={vi.fn().mockResolvedValue()} />);

    await user.type(screen.getByLabelText(/name/i), "Alice");
    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/message/i), "Test message");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });
});
```

```java
// Java: Testing form interactions with Selenium
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

class ContactFormTest {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeEach
    void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("http://localhost:3000/contact");
    }

    @AfterEach
    void tearDown() { if (driver != null) driver.quit(); }

    @Test
    void submitButtonDisabledWhenFormEmpty() {
        WebElement submitBtn = driver.findElement(By.cssSelector("button[type='submit']"));
        assertFalse(submitBtn.isEnabled());
    }

    @Test
    void showsSuccessMessageOnSubmit() {
        driver.findElement(By.id("name")).sendKeys("Alice");
        driver.findElement(By.id("email")).sendKeys("alice@example.com");
        driver.findElement(By.id("message")).sendKeys("Test message");
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        WebElement success = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".success-toast"))
        );
        assertTrue(success.getText().toLowerCase().contains("sent"));
    }
}
```

```csharp
// C#: bUnit form interaction testing for Blazor
using Bunit;
using Xunit;
using MyApp.Components;

namespace MyApp.Tests.Components;

public class ContactFormTests : TestContext
{
    [Fact]
    public void SubmitButtonDisabledWhenFormEmpty()
    {
        var cut = RenderComponent<ContactForm>();
        var submitButton = cut.Find("button[type='submit']");
        Assert.True(submitButton.HasAttribute("disabled"));
    }

    [Fact]
    public void ShowsValidationErrorForInvalidEmail()
    {
        var cut = RenderComponent<ContactForm>();
        var emailInput = cut.Find("#email");
        emailInput.Change("not-an-email");
        emailInput.Blur();

        var error = cut.Find(".email-error");
        Assert.Contains("valid email", error.TextContent, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void CallsOnSubmitWithFormData()
    {
        var submitted = false;
        var cut = RenderComponent<ContactForm>(parameters => parameters
            .Add(p => p.OnSubmit, (data) => { submitted = true; return Task.CompletedTask; })
        );

        cut.Find("#name").Change("Alice");
        cut.Find("#email").Change("alice@example.com");
        cut.Find("#message").Change("Test message");
        cut.Find("button[type='submit']").Click();

        Assert.True(submitted);
    }
}
```

## Snapshot Testing

Snapshot testing captures the rendered output of a component and compares it against a stored baseline. If the output changes, the test fails until you approve the change.

**Pros**: Catches unintended markup changes, easy to write, documents expected output.

**Cons**: Large snapshots are hard to review, fragile to any markup change, doesn't test behavior, gives false sense of coverage.

**Best Practices**: Keep snapshots small, use inline snapshots, review diffs carefully, always pair with behavioral tests.

```javascript
// JavaScript: Snapshot testing with Vitest
import { render } from "@testing-library/react";
import { it, expect } from "vitest";
import Badge from "./Badge";

it("matches snapshot for success variant", () => {
  const { container } = render(<Badge variant="success" label="Active" />);
  expect(container.firstChild).toMatchInlineSnapshot(`
    <span class="badge badge-success">
      Active
    </span>
  `);
});
```

## Summary

- Test components in isolation for speed and reliability
- Use semantic queries (role, label, text) over implementation-dependent selectors
- Simulate real user interactions with `userEvent` or equivalent
- Test behavior (what the user sees) rather than implementation (state internals)
- Use snapshots sparingly and always pair with behavioral tests
- Each language ecosystem has appropriate tools: RTL (JS), BeautifulSoup (Python), JSoup (Java), bUnit (C#)
