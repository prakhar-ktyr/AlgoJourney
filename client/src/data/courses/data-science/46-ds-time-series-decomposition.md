---
title: Time Series Decomposition
---

# Time Series Decomposition

Time series decomposition breaks a series into individual components to better understand patterns and make forecasting easier.

---

## What Is Decomposition?

Decomposition separates a time series into **three** (or four) components:

| Component | Symbol | Meaning |
|-----------|--------|---------|
| **Trend** | $T_t$ | Long-term increase or decrease |
| **Seasonal** | $S_t$ | Repeating short-term patterns |
| **Residual** | $R_t$ | Random noise left over |
| **Cyclic** | $C_t$ | Long-term oscillations (optional) |

By isolating each part, you can:

- Understand **what drives** the data
- Remove seasonality for clearer trend analysis
- Improve forecast accuracy

---

## Additive Model

$$Y_t = T_t + S_t + R_t$$

Use the additive model when **seasonal variation is roughly constant** over time.

**Example:** A store sells about 200 extra units every December regardless of overall sales level.

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Simulate additive time series
np.random.seed(42)
n = 120  # 10 years of monthly data

trend = np.linspace(100, 200, n)
seasonal = 20 * np.sin(2 * np.pi * np.arange(n) / 12)
noise = np.random.normal(0, 5, n)

# Additive: components are summed
y_additive = trend + seasonal + noise

dates = pd.date_range(start="2014-01", periods=n, freq="M")
ts_add = pd.Series(y_additive, index=dates)

plt.figure(figsize=(10, 4))
plt.plot(ts_add)
plt.title("Additive Time Series")
plt.xlabel("Date")
plt.ylabel("Value")
plt.show()
```

Notice how the seasonal swings stay the **same size** as the trend rises.

---

## Multiplicative Model

$$Y_t = T_t \times S_t \times R_t$$

Use the multiplicative model when **seasonal variation grows (or shrinks) with the trend**.

**Example:** Airline passengers — more passengers overall means bigger seasonal peaks.

```python
# Simulate multiplicative time series
trend_m = np.linspace(100, 300, n)
seasonal_m = 1 + 0.2 * np.sin(2 * np.pi * np.arange(n) / 12)
noise_m = np.random.normal(1, 0.03, n)

# Multiplicative: components are multiplied
y_mult = trend_m * seasonal_m * noise_m

ts_mult = pd.Series(y_mult, index=dates)

plt.figure(figsize=(10, 4))
plt.plot(ts_mult)
plt.title("Multiplicative Time Series")
plt.xlabel("Date")
plt.ylabel("Value")
plt.show()
```

The seasonal swings **grow larger** as the series increases.

---

## How to Choose?

| Question | Additive | Multiplicative |
|----------|----------|----------------|
| Seasonal amplitude constant? | Yes | No |
| Seasonal amplitude proportional to level? | No | Yes |
| Log transform makes it additive? | N/A | Yes |

**Tip:** If you take `log(Y)` and it looks additive, the original is multiplicative:

$$\log(T_t \times S_t \times R_t) = \log T_t + \log S_t + \log R_t$$

---

## Decomposition with statsmodels

The `seasonal_decompose` function provides a quick classical decomposition.

```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Load classic airline passengers dataset
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv"
df = pd.read_csv(url, parse_dates=["Month"], index_col="Month")
ts = df["Passengers"]

# Additive decomposition
result_add = seasonal_decompose(ts, model="additive", period=12)
result_add.plot()
plt.suptitle("Additive Decomposition", y=1.02)
plt.tight_layout()
plt.show()
```

```python
# Multiplicative decomposition (better fit for this data)
result_mult = seasonal_decompose(ts, model="multiplicative", period=12)
result_mult.plot()
plt.suptitle("Multiplicative Decomposition", y=1.02)
plt.tight_layout()
plt.show()
```

### Accessing Components

```python
# Each component is a pandas Series
trend = result_mult.trend
seasonal = result_mult.seasonal
residual = result_mult.resid

print("Trend (first 5):")
print(trend.dropna().head())

print("\nSeasonal pattern (one cycle):")
print(seasonal[:12])

