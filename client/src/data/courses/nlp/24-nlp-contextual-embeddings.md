---
title: Contextual Embeddings
---

# Contextual Embeddings

All the embeddings we have studied so far — Word2Vec, GloVe, FastText — are **static**. Each word gets exactly **one** vector regardless of context. Contextual embeddings solve this limitation by generating **different vectors** for the same word depending on its surrounding context.

---

## The Problem with Static Embeddings

Consider the word **"bank"**:

- "I deposited money at the **bank**." (financial institution)
- "We walked along the river **bank**." (edge of a river)
- "You can **bank** on me." (rely/depend)

With static embeddings, all three uses get the **same vector** — a single point in space that tries to capture all possible meanings at once.

```python
# Static embedding problem demonstration
# With Word2Vec or GloVe:
# vector("bank") is the SAME in all these sentences:

sentences = [
    "I need to go to the bank to withdraw cash",
    "The river bank was covered with wildflowers",
    "You can bank on her to finish the project",
]

# All three would produce: glove["bank"] = [0.12, -0.34, 0.56, ...]
# ONE vector trying to represent MULTIPLE meanings!
```

This is a fundamental limitation. Research shows that approximately **80% of common English words** are polysemous (have multiple meanings).

---

## What Are Contextual Embeddings?

Contextual embeddings generate a **unique vector** for each word occurrence based on the full sentence context:

$$\vec{w}_{\text{bank}}^{(1)} \neq \vec{w}_{\text{bank}}^{(2)} \neq \vec{w}_{\text{bank}}^{(3)}$$

The vector changes because the model considers the **entire sentence** when computing each word's representation.

### Static vs Contextual Comparison

| Property | Static (Word2Vec/GloVe) | Contextual (ELMo/BERT) |
|----------|-------------------------|------------------------|
| Vectors per word | 1 (fixed) | Different for each occurrence |
| Context awareness | None | Full sentence/paragraph |
| Polysemy handling | Poor (averaged meaning) | Excellent (context-specific) |
| Computation | Lookup table (fast) | Neural network forward pass |
| Storage | Small (vocab × dim) | Model weights (large) |
| Training | Unsupervised on corpus | Language model pre-training |

---

## ELMo: Embeddings from Language Models

**ELMo** (Embeddings from Language Models) was introduced by Peters et al. in 2018. It was the first widely successful contextual embedding model.

### Architecture

ELMo uses a **deep bidirectional LSTM** language model:

1. **Forward LSTM**: reads the sentence left-to-right
2. **Backward LSTM**: reads the sentence right-to-left
3. **Combine**: concatenate representations from both directions

For an $L$-layer biLSTM, ELMo produces $2L + 1$ representations per token:

$$\text{ELMo}_k = \gamma \sum_{j=0}^{L} s_j \cdot h_{k,j}$$

Where:
- $h_{k,j}$ — hidden state at layer $j$ for token $k$
- $s_j$ — softmax-normalized layer weights (learned per task)
- $\gamma$ — scalar parameter (learned per task)

### Key Insight: Different Layers Capture Different Information

| Layer | What It Captures | Use Case |
|-------|------------------|----------|
| Layer 0 (token) | Character-level features | POS tagging, morphology |
| Layer 1 | Syntax, structure | Parsing, chunking |
| Layer 2 | Semantics, meaning | Sentiment, NER, QA |

```python
# ELMo produces context-dependent vectors
# "bank" in different contexts gets DIFFERENT vectors:

# Sentence 1: "I deposited money at the bank"
# ELMo("bank") → [0.23, -0.67, 0.89, ...]  (financial meaning)

# Sentence 2: "The river bank was muddy"
# ELMo("bank") → [-0.45, 0.12, 0.34, ...]  (geographical meaning)

# These vectors are DIFFERENT because ELMo reads the full context!
```

### Using ELMo with AllenNLP

