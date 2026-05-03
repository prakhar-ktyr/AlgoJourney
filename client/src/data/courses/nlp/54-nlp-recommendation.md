---
title: Recommendation with NLP
---

# Recommendation with NLP

**Recommendation systems** suggest items to users based on their preferences. NLP plays a crucial role by understanding text content — product descriptions, reviews, articles — to make better recommendations.

In this lesson, you will learn how to build content-based recommendation systems using NLP techniques.

---

## Types of Recommendation Systems

| Type | How It Works | Example |
|------|-------------|---------|
| **Collaborative filtering** | "Users like you also liked..." | Netflix ratings |
| **Content-based** | "Similar to items you liked..." | News articles |
| **Hybrid** | Combines both approaches | Amazon, Spotify |

NLP is most important for **content-based filtering**, where we analyze the text of items to find similarities.

---

## Content-Based Filtering

The idea is simple:

1. Represent each item as a **text vector** (from descriptions, titles, tags)
2. Build a **user profile** from items they liked
3. Recommend items most **similar** to the user's profile

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Movie descriptions
movies = {
    "The Matrix": "A hacker discovers reality is a simulation. Action sci-fi with martial arts and philosophy.",
    "Inception": "A thief enters dreams to steal secrets. Mind-bending sci-fi thriller with stunning visuals.",
    "Interstellar": "Astronauts travel through a wormhole to save humanity. Epic space exploration drama.",
    "The Notebook": "A love story spanning decades. Romantic drama about enduring passion.",
    "Titanic": "A love story on the ill-fated ship. Epic romance and disaster drama.",
    "Avengers": "Superheroes unite to save the world from alien invasion. Action-packed adventure.",
    "Iron Man": "A genius builds a powered suit to fight evil. Superhero action with humor.",
    "Blade Runner": "A detective hunts rogue androids. Dystopian sci-fi noir with philosophy.",
    "Her": "A man falls in love with an AI assistant. Sci-fi romance about technology and loneliness.",
    "Gravity": "An astronaut stranded in space fights to survive. Intense space thriller.",
}

titles = list(movies.keys())
descriptions = list(movies.values())

# Build TF-IDF vectors for all movies
vectorizer = TfidfVectorizer(stop_words="english")
tfidf_matrix = vectorizer.fit_transform(descriptions)

# Compute similarity between all pairs
similarity_matrix = cosine_similarity(tfidf_matrix)

def recommend_similar(movie_title, top_k=3):
    """Recommend movies similar to the given movie."""
    if movie_title not in titles:
        return f"Movie '{movie_title}' not found."

    idx = titles.index(movie_title)
    scores = similarity_matrix[idx]

    # Sort by similarity (exclude the movie itself)
    ranked = np.argsort(scores)[::-1][1:top_k + 1]

    print(f"If you liked '{movie_title}', you might enjoy:")
    for rank, i in enumerate(ranked, 1):
        print(f"  {rank}. {titles[i]} (similarity: {scores[i]:.3f})")
    print()

recommend_similar("The Matrix")
recommend_similar("Titanic")
recommend_similar("Interstellar")
```

---

## Representing Items with TF-IDF

TF-IDF captures what makes each item unique:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Book catalog with descriptions
books = [
    {
        "title": "Python Crash Course",
        "description": "A hands-on introduction to Python programming. Covers basics, projects, and web development.",
        "genre": "programming",
    },
    {
        "title": "Deep Learning",
        "description": "Comprehensive guide to neural networks, backpropagation, CNNs, and RNNs for AI researchers.",
        "genre": "machine learning",
    },
    {
        "title": "Clean Code",
        "description": "Writing readable, maintainable software. Best practices for professional programmers.",
        "genre": "programming",
    },
    {
        "title": "Hands-On Machine Learning",
        "description": "Practical machine learning with scikit-learn and TensorFlow. Classification, regression, clustering.",
        "genre": "machine learning",
    },
    {
        "title": "The Art of Statistics",
        "description": "Learning from data with real-world examples. Probability, hypothesis testing, and Bayesian methods.",
        "genre": "statistics",
    },
    {
        "title": "Fluent Python",
        "description": "Advanced Python programming patterns. Decorators, generators, metaclasses, and concurrency.",
        "genre": "programming",
    },
    {
        "title": "Pattern Recognition",
        "description": "Statistical pattern recognition and machine learning. Classification, neural networks, kernel methods.",
        "genre": "machine learning",
    },
    {
        "title": "Data Science from Scratch",
        "description": "Building data science tools in Python. Statistics, machine learning, and data visualization.",
        "genre": "data science",
    },
]

# Combine title and description for richer representation
texts = [f"{b['title']} {b['description']}" for b in books]

vectorizer = TfidfVectorizer(stop_words="english", max_features=100)
tfidf_matrix = vectorizer.fit_transform(texts)

print(f"Feature matrix: {tfidf_matrix.shape}")
print(f"Top features: {vectorizer.get_feature_names_out()[:15]}")
print()

# Show what makes each book unique (top TF-IDF terms)
for i, book in enumerate(books):
    scores = tfidf_matrix[i].toarray().flatten()
    top_indices = np.argsort(scores)[::-1][:5]
    top_terms = [
        (vectorizer.get_feature_names_out()[j], scores[j])
        for j in top_indices if scores[j] > 0
    ]
    print(f"'{book['title']}': {[t[0] for t in top_terms]}")
```

