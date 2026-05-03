---
title: BERT
---

# BERT

In this lesson, you will learn about **BERT (Bidirectional Encoder Representations from Transformers)** — a groundbreaking model from Google (2018) that revolutionized NLP by introducing bidirectional pre-training. BERT achieved state-of-the-art results on 11 NLP tasks simultaneously and changed how we approach language understanding.

---

## What Is BERT?

BERT is a **pre-trained transformer encoder** that learns deep bidirectional representations of language. It can be **fine-tuned** with just one additional output layer for a wide range of downstream tasks.

### The Key Innovation: Bidirectional Context

Previous models read text in one direction:

```
GPT (left-to-right):     "The cat sat on the [???]"
                           ←─── only uses left context

ELMo (shallow bidir):     Forward LSTM + Backward LSTM (separate)

BERT (deep bidirectional): "The cat [MASK] on the mat"
                            ←─── uses BOTH sides ───►
```

BERT sees context from **both directions simultaneously** at every layer, giving it a much richer understanding of each token.

---

## Pre-Training Objectives

BERT is pre-trained on two unsupervised tasks using large amounts of unlabeled text (BooksCorpus + English Wikipedia, ~3.3 billion words).

### 1. Masked Language Model (MLM)

Randomly mask 15% of tokens and predict them:

```
Input:  "The cat [MASK] on the mat"
Target: "The cat  sat   on the mat"
```

The masking strategy:
- 80% of the time: replace with `[MASK]`
- 10% of the time: replace with a random token
- 10% of the time: keep the original token

This prevents the model from simply learning "whenever I see `[MASK]`, predict something."

### Why MLM Works

$$P(x_{\text{masked}} | x_{\text{context}}) = \text{softmax}(W \cdot h_{\text{masked}} + b)$$

By predicting masked words from bidirectional context, BERT learns **deep representations** that capture syntax, semantics, and world knowledge.

### 2. Next Sentence Prediction (NSP)

Given two sentences, predict if sentence B follows sentence A:

```
Input:  [CLS] The cat sat on the mat [SEP] It was a fluffy cat [SEP]
Label:  IsNext (True)

Input:  [CLS] The cat sat on the mat [SEP] Stock prices rose today [SEP]
Label:  NotNext (False)
```

This helps BERT understand **sentence-level relationships** — useful for tasks like question answering and natural language inference.

---

## BERT Input Format

BERT uses a specific input format with special tokens:

```
Tokens:     [CLS]  The  cat  sat  [SEP]  It  was  fluffy  [SEP]
Segments:     A     A    A    A     A      B   B     B       B
Position:     0     1    2    3     4      5   6     7       8
```

### Special Tokens

| Token | Purpose |
|---|---|
| `[CLS]` | Classification token — its final hidden state is used for classification tasks |
| `[SEP]` | Separator — marks the boundary between sentences |
| `[MASK]` | Masking token — used during pre-training |
| `[PAD]` | Padding — for batch processing |

### Three Embeddings Are Summed

$$\text{input} = \text{token\_embedding} + \text{segment\_embedding} + \text{position\_embedding}$$

- **Token embedding**: vocabulary ID → vector
- **Segment embedding**: which sentence (A or B)
- **Position embedding**: learned (not sinusoidal like original transformer)

---

## BERT Variants

| Model | Layers | Hidden | Heads | Parameters |
|---|---|---|---|---|
| BERT-base | 12 | 768 | 12 | 110M |
| BERT-large | 24 | 1024 | 16 | 340M |

### Pre-Training Compute

- BERT-base: 4 days on 16 TPU chips
- BERT-large: 4 days on 64 TPU chips
- Training data: ~3.3 billion words

---

## Fine-Tuning for Downstream Tasks

The power of BERT: pre-train **once**, fine-tune for **many tasks** with minimal changes.

