---
title: Parameterized & Data-Driven Tests
---

# Parameterized & Data-Driven Tests

Parameterized tests let you run the same test logic with different inputs and expected outputs. Instead of writing separate test functions for each case, you define the test once and supply it with a table of data.

## Why Parameterize?

Consider testing an `is_palindrome` function:

```python
# Without parameterization — repetitive
def test_racecar_is_palindrome():
    assert is_palindrome("racecar") == True

def test_hello_is_not_palindrome():
    assert is_palindrome("hello") == False

def test_empty_string_is_palindrome():
    assert is_palindrome("") == True

def test_single_char_is_palindrome():
    assert is_palindrome("a") == True

# With parameterization — concise and extensible
@pytest.mark.parametrize("input_str,expected", [
    ("racecar", True),
    ("hello", False),
    ("", True),
    ("a", True),
])
def test_is_palindrome(input_str, expected):
    assert is_palindrome(input_str) == expected
```

Benefits:
- Less code duplication
- Easy to add new test cases (just add a row)
- Each parameter combination runs as a separate test (individual pass/fail)
- Better test names in reports

## Parameterized Tests in Each Language

### Python — @pytest.mark.parametrize

```python
import pytest

def celsius_to_fahrenheit(c):
    return c * 9 / 5 + 32

@pytest.mark.parametrize("celsius,fahrenheit", [
    (0, 32),
    (100, 212),
    (-40, -40),
    (37, 98.6),
])
def test_celsius_to_fahrenheit(celsius, fahrenheit):
    assert celsius_to_fahrenheit(celsius) == pytest.approx(fahrenheit)

# Multiple parameters with IDs for readable output
@pytest.mark.parametrize("input_val,expected", [
    pytest.param(1, "1", id="regular_number"),
    pytest.param(3, "Fizz", id="multiple_of_3"),
    pytest.param(5, "Buzz", id="multiple_of_5"),
    pytest.param(15, "FizzBuzz", id="multiple_of_3_and_5"),
])
def test_fizzbuzz(input_val, expected):
    assert fizzbuzz(input_val) == expected

# Combining multiple parametrize decorators (cartesian product)
@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_addition_combinations(x, y):
    result = add(x, y)
    assert result == x + y
    # Runs 6 tests: (1,10), (1,20), (2,10), (2,20), (3,10), (3,20)
```

### JavaScript — test.each (Jest)

```javascript
// Basic test.each with array of arrays
describe("celsius to fahrenheit", () => {
  test.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [37, 98.6],
  ])("converts %d°C to %d°F", (celsius, fahrenheit) => {
    expect(celsiusToFahrenheit(celsius)).toBeCloseTo(fahrenheit);
  });
});

// Tagged template literal syntax (table format)
describe("fizzbuzz", () => {
  test.each`
    input | expected
    ${1}  | ${"1"}
    ${3}  | ${"Fizz"}
    ${5}  | ${"Buzz"}
    ${15} | ${"FizzBuzz"}
  `("fizzbuzz($input) returns $expected", ({ input, expected }) => {
    expect(fizzbuzz(input)).toBe(expected);
  });
});

// Array of objects for named parameters
describe("user validation", () => {
  const cases = [
    { name: "valid email", email: "user@example.com", valid: true },
    { name: "no @", email: "userexample.com", valid: false },
    { name: "no domain", email: "user@", valid: false },
    { name: "empty", email: "", valid: false },
  ];

  test.each(cases)("$name: $email is valid=$valid", ({ email, valid }) => {
    expect(isValidEmail(email)).toBe(valid);
  });
});

// describe.each for parameterized suites
describe.each([
  { role: "admin", canDelete: true },
  { role: "editor", canDelete: false },
  { role: "viewer", canDelete: false },
])("role: $role", ({ role, canDelete }) => {
  test(`canDelete is ${canDelete}`, () => {
    const user = createUser({ role });
    expect(user.canDelete()).toBe(canDelete);
  });
});
```

### Java — @ParameterizedTest (JUnit 5)

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import static org.junit.jupiter.api.Assertions.*;

class TemperatureTest {

    // @ValueSource — single parameter of primitive types
    @ParameterizedTest
    @ValueSource(ints = {1, 2, 4, 7, 11})
    void isNotMultipleOf3(int number) {
        assertNotEquals(0, number % 3);
    }

