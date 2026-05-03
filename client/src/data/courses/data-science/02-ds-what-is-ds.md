---
title: What is Data Science?
---

# What is Data Science?

**Data Science** is the field of extracting meaningful insights, knowledge, and value from data using a combination of statistics, programming, and domain expertise.

---

## Definition

> Data science is an interdisciplinary field that uses scientific methods, algorithms, and systems to extract knowledge and insights from structured and unstructured data.

Think of data science as the bridge between **raw data** and **actionable decisions**.

```python
# Data science in one line:
raw_data → cleaned_data → analysis → insights → decisions
```

---

## Data Science vs Related Fields

People often confuse data science with similar disciplines. Here's how they differ:

| Field | Focus | Key Question |
|-------|-------|--------------|
| **Data Science** | End-to-end insights from data | "What can the data tell us?" |
| **Data Analytics** | Reporting & dashboards | "What happened?" |
| **Data Engineering** | Building data pipelines | "How do we collect & store data?" |
| **Machine Learning** | Predictive algorithms | "Can we predict the future?" |
| **Business Intelligence** | Business metrics & KPIs | "How is the business doing?" |
| **Statistics** | Mathematical theory of data | "Is this statistically significant?" |

### The Relationship

```
Data Engineering → Data Science → Machine Learning
       ↓                ↓               ↓
  Pipelines &      Analysis &      Prediction &
  Storage          Insights        Automation
```

- **Data Engineers** build the plumbing (databases, ETL pipelines)
- **Data Scientists** analyze and model the data
- **ML Engineers** deploy models to production at scale

---

## The Data Science Workflow

Every data science project follows a similar process:

### Step 1: Define the Problem

```python
# Example: E-commerce company question
problem = "Why are customers churning after their first purchase?"
goal = "Identify factors that predict customer churn"
success_metric = "Reduce churn rate by 15%"
```

Ask clear, specific questions. A vague question leads to vague answers.

### Step 2: Collect Data

```python
import pandas as pd

# Gather data from multiple sources
customers = pd.read_csv("customers.csv")
orders = pd.read_csv("orders.csv")
website_logs = pd.read_json("logs.json")

print(f"Customers: {len(customers)} records")
print(f"Orders: {len(orders)} records")
print(f"Logs: {len(website_logs)} records")
```

**Output:**
```
Customers: 50000 records
Orders: 120000 records
Logs: 2000000 records
```

### Step 3: Clean & Preprocess

```python
# Check for missing values
print(customers.isnull().sum())

# Handle missing data
customers["age"].fillna(customers["age"].median(), inplace=True)

# Remove duplicates
customers = customers.drop_duplicates(subset="customer_id")

# Fix data types
customers["signup_date"] = pd.to_datetime(customers["signup_date"])

print(f"Clean dataset: {len(customers)} rows")
```

Data cleaning typically takes **60–80%** of a data scientist's time!

### Step 4: Explore (EDA)

```python
import matplotlib.pyplot as plt

# Explore the distribution of customer ages
plt.figure(figsize=(10, 5))
plt.hist(customers["age"], bins=30, color="steelblue", edgecolor="white")
plt.title("Distribution of Customer Ages")
plt.xlabel("Age")
plt.ylabel("Count")
plt.axvline(customers["age"].mean(), color="red", linestyle="--", label="Mean")
plt.legend()
plt.show()

# Correlation between features
print(customers[["age", "total_purchases", "days_since_last"]].corr())
```

