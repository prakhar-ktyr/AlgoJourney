---
title: Text Classification
---

# Text Classification

**Text classification** is the task of assigning predefined categories (labels) to text documents. It is one of the most common and practical NLP tasks, powering everything from spam filters to content recommendation systems.

---

## What Is Text Classification?

Given a piece of text, predict which category it belongs to:

| Input Text | Predicted Label |
|-----------|-----------------|
| "You've won a free iPhone! Click here!" | Spam |
| "Meeting rescheduled to 3 PM tomorrow" | Not Spam |
| "This movie was absolutely fantastic!" | Positive |
| "Terrible acting and boring plot" | Negative |
| "How do I reset my password?" | Account Help |

---

## Applications

Text classification appears everywhere in modern software:

- **Spam detection** — filtering unwanted emails
- **Sentiment analysis** — determining positive/negative opinions
- **Topic labeling** — categorizing news articles (sports, politics, tech)
- **Intent detection** — understanding user intent in chatbots
- **Language detection** — identifying the language of a text
- **Toxicity detection** — flagging harmful content
- **Customer support routing** — directing tickets to the right team
- **Medical coding** — assigning diagnosis codes to clinical notes

---

## The Classification Pipeline

Every text classification system follows a similar pipeline:

```
Raw Text → Preprocessing → Feature Extraction → Model Training → Prediction
```

```python
# High-level pipeline overview
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB

# Complete pipeline in 3 lines:
pipeline = Pipeline([
    ("vectorizer", TfidfVectorizer()),   # Text → Numbers
    ("classifier", MultinomialNB()),      # Numbers → Labels
])

# Train
pipeline.fit(X_train, y_train)

# Predict
predictions = pipeline.predict(X_test)
```

---

## Step 1: Text Preprocessing

Clean and normalize text before feeding it to a model:

```python
import re
import string

def preprocess_text(text):
    """Basic text preprocessing for classification."""
    # Convert to lowercase
    text = text.lower()

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", "", text)

    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text

# Example
raw = "Check out <b>this AMAZING</b> deal at http://example.com!! #wow"
clean = preprocess_text(raw)
print(f"Raw: {raw}")
print(f"Clean: {clean}")
# Output: "check out this amazing deal at wow"
```

---

## Step 2: Feature Extraction

Convert text into numerical features that ML models can process.

### Bag of Words (BoW)

Count how many times each word appears:

```python
from sklearn.feature_extraction.text import CountVectorizer

corpus = [
    "I love machine learning",
    "I love natural language processing",
    "machine learning is amazing",
]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(corpus)

print("Vocabulary:", vectorizer.get_feature_names_out())
print("\nBoW matrix:")
print(X.toarray())
```

Output:
```
Vocabulary: ['amazing' 'is' 'language' 'learning' 'love' 'machine' 'natural' 'processing']

BoW matrix:
[[0 0 0 1 1 1 0 0]   ← "I love machine learning"
 [0 0 1 0 1 0 1 1]   ← "I love natural language processing"
 [1 1 0 1 0 1 0 0]]  ← "machine learning is amazing"
```

### TF-IDF

Weight words by importance (rare words get higher weight):

$$\text{TF-IDF}(t, d) = \text{TF}(t, d) \times \log\frac{N}{\text{DF}(t)}$$

Where:
- $\text{TF}(t, d)$ — term frequency of $t$ in document $d$
- $N$ — total number of documents
- $\text{DF}(t)$ — number of documents containing $t$

```python
from sklearn.feature_extraction.text import TfidfVectorizer

corpus = [
    "I love machine learning",
    "I love natural language processing",
    "machine learning is amazing",
]

tfidf = TfidfVectorizer()
X = tfidf.fit_transform(corpus)

print("TF-IDF features:")
feature_names = tfidf.get_feature_names_out()
for i, doc in enumerate(corpus):
    print(f"\n  Document {i}: '{doc}'")
    scores = X[i].toarray().flatten()
    for name, score in zip(feature_names, scores):
        if score > 0:
            print(f"    {name}: {score:.4f}")
```

### Word Embeddings as Features

Use pre-trained word embeddings (covered in previous lessons):

