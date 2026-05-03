---
title: Dimensionality Reduction
---

# Dimensionality Reduction

Dimensionality reduction transforms high-dimensional data into a lower-dimensional representation while preserving the most important information.

---

## The Curse of Dimensionality

As the number of features increases, problems emerge:

| Problem | Description |
|---------|-------------|
| Data sparsity | Points become far apart — need exponentially more data |
| Distance meaningless | In high dimensions, all distances become similar |
| Overfitting | Models memorize noise in sparse high-dimensional space |
| Computation | Training time grows with features |

```python
import numpy as np

# Demonstration: distance becomes meaningless in high dimensions
np.random.seed(42)

for d in [2, 10, 50, 100, 500, 1000]:
    points = np.random.rand(100, d)
    distances = np.linalg.norm(points[0] - points[1:], axis=1)
    ratio = distances.max() / distances.min()
    print(f"Dimensions={d:4d}: max/min distance ratio = {ratio:.4f}")
# Ratio approaches 1.0 as dimensions increase!
```

---

## Why Reduce Dimensions?

1. **Visualization** — project data to 2D or 3D for plotting
2. **Remove noise** — discard dimensions with mostly noise
3. **Remove redundancy** — correlated features carry duplicate info
4. **Speed up models** — fewer features = faster training
5. **Reduce overfitting** — simpler representations generalize better

---

## Feature Selection vs Feature Extraction

| Approach | What It Does | Example |
|----------|-------------|---------|
| **Feature Selection** | Choose a subset of original features | Drop columns with low variance |
| **Feature Extraction** | Create NEW features from combinations | PCA, t-SNE |

```python
# Feature Selection: remove low-variance features
from sklearn.feature_selection import VarianceThreshold

selector = VarianceThreshold(threshold=0.1)
X_selected = selector.fit_transform(X)
print(f"Features: {X.shape[1]} → {X_selected.shape[1]}")
```

---

## PCA (Principal Component Analysis)

PCA is the most widely used dimensionality reduction technique. It finds the directions (principal components) of **maximum variance** in the data.

### How PCA Works

```
1. Center the data (subtract mean)
2. Compute covariance matrix
3. Find eigenvectors and eigenvalues
4. Sort by eigenvalue (largest first)
5. Project data onto top-k eigenvectors
```

### The Math (Simplified)

Given data matrix $X$ (centered):

1. Covariance matrix: $C = \frac{1}{n-1} X^T X$
2. Eigendecomposition: $C v = \lambda v$
3. Eigenvalue $\lambda_i$ = variance explained by component $i$
4. Explained variance ratio: $\frac{\lambda_i}{\sum_j \lambda_j}$

### PCA in Scikit-Learn

```python
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.datasets import load_iris

# Load data
iris = load_iris()
X = iris.data
y = iris.target

# MUST scale before PCA!
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)

print(f"Original shape: {X.shape}")       # (150, 4)
print(f"Reduced shape: {X_pca.shape}")     # (150, 2)
print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Total variance explained: {sum(pca.explained_variance_ratio_):.4f}")
```

### Choosing the Number of Components

#### Method 1: Variance Threshold

```python
# Keep components that explain 95% of variance
pca_95 = PCA(n_components=0.95)
X_reduced = pca_95.fit_transform(X_scaled)
print(f"Components needed for 95% variance: {pca_95.n_components_}")
```

#### Method 2: Scree Plot

```python
import matplotlib.pyplot as plt

# Fit PCA with all components
pca_full = PCA()
pca_full.fit(X_scaled)

# Scree plot
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# Individual variance
ax1.bar(range(1, len(pca_full.explained_variance_ratio_) + 1),
        pca_full.explained_variance_ratio_)
ax1.set_xlabel('Principal Component')
ax1.set_ylabel('Explained Variance Ratio')
ax1.set_title('Scree Plot')

# Cumulative variance
cumulative = np.cumsum(pca_full.explained_variance_ratio_)
ax2.plot(range(1, len(cumulative) + 1), cumulative, 'ro-')
ax2.axhline(y=0.95, color='g', linestyle='--', label='95% threshold')
ax2.set_xlabel('Number of Components')
ax2.set_ylabel('Cumulative Explained Variance')
ax2.set_title('Cumulative Variance')
ax2.legend()

plt.tight_layout()
plt.show()
```

### Important PCA Rules

> **Always scale before PCA!** PCA finds directions of maximum variance. Without scaling, features with larger ranges dominate.

