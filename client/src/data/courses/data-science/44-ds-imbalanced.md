---
title: Handling Imbalanced Data
---

# Handling Imbalanced Data

Class imbalance occurs when one class is **much more frequent** than others. Standard models tend to predict the majority class, achieving high accuracy while completely failing on the minority class.

---

## Real-World Examples

| Domain | Minority Class | Imbalance Ratio |
|--------|---------------|-----------------|
| Fraud detection | Fraudulent transactions | 0.1% – 1% |
| Disease diagnosis | Positive cases | 1% – 5% |
| Customer churn | Churners | 5% – 15% |
| Spam detection | Spam emails | 10% – 30% |
| Manufacturing | Defective items | 0.01% – 1% |

---

## The Problem with Accuracy

```python
import numpy as np

# Simulated: 1000 samples, 990 negative, 10 positive
y_true = np.array([0] * 990 + [1] * 10)

# "Model" that always predicts majority class
y_pred_naive = np.zeros(1000)

accuracy = (y_true == y_pred_naive).mean()
print(f"Accuracy (always predict 0): {accuracy:.1%}")  # 99.0%!
print(f"Positive cases caught: 0 / 10")
print(f"\n→ 99% accuracy but completely useless for detecting the minority class!")
```

> **Lesson:** Accuracy is misleading for imbalanced data. A model predicting only zeros gets 99% accuracy in fraud detection — but catches zero fraud.

---

## Better Evaluation Metrics

### Precision, Recall, F1

$$\text{Precision} = \frac{TP}{TP + FP}$$

$$\text{Recall} = \frac{TP}{TP + FN}$$

$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

```python
from sklearn.metrics import (
    classification_report, confusion_matrix,
    precision_recall_curve, average_precision_score,
    f1_score, roc_auc_score
)
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import numpy as np

# Create imbalanced dataset
X, y = make_classification(
    n_samples=2000, n_features=10,
    n_informative=5, weights=[0.95, 0.05],
    random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)

print(f"Training set: {sum(y_train==0)} negative, {sum(y_train==1)} positive")
print(f"Test set: {sum(y_test==0)} negative, {sum(y_test==1)} positive")

# Train baseline model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print("\n--- Baseline (no imbalance handling) ---")
print(f"Accuracy: {(y_pred == y_test).mean():.4f}")
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred))
print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
```

---

### Precision-Recall Curve

More informative than ROC for imbalanced data:

```python
from sklearn.metrics import precision_recall_curve, average_precision_score
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import numpy as np

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Get probability scores
y_scores = model.predict_proba(X_test)[:, 1]

# Precision-Recall curve
precision, recall, thresholds = precision_recall_curve(y_test, y_scores)

# Average precision (area under PR curve)
ap = average_precision_score(y_test, y_scores)
print(f"Average Precision: {ap:.4f}")

# Find threshold for best F1
f1_scores = 2 * (precision * recall) / (precision + recall + 1e-10)
best_idx = np.argmax(f1_scores)
best_threshold = thresholds[best_idx] if best_idx < len(thresholds) else 0.5
print(f"Best threshold: {best_threshold:.3f}")
print(f"Best F1: {f1_scores[best_idx]:.4f}")
print(f"At this threshold — Precision: {precision[best_idx]:.3f}, "
      f"Recall: {recall[best_idx]:.3f}")
```

---

## Resampling Techniques

### Random Oversampling

Duplicate minority class samples:

```python
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from collections import Counter
import numpy as np

X, y = make_classification(
    n_samples=1000, n_features=10,
    weights=[0.9, 0.1], random_state=42
)

print(f"Original distribution: {Counter(y)}")

# Manual random oversampling
minority_idx = np.where(y == 1)[0]
majority_idx = np.where(y == 0)[0]

# Upsample minority to match majority
n_majority = len(majority_idx)
minority_upsampled_idx = np.random.choice(minority_idx, size=n_majority, replace=True)

# Combine
X_resampled = np.vstack([X[majority_idx], X[minority_upsampled_idx]])
y_resampled = np.hstack([y[majority_idx], y[minority_upsampled_idx]])

print(f"After oversampling: {Counter(y_resampled)}")
```

