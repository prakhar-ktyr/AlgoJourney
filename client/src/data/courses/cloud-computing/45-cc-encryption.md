---
title: "Encryption in the Cloud"
---

# Encryption in the Cloud

In this lesson, you will learn how cloud providers protect your data using **encryption**. You will explore encryption at rest, encryption in transit, key management services, secrets management, and hardware security modules.

---

## Why Encryption Matters

Encryption converts readable data (**plaintext**) into unreadable data (**ciphertext**) using a secret key. Only someone with the correct key can reverse the process.

```
Plaintext ──[Encrypt with Key]──► Ciphertext ──[Decrypt with Key]──► Plaintext
"Hello"   ──────────────────────► "xK9$mQ2z" ──────────────────────► "Hello"
```

**Without encryption:**

| Threat | Impact |
|--------|--------|
| Data breach | Sensitive data exposed in plaintext |
| Man-in-the-middle attack | Network traffic intercepted and read |
| Insider threat | Employees access raw data on storage |
| Compliance violation | Regulatory fines (GDPR, HIPAA, PCI-DSS) |

---

## Encryption Basics

### Symmetric Encryption

**Symmetric encryption** uses the **same key** to encrypt and decrypt data.

```
        ┌─────────┐
Data ──►│ Encrypt  │──► Ciphertext ──► │ Decrypt  │──► Data
        │ (Key A)  │                   │ (Key A)  │
        └─────────┘                    └──────────┘
              Same Key A used for both operations
```

| Algorithm | Key Size | Speed | Use Case |
|-----------|----------|-------|----------|
| **AES-128** | 128 bits | Fast | General-purpose encryption |
| **AES-256** | 256 bits | Fast | High-security data at rest |
| **ChaCha20** | 256 bits | Very fast | Mobile, TLS alternative |
| **3DES** | 168 bits | Slow | Legacy (avoid for new systems) |

> **Key Point:** AES-256 is the gold standard for cloud encryption at rest.

### Asymmetric Encryption

**Asymmetric encryption** uses a **key pair** — a public key to encrypt and a private key to decrypt.

```
        ┌─────────────┐
Data ──►│   Encrypt    │──► Ciphertext ──► │   Decrypt    │──► Data
        │ (Public Key) │                   │ (Private Key)│
        └─────────────┘                    └──────────────┘
         Anyone can encrypt         Only key owner can decrypt
```

| Algorithm | Key Size | Speed | Use Case |
|-----------|----------|-------|----------|
| **RSA-2048** | 2048 bits | Slow | Key exchange, digital signatures |
| **RSA-4096** | 4096 bits | Slower | High-security key exchange |
| **ECDSA** | 256 bits | Moderate | TLS certificates, signatures |
| **Ed25519** | 256 bits | Fast | SSH keys, modern signatures |

### Hashing

**Hashing** produces a fixed-size fingerprint of data. It is a **one-way** function — you cannot reverse a hash back to the original data.

```
"Hello World" ──[SHA-256]──► "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
"Hello World!" ──[SHA-256]──► "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                               ↑ Completely different output for one character change
```

| Algorithm | Output Size | Use Case | Secure? |
|-----------|-------------|----------|---------|
| **MD5** | 128 bits | Checksums (not security) | ❌ Broken |
| **SHA-1** | 160 bits | Legacy systems | ❌ Broken |
| **SHA-256** | 256 bits | Integrity verification | ✅ Yes |
| **SHA-512** | 512 bits | High-security hashing | ✅ Yes |
| **bcrypt** | 184 bits | Password hashing | ✅ Yes |

### Symmetric vs Asymmetric: Quick Comparison

| Feature | Symmetric | Asymmetric |
|---------|-----------|------------|
| **Keys** | One shared key | Public + private key pair |
| **Speed** | Very fast | Slow |
| **Key distribution** | Difficult (must share securely) | Easy (share public key openly) |
| **Use case** | Bulk data encryption | Key exchange, digital signatures |
| **Cloud example** | Encrypting S3 objects | TLS handshake, SSH |

> **In practice:** Cloud services use both. Asymmetric encryption secures the key exchange, then symmetric encryption handles the bulk data (this is called **envelope encryption**).

---

## Encryption at Rest

**Encryption at rest** protects data stored on disk — in databases, object storage, file systems, and backups.

### Server-Side Encryption (SSE)

The cloud provider encrypts your data before writing it to disk and decrypts it when you read it back. You don't manage the cryptographic operations.

#### AWS S3 Server-Side Encryption Options

