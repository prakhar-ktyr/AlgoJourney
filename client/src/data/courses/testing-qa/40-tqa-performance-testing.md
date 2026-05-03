---
title: Performance Testing
---

# Performance Testing

Performance testing validates that an application meets speed, scalability, and stability requirements under expected and extreme workloads. It identifies bottlenecks before they affect real users.

## Types of Performance Testing

### Load Testing

Simulates the expected number of concurrent users to verify the system handles normal traffic. Validates that response times and throughput remain within acceptable bounds under typical load.

**Example**: 500 concurrent users browsing an e-commerce site during business hours.

### Stress Testing

Pushes the system beyond normal capacity to find the breaking point. Identifies how the system degrades and whether it recovers gracefully after the load subsides.

**Example**: Gradually increasing from 500 to 5,000 concurrent users until errors appear.

### Spike Testing

Suddenly floods the system with a massive load to test how it handles abrupt traffic surges. Common scenario for flash sales, breaking news, or viral content.

**Example**: Instantly jumping from 100 to 10,000 users and observing response.

### Soak (Endurance) Testing

Runs the system under sustained moderate load for an extended period (hours or days). Identifies memory leaks, connection pool exhaustion, and degradation over time.

**Example**: 200 concurrent users for 24 hours continuously.

### Volume Testing

Tests with large amounts of data in the database or storage to verify performance doesn't degrade as data grows. Identifies slow queries and indexing issues.

**Example**: Testing search performance with 10 million vs 100 records.

## Key Metrics

### Response Time

Time from request sent to response received:

| Metric | Description | Target (API) |
|--------|------------|--------------|
| Average | Mean response time | < 200ms |
| Median (p50) | 50th percentile | < 150ms |
| p95 | 95th percentile | < 500ms |
| p99 | 99th percentile | < 1000ms |
| Max | Slowest response | < 3000ms |

**Why percentiles matter**: Averages hide outliers. If your average is 100ms but p99 is 5s, 1% of users experience 50x worse performance.

### Throughput

Number of requests successfully processed per unit time:

- **Requests per second (RPS)**: Total requests handled per second
- **Transactions per second (TPS)**: Complete business transactions per second
- **Bandwidth**: Data transferred per second (MB/s)

### Error Rate

Percentage of failed requests:

- **Target**: < 0.1% under normal load
- **Acceptable under stress**: < 1%
- **Failure indicator**: > 5%

Error types to track:
- HTTP 5xx (server errors)
- Timeouts
- Connection refused
- Malformed responses

### Percentile Breakdown

```
Response Time Distribution:
  p50  (median): 45ms   ████████░░░░░░░░ — Half of requests finish here
  p75          : 78ms   ████████████░░░░ — 75% finish here
  p90          : 150ms  ██████████████░░ — 90% finish here
  p95          : 280ms  ███████████████░ — 95% finish here
  p99          : 890ms  ████████████████ — 99% finish here
```

## Tools Overview

### Apache JMeter

Java-based, GUI and CLI modes, supports many protocols (HTTP, JDBC, FTP, LDAP). Extensive plugin ecosystem. Best for complex enterprise scenarios.

### Gatling

Scala-based, code-as-configuration approach. Generates detailed HTML reports. Excellent for CI/CD integration with its Maven/Gradle plugins.

### k6 (Grafana)

JavaScript-based scripting, Go runtime for performance. Developer-friendly with modern API. Supports cloud execution and Grafana dashboards.

### Locust

Python-based, defines user behavior as code. Distributed execution across multiple machines. Web UI for real-time monitoring. Easy to extend with custom logic.

### Artillery

Node.js-based, YAML configuration with JS scripting. Supports HTTP, WebSocket, Socket.io. Good for microservices and serverless testing.

## Load Testing a REST API

### Test Planning

Before writing tests, define:

1. **Target endpoints**: Which APIs to test
2. **User scenarios**: Realistic sequences of requests
3. **Load profile**: How many users, ramp-up time, duration
4. **Success criteria**: Response time thresholds, error rate limits

