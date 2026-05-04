---
title: "Container Orchestration with Kubernetes"
---

# Container Orchestration with Kubernetes

In this lesson, you will learn why container orchestration matters, how **Kubernetes (K8s)** — the industry-standard orchestration platform — works under the hood, and how to deploy, scale, and manage containerized applications in production.

---

## Why Container Orchestration?

Running a single container with `docker run` works fine for development. But in production you need to answer harder questions:

| Challenge | What You Need |
|---|---|
| A container crashes | Automatic restart |
| Traffic spikes | Scale from 3 to 20 replicas |
| Deploy a new version | Zero-downtime rolling update |
| Multiple services | Service discovery and load balancing |
| Secrets and config | Centralized configuration management |
| Resource limits | CPU/memory allocation per container |
| Multi-host deployment | Scheduling across a cluster of machines |

**Container orchestration** automates all of this. Kubernetes is the most widely adopted solution.

---

## What Is Kubernetes?

**Kubernetes** (Greek for "helmsman") is an open-source container orchestration platform originally designed by Google, now maintained by the Cloud Native Computing Foundation (CNCF).

### Key Features

- **Self-healing:** Restarts failed containers automatically
- **Horizontal scaling:** Add or remove replicas based on load
- **Rolling updates:** Deploy new versions with zero downtime
- **Service discovery:** Built-in DNS for container communication
- **Storage orchestration:** Mount cloud volumes automatically
- **Secret management:** Store and inject sensitive data securely
- **Declarative configuration:** Define desired state in YAML; K8s ensures reality matches

---

## Kubernetes Architecture

A Kubernetes cluster consists of a **Control Plane** (the brain) and one or more **Worker Nodes** (the muscle).

```
┌─────────────────────────────────────────────────────────────┐
│                      CONTROL PLANE                          │
│  ┌────────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │
│  │ API Server │ │  etcd    │ │ Scheduler │ │ Controller │  │
│  │            │ │ (store)  │ │           │ │  Manager   │  │
│  └─────┬──────┘ └──────────┘ └───────────┘ └────────────┘  │
│        │                                                    │
└────────┼────────────────────────────────────────────────────┘
         │
    ┌────▼───────────────────────────────────────────────┐
    │                   WORKER NODES                     │
    │  ┌──────────────────┐   ┌──────────────────┐      │
    │  │   Node 1         │   │   Node 2         │      │
    │  │  ┌─────────────┐ │   │  ┌─────────────┐ │      │
    │  │  │  kubelet    │ │   │  │  kubelet    │ │      │
    │  │  │  kube-proxy │ │   │  │  kube-proxy │ │      │
    │  │  │  Container  │ │   │  │  Container  │ │      │
    │  │  │  Runtime    │ │   │  │  Runtime    │ │      │
    │  │  ├─────────────┤ │   │  ├─────────────┤ │      │
    │  │  │ Pod │ Pod   │ │   │  │ Pod │ Pod   │ │      │
    │  │  └─────────────┘ │   │  └─────────────┘ │      │
    │  └──────────────────┘   └──────────────────┘      │
    └────────────────────────────────────────────────────┘
```

### Control Plane Components

| Component | Role |
|---|---|
| **API Server** (`kube-apiserver`) | Front door to Kubernetes. All commands go through it. RESTful API. |
| **etcd** | Distributed key-value store. Holds the entire cluster state. The "source of truth." |
| **Scheduler** (`kube-scheduler`) | Decides which node should run a new pod based on resources, constraints, and affinity rules. |
| **Controller Manager** (`kube-controller-manager`) | Runs controller loops: Deployment controller, ReplicaSet controller, Node controller, etc. Ensures desired state = actual state. |

### Worker Node Components

| Component | Role |
|---|---|
| **kubelet** | Agent on each node. Ensures containers in pods are running and healthy. |
| **kube-proxy** | Maintains network rules. Handles service-level load balancing on each node. |
| **Container Runtime** | Software that runs containers (containerd, CRI-O). Docker was used historically. |

---

## Core Kubernetes Concepts

