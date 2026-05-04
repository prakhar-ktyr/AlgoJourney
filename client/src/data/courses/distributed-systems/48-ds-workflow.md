---
title: "Workflow Orchestration"
---

# Workflow Orchestration

Workflow orchestration coordinates the execution of multiple distributed tasks, services, and processes to achieve a business goal. It provides reliability, visibility, and control over complex multi-step operations.

---

## What Is Workflow Orchestration?

A **workflow** is a sequence of steps (tasks, decisions, events) that together accomplish a unit of work. **Orchestration** means a central coordinator directs participants, deciding what runs, when, and how failures are handled.

| Aspect | Without Orchestration | With Orchestration |
|--------|----------------------|-------------------|
| Coordination | Ad-hoc scripts, cron jobs | Declarative DAGs or code |
| Failure handling | Manual retries, silent failures | Automatic retries, dead-letter queues |
| Visibility | Grep through logs | Dashboards, run history |
| Scalability | Tied to one machine | Distributed workers |
| Versioning | Redeploy everything | Controlled rollouts |

---

## Choreography vs Orchestration

Two fundamental approaches to coordinating distributed services:

### Choreography

Each service reacts to events independently — no central controller.

```
Order Service ──publish──▶ "OrderCreated"
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                  ▼
    Payment Service    Inventory Service    Notification Service
```

**Pros:** Loose coupling, independent deployability, no single point of failure.
**Cons:** Hard to track overall progress, debugging is difficult, implicit dependencies.

### Orchestration

A central orchestrator directs each service explicitly.

```
Orchestrator
    │
    ├──▶ Payment Service    (step 1)
    ├──▶ Inventory Service  (step 2)
    └──▶ Notification Svc   (step 3)
```

**Pros:** Clear control flow, easy monitoring, centralized error handling.
**Cons:** Single point of failure (mitigated by HA), tighter coupling to orchestrator.

| Factor | Choreography | Orchestration |
|--------|-------------|---------------|
| Coupling | Event-driven, loose | Direct calls, moderate |
| Visibility | Low (distributed) | High (centralized) |
| Complexity | Grows with participants | Contained in orchestrator |
| Failure handling | Each service owns | Orchestrator owns |
| Best for | Simple event flows | Complex multi-step processes |

---

## Workflow Engines Overview

### Apache Airflow

The most popular open-source workflow orchestration platform, originally built at Airbnb.

**Core Concepts:**

- **DAG (Directed Acyclic Graph):** Defines task dependencies and execution order.
- **Operators:** Units of work (BashOperator, PythonOperator, etc.).
- **Sensors:** Wait for an external condition (file arrival, API response).
- **Scheduler:** Triggers DAG runs based on schedule or external events.
- **Executor:** Runs tasks (Local, Celery, Kubernetes).

```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.sensors.filesystem import FileSensor
from datetime import datetime, timedelta

default_args = {
    "owner": "data-team",
    "retries": 3,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="etl_pipeline",
    default_args=default_args,
    schedule_interval="@daily",
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    wait_for_file = FileSensor(
        task_id="wait_for_file",
        filepath="/data/incoming/daily_export.csv",
        poke_interval=60,
        timeout=3600,
    )

    def extract(**context):
        # Read raw data
        pass

    def transform(**context):
        # Clean, validate, enrich
        pass

    def load(**context):
        # Write to data warehouse
        pass

    extract_task = PythonOperator(task_id="extract", python_callable=extract)
    transform_task = PythonOperator(task_id="transform", python_callable=transform)
    load_task = PythonOperator(task_id="load", python_callable=load)

    wait_for_file >> extract_task >> transform_task >> load_task
```

### Temporal

A durable execution platform that guarantees workflow completion despite failures.

**Key difference from Airflow:** Temporal runs arbitrary code with automatic state persistence — if a worker crashes mid-execution, it resumes exactly where it left off.

### Prefect

Modern Python-native workflow orchestration with a focus on developer experience.

