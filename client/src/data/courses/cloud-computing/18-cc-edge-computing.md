---
title: "Edge and Fog Computing"
---

# Edge and Fog Computing

In this lesson, you will learn what edge computing is, how it relates to cloud computing, the difference between edge and fog computing, key technologies, and real-world use cases that are transforming industries.

---

## What Is Edge Computing?

**Edge computing** is a distributed computing model that brings computation and data storage **closer to the sources of data** — rather than relying on a centralized data center or cloud.

The "edge" refers to the **edge of the network**, near users, devices, and sensors:

```
Traditional Cloud Model:
  Device ──────── Internet ──────── Cloud Data Center
  (sensor)       (high latency)     (far away)
                  ◄── 50-200ms ──►

Edge Computing Model:
  Device ──── Edge Server ──── Cloud Data Center
  (sensor)    (nearby)          (for heavy processing)
              ◄── 1-10ms ──►
```

> **Key Idea:** Instead of sending ALL data to the cloud, process what you can at the edge and send only what's necessary to the cloud.

---

## Why Edge Computing Matters

The amount of data generated at the "edge" is exploding:

```
Data Generated at the Edge:

2020:  ██████████░░░░░░░░░░  ~50% of enterprise data
2025:  ████████████████░░░░  ~75% of enterprise data
2030:  ██████████████████░░  ~90% of enterprise data (projected)

Source: Gartner, IDC estimates
```

Traditional cloud computing can't keep up because:

1. **Too much data** to send to the cloud (bandwidth limits)
2. **Too slow** for real-time decisions (latency)
3. **Regulations** may prevent data from leaving a location
4. **Network reliability** — what if the connection drops?

---

## Edge vs. Fog vs. Cloud

These three models form a **computing continuum**:

```
┌──────────────────────────────────────────────────────┐
│                Computing Continuum                    │
│                                                      │
│  Device       Edge          Fog           Cloud      │
│  Layer        Layer         Layer         Layer      │
│                                                      │
│  ┌──────┐   ┌──────┐    ┌──────────┐   ┌────────┐  │
│  │Sensor│──►│Edge  │───►│Fog Node  │──►│Cloud   │  │
│  │Camera│   │Server│    │(Regional)│   │(Central│  │
│  │Phone │   │(Local│    │          │   │  DC)   │  │
│  └──────┘   └──────┘    └──────────┘   └────────┘  │
│                                                      │
│  ◄─────── Lower Latency    Higher Capacity ────────► │
│  ◄─────── Less Compute     More Compute ───────────► │
│  ◄─────── Local Data       Global Data ────────────► │
└──────────────────────────────────────────────────────┘
```

### Detailed Comparison

| Feature | Edge Computing | Fog Computing | Cloud Computing |
|---------|---------------|---------------|-----------------|
| **Location** | At or very near the device | Between edge and cloud | Centralized data centers |
| **Latency** | 1-10 ms | 10-50 ms | 50-200+ ms |
| **Bandwidth** | Low (processes locally) | Moderate | High (all data sent) |
| **Compute power** | Limited | Moderate | Virtually unlimited |
| **Storage** | Small (GB-TB) | Moderate (TB) | Massive (PB-EB) |
| **Reliability** | Works offline | Partial offline | Requires connectivity |
| **Data processed** | Raw sensor data | Aggregated data | All data/analytics |
| **Examples** | IoT gateway, phone | Regional server, router | AWS, Azure, GCP |

### What Is Fog Computing?

**Fog computing** (coined by Cisco) is a layer **between** edge devices and the cloud:

```
Edge Computing:
  Camera → Process on-site → Send alerts to cloud

Fog Computing:
  Camera → Send to local fog node → Aggregate with
  other cameras → Analyze patterns → Send summary to cloud

Cloud Computing:
  Camera → Send ALL video to cloud → Process in cloud
```

Think of fog as a **regional aggregation layer**:

```
                        ┌───────────┐
                        │   Cloud   │
                        └─────┬─────┘
                              │
                    ┌─────────┴─────────┐
                    │    Fog Layer       │
                    │  (City/Region)     │
                    └──┬──────────┬──────┘
                       │          │
              ┌────────┴───┐  ┌──┴────────┐
              │ Edge Site A│  │Edge Site B │
              │ (Factory)  │  │(Warehouse) │
              └──┬───┬───┬─┘  └─┬───┬───┬─┘
                 │   │   │      │   │   │
                📷  🌡️  🤖     📷  🌡️  📦
              sensors/devices  sensors/devices
```

---

## Why Edge Computing? Key Drivers

### 1. Latency

Some applications need responses in milliseconds:

```
Application Latency Requirements:

Autonomous vehicles:     < 10 ms  (life or death)
Industrial robotics:     < 20 ms  (safety critical)
AR/VR applications:      < 20 ms  (motion sickness)
Online gaming:           < 50 ms  (playable experience)
Video conferencing:      < 150 ms (acceptable quality)
Web browsing:            < 200 ms (feels responsive)
Email:                   seconds  (no urgency)

Cloud round-trip:        50-200 ms
Edge round-trip:         1-10 ms   ← Meets strict requirements
```

### 2. Bandwidth

Sending everything to the cloud is expensive and sometimes impossible:

```
Data Generated Per Day:

Autonomous car:          ~4 TB/day
Smart factory:           ~1 PB/day
Security camera (4K):    ~50 GB/day
Wind turbine:            ~200 GB/day

Uploading 4 TB/day per car to the cloud?
  At 100 Mbps: Would take ~9 hours!
  Cost at $0.09/GB: ~$360/day per car!

Edge Solution:
  Process 99% locally, send only
  1% (alerts, summaries) to cloud.
```

### 3. Data Sovereignty

Some data legally cannot leave certain locations:

```
GDPR (EU):
  Personal data of EU citizens must be processed
  within the EU (or approved countries).

  Edge solution: Process data locally in the EU,
  send only anonymized results elsewhere.

Healthcare (HIPAA):
  Patient data must stay within compliant systems.

  Edge solution: Process medical images on-site,
  send only diagnoses to central systems.
```

### 4. Reliability

Edge computing works even when the internet connection fails:

```
With Cloud Only:
  Factory ──── Internet ──── Cloud
                    ❌ (outage)
  Result: Factory stops! 🛑

With Edge Computing:
  Factory ──── Edge Server ──── Internet ──── Cloud
                    ✅                 ❌ (outage)
  Result: Factory keeps running! ✅
          (syncs with cloud when connection returns)
```

---

## Edge Computing Technologies

### AWS Edge Services

| Service | What It Does | Use Case |
|---------|-------------|----------|
| **AWS Wavelength** | Compute at 5G network edge | Ultra-low latency mobile apps |
| **AWS Outposts** | AWS hardware in your data center | On-premises AWS services |
| **AWS Local Zones** | AWS infrastructure closer to users | Low-latency compute in metros |
| **AWS IoT Greengrass** | Run Lambda functions on IoT devices | Smart device processing |
| **AWS Snow Family** | Portable edge computing devices | Remote/disconnected locations |

```
AWS Snow Family:

  Snowcone          Snowball Edge        Snowmobile
  ┌─────────┐       ┌─────────────┐      ┌──────────────┐
  │ 8 TB    │       │ 80 TB       │      │ 100 PB       │
  │ 2 vCPUs │       │ 40+ vCPUs   │      │ A literal    │
  │ Portable│       │ Rugged box  │      │ shipping     │
  │ 2.1 kg  │       │             │      │ container!   │
  └─────────┘       └─────────────┘      └──────────────┘
```

### Azure Edge Services

| Service | What It Does | Use Case |
|---------|-------------|----------|
| **Azure Edge Zones** | Azure at network edge | Low-latency apps in metros |
| **Azure Stack Edge** | AI-enabled edge appliance | On-premises ML inference |
| **Azure Stack HCI** | Hyperconverged infrastructure | Edge virtualization |
| **Azure IoT Edge** | Cloud workloads on IoT devices | Smart cameras, gateways |
| **Azure Sphere** | Secured MCU platform | Secure IoT devices |

### Google Cloud Edge Services

