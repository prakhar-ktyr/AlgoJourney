---
title: "Identity and Access Management"
---

# Identity and Access Management (IAM)

In this lesson, you will learn how cloud providers control **who** can access resources and **what** they can do with them. Identity and Access Management (IAM) is the security backbone of every cloud environment.

---

## What Is IAM?

**Identity and Access Management (IAM)** is a framework of policies, technologies, and services that manages digital identities and controls access to resources.

Think of IAM like a building security system:

| Concept | Building Analogy | Cloud Equivalent |
|---------|-----------------|------------------|
| **Identity** | Your employee badge | User account, service account |
| **Authentication** | Swiping your badge at the door | Proving who you are (password, MFA) |
| **Authorization** | Which floors/rooms your badge opens | What resources you can access |
| **Audit** | Security camera logs | CloudTrail, activity logs |

---

## Authentication vs Authorization

These two terms are often confused, but they are fundamentally different:

### Authentication (AuthN)

**Authentication** answers: _"Who are you?"_

```
User → Provides credentials → System verifies identity → Authenticated ✓
```

Common authentication methods:

- **Username + Password** — the most basic form
- **Multi-Factor Authentication (MFA)** — adds a second proof of identity
- **Certificates** — digital certificates for machines/services
- **Tokens** — temporary credentials (OAuth, JWT)
- **Biometrics** — fingerprint, facial recognition

### Authorization (AuthZ)

**Authorization** answers: _"What are you allowed to do?"_

```
Authenticated User → Requests action → System checks permissions → Allowed ✓ or Denied ✗
```

Authorization models include:

| Model | Description | Example |
|-------|-------------|---------|
| **RBAC** | Role-Based Access Control | "Admins can delete resources" |
| **ABAC** | Attribute-Based Access Control | "Users in US can access US data" |
| **ACL** | Access Control List | "User A can read File X" |
| **PBAC** | Policy-Based Access Control | JSON policy documents |

> **Key Point:** Authentication always comes before authorization. You must prove who you are before the system decides what you can do.

---

## Core IAM Concepts

Before diving into specific cloud providers, let's understand the universal building blocks:

### Users

A **user** represents a single person or application that interacts with cloud resources.

```
Types of Users:
├── Human Users (employees, contractors)
│   ├── Console access (web UI)
│   └── Programmatic access (CLI, SDK)
└── Machine Users (applications, services)
    ├── Service accounts
    └── Managed identities
```

### Groups

A **group** is a collection of users that share the same permissions.

```
Engineering Group
├── Alice (Developer)
├── Bob (Developer)
└── Carol (Developer)
→ All inherit: ReadWrite access to dev resources
```

**Why use groups?**

- Easier to manage permissions at scale
- Assign permissions once, apply to many users
- Remove a user from a group to revoke access instantly

### Roles

A **role** is a set of permissions that can be **assumed** by users, services, or applications temporarily.

```
Role: DatabaseAdmin
├── Permissions: Full access to RDS, DynamoDB
├── Trust: Can be assumed by users in DevOps group
└── Duration: 1-hour session
```

**Key difference from groups:** Roles provide _temporary_ credentials; groups provide _permanent_ membership.

### Policies

A **policy** is a document that defines permissions — what actions are allowed or denied on which resources.

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

---

## AWS IAM Deep Dive

AWS IAM is one of the most mature and feature-rich identity systems in the cloud.

### AWS IAM Architecture

```
AWS Account (Root User)
├── IAM Users
│   ├── Console password
│   └── Access keys (Access Key ID + Secret Access Key)
├── IAM Groups
│   └── Attached policies
├── IAM Roles
│   ├── Trust policy (who can assume)
│   └── Permission policy (what they can do)
└── IAM Policies
    ├── AWS Managed
    ├── Customer Managed
    └── Inline
```

### AWS IAM Policy Types

| Type | Description | Use Case |
|------|-------------|----------|
| **AWS Managed** | Pre-built by AWS, read-only | Quick setup, common use cases |
| **Customer Managed** | Created by you, reusable | Custom permissions for your org |
| **Inline** | Embedded directly in a user/group/role | One-off, tightly coupled permissions |

### AWS IAM Policy Structure

