---
title: Text Summarization
---

# Text Summarization

**Text summarization** is the task of producing a shorter version of a document while preserving its key information. There are two main approaches: **extractive** (select existing sentences) and **abstractive** (generate new text).

---

## Extractive vs. Abstractive Summarization

| Aspect | Extractive | Abstractive |
|--------|-----------|-------------|
| Method | Select important sentences | Generate new sentences |
| Fluency | May lack coherence | More natural flow |
| Faithfulness | Always uses original text | May hallucinate |
| Complexity | Simpler | Requires generation model |
| Speed | Faster | Slower |

---

## Extractive Summarization

Extractive summarization selects the most important sentences from the original text. The key challenge is **scoring** sentences by importance.

### Sentence Scoring Methods

#### 1. TF-IDF Based Scoring

Score sentences by the importance of their words:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

$$\text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

$$\text{IDF}(t, D) = \log \frac{|D|}{|\{d \in D : t \in d\}|}$$

Sentence score = average TF-IDF of its words.

```python
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

def tfidf_summarize(text, num_sentences=3):
    """Extractive summarization using TF-IDF sentence scoring."""
    # Split into sentences
    sentences = text.replace("\n", " ").split(". ")
    sentences = [s.strip() + "." for s in sentences if len(s.strip()) > 10]

    if len(sentences) <= num_sentences:
        return " ".join(sentences)

    # Compute TF-IDF matrix
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(sentences)

    # Score each sentence (sum of TF-IDF values)
    scores = tfidf_matrix.sum(axis=1).A1  # Convert to 1D array

    # Select top sentences (preserve original order)
    top_indices = np.argsort(scores)[-num_sentences:]
    top_indices = sorted(top_indices)

    summary = " ".join([sentences[i] for i in top_indices])
    return summary

# --- Example ---
article = """
Natural language processing is a subfield of linguistics, computer science,
and artificial intelligence. It focuses on the interaction between computers
and human language. NLP involves programming computers to process and analyze
large amounts of natural language data. The result is a computer capable of
understanding the contents of documents. NLP combines computational linguistics
with statistical and machine learning approaches. Modern NLP is largely based
on deep learning techniques. These techniques have achieved state-of-the-art
results on many standard NLP tasks. Transfer learning with pre-trained models
has become the dominant paradigm.
"""

print(tfidf_summarize(article, num_sentences=3))
```

---

#### 2. TextRank

**TextRank** is a graph-based ranking algorithm (based on PageRank) for sentence extraction.

### How TextRank Works

1. Create a graph where each sentence is a node
2. Connect sentences with edges weighted by similarity
3. Run PageRank to find the most "central" sentences
4. Select the top-ranked sentences

The importance score of sentence $V_i$ is:

$$S(V_i) = (1-d) + d \cdot \sum_{V_j \in \text{adj}(V_i)} \frac{w_{ji}}{\sum_{V_k \in \text{adj}(V_j)} w_{jk}} S(V_j)$$

Where $d$ is the damping factor (typically 0.85) and $w_{ji}$ is the edge weight (similarity) between sentences $j$ and $i$.

```python
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def textrank_summarize(text, num_sentences=3, damping=0.85, max_iter=100):
    """Extractive summarization using TextRank algorithm."""
    # Split into sentences
    sentences = text.replace("\n", " ").split(". ")
    sentences = [s.strip() + "." for s in sentences if len(s.strip()) > 10]

    n = len(sentences)
    if n <= num_sentences:
        return " ".join(sentences)

    # Build similarity matrix
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(sentences)
    similarity_matrix = cosine_similarity(tfidf_matrix)

    # Remove self-loops
    np.fill_diagonal(similarity_matrix, 0)

    # Normalize (column-wise)
    col_sums = similarity_matrix.sum(axis=0, keepdims=True)
    col_sums[col_sums == 0] = 1  # Avoid division by zero
    norm_matrix = similarity_matrix / col_sums

    # PageRank iteration
    scores = np.ones(n) / n

    for _ in range(max_iter):
        new_scores = (1 - damping) / n + damping * norm_matrix.dot(scores)
        if np.allclose(scores, new_scores, atol=1e-6):
            break
        scores = new_scores

    # Select top sentences (preserve order)
    top_indices = np.argsort(scores)[-num_sentences:]
    top_indices = sorted(top_indices)

    summary = " ".join([sentences[i] for i in top_indices])
    return summary

# --- Example ---
article = """
The Transformer architecture revolutionized natural language processing when
it was introduced in 2017. Unlike previous models that processed text
sequentially, Transformers use self-attention to process all tokens in
parallel. This parallelization enables much faster training on large datasets.
The key innovation is the multi-head attention mechanism, which allows the
model to focus on different parts of the input simultaneously. BERT and GPT
are both based on the Transformer architecture. BERT uses only the encoder
for understanding tasks, while GPT uses only the decoder for generation tasks.
These models have achieved state-of-the-art results across virtually all NLP
benchmarks. The success of Transformers has led to ever-larger models with
billions of parameters.
"""

print("TextRank Summary:")
print(textrank_summarize(article, num_sentences=3))
```

