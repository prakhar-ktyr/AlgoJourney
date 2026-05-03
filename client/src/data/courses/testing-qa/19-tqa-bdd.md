---
title: Behavior-Driven Development (BDD)
---

# Behavior-Driven Development (BDD)

Behavior-Driven Development is a collaborative approach to software development that bridges the gap between technical and non-technical stakeholders. It uses a shared language to describe system behavior, making requirements executable as automated tests.

## BDD Philosophy

BDD emerged from TDD with a focus on **behavior** rather than **tests**. The core principles:

1. **Collaboration** — Developers, QA, and product owners define behavior together
2. **Ubiquitous language** — Everyone uses the same terms (no translation needed)
3. **Outside-in development** — Start from user behavior, work inward
4. **Living documentation** — Specifications that are always up to date (because they run as tests)

### The Three Amigos

BDD encourages "Three Amigos" sessions where:
- **Product Owner** defines what the feature should do
- **Developer** considers how to implement it
- **Tester** identifies edge cases and scenarios

Together they write scenarios in plain language before any code is written.

## Gherkin Syntax

Gherkin is the domain-specific language used to write BDD scenarios. It uses keywords to structure behavior descriptions:

```
Feature: User Login
  As a registered user
  I want to log in to my account
  So that I can access my personal dashboard

  Scenario: Successful login with valid credentials
    Given a registered user with email "alice@example.com" and password "Secret123"
    When the user logs in with email "alice@example.com" and password "Secret123"
    Then the user should be redirected to the dashboard
    And the welcome message should say "Hello, Alice"

  Scenario: Failed login with wrong password
    Given a registered user with email "alice@example.com" and password "Secret123"
    When the user logs in with email "alice@example.com" and password "wrong"
    Then an error message "Invalid credentials" should be displayed
    And the user should remain on the login page

  Scenario: Account locked after 3 failed attempts
    Given a registered user with email "alice@example.com"
    When the user fails to log in 3 times
    Then the account should be locked
    And a message "Account locked. Please contact support." should be displayed
```

### Gherkin Keywords

| Keyword | Purpose |
|---------|---------|
| `Feature` | High-level description of what's being tested |
| `Scenario` | A specific example of behavior |
| `Given` | Preconditions (setup the world) |
| `When` | Action (the thing being tested) |
| `Then` | Expected outcome (assertions) |
| `And` / `But` | Additional steps within Given/When/Then |
| `Scenario Outline` | Template for parameterized scenarios |
| `Examples` | Data table for Scenario Outline |
| `Background` | Steps common to all scenarios in a feature |

### Scenario Outline (Parameterized Scenarios)

```
Feature: Shopping Cart Discount

  Scenario Outline: Applying quantity-based discounts
    Given a product priced at $<price>
    When the customer adds <quantity> items to the cart
    Then the discount should be <discount>%
    And the total should be $<total>

    Examples:
      | price | quantity | discount | total  |
      | 10.00 | 1        | 0        | 10.00  |
      | 10.00 | 5        | 10       | 45.00  |
      | 10.00 | 10       | 20       | 80.00  |
      | 10.00 | 20       | 30       | 140.00 |
```

### Background

```
Feature: Todo Management

  Background:
    Given a user is logged in
    And the todo list is empty

  Scenario: Adding a todo
    When the user adds "Buy milk"
    Then the todo list should contain "Buy milk"

  Scenario: Completing a todo
    Given the user has a todo "Buy milk"
    When the user marks "Buy milk" as complete
    Then "Buy milk" should appear in the completed list
```

## BDD Frameworks

| Language | Framework | Gherkin Support |
|----------|-----------|-----------------|
| Python | pytest-bdd | Yes |
| JavaScript | cucumber-js | Yes |
| Java | Cucumber | Yes |
| C# | SpecFlow / Reqnroll | Yes |

## Connecting Gherkin to Step Definitions

### Python — pytest-bdd

