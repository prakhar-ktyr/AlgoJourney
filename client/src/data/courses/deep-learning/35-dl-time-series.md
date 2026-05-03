---
title: Time Series Forecasting
---

# Time Series Forecasting with Deep Learning

Time series data is everywhere — stock prices, weather, server metrics, sensor readings. In this lesson, you'll learn how to use LSTM and GRU networks to predict future values from historical patterns.

---

## What Is Time Series Data?

A time series is a sequence of data points ordered by time:

```
Time:    t₁    t₂    t₃    t₄    t₅    t₆    ...
Value:  23.1  24.5  22.8  25.1  26.3  24.9   ...
```

**Examples:**

| Domain | Data | Frequency |
|--------|------|-----------|
| Finance | Stock prices | Minutes/Daily |
| Weather | Temperature | Hourly |
| IoT | Sensor readings | Seconds |
| Web | Traffic counts | Minutes |
| Health | Heart rate | Continuous |
| Energy | Power consumption | Hourly |

**The goal:** Given past values $[x_1, x_2, ..., x_t]$, predict future values $[x_{t+1}, ..., x_{t+k}]$.

---

## Time Series Characteristics

Before modeling, understand your data's properties:

### Trend

A long-term increase or decrease:
```
Upward trend:     ╱ ╱ ╱ ╱
Downward trend:   ╲ ╲ ╲ ╲
No trend:         ─ ─ ─ ─
```

### Seasonality

Regular repeating patterns:
```
Daily pattern:    ∿∿∿∿∿  (e.g., traffic peaks at rush hour)
Yearly pattern:   ∿           (e.g., ice cream sales in summer)
```

### Stationarity

A stationary series has constant mean and variance over time. Most ML models assume stationarity. Non-stationary data should be differenced:

$$x'_t = x_t - x_{t-1}$$

---

## Windowing: Creating Input Sequences

Neural networks need fixed-size inputs. We convert a time series into supervised learning examples using a **sliding window**:

```
Time series: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Window size: 3, Prediction horizon: 1

Window 1: [1, 2, 3] → predict [4]
Window 2: [2, 3, 4] → predict [5]
Window 3: [3, 4, 5] → predict [6]
Window 4: [4, 5, 6] → predict [7]
...
```

```python
import torch
import numpy as np

def create_windows(data, window_size, horizon=1):
    """
    Convert time series to windowed input-output pairs.

    Args:
        data: 1D numpy array of time series values
        window_size: number of past steps to use as input
        horizon: number of future steps to predict

    Returns:
        X: (num_samples, window_size, 1) tensor
        y: (num_samples, horizon) tensor
    """
    X, y = [], []
    for i in range(len(data) - window_size - horizon + 1):
        X.append(data[i:i + window_size])
        y.append(data[i + window_size:i + window_size + horizon])

    X = torch.tensor(np.array(X), dtype=torch.float32).unsqueeze(-1)
    y = torch.tensor(np.array(y), dtype=torch.float32)
    return X, y

# Example
data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=np.float32)
X, y = create_windows(data, window_size=3, horizon=1)
print(f"X shape: {X.shape}")  # (7, 3, 1)
print(f"y shape: {y.shape}")  # (7, 1)
print(f"First sample: {X[0].flatten().tolist()} → {y[0].tolist()}")
```

### Choosing Window Size

| Consideration | Guidance |
|---------------|----------|
| Seasonality | Window should cover at least one full cycle |
| Short-term patterns | Smaller windows (5–20) |
| Long-term dependencies | Larger windows (50–200) |
| Memory constraints | Larger windows = more computation |
| Domain knowledge | How far back does relevant info go? |

---

## Feature Engineering for Time Series

Raw values alone may not be enough. Add informative features:

### Lag Features

Previous values as explicit features:

```python
def add_lag_features(df, column, lags):
    """Add lagged values as new columns."""
    for lag in lags:
        df[f'{column}_lag_{lag}'] = df[column].shift(lag)
    return df
```

### Rolling Statistics

Moving averages smooth noise and reveal trends:

```python
def add_rolling_features(data, window_sizes=[7, 14, 30]):
    """Add backward-looking rolling mean as features."""
    features = [data]
    for w in window_sizes:
        rolling_mean = np.convolve(data, np.ones(w)/w, mode='valid')
        pad = np.full(w - 1, np.nan)
        features.append(np.concatenate([pad, rolling_mean]))
    return np.column_stack(features)
```

### Time-Based Features

For data with known periodicity, encode cyclical features (hour, day of week, month) normalized to [0, 1].

---

## Data Preprocessing

### Normalization

Always normalize time series data before feeding to neural networks:

```python
# Standard scaling (z-score normalization)
mean = train_data.mean()
std = train_data.std()

train_scaled = (train_data - mean) / std
test_scaled = (test_data - mean) / std

# Inverse transform predictions back to original scale
predictions_original = predictions * std + mean
```

> **Critical:** Fit the scaler on training data ONLY. Apply the same transformation to test data. Never fit on test data — that's data leakage!

### Train/Test Split

For time series, **never shuffle**. Always split chronologically:

```python
def temporal_split(X, y, train_ratio=0.8):
    """Split time series data chronologically (no shuffling!)."""
    split_idx = int(len(X) * train_ratio)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    return X_train, X_test, y_train, y_test
```

---

## LSTM/GRU for Time Series

### Model Architecture

```python
import torch
import torch.nn as nn

class TimeSeriesModel(nn.Module):
    """LSTM/GRU model for time series forecasting."""

    def __init__(self, input_size, hidden_size, num_layers, output_size,
                 cell_type='lstm', dropout=0.2):
        super().__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.cell_type = cell_type

        # Choose RNN cell type
        if cell_type == 'lstm':
            self.rnn = nn.LSTM(input_size, hidden_size, num_layers,
                              batch_first=True,
                              dropout=dropout if num_layers > 1 else 0)
        elif cell_type == 'gru':
            self.rnn = nn.GRU(input_size, hidden_size, num_layers,
                             batch_first=True,
                             dropout=dropout if num_layers > 1 else 0)

        # Output layers
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, output_size)
        )

    def forward(self, x):
        # x: (batch, seq_len, input_size)
        rnn_out, _ = self.rnn(x)

        # Use last time step output
        last_out = rnn_out[:, -1, :]  # (batch, hidden_size)
        prediction = self.fc(last_out)  # (batch, output_size)
        return prediction
```

---

## Multi-Step Forecasting

Predicting multiple steps into the future. Two main strategies:

### Strategy 1: Recursive (Iterative)

Predict one step, feed it back, predict next step:

```python
def recursive_forecast(model, initial_window, steps, scaler):
    """Predict multiple steps by feeding predictions back."""
    model.eval()
    predictions = []
    current_window = initial_window.clone()  # (1, window_size, features)

    with torch.no_grad():
        for _ in range(steps):
            pred = model(current_window)  # (1, 1)
            predictions.append(pred.item())

            # Shift window: drop first, append prediction
            new_val = pred.unsqueeze(-1)  # (1, 1, 1)
            current_window = torch.cat([current_window[:, 1:, :], new_val], dim=1)

    return scaler.inverse_transform(np.array(predictions))
```

**Pros:** Only needs single-step model
**Cons:** Errors accumulate over steps

### Strategy 2: Direct (Multi-Output)

Train the model to predict all future steps at once:

```python
# Model outputs multiple steps directly
model = TimeSeriesModel(
    input_size=1,
    hidden_size=64,
    num_layers=2,
    output_size=10,  # Predict 10 steps ahead
    cell_type='lstm'
)

# Training target: next 10 values
X, y = create_windows(data, window_size=30, horizon=10)
```

**Pros:** No error accumulation
**Cons:** Needs more parameters, may be less accurate for near-term predictions

### Comparison

| Strategy | Error Accumulation | Flexibility | Best For |
|----------|-------------------|-------------|----------|
| Recursive | Yes (compounds) | Any horizon at inference | Short horizons (1–5 steps) |
| Direct | No | Fixed horizon | Longer horizons (5–50 steps) |

---

## Evaluation Metrics

### Mean Absolute Error (MAE)

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

Easy to interpret: "on average, predictions are off by X units."

### Root Mean Squared Error (RMSE)

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}$$

Penalizes large errors more heavily than MAE.

### Mean Absolute Percentage Error (MAPE)

$$\text{MAPE} = \frac{100\%}{n}\sum_{i=1}^{n}\left|\frac{y_i - \hat{y}_i}{y_i}\right|$$

Scale-independent percentage error. Undefined when $y_i = 0$.

```python
def compute_metrics(y_true, y_pred):
    """Calculate time series forecasting metrics."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))

    # MAPE (avoid division by zero)
    mask = y_true != 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

    return {'MAE': mae, 'RMSE': rmse, 'MAPE': mape}
```

---

## Common Pitfalls

### 1. Data Leakage

**Problem:** Using future information during training.

```python
# WRONG: fitting scaler on all data (includes test)
scaler.fit(all_data)

# RIGHT: fit only on training data
scaler.fit(train_data)
test_scaled = scaler.transform(test_data)
```

### 2. Shuffling Time Series

**Problem:** Random shuffling breaks temporal order.