Every IAM policy is a JSON document with this structure:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "192.168.1.0/24"
        }
      }
    }
  ]
}
```

**Policy elements explained:**

| Element | Required | Description |
|---------|----------|-------------|
| `Version` | Yes | Always use `"2012-10-17"` |
| `Statement` | Yes | Array of permission rules |
| `Sid` | No | Human-readable statement ID |
| `Effect` | Yes | `"Allow"` or `"Deny"` |
| `Action` | Yes | API actions (e.g., `s3:GetObject`) |
| `Resource` | Yes | ARN of the target resource |
| `Condition` | No | Extra conditions (IP, time, MFA, etc.) |

> **Important:** An explicit `Deny` always overrides an `Allow`. This is called the **explicit deny rule**.

### Policy Evaluation Logic

```
Request comes in
    │
    ▼
Is there an explicit Deny? ──Yes──► DENIED
    │ No
    ▼
Is there an explicit Allow? ──Yes──► ALLOWED
    │ No
    ▼
DENIED (implicit deny — default)
```

### AWS IAM Roles

Roles are essential for secure, temporary access. There are several role types:

#### Service Roles

Allow AWS services to act on your behalf:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Example:** An EC2 instance assumes a role to read from S3, so you never store access keys on the instance.

#### Cross-Account Roles

Allow users in one AWS account to access resources in another:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:root"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Federation Roles

Allow external identity providers (corporate AD, Google, Facebook) to grant temporary AWS access:

```
External IdP (Okta, Active Directory)
    │
    ▼ SAML/OIDC assertion
AWS STS (Security Token Service)
    │
    ▼ Temporary credentials
AWS Resources (S3, EC2, etc.)
```

### Multi-Factor Authentication (MFA)

MFA adds a second layer of authentication beyond passwords:

| MFA Type | Description | Security Level |
|----------|-------------|----------------|
| **Virtual MFA** | App-based (Google Authenticator, Authy) | Good |
| **Hardware MFA** | Physical token (YubiKey) | Better |
| **SMS MFA** | Text message code | Acceptable |
| **FIDO2** | Passkey / security key | Best |

**Enforcing MFA in a policy:**

```json
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": {
    "BoolIfExists": {
      "aws:MultiFactorAuthPresent": "false"
    }
  }
}
```

### Access Keys

Access keys provide programmatic access to AWS:

```
Access Key ID:     AKIAIOSFODNN7EXAMPLE
Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Access key best practices:**

- Never embed access keys in source code
- Rotate keys regularly (every 90 days)
- Use IAM roles instead of long-term access keys
- Delete unused access keys
- Use AWS Secrets Manager for applications

---

## Azure Entra ID (formerly Azure AD)

Microsoft's cloud identity service — used across Azure, Microsoft 365, and third-party apps.

### Azure Entra ID vs AWS IAM

| Feature | AWS IAM | Azure Entra ID |
|---------|---------|----------------|
| **Scope** | Single AWS account | Entire organization (tenant) |
| **Users** | IAM users | Entra ID users |
| **Groups** | IAM groups | Security groups, M365 groups |
| **Roles** | IAM roles | Azure RBAC roles |
| **Machine Identity** | IAM roles for services | Service principals, managed identities |
| **Federation** | SAML/OIDC via STS | Built-in (SAML, OIDC, WS-Fed) |

### Key Concepts

#### Users and Groups

```
Azure Entra ID Tenant (your-company.onmicrosoft.com)
├── Users
│   ├── Cloud-only users (created in Entra ID)
│   └── Synced users (from on-prem Active Directory)
├── Security Groups
│   ├── Assigned (manually add members)
│   └── Dynamic (auto-membership based on attributes)
└── Microsoft 365 Groups
    └── Collaboration (shared mailbox, Teams, SharePoint)
```

#### Service Principals

A **service principal** is the identity an application uses to access Azure resources:

```
Application Registration (global definition)
    │
    └── Service Principal (per-tenant instance)
            ├── Client ID
            ├── Client Secret or Certificate
            └── Assigned Azure RBAC roles
```

#### Managed Identities

**Managed identities** eliminate the need to manage credentials for Azure services:

| Type | Description | Use Case |
|------|-------------|----------|
| **System-assigned** | Tied to a single resource, auto-deleted | VM accessing Key Vault |
| **User-assigned** | Independent, can be shared across resources | Multiple VMs accessing same storage |

