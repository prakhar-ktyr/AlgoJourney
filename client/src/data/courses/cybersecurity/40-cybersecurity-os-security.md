---
title: Operating System Security
---

# Operating System Security

The operating system is the foundation of all software running on a machine. A compromised OS means **everything** on that system is compromised. OS security involves hardening configurations, managing access, patching vulnerabilities, and auditing activity.

---

## OS Hardening Principles

| Principle | Description |
|-----------|-------------|
| **Minimize attack surface** | Remove unnecessary software, services, and ports |
| **Least privilege** | Users and processes get only the access they need |
| **Defense in depth** | Multiple layers of security controls |
| **Fail securely** | Default to deny; errors should not open access |
| **Audit everything** | Log and monitor system activity |

---

## Hardening Linux

### Disable Unnecessary Services

```bash
# List all running services
systemctl list-units --type=service --state=running

# Disable an unnecessary service
sudo systemctl disable --now cups.service
sudo systemctl disable --now avahi-daemon.service
```

### Secure SSH Configuration

```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers deploy admin
Protocol 2
```

### Firewall Configuration (UFW)

```bash
# Default deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status verbose
```

### Kernel Hardening (sysctl)

```bash
# /etc/sysctl.d/99-security.conf
net.ipv4.conf.all.rp_filter = 1          # Reverse path filtering
net.ipv4.conf.all.accept_redirects = 0   # Ignore ICMP redirects
net.ipv4.conf.all.send_redirects = 0     # Don't send redirects
net.ipv4.icmp_echo_ignore_broadcasts = 1 # Ignore broadcast pings
kernel.randomize_va_space = 2            # Full ASLR
fs.protected_hardlinks = 1               # Hardlink protection
fs.protected_symlinks = 1                # Symlink protection
```

---

## Hardening Windows

| Setting | Location | Recommendation |
|---------|----------|----------------|
| Disable Guest account | Local Security Policy | Disabled |
| Rename Administrator | Local Security Policy | Non-obvious name |
| Enable Windows Firewall | Windows Security | All profiles ON |
| Disable SMBv1 | Features/PowerShell | `Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol` |
| Enable BitLocker | Control Panel → BitLocker | Encrypt all drives |
| Configure AppLocker | Group Policy | Whitelist allowed apps |
| Enable Credential Guard | Group Policy | Protects LSASS |

### Windows PowerShell Hardening

```powershell
# Check for SMBv1
Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Enable audit logging
auditpol /set /subcategory:"Logon" /success:enable /failure:enable

# View failed logon attempts
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} | Select-Object -First 10
```

---

## Patch Management

| Practice | Details |
|----------|---------|
| Enable automatic updates | Critical patches applied promptly |
| Test patches before deployment | Use staging environment |
| Prioritize by CVSS score | Critical (9.0+) → patch within 24–48 hours |
| Track patch status | Use vulnerability scanners |
| Have a rollback plan | Snapshots/backups before patching |

### Patch Priority Matrix

| CVSS Score | Severity | Patch Timeline |
|------------|----------|----------------|
| 9.0 – 10.0 | Critical | Within 24–48 hours |
| 7.0 – 8.9 | High | Within 1 week |
| 4.0 – 6.9 | Medium | Within 1 month |
| 0.1 – 3.9 | Low | Next maintenance window |

```bash
# Linux: Check for available security updates
sudo apt update && apt list --upgradable 2>/dev/null | grep -i security

# Apply security updates only
sudo apt-get -s dist-upgrade | grep "^Inst" | grep -i securi
sudo unattended-upgrades --dry-run
```

---

## User Management

| Practice | Implementation |
|----------|---------------|
| Unique accounts per user | No shared accounts |
| Strong password policy | Minimum 12 chars, complexity, history |
| Disable inactive accounts | Auto-disable after 30 days of inactivity |
| Separate admin accounts | Daily-use account + privileged account |
| Regular access reviews | Quarterly audit of user permissions |

```bash
# Linux: Find accounts with no password
sudo awk -F: '($2 == "" || $2 == "!") {print $1}' /etc/shadow

# Find users with UID 0 (root-level)
awk -F: '($3 == 0) {print $1}' /etc/passwd

# Lock an account
sudo usermod -L username

# Set password expiry
sudo chage -M 90 -W 14 username
```