---

## Building a User Profile

A user profile is built from items they've interacted with:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class ContentRecommender:
    """Content-based recommender using TF-IDF user profiles."""

    def __init__(self, items):
        """
        Args:
            items: list of dicts with 'id', 'title', 'description'
        """
        self.items = items
        self.item_ids = [item["id"] for item in items]
        texts = [f"{item['title']} {item['description']}" for item in items]

        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.item_vectors = self.vectorizer.fit_transform(texts)

    def build_user_profile(self, liked_ids, disliked_ids=None):
        """Build a user profile from liked/disliked items."""
        # Average the vectors of liked items
        liked_indices = [self.item_ids.index(id) for id in liked_ids if id in self.item_ids]

        if not liked_indices:
            return None

        profile = self.item_vectors[liked_indices].mean(axis=0)

        # Subtract disliked items (if any)
        if disliked_ids:
            disliked_indices = [
                self.item_ids.index(id) for id in disliked_ids if id in self.item_ids
            ]
            if disliked_indices:
                negative = self.item_vectors[disliked_indices].mean(axis=0)
                profile = profile - 0.3 * negative

        return profile

    def recommend(self, liked_ids, disliked_ids=None, top_k=5):
        """Recommend items based on user preferences."""
        profile = self.build_user_profile(liked_ids, disliked_ids)
        if profile is None:
            return []

        # Compute similarity between profile and all items
        scores = cosine_similarity(profile, self.item_vectors)[0]

        # Exclude already liked/disliked items
        seen = set(liked_ids + (disliked_ids or []))
        for i, item_id in enumerate(self.item_ids):
            if item_id in seen:
                scores[i] = -1

        # Rank and return top-k
        ranked = np.argsort(scores)[::-1][:top_k]
        results = []
        for idx in ranked:
            if scores[idx] > 0:
                results.append({
                    "id": self.item_ids[idx],
                    "title": self.items[idx]["title"],
                    "score": scores[idx],
                })
        return results


# Article catalog
articles = [
    {"id": "a1", "title": "Introduction to Python", "description": "Learn Python basics, variables, loops, and functions for beginners."},
    {"id": "a2", "title": "Deep Learning Fundamentals", "description": "Neural networks, gradient descent, backpropagation, and training deep models."},
    {"id": "a3", "title": "Web Development with React", "description": "Building modern user interfaces with React components and hooks."},
    {"id": "a4", "title": "Data Visualization with Matplotlib", "description": "Creating charts, plots, and interactive visualizations in Python."},
    {"id": "a5", "title": "Natural Language Processing", "description": "Text classification, sentiment analysis, and language models with Python."},
    {"id": "a6", "title": "Computer Vision with OpenCV", "description": "Image processing, object detection, and facial recognition techniques."},
    {"id": "a7", "title": "Machine Learning with Scikit-learn", "description": "Classification, regression, clustering algorithms and model evaluation."},
    {"id": "a8", "title": "Advanced Python Patterns", "description": "Decorators, generators, context managers, and metaclasses in Python."},
    {"id": "a9", "title": "Building REST APIs", "description": "Designing and implementing web APIs with Flask and FastAPI."},
    {"id": "a10", "title": "Reinforcement Learning", "description": "Q-learning, policy gradients, and training agents to play games."},
]

