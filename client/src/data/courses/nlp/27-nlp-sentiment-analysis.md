---
title: Sentiment Analysis
---

# Sentiment Analysis

Sentiment analysis determines the **emotional tone** behind text. It's one of the most widely used NLP applications — from monitoring brand reputation to analyzing customer feedback.

---

## What Is Sentiment Analysis?

Sentiment analysis (also called **opinion mining**) classifies text by the attitude it expresses:

| Sentiment | Example |
|-----------|---------|
| **Positive** | "I love this product! Best purchase ever." |
| **Negative** | "Terrible service. Never coming back." |
| **Neutral** | "The package arrived on Tuesday." |

Some systems also detect **intensity** (e.g., slightly positive vs. very positive) or specific **emotions** (joy, anger, sadness, surprise).

---

## Levels of Sentiment Analysis

### Document-Level

Classify the overall sentiment of an entire document or review.

> "The hotel was beautiful, staff were friendly, and the food was excellent." → **Positive**

### Sentence-Level

Analyze each sentence independently — useful when a document contains mixed opinions.

> "The camera quality is amazing. **But** the battery life is terrible." → Sentence 1: Positive, Sentence 2: Negative

### Aspect-Level

Identify sentiment toward specific **aspects** (features) of an entity.

> "The food was great but the service was slow."
> - Food → **Positive**
> - Service → **Negative**

---

## Approaches to Sentiment Analysis

### 1. Lexicon-Based (Rule-Based)

Uses a dictionary of words with associated sentiment scores:

| Word | Score |
|------|-------|
| excellent | +3 |
| good | +2 |
| bad | -2 |
| terrible | -3 |

**Advantages:** No training data needed, interpretable, fast  
**Disadvantages:** Misses context, sarcasm, new slang

### 2. Machine Learning-Based

Train a classifier (Naive Bayes, SVM, etc.) on labeled examples:

- Requires labeled training data
- Learns patterns from data
- Handles domain-specific language better

### 3. Deep Learning-Based

Use neural networks (RNNs, Transformers) for state-of-the-art results:

- Best accuracy on complex text
- Handles context and long-range dependencies
- Requires large datasets and compute

---

## VADER: Rule-Based Sentiment

**VADER** (Valence Aware Dictionary and sEntiment Reasoner) is specifically designed for social media text. It handles:

- Emoticons: `:)` → positive
- Slang: "sux" → negative
- Capitalization: "GREAT" → more intense than "great"
- Punctuation: "Good!!!" → more intense than "Good"
- Negation: "not good" → negative
- Degree modifiers: "extremely good" → very positive

```python
# Install: pip install vaderSentiment
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

# VADER returns compound score (-1 to +1) plus pos/neg/neu percentages
texts = [
    "I love this movie! It's absolutely fantastic!",
    "This is the worst restaurant I've ever been to.",
    "The weather is okay today.",
    "The food was great but the service was TERRIBLE!!!",
    "Not bad at all, I'm pleasantly surprised :)",
    "This product is a total waste of money >:(",
]

print(f"{'Text':<55} {'Compound':>8} {'Sentiment':>10}")
print("-" * 78)

for text in texts:
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]

    # Classify based on compound score
    if compound >= 0.05:
        sentiment = "Positive"
    elif compound <= -0.05:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    print(f"{text:<55} {compound:>8.3f} {sentiment:>10}")
```

**Output:**
```
Text                                                    Compound  Sentiment
------------------------------------------------------------------------------
I love this movie! It's absolutely fantastic!              0.891   Positive
This is the worst restaurant I've ever been to.          -0.685   Negative
The weather is okay today.                                0.223   Positive
The food was great but the service was TERRIBLE!!!       -0.348   Negative
Not bad at all, I'm pleasantly surprised :)               0.762   Positive
This product is a total waste of money >:(               -0.699   Negative
```

---

## VADER: Understanding Scores

VADER returns four scores:

