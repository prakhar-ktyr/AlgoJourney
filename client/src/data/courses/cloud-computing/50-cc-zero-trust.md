---
title: "Zero Trust Architecture"
---

# Zero Trust Architecture

In this lesson, you will learn about **Zero Trust Architecture (ZTA)** — a modern security model that replaces the traditional "castle and moat" approach with the principle of **"never trust, always verify."**

Zero trust assumes that threats exist both **inside and outside** the network. Every access request is fully authenticated, authorized, and encrypted — regardless of where it originates.

---

## The Problem with Traditional Security

Traditional network security follows a **perimeter-based** model:

```
Traditional "Castle and Moat" Model:

          UNTRUSTED                    TRUSTED
          (Internet)                  (Internal)

  ┌───────────┐     ┌─────────┐    ┌──────────────┐
  │ Attackers │────►│Firewall │───►│  Everything  │
  │           │  ✗  │  / VPN  │ ✓  │  is trusted  │
  └───────────┘     └─────────┘    │  once inside │
                                   │              │
  ┌───────────┐         │         │  • Servers   │
  │ Remote    │─────────┘         │  • Databases │
  │ Workers   │   VPN tunnel      │  • Apps      │
  └───────────┘                   └──────────────┘

  Problem: Once inside, attackers move freely!
```

**Why this model fails in the cloud:**

| Traditional Assumption | Cloud Reality |
|----------------------|---------------|
| Clear network perimeter | No perimeter — resources span regions, providers, and SaaS |
| Internal = trusted | Insiders and compromised accounts are major threats |
| VPN = secure access | VPN grants broad network access, not granular resource access |
| IP-based trust | Workloads are ephemeral, IPs change constantly |
| One-time authentication | Sessions can be hijacked; context changes over time |

---

## What Is Zero Trust?

**Zero Trust** is a security model based on the principle that no user, device, or network should be implicitly trusted.

> **"Never trust, always verify."**

```
Zero Trust Model:

  Every request is:
  ┌─────────────────────────────────────────────────┐
  │                                                 │
  │  1. AUTHENTICATED  →  Who are you?              │
  │  2. AUTHORIZED     →  Should you have access?   │
  │  3. ENCRYPTED      →  Is the connection secure? │
  │  4. VALIDATED      →  Is your device compliant? │
  │  5. MONITORED      →  What are you doing?       │
  │                                                 │
  └─────────────────────────────────────────────────┘

  Regardless of:
  • Where the request comes from (office, home, coffee shop)
  • Whether the user is internal or external
  • Whether the device is on the corporate network
```

---

## Zero Trust Principles

Zero Trust is built on three core principles, originally defined by Forrester and adopted by NIST (SP 800-207):

### Principle 1: Verify Explicitly

**Always authenticate and authorize based on all available data points.**

```
Data Points for Verification:

┌────────────────────────────────────────────────┐
│              Access Decision                   │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Identity │  │ Device   │  │ Location     │ │
│  │          │  │ Health   │  │              │ │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│       │              │               │         │
│       ▼              ▼               ▼         │
│  ┌─────────────────────────────────────────┐   │
│  │         Policy Decision Point           │   │
│  └─────────────────────────────────────────┘   │
│       ▲              ▲               ▲         │
│       │              │               │         │
│  ┌────┴─────┐  ┌────┴─────┐  ┌──────┴───────┐ │
│  │ Behavior │  │ Data     │  │ Risk         │ │
│  │ Signals  │  │ Classif. │  │ Score        │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────────────────────────────────┘
```

**Example — traditional vs. zero trust access:**

| Aspect | Traditional | Zero Trust |
|--------|------------|------------|
| **Authentication** | Username + password | MFA + device certificate + biometric |
| **Authorization** | Role-based, checked once | Context-based, checked continuously |
| **Network** | Must be on VPN | Any network, evaluated per request |
| **Device** | Any corporate laptop | Must be compliant, patched, encrypted |
| **Session** | Valid until timeout | Re-evaluated on context change |

### Principle 2: Least Privilege Access

**Limit user access with Just-In-Time (JIT) and Just-Enough-Access (JEA).**

