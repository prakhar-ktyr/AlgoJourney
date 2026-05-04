---
title: "Serverless Computing"
---

## What Is Serverless Computing?

**Serverless computing** is a cloud execution model where the cloud provider dynamically manages the allocation of server resources. Despite the name, servers are still involved — you just **never see, manage, or think about them**.

With serverless, you write **functions** (small pieces of code) that run in response to **events**. The cloud provider handles everything else: provisioning, scaling, patching, and even shutting down when there's no traffic.

### Serverless in One Sentence

> Write a function, deploy it, and **pay only when it runs** — the cloud handles everything else.

### Traditional Server vs Serverless

| Aspect | Traditional Server | Serverless |
|---|---|---|
| Server management | You manage | Provider manages |
| Scaling | Manual or auto-scaling rules | Automatic, instant |
| Billing | Pay for uptime (24/7) | Pay per invocation |
| Idle cost | Pay even when idle | **$0 when idle** |
| Deployment unit | Application | Individual functions |
| State | Stateful | Stateless |

---

## How Serverless Works

### The Function as a Service (FaaS) Model

Serverless computing is most commonly implemented as **Function as a Service (FaaS)**. Here's how it works:

```
┌──────────┐     ┌───────────┐     ┌──────────────┐     ┌──────────┐
│  Event   │────▶│  Trigger  │────▶│  Function    │────▶│  Output  │
│ (Source)  │     │           │     │  (Your Code) │     │          │
└──────────┘     └───────────┘     └──────────────┘     └──────────┘

Events:                              Provider handles:
• HTTP request                       • Server provisioning
• File upload                        • Scaling (0 to thousands)
• Database change                    • OS & runtime patches
• Timer/schedule                     • Load balancing
• Message queue                      • Monitoring
• IoT sensor data                    • Shutting down when idle
```

### The Execution Lifecycle

1. An **event** occurs (HTTP request, file upload, timer, etc.)
2. The cloud provider **receives the event** and identifies the target function
3. The provider **provisions a container** (or reuses a warm one)
4. Your **function code executes** within that container
5. The function **returns a response** or writes output
6. The container is **frozen** (kept warm for reuse) or **destroyed**
7. You are **billed** for the execution time (in milliseconds)

### Cold Starts vs Warm Starts

| Start Type | Description | Latency | When It Happens |
|---|---|---|---|
| **Cold start** | New container must be provisioned | 100ms – 10s | First invocation or after idle period |
| **Warm start** | Reuses an existing container | 1-10ms | Subsequent calls within a short time |

**Cold start factors:**

- **Runtime language** — Go and Rust are fastest; Java and .NET are slowest
- **Package size** — larger deployments take longer to load
- **Memory allocation** — more memory = faster CPU (proportional)
- **VPC configuration** — connecting to VPC adds network setup time
- **Initialization code** — database connections, SDK setup

```
Cold start latency by runtime (approximate):
  Python:     100-300ms
  Node.js:    100-300ms
  Go:         50-100ms
  Rust:       50-100ms
  Java:       500ms-5s
  .NET:       300ms-3s
```

---

## Key Serverless Services

### AWS Lambda

The most widely used serverless platform, launched in 2014.

| Feature | Details |
|---|---|
| **Supported runtimes** | Node.js, Python, Java, Go, .NET, Ruby, Rust (custom) |
| **Max execution time** | 15 minutes |
| **Max memory** | 10,240 MB |
| **Max package size** | 50 MB (zipped), 250 MB (unzipped) |
| **Concurrency** | 1,000 default (can increase) |
| **Free tier** | 1 million requests + 400,000 GB-seconds/month |
| **Pricing** | $0.20 per 1M requests + $0.0000166667 per GB-second |

### Azure Functions

Microsoft's serverless offering with tight Azure ecosystem integration.

| Feature | Details |
|---|---|
| **Supported runtimes** | C#, JavaScript, Python, Java, PowerShell, TypeScript |
| **Max execution time** | 5-60 minutes (plan-dependent) |
| **Hosting plans** | Consumption (serverless), Premium, Dedicated |
| **Durable Functions** | Stateful workflows built on serverless |
| **Free tier** | 1 million requests + 400,000 GB-seconds/month |
| **Strength** | Enterprise integration, Durable Functions |

