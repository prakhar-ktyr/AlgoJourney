---
title: Cron Jobs & Task Scheduling
---

# Cron Jobs & Task Scheduling

Cron lets you automate repetitive tasks — run scripts at specific times, perform backups nightly, or clean up logs weekly. This lesson covers cron, the `at` command, and modern systemd timers.

---

## What is Cron?

Cron is a time-based job scheduler in Linux. It runs in the background (as a daemon) and executes commands at scheduled intervals.

```bash
# Check if cron is running
$ systemctl status cron
● cron.service - Regular background program processing daemon
     Active: active (running) since Mon 2025-03-15 08:00:00 UTC
```

---

## Cron Syntax

Each cron job is defined by a single line with 6 fields:

```
┌───────────── minute (0–59)
│ ┌───────────── hour (0–23)
│ │ ┌───────────── day of month (1–31)
│ │ │ ┌───────────── month (1–12)
│ │ │ │ ┌───────────── day of week (0–7, 0 and 7 = Sunday)
│ │ │ │ │
│ │ │ │ │
* * * * * command_to_execute
```

### Special Characters

| Character | Meaning                | Example           | Explanation                     |
|-----------|------------------------|-------------------|---------------------------------|
| `*`       | Any value              | `* * * * *`       | Every minute                    |
| `,`       | List of values         | `1,15,30 * * * *` | At minutes 1, 15, and 30       |
| `-`       | Range of values        | `1-5 * * * *`     | Minutes 1 through 5            |
| `/`       | Step values            | `*/10 * * * *`    | Every 10 minutes               |

### Examples Explained

```bash
# Run every minute
* * * * * /path/to/script.sh

# Run at 2:30 AM every day
30 2 * * * /path/to/script.sh

# Run every 5 minutes
*/5 * * * * /path/to/script.sh

# Run at midnight on the 1st of every month
0 0 1 * * /path/to/script.sh

# Run every Monday at 9:00 AM
0 9 * * 1 /path/to/script.sh

# Run every weekday (Mon-Fri) at 6:00 PM
0 18 * * 1-5 /path/to/script.sh

# Run at 8:00 AM and 5:00 PM every day
0 8,17 * * * /path/to/script.sh

# Run every 15 minutes during business hours (9AM-5PM)
*/15 9-17 * * * /path/to/script.sh
```

---

## Common Cron Schedules

| Schedule                | Expression       | Description              |
|-------------------------|------------------|--------------------------|
| Every minute            | `* * * * *`      | Runs 1440 times/day      |
| Every 5 minutes         | `*/5 * * * *`    | Runs 288 times/day       |
| Every hour              | `0 * * * *`      | Top of every hour        |
| Every day at midnight   | `0 0 * * *`      | Once daily               |
| Every Sunday at 3 AM    | `0 3 * * 0`      | Weekly maintenance       |
| 1st of month at noon    | `0 12 1 * *`     | Monthly report           |
| Weekdays at 9 AM        | `0 9 * * 1-5`    | Business hours start     |
| Every 30 min, Mon-Fri   | `*/30 * * * 1-5` | Frequent weekday check   |

---

## crontab Command

`crontab` manages per-user cron tables.

### Edit Your Crontab

```bash
$ crontab -e
# Opens your crontab in the default editor ($EDITOR)
# Add your cron jobs, save and exit
```

### List Your Cron Jobs

```bash
$ crontab -l
*/5 * * * * /home/user/scripts/check-disk.sh
0 2 * * * /home/user/scripts/backup.sh
0 0 * * 0 /home/user/scripts/weekly-report.sh
```

### Remove All Cron Jobs

```bash
# Remove your entire crontab (use with caution!)
$ crontab -r

# Interactive removal (asks for confirmation)
$ crontab -i -r
crontab: really delete user's crontab? (y/n) y
```

### Edit Another User's Crontab (root only)

```bash
$ sudo crontab -u www-data -e
$ sudo crontab -u www-data -l
```

---

## Shortcut Strings

Instead of the five-field syntax, cron supports convenient shortcuts:

```bash
# Run once at startup
@reboot /path/to/script.sh

# Run once a day (midnight)
@daily /path/to/script.sh

# Run once an hour (at minute 0)
@hourly /path/to/script.sh

# Run once a week (Sunday midnight)
@weekly /path/to/script.sh

# Run once a month (1st at midnight)
@monthly /path/to/script.sh

# Run once a year (Jan 1st at midnight)
@yearly /path/to/script.sh
```

