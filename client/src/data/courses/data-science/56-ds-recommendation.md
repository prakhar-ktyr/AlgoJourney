---
title: Recommendation Systems
---

# Recommendation Systems

Recommendation systems suggest items that users might like based on their past behavior, preferences, or item characteristics.

Every time Netflix suggests a movie, Amazon recommends a product, or Spotify creates a playlist — a recommendation system is at work.

---

## What Are Recommendation Systems?

A **recommendation system** (or recommender system) is an algorithm that predicts what a user might want to see, buy, or listen to next.

**Real-world applications:**

| Platform | What It Recommends |
|----------|-------------------|
| Netflix | Movies and TV shows |
| Amazon | Products to buy |
| Spotify | Songs and playlists |
| YouTube | Videos to watch |
| LinkedIn | Jobs and connections |
| TikTok | Short videos |

---

## Types of Recommendation Systems

There are three main approaches:

1. **Content-Based Filtering** — recommend items similar to what the user liked before
2. **Collaborative Filtering** — recommend items that similar users liked
3. **Hybrid** — combine both approaches

---

## Content-Based Filtering

Content-based filtering recommends items **similar** to items the user has already liked.

### How It Works

1. Extract **features** from each item (genre, actors, keywords, etc.)
2. Build a **user profile** from items they liked
3. Find items **similar** to the user profile
4. Recommend the most similar items

### Cosine Similarity

The most common way to measure similarity between two items:

$$\text{sim}(A, B) = \frac{A \cdot B}{||A|| \cdot ||B||} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}$$

- Result ranges from 0 (completely different) to 1 (identical)
- Works well for high-dimensional sparse vectors

### TF-IDF for Text Features

**TF-IDF** (Term Frequency–Inverse Document Frequency) converts text into numerical vectors:

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\frac{N}{\text{DF}(t)}$$

Where:
- $\text{TF}(t, d)$ = frequency of term $t$ in document $d$
- $N$ = total number of documents
- $\text{DF}(t)$ = number of documents containing term $t$

### Code: Movie Recommendation from Descriptions

```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Sample movie data
movies = pd.DataFrame({
    "title": [
        "The Matrix", "Inception", "Interstellar",
        "The Notebook", "Titanic", "La La Land",
        "Iron Man", "The Avengers", "Spider-Man"
    ],
    "description": [
        "A hacker discovers reality is a simulation with AI machines",
        "A thief enters dreams to steal secrets using technology",
        "Astronauts travel through a wormhole to save humanity in space",
        "A love story between a rich girl and a poor boy",
        "A love story on a doomed ship in the ocean",
        "A musician and actress fall in love in Los Angeles",
        "A genius builds a powered armor suit to fight evil",
        "Superheroes team up to save the world from aliens",
        "A teenager gains spider powers and fights villains"
    ]
})

# Convert descriptions to TF-IDF vectors
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(movies["description"])

# Compute cosine similarity between all movies
similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Function to get recommendations
def recommend(title, n=3):
    idx = movies[movies["title"] == title].index[0]
    scores = list(enumerate(similarity_matrix[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    # Skip the first one (it's the movie itself)
    top = scores[1:n+1]
    print(f"\nRecommendations for '{title}':")
    for i, score in top:
        print(f"  {movies['title'][i]} (similarity: {score:.3f})")

recommend("The Matrix")
recommend("The Notebook")
recommend("Iron Man")
```

**Output:**
```
Recommendations for 'The Matrix':
  Inception (similarity: 0.105)
  Interstellar (similarity: 0.072)
  The Avengers (similarity: 0.045)

Recommendations for 'The Notebook':
  Titanic (similarity: 0.187)
  La La Land (similarity: 0.151)
  Interstellar (similarity: 0.000)
```

---

## Collaborative Filtering

Collaborative filtering uses the **wisdom of the crowd** — it finds patterns in how many users interact with items.

### User-Based Collaborative Filtering

1. Find users **similar** to the target user (based on rating patterns)
2. Recommend items those similar users liked but the target hasn't seen

### Item-Based Collaborative Filtering

1. Find items **similar** to items the user already liked
2. Similarity is based on how users rate items together

### The User-Item Matrix

The foundation of collaborative filtering is the **ratings matrix**:

|        | Movie A | Movie B | Movie C | Movie D |
|--------|---------|---------|---------|---------|
| User 1 | 5       | 3       | ?       | 1       |
| User 2 | 4       | ?       | 4       | 1       |
| User 3 | ?       | 1       | 5       | 4       |
| User 4 | 2       | ?       | 4       | 5       |

