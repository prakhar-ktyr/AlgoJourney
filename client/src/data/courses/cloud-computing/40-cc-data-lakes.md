---
title: "Data Lakes and Data Warehouses"
---

# Data Lakes and Data Warehouses

In this lesson, you will learn about data lakes, data warehouses, and the modern data lakehouse architecture. You will understand when to use each, explore major cloud services, and build a mental model for designing data pipelines.

---

## Data Lake vs Data Warehouse vs Data Lakehouse

Before diving into details, let's clarify the three major approaches to storing and analyzing large volumes of data.

| Feature | Data Lake | Data Warehouse | Data Lakehouse |
|---|---|---|---|
| **Data format** | Raw (structured, semi-structured, unstructured) | Structured (schema-on-write) | Both raw and structured |
| **Schema** | Schema-on-read | Schema-on-write | Schema-on-read + enforcement |
| **Processing** | ELT (Extract, Load, Transform) | ETL (Extract, Transform, Load) | Both ETL and ELT |
| **Cost** | Low (object storage) | High (compute + storage coupled) | Medium (decoupled) |
| **Users** | Data engineers, data scientists | Business analysts, BI teams | All data roles |
| **Query performance** | Variable (depends on format) | Optimized (indexes, partitions) | Optimized (open table formats) |
| **ACID transactions** | No (traditionally) | Yes | Yes |
| **Example services** | S3, ADLS, GCS | Redshift, Synapse, BigQuery | Delta Lake, Apache Iceberg |

### Visual Comparison

```
Data Lake                    Data Warehouse              Data Lakehouse
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Raw data:      │         │  Structured     │         │  Raw + Curated  │
│  JSON, CSV,     │         │  tables with    │         │  data with ACID │
│  images, logs,  │         │  schemas,       │         │  transactions   │
│  Parquet, Avro  │         │  indexes,       │         │  and schema     │
│                 │         │  optimized for  │         │  enforcement on │
│  Schema-on-read │         │  SQL queries    │         │  object storage │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Cheap                      Expensive                   Balanced
     Flexible                   Performant                  Best of both
```

---

## Data Lake Architecture

A data lake follows a **layered architecture** with four stages: ingest, store, process, and analyze.

### The Four Layers

```
┌──────────────────────────────────────────────────────┐
│                     ANALYZE                          │
│   BI dashboards, SQL queries, ML model training      │
├──────────────────────────────────────────────────────┤
│                     PROCESS                          │
│   Clean, transform, enrich, aggregate                │
├──────────────────────────────────────────────────────┤
│                      STORE                           │
│   Object storage (S3, ADLS, GCS) in zones            │
├──────────────────────────────────────────────────────┤
│                     INGEST                           │
│   Batch uploads, streaming, CDC, API pulls           │
└──────────────────────────────────────────────────────┘
```

### Data Lake Zones

Data lakes organize data into zones (sometimes called layers or tiers):

| Zone | Also Called | Description | Example |
|---|---|---|---|
| **Raw / Landing** | Bronze | Data as-is from the source | Raw JSON logs, CSV exports |
| **Cleansed** | Silver | Cleaned, deduplicated, validated | Parsed log records, standardized formats |
| **Curated** | Gold | Business-ready, aggregated | Revenue by region, daily active users |

```
Sources ──► Raw (Bronze) ──► Cleansed (Silver) ──► Curated (Gold)
              │                    │                     │
          Store as-is       Validate, clean        Aggregate,
                            deduplicate            join, enrich
```

---

## Cloud Data Lake Technologies

### AWS: S3 + Glue + Athena

The AWS data lake stack uses **S3** for storage, **Glue** for ETL and cataloging, and **Athena** for serverless SQL queries.

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Sources │────►│ AWS Glue │────►│ Amazon   │────►│ Amazon   │
│ (APIs,   │     │ (ETL +   │     │ S3       │     │ Athena   │
│  DBs,    │     │  Catalog)│     │ (Storage)│     │ (Query)  │
│  streams)│     └──────────┘     └──────────┘     └──────────┘
└──────────┘                                            │
                                                        ▼
                                                  ┌──────────┐
                                                  │QuickSight│
                                                  │  (BI)    │
                                                  └──────────┘