### Task-Specific Architecture

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Classification: [CLS] → Linear → softmax → label       │
│                                                          │
│  NER/Tagging:    each token → Linear → tag              │
│                                                          │
│  QA:             each token → Linear → start/end span    │
│                                                          │
│  ─────────────────────────────────────────               │
│  │           Pre-trained BERT (frozen or fine-tuned)  │  │
│  ─────────────────────────────────────────               │
│  Input: [CLS] tokens [SEP] (tokens [SEP])               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Common Fine-Tuning Tasks

| Task | Input | Output | Use of BERT |
|---|---|---|---|
| Sentiment analysis | Single sentence | Pos/Neg | `[CLS]` → classifier |
| NER | Single sentence | Tag per token | Each token → tag |
| Question answering | Question + Passage | Answer span | Start/end positions |
| Textual similarity | Sentence A + B | Score | `[CLS]` → regressor |
| NLI (entailment) | Premise + Hypothesis | Entail/Contradict/Neutral | `[CLS]` → 3-class |

### Fine-Tuning Hyperparameters

| Parameter | Typical Value |
|---|---|
| Learning rate | 2e-5 to 5e-5 |
| Batch size | 16 or 32 |
| Epochs | 2 to 4 |
| Warmup | 10% of steps |
| Max sequence length | 128 or 512 |

Fine-tuning is **fast** — often just a few hours on a single GPU!

---

## BERT Variants and Successors

### DistilBERT (Hugging Face, 2019)

- 40% smaller, 60% faster, retains 97% of BERT's performance
- Uses **knowledge distillation** during training
- 66M parameters (vs 110M for BERT-base)

### RoBERTa (Facebook, 2019)

- "Robustly Optimized BERT Pretraining Approach"
- Key changes:
  - Removed NSP objective
  - Trained longer with more data
  - Larger batches
  - Dynamic masking (different mask each epoch)
- Consistently outperforms BERT

### ALBERT (Google, 2019)

- "A Lite BERT"
- Parameter reduction techniques:
  - Factorized embedding parameterization
  - Cross-layer parameter sharing
- 18× fewer parameters than BERT-large, competitive performance

### Comparison

| Model | Parameters | Speed | Performance |
|---|---|---|---|
| BERT-base | 110M | Baseline | Strong |
| DistilBERT | 66M | 1.6× faster | 97% of BERT |
| RoBERTa | 125M | Similar | Better than BERT |
| ALBERT-base | 12M | Faster | Competitive |
| BERT-large | 340M | Slower | Best (classic) |

---

## BERT vs GPT

| Feature | BERT | GPT |
|---|---|---|
| Architecture | Encoder only | Decoder only |
| Direction | Bidirectional | Left-to-right |
| Pre-training | MLM + NSP | Next token prediction |
| Best for | Understanding tasks | Generation tasks |
| Examples | Classification, NER, QA | Text generation, chat |

BERT excels at **understanding** (classification, extraction); GPT excels at **generation** (writing, dialogue).

---

## Code: BERT with Hugging Face Transformers

