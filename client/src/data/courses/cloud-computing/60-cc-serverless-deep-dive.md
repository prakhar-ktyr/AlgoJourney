---
title: "Serverless Deep Dive"
---

# Serverless Deep Dive

In this lesson, you will go beyond the basics of serverless computing. You will explore advanced patterns, event sources, orchestration, observability, security, cost optimization, and build a complete serverless REST API from scratch.

---

## Advanced Serverless Concepts

Serverless computing removes the need to manage servers, but building production-grade serverless applications requires understanding advanced patterns and trade-offs.

### Serverless Execution Model

```
Event Source ──► Cloud Provider ──► Function Instance ──► Response
                    │
                    ├── Provisions container (if needed)
                    ├── Loads function code
                    ├── Invokes handler
                    └── Scales to zero when idle
```

### Key Properties

| Property | Detail |
|---|---|
| **Trigger** | Functions execute in response to events |
| **Scaling** | Automatic, from zero to thousands of instances |
| **Billing** | Pay per invocation + execution duration |
| **Stateless** | No local state between invocations |
| **Ephemeral** | Container may be reused or destroyed at any time |
| **Time-limited** | Max execution time (e.g., 15 min for AWS Lambda) |
| **Memory-bound** | CPU scales proportionally with memory allocation |

---

## Event Sources

Serverless functions are triggered by **events**. Understanding event sources is critical for designing serverless architectures.

### API Gateway

The most common trigger — maps HTTP requests to Lambda functions.

```
Client ──► API Gateway ──► Lambda ──► DynamoDB
                │
                ├── Routes (GET /users, POST /orders)
                ├── Request validation
                ├── Authentication (Cognito, API keys)
                ├── Rate limiting & throttling
                └── Response transformation
```

```javascript
// Lambda handler for API Gateway event
export const handler = async (event) => {
  const method = event.httpMethod;
  const path = event.path;
  const body = JSON.parse(event.body || "{}");
  const userId = event.pathParameters?.id;

  if (method === "GET" && path === "/users") {
    const users = await getAllUsers();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(users),
    };
  }

  return { statusCode: 404, body: "Not Found" };
};
```

### S3 Events

Trigger functions when objects are created, modified, or deleted in S3.

```
User uploads image ──► S3 Bucket ──► Lambda ──► Generate thumbnail
                                               ──► Store in S3
                                               ──► Update database
```

```javascript
// Lambda triggered by S3 object creation
export const handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key);
    const size = record.s3.object.size;

    console.log(`New object: s3://${bucket}/${key} (${size} bytes)`);

    // Process the uploaded file
    await generateThumbnail(bucket, key);
  }
};
```

### SQS (Simple Queue Service)

Process messages from a queue — ideal for decoupling and buffering.

```
Producer ──► SQS Queue ──► Lambda (batch of messages)
                │
                ├── Automatic retry on failure
                ├── Dead letter queue for poison messages
                └── Batch size configurable (1-10,000)
```

```javascript
// Lambda processing SQS messages
export const handler = async (event) => {
  const failedIds = [];

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      await processOrder(message);
    } catch (err) {
      console.error(`Failed: ${record.messageId}`, err);
      failedIds.push(record.messageId);
    }
  }

  // Partial batch failure reporting
  return {
    batchItemFailures: failedIds.map((id) => ({
      itemIdentifier: id,
    })),
  };
};
```

### SNS (Simple Notification Service)

Fan-out pattern — one event triggers multiple subscribers.

```
Order Created ──► SNS Topic ──► Lambda (send email)
                             ──► Lambda (update analytics)
                             ──► SQS Queue (inventory)
```

```javascript
// Lambda triggered by SNS notification
export const handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.Sns.Message);
    const subject = record.Sns.Subject;

    console.log(`SNS: ${subject}`, message);
    await sendEmailNotification(message);
  }
};
```

### EventBridge

Advanced event bus for routing events based on rules and patterns.

```
Source ──► EventBridge Bus ──► Rule (pattern match) ──► Target (Lambda)
                           ──► Rule (pattern match) ──► Target (SQS)
                           ──► Rule (schedule)      ──► Target (Lambda)