```python
# features/login.feature (Gherkin file)
# Feature: User Login
#   Scenario: Successful login with valid credentials
#     Given a registered user with email "alice@example.com" and password "Secret123"
#     When the user logs in with email "alice@example.com" and password "Secret123"
#     Then the user should be redirected to the dashboard

# test_login.py
import pytest
from pytest_bdd import scenario, given, when, then, parsers

@scenario("features/login.feature", "Successful login with valid credentials")
def test_successful_login():
    pass

@pytest.fixture
def context():
    return {}

@given(
    parsers.parse('a registered user with email "{email}" and password "{password}"'),
    target_fixture="context",
)
def registered_user(email, password):
    # Set up the user in the system
    user = create_user(email=email, password=password)
    return {"user": user, "response": None}

@when(
    parsers.parse('the user logs in with email "{email}" and password "{password}"')
)
def user_logs_in(context, email, password):
    context["response"] = login(email=email, password=password)

@then("the user should be redirected to the dashboard")
def redirected_to_dashboard(context):
    assert context["response"].status_code == 302
    assert context["response"].headers["Location"] == "/dashboard"

# conftest.py — shared steps can go here
@given("a user is logged in", target_fixture="logged_in_user")
def a_user_is_logged_in():
    user = create_user(email="test@example.com", password="Test123")
    session = login(email="test@example.com", password="Test123")
    return {"user": user, "session": session}
```

### JavaScript — cucumber-js

```javascript
// features/login.feature (same Gherkin as above)

// features/step_definitions/login.steps.js
const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");

let registeredUser;
let loginResponse;

Given(
  "a registered user with email {string} and password {string}",
  async function (email, password) {
    registeredUser = await createUser({ email, password });
  }
);

When(
  "the user logs in with email {string} and password {string}",
  async function (email, password) {
    loginResponse = await login({ email, password });
  }
);

Then("the user should be redirected to the dashboard", function () {
  assert.strictEqual(loginResponse.statusCode, 302);
  assert.strictEqual(loginResponse.headers.location, "/dashboard");
});

Then(
  "the welcome message should say {string}",
  function (expectedMessage) {
    assert.strictEqual(loginResponse.body.welcomeMessage, expectedMessage);
  }
);

Then(
  "an error message {string} should be displayed",
  function (expectedError) {
    assert.strictEqual(loginResponse.body.error, expectedError);
  }
);

Then("the user should remain on the login page", function () {
  assert.strictEqual(loginResponse.statusCode, 401);
});

// features/support/world.js — shared context
const { setWorldConstructor } = require("@cucumber/cucumber");

class CustomWorld {
  constructor() {
    this.users = new Map();
    this.currentResponse = null;
  }
}

setWorldConstructor(CustomWorld);
```

### Java — Cucumber

```java
// src/test/resources/features/login.feature (same Gherkin)

// src/test/java/steps/LoginSteps.java
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import static org.junit.jupiter.api.Assertions.*;

public class LoginSteps {
    private User registeredUser;
    private LoginResponse loginResponse;

    @Given("a registered user with email {string} and password {string}")
    public void aRegisteredUser(String email, String password) {
        registeredUser = UserService.createUser(email, password);
    }

    @When("the user logs in with email {string} and password {string}")
    public void userLogsIn(String email, String password) {
        loginResponse = AuthService.login(email, password);
    }

    @Then("the user should be redirected to the dashboard")
    public void redirectedToDashboard() {
        assertEquals(302, loginResponse.getStatusCode());
        assertEquals("/dashboard", loginResponse.getRedirectUrl());
    }

    @Then("the welcome message should say {string}")
    public void welcomeMessage(String expected) {
        assertEquals(expected, loginResponse.getWelcomeMessage());
    }

    @Then("an error message {string} should be displayed")
    public void errorMessage(String expected) {
        assertEquals(expected, loginResponse.getErrorMessage());
    }

    @Then("the user should remain on the login page")
    public void remainOnLoginPage() {
        assertEquals(401, loginResponse.getStatusCode());
    }
}

// src/test/java/RunCucumberTest.java
import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectPackages;
import org.junit.platform.suite.api.Suite;
import static io.cucumber.junit.platform.engine.Constants.*;

@Suite
@IncludeEngines("cucumber")
@SelectPackages("steps")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "steps")
@ConfigurationParameter(key = FEATURES_PROPERTY_NAME, value = "src/test/resources/features")
public class RunCucumberTest {
}
```

