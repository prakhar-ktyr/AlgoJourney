---
title: Keyword Extraction
---

# Keyword Extraction

**Keyword extraction** automatically identifies the most important words or phrases in a document. These keywords summarize the core topics and help with indexing, search, and categorization.

---

## What is Keyword Extraction?

Given a text document, keyword extraction finds the terms that best represent its content:

```
Input:  "Machine learning algorithms can automatically improve
         through experience. Deep learning, a subset of machine
         learning, uses neural networks with many layers."

Keywords: machine learning, deep learning, neural networks,
          algorithms, experience
```

### Why Extract Keywords?

- **Search Engine Optimization (SEO)**: identify relevant terms
- **Document summarization**: quick overview of content
- **Content tagging**: auto-categorize articles
- **Recommendation systems**: match documents by topics
- **Information retrieval**: improve search relevance

---

## Statistical Methods: TF-IDF Based Keyword Extraction

**TF-IDF** (Term Frequency–Inverse Document Frequency) scores words by how important they are to a document relative to a corpus:

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

Where:

$$\text{TF}(t, d) = \frac{\text{count of } t \text{ in } d}{\text{total terms in } d}$$

$$\text{IDF}(t) = \log\frac{N}{|\{d \in D : t \in d\}|}$$

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Sample documents
documents = [
    "Machine learning is a subset of artificial intelligence. "
    "Machine learning algorithms build mathematical models.",
    "Deep learning uses neural networks with multiple layers. "
    "Neural networks are inspired by biological neurons.",
    "Natural language processing deals with text and speech. "
    "NLP combines linguistics and machine learning.",
]

def tfidf_keywords(documents, top_n=5):
    """Extract top keywords from each document using TF-IDF."""
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),  # unigrams and bigrams
        max_features=1000,
    )
    tfidf_matrix = vectorizer.fit_transform(documents)
    feature_names = vectorizer.get_feature_names_out()

    keywords_per_doc = []
    for idx in range(len(documents)):
        scores = tfidf_matrix[idx].toarray().flatten()
        top_indices = scores.argsort()[-top_n:][::-1]
        keywords = [
            (feature_names[i], round(scores[i], 4))
            for i in top_indices
            if scores[i] > 0
        ]
        keywords_per_doc.append(keywords)

    return keywords_per_doc

results = tfidf_keywords(documents)
for i, keywords in enumerate(results):
    print(f"\nDocument {i + 1} keywords:")
    for word, score in keywords:
        print(f"  {word:25} (score: {score})")
```

**Output:**

```
Document 1 keywords:
  machine learning           (score: 0.4523)
  algorithms                 (score: 0.3812)
  mathematical models        (score: 0.3812)
  subset                     (score: 0.3812)
  artificial intelligence    (score: 0.3812)

Document 2 keywords:
  neural networks            (score: 0.4891)
  deep learning              (score: 0.3654)
  layers                     (score: 0.3654)
  biological neurons         (score: 0.3654)
  multiple                   (score: 0.3654)
```

---

## RAKE: Rapid Automatic Keyword Extraction

**RAKE** is a domain-independent method that uses word co-occurrence within phrases to identify keywords:

### How RAKE Works

1. Split text into candidate phrases using stop words and punctuation as delimiters
2. Build a word co-occurrence matrix
3. Calculate word scores: $\text{score}(w) = \text{deg}(w) / \text{freq}(w)$
4. Phrase score = sum of word scores in the phrase

```python
from collections import defaultdict, Counter
import re

