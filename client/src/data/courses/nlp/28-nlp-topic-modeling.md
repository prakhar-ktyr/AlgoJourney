---
title: Topic Modeling
---

# Topic Modeling

Topic modeling automatically discovers the **abstract topics** that occur in a collection of documents. It's an unsupervised technique — no labeled data required.

---

## What Is Topic Modeling?

Imagine you have thousands of news articles. Topic modeling can automatically discover topics like:

- **Topic 1:** election, vote, candidate, campaign, poll → *Politics*
- **Topic 2:** stock, market, trade, investor, economy → *Finance*
- **Topic 3:** player, game, team, score, championship → *Sports*

Each document is represented as a **mixture of topics**, and each topic is a **mixture of words**.

---

## Why Use Topic Modeling?

| Use Case | Example |
|----------|---------|
| **Document organization** | Auto-categorize thousands of articles |
| **Content recommendation** | Suggest similar articles by topic |
| **Trend analysis** | Track how topics evolve over time |
| **Search improvement** | Find documents by theme, not just keywords |
| **Summarization** | Understand large document collections quickly |

---

## Latent Dirichlet Allocation (LDA)

**LDA** is the most popular topic modeling algorithm. It makes two key assumptions:

1. **Documents are mixtures of topics** — each document has a probability distribution over topics
2. **Topics are mixtures of words** — each topic has a probability distribution over words

### The Math

The probability of a word $w$ in document $d$:

$$P(w|d) = \sum_{t=1}^{T} P(w|t) \cdot P(t|d)$$

Where:
- $T$ = number of topics
- $P(w|t)$ = probability of word $w$ in topic $t$
- $P(t|d)$ = probability of topic $t$ in document $d$

### LDA's Generative Story

LDA imagines documents were created by this process:

1. For each topic $t$, draw a distribution over words: $\phi_t \sim \text{Dir}(\beta)$
2. For each document $d$:
   - Draw a distribution over topics: $\theta_d \sim \text{Dir}(\alpha)$
   - For each word position:
     - Choose a topic: $z \sim \text{Multinomial}(\theta_d)$
     - Choose a word: $w \sim \text{Multinomial}(\phi_z)$

The **Dirichlet distribution** ($\text{Dir}$) is a distribution over probability distributions:
- $\alpha$ controls document-topic sparsity (lower → documents about fewer topics)
- $\beta$ controls topic-word sparsity (lower → topics with fewer key words)

---

## LDA with Gensim

```python
# Install: pip install gensim
import gensim
from gensim import corpora
from gensim.models import LdaModel
from gensim.parsing.preprocessing import (
    preprocess_string,
    strip_punctuation,
    strip_numeric,
    strip_short,
    remove_stopwords,
    stem_text,
)
import re


# Sample document collection (news articles)
documents = [
    "The president signed a new trade deal with neighboring countries to boost the economy",
    "Stock markets rallied after the central bank announced lower interest rates",
    "The football team won the championship after defeating their rivals in overtime",
    "Scientists discovered a new species of deep sea fish in the Pacific Ocean",
    "The election campaign focuses on healthcare reform and education funding",
    "Tech stocks surged as major companies reported better than expected earnings",
    "The basketball player scored 50 points in last night's playoff game",
    "Researchers developed a new vaccine that shows promising results in clinical trials",
    "Congress debated the new immigration bill ahead of the midterm elections",
    "Gold prices dropped as investors moved money into technology stocks",
    "The tennis champion won her fifth Grand Slam title this season",
    "A new study links regular exercise to reduced risk of heart disease",
    "The mayor announced plans for new public transit routes in the city",
    "Oil prices rose sharply following tensions in the Middle East region",
    "The soccer world cup final drew record television viewership worldwide",
    "Medical researchers found a potential breakthrough treatment for cancer",
]

# Preprocessing
def preprocess(text):
    """Clean and tokenize text for topic modeling."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    tokens = text.split()
    # Remove stopwords and short words
    stop_words = {
        "the", "a", "an", "is", "was", "are", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "shall", "can",
        "for", "and", "nor", "but", "or", "yet", "so", "in", "on",
        "at", "to", "from", "by", "with", "of", "that", "this",
        "it", "its", "as", "after", "their", "than", "new", "her",
    }
    tokens = [t for t in tokens if t not in stop_words and len(t) > 2]
    return tokens


# Tokenize all documents
texts = [preprocess(doc) for doc in documents]

# Create dictionary (word-to-id mapping)
dictionary = corpora.Dictionary(texts)

# Filter extreme words
dictionary.filter_extremes(no_below=2, no_above=0.8)

# Create bag-of-words corpus
corpus = [dictionary.doc2bow(text) for text in texts]

print(f"Dictionary size: {len(dictionary)} unique tokens")
print(f"Corpus size: {len(corpus)} documents")
print(f"\nSample bag-of-words (doc 0): {corpus[0][:5]}")
```

