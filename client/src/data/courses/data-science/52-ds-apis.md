---
title: Working with APIs
---

# Working with APIs

An **API** (Application Programming Interface) is a set of rules that allows programs to communicate with each other. APIs let you access data and services from other applications programmatically.

---

## Why APIs for Data Science?

APIs provide structured, reliable access to data:

- Weather data, stock prices, social media posts
- No HTML parsing needed — data comes in clean JSON
- Official, documented, and maintained
- Often free for reasonable usage
- More stable than web scraping

---

## REST APIs

**REST** (Representational State Transfer) is the most common API architecture. It uses standard **HTTP** methods to interact with resources.

### How It Works

```
Client (your code) → HTTP Request → Server (API)
Client (your code) ← HTTP Response ← Server (API)
```

---

## HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Read/retrieve data | Get list of users |
| **POST** | Create new data | Create a new user |
| **PUT** | Update existing data | Update user info |
| **PATCH** | Partial update | Update just email |
| **DELETE** | Remove data | Delete a user |

For data science, you'll mostly use **GET** (reading data) and sometimes **POST** (sending data).

---

## API Concepts

### Endpoints

An endpoint is the **URL path** where you access a resource:

```
https://api.example.com/v1/users          ← endpoint
https://api.example.com/v1/users/123      ← specific user
https://api.example.com/v1/products       ← different resource
```

### Query Parameters

Parameters filter or modify the request:

```
https://api.example.com/users?page=2&limit=10&sort=name
                              ↑ key=value pairs after ?
```

### Headers

Metadata sent with the request:

```
Authorization: Bearer your_token_here
Content-Type: application/json
Accept: application/json
```

### Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK — success | Process the data |
| 201 | Created — resource made | Confirm creation |
| 400 | Bad Request — your fault | Fix your request |
| 401 | Unauthorized — need auth | Add/fix credentials |
| 403 | Forbidden — no access | Check permissions |
| 404 | Not Found | Check the URL |
| 429 | Rate Limited | Slow down requests |
| 500 | Server Error | Try again later |

---

## Using the Requests Library

### Basic GET Request

```python
import requests

# Simple GET request
url = "https://jsonplaceholder.typicode.com/posts"
response = requests.get(url)

# Check status
print(response.status_code)  # 200

# Parse JSON response
data = response.json()  # Returns Python list/dict
print(f"Got {len(data)} posts")
print(data[0])
```

### GET with Parameters

```python
import requests

# Query parameters
url = "https://jsonplaceholder.typicode.com/posts"
params = {
    "userId": 1,       # Filter by user
    "_limit": 5        # Limit results
}

response = requests.get(url, params=params)
data = response.json()

print(f"URL: {response.url}")
# https://jsonplaceholder.typicode.com/posts?userId=1&_limit=5

for post in data:
    print(f"- {post['title'][:50]}")
```

### POST Request

```python
import requests

# Send data to create a resource
url = "https://jsonplaceholder.typicode.com/posts"
new_post = {
    "title": "My Data Science Post",
    "body": "Learning about APIs is fun!",
    "userId": 1
}

response = requests.post(url, json=new_post)
print(response.status_code)  # 201 Created
print(response.json())
```

### Custom Headers

```python
import requests

url = "https://api.example.com/data"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
```

---

## Authentication

### API Keys

The simplest form — a unique string that identifies you.

```python
import requests

# API key in query parameter
url = "https://api.openweathermap.org/data/2.5/weather"
params = {
    "q": "London",
    "appid": "YOUR_API_KEY",
    "units": "metric"
}
response = requests.get(url, params=params)
data = response.json()
print(f"Temperature: {data['main']['temp']}°C")
```

```python
import requests

# API key in header
url = "https://api.example.com/data"
headers = {
    "X-API-Key": "YOUR_API_KEY"
}
response = requests.get(url, headers=headers)
```

### Bearer Tokens

```python
import requests

# Bearer token authentication
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."
}

response = requests.get(
    "https://api.github.com/user",
    headers=headers
)
print(response.json()["login"])
```

### OAuth2 (Brief)

OAuth2 is a more complex protocol where users grant your app limited access:

1. User authorizes your app
2. You receive an authorization code
3. Exchange code for access token
4. Use token in requests

Libraries like `requests-oauthlib` simplify this process.

---

## Working with JSON Responses

### Navigating Nested JSON

```python
import requests

# Fetch nested data
url = "https://jsonplaceholder.typicode.com/users/1"
response = requests.get(url)
user = response.json()

# Navigate nested structure
print(user["name"])                    # Top level
print(user["address"]["city"])         # Nested object
print(user["company"]["name"])         # Another nested
print(user["address"]["geo"]["lat"])   # Deep nesting
```

### JSON to DataFrame

```python
import requests
import pandas as pd

# Simple list of objects → DataFrame
url = "https://jsonplaceholder.typicode.com/users"
response = requests.get(url)
users = response.json()

df = pd.DataFrame(users)
print(df[["name", "email", "phone"]].head())
```