    // @CsvSource — multiple parameters as CSV
    @ParameterizedTest(name = "{0}°C = {1}°F")
    @CsvSource({
        "0, 32",
        "100, 212",
        "-40, -40",
        "37, 98.6"
    })
    void celsiusToFahrenheit(double celsius, double fahrenheit) {
        assertEquals(fahrenheit, Temperature.toFahrenheit(celsius), 0.01);
    }

    // @MethodSource — complex objects from a method
    @ParameterizedTest(name = "fizzbuzz({0}) = {1}")
    @MethodSource("fizzbuzzProvider")
    void testFizzbuzz(int input, String expected) {
        assertEquals(expected, FizzBuzz.convert(input));
    }

    static Stream<Arguments> fizzbuzzProvider() {
        return Stream.of(
            Arguments.of(1, "1"),
            Arguments.of(3, "Fizz"),
            Arguments.of(5, "Buzz"),
            Arguments.of(15, "FizzBuzz"),
            Arguments.of(7, "7"),
            Arguments.of(30, "FizzBuzz")
        );
    }

    // @EnumSource — iterate over enum values
    @ParameterizedTest
    @EnumSource(value = DayOfWeek.class, names = {"SATURDAY", "SUNDAY"})
    void isWeekend(DayOfWeek day) {
        assertTrue(Calendar.isWeekend(day));
    }

    // @CsvFileSource — load from CSV file
    @ParameterizedTest
    @CsvFileSource(resources = "/test-data.csv", numLinesToSkip = 1)
    void testFromFile(String input, int expected) {
        assertEquals(expected, Parser.parse(input));
    }
}

// Custom ArgumentsProvider for complex scenarios
class PasswordValidationTest {

    @ParameterizedTest(name = "\"{0}\" should be {1}")
    @MethodSource("passwordCases")
    void validatePassword(String password, boolean expected, String reason) {
        assertEquals(expected, PasswordValidator.isValid(password), reason);
    }

    static Stream<Arguments> passwordCases() {
        return Stream.of(
            Arguments.of("Short1!", false, "too short"),
            Arguments.of("nouppercase1!", false, "no uppercase"),
            Arguments.of("NOLOWERCASE1!", false, "no lowercase"),
            Arguments.of("NoDigits!!!", false, "no digits"),
            Arguments.of("Valid1Password!", true, "meets all criteria")
        );
    }
}
```

### C# — [Theory] and [InlineData] (xUnit)

```csharp
using Xunit;

public class TemperatureTests
{
    // [InlineData] — simple inline values
    [Theory]
    [InlineData(0, 32)]
    [InlineData(100, 212)]
    [InlineData(-40, -40)]
    [InlineData(37, 98.6)]
    public void CelsiusToFahrenheit(double celsius, double fahrenheit)
    {
        Assert.Equal(fahrenheit, Temperature.ToFahrenheit(celsius), precision: 1);
    }

    // [MemberData] — data from a property or method
    [Theory]
    [MemberData(nameof(FizzBuzzData))]
    public void FizzBuzz_ReturnsExpected(int input, string expected)
    {
        Assert.Equal(expected, FizzBuzz.Convert(input));
    }

    public static IEnumerable<object[]> FizzBuzzData =>
        new List<object[]>
        {
            new object[] { 1, "1" },
            new object[] { 3, "Fizz" },
            new object[] { 5, "Buzz" },
            new object[] { 15, "FizzBuzz" },
            new object[] { 7, "7" },
            new object[] { 30, "FizzBuzz" },
        };

    // [ClassData] — data from a dedicated class
    [Theory]
    [ClassData(typeof(PasswordTestData))]
    public void ValidatePassword(string password, bool expected, string reason)
    {
        Assert.Equal(expected, PasswordValidator.IsValid(password));
    }
}

// Dedicated test data class
public class PasswordTestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[] { "Short1!", false, "too short" };
        yield return new object[] { "nouppercase1!", false, "no uppercase" };
        yield return new object[] { "NOLOWERCASE1!", false, "no lowercase" };
        yield return new object[] { "NoDigits!!!", false, "no digits" };
        yield return new object[] { "Valid1Password!", true, "meets all criteria" };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

