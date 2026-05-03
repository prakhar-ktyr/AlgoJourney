---
title: Time Series Forecasting
---

# Time Series Forecasting

Beyond ARIMA, several powerful methods exist for time series forecasting — from classical exponential smoothing to modern ML and deep learning approaches.

---

## Exponential Smoothing

Exponential smoothing assigns **exponentially decreasing weights** to older observations.

### Simple Exponential Smoothing (SES)

For series with **no trend and no seasonality**:

$$\hat{y}_{t+1} = \alpha y_t + (1 - \alpha)\hat{y}_t$$

where $\alpha \in [0, 1]$ is the smoothing parameter:
- $\alpha$ close to 1 → more weight on recent data
- $\alpha$ close to 0 → more weight on older data

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.holtwinters import SimpleExpSmoothing

# Load data
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv"
df = pd.read_csv(url, parse_dates=["Month"], index_col="Month")
ts = df["Passengers"]

train = ts[:"1958"]
test = ts["1959":]

# Simple Exponential Smoothing
ses_model = SimpleExpSmoothing(train).fit(smoothing_level=0.6)
ses_forecast = ses_model.forecast(len(test))

plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(ses_forecast, label="SES Forecast", color="red", linestyle="--")
plt.legend()
plt.title("Simple Exponential Smoothing")
plt.show()
```

### Holt's Method (Trend)

Adds a **trend component** — handles linear trends:

$$\hat{y}_{t+h} = l_t + h \cdot b_t$$

where:
- $l_t$ = level (smoothed value)
- $b_t$ = trend (smoothed slope)

```python
from statsmodels.tsa.holtwinters import Holt

# Holt's linear trend method
holt_model = Holt(train).fit(smoothing_level=0.8, smoothing_trend=0.2)
holt_forecast = holt_model.forecast(len(test))

plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(holt_forecast, label="Holt Forecast", color="red", linestyle="--")
plt.legend()
plt.title("Holt's Linear Trend Method")
plt.show()
```

### Holt-Winters (Trend + Seasonal)

The full model — handles both **trend** and **seasonality**:

```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Holt-Winters with additive seasonality
hw_add = ExponentialSmoothing(
    train,
    trend="add",
    seasonal="add",
    seasonal_periods=12,
).fit()

# Holt-Winters with multiplicative seasonality
hw_mul = ExponentialSmoothing(
    train,
    trend="add",
    seasonal="mul",
    seasonal_periods=12,
).fit()

# Forecast
hw_add_forecast = hw_add.forecast(len(test))
hw_mul_forecast = hw_mul.forecast(len(test))

plt.figure(figsize=(10, 5))
plt.plot(train, label="Train")
plt.plot(test, label="Test", color="green")
plt.plot(hw_add_forecast, label="HW Additive", color="red", linestyle="--")
plt.plot(hw_mul_forecast, label="HW Multiplicative", color="purple", linestyle="--")
plt.legend()
plt.title("Holt-Winters Forecasts")
plt.show()
```

### Comparing Exponential Smoothing Methods

| Method | Trend | Seasonal | Use When |
|--------|-------|----------|----------|
| SES | No | No | Flat series |
| Holt | Yes | No | Trending, no seasons |
| Holt-Winters (Add) | Yes | Yes | Constant seasonal amplitude |
| Holt-Winters (Mul) | Yes | Yes | Growing seasonal amplitude |

---

## Prophet (Facebook/Meta)

Prophet is designed for **business forecasting** with:
- Automatic trend changepoint detection
- Built-in holiday effects
- Multiple seasonality (daily, weekly, yearly)
- Robust to missing data and outliers

```python
from prophet import Prophet

# Prophet requires a DataFrame with 'ds' (date) and 'y' (value)
df_prophet = pd.DataFrame({
    "ds": ts.index,
    "y": ts.values,
})

# Train/test split
train_prophet = df_prophet[df_prophet["ds"] < "1959-01-01"]
test_prophet = df_prophet[df_prophet["ds"] >= "1959-01-01"]