```

```json
// EventBridge rule pattern — match order events over $100
{
  "source": ["com.myapp.orders"],
  "detail-type": ["OrderCreated"],
  "detail": {
    "amount": [{ "numeric": [">", 100] }]
  }
}
```

### Kinesis Data Streams

Real-time streaming data processing.

```
IoT devices ──► Kinesis Stream ──► Lambda (per shard)
Web clicks  ──►                     │
Logs        ──►                     ├── Process records in order
                                    ├── Checkpointing (at-least-once)
                                    └── Parallelization factor (1-10)
```

```javascript
// Lambda processing Kinesis records
export const handler = async (event) => {
  for (const record of event.Records) {
    const payload = Buffer.from(record.kinesis.data, "base64").toString();
    const data = JSON.parse(payload);

    console.log(`Shard: ${record.eventID}`, data);
    await ingestMetric(data);
  }
};
```

### DynamoDB Streams

React to changes in a DynamoDB table.

```
DynamoDB Table ──► Stream ──► Lambda
                                │
                                ├── INSERT: new item added
                                ├── MODIFY: item updated
                                └── REMOVE: item deleted
```

```javascript
// Lambda processing DynamoDB Stream events
export const handler = async (event) => {
  for (const record of event.Records) {
    const eventName = record.eventName; // INSERT, MODIFY, REMOVE

    if (eventName === "INSERT") {
      const newItem = record.dynamodb.NewImage;
      await indexInElasticsearch(newItem);
    } else if (eventName === "REMOVE") {
      const oldItem = record.dynamodb.OldImage;
      await removeFromIndex(oldItem);
    }
  }
};
```

### Scheduled Events (Cron)

Run functions on a schedule using EventBridge Scheduler or CloudWatch Events.

```javascript
// Runs every day at 8:00 AM UTC
// Schedule expression: cron(0 8 * * ? *)

export const handler = async () => {
  console.log("Running daily report generation...");
  const report = await generateDailyReport();
  await sendReportEmail(report);
  return { status: "complete" };
};
```

### Event Source Summary

| Event Source | Use Case | Invocation | Concurrency |
|---|---|---|---|
| **API Gateway** | REST/HTTP APIs | Synchronous | Per request |
| **S3** | File processing | Async | Per event |
| **SQS** | Queue processing | Polling | Per batch |
| **SNS** | Fan-out notifications | Async | Per message |
| **EventBridge** | Event routing | Async | Per event |
| **Kinesis** | Stream processing | Polling | Per shard |
| **DynamoDB Streams** | Change data capture | Polling | Per shard |
| **Schedule** | Cron jobs | Async | Single |

---

## Step Functions and Orchestration

**AWS Step Functions** orchestrate multiple Lambda functions into workflows using a state machine.

### Why Orchestration?

- Coordinate multi-step processes (order → payment → shipping)
- Handle retries, error handling, and timeouts declaratively
- Visualize workflow execution
- Support long-running processes (up to 1 year)

### State Types

| State Type | Purpose |
|---|---|
| **Task** | Execute a Lambda function or API call |
| **Choice** | Branch based on conditions |
| **Parallel** | Run branches concurrently |
| **Map** | Iterate over a collection |
| **Wait** | Pause for a duration |
| **Pass** | Transform data |
| **Succeed / Fail** | Terminal states |

### Example: Order Processing Workflow

```json
{
  "Comment": "Order Processing Workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:validate",
      "Next": "ProcessPayment",
      "Catch": [{
        "ErrorEquals": ["ValidationError"],
        "Next": "OrderFailed"
      }]
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:payment",
      "Retry": [{
        "ErrorEquals": ["PaymentTimeout"],
        "MaxAttempts": 3,
        "IntervalSeconds": 2,
        "BackoffRate": 2.0
      }],
      "Next": "ShipOrder"
    },
    "ShipOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:ship",
      "Next": "OrderComplete"
    },
    "OrderComplete": { "Type": "Succeed" },
    "OrderFailed": { "Type": "Fail", "Error": "OrderFailed" }
  }
}
```

```
Visual Flow:

  ValidateOrder ──► ProcessPayment ──► ShipOrder ──► ✅ OrderComplete
       │                  │
       ▼ (error)          ▼ (retry 3x)
  ❌ OrderFailed       ProcessPayment (retry)
```

---

## Serverless Application Patterns

### 1. API Backend

```
Client ──► API Gateway ──► Lambda ──► DynamoDB
                                   ──► S3