// TheoryData<T> — strongly typed alternative (xUnit v2.4+)
public class MathTests
{
    [Theory]
    [MemberData(nameof(AdditionData))]
    public void Add_ReturnsSum(int a, int b, int expected)
    {
        Assert.Equal(expected, Calculator.Add(a, b));
    }

    public static TheoryData<int, int, int> AdditionData => new()
    {
        { 1, 1, 2 },
        { -1, 1, 0 },
        { 0, 0, 0 },
        { int.MaxValue, 0, int.MaxValue },
    };
}
```

## Table-Driven Tests Pattern

The table-driven pattern structures tests as a collection of named test cases, common in Go but applicable everywhere:

```python
# Python — table-driven style
import pytest

test_cases = [
    {"name": "empty string", "input": "", "expected": 0},
    {"name": "single word", "input": "hello", "expected": 1},
    {"name": "multiple words", "input": "hello world", "expected": 2},
    {"name": "extra spaces", "input": "  hello  world  ", "expected": 2},
    {"name": "only spaces", "input": "   ", "expected": 0},
    {"name": "newlines", "input": "hello\nworld", "expected": 2},
]

@pytest.mark.parametrize(
    "input_str,expected",
    [(tc["input"], tc["expected"]) for tc in test_cases],
    ids=[tc["name"] for tc in test_cases],
)
def test_word_count(input_str, expected):
    assert word_count(input_str) == expected
```

```javascript
// JavaScript — table-driven style
const testCases = [
  { name: "empty string", input: "", expected: 0 },
  { name: "single word", input: "hello", expected: 1 },
  { name: "multiple words", input: "hello world", expected: 2 },
  { name: "extra spaces", input: "  hello  world  ", expected: 2 },
  { name: "only spaces", input: "   ", expected: 0 },
  { name: "newlines", input: "hello\nworld", expected: 2 },
];

describe("wordCount", () => {
  test.each(testCases)("$name", ({ input, expected }) => {
    expect(wordCount(input)).toBe(expected);
  });
});
```

```java
// Java — table-driven style
class WordCountTest {
    record TestCase(String name, String input, int expected) {}

    static Stream<TestCase> testCases() {
        return Stream.of(
            new TestCase("empty string", "", 0),
            new TestCase("single word", "hello", 1),
            new TestCase("multiple words", "hello world", 2),
            new TestCase("extra spaces", "  hello  world  ", 2),
            new TestCase("only spaces", "   ", 0),
            new TestCase("newlines", "hello\nworld", 2)
        );
    }

    @ParameterizedTest(name = "{0}")
    @MethodSource("testCases")
    void testWordCount(TestCase tc) {
        assertEquals(tc.expected(), WordCounter.count(tc.input()), tc.name());
    }
}
```

```csharp
// C# — table-driven style
public class WordCountTests
{
    public record TestCase(string Name, string Input, int Expected);

    public static IEnumerable<object[]> TestCases => new List<object[]>
    {
        new object[] { new TestCase("empty string", "", 0) },
        new object[] { new TestCase("single word", "hello", 1) },
        new object[] { new TestCase("multiple words", "hello world", 2) },
        new object[] { new TestCase("extra spaces", "  hello  world  ", 2) },
        new object[] { new TestCase("only spaces", "   ", 0) },
        new object[] { new TestCase("newlines", "hello\nworld", 2) },
    };

    [Theory]
    [MemberData(nameof(TestCases))]
    public void TestWordCount(TestCase tc)
    {
        Assert.Equal(tc.Expected, WordCounter.Count(tc.Input));
    }
}
```

## Data from External Sources

### Loading Test Data from JSON

```python
# Python — JSON test data
import json
import pytest

def load_test_data(filename):
    with open(f"test_data/{filename}") as f:
        return json.load(f)

# test_data/validation_cases.json:
# [
#   {"email": "valid@example.com", "valid": true},
#   {"email": "no-at-sign.com", "valid": false},
#   {"email": "@no-local.com", "valid": false}
# ]

cases = load_test_data("validation_cases.json")

@pytest.mark.parametrize("case", cases, ids=[c["email"] for c in cases])
def test_email_validation(case):
    assert validate_email(case["email"]) == case["valid"]
