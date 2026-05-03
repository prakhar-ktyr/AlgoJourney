---
title: A/B Testing & Feature Flags
---

# A/B Testing & Feature Flags

## What Is A/B Testing?

A/B testing (split testing) compares two or more variants of a feature to determine which performs better. Users are randomly assigned to groups, and statistical analysis determines the winner.

1. **Control (A)**: The existing experience
2. **Variant (B)**: The modified experience
3. **Metric**: What you measure (conversion, click-through, retention)
4. **Random assignment**: Users bucketed consistently
5. **Statistical analysis**: Determine if the difference is significant

## Feature Flags

Feature flags decouple deployment from release. Code ships behind a flag—you control who sees it without redeploying.

### Types of Feature Flags

| Type | Purpose | Lifespan |
|---|---|---|
| Release toggle | Gradual rollout | Days to weeks |
| Experiment toggle | A/B testing | Weeks |
| Ops toggle | Kill switch | Permanent |
| Permission toggle | Premium features | Permanent |

### Benefits

- **Safe deployments**: Ship code without exposing it
- **Gradual rollouts**: 1% → 10% → 50% → 100%
- **Instant rollback**: Flip flag off, no redeploy
- **Targeted releases**: By user, region, or segment

## Tools

- **LaunchDarkly**: Enterprise feature management with targeting and analytics
- **Unleash**: Open-source with gradual rollout strategies
- **Split.io**: Feature delivery + experimentation + observability
- **Flagsmith**: Open-source with segment targeting and audit logs

## Statistical Significance

- **Sample size**: Lower baselines and smaller effects need more samples
- **P-value**: Probability of seeing the result by chance (target < 0.05)
- **Pitfalls**: Peeking too early, multiple comparisons without correction, novelty effects

## Testing Feature Flag Behavior

Tests must cover: flag ON, flag OFF, flag missing (default), and targeting rules.

## Code: Feature Flag Implementation & Tests

```python
import hashlib
from dataclasses import dataclass, field
import unittest


@dataclass
class FeatureFlag:
    name: str
    enabled: bool = False
    rollout_percentage: int = 100
    allowed_users: list[str] = field(default_factory=list)

    def is_enabled_for(self, user_id: str) -> bool:
        if not self.enabled:
            return False
        if user_id in self.allowed_users:
            return True
        return self._get_bucket(user_id) < self.rollout_percentage

    def _get_bucket(self, user_id: str) -> int:
        h = hashlib.md5(f"{self.name}:{user_id}".encode()).hexdigest()
        return int(h[:8], 16) % 100


class FeatureFlagService:
    def __init__(self):
        self._flags: dict[str, FeatureFlag] = {}

    def register(self, flag: FeatureFlag):
        self._flags[flag.name] = flag

    def is_enabled(self, flag_name: str, user_id: str) -> bool:
        flag = self._flags.get(flag_name)
        return flag.is_enabled_for(user_id) if flag else False

    def get_variant(self, flag_name: str, user_id: str, variants: list[str]) -> str:
        flag = self._flags.get(flag_name)
        if not flag or not flag.enabled:
            return variants[0]
        h = hashlib.md5(f"{flag_name}:variant:{user_id}".encode()).hexdigest()
        return variants[int(h[:8], 16) % len(variants)]


class TestFeatureFlag(unittest.TestCase):
    def test_disabled_returns_false(self):
        flag = FeatureFlag(name="new-ui", enabled=False)
        self.assertFalse(flag.is_enabled_for("user-123"))

    def test_enabled_full_rollout(self):
        flag = FeatureFlag(name="new-ui", enabled=True, rollout_percentage=100)
        self.assertTrue(flag.is_enabled_for("user-123"))

    def test_consistent_bucketing(self):
        flag = FeatureFlag(name="new-ui", enabled=True, rollout_percentage=50)
        self.assertEqual(flag.is_enabled_for("u1"), flag.is_enabled_for("u1"))

    def test_allowed_users_bypass_rollout(self):
        flag = FeatureFlag(name="beta", enabled=True, rollout_percentage=0,
                           allowed_users=["vip"])
        self.assertTrue(flag.is_enabled_for("vip"))
        self.assertFalse(flag.is_enabled_for("regular"))


class TestFeatureFlagService(unittest.TestCase):
    def setUp(self):
        self.svc = FeatureFlagService()
        self.svc.register(FeatureFlag(name="dark", enabled=True))
        self.svc.register(FeatureFlag(name="old", enabled=False))

    def test_enabled(self):
        self.assertTrue(self.svc.is_enabled("dark", "u1"))

    def test_disabled(self):
        self.assertFalse(self.svc.is_enabled("old", "u1"))

    def test_unknown_flag(self):
        self.assertFalse(self.svc.is_enabled("x", "u1"))

    def test_variant_deterministic(self):
        v = ["control", "a", "b"]
        self.assertEqual(self.svc.get_variant("dark", "u1", v),
                         self.svc.get_variant("dark", "u1", v))

    def test_variant_control_when_disabled(self):
        self.assertEqual(self.svc.get_variant("old", "u1", ["ctrl", "a"]), "ctrl")
```

