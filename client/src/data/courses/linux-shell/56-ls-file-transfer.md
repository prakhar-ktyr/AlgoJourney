---
title: File Transfer
---

# File Transfer

Transferring files between systems is a core skill for any Linux administrator or developer. Whether you're deploying code to a server, downloading resources, or syncing backups, Linux provides powerful tools for every scenario.

---

## scp — Secure Copy over SSH

`scp` (Secure Copy Protocol) uses SSH encryption to transfer files between hosts. It works just like `cp`, but across the network.

### Basic Syntax

```bash
scp [options] source destination
```

### Copy Local File to Remote Server

```bash
# Copy a file to a remote server
scp myfile.txt user@192.168.1.100:/home/user/

# Copy to a specific remote directory
scp report.pdf admin@server.example.com:/var/www/uploads/

# Copy with a different SSH port
scp -P 2222 myfile.txt user@host:/remote/path/
```

### Copy Remote File to Local Machine

```bash
# Download a file from a remote server
scp user@192.168.1.100:/home/user/data.csv ./

# Download to a specific local directory
scp admin@server.com:/var/log/app.log /tmp/logs/

# Download with a different filename
scp user@host:/etc/nginx/nginx.conf ./nginx-backup.conf
```

### Copy Directories Recursively

```bash
# Copy an entire directory to remote
scp -r ./project/ user@host:/home/user/projects/

# Copy a remote directory to local
scp -r user@host:/var/www/html/ ./website-backup/
```

### Useful scp Options

```bash
# Preserve modification times and permissions
scp -p myfile.txt user@host:/path/

# Compress data during transfer
scp -C largefile.tar user@host:/path/

# Limit bandwidth (in Kbit/s)
scp -l 1000 bigfile.iso user@host:/path/

# Quiet mode (no progress bar)
scp -q myfile.txt user@host:/path/

# Verbose mode (for debugging)
scp -v myfile.txt user@host:/path/
```

### Copy Between Two Remote Hosts

```bash
# Transfer between two remote servers (via local machine)
scp user1@host1:/path/file.txt user2@host2:/path/
```

---

## rsync — Efficient File Synchronization

`rsync` is the gold standard for file synchronization. It only transfers the differences between source and destination, making it incredibly efficient for repeated transfers.

### Basic Syntax

```bash
rsync [options] source destination
```

### Common Options

| Option | Description |
|--------|-------------|
| `-a` | Archive mode (preserves permissions, timestamps, symlinks) |
| `-v` | Verbose output |
| `-z` | Compress during transfer |
| `-h` | Human-readable sizes |
| `-P` | Show progress + allow resume |
| `--delete` | Delete files in dest not in source |
| `--dry-run` | Preview without making changes |
| `--exclude` | Exclude files matching pattern |

### Local Sync

```bash
# Sync a directory (note the trailing slash!)
rsync -avh source/ destination/

# Without trailing slash copies the directory itself
rsync -avh source destination/
# Result: destination/source/...

# With trailing slash copies contents only
rsync -avh source/ destination/
# Result: destination/...
```

### Sync Over SSH

```bash
# Push local files to remote server
rsync -avz -e ssh ./project/ user@host:/home/user/project/

# Pull remote files to local machine
rsync -avz -e ssh user@host:/var/www/html/ ./backup/

# Use a specific SSH port
rsync -avz -e "ssh -p 2222" ./data/ user@host:/backup/
```

### Mirror with --delete

```bash
# Make destination an exact mirror of source
# WARNING: This deletes files in dest that don't exist in source!
rsync -avz --delete source/ destination/

# Always preview first with --dry-run
rsync -avz --delete --dry-run source/ destination/
```

### Exclude Patterns

```bash
# Exclude specific files or directories
rsync -avz --exclude='node_modules' --exclude='.git' source/ dest/

# Exclude using a pattern file
rsync -avz --exclude-from='exclude-list.txt' source/ dest/

# Example exclude-list.txt:
# node_modules/
# .git/
# *.log
# .env
```

### Progress and Resume

```bash
# Show progress for large transfers
rsync -avzP source/ user@host:/dest/

# Resume an interrupted transfer
rsync -avzP --partial source/ user@host:/dest/
```

### Backup with rsync

```bash
# Incremental backup with timestamp
rsync -avz --backup --backup-dir="backup_$(date +%Y%m%d)" \
  source/ destination/

# Backup with hard links (saves space)
rsync -avz --link-dest=/backup/previous/ source/ /backup/current/
```