```

```javascript
// JavaScript — JSON test data
const testData = require("./test_data/validation_cases.json");

describe("email validation", () => {
  test.each(testData)("validates $email as $valid", ({ email, valid }) => {
    expect(validateEmail(email)).toBe(valid);
  });
});
```

```java
// Java — JSON with JUnit 5
// Using a custom ArgumentsProvider
class JsonFileArgumentsProvider implements ArgumentsProvider {
    @Override
    public Stream<Arguments> provideArguments(ExtensionContext context) throws Exception {
        String json = Files.readString(Path.of("src/test/resources/validation_cases.json"));
        ObjectMapper mapper = new ObjectMapper();
        List<Map<String, Object>> cases = mapper.readValue(json, new TypeReference<>() {});
        return cases.stream().map(c -> Arguments.of(c.get("email"), c.get("valid")));
    }
}

class EmailValidationTest {
    @ParameterizedTest
    @ArgumentsSource(JsonFileArgumentsProvider.class)
    void validateEmail(String email, boolean expected) {
        assertEquals(expected, EmailValidator.isValid(email));
    }
}
```

```csharp
// C# — JSON test data with xUnit
public class JsonTestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        var json = File.ReadAllText("test_data/validation_cases.json");
        var cases = JsonSerializer.Deserialize<List<ValidationCase>>(json);
        foreach (var c in cases)
        {
            yield return new object[] { c.Email, c.Valid };
        }
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

public class EmailValidationTests
{
    [Theory]
    [ClassData(typeof(JsonTestData))]
    public void ValidateEmail(string email, bool expected)
    {
        Assert.Equal(expected, EmailValidator.IsValid(email));
    }
}
```

### Loading from CSV

```python
# Python — CSV test data
import csv
import pytest

def load_csv_cases(filename):
    with open(filename) as f:
        reader = csv.DictReader(f)
        return list(reader)

# test_data/math_operations.csv:
# operation,a,b,expected
# add,2,3,5
# subtract,10,4,6
# multiply,3,7,21

cases = load_csv_cases("test_data/math_operations.csv")

@pytest.mark.parametrize("case", cases, ids=[c["operation"] for c in cases])
def test_math_operations(case):
    a, b = int(case["a"]), int(case["b"])
    expected = int(case["expected"])
    result = calculate(case["operation"], a, b)
    assert result == expected
```

## Combinatorial Testing

When you have multiple independent parameters, you might want to test all combinations:

```python
# Python — cartesian product of parameters
import pytest

@pytest.mark.parametrize("browser", ["chrome", "firefox", "safari"])
@pytest.mark.parametrize("os", ["windows", "macos", "linux"])
@pytest.mark.parametrize("screen_size", ["mobile", "tablet", "desktop"])
def test_responsive_layout(browser, os, screen_size):
    # Runs 3 × 3 × 3 = 27 test combinations
    driver = create_driver(browser=browser, os=os)
    driver.set_viewport(screen_size)
    assert page_renders_correctly(driver)
```

```javascript
// JavaScript — manual combinatorial
const browsers = ["chrome", "firefox", "safari"];
const viewports = ["mobile", "tablet", "desktop"];

const combinations = browsers.flatMap((browser) =>
  viewports.map((viewport) => ({ browser, viewport }))
);

describe("responsive tests", () => {
  test.each(combinations)(
    "$browser on $viewport",
    ({ browser, viewport }) => {
      const page = renderPage({ browser, viewport });
      expect(page.isResponsive()).toBe(true);
    }
  );
});
```

```java
// Java — cartesian product with @MethodSource
class CrossBrowserTest {
    static Stream<Arguments> browserViewportCombinations() {
        String[] browsers = {"chrome", "firefox", "safari"};
        String[] viewports = {"mobile", "tablet", "desktop"};

        return Arrays.stream(browsers)
            .flatMap(b -> Arrays.stream(viewports)
                .map(v -> Arguments.of(b, v)));
    }

