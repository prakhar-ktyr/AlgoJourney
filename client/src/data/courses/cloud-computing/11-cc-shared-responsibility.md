---
title: "The Shared Responsibility Model"
---

# The Shared Responsibility Model

When you move to the cloud, security doesn't become the cloud provider's job alone. Instead, **security is shared** between you and your cloud provider. This is known as the **Shared Responsibility Model**.

Understanding who is responsible for what is one of the most important things you can learn in cloud computing. Misunderstanding this model is the #1 cause of cloud security breaches.

---

## Why Does Shared Responsibility Exist?

In a traditional data center, your organization owns and secures **everything** — from the physical building to the application code. In the cloud, the provider manages some layers while you manage others.

Think of it like renting an apartment:

- The **landlord** (cloud provider) is responsible for the building's structure, plumbing, and electricity.
- The **tenant** (you) is responsible for locking the doors, not leaving the stove on, and keeping your belongings safe.

If someone breaks in because the building's front door lock was faulty — that's the landlord's fault. If someone breaks in because you left your window open — that's on you.

---

## The Cloud Security Stack

Cloud security can be broken down into layers. Each layer has a responsible party:

```
┌─────────────────────────────────┐
│         DATA                    │  ← You classify, encrypt, back up
├─────────────────────────────────┤
│         APPLICATION             │  ← You write secure code
├─────────────────────────────────┤
│         RUNTIME                 │  ← Depends on service model
├─────────────────────────────────┤
│         OPERATING SYSTEM        │  ← Depends on service model
├─────────────────────────────────┤
│         VIRTUALIZATION          │  ← Provider manages hypervisor
├─────────────────────────────────┤
│         NETWORK                 │  ← Shared (provider infra + your config)
├─────────────────────────────────┤
│         STORAGE                 │  ← Provider hardware, you manage access
├─────────────────────────────────┤
│         PHYSICAL SECURITY       │  ← Always the provider
└─────────────────────────────────┘
```

---

## Responsibility by Service Model

The amount you're responsible for changes depending on whether you use **IaaS**, **PaaS**, or **SaaS**.

### Responsibility Matrix

| Layer               | On-Premises | IaaS          | PaaS          | SaaS          |
|---------------------|-------------|---------------|---------------|---------------|
| **Physical Security** | You         | Provider      | Provider      | Provider      |
| **Network Infra**     | You         | Provider      | Provider      | Provider      |
| **Virtualization**    | You         | Provider      | Provider      | Provider      |
| **Operating System**  | You         | **You**       | Provider      | Provider      |
| **Runtime**           | You         | **You**       | Provider      | Provider      |
| **Application**       | You         | **You**       | **You**       | Provider      |
| **Data**              | You         | **You**       | **You**       | **You**       |
| **Identity & Access** | You         | **You**       | **You**       | **You**       |
| **Client Devices**    | You         | **You**       | **You**       | **You**       |

> **Key Insight:** No matter which model you use, **data** and **identity/access management** are **always your responsibility**.

### What This Means in Practice

**IaaS (e.g., AWS EC2, Azure VMs, GCP Compute Engine):**

```
You are responsible for:
  ✔ Patching the OS
  ✔ Configuring firewalls
  ✔ Installing and updating runtime/middleware
  ✔ Securing the application
  ✔ Encrypting data
  ✔ Managing user access

Provider is responsible for:
  ✔ Physical data center security
  ✔ Hardware maintenance
  ✔ Network infrastructure
  ✔ Hypervisor security
```

**PaaS (e.g., AWS Elastic Beanstalk, Azure App Service, Google App Engine):**

```
You are responsible for:
  ✔ Application code security
  ✔ Data encryption and classification
  ✔ User access management
  ✔ Application-level configurations

Provider is responsible for:
  ✔ Everything in IaaS, PLUS:
  ✔ OS patching and maintenance
  ✔ Runtime updates
  ✔ Middleware management
```

**SaaS (e.g., Microsoft 365, Salesforce, Google Workspace):**

```
You are responsible for:
  ✔ Data you put into the service
  ✔ User accounts and permissions
  ✔ Client device security
  ✔ Compliance with your own policies

Provider is responsible for:
  ✔ Everything else — the full application stack
```

---

## AWS Shared Responsibility Model

AWS uses the phrase **"Security OF the cloud vs. Security IN the cloud"**:

| AWS Responsibility (Security **OF** the Cloud) | Customer Responsibility (Security **IN** the Cloud) |
|------------------------------------------------|-----------------------------------------------------|
| Physical facilities and hardware                | Customer data                                        |
| Global network infrastructure                   | Platform, applications, IAM                          |
| Hypervisor and host OS                          | Operating system (for EC2)                           |
| Managed service infrastructure                  | Network and firewall configuration                   |
| Edge locations and regions                      | Client-side & server-side encryption                 |
| Compliance of infrastructure                    | Network traffic protection                           |