def rake_extract(text, stop_words=None, top_n=10):
    """
    Implement RAKE keyword extraction from scratch.
    """
    if stop_words is None:
        stop_words = set([
            "the", "a", "an", "is", "are", "was", "were", "be",
            "been", "being", "have", "has", "had", "do", "does",
            "did", "will", "would", "could", "should", "may",
            "might", "shall", "can", "need", "dare", "ought",
            "used", "to", "of", "in", "for", "on", "with", "at",
            "by", "from", "as", "into", "through", "during",
            "before", "after", "above", "below", "between",
            "and", "but", "or", "nor", "not", "so", "yet",
            "both", "either", "neither", "each", "every", "all",
            "any", "few", "more", "most", "other", "some", "such",
            "no", "only", "own", "same", "than", "too", "very",
            "it", "its", "this", "that", "these", "those",
        ])

    # Step 1: Split into candidate phrases
    # Use stop words and punctuation as delimiters
    sentence_delimiters = r"[.!?,;:\t\n\(\)\[\]\{\}\"']"
    sentences = re.split(sentence_delimiters, text.lower())

    phrases = []
    for sentence in sentences:
        words = sentence.strip().split()
        phrase = []
        for word in words:
            word = re.sub(r"[^a-z0-9]", "", word)
            if word and word not in stop_words:
                phrase.append(word)
            else:
                if phrase:
                    phrases.append(phrase)
                phrase = []
        if phrase:
            phrases.append(phrase)

    # Step 2: Calculate word scores (degree / frequency)
    word_freq = Counter()
    word_degree = Counter()

    for phrase in phrases:
        degree = len(phrase) - 1
        for word in phrase:
            word_freq[word] += 1
            word_degree[word] += degree

    word_scores = {}
    for word in word_freq:
        word_scores[word] = (
            (word_degree[word] + word_freq[word]) / word_freq[word]
        )

    # Step 3: Calculate phrase scores
    phrase_scores = {}
    for phrase in phrases:
        phrase_text = " ".join(phrase)
        score = sum(word_scores.get(w, 0) for w in phrase)
        phrase_scores[phrase_text] = score

    # Step 4: Return top-n unique phrases
    sorted_phrases = sorted(
        phrase_scores.items(), key=lambda x: x[1], reverse=True
    )

    seen = set()
    results = []
    for phrase, score in sorted_phrases:
        if phrase not in seen:
            results.append((phrase, round(score, 2)))
            seen.add(phrase)
        if len(results) >= top_n:
            break

    return results

text = """
Natural language processing enables computers to understand human language.
Key techniques include tokenization, named entity recognition, and sentiment
analysis. Deep learning models like transformers have revolutionized the field.
BERT and GPT are popular pretrained language models used for various NLP tasks.
"""

keywords = rake_extract(text, top_n=8)
print("RAKE Keywords:")
for phrase, score in keywords:
    print(f"  {phrase:35} (score: {score})")
```

---

## TextRank: Graph-Based Keyword Extraction

**TextRank** applies Google's PageRank algorithm to text. Words are nodes; edges connect words that co-occur within a window:

### Algorithm

1. Build a graph where nodes are words
2. Add edges between words co-occurring within window size $k$
3. Run PageRank until convergence:

$$S(V_i) = (1 - d) + d \cdot \sum_{V_j \in \text{In}(V_i)} \frac{1}{|\text{Out}(V_j)|} S(V_j)$$

Where $d$ is the damping factor (typically 0.85).

```python
import numpy as np
from collections import defaultdict

def textrank_keywords(text, window_size=4, top_n=10, damping=0.85, iterations=30):
    """
    TextRank keyword extraction implementation.
    """
    # Preprocessing
    stop_words = set([
        "the", "a", "an", "is", "are", "was", "were", "be", "been",
        "have", "has", "had", "do", "does", "did", "will", "would",
        "to", "of", "in", "for", "on", "with", "at", "by", "from",
        "and", "but", "or", "not", "it", "its", "this", "that",
        "as", "into", "through", "during", "which", "who", "whom",
    ])

    words = []
    for word in text.lower().split():
        cleaned = "".join(c for c in word if c.isalnum())
        if cleaned and cleaned not in stop_words and len(cleaned) > 2:
            words.append(cleaned)

    # Build co-occurrence graph
    vocab = list(set(words))
    word_to_idx = {w: i for i, w in enumerate(vocab)}
    n = len(vocab)

    # Adjacency matrix
    adj = np.zeros((n, n))
    for i in range(len(words)):
        for j in range(i + 1, min(i + window_size, len(words))):
            if words[i] != words[j]:
                idx_i = word_to_idx[words[i]]
                idx_j = word_to_idx[words[j]]
                adj[idx_i][idx_j] += 1
                adj[idx_j][idx_i] += 1

    # Run PageRank
    scores = np.ones(n) / n
    for _ in range(iterations):
        new_scores = np.zeros(n)
        for i in range(n):
            neighbors = np.where(adj[i] > 0)[0]
            for j in neighbors:
                out_degree = adj[j].sum()
                if out_degree > 0:
                    new_scores[i] += scores[j] / out_degree
        scores = (1 - damping) + damping * new_scores

    # Get top keywords
    ranked = sorted(
        zip(vocab, scores), key=lambda x: x[1], reverse=True
    )

    return [(word, round(score, 4)) for word, score in ranked[:top_n]]