### Pods

A **Pod** is the smallest deployable unit in Kubernetes. It wraps one or more containers that share networking and storage.

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: web
spec:
  containers:
    - name: web
      image: nginx:1.25
      ports:
        - containerPort: 80
```

> **Note:** You rarely create Pods directly. Instead, you use **Deployments** which manage Pods for you.

### Deployments

A **Deployment** manages a set of identical Pods, handles rolling updates, and maintains the desired replica count.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: my-app:2.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

### Services

A **Service** provides a stable network endpoint to access a set of Pods. Pods are ephemeral — Services are permanent.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3000
```

#### Service Types

| Type | Description | Access |
|---|---|---|
| **ClusterIP** | Internal-only (default) | Within the cluster |
| **NodePort** | Exposes on each node's IP at a static port | `<NodeIP>:<NodePort>` |
| **LoadBalancer** | Provisions a cloud load balancer | External internet |
| **ExternalName** | Maps to a DNS name | DNS alias |

### Namespaces

**Namespaces** provide logical isolation within a cluster — think of them as virtual sub-clusters.

```bash
# List namespaces
kubectl get namespaces

# Create a namespace
kubectl create namespace staging

# Deploy to a specific namespace
kubectl apply -f deployment.yaml -n staging
```

Common namespaces:

| Namespace | Purpose |
|---|---|
| `default` | Where resources go if no namespace is specified |
| `kube-system` | Kubernetes system components |
| `kube-public` | Publicly accessible data |

### ConfigMaps

Store **non-sensitive** configuration as key-value pairs.

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "db.example.com"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
```

Use in a Pod:

```yaml
spec:
  containers:
    - name: web
      image: my-app:1.0
      envFrom:
        - configMapRef:
            name: app-config
```

### Secrets

Store **sensitive** data (passwords, API keys, certificates) encoded in base64.

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: YWRtaW4=        # base64 of "admin"
  password: cEBzc3cwcmQ=    # base64 of "p@ssw0rd"
```

> **Warning:** Base64 is encoding, not encryption. Use tools like **Sealed Secrets** or **External Secrets Operator** for production secret management.

Use in a Pod:

```yaml
spec:
  containers:
    - name: web
      image: my-app:1.0
      env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

---

## YAML Manifest Structure

Every Kubernetes resource follows this structure:

```yaml
apiVersion: <API version>      # v1, apps/v1, networking.k8s.io/v1
kind: <Resource type>          # Pod, Deployment, Service, etc.
metadata:
  name: <resource name>        # Unique within namespace
  namespace: <namespace>       # Optional (default: "default")
  labels:                      # Key-value pairs for selection
    app: my-app
    env: production
spec:                          # Desired state (varies by resource)
  ...
```

### Complete Example: Deploy a Web App

```yaml
# 1. Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: my-project
---
# 2. ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: my-project
data:
  PORT: "3000"
---
# 3. Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-server
  namespace: my-project
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: my-api:1.0
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: app-config
---
# 4. Service
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: my-project
spec:
  selector:
    app: api
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
```

---

## Managed Kubernetes Services

Running your own control plane is complex. Managed services handle it for you:

| Service | Provider | Key Benefits |
|---|---|---|
| **Amazon EKS** | AWS | Deep AWS integration, Fargate for serverless pods |
| **Azure AKS** | Microsoft | Free control plane, Azure AD integration |
| **Google GKE** | Google | Autopilot mode, originated from Borg |

### Comparison

| Feature | EKS | AKS | GKE |
|---|---|---|---|
| Control plane cost | $0.10/hr (~$73/mo) | Free | Free (Standard); $0.10/hr (Autopilot) |
| Default CNI | AWS VPC CNI | Azure CNI | Calico / GKE Dataplane |
| Serverless pods | Fargate | Virtual Nodes | GKE Autopilot |
| Max nodes/cluster | 5,000 | 5,000 | 15,000 |
| Best for | AWS-heavy shops | Azure/.NET shops | K8s-native teams |

---

## Essential kubectl Commands

`kubectl` is the CLI for interacting with Kubernetes.

### Cluster Information

```bash
# View cluster info
kubectl cluster-info

