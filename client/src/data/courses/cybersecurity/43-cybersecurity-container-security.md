---
title: Container Security
---

# Container Security

Containers revolutionized software deployment, but they also introduce new attack surfaces. Securing containers requires attention at every stage — from image creation to runtime orchestration.

---

## Docker Security Fundamentals

### Image Security

Container images are the foundation. A vulnerable or malicious base image compromises everything built on top of it.

| Risk | Description | Mitigation |
|---|---|---|
| Vulnerable base image | Outdated packages with known CVEs | Use minimal, updated base images |
| Embedded secrets | API keys/passwords baked into layers | Use runtime secrets injection |
| Excessive packages | Larger attack surface | Use distroless or Alpine images |
| Untrusted sources | Images from unknown registries | Only pull from trusted registries |

### Image Scanning

Scan images for vulnerabilities before deployment:

```bash
# Scan with Trivy (open source)
trivy image myapp:latest

# Scan with Docker Scout
docker scout cves myapp:latest

# Scan with Grype
grype myapp:latest
```

Example Trivy output:

```
myapp:latest (alpine 3.18.4)
Total: 3 (HIGH: 2, CRITICAL: 1)

┌───────────────┬────────────────┬──────────┬─────────────────┐
│    Library    │ Vulnerability  │ Severity │  Fixed Version  │
├───────────────┼────────────────┼──────────┼─────────────────┤
│ libcrypto3    │ CVE-2024-0727  │ HIGH     │ 3.1.4-r4        │
│ libssl3       │ CVE-2024-0727  │ HIGH     │ 3.1.4-r4        │
│ curl          │ CVE-2024-2398  │ CRITICAL │ 8.5.0-r1        │
└───────────────┴────────────────┴──────────┴─────────────────┘
```

---

### Running Containers with Least Privilege

```dockerfile
# Bad: Running as root
FROM node:20
COPY . /app
CMD ["node", "server.js"]

# Good: Non-root user, minimal permissions
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup . .
USER appuser
CMD ["node", "server.js"]
```

### Key Docker Security Flags

```bash
# Run with read-only filesystem
docker run --read-only --tmpfs /tmp myapp:latest

# Drop all capabilities, add only what's needed
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp:latest

# Prevent privilege escalation
docker run --security-opt=no-new-privileges myapp:latest

# Limit resources (prevent DoS)
docker run --memory=512m --cpus=1.0 myapp:latest

# Use read-only bind mounts
docker run -v /config:/config:ro myapp:latest
```

### Docker Security Checklist

| Practice | Command/Config |
|---|---|
| Non-root user | `USER appuser` in Dockerfile |
| Read-only filesystem | `--read-only` flag |
| Drop capabilities | `--cap-drop=ALL` |
| No privilege escalation | `--security-opt=no-new-privileges` |
| Resource limits | `--memory`, `--cpus` |
| No host network | Avoid `--network=host` |
| Signed images | Docker Content Trust (`DOCKER_CONTENT_TRUST=1`) |

---

## Kubernetes Security

### RBAC (Role-Based Access Control)

Kubernetes RBAC controls who can perform which actions on which resources.

```yaml
# Role: allows reading pods in the "production" namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]

---
# RoleBinding: grants the role to user "dev-user"
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: production
subjects:
- kind: User
  name: dev-user
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### Network Policies

By default, all pods can communicate with each other. Network policies restrict traffic flow.

```yaml
# Only allow traffic from frontend pods to backend pods on port 8080
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-frontend
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080
```

### Pod Security Standards

Kubernetes defines three security profiles for pods:

| Profile | Description | Use Case |
|---|---|---|
| Privileged | No restrictions | System-level workloads |
| Baseline | Prevents known privilege escalations | General workloads |
| Restricted | Heavily restricted, best practices | Security-sensitive workloads |

```yaml
# Restricted pod security context
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
    resources:
      limits:
        memory: "256Mi"
        cpu: "500m"
```

---

## Supply Chain Security

The software supply chain includes every component that goes into building your container images.

| Attack Vector | Example | Mitigation |
|---|---|---|
| Compromised base image | Malicious code in public image | Use verified, signed images |
| Dependency confusion | Typosquatted packages | Pin versions, verify checksums |
| Build pipeline compromise | Injected steps in CI/CD | Sign builds, use SLSA framework |
| Registry poisoning | Pushing malicious tags | Image signing with Cosign/Notary |

### Image Signing with Cosign

```bash
# Generate a key pair
cosign generate-key-pair

# Sign an image
cosign sign --key cosign.key myregistry.io/myapp:v1.0

# Verify an image before deployment
cosign verify --key cosign.pub myregistry.io/myapp:v1.0
```

### Software Bill of Materials (SBOM)

An SBOM lists every component in your container image, enabling vulnerability tracking.

```bash
# Generate SBOM with Syft
syft myapp:latest -o spdx-json > sbom.json

# Scan SBOM for vulnerabilities
grype sbom:sbom.json
```

---

## Container Runtime Security

Monitor containers at runtime to detect suspicious behavior:

| Tool | Type | Capability |
|---|---|---|
| Falco | Open source | Runtime threat detection via syscall monitoring |
| Sysdig | Commercial | Container forensics + monitoring |
| Aqua Security | Commercial | Full lifecycle container security |
| Tetragon | Open source | eBPF-based runtime enforcement |

### Falco Rule Example

```yaml
# Alert if a shell is spawned inside a container
- rule: Shell Spawned in Container
  desc: Detect shell execution in a running container
  condition: >
    spawned_process and container and
    proc.name in (bash, sh, zsh, dash)
  output: >
    Shell spawned in container
    (user=%user.name container=%container.name shell=%proc.name)
  priority: WARNING
```

---

## Key Takeaways

- Always scan container images for vulnerabilities before deployment
- Run containers as non-root with read-only filesystems and dropped capabilities
- Use Kubernetes RBAC to enforce least privilege access to cluster resources
- Network policies are essential — default Kubernetes networking allows all pod-to-pod traffic
- Sign container images and generate SBOMs to secure the supply chain
- Monitor runtime behavior with tools like Falco to detect container compromises

---

[Next: Infrastructure as Code Security](44-cybersecurity-iac-security)