| Service | What It Does | Use Case |
|---------|-------------|----------|
| **Google Distributed Cloud** | GCP at edge/on-prem | Sovereign cloud, edge AI |
| **Anthos** | Multi-cloud K8s management | Run GKE anywhere |
| **Edge TPU** | ML inference at edge | On-device AI |
| **Media CDN** | Content delivery at edge | Video streaming |

### Cloudflare Workers

Serverless computing at 300+ edge locations worldwide:

```javascript
// Cloudflare Worker — Runs at the edge, closest to the user
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Process at the edge (< 10ms latency)
    if (url.pathname === "/api/location") {
      return new Response(JSON.stringify({
        country: request.cf.country,
        city: request.cf.city,
        edge: request.cf.colo,  // Which edge location
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward complex requests to origin
    return fetch(request);
  }
};
```

**Other Edge Serverless Platforms:**

| Platform | Edge Locations | Language Support |
|----------|---------------|-----------------|
| **Cloudflare Workers** | 300+ cities | JavaScript, Rust, C, C++ |
| **Deno Deploy** | 35+ regions | JavaScript, TypeScript |
| **Fastly Compute** | 90+ PoPs | Rust, JavaScript, Go |
| **Vercel Edge Functions** | Global | JavaScript, TypeScript |
| **Netlify Edge Functions** | Global | JavaScript, TypeScript |

---

## IoT and Edge Computing

The **Internet of Things (IoT)** is one of the biggest drivers of edge computing. Billions of devices generate data that needs local processing:

```
IoT Edge Architecture:

  Sensors & Devices          Edge Gateway         Cloud
  ┌──────────────┐          ┌────────────┐       ┌───────┐
  │ Temperature  │          │            │       │       │
  │ Humidity     │──────────│ Filter     │       │ Store │
  │ Pressure     │  raw     │ Aggregate  │ ─────►│ Train │
  │ Vibration    │  data    │ Alert      │summary│Analyze│
  │ Camera       │          │ ML Infer   │  only │       │
  └──────────────┘          └────────────┘       └───────┘
     Thousands of              Edge Server         Cloud DC
     data points/sec           (on-premises)       (remote)
```

### Edge Processing Pipeline

```
Step 1: Collect
  Sensors generate raw data (temperature: 72.3°F every second)

Step 2: Filter (at the edge)
  Discard normal readings, keep anomalies
  (temperature spike to 150°F → ALERT!)

Step 3: Aggregate (at the edge)
  Compute averages, min/max over time windows
  (avg temp last hour: 73.1°F)

Step 4: Act (at the edge)
  Trigger local actions immediately
  (shut down machine if overheating)

Step 5: Send (to cloud)
  Upload summaries and anomalies only
  (reduces data by 90-99%)
```

### Example: Smart Factory with Edge

```python
# Edge processing on a factory gateway (pseudo-code)
class EdgeProcessor:
    def __init__(self):
        self.threshold_temp = 85.0  # Celsius
        self.readings = []

    def process_sensor_data(self, sensor_id, temperature):
        # Step 1: Immediate alert (edge decision, < 5ms)
        if temperature > self.threshold_temp:
            self.trigger_alarm(sensor_id)
            self.send_alert_to_cloud(sensor_id, temperature)
            return

        # Step 2: Aggregate locally
        self.readings.append(temperature)

        # Step 3: Send summary every 5 minutes (not every reading)
        if len(self.readings) >= 300:
            summary = {
                "avg": sum(self.readings) / len(self.readings),
                "max": max(self.readings),
                "min": min(self.readings),
            }
            self.send_summary_to_cloud(summary)
            self.readings.clear()

    def trigger_alarm(self, sensor_id):
        # Local action — no cloud dependency!
        print(f"ALARM: Sensor {sensor_id} overheating!")
        # Activate cooling system locally
```

---

## 5G and Edge Computing

**5G** and edge computing are deeply intertwined. 5G enables edge computing at scale, and edge computing makes 5G applications possible:

```
5G + Edge Computing:

  ┌────────┐    5G Radio    ┌──────────────┐    ┌───────┐
  │  Phone │◄──────────────►│  5G Tower    │    │       │
  │  Car   │   (< 1ms air) │  + Edge      │────│ Cloud │
  │  Drone │                │  Compute     │    │       │
  └────────┘                └──────────────┘    └───────┘
                             Processing at
                             the cell tower!
```

### 5G Edge Capabilities

| Feature | 4G | 5G + Edge |
|---------|-----|-----------|
| Latency | 30-50 ms | 1-5 ms |
| Bandwidth | 100 Mbps | 1-10 Gbps |
| Device density | ~100K/km² | ~1M/km² |
| Edge compute | Not integrated | Built-in (MEC) |

### Multi-access Edge Computing (MEC)

**MEC** (defined by ETSI) places compute resources at the **mobile network edge**, typically at or near cell towers:

```
MEC Architecture:

  User Devices ──► Radio Access ──► MEC Server ──► Core Network ──► Cloud
                    Network          (at tower)
                                        │
                                   ┌────┴────┐
                                   │ Process  │
                                   │ locally  │
                                   │ < 5ms    │
                                   └──────────┘
```

---

## CDNs as Edge Computing

**Content Delivery Networks (CDNs)** were the original edge computing — and they're evolving beyond static content:

```
CDN Evolution:

Phase 1 (2000s): Cache static files
  Images, CSS, JS → Cached at edge PoPs

Phase 2 (2010s): Dynamic content acceleration
  API responses → Optimized routing

Phase 3 (2020s): Edge compute
  Run code at edge → Full applications at PoPs
```

### Modern CDN Capabilities

| CDN Provider | Edge Compute | Key Feature |
|-------------|-------------|-------------|
| **Cloudflare** | Workers, R2, D1 | Full-stack at edge |
| **Akamai** | EdgeWorkers | Enterprise edge compute |
| **Fastly** | Compute@Edge | Wasm-based edge |
| **AWS CloudFront** | Lambda@Edge | AWS integration |
| **Azure CDN** | Edge Rules | Azure integration |

### Example: Edge-Side Rendering

```
Traditional Server-Side Rendering:
  User (Tokyo) → Server (Virginia) → Render HTML → Send back
  Latency: ~200ms

Edge-Side Rendering:
  User (Tokyo) → Edge (Tokyo) → Render HTML → Send back
  Latency: ~10ms
```

---

## Use Cases

### 1. Autonomous Vehicles

Self-driving cars must make split-second decisions:

```
Autonomous Vehicle Edge Computing:

  ┌────────────────────────────────────┐
  │  In-Vehicle Edge Computer          │
  │                                    │
  │  Cameras (8+)  ──►  Object        │
  │  LiDAR         ──►  Detection     │──► Steering
  │  Radar         ──►  & Path        │──► Braking
  │  Ultrasonic    ──►  Planning      │──► Acceleration
  │  GPS           ──►  (< 10ms)      │
  │                                    │
  └────────────────────────────────────┘
         │
         │ (non-critical data)
         ▼
  ┌────────────────┐
  │  Cloud          │
  │  Map updates    │
  │  ML retraining  │
  │  Fleet analytics│
  └────────────────┘

Why Edge: A car traveling 60mph moves 3 feet
in the time it takes for a cloud round-trip.
Can't afford to wait!
```

### 2. AR/VR (Augmented/Virtual Reality)

Immersive experiences need ultra-low latency to avoid motion sickness:

```
AR/VR Latency Requirements:

  Motion-to-photon latency must be < 20ms
  (time from head movement to updated display)

  Cloud processing: 50-200ms  ❌ (causes nausea)
  Edge processing:  5-15ms    ✅ (smooth experience)
```

### 3. Smart Factories (Industry 4.0)

Real-time monitoring and control of manufacturing equipment:

```
Smart Factory Edge Architecture:

  ┌──────────────────────────────────────────┐
  │  Factory Floor                            │
  │                                          │
  │  Robot Arms ──► ┌────────────┐           │
  │  Conveyors  ──► │ Edge Server│──► Cloud  │
  │  Sensors    ──► │            │   (ERP,   │
  │  Cameras    ──► │ Real-time  │   reports,│
  │                 │ Quality    │   ML      │
  │                 │ Control    │   training)│
  │                 └────────────┘           │
  └──────────────────────────────────────────┘

Edge Decisions (< 10ms):
  • Defect detection in products
  • Machine shutdown on anomaly
  • Robot path adjustment
  • Quality control pass/fail
```

