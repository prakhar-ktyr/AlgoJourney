---
title: Text Clustering
---

# Text Clustering

Text clustering groups documents into **meaningful categories** without any labeled data. It's an unsupervised technique that discovers natural groupings in your text collection.

---

## What Is Text Clustering?

Given a set of documents, clustering finds groups of similar documents:

```
Document Collection
├── Cluster 1: Sports articles
├── Cluster 2: Technology news
├── Cluster 3: Health & medicine
└── Cluster 4: Politics
```

Unlike classification (supervised), clustering doesn't need predefined labels — it **discovers** the structure in your data.

---

## Clustering vs Classification

| Feature | Clustering | Classification |
|---------|-----------|---------------|
| **Labels needed?** | No (unsupervised) | Yes (supervised) |
| **Categories** | Discovered automatically | Predefined |
| **Use case** | Exploration, organization | Prediction |
| **Ground truth** | Not required | Required for training |

---

## The Clustering Pipeline

1. **Preprocess** text (clean, tokenize)
2. **Vectorize** text (TF-IDF, embeddings)
3. **Apply** clustering algorithm
4. **Evaluate** and interpret clusters
5. **Label** clusters (optionally, with human review)

---

## K-Means Clustering with TF-IDF

**K-Means** is the most common clustering algorithm. It partitions data into $K$ clusters by minimizing the distance between points and their cluster **centroid**.

### How K-Means Works

1. **Initialize** $K$ random cluster centers (centroids)
2. **Assign** each document to the nearest centroid
3. **Update** centroids to the mean of assigned documents
4. **Repeat** steps 2–3 until convergence

The objective function minimized:

$$J = \sum_{k=1}^{K} \sum_{x_i \in C_k} \|x_i - \mu_k\|^2$$

Where $\mu_k$ is the centroid of cluster $C_k$.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

# Document collection
documents = [
    # Technology
    "Python programming language is widely used for machine learning",
    "JavaScript frameworks like React and Vue dominate web development",
    "Cloud computing services from AWS and Azure enable scalable applications",
    "Artificial intelligence is transforming how we build software",
    "The new smartphone features a faster processor and better camera",
    # Sports
    "The football team won the championship game in overtime",
    "Tennis player won her third Grand Slam title this year",
    "Basketball playoffs begin next week with eight teams competing",
    "Olympic swimmer broke the world record in the 100m freestyle",
    "The soccer club signed a new striker for 50 million dollars",
    # Health
    "New vaccine shows 95 percent effectiveness in clinical trials",
    "Regular exercise reduces the risk of heart disease significantly",
    "Researchers discovered a promising treatment for diabetes",
    "Mental health awareness campaigns are gaining widespread support",
    "A healthy diet includes plenty of fruits and vegetables daily",
    # Finance
    "Stock market indices reached all time highs this quarter",
    "The central bank raised interest rates to combat inflation",
    "Cryptocurrency prices experienced significant volatility recently",
    "New regulations aim to improve transparency in banking sector",
    "Investors are moving capital into renewable energy companies",
]

# Step 1: Vectorize with TF-IDF
vectorizer = TfidfVectorizer(
    max_features=1000,
    stop_words="english",
    ngram_range=(1, 2),
    max_df=0.85,
)
tfidf_matrix = vectorizer.fit_transform(documents)

print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")
print(f"  {tfidf_matrix.shape[0]} documents × {tfidf_matrix.shape[1]} features")

# Step 2: Apply K-Means
num_clusters = 4
kmeans = KMeans(
    n_clusters=num_clusters,
    random_state=42,
    n_init=10,       # Run 10 times with different seeds
    max_iter=300,
)
clusters = kmeans.fit_predict(tfidf_matrix)

# Step 3: Display results
print(f"\nClustering Results ({num_clusters} clusters):")
print("=" * 60)

for cluster_id in range(num_clusters):
    cluster_docs = [documents[i] for i, c in enumerate(clusters) if c == cluster_id]
    print(f"\n--- Cluster {cluster_id} ({len(cluster_docs)} documents) ---")
    for doc in cluster_docs:
        print(f"  • {doc[:65]}...")

# Step 4: Show top terms per cluster
print("\n\nTop terms per cluster:")
print("-" * 40)
feature_names = vectorizer.get_feature_names_out()
order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]

