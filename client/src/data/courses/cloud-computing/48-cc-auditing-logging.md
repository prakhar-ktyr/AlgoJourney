---
title: "Cloud Auditing and Logging"
---

# Cloud Auditing and Logging

In this lesson, you will learn how to **capture, store, analyze, and act on logs** in the cloud — the foundation of security monitoring, compliance, and incident response.

Think of logging like security cameras in a building. You might not watch them every day, but when something goes wrong, they're the first thing you check.

---

## Why Logging and Auditing Matter

Without proper logging, you're flying blind. You won't know:

- **Who** accessed your systems
- **What** changes were made
- **When** a breach occurred
- **How** an attacker got in
- **Whether** you're meeting compliance requirements

### The Cost of Not Logging

| Scenario | Without Logging | With Logging |
|----------|----------------|--------------|
| Security breach | "We have no idea what happened" | "Attacker accessed S3 bucket via compromised IAM key at 2:43 AM" |
| Compliance audit | "We can't prove who accessed the data" | "Here's a complete access trail for the last 12 months" |
| Performance issue | "The app is slow, no idea why" | "Database queries spiked 10x at 3 PM due to a missing index" |
| Cost anomaly | "Why is the bill so high?" | "Someone launched 50 GPU instances in us-west-2 on Tuesday" |

### Three Pillars of Observability

Logging is one of three pillars that give you full visibility into your cloud environment:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    LOGS      │  │   METRICS    │  │   TRACES     │
│              │  │              │  │              │
│  What        │  │  How much /  │  │  The path    │
│  happened    │  │  How fast    │  │  of a request│
│              │  │              │  │              │
│  Text events │  │  Numbers     │  │  Spans       │
│  over time   │  │  over time   │  │  across      │
│              │  │              │  │  services    │
└──────────────┘  └──────────────┘  └──────────────┘
```

This lesson focuses on **logs** — the detailed record of events in your cloud environment.

---

## Cloud Audit Services

Every major cloud provider offers an audit service that automatically records **API calls** made to your account.

### Comparison of Audit Services

| Feature | AWS CloudTrail | Azure Activity Log | GCP Cloud Audit Logs |
|---------|---------------|-------------------|---------------------|
| **What it logs** | All AWS API calls | Resource management operations | Admin, Data Access, System Events |
| **Enabled by default** | Management events (90 days) | Yes (90 days) | Admin Activity only |
| **Retention** | 90 days (free), S3 for longer | 90 days, Log Analytics for longer | 400 days (Admin), 30 days (Data) |
| **Cost** | Free for management events | Free for 90 days | Free for Admin Activity |
| **Multi-region** | Optional (recommended) | Per subscription | Per project |

---

## AWS CloudTrail

**CloudTrail** records every API call made in your AWS account — whether from the console, CLI, SDK, or another AWS service.

### What a CloudTrail Event Looks Like

```json
{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "principalId": "AIDA1234567890EXAMPLE",
    "arn": "arn:aws:iam::123456789012:user/alice",
    "accountId": "123456789012",
    "userName": "alice"
  },
  "eventTime": "2026-05-04T14:30:00Z",
  "eventSource": "s3.amazonaws.com",
  "eventName": "DeleteBucket",
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.50",
  "userAgent": "aws-cli/2.15.0",
  "requestParameters": {
    "bucketName": "production-data-backup"
  },
  "responseElements": null,
  "errorCode": "AccessDenied",
  "errorMessage": "Access Denied"
}
```

**Reading this event**:
- **Who**: User `alice` (IAM User)
- **What**: Tried to delete S3 bucket `production-data-backup`
- **When**: May 4, 2026 at 2:30 PM UTC
- **Where**: us-east-1 region
- **From**: IP address 203.0.113.50 using AWS CLI
- **Result**: **Access Denied** — the deletion was blocked ✅

### Setting Up CloudTrail (Terraform)

```hcl
resource "aws_cloudtrail" "main" {
  name                       = "organization-trail"
  s3_bucket_name             = aws_s3_bucket.trail.id
  is_multi_region_trail      = true
  is_organization_trail      = true
  enable_log_file_validation = true
  include_global_service_events = true

  cloud_watch_logs_group_arn = "${aws_cloudwatch_log_group.trail.arn}:*"
  cloud_watch_logs_role_arn  = aws_iam_role.cloudtrail.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = ["arn:aws:s3:::"]
    }
  }

  tags = {
    Name        = "organization-trail"
    Environment = "security"
  }
}

