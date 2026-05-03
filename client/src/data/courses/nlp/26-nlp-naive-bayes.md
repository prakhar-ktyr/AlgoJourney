---
title: Naive Bayes for Text
---

# Naive Bayes for Text

Naive Bayes is one of the most popular and effective algorithms for **text classification**. Despite its simplicity, it often outperforms more complex methods on text data.

---

## Bayes' Theorem

At the heart of Naive Bayes is **Bayes' theorem**, which describes how to update probabilities given new evidence:

$$P(c|d) = \frac{P(d|c) \cdot P(c)}{P(d)}$$

Where:
- $P(c|d)$ = probability of class $c$ given document $d$ (posterior)
- $P(d|c)$ = probability of document $d$ given class $c$ (likelihood)
- $P(c)$ = prior probability of class $c$
- $P(d)$ = probability of document $d$ (evidence)

**In plain English:** Given a document, what is the probability it belongs to a particular class?

---

## The Naive Assumption

The "naive" part comes from a strong assumption: **all features (words) are independent of each other** given the class.

This means:

$$P(d|c) = P(w_1|c) \cdot P(w_2|c) \cdot P(w_3|c) \cdots P(w_n|c)$$

$$P(d|c) = \prod_{i=1}^{n} P(w_i|c)$$

**Is this realistic?** No! Words in a sentence are clearly not independent. "New" and "York" often appear together. But despite this unrealistic assumption, Naive Bayes works surprisingly well for text classification.

---

## Why It Works for Text

Even though the independence assumption is violated:

1. **Classification only needs the correct ranking** — we just need the right class to have the highest probability, not exact probabilities
2. **Dependencies often cancel out** — word correlations may affect both classes equally
3. **High-dimensional sparse data** — text has many features (words), and Naive Bayes handles this efficiently
4. **Limited training data** — fewer parameters to estimate means less overfitting

---

## Types of Naive Bayes

| Type | Best For | Features |
|------|----------|----------|
| **Multinomial NB** | Text classification | Word counts / TF-IDF |
| **Bernoulli NB** | Short texts | Binary word presence |
| **Gaussian NB** | Continuous data | Real-valued features |

For text classification, **Multinomial Naive Bayes** is the go-to choice.

---

## Multinomial Naive Bayes

Multinomial NB models text as a **bag of words** with word frequencies. It calculates:

$$\hat{c} = \arg\max_c \left[ \log P(c) + \sum_{i=1}^{n} f_i \cdot \log P(w_i|c) \right]$$

Where:
- $\hat{c}$ = predicted class
- $f_i$ = frequency of word $w_i$ in the document
- We use log probabilities to avoid floating-point underflow

---

## How It Works Step by Step

Let's classify emails as **spam** or **ham** (not spam).

### Training Data

| Email | Label |
|-------|-------|
| "buy cheap pills now" | spam |
| "win free money today" | spam |
| "meeting tomorrow at office" | ham |
| "project deadline reminder" | ham |

### Step 1: Calculate Prior Probabilities

$$P(\text{spam}) = \frac{2}{4} = 0.5$$

$$P(\text{ham}) = \frac{2}{4} = 0.5$$

### Step 2: Calculate Word Likelihoods

Count words in each class:

**Spam words:** buy, cheap, pills, now, win, free, money, today (8 total)

**Ham words:** meeting, tomorrow, at, office, project, deadline, reminder (7 total)

$$P(\text{free}|\text{spam}) = \frac{1}{8} = 0.125$$

$$P(\text{free}|\text{ham}) = \frac{0}{7} = 0 \quad \text{(problem!)}$$

### Step 3: Classify New Document

New email: "free money"

$$P(\text{spam}|\text{free money}) \propto P(\text{spam}) \cdot P(\text{free}|\text{spam}) \cdot P(\text{money}|\text{spam})$$

$$= 0.5 \times 0.125 \times 0.125 = 0.0078$$

But $P(\text{free}|\text{ham}) = 0$, which makes the entire ham probability zero. This is where **Laplace smoothing** helps.

---

## Laplace Smoothing

When a word never appears in a class during training, its probability is zero — which zeros out the entire calculation. **Laplace smoothing** (add-one smoothing) fixes this:

$$P(w_i|c) = \frac{\text{count}(w_i, c) + \alpha}{\text{count}(c) + \alpha \cdot |V|}$$

Where:
- $\alpha$ = smoothing parameter (usually 1)
- $|V|$ = vocabulary size (total unique words)

### With Smoothing ($\alpha = 1$, $|V| = 15$):

