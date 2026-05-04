---
title: "MapReduce"
---

# MapReduce

MapReduce is a programming model for processing large datasets in parallel across a distributed cluster. It simplifies big data computation by breaking work into two phases: **map** and **reduce**.

---

## The Big Data Processing Challenge

Processing terabytes or petabytes of data on a single machine is impractical. Distributed processing introduces several challenges:

| Challenge | Description |
|-----------|-------------|
| Parallelization | How to split work across thousands of machines |
| Data distribution | How to move data to where computation happens |
| Fault tolerance | How to handle machine failures gracefully |
| Load balancing | How to ensure all machines do equal work |
| Programming model | How to make distributed programming accessible |

Before MapReduce, writing distributed data processing programs required expertise in networking, fault tolerance, and concurrency — even for simple tasks like counting words.

---

## The MapReduce Paradigm

MapReduce abstracts distributed computation into two user-defined functions:

### Map Phase

The **map** function processes input key-value pairs and produces intermediate key-value pairs:

```
map(key, value) → list(intermediate_key, intermediate_value)
```

The mapper runs independently on each chunk of input data. It transforms or filters records one at a time.

### Shuffle and Sort Phase

The framework automatically:

1. **Collects** all intermediate pairs from all mappers
2. **Groups** pairs by intermediate key
3. **Sorts** the groups by key
4. **Transfers** each group to the appropriate reducer (called "shuffling")

This phase is handled entirely by the framework — no user code required.

### Reduce Phase

The **reduce** function processes all values associated with a single intermediate key:

```
reduce(intermediate_key, list(intermediate_values)) → list(output_value)
```

The reducer aggregates, summarizes, or combines values for each unique key.

---

## Google's MapReduce Paper (2004)

Jeff Dean and Sanjay Ghemawat published "MapReduce: Simplified Data Processing on Large Clusters" in 2004. Key contributions:

| Aspect | Detail |
|--------|--------|
| Motivation | Hundreds of computations at Google were conceptually simple but required complex distributed code |
| Insight | Most computations could be expressed as map and reduce operations |
| Scale | Thousands of machines processing petabytes daily |
| Impact | Enabled non-distributed-systems experts to use clusters effectively |

The paper described Google's internal implementation running on commodity hardware with the Google File System (GFS) for storage.

---

## Word Count Example in Detail

Word count is the "Hello World" of MapReduce. Given a collection of documents, count how many times each word appears.

### Input

```
Document 1: "the cat sat on the mat"
Document 2: "the dog sat on the log"
```

### Map Phase

Each document is processed by a mapper:

```python
def map(document_id, document_text):
    words = document_text.split()
    for word in words:
        emit(word, 1)
```

**Mapper 1 output:**
```
("the", 1), ("cat", 1), ("sat", 1), ("on", 1), ("the", 1), ("mat", 1)
```

**Mapper 2 output:**
```
("the", 1), ("dog", 1), ("sat", 1), ("on", 1), ("the", 1), ("log", 1)
```

### Shuffle and Sort Phase

The framework groups by key:

```
"cat"  → [1]
"dog"  → [1]
"log"  → [1]
"mat"  → [1]
"on"   → [1, 1]
"sat"  → [1, 1]
"the"  → [1, 1, 1, 1]
```

### Reduce Phase

Each reducer sums the values for its assigned keys:

```python
def reduce(word, counts):
    total = sum(counts)
    emit(word, total)
```

**Final output:**
```
("cat", 1), ("dog", 1), ("log", 1), ("mat", 1),
("on", 2), ("sat", 2), ("the", 4)
```

---

## MapReduce Execution Pipeline

A complete MapReduce job involves multiple stages and components:

### Input Splits

The input data is divided into fixed-size **splits** (typically 64–128 MB). Each split is assigned to one mapper.

```
Input File (1 GB)
  → Split 1 (128 MB) → Mapper 1
  → Split 2 (128 MB) → Mapper 2
  → Split 3 (128 MB) → Mapper 3
  → ...
  → Split 8 (128 MB) → Mapper 8
```

