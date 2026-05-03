---
title: Disk Management
---

# Disk Management

Managing disk space, partitions, and filesystems is essential for system administration. This lesson covers the tools you need to monitor storage, mount drives, and manage disk resources.

---

## df — Disk Free Space

The `df` command shows how much space is available on mounted filesystems.

### Basic Usage

```bash
$ df
Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/sda1      102400000  45678912  51234567  48% /
tmpfs            8192000         0   8192000   0% /dev/shm
/dev/sdb1      512000000 234567890 252345678  49% /home
```

### Human-Readable Output

```bash
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        98G   44G   49G  48% /
tmpfs           7.8G     0  7.8G   0% /dev/shm
/dev/sdb1       489G  224G  241G  49% /home
```

### Useful df Options

```bash
# Human-readable
df -h

# Show filesystem type
df -T

# Show only specific filesystem type
df -t ext4

# Show specific mount point
df -h /home

# Show inodes instead of blocks
df -i
```

### Example: Disk Space Alert Script

```bash
#!/bin/bash

THRESHOLD=80

echo "=== Disk Space Report ==="
echo ""

df -h | awk 'NR>1 {print $5, $6}' | while read usage mount; do
  percent=${usage%\%}
  if [ "$percent" -ge "$THRESHOLD" ] 2>/dev/null; then
    echo "  WARNING: $mount is ${usage} full!"
  fi
done
```

---

## du — Directory/File Size

The `du` command shows how much space files and directories are using.

### Basic Usage

```bash
# Show size of current directory and subdirectories
$ du -h
4.0K    ./config
12M     ./node_modules/express
450M    ./node_modules
12K     ./src
462M    .
```

### Common du Commands

```bash
# Summary — total size of a directory
du -sh /home/alice
# Output: 15G    /home/alice

# Top-level subdirectories only
du -h --max-depth=1 /home/alice
# Output:
# 3.2G   /home/alice/Documents
# 5.8G   /home/alice/Pictures
# 2.1G   /home/alice/.cache
# 15G    /home/alice

# Multiple specific directories
du -sh /var/log /tmp /home

# Exclude patterns
du -sh --exclude="*.log" /var

# Sort by size (largest first)
du -h --max-depth=1 /home | sort -hr
```

### Find Large Files and Directories

```bash
# Top 10 largest directories
du -h --max-depth=1 / 2>/dev/null | sort -hr | head -10

# Find files larger than 100MB
find / -type f -size +100M -exec ls -lh {} \; 2>/dev/null

# Find files larger than 1GB
find /home -type f -size +1G -print
```

---

## lsblk — List Block Devices

`lsblk` shows all block devices (disks, partitions, etc.) in a tree format:

```bash
$ lsblk
NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   100G  0 disk
├─sda1   8:1    0    95G  0 part /
├─sda2   8:2    0     1K  0 part
└─sda5   8:5    0     5G  0 part [SWAP]
sdb      8:16   0   500G  0 disk
└─sdb1   8:17   0   500G  0 part /home
sr0     11:0    1  1024M  0 rom
```

### Useful lsblk Options

```bash
# Show filesystem type
lsblk -f

# Show sizes in human-readable format
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT

# Show all information
lsblk -a

# Show only specific device
lsblk /dev/sda
```

### Example Output with Filesystem Info

```bash
$ lsblk -f
NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
sda
├─sda1 ext4         a1b2c3d4-e5f6-7890-abcd-ef1234567890 /
├─sda2
└─sda5 swap         12345678-abcd-ef01-2345-678901234567 [SWAP]
sdb
└─sdb1 ext4   data  87654321-dcba-10fe-5432-109876543210 /home
```

---

## fdisk — Partition Management

`fdisk` is the traditional tool for managing disk partitions.

> **Warning:** Modifying partitions can destroy data. Always back up first!

### View Partition Table

```bash
# List partitions on all disks
sudo fdisk -l

# List partitions on a specific disk
sudo fdisk -l /dev/sda
```

### Example Output

