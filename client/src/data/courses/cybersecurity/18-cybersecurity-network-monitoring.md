---
title: Network Monitoring & Packet Analysis
---

# Network Monitoring & Packet Analysis

Monitor network traffic to detect threats, troubleshoot issues, and understand what's happening on your network.

---

## Why Monitor?

- Detect intrusions and malicious activity
- Identify data exfiltration
- Troubleshoot performance issues
- Verify security controls work
- Meet compliance requirements
- Establish baselines for anomaly detection

---

## Packet Analysis with Wireshark

**Wireshark** is the most popular network protocol analyzer.

### Common filters:
```
# Filter by IP
ip.addr == 192.168.1.100

# Filter by port
tcp.port == 443

# HTTP requests
http.request

# DNS queries
dns

# Filter by protocol
tcp || udp

# Find cleartext passwords
http.authbasic || ftp.request.command == "PASS"

# TCP SYN packets (port scanning indicator)
tcp.flags.syn == 1 && tcp.flags.ack == 0
```

### What to look for:
- Unusual outbound connections (C2 communication)
- Large data transfers to unknown IPs (exfiltration)
- Cleartext credentials
- Port scanning patterns
- Malformed packets
- DNS tunneling (unusually large DNS queries)

---

## NetFlow / sFlow

Summarized traffic metadata (not full packet captures):

| Field | Description |
|-------|-------------|
| Source IP | Where traffic originated |
| Destination IP | Where traffic went |
| Ports | Source and destination ports |
| Protocol | TCP, UDP, ICMP |
| Bytes/Packets | Volume of traffic |
| Timestamps | When the flow occurred |

Advantages over full packet capture:
- Much less storage needed
- Faster analysis
- Good for trend analysis
- Works at high speeds

---

## Network Monitoring Tools

| Tool | Purpose |
|------|---------|
| **Wireshark** | Deep packet inspection |
| **tcpdump** | Command-line packet capture |
| **Zeek (Bro)** | Network security monitoring |
| **Nagios/Zabbix** | Infrastructure monitoring |
| **Nmap** | Network scanning and discovery |
| **ntopng** | Real-time traffic analysis |
| **ELK Stack** | Log aggregation and analysis |

---

## tcpdump Basics

```bash
# Capture all traffic on eth0
tcpdump -i eth0

# Capture traffic to/from specific host
tcpdump host 192.168.1.100

# Capture only port 80
tcpdump port 80

# Save to file for Wireshark analysis
tcpdump -w capture.pcap

# Read from file
tcpdump -r capture.pcap

# Show packet contents in ASCII
tcpdump -A port 80
```

---

## Indicators of Compromise (IoC)

What to look for in network traffic:

| Indicator | Possible Meaning |
|-----------|-----------------|
| Beaconing (regular intervals) | C2 communication |
| Large outbound data at odd hours | Data exfiltration |
| Connections to known-bad IPs | Malware communication |
| Unusual DNS patterns | DNS tunneling |
| Multiple failed connections | Scanning/lateral movement |
| Encrypted traffic on non-standard ports | Covert channel |

---

## Key Takeaways

- Network monitoring provides **visibility** into what's happening
- **Wireshark** for deep analysis; **NetFlow** for high-level trends
- Look for **anomalies**: unusual times, volumes, destinations
- **Baseline** normal traffic so you can spot deviations
- Combine full capture + flow data + logs for complete picture

---

Next, we move to **Web Application Security** — starting with the **OWASP Top 10** →
