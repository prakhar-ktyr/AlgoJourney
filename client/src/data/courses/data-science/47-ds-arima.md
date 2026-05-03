---
title: ARIMA & SARIMA Models
---

# ARIMA & SARIMA Models

ARIMA is one of the most popular statistical methods for time series forecasting. It combines autoregression, differencing, and moving averages into a single framework.

---

## What Is ARIMA?

**ARIMA** = **A**uto**R**egressive **I**ntegrated **M**oving **A**verage

It models a time series using three components:

| Component | Letter | Meaning |
|-----------|--------|---------|
| AutoRegressive | AR(p) | Predict from past values |
| Integrated | I(d) | Differencing for stationarity |
| Moving Average | MA(q) | Predict from past forecast errors |

---

## AR (AutoRegressive) Component

An AR model predicts the current value using a **linear combination of past values**.

### AR(p) Formula

$$y_t = c + \phi_1 y_{t-1} + \phi_2 y_{t-2} + \cdots + \phi_p y_{t-p} + \epsilon_t$$

where:
- $c$ = constant
- $\phi_i$ = coefficients for lag $i$
- $p$ = number of lag terms (the **order**)
- $\epsilon_t$ = white noise error

**Example:** AR(1) means we predict today's value from yesterday's:

$$y_t = c + \phi_1 y_{t-1} + \epsilon_t$$

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Simulate AR(1) process
np.random.seed(42)
n = 200
phi = 0.8  # AR coefficient
c = 5      # constant

y = np.zeros(n)
y[0] = c / (1 - phi)  # start at mean

for t in range(1, n):
    y[t] = c + phi * y[t - 1] + np.random.normal(0, 1)

plt.figure(figsize=(10, 4))
plt.plot(y)
plt.title(f"AR(1) Process (φ = {phi})")
plt.xlabel("Time")
plt.ylabel("Value")
plt.axhline(y=c / (1 - phi), color="red", linestyle="--", label="Mean")
plt.legend()
plt.show()
```

---

## MA (Moving Average) Component

An MA model predicts using **past forecast errors** (not past values).

### MA(q) Formula

$$y_t = c + \epsilon_t + \theta_1 \epsilon_{t-1} + \theta_2 \epsilon_{t-2} + \cdots + \theta_q \epsilon_{t-q}$$

where:
- $\theta_i$ = coefficients for past error at lag $i$
- $q$ = number of error terms (the **order**)
- $\epsilon_t$ = white noise

```python
# Simulate MA(1) process
theta = 0.6
errors = np.random.normal(0, 1, n)
y_ma = np.zeros(n)

for t in range(1, n):
    y_ma[t] = 10 + errors[t] + theta * errors[t - 1]

plt.figure(figsize=(10, 4))
plt.plot(y_ma)
plt.title(f"MA(1) Process (θ = {theta})")
plt.xlabel("Time")
plt.ylabel("Value")
plt.show()
```

---

## I (Integrated) Component — Differencing

Many real-world series are **non-stationary** (mean/variance changes over time). Differencing makes them stationary.

**First difference** ($d = 1$):
$$y'_t = y_t - y_{t-1}$$

**Second difference** ($d = 2$):
$$y''_t = y'_t - y'_{t-1}$$

```python
# Differencing example
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv"
df = pd.read_csv(url, parse_dates=["Month"], index_col="Month")
ts = df["Passengers"]

fig, axes = plt.subplots(3, 1, figsize=(10, 8))

axes[0].plot(ts)
axes[0].set_title("Original (Non-Stationary)")

# First difference
diff1 = ts.diff(1).dropna()
axes[1].plot(diff1)
axes[1].set_title("First Difference (d=1)")

# Second difference
diff2 = ts.diff(1).diff(1).dropna()
axes[2].plot(diff2)
axes[2].set_title("Second Difference (d=2)")

plt.tight_layout()
plt.show()
```

---

## ARIMA(p, d, q) — Putting It Together

| Parameter | Meaning | How to Find |
|-----------|---------|-------------|
| $p$ | AR order | Look at **PACF** plot |
| $d$ | Differencing order | ADF test (usually 0, 1, or 2) |
| $q$ | MA order | Look at **ACF** plot |

### ACF and PACF for Parameter Selection

```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.stattools import adfuller

# Test stationarity
result = adfuller(ts)
print(f"ADF Statistic: {result[0]:.4f}")
print(f"p-value: {result[1]:.4f}")
print("Stationary?" , "Yes" if result[1] < 0.05 else "No — need differencing")

# After differencing
result_diff = adfuller(diff1)
print(f"\nAfter differencing (d=1):")
print(f"ADF Statistic: {result_diff[0]:.4f}")
print(f"p-value: {result_diff[1]:.4f}")
print("Stationary?", "Yes" if result_diff[1] < 0.05 else "No")
```

```python
# ACF and PACF of differenced series
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

