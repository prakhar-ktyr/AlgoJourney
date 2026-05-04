---
title: "Cloud Databases"
---

# Cloud Databases

In this lesson, you will learn about the different types of databases available in the cloud, how to choose the right one for your workload, and how managed database services simplify operations at scale.

---

## Why Cloud Databases?

Traditional on-premises databases require you to manage hardware, patching, backups, scaling, and high availability yourself. Cloud databases shift most of that burden to the provider.

**Benefits of cloud databases:**

| Benefit | Description |
|---|---|
| **Managed operations** | Provider handles patching, backups, and failover |
| **Elastic scaling** | Scale up/down or out based on demand |
| **High availability** | Built-in replication and multi-AZ deployments |
| **Pay-as-you-go** | Pay only for storage and compute you use |
| **Global distribution** | Deploy close to users worldwide |
| **Security** | Encryption at rest and in transit by default |

---

## Database Types in the Cloud

Cloud providers offer several categories of databases, each optimized for specific workloads.

### 1. Relational Databases (SQL)

Relational databases store data in structured tables with rows and columns. They use SQL for querying and enforce ACID transactions.

**When to use:** Structured data, complex queries, transactions, reporting.

#### Major Managed Services

| Service | Provider | Engine Support |
|---|---|---|
| **Amazon RDS** | AWS | MySQL, PostgreSQL, MariaDB, Oracle, SQL Server |
| **Amazon Aurora** | AWS | MySQL-compatible, PostgreSQL-compatible |
| **Azure SQL Database** | Azure | SQL Server |
| **Azure Database for PostgreSQL** | Azure | PostgreSQL |
| **Cloud SQL** | GCP | MySQL, PostgreSQL, SQL Server |
| **AlloyDB** | GCP | PostgreSQL-compatible |

#### Example: Creating an RDS Instance (AWS CLI)

```bash
aws rds create-db-instance \
  --db-instance-identifier my-app-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password MySecurePass123! \
  --allocated-storage 100 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 7
```

#### Example: Connecting to Cloud SQL (Python)

```python
import pg8000
import sqlalchemy

def connect_to_cloud_sql():
    """Connect to a Cloud SQL PostgreSQL instance."""
    engine = sqlalchemy.create_engine(
        sqlalchemy.engine.url.URL.create(
            drivername="postgresql+pg8000",
            username="my_user",
            password="my_password",
            host="127.0.0.1",       # Cloud SQL Proxy
            port=5432,
            database="my_database",
        )
    )

    with engine.connect() as conn:
        result = conn.execute(
            sqlalchemy.text("SELECT * FROM products LIMIT 10")
        )
        for row in result:
            print(row)

connect_to_cloud_sql()
```

#### Amazon Aurora — Deep Dive

Aurora is Amazon's cloud-native relational database, designed for high performance and availability.

| Feature | Aurora | Standard RDS |
|---|---|---|
| **Performance** | Up to 5x MySQL, 3x PostgreSQL | Standard engine performance |
| **Storage** | Auto-scales up to 128 TB | Manual allocation |
| **Replication** | 6 copies across 3 AZs | Single standby in Multi-AZ |
| **Failover** | < 30 seconds | 60–120 seconds |
| **Serverless option** | Yes (Aurora Serverless v2) | No |

---

### 2. NoSQL Databases

NoSQL databases handle unstructured or semi-structured data and scale horizontally with ease.

**When to use:** High throughput, flexible schemas, large-scale applications, real-time data.

#### Types of NoSQL Databases

| Type | Description | Example Services |
|---|---|---|
| **Key-Value** | Simple key → value lookups | DynamoDB, Azure Table Storage |
| **Document** | JSON-like documents | Firestore, Cosmos DB, MongoDB Atlas |
| **Wide-Column** | Column families for analytics | Cassandra, Bigtable |
| **Graph** | Nodes and edges for relationships | Neptune, Cosmos DB (Gremlin) |

#### Major Managed Services

