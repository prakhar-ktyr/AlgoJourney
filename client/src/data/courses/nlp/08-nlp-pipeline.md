---
title: The NLP Pipeline
---

# The NLP Pipeline

In this lesson, you will learn the typical steps in an NLP pipeline — from raw text to a working model.

Every NLP project follows a similar workflow. Understanding this pipeline helps you build systems systematically.

---

## What Is an NLP Pipeline?

An NLP pipeline is a **sequence of processing steps** that transforms raw text into useful output.

Think of it like a factory assembly line:

```
Raw Text → Clean → Process → Vectorize → Model → Output
```

Each step takes input from the previous step and produces output for the next.

---

## Typical NLP Pipeline Steps

### Overview

| Step | Purpose | Example |
|------|---------|---------|
| 1. Data Collection | Gather raw text | Scrape websites, load datasets |
| 2. Text Cleaning | Remove noise | Strip HTML, fix encoding |
| 3. Preprocessing | Normalize and tokenize | Lowercase, tokenize, remove stopwords |
| 4. Feature Extraction | Convert to numbers | TF-IDF, word embeddings |
| 5. Model Training | Learn patterns | Train classifier, NER model |
| 6. Evaluation | Measure performance | Accuracy, F1-score |
| 7. Deployment | Serve predictions | REST API, batch processing |

---

## Step 1: Data Collection

The first step is gathering the text data you need.

### Common Data Sources

| Source | Description | Example |
|--------|-------------|---------|
| Web scraping | Extract text from websites | BeautifulSoup, Scrapy |
| APIs | Social media, news | Twitter API, NewsAPI |
| Databases | Internal company data | SQL queries |
| Files | Local documents | PDFs, CSVs, text files |
| Public datasets | Pre-collected data | IMDB reviews, Wikipedia |

### Considerations

- **Volume**: How much data do you need? (More is usually better)
- **Quality**: Is the data clean? Representative?
- **Labels**: Do you need labeled data? (Supervised learning)
- **Balance**: Are all classes represented equally?
- **Ethics**: Privacy, consent, bias concerns

### Popular NLP Datasets

| Dataset | Task | Size |
|---------|------|------|
| IMDB Reviews | Sentiment analysis | 50,000 reviews |
| AG News | Text classification | 120,000 articles |
| SQuAD | Question answering | 100,000+ questions |
| CoNLL-2003 | Named entity recognition | 22,137 sentences |
| WMT | Machine translation | Millions of sentence pairs |

---

## Step 2: Text Cleaning

Raw text is messy. Cleaning removes noise that doesn't help your model.

### Common Cleaning Operations

| Operation | Before | After |
|-----------|--------|-------|
| Remove HTML | `<p>Hello</p>` | `Hello` |
| Fix encoding | `caf\xe9` | `café` |
| Remove URLs | `Visit https://example.com` | `Visit` |
| Remove emails | `Contact john@mail.com` | `Contact` |
| Remove special chars | `Hello!!! @world #nlp` | `Hello world nlp` |
| Remove extra spaces | `Hello   world` | `Hello world` |
| Strip whitespace | `  Hello  ` | `Hello` |

### When to Clean vs. Keep

| Keep | Remove |
|------|--------|
| Punctuation (for sentiment: "great!!!" vs "great") | HTML tags |
| Numbers (if meaningful) | Boilerplate text |
| Capitalization (for NER: "Apple" the company) | Headers/footers |
| Emojis (for sentiment analysis) | Duplicate content |

> **Rule of thumb**: Only remove what you're certain doesn't carry useful information for YOUR task.

---

## Step 3: Preprocessing

Preprocessing transforms cleaned text into a standardized format.

### Sub-steps

| Sub-step | Description | Example |
|----------|-------------|---------|
| Tokenization | Split into tokens | "I love NLP" → ["I", "love", "NLP"] |
| Lowercasing | Normalize case | "Hello" → "hello" |
| Stop word removal | Remove common words | ["I", "love", "NLP"] → ["love", "NLP"] |
| Stemming | Reduce to root form | "running" → "run" |
| Lemmatization | Dictionary form | "better" → "good" |
| POS tagging | Grammatical labels | "love"/VERB, "NLP"/NOUN |

### Stemming vs. Lemmatization

| Feature | Stemming | Lemmatization |
|---------|----------|---------------|
| Method | Rule-based chopping | Dictionary lookup |
| Speed | Fast | Slower |
| Accuracy | May produce non-words | Always produces real words |
| Example | "studies" → "studi" | "studies" → "study" |
| Example | "better" → "better" | "better" → "good" |

### Stop Words

Stop words are common words that usually don't carry meaning:

```
English stop words: a, an, the, is, are, was, were, in, on, at, to, for, ...
```

