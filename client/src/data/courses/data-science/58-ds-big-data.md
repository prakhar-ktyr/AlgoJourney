---
title: Big Data Tools
---

# Big Data Tools

When your data is too large for Pandas to handle in memory, you need specialized tools designed for big data processing.

This lesson covers modern alternatives that scale from gigabytes to terabytes.

---

## When Pandas Isn't Enough

Pandas loads everything into RAM. This works until it doesn't:

| Sign | Problem |
|------|---------|
| `MemoryError` | Data doesn't fit in RAM |
| 30+ minutes for a groupby | Processing is too slow |
| Laptop fans spinning constantly | CPU bottleneck on single core |
| Need real-time processing | Pandas is batch-only |

**Rule of thumb:** If your data is > 50% of your RAM, Pandas will struggle.

---

## The Big Data Landscape

| Tool | Best For | Speed | Ease of Use |
|------|----------|-------|-------------|
| **Pandas** | < 1 GB | Baseline | ★★★★★ |
| **Polars** | 1–100 GB | 10–100× faster | ★★★★☆ |
| **DuckDB** | 1–100 GB (SQL) | 10–50× faster | ★★★★★ |
| **Dask** | 1–100 GB (distributed) | 2–10× faster | ★★★★☆ |
| **PySpark** | 100 GB–PB (cluster) | Scales horizontally | ★★★☆☆ |
| **Vaex** | 1–1 TB (memory-mapped) | Fast for exploration | ★★★☆☆ |

---

## Dask: Parallel Pandas

**Dask** extends Pandas to work with larger-than-memory data by splitting it into partitions and processing them in parallel.

### Installation

```python
# pip install dask[complete]
```

### Basic Usage

```python
import dask.dataframe as dd

# Read a large CSV (lazy — doesn't load into memory)
ddf = dd.read_csv("large_file.csv")

# Same Pandas API — but operations are lazy
print(ddf.columns)
print(f"Number of partitions: {ddf.npartitions}")

# Operations are built up as a task graph
result = ddf.groupby("category")["revenue"].mean()

# .compute() triggers execution
print(result.compute())
```

### Dask vs Pandas: Side by Side

```python
import dask.dataframe as dd
import pandas as pd
import numpy as np

# Create a sample large dataset
n_rows = 5_000_000
pd_df = pd.DataFrame({
    "user_id": np.random.randint(1, 100000, n_rows),
    "category": np.random.choice(["A", "B", "C", "D", "E"], n_rows),
    "amount": np.random.uniform(1, 1000, n_rows),
    "date": pd.date_range("2020-01-01", periods=n_rows, freq="s")
})

# Convert to Dask DataFrame (4 partitions)
ddf = dd.from_pandas(pd_df, npartitions=4)

# --- Pandas way ---
result_pd = pd_df.groupby("category")["amount"].agg(["mean", "sum", "count"])
print("Pandas result:")
print(result_pd)

# --- Dask way (same API, parallel execution) ---
result_dask = ddf.groupby("category")["amount"].agg(["mean", "sum", "count"])
print("\nDask result:")
print(result_dask.compute())

# Filtering
big_transactions = ddf[ddf["amount"] > 900]
print(f"\nBig transactions: {len(big_transactions)}")

# Describe (summary statistics)
print(ddf["amount"].describe().compute())
```

### Key Dask Features

```python
import dask.dataframe as dd

# Read multiple files at once
ddf = dd.read_csv("data/sales_*.csv")

# Lazy operations build a task graph
filtered = ddf[ddf["amount"] > 100]
grouped = filtered.groupby("region")["amount"].sum()

# Persist in memory (for repeated access)
grouped = grouped.persist()

# Write results back to disk
grouped.compute().to_csv("output/summary.csv")

# Progress bar
from dask.diagnostics import ProgressBar
with ProgressBar():
    result = grouped.compute()
```

---

## Polars: Blazing Fast DataFrames

**Polars** is written in Rust and is often 10–100× faster than Pandas.

### Installation

```python
# pip install polars
```

### Basic Usage

```python
import polars as pl

# Read CSV
df = pl.read_csv("data.csv")

# Display info
print(df.shape)
print(df.schema)
print(df.head())

# Basic operations
result = (
    df
    .filter(pl.col("age") > 25)
    .group_by("city")
    .agg([
        pl.col("salary").mean().alias("avg_salary"),
        pl.col("salary").max().alias("max_salary"),
        pl.len().alias("count")
    ])
    .sort("avg_salary", descending=True)
)
print(result)
```

