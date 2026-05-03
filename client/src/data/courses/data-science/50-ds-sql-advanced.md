---
title: Advanced SQL Queries
---

# Advanced SQL Queries

Master advanced SQL techniques used by data scientists for complex analytics — subqueries, CTEs, window functions, and performance optimization.

---

## Subqueries

A subquery is a **query nested inside another query**. They can appear in WHERE, FROM, or SELECT clauses.

```python
import sqlite3
import pandas as pd

# Set up database with sample data
conn = sqlite3.connect(":memory:")
conn.executescript("""
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT, department TEXT,
        salary REAL, hire_date TEXT, manager_id INTEGER
    );
    CREATE TABLE sales (
        sale_id INTEGER PRIMARY KEY,
        employee_id INTEGER, amount REAL,
        sale_date TEXT, product TEXT
    );

    INSERT INTO employees VALUES
        (1, 'Alice', 'Engineering', 95000, '2020-03-15', NULL),
        (2, 'Bob', 'Marketing', 72000, '2019-07-01', 1),
        (3, 'Charlie', 'Engineering', 105000, '2018-11-20', 1),
        (4, 'Diana', 'Sales', 68000, '2021-01-10', 5),
        (5, 'Eve', 'Sales', 82000, '2017-06-05', NULL),
        (6, 'Frank', 'Marketing', 78000, '2020-09-12', 2),
        (7, 'Grace', 'Engineering', 112000, '2016-04-22', 1),
        (8, 'Henry', 'Sales', 71000, '2021-08-30', 5),
        (9, 'Iris', 'Marketing', 85000, '2018-02-14', 2),
        (10, 'Jack', 'Engineering', 98000, '2022-01-01', 3);

    INSERT INTO sales VALUES
        (1, 4, 15000, '2023-01-15', 'Enterprise'),
        (2, 5, 22000, '2023-01-20', 'Enterprise'),
        (3, 8, 8000, '2023-02-01', 'Basic'),
        (4, 4, 12000, '2023-02-15', 'Pro'),
        (5, 5, 35000, '2023-03-01', 'Enterprise'),
        (6, 8, 9500, '2023-03-10', 'Pro'),
        (7, 4, 18000, '2023-04-01', 'Enterprise'),
        (8, 5, 28000, '2023-04-15', 'Enterprise'),
        (9, 8, 11000, '2023-05-01', 'Pro'),
        (10, 4, 20000, '2023-05-20', 'Enterprise'),
        (11, 5, 15000, '2023-06-01', 'Pro'),
        (12, 8, 7500, '2023-06-15', 'Basic');
""")
print("Database ready!")
```

### Subquery in WHERE

```python
# Employees earning above average
query = """
    SELECT name, department, salary
    FROM employees
    WHERE salary > (SELECT AVG(salary) FROM employees)
    ORDER BY salary DESC
"""
print("Above-average earners:")
print(pd.read_sql(query, conn))
```

```python
# Employees in departments that have more than 3 people
query = """
    SELECT name, department
    FROM employees
    WHERE department IN (
        SELECT department
        FROM employees
        GROUP BY department
        HAVING COUNT(*) > 3
    )
"""
print("\nEmployees in large departments:")
print(pd.read_sql(query, conn))
```

### Subquery in FROM (Derived Table)

```python
# Department stats as a derived table
query = """
    SELECT
        dept_stats.department,
        dept_stats.avg_salary,
        dept_stats.employee_count
    FROM (
        SELECT
            department,
            ROUND(AVG(salary), 0) AS avg_salary,
            COUNT(*) AS employee_count
        FROM employees
        GROUP BY department
    ) AS dept_stats
    WHERE dept_stats.avg_salary > 75000
"""
print("Departments with avg salary > 75K:")
print(pd.read_sql(query, conn))
```

### Correlated Subquery

A subquery that **references the outer query** — runs once per row.

```python
# Employees earning above their department's average
query = """
    SELECT name, department, salary
    FROM employees e
    WHERE salary > (
        SELECT AVG(salary)
        FROM employees
        WHERE department = e.department
    )
    ORDER BY department, salary DESC
"""
print("Above department average:")
print(pd.read_sql(query, conn))
```

---

## Common Table Expressions (CTEs)

CTEs provide **named temporary result sets** — much cleaner than nested subqueries.

### Basic CTE

```python
# CTE syntax: WITH name AS (query) SELECT ...
query = """
    WITH dept_stats AS (
        SELECT
            department,
            AVG(salary) AS avg_salary,
            COUNT(*) AS team_size,
            MIN(hire_date) AS earliest_hire
        FROM employees
        GROUP BY department
    )
    SELECT
        e.name,
        e.department,
        e.salary,
        ROUND(d.avg_salary, 0) AS dept_avg,
        e.salary - d.avg_salary AS diff_from_avg
    FROM employees e
    JOIN dept_stats d ON e.department = d.department
    ORDER BY diff_from_avg DESC
"""
print("Salary vs Department Average:")
print(pd.read_sql(query, conn))
```