---

#### 3. Position-Based Scoring

Sentences at the beginning and end of paragraphs tend to be more important (the "lead bias"):

```python
def position_score(sentence_idx, total_sentences):
    """Score based on position (beginning and end are important)."""
    # Normalized position (0 to 1)
    pos = sentence_idx / max(total_sentences - 1, 1)

    # Higher score for beginning and end
    if pos < 0.2:
        return 1.0 - pos  # First 20%: high score
    elif pos > 0.8:
        return pos  # Last 20%: moderate score
    else:
        return 0.5  # Middle: baseline

def combined_extractive_summarize(text, num_sentences=3):
    """Combine TF-IDF and position scoring."""
    sentences = text.replace("\n", " ").split(". ")
    sentences = [s.strip() + "." for s in sentences if len(s.strip()) > 10]

    n = len(sentences)
    if n <= num_sentences:
        return " ".join(sentences)

    # TF-IDF scores
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(sentences)
    tfidf_scores = tfidf_matrix.sum(axis=1).A1
    tfidf_scores = tfidf_scores / tfidf_scores.max()  # Normalize

    # Position scores
    pos_scores = np.array([position_score(i, n) for i in range(n)])

    # Combined score (weighted average)
    combined = 0.7 * tfidf_scores + 0.3 * pos_scores

    top_indices = np.argsort(combined)[-num_sentences:]
    top_indices = sorted(top_indices)

    return " ".join([sentences[i] for i in top_indices])
```

---

## Abstractive Summarization

Abstractive summarization **generates** new text that captures the essential meaning. It uses sequence-to-sequence models.

### Key Models

| Model | Architecture | Strengths |
|-------|-------------|-----------|
| **T5** | Encoder-decoder | Versatile, text-to-text framework |
| **BART** | Denoising autoencoder | Strong summarization performance |
| **Pegasus** | Gap-sentence pre-training | Designed specifically for summarization |
| **LED** | Longformer Encoder-Decoder | Handles long documents |

### T5 for Summarization

T5 frames all NLP tasks as text-to-text. For summarization, prefix the input with "summarize:":

```python
from transformers import T5ForConditionalGeneration, T5Tokenizer

model = T5ForConditionalGeneration.from_pretrained("t5-base")
tokenizer = T5Tokenizer.from_pretrained("t5-base")

def t5_summarize(text, max_length=150, min_length=40):
    """Abstractive summarization with T5."""
    # Prepend task prefix
    input_text = "summarize: " + text

    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        min_length=min_length,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True,
        no_repeat_ngram_size=3,
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

# --- Example ---
article = """
Scientists have discovered a new species of deep-sea fish in the Mariana Trench,
the deepest point in the world's oceans. The fish, named Pseudoliparis swirei,
was found at a depth of approximately 8,000 meters. It has a translucent body
and lacks scales, adaptations that help it survive the extreme pressure at such
depths. The discovery was made using an unmanned submersible equipped with
high-definition cameras and collection traps. Researchers believe there may be
many more undiscovered species living in the deep ocean. This finding highlights
how little we know about life in the deepest parts of our planet.
"""

print("T5 Summary:")
print(t5_summarize(article))
```

### BART for Summarization

```python
from transformers import BartForConditionalGeneration, BartTokenizer

model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")

def bart_summarize(text, max_length=150, min_length=50):
    """Abstractive summarization with BART (trained on CNN/DailyMail)."""
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,
        truncation=True,
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        min_length=min_length,
        num_beams=4,
        length_penalty=2.0,
        early_stopping=True,
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

print("BART Summary:")
print(bart_summarize(article))
```

