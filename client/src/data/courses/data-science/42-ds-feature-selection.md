---
title: Feature Selection
---

# Feature Selection

Feature selection is the process of choosing the **most relevant features** for your model, discarding redundant or irrelevant ones. It's different from feature engineering (creating features) — here we're picking the best subset.

---

## Why Select Features?

| Benefit | Explanation |
|---------|-------------|
| Reduce overfitting | Fewer features → less noise → better generalization |
| Faster training | Less data to process → quicker model training |
| Better interpretability | Fewer features → easier to understand model |
| Avoid multicollinearity | Remove redundant correlated features |
| Reduce storage | Less data to store and transfer |

> Rule of thumb: if you have more features than samples, feature selection is critical.

---

## Overview of Methods

```
Feature Selection Methods
├── Filter Methods (independent of model)
│   ├── Correlation
│   ├── Variance Threshold
│   ├── Chi-squared
│   ├── Mutual Information
│   └── SelectKBest
├── Wrapper Methods (use model performance)
│   ├── Forward Selection
│   ├── Backward Elimination
│   └── Recursive Feature Elimination (RFE)
└── Embedded Methods (built into model)
    ├── L1 Regularization (Lasso)
    ├── Tree-based Importance
    └── SelectFromModel
```

---

## Filter Methods

Filter methods evaluate features **independently of any model**. They're fast and good for initial screening.

### Correlation Analysis

Remove features that are highly correlated with each other (redundant information):

```python
import pandas as pd
import numpy as np

# Create sample data
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'feature_1': np.random.randn(n),
    'feature_2': np.random.randn(n),
    'feature_3': np.random.randn(n),
    'target': np.random.binomial(1, 0.5, n)
})
# Make feature_4 highly correlated with feature_1
df['feature_4'] = df['feature_1'] * 0.95 + np.random.randn(n) * 0.1

# Compute correlation matrix
corr_matrix = df.drop('target', axis=1).corr().abs()

# Find highly correlated feature pairs
upper_triangle = corr_matrix.where(
    np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
)

# Find features with correlation > 0.95
threshold = 0.95
to_drop = [col for col in upper_triangle.columns
           if any(upper_triangle[col] > threshold)]

print(f"Features to drop (correlation > {threshold}): {to_drop}")
print(f"\nCorrelation between feature_1 and feature_4: "
      f"{corr_matrix.loc['feature_1', 'feature_4']:.4f}")

# Drop highly correlated features
df_reduced = df.drop(columns=to_drop)
print(f"\nFeatures remaining: {list(df_reduced.columns)}")
```

---

### Variance Threshold

Remove features with very low variance (near-constant values):

```python
from sklearn.feature_selection import VarianceThreshold
import pandas as pd
import numpy as np

np.random.seed(42)
df = pd.DataFrame({
    'useful_1': np.random.randn(100),
    'useful_2': np.random.randn(100) * 5,
    'near_constant': np.random.choice([0, 1], 100, p=[0.99, 0.01]),
    'constant': np.ones(100),
    'low_var': np.random.randn(100) * 0.001
})

print("Variances:")
print(df.var())

# Remove features with variance below threshold
selector = VarianceThreshold(threshold=0.01)
X_selected = selector.fit_transform(df)

# Get selected feature names
selected_features = df.columns[selector.get_support()]
print(f"\nSelected features: {list(selected_features)}")
print(f"Removed features: {list(df.columns[~selector.get_support()])}")
```

---

### Chi-Squared Test

For **categorical target** — tests independence between feature and target:

```python
from sklearn.feature_selection import chi2, SelectKBest
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

# Features must be non-negative for chi2
X = pd.DataFrame({
    'feature_1': np.random.randint(0, 10, n),
    'feature_2': np.random.randint(0, 5, n),
    'feature_3': np.random.randint(0, 100, n),
    'noise_1': np.random.randint(0, 3, n),
    'noise_2': np.random.randint(0, 50, n)
})

# Target correlated with feature_1 and feature_2
y = ((X['feature_1'] > 5) & (X['feature_2'] > 2)).astype(int)

# Chi-squared test
chi_scores, p_values = chi2(X, y)

chi_results = pd.DataFrame({
    'feature': X.columns,
    'chi2_score': chi_scores,
    'p_value': p_values
}).sort_values('chi2_score', ascending=False)

print("Chi-squared scores:")
print(chi_results.to_string(index=False))

# Select top k features
selector = SelectKBest(score_func=chi2, k=3)
X_selected = selector.fit_transform(X, y)
selected = X.columns[selector.get_support()]
print(f"\nTop 3 features: {list(selected)}")
```