```python
import numpy as np

def text_to_embedding(text, word_vectors, dim=100):
    """Convert text to a fixed-size vector using word embeddings."""
    words = text.lower().split()
    vectors = [word_vectors[w] for w in words if w in word_vectors]

    if not vectors:
        return np.zeros(dim)
    return np.mean(vectors, axis=0)
```

---

## Step 3: Classical ML Classifiers

### Naive Bayes

Based on Bayes' theorem with the "naive" independence assumption:

$$P(c|d) = \frac{P(d|c) \cdot P(c)}{P(d)}$$

Fast training, works well with BoW/TF-IDF features:

```python
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split

# Example dataset
texts = [
    "free money winner click now", "congratulations you won a prize",
    "urgent action required claim your reward", "lottery winner notification",
    "meeting tomorrow at 3pm", "please review the attached document",
    "lunch plans for friday", "project deadline extended to next week",
    "can you send me the report", "happy birthday wishes to you",
]
labels = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]  # 1=spam, 0=not spam

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    texts, labels, test_size=0.3, random_state=42
)

# Vectorize + classify
vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# Train Naive Bayes
nb_model = MultinomialNB()
nb_model.fit(X_train_tfidf, y_train)

# Predict
predictions = nb_model.predict(X_test_tfidf)
print("Predictions:", predictions)
print("Actual:     ", y_test)
```

### Support Vector Machine (SVM)

Finds the hyperplane that best separates classes. Excellent for text classification:

```python
from sklearn.svm import LinearSVC

svm_model = LinearSVC(max_iter=10000)
svm_model.fit(X_train_tfidf, y_train)

predictions = svm_model.predict(X_test_tfidf)
print("SVM predictions:", predictions)
```

### Logistic Regression

A simple yet effective linear classifier:

```python
from sklearn.linear_model import LogisticRegression

lr_model = LogisticRegression(max_iter=1000)
lr_model.fit(X_train_tfidf, y_train)

# Get probability estimates
probabilities = lr_model.predict_proba(X_test_tfidf)
print("Class probabilities:")
for text, probs in zip(X_test, probabilities):
    print(f"  '{text[:30]}...' → Not Spam: {probs[0]:.3f}, Spam: {probs[1]:.3f}")
```

### Random Forest

An ensemble of decision trees:

```python
from sklearn.ensemble import RandomForestClassifier

rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_tfidf.toarray(), y_train)

predictions = rf_model.predict(X_test_tfidf.toarray())
print("Random Forest predictions:", predictions)
```

---

## Step 4: Evaluation Metrics

### Core Metrics

For a binary classifier:

- **Accuracy** = $\frac{TP + TN}{TP + TN + FP + FN}$

- **Precision** = $\frac{TP}{TP + FP}$ — "Of all predicted positive, how many are correct?"

- **Recall** = $\frac{TP}{TP + FN}$ — "Of all actual positive, how many did we find?"

- **F1 Score** = $2 \cdot \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$ — harmonic mean of precision and recall

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, classification_report, confusion_matrix
)

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 1, 0, 0, 1, 1, 0, 1, 0]

print(f"Accuracy:  {accuracy_score(y_true, y_pred):.4f}")
print(f"Precision: {precision_score(y_true, y_pred):.4f}")
print(f"Recall:    {recall_score(y_true, y_pred):.4f}")
print(f"F1 Score:  {f1_score(y_true, y_pred):.4f}")

print("\nClassification Report:")
print(classification_report(y_true, y_pred, target_names=["Not Spam", "Spam"]))
```

### Confusion Matrix

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import ConfusionMatrixDisplay

cm = confusion_matrix(y_true, y_pred)
print("Confusion Matrix:")
print(cm)
# [[TN, FP],
#  [FN, TP]]

# Visualize
disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=["Not Spam", "Spam"]
)
disp.plot(cmap="Blues")
plt.title("Confusion Matrix")
plt.show()
```

---

## Multiclass vs Multilabel Classification

### Multiclass: One label per document

Each document belongs to exactly **one** category:

```python
# Multiclass: topic classification
# Each article has ONE topic
texts = ["goal scored in final minute", "stock market crashes", "new python release"]
labels = ["sports", "finance", "technology"]
# ONE label per document
```