### AWS Example: S3 Bucket

```
AWS secures:
  → The physical disks storing your data
  → The S3 service software
  → The network between S3 and the internet
  → Encryption capabilities (SSE-S3, SSE-KMS)

You must secure:
  → Bucket policies (who can access)
  → Access control lists (ACLs)
  → Enabling encryption
  → Enabling versioning for data protection
  → Enabling access logging
  → Blocking public access when not needed
```

---

## Azure Shared Responsibility Model

Microsoft Azure defines responsibilities similarly:

| Responsibility Area         | SaaS     | PaaS     | IaaS     | On-Prem  |
|-----------------------------|----------|----------|----------|----------|
| Information and data        | Customer | Customer | Customer | Customer |
| Devices (mobile and PCs)    | Customer | Customer | Customer | Customer |
| Accounts and identities     | Customer | Customer | Customer | Customer |
| Identity and directory infra| Shared   | Shared   | Customer | Customer |
| Applications                | Microsoft| Shared   | Customer | Customer |
| Network controls            | Microsoft| Shared   | Customer | Customer |
| Operating system            | Microsoft| Microsoft| Customer | Customer |
| Physical hosts              | Microsoft| Microsoft| Microsoft| Customer |
| Physical network            | Microsoft| Microsoft| Microsoft| Customer |
| Physical datacenter         | Microsoft| Microsoft| Microsoft| Customer |

> **Note:** Azure uses "Shared" for some cells, meaning both parties have responsibilities at that layer.

---

## GCP Shared Responsibility Model

Google Cloud uses the term **"Shared Fate"** instead of Shared Responsibility, emphasizing that Google actively helps customers secure their workloads:

```
Google's approach:
  1. Secure-by-default infrastructure
  2. Security blueprints and best practices
  3. Assured Workloads for compliance
  4. Security Command Center for visibility
  5. BeyondCorp for zero-trust access
```

| GCP Service Type    | Google Manages                     | Customer Manages                |
|---------------------|------------------------------------|---------------------------------|
| Compute Engine (IaaS)| Hardware, network, hypervisor     | OS, apps, data, IAM             |
| App Engine (PaaS)   | Hardware through runtime           | App code, data, IAM             |
| Google Workspace (SaaS)| Full stack                      | Data, users, device policies    |
| GKE (Containers)    | Control plane, node OS (auto-upgrade)| Workloads, pod security, IAM |

---

## Common Misunderstandings

These misconceptions lead to the majority of cloud security incidents:

### Misconception 1: "The Cloud Provider Secures My Data"

**Wrong.** The provider secures the **infrastructure**. Your data is **always** your responsibility.

```
❌ "We're on AWS, so our data is secure."
✅ "AWS secures the infrastructure. We must encrypt our data,
    control access, and implement backups."
```

### Misconception 2: "PaaS/SaaS Means I Don't Need Security"

**Wrong.** You still manage identity, data, and compliance.

```
❌ "We use Salesforce, so we don't need a security team."
✅ "We use Salesforce, but we still need to manage user
    permissions, data classification, and audit logs."
```

### Misconception 3: "The Provider Handles Compliance"

**Wrong.** Providers have compliance certifications for **their** infrastructure. **Your** use of that infrastructure must also be compliant.

```
❌ "AWS is HIPAA-compliant, so our healthcare app is compliant."
✅ "AWS provides HIPAA-eligible services. We must sign a BAA
    and configure our services to meet HIPAA requirements."
```

### Misconception 4: "Default Settings Are Secure Enough"

**Wrong.** Many services launch with permissive defaults for ease of use.

```
❌ "I launched an EC2 instance — it's secure by default."
✅ "I launched an EC2 instance — I need to configure security
    groups, NACLs, and ensure SSH keys are properly managed."
```

### Misconception 5: "Backups Are Automatic"

**Wrong.** While providers offer backup services, **you** must enable and configure them.

```
❌ "My data is in the cloud, so it's automatically backed up."
✅ "I need to enable automated snapshots, configure retention
    policies, and test my restore procedures."
```

---

## Real-World Breach Examples from Misconfiguration

These incidents happened because organizations misunderstood the shared responsibility model:

### Case 1: Capital One Data Breach (2019)

```
What happened:
  - 100 million customer records exposed
  - A misconfigured WAF (Web Application Firewall) on AWS
  - Attacker exploited SSRF vulnerability to access S3 metadata

Root cause:
  - Capital One's misconfiguration, NOT an AWS vulnerability
  - IAM role had overly permissive access to S3
  - Metadata service (IMDSv1) was not restricted

Lesson:
  ✔ Use IMDSv2 (requires session tokens)
  ✔ Apply least-privilege IAM policies
  ✔ Monitor for unusual API calls with CloudTrail
```