```python
from allennlp.modules.elmo import Elmo, batch_to_ids

# ELMo model configuration
options_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_options.json"
weight_file = "https://allennlp.s3.amazonaws.com/models/elmo/2x4096_512_2048cnn_2xhighway/elmo_2x4096_512_2048cnn_2xhighway_weights.hdf5"

# Initialize ELMo (1024-dimensional vectors)
elmo = Elmo(options_file, weight_file, num_output_representations=1)

# Prepare sentences
sentences = [
    ["I", "went", "to", "the", "bank", "to", "deposit", "money"],
    ["The", "river", "bank", "was", "full", "of", "flowers"],
]

# Convert to character IDs
character_ids = batch_to_ids(sentences)

# Get ELMo embeddings
embeddings = elmo(character_ids)
elmo_vectors = embeddings["elmo_representations"][0]

print(f"Shape: {elmo_vectors.shape}")
# Shape: (2, max_seq_len, 1024)

# Compare "bank" vectors from different contexts
bank_financial = elmo_vectors[0, 4, :]  # "bank" in sentence 1
bank_river = elmo_vectors[1, 2, :]      # "bank" in sentence 2

from torch.nn.functional import cosine_similarity
import torch

sim = cosine_similarity(
    bank_financial.unsqueeze(0),
    bank_river.unsqueeze(0)
)
print(f"Similarity of 'bank' in different contexts: {sim.item():.4f}")
# Lower similarity = model distinguishes the meanings!
```

---

## Deep Contextualized Representations

The power of contextual embeddings comes from **deep neural networks** that process the entire sentence:

### How Context Changes Vectors

```python
import torch
from transformers import AutoTokenizer, AutoModel

# Load a pre-trained model (BERT)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

def get_word_embedding(sentence, target_word):
    """Get contextual embedding for a word in a sentence."""
    # Tokenize
    inputs = tokenizer(sentence, return_tensors="pt", padding=True)

    # Get model output
    with torch.no_grad():
        outputs = model(**inputs)

    # Get the hidden states (last layer)
    hidden_states = outputs.last_hidden_state  # (1, seq_len, 768)

    # Find the target word's token position
    tokens = tokenizer.tokenize(sentence)
    target_idx = None
    for i, token in enumerate(tokens):
        if token == target_word or token == f"##{target_word}":
            target_idx = i + 1  # +1 for [CLS] token
            break

    if target_idx is None:
        return None

    return hidden_states[0, target_idx, :].numpy()

# Compare "bank" in different contexts
sentences = [
    ("I deposited money at the bank", "bank"),
    ("The river bank was covered in moss", "bank"),
    ("You can bank on me for support", "bank"),
]

vectors = {}
for sentence, word in sentences:
    vec = get_word_embedding(sentence, word)
    vectors[sentence] = vec
    print(f"'{sentence}'")
    print(f"  '{word}' vector (first 5): {vec[:5]}")
    print()

# Compare vectors
from numpy import dot
from numpy.linalg import norm

def cosine_sim(a, b):
    return dot(a, b) / (norm(a) * norm(b))

keys = list(vectors.keys())
print("Pairwise similarity of 'bank' vectors:")
for i in range(len(keys)):
    for j in range(i + 1, len(keys)):
        sim = cosine_sim(vectors[keys[i]], vectors[keys[j]])
        print(f"  Sentence {i+1} vs {j+1}: {sim:.4f}")
```

---

## From ELMo to BERT (Preview)

ELMo was revolutionary, but **BERT** (2018) took contextual embeddings to the next level:

| Feature | ELMo | BERT |
|---------|------|------|
| **Architecture** | BiLSTM (2 layers) | Transformer (12/24 layers) |
| **Context** | Left + Right (separate) | Bidirectional (joint) |
| **Pre-training** | Language modeling | Masked LM + Next Sentence |
| **Parameters** | 94M | 110M (base) / 340M (large) |
| **Output dim** | 1024 | 768 (base) / 1024 (large) |
| **Fine-tuning** | Feature extraction only | Full model fine-tuning |

> We will cover BERT in detail in a dedicated lesson.

---

## Impact on NLP Benchmarks

Contextual embeddings dramatically improved performance across NLP tasks:

| Task | Before ELMo | After ELMo | After BERT |
|------|-------------|------------|------------|
| **SQuAD 1.1** (QA) | 73.7 F1 | 85.8 F1 | 93.2 F1 |
| **SST-2** (Sentiment) | 90.4% | 93.5% | 94.9% |
| **CoNLL 2003** (NER) | 90.2 F1 | 92.2 F1 | 92.8 F1 |
| **MNLI** (Inference) | 72.4% | 76.4% | 86.7% |