### Multiple CTEs

```python
# Chain multiple CTEs with commas
query = """
    WITH
    high_earners AS (
        SELECT * FROM employees WHERE salary > 90000
    ),
    dept_counts AS (
        SELECT department, COUNT(*) AS total
        FROM employees
        GROUP BY department
    )
    SELECT
        h.name,
        h.department,
        h.salary,
        d.total AS dept_size
    FROM high_earners h
    JOIN dept_counts d ON h.department = d.department
    ORDER BY h.salary DESC
"""
print("High earners with department size:")
print(pd.read_sql(query, conn))
```

### Recursive CTE

Useful for hierarchical data (org charts, tree structures).

```python
# Build org chart using recursive CTE
query = """
    WITH RECURSIVE org_chart AS (
        -- Base case: top-level managers (no manager)
        SELECT id, name, manager_id, 0 AS level
        FROM employees
        WHERE manager_id IS NULL

        UNION ALL

        -- Recursive case: employees with managers
        SELECT e.id, e.name, e.manager_id, oc.level + 1
        FROM employees e
        JOIN org_chart oc ON e.manager_id = oc.id
    )
    SELECT
        SUBSTR('        ', 1, level * 4) || name AS org_tree,
        level
    FROM org_chart
    ORDER BY level, name
"""
print("Organization Hierarchy:")
print(pd.read_sql(query, conn))
```

---

## Window Functions

Window functions perform calculations **across a set of rows** related to the current row — without collapsing rows like GROUP BY.

### Syntax

```sql
function_name() OVER (
    [PARTITION BY column]
    [ORDER BY column]
    [ROWS BETWEEN ... AND ...]
)
```

### ROW_NUMBER, RANK, DENSE_RANK

```python
# Rank employees by salary within each department
query = """
    SELECT
        name,
        department,
        salary,
        ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
        RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank,
        DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank
    FROM employees
    ORDER BY department, salary DESC
"""
print("Ranking within departments:")
print(pd.read_sql(query, conn))
```

**Difference between ranking functions:**

| Function | Ties | Gaps |
|----------|------|------|
| ROW_NUMBER | Breaks arbitrarily | No gaps |
| RANK | Same rank for ties | Gaps after ties |
| DENSE_RANK | Same rank for ties | No gaps |

### LAG and LEAD

Access **previous** or **next** row values.

```python
# Compare each sale to the previous one
query = """
    SELECT
        sale_date,
        employee_id,
        amount,
        LAG(amount, 1) OVER (
            PARTITION BY employee_id ORDER BY sale_date
        ) AS prev_sale,
        amount - LAG(amount, 1) OVER (
            PARTITION BY employee_id ORDER BY sale_date
        ) AS change
    FROM sales
    ORDER BY employee_id, sale_date
"""
print("Sales with previous comparison:")
print(pd.read_sql(query, conn))
```

```python
# LEAD: look at the next row
query = """
    SELECT
        name,
        hire_date,
        LEAD(name, 1) OVER (ORDER BY hire_date) AS next_hire,
        LEAD(hire_date, 1) OVER (ORDER BY hire_date) AS next_hire_date
    FROM employees
    ORDER BY hire_date
"""
print("Hire sequence:")
print(pd.read_sql(query, conn))
```

### Running Totals and Moving Averages

```python
# Running total of sales per employee
query = """
    SELECT
        employee_id,
        sale_date,
        amount,
        SUM(amount) OVER (
            PARTITION BY employee_id
            ORDER BY sale_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_total
    FROM sales
    ORDER BY employee_id, sale_date
"""
print("Running totals:")
print(pd.read_sql(query, conn))
```

```python
# Moving average (last 3 sales)
query = """
    SELECT
        employee_id,
        sale_date,
        amount,
        ROUND(AVG(amount) OVER (
            PARTITION BY employee_id
            ORDER BY sale_date
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 0) AS moving_avg_3
    FROM sales
    ORDER BY employee_id, sale_date
"""
print("3-period moving average:")
print(pd.read_sql(query, conn))
```

### Partition Average and Percentages

```python
# Each sale as percentage of employee's total
query = """
    SELECT
        employee_id,
        sale_date,
        amount,
        SUM(amount) OVER (PARTITION BY employee_id) AS emp_total,
        ROUND(
            100.0 * amount / SUM(amount) OVER (PARTITION BY employee_id), 1
        ) AS pct_of_total
    FROM sales
    ORDER BY employee_id, sale_date
"""
print("Sales as percentage of employee total:")
print(pd.read_sql(query, conn))
```

