---
title: Random Forests & Ensembles
---

# Random Forests & Ensembles

Ensemble methods combine multiple models to produce better predictions than any single model alone. Random Forest is the most popular ensemble method — powerful, easy to use, and hard to overfit.

---

## What Is Ensemble Learning?

**Ensemble learning** combines predictions from multiple "weak" models to create a "strong" model.

Analogy: Asking 100 people to guess the number of jellybeans in a jar — the **average** guess is usually better than any individual guess.

### Why Ensembles Work

- Individual models may overfit to different parts of the data
- Combining them **averages out** the errors
- Reduces variance while maintaining (or improving) accuracy

---

## Bagging (Bootstrap Aggregating)

### How Bagging Works

1. Create $B$ random subsets of the training data (**with replacement** — bootstrap samples)
2. Train one model on each subset
3. Combine predictions:
   - **Regression**: average all predictions
   - **Classification**: majority vote

Each bootstrap sample contains ~63.2% of unique original samples (due to sampling with replacement).

```python
from sklearn.ensemble import BaggingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_wine
from sklearn.metrics import accuracy_score

# Load data
data = load_wine()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Bagging with decision trees
bagging = BaggingClassifier(
    estimator=DecisionTreeClassifier(),
    n_estimators=100,
    max_samples=0.8,
    random_state=42,
    n_jobs=-1
)
bagging.fit(X_train, y_train)

# Compare to single tree
single_tree = DecisionTreeClassifier(random_state=42)
single_tree.fit(X_train, y_train)

print(f"Single Tree Accuracy: {single_tree.score(X_test, y_test):.4f}")
print(f"Bagging Accuracy:     {bagging.score(X_test, y_test):.4f}")
```

### Key Benefit

Bagging **reduces variance** without increasing bias. It works best with high-variance models (like deep decision trees).

---

## Random Forest

Random Forest = **Bagging** + **Random Feature Selection** at each split.

### How It Works

1. Create bootstrap samples (like bagging)
2. For each tree, at **each split**:
   - Randomly select a subset of features (typically $\sqrt{p}$ for classification, $p/3$ for regression)
   - Find the best split using only those features
3. Grow each tree fully (or with constraints)
4. Combine predictions (majority vote or average)

### Why Random Feature Selection?

- Without it, all trees would use the same dominant features
- Random selection **decorrelates** the trees
- Less correlated trees → better ensemble performance

---

## Random Forest with Scikit-Learn

### Classification

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_breast_cancer
from sklearn.metrics import classification_report, accuracy_score
import pandas as pd

# Load data
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Random Forest
rf = RandomForestClassifier(
    n_estimators=100,      # number of trees
    max_depth=10,          # maximum tree depth
    min_samples_split=5,   # min samples to split
    random_state=42,
    n_jobs=-1              # use all CPU cores
)
rf.fit(X_train, y_train)

# Evaluate
y_pred = rf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=data.target_names)}")
```

### Regression

```python
from sklearn.ensemble import RandomForestRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

data = fetch_california_housing()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

rf_reg = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    random_state=42,
    n_jobs=-1
)
rf_reg.fit(X_train, y_train)

y_pred = rf_reg.predict(X_test)
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R²:   {r2_score(y_test, y_pred):.4f}")
```

---

## Feature Importance

Random Forest provides built-in feature importance (based on average impurity decrease):

```python
import pandas as pd
import matplotlib.pyplot as plt

# Get feature importance
importance = pd.DataFrame({
    "Feature": data.feature_names,
    "Importance": rf.feature_importances_
}).sort_values("Importance", ascending=False)