### Practical Uses

```bash
# Start a service after reboot
@reboot /usr/local/bin/start-myapp.sh

# Daily log rotation
@daily /usr/local/bin/rotate-logs.sh

# Weekly system update check
@weekly apt list --upgradable > /var/log/updates-available.txt
```

---

## Cron Environment

Cron runs with a **minimal environment** — this is the #1 source of "it works in terminal but not in cron" bugs.

### Key Differences from Your Shell

| Feature        | Interactive Shell  | Cron Environment     |
|----------------|-------------------|----------------------|
| PATH           | Full user PATH    | `/usr/bin:/bin`      |
| HOME           | Set               | Set                  |
| DISPLAY        | Set (if GUI)      | **Not set**          |
| SHELL          | Your login shell  | `/bin/sh`            |
| .bashrc loaded | Yes               | **No**               |

### Fix: Use Full Paths

```bash
# BAD — python might not be found
* * * * * python /home/user/script.py

# GOOD — use absolute path
* * * * * /usr/bin/python3 /home/user/script.py
```

### Fix: Set PATH in Crontab

```bash
# Add at the top of your crontab
PATH=/usr/local/bin:/usr/bin:/bin:/home/user/.local/bin
SHELL=/bin/bash

# Now you can use commands without full paths
0 2 * * * backup.sh
```

### Fix: Source Your Profile

```bash
# Source .bashrc before running script
* * * * * source /home/user/.bashrc && /home/user/script.sh
```

---

## Logging Cron Output

By default, cron emails output to the user. On most systems without a mail server, output is **lost**.

### Redirect Output to a Log File

```bash
# Redirect stdout and stderr to a log file
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>&1
```

### Separate stdout and stderr

```bash
# stdout to one file, stderr to another
0 2 * * * /home/user/backup.sh >> /var/log/backup.log 2>> /var/log/backup-errors.log
```

### Discard Output Completely

```bash
# Send all output to /dev/null
*/5 * * * * /home/user/check.sh > /dev/null 2>&1
```

### Add Timestamps to Logs

```bash
# Pipe through ts (from moreutils) or use a wrapper
0 2 * * * /home/user/backup.sh 2>&1 | while read line; do echo "$(date '+%Y-%m-%d %H:%M:%S') $line"; done >> /var/log/backup.log
```

### Check Cron's Own Logs

```bash
# View cron daemon logs
$ grep CRON /var/log/syslog | tail -20

# On systemd systems
$ journalctl -u cron --since "1 hour ago"
```

---

## at Command — One-Time Tasks

While cron handles recurring tasks, `at` schedules a command to run **once** at a specific time.

### Schedule a One-Time Job

```bash
# Run a command at 3:00 PM today
$ at 15:00
at> /home/user/scripts/deploy.sh
at> <Ctrl+D>
job 1 at Sat Mar 15 15:00:00 2025

# Run at a specific date and time
$ at 10:00 AM Mar 20
at> echo "Meeting reminder!" | mail -s "Meeting" user@example.com
at> <Ctrl+D>
```

### Time Formats

```bash
# Relative times
$ at now + 30 minutes
$ at now + 2 hours
$ at now + 1 day

# Specific times
$ at 14:30
$ at midnight
$ at noon
$ at teatime    # 4:00 PM

# Date and time
$ at 3:00 PM March 20
$ at 10:00 2025-03-20
```

### List Pending Jobs

```bash
$ atq
1    Sat Mar 15 15:00:00 2025 a user
2    Thu Mar 20 10:00:00 2025 a user
```

### Remove a Scheduled Job

```bash
$ atrm 1
# or
$ at -r 1
```

### Run from a File

```bash
$ at 02:00 -f /home/user/scripts/maintenance.sh
```

---

## systemd Timers — Modern Alternative

systemd timers are the modern replacement for cron on systemd-based systems. They offer better logging, dependency management, and resource control.

### View Active Timers

```bash
$ systemctl list-timers --all
NEXT                         LEFT          LAST                         PASSED       UNIT
Sat 2025-03-15 18:00:00 UTC  2h 15min left Sat 2025-03-15 12:00:00 UTC  3h 44min ago apt-daily.timer
Sun 2025-03-16 00:00:00 UTC  8h left       Sat 2025-03-15 00:00:00 UTC  15h ago      logrotate.timer
```

### Create a Custom Timer

**Step 1: Create the service file** (`/etc/systemd/system/backup.service`)