### 4. Cloud Gaming

Game streaming services use edge computing to minimize input lag:

```
Cloud Gaming Without Edge:
  Controller Input → Internet → Cloud DC → Render Frame → Internet → Display
  Total latency: 80-150ms (noticeable lag)

Cloud Gaming With Edge:
  Controller Input → 5G → Edge Server → Render Frame → 5G → Display
  Total latency: 10-30ms (feels instant)
```

| Service | Edge Strategy |
|---------|--------------|
| **Xbox Cloud Gaming** | Azure edge data centers |
| **NVIDIA GeForce NOW** | Edge PoPs worldwide |
| **Google (Stadia, shut down)** | Google edge network |
| **Amazon Luna** | AWS edge infrastructure |

### 5. Retail and Smart Stores

```
Smart Store Edge Computing:

  ┌─────────────────────────────────┐
  │  In-Store Edge Server            │
  │                                  │
  │  Cameras ──► Customer tracking   │
  │  Shelves ──► Inventory levels    │
  │  POS     ──► Transaction speed   │
  │  Beacons ──► Personalized offers │
  │                                  │
  │  Works even if internet is down! │
  └─────────────────────────────────┘
```

### 6. Healthcare Edge

```
Hospital Edge Computing:

  Patient Monitors ──► Edge Server ──► Immediate alerts
  MRI/CT Scanners  ──► Edge AI    ──► Preliminary diagnosis
  Wearables        ──► Edge       ──► Real-time vitals

  Critical: Life-saving decisions can't wait
  for a cloud round-trip!
```

---

## Architecture Patterns

### Pattern 1: Edge-Cloud Hierarchy

```
┌─────────────────────────────────────────────────────┐
│  Tier 0: Devices                                     │
│  (Sensors, cameras, phones)                          │
│  • Data collection                                   │
│  • Simple filtering                                  │
├─────────────────────────────────────────────────────┤
│  Tier 1: Edge (On-premises)                          │
│  (Gateways, edge servers)                            │
│  • Real-time processing                              │
│  • Local ML inference                                │
│  • Immediate actions                                 │
├─────────────────────────────────────────────────────┤
│  Tier 2: Fog / Near Edge                             │
│  (Regional servers, 5G MEC)                          │
│  • Aggregation from multiple sites                   │
│  • More complex analytics                            │
│  • Regional coordination                             │
├─────────────────────────────────────────────────────┤
│  Tier 3: Cloud                                       │
│  (Central data centers)                              │
│  • ML model training                                 │
│  • Long-term storage                                 │
│  • Global analytics                                  │
│  • Business intelligence                             │
└─────────────────────────────────────────────────────┘
```

### Pattern 2: Edge ML Inference

Train models in the cloud, deploy for inference at the edge:

```
┌────────────────────────────────────────┐
│  Cloud (Training)                       │
│                                        │
│  Historical Data ──► Train ML Model    │
│                          │             │
│                     Deploy Model       │
│                          │             │
└──────────────────────────┼─────────────┘
                           │
                           ▼
┌────────────────────────────────────────┐
│  Edge (Inference)                       │
│                                        │
│  Camera Feed ──► ML Model ──► Results  │
│                  (frozen)     "Defect   │
│                               Found!"  │
│                                        │
│  Latency: < 10ms                       │
│  No cloud dependency for inference!    │
└────────────────────────────────────────┘
```

### Pattern 3: Event-Driven Edge

Process events locally, forward important ones to cloud:

```
All Events (1000/sec)
       │
  ┌────┴────┐
  │  Edge   │
  │ Filter  │
  └────┬────┘
       │
  ┌────┴──────────────────┐
  │                        │
  Normal Events         Important Events (10/sec)
  (discarded or           │
   stored locally)        ▼
                     ┌─────────┐
                     │  Cloud  │
                     │ Process │
                     └─────────┘

Result: 99% reduction in cloud data transfer!
```