resource "aws_cloudwatch_log_group" "trail" {
  name              = "/aws/cloudtrail/organization"
  retention_in_days = 365
}
```

### Azure Activity Log Event

```json
{
  "authorization": {
    "action": "Microsoft.Compute/virtualMachines/delete",
    "scope": "/subscriptions/xxx/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/web-server-01"
  },
  "caller": "alice@company.com",
  "eventTimestamp": "2026-05-04T14:30:00Z",
  "operationName": {
    "value": "Microsoft.Compute/virtualMachines/delete"
  },
  "status": {
    "value": "Failed"
  },
  "category": {
    "value": "Administrative"
  }
}
```

### GCP Cloud Audit Log Entry

```json
{
  "protoPayload": {
    "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
    "serviceName": "storage.googleapis.com",
    "methodName": "storage.buckets.delete",
    "authenticationInfo": {
      "principalEmail": "alice@company.com"
    },
    "requestMetadata": {
      "callerIp": "203.0.113.50"
    },
    "status": {
      "code": 7,
      "message": "PERMISSION_DENIED"
    },
    "resourceName": "projects/my-project/buckets/production-data"
  },
  "timestamp": "2026-05-04T14:30:00Z",
  "severity": "ERROR"
}
```

---

## Log Types

Not all logs are created equal. Understanding the different types helps you decide what to capture and how long to keep it.

### Management Events vs. Data Events

| Type | What It Captures | Examples | Default |
|------|-----------------|---------|---------|
| **Management Events** | Control plane operations | Create/delete resources, IAM changes, VPC modifications | Enabled (free) |
| **Data Events** | Data plane operations | S3 object reads/writes, Lambda invocations, DynamoDB queries | Disabled (costs money) |
| **Network Logs** | Network traffic metadata | VPC Flow Logs, NSG Flow Logs | Disabled (costs money) |
| **Application Logs** | Your application output | HTTP requests, errors, business events | You configure |

### When to Enable Data Events

Data events generate **high volume** and cost more, so enable them selectively:

| Enable Data Events When | Example |
|--------------------------|---------|
| Compliance requires it | PCI-DSS: log all access to cardholder data |
| Sensitive data is stored | HIPAA: log all access to PHI |
| Investigating a breach | Temporarily enable to trace data access |
| Auditing specific resources | Track who accessed a specific S3 bucket |

```
Volume comparison:
Management Events:  ~100-1,000 events/day (typical account)
Data Events:        ~100,000-10,000,000 events/day (busy account)
Network Logs:       ~1,000,000-100,000,000 records/day (busy VPC)
```

---

## Centralized Logging

In any real cloud environment, logs come from **dozens of sources**. Centralized logging brings them all together into one place.

### Why Centralize?

| Problem | Solution |
|---------|----------|
| Logs scattered across accounts/regions | Single logging account/workspace |
| Hard to correlate events | Unified search across all logs |
| Inconsistent retention | Standard retention policies |
| Tamper risk | Immutable log storage |
| Compliance evidence | Single audit point |

### Centralized Logging Architecture

```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Account A  │  │ Account B  │  │ Account C  │
│            │  │            │  │            │
│ CloudTrail │  │ CloudTrail │  │ CloudTrail │
│ VPC Flow   │  │ VPC Flow   │  │ App Logs   │
│ App Logs   │  │ WAF Logs   │  │ DB Logs    │
└─────┬──────┘  └─────┬──────┘  └─────┬──────┘
      │               │               │
      └───────────────┼───────────────┘
                      │
              ┌───────▼───────┐
              │  CENTRAL LOG  │
              │   ACCOUNT     │
              │               │
              │  ┌─────────┐  │
              │  │ S3 Log  │  │
              │  │ Bucket  │  │
              │  │ (Long   │  │
              │  │  Term)  │  │
              │  └─────────┘  │
              │               │
              │  ┌─────────┐  │
              │  │ Log     │  │
              │  │ Analysis│  │
              │  │ Service │  │
              │  └─────────┘  │
              └───────────────┘