```python
import torch
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    BertModel,
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from torch.utils.data import Dataset, DataLoader
import torch.nn.functional as F


# ================================================
# PART 1: Using BERT for Inference
# ================================================

def bert_embeddings_demo():
    """Demonstrate BERT's contextual embeddings."""
    print("=" * 60)
    print("BERT CONTEXTUAL EMBEDDINGS")
    print("=" * 60)

    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    model = BertModel.from_pretrained("bert-base-uncased")
    model.eval()

    # Same word, different meanings
    sentences = [
        "I went to the bank to deposit money.",
        "I sat on the bank of the river.",
        "The bank approved my loan application."
    ]

    print("\nContextual embeddings for 'bank':")
    for sent in sentences:
        inputs = tokenizer(sent, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)

        # Find the position of "bank"
        tokens = tokenizer.tokenize(sent)
        bank_idx = tokens.index("bank") + 1  # +1 for [CLS]

        bank_embedding = outputs.last_hidden_state[0, bank_idx]
        print(f"  '{sent[:40]}...'")
        print(f"    Embedding norm: {bank_embedding.norm():.4f}")
        print(f"    First 5 dims: {bank_embedding[:5].tolist()}")
        print()

    # The embeddings for "bank" will be DIFFERENT in each context!
    # This is the power of contextual representations.


# ================================================
# PART 2: Sentiment Classification with BERT
# ================================================

class SentimentDataset(Dataset):
    """Simple sentiment dataset."""

    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx],
            max_length=self.max_len,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long)
        }


def fine_tune_bert():
    """Fine-tune BERT for sentiment classification."""
    print("=" * 60)
    print("FINE-TUNING BERT FOR SENTIMENT ANALYSIS")
    print("=" * 60)

    # Load pre-trained BERT for classification
    model_name = "bert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name, num_labels=2
    )

    # Sample training data
    train_texts = [
        "This movie was absolutely fantastic! Great acting.",
        "Terrible waste of time. Boring and predictable.",
        "I loved every minute of this wonderful film.",
        "The worst movie I have ever seen in my life.",
        "Brilliant performances and a compelling story.",
        "Awful acting, terrible script, and bad directing.",
        "A masterpiece of modern cinema. Highly recommend.",
        "I fell asleep halfway through. So dull and lifeless.",
        "Outstanding film with incredible depth and emotion.",
        "Complete garbage. Do not waste your money on this.",
    ]
    train_labels = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0]

    # Create dataset
    dataset = SentimentDataset(
        train_texts, train_labels, tokenizer, max_len=64
    )
    dataloader = DataLoader(dataset, batch_size=4, shuffle=True)

    # Fine-tuning setup
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # Training loop
    model.train()
    for epoch in range(3):
        total_loss = 0
        correct = 0
        total = 0

        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )

            loss = outputs.loss
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()
            preds = outputs.logits.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        accuracy = correct / total * 100
        print(f"  Epoch {epoch+1}: Loss={total_loss:.4f}, "
              f"Accuracy={accuracy:.1f}%")

    return model, tokenizer


# ================================================
# PART 3: Inference with Fine-Tuned Model
# ================================================

def predict_sentiment(model, tokenizer, text, device="cpu"):
    """Predict sentiment for a given text."""
    model.eval()
    encoding = tokenizer(
        text,
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )

    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probs = F.softmax(outputs.logits, dim=1)
        prediction = probs.argmax(dim=1).item()
        confidence = probs[0][prediction].item()

    label = "Positive" if prediction == 1 else "Negative"
    return label, confidence


# ================================================
# PART 4: Using Pre-Trained Pipeline (Easiest!)
# ================================================

def pipeline_demo():
    """Simplest way to use BERT — Hugging Face pipelines."""
    print("\n" + "=" * 60)
    print("HUGGING FACE PIPELINE (EASIEST APPROACH)")
    print("=" * 60)
    print("""
from transformers import pipeline

# Sentiment analysis (uses fine-tuned BERT variant)
classifier = pipeline("sentiment-analysis")

results = classifier([
    "I love this product! Best purchase ever.",
    "Terrible quality. Broke after one day.",
    "It's okay, nothing special but not bad either."
])

for text, result in zip(texts, results):
    print(f"  {result['label']}: {result['score']:.4f} — '{text[:40]}'")

# Named Entity Recognition
ner = pipeline("ner", grouped_entities=True)
entities = ner("Elon Musk founded SpaceX in Hawthorne, California.")
for entity in entities:
    print(f"  {entity['entity_group']}: {entity['word']} "
          f"({entity['score']:.3f})")

# Question Answering
qa = pipeline("question-answering")
result = qa(
    question="What is BERT?",
    context="BERT is a language model developed by Google in 2018. "
            "It uses bidirectional transformers for pre-training."
)
print(f"  Answer: {result['answer']} (score: {result['score']:.4f})")

# Fill-Mask (BERT's native task!)
fill_mask = pipeline("fill-mask", model="bert-base-uncased")
results = fill_mask("The capital of France is [MASK].")
for r in results[:3]:
    print(f"  {r['token_str']}: {r['score']:.4f}")
""")


# ================================================
# PART 5: Extracting BERT Features
# ================================================

def extract_features():
    """Extract BERT features for downstream use."""
    print("\n" + "=" * 60)
    print("EXTRACTING BERT FEATURES")
    print("=" * 60)

    tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
    model = BertModel.from_pretrained("bert-base-uncased")
    model.eval()

    text = "Natural language processing is fascinating."
    inputs = tokenizer(text, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)

    # Available outputs
    print(f"\nInput: '{text}'")
    print(f"Tokens: {tokenizer.tokenize(text)}")
    print(f"\nOutput shapes:")
    print(f"  last_hidden_state: {outputs.last_hidden_state.shape}")
    print(f"  pooler_output:     {outputs.pooler_output.shape}")
    print(f"  hidden_states:     {len(outputs.hidden_states)} layers")

    # [CLS] token embedding (good for sentence-level tasks)
    cls_embedding = outputs.last_hidden_state[0, 0, :]
    print(f"\n[CLS] embedding (sentence representation):")
    print(f"  Shape: {cls_embedding.shape}")
    print(f"  Norm:  {cls_embedding.norm():.4f}")

    # Mean pooling (often better than [CLS])
    token_embeddings = outputs.last_hidden_state[0]  # All tokens
    attention_mask = inputs["attention_mask"][0]
    mask_expanded = attention_mask.unsqueeze(-1).float()
    mean_embedding = (
        (token_embeddings * mask_expanded).sum(0)
        / mask_expanded.sum(0)
    )
    print(f"\nMean-pooled embedding:")
    print(f"  Shape: {mean_embedding.shape}")
    print(f"  Norm:  {mean_embedding.norm():.4f}")

    # Sentence similarity using cosine similarity
    text2 = "NLP is an exciting field of AI."
    inputs2 = tokenizer(text2, return_tensors="pt")
    with torch.no_grad():
        outputs2 = model(**inputs2)
    cls2 = outputs2.last_hidden_state[0, 0, :]

    similarity = F.cosine_similarity(
        cls_embedding.unsqueeze(0), cls2.unsqueeze(0)
    )
    print(f"\nSentence similarity:")
    print(f"  '{text}'")
    print(f"  '{text2}'")
    print(f"  Cosine similarity: {similarity.item():.4f}")


# ================================================
# Main
# ================================================

if __name__ == "__main__":
    # Run demos (comment out what you don't need)
    bert_embeddings_demo()

    # Fine-tune (requires GPU for practical use)
    model, tokenizer = fine_tune_bert()

    # Predict
    device = "cpu"
    test_sentences = [
        "This is the best thing I've ever bought!",
        "Absolutely horrible. I want a refund.",
        "The quality exceeded my expectations."
    ]
    print("\n--- Predictions ---")
    for sent in test_sentences:
        label, conf = predict_sentiment(model, tokenizer, sent, device)
        print(f"  {label} ({conf:.2%}): '{sent}'")

    # Other demos
    pipeline_demo()
    extract_features()
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| BERT | Bidirectional transformer encoder, pre-trained on unlabeled text |
| MLM | Mask 15% of tokens, predict them from context |
| NSP | Predict if sentence B follows sentence A |
| Bidirectional | Both left and right context at every layer |
| Fine-tuning | Add one layer, train 2-4 epochs on task data |
| `[CLS]` token | Used for sentence-level classification |
| DistilBERT | Smaller, faster, 97% of BERT's performance |
| RoBERTa | Better training recipe, no NSP, outperforms BERT |
| ALBERT | Parameter-efficient variant (12M params) |

---

## Next Steps

You've now covered the major milestones of modern NLP: from RNNs and LSTMs through attention and transformers to BERT. In the next lessons, you'll explore **GPT and generative models**, **fine-tuning techniques**, and **building real-world NLP applications**.
