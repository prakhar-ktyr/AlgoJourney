---
title: Matplotlib Basics
---

# Matplotlib Basics

**Matplotlib** is the foundational plotting library for Python. Nearly every data visualization in Python builds on top of it.

Whether you need a quick line chart or a publication-quality figure, Matplotlib has you covered.

---

## What is Matplotlib?

Matplotlib is a comprehensive library for creating static, animated, and interactive visualizations in Python.

Key facts:

- Created by John Hunter in 2003
- Inspired by MATLAB's plotting interface
- Works with NumPy arrays and Pandas DataFrames
- Produces figures in many formats (PNG, PDF, SVG, etc.)
- Backend for Seaborn, pandas `.plot()`, and other libraries

---

## Installing and Importing

```python
# Install (if not already installed)
# pip install matplotlib

# Standard import convention
import matplotlib.pyplot as plt
import numpy as np
```

The `pyplot` module provides a MATLAB-like interface. By convention, it is always imported as `plt`.

---

## Two Interfaces

Matplotlib offers two ways to create plots:

### 1. pyplot Interface (MATLAB-style)

Quick and simple — good for interactive exploration:

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title("Sine Wave")
plt.xlabel("x")
plt.ylabel("sin(x)")
plt.show()
```

### 2. Object-Oriented Interface (Recommended)

More explicit and flexible — best for complex figures:

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

fig, ax = plt.subplots()
ax.plot(x, y)
ax.set_title("Sine Wave")
ax.set_xlabel("x")
ax.set_ylabel("sin(x)")
plt.show()
```

> **Best Practice:** Use the object-oriented interface for any figure you plan to save or customize. It gives you direct control over figure and axes objects.

---

## Line Plot

The most basic plot type. Connects data points with lines.

### Basic Line Plot

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, y)
ax.set_title("Basic Line Plot")
ax.set_xlabel("x")
ax.set_ylabel("y")
plt.show()
```

### Color, Linestyle, and Marker

You can customize the appearance using format strings or keyword arguments:

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 20)

fig, ax = plt.subplots(figsize=(10, 6))

# Format string: 'color linestyle marker'
ax.plot(x, np.sin(x), 'r--o', label='sin(x)')   # red, dashed, circles
ax.plot(x, np.cos(x), 'b-s', label='cos(x)')    # blue, solid, squares
ax.plot(x, np.sin(2*x), 'g-.^', label='sin(2x)') # green, dash-dot, triangles

ax.set_title("Line Styles and Markers")
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend()
plt.show()
```

### Common Format Options

| Character | Color   | Character | Linestyle  | Character | Marker   |
|-----------|---------|-----------|------------|-----------|----------|
| `'r'`     | Red     | `'-'`     | Solid      | `'o'`     | Circle   |
| `'b'`     | Blue    | `'--'`    | Dashed     | `'s'`     | Square   |
| `'g'`     | Green   | `'-.'`    | Dash-dot   | `'^'`     | Triangle |
| `'k'`     | Black   | `':'`     | Dotted     | `'*'`     | Star     |
| `'m'`     | Magenta |           |            | `'+'`     | Plus     |

### Keyword Arguments (More Control)

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 50)

fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, np.sin(x),
        color='#e74c3c',       # hex color
        linestyle='--',
        linewidth=2,
        marker='o',
        markersize=4,
        markerfacecolor='white',
        markeredgecolor='#e74c3c',
        label='sin(x)')

ax.legend()
ax.set_title("Customized Line Plot")
plt.show()
```

---

## Scatter Plot

Shows individual data points — useful for seeing relationships between two variables.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
n = 100

x = np.random.randn(n)
y = 2 * x + np.random.randn(n) * 0.5
colors = np.random.rand(n)
sizes = np.abs(np.random.randn(n)) * 200

fig, ax = plt.subplots(figsize=(8, 6))

scatter = ax.scatter(x, y,
                     c=colors,        # color mapped to values
                     s=sizes,         # size of each point
                     alpha=0.7,       # transparency
                     cmap='viridis',  # colormap
                     edgecolors='black',
                     linewidths=0.5)

ax.set_title("Scatter Plot with Color and Size")
ax.set_xlabel("X values")
ax.set_ylabel("Y values")

# Add colorbar
plt.colorbar(scatter, ax=ax, label='Color Value')
plt.show()
```