for cluster_id in range(num_clusters):
    top_terms = [feature_names[idx] for idx in order_centroids[cluster_id, :8]]
    print(f"  Cluster {cluster_id}: {', '.join(top_terms)}")
```

---

## Choosing K: The Elbow Method

How many clusters should you use? The **elbow method** plots inertia (within-cluster sum of squares) vs. $K$:

```python
from sklearn.cluster import KMeans
import numpy as np

# Try different values of K
K_range = range(2, 10)
inertias = []
silhouette_scores = []

for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(tfidf_matrix)
    inertias.append(km.inertia_)

    # Silhouette score (higher is better, range: -1 to 1)
    sil_score = silhouette_score(tfidf_matrix, km.labels_)
    silhouette_scores.append(sil_score)

# Display results
print("K   | Inertia  | Silhouette Score")
print("-" * 40)
for k, inertia, sil in zip(K_range, inertias, silhouette_scores):
    bar = "█" * int(sil * 30)
    print(f"  {k} | {inertia:8.2f} | {sil:.4f} {bar}")

# Find optimal K by silhouette score
optimal_k = list(K_range)[np.argmax(silhouette_scores)]
print(f"\nOptimal K (by silhouette): {optimal_k}")
print(f"Best silhouette score: {max(silhouette_scores):.4f}")
```

### Interpreting Silhouette Score

The **silhouette score** measures how similar an object is to its own cluster compared to other clusters:

$$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$$

Where:
- $a(i)$ = average distance to other points in the same cluster
- $b(i)$ = average distance to points in the nearest other cluster

| Score Range | Interpretation |
|-------------|---------------|
| 0.7 – 1.0 | Strong cluster structure |
| 0.5 – 0.7 | Reasonable structure |
| 0.25 – 0.5 | Weak structure, possibly overlapping |
| < 0.25 | No substantial structure |

---

## Silhouette Analysis Per Cluster

```python
from sklearn.metrics import silhouette_samples
import numpy as np

# Get per-sample silhouette scores
km = KMeans(n_clusters=4, random_state=42, n_init=10)
labels = km.fit_predict(tfidf_matrix)
sample_silhouette = silhouette_samples(tfidf_matrix, labels)

print("Per-Cluster Silhouette Analysis:")
print("=" * 50)

for cluster_id in range(4):
    cluster_scores = sample_silhouette[labels == cluster_id]
    cluster_size = len(cluster_scores)
    avg_score = cluster_scores.mean()

    print(f"\n  Cluster {cluster_id}:")
    print(f"    Size: {cluster_size} documents")
    print(f"    Avg silhouette: {avg_score:.4f}")
    print(f"    Min silhouette: {cluster_scores.min():.4f}")
    print(f"    Max silhouette: {cluster_scores.max():.4f}")

    # Flag potentially misassigned documents
    misassigned = np.sum(cluster_scores < 0)
    if misassigned > 0:
        print(f"    ⚠ {misassigned} potentially misassigned documents")

overall = silhouette_score(tfidf_matrix, labels)
print(f"\nOverall silhouette score: {overall:.4f}")
```

---

## Hierarchical Clustering

**Hierarchical clustering** builds a tree (dendrogram) of nested clusters. No need to specify $K$ in advance.

### Agglomerative (Bottom-Up)

1. Start with each document as its own cluster
2. Merge the two closest clusters
3. Repeat until one cluster remains
4. Cut the dendrogram at desired level

```python
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.spatial.distance import pdist
import numpy as np

# Convert sparse matrix to dense for hierarchical clustering
tfidf_dense = tfidf_matrix.toarray()

# Compute linkage matrix
linkage_matrix = linkage(tfidf_dense, method="ward", metric="euclidean")

# Apply agglomerative clustering
agg_clustering = AgglomerativeClustering(
    n_clusters=4,
    metric="euclidean",
    linkage="ward",
)
agg_labels = agg_clustering.fit_predict(tfidf_dense)

# Compare with K-Means
from sklearn.metrics import adjusted_rand_score

ari = adjusted_rand_score(clusters, agg_labels)
print(f"Agreement between K-Means and Hierarchical: {ari:.3f}")
print(f"  (1.0 = perfect agreement, 0.0 = random)")

