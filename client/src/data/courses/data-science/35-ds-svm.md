---
title: Support Vector Machines
---

# Support Vector Machines

Support Vector Machines (SVM) find the **optimal separating hyperplane** between classes. They're powerful for both linear and non-linear classification, especially effective in high-dimensional spaces.

---

## What Is SVM?

SVM finds the decision boundary that **maximizes the margin** between classes. The margin is the distance between the boundary and the nearest data points from each class.

Key idea: Among all possible separating boundaries, choose the one with the **widest gap** between classes.

```
Class A: ●        |        ○ :Class B
         ●      ← margin →  ○
         ●        |        ○
                  ↑
          Decision Boundary
```

---

## Maximum Margin Classifier

### The Hyperplane

In 2D, the decision boundary is a **line**. In 3D, it's a **plane**. In higher dimensions, it's a **hyperplane**.

The hyperplane is defined by:

$$\mathbf{w} \cdot \mathbf{x} + b = 0$$

Where:
- $\mathbf{w}$ = weight vector (normal to the hyperplane)
- $b$ = bias (offset from origin)
- $\mathbf{x}$ = input feature vector

### The Margin

The margin is the distance between the two parallel hyperplanes that touch the nearest points:

$$\text{Margin} = \frac{2}{||\mathbf{w}||}$$

To maximize the margin, we **minimize** $||\mathbf{w}||^2$.

### Support Vectors

The data points closest to the decision boundary are called **support vectors**. They are the only points that matter — the boundary is entirely determined by them.

> If you remove any non-support-vector point, the boundary doesn't change!

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.datasets import make_blobs

# Create linearly separable data
X, y = make_blobs(n_samples=100, centers=2, random_state=42, cluster_std=1.5)

# Train linear SVM
svm = SVC(kernel="linear", C=1.0)
svm.fit(X, y)

# Plot decision boundary and margins
plt.figure(figsize=(10, 7))
plt.scatter(X[:, 0], X[:, 1], c=y, cmap="RdBu", s=50, edgecolors="k")

# Plot support vectors
plt.scatter(
    svm.support_vectors_[:, 0], svm.support_vectors_[:, 1],
    s=200, facecolors="none", edgecolors="black", linewidths=2,
    label=f"Support Vectors ({len(svm.support_vectors_)})"
)

# Plot decision boundary
ax = plt.gca()
xlim = ax.get_xlim()
ylim = ax.get_ylim()

xx = np.linspace(xlim[0], xlim[1], 50)
yy = np.linspace(ylim[0], ylim[1], 50)
XX, YY = np.meshgrid(xx, yy)
xy = np.vstack([XX.ravel(), YY.ravel()]).T
Z = svm.decision_function(xy).reshape(XX.shape)

ax.contour(XX, YY, Z, colors="k", levels=[-1, 0, 1],
           linestyles=["--", "-", "--"], alpha=0.7)

plt.xlabel("Feature 1")
plt.ylabel("Feature 2")
plt.title("SVM: Maximum Margin Classifier")
plt.legend()
plt.show()

print(f"Number of support vectors: {len(svm.support_vectors_)}")
print(f"Weight vector: {svm.coef_[0]}")
print(f"Bias: {svm.intercept_[0]:.4f}")
```

---

## Soft Margin: The C Parameter

Real data is rarely perfectly separable. **Soft margin SVM** allows some misclassification by introducing slack variables.

The C parameter controls the trade-off:

| C Value | Effect |
|---------|--------|
| Large C (e.g., 100) | Less tolerance for errors, tight margin, potential overfit |
| Small C (e.g., 0.01) | More tolerance, wider margin, potential underfit |
| C = 1.0 | Default balance |

```python
from sklearn.svm import SVC
import matplotlib.pyplot as plt
import numpy as np

# Create slightly overlapping data
X, y = make_blobs(n_samples=100, centers=2, random_state=42, cluster_std=2.5)

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
C_values = [0.01, 1.0, 100.0]

