---
title: Decision Trees
---

# Decision Trees

A decision tree is a **flowchart-like model** that makes predictions by learning simple decision rules from data. It's one of the most intuitive and interpretable machine learning algorithms.

---

## What Is a Decision Tree?

A decision tree splits data into subsets based on feature values, creating a tree structure:

- **Root node**: the top — contains all data
- **Internal nodes**: decision points — ask a question about a feature
- **Branches**: outcomes of the decision
- **Leaf nodes**: final predictions (class label or value)

```
                Is Age > 30?
               /            \
            Yes              No
           /                  \
    Income > 50k?         Student?
    /         \           /       \
  Yes         No        Yes       No
 Buy        Don't     Buy       Don't
```

---

## How Decision Trees Work

### Recursive Binary Splitting

At each node, the algorithm:

1. Considers all features and all possible split thresholds
2. Picks the feature + threshold that **best separates** the data
3. Splits the data into two groups
4. Repeats recursively until a stopping criterion is met

### Stopping Criteria

- Maximum depth reached
- Minimum samples in a node
- No further improvement possible
- All samples belong to one class

---

## Decision Trees for Classification

### Gini Impurity

Measures how "impure" a node is — how mixed the classes are:

$$G = 1 - \sum_{i=1}^{k} p_i^2$$

Where $p_i$ is the proportion of class $i$ in the node.

- $G = 0$ → perfectly pure (one class only)
- $G = 0.5$ → maximum impurity (binary, 50/50 split)

**Example:**
- Node with 90% class A, 10% class B: $G = 1 - (0.9^2 + 0.1^2) = 0.18$
- Node with 50% class A, 50% class B: $G = 1 - (0.5^2 + 0.5^2) = 0.50$

### Entropy

Measures the amount of "disorder" or uncertainty:

$$H = -\sum_{i=1}^{k} p_i \log_2(p_i)$$

- $H = 0$ → perfectly pure
- $H = 1$ → maximum uncertainty (binary, 50/50 split)

### Information Gain

The **reduction in impurity** after a split:

$$\text{IG} = H(\text{parent}) - \sum_{j} \frac{n_j}{n} H(\text{child}_j)$$

The algorithm chooses the split with the **highest information gain**.

```python
import numpy as np

def gini_impurity(labels):
    """Calculate Gini impurity of a set of labels."""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return 1 - np.sum(probs ** 2)

def entropy(labels):
    """Calculate entropy of a set of labels."""
    _, counts = np.unique(labels, return_counts=True)
    probs = counts / len(labels)
    return -np.sum(probs * np.log2(probs + 1e-10))

# Example
labels_pure = [1, 1, 1, 1, 1]
labels_mixed = [1, 1, 0, 0, 1]
labels_even = [1, 1, 0, 0]

print(f"Pure:  Gini={gini_impurity(labels_pure):.3f}, Entropy={entropy(labels_pure):.3f}")
print(f"Mixed: Gini={gini_impurity(labels_mixed):.3f}, Entropy={entropy(labels_mixed):.3f}")
print(f"Even:  Gini={gini_impurity(labels_even):.3f}, Entropy={entropy(labels_even):.3f}")
```

---

## Decision Trees for Regression

For regression, the tree minimizes **MSE** at each split:

$$\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \bar{y})^2$$

At each leaf, the prediction is the **mean** of the target values in that leaf.

The best split is the one that results in the lowest weighted MSE across children.

---

## Decision Trees with Scikit-Learn

### Classification

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score, classification_report

# Load data
data = load_iris()
X, y = data.data, data.target

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train decision tree
clf = DecisionTreeClassifier(
    max_depth=5,
    random_state=42,
    criterion="gini"  # or "entropy"
)
clf.fit(X_train, y_train)

# Evaluate
y_pred = clf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=data.target_names)}")
```

### Regression

```python
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import fetch_california_housing
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# Load data
data = fetch_california_housing()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train regression tree
reg = DecisionTreeRegressor(max_depth=5, random_state=42)
reg.fit(X_train, y_train)

