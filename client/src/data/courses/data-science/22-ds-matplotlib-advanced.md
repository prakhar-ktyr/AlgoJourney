---
title: Matplotlib Advanced
---

# Matplotlib Advanced

Now that you know the basics, let's explore advanced Matplotlib features: pie charts, heatmaps, annotations, multiple axes, 3D plots, and professional styling.

---

## Pie Chart

Shows proportions of a whole. Best for 3–7 categories.

```python
import matplotlib.pyplot as plt

labels = ['Python', 'JavaScript', 'Java', 'C++', 'Other']
sizes = [35, 25, 20, 12, 8]
colors = ['#3498db', '#f1c40f', '#e74c3c', '#9b59b6', '#95a5a6']
explode = (0.05, 0, 0, 0, 0)  # "explode" the first slice

fig, ax = plt.subplots(figsize=(8, 8))

wedges, texts, autotexts = ax.pie(
    sizes,
    labels=labels,
    autopct='%1.1f%%',
    startangle=90,
    colors=colors,
    explode=explode,
    shadow=True,
    textprops={'fontsize': 12}
)

# Style the percentage text
for autotext in autotexts:
    autotext.set_fontweight('bold')
    autotext.set_color('white')

ax.set_title("Programming Language Market Share", fontsize=14, fontweight='bold')
plt.show()
```

### Donut Chart

A pie chart with a white circle in the center:

```python
import matplotlib.pyplot as plt

labels = ['Desktop', 'Mobile', 'Tablet']
sizes = [55, 35, 10]
colors = ['#3498db', '#e74c3c', '#2ecc71']

fig, ax = plt.subplots(figsize=(8, 8))

wedges, texts, autotexts = ax.pie(
    sizes, labels=labels, autopct='%1.1f%%',
    startangle=90, colors=colors,
    pctdistance=0.8, textprops={'fontsize': 12}
)

# Draw center circle for donut effect
centre_circle = plt.Circle((0, 0), 0.55, fc='white')
ax.add_patch(centre_circle)
ax.set_title("Traffic by Device", fontsize=14, fontweight='bold')
plt.show()
```

---

## Box Plot

Shows the distribution summary: median, quartiles, and outliers.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)

# Generate sample data
data = [np.random.normal(loc, 5, 100) for loc in [20, 25, 30, 22, 28]]
labels = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E']

fig, ax = plt.subplots(figsize=(10, 6))

bp = ax.boxplot(data, labels=labels, patch_artist=True, notch=True)

# Color each box
colors = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f39c12']
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

ax.set_title("Distribution Comparison (Box Plot)", fontweight='bold')
ax.set_ylabel("Values")
ax.grid(True, alpha=0.3, axis='y')
plt.show()
```

### Box Plot Anatomy

| Component   | Meaning                                             |
|-------------|-----------------------------------------------------|
| Box         | Interquartile range (IQR): Q1 to Q3                |
| Line in box | Median (Q2)                                        |
| Whiskers    | Extend to $1.5 \times \text{IQR}$ from Q1 and Q3  |
| Points      | Outliers beyond whiskers                            |
| Notch       | Confidence interval around the median               |

The IQR is defined as:

$$\text{IQR} = Q_3 - Q_1$$

---

## Violin Plot

Combines box plot with kernel density estimation — shows the full distribution shape.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)

data = [np.random.normal(0, std, 200) for std in range(1, 6)]

fig, ax = plt.subplots(figsize=(10, 6))

parts = ax.violinplot(data, showmeans=True, showmedians=True)

# Customize colors
for pc in parts['bodies']:
    pc.set_facecolor('#3498db')
    pc.set_alpha(0.7)

parts['cmeans'].set_color('red')
parts['cmedians'].set_color('black')

ax.set_title("Violin Plot — Distribution Shapes", fontweight='bold')
ax.set_xlabel("Group")
ax.set_ylabel("Value")
ax.set_xticks([1, 2, 3, 4, 5])
ax.set_xticklabels(['σ=1', 'σ=2', 'σ=3', 'σ=4', 'σ=5'])
ax.grid(True, alpha=0.3, axis='y')
plt.show()
```

