---
title: "Distributed Task Scheduling"
---

# Distributed Task Scheduling

Task scheduling in distributed systems determines **when**, **where**, and **how** work units execute across a cluster of machines. A well-designed scheduler maximizes resource utilization, minimizes latency, and ensures fairness among competing workloads.

---

## Why Distributed Scheduling Is Hard

| Challenge | Description |
|-----------|-------------|
| Heterogeneous resources | Nodes differ in CPU, memory, GPU, and network capacity |
| Dynamic workloads | Task arrival rates and resource demands change unpredictably |
| Fault tolerance | Nodes and tasks can fail at any time |
| Data locality | Moving computation to data is cheaper than moving data |
| Multi-tenancy | Multiple users/teams compete for shared resources |
| Scale | Decisions must be made for millions of tasks per second |

---

## Centralized vs Distributed Scheduling

### Centralized Scheduling

A single scheduler has a global view of all resources and makes all placement decisions.

```
┌─────────────────┐
│   Scheduler     │  ← single decision-maker
└────────┬────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
  Node  Node  Node
```

**Pros:**
- Optimal decisions with full cluster state
- Simpler consistency guarantees
- Easier to enforce global policies

**Cons:**
- Single point of failure
- Scalability bottleneck
- Higher latency for scheduling decisions

### Distributed Scheduling

Multiple schedulers operate concurrently, each handling a subset of decisions.

```
┌───────────┐  ┌───────────┐  ┌───────────┐
│Scheduler A│  │Scheduler B│  │Scheduler C│
└─────┬─────┘  └─────┬─────┘  └─────┬─────┘
      │               │               │
      ▼               ▼               ▼
    Nodes           Nodes           Nodes
```

**Pros:**
- Higher throughput
- No single point of failure
- Lower scheduling latency

**Cons:**
- Potential resource conflicts
- Suboptimal global decisions
- Requires conflict resolution mechanisms

---

## Scheduling Algorithms

### FIFO (First In, First Out)

Tasks are executed in the order they arrive.

```python
from collections import deque

class FIFOScheduler:
    def __init__(self):
        self.queue = deque()

    def submit(self, task):
        self.queue.append(task)

    def next_task(self):
        if self.queue:
            return self.queue.popleft()
        return None
```

**When to use:** Simple batch workloads with similar resource requirements.

**Limitation:** A large job can block all subsequent jobs (head-of-line blocking).

---

### Priority Scheduling

Each task has a priority level; higher-priority tasks execute first.

```python
import heapq

class PriorityScheduler:
    def __init__(self):
        self.heap = []
        self.counter = 0

    def submit(self, task, priority):
        # Lower number = higher priority
        heapq.heappush(self.heap, (priority, self.counter, task))
        self.counter += 1

    def next_task(self):
        if self.heap:
            priority, _, task = heapq.heappop(self.heap)
            return task
        return None
```

**Risk:** Starvation — low-priority tasks may never execute. Mitigate with priority aging.

---

### Fair Share Scheduling

Resources are divided equally among users or groups, regardless of how many tasks each submits.

| User | Submitted Tasks | Fair Share | Actual Allocation |
|------|----------------|------------|-------------------|
| Alice | 100 | 33% | 33% |
| Bob | 10 | 33% | 33% |
| Carol | 50 | 33% | 33% |

**Key concept:** Dominant Resource Fairness (DRF) extends fair share to multiple resource types (CPU, memory) by equalizing each user's dominant resource consumption.

---

### Capacity Scheduling

The cluster is partitioned into queues, each guaranteed a minimum capacity.

```
Total Cluster: 1000 CPUs
├── Production Queue: 600 CPUs (60%)
├── Development Queue: 300 CPUs (30%)
└── Research Queue:    100 CPUs (10%)
```

Queues can borrow unused capacity from other queues but must yield it back when demanded.

---

## Scheduler Architectures

### Monolithic Scheduler (YARN)

A single ResourceManager makes all scheduling decisions.

```
┌──────────────────────────┐
│     ResourceManager      │
│  ┌────────────────────┐  │
│  │  Scheduler Logic   │  │
│  │  (all policies)    │  │
│  └────────────────────┘  │
└────────────┬─────────────┘
             │
     ┌───────┼───────┐
     ▼       ▼       ▼
   NM-1    NM-2    NM-3
```

- **YARN** (Yet Another Resource Negotiator) uses this model
- Applications request containers from the ResourceManager
- NodeManagers report resource availability via heartbeats

**Throughput:** ~hundreds of scheduling decisions per second.

---

### Two-Level Scheduler (Mesos)

