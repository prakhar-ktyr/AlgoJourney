---
title: Introduction to Time Series
---

# Introduction to Time Series

Time series data consists of observations collected **sequentially over time**. The order matters — unlike cross-sectional data where rows are independent, each time point is related to its neighbors.

---

## Real-World Examples

| Domain | Time Series | Frequency |
|--------|------------|-----------|
| Finance | Stock prices, exchange rates | Minutes to daily |
| Weather | Temperature, rainfall | Hourly, daily |
| Business | Sales, revenue, website traffic | Daily, weekly, monthly |
| IoT | Sensor readings, heart rate | Seconds, milliseconds |
| Economics | GDP, unemployment, inflation | Quarterly, yearly |

---

## Time Series vs Cross-Sectional Data

| Aspect | Cross-Sectional | Time Series |
|--------|----------------|-------------|
| Order | Doesn't matter | Critical |
| Independence | Rows independent | Rows correlated |
| Example | Survey of 1000 people | Daily temperature for 3 years |
| Splitting | Random train/test split | Temporal split (past → future) |
| Goal | Predict outcomes | Forecast future values |

> **Key difference:** In time series, you can only use **past** data to predict the **future**. Never use future data to predict the past (data leakage).

---

## Components of Time Series

Every time series can be decomposed into:

### 1. Trend

Long-term direction — increasing, decreasing, or flat:

```python
import pandas as pd
import numpy as np

# Simulated trend
np.random.seed(42)
t = np.arange(100)

# Upward trend
uptrend = 2 * t + np.random.randn(100) * 10
# Downward trend
downtrend = 200 - 1.5 * t + np.random.randn(100) * 10
# No trend (stationary mean)
no_trend = 50 + np.random.randn(100) * 10

print("Upward trend:   starts ~0, ends ~200")
print("Downward trend: starts ~200, ends ~50")
print("No trend:       stays around 50")
```

### 2. Seasonality

Repeating patterns at **fixed, known periods**:
- Daily: rush hour traffic peaks at 8am and 5pm
- Weekly: restaurant sales peak on weekends
- Yearly: retail sales spike in December

### 3. Cyclical

Repeating patterns at **non-fixed periods** (not predictable in advance):
- Business cycles (recession/expansion): 5–10 years
- Sunspot cycles: ~11 years

### 4. Residual (Noise)

Random variation that cannot be explained by trend, seasonality, or cycles.

---

## Decomposition

$$Y_t = T_t + S_t + R_t \quad \text{(Additive)}$$

$$Y_t = T_t \times S_t \times R_t \quad \text{(Multiplicative)}$$

- **Additive:** seasonal variation is constant over time
- **Multiplicative:** seasonal variation grows with the level

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose

# Create time series with trend + seasonality
np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=365 * 2, freq='D')
t = np.arange(len(dates))

trend = 0.05 * t
seasonality = 10 * np.sin(2 * np.pi * t / 365)  # yearly cycle
noise = np.random.randn(len(dates)) * 2
y = 50 + trend + seasonality + noise

ts = pd.Series(y, index=dates)

# Decompose
decomposition = seasonal_decompose(ts, model='additive', period=365)

print("Decomposition components:")
print(f"  Trend (sample):      {decomposition.trend.dropna().iloc[:5].values}")
print(f"  Seasonal (sample):   {decomposition.seasonal.iloc[:5].values}")
print(f"  Residual (sample):   {decomposition.resid.dropna().iloc[:5].values}")
```

---

## Creating Time Series in Pandas

### DatetimeIndex

```python
import pandas as pd
import numpy as np

# Create date range
dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='D')
print(f"Daily dates: {len(dates)} days")

# Different frequencies
hourly = pd.date_range('2024-01-01', periods=48, freq='H')
weekly = pd.date_range('2024-01-01', periods=52, freq='W')
monthly = pd.date_range('2024-01-01', periods=12, freq='MS')  # Month Start
quarterly = pd.date_range('2024-01-01', periods=4, freq='QS')  # Quarter Start