### NTILE — Quartiles and Percentiles

```python
# Divide employees into salary quartiles
query = """
    SELECT
        name,
        salary,
        NTILE(4) OVER (ORDER BY salary) AS quartile
    FROM employees
    ORDER BY salary
"""
print("Salary quartiles:")
print(pd.read_sql(query, conn))
```

---

## CASE WHEN

Conditional logic inside SQL — like if/else.

```python
# Categorize salaries
query = """
    SELECT
        name,
        salary,
        CASE
            WHEN salary >= 100000 THEN 'Senior'
            WHEN salary >= 80000 THEN 'Mid-Level'
            ELSE 'Junior'
        END AS level
    FROM employees
    ORDER BY salary DESC
"""
print("Salary categories:")
print(pd.read_sql(query, conn))
```

```python
# Conditional aggregation
query = """
    SELECT
        department,
        COUNT(*) AS total,
        SUM(CASE WHEN salary >= 90000 THEN 1 ELSE 0 END) AS high_earners,
        SUM(CASE WHEN salary < 90000 THEN 1 ELSE 0 END) AS others,
        ROUND(AVG(CASE WHEN salary >= 90000 THEN salary END), 0) AS avg_high
    FROM employees
    GROUP BY department
"""
print("Conditional aggregation:")
print(pd.read_sql(query, conn))
```

---

## String Functions

```python
# Common string operations
query = """
    SELECT
        name,
        UPPER(name) AS upper_name,
        LOWER(name) AS lower_name,
        LENGTH(name) AS name_length,
        SUBSTR(name, 1, 3) AS first_3,
        department || ' - ' || name AS combined
    FROM employees
    LIMIT 5
"""
print("String functions:")
print(pd.read_sql(query, conn))
```

---

## Date Functions

```python
# Date operations in SQLite
query = """
    SELECT
        name,
        hire_date,
        DATE('now') AS today,
        CAST((JULIANDAY('now') - JULIANDAY(hire_date)) / 365.25 AS INT) AS years_employed,
        STRFTIME('%Y', hire_date) AS hire_year,
        STRFTIME('%m', hire_date) AS hire_month
    FROM employees
    ORDER BY hire_date
"""
print("Date functions:")
print(pd.read_sql(query, conn))
```

---

## UNION and UNION ALL

Combine result sets from multiple queries.

```python
# UNION: removes duplicates
# UNION ALL: keeps all rows (faster)
query = """
    SELECT name, 'High Earner' AS category FROM employees WHERE salary > 100000
    UNION ALL
    SELECT name, 'Early Hire' AS category FROM employees WHERE hire_date < '2018-01-01'
"""
print("Combined categories:")
print(pd.read_sql(query, conn))
```

---

## EXISTS

Check if a subquery returns **any rows** (more efficient than IN for large datasets).

```python
# Employees who have made sales
query = """
    SELECT name, department
    FROM employees e
    WHERE EXISTS (
        SELECT 1 FROM sales s WHERE s.employee_id = e.id
    )
"""
print("Employees with sales:")
print(pd.read_sql(query, conn))
```

```python
# Employees who have NOT made sales
query = """
    SELECT name, department
    FROM employees e
    WHERE NOT EXISTS (
        SELECT 1 FROM sales s WHERE s.employee_id = e.id
    )
"""
print("Employees without sales:")
print(pd.read_sql(query, conn))
```

---

## Performance Optimization

### Indexes

```python
# Create index for frequently queried columns
cursor = conn.cursor()
cursor.execute("CREATE INDEX idx_emp_dept ON employees(department)")
cursor.execute("CREATE INDEX idx_emp_salary ON employees(salary)")
cursor.execute("CREATE INDEX idx_sales_emp ON sales(employee_id)")
cursor.execute("CREATE INDEX idx_sales_date ON sales(sale_date)")
conn.commit()
print("Indexes created!")
```

### EXPLAIN QUERY PLAN

```python
# See how SQLite executes a query
query = "EXPLAIN QUERY PLAN SELECT * FROM employees WHERE department = 'Engineering'"
plan = pd.read_sql(query, conn)
print("Query plan:")
print(plan)
```

### Performance Tips

| Practice | Why |
|----------|-----|
| Avoid `SELECT *` | Only fetch needed columns |
| Use indexes on WHERE/JOIN columns | Speeds up lookups |
| Filter early with WHERE | Reduce rows before joins |
| Use EXISTS over IN for large sets | Short-circuits evaluation |
| Limit results | Don't fetch 1M rows into pandas |

---

## Complete Example: Cohort Analysis

