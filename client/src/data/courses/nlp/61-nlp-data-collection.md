---
title: Data Collection & Annotation
---

# Data Collection & Annotation

Building great NLP models starts **before** any modeling — it starts with **data**. In this lesson you will learn where to find text data, how to label it for supervised learning, how to measure annotation quality, and how to stretch a small dataset with augmentation.

---

## Why Data Quality Matters

> **Garbage in, garbage out.**

Even the most powerful transformer will fail if:

- The training data is **noisy** (mislabeled, duplicated, or irrelevant).
- The data **distribution** does not match the real-world task.
- There is **not enough** labeled data for the target domain.

A structured data pipeline looks like this:

```
Collect → Clean → Annotate → Validate → Augment → Train
```

Each step feeds into the next, and skipping any one of them will hurt model performance.

---

## Where to Get NLP Data

There are three main channels: **public datasets**, **web scraping**, and **APIs**.

### 1. Public Datasets

| Source | What You Get | URL |
|---|---|---|
| Hugging Face Datasets | 100 000+ datasets, one-line download | huggingface.co/datasets |
| Kaggle Datasets | Community-uploaded CSV / JSON / text | kaggle.com/datasets |
| CommonCrawl | Petabytes of raw web text | commoncrawl.org |
| UCI ML Repository | Classic small-to-medium datasets | archive.ics.uci.edu |
| Papers With Code | Benchmarks linked to papers | paperswithcode.com/datasets |

#### Loading a Hugging Face Dataset

```python
from datasets import load_dataset

# Load the IMDb movie-review dataset
dataset = load_dataset("imdb")

print(dataset)
# DatasetDict({
#     train: Dataset({ features: ['text', 'label'], num_rows: 25000 }),
#     test:  Dataset({ features: ['text', 'label'], num_rows: 25000 })
# })

# Peek at one example
print(dataset["train"][0]["text"][:200])
print("Label:", dataset["train"][0]["label"])  # 0 = negative, 1 = positive
```

#### Loading a Kaggle Dataset (via the API)

```python
# First: pip install kaggle
# Place your kaggle.json API token in ~/.kaggle/

import subprocess, pandas as pd

subprocess.run([
    "kaggle", "datasets", "download",
    "-d", "lakshmi25npathi/imdb-dataset-of-50k-movie-reviews",
    "--unzip", "-p", "data/"
])

df = pd.read_csv("data/IMDB Dataset.csv")
print(df.shape)       # (50000, 2)
print(df.head())
```

### 2. Web Scraping

When no ready-made dataset exists, you can **scrape** text from the web.

```python
import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/Natural_language_processing"
response = requests.get(url, timeout=10)
soup = BeautifulSoup(response.text, "html.parser")

paragraphs = [p.get_text() for p in soup.find_all("p") if p.get_text().strip()]
print(f"Scraped {len(paragraphs)} paragraphs")
print(paragraphs[0][:300])
```

> **Important:** Always check a website's `robots.txt` and Terms of Service before scraping. Respect rate limits and copyright.

### 3. APIs

Many services expose text data through REST APIs:

| API | Data Type |
|---|---|
| Twitter / X API | Tweets, user bios |
| Reddit API (PRAW) | Posts, comments |
| News API | News article metadata |
| Google Books API | Book snippets |

```python
import praw  # pip install praw

reddit = praw.Reddit(
    client_id="YOUR_ID",
    client_secret="YOUR_SECRET",
    user_agent="nlp-data-collector"
)

subreddit = reddit.subreddit("machinelearning")
posts = []
for submission in subreddit.hot(limit=100):
    posts.append({
        "title": submission.title,
        "text": submission.selftext,
        "score": submission.score,
    })

print(f"Collected {len(posts)} posts")
```

---

## Data Cleaning Checklist

Before annotation, clean the raw text:

| Step | Example |
|---|---|
| Remove duplicates | Exact or near-duplicate detection |
| Strip HTML / markdown | `<p>Hello</p>` → `Hello` |
| Fix encoding | `â€™` → `'` |
| Remove boilerplate | Navigation menus, footers |
| Language filter | Keep only English (or target language) |
| Length filter | Drop very short or very long documents |

```python
import re
from collections import Counter

def clean_text(text: str) -> str:
    """Basic cleaning pipeline."""
    text = re.sub(r"<[^>]+>", "", text)          # strip HTML tags
    text = re.sub(r"http\S+", "", text)           # remove URLs
    text = re.sub(r"[^\w\s.,!?;:'\"-]", "", text) # keep common punctuation
    text = re.sub(r"\s+", " ", text).strip()      # collapse whitespace
    return text

raw = "  <b>Check</b> this link: https://example.com   and   more!!!  "
print(clean_text(raw))
# "Check this link and more!!!"
```

