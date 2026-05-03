---
title: Visual Regression Testing
---

# Visual Regression Testing

Visual regression testing detects unintended visual changes in your application by comparing screenshots of the current state against approved baselines. It catches CSS regressions, layout shifts, and rendering bugs that functional tests miss.

## What Is Visual Regression?

Visual regression occurs when a code change inadvertently alters the appearance of the UI. Traditional unit and integration tests verify logic and DOM structure but cannot detect:

- Overlapping elements
- Incorrect font sizes or colors
- Broken layouts at specific viewport sizes
- Z-index stacking issues
- Missing or misaligned icons

Visual regression testing automates the process of spotting these differences by capturing screenshots and comparing them pixel-by-pixel or perceptually.

## Screenshot Comparison Workflow

The core workflow consists of three phases:

1. **Baseline capture**: Take reference screenshots of the approved UI state
2. **Current capture**: Take screenshots of the same pages/components after code changes
3. **Diff generation**: Compare baseline and current images, highlighting differences

```
Baseline Image ──┐
                 ├── Comparison Engine ──► Diff Image + Pass/Fail
Current Image ───┘
```

### Pixel-by-Pixel Comparison

The simplest approach compares each pixel in the baseline with the corresponding pixel in the current screenshot. If the color values differ beyond a threshold, the pixel is marked as changed.

**Advantages:**
- Precise detection of any visual change
- Simple to implement

**Disadvantages:**
- Sensitive to anti-aliasing differences across platforms
- Sub-pixel rendering variations cause false positives
- Dynamic content (timestamps, ads) triggers failures

### Perceptual Comparison

More advanced tools use perceptual diff algorithms that account for human visual perception, reducing false positives from anti-aliasing and sub-pixel rendering differences.

## Tools for Visual Regression Testing

### Percy (BrowserStack)

Percy integrates with CI/CD pipelines and renders pages across multiple browsers and viewports. It provides a web dashboard for reviewing and approving visual changes.

### Chromatic (Storybook)

Chromatic captures screenshots of Storybook stories, making it ideal for component-level visual testing. It detects changes at the component level rather than full-page level.

### BackstopJS

An open-source tool that uses Puppeteer or Playwright to capture screenshots and compares them using a configurable threshold. Runs locally or in CI.

### Applitools Eyes

Uses AI-powered visual comparison (Visual AI) that understands layout and content, reducing false positives. Supports cross-browser testing and responsive design validation.

## Handling Dynamic Content

Dynamic content such as timestamps, advertisements, user avatars, and animated elements causes false positives. Strategies to handle them:

### Ignore Regions

Define rectangular regions to exclude from comparison:

```json
{
  "scenarios": [
    {
      "label": "Homepage",
      "url": "http://localhost:3000",
      "selectors": ["document"],
      "removeSelectors": [".ad-banner", ".timestamp"],
      "hideSelectors": [".animated-widget"]
    }
  ]
}
```

### Comparison Thresholds

Set a tolerance percentage so minor differences (anti-aliasing, font rendering) don't fail the test:

- **0%** threshold: Exact match required (very strict)
- **0.1-0.5%** threshold: Tolerates sub-pixel rendering differences
- **1-5%** threshold: Tolerates minor layout shifts (too lenient for most cases)

### Freezing Dynamic Content

- Replace dates/times with fixed values before capture
- Mock API responses to return consistent data
- Disable animations via CSS: `* { animation: none !important; transition: none !important; }`
- Wait for network idle before capturing

## Responsive Testing: Multiple Viewports

Visual regression tests should cover multiple viewport sizes to catch responsive design issues:

| Viewport   | Width  | Use Case          |
|-----------|--------|-------------------|
| Mobile    | 375px  | iPhone SE/12 Mini |
| Tablet    | 768px  | iPad Portrait     |
| Desktop   | 1280px | Standard laptop   |
| Wide      | 1920px | Full HD monitor   |

Configure your tool to capture at each breakpoint:

```json
{
  "viewports": [
    { "label": "mobile", "width": 375, "height": 812 },
    { "label": "tablet", "width": 768, "height": 1024 },
    { "label": "desktop", "width": 1280, "height": 800 },
    { "label": "wide", "width": 1920, "height": 1080 }
  ]
}
```