---

## Demonstrating Context Dependence

```python
import torch
from transformers import AutoTokenizer, AutoModel
import numpy as np

def demonstrate_contextual_embeddings():
    """Show how the same word gets different vectors in different contexts."""

    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    model = AutoModel.from_pretrained("bert-base-uncased")
    model.eval()

    # Words with multiple meanings
    test_cases = {
        "apple": [
            "I ate a delicious apple for lunch",
            "Apple released a new iPhone yesterday",
            "The apple tree in our garden bloomed early",
        ],
        "spring": [
            "The flowers bloom in spring every year",
            "The spring in my mattress broke last night",
            "A natural spring provides fresh water to the village",
        ],
        "bat": [
            "The baseball player swung the bat hard",
            "A bat flew out of the cave at dusk",
            "She grabbed the cricket bat and headed to practice",
        ],
    }

    for word, sentences in test_cases.items():
        print(f"\n{'='*60}")
        print(f"Word: '{word}'")
        print(f"{'='*60}")

        vectors = []
        for sent in sentences:
            inputs = tokenizer(sent, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)

            # Find the word's token
            tokens = tokenizer.tokenize(sent)
            word_idx = None
            for i, tok in enumerate(tokens):
                if tok == word:
                    word_idx = i + 1  # +1 for [CLS]
                    break

            if word_idx is not None:
                vec = outputs.last_hidden_state[0, word_idx, :].numpy()
                vectors.append(vec)
                print(f"  Context: '{sent}'")

        # Compare all pairs
        if len(vectors) >= 2:
            print(f"\n  Pairwise cosine similarities:")
            for i in range(len(vectors)):
                for j in range(i + 1, len(vectors)):
                    sim = np.dot(vectors[i], vectors[j]) / (
                        np.linalg.norm(vectors[i]) * np.linalg.norm(vectors[j])
                    )
                    print(f"    Sentence {i+1} vs {j+1}: {sim:.4f}")

demonstrate_contextual_embeddings()
```

---

## Using Contextual Embeddings in Practice

### Method 1: Feature Extraction

Use the pre-trained model as a fixed feature extractor:

```python
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np

class ContextualEmbedder:
    """Extract contextual embeddings from a pre-trained model."""

    def __init__(self, model_name="bert-base-uncased"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.model.eval()

    def get_sentence_embedding(self, sentence, pooling="mean"):
        """Get a single vector for the whole sentence."""
        inputs = self.tokenizer(
            sentence, return_tensors="pt",
            padding=True, truncation=True, max_length=512
        )

        with torch.no_grad():
            outputs = self.model(**inputs)

        hidden = outputs.last_hidden_state  # (1, seq_len, hidden_dim)
        attention_mask = inputs["attention_mask"]

        if pooling == "mean":
            # Mean pooling (exclude padding tokens)
            mask = attention_mask.unsqueeze(-1).float()
            summed = (hidden * mask).sum(dim=1)
            counts = mask.sum(dim=1)
            return (summed / counts).squeeze().numpy()
        elif pooling == "cls":
            # Use [CLS] token representation
            return hidden[0, 0, :].numpy()
        elif pooling == "max":
            # Max pooling
            hidden[inputs["attention_mask"] == 0] = -1e9
            return hidden.max(dim=1).values.squeeze().numpy()

    def get_word_embeddings(self, sentence):
        """Get contextual embeddings for each word."""
        inputs = self.tokenizer(sentence, return_tensors="pt")
        tokens = self.tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])

        with torch.no_grad():
            outputs = self.model(**inputs)

        hidden = outputs.last_hidden_state[0]  # (seq_len, hidden_dim)

        word_embeddings = {}
        for i, token in enumerate(tokens):
            if token not in ["[CLS]", "[SEP]", "[PAD]"]:
                word_embeddings[token] = hidden[i].numpy()

        return word_embeddings

# Usage
embedder = ContextualEmbedder("bert-base-uncased")

# Sentence embedding
sent_vec = embedder.get_sentence_embedding("Machine learning is fascinating")
print(f"Sentence vector shape: {sent_vec.shape}")

# Word embeddings
word_vecs = embedder.get_word_embeddings("The bank by the river was steep")
print("\nWord embeddings:")
for word, vec in word_vecs.items():
    print(f"  {word}: shape={vec.shape}, norm={np.linalg.norm(vec):.2f}")
```

