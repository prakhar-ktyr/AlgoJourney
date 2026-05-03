---
title: Seaborn for Statistical Plots
---

# Seaborn for Statistical Plots

**Seaborn** is a statistical data visualization library built on top of Matplotlib. It provides a high-level interface for creating informative, attractive plots with minimal code.

---

## What is Seaborn?

Seaborn makes it easy to:

- Visualize distributions and relationships
- Plot with Pandas DataFrames directly
- Apply attractive default styles
- Add statistical annotations (confidence intervals, regression lines)
- Create complex multi-panel figures

Think of Seaborn as "Matplotlib + statistics + beauty."

---

## Installing and Importing

```python
# Install (if not already installed)
# pip install seaborn

import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
```

---

## Theme and Style

Seaborn manages the overall look of your plots:

```python
import seaborn as sns
import matplotlib.pyplot as plt

# Set theme (applies to all subsequent plots)
sns.set_theme(style='whitegrid')
```

### Available Styles

| Style        | Description                              |
|--------------|------------------------------------------|
| `'whitegrid'`| White background with grid lines         |
| `'darkgrid'` | Gray background with grid lines          |
| `'white'`    | White background, no grid                |
| `'ticks'`    | White background with tick marks         |
| `'dark'`     | Gray background, no grid                 |

```python
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

styles = ['whitegrid', 'darkgrid', 'white', 'ticks']

fig, axes = plt.subplots(1, 4, figsize=(16, 3))
x = np.linspace(0, 10, 50)

for ax, style in zip(axes, styles):
    with sns.axes_style(style):
        ax.plot(x, np.sin(x))
        ax.set_title(style)

fig.tight_layout()
plt.show()
```

### Context Scaling

Control element sizes for different outputs:

```python
import seaborn as sns

# Options: 'paper', 'notebook' (default), 'talk', 'poster'
sns.set_theme(style='whitegrid', context='talk')
```

---

## Built-in Datasets

Seaborn includes sample datasets for practice:

```python
import seaborn as sns

# Load a built-in dataset
tips = sns.load_dataset('tips')
print(tips.head())

# Available datasets
print(sns.get_dataset_names())
# ['tips', 'iris', 'titanic', 'penguins', 'diamonds', ...]
```

---

## Distribution Plots

### Histogram with KDE

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.histplot(data=tips, x='total_bill', kde=True, bins=25, ax=ax)
ax.set_title("Distribution of Total Bill")
plt.show()
```

### KDE Plot (Kernel Density Estimation)

A smooth estimate of the probability density function:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.kdeplot(data=tips, x='total_bill', hue='time',
            fill=True, alpha=0.5, ax=ax)
ax.set_title("Bill Distribution by Meal Time")
plt.show()
```

The KDE uses a kernel function (typically Gaussian) at each data point:

$$\hat{f}(x) = \frac{1}{nh} \sum_{i=1}^{n} K\left(\frac{x - x_i}{h}\right)$$

where $h$ is the bandwidth and $K$ is the kernel function.

### ECDF Plot (Empirical Cumulative Distribution)

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.ecdfplot(data=tips, x='total_bill', hue='day', ax=ax)
ax.set_title("Cumulative Distribution of Bills by Day")
plt.show()
```

### Rug Plot

Adds small tick marks at each data point along an axis:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.kdeplot(data=tips, x='total_bill', ax=ax)
sns.rugplot(data=tips, x='total_bill', ax=ax, height=0.05, color='red')
ax.set_title("KDE with Rug Plot")
plt.show()
```

---

## Categorical Plots

### Count Plot

Count the occurrences of each category:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.countplot(data=tips, x='day', hue='sex',
              palette='Set2', ax=ax)
ax.set_title("Visits by Day and Gender")
plt.show()
```

### Bar Plot (with Confidence Intervals)

Shows mean values with error bars (95% CI by default):

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 5))
sns.barplot(data=tips, x='day', y='total_bill', hue='sex',
            palette='muted', ax=ax)
ax.set_title("Average Bill by Day and Gender")
plt.show()
```

### Box Plot

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(10, 6))
sns.boxplot(data=tips, x='day', y='total_bill', hue='smoker',
            palette='Set3', ax=ax)
ax.set_title("Bill Distribution by Day and Smoking Status")
plt.show()
```

### Violin Plot

Combines box plot with KDE — shows full distribution shape:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(10, 6))
sns.violinplot(data=tips, x='day', y='total_bill', hue='sex',
               split=True, palette='pastel', inner='quart', ax=ax)
ax.set_title("Bill Distribution (Violin)")
plt.show()
```

### Swarm Plot

Shows every data point without overlap:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(10, 6))
sns.swarmplot(data=tips, x='day', y='total_bill', hue='sex',
              palette='dark', dodge=True, size=4, ax=ax)