---

## Heatmap

Displays a 2D matrix of values as colors — perfect for correlation matrices and tabular data.

```python
import matplotlib.pyplot as plt
import numpy as np

np.random.seed(42)

# Simulated correlation matrix
labels = ['Height', 'Weight', 'Age', 'Income', 'Score']
n = len(labels)
matrix = np.random.uniform(-1, 1, (n, n))
# Make symmetric and diagonal = 1
matrix = (matrix + matrix.T) / 2
np.fill_diagonal(matrix, 1.0)

fig, ax = plt.subplots(figsize=(8, 7))

im = ax.imshow(matrix, cmap='coolwarm', vmin=-1, vmax=1)

# Add colorbar
cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
cbar.set_label('Correlation', fontsize=11)

# Add text annotations
for i in range(n):
    for j in range(n):
        color = 'white' if abs(matrix[i, j]) > 0.5 else 'black'
        ax.text(j, i, f'{matrix[i, j]:.2f}', ha='center', va='center',
                color=color, fontsize=10)

ax.set_xticks(range(n))
ax.set_yticks(range(n))
ax.set_xticklabels(labels, rotation=45, ha='right')
ax.set_yticklabels(labels)
ax.set_title("Correlation Heatmap", fontweight='bold', pad=15)
fig.tight_layout()
plt.show()
```

---

## Area Plot / fill_between

Fills the area between lines — great for showing ranges or cumulative data.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.sin(x) * 0.5

fig, ax = plt.subplots(figsize=(10, 5))

ax.plot(x, y1, 'b-', linewidth=2, label='Upper')
ax.plot(x, y2, 'r-', linewidth=2, label='Lower')

# Fill between the two curves
ax.fill_between(x, y1, y2, alpha=0.3, color='blue', label='Range')

# Highlight where y1 > 0
ax.fill_between(x, 0, y1, where=(y1 > 0), alpha=0.1, color='green')
ax.fill_between(x, 0, y1, where=(y1 < 0), alpha=0.1, color='red')

ax.set_title("Area Plot with fill_between", fontweight='bold')
ax.set_xlabel("x")
ax.set_ylabel("y")
ax.legend()
ax.grid(True, alpha=0.3)
ax.axhline(0, color='black', linewidth=0.5)
plt.show()
```

### Stacked Area Chart

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.arange(2018, 2025)
mobile = [30, 35, 40, 45, 50, 52, 55]
desktop = [50, 45, 40, 35, 32, 30, 28]
tablet = [20, 20, 20, 20, 18, 18, 17]

fig, ax = plt.subplots(figsize=(10, 6))

ax.stackplot(x, mobile, desktop, tablet,
             labels=['Mobile', 'Desktop', 'Tablet'],
             colors=['#3498db', '#e74c3c', '#2ecc71'],
             alpha=0.8)

ax.set_title("Web Traffic Share Over Time", fontweight='bold')
ax.set_xlabel("Year")
ax.set_ylabel("Share (%)")
ax.legend(loc='upper left')
ax.set_ylim(0, 100)
plt.show()
```

---

## Error Bars

Show uncertainty or variability in measurements.

```python
import matplotlib.pyplot as plt
import numpy as np

categories = ['A', 'B', 'C', 'D', 'E']
means = [23, 35, 28, 42, 31]
std_devs = [3, 5, 4, 6, 3]

fig, ax = plt.subplots(figsize=(8, 5))

ax.errorbar(categories, means, yerr=std_devs,
            fmt='o',            # marker only (no line)
            capsize=5,          # cap width on error bars
            capthick=2,
            color='#3498db',
            ecolor='#e74c3c',   # error bar color
            markersize=8,
            linewidth=2)

ax.set_title("Measurements with Error Bars", fontweight='bold')
ax.set_ylabel("Value ± Std Dev")
ax.grid(True, alpha=0.3, axis='y')
plt.show()
```

