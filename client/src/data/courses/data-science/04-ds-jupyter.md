---
title: Jupyter Notebooks
---

# Jupyter Notebooks

Jupyter Notebooks are the most popular tool for interactive data science. They let you combine code, output, visualizations, and narrative text in a single document.

---

## What is Jupyter?

**Jupyter** is an open-source interactive computing environment that allows you to create documents containing:

- Live code (Python, R, Julia, and 40+ languages)
- Equations (LaTeX/KaTeX)
- Visualizations (charts, plots, images)
- Narrative text (Markdown)

> The name **Jupyter** comes from three core languages: **Ju**lia + **Py**thon + **R**

---

## Starting Jupyter

### Jupyter Notebook (Classic)

```python
# Start the classic notebook interface
# jupyter notebook

# Opens in browser at http://localhost:8888
```

### JupyterLab (Modern)

```python
# Start JupyterLab — more powerful interface
# jupyter lab

# Opens in browser at http://localhost:8888/lab
```

### VS Code

1. Install the **Jupyter** extension
2. Create a new `.ipynb` file
3. Run cells directly in the editor

---

## Notebook Structure

A Jupyter Notebook (`.ipynb` file) consists of **cells**. Each cell is one of three types:

| Cell Type | Purpose | Example |
|-----------|---------|---------|
| **Code** | Execute Python code | `x = 5 + 3` |
| **Markdown** | Documentation & text | `# My Analysis` |
| **Raw** | Unformatted text | Plain text (rarely used) |

---

## Code Cells

Code cells are where you write and execute Python:

```python
# This is a code cell
import numpy as np

data = np.array([10, 20, 30, 40, 50])
mean = data.mean()
print(f"Mean: {mean}")
```

**Output:**
```
Mean: 30.0
```

### Running Code Cells

| Shortcut | Action |
|----------|--------|
| `Shift + Enter` | Run cell and move to next |
| `Ctrl + Enter` | Run cell and stay |
| `Alt + Enter` | Run cell and insert new below |

### Auto-Display of Last Expression

```python
# The last expression in a cell is automatically displayed
import pandas as pd

df = pd.DataFrame({"A": [1, 2, 3], "B": [4, 5, 6]})
df  # This gets displayed as a nice table automatically
```

**Output:**

|   | A | B |
|---|---|---|
| 0 | 1 | 4 |
| 1 | 2 | 5 |
| 2 | 3 | 6 |

### Multiple Outputs

```python
# By default, only the last expression is shown
# Use print() or display() for multiple outputs
from IPython.display import display

df1 = pd.DataFrame({"x": [1, 2]})
df2 = pd.DataFrame({"y": [3, 4]})

print("DataFrame 1:")
display(df1)
print("\nDataFrame 2:")
display(df2)
```

### Cell Output Types

```python
# Text output
print("Hello, Data Science!")

# Rich output — DataFrames render as HTML tables
df = pd.DataFrame({"col": [1, 2, 3]})
display(df)

# Plot output
import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [1, 4, 9])
plt.title("Square Numbers")
plt.show()

# HTML output
from IPython.display import HTML
display(HTML("<h3 style='color:blue'>Styled HTML</h3>"))
```

---

## Markdown Cells

Markdown cells let you write formatted documentation:

### Headers

```python
# In a Markdown cell, write:
"""
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
"""
```

### Text Formatting

```python
"""
**Bold text**
*Italic text*
~~Strikethrough~~
`inline code`
"""
```

### Lists

```python
"""
Unordered list:
- Item 1
- Item 2
  - Sub-item

Ordered list:
1. First
2. Second
3. Third
"""
```

### Links and Images

```python
"""
[Link text](https://example.com)

![Alt text](path/to/image.png)
"""
```

### LaTeX Math

Inline math with single dollar signs:

```python
"""
The mean is $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$
"""
```

Renders as: $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$

Block math with double dollar signs:

```python
"""
$$
\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2
$$
"""
```

Renders as:

$$\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i - \bar{x})^2$$

### Tables

```python
"""
| Column A | Column B | Column C |
|----------|----------|----------|
| 1        | 2        | 3        |
| 4        | 5        | 6        |
"""
```

---

## Keyboard Shortcuts

Jupyter has two modes: **Command mode** (press `Esc`) and **Edit mode** (press `Enter`).

### Command Mode (Blue Border)

| Shortcut | Action |
|----------|--------|
| `A` | Insert cell above |
| `B` | Insert cell below |
| `DD` | Delete cell |
| `M` | Convert to Markdown |
| `Y` | Convert to Code |
| `C` | Copy cell |
| `V` | Paste cell below |
| `X` | Cut cell |
| `Z` | Undo delete |
| `Shift + M` | Merge cells |
| `L` | Toggle line numbers |
| `O` | Toggle output |
| `1-6` | Heading levels |

### Edit Mode (Green Border)

