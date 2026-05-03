---
title: Compliance & Regulatory Testing
---

# Compliance & Regulatory Testing

Software handling personal data, health records, or payment information must comply with regulatory frameworks. Compliance testing verifies these requirements through automated checks and audit trails.

## GDPR (General Data Protection Regulation)

### Key Requirements to Test

**Right to Erasure** — User requests deletion → all personal data removed from all tables, caches, and backups.

**Data Export (Portability)** — Users export their data in machine-readable format (JSON, CSV) within 30 days.

**Consent Management** — Explicit opt-in, granular purposes, withdraw at any time, withdrawal stops processing.

**Data Minimization** — Only necessary data collected; not retained beyond stated purposes.

## HIPAA (Health Insurance Portability and Accountability Act)

- **Access controls**: role-based access to health records
- **Audit trails**: all PHI access logged (who, what, when)
- **Encryption**: PHI encrypted at rest and in transit
- **Minimum necessary**: limit PHI disclosure to minimum required

## PCI DSS (Payment Card Industry Data Security Standard)

- Card numbers masked in logs/UI (last 4 only)
- CVV never persisted post-authorization
- Network segmentation between payment and general systems
- Tokenization for recurring operations

## SOC 2 (Service Organization Control 2)

| Criteria | Focus | Test Examples |
|----------|-------|---------------|
| Security | Unauthorized access prevention | Access control reviews |
| Availability | System uptime | DR tests, SLA verification |
| Processing Integrity | Accurate processing | Reconciliation tests |
| Confidentiality | Sensitive info protection | Encryption verification |
| Privacy | Personal information | GDPR-adjacent controls |

## Automated Compliance Checks

- Run data handling tests on every deployment
- Scan for PII in logs automatically
- Verify encryption configurations unchanged
- Express compliance rules as policy-as-code (Terraform policies, AWS Config)

## Audit Logging Testing

### What to Log

- **Who**: authenticated user identity
- **What**: action performed (read, write, delete)
- **When**: timestamp with timezone
- **Where**: resource accessed
- **Result**: success or failure

### Properties to Test

- Logs are append-only and tamper-resistant
- All required events captured (no gaps)
- Retained for required period
- Do not contain sensitive data (no PII in log messages)

## Code: Data Deletion Verification + Audit Log

```python
import pytest
from datetime import datetime, timezone
from unittest.mock import Mock
from enum import Enum


class AuditAction(Enum):
    DELETE = "DELETE"
    EXPORT = "EXPORT"


class AuditLogger:
    def __init__(self):
        self._entries = []

    def log(self, user_id, action, resource_id, details=None):
        self._entries.append({
            "user_id": user_id, "action": action, "resource_id": resource_id,
            "timestamp": datetime.now(timezone.utc), "details": details or {},
        })

    def get_entries(self, user_id):
        return [e for e in self._entries if e["user_id"] == user_id]


class UserDataService:
    TABLES = ["users", "profiles", "orders", "preferences", "sessions"]

    def __init__(self, db, audit):
        self.db = db
        self.audit = audit

    def delete_user_data(self, requesting_user, target_user):
        deleted_from = []
        for table in self.TABLES:
            if self.db.delete(table, {"user_id": target_user}) > 0:
                deleted_from.append(table)
        self.audit.log(requesting_user, AuditAction.DELETE, target_user,
                       {"tables_cleared": deleted_from})
        return deleted_from

    def export_user_data(self, requesting_user, target_user):
        data = {}
        for table in self.TABLES[:4]:
            records = self.db.find(table, {"user_id": target_user})
            if records:
                data[table] = records
        self.audit.log(requesting_user, AuditAction.EXPORT, target_user,
                       {"tables": list(data.keys())})
        return data


class TestGDPRDeletion:
    def setup_method(self):
        self.db = Mock()
        self.db.delete = Mock(return_value=1)
        self.audit = AuditLogger()
        self.service = UserDataService(self.db, self.audit)

    def test_deletes_from_all_tables(self):
        self.service.delete_user_data("admin", "user-42")
        assert self.db.delete.call_count == 5

    def test_creates_audit_entry(self):
        self.service.delete_user_data("admin", "user-42")
        entries = self.audit.get_entries("admin")
        assert len(entries) == 1
        assert entries[0]["action"] == AuditAction.DELETE
        assert entries[0]["resource_id"] == "user-42"

    def test_audit_has_utc_timestamp(self):
        self.service.delete_user_data("admin", "user-42")
        entries = self.audit.get_entries("admin")
        assert entries[0]["timestamp"].tzinfo == timezone.utc

    def test_records_affected_tables(self):
        self.db.delete = Mock(side_effect=[1, 0, 1, 0, 1])
        self.service.delete_user_data("admin", "user-42")
        entries = self.audit.get_entries("admin")
        assert entries[0]["details"]["tables_cleared"] == ["users", "orders", "sessions"]


class TestGDPRExport:
    def setup_method(self):
        self.db = Mock()
        self.db.find = Mock(return_value=[{"id": "1"}])
        self.audit = AuditLogger()
        self.service = UserDataService(self.db, self.audit)

    def test_returns_user_data(self):
        data = self.service.export_user_data("user-42", "user-42")
        assert "users" in data

    def test_creates_export_audit(self):
        self.service.export_user_data("user-42", "user-42")
        entries = self.audit.get_entries("user-42")
        assert entries[0]["action"] == AuditAction.EXPORT
```

