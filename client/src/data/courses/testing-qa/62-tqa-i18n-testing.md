---
title: Internationalization & Localization Testing
---

# Internationalization & Localization Testing

Internationalization (i18n) and localization (L10n) testing ensures software works correctly across languages, regions, and cultural conventions.

## i18n vs L10n: What to Test

**Internationalization (i18n)** — engineering for adaptability: string externalization, locale-aware APIs, Unicode support, layout flexibility, bidirectional text.

**Localization (L10n)** — adapting for a specific locale: translation accuracy, cultural appropriateness, local date/time/number/currency conventions, legal compliance per region.

## Character Encoding

### UTF-8 Essentials

- **Multi-byte characters**: Chinese (中文), Japanese (日本語), Korean (한국어)
- **Combining characters**: accented letters (é = e + ◌́)
- **Emoji**: 👨‍👩‍👧‍👦 (ZWJ sequences)
- **Special characters**: mathematical (∑), currency (¥, €, ₹)

### Common Bugs

- Truncating multi-byte characters at byte boundaries
- Database columns with wrong character set (latin1 vs utf8mb4)
- URL encoding of non-ASCII characters
- JSON serialization of Unicode escapes

### RTL (Right-to-Left) Text

Arabic (العربية) and Hebrew (עברית) flow right-to-left:

- Text alignment and UI layout mirror
- Mixed LTR/RTL content (bidirectional algorithm)
- Numbers within RTL text remain LTR

## Date/Time/Number Formatting

| Locale | Date | Number | Currency |
|--------|------|--------|----------|
| en-US | 12/31/2025 | 1,234.56 | $1,234.56 |
| de-DE | 31.12.2025 | 1.234,56 | 1.234,56 € |
| ja-JP | 2025/12/31 | 1,234.56 | ¥1,235 |
| fr-FR | 31/12/2025 | 1 234,56 | 1 234,56 € |

## Translation Completeness Checks

- Compare translation files for missing keys
- Detect untranslated strings in UI
- Verify placeholder consistency ({name} in all translations)
- Check for maximum length violations
- Ensure pluralization rules are correct per language

## UI Layout with Different Text Lengths

English text expands 120-300% when translated (shorter strings expand more). Test for: button overflow, table misalignment, navigation wrapping, tooltip clipping.

## Pseudo-Localization

Replace source strings with modified versions to simulate translation challenges:

```
Source:  "Welcome back, {name}!"
Pseudo:  "[Ŵéļçöɱé ƀáçķ, {name}! ++++++]"
```

Detects hard-coded strings, truncation issues, and concatenation problems without real translations.

## Code: Locale-Aware Formatting Tests

```python
import pytest
from datetime import datetime
import unicodedata


class LocaleFormatter:
    CONFIGS = {
        "en-US": {"date": "%m/%d/%Y", "thou": ",", "dec": ".", "cur": "$", "pos": "before"},
        "de-DE": {"date": "%d.%m.%Y", "thou": ".", "dec": ",", "cur": "€", "pos": "after"},
        "ja-JP": {"date": "%Y/%m/%d", "thou": ",", "dec": ".", "cur": "¥", "pos": "before"},
    }

    def __init__(self, locale):
        if locale not in self.CONFIGS:
            raise ValueError(f"Unsupported locale: {locale}")
        self.config = self.CONFIGS[locale]

    def format_date(self, dt):
        return dt.strftime(self.config["date"])

    def format_number(self, number, decimals=2):
        raw = f"{abs(number):,.{decimals}f}"
        raw = raw.replace(",", "T").replace(".", "D")
        raw = raw.replace("T", self.config["thou"]).replace("D", self.config["dec"])
        return f"-{raw}" if number < 0 else raw

    def format_currency(self, amount):
        formatted = self.format_number(amount)
        sym = self.config["cur"]
        return f"{sym}{formatted}" if self.config["pos"] == "before" else f"{formatted}\u00a0{sym}"


class TranslationChecker:
    def __init__(self, source, target):
        self.source = source
        self.target = target

    def find_missing_keys(self):
        return [k for k in self.source if k not in self.target]

    def find_placeholder_mismatches(self):
        import re
        pattern = re.compile(r"\{(\w+)\}")
        mismatches = []
        for key in self.source:
            if key not in self.target:
                continue
            src = set(pattern.findall(self.source[key]))
            tgt = set(pattern.findall(self.target[key]))
            if src != tgt:
                mismatches.append(key)
        return mismatches


class TestLocaleFormatting:
    def test_us_date(self):
        assert LocaleFormatter("en-US").format_date(datetime(2025, 12, 31)) == "12/31/2025"

    def test_german_date(self):
        assert LocaleFormatter("de-DE").format_date(datetime(2025, 12, 31)) == "31.12.2025"

    def test_japanese_date(self):
        assert LocaleFormatter("ja-JP").format_date(datetime(2025, 12, 31)) == "2025/12/31"

    def test_us_number(self):
        assert LocaleFormatter("en-US").format_number(1234567.89) == "1,234,567.89"

    def test_german_number(self):
        assert LocaleFormatter("de-DE").format_number(1234567.89) == "1.234.567,89"

    def test_us_currency(self):
        assert LocaleFormatter("en-US").format_currency(1234.56) == "$1,234.56"

    def test_german_currency(self):
        assert LocaleFormatter("de-DE").format_currency(1234.56) == "1.234,56\u00a0€"

    def test_unsupported_raises(self):
        with pytest.raises(ValueError):
            LocaleFormatter("xx-XX")


class TestUnicode:
    def test_multibyte(self):
        assert len("日本語".encode("utf-8")) == 9

    def test_combining_characters(self):
        assert unicodedata.normalize("NFC", "e\u0301") == "\u00e9"

    def test_rtl_preserved(self):
        assert len("مرحبا") == 5


class TestTranslation:
    def test_finds_missing_keys(self):
        checker = TranslationChecker(
            {"hello": "Hello", "bye": "Goodbye"},
            {"hello": "Hallo"},
        )
        assert checker.find_missing_keys() == ["bye"]

    def test_finds_placeholder_mismatches(self):
        checker = TranslationChecker(
            {"msg": "Hello {name}, {count} items"},
            {"msg": "Hallo {name}"},
        )
        assert checker.find_placeholder_mismatches() == ["msg"]
```

