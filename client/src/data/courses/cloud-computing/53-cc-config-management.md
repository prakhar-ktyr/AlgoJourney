---
title: "Configuration Management"
---

# Configuration Management

In this lesson, you will learn how **Configuration Management (CM)** tools automate the setup, maintenance, and enforcement of consistent server configurations across your infrastructure.

While IaC creates your servers, configuration management ensures every server is set up correctly — with the right software installed, the right files in place, and the right services running.

---

## What is Configuration Management?

**Configuration Management** is the practice of automating the configuration of servers and software so that every machine is set up consistently and stays that way.

### The Problem CM Solves

Without configuration management:

```
Manual Setup:
  1. SSH into server
  2. Run: apt update && apt install nginx
  3. Edit /etc/nginx/nginx.conf
  4. Copy SSL certificates
  5. Start nginx
  6. Set up log rotation
  7. Configure firewall rules
  8. Repeat for 50 more servers...
  9. Forget a step on server #37
  10. Debug for 3 hours why server #37 is different
```

With configuration management:

```yaml
# One playbook, all 50 servers configured identically
- hosts: webservers
  roles:
    - nginx
    - ssl
    - logging
    - firewall
```

```bash
ansible-playbook setup.yml    # All 50 servers configured in minutes
```

---

## Why Configuration Management Matters

| Benefit | Description |
|---------|-------------|
| **Consistency** | Every server is configured identically |
| **Speed** | Configure hundreds of servers in minutes |
| **Reliability** | No forgotten steps or human errors |
| **Auditability** | Full record of what's configured and why |
| **Compliance** | Enforce security policies automatically |
| **Recovery** | Rebuild servers from scratch quickly |
| **Scale** | Same effort for 1 server or 1,000 |

---

## Configuration Management Tools

### Tool Comparison

| Feature | Ansible | Chef | Puppet | SaltStack |
|---------|---------|------|--------|-----------|
| **Language** | YAML | Ruby DSL | Puppet DSL | YAML/Jinja |
| **Architecture** | Agentless (SSH) | Agent-based | Agent-based | Agent or agentless |
| **Learning curve** | Low | High | Medium | Medium |
| **Push/Pull** | Push | Pull | Pull | Both |
| **Popularity** | Highest | Declining | Stable | Niche |
| **Owned by** | Red Hat (IBM) | Progress | Perforce | VMware |

### Push vs Pull

```
Push Model (Ansible):
  Control Node ──SSH──▶ Server 1
               ──SSH──▶ Server 2
               ──SSH──▶ Server 3
  "I push config TO the servers"

Pull Model (Puppet/Chef):
  Server 1 ──poll──▶ Config Server
  Server 2 ──poll──▶ Config Server
  Server 3 ──poll──▶ Config Server
  "Servers pull config FROM the server"
```

| Aspect | Push | Pull |
|--------|------|------|
| **Agent needed?** | No (uses SSH) | Yes |
| **Trigger** | Manual or CI/CD | Scheduled (every 30 min) |
| **Scalability** | Good (thousands) | Better (tens of thousands) |
| **Real-time** | Yes (on demand) | Eventual (next poll cycle) |
| **Firewall** | Outbound SSH from control | Outbound HTTPS from nodes |

---

## Ansible Deep Dive

Ansible is the most popular configuration management tool due to its simplicity and agentless architecture.

### How Ansible Works

```
┌────────────────┐         SSH         ┌──────────────┐
│  Control Node  │────────────────────▶│  Managed     │
│                │                      │  Node 1      │
│  - Playbooks   │         SSH         ├──────────────┤
│  - Inventory   │────────────────────▶│  Managed     │
│  - Modules     │                      │  Node 2      │
│                │         SSH         ├──────────────┤
│                │────────────────────▶│  Managed     │
│                │                      │  Node 3      │
└────────────────┘                      └──────────────┘
```

**Requirements:**
- Control node: Python 3, Ansible installed
- Managed nodes: Python 3, SSH access — that's it!

### Inventory

The inventory defines which servers Ansible manages:

```ini
# inventory.ini

[webservers]
web1.example.com
web2.example.com
web3.example.com

[databases]
db1.example.com
db2.example.com

[loadbalancers]
lb1.example.com

# Group of groups
[production:children]
webservers
databases
loadbalancers

# Variables for a group
[webservers:vars]
http_port=80
max_clients=200
```

### Dynamic Inventory

For cloud environments, use dynamic inventory to auto-discover servers:

```bash
# AWS dynamic inventory
ansible-inventory -i aws_ec2.yml --list

# aws_ec2.yml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
filters:
  tag:Environment: production
keyed_groups:
  - key: tags.Role
    prefix: role
```

### Playbooks

Playbooks are YAML files that define what Ansible should do:

```yaml
# webserver-setup.yml
---
- name: Configure Web Servers
  hosts: webservers
  become: true              # Run as root (sudo)

  vars:
    http_port: 80
    server_name: "example.com"
    document_root: /var/www/html

  tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Install Nginx
      apt:
        name: nginx
        state: present

    - name: Create document root
      file:
        path: "{{ document_root }}"
        state: directory
        owner: www-data
        group: www-data
        mode: "0755"

    - name: Copy Nginx configuration
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
        owner: root
        group: root
        mode: "0644"
      notify: Restart Nginx

    - name: Copy index page
      copy:
        src: files/index.html
        dest: "{{ document_root }}/index.html"
        owner: www-data
        group: www-data
        mode: "0644"

    - name: Ensure Nginx is running and enabled
      service:
        name: nginx
        state: started
        enabled: true

    - name: Allow HTTP through firewall
      ufw:
        rule: allow
        port: "{{ http_port }}"
        proto: tcp

  handlers:
    - name: Restart Nginx
      service:
        name: nginx
        state: restarted
```

### Templates (Jinja2)

Ansible uses Jinja2 templates for dynamic configuration files:

```nginx
# templates/nginx.conf.j2
server {
    listen {{ http_port }};
    server_name {{ server_name }};
    root {{ document_root }};

    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Access log
    access_log /var/log/nginx/{{ server_name }}_access.log;
    error_log /var/log/nginx/{{ server_name }}_error.log;
}
```

### Roles

Roles organize playbooks into reusable, shareable components:

```
roles/
└── nginx/
    ├── tasks/
    │   └── main.yml        # Tasks to execute
    ├── handlers/
    │   └── main.yml        # Handlers (restart, reload)
    ├── templates/
    │   └── nginx.conf.j2   # Configuration templates
    ├── files/
    │   └── index.html      # Static files to copy
    ├── vars/
    │   └── main.yml        # Variables for this role
    ├── defaults/
    │   └── main.yml        # Default variable values
    └── meta/
        └── main.yml        # Role metadata and dependencies
```

```yaml
# roles/nginx/tasks/main.yml
---
- name: Install Nginx
  apt:
    name: nginx
    state: present

- name: Configure Nginx
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/sites-available/default
  notify: Restart Nginx

- name: Start Nginx
  service:
    name: nginx
    state: started
    enabled: true
```

```yaml
# Using roles in a playbook
---
- name: Configure Web Servers
  hosts: webservers
  become: true
  roles:
    - nginx
    - ssl
    - monitoring
```

### Ansible Galaxy

Ansible Galaxy is a marketplace for sharing roles:

```bash
# Install a role from Galaxy
ansible-galaxy install geerlingguy.nginx

# Install roles from a requirements file
ansible-galaxy install -r requirements.yml
```

```yaml
# requirements.yml
roles:
  - name: geerlingguy.nginx
    version: "3.2.0"
  - name: geerlingguy.docker
    version: "7.1.0"
  - name: geerlingguy.certbot
    version: "5.1.0"

collections:
  - name: amazon.aws
    version: "7.0.0"
```

### Common Ansible Modules

