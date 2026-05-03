---
title: Mobile Testing
---

## Introduction to Mobile Testing

Mobile testing verifies that applications work correctly on smartphones and tablets across diverse devices, OS versions, screen sizes, and network conditions.

### Types of Mobile Applications

| Type | Description | Testing Approach |
|------|-------------|-----------------|
| **Native** | Built for specific OS (Swift/Kotlin) | Platform-specific tools |
| **Hybrid** | Web app in native container (Ionic) | WebView + native tools |
| **Mobile Web** | Responsive website in mobile browser | Browser automation |
| **Cross-platform** | React Native, Flutter | Platform-specific + shared |

---

## Native vs Hybrid vs Mobile Web

- **Native**: Full device access, best performance, separate codebases per platform
- **Hybrid**: Single codebase, web skills transfer, WebView inconsistencies
- **Mobile Web**: No install needed, limited device access, browser differences

---

## Appium: Cross-Platform Mobile Automation

Appium is the industry standard for automating native, hybrid, and mobile web apps on iOS and Android using the WebDriver protocol.

### Architecture

```
┌────────────────┐
│  Test Script   │  (Python, JS, Java, C#)
└───────┬────────┘
        │ HTTP (WebDriver Protocol)
        ▼
┌────────────────┐
│ Appium Server  │  (Node.js)
│  ┌──────────┐  │
│  │  Driver  │  │  (UiAutomator2 / XCUITest)
│  └────┬─────┘  │
└───────┼────────┘
        │ Platform-native commands
        ▼
┌────────────────┐
│ Device/Emulator│
│  ┌──────────┐  │
│  │   App    │  │
│  └──────────┘  │
└────────────────┘
```

1. **Client** sends WebDriver commands to Appium Server
2. **Appium** routes to the appropriate driver (UiAutomator2/XCUITest)
3. **Driver** translates to native automation commands
4. **Device** executes and returns results

---

## Desired Capabilities

| Capability | Purpose |
|-----------|---------|
| `platformName` | Android or iOS |
| `appium:automationName` | UiAutomator2, XCUITest |
| `appium:deviceName` | Emulator/device name |
| `appium:app` | Path to APK/IPA |
| `appium:noReset` | Preserve app state between tests |
| `appium:autoGrantPermissions` | Auto-accept permission dialogs |

### UiAutomator2 (Android)

Google's UI testing framework — supports API 21+, WebView automation, gesture support.

### XCUITest (iOS)

Apple's native test framework — supports iOS 13+, Simulator and real devices.

---

## Emulators vs Real Devices

| Factor | Emulators | Real Devices |
|--------|-----------|--------------|
| Cost | Free | Expensive farms |
| Speed | Fast startup | Slower |
| Hardware | Simulated (limited) | Camera, Bluetooth, GPS |
| CI/CD | Easy integration | Cloud farms (BrowserStack) |
| Accuracy | Approximate | True user experience |

**Strategy**: Emulators for dev/CI, real devices for release testing and performance.

---

## Mobile-Specific Challenges

- **Gestures**: Swipe, pinch, long press, double tap
- **Orientation**: Portrait/landscape transitions must preserve state
- **Push notifications**: Trigger, verify, and tap notifications
- **Network conditions**: Offline mode, slow connections, reconnection
- **Permissions**: Camera, location, contacts dialogs

---

## Simple Appium Test

### Python

```python
import pytest
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from appium.options import UiAutomator2Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class TestMobileLogin:
    def setup_method(self):
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.device_name = "Pixel_6_API_33"
        options.app = "/path/to/app-debug.apk"
        options.app_package = "com.example.myapp"
        options.app_activity = ".ui.LoginActivity"
        options.auto_grant_permissions = True

        self.driver = webdriver.Remote("http://localhost:4723", options=options)
        self.wait = WebDriverWait(self.driver, 15)

    def teardown_method(self):
        if self.driver:
            self.driver.quit()

    def test_successful_login(self):
        username = self.wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "username-input")
            )
        )
        username.send_keys("testuser")

        password = self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password-input")
        password.send_keys("password123")

        self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login-button").click()

        home_title = self.wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "home-title")
            )
        )
        assert home_title.text == "Welcome, testuser"

    def test_swipe_gesture(self):
        self.driver.execute_script("mobile: swipeGesture", {
            "left": 100, "top": 500, "width": 200, "height": 400,
            "direction": "up", "percent": 0.75,
        })
        element = self.wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ACCESSIBILITY_ID, "bottom-content")
            )
        )
        assert element.is_displayed()
```

### JavaScript

```javascript
const { remote } = require("webdriverio");

const capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_6_API_33",
  "appium:app": "/path/to/app-debug.apk",
  "appium:appPackage": "com.example.myapp",
  "appium:appActivity": ".ui.LoginActivity",
  "appium:autoGrantPermissions": true,
};

async function runTests() {
  const driver = await remote({
    hostname: "localhost",
    port: 4723,
    path: "/",
    capabilities,
  });

  try {
    // Successful login
    const username = await driver.$("~username-input");
    await username.waitForDisplayed({ timeout: 15000 });
    await username.setValue("testuser");

    const password = await driver.$("~password-input");
    await password.setValue("password123");

    const loginBtn = await driver.$("~login-button");
    await loginBtn.click();

    const homeTitle = await driver.$("~home-title");
    await homeTitle.waitForDisplayed({ timeout: 10000 });
    const text = await homeTitle.getText();
    console.assert(text === "Welcome, testuser", `Got: ${text}`);
    console.log("PASSED: Successful login");

    // Keyboard handling
    await driver.back();
    const field = await driver.$("~username-input");
    await field.waitForDisplayed({ timeout: 10000 });
    await field.click();
    console.assert(await driver.isKeyboardShown(), "Keyboard visible");
    await driver.hideKeyboard();
    console.assert(!(await driver.isKeyboardShown()), "Keyboard hidden");
    console.log("PASSED: Keyboard handling");
  } finally {
    await driver.deleteSession();
  }
}

runTests().catch(console.error);
```

