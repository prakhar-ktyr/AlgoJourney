---
title: Model Evaluation & Metrics
---

# Model Evaluation & Metrics

A model that performs well on training data may fail on new data. Proper evaluation tells you how your model will perform in the real world.

---

## Why Evaluation Matters

```
Good training accuracy ≠ Good generalization

Training accuracy: 99%  →  Could be overfitting!
Test accuracy: 60%     →  Model memorized noise
```

The goal is a model that works on **unseen data**, not just the data it trained on.

---

## Train/Test Split

The simplest evaluation strategy: hold out a portion of data for testing.

```python
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,       # 20% for testing
    random_state=42,     # Reproducibility
    stratify=y           # Preserve class proportions
)

print(f"Training set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")
```

### Why `stratify=y`?

Without stratification, random splits can create imbalanced test sets:

```python
# Example: 95% class A, 5% class B
# Without stratify: test set might have 0 examples of class B!
# With stratify: test set preserves 95/5 ratio
```

---

## Classification Metrics

### Confusion Matrix

The confusion matrix shows all prediction outcomes:

```
                  Predicted
              Positive  Negative
Actual  Pos |   TP    |   FN    |
        Neg |   FP    |   TN    |
```

| Term | Meaning |
|------|---------|
| **TP** (True Positive) | Correctly predicted positive |
| **TN** (True Negative) | Correctly predicted negative |
| **FP** (False Positive) | Incorrectly predicted positive (Type I error) |
| **FN** (False Negative) | Incorrectly predicted negative (Type II error) |

```python
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

# Compute confusion matrix
cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(cm)

# Visual display
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['Negative', 'Positive'])
disp.plot(cmap='Blues')
plt.title('Confusion Matrix')
plt.show()
```

### Accuracy

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

```python
from sklearn.metrics import accuracy_score

accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")
```

> **Warning:** Accuracy is **misleading with imbalanced data!**
>
> If 95% of emails are not spam, a model that always predicts "not spam" gets 95% accuracy but catches zero spam.

### Precision

$$\text{Precision} = \frac{TP}{TP + FP}$$

**"Of all predicted positives, how many are actually positive?"**

- High precision = few false alarms
- Important when: false positives are costly (spam filter marking important emails)

### Recall (Sensitivity)

$$\text{Recall} = \frac{TP}{TP + FN}$$

**"Of all actual positives, how many did we find?"**

- High recall = few missed positives
- Important when: false negatives are costly (disease detection — missing a sick patient)

### F1 Score

$$F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

The **harmonic mean** of precision and recall. Balances both metrics.

- F1 = 1.0: perfect precision and recall
- F1 = 0.0: worst case

### Classification Report

```python
from sklearn.metrics import classification_report

print(classification_report(y_test, y_pred, target_names=['Class 0', 'Class 1']))
```

Output:
```
              precision    recall  f1-score   support

     Class 0       0.88      0.92      0.90       50
     Class 1       0.91      0.87      0.89       48

    accuracy                           0.90       98
   macro avg       0.90      0.89      0.89       98
weighted avg       0.90      0.90      0.90       98
```

### Precision vs Recall Trade-off

You can't maximize both — improving one usually hurts the other:

```python
from sklearn.metrics import precision_recall_curve

# Get probability scores
y_proba = model.predict_proba(X_test)[:, 1]

# Compute precision-recall at various thresholds
precisions, recalls, thresholds = precision_recall_curve(y_test, y_proba)

plt.figure(figsize=(10, 6))
plt.plot(thresholds, precisions[:-1], 'b-', label='Precision')
plt.plot(thresholds, recalls[:-1], 'r-', label='Recall')
plt.xlabel('Threshold')
plt.ylabel('Score')
plt.title('Precision-Recall vs Threshold')
plt.legend()
plt.grid(True)
plt.show()
```

---

## ROC Curve and AUC

### ROC Curve (Receiver Operating Characteristic)

