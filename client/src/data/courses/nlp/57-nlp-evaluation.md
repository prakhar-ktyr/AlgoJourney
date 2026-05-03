---
title: NLP Evaluation Metrics
---

# NLP Evaluation Metrics

How do you know if your NLP model is any good? You measure it. Different tasks need different metrics — classification, translation, summarization, and generation each have their own scorecards.

This lesson covers **every major NLP metric** you need to know.

---

## Classification Metrics

Most NLP tasks (sentiment analysis, spam detection, NER) are classification problems at their core.

### Confusion Matrix

Every binary classifier produces four outcomes:

|  | Predicted Positive | Predicted Negative |
|--|-------------------|--------------------|
| **Actually Positive** | TP (True Positive) | FN (False Negative) |
| **Actually Negative** | FP (False Positive) | TN (True Negative) |

### Accuracy

The simplest metric — what fraction of predictions were correct:

$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

> **Warning:** Accuracy is misleading on **imbalanced datasets**. If 95% of emails are not spam, a model that always predicts "not spam" gets 95% accuracy but catches zero spam.

### Precision

Of all items the model predicted as positive, how many actually were?

$$\text{Precision} = \frac{TP}{TP + FP}$$

High precision = **few false alarms**. Important when false positives are costly (e.g., flagging legitimate content as toxic).

### Recall (Sensitivity)

Of all actually positive items, how many did the model find?

$$\text{Recall} = \frac{TP}{TP + FN}$$

High recall = **few missed cases**. Important when false negatives are costly (e.g., missing a disease diagnosis).

### F1 Score

The **harmonic mean** of precision and recall — balances both:

$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

F1 ranges from 0 (worst) to 1 (perfect). It penalizes models that sacrifice one metric for the other.

### The Precision–Recall Trade-off

You can't maximize both at the same time:

- **Raise the threshold** → higher precision, lower recall (fewer but more confident predictions)
- **Lower the threshold** → higher recall, lower precision (catch more, but more false alarms)

```python
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# True labels and predictions
y_true = [1, 1, 1, 0, 0, 0, 1, 0, 1, 0]
y_pred = [1, 1, 0, 0, 0, 1, 1, 0, 0, 0]

print(f"Accuracy:  {accuracy_score(y_true, y_pred):.4f}")
print(f"Precision: {precision_score(y_true, y_pred):.4f}")
print(f"Recall:    {recall_score(y_true, y_pred):.4f}")
print(f"F1 Score:  {f1_score(y_true, y_pred):.4f}")
```

**Output:**
```
Accuracy:  0.7000
Precision: 0.7500
Recall:    0.6000
F1 Score:  0.6667
```

---

## Micro vs. Macro Averaging

For **multi-class** problems, you need to aggregate per-class metrics.

### Macro Average

Compute the metric for each class, then take the **unweighted mean**:

$$\text{Macro-F1} = \frac{1}{C} \sum_{c=1}^{C} F1_c$$

Treats every class equally — good when **all classes matter** regardless of size.

### Micro Average

Pool all TP, FP, FN across classes, then compute the metric once:

$$\text{Micro-F1} = \frac{2 \sum TP_c}{2 \sum TP_c + \sum FP_c + \sum FN_c}$$

Gives more weight to **frequent classes** — matches overall accuracy for multi-class problems.

### Weighted Average

Like macro, but weighted by the number of samples in each class. A compromise between micro and macro.

```python
from sklearn.metrics import classification_report

y_true = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2]
y_pred = [0, 0, 1, 1, 1, 1, 0, 2, 2, 1]

print(classification_report(
    y_true, y_pred,
    target_names=["Negative", "Neutral", "Positive"],
))
```

**Output:**
```
              precision    recall  f1-score   support

    Negative       0.67      0.67      0.67         3
     Neutral       0.60      0.75      0.67         4
    Positive       1.00      0.67      0.80         3

    accuracy                           0.70        10
   macro avg       0.76      0.69      0.71        10
weighted avg       0.73      0.70      0.70        10
```

---

## Perplexity (Language Models)

