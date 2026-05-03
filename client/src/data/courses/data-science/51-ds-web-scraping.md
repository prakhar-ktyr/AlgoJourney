---
title: Web Scraping
---

# Web Scraping

Web scraping is the process of **automatically extracting data from websites**. It allows you to collect large amounts of information that would be tedious to gather manually.

---

## Why Web Scraping?

Many valuable datasets aren't available as downloads or APIs. Web scraping lets you:

- Collect product prices from e-commerce sites
- Gather news articles for analysis
- Build datasets from public information
- Monitor competitors' websites
- Research job postings, real estate listings, etc.

---

## Ethics and Legality

Before scraping any website, always consider these rules:

| Rule | Description |
|------|-------------|
| Check `robots.txt` | Visit `site.com/robots.txt` to see what's allowed |
| Respect rate limits | Don't send too many requests per second |
| Terms of service | Read the site's ToS — some prohibit scraping |
| Don't overload servers | Add delays between requests |
| Public data only | Never scrape private or login-protected data without permission |
| Give credit | Attribute data sources when publishing |

```python
# Check robots.txt before scraping
import requests

robots = requests.get("https://example.com/robots.txt")
print(robots.text)
```

---

## HTML Basics for Scraping

Websites are built with **HTML** (HyperText Markup Language). Understanding HTML structure is essential for scraping.

### Tags, Attributes, Classes, and IDs

```html
<!-- HTML element structure -->
<tag attribute="value">Content</tag>

<!-- Examples -->
<h1 class="title">Welcome</h1>
<a href="https://example.com" id="main-link">Click here</a>
<div class="product-card">
  <span class="price">$29.99</span>
  <p class="description">Great product</p>
</div>
```

Key concepts:

- **Tags**: `<div>`, `<p>`, `<a>`, `<table>`, `<span>`
- **Attributes**: extra info like `href`, `src`, `class`, `id`
- **Class**: groups similar elements (can repeat)
- **ID**: uniquely identifies one element

### Inspecting Elements

Use your browser's **Developer Tools** (right-click → Inspect) to:

1. Find the HTML structure of the data you want
2. Identify class names and IDs
3. Understand the page hierarchy

---

## The Requests Library

The `requests` library lets you download web pages in Python.

### Basic GET Request

```python
import requests

# Fetch a web page
url = "https://example.com"
response = requests.get(url)

# Check if request was successful
print(response.status_code)  # 200 = success
print(response.text[:500])   # First 500 chars of HTML
```

### Response Properties

```python
import requests

response = requests.get("https://api.example.com/data")

# Status code
print(response.status_code)   # 200, 404, 500, etc.

# Response content
print(response.text)          # HTML as string
print(response.content)       # Raw bytes
print(response.json())        # Parse JSON response

# Response headers
print(response.headers)       # Server response headers
```

### Headers and Parameters

```python
import requests

# Custom headers (mimic a real browser)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0"
}

# URL parameters (?key=value&key2=value2)
params = {
    "q": "python web scraping",
    "page": 1
}

response = requests.get(
    "https://example.com/search",
    headers=headers,
    params=params
)
print(response.url)  # Shows full URL with params
```

### Sessions (Maintain Cookies)

```python
import requests

# Session persists cookies across requests
session = requests.Session()
session.headers.update({"User-Agent": "MyBot/1.0"})

# First request sets cookies
session.get("https://example.com/login")

# Subsequent requests include cookies automatically
response = session.get("https://example.com/dashboard")
```

---

## BeautifulSoup

**BeautifulSoup** parses HTML and lets you navigate and search the document tree.

### Setup and Parsing

```python
from bs4 import BeautifulSoup
import requests

# Fetch the page
url = "https://example.com"
response = requests.get(url)

# Parse HTML
soup = BeautifulSoup(response.text, "html.parser")

# Print prettified HTML
print(soup.prettify()[:500])
```

### Finding Elements

```python
from bs4 import BeautifulSoup

html = """
<html>
<body>
  <h1 class="title">Products</h1>
  <div class="product">
    <span class="name">Laptop</span>
    <span class="price">$999</span>
  </div>
  <div class="product">
    <span class="name">Phone</span>
    <span class="price">$699</span>
  </div>
</body>
</html>
"""

soup = BeautifulSoup(html, "html.parser")

# Find first matching element
first_product = soup.find("div", class_="product")
print(first_product)

# Find ALL matching elements
all_products = soup.find_all("div", class_="product")
print(f"Found {len(all_products)} products")

# Find by ID
# soup.find(id="main-content")
```

### CSS Selectors

```python
from bs4 import BeautifulSoup

# CSS selectors — powerful and flexible
soup = BeautifulSoup(html, "html.parser")

# By class
items = soup.select(".product")

# By ID
# header = soup.select_one("#header")

# By tag
paragraphs = soup.select("p")

# Nested selectors
prices = soup.select(".product .price")

# Multiple classes
# soup.select(".card.featured")

# Attribute selectors
# soup.select('a[href*="example"]')
```

### Extracting Data

```python
from bs4 import BeautifulSoup

html = """
<a href="https://example.com" class="link">Visit Example</a>
<img src="photo.jpg" alt="A photo">
<p class="info">Hello <strong>World</strong></p>
"""

soup = BeautifulSoup(html, "html.parser")

# Get text content
link = soup.find("a")
print(link.text)            # "Visit Example"
print(link.get_text())      # Same thing

# Get attribute value
print(link.get("href"))     # "https://example.com"
print(link["href"])         # Same (raises error if missing)

# Get image source
img = soup.find("img")
print(img.get("src"))       # "photo.jpg"

# Get nested text (strips inner tags)
info = soup.find("p", class_="info")
print(info.get_text())      # "Hello World"
```