print(f"Hourly:    {hourly[:3].tolist()}")
print(f"Weekly:    {weekly[:3].tolist()}")
print(f"Monthly:   {monthly[:3].tolist()}")
print(f"Quarterly: {quarterly[:3].tolist()}")
```

---

### Working with Time Series DataFrames

```python
import pandas as pd
import numpy as np

# Create sample data
np.random.seed(42)
df = pd.DataFrame({
    'date': pd.date_range('2022-01-01', periods=730, freq='D'),
    'sales': np.random.poisson(100, 730) + np.arange(730) * 0.1,
    'temperature': 20 + 10 * np.sin(2 * np.pi * np.arange(730) / 365) + np.random.randn(730) * 3
})

# Set date as index
df.set_index('date', inplace=True)

# Ensure sorted
df.sort_index(inplace=True)

# Basic info
print(f"Date range: {df.index.min()} to {df.index.max()}")
print(f"Frequency: {df.index.freq}")
print(f"\nFirst 5 rows:")
print(df.head())

# Access by date
print(f"\nJan 2022 sales mean: {df.loc['2022-01'].sales.mean():.1f}")
print(f"2022 Q1 sales sum: {df.loc['2022-01':'2022-03'].sales.sum():.1f}")
```

---

### Resampling

Change the frequency of your time series:

```python
import pandas as pd
import numpy as np

np.random.seed(42)
# Daily data
dates = pd.date_range('2024-01-01', periods=365, freq='D')
df = pd.DataFrame({
    'sales': np.random.poisson(50, 365) + 10 * np.sin(2 * np.pi * np.arange(365) / 7)
}, index=dates)

print("Original (daily):")
print(df.head())

# Downsample: daily → weekly (aggregate)
weekly = df.resample('W').agg({
    'sales': ['sum', 'mean', 'max']
})
print(f"\nWeekly (first 5 weeks):")
print(weekly.head())

# Downsample: daily → monthly
monthly = df.resample('M').mean()
print(f"\nMonthly means:")
print(monthly.head())

# Upsample: daily → hourly (need to fill)
hourly = df.resample('6H').ffill()  # forward fill
print(f"\nUpsampled to 6H (first rows):")
print(hourly.head())
```

---

## Visualizing Time Series

### Line Plot and Rolling Statistics

```python
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=730, freq='D')
trend = np.arange(730) * 0.05
seasonality = 15 * np.sin(2 * np.pi * np.arange(730) / 365)
noise = np.random.randn(730) * 5
sales = 100 + trend + seasonality + noise

df = pd.DataFrame({'sales': sales}, index=dates)

# Rolling mean (smooths out noise)
df['rolling_mean_7'] = df['sales'].rolling(window=7).mean()
df['rolling_mean_30'] = df['sales'].rolling(window=30).mean()
df['rolling_mean_90'] = df['sales'].rolling(window=90).mean()

# Rolling standard deviation (shows volatility)
df['rolling_std_30'] = df['sales'].rolling(window=30).std()

print("Sales with rolling statistics:")
print(df.tail(10))

# Expanding mean (cumulative)
df['expanding_mean'] = df['sales'].expanding().mean()
print(f"\nFinal expanding mean: {df['expanding_mean'].iloc[-1]:.2f}")
```

---

### Identifying Patterns

```python
import pandas as pd
import numpy as np

np.random.seed(42)
dates = pd.date_range('2023-01-01', periods=365, freq='D')
sales = 100 + np.arange(365) * 0.1 + 20 * np.sin(2 * np.pi * np.arange(365) / 7) + np.random.randn(365) * 5

df = pd.DataFrame({'sales': sales}, index=dates)

# Monthly patterns
monthly_avg = df.groupby(df.index.month)['sales'].mean()
print("Monthly average sales:")
print(monthly_avg)

# Day of week patterns
dow_avg = df.groupby(df.index.dayofweek)['sales'].mean()
day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
print("\nDay of week averages:")
for i, name in enumerate(day_names):
    print(f"  {name}: {dow_avg.iloc[i]:.1f}")