### Mappers

- Each mapper processes one input split
- Mappers run in parallel across the cluster
- Output is written to local disk (not distributed storage)
- Number of mappers = number of input splits

### Combiners

A **combiner** is a local reducer that runs on the mapper's output before the shuffle:

```python
# Combiner (same logic as reducer, runs locally)
def combine(word, local_counts):
    emit(word, sum(local_counts))
```

| Without Combiner | With Combiner |
|-----------------|---------------|
| Mapper emits: ("the", 1), ("the", 1), ("the", 1) | Mapper emits after combining: ("the", 3) |
| 3 records transferred over network | 1 record transferred over network |

Combiners reduce network traffic significantly but are only applicable when the reduce function is commutative and associative.

### Partitioners

The **partitioner** determines which reducer receives each intermediate key:

```python
def partition(key, num_reducers):
    return hash(key) % num_reducers
```

The default hash partitioner distributes keys evenly. Custom partitioners handle skewed data or ordering requirements.

### Reducers

- Each reducer processes all values for its assigned keys
- Number of reducers is user-configurable
- Output is written to distributed storage (HDFS/GFS)
- Reducers start only after all mappers complete

### Execution Flow Diagram

```
[Input] → [Split] → [Map] → [Combine] → [Partition] → [Shuffle/Sort] → [Reduce] → [Output]
                      ↓                        ↓                            ↓
                  (parallel)              (network transfer)            (parallel)
```

---

## Fault Tolerance in MapReduce

MapReduce achieves fault tolerance through simple but effective mechanisms:

### Task Re-execution

| Failure Type | Recovery Strategy |
|-------------|-------------------|
| Mapper fails | Re-run the map task on another node (input is on distributed storage) |
| Reducer fails | Re-run the reduce task (mapper outputs are still on disk) |
| Mapper completes but node dies before shuffle | Re-run mapper (local output is lost) |

Key insight: map and reduce functions are **deterministic** and **side-effect free**, making re-execution safe.

### The Master Node

The master (or job tracker) monitors all tasks:

```
Master responsibilities:
1. Track state of each map/reduce task (idle, in-progress, completed)
2. Detect failed workers via heartbeat timeouts
3. Reschedule failed tasks on healthy workers
4. Propagate mapper output locations to reducers
```

If the master fails, the entire job is restarted (single point of failure in original design).

### Speculative Execution

**Stragglers** — machines that are slow due to hardware issues, resource contention, or bad disks — can delay entire jobs.

Solution: When a task is significantly slower than average, launch a **backup copy** on another node. Use whichever finishes first.

```
Normal task:     [████████████████████] 100% (slow machine)
Speculative:     [████████████] 100%         (faster machine) ← use this result
```

Speculative execution typically reduces job completion time by 30–40%.

### Handling Skewed Data

When certain keys have vastly more values than others, reducers handling those keys become bottlenecks:

```
Key "the"     → 10 million values  (slow reducer)
Key "aardvark" → 3 values          (fast reducer)
```

Solutions include custom partitioners and two-phase reduce strategies.

---

## Hadoop MapReduce

Apache Hadoop is the open-source implementation of MapReduce, built on HDFS (Hadoop Distributed File System).

### YARN (Yet Another Resource Negotiator)

Hadoop 2.x introduced YARN to separate resource management from job scheduling:

| Component | Role |
|-----------|------|
| ResourceManager | Global resource allocation across the cluster |
| NodeManager | Per-node agent managing containers |
| ApplicationMaster | Per-job coordinator (requests resources, monitors tasks) |
| Container | Allocated resources (CPU, memory) for a task |

### Resource Management

```
Cluster (100 nodes, 16 cores / 64 GB each)
  └── ResourceManager
       ├── ApplicationMaster (Job 1) → 50 map containers, 10 reduce containers
       ├── ApplicationMaster (Job 2) → 30 map containers, 5 reduce containers
       └── ApplicationMaster (Job 3) → 20 map containers, 5 reduce containers
```