| Option | Key Management | You Manage | Use Case |
|--------|---------------|------------|----------|
| **SSE-S3** | AWS manages keys entirely | Nothing | Default, simplest option |
| **SSE-KMS** | AWS KMS manages keys | KMS key policy | Audit trail, fine-grained control |
| **SSE-C** | You provide the key per request | Keys entirely | Regulatory requirement for key control |

**SSE-S3 (Amazon-managed keys):**

```
Upload object to S3
    │
    ▼
S3 generates a unique data key
    │
    ▼
S3 encrypts the object with AES-256
    │
    ▼
S3 stores the encrypted object + encrypted key
```

No configuration needed — SSE-S3 is now the **default** for all new S3 buckets.

**SSE-KMS (KMS-managed keys):**

```
Upload object to S3
    │
    ▼
S3 requests a data key from KMS
    │
    ▼
KMS generates data key + encrypted copy
    │
    ▼
S3 encrypts object with plaintext data key
    │
    ▼
S3 stores encrypted object + encrypted data key
    │
    ▼
Plaintext data key is discarded from memory
```

Benefits of SSE-KMS:

- Separate key permissions via KMS key policy
- Full audit trail in AWS CloudTrail
- Automatic key rotation (every year)
- Custom key aliases for organization

**SSE-C (Customer-provided keys):**

```bash
# You provide the key with every request
aws s3 cp myfile.txt s3://my-bucket/myfile.txt \
    --sse-c AES256 \
    --sse-c-key fileb://my-encryption-key
```

> **Warning:** If you lose the key, AWS cannot recover your data. There is no backup.

### Client-Side Encryption

With **client-side encryption**, you encrypt the data **before** uploading it to the cloud. The cloud provider never sees the plaintext.

```
Your Application
    │
    ▼ Encrypt locally with your key
Ciphertext
    │
    ▼ Upload
Cloud Storage (stores only ciphertext)
```

| Approach | Pros | Cons |
|----------|------|------|
| **Server-side** | Simple, automatic, no code changes | Provider has access to keys |
| **Client-side** | Maximum control, zero-trust | You manage keys, more complex code |

---

## Encryption in Transit

**Encryption in transit** protects data as it moves across networks — between your users and the cloud, between cloud services, and between data centers.

### TLS/SSL

**Transport Layer Security (TLS)** is the standard protocol for encrypting network traffic. SSL is the older, deprecated predecessor.

```
Client                              Server
  │                                    │
  │──── ClientHello (supported ciphers)──►│
  │◄── ServerHello (chosen cipher) ────│
  │◄── Server Certificate ────────────│
  │──── Key Exchange ─────────────────►│
  │◄── Finished ──────────────────────│
  │                                    │
  │◄═══ Encrypted data channel ═══════►│
  │        (symmetric encryption)      │
```

**TLS versions:**

| Version | Status | Notes |
|---------|--------|-------|
| SSL 3.0 | ❌ Deprecated | Vulnerable (POODLE attack) |
| TLS 1.0 | ❌ Deprecated | No longer considered secure |
| TLS 1.1 | ❌ Deprecated | End of life |
| TLS 1.2 | ✅ Supported | Widely used, still secure |
| TLS 1.3 | ✅ Recommended | Faster handshake, stronger security |

### Certificate Management

SSL/TLS certificates prove the identity of a server and enable encrypted connections.

#### AWS Certificate Manager (ACM)

```
ACM provides FREE public TLS certificates:

Request Certificate
    │
    ▼
Validate domain ownership (DNS or Email)
    │
    ▼
Certificate issued and auto-renewed
    │
    ▼
Attach to ALB, CloudFront, API Gateway
```

**Key features:**

- Free public certificates
- Automatic renewal (no manual process)
- Integrated with AWS load balancers, CloudFront, API Gateway
- Private CA for internal certificates

#### Azure Key Vault Certificates

```
Azure Key Vault manages certificates:

Create/Import Certificate
    │
    ▼
Store in Key Vault (encrypted)
    │
    ▼
Auto-renewal with integrated CAs (DigiCert, GlobalSign)
    │
    ▼
Bind to App Service, Application Gateway, Front Door
```

---

## Key Management Services

Key management is critical — the encryption is only as strong as the protection of your keys.

### Envelope Encryption

All major cloud KMS services use **envelope encryption**:

```
Customer Master Key (CMK) ← stored in KMS, never leaves
    │
    ▼ Generates
Data Encryption Key (DEK)
    │
    ├──► Plaintext DEK → encrypts your data → discarded
    └──► Encrypted DEK → stored alongside your encrypted data

Decryption:
Encrypted DEK ──[CMK in KMS]──► Plaintext DEK ──► Decrypt data
```

**Why envelope encryption?**

- The master key never leaves the KMS hardware
- Each object gets a unique data key (limits blast radius)
- You only send small keys to KMS (not your entire data set)

### AWS KMS (Key Management Service)

```
AWS KMS
├── Key Types
│   ├── AWS Managed Keys (aws/s3, aws/ebs, etc.)
│   ├── Customer Managed Keys (CMKs you create)
│   └── Custom Key Stores (backed by CloudHSM)
├── Key Material Origin
│   ├── KMS-generated
│   ├── External (you import key material)
│   └── CloudHSM
└── Features
    ├── Automatic key rotation (yearly)
    ├── Key policies + IAM policies
    ├── Grants (temporary, fine-grained access)
    └── Full audit trail via CloudTrail
```

**Creating and using a KMS key:**

```bash
# Create a customer managed key
aws kms create-key \
    --description "My application encryption key" \
    --key-usage ENCRYPT_DECRYPT \
    --key-spec SYMMETRIC_DEFAULT

# Create an alias for easy reference
aws kms create-alias \
    --alias-name alias/my-app-key \
    --target-key-id <key-id>

# Encrypt data
aws kms encrypt \
    --key-id alias/my-app-key \
    --plaintext "Secret data" \
    --output text --query CiphertextBlob

# Decrypt data
aws kms decrypt \
    --ciphertext-blob fileb://encrypted-data \
    --output text --query Plaintext | base64 --decode
```

### Azure Key Vault

Azure Key Vault is a unified service for keys, secrets, and certificates:

```
Azure Key Vault
├── Keys
│   ├── Software-protected (Standard tier)
│   └── HSM-protected (Premium tier)
├── Secrets
│   ├── Connection strings
│   ├── API keys
│   └── Passwords
├── Certificates
│   ├── Self-signed
│   └── CA-signed (auto-renewal)
└── Access Control
    ├── Vault access policy (legacy)
    └── Azure RBAC (recommended)
```

**Using Azure Key Vault with Azure CLI:**

```bash
# Create a Key Vault
az keyvault create \
    --name my-vault \
    --resource-group my-rg \
    --location eastus

# Create an encryption key
az keyvault key create \
    --vault-name my-vault \
    --name my-encryption-key \
    --kty RSA \
    --size 2048

# Store a secret
az keyvault secret set \
    --vault-name my-vault \
    --name "DatabasePassword" \
    --value "SuperS3cretP@ss!"

# Retrieve a secret
az keyvault secret show \
    --vault-name my-vault \
    --name "DatabasePassword" \
    --query "value" -o tsv
```

### GCP Cloud KMS

```
GCP Cloud KMS
├── Key Hierarchy
│   ├── Key Ring (logical grouping, per region)
│   │   ├── Crypto Key (the actual key resource)
│   │   │   └── Crypto Key Version (the key material)
│   │   └── Crypto Key
│   └── Key Ring
├── Protection Levels
│   ├── SOFTWARE (default)
│   ├── HSM (Cloud HSM-backed)
│   └── EXTERNAL (External Key Manager)
└── Key Purposes
    ├── ENCRYPT_DECRYPT (symmetric)
    ├── ASYMMETRIC_SIGN
    └── ASYMMETRIC_DECRYPT
```

**Using GCP Cloud KMS:**

```bash
# Create a key ring
gcloud kms keyrings create my-keyring \
    --location global

# Create an encryption key
gcloud kms keys create my-key \
    --keyring my-keyring \
    --location global \
    --purpose encryption

# Encrypt a file
gcloud kms encrypt \
    --key my-key \
    --keyring my-keyring \
    --location global \
    --plaintext-file secret.txt \
    --ciphertext-file secret.enc

# Decrypt a file
gcloud kms decrypt \
    --key my-key \
    --keyring my-keyring \
    --location global \
    --ciphertext-file secret.enc \
    --plaintext-file secret-decrypted.txt
```

### Key Types and Hierarchy

| Term | Description | Where It Lives |
|------|-------------|----------------|
| **CMK / KEK** | Customer Master Key / Key Encryption Key | In the KMS (never exported) |
| **DEK** | Data Encryption Key | Generated per object, encrypted by CMK |
| **Root Key** | Top of the key hierarchy | In HSM hardware |