### Asymmetric Error Bars

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.arange(5)
y = [20, 35, 30, 25, 40]
yerr_lower = [2, 4, 3, 2, 5]
yerr_upper = [3, 6, 4, 3, 7]

fig, ax = plt.subplots(figsize=(8, 5))
ax.errorbar(x, y, yerr=[yerr_lower, yerr_upper],
            fmt='s-', capsize=4, color='purple')
ax.set_title("Asymmetric Error Bars")
plt.show()
```

---

## Annotations

Add labels, arrows, and text to highlight important features.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 2 * np.pi, 100)
y = np.sin(x)

fig, ax = plt.subplots(figsize=(10, 6))
ax.plot(x, y, 'b-', linewidth=2)

# Annotate the maximum
ax.annotate('Maximum\n(π/2, 1)',
            xy=(np.pi/2, 1),           # point to annotate
            xytext=(np.pi/2 + 1, 0.7), # text position
            fontsize=11,
            arrowprops=dict(
                arrowstyle='->',
                color='red',
                lw=2
            ),
            bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7))

# Annotate the minimum
ax.annotate('Minimum\n(3π/2, -1)',
            xy=(3*np.pi/2, -1),
            xytext=(3*np.pi/2 + 1, -0.5),
            fontsize=11,
            arrowprops=dict(arrowstyle='->', color='red', lw=2),
            bbox=dict(boxstyle='round,pad=0.3', facecolor='lightblue', alpha=0.7))

# Add plain text
ax.text(0.3, 0.5, 'sin(x)', fontsize=14, style='italic', color='blue')

ax.set_title("Annotated Sine Wave", fontweight='bold')
ax.set_xlabel("x")
ax.set_ylabel("sin(x)")
ax.grid(True, alpha=0.3)
plt.show()
```

### Arrow Styles

Common `arrowstyle` options: `'->'`, `'-[>'`, `'fancy'`, `'simple'`, `'wedge'`, `'|-|'`.

---

## Multiple Y-Axes

Show two different scales on the same plot using `twinx()`.

```python
import matplotlib.pyplot as plt
import numpy as np

months = np.arange(1, 13)
temperature = [5, 7, 12, 18, 22, 28, 32, 31, 26, 19, 12, 7]
rainfall = [80, 65, 70, 55, 45, 30, 20, 25, 40, 60, 75, 85]

fig, ax1 = plt.subplots(figsize=(10, 6))

# First y-axis: temperature
color1 = '#e74c3c'
ax1.plot(months, temperature, color=color1, marker='o', linewidth=2, label='Temperature')
ax1.set_xlabel("Month")
ax1.set_ylabel("Temperature (°C)", color=color1, fontsize=12)
ax1.tick_params(axis='y', labelcolor=color1)
ax1.set_ylim(0, 35)

# Second y-axis: rainfall
ax2 = ax1.twinx()
color2 = '#3498db'
ax2.bar(months, rainfall, color=color2, alpha=0.3, label='Rainfall')
ax2.set_ylabel("Rainfall (mm)", color=color2, fontsize=12)
ax2.tick_params(axis='y', labelcolor=color2)
ax2.set_ylim(0, 100)

# Combined legend
lines1, labels1 = ax1.get_legend_handles_labels()
lines2, labels2 = ax2.get_legend_handles_labels()
ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')

ax1.set_title("Monthly Temperature and Rainfall", fontweight='bold')
ax1.set_xticks(months)
ax1.set_xticklabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
fig.tight_layout()
plt.show()
```

---

## Logarithmic Scale

Essential for data spanning multiple orders of magnitude.

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.logspace(0, 5, 50)  # 1 to 100,000
y = x ** 2