ax.set_title("Individual Bills (Swarm)")
plt.show()
```

### Strip Plot

Similar to swarm but uses jitter:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(10, 6))
sns.stripplot(data=tips, x='day', y='total_bill',
              jitter=0.3, alpha=0.5, color='steelblue', ax=ax)
ax.set_title("Individual Bills (Strip)")
plt.show()
```

### Combining Plots (Box + Swarm)

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(10, 6))
sns.boxplot(data=tips, x='day', y='total_bill',
            color='lightblue', ax=ax, fliersize=0)
sns.swarmplot(data=tips, x='day', y='total_bill',
              color='darkblue', size=3, alpha=0.5, ax=ax)
ax.set_title("Box + Swarm Overlay")
plt.show()
```

---

## Relational Plots

### Scatter Plot

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 6))
sns.scatterplot(data=tips, x='total_bill', y='tip',
                hue='day', size='size', style='sex',
                sizes=(50, 200), alpha=0.7, ax=ax)
ax.set_title("Tips vs Total Bill")
plt.show()
```

Parameters:

| Parameter | Maps to         |
|-----------|-----------------|
| `hue`     | Color           |
| `size`    | Marker size     |
| `style`   | Marker shape    |

### Line Plot

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Create time-series data
np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=100)
df = pd.DataFrame({
    'date': np.tile(dates, 2),
    'value': np.concatenate([
        np.cumsum(np.random.randn(100)) + 50,
        np.cumsum(np.random.randn(100)) + 45
    ]),
    'group': ['A'] * 100 + ['B'] * 100
})

fig, ax = plt.subplots(figsize=(10, 5))
sns.lineplot(data=df, x='date', y='value', hue='group', ax=ax)
ax.set_title("Time Series by Group")
plt.xticks(rotation=45)
plt.show()
```

---

## Regression Plots

### regplot — Scatter + Regression Line

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

fig, ax = plt.subplots(figsize=(8, 6))
sns.regplot(data=tips, x='total_bill', y='tip',
            scatter_kws={'alpha': 0.5},
            line_kws={'color': 'red'},
            ax=ax)
ax.set_title("Linear Regression: Tip vs Bill")
plt.show()
```

### lmplot — Faceted Regression

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

g = sns.lmplot(data=tips, x='total_bill', y='tip',
               hue='smoker', col='time',
               height=5, aspect=1.2)
g.fig.suptitle("Regression by Time and Smoking", y=1.02)
plt.show()
```

---

## Heatmap

Perfect for correlation matrices:

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Load dataset and compute correlations
tips = sns.load_dataset('tips')
numeric_cols = tips.select_dtypes(include=[np.number])
corr = numeric_cols.corr()

fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(corr, annot=True, cmap='coolwarm', center=0,
            fmt='.2f', linewidths=0.5, square=True,
            vmin=-1, vmax=1, ax=ax)
ax.set_title("Correlation Heatmap", fontweight='bold')
plt.show()
```

### Heatmap Parameters

| Parameter    | Description                            |
|--------------|----------------------------------------|
| `annot`      | Show values in cells                   |
| `cmap`       | Color map                              |
| `center`     | Center the colormap at this value      |
| `fmt`        | Format string for annotations          |
| `linewidths` | Width of lines between cells           |
| `square`     | Force square cells                     |
| `mask`       | Boolean array to hide cells            |

---

## Pair Plot

Visualize all pairwise relationships in a dataset:

```python
import seaborn as sns
import matplotlib.pyplot as plt

iris = sns.load_dataset('iris')

g = sns.pairplot(iris, hue='species',
                 diag_kind='kde',
                 plot_kws={'alpha': 0.6},
                 palette='Set2')
g.fig.suptitle("Iris Dataset — Pair Plot", y=1.02)
plt.show()
```

Pair plots show:
- **Diagonal**: distribution of each variable (histogram or KDE)
- **Off-diagonal**: scatter plots of each pair of variables

---

## Joint Plot

Combines scatter plot with marginal distributions:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

g = sns.jointplot(data=tips, x='total_bill', y='tip',
                  kind='scatter', hue='time',
                  marginal_kws={'fill': True})
g.fig.suptitle("Joint Plot: Bill vs Tip", y=1.02)
plt.show()
```

### Joint Plot Kinds

| Kind       | Description                         |
|------------|-------------------------------------|
| `'scatter'`| Scatter with histograms             |
| `'kde'`    | 2D KDE with marginal KDE           |
| `'hist'`   | 2D histogram with marginal hists   |
| `'hex'`    | Hexbin plot with marginal hists     |
| `'reg'`    | Scatter with regression line        |
| `'resid'`  | Residual plot                       |

---

## FacetGrid

Create multi-panel plots split by categorical variables:

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

g = sns.FacetGrid(tips, col='time', row='smoker',
                  hue='sex', height=4, aspect=1.2)
g.map_dataframe(sns.scatterplot, x='total_bill', y='tip')
g.add_legend()
g.fig.suptitle("Faceted Scatter: Bill vs Tip", y=1.02)
plt.show()
```