```
Key Hierarchy:

Root Key (in HSM hardware)
    │
    ▼
Master Key / CMK (in KMS, software or HSM-protected)
    │
    ▼
Data Encryption Key (generated per object)
    │
    ▼
Your Encrypted Data
```

### Key Rotation Policies

Key rotation limits the amount of data encrypted under a single key version:

| Provider | Auto-Rotation | Default Period | Custom Period |
|----------|---------------|----------------|---------------|
| **AWS KMS** | Yes (opt-in) | 365 days | 90–2560 days |
| **Azure Key Vault** | Yes (configurable) | No default | Custom expiry date |
| **GCP Cloud KMS** | Yes (opt-in) | No default | Custom (e.g., 90 days) |

**How key rotation works:**

```
Before rotation:
  Key v1 ──► encrypts data objects A, B, C

After rotation:
  Key v1 ──► still decrypts A, B, C (old data)
  Key v2 ──► encrypts new data objects D, E, F

Old key versions are kept for decryption, not used for new encryption.
```

---

## Secrets Management

Secrets (passwords, API keys, database credentials, tokens) need special handling — they should **never** be hardcoded in application code or configuration files.

### AWS Secrets Manager

```
AWS Secrets Manager
├── Store secrets (JSON key-value pairs)
├── Automatic rotation (Lambda-based)
├── Cross-account access via resource policies
├── Integration with RDS, Redshift, DocumentDB
└── Versioning (current, previous, pending)
```

**Example: Storing and retrieving a database secret:**

```bash
# Store a secret
aws secretsmanager create-secret \
    --name prod/myapp/database \
    --secret-string '{"username":"admin","password":"S3cureP@ss!"}'

# Retrieve a secret
aws secretsmanager get-secret-value \
    --secret-id prod/myapp/database \
    --query SecretString --output text
```

### Azure Key Vault (Secrets)

Azure Key Vault handles secrets alongside keys and certificates:

```bash
# Store a secret
az keyvault secret set \
    --vault-name my-vault \
    --name "ApiKey" \
    --value "sk-abc123def456"

# Retrieve a secret
az keyvault secret show \
    --vault-name my-vault \
    --name "ApiKey" \
    --query "value" -o tsv
```

**Application integration (using Managed Identity):**

```
Azure App Service
    │ (Managed Identity — no credentials needed)
    ▼
Azure Key Vault
    │
    ▼ Returns secret value
Application uses the secret
```

### GCP Secret Manager

```bash
# Create a secret
echo -n "my-super-secret-value" | \
    gcloud secrets create my-secret --data-file=-

# Access a secret
gcloud secrets versions access latest --secret=my-secret

# Grant access to a service account
gcloud secrets add-iam-policy-binding my-secret \
    --member="serviceAccount:my-app@my-project.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### Secrets Management Comparison

| Feature | AWS Secrets Manager | Azure Key Vault | GCP Secret Manager |
|---------|--------------------|-----------------|--------------------|
| **Auto-rotation** | Yes (Lambda) | Yes (configurable) | No built-in |
| **Versioning** | Yes | Yes | Yes |
| **Access control** | IAM + resource policy | RBAC / vault policy | IAM |
| **Audit** | CloudTrail | Azure Monitor | Cloud Audit Logs |
| **Max secret size** | 64 KB | 25 KB | 64 KB |
| **Pricing** | Per secret + API calls | Per operation | Per secret version + access |

---

## Hardware Security Modules (HSMs)

An **HSM** is a dedicated, tamper-resistant hardware device that generates, stores, and manages cryptographic keys.

### Why Use an HSM?

```
Regular KMS:
  Keys stored in software → encrypted by AWS/Azure/GCP infrastructure
  ✅ Good for most workloads
  ✅ Fully managed, low cost

HSM-backed KMS:
  Keys stored in FIPS 140-2 Level 3 certified hardware
  ✅ Required for strict compliance (PCI-DSS, HIPAA, FedRAMP)
  ✅ Keys never exist in plaintext outside the HSM
  ❌ Higher cost, more operational overhead