# Plot top 15
plt.figure(figsize=(10, 8))
top_n = importance.head(15)
plt.barh(top_n["Feature"], top_n["Importance"], color="forestgreen")
plt.xlabel("Importance (Mean Decrease in Impurity)")
plt.title("Random Forest Feature Importance")
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()
```

---

## Out-of-Bag (OOB) Score

Each tree doesn't see ~37% of data (not in its bootstrap sample). We can use these "out-of-bag" samples as a **free validation set**:

```python
rf_oob = RandomForestClassifier(
    n_estimators=100,
    oob_score=True,       # Enable OOB scoring
    random_state=42,
    n_jobs=-1
)
rf_oob.fit(X_train, y_train)

print(f"OOB Score:  {rf_oob.oob_score_:.4f}")
print(f"Test Score: {rf_oob.score(X_test, y_test):.4f}")
```

> OOB score is an unbiased estimate of test performance — no need for a separate validation set!

---

## Boosting

While bagging trains models **in parallel**, boosting trains them **sequentially** — each model corrects errors from the previous one.

### AdaBoost

1. Train a weak learner on the data
2. Increase weights on misclassified samples
3. Train next learner on reweighted data
4. Combine all learners (weighted vote)

```python
from sklearn.ensemble import AdaBoostClassifier

ada = AdaBoostClassifier(
    n_estimators=100,
    learning_rate=0.1,
    random_state=42
)
ada.fit(X_train, y_train)
print(f"AdaBoost Accuracy: {ada.score(X_test, y_test):.4f}")
```

### Gradient Boosting

1. Fit a model to the data
2. Compute **residuals** (errors)
3. Fit the next model to the residuals
4. Add predictions together (with a learning rate)

$$F_m(x) = F_{m-1}(x) + \eta \cdot h_m(x)$$

Where $\eta$ is the learning rate and $h_m$ is the new tree.

```python
from sklearn.ensemble import GradientBoostingClassifier

gb = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)
gb.fit(X_train, y_train)
print(f"Gradient Boosting Accuracy: {gb.score(X_test, y_test):.4f}")
```

### XGBoost

XGBoost (eXtreme Gradient Boosting) is an optimized, regularized gradient boosting library:

```python
from xgboost import XGBClassifier

xgb = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    use_label_encoder=False,
    eval_metric="mlogloss"
)
xgb.fit(X_train, y_train)
print(f"XGBoost Accuracy: {xgb.score(X_test, y_test):.4f}")
```

### LightGBM

Histogram-based gradient boosting — very fast on large datasets:

```python
from lightgbm import LGBMClassifier

lgbm = LGBMClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42,
    verbose=-1
)
lgbm.fit(X_train, y_train)
print(f"LightGBM Accuracy: {lgbm.score(X_test, y_test):.4f}")
```

### CatBoost

Handles categorical features natively — no encoding needed:

```python
from catboost import CatBoostClassifier

cat = CatBoostClassifier(
    iterations=100,
    learning_rate=0.1,
    depth=5,
    random_state=42,
    verbose=0
)
cat.fit(X_train, y_train)
print(f"CatBoost Accuracy: {cat.score(X_test, y_test):.4f}")
```

---

## Stacking

**Stacking** combines different model types with a meta-learner:

1. Train diverse base models (e.g., RF, SVM, KNN)
2. Use their predictions as features for a meta-model
3. Meta-model learns how to best combine them

```python
from sklearn.ensemble import StackingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# Define base models
estimators = [
    ("rf", RandomForestClassifier(n_estimators=50, random_state=42)),
    ("svm", SVC(probability=True, random_state=42)),
    ("knn", KNeighborsClassifier(n_neighbors=5)),
]

# Stacking with logistic regression as meta-learner
stacking = StackingClassifier(
    estimators=estimators,
    final_estimator=LogisticRegression(max_iter=1000),
    cv=5
)
stacking.fit(X_train, y_train)
print(f"Stacking Accuracy: {stacking.score(X_test, y_test):.4f}")
```

---

## Voting

Combine predictions from multiple models directly:

```python
from sklearn.ensemble import VotingClassifier