# View nodes
kubectl get nodes

# View all resources in a namespace
kubectl get all -n my-project
```

### Working with Resources

```bash
# Apply a manifest
kubectl apply -f deployment.yaml

# Get resources
kubectl get pods
kubectl get deployments
kubectl get services

# Describe a resource (detailed info + events)
kubectl describe pod my-app-abc123

# View logs
kubectl logs my-app-abc123
kubectl logs -f my-app-abc123          # follow (stream)
kubectl logs my-app-abc123 -c sidecar  # specific container

# Execute a command in a pod
kubectl exec -it my-app-abc123 -- /bin/sh

# Delete resources
kubectl delete -f deployment.yaml
kubectl delete pod my-app-abc123
```

### Debugging

```bash
# View events (great for troubleshooting)
kubectl get events --sort-by='.lastTimestamp'

# Check why a pod isn't starting
kubectl describe pod <pod-name>

# Get YAML of a running resource
kubectl get deployment web-app -o yaml

# Port-forward for local debugging
kubectl port-forward pod/my-app-abc123 8080:3000
# Now visit http://localhost:8080
```

---

## Scaling

### Horizontal Pod Autoscaler (HPA)

Automatically scales the number of pods based on CPU/memory usage or custom metrics.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

```bash
# Quick HPA via CLI
kubectl autoscale deployment web-app \
  --min=2 --max=10 --cpu-percent=70

# Check HPA status
kubectl get hpa
```

### Vertical Pod Autoscaler (VPA)

Automatically adjusts **resource requests and limits** (CPU/memory) for pods.

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"
```

| Autoscaler | Scales | When to Use |
|---|---|---|
| **HPA** | Number of pods (horizontal) | Stateless apps with variable traffic |
| **VPA** | Pod resource requests (vertical) | Apps where right-sizing resources is important |
| **Cluster Autoscaler** | Number of nodes | When you need more/fewer VMs in your cluster |

---

## Helm Charts

**Helm** is the package manager for Kubernetes — like `npm` for K8s.

### Key Concepts

| Concept | Description |
|---|---|
| **Chart** | A package of K8s YAML templates |
| **Release** | An installed instance of a chart |
| **Repository** | A collection of charts |
| **Values** | Configuration to customize a chart |

### Using Helm

```bash
# Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for charts
helm search repo nginx

# Install a chart
helm install my-nginx bitnami/nginx

# Install with custom values
helm install my-nginx bitnami/nginx \
  --set replicaCount=3 \
  --set service.type=LoadBalancer

# Install with a values file
helm install my-nginx bitnami/nginx -f my-values.yaml

# List releases
helm list

# Upgrade a release
helm upgrade my-nginx bitnami/nginx --set replicaCount=5

# Rollback
helm rollback my-nginx 1

# Uninstall
helm uninstall my-nginx
```

### Example `values.yaml`

```yaml
replicaCount: 3

image:
  repository: my-app
  tag: "2.0"

service:
  type: LoadBalancer
  port: 80

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
```

---

## Service Mesh Introduction

A **service mesh** adds a dedicated infrastructure layer for service-to-service communication.

### What It Provides

- **Mutual TLS (mTLS):** Encrypt all traffic between services automatically
- **Traffic management:** Canary deployments, A/B testing, retries, timeouts
- **Observability:** Distributed tracing, metrics, access logs
- **Policy enforcement:** Rate limiting, access control

### Istio — The Most Popular Service Mesh

```
┌──────────────────────────────────────────┐
│              Data Plane                   │
│  ┌────────────────┐  ┌────────────────┐  │
│  │  Pod A         │  │  Pod B         │  │
│  │ ┌────┐ ┌─────┐│  │ ┌────┐ ┌─────┐│  │
│  │ │App │ │Envoy││──│►│App │ │Envoy││  │
│  │ └────┘ │Proxy││  │ └────┘ │Proxy││  │
│  │        └─────┘│  │        └─────┘│  │
│  └────────────────┘  └────────────────┘  │
│              ▲                ▲           │
│              └────────┬───────┘           │
│                       │                   │
│              ┌────────▼────────┐          │
│              │  Control Plane  │          │
│              │  (istiod)       │          │
│              └─────────────────┘          │
└──────────────────────────────────────────┘
```