# Create recommender
recommender = ContentRecommender(articles)

# User liked Python and ML articles
liked = ["a1", "a7", "a5"]
print("User liked: Python, ML with Scikit-learn, NLP")
print("\nRecommendations:")
recs = recommender.recommend(liked, top_k=4)
for r in recs:
    print(f"  • {r['title']} (score: {r['score']:.3f})")
print()

# Another user who likes web development
liked2 = ["a3", "a9"]
print("User liked: React, REST APIs")
print("\nRecommendations:")
recs2 = recommender.recommend(liked2, top_k=4)
for r in recs2:
    print(f"  • {r['title']} (score: {r['score']:.3f})")
```

---

## Cosine Similarity for Matching

Cosine similarity measures how similar two vectors are, regardless of magnitude:

$$\cos(\vec{a}, \vec{b}) = \frac{\vec{a} \cdot \vec{b}}{|\vec{a}| \cdot |\vec{b}|}$$

- **1.0** = identical direction (very similar)
- **0.0** = orthogonal (unrelated)
- **-1.0** = opposite (TF-IDF vectors are always ≥ 0)

```python
import numpy as np

def cosine_sim(a, b):
    """Calculate cosine similarity between two vectors."""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

# Example: comparing text representations
# Imagine these are TF-IDF vectors (simplified)
python_article = np.array([0.5, 0.3, 0.8, 0.0, 0.0])  # high on python/ML terms
java_article = np.array([0.4, 0.2, 0.1, 0.7, 0.0])    # high on java terms
ml_article = np.array([0.6, 0.5, 0.7, 0.0, 0.1])      # high on ML terms
cooking_article = np.array([0.0, 0.0, 0.0, 0.0, 0.9])  # different topic

print("Similarity scores:")
print(f"  Python vs ML:      {cosine_sim(python_article, ml_article):.3f}")
print(f"  Python vs Java:    {cosine_sim(python_article, java_article):.3f}")
print(f"  Python vs Cooking: {cosine_sim(python_article, cooking_article):.3f}")
print(f"  Java vs ML:        {cosine_sim(java_article, ml_article):.3f}")
```

---

## NLP in Reviews: Extracting Preferences

User reviews contain rich preference information. We can extract what users like and dislike:

```python
from collections import Counter
import re

def extract_preferences(reviews, positive_words=None, negative_words=None):
    """Extract liked/disliked aspects from reviews."""
    if positive_words is None:
        positive_words = {
            "love", "great", "excellent", "amazing", "perfect",
            "best", "fantastic", "wonderful", "enjoyed", "beautiful",
        }
    if negative_words is None:
        negative_words = {
            "bad", "terrible", "awful", "worst", "hate",
            "boring", "disappointing", "poor", "horrible", "waste",
        }

    liked_aspects = []
    disliked_aspects = []

    for review in reviews:
        sentences = review.lower().split(".")
        for sentence in sentences:
            words = set(re.findall(r"\w+", sentence))

            # Extract nouns near sentiment words (simplified)
            if words & positive_words:
                # Get potential aspect words (nouns)
                aspects = words - positive_words - {"the", "a", "an", "is", "was", "very", "really", "so", "and", "it", "i"}
                liked_aspects.extend(aspects)

            elif words & negative_words:
                aspects = words - negative_words - {"the", "a", "an", "is", "was", "very", "really", "so", "and", "it", "i"}
                disliked_aspects.extend(aspects)

    liked_counts = Counter(liked_aspects).most_common(10)
    disliked_counts = Counter(disliked_aspects).most_common(10)

    return liked_counts, disliked_counts


# Example: restaurant reviews
reviews = [
    "The pasta was excellent and the service was great. Love the atmosphere.",
    "Amazing pizza but terrible wait time. The staff was wonderful though.",
    "Best seafood I've ever had. The wine selection is fantastic.",
    "Disappointing dessert and poor coffee. But the main course was perfect.",
    "Horrible parking situation. The food quality is great but boring menu variety.",
    "Love the outdoor seating. Beautiful decor and excellent cocktails.",
]