### Pegasus — Purpose-Built for Summarization

Pegasus uses a pre-training objective specifically designed for summarization: it masks entire sentences and trains the model to generate them.

```python
from transformers import PegasusForConditionalGeneration, PegasusTokenizer

model = PegasusForConditionalGeneration.from_pretrained(
    "google/pegasus-xsum"
)
tokenizer = PegasusTokenizer.from_pretrained("google/pegasus-xsum")

def pegasus_summarize(text, max_length=64):
    """Extreme summarization with Pegasus (one-sentence summaries)."""
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        num_beams=4,
        early_stopping=True,
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

print("Pegasus Summary (1 sentence):")
print(pegasus_summarize(article))
```

---

## ROUGE Score: Evaluating Summaries

**ROUGE** (Recall-Oriented Understudy for Gisting Evaluation) measures overlap between generated and reference summaries.

### ROUGE-N

Measures n-gram overlap:

$$\text{ROUGE-N} = \frac{\sum_{S \in \text{ref}} \sum_{\text{n-gram} \in S} \text{Count}_{\text{match}}(\text{n-gram})}{\sum_{S \in \text{ref}} \sum_{\text{n-gram} \in S} \text{Count}(\text{n-gram})}$$

- **ROUGE-1:** Unigram overlap (individual words)
- **ROUGE-2:** Bigram overlap (word pairs)

### ROUGE-L

Based on the **Longest Common Subsequence (LCS)** between candidate and reference:

$$\text{ROUGE-L} = F_{\text{LCS}} = \frac{(1 + \beta^2) \cdot R_{\text{LCS}} \cdot P_{\text{LCS}}}{R_{\text{LCS}} + \beta^2 \cdot P_{\text{LCS}}}$$

Where:

$$R_{\text{LCS}} = \frac{\text{LCS}(X, Y)}{|Y|}, \quad P_{\text{LCS}} = \frac{\text{LCS}(X, Y)}{|X|}$$

### Computing ROUGE

```python
# pip install rouge-score
from rouge_score import rouge_scorer

scorer = rouge_scorer.RougeScorer(
    ["rouge1", "rouge2", "rougeL"],
    use_stemmer=True
)

reference = "Scientists discovered a new deep-sea fish species in the Mariana Trench at 8000 meters depth."
candidate = "A new fish species was found in the deepest part of the ocean, the Mariana Trench."

scores = scorer.score(reference, candidate)

print("ROUGE Scores:")
print(f"  ROUGE-1: P={scores['rouge1'].precision:.4f} R={scores['rouge1'].recall:.4f} F={scores['rouge1'].fmeasure:.4f}")
print(f"  ROUGE-2: P={scores['rouge2'].precision:.4f} R={scores['rouge2'].recall:.4f} F={scores['rouge2'].fmeasure:.4f}")
print(f"  ROUGE-L: P={scores['rougeL'].precision:.4f} R={scores['rougeL'].recall:.4f} F={scores['rougeL'].fmeasure:.4f}")
```

### Interpreting ROUGE Scores

| Score Range | Quality |
|-------------|---------|
| ROUGE-1 F1 > 0.45 | Good |
| ROUGE-2 F1 > 0.20 | Good |
| ROUGE-L F1 > 0.35 | Good |

> **Note:** ROUGE doesn't capture meaning — two summaries with different words but same meaning may score low.

---

## Hybrid Approaches

Combine extractive and abstractive methods:

1. Use extractive method to select key sentences
2. Feed selected sentences to an abstractive model

```python
def hybrid_summarize(text, num_extract=5, max_abstract_length=150):
    """Hybrid summarization: extract then abstract."""
    extracted = textrank_summarize(text, num_sentences=num_extract)
    summary = bart_summarize(extracted, max_length=max_abstract_length)
    return summary
```

---

## Long Document Summarization

Standard Transformers have a token limit (512–1024). Long documents require special handling.

### Strategies

| Approach | Description |
|----------|-------------|
| **Chunking** | Split document, summarize each chunk, merge |
| **Hierarchical** | Summarize sections → summarize summaries |
| **Longformer/LED** | Extended context models (up to 16K tokens) |
| **Map-Reduce** | Map: summarize chunks; Reduce: combine |

### Map-Reduce Summarization

