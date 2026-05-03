---
title: NLP Basics for Data Science
---

# NLP Basics for Data Science

**Natural Language Processing (NLP)** is a field of AI that enables computers to understand, interpret, and generate human language. For data scientists, NLP unlocks insights from massive amounts of text data.

---

## Why NLP for Data Science?

Text data is everywhere:

- Customer reviews and feedback
- Social media posts
- Emails and support tickets
- News articles and reports
- Medical records and legal documents

NLP lets you turn **unstructured text** into **structured data** for analysis.

---

## Text Preprocessing Pipeline

Raw text is noisy. Before analysis, you must clean and normalize it:

```
Raw Text → Lowercase → Remove Punctuation → Tokenize → 
Remove Stop Words → Stem/Lemmatize → Clean Tokens
```

### Step 1: Lowercasing

```python
text = "Natural Language Processing is AMAZING!"
text_lower = text.lower()
print(text_lower)
# "natural language processing is amazing!"
```

### Step 2: Removing Punctuation and Special Characters

```python
import re

text = "Hello! How are you? Visit us @ https://example.com #NLP"

# Remove URLs
text = re.sub(r"https?://\S+", "", text)

# Remove special characters (keep letters, numbers, spaces)
text = re.sub(r"[^a-zA-Z0-9\s]", "", text)

print(text)
# "Hello How are you Visit us  NLP"
```

### Step 3: Tokenization

Split text into individual words (tokens):

```python
# Simple tokenization
text = "natural language processing is amazing"
tokens = text.split()
print(tokens)
# ['natural', 'language', 'processing', 'is', 'amazing']
```

### Step 4: Stop Words Removal

Remove common words that don't carry meaning:

```python
# Common English stop words
stop_words = {"the", "is", "at", "which", "and", "a", "an",
              "in", "on", "for", "to", "of", "it", "are", "was"}

tokens = ["natural", "language", "processing", "is", "a",
          "field", "of", "artificial", "intelligence"]

filtered = [word for word in tokens if word not in stop_words]
print(filtered)
# ['natural', 'language', 'processing', 'field', 'artificial', 'intelligence']
```

### Step 5: Stemming

Reduce words to their root form (rough chopping):

```python
from nltk.stem import PorterStemmer

stemmer = PorterStemmer()

words = ["running", "runs", "ran", "runner", "easily", "fairly"]
stemmed = [stemmer.stem(word) for word in words]
print(stemmed)
# ['run', 'run', 'ran', 'runner', 'easili', 'fairli']
# Note: stemming can produce non-words!
```

### Step 6: Lemmatization

Reduce to dictionary form (more accurate than stemming):

```python
from nltk.stem import WordNetLemmatizer

lemmatizer = WordNetLemmatizer()

words = ["running", "better", "geese", "studies", "was"]
lemmatized = [lemmatizer.lemmatize(word) for word in words]
print(lemmatized)
# ['running', 'better', 'goose', 'study', 'wa']

# Specify part of speech for better results
print(lemmatizer.lemmatize("running", pos="v"))  # "run"
print(lemmatizer.lemmatize("better", pos="a"))   # "good"
```

---

## Complete Preprocessing Function

```python
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Download required data (run once)
# nltk.download('punkt')
# nltk.download('stopwords')
# nltk.download('wordnet')

def preprocess_text(text):
    """Complete text preprocessing pipeline."""
    # 1. Lowercase
    text = text.lower()

    # 2. Remove URLs
    text = re.sub(r"https?://\S+", "", text)

    # 3. Remove special characters and numbers
    text = re.sub(r"[^a-z\s]", "", text)

    # 4. Tokenize
    tokens = text.split()

    # 5. Remove stop words
    stop_words = set(stopwords.words("english"))
    tokens = [t for t in tokens if t not in stop_words]

    # 6. Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]

    # 7. Remove short words
    tokens = [t for t in tokens if len(t) > 2]

    return tokens

# Test it
text = "The 3 students were running quickly to their NLP classes! https://nlp.com"
result = preprocess_text(text)
print(result)
# ['student', 'running', 'quickly', 'nlp', 'class']
```

---

## NLTK Library

**NLTK** (Natural Language Toolkit) is the most popular NLP library for learning:

```python
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer

# Sentence tokenization
text = "NLP is fascinating. It helps analyze text data. Let's learn it!"
sentences = sent_tokenize(text)
print(sentences)
# ['NLP is fascinating.', 'It helps analyze text data.', "Let's learn it!"]

# Word tokenization (handles punctuation better than split)
words = word_tokenize("Don't stop learning NLP!")
print(words)
# ['Do', "n't", 'stop', 'learning', 'NLP', '!']

# Stop words
stop_words = set(stopwords.words("english"))
print(f"English has {len(stop_words)} stop words")
print(list(stop_words)[:10])
```