### C# — SpecFlow / Reqnroll

```csharp
// Features/Login.feature (same Gherkin)

// StepDefinitions/LoginSteps.cs
using Reqnroll;
using Xunit;

[Binding]
public class LoginSteps
{
    private User _registeredUser;
    private LoginResponse _loginResponse;

    [Given(@"a registered user with email ""(.*)"" and password ""(.*)""")]
    public void GivenARegisteredUser(string email, string password)
    {
        _registeredUser = UserService.CreateUser(email, password);
    }

    [When(@"the user logs in with email ""(.*)"" and password ""(.*)""")]
    public void WhenTheUserLogsIn(string email, string password)
    {
        _loginResponse = AuthService.Login(email, password);
    }

    [Then(@"the user should be redirected to the dashboard")]
    public void ThenRedirectedToDashboard()
    {
        Assert.Equal(302, _loginResponse.StatusCode);
        Assert.Equal("/dashboard", _loginResponse.RedirectUrl);
    }

    [Then(@"the welcome message should say ""(.*)""")]
    public void ThenWelcomeMessage(string expected)
    {
        Assert.Equal(expected, _loginResponse.WelcomeMessage);
    }

    [Then(@"an error message ""(.*)"" should be displayed")]
    public void ThenErrorMessage(string expected)
    {
        Assert.Equal(expected, _loginResponse.ErrorMessage);
    }

    [Then(@"the user should remain on the login page")]
    public void ThenRemainOnLoginPage()
    {
        Assert.Equal(401, _loginResponse.StatusCode);
    }
}

// Hooks/Hooks.cs — setup and teardown
using Reqnroll;

[Binding]
public class Hooks
{
    [BeforeScenario]
    public void BeforeScenario()
    {
        // Reset database, setup test fixtures
        TestDatabase.Reset();
    }

    [AfterScenario]
    public void AfterScenario()
    {
        // Cleanup
        TestDatabase.Cleanup();
    }
}
```

## BDD vs TDD: Complementary Approaches

| Aspect | TDD | BDD |
|--------|-----|-----|
| Audience | Developers | Whole team |
| Language | Code | Natural language (Gherkin) |
| Focus | Unit behavior | System behavior |
| Scope | Functions/methods | Features/user stories |
| Drives | Code design | Requirements clarity |
| Tests | Unit tests | Acceptance tests |

### How They Work Together

```
BDD (outer loop):
  Feature: Password validation
    Scenario: Strong password accepted
      Given a registration form
      When the user enters password "Str0ng!Pass"
      Then the password should be accepted

TDD (inner loop):
  test_password_minimum_length()
  test_password_requires_uppercase()
  test_password_requires_digit()
  test_password_requires_special_char()
```

BDD defines **what** the system should do (acceptance criteria). TDD defines **how** individual units implement that behavior. Use BDD for the outer acceptance test, TDD for the inner unit tests.

## Living Documentation

One of BDD's greatest benefits is that your test suite **is** your documentation:

```
Feature: Shopping Cart
  As a customer
  I want to manage items in my cart
  So that I can purchase what I need

  Scenario: Adding items increases total
    Given an empty cart
    When I add a "Widget" priced at $9.99
    And I add a "Gadget" priced at $14.99
    Then the cart total should be $24.98
    And the cart should contain 2 items

  Scenario: Removing items decreases total
    Given a cart with a "Widget" priced at $9.99
    When I remove the "Widget"
    Then the cart total should be $0.00
    And the cart should be empty
```

This Gherkin file serves as:
- A **specification** that product owners can read
- A **test** that developers can run
- **Documentation** that stays current (if tests pass, docs are accurate)

### Generating Documentation from Features

Most BDD frameworks can export feature files to formatted documentation:

```python
# pytest-bdd: use --gherkin-terminal-reporter for readable output
# cucumber-js: cucumber-js --format html:report.html
# Cucumber (Java): plugin = "html:target/cucumber-report.html"
# SpecFlow: built-in Living Doc generator
```

## Writing Good Scenarios

### Do: Focus on Behavior

```
Scenario: Expired coupon is rejected
  Given a coupon "SAVE20" that expired yesterday
  When the customer applies coupon "SAVE20"
  Then the coupon should be rejected
  And the message "This coupon has expired" should be shown
```

### Don't: Include Implementation Details

```
# BAD — too technical, coupled to UI implementation
Scenario: Expired coupon is rejected
  Given a row in the coupons table with code "SAVE20" and expiry "2024-01-01"
  When the user clicks the "Apply" button with id "#apply-coupon"
  Then the div with class ".error" should contain "This coupon has expired"
  And the HTTP response code should be 422
```

### Do: Use Declarative Style

```
# GOOD — describes intent
Given a customer with a premium subscription
When they view the content library
Then premium content should be visible
```

### Don't: Use Imperative Style

```
# BAD — describes clicks and fields
Given the user navigates to "/login"
And the user enters "alice@example.com" in the email field
And the user enters "password123" in the password field
And the user clicks the login button
And the user navigates to "/content"
Then the element "#premium-section" should be visible
```

## Anti-Patterns to Avoid

1. **Scenario as test script** — writing step-by-step UI interactions instead of behavior
2. **Too many scenarios** — testing every permutation instead of representative examples
3. **Incidental details** — including data that doesn't matter to the scenario
4. **Missing "why"** — Feature descriptions without business value
5. **Developer-only BDD** — writing Gherkin without involving product/QA

## Setting Up BDD Projects

### Python

```python
# Install
# pip install pytest-bdd

# Directory structure:
# tests/
#   features/
#     login.feature
#     cart.feature
#   step_defs/
#     test_login.py
#     test_cart.py
#   conftest.py

# pytest.ini
# [pytest]
# bdd_features_base_dir = tests/features/
```

### JavaScript

```javascript
// Install
// npm install --save-dev @cucumber/cucumber

// Directory structure:
// features/
//   login.feature
//   cart.feature
//   step_definitions/
//     login.steps.js
//     cart.steps.js
//   support/
//     world.js

// package.json
// "scripts": {
//   "test:bdd": "cucumber-js"
// }

// cucumber.js (config)
module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: ["features/step_definitions/**/*.js"],
    format: ["progress", "html:reports/cucumber.html"],
  },
};
```

### Java

```java
// pom.xml dependencies:
// <dependency>
//   <groupId>io.cucumber</groupId>
//   <artifactId>cucumber-java</artifactId>
//   <version>7.15.0</version>
//   <scope>test</scope>
// </dependency>
// <dependency>
//   <groupId>io.cucumber</groupId>
//   <artifactId>cucumber-junit-platform-engine</artifactId>
//   <version>7.15.0</version>
//   <scope>test</scope>
// </dependency>

// Directory structure:
// src/test/resources/features/
//   login.feature
//   cart.feature
// src/test/java/steps/
//   LoginSteps.java
//   CartSteps.java
// src/test/java/RunCucumberTest.java
```

### C#

```csharp
// Install NuGet packages:
// dotnet add package Reqnroll
// dotnet add package Reqnroll.xUnit

// Directory structure:
// Features/
//   Login.feature
//   Cart.feature
// StepDefinitions/
//   LoginSteps.cs
//   CartSteps.cs
// Hooks/
//   Hooks.cs

// reqnroll.json (config)
// {
//   "language": { "feature": "en" },
//   "bindingCulture": { "name": "en-US" }
// }
```

## Summary

BDD bridges communication gaps in software teams:
- **Gherkin** provides a shared language everyone can understand
- **Step definitions** connect natural language to automated tests
- **Living documentation** keeps specs always accurate
- BDD and TDD are complementary — use BDD for acceptance, TDD for units
- Focus on **behavior** (what), not **implementation** (how)
- Involve the whole team in writing scenarios