fig, axes = plt.subplots(1, 3, figsize=(15, 4))

# Linear scale
axes[0].plot(x, y)
axes[0].set_title("Linear Scale")
axes[0].set_xlabel("x")
axes[0].set_ylabel("y = x²")

# Log x-axis
axes[1].plot(x, y)
axes[1].set_xscale('log')
axes[1].set_title("Log X Scale")
axes[1].set_xlabel("x (log)")
axes[1].set_ylabel("y = x²")

# Log-log
axes[2].plot(x, y)
axes[2].set_xscale('log')
axes[2].set_yscale('log')
axes[2].set_title("Log-Log Scale")
axes[2].set_xlabel("x (log)")
axes[2].set_ylabel("y (log)")

fig.tight_layout()
plt.show()
```

On a log-log plot, power laws appear as straight lines. The slope gives the exponent:

$$\log(y) = n \cdot \log(x) + \log(a) \quad \text{for } y = ax^n$$

---

## Styles and Themes

Matplotlib ships with built-in styles that change the look of all plots.

```python
import matplotlib.pyplot as plt
import numpy as np

# List all available styles
print(plt.style.available)
# e.g., 'seaborn-v0_8', 'ggplot', 'dark_background', 'bmh', 'fivethirtyeight'
```

### Applying a Style

```python
import matplotlib.pyplot as plt
import numpy as np

plt.style.use('seaborn-v0_8')

x = np.linspace(0, 10, 100)
fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(x, np.sin(x), label='sin(x)')
ax.plot(x, np.cos(x), label='cos(x)')
ax.legend()
ax.set_title("Seaborn Style")
plt.show()
```

### Temporary Style Context

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)

with plt.style.context('dark_background'):
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(x, np.sin(x), 'cyan', linewidth=2)
    ax.set_title("Dark Background Style", color='white')
    plt.show()
```

### Popular Styles

| Style               | Description                      |
|---------------------|----------------------------------|
| `'seaborn-v0_8'`   | Clean, statistical look          |
| `'ggplot'`          | R's ggplot2 style                |
| `'dark_background'` | Dark mode                       |
| `'bmh'`            | Bayesian Methods for Hackers     |
| `'fivethirtyeight'`| FiveThirtyEight blog style       |

---

## Color Maps

Color maps map numerical values to colors.

```python
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(2, 3, figsize=(15, 8))
cmaps = ['viridis', 'plasma', 'coolwarm', 'RdYlGn', 'twilight', 'magma']

data = np.random.rand(10, 10)

for ax, cmap_name in zip(axes.flat, cmaps):
    im = ax.imshow(data, cmap=cmap_name)
    ax.set_title(cmap_name, fontsize=12)
    ax.set_xticks([])
    ax.set_yticks([])
    plt.colorbar(im, ax=ax, fraction=0.046)

fig.suptitle("Common Color Maps", fontsize=14, fontweight='bold')
fig.tight_layout()
plt.show()
```

### Choosing a Color Map

| Type        | Use Case                    | Examples                    |
|-------------|-----------------------------|-----------------------------|
| Sequential  | Ordered data (low → high)  | viridis, plasma, magma      |
| Diverging   | Data with a midpoint       | coolwarm, RdBu, seismic     |
| Qualitative | Distinct categories        | Set1, tab10, Pastel1        |
| Cyclic      | Periodic data (angles)     | twilight, hsv               |

---

## GridSpec for Complex Layouts

When subplots need different sizes and spans:

```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np

fig = plt.figure(figsize=(12, 8))
gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.4, wspace=0.3)

# Large plot spanning top row
ax1 = fig.add_subplot(gs[0, :])
x = np.linspace(0, 10, 100)
ax1.plot(x, np.sin(x), 'b-', linewidth=2)
ax1.set_title("Full Width — Line Plot")

# Two medium plots in middle row
ax2 = fig.add_subplot(gs[1, :2])
ax2.bar(['A', 'B', 'C', 'D'], [25, 40, 30, 35], color='steelblue')
ax2.set_title("Two-thirds Width — Bar")

ax3 = fig.add_subplot(gs[1, 2])
ax3.pie([40, 30, 30], labels=['X', 'Y', 'Z'], autopct='%d%%')
ax3.set_title("Pie")

# Three small plots in bottom row
for i in range(3):
    ax = fig.add_subplot(gs[2, i])
    data = np.random.randn(50)
    ax.hist(data, bins=10, color=f'C{i}', edgecolor='black')
    ax.set_title(f"Hist {i+1}")

fig.suptitle("Complex Layout with GridSpec", fontsize=14, fontweight='bold')
plt.show()
```

---

## 3D Plots

Matplotlib supports basic 3D visualization.

```python
import matplotlib.pyplot as plt
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(12, 5))

# 3D surface
ax1 = fig.add_subplot(121, projection='3d')
x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

ax1.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8)
ax1.set_title("3D Surface")
ax1.set_xlabel("X")
ax1.set_ylabel("Y")
ax1.set_zlabel("Z")

# 3D scatter
ax2 = fig.add_subplot(122, projection='3d')
n = 200
xs = np.random.randn(n)
ys = np.random.randn(n)
zs = np.random.randn(n)
colors = np.sqrt(xs**2 + ys**2 + zs**2)

ax2.scatter(xs, ys, zs, c=colors, cmap='plasma', alpha=0.6)
ax2.set_title("3D Scatter")
ax2.set_xlabel("X")
ax2.set_ylabel("Y")
ax2.set_zlabel("Z")

fig.tight_layout()
plt.show()
```

---

## Animations (Brief)

Create animated plots using `FuncAnimation`:

```python
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.animation import FuncAnimation

fig, ax = plt.subplots(figsize=(8, 5))
x = np.linspace(0, 2 * np.pi, 100)
line, = ax.plot(x, np.sin(x))
ax.set_ylim(-1.5, 1.5)
ax.set_title("Animated Sine Wave")

def update(frame):
    line.set_ydata(np.sin(x + frame / 10))
    return line,

ani = FuncAnimation(fig, update, frames=100, interval=50, blit=True)
# Save as GIF: ani.save('wave.gif', writer='pillow', fps=20)
plt.show()
```

---

## Complete Example: Multi-Panel Research Figure