| Shortcut | Action |
|----------|--------|
| `Tab` | Autocomplete / indent |
| `Shift + Tab` | Show docstring (tooltip) |
| `Ctrl + /` | Toggle comment |
| `Ctrl + D` | Delete line |
| `Ctrl + Shift + -` | Split cell at cursor |

---

## Magic Commands

Jupyter has special "magic" commands prefixed with `%` (line magic) or `%%` (cell magic):

### Timing Code

```python
# Time a single line
%timeit sum(range(1000))
```

**Output:**
```
12.3 µs ± 234 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)
```

```python
%%timeit
# Time an entire cell
total = 0
for i in range(1000):
    total += i
```

**Output:**
```
45.6 µs ± 1.23 µs per loop (mean ± std. dev. of 7 runs, 10,000 loops each)
```

### Displaying Plots Inline

```python
# Required for Matplotlib plots to show in notebook
%matplotlib inline

import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [1, 4, 9])
plt.show()
```

### Listing Variables

```python
x = 10
name = "hello"
data = [1, 2, 3]

%who       # List all variables
%whos      # Detailed list with types and values
```

**Output of `%whos`:**
```
Variable   Type    Data/Info
----------------------------
data       list    n=3
name       str     hello
x          int     10
```

### Shell Commands

```python
# Run shell commands with !
!pip install pandas --quiet
!ls data/
!pwd
```

### Auto-Reload Modules

```python
# Automatically reload imported modules when they change
%load_ext autoreload
%autoreload 2

# Now any changes to imported .py files are picked up automatically
import my_module  # Re-imported on every cell run
```

### Other Useful Magics

```python
# Write cell contents to a file
%%writefile my_script.py
import pandas as pd
print("Hello from script!")

# Run a Python script
%run my_script.py

# Display environment variables
%env

# Show command history
%history -n 1-10

# Reset all variables
%reset -f
```

---

## Working with Data in Notebooks

### DataFrames as Pretty Tables

```python
import pandas as pd

df = pd.DataFrame({
    "Name": ["Alice", "Bob", "Charlie", "Diana"],
    "Age": [28, 35, 42, 31],
    "Salary": [75000, 85000, 92000, 68000],
    "Department": ["Engineering", "Marketing", "Engineering", "Sales"],
})

# Automatically renders as a nice HTML table
df
```

### Controlling Display Options

```python
# Show more rows/columns
pd.set_option("display.max_rows", 100)
pd.set_option("display.max_columns", 50)
pd.set_option("display.width", 120)
pd.set_option("display.float_format", "${:,.2f}".format)

# Reset to defaults
pd.reset_option("all")
```

### Rich Output

```python
from IPython.display import display, Image, HTML, Markdown

# Display multiple DataFrames
display(df.head(2))
display(df.tail(2))

# Display an image
# display(Image("chart.png"))

# Display HTML
display(HTML("<div style='background:#f0f0f0; padding:10px'>"
             "<b>Key Finding:</b> Revenue grew 25% YoY</div>"))

# Display Markdown
display(Markdown("### Results\n- Revenue: **$1.2M**\n- Growth: **25%**"))
```

---

## JupyterLab vs Classic Notebook vs VS Code

| Feature | Classic Notebook | JupyterLab | VS Code |
|---------|-----------------|------------|---------|
| Interface | Single document | Multi-tab IDE | Full IDE |
| File browser | Basic | Advanced | Full |
| Terminal | No | Yes | Yes |
| Extensions | Limited | Many | Vast |
| Debugger | No | Yes | Yes |
| Git integration | No | Extension | Built-in |
| Dark mode | No | Yes | Yes |
| Performance | Light | Medium | Heavy |

### Recommendation

- **Learning & exploration:** JupyterLab
- **Quick analysis:** Classic Notebook
- **Production projects:** VS Code
- **Sharing & presentation:** Notebooks exported to HTML

---

## Best Practices

### 1. Restart and Run All Before Sharing

```python
# Always do this before sharing or submitting:
# Kernel → Restart & Run All

# This ensures:
# - Cells run in order (top to bottom)
# - No hidden state from out-of-order execution
# - Results are reproducible
```

### 2. Use Meaningful Cell Order

```python
# Good: Linear flow
# Cell 1: Imports
# Cell 2: Load data
# Cell 3: Clean data
# Cell 4: Explore
# Cell 5: Model
# Cell 6: Results

# Bad: Random order, cells depend on later cells
```

### 3. Mix Code and Markdown

```python
# Good notebook structure:
"""
## 1. Data Loading
Brief explanation of the data source...

[code cell - load data]

## 2. Data Cleaning
We found 15% missing values in the 'age' column...

[code cell - handle missing values]

## 3. Key Finding
Revenue increased 25% after the marketing campaign.

[code cell - visualization]
"""
```

### 4. Don't Put Secrets in Notebooks