```

### Centralized Logging Services

| Provider | Ingestion Service | Storage | Analysis |
|----------|------------------|---------|----------|
| **AWS** | CloudWatch Logs | S3 (long-term) | CloudWatch Insights, Athena |
| **Azure** | Azure Monitor | Log Analytics Workspace | KQL queries |
| **GCP** | Cloud Logging | Cloud Storage (long-term) | Log Explorer, BigQuery |

### AWS CloudWatch Logs Example

```python
# Send custom application logs to CloudWatch
import boto3
import time
import json

logs = boto3.client("logs")

# Create log group and stream
logs.create_log_group(logGroupName="/app/web-server")
logs.create_log_stream(
    logGroupName="/app/web-server",
    logStreamName="instance-001"
)

# Put log events
logs.put_log_events(
    logGroupName="/app/web-server",
    logStreamName="instance-001",
    logEvents=[
        {
            "timestamp": int(time.time() * 1000),
            "message": json.dumps({
                "level": "ERROR",
                "service": "auth",
                "message": "Failed login attempt",
                "user": "unknown",
                "ip": "203.0.113.50",
                "attempts": 5
            })
        }
    ]
)
```

### Azure Monitor Log Query (KQL)

```kusto
// Find all failed login attempts in the last 24 hours
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != "0"  // Non-zero means failure
| summarize FailedAttempts = count() by
    UserPrincipalName,
    IPAddress,
    Location = tostring(LocationDetails.city)
| where FailedAttempts > 5
| order by FailedAttempts desc
```

---

## Log Analysis

Raw logs are useless unless you can **search**, **filter**, and **analyze** them effectively.

### Log Analysis Services

| Provider | Service | Best For |
|----------|---------|----------|
| **AWS** | CloudWatch Logs Insights | Real-time queries on recent logs |
| **AWS** | Amazon Athena | SQL queries on S3-stored logs (cost-effective for large volumes) |
| **Azure** | Log Analytics (KQL) | Powerful query language, integrated with Azure Monitor |
| **GCP** | Log Explorer | Real-time log browsing and filtering |
| **GCP** | BigQuery | SQL analysis on exported logs |

### CloudWatch Logs Insights Queries

```sql
-- Find the top 10 IAM users making API calls
fields @timestamp, userIdentity.userName, eventName
| stats count(*) as apiCalls by userIdentity.userName
| sort apiCalls desc
| limit 10
```

```sql
-- Find all unauthorized API calls in the last hour
fields @timestamp, userIdentity.userName, eventName, errorCode
| filter errorCode = "AccessDenied" or errorCode = "UnauthorizedAccess"
| sort @timestamp desc
| limit 50
```

```sql
-- Find security group changes
fields @timestamp, userIdentity.userName, eventName, requestParameters.groupId
| filter eventSource = "ec2.amazonaws.com"
| filter eventName in [
    "AuthorizeSecurityGroupIngress",
    "AuthorizeSecurityGroupEgress",
    "RevokeSecurityGroupIngress",
    "RevokeSecurityGroupEgress"
  ]
| sort @timestamp desc
```

### Athena Query on CloudTrail Logs

```sql
-- Query CloudTrail logs stored in S3 using standard SQL
SELECT
    eventtime,
    useridentity.username,
    eventsource,
    eventname,
    sourceipaddress,
    errorcode
FROM cloudtrail_logs
WHERE eventtime > '2026-05-01'
  AND errorcode IS NOT NULL
