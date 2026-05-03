---
title: Interactive Plots with Plotly
---

# Interactive Plots with Plotly

**Plotly** creates interactive, web-based visualizations. Users can zoom, pan, hover for details, and toggle series — all without writing JavaScript.

---

## What is Plotly?

Plotly is a graphing library that produces interactive plots rendered in the browser. Key features:

- Hover tooltips with data values
- Zoom, pan, and selection tools
- Export to HTML for sharing
- Works in Jupyter notebooks, scripts, and web apps
- Supports 40+ chart types including maps and 3D

---

## Installing and Importing

```python
# Install
# pip install plotly

# Two main interfaces
import plotly.express as px          # High-level (recommended)
import plotly.graph_objects as go    # Low-level (more control)
import pandas as pd
import numpy as np
```

---

## Plotly Express (High-Level API)

Plotly Express (`px`) creates figures in one function call, directly from DataFrames.

### Basic Scatter Plot

```python
import plotly.express as px
import pandas as pd

# Built-in dataset
df = px.data.iris()

fig = px.scatter(df, x='sepal_length', y='sepal_width',
                 color='species', size='petal_length',
                 hover_data=['petal_width'],
                 title='Iris Dataset — Sepal Dimensions')
fig.show()
```

Every point is interactive — hover to see all values.

### Line Plot

```python
import plotly.express as px
import pandas as pd
import numpy as np

# Create time-series data
dates = pd.date_range('2023-01-01', periods=365)
np.random.seed(42)
df = pd.DataFrame({
    'date': dates,
    'stock_A': 100 + np.cumsum(np.random.randn(365) * 2),
    'stock_B': 100 + np.cumsum(np.random.randn(365) * 1.5)
})

# Melt to long format for Plotly
df_long = df.melt(id_vars='date', var_name='stock', value_name='price')

fig = px.line(df_long, x='date', y='price', color='stock',
              title='Stock Prices Over Time')
fig.update_layout(xaxis_title='Date', yaxis_title='Price ($)')
fig.show()
```

### Bar Chart

```python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'language': ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'],
    'popularity': [35, 28, 20, 10, 4, 3],
    'growth': [15, 5, -2, -5, 20, 45]
})

fig = px.bar(df, x='language', y='popularity', color='growth',
             color_continuous_scale='RdYlGn',
             title='Language Popularity and Growth')
fig.show()
```

### Histogram

```python
import plotly.express as px
import numpy as np
import pandas as pd

np.random.seed(42)
df = pd.DataFrame({
    'score': np.concatenate([
        np.random.normal(70, 10, 500),
        np.random.normal(85, 8, 300)
    ]),
    'group': ['Class A'] * 500 + ['Class B'] * 300
})

fig = px.histogram(df, x='score', color='group', nbins=40,
                   barmode='overlay', opacity=0.7,
                   title='Score Distribution by Class')
fig.show()
```

### Box Plot

```python
import plotly.express as px

df = px.data.tips()

fig = px.box(df, x='day', y='total_bill', color='smoker',
             notched=True,
             title='Bill Distribution by Day')
fig.show()
```

### Violin Plot

```python
import plotly.express as px

df = px.data.tips()

fig = px.violin(df, x='day', y='total_bill', color='sex',
                box=True, points='all',
                title='Bill Distribution (Violin)')
fig.show()
```

---

## Advanced Chart Types

### Pie Chart

```python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'category': ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings'],
    'amount': [1500, 600, 400, 300, 700]
})

fig = px.pie(df, values='amount', names='category',
             title='Monthly Budget Breakdown',
             hole=0.3)  # hole > 0 makes a donut chart
fig.show()
```

### Scatter Matrix

```python
import plotly.express as px

df = px.data.iris()

fig = px.scatter_matrix(df,
                        dimensions=['sepal_length', 'sepal_width',
                                    'petal_length', 'petal_width'],
                        color='species',
                        title='Iris — Scatter Matrix')
fig.update_traces(diagonal_visible=False)
fig.show()
```

### Sunburst Chart

Hierarchical data as nested rings:

```python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'region': ['NA', 'NA', 'NA', 'EU', 'EU', 'EU', 'APAC', 'APAC'],
    'country': ['USA', 'Canada', 'Mexico', 'UK', 'Germany', 'France', 'Japan', 'India'],
    'sales': [500, 200, 150, 300, 280, 250, 400, 350]
})

fig = px.sunburst(df, path=['region', 'country'], values='sales',
                  title='Sales by Region and Country')
fig.show()
```

### Treemap

Hierarchical data as nested rectangles:

```python
import plotly.express as px
import pandas as pd

df = pd.DataFrame({
    'sector': ['Tech', 'Tech', 'Tech', 'Health', 'Health', 'Finance', 'Finance'],
    'company': ['Apple', 'Google', 'Microsoft', 'Pfizer', 'J&J', 'JPMorgan', 'Goldman'],
    'market_cap': [3000, 1800, 2800, 200, 400, 500, 120]
})

fig = px.treemap(df, path=['sector', 'company'], values='market_cap',
                 color='market_cap', color_continuous_scale='Blues',
                 title='Market Cap by Sector')
fig.show()
```

### Choropleth Map

Geographic data on a world map:

```python
import plotly.express as px
import pandas as pd

df = px.data.gapminder().query("year == 2007")

fig = px.choropleth(df, locations='iso_alpha', color='gdpPercap',
                    hover_name='country',
                    color_continuous_scale='Viridis',
                    title='GDP per Capita (2007)')
fig.show()
```

---

## Plotly Graph Objects (Low-Level API)

For full control over every element, use `graph_objects`:

```python
import plotly.graph_objects as go
import numpy as np

x = np.linspace(0, 10, 100)

fig = go.Figure()

# Add multiple traces
fig.add_trace(go.Scatter(
    x=x, y=np.sin(x),
    mode='lines',
    name='sin(x)',
    line=dict(color='blue', width=2)
))

fig.add_trace(go.Scatter(
    x=x, y=np.cos(x),
    mode='lines+markers',
    name='cos(x)',
    line=dict(color='red', width=2, dash='dash'),
    marker=dict(size=4)
))

fig.update_layout(
    title='Trigonometric Functions',
    xaxis_title='x',
    yaxis_title='y',
    legend=dict(x=0.02, y=0.98)
)

fig.show()
```

### Modes for Scatter

| Mode               | Description                    |
|--------------------|--------------------------------|
| `'lines'`         | Lines only                     |
| `'markers'`       | Points only                    |
| `'lines+markers'` | Lines and points               |
| `'text'`          | Text labels only               |
| `'lines+text'`    | Lines with text                |

### Combining Express and Graph Objects

```python
import plotly.express as px
import plotly.graph_objects as go
import numpy as np

df = px.data.iris()
fig = px.scatter(df, x='sepal_length', y='sepal_width', color='species')

# Add a manual reference line
fig.add_trace(go.Scatter(
    x=[4, 8], y=[2, 4.5],
    mode='lines',
    name='Trend',
    line=dict(color='black', dash='dash', width=2)
))

fig.show()
```

---

## Updating Layout

### Titles and Labels

```python
import plotly.express as px

df = px.data.tips()
fig = px.scatter(df, x='total_bill', y='tip')

fig.update_layout(
    title=dict(text='Tips vs Bill', font=dict(size=20)),
    xaxis_title='Total Bill ($)',
    yaxis_title='Tip ($)',
    font=dict(family='Arial', size=14),
    showlegend=True
)

fig.show()
```

### Templates (Themes)

```python
import plotly.express as px
import plotly.io as pio

# Available templates
print(pio.templates)
# 'plotly', 'plotly_white', 'plotly_dark', 'ggplot2',
# 'seaborn', 'simple_white', 'none'

df = px.data.iris()
fig = px.scatter(df, x='sepal_length', y='sepal_width',
                 color='species',
                 template='plotly_dark',
                 title='Dark Theme')
fig.show()
```

### Layout Properties

```python
import plotly.express as px

df = px.data.tips()
fig = px.scatter(df, x='total_bill', y='tip', color='day')

fig.update_layout(
    width=800,
    height=500,
    plot_bgcolor='white',
    xaxis=dict(showgrid=True, gridwidth=1, gridcolor='lightgray'),
    yaxis=dict(showgrid=True, gridwidth=1, gridcolor='lightgray'),
    margin=dict(l=50, r=50, t=60, b=50)
)

fig.show()
```

---

## Animations

Create animated visualizations with a `animation_frame` parameter:

```python
import plotly.express as px

df = px.data.gapminder()

fig = px.scatter(df, x='gdpPercap', y='lifeExp',
                 size='pop', color='continent',
                 hover_name='country',
                 animation_frame='year',
                 animation_group='country',
                 log_x=True, size_max=60,
                 range_x=[100, 100000],
                 range_y=[25, 90],
                 title='Gapminder — Life Expectancy vs GDP')
fig.show()
```

This creates a playable animation with a timeline slider.

---

## Subplots

```python
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import numpy as np

fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=('Line', 'Bar', 'Scatter', 'Histogram')
)

# Line
x = np.linspace(0, 10, 50)
fig.add_trace(go.Scatter(x=x, y=np.sin(x), mode='lines', name='sin'),
              row=1, col=1)

# Bar
fig.add_trace(go.Bar(x=['A', 'B', 'C', 'D'], y=[10, 20, 15, 25], name='Sales'),
              row=1, col=2)

# Scatter
fig.add_trace(go.Scatter(x=np.random.rand(50), y=np.random.rand(50),
                         mode='markers', name='Random'),
              row=2, col=1)

# Histogram
fig.add_trace(go.Histogram(x=np.random.randn(500), nbinsx=30, name='Normal'),
              row=2, col=2)

fig.update_layout(height=600, title_text='Subplot Dashboard', showlegend=False)
fig.show()
```

