---
title: Text Analytics & Sentiment Analysis
---

# Text Analytics & Sentiment Analysis

**Text analytics** extracts meaningful insights from unstructured text data. **Sentiment analysis** determines whether text expresses positive, negative, or neutral opinions.

---

## Why Text Analytics?

Organizations generate massive amounts of text:

- Customer reviews (millions on Amazon, Yelp)
- Social media posts (tweets, comments)
- Support tickets and emails
- Survey open-ended responses
- News articles and reports

Text analytics turns this into **actionable insights**.

---

## Word Frequency Analysis

The simplest text analysis: count word occurrences.

```python
from collections import Counter
import re

text = """
Machine learning is a subset of artificial intelligence.
Machine learning algorithms learn from data.
Deep learning is a subset of machine learning.
Deep learning uses neural networks.
"""

# Clean and tokenize
words = re.findall(r"\b[a-z]+\b", text.lower())

# Count words
word_counts = Counter(words)
print("Most common words:")
for word, count in word_counts.most_common(10):
    print(f"  {word}: {count}")
```

### With Stop Words Removed

```python
from collections import Counter
from nltk.corpus import stopwords
import re

text = """
Python is the most popular programming language for data science.
Python has amazing libraries for machine learning and data analysis.
Data scientists love Python because it is easy to learn.
"""

stop_words = set(stopwords.words("english"))
words = re.findall(r"\b[a-z]+\b", text.lower())
filtered = [w for w in words if w not in stop_words and len(w) > 2]

word_counts = Counter(filtered)
print("Top words (no stop words):")
for word, count in word_counts.most_common(10):
    print(f"  {word}: {count}")
```

---

## Word Clouds

Visual representation of word frequency — bigger words appear more often:

```python
from wordcloud import WordCloud
import matplotlib.pyplot as plt

text = """
data science machine learning artificial intelligence
deep learning neural networks python programming
data analysis statistics visualization pandas numpy
machine learning algorithms training models prediction
"""

# Generate word cloud
wordcloud = WordCloud(
    width=800,
    height=400,
    background_color="white",
    max_words=100,
    colormap="viridis"
).generate(text)

# Display
plt.figure(figsize=(10, 5))
plt.imshow(wordcloud, interpolation="bilinear")
plt.axis("off")
plt.title("Data Science Word Cloud")
plt.tight_layout()
plt.savefig("wordcloud.png", dpi=150)
plt.show()
```

### Word Cloud from DataFrame

```python
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import pandas as pd

# Combine all text from a column
df = pd.DataFrame({
    "review": [
        "Great product, love the quality",
        "Amazing service, fast delivery",
        "Best purchase ever, highly recommend",
        "Love this product, great value"
    ]
})

all_text = " ".join(df["review"].tolist())
wordcloud = WordCloud(width=800, height=400).generate(all_text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud, interpolation="bilinear")
plt.axis("off")
plt.show()
```

---

## N-grams

**N-grams** are sequences of N consecutive words. They capture phrases and context that single words miss.

- **Unigram** (1-gram): "machine", "learning"
- **Bigram** (2-gram): "machine learning"
- **Trigram** (3-gram): "natural language processing"

```python
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd

documents = [
    "machine learning is amazing for data science",
    "data science uses machine learning algorithms",
    "deep learning is a type of machine learning",
    "natural language processing uses deep learning"
]

# Bigrams
bigram_vec = CountVectorizer(ngram_range=(2, 2))
bigram_matrix = bigram_vec.fit_transform(documents)

# Most common bigrams
bigram_counts = bigram_matrix.toarray().sum(axis=0)
bigrams_df = pd.DataFrame({
    "bigram": bigram_vec.get_feature_names_out(),
    "count": bigram_counts
}).sort_values("count", ascending=False)

print("Top Bigrams:")
print(bigrams_df.head(10).to_string(index=False))
```

```python
from sklearn.feature_extraction.text import CountVectorizer
import pandas as pd

documents = [
    "I love this product it is amazing",
    "This product is terrible very bad quality",
    "Amazing product great quality love it",
    "Bad product terrible service never again"
]

# Trigrams
trigram_vec = CountVectorizer(ngram_range=(3, 3))
trigram_matrix = trigram_vec.fit_transform(documents)

trigram_counts = trigram_matrix.toarray().sum(axis=0)
trigrams_df = pd.DataFrame({
    "trigram": trigram_vec.get_feature_names_out(),
    "count": trigram_counts
}).sort_values("count", ascending=False)

print("Top Trigrams:")
print(trigrams_df.head(10).to_string(index=False))
```

