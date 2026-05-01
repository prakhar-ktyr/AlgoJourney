---
title: Wireless Network Security
---

# Wireless Network Security

Wireless networks broadcast signals that anyone nearby can intercept — securing them requires specific controls.

---

## Wi-Fi Security Protocols

| Protocol | Year | Security | Status |
|----------|------|----------|--------|
| **WEP** | 1997 | Broken | Never use |
| **WPA** | 2003 | Weak (TKIP) | Deprecated |
| **WPA2** | 2004 | Strong (AES) | Standard |
| **WPA3** | 2018 | Strongest | Recommended |

### WPA3 improvements:
- **SAE** (Simultaneous Authentication of Equals) — resistant to offline dictionary attacks
- **Forward secrecy** — past sessions can't be decrypted if key is compromised
- **192-bit security suite** for enterprise
- **Protected Management Frames** mandatory

---

## Common Wireless Attacks

### Evil Twin
Attacker creates a fake access point with same SSID:
- Victim connects to attacker's AP
- All traffic passes through attacker (MitM)
- Credential theft, session hijacking

### Deauthentication Attack
Force devices to disconnect:
- Send forged deauth frames (unencrypted in WPA2)
- Device reconnects — attacker captures handshake
- WPA3 fixes this with Protected Management Frames

### WPA2 Handshake Capture
- Capture the 4-way handshake
- Offline brute-force the password
- Tools: aircrack-ng, hashcat

### KRACK Attack (2017)
- Key Reinstallation Attack against WPA2
- Allowed decryption of traffic
- Patched — update firmware

### Rogue Access Points
- Unauthorized AP connected to corporate network
- Bypasses network security controls
- Employees plugging in personal routers

---

## Securing Wireless Networks

### For Home:
- Use WPA3 (or WPA2 with a strong password — 20+ characters)
- Change default router credentials
- Disable WPS (Wi-Fi Protected Setup) — easily brute-forced
- Update router firmware regularly
- Hide SSID (minor deterrent, not real security)

### For Enterprise:
- **WPA3-Enterprise** with 802.1X authentication (RADIUS)
- **Certificate-based authentication** (no passwords)
- **Wireless IDS** to detect rogue APs and attacks
- Separate **guest network** isolated from corporate
- **MAC filtering** (easily bypassed but adds a layer)
- Regular **wireless audits** and pen tests

---

## 802.1X Authentication

Enterprise wireless authentication:

```
[Client] ←→ [Access Point] ←→ [RADIUS Server] ←→ [User Database]
   │              │                    │
Supplicant   Authenticator      Authentication Server
```

- Each user authenticates individually
- Dynamic encryption keys per session
- Central management of access
- Can revoke individual users

---

## Key Takeaways

- Use **WPA3** wherever possible, WPA2 with strong passwords as minimum
- **Evil twin** and **deauth** attacks are common and easy to execute
- Enterprise networks should use **802.1X** with RADIUS
- **Rogue AP detection** is essential for corporate environments
- Physical proximity is all an attacker needs — no remote exploit required

---

Next, we'll learn about **DDoS Attacks & Mitigation** →