| Service | Provider | Data Model |
|---|---|---|
| **Amazon DynamoDB** | AWS | Key-value and document |
| **Azure Cosmos DB** | Azure | Multi-model (document, graph, key-value, column) |
| **Google Firestore** | GCP | Document |
| **Google Bigtable** | GCP | Wide-column |
| **MongoDB Atlas** | Multi-cloud | Document |

#### Example: DynamoDB Operations (JavaScript)

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Put an item
async function createOrder(order) {
  const command = new PutCommand({
    TableName: "Orders",
    Item: {
      userId: order.userId,
      orderId: order.orderId,
      product: order.product,
      amount: order.amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  });
  await docClient.send(command);
}

// Query items by partition key
async function getOrdersByUser(userId) {
  const command = new QueryCommand({
    TableName: "Orders",
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: {
      ":uid": userId,
    },
  });
  const response = await docClient.send(command);
  return response.Items;
}

// Get a single item
async function getOrder(userId, orderId) {
  const command = new GetCommand({
    TableName: "Orders",
    Key: {
      userId: userId,
      orderId: orderId,
    },
  });
  const response = await docClient.send(command);
  return response.Item;
}
```

#### Example: Firestore Operations (Python)

```python
from google.cloud import firestore

db = firestore.Client()

# Add a document
def add_user(user_id, name, email):
    doc_ref = db.collection("users").document(user_id)
    doc_ref.set({
        "name": name,
        "email": email,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

# Query documents
def get_active_users():
    users_ref = db.collection("users")
    query = users_ref.where("status", "==", "active").limit(50)

    results = []
    for doc in query.stream():
        results.append({"id": doc.id, **doc.to_dict()})
    return results

# Real-time listener
def listen_for_changes():
    def on_snapshot(doc_snapshot, changes, read_time):
        for change in changes:
            if change.type.name == "ADDED":
                print(f"New user: {change.document.id}")
            elif change.type.name == "MODIFIED":
                print(f"Updated: {change.document.id}")

    db.collection("users").on_snapshot(on_snapshot)
```

---

### 3. In-Memory Databases

In-memory databases store data in RAM for ultra-low-latency reads and writes. They are commonly used for caching, session management, and real-time analytics.

**When to use:** Caching, session stores, leaderboards, real-time analytics, rate limiting.

#### Major Managed Services

| Service | Provider | Engine |
|---|---|---|
| **Amazon ElastiCache** | AWS | Redis, Memcached, Valkey |
| **Amazon MemoryDB** | AWS | Redis-compatible (durable) |
| **Azure Cache for Redis** | Azure | Redis |
| **Google Memorystore** | GCP | Redis, Memcached |

#### Example: Using ElastiCache Redis for Caching

```python
import redis
import json

# Connect to ElastiCache Redis
r = redis.Redis(
    host="my-cluster.abc123.cache.amazonaws.com",
    port=6379,
    decode_responses=True,
)

def get_product(product_id):
    """Get product with cache-aside pattern."""
    cache_key = f"product:{product_id}"

    # Check cache first
    cached = r.get(cache_key)
    if cached:
        print("Cache HIT")
        return json.loads(cached)

    # Cache miss — query database
    print("Cache MISS")
    product = query_database(product_id)  # your DB call

    # Store in cache with 1-hour TTL
    r.setex(cache_key, 3600, json.dumps(product))

    return product

def invalidate_product_cache(product_id):
    """Invalidate cache when product is updated."""
    r.delete(f"product:{product_id}")
```

---

### 4. Graph Databases

Graph databases model data as nodes (entities) and edges (relationships). They excel at traversing complex, connected datasets.

**When to use:** Social networks, recommendation engines, fraud detection, knowledge graphs.

#### Major Managed Services

| Service | Provider | Query Language |
|---|---|---|
| **Amazon Neptune** | AWS | Gremlin, SPARQL, openCypher |
| **Azure Cosmos DB (Gremlin API)** | Azure | Gremlin |
| **Neo4j Aura** | Multi-cloud | Cypher |

#### Example: Neptune Gremlin Query

```groovy
// Add vertices (nodes)
g.addV('person').property('name', 'Alice').property('age', 30)
g.addV('person').property('name', 'Bob').property('age', 28)
g.addV('company').property('name', 'TechCorp')

// Add edges (relationships)
g.V().has('name', 'Alice').addE('knows').to(g.V().has('name', 'Bob'))
g.V().has('name', 'Alice').addE('works_at').to(g.V().has('name', 'TechCorp'))

// Traverse: Find Alice's friends who work at the same company
g.V().has('name', 'Alice')
  .out('works_at').in('works_at')
  .where(neq('Alice'))
  .values('name')
```

---

### 5. Time-Series Databases

Time-series databases are optimized for storing and querying timestamped data points.

**When to use:** IoT telemetry, application metrics, financial data, log analytics.

#### Major Managed Services

| Service | Provider | Notes |
|---|---|---|
| **Amazon Timestream** | AWS | Serverless, auto-tiering |
| **Azure Data Explorer** | Azure | Fast analytics on streaming data |
| **InfluxDB Cloud** | Multi-cloud | Popular open-source based |
| **Google Cloud Bigtable** | GCP | Can model time-series at scale |

#### Example: Writing to Amazon Timestream

```python
import boto3

client = boto3.client("timestream-write", region_name="us-east-1")

def write_sensor_data(device_id, temperature, humidity):
    records = [
        {
            "Dimensions": [
                {"Name": "device_id", "Value": device_id},
                {"Name": "region", "Value": "us-east-1"},
            ],
            "MeasureName": "temperature",
            "MeasureValue": str(temperature),
            "MeasureValueType": "DOUBLE",
            "TimeUnit": "SECONDS",
        },
        {
            "Dimensions": [
                {"Name": "device_id", "Value": device_id},
                {"Name": "region", "Value": "us-east-1"},
            ],
            "MeasureName": "humidity",
            "MeasureValue": str(humidity),
            "MeasureValueType": "DOUBLE",
            "TimeUnit": "SECONDS",
        },
    ]

    client.write_records(
        DatabaseName="IoTDatabase",
        TableName="SensorData",
        Records=records,
    )
```

---

## Managed vs Self-Managed Databases

| Aspect | Managed (e.g., RDS) | Self-Managed (e.g., EC2 + MySQL) |
|---|---|---|
| **Setup** | Minutes | Hours to days |
| **Patching** | Automatic | Manual |
| **Backups** | Automatic, point-in-time | Manual configuration |
| **Scaling** | One-click or auto | Manual provisioning |
| **HA / Failover** | Built-in Multi-AZ | Manual setup (Pacemaker, etc.) |
| **Cost** | Higher per-unit price | Lower per-unit, higher ops cost |
| **Control** | Limited OS/engine access | Full control |
| **Best for** | Most workloads | Custom configs, legacy engines |

> **Rule of thumb:** Use managed databases unless you have a specific reason not to (e.g., an unsupported engine or OS-level customization requirement).

---

## Read Replicas and Multi-AZ Deployments

### Read Replicas

Read replicas are read-only copies of your primary database that handle read traffic, reducing load on the primary.

```
                    ┌──────────────┐
   Writes ────────► │   Primary    │
                    │   Database   │
                    └──────┬───────┘
                           │ Async replication
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Replica 1│ │ Replica 2│ │ Replica 3│
        └──────────┘ └──────────┘ └──────────┘
              ▲            ▲            ▲
              └────────────┼────────────┘
                      Reads
```

**Key points:**
- Replication is **asynchronous** — slight lag is normal
- Can be in the same region or **cross-region**
- Replicas can be promoted to standalone databases
- AWS allows up to **15 Aurora replicas** or **5 RDS replicas**

### Multi-AZ Deployments

Multi-AZ provides high availability by maintaining a **synchronous standby** in a different Availability Zone.

| Feature | Read Replica | Multi-AZ Standby |
|---|---|---|
| **Purpose** | Scale reads | High availability |
| **Replication** | Asynchronous | Synchronous |
| **Readable?** | Yes | No (standby only) |
| **Failover** | Manual promotion | Automatic |
| **Cross-region** | Yes | Same region (typically) |

---

## Database Migration

When moving databases to the cloud, use managed migration services to minimize downtime.

### AWS Database Migration Service (DMS)

```
┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Source DB   │─────►│   AWS DMS   │─────►│  Target DB   │
│ (On-premises) │      │  Replication│      │  (RDS/Aurora) │
└──────────────┘      │  Instance   │      └──────────────┘
                      └─────────────┘
```

**DMS supports:**
- Homogeneous migrations (MySQL → MySQL)
- Heterogeneous migrations (Oracle → PostgreSQL) — use **Schema Conversion Tool (SCT)** first
- Continuous replication (CDC) for minimal downtime

### Azure Database Migration Service

- Supports SQL Server, MySQL, PostgreSQL migrations to Azure
- Online (minimal downtime) and offline migration modes
- Integrated with Azure Migrate for full discovery and assessment

### GCP Database Migration Service

- Supports MySQL, PostgreSQL, SQL Server to Cloud SQL / AlloyDB
- Continuous replication until cutover

---

## CAP Theorem Explained

The **CAP theorem** states that a distributed system can guarantee only **two of three** properties simultaneously:

| Property | Description |
|---|---|
| **Consistency (C)** | Every read returns the most recent write |
| **Availability (A)** | Every request receives a response (success or failure) |
| **Partition Tolerance (P)** | The system continues to operate despite network partitions |

Since network partitions are unavoidable in distributed systems, the real choice is between **CP** and **AP**:

| Type | Guarantees | Trade-off | Example Services |
|---|---|---|---|
| **CP** | Consistency + Partition Tolerance | May reject requests during partitions | DynamoDB (strong consistency mode), Spanner |
| **AP** | Availability + Partition Tolerance | May return stale data | DynamoDB (eventual consistency), Cassandra, CouchDB |

> **In practice**, many cloud databases let you choose the consistency level per query. DynamoDB, for example, supports both **eventually consistent** (default, cheaper) and **strongly consistent** reads.

---

## Choosing the Right Database

Use this decision guide to pick the right database for your workload:

```
                         What is your data like?
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
          Structured      Semi-structured    Graph/
          (tables)        (JSON, flexible)   Relationships
                │               │               │
                ▼               ▼               ▼
          Relational        NoSQL           Graph DB
          (RDS, Aurora,   (DynamoDB,       (Neptune,
           Cloud SQL)      Firestore,       Cosmos
                           Cosmos DB)       Gremlin)
                │
      ┌─────────┼─────────┐
      ▼                   ▼
  Need caching?      Time-series data?
      │                   │
      ▼                   ▼
  In-Memory           Time-Series DB
  (ElastiCache,       (Timestream,
   Memorystore)        InfluxDB Cloud)
```

### Quick Reference Table

| Workload | Recommended Database Type | Example Service |
|---|---|---|
| E-commerce orders | Relational | Aurora, Cloud SQL |
| User profiles | Document (NoSQL) | DynamoDB, Firestore |
| Session storage | In-memory | ElastiCache Redis |
| Social network | Graph | Neptune |
| IoT sensor data | Time-series | Timestream |
| Product catalog | Document (NoSQL) | MongoDB Atlas |
| Financial ledger | Relational (ACID) | Aurora, Spanner |
| Real-time leaderboard | In-memory | ElastiCache Redis |
| Log analytics | Time-series / Wide-column | Bigtable, Timestream |
| Content management | Document (NoSQL) | Firestore, Cosmos DB |

---

## Database Pricing Models

Cloud database pricing typically involves these components:

| Component | Description |
|---|---|
| **Compute** | Instance size (vCPU, RAM) or request units |
| **Storage** | GB stored per month |
| **I/O** | Read/write operations (some services) |
| **Data transfer** | Outbound data across regions/internet |
| **Backups** | Storage beyond free retention period |
| **Replicas** | Additional cost per read replica |

### Pricing Comparison (Approximate)

| Service | Pricing Model | Starting Cost |
|---|---|---|
| **RDS (db.t3.micro)** | Per-hour instance | ~$0.017/hr |
| **Aurora Serverless v2** | Per ACU-hour | ~$0.12/ACU-hr |
| **DynamoDB (On-Demand)** | Per request | ~$1.25 per million writes |
| **DynamoDB (Provisioned)** | Per capacity unit | ~$0.00065/WCU-hr |
| **Firestore** | Per operation + storage | $0.06 per 100K reads |
| **ElastiCache (t3.micro)** | Per-hour node | ~$0.017/hr |

> **Tip:** Use **reserved instances** or **committed use discounts** for predictable workloads to save 30–60%.

---

## Exercises

### Exercise 1: Match the Database

Match each workload to the best database type:

| Workload | Database Type |
|---|---|
| 1. Online banking transactions | a. Graph |
| 2. Social media friend suggestions | b. In-memory |
| 3. Weather station readings | c. Relational |
| 4. Shopping cart sessions | d. Document (NoSQL) |
| 5. Blog posts with comments | e. Time-series |

<details>
<summary>Solution</summary>

1 → c (Relational — ACID transactions required)
2 → a (Graph — relationship traversal)
3 → e (Time-series — timestamped sensor data)
4 → b (In-memory — fast, ephemeral session data)
5 → d (Document — flexible nested structure)
</details>

---

### Exercise 2: Design a Database Architecture

You are building an e-commerce platform. Design which database(s) you would use for each component:

- Product catalog
- User accounts and orders
- Shopping cart / sessions
- Product recommendations ("customers also bought")
- Search and filtering
- Real-time analytics dashboard

<details>
<summary>Solution</summary>

| Component | Database | Reasoning |
|---|---|---|
| Product catalog | DynamoDB or Firestore | Flexible product attributes, high read throughput |
| User accounts / orders | Aurora PostgreSQL | ACID transactions, complex joins |
| Shopping cart / sessions | ElastiCache Redis | Low latency, auto-expiry with TTL |
| Recommendations | Neptune (Graph) | Traverses purchase relationships |
| Search and filtering | OpenSearch / Elasticsearch | Full-text search, faceted filtering |
| Real-time analytics | Timestream + ElastiCache | Time-series metrics, cached dashboards |

</details>

---

### Exercise 3: CAP Theorem Application

For each scenario, decide whether you need **CP** or **AP** and explain why:

1. A global banking system processing wire transfers
2. A social media "like" counter
3. A distributed inventory system for a warehouse
4. A DNS resolution service

<details>
<summary>Solution</summary>

1. **CP** — Financial transactions must be consistent; it is better to reject a request than process it with stale data.
2. **AP** — A "like" count being slightly stale for a moment is acceptable; availability matters more.
3. **CP** — Inventory must be accurate to avoid overselling; consistency is critical.
4. **AP** — DNS can serve slightly stale records; availability and speed matter more than instant consistency.

</details>

---

## Key Takeaways

- Cloud databases come in **five main categories**: relational, NoSQL, in-memory, graph, and time-series.
- **Managed databases** (RDS, DynamoDB, Firestore) handle patching, backups, and scaling — use them unless you have a specific reason not to.
- **Read replicas** scale read traffic; **Multi-AZ** provides high availability — they serve different purposes.
- The **CAP theorem** means you must choose between consistency and availability during network partitions.
- **Choose your database** based on your data model, access patterns, consistency needs, and scale requirements.
- Use **migration services** (DMS, Azure DMS) for minimal-downtime database migrations.
- Optimize costs with **reserved capacity**, **auto-scaling**, and the right **pricing model** for your access pattern.