```python
# WRONG: PCA without scaling
pca_wrong = PCA(n_components=2)
X_wrong = pca_wrong.fit_transform(X)  # Unscaled!

# CORRECT: Scale first, then PCA
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
pca_correct = PCA(n_components=2)
X_correct = pca_correct.fit_transform(X_scaled)
```

### PCA for Preprocessing

```python
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

# PCA as preprocessing step
pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=0.95)),
    ('clf', LogisticRegression(max_iter=1000))
])

scores = cross_val_score(pipeline, X, y, cv=5)
print(f"Accuracy with PCA: {scores.mean():.4f} (+/- {scores.std():.4f})")
```

---

## t-SNE (t-distributed Stochastic Neighbor Embedding)

t-SNE is a **non-linear** dimensionality reduction technique designed specifically for **visualization**.

### How t-SNE Works (Intuition)

1. Compute pairwise similarities in high-dimensional space (Gaussian)
2. Compute pairwise similarities in low-dimensional space (t-distribution)
3. Minimize the difference (KL divergence) between the two

It preserves **local structure** — nearby points stay nearby.

### t-SNE in Scikit-Learn

```python
from sklearn.manifold import TSNE

# t-SNE for visualization (2D)
tsne = TSNE(
    n_components=2,       # Usually 2 or 3
    perplexity=30,        # Balance local/global structure (5-50)
    random_state=42,
    n_iter=1000,          # Number of optimization steps
    learning_rate='auto'
)

X_tsne = tsne.fit_transform(X_scaled)

# Visualize
plt.figure(figsize=(10, 8))
scatter = plt.scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.colorbar(scatter)
plt.title('t-SNE Visualization of Iris Dataset')
plt.xlabel('t-SNE Component 1')
plt.ylabel('t-SNE Component 2')
plt.show()
```

### Perplexity Parameter

Perplexity controls the balance between local and global structure:

| Perplexity | Effect |
|-----------|--------|
| Low (5-10) | Focus on very local structure, tight clusters |
| Medium (30) | Good balance (default) |
| High (50+) | More global structure, broader clusters |

```python
# Compare different perplexity values
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

for i, perp in enumerate([5, 30, 100]):
    tsne = TSNE(n_components=2, perplexity=perp, random_state=42)
    X_embedded = tsne.fit_transform(X_scaled)
    axes[i].scatter(X_embedded[:, 0], X_embedded[:, 1], c=y, cmap='viridis', alpha=0.7)
    axes[i].set_title(f'Perplexity = {perp}')

plt.tight_layout()
plt.show()
```

### t-SNE Limitations

- **Not for preprocessing** — results are non-deterministic, no `transform()` for new data
- **Slow** for large datasets ($O(n^2)$)
- **Distances in the plot are not meaningful** globally
- Only for **visualization** (2D/3D), not for ML pipelines
- Different runs give different results

---

## UMAP (Uniform Manifold Approximation and Projection)

UMAP is a newer technique that is **faster** than t-SNE and preserves **global structure** better.

```python
# Install: pip install umap-learn
import umap

# UMAP for visualization
reducer = umap.UMAP(
    n_components=2,
    n_neighbors=15,     # Similar to perplexity
    min_dist=0.1,       # How tightly to pack points
    random_state=42
)

X_umap = reducer.fit_transform(X_scaled)

plt.figure(figsize=(10, 8))
plt.scatter(X_umap[:, 0], X_umap[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.title('UMAP Visualization')
plt.xlabel('UMAP 1')
plt.ylabel('UMAP 2')
plt.colorbar()
plt.show()
```

### UMAP vs t-SNE

| Feature | t-SNE | UMAP |
|---------|-------|------|
| Speed | Slow ($O(n^2)$) | Fast ($O(n \log n)$) |
| Global structure | Poor | Better preserved |
| New data | No `transform()` | Has `transform()` |
| Deterministic | No | More consistent |
| Use case | Small datasets | Large datasets |

---

## LDA (Linear Discriminant Analysis)

LDA is a **supervised** dimensionality reduction technique. It finds directions that maximize class separation.

```python
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

# LDA requires labels (supervised)
lda = LinearDiscriminantAnalysis(n_components=2)
X_lda = lda.fit_transform(X_scaled, y)

plt.figure(figsize=(10, 8))
plt.scatter(X_lda[:, 0], X_lda[:, 1], c=y, cmap='viridis', alpha=0.7)
plt.title('LDA: Maximizes Class Separation')
plt.xlabel('LD1')
plt.ylabel('LD2')
plt.colorbar()
plt.show()

# LDA can also classify
lda_clf = LinearDiscriminantAnalysis()
lda_clf.fit(X_scaled, y)
print(f"LDA classification accuracy: {lda_clf.score(X_scaled, y):.4f}")
```