### Polars Expressions

Polars uses an **expression-based API** that's very different from Pandas:

```python
import polars as pl
import numpy as np

# Create DataFrame
df = pl.DataFrame({
    "name": ["Alice", "Bob", "Carol", "Dave", "Eve"],
    "department": ["Engineering", "Marketing", "Engineering", "Marketing", "Engineering"],
    "salary": [90000, 70000, 95000, 72000, 88000],
    "years": [5, 3, 7, 4, 6],
    "rating": [4.5, 3.8, 4.9, 4.1, 4.3]
})

# Multiple expressions in one select
result = df.select([
    pl.col("name"),
    pl.col("salary"),
    (pl.col("salary") / pl.col("years")).alias("salary_per_year"),
    pl.col("rating").rank().alias("rating_rank"),
    pl.when(pl.col("salary") > 85000)
      .then(pl.lit("High"))
      .otherwise(pl.lit("Normal"))
      .alias("salary_tier")
])
print(result)

# Window functions (like SQL OVER)
df_with_dept_avg = df.with_columns([
    pl.col("salary").mean().over("department").alias("dept_avg_salary"),
    pl.col("salary").rank().over("department").alias("dept_salary_rank")
])
print(df_with_dept_avg)
```

### Lazy Mode (Optimized Execution)

```python
import polars as pl

# Lazy mode: Polars optimizes the query plan before executing
result = (
    pl.scan_csv("large_file.csv")   # Lazy read
    .filter(pl.col("amount") > 100)
    .group_by("category")
    .agg(pl.col("amount").sum())
    .sort("amount", descending=True)
    .head(10)
    .collect()  # Execute optimized plan
)
print(result)

# See the query plan
lazy_df = (
    pl.scan_csv("data.csv")
    .filter(pl.col("age") > 30)
    .select(["name", "age", "salary"])
)
print(lazy_df.explain())  # Shows optimized plan
```

### Polars vs Pandas Speed

```python
import polars as pl
import pandas as pd
import numpy as np
import time

# Generate test data
n = 2_000_000
data = {
    "id": np.arange(n),
    "group": np.random.choice(["A", "B", "C", "D"], n),
    "value": np.random.randn(n),
    "amount": np.random.uniform(0, 1000, n)
}

# Pandas
pd_df = pd.DataFrame(data)
start = time.time()
pd_result = pd_df.groupby("group").agg({"value": "mean", "amount": ["sum", "std"]})
pandas_time = time.time() - start

# Polars
pl_df = pl.DataFrame(data)
start = time.time()
pl_result = pl_df.group_by("group").agg([
    pl.col("value").mean(),
    pl.col("amount").sum(),
    pl.col("amount").std()
])
polars_time = time.time() - start

print(f"Pandas: {pandas_time:.4f}s")
print(f"Polars: {polars_time:.4f}s")
print(f"Speedup: {pandas_time/polars_time:.1f}×")
```

---

## PySpark: Distributed Computing

**PySpark** is for truly massive data — it distributes computation across a cluster of machines.

### Installation

```python
# pip install pyspark
```

### Basic Usage

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, avg, sum, count, when

# Create Spark session
spark = SparkSession.builder \
    .appName("BigDataAnalysis") \
    .master("local[*]") \
    .getOrCreate()

# Read data
df = spark.read.csv("large_data.csv", header=True, inferSchema=True)

# Show schema and preview
df.printSchema()
df.show(5)

# Basic operations
result = (
    df
    .filter(col("amount") > 100)
    .groupBy("category")
    .agg(
        avg("amount").alias("avg_amount"),
        sum("amount").alias("total_amount"),
        count("*").alias("num_transactions")
    )
    .orderBy(col("total_amount").desc())
)
result.show()
```

### PySpark Operations

```python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit, when, year, month
from pyspark.sql.window import Window
import pyspark.sql.functions as F

spark = SparkSession.builder.master("local[*]").getOrCreate()

# Create sample DataFrame
data = [
    ("Alice", "Engineering", 90000, "2020-01-15"),
    ("Bob", "Marketing", 70000, "2019-06-20"),
    ("Carol", "Engineering", 95000, "2018-03-10"),
    ("Dave", "Marketing", 72000, "2021-09-01"),
    ("Eve", "Engineering", 88000, "2020-11-25"),
]
df = spark.createDataFrame(data, ["name", "dept", "salary", "hire_date"])

