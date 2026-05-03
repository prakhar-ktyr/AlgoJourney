---
title: Linear Regression
---

# Linear Regression

Linear regression is one of the most fundamental algorithms in machine learning and statistics. It predicts a **continuous numerical value** based on input features.

---

## What Is Regression?

**Regression** is a supervised learning task where the goal is to predict a continuous output variable based on one or more input features.

Examples:
- Predict house prices based on square footage
- Estimate salary based on years of experience
- Forecast temperature based on historical data

> Unlike classification (which predicts categories), regression predicts **numbers**.

---

## Simple Linear Regression

Simple linear regression uses **one feature** to predict the target:

$$\hat{y} = \beta_0 + \beta_1 x$$

Where:
- $\hat{y}$ = predicted value
- $\beta_0$ = intercept (y-intercept, bias term)
- $\beta_1$ = slope (coefficient, weight)
- $x$ = input feature

This is the equation of a straight line — often written as $y = mx + b$.

### Goal: Find the Best-Fit Line

The "best" line is the one that minimizes the total error between predicted values and actual values.

```python
import numpy as np
import matplotlib.pyplot as plt

# Simple example: years of experience vs salary
X = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).reshape(-1, 1)
y = np.array([35, 40, 45, 50, 55, 62, 67, 72, 78, 85])

# Plot the data
plt.scatter(X, y, color="blue", label="Actual")
plt.xlabel("Years of Experience")
plt.ylabel("Salary (thousands)")
plt.title("Experience vs Salary")
plt.legend()
plt.show()
```

---

## Multiple Linear Regression

When we have **multiple features**, we extend to multiple linear regression:

$$\hat{y} = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n$$

In matrix form:

$$\hat{y} = X\beta$$

Where:
- $X$ is the feature matrix (with a column of 1s for the intercept)
- $\beta$ is the vector of coefficients

### Example

Predicting house price using:
- $x_1$ = square footage
- $x_2$ = number of bedrooms
- $x_3$ = age of house

$$\text{price} = \beta_0 + \beta_1 \cdot \text{sqft} + \beta_2 \cdot \text{bedrooms} + \beta_3 \cdot \text{age}$$

---

## Ordinary Least Squares (OLS)

OLS finds the coefficients that **minimize the Mean Squared Error**:

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

This measures the average squared distance between actual and predicted values.

### Normal Equation

The closed-form solution for OLS:

$$\beta = (X^T X)^{-1} X^T y$$

This directly computes the optimal coefficients without iteration.

```python
import numpy as np

# Manual OLS using the normal equation
X = np.array([[1, 1], [1, 2], [1, 3], [1, 4], [1, 5]])  # column of 1s + feature
y = np.array([2, 4, 5, 4, 5])

# Normal equation
beta = np.linalg.inv(X.T @ X) @ X.T @ y
print(f"Intercept: {beta[0]:.4f}")
print(f"Slope: {beta[1]:.4f}")
```

> **Note:** The normal equation is simple but can be slow for very large datasets. Gradient descent is preferred for big data.

---

## Assumptions of Linear Regression

For OLS to give the best results, these assumptions should hold:

| Assumption | Description |
|------------|-------------|
| **Linearity** | Relationship between X and y is linear |
| **Independence** | Observations are independent of each other |
| **Homoscedasticity** | Constant variance of residuals |
| **Normality** | Residuals are normally distributed |
| **No multicollinearity** | Features are not highly correlated with each other |

> Violating these assumptions doesn't break the model, but predictions may be less reliable.

---

## Linear Regression with Scikit-Learn

```python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
import numpy as np

# Sample data
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
y = np.array([35, 40, 45, 50, 55, 62, 67, 72, 78, 85])

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Model parameters
print(f"Coefficient (slope): {model.coef_[0]:.4f}")
print(f"Intercept: {model.intercept_:.4f}")
print(f"Equation: y = {model.coef_[0]:.2f}x + {model.intercept_:.2f}")
```

### Key Attributes

| Attribute | Description |
|-----------|-------------|
| `model.coef_` | Coefficients (slopes) for each feature |
| `model.intercept_` | Intercept (bias) term |
| `model.score(X, y)` | $R^2$ score on given data |

---

## Train/Test Split

Always evaluate on **unseen data** to detect overfitting:

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train on training set
model.fit(X_train, y_train)

# Evaluate on test set
y_pred = model.predict(X_test)
```

- `test_size=0.2` → 80% training, 20% testing
- `random_state=42` → reproducible splits

---

## Evaluation Metrics

### Mean Squared Error (MSE)

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

### Root Mean Squared Error (RMSE)

$$\text{RMSE} = \sqrt{\text{MSE}}$$

Same units as target variable — easier to interpret.

### Mean Absolute Error (MAE)

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

Less sensitive to outliers than MSE.

### R-Squared ($R^2$)

$$R^2 = 1 - \frac{SS_{res}}{SS_{tot}} = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}$$

- $R^2 = 1$ → perfect prediction
- $R^2 = 0$ → model is as good as predicting the mean
- $R^2 < 0$ → model is worse than predicting the mean

```python
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import numpy as np

