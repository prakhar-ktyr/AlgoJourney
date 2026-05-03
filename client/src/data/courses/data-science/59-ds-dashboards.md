---
title: Dashboards with Streamlit & Dash
---

# Dashboards with Streamlit & Dash

Dashboards let you share data insights interactively — no more static reports that nobody reads.

This lesson covers building interactive data apps with Python.

---

## Why Dashboards?

| Static Report | Interactive Dashboard |
|--------------|----------------------|
| PDF/slides that get outdated | Always up-to-date |
| One-size-fits-all view | Users filter and explore |
| Requires manual updates | Auto-refreshes with new data |
| Hard to drill down | Click to explore details |

---

## Dashboard Tools Overview

| Tool | Complexity | Best For |
|------|-----------|----------|
| **Streamlit** | ★☆☆☆☆ | Quick prototypes, data apps |
| **Dash** (Plotly) | ★★★☆☆ | Production dashboards |
| **Panel** | ★★☆☆☆ | HoloViews/Bokeh ecosystem |
| **Tableau** | GUI | Business intelligence |
| **Power BI** | GUI | Microsoft ecosystem |

---

## Streamlit: The Easiest Way to Build Data Apps

Streamlit turns Python scripts into web apps with zero frontend knowledge.

### Installation

```python
# pip install streamlit
# Run with: streamlit run app.py
```

### Hello World

```python
# app.py
import streamlit as st

st.title("My First Dashboard")
st.write("Hello, World!")

# Run: streamlit run app.py
# Opens at http://localhost:8501
```

---

## Streamlit Layout & Display

### Text and Headers

```python
import streamlit as st

st.title("Sales Dashboard")          # Main title
st.header("Monthly Overview")        # Section header
st.subheader("Revenue Breakdown")    # Sub-section
st.write("This is regular text.")    # Generic output
st.markdown("**Bold** and *italic*") # Markdown support
st.caption("Source: internal data")  # Small caption text
st.divider()                         # Horizontal line
```

### Displaying Data

```python
import streamlit as st
import pandas as pd
import numpy as np

# Sample data
df = pd.DataFrame({
    "Product": ["Widget A", "Widget B", "Widget C", "Widget D"],
    "Revenue": [45000, 62000, 38000, 71000],
    "Units Sold": [1200, 1800, 950, 2100],
    "Growth": [0.12, 0.08, -0.03, 0.15]
})

# Different ways to show data
st.write(df)                    # Auto-renders as interactive table
st.dataframe(df, height=200)   # Interactive table with scroll
st.table(df)                   # Static table (no scroll)

# Data editor (users can edit!)
edited_df = st.data_editor(df)
```

### Metrics and KPIs

```python
import streamlit as st

# Single metric
st.metric(label="Total Revenue", value="$216,000", delta="+8.3%")

# Multiple metrics in columns
col1, col2, col3, col4 = st.columns(4)
col1.metric("Revenue", "$216K", "+8.3%")
col2.metric("Users", "12,400", "+340")
col3.metric("Conversion", "3.2%", "-0.1%")
col4.metric("Avg Order", "$85", "+$3")
```

---

## Streamlit Input Widgets

### Selection Widgets

```python
import streamlit as st
import pandas as pd

# Selectbox (single choice)
category = st.selectbox(
    "Choose a category:",
    ["Electronics", "Clothing", "Food", "Books"]
)

# Multiselect (multiple choices)
regions = st.multiselect(
    "Select regions:",
    ["North", "South", "East", "West"],
    default=["North", "South"]
)

# Radio buttons
chart_type = st.radio(
    "Chart type:",
    ["Line", "Bar", "Scatter"],
    horizontal=True
)

# Slider
date_range = st.slider(
    "Select date range:",
    min_value=2020,
    max_value=2025,
    value=(2022, 2024)
)

# Number input
threshold = st.number_input("Minimum revenue:", min_value=0, value=10000, step=1000)

# Text input
search = st.text_input("Search products:", placeholder="Enter product name...")

# Date input
import datetime
start_date = st.date_input("Start date", datetime.date(2024, 1, 1))

st.write(f"Showing {category} in {regions} as {chart_type} chart")
```

---

## Streamlit Charts

### Built-in Charts