A central coordinator offers resources to framework-specific schedulers.

```
┌─────────────────────────────┐
│       Mesos Master          │
│   (resource offers)         │
└──────┬──────────────┬───────┘
       │              │
       ▼              ▼
┌────────────┐  ┌────────────┐
│ Framework A│  │ Framework B│
│ (Spark)    │  │ (Marathon) │
└────────────┘  └────────────┘
```

**How it works:**
1. Mesos Master collects available resources from agents
2. Master offers resources to frameworks using DRF
3. Frameworks accept/reject offers based on their own policies
4. Accepted tasks are launched on the corresponding agents

**Limitation:** Frameworks can only see offered resources, not the full cluster state (information hiding).

---

### Shared-State Scheduler (Omega / Borg)

Multiple schedulers operate on a shared, replicated cluster state.

```
┌─────────────────────────────────────┐
│        Shared Cluster State         │
│     (cell state / resource map)     │
└───┬──────────────┬──────────────┬───┘
    │              │              │
    ▼              ▼              ▼
┌────────┐   ┌────────┐   ┌────────┐
│Sched 1 │   │Sched 2 │   │Sched 3 │
│(batch)  │   │(serving)│  │(MR)    │
└────────┘   └────────┘   └────────┘
```

**Conflict resolution:** Optimistic concurrency control — schedulers make decisions on a local copy and commit atomically. Conflicts are detected and retried.

| Architecture | Parallelism | Global View | Conflict Handling |
|-------------|-------------|-------------|-------------------|
| Monolithic | None | Full | N/A |
| Two-Level | Per framework | Partial (offers) | Offer rejection |
| Shared-State | Full | Full (eventually consistent) | Optimistic locking |

---

## Resource Management

### CPU Allocation

```yaml
# Kubernetes resource spec
resources:
  requests:
    cpu: "500m"      # 0.5 CPU cores guaranteed
  limits:
    cpu: "2000m"     # Max 2 CPU cores (throttled beyond)
```

- **Requests:** guaranteed minimum — used for scheduling decisions
- **Limits:** hard cap — enforced via Linux CFS bandwidth control

### Memory Allocation

```yaml
resources:
  requests:
    memory: "256Mi"
  limits:
    memory: "1Gi"    # OOM-killed if exceeded
```

Unlike CPU (throttleable), exceeding memory limits results in immediate termination (OOM kill).

### GPU Allocation

```yaml
resources:
  limits:
    nvidia.com/gpu: 2    # Request 2 GPUs
```

GPUs are non-shareable by default — scheduling must treat them as discrete, indivisible resources.

---

## Kubernetes Scheduler

The Kubernetes scheduler assigns Pods to Nodes through a two-phase process:

### Phase 1: Filtering (Predicates)

Eliminate nodes that cannot run the Pod.

| Predicate | Purpose |
|-----------|---------|
| `PodFitsResources` | Node has enough CPU/memory |
| `PodFitsHostPorts` | Required ports are available |
| `NodeSelector` | Node labels match selector |
| `PodToleratesNodeTaints` | Pod tolerates node taints |
| `CheckNodeDiskPressure` | Node is not under disk pressure |
| `NoVolumeZoneConflict` | Volumes are in accessible zone |

### Phase 2: Scoring (Priorities)

Rank remaining nodes by desirability.

| Priority Function | What It Favors |
|-------------------|---------------|
| `LeastRequestedPriority` | Nodes with most available resources |
| `BalancedResourceAllocation` | Nodes with balanced CPU/memory usage |
| `ImageLocalityPriority` | Nodes that already have the container image |
| `InterPodAffinityPriority` | Nodes satisfying affinity rules |
| `NodeAffinityPriority` | Nodes matching preferred affinity |

### Scheduling Flow

```
Pod Created → Filter Nodes → Score Nodes → Select Best → Bind Pod to Node
```

```python
# Simplified Kubernetes scheduling logic
def schedule_pod(pod, nodes):
    # Phase 1: Filtering
    feasible = [n for n in nodes if all(
        predicate(pod, n) for predicate in PREDICATES
    )]

    if not feasible:
        raise SchedulingError("No feasible nodes")

    # Phase 2: Scoring
    scores = {}
    for node in feasible:
        scores[node] = sum(
            priority_fn(pod, node) * weight
            for priority_fn, weight in PRIORITIES
        )

    # Select highest-scoring node
    return max(scores, key=scores.get)
```

---

## Preemption

Preemption evicts lower-priority tasks to make room for higher-priority ones.