```

Best for: CRUD APIs, mobile backends, microservices.

### 2. Event Processing Pipeline

```
S3 Upload ──► Lambda (validate) ──► SQS ──► Lambda (process) ──► DynamoDB
```

Best for: file processing, image/video pipelines, data ingestion.

### 3. ETL (Extract, Transform, Load)

```
Schedule ──► Lambda (extract from API)
          ──► Lambda (transform data)
          ──► Lambda (load to data warehouse)
```

Use Step Functions to orchestrate the stages.

### 4. Real-Time Streaming

```
Kinesis ──► Lambda ──► OpenSearch (analytics)
                    ──► S3 (archive)
                    ──► CloudWatch (alerts)
```

Best for: IoT data, clickstream analytics, log processing.

### 5. Scheduled Jobs

```
EventBridge Schedule ──► Lambda (generate reports)
                      ──► Lambda (clean up old data)
                      ──► Lambda (send reminders)
```

Best for: cron jobs, periodic maintenance, batch processing.

### 6. Webhooks

```
External Service ──► API Gateway ──► Lambda (validate & process)
(Stripe, GitHub)                        │
                                        ├── Verify signature
                                        ├── Process event
                                        └── Store / trigger action
```

```javascript
// Webhook handler with signature verification
import crypto from "node:crypto";

export const handler = async (event) => {
  const signature = event.headers["x-webhook-signature"];
  const body = event.body;

  // Verify webhook signature
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return { statusCode: 401, body: "Invalid signature" };
  }

  const payload = JSON.parse(body);
  await processWebhookEvent(payload);

  return { statusCode: 200, body: "OK" };
};
```

---

## Cold Start Optimization

A **cold start** occurs when a new execution environment must be created for a function that hasn't been invoked recently.

### Cold Start Timeline

```
Cold Start:
  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Download │  │ Start    │  │ Init     │  │ Invoke   │
  │ code     │  │ runtime  │  │ handler  │  │ handler  │
  └──────────┘  └──────────┘  └──────────┘  └──────────┘
  ◄──── cold start overhead ──────────────►  ◄── actual ─►

Warm Start:
  ┌──────────┐
  │ Invoke   │  (container reused)
  │ handler  │
  └──────────┘
```

### Cold Start Duration by Runtime

| Runtime | Typical Cold Start |
|---|---|
| Python | 200–500 ms |
| Node.js | 200–500 ms |
| Go | 50–100 ms |
| Java | 1–5 seconds |
| .NET | 500 ms–2 seconds |
| Rust (custom runtime) | 10–50 ms |

### Optimization Strategies

#### 1. Provisioned Concurrency

Pre-warm a set number of execution environments — eliminates cold starts entirely.

```yaml
# SAM template — provisioned concurrency
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: index.handler
      Runtime: nodejs20.x
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrentExecutions: 5
```

**Trade-off:** You pay for provisioned environments even when idle.

#### 2. SnapStart (Java)

AWS Lambda SnapStart takes a snapshot of the initialized execution environment and restores it for subsequent invocations.

```yaml
# SAM template — SnapStart for Java
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Runtime: java21
      SnapStart:
        ApplyOn: PublishedVersions
```

Reduces Java cold starts from seconds to ~200 ms.

#### 3. Code Optimization

```javascript
// BAD: import everything (increases cold start)
import AWS from "aws-sdk";
const dynamodb = new AWS.DynamoDB.DocumentClient();

// GOOD: import only what you need (tree-shakeable)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialize outside the handler (reused across warm invocations)
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  // Handler code — uses pre-initialized client
  const result = await docClient.send(new GetCommand({
    TableName: "users",
    Key: { id: event.pathParameters.id },
  }));
  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
```

#### 4. Reduce Package Size

```bash
# Check function package size
du -sh my-function.zip

# Use esbuild to bundle and tree-shake
npx esbuild src/handler.js --bundle --platform=node \
  --target=node20 --outfile=dist/handler.js --minify

