---
title: "Apache Spark"
---

# Apache Spark

Apache Spark is a unified analytics engine for large-scale data processing. It provides an interface for programming entire clusters with implicit data parallelism and fault tolerance. Spark replaced MapReduce as the dominant big data processing framework due to its speed, ease of use, and versatility.

---

## Why Spark Replaced MapReduce

MapReduce revolutionized big data processing, but it had significant limitations that Spark addressed:

| Limitation (MapReduce) | Spark Solution |
|------------------------|----------------|
| Disk I/O between stages | In-memory computation |
| Only map and reduce primitives | Rich set of transformations |
| Separate systems for batch/stream/ML | Unified engine |
| Verbose Java code | Concise APIs (Scala, Python, Java, R) |
| Slow iterative algorithms | Caching intermediate results |
| No interactive queries | Spark Shell / Notebooks |

### Performance Comparison

```
Job: Word Count on 100 GB dataset

MapReduce:
  - Map phase: write intermediate to disk
  - Shuffle: read from disk, sort, write again
  - Reduce phase: read from disk, aggregate
  - Total: ~30 minutes

Spark (in-memory):
  - Load data into memory (RDDs)
  - Transform and aggregate in-memory
  - Total: ~3 minutes (10x faster)

Iterative ML algorithm (10 iterations):
  MapReduce: 170 minutes (re-reads data each iteration)
  Spark:      15 minutes (caches data in memory)
```

Spark achieves **10–100x** speedup over MapReduce for most workloads by keeping data in memory between operations.

---

## RDD: Resilient Distributed Datasets

An RDD is Spark's fundamental data abstraction — an immutable, distributed collection of objects that can be processed in parallel.

### RDD Properties

| Property | Description |
|----------|-------------|
| **Resilient** | Fault-tolerant via lineage graph |
| **Distributed** | Partitioned across cluster nodes |
| **Dataset** | Collection of partitioned data |
| **Immutable** | Cannot be modified after creation |
| **Lazy** | Transformations are not executed immediately |

### Creating RDDs

```python
from pyspark import SparkContext

sc = SparkContext("local", "RDD Example")

# From a collection
rdd1 = sc.parallelize([1, 2, 3, 4, 5], numSlices=3)

# From a file
rdd2 = sc.textFile("hdfs://data/logs.txt")

# From another RDD (transformation)
rdd3 = rdd1.map(lambda x: x * 2)
```

### Transformations vs Actions

Spark operations on RDDs fall into two categories:

**Transformations** — create a new RDD from an existing one (lazy):

| Transformation | Description | Example |
|---------------|-------------|---------|
| `map(f)` | Apply function to each element | `rdd.map(lambda x: x*2)` |
| `filter(f)` | Keep elements where f is true | `rdd.filter(lambda x: x>3)` |
| `flatMap(f)` | Map then flatten results | `rdd.flatMap(lambda x: x.split())` |
| `reduceByKey(f)` | Aggregate values by key | `rdd.reduceByKey(lambda a,b: a+b)` |
| `groupByKey()` | Group values by key | `rdd.groupByKey()` |
| `join(other)` | Inner join two pair RDDs | `rdd1.join(rdd2)` |
| `distinct()` | Remove duplicates | `rdd.distinct()` |
| `union(other)` | Merge two RDDs | `rdd1.union(rdd2)` |

**Actions** — trigger computation and return a result:

| Action | Description | Example |
|--------|-------------|---------|
| `collect()` | Return all elements to driver | `rdd.collect()` |
| `count()` | Count elements | `rdd.count()` |
| `first()` | Return first element | `rdd.first()` |
| `take(n)` | Return first n elements | `rdd.take(5)` |
| `reduce(f)` | Aggregate all elements | `rdd.reduce(lambda a,b: a+b)` |
| `saveAsTextFile(path)` | Write to file system | `rdd.saveAsTextFile("out/")` |
| `foreach(f)` | Apply function (side effects) | `rdd.foreach(print)` |

### Lazy Evaluation

Transformations are **not** executed when defined. Spark builds a DAG (Directed Acyclic Graph) of transformations and executes them only when an action is called:

```python
# Nothing happens yet — just building the DAG
rdd = sc.textFile("data.txt")          # Transformation
words = rdd.flatMap(lambda l: l.split()) # Transformation
pairs = words.map(lambda w: (w, 1))      # Transformation
counts = pairs.reduceByKey(lambda a, b: a + b)  # Transformation

# NOW Spark executes the entire pipeline
counts.collect()  # Action — triggers execution
```

Benefits of lazy evaluation:
- Spark can **optimize** the execution plan
- Unnecessary computations are **skipped**
- Transformations can be **pipelined** (fused together)

### Lineage (Fault Tolerance)

Each RDD remembers the sequence of transformations that created it. If a partition is lost, Spark can **recompute** it from the original data using the lineage graph:

```
textFile("data.txt") → flatMap(split) → map(word,1) → reduceByKey(+)
       ↓                    ↓                ↓              ↓
    RDD-1               RDD-2            RDD-3          RDD-4

If partition 2 of RDD-3 is lost:
  → Spark traces lineage back
  → Recomputes only partition 2 of RDD-1, RDD-2, RDD-3
  → No full recomputation needed
```

---

## Spark Architecture

```
┌─────────────────────────────────────────────────┐
│                  Driver Program                   │
│  ┌───────────────────────────────────────────┐  │
│  │           SparkContext / SparkSession       │  │
│  │  - Creates RDDs / DataFrames               │  │
│  │  - Defines transformations & actions       │  │
│  │  - Builds DAG, submits jobs                │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Cluster Manager │
              │  (YARN/K8s/     │
              │   Standalone)    │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐┌──────────────┐┌──────────────┐
│  Executor 1  ││  Executor 2  ││  Executor 3  │
│ ┌──────────┐ ││ ┌──────────┐ ││ ┌──────────┐ │
│ │  Task 1  │ ││ │  Task 3  │ ││ │  Task 5  │ │
│ │  Task 2  │ ││ │  Task 4  │ ││ │  Task 6  │ │
│ └──────────┘ ││ └──────────┘ ││ └──────────┘ │
│   Cache      ││   Cache      ││   Cache      │
└──────────────┘└──────────────┘└──────────────┘
```

### Components

| Component | Role |
|-----------|------|
| **Driver** | Runs the main program, creates SparkContext, builds DAG |
| **SparkContext** | Entry point; coordinates with cluster manager |
| **Cluster Manager** | Allocates resources (executors) across the cluster |
| **Executor** | JVM process on worker node; runs tasks, stores cached data |
| **Task** | Unit of work sent to an executor (processes one partition) |

### Job Execution Flow

1. User submits application with a `SparkSession`
2. Driver analyzes transformations and builds a **DAG**
3. DAG is split into **stages** at shuffle boundaries
4. Each stage is split into **tasks** (one per partition)
5. Tasks are scheduled on executors by the cluster manager
6. Results flow back to the driver

---

## Spark SQL and DataFrames

DataFrames provide a higher-level abstraction over RDDs with schema information and SQL-like operations.

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, count

spark = SparkSession.builder \
    .appName("Spark SQL Example") \
    .getOrCreate()

# Read structured data
df = spark.read.json("employees.json")

# Show schema
df.printSchema()
# root
#  |-- name: string
#  |-- department: string
#  |-- salary: long

# DataFrame API
result = df.filter(col("salary") > 50000) \
           .groupBy("department") \
           .agg(avg("salary").alias("avg_salary"),
                count("*").alias("num_employees")) \
           .orderBy("avg_salary", ascending=False)

result.show()

# SQL interface
df.createOrReplaceTempView("employees")
spark.sql("""
    SELECT department, AVG(salary) as avg_salary, COUNT(*) as num_employees
    FROM employees
    WHERE salary > 50000
    GROUP BY department
    ORDER BY avg_salary DESC
""").show()
```

### DataFrame vs RDD

| Feature | RDD | DataFrame |
|---------|-----|-----------|
| Optimization | None (opaque) | Catalyst optimizer |
| Schema | No schema | Named columns with types |
| Serialization | Java serialization | Tungsten binary format |
| API | Functional (map/filter) | Declarative (SQL-like) |
| Performance | Slower | 2–10x faster |
| Language parity | Varies | Same performance all languages |

---

## Spark Streaming / Structured Streaming

### Legacy DStreams (Spark Streaming)

Discretized Streams process data in micro-batches:

```python
from pyspark.streaming import StreamingContext

ssc = StreamingContext(sc, batchDuration=1)  # 1-second batches
lines = ssc.socketTextStream("localhost", 9999)
words = lines.flatMap(lambda line: line.split())
counts = words.map(lambda w: (w, 1)).reduceByKey(lambda a, b: a + b)
counts.pprint()
ssc.start()
ssc.awaitTermination()
```

### Structured Streaming (Modern)

Treats streaming data as an unbounded table:

```python
# Read from Kafka
stream_df = spark.readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "broker:9092") \
    .option("subscribe", "events") \
    .load()

# Process
events = stream_df.selectExpr("CAST(value AS STRING) as json") \
    .select(from_json("json", schema).alias("data")) \
    .select("data.*")

# Windowed aggregation
windowed = events \
    .withWatermark("timestamp", "10 minutes") \
    .groupBy(window("timestamp", "5 minutes"), "event_type") \
    .count()

# Write results
query = windowed.writeStream \
    .outputMode("update") \
    .format("console") \
    .start()