**Caution**: Sometimes stop words matter!

- "To be or not to be" — removing stop words destroys meaning
- "Not good" — "not" is a stop word but carries negation

---

## Step 4: Feature Extraction (Vectorization)

Convert preprocessed text into numerical vectors that models can process.

### Common Methods

| Method | Type | Description |
|--------|------|-------------|
| Bag of Words (BoW) | Sparse | Count word occurrences |
| TF-IDF | Sparse | Weighted word importance |
| Word2Vec | Dense | Learned word embeddings |
| GloVe | Dense | Co-occurrence based embeddings |
| BERT Embeddings | Dense, contextual | Transformer-based |

### Bag of Words Example

For the corpus: ["I love NLP", "I love Python", "NLP is great"]:

| | I | love | NLP | Python | is | great |
|---|---|------|-----|--------|----|----|
| Doc 1 | 1 | 1 | 1 | 0 | 0 | 0 |
| Doc 2 | 1 | 1 | 0 | 1 | 0 | 0 |
| Doc 3 | 0 | 0 | 1 | 0 | 1 | 1 |

### TF-IDF (Term Frequency - Inverse Document Frequency)

TF-IDF weighs words by how important they are to a document relative to the corpus:

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \text{IDF}(t)$$

Where:

$$\text{TF}(t, d) = \frac{\text{count of } t \text{ in } d}{\text{total terms in } d}$$

$$\text{IDF}(t) = \log\frac{N}{|\{d : t \in d\}|}$$

- $N$ = total number of documents
- $|\{d : t \in d\}|$ = number of documents containing term $t$

Common words get low IDF (less important), rare words get high IDF (more important).

---

## Step 5: Model Training / Inference

Train a machine learning model on the vectorized features.

### Common Models by Task

| Task | Traditional ML | Deep Learning |
|------|---------------|---------------|
| Text Classification | Naive Bayes, SVM, Logistic Regression | CNN, LSTM, BERT |
| Sentiment Analysis | Naive Bayes, Random Forest | BERT, RoBERTa |
| Named Entity Recognition | CRF, HMM | BiLSTM-CRF, BERT |
| Machine Translation | Phrase-based SMT | Transformer, seq2seq |
| Text Generation | N-gram LM | GPT, T5 |

### Training vs. Inference

| Phase | Purpose | Data |
|-------|---------|------|
| Training | Learn patterns from data | Labeled training set |
| Validation | Tune hyperparameters | Held-out validation set |
| Testing | Final performance check | Unseen test set |
| Inference | Make predictions on new data | Production data |

---

## Step 6: Evaluation

Measure how well your model performs.

### Common Metrics

| Metric | Formula | Best For |
|--------|---------|----------|
| Accuracy | $\frac{\text{correct}}{\text{total}}$ | Balanced datasets |
| Precision | $\frac{TP}{TP + FP}$ | When false positives are costly |
| Recall | $\frac{TP}{TP + FN}$ | When false negatives are costly |
| F1-Score | $\frac{2 \cdot P \cdot R}{P + R}$ | Imbalanced datasets |
| AUC-ROC | Area under ROC curve | Binary classification |

### Confusion Matrix

```
                 Predicted
              Spam    Not Spam
Actual Spam    [TP]     [FN]
Not Spam       [FP]     [TN]
```

- **TP** (True Positive): correctly identified spam
- **FP** (False Positive): ham incorrectly flagged as spam
- **FN** (False Negative): spam that slipped through
- **TN** (True Negative): correctly identified ham

---

## Step 7: Deployment

Put your trained model into production.

### Deployment Options

| Method | Description | Use Case |
|--------|-------------|----------|
| REST API | HTTP endpoint (Flask/FastAPI) | Real-time predictions |
| Batch processing | Run on scheduled data | Daily reports |
| Edge deployment | On-device models | Mobile apps |
| Serverless | Cloud functions | Low-traffic, cost-efficient |
| Streaming | Process data in real-time | Social media monitoring |

### Production Concerns

- **Latency**: How fast must predictions be?
- **Throughput**: How many requests per second?
- **Model updates**: How often to retrain?
- **Monitoring**: Detecting model drift
- **Scaling**: Handling load spikes

---

## Pipeline Diagram

Here's the complete NLP pipeline visualized:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NLP PIPELINE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Data   │───▶│  Text    │───▶│ Preprocessing│───▶│  Feature  │  │
│  │Collection│    │ Cleaning │    │              │    │Extraction │  │
│  └──────────┘    └──────────┘    └──────────────┘    └─────┬─────┘  │
│                                                            │         │
│                                                            ▼         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  Deploy  │◀───│Evaluation│◀───│    Model     │◀───│  Feature  │  │
│  │          │    │          │    │  Training    │    │  Vectors  │  │
│  └──────────┘    └──────────┘    └──────────────┘    └───────────┘  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tools for Each Step