```python
def long_document_summarize(text, max_summary_length=200):
    """Summarize a long document using map-reduce approach."""
    # Split into chunks
    sentences = text.split(". ")
    chunks, current, size = [], [], 0
    for s in sentences:
        words = len(s.split())
        if size + words > 400 and current:
            chunks.append(". ".join(current) + ".")
            current, size = [s], words
        else:
            current.append(s)
            size += words
    if current:
        chunks.append(". ".join(current) + ".")

    # Map: summarize each chunk
    chunk_summaries = [t5_summarize(c, max_length=100, min_length=20) for c in chunks]
    combined = " ".join(chunk_summaries)

    # Reduce: summarize combined summaries if needed
    if len(combined.split()) > max_summary_length:
        return t5_summarize(combined, max_length=max_summary_length, min_length=50)
    return combined
```

### Using Extended-Context Models

For documents longer than 1024 tokens, use models like **LED** (Longformer Encoder-Decoder) that support up to 16K tokens:

```python
from transformers import LEDForConditionalGeneration, LEDTokenizer
import torch

model = LEDForConditionalGeneration.from_pretrained("allenai/led-base-16384")
tokenizer = LEDTokenizer.from_pretrained("allenai/led-base-16384")

def led_summarize(text, max_length=256):
    """Summarize long documents (up to 16K tokens) with LED."""
    inputs = tokenizer(text, return_tensors="pt", max_length=16384, truncation=True)
    global_attention_mask = torch.zeros_like(inputs["input_ids"])
    global_attention_mask[:, 0] = 1

    summary_ids = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        global_attention_mask=global_attention_mask,
        max_length=max_length, num_beams=4,
    )
    return tokenizer.decode(summary_ids[0], skip_special_tokens=True)
```

---

## Code: Summarization with Hugging Face Pipeline

```python
from transformers import pipeline
from rouge_score import rouge_scorer

# Load summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# ROUGE scorer
scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)

article = """
Climate change is accelerating at an unprecedented rate, according to a new
report from the United Nations. Global temperatures have risen by 1.1 degrees
Celsius since pre-industrial times. The report warns that without immediate and
drastic action, temperatures could rise by 2.7 degrees by the end of the century.
This would lead to more frequent extreme weather events, rising sea levels, and
mass extinction of species. The scientists behind the report call for a 45 percent
reduction in carbon emissions by 2030. Renewable energy sources must replace
fossil fuels at a much faster rate. Governments are urged to implement carbon
taxes and invest heavily in green technology.
"""

# Generate summary
result = summarizer(article, max_length=80, min_length=30, do_sample=False)
summary = result[0]["summary_text"]
print(f"Summary: {summary}")

# Evaluate
reference = "A UN report says global temperatures rose 1.1C and could reach 2.7C without drastic emissions cuts by 2030."
scores = scorer.score(reference, summary)
print(f"\nROUGE-1 F1: {scores['rouge1'].fmeasure:.4f}")
print(f"ROUGE-2 F1: {scores['rouge2'].fmeasure:.4f}")
print(f"ROUGE-L F1: {scores['rougeL'].fmeasure:.4f}")
```

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Extractive | Select important sentences from original |
| Abstractive | Generate new summary text |
| TF-IDF scoring | Rank sentences by word importance |
| TextRank | Graph-based sentence ranking (PageRank) |
| T5 | Text-to-text model, prefix with "summarize:" |
| BART | Denoising autoencoder, strong for summarization |
| Pegasus | Pre-trained specifically for summarization |
| ROUGE-N | N-gram overlap between candidate and reference |
| ROUGE-L | Longest common subsequence metric |
| Hybrid | Extract then abstract for best results |
| Long docs | Chunk → summarize → merge |

### Key Takeaways

1. Extractive is fast and faithful but may lack coherence
2. Abstractive produces fluent summaries but can hallucinate
3. TextRank is a strong unsupervised extractive baseline
4. BART and Pegasus are the go-to models for abstractive summarization
5. Always evaluate with ROUGE (and human judgment for critical applications)
6. For long documents, use chunking or extended-context models

---

## Next Steps

You've completed the NLP applications section! Review:
- **Prompt Engineering** — guide LLMs to summarize effectively
- **Text Generation** — understand how abstractive models produce text
- **Question Answering** — extract specific answers from text
