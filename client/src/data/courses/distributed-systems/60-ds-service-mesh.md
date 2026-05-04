---
title: "Service Mesh"
---

# Service Mesh

As microservices architectures grow, managing communication between services becomes increasingly complex. A **service mesh** is a dedicated infrastructure layer that handles service-to-service communication, providing traffic management, security, and observability without requiring changes to application code.

---

## What is a Service Mesh?

A service mesh abstracts the networking logic out of individual services and into a shared infrastructure layer:

```
Without Service Mesh:
┌─────────┐         ┌─────────┐
│Service A │────────►│Service B │
│(+ retry  │         │(+ retry  │
│ + auth   │         │ + auth   │
│ + metrics)│        │ + metrics)│
└─────────┘         └─────────┘

With Service Mesh:
┌─────────┐  ┌───────┐      ┌───────┐  ┌─────────┐
│Service A │──│Proxy A│─────►│Proxy B│──│Service B │
│(business │  │(mesh) │      │(mesh) │  │(business │
│ logic)   │  └───────┘      └───────┘  │ logic)   │
└─────────┘                             └─────────┘
```

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| Traffic management | Routing, load balancing, retries, timeouts |
| Security | mTLS, authorization policies, encryption |
| Observability | Metrics, distributed tracing, access logs |
| Resilience | Circuit breaking, fault injection, rate limiting |

---

## Architecture: Data Plane vs Control Plane

Every service mesh has two fundamental components:

```
┌─────────────────────────────────────────────────────┐
│                   CONTROL PLANE                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Config   │  │  Service │  │  Certificate     │  │
│  │  Store    │  │  Discovery│  │  Authority (CA)  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ Configuration / Certs
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │
│ │  Sidecar │ │ │ │  Sidecar │ │ │ │  Sidecar │ │
│ │  Proxy   │ │ │ │  Proxy   │ │ │ │  Proxy   │ │
│ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │
│ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │
│ │Service A │ │ │ │Service B │ │ │ │Service C │ │
│ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │
└──────────────┘ └──────────────┘ └──────────────┘
         DATA PLANE (sidecar proxies)
```

### Data Plane

- Consists of **sidecar proxies** deployed alongside each service instance
- Intercepts all inbound and outbound network traffic
- Implements routing, load balancing, health checks, authentication
- Most common proxy: **Envoy**

### Control Plane

- Manages and configures the sidecar proxies
- Provides service discovery, certificate management, policy distribution
- Operators interact with the control plane to define routing rules and policies
- Examples: Istio's Istiod, Linkerd's control plane

---

## Sidecar Proxy Pattern: Envoy

**Envoy** is the most widely used data plane proxy in service meshes:

```yaml
# Envoy configuration example
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 10000
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      routes:
                        - match:
                            prefix: "/"
                          route:
                            cluster: service_backend
                http_filters:
                  - name: envoy.filters.http.router

  clusters:
    - name: service_backend
      connect_timeout: 5s
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      load_assignment:
        cluster_name: service_backend
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address:
                      address: backend-service
                      port_value: 8080
```

### How Sidecar Injection Works (Kubernetes)

```yaml
# Pod with sidecar proxy injected
apiVersion: v1
kind: Pod
metadata:
  name: my-service
  labels:
    app: my-service
  annotations:
    sidecar.istio.io/inject: "true"
spec:
  containers:
    # Application container
    - name: my-service
      image: my-service:1.0
      ports:
        - containerPort: 8080
    # Sidecar proxy (injected automatically)
    - name: istio-proxy
      image: docker.io/istio/proxyv2:1.20
      ports:
        - containerPort: 15090
      args:
        - proxy
        - sidecar
```

---

## Service Mesh Features

### 1. Traffic Management

```yaml
# Canary deployment: 90% to v1, 10% to v2
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: product-service
spec:
  hosts:
    - product-service
  http:
    - route:
        - destination:
            host: product-service
            subset: v1
          weight: 90
        - destination:
            host: product-service
            subset: v2
          weight: 10
```