```javascript
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

class LocaleFormatter {
  static CONFIGS = {
    "en-US": { dateOrder: ["m", "d", "y"], sep: "/", thou: ",", dec: ".", cur: "$", pos: "before" },
    "de-DE": { dateOrder: ["d", "m", "y"], sep: ".", thou: ".", dec: ",", cur: "€", pos: "after" },
    "ja-JP": { dateOrder: ["y", "m", "d"], sep: "/", thou: ",", dec: ".", cur: "¥", pos: "before" },
  };

  constructor(locale) {
    if (!LocaleFormatter.CONFIGS[locale]) throw new Error(`Unsupported locale: ${locale}`);
    this.config = LocaleFormatter.CONFIGS[locale];
  }

  formatDate(date) {
    const parts = { y: date.getFullYear(), m: String(date.getMonth() + 1).padStart(2, "0"),
                    d: String(date.getDate()).padStart(2, "0") };
    return this.config.dateOrder.map((k) => parts[k]).join(this.config.sep);
  }

  formatNumber(number, decimals = 2) {
    const [int, dec] = Math.abs(number).toFixed(decimals).split(".");
    const withThou = int.replace(/\B(?=(\d{3})+(?!\d))/g, this.config.thou);
    return `${number < 0 ? "-" : ""}${withThou}${this.config.dec}${dec}`;
  }

  formatCurrency(amount) {
    const f = this.formatNumber(amount);
    return this.config.pos === "before" ? `${this.config.cur}${f}` : `${f}\u00a0${this.config.cur}`;
  }
}

class TranslationChecker {
  constructor(source, target) { this.source = source; this.target = target; }

  findMissingKeys() {
    return Object.keys(this.source).filter((k) => !(k in this.target));
  }

  findPlaceholderMismatches() {
    const re = /\{(\w+)\}/g;
    return Object.keys(this.source).filter((k) => {
      if (!(k in this.target)) return false;
      const src = new Set([...this.source[k].matchAll(re)].map((m) => m[1]));
      const tgt = new Set([...this.target[k].matchAll(re)].map((m) => m[1]));
      return src.size !== tgt.size || [...src].some((p) => !tgt.has(p));
    });
  }
}

describe("LocaleFormatter", () => {
  const date = new Date(2025, 11, 31);

  it("US date", () => assert.equal(new LocaleFormatter("en-US").formatDate(date), "12/31/2025"));
  it("DE date", () => assert.equal(new LocaleFormatter("de-DE").formatDate(date), "31.12.2025"));
  it("JP date", () => assert.equal(new LocaleFormatter("ja-JP").formatDate(date), "2025/12/31"));
  it("US number", () => assert.equal(new LocaleFormatter("en-US").formatNumber(1234567.89), "1,234,567.89"));
  it("DE number", () => assert.equal(new LocaleFormatter("de-DE").formatNumber(1234567.89), "1.234.567,89"));
  it("US currency", () => assert.equal(new LocaleFormatter("en-US").formatCurrency(1234.56), "$1,234.56"));
  it("DE currency", () => assert.equal(new LocaleFormatter("de-DE").formatCurrency(1234.56), "1.234,56\u00a0€"));
});

describe("Unicode", () => {
  it("CJK bytes", () => assert.equal(Buffer.byteLength("日本語", "utf8"), 9));
  it("RTL preserved", () => assert.equal("مرحبا".length, 5));
});

describe("TranslationChecker", () => {
  it("finds missing keys", () => {
    const c = new TranslationChecker({ a: "A", b: "B" }, { a: "X" });
    assert.deepEqual(c.findMissingKeys(), ["b"]);
  });
  it("finds placeholder mismatches", () => {
    const c = new TranslationChecker({ m: "{name} {count}" }, { m: "{name}" });
    assert.deepEqual(c.findPlaceholderMismatches(), ["m"]);
  });
});
```

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.*;

