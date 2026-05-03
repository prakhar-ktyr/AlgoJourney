---
title: Building an NLP Project End-to-End
---

# Building an NLP Project End-to-End

In this lesson you will build a **Sentiment-Aware News Aggregator** from scratch. The project pulls articles from RSS feeds, classifies them by topic, analyzes sentiment, extracts keywords, generates summaries, and serves everything through a Flask web interface.

---

## Project Overview

| Step | Task | Library |
|------|------|---------|
| 1 | Data collection (RSS feeds) | `feedparser` |
| 2 | Text preprocessing | `spaCy` |
| 3 | Topic classification (zero-shot) | `transformers` |
| 4 | Sentiment analysis | `vaderSentiment` |
| 5 | Keyword extraction | `rake-nltk` |
| 6 | Extractive summarization | `scikit-learn` |
| 7 | Flask web interface | `Flask` |
| 8 | Putting it all together | All of the above |

---

## Step 0 — Project Setup

```python
# requirements.txt
feedparser==6.0.11
spacy==3.7.4
transformers==4.40.0
torch==2.2.1
vaderSentiment==3.3.2
rake-nltk==1.0.6
scikit-learn==1.4.1
flask==3.0.2

# Install:
# pip install -r requirements.txt
# python -m spacy download en_core_web_sm
```

Directory structure:

```
news_aggregator/
├── app.py            # Flask app
├── collector.py      # RSS collection
├── preprocessor.py   # Text cleaning
├── classifier.py     # Topic classification
├── sentiment.py      # Sentiment analysis
├── keywords.py       # Keyword extraction
├── summarizer.py     # Extractive summarization
├── pipeline.py       # Full pipeline
└── templates/
    └── index.html
```

---

## Step 1 — Data Collection (RSS Feeds)

RSS feeds provide structured news data as XML. Each item has a title, link, summary, and publication date.

```python
"""collector.py — Fetch articles from RSS feeds."""

import feedparser
from datetime import datetime

DEFAULT_FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://rss.cnn.com/rss/edition.rss",
    "https://feeds.reuters.com/reuters/topNews",
    "https://www.theguardian.com/world/rss",
]


def fetch_feed(url, max_entries=10):
    """Parse a single RSS feed and return article dicts."""
    feed = feedparser.parse(url)
    articles = []
    for entry in feed.entries[:max_entries]:
        articles.append({
            "title": entry.get("title", ""),
            "link": entry.get("link", ""),
            "summary": entry.get("summary", entry.get("description", "")),
            "source": feed.feed.get("title", url),
            "published": entry.get("published", str(datetime.now())),
        })
    return articles


def collect_articles(feeds=None, max_per_feed=10):
    """Collect articles from multiple RSS feeds."""
    if feeds is None:
        feeds = DEFAULT_FEEDS
    all_articles = []
    for url in feeds:
        try:
            articles = fetch_feed(url, max_per_feed)
            all_articles.extend(articles)
            print(f"  ✓ {len(articles)} articles from {url[:50]}...")
        except Exception as e:
            print(f"  ✗ Failed: {url[:50]}... → {e}")
    print(f"\nTotal collected: {len(all_articles)}")
    return all_articles
```

> **Tip:** The `try/except` ensures one broken feed does not crash the collector.

---

## Step 2 — Text Preprocessing Pipeline

Raw RSS text contains HTML tags and special characters that need cleaning.

```python
"""preprocessor.py — Clean and normalize article text."""

import re
import spacy

nlp = spacy.load("en_core_web_sm")


def strip_html(text):
    return re.sub(r"<[^>]+>", "", text)


def normalize_whitespace(text):
    return re.sub(r"\s+", " ", text).strip()


def remove_special_chars(text):
    return re.sub(r"[^\w\s.,!?;:'\"-]", "", text)


def preprocess_text(text):
    """Strip HTML → remove specials → normalize whitespace."""
    text = strip_html(text)
    text = remove_special_chars(text)
    text = normalize_whitespace(text)
    return text


def get_tokens(text):
    """Tokenize, lemmatize, and filter stop words using spaCy."""
    doc = nlp(text.lower())
    return [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and len(token.text) > 2
    ]


def preprocess_article(article):
    """Add 'clean_text' and 'tokens' keys to an article dict."""
    raw = f"{article['title']}. {article['summary']}"
    article["clean_text"] = preprocess_text(raw)
    article["tokens"] = get_tokens(article["clean_text"])
    return article
```

Pipeline flow:

```
Raw text → Strip HTML → Remove specials → Normalize → Clean text
                                                          ↓
                                                  spaCy tokenize → Lemmatize → Token list
```

---

## Step 3 — Topic Classification (Zero-Shot with Hugging Face)

Zero-shot classification categorizes text **without training data**. The `bart-large-mnli` model predicts entailment between your text and candidate labels:

$$P(\text{topic}_i \mid \text{text}) = \frac{e^{s_i}}{\sum_{j} e^{s_j}}$$

where $s_i$ is the entailment score for topic $i$.

```python
"""classifier.py — Zero-shot topic classification."""

from transformers import pipeline

zero_shot = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=-1,
)

TOPICS = [
    "Politics", "Business & Economy", "Technology", "Science",
    "Health", "Sports", "Entertainment", "Environment",
    "Education", "World Affairs",
]


def classify_topic(text, candidate_labels=None, top_k=3):
    """Classify text into topics using zero-shot inference."""
    if candidate_labels is None:
        candidate_labels = TOPICS
    result = zero_shot(text[:512], candidate_labels)
    return [
        {"label": l, "score": round(s, 4)}
        for l, s in zip(result["labels"][:top_k], result["scores"][:top_k])
    ]


def classify_article(article):
    """Add topic predictions to an article dict."""
    predictions = classify_topic(article["clean_text"])
    article["topics"] = predictions
    article["primary_topic"] = predictions[0]["label"]
    return article
```

---

## Step 4 — Sentiment Analysis (VADER)

VADER is a **rule-based** sentiment analyzer tuned for news and social text. It outputs a compound score in $[-1, +1]$:

$$\text{compound} = \frac{s}{\sqrt{s^2 + \alpha}}$$

where $s$ is the sum of valence scores and $\alpha = 15$.

```python
"""sentiment.py — Sentiment analysis using VADER."""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()


def analyze_sentiment(text):
    """Return sentiment scores and a label (positive/negative/neutral)."""
    scores = analyzer.polarity_scores(text)
    compound = scores["compound"]
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"
    return {
        "compound": round(compound, 4),
        "pos": round(scores["pos"], 4),
        "neg": round(scores["neg"], 4),
        "neu": round(scores["neu"], 4),
        "label": label,
    }


def analyze_article_sentiment(article):
    """Add sentiment results to an article dict."""
    article["sentiment"] = analyze_sentiment(article["clean_text"])
    return article
```

**Example output:**

```
[positive] (+0.6696) The economy is booming and unemployment is at a record low!
[negative] (-0.7650) Devastating earthquake kills hundreds in remote village.
[ neutral] (+0.0000) The meeting is scheduled for 3 PM tomorrow.
```

---

## Step 5 — Keyword Extraction (RAKE)

RAKE identifies key phrases by analyzing co-occurrence. Each word is scored:

$$\text{score}(w) = \frac{\text{deg}(w)}{\text{freq}(w)}$$

Phrase scores are the sum of their word scores.

```python
"""keywords.py — Keyword extraction using RAKE."""

from rake_nltk import Rake


def extract_keywords(text, max_keywords=10):
    """Extract top keywords from text using RAKE."""
    rake = Rake(min_length=1, max_length=4)
    rake.extract_keywords_from_text(text)
    ranked = rake.get_ranked_phrases_with_scores()
    return [
        {"keyword": phrase, "score": round(score, 2)}
        for score, phrase in ranked[:max_keywords]
    ]


def extract_article_keywords(article):
    """Add keywords to an article dict."""
    article["keywords"] = extract_keywords(article["clean_text"])
    return article
```

---

## Step 6 — Extractive Summarization

Select the most important sentences using TF-IDF scores:

1. Split text into sentences with spaCy
2. Compute TF-IDF matrix over sentences
3. Score each sentence by mean TF-IDF
4. Select top $k$ sentences in original order

```python
"""summarizer.py — Extractive summarization using TF-IDF."""

import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

nlp = spacy.load("en_core_web_sm")


def split_sentences(text):
    doc = nlp(text)
    return [s.text.strip() for s in doc.sents if len(s.text.strip()) > 10]


def summarize(text, num_sentences=3):
    """Generate an extractive summary by selecting top sentences."""
    sentences = split_sentences(text)
    if len(sentences) <= num_sentences:
        return " ".join(sentences)

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(sentences)
    scores = np.array(tfidf_matrix.mean(axis=1)).flatten()

    top_indices = sorted(scores.argsort()[-num_sentences:])
    return " ".join(sentences[i] for i in top_indices)


def summarize_article(article, num_sentences=2):
    """Add a summary to an article dict."""
    article["summary_text"] = summarize(article["clean_text"], num_sentences)
    return article
```

---

## Step 7 — Flask Web Interface

```python
"""app.py — Flask web interface for the News Aggregator."""

from flask import Flask, render_template
from pipeline import run_pipeline

app = Flask(__name__)


@app.route("/")
def index():
    articles = run_pipeline(max_per_feed=5)
    topics = {}
    for article in articles:
        topic = article.get("primary_topic", "Uncategorized")
        topics.setdefault(topic, []).append(article)
    return render_template(
        "index.html",
        topics=dict(sorted(topics.items())),
        total=len(articles),
    )


if __name__ == "__main__":
    app.run(debug=True, port=5050)
```