| Score | Meaning |
|-------|---------|
| `pos` | Proportion of text that is positive |
| `neg` | Proportion of text that is negative |
| `neu` | Proportion of text that is neutral |
| `compound` | Overall normalized score (-1 to +1) |

The **compound score** is the most useful for classification:
- $\geq 0.05$ → Positive
- $\leq -0.05$ → Negative
- Between → Neutral

```python
# Detailed VADER analysis
text = "The movie was not very good, but the acting was excellent!"
scores = analyzer.polarity_scores(text)

print(f"Text: {text}")
print(f"\nDetailed scores:")
print(f"  Positive: {scores['pos']:.3f}")
print(f"  Negative: {scores['neg']:.3f}")
print(f"  Neutral:  {scores['neu']:.3f}")
print(f"  Compound: {scores['compound']:.3f}")
```

---

## TextBlob: Simple Sentiment API

**TextBlob** provides a simple API with two metrics:

- **Polarity**: -1 (negative) to +1 (positive)
- **Subjectivity**: 0 (objective/factual) to 1 (subjective/opinion)

```python
# Install: pip install textblob
from textblob import TextBlob

texts = [
    "Python is an amazing programming language!",
    "The exam was extremely difficult and unfair.",
    "Water boils at 100 degrees Celsius.",
    "I think this restaurant is the best in town.",
    "The product quality has really gone downhill.",
]

print(f"{'Text':<50} {'Polarity':>9} {'Subjectivity':>12} {'Sentiment':>10}")
print("-" * 85)

for text in texts:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    subjectivity = blob.sentiment.subjectivity

    if polarity > 0.1:
        sentiment = "Positive"
    elif polarity < -0.1:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    print(f"{text:<50} {polarity:>9.3f} {subjectivity:>12.3f} {sentiment:>10}")
```

---

## TextBlob: Sentence-Level Analysis

```python
from textblob import TextBlob

review = """
The hotel location was perfect, right in the city center.
The room was clean but quite small for the price.
The breakfast buffet was absolutely amazing with lots of variety.
However, the wifi was incredibly slow and frustrating.
Overall, I would recommend this hotel for short stays.
"""

blob = TextBlob(review)

print("Sentence-level sentiment analysis:")
print("=" * 60)

for i, sentence in enumerate(blob.sentences, 1):
    polarity = sentence.sentiment.polarity
    indicator = "+" if polarity > 0 else "-" if polarity < 0 else "~"
    print(f"\n[{indicator}] Sentence {i}: {sentence.strip()}")
    print(f"    Polarity: {polarity:.3f} | Subjectivity: {sentence.sentiment.subjectivity:.3f}")

# Overall sentiment
print(f"\n{'=' * 60}")
print(f"Overall Polarity: {blob.sentiment.polarity:.3f}")
print(f"Overall Subjectivity: {blob.sentiment.subjectivity:.3f}")
```

---

## Building a Custom Sentiment Classifier

For domain-specific sentiment, train your own model:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report
from sklearn.pipeline import Pipeline
import numpy as np

# Sample labeled dataset (in production, use thousands of examples)
reviews = [
    # Positive
    "Absolutely love this product, works perfectly",
    "Great quality and fast shipping, very satisfied",
    "Best purchase I've made this year, highly recommend",
    "Excellent customer service, they resolved my issue quickly",
    "Amazing value for money, exceeded my expectations",
    "This app is fantastic, so intuitive and useful",
    "Very happy with the results, will buy again",
    "Outstanding performance, exactly what I needed",
    # Negative
    "Terrible quality, broke after one day of use",
    "Worst customer service ever, nobody responds",
    "Complete waste of money, does not work as described",
    "Very disappointing, the product looks nothing like the photo",
    "Awful experience, shipping took forever and item was damaged",
    "Do not buy this, it's a total scam",
    "Extremely frustrated, the app crashes constantly",
    "Poor quality material, feels very cheap and flimsy",
    # Neutral
    "The product arrived on time",
    "It works as described in the specifications",
    "Standard quality for the price range",
    "Average product, nothing special but functional",
]

