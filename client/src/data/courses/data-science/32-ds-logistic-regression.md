---
title: Logistic Regression
---

# Logistic Regression

Logistic regression is a fundamental **classification** algorithm. Despite its name, it's used for predicting categories — not continuous values.

---

## What Is Classification?

**Classification** is a supervised learning task where the goal is to predict a **categorical label** (class) for each input.

Examples:
- Email: spam or not spam
- Patient: disease or healthy
- Transaction: fraud or legitimate
- Image: cat or dog

> Classification predicts **which category** an input belongs to.

---

## Binary Classification

Binary classification has exactly **two classes**:

| Label | Examples |
|-------|----------|
| 1 (positive) | Spam, fraud, disease |
| 0 (negative) | Not spam, legitimate, healthy |

---

## Why Not Linear Regression for Classification?

If we use linear regression for a 0/1 problem:

- Predictions can be **less than 0** or **greater than 1**
- These values don't make sense as probabilities
- The decision boundary is overly sensitive to outliers

We need a function that outputs values **between 0 and 1** — a probability.

```python
import numpy as np
import matplotlib.pyplot as plt

# Linear regression for classification — problematic!
x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 50])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 1])

# Linear fit gives bad predictions
from numpy.polynomial.polynomial import polyfit
b, m = polyfit(x, y, 1)
x_line = np.linspace(0, 55, 100)
y_line = b + m * x_line

plt.scatter(x, y, color="blue")
plt.plot(x_line, y_line, color="red", label="Linear (bad)")
plt.axhline(y=0, color="gray", linestyle="--", alpha=0.3)
plt.axhline(y=1, color="gray", linestyle="--", alpha=0.3)
plt.xlabel("Feature")
plt.ylabel("Class")
plt.title("Why Linear Regression Fails for Classification")
plt.legend()
plt.show()
```

---

## The Logistic Function (Sigmoid)

The **sigmoid function** maps any real number to the range (0, 1):

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

Properties:
- Output is always between 0 and 1
- $\sigma(0) = 0.5$
- Large positive $z$ → output near 1
- Large negative $z$ → output near 0
- S-shaped curve

```python
import numpy as np
import matplotlib.pyplot as plt

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

z = np.linspace(-10, 10, 200)

plt.figure(figsize=(8, 5))
plt.plot(z, sigmoid(z), color="blue", linewidth=2)
plt.axhline(y=0.5, color="red", linestyle="--", alpha=0.5, label="Threshold = 0.5")
plt.axvline(x=0, color="gray", linestyle="--", alpha=0.3)
plt.xlabel("z")
plt.ylabel("σ(z)")
plt.title("Sigmoid Function")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

---

## Logistic Regression Model

The model computes a linear combination, then passes it through the sigmoid:

$$P(y = 1 | \mathbf{x}) = \sigma(\beta_0 + \beta_1 x_1 + \beta_2 x_2 + \cdots + \beta_n x_n)$$

Or equivalently:

$$P(y = 1 | \mathbf{x}) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 x_1 + \cdots + \beta_n x_n)}}$$

### Decision Rule

- If $P(y=1|\mathbf{x}) > 0.5$ → predict class **1**
- If $P(y=1|\mathbf{x}) \leq 0.5$ → predict class **0**

The **decision boundary** is the surface where $P = 0.5$, which corresponds to:

$$\beta_0 + \beta_1 x_1 + \cdots + \beta_n x_n = 0$$

---

## Log-Odds (Logit)

The inverse of the sigmoid is the **logit** function:

$$\text{logit}(p) = \ln\left(\frac{p}{1-p}\right) = \beta_0 + \beta_1 x_1 + \cdots + \beta_n x_n$$

The ratio $\frac{p}{1-p}$ is called the **odds**. The coefficients tell us how features affect the log-odds.

- $\beta_j > 0$ → increasing $x_j$ increases probability of class 1
- $\beta_j < 0$ → increasing $x_j$ decreases probability of class 1

---

## Training: Maximum Likelihood Estimation

We can't use MSE for logistic regression (non-convex). Instead, we use **log-loss** (binary cross-entropy):

$$L = -\frac{1}{n}\sum_{i=1}^{n}\left[y_i \log(\hat{p}_i) + (1 - y_i)\log(1 - \hat{p}_i)\right]$$

Where $\hat{p}_i = P(y_i = 1 | \mathbf{x}_i)$.

Intuition:
- When $y = 1$: we want $\hat{p}$ close to 1 → $\log(\hat{p})$ near 0
- When $y = 0$: we want $\hat{p}$ close to 0 → $\log(1 - \hat{p})$ near 0

The optimization is **convex** — guaranteed to find the global minimum.

---

## Logistic Regression with Scikit-Learn

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
import pandas as pd

# Load dataset
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target  # 0 = malignant, 1 = benign

print(f"Dataset shape: {X.shape}")
print(f"Classes: {dict(zip(data.target_names, [sum(y==0), sum(y==1)]))}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train logistic regression
model = LogisticRegression(max_iter=10000, random_state=42)
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)

print(f"\nFirst 5 predictions: {y_pred[:5]}")
print(f"First 5 probabilities (class 1): {y_prob[:5, 1].round(3)}")
```

### Key Methods

| Method | Returns |
|--------|---------|
| `model.predict(X)` | Class labels (0 or 1) |
| `model.predict_proba(X)` | Probabilities for each class |
| `model.coef_` | Feature coefficients (log-odds) |
| `model.intercept_` | Intercept term |

---

## Evaluation Metrics

### Confusion Matrix

```
                Predicted
              |  0   |  1   |
Actual   0    |  TN  |  FP  |
         1    |  FN  |  TP  |
```