---

## wget — Download Files from the Web

`wget` is a non-interactive downloader. It's perfect for scripts and automation because it runs without user input.

### Basic Downloads

```bash
# Download a file
wget https://example.com/file.tar.gz

# Save with a different filename
wget -O myfile.tar.gz https://example.com/file.tar.gz

# Download to a specific directory
wget -P /tmp/downloads/ https://example.com/file.tar.gz
```

### Resume and Continue

```bash
# Continue a partially downloaded file
wget -c https://example.com/largefile.iso

# Retry on failure (default is 20 retries)
wget --tries=5 https://example.com/file.tar.gz

# Set timeout
wget --timeout=30 https://example.com/file.tar.gz
```

### Recursive Downloads

```bash
# Download an entire website
wget -r https://example.com/docs/

# Limit recursion depth
wget -r -l 2 https://example.com/docs/

# Download only specific file types
wget -r -A "*.pdf,*.doc" https://example.com/resources/

# Mirror a website for offline viewing
wget --mirror --convert-links --page-requisites https://example.com/
```

### Background and Quiet Mode

```bash
# Download in background
wget -b https://example.com/largefile.iso
# Check progress: tail -f wget-log

# Quiet mode (no output)
wget -q https://example.com/file.tar.gz

# Show only errors
wget -nv https://example.com/file.tar.gz
```

### Authentication

```bash
# HTTP authentication
wget --user=admin --password=secret https://example.com/protected/file.txt

# FTP download
wget ftp://ftp.example.com/pub/file.tar.gz

# Use a cookies file
wget --load-cookies=cookies.txt https://example.com/download
```

### Download Multiple Files

```bash
# Download from a list of URLs
wget -i urls.txt

# Example urls.txt:
# https://example.com/file1.tar.gz
# https://example.com/file2.tar.gz
# https://example.com/file3.tar.gz
```

---

## curl — Versatile Transfer Tool

`curl` is more versatile than wget. It supports many protocols and is excellent for interacting with APIs.

### Basic Downloads

```bash
# Display content to stdout
curl https://example.com/

# Save to file (remote filename)
curl -O https://example.com/file.tar.gz

# Save with custom filename
curl -o myfile.tar.gz https://example.com/file.tar.gz

# Follow redirects
curl -L https://example.com/redirect
```

### HTTP Methods

```bash
# GET request (default)
curl https://api.example.com/users

# POST with form data
curl -X POST -d "name=John&email=john@example.com" https://api.example.com/users

# POST with JSON data
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}' \
  https://api.example.com/users

# PUT request
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane"}' \
  https://api.example.com/users/1

# DELETE request
curl -X DELETE https://api.example.com/users/1
```

### Headers and Authentication

```bash
# Custom headers
curl -H "Authorization: Bearer token123" https://api.example.com/data
curl -H "Accept: application/json" https://api.example.com/data

# Multiple headers
curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer token123" \
     https://api.example.com/data

# Basic authentication
curl -u username:password https://api.example.com/data

# Show response headers
curl -I https://example.com/
curl -i https://example.com/  # headers + body
```

### Upload Files

```bash
# Upload a file with POST
curl -F "file=@/path/to/photo.jpg" https://api.example.com/upload

# Upload multiple files
curl -F "file1=@photo1.jpg" -F "file2=@photo2.jpg" https://api.example.com/upload
```

### Useful curl Options

```bash
# Verbose output (for debugging)
curl -v https://example.com/

# Silent mode (no progress)
curl -s https://api.example.com/data

# Silent but show errors
curl -sS https://api.example.com/data

# Set timeout
curl --connect-timeout 10 --max-time 30 https://example.com/

# Resume download
curl -C - -O https://example.com/largefile.iso
```

---

## FTP and SFTP (Brief)

### sftp — Secure File Transfer

```bash
# Connect to SFTP server
sftp user@host

# Common SFTP commands (inside session):
# ls        - list remote files
# lls       - list local files
# cd dir    - change remote directory
# lcd dir   - change local directory
# get file  - download file
# put file  - upload file
# mget *.txt - download multiple files
# mput *.csv - upload multiple files
# quit      - exit

# Non-interactive file transfer
sftp user@host <<EOF
cd /remote/path
get important-file.txt
quit
EOF
```