# Evaluate
y_pred = reg.predict(X_test)
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.4f}")
print(f"R²:   {r2_score(y_test, y_pred):.4f}")
```

---

## Visualizing Decision Trees

### Matplotlib Visualization

```python
from sklearn.tree import plot_tree
import matplotlib.pyplot as plt

plt.figure(figsize=(20, 10))
plot_tree(
    clf,
    feature_names=data.feature_names,
    class_names=data.target_names,
    filled=True,
    rounded=True,
    fontsize=10,
    max_depth=3  # limit display depth
)
plt.title("Decision Tree Visualization")
plt.tight_layout()
plt.show()
```

### Text Representation

```python
from sklearn.tree import export_text

tree_rules = export_text(clf, feature_names=list(data.feature_names))
print("Decision Tree Rules:")
print(tree_rules[:500])  # First 500 characters
```

---

## Feature Importance

Decision trees compute feature importance based on **total impurity reduction**:

```python
import pandas as pd
import matplotlib.pyplot as plt

# Get feature importance
importance = pd.DataFrame({
    "Feature": data.feature_names,
    "Importance": clf.feature_importances_
}).sort_values("Importance", ascending=False)

print("Feature Importance:")
print(importance.to_string(index=False))

# Plot
plt.figure(figsize=(10, 6))
plt.barh(importance["Feature"], importance["Importance"], color="steelblue")
plt.xlabel("Importance")
plt.title("Decision Tree Feature Importance")
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()
```

---

## Hyperparameters

Control tree complexity to prevent overfitting:

| Parameter | Description | Effect |
|-----------|-------------|--------|
| `max_depth` | Maximum tree depth | Lower = simpler, less overfit |
| `min_samples_split` | Min samples to split a node | Higher = simpler |
| `min_samples_leaf` | Min samples in a leaf | Higher = simpler |
| `max_features` | Max features per split | Lower = more randomness |
| `criterion` | Split quality measure | "gini" or "entropy" |
| `max_leaf_nodes` | Maximum leaf nodes | Limits tree size |

### Tuning with Grid Search

```python
from sklearn.model_selection import GridSearchCV

# Define parameter grid
param_grid = {
    "max_depth": [3, 5, 7, 10, None],
    "min_samples_split": [2, 5, 10, 20],
    "min_samples_leaf": [1, 2, 5, 10],
    "criterion": ["gini", "entropy"],
}

# Grid search
grid_search = GridSearchCV(
    DecisionTreeClassifier(random_state=42),
    param_grid,
    cv=5,
    scoring="accuracy",
    n_jobs=-1
)
grid_search.fit(X_train, y_train)

print(f"Best Parameters: {grid_search.best_params_}")
print(f"Best CV Score: {grid_search.best_score_:.4f}")
print(f"Test Score: {grid_search.score(X_test, y_test):.4f}")
```

---

## Overfitting and Depth

Decision trees are prone to **overfitting** — memorizing training data noise.

```python
import matplotlib.pyplot as plt
import numpy as np

# Compare different depths
train_scores = []
test_scores = []
depths = range(1, 20)

for depth in depths:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=42)
    tree.fit(X_train, y_train)
    train_scores.append(tree.score(X_train, y_train))
    test_scores.append(tree.score(X_test, y_test))

plt.figure(figsize=(10, 6))
plt.plot(depths, train_scores, "b-o", label="Training Accuracy")
plt.plot(depths, test_scores, "r-o", label="Test Accuracy")
plt.xlabel("Max Depth")
plt.ylabel("Accuracy")
plt.title("Decision Tree: Depth vs Accuracy")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()
```

> As depth increases, training accuracy goes to 1.0 but test accuracy may drop — classic overfitting!

---

## Pruning

Pruning reduces tree size to improve generalization.

### Pre-Pruning (Early Stopping)

Set constraints **before** building:
- `max_depth`, `min_samples_split`, `min_samples_leaf`

### Post-Pruning (Cost-Complexity Pruning)

Build a full tree, then prune branches that don't improve performance:

```python
from sklearn.tree import DecisionTreeClassifier
import matplotlib.pyplot as plt