```

| Output Mode | Description |
|-------------|-------------|
| `append` | Only new rows added to result table |
| `complete` | Entire result table output each trigger |
| `update` | Only changed rows output |

---

## MLlib for Machine Learning

Spark MLlib provides scalable machine learning algorithms:

```python
from pyspark.ml import Pipeline
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.classification import LogisticRegression
from pyspark.ml.evaluation import BinaryClassificationEvaluator

# Prepare features
assembler = VectorAssembler(
    inputCols=["age", "income", "credit_score"],
    outputCol="raw_features"
)
scaler = StandardScaler(inputCol="raw_features", outputCol="features")

# Model
lr = LogisticRegression(featuresCol="features", labelCol="label")

# Pipeline
pipeline = Pipeline(stages=[assembler, scaler, lr])

# Train
train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)
model = pipeline.fit(train_df)

# Evaluate
predictions = model.transform(test_df)
evaluator = BinaryClassificationEvaluator()
auc = evaluator.evaluate(predictions)
print(f"AUC: {auc:.4f}")
```

### Available Algorithms

| Category | Algorithms |
|----------|-----------|
| Classification | Logistic Regression, Decision Trees, Random Forest, GBT, SVM |
| Regression | Linear Regression, Decision Trees, Random Forest, GBT |
| Clustering | K-Means, Bisecting K-Means, GMM, LDA |
| Recommendation | ALS (Alternating Least Squares) |
| Feature Engineering | PCA, Word2Vec, TF-IDF, Tokenizer |

---

## GraphX for Graph Processing

GraphX provides a graph computation API built on RDDs:

```scala
import org.apache.spark.graphx._

// Create vertices and edges
val vertices = sc.parallelize(Seq(
  (1L, "Alice"), (2L, "Bob"), (3L, "Charlie")
))
val edges = sc.parallelize(Seq(
  Edge(1L, 2L, "follows"),
  Edge(2L, 3L, "follows"),
  Edge(3L, 1L, "follows")
))

// Build graph
val graph = Graph(vertices, edges)

// PageRank
val ranks = graph.pageRank(0.001).vertices
ranks.collect().foreach { case (id, rank) =>
  println(s"Vertex $id has rank $rank")
}

// Connected Components
val cc = graph.connectedComponents().vertices

// Triangle Count
val triCounts = graph.triangleCount().vertices
```

---

## Memory Management

Spark uses a unified memory model split between execution and storage:

```
┌──────────────────────────────────────┐
│          JVM Heap (Executor)          │
├──────────────────────────────────────┤
│  Reserved Memory (300 MB fixed)       │
├──────────────────────────────────────┤
│  User Memory (1 - spark.memory.fraction)  │
│  - User data structures               │
│  - Internal metadata                   │
├──────────────────────────────────────┤
│  Unified Memory (spark.memory.fraction = 0.6) │
│  ┌────────────────┬─────────────────┐ │
│  │  Storage Memory │ Execution Memory│ │
│  │  (cached RDDs)  │ (shuffles, joins│ │
│  │                 │  sorts, aggs)   │ │
│  │  ◄── boundary can shift ──►      │ │
│  └────────────────┴─────────────────┘ │
└──────────────────────────────────────┘
```

| Configuration | Default | Description |
|---------------|---------|-------------|
| `spark.memory.fraction` | 0.6 | Fraction of heap for unified memory |
| `spark.memory.storageFraction` | 0.5 | Initial split within unified memory |
| `spark.executor.memory` | 1g | Total executor heap size |
| `spark.driver.memory` | 1g | Driver heap size |

---

## Deployment Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Local** | Single JVM, multi-threaded | Development/testing |
| **Standalone** | Spark's built-in cluster manager | Simple clusters |
| **YARN** | Hadoop's resource manager | Existing Hadoop clusters |
| **Kubernetes** | Container orchestration | Cloud-native deployments |
| **Mesos** | General-purpose cluster manager | Multi-framework clusters |

```bash
# Local mode
spark-submit --master local[4] app.py

# Standalone cluster
spark-submit --master spark://master:7077 app.py

# YARN cluster mode
spark-submit --master yarn --deploy-mode cluster app.py

# Kubernetes
spark-submit --master k8s://https://k8s-api:6443 \
  --deploy-mode cluster \
  --conf spark.kubernetes.container.image=spark:3.5 \
  app.py