Plots **True Positive Rate** vs **False Positive Rate** at various classification thresholds.

- **TPR** (Recall): $\frac{TP}{TP + FN}$
- **FPR**: $\frac{FP}{FP + TN}$

```python
from sklearn.metrics import roc_curve, roc_auc_score

# Need probability scores, not hard predictions
y_proba = model.predict_proba(X_test)[:, 1]

# Compute ROC curve
fpr, tpr, thresholds = roc_curve(y_test, y_proba)
auc = roc_auc_score(y_test, y_proba)

# Plot
plt.figure(figsize=(8, 8))
plt.plot(fpr, tpr, 'b-', linewidth=2, label=f'Model (AUC = {auc:.4f})')
plt.plot([0, 1], [0, 1], 'k--', label='Random (AUC = 0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
plt.grid(True)
plt.show()
```

### AUC (Area Under the Curve)

| AUC Value | Interpretation |
|-----------|---------------|
| 1.0 | Perfect classifier |
| 0.9 - 1.0 | Excellent |
| 0.8 - 0.9 | Good |
| 0.7 - 0.8 | Fair |
| 0.5 | Random guessing (no skill) |
| < 0.5 | Worse than random (model is inverted) |

### Precision-Recall Curve (for Imbalanced Data)

When classes are imbalanced, the PR curve is more informative than ROC:

```python
from sklearn.metrics import precision_recall_curve, average_precision_score

y_proba = model.predict_proba(X_test)[:, 1]

precision, recall, _ = precision_recall_curve(y_test, y_proba)
ap = average_precision_score(y_test, y_proba)

plt.figure(figsize=(8, 8))
plt.plot(recall, precision, 'b-', linewidth=2, label=f'AP = {ap:.4f}')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve')
plt.legend()
plt.grid(True)
plt.show()
```

---

## Regression Metrics

### Mean Squared Error (MSE)

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

Penalizes large errors heavily (squared).

### Root Mean Squared Error (RMSE)

$$\text{RMSE} = \sqrt{\text{MSE}}$$

Same units as the target variable — easier to interpret.

### Mean Absolute Error (MAE)

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

Less sensitive to outliers than MSE.

### R² Score (Coefficient of Determination)

$$R^2 = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}$$

- $R^2 = 1.0$: perfect prediction
- $R^2 = 0.0$: model predicts the mean (no better than baseline)
- $R^2 < 0$: model is worse than predicting the mean

### Mean Absolute Percentage Error (MAPE)

$$\text{MAPE} = \frac{100}{n}\sum_{i=1}^{n}\left|\frac{y_i - \hat{y}_i}{y_i}\right|$$

Expressed as a percentage — easy to communicate to stakeholders.

```python
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score
)
import numpy as np

# Compute regression metrics
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MSE:  {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE:  {mae:.4f}")
print(f"R²:   {r2:.4f}")

# MAPE (manual)
mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
print(f"MAPE: {mape:.2f}%")
```

---

## Choosing the Right Metric

| Scenario | Best Metric | Why |
|----------|-------------|-----|
| Balanced classification | Accuracy, F1 | Both classes matter equally |
| Imbalanced classification | F1, PR-AUC | Accuracy is misleading |
| Minimizing false alarms | Precision | Cost of false positive is high |
| Finding all positives | Recall | Cost of missing positive is high |
| Ranking/scoring | AUC-ROC | Threshold-independent |
| Regression (general) | RMSE, R² | Standard measures |
| Regression (outlier-robust) | MAE | Not squared, less outlier influence |
| Business communication | MAPE | Easy percentage interpretation |

---

## Complete Evaluation Pipeline