```
Before Preemption:
  Node: [Low-P Task A] [Low-P Task B] [Med-P Task C]
  Pending: [High-P Task D] — cannot fit

After Preemption:
  Node: [High-P Task D] [Med-P Task C]
  Evicted: Task A, Task B → re-queued
```

### Kubernetes PriorityClasses

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: critical-workload
value: 1000000
globalDefault: false
preemptionPolicy: PreemptLowerPriority
description: "For mission-critical services"
```

**Rules:**
- Only preempt tasks with strictly lower priority
- Minimize the number of evictions needed
- Respect PodDisruptionBudgets where possible

---

## Gang Scheduling

Gang scheduling ensures all tasks in a group are scheduled simultaneously or not at all. Essential for tightly-coupled parallel workloads (MPI, distributed training).

```
Job requires 4 GPUs across 4 nodes:

Without Gang Scheduling:
  t=0: Task 1 scheduled, Tasks 2-4 waiting → deadlock risk

With Gang Scheduling:
  t=0: Wait until all 4 slots available
  t=5: Schedule all 4 tasks simultaneously
```

**Use cases:**
- Distributed ML training (all workers must start together)
- MPI applications (processes communicate via barriers)
- Map-Reduce where mappers need synchronous start

---

## Work Stealing

Idle workers steal tasks from busy workers' local queues.

```
Worker A: [Task 1] [Task 2] [Task 3] [Task 4]
Worker B: [empty]
Worker C: [Task 5]

Worker B steals Task 4 from Worker A's queue (deque tail)

After:
Worker A: [Task 1] [Task 2] [Task 3]
Worker B: [Task 4]
Worker C: [Task 5]
```

```python
from collections import deque
import random

class WorkStealingScheduler:
    def __init__(self, num_workers):
        self.queues = [deque() for _ in range(num_workers)]

    def submit(self, worker_id, task):
        self.queues[worker_id].append(task)

    def get_task(self, worker_id):
        # Try own queue first
        if self.queues[worker_id]:
            return self.queues[worker_id].popleft()

        # Steal from a random other worker
        victims = [i for i in range(len(self.queues)) if i != worker_id]
        random.shuffle(victims)
        for victim in victims:
            if self.queues[victim]:
                return self.queues[victim].pop()  # Steal from tail

        return None  # No work available
```

**Key insight:** Stealing from the tail minimizes cache interference and avoids contention with the owner (who works from the head).

---

## Python Task Queues: Celery

Celery is the most popular distributed task queue for Python.

```python
# tasks.py
from celery import Celery

app = Celery("myapp", broker="redis://localhost:6379/0")

@app.task(bind=True, max_retries=3)
def process_image(self, image_id):
    try:
        image = download_image(image_id)
        result = apply_filters(image)
        save_result(result)
        return {"status": "success", "image_id": image_id}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)

# Calling the task
result = process_image.delay(image_id="img-123")
print(result.get(timeout=300))  # Wait for result
```

### Celery Architecture

```
Producer → Broker (Redis/RabbitMQ) → Worker Pool → Result Backend
```

| Component | Role |
|-----------|------|
| Producer | Submits tasks to the broker |
| Broker | Message queue holding pending tasks |
| Worker | Consumes and executes tasks |
| Result Backend | Stores task results (Redis, DB, etc.) |

---

## Python Task Queues: RQ (Redis Queue)

A simpler alternative to Celery for smaller workloads.

```python
# tasks.py
import time

def count_words(url):
    """Download page and count words."""
    import requests
    resp = requests.get(url)
    return len(resp.text.split())

# enqueue.py
from redis import Redis
from rq import Queue

q = Queue(connection=Redis())
job = q.enqueue(count_words, "https://example.com")

# Check result
time.sleep(5)
print(job.result)
```

| Feature | Celery | RQ |
|---------|--------|-----|
| Complexity | High (many features) | Low (simple API) |
| Broker support | Redis, RabbitMQ, SQS | Redis only |
| Task routing | Advanced | Basic |
| Monitoring | Flower dashboard | rq-dashboard |
| Best for | Large-scale production | Small/medium projects |

---

## Apache Airflow for Workflows

Airflow defines workflows as DAGs (Directed Acyclic Graphs) of tasks.

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    "etl_pipeline",
    default_args=default_args,
    schedule_interval="@daily",
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    def extract():
        # Pull data from source
        pass

    def transform():
        # Clean and process data
        pass

    def load():
        # Write to data warehouse
        pass

    t1 = PythonOperator(task_id="extract", python_callable=extract)
    t2 = PythonOperator(task_id="transform", python_callable=transform)
    t3 = PythonOperator(task_id="load", python_callable=load)

    t1 >> t2 >> t3  # Define dependencies
```