# Use Lambda layers for shared dependencies
```

| Technique | Impact |
|---|---|
| Provisioned concurrency | Eliminates cold starts ($$) |
| SnapStart (Java) | Reduces from seconds to ~200 ms |
| Smaller bundle | Faster code download |
| Lazy imports | Defer unused module loading |
| Init outside handler | Reuse connections across invocations |
| Choose lightweight runtime | Go, Rust, Node.js over Java |

---

## Serverless Observability

Observability in serverless is challenging because you don't control the infrastructure.

### The Three Pillars

```
Observability
├── Logs      → What happened (CloudWatch Logs, structured JSON)
├── Metrics   → How much/how fast (CloudWatch Metrics, custom metrics)
└── Traces    → Request flow across services (X-Ray, OpenTelemetry)
```

### Structured Logging

```javascript
import { Logger } from "@aws-lambda-powertools/logger";

const logger = new Logger({ serviceName: "order-service" });

export const handler = async (event) => {
  logger.info("Processing order", {
    orderId: event.orderId,
    userId: event.userId,
    amount: event.amount,
  });

  try {
    const result = await processOrder(event);
    logger.info("Order processed successfully", { orderId: event.orderId });
    return result;
  } catch (err) {
    logger.error("Order processing failed", {
      orderId: event.orderId,
      error: err.message,
    });
    throw err;
  }
};
```

### Custom Metrics

```javascript
import { Metrics, MetricUnit } from "@aws-lambda-powertools/metrics";

const metrics = new Metrics({ namespace: "OrderService" });

export const handler = async (event) => {
  metrics.addMetric("OrdersProcessed", MetricUnit.Count, 1);
  metrics.addMetric("OrderAmount", MetricUnit.Count, event.amount);
  metrics.addDimension("Environment", process.env.STAGE);

  // ... process order ...

  metrics.publishStoredMetrics();
};
```

### Distributed Tracing

```javascript
import { Tracer } from "@aws-lambda-powertools/tracer";

const tracer = new Tracer({ serviceName: "order-service" });

export const handler = async (event) => {
  const segment = tracer.getSegment();
  const subsegment = segment.addNewSubsegment("processOrder");

  try {
    const result = await processOrder(event);
    subsegment.close();
    return result;
  } catch (err) {
    subsegment.addError(err);
    subsegment.close();
    throw err;
  }
};
```

---

## Serverless Security

### Principle of Least Privilege

Each function should have **only** the permissions it needs.

```yaml
# BAD: overly permissive
Policies:
  - AmazonDynamoDBFullAccess   # Can delete tables!

# GOOD: minimal permissions
Policies:
  - Version: "2012-10-17"
    Statement:
      - Effect: Allow
        Action:
          - dynamodb:GetItem
          - dynamodb:PutItem
        Resource: !GetAtt OrdersTable.Arn
```

### VPC Configuration

Place functions in a VPC to access private resources (RDS, ElastiCache).

```yaml
VpcConfig:
  SecurityGroupIds:
    - !Ref LambdaSecurityGroup
  SubnetIds:
    - !Ref PrivateSubnet1
    - !Ref PrivateSubnet2
```

> **Note:** VPC-attached Lambdas need a NAT Gateway to access the internet. This adds cost and cold start latency.

### Secrets Management

```javascript
// Use AWS Secrets Manager or SSM Parameter Store
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({});

// Cache secret outside handler (reused in warm invocations)
let cachedSecret;

async function getSecret() {
  if (!cachedSecret) {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: "my-app/db-credentials" })
    );
    cachedSecret = JSON.parse(response.SecretString);
  }
  return cachedSecret;
}

export const handler = async (event) => {
  const { username, password } = await getSecret();
  // Use credentials...
};
```

### Security Checklist

```
✅ Least-privilege IAM roles per function
✅ Input validation on all event data
✅ Secrets in Secrets Manager / SSM, NOT env vars
✅ API Gateway authentication (Cognito, API keys, JWT)
✅ VPC for private resource access
✅ WAF on API Gateway for common attacks
✅ Enable CloudTrail for audit logging
✅ Dependency scanning (npm audit, Snyk)
✅ Function URL auth type set to AWS_IAM (not NONE)
✅ Reserved concurrency to prevent runaway scaling
```

---

## Cost Optimization

### Understanding Serverless Pricing

```
Lambda Cost = (Number of Requests × $0.20 per 1M)
            + (GB-seconds × $0.0000166667)

Example:
  1M requests/month × 256 MB × 200 ms average
  = $0.20 (requests)
  + 1,000,000 × 0.25 GB × 0.2 sec × $0.0000166667
  = $0.20 + $0.83
  = $1.03/month