### Flattening Nested JSON

```python
import requests
import pandas as pd

url = "https://jsonplaceholder.typicode.com/users"
response = requests.get(url)
users = response.json()

# json_normalize flattens nested objects
df = pd.json_normalize(users)
print(df.columns.tolist())
# ['id', 'name', 'email', ..., 'address.street', 'address.city',
#  'company.name', 'company.catchPhrase', ...]

print(df[["name", "address.city", "company.name"]].head())
```

---

## Pagination

APIs often return data in pages. You need to loop through them:

```python
import requests
import pandas as pd
import time

all_data = []
page = 1

while True:
    response = requests.get(
        "https://api.example.com/items",
        params={"page": page, "per_page": 100}
    )

    data = response.json()

    # Stop if no more data
    if not data:
        break

    all_data.extend(data)
    print(f"Page {page}: got {len(data)} items")
    page += 1
    time.sleep(0.5)  # Respect rate limits

df = pd.DataFrame(all_data)
print(f"Total items: {len(df)}")
```

### Link-Based Pagination

Some APIs provide "next" links in response headers:

```python
import requests

url = "https://api.github.com/users"
all_users = []

while url:
    response = requests.get(url, params={"per_page": 30})
    all_users.extend(response.json())

    # Check for 'next' link in headers
    links = response.headers.get("Link", "")
    if 'rel="next"' in links:
        # Extract next URL from Link header
        url = links.split(";")[0].strip("<>")
    else:
        url = None

print(f"Fetched {len(all_users)} users")
```

---

## Rate Limiting

APIs limit how many requests you can make. Handle this gracefully:

```python
import requests
import time

def fetch_with_rate_limit(url, params=None, max_retries=3):
    """Fetch URL with automatic retry on rate limit."""
    for attempt in range(max_retries):
        response = requests.get(url, params=params)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            # Rate limited — wait and retry
            wait_time = int(response.headers.get("Retry-After", 60))
            print(f"Rate limited. Waiting {wait_time}s...")
            time.sleep(wait_time)
        else:
            print(f"Error {response.status_code}")
            return None

    print("Max retries reached")
    return None

# Use the function
data = fetch_with_rate_limit("https://api.example.com/data")
```

---

## Error Handling

```python
import requests

def safe_api_call(url, params=None):
    """Make API call with comprehensive error handling."""
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()  # Raises exception for 4xx/5xx
        return response.json()

    except requests.exceptions.Timeout:
        print("Request timed out")
    except requests.exceptions.ConnectionError:
        print("Could not connect to server")
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e.response.status_code}")
    except requests.exceptions.JSONDecodeError:
        print("Response is not valid JSON")
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")

    return None

# Use it
data = safe_api_call("https://jsonplaceholder.typicode.com/posts/1")
if data:
    print(data["title"])
```

---

## Popular Public APIs for Data Science

| API | Data | Free Tier |
|-----|------|-----------|
| OpenWeatherMap | Weather data | 1000 calls/day |
| REST Countries | Country info | Unlimited |
| GitHub API | Repos, users, code | 60 req/hour (unauth) |
| Alpha Vantage | Stock market | 5 calls/min |
| NewsAPI | News articles | 100 req/day |
| Reddit API | Posts, comments | Rate limited |
| JSONPlaceholder | Fake test data | Unlimited |

---

## Complete Example: Weather Data Pipeline

```python
import requests
import pandas as pd
import time

def get_weather(city, api_key):
    """Fetch weather data for a city."""
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric"
    }

    response = requests.get(url, params=params, timeout=10)
    if response.status_code == 200:
        data = response.json()
        return {
            "city": city,
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "description": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"]
        }
    return None

# Fetch weather for multiple cities
api_key = "YOUR_API_KEY"
cities = ["London", "Paris", "Tokyo", "New York", "Sydney"]
weather_data = []

for city in cities:
    result = get_weather(city, api_key)
    if result:
        weather_data.append(result)
        print(f"{city}: {result['temperature']}°C")
    time.sleep(1)  # Respect rate limits

# Create DataFrame
df = pd.DataFrame(weather_data)
print("\n", df)

# Save to CSV
df.to_csv("weather_data.csv", index=False)
```

---

## Try It Yourself

1. Get a free API key from [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com)
2. Fetch all posts and convert to a DataFrame
3. Filter posts by a specific user
4. Handle potential errors gracefully
5. Save the results to a CSV file

---

## Summary

| Concept | Code |
|---------|------|
| GET request | `requests.get(url, params={})` |
| POST request | `requests.post(url, json={})` |
| Auth header | `headers={"Authorization": "Bearer TOKEN"}` |
| Parse JSON | `response.json()` |
| Flatten nested | `pd.json_normalize(data)` |
| Pagination | Loop with page parameter |
| Rate limits | `time.sleep()` + retry logic |
| Error handling | `try/except` + `raise_for_status()` |

APIs are the most reliable way to get structured data for your projects!