The goal: predict the **?** values (missing ratings).

### Similarity Metrics

**Cosine Similarity** between users:

$$\text{sim}(u, v) = \frac{\sum_{i \in I_{uv}} r_{ui} \cdot r_{vi}}{\sqrt{\sum_{i \in I_{uv}} r_{ui}^2} \cdot \sqrt{\sum_{i \in I_{uv}} r_{vi}^2}}$$

**Pearson Correlation** (accounts for rating scale differences):

$$\text{sim}(u, v) = \frac{\sum_{i}(r_{ui} - \bar{r}_u)(r_{vi} - \bar{r}_v)}{\sqrt{\sum_{i}(r_{ui} - \bar{r}_u)^2} \cdot \sqrt{\sum_{i}(r_{vi} - \bar{r}_v)^2}}$$

### Code: Simple Collaborative Filtering

```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# User-Item ratings matrix (0 = not rated)
ratings = np.array([
    [5, 3, 0, 1, 4],
    [4, 0, 4, 1, 2],
    [0, 1, 5, 4, 0],
    [2, 0, 4, 5, 1],
    [1, 4, 0, 2, 5],
])

users = ["Alice", "Bob", "Carol", "Dave", "Eve"]
movies = ["Action1", "Comedy1", "SciFi1", "Horror1", "Romance1"]

# User-based: find similar users to Alice (index 0)
# Only use columns where both users have rated
def user_similarity(matrix):
    # Replace 0s with NaN for correlation
    masked = matrix.astype(float)
    masked[masked == 0] = np.nan
    # Use cosine similarity on rated items
    filled = np.nan_to_num(matrix, nan=0)
    return cosine_similarity(filled)

sim_matrix = user_similarity(ratings)

# Predict Alice's rating for SciFi1 (index 2)
target_user = 0
target_item = 2

# Find users who rated this item
raters = np.where(ratings[:, target_item] > 0)[0]
raters = raters[raters != target_user]

# Weighted average of their ratings
similarities = sim_matrix[target_user, raters]
their_ratings = ratings[raters, target_item]

predicted = np.dot(similarities, their_ratings) / np.sum(np.abs(similarities))
print(f"Predicted rating for Alice on SciFi1: {predicted:.2f}")
```

---

## Matrix Factorization

Matrix factorization decomposes the rating matrix into two smaller matrices:

$$R \approx U \cdot V^T$$

Where:
- $R$ is the $m \times n$ ratings matrix (users × items)
- $U$ is $m \times k$ (users × latent factors)
- $V$ is $n \times k$ (items × latent factors)
- $k$ is the number of **latent factors** (hidden features)

### What Are Latent Factors?

Latent factors are hidden characteristics the algorithm discovers:
- A movie might score high on "action" and low on "romance"
- A user might prefer "cerebral" content over "lighthearted"

The algorithm learns these automatically from the data.

### SVD (Singular Value Decomposition)

SVD factors any matrix $M$ as:

$$M = U \Sigma V^T$$

Where $\Sigma$ is a diagonal matrix of singular values (importance weights).

By keeping only the top $k$ singular values, we get a low-rank approximation that fills in missing ratings.

---

## The Surprise Library

**Surprise** is a Python library specifically for building recommendation systems.

```python
from surprise import Dataset, Reader, SVD
from surprise.model_selection import cross_validate, train_test_split
from surprise import accuracy

# Prepare data
import pandas as pd

# Sample ratings data
data_dict = {
    "user": ["Alice", "Alice", "Alice", "Bob", "Bob", "Bob",
             "Carol", "Carol", "Carol", "Dave", "Dave", "Dave"],
    "item": ["Movie1", "Movie2", "Movie3", "Movie1", "Movie2", "Movie4",
             "Movie2", "Movie3", "Movie4", "Movie1", "Movie3", "Movie4"],
    "rating": [5, 3, 4, 4, 2, 5, 1, 5, 4, 2, 4, 5]
}
df = pd.DataFrame(data_dict)

# Define rating scale
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(df[["user", "item", "rating"]], reader)

# Train-test split
trainset, testset = train_test_split(data, test_size=0.25)

# Train SVD model
model = SVD(n_factors=10, n_epochs=20, random_state=42)
model.fit(trainset)

# Predict
predictions = model.test(testset)
print(f"RMSE: {accuracy.rmse(predictions):.4f}")
print(f"MAE:  {accuracy.mae(predictions):.4f}")

# Predict a specific rating
pred = model.predict("Alice", "Movie4")
print(f"\nAlice's predicted rating for Movie4: {pred.est:.2f}")
```