```

---

## PySpark Complete Example

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, split, lower, desc

# Initialize
spark = SparkSession.builder \
    .appName("Word Frequency Analysis") \
    .config("spark.sql.shuffle.partitions", "8") \
    .getOrCreate()

# Read text files
text_df = spark.read.text("hdfs:///data/books/*.txt")

# Process: split into words, clean, count
word_counts = text_df \
    .select(explode(split(col("value"), "\\s+")).alias("word")) \
    .select(lower(col("word")).alias("word")) \
    .filter(col("word").rlike("^[a-z]+$")) \
    .groupBy("word") \
    .count() \
    .orderBy(desc("count"))

# Cache for multiple uses
word_counts.cache()

# Show top 20 words
print("=== Top 20 Words ===")
word_counts.show(20)

# Total unique words
total = word_counts.count()
print(f"Total unique words: {total}")

# Save results
word_counts.write \
    .mode("overwrite") \
    .parquet("hdfs:///output/word_counts")

spark.stop()
```

---

## Spark Optimization

### 1. Partitioning

```python
# Repartition for parallelism
df = df.repartition(200)  # Shuffle to 200 partitions

# Coalesce to reduce partitions (no shuffle)
df = df.coalesce(50)

# Partition by key for joins
df = df.repartition(100, "user_id")
```

### 2. Caching and Persistence

```python
from pyspark import StorageLevel

# Cache in memory (default)
df.cache()  # Same as persist(MEMORY_ONLY)

# Persist with specific level
df.persist(StorageLevel.MEMORY_AND_DISK)
df.persist(StorageLevel.DISK_ONLY)

# Unpersist when done
df.unpersist()
```

| Storage Level | Description |
|---------------|-------------|
| `MEMORY_ONLY` | Deserialized objects in JVM heap |
| `MEMORY_AND_DISK` | Spill to disk if memory is full |
| `MEMORY_ONLY_SER` | Serialized (compact, slower access) |
| `DISK_ONLY` | Store only on disk |
| `OFF_HEAP` | Store in off-heap memory (Tungsten) |

### 3. Broadcast Variables

```python
# Small lookup table — broadcast to all executors
country_codes = {"US": "United States", "UK": "United Kingdom", ...}
broadcast_codes = spark.sparkContext.broadcast(country_codes)

# Use in transformation (avoids shipping data per task)
def enrich(row):
    return row + (broadcast_codes.value.get(row.country, "Unknown"),)

# Broadcast join (small table joined with large table)
from pyspark.sql.functions import broadcast

large_df.join(broadcast(small_df), "key")  # Forces broadcast
```

### 4. Avoiding Shuffles

```python
# BAD: groupByKey collects all values then reduces
rdd.groupByKey().mapValues(sum)

# GOOD: reduceByKey aggregates locally first
rdd.reduceByKey(lambda a, b: a + b)

# BAD: Multiple joins without shared partitioning
df1.join(df2, "key").join(df3, "key")

# GOOD: Co-partition before joining
df1 = df1.repartition("key")
df2 = df2.repartition("key")
df1.join(df2, "key")
```

### 5. Key Configuration Tuning

| Parameter | Recommendation |
|-----------|---------------|
| `spark.sql.shuffle.partitions` | 2–3x number of cores |
| `spark.default.parallelism` | 2–3x total cores |
| `spark.executor.cores` | 4–5 cores per executor |
| `spark.executor.memory` | 4–8 GB per executor |
| `spark.sql.autoBroadcastJoinThreshold` | 10–100 MB |

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| RDD | Immutable distributed collection with lineage for fault tolerance |
| Lazy Evaluation | Transformations build a DAG; actions trigger execution |
| DataFrames | Schema-aware, optimized alternative to RDDs |
| Catalyst | Query optimizer that transforms logical plans to physical plans |
| Tungsten | Memory management and code generation engine |
| Structured Streaming | Stream as unbounded table with exactly-once semantics |
| MLlib | Distributed ML with pipelines and cross-validation |
| Deployment | Standalone, YARN, Kubernetes, or Mesos |

---

## Exercises

1. **RDD Operations**: Write a PySpark program that reads a CSV of sales data and computes the total revenue per product category using RDD transformations. Compare execution time with and without `cache()`.

2. **DataFrame Query**: Using Spark SQL, write a query that finds the top 5 departments by average salary from an employee dataset. Implement it using both the DataFrame API and raw SQL.

3. **Streaming Pipeline**: Design a Structured Streaming application that reads JSON events from a Kafka topic, applies a 5-minute tumbling window, and writes aggregated counts to a Parquet sink.

4. **Optimization Challenge**: Given this inefficient code, identify and fix all performance issues:
   ```python
   rdd = sc.textFile("huge_file.txt")
   words = rdd.flatMap(lambda x: x.split())
   pairs = words.map(lambda w: (w, 1))
   grouped = pairs.groupByKey()
   counts = grouped.mapValues(lambda vals: sum(vals))
   result = counts.collect()
   for word, count in sorted(result, key=lambda x: -x[1])[:10]:
       print(f"{word}: {count}")
   ```

5. **Architecture Design**: Draw the execution plan for a Spark job that joins a 500 GB table with a 50 MB lookup table and writes the result partitioned by date. Which join strategy should Spark use and why?
