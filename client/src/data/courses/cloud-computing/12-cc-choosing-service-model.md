---
title: "Choosing a Service Model"
---

# Choosing a Service Model

One of the most critical decisions in cloud adoption is choosing the right **service model** for your workload. Pick the wrong model and you'll either waste money managing infrastructure you don't need to — or lose control over things that matter to your business.

This lesson gives you a practical **decision framework** for choosing between IaaS, PaaS, SaaS, and Serverless.

---

## Quick Recap: The Four Models

Before diving into the decision framework, let's summarize what each model offers:

```
┌──────────────────────────────────────────────────────┐
│                    YOU MANAGE LESS →                  │
│                                                      │
│   IaaS        PaaS        Serverless      SaaS       │
│                                                      │
│   Maximum     Balanced    Event-driven    Turnkey     │
│   Control     Approach    Auto-scale      Solution    │
│                                                      │
│                    ← YOU MANAGE MORE                  │
└──────────────────────────────────────────────────────┘
```

| Model        | You Manage                        | Provider Manages              | Example                        |
|--------------|-----------------------------------|-------------------------------|--------------------------------|
| **IaaS**     | OS, runtime, app, data            | Hardware, networking, VMs     | AWS EC2, Azure VMs, GCE        |
| **PaaS**     | App code, data                    | OS, runtime, middleware       | Heroku, Azure App Service      |
| **Serverless**| Function code, data              | Everything else               | AWS Lambda, Azure Functions    |
| **SaaS**     | Configuration, data               | The entire application        | Gmail, Salesforce, Slack       |

---

## The Decision Framework

Choosing a service model comes down to evaluating **six key factors**:

### Factor 1: Level of Control Needed

How much control do you need over the underlying infrastructure?

| Requirement                                     | Recommended Model |
|-------------------------------------------------|-------------------|
| Custom OS kernel, specific drivers               | **IaaS**          |
| Custom runtime versions or configurations        | **IaaS / PaaS**   |
| Standard web app with common runtime             | **PaaS**          |
| Event-driven microservices                       | **Serverless**    |
| Standard business tool (email, CRM)              | **SaaS**          |

```
Example Questions to Ask:

  "Do we need to install custom software on the OS?"
    → Yes → IaaS
    → No  → Consider PaaS or Serverless

  "Do we need to control the network topology?"
    → Yes → IaaS
    → No  → PaaS or higher

  "Do we need to run background processes 24/7?"
    → Yes → IaaS or PaaS
    → No  → Serverless might work
```

### Factor 2: Team Skills and Capacity

What skills does your team have? How large is your operations team?

| Team Profile                                    | Recommended Model |
|-------------------------------------------------|-------------------|
| Large DevOps team, sysadmin expertise            | **IaaS**          |
| Developers with some DevOps knowledge            | **PaaS**          |
| Small dev team, no dedicated ops                 | **Serverless**    |
| Non-technical team, business users               | **SaaS**          |

```
Skill Requirements by Model:

  IaaS:
    ✔ Linux/Windows server administration
    ✔ Network configuration (VPCs, subnets, firewalls)
    ✔ Security hardening and patching
    ✔ Monitoring and troubleshooting
    ✔ Capacity planning

  PaaS:
    ✔ Application development
    ✔ Basic networking concepts
    ✔ CI/CD pipeline management
    ✔ Application-level monitoring

  Serverless:
    ✔ Event-driven architecture design
    ✔ Function-level optimization
    ✔ API Gateway configuration
    ✔ Distributed tracing

  SaaS:
    ✔ Product configuration
    ✔ User management
    ✔ Basic integration knowledge (APIs, webhooks)
```

### Factor 3: Time-to-Market

How quickly do you need to launch?

| Timeline                    | Recommended Model |
|-----------------------------|-------------------|
| Months (complex setup OK)   | **IaaS**          |
| Weeks (focus on code)        | **PaaS**          |
| Days (functions + events)    | **Serverless**    |
| Hours (configure and go)     | **SaaS**          |

```
Deployment Speed Comparison:

  Setting up a web application:

  IaaS:
    1. Provision VM                    (minutes)
    2. Install and configure OS        (hours)
    3. Set up web server (Nginx)       (hours)
    4. Install runtime (Node.js)       (minutes)
    5. Configure security groups       (hours)
    6. Set up load balancer            (hours)
    7. Deploy application              (minutes)
    Total: 1-3 days

  PaaS:
    1. Create App Service              (minutes)
    2. Connect Git repository          (minutes)
    3. Configure environment vars      (minutes)
    4. Deploy application              (minutes)
    Total: 30 minutes - 2 hours

  Serverless:
    1. Write function                  (minutes)
    2. Configure API Gateway           (minutes)
    3. Deploy                          (minutes)
    Total: 15-60 minutes

  SaaS:
    1. Sign up                         (minutes)
    2. Configure                       (minutes)
    Total: 5-30 minutes
```