```

#### Example: Querying S3 Data with Athena

```sql
-- Create an external table pointing to S3 data
CREATE EXTERNAL TABLE web_logs (
    request_time    TIMESTAMP,
    client_ip       STRING,
    method          STRING,
    url             STRING,
    status_code     INT,
    response_bytes  BIGINT,
    user_agent      STRING
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
STORED AS PARQUET
LOCATION 's3://my-data-lake/bronze/web-logs/'
TBLPROPERTIES ('parquet.compression' = 'SNAPPY');

-- Query the data — pay only for data scanned
SELECT
    DATE(request_time) AS day,
    status_code,
    COUNT(*) AS request_count,
    SUM(response_bytes) / (1024 * 1024) AS total_mb
FROM web_logs
WHERE request_time >= DATE '2025-01-01'
GROUP BY DATE(request_time), status_code
ORDER BY day, request_count DESC;
```

#### Example: AWS Glue ETL Job (PySpark)

```python
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from pyspark.context import SparkContext

args = getResolvedOptions(sys.argv, ["JOB_NAME"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session

# Read raw data from S3 (Bronze layer)
raw_data = glueContext.create_dynamic_frame.from_catalog(
    database="my_data_lake",
    table_name="raw_web_logs",
)

# Transform: filter, clean, and repartition (Silver layer)
cleaned = raw_data.filter(
    f=lambda row: row["status_code"] is not None
).apply_mapping([
    ("request_time", "string", "request_time", "timestamp"),
    ("client_ip", "string", "client_ip", "string"),
    ("method", "string", "method", "string"),
    ("url", "string", "url", "string"),
    ("status_code", "int", "status_code", "int"),
    ("response_bytes", "long", "response_bytes", "long"),
])

# Write to Silver layer in Parquet format
glueContext.write_dynamic_frame.from_options(
    frame=cleaned,
    connection_type="s3",
    connection_options={
        "path": "s3://my-data-lake/silver/web-logs/",
        "partitionKeys": ["method"],
    },
    format="parquet",
    format_options={"compression": "snappy"},
)
```

### Azure: Data Lake Storage + Synapse

Azure uses **Azure Data Lake Storage Gen2 (ADLS)** for storage and **Azure Synapse Analytics** as the unified analytics service.

| Component | Purpose |
|---|---|
| **ADLS Gen2** | Hierarchical namespace on Blob Storage |
| **Synapse Pipelines** | Data integration and orchestration |
| **Synapse Spark** | Big data processing |
| **Synapse SQL** | Serverless or dedicated SQL pools |
| **Power BI** | Business intelligence and dashboards |

#### Example: Synapse Serverless SQL Query

```sql
-- Query Parquet files directly in ADLS
SELECT
    customer_id,
    product_category,
    SUM(order_total) AS total_spent,
    COUNT(*) AS order_count
FROM OPENROWSET(
    BULK 'https://mydatalake.dfs.core.windows.net/silver/orders/**',
    FORMAT = 'PARQUET'
) AS orders
GROUP BY customer_id, product_category
HAVING SUM(order_total) > 1000
ORDER BY total_spent DESC;
```

### GCP: Cloud Storage + BigQuery

GCP combines **Cloud Storage** for raw data and **BigQuery** as a serverless data warehouse that can also query external data.

| Component | Purpose |
|---|---|
| **Cloud Storage** | Object storage for raw data |
| **Dataflow** | Stream and batch processing (Apache Beam) |
| **Dataproc** | Managed Spark/Hadoop clusters |
| **BigQuery** | Serverless data warehouse + external queries |
| **Looker** | Business intelligence |

#### Example: BigQuery External Table

```sql
-- Create an external table over Cloud Storage
CREATE EXTERNAL TABLE my_dataset.external_events
OPTIONS (
    format = 'PARQUET',
    uris = ['gs://my-data-lake/bronze/events/*.parquet']
);

-- Query across external and native tables
SELECT
    e.event_type,
    u.country,
    COUNT(*) AS event_count
FROM my_dataset.external_events e
JOIN my_dataset.users u ON e.user_id = u.user_id
WHERE e.event_date >= '2025-01-01'
GROUP BY e.event_type, u.country
ORDER BY event_count DESC
LIMIT 100;
```

---

## Data Warehouses — Deep Dive

### Amazon Redshift

| Feature | Details |
|---|---|
| **Type** | Columnar, MPP (massively parallel processing) |
| **Scaling** | RA3 nodes with managed storage, Serverless option |
| **Integrations** | S3, Glue, Kinesis, Lake Formation |
| **Key feature** | Redshift Spectrum — query S3 data in place |
| **Pricing** | On-demand or reserved nodes; Serverless pay-per-query |

### Azure Synapse Analytics

| Feature | Details |
|---|---|
| **Type** | Unified analytics (SQL + Spark + Pipelines) |
| **Scaling** | Dedicated SQL pools or Serverless SQL |
| **Integrations** | ADLS, Power BI, Purview, Cosmos DB |
| **Key feature** | Serverless SQL queries over ADLS data |
| **Pricing** | Per DWU-hour (dedicated) or per TB scanned (serverless) |

### Google BigQuery

| Feature | Details |
|---|---|
| **Type** | Serverless, columnar, MPP |
| **Scaling** | Fully automatic — no cluster management |
| **Integrations** | Cloud Storage, Dataflow, Pub/Sub, Vertex AI |
| **Key feature** | Automatic slot management, ML built-in (BQML) |
| **Pricing** | On-demand ($5/TB scanned) or flat-rate slots |

### Data Warehouse Comparison

| Feature | Redshift | Synapse | BigQuery |
|---|---|---|---|
| **Serverless** | Yes (Serverless) | Yes (Serverless SQL) | Yes (default) |
| **Storage format** | Proprietary columnar | Proprietary + open | Capacitor (internal) |
| **ML integration** | Redshift ML | Synapse ML | BigQuery ML |
| **Streaming** | Kinesis integration | Event Hubs | Pub/Sub + streaming inserts |
| **Concurrency** | Moderate (WLM) | High (serverless) | Very high |
| **External queries** | Spectrum (S3) | OPENROWSET (ADLS) | External tables (GCS) |

---

## ETL vs ELT Pipelines

### ETL (Extract, Transform, Load)

Data is transformed **before** loading into the target system.

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Source   │────►│  Transform   │────►│   Data       │
│  Systems  │     │  (clean,     │     │  Warehouse   │
│           │     │   aggregate) │     │              │
└──────────┘     └──────────────┘     └──────────────┘
```

**Best for:** Data warehouses where storage is expensive and you want only clean, structured data loaded.

### ELT (Extract, Load, Transform)

Data is loaded **first**, then transformed inside the target system.

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Source   │────►│   Data Lake  │────►│  Transform   │
│  Systems  │     │   / Lakehouse│     │  in place    │
│           │     │  (load raw)  │     │  (SQL/Spark) │
└──────────┘     └──────────────┘     └──────────────┘
```

**Best for:** Data lakes and lakehouses where storage is cheap and you want to preserve raw data for future use.

### Comparison

| Aspect | ETL | ELT |
|---|---|---|
| **Transform timing** | Before loading | After loading |
| **Raw data preserved?** | No (typically discarded) | Yes |
| **Infrastructure** | Separate ETL server | Target system's compute |
| **Flexibility** | Must re-extract if transform changes | Re-transform from raw data |
| **Cost** | Higher compute upfront | Higher storage, lower compute |
| **Tools** | Informatica, Talend, SSIS | dbt, Spark, Synapse SQL |
| **Modern preference** | Legacy / warehouse-first | Cloud-native / lake-first |

### Example: dbt Transformation (ELT)

```sql
-- models/marts/daily_revenue.sql
-- This dbt model runs inside the warehouse after raw data is loaded

{{ config(materialized='table', partition_by='order_date') }}

WITH orders AS (
    SELECT
        DATE(order_timestamp) AS order_date,
        customer_id,
        product_id,
        quantity,
        unit_price,
        quantity * unit_price AS line_total
    FROM {{ ref('stg_orders') }}
    WHERE order_status = 'completed'
),

daily_summary AS (
    SELECT
        order_date,
        COUNT(DISTINCT customer_id) AS unique_customers,
        COUNT(*) AS total_orders,
        SUM(line_total) AS total_revenue,
        AVG(line_total) AS avg_order_value
    FROM orders
    GROUP BY order_date
)

SELECT
    *,
    SUM(total_revenue) OVER (
        ORDER BY order_date
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS rolling_7d_revenue
FROM daily_summary
```

---

## Data Formats

Choosing the right file format for your data lake has a major impact on query performance, storage cost, and compatibility.

| Format | Type | Compression | Splittable | Schema Evolution | Best For |
|---|---|---|---|---|---|
| **Parquet** | Columnar | Excellent (Snappy, Zstd) | Yes | Yes | Analytics, BI queries |
| **Avro** | Row-based | Good (Snappy, Deflate) | Yes | Yes | Streaming, data exchange |
| **ORC** | Columnar | Excellent (Zlib, Snappy) | Yes | Yes | Hive/Spark workloads |
| **JSON** | Row-based | Poor (text) | Yes (line-delimited) | Flexible | APIs, logs, ingestion |
| **CSV** | Row-based | Poor (text) | Yes | No | Simple data exchange |

### Why Parquet is the Most Popular Choice

```
CSV file: 1 GB                 Parquet file: ~150 MB
┌─────────────────────┐       ┌─────────────────────┐
│ id,name,age,city    │       │ Column: id           │  ← Only read
│ 1,Alice,30,NYC      │       │ Column: name         │    columns you
│ 2,Bob,28,LA         │       │ Column: age  ◄───────│    need!
│ 3,Carol,35,Chicago  │       │ Column: city         │
│ ...millions of rows │       │ (+ metadata, stats)  │
└─────────────────────┘       └─────────────────────┘
  Must read everything          Skip unused columns
  No compression metadata       Predicate pushdown
```

**Key benefits of Parquet:**
- **Columnar:** Only reads the columns your query needs
- **Compression:** 5–10x smaller than CSV
- **Predicate pushdown:** Min/max stats skip irrelevant row groups
- **Schema evolution:** Add columns without rewriting data
- **Ecosystem support:** Works with Spark, Athena, BigQuery, Synapse, Pandas, Polars

#### Example: Writing Parquet with Python

```python
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

# Create a DataFrame
df = pd.DataFrame({
    "user_id": range(1, 1000001),
    "event_type": ["click", "view", "purchase"] * 333333 + ["click"],
    "timestamp": pd.date_range("2025-01-01", periods=1000000, freq="s"),
    "amount": [round(x * 0.01, 2) for x in range(1, 1000001)],
})

# Write as Parquet with partitioning
table = pa.Table.from_pandas(df)
pq.write_to_dataset(
    table,
    root_path="./data-lake/events/",
    partition_cols=["event_type"],
    compression="snappy",
)

# Read back — only the columns and partitions you need
filtered = pq.read_table(
    "./data-lake/events/",
    columns=["user_id", "amount"],
    filters=[("event_type", "=", "purchase")],
)
print(f"Purchases: {len(filtered)} rows")
print(filtered.to_pandas().head())
```

---

## Data Catalog and Governance

A data catalog is a centralized inventory of all datasets in your organization. It provides metadata management, discoverability, and governance.

### Why You Need a Data Catalog

| Challenge | How a Catalog Helps |
|---|---|
| "Where is the customer data?" | Searchable metadata registry |
| "Can I trust this dataset?" | Data quality scores and lineage |
| "Who owns this table?" | Ownership and stewardship tracking |
| "Is this data PII?" | Automated classification and tagging |
| "How was this derived?" | Data lineage visualization |

### Major Data Catalog Services

| Service | Provider | Key Features |
|---|---|---|
| **AWS Glue Data Catalog** | AWS | Hive-compatible metastore, crawlers |
| **AWS Lake Formation** | AWS | Fine-grained access control, catalog |
| **Azure Purview (Microsoft Purview)** | Azure | Unified governance, lineage, classification |
| **Google Dataplex** | GCP | Data mesh, quality, discovery |
| **Google Data Catalog** | GCP | Metadata management, search |
| **Apache Atlas** | Open source | Governance for Hadoop ecosystem |

### Data Governance Best Practices

1. **Classify data** by sensitivity (public, internal, confidential, restricted)
2. **Tag PII columns** (name, email, SSN) for masking and access control
3. **Track lineage** — know where data came from and how it was transformed
4. **Define ownership** — every dataset should have an owner
5. **Enforce access policies** — least-privilege access via IAM and row/column-level security
6. **Monitor quality** — set up automated data quality checks

---

## Data Lakehouse Architecture

The **data lakehouse** combines the best of data lakes and data warehouses. It uses open file formats on cheap object storage while adding warehouse-like features: ACID transactions, schema enforcement, and time travel.

### How It Works

```
┌───────────────────────────────────────────────────────────┐
│                    Data Lakehouse                         │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │            Query Engines                            │  │
│  │   Spark, Trino, Athena, BigQuery, Synapse           │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │         Open Table Format Layer                     │  │
│  │   Delta Lake  |  Apache Iceberg  |  Apache Hudi     │  │
│  │   ─ ACID transactions                               │  │
│  │   ─ Schema evolution                                │  │
│  │   ─ Time travel                                     │  │
│  │   ─ Partition evolution                             │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                 │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │            Object Storage                           │  │
│  │      S3  |  ADLS  |  GCS  (Parquet files)           │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Delta Lake vs Apache Iceberg vs Apache Hudi

| Feature | Delta Lake | Apache Iceberg | Apache Hudi |
|---|---|---|---|
| **Creator** | Databricks | Netflix → Apache | Uber → Apache |
| **Transaction log** | JSON-based `_delta_log/` | Metadata files (Avro) | Timeline metadata |
| **Time travel** | Yes | Yes | Yes |
| **Schema evolution** | Yes | Yes (column mapping) | Yes |
| **Partition evolution** | Limited | Yes (hidden partitioning) | Yes |
| **Engine support** | Spark, Trino, Flink | Spark, Trino, Flink, Athena | Spark, Flink, Trino |
| **Cloud adoption** | Databricks, Azure, AWS | AWS (Athena/EMR), Snowflake | AWS (EMR), limited |

#### Example: Delta Lake Operations (PySpark)

```python
from delta.tables import DeltaTable
from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("LakehouseDemo") \
    .config("spark.sql.extensions",
            "io.delta.sql.DeltaSparkSessionExtension") \
    .config("spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog") \
    .getOrCreate()

# Write data as a Delta table
df = spark.read.parquet("s3://my-lake/bronze/orders/")
df.write.format("delta").mode("overwrite").save("s3://my-lake/silver/orders/")

# Upsert (MERGE) — insert new rows, update existing ones
delta_table = DeltaTable.forPath(spark, "s3://my-lake/silver/orders/")
new_data = spark.read.parquet("s3://my-lake/bronze/orders-updates/")

delta_table.alias("target").merge(
    new_data.alias("source"),
    "target.order_id = source.order_id"
).whenMatchedUpdateAll() \
 .whenNotMatchedInsertAll() \
 .execute()

# Time travel — read data as it was 2 versions ago
historical = spark.read.format("delta") \
    .option("versionAsOf", 2) \
    .load("s3://my-lake/silver/orders/")

historical.show()
```

#### Example: Apache Iceberg Table (SQL)

```sql
-- Create an Iceberg table in Athena
CREATE TABLE my_catalog.my_db.events (
    event_id    BIGINT,
    user_id     BIGINT,
    event_type  STRING,
    event_time  TIMESTAMP,
    properties  MAP<STRING, STRING>
)
PARTITIONED BY (days(event_time))
LOCATION 's3://my-lake/iceberg/events/'
TBLPROPERTIES ('table_type' = 'ICEBERG');

-- Insert data
INSERT INTO my_catalog.my_db.events
SELECT * FROM staging_events;

-- Time travel — query a snapshot
SELECT * FROM my_catalog.my_db.events
FOR SYSTEM_TIME AS OF TIMESTAMP '2025-04-01 00:00:00';

-- Schema evolution — add a column (no rewrite needed)
ALTER TABLE my_catalog.my_db.events
ADD COLUMNS (device_type STRING);

-- Partition evolution — change partitioning without rewriting
ALTER TABLE my_catalog.my_db.events
ADD PARTITION FIELD hours(event_time);
```

---

## Real-World Data Pipeline Example

Let's design a complete data pipeline for an **e-commerce analytics platform**.

### Requirements

- Ingest order events from the application database and clickstream from the website
- Store raw data for compliance (7-year retention)
- Provide daily sales dashboards for business teams
- Enable data scientists to build recommendation models

### Architecture

```
┌──────────────┐   ┌──────────────┐
│  App Database│   │  Clickstream │
│  (PostgreSQL)│   │  (Kinesis)   │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  ▼
┌──────────────────────────────────┐
│         INGEST LAYER             │
│  CDC via DMS  │  Kinesis Firehose│
└──────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│     BRONZE (Raw) — S3            │
│  s3://lake/bronze/orders/        │
│  s3://lake/bronze/clickstream/   │
│  Format: JSON, 7-year retention  │
└──────────────────────────────────┘
       │
       ▼  (Glue / Spark ETL)
┌──────────────────────────────────┐
│     SILVER (Cleansed) — S3       │
│  s3://lake/silver/orders/        │
│  s3://lake/silver/sessions/      │
│  Format: Parquet + Delta Lake    │
│  Deduplicated, validated         │
└──────────────────────────────────┘
       │
       ▼  (Spark / dbt)
┌──────────────────────────────────┐
│     GOLD (Curated) — S3          │
│  s3://lake/gold/daily_revenue/   │
│  s3://lake/gold/user_segments/   │
│  Format: Parquet + Delta Lake    │
│  Aggregated, business-ready      │
└──────────────────────────────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│   Athena /   │      │  SageMaker   │
│   QuickSight │      │  (ML models) │
│  (Dashboards)│      │              │
└──────────────┘      └──────────────┘
```

### Pipeline Steps

| Step | Tool | Description |
|---|---|---|
| 1. CDC capture | AWS DMS | Captures row-level changes from PostgreSQL |
| 2. Stream ingest | Kinesis Firehose | Buffers and delivers clickstream to S3 |
| 3. Raw storage | S3 (Bronze) | Stores raw JSON with lifecycle policies |
| 4. ETL job | Glue Spark | Cleans, deduplicates, converts to Parquet |
| 5. Silver storage | S3 (Silver) | Delta Lake tables for validated data |
| 6. Aggregation | dbt on Athena | Builds daily/weekly business metrics |
| 7. Gold storage | S3 (Gold) | Final business-ready tables |
| 8. Dashboards | QuickSight | Connects to Athena for visual analytics |
| 9. ML training | SageMaker | Reads from Silver/Gold for model training |
| 10. Orchestration | Step Functions | Schedules and monitors the full pipeline |

---

## Exercises

### Exercise 1: Data Lake or Data Warehouse?

For each scenario, decide whether you would use a data lake, data warehouse, or data lakehouse:

| Scenario | Your Choice |
|---|---|
| 1. Store raw server logs for future analysis | __________ |
| 2. Daily sales reports for executives | __________ |
| 3. Train ML models on user behavior data | __________ |
| 4. Real-time fraud detection system | __________ |
| 5. Archive 10 years of compliance data | __________ |
| 6. Interactive BI dashboards with joins across 20 tables | __________ |

<details>
<summary>Solution</summary>

1. **Data lake** — raw, unstructured data, schema unknown at write time
2. **Data warehouse** — structured, optimized for SQL queries and BI
3. **Data lake** (or lakehouse) — ML needs raw/varied data, Parquet for training
4. **Data lakehouse** — needs both streaming ingest (lake) and ACID updates (warehouse)
5. **Data lake** — cheapest storage for long retention
6. **Data warehouse** — complex joins perform best on warehouse engines

</details>

---

### Exercise 2: Choose the Right Format

Match each use case to the best data format:

| Use Case | Best Format |
|---|---|
| 1. Analytical queries selecting 3 of 50 columns | __________ |
| 2. Streaming events between microservices | __________ |
| 3. Simple data export for Excel users | __________ |
| 4. Hive/Spark heavy analytics workload | __________ |
| 5. API response payloads | __________ |

<details>
<summary>Solution</summary>

1. **Parquet** — columnar, reads only needed columns
2. **Avro** — row-based, compact, schema included, great for streaming
3. **CSV** — universally readable, simple
4. **ORC** — optimized for Hive/Spark with excellent compression
5. **JSON** — human-readable, flexible schema, standard for APIs

</details>

---

### Exercise 3: Design a Data Pipeline

You work at a ride-sharing company. Design a data pipeline that:

- Ingests real-time ride events (start, end, location, fare)
- Stores raw events for 5 years
- Provides daily driver earnings reports
- Enables data scientists to predict surge pricing

Specify: ingestion method, storage layers, file formats, processing tools, and serving layer.

<details>
<summary>Solution</summary>

| Component | Choice | Reasoning |
|---|---|---|
| **Ingestion** | Kinesis Data Streams | Real-time ride events, high throughput |
| **Raw storage** | S3 Bronze (JSON) | Preserve original events, 5-year lifecycle |
| **Processing** | Glue Spark + Delta Lake | Clean, deduplicate, add Delta ACID |
| **Silver storage** | S3 Silver (Parquet/Delta) | Validated ride records |
| **Aggregation** | dbt on Athena | Daily driver earnings, regional metrics |
| **Gold storage** | S3 Gold (Parquet/Delta) | Business-ready tables |
| **Dashboards** | QuickSight | Driver earnings reports for ops team |
| **ML** | SageMaker | Surge pricing model trained on Silver data |
| **Orchestration** | Step Functions + EventBridge | Schedule ETL, trigger on new data |

Pipeline flow:

```
Ride App → Kinesis → Firehose → S3 (Bronze/JSON)
                                    │
                              Glue Spark ETL
                                    │
                              S3 (Silver/Delta)
                                    │
                        ┌───────────┴───────────┐
                   dbt (Athena)            SageMaker
                        │                       │
                  S3 (Gold/Delta)          Surge Model
                        │
                   QuickSight
```

</details>

---

### Exercise 4: ETL vs ELT

For each scenario, determine whether ETL or ELT is more appropriate:

1. Loading cleaned customer records into a Redshift data warehouse
2. Ingesting raw IoT sensor data into a data lake for exploration
3. Migrating an on-premises Oracle database to Aurora
4. Building a real-time analytics dashboard from streaming data

<details>
<summary>Solution</summary>

1. **ETL** — Transform before loading to save warehouse compute/storage costs
2. **ELT** — Load raw data first, transform later based on evolving analysis needs
3. **ETL** — Schema conversion and cleaning needed before loading into new engine
4. **ELT** — Stream raw data in, transform in-place for real-time insights

</details>

---

## Key Takeaways

- **Data lakes** store raw data cheaply (S3, ADLS, GCS); **data warehouses** (Redshift, Synapse, BigQuery) optimize for structured SQL queries.
- The **data lakehouse** (Delta Lake, Apache Iceberg) combines both — ACID transactions and schema enforcement on top of object storage.
- Organize your data lake into **Bronze → Silver → Gold** zones for progressive data quality.
- **Parquet** is the default format for analytics workloads — columnar, compressed, and widely supported.
- **ELT** is the modern approach: load raw data first, transform inside the target system. **ETL** is still valid for warehouse-first architectures.
- A **data catalog** (Glue Catalog, Purview, Dataplex) is essential for discoverability, governance, and lineage tracking.
- Design pipelines with **clear separation of concerns**: ingestion, storage, processing, serving, and orchestration.