| Step | Python Tools |
|------|-------------|
| Data Collection | `requests`, `BeautifulSoup`, `scrapy`, `tweepy` |
| Text Cleaning | `re` (regex), `ftfy`, `bleach` |
| Preprocessing | `nltk`, `spacy`, `textblob` |
| Feature Extraction | `sklearn` (TF-IDF, BoW), `gensim` (Word2Vec) |
| Model Training | `sklearn`, `pytorch`, `tensorflow`, `transformers` |
| Evaluation | `sklearn.metrics`, `seqeval` |
| Deployment | `flask`, `fastapi`, `docker`, `mlflow` |

---

## End-to-End Example: Spam Classifier Pipeline

Let's build a complete spam classifier from scratch:

```python
# === Complete NLP Pipeline: Spam Classifier ===
import re
from collections import Counter
import math

# ============================================
# STEP 1: Data Collection
# ============================================
# Simulated labeled dataset (in practice, load from file/API)
dataset = [
    ("Free money! Click here now to claim your prize!", "spam"),
    ("Hey, are we still meeting for lunch tomorrow?", "ham"),
    ("CONGRATULATIONS! You've won a $1000 gift card!", "spam"),
    ("Can you send me the project report by Friday?", "ham"),
    ("Buy cheap medications online! Limited offer!", "spam"),
    ("Thanks for the great presentation yesterday.", "ham"),
    ("URGENT: Your account has been compromised! Click to verify", "spam"),
    ("I'll pick up the kids from school today.", "ham"),
    ("Make $5000 per week working from home!!!", "spam"),
    ("The team meeting has been moved to 3pm.", "ham"),
    ("Lose weight fast! Doctor recommended pills!", "spam"),
    ("Can we reschedule our call to next Monday?", "ham"),
    ("You have been selected for an exclusive deal!", "spam"),
    ("Happy birthday! Hope you have a wonderful day.", "ham"),
    ("Act now! Only 2 hours left for this offer!", "spam"),
    ("Please review the attached document when you can.", "ham"),
]

print(f"Dataset size: {len(dataset)} samples")
print(f"Spam: {sum(1 for _, l in dataset if l == 'spam')}")
print(f"Ham: {sum(1 for _, l in dataset if l == 'ham')}")

# ============================================
# STEP 2: Text Cleaning
# ============================================
def clean_text(text):
    """Remove noise from text."""
    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+", "", text)
    # Remove special characters (keep letters, numbers, spaces)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text

# Clean all texts
cleaned_data = [(clean_text(text), label) for text, label in dataset]

print("\n=== Cleaning Examples ===")
for i in range(3):
    print(f"Original: {dataset[i][0]}")
    print(f"Cleaned:  {cleaned_data[i][0]}\n")

# ============================================
# STEP 3: Preprocessing
# ============================================
# Simple stop words list
STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "it", "this", "that", "these", "those", "i", "me", "my",
    "we", "our", "you", "your", "he", "she", "they", "them",
}

def preprocess(text):
    """Tokenize, lowercase, remove stop words."""
    # Lowercase
    text = text.lower()
    # Tokenize (simple split)
    tokens = text.split()
    # Remove stop words
    tokens = [t for t in tokens if t not in STOP_WORDS]
    return tokens

# Preprocess all texts
processed_data = [(preprocess(text), label) for text, label in cleaned_data]

print("=== Preprocessing Examples ===")
for i in range(3):
    print(f"Cleaned: {cleaned_data[i][0]}")
    print(f"Tokens:  {processed_data[i][0]}\n")
```

### Feature Extraction and Model

