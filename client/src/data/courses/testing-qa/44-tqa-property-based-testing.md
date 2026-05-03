---
title: Property-Based Testing
---

# Property-Based Testing

Property-based testing generates hundreds or thousands of random inputs and verifies that specified properties always hold. Instead of writing individual test cases, you declare universal truths about your code, and the framework finds counterexamples.

## Example-Based vs Property-Based Testing

### Example-Based (Traditional)

```text
test: sort([3, 1, 2]) == [1, 2, 3]
test: sort([]) == []
test: sort([1]) == [1]
```

You choose specific inputs and assert specific outputs. Coverage depends entirely on your imagination.

### Property-Based

```text
for all lists xs:
  sort(xs) is sorted
  sort(xs) has same length as xs
  sort(xs) contains same elements as xs
```

The framework generates thousands of random lists and checks these properties. It finds edge cases you never considered.

## Defining Properties

A property is a statement: **"For all inputs X satisfying precondition P, property Q holds."**

Good properties are:

- **Universal** — Hold for every valid input, not just specific examples
- **Meaningful** — Capture real correctness requirements
- **Checkable** — Can be evaluated programmatically
- **Independent** — Don't re-implement the function under test

## Shrinking

When a property fails, the framework "shrinks" the failing input to the minimal counterexample:

```text
Initial failure: [847, -23, 0, 512, -7, 99, 1, -456]
Shrinking...
Minimal failure: [1, 0]   ← smallest input that still fails
```

Shrinking makes debugging dramatically easier by giving you the simplest possible reproduction.

## Common Properties

### Roundtrip (Encode/Decode)

```text
∀ x : decode(encode(x)) == x
```

Applies to: serialization, compression, encryption, URL encoding, base64.

### Idempotence

```text
∀ x : f(f(x)) == f(x)
```

Applies to: sorting, normalization, formatting, deduplication, absolute value.

### Commutativity

```text
∀ x, y : f(x, y) == f(y, x)
```

Applies to: addition, set union, max/min.

### Invariance (Conservation)

```text
∀ xs : length(sort(xs)) == length(xs)
∀ xs : elements(sort(xs)) == elements(xs)
```

Applies to: sorting preserves length/elements, mapping preserves length.

### Oracle / Reference Implementation

```text
∀ x : fast_sort(x) == naive_sort(x)
```

Compare complex implementation against a simple reference.

## Tools

| Language | Tool | Key Feature |
|----------|------|-------------|
| Python | Hypothesis | Strategy composition, stateful testing |
| JavaScript | fast-check | Arbitraries, model-based testing |
| Java | jqwik | JUnit 5 integration, domains |
| C# | FsCheck | Arb generators, .NET integration |

## Code: Property Tests for Sort and Serializer

### Python

```python
import json
from hypothesis import given, settings, assume
from hypothesis import strategies as st


def bubble_sort(lst: list) -> list:
    """Simple sort implementation to test with properties."""
    result = lst.copy()
    n = len(result)
    for i in range(n):
        for j in range(0, n - i - 1):
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
    return result


class JSONSerializer:
    def serialize(self, data: dict) -> str:
        return json.dumps(data, sort_keys=True, default=str)

    def deserialize(self, text: str) -> dict:
        return json.loads(text)


# --- Sort Properties ---

@given(st.lists(st.integers(min_value=-1000, max_value=1000)))
@settings(max_examples=500)
def test_sort_preserves_length(xs):
    assert len(bubble_sort(xs)) == len(xs)


@given(st.lists(st.integers(min_value=-1000, max_value=1000)))
@settings(max_examples=500)
def test_sort_output_is_ordered(xs):
    result = bubble_sort(xs)
    for i in range(len(result) - 1):
        assert result[i] <= result[i + 1]


@given(st.lists(st.integers(min_value=-1000, max_value=1000)))
@settings(max_examples=300)
def test_sort_preserves_elements(xs):
    result = bubble_sort(xs)
    assert sorted(result) == sorted(xs)


@given(st.lists(st.integers(min_value=-1000, max_value=1000)))
@settings(max_examples=200)
def test_sort_is_idempotent(xs):
    once = bubble_sort(xs)
    twice = bubble_sort(once)
    assert once == twice


@given(st.lists(st.integers(min_value=-1000, max_value=1000), min_size=1))
@settings(max_examples=300)
def test_sort_first_is_minimum(xs):
    result = bubble_sort(xs)
    assert result[0] == min(xs)


# --- Serializer Properties ---

json_values = st.recursive(
    st.none() | st.booleans() | st.integers() | st.text(),
    lambda children: st.lists(children) | st.dictionaries(st.text(), children),
    max_leaves=10,
)


@given(st.dictionaries(st.text(min_size=1, max_size=10), json_values, max_size=5))
@settings(max_examples=300)
def test_serializer_roundtrip(data):
    s = JSONSerializer()
    assert s.deserialize(s.serialize(data)) == data


@given(st.dictionaries(st.text(min_size=1, max_size=10), json_values, max_size=5))
@settings(max_examples=200)
def test_serializer_produces_valid_json(data):
    s = JSONSerializer()
    result = s.serialize(data)
    json.loads(result)  # must not raise
```

