---
title: SQL for Data Science
---

# SQL for Data Science

SQL (Structured Query Language) is the standard language for working with databases. Most real-world data lives in relational databases, making SQL an **essential skill** for every data scientist.

---

## Why SQL?

| Reason | Explanation |
|--------|-------------|
| Data lives in databases | Most companies store data in PostgreSQL, MySQL, etc. |
| Efficient for large data | Databases handle billions of rows; pandas struggles |
| Universal language | Works across all relational databases |
| Job requirement | Nearly every DS job listing mentions SQL |
| Data extraction | Pull exactly what you need before loading into Python |

---

## SQL with Python

Python's `sqlite3` module provides a built-in database — no installation needed.

```python
import sqlite3
import pandas as pd

# Create an in-memory database
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()

# Create a sample table
cursor.execute("""
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT,
        salary REAL,
        hire_date TEXT,
        city TEXT
    )
""")

# Insert sample data
employees = [
    (1, "Alice", "Engineering", 95000, "2020-03-15", "New York"),
    (2, "Bob", "Marketing", 72000, "2019-07-01", "Chicago"),
    (3, "Charlie", "Engineering", 105000, "2018-11-20", "New York"),
    (4, "Diana", "Sales", 68000, "2021-01-10", "Chicago"),
    (5, "Eve", "Engineering", 112000, "2017-06-05", "San Francisco"),
    (6, "Frank", "Marketing", 78000, "2020-09-12", "New York"),
    (7, "Grace", "Sales", 71000, "2019-04-22", "San Francisco"),
    (8, "Henry", "Engineering", 98000, "2021-08-30", "Chicago"),
    (9, "Iris", "Marketing", 82000, "2018-02-14", "San Francisco"),
    (10, "Jack", "Sales", 75000, "2020-12-01", "New York"),
]

cursor.executemany(
    "INSERT INTO employees VALUES (?, ?, ?, ?, ?, ?)", employees
)
conn.commit()

print("Table created with 10 employees!")
```

### Running Queries with pandas

```python
# The easiest way: pd.read_sql()
df = pd.read_sql("SELECT * FROM employees", conn)
print(df)
```

---

## SELECT Statement

The most fundamental SQL command — retrieves data from a table.

```python
# Select specific columns
query = "SELECT name, department, salary FROM employees"
print(pd.read_sql(query, conn))
```

```python
# Select all columns
query = "SELECT * FROM employees"
print(pd.read_sql(query, conn))
```

```python
# Select distinct values (no duplicates)
query = "SELECT DISTINCT department FROM employees"
print(pd.read_sql(query, conn))
```

```python
# Column aliases — rename columns in output
query = """
    SELECT
        name AS employee_name,
        salary AS annual_salary,
        salary / 12 AS monthly_salary
    FROM employees
"""
print(pd.read_sql(query, conn))
```

---

## WHERE Clause

Filter rows based on conditions.

### Comparison Operators

```python
# Salary greater than 80000
query = "SELECT name, salary FROM employees WHERE salary > 80000"
print(pd.read_sql(query, conn))
```

```python
# Department equals 'Engineering'
query = "SELECT name, department FROM employees WHERE department = 'Engineering'"
print(pd.read_sql(query, conn))
```

```python
# Not equal
query = "SELECT name, department FROM employees WHERE department != 'Sales'"
print(pd.read_sql(query, conn))
```

### Logical Operators: AND, OR, NOT

```python
# AND: both conditions must be true
query = """
    SELECT name, department, salary
    FROM employees
    WHERE department = 'Engineering' AND salary > 100000
"""
print(pd.read_sql(query, conn))
```

```python
# OR: at least one condition must be true
query = """
    SELECT name, department, city
    FROM employees
    WHERE city = 'New York' OR city = 'Chicago'
"""
print(pd.read_sql(query, conn))
```

```python
# NOT: negate a condition
query = """
    SELECT name, department
    FROM employees
    WHERE NOT department = 'Engineering'
"""
print(pd.read_sql(query, conn))
```

### BETWEEN, IN, LIKE

```python
# BETWEEN: range (inclusive)
query = """
    SELECT name, salary
    FROM employees
    WHERE salary BETWEEN 70000 AND 90000
"""
print(pd.read_sql(query, conn))
```

```python
# IN: match any value in a list
query = """
    SELECT name, city
    FROM employees
    WHERE city IN ('New York', 'San Francisco')
"""
print(pd.read_sql(query, conn))
```

```python
# LIKE: pattern matching
# % = any number of characters
# _ = exactly one character
query = """
    SELECT name FROM employees WHERE name LIKE 'A%'
"""
print("Names starting with A:")
print(pd.read_sql(query, conn))

query2 = """
    SELECT name FROM employees WHERE name LIKE '____'
"""
print("\nNames with exactly 4 characters:")
print(pd.read_sql(query2, conn))
```

### NULL Handling