liked, disliked = extract_preferences(reviews)
print("Liked aspects:")
for aspect, count in liked:
    print(f"  + {aspect} ({count})")
print("\nDisliked aspects:")
for aspect, count in disliked:
    print(f"  - {aspect} ({count})")
```

---

## Sentence Transformers for Semantic Recommendations

**Sentence transformers** produce dense embeddings that capture semantic meaning — much better than TF-IDF for understanding content:

```python
from sentence_transformers import SentenceTransformer
import numpy as np

class SemanticRecommender:
    """Recommendation system using sentence transformer embeddings."""

    def __init__(self, items, model_name="all-MiniLM-L6-v2"):
        self.items = items
        self.model = SentenceTransformer(model_name)

        # Encode all item descriptions
        texts = [f"{item['title']}. {item['description']}" for item in items]
        self.embeddings = self.model.encode(texts, show_progress_bar=False)

    def find_similar(self, item_idx, top_k=5):
        """Find items similar to the given item."""
        query_embedding = self.embeddings[item_idx]
        similarities = np.dot(self.embeddings, query_embedding)
        similarities /= (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )

        ranked = np.argsort(similarities)[::-1][1:top_k + 1]
        return [(idx, similarities[idx]) for idx in ranked]

    def recommend_from_text(self, query_text, top_k=5):
        """Recommend items based on a text description of preferences."""
        query_embedding = self.model.encode([query_text])[0]
        similarities = np.dot(self.embeddings, query_embedding)
        similarities /= (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )

        ranked = np.argsort(similarities)[::-1][:top_k]
        return [(idx, similarities[idx]) for idx in ranked]

    def recommend_for_user(self, liked_indices, top_k=5):
        """Recommend based on average of liked item embeddings."""
        if not liked_indices:
            return []

        # User profile = average of liked embeddings
        profile = np.mean(self.embeddings[liked_indices], axis=0)
        similarities = np.dot(self.embeddings, profile)
        similarities /= (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(profile)
        )

        # Exclude already liked
        for idx in liked_indices:
            similarities[idx] = -1

        ranked = np.argsort(similarities)[::-1][:top_k]
        return [(idx, similarities[idx]) for idx in ranked]


# Product catalog
products = [
    {"title": "Wireless Noise-Cancelling Headphones", "description": "Premium over-ear headphones with active noise cancellation and 30-hour battery life."},
    {"title": "Mechanical Gaming Keyboard", "description": "RGB backlit keyboard with cherry MX switches. Perfect for gaming and fast typing."},
    {"title": "4K Webcam", "description": "Ultra HD webcam with autofocus and noise-reducing microphone for video calls."},
    {"title": "Bluetooth Speaker", "description": "Portable waterproof speaker with deep bass and 12-hour battery. Great for outdoors."},
    {"title": "USB-C Hub", "description": "Multi-port adapter with HDMI, USB-A, SD card reader for laptops."},
    {"title": "Ergonomic Mouse", "description": "Vertical wireless mouse designed to reduce wrist strain. Quiet clicks."},
    {"title": "Studio Microphone", "description": "Condenser USB microphone for podcasting, streaming, and voice recording."},
    {"title": "Monitor Light Bar", "description": "LED screen light bar reducing eye strain. Auto-dimming based on ambient light."},
    {"title": "Wireless Earbuds", "description": "True wireless earbuds with noise cancellation and transparency mode. Sports fit."},
    {"title": "Standing Desk Converter", "description": "Adjustable sit-stand desk riser with keyboard tray. Ergonomic workspace solution."},
]

# Create recommender
rec = SemanticRecommender(products)

# Find products similar to headphones
print("Similar to 'Wireless Noise-Cancelling Headphones':")
similar = rec.find_similar(0, top_k=3)
for idx, score in similar:
    print(f"  • {products[idx]['title']} ({score:.3f})")

print("\nRecommendations for 'I need something for my home office setup':")
text_recs = rec.recommend_from_text("home office ergonomic setup", top_k=3)
for idx, score in text_recs:
    print(f"  • {products[idx]['title']} ({score:.3f})")

print("\nUser liked headphones and speaker, recommendations:")
user_recs = rec.recommend_for_user([0, 3], top_k=3)
for idx, score in user_recs:
    print(f"  • {products[idx]['title']} ({score:.3f})")
