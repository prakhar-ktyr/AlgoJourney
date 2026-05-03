---
title: Regression Testing Strategies
---

# Regression Testing Strategies

## What Is Regression Testing?

Regression testing ensures that new code changes don't break existing functionality. When you modify, add, or refactor code, regression tests verify that previously working features continue to work correctly.

### Why It Matters

- **Code changes have ripple effects**: A fix in one module can break another
- **Confidence to refactor**: Without regression tests, teams fear touching code
- **Catch side effects**: Especially in large, interconnected systems
- **Prevent bug recurrence**: The same bug should never appear twice

## Full Regression vs Selective Regression

### Full Regression

Run the entire test suite after every change.

**Pros**: Maximum confidence | **Cons**: Slow, expensive for large suites

### Selective Regression

Run only tests relevant to the changed code.

**Pros**: Fast feedback | **Cons**: May miss unexpected dependencies

| Scenario | Approach |
|---|---|
| Pre-release | Full regression |
| Feature branch CI | Selective regression |
| Hotfix | Targeted + smoke tests |
| Major refactor | Full regression |

## Risk-Based Test Selection

Prioritize tests based on:

1. **Business criticality**: Payment flows > admin settings
2. **Complexity**: Complex algorithms have more edge cases
3. **Coupling**: Highly connected modules affect more tests
4. **Historical defects**: Code that broke before will break again
5. **Change frequency**: Frequently changed code needs more testing

## Test Impact Analysis

Maps code changes to tests that exercise them:

- **Static analysis**: Parse import graphs to find test dependencies
- **Coverage mapping**: Record which tests cover which lines
- **Historical correlation**: Track which tests fail together
- **Dependency graph**: Traverse module dependency graph

## Regression Test Suite Maintenance

- **Adding**: Every bug fix gets a regression test; new features need integration tests
- **Removing**: Delete tests for removed features; consolidate duplicates
- **Updating**: When requirements change, update tests first

## Automated Regression in CI/CD

```
Push → Lint → Unit Tests → Selective Regression → Staging → Full Regression → Prod
```

Tag tests by priority/module, parallelize execution, set time budgets, report coverage delta.

## Code: Test Registry with Tagging and Selective Execution

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable
import unittest