## Visual Testing in CI/CD

Integrating visual regression tests into CI/CD ensures every pull request is checked for visual changes:

1. **On PR creation**: Run visual tests against the feature branch
2. **Compare against main**: Use the main branch as the baseline
3. **Review dashboard**: Developers review diffs and approve intentional changes
4. **Update baselines**: Approved changes become the new baseline
5. **Block merge**: Unapproved visual changes prevent merging

### Best Practices for CI Integration

- Run visual tests in a consistent environment (Docker) to avoid OS-level rendering differences
- Use headless browsers with fixed viewport sizes
- Disable system fonts — use web fonts for consistency
- Set a fixed timezone and locale
- Cache baseline images for faster comparisons

## Code Examples

### Python: Selenium Screenshot with Pillow Comparison

```python
import os
from pathlib import Path
from PIL import Image, ImageChops
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class VisualRegressionTest:
    """Visual regression testing using Selenium and Pillow."""

    def __init__(self, baseline_dir="baselines", current_dir="current", diff_dir="diffs"):
        self.baseline_dir = Path(baseline_dir)
        self.current_dir = Path(current_dir)
        self.diff_dir = Path(diff_dir)
        self._create_directories()
        self.driver = None

    def _create_directories(self):
        for directory in [self.baseline_dir, self.current_dir, self.diff_dir]:
            directory.mkdir(parents=True, exist_ok=True)

    def setup_driver(self, width=1280, height=800):
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-gpu")
        options.add_argument(f"--window-size={width},{height}")
        options.add_argument("--force-device-scale-factor=1")
        self.driver = webdriver.Chrome(options=options)
        self.driver.set_window_size(width, height)

    def capture_screenshot(self, url, name, wait_for_selector=None):
        self.driver.get(url)
        if wait_for_selector:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located(("css selector", wait_for_selector))
            )
        # Disable animations for consistent screenshots
        self.driver.execute_script("""
            const style = document.createElement('style');
            style.textContent = '* { animation: none !important; transition: none !important; }';
            document.head.appendChild(style);
        """)
        screenshot_path = self.current_dir / f"{name}.png"
        self.driver.save_screenshot(str(screenshot_path))
        return screenshot_path

    def compare_images(self, name, threshold=0.001):
        baseline_path = self.baseline_dir / f"{name}.png"
        current_path = self.current_dir / f"{name}.png"

        if not baseline_path.exists():
            # No baseline exists — save current as baseline
            current_img = Image.open(current_path)
            current_img.save(baseline_path)
            return {"status": "baseline_created", "diff_percent": 0.0}

        baseline_img = Image.open(baseline_path)
        current_img = Image.open(current_path)

        if baseline_img.size != current_img.size:
            return {"status": "size_mismatch", "diff_percent": 100.0}

        diff = ImageChops.difference(baseline_img, current_img)
        diff_pixels = sum(1 for pixel in diff.getdata() if pixel != (0, 0, 0))
        total_pixels = baseline_img.size[0] * baseline_img.size[1]
        diff_percent = (diff_pixels / total_pixels) * 100

        # Save diff image with highlighted changes
        diff_highlighted = diff.point(lambda x: min(x * 10, 255))
        diff_highlighted.save(self.diff_dir / f"{name}_diff.png")

        passed = diff_percent <= (threshold * 100)
        return {"status": "pass" if passed else "fail", "diff_percent": diff_percent}

    def run_visual_test(self, url, name, viewports=None):
        viewports = viewports or [{"width": 1280, "height": 800, "label": "desktop"}]
        results = []

        for viewport in viewports:
            self.setup_driver(viewport["width"], viewport["height"])
            full_name = f"{name}_{viewport['label']}"
            self.capture_screenshot(url, full_name)
            result = self.compare_images(full_name)
            result["viewport"] = viewport["label"]
            results.append(result)
            self.driver.quit()

        return results


if __name__ == "__main__":
    tester = VisualRegressionTest()
    viewports = [
        {"width": 375, "height": 812, "label": "mobile"},
        {"width": 768, "height": 1024, "label": "tablet"},
        {"width": 1280, "height": 800, "label": "desktop"},
    ]
    results = tester.run_visual_test("http://localhost:3000", "homepage", viewports)
    for r in results:
        print(f"[{r['viewport']}] {r['status']} — diff: {r['diff_percent']:.4f}%")
```