| Module | Purpose | Example |
|--------|---------|---------|
| `apt` / `yum` | Package management | Install software |
| `copy` | Copy files to remote | Static config files |
| `template` | Render Jinja2 templates | Dynamic config files |
| `service` | Manage services | Start/stop/restart |
| `file` | Manage files and directories | Permissions, ownership |
| `user` | Manage user accounts | Create users |
| `git` | Clone Git repositories | Deploy code |
| `docker_container` | Manage Docker containers | Run containers |
| `command` / `shell` | Run arbitrary commands | Custom scripts |
| `cron` | Manage cron jobs | Scheduled tasks |

---

## Cloud-Native Configuration Management

### AWS Systems Manager (SSM)

AWS Systems Manager provides configuration management without SSH:

```yaml
# SSM Document (Run Command)
schemaVersion: "2.2"
description: "Install and configure Nginx"
mainSteps:
  - action: "aws:runShellScript"
    name: "installNginx"
    inputs:
      runCommand:
        - "yum install -y nginx"
        - "systemctl start nginx"
        - "systemctl enable nginx"
```

```bash
# Run on all instances with a specific tag
aws ssm send-command \
  --document-name "InstallNginx" \
  --targets "Key=tag:Role,Values=webserver"
```

### AWS SSM Features

| Feature | Purpose |
|---------|---------|
| **Run Command** | Execute commands on multiple instances |
| **State Manager** | Enforce desired state on a schedule |
| **Patch Manager** | Automate OS patching |
| **Parameter Store** | Centralized configuration and secrets |
| **Session Manager** | Secure shell access without SSH keys |

### Azure Automation

```powershell
# Azure Automation DSC (Desired State Configuration)
Configuration WebServerConfig {
    Node "webserver" {
        WindowsFeature IIS {
            Ensure = "Present"
            Name   = "Web-Server"
        }

        File WebContent {
            Ensure          = "Present"
            Type            = "Directory"
            DestinationPath = "C:\inetpub\wwwroot"
        }
    }
}
```

---

## Cloud-Init and User Data

**Cloud-Init** is the standard for initializing cloud instances at first boot:

```yaml
# cloud-init configuration
#cloud-config
package_update: true
package_upgrade: true

packages:
  - nginx
  - git
  - curl

write_files:
  - path: /var/www/html/index.html
    content: |
      <html>
        <body><h1>Hello from Cloud-Init!</h1></body>
      </html>
    owner: www-data:www-data
    permissions: "0644"

runcmd:
  - systemctl start nginx
  - systemctl enable nginx

users:
  - name: deploy
    groups: sudo
    shell: /bin/bash
    sudo: ["ALL=(ALL) NOPASSWD:ALL"]
    ssh_authorized_keys:
      - ssh-rsa AAAA...your-public-key
```

### User Data in Terraform

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = "t3.micro"

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y nginx
    systemctl start nginx
    systemctl enable nginx
  EOF

  # Or use cloud-init from a file
  # user_data = file("cloud-init.yml")
}
```

### When to Use Cloud-Init vs CM Tools

| Scenario | Use Cloud-Init | Use Ansible/CM |
|----------|---------------|---------------|
| First boot setup | ✅ | ❌ (not running yet) |
| Install base packages | ✅ | ✅ |
| Ongoing configuration | ❌ | ✅ |
| Configuration updates | ❌ (only runs once) | ✅ |
| Complex multi-step setup | ❌ | ✅ |
| Coordinating across servers | ❌ | ✅ |

---

## Immutable Infrastructure

**Immutable infrastructure** takes a different approach: instead of updating servers in place, you replace them entirely with new, pre-configured images.

### Mutable vs Immutable

```
Mutable Infrastructure:
  Server created → Updated → Updated → Updated → ...
  (Snowflake servers — each one is slightly different)

Immutable Infrastructure:
  Image v1 built → Deployed
  Image v2 built → Deployed (v1 destroyed)
  Image v3 built → Deployed (v2 destroyed)
  (Every server is identical — created from the same image)