```python
from prefect import flow, task

@task(retries=3, retry_delay_seconds=10)
def fetch_data(url: str) -> dict:
    import httpx
    return httpx.get(url).json()

@task
def process_data(data: dict) -> list:
    return [item for item in data["results"] if item["active"]]

@flow(name="data-pipeline")
def pipeline():
    data = fetch_data("https://api.example.com/data")
    processed = process_data(data)
    return processed
```

### Luigi (Spotify)

Task-based pipeline framework focused on dependency resolution and target-based execution.

### Argo Workflows (Kubernetes-Native)

Runs workflows as Kubernetes pods — each step is a container.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: ml-training-pipeline
spec:
  entrypoint: train
  templates:
    - name: train
      steps:
        - - name: preprocess
            template: preprocess-data
        - - name: train-model
            template: train-model
        - - name: evaluate
            template: evaluate-model

    - name: preprocess-data
      container:
        image: ml-pipeline:latest
        command: [python, preprocess.py]

    - name: train-model
      container:
        image: ml-pipeline:latest
        command: [python, train.py]
        resources:
          requests:
            nvidia.com/gpu: 1

    - name: evaluate-model
      container:
        image: ml-pipeline:latest
        command: [python, evaluate.py]
```

---

## Temporal Deep Dive

Temporal provides **durable execution** — your code runs to completion even through infrastructure failures, deploys, and restarts.

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Client    │────▶│  Temporal Server  │◀────│   Workers   │
│ (start wf)  │     │  (state machine) │     │ (run code)  │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │  Persistence │
                    │  (Cassandra/ │
                    │   PostgreSQL)│
                    └─────────────┘
```

### Workflows

A workflow is a function that orchestrates activities. Temporal replays the workflow from history on recovery.

```go
// Go SDK example
func OrderWorkflow(ctx workflow.Context, order Order) error {
    // Set activity options
    actCtx := workflow.WithActivityOptions(ctx, workflow.ActivityOptions{
        StartToCloseTimeout: 5 * time.Minute,
        RetryPolicy: &temporal.RetryPolicy{
            MaximumAttempts: 3,
        },
    })

    // Step 1: Reserve inventory
    var reserved bool
    err := workflow.ExecuteActivity(actCtx, ReserveInventory, order).Get(ctx, &reserved)
    if err != nil {
        return err
    }

    // Step 2: Charge payment
    var paymentID string
    err = workflow.ExecuteActivity(actCtx, ChargePayment, order).Get(ctx, &paymentID)
    if err != nil {
        // Compensate: release inventory
        _ = workflow.ExecuteActivity(actCtx, ReleaseInventory, order).Get(ctx, nil)
        return err
    }

    // Step 3: Ship order
    err = workflow.ExecuteActivity(actCtx, ShipOrder, order).Get(ctx, nil)
    if err != nil {
        // Compensate: refund and release
        _ = workflow.ExecuteActivity(actCtx, RefundPayment, paymentID).Get(ctx, nil)
        _ = workflow.ExecuteActivity(actCtx, ReleaseInventory, order).Get(ctx, nil)
        return err
    }

    return nil
}
```

### Activities

Activities are the actual side-effect-producing functions (API calls, DB writes, file I/O).

```go
func ReserveInventory(ctx context.Context, order Order) (bool, error) {
    // This code can fail and will be retried automatically
    resp, err := inventoryClient.Reserve(ctx, order.Items)
    if err != nil {
        return false, err
    }
    return resp.Success, nil
}
```

### Signals

Signals deliver data to a running workflow asynchronously.

```go
func ApprovalWorkflow(ctx workflow.Context, request Request) error {
    var approved bool

    // Wait for approval signal (with timeout)
    signalCh := workflow.GetSignalChannel(ctx, "approval-signal")
    timerCtx, cancel := workflow.WithCancel(ctx)

    selector := workflow.NewSelector(ctx)
    selector.AddReceive(signalCh, func(ch workflow.ReceiveChannel, more bool) {
        ch.Receive(ctx, &approved)
        cancel()
    })
    selector.AddFuture(workflow.NewTimer(timerCtx, 24*time.Hour), func(f workflow.Future) {
        // Timeout — auto-reject
        approved = false
    })
    selector.Select(ctx)

    if approved {
        return workflow.ExecuteActivity(ctx, ProcessApproved, request).Get(ctx, nil)
    }
    return workflow.ExecuteActivity(ctx, ProcessRejected, request).Get(ctx, nil)
}
```