class Priority(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class TestCase:
    name: str
    func: Callable
    tags: set[str] = field(default_factory=set)
    priority: Priority = Priority.MEDIUM
    module: str = ""
    last_result: bool | None = None


class TestRegistry:
    def __init__(self):
        self._tests: dict[str, TestCase] = {}

    def register(self, name: str, tags: set[str] = None,
                 priority: Priority = Priority.MEDIUM, module: str = ""):
        def decorator(func):
            self._tests[name] = TestCase(
                name=name, func=func, tags=tags or set(), priority=priority, module=module)
            return func
        return decorator

    def run_all(self) -> dict[str, bool]:
        return self._run(self._tests.values())

    def run_by_tags(self, tags: set[str]) -> dict[str, bool]:
        return self._run(t for t in self._tests.values() if t.tags & tags)

    def run_by_priority(self, min_priority: Priority) -> dict[str, bool]:
        order = [Priority.CRITICAL, Priority.HIGH, Priority.MEDIUM, Priority.LOW]
        cutoff = order.index(min_priority)
        return self._run(t for t in self._tests.values() if order.index(t.priority) <= cutoff)

    def run_by_module(self, module: str) -> dict[str, bool]:
        return self._run(t for t in self._tests.values() if t.module == module)

    def run_selective(self, changed_modules: list[str]) -> dict[str, bool]:
        return self._run(t for t in self._tests.values()
                         if t.module in changed_modules or t.priority == Priority.CRITICAL)

    def _run(self, tests) -> dict[str, bool]:
        results = {}
        for t in tests:
            try:
                t.func()
                t.last_result = True
                results[t.name] = True
            except AssertionError:
                t.last_result = False
                results[t.name] = False
        return results

    def get_failed(self) -> list[str]:
        return [t.name for t in self._tests.values() if t.last_result is False]


# --- Usage & Tests ---
registry = TestRegistry()

@registry.register("auth_login", {"auth", "smoke"}, Priority.CRITICAL, "auth")
def test_login(): assert True

@registry.register("auth_logout", {"auth"}, Priority.HIGH, "auth")
def test_logout(): assert True

@registry.register("payment", {"payment", "smoke"}, Priority.CRITICAL, "payment")
def test_payment(): assert True

@registry.register("ui_color", {"ui"}, Priority.LOW, "ui")
def test_ui(): assert True


class TestRegistryBehavior(unittest.TestCase):
    def test_run_all(self):
        results = registry.run_all()
        self.assertEqual(len(results), 4)
        self.assertTrue(all(results.values()))

    def test_run_by_tags(self):
        results = registry.run_by_tags({"auth"})
        self.assertEqual(set(results.keys()), {"auth_login", "auth_logout"})

    def test_run_by_priority(self):
        results = registry.run_by_priority(Priority.HIGH)
        self.assertIn("auth_login", results)
        self.assertNotIn("ui_color", results)

    def test_selective_includes_critical(self):
        results = registry.run_selective(["ui"])
        self.assertIn("ui_color", results)
        self.assertIn("auth_login", results)
        self.assertNotIn("auth_logout", results)

    def test_tracks_failures(self):
        r = TestRegistry()
        @r.register("fail_test", priority=Priority.HIGH, module="x")
        def fail(): assert False
        r.run_all()
        self.assertEqual(r.get_failed(), ["fail_test"])
```

```javascript
class TestRegistry {
  constructor() { this._tests = new Map(); }

  register({ name, tags = [], priority = "medium", module = "" }, fn) {
    this._tests.set(name, { name, fn, tags: new Set(tags), priority, module, lastResult: null });
  }

  runAll() { return this._run([...this._tests.values()]); }

  runByTags(tags) {
    const s = new Set(tags);
    return this._run([...this._tests.values()].filter((t) => [...t.tags].some((x) => s.has(x))));
  }

  runByPriority(min) {
    const order = ["critical", "high", "medium", "low"];
    const cutoff = order.indexOf(min);
    return this._run([...this._tests.values()].filter((t) => order.indexOf(t.priority) <= cutoff));
  }

  runByModule(mod) {
    return this._run([...this._tests.values()].filter((t) => t.module === mod));
  }

  runSelective(changed) {
    const s = new Set(changed);
    return this._run([...this._tests.values()].filter(
      (t) => s.has(t.module) || t.priority === "critical"));
  }

  _run(tests) {
    const results = {};
    for (const t of tests) {
      try { t.fn(); t.lastResult = true; results[t.name] = true; }
      catch { t.lastResult = false; results[t.name] = false; }
    }
    return results;
  }

  getFailed() {
    return [...this._tests.values()].filter((t) => t.lastResult === false).map((t) => t.name);
  }
}

// --- Tests ---
describe("TestRegistry", () => {
  let reg;
  beforeEach(() => {
    reg = new TestRegistry();
    reg.register({ name: "auth_login", tags: ["auth", "smoke"], priority: "critical", module: "auth" }, () => {});
    reg.register({ name: "auth_logout", tags: ["auth"], priority: "high", module: "auth" }, () => {});
    reg.register({ name: "payment", tags: ["payment"], priority: "critical", module: "payment" }, () => {});
    reg.register({ name: "ui_color", tags: ["ui"], priority: "low", module: "ui" }, () => {});
  });

  it("runs all tests", () => {
    expect(Object.keys(reg.runAll())).toHaveLength(4);
  });

  it("filters by tags", () => {
    const r = reg.runByTags(["auth"]);
    expect(Object.keys(r)).toHaveLength(2);
  });

  it("filters by priority", () => {
    const r = reg.runByPriority("high");
    expect(r["auth_login"]).toBe(true);
    expect(r["ui_color"]).toBeUndefined();
  });

  it("selective includes critical + changed", () => {
    const r = reg.runSelective(["ui"]);
    expect(r["ui_color"]).toBe(true);
    expect(r["auth_login"]).toBe(true);
    expect(r["auth_logout"]).toBeUndefined();
  });

  it("tracks failures", () => {
    const r2 = new TestRegistry();
    r2.register({ name: "bad", priority: "high", module: "x" }, () => { throw new Error(); });
    r2.runAll();
    expect(r2.getFailed()).toEqual(["bad"]);
  });
});
```

```java
import java.util.*;
import java.util.stream.Collectors;

enum Priority { CRITICAL, HIGH, MEDIUM, LOW }

public class TestRegistry {
    private record TestCase(String name, Runnable fn, Set<String> tags, Priority priority, String module) {}
    private final List<TestCase> tests = new ArrayList<>();
    private final Map<String, Boolean> lastResults = new LinkedHashMap<>();

    public void register(String name, Runnable fn, Set<String> tags, Priority p, String module) {
        tests.add(new TestCase(name, fn, tags, p, module));
    }

    public Map<String, Boolean> runAll() { return run(tests); }

    public Map<String, Boolean> runByTags(Set<String> tags) {
        return run(tests.stream().filter(t -> t.tags().stream().anyMatch(tags::contains)).toList());
    }

    public Map<String, Boolean> runByPriority(Priority min) {
        return run(tests.stream().filter(t -> t.priority().ordinal() <= min.ordinal()).toList());
    }

    public Map<String, Boolean> runSelective(Set<String> changed) {
        return run(tests.stream()
            .filter(t -> changed.contains(t.module()) || t.priority() == Priority.CRITICAL).toList());
    }

    private Map<String, Boolean> run(List<TestCase> list) {
        Map<String, Boolean> results = new LinkedHashMap<>();
        for (var t : list) {
            try { t.fn().run(); results.put(t.name(), true); lastResults.put(t.name(), true); }
            catch (AssertionError e) { results.put(t.name(), false); lastResults.put(t.name(), false); }
        }
        return results;
    }

    public List<String> getFailed() {
        return lastResults.entrySet().stream()
            .filter(e -> !e.getValue()).map(Map.Entry::getKey).toList();
    }
}

// --- JUnit 5 Tests ---
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TestRegistryTest {
    private TestRegistry reg;

    @BeforeEach void setUp() {
        reg = new TestRegistry();
        reg.register("auth_login", () -> {}, Set.of("auth", "smoke"), Priority.CRITICAL, "auth");
        reg.register("auth_logout", () -> {}, Set.of("auth"), Priority.HIGH, "auth");
        reg.register("payment", () -> {}, Set.of("payment"), Priority.CRITICAL, "payment");
        reg.register("ui_color", () -> {}, Set.of("ui"), Priority.LOW, "ui");
    }

    @Test void runAll() { assertEquals(4, reg.runAll().size()); }

    @Test void byTags() { assertEquals(2, reg.runByTags(Set.of("auth")).size()); }

    @Test void byPriority() {
        var r = reg.runByPriority(Priority.HIGH);
        assertTrue(r.containsKey("auth_login"));
        assertFalse(r.containsKey("ui_color"));
    }

    @Test void selective() {
        var r = reg.runSelective(Set.of("ui"));
        assertTrue(r.containsKey("ui_color"));
        assertTrue(r.containsKey("auth_login"));
        assertFalse(r.containsKey("auth_logout"));
    }

    @Test void tracksFailed() {
        var r2 = new TestRegistry();
        r2.register("bad", () -> { throw new AssertionError(); }, Set.of(), Priority.HIGH, "x");
        r2.runAll();
        assertEquals(List.of("bad"), r2.getFailed());
    }
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public enum TestPriority { Critical, High, Medium, Low }

public class TestRegistry
{
    private record TestCase(string Name, Action Fn, HashSet<string> Tags, TestPriority Priority, string Module);
    private readonly List<TestCase> _tests = new();
    private readonly Dictionary<string, bool> _lastResults = new();

    public void Register(string name, Action fn, string[] tags, TestPriority p, string module) =>
        _tests.Add(new(name, fn, new HashSet<string>(tags), p, module));

    public Dictionary<string, bool> RunAll() => Run(_tests);

    public Dictionary<string, bool> RunByTags(HashSet<string> tags) =>
        Run(_tests.Where(t => t.Tags.Overlaps(tags)).ToList());

    public Dictionary<string, bool> RunByPriority(TestPriority min) =>
        Run(_tests.Where(t => t.Priority <= min).ToList());

    public Dictionary<string, bool> RunSelective(HashSet<string> changed) =>
        Run(_tests.Where(t => changed.Contains(t.Module) || t.Priority == TestPriority.Critical).ToList());

    private Dictionary<string, bool> Run(IEnumerable<TestCase> tests)
    {
        var results = new Dictionary<string, bool>();
        foreach (var t in tests)
        {
            try { t.Fn(); results[t.Name] = true; _lastResults[t.Name] = true; }
            catch { results[t.Name] = false; _lastResults[t.Name] = false; }
        }
        return results;
    }

    public List<string> GetFailed() =>
        _lastResults.Where(kv => !kv.Value).Select(kv => kv.Key).ToList();
}

// --- xUnit Tests ---
using Xunit;

public class TestRegistryTests
{
    private readonly TestRegistry _reg = new();

    public TestRegistryTests()
    {
        _reg.Register("auth_login", () => { }, new[] { "auth", "smoke" }, TestPriority.Critical, "auth");
        _reg.Register("auth_logout", () => { }, new[] { "auth" }, TestPriority.High, "auth");
        _reg.Register("payment", () => { }, new[] { "payment" }, TestPriority.Critical, "payment");
        _reg.Register("ui_color", () => { }, new[] { "ui" }, TestPriority.Low, "ui");
    }

    [Fact] public void RunAll() => Assert.Equal(4, _reg.RunAll().Count);

    [Fact] public void ByTags() => Assert.Equal(2, _reg.RunByTags(new HashSet<string> { "auth" }).Count);

    [Fact] public void ByPriority()
    {
        var r = _reg.RunByPriority(TestPriority.High);
        Assert.True(r.ContainsKey("auth_login"));
        Assert.False(r.ContainsKey("ui_color"));
    }

    [Fact] public void Selective()
    {
        var r = _reg.RunSelective(new HashSet<string> { "ui" });
        Assert.True(r.ContainsKey("ui_color"));
        Assert.True(r.ContainsKey("auth_login"));
        Assert.False(r.ContainsKey("auth_logout"));
    }

    [Fact] public void TracksFailed()
    {
        var r2 = new TestRegistry();
        r2.Register("bad", () => throw new Exception(), Array.Empty<string>(), TestPriority.High, "x");
        r2.RunAll();
        Assert.Equal(new List<string> { "bad" }, r2.GetFailed());
    }
}
```

## Key Takeaways

- Regression testing protects against unintended breakage from code changes
- Use selective regression for fast CI; full regression before releases
- Risk-based prioritization ensures critical paths are always tested
- Tag and categorize tests to enable flexible, targeted execution
- Maintain your suite actively—add for bugs, remove for dead features
