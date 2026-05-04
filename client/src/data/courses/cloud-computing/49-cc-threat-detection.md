---
title: "Threat Detection and Incident Response"
---

# Threat Detection and Incident Response

In this lesson, you will learn how to **detect threats** in cloud environments and **respond to security incidents** effectively using cloud-native tools and proven frameworks.

Cloud environments face unique security challenges — the attack surface is vast, resources are dynamic, and traditional perimeter-based defenses are insufficient. Modern cloud security relies on **automated threat detection**, **real-time monitoring**, and **structured incident response**.

---

## Why Cloud Threat Detection Matters

Traditional on-premises security tools often fail in the cloud because:

| Challenge | On-Premises | Cloud |
|-----------|------------|-------|
| **Perimeter** | Well-defined network boundary | No clear perimeter |
| **Scale** | Fixed infrastructure | Dynamic, auto-scaling resources |
| **Visibility** | Full control of hardware | Shared responsibility model |
| **Speed of change** | Slow, planned deployments | Rapid, continuous deployments |
| **Logs** | Centralized by default | Distributed across services |
| **Identity** | Mostly internal users | APIs, service accounts, federated users |

Cloud threat detection must be:

- **Automated** — manual monitoring cannot keep up with cloud scale
- **Continuous** — threats can emerge at any moment
- **Context-aware** — understanding cloud-native behaviors and patterns
- **Integrated** — working across multiple cloud services and accounts

---

## Common Cloud Threats

Before diving into detection tools, let's understand what we're looking for:

### 1. Unauthorized Access

```
Threat: Attackers gain access to cloud resources using stolen or leaked credentials.

Examples:
- Exposed access keys in public GitHub repositories
- Brute-force attacks on cloud console login
- Session hijacking through cross-site scripting (XSS)

Indicators:
- Login from unusual geographic locations
- API calls from unrecognized IP addresses
- Access outside normal business hours
```

### 2. Cryptocurrency Mining (Cryptojacking)

```
Threat: Attackers use your cloud resources to mine cryptocurrency, running up costs.

Examples:
- Launching large GPU instances for mining
- Deploying mining containers in Kubernetes clusters
- Exploiting serverless functions for mining

Indicators:
- Unusual spike in compute usage and costs
- High CPU utilization on instances with no legitimate workload
- Network connections to known mining pools
```

### 3. Data Exfiltration

```
Threat: Sensitive data is copied out of your cloud environment.

Examples:
- Downloading entire S3 buckets to external locations
- Database snapshots shared with unauthorized accounts
- DNS tunneling to leak data

Indicators:
- Large outbound data transfers
- S3 bucket policy changes making data public
- Unusual database query patterns
```

### 4. Compromised Credentials

```
Threat: Legitimate credentials are stolen and used by attackers.

Examples:
- Phishing attacks targeting cloud administrators
- Malware stealing credentials from developer machines
- Credential stuffing attacks using leaked password databases

Indicators:
- Multiple failed login attempts followed by a success
- API calls that don't match the user's normal behavior
- Privilege escalation attempts
```

### 5. Insider Threats

```
Threat: Authorized users misuse their access, intentionally or accidentally.

Examples:
- Employee downloading sensitive data before leaving the company
- Accidental exposure of resources through misconfiguration
- Sharing credentials with unauthorized parties

Indicators:
- Access to resources outside the user's job function
- Bulk data downloads
- Policy changes that weaken security controls
```

---

## Cloud Threat Detection Services

Each major cloud provider offers native threat detection tools:

### AWS GuardDuty

**AWS GuardDuty** is a managed threat detection service that continuously monitors your AWS accounts and workloads.