### Queries

Queries read workflow state without affecting execution.

```go
func OrderWorkflow(ctx workflow.Context, order Order) error {
    var status string

    // Register query handler
    err := workflow.SetQueryHandler(ctx, "get-status", func() (string, error) {
        return status, nil
    })
    if err != nil {
        return err
    }

    status = "processing"
    // ... workflow logic ...
    status = "completed"

    return nil
}
```

### Child Workflows

Break complex workflows into composable sub-workflows.

```go
func ParentWorkflow(ctx workflow.Context, orders []Order) error {
    var futures []workflow.ChildWorkflowFuture

    for _, order := range orders {
        childCtx := workflow.WithChildOptions(ctx, workflow.ChildWorkflowOptions{
            WorkflowID: "order-" + order.ID,
        })
        future := workflow.ExecuteChildWorkflow(childCtx, OrderWorkflow, order)
        futures = append(futures, future)
    }

    // Wait for all child workflows
    for _, f := range futures {
        if err := f.Get(ctx, nil); err != nil {
            // Handle individual failure
        }
    }
    return nil
}
```

### Versioning

Safely change workflow logic while existing executions are in-flight.

```go
func MyWorkflow(ctx workflow.Context) error {
    v := workflow.GetVersion(ctx, "change-1", workflow.DefaultVersion, 1)

    if v == workflow.DefaultVersion {
        // Old logic for existing executions
        _ = workflow.ExecuteActivity(ctx, OldActivity).Get(ctx, nil)
    } else {
        // New logic for new executions
        _ = workflow.ExecuteActivity(ctx, NewActivityA).Get(ctx, nil)
        _ = workflow.ExecuteActivity(ctx, NewActivityB).Get(ctx, nil)
    }
    return nil
}
```

---

## Cadence (Predecessor to Temporal)

Cadence was created at Uber and is the direct predecessor to Temporal. The Temporal founders (Maxim Fateev, Samar Abbas) built Cadence at Uber before starting Temporal.

| Aspect | Cadence | Temporal |
|--------|---------|----------|
| Origin | Uber (2017) | Temporal Inc. (2020) |
| Governance | Uber open-source | Independent company |
| SDKs | Go, Java | Go, Java, TypeScript, Python, .NET |
| Namespaces | Domains | Namespaces |
| Cloud offering | No | Temporal Cloud |
| Active development | Maintenance mode | Very active |

---

## Cloud Workflow Services

### AWS Step Functions

Serverless orchestrator using JSON-based Amazon States Language (ASL).

```json
{
  "Comment": "Order processing workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:validate",
      "Next": "CheckInventory",
      "Retry": [
        {
          "ErrorEquals": ["ServiceUnavailable"],
          "IntervalSeconds": 2,
          "MaxAttempts": 3,
          "BackoffRate": 2.0
        }
      ]
    },
    "CheckInventory": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.inStock",
          "BooleanEquals": true,
          "Next": "ProcessPayment"
        }
      ],
      "Default": "OutOfStock"
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:payment",
      "Next": "ShipOrder"
    },
    "ShipOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ship",
      "End": true
    },
    "OutOfStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:notify-oos",
      "End": true
    }
  }
}
```

### Azure Durable Functions

Code-first orchestration using .NET, JavaScript, Python, or PowerShell.

```csharp
[FunctionName("OrderOrchestrator")]
public static async Task<string> Run(
    [OrchestrationTrigger] IDurableOrchestrationContext context)
{
    var order = context.GetInput<Order>();

    // Fan-out: validate multiple items in parallel
    var validationTasks = order.Items.Select(
        item => context.CallActivityAsync<bool>("ValidateItem", item)
    );
    bool[] results = await Task.WhenAll(validationTasks);

    if (results.All(r => r))
    {
        await context.CallActivityAsync("ProcessPayment", order);
        await context.CallActivityAsync("ShipOrder", order);
        return "completed";
    }

    return "validation-failed";
}
```