```python
import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_curve, roc_auc_score,
    precision_recall_curve, average_precision_score,
    ConfusionMatrixDisplay
)
import matplotlib.pyplot as plt

# Load data
data = load_breast_cancer()
X, y = data.data, data.target

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train two models for comparison
models = {
    'Logistic Regression': LogisticRegression(max_iter=5000, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42)
}

results = {}

for name, model in models.items():
    # Train
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    # Store results
    results[name] = {
        'y_pred': y_pred,
        'y_proba': y_proba,
        'auc': roc_auc_score(y_test, y_proba)
    }

    # Print report
    print(f"\n{'='*50}")
    print(f"  {name}")
    print(f"{'='*50}")
    print(classification_report(y_test, y_pred,
                                target_names=['Malignant', 'Benign']))
    print(f"AUC-ROC: {results[name]['auc']:.4f}")

# --- Confusion Matrices ---
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
for i, (name, res) in enumerate(results.items()):
    cm = confusion_matrix(y_test, res['y_pred'])
    disp = ConfusionMatrixDisplay(cm, display_labels=['Malignant', 'Benign'])
    disp.plot(ax=axes[i], cmap='Blues')
    axes[i].set_title(name)
plt.tight_layout()
plt.show()

# --- ROC Curves ---
plt.figure(figsize=(8, 8))
for name, res in results.items():
    fpr, tpr, _ = roc_curve(y_test, res['y_proba'])
    plt.plot(fpr, tpr, linewidth=2, label=f"{name} (AUC={res['auc']:.4f})")

plt.plot([0, 1], [0, 1], 'k--', label='Random')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve Comparison')
plt.legend()
plt.grid(True)
plt.show()

# --- Precision-Recall Curves ---
plt.figure(figsize=(8, 8))
for name, res in results.items():
    precision, recall, _ = precision_recall_curve(y_test, res['y_proba'])
    ap = average_precision_score(y_test, res['y_proba'])
    plt.plot(recall, precision, linewidth=2, label=f"{name} (AP={ap:.4f})")

plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve Comparison')
plt.legend()
plt.grid(True)
plt.show()

# --- Summary ---
print("\n\nModel Comparison Summary:")
print("-" * 40)
for name, res in results.items():
    print(f"{name}: AUC = {res['auc']:.4f}")
```

---

## Multi-Class Metrics

For more than 2 classes, metrics can be averaged differently:

```python
from sklearn.metrics import f1_score

# Averaging strategies
f1_macro = f1_score(y_test, y_pred, average='macro')     # Unweighted mean
f1_weighted = f1_score(y_test, y_pred, average='weighted')  # Weighted by support
f1_micro = f1_score(y_test, y_pred, average='micro')     # Global TP/FP/FN

print(f"F1 (macro):    {f1_macro:.4f}")    # Treats all classes equally
print(f"F1 (weighted): {f1_weighted:.4f}") # Accounts for class imbalance
print(f"F1 (micro):    {f1_micro:.4f}")    # Same as accuracy for multi-class
```

| Average | Use When |
|---------|----------|
| `macro` | All classes equally important |
| `weighted` | Account for class imbalance |
| `micro` | Overall performance across all samples |

---

## Try It Yourself

1. Train a model on the Iris dataset and produce a full classification report
2. Compare Logistic Regression and SVM using ROC curves — which has higher AUC?
3. Create an imbalanced dataset and show why accuracy is misleading
4. Build a regression model and compute MSE, RMSE, MAE, and R²

---

## Summary

| Metric | Formula/Key Idea | When to Use |
|--------|-----------------|-------------|
| Accuracy | $(TP+TN) / \text{Total}$ | Balanced classes |
| Precision | $TP / (TP+FP)$ | Minimize false positives |
| Recall | $TP / (TP+FN)$ | Find all positives |
| F1 | Harmonic mean of P and R | Balance precision/recall |
| AUC-ROC | Area under TPR vs FPR curve | Threshold-independent ranking |
| RMSE | $\sqrt{\text{mean}(errors^2)}$ | Regression, same units as target |
| R² | Proportion of variance explained | Regression quality |