---

## Sentiment Analysis

Determine the **emotional tone** of text: positive, negative, or neutral.

### Approaches

| Approach | How it works | Best for |
|----------|-------------|----------|
| Lexicon-based | Dictionary of word sentiments | Quick analysis, no training |
| ML-based | Train classifier on labeled data | Custom domains |
| Transformer-based | Pre-trained deep learning | Best accuracy |

---

### VADER (Lexicon-Based)

**VADER** (Valence Aware Dictionary and sEntiment Reasoner) is designed for social media text:

```python
from nltk.sentiment import SentimentIntensityAnalyzer

# Initialize VADER
sia = SentimentIntensityAnalyzer()

# Analyze sentiment
texts = [
    "I absolutely love this product! Best ever!",
    "This is okay, nothing special.",
    "Terrible experience. Worst purchase of my life!",
    "The food was AMAZING!!! 😍",
    "Not bad, but could be better."
]

for text in texts:
    scores = sia.polarity_scores(text)
    compound = scores["compound"]

    # Classify based on compound score
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    print(f"{sentiment:8} ({compound:+.3f}): {text}")
```

VADER compound score ranges from **-1** (most negative) to **+1** (most positive).

### VADER on a DataFrame

```python
from nltk.sentiment import SentimentIntensityAnalyzer
import pandas as pd

sia = SentimentIntensityAnalyzer()

df = pd.DataFrame({
    "review": [
        "Absolutely fantastic product!",
        "Meh, it's alright I guess",
        "Total waste of money",
        "Pretty good for the price",
        "HORRIBLE customer service!!!"
    ]
})

# Apply VADER to each review
df["compound"] = df["review"].apply(
    lambda x: sia.polarity_scores(x)["compound"]
)

df["sentiment"] = df["compound"].apply(
    lambda x: "Positive" if x >= 0.05 else ("Negative" if x <= -0.05 else "Neutral")
)

print(df[["review", "compound", "sentiment"]])
```

---

### TextBlob (Simple Alternative)

```python
from textblob import TextBlob

texts = [
    "I love this product",
    "This is terrible",
    "It works fine"
]

for text in texts:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity      # -1 to +1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1

    print(f"Polarity: {polarity:+.2f}, Subjectivity: {subjectivity:.2f} | {text}")
```

- **Polarity**: -1 (negative) to +1 (positive)
- **Subjectivity**: 0 (objective/factual) to 1 (subjective/opinion)

---

### ML-Based Sentiment Analysis

Train your own classifier for domain-specific sentiment:

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import re

# Sample labeled data
data = pd.DataFrame({
    "text": [
        "Love this phone, great camera!", "Best laptop I ever owned",
        "Amazing battery life", "Excellent build quality",
        "Fast and responsive", "Beautiful display",
        "Terrible product, broke immediately", "Worst purchase ever",
        "Very slow and laggy", "Poor quality materials",
        "Waste of money", "Stopped working after a week"
    ],
    "sentiment": [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
})

# Preprocess
data["clean"] = data["text"].apply(
    lambda x: re.sub(r"[^a-z\s]", "", x.lower())
)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    data["clean"], data["sentiment"], test_size=0.25, random_state=42
)

# Vectorize and train
tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_train_vec = tfidf.fit_transform(X_train)
X_test_vec = tfidf.transform(X_test)

model = LogisticRegression()
model.fit(X_train_vec, y_train)

# Evaluate
print(classification_report(y_test, model.predict(X_test_vec)))
```

---

### Hugging Face Transformers (State-of-the-Art)

Pre-trained models for instant high-quality sentiment analysis:

```python
from transformers import pipeline

# Load pre-trained sentiment model
sentiment_pipeline = pipeline("sentiment-analysis")

texts = [
    "I absolutely love this product!",
    "This is the worst thing I've ever bought.",
    "It's okay, nothing special.",
]