---

## Workflow Patterns

### 1. Sequential

Tasks execute one after another.

```
A ──▶ B ──▶ C ──▶ D
```

### 2. Parallel (Fan-Out / Fan-In)

Multiple tasks execute concurrently, then results are aggregated.

```
        ┌──▶ B1 ──┐
A ──────┼──▶ B2 ──┼──▶ C (aggregate)
        └──▶ B3 ──┘
```

### 3. Conditional (Choice)

Execution path depends on data or conditions.

```
        ┌── condition=true ──▶ B
A ──────┤
        └── condition=false ─▶ C
```

### 4. Loop (Iteration)

Repeat steps until a condition is met.

```
A ──▶ B ──▶ [check] ──no──┐
              ▲            │
              └────────────┘
              yes
               ▼
               C
```

### 5. Error Handling (Try-Catch-Finally)

```
try:
    A ──▶ B ──▶ C
catch:
    Compensate ──▶ Alert
finally:
    Cleanup
```

---

## Saga Pattern with Workflows

The Saga pattern manages distributed transactions by defining compensating actions for each step.

```go
func OrderSaga(ctx workflow.Context, order Order) error {
    // Define compensation stack
    var compensations []func(workflow.Context) error

    // Step 1: Reserve inventory
    err := workflow.ExecuteActivity(ctx, ReserveInventory, order).Get(ctx, nil)
    if err != nil {
        return err
    }
    compensations = append(compensations, func(ctx workflow.Context) error {
        return workflow.ExecuteActivity(ctx, ReleaseInventory, order).Get(ctx, nil)
    })

    // Step 2: Charge payment
    err = workflow.ExecuteActivity(ctx, ChargePayment, order).Get(ctx, nil)
    if err != nil {
        return runCompensations(ctx, compensations)
    }
    compensations = append(compensations, func(ctx workflow.Context) error {
        return workflow.ExecuteActivity(ctx, RefundPayment, order).Get(ctx, nil)
    })

    // Step 3: Ship order
    err = workflow.ExecuteActivity(ctx, ShipOrder, order).Get(ctx, nil)
    if err != nil {
        return runCompensations(ctx, compensations)
    }

    return nil
}

func runCompensations(ctx workflow.Context, comps []func(workflow.Context) error) error {
    // Execute compensations in reverse order
    for i := len(comps) - 1; i >= 0; i-- {
        if err := comps[i](ctx); err != nil {
            // Log compensation failure — may need manual intervention
            workflow.GetLogger(ctx).Error("compensation failed", "error", err)
        }
    }
    return fmt.Errorf("saga rolled back")
}
```

---

## Idempotency in Workflows

Workflows must handle retries safely. An operation is **idempotent** if executing it multiple times produces the same result as executing it once.

### Why Idempotency Matters

| Scenario | Without Idempotency | With Idempotency |
|----------|--------------------|--------------------|
| Activity retried after timeout | Double charge | Single charge |
| Workflow replayed from history | Duplicate side effects | Safe replay |
| Worker crashes mid-activity | Inconsistent state | Consistent state |

### Strategies for Idempotency

**1. Idempotency Keys**

```go
func ChargePayment(ctx context.Context, order Order) error {
    // Use order ID as idempotency key
    idempotencyKey := fmt.Sprintf("charge-%s-%d", order.ID, order.Version)

    resp, err := paymentGateway.Charge(ctx, ChargeRequest{
        Amount:         order.Total,
        IdempotencyKey: idempotencyKey,
    })
    if err != nil {
        return err
    }
    return nil
}
```

**2. Conditional Writes (Check-then-Act)**

```sql
-- Only insert if not already processed
INSERT INTO processed_orders (order_id, status, processed_at)
VALUES ($1, 'completed', NOW())
ON CONFLICT (order_id) DO NOTHING;
```

**3. Token-Based Deduplication**

