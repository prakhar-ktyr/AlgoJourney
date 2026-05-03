---
title: Clustering
---

# Clustering

Clustering is an **unsupervised learning** technique that groups similar data points together without labeled outcomes. The algorithm discovers natural groupings in the data.

---

## What Is Clustering?

Unlike classification (where labels are given), clustering finds structure in unlabeled data.

| Supervised (Classification) | Unsupervised (Clustering) |
|----------------------------|--------------------------|
| Labels provided | No labels |
| Learn decision boundary | Discover groups |
| "Predict this class" | "What groups exist?" |

### Real-World Applications

- **Customer segmentation** — group customers by behavior for targeted marketing
- **Anomaly detection** — identify unusual patterns (fraud, network intrusion)
- **Image compression** — reduce colors by grouping similar pixels
- **Document clustering** — organize articles by topic
- **Gene expression** — group genes with similar activity patterns

---

## K-Means Clustering

K-Means is the most popular clustering algorithm. It partitions data into **k** clusters by minimizing within-cluster variance.

### How K-Means Works

```
1. Choose k (number of clusters)
2. Randomly initialize k centroids
3. REPEAT until convergence:
   a. ASSIGN each point to nearest centroid
   b. UPDATE centroids = mean of assigned points
```

### The Objective Function

K-Means minimizes the **Within-Cluster Sum of Squares (WCSS)**:

$$J = \sum_{i=1}^{k}\sum_{x \in C_i} ||x - \mu_i||^2$$

Where $\mu_i$ is the centroid of cluster $C_i$.

### Basic K-Means in Scikit-Learn

```python
from sklearn.cluster import KMeans
import numpy as np

# Create sample data
from sklearn.datasets import make_blobs
X, y_true = make_blobs(n_samples=300, centers=4, random_state=42)

# Fit K-Means
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
kmeans.fit(X)

# Results
print(f"Cluster labels: {kmeans.labels_[:10]}")
print(f"Centroids:\n{kmeans.cluster_centers_}")
print(f"Inertia (WCSS): {kmeans.inertia_:.2f}")

# Predict cluster for new data
new_points = np.array([[0, 0], [5, 5]])
predictions = kmeans.predict(new_points)
print(f"New point clusters: {predictions}")
```

### Choosing k: Elbow Method

```python
import matplotlib.pyplot as plt

inertias = []
k_range = range(1, 11)

for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X)
    inertias.append(km.inertia_)

# Plot the elbow
plt.figure(figsize=(10, 6))
plt.plot(k_range, inertias, 'bo-')
plt.xlabel('Number of Clusters (k)')
plt.ylabel('Inertia (WCSS)')
plt.title('Elbow Method for Optimal k')
plt.grid(True)
plt.show()
# Look for the "elbow" where inertia drops sharply then levels off
```

### Choosing k: Silhouette Score

The silhouette score measures how similar a point is to its own cluster vs other clusters:

$$s = \frac{b - a}{\max(a, b)}$$

Where:
- $a$ = average distance to points in same cluster
- $b$ = average distance to points in nearest other cluster
- Score ranges from -1 (wrong cluster) to +1 (well-clustered)

```python
from sklearn.metrics import silhouette_score

sil_scores = []
k_range = range(2, 11)  # Silhouette needs at least 2 clusters

for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    score = silhouette_score(X, labels)
    sil_scores.append(score)
    print(f"k={k}: Silhouette Score = {score:.4f}")

# Best k has highest silhouette score
best_k = k_range[sil_scores.index(max(sil_scores))]
print(f"\nBest k = {best_k}")
```

### K-Means Limitations

- Assumes **spherical**, equal-size clusters
- Sensitive to **initialization** (use k-means++ or multiple runs)
- Must specify **k** in advance
- Sensitive to **outliers**
- Doesn't work well with non-convex shapes

> **Note:** Scikit-Learn uses **k-means++** initialization by default (`init='k-means++'`), which chooses initial centroids to be far apart. This usually converges faster and avoids poor results.

---

## DBSCAN (Density-Based Clustering)

DBSCAN groups points that are closely packed together, marking points in low-density regions as outliers.

### Core Concepts

| Point Type | Definition |
|-----------|------------|
| **Core point** | Has at least `min_samples` points within `eps` radius |
| **Border point** | Within `eps` of a core point, but not core itself |
| **Noise point** | Neither core nor border — an outlier |