plot_acf(diff1, lags=20, ax=axes[0])
axes[0].set_title("ACF (use for q)")

plot_pacf(diff1, lags=20, ax=axes[1])
axes[1].set_title("PACF (use for p)")

plt.tight_layout()
plt.show()
```

**Reading the plots:**
- PACF cuts off after lag $p$ → AR order
- ACF cuts off after lag $q$ → MA order
- If both decay gradually → try ARMA (mixed)

---

## Box-Jenkins Methodology

The systematic approach to building ARIMA models:

### Step 1: Identify — Check Stationarity

```python
from statsmodels.tsa.stattools import adfuller

def check_stationarity(series, name="Series"):
    """Augmented Dickey-Fuller test"""
    result = adfuller(series.dropna())
    print(f"{name}:")
    print(f"  ADF Statistic = {result[0]:.4f}")
    print(f"  p-value       = {result[1]:.4f}")
    if result[1] < 0.05:
        print("  → Stationary (reject null hypothesis)")
    else:
        print("  → Non-stationary (fail to reject)")
    return result[1] < 0.05

# Determine d
is_stationary = check_stationarity(ts, "Original")
if not is_stationary:
    is_stationary = check_stationarity(ts.diff(1).dropna(), "d=1")
if not is_stationary:
    check_stationarity(ts.diff(1).diff(1).dropna(), "d=2")
```

### Step 2: Estimate — Choose p, q

```python
# Use information criteria to compare models
from statsmodels.tsa.arima.model import ARIMA
import warnings
warnings.filterwarnings("ignore")

# Try different (p, q) combinations with d=1
best_aic = np.inf
best_order = None

for p in range(0, 4):
    for q in range(0, 4):
        try:
            model = ARIMA(ts, order=(p, 1, q))
            fit = model.fit()
            if fit.aic < best_aic:
                best_aic = fit.aic
                best_order = (p, 1, q)
        except Exception:
            continue

print(f"Best ARIMA order: {best_order}")
print(f"Best AIC: {best_aic:.2f}")
```

### Step 3: Diagnose — Check Residuals

```python
# Fit the best model
model = ARIMA(ts, order=best_order)
model_fit = model.fit()

# Residual diagnostics
model_fit.plot_diagnostics(figsize=(10, 8))
plt.tight_layout()
plt.show()

# Residuals should be:
# 1. Normally distributed (QQ plot)
# 2. No autocorrelation (correlogram)
# 3. Constant variance (standardized residuals)
```

---

## Fitting ARIMA with statsmodels

```python
from statsmodels.tsa.arima.model import ARIMA

# Split data
train = ts[:"1958"]
test = ts["1959":]

# Fit ARIMA(1, 1, 1)
model = ARIMA(train, order=(1, 1, 1))
model_fit = model.fit()

# Model summary
print(model_fit.summary())
```

```python
# Forecast
forecast = model_fit.forecast(steps=len(test))

# Plot
plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(forecast, label="Forecast", color="red", linestyle="--")
plt.legend()
plt.title("ARIMA Forecast")
plt.show()

# Accuracy
from sklearn.metrics import mean_absolute_error, mean_squared_error
mae = mean_absolute_error(test, forecast)
rmse = np.sqrt(mean_squared_error(test, forecast))
print(f"MAE:  {mae:.2f}")
print(f"RMSE: {rmse:.2f}")
```

---

## Auto ARIMA with pmdarima

Automatically finds the best (p, d, q) using information criteria.

```python
from pmdarima import auto_arima

# Auto ARIMA (non-seasonal)
auto_model = auto_arima(
    train,
    seasonal=False,
    stepwise=True,
    suppress_warnings=True,
    trace=True,  # Show models being tested
    information_criterion="aic",
)

print(f"\nBest model: ARIMA{auto_model.order}")
print(f"AIC: {auto_model.aic():.2f}")
print(auto_model.summary())
```

```python
# Forecast with auto ARIMA
forecast_auto = auto_model.predict(n_periods=len(test))
forecast_auto = pd.Series(forecast_auto, index=test.index)

plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(forecast_auto, label="Auto ARIMA Forecast", color="red", linestyle="--")
plt.legend()
plt.title("Auto ARIMA Forecast")
plt.show()
```

---

## SARIMA — Seasonal ARIMA

SARIMA extends ARIMA to handle **seasonal patterns**.

### SARIMA(p, d, q)(P, D, Q, s)

| Parameter | Meaning |
|-----------|---------|
| (p, d, q) | Non-seasonal ARIMA orders |
| (P, D, Q) | Seasonal AR, differencing, MA orders |
| s | Seasonal period (12=monthly, 7=daily, 4=quarterly) |

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

# SARIMA for airline passengers
model_sarima = SARIMAX(
    train,
    order=(1, 1, 1),           # Non-seasonal (p, d, q)
    seasonal_order=(1, 1, 1, 12),  # Seasonal (P, D, Q, s)
)
sarima_fit = model_sarima.fit(disp=False)

print(sarima_fit.summary())
```