$$P(\text{free}|\text{spam}) = \frac{1 + 1}{8 + 15} = \frac{2}{23} \approx 0.087$$

$$P(\text{free}|\text{ham}) = \frac{0 + 1}{7 + 15} = \frac{1}{22} \approx 0.045$$

Now no probability is ever zero!

---

## Training: Estimating Parameters

Training a Naive Bayes classifier is extremely fast — it's just counting:

1. **Count documents per class** → prior probabilities
2. **Count words per class** → word likelihoods
3. **Apply smoothing** → handle unseen words

```python
import numpy as np
from collections import defaultdict

class SimpleNaiveBayes:
    """A simple Multinomial Naive Bayes from scratch."""

    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.class_priors = {}
        self.word_probs = {}
        self.vocab = set()

    def fit(self, documents, labels):
        """Train the classifier."""
        # Count documents per class
        class_counts = defaultdict(int)
        word_counts = defaultdict(lambda: defaultdict(int))
        class_word_totals = defaultdict(int)

        for doc, label in zip(documents, labels):
            class_counts[label] += 1
            words = doc.lower().split()
            for word in words:
                self.vocab.add(word)
                word_counts[label][word] += 1
                class_word_totals[label] += 1

        total_docs = len(documents)
        vocab_size = len(self.vocab)

        # Calculate priors
        for c in class_counts:
            self.class_priors[c] = class_counts[c] / total_docs

        # Calculate word probabilities with smoothing
        self.word_probs = {}
        for c in class_counts:
            self.word_probs[c] = {}
            for word in self.vocab:
                count = word_counts[c][word]
                self.word_probs[c][word] = (
                    (count + self.alpha)
                    / (class_word_totals[c] + self.alpha * vocab_size)
                )

    def predict(self, document):
        """Classify a document."""
        words = document.lower().split()
        scores = {}

        for c in self.class_priors:
            # Start with log prior
            score = np.log(self.class_priors[c])
            # Add log likelihoods
            for word in words:
                if word in self.vocab:
                    score += np.log(self.word_probs[c][word])
            scores[c] = score

        return max(scores, key=scores.get)


# Example usage
docs = [
    "buy cheap pills now",
    "win free money today",
    "limited offer buy now",
    "meeting tomorrow at office",
    "project deadline reminder",
    "team lunch on friday",
]
labels = ["spam", "spam", "spam", "ham", "ham", "ham"]

nb = SimpleNaiveBayes()
nb.fit(docs, labels)

test_emails = ["free pills offer", "meeting deadline friday"]
for email in test_emails:
    prediction = nb.predict(email)
    print(f"'{email}' -> {prediction}")
```

**Output:**
```
'free pills offer' -> spam
'meeting deadline friday' -> ham
```

---

## scikit-learn MultinomialNB

In practice, use scikit-learn for a production-ready implementation:

```python
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import Pipeline

# Sample dataset
emails = [
    "buy cheap viagra pills online",
    "win a free iphone now click here",
    "congratulations you won the lottery",
    "free money no credit check required",
    "limited time offer buy one get one",
    "claim your prize winner selected",
    "meeting scheduled for tomorrow morning",
    "please review the attached document",
    "project update status report due friday",
    "team lunch at noon in conference room",
    "can you send me the quarterly report",
    "reminder about the deadline next week",
    "great job on the presentation today",
    "let me know your availability for call",
    "the budget proposal needs your approval",
    "attached are the meeting notes from today",
]
labels = [
    "spam", "spam", "spam", "spam", "spam", "spam",
    "ham", "ham", "ham", "ham", "ham", "ham",
    "ham", "ham", "ham", "ham",
]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    emails, labels, test_size=0.25, random_state=42
)

# Create pipeline: vectorizer + classifier
pipeline = Pipeline([
    ("vectorizer", TfidfVectorizer(stop_words="english")),
    ("classifier", MultinomialNB(alpha=1.0)),
])

# Train
pipeline.fit(X_train, y_train)

# Predict
predictions = pipeline.predict(X_test)

# Evaluate
print("Accuracy:", accuracy_score(y_test, predictions))
print("\nClassification Report:")
print(classification_report(y_test, predictions))

# Classify new emails
new_emails = [
    "you have won a million dollars click now",
    "please find the attached report for review",
    "free trial offer expires today act now",
]

for email in new_emails:
    pred = pipeline.predict([email])[0]
    proba = pipeline.predict_proba([email])[0]
    print(f"\n'{email}'")
    print(f"  Prediction: {pred}")
    print(f"  Confidence: {max(proba):.2%}")
```

---

## Full Pipeline: Spam Classifier

Here's a complete spam classification pipeline with proper preprocessing:

```python
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
)
from sklearn.pipeline import Pipeline
import matplotlib.pyplot as plt
import numpy as np
import re


def preprocess_text(text):
    """Clean and preprocess text."""
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "URL", text)
    text = re.sub(r"\d+", "NUM", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# For a real project, load SMS Spam Collection dataset:
# import pandas as pd
# df = pd.read_csv("SMSSpamCollection", sep="\t", names=["label", "text"])

# Simulated dataset for demonstration
texts = [
    "Free entry in a weekly competition to win prizes",
    "You have won a guaranteed cash prize call now",
    "URGENT! Your mobile number has won a prize",
    "Congratulations! You've been selected for a free gift",
    "Buy one get one free limited time only",
    "Click here to claim your reward immediately",
    "Hey, are you coming to the party tonight?",
    "Can we reschedule the meeting to next week?",
    "I'll pick up groceries on my way home",
    "The report is ready for your review",
    "Happy birthday! Hope you have a great day",
    "Don't forget to submit your assignment by Friday",
    "Let's grab coffee tomorrow after work",
    "Thanks for the help with the project",
    "Call me when you get a chance",
    "The train leaves at 8:30 from platform 3",
]
labels = [
    "spam", "spam", "spam", "spam", "spam", "spam",
    "ham", "ham", "ham", "ham", "ham", "ham",
    "ham", "ham", "ham", "ham",
]

# Preprocess
texts_clean = [preprocess_text(t) for t in texts]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    texts_clean, labels, test_size=0.25, random_state=42, stratify=labels
)

# Build pipeline
spam_classifier = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english",
    )),
    ("nb", MultinomialNB(alpha=0.5)),
])

# Cross-validation
cv_scores = cross_val_score(spam_classifier, X_train, y_train, cv=3)
print(f"Cross-validation accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# Train final model
spam_classifier.fit(X_train, y_train)

# Evaluate
y_pred = spam_classifier.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Show most informative features
vectorizer = spam_classifier.named_steps["tfidf"]
classifier = spam_classifier.named_steps["nb"]
feature_names = vectorizer.get_feature_names_out()

# Top spam indicators
spam_idx = list(classifier.classes_).index("spam")
log_probs = classifier.feature_log_prob_[spam_idx]
top_spam = np.argsort(log_probs)[-10:]

print("\nTop spam indicator words:")
for idx in reversed(top_spam):
    print(f"  {feature_names[idx]}: {np.exp(log_probs[idx]):.4f}")
```

---

## Hyperparameter Tuning

The main hyperparameter for Multinomial NB is `alpha` (smoothing):

```python
from sklearn.model_selection import GridSearchCV

# Search for best alpha
param_grid = {
    "nb__alpha": [0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
    "tfidf__ngram_range": [(1, 1), (1, 2)],
    "tfidf__max_features": [1000, 5000, 10000],
}

grid_search = GridSearchCV(
    spam_classifier,
    param_grid,
    cv=3,
    scoring="f1_weighted",
    n_jobs=-1,
)
grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best F1 score: {grid_search.best_score_:.3f}")
```

---

## Advantages and Limitations

### Advantages
- **Fast training and prediction** — just counting
- **Works well with small datasets** — few parameters to estimate
- **Handles high dimensions** — scales to large vocabularies
- **Interpretable** — can see which words drive predictions
- **Good baseline** — often surprisingly competitive

### Limitations
- **Independence assumption** — words are not truly independent
- **Cannot capture word order** — "not good" treated same as "good not"
- **Sensitive to feature extraction** — results depend on vectorization choices
- **Poor probability estimates** — confident but often miscalibrated

---

## When to Use Naive Bayes

| Use Case | Recommendation |
|----------|---------------|
| Text classification (spam, sentiment) | Excellent choice |
| Many features, limited data | Good choice |
| Need fast training | Good choice |
| Need interpretability | Good choice |
| Complex feature interactions matter | Consider other methods |
| Need accurate probability estimates | Use calibration or other models |

---

## Summary

- Naive Bayes uses **Bayes' theorem** with a feature independence assumption
- **Multinomial NB** is best for text: models word frequencies
- Training is just **counting** — extremely fast
- **Laplace smoothing** prevents zero probabilities
- Works surprisingly well for text despite the naive assumption
- Often the **first model to try** for any text classification task
- Use scikit-learn's `MultinomialNB` with `TfidfVectorizer` for production

---

## Next Steps

Next, we'll apply classification to a specific task: [Sentiment Analysis](27-nlp-sentiment-analysis.md), where we determine whether text expresses positive, negative, or neutral opinions.