```

### Optimization Strategies

| Strategy | How | Savings |
|---|---|---|
| **Right-size memory** | Profile and find optimal memory/CPU ratio | 10-50% |
| **Reduce duration** | Optimize code, use connection pooling | 20-60% |
| **Batch processing** | Process multiple records per invocation | 30-70% |
| **Avoid over-provisioning** | Use auto-scaling, not provisioned concurrency everywhere | 50%+ |
| **Use ARM (Graviton)** | Switch to arm64 architecture | 20% cheaper, 34% faster |
| **Reserved concurrency** | Prevent runaway scaling | Avoid surprise bills |

```yaml
# Use Graviton (ARM) for 20% cost reduction
Resources:
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Architectures:
        - arm64    # 20% cheaper than x86_64
      MemorySize: 256
      Timeout: 30
```

### Power Tuning

Use the **AWS Lambda Power Tuning** tool to find the optimal memory setting:

```
Memory (MB)  | Duration (ms) | Cost ($)
128          | 800           | $0.001334
256          | 420           | $0.001401
512          | 215           | $0.001434
1024         | 112           | $0.001493    ◄── fastest
1769 (1vCPU) | 110           | $0.002534
                                 ▲ diminishing returns
```

---

## Serverless Testing Strategies

### Testing Pyramid for Serverless

```
         ┌──────┐
         │ E2E  │   ← Fewest (real AWS, slow, expensive)
        ┌┴──────┴┐
        │ Integ  │  ← Some (LocalStack, SAM local)
       ┌┴────────┴┐
       │   Unit   │ ← Most (fast, mock AWS SDK)
       └──────────┘
```

### Unit Tests

Test business logic in isolation — mock AWS SDK calls.

```javascript
// order-service.js
export async function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// order-service.test.js
import { describe, it, expect } from "vitest";
import { calculateTotal } from "./order-service.js";

describe("calculateTotal", () => {
  it("sums item prices × quantities", () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ];
    expect(calculateTotal(items)).toBe(35);
  });

  it("returns 0 for empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### Integration Tests with LocalStack

```javascript
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  endpoint: "http://localhost:4566", // LocalStack
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});

// Test against local DynamoDB
```

### Testing with SAM Local

```bash
# Invoke function locally
sam local invoke MyFunction -e events/api-event.json

# Start local API Gateway
sam local start-api

# Test with curl
curl http://localhost:3000/users
```

---

## Serverless Frameworks Comparison

| Feature | SAM | CDK | Serverless Framework |
|---|---|---|---|
| **Language** | YAML/JSON | TypeScript, Python, Java | YAML + plugins |
| **Provider** | AWS only | AWS (primary), multi-cloud | Multi-cloud |
| **Abstraction** | Low (CloudFormation) | High (programming language) | Medium |
| **Local testing** | `sam local` | Limited | `sls offline` |
| **Community** | AWS official | AWS official | Large open-source |
| **Learning curve** | Medium | Higher | Lower |
| **Best for** | Simple AWS serverless | Complex infra + code | Quick multi-cloud |

### SAM Template Example

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 30
    MemorySize: 256
    Architectures: [arm64]

Resources:
  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/getUsers.handler
      Events:
        Api:
          Type: Api
          Properties:
            Path: /users
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref UsersTable

  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: users
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
```

### CDK Example

```typescript
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class ApiStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "UsersTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const fn = new lambda.Function(this, "GetUsers", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "getUsers.handler",
      code: lambda.Code.fromAsset("src/handlers"),
      architecture: lambda.Architecture.ARM_64,
      environment: { TABLE_NAME: table.tableName },
    });

    table.grantReadData(fn);

    new apigateway.LambdaRestApi(this, "Api", { handler: fn });
  }
}
```

---

## Full Practical: Building a Serverless REST API

Let's build a complete serverless CRUD API for managing tasks.

### Project Structure

```
serverless-tasks-api/
├── template.yaml          # SAM template
├── src/
│   └── handlers/
│       ├── createTask.js
│       ├── getTask.js
│       ├── listTasks.js
│       ├── updateTask.js
│       └── deleteTask.js
├── events/
│   └── create-task.json   # Test event
└── tests/
    └── handlers/
        └── createTask.test.js
