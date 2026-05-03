---
title: The Transformer Architecture
---

# The Transformer Architecture

In this lesson, you will learn about the **Transformer** — the architecture that revolutionized NLP and all of deep learning. Introduced in the paper "Attention Is All You Need" (Vaswani et al., 2017), transformers eliminated recurrence entirely and became the foundation for GPT, BERT, and virtually all modern language models.

---

## Why Transformers?

RNNs (including LSTMs and GRUs) have fundamental limitations:

| Problem | RNNs | Transformers |
|---|---|---|
| Sequential processing | Must process tokens one by one | Process all tokens in parallel |
| Long-range dependencies | Difficult despite gates | Direct connections via attention |
| Training speed | Slow (no parallelism) | Fast (fully parallelizable) |
| Scalability | Limited by sequence length | Scales to billions of parameters |

The transformer processes the **entire sequence at once**, making it dramatically faster to train on modern GPUs.

---

## Architecture Overview

The transformer has an **encoder-decoder** structure:

```
┌─────────────────────────────────────────────────────────┐
│                    TRANSFORMER                          │
│                                                         │
│  ┌─────────────┐          ┌─────────────────────────┐  │
│  │   ENCODER   │          │        DECODER          │  │
│  │             │          │                         │  │
│  │ ┌─────────┐ │   ┌──►  │ ┌─────────────────────┐ │  │
│  │ │Self-Attn│ │   │      │ │ Masked Self-Attn    │ │  │
│  │ ├─────────┤ │   │      │ ├─────────────────────┤ │  │
│  │ │Feed-Fwd │ │   │      │ │ Cross-Attention     │◄├──┤
│  │ └─────────┘ │   │      │ ├─────────────────────┤ │  │
│  │     × N     │───┘      │ │ Feed-Forward        │ │  │
│  └─────────────┘          │ └─────────────────────┘ │  │
│                           │          × N            │  │
│                           └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

Key components:
1. **Multi-head self-attention**
2. **Position-wise feed-forward networks**
3. **Layer normalization**
4. **Residual connections**
5. **Positional encoding**

---

## Self-Attention: Query, Key, Value

Self-attention lets each token "look at" every other token in the sequence to understand context.

### The QKV Framework

Each input token is projected into three vectors:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What information do I provide?"

### Scaled Dot-Product Attention

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Where:
- $QK^T$: similarity between all query-key pairs
- $\sqrt{d_k}$: scaling factor to prevent large dot products
- softmax: convert scores to probabilities
- Multiply by $V$: weighted combination of values

### Step by Step

```
Input: "The cat sat"

1. Embed each token → [e_1, e_2, e_3]

2. Project to Q, K, V:
   Q = X · W_Q    (What am I looking for?)
   K = X · W_K    (What do I contain?)
   V = X · W_V    (What info do I provide?)

3. Compute attention scores:
   scores = Q · K^T / √d_k

4. Apply softmax → attention weights

5. Weighted sum of values:
   output = weights · V