### How DBSCAN Works

```
1. For each point, count neighbors within eps radius
2. If count >= min_samples → mark as CORE point
3. Connect core points that are within eps of each other
4. Each connected group of core points = one cluster
5. Assign border points to nearest cluster
6. Remaining points = NOISE (label = -1)
```

### DBSCAN in Scikit-Learn

```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler

# Scale data first (DBSCAN uses distances)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Fit DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
labels = dbscan.fit_predict(X_scaled)

# Analyze results
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"Clusters found: {n_clusters}")
print(f"Noise points: {n_noise}")
print(f"Unique labels: {set(labels)}")  # -1 = noise
```

### Choosing eps and min_samples

```python
from sklearn.neighbors import NearestNeighbors

# Use k-distance plot to find eps
k = 5  # Same as min_samples
nn = NearestNeighbors(n_neighbors=k)
nn.fit(X_scaled)
distances, _ = nn.kneighbors(X_scaled)

# Sort distances to k-th nearest neighbor
k_distances = np.sort(distances[:, k-1])

plt.figure(figsize=(10, 6))
plt.plot(k_distances)
plt.xlabel('Points (sorted)')
plt.ylabel(f'Distance to {k}th Nearest Neighbor')
plt.title('k-Distance Plot (look for the elbow)')
plt.grid(True)
plt.show()
# The elbow point suggests a good eps value
```

### DBSCAN Advantages

- **No need to specify k** — finds number of clusters automatically
- **Finds arbitrary shapes** — not limited to spherical clusters
- **Handles outliers** — labels noise points as -1
- **Robust** to outliers

### DBSCAN Disadvantages

- Sensitive to `eps` and `min_samples` parameters
- Struggles with clusters of **varying density**
- Not great for high-dimensional data

---

## Hierarchical Clustering

Hierarchical clustering builds a tree of clusters. **Agglomerative** (bottom-up) is most common.

### How Agglomerative Clustering Works

```
1. Start: each point is its own cluster
2. Find the two closest clusters
3. Merge them into one cluster
4. Repeat steps 2-3 until one cluster remains
5. Cut the tree (dendrogram) at desired level
```

### Linkage Methods

| Linkage | Distance Between Clusters |
|---------|--------------------------|
| **Single** | Minimum distance between any two points |
| **Complete** | Maximum distance between any two points |
| **Average** | Average distance between all pairs |
| **Ward** | Minimizes increase in total variance (default) |

### Scikit-Learn Implementation

```python
from sklearn.cluster import AgglomerativeClustering

# Agglomerative clustering
agg = AgglomerativeClustering(
    n_clusters=3,
    linkage='ward'  # 'single', 'complete', 'average', 'ward'
)
labels = agg.fit_predict(X_scaled)

print(f"Cluster sizes: {np.bincount(labels)}")
```

### Dendrogram Visualization

```python
from scipy.cluster.hierarchy import dendrogram, linkage

# Compute linkage matrix
Z = linkage(X_scaled, method='ward')

# Plot dendrogram
plt.figure(figsize=(12, 6))
dendrogram(Z, truncate_mode='level', p=5)
plt.xlabel('Sample Index')
plt.ylabel('Distance')
plt.title('Hierarchical Clustering Dendrogram')
plt.axhline(y=7, color='r', linestyle='--', label='Cut here for 3 clusters')
plt.legend()
plt.show()
```

### When to Use Hierarchical Clustering

- You want to explore **different numbers of clusters** without re-running
- The dendrogram provides insight into data structure
- Dataset is small-medium (< 10k samples — $O(n^3)$ complexity)

---

## Cluster Evaluation

### Without Ground Truth Labels

```python
from sklearn.metrics import silhouette_score, calinski_harabasz_score

# Silhouette score (-1 to 1, higher is better)
sil = silhouette_score(X_scaled, labels)
print(f"Silhouette Score: {sil:.4f}")

# Calinski-Harabasz Index (higher is better)
ch = calinski_harabasz_score(X_scaled, labels)
print(f"Calinski-Harabasz Index: {ch:.4f}")
```

### With Ground Truth Labels

```python
from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score

# Adjusted Rand Index (0 = random, 1 = perfect)
ari = adjusted_rand_score(y_true, labels)
print(f"Adjusted Rand Index: {ari:.4f}")

# Normalized Mutual Information (0 to 1)
nmi = normalized_mutual_info_score(y_true, labels)
print(f"NMI: {nmi:.4f}")
```

