---
title: Cross-Validation & Hyperparameter Tuning
---

# Cross-Validation & Hyperparameter Tuning

A single train/test split can give misleading results depending on which samples end up in each set. Cross-validation provides a more reliable estimate of model performance, and hyperparameter tuning finds the best model configuration.

---

## The Problem with a Single Split

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris

iris = load_iris()
X, y = iris.data, iris.target

# Different random states give different results!
for seed in [0, 1, 2, 42, 99]:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed
    )
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    print(f"Seed {seed:2d}: Accuracy = {rf.score(X_test, y_test):.4f}")

# Output varies! Which one is the "true" accuracy?
```

The solution: **evaluate on multiple splits and average the results.**

---

## K-Fold Cross-Validation

Split data into **k** equal folds. Train on k-1 folds, validate on the remaining fold. Repeat k times.

```
Fold 1: [VAL][Train][Train][Train][Train]
Fold 2: [Train][VAL][Train][Train][Train]
Fold 3: [Train][Train][VAL][Train][Train]
Fold 4: [Train][Train][Train][VAL][Train]
Fold 5: [Train][Train][Train][Train][VAL]

Final score = average of all 5 validation scores
```

### Basic Cross-Validation

```python
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5-fold cross-validation
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')

print(f"Fold scores: {scores}")
print(f"Mean accuracy: {scores.mean():.4f}")
print(f"Std deviation: {scores.std():.4f}")
print(f"95% CI: {scores.mean():.4f} +/- {scores.std() * 2:.4f}")
```

### Common Scoring Parameters

| Scoring | Task | Higher is Better? |
|---------|------|-------------------|
| `'accuracy'` | Classification | Yes |
| `'f1'` | Binary classification | Yes |
| `'f1_macro'` | Multi-class | Yes |
| `'roc_auc'` | Binary classification | Yes |
| `'precision'` | Classification | Yes |
| `'recall'` | Classification | Yes |
| `'neg_mean_squared_error'` | Regression | Yes (less negative) |
| `'r2'` | Regression | Yes |

> **Note:** Regression metrics are negated (e.g., `neg_mean_squared_error`) so that `cross_val_score` can always maximize the score.

```python
# Multiple metrics at once
from sklearn.model_selection import cross_validate

results = cross_validate(
    model, X, y, cv=5,
    scoring=['accuracy', 'f1_macro', 'precision_macro'],
    return_train_score=True
)

print(f"Test accuracy:  {results['test_accuracy'].mean():.4f}")
print(f"Train accuracy: {results['train_accuracy'].mean():.4f}")
print(f"Test F1:        {results['test_f1_macro'].mean():.4f}")
```

---

## Stratified K-Fold

Standard K-Fold doesn't guarantee class proportions in each fold. **Stratified K-Fold** preserves the class distribution.

```python
from sklearn.model_selection import StratifiedKFold

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = []
for fold, (train_idx, val_idx) in enumerate(skf.split(X, y)):
    X_train, X_val = X[train_idx], X[val_idx]
    y_train, y_val = y[train_idx], y[val_idx]

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    score = model.score(X_val, y_val)
    scores.append(score)
    print(f"Fold {fold+1}: Accuracy = {score:.4f}")

print(f"\nMean: {np.mean(scores):.4f} (+/- {np.std(scores):.4f})")
```

> **Best practice:** Always use `StratifiedKFold` for classification tasks. `cross_val_score` does this automatically when `y` contains discrete labels.

---

## Leave-One-Out Cross-Validation (LOO)

Each sample is used as the validation set exactly once. k = n (number of samples).

```python
from sklearn.model_selection import LeaveOneOut, cross_val_score

loo = LeaveOneOut()

# Warning: expensive for large datasets!
scores = cross_val_score(model, X, y, cv=loo)
print(f"LOO Accuracy: {scores.mean():.4f}")
print(f"Number of folds: {len(scores)}")  # = number of samples
```

| Pros | Cons |
|------|------|
| Maximum training data per fold | Very expensive (n model fits) |
| Low bias | High variance in estimate |
| Deterministic | Only practical for small datasets |

---

## Time Series Split

For time-ordered data, you **cannot shuffle** — future data must not leak into training.

```python
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)

# Visualization of splits:
# Fold 1: [Train][Val]
# Fold 2: [Train    ][Val]
# Fold 3: [Train        ][Val]
# Fold 4: [Train            ][Val]
# Fold 5: [Train                ][Val]

for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
    print(f"Fold {fold+1}: Train={len(train_idx)} samples, "
          f"Val={len(val_idx)} samples")

# Use with cross_val_score
scores = cross_val_score(model, X, y, cv=tscv, scoring='neg_mean_squared_error')
print(f"\nMean MSE: {-scores.mean():.4f}")
```

---

## Hyperparameter Tuning

**Hyperparameters** are settings you choose before training (e.g., `n_estimators`, `max_depth`). The goal: find the combination that gives the best cross-validation score.

---

## Grid Search

Try **every combination** of specified hyperparameter values.

```python
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier

# Define parameter grid
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 10, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Total combinations: 3 × 4 × 3 × 3 = 108
# With 5-fold CV: 108 × 5 = 540 model fits!

model = RandomForestClassifier(random_state=42)

grid_search = GridSearchCV(
    estimator=model,
    param_grid=param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,          # Use all CPU cores
    verbose=1,          # Print progress
    return_train_score=True
)

grid_search.fit(X_train, y_train)

# Best results
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.4f}")
print(f"Test score: {grid_search.score(X_test, y_test):.4f}")
```

### Accessing Grid Search Results

```python
import pandas as pd

# All results as DataFrame
results_df = pd.DataFrame(grid_search.cv_results_)
print(results_df[['params', 'mean_test_score', 'std_test_score', 'rank_test_score']]
      .sort_values('rank_test_score')
      .head(10))

# Best estimator (already fitted)
best_model = grid_search.best_estimator_
y_pred = best_model.predict(X_test)
```

---

## Randomized Search

Sample **random combinations** from parameter distributions. Better for large search spaces.

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Define parameter distributions
param_distributions = {
    'n_estimators': randint(50, 500),          # Random int in [50, 500)
    'max_depth': randint(3, 20),               # Random int in [3, 20)
    'min_samples_split': randint(2, 20),       # Random int in [2, 20)
    'min_samples_leaf': randint(1, 10),        # Random int in [1, 10)
    'max_features': uniform(0.1, 0.9),         # Random float in [0.1, 1.0)
}

model = RandomForestClassifier(random_state=42)

random_search = RandomizedSearchCV(
    estimator=model,
    param_distributions=param_distributions,
    n_iter=50,           # Try 50 random combinations
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42,
    verbose=1
)

random_search.fit(X_train, y_train)

print(f"Best parameters: {random_search.best_params_}")
print(f"Best CV score: {random_search.best_score_:.4f}")
print(f"Test score: {random_search.score(X_test, y_test):.4f}")
```

### Grid Search vs Random Search

| | Grid Search | Random Search |
|--|-------------|---------------|
| Coverage | All combinations | Random subset |
| Best for | Small param spaces (< 100 combos) | Large param spaces |
| Guaranteed optimal? | Yes (within grid) | No (but often close) |
| Speed | Exponential with params | Linear with n_iter |
| Continuous params | Must discretize | Samples from distribution |

> **Rule of thumb:** If total grid combinations < 100, use Grid Search. Otherwise, use Random Search with 50-100 iterations.

---

## Bayesian Optimization (Brief)

Instead of exhaustive or random search, Bayesian optimization builds a probabilistic model of the objective and picks the next parameters intelligently.

```python
# Using Optuna (pip install optuna)
import optuna

def objective(trial):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 500),
        'max_depth': trial.suggest_int('max_depth', 3, 20),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 20),
    }
    model = RandomForestClassifier(**params, random_state=42)
    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')
    return scores.mean()

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)
print(f"Best params: {study.best_params}")
print(f"Best score: {study.best_value:.4f}")
```

---

## Validation Curves

Plot model performance vs a single hyperparameter to understand its effect.

```python
from sklearn.model_selection import validation_curve
import numpy as np
import matplotlib.pyplot as plt

# How does max_depth affect performance?
param_range = np.arange(1, 21)

train_scores, val_scores = validation_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y,
    param_name='max_depth',
    param_range=param_range,
    cv=5,
    scoring='accuracy'
)

# Plot
train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
val_mean = val_scores.mean(axis=1)
val_std = val_scores.std(axis=1)

plt.figure(figsize=(10, 6))
plt.plot(param_range, train_mean, 'b-', label='Training score')
plt.fill_between(param_range, train_mean - train_std, train_mean + train_std, alpha=0.1)
plt.plot(param_range, val_mean, 'r-', label='Validation score')
plt.fill_between(param_range, val_mean - val_std, val_mean + val_std, alpha=0.1)
plt.xlabel('max_depth')
plt.ylabel('Accuracy')
plt.title('Validation Curve (max_depth)')
plt.legend()
plt.grid(True)
plt.show()
```

**Interpretation:**
- Training high, validation low → **overfitting** (reduce complexity)
- Both low → **underfitting** (increase complexity)
- Gap closes at some point → **sweet spot**

---

## Learning Curves

Plot performance vs **training set size** to diagnose bias/variance issues.