labels = (
    ["positive"] * 8
    + ["negative"] * 8
    + ["neutral"] * 4
)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    reviews, labels, test_size=0.3, random_state=42, stratify=labels
)

# Compare multiple classifiers
classifiers = {
    "Naive Bayes": MultinomialNB(alpha=0.5),
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Linear SVM": LinearSVC(max_iter=1000),
}

print("Classifier Comparison (Cross-Validation):")
print("=" * 50)

best_score = 0
best_name = ""

for name, clf in classifiers.items():
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
        ("clf", clf),
    ])

    scores = cross_val_score(pipeline, X_train, y_train, cv=3, scoring="f1_weighted")
    mean_score = scores.mean()
    print(f"{name:<25} F1: {mean_score:.3f} (+/- {scores.std():.3f})")

    if mean_score > best_score:
        best_score = mean_score
        best_name = name

print(f"\nBest classifier: {best_name}")

# Train best model and evaluate
best_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), stop_words="english")),
    ("clf", classifiers[best_name]),
])

best_pipeline.fit(X_train, y_train)
y_pred = best_pipeline.predict(X_test)

print(f"\nTest Set Results ({best_name}):")
print(classification_report(y_test, y_pred))
```

---

## Combining Multiple Approaches

For robust sentiment analysis, combine lexicon-based and ML-based methods:

```python
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import numpy as np


class EnsembleSentiment:
    """Combine VADER, TextBlob, and custom model for robust sentiment."""

    def __init__(self, custom_model=None):
        self.vader = SentimentIntensityAnalyzer()
        self.custom_model = custom_model

    def analyze(self, text):
        """Get sentiment from multiple sources."""
        # VADER
        vader_scores = self.vader.polarity_scores(text)
        vader_compound = vader_scores["compound"]

        # TextBlob
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity

        # Normalize to same scale (-1 to 1)
        scores = [vader_compound, textblob_polarity]

        # Custom model prediction (if available)
        if self.custom_model:
            pred = self.custom_model.predict([text])[0]
            pred_score = {"positive": 1, "neutral": 0, "negative": -1}[pred]
            scores.append(pred_score)

        # Weighted average (VADER gets more weight for social media)
        weights = [0.4, 0.3, 0.3] if self.custom_model else [0.6, 0.4]
        ensemble_score = np.average(scores, weights=weights[: len(scores)])

        # Classify
        if ensemble_score > 0.1:
            label = "positive"
        elif ensemble_score < -0.1:
            label = "negative"
        else:
            label = "neutral"

        return {
            "label": label,
            "score": ensemble_score,
            "vader": vader_compound,
            "textblob": textblob_polarity,
            "confidence": abs(ensemble_score),
        }


# Usage
ensemble = EnsembleSentiment()

test_texts = [
    "This product exceeded all my expectations!",
    "Meh, it's okay I guess. Nothing special.",
    "Absolutely horrible. I want my money back!",
    "The interface is clean but lacks advanced features.",
]

for text in test_texts:
    result = ensemble.analyze(text)
    print(f"\n'{text}'")
    print(f"  Label: {result['label']} (score: {result['score']:.3f})")
    print(f"  VADER: {result['vader']:.3f} | TextBlob: {result['textblob']:.3f}")
```

---

## Challenges in Sentiment Analysis

### 1. Sarcasm and Irony

> "Oh great, another meeting. Just what I needed." → Negative (but words seem positive)

### 2. Negation

> "This movie is not bad at all." → Positive (but contains "bad")

### 3. Domain-Specific Language

> "This stock is killing it!" → Positive (finance slang)
> "The virus is killing people." → Negative (literal meaning)

### 4. Comparative Opinions

> "iPhone is better than Samsung." → Positive for iPhone, negative for Samsung

### 5. Mixed Sentiments

> "The food was amazing but ridiculously overpriced." → Mixed

---

## Handling Negation

```python
import re