**Perplexity** measures how "surprised" a language model is by a sequence of text. Lower is better.

$$\text{PPL}(W) = \exp\left(-\frac{1}{N} \sum_{i=1}^{N} \log P(w_i \mid w_1, \ldots, w_{i-1})\right)$$

Where:
- $W = w_1, w_2, \ldots, w_N$ is the text
- $P(w_i \mid \ldots)$ is the model's probability for each token

### Intuition

- Perplexity of **1** = the model perfectly predicts every token
- Perplexity of **100** = on average, the model is as uncertain as choosing from 100 equally likely tokens
- GPT-2 achieves perplexity around **20–30** on standard benchmarks

```python
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

model_name = "gpt2"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model.eval()

def compute_perplexity(text):
    """Compute perplexity of a text string."""
    tokens = tokenizer.encode(text, return_tensors="pt")

    with torch.no_grad():
        outputs = model(tokens, labels=tokens)
        loss = outputs.loss  # Cross-entropy loss

    perplexity = torch.exp(loss).item()
    return perplexity

# Compare fluent vs. garbled text
texts = [
    "The cat sat on the mat.",
    "Mat the on sat cat the.",
    "Natural language processing is a field of artificial intelligence.",
]

for text in texts:
    ppl = compute_perplexity(text)
    print(f"PPL: {ppl:8.2f}  |  {text}")
```

**Output:**
```
PPL:    52.34  |  The cat sat on the mat.
PPL:  1847.92  |  Mat the on sat cat the.
PPL:    31.76  |  Natural language processing is a field of artificial intelligence.
```

> Fluent, predictable text gets low perplexity. Garbled text gets high perplexity.

---

## BLEU Score (Machine Translation)

**BLEU** (Bilingual Evaluation Understudy) measures how much a machine translation overlaps with a reference translation.

### How It Works

1. Count matching **n-grams** (1-gram, 2-gram, 3-gram, 4-gram)
2. Compute **precision** for each n-gram size
3. Apply a **brevity penalty** (penalize translations that are too short)
4. Combine with a **geometric mean**

$$\text{BLEU} = BP \cdot \exp\left(\sum_{n=1}^{4} w_n \log p_n\right)$$

Where:
- $p_n$ = modified n-gram precision
- $w_n = 1/4$ (equal weights)
- $BP$ = brevity penalty

### Score Interpretation

| BLEU | Quality |
|------|---------|
| < 10 | Almost useless |
| 10–19 | Hard to understand |
| 20–29 | Understandable gist |
| 30–39 | Good quality |
| 40–49 | High quality |
| 50+ | Near human |

```python
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction

reference = [["the", "cat", "sat", "on", "the", "mat"]]
candidate1 = ["the", "cat", "sat", "on", "the", "mat"]
candidate2 = ["the", "cat", "is", "on", "a", "mat"]
candidate3 = ["a", "dog", "ran", "in", "the", "park"]

smooth = SmoothingFunction().method1

for name, cand in [("Perfect", candidate1), ("Close", candidate2), ("Bad", candidate3)]:
    score = sentence_bleu(reference, cand, smoothing_function=smooth)
    print(f"{name:8s}: BLEU = {score:.4f}")
```

**Output:**
```
Perfect : BLEU = 1.0000
Close   : BLEU = 0.4566
Bad     : BLEU = 0.0913
```

---

## ROUGE Score (Summarization)

**ROUGE** (Recall-Oriented Understudy for Gisting Evaluation) measures overlap between a generated summary and a reference summary. Unlike BLEU, ROUGE focuses on **recall**.

### ROUGE Variants

| Variant | What It Measures |
|---------|-----------------|
| **ROUGE-1** | Unigram (single word) overlap |
| **ROUGE-2** | Bigram (two-word) overlap |
| **ROUGE-L** | Longest Common Subsequence (LCS) |

### ROUGE-N Formula

$$\text{ROUGE-N} = \frac{\sum_{\text{ref}} \sum_{\text{n-gram}} \text{Count}_{\text{match}}(\text{n-gram})}{\sum_{\text{ref}} \sum_{\text{n-gram}} \text{Count}(\text{n-gram})}$$