```
Azure VM (with managed identity)
    │
    ▼ No credentials needed!
Azure Key Vault, Storage, SQL
```

### Conditional Access Policies

Azure's powerful context-aware access control:

```
IF (user is in Marketing group)
AND (signing in from outside corporate network)
AND (device is not compliant)
THEN → Require MFA + block download
```

**Common conditional access signals:**

- User or group membership
- IP location / named locations
- Device platform and compliance state
- Application being accessed
- Real-time risk detection (Identity Protection)
- Client application type

---

## GCP IAM

Google Cloud's IAM system uses a resource hierarchy model.

### GCP Resource Hierarchy

```
Organization (your-company.com)
├── Folder (Engineering)
│   ├── Project (web-app-prod)
│   │   ├── Compute Engine instances
│   │   ├── Cloud Storage buckets
│   │   └── BigQuery datasets
│   └── Project (web-app-dev)
└── Folder (Marketing)
    └── Project (analytics)
```

> **Key Concept:** IAM policies are **inherited** down the hierarchy. A policy set at the organization level applies to all folders and projects beneath it.

### GCP IAM Members

| Member Type | Format | Example |
|-------------|--------|---------|
| Google Account | `user:email` | `user:alice@example.com` |
| Service Account | `serviceAccount:email` | `serviceAccount:my-sa@project.iam.gserviceaccount.com` |
| Google Group | `group:email` | `group:devs@example.com` |
| Domain | `domain:domain` | `domain:example.com` |
| All authenticated | `allAuthenticatedUsers` | Any Google account |
| Everyone | `allUsers` | Public (use with extreme caution!) |

### GCP Role Types

| Type | Description | Example |
|------|-------------|---------|
| **Basic** | Broad, legacy roles | `roles/owner`, `roles/editor`, `roles/viewer` |
| **Predefined** | Granular, service-specific | `roles/storage.objectViewer` |
| **Custom** | User-defined, pick specific permissions | `mycompany.customStorageRole` |

> **Best Practice:** Avoid basic roles (`Owner`, `Editor`, `Viewer`) in production — they grant far too many permissions. Use predefined or custom roles instead.

### GCP Service Accounts

Service accounts in GCP are both **identities** and **resources**:

```
Service Account: my-app@my-project.iam.gserviceaccount.com
├── As Identity: Can access Cloud Storage, BigQuery
├── As Resource: Other users can impersonate it
└── Keys: JSON key file (avoid!) or Workload Identity
```

**Service account key management:**

```bash
# Create a service account (preferred: no key, use Workload Identity)
gcloud iam service-accounts create my-sa \
    --display-name="My Service Account"

# Grant a role
gcloud projects add-iam-policy-binding my-project \
    --member="serviceAccount:my-sa@my-project.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"
```

---

## Role-Based Access Control (RBAC)

RBAC is the most common authorization model across all cloud providers.

### How RBAC Works

```
User ──assigned──► Role ──contains──► Permissions ──applied to──► Resources
```

### RBAC Example Across Providers

| Role | AWS | Azure | GCP |
|------|-----|-------|-----|
| Full admin | `AdministratorAccess` | `Owner` | `roles/owner` |
| Read-only | `ReadOnlyAccess` | `Reader` | `roles/viewer` |
| Billing | `Billing` | `Billing Reader` | `roles/billing.viewer` |
| Network admin | `NetworkAdministrator` | `Network Contributor` | `roles/compute.networkAdmin` |

### Principle of Least Privilege

> **Always grant the minimum permissions necessary to perform a task.**

```
❌ Bad:  Grant s3:* on * (full S3 access to everything)
✅ Good: Grant s3:GetObject on arn:aws:s3:::my-bucket/reports/*
```

---

## Federated Identity

Federation allows users to authenticate with an **external identity provider** (IdP) and access cloud resources without creating separate cloud accounts.

### Federation Protocols

| Protocol | Full Name | Use Case |
|----------|-----------|----------|
| **SAML 2.0** | Security Assertion Markup Language | Enterprise SSO (Okta, ADFS) |
| **OIDC** | OpenID Connect | Modern apps, mobile, web |
| **WS-Fed** | WS-Federation | Legacy Microsoft environments |
| **OAuth 2.0** | Open Authorization | API authorization (not authentication) |

### SAML Federation Flow