YARN enables multiple MapReduce jobs (and other frameworks) to share cluster resources.

### A Hadoop MapReduce Job in Java

```java
public class WordCount {

    public static class TokenizerMapper
        extends Mapper<LongWritable, Text, Text, IntWritable> {

        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        public void map(LongWritable key, Text value, Context context)
            throws IOException, InterruptedException {
            StringTokenizer itr = new StringTokenizer(value.toString());
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken());
                context.write(word, one);
            }
        }
    }

    public static class IntSumReducer
        extends Reducer<Text, IntWritable, Text, IntWritable> {

        public void reduce(Text key, Iterable<IntWritable> values, Context context)
            throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) {
                sum += val.get();
            }
            context.write(key, new IntWritable(sum));
        }
    }

    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "word count");
        job.setJarByClass(WordCount.class);
        job.setMapperClass(TokenizerMapper.class);
        job.setCombinerClass(IntSumReducer.class);
        job.setReducerClass(IntSumReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);
        FileInputFormat.addInputPath(job, new Path(args[0]));
        FileOutputFormat.setOutputPath(job, new Path(args[1]));
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
```

---

## Limitations of MapReduce

Despite its success, MapReduce has significant limitations:

### Disk I/O Overhead

Every stage reads from and writes to disk:

```
[Disk] → Map → [Disk] → Shuffle → [Disk] → Reduce → [Disk]
```

For iterative algorithms (like PageRank or K-means), this means reading and writing the entire dataset for every iteration — extremely wasteful.

### Iterative Algorithm Problem

```
Iteration 1: Read from HDFS → Map → Reduce → Write to HDFS
Iteration 2: Read from HDFS → Map → Reduce → Write to HDFS
Iteration 3: Read from HDFS → Map → Reduce → Write to HDFS
...
(each iteration scans the full dataset from disk)
```

Machine learning algorithms often require 10–100+ iterations, making MapReduce impractical.

### Other Limitations

| Limitation | Impact |
|-----------|--------|
| High latency | Not suitable for real-time or interactive queries |
| Rigid two-phase model | Complex pipelines require chaining multiple jobs |
| No in-memory caching | Cannot reuse intermediate data across iterations |
| Batch-only | Cannot process streaming data |
| Verbose API | Simple operations require substantial boilerplate |

---

## MapReduce vs Modern Alternatives

| Feature | MapReduce | Apache Spark | Apache Flink |
|---------|-----------|--------------|--------------|
| Processing model | Batch only | Batch + interactive | Stream + batch |
| Data storage | Disk between stages | In-memory (RDDs) | In-memory (state) |
| Iterative algorithms | Very slow | Fast (caching) | Fast (iteration) |
| Latency | High (minutes) | Low (seconds) | Very low (ms) |
| Fault tolerance | Task re-execution | RDD lineage | Checkpointing |
| Ease of use | Verbose Java API | Concise (Scala/Python) | SQL + DataStream API |
| Maturity | Very mature | Mature | Mature |

### Why Spark Replaced MapReduce for Most Use Cases

```
MapReduce iterative job:   Disk → Map → Disk → Reduce → Disk  (repeat N times)
Spark iterative job:       Disk → Transform → Cache in RAM → Transform → ... → Disk
                                                    ↑
                                          (reuse cached data across iterations)
```

Spark is typically 10–100x faster than MapReduce for iterative workloads.

---

## When MapReduce Is Still Relevant

Despite its limitations, MapReduce remains useful in specific scenarios:

| Scenario | Why MapReduce Works |
|----------|-------------------|
| Very large single-pass ETL jobs | Disk-based approach handles data larger than cluster RAM |
| Extremely large clusters (10,000+ nodes) | Battle-tested stability at massive scale |
| Existing Hadoop infrastructure | Migration cost may not justify switching |
| Simple aggregation tasks | Overhead of newer frameworks may be unnecessary |
| Regulatory/compliance requirements | Proven, auditable processing model |

### The MapReduce Mental Model Lives On

Even in modern frameworks, the map-shuffle-reduce pattern persists:

- **Spark**: `rdd.map(...).reduceByKey(...)` — same pattern, in-memory
- **Flink**: `dataStream.map(...).keyBy(...).reduce(...)` — same pattern, streaming
- **SQL engines**: `SELECT key, SUM(val) GROUP BY key` — map + reduce under the hood

Understanding MapReduce is foundational for working with any distributed data processing system.

---

## Exercises

**Exercise 1: Design a MapReduce Job**

Design the map and reduce functions for computing the average temperature per city from weather station readings. Input format: `(station_id, city, temperature, timestamp)`.

<details>
<summary>Solution</summary>

```python
def map(station_id, record):
    city = record.city
    temperature = record.temperature
    # Emit city as key, temperature and count for averaging
    emit(city, (temperature, 1))

def combine(city, pairs):
    total_temp = sum(t for t, c in pairs)
    total_count = sum(c for t, c in pairs)
    emit(city, (total_temp, total_count))

def reduce(city, pairs):
    total_temp = sum(t for t, c in pairs)
    total_count = sum(c for t, c in pairs)
    average = total_temp / total_count
    emit(city, average)
```

Note: You cannot simply average the averages — you must track sums and counts.

</details>

**Exercise 2: Identify the Bottleneck**

A MapReduce job processing web server logs takes 2 hours. 95% of mappers finish in 10 minutes, but 5% take 90 minutes. The reduce phase takes only 5 minutes. What is the likely cause and solution?

<details>
<summary>Solution</summary>

The likely cause is **data skew in input splits** — some log files are much larger than others, or certain mappers are on slow nodes (stragglers).

Solutions:
1. Enable **speculative execution** to launch backup tasks for slow mappers
2. Ensure input splits are **uniformly sized** (rebalance input files)
3. Check for **hot nodes** with hardware issues
4. Increase the number of mappers (smaller splits per mapper)

</details>

**Exercise 3: Combiner Applicability**

For each operation, state whether a combiner can be used:

| Operation | Combiner? |
|-----------|-----------|
| Sum | ? |
| Average | ? |
| Maximum | ? |
| Median | ? |
| Count distinct | ? |

<details>
<summary>Solution</summary>

| Operation | Combiner? | Reason |
|-----------|-----------|--------|
| Sum | Yes | Associative and commutative |
| Average | No | Average of averages ≠ global average |
| Maximum | Yes | Max of maxes = global max |
| Median | No | Cannot compute global median from local medians |
| Count distinct | No | Union of local sets needed, not simple aggregation |

For average, use the sum+count trick from Exercise 1 to make it combiner-friendly.

</details>

**Exercise 4: Fault Tolerance Scenario**

A cluster runs a MapReduce job with 1000 mappers and 50 reducers. After all mappers complete but during the shuffle phase, 3 nodes that ran mappers crash (losing their local output). What happens?

<details>
<summary>Solution</summary>

1. The master detects the failed nodes via missed heartbeats
2. The map tasks that ran on those 3 nodes are marked as **needing re-execution**
3. Those map tasks are rescheduled on other healthy nodes
4. The mappers re-read their input splits from HDFS (which has 3 replicas)
5. The re-executed mappers produce their output again
6. The shuffle phase resumes, pulling data from the new mapper locations
7. Reducers that already received data from the failed nodes discard it and re-fetch

The job continues without restarting from scratch — only the affected map tasks are re-run.

</details>

---

## Summary

- MapReduce splits big data processing into **map** (transform) and **reduce** (aggregate) phases
- The framework handles parallelization, data distribution, and fault tolerance automatically
- **Combiners** reduce network traffic; **partitioners** control data routing to reducers
- Fault tolerance relies on deterministic re-execution and speculative execution for stragglers
- Hadoop/YARN provides the open-source implementation with resource management
- Disk I/O between stages makes MapReduce slow for iterative algorithms
- Modern frameworks (Spark, Flink) improve on MapReduce with in-memory processing
- The map-reduce pattern remains foundational in all distributed data processing systems