```
How GuardDuty Works:
┌─────────────────────────────────────────────┐
│              AWS GuardDuty                  │
│                                             │
│  Data Sources:                              │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │ CloudTrail  │  │ VPC Flow Logs        │  │
│  │ Events      │  │                      │  │
│  └──────┬──────┘  └──────────┬───────────┘  │
│         │                    │              │
│  ┌──────┴──────┐  ┌─────────┴────────────┐  │
│  │ DNS Logs    │  │ S3 Data Events       │  │
│  │             │  │                      │  │
│  └──────┬──────┘  └──────────┬───────────┘  │
│         │                    │              │
│         ▼                    ▼              │
│  ┌─────────────────────────────────────┐    │
│  │  Machine Learning + Threat Intel   │    │
│  │  Analysis Engine                    │    │
│  └──────────────┬──────────────────────┘    │
│                 ▼                           │
│  ┌─────────────────────────────────────┐    │
│  │  Security Findings (Prioritized)   │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Key finding types in GuardDuty:**

| Finding Type | Description | Severity |
|-------------|-------------|----------|
| `UnauthorizedAccess:IAMUser/MaliciousIPCaller` | API called from a known malicious IP | High |
| `CryptoCurrency:EC2/BitcoinTool.B!DNS` | EC2 instance querying a Bitcoin mining domain | High |
| `Exfiltration:S3/MaliciousIPCaller` | S3 API called from a known malicious IP | High |
| `Recon:EC2/PortProbeUnprotectedPort` | Unprotected port being probed | Low |
| `Persistence:IAMUser/AnomalousBehavior` | Unusual API calls to maintain access | Medium |

**Enabling GuardDuty with AWS CLI:**

```bash
# Enable GuardDuty in your account
aws guardduty create-detector --enable

# List findings
aws guardduty list-findings \
  --detector-id <detector-id> \
  --finding-criteria '{
    "Criterion": {
      "severity": {
        "Gte": 7
      }
    }
  }'

# Get finding details
aws guardduty get-findings \
  --detector-id <detector-id> \
  --finding-ids <finding-id>
```

---

### Azure Defender and Microsoft Sentinel

**Microsoft Defender for Cloud** (formerly Azure Defender) provides threat protection across Azure resources, and **Microsoft Sentinel** is a cloud-native SIEM (Security Information and Event Management).

```
Azure Security Stack:
┌──────────────────────────────────────────────┐
│           Microsoft Sentinel (SIEM)          │
│  ┌────────────────────────────────────────┐  │
│  │  Analytics Rules │ Playbooks │ Hunting │  │
│  └────────────────────┬───────────────────┘  │
│                       │                      │
│  ┌────────────────────▼───────────────────┐  │
│  │       Log Analytics Workspace          │  │
│  └────────────────────┬───────────────────┘  │
│                       │                      │
│  ┌────────────────────▼───────────────────┐  │
│  │     Microsoft Defender for Cloud       │  │
│  │                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Servers  │ │ Storage  │ │  SQL   │ │  │
│  │  │ Plan     │ │ Plan     │ │  Plan  │ │  │
│  │  └──────────┘ └──────────┘ └────────┘ │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**Key Sentinel features:**

| Feature | Description |
|---------|-------------|
| **Data Connectors** | Ingest logs from Azure, AWS, GCP, and third-party sources |
| **Analytics Rules** | Detect threats using scheduled queries and ML |
| **Incidents** | Group related alerts into actionable incidents |
| **Playbooks** | Automate responses using Logic Apps |
| **Hunting** | Proactively search for threats using KQL queries |
| **Workbooks** | Visualize security data with interactive dashboards |

**Example Sentinel KQL query — detect impossible travel:**

```kql
SigninLogs
| where ResultType == "0"  // Successful logins only
| summarize
    LoginTimes = make_list(TimeGenerated),
    Locations = make_list(LocationDetails)
    by UserPrincipalName
| extend LocationPairs = zip(Locations, next(Locations))
| where array_length(Locations) > 1
| mv-expand LoginTimes, Locations
| extend PreviousLogin = prev(todatetime(LoginTimes)),
         PreviousLocation = prev(tostring(Locations))
| where isnotempty(PreviousLogin)
| extend TimeDiffMinutes = datetime_diff('minute',
           todatetime(LoginTimes), PreviousLogin)
| where TimeDiffMinutes < 60  // Less than 1 hour apart
// Flag logins from different countries within 1 hour
```

---

### GCP Security Command Center

**Security Command Center (SCC)** is Google Cloud's security and risk management platform.