# Show hierarchical clusters
print("\nHierarchical Clustering Results:")
print("=" * 60)
for cluster_id in range(4):
    docs = [documents[i] for i, c in enumerate(agg_labels) if c == cluster_id]
    print(f"\n  Cluster {cluster_id} ({len(docs)} docs):")
    for doc in docs[:3]:
        print(f"    • {doc[:60]}...")

# Print dendrogram info (text-based)
print("\n\nDendrogram Merge History (last 5 merges):")
print("-" * 50)
n = len(documents)
for i, (c1, c2, dist, count) in enumerate(linkage_matrix[-5:]):
    print(f"  Step {n - 5 + i}: Merge clusters {int(c1)} + {int(c2)} "
          f"(distance: {dist:.3f}, size: {int(count)})")
```

---

## DBSCAN for Variable-Density Clusters

**DBSCAN** (Density-Based Spatial Clustering) finds clusters of arbitrary shape and automatically identifies **outliers**:

```python
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import normalize

# Normalize TF-IDF vectors (important for DBSCAN with cosine-like behavior)
tfidf_normalized = normalize(tfidf_matrix)

# DBSCAN parameters:
# eps: maximum distance between two points to be considered neighbors
# min_samples: minimum points to form a dense region (cluster)
dbscan = DBSCAN(
    eps=0.7,
    min_samples=2,
    metric="cosine",
)
dbscan_labels = dbscan.fit_predict(tfidf_normalized)

# Results
n_clusters = len(set(dbscan_labels)) - (1 if -1 in dbscan_labels else 0)
n_noise = list(dbscan_labels).count(-1)

print("DBSCAN Results:")
print(f"  Clusters found: {n_clusters}")
print(f"  Noise points (outliers): {n_noise}")
print(f"  Total documents: {len(documents)}")

# Show clusters
for cluster_id in sorted(set(dbscan_labels)):
    docs = [documents[i] for i, c in enumerate(dbscan_labels) if c == cluster_id]
    label = "NOISE/OUTLIER" if cluster_id == -1 else f"Cluster {cluster_id}"
    print(f"\n  {label} ({len(docs)} docs):")
    for doc in docs:
        print(f"    • {doc[:60]}...")
```

### When to Use DBSCAN

| Feature | K-Means | DBSCAN |
|---------|---------|--------|
| **Cluster shape** | Spherical | Arbitrary |
| **Number of clusters** | Must specify K | Automatic |
| **Outlier detection** | No | Yes (labels as -1) |
| **Cluster sizes** | Tends toward equal | Variable |
| **Parameters** | K | eps, min_samples |

---

## Evaluating Clusters

### Internal Metrics (No Ground Truth)

```python
from sklearn.metrics import (
    silhouette_score,
    calinski_harabasz_score,
    davies_bouldin_score,
)

# Apply K-Means with optimal K
km_final = KMeans(n_clusters=4, random_state=42, n_init=10)
final_labels = km_final.fit_predict(tfidf_matrix)

# Silhouette Score (higher is better, -1 to 1)
sil = silhouette_score(tfidf_matrix, final_labels)

# Calinski-Harabasz Index (higher is better)
ch = calinski_harabasz_score(tfidf_matrix.toarray(), final_labels)

# Davies-Bouldin Index (lower is better)
db = davies_bouldin_score(tfidf_matrix.toarray(), final_labels)

print("Cluster Evaluation Metrics:")
print("=" * 40)
print(f"  Silhouette Score:      {sil:.4f}  (higher = better)")
print(f"  Calinski-Harabasz:     {ch:.2f}  (higher = better)")
print(f"  Davies-Bouldin:        {db:.4f}  (lower = better)")
```

### External Metrics (With Ground Truth)

When you have true labels to compare against:

```python
from sklearn.metrics import (
    adjusted_rand_score,
    normalized_mutual_info_score,
    homogeneity_score,
    completeness_score,
    v_measure_score,
)

# True labels for our example
true_labels = (
    ["tech"] * 5 + ["sports"] * 5 + ["health"] * 5 + ["finance"] * 5
)

# Convert to numeric
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
true_numeric = le.fit_transform(true_labels)