def handle_negation(text):
    """Mark words after negation to help sentiment analysis."""
    negation_words = {
        "not", "no", "never", "neither", "nobody", "nothing",
        "nowhere", "nor", "cannot", "can't", "won't", "don't",
        "doesn't", "didn't", "isn't", "aren't", "wasn't", "weren't",
    }

    words = text.lower().split()
    result = []
    negate = False

    for word in words:
        # Check if this word is a negation trigger
        clean_word = re.sub(r"[^\w']", "", word)
        if clean_word in negation_words:
            negate = True
            result.append(word)
            continue

        # End negation at punctuation
        if any(p in word for p in [".", ",", "!", "?", ";"]):
            negate = False

        if negate:
            result.append(f"NOT_{word}")
        else:
            result.append(word)

    return " ".join(result)


# Example
texts = [
    "This movie is not good at all",
    "I don't think this is bad",
    "Never have I seen such terrible acting",
]

for text in texts:
    negated = handle_negation(text)
    print(f"Original: {text}")
    print(f"Negated:  {negated}\n")
```

---

## Aspect-Based Sentiment Analysis

Analyze sentiment toward specific aspects of a product or service:

```python
from textblob import TextBlob
import re


def extract_aspects_simple(text, aspects):
    """Extract sentiment for each aspect mentioned in text."""
    sentences = text.split(".")
    aspect_sentiments = {}

    for aspect in aspects:
        for sentence in sentences:
            if aspect.lower() in sentence.lower():
                blob = TextBlob(sentence)
                polarity = blob.sentiment.polarity
                if aspect not in aspect_sentiments:
                    aspect_sentiments[aspect] = []
                aspect_sentiments[aspect].append(polarity)

    # Average sentiment per aspect
    results = {}
    for aspect, scores in aspect_sentiments.items():
        avg = sum(scores) / len(scores)
        if avg > 0.1:
            label = "positive"
        elif avg < -0.1:
            label = "negative"
        else:
            label = "neutral"
        results[aspect] = {"score": avg, "label": label}

    return results


# Restaurant review
review = """
The food was absolutely delicious and beautifully presented.
The service was slow and the waiter seemed annoyed.
The atmosphere was cozy and romantic, perfect for a date.
The prices were quite high for the portion sizes.
The location is convenient, right next to the metro station.
"""

aspects = ["food", "service", "atmosphere", "prices", "location"]
results = extract_aspects_simple(review, aspects)

print("Aspect-Based Sentiment Analysis:")
print("=" * 40)
for aspect, data in results.items():
    emoji = "👍" if data["label"] == "positive" else "👎" if data["label"] == "negative" else "😐"
    print(f"  {emoji} {aspect:<12} {data['label']:<10} (score: {data['score']:.3f})")
```

---

## Real-World Applications

| Application | Description |
|-------------|-------------|
| **Brand monitoring** | Track public opinion about your brand |
| **Product reviews** | Summarize customer feedback |
| **Stock market** | Predict market movements from news sentiment |
| **Customer support** | Prioritize angry customers |
| **Political analysis** | Gauge public opinion on policies |
| **Social media** | Monitor trending sentiments |

---

## Summary

- Sentiment analysis classifies text as **positive, negative, or neutral**
- Three levels: **document, sentence, and aspect-level**
- **VADER** excels at social media text — handles emojis, slang, emphasis
- **TextBlob** provides a simple API with polarity and subjectivity
- **Custom classifiers** work best for domain-specific text
- Challenges include **sarcasm, negation, and mixed sentiments**
- Combining approaches (ensemble) improves robustness

---

## Next Steps

Next, we'll explore [Topic Modeling](28-nlp-topic-modeling.md) — discovering hidden themes and topics within large collections of documents without labeled data.