### Part-of-Speech Tagging

```python
import nltk
from nltk import pos_tag
from nltk.tokenize import word_tokenize

text = "The quick brown fox jumps over the lazy dog"
tokens = word_tokenize(text)
tagged = pos_tag(tokens)
print(tagged)
# [('The', 'DT'), ('quick', 'JJ'), ('brown', 'JJ'),
#  ('fox', 'NN'), ('jumps', 'VBZ'), ('over', 'IN'),
#  ('the', 'DT'), ('lazy', 'JJ'), ('dog', 'NN')]
# DT=Determiner, JJ=Adjective, NN=Noun, VBZ=Verb
```

---

## spaCy Library

**spaCy** is a modern, production-ready NLP library — faster than NLTK:

```python
import spacy

# Load English model
nlp = spacy.load("en_core_web_sm")

# Process text
text = "Apple is looking at buying U.K. startup for $1 billion"
doc = nlp(text)

# Tokens with attributes
for token in doc:
    print(f"{token.text:12} {token.pos_:6} {token.lemma_:12} Stop: {token.is_stop}")
```

Output:
```
Apple        PROPN  Apple        Stop: False
is           AUX    be           Stop: True
looking      VERB   look         Stop: False
at           ADP    at           Stop: True
buying       VERB   buy          Stop: False
U.K.         PROPN  U.K.         Stop: False
startup      NOUN   startup      Stop: False
for          ADP    for          Stop: True
$            SYM    $            Stop: False
1            NUM    1            Stop: False
billion      NUM    billion      Stop: False
```

### Named Entity Recognition with spaCy

```python
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Apple CEO Tim Cook announced the iPhone 15 in California on Sept 12, 2024")

# Extract named entities
for ent in doc.ents:
    print(f"{ent.text:20} → {ent.label_}")

# Apple                → ORG
# Tim Cook             → PERSON
# iPhone 15            → PRODUCT
# California           → GPE (geo-political entity)
# Sept 12, 2024        → DATE
```

---

## Text to Numbers

Machine learning models need **numbers**, not text. We must convert text to numerical vectors.

### Bag of Words (BoW)

Count how many times each word appears:

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "I love machine learning",
    "Machine learning is great",
    "I love data science",
    "Data science and machine learning"
]

# Create bag of words
vectorizer = CountVectorizer()
bow_matrix = vectorizer.fit_transform(documents)

# View vocabulary
print("Vocabulary:", vectorizer.get_feature_names_out())
# ['and', 'data', 'great', 'is', 'learning', 'love', 'machine', 'science']

# View matrix (each row = document, each column = word count)
print(bow_matrix.toarray())
# [[0, 0, 0, 0, 1, 1, 1, 0],   doc 1
#  [0, 0, 1, 1, 1, 0, 1, 0],   doc 2
#  [0, 1, 0, 0, 0, 1, 0, 1],   doc 3
#  [1, 1, 0, 0, 1, 0, 1, 1]]   doc 4
```

### TF-IDF (Term Frequency — Inverse Document Frequency)

Words that appear in **many** documents are less important. TF-IDF captures this:

$$\text{TF-IDF} = TF \times \log\left(\frac{N}{df}\right)$$

Where:
- $TF$ = frequency of term in document
- $N$ = total number of documents
- $df$ = number of documents containing the term

```python
from sklearn.feature_extraction.text import TfidfVectorizer

documents = [
    "I love machine learning",
    "Machine learning is great",
    "I love data science",
    "Data science and machine learning"
]

# Create TF-IDF vectors
tfidf = TfidfVectorizer(max_features=5000)
tfidf_matrix = tfidf.fit_transform(documents)

print("Shape:", tfidf_matrix.shape)  # (4 docs, 8 features)
print("Features:", tfidf.get_feature_names_out())

# View TF-IDF scores for first document
import pandas as pd
scores = pd.DataFrame(
    tfidf_matrix.toarray(),
    columns=tfidf.get_feature_names_out()
)
print(scores.round(2))
```

### Word Embeddings (Brief)

More advanced: represent words as **dense vectors** where similar words are close together.

- **Word2Vec**: learns from word co-occurrence
- **GloVe**: pre-trained on large corpora
- **FastText**: handles subwords (useful for rare words)

```python
# Using spaCy's built-in word vectors
import spacy

nlp = spacy.load("en_core_web_md")  # Medium model has vectors

word1 = nlp("king")
word2 = nlp("queen")
word3 = nlp("apple")