---

### SMOTE (Synthetic Minority Over-sampling Technique)

Creates **synthetic** samples by interpolating between minority class neighbors:

```python
from imblearn.over_sampling import SMOTE, ADASYN
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from collections import Counter

# Create imbalanced data
X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

print(f"Before SMOTE: {Counter(y_train)}")

# Apply SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

print(f"After SMOTE:  {Counter(y_resampled)}")

# Train on resampled data, test on original test set
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_resampled, y_resampled)
y_pred = model.predict(X_test)

print("\n--- With SMOTE ---")
print(classification_report(y_test, y_pred))
```

**How SMOTE works:**
1. Pick a minority sample
2. Find its k nearest minority neighbors (default k=5)
3. Pick one neighbor randomly
4. Create new sample at a random point between them

---

### SMOTE Variants

```python
from imblearn.over_sampling import SMOTE, ADASYN, BorderlineSMOTE

# Standard SMOTE
smote = SMOTE(
    sampling_strategy='auto',  # resample minority to match majority
    k_neighbors=5,
    random_state=42
)

# ADASYN — focuses on harder-to-learn samples
adasyn = ADASYN(
    sampling_strategy='auto',
    n_neighbors=5,
    random_state=42
)

# Borderline SMOTE — only synthesize near decision boundary
borderline = BorderlineSMOTE(
    sampling_strategy='auto',
    k_neighbors=5,
    kind='borderline-1',
    random_state=42
)
```

---

### Undersampling

Reduce majority class samples:

```python
from imblearn.under_sampling import (
    RandomUnderSampler, TomekLinks, EditedNearestNeighbours
)
from sklearn.datasets import make_classification
from collections import Counter

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)

print(f"Original: {Counter(y)}")

# Random undersampling
rus = RandomUnderSampler(random_state=42)
X_rus, y_rus = rus.fit_resample(X, y)
print(f"Random undersample: {Counter(y_rus)}")

# Tomek Links — remove majority samples that are nearest neighbors
# of minority samples (cleans boundary)
tomek = TomekLinks()
X_tomek, y_tomek = tomek.fit_resample(X, y)
print(f"Tomek Links: {Counter(y_tomek)}")

# Edited Nearest Neighbours — remove samples misclassified by kNN
enn = EditedNearestNeighbours()
X_enn, y_enn = enn.fit_resample(X, y)
print(f"ENN: {Counter(y_enn)}")
```

> **Warning:** Random undersampling discards data. Use when you have abundant majority samples.

---

### Combination: SMOTE + Tomek

```python
from imblearn.combine import SMOTETomek, SMOTEENN
from sklearn.datasets import make_classification
from collections import Counter

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)

# SMOTE + Tomek Links
# First oversample minority (SMOTE), then clean noisy samples (Tomek)
smt = SMOTETomek(random_state=42)
X_smt, y_smt = smt.fit_resample(X, y)
print(f"SMOTE + Tomek: {Counter(y_smt)}")

# SMOTE + ENN (more aggressive cleaning)
smote_enn = SMOTEENN(random_state=42)
X_senn, y_senn = smote_enn.fit_resample(X, y)
print(f"SMOTE + ENN: {Counter(y_senn)}")
```

---

## Class Weights

Tell the model to **penalize misclassification of minority class more heavily**:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import numpy as np

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

# Method 1: 'balanced' — auto-calculates weights inversely proportional to frequency
model_balanced = LogisticRegression(class_weight='balanced', max_iter=1000)
model_balanced.fit(X_train, y_train)

print("--- class_weight='balanced' ---")
print(classification_report(y_test, model_balanced.predict(X_test)))

# Method 2: Custom weights
# Give minority class 10x more weight
model_custom = LogisticRegression(class_weight={0: 1, 1: 10}, max_iter=1000)
model_custom.fit(X_train, y_train)