### Google Cloud Functions

Google Cloud's event-driven serverless platform.

| Feature | Details |
|---|---|
| **Supported runtimes** | Node.js, Python, Go, Java, .NET, Ruby, PHP |
| **Max execution time** | 9 minutes (1st gen), 60 minutes (2nd gen) |
| **Generations** | 1st gen (simple), 2nd gen (Cloud Run-based) |
| **Free tier** | 2 million invocations/month |
| **Strength** | GCP integration, 2nd gen flexibility |

### Comparison Table

| Feature | AWS Lambda | Azure Functions | Google Cloud Functions |
|---|---|---|---|
| Max timeout | 15 min | 5-60 min | 9-60 min |
| Languages | 7+ | 6+ | 7+ |
| Free tier (requests) | 1M/month | 1M/month | 2M/month |
| Cold start | ~100-500ms | ~200-500ms | ~100-500ms |
| Container support | Yes (images) | Yes | Yes (2nd gen) |
| Edge deployment | Lambda@Edge | N/A | N/A |

---

## Serverless Triggers and Events

Functions are **event-driven** — they execute in response to specific triggers.

### Common Trigger Types

| Trigger | Description | Example Use Case |
|---|---|---|
| **HTTP** | API Gateway request | REST API endpoint |
| **Schedule** | Cron/timer expression | Nightly data cleanup |
| **Storage** | File uploaded to bucket | Image thumbnail generation |
| **Database** | Record changed in DB | Sync data to search index |
| **Queue** | Message added to queue | Process orders |
| **Stream** | Event from event stream | Real-time analytics |
| **Authentication** | User sign-up/sign-in | Welcome email, data validation |
| **IoT** | Sensor data received | Temperature alert |

### Trigger Configuration Examples

**HTTP Trigger (AWS Lambda + API Gateway):**

```yaml
# serverless.yml
functions:
  getUsers:
    handler: src/handlers/users.getAll
    events:
      - httpApi:
          path: /users
          method: GET

  createUser:
    handler: src/handlers/users.create
    events:
      - httpApi:
          path: /users
          method: POST
```

**Schedule Trigger:**

```yaml
functions:
  dailyCleanup:
    handler: src/handlers/cleanup.run
    events:
      - schedule:
          rate: cron(0 2 * * ? *)  # Every day at 2 AM UTC
          enabled: true
```

**S3 Trigger (File Upload):**

```yaml
functions:
  processImage:
    handler: src/handlers/images.process
    events:
      - s3:
          bucket: my-uploads-bucket
          event: s3:ObjectCreated:*
          rules:
            - suffix: .jpg
            - suffix: .png
```

---

## Example: Building a Serverless API

Let's build a complete serverless REST API for managing a to-do list.

### Project Structure

```
todo-api/
├── serverless.yml        # Infrastructure configuration
├── package.json
├── src/
│   ├── handlers/
│   │   ├── create.js     # POST /todos
│   │   ├── list.js       # GET /todos
│   │   ├── get.js        # GET /todos/{id}
│   │   ├── update.js     # PUT /todos/{id}
│   │   └── delete.js     # DELETE /todos/{id}
│   └── utils/
│       └── db.js         # DynamoDB helper
└── tests/
    └── handlers/
        └── create.test.js
```

### Step 1: Configuration

```yaml
# serverless.yml
service: todo-api
frameworkVersion: "3"

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    TODOS_TABLE: ${self:service}-${sls:stage}-todos
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:Scan
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - !GetAtt TodosTable.Arn

functions:
  createTodo:
    handler: src/handlers/create.handler
    events:
      - httpApi:
          path: /todos
          method: POST

  listTodos:
    handler: src/handlers/list.handler
    events:
      - httpApi:
          path: /todos
          method: GET

  getTodo:
    handler: src/handlers/get.handler
    events:
      - httpApi:
          path: /todos/{id}
          method: GET

  updateTodo:
    handler: src/handlers/update.handler
    events:
      - httpApi:
          path: /todos/{id}
          method: PUT

  deleteTodo:
    handler: src/handlers/delete.handler
    events:
      - httpApi:
          path: /todos/{id}
          method: DELETE

resources:
  Resources:
    TodosTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.TODOS_TABLE}
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
```