### Common Patterns

```
Ramp-Up Pattern:
  Users
  1000 |          ┌──────────────┐
       |         /               \
   500 |        /                 \
       |       /                   \
     0 |──────/                     \──────
       0    2min   5min        10min  12min
              ↑ ramp    ↑ steady    ↑ ramp-down

Spike Pattern:
  Users
  5000 |     ┌┐
       |     ││
  1000 |─────┘└─────────────────────
       0    2min  3min            10min

Step Pattern:
  Users
  1000 |                    ┌───────
       |          ┌─────────┘
   500 |    ┌─────┘
       |────┘
     0 |
       0   2min  4min   6min   8min
```

## Performance Budgets and Thresholds

Performance budgets define acceptable limits that trigger alerts or fail CI builds:

```yaml
# Example performance budget
thresholds:
  http_req_duration:
    - p(95) < 500    # 95% of requests under 500ms
    - p(99) < 1000   # 99% of requests under 1s
  http_req_failed:
    - rate < 0.01    # Less than 1% error rate
  http_reqs:
    - rate > 100     # At least 100 requests/second throughput
  iteration_duration:
    - p(95) < 2000   # 95% of scenarios complete under 2s
```

### Setting Realistic Budgets

- **Baseline first**: Run tests against the current system to establish baseline metrics
- **SLA-driven**: Derive budgets from service level agreements
- **User experience**: Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Business impact**: Correlate performance with conversion rates

## Monitoring During Tests

Effective performance testing requires monitoring both the client (test runner) and server sides:

### Client-Side Metrics (Test Runner)
- Virtual users active
- Requests per second
- Response time percentiles
- Error counts and types
- Data transferred

### Server-Side Metrics (Application)
- CPU utilization (per core and aggregate)
- Memory usage (heap, RSS)
- Disk I/O (read/write throughput, queue depth)
- Network I/O (bandwidth, connections)
- Database query times and connection pool usage
- Application-specific metrics (queue depth, cache hit rate)

### Correlation

Correlate client and server metrics to identify bottlenecks:
- High response time + high CPU → compute-bound bottleneck
- High response time + low CPU → I/O-bound (database, network, disk)
- High response time + connection pool exhaustion → pool size too small
- Increasing error rate + memory growth → memory leak

## Code Examples

### Python: Load Testing with Locust

```python
import time
import random
from locust import HttpUser, task, between, events, tag
from locust.runners import MasterRunner


class APIUser(HttpUser):
    """Simulates a user interacting with the REST API."""

    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    host = "http://localhost:5000"

    def on_start(self):
        """Called when a simulated user starts. Perform login."""
        response = self.client.post("/api/auth/login", json={
            "email": "loadtest@example.com",
            "password": "testpassword123",
        })
        if response.status_code == 200:
            token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            self.environment.runner.quit()

    @task(5)
    @tag("read")
    def get_questions_list(self):
        """Most common action: browsing questions (weight: 5)."""
        page = random.randint(1, 10)
        with self.client.get(
            f"/api/questions?page={page}&limit=20",
            name="/api/questions?page=[N]",
            catch_response=True,
        ) as response:
            if response.status_code == 200:
                data = response.json()
                if len(data.get("questions", [])) == 0:
                    response.failure("Empty questions list")
            elif response.status_code >= 500:
                response.failure(f"Server error: {response.status_code}")

    @task(3)
    @tag("read")
    def get_single_question(self):
        """View a specific question (weight: 3)."""
        question_id = random.choice(self._get_sample_ids())
        self.client.get(
            f"/api/questions/{question_id}",
            name="/api/questions/[id]",
        )

    @task(2)
    @tag("read")
    def search_questions(self):
        """Search functionality (weight: 2)."""
        terms = ["array", "binary", "tree", "graph", "dynamic", "sort"]
        query = random.choice(terms)
        self.client.get(
            f"/api/questions/search?q={query}",
            name="/api/questions/search?q=[term]",
        )

    @task(1)
    @tag("write")
    def update_progress(self):
        """Mark a question as completed (weight: 1)."""
        question_id = random.choice(self._get_sample_ids())
        self.client.put(
            f"/api/progress/{question_id}",
            json={"status": "completed", "notes": "Solved using DP"},
            name="/api/progress/[id]",
        )

    def _get_sample_ids(self):
        """Return sample question IDs for testing."""
        return [f"q{i}" for i in range(1, 51)]


class AdminUser(HttpUser):
    """Simulates an admin user with less frequent, heavier operations."""

    wait_time = between(5, 10)
    host = "http://localhost:5000"
    weight = 1  # 1 admin per 10 regular users

    def on_start(self):
        response = self.client.post("/api/auth/login", json={
            "email": "admin@example.com",
            "password": "adminpassword123",
        })
        if response.status_code == 200:
            token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})

    @task
    @tag("admin", "read")
    def get_analytics(self):
        """Fetch analytics dashboard data."""
        self.client.get("/api/admin/analytics")

    @task
    @tag("admin", "read")
    def get_all_users(self):
        """List all users with pagination."""
        self.client.get("/api/admin/users?page=1&limit=50")


# Custom event hooks for reporting
@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    if response_time > 2000:
        print(f"SLOW REQUEST: {request_type} {name} took {response_time}ms")


@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    if isinstance(environment.runner, MasterRunner):
        print("Load test starting on master node")


# Run with: locust -f locustfile.py --headless -u 100 -r 10 --run-time 5m
# -u 100: 100 total users
# -r 10: spawn 10 users per second
# --run-time 5m: run for 5 minutes
```