```python
import streamlit as st
import pandas as pd
import numpy as np

# Generate sample data
dates = pd.date_range("2024-01-01", periods=90, freq="D")
df = pd.DataFrame({
    "date": dates,
    "revenue": np.cumsum(np.random.randn(90) * 1000 + 500),
    "users": np.cumsum(np.random.randint(10, 50, 90))
})
df = df.set_index("date")

# Built-in charts (simple and fast)
st.line_chart(df["revenue"])
st.bar_chart(df["users"])
st.area_chart(df)
```

### Plotly Integration

```python
import streamlit as st
import plotly.express as px
import pandas as pd

# Sample data
df = pd.DataFrame({
    "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "Revenue": [42000, 48000, 51000, 47000, 55000, 62000],
    "Expenses": [35000, 37000, 39000, 38000, 40000, 42000]
})

# Plotly Express chart
fig = px.bar(df, x="Month", y=["Revenue", "Expenses"],
             barmode="group", title="Revenue vs Expenses")
st.plotly_chart(fig, use_container_width=True)
```

### Matplotlib Integration

```python
import streamlit as st
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(10, 5))
x = np.linspace(0, 10, 100)
ax.plot(x, np.sin(x), label="sin(x)")
ax.plot(x, np.cos(x), label="cos(x)")
ax.set_title("Trigonometric Functions")
ax.legend()
ax.grid(True, alpha=0.3)

st.pyplot(fig)
```

---

## Streamlit Layout

### Sidebar

```python
import streamlit as st

# Sidebar for filters and controls
with st.sidebar:
    st.title("Filters")
    category = st.selectbox("Category", ["All", "Electronics", "Clothing"])
    min_price = st.slider("Min Price", 0, 1000, 100)
    show_details = st.checkbox("Show detailed view", value=True)
    st.divider()
    st.caption("Dashboard v2.1")

# Main content area
st.title("Product Dashboard")
st.write(f"Showing: {category}, min price: ${min_price}")
```

### Columns and Tabs

```python
import streamlit as st

# Columns
col1, col2 = st.columns(2)
with col1:
    st.header("Left Panel")
    st.line_chart([1, 3, 2, 4, 3, 5])
with col2:
    st.header("Right Panel")
    st.metric("Total", "245")
    st.metric("Average", "3.2")

# Tabs
tab1, tab2 = st.tabs(["Overview", "Details"])

with tab1:
    st.write("High-level metrics here")
with tab2:
    st.write("Drill-down data here")

# Expander
with st.expander("Click to see methodology"):
    st.write("We used a random forest model trained on 2 years of data...")
    st.code("model = RandomForestClassifier(n_estimators=100)")
```

---

## Streamlit Caching

Use `@st.cache_data` for expensive computations (data loading, preprocessing). Use `@st.cache_resource` for ML models or database connections. Cached functions run once and return instantly on subsequent calls.

```python
import streamlit as st
import pandas as pd

@st.cache_data
def load_data(filepath):
    """Load and preprocess data (cached)."""
    df = pd.read_csv(filepath)
    df["date"] = pd.to_datetime(df["date"])
    return df

df = load_data("sales.csv")  # Instant after first call
st.write(f"Loaded {len(df)} rows")
```

---

## Complete Streamlit Dashboard