### Pattern 4: Edge Mesh

Multiple edge nodes communicate directly without going through the cloud:

```
  ┌──────┐         ┌──────┐
  │Edge A│◄───────►│Edge B│
  │      │  direct │      │
  └──┬───┘  mesh   └──┬───┘
     │                 │
     │    ┌──────┐     │
     └───►│Edge C│◄────┘
          │      │
          └──┬───┘
             │
             ▼
         ┌───────┐
         │ Cloud │ (periodic sync)
         └───────┘
```

---

## Edge Computing Challenges

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| **Limited resources** | Edge devices have less CPU, RAM, storage | Optimize models, use edge-specific hardware |
| **Physical security** | Edge devices may be in insecure locations | Hardware encryption, tamper detection |
| **Management at scale** | Managing thousands of edge nodes | Kubernetes (K3s), fleet management tools |
| **Software updates** | Updating remote devices safely | OTA updates, canary deployments, rollback |
| **Data consistency** | Edge and cloud data may diverge | Eventual consistency, conflict resolution |
| **Networking** | Intermittent connectivity | Offline-first design, store-and-forward |
| **Heterogeneity** | Different hardware at different edges | Containers, hardware abstraction |

---

## Edge Computing Tools and Frameworks

| Tool | Purpose | Best For |
|------|---------|----------|
| **K3s** | Lightweight Kubernetes | Edge container orchestration |
| **KubeEdge** | K8s edge extension | IoT + Kubernetes |
| **Azure IoT Edge** | Edge module deployment | Azure ecosystem |
| **AWS IoT Greengrass** | Edge Lambda functions | AWS ecosystem |
| **Eclipse ioFog** | Edge microservices | Open-source edge orchestration |
| **OpenYurt** | Cloud-native edge platform | CNCF edge management |
| **TensorFlow Lite** | Edge ML inference | On-device AI |
| **ONNX Runtime** | Cross-platform ML | Portable ML models |

---

## Exercises

**Exercise 1:** A self-driving car generates 4 TB of sensor data per day. If cloud storage costs $0.023/GB/month and data transfer costs $0.09/GB, calculate:
a) Monthly cost to send ALL data to the cloud
b) Monthly cost if edge processing reduces cloud-bound data to 1%
c) Annual savings from edge computing

**Exercise 2:** Design an edge computing architecture for a chain of 50 retail stores. Each store has 20 security cameras, POS systems, and inventory sensors. Decide:
- What should be processed at the edge (in-store)?
- What should be sent to a regional fog layer?
- What should go to the cloud?
Draw a diagram showing the data flow.

**Exercise 3:** Write pseudo-code for an edge processing pipeline that:
- Receives temperature readings every second from 100 sensors
- Alerts immediately if any reading exceeds 95°C
- Calculates 5-minute averages per sensor
- Sends only averages and alerts to the cloud

**Exercise 4:** Compare AWS Wavelength, Azure Edge Zones, and Google Distributed Cloud. Create a table comparing: target use cases, deployment model, integration with parent cloud, and pricing model.

---

## Key Takeaways

- **Edge computing** brings processing closer to data sources for lower latency, reduced bandwidth, and better reliability.
- **Fog computing** is an intermediate layer between edge devices and the cloud, providing regional aggregation and processing.
- Key drivers are **latency** (< 10ms needed), **bandwidth** (too much data for the cloud), **data sovereignty**, and **offline reliability**.
- Major platforms include **AWS Wavelength/Outposts**, **Azure Edge Zones/Stack Edge**, **Google Distributed Cloud**, and **Cloudflare Workers**.
- **5G + edge** (MEC) is enabling a new wave of ultra-low latency applications.
- **CDNs** have evolved from caching static content to running full applications at the edge.
- Top use cases include **autonomous vehicles**, **AR/VR**, **smart factories**, **cloud gaming**, and **healthcare**.
- Common architecture patterns include **edge-cloud hierarchy**, **edge ML inference**, **event-driven edge**, and **edge mesh**.
- The trend is clear: computing is moving from centralized to distributed, with the edge becoming increasingly important.

---