---

## Complete Example: Customer Segmentation

```python
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# Simulate customer data
np.random.seed(42)
n_customers = 500

data = pd.DataFrame({
    'annual_income': np.concatenate([
        np.random.normal(30000, 5000, 150),
        np.random.normal(60000, 10000, 200),
        np.random.normal(100000, 15000, 150)
    ]),
    'spending_score': np.concatenate([
        np.random.normal(20, 10, 150),
        np.random.normal(50, 15, 200),
        np.random.normal(80, 10, 150)
    ]),
    'age': np.concatenate([
        np.random.normal(45, 10, 150),
        np.random.normal(35, 8, 200),
        np.random.normal(28, 5, 150)
    ])
})

print("Customer Data Sample:")
print(data.describe())

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(data)

# --- K-Means ---
# Find optimal k
inertias = []
sil_scores = []
for k in range(2, 9):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X_scaled)
    inertias.append(km.inertia_)
    sil_scores.append(silhouette_score(X_scaled, labels))

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
ax1.plot(range(2, 9), inertias, 'bo-')
ax1.set_title('Elbow Method')
ax1.set_xlabel('k')
ax1.set_ylabel('Inertia')

ax2.plot(range(2, 9), sil_scores, 'ro-')
ax2.set_title('Silhouette Scores')
ax2.set_xlabel('k')
ax2.set_ylabel('Score')
plt.tight_layout()
plt.show()

# Final K-Means with k=3
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
data['kmeans_cluster'] = kmeans.fit_predict(X_scaled)

print("\nK-Means Cluster Profiles:")
print(data.groupby('kmeans_cluster').mean().round(0))

# --- DBSCAN ---
dbscan = DBSCAN(eps=0.6, min_samples=10)
data['dbscan_cluster'] = dbscan.fit_predict(X_scaled)

n_clusters = len(set(data['dbscan_cluster'])) - 1
n_noise = (data['dbscan_cluster'] == -1).sum()
print(f"\nDBSCAN: {n_clusters} clusters, {n_noise} noise points")

# --- Dendrogram ---
Z = linkage(X_scaled[:100], method='ward')  # Subset for readability
plt.figure(figsize=(12, 6))
dendrogram(Z, truncate_mode='level', p=4)
plt.title('Customer Dendrogram (first 100 samples)')
plt.xlabel('Sample')
plt.ylabel('Distance')
plt.show()

# --- Visualization ---
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

scatter1 = axes[0].scatter(
    data['annual_income'], data['spending_score'],
    c=data['kmeans_cluster'], cmap='viridis', alpha=0.6
)
axes[0].set_title('K-Means Clusters')
axes[0].set_xlabel('Annual Income')
axes[0].set_ylabel('Spending Score')

scatter2 = axes[1].scatter(
    data['annual_income'], data['spending_score'],
    c=data['dbscan_cluster'], cmap='viridis', alpha=0.6
)
axes[1].set_title('DBSCAN Clusters')
axes[1].set_xlabel('Annual Income')
axes[1].set_ylabel('Spending Score')

plt.tight_layout()
plt.show()
```

---

## Comparing Clustering Algorithms

| Algorithm | Best For | Cluster Shape | Outliers | Scalability |
|-----------|----------|---------------|----------|-------------|
| K-Means | Spherical, equal-size clusters | Spherical | Sensitive | Large datasets |
| DBSCAN | Arbitrary shapes, outlier detection | Any shape | Robust | Medium datasets |
| Hierarchical | Exploring cluster hierarchy | Any shape | Somewhat | Small datasets |

---

## Try It Yourself

1. Load the Iris dataset and cluster it with K-Means (k=3). Compare with true labels using ARI
2. Generate moon-shaped data (`make_moons`) and compare K-Means vs DBSCAN
3. Create a dendrogram for the Wine dataset and decide where to cut
4. Use silhouette analysis to compare different k values on real data

---

## Summary

| Concept | Key Point |
|---------|-----------|
| K-Means | Partition into k clusters by minimizing WCSS |
| Elbow Method | Plot inertia vs k, look for the bend |
| Silhouette | Measures cluster quality (-1 to +1) |
| DBSCAN | Density-based, finds arbitrary shapes + outliers |
| Hierarchical | Bottom-up merging, visualize with dendrogram |
| Scaling | Always scale features before distance-based clustering |