### JavaScript: Playwright Screenshots with pixelmatch

```javascript
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

class VisualRegressionTester {
  constructor(options = {}) {
    this.baselineDir = options.baselineDir || "baselines";
    this.currentDir = options.currentDir || "current";
    this.diffDir = options.diffDir || "diffs";
    this.threshold = options.threshold || 0.1;
    this._ensureDirectories();
  }

  _ensureDirectories() {
    [this.baselineDir, this.currentDir, this.diffDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async captureScreenshot(url, name, viewport = { width: 1280, height: 800 }) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Disable animations for consistent captures
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    await page.goto(url, { waitUntil: "networkidle" });
    const screenshotPath = path.join(this.currentDir, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();
    return screenshotPath;
  }

  compareImages(name) {
    const baselinePath = path.join(this.baselineDir, `${name}.png`);
    const currentPath = path.join(this.currentDir, `${name}.png`);

    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(currentPath, baselinePath);
      return { status: "baseline_created", diffPixels: 0, diffPercent: 0 };
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));

    if (baseline.width !== current.width || baseline.height !== current.height) {
      return { status: "size_mismatch", diffPixels: -1, diffPercent: 100 };
    }

    const { width, height } = baseline;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      width,
      height,
      { threshold: this.threshold, includeAA: false }
    );

    const diffPath = path.join(this.diffDir, `${name}_diff.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercent = (numDiffPixels / totalPixels) * 100;

    return {
      status: diffPercent <= 0.1 ? "pass" : "fail",
      diffPixels: numDiffPixels,
      diffPercent: diffPercent.toFixed(4),
    };
  }

  async runVisualTests(scenarios) {
    const results = [];

    for (const scenario of scenarios) {
      const viewports = scenario.viewports || [
        { width: 1280, height: 800, label: "desktop" },
      ];

      for (const vp of viewports) {
        const testName = `${scenario.name}_${vp.label}`;
        await this.captureScreenshot(scenario.url, testName, {
          width: vp.width,
          height: vp.height,
        });
        const result = this.compareImages(testName);
        results.push({ scenario: testName, ...result });
      }
    }

    return results;
  }
}