for ax, C in zip(axes, C_values):
    svm = SVC(kernel="linear", C=C)
    svm.fit(X, y)

    ax.scatter(X[:, 0], X[:, 1], c=y, cmap="RdBu", s=30, edgecolors="k")
    ax.scatter(svm.support_vectors_[:, 0], svm.support_vectors_[:, 1],
               s=150, facecolors="none", edgecolors="black", linewidths=2)

    # Decision boundary
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    xx = np.linspace(xlim[0], xlim[1], 50)
    yy = np.linspace(ylim[0], ylim[1], 50)
    XX, YY = np.meshgrid(xx, yy)
    xy = np.vstack([XX.ravel(), YY.ravel()]).T
    Z = svm.decision_function(xy).reshape(XX.shape)
    ax.contour(XX, YY, Z, colors="k", levels=[-1, 0, 1], linestyles=["--", "-", "--"])

    ax.set_title(f"C = {C} ({len(svm.support_vectors_)} SVs)")
    ax.set_xlabel("Feature 1")

plt.suptitle("Effect of C Parameter on SVM", fontsize=14)
plt.tight_layout()
plt.show()
```

---

## The Kernel Trick

When data is **not linearly separable**, we can map it to a higher-dimensional space where it becomes separable.

The **kernel trick** computes dot products in this higher-dimensional space **without actually transforming the data** — making it computationally efficient.

### Common Kernels

| Kernel | Formula | Best For |
|--------|---------|----------|
| Linear | $K(\mathbf{x}, \mathbf{y}) = \mathbf{x} \cdot \mathbf{y}$ | Linearly separable data |
| Polynomial | $K(\mathbf{x}, \mathbf{y}) = (\mathbf{x} \cdot \mathbf{y} + c)^d$ | Polynomial boundaries |
| RBF (Gaussian) | $K(\mathbf{x}, \mathbf{y}) = \exp(-\gamma||\mathbf{x} - \mathbf{y}||^2)$ | Most cases (default) |
| Sigmoid | $K(\mathbf{x}, \mathbf{y}) = \tanh(\gamma \mathbf{x} \cdot \mathbf{y} + c)$ | Neural network-like |

### RBF Kernel

The RBF (Radial Basis Function) kernel is the most commonly used:

$$K(\mathbf{x}, \mathbf{y}) = \exp(-\gamma||\mathbf{x} - \mathbf{y}||^2)$$

The $\gamma$ parameter controls the "reach" of each training sample:
- **Large $\gamma$**: each point has local influence → complex boundary, may overfit
- **Small $\gamma$**: each point has wide influence → smoother boundary, may underfit

```python
from sklearn.datasets import make_circles
import matplotlib.pyplot as plt
import numpy as np

# Non-linear data (circles)
X, y = make_circles(n_samples=200, noise=0.1, factor=0.4, random_state=42)

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
kernels = ["linear", "poly", "rbf"]

for ax, kernel in zip(axes, kernels):
    svm = SVC(kernel=kernel, C=1.0, gamma="scale", degree=3)
    svm.fit(X, y)

    # Create mesh for decision boundary
    xx, yy = np.meshgrid(
        np.linspace(X[:, 0].min() - 0.5, X[:, 0].max() + 0.5, 100),
        np.linspace(X[:, 1].min() - 0.5, X[:, 1].max() + 0.5, 100)
    )
    Z = svm.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    ax.contourf(xx, yy, Z, alpha=0.3, cmap="RdBu")
    ax.scatter(X[:, 0], X[:, 1], c=y, cmap="RdBu", s=30, edgecolors="k")
    ax.set_title(f"Kernel: {kernel} (Acc: {svm.score(X, y):.2f})")
    ax.set_xlabel("Feature 1")
    ax.set_ylabel("Feature 2")

plt.suptitle("SVM with Different Kernels (Non-Linear Data)", fontsize=14)
plt.tight_layout()
plt.show()
```

---

## Feature Scaling Is Required

SVM is sensitive to feature scales because it relies on **distances**. Always scale features before using SVM!

```python
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.svm import SVC

# WITHOUT scaling (bad)
svm_no_scale = SVC(kernel="rbf", C=1.0)
svm_no_scale.fit(X_train, y_train)
print(f"Without scaling: {svm_no_scale.score(X_test, y_test):.4f}")