---

### Mutual Information

Captures **non-linear** relationships (unlike correlation):

```python
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from sklearn.feature_selection import SelectKBest
import pandas as pd
import numpy as np

np.random.seed(42)
n = 1000

X = pd.DataFrame({
    'linear': np.random.randn(n),
    'nonlinear': np.random.randn(n),
    'noise': np.random.randn(n)
})

# Target has linear AND non-linear relationships
y = (X['linear'] > 0).astype(int) | (X['nonlinear'] ** 2 > 1).astype(int)

# Mutual information (for classification)
mi_scores = mutual_info_classif(X, y, random_state=42)

mi_results = pd.DataFrame({
    'feature': X.columns,
    'mi_score': mi_scores
}).sort_values('mi_score', ascending=False)

print("Mutual Information scores:")
print(mi_results.to_string(index=False))

# SelectKBest with mutual information
selector = SelectKBest(score_func=mutual_info_classif, k=2)
X_selected = selector.fit_transform(X, y)
selected = X.columns[selector.get_support()]
print(f"\nSelected features: {list(selected)}")
```

> **Note:** For regression targets, use `mutual_info_regression` instead.

---

### SelectKBest with f_classif

ANOVA F-statistic — tests if feature means differ across classes:

```python
from sklearn.feature_selection import SelectKBest, f_classif, f_regression
from sklearn.datasets import make_classification
import pandas as pd

# Generate data with informative and noise features
X, y = make_classification(
    n_samples=500, n_features=20,
    n_informative=5, n_redundant=5,
    n_repeated=0, n_classes=2,
    random_state=42
)

feature_names = [f'feature_{i}' for i in range(20)]
X_df = pd.DataFrame(X, columns=feature_names)

# Select top 10 features
selector = SelectKBest(score_func=f_classif, k=10)
X_selected = selector.fit_transform(X_df, y)

# Show scores
scores = pd.DataFrame({
    'feature': feature_names,
    'f_score': selector.scores_,
    'p_value': selector.pvalues_,
    'selected': selector.get_support()
}).sort_values('f_score', ascending=False)

print("ANOVA F-scores (top 10 selected):")
print(scores.to_string(index=False))
```

---

## Wrapper Methods

Wrapper methods use **model performance** to evaluate feature subsets. More expensive but often more accurate.

### Forward Selection

Start with no features, add the best one at each step:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification
import numpy as np

X, y = make_classification(n_samples=300, n_features=10,
                           n_informative=4, random_state=42)

feature_names = [f'f{i}' for i in range(X.shape[1])]

def forward_selection(X, y, max_features=5):
    """Simple forward feature selection."""
    selected = []
    remaining = list(range(X.shape[1]))
    best_scores = []

    for _ in range(max_features):
        best_score = -np.inf
        best_feature = None

        for feature in remaining:
            candidate = selected + [feature]
            model = LogisticRegression(max_iter=1000)
            score = cross_val_score(model, X[:, candidate], y, cv=5).mean()

            if score > best_score:
                best_score = score
                best_feature = feature

        if best_feature is not None:
            selected.append(best_feature)
            remaining.remove(best_feature)
            best_scores.append(best_score)
            print(f"Added {feature_names[best_feature]}: "
                  f"CV score = {best_score:.4f}")

    return selected, best_scores

selected_features, scores = forward_selection(X, y, max_features=5)
print(f"\nFinal selected: {[feature_names[i] for i in selected_features]}")
```

---

### Recursive Feature Elimination (RFE)

Start with all features, recursively remove the least important:

```python
from sklearn.feature_selection import RFE, RFECV
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import StratifiedKFold
import pandas as pd

X, y = make_classification(n_samples=500, n_features=15,
                           n_informative=5, n_redundant=3, random_state=42)
feature_names = [f'feature_{i}' for i in range(15)]

# Basic RFE
model = RandomForestClassifier(n_estimators=100, random_state=42)
rfe = RFE(estimator=model, n_features_to_select=5, step=1)
rfe.fit(X, y)

rfe_results = pd.DataFrame({
    'feature': feature_names,
    'selected': rfe.support_,
    'ranking': rfe.ranking_
}).sort_values('ranking')

print("RFE Results:")
print(rfe_results.to_string(index=False))

