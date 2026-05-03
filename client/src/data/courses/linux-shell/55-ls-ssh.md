---
title: SSH & Remote Access
---

# SSH & Remote Access

SSH (Secure Shell) lets you securely connect to remote servers, transfer files, and tunnel traffic — all encrypted. It's the primary tool for managing Linux servers. This lesson covers connecting, key authentication, config files, file transfers, and port forwarding.

---

## What is SSH?

SSH (Secure Shell Protocol) provides encrypted communication between two machines over an insecure network.

**Key features:**
- Encrypted login to remote servers
- Secure file transfer (SCP, SFTP)
- Port forwarding and tunneling
- Replaces insecure protocols like telnet and rlogin

```bash
# SSH operates on port 22 by default
# Client → encrypted connection → Server
```

---

## Connecting to a Remote Server

### Basic Connection

```bash
# Connect as current user
$ ssh server.example.com

# Connect as a specific user
$ ssh user@server.example.com

# Connect on a different port
$ ssh -p 2222 user@server.example.com
```

### First Connection — Host Verification

```bash
$ ssh user@192.168.1.50
The authenticity of host '192.168.1.50 (192.168.1.50)' can't be established.
ED25519 key fingerprint is SHA256:xYz123AbC456...
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.1.50' (ED25519) to the list of known hosts.
user@192.168.1.50's password:
```

> The fingerprint is saved in `~/.ssh/known_hosts`. Future connections verify the server hasn't changed.

### Run a Single Command

```bash
# Execute a command without opening interactive shell
$ ssh user@server "uptime"
 14:32:01 up 45 days,  2:15,  1 user,  load average: 0.12, 0.08, 0.05

# Multiple commands
$ ssh user@server "df -h && free -h"

# Run a local script on the remote server
$ ssh user@server 'bash -s' < local-script.sh
```

### Exit an SSH Session

```bash
# Type exit or press Ctrl+D
user@server:~$ exit
logout
Connection to server.example.com closed.
```

---

## SSH Key Authentication

Password authentication works but keys are **more secure** and **more convenient** — no typing passwords.

### How It Works

```
1. You generate a key pair: private key (secret) + public key (shareable)
2. The public key is placed on the remote server
3. When connecting, SSH uses your private key to prove identity
4. No password needed!
```

### Generate a Key Pair

```bash
$ ssh-keygen
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/user/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/user/.ssh/id_ed25519
Your public key has been saved in /home/user/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:AbCdEf123456... user@localhost
The key's randomart image is:
+--[ED25519 256]--+
|     .o+*B=.     |
|      .o=*o.     |
|       .o+.o     |
|        .o= .    |
|       S.o =     |
|        o + +    |
|         = B .   |
|        . O E    |
|         . +     |
+----[SHA256]-----+
```

### Key Types

```bash
# Ed25519 — recommended (modern, fast, secure)
$ ssh-keygen -t ed25519 -C "your@email.com"

# RSA — widely compatible (use 4096 bits minimum)
$ ssh-keygen -t rsa -b 4096 -C "your@email.com"

# Specify custom filename
$ ssh-keygen -t ed25519 -f ~/.ssh/work_key -C "work@company.com"
```

### Key Files

```bash
$ ls ~/.ssh/
id_ed25519       # Private key — NEVER share this!
id_ed25519.pub   # Public key — safe to share
known_hosts      # Fingerprints of servers you've connected to
```

### View Your Public Key

```bash
$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBxyz123... user@localhost
```

---

## Copying Your Key to a Server

### Using ssh-copy-id (Easiest)

```bash
$ ssh-copy-id user@server.example.com
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s)
user@server.example.com's password:
Number of key(s) added: 1

# Now test — should connect without password
$ ssh user@server.example.com
user@server:~$   ← No password prompt!
```

### Manual Method