print("--- class_weight={0:1, 1:10} ---")
print(classification_report(y_test, model_custom.predict(X_test)))

# Method 3: RandomForest with balanced weights
rf_balanced = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced_subsample',  # balance within each tree's bootstrap
    random_state=42
)
rf_balanced.fit(X_train, y_train)

print("--- RF class_weight='balanced_subsample' ---")
print(classification_report(y_test, rf_balanced.predict(X_test)))
```

**How 'balanced' works:**

$$w_c = \frac{n\_samples}{n\_classes \times n\_samples\_c}$$

For 950 negative and 50 positive: $w_0 = \frac{1000}{2 \times 950} = 0.526$, $w_1 = \frac{1000}{2 \times 50} = 10.0$

---

## Algorithm-Level Approaches

### Ensemble Methods for Imbalanced Data

```python
from imblearn.ensemble import (
    BalancedBaggingClassifier,
    BalancedRandomForestClassifier,
    EasyEnsembleClassifier
)
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
from sklearn.tree import DecisionTreeClassifier

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

# Balanced Bagging — undersample majority in each bag
bbc = BalancedBaggingClassifier(
    estimator=DecisionTreeClassifier(),
    n_estimators=100,
    sampling_strategy='auto',
    random_state=42
)
bbc.fit(X_train, y_train)
print("--- Balanced Bagging ---")
print(f"F1 (minority): {f1_score(y_test, bbc.predict(X_test)):.4f}")

# Balanced Random Forest — balanced bootstrap samples
brf = BalancedRandomForestClassifier(
    n_estimators=100,
    random_state=42
)
brf.fit(X_train, y_train)
print("\n--- Balanced Random Forest ---")
print(f"F1 (minority): {f1_score(y_test, brf.predict(X_test)):.4f}")

# Easy Ensemble — ensemble of AdaBoost on balanced subsets
ee = EasyEnsembleClassifier(
    n_estimators=10,
    random_state=42
)
ee.fit(X_train, y_train)
print("\n--- Easy Ensemble ---")
print(f"F1 (minority): {f1_score(y_test, ee.predict(X_test)):.4f}")
```

---

## Threshold Tuning

Default threshold of 0.5 is often suboptimal for imbalanced data:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score
import numpy as np

X, y = make_classification(
    n_samples=2000, n_features=10,
    weights=[0.95, 0.05], random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Get probabilities
y_proba = model.predict_proba(X_test)[:, 1]

# Try different thresholds
print(f"{'Threshold':<12}{'Precision':<12}{'Recall':<10}{'F1':<10}")
print("-" * 44)

thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]
best_f1 = 0
best_threshold = 0.5

for thresh in thresholds:
    y_pred = (y_proba >= thresh).astype(int)
    p = precision_score(y_test, y_pred, zero_division=0)
    r = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)

    if f1 > best_f1:
        best_f1 = f1
        best_threshold = thresh

    print(f"{thresh:<12.1f}{p:<12.4f}{r:<10.4f}{f1:<10.4f}")

print(f"\nBest threshold: {best_threshold} (F1 = {best_f1:.4f})")
print(f"Default (0.5) F1: {f1_score(y_test, model.predict(X_test)):.4f}")
```

---

## Complete Comparison

