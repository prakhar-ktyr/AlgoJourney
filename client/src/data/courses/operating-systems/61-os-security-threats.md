---
title: Security Threats & Attacks
section: "Security & Protection"
---

# Security Threats & Attacks

While protection mechanisms define _who can access what_, security is about defending against **deliberate attempts to violate those policies**. From viruses that spread through email to buffer overflow exploits that grant attackers root access, understanding threats is the first step to building secure systems. This lesson catalogs the major categories of security threats, explains how they work, and surveys the defenses available.

---

## Security Goals: The CIA Triad

Every security system aims to protect three fundamental properties:

| Property            | Definition                                    | Violation Example                  |
| ------------------- | --------------------------------------------- | ---------------------------------- |
| **Confidentiality** | Only authorized parties can read data         | Attacker reads your private emails |
| **Integrity**       | Only authorized parties can modify data       | Attacker alters your bank balance  |
| **Availability**    | System remains accessible to authorized users | DDoS attack takes down a website   |

```text
         ┌──────────────────┐
         │  Confidentiality │
         │  (no unauthorized │
         │   reading)        │
         └────────┬─────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐  ┌─────────┐  ┌──────────┐
│Integrity│  │   CIA   │  │Availability
│(no unauth│ │  Triad  │  │(system up)│
│ changes) │ │         │  │           │
└──────────┘ └─────────┘  └───────────┘
```

Additional security properties sometimes considered:

| Property            | Description                                 |
| ------------------- | ------------------------------------------- |
| **Authentication**  | Verify identity of a user or system         |
| **Non-repudiation** | Sender cannot deny having sent a message    |
| **Accountability**  | Actions can be traced to responsible entity |

---

## Threat Taxonomy: Malware

**Malware** (malicious software) is any software designed to harm, exploit, or compromise a system.

| Malware Type     | Self-Replicating? | Needs Host?                   | Propagation                             | Primary Payload                      |
| ---------------- | ----------------- | ----------------------------- | --------------------------------------- | ------------------------------------ |
| **Virus**        | Yes               | Yes — attaches to program     | Infected files shared by users          | Data destruction, corruption         |
| **Worm**         | Yes               | No — standalone program       | Network — exploits vulnerabilities      | Resource exhaustion, backdoors       |
| **Trojan Horse** | No                | Yes — disguised as legitimate | User installs willingly                 | Backdoor, data theft                 |
| **Ransomware**   | Sometimes         | No                            | Phishing emails, exploits               | Encrypts files, demands payment      |
| **Rootkit**      | No                | Yes — modifies OS             | Installed after initial compromise      | Hides attacker presence              |
| **Spyware**      | No                | Yes                           | Bundled with software                   | Monitor activity, steal data         |
| **Adware**       | No                | Yes                           | Bundled with software                   | Display unwanted ads                 |
| **Keylogger**    | No                | Yes                           | Installed by malware or physical access | Record keystrokes, steal passwords   |
| **Logic Bomb**   | No                | Yes — embedded in code        | Already in system, waits for trigger    | Activated on condition (date, event) |
| **Botnet Agent** | Sometimes         | No                            | Worms, trojans                          | DDoS attacks, spam, crypto mining    |

### How Each Type Works

**Virus lifecycle:**

```text
1. Infection: Virus attaches to host program
   [clean.exe] + [virus code] → [infected.exe]

2. Activation: User runs infected program
   [infected.exe] → virus code executes first

3. Propagation: Virus infects other programs
   virus → scans for other .exe files → infects them

4. Payload: Virus delivers its damage
   Delete files, corrupt data, display message
```

**Worm propagation:**

```text
Worm on Host A                 Vulnerable Host B
┌──────────────┐               ┌──────────────┐
│ 1. Scan for  │               │              │
│    targets   │──── probe ───▶│ Open port 445│
│ 2. Exploit   │               │              │
│    vuln      │── exploit ───▶│ Buffer       │
│              │               │ overflow!    │
│ 3. Transfer  │               │              │
│    copy      │── worm copy─▶│ 4. Worm runs │
│              │               │    on Host B │
└──────────────┘               └──────────────┘
                                     │
                                     ├── Scan for Host C, D, E...
                                     └── (exponential spread)
```

---

## Program Threats

### Buffer Overflow Attack

The **buffer overflow** is one of the most dangerous and historically prevalent attacks. It exploits C/C++ programs that don't check array bounds.