```bash
$ sudo fdisk -l /dev/sda
Disk /dev/sda: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes

Device     Boot     Start       End   Sectors  Size Id Type
/dev/sda1  *         2048 199229439 199227392   95G 83 Linux
/dev/sda2       199231486 209715199  10483714    5G  5 Extended
/dev/sda5       199231488 209715199  10483712    5G 82 Linux swap
```

### Interactive Partition Editing

```bash
# Open fdisk for a disk (interactive mode)
sudo fdisk /dev/sdb
```

Common fdisk commands (inside the interactive prompt):

| Command | Action |
|---------|--------|
| `p` | Print partition table |
| `n` | Create new partition |
| `d` | Delete a partition |
| `t` | Change partition type |
| `w` | Write changes and exit |
| `q` | Quit without saving |

> **Modern alternative:** Use `gdisk` for GPT partition tables or `parted` for a more user-friendly experience.

---

## Filesystem Types

| Filesystem | Description | Use Case |
|-----------|-------------|----------|
| **ext4** | Most common Linux filesystem | General purpose (default on most distros) |
| **xfs** | High-performance, scalable | Large files, enterprise servers |
| **btrfs** | Copy-on-write, snapshots | Advanced features, NAS |
| **ntfs** | Windows filesystem | Dual-boot, external drives |
| **fat32/vfat** | Universal compatibility | USB drives, boot partitions |
| **exfat** | Large file FAT | USB drives, cross-platform |
| **tmpfs** | RAM-based filesystem | Temporary files (/tmp) |

---

## mkfs — Create a Filesystem

After creating a partition, you need to format it with a filesystem:

```bash
# Create ext4 filesystem
sudo mkfs.ext4 /dev/sdb1

# Create ext4 with a label
sudo mkfs.ext4 -L "mydata" /dev/sdb1

# Create XFS filesystem
sudo mkfs.xfs /dev/sdb1

# Create FAT32 (for USB drives)
sudo mkfs.vfat -F 32 /dev/sdb1

# Create exFAT
sudo mkfs.exfat /dev/sdb1
```

> **Warning:** Formatting erases ALL data on the partition!

---

## mount — Mount Filesystems

Mounting makes a filesystem accessible at a directory (mount point).

### Basic Mount

```bash
# Create a mount point
sudo mkdir -p /mnt/data

# Mount a partition
sudo mount /dev/sdb1 /mnt/data

# Verify it's mounted
mount | grep sdb1
df -h /mnt/data
```

### Mount Options

```bash
# Mount as read-only
sudo mount -o ro /dev/sdb1 /mnt/data

# Mount with specific filesystem type
sudo mount -t ntfs /dev/sdb1 /mnt/windows

# Mount with multiple options
sudo mount -o rw,noexec,nosuid /dev/sdb1 /mnt/data
```

### Common Mount Options

| Option | Description |
|--------|-------------|
| `rw` | Read-write (default) |
| `ro` | Read-only |
| `noexec` | Prevent executing binaries |
| `nosuid` | Ignore setuid bits |
| `nodev` | Ignore device files |
| `noatime` | Don't update access times (performance) |
| `defaults` | rw, suid, dev, exec, auto, nouser, async |

---

## umount — Unmount Filesystems

```bash
# Unmount by mount point
sudo umount /mnt/data

# Unmount by device
sudo umount /dev/sdb1

# Force unmount (if busy)
sudo umount -f /mnt/data

# Lazy unmount (detach now, cleanup when not busy)
sudo umount -l /mnt/data
```

### "Device is busy" Error

```bash
# Find what's using the mount point
lsof +f -- /mnt/data

# Or use fuser
fuser -mv /mnt/data

# Kill processes using the mount
fuser -km /mnt/data
```

---

## /etc/fstab — Automatic Mounting at Boot

The `/etc/fstab` file defines filesystems that are mounted automatically at boot.

### View Current fstab

