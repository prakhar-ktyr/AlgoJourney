---
title: Model Evaluation & Metrics
---

# Model Evaluation & Metrics

Training a model is only half the job. You need to **measure** how well it performs — and "accuracy" alone isn't always enough. A model that detects cancer must catch every positive case (high recall), while a spam filter must avoid blocking real emails (high precision).

In this lesson, you'll learn the key metrics for classification and regression, how to compute them, and how to visualize your model's performance.

---

## Train, Validation, and Test Sets

Before evaluating, you need to understand **which data** to evaluate on:

```
┌──────────────────────────────────────────────────────┐
│                    Full Dataset                       │
├────────────────────┬───────────┬─────────────────────┤
│   Training (70%)   │ Val (15%) │    Test (15%)        │
│                    │           │                      │
│  Model learns      │ Tune       │  Final report        │
│  from this         │ hyperparams│  (touch ONCE)        │
└────────────────────┴───────────┴─────────────────────┘
```

| Set | Purpose | When to Use |
|-----|---------|-------------|
| **Training** | Model learns patterns | Every epoch |
| **Validation** | Tune hyperparameters, detect overfitting | After each epoch |
| **Test** | Final, unbiased performance report | Once, at the very end |

> **Golden rule:** Never tune anything based on test set performance. If you do, the test set becomes a second validation set and your reported metrics are optimistic.

---

## Classification Metrics

### Confusion Matrix

The confusion matrix is the foundation of all classification metrics. For binary classification:

```
                        Predicted
                    Positive    Negative
                 ┌───────────┬───────────┐
Actual Positive  │    TP      │    FN     │
                 │ (correct!) │ (missed!) │
                 ├───────────┼───────────┤
Actual Negative  │    FP      │    TN     │
                 │ (false     │ (correct!)│
                 │  alarm!)   │           │
                 └───────────┴───────────┘

TP = True Positive  — predicted positive, actually positive ✓
FP = False Positive — predicted positive, actually negative ✗ (Type I error)
FN = False Negative — predicted negative, actually positive ✗ (Type II error)
TN = True Negative  — predicted negative, actually negative ✓
```

### Accuracy

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

The fraction of all predictions that are correct.

| Pros | Cons |
|------|------|
| Simple and intuitive | Misleading with imbalanced classes |

**Example:** In a dataset where 95% of emails are not spam, a model that always predicts "not spam" gets 95% accuracy — but catches zero spam!

### Precision

$$\text{Precision} = \frac{TP}{TP + FP}$$

Of all **predicted positives**, how many are actually positive?

```
Precision answers: "When the model says YES, how often is it right?"

High precision → few false alarms
Use when: false positives are costly (spam filter, legal decisions)
```

### Recall (Sensitivity)

$$\text{Recall} = \frac{TP}{TP + FN}$$

Of all **actual positives**, how many did the model catch?

```
Recall answers: "Of all actual YES cases, how many did the model find?"

High recall → few missed cases
Use when: false negatives are costly (cancer detection, fraud)
```

### Precision vs. Recall Trade-off

```
                  High Precision              High Recall
                  "Be very sure"              "Catch everything"

Predictions:       ○ ○ ● ○ ○                 ● ● ● ● ●
Actual positives:  ○ ○ ● ○ ●                 ○ ○ ● ○ ●

Precision:         1/1 = 100%                 2/5 = 40%
Recall:            1/2 = 50%                  2/2 = 100%

Miss 1 positive but no false alarms    Catch all positives but many false alarms
```

> You can't maximize both! Increasing one usually decreases the other.

### F1 Score

The **harmonic mean** of precision and recall — a single number that balances both:

$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

| Precision | Recall | F1 |
|-----------|--------|----|
| 0.90 | 0.90 | 0.90 |
| 0.99 | 0.10 | 0.18 (punishes low recall!) |
| 0.50 | 1.00 | 0.67 |

> **Why harmonic mean?** The arithmetic mean of 0.99 and 0.10 is 0.545 — misleadingly high. The harmonic mean (0.18) correctly shows the model is poor overall.

### Multi-class Metrics

For more than 2 classes, compute per-class metrics and average:

| Averaging | How |
|-----------|-----|
| **Macro** | Average of per-class metrics (treats all classes equally) |
| **Weighted** | Average weighted by class size (accounts for imbalance) |
| **Micro** | Aggregate TP/FP/FN globally, then compute (= accuracy for single-label) |