print("\nResidual stats:")
print(residual.describe())
```

---

## STL Decomposition (Recommended)

**STL** = Seasonal and Trend decomposition using **Loess** (locally weighted regression).

Advantages over classical decomposition:

| Feature | Classical | STL |
|---------|-----------|-----|
| Handles changing seasonality | No | Yes |
| Robust to outliers | No | Yes |
| Trend smoothness control | No | Yes |
| Always produces values at endpoints | No | Yes |

```python
from statsmodels.tsa.seasonal import STL

# STL decomposition
stl = STL(ts, period=12, robust=True)
result_stl = stl.fit()

# Plot all components
fig = result_stl.plot()
fig.set_size_inches(10, 8)
plt.tight_layout()
plt.show()
```

### STL Parameters

```python
# Fine-tune STL
stl_custom = STL(
    ts,
    period=12,         # Seasonal period
    seasonal=13,       # Seasonal smoother length (odd number >= 7)
    trend=25,          # Trend smoother length (odd number)
    robust=True,       # Robust to outliers
    seasonal_deg=1,    # Degree of seasonal LOESS (0 or 1)
    trend_deg=1,       # Degree of trend LOESS (0 or 1)
)
result_custom = stl_custom.fit()

print("Trend component:")
print(result_custom.trend.head())

print("\nSeasonal component:")
print(result_custom.seasonal.head())

print("\nResidual component:")
print(result_custom.resid.head())
```

---

## Moving Averages for Trend Extraction

A moving average smooths out short-term fluctuations to reveal the trend.

### Simple Moving Average (SMA)

$$SMA_t = \frac{1}{k} \sum_{i=0}^{k-1} y_{t-i}$$

```python
# Simple Moving Average
df_ma = pd.DataFrame({"Passengers": ts})

# Trailing (standard) — uses past k values
df_ma["SMA_12"] = df_ma["Passengers"].rolling(window=12).mean()

# Centered — looks at k/2 values on each side
df_ma["SMA_centered"] = df_ma["Passengers"].rolling(
    window=12, center=True
).mean()

plt.figure(figsize=(10, 5))
plt.plot(df_ma["Passengers"], label="Original", alpha=0.7)
plt.plot(df_ma["SMA_12"], label="SMA 12 (Trailing)", linewidth=2)
plt.plot(df_ma["SMA_centered"], label="SMA 12 (Centered)", linewidth=2)
plt.legend()
plt.title("Simple Moving Average — Trailing vs Centered")
plt.show()
```

### Trailing vs Centered

| Type | Formula | Use Case |
|------|---------|----------|
| **Trailing** | Uses past k values | Real-time forecasting |
| **Centered** | Uses k/2 before and after | Historical trend analysis |

### Exponential Moving Average (EMA)

EMA gives **more weight to recent** observations:

$$EMA_t = \alpha \cdot y_t + (1 - \alpha) \cdot EMA_{t-1}$$

where $\alpha = \frac{2}{span + 1}$

```python
# Exponential Moving Average
df_ma["EMA_12"] = df_ma["Passengers"].ewm(span=12, adjust=False).mean()

plt.figure(figsize=(10, 5))
plt.plot(df_ma["Passengers"], label="Original", alpha=0.7)
plt.plot(df_ma["SMA_12"], label="SMA 12", linewidth=2)
plt.plot(df_ma["EMA_12"], label="EMA 12", linewidth=2)
plt.legend()
plt.title("SMA vs EMA")
plt.show()
```

EMA reacts **faster** to recent changes than SMA.

---

## Seasonal Adjustment

Remove seasonality to see the **underlying trend** more clearly.

```python
# Seasonal adjustment (multiplicative)
result = seasonal_decompose(ts, model="multiplicative", period=12)

# Divide out the seasonal component
seasonally_adjusted = ts / result.seasonal

plt.figure(figsize=(10, 5))
plt.plot(ts, label="Original", alpha=0.6)
plt.plot(seasonally_adjusted, label="Seasonally Adjusted", linewidth=2)
plt.legend()
plt.title("Seasonal Adjustment")
plt.show()
```

```python
# Seasonal adjustment (additive)
result_a = seasonal_decompose(ts, model="additive", period=12)

# Subtract the seasonal component
sa_additive = ts - result_a.seasonal