```

### SAM Template

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: Serverless Tasks API

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 10
    MemorySize: 256
    Architectures: [arm64]
    Environment:
      Variables:
        TABLE_NAME: !Ref TasksTable

Resources:
  # --- API ---
  TasksApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod

  # --- Functions ---
  CreateTaskFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/createTask.handler
      Events:
        Api:
          Type: Api
          Properties:
            RestApiId: !Ref TasksApi
            Path: /tasks
            Method: POST
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TasksTable

  GetTaskFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/getTask.handler
      Events:
        Api:
          Type: Api
          Properties:
            RestApiId: !Ref TasksApi
            Path: /tasks/{id}
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TasksTable

  ListTasksFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/listTasks.handler
      Events:
        Api:
          Type: Api
          Properties:
            RestApiId: !Ref TasksApi
            Path: /tasks
            Method: GET
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref TasksTable

  UpdateTaskFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/updateTask.handler
      Events:
        Api:
          Type: Api
          Properties:
            RestApiId: !Ref TasksApi
            Path: /tasks/{id}
            Method: PUT
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TasksTable

  DeleteTaskFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/deleteTask.handler
      Events:
        Api:
          Type: Api
          Properties:
            RestApiId: !Ref TasksApi
            Path: /tasks/{id}
            Method: DELETE
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref TasksTable

  # --- Database ---
  TasksTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: tasks
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST

Outputs:
  ApiUrl:
    Value: !Sub "https://${TasksApi}.execute-api.${AWS::Region}.amazonaws.com/prod"
```

### Create Task Handler

```javascript
// src/handlers/createTask.js
import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.title) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Title is required" }),
      };
    }

    const task = {
      id: randomUUID(),
      title: body.title,
      description: body.description || "",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: task,
    }));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    };
  } catch (err) {
    console.error("Create task failed:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
```

### Get Task Handler

```javascript
// src/handlers/getTask.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { id } = event.pathParameters;

  const result = await docClient.send(new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: { id },
  }));

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Task not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Item),
  };
};
```

### Deploy and Test

```bash
# Build the project
sam build

# Deploy to AWS (guided — prompts for config)
sam deploy --guided

# Test locally
sam local start-api
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn serverless", "description": "Deep dive"}'

# Test deployed API
curl https://abc123.execute-api.us-east-1.amazonaws.com/prod/tasks
```

---

## Exercises

1. **Event Source Mapping:** Create a Lambda function triggered by an SQS queue. Send messages to the queue and verify the function processes them. Implement partial batch failure reporting.

2. **Step Functions Workflow:** Design a Step Functions state machine for a user registration flow: validate email → create user → send welcome email → update analytics. Include error handling and retries.

3. **Cold Start Measurement:** Write a Lambda function that logs the time difference between module load and handler invocation. Deploy with 128 MB, 512 MB, and 1024 MB memory and compare cold start times.

4. **Serverless Security Audit:** Review an existing serverless application's IAM roles. Identify overly permissive policies and rewrite them with least-privilege permissions.

5. **Cost Estimation:** Calculate the monthly cost for a serverless API that handles 5 million requests/month, each with 256 MB memory and 150 ms average duration. Compare with a t3.medium EC2 instance running 24/7.

6. **Build the Full API:** Extend the Tasks API practical by adding: authentication (Cognito), pagination on list endpoint, and a DynamoDB Stream that triggers a Lambda to send notifications when tasks are completed.

---

## Key Takeaways

- Serverless functions are triggered by **event sources**: API Gateway, S3, SQS, SNS, EventBridge, Kinesis, DynamoDB Streams, and schedules.
- **Step Functions** orchestrate multi-step workflows with built-in retry, error handling, and visualization.
- Common serverless patterns include API backends, event processing pipelines, ETL, real-time streaming, scheduled jobs, and webhooks.
- **Cold starts** can be mitigated with provisioned concurrency, SnapStart, smaller bundles, and lightweight runtimes.
- Serverless **observability** requires structured logging, custom metrics, and distributed tracing (AWS Lambda Powertools helps).
- Apply **least-privilege IAM**, manage secrets properly, validate inputs, and use VPCs for private resources.
- **Cost optimization** includes right-sizing memory, using ARM/Graviton, batching, and power tuning.
- Test serverless apps with a **pyramid**: many unit tests, some integration tests (LocalStack), few E2E tests.
- Choose your **framework** (SAM, CDK, Serverless Framework) based on complexity, team skills, and multi-cloud needs.

---