# Year-over-year comparison (if multi-year)
print(f"\nQ1 mean: {df.loc['2023-01':'2023-03']['sales'].mean():.1f}")
print(f"Q4 mean: {df.loc['2023-10':'2023-12']['sales'].mean():.1f}")
```

---

## Stationarity

A time series is **stationary** when its statistical properties don't change over time:
- Constant mean
- Constant variance
- Autocovariance depends only on lag, not time

### Why It Matters

Most time series models (ARIMA, exponential smoothing) **assume stationarity**. Non-stationary data must be transformed first.

---

### Visual Check

```python
import pandas as pd
import numpy as np

np.random.seed(42)

# Non-stationary (has trend)
t = np.arange(200)
non_stationary = 50 + 0.5 * t + np.random.randn(200) * 5

# Stationary (constant mean/variance)
stationary = 50 + np.random.randn(200) * 5

# Check with rolling statistics
df_ns = pd.Series(non_stationary)
df_s = pd.Series(stationary)

# Rolling mean and std should be roughly flat for stationary
print("Non-stationary series:")
print(f"  First 50 mean: {df_ns[:50].mean():.1f}, std: {df_ns[:50].std():.1f}")
print(f"  Last 50 mean:  {df_ns[-50:].mean():.1f}, std: {df_ns[-50:].std():.1f}")

print("\nStationary series:")
print(f"  First 50 mean: {df_s[:50].mean():.1f}, std: {df_s[:50].std():.1f}")
print(f"  Last 50 mean:  {df_s[-50:].mean():.1f}, std: {df_s[-50:].std():.1f}")
```

---

### Augmented Dickey-Fuller (ADF) Test

Statistical test for stationarity:

- $H_0$: Series has a unit root (non-stationary)
- $H_1$: Series is stationary
- p-value < 0.05 → reject $H_0$ → series is stationary

```python
from statsmodels.tsa.stattools import adfuller
import numpy as np
import pandas as pd

def adf_test(series, name='Series'):
    """Perform Augmented Dickey-Fuller test."""
    result = adfuller(series, autolag='AIC')

    print(f"ADF Test for: {name}")
    print(f"  Test Statistic: {result[0]:.4f}")
    print(f"  p-value:        {result[1]:.6f}")
    print(f"  Lags Used:      {result[2]}")
    print(f"  Observations:   {result[3]}")
    print(f"  Critical Values:")
    for key, val in result[4].items():
        print(f"    {key}: {val:.4f}")
    print(f"  Conclusion: {'STATIONARY' if result[1] < 0.05 else 'NON-STATIONARY'}")
    print()

# Test examples
np.random.seed(42)
t = np.arange(200)

# Non-stationary (random walk)
random_walk = np.cumsum(np.random.randn(200))

# Stationary (white noise)
white_noise = np.random.randn(200)

# Non-stationary (trend)
trending = 0.5 * t + np.random.randn(200) * 3

adf_test(random_walk, "Random Walk")
adf_test(white_noise, "White Noise")
adf_test(trending, "Trending Series")
```

---

## Making Data Stationary

### Differencing

Remove trend by computing differences:

$$y'_t = y_t - y_{t-1}$$

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller

np.random.seed(42)

# Non-stationary series (trend + noise)
t = np.arange(200)
series = pd.Series(50 + 0.5 * t + np.random.randn(200) * 3)

print(f"Original — ADF p-value: {adfuller(series)[1]:.6f}")

# First differencing
diff1 = series.diff().dropna()
print(f"1st diff — ADF p-value: {adfuller(diff1)[1]:.6f}")

# Second differencing (if first isn't enough)
diff2 = series.diff().diff().dropna()
print(f"2nd diff — ADF p-value: {adfuller(diff2)[1]:.6f}")

# Check means
print(f"\nOriginal mean (first/last 50): {series[:50].mean():.1f} / {series[-50:].mean():.1f}")
print(f"Diff1 mean (first/last 50):    {diff1[:50].mean():.2f} / {diff1[-50:].mean():.2f}")
```

---

### Log Transform + Differencing

For series with **increasing variance** (multiplicative seasonality):

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller

np.random.seed(42)

# Exponentially growing series (variance increases with level)
t = np.arange(200)
series = pd.Series(np.exp(0.02 * t + np.random.randn(200) * 0.1))