class LocaleFormatter {
    private static final Map<String, String[]> CONFIGS = Map.of(
        "en-US", new String[]{"MM/dd/yyyy", ",", ".", "$", "before"},
        "de-DE", new String[]{"dd.MM.yyyy", ".", ",", "€", "after"},
        "ja-JP", new String[]{"yyyy/MM/dd", ",", ".", "¥", "before"}
    );
    private final String[] config;

    LocaleFormatter(String locale) {
        config = CONFIGS.get(locale);
        if (config == null) throw new IllegalArgumentException("Unsupported: " + locale);
    }

    String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern(config[0]));
    }

    String formatNumber(double number, int decimals) {
        String raw = String.format("%,." + decimals + "f", Math.abs(number));
        raw = raw.replace(",", "T").replace(".", "D");
        raw = raw.replace("T", config[1]).replace("D", config[2]);
        return (number < 0 ? "-" : "") + raw;
    }

    String formatCurrency(double amount) {
        String f = formatNumber(amount, 2);
        return "before".equals(config[4]) ? config[3] + f : f + "\u00a0" + config[3];
    }
}

class TranslationChecker {
    private final Map<String, String> source, target;
    TranslationChecker(Map<String, String> s, Map<String, String> t) { source = s; target = t; }

    List<String> findMissingKeys() {
        return source.keySet().stream().filter(k -> !target.containsKey(k)).toList();
    }

    List<String> findPlaceholderMismatches() {
        var pattern = Pattern.compile("\\{(\\w+)\\}");
        return source.entrySet().stream().filter(e -> {
            if (!target.containsKey(e.getKey())) return false;
            var src = extract(e.getValue(), pattern);
            var tgt = extract(target.get(e.getKey()), pattern);
            return !src.equals(tgt);
        }).map(Map.Entry::getKey).toList();
    }

    private Set<String> extract(String text, Pattern p) {
        var set = new HashSet<String>();
        var m = p.matcher(text);
        while (m.find()) set.add(m.group(1));
        return set;
    }
}

class I18nTest {
    @Test void usDate() { assertEquals("12/31/2025",
        new LocaleFormatter("en-US").formatDate(LocalDate.of(2025, 12, 31))); }
    @Test void deDate() { assertEquals("31.12.2025",
        new LocaleFormatter("de-DE").formatDate(LocalDate.of(2025, 12, 31))); }
    @Test void jpDate() { assertEquals("2025/12/31",
        new LocaleFormatter("ja-JP").formatDate(LocalDate.of(2025, 12, 31))); }
    @Test void usNumber() { assertEquals("1,234,567.89",
        new LocaleFormatter("en-US").formatNumber(1234567.89, 2)); }
    @Test void deNumber() { assertEquals("1.234.567,89",
        new LocaleFormatter("de-DE").formatNumber(1234567.89, 2)); }
    @Test void usCurrency() { assertEquals("$1,234.56",
        new LocaleFormatter("en-US").formatCurrency(1234.56)); }
    @Test void deCurrency() { assertEquals("1.234,56\u00a0€",
        new LocaleFormatter("de-DE").formatCurrency(1234.56)); }
    @Test void missingKeys() {
        var c = new TranslationChecker(Map.of("a", "A", "b", "B"), Map.of("a", "X"));
        assertTrue(c.findMissingKeys().contains("b"));
    }
    @Test void placeholderMismatch() {
        var c = new TranslationChecker(Map.of("m", "{name} {count}"), Map.of("m", "{name}"));
        assertEquals(1, c.findPlaceholderMismatches().size());
    }
    @Test void cjkBytes() { assertTrue("日本語".getBytes(java.nio.charset.StandardCharsets.UTF_8).length == 9); }
}
```

```csharp
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