# WITH scaling (correct)
svm_scaled = make_pipeline(
    StandardScaler(),
    SVC(kernel="rbf", C=1.0, gamma="scale")
)
svm_scaled.fit(X_train, y_train)
print(f"With scaling:    {svm_scaled.score(X_test, y_test):.4f}")
```

> **Always use a pipeline** to prevent data leakage — the scaler should be fit only on training data.

---

## SVM with Scikit-Learn

### Classification

```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# SVM pipeline (scaling + SVM)
svm_clf = make_pipeline(
    StandardScaler(),
    SVC(kernel="rbf", C=1.0, gamma="scale", random_state=42)
)
svm_clf.fit(X_train, y_train)

y_pred = svm_clf.predict(X_test)
print(f"Accuracy: {svm_clf.score(X_test, y_test):.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=data.target_names)}")
```

### Regression (SVR)

```python
from sklearn.svm import SVR
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# SVR for regression
svr = make_pipeline(
    StandardScaler(),
    SVR(kernel="rbf", C=100, gamma="scale", epsilon=0.1)
)
svr.fit(X_train, y_train)

y_pred = svr.predict(X_test)
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R²:   {r2_score(y_test, y_pred):.4f}")
```

---

## Multi-Class Classification

SVM is inherently binary. For multi-class problems:

| Strategy | Description | Models Trained |
|----------|-------------|----------------|
| One-vs-One (OvO) | One classifier per pair of classes | $\frac{k(k-1)}{2}$ |
| One-vs-Rest (OvR) | One classifier per class vs all others | $k$ |

Scikit-learn uses **One-vs-One** by default for SVC.

```python
from sklearn.svm import SVC
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target  # 3 classes

svm = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1.0))
svm.fit(X, y)
print(f"3-class accuracy: {svm.score(X, y):.4f}")

# Switch to One-vs-Rest
from sklearn.multiclass import OneVsRestClassifier
svm_ovr = make_pipeline(
    StandardScaler(),
    OneVsRestClassifier(SVC(kernel="rbf", C=1.0))
)
svm_ovr.fit(X, y)
print(f"OvR accuracy: {svm_ovr.score(X, y):.4f}")
```

---

## Hyperparameter Tuning

The key parameters to tune:

| Parameter | Controls | Values to Try |
|-----------|----------|---------------|
| `C` | Error tolerance | 0.01, 0.1, 1, 10, 100 |
| `kernel` | Boundary shape | "linear", "rbf", "poly" |
| `gamma` | RBF influence radius | "scale", "auto", 0.01, 0.1, 1 |
| `degree` | Polynomial degree | 2, 3, 4, 5 |

```python
from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# Define pipeline
pipe = make_pipeline(StandardScaler(), SVC(random_state=42))

# Parameter grid (note: parameters use step name prefix)
param_grid = {
    "svc__C": [0.1, 1, 10, 100],
    "svc__gamma": ["scale", 0.01, 0.1, 1],
    "svc__kernel": ["rbf", "linear"],
}