# Fit Prophet model
model = Prophet(
    yearly_seasonality=True,
    weekly_seasonality=False,
    daily_seasonality=False,
    changepoint_prior_scale=0.05,  # Flexibility of trend
)
model.fit(train_prophet)
```

```python
# Create future dates for forecasting
future = model.make_future_dataframe(periods=12, freq="M")
forecast = model.predict(future)

# Plot forecast
fig = model.plot(forecast)
plt.title("Prophet Forecast")
plt.show()
```

```python
# Plot components (trend + seasonality breakdown)
fig2 = model.plot_components(forecast)
plt.show()
```

### Prophet with Holidays

```python
# Add custom holidays/events
holidays = pd.DataFrame({
    "holiday": "christmas",
    "ds": pd.to_datetime(["2014-12-25", "2015-12-25", "2016-12-25",
                          "2017-12-25", "2018-12-25", "2019-12-25"]),
    "lower_window": -2,  # 2 days before
    "upper_window": 1,   # 1 day after
})

model_holidays = Prophet(holidays=holidays)
model_holidays.fit(train_prophet)

# Prophet also has built-in country holidays
model_country = Prophet()
model_country.add_country_holidays(country_name="US")
model_country.fit(train_prophet)
```

### Prophet Changepoints

```python
# Visualize trend changepoints
fig = model.plot(forecast)
from prophet.plot import add_changepoints_to_plot
add_changepoints_to_plot(fig.gca(), model, forecast)
plt.title("Prophet with Changepoints")
plt.show()
```

---

## Machine Learning for Time Series

Transform time series into a **supervised learning** problem using feature engineering.

### Creating Lag Features

```python
# Convert time series to supervised learning format
def create_features(df, target_col, lags=12):
    """Create lag features for ML forecasting."""
    result = pd.DataFrame(index=df.index)
    result["y"] = df[target_col]

    # Lag features
    for i in range(1, lags + 1):
        result[f"lag_{i}"] = df[target_col].shift(i)

    # Rolling statistics
    result["rolling_mean_3"] = df[target_col].shift(1).rolling(3).mean()
    result["rolling_mean_6"] = df[target_col].shift(1).rolling(6).mean()
    result["rolling_mean_12"] = df[target_col].shift(1).rolling(12).mean()
    result["rolling_std_6"] = df[target_col].shift(1).rolling(6).std()

    # Date features
    result["month"] = df.index.month
    result["quarter"] = df.index.quarter

    # Drop rows with NaN from shifting
    result = result.dropna()
    return result

# Create features
df_ml = create_features(df, "Passengers", lags=12)
print(df_ml.head())
print(f"\nShape: {df_ml.shape}")
```

### Training ML Models

```python
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Chronological split (NEVER random shuffle for time series!)
split_date = "1958-12-01"
train_ml = df_ml[df_ml.index <= split_date]
test_ml = df_ml[df_ml.index > split_date]

X_train = train_ml.drop("y", axis=1)
y_train = train_ml["y"]
X_test = test_ml.drop("y", axis=1)
y_test = test_ml["y"]

print(f"Train: {len(X_train)} samples")
print(f"Test:  {len(X_test)} samples")
```

```python
# Random Forest
rf = RandomForestRegressor(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
rf_pred = rf.predict(X_test)

# Gradient Boosting
gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
gb.fit(X_train, y_train)
gb_pred = gb.predict(X_test)

# Results
print("Random Forest:")
print(f"  MAE:  {mean_absolute_error(y_test, rf_pred):.2f}")
print(f"  RMSE: {np.sqrt(mean_squared_error(y_test, rf_pred)):.2f}")

print("\nGradient Boosting:")
print(f"  MAE:  {mean_absolute_error(y_test, gb_pred):.2f}")
print(f"  RMSE: {np.sqrt(mean_squared_error(y_test, gb_pred)):.2f}")
```

```python
# Feature importance
importances = pd.Series(rf.feature_importances_, index=X_train.columns)
importances.sort_values(ascending=True).tail(10).plot(kind="barh", figsize=(8, 5))
plt.title("Top 10 Feature Importances (Random Forest)")
plt.xlabel("Importance")
plt.show()
```

### XGBoost for Time Series

```python
from xgboost import XGBRegressor

xgb = XGBRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
)
xgb.fit(X_train, y_train)
xgb_pred = xgb.predict(X_test)