# Calculate metrics
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MSE:  {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE:  {mae:.4f}")
print(f"R²:   {r2:.4f}")
```

---

## Polynomial Regression

When the relationship is **non-linear**, we can add polynomial features:

$$\hat{y} = \beta_0 + \beta_1 x + \beta_2 x^2 + \beta_3 x^3$$

This is still linear regression — it's linear in the **coefficients**!

```python
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline
import numpy as np

# Non-linear data
X = np.array([1, 2, 3, 4, 5, 6, 7, 8]).reshape(-1, 1)
y = np.array([1, 4, 9, 16, 25, 36, 49, 64])  # y = x^2

# Polynomial regression (degree 2)
poly_model = make_pipeline(
    PolynomialFeatures(degree=2),
    LinearRegression()
)
poly_model.fit(X, y)

# Predict
X_new = np.array([[9], [10]])
print(f"Predictions: {poly_model.predict(X_new)}")
```

> **Warning:** High-degree polynomials can overfit! Use cross-validation to find the right degree.

---

## Regularization

Regularization adds a penalty to prevent overfitting by keeping coefficients small.

### Ridge Regression (L2)

Adds penalty proportional to the **square** of coefficients:

$$L_{Ridge} = \text{MSE} + \alpha \sum_{j=1}^{n} \beta_j^2$$

- Shrinks coefficients toward zero but never exactly zero
- Good when many features are relevant

```python
from sklearn.linear_model import Ridge

ridge = Ridge(alpha=1.0)
ridge.fit(X_train, y_train)
print(f"Ridge R²: {ridge.score(X_test, y_test):.4f}")
```

### Lasso Regression (L1)

Adds penalty proportional to the **absolute value** of coefficients:

$$L_{Lasso} = \text{MSE} + \alpha \sum_{j=1}^{n} |\beta_j|$$

- Can shrink coefficients to **exactly zero** → feature selection!
- Good when only a few features are truly important

```python
from sklearn.linear_model import Lasso

lasso = Lasso(alpha=0.1)
lasso.fit(X_train, y_train)
print(f"Lasso R²: {lasso.score(X_test, y_test):.4f}")
print(f"Features used: {np.sum(lasso.coef_ != 0)}")
```

### ElasticNet

Combines both L1 and L2 penalties:

$$L_{ElasticNet} = \text{MSE} + \alpha_1 \sum|\beta_j| + \alpha_2 \sum\beta_j^2$$

```python
from sklearn.linear_model import ElasticNet

elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)
elastic.fit(X_train, y_train)
```

| Method | Penalty | Feature Selection | Best For |
|--------|---------|-------------------|----------|
| Ridge | L2 ($\beta^2$) | No | Many small effects |
| Lasso | L1 ($|\beta|$) | Yes | Few important features |
| ElasticNet | L1 + L2 | Yes | Groups of correlated features |

---

## Complete Pipeline Example

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score

# Load data (Boston Housing style)
from sklearn.datasets import fetch_california_housing
data = fetch_california_housing()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

print(f"Dataset shape: {X.shape}")
print(f"Features: {list(X.columns)}")
print(f"Target: Median house value (in $100k)")

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features (important for regularization)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train models
models = {
    "Linear Regression": LinearRegression(),
    "Ridge (alpha=1)": Ridge(alpha=1.0),
    "Lasso (alpha=0.1)": Lasso(alpha=0.1),
}

results = []
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    results.append({"Model": name, "MSE": mse, "RMSE": np.sqrt(mse), "R²": r2})

# Compare results
results_df = pd.DataFrame(results)
print("\nModel Comparison:")
print(results_df.to_string(index=False))

# Visualize predictions vs actual
model = models["Linear Regression"]
y_pred = model.predict(X_test_scaled)

plt.figure(figsize=(8, 6))
plt.scatter(y_test, y_pred, alpha=0.5, s=10)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], "r--")
plt.xlabel("Actual Values")
plt.ylabel("Predicted Values")
plt.title("Linear Regression: Actual vs Predicted")
plt.tight_layout()
plt.show()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Simple LR | One feature: $\hat{y} = \beta_0 + \beta_1 x$ |
| Multiple LR | Many features: $\hat{y} = X\beta$ |
| OLS | Minimize MSE, Normal equation |
| $R^2$ | Measures how well model explains variance |
| Polynomial | Non-linear by adding $x^2, x^3, ...$ |
| Ridge | L2 penalty — shrinks coefficients |
| Lasso | L1 penalty — removes features |

Linear regression is the **starting point** for most prediction tasks. Always try it first as a baseline before moving to complex models!