# Grid search
grid = GridSearchCV(pipe, param_grid, cv=5, scoring="accuracy", n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Best Parameters: {grid.best_params_}")
print(f"Best CV Score:   {grid.best_score_:.4f}")
print(f"Test Score:      {grid.score(X_test, y_test):.4f}")
```

---

## Pros and Cons

| Pros | Cons |
|------|------|
| Effective in high dimensions | Slow on large datasets ($O(n^2)$ to $O(n^3)$) |
| Memory efficient (only stores support vectors) | Sensitive to feature scaling |
| Versatile (kernel trick) | Less interpretable (black-box with kernels) |
| Works well with clear margins | Doesn't output probabilities directly |
| Robust to overfitting in high-D | Poor on very noisy data (overlapping classes) |

---

## When to Use SVM

| Scenario | Use SVM? | Alternative |
|----------|----------|-------------|
| Small-medium dataset, many features | Yes | — |
| Large dataset (>100K samples) | No | Random Forest, LightGBM |
| Need interpretability | No | Decision Tree, Logistic Regression |
| Image classification (before deep learning) | Yes (RBF) | CNN (better) |
| Text classification (high-D sparse) | Yes (linear) | Naive Bayes |
| Need probabilities | Maybe | Logistic Regression |

---

## Complete Example: SVM vs Other Classifiers

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Define models (with scaling for those that need it)
models = {
    "SVM (RBF)": make_pipeline(StandardScaler(), SVC(kernel="rbf", C=10, gamma="scale")),
    "SVM (Linear)": make_pipeline(StandardScaler(), SVC(kernel="linear", C=1.0)),
    "Logistic Reg": make_pipeline(StandardScaler(), LogisticRegression(max_iter=10000)),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "KNN": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)),
}

# Train and evaluate
results = []
for name, model in models.items():
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy")
    model.fit(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    results.append({
        "Model": name,
        "CV Mean": f"{cv_scores.mean():.4f}",
        "CV Std": f"{cv_scores.std():.4f}",
        "Test Acc": f"{test_acc:.4f}"
    })

# Display results
results_df = pd.DataFrame(results)
print("=" * 55)
print("MODEL COMPARISON")
print("=" * 55)
print(results_df.to_string(index=False))

# Detailed report for best SVM
svm_best = models["SVM (RBF)"]
y_pred = svm_best.predict(X_test)
print(f"\n{'=' * 55}")
print("SVM (RBF) Detailed Results")
print(f"{'=' * 55}")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# Visualize comparison
plt.figure(figsize=(10, 6))
test_accs = [float(r["Test Acc"]) for r in results]
colors = ["#2196F3", "#1976D2", "#4CAF50", "#FF9800", "#9C27B0"]
plt.barh([r["Model"] for r in results], test_accs, color=colors)
plt.xlabel("Test Accuracy")
plt.title("Classifier Comparison")
plt.xlim(0.92, 1.0)
plt.tight_layout()
plt.show()
```

---

## Decision Boundary Visualization (2D)

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_moons

# Create non-linear data
X, y = make_moons(n_samples=200, noise=0.2, random_state=42)

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Different kernel comparisons
fig, axes = plt.subplots(2, 2, figsize=(12, 10))
configs = [
    ("Linear", {"kernel": "linear", "C": 1.0}),
    ("RBF (gamma=0.1)", {"kernel": "rbf", "C": 1.0, "gamma": 0.1}),
    ("RBF (gamma=1.0)", {"kernel": "rbf", "C": 1.0, "gamma": 1.0}),
    ("RBF (gamma=10)", {"kernel": "rbf", "C": 1.0, "gamma": 10}),
]

for ax, (title, params) in zip(axes.ravel(), configs):
    svm = SVC(**params)
    svm.fit(X_scaled, y)

    # Decision boundary mesh
    xx, yy = np.meshgrid(
        np.linspace(X_scaled[:, 0].min() - 1, X_scaled[:, 0].max() + 1, 200),
        np.linspace(X_scaled[:, 1].min() - 1, X_scaled[:, 1].max() + 1, 200)
    )
    Z = svm.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    ax.contourf(xx, yy, Z, alpha=0.3, cmap="RdBu")
    ax.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y, cmap="RdBu",
               s=30, edgecolors="k")
    ax.scatter(svm.support_vectors_[:, 0], svm.support_vectors_[:, 1],
               s=100, facecolors="none", edgecolors="green", linewidths=1.5)
    ax.set_title(f"{title} (Acc: {svm.score(X_scaled, y):.2f}, SVs: {len(svm.support_vectors_)})")

plt.suptitle("SVM Decision Boundaries with Different Kernels/Parameters", fontsize=14)
plt.tight_layout()
plt.show()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Goal | Maximize margin between classes |
| Support Vectors | Points closest to boundary — define it |
| C Parameter | Trade-off: margin width vs misclassification |
| Kernel Trick | Map to higher dimensions without computing |
| RBF Kernel | $\exp(-\gamma||x-y||^2)$ — most common |
| Scaling | **Required** — use StandardScaler |
| Pros | High-D, memory efficient, versatile |
| Cons | Slow on large data, needs scaling |

SVM is excellent for **medium-sized datasets** with clear margins. For large datasets, prefer tree-based methods. For deep learning tasks, prefer neural networks. But for many classic ML problems, SVM remains a strong contender!