### Factor 4: Budget and Cost Model

What's your budget, and how predictable does spending need to be?

| Budget Characteristic              | Recommended Model |
|------------------------------------|-------------------|
| Predictable monthly spend needed    | **IaaS** (reserved) or **SaaS** |
| Pay only for what you use           | **Serverless**    |
| Moderate, predictable scaling       | **PaaS**          |
| Minimize upfront investment         | **SaaS** or **Serverless** |

```
Cost Structure by Model:

  IaaS:
    ├── Compute (VMs):        $50-500+/month per instance
    ├── Storage:              $0.02-0.10/GB/month
    ├── Network:              $0.01-0.09/GB outbound
    ├── Staff (sysadmins):    $80,000-150,000/year
    └── Total:                Higher base, scales linearly

  PaaS:
    ├── Platform fee:         $10-500+/month per app
    ├── Compute scaling:      Auto-managed
    ├── Storage:              Included or tiered
    ├── Staff (developers):   Can focus on code
    └── Total:                Moderate, less ops overhead

  Serverless:
    ├── Per request:          $0.20 per 1M requests
    ├── Compute time:         $0.00001667 per GB-second
    ├── Free tier:            1M requests/month (AWS)
    ├── Staff:                Minimal ops needed
    └── Total:                Very low at small scale,
                              can surprise at high scale

  SaaS:
    ├── Per user/month:       $5-300+ per user
    ├── Storage limits:       Tier-based
    ├── Staff:                Minimal technical staff
    └── Total:                Predictable, scales with users
```

### Factor 5: Compliance and Regulatory Requirements

What regulatory frameworks must your application comply with?

| Compliance Need                            | Recommended Model     |
|--------------------------------------------|-----------------------|
| Full audit trail of infrastructure          | **IaaS**              |
| Data residency requirements                 | **IaaS** or **PaaS** (with region control) |
| Industry-specific certifications            | **SaaS** (if certified) |
| Custom encryption and key management        | **IaaS**              |
| Standard compliance (SOC 2, ISO)            | Any model             |

```
Compliance Considerations:

  HIPAA (Healthcare):
    → IaaS:       You configure everything, full control
    → PaaS:       Ensure BAA is signed, use compliant services
    → Serverless: Limited — check provider's compliance scope
    → SaaS:       Must be HIPAA-certified (e.g., Google Workspace)

  PCI DSS (Payment Cards):
    → IaaS:       Full control, but full responsibility
    → PaaS:       Reduces scope if provider is PCI-certified
    → Serverless: Can reduce scope significantly
    → SaaS:       Best if using certified payment processor

  GDPR (Data Privacy):
    → All models: You're responsible for data handling
    → Key:        Data processing agreements, right to erasure,
                  data residency in EU regions
```

### Factor 6: Scalability Requirements

How does your workload scale?

| Scaling Pattern                          | Recommended Model |
|------------------------------------------|-------------------|
| Predictable, steady growth               | **IaaS** or **PaaS** |
| Spiky, unpredictable traffic             | **Serverless**    |
| Massive scale with fine-grained control  | **IaaS**          |
| Auto-scaling with minimal config         | **PaaS**          |
| Scale to zero when idle                  | **Serverless**    |

---

## Decision Tree

Follow this flowchart to choose your service model:

```
START: What are you building?
  │
  ├─► An off-the-shelf business tool (email, CRM, HR)?
  │     → Use SaaS
  │
  ├─► A custom application?
  │     │
  │     ├─► Do you need OS-level control?
  │     │     │
  │     │     ├─► Yes → Do you need custom kernels/drivers?
  │     │     │          │
  │     │     │          ├─► Yes → Use IaaS
  │     │     │          └─► No  → Consider PaaS first,
  │     │     │                     IaaS if PaaS is limiting
  │     │     │
  │     │     └─► No → Is your workload event-driven?
  │     │              │
  │     │              ├─► Yes → Does it complete in < 15 min?
  │     │              │          │
  │     │              │          ├─► Yes → Use Serverless
  │     │              │          └─► No  → Use PaaS
  │     │              │                     or Containers
  │     │              │
  │     │              └─► No → Is it a web app or API?
  │     │                        │
  │     │                        ├─► Yes → Use PaaS
  │     │                        └─► No  → Evaluate IaaS
  │     │                                   or Containers
  │     │
  │     └─► Do you have a large DevOps team?
  │           │
  │           ├─► Yes → IaaS gives maximum flexibility
  │           └─► No  → PaaS or Serverless to reduce
  │                      operational burden
  │
  └─► Migrating an existing application?
        │
        ├─► Lift-and-shift (minimal changes)?
        │     → Use IaaS
        │
        ├─► Refactor for cloud-native?
        │     → Use PaaS or Containers
        │
        └─► Rebuild from scratch?
              → Evaluate Serverless or PaaS
```