```
GCP Security Command Center:
┌────────────────────────────────────────┐
│    Security Command Center (SCC)       │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Built-in Services:             │  │
│  │                                  │  │
│  │  • Security Health Analytics    │  │
│  │    (Misconfigurations)          │  │
│  │                                  │  │
│  │  • Event Threat Detection       │  │
│  │    (Real-time threats)          │  │
│  │                                  │  │
│  │  • Container Threat Detection   │  │
│  │    (GKE workloads)              │  │
│  │                                  │  │
│  │  • Web Security Scanner         │  │
│  │    (Web app vulnerabilities)    │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Findings → Notifications →     │  │
│  │  Pub/Sub → Cloud Functions      │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**SCC finding categories:**

| Category | Examples |
|----------|---------|
| **Vulnerability** | Open firewall rules, public buckets, outdated OS |
| **Misconfiguration** | MFA not enabled, logging disabled, default service account |
| **Threat** | Malware, cryptomining, suspicious network activity |
| **Compliance** | CIS benchmark violations, PCI DSS gaps |

---

## Comparison of Cloud Threat Detection Services

| Feature | AWS GuardDuty | Azure Sentinel | GCP SCC |
|---------|--------------|----------------|---------|
| **Type** | Threat detection | SIEM + SOAR | Security platform |
| **ML-based detection** | Yes | Yes | Yes |
| **Custom rules** | Limited | KQL analytics rules | Custom modules |
| **Automation** | EventBridge + Lambda | Logic Apps playbooks | Pub/Sub + Functions |
| **Multi-cloud** | AWS only | Yes (connectors) | GCP primary |
| **Pricing** | Per event analyzed | Per GB ingested | Per asset tier |
| **Setup effort** | One-click enable | Moderate | Moderate |

---

## Incident Response Framework

The **NIST Incident Response Framework** (SP 800-61) defines a structured approach to handling security incidents:

```
Incident Response Lifecycle:

  ┌──────────────┐
  │  1. Prepare  │◄──────────────────────────┐
  └──────┬───────┘                           │
         ▼                                   │
  ┌──────────────────────┐                   │
  │  2. Detect & Analyze │                   │
  └──────┬───────────────┘                   │
         ▼                                   │
  ┌──────────────┐                           │
  │  3. Contain  │                           │
  └──────┬───────┘                           │
         ▼                            ┌──────┴────────┐
  ┌──────────────────┐                │ 6. Lessons    │
  │  4. Eradicate    │                │    Learned    │
  └──────┬───────────┘                └───────────────┘
         ▼                                   ▲
  ┌──────────────┐                           │
  │  5. Recover  │───────────────────────────┘
  └──────────────┘
```

### Phase 1: Preparation

Preparation is the most critical phase — it happens **before** an incident occurs.

**Key preparation activities:**

```
Preparation Checklist:
✅ Establish an incident response team with clear roles
✅ Create and test incident response playbooks
✅ Enable comprehensive logging across all cloud services
✅ Configure alerting and notification channels
✅ Set up forensic tools and isolated investigation environments
✅ Conduct regular training and tabletop exercises
✅ Maintain up-to-date asset inventory
✅ Establish communication plans (internal and external)
✅ Define severity classification criteria
✅ Ensure legal and compliance team involvement
```

**Severity classification:**

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **Critical (P1)** | Active data breach, system compromise | Immediate (< 15 min) | Ransomware, active exfiltration |
| **High (P2)** | Confirmed threat, potential data exposure | < 1 hour | Compromised credentials, malware |
| **Medium (P3)** | Suspicious activity, no confirmed impact | < 4 hours | Unusual API calls, policy violations |
| **Low (P4)** | Informational, minor policy violation | < 24 hours | Failed login attempts, scanning |

### Phase 2: Detection and Analysis

Detection involves identifying that a security event has occurred, and analysis determines its scope and impact.

```javascript
// Example: AWS Lambda function for automated detection analysis
// Triggered by GuardDuty finding via EventBridge

export const handler = async (event) => {
  const finding = event.detail;

  const analysis = {
    findingType: finding.type,
    severity: finding.severity,
    resourceType: finding.resource.resourceType,
    accountId: finding.accountId,
    region: finding.region,
    timestamp: finding.updatedAt,
  };

  // Classify severity
  if (finding.severity >= 7) {
    analysis.priority = "CRITICAL";
    analysis.action = "IMMEDIATE_RESPONSE";
  } else if (finding.severity >= 4) {
    analysis.priority = "HIGH";
    analysis.action = "INVESTIGATE_WITHIN_1_HOUR";
  } else {
    analysis.priority = "MEDIUM";
    analysis.action = "REVIEW_WITHIN_4_HOURS";
  }

  // Enrich with additional context
  analysis.affectedResources = await getAffectedResources(finding);
  analysis.relatedFindings = await getRelatedFindings(finding);

  // Send to incident management system
  await createIncident(analysis);

  return analysis;
};
```

### Phase 3: Containment

Containment limits the damage by isolating affected resources.

**Short-term containment strategies:**

```bash
# Isolate a compromised EC2 instance
# Replace its security group with one that blocks all traffic
aws ec2 modify-instance-attribute \
  --instance-id i-0abc123def456 \
  --groups sg-isolation-only