print(f"Original — ADF p-value: {adfuller(series)[1]:.6f}")

# Log transform (stabilize variance)
log_series = np.log(series)
print(f"Log — ADF p-value: {adfuller(log_series)[1]:.6f}")

# Log + differencing
log_diff = log_series.diff().dropna()
print(f"Log + diff — ADF p-value: {adfuller(log_diff)[1]:.6f}")

print(f"\nOriginal variance (first/last 50): "
      f"{series[:50].std():.2f} / {series[-50:].std():.2f}")
print(f"Log variance (first/last 50): "
      f"{log_series[:50].std():.4f} / {log_series[-50:].std():.4f}")
```

---

### Seasonal Differencing

Remove seasonality by subtracting the value from one season ago:

$$y'_t = y_t - y_{t-m}$$

where $m$ is the seasonal period (e.g., 12 for monthly data with yearly seasonality).

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller

np.random.seed(42)

# Monthly data with yearly seasonality
t = np.arange(120)  # 10 years of monthly data
trend = 0.1 * t
seasonality = 10 * np.sin(2 * np.pi * t / 12)
noise = np.random.randn(120) * 2
series = pd.Series(50 + trend + seasonality + noise)

print(f"Original — ADF p-value: {adfuller(series)[1]:.6f}")

# Seasonal differencing (period=12)
seasonal_diff = series.diff(12).dropna()
print(f"Seasonal diff (m=12) — ADF p-value: {adfuller(seasonal_diff)[1]:.6f}")

# Both seasonal and first differencing
both_diff = series.diff(12).diff().dropna()
print(f"Seasonal + first diff — ADF p-value: {adfuller(both_diff)[1]:.6f}")
```

---

## Autocorrelation

### ACF (Autocorrelation Function)

Measures correlation between the series and its lagged versions:

$$\rho_k = \text{Corr}(y_t, y_{t-k})$$

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import acf, pacf
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

np.random.seed(42)

# Create series with autocorrelation
n = 200
# AR(1) process: y_t = 0.8 * y_{t-1} + noise
series = np.zeros(n)
for i in range(1, n):
    series[i] = 0.8 * series[i-1] + np.random.randn()

series = pd.Series(series)

# Compute ACF values
acf_values = acf(series, nlags=20)
print("ACF values (first 10 lags):")
for i, val in enumerate(acf_values[:11]):
    bar = '█' * int(abs(val) * 30)
    sign = '+' if val >= 0 else '-'
    print(f"  Lag {i:2d}: {val:+.4f}  {sign}{bar}")
```

---

### PACF (Partial Autocorrelation Function)

Measures the **direct** correlation at lag $k$, removing the effect of intermediate lags:

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import acf, pacf

np.random.seed(42)

# AR(2) process: y_t = 0.6*y_{t-1} - 0.3*y_{t-2} + noise
n = 300
series = np.zeros(n)
for i in range(2, n):
    series[i] = 0.6 * series[i-1] - 0.3 * series[i-2] + np.random.randn()

series = pd.Series(series)

# ACF — shows gradual decay
acf_vals = acf(series, nlags=15)

# PACF — shows sharp cutoff after lag 2 (AR order)
pacf_vals = pacf(series, nlags=15)

print("Lag | ACF      | PACF")
print("-" * 30)
for i in range(11):
    print(f"  {i:2d} | {acf_vals[i]:+.4f}  | {pacf_vals[i]:+.4f}")

print("\n→ PACF cuts off after lag 2, suggesting AR(2) process")
```

---

### Interpreting ACF and PACF

| Pattern | ACF | PACF | Suggests |
|---------|-----|------|----------|
| AR(p) | Gradual decay | Cuts off after lag p | Autoregressive model |
| MA(q) | Cuts off after lag q | Gradual decay | Moving average model |
| ARMA(p,q) | Gradual decay | Gradual decay | Both AR and MA |

---

## Complete Time Series Analysis