```bash
[Unit]
Description=Daily Backup Service

[Service]
Type=oneshot
ExecStart=/home/user/scripts/backup.sh
User=user
```

**Step 2: Create the timer file** (`/etc/systemd/system/backup.timer`)

```bash
[Unit]
Description=Run backup daily at 2 AM

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Step 3: Enable and start**

```bash
$ sudo systemctl daemon-reload
$ sudo systemctl enable backup.timer
$ sudo systemctl start backup.timer

# Check status
$ systemctl status backup.timer
● backup.timer - Run backup daily at 2 AM
     Active: active (waiting) since Sat 2025-03-15 10:00:00 UTC
    Trigger: Sun 2025-03-16 02:00:00 UTC; 15h left
```

### Timer Calendar Expressions

```bash
OnCalendar=hourly              # Every hour
OnCalendar=daily               # Every day at midnight
OnCalendar=weekly              # Every Monday at midnight
OnCalendar=*-*-* 06:00:00     # Every day at 6 AM
OnCalendar=Mon-Fri *-*-* 09:00:00  # Weekdays at 9 AM
OnCalendar=*-*-01 00:00:00    # First of every month
```

---

## Practical Cron Jobs

### System Maintenance

```bash
# Update package lists weekly
0 4 * * 0 apt-get update -qq > /dev/null 2>&1

# Clear /tmp files older than 7 days
0 3 * * * find /tmp -type f -mtime +7 -delete

# Restart a service every night
0 2 * * * systemctl restart myapp
```

### Log Management

```bash
# Compress logs older than 1 day
0 1 * * * find /var/log/myapp -name "*.log" -mtime +1 -exec gzip {} \;

# Delete compressed logs older than 30 days
0 2 * * * find /var/log/myapp -name "*.gz" -mtime +30 -delete
```

### Monitoring

```bash
# Check disk usage every hour, alert if over 90%
0 * * * * /home/user/scripts/disk-alert.sh
```

```bash
#!/bin/bash
# disk-alert.sh
THRESHOLD=90
USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')

if [ "$USAGE" -gt "$THRESHOLD" ]; then
    echo "WARNING: Disk usage is ${USAGE}% on $(hostname)" | \
        mail -s "Disk Alert" admin@example.com
fi
```

### Backup Automation

```bash
# Database backup every night at 1 AM
0 1 * * * /usr/bin/mysqldump -u root mydb | gzip > /backups/db_$(date +\%Y-\%m-\%d).sql.gz

# Application backup every Sunday at 3 AM
0 3 * * 0 tar -czvf /backups/app_$(date +\%Y-\%m-\%d).tar.gz /var/www/html > /dev/null 2>&1
```

> **Note:** In crontab, escape `%` as `\%` because cron treats unescaped `%` as newlines.

---

## Debugging Cron Jobs

### Common Issues Checklist

```bash
# 1. Is cron running?
$ systemctl status cron

# 2. Check cron logs
$ grep CRON /var/log/syslog | tail -10

# 3. Test your script manually
$ /bin/bash /path/to/script.sh

# 4. Check permissions
$ ls -la /path/to/script.sh
# Must be executable: chmod +x script.sh

# 5. Verify the cron entry is saved
$ crontab -l | grep script
```

### Test with a Simple Job

```bash
# Add this to verify cron is working
* * * * * echo "Cron test at $(date)" >> /tmp/cron-test.log

# Wait 1–2 minutes, then check
$ cat /tmp/cron-test.log
Cron test at Sat Mar 15 14:01:00 UTC 2025
Cron test at Sat Mar 15 14:02:00 UTC 2025
```

---

## Quick Reference

| Task                      | Command                                  |
|---------------------------|------------------------------------------|
| Edit crontab              | `crontab -e`                             |
| List cron jobs            | `crontab -l`                             |
| Remove crontab            | `crontab -r`                             |
| View cron logs            | `grep CRON /var/log/syslog`              |
| Schedule one-time task    | `at 15:00`                               |
| List at jobs              | `atq`                                    |
| Remove at job             | `atrm <job_number>`                      |
| List systemd timers       | `systemctl list-timers`                  |

---

## Summary

- **Cron** automates recurring tasks using a 5-field time expression plus a command.
- Use `crontab -e` to edit, `crontab -l` to list, and always test scripts manually first.
- Cron has a **minimal environment** — use full paths and redirect output to log files.
- **at** handles one-time scheduled tasks.
- **systemd timers** offer richer features (logging, dependencies) for modern systems.
- Always escape `%` as `\%` in crontab entries.