# Disable compromised IAM access keys
aws iam update-access-key \
  --user-name compromised-user \
  --access-key-id AKIA1234567890 \
  --status Inactive

# Revoke all active sessions for a compromised IAM role
aws iam put-role-policy \
  --role-name compromised-role \
  --policy-name DenyAllAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*"
    }]
  }'

# Block a malicious IP in a network ACL
aws ec2 create-network-acl-entry \
  --network-acl-id acl-abc123 \
  --rule-number 50 \
  --protocol -1 \
  --rule-action deny \
  --cidr-block 203.0.113.0/24 \
  --ingress
```

### Phase 4: Eradication

Eradication removes the root cause of the incident.

```
Eradication Activities:
• Remove malware from affected systems
• Rotate all potentially compromised credentials
• Patch vulnerabilities that were exploited
• Remove unauthorized access (backdoor accounts, rogue keys)
• Update firewall rules and security groups
• Rebuild compromised systems from clean images
```

### Phase 5: Recovery

Recovery involves restoring systems to normal operation.

```
Recovery Steps:
1. Restore from known-good backups or rebuild from IaC
2. Verify system integrity before reconnecting to production
3. Monitor closely for signs of re-compromise
4. Gradually restore services (start with least critical)
5. Validate data integrity
6. Confirm all security controls are functioning
```

### Phase 6: Lessons Learned

The post-incident review is essential for improving future response.

```
Post-Incident Review Template:

## Incident Summary
- Incident ID: INC-2025-042
- Date Detected: 2025-03-15 14:23 UTC
- Date Resolved: 2025-03-15 18:45 UTC
- Severity: Critical (P1)

## Timeline
- 14:23 — GuardDuty alert: UnauthorizedAccess from malicious IP
- 14:28 — On-call engineer acknowledged
- 14:35 — Compromised IAM key identified and disabled
- 14:50 — Affected resources isolated
- 16:00 — Root cause identified: leaked key in public repo
- 18:00 — All credentials rotated, systems verified clean
- 18:45 — Incident closed

## Root Cause
Developer accidentally committed AWS access keys to a public
GitHub repository. Automated scanners detected and exploited
the keys within 12 minutes of the commit.

## What Went Well
- GuardDuty detected the unauthorized access quickly
- Automated alerting notified the team within 5 minutes
- Containment was executed within 30 minutes

## What Could Be Improved
- No pre-commit hooks to prevent credential leaks
- Manual credential rotation took too long
- Runbook was outdated for this scenario

## Action Items
1. [ ] Implement git-secrets pre-commit hooks (Owner: DevOps)
2. [ ] Automate credential rotation playbook (Owner: Security)
3. [ ] Update incident response runbook (Owner: IR Team)
4. [ ] Conduct team training on secrets management (Owner: Security)
```

---

## Automated Remediation

Automated remediation uses cloud functions to **respond to threats instantly** without human intervention.

### AWS: EventBridge + Lambda

```javascript
// Automated remediation: isolate compromised instance
// Triggered by GuardDuty finding via EventBridge

import { EC2Client, ModifyInstanceAttributeCommand }
  from "@aws-sdk/client-ec2";
import { SNSClient, PublishCommand }
  from "@aws-sdk/client-sns";

const ec2 = new EC2Client({});
const sns = new SNSClient({});

const ISOLATION_SG = "sg-0isolation123";
const ALERT_TOPIC = "arn:aws:sns:us-east-1:123456789:SecurityAlerts";