### ftp (Legacy — Not Recommended)

```bash
# FTP is unencrypted — use SFTP instead!
# Only use FTP when no alternative exists

ftp ftp.example.com
# Commands: ls, cd, get, put, mget, mput, bye
```

---

## File Transfer Scripts

### Script: Automated Backup with rsync

```bash
#!/bin/bash
# backup.sh — Automated backup to remote server

REMOTE_USER="backup"
REMOTE_HOST="backup-server.example.com"
REMOTE_DIR="/backups/$(hostname)"
SOURCE_DIRS="/etc /home /var/www"
LOG_FILE="/var/log/backup.log"
EXCLUDE_FILE="/etc/backup-excludes.txt"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting backup..."

for dir in $SOURCE_DIRS; do
    log "Backing up $dir"
    rsync -avz --delete \
        --exclude-from="$EXCLUDE_FILE" \
        -e "ssh -i /root/.ssh/backup_key" \
        "$dir" \
        "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}${dir}/" \
        >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "Successfully backed up $dir"
    else
        log "ERROR: Failed to backup $dir"
    fi
done

log "Backup complete."
```

### Script: Batch File Downloader

```bash
#!/bin/bash
# download-batch.sh — Download multiple files with retry

DOWNLOAD_DIR="./downloads"
MAX_RETRIES=3
URLS_FILE="urls.txt"

mkdir -p "$DOWNLOAD_DIR"

download_file() {
    local url="$1"
    local filename
    filename=$(basename "$url")
    local attempt=1

    while [ $attempt -le $MAX_RETRIES ]; do
        echo "Downloading $filename (attempt $attempt/$MAX_RETRIES)..."
        
        if wget -q -c -P "$DOWNLOAD_DIR" "$url"; then
            echo "  ✓ Downloaded: $filename"
            return 0
        fi
        
        echo "  ✗ Failed, retrying..."
        attempt=$((attempt + 1))
        sleep 2
    done

    echo "  ✗ FAILED after $MAX_RETRIES attempts: $filename"
    return 1
}

# Read URLs and download each one
failed=0
total=0

while IFS= read -r url; do
    [ -z "$url" ] && continue
    [[ "$url" == \#* ]] && continue  # Skip comments
    
    total=$((total + 1))
    if ! download_file "$url"; then
        failed=$((failed + 1))
    fi
done < "$URLS_FILE"

echo ""
echo "Download complete: $((total - failed))/$total successful"
[ $failed -gt 0 ] && exit 1 || exit 0
```

### Script: Secure File Transfer with Verification

```bash
#!/bin/bash
# secure-transfer.sh — Transfer with checksum verification

transfer_and_verify() {
    local source="$1"
    local remote_user="$2"
    local remote_host="$3"
    local remote_path="$4"

    echo "Transferring: $source"
    
    # Calculate local checksum
    local local_sum
    local_sum=$(sha256sum "$source" | awk '{print $1}')
    echo "  Local SHA256: $local_sum"

    # Transfer the file
    scp "$source" "${remote_user}@${remote_host}:${remote_path}/"
    if [ $? -ne 0 ]; then
        echo "  ERROR: Transfer failed!"
        return 1
    fi

    # Verify remote checksum
    local filename
    filename=$(basename "$source")
    local remote_sum
    remote_sum=$(ssh "${remote_user}@${remote_host}" \
        "sha256sum ${remote_path}/${filename}" | awk '{print $1}')
    echo "  Remote SHA256: $remote_sum"

    if [ "$local_sum" = "$remote_sum" ]; then
        echo "  ✓ Verification passed"
        return 0
    else
        echo "  ✗ Verification FAILED — checksums don't match!"
        return 1
    fi
}

# Usage
transfer_and_verify "important-data.tar.gz" "admin" "server.com" "/backups"
```

---

## Summary

| Tool | Best For |
|------|----------|
| `scp` | Quick, one-off secure copies |
| `rsync` | Large syncs, incremental backups, mirroring |
| `wget` | Downloading from web, recursive downloads |
| `curl` | API interactions, complex HTTP requests |
| `sftp` | Interactive secure file transfer sessions |

**Tips:**
- Always prefer `rsync` over `scp` for large or repeated transfers
- Use `--dry-run` with rsync before destructive operations
- Always use SSH-based tools (scp, rsync over SSH, sftp) over plain FTP
- For automation, use key-based SSH authentication instead of passwords