| Feature | Description |
|---------|-------------|
| Load balancing | Round-robin, least connections, random, consistent hash |
| Traffic splitting | Canary, blue-green, A/B testing |
| Retries | Automatic retry with configurable policies |
| Timeouts | Per-route and global timeout configuration |
| Circuit breaking | Prevent cascading failures |
| Fault injection | Test resilience by injecting delays/errors |
| Mirroring | Shadow traffic to new versions |

### 2. Security (mTLS)

```yaml
# Enforce mutual TLS for all services in namespace
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT
---
# Authorization policy: only allow specific services
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: product-service-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: product-service
  rules:
    - from:
        - source:
            principals:
              - "cluster.local/ns/production/sa/order-service"
              - "cluster.local/ns/production/sa/catalog-service"
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/products/*"]
```

### 3. Observability

The mesh automatically collects:

```
┌─────────────────────────────────────────────┐
│              Observability Stack              │
├─────────────┬──────────────┬────────────────┤
│   Metrics   │   Tracing    │    Logging     │
│ (Prometheus)│   (Jaeger)   │ (Fluentd/ELK) │
├─────────────┼──────────────┼────────────────┤
│ Request rate│ Span data    │ Access logs    │
│ Error rate  │ Latency      │ Request headers│
│ Duration    │ Service deps │ Response codes │
│ Saturation  │ Critical path│ Payload size   │
└─────────────┴──────────────┴────────────────┘
```

---

## Istio

The most popular service mesh, built on Envoy:

### Architecture

```
┌──────────────────────────────────────┐
│            istiod (Control Plane)     │
│  ┌─────────┐ ┌───────┐ ┌─────────┐  │
│  │  Pilot  │ │Citadel│ │  Galley │  │
│  │(traffic)│ │(certs)│ │(config) │  │
│  └─────────┘ └───────┘ └─────────┘  │
└──────────────────┬───────────────────┘
                   │ xDS API
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│ Envoy  │    │ Envoy  │    │ Envoy  │
│ Proxy  │    │ Proxy  │    │ Proxy  │
└────────┘    └────────┘    └────────┘
```

### Virtual Services

Define how requests are routed:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews
spec:
  hosts:
    - reviews
  http:
    # Route based on headers (A/B testing)
    - match:
        - headers:
            end-user:
              exact: jason
      route:
        - destination:
            host: reviews
            subset: v3
    # Default route
    - route:
        - destination:
            host: reviews
            subset: v1
      retries:
        attempts: 3
        perTryTimeout: 2s
      timeout: 10s
```

### Destination Rules

Configure traffic policies for a destination:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 60s
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
    - name: v3
      labels:
        version: v3
```

### Gateways

Manage inbound/outbound traffic at the mesh edge:

```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: my-gateway
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: my-tls-cert
      hosts:
        - "api.example.com"
        - "*.example.com"
```

---

## Linkerd

A lightweight, Rust-based service mesh focused on simplicity:

| Aspect | Linkerd | Istio |
|--------|---------|-------|
| Proxy | linkerd2-proxy (Rust) | Envoy (C++) |
| Resource usage | ~10 MB per proxy | ~50 MB per proxy |
| Latency overhead | < 1ms p99 | 2-5ms p99 |
| Complexity | Low | High |
| Features | Core mesh features | Full-featured |
| Multi-cluster | Supported | Supported |
| Protocol support | HTTP/1.1, HTTP/2, gRPC, TCP | HTTP/1.1, HTTP/2, gRPC, TCP, MongoDB, Redis |

### Linkerd Installation

```bash
# Install Linkerd CLI
curl --proto '=https' --tlsv1.2 -sSfL https://run.linkerd.io/install | sh

# Validate cluster
linkerd check --pre

# Install control plane
linkerd install --crds | kubectl apply -f -
linkerd install | kubectl apply -f -

# Inject sidecar into a deployment
kubectl get deploy my-service -o yaml | linkerd inject - | kubectl apply -f -

# View dashboard
linkerd viz install | kubectl apply -f -
linkerd viz dashboard
```

### Linkerd Service Profile