### JavaScript: Load Testing with k6

```javascript
import http from "k6/http";
import { check, group, sleep, fail } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { randomItem, randomIntBetween } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";

// Custom metrics
const errorRate = new Rate("errors");
const apiDuration = new Trend("api_duration", true);
const questionsLoaded = new Counter("questions_loaded");

// Test configuration
export const options = {
  stages: [
    { duration: "1m", target: 50 },   // Ramp up to 50 users
    { duration: "3m", target: 50 },   // Stay at 50 for 3 minutes
    { duration: "1m", target: 100 },  // Ramp up to 100 users
    { duration: "3m", target: 100 },  // Stay at 100 for 3 minutes
    { duration: "1m", target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: [
      "p(95)<500",  // 95% of requests must complete below 500ms
      "p(99)<1000", // 99% must complete below 1s
    ],
    http_req_failed: ["rate<0.01"],   // Less than 1% request failure
    errors: ["rate<0.05"],            // Custom error rate below 5%
    api_duration: ["p(95)<400"],      // Custom API duration threshold
  },
};

const BASE_URL = "http://localhost:5000";
const SAMPLE_IDS = Array.from({ length: 50 }, (_, i) => `q${i + 1}`);
const SEARCH_TERMS = ["array", "binary", "tree", "graph", "dynamic", "sort", "hash"];

// Setup: runs once before the test
export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: "loadtest@example.com",
    password: "testpassword123",
  }), { headers: { "Content-Type": "application/json" } });

  if (loginRes.status !== 200) {
    fail("Login failed during setup");
  }

  return { token: loginRes.json("token") };
}

// Default function: runs for each virtual user
export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  };

  group("Browse Questions", () => {
    const page = randomIntBetween(1, 10);
    const res = http.get(`${BASE_URL}/api/questions?page=${page}&limit=20`, {
      headers,
      tags: { endpoint: "list_questions" },
    });

    const success = check(res, {
      "status is 200": (r) => r.status === 200,
      "response time < 300ms": (r) => r.timings.duration < 300,
      "has questions array": (r) => {
        const body = r.json();
        return body && Array.isArray(body.questions);
      },
    });

    errorRate.add(!success);
    apiDuration.add(res.timings.duration);
    if (success) questionsLoaded.add(1);
  });

  sleep(randomIntBetween(1, 2));

  group("View Question Detail", () => {
    const questionId = randomItem(SAMPLE_IDS);
    const res = http.get(`${BASE_URL}/api/questions/${questionId}`, {
      headers,
      tags: { endpoint: "get_question" },
    });

    const success = check(res, {
      "status is 200": (r) => r.status === 200,
      "has question data": (r) => r.json("question") !== undefined,
    });

    errorRate.add(!success);
    apiDuration.add(res.timings.duration);
  });

  sleep(randomIntBetween(1, 3));

  group("Search", () => {
    const query = randomItem(SEARCH_TERMS);
    const res = http.get(`${BASE_URL}/api/questions/search?q=${query}`, {
      headers,
      tags: { endpoint: "search" },
    });

    check(res, {
      "search returns 200": (r) => r.status === 200,
      "search response < 500ms": (r) => r.timings.duration < 500,
    });

    apiDuration.add(res.timings.duration);
  });

  sleep(randomIntBetween(2, 4));

  // Less frequent write operation
  if (Math.random() < 0.2) {
    group("Update Progress", () => {
      const questionId = randomItem(SAMPLE_IDS);
      const res = http.put(
        `${BASE_URL}/api/progress/${questionId}`,
        JSON.stringify({ status: "completed", notes: "Solved" }),
        { headers, tags: { endpoint: "update_progress" } }
      );

      check(res, {
        "update returns 200": (r) => r.status === 200,
      });
    });
  }
}

// Teardown: runs once after the test
export function teardown(data) {
  console.log("Load test completed. Review thresholds above.");
}

// Run with: k6 run --out json=results.json loadtest.js
```