results = sentiment_pipeline(texts)
for text, result in zip(texts, results):
    print(f"{result['label']} ({result['score']:.3f}): {text}")

# Output:
# POSITIVE (0.999): I absolutely love this product!
# NEGATIVE (0.999): This is the worst thing I've ever bought.
# POSITIVE (0.687): It's okay, nothing special.
```

---

## Topic Modeling

Automatically discover **topics** (themes) in a collection of documents.

### LDA (Latent Dirichlet Allocation)

LDA assumes:
- Each **document** is a mixture of topics
- Each **topic** is a distribution over words

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
import pandas as pd

# Sample documents
documents = [
    "Python programming language data analysis",
    "Machine learning algorithms training data",
    "Basketball football sports championship game",
    "Soccer world cup tournament players",
    "Deep learning neural networks AI",
    "Olympics athletics running swimming",
    "Natural language processing text mining",
    "Tennis grand slam match score",
    "Data science statistics visualization",
    "Team sports league season winner"
]

# Create document-term matrix
vectorizer = CountVectorizer(max_features=1000, stop_words="english")
doc_term_matrix = vectorizer.fit_transform(documents)

# Fit LDA with 2 topics
n_topics = 2
lda = LatentDirichletAllocation(
    n_components=n_topics,
    random_state=42,
    max_iter=20
)
lda.fit(doc_term_matrix)

# Display topics
feature_names = vectorizer.get_feature_names_out()
print("Discovered Topics:")
print("=" * 50)
for topic_idx, topic in enumerate(lda.components_):
    top_words = [feature_names[i] for i in topic.argsort()[:-8:-1]]
    print(f"Topic {topic_idx + 1}: {', '.join(top_words)}")

# Topic 1: data, learning, machine, ... (tech/DS topic)
# Topic 2: sports, game, team, ... (sports topic)
```

### Assigning Topics to Documents

```python
# Get topic distribution for each document
topic_distributions = lda.transform(doc_term_matrix)

# Create results DataFrame
results = pd.DataFrame(topic_distributions, columns=[f"Topic {i+1}" for i in range(n_topics)])
results["document"] = [doc[:40] + "..." for doc in documents]
results["dominant_topic"] = results[[f"Topic {i+1}" for i in range(n_topics)]].idxmax(axis=1)

print(results[["document", "dominant_topic"]].to_string(index=False))
```

### NMF (Non-negative Matrix Factorization)

An alternative to LDA — often produces cleaner topics:

```python
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer

# Use TF-IDF for NMF (not raw counts)
tfidf = TfidfVectorizer(max_features=1000, stop_words="english")
tfidf_matrix = tfidf.fit_transform(documents)

# Fit NMF
nmf = NMF(n_components=2, random_state=42)
nmf.fit(tfidf_matrix)

# Display topics
feature_names = tfidf.get_feature_names_out()
print("NMF Topics:")
for topic_idx, topic in enumerate(nmf.components_):
    top_words = [feature_names[i] for i in topic.argsort()[:-8:-1]]
    print(f"Topic {topic_idx + 1}: {', '.join(top_words)}")
```

---

## Visualizing Topics with pyLDAvis

```python
# Interactive topic visualization
import pyLDAvis
import pyLDAvis.lda_model

# Prepare visualization
vis_data = pyLDAvis.lda_model.prepare(
    lda,                    # Fitted LDA model
    doc_term_matrix,        # Document-term matrix
    vectorizer              # Vectorizer (for feature names)
)

# Save as HTML for interactive exploration
pyLDAvis.save_html(vis_data, "lda_visualization.html")
print("Saved interactive visualization to lda_visualization.html")
```

---

## Text Summarization (Brief)

Two approaches:

| Type | Method | How |
|------|--------|-----|
| **Extractive** | Select important sentences | Score sentences, pick top ones |
| **Abstractive** | Generate new summary | Deep learning models (GPT, T5) |

```python
from transformers import pipeline

# Abstractive summarization with Transformers
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

article = """
Machine learning is transforming industries worldwide. Companies are using
ML algorithms to analyze vast amounts of data and make better decisions.
From healthcare to finance, the applications are endless. Natural language
processing enables chatbots and translation services. Computer vision
powers self-driving cars and medical imaging. The future of AI holds
incredible promise for solving complex global challenges.
"""

summary = summarizer(article, max_length=50, min_length=20, do_sample=False)
print("Summary:", summary[0]["summary_text"])
```