---

## Real-World Scenarios

### Scenario 1: E-Commerce Startup

```
Requirements:
  - Web storefront with product catalog
  - User accounts and shopping cart
  - Payment processing
  - Need to launch in 4 weeks
  - Team: 3 developers, no ops engineer
  - Expect spiky traffic (sales events)

Recommendation: PaaS + SaaS

  Frontend:      Vercel or Netlify (PaaS/Serverless)
  Backend API:   AWS App Runner or Azure App Service (PaaS)
  Database:      Amazon RDS or Azure SQL (Managed PaaS)
  Payments:      Stripe (SaaS)
  Email:         SendGrid (SaaS)
  Auth:          Auth0 or Firebase Auth (SaaS)
  CDN:           CloudFront or Cloudflare (SaaS)

Why not IaaS?
  → Small team can't afford ops overhead
  → PaaS handles scaling for spiky traffic
  → SaaS for payments reduces PCI scope
```

### Scenario 2: Financial Trading Platform

```
Requirements:
  - Ultra-low latency (< 1ms)
  - Custom network stack optimizations
  - Specific OS kernel parameters
  - Regulatory compliance (SEC, FINRA)
  - Team: 20 engineers including 5 DevOps
  - Predictable, high-volume workload

Recommendation: IaaS

  Compute:       Bare metal or dedicated instances
  Networking:    Enhanced networking, placement groups
  Storage:       Local NVMe SSDs for hot data
  Database:      Self-managed PostgreSQL (tuned)
  Monitoring:    Custom Prometheus + Grafana stack

Why not PaaS?
  → Need OS-level network tuning
  → Latency requirements exceed PaaS guarantees
  → Custom kernel modules needed
  → Full audit trail required for compliance
```

### Scenario 3: IoT Data Processing

```
Requirements:
  - Millions of devices sending telemetry
  - Process events in real-time
  - Store data for analytics
  - Highly variable load (devices sleep at night)
  - Team: 5 developers
  - Budget-conscious

Recommendation: Serverless + PaaS

  Ingestion:     AWS IoT Core or Azure IoT Hub (PaaS)
  Processing:    AWS Lambda or Azure Functions (Serverless)
  Stream:        Amazon Kinesis or Azure Event Hubs (PaaS)
  Storage:       Amazon S3 or Azure Blob Storage (PaaS)
  Analytics:     Amazon Athena or Azure Synapse (PaaS)
  Dashboard:     Grafana Cloud (SaaS)

Why Serverless?
  → Scale to zero when devices are idle (nighttime)
  → Pay per event — cost-effective for variable load
  → No servers to manage for processing pipeline
```

### Scenario 4: Enterprise CRM Deployment

```
Requirements:
  - Standard CRM functionality
  - 500 sales team members
  - Integrate with existing email and calendar
  - Reporting and analytics
  - Team: 2 IT admins, no developers
  - Launch in 2 weeks

Recommendation: SaaS

  CRM:           Salesforce or HubSpot
  Integration:   Zapier or native connectors
  Analytics:     Built-in reporting + Power BI (SaaS)

Why SaaS?
  → No development team available
  → Standard CRM needs, no customization
  → Fastest time-to-value
  → Predictable per-user pricing
```

---

## Migration Paths Between Models

As your needs evolve, you may need to move between service models:

### Common Migration Paths

```
SaaS → PaaS
  When: You outgrow the SaaS product's capabilities
  Example: Moving from Shopify to a custom e-commerce app
  Effort: High (rebuilding the application)
  Risk: Medium (well-understood requirements)

PaaS → IaaS
  When: You need more control over infrastructure
  Example: Moving from Heroku to AWS EC2 for performance
  Effort: Medium (app code stays, infra changes)
  Risk: Medium (need ops skills)

IaaS → PaaS
  When: You want to reduce operational overhead
  Example: Moving from EC2 to Elastic Beanstalk
  Effort: Low-Medium (simplify infra, may refactor)
  Risk: Low (reducing complexity)

IaaS → Serverless
  When: You want event-driven, auto-scaling architecture
  Example: Breaking a monolith into Lambda functions
  Effort: High (significant refactoring)
  Risk: High (architectural changes)

Serverless → PaaS/IaaS
  When: You hit serverless limitations (cold starts, timeouts)
  Example: Moving from Lambda to ECS/Fargate for long tasks
  Effort: Medium (consolidate functions into services)
  Risk: Low-Medium
```