- **TP** (True Positive): correctly predicted positive
- **TN** (True Negative): correctly predicted negative
- **FP** (False Positive): predicted positive but actually negative (Type I error)
- **FN** (False Negative): predicted negative but actually positive (Type II error)

### Metrics from Confusion Matrix

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

$$\text{Precision} = \frac{TP}{TP + FP}$$

$$\text{Recall (Sensitivity)} = \frac{TP}{TP + FN}$$

$$\text{F1-Score} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)

# Calculate metrics
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
print(f"Precision: {precision_score(y_test, y_pred):.4f}")
print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
print(f"\nConfusion Matrix:\n{cm}")

# Detailed report
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=data.target_names))
```

### ROC Curve and AUC

The **ROC curve** plots True Positive Rate vs False Positive Rate at different thresholds.

**AUC** (Area Under the Curve): 1.0 = perfect, 0.5 = random guessing.

```python
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

# Get probabilities for positive class
y_scores = model.predict_proba(X_test)[:, 1]

# Calculate ROC curve
fpr, tpr, thresholds = roc_curve(y_test, y_scores)
auc = roc_auc_score(y_test, y_scores)

# Plot
plt.figure(figsize=(8, 6))
plt.plot(fpr, tpr, color="blue", linewidth=2, label=f"ROC (AUC = {auc:.3f})")
plt.plot([0, 1], [0, 1], color="red", linestyle="--", label="Random")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

---

## Multi-Class Classification

For more than 2 classes, logistic regression extends using:

### One-vs-Rest (OvR)

- Train one binary classifier per class
- Each classifier: "this class vs all others"
- Predict the class with highest probability

### Multinomial (Softmax)

- Generalization of sigmoid to multiple classes
- $P(y=k|\mathbf{x}) = \frac{e^{z_k}}{\sum_{j} e^{z_j}}$
- All probabilities sum to 1

```python
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import load_iris

# Multi-class dataset
iris = load_iris()
X, y = iris.data, iris.target  # 3 classes

# Multinomial logistic regression
model = LogisticRegression(multi_class="multinomial", max_iter=1000)
model.fit(X, y)

# Predict probabilities for all classes
probs = model.predict_proba(X[:3])
print("Probabilities (3 classes):")
for i, p in enumerate(probs):
    print(f"  Sample {i}: {p.round(3)}")
```

---

## Regularization: The C Parameter

In scikit-learn, `C` is the **inverse** of regularization strength:

- **Large C** (e.g., 100): weak regularization → may overfit
- **Small C** (e.g., 0.01): strong regularization → may underfit
- Default: `C=1.0`

```python
from sklearn.linear_model import LogisticRegression
import numpy as np

# Compare different C values
for c_val in [0.01, 0.1, 1.0, 10.0, 100.0]:
    model = LogisticRegression(C=c_val, max_iter=10000, random_state=42)
    model.fit(X_train, y_train)
    train_acc = model.score(X_train, y_train)
    test_acc = model.score(X_test, y_test)
    n_nonzero = np.sum(model.coef_ != 0)
    print(f"C={c_val:6.2f} | Train: {train_acc:.4f} | Test: {test_acc:.4f} | Non-zero coefs: {n_nonzero}")
```

| Penalty | Parameter |
|---------|-----------|
| L2 (Ridge) | `penalty='l2'` (default) |
| L1 (Lasso) | `penalty='l1', solver='liblinear'` |
| ElasticNet | `penalty='elasticnet', solver='saga', l1_ratio=0.5` |
| None | `penalty=None` |

---

## Complete Classification Pipeline

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_curve, roc_auc_score, ConfusionMatrixDisplay
)

# Create a Titanic-style dataset
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features (important for logistic regression)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
model = LogisticRegression(C=1.0, max_iter=10000, random_state=42)
model.fit(X_train_scaled, y_train)

# Predictions
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]

# Evaluation
print("=" * 50)
print("LOGISTIC REGRESSION RESULTS")
print("=" * 50)
print(f"\nAccuracy: {model.score(X_test_scaled, y_test):.4f}")
print(f"AUC-ROC:  {roc_auc_score(y_test, y_prob):.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=data.target_names)}")

# Feature importance (absolute coefficients)
importance = pd.DataFrame({
    "Feature": data.feature_names,
    "Coefficient": model.coef_[0]
}).sort_values("Coefficient", key=abs, ascending=False)

print("\nTop 10 Most Important Features:")
print(importance.head(10).to_string(index=False))

# Visualize confusion matrix
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Confusion matrix
ConfusionMatrixDisplay.from_predictions(
    y_test, y_pred, display_labels=data.target_names, ax=axes[0]
)
axes[0].set_title("Confusion Matrix")

# ROC curve
fpr, tpr, _ = roc_curve(y_test, y_prob)
auc = roc_auc_score(y_test, y_prob)
axes[1].plot(fpr, tpr, "b-", linewidth=2, label=f"AUC = {auc:.3f}")
axes[1].plot([0, 1], [0, 1], "r--", label="Random")
axes[1].set_xlabel("False Positive Rate")
axes[1].set_ylabel("True Positive Rate")
axes[1].set_title("ROC Curve")
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Sigmoid | $\sigma(z) = \frac{1}{1 + e^{-z}}$ maps to (0, 1) |
| Decision | Predict 1 if $P > 0.5$, else 0 |
| Loss | Binary cross-entropy (log-loss) |
| Metrics | Accuracy, precision, recall, F1, AUC |
| Multi-class | One-vs-rest or softmax |
| Regularization | C parameter (inverse strength) |

Logistic regression is often the **first model to try** for classification tasks. It's fast, interpretable, and serves as an excellent baseline!
