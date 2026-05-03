---
title: Reading & Writing Files
---

# Reading & Writing Files

Data lives in files — CSVs, Excel spreadsheets, JSON APIs, databases, and more. pandas provides a unified interface to read from and write to all major formats.

---

## CSV Files

CSV (Comma-Separated Values) is the most common data exchange format.

### Reading CSV

```python
import pandas as pd

# Basic read
df = pd.read_csv('sales_data.csv')
print(df.head())
```

### Important Parameters

```python
# Custom separator (TSV file)
df = pd.read_csv('data.tsv', sep='\t')

# No header row — provide column names
df = pd.read_csv('data.csv', header=None, names=['col1', 'col2', 'col3'])

# Use a specific column as the index
df = pd.read_csv('data.csv', index_col='id')

# Read only specific columns
df = pd.read_csv('data.csv', usecols=['name', 'age', 'salary'])

# Specify data types
df = pd.read_csv('data.csv', dtype={'zip_code': str, 'age': int})

# Parse date columns automatically
df = pd.read_csv('data.csv', parse_dates=['date', 'created_at'])

# Custom NA values
df = pd.read_csv('data.csv', na_values=['N/A', 'missing', '-', ''])

# Specify encoding
df = pd.read_csv('data.csv', encoding='utf-8')
# Other encodings: 'latin-1', 'cp1252', 'iso-8859-1'

# Read only first N rows
df = pd.read_csv('data.csv', nrows=100)

# Skip rows
df = pd.read_csv('data.csv', skiprows=5)        # Skip first 5 rows
df = pd.read_csv('data.csv', skiprows=[0, 2, 4]) # Skip specific rows
```

### Writing CSV

```python
# Basic write
df.to_csv('output.csv', index=False)

# With options
df.to_csv('output.csv',
          index=False,        # Don't write row index
          sep=',',            # Separator
          encoding='utf-8',   # Encoding
          na_rep='NULL',      # Represent NaN as 'NULL'
          columns=['name', 'age']  # Only these columns
)
```

### Complete CSV Example

```python
import pandas as pd

# Read with multiple options
df = pd.read_csv(
    'messy_data.csv',
    sep=',',
    header=0,
    usecols=['date', 'product', 'revenue', 'region'],
    parse_dates=['date'],
    na_values=['N/A', 'null', ''],
    dtype={'region': 'category'}
)

print(f"Shape: {df.shape}")
print(f"Dtypes:\n{df.dtypes}")
print(df.head())
```

---

## Excel Files

### Reading Excel

```python
# Basic read (requires openpyxl)
df = pd.read_excel('report.xlsx')

# Specify sheet
df = pd.read_excel('report.xlsx', sheet_name='Sales')

# By sheet index (0-based)
df = pd.read_excel('report.xlsx', sheet_name=0)

# Read all sheets → dict of DataFrames
all_sheets = pd.read_excel('report.xlsx', sheet_name=None)
print(all_sheets.keys())  # dict_keys(['Sales', 'Inventory', 'Summary'])

# Access specific sheet from dict
sales_df = all_sheets['Sales']
```

### Excel Parameters

```python
# Skip rows (e.g., title/header rows before the data)
df = pd.read_excel('report.xlsx', skiprows=3)

# Specific columns
df = pd.read_excel('report.xlsx', usecols='A:D')      # Excel column letters
df = pd.read_excel('report.xlsx', usecols=[0, 1, 3])  # Column indices

# Set index
df = pd.read_excel('report.xlsx', index_col='ID')
```

### Writing Excel

```python
# Basic write
df.to_excel('output.xlsx', index=False)

# Write to specific sheet
df.to_excel('output.xlsx', sheet_name='Results', index=False)
```

### Multiple Sheets with ExcelWriter

```python
# Write multiple DataFrames to different sheets
with pd.ExcelWriter('report.xlsx', engine='openpyxl') as writer:
    df_sales.to_excel(writer, sheet_name='Sales', index=False)
    df_inventory.to_excel(writer, sheet_name='Inventory', index=False)
    df_summary.to_excel(writer, sheet_name='Summary', index=False)
```

---

## JSON Files

### Reading JSON

```python
# Basic read (array of objects)
df = pd.read_json('data.json')

# From a JSON string
json_str = '[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]'
df = pd.read_json(json_str)
print(df)
```

### Nested JSON

Real-world JSON is often nested:

```python
import json

# Nested JSON data
data = [
    {
        'name': 'Alice',
        'age': 30,
        'address': {'city': 'NYC', 'state': 'NY'},
        'scores': [85, 90, 78]
    },
    {
        'name': 'Bob',
        'age': 25,
        'address': {'city': 'LA', 'state': 'CA'},
        'scores': [92, 88, 95]
    }
]

# Flatten nested JSON
df = pd.json_normalize(data)
print(df)
```