### Multilabel: Multiple labels per document

Each document can have **multiple** categories:

```python
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.multiclass import OneVsRestClassifier
from sklearn.linear_model import LogisticRegression

# Multilabel: a movie can be Action AND Comedy AND Sci-Fi
texts = [
    "A thrilling space adventure with lots of laughs",
    "Romantic comedy set in New York City",
    "Dark psychological thriller about a detective",
]
labels = [
    ["action", "comedy", "scifi"],
    ["romance", "comedy"],
    ["thriller", "drama"],
]

# Binarize labels
mlb = MultiLabelBinarizer()
y = mlb.fit_transform(labels)
print("Label matrix:")
print(y)
print("Classes:", mlb.classes_)

# Use OneVsRest strategy
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

clf = OneVsRestClassifier(LogisticRegression(max_iter=1000))
clf.fit(X, y)

# Predict on new text
new_text = ["An exciting comedy about astronauts"]
new_X = vectorizer.transform(new_text)
prediction = clf.predict(new_X)
predicted_labels = mlb.inverse_transform(prediction)
print(f"\nPredicted labels: {predicted_labels}")
```

---

## Complete Example: 20 Newsgroups Classification

A full pipeline using the classic 20 Newsgroups dataset:

```python
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import cross_val_score
import numpy as np

# Load dataset (subset of categories for faster training)
categories = [
    "rec.sport.baseball",
    "sci.med",
    "comp.graphics",
    "talk.politics.mideast",
    "misc.forsale",
]

train_data = fetch_20newsgroups(
    subset="train", categories=categories, random_state=42
)
test_data = fetch_20newsgroups(
    subset="test", categories=categories, random_state=42
)

print(f"Training samples: {len(train_data.data)}")
print(f"Test samples: {len(test_data.data)}")
print(f"Categories: {train_data.target_names}")
print(f"\nSample document (first 200 chars):")
print(train_data.data[0][:200])
```

```python
# Define multiple pipelines to compare
pipelines = {
    "Naive Bayes": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=10000, stop_words="english")),
        ("clf", MultinomialNB()),
    ]),
    "Logistic Regression": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=10000, stop_words="english")),
        ("clf", LogisticRegression(max_iter=1000)),
    ]),
    "SVM": Pipeline([
        ("tfidf", TfidfVectorizer(max_features=10000, stop_words="english")),
        ("clf", LinearSVC(max_iter=10000)),
    ]),
}

# Train and evaluate each model
results = {}
for name, pipeline in pipelines.items():
    # Train
    pipeline.fit(train_data.data, train_data.target)

    # Predict
    predictions = pipeline.predict(test_data.data)

    # Evaluate
    accuracy = accuracy_score(test_data.target, predictions)
    results[name] = accuracy

    print(f"\n{'='*60}")
    print(f"Model: {name} (Accuracy: {accuracy:.4f})")
    print(f"{'='*60}")
    print(classification_report(
        test_data.target, predictions,
        target_names=test_data.target_names
    ))

# Summary comparison
print("\n" + "="*40)
print("MODEL COMPARISON")
print("="*40)
for name, acc in sorted(results.items(), key=lambda x: x[1], reverse=True):
    print(f"  {name:25s} → {acc:.4f}")
```

```python
# Cross-validation for more robust evaluation
print("\nCross-Validation Results (5-fold):")
print("-" * 50)

for name, pipeline in pipelines.items():
    scores = cross_val_score(
        pipeline, train_data.data, train_data.target,
        cv=5, scoring="accuracy"
    )
    print(f"  {name:25s} → {scores.mean():.4f} ± {scores.std():.4f}")
```

```python
# Feature importance: what words matter most?
best_pipeline = pipelines["Logistic Regression"]
best_pipeline.fit(train_data.data, train_data.target)

vectorizer = best_pipeline.named_steps["tfidf"]
classifier = best_pipeline.named_steps["clf"]

feature_names = vectorizer.get_feature_names_out()

print("\nTop 10 most important words per category:")
print("-" * 50)

for i, category in enumerate(train_data.target_names):
    # Get feature weights for this class
    weights = classifier.coef_[i]
    top_indices = weights.argsort()[-10:][::-1]
    top_words = [feature_names[idx] for idx in top_indices]
    print(f"\n  {category}:")
    print(f"    {', '.join(top_words)}")
```

