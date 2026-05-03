---
title: Python Setup for Data Science
---

# Python Setup for Data Science

Before diving into data analysis, you need a properly configured Python environment. This lesson covers installation, package management, and project setup.

---

## Installing Python

Data science requires **Python 3.9 or higher**. We recommend Python 3.11+ for the best performance and compatibility.

### Check Your Current Version

```python
# Run in terminal
# python --version
# or
# python3 --version
```

**Expected output:**
```
Python 3.11.5
```

### Download Python

- **Official:** [python.org/downloads](https://python.org/downloads)
- **macOS:** `brew install python@3.11`
- **Linux:** `sudo apt install python3.11`
- **Windows:** Download installer from python.org (check "Add to PATH")

---

## Package Managers: pip vs conda

| Feature | pip | conda |
|---------|-----|-------|
| Installs | Python packages only | Python + non-Python (C libs, R, etc.) |
| Source | PyPI (Python Package Index) | Anaconda repository |
| Environments | `venv` / `virtualenv` | Built-in `conda env` |
| Speed | Fast for pure Python | Better for scientific packages |
| Dependency resolution | Basic | Advanced (solves conflicts) |
| Best for | Web dev, general Python | Data science, ML |

---

## Option 1: Anaconda Distribution (Recommended for Beginners)

Anaconda bundles Python with 250+ data science packages pre-installed.

### Install Anaconda

1. Download from [anaconda.com/download](https://anaconda.com/download)
2. Run the installer (choose "Add to PATH" on Windows)
3. Verify installation:

```python
# Run in terminal:
# conda --version
```

**Output:**
```
conda 23.7.4
```

### Create a Data Science Environment

```python
# Create a new environment with Python 3.11
# conda create -n ds python=3.11

# Activate it
# conda activate ds

# Install additional packages if needed
# conda install pandas numpy matplotlib seaborn scikit-learn jupyter

# List installed packages
# conda list
```

### Useful Conda Commands

```python
# List all environments
# conda env list

# Export environment to file
# conda env export > environment.yml

# Create environment from file
# conda env create -f environment.yml

# Remove an environment
# conda env remove -n ds

# Update all packages
# conda update --all
```

---

## Option 2: pip + Virtual Environment

If you prefer a lightweight setup without Anaconda:

### Create a Virtual Environment

```python
# Create virtual environment
# python -m venv ds-env

# Activate it:
# macOS/Linux:
# source ds-env/bin/activate

# Windows:
# ds-env\Scripts\activate

# Your prompt changes to show the active environment:
# (ds-env) $
```

### Install Data Science Packages

```python
# Install core packages
# pip install numpy pandas matplotlib seaborn scikit-learn jupyter

# Install additional useful packages
# pip install scipy statsmodels plotly openpyxl sqlalchemy

# Install all at once from requirements.txt
# pip install -r requirements.txt
```

### Create requirements.txt

```python
# requirements.txt for data science projects:
"""
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
seaborn>=0.12.0
scikit-learn>=1.3.0
scipy>=1.11.0
statsmodels>=0.14.0
jupyter>=1.0.0
plotly>=5.15.0
openpyxl>=3.1.0
sqlalchemy>=2.0.0
requests>=2.31.0
beautifulsoup4>=4.12.0
"""
```

---

## Core Libraries Overview

Here are the essential libraries you'll use throughout this course:

### NumPy — Numerical Computing

```python
import numpy as np

# Fast array operations
arr = np.array([1, 2, 3, 4, 5])
print(f"Mean: {arr.mean()}")      # 3.0
print(f"Std: {arr.std():.2f}")    # 1.41
print(f"Sum: {arr.sum()}")        # 15
```

**Purpose:** Foundation for all numerical computing in Python. Provides N-dimensional arrays and mathematical functions.

### Pandas — Data Manipulation

```python
import pandas as pd

# Powerful DataFrames for tabular data
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "score": [92, 85, 78]
})
print(df)
print(f"\nAverage score: {df['score'].mean()}")
```

**Output:**
```
      name  score
0    Alice     92
1      Bob     85
2  Charlie     78

Average score: 85.0
```

**Purpose:** Data loading, cleaning, transformation, and analysis.

### Matplotlib — Basic Plotting

```python
import matplotlib.pyplot as plt

x = [1, 2, 3, 4, 5]
y = [2, 4, 6, 8, 10]

plt.plot(x, y, marker="o")
plt.title("Simple Line Plot")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)
plt.show()
```

**Purpose:** Create static, publication-quality visualizations.

### Seaborn — Statistical Visualization

```python
import seaborn as sns

# Beautiful statistical plots with minimal code
tips = sns.load_dataset("tips")
sns.boxplot(x="day", y="total_bill", data=tips)
plt.title("Bill Amount by Day")
plt.show()
```

**Purpose:** High-level interface for statistical graphics built on Matplotlib.

### Scikit-Learn — Machine Learning

```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Simple linear regression
X = np.array([[1], [2], [3], [4], [5]])
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1])

model = LinearRegression()
model.fit(X, y)

prediction = model.predict([[6]])
print(f"Prediction for x=6: {prediction[0]:.2f}")
```

**Output:**
```
Prediction for x=6: 12.06
```

**Purpose:** Machine learning algorithms, model evaluation, preprocessing.

### SciPy — Scientific Computing

```python
from scipy import stats

# Statistical tests
data = [23, 25, 28, 30, 22, 27, 26, 24, 29, 31]
t_stat, p_value = stats.ttest_1samp(data, popmean=25)
print(f"t-statistic: {t_stat:.3f}")
print(f"p-value: {p_value:.4f}")
```

**Purpose:** Optimization, integration, interpolation, signal processing, statistics.

### Statsmodels — Statistical Models

```python
import statsmodels.api as sm

# Detailed statistical summaries (OLS regression)
X = sm.add_constant([1, 2, 3, 4, 5])
y = [2.1, 3.9, 6.2, 7.8, 10.1]

model = sm.OLS(y, X).fit()
print(model.summary().tables[1])
```

**Purpose:** Statistical models with detailed inference (p-values, confidence intervals, R²).

---

## Verify Your Installation

Run this script to confirm everything is installed correctly:

```python
import sys

print(f"Python: {sys.version}")
print()

libraries = {
    "numpy": "np",
    "pandas": "pd",
    "matplotlib": "plt",
    "seaborn": "sns",
    "sklearn": "sklearn",
    "scipy": "scipy",
    "statsmodels": "sm",
}

for lib, alias in libraries.items():
    try:
        module = __import__(lib)
        version = getattr(module, "__version__", "unknown")
        print(f"  ✓ {lib:15s} {version}")
    except ImportError:
        print(f"  ✗ {lib:15s} NOT INSTALLED")
```

**Expected output:**
```
Python: 3.11.5 (main, Sep  2 2023, 14:16:33)

  ✓ numpy           1.25.2
  ✓ pandas          2.1.0
  ✓ matplotlib      3.7.2
  ✓ seaborn         0.12.2
  ✓ sklearn         1.3.0
  ✓ scipy           1.11.2
  ✓ statsmodels     0.14.0
```

---

## IDE Options

### Jupyter Notebook / JupyterLab

```python
# Start Jupyter Notebook
# jupyter notebook

# Or start JupyterLab (more features)
# jupyter lab
```

Best for: exploration, visualization, presentations, sharing analysis.

### VS Code

- Install the **Python** and **Jupyter** extensions
- Run `.py` files or `.ipynb` notebooks directly
- Built-in terminal, debugger, and Git integration
- IntelliSense autocomplete for pandas/numpy

Best for: production code, larger projects, version control.

### PyCharm (Professional)

- Scientific mode with inline plots
- Database tools built-in
- Strong refactoring tools

Best for: large-scale projects, teams, database-heavy work.

---

## Google Colab — Free Cloud Alternative

If you don't want to install anything locally:

1. Go to [colab.research.google.com](https://colab.research.google.com)
2. Create a new notebook
3. Most data science libraries are **pre-installed**
4. Free GPU/TPU access for machine learning

```python
# In Colab, install additional packages with:
# !pip install package-name

# Mount Google Drive for data access:
# from google.colab import drive
# drive.mount('/content/drive')
```

**Pros:** Free, no setup, GPU access, easy sharing
**Cons:** Session timeouts, limited RAM, internet required

---

## Project Structure

Organize your data science projects consistently:

```
my-project/
├── data/
│   ├── raw/              # Original, immutable data
│   ├── processed/        # Cleaned, transformed data
│   └── external/         # Data from third-party sources
├── notebooks/
│   ├── 01-exploration.ipynb
│   ├── 02-analysis.ipynb
│   └── 03-modeling.ipynb
├── src/
│   ├── __init__.py
│   ├── data_loading.py
│   ├── preprocessing.py
│   ├── features.py
│   └── models.py
├── tests/
│   └── test_preprocessing.py
├── outputs/
│   ├── figures/
│   └── models/
├── requirements.txt
├── README.md
└── .gitignore
```

### .gitignore for Data Science

```python
# .gitignore
"""
# Data files (too large for git)
data/raw/
data/external/
*.csv
*.xlsx
*.parquet

# Jupyter checkpoints
.ipynb_checkpoints/

# Python
__pycache__/
*.pyc
*.egg-info/

# Virtual environments
ds-env/
.venv/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Model files
*.pkl
*.joblib
*.h5
"""
```

---

## Python Essentials Recap

Make sure you're comfortable with these Python features:

### List Comprehensions

```python
# Filter and transform in one line
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Squares of even numbers
even_squares = [x**2 for x in numbers if x % 2 == 0]
print(even_squares)  # [4, 16, 36, 64, 100]

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrix)  # [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
```

### Lambda Functions

```python
# Short anonymous functions — common in pandas
square = lambda x: x ** 2
print(square(5))  # 25

# Sorting with lambda
students = [("Alice", 92), ("Bob", 85), ("Charlie", 78)]
students.sort(key=lambda s: s[1], reverse=True)
print(students)  # [('Alice', 92), ('Bob', 85), ('Charlie', 78)]
```

### F-Strings

```python
# Formatted string literals — clean output
name = "Revenue"
value = 1234567.89

print(f"{name}: ${value:,.2f}")          # Revenue: $1,234,567.89
print(f"{name}: ${value:.2e}")           # Revenue: $1.23e+06
print(f"{'Header':=^30}")               # ===========Header============
print(f"Percentage: {0.8567:.1%}")       # Percentage: 85.7%
```

### Dictionaries

```python
# Used everywhere in data science
config = {
    "model": "random_forest",
    "n_estimators": 100,
    "max_depth": 10,
    "random_state": 42,
}

# Dictionary comprehension
scores = {"Alice": 92, "Bob": 85, "Charlie": 78}
passed = {name: score for name, score in scores.items() if score >= 80}
print(passed)  # {'Alice': 92, 'Bob': 85}
```

---

## Complete Setup Workflow

Here's the full setup from scratch:

```python
# === Terminal Commands ===
# 1. Create project directory
# mkdir my-ds-project && cd my-ds-project

# 2. Create virtual environment
# python -m venv .venv
# source .venv/bin/activate  (macOS/Linux)

# 3. Install packages
# pip install numpy pandas matplotlib seaborn scikit-learn jupyter scipy statsmodels

# 4. Save dependencies
# pip freeze > requirements.txt

# 5. Create project structure
# mkdir -p data/raw data/processed notebooks src outputs/figures

# 6. Start Jupyter
# jupyter lab
```

### Verify Everything Works

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris

# Load a sample dataset
iris = load_iris()
df = pd.DataFrame(iris.data, columns=iris.feature_names)
df["species"] = iris.target

# Quick analysis
print("=== Iris Dataset ===")
print(f"Shape: {df.shape}")
print(f"\nFirst 3 rows:")
print(df.head(3))

# Quick plot
plt.figure(figsize=(8, 5))
for species in df["species"].unique():
    subset = df[df["species"] == species]
    plt.scatter(
        subset["sepal length (cm)"],
        subset["petal length (cm)"],
        label=f"Species {species}",
        alpha=0.7,
    )
plt.xlabel("Sepal Length (cm)")
plt.ylabel("Petal Length (cm)")
plt.title("Iris Dataset: Sepal vs Petal Length")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

print("\n✓ Setup complete! Ready for data science.")
```

---

## Summary

| Topic | Recommendation |
|-------|---------------|
| Python version | 3.11+ |
| Beginner setup | Anaconda distribution |
| Lightweight setup | pip + venv |
| IDE | Jupyter Lab or VS Code |
| Cloud option | Google Colab |
| Core packages | NumPy, Pandas, Matplotlib, Scikit-Learn |

---

## Next Lesson

**Next:** Jupyter Notebooks →

In the next lesson, you'll learn how to use Jupyter Notebooks — the interactive environment where most data science work happens.