```
1. User visits AWS Console
2. Redirected to Corporate IdP (Okta)
3. User authenticates with corporate credentials
4. IdP sends SAML assertion to AWS STS
5. STS returns temporary credentials
6. User accesses AWS Console with temporary session
```

### Single Sign-On (SSO)

SSO allows users to authenticate once and access multiple applications:

```
User logs in to Corporate IdP
    │
    ├──► AWS Console ✓
    ├──► Azure Portal ✓
    ├──► GCP Console ✓
    ├──► Salesforce ✓
    └──► Slack ✓
```

**Cloud SSO services:**

| Provider | SSO Service |
|----------|-------------|
| AWS | IAM Identity Center (formerly AWS SSO) |
| Azure | Entra ID (built-in SSO) |
| GCP | Cloud Identity |

---

## IAM Best Practices

### The IAM Security Checklist

| # | Practice | Why |
|---|----------|-----|
| 1 | **Enable MFA for all users** | Prevents credential-based attacks |
| 2 | **Use roles, not long-term keys** | Temporary credentials reduce blast radius |
| 3 | **Follow least privilege** | Minimize what each identity can do |
| 4 | **Use groups for permissions** | Easier to manage than individual policies |
| 5 | **Rotate credentials regularly** | Limits exposure from leaked keys |
| 6 | **Monitor and audit access** | Detect suspicious activity early |
| 7 | **Remove unused users/roles** | Reduce attack surface |
| 8 | **Use service-specific roles** | Avoid broad `Admin` or `Editor` roles |
| 9 | **Implement conditional access** | Context-aware security decisions |
| 10 | **Separate environments** | Different accounts/projects for dev/prod |

### Common IAM Mistakes

```
❌ Using the root/owner account for daily tasks
❌ Sharing credentials between team members
❌ Granting wildcard permissions (Action: "*", Resource: "*")
❌ Hardcoding access keys in application code
❌ Not revoking access when employees leave
❌ Using the same service account for all applications
❌ Ignoring IAM audit logs
❌ Not testing policies before applying to production
```

---

## Exercises

### Exercise 1: Policy Analysis

Read the following AWS IAM policy and answer the questions below:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEC2Describe",
      "Effect": "Allow",
      "Action": "ec2:Describe*",
      "Resource": "*"
    },
    {
      "Sid": "AllowS3ReadBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::reports-bucket",
        "arn:aws:s3:::reports-bucket/*"
      ]
    },
    {
      "Sid": "DenyS3Delete",
      "Effect": "Deny",
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::reports-bucket/*"
    }
  ]
}
```

**Questions:**

1. Can this user list all EC2 instances? Why?
2. Can this user upload a file to `reports-bucket`? Why?
3. Can this user delete a file from `reports-bucket`? Why?
4. Can this user read from a bucket called `logs-bucket`? Why?

### Exercise 2: Design an IAM Strategy

Your company has these teams:

- **Developers** — need read/write access to dev resources, read-only to production
- **DevOps** — need full access to infrastructure in all environments
- **Data Analysts** — need read-only access to BigQuery/Redshift/analytics databases
- **Managers** — need billing access and read-only dashboards

Design an IAM structure with:

1. Groups and their members
2. Roles for each group
3. Key policies for each role
4. Any federation or SSO considerations

### Exercise 3: Spot the Security Issues

Find all the security problems in this scenario:

```
Company Setup:
- All developers share one AWS access key
- Root account has no MFA enabled
- A single "Admin" role is used by all teams
- Service account keys are stored in a Git repository
- No CloudTrail logging is enabled
- Former employee accounts are still active
- All resources are in one AWS account (dev + prod)
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **IAM** | Controls who can access what in the cloud |
| **Authentication** | Proving your identity (who you are) |
| **Authorization** | Determining your permissions (what you can do) |
| **Least Privilege** | Grant only the minimum permissions needed |
| **MFA** | Always enable multi-factor authentication |
| **Roles > Keys** | Prefer temporary role-based access over long-term keys |
| **Federation** | Use corporate IdP for SSO across cloud providers |
| **Audit** | Monitor and log all access activity |
| **Groups** | Manage permissions through groups, not individuals |
| **Conditional Access** | Add context-aware rules (location, device, risk) |

---

In the next lesson, you will learn about **Encryption in the Cloud** — how to protect data at rest and in transit using cloud-native encryption and key management services.