> **When to use a service mesh:** Large-scale microservices (20+ services) with complex communication patterns. For smaller systems, K8s built-in networking is usually sufficient.

---

## Hands-On Exercise

### Task: Deploy a Scalable App on Kubernetes

Assuming you have `kubectl` configured (try [minikube](https://minikube.sigs.k8s.io/) for local setup):

1. **Create the deployment:**

```bash
kubectl create deployment hello-k8s \
  --image=nginx:1.25 \
  --replicas=3
```

2. **Expose it as a service:**

```bash
kubectl expose deployment hello-k8s \
  --port=80 --type=NodePort
```

3. **Verify:**

```bash
kubectl get pods
kubectl get services
```

4. **Scale up:**

```bash
kubectl scale deployment hello-k8s --replicas=5
kubectl get pods -w   # watch pods come up
```

5. **Rolling update:**

```bash
kubectl set image deployment/hello-k8s \
  nginx=nginx:1.26
kubectl rollout status deployment/hello-k8s
```

6. **Rollback:**

```bash
kubectl rollout undo deployment/hello-k8s
```

7. **Clean up:**

```bash
kubectl delete deployment hello-k8s
kubectl delete service hello-k8s
```

---

## Quick Reference

### kubectl Cheat Sheet

```bash
kubectl get <resource>              # List resources
kubectl describe <resource> <name>  # Details + events
kubectl apply -f <file>             # Create/update
kubectl delete -f <file>            # Delete
kubectl logs <pod>                  # View logs
kubectl exec -it <pod> -- sh       # Shell access
kubectl port-forward <pod> H:C     # Local access
kubectl scale deploy <n> --replicas=X
kubectl rollout status deploy <n>
kubectl rollout undo deploy <n>
```

### Resource Hierarchy

```
Cluster
  └── Namespace
        ├── Deployment
        │     └── ReplicaSet
        │           └── Pod
        │                 └── Container
        ├── Service
        ├── ConfigMap
        ├── Secret
        └── HPA
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| **Kubernetes** | Open-source container orchestration for production workloads |
| **Control Plane** | API Server, etcd, Scheduler, Controller Manager — the cluster brain |
| **Worker Nodes** | kubelet, kube-proxy, container runtime — where pods actually run |
| **Pod** | Smallest deployable unit; wraps one or more containers |
| **Deployment** | Manages replicas, rolling updates, and rollbacks |
| **Service** | Stable network endpoint to reach a set of pods |
| **ConfigMaps / Secrets** | Externalize configuration and sensitive data |
| **HPA** | Auto-scale pods based on CPU/memory/custom metrics |
| **Helm** | Package manager for Kubernetes (charts, releases, values) |
| **Service Mesh** | Infrastructure layer for secure service-to-service communication |

---

## What's Next?

In the next lesson, you'll learn about **Microservices Architecture** — the application design pattern that makes containers and Kubernetes truly powerful, including communication patterns, design patterns, and observability.
---
title: "Container Orchestration with Kubernetes"
---

# Container Orchestration with Kubernetes

In the previous lesson, you learned how to containerize applications with Docker. But what happens when you need to run **hundreds or thousands** of containers across multiple servers? That's where **Kubernetes** (K8s) comes in — the industry-standard platform for automating deployment, scaling, and management of containerized applications.

---

## Why Orchestration Is Needed

Running a single container on your laptop is easy. Running containers in production introduces challenges that manual management can't solve:

| Challenge | Without Orchestration | With Kubernetes |
|---|---|---|
| **Scaling** | Manually start/stop containers | Auto-scale based on load |
| **High availability** | Single point of failure | Automatic restart and rescheduling |
| **Load balancing** | Configure manually per service | Built-in service discovery and load balancing |
| **Rollouts** | Downtime during deployments | Zero-downtime rolling updates |
| **Resource management** | No limits, noisy neighbors | CPU/memory limits and fair scheduling |
| **Self-healing** | Manual restart on failure | Automatic health checks and recovery |
| **Networking** | Manual port and DNS management | Automatic DNS and virtual networking |
| **Secret management** | Files or env vars on each host | Centralized, encrypted secrets |

### Real-World Scenario

Imagine you run an e-commerce app with 10 microservices. During Black Friday, you need:

- The checkout service to scale from 3 to 50 instances
- The catalog service to stay at 5 instances
- Zero downtime if any instance crashes
- Traffic distributed evenly across healthy instances
- A new version deployed without affecting users

Kubernetes handles **all of this automatically**.

---

## Kubernetes Architecture

Kubernetes follows a **master-worker** architecture. The cluster has two types of nodes:

```
┌─────────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    CONTROL PLANE                          │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌────────┐ ┌───────────┐ ┌──────────────┐  │   │
│  │  │   API    │ │  etcd  │ │ Scheduler │ │  Controller  │  │   │
│  │  │  Server  │ │        │ │           │ │   Manager    │  │   │
│  │  └──────────┘ └────────┘ └───────────┘ └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │    WORKER NODE 1    │  │    WORKER NODE 2    │               │
│  │                     │  │                     │               │
│  │ ┌───────┐ ┌───────┐ │  │ ┌───────┐ ┌───────┐│               │
│  │ │ Pod A │ │ Pod B │ │  │ │ Pod C │ │ Pod D ││               │
│  │ └───────┘ └───────┘ │  │ └───────┘ └───────┘│               │
│  │                     │  │                     │               │
│  │ ┌─────────────────┐ │  │ ┌─────────────────┐│               │
│  │ │    kubelet      │ │  │ │    kubelet      ││               │
│  │ │  kube-proxy     │ │  │ │  kube-proxy     ││               │
│  │ │  container      │ │  │ │  container      ││               │
│  │ │  runtime        │ │  │ │  runtime        ││               │
│  │ └─────────────────┘ │  │ └─────────────────┘│               │
│  └─────────────────────┘  └─────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### Control Plane Components

The control plane makes global decisions about the cluster and detects and responds to cluster events.

| Component | Role | Analogy |
|---|---|---|
| **API Server** | Frontend for the control plane; all communication goes through it | Reception desk |
| **etcd** | Distributed key-value store; holds all cluster state and configuration | The database / filing cabinet |
| **Scheduler** | Assigns pods to nodes based on resource requirements and constraints | The assignment manager |
| **Controller Manager** | Runs controllers that regulate cluster state (replicas, node health) | The supervisor |

### Worker Node Components

Worker nodes run the actual containerized workloads.

| Component | Role | Analogy |
|---|---|---|
| **kubelet** | Agent on each node; ensures containers in pods are running and healthy | The site manager |
| **kube-proxy** | Maintains network rules; enables service communication | The traffic officer |
| **Container Runtime** | Software that runs containers (containerd, CRI-O) | The engine |

### How It Works Together

1. You submit a deployment to the **API Server** (via `kubectl`)
2. The **API Server** validates and stores it in **etcd**
3. The **Scheduler** picks the best node for each pod
4. The **kubelet** on the selected node pulls the image and starts the container
5. **Controllers** continuously ensure the desired state matches the actual state
6. **kube-proxy** routes traffic to the correct pods

---

## Core Concepts

### Pods

A **Pod** is the smallest deployable unit in Kubernetes. It wraps one or more containers that share storage and network.

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  containers:
    - name: web
      image: nginx:1.25
      ports:
        - containerPort: 80
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"
```

> **Note:** You rarely create Pods directly. Instead, you use Deployments, which manage Pods for you.

### Deployments

A **Deployment** declares the desired state for your application — how many replicas, which image, update strategy, etc. Kubernetes ensures the actual state matches.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: web
          image: my-app:v2.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: database_host
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
```

### Services

A **Service** provides a stable network endpoint to access a set of pods. Pods are ephemeral — they get new IPs when restarted. Services give you a fixed address.

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
```

#### Service Types

| Type | Description | Access |
|---|---|---|
| **ClusterIP** | Default; internal cluster IP | Only within the cluster |
| **NodePort** | Exposes on each node's IP at a static port | `<NodeIP>:<NodePort>` |
| **LoadBalancer** | Provisions cloud load balancer | External traffic via LB IP |
| **ExternalName** | Maps to a DNS name | CNAME redirect |

```yaml
# LoadBalancer service example
apiVersion: v1
kind: Service
metadata:
  name: my-app-public
spec:
  selector:
    app: my-app
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
```

### Namespaces

**Namespaces** provide logical isolation within a cluster. They are like folders for your Kubernetes resources.

```bash
# List namespaces
kubectl get namespaces

# Create a namespace
kubectl create namespace staging

# Deploy to a specific namespace
kubectl apply -f deployment.yaml -n staging
```

| Default Namespace | Purpose |
|---|---|
| `default` | Where resources go if no namespace is specified |
| `kube-system` | System components (DNS, proxy, etc.) |
| `kube-public` | Publicly accessible data |
| `kube-node-lease` | Node heartbeat data |

### ConfigMaps

**ConfigMaps** store non-sensitive configuration data as key-value pairs.

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database_host: "db.example.com"
  database_port: "5432"
  log_level: "info"
  feature_flags: |
    enable_cache=true
    enable_notifications=false
```

### Secrets

**Secrets** store sensitive data (passwords, API keys, tokens). Values are base64-encoded (not encrypted by default — enable encryption at rest).

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db_password: cGFzc3dvcmQxMjM=    # base64 encoded
  api_key: bXlzZWNyZXRrZXk=        # base64 encoded
```

```bash
# Create secret from command line
kubectl create secret generic app-secrets \
  --from-literal=db_password=password123 \
  --from-literal=api_key=mysecretkey
```

### Using ConfigMaps and Secrets in Pods

```yaml
spec:
  containers:
    - name: app
      image: my-app:v1
      env:
        # From ConfigMap
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_host
        # From Secret
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db_password
      # Mount as files
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
  volumes:
    - name: config-volume
      configMap:
        name: app-config
```

---

## Managed Kubernetes Services

Running your own Kubernetes control plane is complex. Cloud providers offer **managed Kubernetes** where they handle the control plane for you.

| Service | Provider | Key Features |
|---|---|---|
| **EKS** (Elastic Kubernetes Service) | AWS | Integrated with IAM, VPC, ALB, ECR |
| **AKS** (Azure Kubernetes Service) | Azure | Free control plane, Azure AD integration |
| **GKE** (Google Kubernetes Engine) | Google Cloud | Autopilot mode, built by K8s creators |

### Comparison

| Feature | EKS | AKS | GKE |
|---|---|---|---|
| Control plane cost | ~$73/month | Free | Free (Standard); ~$73 (Autopilot) |
| Auto-scaling | Karpenter / Cluster Autoscaler | KEDA / Cluster Autoscaler | Autopilot (fully managed) |
| Max nodes | 5,000 | 5,000 | 15,000 |
| Default runtime | containerd | containerd | containerd |
| Best for | AWS-heavy workloads | Azure ecosystem | Ease of use, GCP workloads |

---

## kubectl Commands

`kubectl` is the command-line tool for interacting with Kubernetes clusters.

### Essential Commands

```bash
# Cluster info
kubectl cluster-info
kubectl get nodes

# Working with resources
kubectl get pods                        # List pods
kubectl get pods -o wide                # Show more details (node, IP)
kubectl get deployments                 # List deployments
kubectl get services                    # List services
kubectl get all                         # List everything

# Creating resources
kubectl apply -f deployment.yaml        # Apply a manifest
kubectl create namespace dev            # Create a namespace

# Inspecting resources
kubectl describe pod my-app-abc123      # Detailed pod info
kubectl logs my-app-abc123              # View pod logs
kubectl logs my-app-abc123 -f           # Stream logs
kubectl logs my-app-abc123 -c web       # Logs for specific container

# Interacting with pods
kubectl exec -it my-app-abc123 -- sh    # Shell into a pod
kubectl port-forward my-app-abc123 8080:3000  # Forward local port

# Scaling
kubectl scale deployment my-app --replicas=5

# Updating
kubectl set image deployment/my-app web=my-app:v2.0
kubectl rollout status deployment/my-app
kubectl rollout undo deployment/my-app  # Rollback

# Deleting
kubectl delete pod my-app-abc123
kubectl delete -f deployment.yaml
```

### kubectl Cheat Sheet

| Command | Purpose |
|---|---|
| `kubectl get <resource>` | List resources |
| `kubectl describe <resource> <name>` | Show detailed info |
| `kubectl apply -f <file>` | Create/update from file |
| `kubectl delete <resource> <name>` | Delete a resource |
| `kubectl logs <pod>` | View pod logs |
| `kubectl exec -it <pod> -- sh` | Open shell in pod |
| `kubectl port-forward <pod> local:remote` | Forward port |
| `kubectl top pods` | Show resource usage |
| `kubectl get events --sort-by=.lastTimestamp` | Recent events |
| `kubectl config get-contexts` | List cluster contexts |
| `kubectl config use-context <name>` | Switch cluster |

---

## Scaling

### Horizontal Pod Autoscaler (HPA)

HPA automatically adjusts the number of pod replicas based on CPU/memory usage or custom metrics.

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

```bash
# Create HPA via command
kubectl autoscale deployment my-app \
  --min=2 --max=20 --cpu-percent=70

# Check HPA status
kubectl get hpa
```

### Vertical Pod Autoscaler (VPA)

VPA adjusts the **resource requests and limits** for containers based on actual usage.

```yaml
# vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: web
        minAllowed:
          cpu: "50m"
          memory: "64Mi"
        maxAllowed:
          cpu: "2"
          memory: "2Gi"
```

### HPA vs VPA

| Feature | HPA | VPA |
|---|---|---|
| What it scales | Number of pods | Pod resource requests/limits |
| Direction | Horizontal (more pods) | Vertical (bigger pods) |
| Trigger | CPU/memory/custom metrics | Historical usage patterns |
| Disruption | No restarts needed | Pods may be restarted |
| Best for | Stateless workloads | Stateful or unpredictable workloads |

> **Warning:** Don't use HPA and VPA together on the same metric (e.g., both targeting CPU). They will conflict.

---

## Helm Charts

**Helm** is the package manager for Kubernetes. It uses **charts** — pre-configured Kubernetes resource packages.

### Why Helm?

- **Templating** — Avoid duplicating YAML for different environments
- **Versioning** — Track and rollback releases
- **Sharing** — Distribute applications as reusable packages
- **Dependencies** — Manage complex application stacks

### Basic Helm Commands

```bash
# Add a chart repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search for charts
helm search repo nginx

# Install a chart
helm install my-release bitnami/nginx

# List releases
helm list

# Upgrade a release
helm upgrade my-release bitnami/nginx --set replicaCount=3

# Rollback
helm rollback my-release 1

# Uninstall
helm uninstall my-release
```

### Helm Chart Structure

```
my-chart/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
├── templates/
│   ├── deployment.yaml # Deployment template
│   ├── service.yaml    # Service template
│   ├── configmap.yaml  # ConfigMap template
│   ├── _helpers.tpl    # Template helpers
│   └── NOTES.txt       # Post-install notes
└── charts/             # Dependencies
```

### Example values.yaml

```yaml
# values.yaml
replicaCount: 3

image:
  repository: my-app
  tag: "v2.0"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

resources:
  limits:
    cpu: "500m"
    memory: "256Mi"
  requests:
    cpu: "100m"
    memory: "128Mi"

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilization: 70
```

---

## Service Mesh (Istio Introduction)

A **service mesh** is an infrastructure layer that manages service-to-service communication. **Istio** is the most popular service mesh for Kubernetes.

### What a Service Mesh Provides

| Feature | Description |
|---|---|
| **mTLS** | Automatic mutual TLS encryption between services |
| **Traffic management** | Canary deployments, A/B testing, traffic splitting |
| **Observability** | Distributed tracing, metrics, access logs |
| **Resiliency** | Retries, timeouts, circuit breaking |
| **Policy** | Rate limiting, access control |

### How Istio Works

Istio injects a **sidecar proxy** (Envoy) alongside each pod. All traffic flows through these proxies, giving Istio full control.

```
┌─────────────────────┐     ┌─────────────────────┐
│       Pod A         │     │       Pod B         │
│  ┌──────┐ ┌──────┐  │     │  ┌──────┐ ┌──────┐  │
│  │ App  │ │Envoy │──┼─────┼──│Envoy │ │ App  │  │
│  │      │ │Proxy │  │     │  │Proxy │ │      │  │
│  └──────┘ └──────┘  │     │  └──────┘ └──────┘  │
└─────────────────────┘     └─────────────────────┘
```

### Example: Traffic Splitting (Canary)

```yaml
# Route 90% to v1, 10% to v2
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: my-app
spec:
  hosts:
    - my-app
  http:
    - route:
        - destination:
            host: my-app
            subset: v1
          weight: 90
        - destination:
            host: my-app
            subset: v2
          weight: 10
```

> **Note:** A full service mesh adds complexity. Consider it only when you need advanced traffic management, security, or observability across many services.

---

## Exercises

### Exercise 1: Create a Deployment

Write a Kubernetes Deployment manifest for a Node.js application with:
- 3 replicas
- Image: `node-api:v1.0`
- Container port: 3000
- CPU request: 100m, limit: 500m
- A readiness probe on `/health`

<details>
<summary>Solution</summary>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-api
  template:
    metadata:
      labels:
        app: node-api
    spec:
      containers:
        - name: api
          image: node-api:v1.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
            limits:
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
```

</details>

### Exercise 2: Expose with a Service

Create a LoadBalancer Service that routes external traffic on port 80 to the pods from Exercise 1 on port 3000.

<details>
<summary>Solution</summary>

```yaml
apiVersion: v1
kind: Service
metadata:
  name: node-api-service
spec:
  selector:
    app: node-api
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 3000
      protocol: TCP
```

</details>

### Exercise 3: ConfigMap and Secret

Create a ConfigMap with `LOG_LEVEL=debug` and a Secret with `API_KEY=supersecret123`. Then modify the deployment to inject both as environment variables.

<details>
<summary>Solution</summary>

```bash
kubectl create configmap app-config --from-literal=LOG_LEVEL=debug
kubectl create secret generic app-secret --from-literal=API_KEY=supersecret123
```

Add to deployment container spec:

```yaml
env:
  - name: LOG_LEVEL
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: LOG_LEVEL
  - name: API_KEY
    valueFrom:
      secretKeyRef:
        name: app-secret
        key: API_KEY
```

</details>

---

## Key Takeaways

- **Container orchestration** solves the challenges of running containers at scale: scheduling, scaling, networking, and self-healing.
- Kubernetes has a **control plane** (API server, etcd, scheduler, controller manager) and **worker nodes** (kubelet, kube-proxy, container runtime).
- **Pods** are the smallest unit; **Deployments** manage pods declaratively; **Services** provide stable networking.
- **ConfigMaps** and **Secrets** externalize configuration from your container images.
- **Managed Kubernetes** (EKS, AKS, GKE) removes the burden of managing the control plane.
- **HPA** scales pods horizontally; **VPA** scales pods vertically — don't use both on the same metric.
- **Helm** simplifies Kubernetes deployments with templated, versioned charts.
- **Service meshes** like Istio add advanced traffic management and security but increase complexity.

---

## What's Next?

With containers and orchestration covered, the next lesson explores **Microservices Architecture** — the design patterns and principles for building distributed systems that run on platforms like Kubernetes.
