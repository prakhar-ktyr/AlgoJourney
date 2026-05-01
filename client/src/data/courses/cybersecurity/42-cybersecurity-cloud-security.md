---
title: Cloud Security Fundamentals
---

# Cloud Security Fundamentals

Cloud computing introduces unique security challenges. Understanding who is responsible for what, how misconfigurations happen, and which tools are available is essential for any security practitioner.

---

## The Shared Responsibility Model

In cloud computing, security is a **shared responsibility** between the cloud provider and the customer. The split depends on the service model.

| Layer | IaaS (EC2, VMs) | PaaS (App Engine, RDS) | SaaS (Office 365, Gmail) |
|---|---|---|---|
| Data | Customer | Customer | Customer |
| Applications | Customer | Customer | Provider |
| Runtime | Customer | Provider | Provider |
| OS | Customer | Provider | Provider |
| Virtualization | Provider | Provider | Provider |
| Network | Provider | Provider | Provider |
| Physical | Provider | Provider | Provider |

### Key Principle

> The cloud provider secures the infrastructure **of** the cloud. The customer secures what they put **in** the cloud.

### Provider-Specific Models

| Provider | Documentation |
|---|---|
| AWS | Shared Responsibility Model |
| Azure | Shared Responsibility in the Cloud |
| GCP | Shared Responsibilities and Shared Fate |

---

## Common Cloud Misconfigurations

Misconfigurations are the #1 cause of cloud breaches. They often result from defaults being too permissive.

| Misconfiguration | Risk | Real-World Impact |
|---|---|---|
| Public S3 buckets | Data exposure | Capital One breach (2019) |
| Open security groups (0.0.0.0/0) | Unauthorized access | Thousands of exposed databases |
| Disabled logging | No audit trail | Undetected lateral movement |
| Overly permissive IAM roles | Privilege escalation | Full account takeover |
| Unencrypted storage | Data theft | Compliance violations |
| Default credentials | Easy compromise | Cryptomining on exposed instances |

### Example: Dangerously Open Security Group

```json
{
  "IpPermissions": [
    {
      "IpProtocol": "-1",
      "IpRanges": [
        {
          "CidrIp": "0.0.0.0/0",
          "Description": "DANGER: All traffic from anywhere"
        }
      ]
    }
  ]
}
```

### Secure Alternative

```json
{
  "IpPermissions": [
    {
      "IpProtocol": "tcp",
      "FromPort": 443,
      "ToPort": 443,
      "IpRanges": [
        {
          "CidrIp": "10.0.0.0/16",
          "Description": "HTTPS from internal VPC only"
        }
      ]
    }
  ]
}
```

---

## Identity and Access Management (IAM) in Cloud

IAM is the foundation of cloud security. It controls who can do what to which resources.

### Core Concepts

| Concept | Description |
|---|---|
| Principal | Entity that can take actions (user, role, service) |
| Policy | JSON document defining permissions |
| Role | Set of permissions assumable by principals |
| Least privilege | Grant minimum permissions needed |
| MFA | Multi-factor authentication for sensitive actions |

### AWS IAM Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
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

### IAM Best Practices

1. Never use root/owner accounts for daily tasks
2. Enable MFA on all human accounts
3. Use roles instead of long-lived access keys
4. Apply least privilege — start with zero permissions and add as needed
5. Regularly audit and rotate credentials
6. Use service accounts with scoped permissions for applications

---

## Security Groups and Network Controls

Security groups act as virtual firewalls at the instance level in cloud environments.

| Control | Scope | Stateful? | Direction |
|---|---|---|---|
| Security Group (AWS) | Instance | Yes | Inbound + Outbound |
| NACL (AWS) | Subnet | No | Inbound + Outbound |
| NSG (Azure) | NIC/Subnet | Yes | Inbound + Outbound |
| Firewall Rules (GCP) | VPC/Instance | Yes | Ingress + Egress |

### Designing Network Segmentation

```
┌─────────────────────────────────────────────┐
│                    VPC                        │
│  ┌──────────────┐    ┌──────────────────┐   │
│  │ Public Subnet │    │ Private Subnet    │   │
│  │  (Web Tier)   │───▶│  (App + DB Tier)  │   │
│  │  SG: 443 in   │    │  SG: 8080 from    │   │
│  │  from 0.0.0.0 │    │  web-sg only      │   │
│  └──────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Cloud-Native Security Tools

Each major provider offers built-in security services:

| Category | AWS | Azure | GCP |
|---|---|---|---|
| Threat detection | GuardDuty | Defender for Cloud | Security Command Center |
| Config auditing | Config / Security Hub | Policy | Security Health Analytics |
| Secret management | Secrets Manager | Key Vault | Secret Manager |
| WAF | AWS WAF | Azure WAF | Cloud Armor |
| DDoS protection | Shield | DDoS Protection | Cloud Armor |
| Encryption | KMS | Key Vault | Cloud KMS |
| Logging | CloudTrail | Activity Log | Cloud Audit Logs |

### Enabling AWS CloudTrail (Audit Logging)

```bash
aws cloudtrail create-trail \
  --name security-audit-trail \
  --s3-bucket-name my-audit-logs \
  --is-multi-region-trail \
  --enable-log-file-validation

aws cloudtrail start-logging --name security-audit-trail
```

---

## Cloud Security Posture Management (CSPM)

CSPM tools continuously monitor cloud environments for misconfigurations and compliance violations.

| Tool | Type | Key Feature |
|---|---|---|
| AWS Security Hub | Native | Aggregates findings from multiple services |
| Azure Defender | Native | Real-time threat protection |
| Prowler | Open source | AWS/Azure/GCP security auditing |
| ScoutSuite | Open source | Multi-cloud security auditing |
| Prisma Cloud | Commercial | Full CSPM + workload protection |

---

## Key Takeaways

- The shared responsibility model defines the boundary between provider and customer security obligations
- Cloud misconfigurations are the leading cause of breaches — automate detection with CSPM tools
- IAM is the most critical control — enforce least privilege and MFA everywhere
- Security groups should follow default-deny with specific allow rules
- Each cloud provider offers native security tools — use them as your first line of defense
- Enable audit logging (CloudTrail, Activity Log, Audit Logs) on day one

---

[Next: Container Security](43-cybersecurity-container-security)