```python
# WRONG: shuffle for evaluation data
DataLoader(test_dataset, shuffle=True)

# RIGHT: maintain temporal order for validation/test
DataLoader(test_dataset, shuffle=False)
# Shuffling training windows is OK (they're independent samples)
DataLoader(train_dataset, shuffle=True)
```

### 3. Non-Stationarity

**Problem:** Model trained on one regime fails when statistics change.

**Solution:** Difference the data: $x'_t = x_t - x_{t-1}$

### 4. Look-Ahead Bias in Features

**Problem:** Rolling features computed using future values.

```python
# WRONG: centered window uses future
df['rolling_mean'] = df['value'].rolling(7, center=True).mean()

# RIGHT: backward-looking only
df['rolling_mean'] = df['value'].rolling(7).mean()
```

### 5. Overfitting to Training Period

**Problem:** Model memorizes training patterns, fails on new regimes.

**Solutions:**
- Use dropout
- Early stopping on validation loss
- Cross-validate with time series splits (expanding window)

---

## Code Example: LSTM Time Series Forecaster

Putting it all together — generate synthetic data, preprocess, train, and evaluate:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# ============================================================
# Generate Synthetic Time Series
# ============================================================

def generate_synthetic_series(n_points=2000):
    """Sine wave with trend + noise."""
    t = np.arange(n_points, dtype=np.float32)
    trend = 0.001 * t
    seasonality = np.sin(2 * np.pi * t / 50)
    noise = 0.2 * np.random.randn(n_points).astype(np.float32)
    return trend + seasonality + noise

raw_data = generate_synthetic_series(2000)

# ============================================================
# Preprocess: normalize + window
# ============================================================

train_size = int(0.8 * len(raw_data))
train_data, test_data = raw_data[:train_size], raw_data[train_size:]

# Fit scaler on training data ONLY
mean, std = train_data.mean(), train_data.std()
train_scaled = (train_data - mean) / std
test_scaled = (test_data - mean) / std

WINDOW_SIZE = 50
HORIZON = 1

def create_windows(data, window_size, horizon):
    X, y = [], []
    for i in range(len(data) - window_size - horizon + 1):
        X.append(data[i:i + window_size])
        y.append(data[i + window_size:i + window_size + horizon])
    return (torch.tensor(np.array(X)).unsqueeze(-1),
            torch.tensor(np.array(y)))

X_train, y_train = create_windows(train_scaled, WINDOW_SIZE, HORIZON)
X_test, y_test = create_windows(test_scaled, WINDOW_SIZE, HORIZON)

# ============================================================
# Model (reusing TimeSeriesModel from above)
# ============================================================

model = TimeSeriesModel(input_size=1, hidden_size=64, num_layers=2,
                        output_size=HORIZON, cell_type='lstm')
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)

train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=64,
                         shuffle=True)

# ============================================================
# Training Loop
# ============================================================

for epoch in range(30):
    model.train()
    total_loss = 0
    for batch_X, batch_y in train_loader:
        preds = model(batch_X)
        loss = criterion(preds, batch_y)
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        total_loss += loss.item()

    avg_loss = total_loss / len(train_loader)
    scheduler.step(avg_loss)
    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1}/30] Loss: {avg_loss:.6f}")

# ============================================================
# Evaluate
# ============================================================

model.eval()
with torch.no_grad():
    predictions = model(X_test).numpy().flatten()

# Inverse transform to original scale
predictions = predictions * std + mean
actuals = y_test.numpy().flatten() * std + mean

mae = np.mean(np.abs(actuals - predictions))
rmse = np.sqrt(np.mean((actuals - predictions) ** 2))
print(f"MAE: {mae:.4f}, RMSE: {rmse:.4f}")
```

---

## Tips for Better Forecasts

| Tip | Why |
|-----|-----|
| Normalize your data | Neural networks train better on standardized inputs |
| Use validation data for early stopping | Prevents overfitting |
| Try both LSTM and GRU | Performance varies by dataset |
| Add domain features | Time of day, day of week, holidays |
| Ensemble multiple models | Average predictions for robustness |
| Monitor residuals | Non-random residuals mean missing patterns |
| Start simple | Linear baseline first, then add complexity |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Windowing | Convert time series to supervised learning pairs |
| Normalization | Fit on train only, apply to test |
| LSTM/GRU | Natural fit for sequential time data |
| Multi-step | Recursive (error compounds) vs Direct (fixed horizon) |
| Metrics | MAE (interpretable), RMSE (penalizes outliers), MAPE (percentage) |
| Pitfalls | Data leakage, shuffling, non-stationarity, look-ahead bias |
| Train/test split | Always chronological — never random |

---

## What's Next?

In the next lesson, you'll learn about **Attention Mechanisms** — the breakthrough that led to Transformer models and revolutionized both NLP and time series forecasting.