```

### Why Scale by $\sqrt{d_k}$?

For large $d_k$, the dot products grow large in magnitude, pushing softmax into regions with extremely small gradients. Dividing by $\sqrt{d_k}$ keeps the values in a good range.

---

## Multi-Head Attention

Instead of one attention function, transformers use **multiple attention heads in parallel**:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)W^O$$

Where each head is:

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

### Why Multiple Heads?

Each head can learn to attend to **different types of relationships**:

| Head | What It Might Learn |
|---|---|
| Head 1 | Subject-verb agreement |
| Head 2 | Adjective-noun pairs |
| Head 3 | Prepositional phrase attachment |
| Head 4 | Coreference (pronouns → nouns) |

The original transformer uses **8 heads** with $d_k = d_v = d_{model}/h = 64$.

---

## Positional Encoding

Self-attention treats the input as a **set** — it has no notion of order! "The cat sat on the mat" and "mat the on sat cat the" would look identical without positional information.

### Sinusoidal Positional Encoding

The original transformer adds position information using sine and cosine functions:

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

Where:
- $pos$: position in the sequence (0, 1, 2, ...)
- $i$: dimension index
- $d_{model}$: model dimension (e.g., 512)

### Why Sinusoidal?

- Each position gets a **unique** encoding
- The model can learn to attend to **relative positions** (since $PE_{pos+k}$ can be expressed as a linear function of $PE_{pos}$)
- Generalizes to sequence lengths not seen during training

### Adding Positional Info

The positional encoding is simply **added** to the token embeddings:

$$\text{input} = \text{token\_embedding} + \text{positional\_encoding}$$

---

## Feed-Forward Network

After attention, each position passes through the same feed-forward network independently:

$$\text{FFN}(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2$$

- Inner dimension is typically $4 \times d_{model}$ (e.g., 2048 for $d_{model} = 512$)
- Applied to each position **independently** (same weights, different inputs)
- Adds non-linearity and capacity

---

## Layer Normalization & Residual Connections

Each sub-layer (attention or FFN) is wrapped with:

$$\text{output} = \text{LayerNorm}(x + \text{SubLayer}(x))$$

### Residual Connections

Allow gradients to flow directly through the network:

```
x ──────────────────────► (+) ──► output
│                          ▲
└──► [Sub-Layer] ──────────┘
```

### Layer Normalization

Normalizes across the feature dimension (not the batch):

$$\text{LayerNorm}(x) = \frac{x - \mu}{\sigma + \epsilon} \cdot \gamma + \beta$$

This stabilizes training and allows deeper networks.

---

## Encoder-Decoder Transformer

### Encoder

Each encoder layer has:
1. Multi-head **self-attention** (each token attends to all tokens)
2. Feed-forward network
3. Residual connections + layer norm around each

The original paper uses **N = 6** identical encoder layers.

### Decoder

Each decoder layer has:
1. **Masked** multi-head self-attention (can only attend to previous positions)
2. Multi-head **cross-attention** (attends to encoder output)
3. Feed-forward network
4. Residual connections + layer norm around each

### Why Masked Self-Attention?

During generation, the decoder should not "peek" at future tokens. The mask sets future positions to $-\infty$ before softmax, resulting in zero attention weight.

```
Mask for position 3 (can see positions 1-3):
[1, 1, 1, -∞, -∞, -∞]  → softmax → [0.3, 0.4, 0.3, 0, 0, 0]
```

---

## Transformer Configuration

The original "base" transformer:

| Hyperparameter | Value |
|---|---|
| $d_{model}$ (model dimension) | 512 |
| $d_{ff}$ (feed-forward dimension) | 2048 |
| $h$ (attention heads) | 8 |
| $d_k = d_v$ (head dimension) | 64 |
| $N$ (encoder/decoder layers) | 6 |
| Dropout | 0.1 |
| Parameters | ~65M |

---

## Code: Simplified Self-Attention + Hugging Face Demo

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import numpy as np


# --- Scaled Dot-Product Attention ---
class ScaledDotProductAttention(nn.Module):
    """Core attention mechanism: softmax(QK^T / sqrt(d_k)) V"""

    def __init__(self):
        super().__init__()

    def forward(self, Q, K, V, mask=None):
        """
        Args:
            Q: (batch, heads, seq_len, d_k)
            K: (batch, heads, seq_len, d_k)
            V: (batch, heads, seq_len, d_v)
            mask: optional mask for decoder
        Returns:
            output: (batch, heads, seq_len, d_v)
            weights: (batch, heads, seq_len, seq_len)
        """
        d_k = Q.size(-1)

        # Compute attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)

        # Apply mask (for decoder / padding)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        # Softmax → attention weights
        weights = F.softmax(scores, dim=-1)

        # Weighted sum of values
        output = torch.matmul(weights, V)

        return output, weights


# --- Multi-Head Attention ---
class MultiHeadAttention(nn.Module):
    """Multi-head attention with h parallel attention heads."""

    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        # Linear projections for Q, K, V
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

        self.attention = ScaledDotProductAttention()

    def forward(self, query, key, value, mask=None):
        batch_size = query.size(0)

        # Linear projections and reshape to (batch, heads, seq_len, d_k)
        Q = self.W_q(query).view(
            batch_size, -1, self.num_heads, self.d_k
        ).transpose(1, 2)
        K = self.W_k(key).view(
            batch_size, -1, self.num_heads, self.d_k
        ).transpose(1, 2)
        V = self.W_v(value).view(
            batch_size, -1, self.num_heads, self.d_k
        ).transpose(1, 2)

        # Apply attention
        attn_output, attn_weights = self.attention(Q, K, V, mask)

        # Concatenate heads and project
        attn_output = attn_output.transpose(1, 2).contiguous().view(
            batch_size, -1, self.d_model
        )
        output = self.W_o(attn_output)

        return output, attn_weights


# --- Positional Encoding ---
class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding."""

    def __init__(self, d_model, max_len=5000):
        super().__init__()

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float()
            * (-math.log(10000.0) / d_model)
        )

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)

        self.register_buffer("pe", pe)

    def forward(self, x):
        # x: (batch, seq_len, d_model)
        return x + self.pe[:, :x.size(1), :]


# --- Transformer Encoder Layer ---
class TransformerEncoderLayer(nn.Module):
    """Single transformer encoder layer."""

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()

        self.self_attention = MultiHeadAttention(d_model, num_heads)
        self.feed_forward = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.ReLU(),
            nn.Linear(d_ff, d_model)
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # Self-attention with residual + norm
        attn_output, attn_weights = self.self_attention(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))

        # Feed-forward with residual + norm
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))

        return x, attn_weights


# --- Simple Transformer Encoder ---
class SimpleTransformerEncoder(nn.Module):
    """Simplified transformer encoder for text classification."""

    def __init__(self, vocab_size, d_model=128, num_heads=4,
                 d_ff=512, num_layers=2, num_classes=2,
                 max_len=512, dropout=0.1):
        super().__init__()

        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model, max_len)
        self.dropout = nn.Dropout(dropout)

        self.layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])

        self.classifier = nn.Linear(d_model, num_classes)

    def forward(self, x, mask=None):
        # Embed + positional encoding
        x = self.embedding(x) * math.sqrt(self.embedding.embedding_dim)
        x = self.pos_encoding(x)
        x = self.dropout(x)

        # Pass through transformer layers
        all_weights = []
        for layer in self.layers:
            x, weights = layer(x, mask)
            all_weights.append(weights)

        # Classification: use mean pooling
        x = x.mean(dim=1)  # (batch, d_model)
        output = self.classifier(x)

        return output, all_weights


# --- Demo ---
def demo_transformer():
    """Demonstrate the transformer components."""
    torch.manual_seed(42)

    print("=" * 60)
    print("TRANSFORMER SELF-ATTENTION DEMO")
    print("=" * 60)

    # Parameters
    batch_size = 1
    seq_len = 6
    d_model = 64
    num_heads = 4

    # Simulate input embeddings
    x = torch.randn(batch_size, seq_len, d_model)

    # Multi-head attention
    mha = MultiHeadAttention(d_model, num_heads)
    output, weights = mha(x, x, x)  # Self-attention (Q=K=V=x)

    print(f"\nInput shape:  {x.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Attention weights shape: {weights.shape}")
    print(f"  (batch={batch_size}, heads={num_heads}, "
          f"seq={seq_len}, seq={seq_len})")

    # Show attention pattern for head 0
    print(f"\nHead 0 attention weights:")
    w = weights[0, 0].detach().numpy()
    tokens = ["The", "cat", "sat", "on", "the", "mat"]
    print("       " + "  ".join(f"{t:>5}" for t in tokens))
    for i, tok in enumerate(tokens):
        row = "  ".join(f"{w[i,j]:.2f}" for j in range(seq_len))
        print(f"{tok:>5}: {row}")

    # Positional encoding visualization
    print(f"\n--- Positional Encoding ---")
    pe = PositionalEncoding(d_model=16, max_len=100)
    pos_values = pe.pe[0, :8, :8].numpy()
    print(f"First 8 positions, first 8 dimensions:")
    print(f"{'pos':>4}", end="")
    for d in range(8):
        print(f"  dim{d:>2}", end="")
    print()
    for p in range(8):
        print(f"{p:>4}", end="")
        for d in range(8):
            print(f"  {pos_values[p,d]:>5.2f}", end="")
        print()

    # Full model demo
    print(f"\n--- Full Transformer Classifier ---")
    model = SimpleTransformerEncoder(
        vocab_size=1000, d_model=128, num_heads=4,
        d_ff=512, num_layers=2, num_classes=2
    )
    sample_input = torch.randint(0, 1000, (2, 20))  # batch=2, seq=20
    logits, attn_weights = model(sample_input)
    print(f"Input: batch=2, seq_len=20")
    print(f"Output logits: {logits.shape}")
    print(f"Params: {sum(p.numel() for p in model.parameters()):,}")

    return model


# --- Hugging Face Transformer Example ---
def huggingface_demo():
    """Using pre-trained transformers with Hugging Face."""
    print("\n" + "=" * 60)
    print("HUGGING FACE TRANSFORMER EXAMPLE")
    print("=" * 60)
    print("""
# Install: pip install transformers torch

from transformers import AutoTokenizer, AutoModel
import torch

# Load a pre-trained transformer
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

# Tokenize input
text = "The transformer architecture revolutionized NLP."
inputs = tokenizer(text, return_tensors="pt")

print(f"Tokens: {tokenizer.tokenize(text)}")
print(f"Input IDs: {inputs['input_ids']}")

# Get transformer outputs
with torch.no_grad():
    outputs = model(**inputs)

# outputs.last_hidden_state: (batch, seq_len, hidden_dim)
print(f"Output shape: {outputs.last_hidden_state.shape}")
print(f"Hidden dim: {outputs.last_hidden_state.shape[-1]}")

# Each token now has a context-aware representation!
# Token 0 ([CLS]) captures the whole sequence meaning
cls_embedding = outputs.last_hidden_state[0, 0, :]
print(f"[CLS] embedding shape: {cls_embedding.shape}")
""")


if __name__ == "__main__":
    model = demo_transformer()
    huggingface_demo()
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| No recurrence | Transformers process all tokens in parallel |
| Self-attention | Each token attends to all others via Q, K, V |
| Scaling | Divide by $\sqrt{d_k}$ to stabilize gradients |
| Multi-head | Multiple attention heads learn different relationships |
| Positional encoding | Sinusoidal functions add position information |
| Feed-forward | Applied independently to each position |
| Residual + LayerNorm | Enable deep networks with stable training |
| Masked attention | Decoder can't see future tokens |

---

## Next Steps

In the next lesson, you will learn about **BERT** — a transformer-based model that achieves state-of-the-art results on many NLP tasks through bidirectional pre-training and fine-tuning.