```yaml
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: product-service.production.svc.cluster.local
  namespace: production
spec:
  routes:
    - name: GET /api/products
      condition:
        method: GET
        pathRegex: /api/products
      responseClasses:
        - condition:
            status:
              min: 500
              max: 599
          isFailure: true
    - name: POST /api/products
      condition:
        method: POST
        pathRegex: /api/products
      isRetryable: true
      timeout: 5s
```

---

## Other Service Meshes

### Consul Connect (HashiCorp)

```hcl
# Consul service definition with Connect
service {
  name = "web"
  port = 8080

  connect {
    sidecar_service {
      proxy {
        upstreams {
          destination_name = "api"
          local_bind_port  = 9191
        }
      }
    }
  }
}
```

- Uses its own built-in proxy or Envoy
- Integrates with HashiCorp Vault for secrets
- Works across Kubernetes and VMs

### AWS App Mesh

```yaml
apiVersion: appmesh.k8s.aws/v1beta2
kind: VirtualService
metadata:
  name: product-service
spec:
  provider:
    virtualRouter:
      virtualRouterRef:
        name: product-router
---
apiVersion: appmesh.k8s.aws/v1beta2
kind: VirtualRouter
metadata:
  name: product-router
spec:
  routes:
    - name: main-route
      httpRoute:
        match:
          prefix: /
        action:
          weightedTargets:
            - virtualNodeRef:
                name: product-v1
              weight: 80
            - virtualNodeRef:
                name: product-v2
              weight: 20
```

- Fully managed by AWS
- Native integration with ECS, EKS, EC2
- Uses Envoy as data plane

---

## Service Mesh vs API Gateway

| Aspect | Service Mesh | API Gateway |
|--------|-------------|-------------|
| Traffic scope | East-west (service-to-service) | North-south (client-to-service) |
| Deployment | Per-service sidecar | Centralized entry point |
| Primary purpose | Inter-service communication | External API management |
| Authentication | mTLS between services | OAuth, API keys |
| Rate limiting | Per-service | Per-client/API |
| Routing | Internal service routing | External URL routing |
| Typical products | Istio, Linkerd | Kong, AWS API GW, NGINX |
| Complements | Yes — they solve different problems | Yes |

In practice, most architectures use **both**:

```
External Clients
       │
       ▼
┌─────────────┐
│ API Gateway  │  ← North-south traffic
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│         Service Mesh                 │  ← East-west traffic
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐       │
│  │Svc│──│Svc│──│Svc│──│Svc│       │
│  │ A │  │ B │  │ C │  │ D │       │
│  └───┘  └───┘  └───┘  └───┘       │
└─────────────────────────────────────┘
```

---

## When to Adopt a Service Mesh

### You Need a Service Mesh If:

- You have **10+ microservices** communicating frequently
- You need **consistent mTLS** across all services
- You require **fine-grained traffic control** (canary, blue-green)
- You want **zero-trust networking** between services
- You need **consistent observability** without code changes

### You Don't Need a Service Mesh If:

- You have fewer than 5 services
- A simple API gateway handles your needs
- Your team lacks Kubernetes expertise
- You're running a monolith or simple architecture
- The operational overhead outweighs the benefits

---

## Performance Overhead

| Metric | Without Mesh | With Istio | With Linkerd |
|--------|-------------|-----------|--------------|
| Latency (p50) | Baseline | +2-3ms | +0.5-1ms |
| Latency (p99) | Baseline | +5-10ms | +1-2ms |
| Memory per pod | 0 | +50-100MB | +10-20MB |
| CPU per pod | 0 | +0.1-0.5 cores | +0.01-0.1 cores |
| Throughput impact | 0% | 5-15% reduction | 1-5% reduction |

### Optimization Strategies

```yaml
# Istio: tune proxy resources
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service
spec:
  template:
    metadata:
      annotations:
        # Limit sidecar resources
        sidecar.istio.io/proxyCPU: "100m"
        sidecar.istio.io/proxyMemory: "128Mi"
        sidecar.istio.io/proxyCPULimit: "500m"
        sidecar.istio.io/proxyMemoryLimit: "256Mi"
```

---

## eBPF-Based Meshes: Cilium

Traditional service meshes add a sidecar proxy per pod. **eBPF-based meshes** move networking logic into the Linux kernel, eliminating the sidecar:

```
Traditional Mesh:              eBPF Mesh (Cilium):
┌──────────────────┐          ┌──────────────────┐
│ Pod              │          │ Pod              │
│ ┌──────┐┌─────┐ │          │ ┌──────┐        │
│ │ App  ││Proxy│ │          │ │ App  │        │
│ └──────┘└─────┘ │          │ └──────┘        │
└────────┬─────────┘          └────────┬─────────┘
         │ (userspace)                  │
─────────┼──────────          ─────────┼──────────
         │                    ┌────────▼─────────┐
    Linux Kernel              │  eBPF Programs   │
                              │  (in-kernel mesh)│
                              └──────────────────┘
```

### Cilium Service Mesh Features

```yaml
# Cilium Network Policy (L7 aware)
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: allow-product-api
spec:
  endpointSelector:
    matchLabels:
      app: product-service
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: order-service
      toPorts:
        - ports:
            - port: "8080"
              protocol: TCP
          rules:
            http:
              - method: "GET"
                path: "/api/products/.*"
```

### Advantages of eBPF Meshes

| Advantage | Description |
|-----------|-------------|
| No sidecar | No extra container per pod |
| Lower latency | Kernel-level processing |
| Less memory | No proxy process overhead |
| Better throughput | Fewer context switches |
| Simpler operations | Fewer moving parts |

---

## Service Mesh Comparison Table

| Feature | Istio | Linkerd | Consul Connect | Cilium | AWS App Mesh |
|---------|-------|---------|----------------|--------|--------------|
| Proxy | Envoy | linkerd2-proxy | Envoy/Built-in | eBPF + Envoy | Envoy |
| Language | Go | Rust/Go | Go | Go/C | - |
| mTLS | Yes | Yes | Yes | Yes | Yes |
| Traffic split | Yes | Yes | Yes | Yes | Yes |
| Circuit breaking | Yes | No | Yes | Yes | Yes |
| Fault injection | Yes | No | No | No | No |
| Multi-cluster | Yes | Yes | Yes | Yes | Limited |
| Non-K8s support | Limited | No | Yes (VMs) | Limited | ECS, EC2 |
| Complexity | High | Low | Medium | Medium | Low |
| Resource overhead | High | Low | Medium | Very Low | Medium |
| Community | Large | Growing | Large | Growing | AWS managed |
| Best for | Full features | Simplicity | Multi-platform | Performance | AWS native |

---

## Exercises

### Exercise 1: Traffic Splitting

Write Istio VirtualService and DestinationRule YAML to implement a canary deployment where:
- 95% of traffic goes to `v1`
- 5% of traffic goes to `v2`
- Requests with header `X-Canary: true` always go to `v2`

### Exercise 2: Security Policy

Create an Istio AuthorizationPolicy that:
- Allows the `frontend` service to call `GET /api/products`
- Allows the `admin` service to call any method on any path
- Denies all other traffic

### Exercise 3: Mesh Selection

Given the following scenario, recommend a service mesh and justify your choice:
- 50 microservices on Kubernetes
- Team has limited Kubernetes expertise
- Latency-sensitive application (trading platform)
- Need mTLS and basic traffic management
- No requirement for fault injection or advanced routing

---

## Summary

| Concept | Key Takeaway |
|---------|--------------|
| Service Mesh | Infrastructure layer for service-to-service communication |
| Data Plane | Sidecar proxies that handle all traffic |
| Control Plane | Manages proxy configuration and certificates |
| Istio | Full-featured mesh with Envoy, high resource cost |
| Linkerd | Lightweight Rust-based mesh, minimal overhead |
| eBPF (Cilium) | Kernel-level mesh, no sidecar needed |
| vs API Gateway | Mesh = east-west; Gateway = north-south |
| When to adopt | 10+ services, need mTLS, traffic control, observability |

---

## Further Reading

- Istio documentation: istio.io/latest/docs
- Linkerd documentation: linkerd.io/docs
- "Service Mesh Patterns" by Lew Tucker & Lee Calcote
- Cilium documentation: docs.cilium.io
- CNCF Service Mesh Landscape