### Scatter Plot Parameters

| Parameter    | Description                        |
|--------------|------------------------------------|
| `c`          | Color of markers (array or single) |
| `s`          | Size of markers in points²         |
| `alpha`      | Transparency (0 to 1)             |
| `cmap`       | Colormap name                      |
| `edgecolors` | Marker edge color                  |
| `marker`     | Marker shape                       |

---

## Bar Chart

Compares values across categories.

### Vertical Bar Chart

```python
import matplotlib.pyplot as plt

categories = ['Python', 'JavaScript', 'Java', 'C++', 'Go']
values = [35, 28, 20, 12, 5]
colors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12']

fig, ax = plt.subplots(figsize=(8, 5))

bars = ax.bar(categories, values, color=colors, edgecolor='black', linewidth=0.8)

ax.set_title("Programming Language Popularity")
ax.set_xlabel("Language")
ax.set_ylabel("Usage (%)")
ax.set_ylim(0, 40)

# Add value labels on top of bars
for bar, val in zip(bars, values):
    ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
            f'{val}%', ha='center', va='bottom', fontweight='bold')

plt.show()
```

### Horizontal Bar Chart

```python
import matplotlib.pyplot as plt

categories = ['Python', 'JavaScript', 'Java', 'C++', 'Go']
values = [35, 28, 20, 12, 5]

fig, ax = plt.subplots(figsize=(8, 5))
ax.barh(categories, values, color='steelblue', edgecolor='black')
ax.set_xlabel("Usage (%)")
ax.set_title("Language Popularity (Horizontal)")
plt.show()
```

### Grouped Bar Chart

```python
import matplotlib.pyplot as plt
import numpy as np

categories = ['Q1', 'Q2', 'Q3', 'Q4']
product_a = [20, 35, 30, 35]
product_b = [25, 32, 34, 20]
product_c = [15, 22, 28, 30]

x = np.arange(len(categories))
width = 0.25

fig, ax = plt.subplots(figsize=(10, 6))

ax.bar(x - width, product_a, width, label='Product A', color='#3498db')
ax.bar(x, product_b, width, label='Product B', color='#e74c3c')
ax.bar(x + width, product_c, width, label='Product C', color='#2ecc71')

ax.set_xlabel("Quarter")
ax.set_ylabel("Sales (units)")
ax.set_title("Quarterly Sales by Product")
ax.set_xticks(x)
ax.set_xticklabels(categories)
ax.legend()
plt.show()
```

### Stacked Bar Chart

```python
import matplotlib.pyplot as plt
import numpy as np

categories = ['2020', '2021', '2022', '2023']
desktop = [45, 40, 35, 30]
mobile = [40, 45, 48, 52]
tablet = [15, 15, 17, 18]

fig, ax = plt.subplots(figsize=(8, 6))

ax.bar(categories, desktop, label='Desktop', color='#3498db')
ax.bar(categories, mobile, bottom=desktop, label='Mobile', color='#e74c3c')
ax.bar(categories, tablet,
       bottom=np.array(desktop) + np.array(mobile),
       label='Tablet', color='#2ecc71')

ax.set_ylabel("Traffic Share (%)")
ax.set_title("Web Traffic by Device Type")
ax.legend()
plt.show()
```

---

## Histogram

Shows the distribution (frequency) of numerical data.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
data = np.random.normal(loc=170, scale=10, size=1000)  # heights in cm

fig, ax = plt.subplots(figsize=(8, 5))

ax.hist(data, bins=30, edgecolor='black', color='steelblue', alpha=0.7)
ax.set_title("Distribution of Heights")
ax.set_xlabel("Height (cm)")
ax.set_ylabel("Frequency")
ax.axvline(data.mean(), color='red', linestyle='--', label=f'Mean = {data.mean():.1f}')
ax.legend()
plt.show()
```

### Probability Density Histogram

Setting `density=True` normalizes the histogram so the area sums to 1:

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)
data = np.random.normal(0, 1, 5000)

fig, ax = plt.subplots(figsize=(8, 5))

ax.hist(data, bins=50, density=True, edgecolor='black',
        color='lightblue', alpha=0.7, label='Histogram')

# Overlay theoretical PDF
x = np.linspace(-4, 4, 100)
pdf = (1 / np.sqrt(2 * np.pi)) * np.exp(-x**2 / 2)
ax.plot(x, pdf, 'r-', linewidth=2, label='Normal PDF')

ax.set_title("Probability Density Histogram")
ax.set_xlabel("Value")
ax.set_ylabel("Density")
ax.legend()
plt.show()
```