### Step 2: Handler Code

```javascript
// src/handlers/create.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (!body.title) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Title is required" }),
      };
    }

    const todo = {
      id: randomUUID(),
      title: body.title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.TODOS_TABLE,
        Item: todo,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify(todo),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not create todo" }),
    };
  }
};
```

```javascript
// src/handlers/list.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

module.exports.handler = async () => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: process.env.TODOS_TABLE,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not list todos" }),
    };
  }
};
```

### Step 3: Deploy

```bash
# Install the Serverless Framework
npm install -g serverless

# Deploy to AWS
serverless deploy

# Output:
# endpoints:
#   POST   - https://abc123.execute-api.us-east-1.amazonaws.com/todos
#   GET    - https://abc123.execute-api.us-east-1.amazonaws.com/todos
#   GET    - https://abc123.execute-api.us-east-1.amazonaws.com/todos/{id}
#   PUT    - https://abc123.execute-api.us-east-1.amazonaws.com/todos/{id}
#   DELETE - https://abc123.execute-api.us-east-1.amazonaws.com/todos/{id}
```

### Step 4: Test Your API

```bash
# Create a todo
curl -X POST https://abc123.execute-api.us-east-1.amazonaws.com/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn serverless computing"}'

# List all todos
curl https://abc123.execute-api.us-east-1.amazonaws.com/todos

# Get a specific todo
curl https://abc123.execute-api.us-east-1.amazonaws.com/todos/uuid-here

# Delete a todo
curl -X DELETE https://abc123.execute-api.us-east-1.amazonaws.com/todos/uuid-here
```

---

## Serverless Pricing

Serverless pricing is based on **actual usage**, not provisioned capacity.

### AWS Lambda Pricing Breakdown

| Component | Cost |
|---|---|
| **Requests** | $0.20 per 1 million requests |
| **Duration** | $0.0000166667 per GB-second |
| **Free tier** | 1M requests + 400,000 GB-seconds/month (always free) |

### Cost Calculation Example

```
Scenario: A serverless API handling 10 million requests/month
  - Average execution time: 200ms
  - Memory allocated: 256 MB (0.25 GB)

Request costs:
  10,000,000 requests × $0.20/million = $2.00

Duration costs:
  GB-seconds = 10,000,000 × 0.2s × 0.25 GB = 500,000 GB-seconds
  Cost = 500,000 × $0.0000166667 = $8.33

Total monthly cost: $2.00 + $8.33 = $10.33

Compare to an EC2 instance:
  t3.medium running 24/7: ~$30.37/month
  (Paying even when handling zero requests)
```

### When Serverless Saves Money

```
Break-even analysis (approximate):

Serverless is CHEAPER when:
  - Traffic is sporadic or unpredictable
  - Many periods of zero or low traffic
  - Workloads are short-lived (< 15 minutes)
  - You need to scale to zero during off-hours

Traditional servers are CHEAPER when:
  - Consistent, high-volume traffic (24/7)
  - Long-running processes
  - Sustained compute at > 60-70% utilization
  - Predictable, steady workloads
```

---

## Serverless Use Cases

### 1. API Backends

The most common use case. Build REST or GraphQL APIs without managing servers.

### 2. Data Processing Pipelines

```
S3 Upload ──▶ Lambda ──▶ Transform Data ──▶ Write to Database
                │
                ▼
          Trigger another Lambda
                │
                ▼
          Send notification
```

### 3. Chatbots and Virtual Assistants

- Respond to messages on Slack, Discord, Teams
- Process natural language with AI services
- Scale to handle thousands of concurrent conversations

### 4. Scheduled Tasks (Cron Jobs)

```yaml
# Run every hour
functions:
  hourlyReport:
    handler: reports.generate
    events:
      - schedule: rate(1 hour)

  # Run at 8 AM every Monday
  weeklyDigest:
    handler: digest.send
    events:
      - schedule: cron(0 8 ? * MON *)
```