export const handler = async (event) => {
  const finding = event.detail;

  // Only auto-remediate high-severity EC2 findings
  if (finding.severity < 7 ||
      finding.resource.resourceType !== "Instance") {
    return { action: "SKIPPED", reason: "Below threshold" };
  }

  const instanceId = finding.resource.instanceDetails.instanceId;

  // Step 1: Isolate the instance
  await ec2.send(new ModifyInstanceAttributeCommand({
    InstanceId: instanceId,
    Groups: [ISOLATION_SG],
  }));

  // Step 2: Notify the security team
  await sns.send(new PublishCommand({
    TopicArn: ALERT_TOPIC,
    Subject: `CRITICAL: Instance ${instanceId} auto-isolated`,
    Message: JSON.stringify({
      action: "AUTO_ISOLATED",
      instanceId,
      finding: finding.type,
      severity: finding.severity,
      timestamp: new Date().toISOString(),
    }, null, 2),
  }));

  return {
    action: "ISOLATED",
    instanceId,
    findingType: finding.type,
  };
};
```

### Azure: Logic Apps Playbook

```json
{
  "definition": {
    "triggers": {
      "Microsoft_Sentinel_incident": {
        "type": "ApiConnectionWebhook",
        "inputs": {
          "body": {
            "incidentProviderId": "Azure Sentinel"
          }
        }
      }
    },
    "actions": {
      "Get_incident_entities": {
        "type": "ApiConnection",
        "inputs": {
          "method": "post",
          "path": "/entities"
        }
      },
      "For_each_IP": {
        "type": "Foreach",
        "foreach": "@body('Get_incident_entities')?['IPs']",
        "actions": {
          "Block_IP_in_NSG": {
            "type": "ApiConnection",
            "inputs": {
              "method": "put",
              "path": "/networkSecurityGroups/block-rule",
              "body": {
                "sourceAddress": "@items('For_each_IP')?['Address']",
                "action": "Deny",
                "priority": 100
              }
            }
          }
        }
      },
      "Send_Teams_notification": {
        "type": "ApiConnection",
        "inputs": {
          "method": "post",
          "path": "/teams/channel/message",
          "body": {
            "text": "Incident auto-remediated: IPs blocked"
          }
        }
      }
    }
  }
}
```

---

## Cloud Forensics

Forensics in the cloud requires different techniques than traditional on-premises investigations.

**Cloud forensics challenges and solutions:**

| Challenge | Solution |
|-----------|----------|
| Volatile resources (auto-scaling) | Capture snapshots and logs immediately |
| Shared infrastructure | Rely on provider logs (CloudTrail, Activity Log) |
| Encryption at rest | Use provider-managed decryption for authorized access |
| Cross-region/account evidence | Centralize logs in a dedicated forensics account |
| Chain of custody | Use write-once storage (S3 Object Lock, immutable blobs) |

```bash
# AWS forensics: capture evidence from a compromised instance

# 1. Create a snapshot of the instance volumes
aws ec2 create-snapshot \
  --volume-id vol-0abc123 \
  --description "Forensic snapshot - INC-2025-042" \
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Forensics,Value=INC-2025-042}]'

# 2. Capture instance metadata
aws ec2 describe-instances \
  --instance-ids i-0abc123def456 > instance-metadata.json

# 3. Capture memory (if SSM agent is running)
aws ssm send-command \
  --instance-ids i-0abc123def456 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sudo dd if=/dev/mem of=/tmp/memory.dump bs=1M"]'

# 4. Download CloudTrail logs for the affected timeframe
aws s3 sync \
  s3://my-cloudtrail-bucket/AWSLogs/123456789/CloudTrail/us-east-1/2025/03/15/ \
  ./forensics/cloudtrail/

# 5. Lock evidence in immutable storage
aws s3api put-object-lock-configuration \
  --bucket forensics-evidence-bucket \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Days": 365
      }
    }
  }'
```

---

## Incident Response Playbooks

A **playbook** is a step-by-step guide for responding to a specific type of incident.

### Example Playbook: Compromised IAM Credentials

```
PLAYBOOK: Compromised IAM Credentials
Severity: Critical (P1)
Last Updated: 2025-03-01