ORDER BY eventtime DESC
LIMIT 100;
```

### Cost Comparison for Log Analysis

| Approach | Best For | Cost Model |
|----------|----------|------------|
| **CloudWatch Insights** | Recent logs (< 30 days) | Per query (data scanned) |
| **Athena on S3** | Historical logs (months/years) | Per query ($5/TB scanned) |
| **OpenSearch** | Full-text search, dashboards | Instance hours + storage |
| **BigQuery** | Large-scale analytics | Per query ($5/TB processed) |

> **Tip**: Store logs in S3/Cloud Storage in **Parquet format** and **partition by date**. This can reduce Athena/BigQuery costs by 90%+ because less data is scanned.

---

## SIEM Integration

A **Security Information and Event Management (SIEM)** system aggregates logs from all sources, correlates events, detects threats, and helps with incident response.

### Popular SIEM Solutions

| SIEM | Provider | Strengths |
|------|----------|-----------|
| **Amazon Security Lake** | AWS | OCSF format, integrates with AWS services |
| **Microsoft Sentinel** | Azure | Native Azure integration, AI-powered detection |
| **Chronicle** | Google | Petabyte-scale, fixed-cost pricing |
| **Splunk** | Independent | Mature, powerful search, extensive integrations |
| **Elastic SIEM** | Independent | Open source option, flexible deployment |
| **Datadog Security** | Independent | Combined observability + security |

### SIEM Architecture

```
                  Log Sources
    ┌─────┐  ┌─────┐  ┌─────┐  ┌──────┐
    │Cloud│  │ App │  │ Net │  │  IAM │
    │Trail│  │ Logs│  │ Flow│  │ Logs │
    └──┬──┘  └──┬──┘  └──┬──┘  └──┬───┘
       │        │        │        │
       └────────┼────────┼────────┘
                │
         ┌──────▼──────┐
         │    SIEM     │
         │             │
         │  Collect     │ ─── Ingest from all sources
         │  Normalize   │ ─── Standard format (OCSF/CEF)
         │  Correlate   │ ─── Connect related events
         │  Detect      │ ─── Rule-based + ML detection
         │  Alert       │ ─── Notify security team
         │  Investigate │ ─── Drill down into events
         │  Report      │ ─── Compliance dashboards
         └─────────────┘
```

### Microsoft Sentinel Detection Rule (KQL)

```kusto
// Detect brute force attacks: 10+ failed logins
// from same IP within 5 minutes
let threshold = 10;
let timeWindow = 5m;

SigninLogs
| where TimeGenerated > ago(1h)
| where ResultType != "0"
| summarize
    FailedCount = count(),
    Accounts = make_set(UserPrincipalName),
    FirstAttempt = min(TimeGenerated),
    LastAttempt = max(TimeGenerated)
    by IPAddress, bin(TimeGenerated, timeWindow)
| where FailedCount >= threshold
| project
    IPAddress,
    FailedCount,
    TargetedAccounts = array_length(Accounts),
    Accounts,
    FirstAttempt,
    LastAttempt,
    Duration = LastAttempt - FirstAttempt
```

### Splunk Search (SPL)

```spl
# Find potential data exfiltration: large S3 downloads
index=cloudtrail sourcetype=aws:cloudtrail
    eventName=GetObject
| stats sum(bytes) as totalBytes,
        count as downloadCount
    by userIdentity.userName, sourceIPAddress
| where totalBytes > 1073741824
| eval totalGB = round(totalBytes/1073741824, 2)
| sort -totalGB
| table userIdentity.userName, sourceIPAddress, downloadCount, totalGB
```

---

## Log Retention Policies

How long should you keep your logs? The answer depends on **compliance requirements**, **cost**, and **usefulness**.

### Retention Requirements by Regulation

| Regulation | Minimum Retention | What to Retain |
|------------|------------------|----------------|
| **PCI-DSS** | 1 year (3 months immediately available) | All access to cardholder data |
| **HIPAA** | 6 years | All access to PHI |
| **SOX** | 7 years | Financial system audit trails |
| **GDPR** | As short as possible | Must justify retention period |
| **FedRAMP** | 1 year | All security-relevant events |
| **SOC 2** | 1 year (typical) | All security events |

### Cost-Effective Retention Strategy

```
Hot Storage (0-30 days)
├── CloudWatch Logs / Log Analytics / Cloud Logging
├── Fast queries, real-time alerts
└── Most expensive per GB

Warm Storage (30-90 days)
├── CloudWatch Infrequent Access / Log Analytics archive
├── Slower queries, cheaper storage
└── Good for recent investigations

Cold Storage (90 days - 7 years)
├── S3 Glacier / Azure Archive / Cloud Storage Archive
├── Hours to retrieve, very cheap
└── Compliance retention