### Deduplication with Hashing

```python
import hashlib

def dedup(texts):
    seen = set()
    unique = []
    for t in texts:
        h = hashlib.md5(t.encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            unique.append(t)
    return unique

corpus = ["Hello world", "Hello world", "Goodbye world"]
print(dedup(corpus))  # ['Hello world', 'Goodbye world']
```

---

## Data Annotation

**Annotation** (or **labeling**) is the process of adding structured information to raw text so a model can learn from it.

### Common Annotation Types

| Task | Label Type | Example |
|---|---|---|
| Sentiment analysis | Class label | `positive`, `negative` |
| Named Entity Recognition | Span + entity type | `[Google](ORG)` |
| Text classification | One or more categories | `sports`, `politics` |
| Machine translation | Parallel sentence | EN → FR |
| Summarization | Reference summary | A short paragraph |
| Question answering | Answer span | Character offsets in context |

### Annotation Workflow

```
1. Write annotation guidelines (clear, with examples)
2. Select a random sample of data
3. Have ≥ 2 annotators label the same sample
4. Measure inter-annotator agreement
5. Resolve disagreements, refine guidelines
6. Scale up annotation
```

---

## Annotation Tools

### Label Studio (Open Source)

```python
# Install
# pip install label-studio

# Launch
# label-studio start
```

Label Studio provides a web UI where you:

1. Upload text data (CSV, JSON, plain text).
2. Define a **labeling interface** (e.g., classification, NER spans).
3. Annotate through a browser.
4. Export labeled data as JSON, CSV, or CoNLL.

**Example labeling config for sentiment:**

```xml
<View>
  <Text name="text" value="$text"/>
  <Choices name="sentiment" toName="text" choice="single">
    <Choice value="positive"/>
    <Choice value="negative"/>
    <Choice value="neutral"/>
  </Choices>
</View>
```

### Prodigy (Commercial, by spaCy makers)

Prodigy is a command-line annotation tool optimized for **speed**:

```bash
prodigy textcat.manual my_dataset ./data.jsonl --label POSITIVE,NEGATIVE,NEUTRAL
```

It uses **active learning** to show the most informative examples first.

### Doccano (Open Source)

Doccano supports sequence labeling, text classification, and seq2seq tasks through a clean web interface.

```bash
# Install and run
pip install doccano
doccano init
doccano createuser --username admin --password pass
doccano webserver
```

### Quick Comparison

| Tool | License | Active Learning | NER | Classification |
|---|---|---|---|---|
| Label Studio | Apache 2.0 | Plugin | Yes | Yes |
| Prodigy | Commercial | Built-in | Yes | Yes |
| Doccano | MIT | No | Yes | Yes |

---

## Inter-Annotator Agreement

When multiple annotators label the same data, you need to **measure agreement** to ensure label quality.

### Cohen's Kappa ($\kappa$)

Cohen's Kappa adjusts for chance agreement:

$$\kappa = \frac{p_o - p_e}{1 - p_e}$$

Where:

- $p_o$ = observed agreement (fraction of items where annotators agree)
- $p_e$ = expected agreement by chance

| $\kappa$ Range | Interpretation |
|---|---|
| $< 0$ | Less than chance agreement |
| $0.01 – 0.20$ | Slight |
| $0.21 – 0.40$ | Fair |
| $0.41 – 0.60$ | Moderate |
| $0.61 – 0.80$ | Substantial |
| $0.81 – 1.00$ | Almost perfect |

#### Computing Cohen's Kappa in Python

```python
from sklearn.metrics import cohen_kappa_score

annotator_1 = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1]
annotator_2 = [1, 0, 1, 0, 0, 1, 0, 1, 1, 1]

kappa = cohen_kappa_score(annotator_1, annotator_2)
print(f"Cohen's Kappa: {kappa:.3f}")
# Cohen's Kappa: 0.600  → Moderate agreement
```

### Fleiss' Kappa (3+ Annotators)

When you have **more than two** annotators, use Fleiss' Kappa:

$$\kappa = \frac{\bar{P} - \bar{P}_e}{1 - \bar{P}_e}$$

```python
from statsmodels.stats.inter_rater import fleiss_kappa, aggregate_raters

# Each row = one item; each column = one annotator's label
ratings = [
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
    [1, 0, 1],
]

table, _ = aggregate_raters(ratings)
fk = fleiss_kappa(table, method="fleiss")
print(f"Fleiss' Kappa: {fk:.3f}")
```