```bash
# Copy public key content
$ cat ~/.ssh/id_ed25519.pub

# On the remote server, paste into authorized_keys
$ ssh user@server
user@server:~$ mkdir -p ~/.ssh
user@server:~$ chmod 700 ~/.ssh
user@server:~$ echo "ssh-ed25519 AAAAC3NzaC1..." >> ~/.ssh/authorized_keys
user@server:~$ chmod 600 ~/.ssh/authorized_keys
```

### authorized_keys on the Server

```bash
# Each line is one public key that's allowed to connect
$ cat ~/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... user@laptop
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... user@work
ssh-rsa AAAAB3NzaC1yc2EAAAA... oldkey@desktop
```

---

## SSH Config File

The `~/.ssh/config` file lets you define shortcuts and defaults for SSH connections.

### Basic Config

```bash
# ~/.ssh/config

# Production server
Host prod
    HostName 203.0.113.50
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519

# Development server
Host dev
    HostName 192.168.1.100
    User developer
    Port 2222
    IdentityFile ~/.ssh/work_key

# Personal server
Host personal
    HostName myserver.example.com
    User admin
    IdentityFile ~/.ssh/personal_key
```

### Using Config Aliases

```bash
# Instead of typing the full command:
$ ssh deploy@203.0.113.50

# Just type:
$ ssh prod

# Works with scp too:
$ scp file.txt prod:/home/deploy/
```

### Wildcard Patterns

```bash
# ~/.ssh/config

# Default settings for all hosts
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    AddKeysToAgent yes

# All company servers
Host *.company.com
    User myusername
    IdentityFile ~/.ssh/work_key
    Port 2222

# Specific server overrides the pattern
Host db.company.com
    User dbadmin
    Port 5432
```

### Common Config Options

| Option                | Purpose                              | Example              |
|-----------------------|--------------------------------------|----------------------|
| `HostName`            | Actual server address                | `192.168.1.100`      |
| `User`                | Default username                     | `deploy`             |
| `Port`                | SSH port                             | `2222`               |
| `IdentityFile`        | Private key to use                   | `~/.ssh/work_key`    |
| `ServerAliveInterval` | Keep connection alive (seconds)      | `60`                 |
| `ServerAliveCountMax` | Max missed keepalives before disconnect | `3`               |
| `ForwardAgent`        | Forward SSH agent to remote          | `yes`                |
| `ProxyJump`           | Connect through a jump host          | `bastion`            |

### Jump Host (Bastion)

```bash
# Connect through a bastion/jump server
Host internal-server
    HostName 10.0.0.50
    User admin
    ProxyJump bastion

Host bastion
    HostName bastion.example.com
    User jumpuser
    IdentityFile ~/.ssh/bastion_key
```

```bash
# Now you can reach the internal server directly
$ ssh internal-server
# SSH connects to bastion first, then hops to 10.0.0.50
```

---

## SCP — Secure Copy

SCP transfers files over SSH. Simple syntax, works like `cp`.

### Copy File to Remote Server

```bash
# Copy local file to remote
$ scp report.pdf user@server:/home/user/documents/
report.pdf                              100%  2.1MB   5.0MB/s   00:00

# Copy to remote home directory
$ scp file.txt user@server:~
```

### Copy File from Remote Server

```bash
# Copy remote file to local
$ scp user@server:/var/log/app.log ./
app.log                                 100%  512KB   4.2MB/s   00:00

# Copy with custom local name
$ scp user@server:/etc/nginx/nginx.conf ./nginx-backup.conf
```

### Copy Directory Recursively

```bash
# Copy entire directory to remote
$ scp -r ./project/ user@server:/home/user/

# Copy remote directory to local
$ scp -r user@server:/var/www/html ./website-backup/
```

### SCP with SSH Config

```bash
# Using Host alias from ~/.ssh/config
$ scp file.txt prod:/home/deploy/
$ scp -r project/ dev:/var/www/
```

### SCP Options