### PCA vs LDA

| | PCA | LDA |
|--|-----|-----|
| Type | Unsupervised | Supervised |
| Goal | Max variance | Max class separation |
| Max components | min(n_features, n_samples) | n_classes - 1 |
| Labels needed? | No | Yes |

---

## Truncated SVD (for Sparse Data)

PCA requires centering data, which destroys sparsity. Use Truncated SVD for sparse matrices (e.g., TF-IDF text data).

```python
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer

# Example with text data
documents = [
    "machine learning is great",
    "deep learning uses neural networks",
    "natural language processing with python",
    "computer vision and image recognition"
]

# TF-IDF creates sparse matrix
tfidf = TfidfVectorizer()
X_sparse = tfidf.fit_transform(documents)

# Truncated SVD works with sparse data
svd = TruncatedSVD(n_components=2, random_state=42)
X_reduced = svd.fit_transform(X_sparse)

print(f"Original: {X_sparse.shape} → Reduced: {X_reduced.shape}")
print(f"Explained variance: {svd.explained_variance_ratio_.sum():.4f}")
```

---

## Complete Example: PCA + t-SNE on Digits

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

# Load handwritten digits (8x8 pixels = 64 features)
digits = load_digits()
X = digits.data
y = digits.target

print(f"Shape: {X.shape}")  # (1797, 64)
print(f"Classes: {len(np.unique(y))}")  # 10 digits

# Scale
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# --- PCA ---
pca = PCA()
pca.fit(X_scaled)

# Scree plot
cumulative = np.cumsum(pca.explained_variance_ratio_)
n_95 = np.argmax(cumulative >= 0.95) + 1
print(f"\nComponents for 95% variance: {n_95}")

plt.figure(figsize=(10, 5))
plt.plot(range(1, len(cumulative) + 1), cumulative, 'b-')
plt.axhline(y=0.95, color='r', linestyle='--')
plt.axvline(x=n_95, color='g', linestyle='--')
plt.xlabel('Number of Components')
plt.ylabel('Cumulative Explained Variance')
plt.title(f'PCA: {n_95} components explain 95% variance (from 64)')
plt.grid(True)
plt.show()

# PCA to 2D
pca_2d = PCA(n_components=2)
X_pca = pca_2d.fit_transform(X_scaled)

# --- t-SNE ---
tsne = TSNE(n_components=2, perplexity=30, random_state=42)
X_tsne = tsne.fit_transform(X_scaled)

# --- Compare visualizations ---
fig, axes = plt.subplots(1, 2, figsize=(16, 7))

scatter1 = axes[0].scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap='tab10',
                           alpha=0.6, s=10)
axes[0].set_title(f'PCA (explains {pca_2d.explained_variance_ratio_.sum():.1%})')
axes[0].set_xlabel('PC1')
axes[0].set_ylabel('PC2')

scatter2 = axes[1].scatter(X_tsne[:, 0], X_tsne[:, 1], c=y, cmap='tab10',
                           alpha=0.6, s=10)
axes[1].set_title('t-SNE')
axes[1].set_xlabel('t-SNE 1')
axes[1].set_ylabel('t-SNE 2')

plt.colorbar(scatter2, ax=axes[1])
plt.tight_layout()
plt.show()

print("\nNotice: t-SNE separates digit clusters much better for visualization!")
print("But PCA is better for preprocessing (linear, deterministic, invertible)")
```

---

## When to Use What

| Method | Best For | As Preprocessing? |
|--------|----------|-------------------|
| **PCA** | General reduction, linear data | Yes |
| **t-SNE** | Visualizing clusters (2D/3D) | No |
| **UMAP** | Large-scale visualization | Sometimes |
| **LDA** | Supervised reduction | Yes |
| **Truncated SVD** | Sparse/text data | Yes |

---

## Try It Yourself

1. Load the Digits dataset and apply PCA — how many components for 90% variance?
2. Compare PCA and t-SNE visualizations on the Wine dataset
3. Build a pipeline: StandardScaler → PCA(0.95) → LogisticRegression. Compare accuracy with and without PCA
4. Try different t-SNE perplexities on the same data and observe the effect

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Curse of dimensionality | More features → distances become meaningless |
| PCA | Linear, finds max variance directions, scale first |
| Explained variance | Choose components that capture 95%+ variance |
| t-SNE | Non-linear, visualization only, not for preprocessing |
| UMAP | Faster than t-SNE, preserves global structure |
| LDA | Supervised, maximizes class separation |
| Feature scaling | Always scale before PCA/t-SNE/UMAP |