### Migration Decision Matrix

| From → To    | Effort | Risk   | Common Reason                          |
|--------------|--------|--------|----------------------------------------|
| SaaS → PaaS  | High   | Medium | Outgrew SaaS capabilities              |
| PaaS → IaaS  | Medium | Medium | Need infrastructure control            |
| IaaS → PaaS  | Medium | Low    | Reduce ops overhead                    |
| IaaS → Serverless | High | High | Want event-driven auto-scaling     |
| Serverless → PaaS | Medium | Low | Hit execution limits              |
| Monolith → Microservices | High | High | Scalability & team autonomy  |

### Gradual Migration Strategy

```
Phase 1: Assess
  ├── Document current architecture
  ├── Identify pain points
  ├── Define target state
  └── Calculate TCO for both models

Phase 2: Pilot
  ├── Migrate one non-critical workload
  ├── Measure performance and cost
  ├── Train team on new model
  └── Document lessons learned

Phase 3: Migrate
  ├── Move workloads in priority order
  ├── Run parallel environments during transition
  ├── Validate each migration
  └── Decommission old infrastructure

Phase 4: Optimize
  ├── Right-size resources
  ├── Implement cost monitoring
  ├── Automate operations
  └── Continuously evaluate model fit
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: "IaaS Everything"

```
❌ Problem:
  Using IaaS for every workload because "we might need control."

  Result:
  - Huge ops overhead managing VMs for simple web apps
  - Unpatched servers become security risks
  - Team spends 70% of time on infrastructure

✅ Solution:
  Start with the HIGHEST abstraction (SaaS → Serverless → PaaS)
  and move DOWN only when you hit real limitations.
```

### Anti-Pattern 2: "Serverless Everything"

```
❌ Problem:
  Forcing every workload into Lambda/Functions because
  "serverless is the future."

  Result:
  - Long-running processes time out
  - Cold starts cause latency issues
  - Complex orchestration nightmares
  - Debugging distributed functions is painful

✅ Solution:
  Use Serverless for event-driven, short-lived, stateless
  workloads. Use PaaS or containers for long-running,
  stateful, or latency-sensitive workloads.
```

### Anti-Pattern 3: "Premature Multi-Cloud"

```
❌ Problem:
  Using multiple cloud providers from day one "to avoid
  vendor lock-in."

  Result:
  - 3x the complexity
  - Lowest-common-denominator features
  - Team must learn multiple platforms
  - Higher costs from cross-cloud data transfer

✅ Solution:
  Start with one provider. Use cloud-agnostic abstractions
  (containers, Terraform) where practical. Consider
  multi-cloud only when you have a specific business reason.
```

### Anti-Pattern 4: "Lift and Shift to PaaS"

```
❌ Problem:
  Taking a legacy monolithic application and deploying it
  directly to a PaaS without refactoring.

  Result:
  - App doesn't fit PaaS constraints (file system, ports)
  - Performance issues from PaaS overhead on legacy code
  - Can't leverage PaaS scaling features

✅ Solution:
  For lift-and-shift, use IaaS first. Then gradually
  refactor components to take advantage of PaaS features.
```

### Anti-Pattern 5: "Ignoring Total Cost of Ownership"

```
❌ Problem:
  Comparing only compute costs between models.

  Incomplete comparison:
    IaaS VM:    $100/month
    PaaS:       $150/month
    → "IaaS is cheaper!"

✅ Solution:
  Include ALL costs:
    IaaS:
      Compute:           $100/month
      Sysadmin time:     $2,000/month (proportional)
      Patching tools:    $50/month
      Monitoring:        $30/month
      Security scanning: $40/month
      Total:             $2,220/month

    PaaS:
      Platform:          $150/month
      Total:             $150/month

  → PaaS is actually 15x cheaper when you include labor!
