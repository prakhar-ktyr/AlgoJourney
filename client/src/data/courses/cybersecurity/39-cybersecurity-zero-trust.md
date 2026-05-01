---
title: Zero Trust Architecture
---

# Zero Trust Architecture

**Zero Trust** is a security model based on the principle: **"Never trust, always verify."** Unlike traditional perimeter security (castle-and-moat), Zero Trust assumes that threats exist both outside and inside the network. Every access request is fully authenticated, authorized, and encrypted regardless of origin.

---

## Traditional vs Zero Trust Security

| Aspect | Traditional (Perimeter) | Zero Trust |
|--------|------------------------|------------|
| Trust model | Trust inside the firewall | Trust no one by default |
| Verification | At network boundary only | Every request, every time |
| Lateral movement | Easy once inside | Blocked by micro-segmentation |
| VPN dependency | Heavy reliance on VPN | VPN optional or eliminated |
| Assumption | Internal network is safe | Breach is assumed |

---

## Core Principles of Zero Trust

| Principle | Description |
|-----------|-------------|
| **Verify explicitly** | Authenticate and authorize based on all available data points |
| **Least privilege access** | Grant minimum permissions, just-in-time and just-enough |
| **Assume breach** | Minimize blast radius, segment access, verify end-to-end encryption |

---

## Zero Trust Components

```
┌─────────────────────────────────────────────────────┐
│                   Policy Engine                       │
│   (decides allow/deny based on context signals)      │
└──────────┬───────────────────────────┬──────────────┘
           │                           │
    ┌──────▼──────┐            ┌──────▼──────┐
    │   Identity   │            │   Device     │
    │   Provider   │            │   Health     │
    └──────┬──────┘            └──────┬──────┘
           │                           │
    ┌──────▼───────────────────────────▼──────┐
    │          Policy Enforcement Point        │
    │   (proxy/gateway that enforces decisions)│
    └──────────────────┬──────────────────────┘
                       │
              ┌────────▼────────┐
              │   Application   │
              │   / Resource    │
              └─────────────────┘
```

---

## Identity-Centric Security

In Zero Trust, **identity** replaces the network perimeter as the primary security boundary.

| Signal | Used For |
|--------|----------|
| User identity (verified via MFA) | Authentication |
| Device health and compliance | Device trust |
| Location and IP reputation | Risk scoring |
| Requested resource sensitivity | Access tier |
| Time of access | Anomaly detection |
| Behavioral analytics | Continuous validation |

### Continuous Verification

```
Traditional: Authenticate once → access for session duration
Zero Trust:  Authenticate → verify continuously → re-authenticate on risk change
```

---

## Micro-Segmentation

Instead of a flat network where compromising one system gives access to everything, micro-segmentation divides the network into small, isolated zones.

| Approach | Granularity | Example |
|----------|-------------|---------|
| Network segmentation | Subnet-level | VLANs separating departments |
| Micro-segmentation | Workload-level | Each service can only talk to its direct dependencies |
| Nano-segmentation | Process-level | Individual processes have network policies |

### Example Policy

```yaml
# Service A can only communicate with Service B on port 443
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-service-a-to-b
spec:
  podSelector:
    matchLabels:
      app: service-b
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: service-a
      ports:
        - port: 443
```

---

## BeyondCorp Model (Google)

Google's **BeyondCorp** is a real-world Zero Trust implementation that eliminates the corporate VPN.

| Traditional Corporate Access | BeyondCorp |
|-----------------------------|------------|
| Connect to VPN → access internal apps | Access apps directly from any network |
| Network location = trust | Device trust + user identity = access |
| Single perimeter firewall | Per-application access proxy |

### BeyondCorp Components

| Component | Function |
|-----------|----------|
| **Device Inventory** | Tracks all corporate devices and their state |
| **Device Trust** | Assesses device health (patched, encrypted, managed) |
| **Access Proxy** | Sits in front of every application |
| **Access Control Engine** | Grants access based on user + device + context |
| **SSO with MFA** | Strong authentication for every access request |

---

## Implementing Zero Trust — Step by Step

| Step | Action |
|------|--------|
| 1 | **Identify your protect surface** — critical data, assets, applications, services |
| 2 | **Map transaction flows** — understand how traffic moves between resources |
| 3 | **Build a Zero Trust architecture** — place enforcement points between resources |
| 4 | **Create Zero Trust policies** — who/what/when/where/why/how for every access request |
| 5 | **Monitor and maintain** — continuous logging, analytics, and policy refinement |

### Quick Wins

| Action | Impact |
|--------|--------|
| Enforce MFA everywhere | Blocks credential-only attacks |
| Implement least privilege | Limits blast radius |
| Encrypt all traffic (even internal) | Prevents eavesdropping |
| Deploy endpoint detection (EDR) | Continuous device assessment |
| Use identity-aware proxies | Per-app access control |

---

## Zero Trust for Applications

```javascript
// Example: Per-request authorization check
async function handleRequest(req) {
  // 1. Verify identity token
  const user = await verifyToken(req.headers.authorization);

  // 2. Check device posture
  const device = await checkDeviceHealth(req.headers["x-device-id"]);

  // 3. Evaluate risk score
  const risk = calculateRisk(user, device, req.ip, req.geo);

  // 4. Enforce policy
  if (risk > THRESHOLD || !device.compliant) {
    return { status: 403, body: "Access denied — device non-compliant" };
  }

  // 5. Grant minimal access
  return fetchResource(req.path, user.permissions);
}
```

---

## Common Challenges

| Challenge | Mitigation |
|-----------|------------|
| Legacy applications lack modern auth | Use access proxies in front of legacy apps |
| User friction from repeated verification | Risk-based authentication (only challenge on high risk) |
| Complexity of implementation | Start with critical assets, expand gradually |
| Performance overhead | Cache trust decisions for short periods |
| Organizational resistance | Start with a pilot team/application |

---

## Key Takeaways

- Zero Trust eliminates implicit trust based on network location — every access request is verified.
- Identity (not the network) is the new perimeter; combine user identity, device health, and context signals.
- Micro-segmentation limits lateral movement even after a breach.
- Google's BeyondCorp proves Zero Trust works at scale, replacing VPNs with identity-aware proxies.
- Implement incrementally: start with MFA, least privilege, and critical asset protection.

---

[Next: Operating System Security](40-cybersecurity-os-security)