```python
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, classification_report
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

# Create highly imbalanced dataset
X, y = make_classification(
    n_samples=5000, n_features=15,
    n_informative=8, weights=[0.97, 0.03],
    random_state=42
)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, stratify=y, random_state=42
)

print(f"Train: {sum(y_train==0)} negative, {sum(y_train==1)} positive")
print(f"Test:  {sum(y_test==0)} negative, {sum(y_test==1)} positive\n")

results = {}

# --- Method 1: Baseline (no handling) ---
model_base = RandomForestClassifier(n_estimators=100, random_state=42)
model_base.fit(X_train, y_train)
results['Baseline'] = f1_score(y_test, model_base.predict(X_test))

# --- Method 2: Class weights ---
model_weighted = RandomForestClassifier(
    n_estimators=100, class_weight='balanced', random_state=42
)
model_weighted.fit(X_train, y_train)
results['Class Weights'] = f1_score(y_test, model_weighted.predict(X_test))

# --- Method 3: SMOTE ---
smote = SMOTE(random_state=42)
X_smote, y_smote = smote.fit_resample(X_train, y_train)
model_smote = RandomForestClassifier(n_estimators=100, random_state=42)
model_smote.fit(X_smote, y_smote)
results['SMOTE'] = f1_score(y_test, model_smote.predict(X_test))

# --- Method 4: SMOTE + Class weights ---
X_smote2, y_smote2 = SMOTE(random_state=42).fit_resample(X_train, y_train)
model_combo = RandomForestClassifier(
    n_estimators=100, class_weight='balanced', random_state=42
)
model_combo.fit(X_smote2, y_smote2)
results['SMOTE + Weights'] = f1_score(y_test, model_combo.predict(X_test))

# --- Method 5: Threshold tuning ---
y_proba = model_base.predict_proba(X_test)[:, 1]
best_f1 = 0
for t in np.arange(0.1, 0.6, 0.05):
    f1 = f1_score(y_test, (y_proba >= t).astype(int))
    if f1 > best_f1:
        best_f1 = f1
results['Threshold Tuning'] = best_f1

# --- Results ---
print(f"{'Method':<20}{'F1 Score':<10}")
print("-" * 30)
for method, score in sorted(results.items(), key=lambda x: x[1], reverse=True):
    print(f"{method:<20}{score:<10.4f}")

# Detailed report for best method
best_method = max(results, key=results.get)
print(f"\nBest method: {best_method}")
```

---

## imbalanced-learn Library Overview

```python
# Installation: pip install imbalanced-learn

# Key modules:
from imblearn.over_sampling import (
    SMOTE,              # Synthetic minority oversampling
    ADASYN,            # Adaptive synthetic sampling
    BorderlineSMOTE,   # Focus on borderline samples
    RandomOverSampler  # Simple duplication
)

from imblearn.under_sampling import (
    RandomUnderSampler,         # Random removal
    TomekLinks,                 # Remove Tomek links
    EditedNearestNeighbours,    # Remove misclassified by kNN
    NearMiss                    # Heuristic undersampling
)

from imblearn.combine import (
    SMOTETomek,   # SMOTE + Tomek cleaning
    SMOTEENN      # SMOTE + ENN cleaning
)

from imblearn.ensemble import (
    BalancedBaggingClassifier,       # Balanced bootstrap
    BalancedRandomForestClassifier,  # Balanced RF
    EasyEnsembleClassifier           # Ensemble of balanced subsets
)

# Use imblearn Pipeline (supports samplers)
from imblearn.pipeline import Pipeline as ImbPipeline

pipe = ImbPipeline([
    ('smote', SMOTE(random_state=42)),
    ('model', RandomForestClassifier())
])
```

> **Note:** Use `imblearn.pipeline.Pipeline` instead of `sklearn.pipeline.Pipeline` when including resampling steps — sklearn's Pipeline doesn't support samplers.

---

## Decision Guide

| Situation | Recommended Approach |
|-----------|---------------------|
| Moderate imbalance (10-40% minority) | Class weights |
| Severe imbalance (<5% minority) | SMOTE + class weights |
| Very large dataset | Undersampling or class weights |
| Small dataset | SMOTE (creates more data) |
| Need probability calibration | Threshold tuning |
| Noisy data | SMOTE + Tomek/ENN cleaning |
| Production system | Class weights (simplest) |
| Ensemble already | BalancedBagging or EasyEnsemble |

**General strategy:**
1. Start with class weights (simplest, no data modification)
2. Try SMOTE if weights aren't enough
3. Always tune threshold on validation set
4. Use PR-AUC and F1 for evaluation, never accuracy alone

---