---

## Saving Plots

### As HTML (interactive)

```python
import plotly.express as px

df = px.data.iris()
fig = px.scatter(df, x='sepal_length', y='sepal_width', color='species')

# Save interactive HTML
fig.write_html('scatter_plot.html')
```

### As Static Image

```python
import plotly.express as px

df = px.data.iris()
fig = px.scatter(df, x='sepal_length', y='sepal_width', color='species')

# Requires kaleido: pip install kaleido
fig.write_image('scatter_plot.png', width=800, height=500, scale=2)
fig.write_image('scatter_plot.pdf')
fig.write_image('scatter_plot.svg')
```

---

## Complete Example: Interactive Dashboard

```python
import plotly.express as px
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import pandas as pd
import numpy as np

# Create sample sales data
np.random.seed(42)
months = pd.date_range('2023-01-01', periods=12, freq='MS')
regions = ['North', 'South', 'East', 'West']

data = []
for region in regions:
    base = np.random.randint(50, 100)
    for month in months:
        data.append({
            'date': month,
            'region': region,
            'sales': base + np.random.randint(-10, 30),
            'customers': np.random.randint(100, 500)
        })

df = pd.DataFrame(data)

# Create multi-panel figure
fig = make_subplots(
    rows=2, cols=2,
    specs=[[{'type': 'scatter'}, {'type': 'bar'}],
           [{'type': 'pie'}, {'type': 'scatter'}]],
    subplot_titles=('Sales Trend', 'Sales by Region',
                    'Market Share', 'Customers vs Sales')
)

# 1. Line chart — sales over time
for region in regions:
    mask = df['region'] == region
    fig.add_trace(go.Scatter(
        x=df[mask]['date'], y=df[mask]['sales'],
        mode='lines+markers', name=region
    ), row=1, col=1)

# 2. Bar chart — total sales by region
region_totals = df.groupby('region')['sales'].sum().reset_index()
fig.add_trace(go.Bar(
    x=region_totals['region'], y=region_totals['sales'],
    marker_color=['#3498db', '#e74c3c', '#2ecc71', '#f39c12'],
    showlegend=False
), row=1, col=2)

# 3. Pie chart — market share
fig.add_trace(go.Pie(
    labels=region_totals['region'],
    values=region_totals['sales'],
    hole=0.4, showlegend=False
), row=2, col=1)

# 4. Scatter — customers vs sales
fig.add_trace(go.Scatter(
    x=df['customers'], y=df['sales'],
    mode='markers', showlegend=False,
    marker=dict(color=df['sales'], colorscale='Viridis',
                size=8, opacity=0.7)
), row=2, col=2)

fig.update_layout(height=700, title_text='Sales Dashboard 2023')
fig.show()

# Save as HTML
fig.write_html('sales_dashboard.html')
```

---

## Plotly vs Matplotlib vs Seaborn

| Feature          | Matplotlib           | Seaborn              | Plotly                |
|------------------|----------------------|----------------------|-----------------------|
| Interactivity    | Static               | Static               | Fully interactive     |
| Learning curve   | Medium               | Easy                 | Easy (Express)        |
| Customization    | Maximum              | High                 | High                  |
| Statistical      | Manual               | Built-in             | Some                  |
| Output format    | PNG, PDF, SVG        | PNG, PDF, SVG        | HTML, PNG, PDF        |
| 3D support       | Basic                | None                 | Excellent             |
| Maps             | With Basemap         | None                 | Built-in              |
| Animation        | FuncAnimation        | None                 | animation_frame       |
| Best for         | Publication figures  | Statistical EDA      | Interactive dashboards|

---

## Try It Yourself

1. Create an interactive scatter plot of the iris dataset with hover info
2. Build a choropleth map showing population by country
3. Make an animated bubble chart using the gapminder dataset
4. Create a sunburst chart of a file system hierarchy
5. Build a 4-panel interactive dashboard with subplots

---

## Summary

- **Plotly Express** creates interactive charts in one line from DataFrames
- **Graph Objects** give fine-grained control over every element
- Interactive features: hover, zoom, pan, toggle, select
- Supports 40+ chart types: scatter, bar, line, pie, sunburst, treemap, choropleth
- **Animations** via `animation_frame` for time-based data
- **Templates** change the overall theme (dark, ggplot2, seaborn)
- Save as **HTML** (interactive) or **static images** (PNG, PDF, SVG)
- Use Plotly when you need interactivity; Matplotlib/Seaborn for static publication figures

Next, we'll combine all visualization skills in a complete Exploratory Data Analysis workflow.