Save the following as `templates/index.html`:

```python
# templates/index.html (HTML — shown here for reference)
"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sentiment-Aware News Aggregator</title>
  <style>
    body { font-family: sans-serif; background: #f5f5f5; padding: 20px; }
    h1 { text-align: center; }
    .topic-header { background: #282c34; color: #fff; padding: 10px 20px;
        border-radius: 8px 8px 0 0; }
    .card { background: #fff; border: 1px solid #ddd; padding: 15px; }
    .card:last-child { border-radius: 0 0 8px 8px; }
    a { color: #0066cc; text-decoration: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px;
        font-size: 0.8em; font-weight: 600; }
    .positive { background: #d4edda; color: #155724; }
    .negative { background: #f8d7da; color: #721c24; }
    .neutral  { background: #e2e3e5; color: #383d41; }
  </style>
</head>
<body>
  <h1>📰 News Aggregator</h1>
  <p style="text-align:center">{{ total }} articles analyzed</p>
  {% for topic, articles in topics.items() %}
  <div style="margin-bottom:30px">
    <div class="topic-header">{{ topic }} ({{ articles|length }})</div>
    {% for a in articles %}
    <div class="card">
      <b><a href="{{ a.link }}" target="_blank">{{ a.title }}</a></b>
      <div style="font-size:0.85em;color:#888">
        {{ a.source }} ·
        <span class="badge {{ a.sentiment.label }}">
          {{ a.sentiment.label }} ({{ a.sentiment.compound }})
        </span>
      </div>
      <div style="font-size:0.85em">
        🔑 {% for kw in a.keywords[:5] %}{{ kw.keyword }}{% if not loop.last %}, {% endif %}{% endfor %}
      </div>
      <div style="font-size:0.9em;font-style:italic">{{ a.summary_text }}</div>
    </div>
    {% endfor %}
  </div>
  {% endfor %}
</body>
</html>
"""
```

> **Security note:** Flask's Jinja2 auto-escapes output. In production, also validate URLs from RSS feeds before rendering `href` attributes.

---

## Step 8 — Putting It All Together

```python
"""pipeline.py — Full NLP pipeline for the News Aggregator."""

from collector import collect_articles
from preprocessor import preprocess_article
from classifier import classify_article
from sentiment import analyze_article_sentiment
from keywords import extract_article_keywords
from summarizer import summarize_article
import time


def run_pipeline(feeds=None, max_per_feed=5):
    """Execute the full news analysis pipeline."""
    start = time.time()

    print("Step 1/6: Collecting articles...")
    articles = collect_articles(feeds, max_per_feed)

    print("Step 2/6: Preprocessing...")
    for i, a in enumerate(articles):
        articles[i] = preprocess_article(a)

    print("Step 3/6: Classifying topics...")
    for i, a in enumerate(articles):
        articles[i] = classify_article(a)

    print("Step 4/6: Analyzing sentiment...")
    for i, a in enumerate(articles):
        articles[i] = analyze_article_sentiment(a)

    print("Step 5/6: Extracting keywords...")
    for i, a in enumerate(articles):
        articles[i] = extract_article_keywords(a)

    print("Step 6/6: Generating summaries...")
    for i, a in enumerate(articles):
        articles[i] = summarize_article(a)

    elapsed = time.time() - start
    print(f"\nDone! {len(articles)} articles in {elapsed:.1f}s")
    return articles


if __name__ == "__main__":
    articles = run_pipeline(max_per_feed=3)
    for a in articles[:3]:
        print(f"\nTitle:     {a['title']}")
        print(f"Topic:     {a['primary_topic']}")
        print(f"Sentiment: {a['sentiment']['label']} ({a['sentiment']['compound']:+.4f})")
        print(f"Keywords:  {', '.join(k['keyword'] for k in a['keywords'][:5])}")
        print(f"Summary:   {a['summary_text'][:120]}...")
```

---

## Running the Project

**CLI mode:**

```python
# python pipeline.py
```

**Web mode:**

```python
# python app.py
# → open http://localhost:5050
```

---

## Extending the Project

| Enhancement | How |
|-------------|-----|
| Database storage | Save articles to SQLite or MongoDB |
| Scheduled fetching | `APScheduler` to fetch every hour |
| Better summarization | HF summarization model |
| Named entity display | Show entities per article |
| Trend detection | Track topic frequencies over time |
| REST API | Add `/api/articles` endpoint |
| Deployment | Docker + Fly.io or Railway |

---

## Key Takeaways

- **Modular design** — each NLP step is a separate module, easy to test and swap
- **Zero-shot classification** removes the need for labeled training data
- **VADER** is fast and effective for sentiment on news text
- **RAKE** extracts multi-word key phrases without supervision
- **TF-IDF extractive summarization** requires no model training
- **Flask** provides a lightweight way to serve NLP results on the web