TRIGGER:
- GuardDuty finding: UnauthorizedAccess:IAMUser/*
- Alert from credential monitoring service
- Report from team member

STEP 1: CONFIRM (5 minutes)
□ Verify the finding is not a false positive
□ Identify the affected IAM user/role
□ Determine when the compromise occurred

STEP 2: CONTAIN (15 minutes)
□ Disable the compromised access keys
□ Revoke temporary credentials (attach deny-all policy)
□ If IAM user: force password reset and disable console access
□ If IAM role: update trust policy to prevent assumption

STEP 3: ASSESS (30 minutes)
□ Review CloudTrail for all actions taken with compromised creds
□ Identify all resources created, modified, or accessed
□ Check for persistence mechanisms (new users, roles, keys)
□ Determine data exposure scope

STEP 4: ERADICATE (1 hour)
□ Remove any unauthorized resources created by the attacker
□ Delete rogue IAM users, roles, and policies
□ Remove any backdoor access (SSH keys, security groups)
□ Rotate all credentials in the affected account

STEP 5: RECOVER (2 hours)
□ Issue new credentials to the legitimate user
□ Verify all unauthorized changes have been reverted
□ Re-enable services with new, clean credentials
□ Monitor closely for 48 hours

STEP 6: DOCUMENT
□ Complete the incident report
□ Update this playbook with lessons learned
□ File action items for process improvements
```

---

## Tabletop Exercises

A **tabletop exercise** is a simulated incident used to test your incident response process.

```
Tabletop Exercise Structure:

Duration: 2-4 hours
Participants: IR team, management, legal, communications

1. SCENARIO PRESENTATION (15 min)
   Facilitator presents a realistic security scenario

2. PHASE-BY-PHASE WALKTHROUGH (90-120 min)
   Team discusses how they would respond at each phase:
   - What would you do first?
   - Who would you notify?
   - What tools would you use?
   - What information do you need?

3. INJECT EVENTS (throughout)
   Facilitator introduces complications:
   - "The attacker has also compromised a second account"
   - "A journalist calls asking about the breach"
   - "Your primary SIEM is also affected"

4. DEBRIEF (30 min)
   - What went well?
   - Where were the gaps?
   - What needs to be updated?

5. ACTION ITEMS
   Document specific improvements with owners and deadlines
```

**Sample tabletop scenario:**

```
SCENARIO: "Operation Cloud Storm"

Background:
Your company runs a SaaS application on AWS serving 50,000
customers. On a Friday afternoon at 4:30 PM, your monitoring
system alerts on unusual API activity.

Initial Indicators:
- GuardDuty reports UnauthorizedAccess from 3 different
  countries simultaneously
- CloudTrail shows 200+ DescribeInstances API calls in
  5 minutes from an IAM role used by your CI/CD pipeline
- Your billing dashboard shows 15 new p3.16xlarge instances
  launched in regions you don't normally use
- A developer reports they can't push to the main branch

Questions to discuss:
1. How do you triage these alerts?
2. What is your first containment action?
3. Who do you notify, and when?
4. How do you determine if customer data was accessed?
5. What is your communication plan?
```

---

## Exercises

**Exercise 1: Threat Classification**

Classify each of the following scenarios by threat type and severity:

```
A) An EC2 instance is making DNS queries to a known
   cryptocurrency mining pool.

B) An IAM user who normally operates in us-east-1 makes
   API calls from ap-southeast-1 at 3 AM local time.

C) An S3 bucket policy is changed to allow public read access.

D) 50 GB of data is transferred from an RDS database to
   an external IP address over 2 hours.

E) A new IAM user with AdministratorAccess is created by
   a role that doesn't normally create users.
```

**Exercise 2: Build a Detection Rule**

Write a pseudo-query or logic that would detect the following:

```
Detect when someone creates more than 5 IAM access keys
across any IAM users within a 10-minute window.
This could indicate an attacker creating backdoor access.
```

**Exercise 3: Containment Script**

Write a shell script that:

```
1. Takes an EC2 instance ID as input
2. Creates a snapshot of all attached volumes
3. Replaces the instance's security groups with an isolation group
4. Tags the instance as "UNDER_INVESTIGATION"
5. Sends a notification to an SNS topic
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Cloud threats** | Include unauthorized access, cryptojacking, data exfiltration, and compromised credentials |
| **AWS GuardDuty** | One-click threat detection using ML and threat intelligence |
| **Azure Sentinel** | Cloud-native SIEM with KQL-based analytics and Logic Apps automation |
| **GCP SCC** | Unified security platform with built-in vulnerability and threat detection |
| **IR framework** | Six phases: Prepare, Detect, Contain, Eradicate, Recover, Lessons Learned |
| **Automated remediation** | Use Lambda/Functions to respond to threats instantly |
| **Cloud forensics** | Capture snapshots, logs, and metadata; store evidence immutably |
| **Playbooks** | Step-by-step guides for specific incident types |
| **Tabletop exercises** | Simulated incidents to test and improve your IR process |

---

In the next lesson, you will learn about **Zero Trust Architecture** — the modern security model that eliminates implicit trust in your cloud environment.
