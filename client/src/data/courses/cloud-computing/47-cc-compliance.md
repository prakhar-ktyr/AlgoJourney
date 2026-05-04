---
title: "Compliance and Governance"
---

# Compliance and Governance

In this lesson, you will learn how to **meet regulatory requirements** and **govern your cloud environment** effectively — ensuring your organization stays compliant, secure, and cost-efficient.

Compliance and governance might sound boring, but they are what keep companies from getting massive fines, losing customer trust, and ending up on the front page of the news for all the wrong reasons.

---

## Why Compliance Matters in the Cloud

When you move to the cloud, you don't move your **legal obligations**. You're still responsible for protecting customer data, following industry regulations, and proving you did it right.

### Consequences of Non-Compliance

| Consequence | Example |
|-------------|---------|
| **Financial penalties** | GDPR fines up to €20 million or 4% of global revenue |
| **Legal action** | Lawsuits from affected customers |
| **Loss of business** | Clients require compliance certifications to do business |
| **Reputational damage** | Data breaches make headlines |
| **Operational disruption** | Regulators can shut down non-compliant systems |

### The Shared Responsibility Model for Compliance

Cloud providers handle compliance **of** the cloud (physical security, hardware, global infrastructure). You handle compliance **in** the cloud (your data, access controls, configurations).

```
┌────────────────────────────────────────────────────┐
│                YOUR RESPONSIBILITY                 │
│  Data classification, encryption, access control,  │
│  OS patching, app security, network config,        │
│  compliance validation, audit evidence             │
├────────────────────────────────────────────────────┤
│            CLOUD PROVIDER RESPONSIBILITY           │
│  Physical security, hardware, hypervisor,          │
│  global infrastructure, managed service SLAs       │
└────────────────────────────────────────────────────┘
```

---

## Key Regulations

### GDPR (General Data Protection Regulation)

**Who it affects**: Any organization handling data of EU/EEA residents — regardless of where the company is located.

| Requirement | What It Means |
|-------------|--------------|
| **Lawful basis** | Must have a legal reason to process personal data |
| **Data minimization** | Only collect data you actually need |
| **Right to erasure** | Users can request deletion of their data |
| **Data portability** | Users can export their data |
| **Breach notification** | Must report breaches within 72 hours |
| **Data Protection Officer** | Required for large-scale data processing |
| **Privacy by design** | Build privacy into systems from the start |

**Cloud implications**:
- Know **where** your data is stored (data residency)
- Implement **encryption at rest and in transit**
- Enable **audit logging** for all data access
- Have a **data deletion process** that covers all storage (databases, backups, logs, caches)

### HIPAA (Health Insurance Portability and Accountability Act)

**Who it affects**: Healthcare providers, health plans, and their business associates in the United States.

| Rule | Requirement |
|------|-------------|
| **Privacy Rule** | Controls who can access Protected Health Information (PHI) |
| **Security Rule** | Technical safeguards for electronic PHI (ePHI) |
| **Breach Notification Rule** | Must notify affected individuals within 60 days |
| **Enforcement Rule** | Penalties for violations |

**Cloud implications**:
- Sign a **Business Associate Agreement (BAA)** with your cloud provider
- Only use **HIPAA-eligible services** (not all cloud services qualify)
- **Encrypt** all PHI at rest and in transit
- Implement **access logging** and **audit trails**
- Maintain **minimum necessary** access to PHI

### PCI-DSS (Payment Card Industry Data Security Standard)

**Who it affects**: Any organization that stores, processes, or transmits credit card data.

**The 12 Requirements**:

| # | Requirement | Cloud Example |
|---|------------|---------------|
| 1 | Install and maintain a firewall | Security groups, NACLs, WAF |
| 2 | No vendor-supplied defaults | Change default passwords, disable unused services |
| 3 | Protect stored cardholder data | Encrypt with KMS/Key Vault |
| 4 | Encrypt transmission | TLS 1.2+ for all connections |
| 5 | Protect against malware | Endpoint protection, container scanning |
| 6 | Develop secure systems | Code reviews, vulnerability scanning |
| 7 | Restrict access by business need | IAM roles, least privilege |
| 8 | Identify and authenticate users | MFA, strong passwords |
| 9 | Restrict physical access | Cloud provider responsibility |
| 10 | Track and monitor access | CloudTrail, flow logs, SIEM |
| 11 | Regularly test security | Penetration testing, vulnerability scans |
| 12 | Maintain information security policy | Documented policies and procedures |