```bash
# Specify port
$ scp -P 2222 file.txt user@server:/path/

# Specify identity file
$ scp -i ~/.ssh/work_key file.txt user@server:/path/

# Limit bandwidth (in Kbit/s)
$ scp -l 1000 large-file.tar.gz user@server:/backups/

# Preserve timestamps and permissions
$ scp -p file.txt user@server:/path/
```

---

## Port Forwarding (Tunneling)

SSH tunnels let you securely access remote services through an encrypted connection.

### Local Port Forwarding

Access a remote service as if it were local.

```bash
# Syntax: ssh -L local_port:target_host:target_port user@ssh_server

# Access remote PostgreSQL (port 5432) via localhost:5433
$ ssh -L 5433:localhost:5432 user@dbserver.example.com

# Now connect to the database locally:
$ psql -h localhost -p 5433 -U dbuser mydb
```

```bash
# Access a web app on remote server's port 8080
$ ssh -L 8080:localhost:8080 user@server

# Open http://localhost:8080 in your browser
```

```bash
# Access a service on a third machine through the SSH server
$ ssh -L 3306:database.internal:3306 user@bastion

# Your localhost:3306 → bastion → database.internal:3306
```

### Remote Port Forwarding

Expose a local service to the remote server.

```bash
# Syntax: ssh -R remote_port:local_host:local_port user@ssh_server

# Make your local web app (port 3000) accessible on server's port 8080
$ ssh -R 8080:localhost:3000 user@server

# Anyone who connects to server:8080 reaches your local port 3000
```

### Dynamic Port Forwarding (SOCKS Proxy)

```bash
# Create a SOCKS proxy on local port 1080
$ ssh -D 1080 user@server

# Configure browser to use SOCKS5 proxy at localhost:1080
# All browser traffic goes through the SSH tunnel
```

### Keep Tunnel in Background

```bash
# -f = background, -N = no remote command
$ ssh -f -N -L 5433:localhost:5432 user@dbserver

# Check if tunnel is running
$ ps aux | grep ssh | grep 5433

# Kill the tunnel
$ kill $(pgrep -f "ssh.*5433")
```

---

## SSH Agent

The SSH agent holds your private keys in memory so you don't need to enter the passphrase repeatedly.

### Start the Agent

```bash
# Start ssh-agent (usually already running in desktop environments)
$ eval "$(ssh-agent -s)"
Agent pid 12345
```

### Add Keys to the Agent

```bash
# Add default key
$ ssh-add
Enter passphrase for /home/user/.ssh/id_ed25519:
Identity added: /home/user/.ssh/id_ed25519 (user@localhost)

# Add specific key
$ ssh-add ~/.ssh/work_key

# List loaded keys
$ ssh-add -l
256 SHA256:AbCdEf... user@localhost (ED25519)
4096 SHA256:XyZ789... work@company.com (RSA)
```

### Remove Keys

```bash
# Remove a specific key
$ ssh-add -d ~/.ssh/work_key

# Remove all keys
$ ssh-add -D
All identities removed.
```

### Agent Forwarding

Allow the remote server to use your local SSH keys (for chained connections).

```bash
# Connect with agent forwarding
$ ssh -A user@bastion

# Now from bastion, you can SSH to other servers using your local keys
user@bastion:~$ ssh git@github.com
Hi username! You've successfully authenticated.
```

> **Security Warning:** Only forward agent to servers you trust! A compromised server could use your keys.

In `~/.ssh/config`:

```bash
Host bastion
    HostName bastion.example.com
    ForwardAgent yes
```

---

## Disabling Password Authentication

For production servers, disable password auth to prevent brute-force attacks.

### On the Remote Server

```bash
# Edit SSH server configuration
$ sudo vim /etc/ssh/sshd_config
```

```bash
# Change these settings:
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM no
```

```bash
# Restart SSH service
$ sudo systemctl restart sshd
```

> **Important:** Make sure key-based login works BEFORE disabling passwords, or you'll lock yourself out!

### Test Before Locking Down