---

## Training the LDA Model

```python
# Train LDA model
num_topics = 4

lda_model = LdaModel(
    corpus=corpus,
    id2word=dictionary,
    num_topics=num_topics,
    random_state=42,
    passes=15,           # Number of passes through the corpus
    alpha="auto",        # Learn document-topic density
    eta="auto",          # Learn topic-word density
    per_word_topics=True,
)

# Display discovered topics
print("Discovered Topics:")
print("=" * 60)

for idx, topic in lda_model.print_topics(num_words=8):
    print(f"\nTopic {idx}:")
    # Parse the topic string for cleaner display
    words = re.findall(r'"(\w+)"', topic)
    weights = re.findall(r"(0\.\d+)", topic)
    for word, weight in zip(words, weights):
        bar = "█" * int(float(weight) * 100)
        print(f"  {word:<15} {float(weight):.3f} {bar}")
```

---

## Interpreting Topics

```python
# Get topic distribution for a document
doc_idx = 0
doc_topics = lda_model.get_document_topics(corpus[doc_idx])

print(f"Document: '{documents[doc_idx]}'")
print(f"\nTopic distribution:")
for topic_id, prob in sorted(doc_topics, key=lambda x: -x[1]):
    print(f"  Topic {topic_id}: {prob:.3f}")
    top_words = lda_model.show_topic(topic_id, topn=5)
    words = ", ".join([w for w, _ in top_words])
    print(f"    Key words: {words}")

# Find dominant topic for each document
print("\n\nDocument → Dominant Topic:")
print("-" * 70)
for i, doc in enumerate(documents):
    doc_topics = lda_model.get_document_topics(corpus[i])
    dominant_topic = max(doc_topics, key=lambda x: x[1])
    print(f"  Topic {dominant_topic[0]} ({dominant_topic[1]:.2f}): {doc[:60]}...")
```

---

## Choosing the Number of Topics

The hardest part of topic modeling is choosing $K$ (number of topics). Use **coherence score**:

```python
from gensim.models import CoherenceModel

def compute_coherence_values(corpus, dictionary, texts, start=2, limit=10, step=1):
    """Find optimal number of topics using coherence score."""
    coherence_values = []
    models = []

    for num_topics in range(start, limit, step):
        model = LdaModel(
            corpus=corpus,
            id2word=dictionary,
            num_topics=num_topics,
            random_state=42,
            passes=10,
            alpha="auto",
            eta="auto",
        )
        models.append(model)

        # Calculate coherence (c_v is most reliable)
        coherence_model = CoherenceModel(
            model=model,
            texts=texts,
            dictionary=dictionary,
            coherence="c_v",
        )
        coherence_values.append(coherence_model.get_coherence())

    return models, coherence_values


# Find optimal K
models, coherence_values = compute_coherence_values(
    corpus, dictionary, texts, start=2, limit=8
)

print("Number of Topics vs Coherence Score:")
print("-" * 40)
for k, cv in zip(range(2, 8), coherence_values):
    bar = "█" * int(cv * 50)
    print(f"  K={k}: {cv:.4f} {bar}")

optimal_k = range(2, 8)[coherence_values.index(max(coherence_values))]
print(f"\nOptimal number of topics: {optimal_k}")
```

### Interpreting Coherence

- **Higher coherence** = more interpretable topics
- Look for the **"elbow"** where adding more topics doesn't improve coherence
- Typical values: 0.3–0.7 is reasonable for `c_v` coherence

---

## Non-Negative Matrix Factorization (NMF)

**NMF** is an alternative to LDA that often produces more coherent topics:

```python
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Create TF-IDF matrix
vectorizer = TfidfVectorizer(
    max_features=1000,
    stop_words="english",
    max_df=0.85,
    min_df=2,
)
tfidf_matrix = vectorizer.fit_transform(documents)
feature_names = vectorizer.get_feature_names_out()

# Train NMF
num_topics = 4
nmf_model = NMF(
    n_components=num_topics,
    random_state=42,
    max_iter=500,
    alpha_W=0.1,
    alpha_H=0.1,
    l1_ratio=0.5,
)

# W: document-topic matrix, H: topic-word matrix
W = nmf_model.fit_transform(tfidf_matrix)  # documents × topics
H = nmf_model.components_                    # topics × words

# Display NMF topics
print("NMF Topics:")
print("=" * 60)

for topic_idx, topic in enumerate(H):
    top_word_indices = topic.argsort()[-8:][::-1]
    top_words = [feature_names[i] for i in top_word_indices]
    top_weights = [topic[i] for i in top_word_indices]

    print(f"\nTopic {topic_idx}:")
    for word, weight in zip(top_words, top_weights):
        bar = "█" * int(weight * 20)
        print(f"  {word:<15} {weight:.3f} {bar}")

# Document topic assignments
print("\n\nDocument Topics (NMF):")
print("-" * 70)
for i, doc in enumerate(documents):
    dominant_topic = W[i].argmax()
    confidence = W[i][dominant_topic] / (W[i].sum() + 1e-10)
    print(f"  Topic {dominant_topic} ({confidence:.2f}): {doc[:55]}...")
```

---

## LDA vs NMF Comparison

| Feature | LDA | NMF |
|---------|-----|-----|
| **Foundation** | Probabilistic | Matrix factorization |
| **Input** | Bag-of-words | TF-IDF (preferred) |
| **Interpretation** | Topics as probability distributions | Topics as weighted components |
| **Speed** | Slower (sampling/variational) | Faster (matrix operations) |
| **Coherence** | Good | Often better for short texts |
| **Soft clustering** | Yes (probabilistic) | Yes (non-negative weights) |

---

## Visualizing Topics with pyLDAvis

```python
# Install: pip install pyLDAvis
import pyLDAvis
import pyLDAvis.gensim_models

# Prepare visualization data
vis_data = pyLDAvis.gensim_models.prepare(lda_model, corpus, dictionary)

# Save as interactive HTML
pyLDAvis.save_html(vis_data, "lda_visualization.html")
print("Visualization saved to lda_visualization.html")

# In Jupyter notebook, display inline:
# pyLDAvis.display(vis_data)
```

The visualization shows:
- **Left panel:** Topics as circles (size = prevalence, distance = similarity)
- **Right panel:** Top words for selected topic (blue = overall frequency, red = topic-specific)

---

## Complete Pipeline: Topic Modeling on News