```c
// VULNERABLE CODE — never write this!
#include <string.h>

void vulnerable_function(char *user_input) {
    char buffer[64];               // Stack buffer: 64 bytes
    strcpy(buffer, user_input);    // NO bounds check!
    // If user_input > 64 bytes → overflows the buffer
}

int main() {
    char attack[256];
    // Fill with 200 bytes — overflows the 64-byte buffer
    memset(attack, 'A', 200);
    vulnerable_function(attack);
    return 0;
}
```

**Stack layout before and after overflow:**

```text
Before strcpy():                    After strcpy() with overflow:

High Address                        High Address
┌──────────────────┐                ┌──────────────────┐
│  Return Address  │ 0xBFFF1234     │  0x41414141      │ ← OVERWRITTEN!
├──────────────────┤                ├──────────────────┤
│  Saved EBP       │                │  0x41414141      │ ← OVERWRITTEN!
├──────────────────┤                ├──────────────────┤
│                  │                │  AAAAAAAAAA...   │
│  buffer[64]      │                │  AAAAAAAAAA...   │
│  (64 bytes)      │                │  AAAAAAAAAA...   │
│                  │                │  AAAAAAAAAA...   │
├──────────────────┤                ├──────────────────┤
│  ...             │                │  ...             │
Low Address                         Low Address

The return address now points to attacker-chosen location!
When the function returns, CPU jumps to attacker's code.
```

> [!WARNING]
> Buffer overflows have been responsible for some of the worst security breaches in computing history, including the Morris Worm (1988), Code Red (2001), and Slammer (2003).

**Defenses against buffer overflow:**

| Defense             | Mechanism                                                        | Limitations                                  |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| **Stack Canaries**  | Place random value before return address; check before return    | Can be bypassed if canary value is leaked    |
| **ASLR**            | Randomize memory layout each execution                           | Information leaks reveal addresses           |
| **DEP/NX bit**      | Mark stack as non-executable                                     | Doesn't prevent return-to-libc/ROP           |
| **Safe functions**  | Use `strncpy()`, `snprintf()` instead of `strcpy()`, `sprintf()` | Programmer must remember to use them         |
| **Bounds checking** | Use languages with bounds checking (Rust, Go, Java)              | Performance overhead; legacy code still in C |

### Code Injection Attacks

| Attack Type           | Target            | Example                           |
| --------------------- | ----------------- | --------------------------------- |
| **SQL Injection**     | Database queries  | `' OR '1'='1` bypasses login      |
| **Command Injection** | Shell commands    | `; rm -rf /` appended to input    |
| **Format String**     | `printf()`-family | `%x%x%x%n` reads/writes memory    |
| **XSS**               | Web browsers      | `<script>steal_cookie()</script>` |

```c
// SQL Injection example
// VULNERABLE:
char query[256];
sprintf(query, "SELECT * FROM users WHERE name='%s'", user_input);
// If user_input = "'; DROP TABLE users;--"
// Query becomes: SELECT * FROM users WHERE name=''; DROP TABLE users;--'

// SAFE: Use parameterized queries
// prepare("SELECT * FROM users WHERE name=?", user_input);
```

### Return-Oriented Programming (ROP)

When the stack is non-executable (DEP/NX), attackers chain together small sequences of existing code called **gadgets**:

```text
Normal execution:
  function A → return → function B → return → ...

ROP attack:
  gadget 1 (pop eax; ret) →
  gadget 2 (mov [ebx], eax; ret) →
  gadget 3 (int 0x80; ret) →
  ... chains into system call execution

Each "gadget" is a few instructions ending in RET,
already present in the program or libraries.
```

---

## System Threats

### Denial of Service (DoS / DDoS)

| Type                  | Mechanism                                           | Mitigation                      |
| --------------------- | --------------------------------------------------- | ------------------------------- |
| **SYN Flood**         | Send many TCP SYN packets, never complete handshake | SYN cookies, rate limiting      |
| **Amplification**     | Use DNS/NTP to amplify traffic volume               | Ingress filtering, BCP38        |
| **Application-layer** | Send expensive requests (complex queries)           | Rate limiting, WAF              |
| **DDoS**              | Coordinate attack from thousands of bots            | CDN, traffic scrubbing, Anycast |

### Side-Channel Attacks

| Attack              | Exploits                     | Impact                                 |
| ------------------- | ---------------------------- | -------------------------------------- |
| **Spectre** (2018)  | Speculative execution in CPU | Read arbitrary memory across processes |
| **Meltdown** (2018) | Out-of-order execution       | Read kernel memory from user space     |
| **Timing attacks**  | Execution time differences   | Infer secret keys from response times  |
| **Power analysis**  | Power consumption patterns   | Extract cryptographic keys             |