### Java: Gatling Load Test Concept

```java
import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.time.Duration;
import java.util.Iterator;
import java.util.Map;
import java.util.Random;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class APILoadTest extends Simulation {

    // HTTP Protocol configuration
    private final HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:5000")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/LoadTest")
        .shareConnections();

    // Data feeders
    private final Iterator<Map<String, Object>> searchTermFeeder =
        Stream.generate((Supplier<Map<String, Object>>) () -> {
            String[] terms = {"array", "binary", "tree", "graph", "dynamic", "sort"};
            Random rand = new Random();
            return Map.of("searchTerm", terms[rand.nextInt(terms.length)]);
        }).iterator();

    private final Iterator<Map<String, Object>> pageFeeder =
        Stream.generate((Supplier<Map<String, Object>>) () -> {
            Random rand = new Random();
            return Map.of(
                "page", rand.nextInt(1, 11),
                "questionId", "q" + rand.nextInt(1, 51)
            );
        }).iterator();

    // Scenarios
    private final ScenarioBuilder browseScenario = scenario("Browse Questions")
        .exec(
            http("Login")
                .post("/api/auth/login")
                .body(StringBody("""
                    {"email": "loadtest@example.com", "password": "testpassword123"}
                    """))
                .check(status().is(200))
                .check(jsonPath("$.token").saveAs("authToken"))
        )
        .exitHereIfFailed()
        .exec(session -> session.set("Authorization", "Bearer " + session.getString("authToken")))
        .repeat(10).on(
            feed(pageFeeder)
            .exec(
                http("List Questions")
                    .get("/api/questions?page=#{page}&limit=20")
                    .header("Authorization", "#{Authorization}")
                    .check(status().is(200))
                    .check(jsonPath("$.questions").exists())
                    .check(responseTimeInMillis().lte(500))
            )
            .pause(Duration.ofSeconds(1), Duration.ofSeconds(3))
            .exec(
                http("View Question")
                    .get("/api/questions/#{questionId}")
                    .header("Authorization", "#{Authorization}")
                    .check(status().is(200))
            )
            .pause(Duration.ofSeconds(1), Duration.ofSeconds(2))
        );

    private final ScenarioBuilder searchScenario = scenario("Search Questions")
        .exec(
            http("Login")
                .post("/api/auth/login")
                .body(StringBody("""
                    {"email": "loadtest@example.com", "password": "testpassword123"}
                    """))
                .check(status().is(200))
                .check(jsonPath("$.token").saveAs("authToken"))
        )
        .exitHereIfFailed()
        .repeat(5).on(
            feed(searchTermFeeder)
            .exec(
                http("Search")
                    .get("/api/questions/search?q=#{searchTerm}")
                    .header("Authorization", "Bearer #{authToken}")
                    .check(status().is(200))
                    .check(responseTimeInMillis().lte(500))
            )
            .pause(Duration.ofSeconds(2), Duration.ofSeconds(5))
        );

    // Load profile
    {
        setUp(
            browseScenario.injectOpen(
                rampUsers(50).during(Duration.ofMinutes(1)),   // Ramp to 50 over 1 min
                constantUsersPerSec(10).during(Duration.ofMinutes(3)), // Steady state
                rampUsers(100).during(Duration.ofMinutes(1))   // Ramp to 100
            ),
            searchScenario.injectOpen(
                rampUsers(20).during(Duration.ofMinutes(1)),
                constantUsersPerSec(5).during(Duration.ofMinutes(3))
            )
        )
        .protocols(httpProtocol)
        .assertions(
            global().responseTime().percentile3().lt(500),   // p95 < 500ms
            global().responseTime().percentile4().lt(1000),  // p99 < 1000ms
            global().failedRequests().percent().lt(1.0),     // < 1% failures
            global().requestsPerSec().gt(50.0)              // > 50 req/s
        );
    }
}

// Run with Maven:
// mvn gatling:test -Dgatling.simulationClass=APILoadTest
//
// Or Gradle:
// ./gradlew gatlingRun-APILoadTest
```