text = """
Machine learning algorithms enable computers to learn from data.
Supervised learning uses labeled training data to make predictions.
Unsupervised learning discovers hidden patterns in unlabeled data.
Reinforcement learning trains agents through rewards and penalties.
Deep learning uses artificial neural networks with multiple layers.
"""

keywords = textrank_keywords(text, top_n=8)
print("TextRank Keywords:")
for word, score in keywords:
    print(f"  {word:20} (score: {score})")
```

---

## YAKE: Yet Another Keyword Extractor

**YAKE** is an unsupervised method that uses statistical features without needing a corpus:

### Features YAKE Considers

1. **Casing**: uppercase words may be more important
2. **Position**: words appearing early in text
3. **Frequency**: how often a word appears
4. **Relatedness to context**: dispersion of co-occurring words
5. **Sentence frequency**: in how many sentences the word appears

```python
# Using the yake library
# pip install yake

import yake

def yake_keywords(text, language="en", max_ngram=3, top_n=10):
    """Extract keywords using YAKE."""
    kw_extractor = yake.KeywordExtractor(
        lan=language,
        n=max_ngram,        # max n-gram size
        dedupLim=0.9,       # deduplication threshold
        dedupFunc="seqm",   # deduplication function
        windowsSize=1,      # window size
        top=top_n,          # number of keywords
        features=None,      # use all features
    )

    keywords = kw_extractor.extract_keywords(text)
    # YAKE returns lower scores for better keywords
    return [(kw, round(score, 4)) for kw, score in keywords]

text = """
Artificial intelligence and machine learning are transforming healthcare.
Deep learning models can detect diseases from medical images with high
accuracy. Natural language processing helps analyze electronic health
records. Computer vision assists in surgical procedures and diagnostics.
"""

keywords = yake_keywords(text, top_n=10)
print("YAKE Keywords (lower score = more relevant):")
for keyword, score in keywords:
    print(f"  {keyword:30} (score: {score})")
```

---

## KeyBERT: Using BERT Embeddings for Keywords

**KeyBERT** uses BERT embeddings to find keywords most similar to the document:

### How KeyBERT Works

1. Generate document embedding using BERT
2. Generate candidate keyword embeddings
3. Find keywords whose embeddings are most similar to the document

$$\text{similarity}(kw, doc) = \cos(\mathbf{e}_{kw}, \mathbf{e}_{doc})$$

```python
# Using the keybert library
# pip install keybert

from keybert import KeyBERT

def keybert_keywords(text, top_n=10):
    """Extract keywords using KeyBERT."""
    kw_model = KeyBERT()

    # Basic extraction
    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=top_n,
    )

    return keywords

def keybert_diverse_keywords(text, top_n=10):
    """
    Extract diverse keywords using MMR
    (Maximal Marginal Relevance).
    """
    kw_model = KeyBERT()

    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 3),
        stop_words="english",
        use_mmr=True,          # Use MMR for diversity
        diversity=0.7,         # Higher = more diverse
        top_n=top_n,
    )

    return keywords

text = """
Quantum computing leverages quantum mechanical phenomena like
superposition and entanglement to process information. Unlike
classical computers that use bits, quantum computers use qubits.
This enables them to solve certain problems exponentially faster,
including cryptography, drug discovery, and optimization problems.
"""

print("KeyBERT Keywords:")
keywords = keybert_keywords(text, top_n=8)
for kw, score in keywords:
    print(f"  {kw:25} (similarity: {score:.4f})")

print("\nKeyBERT Diverse Keywords (MMR):")
diverse = keybert_diverse_keywords(text, top_n=8)
for kw, score in diverse:
    print(f"  {kw:25} (similarity: {score:.4f})")
