---
title: K-Nearest Neighbors
---

# K-Nearest Neighbors (KNN)

KNN is one of the simplest and most intuitive machine learning algorithms. It classifies or predicts based on the closest training examples in the feature space.

> **"You are the average of your k nearest neighbors."**

---

## What Is KNN?

KNN is a **lazy learning** algorithm — it doesn't build a model during training. Instead, it stores the entire training dataset and makes predictions by finding the most similar examples.

**Key idea:** Similar data points are close to each other in the feature space.

| Task | How KNN Decides |
|------|----------------|
| Classification | Majority vote among k nearest neighbors |
| Regression | Average (or weighted average) of k nearest neighbors |

---

## How the Algorithm Works

```
1. Choose k (number of neighbors)
2. Compute distance from new point to ALL training points
3. Sort distances and find k closest neighbors
4. Classification → majority vote
   Regression → average of neighbor values
```

### Visual Example

Imagine classifying a new fruit as apple or orange:

```
New point: (weight=150g, diameter=7cm)

Neighbor 1 (distance=0.5): Apple
Neighbor 2 (distance=0.8): Apple
Neighbor 3 (distance=1.2): Orange

With k=3: 2 Apples vs 1 Orange → Predict Apple!
```

---

## Distance Metrics

The **distance metric** determines how "closeness" is measured between data points.

### Euclidean Distance (Most Common)

$$d(x, y) = \sqrt{\sum_{i=1}^{n}(x_i - y_i)^2}$$

```python
import numpy as np

# Euclidean distance between two points
point_a = np.array([1, 2, 3])
point_b = np.array([4, 5, 6])

distance = np.sqrt(np.sum((point_a - point_b) ** 2))
print(f"Euclidean distance: {distance:.4f}")
# Output: Euclidean distance: 5.1962
```

### Manhattan Distance

$$d(x, y) = \sum_{i=1}^{n}|x_i - y_i|$$

Think of it as walking along city blocks — you can only move horizontally or vertically.

```python
# Manhattan distance
manhattan = np.sum(np.abs(point_a - point_b))
print(f"Manhattan distance: {manhattan}")
# Output: Manhattan distance: 9
```

### Minkowski Distance (Generalization)

$$d(x, y) = \left(\sum_{i=1}^{n}|x_i - y_i|^p\right)^{1/p}$$

- $p = 1$: Manhattan distance
- $p = 2$: Euclidean distance

```python
from scipy.spatial.distance import minkowski

# Minkowski with p=3
dist_p3 = minkowski(point_a, point_b, p=3)
print(f"Minkowski (p=3): {dist_p3:.4f}")
```

---

## Choosing k

The value of **k** dramatically affects model behavior:

| Small k (e.g., 1-3) | Large k (e.g., 20-50) |
|---------------------|----------------------|
| Complex, jagged decision boundary | Smooth decision boundary |
| Sensitive to noise/outliers | More robust to noise |
| Risk of **overfitting** | Risk of **underfitting** |
| Captures local patterns | Captures global patterns |

### Guidelines for Choosing k

1. **Start with** $k = \sqrt{n}$ where n is the number of training samples
2. **Use odd numbers** to avoid ties in binary classification
3. **Never use** $k = 1$ in production (too sensitive to noise)
4. **Use cross-validation** to find the optimal k

### Elbow Method for k Selection

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score
import matplotlib.pyplot as plt

# Test different values of k
k_range = range(1, 31)
scores = []

for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    cv_scores = cross_val_score(knn, X_train_scaled, y_train, cv=5)
    scores.append(cv_scores.mean())

# Plot the elbow curve
plt.figure(figsize=(10, 6))
plt.plot(k_range, scores, marker='o')
plt.xlabel('k (Number of Neighbors)')
plt.ylabel('Cross-Validation Accuracy')
plt.title('Elbow Method for Optimal k')
plt.grid(True)
plt.show()

# Find best k
best_k = k_range[scores.index(max(scores))]
print(f"Best k: {best_k}, Accuracy: {max(scores):.4f}")
```

---

## Feature Scaling Is Critical

KNN relies on distance calculations. **Features with larger ranges dominate the distance.**

### Example: Why Scaling Matters

```python
# Without scaling:
# Age: 25-65 (range = 40)
# Income: 20000-200000 (range = 180000)

# Distance is dominated by income!
# A $1000 income difference >> 10 year age difference
```

### Always Scale Before KNN

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler

# StandardScaler: mean=0, std=1 (most common)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Use same scaler!

# MinMaxScaler: scales to [0, 1]
minmax = MinMaxScaler()
X_train_mm = minmax.fit_transform(X_train)
X_test_mm = minmax.transform(X_test)
```

> **Warning:** Always fit the scaler on training data only, then transform both train and test. Never fit on test data — that's data leakage!

---

## KNN with Scikit-Learn

### Classification

```python
from sklearn.neighbors import KNeighborsClassifier

# Create classifier
knn_clf = KNeighborsClassifier(
    n_neighbors=5,        # Number of neighbors
    weights='uniform',    # 'uniform' or 'distance'
    metric='euclidean',   # Distance metric
    algorithm='auto'      # 'ball_tree', 'kd_tree', 'brute', 'auto'
)

# Train and predict
knn_clf.fit(X_train_scaled, y_train)
y_pred = knn_clf.predict(X_test_scaled)
```

### Regression