```python
import pandas as pd
import numpy as np
from statsmodels.tsa.stattools import adfuller, acf, pacf
from statsmodels.tsa.seasonal import seasonal_decompose

# --- Create realistic time series ---
np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=730, freq='D')  # 2 years daily

t = np.arange(730)
trend = 0.05 * t
yearly_season = 15 * np.sin(2 * np.pi * t / 365)
weekly_season = 5 * np.sin(2 * np.pi * t / 7)
noise = np.random.randn(730) * 3
values = 100 + trend + yearly_season + weekly_season + noise

ts = pd.Series(values, index=dates, name='daily_sales')

# --- Basic Exploration ---
print("=" * 60)
print("TIME SERIES ANALYSIS")
print("=" * 60)
print(f"Period: {ts.index.min().date()} to {ts.index.max().date()}")
print(f"Length: {len(ts)} observations")
print(f"Mean: {ts.mean():.2f}")
print(f"Std:  {ts.std():.2f}")
print(f"Min:  {ts.min():.2f}")
print(f"Max:  {ts.max():.2f}")

# --- Rolling Statistics ---
rolling_mean = ts.rolling(window=30).mean()
rolling_std = ts.rolling(window=30).std()

print(f"\n--- Rolling Statistics (30-day window) ---")
print(f"Mean range: {rolling_mean.min():.2f} to {rolling_mean.max():.2f}")
print(f"Std range:  {rolling_std.min():.2f} to {rolling_std.max():.2f}")

# --- Stationarity Test ---
print(f"\n--- ADF Test (Original) ---")
result = adfuller(ts, autolag='AIC')
print(f"Test Statistic: {result[0]:.4f}")
print(f"p-value: {result[1]:.6f}")
print(f"Result: {'Stationary' if result[1] < 0.05 else 'Non-Stationary'}")

# --- Make Stationary ---
ts_diff = ts.diff().dropna()
print(f"\n--- ADF Test (1st Difference) ---")
result_diff = adfuller(ts_diff, autolag='AIC')
print(f"Test Statistic: {result_diff[0]:.4f}")
print(f"p-value: {result_diff[1]:.6f}")
print(f"Result: {'Stationary' if result_diff[1] < 0.05 else 'Non-Stationary'}")

# --- ACF/PACF ---
acf_vals = acf(ts_diff, nlags=20)
pacf_vals = pacf(ts_diff, nlags=20)

print(f"\n--- ACF/PACF (Differenced Series) ---")
print(f"{'Lag':<5}{'ACF':<12}{'PACF':<12}{'Significant'}")
print("-" * 40)
conf_interval = 1.96 / np.sqrt(len(ts_diff))
for i in range(1, 11):
    sig = "***" if abs(acf_vals[i]) > conf_interval else ""
    print(f"{i:<5}{acf_vals[i]:<12.4f}{pacf_vals[i]:<12.4f}{sig}")

print(f"\n95% confidence interval: ±{conf_interval:.4f}")

# --- Decomposition ---
decomposition = seasonal_decompose(ts, model='additive', period=7)
print(f"\n--- Seasonal Decomposition (period=7) ---")
print(f"Trend range: {decomposition.trend.dropna().min():.2f} to "
      f"{decomposition.trend.dropna().max():.2f}")
print(f"Seasonal range: {decomposition.seasonal.min():.2f} to "
      f"{decomposition.seasonal.max():.2f}")
print(f"Residual std: {decomposition.resid.dropna().std():.2f}")

# --- Summary ---
print(f"\n{'=' * 60}")
print("SUMMARY")
print(f"{'=' * 60}")
print("1. Series has upward TREND (non-stationary)")
print("2. Weekly SEASONALITY detected (period=7)")
print("3. First differencing achieves stationarity")
print("4. ACF/PACF suggest short-term autocorrelation")
print("5. Next steps: fit ARIMA or seasonal ARIMA model")
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Trend | Long-term direction |
| Seasonality | Fixed-period repeating patterns |
| Stationarity | Constant mean and variance over time |
| ADF Test | Statistical test for stationarity |
| Differencing | $y'_t = y_t - y_{t-1}$ removes trend |
| ACF | Correlation with lagged values |
| PACF | Direct correlation (no intermediates) |
| Resampling | Change time frequency |

**Next Steps:** With these foundations, you can build forecasting models (ARIMA, Prophet, LSTM) — covered in upcoming lessons.

---