---

## File Permissions

### Linux Permission Model

| Permission | Files | Directories |
|------------|-------|-------------|
| Read (r/4) | View contents | List files |
| Write (w/2) | Modify contents | Create/delete files |
| Execute (x/1) | Run as program | Enter directory |

```bash
# Secure sensitive files
chmod 600 ~/.ssh/id_rsa         # Owner read/write only
chmod 700 ~/.ssh                # Owner full access only
chmod 644 /etc/passwd           # World readable, owner writable
chmod 640 /etc/shadow           # Root + shadow group only

# Find world-writable files (security risk)
find / -type f -perm -o+w -not -path "/proc/*" 2>/dev/null

# Find SUID binaries (potential privilege escalation)
find / -type f -perm -4000 2>/dev/null
```

### Windows NTFS Permissions

| Permission | Allows |
|------------|--------|
| Full Control | Everything including change permissions |
| Modify | Read, write, delete |
| Read & Execute | View and run |
| Read | View only |
| Write | Create and modify |

---

## Auditing and Logging

| What to Log | Why |
|-------------|-----|
| Login attempts (success/failure) | Detect brute force |
| Privilege escalation | Detect unauthorized elevation |
| File access to sensitive data | Detect data exfiltration |
| Service starts/stops | Detect tampering |
| Configuration changes | Change tracking |

```bash
# Linux: Configure auditd
sudo apt install auditd

# Monitor /etc/passwd for changes
sudo auditctl -w /etc/passwd -p wa -k passwd_changes

# Monitor failed login attempts
sudo auditctl -w /var/log/auth.log -p r -k auth_log_read

# View audit logs
sudo ausearch -k passwd_changes
```

---

## CIS Benchmarks

The **Center for Internet Security (CIS)** publishes detailed hardening guides for every major OS.

| Benchmark | Coverage |
|-----------|----------|
| CIS Ubuntu Linux | 200+ configuration checks |
| CIS Windows Server | 300+ Group Policy settings |
| CIS macOS | Security preferences and configurations |
| CIS Docker | Container runtime hardening |

### Applying CIS Benchmarks

```bash
# Use CIS-CAT tool to scan compliance
# Or use OpenSCAP for automated assessment

# Install OpenSCAP (Linux)
sudo apt install libopenscap8 ssg-base ssg-debderived

# Run a scan against CIS profile
sudo oscap xccdf eval --profile cis \
  --results results.xml \
  /usr/share/xml/scap/ssg/content/ssg-ubuntu2204-ds.xml
```

---

## Secure Boot

**Secure Boot** ensures only trusted, signed software loads during system startup.

| Stage | Protection |
|-------|-----------|
| UEFI Firmware | Verifies bootloader signature |
| Bootloader (GRUB/Windows Boot Manager) | Verifies kernel signature |
| Kernel | Verifies module signatures |
| Init system | Integrity of startup processes |

```bash
# Check if Secure Boot is enabled (Linux)
mokutil --sb-state

# List enrolled keys
mokutil --list-enrolled
```

---

## Hardening Checklist Summary

| Category | Key Actions |
|----------|-------------|
| Services | Disable unnecessary services, close unused ports |
| Authentication | Strong passwords, MFA, disable root login |
| Network | Enable firewall, restrict SSH, disable IPv6 if unused |
| Filesystem | Proper permissions, noexec on /tmp, encrypt at rest |
| Updates | Automatic security patches, vulnerability scanning |
| Logging | Centralized logging, audit critical files, retain logs |
| Secure Boot | Enable UEFI Secure Boot, verify chain of trust |

---

## Key Takeaways

- OS hardening reduces attack surface by removing unnecessary software, services, and access.
- Patch management is critical — prioritize by CVSS severity and automate where possible.
- File permissions and user management enforce least privilege at the OS level.
- Auditing and logging provide visibility into security events and support incident response.
- CIS Benchmarks provide authoritative, step-by-step hardening guides for every major OS.
- Secure Boot protects the boot chain from rootkits and bootkits.

---

[Next: Network Security Fundamentals](41-cybersecurity-network-security)