```javascript
const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert/strict");

class AuditLogger {
  constructor() { this.entries = []; }

  log(userId, action, resourceId, details = {}) {
    this.entries.push({ userId, action, resourceId, timestamp: new Date().toISOString(), details });
  }

  getEntries(userId) {
    return this.entries.filter((e) => e.userId === userId);
  }
}

class UserDataService {
  constructor(db, audit) {
    this.db = db;
    this.audit = audit;
    this.tables = ["users", "profiles", "orders", "preferences", "sessions"];
  }

  async deleteUserData(requestingUser, targetUser) {
    const deletedFrom = [];
    for (const table of this.tables) {
      const count = await this.db.delete(table, { userId: targetUser });
      if (count > 0) deletedFrom.push(table);
    }
    this.audit.log(requestingUser, "DELETE", targetUser, { tablesCleared: deletedFrom });
    return deletedFrom;
  }

  async exportUserData(requestingUser, targetUser) {
    const data = {};
    for (const table of this.tables.slice(0, 4)) {
      const records = await this.db.find(table, { userId: targetUser });
      if (records.length > 0) data[table] = records;
    }
    this.audit.log(requestingUser, "EXPORT", targetUser, { tables: Object.keys(data) });
    return data;
  }
}

describe("GDPR Deletion", () => {
  let service, db, audit;

  beforeEach(() => {
    db = { delete: async () => 1, find: async () => [{ id: "1" }] };
    audit = new AuditLogger();
    service = new UserDataService(db, audit);
  });

  it("creates audit entry", async () => {
    await service.deleteUserData("admin", "user-42");
    const entries = audit.getEntries("admin");
    assert.equal(entries.length, 1);
    assert.equal(entries[0].action, "DELETE");
    assert.equal(entries[0].resourceId, "user-42");
  });

  it("records affected tables", async () => {
    let n = 0;
    db.delete = async () => (++n % 2 === 0 ? 0 : 1);
    await service.deleteUserData("admin", "user-42");
    const entries = audit.getEntries("admin");
    assert.ok(entries[0].details.tablesCleared.length > 0);
  });

  it("audit has timestamp", async () => {
    await service.deleteUserData("admin", "user-42");
    assert.ok(audit.getEntries("admin")[0].timestamp);
  });
});

describe("GDPR Export", () => {
  it("creates export audit", async () => {
    const db = { find: async () => [{ id: "1" }] };
    const audit = new AuditLogger();
    const service = new UserDataService(db, audit);
    await service.exportUserData("user-42", "user-42");
    assert.equal(audit.getEntries("user-42")[0].action, "EXPORT");
  });
});
```

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;
import java.time.Instant;
import java.util.*;

record AuditEntry(String userId, String action, String resourceId,
                  Instant timestamp, Map<String, Object> details) {}

class AuditLogger {
    private final List<AuditEntry> entries = new ArrayList<>();

    void log(String userId, String action, String resourceId, Map<String, Object> details) {
        entries.add(new AuditEntry(userId, action, resourceId, Instant.now(), details));
    }

    List<AuditEntry> getEntries(String userId) {
        return entries.stream().filter(e -> e.userId().equals(userId)).toList();
    }
}

interface Database {
    int delete(String table, Map<String, String> criteria);
    List<Map<String, String>> find(String table, Map<String, String> criteria);
}

class UserDataService {
    private static final List<String> TABLES =
        List.of("users", "profiles", "orders", "preferences", "sessions");
    private final Database db;
    private final AuditLogger audit;

    UserDataService(Database db, AuditLogger audit) { this.db = db; this.audit = audit; }

    List<String> deleteUserData(String requestingUser, String targetUser) {
        var deleted = new ArrayList<String>();
        for (String table : TABLES) {
            if (db.delete(table, Map.of("user_id", targetUser)) > 0) deleted.add(table);
        }
        audit.log(requestingUser, "DELETE", targetUser, Map.of("tables_cleared", deleted));
        return deleted;
    }
}