# Select and transform
df_enhanced = df.select(
    col("name"),
    col("dept"),
    col("salary"),
    (col("salary") * 1.1).alias("salary_with_raise"),
    when(col("salary") > 85000, "Senior")
    .otherwise("Junior")
    .alias("level")
)
df_enhanced.show()

# Window functions
window_spec = Window.partitionBy("dept").orderBy(col("salary").desc())
df_ranked = df.withColumn("dept_rank", F.rank().over(window_spec))
df_ranked.show()

# SQL interface
df.createOrReplaceTempView("employees")
spark.sql("""
    SELECT dept, 
           AVG(salary) as avg_salary,
           COUNT(*) as headcount
    FROM employees 
    GROUP BY dept
""").show()

# Stop Spark when done
spark.stop()
```

### When to Use PySpark

- Data is in terabytes or petabytes
- Running on cloud (AWS EMR, Databricks, GCP Dataproc)
- Need MLlib for distributed machine learning
- Organization already has Spark infrastructure

---

## DuckDB: SQL on DataFrames

**DuckDB** is an in-process analytical database — think "SQLite for analytics."

### Installation

```python
# pip install duckdb
```

### Basic Usage

```python
import duckdb
import pandas as pd
import numpy as np

# DuckDB can query Pandas DataFrames directly!
df = pd.DataFrame({
    "user_id": np.random.randint(1, 1000, 100000),
    "product": np.random.choice(["A", "B", "C", "D"], 100000),
    "amount": np.random.uniform(10, 500, 100000),
    "date": pd.date_range("2023-01-01", periods=100000, freq="5min")
})

# Query with SQL — no loading needed
result = duckdb.sql("""
    SELECT product,
           COUNT(*) as num_sales,
           ROUND(AVG(amount), 2) as avg_amount,
           ROUND(SUM(amount), 2) as total_revenue
    FROM df
    GROUP BY product
    ORDER BY total_revenue DESC
""").df()  # .df() converts back to Pandas

print(result)
```

### DuckDB + Parquet (Fastest Combination)

```python
# Parquet files + DuckDB = best analytical performance
import duckdb

result = duckdb.sql("""
    SELECT category, SUM(revenue) as total
    FROM read_parquet('data/*.parquet')
    GROUP BY category
    ORDER BY total DESC
""").df()
print(result)
```

---

## Decision Guide: When to Use What

```python
# Decision flowchart (as code logic)

def choose_tool(data_size_gb, need_sql, need_cluster, team_familiar_pandas):
    """Choose the right big data tool."""

    if data_size_gb < 1:
        return "Pandas — your data fits in memory easily"

    if data_size_gb < 10:
        if need_sql:
            return "DuckDB — fastest SQL on moderate data"
        return "Polars — fastest DataFrame library"

    if data_size_gb < 100:
        if need_sql:
            return "DuckDB — handles 100GB+ efficiently"
        if team_familiar_pandas:
            return "Dask — familiar Pandas API, parallel"
        return "Polars (lazy mode) — fast with query optimization"

    # > 100 GB
    if need_cluster:
        return "PySpark — distributed across cluster"
    return "Dask or PySpark — you need distributed computing"

# Examples
print(choose_tool(0.5, False, False, True))
print(choose_tool(5, True, False, True))
print(choose_tool(50, False, False, True))
print(choose_tool(500, False, True, False))
```

---

## Summary

| Tool | Key Strength | API Style | Scale |
|------|-------------|-----------|-------|
| Polars | Raw speed (Rust engine) | Expression-based | Single machine |
| DuckDB | SQL + speed | SQL queries | Single machine |
| Dask | Pandas-compatible parallel | Pandas API | Single → Cluster |
| PySpark | Massive distributed scale | DataFrame + SQL | Cluster |
| Vaex | Memory-mapped exploration | Pandas-like | Single machine |

**Key takeaways:**
- Pandas is great until ~1 GB; beyond that, choose the right tool
- Polars and DuckDB are the fastest for single-machine workloads
- Dask is best when you already know Pandas and need to scale
- PySpark is for truly massive datasets on clusters
- Always use Parquet over CSV for analytical workloads
- Profile your actual workload — the fastest tool depends on your query patterns