Output:

```
   name  age         scores address.city address.state
0  Alice   30  [85, 90, 78]          NYC            NY
1    Bob   25  [92, 88, 95]           LA            CA
```

### Deeper Nesting

```python
# More complex nested structure
data = {
    'company': 'TechCorp',
    'employees': [
        {'name': 'Alice', 'dept': {'name': 'Engineering', 'floor': 3}},
        {'name': 'Bob', 'dept': {'name': 'Sales', 'floor': 1}}
    ]
}

df = pd.json_normalize(data, record_path='employees', meta=['company'])
print(df)
```

### Writing JSON

```python
# Array of records (most common)
df.to_json('output.json', orient='records', indent=2)

# Other orientations
df.to_json('output.json', orient='columns')  # {col: {idx: val}}
df.to_json('output.json', orient='index')    # {idx: {col: val}}
df.to_json('output.json', orient='split')    # {columns, index, data}
```

---

## Parquet Files

Parquet is a columnar storage format — fast, compressed, and ideal for large datasets.

### Reading Parquet

```python
# Basic read (requires pyarrow or fastparquet)
df = pd.read_parquet('data.parquet')

# Read specific columns (very efficient — only reads those columns)
df = pd.read_parquet('data.parquet', columns=['name', 'revenue'])
```

### Writing Parquet

```python
# Basic write
df.to_parquet('output.parquet')

# With compression
df.to_parquet('output.parquet', compression='snappy')  # default
df.to_parquet('output.parquet', compression='gzip')    # smaller file
```

### Why Use Parquet?

| Feature | CSV | Parquet |
|---------|-----|---------|
| File size | Large | Small (compressed) |
| Read speed | Slow | Fast |
| Column selection | Reads all | Reads only needed |
| Data types | Lost (all text) | Preserved |
| Best for | Small, portable | Large, analytical |

```python
# Compare file sizes
import os

df = pd.DataFrame({'x': range(1_000_000), 'y': range(1_000_000)})

df.to_csv('test.csv', index=False)
df.to_parquet('test.parquet')

csv_size = os.path.getsize('test.csv') / 1_000_000
parquet_size = os.path.getsize('test.parquet') / 1_000_000

print(f"CSV: {csv_size:.1f} MB")
print(f"Parquet: {parquet_size:.1f} MB")
# CSV: ~15 MB, Parquet: ~3 MB
```

---

## SQL Databases

### Reading from SQL

```python
from sqlalchemy import create_engine

# Create database connection
engine = create_engine('sqlite:///sales.db')

# Read entire table
df = pd.read_sql_table('customers', engine)

# Read with SQL query
df = pd.read_sql_query('SELECT * FROM orders WHERE amount > 100', engine)

# Shortcut: read_sql handles both tables and queries
df = pd.read_sql('SELECT name, email FROM customers LIMIT 10', engine)
```

### Writing to SQL

```python
# Write DataFrame to SQL table
df.to_sql('results', engine, if_exists='replace', index=False)

# Append to existing table
df.to_sql('results', engine, if_exists='append', index=False)
```

### Connection Strings

```python
# SQLite (file-based)
engine = create_engine('sqlite:///mydb.db')

# PostgreSQL
engine = create_engine('postgresql://user:password@host:5432/dbname')

# MySQL
engine = create_engine('mysql+pymysql://user:password@host:3306/dbname')
```

### Chunked SQL Reading

```python
# Read in chunks for large tables
chunks = pd.read_sql('SELECT * FROM big_table', engine, chunksize=10000)

for chunk in chunks:
    # Process each chunk
    process(chunk)
```

---

## Other Formats

### HTML Tables

```python
# Read all tables from a webpage
tables = pd.read_html('https://example.com/data-page')
print(f"Found {len(tables)} tables")

# Access specific table (returns a list)
df = tables[0]
print(df.head())
```

### Clipboard

```python
# Read from clipboard (paste from Excel/browser)
df = pd.read_clipboard()

# Copy DataFrame to clipboard
df.to_clipboard(index=False)
```

### Pickle (Python serialization)

```python
# Save (preserves all pandas metadata)
df.to_pickle('data.pkl')

# Load
df = pd.read_pickle('data.pkl')
```

> **Warning**: Only load pickle files from trusted sources — they can execute arbitrary code.

### Feather Format

```python
# Fast binary format (requires pyarrow)
df.to_feather('data.feather')
df = pd.read_feather('data.feather')
```

---

## Handling Large Files

When files are too large to fit in memory:

### Chunked Reading