### Step 5: Model & Analyze

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Prepare features and target
X = customers[["age", "total_purchases", "days_since_last", "avg_order_value"]]
y = customers["churned"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train a model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Model accuracy: {accuracy:.2%}")
```

**Output:**
```
Model accuracy: 87.50%
```

### Step 6: Communicate Results

```python
# Feature importance — what drives churn?
import numpy as np

features = X.columns
importances = model.feature_importances_

for feat, imp in sorted(zip(features, importances), key=lambda x: -x[1]):
    print(f"  {feat:25s} {imp:.3f}")
```

**Output:**
```
  days_since_last           0.412
  total_purchases           0.287
  avg_order_value           0.189
  age                       0.112
```

**Key Insight:** Customers who haven't purchased recently are most likely to churn.

### Step 7: Deploy & Monitor

```python
# Save the model for production use
import joblib

joblib.dump(model, "churn_model.pkl")

# In production: predict for new customers
new_customer = [[35, 2, 45, 67.50]]
prediction = model.predict(new_customer)
probability = model.predict_proba(new_customer)[0][1]

print(f"Churn prediction: {'Yes' if prediction[0] else 'No'}")
print(f"Churn probability: {probability:.1%}")
```

---

## Types of Analytics

Data analytics is often categorized into four levels of increasing complexity:

### 1. Descriptive Analytics — "What happened?"

```python
# Example: Monthly sales summary
monthly_sales = orders.groupby("month")["revenue"].sum()
print("Monthly Revenue:")
print(monthly_sales)
```

Tools: dashboards, reports, SQL queries, Excel pivot tables.

### 2. Diagnostic Analytics — "Why did it happen?"

```python
# Example: Why did sales drop in March?
march_data = orders[orders["month"] == "March"]

# Drill down by category
print(march_data.groupby("category")["revenue"].sum())

# Compare to previous month
feb_data = orders[orders["month"] == "February"]
change = march_data["revenue"].sum() - feb_data["revenue"].sum()
print(f"Revenue change: ${change:,.2f}")
```

Tools: correlation analysis, drill-down reports, root cause analysis.

### 3. Predictive Analytics — "What will happen?"

```python
# Example: Forecast next month's sales
from sklearn.linear_model import LinearRegression

# Use historical data to predict future
X_months = np.arange(1, 13).reshape(-1, 1)
y_sales = monthly_sales.values

model = LinearRegression()
model.fit(X_months, y_sales)

# Predict month 13
next_month = model.predict([[13]])
print(f"Predicted next month sales: ${next_month[0]:,.2f}")
```

Tools: machine learning models, statistical forecasting, neural networks.

### 4. Prescriptive Analytics — "What should we do?"

```python
# Example: Optimize pricing
# If price elasticity = -1.5, a 10% price decrease → 15% demand increase

price_elasticity = -1.5
price_change = -0.10  # 10% decrease
demand_change = price_elasticity * price_change  # 15% increase

current_price = 50
current_demand = 1000

new_price = current_price * (1 + price_change)
new_demand = current_demand * (1 + demand_change)
new_revenue = new_price * new_demand

print(f"Current revenue: ${current_price * current_demand:,.2f}")
print(f"Projected revenue: ${new_revenue:,.2f}")
print(f"Revenue change: +${new_revenue - current_price * current_demand:,.2f}")
```

Tools: optimization algorithms, simulation, recommendation engines.

---

## Data Types

Understanding data types is fundamental to data science.

### By Structure

| Type | Description | Examples |
|------|-------------|----------|
| **Structured** | Organized in tables (rows & columns) | Databases, spreadsheets, CSV |
| **Semi-structured** | Has some organization | JSON, XML, HTML, emails |
| **Unstructured** | No predefined format | Text, images, audio, video |

### By Nature

| Type | Subtype | Description | Examples |
|------|---------|-------------|----------|
| **Numerical** | Continuous | Infinite values in a range | Temperature, height, price |
| **Numerical** | Discrete | Countable values | Number of items, page views |
| **Categorical** | Nominal | No natural order | Color, country, gender |
| **Categorical** | Ordinal | Has natural order | Rating (1-5), education level |

```python
import pandas as pd

# Example: identifying data types
data = {
    "name": ["Alice", "Bob", "Charlie"],        # Categorical (nominal)
    "age": [28, 35, 42],                        # Numerical (discrete)
    "salary": [75000.50, 85000.00, 92000.75],   # Numerical (continuous)
    "department": ["Engineering", "Sales", "HR"], # Categorical (nominal)
    "satisfaction": ["High", "Medium", "High"],   # Categorical (ordinal)
}

df = pd.DataFrame(data)
print(df.dtypes)
```

**Output:**
```
name            object
age              int64
salary         float64
department      object
satisfaction    object
dtype: object
```

---

## Real-World Applications

Data science is transforming every industry:

| Industry | Application | Example |
|----------|-------------|---------|
| **Healthcare** | Disease prediction | Predicting diabetes risk from patient records |
| **Finance** | Fraud detection | Identifying suspicious transactions in real-time |
| **Marketing** | Customer segmentation | Grouping customers for targeted campaigns |
| **Sports** | Performance analytics | Moneyball — optimizing team composition |
| **Climate** | Weather forecasting | Predicting extreme weather events |
| **Retail** | Recommendation engines | "Customers who bought X also bought Y" |
| **Transportation** | Route optimization | Uber/Lyft surge pricing & routing |
| **Education** | Personalized learning | Adaptive learning platforms |

---

## Key Skills for Data Scientists

A data scientist needs a blend of skills:

```python
skills = {
    "Technical": [
        "Python / R programming",
        "SQL & database querying",
        "Statistics & probability",
        "Machine learning algorithms",
        "Data visualization",
    ],
    "Analytical": [
        "Critical thinking",
        "Problem decomposition",
        "Pattern recognition",
        "Experimental design",
    ],
    "Communication": [
        "Data storytelling",
        "Report writing",
        "Presentation skills",
        "Stakeholder management",
    ],
    "Domain": [
        "Business understanding",
        "Industry knowledge",
        "Asking the right questions",
    ],
}

for category, items in skills.items():
    print(f"\n{category} Skills:")
    for skill in items:
        print(f"  • {skill}")
```

---

## The Data Science Tools Ecosystem

```python
tools_by_stage = {
    "Data Collection":    ["SQL", "APIs", "Web Scraping", "Spark"],
    "Data Processing":    ["Pandas", "NumPy", "Dask", "PySpark"],
    "Visualization":      ["Matplotlib", "Seaborn", "Plotly", "Tableau"],
    "Machine Learning":   ["Scikit-Learn", "XGBoost", "TensorFlow", "PyTorch"],
    "Deployment":         ["Flask", "FastAPI", "Docker", "MLflow"],
    "Collaboration":      ["Jupyter", "Git", "DVC", "Weights & Biases"],
}

for stage, tools in tools_by_stage.items():
    print(f"{stage:20s} → {', '.join(tools)}")
```

---

## The T-Shaped Data Scientist

The ideal data scientist has **broad knowledge** across many areas with **deep expertise** in one or two:

```
         BREADTH (know a little about a lot)
    ┌─────────────────────────────────────────┐
    │  Stats │ ML │ Viz │ SQL │ Cloud │ Ethics│
    └───┬────┴────┴─────┴─────┴───────┴──────┘
        │
        │  DEPTH (expert in one area)
        │
        ▼
    Machine Learning
    & Deep Learning
```

---

## Complete Example: From Data to Insight

Let's put it all together with a simple example:

```python
import pandas as pd
import matplotlib.pyplot as plt

# 1. Load data
data = {
    "city": ["NYC", "LA", "Chicago", "Houston", "Phoenix",
             "Philadelphia", "San Antonio", "San Diego"],
    "population_m": [8.3, 3.9, 2.7, 2.3, 1.6, 1.6, 1.5, 1.4],
    "avg_rent": [3500, 2800, 1900, 1400, 1300, 1600, 1200, 2200],
    "median_income": [67000, 62000, 58000, 52000, 55000, 48000, 50000, 72000],
}
df = pd.DataFrame(data)

# 2. Explore
print("=== Dataset Overview ===")
print(df.describe())

# 3. Analyze — rent as % of income
df["rent_burden"] = (df["avg_rent"] * 12) / df["median_income"] * 100
print("\n=== Rent Burden (% of income) ===")
print(df[["city", "rent_burden"]].sort_values("rent_burden", ascending=False))

# 4. Visualize
plt.figure(figsize=(10, 5))
colors = ["red" if x > 30 else "steelblue" for x in df["rent_burden"]]
plt.bar(df["city"], df["rent_burden"], color=colors)
plt.axhline(y=30, color="gray", linestyle="--", label="30% threshold")
plt.title("Rent Burden by City (% of Median Income)")
plt.ylabel("Rent as % of Income")
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# 5. Insight
high_burden = df[df["rent_burden"] > 30]
print(f"\n=== INSIGHT ===")
print(f"{len(high_burden)} cities have rent burden > 30%:")
for _, row in high_burden.iterrows():
    print(f"  {row['city']}: {row['rent_burden']:.1f}%")
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Data Science | Extracting insights from data using stats + programming |
| Workflow | Define → Collect → Clean → Explore → Model → Communicate → Deploy |
| Analytics Types | Descriptive, Diagnostic, Predictive, Prescriptive |
| Data Types | Structured/Semi/Unstructured; Numerical/Categorical |
| Key Skills | Python, SQL, statistics, ML, communication |

---

## Next Lesson

**Next:** Python Setup for Data Science →

In the next lesson, you'll set up your Python environment with all the tools needed for data science work.