### C#: Load Testing with NBomber

```csharp
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

namespace PerformanceTesting
{
    public class LoadTestConfig
    {
        public string BaseUrl { get; set; } = "http://localhost:5000";
        public int RampUpUsers { get; set; } = 50;
        public int SteadyUsers { get; set; } = 100;
        public TimeSpan RampUpDuration { get; set; } = TimeSpan.FromMinutes(1);
        public TimeSpan SteadyDuration { get; set; } = TimeSpan.FromMinutes(3);
        public TimeSpan RampDownDuration { get; set; } = TimeSpan.FromMinutes(1);
    }

    public class APILoadTest
    {
        private readonly LoadTestConfig _config;
        private readonly HttpClient _httpClient;
        private string _authToken;

        public APILoadTest(LoadTestConfig config = null)
        {
            _config = config ?? new LoadTestConfig();
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(_config.BaseUrl)
            };
        }

        private async Task<string> GetAuthToken()
        {
            if (_authToken != null) return _authToken;

            var loginPayload = JsonSerializer.Serialize(new
            {
                email = "loadtest@example.com",
                password = "testpassword123"
            });

            var response = await _httpClient.PostAsync(
                "/api/auth/login",
                new StringContent(loginPayload, Encoding.UTF8, "application/json")
            );

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<JsonElement>();
                _authToken = result.GetProperty("token").GetString();
            }

            return _authToken;
        }

        public void Run()
        {
            var random = new Random();
            var searchTerms = new[] { "array", "binary", "tree", "graph", "dynamic", "sort" };

            // Scenario: Browse questions
            var browseScenario = Scenario.Create("browse_questions", async context =>
            {
                var token = await GetAuthToken();
                var page = random.Next(1, 11);

                using var client = new HttpClient();
                client.BaseAddress = new Uri(_config.BaseUrl);
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);

                var request = Http.CreateRequest("GET", $"/api/questions?page={page}&limit=20");

                var response = await Http.Send(client, request);

                return response.StatusCode == "200"
                    ? Response.Ok(statusCode: response.StatusCode)
                    : Response.Fail(statusCode: response.StatusCode);
            })
            .WithLoadSimulations(
                Simulation.RampingInject(
                    rate: _config.RampUpUsers,
                    interval: TimeSpan.FromSeconds(1),
                    during: _config.RampUpDuration
                ),
                Simulation.Inject(
                    rate: _config.SteadyUsers,
                    interval: TimeSpan.FromSeconds(1),
                    during: _config.SteadyDuration
                ),
                Simulation.RampingInject(
                    rate: 0,
                    interval: TimeSpan.FromSeconds(1),
                    during: _config.RampDownDuration
                )
            );

            // Scenario: Search questions
            var searchScenario = Scenario.Create("search_questions", async context =>
            {
                var token = await GetAuthToken();
                var term = searchTerms[random.Next(searchTerms.Length)];

                using var client = new HttpClient();
                client.BaseAddress = new Uri(_config.BaseUrl);
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);

                var request = Http.CreateRequest("GET", $"/api/questions/search?q={term}");

                var response = await Http.Send(client, request);

                return response.StatusCode == "200"
                    ? Response.Ok(statusCode: response.StatusCode)
                    : Response.Fail(statusCode: response.StatusCode);
            })
            .WithLoadSimulations(
                Simulation.RampingInject(
                    rate: 20,
                    interval: TimeSpan.FromSeconds(1),
                    during: TimeSpan.FromMinutes(1)
                ),
                Simulation.Inject(
                    rate: 30,
                    interval: TimeSpan.FromSeconds(1),
                    during: TimeSpan.FromMinutes(3)
                )
            );

            // Scenario: Update progress (write operation)
            var writeScenario = Scenario.Create("update_progress", async context =>
            {
                var token = await GetAuthToken();
                var questionId = $"q{random.Next(1, 51)}";

                using var client = new HttpClient();
                client.BaseAddress = new Uri(_config.BaseUrl);
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);

                var payload = JsonSerializer.Serialize(new
                {
                    status = "completed",
                    notes = "Solved during load test"
                });

                var request = Http.CreateRequest("PUT", $"/api/progress/{questionId}")
                    .WithBody(new StringContent(payload, Encoding.UTF8, "application/json"));

                var response = await Http.Send(client, request);

                return response.StatusCode == "200"
                    ? Response.Ok(statusCode: response.StatusCode)
                    : Response.Fail(statusCode: response.StatusCode);
            })
            .WithLoadSimulations(
                Simulation.Inject(
                    rate: 10,
                    interval: TimeSpan.FromSeconds(1),
                    during: TimeSpan.FromMinutes(3)
                )
            );

            // Run the test
            NBomberRunner
                .RegisterScenarios(browseScenario, searchScenario, writeScenario)
                .WithReportFileName("api_load_test_report")
                .WithReportFolder("reports")
                .WithReportFormats(
                    NBomber.Contracts.ReportFormat.Html,
                    NBomber.Contracts.ReportFormat.Md
                )
                .Run();
        }
    }

    public class Program
    {
        public static void Main(string[] args)
        {
            var config = new LoadTestConfig
            {
                BaseUrl = "http://localhost:5000",
                RampUpUsers = 50,
                SteadyUsers = 100,
                RampUpDuration = TimeSpan.FromMinutes(1),
                SteadyDuration = TimeSpan.FromMinutes(3),
                RampDownDuration = TimeSpan.FromMinutes(1),
            };

            Console.WriteLine("Starting API Load Test...");
            Console.WriteLine($"Target: {config.BaseUrl}");
            Console.WriteLine($"Users: {config.RampUpUsers} → {config.SteadyUsers}");
            Console.WriteLine($"Duration: {config.RampUpDuration + config.SteadyDuration + config.RampDownDuration}");

            var loadTest = new APILoadTest(config);
            loadTest.Run();

            Console.WriteLine("\nLoad test completed. Check reports/ folder for results.");
        }
    }
}

// Run with:
// dotnet run --project PerformanceTesting.csproj
//
// Or as part of CI:
// dotnet test --filter "Category=Performance"
```

## Summary

Performance testing is critical for ensuring application reliability under load:

- **Choose the right test type** (load, stress, spike, soak) based on what you need to validate
- **Focus on percentiles** (p95, p99) rather than averages for realistic performance assessment
- **Set performance budgets** as thresholds in CI/CD to prevent regressions
- **Monitor both client and server** metrics to pinpoint bottlenecks
- **Use realistic scenarios** with think times and varied operations to simulate real user behavior
- **Test early and often** — integrate performance tests into your development workflow