print("XGBoost:")
print(f"  MAE:  {mean_absolute_error(y_test, xgb_pred):.2f}")
print(f"  RMSE: {np.sqrt(mean_squared_error(y_test, xgb_pred)):.2f}")
```

---

## Deep Learning (Brief Overview)

For complex patterns, neural networks can capture non-linear relationships.

### LSTM (Long Short-Term Memory)

```python
# Conceptual LSTM structure (requires TensorFlow/PyTorch)
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense

# model = Sequential([
#     LSTM(50, activation='relu', input_shape=(n_steps, n_features)),
#     Dense(1)
# ])
# model.compile(optimizer='adam', loss='mse')
# model.fit(X_train_3d, y_train, epochs=50, batch_size=32)

print("Deep Learning Approaches:")
print("  - LSTM: Captures long-term dependencies")
print("  - GRU: Simpler alternative to LSTM")
print("  - Transformer: Attention-based, state-of-the-art")
print("  - N-BEATS: Neural basis expansion")
print("  - TFT: Temporal Fusion Transformer")
```

---

## Forecast Evaluation

### Train/Test Split Rules

**CRITICAL:** Never randomly shuffle time series data!

```python
# CORRECT: Chronological split
train = ts[:"1958"]
test = ts["1959":]

# WRONG: Random split (data leakage!)
# from sklearn.model_selection import train_test_split
# train, test = train_test_split(ts, test_size=0.2)  # DON'T DO THIS!
```

### Walk-Forward Validation

More realistic: retrain model as new data arrives.

```python
def walk_forward_validation(ts, model_order, n_test):
    """Walk-forward validation for ARIMA."""
    from statsmodels.tsa.arima.model import ARIMA

    train_data = ts[:-n_test].tolist()
    predictions = []

    for i in range(n_test):
        # Fit model on all available data
        model = ARIMA(train_data, order=model_order)
        fit = model.fit()

        # Forecast one step
        pred = fit.forecast(steps=1)[0]
        predictions.append(pred)

        # Add actual observation to training data
        train_data.append(ts.iloc[-(n_test - i)])

    return predictions

# Walk-forward with ARIMA(1,1,1)
wf_preds = walk_forward_validation(ts, (1, 1, 1), len(test))
wf_preds = pd.Series(wf_preds, index=test.index)

print(f"Walk-Forward MAE: {mean_absolute_error(test, wf_preds):.2f}")
```

### Evaluation Metrics

| Metric | Formula | Notes |
|--------|---------|-------|
| MAE | $\frac{1}{n}\sum\|y_i - \hat{y}_i\|$ | Easy to interpret |
| RMSE | $\sqrt{\frac{1}{n}\sum(y_i - \hat{y}_i)^2}$ | Penalizes large errors |
| MAPE | $\frac{100}{n}\sum\|\frac{y_i - \hat{y}_i}{y_i}\|$ | Percentage error |

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error

def evaluate_forecast(actual, predicted, name="Model"):
    """Calculate forecast accuracy metrics."""
    mae = mean_absolute_error(actual, predicted)
    rmse = np.sqrt(mean_squared_error(actual, predicted))
    mape = np.mean(np.abs((actual - predicted) / actual)) * 100
    print(f"{name}:")
    print(f"  MAE:  {mae:.2f}")
    print(f"  RMSE: {rmse:.2f}")
    print(f"  MAPE: {mape:.2f}%")
    return {"MAE": mae, "RMSE": rmse, "MAPE": mape}

# Naive forecast baseline (predict last value)
naive_forecast = pd.Series(
    [train.iloc[-1]] * len(test), index=test.index
)

evaluate_forecast(test, naive_forecast, "Naive (Baseline)")
evaluate_forecast(test, hw_mul_forecast, "Holt-Winters")
```

