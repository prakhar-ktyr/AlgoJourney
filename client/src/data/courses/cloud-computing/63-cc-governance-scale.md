---
title: "Cloud Governance at Scale"
---

# Cloud Governance at Scale

As organizations grow from a single cloud account to hundreds or thousands, **governance** becomes essential. Without it, teams overspend, security gaps emerge, compliance fails, and cloud environments become unmanageable.

Cloud governance is the framework of policies, processes, and tools that ensure cloud resources are used securely, efficiently, and in compliance with organizational and regulatory requirements — **at scale**.

---

## Why Governance Matters

Consider what happens without governance in a large organization:

| Problem | Impact |
|---------|--------|
| No account structure | Resources mixed across teams, impossible to track ownership |
| No cost controls | Shadow IT, runaway spending, no accountability |
| No security baselines | Publicly exposed databases, unencrypted storage |
| No compliance enforcement | Audit failures, regulatory fines |
| No standardization | Every team builds differently, duplicated effort |
| No change management | Breaking changes in production, no rollback plan |

> **Key Insight:** Governance is not about slowing teams down — it's about enabling teams to move fast **safely**. Good governance is invisible to developers; bad governance is a bottleneck.

---

## Multi-Account Strategy

The foundation of cloud governance is **account separation**. A single account for everything is a governance nightmare.

### Why Multiple Accounts?

| Benefit | Description |
|---------|-------------|
| **Blast radius** | Issues in one account don't affect others |
| **Security boundary** | IAM policies scoped per account |
| **Cost allocation** | Clear billing per team/project/environment |
| **Compliance isolation** | Regulated workloads in dedicated accounts |
| **Service limits** | Each account gets its own quotas |
| **Autonomy** | Teams manage their own accounts within guardrails |

### Account Structure Patterns

```
Common Multi-Account Structure:

Organization Root
├── Management Account (billing, org policies)
├── Security OU
│   ├── Log Archive Account (centralized logs)
│   ├── Security Tooling Account (GuardDuty, Security Hub)
│   └── Audit Account
├── Infrastructure OU
│   ├── Networking Account (Transit Gateway, DNS)
│   ├── Shared Services Account (CI/CD, artifact repos)
│   └── Identity Account (SSO, directory)
├── Workloads OU
│   ├── Production OU
│   │   ├── Team-A Prod Account
│   │   ├── Team-B Prod Account
│   │   └── ...
│   ├── Staging OU
│   │   ├── Team-A Staging Account
│   │   └── ...
│   └── Development OU
│       ├── Team-A Dev Account
│       └── ...
└── Sandbox OU
    ├── Developer-1 Sandbox
    └── Developer-2 Sandbox
```

### Provider-Specific Hierarchy

| Concept | AWS | Azure | GCP |
|---------|-----|-------|-----|
| **Top-level** | Organization | Tenant (Azure AD) | Organization |
| **Grouping** | Organizational Units (OUs) | Management Groups | Folders |
| **Workload boundary** | Account | Subscription | Project |
| **Policy attachment** | SCP on OU/Account | Azure Policy on MG/Sub | Org Policy on Folder/Project |
| **Billing** | Consolidated billing | EA / MCA | Billing Account |

---

## AWS Organizations

AWS Organizations lets you centrally manage multiple AWS accounts.

### Key Features

| Feature | Description |
|---------|-------------|
| **Consolidated Billing** | Single bill for all accounts, volume discounts |
| **Service Control Policies** | Guardrails that restrict what accounts can do |
| **Tag Policies** | Enforce consistent resource tagging |
| **Backup Policies** | Centralized backup rules |
| **AI Services Opt-out** | Control data usage by AI services |
| **Account Factory** | Programmatic account creation |

### Service Control Policies (SCPs)

SCPs are **preventive guardrails** — they define the maximum permissions an account can have. Even if an IAM policy grants access, an SCP can deny it.