---

## Active Learning for Annotation

**Active learning** reduces annotation cost by asking annotators to label only the **most informative** examples.

### How It Works

```
1. Train a model on a small labeled set
2. Use the model to predict on unlabeled data
3. Select examples where the model is most uncertain
4. Have annotators label those examples
5. Add to training set, retrain
6. Repeat until performance converges
```

### Uncertainty Sampling

The simplest strategy: pick examples where the model's predicted probability is closest to 0.5 (for binary classification).

```python
import numpy as np

def uncertainty_sampling(probabilities, n_samples=10):
    """Select the n_samples most uncertain examples."""
    uncertainties = 1 - np.abs(probabilities - 0.5) * 2
    # Most uncertain → uncertainty closest to 1.0
    top_indices = np.argsort(uncertainties)[-n_samples:]
    return top_indices

# Simulated model probabilities for 20 unlabeled examples
probs = np.random.rand(20)
selected = uncertainty_sampling(probs, n_samples=5)
print("Selected indices:", selected)
print("Their probabilities:", probs[selected])
```

### Active Learning Loop (Sketch)

```python
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer

def active_learning_loop(texts, initial_labels, n_rounds=5, batch_size=10):
    labeled_idx = list(range(len(initial_labels)))
    unlabeled_idx = list(range(len(initial_labels), len(texts)))

    vectorizer = TfidfVectorizer(max_features=5000)
    X_all = vectorizer.fit_transform(texts)

    for round_num in range(n_rounds):
        # Train on labeled data
        model = LogisticRegression(max_iter=200)
        X_train = X_all[labeled_idx]
        y_train = [initial_labels[i] for i in labeled_idx]
        model.fit(X_train, y_train)

        # Predict on unlabeled data
        X_unlabeled = X_all[unlabeled_idx]
        probs = model.predict_proba(X_unlabeled)[:, 1]

        # Select most uncertain
        uncertainties = np.abs(probs - 0.5)
        query_idx = np.argsort(uncertainties)[:batch_size]

        print(f"Round {round_num + 1}: querying {batch_size} examples")

        # In practice, send query_idx to annotators
        # Here we simulate with placeholder labels
        for i in query_idx:
            real_idx = unlabeled_idx[i]
            labeled_idx.append(real_idx)

        # Remove from unlabeled pool
        unlabeled_idx = [
            idx for j, idx in enumerate(unlabeled_idx)
            if j not in query_idx
        ]

    return model
```

---

## Data Augmentation for NLP

When labeled data is scarce, **augmentation** creates new training examples from existing ones.

### 1. Synonym Replacement

Replace words with their synonyms using WordNet:

```python
import nltk
from nltk.corpus import wordnet
import random

nltk.download("wordnet", quiet=True)
nltk.download("omw-1.4", quiet=True)

def synonym_replacement(sentence, n_replacements=2):
    words = sentence.split()
    new_words = words.copy()
    replaceable = [
        (i, w) for i, w in enumerate(words)
        if wordnet.synsets(w)
    ]
    random.shuffle(replaceable)

    count = 0
    for idx, word in replaceable:
        synonyms = set()
        for syn in wordnet.synsets(word):
            for lemma in syn.lemmas():
                name = lemma.name().replace("_", " ")
                if name.lower() != word.lower():
                    synonyms.add(name)
        if synonyms:
            new_words[idx] = random.choice(list(synonyms))
            count += 1
        if count >= n_replacements:
            break

    return " ".join(new_words)

original = "The movie was absolutely fantastic and very enjoyable"
for i in range(3):
    print(f"  Aug {i+1}: {synonym_replacement(original)}")
```

### 2. Random Insertion

Insert a random synonym of a random word at a random position:

```python
def random_insertion(sentence, n_insertions=1):
    words = sentence.split()
    for _ in range(n_insertions):
        word = random.choice(words)
        syns = wordnet.synsets(word)
        if syns:
            lemmas = syns[0].lemmas()
            synonym = lemmas[0].name().replace("_", " ")
            pos = random.randint(0, len(words))
            words.insert(pos, synonym)
    return " ".join(words)

print(random_insertion("Natural language processing is fun"))
```

### 3. Random Deletion

Delete each word with probability $p$:

```python
def random_deletion(sentence, p=0.2):
    words = sentence.split()
    if len(words) == 1:
        return sentence
    remaining = [w for w in words if random.random() > p]
    if not remaining:
        return random.choice(words)
    return " ".join(remaining)

print(random_deletion("The quick brown fox jumps over the lazy dog"))
```