```go
func SendNotification(ctx context.Context, req NotificationRequest) error {
    // Check if already sent
    exists, err := deduplicationStore.Exists(ctx, req.DeduplicationToken)
    if err != nil {
        return err
    }
    if exists {
        return nil // Already processed
    }

    // Send notification
    err = notificationService.Send(ctx, req)
    if err != nil {
        return err
    }

    // Mark as sent
    return deduplicationStore.Set(ctx, req.DeduplicationToken, 24*time.Hour)
}
```

**4. Deterministic Workflow Code (Temporal-specific)**

```go
// WRONG: Non-deterministic — breaks replay
func MyWorkflow(ctx workflow.Context) error {
    if time.Now().Hour() > 12 {  // ❌ Different on replay
        // ...
    }
    id := uuid.New()  // ❌ Different on replay
}

// CORRECT: Use Temporal APIs for non-determinism
func MyWorkflow(ctx workflow.Context) error {
    now := workflow.Now(ctx)  // ✅ Deterministic on replay
    if now.Hour() > 12 {
        // ...
    }
    id := workflow.SideEffect(ctx, func(ctx workflow.Context) interface{} {
        return uuid.New()  // ✅ Recorded, replayed from history
    })
}
```

---

## Comparison of Workflow Engines

| Feature | Airflow | Temporal | Step Functions | Argo |
|---------|---------|----------|----------------|------|
| Model | DAG (config) | Code (durable) | State machine (JSON) | DAG (YAML) |
| Language | Python | Go, Java, TS, Python | JSON/YAML | Any (containers) |
| Execution | Scheduled batch | Event-driven, long-running | Event-driven | Kubernetes pods |
| State | External (DB) | Built-in (event sourcing) | Managed | Kubernetes CRDs |
| Latency | Minutes (scheduler) | Milliseconds | Milliseconds | Seconds (pod startup) |
| Best for | Data pipelines | Microservice orchestration | Serverless flows | CI/CD, ML pipelines |
| Pricing | Self-hosted / managed | Self-hosted / cloud | Per state transition | Self-hosted |

---

## Try It Yourself

### Exercise 1: Design a Workflow

Design a workflow for a user registration process:
1. Validate email format
2. Check if user already exists
3. Create user record
4. Send verification email
5. Wait for email verification (timeout: 24 hours)
6. Activate account

**Questions:**
- What happens if step 4 fails?
- How do you handle the 24-hour timeout?
- What compensations are needed if step 3 succeeds but step 4 fails?

### Exercise 2: Identify Idempotency Issues

```python
def process_order(order_id):
    order = db.get_order(order_id)
    charge_customer(order.customer_id, order.total)
    decrement_inventory(order.items)
    send_confirmation_email(order.customer_email)
    db.update_order_status(order_id, "completed")
```

List all idempotency issues and propose fixes for each step.

### Exercise 3: Choreography to Orchestration

Convert this event-driven choreography into an orchestrated workflow:

```
OrderService publishes "OrderCreated"
  → PaymentService listens, charges card, publishes "PaymentProcessed"
    → InventoryService listens, reserves items, publishes "InventoryReserved"
      → ShippingService listens, creates shipment, publishes "Shipped"
        → NotificationService listens, emails customer
```

Write pseudo-code for the orchestrator workflow, including error handling and compensations.

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Orchestration | Central coordinator manages workflow execution |
| Choreography | Services react to events independently |
| Temporal | Durable execution — code survives failures |
| Airflow | DAG-based scheduling for data pipelines |
| Saga Pattern | Compensating actions for distributed transactions |
| Idempotency | Safe retries through deduplication and determinism |
| Workflow Patterns | Sequential, parallel, conditional, loop, error handling |

---

## Further Reading

- Temporal documentation: concepts of durable execution and event sourcing
- "Designing Data-Intensive Applications" by Martin Kleppmann — Chapter 9 (Consistency)
- AWS Step Functions developer guide — state machine patterns
- Apache Airflow best practices — DAG design and testing
- "Saga Pattern" by Chris Richardson — microservices.io
