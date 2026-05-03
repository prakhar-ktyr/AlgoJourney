---
title: Here Documents & Here Strings
---

# Here Documents & Here Strings

Here documents (heredocs) and here strings let you pass multi-line text or inline strings to commands — without external files. They're essential for generating configs, embedding templates, and automating interactive commands.

---

## What Is a Here Document?

A here document feeds a block of text to a command's standard input:

```bash
command <<DELIMITER
line 1
line 2
line 3
DELIMITER
```

The **delimiter** can be any word. Common choices: `EOF`, `END`, `HEREDOC`.

---

## Basic Here Document

```bash
cat <<EOF
Hello, World!
This is a here document.
It can span multiple lines.
EOF
```

**Output:**

```
Hello, World!
This is a here document.
It can span multiple lines.
```

---

## Variable Expansion in Here Documents

By default, variables and commands are **expanded** inside here docs:

```bash
name="Alice"
date_today=$(date +%Y-%m-%d)

cat <<EOF
Hello, $name!
Today is $date_today.
Your home is $HOME.
You are $(whoami) on $(hostname).
EOF
```

---

## Literal Here Documents (No Expansion)

**Quote the delimiter** to prevent all expansion:

```bash
cat <<'EOF'
Hello, $name!
Today is $date_today.
These variables are NOT expanded.
$(this command is NOT executed)
Backslashes are literal: \n \t \\
EOF
```

**Any quoting style works:**

```bash
cat <<'EOF'    # Single quotes
cat <<"EOF"    # Double quotes
cat <<\EOF     # Backslash
```

All three prevent expansion.

---

## Indented Here Documents: <<-

Use `<<-` to strip **leading tabs** (not spaces!) from the content:

```bash
if true; then
	cat <<-EOF
	This text is indented with tabs.
	The tabs are stripped from output.
	EOF
fi
```

**Output (no leading tabs):**

```
This text is indented with tabs.
The tabs are stripped from output.
```

This keeps heredocs nicely indented in functions and conditionals.

---

## Writing to Files with Here Documents

```bash
# Create a config file
cat <<EOF > /etc/myapp/config.conf
# Auto-generated: $(date)
database_host=localhost
database_port=5432
database_name=myapp
log_level=info
EOF

# Append to a file
cat <<EOF >> /var/log/notes.log
--- Entry: $(date) ---
Deployment completed by $(whoami)
EOF
```

---

## Here Documents with Different Commands

```bash
# Count lines
wc -l <<EOF
line one
line two
line three
EOF

# Search with grep
grep "error" <<EOF
this is fine
this has an error
all good
EOF

# Process with while read
while IFS= read -r line; do
  echo "Processing: $line"
done <<EOF
first item
second item
third item
EOF
```

---

## Generating Configuration Files

### Nginx Config

```bash
#!/bin/bash
DOMAIN="example.com"
PORT=3000

cat <<EOF > /etc/nginx/sites-available/$DOMAIN
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /api {
        proxy_pass http://localhost:$PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
```

**Note:** Nginx variables like `$host` must be escaped (`\$host`) to avoid shell expansion.

---

### Systemd Service File

```bash
#!/bin/bash
APP_NAME="myapp"
APP_USER="www-data"
APP_DIR="/opt/$APP_NAME"

cat <<EOF > /etc/systemd/system/${APP_NAME}.service
[Unit]
Description=$APP_NAME Application Server
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/node $APP_DIR/server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

---

## SQL Queries with Here Documents

```bash
#!/bin/bash
DB_NAME="analytics"
START_DATE="2024-01-01"

mysql -u root "$DB_NAME" <<EOF
SELECT
    DATE(created_at) as day,
    COUNT(*) as event_count
FROM events
WHERE created_at >= '$START_DATE'
GROUP BY DATE(created_at)
ORDER BY day DESC
LIMIT 30;
EOF
```

---

## SSH with Here Documents

Run multiple commands on a remote server:

```bash
#!/bin/bash
REMOTE_HOST="deploy@server.example.com"
APP_DIR="/opt/myapp"

ssh "$REMOTE_HOST" <<EOF
  cd $APP_DIR
  echo "Deploying on \$(hostname) at \$(date)"
  git pull origin main
  npm install --production
  pm2 restart all
  echo "Deployment complete"
EOF
```

**Note:** `\$(hostname)` executes on the remote machine (escaped from local expansion).

**For fully literal remote commands:**

```bash
ssh "$REMOTE_HOST" <<'EOF'
  echo "Running on $(hostname)"
  df -h /
  free -h
EOF
```

---

## Here Strings: <<<

A **here string** feeds a single string to a command's stdin:

```bash
# Syntax
command <<< "string"
```

**Examples:**

```bash
# Feed a string to grep
grep "world" <<< "hello world"

# Parse a string with read
read -r first last <<< "John Doe"
echo "First: $first, Last: $last"

# Process with awk
result=$(awk '{print $2}' <<< "hello world")
echo "$result"  # world