### Forecast Confidence Intervals

```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Holt-Winters with prediction intervals
hw = ExponentialSmoothing(
    train, trend="add", seasonal="mul", seasonal_periods=12
).fit()

# Simulate to get confidence intervals
simulations = hw.simulate(len(test), repetitions=1000, random_errors="bootstrap")

forecast_mean = simulations.mean(axis=1)
forecast_lower = simulations.quantile(0.025, axis=1)
forecast_upper = simulations.quantile(0.975, axis=1)

plt.figure(figsize=(10, 5))
plt.plot(train[-24:], label="Train (last 2 years)")
plt.plot(test, label="Actual", color="green")
plt.plot(forecast_mean, label="Forecast", color="red")
plt.fill_between(
    test.index, forecast_lower, forecast_upper,
    alpha=0.2, color="red", label="95% CI"
)
plt.legend()
plt.title("Forecast with 95% Confidence Interval")
plt.show()
```

---

## Method Comparison

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load data
url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/airline-passengers.csv"
df = pd.read_csv(url, parse_dates=["Month"], index_col="Month")
ts = df["Passengers"]

train = ts[:"1958"]
test = ts["1959":]

# --- Method 1: Holt-Winters ---
hw = ExponentialSmoothing(
    train, trend="add", seasonal="mul", seasonal_periods=12
).fit()
hw_pred = hw.forecast(len(test))

# --- Method 2: ML (Gradient Boosting) ---
df_feat = create_features(df, "Passengers", lags=12)
split = "1958-12-01"
X_tr = df_feat[df_feat.index <= split].drop("y", axis=1)
y_tr = df_feat[df_feat.index <= split]["y"]
X_te = df_feat[df_feat.index > split].drop("y", axis=1)
y_te = df_feat[df_feat.index > split]["y"]

gb = GradientBoostingRegressor(n_estimators=100, random_state=42)
gb.fit(X_tr, y_tr)
gb_pred = pd.Series(gb.predict(X_te), index=y_te.index)

# --- Compare ---
results = pd.DataFrame({
    "Method": ["Naive", "Holt-Winters", "Gradient Boosting"],
    "MAE": [
        mean_absolute_error(test, [train.iloc[-1]] * len(test)),
        mean_absolute_error(test, hw_pred),
        mean_absolute_error(y_te, gb_pred),
    ],
    "RMSE": [
        np.sqrt(mean_squared_error(test, [train.iloc[-1]] * len(test))),
        np.sqrt(mean_squared_error(test, hw_pred)),
        np.sqrt(mean_squared_error(y_te, gb_pred)),
    ],
})
print(results.to_string(index=False))

# Plot comparison
plt.figure(figsize=(12, 5))
plt.plot(train[-24:], label="Train", color="blue")
plt.plot(test, label="Actual", color="green", linewidth=2)
plt.plot(hw_pred, label="Holt-Winters", linestyle="--")
plt.plot(gb_pred, label="Gradient Boosting", linestyle="--")
plt.legend()
plt.title("Forecasting Method Comparison")
plt.show()
```

---

## Summary

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| Exponential Smoothing | Simple patterns | Fast, interpretable | Limited complexity |
| Prophet | Business data | Handles holidays, robust | Slower, less customizable |
| ML (RF, XGBoost) | Complex features | Flexible, powerful | Needs feature engineering |
| Deep Learning | Large datasets | Captures complex patterns | Needs lots of data |

---

## Exercises

1. Compare SES, Holt, and Holt-Winters on the airline dataset. Which performs best and why?
2. Build a Prophet model with custom holidays. Does it improve accuracy?
3. Create an ML pipeline with lag, rolling, and date features. Which features matter most?
4. Implement walk-forward validation for any model. How does it compare to a simple train/test split?

---