print("Seasonally Adjusted (additive) — first 5 values:")
print(sa_additive.head())
```

---

## Detrending

Remove the trend to isolate seasonal patterns and cycles.

```python
# Method 1: Subtract the trend component
detrended_sub = ts - result_mult.trend

# Method 2: First differencing
detrended_diff = ts.diff(1)

# Method 3: Divide by trend (for multiplicative)
detrended_div = ts / result_mult.trend

fig, axes = plt.subplots(3, 1, figsize=(10, 8))

axes[0].plot(detrended_sub.dropna())
axes[0].set_title("Detrended: Subtract Trend")

axes[1].plot(detrended_diff.dropna())
axes[1].set_title("Detrended: First Difference")

axes[2].plot(detrended_div.dropna())
axes[2].set_title("Detrended: Divide by Trend")

plt.tight_layout()
plt.show()
```

---

## Complete Example: Retail Sales Decomposition

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.seasonal import seasonal_decompose, STL

# Simulate monthly retail sales (5 years)
np.random.seed(123)
n = 60
dates = pd.date_range(start="2019-01", periods=n, freq="M")

# Components
trend = np.linspace(50000, 80000, n)
seasonal_pattern = [0.85, 0.80, 0.90, 0.95, 1.00, 1.05,
                    1.00, 1.00, 1.05, 1.10, 1.20, 1.40]
seasonal = np.tile(seasonal_pattern, n // 12)
noise = np.random.normal(1, 0.03, n)

# Multiplicative model
sales = trend * seasonal * noise
ts_sales = pd.Series(sales, index=dates, name="Sales")

# --- Classical Decomposition ---
print("=" * 50)
print("CLASSICAL DECOMPOSITION")
print("=" * 50)

result_classic = seasonal_decompose(ts_sales, model="multiplicative", period=12)

fig, axes = plt.subplots(4, 1, figsize=(10, 10))
result_classic.observed.plot(ax=axes[0], title="Observed")
result_classic.trend.plot(ax=axes[1], title="Trend")
result_classic.seasonal.plot(ax=axes[2], title="Seasonal")
result_classic.resid.plot(ax=axes[3], title="Residual")
plt.tight_layout()
plt.show()

# --- STL Decomposition ---
print("\n" + "=" * 50)
print("STL DECOMPOSITION")
print("=" * 50)

# STL works with additive model; use log for multiplicative
ts_log = np.log(ts_sales)
stl = STL(ts_log, period=12, robust=True)
result_stl = stl.fit()

fig = result_stl.plot()
fig.set_size_inches(10, 10)
plt.suptitle("STL Decomposition (Log Scale)", y=1.01)
plt.tight_layout()
plt.show()

# --- Seasonal Strength ---
# Measures how strong the seasonal component is (0 to 1)
var_resid = np.var(result_stl.resid)
var_seasonal_plus_resid = np.var(result_stl.seasonal + result_stl.resid)
seasonal_strength = 1 - (var_resid / var_seasonal_plus_resid)
print(f"\nSeasonal Strength: {seasonal_strength:.3f}")
print("(Closer to 1 = strong seasonality)")

# --- Trend Strength ---
var_trend_plus_resid = np.var(result_stl.trend + result_stl.resid)
trend_strength = 1 - (var_resid / var_trend_plus_resid)
print(f"Trend Strength: {trend_strength:.3f}")
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Additive | $Y = T + S + R$ — constant seasonal amplitude |
| Multiplicative | $Y = T \times S \times R$ — growing amplitude |
| `seasonal_decompose` | Quick classical method |
| STL | Robust, handles changing seasonality |
| SMA | Equal weights for smoothing |
| EMA | More weight on recent data |
| Seasonal adjustment | Remove $S_t$ to see trend |
| Detrending | Remove $T_t$ to see patterns |

---

## Exercises

1. Load the airline passengers dataset and perform both additive and multiplicative decomposition. Which fits better and why?
2. Apply STL with different `seasonal` parameter values (7, 13, 21). How does it affect the decomposition?
3. Compute a 6-month and 24-month SMA on any dataset. Compare how responsive each is to changes.
4. Seasonally adjust a dataset and compare it to the original. What new insights emerge?

---