### JavaScript

```javascript
const fc = require("fast-check");

function bubbleSort(arr) {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}

class JSONSerializer {
  serialize(data) { return JSON.stringify(data); }
  deserialize(text) { return JSON.parse(text); }
}

describe("Sort Properties", () => {
  test("preserves length", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -1000, max: 1000 })), (xs) => {
        return bubbleSort(xs).length === xs.length;
      }),
      { numRuns: 500 }
    );
  });

  test("output is ordered", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -1000, max: 1000 })), (xs) => {
        const sorted = bubbleSort(xs);
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i] > sorted[i + 1]) return false;
        }
        return true;
      }),
      { numRuns: 500 }
    );
  });

  test("is idempotent", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: -1000, max: 1000 })), (xs) => {
        const once = bubbleSort(xs);
        return JSON.stringify(once) === JSON.stringify(bubbleSort(once));
      }),
      { numRuns: 200 }
    );
  });

  test("first element is minimum", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: -1000, max: 1000 }), { minLength: 1 }),
        (xs) => bubbleSort(xs)[0] === Math.min(...xs)
      ),
      { numRuns: 300 }
    );
  });
});

describe("Serializer Properties", () => {
  const serializer = new JSONSerializer();

  test("roundtrip preserves data", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (data) => {
        const json = serializer.serialize(data);
        const restored = serializer.deserialize(json);
        return JSON.stringify(data) === JSON.stringify(restored);
      }),
      { numRuns: 300 }
    );
  });

  test("output is always valid JSON", () => {
    fc.assert(
      fc.property(fc.jsonValue(), (data) => {
        try {
          JSON.parse(serializer.serialize(data));
          return true;
        } catch {
          return false;
        }
      }),
      { numRuns: 200 }
    );
  });
});
```

### Java

```java
import net.jqwik.api.*;
import net.jqwik.api.constraints.*;
import static org.assertj.core.api.Assertions.*;
import java.util.*;
import com.google.gson.Gson;

public class PropertyTests {

    static int[] bubbleSort(int[] arr) {
        int[] result = arr.clone();
        for (int i = 0; i < result.length; i++)
            for (int j = 0; j < result.length - i - 1; j++)
                if (result[j] > result[j + 1]) {
                    int t = result[j];
                    result[j] = result[j + 1];
                    result[j + 1] = t;
                }
        return result;
    }

    static class JsonSerializer {
        private final Gson gson = new Gson();
        String serialize(Map<String, Object> data) { return gson.toJson(data); }
        Map deserialize(String json) { return gson.fromJson(json, Map.class); }
    }

    @Property(tries = 500)
    void sortPreservesLength(
            @ForAll List<@IntRange(min = -1000, max = 1000) Integer> xs) {
        int[] arr = xs.stream().mapToInt(Integer::intValue).toArray();
        assertThat(bubbleSort(arr).length).isEqualTo(arr.length);
    }

    @Property(tries = 500)
    void sortOutputIsOrdered(
            @ForAll List<@IntRange(min = -1000, max = 1000) Integer> xs) {
        int[] sorted = bubbleSort(xs.stream().mapToInt(Integer::intValue).toArray());
        for (int i = 0; i < sorted.length - 1; i++)
            assertThat(sorted[i]).isLessThanOrEqualTo(sorted[i + 1]);
    }

    @Property(tries = 200)
    void sortIsIdempotent(
            @ForAll List<@IntRange(min = -1000, max = 1000) Integer> xs) {
        int[] arr = xs.stream().mapToInt(Integer::intValue).toArray();
        assertThat(bubbleSort(arr)).isEqualTo(bubbleSort(bubbleSort(arr)));
    }

    @Property(tries = 300)
    void sortPreservesElements(
            @ForAll List<@IntRange(min = -1000, max = 1000) Integer> xs) {
        int[] arr = xs.stream().mapToInt(Integer::intValue).toArray();
        int[] sorted = bubbleSort(arr);
        int[] expected = arr.clone();
        Arrays.sort(expected);
        assertThat(sorted).isEqualTo(expected);
    }

    @Property(tries = 300)
    void serializerRoundtrip(@ForAll("jsonMaps") Map<String, Object> data) {
        var s = new JsonSerializer();
        String json = s.serialize(data);
        assertThat(s.serialize(s.deserialize(json))).isEqualTo(json);
    }

    @Provide
    Arbitrary<Map<String, Object>> jsonMaps() {
        return Arbitraries.maps(
            Arbitraries.strings().ofMinLength(1).ofMaxLength(10).alpha(),
            Arbitraries.oneOf(
                Arbitraries.integers().map(i -> (Object) i),
                Arbitraries.strings().ofMaxLength(20).map(s -> (Object) s),
                Arbitraries.of(true, false).map(b -> (Object) b)
            )
        ).ofMaxSize(5);
    }
}
```