```python
from sklearn.model_selection import learning_curve

train_sizes, train_scores, val_scores = learning_curve(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y,
    train_sizes=np.linspace(0.1, 1.0, 10),
    cv=5,
    scoring='accuracy',
    n_jobs=-1
)

train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
val_mean = val_scores.mean(axis=1)
val_std = val_scores.std(axis=1)

plt.figure(figsize=(10, 6))
plt.plot(train_sizes, train_mean, 'b-o', label='Training score')
plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1)
plt.plot(train_sizes, val_mean, 'r-o', label='Validation score')
plt.fill_between(train_sizes, val_mean - val_std, val_mean + val_std, alpha=0.1)
plt.xlabel('Training Set Size')
plt.ylabel('Accuracy')
plt.title('Learning Curve')
plt.legend()
plt.grid(True)
plt.show()
```

**Interpretation:**

| Pattern | Diagnosis | Fix |
|---------|-----------|-----|
| Both scores low, converging | High bias (underfitting) | More complex model, more features |
| Training high, validation low, gap persists | High variance (overfitting) | More data, regularization, simpler model |
| Both high, small gap | Good fit! | Current model is appropriate |

---

## Nested Cross-Validation

When you use CV for both tuning AND evaluation, you get an optimistic estimate. **Nested CV** solves this:

- **Outer loop**: evaluates the model (how well does the tuned model generalize?)
- **Inner loop**: tunes hyperparameters (what are the best settings?)

```python
from sklearn.model_selection import cross_val_score, GridSearchCV

# Inner CV: tune hyperparameters
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [3, 5, 10],
}

inner_cv = GridSearchCV(
    RandomForestClassifier(random_state=42),
    param_grid,
    cv=3,                # Inner 3-fold for tuning
    scoring='accuracy',
    n_jobs=-1
)

# Outer CV: evaluate the tuning process
outer_scores = cross_val_score(
    inner_cv, X, y,
    cv=5,                # Outer 5-fold for evaluation
    scoring='accuracy'
)

print(f"Nested CV scores: {outer_scores}")
print(f"Mean: {outer_scores.mean():.4f} (+/- {outer_scores.std():.4f})")
print("\nThis is an unbiased estimate of how well GridSearch + RF will perform!")
```

---

## Complete Example: GridSearchCV + Learning Curves

```python
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import (
    train_test_split, GridSearchCV, learning_curve
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
import matplotlib.pyplot as plt

# Load data and split
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Pipeline with scaling + model
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', RandomForestClassifier(random_state=42))
])

# Grid Search
param_grid = {
    'clf__n_estimators': [50, 100, 200],
    'clf__max_depth': [5, 10, 15, None],
    'clf__min_samples_leaf': [1, 2, 4],
}

grid = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Best params: {grid.best_params_}")
print(f"Best CV: {grid.best_score_:.4f}")
print(f"Test: {grid.score(X_test, y_test):.4f}")

# Learning Curve for best model
train_sizes, train_scores, val_scores = learning_curve(
    grid.best_estimator_, X_train, y_train,
    train_sizes=np.linspace(0.1, 1.0, 10),
    cv=5, scoring='accuracy', n_jobs=-1
)

plt.figure(figsize=(10, 6))
plt.plot(train_sizes, train_scores.mean(axis=1), 'b-o', label='Training')
plt.plot(train_sizes, val_scores.mean(axis=1), 'r-o', label='Validation')
plt.xlabel('Training Set Size')
plt.ylabel('Accuracy')
plt.title('Learning Curve (Best Model)')
plt.legend()
plt.grid(True)
plt.show()
```

---

## Quick Reference: When to Use What

| Method | Best For |
|--------|----------|
| K-Fold (k=5 or 10) | General purpose, most problems |
| Stratified K-Fold | Classification with imbalanced classes |
| Leave-One-Out | Very small datasets (< 100 samples) |
| TimeSeriesSplit | Time-ordered data |
| Grid Search | Small parameter spaces (< 100 combos) |
| Random Search | Large parameter spaces |
| Bayesian (Optuna) | Expensive models, many hyperparameters |
| Nested CV | Unbiased evaluation of tuning process |

---

## Try It Yourself

1. Compare 5-fold and 10-fold CV on the Wine dataset — does the estimate change?
2. Use GridSearchCV to tune an SVM (`C` and `gamma`) on the Digits dataset
3. Plot learning curves for both underfitting (low `max_depth`) and overfitting (high `max_depth`) models
4. Implement nested CV and compare with non-nested — is the estimate more conservative?

---

## Summary

| Concept | Key Point |
|---------|-----------|
| K-Fold CV | Train on k-1 folds, validate on 1, average scores |
| Stratified | Preserves class proportions in each fold |
| TimeSeriesSplit | Respects temporal order, no future leakage |
| GridSearchCV | Exhaustive search over all parameter combinations |
| RandomizedSearchCV | Random sampling, better for large spaces |
| Validation curve | Score vs one hyperparameter (find sweet spot) |
| Learning curve | Score vs training size (diagnose bias/variance) |
| Nested CV | Unbiased evaluation of the full tuning pipeline |