```bash
$ cat /etc/fstab
# <device>                                <mount>   <type> <options>       <dump> <pass>
UUID=a1b2c3d4-e5f6-7890-abcd-ef1234567890 /         ext4   errors=remount-ro 0      1
UUID=12345678-abcd-ef01-2345-678901234567 none       swap   sw               0      0
UUID=87654321-dcba-10fe-5432-109876543210 /home      ext4   defaults         0      2
```

### fstab Fields

| Field | Description |
|-------|-------------|
| Device | UUID or device path (`/dev/sdb1`) |
| Mount point | Where to mount (`/home`, `/mnt/data`) |
| Type | Filesystem type (`ext4`, `xfs`, `ntfs`) |
| Options | Mount options (`defaults`, `noatime`) |
| Dump | Backup utility flag (usually `0`) |
| Pass | fsck order (`0`=skip, `1`=root, `2`=other) |

### Adding an Entry to fstab

```bash
# First, find the UUID
sudo blkid /dev/sdb1
# Output: /dev/sdb1: UUID="87654321-dcba-10fe-5432-109876543210" TYPE="ext4"

# Add to fstab
echo 'UUID=87654321-dcba-10fe-5432-109876543210 /mnt/data ext4 defaults,noatime 0 2' | \
  sudo tee -a /etc/fstab

# Test the fstab entry (mount without rebooting)
sudo mount -a

# Verify
df -h /mnt/data
```

> **Tip:** Always use UUID instead of `/dev/sdX` — device names can change between reboots!

---

## Swap Space

Swap is disk space used as "overflow" when RAM is full.

### Check Current Swap

```bash
$ swapon --show
NAME      TYPE      SIZE  USED PRIO
/dev/sda5 partition   5G  128M   -2

$ free -h
              total        used        free      shared  buff/cache   available
Mem:           16G         8G        3.2G        512M       4.8G        7.1G
Swap:          5G        128M        4.9G
```

### Create a Swap File

```bash
# Create a 4GB swap file
sudo fallocate -l 4G /swapfile

# Set correct permissions
sudo chmod 600 /swapfile

# Set up swap area
sudo mkswap /swapfile

# Enable the swap file
sudo swapon /swapfile

# Verify
swapon --show
```

### Make Swap Permanent

Add to `/etc/fstab`:

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Disable Swap

```bash
# Disable specific swap
sudo swapoff /swapfile

# Disable all swap
sudo swapoff -a
```

### Adjust Swappiness

Swappiness controls how aggressively Linux uses swap (0-100):

```bash
# Check current swappiness
cat /proc/sys/vm/swappiness
# Default: 60

# Set temporarily
sudo sysctl vm.swappiness=10

# Set permanently
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

---

## LVM Basics

**Logical Volume Manager** (LVM) adds a layer of abstraction over physical disks, allowing flexible resizing and management.

### LVM Concepts

```
Physical Volumes (PV) → Volume Groups (VG) → Logical Volumes (LV)

┌─────────┐  ┌─────────┐
│  /dev/sdb│  │ /dev/sdc│    ← Physical Volumes
└────┬────┘  └────┬────┘
     │            │
     └──────┬─────┘
            │
     ┌──────┴──────┐
     │   vg_data   │              ← Volume Group
     └──────┬──────┘
            │
     ┌──────┼──────┐
     │      │      │
  ┌──┴──┐┌──┴──┐┌──┴──┐
  │lv_web││lv_db││lv_log│        ← Logical Volumes
  └─────┘└─────┘└─────┘
```

### Basic LVM Commands

```bash
# Create Physical Volumes
sudo pvcreate /dev/sdb /dev/sdc

# Create a Volume Group
sudo vgcreate vg_data /dev/sdb /dev/sdc

# Create a Logical Volume (50GB)
sudo lvcreate -L 50G -n lv_web vg_data

# Format the Logical Volume
sudo mkfs.ext4 /dev/vg_data/lv_web

# Mount it
sudo mount /dev/vg_data/lv_web /var/www
```

### Resize LVM Volumes

```bash
# Extend a logical volume by 20GB
sudo lvextend -L +20G /dev/vg_data/lv_web