```python
# SARIMA forecast
forecast_sarima = sarima_fit.forecast(steps=len(test))

plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(forecast_sarima, label="SARIMA Forecast", color="red", linestyle="--")
plt.legend()
plt.title("SARIMA(1,1,1)(1,1,1,12) Forecast")
plt.show()

mae_sarima = mean_absolute_error(test, forecast_sarima)
print(f"SARIMA MAE: {mae_sarima:.2f}")
```

### Auto ARIMA with Seasonality

```python
# Auto ARIMA with seasonal component
auto_seasonal = auto_arima(
    train,
    seasonal=True,
    m=12,  # Monthly seasonality
    stepwise=True,
    suppress_warnings=True,
    trace=True,
)

print(f"\nBest SARIMA: {auto_seasonal.order} x {auto_seasonal.seasonal_order}")
print(f"AIC: {auto_seasonal.aic():.2f}")
```

---

## Residual Diagnostics

Good residuals should look like **white noise** (random, no patterns).

```python
# Diagnostic plots
sarima_fit.plot_diagnostics(figsize=(10, 8))
plt.tight_layout()
plt.show()
```

What to check:

| Plot | Good Sign | Bad Sign |
|------|-----------|----------|
| Standardized residuals | Random scatter | Patterns/trends |
| Histogram + KDE | Bell curve (normal) | Skewed/heavy tails |
| Q-Q plot | Points on diagonal | Deviation from line |
| Correlogram (ACF) | All within blue bands | Significant spikes |

```python
# Ljung-Box test for residual autocorrelation
from statsmodels.stats.diagnostic import acorr_ljungbox

lb_test = acorr_ljungbox(sarima_fit.resid, lags=10, return_df=True)
print("Ljung-Box Test (p > 0.05 means no autocorrelation):")
print(lb_test)
```

---

## Complete ARIMA Pipeline

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.stattools import adfuller
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
from statsmodels.tsa.statespace.sarimax import SARIMAX
from pmdarima import auto_arima
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 1. Load data
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv"
df = pd.read_csv(url, parse_dates=["Month"], index_col="Month")
ts = df["Passengers"]

# 2. Train/test split (chronological!)
train = ts[:"1958"]
test = ts["1959":]
print(f"Train: {len(train)} observations")
print(f"Test:  {len(test)} observations")

# 3. Check stationarity
adf_result = adfuller(train)
print(f"\nADF p-value: {adf_result[1]:.4f}")

# 4. Auto ARIMA to find best parameters
best_model = auto_arima(
    train,
    seasonal=True,
    m=12,
    stepwise=True,
    suppress_warnings=True,
)
print(f"\nBest model: SARIMA{best_model.order}x{best_model.seasonal_order}")

# 5. Fit final model
final_model = SARIMAX(
    train,
    order=best_model.order,
    seasonal_order=best_model.seasonal_order,
)
final_fit = final_model.fit(disp=False)

# 6. Forecast
forecast = final_fit.get_forecast(steps=len(test))
forecast_mean = forecast.predicted_mean
conf_int = forecast.conf_int()

# 7. Plot with confidence interval
plt.figure(figsize=(12, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(forecast_mean, label="Forecast", color="red")
plt.fill_between(
    conf_int.index,
    conf_int.iloc[:, 0],
    conf_int.iloc[:, 1],
    alpha=0.2, color="red", label="95% CI"
)
plt.legend()
plt.title("SARIMA Forecast with Confidence Interval")
plt.show()

# 8. Evaluate
mae = mean_absolute_error(test, forecast_mean)
rmse = np.sqrt(mean_squared_error(test, forecast_mean))
mape = np.mean(np.abs((test - forecast_mean) / test)) * 100
print(f"\nForecast Accuracy:")
print(f"  MAE:  {mae:.2f}")
print(f"  RMSE: {rmse:.2f}")
print(f"  MAPE: {mape:.2f}%")
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| AR(p) | Predict from past $p$ values |
| I(d) | Difference $d$ times for stationarity |
| MA(q) | Predict from past $q$ errors |
| ACF | Helps identify $q$ (MA order) |
| PACF | Helps identify $p$ (AR order) |
| ADF test | Check if differencing needed |
| Auto ARIMA | Automatically selects best (p,d,q) |
| SARIMA | Adds seasonal (P,D,Q,s) component |
| AIC/BIC | Lower = better model |

---

## Exercises

1. Fit an ARIMA model to a non-seasonal dataset (e.g., stock prices). What order works best?
2. Compare ARIMA vs SARIMA on monthly data. How much does seasonal modeling improve accuracy?
3. Use `auto_arima` with `trace=True` to see which models are tested. What does stepwise search do?
4. Examine residual diagnostics. What would you do if residuals show autocorrelation?

---