### catplot — FacetGrid for Categorical Plots

```python
import seaborn as sns
import matplotlib.pyplot as plt

tips = sns.load_dataset('tips')

g = sns.catplot(data=tips, x='day', y='total_bill',
                hue='sex', col='time',
                kind='box', height=5, aspect=1)
g.fig.suptitle("Bills by Day, Gender, and Time", y=1.02)
plt.show()
```

---

## Color Palettes

```python
import seaborn as sns
import matplotlib.pyplot as plt

# View a palette
sns.palplot(sns.color_palette('Set2'))
plt.title("Set2 Palette")
plt.show()
```

### Common Palettes

| Palette    | Type         | Description                    |
|------------|--------------|--------------------------------|
| `'deep'`   | Qualitative  | Default, saturated colors     |
| `'muted'`  | Qualitative  | Softer tones                  |
| `'bright'` | Qualitative  | Vivid, high-contrast          |
| `'pastel'` | Qualitative  | Light, muted                  |
| `'Set2'`   | Qualitative  | ColorBrewer set               |
| `'coolwarm'`| Diverging   | Blue ↔ Red                    |
| `'viridis'`| Sequential   | Perceptually uniform          |

### Custom Palette

```python
import seaborn as sns

# Create your own
my_palette = sns.color_palette(['#3498db', '#e74c3c', '#2ecc71', '#9b59b6'])
sns.set_palette(my_palette)
```

---

## Complete EDA with Seaborn

```python
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Load dataset
penguins = sns.load_dataset('penguins').dropna()
sns.set_theme(style='whitegrid', context='notebook')

fig, axes = plt.subplots(2, 3, figsize=(16, 10))

# 1. Distribution of body mass
sns.histplot(data=penguins, x='body_mass_g', hue='species',
             kde=True, ax=axes[0, 0])
axes[0, 0].set_title("Body Mass Distribution")

# 2. Box plot by species
sns.boxplot(data=penguins, x='species', y='flipper_length_mm',
            palette='Set2', ax=axes[0, 1])
axes[0, 1].set_title("Flipper Length by Species")

# 3. Scatter: bill dimensions
sns.scatterplot(data=penguins, x='bill_length_mm', y='bill_depth_mm',
                hue='species', style='sex', ax=axes[0, 2])
axes[0, 2].set_title("Bill Length vs Depth")

# 4. Violin plot
sns.violinplot(data=penguins, x='species', y='body_mass_g',
               hue='sex', split=True, palette='muted', ax=axes[1, 0])
axes[1, 0].set_title("Mass by Species and Sex")

# 5. Count plot
sns.countplot(data=penguins, x='island', hue='species',
              palette='pastel', ax=axes[1, 1])
axes[1, 1].set_title("Species by Island")

# 6. Correlation heatmap
numeric_data = penguins.select_dtypes(include=[np.number])
sns.heatmap(numeric_data.corr(), annot=True, cmap='coolwarm',
            center=0, fmt='.2f', ax=axes[1, 2])
axes[1, 2].set_title("Correlation Matrix")

fig.suptitle("Palmer Penguins — Exploratory Analysis", fontsize=15, fontweight='bold')
fig.tight_layout()
plt.show()
```

---

## Seaborn vs Matplotlib

| Feature          | Matplotlib                  | Seaborn                          |
|------------------|-----------------------------|----------------------------------|
| Abstraction      | Low-level                   | High-level                       |
| DataFrame support| Manual x, y arrays          | Direct column names              |
| Statistics       | None built-in               | CI, regression, KDE              |
| Styling          | Manual customization        | Beautiful defaults               |
| Plot types       | General purpose             | Statistical focus                |
| When to use      | Full control needed         | Quick statistical visualization  |

---

## Try It Yourself

1. Load the `tips` dataset and create a pair plot colored by `time`
2. Make a violin plot of tips grouped by day and gender
3. Create a heatmap of correlations in the `iris` dataset
4. Build a FacetGrid showing histograms of tips split by `smoker` and `time`
5. Use `lmplot` to show regression lines for each day of the week

---

## Summary

- Seaborn builds on Matplotlib with statistical intelligence
- **Distribution plots**: `histplot`, `kdeplot`, `ecdfplot`
- **Categorical plots**: `boxplot`, `violinplot`, `swarmplot`, `barplot`
- **Relational plots**: `scatterplot`, `lineplot`
- **Regression**: `regplot`, `lmplot`
- **Matrix plots**: `heatmap`
- **Multi-panel**: `pairplot`, `jointplot`, `FacetGrid`
- Use `hue`, `size`, and `style` to encode extra dimensions
- Choose palettes that match your data type (qualitative, sequential, diverging)

Next, we'll explore Plotly for creating interactive, web-based visualizations.