# Math with bc
echo "Result: $(bc <<< "scale=2; 22/7")"
```

---

## Here String vs Echo Pipe

```bash
# These are equivalent:
echo "hello" | grep "ell"
grep "ell" <<< "hello"

# But here strings avoid subshell variable loss:

# PIPE: variable lost in subshell
count=0
echo "a b c" | while read -r word; do ((count++)); done
echo "$count"  # 0 (subshell!)

# HERE STRING with read: no subshell
read -ra words <<< "a b c"
echo "${#words[@]}"  # 3 (correct!)
```

---

## Here Strings with Variables

```bash
# Parse CSV-like data
line="John,25,Engineer"
IFS=',' read -r name age job <<< "$line"
echo "Name: $name, Age: $age, Job: $job"

# Split path components
path="/home/user/documents/report.pdf"
IFS='/' read -ra parts <<< "$path"
echo "Filename: ${parts[-1]}"

# Process command output
read -r used total <<< "$(df / | awk 'NR==2 {print $3, $2}')"
echo "Used: $used / Total: $total"
```

---

## Practical: Multi-File Generator

```bash
#!/bin/bash
PROJECT="$1"
[[ -n "$PROJECT" ]] || { echo "Usage: $0 <project-name>"; exit 1; }

mkdir -p "$PROJECT/src"

cat <<EOF > "$PROJECT/package.json"
{
  "name": "$PROJECT",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest"
  }
}
EOF

cat <<EOF > "$PROJECT/src/index.js"
const PORT = process.env.PORT || 3000;
console.log(\`$PROJECT running on port \${PORT}\`);
EOF

cat <<'EOF' > "$PROJECT/.gitignore"
node_modules/
.env
*.log
dist/
EOF

cat <<EOF > "$PROJECT/README.md"
# $PROJECT

Created on $(date +%Y-%m-%d).

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`
EOF

echo "Project '$PROJECT' created!"
```

---

## Practical: Script Installer

```bash
#!/bin/bash
INSTALL_DIR="/usr/local/bin"
SCRIPT_NAME="backup-daily"

cat <<'SCRIPT' > "$INSTALL_DIR/$SCRIPT_NAME"
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/daily"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" /etc /home 2>/dev/null
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "Backup complete: backup_${TIMESTAMP}.tar.gz"
SCRIPT

chmod +x "$INSTALL_DIR/$SCRIPT_NAME"
echo "Installed: $INSTALL_DIR/$SCRIPT_NAME"
```

**Note:** `<<'SCRIPT'` (quoted) writes content literally — variables won't expand during installation.

---

## Common Patterns

```bash
# 1. Assign multi-line string to variable
message=$(cat <<EOF
Line 1
Line 2: Hello, $USER
Line 3
EOF
)

# 2. Pipe heredoc to another command
cat <<EOF | sort | uniq
banana
apple
cherry
apple
EOF

# 3. Conditional content in heredoc
ENABLE_SSL=true
cat <<EOF
server {
    listen 80;
$(if [[ "$ENABLE_SSL" == true ]]; then
echo "    listen 443 ssl;"
echo "    ssl_certificate /etc/ssl/cert.pem;"
fi)
    server_name example.com;
}
EOF
```

---

## Here Document Variations Summary

| Syntax | Expansion | Tab Stripping | Use Case |
|--------|-----------|---------------|----------|
| `<<EOF` | Yes | No | Dynamic content |
| `<<'EOF'` | No | No | Literal content |
| `<<-EOF` | Yes | Leading tabs | Indented scripts |
| `<<-'EOF'` | No | Leading tabs | Indented literal |
| `<<<` | Yes | N/A | Single string input |

---

## Summary

| Feature | Syntax | Purpose |
|---------|--------|---------|
| Here document | `<<EOF ... EOF` | Multi-line input |
| Literal heredoc | `<<'EOF' ... EOF` | No variable expansion |
| Indented heredoc | `<<-EOF ... EOF` | Strip leading tabs |
| Here string | `<<< "text"` | Single-line input |
| Write to file | `<<EOF > file` | Generate files |
| Append to file | `<<EOF >> file` | Add to files |

**Key takeaways:**
- Use `<<EOF` when you need variable expansion in multi-line text
- Use `<<'EOF'` when content should be taken literally (scripts, regex, etc.)
- Use `<<-EOF` in functions/conditionals to keep heredoc indented with code
- Use `<<<` for feeding a single string to a command without `echo |`
- Heredocs are perfect for generating config files, SQL, emails, and remote commands

---

## Exercises

1. Write a script that generates an HTML page using a heredoc with dynamic title and current date
2. Create a heredoc that generates a `.env` file with randomized passwords
3. Use `<<'EOF'` to write a bash script to a file (with unexpanded `$variables`)
4. Parse comma-separated input using a here string and `IFS=',' read`
5. Write a deployment script that SSHs into a server using a heredoc for commands