public class LocaleFormatter
{
    private static readonly Dictionary<string, (string Fmt, string Thou, string Dec, string Cur, string Pos)> Configs = new()
    {
        ["en-US"] = ("MM/dd/yyyy", ",", ".", "$", "before"),
        ["de-DE"] = ("dd.MM.yyyy", ".", ",", "€", "after"),
        ["ja-JP"] = ("yyyy/MM/dd", ",", ".", "¥", "before"),
    };
    private readonly (string Fmt, string Thou, string Dec, string Cur, string Pos) _c;

    public LocaleFormatter(string locale)
    {
        if (!Configs.TryGetValue(locale, out _c))
            throw new ArgumentException($"Unsupported: {locale}");
    }

    public string FormatDate(DateTime d) => d.ToString(_c.Fmt);

    public string FormatNumber(double n, int dec = 2)
    {
        var raw = Math.Abs(n).ToString($"N{dec}", System.Globalization.CultureInfo.InvariantCulture);
        raw = raw.Replace(",", "T").Replace(".", "D").Replace("T", _c.Thou).Replace("D", _c.Dec);
        return (n < 0 ? "-" : "") + raw;
    }

    public string FormatCurrency(double amount)
    {
        var f = FormatNumber(amount);
        return _c.Pos == "before" ? $"{_c.Cur}{f}" : $"{f}\u00a0{_c.Cur}";
    }
}

public class TranslationChecker
{
    private readonly Dictionary<string, string> _src, _tgt;
    public TranslationChecker(Dictionary<string, string> s, Dictionary<string, string> t) { _src = s; _tgt = t; }

    public List<string> FindMissingKeys() => _src.Keys.Where(k => !_tgt.ContainsKey(k)).ToList();

    public List<string> FindPlaceholderMismatches()
    {
        var re = new Regex(@"\{(\w+)\}");
        return _src.Where(kv => _tgt.ContainsKey(kv.Key) &&
            !new HashSet<string>(re.Matches(kv.Value).Select(m => m.Groups[1].Value))
             .SetEquals(re.Matches(_tgt[kv.Key]).Select(m => m.Groups[1].Value)))
            .Select(kv => kv.Key).ToList();
    }
}

public class I18nTests
{
    [Theory]
    [InlineData("en-US", "12/31/2025")]
    [InlineData("de-DE", "31.12.2025")]
    [InlineData("ja-JP", "2025/12/31")]
    public void FormatsDate(string locale, string expected)
        => Assert.Equal(expected, new LocaleFormatter(locale).FormatDate(new DateTime(2025, 12, 31)));

    [Theory]
    [InlineData("en-US", "1,234,567.89")]
    [InlineData("de-DE", "1.234.567,89")]
    public void FormatsNumber(string locale, string expected)
        => Assert.Equal(expected, new LocaleFormatter(locale).FormatNumber(1234567.89));

    [Fact] public void USCurrency() => Assert.Equal("$1,234.56", new LocaleFormatter("en-US").FormatCurrency(1234.56));
    [Fact] public void DECurrency() => Assert.Equal("1.234,56\u00a0€", new LocaleFormatter("de-DE").FormatCurrency(1234.56));

    [Fact]
    public void MissingKeys()
    {
        var c = new TranslationChecker(new() { ["a"] = "A", ["b"] = "B" }, new() { ["a"] = "X" });
        Assert.Contains("b", c.FindMissingKeys());
    }

    [Fact]
    public void PlaceholderMismatch()
    {
        var c = new TranslationChecker(new() { ["m"] = "{name} {count}" }, new() { ["m"] = "{name}" });
        Assert.Single(c.FindPlaceholderMismatches());
    }

    [Fact] public void CJKBytes() => Assert.Equal(9, Encoding.UTF8.GetByteCount("日本語"));
    [Fact] public void RTL() => Assert.Equal(5, "مرحبا".Length);
}
```

## Key Takeaways

1. **i18n is an architecture concern** — retrofit is expensive; design for localization from the start
2. **Pseudo-localization catches bugs early** — find hard-coded strings and truncation without waiting for translations
3. **Date/number formatting is locale-specific** — never assume a single format; use locale-aware APIs
4. **UTF-8 is not enough** — test multi-byte characters, combining characters, and emoji at every layer
5. **Translation completeness is automatable** — check for missing keys and placeholder mismatches in CI
6. **RTL support requires layout testing** — mirroring UI is more than flipping text alignment