The normal distribution PDF is:

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

---

## Customization

### Titles and Labels

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 50)
fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, np.sin(x))

ax.set_title("Customized Title", fontsize=16, fontweight='bold', pad=15)
ax.set_xlabel("X Axis Label", fontsize=12, labelpad=10)
ax.set_ylabel("Y Axis Label", fontsize=12, labelpad=10)
plt.show()
```

### Ticks

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 100)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, np.sin(x))

# Custom tick positions and labels
ax.set_xticks([0, np.pi/2, np.pi, 3*np.pi/2, 2*np.pi])
ax.set_xticklabels(['0', 'π/2', 'π', '3π/2', '2π'])

ax.set_yticks([-1, -0.5, 0, 0.5, 1])
ax.tick_params(axis='both', labelsize=11)
plt.show()
```

### Grid

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, np.sin(x))

ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.8)
# Or finer control:
# ax.grid(which='major', alpha=0.5)
# ax.grid(which='minor', alpha=0.2)
# ax.minorticks_on()
plt.show()
```

### Legend

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(8, 5))

ax.plot(x, np.sin(x), label='sin(x)')
ax.plot(x, np.cos(x), label='cos(x)')

ax.legend(loc='upper right', fontsize=11, framealpha=0.9,
          shadow=True, borderpad=1)
plt.show()
```

Location options: `'upper right'`, `'upper left'`, `'lower left'`, `'lower right'`, `'center'`, `'best'`.

### Axis Limits

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, np.sin(x))

ax.set_xlim(0, 8)      # x-axis range
ax.set_ylim(-1.5, 1.5) # y-axis range
plt.show()
```

---

## Subplots

Create multiple plots in one figure.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 100)

fig, axes = plt.subplots(2, 2, figsize=(12, 8))

# Top-left: line plot
axes[0, 0].plot(x, np.sin(x), 'b-')
axes[0, 0].set_title("sin(x)")

# Top-right: cosine
axes[0, 1].plot(x, np.cos(x), 'r-')
axes[0, 1].set_title("cos(x)")

# Bottom-left: tangent (clipped)
y_tan = np.tan(x)
y_tan[np.abs(y_tan) > 5] = np.nan
axes[1, 0].plot(x, y_tan, 'g-')
axes[1, 0].set_title("tan(x)")
axes[1, 0].set_ylim(-5, 5)

# Bottom-right: exponential
axes[1, 1].plot(x, np.exp(np.sin(x)), 'm-')
axes[1, 1].set_title("exp(sin(x))")

# Add spacing and overall title
fig.suptitle("Trigonometric Functions", fontsize=14, fontweight='bold')
fig.tight_layout()
plt.show()
```

### Different Subplot Sizes

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 3, figsize=(14, 4),
                          gridspec_kw={'width_ratios': [2, 1, 1]})

x = np.linspace(0, 10, 100)
axes[0].plot(x, np.sin(x))
axes[0].set_title("Wide Plot")

axes[1].bar(['A', 'B', 'C'], [3, 7, 5])
axes[1].set_title("Bar")

axes[2].scatter(np.random.rand(20), np.random.rand(20))
axes[2].set_title("Scatter")

fig.tight_layout()
plt.show()
```

---

## Saving Figures

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, np.sin(x))
ax.set_title("Save Example")

# Save as PNG (high resolution)
fig.savefig('plot.png', dpi=300, bbox_inches='tight')

# Save as PDF (vector format)
fig.savefig('plot.pdf', bbox_inches='tight')

# Save as SVG (scalable)
fig.savefig('plot.svg', bbox_inches='tight')
```

| Parameter      | Description                          |
|----------------|--------------------------------------|
| `dpi`          | Dots per inch (resolution)          |
| `bbox_inches`  | `'tight'` removes extra whitespace  |
| `facecolor`    | Background color of figure          |
| `transparent`  | Transparent background if `True`    |