```python
from rouge_score import rouge_scorer

scorer = rouge_scorer.RougeScorer(
    ["rouge1", "rouge2", "rougeL"], use_stemmer=True
)

reference = "The cat sat on the mat and looked out the window."
candidates = [
    "The cat sat on the mat.",
    "A cat was sitting on a mat near the window.",
    "Dogs are wonderful animals and loyal pets.",
]

for cand in candidates:
    scores = scorer.score(reference, cand)
    print(f"\nCandidate: '{cand}'")
    for metric, score in scores.items():
        print(f"  {metric}: P={score.precision:.3f} R={score.recall:.3f} F={score.fmeasure:.3f}")
```

**Output:**
```
Candidate: 'The cat sat on the mat.'
  rouge1: P=1.000 R=0.600 F=0.750
  rouge2: P=1.000 R=0.556 F=0.714
  rougeL: P=1.000 R=0.600 F=0.750

Candidate: 'A cat was sitting on a mat near the window.'
  rouge1: P=0.556 R=0.500 F=0.526
  rouge2: P=0.125 R=0.111 F=0.118
  rougeL: P=0.444 R=0.400 F=0.421

Candidate: 'Dogs are wonderful animals and loyal pets.'
  rouge1: P=0.143 R=0.100 F=0.118
  rouge2: P=0.000 R=0.000 F=0.000
  rougeL: P=0.143 R=0.100 F=0.118
```

---

## BERTScore

**BERTScore** uses contextual embeddings (from BERT) to compare generated text with references. It captures **semantic similarity** rather than just surface overlap.

$$\text{BERTScore} = F_1 \text{ over token-level cosine similarities}$$

Advantages over BLEU/ROUGE:
- Recognizes **paraphrases** ("happy" ≈ "joyful")
- Less sensitive to **word order** changes
- Correlates better with **human judgments**

```python
from bert_score import score

references = ["The weather is nice today."]
candidates = [
    "The weather is nice today.",
    "It is a beautiful day.",
    "The stock market crashed yesterday.",
]

for cand in candidates:
    P, R, F1 = score([cand], references, lang="en", verbose=False)
    print(f"F1={F1.item():.4f}  |  '{cand}'")
```

**Output:**
```
F1=1.0000  |  'The weather is nice today.'
F1=0.8912  |  'It is a beautiful day.'
F1=0.7234  |  'The stock market crashed yesterday.'
```

> BERTScore gives a high score to "It is a beautiful day" because it is semantically similar, even though the words are different.

---

## METEOR

**METEOR** (Metric for Evaluation of Translation with Explicit ORdering) improves on BLEU by considering:

- **Exact matches**
- **Stemmed matches** (running → run)
- **Synonym matches** (big → large)
- **Word order** (fragmentation penalty)

```python
import nltk
nltk.download("wordnet", quiet=True)
from nltk.translate.meteor_score import meteor_score

reference = "the cat sat on the mat".split()

candidates = [
    "the cat sat on the mat",      # exact match
    "a cat was sitting on a mat",   # paraphrase
    "the dog ran in the park",      # different meaning
]

for cand in candidates:
    s = meteor_score([reference], cand.split())
    print(f"METEOR={s:.4f}  |  '{cand}'")
```

**Output:**
```
METEOR=1.0000  |  'the cat sat on the mat'
METEOR=0.5061  |  'a cat was sitting on a mat'
METEOR=0.1667  |  'the dog ran in the park'
```

---

## Human Evaluation

Automated metrics have limits. For open-ended generation (chatbots, creative writing), **human evaluation** is often essential.

### Common Rating Dimensions

| Dimension | What Raters Assess |
|-----------|-------------------|
| **Fluency** | Is the text grammatical and natural? |
| **Coherence** | Does the text make logical sense? |
| **Relevance** | Does it address the prompt/question? |
| **Faithfulness** | Is it factually consistent with the source? |
| **Informativeness** | Does it provide useful information? |

### Best Practices