### 5. Real-Time File Processing

- Image resizing and thumbnail generation
- Video transcoding
- PDF generation
- Log file analysis

### 6. IoT Data Ingestion

- Process sensor data in real-time
- Trigger alerts based on thresholds
- Aggregate data for dashboards

### 7. Webhooks

- Receive webhooks from third-party services
- Process Stripe payment events
- Handle GitHub webhook events

---

## Serverless vs Containers

| Feature | Serverless (FaaS) | Containers (Docker/K8s) |
|---|---|---|
| **Unit of deployment** | Function | Container image |
| **Scaling** | Automatic (0 to thousands) | Manual or HPA |
| **Scale to zero** | Yes | Difficult (needs KEDA) |
| **Cold starts** | Yes (100ms-10s) | No (always running) |
| **Max execution time** | 15 min (Lambda) | Unlimited |
| **State** | Stateless | Can be stateful |
| **Pricing** | Per invocation | Per container hour |
| **Vendor lock-in** | High | Low |
| **Networking** | Limited | Full control |
| **Local development** | More complex | Docker mirrors production |
| **Debugging** | Harder (remote) | Easier (local containers) |
| **Use case** | Event-driven, APIs, microservices | Long-running, complex apps |

### Decision Guide

**Choose Serverless when:**
- Your workload is event-driven
- You need to scale to zero (pay nothing when idle)
- Functions complete in under 15 minutes
- You want zero infrastructure management
- Traffic is unpredictable or bursty

**Choose Containers when:**
- You need long-running processes
- You want consistent performance (no cold starts)
- You need full control over the runtime environment
- You want portability across cloud providers
- Your application is stateful

---

## Serverless Limitations

### 1. Execution Timeout

| Provider | Max Timeout |
|---|---|
| AWS Lambda | 15 minutes |
| Azure Functions | 5-60 minutes |
| Google Cloud Functions | 9-60 minutes |

Functions that exceed the timeout are **forcefully terminated**.

### 2. Cold Starts

First invocation after an idle period incurs extra latency. Mitigations:

```yaml
# Provisioned concurrency (AWS Lambda)
# Keeps N instances warm — eliminates cold starts
functions:
  api:
    handler: src/api.handler
    provisionedConcurrency: 5  # Always keep 5 warm instances
```

### 3. Statelessness

Functions are **stateless** — they don't retain data between invocations. You must use external storage:

- **Databases** (DynamoDB, PostgreSQL, Redis)
- **Object storage** (S3, GCS)
- **Caches** (ElastiCache, Memorystore)

### 4. Vendor Lock-In

Each provider has unique APIs, triggers, and configurations. Moving between providers requires significant refactoring.

### 5. Limited Resources

| Resource | AWS Lambda Limit |
|---|---|
| Memory | 128 MB – 10,240 MB |
| Temporary storage | 512 MB – 10,240 MB (/tmp) |
| Deployment package | 50 MB (zip), 250 MB (unzipped) |
| Environment variables | 4 KB total |
| Concurrent executions | 1,000 (default, can increase) |

### 6. Debugging Complexity

- Can't SSH into the execution environment
- Must rely on **logging** (CloudWatch, etc.)
- Local emulation doesn't perfectly replicate cloud
- Distributed tracing is essential (X-Ray, Datadog)

---

## Serverless Frameworks and Tools

### Serverless Framework

The most popular framework for building serverless applications.

```bash
# Install
npm install -g serverless

# Create a new project
serverless create --template aws-nodejs --path my-service

# Deploy
serverless deploy

# Invoke a function locally
serverless invoke local --function hello

# View logs
serverless logs --function hello --tail

# Remove everything
serverless remove
```

### AWS SAM (Serverless Application Model)

AWS's official framework for serverless applications.

```yaml
# template.yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.handler
      Runtime: nodejs18.x
      Events:
        HelloApi:
          Type: HttpApi
          Properties:
            Path: /hello
            Method: GET
```

```bash
# Build and deploy
sam build
sam deploy --guided

# Local testing
sam local invoke HelloFunction
sam local start-api  # Start a local API Gateway
```

### AWS CDK (Cloud Development Kit)