```bash
# Verify key auth works (from your local machine)
$ ssh -i ~/.ssh/id_ed25519 user@server
# If this works without a password prompt, you're safe to disable passwords
```

---

## SSH Setup Walkthrough

Complete setup from scratch: generate keys, configure server, harden security.

### Step 1: Generate Keys (Local Machine)

```bash
$ ssh-keygen -t ed25519 -C "myemail@example.com"
# Accept default location, set a passphrase
```

### Step 2: Copy Key to Server

```bash
$ ssh-copy-id user@server
# Enter password one last time
```

### Step 3: Test Key Login

```bash
$ ssh user@server
# Should connect without password prompt
```

### Step 4: Create SSH Config

```bash
$ cat >> ~/.ssh/config << 'EOF'
Host myserver
    HostName server.example.com
    User user
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
EOF
```

### Step 5: Harden Server (Optional)

```bash
# On the remote server
$ sudo vim /etc/ssh/sshd_config

# Recommended settings:
Port 2222                     # Change from default 22
PermitRootLogin no            # Disable root login
PasswordAuthentication no     # Keys only
MaxAuthTries 3                # Limit login attempts
AllowUsers user               # Only allow specific users

$ sudo systemctl restart sshd
```

### Step 6: Set Up Agent

```bash
# Add to ~/.bashrc for automatic agent start
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" > /dev/null
    ssh-add ~/.ssh/id_ed25519 2>/dev/null
fi
```

---

## SSH Troubleshooting

### Common Issues

```bash
# Permission denied — check file permissions
$ chmod 700 ~/.ssh
$ chmod 600 ~/.ssh/id_ed25519
$ chmod 644 ~/.ssh/id_ed25519.pub
$ chmod 600 ~/.ssh/config

# Verbose output for debugging
$ ssh -v user@server    # verbose
$ ssh -vv user@server   # more verbose
$ ssh -vvv user@server  # maximum detail
```

### Check Server Logs

```bash
# On the remote server
$ sudo tail -f /var/log/auth.log
# or
$ sudo journalctl -u sshd -f
```

### Connection Timeout

```bash
# Add keepalive in ~/.ssh/config
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 10
```

### Too Many Authentication Failures

```bash
# Specify which key to use (don't try all)
$ ssh -i ~/.ssh/specific_key user@server

# Or in config
Host server
    IdentityFile ~/.ssh/specific_key
    IdentitiesOnly yes
```

---

## Quick Reference

| Task                         | Command                                    |
|------------------------------|--------------------------------------------|
| Connect to server            | `ssh user@host`                            |
| Connect on different port    | `ssh -p 2222 user@host`                    |
| Generate key pair            | `ssh-keygen -t ed25519`                    |
| Copy key to server           | `ssh-copy-id user@host`                    |
| Copy file to remote          | `scp file.txt user@host:/path/`            |
| Copy file from remote        | `scp user@host:/path/file.txt ./`          |
| Copy directory               | `scp -r dir/ user@host:/path/`             |
| Local port forward           | `ssh -L 8080:localhost:80 user@host`       |
| Remote port forward          | `ssh -R 8080:localhost:3000 user@host`     |
| Add key to agent             | `ssh-add ~/.ssh/key`                       |
| List agent keys              | `ssh-add -l`                               |
| Run remote command           | `ssh user@host "command"`                  |

---

## Summary

- **SSH** provides encrypted remote access — always prefer it over unencrypted alternatives.
- **Key authentication** is more secure than passwords; use `ssh-keygen` + `ssh-copy-id`.
- **~/.ssh/config** saves time with host aliases, default users, and identity files.
- **SCP** copies files securely over SSH; use `-r` for directories.
- **Port forwarding** tunnels traffic securely — local (`-L`), remote (`-R`), or dynamic (`-D`).
- **SSH agent** caches passphrases so you type them only once per session.
- For production: disable password auth, change default port, and restrict allowed users.