# RFECV — automatically finds optimal number of features
rfecv = RFECV(
    estimator=RandomForestClassifier(n_estimators=100, random_state=42),
    step=1,
    cv=StratifiedKFold(5),
    scoring='accuracy',
    min_features_to_select=2
)
rfecv.fit(X, y)

print(f"\nOptimal number of features: {rfecv.n_features_}")
print(f"Selected features: {[feature_names[i] for i, s in enumerate(rfecv.support_) if s]}")
print(f"Best CV score: {rfecv.cv_results_['mean_test_score'].max():.4f}")
```

---

## Embedded Methods

Embedded methods perform feature selection **during model training**.

### L1 Regularization (Lasso)

L1 penalty drives coefficients to exactly zero:

```python
from sklearn.linear_model import Lasso, LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import make_regression
import pandas as pd
import numpy as np

# Regression example
X, y = make_regression(n_samples=500, n_features=20,
                       n_informative=5, noise=10, random_state=42)
feature_names = [f'feature_{i}' for i in range(20)]

# Scale features (important for regularization)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Lasso regression
lasso = Lasso(alpha=1.0, random_state=42)
lasso.fit(X_scaled, y)

# Features with non-zero coefficients are selected
lasso_results = pd.DataFrame({
    'feature': feature_names,
    'coefficient': lasso.coef_,
    'abs_coef': np.abs(lasso.coef_),
    'selected': lasso.coef_ != 0
}).sort_values('abs_coef', ascending=False)

print("Lasso Feature Selection:")
print(lasso_results.to_string(index=False))
print(f"\nFeatures selected: {lasso_results['selected'].sum()} / {len(feature_names)}")
```

---

### Tree-Based Feature Importance

Decision trees and ensembles provide built-in importance scores:

```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.datasets import make_classification
import pandas as pd
import numpy as np

X, y = make_classification(n_samples=500, n_features=15,
                           n_informative=5, n_redundant=3, random_state=42)
feature_names = [f'feature_{i}' for i in range(15)]

# Random Forest importance
rf = RandomForestClassifier(n_estimators=200, random_state=42)
rf.fit(X, y)

importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)

print("Random Forest Feature Importances:")
print(importance_df.to_string(index=False))

# Select features above mean importance
mean_importance = rf.feature_importances_.mean()
important_features = importance_df[importance_df['importance'] > mean_importance]
print(f"\nFeatures above mean ({mean_importance:.4f}):")
print(important_features['feature'].tolist())
```

---

### SelectFromModel

Automated selection based on model importance:

```python
from sklearn.feature_selection import SelectFromModel
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
import pandas as pd

X, y = make_classification(n_samples=500, n_features=20,
                           n_informative=5, random_state=42)
feature_names = [f'feature_{i}' for i in range(20)]

# Use model to select features
model = RandomForestClassifier(n_estimators=100, random_state=42)
selector = SelectFromModel(estimator=model, threshold='mean')
selector.fit(X, y)

selected_mask = selector.get_support()
selected_features = [f for f, s in zip(feature_names, selected_mask) if s]

print(f"Selected {len(selected_features)} features: {selected_features}")

# Transform data
X_selected = selector.transform(X)
print(f"Original shape: {X.shape}")
print(f"Selected shape: {X_selected.shape}")
```

---

## Permutation Importance

Model-agnostic method — shuffle a feature and measure performance drop:

```python
from sklearn.inspection import permutation_importance
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
import pandas as pd
import numpy as np

X, y = make_classification(n_samples=500, n_features=15,
                           n_informative=5, n_redundant=3, random_state=42)
feature_names = [f'feature_{i}' for i in range(15)]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
print(f"Test accuracy: {model.score(X_test, y_test):.4f}")

# Permutation importance (on TEST set)
perm_importance = permutation_importance(
    model, X_test, y_test,
    n_repeats=30,
    random_state=42,
    scoring='accuracy'
)

perm_df = pd.DataFrame({
    'feature': feature_names,
    'importance_mean': perm_importance.importances_mean,
    'importance_std': perm_importance.importances_std
}).sort_values('importance_mean', ascending=False)

print("\nPermutation Importance (test set):")
print(perm_df.to_string(index=False))