```python
# Process CSV in chunks of 10,000 rows
chunk_size = 10_000
chunks = pd.read_csv('huge_file.csv', chunksize=chunk_size)

# Process each chunk
results = []
for chunk in chunks:
    # Filter, transform, aggregate
    filtered = chunk[chunk['revenue'] > 100]
    results.append(filtered)

# Combine results
final_df = pd.concat(results, ignore_index=True)
print(f"Total rows after filtering: {len(final_df)}")
```

### Select Only Needed Columns

```python
# Read only specific columns — uses less memory
df = pd.read_csv('huge_file.csv', usecols=['id', 'name', 'revenue'])
```

### Optimize Data Types

```python
# Check memory usage
df = pd.read_csv('data.csv')
print(f"Memory: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")

# Optimize dtypes
df['category'] = df['category'].astype('category')  # String → Category
df['quantity'] = pd.to_numeric(df['quantity'], downcast='integer')  # int64 → int16
df['price'] = pd.to_numeric(df['price'], downcast='float')  # float64 → float32

print(f"Optimized: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")
```

### Memory Estimation

Memory for a DataFrame with $n$ rows and $k$ columns of type float64:

$$\text{Memory (bytes)} = n \times k \times 8$$

For 1 million rows and 50 columns:

$$1{,}000{,}000 \times 50 \times 8 = 400{,}000{,}000 \text{ bytes} \approx 400 \text{ MB}$$

---

## Complete Example: Multi-Format Workflow

```python
import pandas as pd
import numpy as np

# 1. Create sample data
np.random.seed(42)
n = 1000

df = pd.DataFrame({
    'id': range(1, n + 1),
    'name': [f'Customer_{i}' for i in range(1, n + 1)],
    'region': np.random.choice(['North', 'South', 'East', 'West'], n),
    'revenue': np.random.uniform(100, 5000, n).round(2),
    'date': pd.date_range('2024-01-01', periods=n, freq='H')
})

print("=== Original Data ===")
print(df.head())
print(f"Shape: {df.shape}")

# 2. Write to CSV
df.to_csv('customers.csv', index=False)
print("\nSaved to CSV")

# 3. Write to Parquet
df.to_parquet('customers.parquet')
print("Saved to Parquet")

# 4. Write to JSON
df.head(10).to_json('customers_sample.json', orient='records', indent=2)
print("Saved sample to JSON")

# 5. Read back from CSV with type optimization
df_csv = pd.read_csv(
    'customers.csv',
    dtype={'region': 'category'},
    parse_dates=['date']
)
print(f"\nCSV dtypes:\n{df_csv.dtypes}")

# 6. Read from Parquet (types preserved automatically)
df_parquet = pd.read_parquet('customers.parquet')
print(f"\nParquet dtypes:\n{df_parquet.dtypes}")

# 7. Compare memory usage
csv_mem = df_csv.memory_usage(deep=True).sum() / 1024
parquet_mem = df_parquet.memory_usage(deep=True).sum() / 1024
print(f"\nMemory - CSV load: {csv_mem:.1f} KB")
print(f"Memory - Parquet load: {parquet_mem:.1f} KB")
```

---

## File Format Comparison

| Format | Speed | Size | Types | Use Case |
|--------|-------|------|-------|----------|
| CSV | Slow | Large | Lost | Universal exchange |
| Excel | Slow | Medium | Partial | Business reports |
| JSON | Medium | Large | Partial | Web APIs |
| Parquet | Fast | Small | Preserved | Analytics |
| Feather | Fastest | Small | Preserved | Temp storage |
| Pickle | Fast | Medium | Preserved | Python-only |
| SQL | Medium | N/A | Preserved | Structured queries |

---

## Common Gotchas

### 1. Encoding Errors

```python
# UnicodeDecodeError? Try different encodings
try:
    df = pd.read_csv('file.csv', encoding='utf-8')
except UnicodeDecodeError:
    df = pd.read_csv('file.csv', encoding='latin-1')
```

### 2. Mixed Types Warning

```python
# Specify dtype to avoid mixed type inference
df = pd.read_csv('data.csv', dtype={'zip': str}, low_memory=False)
```

### 3. Date Parsing Performance

```python
# Specifying format is much faster than letting pandas guess
df = pd.read_csv('data.csv',
    parse_dates=['date'],
    date_format='%Y-%m-%d'  # pandas 2.0+
)
```

### 4. Large Excel Files

```python
# For very large Excel files, consider converting to CSV first
# or use openpyxl's read_only mode
df = pd.read_excel('huge.xlsx', engine='openpyxl')
```

---

## Exercises

1. Read a CSV file with custom separator, skip the first 3 rows, and parse a date column
2. Write a DataFrame to Excel with two sheets: one for raw data and one for a summary
3. Read nested JSON from an API response and flatten it into a DataFrame
4. Compare the file sizes and read speeds of CSV vs Parquet for the same dataset
5. Process a large CSV file in chunks, computing the mean of a column across all chunks