Define serverless infrastructure using programming languages.

```javascript
// lib/my-stack.js
const { Stack } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");

class MyStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const fn = new lambda.Function(this, "MyFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda"),
    });

    new apigateway.LambdaRestApi(this, "MyApi", {
      handler: fn,
    });
  }
}

module.exports = { MyStack };
```

```bash
# Deploy with CDK
cdk synth    # Generate CloudFormation template
cdk deploy   # Deploy to AWS
cdk destroy  # Tear down
```

### Other Notable Tools

| Tool | Description |
|---|---|
| **Terraform** | Multi-cloud IaC (supports Lambda, Azure Functions, etc.) |
| **Pulumi** | IaC using general-purpose languages |
| **Architect** | Convention-based serverless framework |
| **SST** | Full-stack serverless framework with live debugging |
| **Vercel** | Serverless for frontend frameworks (Next.js) |
| **Netlify Functions** | Serverless functions for Jamstack sites |

---

## Serverless Best Practices

### Code Organization

- **Keep functions small** — one function per responsibility
- **Share code** via layers or packages, not by cramming into one function
- **Minimize dependencies** — smaller packages = faster cold starts
- **Use environment variables** for configuration (never hardcode secrets)

### Performance

- **Allocate more memory** — CPU scales proportionally, faster execution may cost less
- **Reuse connections** — initialize database clients outside the handler
- **Use provisioned concurrency** for latency-sensitive endpoints
- **Minimize package size** — tree-shake, exclude dev dependencies

```javascript
// GOOD: Initialize outside handler (reused across invocations)
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({});

module.exports.handler = async (event) => {
  // client is reused on warm starts
  // ... use client
};
```

### Security

- **Apply least privilege** — IAM roles with minimal permissions
- **Validate all inputs** — never trust event data
- **Use secrets manager** — don't store secrets in environment variables
- **Enable VPC** only when necessary (adds cold start latency)

### Monitoring

- **Structured logging** — use JSON logs for easy parsing
- **Distributed tracing** — AWS X-Ray, Datadog, Lumigo
- **Set alerts** — on errors, high latency, throttling
- **Track cold starts** — monitor and optimize startup time

---

## Try It Yourself

### Exercise 1: Hello World Lambda

If you have an AWS account, create your first Lambda function:

1. Go to the AWS Lambda console
2. Click "Create function"
3. Choose "Author from scratch"
4. Name it `helloWorld`, runtime Node.js 18.x
5. Write a handler that returns `{ message: "Hello from Lambda!" }`
6. Test it using the console's test feature
7. Add an API Gateway trigger and access it via URL

### Exercise 2: Cost Comparison

Calculate the monthly cost for a serverless API vs a traditional server:

**Workload:** 5 million requests/month, 150ms average duration, 512 MB memory

- Calculate Lambda cost (requests + duration)
- Compare to a t3.small EC2 instance running 24/7
- At what request volume does serverless become more expensive?

### Exercise 3: Design a Serverless Architecture

Design the serverless architecture for an **image processing pipeline**:
1. User uploads an image to S3
2. Lambda generates three thumbnails (small, medium, large)
3. Metadata is stored in DynamoDB
4. A notification is sent via SNS

Draw the architecture and list all AWS services needed.

---

## Key Takeaways

- **Serverless** lets you run code without managing servers — the provider handles everything
- **Function as a Service (FaaS)** is the most common serverless model
- Key services: **AWS Lambda**, **Azure Functions**, **Google Cloud Functions**
- Functions are triggered by **events** — HTTP requests, file uploads, timers, queues
- **Cold starts** add latency on first invocation — mitigate with provisioned concurrency
- Pricing is **per invocation + duration** — you pay nothing when idle
- Best for: **APIs, event processing, scheduled tasks, webhooks, data pipelines**
- Limitations: **timeout, cold starts, stateless, vendor lock-in, debugging complexity**
- Use frameworks like **Serverless Framework, SAM, or CDK** to manage serverless apps
- Serverless is **not always cheaper** — high-volume steady workloads may cost more
- Follow best practices: **small functions, minimal dependencies, structured logging, least-privilege IAM**