```

---

## Comparison of Methods

| Method | Type | Needs Corpus? | Multi-word? | Speed | Quality |
|---|---|---|---|---|---|
| TF-IDF | Statistical | Yes | With n-grams | Fast | Good |
| RAKE | Statistical | No | Yes | Fast | Good |
| TextRank | Graph-based | No | With post-processing | Medium | Good |
| YAKE | Statistical | No | Yes | Fast | Very Good |
| KeyBERT | Neural | No | Yes | Slow | Excellent |

### When to Use What

```python
# Quick comparison on the same text
def compare_methods(text):
    """Compare keyword extraction methods side by side."""
    print("=" * 60)
    print("TEXT:", text[:100], "...")
    print("=" * 60)

    # Method 1: TF-IDF (needs multiple docs, using single doc trick)
    from sklearn.feature_extraction.text import TfidfVectorizer
    vectorizer = TfidfVectorizer(
        stop_words="english", ngram_range=(1, 2)
    )
    # Split into sentences as pseudo-documents
    sentences = [s.strip() for s in text.split(".") if s.strip()]
    if len(sentences) > 1:
        matrix = vectorizer.fit_transform(sentences)
        features = vectorizer.get_feature_names_out()
        avg_scores = matrix.mean(axis=0).A1
        top_idx = avg_scores.argsort()[-5:][::-1]
        print("\nTF-IDF:")
        for idx in top_idx:
            print(f"  {features[idx]}")

    # Method 2: RAKE
    print("\nRAKE:")
    rake_results = rake_extract(text, top_n=5)
    for kw, score in rake_results:
        print(f"  {kw}")

    # Method 3: TextRank
    print("\nTextRank:")
    tr_results = textrank_keywords(text, top_n=5)
    for kw, score in tr_results:
        print(f"  {kw}")

sample = """
Renewable energy sources like solar and wind power are becoming
increasingly cost-competitive with fossil fuels. Solar panel
efficiency has improved dramatically while manufacturing costs
have fallen. Wind turbines are now the cheapest source of new
electricity generation in many regions worldwide.
"""

compare_methods(sample)
```

---

## Applications

### SEO Keyword Analysis

```python
def seo_analysis(page_content, target_keywords):
    """Analyze keyword density for SEO."""
    words = page_content.lower().split()
    total_words = len(words)

    print(f"Total words: {total_words}")
    print(f"\n{'Keyword':<20} {'Count':<8} {'Density':<10} {'Status'}")
    print("-" * 55)

    for keyword in target_keywords:
        count = page_content.lower().count(keyword.lower())
        density = (count / total_words) * 100

        # Ideal keyword density: 1-3%
        if density < 0.5:
            status = "Too low"
        elif density > 3.0:
            status = "Too high (stuffing)"
        else:
            status = "Good"

        print(f"{keyword:<20} {count:<8} {density:<10.2f}% {status}")

content = """
Machine learning is revolutionizing data science. In data science,
machine learning models help predict outcomes. Our machine learning
course covers supervised learning, unsupervised learning, and deep
learning fundamentals for aspiring data scientists.
"""

target = ["machine learning", "data science", "deep learning"]
seo_analysis(content, target)
```

### Auto-Tagging Documents

```python
def auto_tag(text, tag_candidates=None, top_n=5):
    """Automatically generate tags for a document."""
    # Use RAKE for candidate generation
    keywords = rake_extract(text, top_n=top_n * 2)

    # Filter and clean
    tags = []
    for phrase, score in keywords:
        # Clean up: remove very short or very long phrases
        if 2 <= len(phrase) <= 30:
            tags.append(phrase)
        if len(tags) >= top_n:
            break

    return tags

article = """
Python web frameworks like Django and Flask make it easy to build
web applications. Django provides an ORM, admin interface, and
authentication out of the box. Flask is lightweight and gives
developers more control over components they want to use.
"""

tags = auto_tag(article)
print("Auto-generated tags:")
for tag in tags:
    print(f"  #{tag.replace(' ', '_')}")
```

---

## Summary

| Method | Best For |
|---|---|
| TF-IDF | Corpus-aware keyword importance |
| RAKE | Quick, unsupervised multi-word keywords |
| TextRank | No training needed, leverages word relationships |
| YAKE | Fast, handles multiple languages |
| KeyBERT | Highest quality, semantic understanding |

**Key Takeaway:** Choose your keyword extraction method based on your constraints — speed, corpus availability, and quality requirements. For most applications, starting with RAKE or YAKE and upgrading to KeyBERT when quality matters most is a practical approach.

---