```python
import gensim
from gensim import corpora
from gensim.models import LdaModel, CoherenceModel
from gensim.utils import simple_preprocess
import re
import numpy as np


class TopicModeler:
    """Complete topic modeling pipeline."""

    def __init__(self, num_topics=5, passes=15):
        self.num_topics = num_topics
        self.passes = passes
        self.model = None
        self.dictionary = None
        self.corpus = None

    def preprocess(self, documents):
        """Tokenize and clean documents."""
        stop_words = set(gensim.parsing.preprocessing.STOPWORDS)
        additional_stops = {"said", "also", "would", "could", "one", "two"}
        stop_words.update(additional_stops)

        processed = []
        for doc in documents:
            tokens = simple_preprocess(doc, deacc=True, min_len=3)
            tokens = [t for t in tokens if t not in stop_words]
            processed.append(tokens)
        return processed

    def build_corpus(self, texts):
        """Create dictionary and corpus."""
        self.dictionary = corpora.Dictionary(texts)
        self.dictionary.filter_extremes(no_below=2, no_above=0.7)
        self.corpus = [self.dictionary.doc2bow(text) for text in texts]

    def train(self, documents):
        """Full training pipeline."""
        texts = self.preprocess(documents)
        self.build_corpus(texts)

        self.model = LdaModel(
            corpus=self.corpus,
            id2word=self.dictionary,
            num_topics=self.num_topics,
            random_state=42,
            passes=self.passes,
            alpha="auto",
            eta="auto",
        )

        # Calculate coherence
        coherence = CoherenceModel(
            model=self.model,
            texts=texts,
            dictionary=self.dictionary,
            coherence="c_v",
        )
        self.coherence_score = coherence.get_coherence()
        return self

    def get_topics(self, num_words=10):
        """Get human-readable topics."""
        topics = []
        for idx in range(self.num_topics):
            words = self.model.show_topic(idx, topn=num_words)
            topics.append({
                "id": idx,
                "words": [(w, float(p)) for w, p in words],
                "label": ", ".join([w for w, _ in words[:3]]),
            })
        return topics

    def predict(self, text):
        """Get topic distribution for new text."""
        tokens = simple_preprocess(text, deacc=True, min_len=3)
        bow = self.dictionary.doc2bow(tokens)
        return self.model.get_document_topics(bow)

    def find_similar(self, text, documents, top_n=3):
        """Find documents with similar topic distribution."""
        query_topics = dict(self.predict(text))
        query_vec = np.array([query_topics.get(i, 0) for i in range(self.num_topics)])

        similarities = []
        for i, doc in enumerate(documents):
            doc_topics = dict(self.model.get_document_topics(self.corpus[i]))
            doc_vec = np.array([doc_topics.get(j, 0) for j in range(self.num_topics)])
            # Cosine similarity
            sim = np.dot(query_vec, doc_vec) / (
                np.linalg.norm(query_vec) * np.linalg.norm(doc_vec) + 1e-10
            )
            similarities.append((i, sim))

        similarities.sort(key=lambda x: -x[1])
        return similarities[:top_n]


# Usage
news_articles = [
    "The government announced new tax reform legislation affecting businesses",
    "Stock market indices reached all time highs driven by tech sector growth",
    "The national football team qualified for the world cup after winning",
    "Scientists published findings on climate change effects on ocean ecosystems",
    "The central bank raised interest rates to combat rising inflation",
    "Olympic athletes broke several records at the summer games",
    "New medical research shows benefits of Mediterranean diet for heart health",
    "The prime minister met with foreign leaders to discuss trade agreements",
    "Cryptocurrency markets experienced high volatility amid regulatory concerns",
    "Professional basketball league announced expansion with two new teams",
    "Breakthrough in renewable energy makes solar panels more efficient",
    "Parliamentary elections resulted in a coalition government formation",
]

# Train
modeler = TopicModeler(num_topics=4, passes=20)
modeler.train(news_articles)

print(f"Coherence Score: {modeler.coherence_score:.4f}")
print(f"\nDiscovered Topics:")
print("=" * 50)

for topic in modeler.get_topics(num_words=6):
    words = " | ".join([f"{w} ({p:.3f})" for w, p in topic["words"]])
    print(f"\n  Topic {topic['id']}: {topic['label']}")
    print(f"    {words}")

# Predict topic for new document
new_doc = "Investors are worried about the upcoming federal reserve interest rate decision"
print(f"\n\nNew document: '{new_doc}'")
print("Topic distribution:")
for topic_id, prob in sorted(modeler.predict(new_doc), key=lambda x: -x[1]):
    print(f"  Topic {topic_id}: {prob:.3f}")

# Find similar documents
print("\nMost similar documents:")
for idx, sim in modeler.find_similar(new_doc, news_articles):
    print(f"  ({sim:.3f}) {news_articles[idx][:60]}...")
```

---

## Dynamic Topic Modeling

Track how topics change over time:

```python
from collections import defaultdict


def topics_over_time(documents, timestamps, modeler, time_periods):
    """Analyze how topic prevalence changes over time."""
    period_topics = defaultdict(lambda: defaultdict(list))

    for doc, ts in zip(documents, timestamps):
        topics = modeler.predict(doc)
        for topic_id, prob in topics:
            period_topics[ts][topic_id].append(prob)

    # Average topic prevalence per period
    results = {}
    for period in time_periods:
        results[period] = {}
        for topic_id in range(modeler.num_topics):
            probs = period_topics[period].get(topic_id, [0])
            results[period][topic_id] = sum(probs) / max(len(probs), 1)

    return results
```

---

## Best Practices

1. **Preprocessing matters** — remove stopwords, short words, very common/rare words
2. **Experiment with K** — try different numbers of topics, evaluate with coherence
3. **Use bigrams/trigrams** — "machine learning" as one token instead of two
4. **Iterate on results** — topic modeling is exploratory; refine based on output
5. **Domain expertise** — human judgment is essential for interpreting topics
6. **Sufficient data** — LDA works best with hundreds or thousands of documents

---

## Summary

- Topic modeling discovers **hidden themes** in document collections
- **LDA** is the most popular approach: documents as topic mixtures, topics as word mixtures
- $P(w|d) = \sum_t P(w|t) \cdot P(t|d)$ — a word's probability depends on document's topics
- Choose number of topics using **coherence scores**
- **NMF** is a faster alternative that often produces cleaner topics
- **pyLDAvis** provides interactive topic visualization
- Key applications: document organization, recommendation, trend analysis

---

## Next Steps

Next, we'll explore [Text Clustering](29-nlp-text-clustering.md) — another unsupervised technique that groups similar documents together without predefined topics.