print("External Evaluation (vs ground truth):")
print("=" * 50)
print(f"  Adjusted Rand Index:     {adjusted_rand_score(true_numeric, final_labels):.4f}")
print(f"  Normalized MI:           {normalized_mutual_info_score(true_numeric, final_labels):.4f}")
print(f"  Homogeneity:             {homogeneity_score(true_numeric, final_labels):.4f}")
print(f"  Completeness:            {completeness_score(true_numeric, final_labels):.4f}")
print(f"  V-Measure:               {v_measure_score(true_numeric, final_labels):.4f}")
```

---

## Complete Pipeline: Document Clustering System

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import silhouette_score
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import normalize
from collections import Counter
import numpy as np
import re


class TextClusterer:
    """Complete text clustering pipeline."""

    def __init__(self, max_features=5000, n_clusters=None):
        self.max_features = max_features
        self.n_clusters = n_clusters
        self.vectorizer = None
        self.model = None
        self.labels_ = None
        self.tfidf_matrix = None

    def preprocess(self, texts):
        """Clean text for clustering."""
        cleaned = []
        for text in texts:
            text = text.lower()
            text = re.sub(r"http\S+|www\S+", "", text)
            text = re.sub(r"[^\w\s]", " ", text)
            text = re.sub(r"\d+", "", text)
            text = re.sub(r"\s+", " ", text).strip()
            cleaned.append(text)
        return cleaned

    def vectorize(self, texts):
        """Convert texts to TF-IDF vectors."""
        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            stop_words="english",
            ngram_range=(1, 2),
            max_df=0.85,
            min_df=2,
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        return self.tfidf_matrix

    def find_optimal_k(self, max_k=10):
        """Find optimal number of clusters using silhouette score."""
        scores = {}
        for k in range(2, min(max_k + 1, self.tfidf_matrix.shape[0])):
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = km.fit_predict(self.tfidf_matrix)
            scores[k] = silhouette_score(self.tfidf_matrix, labels)

        self.n_clusters = max(scores, key=scores.get)
        print(f"Optimal K: {self.n_clusters} (silhouette: {scores[self.n_clusters]:.4f})")
        return scores

    def fit(self, documents, method="kmeans"):
        """Cluster documents."""
        cleaned = self.preprocess(documents)
        self.vectorize(cleaned)

        if self.n_clusters is None:
            self.find_optimal_k()

        if method == "kmeans":
            self.model = KMeans(
                n_clusters=self.n_clusters,
                random_state=42,
                n_init=10,
            )
        elif method == "hierarchical":
            self.model = AgglomerativeClustering(
                n_clusters=self.n_clusters,
                linkage="ward",
            )

        if method == "hierarchical":
            self.labels_ = self.model.fit_predict(self.tfidf_matrix.toarray())
        else:
            self.labels_ = self.model.fit_predict(self.tfidf_matrix)

        return self

    def get_cluster_info(self, documents):
        """Get detailed cluster information."""
        feature_names = self.vectorizer.get_feature_names_out()
        info = []

        for cluster_id in range(self.n_clusters):
            mask = self.labels_ == cluster_id
            cluster_docs = [documents[i] for i, m in enumerate(mask) if m]

            # Get top terms
            if hasattr(self.model, "cluster_centers_"):
                center = self.model.cluster_centers_[cluster_id]
                top_indices = center.argsort()[-10:][::-1]
                top_terms = [feature_names[i] for i in top_indices]
            else:
                cluster_tfidf = self.tfidf_matrix[mask].mean(axis=0).A1
                top_indices = cluster_tfidf.argsort()[-10:][::-1]
                top_terms = [feature_names[i] for i in top_indices]

            info.append({
                "id": cluster_id,
                "size": len(cluster_docs),
                "top_terms": top_terms,
                "documents": cluster_docs,
            })

        return info

    def predict_cluster(self, text):
        """Assign new text to a cluster."""
        cleaned = self.preprocess([text])
        vector = self.vectorizer.transform(cleaned)
        if hasattr(self.model, "predict"):
            return self.model.predict(vector)[0]
        # For hierarchical, find nearest centroid
        centers = np.array([
            self.tfidf_matrix[self.labels_ == i].mean(axis=0).A1
            for i in range(self.n_clusters)
        ])
        distances = np.linalg.norm(centers - vector.toarray(), axis=1)
        return distances.argmin()


# Usage
docs = [
    "Machine learning algorithms can predict stock prices accurately",
    "Deep learning neural networks process images for object detection",
    "Python libraries like TensorFlow enable building AI models easily",
    "Natural language processing helps computers understand human text",
    "The recipe calls for fresh basil and ripe tomatoes",
    "Italian cooking uses olive oil as a primary ingredient",
    "French pastry requires precise measurements and techniques",
    "Grilling steaks over charcoal gives them a smoky flavor",
    "Morning yoga routine improves flexibility and reduces stress",
    "Running five kilometers daily helps maintain cardiovascular health",
    "Weight training builds muscle mass and increases metabolism",
    "Swimming is an excellent low impact full body workout",
]

# Cluster
clusterer = TextClusterer(n_clusters=3)
clusterer.fit(docs)

# Display results
print("\n\nClustering Results:")
print("=" * 60)

cluster_info = clusterer.get_cluster_info(docs)
for cluster in cluster_info:
    print(f"\n📁 Cluster {cluster['id']} ({cluster['size']} docs)")
    print(f"   Keywords: {', '.join(cluster['top_terms'][:5])}")
    for doc in cluster["documents"]:
        print(f"   • {doc[:55]}...")

# Predict new document
new_doc = "Convolutional neural networks are used for image classification"
predicted = clusterer.predict_cluster(new_doc)
print(f"\n\nNew document: '{new_doc}'")
print(f"Assigned to: Cluster {predicted}")

# Evaluation
sil = silhouette_score(clusterer.tfidf_matrix, clusterer.labels_)
print(f"\nSilhouette Score: {sil:.4f}")
```