// Usage
(async () => {
  const tester = new VisualRegressionTester({ threshold: 0.1 });

  const scenarios = [
    {
      name: "homepage",
      url: "http://localhost:3000",
      viewports: [
        { width: 375, height: 812, label: "mobile" },
        { width: 768, height: 1024, label: "tablet" },
        { width: 1280, height: 800, label: "desktop" },
      ],
    },
    {
      name: "login-page",
      url: "http://localhost:3000/login",
      viewports: [{ width: 1280, height: 800, label: "desktop" }],
    },
  ];

  const results = await tester.runVisualTests(scenarios);
  results.forEach((r) => {
    console.log(`[${r.scenario}] ${r.status} — diff: ${r.diffPercent}%`);
  });
})();
```

### Java: Visual Regression with aShot

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.Dimension;
import ru.yandex.qatools.ashot.AShot;
import ru.yandex.qatools.ashot.Screenshot;
import ru.yandex.qatools.ashot.comparison.ImageDiff;
import ru.yandex.qatools.ashot.comparison.ImageDiffer;
import ru.yandex.qatools.ashot.shooting.ShootingStrategies;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class VisualRegressionTest {

    private final Path baselineDir;
    private final Path currentDir;
    private final Path diffDir;
    private final double threshold;

    public VisualRegressionTest(String baselineDir, String currentDir,
                                 String diffDir, double threshold) {
        this.baselineDir = Paths.get(baselineDir);
        this.currentDir = Paths.get(currentDir);
        this.diffDir = Paths.get(diffDir);
        this.threshold = threshold;
        createDirectories();
    }

    private void createDirectories() {
        try {
            Files.createDirectories(baselineDir);
            Files.createDirectories(currentDir);
            Files.createDirectories(diffDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create directories", e);
        }
    }

    private WebDriver createDriver(int width, int height) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--no-sandbox", "--disable-gpu");
        options.addArguments("--force-device-scale-factor=1");
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().setSize(new Dimension(width, height));
        return driver;
    }

    public File captureScreenshot(String url, String name, int width, int height) {
        WebDriver driver = createDriver(width, height);
        try {
            driver.get(url);
            // Wait for page to stabilize
            Thread.sleep(2000);

            Screenshot screenshot = new AShot()
                .shootingStrategy(ShootingStrategies.viewportPasting(100))
                .takeScreenshot(driver);

            File outputFile = currentDir.resolve(name + ".png").toFile();
            ImageIO.write(screenshot.getImage(), "PNG", outputFile);
            return outputFile;
        } catch (Exception e) {
            throw new RuntimeException("Screenshot capture failed", e);
        } finally {
            driver.quit();
        }
    }

    public VisualTestResult compare(String name) {
        File baselineFile = baselineDir.resolve(name + ".png").toFile();
        File currentFile = currentDir.resolve(name + ".png").toFile();

        if (!baselineFile.exists()) {
            try {
                Files.copy(currentFile.toPath(), baselineFile.toPath());
                return new VisualTestResult("baseline_created", 0, 0.0);
            } catch (IOException e) {
                throw new RuntimeException("Failed to create baseline", e);
            }
        }

        try {
            BufferedImage baselineImage = ImageIO.read(baselineFile);
            BufferedImage currentImage = ImageIO.read(currentFile);

            ImageDiffer differ = new ImageDiffer();
            ImageDiff diff = differ.makeDiff(baselineImage, currentImage);

            int diffPixels = diff.getDiffSize();
            int totalPixels = baselineImage.getWidth() * baselineImage.getHeight();
            double diffPercent = ((double) diffPixels / totalPixels) * 100;

            // Save diff image
            File diffFile = diffDir.resolve(name + "_diff.png").toFile();
            ImageIO.write(diff.getMarkedImage(), "PNG", diffFile);

            String status = diffPercent <= threshold ? "pass" : "fail";
            return new VisualTestResult(status, diffPixels, diffPercent);
        } catch (IOException e) {
            throw new RuntimeException("Image comparison failed", e);
        }
    }

    public record VisualTestResult(String status, int diffPixels, double diffPercent) {
        @Override
        public String toString() {
            return String.format("[%s] diff: %.4f%% (%d pixels)", status, diffPercent, diffPixels);
        }
    }

    public static void main(String[] args) {
        VisualRegressionTest tester = new VisualRegressionTest(
            "baselines", "current", "diffs", 0.1
        );

        int[][] viewports = {{375, 812}, {768, 1024}, {1280, 800}};
        String[] labels = {"mobile", "tablet", "desktop"};

        for (int i = 0; i < viewports.length; i++) {
            String testName = "homepage_" + labels[i];
            tester.captureScreenshot(
                "http://localhost:3000", testName,
                viewports[i][0], viewports[i][1]
            );
            VisualTestResult result = tester.compare(testName);
            System.out.println(labels[i] + ": " + result);
        }
    }
}
```

### C#: Selenium Screenshot Comparison