---

## Complete Sentiment Analysis Pipeline

```python
import pandas as pd
import re
from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter

# Sample customer reviews
reviews = pd.DataFrame({
    "review": [
        "Absolutely love this product! Works perfectly every time.",
        "Terrible quality. Broke after two days of use.",
        "It's okay. Does the job but nothing special.",
        "Best purchase I've made this year! Highly recommend!",
        "Very disappointed. Not worth the price at all.",
        "Good quality for the money. Fast shipping too.",
        "Horrible experience. Customer service was rude.",
        "Amazing! Exceeded all my expectations.",
        "Average product. Works as described.",
        "Worst product ever. Complete waste of money!"
    ]
})

# 1. VADER Sentiment Analysis
sia = SentimentIntensityAnalyzer()
reviews["compound"] = reviews["review"].apply(
    lambda x: sia.polarity_scores(x)["compound"]
)
reviews["sentiment"] = reviews["compound"].apply(
    lambda x: "Positive" if x >= 0.05 else ("Negative" if x <= -0.05 else "Neutral")
)

# 2. Summary statistics
print("Sentiment Distribution:")
print(reviews["sentiment"].value_counts())
print(f"\nAverage sentiment: {reviews['compound'].mean():.3f}")
print(f"Most positive: {reviews.loc[reviews['compound'].idxmax(), 'review']}")
print(f"Most negative: {reviews.loc[reviews['compound'].idxmin(), 'review']}")

# 3. Word frequency by sentiment
positive_text = " ".join(reviews[reviews["sentiment"] == "Positive"]["review"])
negative_text = " ".join(reviews[reviews["sentiment"] == "Negative"]["review"])

stop_words = {"the", "a", "is", "it", "this", "i", "of", "for", "and", "was", "not"}

pos_words = [w for w in re.findall(r"\b[a-z]+\b", positive_text.lower())
             if w not in stop_words and len(w) > 2]
neg_words = [w for w in re.findall(r"\b[a-z]+\b", negative_text.lower())
             if w not in stop_words and len(w) > 2]

print("\nTop positive words:", Counter(pos_words).most_common(5))
print("Top negative words:", Counter(neg_words).most_common(5))
```

---

## Applications of Text Analytics

| Application | Technique | Example |
|-------------|-----------|---------|
| Customer feedback | Sentiment + topics | Identify common complaints |
| Social media monitoring | Real-time sentiment | Track brand perception |
| Document classification | TF-IDF + ML | Route support tickets |
| Market research | Topic modeling | Discover trends |
| Content recommendation | Text similarity | Suggest articles |
| Competitive analysis | Scraping + sentiment | Monitor competitor reviews |

---

## Choosing the Right Tool

| Task | Best Tool | When to Use |
|------|-----------|-------------|
| Quick sentiment | VADER | Social media, short text |
| Simple polarity | TextBlob | Quick prototyping |
| Custom domain | Sklearn + TF-IDF | Have labeled training data |
| Best accuracy | Hugging Face Transformers | Production quality needed |
| Topic discovery | LDA/NMF | No labeled data, explore themes |
| Entity extraction | spaCy NER | Find names, places, orgs |

---

## Try It Yourself

1. Collect 50+ product reviews and analyze sentiment with VADER
2. Create a word cloud of positive vs negative reviews
3. Build a bigram analysis to find common phrases
4. Train a custom sentiment classifier for your domain
5. Use LDA to discover topics in a collection of articles

---

## Summary

| Concept | Code/Tool |
|---------|-----------|
| Word frequency | `Counter(words).most_common(n)` |
| Word cloud | `WordCloud().generate(text)` |
| N-grams | `CountVectorizer(ngram_range=(2, 2))` |
| VADER sentiment | `SentimentIntensityAnalyzer().polarity_scores()` |
| TextBlob | `TextBlob(text).sentiment.polarity` |
| Topic modeling | `LatentDirichletAllocation(n_components=k)` |
| Transformers | `pipeline('sentiment-analysis')` |
| NMF topics | `NMF(n_components=k)` on TF-IDF |

Text analytics is one of the most impactful areas of data science — every company has text data waiting to be analyzed!