```python
from sklearn.neighbors import KNeighborsRegressor

# Create regressor
knn_reg = KNeighborsRegressor(
    n_neighbors=5,
    weights='distance'  # Closer neighbors have more influence
)

knn_reg.fit(X_train_scaled, y_train)
y_pred = knn_reg.predict(X_test_scaled)
```

### Weight Options

| Weight | Description |
|--------|-------------|
| `'uniform'` | All k neighbors contribute equally |
| `'distance'` | Closer neighbors have more weight (1/distance) |

```python
# Distance-weighted KNN
knn_weighted = KNeighborsClassifier(n_neighbors=7, weights='distance')
knn_weighted.fit(X_train_scaled, y_train)
print(f"Weighted accuracy: {knn_weighted.score(X_test_scaled, y_test):.4f}")
```

---

## Complete Example: Iris Classification

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

# Load data
iris = load_iris()
X = iris.data
y = iris.target

print(f"Dataset shape: {X.shape}")
print(f"Classes: {iris.target_names}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features (CRITICAL for KNN!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Find optimal k using cross-validation
k_range = range(1, 26)
cv_scores = []

for k in k_range:
    knn = KNeighborsClassifier(n_neighbors=k)
    scores = cross_val_score(knn, X_train_scaled, y_train, cv=5)
    cv_scores.append(scores.mean())

# Plot elbow curve
plt.figure(figsize=(10, 6))
plt.plot(k_range, cv_scores, 'bo-')
plt.xlabel('k')
plt.ylabel('Cross-Validation Accuracy')
plt.title('Finding Optimal k')
plt.axvline(x=k_range[cv_scores.index(max(cv_scores))],
            color='r', linestyle='--', label=f'Best k')
plt.legend()
plt.grid(True)
plt.show()

# Train final model with best k
best_k = k_range[cv_scores.index(max(cv_scores))]
print(f"\nBest k = {best_k}")

knn_final = KNeighborsClassifier(n_neighbors=best_k, weights='distance')
knn_final.fit(X_train_scaled, y_train)

# Evaluate
y_pred = knn_final.predict(X_test_scaled)
print(f"\nTest Accuracy: {knn_final.score(X_test_scaled, y_test):.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=iris.target_names))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
```

---

## When to Use KNN

### Pros

- Simple to understand and implement
- No training phase (fast training)
- Works for multi-class classification out of the box
- Non-parametric (no assumptions about data distribution)
- Can handle non-linear decision boundaries

### Cons

- **Slow prediction** — must compute distance to all training points
- **Curse of dimensionality** — performance degrades with many features
- **Memory intensive** — stores entire training set
- **Requires feature scaling** — sensitive to feature magnitudes
- **Sensitive to irrelevant features** — all features contribute to distance

### Use KNN When

- Dataset is small to medium (< 100k samples)
- Number of features is low (< 20)
- You need a quick baseline model
- Decision boundary is irregular

### Avoid KNN When

- Dataset is very large (slow predictions)
- Many irrelevant features exist
- Features have very different scales (without scaling)
- Real-time predictions are needed

---

## Tips and Best Practices

```python
# 1. Always scale your features
from sklearn.pipeline import Pipeline

knn_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('knn', KNeighborsClassifier(n_neighbors=5))
])

# 2. Use a pipeline to avoid data leakage
knn_pipeline.fit(X_train, y_train)
accuracy = knn_pipeline.score(X_test, y_test)

# 3. Try distance weighting for noisy data
knn_dist = KNeighborsClassifier(n_neighbors=7, weights='distance')

# 4. For large datasets, use algorithm='ball_tree' or 'kd_tree'
knn_fast = KNeighborsClassifier(n_neighbors=5, algorithm='kd_tree')

# 5. Reduce dimensionality before KNN for high-dimensional data
from sklearn.decomposition import PCA

knn_pca_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=10)),
    ('knn', KNeighborsClassifier(n_neighbors=5))
])
```

---

## KNN for Regression

KNN also works for predicting continuous values:

```python
from sklearn.neighbors import KNeighborsRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import mean_squared_error, r2_score

# Load regression data
housing = fetch_california_housing()
X_reg = housing.data[:500]  # Subset for speed
y_reg = housing.target[:500]

X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
    X_reg, y_reg, test_size=0.2, random_state=42
)

# Scale
scaler_r = StandardScaler()
X_train_r_s = scaler_r.fit_transform(X_train_r)
X_test_r_s = scaler_r.transform(X_test_r)

# KNN Regressor with distance weighting
knn_reg = KNeighborsRegressor(n_neighbors=7, weights='distance')
knn_reg.fit(X_train_r_s, y_train_r)
y_pred_r = knn_reg.predict(X_test_r_s)

rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
r2 = r2_score(y_test_r, y_pred_r)
print(f"RMSE: {rmse:.4f}")
print(f"R²:   {r2:.4f}")
```

---

## Try It Yourself

1. Load the Wine dataset (`load_wine()`) and classify wines using KNN
2. Compare accuracy with and without feature scaling
3. Plot the elbow curve and find the best k
4. Try both uniform and distance weights — which works better?
5. Add PCA before KNN and compare results

---

## Summary

| Concept | Key Point |
|---------|-----------|
| KNN | Classifies by majority vote of k nearest neighbors |
| Distance | Euclidean (default), Manhattan, Minkowski |
| Choosing k | Use cross-validation; start with √n |
| Scaling | **Always** scale features before KNN |
| Weights | `'uniform'` (equal) or `'distance'` (closer = more) |
| Pros | Simple, no training, multi-class |
| Cons | Slow prediction, curse of dimensionality |