```csharp
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace VisualRegression
{
    public class VisualTestResult
    {
        public string Status { get; set; }
        public int DiffPixels { get; set; }
        public double DiffPercent { get; set; }
        public string Viewport { get; set; }

        public override string ToString() =>
            $"[{Viewport}] {Status} — diff: {DiffPercent:F4}% ({DiffPixels} pixels)";
    }

    public class VisualRegressionTester
    {
        private readonly string _baselineDir;
        private readonly string _currentDir;
        private readonly string _diffDir;
        private readonly double _threshold;

        public VisualRegressionTester(
            string baselineDir = "baselines",
            string currentDir = "current",
            string diffDir = "diffs",
            double threshold = 0.1)
        {
            _baselineDir = baselineDir;
            _currentDir = currentDir;
            _diffDir = diffDir;
            _threshold = threshold;
            EnsureDirectories();
        }

        private void EnsureDirectories()
        {
            Directory.CreateDirectory(_baselineDir);
            Directory.CreateDirectory(_currentDir);
            Directory.CreateDirectory(_diffDir);
        }

        private IWebDriver CreateDriver(int width, int height)
        {
            var options = new ChromeOptions();
            options.AddArguments("--headless", "--no-sandbox", "--disable-gpu");
            options.AddArguments("--force-device-scale-factor=1");
            var driver = new ChromeDriver(options);
            driver.Manage().Window.Size = new Size(width, height);
            return driver;
        }

        public string CaptureScreenshot(string url, string name, int width, int height)
        {
            using var driver = CreateDriver(width, height);
            driver.Navigate().GoToUrl(url);

            // Disable animations
            ((IJavaScriptExecutor)driver).ExecuteScript(@"
                const style = document.createElement('style');
                style.textContent = '* { animation: none !important; transition: none !important; }';
                document.head.appendChild(style);
            ");

            System.Threading.Thread.Sleep(2000);

            var screenshot = ((ITakesScreenshot)driver).GetScreenshot();
            var filePath = Path.Combine(_currentDir, $"{name}.png");
            screenshot.SaveAsFile(filePath);
            return filePath;
        }

        public VisualTestResult Compare(string name)
        {
            var baselinePath = Path.Combine(_baselineDir, $"{name}.png");
            var currentPath = Path.Combine(_currentDir, $"{name}.png");

            if (!File.Exists(baselinePath))
            {
                File.Copy(currentPath, baselinePath);
                return new VisualTestResult
                {
                    Status = "baseline_created", DiffPixels = 0, DiffPercent = 0
                };
            }

            using var baselineBmp = new Bitmap(baselinePath);
            using var currentBmp = new Bitmap(currentPath);

            if (baselineBmp.Width != currentBmp.Width || baselineBmp.Height != currentBmp.Height)
            {
                return new VisualTestResult
                {
                    Status = "size_mismatch", DiffPixels = -1, DiffPercent = 100
                };
            }

            int diffPixels = 0;
            using var diffBmp = new Bitmap(baselineBmp.Width, baselineBmp.Height);

            for (int x = 0; x < baselineBmp.Width; x++)
            {
                for (int y = 0; y < baselineBmp.Height; y++)
                {
                    var baselinePixel = baselineBmp.GetPixel(x, y);
                    var currentPixel = currentBmp.GetPixel(x, y);

                    if (baselinePixel != currentPixel)
                    {
                        diffPixels++;
                        diffBmp.SetPixel(x, y, Color.Red);
                    }
                    else
                    {
                        diffBmp.SetPixel(x, y, Color.Transparent);
                    }
                }
            }

            var diffPath = Path.Combine(_diffDir, $"{name}_diff.png");
            diffBmp.Save(diffPath, ImageFormat.Png);

            int totalPixels = baselineBmp.Width * baselineBmp.Height;
            double diffPercent = ((double)diffPixels / totalPixels) * 100;

            return new VisualTestResult
            {
                Status = diffPercent <= _threshold ? "pass" : "fail",
                DiffPixels = diffPixels,
                DiffPercent = diffPercent
            };
        }

        public static void Main(string[] args)
        {
            var tester = new VisualRegressionTester(threshold: 0.1);
            var viewports = new[]
            {
                (Width: 375, Height: 812, Label: "mobile"),
                (Width: 768, Height: 1024, Label: "tablet"),
                (Width: 1280, Height: 800, Label: "desktop"),
            };

            foreach (var vp in viewports)
            {
                var testName = $"homepage_{vp.Label}";
                tester.CaptureScreenshot("http://localhost:3000", testName, vp.Width, vp.Height);
                var result = tester.Compare(testName);
                result.Viewport = vp.Label;
                Console.WriteLine(result);
            }
        }
    }
}
```

## Summary

Visual regression testing is essential for catching UI bugs that functional tests miss. Key takeaways:

- **Automate screenshot comparison** to detect unintended visual changes early
- **Handle dynamic content** with ignore regions, thresholds, and animation freezing
- **Test multiple viewports** to ensure responsive designs remain intact
- **Integrate into CI/CD** so visual changes are reviewed before merging
- **Use consistent environments** (Docker, headless browsers) to minimize false positives