```

---

## Hybrid Recommendation

Combine collaborative filtering signals with NLP content features:

```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class HybridRecommender:
    """Combines content similarity with user ratings."""

    def __init__(self, items, user_ratings):
        """
        Args:
            items: list of dicts with 'id', 'title', 'description'
            user_ratings: dict mapping user_id → {item_id: rating}
        """
        self.items = items
        self.item_ids = [item["id"] for item in items]
        self.user_ratings = user_ratings

        # Build content similarity
        texts = [f"{item['title']} {item['description']}" for item in items]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(texts)
        self.content_sim = cosine_similarity(tfidf)

    def _content_score(self, user_id, item_idx):
        """Content-based score: similarity to user's liked items."""
        ratings = self.user_ratings.get(user_id, {})
        if not ratings:
            return 0

        weighted_sum = 0
        weight_total = 0

        for rated_id, rating in ratings.items():
            if rated_id in self.item_ids:
                rated_idx = self.item_ids.index(rated_id)
                sim = self.content_sim[item_idx][rated_idx]
                weighted_sum += sim * rating
                weight_total += abs(sim)

        return weighted_sum / weight_total if weight_total > 0 else 0

    def _collaborative_score(self, user_id, item_idx):
        """Collaborative score: ratings from similar users."""
        target_item_id = self.item_ids[item_idx]
        scores = []

        for other_user, ratings in self.user_ratings.items():
            if other_user == user_id:
                continue
            if target_item_id in ratings:
                scores.append(ratings[target_item_id])

        return np.mean(scores) if scores else 0

    def recommend(self, user_id, top_k=5, alpha=0.7):
        """
        Hybrid recommendation.
        alpha: weight for content-based (1-alpha for collaborative)
        """
        ratings = self.user_ratings.get(user_id, {})
        scores = []

        for idx, item in enumerate(self.items):
            if item["id"] in ratings:
                continue  # Skip already rated

            content = self._content_score(user_id, idx)
            collab = self._collaborative_score(user_id, idx)
            hybrid = alpha * content + (1 - alpha) * collab
            scores.append((idx, hybrid))

        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


# Example
items = [
    {"id": "i1", "title": "Python Basics", "description": "Introduction to Python programming language"},
    {"id": "i2", "title": "ML with Python", "description": "Machine learning algorithms using scikit-learn"},
    {"id": "i3", "title": "Web Design", "description": "HTML CSS and responsive web design principles"},
    {"id": "i4", "title": "Data Analysis", "description": "Pandas numpy data manipulation and visualization"},
    {"id": "i5", "title": "Deep Learning", "description": "Neural networks TensorFlow PyTorch deep learning"},
    {"id": "i6", "title": "JavaScript", "description": "Modern JavaScript ES6 web development frontend"},
]

user_ratings = {
    "user1": {"i1": 5, "i2": 4, "i4": 5},
    "user2": {"i3": 5, "i6": 4, "i1": 3},
    "user3": {"i2": 5, "i5": 5, "i4": 4},
}

hybrid = HybridRecommender(items, user_ratings)

print("Recommendations for user1 (likes Python, ML, Data):")
recs = hybrid.recommend("user1", top_k=3)
for idx, score in recs:
    print(f"  • {items[idx]['title']} (score: {score:.3f})")

print("\nRecommendations for user2 (likes Web, JS, some Python):")
recs = hybrid.recommend("user2", top_k=3)
for idx, score in recs:
    print(f"  • {items[idx]['title']} (score: {score:.3f})")
```

---

## Summary

| Concept | Description |
|---------|-------------|
| Content-based | Recommend items similar to what user liked |
| TF-IDF vectors | Represent items as weighted term vectors |
| User profile | Average vector of liked items |
| Cosine similarity | Measure angle between vectors (0 to 1) |
| Review mining | Extract preferences from user text |
| Sentence transformers | Dense semantic embeddings |
| Hybrid | Combine content + collaborative signals |

---

## Exercises

1. Build a movie recommender using TMDB descriptions (use the free API)
2. Extend the review miner to extract aspect-sentiment pairs (e.g., "food: positive")
3. Add diversity to recommendations — avoid suggesting too-similar items
4. Implement a "cold start" solution for new items with no ratings
5. Compare TF-IDF vs sentence transformer recommendations on the same dataset