```
Least Privilege in Practice:

WRONG (Over-privileged):
┌─────────────────────────────────────────┐
│  Developer Role: AdministratorAccess    │
│                                         │
│  ✓ Full access to all AWS services      │
│  ✓ Can delete production databases      │
│  ✓ Can modify IAM policies              │
│  ✓ Can access billing                   │
│                                         │
│  Risk: Compromised account = total      │
│        control of environment           │
└─────────────────────────────────────────┘

RIGHT (Least privilege):
┌─────────────────────────────────────────┐
│  Developer Role: AppDeveloper           │
│                                         │
│  ✓ Read/write to specific S3 buckets    │
│  ✓ Deploy to staging ECS cluster        │
│  ✓ Read CloudWatch logs                 │
│  ✗ No access to production databases    │
│  ✗ No IAM modification                  │
│  ✗ No billing access                    │
│                                         │
│  + JIT: Request elevated access for     │
│    4 hours with approval workflow       │
└─────────────────────────────────────────┘
```

**JIT access example with AWS IAM Identity Center:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::app-assets-bucket/*",
      "Condition": {
        "DateGreaterThan": {
          "aws:CurrentTime": "2025-03-15T09:00:00Z"
        },
        "DateLessThan": {
          "aws:CurrentTime": "2025-03-15T13:00:00Z"
        }
      }
    }
  ]
}
```

### Principle 3: Assume Breach

**Design systems assuming attackers are already inside your environment.**

```
Assume Breach Strategies:

┌──────────────────────────────────────────────┐
│  Minimize blast radius:                      │
│  • Micro-segment networks and workloads      │
│  • Isolate sensitive resources               │
│  • Use separate accounts/subscriptions       │
│                                              │
│  Verify end-to-end encryption:               │
│  • Encrypt data in transit (TLS everywhere)  │
│  • Encrypt data at rest (managed keys)       │
│  • Encrypt data in processing (enclaves)     │
│                                              │
│  Improve detection:                          │
│  • Monitor all access continuously           │
│  • Use analytics to detect anomalies         │
│  • Maintain detailed audit logs              │
│                                              │
│  Practice response:                          │
│  • Run incident response drills              │
│  • Automate containment actions              │
│  • Test backup and recovery procedures       │
└──────────────────────────────────────────────┘
```

---

## The Six Pillars of Zero Trust

Zero Trust applies across six foundational pillars:

```
Six Pillars of Zero Trust:

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Identity │ │ Devices  │ │ Network  │
│          │ │          │ │          │
│ Users,   │ │ Managed, │ │ Micro-   │
│ service  │ │ BYOD,    │ │ segmented│
│ accounts │ │ IoT      │ │ encrypted│
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │             │            │
     ▼             ▼            ▼
┌──────────────────────────────────────┐
│     Visibility & Analytics          │
│     Automation & Orchestration      │
└──────────────────────────────────────┘
     ▲             ▲            ▲
     │             │            │
┌────┴─────┐ ┌────┴─────┐ ┌────┴──────┐
│  Apps    │ │  Data    │ │Infrastructure│
│          │ │          │ │            │
│ SaaS,    │ │ Classif. │ │ Servers,   │
│ on-prem, │ │ labeled, │ │ containers,│
│ cloud    │ │ encrypted│ │ serverless │
└──────────┘ └──────────┘ └───────────┘
```

### Pillar 1: Identity

Identity is the **foundation** of zero trust — it replaces the network as the primary security perimeter.

| Capability | Description |
|-----------|-------------|
| **Strong authentication** | MFA for all users, passwordless where possible |
| **Single sign-on (SSO)** | Centralized identity provider for all applications |
| **Conditional access** | Policies based on user, device, location, and risk |
| **Identity governance** | Regular access reviews and automated provisioning |
| **Privileged access management** | JIT access for administrative roles |

```
Identity-Centric Security Flow:

User Request → Identity Provider → Risk Assessment
                    │                      │
                    ▼                      ▼
              MFA Challenge         Context Analysis
                    │               (device, location,
                    ▼                behavior, time)
              Verified Identity          │
                    │                    ▼
                    └──────► Access Decision
                                   │
                          ┌────────┴────────┐
                          │                 │
                       ALLOW             DENY
                    (with scope         (with reason
                     and timeout)        and remediation)
```

### Pillar 2: Devices

Every device accessing resources must be **known, healthy, and compliant**.

```
Device Trust Evaluation:

┌────────────────────────────────────────────┐
│  Device Compliance Checks:                 │
│                                            │
│  ✓ Is the device enrolled in MDM?          │
│  ✓ Is the OS version up to date?           │
│  ✓ Is disk encryption enabled?             │
│  ✓ Is antivirus/EDR running and current?   │
│  ✓ Is the firewall enabled?                │
│  ✓ Is the device jailbroken/rooted?        │
│  ✓ Is a screen lock configured?            │
│  ✓ Is the device certificate valid?        │
│                                            │
│  Compliance Score: 8/8 = COMPLIANT ✓       │
│  Result: Full access granted               │
│                                            │
│  Compliance Score: 5/8 = PARTIAL ⚠         │
│  Result: Limited access, remediation       │
│          guidance provided                 │
│                                            │
│  Compliance Score: 2/8 = NON-COMPLIANT ✗   │
│  Result: Access denied, web-only fallback  │
└────────────────────────────────────────────┘
```

### Pillar 3: Network

Zero trust networks use **micro-segmentation** instead of broad network zones.

```
Traditional Network:
┌────────────────────────────────────────┐
│           FLAT NETWORK                 │
│                                        │
│  Web ←───→ App ←───→ DB ←───→ Admin   │
│   │         │         │         │      │
│   └─────────┴─────────┴─────────┘      │
│   All servers can talk to each other   │
└────────────────────────────────────────┘

Zero Trust Micro-segmented Network:
┌────────────────────────────────────────┐
│                                        │
│  ┌─────┐    ┌─────┐    ┌─────┐        │
│  │ Web │───►│ App │───►│ DB  │        │
│  └─────┘    └─────┘    └─────┘        │
│     │          │          │            │
│     ✗          ✗          ✗            │
│     │          │          │            │
│  ┌──┴──┐    ┌──┴──┐    ┌──┴──┐        │
│  │Admin│    │Admin│    │Admin│        │
│  └─────┘    └─────┘    └─────┘        │
│                                        │
│  Only explicitly allowed flows pass   │
│  East-west traffic is restricted      │
└────────────────────────────────────────┘
```

### Pillar 4: Applications

Applications must authenticate users and validate authorization for every request.

| Control | Implementation |
|---------|---------------|
| **API authentication** | OAuth 2.0 / OIDC tokens for every API call |
| **Input validation** | Validate and sanitize all inputs |
| **Session management** | Short-lived tokens, continuous validation |
| **Application proxy** | Hide apps from the internet, expose through identity-aware proxy |
| **Runtime protection** | WAF, RASP, and bot detection |

### Pillar 5: Data

Data protection is the **ultimate goal** of zero trust — everything else protects the data.

```
Data-Centric Security:

┌────────────────────────────────────────────┐
│         Data Protection Layers             │
│                                            │
│  1. CLASSIFY                               │
│     Label data by sensitivity:             │
│     Public → Internal → Confidential →     │
│     Highly Confidential                    │
│                                            │
│  2. ENCRYPT                                │
│     • At rest: AES-256 with managed keys   │
│     • In transit: TLS 1.3 minimum          │
│     • In use: confidential computing       │
│                                            │
│  3. CONTROL ACCESS                         │
│     • Attribute-based access control       │
│     • Data loss prevention (DLP) policies  │
│     • Rights management (IRM)              │
│                                            │
│  4. MONITOR                                │
│     • Track all data access                │
│     • Alert on unusual patterns            │
│     • Audit compliance continuously        │
└────────────────────────────────────────────┘
```

### Pillar 6: Infrastructure

Infrastructure components (servers, containers, serverless) must also follow zero trust principles.

```
Infrastructure Zero Trust:

┌──────────────────────────────────────────┐
│  Workload Identity:                      │
│  • Every workload has a cryptographic    │
│    identity (SPIFFE/SPIRE, managed       │
│    identity)                             │
│  • Service-to-service authentication     │
│    via mutual TLS (mTLS)                 │
│                                          │
│  Immutable Infrastructure:               │
│  • Deploy from verified images only      │
│  • No SSH access to production           │
│  • Replace, don't patch                  │
│                                          │
│  Runtime Protection:                     │
│  • Container image scanning              │
│  • Runtime behavior monitoring           │
│  • Admission controllers in Kubernetes   │
└──────────────────────────────────────────┘
```

---

## Implementing Zero Trust in the Cloud

### Identity-Centric Security

**Azure AD Conditional Access** is a leading example of identity-centric zero trust:

```
Azure AD Conditional Access Policy:

IF:
  User is in group "Finance Team"
  AND app is "Financial Reporting System"

THEN CHECK:
  ┌─────────────────────────────────────┐
  │ Signal          │ Requirement       │
  ├─────────────────┼───────────────────┤
  │ MFA             │ Required          │
  │ Device          │ Compliant + Intune│
  │ Location        │ Named location    │
  │ Risk level      │ Low or Medium     │
  │ Client app      │ Modern auth only  │
  │ Session         │ 1-hour timeout    │
  └─────────────────┴───────────────────┘

IF ALL CONDITIONS MET:
  → Grant access with session controls

IF ANY CONDITION FAILS:
  → Block access + show remediation steps
```

**Conditional Access policy in JSON:**

```json
{
  "displayName": "Require MFA and compliant device for Finance apps",
  "state": "enabled",
  "conditions": {
    "users": {
      "includeGroups": ["finance-team-group-id"]
    },
    "applications": {
      "includeApplications": ["financial-reporting-app-id"]
    },
    "locations": {
      "includeLocations": ["AllTrusted"]
    },
    "devicePlatforms": {
      "includeDevicePlatforms": ["windows", "macOS"]
    },
    "signInRiskLevels": ["low", "medium"]
  },
  "grantControls": {
    "operator": "AND",
    "builtInControls": [
      "mfa",
      "compliantDevice"
    ]
  },
  "sessionControls": {
    "signInFrequency": {
      "value": 1,
      "type": "hours",
      "isEnabled": true
    },
    "persistentBrowser": {
      "mode": "never",
      "isEnabled": true
    }
  }
}
```

### Micro-Segmentation

**AWS Security Groups as micro-segmentation:**

```bash
# Create security groups for each tier
aws ec2 create-security-group \
  --group-name web-tier-sg \
  --description "Web tier - only accepts HTTPS from ALB"

aws ec2 create-security-group \
  --group-name app-tier-sg \
  --description "App tier - only accepts traffic from web tier"

aws ec2 create-security-group \
  --group-name db-tier-sg \
  --description "DB tier - only accepts traffic from app tier"

# Web tier: only allow HTTPS from the load balancer
aws ec2 authorize-security-group-ingress \
  --group-name web-tier-sg \
  --protocol tcp \
  --port 443 \
  --source-group alb-sg

# App tier: only allow traffic from web tier on port 8080
aws ec2 authorize-security-group-ingress \
  --group-name app-tier-sg \
  --protocol tcp \
  --port 8080 \
  --source-group web-tier-sg

# DB tier: only allow traffic from app tier on port 5432
aws ec2 authorize-security-group-ingress \
  --group-name db-tier-sg \
  --protocol tcp \
  --port 5432 \
  --source-group app-tier-sg

# No other inbound traffic is allowed by default
```

### Continuous Monitoring

```
Continuous Monitoring Architecture:

┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Identity Logs │  │ Network Logs  │  │ App Logs      │
│ (CloudTrail,  │  │ (VPC Flow,    │  │ (Application  │
│  Azure AD)    │  │  NSG Flow)    │  │  traces)      │
└──────┬────────┘  └──────┬────────┘  └──────┬────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              SIEM / Analytics Platform              │
│  (Sentinel, Security Lake, Chronicle)               │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Behavioral Analytics Engine                  │  │
│  │                                               │  │
│  │  • Baseline normal behavior per user/service  │  │
│  │  • Detect deviations from baseline            │  │
│  │  • Correlate signals across pillars           │  │
│  │  • Calculate real-time risk scores            │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Automated Response                           │  │
│  │                                               │  │
│  │  Risk HIGH   → Block access, alert SOC        │  │
│  │  Risk MEDIUM → Require step-up authentication │  │
│  │  Risk LOW    → Log and continue monitoring    │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Zero Trust Technologies

### Google BeyondCorp

Google pioneered zero trust with **BeyondCorp**, moving access controls from the network perimeter to individual users and devices.

```
BeyondCorp Architecture:

  User + Device
       │
       ▼
┌──────────────────┐
│  Access Proxy    │  ← Internet-facing entry point
│  (Identity-Aware │
│   Proxy / IAP)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Access Control  │  ← Checks: identity + device trust
│  Engine          │     + context + policy
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 ALLOW      DENY
    │
    ▼
┌──────────────────┐
│  Internal App    │  ← Not exposed to the internet
│  (no VPN needed) │     directly
└──────────────────┘

Key Insight: The app is never directly exposed.
Users connect through the identity-aware proxy,
which verifies everything before granting access.
```

**GCP Identity-Aware Proxy (IAP) setup:**

```bash
# Enable IAP for a backend service
gcloud compute backend-services update my-backend \
  --iap=enabled \
  --global

# Grant access to specific users
gcloud projects add-iam-policy-binding my-project \
  --member="user:alice@example.com" \
  --role="roles/iap.httpsResourceAccessor"

# Grant access to a group
gcloud projects add-iam-policy-binding my-project \
  --member="group:engineering@example.com" \
  --role="roles/iap.httpsResourceAccessor"

# Set access levels based on device attributes
gcloud access-context-manager levels create corp-device \
  --title="Corporate Device" \
  --basic-level-spec=level-spec.yaml \
  --policy=my-policy

# level-spec.yaml:
# - devicePolicy:
#     requireScreenLock: true
#     osConstraints:
#       - osType: DESKTOP_CHROME_OS
#         minimumVersion: "100.0"
#       - osType: DESKTOP_MAC
#         minimumVersion: "12.0"
#     allowedEncryptionStatuses:
#       - ENCRYPTED
```

### AWS Verified Access

**AWS Verified Access** provides secure access to corporate applications without a VPN.

```
AWS Verified Access Architecture:

┌─────────┐     ┌──────────────────────┐     ┌─────────────┐
│  User   │────►│  Verified Access     │────►│  Internal   │
│         │     │  Endpoint            │     │  Application│
└─────────┘     │                      │     └─────────────┘
                │  Checks:             │
                │  ├─ Identity (OIDC)  │
                │  ├─ Device posture   │
                │  │  (CrowdStrike,    │
                │  │   Jamf, etc.)     │
                │  └─ Access policy    │
                │     (Cedar language) │
                └──────────────────────┘
```

**AWS Verified Access policy (Cedar language):**

```
// Allow access if the user is in the engineering group
// AND their device is compliant
permit(
  principal,
  action,
  resource
) when {
  // Identity check
  context.identity.groups.contains("engineering") &&

  // Device posture check
  context.device.risk_score <= 5 &&
  context.device.os_version >= "14.0" &&
  context.device.disk_encrypted == true &&

  // Time-based check
  context.request.time.hour >= 6 &&
  context.request.time.hour <= 22
};
```

### Azure AD Conditional Access

As covered in the implementation section above, **Azure AD Conditional Access** evaluates signals from identity, device, location, and risk to make real-time access decisions.

---

## Zero Trust Network Access (ZTNA) vs. VPN

ZTNA is the modern replacement for traditional VPNs in a zero trust model.

| Feature | Traditional VPN | ZTNA |
|---------|----------------|------|
| **Access scope** | Broad network access | Per-application access |
| **Trust model** | Trust after connection | Verify every request |
| **Visibility** | Limited (encrypted tunnel) | Full visibility of user actions |
| **User experience** | Client software, split tunneling issues | Seamless, often clientless |
| **Scalability** | VPN concentrator bottleneck | Cloud-delivered, elastic |
| **Lateral movement** | Easy once connected | Prevented by micro-segmentation |
| **Device posture** | Often not checked | Continuously evaluated |
| **Cloud-native** | Designed for on-premises | Designed for cloud and hybrid |

```
VPN Access Pattern:

User ──VPN──► Corporate Network ──► App A
                    │                App B
                    │                App C
                    └──► ALL resources accessible

ZTNA Access Pattern:

User ──ZTNA──► App A only
       │
       ├──ZTNA──► App B only (separate policy)
       │
       └──✗──► App C (not authorized)

Each application has its own access policy.
```

**When to use each:**

```
Use VPN when:
• You need broad network-level access (legacy apps)
• Site-to-site connectivity between offices
• Compliance requirements mandate VPN

Use ZTNA when:
• Application-level access is sufficient
• Users work from varied locations and devices
• You want to reduce attack surface
• Moving to zero trust architecture
• Cloud-first or hybrid environment
```

---

## Zero Trust Maturity Model

The **CISA Zero Trust Maturity Model** defines stages of zero trust adoption:

```
Zero Trust Maturity Stages:

TRADITIONAL          INITIAL           ADVANCED          OPTIMAL
──────────────────────────────────────────────────────────────────►

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Perimeter │    │ Some ZT  │    │ Central  │    │ Full ZT  │
│ based,   │    │ controls,│    │ policy,  │    │ across   │
│ static   │    │ per-pillar│   │ cross-   │    │ all      │
│ policies │    │ adoption │    │ pillar   │    │ pillars, │
│          │    │          │    │ integr.  │    │ automated│
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

**Maturity by pillar:**

| Pillar | Traditional | Initial | Advanced | Optimal |
|--------|------------|---------|----------|---------|
| **Identity** | Passwords only | MFA for some | MFA everywhere, SSO | Passwordless, continuous auth |
| **Devices** | No device checks | Basic inventory | Compliance checks | Real-time posture, auto-remediation |
| **Network** | Flat network | Some segmentation | Micro-segmentation | Software-defined perimeter |
| **Applications** | Perimeter protection | Some app-level auth | All apps behind proxy | Full API security, runtime protection |
| **Data** | No classification | Some labeling | Automated classification | Dynamic DLP, rights management |
| **Infrastructure** | Manual management | Some IaC | Immutable infra | Full automation, confidential computing |

---

## Implementation Roadmap

Implementing zero trust is a **journey, not a destination**. Here is a phased roadmap:

### Phase 1: Foundation (Months 1-3)

```
Priority Actions:
┌────────────────────────────────────────────────┐
│                                                │
│  1. IDENTITY FOUNDATION                        │
│     □ Deploy MFA for all users                 │
│     □ Implement SSO with a central IdP         │
│     □ Inventory all service accounts           │
│     □ Enable sign-in risk detection            │
│                                                │
│  2. VISIBILITY                                 │
│     □ Enable logging across all services       │
│     □ Centralize logs in SIEM                  │
│     □ Create baseline of normal activity       │
│     □ Set up basic alerting                    │
│                                                │
│  3. INVENTORY                                  │
│     □ Catalog all applications and data        │
│     □ Identify sensitive data locations        │
│     □ Map data flows between systems           │
│     □ Document current access patterns         │
│                                                │
└────────────────────────────────────────────────┘
```

### Phase 2: Strengthen Controls (Months 4-8)

```
Priority Actions:
┌────────────────────────────────────────────────┐
│                                                │
│  1. CONDITIONAL ACCESS                         │
│     □ Implement risk-based access policies     │
│     □ Add device compliance requirements       │
│     □ Enable location-based controls           │
│     □ Deploy identity-aware proxy for web apps │
│                                                │
│  2. NETWORK SEGMENTATION                       │
│     □ Segment networks by sensitivity          │
│     □ Implement security groups per workload   │
│     □ Deploy east-west traffic monitoring      │
│     □ Restrict default network access          │
│                                                │
│  3. DATA PROTECTION                            │
│     □ Classify data by sensitivity level       │
│     □ Enable encryption at rest and in transit │
│     □ Implement DLP policies                   │
│     □ Set up data access monitoring            │
│                                                │
└────────────────────────────────────────────────┘
```

### Phase 3: Advanced Capabilities (Months 9-14)

```
Priority Actions:
┌────────────────────────────────────────────────┐
│                                                │
│  1. CONTINUOUS VERIFICATION                    │
│     □ Deploy continuous authentication         │
│     □ Implement behavioral analytics           │
│     □ Enable real-time risk scoring            │
│     □ Automate access revocation on risk       │
│                                                │
│  2. MICRO-SEGMENTATION                         │
│     □ Deploy workload-level segmentation       │
│     □ Implement service mesh (mTLS)            │
│     □ Enable just-in-time access               │
│     □ Zero standing privileges                 │
│                                                │
│  3. AUTOMATION                                 │
│     □ Automate incident response playbooks     │
│     □ Deploy auto-remediation for common       │
│       policy violations                        │
│     □ Implement security-as-code pipelines     │
│     □ Continuous compliance monitoring         │
│                                                │
└────────────────────────────────────────────────┘
```

### Phase 4: Optimize (Ongoing)

```
Continuous Improvement:
┌────────────────────────────────────────────────┐
│                                                │
│  □ Move toward passwordless authentication     │
│  □ Implement confidential computing            │
│  □ Adopt software-defined perimeter            │
│  □ Integrate AI/ML for threat detection        │
│  □ Regular red team exercises                  │
│  □ Measure and report on ZT maturity scores    │
│  □ Update policies based on threat landscape   │
│  □ Expand ZTNA to replace all VPN use cases    │
│                                                │
└────────────────────────────────────────────────┘
```

---

## Common Zero Trust Mistakes

Avoid these pitfalls when implementing zero trust:

| Mistake | Why It's Wrong | Better Approach |
|---------|---------------|-----------------|
| "Zero trust means no trust" | It means **verified** trust, not no trust | Trust is earned through continuous verification |
| Trying to do everything at once | Leads to burnout and stalled projects | Prioritize by risk; implement in phases |
| Focusing only on network | ZT covers all six pillars | Start with identity, then expand |
| Ignoring user experience | Users will find workarounds | Make secure access seamless |
| Buying a "zero trust product" | ZT is a strategy, not a product | Use multiple tools aligned to a ZT strategy |
| Forgetting service accounts | Non-human identities are a big risk | Apply ZT to workload identities too |
| Not measuring progress | Can't improve what you don't measure | Use the maturity model to track progress |

---

## Exercises

**Exercise 1: Policy Design**

Design a zero trust access policy for the following scenario:

```
Application: Customer Support Portal
Users: Support agents (100 people)
Data: Customer PII (names, emails, account details)
Access: During business hours (9 AM - 6 PM) from
        company-managed devices only

Define:
1. Identity requirements
2. Device requirements
3. Network requirements
4. Session controls
5. Monitoring requirements
```

**Exercise 2: ZTNA Migration Plan**

Your company currently uses a VPN for remote access to 10 internal applications. Create a migration plan to move to ZTNA:

```
For each application, document:
1. Current access method
2. User groups that need access
3. Data sensitivity level
4. Migration priority (1-5)
5. ZTNA implementation approach
```

**Exercise 3: Maturity Assessment**

Assess your organization (or a hypothetical one) against the zero trust maturity model:

```
For each pillar (Identity, Devices, Network, Apps, Data,
Infrastructure):
1. Current maturity level (Traditional/Initial/Advanced/Optimal)
2. Top 3 gaps
3. Quick wins (achievable in 30 days)
4. Long-term goals (6-12 months)
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Zero trust** | "Never trust, always verify" — no implicit trust based on network location |
| **Three principles** | Verify explicitly, least privilege access, assume breach |
| **Six pillars** | Identity, devices, network, applications, data, infrastructure |
| **Identity-centric** | Identity replaces the network perimeter as the primary control |
| **Micro-segmentation** | Replace flat networks with per-workload access controls |
| **BeyondCorp** | Google's implementation: identity-aware proxy, no VPN needed |
| **ZTNA vs. VPN** | ZTNA provides per-app access; VPN provides broad network access |
| **Maturity model** | Traditional → Initial → Advanced → Optimal across all pillars |
| **Implementation** | Phased approach: foundation → strengthen → advance → optimize |

---

Congratulations on completing the **Cloud Security** section of the Cloud Computing course! You now have a solid understanding of how to protect cloud environments using modern security principles and tools.