# Train a full tree
full_tree = DecisionTreeClassifier(random_state=42)
full_tree.fit(X_train, y_train)

# Get cost-complexity pruning path
path = full_tree.cost_complexity_pruning_path(X_train, y_train)
ccp_alphas = path.ccp_alphas

# Train trees with different alpha values
trees = []
for alpha in ccp_alphas:
    tree = DecisionTreeClassifier(ccp_alpha=alpha, random_state=42)
    tree.fit(X_train, y_train)
    trees.append(tree)

# Plot accuracy vs alpha
train_acc = [t.score(X_train, y_train) for t in trees]
test_acc = [t.score(X_test, y_test) for t in trees]

plt.figure(figsize=(10, 6))
plt.plot(ccp_alphas, train_acc, "b-", label="Train", alpha=0.7)
plt.plot(ccp_alphas, test_acc, "r-", label="Test", alpha=0.7)
plt.xlabel("Cost-Complexity Alpha")
plt.ylabel("Accuracy")
plt.title("Cost-Complexity Pruning")
plt.legend()
plt.grid(True, alpha=0.3)
plt.show()

# Find best alpha
best_idx = np.argmax(test_acc)
best_alpha = ccp_alphas[best_idx]
print(f"Best alpha: {best_alpha:.6f}")
print(f"Best test accuracy: {test_acc[best_idx]:.4f}")
```

---

## Pros and Cons

| Pros | Cons |
|------|------|
| Highly interpretable (white-box) | Easily overfits |
| Handles non-linear relationships | Unstable (small data change → different tree) |
| No feature scaling needed | Biased toward features with many levels |
| Handles both numerical and categorical | Greedy algorithm (not globally optimal) |
| Fast training and prediction | High variance |

---

## Complete Example

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier, plot_tree, export_text
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
from sklearn.datasets import load_wine

# Load dataset
data = load_wine()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

print(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features, {len(data.target_names)} classes")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train with optimal parameters
best_tree = DecisionTreeClassifier(
    max_depth=4,
    min_samples_split=5,
    min_samples_leaf=3,
    criterion="entropy",
    random_state=42
)
best_tree.fit(X_train, y_train)

# Evaluate
y_pred = best_tree.predict(X_test)
print(f"\nAccuracy: {accuracy_score(y_test, y_pred):.4f}")
print(f"\n{classification_report(y_test, y_pred, target_names=data.target_names)}")

# Cross-validation
cv_scores = cross_val_score(best_tree, X, y, cv=5, scoring="accuracy")
print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# Feature importance
importance = pd.DataFrame({
    "Feature": data.feature_names,
    "Importance": best_tree.feature_importances_
}).sort_values("Importance", ascending=False)

# Visualize
fig, axes = plt.subplots(1, 2, figsize=(18, 6))

# Feature importance plot
axes[0].barh(importance["Feature"][:10], importance["Importance"][:10], color="steelblue")
axes[0].set_xlabel("Importance")
axes[0].set_title("Top 10 Feature Importance")
axes[0].invert_yaxis()

# Tree visualization
plot_tree(best_tree, feature_names=data.feature_names,
          class_names=data.target_names, filled=True,
          rounded=True, ax=axes[1], fontsize=7, max_depth=3)
axes[1].set_title("Decision Tree (depth ≤ 3)")

plt.tight_layout()
plt.show()

# Print tree rules (first few)
rules = export_text(best_tree, feature_names=list(data.feature_names))
print("\nTree Rules (first 20 lines):")
print("\n".join(rules.split("\n")[:20]))
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Split Criteria | Gini: $1 - \sum p_i^2$, Entropy: $-\sum p_i \log_2 p_i$ |
| Prediction | Classification: majority vote, Regression: mean |
| Overfitting | Control with max_depth, min_samples |
| Pruning | Pre-pruning (params) or post-pruning (ccp_alpha) |
| Strengths | Interpretable, no scaling, handles non-linear |
| Weakness | High variance, overfits easily |

Decision trees are the building blocks of powerful ensemble methods like **Random Forests** and **Gradient Boosting** — covered in the next lesson!