---

## Dimensionality Reduction for Visualization

High-dimensional TF-IDF vectors can be reduced for 2D visualization:

```python
from sklearn.decomposition import TruncatedSVD
from sklearn.manifold import TSNE
import numpy as np

# Reduce to 2D with SVD + t-SNE
svd = TruncatedSVD(n_components=50, random_state=42)
tfidf_reduced = svd.fit_transform(tfidf_matrix)

tsne = TSNE(n_components=2, random_state=42, perplexity=5)
coords = tsne.fit_transform(tfidf_reduced)

# Display cluster positions (text-based visualization)
print("2D Document Map (t-SNE):")
print("=" * 40)
for cluster_id in range(4):
    mask = final_labels == cluster_id
    cluster_coords = coords[mask]
    center_x = cluster_coords[:, 0].mean()
    center_y = cluster_coords[:, 1].mean()
    print(f"  Cluster {cluster_id} center: ({center_x:.1f}, {center_y:.1f})")
    print(f"    Spread: x={cluster_coords[:, 0].std():.1f}, y={cluster_coords[:, 1].std():.1f}")
```

---

## Applications

| Application | Description |
|-------------|-------------|
| **Customer feedback** | Group similar complaints/praises |
| **News aggregation** | Cluster articles by story |
| **Email organization** | Auto-categorize emails |
| **Search results** | Group search results by subtopic |
| **Social media** | Identify trending conversation themes |
| **Scientific papers** | Organize research by topic area |

---

## Best Practices

1. **Preprocessing is critical** — clean text, remove noise, normalize
2. **Feature representation matters** — TF-IDF with bigrams works well
3. **Try multiple algorithms** — K-Means, hierarchical, DBSCAN have different strengths
4. **Validate quantitatively** — use silhouette scores and other metrics
5. **Validate qualitatively** — manually inspect clusters for coherence
6. **Consider dimensionality reduction** — PCA/SVD before clustering can help
7. **Iterate** — clustering is exploratory, refine parameters based on results

---

## Summary

- Text clustering **groups documents** without labeled data
- **K-Means + TF-IDF** is the most common approach
- Choose $K$ with the **elbow method** or **silhouette scores**
- **Hierarchical clustering** builds a dendrogram — no need to fix $K$ upfront
- **DBSCAN** finds arbitrary-shaped clusters and detects outliers
- Evaluate with **silhouette, Calinski-Harabasz, Davies-Bouldin** scores
- Applications range from customer feedback analysis to document organization

---

## Next Steps

Next, we'll explore [Text Similarity & Distance](30-nlp-text-similarity.md) — measuring how similar two pieces of text are, which is fundamental to search, deduplication, and recommendation systems.