```

### Cloud HSM Services

| Provider | Service | Compliance | Dedicated? |
|----------|---------|------------|------------|
| **AWS** | CloudHSM | FIPS 140-2 Level 3 | Yes (single-tenant) |
| **Azure** | Dedicated HSM / Managed HSM | FIPS 140-2 Level 3 | Yes |
| **GCP** | Cloud HSM | FIPS 140-2 Level 3 | Shared (multi-tenant) |

### AWS CloudHSM Architecture

```
Your VPC
├── CloudHSM Cluster
│   ├── HSM Instance (AZ-1) ◄─── FIPS 140-2 Level 3
│   └── HSM Instance (AZ-2) ◄─── Automatic replication
├── EC2 Instances
│   └── CloudHSM Client ──► PKCS#11 / JCE / OpenSSL
└── Applications
    └── Use HSM for crypto operations
```

> **Key Difference:** With CloudHSM, **you** manage the keys. AWS manages the hardware but has no access to your key material. If you lose your HSM credentials, the keys are irrecoverable.

---

## Encryption Best Practices

### The Cloud Encryption Checklist

| # | Practice | Details |
|---|----------|---------|
| 1 | **Encrypt everything at rest** | Enable default encryption on all storage services |
| 2 | **Enforce TLS 1.2+ in transit** | Disable older TLS versions |
| 3 | **Use envelope encryption** | Let KMS manage master keys, generate per-object DEKs |
| 4 | **Enable automatic key rotation** | Rotate keys at least annually |
| 5 | **Separate key permissions** | Key admins ≠ key users ≠ data users |
| 6 | **Never hardcode secrets** | Use Secrets Manager / Key Vault / Secret Manager |
| 7 | **Audit key usage** | Enable CloudTrail / Azure Monitor / Cloud Audit Logs |
| 8 | **Use managed identities** | Avoid service account keys when possible |
| 9 | **Plan for key disaster recovery** | Multi-region key replication, backup procedures |
| 10 | **Classify data sensitivity** | Apply stronger controls to more sensitive data |

### Common Encryption Mistakes

```
❌ Storing encryption keys alongside encrypted data
❌ Using deprecated algorithms (MD5, SHA-1, DES, RC4)
❌ Disabling default encryption on storage services
❌ Hardcoding secrets in source code or environment variables
❌ Using the same key for all data (no key hierarchy)
❌ Not enabling key rotation
❌ Allowing TLS 1.0/1.1 connections
❌ Not auditing key access and usage
❌ Storing secrets in plaintext in config files or repos
❌ Using self-signed certificates in production
```

---

## Exercises

### Exercise 1: Encryption Decision Matrix

For each scenario below, recommend the appropriate encryption approach:

| Scenario | Encryption Type | Specific Service | Why? |
|----------|----------------|------------------|------|
| S3 bucket with customer PII | ? | ? | ? |
| API traffic from mobile app | ? | ? | ? |
| Database passwords for app | ? | ? | ? |
| Healthcare data (HIPAA) | ? | ? | ? |
| Internal microservice traffic | ? | ? | ? |

### Exercise 2: Key Management Design

Design a key management strategy for an e-commerce application:

1. What key hierarchy would you use?
2. How would you manage keys for:
   - Customer payment data
   - User session tokens
   - Database backups
   - Application secrets (API keys, DB passwords)
3. What rotation policy would you set?
4. How would you handle key access for different teams?

### Exercise 3: Spot the Vulnerabilities

Find all encryption-related security issues:

```
Application Architecture:
- Database password stored in environment variable on EC2
- S3 bucket encryption disabled for "performance"
- TLS 1.0 enabled on the load balancer for "compatibility"
- Application uses MD5 to hash user passwords
- API keys hardcoded in the frontend JavaScript bundle
- Self-signed certificate on the production API
- No key rotation configured (using same key for 3 years)
- CloudHSM cluster in a single availability zone
```

List each vulnerability, explain the risk, and provide the fix.

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **Symmetric encryption** | Same key encrypts and decrypts; fast, used for data at rest (AES-256) |
| **Asymmetric encryption** | Public/private key pair; slower, used for key exchange and signatures |
| **Encryption at rest** | Protects stored data; use SSE-KMS for control and audit |
| **Encryption in transit** | Protects data on the network; enforce TLS 1.2+ everywhere |
| **Envelope encryption** | Master key encrypts data keys; data keys encrypt your data |
| **Key rotation** | Regularly generate new key versions to limit exposure |
| **Secrets management** | Use dedicated services, never hardcode credentials |
| **HSMs** | Hardware-backed key storage for strict compliance requirements |
| **Key hierarchy** | Root → Master → Data keys; separation of concerns |
| **Audit everything** | Log all key access and cryptographic operations |

---

In the next lesson, you will learn about **Network Security in the Cloud** — VPC security, firewalls, DDoS protection, and private connectivity options.