```python
# BAD — never do this!
# api_key = "sk-abc123secretkey"

# GOOD — use environment variables
import os
api_key = os.environ.get("API_KEY")

# GOOD — use a .env file (not tracked in git)
# from dotenv import load_dotenv
# load_dotenv()
# api_key = os.environ["API_KEY"]
```

### 5. Keep Cells Focused

```python
# GOOD — one logical step per cell
# Cell: Load and preview data
df = pd.read_csv("data.csv")
print(f"Shape: {df.shape}")
df.head()
```

```python
# BAD — too much in one cell (hard to debug)
# df = pd.read_csv("data.csv")
# df = df.dropna()
# df["new_col"] = df["a"] + df["b"]
# model = LinearRegression().fit(X, y)
# print(model.score(X, y))
# plt.scatter(...)
```

### 6. Use Descriptive Variable Names

```python
# GOOD
customer_churn_rate = churned_customers / total_customers
monthly_revenue = df.groupby("month")["revenue"].sum()

# BAD
x = a / b
tmp = df.groupby("month")["revenue"].sum()
```

---

## Complete Notebook Workflow Example

Here's what a well-structured analysis notebook looks like:

```python
# === Cell 1: Setup ===
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Configure display
pd.set_option("display.max_columns", 20)
plt.style.use("seaborn-v0_8-whitegrid")
%matplotlib inline

print("Libraries loaded ✓")
```

```python
# === Cell 2: Load Data ===
df = pd.read_csv("data/sales_2024.csv", parse_dates=["date"])

print(f"Dataset: {df.shape[0]} rows × {df.shape[1]} columns")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
df.head()
```

```python
# === Cell 3: Data Quality Check ===
print("Missing values:")
print(df.isnull().sum())
print(f"\nDuplicates: {df.duplicated().sum()}")
print(f"\nData types:")
print(df.dtypes)
```

```python
# === Cell 4: Exploratory Analysis ===
fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Distribution of revenue
axes[0].hist(df["revenue"], bins=30, color="steelblue", edgecolor="white")
axes[0].set_title("Revenue Distribution")

# Revenue over time
daily_rev = df.groupby("date")["revenue"].sum()
axes[1].plot(daily_rev.index, daily_rev.values, color="green")
axes[1].set_title("Daily Revenue")

# Revenue by category
cat_rev = df.groupby("category")["revenue"].sum().sort_values()
axes[2].barh(cat_rev.index, cat_rev.values, color="coral")
axes[2].set_title("Revenue by Category")

plt.tight_layout()
plt.show()
```

```python
# === Cell 5: Key Insights ===
total_revenue = df["revenue"].sum()
avg_order = df["revenue"].mean()
top_category = df.groupby("category")["revenue"].sum().idxmax()

print(f"📊 Key Metrics:")
print(f"   Total Revenue: ${total_revenue:,.2f}")
print(f"   Average Order: ${avg_order:,.2f}")
print(f"   Top Category:  {top_category}")
```

---

## Exporting Notebooks

### Export to HTML (for sharing)

```python
# From terminal:
# jupyter nbconvert --to html my_notebook.ipynb

# Creates my_notebook.html — viewable in any browser
```

### Export to PDF

```python
# Requires LaTeX installation
# jupyter nbconvert --to pdf my_notebook.ipynb

# Alternative: print to PDF from the HTML export
```

### Export to Python Script

```python
# jupyter nbconvert --to script my_notebook.ipynb

# Creates my_notebook.py — removes markdown, keeps code
```

### Export to Slides

```python
# jupyter nbconvert --to slides my_notebook.ipynb --post serve

# Creates a reveal.js presentation!
# Tag cells as "Slide", "Sub-Slide", "Fragment", or "Skip"
```

---

## Troubleshooting

### Common Issues

```python
# Issue: Kernel dies frequently
# Solution: Check memory usage
import psutil
print(f"RAM used: {psutil.virtual_memory().percent}%")

# Issue: Import not found
# Solution: Install in the correct environment
import sys
print(f"Python: {sys.executable}")
# !{sys.executable} -m pip install package-name

# Issue: Plot not showing
# Solution: Add this at the top
%matplotlib inline

# Issue: Stale variables from deleted cells
# Solution: Restart kernel and run all
```

---

## Summary

| Concept | Details |
|---------|---------|
| Jupyter | Interactive computing: code + text + plots |
| Cell types | Code, Markdown, Raw |
| Run cell | Shift+Enter (run + next), Ctrl+Enter (run in place) |
| Modes | Command (Esc) and Edit (Enter) |
| Magic commands | `%timeit`, `%matplotlib inline`, `%who`, `!shell` |
| Best practice | Restart & Run All before sharing |
| Export | HTML, PDF, Python script, slides |

---

## Next Lesson

**Next:** NumPy Basics →

In the next lesson, you'll learn NumPy — the foundational library for numerical computing that powers all of data science in Python.