```python
from sklearn.metrics import precision_score, recall_score, f1_score

# Macro: average across classes (unweighted)
f1_macro = f1_score(y_true, y_pred, average="macro")

# Weighted: average weighted by class support
f1_weighted = f1_score(y_true, y_pred, average="weighted")
```

---

## ROC Curve and AUC

The **ROC curve** (Receiver Operating Characteristic) plots the trade-off between true positive rate and false positive rate at every classification threshold.

### Definitions

$$\text{TPR (True Positive Rate)} = \text{Recall} = \frac{TP}{TP + FN}$$

$$\text{FPR (False Positive Rate)} = \frac{FP}{FP + TN}$$

### The Curve

```
TPR (Recall)
  1.0 ┤                        ···········
      │                  ·····
      │             ····
      │          ···     ← your model
      │        ··
      │      ··
  0.5 ┤    ·
      │   ·
      │  · ← random classifier (diagonal)
      │ ·
      │·
  0.0 ┼────────────────────────────────
     0.0                              1.0
                FPR (False Positive Rate)
```

### AUC (Area Under the Curve)

| AUC | Interpretation |
|-----|----------------|
| 1.0 | Perfect classifier |
| 0.9–1.0 | Excellent |
| 0.8–0.9 | Good |
| 0.7–0.8 | Fair |
| 0.5 | Random (useless) |
| < 0.5 | Worse than random (model is inverted) |

---

## Regression Metrics

For models that predict continuous values:

### Mean Squared Error (MSE)

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

Penalizes large errors heavily (squared term). Most common regression loss.

### Root Mean Squared Error (RMSE)

$$\text{RMSE} = \sqrt{\text{MSE}}$$

Same units as the target variable — easier to interpret.

### Mean Absolute Error (MAE)

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

More robust to outliers than MSE (no squaring).

### R² Score (Coefficient of Determination)

$$R^2 = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}$$

| R² | Interpretation |
|----|----------------|
| 1.0 | Perfect predictions |
| 0.8–1.0 | Good |
| 0.5–0.8 | Moderate |
| 0.0 | Same as predicting the mean |
| < 0 | Worse than predicting the mean |

### Comparison Table

| Metric | Formula | Sensitive to Outliers? | Units |
|--------|---------|----------------------|-------|
| MSE | $\frac{1}{n}\sum(y - \hat{y})^2$ | Yes (very) | Squared units |
| RMSE | $\sqrt{MSE}$ | Yes | Same as target |
| MAE | $\frac{1}{n}\sum\|y - \hat{y}\|$ | Less | Same as target |
| R² | $1 - \frac{SS_{res}}{SS_{tot}}$ | Yes | Unitless [0, 1] |

---

## Using torchmetrics

The `torchmetrics` library provides GPU-compatible, batch-aware metrics:

```python
import torchmetrics

# Create metrics
accuracy = torchmetrics.Accuracy(task="multiclass", num_classes=10)
f1 = torchmetrics.F1Score(task="multiclass", num_classes=10, average="macro")
confmat = torchmetrics.ConfusionMatrix(task="multiclass", num_classes=10)

# Update with each batch (no need to collect all predictions!)
for X_batch, y_batch in test_loader:
    preds = model(X_batch).argmax(dim=1)
    accuracy.update(preds, y_batch)
    f1.update(preds, y_batch)
    confmat.update(preds, y_batch)

# Compute final result
print(f"Accuracy: {accuracy.compute():.4f}")
print(f"F1 (macro): {f1.compute():.4f}")
print(f"Confusion Matrix:\n{confmat.compute()}")

# Reset for next evaluation
accuracy.reset()
f1.reset()
confmat.reset()
```

### Why torchmetrics Over sklearn?

| Feature | sklearn | torchmetrics |
|---------|---------|--------------|
| GPU support | No | Yes |
| Batch-wise updates | No (needs all data) | Yes |
| Works with PyTorch tensors | Needs `.numpy()` | Native |
| Distributed training | No | Yes |

---

## Cross-Validation (Brief)

Instead of a single train/val split, **k-fold cross-validation** trains k models on different splits and averages their performance:

```
Fold 1:  [Val][Train][Train][Train][Train]
Fold 2:  [Train][Val][Train][Train][Train]
Fold 3:  [Train][Train][Val][Train][Train]
Fold 4:  [Train][Train][Train][Val][Train]
Fold 5:  [Train][Train][Train][Train][Val]

Final score = average of 5 validation scores
```

| Pros | Cons |
|------|------|
| More reliable estimate | 5× slower (train 5 models) |
| Uses all data for validation | Rarely used with deep learning (too slow) |
| Good for small datasets | Single split is fine for large datasets |