# Resize the filesystem to fill the volume
sudo resize2fs /dev/vg_data/lv_web

# Or do both in one command
sudo lvextend -L +20G --resizefs /dev/vg_data/lv_web
```

### View LVM Info

```bash
# Show physical volumes
sudo pvs
sudo pvdisplay

# Show volume groups
sudo vgs
sudo vgdisplay

# Show logical volumes
sudo lvs
sudo lvdisplay
```

---

## Disk Management Commands Cheat Sheet

### Monitor Disk Usage

```bash
#!/bin/bash

echo "=== Disk Management Overview ==="
echo ""

echo "--- Disk Space (df -h) ---"
df -h | grep -v tmpfs
echo ""

echo "--- Block Devices (lsblk) ---"
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
echo ""

echo "--- Largest Directories in /home ---"
du -h --max-depth=1 /home 2>/dev/null | sort -hr | head -10
echo ""

echo "--- Swap Usage ---"
swapon --show
echo ""

echo "--- Inode Usage ---"
df -ih | grep -v tmpfs
```

### Complete Disk Setup Workflow

```bash
#!/bin/bash

# Example: Set up a new data disk (/dev/sdb)
# WARNING: This will ERASE all data on /dev/sdb!

DISK="/dev/sdb"
PARTITION="${DISK}1"
MOUNT_POINT="/mnt/data"
LABEL="data"

echo "=== Setting up $DISK ==="

# Create partition (entire disk, single partition)
echo "Creating partition..."
echo -e "n\np\n1\n\n\nw" | sudo fdisk "$DISK"

# Wait for kernel to update
sleep 2

# Create filesystem
echo "Creating ext4 filesystem..."
sudo mkfs.ext4 -L "$LABEL" "$PARTITION"

# Create mount point
sudo mkdir -p "$MOUNT_POINT"

# Get UUID
UUID=$(sudo blkid -s UUID -o value "$PARTITION")
echo "UUID: $UUID"

# Add to fstab
echo "Adding to /etc/fstab..."
echo "UUID=$UUID $MOUNT_POINT ext4 defaults,noatime 0 2" | sudo tee -a /etc/fstab

# Mount
sudo mount -a

# Verify
echo ""
echo "=== Verification ==="
df -h "$MOUNT_POINT"
echo ""
echo "Done! $PARTITION mounted at $MOUNT_POINT"
```

### Disk Space Cleanup Script

```bash
#!/bin/bash

echo "=== Disk Space Cleanup ==="
echo ""

# Show current usage
echo "Current disk usage:"
df -h / | tail -1
echo ""

# Clean package cache
echo "--- Cleaning package cache ---"
if command -v apt &>/dev/null; then
  sudo apt clean
  sudo apt autoremove -y
elif command -v dnf &>/dev/null; then
  sudo dnf clean all
fi

# Clean systemd journal
echo "--- Cleaning old journal logs ---"
sudo journalctl --vacuum-time=7days 2>/dev/null

# Clean /tmp files older than 7 days
echo "--- Cleaning old temp files ---"
sudo find /tmp -type f -atime +7 -delete 2>/dev/null

# Show result
echo ""
echo "After cleanup:"
df -h / | tail -1
```

---

## Summary

| Command | Purpose |
|---------|---------|
| `df -h` | Show free disk space |
| `du -sh dir` | Show directory size |
| `lsblk` | List block devices |
| `fdisk -l` | Show partition tables |
| `mkfs.ext4` | Create ext4 filesystem |
| `mount` | Mount a filesystem |
| `umount` | Unmount a filesystem |
| `/etc/fstab` | Auto-mount configuration |
| `mkswap` / `swapon` | Set up swap space |
| `blkid` | Show block device UUIDs |
| `pvs` / `vgs` / `lvs` | LVM information |

**Congratulations!** You now have a solid foundation in Linux disk management. These skills are essential for system administration and DevOps work.