    @ParameterizedTest(name = "{0} on {1}")
    @MethodSource("browserViewportCombinations")
    void testResponsiveLayout(String browser, String viewport) {
        WebDriver driver = createDriver(browser);
        driver.setViewport(viewport);
        assertTrue(pageRendersCorrectly(driver));
    }
}
```

```csharp
// C# — combinatorial with MemberData
public class CrossBrowserTests
{
    public static IEnumerable<object[]> BrowserViewportCombinations()
    {
        var browsers = new[] { "chrome", "firefox", "safari" };
        var viewports = new[] { "mobile", "tablet", "desktop" };

        return from b in browsers
               from v in viewports
               select new object[] { b, v };
    }

    [Theory]
    [MemberData(nameof(BrowserViewportCombinations))]
    public void TestResponsiveLayout(string browser, string viewport)
    {
        var driver = CreateDriver(browser);
        driver.SetViewport(viewport);
        Assert.True(PageRendersCorrectly(driver));
    }
}
```

## When to Parameterize vs Write Separate Tests

### Parameterize When:
- Testing the **same behavior** with different data
- Inputs and outputs follow a clear pattern
- You want to easily add new cases
- Edge cases share the same assertion logic

### Write Separate Tests When:
- Different inputs require **different assertions**
- The setup/teardown differs between cases
- Tests have distinct **semantic meaning** (naming matters)
- Failure in one case doesn't relate to others

```python
# GOOD: parameterize — same logic, different data
@pytest.mark.parametrize("age,category", [
    (5, "child"),
    (15, "teen"),
    (25, "adult"),
    (70, "senior"),
])
def test_age_category(age, category):
    assert categorize_age(age) == category

# GOOD: separate tests — different setup and assertions
def test_new_user_gets_welcome_email():
    user = create_user(is_new=True)
    emails = get_sent_emails(user)
    assert any(e.subject == "Welcome!" for e in emails)

def test_returning_user_gets_no_welcome_email():
    user = create_user(is_new=False)
    emails = get_sent_emails(user)
    assert not any(e.subject == "Welcome!" for e in emails)
```

## Advanced Patterns

### Parameterized Fixtures (Python)

```python
import pytest

@pytest.fixture(params=["sqlite", "postgres", "mysql"])
def database(request):
    db = create_database(request.param)
    yield db
    db.cleanup()

def test_insert_and_retrieve(database):
    database.insert({"id": 1, "name": "Alice"})
    result = database.get(1)
    assert result["name"] == "Alice"
    # This test runs 3 times — once for each database type
```

### Dynamic Test Generation (JavaScript)

```javascript
// Generate tests from API endpoints
const endpoints = [
  { path: "/api/users", method: "GET", expectedStatus: 200 },
  { path: "/api/users", method: "POST", expectedStatus: 401 },
  { path: "/api/admin", method: "GET", expectedStatus: 403 },
  { path: "/api/missing", method: "GET", expectedStatus: 404 },
];

describe("API endpoints", () => {
  test.each(endpoints)(
    "$method $path returns $expectedStatus",
    async ({ path, method, expectedStatus }) => {
      const res = await fetch(`http://localhost:3000${path}`, { method });
      expect(res.status).toBe(expectedStatus);
    }
  );
});
```

### Custom Display Names

```java
// Java — custom names for readability
@ParameterizedTest(name = "isPrime({0}) = {1}")
@CsvSource({
    "1, false",
    "2, true",
    "3, true",
    "4, false",
    "17, true",
    "25, false"
})
void testIsPrime(int number, boolean expected) {
    assertEquals(expected, MathUtils.isPrime(number));
}
// Output:
// isPrime(1) = false ✓
// isPrime(2) = true ✓
// isPrime(3) = true ✓
// ...
```

## Summary

Parameterized tests reduce duplication and make test suites more maintainable:

| Language | Mechanism | Best For |
|----------|-----------|----------|
| Python | `@pytest.mark.parametrize` | Simple to complex data |
| JavaScript | `test.each` / `describe.each` | Arrays or template literals |
| Java | `@ParameterizedTest` + sources | Type-safe, multiple sources |
| C# | `[Theory]` + `[InlineData]`/`[MemberData]` | Strongly typed data |

Key takeaways:
- Use parameterized tests when the same assertion applies to multiple inputs
- Name your test cases for readable failure reports
- External data (JSON, CSV) works well for large datasets
- Combinatorial testing catches interaction bugs but can explode in count
- Don't over-parameterize — if logic differs, write separate tests
