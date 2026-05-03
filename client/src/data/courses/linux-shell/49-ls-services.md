---
title: Service Management
---

# Service Management

A **service** (also called a **daemon**) is a program that runs in the background, often starting at boot. Web servers, databases, and system utilities all run as services. **systemd** is the standard tool for managing them on modern Linux.

---

## What Is a Service/Daemon?

| Term | Description |
|------|-------------|
| **Service** | A background process that performs a specific function |
| **Daemon** | Traditional UNIX name for a background service (often ends in `d`) |
| **Init system** | The first process (PID 1) that starts and manages all services |

Examples of services:
- `nginx` — web server
- `sshd` — SSH server
- `postgresql` — database
- `cron` — scheduled tasks
- `NetworkManager` — network management

---

## systemd — The Modern Init System

**systemd** is the init system used by most modern Linux distributions (Ubuntu, Fedora, Debian, Arch, RHEL, etc.).

It manages:
- Starting/stopping services
- Boot order and dependencies
- Logging (via journald)
- Timers (cron replacement)
- Mount points, devices, and more

The primary command for interacting with systemd is **`systemctl`**.

---

## systemctl — Basic Commands

### Start a Service

```bash
# Start nginx right now
sudo systemctl start nginx
```

### Stop a Service

```bash
# Stop nginx right now
sudo systemctl stop nginx
```

### Restart a Service

```bash
# Stop and start again (connections dropped)
sudo systemctl restart nginx
```

### Reload Configuration

```bash
# Reload config without dropping connections
sudo systemctl reload nginx
```

> **Note:** Not all services support `reload`. Use `restart` as a fallback.

### Reload or Restart

```bash
# Reload if supported, otherwise restart
sudo systemctl reload-or-restart nginx
```

---

## Enable and Disable Services

### Enable — Start at Boot

```bash
# Start nginx automatically on boot
sudo systemctl enable nginx

# Enable AND start right now
sudo systemctl enable --now nginx
```

### Disable — Don't Start at Boot

```bash
# Don't start nginx on boot
sudo systemctl disable nginx

# Disable AND stop right now
sudo systemctl disable --now nginx
```

---

## Check Service Status

### Detailed Status

```bash
$ sudo systemctl status nginx
● nginx.service - A high performance web server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Mon 2024-01-15 10:30:00 UTC; 2h ago
       Docs: man:nginx(8)
    Process: 1234 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=0/SUCCESS)
   Main PID: 1235 (nginx)
      Tasks: 3 (limit: 4691)
     Memory: 8.5M
        CPU: 245ms
     CGroup: /system.slice/nginx.service
             ├─1235 "nginx: master process /usr/sbin/nginx"
             ├─1236 "nginx: worker process"
             └─1237 "nginx: worker process"

Jan 15 10:30:00 server systemd[1]: Starting A high performance web server...
Jan 15 10:30:00 server systemd[1]: Started A high performance web server.
```

### Quick Status Checks

```bash
# Is the service running right now?
systemctl is-active nginx
# Output: active

# Is it enabled to start on boot?
systemctl is-enabled nginx
# Output: enabled

# Has it failed?
systemctl is-failed nginx
# Output: active (means NOT failed)
```

### Use in Scripts

```bash
#!/bin/bash

if systemctl is-active --quiet nginx; then
  echo "Nginx is running"
else
  echo "Nginx is NOT running"
  echo "Starting nginx..."
  sudo systemctl start nginx
fi
```

---

## Listing Services

### All Services

```bash
# List all loaded services
systemctl list-units --type=service
```

### Filter by State

```bash
# Only running services
systemctl list-units --type=service --state=running

# Only failed services
systemctl list-units --type=service --state=failed

# All installed service files (including disabled)
systemctl list-unit-files --type=service
```

### Example Output