```

### Golden Images

A **golden image** (AMI on AWS, VM Image on Azure) is a pre-built, fully configured server image:

```
┌───────────────────────────────────────┐
│          Golden Image Pipeline         │
│                                        │
│  Base OS ──▶ Install packages          │
│           ──▶ Configure services       │
│           ──▶ Harden security          │
│           ──▶ Run tests                │
│           ──▶ Create AMI/Image         │
│           ──▶ Deploy from image        │
└───────────────────────────────────────┘
```

### Building Images with Packer

HashiCorp **Packer** builds identical machine images for multiple platforms:

```hcl
# packer.pkr.hcl
packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1"
    }
  }
}

source "amazon-ebs" "web" {
  ami_name      = "web-server-{{timestamp}}"
  instance_type = "t3.micro"
  region        = "us-east-1"

  source_ami_filter {
    filters = {
      name                = "amzn2-ami-hvm-*-x86_64-gp2"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["amazon"]
    most_recent = true
  }

  ssh_username = "ec2-user"
}

build {
  sources = ["source.amazon-ebs.web"]

  # Use Ansible to configure the image
  provisioner "ansible" {
    playbook_file = "playbooks/web-server.yml"
  }

  # Run tests to validate the image
  provisioner "shell" {
    inline = [
      "curl -s http://localhost | grep 'Welcome'",
      "nginx -t"
    ]
  }
}
```

```bash
# Build the image
packer build packer.pkr.hcl
# Output: ami-0abc123def456  (use this in Terraform)
```

### AMI Pipeline

```
Code Change
    │
    ▼
CI/CD triggers Packer build
    │
    ▼
Packer creates temporary EC2 instance
    │
    ▼
Ansible configures the instance
    │
    ▼
Tests validate the configuration
    │
    ▼
Packer creates AMI from the instance
    │
    ▼
Terraform deploys new instances from AMI
    │
    ▼
Old instances are terminated
```

---

## Configuration Management vs IaC

CM and IaC are complementary, not competing:

| Aspect | IaC (Terraform) | CM (Ansible) |
|--------|-----------------|--------------|
| **Purpose** | Create infrastructure | Configure infrastructure |
| **What it manages** | VPCs, instances, databases, DNS | Packages, files, services, users |
| **When it runs** | When infrastructure changes | When configuration changes |
| **State** | Tracks resource state | Desired state enforcement |
| **Example** | "Create 3 EC2 instances" | "Install Nginx on those instances" |

### When to Use Each

```
Use IaC when:
  ✅ Creating/destroying cloud resources
  ✅ Managing networks, load balancers, databases
  ✅ Setting up cloud services (S3, RDS, etc.)

Use CM when:
  ✅ Installing and configuring software
  ✅ Managing files and templates
  ✅ Enforcing ongoing compliance
  ✅ Coordinating across multiple servers

Use Both together:
  Terraform creates the infrastructure
       ↓
  Ansible configures the servers
```

### The Modern Approach

In practice, many teams use **immutable infrastructure** which reduces the need for CM:

```
Traditional:          Terraform → Create VMs → Ansible → Configure VMs
Immutable:            Packer+Ansible → Build Image → Terraform → Deploy Image
Containerized:        Dockerfile → Build Image → Terraform → Deploy Container
```

---

## Desired State Configuration

All CM tools work on the principle of **desired state** — you declare what the system should look like, and the tool ensures it matches:

```yaml
# Ansible: desired state examples
- name: Ensure Nginx is installed
  apt:
    name: nginx
    state: present     # "present" means installed

- name: Ensure old package is removed
  apt:
    name: apache2
    state: absent      # "absent" means not installed

- name: Ensure Nginx is running
  service:
    name: nginx
    state: started     # "started" means running
    enabled: true      # "enabled" means starts on boot
```

If Nginx is already installed, Ansible does nothing. If it's missing, Ansible installs it. This is **idempotent** — safe to run repeatedly.

---

## Compliance as Code

**Compliance as Code** uses CM tools to enforce security and regulatory requirements:

```yaml
# compliance-checks.yml
---
- name: Enforce Security Compliance
  hosts: all
  become: true
  tasks:
    # CIS Benchmark: Disable root SSH login
    - name: Disable root SSH login
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "^PermitRootLogin"
        line: "PermitRootLogin no"
      notify: Restart SSH

    # CIS Benchmark: Set password max age
    - name: Set password maximum age to 90 days
      lineinfile:
        path: /etc/login.defs
        regexp: "^PASS_MAX_DAYS"
        line: "PASS_MAX_DAYS 90"

    # CIS Benchmark: Ensure firewall is running
    - name: Ensure UFW is enabled
      ufw:
        state: enabled
        policy: deny

    # CIS Benchmark: Allow only necessary ports
    - name: Allow SSH
      ufw:
        rule: allow
        port: "22"
        proto: tcp

    # Audit: Check for unauthorized users
    - name: Get list of users with UID 0
      shell: "awk -F: '($3 == 0) {print $1}' /etc/passwd"
      register: root_users
      changed_when: false

    - name: Verify only root has UID 0
      assert:
        that: root_users.stdout_lines == ["root"]
        fail_msg: "Unauthorized UID 0 users found!"

  handlers:
    - name: Restart SSH
      service:
        name: sshd
        state: restarted
```

### Compliance Tools

| Tool | Purpose |
|------|---------|
| **InSpec** | Compliance testing framework (by Chef) |
| **OpenSCAP** | Security compliance scanning |
| **Ansible + CIS roles** | Enforce CIS benchmarks |
| **AWS Config Rules** | Cloud resource compliance |
| **Azure Policy** | Azure resource compliance |

---

## Practical: Ansible Playbook for Web Server Setup

Let's build a complete Ansible project for configuring a production-ready web server:

### Project Structure

```
ansible-webserver/
├── ansible.cfg
├── inventory/
│   ├── production.ini
│   └── staging.ini
├── playbooks/
│   └── site.yml
├── roles/
│   ├── common/
│   │   └── tasks/
│   │       └── main.yml
│   ├── nginx/
│   │   ├── tasks/
│   │   │   └── main.yml
│   │   ├── templates/
│   │   │   └── nginx.conf.j2
│   │   ├── handlers/
│   │   │   └── main.yml
│   │   └── defaults/
│   │       └── main.yml
│   └── security/
│       └── tasks/
│           └── main.yml
└── group_vars/
    └── webservers.yml
```

### Configuration

```ini
# ansible.cfg
[defaults]
inventory = inventory/production.ini
remote_user = ubuntu
private_key_file = ~/.ssh/deploy_key
host_key_checking = false
retry_files_enabled = false

[privilege_escalation]
become = true
become_method = sudo
```

### Inventory

```ini
# inventory/production.ini
[webservers]
web1 ansible_host=10.0.1.10
web2 ansible_host=10.0.1.11
web3 ansible_host=10.0.1.12

[webservers:vars]
ansible_python_interpreter=/usr/bin/python3
```

### Group Variables

```yaml
# group_vars/webservers.yml
---
http_port: 80
https_port: 443
server_name: "example.com"
document_root: /var/www/html
max_worker_connections: 1024
```

### Main Playbook

```yaml
# playbooks/site.yml
---
- name: Configure Web Servers
  hosts: webservers
  become: true

  roles:
    - common
    - security
    - nginx
```

### Common Role

```yaml
# roles/common/tasks/main.yml
---
- name: Update apt cache
  apt:
    update_cache: true
    cache_valid_time: 3600

- name: Install common packages
  apt:
    name:
      - curl
      - wget
      - git
      - unzip
      - htop
      - vim
    state: present

- name: Set timezone
  timezone:
    name: UTC

- name: Configure NTP
  apt:
    name: chrony
    state: present

- name: Ensure NTP is running
  service:
    name: chrony
    state: started
    enabled: true
```

### Security Role

```yaml
# roles/security/tasks/main.yml
---
- name: Disable root SSH login
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "^PermitRootLogin"
    line: "PermitRootLogin no"
  notify: Restart SSH

- name: Disable password authentication
  lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "^PasswordAuthentication"
    line: "PasswordAuthentication no"
  notify: Restart SSH

- name: Install and enable UFW
  apt:
    name: ufw
    state: present

- name: Set UFW default policy
  ufw:
    state: enabled
    policy: deny

- name: Allow SSH
  ufw:
    rule: allow
    port: "22"
    proto: tcp

- name: Allow HTTP
  ufw:
    rule: allow
    port: "{{ http_port }}"
    proto: tcp

- name: Allow HTTPS
  ufw:
    rule: allow
    port: "{{ https_port }}"
    proto: tcp

- name: Install fail2ban
  apt:
    name: fail2ban
    state: present

- name: Start fail2ban
  service:
    name: fail2ban
    state: started
    enabled: true
```

### Nginx Role

```yaml
# roles/nginx/defaults/main.yml
---
nginx_worker_processes: auto
nginx_worker_connections: 1024
```

```yaml
# roles/nginx/tasks/main.yml
---
- name: Install Nginx
  apt:
    name: nginx
    state: present

- name: Create document root
  file:
    path: "{{ document_root }}"
    state: directory
    owner: www-data
    group: www-data
    mode: "0755"

- name: Deploy Nginx configuration
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/sites-available/default
    owner: root
    group: root
    mode: "0644"
  notify: Reload Nginx

- name: Ensure Nginx is running
  service:
    name: nginx
    state: started
    enabled: true
```

```yaml
# roles/nginx/handlers/main.yml
---
- name: Reload Nginx
  service:
    name: nginx
    state: reloaded

- name: Restart Nginx
  service:
    name: nginx
    state: restarted
```

### Running the Playbook

```bash
# Check syntax
ansible-playbook playbooks/site.yml --syntax-check

# Dry run (show what would change)
ansible-playbook playbooks/site.yml --check --diff

# Run for real
ansible-playbook playbooks/site.yml

# Run on specific hosts
ansible-playbook playbooks/site.yml --limit web1

# Run with verbose output
ansible-playbook playbooks/site.yml -vv
```

### Example Output

```
PLAY [Configure Web Servers] **************************************************

TASK [common : Update apt cache] **********************************************
ok: [web1]
ok: [web2]
ok: [web3]

TASK [common : Install common packages] ***************************************
changed: [web1]
changed: [web2]
changed: [web3]

TASK [security : Disable root SSH login] **************************************
changed: [web1]
changed: [web2]
changed: [web3]

TASK [nginx : Install Nginx] **************************************************
changed: [web1]
changed: [web2]
changed: [web3]

PLAY RECAP ********************************************************************
web1  : ok=12  changed=8  unreachable=0  failed=0  skipped=0
web2  : ok=12  changed=8  unreachable=0  failed=0  skipped=0
web3  : ok=12  changed=8  unreachable=0  failed=0  skipped=0
```

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Configuration Management** | Automate server setup and enforce consistency |
| **Ansible** | Agentless CM tool using YAML playbooks over SSH |
| **Playbooks** | YAML files defining tasks to configure servers |
| **Roles** | Reusable, shareable packages of Ansible tasks |
| **Immutable infrastructure** | Replace servers instead of updating them |
| **Golden images** | Pre-built, fully configured server images |
| **CM vs IaC** | IaC creates infra; CM configures it — use both |
| **Compliance as Code** | Automate security policy enforcement |

---

## Exercises

1. **Write an Ansible playbook** that installs Docker on Ubuntu servers, adds a deploy user to the docker group, and starts a sample container.

2. **Create Ansible roles** for a three-tier application: web server (Nginx), app server (Node.js), and database (PostgreSQL). Use the roles in a single playbook.

3. **Build a golden image pipeline** using Packer and Ansible. Create an AMI with Nginx pre-installed and configured. Deploy it with Terraform.

4. **Write a compliance playbook** that checks and enforces at least 5 CIS benchmark recommendations on your servers.

5. **Compare mutable vs immutable** approaches: set up the same web server using (a) Terraform + Ansible and (b) Packer + Terraform. Which approach would you choose for production and why?

---

## Further Reading

- Ansible Documentation — modules, playbooks, and best practices
- "Ansible for DevOps" by Jeff Geerling — comprehensive Ansible guide
- HashiCorp Packer Documentation — building machine images
- CIS Benchmarks — security configuration standards
- AWS Systems Manager User Guide — cloud-native configuration management

---