### Other Important Regulations

| Regulation | Scope | Key Focus |
|------------|-------|-----------|
| **SOX** (Sarbanes-Oxley) | US public companies | Financial reporting controls, audit trails |
| **FedRAMP** | US federal government | Standardized security for cloud services |
| **SOC 1** | Service organizations | Financial reporting controls |
| **SOC 2** | Service organizations | Security, availability, processing integrity, confidentiality, privacy |
| **SOC 3** | General public | Simplified SOC 2 report for public use |
| **ISO 27001** | International | Information security management system |
| **CCPA/CPRA** | California residents | Consumer privacy rights |

### SOC Reports Compared

```
SOC 1                    SOC 2                    SOC 3
─────                    ─────                    ─────
Financial controls       Security controls        Same as SOC 2
Specific point/period    Specific point/period    General use
Restricted audience      Restricted audience      Public report
For auditors             For customers/partners   For marketing
SSAE 18 / ISAE 3402     AT Section 101           AT Section 101
```

---

## Data Residency and Sovereignty

**Data residency** = Where your data is physically stored.
**Data sovereignty** = Which country's laws govern your data.

### Why It Matters

| Scenario | Regulation | Requirement |
|----------|-----------|-------------|
| EU customer data | GDPR | Data must stay in EU or approved countries |
| German financial data | BaFin | Must be stored in Germany or EU |
| Canadian health data | PIPEDA/PHIPA | Must remain in Canada |
| Russian personal data | Federal Law 242-FZ | Must be stored in Russia |
| Australian government data | IRAP | Must use assessed cloud services |

### Controlling Data Residency in the Cloud

```hcl
# AWS: Restrict resources to EU regions only
# Using Service Control Policy (SCP)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonEURegions",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "eu-west-1",
            "eu-west-2",
            "eu-central-1",
            "eu-north-1"
          ]
        }
      }
    }
  ]
}
```

```yaml
# Azure: Restrict resources to specific locations
# Using Azure Policy
{
  "properties": {
    "displayName": "Allowed locations",
    "policyType": "BuiltIn",
    "parameters": {
      "listOfAllowedLocations": {
        "value": [
          "westeurope",
          "northeurope",
          "germanywestcentral"
        ]
      }
    }
  }
}
```

---

## Cloud Compliance Certifications

Cloud providers invest heavily in compliance certifications so you don't have to build everything from scratch.

### Provider Certifications

| Certification | AWS | Azure | GCP |
|--------------|-----|-------|-----|
| ISO 27001 | ✅ | ✅ | ✅ |
| SOC 1/2/3 | ✅ | ✅ | ✅ |
| PCI DSS | ✅ | ✅ | ✅ |
| HIPAA | ✅ (with BAA) | ✅ (with BAA) | ✅ (with BAA) |
| FedRAMP | ✅ (High) | ✅ (High) | ✅ (High) |
| GDPR | ✅ | ✅ | ✅ |
| CSA STAR | ✅ | ✅ | ✅ |

> **Important**: A provider's certification covers their infrastructure. **Your** configuration and usage must still be compliant — you inherit the foundation, not the compliance itself.

---

## Compliance Tools

### AWS Config

**AWS Config** continuously monitors and records your AWS resource configurations and evaluates them against desired settings.

```python
# Example: AWS Config rule to check if S3 buckets are encrypted
# Using AWS SDK (boto3)

import boto3

config = boto3.client("config")

# Create a managed rule
response = config.put_config_rule(
    ConfigRule={
        "ConfigRuleName": "s3-bucket-server-side-encryption-enabled",
        "Source": {
            "Owner": "AWS",
            "SourceIdentifier": "S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED"
        },
        "Scope": {
            "ComplianceResourceTypes": [
                "AWS::S3::Bucket"
            ]
        }
    }
)
```

**Common AWS Config Rules**:

| Rule | What It Checks |
|------|---------------|
| `s3-bucket-server-side-encryption-enabled` | S3 buckets are encrypted |
| `encrypted-volumes` | EBS volumes are encrypted |
| `rds-instance-public-access-check` | RDS instances are not public |
| `iam-password-policy` | IAM password policy meets requirements |
| `vpc-flow-logs-enabled` | VPC flow logs are turned on |
| `multi-region-cloudtrail-enabled` | CloudTrail is enabled in all regions |

### Azure Policy