```bash
$ systemctl list-units --type=service --state=running
UNIT                      LOAD   ACTIVE SUB     DESCRIPTION
cron.service              loaded active running Regular background program processing
dbus.service              loaded active running D-Bus System Message Bus
nginx.service             loaded active running A high performance web server
ssh.service               loaded active running OpenBSD Secure Shell server
systemd-journald.service  loaded active running Journal Service
```

---

## Creating a Custom systemd Service

### Step 1: Create Your Script

```bash
#!/bin/bash
# /opt/myapp/server.sh

echo "MyApp started at $(date)" >> /var/log/myapp.log

while true; do
  echo "MyApp running... $(date)" >> /var/log/myapp.log
  sleep 60
done
```

Make it executable:

```bash
chmod +x /opt/myapp/server.sh
```

### Step 2: Create the Service File

Create `/etc/systemd/system/myapp.service`:

```bash
[Unit]
Description=My Custom Application
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=myapp
Group=myapp
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/server.sh
ExecStop=/bin/kill -SIGTERM $MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### Step 3: Enable and Start

```bash
# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable and start
sudo systemctl enable --now myapp

# Check status
sudo systemctl status myapp
```

---

## Service File Sections Explained

### [Unit] Section

```bash
[Unit]
Description=My Application Server
Documentation=https://example.com/docs
After=network.target postgresql.service
Requires=postgresql.service
Wants=redis.service
```

| Directive | Purpose |
|-----------|---------|
| `Description` | Human-readable name |
| `Documentation` | URL to docs |
| `After` | Start after these units |
| `Requires` | Hard dependency (fails if dependency fails) |
| `Wants` | Soft dependency (starts even if dependency fails) |

### [Service] Section

```bash
[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp
Environment=NODE_ENV=production
EnvironmentFile=/etc/myapp/env
ExecStartPre=/usr/bin/npm run build
ExecStart=/usr/bin/node /var/www/myapp/server.js
ExecStop=/bin/kill -SIGTERM $MAINPID
ExecReload=/bin/kill -SIGHUP $MAINPID
Restart=always
RestartSec=10
TimeoutStartSec=30
TimeoutStopSec=30
```

| Directive | Purpose |
|-----------|---------|
| `Type` | `simple`, `forking`, `oneshot`, `notify` |
| `User` / `Group` | Run as this user/group |
| `WorkingDirectory` | Set working directory |
| `Environment` | Set environment variables |
| `EnvironmentFile` | Load env vars from file |
| `ExecStart` | Command to start the service |
| `ExecStop` | Command to stop the service |
| `ExecReload` | Command to reload config |
| `Restart` | When to restart: `always`, `on-failure`, `no` |
| `RestartSec` | Wait time before restart |

### [Install] Section

```bash
[Install]
WantedBy=multi-user.target
```

| Directive | Purpose |
|-----------|---------|
| `WantedBy` | Which target enables this service |

Common targets:
- `multi-user.target` — normal multi-user system (no GUI)
- `graphical.target` — multi-user with GUI

---

## Service Types

| Type | Description |
|------|-------------|
| `simple` | Process started by ExecStart is the main process (default) |
| `forking` | Process forks into background (traditional daemons) |
| `oneshot` | Process exits after doing its job (startup scripts) |
| `notify` | Like simple, but process signals readiness |

### Example: oneshot Service

```bash
[Unit]
Description=Initialize application database

[Service]
Type=oneshot
ExecStart=/opt/myapp/init-db.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

---

## journalctl — View Service Logs

systemd captures all service output via **journald**. Use `journalctl` to view logs.

### View Logs for a Service

```bash
# All logs for nginx
journalctl -u nginx

# Follow logs in real-time (like tail -f)
journalctl -u nginx -f

# Last 50 lines
journalctl -u nginx -n 50

# Logs since a specific time
journalctl -u nginx --since "2024-01-15 10:00:00"

# Logs in the last hour
journalctl -u nginx --since "1 hour ago"

# Logs between two times
journalctl -u nginx --since "2024-01-15" --until "2024-01-16"
```

### System-Wide Logs

```bash
# All logs from current boot
journalctl -b

# All logs from previous boot
journalctl -b -1

# Kernel messages only
journalctl -k

# Errors and above
journalctl -p err

# Priority levels: emerg, alert, crit, err, warning, notice, info, debug
journalctl -p warning
```

### Useful journalctl Options

```bash
# Show logs in reverse (newest first)
journalctl -r

# Output as JSON
journalctl -u nginx -o json-pretty

# Show disk usage of journal
journalctl --disk-usage

# Clean old logs (keep last 2 weeks)
sudo journalctl --vacuum-time=2weeks

# Clean old logs (keep 500MB max)
sudo journalctl --vacuum-size=500M
```

---

## Practical Examples

### Example: Node.js Application Service

```bash
[Unit]
Description=Node.js API Server
After=network.target

[Service]
Type=simple
User=nodeapp
WorkingDirectory=/var/www/api
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/www/api/logs

[Install]
WantedBy=multi-user.target
```

### Example: Python Application Service

```bash
[Unit]
Description=Python Flask Application
After=network.target

[Service]
Type=simple
User=flaskapp
Group=flaskapp
WorkingDirectory=/opt/flaskapp
Environment=FLASK_ENV=production
ExecStart=/opt/flaskapp/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## Managing Multiple Services

### Start/Stop Multiple Services

```bash
# Start multiple services
sudo systemctl start nginx postgresql redis

# Stop multiple services
sudo systemctl stop nginx postgresql redis
```

### Check Multiple Services Script

```bash
#!/bin/bash

SERVICES=("nginx" "postgresql" "redis" "ssh")

echo "=== Service Status Report ==="
echo ""

for svc in "${SERVICES[@]}"; do
  STATUS=$(systemctl is-active "$svc" 2>/dev/null)
  ENABLED=$(systemctl is-enabled "$svc" 2>/dev/null)

  if [ "$STATUS" = "active" ]; then
    ICON="[OK]"
  else
    ICON="[DOWN]"
  fi

  printf "  %-6s %-20s active=%-8s enabled=%s\n" "$ICON" "$svc" "$STATUS" "$ENABLED"
done
```

### Service Restart on Failure Script

```bash
#!/bin/bash

# Monitor a service and restart if it fails
SERVICE="myapp"
MAX_RETRIES=3
RETRY_COUNT=0

while true; do
  if ! systemctl is-active --quiet "$SERVICE"; then
    ((RETRY_COUNT++))
    echo "$(date): $SERVICE is down! (attempt $RETRY_COUNT/$MAX_RETRIES)"

    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
      echo "$(date): Max retries reached. Alerting admin."
      # Send alert here
      break
    fi

    sudo systemctl restart "$SERVICE"
    sleep 5
  else
    RETRY_COUNT=0
  fi
  sleep 30
done
```

---

## systemd Timers (Cron Alternative)

systemd timers can replace cron jobs:

### Timer Unit: `/etc/systemd/system/backup.timer`

```bash
[Unit]
Description=Run backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

### Service Unit: `/etc/systemd/system/backup.service`

```bash
[Unit]
Description=Backup service

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
```

### Enable the Timer

```bash
sudo systemctl enable --now backup.timer

# List active timers
systemctl list-timers
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `systemctl start svc` | Start a service |
| `systemctl stop svc` | Stop a service |
| `systemctl restart svc` | Restart a service |
| `systemctl reload svc` | Reload configuration |
| `systemctl enable svc` | Start at boot |
| `systemctl disable svc` | Don't start at boot |
| `systemctl status svc` | Check detailed status |
| `systemctl is-active svc` | Quick running check |
| `systemctl list-units` | List loaded units |
| `journalctl -u svc` | View service logs |
| `journalctl -f` | Follow logs live |
| `systemctl daemon-reload` | Reload after file changes |

**Next up:** Learn how to manage storage with **Disk Management**!
