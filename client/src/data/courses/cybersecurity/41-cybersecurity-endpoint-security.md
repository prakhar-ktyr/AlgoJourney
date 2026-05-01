---
title: Endpoint Security
---

# Endpoint Security

An **endpoint** is any device that connects to a network — laptops, desktops, smartphones, servers, IoT devices. Endpoint security protects these devices from threats that can compromise the entire organization.

---

## Why Endpoint Security Matters

Endpoints are the most common entry point for attackers. A single compromised laptop can give an adversary access to an entire corporate network.

| Threat Vector | Example |
|---|---|
| Phishing email | User opens malicious attachment on workstation |
| USB drive | Infected removable media auto-runs malware |
| Unpatched software | Exploiting a known vulnerability on a server |
| Shadow IT | Unauthorized app installs bypass security controls |

---

## Antivirus vs EDR

### Traditional Antivirus (AV)

Traditional antivirus relies on **signature-based detection** — it compares files against a database of known malware hashes.

| Feature | Traditional AV |
|---|---|
| Detection method | Signature matching |
| Updates | Requires frequent signature updates |
| Zero-day protection | Limited |
| Visibility | File-level scanning |
| Response | Quarantine or delete file |

### Endpoint Detection and Response (EDR)

EDR goes far beyond signature matching. It continuously monitors endpoint activity, collects telemetry, and uses behavioral analysis to detect threats.

| Feature | EDR |
|---|---|
| Detection method | Behavioral analysis + signatures + ML |
| Visibility | Process trees, network connections, file changes, registry modifications |
| Response | Isolate host, kill process, rollback changes, remote shell |
| Forensics | Full timeline of endpoint activity |
| Hunting | Proactive threat hunting across all endpoints |

### Comparison Table

| Capability | Antivirus | EDR |
|---|---|---|
| Known malware | ✅ | ✅ |
| Unknown/zero-day malware | ❌ | ✅ |
| Fileless attacks | ❌ | ✅ |
| Lateral movement detection | ❌ | ✅ |
| Incident investigation | ❌ | ✅ |
| Automated response | Limited | ✅ |

Popular EDR solutions: CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne, Carbon Black.

---

## Host-Based Firewalls

A host-based firewall controls inbound and outbound traffic on a single device, unlike network firewalls that protect entire segments.

### Windows Firewall Example

```powershell
# Block all inbound connections on port 4444 (common reverse shell port)
New-NetFirewallRule -DisplayName "Block Reverse Shell" `
  -Direction Inbound -LocalPort 4444 -Protocol TCP -Action Block

# Allow only specific application to access the internet
New-NetFirewallRule -DisplayName "Allow Browser" `
  -Direction Outbound -Program "C:\Program Files\Mozilla Firefox\firefox.exe" -Action Allow
```

### Linux iptables Example

```bash
# Drop all incoming connections except SSH and HTTP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp -j DROP

# Log dropped packets for monitoring
iptables -A INPUT -j LOG --log-prefix "DROPPED: "
```

### Best Practices

- Default-deny inbound connections
- Allow only necessary outbound ports
- Log denied traffic for threat detection
- Regularly review and audit rules

---

## Application Whitelisting

Application whitelisting (allowlisting) permits only approved applications to execute. Everything else is blocked by default.

| Approach | Description | Security Level |
|---|---|---|
| Blacklisting | Block known-bad applications | Low |
| Whitelisting | Allow only known-good applications | High |
| Graylisting | Unknown apps run in sandbox | Medium |

### Implementation Methods

1. **Path-based** — Allow executables from specific directories (e.g., `C:\Program Files\`)
2. **Hash-based** — Allow only files matching specific cryptographic hashes
3. **Certificate-based** — Allow apps signed by trusted publishers
4. **Behavioral** — Allow based on expected behavior patterns

Tools: Microsoft AppLocker, Windows Defender Application Control (WDAC), Carbon Black App Control.

```xml
<!-- AppLocker rule example: allow only signed Microsoft apps -->
<RuleCollection Type="Exe" EnforcementMode="Enabled">
  <FilePublisherRule Action="Allow" UserOrGroupSid="S-1-1-0">
    <Conditions>
      <FilePublisherCondition PublisherName="O=MICROSOFT CORPORATION"
                              ProductName="*" BinaryName="*">
        <BinaryVersionRange LowSection="*" HighSection="*"/>
      </FilePublisherCondition>
    </Conditions>
  </FilePublisherRule>
</RuleCollection>
```

---

## Mobile Device Management (MDM)

MDM solutions enforce security policies on smartphones, tablets, and laptops used for work.

### Key MDM Capabilities

| Capability | Description |
|---|---|
| Remote wipe | Erase device data if lost or stolen |
| Encryption enforcement | Require full-disk encryption |
| App management | Push, restrict, or remove applications |
| Password policy | Enforce complexity and rotation |
| Geofencing | Restrict access based on location |
| Compliance monitoring | Alert on jailbroken/rooted devices |

### BYOD vs Corporate-Owned

| Aspect | BYOD | Corporate-Owned |
|---|---|---|
| Privacy | Must separate work/personal data | Full device control |
| Management | Containerized work profile | Full MDM enrollment |
| Cost | Employee-owned device | Company purchases |
| Security | Limited visibility | Complete visibility |

Popular MDM solutions: Microsoft Intune, Jamf (macOS/iOS), VMware Workspace ONE, MobileIron.

---

## Defense in Depth at the Endpoint

A layered endpoint security strategy combines multiple controls:

```
┌─────────────────────────────────────┐
│       Application Whitelisting       │  ← Only approved apps run
├─────────────────────────────────────┤
│              EDR Agent               │  ← Behavioral detection
├─────────────────────────────────────┤
│         Host-Based Firewall          │  ← Network access control
├─────────────────────────────────────┤
│        Disk Encryption (BitLocker)   │  ← Data protection at rest
├─────────────────────────────────────┤
│          OS Hardening                │  ← Remove unnecessary services
└─────────────────────────────────────┘
```

---

## Key Takeaways

- Endpoints are the #1 attack surface — every device is a potential entry point
- Traditional antivirus is no longer sufficient; EDR provides behavioral detection and response
- Host-based firewalls add a critical layer of defense with default-deny policies
- Application whitelisting prevents unauthorized code execution
- MDM enforces security policies on mobile and remote devices
- A defense-in-depth approach layers multiple endpoint controls together

---

[Next: Cloud Security Fundamentals](42-cybersecurity-cloud-security)