```

---

## Industry-Specific Recommendations

| Industry          | Primary Model    | Reason                                          |
|-------------------|------------------|-------------------------------------------------|
| **Startups**      | PaaS + Serverless| Fast iteration, low ops overhead                |
| **Enterprise**    | IaaS + PaaS mix  | Control where needed, managed where possible    |
| **Healthcare**    | IaaS or PaaS     | Compliance control, data residency              |
| **Finance**       | IaaS             | Low latency, regulatory requirements            |
| **Media/Gaming**  | PaaS + Serverless| Spiky traffic, CDN-heavy workloads              |
| **Government**    | IaaS (GovCloud)  | Strict compliance, air-gapped environments      |
| **Education**     | SaaS + PaaS      | Limited IT staff, standard needs                |
| **Retail**        | PaaS + Serverless| Seasonal traffic spikes, event-driven           |

---

## Comparison Summary Table

| Criteria              | IaaS           | PaaS           | Serverless      | SaaS           |
|-----------------------|----------------|----------------|-----------------|----------------|
| **Control**           | Maximum        | Moderate       | Minimal         | None           |
| **Flexibility**       | Highest        | High           | Medium          | Lowest         |
| **Ops Overhead**      | Highest        | Low            | Minimal         | None           |
| **Time-to-Market**    | Slowest        | Fast           | Fastest (small) | Immediate      |
| **Scaling**           | Manual/Auto    | Auto           | Auto (to zero)  | Provider       |
| **Cost (small)**      | Higher         | Moderate       | Lowest          | Per user       |
| **Cost (large)**      | Lowest/unit    | Moderate       | Can be high     | Highest/unit   |
| **Vendor Lock-in**    | Lowest         | Medium         | Highest         | Highest        |
| **Compliance Control**| Full           | Partial        | Limited         | Depends        |
| **Skills Required**   | DevOps heavy   | Dev focused    | Dev focused     | Business/IT    |

---

## Summary

| Concept | Recommendation |
|---------|----------------|
| **Start high** | Begin with the highest abstraction that meets your needs |
| **Control** | Only move to IaaS when PaaS/Serverless limits you |
| **Skills** | Match the model to your team's capabilities |
| **Cost** | Include labor and operational costs, not just compute |
| **Migration** | Plan for gradual migration, not big-bang switches |
| **Anti-patterns** | Avoid "IaaS everything" and "Serverless everything" |
| **Compliance** | Let regulatory requirements guide your model choice |

---

## Practice Exercises

**Exercise 1: Model Selection**

For each scenario, recommend a service model and justify your choice:

```
1. A university wants to set up email for 50,000 students.

2. A machine learning team needs GPU-accelerated VMs with
   custom CUDA drivers for model training.

3. A mobile app startup needs a backend API that handles
   100 requests/day now but could grow to 1M/day.

4. A hospital needs to store and process patient records
   with strict HIPAA compliance.

5. A marketing agency wants to build landing pages quickly
   for different client campaigns.
```

<details>
<summary>Click to see answers</summary>

```
1. SaaS (Google Workspace or Microsoft 365)
   → Standard email, no development needed, per-user pricing

2. IaaS (AWS EC2 P-series or GCP GPU VMs)
   → Need custom drivers, OS-level GPU access

3. Serverless (AWS Lambda + API Gateway)
   → Low traffic now, scales automatically, pay-per-request

4. IaaS or PaaS with compliance controls
   → Need BAA, data residency, encryption control,
     audit logging

5. SaaS (Webflow, Squarespace, or WordPress.com)
   → No developers, need fast turnaround, visual builder
```

</details>

**Exercise 2: TCO Calculation**

Compare the total cost of ownership for running a web application:

```
Given:
  - Application: Node.js API with PostgreSQL database
  - Traffic: 10,000 requests/day (steady)
  - Team: 2 developers
  - Sysadmin hourly rate: $75/hour

Calculate monthly cost for:
  a) IaaS (EC2 t3.medium + RDS)
  b) PaaS (AWS App Runner + RDS)
  c) Serverless (Lambda + Aurora Serverless)

Include:
  - Compute costs
  - Database costs
  - Estimated sysadmin hours per month
  - Total monthly cost
```

**Exercise 3: Migration Plan**

Design a migration plan for the following scenario:

```
Your company runs a monolithic Java application on
physical servers in a co-located data center. The CEO
wants to move to the cloud within 12 months.

Current state:
  - 5 physical servers
  - Oracle Database
  - 500 GB of application data
  - 50 internal users
  - Custom authentication system
  - No CI/CD pipeline

Create a phased migration plan:
  1. Which service model for each component?
  2. What order should you migrate?
  3. What risks exist at each phase?
  4. How will you validate the migration?
```

---

## Further Reading

- AWS Well-Architected Framework — choosing the right services
- Azure Architecture Center — application platform guidance
- Google Cloud Architecture Framework — design considerations
- The Twelve-Factor App methodology (12factor.net)