Delete (after retention period)
├── Automated lifecycle policies
├── Document deletion in compliance records
└── Ensure deletion covers all copies
```

### AWS S3 Lifecycle Policy for Logs

```json
{
  "Rules": [
    {
      "ID": "LogRetentionPolicy",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "logs/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

This policy:
- **0-30 days**: Standard storage (fast access)
- **30-90 days**: Infrequent Access (cheaper, slightly slower)
- **90-365 days**: Glacier (cheap, hours to retrieve)
- **1-7 years**: Deep Archive (cheapest, 12 hours to retrieve)
- **After 7 years**: Automatically deleted

---

## Compliance Logging Requirements

Different compliance frameworks have specific logging requirements. Here's a practical checklist.

### PCI-DSS Logging Requirements (Requirement 10)

| Sub-Requirement | What to Log |
|-----------------|-------------|
| 10.2.1 | All individual user access to cardholder data |
| 10.2.2 | All actions by any individual with root/admin privileges |
| 10.2.3 | Access to all audit trails |
| 10.2.4 | Invalid logical access attempts |
| 10.2.5 | Use of identification and authentication mechanisms |
| 10.2.6 | Initialization, stopping, or pausing of audit logs |
| 10.2.7 | Creation and deletion of system-level objects |

### HIPAA Logging Checklist

```
✅ User login/logout events
✅ Access to PHI (read, create, modify, delete)
✅ Failed access attempts
✅ Changes to user permissions
✅ System administration activities
✅ Data exports and transfers
✅ Encryption key management events
✅ Backup and restore operations
✅ Emergency access ("break-the-glass") events
```

### Implementing Compliance Logging

```hcl
# Terraform: Complete compliance logging setup

# 1. CloudTrail for API auditing
resource "aws_cloudtrail" "compliance" {
  name                       = "compliance-trail"
  s3_bucket_name             = aws_s3_bucket.logs.id
  is_multi_region_trail      = true
  enable_log_file_validation = true

  # Log data events for sensitive buckets
  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = [
        "${aws_s3_bucket.phi_data.arn}/",
        "${aws_s3_bucket.cardholder_data.arn}/"
      ]
    }
  }
}

# 2. VPC Flow Logs for network auditing
resource "aws_flow_log" "compliance" {
  vpc_id          = aws_vpc.production.id
  traffic_type    = "ALL"
  log_destination = aws_s3_bucket.logs.arn
  log_destination_type = "s3"
}

# 3. Log bucket with versioning and lock
resource "aws_s3_bucket" "logs" {
  bucket = "compliance-audit-logs"
}

resource "aws_s3_bucket_versioning" "logs" {
  bucket = aws_s3_bucket.logs.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_object_lock_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    default_retention {
      mode = "COMPLIANCE"
      years = 7
    }
  }
}
```

---

## Alerting on Security Events

Logs are only useful if someone is **watching**. Automated alerts ensure critical events get immediate attention.

### Critical Events to Alert On

| Event | Severity | Action |
|-------|----------|--------|
| Root account login | 🔴 Critical | Page security team immediately |
| IAM policy changes | 🟠 High | Notify security team |
| Security group opened to 0.0.0.0/0 | 🟠 High | Notify + auto-remediate |
| CloudTrail disabled | 🔴 Critical | Page security + auto-enable |
| S3 bucket made public | 🔴 Critical | Auto-remediate + notify |
| Console login without MFA | 🟠 High | Notify + require MFA |
| Failed login attempts (>10) | 🟡 Medium | Log + investigate |
| Unusual API calls from new IP | 🟡 Medium | Investigate |

### CloudWatch Alert for Root Account Login

```hcl
# Metric filter to detect root account usage
resource "aws_cloudwatch_log_metric_filter" "root_login" {
  name           = "RootAccountUsage"
  pattern        = <<PATTERN
{
  $.userIdentity.type = "Root" &&
  $.userIdentity.invokedBy NOT EXISTS &&
  $.eventType != "AwsServiceEvent"
}
PATTERN
  log_group_name = aws_cloudwatch_log_group.trail.name

  metric_transformation {
    name      = "RootAccountUsageCount"
    namespace = "SecurityMetrics"
    value     = "1"
  }
}

# Alarm that triggers on any root usage
resource "aws_cloudwatch_metric_alarm" "root_login" {
  alarm_name          = "root-account-usage"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "RootAccountUsageCount"
  namespace           = "SecurityMetrics"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "CRITICAL: Root account was used"

  alarm_actions = [
    aws_sns_topic.security_alerts.arn
  ]
}

# SNS topic for security alerts
resource "aws_sns_topic" "security_alerts" {
  name = "security-critical-alerts"
}
```

### Auto-Remediation Example

```python
# Lambda function to auto-close public S3 buckets
import boto3
import json

s3 = boto3.client("s3")

def handler(event, context):
    # Parse the CloudTrail event from CloudWatch
    detail = event["detail"]
    bucket_name = detail["requestParameters"]["bucketName"]
    user = detail["userIdentity"]["arn"]

    print(f"ALERT: {user} made bucket {bucket_name} public")

    # Remove public access
    s3.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True
        }
    )

    print(f"REMEDIATED: Blocked public access on {bucket_name}")

    # You would also send a notification here
    return {
        "statusCode": 200,
        "body": json.dumps({
            "bucket": bucket_name,
            "action": "public_access_blocked",
            "triggered_by": user
        })
    }
```

---

## Cost of Logging

Logging generates real costs. Understanding the pricing model helps you log what matters without breaking the budget.

### Cost Breakdown

| Component | AWS Pricing (approx.) | Azure Pricing (approx.) |
|-----------|----------------------|------------------------|
| **Log ingestion** | $0.50/GB (CloudWatch) | $2.76/GB (Log Analytics) |
| **Log storage** | $0.03/GB/month (CW) | $0.12/GB/month (LA) |
| **Log queries** | $0.005/GB scanned | Included in ingestion |
| **S3 storage** | $0.023/GB/month | $0.018/GB/month (Blob) |
| **S3 Glacier** | $0.004/GB/month | $0.002/GB/month (Archive) |
| **Athena queries** | $5.00/TB scanned | N/A |

### Cost Optimization Strategies

| Strategy | Savings | How |
|----------|---------|-----|
| **Filter before ingesting** | 40-60% | Only send relevant logs to expensive services |
| **Use tiered storage** | 50-80% | Move old logs to Glacier/Archive |
| **Partition logs by date** | 80-90% | Athena/BigQuery scan less data |
| **Use Parquet format** | 60-80% | Columnar format reduces scan size |
| **Set retention policies** | Ongoing | Auto-delete logs past retention period |
| **Sample high-volume logs** | 50-90% | Log 10% of data events, 100% of management events |

### Example: Reducing CloudWatch Costs

```
Before optimization:
  500 GB/day ingestion × $0.50 = $250/day = $7,500/month

After optimization:
  - Filter out health checks: -200 GB/day
  - Filter debug logs in prod: -150 GB/day
  - Remaining: 150 GB/day × $0.50 = $75/day = $2,250/month

  Savings: $5,250/month (70% reduction!)
```

### CloudWatch Log Subscription Filter

```hcl
# Only send ERROR and WARN logs to CloudWatch
# Send all logs to S3 (cheaper)
resource "aws_cloudwatch_log_subscription_filter" "errors_only" {
  name            = "errors-and-warnings"
  log_group_name  = "/app/web-server"
  filter_pattern  = "?ERROR ?WARN ?CRITICAL ?FATAL"
  destination_arn = aws_kinesis_firehose_delivery_stream.errors.arn
  role_arn        = aws_iam_role.subscription.arn
}
```

---

## Exercises

### Exercise 1: Read a CloudTrail Event

Analyze this CloudTrail event and answer the questions below:

```json
{
  "userIdentity": {
    "type": "AssumedRole",
    "arn": "arn:aws:sts::123456789012:assumed-role/DeveloperRole/bob"
  },
  "eventTime": "2026-05-04T03:15:00Z",
  "eventSource": "ec2.amazonaws.com",
  "eventName": "AuthorizeSecurityGroupIngress",
  "sourceIPAddress": "198.51.100.25",
  "requestParameters": {
    "groupId": "sg-0abc123def456",
    "ipPermissions": {
      "items": [{
        "ipProtocol": "tcp",
        "fromPort": 22,
        "toPort": 22,
        "ipRanges": {
          "items": [{ "cidrIp": "0.0.0.0/0" }]
        }
      }]
    }
  }
}
```

1. Who made this change?
2. What did they do?
3. Is this a security concern? Why?
4. What alert should fire?

<details>
<summary>Solution</summary>

1. **Who**: User `bob` using the `DeveloperRole` (assumed role) from IP `198.51.100.25`
2. **What**: Opened SSH (port 22) on security group `sg-0abc123def456` to the **entire internet** (0.0.0.0/0)
3. **Security concern**: **YES — CRITICAL**. SSH should never be open to 0.0.0.0/0. This allows anyone on the internet to attempt SSH connections. This happened at 3:15 AM, which is unusual.
4. **Alert**: "Security group modified to allow unrestricted access" — High severity, notify security team, and ideally auto-remediate by removing the rule.
</details>

### Exercise 2: Design a Log Retention Policy

Your company must comply with both PCI-DSS and HIPAA. Design a log retention policy that satisfies both.

Specify:
- What types of logs to keep
- How long to keep each type
- What storage tier to use at each stage
- When to delete

<details>
<summary>Solution</summary>

```
Log Type              Hot (0-90d)    Warm (90d-1y)    Cold (1-7y)    Delete
──────────────────────────────────────────────────────────────────────────
CloudTrail (mgmt)     CloudWatch     S3 Standard-IA   Glacier        After 7y
CloudTrail (data)     CloudWatch     S3 Standard-IA   Glacier        After 7y
VPC Flow Logs         CloudWatch     S3 Standard-IA   Glacier        After 7y
App Access Logs       CloudWatch     S3 Standard-IA   Glacier        After 7y
PHI Access Logs       CloudWatch     S3 Standard-IA   Deep Archive   After 7y
Auth/Login Logs       CloudWatch     S3 Standard-IA   Glacier        After 7y
Debug Logs            CloudWatch     —                —              After 30d
Health Check Logs     —              —                —              Don't store
```

**Why 7 years?** SOX requires 7, HIPAA requires 6, PCI-DSS requires 1. Using the **longest requirement** ensures you cover all regulations.

**Object Lock**: Enable S3 Object Lock in COMPLIANCE mode on the log bucket to prevent deletion.
</details>

### Exercise 3: Build an Alert

Write a CloudWatch Logs Insights query to detect potential data exfiltration:
- Find users who have downloaded more than 100 objects from S3 in the last hour
- Show the user, number of downloads, and source IP

<details>
<summary>Solution</summary>

```sql
fields @timestamp, userIdentity.userName, sourceIPAddress, eventName
| filter eventSource = "s3.amazonaws.com"
| filter eventName = "GetObject"
| stats count(*) as downloadCount by
    userIdentity.userName,
    sourceIPAddress
| filter downloadCount > 100
| sort downloadCount desc
```

To create an alert, wrap this in a CloudWatch metric filter:
1. Create a metric filter for S3 GetObject events
2. Set a threshold alarm for >100 events per user per hour
3. Send alert to SNS topic → PagerDuty / Slack / email
</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **CloudTrail / Activity Log / Audit Logs** | Record every API call — your primary audit trail |
| **Management vs. Data Events** | Management = free by default; Data = high volume, extra cost |
| **Centralized Logging** | Aggregate all logs into one account/workspace |
| **Log Analysis** | Athena for S3 logs, CloudWatch Insights for real-time |
| **SIEM** | Correlates events from all sources, detects threats |
| **Retention Policies** | Match the longest compliance requirement (up to 7 years) |
| **Tiered Storage** | Hot → Warm → Cold → Delete to manage costs |
| **Alerting** | Automate responses to critical security events |
| **Cost Management** | Filter, partition, and use Parquet to reduce costs by 70%+ |
| **Immutability** | Use Object Lock to prevent log tampering |

---

## Summary

- **Logging and auditing** are the foundation of cloud security and compliance
- Every cloud provider offers an **audit service** (CloudTrail, Activity Log, Audit Logs) that records API calls
- Understand the difference between **management events** (free) and **data events** (paid, high-volume)
- **Centralize logs** from all accounts and regions into a single, secure location
- Use the right **analysis tool** for the job: real-time queries vs. historical analysis vs. full-text search
- **SIEM platforms** (Sentinel, Splunk, Chronicle) correlate events and detect complex threats
- Set **retention policies** based on the strictest compliance requirement that applies to you
- **Alert on critical events** (root login, public S3, disabled CloudTrail) and auto-remediate where possible
- **Optimize logging costs** through filtering, tiered storage, partitioning, and columnar formats
- Treat your logs as **immutable evidence** — use Object Lock and log file validation