```python
# IS NULL / IS NOT NULL
# First, add a row with NULL
cursor.execute(
    "INSERT INTO employees VALUES (11, 'Kate', NULL, 65000, '2022-01-01', 'Boston')"
)
conn.commit()

query = "SELECT name, department FROM employees WHERE department IS NULL"
print("NULL department:")
print(pd.read_sql(query, conn))

query2 = "SELECT name, department FROM employees WHERE department IS NOT NULL"
print(f"\nNon-NULL departments: {len(pd.read_sql(query2, conn))} rows")
```

---

## ORDER BY

Sort results by one or more columns.

```python
# Sort by salary (ascending — default)
query = "SELECT name, salary FROM employees ORDER BY salary"
print(pd.read_sql(query, conn))
```

```python
# Sort descending
query = "SELECT name, salary FROM employees ORDER BY salary DESC"
print(pd.read_sql(query, conn))
```

```python
# Sort by multiple columns
query = """
    SELECT name, department, salary
    FROM employees
    ORDER BY department ASC, salary DESC
"""
print(pd.read_sql(query, conn))
```

---

## LIMIT

Restrict the number of rows returned.

```python
# Top 5 highest salaries
query = """
    SELECT name, salary
    FROM employees
    ORDER BY salary DESC
    LIMIT 5
"""
print(pd.read_sql(query, conn))
```

```python
# OFFSET: skip rows (pagination)
query = """
    SELECT name, salary
    FROM employees
    ORDER BY salary DESC
    LIMIT 3 OFFSET 3
"""
print("Rows 4-6 by salary:")
print(pd.read_sql(query, conn))
```

---

## Aggregate Functions

Compute summary statistics on groups of rows.

| Function | Description |
|----------|-------------|
| `COUNT(*)` | Number of rows |
| `COUNT(col)` | Non-NULL values |
| `SUM(col)` | Total |
| `AVG(col)` | Average |
| `MIN(col)` | Minimum |
| `MAX(col)` | Maximum |

```python
# Basic aggregates
query = """
    SELECT
        COUNT(*) AS total_employees,
        AVG(salary) AS avg_salary,
        MIN(salary) AS min_salary,
        MAX(salary) AS max_salary,
        SUM(salary) AS total_payroll
    FROM employees
"""
print(pd.read_sql(query, conn))
```

```python
# COUNT DISTINCT
query = """
    SELECT
        COUNT(DISTINCT department) AS num_departments,
        COUNT(DISTINCT city) AS num_cities
    FROM employees
"""
print(pd.read_sql(query, conn))
```

---

## GROUP BY

Group rows and apply aggregate functions to each group.

```python
# Average salary by department
query = """
    SELECT
        department,
        COUNT(*) AS num_employees,
        AVG(salary) AS avg_salary,
        MAX(salary) AS max_salary
    FROM employees
    WHERE department IS NOT NULL
    GROUP BY department
"""
print(pd.read_sql(query, conn))
```

```python
# Group by city
query = """
    SELECT
        city,
        COUNT(*) AS num_employees,
        ROUND(AVG(salary), 0) AS avg_salary
    FROM employees
    GROUP BY city
    ORDER BY avg_salary DESC
"""
print(pd.read_sql(query, conn))
```

### HAVING — Filter Groups

`WHERE` filters **rows** before grouping; `HAVING` filters **groups** after.

```python
# Departments with average salary > 80000
query = """
    SELECT
        department,
        AVG(salary) AS avg_salary,
        COUNT(*) AS count
    FROM employees
    WHERE department IS NOT NULL
    GROUP BY department
    HAVING AVG(salary) > 80000
"""
print(pd.read_sql(query, conn))
```

---

## JOINs

Combine rows from multiple tables based on related columns.

```python
# Create a second table: projects
cursor.execute("""
    CREATE TABLE projects (
        project_id INTEGER PRIMARY KEY,
        project_name TEXT,
        lead_id INTEGER,
        budget REAL,
        status TEXT
    )
""")

projects = [
    (1, "Website Redesign", 1, 150000, "Active"),
    (2, "Mobile App", 3, 300000, "Active"),
    (3, "Data Pipeline", 5, 200000, "Completed"),
    (4, "Marketing Campaign", 2, 80000, "Active"),
    (5, "AI Chatbot", 8, 250000, "Planning"),
    (6, "Legacy Migration", 99, 180000, "Active"),  # lead_id 99 doesn't exist
]

cursor.executemany(
    "INSERT INTO projects VALUES (?, ?, ?, ?, ?)", projects
)
conn.commit()
print("Projects table created!")
```

### INNER JOIN

Returns only rows that have matching values in **both** tables.

```python
query = """
    SELECT
        e.name,
        e.department,
        p.project_name,
        p.budget
    FROM employees e
    INNER JOIN projects p ON e.id = p.lead_id
"""
print("INNER JOIN (matching rows only):")
print(pd.read_sql(query, conn))
```

### LEFT JOIN

Returns **all rows from the left** table, plus matching rows from the right.

```python
query = """
    SELECT
        e.name,
        e.department,
        p.project_name
    FROM employees e
    LEFT JOIN projects p ON e.id = p.lead_id
"""
print("LEFT JOIN (all employees, projects if available):")
print(pd.read_sql(query, conn))
```