```python
# dashboard.py — Run with: streamlit run dashboard.py
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px

# --- Page Config ---
st.set_page_config(
    page_title="Sales Dashboard",
    page_icon="📊",
    layout="wide"
)

# --- Generate Sample Data ---
@st.cache_data
def generate_data():
    np.random.seed(42)
    dates = pd.date_range("2024-01-01", "2024-12-31", freq="D")
    n = len(dates)
    df = pd.DataFrame({
        "date": dates,
        "revenue": np.random.normal(5000, 1500, n).cumsum() / n * 10,
        "orders": np.random.poisson(50, n),
        "region": np.random.choice(["North", "South", "East", "West"], n),
        "category": np.random.choice(["Electronics", "Clothing", "Food"], n)
    })
    df["revenue"] = df["revenue"].clip(lower=1000)
    return df

df = generate_data()

# --- Sidebar Filters ---
with st.sidebar:
    st.title("🎛️ Filters")

    regions = st.multiselect(
        "Regions",
        df["region"].unique(),
        default=df["region"].unique()
    )

    categories = st.multiselect(
        "Categories",
        df["category"].unique(),
        default=df["category"].unique()
    )

    date_range = st.date_input(
        "Date Range",
        value=(df["date"].min(), df["date"].max()),
        min_value=df["date"].min(),
        max_value=df["date"].max()
    )

# --- Apply Filters ---
mask = (
    (df["region"].isin(regions)) &
    (df["category"].isin(categories)) &
    (df["date"] >= pd.Timestamp(date_range[0])) &
    (df["date"] <= pd.Timestamp(date_range[1]))
)
filtered_df = df[mask]

# --- Header ---
st.title("📊 Sales Dashboard")
st.caption(f"Showing {len(filtered_df)} records | Last updated: 2024-12-31")

# --- KPI Row ---
col1, col2, col3 = st.columns(3)
total_revenue = filtered_df["revenue"].sum()
total_orders = filtered_df["orders"].sum()

col1.metric("Total Revenue", f"${total_revenue:,.0f}")
col2.metric("Total Orders", f"{total_orders:,}")
col3.metric("Days in Range", f"{len(filtered_df)}")

st.divider()

# --- Charts ---
chart_col1, chart_col2 = st.columns(2)

with chart_col1:
    daily = filtered_df.groupby("date")["revenue"].sum().reset_index()
    fig = px.line(daily, x="date", y="revenue", title="Revenue Over Time")
    st.plotly_chart(fig, use_container_width=True)

with chart_col2:
    cat_revenue = filtered_df.groupby("category")["revenue"].sum().reset_index()
    fig = px.pie(cat_revenue, values="revenue", names="category", hole=0.4)
    st.plotly_chart(fig, use_container_width=True)

# --- Data Table ---
st.subheader("Raw Data")
st.dataframe(filtered_df.sort_values("date", ascending=False), height=300)

# --- Download ---
csv = filtered_df.to_csv(index=False)
st.download_button("📥 Download CSV", csv, "filtered_data.csv", "text/csv")
```

---

## Dash (Plotly): Callback-Based Dashboards

**Dash** is more complex than Streamlit but offers more control for production apps.

### Installation

```python
# pip install dash
```

### Basic Dash App

```python
from dash import Dash, html, dcc, callback, Output, Input
import plotly.express as px
import pandas as pd

# Create app
app = Dash(__name__)

# Sample data
df = pd.DataFrame({
    "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    "Sales": [100, 120, 140, 130, 160, 180],
    "Expenses": [80, 85, 90, 88, 95, 100]
})

# Layout
app.layout = html.Div([
    html.H1("Sales Dashboard", style={"textAlign": "center"}),

    html.Div([
        html.Label("Select Metric:"),
        dcc.Dropdown(
            id="metric-dropdown",
            options=[
                {"label": "Sales", "value": "Sales"},
                {"label": "Expenses", "value": "Expenses"}
            ],
            value="Sales"
        )
    ], style={"width": "300px", "margin": "20px auto"}),

    dcc.Graph(id="main-chart")
])

# Callback: when dropdown changes, update chart
@callback(
    Output("main-chart", "figure"),
    Input("metric-dropdown", "value")
)
def update_chart(selected_metric):
    fig = px.bar(df, x="Month", y=selected_metric,
                 title=f"Monthly {selected_metric}")
    return fig

# Run: python app.py → http://localhost:8050
if __name__ == "__main__":
    app.run(debug=True)
```

---

## Streamlit vs Dash Comparison

| Feature | Streamlit | Dash |
|---------|-----------|------|
| Learning curve | Very easy | Moderate |
| Reactivity | Script reruns top-to-bottom | Explicit callbacks |
| Deployment | Streamlit Cloud (free) | Heroku, AWS, etc. |
| Customization | Limited (but growing) | Full control |
| State management | `st.session_state` | Callbacks + stores |
| Best for | Prototypes, data science | Production apps |

---

## Summary

| Tool | When to Use |
|------|-------------|
| Streamlit | Quick prototypes, internal tools, data exploration |
| Dash | Production apps, complex interactions, custom designs |
| Panel | Already using HoloViews/Bokeh |
| Tableau/Power BI | Non-technical stakeholders, enterprise |

**Key takeaways:**
- Streamlit is the fastest way to go from Python script to web app
- Use `st.cache_data` for performance with expensive computations
- Dash offers more control through its callback architecture
- Both integrate perfectly with Plotly for interactive visualizations
- Deploy for free on Streamlit Cloud or in Docker containers
- Always add filters and interactivity — static dashboards are just reports