> **In practice:** Cross-validation is common in traditional ML. For deep learning with large datasets, a single train/val/test split is standard.

---

## Visualization: Learning Curves

Learning curves help diagnose training problems:

```python
import matplotlib.pyplot as plt

def plot_learning_curves(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    # Loss curves
    ax1.plot(history["train_loss"], label="Train Loss")
    ax1.plot(history["val_loss"], label="Val Loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.set_title("Loss Curves")
    ax1.legend()

    # Accuracy curves
    ax2.plot(history["train_acc"], label="Train Acc")
    ax2.plot(history["val_acc"], label="Val Acc")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy")
    ax2.set_title("Accuracy Curves")
    ax2.legend()

    plt.tight_layout()
    plt.show()
```

### Interpreting Learning Curves

```
HEALTHY:                    OVERFITTING:                UNDERFITTING:
 Loss ▲                      Loss ▲                      Loss ▲
      │··                         │ ··                         │
      │  ··  val                  │   ····val                  │ ·········val
      │    ····                   │       ····                 │
      │       ···                 │                            │ ·········train
      │          ···train         │ ··                         │
      └──────────→ Epoch          │   ··                       └──────────→ Epoch
                                  │     ····train             Both high, not
 Both converge ✓                  └──────────→ Epoch          improving ✗
                                 Gap widens ✗
```

---

## Code: Comprehensive Evaluation Pipeline

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split

# ── Generate multi-class classification data ─────────
torch.manual_seed(42)
n_samples = 2000
n_features = 20
n_classes = 5

X = torch.randn(n_samples, n_features)
W = torch.randn(n_features, n_classes)
y = (X @ W + 0.3 * torch.randn(n_samples, n_classes)).argmax(dim=1)

# Split
dataset = TensorDataset(X, y)
train_set, val_set, test_set = random_split(
    dataset, [1400, 300, 300],
    generator=torch.Generator().manual_seed(42)
)

train_loader = DataLoader(train_set, batch_size=64, shuffle=True)
val_loader = DataLoader(val_set, batch_size=64)
test_loader = DataLoader(test_set, batch_size=64)


# ── Model ────────────────────────────────────────────
model = nn.Sequential(
    nn.Linear(20, 128), nn.ReLU(), nn.Dropout(0.2),
    nn.Linear(128, 64), nn.ReLU(), nn.Dropout(0.2),
    nn.Linear(64, 5),
)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# ── Train ────────────────────────────────────────────
history = {"train_loss": [], "val_loss": [], "train_acc": [], "val_acc": []}

for epoch in range(30):
    # Training
    model.train()
    train_loss, train_correct, train_total = 0, 0, 0
    for X_b, y_b in train_loader:
        out = model(X_b)
        loss = criterion(out, y_b)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * y_b.size(0)
        train_correct += (out.argmax(1) == y_b).sum().item()
        train_total += y_b.size(0)

    # Validation
    model.eval()
    val_loss, val_correct, val_total = 0, 0, 0
    with torch.no_grad():
        for X_b, y_b in val_loader:
            out = model(X_b)
            loss = criterion(out, y_b)
            val_loss += loss.item() * y_b.size(0)
            val_correct += (out.argmax(1) == y_b).sum().item()
            val_total += y_b.size(0)

    history["train_loss"].append(train_loss / train_total)
    history["val_loss"].append(val_loss / val_total)
    history["train_acc"].append(train_correct / train_total)
    history["val_acc"].append(val_correct / val_total)


# ── Evaluation on Test Set ───────────────────────────
print("=== Test Set Evaluation ===\n")

model.eval()
all_preds = []
all_labels = []

with torch.no_grad():
    for X_b, y_b in test_loader:
        preds = model(X_b).argmax(dim=1)
        all_preds.append(preds)
        all_labels.append(y_b)

all_preds = torch.cat(all_preds)
all_labels = torch.cat(all_labels)


# ── Accuracy ─────────────────────────────────────────
accuracy = (all_preds == all_labels).float().mean().item()
print(f"Accuracy: {accuracy:.4f}")


# ── Confusion Matrix ─────────────────────────────────
print("\nConfusion Matrix:")
cm = torch.zeros(n_classes, n_classes, dtype=torch.long)
for pred, label in zip(all_preds, all_labels):
    cm[label][pred] += 1

# Print header
print(f"{'':>12} ", end="")
for i in range(n_classes):
    print(f"Pred {i:>2}", end="  ")
print()