### Understanding JOINs

| JOIN Type | Returns |
|-----------|---------|
| INNER JOIN | Only matching rows from both tables |
| LEFT JOIN | All left rows + matching right rows |
| RIGHT JOIN | All right rows + matching left rows |
| FULL OUTER JOIN | All rows from both tables |

> **Note:** SQLite doesn't support RIGHT JOIN or FULL OUTER JOIN directly, but you can emulate them.

---

## Creating Tables and Inserting Data

```python
# CREATE TABLE
cursor.execute("""
    CREATE TABLE IF NOT EXISTS sales (
        sale_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        price REAL NOT NULL,
        sale_date TEXT NOT NULL
    )
""")

# INSERT single row
cursor.execute("""
    INSERT INTO sales (product, quantity, price, sale_date)
    VALUES ('Laptop', 2, 999.99, '2024-01-15')
""")

# INSERT multiple rows
sales_data = [
    ("Mouse", 10, 29.99, "2024-01-15"),
    ("Keyboard", 5, 79.99, "2024-01-16"),
    ("Monitor", 3, 399.99, "2024-01-16"),
    ("Laptop", 1, 999.99, "2024-01-17"),
    ("Mouse", 8, 29.99, "2024-01-17"),
]

cursor.executemany("""
    INSERT INTO sales (product, quantity, price, sale_date)
    VALUES (?, ?, ?, ?)
""", sales_data)
conn.commit()

# Verify
print(pd.read_sql("SELECT * FROM sales", conn))
```

---

## Complete Example: Sales Analysis

```python
import sqlite3
import pandas as pd

# Fresh database with realistic data
conn2 = sqlite3.connect(":memory:")

# Create and populate tables
conn2.executescript("""
    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        name TEXT, email TEXT, city TEXT, signup_date TEXT
    );
    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER, order_date TEXT,
        total REAL, status TEXT
    );

    INSERT INTO customers VALUES
        (1, 'Alice', 'alice@email.com', 'NYC', '2023-01-15'),
        (2, 'Bob', 'bob@email.com', 'LA', '2023-02-20'),
        (3, 'Charlie', 'charlie@email.com', 'NYC', '2023-03-10'),
        (4, 'Diana', 'diana@email.com', 'Chicago', '2023-04-05'),
        (5, 'Eve', 'eve@email.com', 'LA', '2023-05-22');

    INSERT INTO orders VALUES
        (1, 1, '2023-06-01', 150.00, 'completed'),
        (2, 1, '2023-07-15', 200.00, 'completed'),
        (3, 2, '2023-06-20', 75.00, 'completed'),
        (4, 3, '2023-08-01', 320.00, 'completed'),
        (5, 1, '2023-09-10', 180.00, 'completed'),
        (6, 4, '2023-09-15', 95.00, 'cancelled'),
        (7, 2, '2023-10-01', 250.00, 'completed'),
        (8, 3, '2023-10-20', 110.00, 'completed'),
        (9, 5, '2023-11-05', 450.00, 'completed'),
        (10, 1, '2023-12-01', 300.00, 'completed');
""")

# Analysis queries
print("=== Customer Order Summary ===")
query = """
    SELECT
        c.name,
        c.city,
        COUNT(o.order_id) AS total_orders,
        ROUND(SUM(o.total), 2) AS total_spent,
        ROUND(AVG(o.total), 2) AS avg_order
    FROM customers c
    LEFT JOIN orders o ON c.customer_id = o.customer_id
        AND o.status = 'completed'
    GROUP BY c.customer_id
    ORDER BY total_spent DESC
"""
print(pd.read_sql(query, conn2))

print("\n=== Revenue by City ===")
query2 = """
    SELECT
        c.city,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.total), 2) AS revenue
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    WHERE o.status = 'completed'
    GROUP BY c.city
    ORDER BY revenue DESC
"""
print(pd.read_sql(query2, conn2))

print("\n=== Monthly Revenue ===")
query3 = """
    SELECT
        SUBSTR(order_date, 1, 7) AS month,
        COUNT(*) AS orders,
        ROUND(SUM(total), 2) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY SUBSTR(order_date, 1, 7)
    ORDER BY month
"""
print(pd.read_sql(query3, conn2))

conn2.close()
```

---

## Summary

| Concept | Syntax |
|---------|--------|
| Select columns | `SELECT col1, col2 FROM table` |
| Filter rows | `WHERE condition` |
| Sort results | `ORDER BY col ASC/DESC` |
| Limit rows | `LIMIT n` |
| Aggregate | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` |
| Group data | `GROUP BY col` |
| Filter groups | `HAVING condition` |
| Combine tables | `JOIN table ON condition` |

---

## Exercises

1. Write a query to find all employees in Engineering earning above the department average.
2. Join employees and projects. Find departments with the highest total project budget.
3. Use GROUP BY to find the city with the most employees and highest average salary.
4. Combine WHERE, ORDER BY, and LIMIT to find the top 3 most recent hires.

---