```text
Spectre Attack (simplified):

1. Attacker trains branch predictor:
   if (x < array1_size)         ← true many times → predictor learns "take branch"
       y = array2[array1[x]]

2. Attacker provides x = secret_offset (out of bounds)
   CPU speculatively executes:  array1[secret_offset] → reads secret byte
                                array2[secret_byte]   → loads into cache

3. Speculative execution is rolled back, but...
   Cache side-effect REMAINS:   array2[secret_byte] is now cached

4. Attacker probes cache timing for each possible value:
   Timing of array2[0]: slow → not the secret
   Timing of array2[42]: FAST → secret byte = 42!
```

### Privilege Escalation

| Type           | Description                            | Example                     |
| -------------- | -------------------------------------- | --------------------------- |
| **Vertical**   | User gains higher privileges           | Regular user → root         |
| **Horizontal** | User accesses another user's resources | User A reads User B's files |

---

## Network Threats

| Threat                | Mechanism                           | Defense                                 |
| --------------------- | ----------------------------------- | --------------------------------------- |
| **Packet Sniffing**   | Capture unencrypted network traffic | Use TLS/HTTPS encryption                |
| **IP Spoofing**       | Forge source IP address             | Ingress filtering, TCP sequence numbers |
| **DNS Poisoning**     | Insert false DNS records            | DNSSEC, DNS-over-HTTPS                  |
| **ARP Spoofing**      | Link attacker's MAC to victim's IP  | Static ARP entries, 802.1X              |
| **Man-in-the-Middle** | Intercept and modify communications | Certificate pinning, mutual TLS         |

```text
Man-in-the-Middle Attack:

Normal:     Alice ◄──────────────────────► Bob
                    encrypted channel

MITM:       Alice ◄──── Mallory ────► Bob
            Alice thinks she's        Bob thinks he's
            talking to Bob            talking to Alice

            Mallory can read and modify all messages!
```

---

## Social Engineering

Social engineering attacks exploit **human psychology** rather than technical vulnerabilities.

| Attack             | Method                                          | Example                                        |
| ------------------ | ----------------------------------------------- | ---------------------------------------------- |
| **Phishing**       | Fake emails/websites mimicking trusted entities | "Your bank account is locked — click here"     |
| **Spear Phishing** | Targeted phishing at specific individuals       | Email to CEO pretending to be CFO              |
| **Pretexting**     | Create fabricated scenario to extract info      | Call IT desk pretending to be employee         |
| **Baiting**        | Leave infected USB drives in public places      | "Salary Info.xlsx" on a USB in the parking lot |
| **Tailgating**     | Follow authorized person through secured door   | Walk in behind employee with badge             |

> [!IMPORTANT]
> Social engineering is often the **most effective** attack vector. Technical defenses are useless if an employee gives away their password. Security awareness training is essential.

---

## Defense-in-Depth

No single defense is sufficient. The principle of **defense in depth** layers multiple protections so that a breach of one layer doesn't compromise the system.