### Airflow Executor Types

| Executor | How It Works | Scale |
|----------|-------------|-------|
| SequentialExecutor | One task at a time (debugging) | Single machine |
| LocalExecutor | Parallel processes on one machine | Medium |
| CeleryExecutor | Distributes to Celery workers | Large |
| KubernetesExecutor | Spawns a Pod per task | Cloud-native |

---

## Distributed Cron

Running cron at scale requires solving leader election and exactly-once execution.

### Problems with Traditional Cron

```
Machine A: crontab → runs job X at 2:00 AM
Machine B: crontab → runs job X at 2:00 AM  ← DUPLICATE!
```

### Solutions

**1. Leader Election (simple)**

```python
import redis
import time

def acquire_lock(redis_client, job_name, ttl=300):
    """Only one node runs the job."""
    lock_key = f"cron:lock:{job_name}"
    acquired = redis_client.set(lock_key, "locked", nx=True, ex=ttl)
    return acquired

# Each node attempts to acquire before running
r = redis.Redis()
if acquire_lock(r, "nightly_report"):
    run_nightly_report()
```

**2. Distributed Cron Systems**

| System | Approach |
|--------|----------|
| Kubernetes CronJob | Scheduler ensures single execution per schedule |
| HashiCorp Nomad | Periodic jobs with leader-elected evaluation |
| dkron | Distributed cron with Raft consensus |
| Airflow | DAG scheduler handles timing and deduplication |

---

## Practical Considerations

### Idempotency

Tasks may be executed more than once (retries, duplicate delivery). Design tasks to be idempotent:

```python
# BAD: Not idempotent
def increment_counter(user_id):
    db.execute("UPDATE users SET count = count + 1 WHERE id = ?", user_id)

# GOOD: Idempotent
def set_counter(user_id, new_value):
    db.execute("UPDATE users SET count = ? WHERE id = ?", new_value, user_id)
```

### Backpressure

When tasks arrive faster than workers can process them:

```python
# Rate-limited task submission
from celery import Celery
from celery.utils.time import rate

app = Celery("myapp")

@app.task(rate_limit="100/m")  # Max 100 executions per minute
def send_notification(user_id):
    pass
```

### Monitoring Metrics

| Metric | What It Tells You |
|--------|-------------------|
| Queue depth | How much work is pending |
| Task latency | Time from submission to completion |
| Worker utilization | Percentage of time workers are busy |
| Failure rate | Percentage of tasks that fail |
| Scheduling delay | Time between task becoming ready and starting |

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Centralized scheduling | Simple but limited scalability |
| Distributed scheduling | Scalable but requires conflict resolution |
| FIFO / Priority / Fair Share | Choose based on workload fairness needs |
| Monolithic (YARN) | Full view, single bottleneck |
| Two-Level (Mesos) | Framework autonomy, partial view |
| Shared-State (Omega) | Full parallelism, optimistic concurrency |
| Kubernetes scheduler | Filter → Score → Bind pipeline |
| Preemption | Higher priority evicts lower priority |
| Gang scheduling | All-or-nothing for parallel jobs |
| Work stealing | Dynamic load balancing |
| Celery / RQ | Python distributed task execution |
| Airflow | Workflow orchestration as DAGs |
| Distributed cron | Leader election + exactly-once semantics |

---

## Exercises

1. **Design a scheduler:** You have 100 nodes and 3 user groups. Group A needs 50% resources guaranteed, Group B needs 30%, and Group C needs 20%. Implement a capacity scheduler that allows borrowing unused capacity.

2. **Implement work stealing:** Write a multi-threaded work-stealing scheduler where each thread has a local deque. Verify that load is balanced even with skewed task submission.

3. **Celery retry logic:** Create a Celery task that calls an unreliable external API. Implement exponential backoff with jitter for retries (max 5 attempts).

4. **Kubernetes scheduling:** Write a custom Kubernetes scheduler extender that scores nodes based on a custom metric (e.g., current network bandwidth availability).

5. **Distributed cron:** Implement a distributed cron system using Redis locks that ensures exactly-once execution even when 5 replicas are running the same schedule.

---

## Further Reading

- Google Borg paper: "Large-scale cluster management at Google with Borg"
- Omega paper: "Omega: Flexible, scalable schedulers for large compute clusters"
- YARN paper: "Apache Hadoop YARN: Yet Another Resource Negotiator"
- Mesos paper: "Mesos: A Platform for Fine-Grained Resource Sharing"
- Kubernetes Scheduler documentation
- Celery documentation: https://docs.celeryq.dev
- Apache Airflow documentation: https://airflow.apache.org