---

## Complete Example: Sales Dashboard

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
revenue = [45, 52, 48, 61, 55, 67, 72, 69, 75, 80, 85, 92]
expenses = [38, 42, 40, 48, 45, 52, 55, 53, 58, 60, 62, 65]
profit = [r - e for r, e in zip(revenue, expenses)]

fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Revenue line chart
axes[0, 0].plot(months, revenue, 'b-o', label='Revenue', linewidth=2)
axes[0, 0].plot(months, expenses, 'r--s', label='Expenses', linewidth=2)
axes[0, 0].fill_between(range(12), expenses, revenue, alpha=0.1, color='green')
axes[0, 0].set_title("Revenue vs Expenses", fontweight='bold')
axes[0, 0].set_ylabel("Amount ($K)")
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Profit bar chart
colors = ['green' if p > 0 else 'red' for p in profit]
axes[0, 1].bar(months, profit, color=colors, edgecolor='black', alpha=0.8)
axes[0, 1].set_title("Monthly Profit", fontweight='bold')
axes[0, 1].set_ylabel("Profit ($K)")
axes[0, 1].axhline(y=0, color='black', linewidth=0.8)
axes[0, 1].grid(True, alpha=0.3, axis='y')

# Revenue distribution histogram
all_values = np.random.normal(65, 15, 200)
axes[1, 0].hist(all_values, bins=20, edgecolor='black', color='steelblue', alpha=0.7)
axes[1, 0].set_title("Revenue Distribution", fontweight='bold')
axes[1, 0].set_xlabel("Revenue ($K)")
axes[1, 0].set_ylabel("Frequency")

# Category scatter
categories_x = np.random.rand(50) * 100
categories_y = np.random.rand(50) * 100
sizes = np.random.rand(50) * 300
axes[1, 1].scatter(categories_x, categories_y, s=sizes,
                   alpha=0.6, c=sizes, cmap='viridis', edgecolors='black')
axes[1, 1].set_title("Product Performance", fontweight='bold')
axes[1, 1].set_xlabel("Market Share (%)")
axes[1, 1].set_ylabel("Growth (%)")

fig.suptitle("Sales Dashboard — 2024", fontsize=16, fontweight='bold', y=1.02)
fig.tight_layout()
fig.savefig('sales_dashboard.png', dpi=300, bbox_inches='tight')
plt.show()
```

---

## Quick Reference

| Task                | Code                                         |
|---------------------|----------------------------------------------|
| Create figure       | `fig, ax = plt.subplots()`                  |
| Line plot           | `ax.plot(x, y)`                             |
| Scatter plot        | `ax.scatter(x, y)`                          |
| Bar chart           | `ax.bar(cats, vals)`                        |
| Histogram           | `ax.hist(data, bins=30)`                    |
| Title               | `ax.set_title('Title')`                     |
| X label             | `ax.set_xlabel('X')`                        |
| Y label             | `ax.set_ylabel('Y')`                        |
| Legend               | `ax.legend()`                               |
| Grid                | `ax.grid(True, alpha=0.3)`                  |
| Axis limits         | `ax.set_xlim(0, 10)`                        |
| Save                | `fig.savefig('plot.png', dpi=300)`          |
| Subplots            | `fig, axes = plt.subplots(2, 2)`            |
| Show                | `plt.show()`                                |

---

## Try It Yourself

1. Create a line plot of $y = x^2$ for $x \in [-5, 5]$
2. Make a bar chart of your weekly study hours per subject
3. Generate 1000 random numbers and plot their histogram
4. Create a 2×2 subplot figure with different plot types
5. Customize one plot with colors, legend, grid, and title

---

## Summary

- Matplotlib is the core plotting library in Python
- Use the **object-oriented interface** (`fig, ax = plt.subplots()`) for production code
- **Line plots** show trends; **scatter plots** show relationships
- **Bar charts** compare categories; **histograms** show distributions
- Customize with titles, labels, legends, grids, and colors
- Use **subplots** for multi-panel figures
- Save with `fig.savefig()` at high DPI for publication quality

Next, we'll explore advanced Matplotlib features including pie charts, heatmaps, annotations, and 3D plots.