**Azure Policy** enforces organizational standards and assesses compliance at scale.

```json
{
  "properties": {
    "displayName": "Require encryption on Storage Accounts",
    "policyType": "Custom",
    "mode": "All",
    "parameters": {},
    "policyRule": {
      "if": {
        "allOf": [
          {
            "field": "type",
            "equals": "Microsoft.Storage/storageAccounts"
          },
          {
            "field": "Microsoft.Storage/storageAccounts/encryption.services.blob.enabled",
            "notEquals": true
          }
        ]
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

**Azure Policy Effects**:

| Effect | Behavior |
|--------|----------|
| **Deny** | Prevents the resource from being created |
| **Audit** | Logs a warning but allows creation |
| **Append** | Adds fields to the resource during creation |
| **DeployIfNotExists** | Deploys a related resource if it doesn't exist |
| **Modify** | Adds, updates, or removes tags/properties |
| **Disabled** | Rule is not enforced |

### GCP Organization Policy

```yaml
# Restrict resource locations to EU
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - in:europe-west1-locations
    - in:europe-west3-locations
    - in:europe-north1-locations
```

### Compliance Tools Comparison

| Feature | AWS Config | Azure Policy | GCP Org Policy |
|---------|-----------|-------------|----------------|
| **Scope** | Account/Organization | Subscription/Management Group | Organization/Folder/Project |
| **Enforcement** | Detect + Remediate | Prevent + Detect | Prevent + Detect |
| **Custom rules** | Lambda functions | Policy definitions | Custom constraints |
| **Remediation** | SSM Automation | Remediation tasks | N/A (prevent only) |
| **Cost** | Per rule evaluation | Free | Free |

---

## Governance Frameworks

Governance is the **structure** that ensures your cloud environment stays organized, secure, and cost-effective as it grows.

### Landing Zones

A **landing zone** is a pre-configured, secure, multi-account cloud environment that follows best practices.

```
┌─────────────────────────────────────────────────────┐
│                  MANAGEMENT ACCOUNT                 │
│         (Billing, Organization, SSO)                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │  Security   │  │  Shared     │  │  Logging   │  │
│  │  Account    │  │  Services   │  │  Account   │  │
│  │             │  │  Account    │  │            │  │
│  │  - GuardDuty│  │  - DNS      │  │  - CloudTrail│ │
│  │  - Sec Hub  │  │  - VPN      │  │  - Config  │  │
│  │  - IAM      │  │  - Transit  │  │  - Flow Logs│ │
│  └─────────────┘  │    Gateway  │  └────────────┘  │
│                    └─────────────┘                   │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           WORKLOAD ACCOUNTS                  │    │
│  │  ┌─────┐  ┌─────────┐  ┌──────────┐        │    │
│  │  │ Dev │  │ Staging │  │   Prod   │        │    │
│  │  └─────┘  └─────────┘  └──────────┘        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Landing Zone Services

| Provider | Service | Features |
|----------|---------|----------|
| **AWS** | Control Tower | Automated account setup, guardrails, SSO |
| **Azure** | Azure Landing Zones (CAF) | Management groups, policies, blueprints |
| **GCP** | Cloud Foundation Toolkit | Organization, folders, projects, IAM |

### Guardrails

**Guardrails** are rules that prevent users from making non-compliant configurations. They come in two types:

| Type | Behavior | Example |
|------|----------|---------|
| **Preventive** | Blocks the action | "Cannot create public S3 buckets" |
| **Detective** | Alerts after the fact | "S3 bucket was made public — alert sent" |

### AWS Control Tower Guardrails

```
Preventive Guardrails (SCPs):
├── Disallow changes to CloudTrail configuration
├── Disallow deletion of VPC flow logs
├── Disallow public access to S3 buckets
├── Disallow creation of IAM users without MFA
└── Disallow use of restricted regions

Detective Guardrails (Config Rules):
├── Detect whether MFA is enabled for root
├── Detect whether encryption is enabled for EBS
├── Detect whether public access is enabled for RDS
├── Detect whether CloudTrail is enabled
└── Detect whether VPC flow logs are enabled
```

---

## Tagging Strategies

**Tags** are key-value pairs attached to cloud resources. They are essential for cost tracking, compliance, and automation.

### Recommended Tag Schema