### Case 2: Twitch Source Code Leak (2021)

```
What happened:
  - 125 GB of data leaked including source code and payment data
  - Misconfigured server allowed unauthorized access

Root cause:
  - Internal server misconfiguration
  - Insufficient network segmentation

Lesson:
  ✔ Implement network segmentation
  ✔ Regularly audit server configurations
  ✔ Use infrastructure-as-code for consistent configs
```

### Case 3: Exposed Azure Blob Storage (Multiple Incidents)

```
What happened:
  - Multiple organizations left Azure Blob containers public
  - Sensitive documents, databases, and PII exposed

Root cause:
  - Default or misconfigured access policies
  - No monitoring for public exposure

Lesson:
  ✔ Use Azure Policy to enforce private access
  ✔ Enable Microsoft Defender for Storage
  ✔ Regularly scan for publicly exposed resources
```

### Case 4: Uber Data Breach (2016)

```
What happened:
  - 57 million rider/driver records exposed
  - Attackers found AWS credentials in a GitHub repository
  - Used credentials to access S3 bucket with user data

Root cause:
  - Hardcoded credentials in source code
  - No credential rotation or secrets management

Lesson:
  ✔ NEVER store credentials in code repositories
  ✔ Use secrets managers (AWS Secrets Manager, Azure Key Vault)
  ✔ Implement credential rotation policies
  ✔ Scan repositories for exposed secrets
```

---

## Best Practices Per Layer

### Physical Security (Provider Responsibility)

While this is the provider's job, you should **verify** their certifications:

```
✔ Confirm SOC 2 Type II reports
✔ Review ISO 27001 certification
✔ Check physical access controls documentation
✔ Verify environmental controls (fire, flood, power)
✔ Understand geographic data residency
```

### Network Security (Shared)

```yaml
# Example: AWS Security Group (your responsibility)
SecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: "Web server security group"
    SecurityGroupIngress:
      # Only allow HTTPS from the internet
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0
      # SSH only from your office IP
      - IpProtocol: tcp
        FromPort: 22
        ToPort: 22
        CidrIp: 203.0.113.0/24    # Your office CIDR
    # Deny all other inbound traffic (implicit)
```

Best practices:

```
✔ Use private subnets for backend services
✔ Implement network segmentation (VPCs, VNets)
✔ Enable flow logs for monitoring
✔ Use VPN or Direct Connect for hybrid connectivity
✔ Deploy WAF for web applications
✔ Enable DDoS protection
```

### Operating System (Your Responsibility in IaaS)

```bash
# Automated patching with AWS Systems Manager
aws ssm create-patch-baseline \
  --name "ProductionPatchBaseline" \
  --operating-system "AMAZON_LINUX_2" \
  --approval-rules \
    "PatchRules=[{
      PatchFilterGroup={
        PatchFilters=[
          {Key=SEVERITY,Values=[Critical,Important]}
        ]
      },
      ApproveAfterDays=7,
      ComplianceLevel=CRITICAL
    }]"
```

Best practices:

```
✔ Enable automated patching
✔ Use hardened OS images (CIS benchmarks)
✔ Disable unnecessary services and ports
✔ Implement host-based intrusion detection
✔ Use configuration management tools (Ansible, Chef)
```

### Runtime & Middleware (Your Responsibility in IaaS)

```
✔ Keep runtime versions up to date
✔ Use container scanning for vulnerabilities
✔ Implement application-level firewalls
✔ Monitor for CVEs in your dependencies
✔ Use managed runtimes (PaaS) when possible
```

### Application (Your Responsibility in IaaS & PaaS)

```
✔ Follow OWASP Top 10 guidelines
✔ Implement input validation
✔ Use parameterized queries (prevent SQL injection)
✔ Enable HTTPS everywhere
✔ Implement proper error handling (no stack traces in production)
✔ Use static and dynamic code analysis
```

### Data (Always Your Responsibility)

```
✔ Classify data by sensitivity level
✔ Encrypt data at rest AND in transit
✔ Implement data loss prevention (DLP) policies
✔ Set up backup and disaster recovery
✔ Manage encryption keys properly
✔ Implement data retention and deletion policies
```

### Identity & Access (Always Your Responsibility)