```javascript
const crypto = require("crypto");

class FeatureFlag {
  constructor({ name, enabled = false, rolloutPercentage = 100, allowedUsers = [] }) {
    this.name = name;
    this.enabled = enabled;
    this.rolloutPercentage = rolloutPercentage;
    this.allowedUsers = allowedUsers;
  }

  isEnabledFor(userId) {
    if (!this.enabled) return false;
    if (this.allowedUsers.includes(userId)) return true;
    const hash = crypto.createHash("md5").update(`${this.name}:${userId}`).digest("hex");
    return parseInt(hash.substring(0, 8), 16) % 100 < this.rolloutPercentage;
  }
}

class FeatureFlagService {
  constructor() { this._flags = new Map(); }
  register(flag) { this._flags.set(flag.name, flag); }

  isEnabled(name, userId) {
    const flag = this._flags.get(name);
    return flag ? flag.isEnabledFor(userId) : false;
  }

  getVariant(name, userId, variants) {
    const flag = this._flags.get(name);
    if (!flag || !flag.enabled) return variants[0];
    const hash = crypto.createHash("md5").update(`${name}:variant:${userId}`).digest("hex");
    return variants[parseInt(hash.substring(0, 8), 16) % variants.length];
  }
}

// --- Tests ---
describe("FeatureFlag", () => {
  it("returns false when disabled", () => {
    const flag = new FeatureFlag({ name: "ui", enabled: false });
    expect(flag.isEnabledFor("u1")).toBe(false);
  });

  it("returns true for full rollout", () => {
    const flag = new FeatureFlag({ name: "ui", enabled: true });
    expect(flag.isEnabledFor("u1")).toBe(true);
  });

  it("is consistent for same user", () => {
    const flag = new FeatureFlag({ name: "ui", enabled: true, rolloutPercentage: 50 });
    expect(flag.isEnabledFor("u1")).toBe(flag.isEnabledFor("u1"));
  });

  it("allows listed users regardless of rollout", () => {
    const flag = new FeatureFlag({ name: "b", enabled: true, rolloutPercentage: 0, allowedUsers: ["vip"] });
    expect(flag.isEnabledFor("vip")).toBe(true);
    expect(flag.isEnabledFor("x")).toBe(false);
  });
});

describe("FeatureFlagService", () => {
  let svc;
  beforeEach(() => {
    svc = new FeatureFlagService();
    svc.register(new FeatureFlag({ name: "dark", enabled: true }));
    svc.register(new FeatureFlag({ name: "old", enabled: false }));
  });

  it("returns true for enabled", () => expect(svc.isEnabled("dark", "u1")).toBe(true));
  it("returns false for disabled", () => expect(svc.isEnabled("old", "u1")).toBe(false));
  it("returns false for unknown", () => expect(svc.isEnabled("x", "u1")).toBe(false));
  it("variant is deterministic", () => {
    const v = ["ctrl", "a", "b"];
    expect(svc.getVariant("dark", "u1", v)).toBe(svc.getVariant("dark", "u1", v));
  });
});
```