print(f"king ↔ queen: {word1.similarity(word2):.3f}")   # ~0.7
print(f"king ↔ apple: {word1.similarity(word3):.3f}")   # ~0.2
```

---

## Text Classification with ML

The classic NLP task: assign a **label** to text.

### Complete Pipeline: Spam Detection

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

# Sample data
data = pd.DataFrame({
    "text": [
        "Win a free iPhone now!", "Meeting at 3pm tomorrow",
        "Congratulations! You won $1000", "Can you send the report?",
        "FREE gift card click here", "Lunch plans for today?",
        "Claim your prize now!!!", "Project deadline is Friday",
        "You've been selected winner", "Please review the document",
        "Limited time offer BUY NOW", "Team standup in 10 minutes",
        "Get rich quick scheme", "Budget review meeting notes",
        "Act now or miss out!!!", "Could you help with the code?"
    ],
    "label": [
        "spam", "ham", "spam", "ham", "spam", "ham",
        "spam", "ham", "spam", "ham", "spam", "ham",
        "spam", "ham", "spam", "ham"
    ]
})

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    data["text"], data["label"], test_size=0.25, random_state=42
)

# Convert text to TF-IDF features
tfidf = TfidfVectorizer(max_features=5000, stop_words="english")
X_train_tfidf = tfidf.fit_transform(X_train)
X_test_tfidf = tfidf.transform(X_test)

# Train Naive Bayes classifier
model = MultinomialNB()
model.fit(X_train_tfidf, y_train)

# Evaluate
y_pred = model.predict(X_test_tfidf)
print(classification_report(y_test, y_pred))

# Predict new text
new_texts = ["Free money click now!", "Meeting rescheduled to 4pm"]
new_tfidf = tfidf.transform(new_texts)
predictions = model.predict(new_tfidf)
for text, pred in zip(new_texts, predictions):
    print(f"'{text}' → {pred}")
```

---

## Named Entity Recognition (NER)

NER identifies and classifies named entities (people, places, organizations) in text:

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = """
Elon Musk, CEO of Tesla and SpaceX, met with President Biden
at the White House in Washington D.C. on January 15, 2024.
The meeting discussed a $500 million investment plan.
"""

doc = nlp(text)

# Extract entities
print("Named Entities:")
print("-" * 40)
for ent in doc.ents:
    print(f"{ent.text:25} {ent.label_:10} ({spacy.explain(ent.label_)})")

# Group entities by type
from collections import defaultdict
entities = defaultdict(list)
for ent in doc.ents:
    entities[ent.label_].append(ent.text)

print("\nGrouped:")
for label, ents in entities.items():
    print(f"{label}: {ents}")
```

---

## Putting It All Together

### Sentiment-Ready Text Pipeline

```python
import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Sample review data
reviews = pd.DataFrame({
    "text": [
        "This product is amazing! Best purchase ever!",
        "Terrible quality, broke after one day",
        "Love it! Works perfectly",
        "Waste of money. Very disappointed",
        "Excellent customer service and fast shipping",
        "Never buying again. Horrible experience",
        "Great value for the price",
        "Does not work as advertised. Scam!",
        "Absolutely wonderful product!",
        "Worst product I have ever bought"
    ],
    "sentiment": [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]  # 1=positive, 0=negative
})

# Preprocess
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text

reviews["clean"] = reviews["text"].apply(clean_text)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    reviews["clean"], reviews["sentiment"], test_size=0.3, random_state=42
)

# Vectorize + classify
tfidf = TfidfVectorizer(max_features=1000)
X_train_vec = tfidf.fit_transform(X_train)
X_test_vec = tfidf.transform(X_test)

model = LogisticRegression()
model.fit(X_train_vec, y_train)

accuracy = accuracy_score(y_test, model.predict(X_test_vec))
print(f"Accuracy: {accuracy:.2%}")

# Predict new review
new_review = ["This is an incredible product, highly recommend!"]
new_vec = tfidf.transform([clean_text(new_review[0])])
pred = model.predict(new_vec)[0]
print(f"Prediction: {'Positive' if pred == 1 else 'Negative'}")
```

---

## Try It Yourself

1. Preprocess a collection of tweets (remove URLs, hashtags, mentions)
2. Build a TF-IDF matrix from news article titles
3. Train a Naive Bayes classifier on movie reviews (positive/negative)
4. Use spaCy to extract all person names from a news article
5. Compare stemming vs lemmatization on a paragraph

---

## Summary

| Concept | Tool/Code |
|---------|-----------|
| Tokenization | `text.split()` or `nltk.word_tokenize()` |
| Stop words | `stopwords.words('english')` |
| Stemming | `PorterStemmer().stem(word)` |
| Lemmatization | `WordNetLemmatizer().lemmatize(word)` |
| Bag of Words | `CountVectorizer()` |
| TF-IDF | `TfidfVectorizer(max_features=5000)` |
| Classification | TF-IDF → `MultinomialNB()` or `LogisticRegression()` |
| NER | `spacy.load('en_core_web_sm')` |
| Word vectors | `nlp("word").similarity(nlp("other"))` |

NLP is one of the most exciting areas of data science — and these basics will take you far!