```python
# Interactive prediction
def classify_text(text, pipeline, target_names):
    """Classify a single text and show confidence."""
    prediction = pipeline.predict([text])[0]
    predicted_label = target_names[prediction]

    # Get decision function scores for ranking
    if hasattr(pipeline.named_steps["clf"], "decision_function"):
        scores = pipeline.decision_function([text])[0]
        ranked = sorted(
            zip(target_names, scores), key=lambda x: x[1], reverse=True
        )
        print(f"\n  Text: '{text[:60]}...'")
        print(f"  Predicted: {predicted_label}")
        print(f"  Confidence ranking:")
        for label, score in ranked:
            bar = "█" * max(0, int((score + 2) * 5))
            print(f"    {label:30s} {score:+.3f} {bar}")
    else:
        print(f"  Text: '{text[:60]}...'")
        print(f"  Predicted: {predicted_label}")

    return predicted_label

# Test predictions
test_texts = [
    "The pitcher threw a fastball and struck out the batter",
    "New graphics card supports ray tracing at 4K resolution",
    "Patient symptoms include fever headache and fatigue",
    "Selling my old laptop excellent condition best offer",
    "Tensions rise in the Middle East following the summit",
]

print("PREDICTIONS:")
for text in test_texts:
    classify_text(text, best_pipeline, train_data.target_names)
```

---

## Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC

# Define pipeline
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LinearSVC()),
])

# Define parameter grid
param_grid = {
    "tfidf__max_features": [5000, 10000, 20000],
    "tfidf__ngram_range": [(1, 1), (1, 2)],  # unigrams vs bigrams
    "tfidf__min_df": [2, 5],
    "clf__C": [0.1, 1.0, 10.0],
}

# Grid search with cross-validation
grid_search = GridSearchCV(
    pipeline, param_grid, cv=3, scoring="accuracy", n_jobs=-1, verbose=1
)
grid_search.fit(train_data.data, train_data.target)

print(f"\nBest parameters: {grid_search.best_params_}")
print(f"Best CV accuracy: {grid_search.best_score_:.4f}")

# Evaluate best model on test set
best_model = grid_search.best_estimator_
test_accuracy = best_model.score(test_data.data, test_data.target)
print(f"Test accuracy: {test_accuracy:.4f}")
```

---

## Summary

| Step | Options |
|------|---------|
| **Preprocessing** | Lowercase, remove punctuation, stopwords, stemming |
| **Feature extraction** | BoW, TF-IDF, word embeddings |
| **Classifiers** | Naive Bayes, SVM, Logistic Regression, Random Forest |
| **Evaluation** | Accuracy, Precision, Recall, F1, Confusion Matrix |
| **Tuning** | Grid search over vectorizer + classifier params |

### When to Use Which Classifier

| Classifier | Best For | Speed |
|-----------|----------|-------|
| **Naive Bayes** | Small datasets, baseline, spam filtering | Very fast |
| **Logistic Regression** | General purpose, interpretable | Fast |
| **SVM** | High-dimensional text data | Medium |
| **Random Forest** | Non-linear boundaries, feature importance | Slower |

---

## Key Takeaways

1. Text classification assigns **categories to documents** and is ubiquitous in NLP
2. The pipeline is: **preprocess → vectorize → train → evaluate**
3. **TF-IDF** is the most common feature extraction for classical ML
4. **SVM** and **Logistic Regression** typically perform best on text
5. Always evaluate with **precision, recall, and F1** — not just accuracy
6. **Cross-validation** gives more reliable performance estimates
7. **Hyperparameter tuning** can significantly improve results

---

## Try It Yourself

1. Download the 20 Newsgroups dataset and train all four classifiers
2. Compare unigrams vs bigrams (ngram_range) — which works better?
3. Try removing stopwords vs keeping them — measure the difference
4. Build a spam classifier using your own email data
5. Create a multilabel classifier for movie genres
6. Visualize the confusion matrix — which categories are most confused?