---

## Scraping Tables into DataFrames

Pandas can automatically extract HTML tables — the easiest scraping method!

```python
import pandas as pd

# Automatically find and parse all tables on a page
url = "https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)"
tables = pd.read_html(url)

print(f"Found {len(tables)} tables on the page")

# Access first table
df = tables[0]
print(df.head())
print(df.columns.tolist())
```

```python
import pandas as pd

# Read specific table by matching text
tables = pd.read_html(
    "https://example.com/stats",
    match="Population"  # Find table containing this text
)

df = tables[0]
print(df.shape)
print(df.head())
```

---

## Handling Pagination

Many sites split data across multiple pages. Loop through them:

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

all_data = []

# Loop through pages
for page in range(1, 6):  # Pages 1 to 5
    url = f"https://example.com/products?page={page}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    # Extract data from this page
    products = soup.find_all("div", class_="product")
    for product in products:
        name = product.find("h2").text.strip()
        price = product.find("span", class_="price").text.strip()
        all_data.append({"name": name, "price": price})

    print(f"Page {page}: found {len(products)} products")
    time.sleep(1)  # Be polite — wait 1 second between requests

# Convert to DataFrame
df = pd.DataFrame(all_data)
print(f"Total products scraped: {len(df)}")
print(df.head())
```

---

## Selenium (Brief)

Some websites render content with **JavaScript**. Regular requests won't see this content. **Selenium** controls a real browser.

```python
# Selenium — for JavaScript-rendered pages
from selenium import webdriver
from selenium.webdriver.common.by import By

# Start browser (headless = no visible window)
options = webdriver.ChromeOptions()
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)

# Load page (JavaScript executes)
driver.get("https://example.com/dynamic-page")

# Wait for content to load
driver.implicitly_wait(5)

# Find elements
items = driver.find_elements(By.CLASS_NAME, "item")
for item in items:
    print(item.text)

# Close browser
driver.quit()
```

---

## Scrapy (Brief)

**Scrapy** is a framework for large-scale web scraping projects.

```python
# Scrapy spider example (run with: scrapy crawl myspider)
import scrapy

class ProductSpider(scrapy.Spider):
    name = "products"
    start_urls = ["https://example.com/products"]

    def parse(self, response):
        for product in response.css(".product"):
            yield {
                "name": product.css("h2::text").get(),
                "price": product.css(".price::text").get(),
            }

        # Follow pagination
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

Use Scrapy when you need:
- Crawling thousands of pages
- Built-in rate limiting and retries
- Export to multiple formats
- Concurrent requests

---

## Saving Scraped Data

```python
import pandas as pd

# Assume df is your scraped DataFrame
df = pd.DataFrame({
    "name": ["Laptop", "Phone", "Tablet"],
    "price": [999, 699, 399],
    "rating": [4.5, 4.2, 4.0]
})

# Save to CSV
df.to_csv("scraped_products.csv", index=False)

# Save to JSON
df.to_json("scraped_products.json", orient="records", indent=2)

# Save to Excel
df.to_excel("scraped_products.xlsx", index=False)
```

---

## Complete Example: Scrape and Save

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

def scrape_quotes():
    """Scrape quotes from a practice website."""
    base_url = "https://quotes.toscrape.com/page/{}/"
    all_quotes = []

    for page in range(1, 11):
        response = requests.get(base_url.format(page))
        if response.status_code != 200:
            break

        soup = BeautifulSoup(response.text, "html.parser")
        quotes = soup.find_all("div", class_="quote")

        for quote in quotes:
            text = quote.find("span", class_="text").text
            author = quote.find("small", class_="author").text
            tags = [tag.text for tag in quote.find_all("a", class_="tag")]
            all_quotes.append({
                "text": text,
                "author": author,
                "tags": ", ".join(tags)
            })

        time.sleep(0.5)

    return pd.DataFrame(all_quotes)

# Run scraper
df = scrape_quotes()
print(f"Scraped {len(df)} quotes")
print(df.head())

# Save results
df.to_csv("quotes.csv", index=False)
```

---

## Common Challenges

| Challenge | Solution |
|-----------|----------|
| JavaScript rendering | Use Selenium or Playwright |
| Anti-scraping (CAPTCHA) | Use APIs if available instead |
| Rate limiting / IP blocks | Add delays, rotate User-Agent |
| Dynamic content | Inspect network tab for API calls |
| Login required | Use sessions with cookies |
| Changing HTML structure | Make selectors robust, add error handling |

---

## Try It Yourself

1. Visit [quotes.toscrape.com](http://quotes.toscrape.com) — a safe practice site
2. Inspect the HTML structure in your browser
3. Write a scraper to extract all quotes and authors
4. Handle pagination to get all pages
5. Save results to a CSV file

---

## Summary

| Concept | Tool/Method |
|---------|-------------|
| Download pages | `requests.get(url)` |
| Parse HTML | `BeautifulSoup(html, 'html.parser')` |
| Find elements | `.find()`, `.find_all()`, `.select()` |
| Extract data | `.text`, `.get('attr')` |
| Tables | `pd.read_html(url)` |
| JavaScript pages | Selenium |
| Large scale | Scrapy |
| Be ethical | Check robots.txt, add delays |

Web scraping is a powerful tool for data collection. Always scrape responsibly!