```python
import sqlite3
import pandas as pd

conn3 = sqlite3.connect(":memory:")
conn3.executescript("""
    CREATE TABLE users (
        user_id INTEGER PRIMARY KEY,
        signup_date TEXT
    );
    CREATE TABLE activity (
        user_id INTEGER,
        activity_date TEXT,
        action TEXT
    );

    INSERT INTO users VALUES
        (1,'2023-01-05'),(2,'2023-01-12'),(3,'2023-01-20'),
        (4,'2023-02-03'),(5,'2023-02-15'),(6,'2023-02-22'),
        (7,'2023-03-01'),(8,'2023-03-10'),(9,'2023-03-18');

    INSERT INTO activity VALUES
        (1,'2023-01-10','purchase'),(1,'2023-02-15','purchase'),
        (1,'2023-03-20','purchase'),(2,'2023-01-20','purchase'),
        (2,'2023-02-25','purchase'),(3,'2023-02-01','purchase'),
        (4,'2023-02-10','purchase'),(4,'2023-03-15','purchase'),
        (4,'2023-04-20','purchase'),(5,'2023-02-20','purchase'),
        (6,'2023-03-01','purchase'),(7,'2023-03-05','purchase'),
        (7,'2023-04-10','purchase'),(8,'2023-03-15','purchase');
""")

# Cohort retention analysis
query = """
    WITH cohorts AS (
        SELECT
            user_id,
            STRFTIME('%Y-%m', signup_date) AS cohort_month
        FROM users
    ),
    activity_months AS (
        SELECT
            a.user_id,
            c.cohort_month,
            STRFTIME('%Y-%m', a.activity_date) AS activity_month,
            (CAST(STRFTIME('%Y', a.activity_date) AS INT) -
             CAST(STRFTIME('%Y', c.cohort_month || '-01') AS INT)) * 12 +
            (CAST(STRFTIME('%m', a.activity_date) AS INT) -
             CAST(STRFTIME('%m', c.cohort_month || '-01') AS INT)) AS month_number
        FROM activity a
        JOIN cohorts c ON a.user_id = c.user_id
    )
    SELECT
        cohort_month,
        month_number,
        COUNT(DISTINCT user_id) AS active_users
    FROM activity_months
    WHERE month_number >= 0
    GROUP BY cohort_month, month_number
    ORDER BY cohort_month, month_number
"""
print("=== Cohort Retention ===")
print(pd.read_sql(query, conn3))

# Running total with window function
query2 = """
    WITH monthly_sales AS (
        SELECT
            STRFTIME('%Y-%m', activity_date) AS month,
            COUNT(*) AS transactions
        FROM activity
        GROUP BY STRFTIME('%Y-%m', activity_date)
    )
    SELECT
        month,
        transactions,
        SUM(transactions) OVER (ORDER BY month) AS cumulative_transactions,
        ROUND(AVG(transactions) OVER (
            ORDER BY month
            ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
        ), 1) AS moving_avg
    FROM monthly_sales
"""
print("\n=== Running Totals & Moving Average ===")
print(pd.read_sql(query2, conn3))

# Top performer per cohort
query3 = """
    WITH user_totals AS (
        SELECT
            u.user_id,
            STRFTIME('%Y-%m', u.signup_date) AS cohort,
            COUNT(a.action) AS total_actions,
            RANK() OVER (
                PARTITION BY STRFTIME('%Y-%m', u.signup_date)
                ORDER BY COUNT(a.action) DESC
            ) AS rank_in_cohort
        FROM users u
        LEFT JOIN activity a ON u.user_id = a.user_id
        GROUP BY u.user_id
    )
    SELECT cohort, user_id, total_actions
    FROM user_totals
    WHERE rank_in_cohort = 1
    ORDER BY cohort
"""
print("\n=== Top User Per Cohort ===")
print(pd.read_sql(query3, conn3))

conn3.close()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Subqueries | Queries inside queries (WHERE, FROM, SELECT) |
| CTEs | Named temporary results — cleaner than nesting |
| Window functions | Compute across rows without collapsing |
| ROW_NUMBER/RANK | Assign positions within partitions |
| LAG/LEAD | Access previous/next row values |
| Running totals | `SUM() OVER (ORDER BY ...)` |
| CASE WHEN | Conditional logic in SQL |
| EXISTS | Efficient existence checks |
| Indexes | Speed up WHERE and JOIN operations |

---

## Exercises

1. Write a CTE that finds the top earner in each department. Use RANK or ROW_NUMBER.
2. Use window functions to calculate a 3-month moving average of sales for each employee.
3. Create a query with LAG to find the month-over-month growth rate of total sales.
4. Build a cohort analysis showing user retention by signup month.
5. Use EXPLAIN QUERY PLAN to compare query performance with and without indexes.

---