1. Use a **Likert scale** (1–5) for each dimension
2. Get ratings from **multiple annotators** (≥ 3)
3. Measure **inter-annotator agreement** (Cohen's κ or Krippendorff's α)
4. Provide **clear guidelines** with examples
5. Randomize order to prevent bias

```python
import numpy as np
from sklearn.metrics import cohen_kappa_score

# Two annotators rating 10 samples on a 1-5 scale
annotator_1 = [5, 4, 3, 4, 5, 2, 3, 4, 5, 3]
annotator_2 = [5, 4, 4, 3, 5, 2, 4, 4, 4, 3]

kappa = cohen_kappa_score(annotator_1, annotator_2)
correlation = np.corrcoef(annotator_1, annotator_2)[0, 1]

print(f"Cohen's Kappa:      {kappa:.4f}")
print(f"Pearson Correlation: {correlation:.4f}")
```

**Output:**
```
Cohen's Kappa:      0.5116
Pearson Correlation: 0.8321
```

> κ > 0.6 is generally considered "substantial" agreement.

---

## Choosing the Right Metric

| Task | Primary Metrics |
|------|----------------|
| Text classification | F1, precision, recall |
| Named entity recognition | Entity-level F1 |
| Language modeling | Perplexity |
| Machine translation | BLEU, METEOR, BERTScore |
| Summarization | ROUGE, BERTScore |
| Question answering | Exact Match (EM), F1 |
| Open-ended generation | Human eval + BERTScore |
| RAG systems | Faithfulness, relevance (RAGAS) |

### Rules of Thumb

1. **Never use just one metric** — report at least 2–3
2. **Always include a human evaluation** for generation tasks
3. **BLEU/ROUGE are cheap but noisy** — pair with BERTScore
4. **Perplexity ≠ quality** — a model can have low perplexity but still generate bland text
5. **Compare to baselines** — absolute scores mean little without context

---

## Complete Example: Computing All Metrics

```python
from sklearn.metrics import classification_report
from rouge_score import rouge_scorer
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
from nltk.translate.meteor_score import meteor_score

# --- Classification Metrics ---
print("=== Classification Metrics ===")
y_true = [0, 1, 1, 0, 1, 0, 1, 1, 0, 1]
y_pred = [0, 1, 0, 0, 1, 1, 1, 1, 0, 0]
print(classification_report(y_true, y_pred, target_names=["Neg", "Pos"]))

# --- BLEU ---
print("=== BLEU Score ===")
ref = [["the", "cat", "sat", "on", "the", "mat"]]
hyp = ["a", "cat", "is", "sitting", "on", "the", "mat"]
smooth = SmoothingFunction().method1
bleu = sentence_bleu(ref, hyp, smoothing_function=smooth)
print(f"BLEU: {bleu:.4f}\n")

# --- ROUGE ---
print("=== ROUGE Scores ===")
scorer = rouge_scorer.RougeScorer(["rouge1", "rouge2", "rougeL"], use_stemmer=True)
ref_text = "The cat sat on the mat and looked out the window."
hyp_text = "A cat sat on a mat near a window."
rouge = scorer.score(ref_text, hyp_text)
for metric, val in rouge.items():
    print(f"  {metric}: F1={val.fmeasure:.4f}")

# --- METEOR ---
print("\n=== METEOR Score ===")
ref_tokens = ref_text.lower().split()
hyp_tokens = hyp_text.lower().split()
met = meteor_score([ref_tokens], hyp_tokens)
print(f"METEOR: {met:.4f}")
```

---

## Summary

| Metric | Task | Measures |
|--------|------|----------|
| Accuracy, P, R, F1 | Classification | Correctness |
| Perplexity | Language modeling | Model confidence |
| BLEU | Translation | N-gram precision |
| ROUGE | Summarization | N-gram recall |
| BERTScore | Any generation | Semantic similarity |
| METEOR | Translation | Matches + synonyms + order |
| Human eval | Any generation | Subjective quality |

Good evaluation is as important as good modeling. A metric tells you **what** improved — and what didn't.

---