### Java

```java
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.net.URL;
import java.time.Duration;

public class MobileLoginTest {
    private AndroidDriver driver;
    private WebDriverWait wait;

    public void setUp() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options()
            .setDeviceName("Pixel_6_API_33")
            .setApp("/path/to/app-debug.apk")
            .setAppPackage("com.example.myapp")
            .setAppActivity(".ui.LoginActivity")
            .setAutoGrantPermissions(true);

        driver = new AndroidDriver(new URL("http://localhost:4723"), options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public void tearDown() {
        if (driver != null) driver.quit();
    }

    public void testSuccessfulLogin() {
        WebElement username = wait.until(
            ExpectedConditions.presenceOfElementLocated(
                AppiumBy.accessibilityId("username-input")
            )
        );
        username.sendKeys("testuser");

        driver.findElement(AppiumBy.accessibilityId("password-input"))
              .sendKeys("password123");
        driver.findElement(AppiumBy.accessibilityId("login-button")).click();

        WebElement title = wait.until(
            ExpectedConditions.presenceOfElementLocated(
                AppiumBy.accessibilityId("home-title")
            )
        );
        assert title.getText().equals("Welcome, testuser");
        System.out.println("PASSED: Successful login");
    }

    public void testScrollToElement() {
        WebElement element = driver.findElement(
            AppiumBy.androidUIAutomator(
                "new UiScrollable(new UiSelector().scrollable(true))"
                + ".scrollIntoView(new UiSelector().description(\"terms-link\"))"
            )
        );
        assert element.isDisplayed();
        System.out.println("PASSED: Scroll to element");
    }

    public static void main(String[] args) throws Exception {
        MobileLoginTest test = new MobileLoginTest();
        test.setUp();
        try {
            test.testSuccessfulLogin();
            test.driver.resetApp();
            test.testScrollToElement();
        } finally {
            test.tearDown();
        }
    }
}
```

### C#

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;
using OpenQA.Selenium.Support.UI;

class MobileLoginTests
{
    private AndroidDriver _driver;
    private WebDriverWait _wait;

    public void SetUp()
    {
        var options = new AppiumOptions();
        options.PlatformName = "Android";
        options.AutomationName = "UiAutomator2";
        options.DeviceName = "Pixel_6_API_33";
        options.App = "/path/to/app-debug.apk";
        options.AddAdditionalAppiumOption("appPackage", "com.example.myapp");
        options.AddAdditionalAppiumOption("appActivity", ".ui.LoginActivity");
        options.AddAdditionalAppiumOption("autoGrantPermissions", true);

        _driver = new AndroidDriver(new Uri("http://localhost:4723"), options);
        _wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(15));
    }

    public void TearDown() => _driver?.Quit();

    public void TestSuccessfulLogin()
    {
        var username = _wait.Until(d =>
            d.FindElement(MobileBy.AccessibilityId("username-input"))
        );
        username.SendKeys("testuser");

        _driver.FindElement(MobileBy.AccessibilityId("password-input"))
               .SendKeys("password123");
        _driver.FindElement(MobileBy.AccessibilityId("login-button")).Click();

        var title = _wait.Until(d =>
            d.FindElement(MobileBy.AccessibilityId("home-title"))
        );
        Debug.Assert(title.Text == "Welcome, testuser");
        Console.WriteLine("PASSED: Successful login");
    }

    public void TestDeviceRotation()
    {
        var field = _wait.Until(d =>
            d.FindElement(MobileBy.AccessibilityId("username-input"))
        );
        field.SendKeys("rotation-test");

        _driver.Orientation = ScreenOrientation.Landscape;
        var after = _driver.FindElement(MobileBy.AccessibilityId("username-input"));
        Debug.Assert(after.Text == "rotation-test", "Text preserved");
        _driver.Orientation = ScreenOrientation.Portrait;
        Console.WriteLine("PASSED: Device rotation");
    }

    static void Main(string[] args)
    {
        var tests = new MobileLoginTests();
        tests.SetUp();
        try {
            tests.TestSuccessfulLogin();
            tests.TestDeviceRotation();
            Console.WriteLine("\nAll mobile tests passed!");
        } finally { tests.TearDown(); }
    }
}
```

---

## Best Practices

1. **Use Accessibility IDs** as locators — reliable cross-platform, improves app a11y
2. **Prefer explicit waits** — mobile actions are inherently slower
3. **Reset app state** between tests for isolation
4. **Test on emulators in CI**, real devices for release validation
5. **Handle permissions** with `autoGrantPermissions` or explicit dialogs
6. **Take screenshots on failure** for debugging in CI
7. **Test multiple orientations** and screen sizes

---

## Summary

- Mobile testing spans native, hybrid, and mobile web across diverse devices
- **Appium** provides cross-platform automation using the WebDriver protocol
- Use **UiAutomator2** (Android) and **XCUITest** (iOS) as automation drivers
- Balance emulators (speed, CI) with real devices (accuracy, hardware)
- Address mobile-specific concerns: gestures, orientation, notifications, network