### 4. Back-Translation

Translate to another language and back to create paraphrases:

```python
# Using the transformers library with MarianMT
from transformers import MarianMTModel, MarianTokenizer

def back_translate(text, src="en", pivot="fr"):
    # English → French
    fwd_name = f"Helsinki-NLP/opus-mt-{src}-{pivot}"
    fwd_tok = MarianTokenizer.from_pretrained(fwd_name)
    fwd_model = MarianMTModel.from_pretrained(fwd_name)

    encoded = fwd_tok(text, return_tensors="pt", truncation=True)
    translated = fwd_model.generate(**encoded)
    pivot_text = fwd_tok.decode(translated[0], skip_special_tokens=True)

    # French → English
    bwd_name = f"Helsinki-NLP/opus-mt-{pivot}-{src}"
    bwd_tok = MarianTokenizer.from_pretrained(bwd_name)
    bwd_model = MarianMTModel.from_pretrained(bwd_name)

    encoded = bwd_tok(pivot_text, return_tensors="pt", truncation=True)
    back = bwd_model.generate(**encoded)
    return bwd_tok.decode(back[0], skip_special_tokens=True)

original = "The movie was absolutely fantastic and very enjoyable."
augmented = back_translate(original)
print(f"Original:      {original}")
print(f"Back-translated: {augmented}")
```

### 5. Easy Data Augmentation (EDA) — All-in-One

```python
def eda(sentence, alpha_sr=0.1, alpha_ri=0.1, p_rd=0.1, n_aug=4):
    """Apply EDA: synonym replacement, random insertion, random deletion."""
    augmented = []
    words = sentence.split()
    n_sr = max(1, int(alpha_sr * len(words)))
    n_ri = max(1, int(alpha_ri * len(words)))

    for _ in range(n_aug):
        choice = random.choice(["sr", "ri", "rd"])
        if choice == "sr":
            augmented.append(synonym_replacement(sentence, n_sr))
        elif choice == "ri":
            augmented.append(random_insertion(sentence, n_ri))
        else:
            augmented.append(random_deletion(sentence, p_rd))

    return augmented

original = "This restaurant has amazing food and great service"
for i, aug in enumerate(eda(original)):
    print(f"  EDA {i+1}: {aug}")
```

---

## Putting It All Together: Mini Pipeline

```python
from datasets import load_dataset

# 1. Load public dataset
dataset = load_dataset("rotten_tomatoes")
train_texts = dataset["train"]["text"][:500]
train_labels = dataset["train"]["label"][:500]

print(f"Original training size: {len(train_texts)}")

# 2. Clean
cleaned = [clean_text(t) for t in train_texts]

# 3. Deduplicate
cleaned = dedup(cleaned)
print(f"After dedup: {len(cleaned)}")

# 4. Augment (double the dataset)
augmented_texts = list(cleaned)
augmented_labels = list(train_labels[:len(cleaned)])

for text, label in zip(cleaned, train_labels[:len(cleaned)]):
    aug = synonym_replacement(text, n_replacements=2)
    augmented_texts.append(aug)
    augmented_labels.append(label)

print(f"After augmentation: {len(augmented_texts)}")

# 5. Quick sanity check
from collections import Counter
label_dist = Counter(augmented_labels)
print(f"Label distribution: {dict(label_dist)}")
```

---

## Best Practices Checklist

| Practice | Why |
|---|---|
| Write clear annotation guidelines | Reduces disagreement |
| Measure inter-annotator agreement early | Catches bad guidelines |
| Use stratified sampling for annotation | Ensures class balance |
| Version your datasets | Reproducibility |
| Store raw + cleaned + annotated separately | Traceability |
| Augment **after** splitting train/test | Prevents data leakage |
| Document data provenance | Compliance and ethics |

---

## Summary

In this lesson you learned:

- **Where to find NLP data**: Hugging Face, Kaggle, CommonCrawl, web scraping, APIs.
- **How to clean** raw text: deduplication, HTML stripping, encoding fixes.
- **How to annotate** text with tools like Label Studio, Prodigy, and Doccano.
- **How to measure** annotation quality with Cohen's $\kappa$ and Fleiss' $\kappa$.
- **Active learning** to reduce annotation cost by labeling the most uncertain examples.
- **Data augmentation** techniques: synonym replacement, random insertion/deletion, back-translation, and EDA.

Next, we will learn how to **deploy** NLP models into production with FastAPI, Docker, and model optimization.