```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np

np.random.seed(42)

fig = plt.figure(figsize=(14, 10))
gs = gridspec.GridSpec(2, 3, figure=fig, hspace=0.35, wspace=0.3)

# Panel A: Heatmap
ax_a = fig.add_subplot(gs[0, 0])
data_heat = np.random.rand(8, 8)
im = ax_a.imshow(data_heat, cmap='YlOrRd')
plt.colorbar(im, ax=ax_a, fraction=0.046)
ax_a.set_title("A) Expression Heatmap", fontweight='bold', fontsize=11)

# Panel B: Violin plot
ax_b = fig.add_subplot(gs[0, 1])
data_violin = [np.random.normal(m, 1.5, 100) for m in [3, 5, 4, 6]]
parts = ax_b.violinplot(data_violin, showmeans=True)
for pc in parts['bodies']:
    pc.set_facecolor('#3498db')
    pc.set_alpha(0.6)
ax_b.set_title("B) Distribution by Group", fontweight='bold', fontsize=11)
ax_b.set_xticks([1, 2, 3, 4])
ax_b.set_xticklabels(['Ctrl', 'Low', 'Med', 'High'])

# Panel C: Scatter with trend
ax_c = fig.add_subplot(gs[0, 2])
x_scat = np.random.rand(60) * 10
y_scat = 2.5 * x_scat + np.random.randn(60) * 3
ax_c.scatter(x_scat, y_scat, alpha=0.6, color='#e74c3c', edgecolors='black', s=40)
z = np.polyfit(x_scat, y_scat, 1)
p = np.poly1d(z)
x_line = np.linspace(0, 10, 100)
ax_c.plot(x_line, p(x_line), 'k--', linewidth=2, label=f'y={z[0]:.1f}x+{z[1]:.1f}')
ax_c.legend()
ax_c.set_title("C) Correlation (r=0.93)", fontweight='bold', fontsize=11)

# Panel D: Time series with error band
ax_d = fig.add_subplot(gs[1, :2])
t = np.arange(0, 50)
signal = np.sin(t * 0.3) * 10 + t * 0.5
noise = np.random.randn(50) * 2
ax_d.plot(t, signal, 'b-', linewidth=2, label='Signal')
ax_d.fill_between(t, signal - noise*2, signal + noise*2, alpha=0.2, color='blue')
ax_d.set_title("D) Time Series with Confidence Band", fontweight='bold', fontsize=11)
ax_d.set_xlabel("Time (s)")
ax_d.set_ylabel("Amplitude")
ax_d.legend()
ax_d.grid(True, alpha=0.3)

# Panel E: Stacked bar
ax_e = fig.add_subplot(gs[1, 2])
cats = ['S1', 'S2', 'S3', 'S4']
type_a = [30, 25, 35, 28]
type_b = [20, 30, 25, 32]
type_c = [10, 15, 10, 20]
ax_e.bar(cats, type_a, label='Type A', color='#3498db')
ax_e.bar(cats, type_b, bottom=type_a, label='Type B', color='#2ecc71')
ax_e.bar(cats, type_c, bottom=[a+b for a, b in zip(type_a, type_b)],
         label='Type C', color='#e74c3c')
ax_e.set_title("E) Composition", fontweight='bold', fontsize=11)
ax_e.legend(fontsize=9)

fig.suptitle("Figure 1: Comprehensive Data Analysis", fontsize=15, fontweight='bold')
fig.savefig('research_figure.png', dpi=300, bbox_inches='tight')
plt.show()
```

---

## Quick Reference

| Feature           | Code                                              |
|-------------------|---------------------------------------------------|
| Pie chart         | `ax.pie(sizes, labels=labels, autopct='%1.1f%%')` |
| Box plot          | `ax.boxplot(data, patch_artist=True)`             |
| Violin plot       | `ax.violinplot(data, showmeans=True)`             |
| Heatmap           | `ax.imshow(matrix, cmap='viridis')`               |
| Fill between      | `ax.fill_between(x, y1, y2, alpha=0.3)`          |
| Error bars        | `ax.errorbar(x, y, yerr=err, capsize=5)`          |
| Annotate          | `ax.annotate('text', xy=(...), xytext=(...))`     |
| Twin axes         | `ax2 = ax.twinx()`                               |
| Log scale         | `ax.set_yscale('log')`                            |
| Style             | `plt.style.use('ggplot')`                         |
| GridSpec          | `gs = gridspec.GridSpec(rows, cols)`              |
| 3D surface        | `ax.plot_surface(X, Y, Z, cmap='viridis')`       |

---

## Try It Yourself

1. Create a pie chart of your monthly expenses by category
2. Make a box plot comparing exam scores across 4 subjects
3. Build a heatmap of a $5 \times 5$ correlation matrix
4. Create a dual-axis plot (line + bar) for temperature and rainfall
5. Use GridSpec to build a custom 3-panel dashboard

---

## Summary

- **Pie charts** show proportions — use sparingly (≤7 categories)
- **Box plots** and **violin plots** compare distributions across groups
- **Heatmaps** visualize 2D matrices — ideal for correlations
- **Annotations** draw attention to key data points
- **Multiple y-axes** (`twinx`) show different scales together
- **Styles** and **color maps** give plots a professional look
- **GridSpec** enables complex multi-panel layouts
- **3D plots** add depth for surface and volumetric data

Next, we'll explore Seaborn — a statistical visualization library that makes beautiful plots with less code.
