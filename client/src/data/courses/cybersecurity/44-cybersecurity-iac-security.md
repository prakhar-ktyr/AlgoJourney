---
title: Infrastructure as Code Security
---

# Infrastructure as Code Security

Infrastructure as Code (IaC) defines cloud resources in version-controlled configuration files. While IaC brings consistency and repeatability, it also means a single misconfiguration can be replicated across an entire environment instantly.

---

## What is IaC?

IaC tools translate human-readable configuration into cloud infrastructure:

| Tool | Language | Provider |
|---|---|---|
| Terraform | HCL | Multi-cloud |
| CloudFormation | JSON/YAML | AWS |
| Bicep | Bicep DSL | Azure |
| Pulumi | Python/TypeScript/Go | Multi-cloud |
| Ansible | YAML | Multi-platform |
| CDK | TypeScript/Python | AWS |

---

## Security Risks in IaC

| Risk | Example | Impact |
|---|---|---|
| Hardcoded secrets | API keys in `.tf` files | Credential exposure via version control |
| Overly permissive IAM | `Action: "*"` on all resources | Full account compromise |
| Public resources | S3 bucket with public ACL | Data breach |
| Missing encryption | Unencrypted RDS instance | Data exposure |
| Insecure defaults | Default VPC, default security groups | Unintended access |
| Drift | Manual changes not in code | Unknown security posture |

---

## IaC Security Scanning

Static analysis tools scan IaC templates for misconfigurations before they reach production.

### Popular Scanners

| Tool | Supported IaC | License |
|---|---|---|
| Checkov | Terraform, CloudFormation, K8s, Helm | Open source |
| tfsec | Terraform | Open source |
| KICS | Terraform, CloudFormation, Ansible, Docker | Open source |
| Terrascan | Terraform, K8s, Helm | Open source |
| Snyk IaC | Terraform, CloudFormation, K8s | Commercial |

### Running Checkov

```bash
# Install
pip install checkov

# Scan a Terraform directory
checkov -d ./terraform/

# Scan a specific file
checkov -f main.tf

# Output as JSON for CI integration
checkov -d ./terraform/ -o json > results.json
```

### Example: Insecure Terraform

```hcl
# BAD: Public S3 bucket with no encryption
resource "aws_s3_bucket" "data" {
  bucket = "my-sensitive-data"
  acl    = "public-read"  # Checkov: CKV_AWS_19 - FAILED
}

# GOOD: Private bucket with encryption and versioning
resource "aws_s3_bucket" "data" {
  bucket = "my-sensitive-data"
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}
```

---

## Secrets in IaC

Never hardcode secrets in infrastructure code. They end up in version control history permanently.

### Anti-Pattern

```hcl
# NEVER do this
resource "aws_db_instance" "main" {
  engine   = "mysql"
  username = "admin"
  password = "SuperSecret123!"  # Exposed in state file and VCS
}
```

### Secure Alternatives

| Method | Description |
|---|---|
| Environment variables | `TF_VAR_db_password` |
| Secret manager reference | Pull from AWS Secrets Manager / Vault |
| Encrypted tfvars | Encrypt sensitive variable files (SOPS) |
| CI/CD secrets | Inject from pipeline secret store |

```hcl
# Reference secret from AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "main" {
  engine   = "mysql"
  username = "admin"
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}
```

### Detecting Secrets in Code

```bash
# Use git-secrets to prevent committing secrets
git secrets --install
git secrets --register-aws

# Use truffleHog for scanning git history
trufflehog git file://./my-repo --only-verified

# Use gitleaks
gitleaks detect --source ./my-repo
```

---

## Policy as Code

Policy as Code enforces security guardrails programmatically, preventing non-compliant infrastructure from being deployed.

### Open Policy Agent (OPA)

OPA uses the Rego language to define policies:

```rego
# Deny S3 buckets without encryption
package terraform.aws

deny[msg] {
  resource := input.resource.aws_s3_bucket[name]
  not resource.server_side_encryption_configuration
  msg := sprintf("S3 bucket '%s' must have encryption enabled", [name])
}

# Deny security groups open to the world
deny[msg] {
  resource := input.resource.aws_security_group[name]
  ingress := resource.ingress[_]
  ingress.cidr_blocks[_] == "0.0.0.0/0"
  msg := sprintf("Security group '%s' allows traffic from 0.0.0.0/0", [name])
}
```

### HashiCorp Sentinel

Sentinel integrates directly with Terraform Cloud/Enterprise:

```python
# Enforce all EC2 instances use approved AMIs
import "tfplan/v2" as tfplan

approved_amis = ["ami-0123456789abcdef0", "ami-fedcba9876543210f"]

main = rule {
  all tfplan.resource_changes as _, rc {
    rc.type is "aws_instance" implies
    rc.change.after.ami in approved_amis
  }
}
```

### Comparison

| Feature | OPA/Rego | Sentinel | AWS SCP |
|---|---|---|---|
| Scope | Any JSON/IaC | Terraform Cloud | AWS Organizations |
| Language | Rego | Sentinel | JSON policy |
| Enforcement | Pre-deploy | Pre-apply | API-level |
| Open source | Yes | No | N/A |

---

## Shift-Left Security

"Shift-left" means catching security issues as early as possible in the development lifecycle.

```
┌────────┐   ┌────────┐   ┌─────────┐   ┌──────────┐   ┌────────────┐
│  Code  │──▶│  Commit │──▶│   CI/CD  │──▶│  Deploy   │──▶│ Production │
│  IDE   │   │  Hook   │   │ Pipeline │   │  Gate     │   │ Monitoring │
└────────┘   └────────┘   └─────────┘   └──────────┘   └────────────┘
  tfsec       git-secrets    Checkov      OPA/Sentinel    Cloud CSPM
  IDE plugin  pre-commit     KICS         Manual review   Drift detect
```

### CI/CD Integration Example (GitHub Actions)

```yaml
name: IaC Security Scan
on: [pull_request]

jobs:
  checkov:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@v12
        with:
          directory: terraform/
          framework: terraform
          soft_fail: false  # Fail the build on findings

  tfsec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tfsec
        uses: aquasecurity/tfsec-action@v1.0.0
        with:
          working_directory: terraform/
```

---

## Terraform State Security

The Terraform state file contains sensitive data and must be protected:

| Risk | Mitigation |
|---|---|
| State contains secrets in plaintext | Use encrypted remote backend |
| State stored locally | Store in S3 + DynamoDB (locking) |
| Unauthorized state access | Restrict backend bucket IAM |
| State tampering | Enable versioning on state bucket |

```hcl
# Secure remote backend configuration
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}
```

---

## Key Takeaways

- IaC misconfigurations are replicated at scale — scan before deploying
- Never hardcode secrets in IaC files; use secret managers and environment variables
- Use static analysis tools (Checkov, tfsec, KICS) in CI/CD pipelines
- Policy as Code (OPA, Sentinel) provides automated guardrails against non-compliant infrastructure
- Shift-left by integrating security scanning at every stage from IDE to production
- Protect Terraform state files with encryption, access controls, and versioning

---

[Next: Logging & SIEM](45-cybersecurity-logging-siem)