### C#

```csharp
using Xunit;
using FsCheck;
using FsCheck.Xunit;
using System.Text.Json;

public static class BubbleSort
{
    public static int[] Sort(int[] arr)
    {
        var result = (int[])arr.Clone();
        for (int i = 0; i < result.Length; i++)
            for (int j = 0; j < result.Length - i - 1; j++)
                if (result[j] > result[j + 1])
                    (result[j], result[j + 1]) = (result[j + 1], result[j]);
        return result;
    }
}

public class SortPropertyTests
{
    [Property(MaxTest = 500)]
    public Property Sort_PreservesLength() =>
        Prop.ForAll(Arb.From<int[]>(), arr => {
            var input = arr ?? Array.Empty<int>();
            return (BubbleSort.Sort(input).Length == input.Length).ToProperty();
        });

    [Property(MaxTest = 500)]
    public Property Sort_OutputIsOrdered() =>
        Prop.ForAll(Arb.From<int[]>(), arr => {
            var sorted = BubbleSort.Sort(arr ?? Array.Empty<int>());
            for (int i = 0; i < sorted.Length - 1; i++)
                if (sorted[i] > sorted[i + 1]) return false.ToProperty();
            return true.ToProperty();
        });

    [Property(MaxTest = 200)]
    public Property Sort_IsIdempotent() =>
        Prop.ForAll(Arb.From<int[]>(), arr => {
            var input = arr ?? Array.Empty<int>();
            var once = BubbleSort.Sort(input);
            return once.SequenceEqual(BubbleSort.Sort(once)).ToProperty();
        });

    [Property(MaxTest = 300)]
    public Property Sort_PreservesElements() =>
        Prop.ForAll(Arb.From<int[]>(), arr => {
            var input = arr ?? Array.Empty<int>();
            var sorted = BubbleSort.Sort(input);
            var expected = (int[])input.Clone();
            Array.Sort(expected);
            return sorted.SequenceEqual(expected).ToProperty();
        });

    [Property(MaxTest = 300)]
    public Property Sort_FirstIsMinimum() =>
        Prop.ForAll(
            Arb.From<int[]>().Filter(a => a != null && a.Length > 0),
            arr => (BubbleSort.Sort(arr)[0] == arr.Min()).ToProperty()
        );
}

public class SerializerPropertyTests
{
    [Property(MaxTest = 200)]
    public Property Roundtrip_PreservesData() =>
        Prop.ForAll(Arb.From<int>(), value => {
            var data = new Dictionary<string, int> { ["key"] = value };
            var json = JsonSerializer.Serialize(data);
            var restored = JsonSerializer.Deserialize<Dictionary<string, int>>(json)!;
            return (restored["key"] == value).ToProperty();
        });

    [Property(MaxTest = 200)]
    public Property Serialize_ProducesValidJson() =>
        Prop.ForAll(
            Arb.Default.String().Filter(s => s != null && s.Length <= 50),
            value => {
                var data = new Dictionary<string, string> { ["k"] = value };
                var json = JsonSerializer.Serialize(data);
                try {
                    JsonSerializer.Deserialize<Dictionary<string, string>>(json);
                    return true.ToProperty();
                } catch {
                    return false.ToProperty();
                }
            });
}
```

## Choosing Properties

When writing property tests, ask yourself:

1. **What should NOT change?** → Invariance properties (length, element set)
2. **What operations reverse each other?** → Roundtrip properties
3. **What happens if I do it twice?** → Idempotence properties
4. **Is there a simpler implementation to compare?** → Oracle properties
5. **What must always be true about the output?** → Output shape properties

## Summary

Property-based testing shifts from "check these specific cases" to "verify these universal truths." Combined with shrinking, it produces minimal failing examples that make debugging straightforward. Start by identifying one or two properties for your most critical functions, then expand as you gain confidence.