```python
# ============================================
# STEP 4: Feature Extraction (TF-IDF from scratch)
# ============================================
def build_vocabulary(processed_docs):
    """Build vocabulary from processed documents."""
    vocab = set()
    for tokens, _ in processed_docs:
        vocab.update(tokens)
    return sorted(vocab)

def compute_tf(tokens, vocab):
    """Compute term frequency for a document."""
    tf = {}
    token_count = Counter(tokens)
    total = len(tokens)
    for word in vocab:
        tf[word] = token_count.get(word, 0) / total if total > 0 else 0
    return tf

def compute_idf(processed_docs, vocab):
    """Compute inverse document frequency."""
    N = len(processed_docs)
    idf = {}
    for word in vocab:
        doc_count = sum(1 for tokens, _ in processed_docs if word in tokens)
        idf[word] = math.log((N + 1) / (doc_count + 1)) + 1  # Smoothed IDF
    return idf

def compute_tfidf(tokens, vocab, idf):
    """Compute TF-IDF vector for a document."""
    tf = compute_tf(tokens, vocab)
    return [tf[word] * idf[word] for word in vocab]

# Build vocabulary and compute IDF
vocab = build_vocabulary(processed_data)
idf = compute_idf(processed_data, vocab)

print(f"Vocabulary size: {len(vocab)}")
print(f"First 10 words: {vocab[:10]}")

# Vectorize all documents
vectors = [(compute_tfidf(tokens, vocab, idf), label)
           for tokens, label in processed_data]

# ============================================
# STEP 5: Model Training (Naive Bayes from scratch)
# ============================================
class SimpleNaiveBayes:
    """A simplified Naive Bayes classifier."""

    def __init__(self):
        self.class_priors = {}
        self.feature_means = {}

    def fit(self, X, y):
        """Train the classifier."""
        classes = set(y)
        N = len(y)

        for cls in classes:
            # Prior probability
            cls_count = sum(1 for label in y if label == cls)
            self.class_priors[cls] = cls_count / N

            # Mean feature values for this class
            cls_vectors = [X[i] for i in range(N) if y[i] == cls]
            n_features = len(X[0])
            self.feature_means[cls] = [
                sum(v[j] for v in cls_vectors) / len(cls_vectors)
                for j in range(n_features)
            ]

        print(f"Model trained on {N} samples")
        print(f"Classes: {dict(self.class_priors)}")

    def predict(self, x):
        """Predict class for a single vector."""
        scores = {}
        for cls in self.class_priors:
            # Log prior
            score = math.log(self.class_priors[cls])
            # Simple similarity (dot product with class mean)
            mean = self.feature_means[cls]
            score += sum(x[i] * mean[i] for i in range(len(x)))
            scores[cls] = score
        return max(scores, key=scores.get)


# Split data (first 12 = train, last 4 = test)
train_X = [v for v, _ in vectors[:12]]
train_y = [l for _, l in vectors[:12]]
test_X = [v for v, _ in vectors[12:]]
test_y = [l for _, l in vectors[12:]]

# Train
model = SimpleNaiveBayes()
model.fit(train_X, train_y)

# ============================================
# STEP 6: Evaluation
# ============================================
print("\n=== Evaluation ===")
correct = 0
predictions = []

for i, (x, true_label) in enumerate(zip(test_X, test_y)):
    pred = model.predict(x)
    predictions.append(pred)
    is_correct = pred == true_label
    correct += int(is_correct)
    print(f"  Text: \"{dataset[12 + i][0][:50]}...\"")
    print(f"  True: {true_label} | Predicted: {pred} | {'✓' if is_correct else '✗'}")

accuracy = correct / len(test_y)
print(f"\nAccuracy: {accuracy:.1%} ({correct}/{len(test_y)})")

# ============================================
# STEP 7: Deployment (Simple prediction function)
# ============================================
def predict_spam(text):
    """Complete pipeline: text in → prediction out."""
    # Clean
    cleaned = clean_text(text)
    # Preprocess
    tokens = preprocess(cleaned)
    # Vectorize
    vector = compute_tfidf(tokens, vocab, idf)
    # Predict
    prediction = model.predict(vector)
    return prediction

# Test deployment
print("\n=== Deployment Test ===")
test_messages = [
    "Win a free iPhone! Click here immediately!",
    "Hey, want to grab coffee after work?",
    "LAST CHANCE: 90% discount on all products!!!",
    "The quarterly report is ready for your review.",
]

for msg in test_messages:
    result = predict_spam(msg)
    print(f"  [{result:>4}] {msg}")
```

Output:

```
=== Deployment Test ===
  [spam] Win a free iPhone! Click here immediately!
  [ ham] Hey, want to grab coffee after work?
  [spam] LAST CHANCE: 90% discount on all products!!!
  [ ham] The quarterly report is ready for your review.
```

---

## Summary

In this lesson, you learned:

- The **7 steps** of a typical NLP pipeline
- **Data collection**: gathering text from various sources
- **Text cleaning**: removing noise (HTML, URLs, special characters)
- **Preprocessing**: tokenization, lowercasing, stop word removal
- **Feature extraction**: converting text to numbers (BoW, TF-IDF)
- **Model training**: choosing and training appropriate models
- **Evaluation**: measuring with accuracy, precision, recall, F1
- **Deployment**: serving models in production
- Built a complete **spam classifier** from scratch

Every NLP project follows this pipeline. The specific tools and techniques vary, but the structure remains the same.

---

## Exercises

1. Extend the spam classifier with more training data (20+ examples) and measure improvement
2. Add a "confidence score" to the `predict_spam` function
3. Implement precision and recall metrics for the test set
4. Replace the simple tokenizer with one that handles contractions (e.g., "don't" → "do", "not")