# Select features with positive importance
significant = perm_df[perm_df['importance_mean'] > 0.005]
print(f"\nSignificant features: {significant['feature'].tolist()}")
```

**Advantages of permutation importance:**
- Works with any model (model-agnostic)
- Computed on test set (reflects real performance)
- Accounts for feature interactions

---

## Feature Selection vs Dimensionality Reduction

| Aspect | Feature Selection | Dimensionality Reduction |
|--------|------------------|--------------------------|
| Method | Select subset of original features | Create new combined features |
| Interpretability | High (original features) | Low (PCA components) |
| Examples | RFE, Lasso, mutual info | PCA, t-SNE, UMAP |
| Information loss | Some features discarded | Compressed, not discarded |
| Use case | When interpretability matters | When all features are useful |

---

## Complete Feature Selection Pipeline

```python
import pandas as pd
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import (
    VarianceThreshold, SelectKBest, f_classif,
    RFE, SelectFromModel
)
from sklearn.inspection import permutation_importance
from sklearn.preprocessing import StandardScaler

# --- Generate dataset ---
X, y = make_classification(
    n_samples=1000, n_features=30,
    n_informative=8, n_redundant=5,
    n_repeated=2, random_state=42
)
feature_names = [f'feature_{i}' for i in range(30)]
X_df = pd.DataFrame(X, columns=feature_names)

X_train, X_test, y_train, y_test = train_test_split(
    X_df, y, test_size=0.2, random_state=42
)

print("=" * 60)
print("FEATURE SELECTION PIPELINE")
print("=" * 60)
print(f"Original features: {X_train.shape[1]}")

# --- Step 1: Variance Threshold ---
var_selector = VarianceThreshold(threshold=0.01)
var_selector.fit(X_train)
var_features = feature_names
print(f"\n1. Variance Threshold: {sum(var_selector.get_support())} features kept")

# --- Step 2: Correlation Filter ---
corr_matrix = X_train.corr().abs()
upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
corr_drop = [col for col in upper.columns if any(upper[col] > 0.95)]
X_train_filtered = X_train.drop(columns=corr_drop)
X_test_filtered = X_test.drop(columns=corr_drop)
print(f"2. Correlation Filter: removed {len(corr_drop)}, "
      f"{X_train_filtered.shape[1]} remaining")

# --- Step 3: SelectKBest ---
kbest = SelectKBest(score_func=f_classif, k=15)
kbest.fit(X_train_filtered, y_train)
kbest_features = X_train_filtered.columns[kbest.get_support()].tolist()
print(f"3. SelectKBest (k=15): {len(kbest_features)} features")

# --- Step 4: RFE ---
model = RandomForestClassifier(n_estimators=100, random_state=42)
rfe = RFE(estimator=model, n_features_to_select=10)
rfe.fit(X_train_filtered[kbest_features], y_train)
rfe_features = [f for f, s in zip(kbest_features, rfe.support_) if s]
print(f"4. RFE: {len(rfe_features)} features selected")

# --- Step 5: Evaluate ---
print("\n" + "=" * 60)
print("RESULTS COMPARISON")
print("=" * 60)

# All features
model_all = RandomForestClassifier(n_estimators=100, random_state=42)
score_all = cross_val_score(model_all, X_train, y_train, cv=5).mean()
print(f"All features ({X_train.shape[1]}): CV accuracy = {score_all:.4f}")

# Selected features
model_sel = RandomForestClassifier(n_estimators=100, random_state=42)
score_sel = cross_val_score(
    model_sel, X_train_filtered[rfe_features], y_train, cv=5
).mean()
print(f"Selected features ({len(rfe_features)}): CV accuracy = {score_sel:.4f}")

# --- Step 6: Permutation Importance (final validation) ---
model_final = RandomForestClassifier(n_estimators=100, random_state=42)
model_final.fit(X_train_filtered[rfe_features], y_train)

test_score = model_final.score(X_test_filtered[rfe_features], y_test)
print(f"\nFinal test accuracy: {test_score:.4f}")

perm = permutation_importance(
    model_final, X_test_filtered[rfe_features], y_test,
    n_repeats=20, random_state=42
)

print("\nFinal Feature Importances (Permutation):")
perm_df = pd.DataFrame({
    'feature': rfe_features,
    'importance': perm.importances_mean
}).sort_values('importance', ascending=False)
print(perm_df.to_string(index=False))
```

---

## Decision Guide

| Situation | Recommended Method |
|-----------|-------------------|
| Quick initial screening | Variance threshold + correlation |
| Large dataset, many features | Filter methods (fast) |
| Small dataset | Wrapper methods (RFE) |
| Need interpretability | L1 regularization, tree importance |
| Any model type | Permutation importance |
| Non-linear relationships | Mutual information |
| Categorical target | Chi-squared, f_classif |

**Best Practice:** Combine methods — use filter methods first to reduce candidates, then wrapper/embedded methods for final selection.

---