```json
// Example: AWS IAM Policy — Least Privilege
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-bucket/uploads/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

Best practices:

```
✔ Implement least-privilege access
✔ Enable multi-factor authentication (MFA)
✔ Use role-based access control (RBAC)
✔ Regularly review and rotate credentials
✔ Monitor and alert on suspicious activity
✔ Use identity federation (SSO)
✔ Never use root/owner accounts for daily operations
```

---

## Shared Responsibility Checklist

Use this checklist to verify your cloud security posture:

```
IDENTITY & ACCESS
  [ ] MFA enabled for all privileged accounts
  [ ] Least-privilege IAM policies in place
  [ ] Regular access reviews scheduled
  [ ] Service accounts have minimal permissions
  [ ] Root/admin account secured and rarely used

NETWORK
  [ ] Security groups/NSGs configured correctly
  [ ] Private subnets used for backend services
  [ ] VPN/private connectivity for hybrid setups
  [ ] Network flow logs enabled
  [ ] WAF deployed for web applications

DATA
  [ ] Encryption at rest enabled
  [ ] Encryption in transit (TLS) enforced
  [ ] Backup policies configured and tested
  [ ] Data classification scheme implemented
  [ ] No publicly accessible storage (unless intended)

COMPUTE
  [ ] OS patching automated
  [ ] Hardened machine images used
  [ ] Vulnerability scanning enabled
  [ ] Container images scanned before deployment
  [ ] Unused resources decommissioned

MONITORING & COMPLIANCE
  [ ] Cloud audit logs enabled (CloudTrail, etc.)
  [ ] Alerts configured for security events
  [ ] Compliance frameworks mapped to controls
  [ ] Regular penetration testing scheduled
  [ ] Incident response plan documented
```

---

## Summary

| Concept | Description |
|---------|-------------|
| **Shared Responsibility** | Security duties split between cloud provider and customer |
| **Provider Responsibility** | Physical security, network infra, hypervisor |
| **Customer Responsibility** | Data, identity, access management (always) |
| **IaaS** | Customer manages OS through data |
| **PaaS** | Customer manages application and data |
| **SaaS** | Customer manages data and user access |
| **Common Mistake** | Assuming the provider handles everything |
| **Best Practice** | Apply least privilege, encrypt data, monitor continuously |

---

## Practice Exercises

**Exercise 1: Classify Responsibilities**

For each task below, determine who is responsible — **Provider**, **Customer**, or **Shared**. Assume an IaaS deployment:

```
1. Replacing a failed hard drive in the data center
2. Patching the Linux kernel on an EC2 instance
3. Configuring a security group to allow port 443
4. Ensuring the hypervisor is not vulnerable to Spectre
5. Encrypting an S3 bucket
6. Monitoring the physical temperature of server rooms
7. Setting up IAM roles for developers
8. Maintaining the global fiber network between regions
```

<details>
<summary>Click to see answers</summary>

```
1. Provider — physical hardware management
2. Customer — OS patching in IaaS is your job
3. Customer — network configuration is your job
4. Provider — hypervisor security is theirs
5. Customer — data encryption is always yours
6. Provider — physical environment management
7. Customer — identity & access is always yours
8. Provider — global infrastructure
```

</details>

**Exercise 2: Incident Analysis**

Read the scenario and identify what went wrong:

```
Scenario:
  A startup deployed their web application on AWS EC2 instances.
  They used the default security group, stored database credentials
  in environment variables on the instance, and never enabled
  CloudTrail. Six months later, they discovered unauthorized
  access to their RDS database.

Questions:
  1. Which shared responsibility failures occurred?
  2. What should they have done differently?
  3. Is AWS at fault? Why or why not?
```

<details>
<summary>Click to see answers</summary>

```
1. Failures:
   - Default security group (too permissive) — Customer failure
   - Credentials in environment variables — Customer failure
   - No CloudTrail logging — Customer failure

2. Should have:
   - Configured restrictive security groups
   - Used AWS Secrets Manager for credentials
   - Enabled CloudTrail for audit logging
   - Implemented least-privilege IAM policies
   - Set up monitoring and alerting

3. AWS is NOT at fault:
   - All failures were in the customer's responsibility zone
   - AWS provides the tools (Secrets Manager, CloudTrail,
     Security Groups) — the customer must use them
```

</details>

**Exercise 3: Design a Security Plan**

Create a shared responsibility matrix for the following scenario:

```
Your company is migrating a healthcare application to Azure.
The app uses:
  - Azure App Service (PaaS) for the web frontend
  - Azure SQL Database (PaaS) for patient records
  - Azure Blob Storage for medical images
  - Azure Active Directory for authentication

Create a matrix showing:
  1. What Azure is responsible for
  2. What your team is responsible for
  3. What HIPAA-specific requirements you must address
```

---

## Further Reading

- AWS Shared Responsibility Model documentation
- Microsoft Azure Shared Responsibility documentation
- Google Cloud Shared Fate documentation
- CIS Benchmarks for cloud platforms
- NIST Cloud Computing Security Reference Architecture (SP 500-299)