### Method 2: Fine-tuning (Preview)

Adapt the full model to your specific task:

```python
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from transformers import Trainer, TrainingArguments

# Load model for classification
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=3,  # Number of classes
)

# The model now uses contextual embeddings internally
# and learns to classify text end-to-end

# We'll cover fine-tuning in detail in the BERT lesson
```

---

## Visualizing Context Effects

```python
import torch
import numpy as np
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModel
from sklearn.decomposition import PCA

def visualize_contextual_vs_position(model_name="bert-base-uncased"):
    """Visualize how context changes word representations."""
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    model.eval()

    # Same word "light" in different contexts
    sentences = [
        "Turn on the light in the room",        # illumination
        "The bag was very light to carry",       # weight
        "She has light blonde hair",             # color shade
        "Light travels at 300000 km per second", # physics
        "He took a light approach to the problem", # not serious
    ]

    vectors = []
    labels = []

    for sent in sentences:
        inputs = tokenizer(sent, return_tensors="pt")
        tokens = tokenizer.tokenize(sent)

        with torch.no_grad():
            outputs = model(**inputs)

        # Find "light"
        for i, tok in enumerate(tokens):
            if tok == "light":
                vec = outputs.last_hidden_state[0, i + 1, :].numpy()
                vectors.append(vec)
                labels.append(sent[:40])
                break

    # Reduce to 2D with PCA
    vectors_array = np.array(vectors)
    pca = PCA(n_components=2)
    reduced = pca.fit_transform(vectors_array)

    # Plot
    plt.figure(figsize=(10, 8))
    for i, (x, y) in enumerate(reduced):
        plt.scatter(x, y, s=100, zorder=5)
        plt.annotate(
            labels[i], (x, y),
            fontsize=9, ha="center", va="bottom",
            xytext=(0, 10), textcoords="offset points"
        )

    plt.title("Contextual Embeddings of 'light' in Different Contexts")
    plt.xlabel(f"PC1 ({pca.explained_variance_ratio_[0]:.1%} variance)")
    plt.ylabel(f"PC2 ({pca.explained_variance_ratio_[1]:.1%} variance)")
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()

visualize_contextual_vs_position()
```

---

## The Evolution of Word Representations

```
1950s-2000s: One-hot vectors (sparse, no semantics)
     ↓
2003: Neural LM (Bengio) — first dense word vectors
     ↓
2013: Word2Vec (Mikolov) — efficient static embeddings
     ↓
2014: GloVe (Pennington) — global statistics + local context
     ↓
2016: FastText (Bojanowski) — subword embeddings
     ↓
2018: ELMo (Peters) — first contextual embeddings (BiLSTM)
     ↓
2018: BERT (Devlin) — transformer-based contextual embeddings
     ↓
2019+: GPT-2, RoBERTa, XLNet, T5, GPT-3, ...
```

---

## Key Takeaways

1. **Static embeddings** give one vector per word — they cannot distinguish between different meanings
2. **Contextual embeddings** produce different vectors for the same word based on surrounding context
3. **ELMo** uses bidirectional LSTMs; different layers capture syntax vs semantics
4. **BERT** uses transformers and produces superior contextual representations
5. Contextual embeddings led to **massive improvements** across all NLP benchmarks
6. They can be used via **feature extraction** (freeze model) or **fine-tuning** (adapt model)

---

## Try It Yourself

1. Pick a polysemous word (e.g., "crane", "bass", "cell") and extract its embeddings in different contexts
2. Compare cosine similarity of the same word across different meanings
3. Visualize how contextual vectors cluster by meaning using PCA or t-SNE
4. Compare BERT embeddings with GloVe embeddings for polysemous words
5. Experiment with different layers — do earlier layers capture different information?