# Hard voting: majority vote
voting_hard = VotingClassifier(
    estimators=[
        ("rf", RandomForestClassifier(n_estimators=50, random_state=42)),
        ("gb", GradientBoostingClassifier(n_estimators=50, random_state=42)),
        ("ada", AdaBoostClassifier(n_estimators=50, random_state=42)),
    ],
    voting="hard"
)

# Soft voting: average probabilities (usually better)
voting_soft = VotingClassifier(
    estimators=[
        ("rf", RandomForestClassifier(n_estimators=50, random_state=42)),
        ("gb", GradientBoostingClassifier(n_estimators=50, random_state=42)),
        ("ada", AdaBoostClassifier(n_estimators=50, random_state=42)),
    ],
    voting="soft"
)

voting_hard.fit(X_train, y_train)
voting_soft.fit(X_train, y_train)
print(f"Hard Voting: {voting_hard.score(X_test, y_test):.4f}")
print(f"Soft Voting: {voting_soft.score(X_test, y_test):.4f}")
```

---

## Ensemble Methods Comparison

| Method | Strategy | Reduces | Speed | Best For |
|--------|----------|---------|-------|----------|
| Bagging | Parallel, bootstrap | Variance | Fast | High-variance models |
| Random Forest | Bagging + random features | Variance | Fast | General purpose |
| AdaBoost | Sequential, reweight | Bias | Medium | Weak learners |
| Gradient Boosting | Sequential, residuals | Bias + Variance | Medium | Structured data |
| XGBoost | Optimized GB | Bias + Variance | Fast | Competitions |
| LightGBM | Histogram GB | Bias + Variance | Very fast | Large datasets |
| CatBoost | GB + categorical | Bias + Variance | Fast | Categorical features |
| Stacking | Meta-learner | Both | Slow | Diverse models |
| Voting | Direct combination | Variance | Medium | Quick ensemble |

---

## Complete Comparison Example

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier,
    AdaBoostClassifier, BaggingClassifier
)
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_breast_cancer

# Load data
data = load_breast_cancer()
X, y = data.data, data.target
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Define models
models = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),
    "Bagging": BaggingClassifier(n_estimators=100, random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
    "AdaBoost": AdaBoostClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
}

# Train and evaluate
results = []
for name, model in models.items():
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="accuracy")
    model.fit(X_train, y_train)
    test_score = model.score(X_test, y_test)
    results.append({
        "Model": name,
        "CV Mean": cv_scores.mean(),
        "CV Std": cv_scores.std(),
        "Test Acc": test_score
    })

# Display results
results_df = pd.DataFrame(results).sort_values("Test Acc", ascending=False)
print("Model Comparison:")
print(results_df.to_string(index=False))

# Visualize
plt.figure(figsize=(10, 6))
plt.barh(results_df["Model"], results_df["Test Acc"], color="forestgreen")
plt.xlabel("Test Accuracy")
plt.title("Ensemble Methods Comparison")
plt.xlim(0.9, 1.0)
plt.tight_layout()
plt.show()

# Feature importance from Random Forest
rf = models["Random Forest"]
importance = pd.DataFrame({
    "Feature": data.feature_names,
    "Importance": rf.feature_importances_
}).sort_values("Importance", ascending=False).head(10)

plt.figure(figsize=(10, 6))
plt.barh(importance["Feature"], importance["Importance"], color="darkorange")
plt.xlabel("Importance")
plt.title("Top 10 Features (Random Forest)")
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Bagging | Bootstrap + aggregate → reduces variance |
| Random Forest | Bagging + random features → decorrelated trees |
| OOB Score | Free validation from unused bootstrap samples |
| Boosting | Sequential correction → reduces bias |
| XGBoost/LightGBM | Fast, regularized gradient boosting |
| Stacking | Meta-learner combines diverse models |

Random Forests are an excellent **default choice** — they work well out of the box with minimal tuning. For maximum performance on structured data, try **XGBoost** or **LightGBM**!