| Tag Key | Purpose | Example Values |
|---------|---------|----------------|
| `Environment` | Identify the environment | `dev`, `staging`, `prod` |
| `Project` | Track by project | `web-app`, `data-pipeline` |
| `Owner` | Accountability | `team-backend`, `jane.doe@company.com` |
| `CostCenter` | Financial tracking | `CC-1234`, `engineering` |
| `Compliance` | Regulatory requirements | `pci`, `hipaa`, `gdpr` |
| `DataClassification` | Data sensitivity | `public`, `internal`, `confidential`, `restricted` |
| `ManagedBy` | How it was created | `terraform`, `manual`, `cloudformation` |
| `ExpiryDate` | Temporary resources | `2026-12-31` |

### Enforcing Tags with AWS

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RequireTags",
      "Effect": "Deny",
      "Action": [
        "ec2:RunInstances",
        "ec2:CreateVolume",
        "rds:CreateDBInstance"
      ],
      "Resource": "*",
      "Condition": {
        "Null": {
          "aws:RequestTag/Environment": "true",
          "aws:RequestTag/Owner": "true",
          "aws:RequestTag/CostCenter": "true"
        }
      }
    }
  ]
}
```

### Enforcing Tags with Azure Policy

```json
{
  "properties": {
    "displayName": "Require Environment tag",
    "policyRule": {
      "if": {
        "field": "[concat('tags[', 'Environment', ']')]",
        "exists": "false"
      },
      "then": {
        "effect": "deny"
      }
    }
  }
}
```

---

## Budget Controls

Cloud costs can spiral out of control without proper governance. Budget controls help you stay within limits.

### Budget Alerting

| Provider | Service | Features |
|----------|---------|----------|
| **AWS** | AWS Budgets | Cost, usage, and reservation budgets with alerts |
| **Azure** | Cost Management + Billing | Budget alerts, cost analysis, recommendations |
| **GCP** | Cloud Billing Budgets | Budget alerts, programmatic notifications |

### AWS Budget Example (Terraform)

```hcl
resource "aws_budgets_budget" "monthly" {
  name         = "monthly-budget"
  budget_type  = "COST"
  limit_amount = "5000"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator = "GREATER_THAN"
    threshold           = 80
    threshold_type      = "PERCENTAGE"
    notification_type   = "ACTUAL"
    subscriber_email_addresses = [
      "finance@company.com",
      "engineering-lead@company.com"
    ]
  }

  notification {
    comparison_operator = "GREATER_THAN"
    threshold           = 100
    threshold_type      = "PERCENTAGE"
    notification_type   = "FORECASTED"
    subscriber_email_addresses = [
      "cto@company.com"
    ]
  }
}
```

---

## Service Control Policies (SCPs)

**SCPs** are organization-level policies that set the **maximum permissions** for all accounts in an AWS Organization. They act as guardrails, even overriding individual IAM policies.

### How SCPs Work

```
AWS Organization
    │
    ├── Root (SCP: FullAWSAccess)
    │
    ├── Production OU
    │   └── SCP: DenyDeleteCloudTrail
    │   └── SCP: DenyPublicS3
    │   └── SCP: RestrictRegions
    │   │
    │   ├── Account: prod-web
    │   ├── Account: prod-api
    │   └── Account: prod-data
    │
    └── Development OU
        └── SCP: RestrictExpensiveServices
        │
        ├── Account: dev-team-a
        └── Account: dev-team-b
```

### Example SCP: Deny Disabling CloudTrail

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyCloudTrailChanges",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail",
        "cloudtrail:UpdateTrail"
      ],
      "Resource": "*"
    }
  ]
}
```

