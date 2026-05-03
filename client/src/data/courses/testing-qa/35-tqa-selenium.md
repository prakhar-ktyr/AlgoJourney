---
title: Selenium WebDriver
---

## Introduction to Selenium

Selenium is the most widely adopted open-source framework for automating web browsers. It supports cross-browser testing (Chrome, Firefox, Safari, Edge) and cross-language development (Python, JavaScript, Java, C#, Ruby, Kotlin).

### Why Selenium?

- **Cross-browser compatibility**: Write once, run on any major browser
- **Language flexibility**: Use your team's preferred programming language
- **Large ecosystem**: Extensive community, plugins, and integrations
- **Industry standard**: Widely adopted in enterprise environments
- **Open source**: No licensing costs, active development

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Test Script │────▶│ Browser      │────▶│ Browser     │
│ (Client)    │◀────│ Driver       │◀────│ (Chrome,    │
│             │     │ (ChromeDriver│     │  Firefox)   │
└─────────────┘     └──────────────┘     └─────────────┘
      W3C WebDriver Protocol        Native Browser Commands
```

1. **Test script** sends commands via the W3C WebDriver protocol
2. **Browser driver** (ChromeDriver, GeckoDriver) translates to native commands
3. **Browser** executes actions and returns results back through the chain

---

## Setup: Installing Drivers

| Browser | Driver |
|---------|--------|
| Chrome | ChromeDriver |
| Firefox | GeckoDriver |
| Edge | EdgeDriver |
| Safari | SafariDriver (built-in) |

```python
# pip install selenium webdriver-manager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)
driver.get("https://example.com")
print(f"Title: {driver.title}")
driver.quit()
```

```javascript
// npm install selenium-webdriver chromedriver
const { Builder, Browser } = require("selenium-webdriver");

async function main() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  try {
    await driver.get("https://example.com");
    console.log("Title:", await driver.getTitle());
  } finally {
    await driver.quit();
  }
}
main();
```

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class Setup {
    public static void main(String[] args) {
        WebDriverManager.chromedriver().setup();
        WebDriver driver = new ChromeDriver();
        driver.get("https://example.com");
        System.out.println("Title: " + driver.getTitle());
        driver.quit();
    }
}
```

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using WebDriverManager;
using WebDriverManager.DriverConfigs.Impl;

new DriverManager().SetUpDriver(new ChromeConfig());
using var driver = new ChromeDriver();
driver.Navigate().GoToUrl("https://example.com");
Console.WriteLine($"Title: {driver.Title}");
driver.Quit();
```

---

## WebDriver API: Navigate, Find, Interact

### Locator Strategies

| Strategy | Example |
|----------|---------|
| ID | `By.id("username")` |
| CSS Selector | `By.css("input[type='email']")` |
| XPath | `By.xpath("//button[@type='submit']")` |
| Name | `By.name("email")` |
| Link Text | `By.linkText("Sign Up")` |

### Interactions and Waits

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://example.com/form")
wait = WebDriverWait(driver, 10)

username = wait.until(EC.visibility_of_element_located((By.ID, "username")))
username.clear()
username.send_keys("testuser")

password = driver.find_element(By.ID, "password")
password.send_keys("secret123")

submit = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
submit.click()

result = wait.until(EC.visibility_of_element_located((By.ID, "success")))
print(f"Result: {result.text}")
driver.quit()
```

---

## Page Object Model

The Page Object Model (POM) encapsulates page interactions in classes, improving maintainability and readability.

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class LoginPage:
    URL = "https://example.com/login"
    USERNAME = (By.ID, "username")
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR = (By.CLASS_NAME, "error-message")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def navigate(self):
        self.driver.get(self.URL)
        return self

    def login(self, username, password):
        self.wait.until(EC.visibility_of_element_located(self.USERNAME)).send_keys(username)
        self.driver.find_element(*self.PASSWORD).send_keys(password)
        self.driver.find_element(*self.SUBMIT).click()
        return DashboardPage(self.driver)

    def get_error(self):
        return self.wait.until(EC.visibility_of_element_located(self.ERROR)).text


class DashboardPage:
    WELCOME = (By.CLASS_NAME, "welcome-msg")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def get_welcome_message(self):
        return self.wait.until(EC.visibility_of_element_located(self.WELCOME)).text


# Test
driver = webdriver.Chrome()
page = LoginPage(driver).navigate()
dashboard = page.login("validuser", "validpass")
assert "Welcome" in dashboard.get_welcome_message()
driver.quit()
```

```javascript
const { Builder, By, until } = require("selenium-webdriver");

class LoginPage {
  constructor(driver) { this.driver = driver; }
  async navigate() { await this.driver.get("https://example.com/login"); return this; }

  async login(username, password) {
    await this.driver.findElement(By.id("username")).sendKeys(username);
    await this.driver.findElement(By.id("password")).sendKeys(password);
    await this.driver.findElement(By.css("button[type='submit']")).click();
    return new DashboardPage(this.driver);
  }

  async getError() {
    const el = await this.driver.wait(until.elementLocated(By.className("error-message")), 5000);
    return el.getText();
  }
}

class DashboardPage {
  constructor(driver) { this.driver = driver; }
  async getWelcome() {
    const el = await this.driver.wait(until.elementLocated(By.className("welcome-msg")), 5000);
    return el.getText();
  }
}

(async () => {
  const driver = await new Builder().forBrowser("chrome").build();
  try {
    const dash = await (await new LoginPage(driver).navigate()).login("user", "pass");
    console.assert((await dash.getWelcome()).includes("Welcome"));
  } finally { await driver.quit(); }
})();
```

```java
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.*;
import java.time.Duration;

class LoginPage {
    private WebDriverWait wait;
    @FindBy(id = "username") private WebElement usernameInput;
    @FindBy(id = "password") private WebElement passwordInput;
    @FindBy(css = "button[type='submit']") private WebElement submitBtn;

    public LoginPage(WebDriver driver) {
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }

    public void login(String user, String pass) {
        wait.until(ExpectedConditions.visibilityOf(usernameInput)).sendKeys(user);
        passwordInput.sendKeys(pass);
        submitBtn.click();
    }
}

public class LoginTest {
    public static void main(String[] args) {
        WebDriver driver = new ChromeDriver();
        driver.get("https://example.com/login");
        new LoginPage(driver).login("user", "pass");
        driver.quit();
    }
}
```

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.PageObjects;

public class LoginPage {
    private WebDriverWait _wait;
    [FindsBy(How = How.Id, Using = "username")] private IWebElement Username;
    [FindsBy(How = How.Id, Using = "password")] private IWebElement Password;
    [FindsBy(How = How.CssSelector, Using = "button[type='submit']")] private IWebElement Submit;

    public LoginPage(IWebDriver driver) {
        _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        PageFactory.InitElements(driver, this);
    }

    public void Login(string user, string pass) {
        _wait.Until(d => Username.Displayed);
        Username.SendKeys(user);
        Password.SendKeys(pass);
        Submit.Click();
    }
}

// Usage
using var driver = new ChromeDriver();
driver.Navigate().GoToUrl("https://example.com/login");
new LoginPage(driver).Login("user", "pass");
driver.Quit();
```

---

## Handling Alerts, Frames, Windows

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://example.com/alerts")

# Alerts
driver.find_element(By.ID, "alert-btn").click()
alert = WebDriverWait(driver, 5).until(EC.alert_is_present())
alert.accept()  # or alert.dismiss(), alert.send_keys("text")

# Frames
driver.switch_to.frame("my-iframe")
driver.find_element(By.ID, "frame-content").click()
driver.switch_to.default_content()

# Multiple windows
main = driver.current_window_handle
driver.find_element(By.ID, "new-window-link").click()
for handle in driver.window_handles:
    if handle != main:
        driver.switch_to.window(handle)
        break
driver.close()
driver.switch_to.window(main)
driver.quit()
```

---

## Selenium Grid for Parallel Execution

Selenium Grid distributes tests across multiple machines and browsers.

```
┌──────────────────────────────────────────────┐
│             Selenium Grid Hub                │
└─────┬──────────────────┬──────────────┬──────┘
      ▼                  ▼              ▼
┌──────────┐     ┌──────────┐    ┌──────────┐
│  Node 1  │     │  Node 2  │    │  Node 3  │
│  Chrome  │     │  Firefox │    │  Edge    │
└──────────┘     └──────────┘    └──────────┘
```

```python
from selenium import webdriver

options = webdriver.ChromeOptions()
options.add_argument("--headless")
driver = webdriver.Remote(command_executor="http://localhost:4444/wd/hub", options=options)
driver.get("https://example.com")
print(f"Grid - Title: {driver.title}")
driver.quit()
```

```javascript
const { Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const options = new chrome.Options().addArguments("--headless");
const driver = await new Builder()
  .usingServer("http://localhost:4444/wd/hub")
  .setChromeOptions(options)
  .build();
await driver.get("https://example.com");
console.log("Grid - Title:", await driver.getTitle());
await driver.quit();
```

```java
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.net.URL;

ChromeOptions options = new ChromeOptions();
options.addArguments("--headless");
var driver = new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), options);
driver.get("https://example.com");
System.out.println("Grid - Title: " + driver.getTitle());
driver.quit();
```

```csharp
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Chrome;

var options = new ChromeOptions();
options.AddArgument("--headless");
var driver = new RemoteWebDriver(new Uri("http://localhost:4444/wd/hub"), options);
driver.Navigate().GoToUrl("https://example.com");
Console.WriteLine($"Grid - Title: {driver.Title}");
driver.Quit();
```

---

## Best Practices

1. **Use explicit waits** — never `Thread.sleep` or implicit waits
2. **Implement Page Object Model** for maintainability
3. **Prefer ID/CSS selectors** over fragile XPath
4. **Run headless in CI/CD** for speed
5. **Take screenshots on failure** for debugging
6. **Use Selenium Grid** or cloud services for parallel execution
7. **Always quit the driver** in teardown/finally blocks