```text
┌──────────────────────────────────────────────────────┐
│                Physical Security                      │
│  (locked rooms, badge access, cameras)                │
│  ┌──────────────────────────────────────────────────┐│
│  │            Network Security                       ││
│  │  (firewalls, IDS/IPS, network segmentation)       ││
│  │  ┌──────────────────────────────────────────────┐││
│  │  │          Host Security                        │││
│  │  │  (OS hardening, patching, antivirus)           │││
│  │  │  ┌──────────────────────────────────────────┐│││
│  │  │  │        Application Security               ││││
│  │  │  │  (input validation, secure coding)         ││││
│  │  │  │  ┌──────────────────────────────────────┐│││
│  │  │  │  │          Data Security                ││││
│  │  │  │  │  (encryption, access control, backup) ││││
│  │  │  │  │  ┌──────────────────────────────────┐│││││
│  │  │  │  │  │     PROTECTED ASSET              ││││││
│  │  │  │  │  │     (your data)                  ││││││
│  │  │  │  │  └──────────────────────────────────┘│││││
│  │  │  │  └──────────────────────────────────────┘││││
│  │  │  └──────────────────────────────────────────┘│││
│  │  └──────────────────────────────────────────────┘││
│  └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### Threat-to-Defense Mapping

| Threat               | Primary Defense                     | Secondary Defense                  |
| -------------------- | ----------------------------------- | ---------------------------------- |
| Buffer Overflow      | ASLR + DEP + stack canaries         | Safe languages (Rust), code review |
| SQL Injection        | Parameterized queries               | Input validation, WAF              |
| Malware              | Antivirus, application whitelisting | Sandboxing, least privilege        |
| DDoS                 | CDN, traffic scrubbing              | Rate limiting, Anycast             |
| Password theft       | MFA, salted hashing                 | Account lockout, monitoring        |
| Phishing             | Security awareness training         | Email filtering, DMARC             |
| Privilege escalation | Least privilege, capabilities       | SELinux/AppArmor, audit logging    |
| MITM                 | TLS/HTTPS, certificate pinning      | Mutual authentication              |
| Spectre/Meltdown     | Kernel patches (KPTI), microcode    | Process isolation, site isolation  |
| Rootkit              | Secure Boot, TPM                    | Integrity monitoring (AIDE, OSSEC) |

---

## Try It Yourself

**Exercise 1:** A programmer writes this C function. Identify the vulnerability and explain how an attacker could exploit it:

```c
void greet(char *name) {
    char greeting[128];
    sprintf(greeting, "Hello, %s! Welcome.\n", name);
    printf(greeting);
}
```

:::details Solution
There are **two vulnerabilities:**

1. **Buffer overflow**: `sprintf()` doesn't check bounds. If `name` is longer than ~110 characters, it overflows `greeting[128]`, potentially overwriting the return address.

2. **Format string vulnerability**: The `printf(greeting)` call uses user-controlled data as the format string! If `name` contains format specifiers like `%x`, `%s`, or `%n`, the attacker can read from or write to the stack.

**Fix:**

```c
void greet(char *name) {
    char greeting[128];
    snprintf(greeting, sizeof(greeting), "Hello, %s! Welcome.\n", name);
    printf("%s", greeting);  // ALWAYS use format string with printf
}
```

:::

**Exercise 2:** Classify each of the following as a threat to Confidentiality, Integrity, Availability, or multiple:
a) Ransomware encrypts all files
b) An employee reads another employee's salary data
c) A worm consumes all network bandwidth
d) An attacker modifies a database record

:::details Solution
a) **Availability** (files are inaccessible) and **Confidentiality** (attacker may exfiltrate data before encrypting). Some also argue Integrity since the encryption modifies the files.

b) **Confidentiality** — unauthorized reading of sensitive data.

c) **Availability** — legitimate users cannot use the network.

d) **Integrity** — unauthorized modification of data.
:::

**Exercise 3:** Why is ASLR (Address Space Layout Randomization) not a complete defense against buffer overflow attacks?

:::details Solution
ASLR randomizes the positions of the stack, heap, and libraries in memory, making it harder for attackers to predict where their injected code or ROP gadgets are located. However, ASLR can be defeated by:

1. **Information leaks**: If any vulnerability reveals a memory address (e.g., a format string bug that prints stack contents), the attacker can calculate the ASLR offset and adjust their attack.

2. **Brute force**: On 32-bit systems, ASLR typically provides only 8-16 bits of entropy (~256 to ~65,536 possible layouts). An attacker can try all possibilities in seconds.

3. **Partial overwrites**: Overwriting only the least-significant bytes of an address may succeed regardless of ASLR, since those bytes are often not randomized.

4. **Return-to-PLT**: The Procedure Linkage Table (PLT) is at a known offset within the executable, which may not be fully randomized.

This is why ASLR must be combined with DEP, stack canaries, and other defenses (defense in depth).
:::

---

## Key Takeaways

- The **CIA triad** (Confidentiality, Integrity, Availability) defines the fundamental security goals every system must protect
- **Malware** encompasses viruses (host-dependent), worms (self-replicating via network), trojans (disguised as legitimate), ransomware (encrypts for ransom), rootkits (hide attacker presence), and more
- **Buffer overflow** is one of the most dangerous program threats — it overwrites the return address to hijack control flow; defenses include ASLR, DEP/NX, stack canaries, and memory-safe languages
- **Code injection** (SQL, command, format string) exploits programs that mix data and code; parameterized queries and input validation are essential defenses
- **Side-channel attacks** (Spectre, Meltdown) exploit hardware implementation details, not software bugs — they require both software patches and microcode updates
- **Social engineering** targets humans, not computers — phishing and pretexting are often more effective than technical exploits
- **Defense in depth** layers multiple defenses (physical → network → host → application → data) so no single failure compromises the system
- Every threat should be mapped to specific defenses; no single mechanism is sufficient against all attack vectors