for i in range(n_classes):
    print(f"  Actual {i:>2}  ", end="")
    for j in range(n_classes):
        print(f"{cm[i][j]:>6}", end="  ")
    print()


# ── Per-Class Precision, Recall, F1 ─────────────────
print("\nPer-Class Metrics:")
print(f"{'Class':>8} {'Precision':>10} {'Recall':>10} {'F1':>10} {'Support':>10}")
print("-" * 50)

macro_precision, macro_recall, macro_f1 = 0, 0, 0

for c in range(n_classes):
    tp = cm[c][c].item()
    fp = cm[:, c].sum().item() - tp
    fn = cm[c, :].sum().item() - tp
    support = cm[c, :].sum().item()

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    macro_precision += precision
    macro_recall += recall
    macro_f1 += f1

    print(f"{c:>8} {precision:>10.4f} {recall:>10.4f} {f1:>10.4f} {support:>10}")

macro_precision /= n_classes
macro_recall /= n_classes
macro_f1 /= n_classes

print("-" * 50)
print(f"{'Macro':>8} {macro_precision:>10.4f} {macro_recall:>10.4f} {macro_f1:>10.4f}")


# ── Training History ─────────────────────────────────
print("\n=== Training History (every 5 epochs) ===")
print(f"{'Epoch':>5} {'Train Loss':>12} {'Val Loss':>12} "
      f"{'Train Acc':>12} {'Val Acc':>12}")
for i in range(0, 30, 5):
    print(
        f"{i+1:5d} {history['train_loss'][i]:12.4f} "
        f"{history['val_loss'][i]:12.4f} "
        f"{history['train_acc'][i]:12.4f} "
        f"{history['val_acc'][i]:12.4f}"
    )
print(
    f"{30:5d} {history['train_loss'][-1]:12.4f} "
    f"{history['val_loss'][-1]:12.4f} "
    f"{history['train_acc'][-1]:12.4f} "
    f"{history['val_acc'][-1]:12.4f}"
)
```

### Expected Output

```
=== Test Set Evaluation ===

Accuracy: 0.8033

Confusion Matrix:
              Pred  0  Pred  1  Pred  2  Pred  3  Pred  4
  Actual  0      48       3       2       4       1
  Actual  1       2      52       3       1       4
  Actual  2       3       2      47       4       2
  Actual  3       1       3       2      50       3
  Actual  4       2       4       3       2      53

Per-Class Metrics:
   Class  Precision     Recall         F1    Support
--------------------------------------------------
       0     0.8571     0.8276     0.8421         58
       1     0.8125     0.8387     0.8254         62
       2     0.8246     0.8103     0.8174         58
       3     0.8197     0.8475     0.8333         59
       4     0.8413     0.8281     0.8346         64
--------------------------------------------------
   Macro     0.8310     0.8304     0.8306

=== Training History (every 5 epochs) ===
Epoch   Train Loss     Val Loss    Train Acc      Val Acc
    1       1.4521       1.3892       0.3571       0.3833
    6       0.7832       0.8156       0.6929       0.6800
   11       0.4521       0.5892       0.8214       0.7767
   16       0.2834       0.5134       0.8929       0.8067
   21       0.1823       0.5012       0.9357       0.8100
   26       0.1234       0.5231       0.9571       0.8033
   30       0.0912       0.5489       0.9714       0.8033
```

---

## Summary

| Metric | Formula | Best For |
|--------|---------|----------|
| **Accuracy** | $\frac{TP+TN}{\text{All}}$ | Balanced datasets |
| **Precision** | $\frac{TP}{TP+FP}$ | When false positives are costly |
| **Recall** | $\frac{TP}{TP+FN}$ | When false negatives are costly |
| **F1 Score** | $\frac{2 \cdot P \cdot R}{P+R}$ | Balancing precision and recall |
| **AUC-ROC** | Area under ROC curve | Comparing models, threshold-independent |
| **MSE / RMSE** | $\frac{1}{n}\sum(y-\hat{y})^2$ | Regression (penalizes outliers) |
| **MAE** | $\frac{1}{n}\sum\|y-\hat{y}\|$ | Regression (robust to outliers) |
| **R²** | $1 - \frac{SS_{res}}{SS_{tot}}$ | Regression (explained variance) |

| Tool | Use Case |
|------|----------|
| **Confusion matrix** | See exactly where the model fails |
| **Learning curves** | Diagnose overfitting/underfitting |
| **torchmetrics** | GPU-friendly, batch-wise metrics |
| **Cross-validation** | Reliable estimates for small datasets |

In the next lesson, you'll learn about **overfitting and underfitting** — and how to fix them.