class ComplianceTest {
    private AuditLogger audit;
    private UserDataService service;

    @BeforeEach
    void setup() {
        audit = new AuditLogger();
        Database mock = new Database() {
            public int delete(String t, Map<String, String> c) { return 1; }
            public List<Map<String, String>> find(String t, Map<String, String> c) {
                return List.of(Map.of("id", "1"));
            }
        };
        service = new UserDataService(mock, audit);
    }

    @Test
    void deletionCreatesAudit() {
        service.deleteUserData("admin", "user-42");
        var entries = audit.getEntries("admin");
        assertEquals(1, entries.size());
        assertEquals("DELETE", entries.get(0).action());
        assertEquals("user-42", entries.get(0).resourceId());
    }

    @Test
    void auditHasTimestamp() {
        service.deleteUserData("admin", "user-42");
        assertNotNull(audit.getEntries("admin").get(0).timestamp());
    }

    @Test
    @SuppressWarnings("unchecked")
    void recordsAffectedTables() {
        service.deleteUserData("admin", "user-42");
        var tables = (List<String>) audit.getEntries("admin").get(0).details().get("tables_cleared");
        assertEquals(5, tables.size());
    }
}
```

```csharp
using Xunit;
using System;
using System.Collections.Generic;
using System.Linq;

public record AuditEntry(string UserId, string Action, string ResourceId,
    DateTime Timestamp, Dictionary<string, object>? Details);

public class AuditLogger
{
    private readonly List<AuditEntry> _entries = new();
    public void Log(string userId, string action, string resourceId, Dictionary<string, object>? details = null)
        => _entries.Add(new(userId, action, resourceId, DateTime.UtcNow, details));
    public List<AuditEntry> GetEntries(string userId)
        => _entries.Where(e => e.UserId == userId).ToList();
}

public interface IDatabase
{
    int Delete(string table, Dictionary<string, string> criteria);
    List<Dictionary<string, string>> Find(string table, Dictionary<string, string> criteria);
}

public class UserDataService
{
    private static readonly string[] Tables = { "users", "profiles", "orders", "preferences", "sessions" };
    private readonly IDatabase _db;
    private readonly AuditLogger _audit;

    public UserDataService(IDatabase db, AuditLogger audit) { _db = db; _audit = audit; }

    public List<string> DeleteUserData(string requestingUser, string targetUser)
    {
        var deleted = new List<string>();
        var criteria = new Dictionary<string, string> { ["user_id"] = targetUser };
        foreach (var table in Tables)
            if (_db.Delete(table, criteria) > 0) deleted.Add(table);
        _audit.Log(requestingUser, "DELETE", targetUser,
            new Dictionary<string, object> { ["tables_cleared"] = deleted });
        return deleted;
    }
}

public class ComplianceTests
{
    private readonly UserDataService _service;
    private readonly AuditLogger _audit;

    public ComplianceTests()
    {
        _audit = new AuditLogger();
        _service = new UserDataService(new MockDb(), _audit);
    }

    [Fact]
    public void Deletion_CreatesAuditEntry()
    {
        _service.DeleteUserData("admin", "user-42");
        var entries = _audit.GetEntries("admin");
        Assert.Single(entries);
        Assert.Equal("DELETE", entries[0].Action);
        Assert.Equal("user-42", entries[0].ResourceId);
    }

    [Fact]
    public void Audit_HasUtcTimestamp()
    {
        _service.DeleteUserData("admin", "user-42");
        Assert.Equal(DateTimeKind.Utc, _audit.GetEntries("admin")[0].Timestamp.Kind);
    }

    [Fact]
    public void Records_AffectedTables()
    {
        _service.DeleteUserData("admin", "user-42");
        var tables = (List<string>)_audit.GetEntries("admin")[0].Details!["tables_cleared"];
        Assert.Equal(5, tables.Count);
    }

    private class MockDb : IDatabase
    {
        public int Delete(string t, Dictionary<string, string> c) => 1;
        public List<Dictionary<string, string>> Find(string t, Dictionary<string, string> c)
            => new() { new() { ["id"] = "1" } };
    }
}
```

## Key Takeaways

1. **Compliance is testable** — express regulatory requirements as automated assertions in CI
2. **Audit logs are critical** — every data access must be traceable to a user and timestamp
3. **Right to deletion must be thorough** — verify removal across all tables, caches, and backups
4. **Separate compliance tests from functional tests** — regulatory requirements change independently
5. **Defense in depth** — combine application-level checks with infrastructure controls