```json
// SCP: Deny access to all regions except us-east-1 and eu-west-1
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "sts:*",
        "organizations:*",
        "support:*",
        "budgets:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": [
            "us-east-1",
            "eu-west-1"
          ]
        }
      }
    }
  ]
}
```

```json
// SCP: Prevent disabling CloudTrail
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ProtectCloudTrail",
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

> **Important:** SCPs don't grant permissions — they only restrict. You still need IAM policies to grant access. Think of SCPs as "permission ceilings."

---

## Azure Management Groups

Azure uses a hierarchy: Tenant → Management Groups → Subscriptions → Resource Groups → Resources.

```
Tenant Root Group
├── Platform MG
│   ├── Identity MG
│   │   └── Identity Subscription
│   ├── Management MG
│   │   └── Management Subscription
│   └── Connectivity MG
│       └── Connectivity Subscription
├── Landing Zones MG
│   ├── Corp MG (internal apps)
│   │   ├── Team-A Sub (Prod)
│   │   └── Team-B Sub (Prod)
│   └── Online MG (internet-facing)
│       ├── Web App Sub
│       └── API Sub
├── Sandbox MG
│   └── Dev Sandbox Subs
└── Decommissioned MG
    └── Old project subs (locked)
```

### Azure Policy

Azure Policy evaluates resources for compliance and can **deny**, **audit**, or **remediate** non-compliant resources.

```json
// Azure Policy: Require tags on all resources
{
  "mode": "Indexed",
  "policyRule": {
    "if": {
      "anyOf": [
        {
          "field": "tags['CostCenter']",
          "exists": "false"
        },
        {
          "field": "tags['Owner']",
          "exists": "false"
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  },
  "parameters": {}
}
```

```json
// Azure Policy: Only allow specific VM sizes
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Compute/virtualMachines"
        },
        {
          "not": {
            "field": "Microsoft.Compute/virtualMachines/sku.name",
            "in": [
              "Standard_D2s_v3",
              "Standard_D4s_v3",
              "Standard_D8s_v3"
            ]
          }
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

### Policy Effects

| Effect | Behavior |
|--------|----------|
| **Deny** | Block non-compliant resource creation/modification |
| **Audit** | Allow but flag as non-compliant |
| **Append** | Add fields to resources (e.g., add tags) |
| **Modify** | Change properties on existing resources |
| **DeployIfNotExists** | Deploy a related resource if missing |
| **AuditIfNotExists** | Audit if a related resource is missing |
| **Disabled** | Policy exists but is not enforced |

---

## GCP Organization Hierarchy

GCP uses: Organization → Folders → Projects → Resources.

```
Organization (example.com)
├── Folder: Production
│   ├── Project: prod-web-app
│   ├── Project: prod-api
│   └── Project: prod-database
├── Folder: Staging
│   ├── Project: staging-web-app
│   └── Project: staging-api
├── Folder: Development
│   ├── Project: dev-team-alpha
│   └── Project: dev-team-beta
├── Folder: Shared Services
│   ├── Project: shared-networking
│   └── Project: shared-cicd
└── Folder: Sandbox
    └── Project: sandbox-experiments
```

### GCP Organization Policy

```yaml
# Organization Policy: Restrict VM external IPs
# Applied at the Production folder level
constraint: constraints/compute.vmExternalIpAccess
listPolicy:
  deniedValues:
    - "ALL"  # No VMs in production can have external IPs

---

# Organization Policy: Restrict resource locations
constraint: constraints/gcp.resourceLocations
listPolicy:
  allowedValues:
    - "in:us-locations"
    - "in:eu-locations"
```

---

## Landing Zones

A **landing zone** is a pre-configured, secure, multi-account cloud environment that follows best practices. It's the "foundation" teams build on.

### What a Landing Zone Provides

| Component | Purpose |
|-----------|---------|
| Account/subscription structure | Organized hierarchy |
| Identity and access | SSO, federated identity, baseline roles |
| Networking | Hub-and-spoke or mesh, DNS, firewall |
| Security baseline | Logging, monitoring, encryption defaults |
| Guardrails | Preventive and detective controls |
| Compliance | Regulatory frameworks pre-configured |
| Cost management | Budgets, alerts, tagging policies |

### Landing Zone Solutions

| Provider | Solution | Description |
|----------|----------|-------------|
| **AWS** | Control Tower | Automated landing zone with Account Factory, guardrails |
| **Azure** | Azure Landing Zones (ALZ) | Reference architecture with Bicep/Terraform modules |
| **GCP** | Cloud Foundation Toolkit | Terraform modules for GCP best practices |

### AWS Control Tower

```
AWS Control Tower provides:

1. Account Factory
   → Automated account creation with pre-configured settings
   → Customizable account templates (blueprints)

2. Guardrails (Controls)
   → Mandatory: Always on (e.g., disallow public S3 buckets)
   → Strongly Recommended: Best practices
   → Elective: Optional, for specific compliance needs

3. Dashboard
   → Compliance status across all accounts
   → Non-compliant resources flagged

4. Landing Zone
   → Audit account (read-only cross-account access)
   → Log archive account (centralized CloudTrail, Config)
   → Organization structure with pre-built OUs
```

---

## Guardrails: Preventive vs Detective

Guardrails enforce governance automatically. They come in two types:

| Type | When It Acts | How It Works | Example |
|------|-------------|-------------|---------|
| **Preventive** | Before a violation | Blocks the action | SCP denying public S3 buckets |
| **Detective** | After a violation | Alerts on the violation | AWS Config rule flagging unencrypted EBS volumes |

### Preventive Guardrail Examples

```
┌─────────────────────────────────────────────────┐
│           Preventive Guardrails                  │
├─────────────────────────────────────────────────┤
│ ✗ Cannot create public S3 buckets               │
│ ✗ Cannot disable CloudTrail logging             │
│ ✗ Cannot launch resources in unapproved regions │
│ ✗ Cannot create IAM users (SSO only)            │
│ ✗ Cannot delete VPC flow logs                   │
│ ✗ Cannot use unrestricted security groups        │
│ ✗ Cannot disable encryption on RDS/EBS          │
└─────────────────────────────────────────────────┘
```

### Detective Guardrail Examples

```
┌─────────────────────────────────────────────────┐
│           Detective Guardrails                   │
├─────────────────────────────────────────────────┤
│ ⚠ Alert: S3 bucket without versioning           │
│ ⚠ Alert: EC2 instance without required tags     │
│ ⚠ Alert: IAM access key older than 90 days      │
│ ⚠ Alert: Security group with 0.0.0.0/0 ingress │
│ ⚠ Alert: Root account used for console login    │
│ ⚠ Alert: Unencrypted EBS volume detected        │
└─────────────────────────────────────────────────┘
```

### Implementation Comparison

| Mechanism | Type | Provider | Scope |
|-----------|------|----------|-------|
| **SCP** | Preventive | AWS | OU / Account |
| **Azure Policy (Deny)** | Preventive | Azure | Management Group / Subscription |
| **GCP Org Policy** | Preventive | GCP | Organization / Folder / Project |
| **AWS Config Rules** | Detective | AWS | Account / Organization |
| **Azure Policy (Audit)** | Detective | Azure | Management Group / Subscription |
| **GCP Security Command Center** | Detective | GCP | Organization |

---

## Cost Governance

Controlling cloud spending across hundreds of accounts requires structure and automation.

### Cost Governance Framework

```
┌──────────────────────────────────────────────────┐
│              Cost Governance Layers               │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. Visibility    → Tagging, cost allocation     │
│  2. Accountability → Chargebacks, team budgets   │
│  3. Optimization  → Right-sizing, reservations   │
│  4. Control       → Budgets, quotas, approvals   │
│  5. Automation    → Anomaly detection, auto-stop │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Tagging Strategy

Tags are the **foundation** of cost governance. Without them, you cannot attribute costs.

| Tag Key | Purpose | Example Values |
|---------|---------|---------------|
| `CostCenter` | Financial attribution | `CC-1234`, `CC-5678` |
| `Owner` | Responsible person/team | `team-platform`, `jane.doe` |
| `Environment` | Deployment stage | `production`, `staging`, `development` |
| `Project` | Business project | `project-phoenix`, `internal-tools` |
| `Application` | Application name | `web-frontend`, `payment-api` |
| `ManagedBy` | Provisioning method | `terraform`, `manual`, `cloudformation` |
| `DataClassification` | Data sensitivity | `public`, `internal`, `confidential` |

### Budget and Alerts

```python
# AWS Budgets — create a monthly budget with alerts
import boto3

budgets = boto3.client("budgets")

budgets.create_budget(
    AccountId="123456789012",
    Budget={
        "BudgetName": "TeamA-Monthly-Budget",
        "BudgetLimit": {
            "Amount": "5000",
            "Unit": "USD",
        },
        "BudgetType": "COST",
        "TimeUnit": "MONTHLY",
        "CostFilters": {
            "TagKeyValue": ["user:CostCenter$CC-1234"],
        },
    },
    NotificationsWithSubscribers=[
        {
            "Notification": {
                "NotificationType": "ACTUAL",
                "ComparisonOperator": "GREATER_THAN",
                "Threshold": 80.0,
                "ThresholdType": "PERCENTAGE",
            },
            "Subscribers": [
                {
                    "SubscriptionType": "EMAIL",
                    "Address": "team-a-leads@example.com",
                },
            ],
        },
        {
            "Notification": {
                "NotificationType": "FORECASTED",
                "ComparisonOperator": "GREATER_THAN",
                "Threshold": 100.0,
                "ThresholdType": "PERCENTAGE",
            },
            "Subscribers": [
                {
                    "SubscriptionType": "SNS",
                    "Address": "arn:aws:sns:us-east-1:123456789:budget-alerts",
                },
            ],
        },
    ],
)
```

### Anomaly Detection

All major providers offer cost anomaly detection:

| Provider | Service | Features |
|----------|---------|----------|
| **AWS** | Cost Anomaly Detection | ML-based, monitors by service/account/tag |
| **Azure** | Cost Management Alerts | Budget, anomaly, and scheduled alerts |
| **GCP** | Budget Alerts + Recommender | Budget thresholds + optimization recommendations |

### Quota Management

Quotas prevent runaway resource consumption:

```json
// Azure Policy: Limit number of cores per subscription
{
  "mode": "All",
  "policyRule": {
    "if": {
      "allOf": [
        {
          "field": "type",
          "equals": "Microsoft.Compute/virtualMachines"
        },
        {
          "field": "Microsoft.Compute/virtualMachines/sku.name",
          "in": [
            "Standard_D64s_v3",
            "Standard_E64s_v3",
            "Standard_M128s"
          ]
        }
      ]
    },
    "then": {
      "effect": "deny"
    }
  }
}
```

---

## Identity Governance

Managing who has access to what across hundreds of accounts:

### Federated Identity

```
Corporate Identity Provider (IdP)
        │
        ▼
  ┌─────────────────┐
  │   SSO Service    │ ← AWS IAM Identity Center
  │                  │   Azure AD / Entra ID
  │                  │   Google Cloud Identity
  └────────┬────────┘
           │
    ┌──────┼──────────────┐
    ▼      ▼              ▼
 Account  Account      Account
    A        B             C
    │        │             │
    ▼        ▼             ▼
 Role:    Role:         Role:
 Admin    ReadOnly      Developer
```

### Permission Sets / Roles

| Principle | Description |
|-----------|-------------|
| **Least Privilege** | Grant only the permissions needed for the task |
| **Time-bound Access** | Temporary elevated access (JIT) |
| **Separation of Duties** | No single person can deploy and approve |
| **Regular Access Reviews** | Quarterly review of who has what access |
| **Break-glass Accounts** | Emergency access with full audit trail |

### Just-in-Time (JIT) Access

```
Normal State:
  Developer has: ReadOnly access to Production

JIT Elevation:
  1. Developer requests Admin access (with reason)
  2. Approval workflow triggers (manager/security approval)
  3. Temporary Admin access granted (4 hours max)
  4. All actions fully audited
  5. Access auto-revokes after time expires
```

---

## Data Governance

| Aspect | Description | Tools |
|--------|-------------|-------|
| **Classification** | Label data by sensitivity | AWS Macie, Azure Purview, GCP DLP |
| **Residency** | Ensure data stays in approved regions | Org policies, resource location constraints |
| **Encryption** | Encrypt at rest and in transit | KMS, customer-managed keys |
| **Retention** | Define how long data is kept | Lifecycle policies, legal holds |
| **Access Control** | Who can read/write data | IAM, bucket policies, ACLs |
| **Lineage** | Track where data came from and went | Data catalogs, lineage tools |
| **Quality** | Monitor data accuracy and completeness | Glue Data Quality, Great Expectations |

### Data Classification Levels

```
┌─────────────────────────────────────────────────────┐
│  Level 4: RESTRICTED    │ PII, financial, health    │
│  (Highest)              │ Encrypted, strict access  │
├─────────────────────────┼───────────────────────────┤
│  Level 3: CONFIDENTIAL  │ Internal business data    │
│                         │ Team-restricted access    │
├─────────────────────────┼───────────────────────────┤
│  Level 2: INTERNAL      │ General internal info     │
│                         │ All employees can access  │
├─────────────────────────┼───────────────────────────┤
│  Level 1: PUBLIC        │ Marketing, docs, website  │
│  (Lowest)               │ Anyone can access         │
└─────────────────────────┴───────────────────────────┘
```

---

## Change Management

Controlling how changes are made to cloud infrastructure:

### Infrastructure as Code (IaC) Governance

| Practice | Description |
|----------|-------------|
| **IaC-only changes** | No manual console changes in production |
| **Code review** | All infrastructure changes reviewed via PR |
| **Drift detection** | Alert when actual state differs from code |
| **Policy as Code** | Validate IaC before deployment (OPA, Sentinel, Checkov) |
| **Blast radius limits** | Limit resources per Terraform state file |
| **Approval gates** | Required approvals for production deployments |

### Policy as Code Example (OPA/Rego)

```rego
# Open Policy Agent — deny public S3 buckets in Terraform plans

package terraform.s3

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    resource.change.after.acl == "public-read"
    msg := sprintf(
        "S3 bucket '%s' cannot have public-read ACL",
        [resource.address]
    )
}

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket_public_access_block"
    resource.change.after.block_public_acls == false
    msg := sprintf(
        "S3 bucket '%s' must block public ACLs",
        [resource.address]
    )
}
```

### Change Approval Workflow

```
Developer
    │
    ▼
Create PR (Terraform/CloudFormation/Bicep)
    │
    ▼
Automated Checks
├── Terraform plan
├── Policy validation (OPA/Sentinel)
├── Cost estimation (Infracost)
├── Security scan (Checkov/tfsec)
└── Compliance check
    │
    ▼
Code Review (peer)
    │
    ▼
Approval Gate (platform team / security)
    │
    ▼
Automated Deployment
    │
    ▼
Post-deployment Validation
```

---

## Cloud Center of Excellence (CCoE)

A CCoE is a cross-functional team that drives cloud adoption and governance across the organization.

### CCoE Responsibilities

| Area | Activities |
|------|-----------|
| **Architecture** | Define reference architectures, approve patterns |
| **Security** | Set security baselines, review controls |
| **Cost Management** | Monitor spending, drive optimization |
| **Automation** | Build self-service platforms, IaC templates |
| **Training** | Upskill teams, create internal documentation |
| **Compliance** | Map regulatory requirements to cloud controls |
| **Standards** | Define tagging, naming conventions, approved services |

### CCoE Operating Model

```
┌──────────────────────────────────────────────────┐
│              Cloud Center of Excellence           │
├──────────────────────────────────────────────────┤
│                                                  │
│  Core Team:                                      │
│  ├── Cloud Architect (1-2)                       │
│  ├── Security Engineer (1-2)                     │
│  ├── FinOps Analyst (1)                          │
│  ├── Platform Engineer (2-3)                     │
│  └── DevOps Engineer (1-2)                       │
│                                                  │
│  Outputs:                                        │
│  ├── Landing Zone (maintained)                   │
│  ├── Approved Service Catalog                    │
│  ├── Self-Service Portal                         │
│  ├── Guardrails and Policies                     │
│  ├── Cost Reports and Optimization               │
│  └── Training and Documentation                 │
│                                                  │
│  Consumers:                                      │
│  ├── Application Teams (use the platform)        │
│  ├── Leadership (cost/compliance reports)        │
│  └── Security Team (policy enforcement)          │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Governance Automation

Manual governance doesn't scale. Automate everything:

### Auto-Remediation

```python
# AWS Lambda: Auto-remediate public S3 buckets
import boto3

s3 = boto3.client("s3")

def handler(event, context):
    """Triggered by AWS Config rule when a public bucket is detected."""
    bucket_name = event["detail"]["resourceId"]

    # Block all public access
    s3.put_public_access_block(
        Bucket=bucket_name,
        PublicAccessBlockConfiguration={
            "BlockPublicAcls": True,
            "IgnorePublicAcls": True,
            "BlockPublicPolicy": True,
            "RestrictPublicBuckets": True,
        },
    )

    print(f"Remediated: blocked public access on {bucket_name}")
    return {"status": "remediated", "bucket": bucket_name}
```

### Compliance Dashboard

| Metric | Description | Target |
|--------|-------------|--------|
| **Guardrail compliance** | % of accounts with all guardrails passing | 100% |
| **Tag compliance** | % of resources with required tags | >95% |
| **Encryption compliance** | % of storage encrypted at rest | 100% |
| **Cost variance** | Actual vs. budgeted spend | <10% |
| **Drift detection** | % of resources matching IaC | >98% |
| **Access review completion** | % of access reviews completed on time | 100% |
| **Patch compliance** | % of instances with current patches | >95% |

---

## Exercises

### Exercise 1: Account Structure Design

Your company has:
- 4 business units (BU-A, BU-B, BU-C, BU-D)
- Each BU needs dev, staging, and production environments
- A shared platform team manages networking and CI/CD
- Security requires centralized logging and monitoring
- Developers need sandbox accounts for experimentation

Design the AWS Organization structure (OUs and accounts).

<details>
<summary>View Answer</summary>

```
Organization Root
├── Security OU
│   ├── Log Archive Account
│   ├── Security Tooling Account
│   └── Audit Account
├── Infrastructure OU
│   ├── Network Hub Account (Transit Gateway, DNS)
│   ├── Shared Services Account (CI/CD, artifacts)
│   └── Identity Account (IAM Identity Center)
├── Workloads OU
│   ├── BU-A OU
│   │   ├── BU-A Dev Account
│   │   ├── BU-A Staging Account
│   │   └── BU-A Prod Account
│   ├── BU-B OU
│   │   ├── BU-B Dev Account
│   │   ├── BU-B Staging Account
│   │   └── BU-B Prod Account
│   ├── BU-C OU (same pattern)
│   └── BU-D OU (same pattern)
├── Sandbox OU
│   └── Individual developer sandboxes (auto-expire)
└── Suspended OU
    └── Decommissioned accounts

Total: ~20 accounts
SCPs applied: Security OU (strictest), Prod OU (no console changes),
              Sandbox OU (budget limits, no prod services)
```

</details>

### Exercise 2: Policy Design

Write an AWS SCP that:
1. Prevents anyone from creating IAM users (force SSO usage)
2. Allows IAM role creation (needed for service roles)
3. Exempts the Identity account from this restriction

<details>
<summary>View Answer</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyIAMUserCreation",
      "Effect": "Deny",
      "Action": [
        "iam:CreateUser",
        "iam:CreateLoginProfile",
        "iam:CreateAccessKey"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:PrincipalOrgPaths": [
            "o-org123/r-root/ou-infra/ou-identity/"
          ]
        }
      }
    }
  ]
}
```

This SCP:
- Denies IAM user creation, login profiles, and access keys
- Does NOT restrict IAM role creation (not in the Action list)
- Exempts the Identity OU path (where the Identity account lives)

</details>

### Exercise 3: Governance Maturity Assessment

Rate your (hypothetical) organization on each governance dimension (1=None, 5=Fully Automated):

| Dimension | 1 (None) | 2 (Ad-hoc) | 3 (Defined) | 4 (Managed) | 5 (Optimized) |
|-----------|----------|-----------|------------|------------|---------------|
| Account Structure | | | | | |
| Identity & Access | | | | | |
| Security Baselines | | | | | |
| Cost Management | | | | | |
| Compliance | | | | | |
| Change Management | | | | | |
| Data Governance | | | | | |

What's the first dimension you would improve? Why?

<details>
<summary>View Answer</summary>

**Priority order for improvement:**

1. **Account Structure** (Level 1→3) — Everything else depends on this foundation. Without proper account separation, security, cost, and compliance are impossible to enforce.

2. **Identity & Access** (Level 1→3) — Federated SSO eliminates password sprawl and enables centralized access control. This is a security prerequisite.

3. **Security Baselines** (Level 1→3) — Preventive guardrails (SCPs, policies) prevent the most common security incidents.

4. **Cost Management** (Level 2→4) — Tagging + budgets + alerts provide visibility before spending gets out of control.

5. **Everything else** — Build incrementally once the foundation is solid.

**Key principle:** Don't try to reach Level 5 everywhere at once. Get critical dimensions to Level 3, then iterate.

</details>

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Multi-Account Strategy** | Separate accounts for isolation, security, and cost tracking |
| **Landing Zones** | Pre-built, secure foundations (Control Tower, ALZ, CFT) |
| **Guardrails** | Preventive (block actions) + Detective (alert on violations) |
| **Policy Engines** | SCPs, Azure Policy, GCP Org Policy enforce rules at scale |
| **Cost Governance** | Tagging → Budgets → Alerts → Anomaly Detection → Optimization |
| **Identity Governance** | Federated SSO, least privilege, JIT access, regular reviews |
| **Data Governance** | Classification, residency, encryption, retention, lineage |
| **Change Management** | IaC-only, code review, policy-as-code, approval gates |
| **CCoE** | Cross-functional team driving cloud adoption and standards |
| **Automation** | Auto-remediation, compliance dashboards, self-service platforms |

---

## Summary: Governance Checklist

Use this checklist when setting up governance for a new organization:

```
□ Multi-account structure designed and implemented
□ Landing zone deployed (Control Tower / ALZ / CFT)
□ SSO configured — no IAM users in workload accounts
□ Preventive guardrails active (SCPs / Azure Policy / Org Policy)
□ Detective controls running (Config Rules / Security Hub)
□ Tagging policy enforced — all resources tagged
□ Budgets and alerts configured per team/project
□ Cost anomaly detection enabled
□ Centralized logging (CloudTrail, VPC Flow Logs, DNS logs)
□ Encryption enforced at rest and in transit
□ IaC mandatory for production changes
□ Policy-as-code in CI/CD pipeline
□ Access reviews scheduled quarterly
□ Break-glass procedure documented and tested
□ CCoE established with clear ownership
```