```java
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

public class FeatureFlag {
    private final String name;
    private final boolean enabled;
    private final int rolloutPercentage;
    private final Set<String> allowedUsers;

    public FeatureFlag(String name, boolean enabled, int rolloutPct, Set<String> allowed) {
        this.name = name;
        this.enabled = enabled;
        this.rolloutPercentage = rolloutPct;
        this.allowedUsers = allowed != null ? allowed : Set.of();
    }

    public boolean isEnabledFor(String userId) {
        if (!enabled) return false;
        if (allowedUsers.contains(userId)) return true;
        return getBucket(userId) < rolloutPercentage;
    }

    private int getBucket(String userId) {
        try {
            byte[] hash = MessageDigest.getInstance("MD5")
                .digest((name + ":" + userId).getBytes(StandardCharsets.UTF_8));
            long v = ((long)(hash[0]&0xFF)<<24)|((hash[1]&0xFF)<<16)|((hash[2]&0xFF)<<8)|(hash[3]&0xFF);
            return (int)(Math.abs(v) % 100);
        } catch (Exception e) { return 0; }
    }

    public String getName() { return name; }
    public boolean isEnabled() { return enabled; }
}

// --- JUnit 5 Tests ---
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FeatureFlagTest {
    @Test void disabledReturnsFalse() {
        assertFalse(new FeatureFlag("ui", false, 100, null).isEnabledFor("u1"));
    }

    @Test void enabledFullRollout() {
        assertTrue(new FeatureFlag("ui", true, 100, null).isEnabledFor("u1"));
    }

    @Test void consistentBucketing() {
        var flag = new FeatureFlag("ui", true, 50, null);
        assertEquals(flag.isEnabledFor("u1"), flag.isEnabledFor("u1"));
    }

    @Test void allowedUsersBypass() {
        var flag = new FeatureFlag("b", true, 0, Set.of("vip"));
        assertTrue(flag.isEnabledFor("vip"));
        assertFalse(flag.isEnabledFor("x"));
    }
}
```

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

public class FeatureFlag
{
    public string Name { get; }
    public bool Enabled { get; }
    public int RolloutPercentage { get; }
    public HashSet<string> AllowedUsers { get; }

    public FeatureFlag(string name, bool enabled, int rolloutPct = 100,
        IEnumerable<string>? allowed = null)
    {
        Name = name; Enabled = enabled; RolloutPercentage = rolloutPct;
        AllowedUsers = new HashSet<string>(allowed ?? Enumerable.Empty<string>());
    }

    public bool IsEnabledFor(string userId)
    {
        if (!Enabled) return false;
        if (AllowedUsers.Contains(userId)) return true;
        var hash = MD5.HashData(Encoding.UTF8.GetBytes($"{Name}:{userId}"));
        return BitConverter.ToUInt32(hash, 0) % 100 < RolloutPercentage;
    }
}

public class FeatureFlagService
{
    private readonly Dictionary<string, FeatureFlag> _flags = new();
    public void Register(FeatureFlag f) => _flags[f.Name] = f;

    public bool IsEnabled(string name, string userId) =>
        _flags.TryGetValue(name, out var f) && f.IsEnabledFor(userId);

    public string GetVariant(string name, string userId, string[] variants)
    {
        if (!_flags.TryGetValue(name, out var f) || !f.Enabled) return variants[0];
        var hash = MD5.HashData(Encoding.UTF8.GetBytes($"{name}:variant:{userId}"));
        return variants[BitConverter.ToUInt32(hash, 0) % (uint)variants.Length];
    }
}

// --- xUnit Tests ---
using Xunit;

public class FeatureFlagTests
{
    [Fact] public void DisabledReturnsFalse() =>
        Assert.False(new FeatureFlag("ui", false).IsEnabledFor("u1"));

    [Fact] public void EnabledFullRollout() =>
        Assert.True(new FeatureFlag("ui", true).IsEnabledFor("u1"));

    [Fact] public void ConsistentBucketing()
    {
        var f = new FeatureFlag("ui", true, 50);
        Assert.Equal(f.IsEnabledFor("u1"), f.IsEnabledFor("u1"));
    }

    [Fact] public void AllowedUsersBypass()
    {
        var f = new FeatureFlag("b", true, 0, new[] { "vip" });
        Assert.True(f.IsEnabledFor("vip"));
        Assert.False(f.IsEnabledFor("x"));
    }
}

public class FeatureFlagServiceTests
{
    private readonly FeatureFlagService _svc = new();
    public FeatureFlagServiceTests()
    {
        _svc.Register(new FeatureFlag("dark", true));
        _svc.Register(new FeatureFlag("old", false));
    }

    [Fact] public void Enabled() => Assert.True(_svc.IsEnabled("dark", "u1"));
    [Fact] public void Disabled() => Assert.False(_svc.IsEnabled("old", "u1"));
    [Fact] public void Unknown() => Assert.False(_svc.IsEnabled("x", "u1"));
    [Fact] public void VariantDeterministic()
    {
        var v = new[] { "ctrl", "a", "b" };
        Assert.Equal(_svc.GetVariant("dark", "u1", v), _svc.GetVariant("dark", "u1", v));
    }
}
```

## Key Takeaways

- A/B testing requires statistical rigor—don't peek at results early
- Feature flags decouple deployment from release, enabling safe rollouts
- Always test both flag states in your test suite
- Use deterministic hashing for consistent user bucketing
- Clean up stale flags to avoid technical debt