### Example SCP: Deny Expensive Services in Dev

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyExpensiveServices",
      "Effect": "Deny",
      "Action": [
        "redshift:*",
        "sagemaker:*",
        "es:*",
        "emr:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Audit Trails

An **audit trail** is a chronological record of all activities in your cloud environment. It answers: **Who did what, when, and from where?**

### What to Audit

| Category | Examples |
|----------|---------|
| **Identity** | Login attempts, MFA changes, role assumptions |
| **Infrastructure** | Instance launches, security group changes, VPC modifications |
| **Data** | S3 object access, database queries, encryption key usage |
| **Configuration** | Policy changes, tag modifications, parameter updates |
| **Billing** | Budget changes, reserved instance purchases |

### Audit Trail Services

| Provider | Service | What It Logs |
|----------|---------|-------------|
| **AWS** | CloudTrail | API calls across all AWS services |
| **Azure** | Activity Log | Resource management operations |
| **GCP** | Cloud Audit Logs | Admin Activity, Data Access, System Events |

---

## Exercises

### Exercise 1: Regulation Mapping

Your company is building a healthcare application for EU customers that accepts credit card payments. Which regulations apply?

Map each regulation to the specific data it governs.

<details>
<summary>Solution</summary>

| Regulation | Applies Because | Data Governed |
|------------|----------------|---------------|
| **GDPR** | EU customer personal data | Names, emails, addresses, any PII |
| **HIPAA** | Healthcare data | Medical records, diagnoses, treatment info (PHI) |
| **PCI-DSS** | Credit card payments | Card numbers, CVVs, transaction data |

Additional considerations:
- You need a **BAA** with your cloud provider for HIPAA
- **Data residency** must keep EU personal data in approved regions (GDPR)
- Credit card data must be **encrypted** and access **logged** (PCI-DSS)
- You may need a **Data Protection Officer** (GDPR)
</details>

### Exercise 2: Design a Tagging Strategy

Your organization has three teams (Frontend, Backend, Data) working on two projects (WebApp, Analytics) across three environments (Dev, Staging, Prod).

Design a tagging strategy that enables:
1. Cost allocation by team and project
2. Environment identification
3. Compliance classification
4. Resource ownership

<details>
<summary>Solution</summary>

```
Required Tags:
  Environment:        dev | staging | prod
  Project:            webapp | analytics
  Team:               frontend | backend | data
  CostCenter:         CC-FE-001 | CC-BE-001 | CC-DATA-001
  Owner:              team-lead-email@company.com
  DataClassification: public | internal | confidential
  Compliance:         none | gdpr | hipaa | pci
  ManagedBy:          terraform | manual | cdk

Optional Tags:
  ExpiryDate:         2026-12-31
  Ticket:             JIRA-1234

Example for a production database:
  Environment = prod
  Project = webapp
  Team = backend
  CostCenter = CC-BE-001
  Owner = backend-lead@company.com
  DataClassification = confidential
  Compliance = gdpr,pci
  ManagedBy = terraform
```
</details>

### Exercise 3: Write a Service Control Policy

Write an SCP that:
1. Denies creating any resources outside of `us-east-1` and `eu-west-1`
2. Denies disabling CloudTrail
3. Allows everything else

<details>
<summary>Solution</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonApprovedRegions",
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "us-east-1",
            "eu-west-1"
          ]
        },
        "ArnNotLike": {
          "aws:PrincipalARN": "arn:aws:iam::*:role/OrganizationAdmin"
        }
      }
    },
    {
      "Sid": "DenyCloudTrailChanges",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail"
      ],
      "Resource": "*"
    }
  ]
}
```

Note: The SCP includes an exception for the OrganizationAdmin role, which may need to operate in global services that aren't region-specific (like IAM, CloudFront, Route 53).
</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **Shared Responsibility** | Provider secures the cloud; you secure what's in it |
| **GDPR** | EU data privacy — fines up to 4% of global revenue |
| **HIPAA** | US healthcare — requires BAA with cloud provider |
| **PCI-DSS** | Payment cards — 12 requirements for cardholder data |
| **Data Residency** | Know where your data physically lives |
| **Compliance Tools** | AWS Config, Azure Policy, GCP Org Policy |
| **Landing Zones** | Pre-configured multi-account environments |
| **Guardrails** | Preventive (block) and Detective (alert) |
| **Tagging** | Essential for cost, compliance, and governance |
| **SCPs** | Maximum permissions boundary for entire accounts |
| **Audit Trails** | Who did what, when, and from where |

---

## Summary

- **Compliance** is not optional — regulations like GDPR, HIPAA, and PCI-DSS carry severe penalties
- The **shared responsibility model** means you still own compliance for your configurations and data
- **Data residency and sovereignty** require you to know and control where data is stored
- Cloud providers offer **compliance certifications** you can inherit — but your usage must still comply
- **AWS Config**, **Azure Policy**, and **GCP Organization Policy** automate compliance checking
- **Landing zones** provide secure, pre-configured multi-account environments
- **Guardrails** (preventive and detective) stop non-compliant actions before they cause harm
- **Tagging strategies** enable cost tracking, compliance mapping, and resource accountability
- **Service Control Policies** set maximum permission boundaries across entire organizations
- **Audit trails** provide evidence of compliance and help detect unauthorized activities
- Start with compliance requirements **first**, then design your cloud architecture around them