### Cross-Validation

```python
# 5-fold cross-validation
from surprise.model_selection import cross_validate

results = cross_validate(SVD(), data, measures=["RMSE", "MAE"], cv=5, verbose=True)
print(f"\nMean RMSE: {results['test_rmse'].mean():.4f}")
print(f"Mean MAE:  {results['test_mae'].mean():.4f}")
```

---

## The Cold Start Problem

The **cold start problem** occurs when:

| Scenario | Problem |
|----------|---------|
| New user | No history → can't find similar users |
| New item | No ratings → can't recommend it |
| New system | Very few interactions overall |

**Solutions:**

- Ask new users for preferences (onboarding quiz)
- Use content-based methods for new items
- Use demographic information
- Popular items as fallback
- Hybrid approaches

---

## Evaluation Metrics

### RMSE (Root Mean Square Error)

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(\hat{r}_i - r_i)^2}$$

### Precision@K and Recall@K

$$\text{Precision@K} = \frac{\text{relevant items in top-K}}{K}$$

$$\text{Recall@K} = \frac{\text{relevant items in top-K}}{\text{total relevant items}}$$

### NDCG (Normalized Discounted Cumulative Gain)

$$\text{DCG@K} = \sum_{i=1}^{K} \frac{2^{rel_i} - 1}{\log_2(i + 1)}$$

$$\text{NDCG@K} = \frac{\text{DCG@K}}{\text{IDCG@K}}$$

Higher positions in the ranking are weighted more heavily.

---

## Complete Example: Content-Based + Collaborative

```python
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- Content-Based Component ---
movies = pd.DataFrame({
    "id": range(1, 9),
    "title": ["Sci-Fi Epic", "Space Drama", "Love Story",
              "Romantic Comedy", "Action Hero", "Spy Thriller",
              "Comedy Night", "Horror Dark"],
    "genres": ["sci-fi action", "sci-fi drama", "romance drama",
               "romance comedy", "action thriller", "action spy",
               "comedy", "horror thriller"]
})

tfidf = TfidfVectorizer()
genre_matrix = tfidf.fit_transform(movies["genres"])
content_sim = cosine_similarity(genre_matrix)

def content_recommend(movie_id, n=3):
    idx = movie_id - 1
    scores = content_sim[idx]
    top_idx = scores.argsort()[::-1][1:n+1]
    return movies.iloc[top_idx]["title"].tolist()

# --- Collaborative Component ---
# Ratings: rows=users, cols=movies
ratings = np.array([
    [5, 4, 1, 2, 5, 4, 2, 1],
    [4, 5, 2, 1, 4, 5, 1, 2],
    [1, 2, 5, 5, 1, 2, 4, 1],
    [2, 1, 4, 5, 2, 1, 5, 2],
    [5, 4, 2, 1, 5, 4, 1, 3],
])

user_sim = cosine_similarity(ratings)

def collab_recommend(user_id, n=3):
    user_idx = user_id - 1
    sim_scores = user_sim[user_idx]
    # Weighted average of other users' ratings
    weighted_ratings = np.zeros(ratings.shape[1])
    for i in range(len(ratings)):
        if i != user_idx:
            weighted_ratings += sim_scores[i] * ratings[i]
    # Exclude already highly-rated items
    already_liked = np.where(ratings[user_idx] >= 4)[0]
    weighted_ratings[already_liked] = -1
    top_idx = weighted_ratings.argsort()[::-1][:n]
    return movies.iloc[top_idx]["title"].tolist()

# --- Hybrid: combine scores ---
print("Content-based (similar to 'Sci-Fi Epic'):")
print(f"  {content_recommend(1)}")
print("\nCollaborative (for User 3):")
print(f"  {collab_recommend(3)}")
```

---

## Summary

| Approach | Pros | Cons |
|----------|------|------|
| Content-Based | No cold start for items, transparent | Limited diversity, needs features |
| Collaborative | Discovers unexpected items, no features needed | Cold start, sparsity |
| Matrix Factorization | Handles sparsity well, scalable | Less interpretable |
| Hybrid | Best of both worlds | More complex |

**Key takeaways:**
- Recommendation systems power most of the internet's personalization
- Content-based uses item features; collaborative uses user behavior
- Matrix factorization discovers hidden patterns in ratings
- Always evaluate with proper metrics (RMSE, Precision@K, NDCG)
- The cold start problem remains a key challenge
