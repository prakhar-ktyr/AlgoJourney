---
title: The Transformer Architecture
---

# The Transformer Architecture

In this lesson, you will learn about the Transformer — the architecture that revolutionized NLP and now dominates deep learning. Introduced in the landmark paper "Attention Is All You Need" (Vaswani et al., 2017), Transformers replaced recurrence entirely with attention.

---

## Why Replace RNNs?

RNNs have fundamental limitations:

| Problem | RNN | Transformer |
|---------|-----|-------------|
| Sequential processing | Must process tokens one by one | Processes all tokens in parallel |
| Long-range dependencies | Gradients vanish over distance | Direct attention connections |
| Training speed | Slow (sequential) | Fast (parallelizable) |
| Maximum path length | $O(n)$ | $O(1)$ |

The Transformer's key insight: **attention alone is sufficient** for capturing dependencies, without any recurrence or convolution.

---

## High-Level Architecture

The Transformer follows an encoder-decoder structure:

```
Input Tokens → [Encoder Stack] → Memory
                                     ↓
Output Tokens → [Decoder Stack] → Predictions
```

Each encoder layer has:
1. Multi-Head Self-Attention
2. Feed-Forward Network

Each decoder layer has:
1. Masked Multi-Head Self-Attention
2. Multi-Head Cross-Attention (over encoder output)
3. Feed-Forward Network

Both use **residual connections** and **layer normalization** around each sub-layer.

---

## Self-Attention: Query, Key, Value

Self-attention allows each position to attend to all other positions in the same sequence.

For each token, we compute three vectors:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What information do I provide?"

### The Attention Formula

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

Where:
- $Q \in \mathbb{R}^{n \times d_k}$ — queries
- $K \in \mathbb{R}^{n \times d_k}$ — keys
- $V \in \mathbb{R}^{n \times d_v}$ — values
- $d_k$ — dimension of keys (used for scaling)
- $n$ — sequence length

### Why Scale by $\sqrt{d_k}$?

Without scaling, when $d_k$ is large, the dot products $QK^T$ become very large in magnitude, pushing the softmax into regions with extremely small gradients. Dividing by $\sqrt{d_k}$ keeps the variance stable.

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    Compute scaled dot-product attention.

    Args:
        Q: (batch, heads, seq_len, d_k)
        K: (batch, heads, seq_len, d_k)
        V: (batch, heads, seq_len, d_v)
        mask: optional (batch, 1, 1, seq_len) or (batch, 1, seq_len, seq_len)
    Returns:
        output: (batch, heads, seq_len, d_v)
        weights: (batch, heads, seq_len, seq_len)
    """
    d_k = Q.size(-1)

    # Compute attention scores
    scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(d_k)
    # scores shape: (batch, heads, seq_len, seq_len)

    # Apply mask (optional)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))

    # Softmax to get attention weights
    weights = F.softmax(scores, dim=-1)

    # Weighted sum of values
    output = torch.matmul(weights, V)

    return output, weights
```

---

## Multi-Head Attention

Instead of performing a single attention function, Multi-Head Attention runs **h parallel attention heads**, each with different learned projections:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(head_1, \ldots, head_h)W^O$$

Where each head is:

$$head_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

**Why multiple heads?** Each head can learn to attend to different types of information — one might focus on syntax, another on semantics, another on proximity.

```python
class MultiHeadAttention(nn.Module):
    """Multi-Head Attention mechanism."""

    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        # Linear projections for Q, K, V
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)

        # Output projection
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, query, key, value, mask=None):
        """
        Args:
            query: (batch, seq_len, d_model)
            key: (batch, seq_len, d_model)
            value: (batch, seq_len, d_model)
            mask: optional attention mask
        Returns:
            output: (batch, seq_len, d_model)
            weights: (batch, num_heads, seq_len, seq_len)
        """
        batch_size = query.size(0)

        # 1. Linear projections → (batch, seq_len, d_model)
        Q = self.W_q(query)
        K = self.W_k(key)
        V = self.W_v(value)

        # 2. Split into heads → (batch, num_heads, seq_len, d_k)
        Q = Q.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)

        # 3. Apply scaled dot-product attention
        attn_output, weights = scaled_dot_product_attention(Q, K, V, mask)

        # 4. Concatenate heads → (batch, seq_len, d_model)
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.view(batch_size, -1, self.d_model)

        # 5. Final linear projection
        output = self.W_o(attn_output)

        return output, weights
```

---

## Position-wise Feed-Forward Network

After attention, each position is processed independently through a two-layer MLP:

$$\text{FFN}(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2$$

The inner dimension is typically 4× the model dimension (e.g., $d_{model}=512$, $d_{ff}=2048$).

```python
class FeedForward(nn.Module):
    """Position-wise Feed-Forward Network."""

    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
        self.relu = nn.ReLU()

    def forward(self, x):
        # x: (batch, seq_len, d_model)
        x = self.relu(self.linear1(x))
        x = self.dropout(x)
        x = self.linear2(x)
        return x
```

---

## Layer Normalization & Residual Connections

Each sub-layer (attention or FFN) is wrapped with:
1. A **residual connection** (add input to output)
2. **Layer normalization** (normalize across features)

$$\text{LayerNorm}(x + \text{SubLayer}(x))$$

```python
class TransformerEncoderLayer(nn.Module):
    """Single Transformer encoder layer."""

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.self_attention = MultiHeadAttention(d_model, num_heads)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        """
        Args:
            x: (batch, seq_len, d_model)
            mask: optional attention mask
        """
        # Self-attention with residual connection and layer norm
        attn_output, _ = self.self_attention(x, x, x, mask)
        x = self.norm1(x + self.dropout1(attn_output))

        # Feed-forward with residual connection and layer norm
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout2(ff_output))

        return x
```

---

## The Decoder Layer

The decoder has an extra cross-attention layer that attends to encoder outputs:

```python
class TransformerDecoderLayer(nn.Module):
    """Single Transformer decoder layer."""

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        # Masked self-attention (causal)
        self.self_attention = MultiHeadAttention(d_model, num_heads)
        # Cross-attention (attends to encoder output)
        self.cross_attention = MultiHeadAttention(d_model, num_heads)
        # Feed-forward
        self.feed_forward = FeedForward(d_model, d_ff, dropout)

        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.norm3 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        self.dropout3 = nn.Dropout(dropout)

    def forward(self, x, encoder_output, src_mask=None, tgt_mask=None):
        """
        Args:
            x: decoder input (batch, tgt_len, d_model)
            encoder_output: (batch, src_len, d_model)
            src_mask: mask for encoder output
            tgt_mask: causal mask for decoder
        """
        # 1. Masked self-attention
        attn_output, _ = self.self_attention(x, x, x, tgt_mask)
        x = self.norm1(x + self.dropout1(attn_output))

        # 2. Cross-attention over encoder output
        attn_output, _ = self.cross_attention(x, encoder_output, encoder_output, src_mask)
        x = self.norm2(x + self.dropout2(attn_output))

        # 3. Feed-forward
        ff_output = self.feed_forward(x)
        x = self.norm3(x + self.dropout3(ff_output))

        return x
```

---

## Causal Mask (for Decoder)

The decoder must not "see" future tokens. A causal mask blocks attention to positions that come later:

```python
def create_causal_mask(seq_len):
    """
    Create a causal (look-ahead) mask.
    Positions can only attend to earlier positions.
    """
    mask = torch.tril(torch.ones(seq_len, seq_len))
    # mask[i][j] = 1 if j <= i (can attend), 0 if j > i (blocked)
    return mask.unsqueeze(0).unsqueeze(0)  # (1, 1, seq_len, seq_len)


# Example for sequence length 5:
mask = create_causal_mask(5)
print(mask.squeeze())
# tensor([[1., 0., 0., 0., 0.],
#         [1., 1., 0., 0., 0.],
#         [1., 1., 1., 0., 0.],
#         [1., 1., 1., 1., 0.],
#         [1., 1., 1., 1., 1.]])
```

---

## Complete Transformer Model

```python
class Transformer(nn.Module):
    """Complete Transformer model."""

    def __init__(self, src_vocab_size, tgt_vocab_size, d_model=512,
                 num_heads=8, num_layers=6, d_ff=2048, dropout=0.1,
                 max_seq_len=5000):
        super().__init__()
        self.d_model = d_model

        # Embeddings
        self.src_embedding = nn.Embedding(src_vocab_size, d_model)
        self.tgt_embedding = nn.Embedding(tgt_vocab_size, d_model)

        # Positional encoding (covered in a later lesson)
        self.pos_encoding = PositionalEncoding(d_model, max_seq_len, dropout)

        # Encoder stack
        self.encoder_layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])

        # Decoder stack
        self.decoder_layers = nn.ModuleList([
            TransformerDecoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])

        # Output projection
        self.fc_out = nn.Linear(d_model, tgt_vocab_size)

    def encode(self, src, src_mask=None):
        x = self.src_embedding(src) * math.sqrt(self.d_model)
        x = self.pos_encoding(x)
        for layer in self.encoder_layers:
            x = layer(x, src_mask)
        return x

    def decode(self, tgt, encoder_output, src_mask=None, tgt_mask=None):
        x = self.tgt_embedding(tgt) * math.sqrt(self.d_model)
        x = self.pos_encoding(x)
        for layer in self.decoder_layers:
            x = layer(x, encoder_output, src_mask, tgt_mask)
        return x

    def forward(self, src, tgt, src_mask=None, tgt_mask=None):
        encoder_output = self.encode(src, src_mask)
        decoder_output = self.decode(tgt, encoder_output, src_mask, tgt_mask)
        output = self.fc_out(decoder_output)
        return output
```

---

## The Original Transformer Configuration

The paper "Attention Is All You Need" used these hyperparameters:

| Parameter | Value |
|-----------|-------|
| $d_{model}$ | 512 |
| $d_{ff}$ | 2048 |
| $h$ (heads) | 8 |
| $d_k = d_v$ | 64 |
| Layers | 6 (encoder) + 6 (decoder) |
| Dropout | 0.1 |
| Parameters | ~65M |

---

## Transformer vs. RNN: Summary

| Feature | RNN/LSTM | Transformer |
|---------|----------|-------------|
| Parallelization | No (sequential) | Yes (full) |
| Long-range deps | Difficult | Easy (direct attention) |
| Training speed | Slow | Fast |
| Memory | $O(1)$ per step | $O(n^2)$ for attention |
| Interpretability | Hidden state (opaque) | Attention weights (visible) |

---

## Summary

| Component | Purpose |
|-----------|---------|
| Self-Attention | Let each token attend to all others |
| Multi-Head | Learn multiple attention patterns |
| Feed-Forward | Process each position independently |
| Layer Norm + Residual | Stabilize training |
| Causal Mask | Prevent future token access in decoder |
| Encoder-Decoder | Encode input, decode output with cross-attention |

---

## Exercises

1. Implement the full `MultiHeadAttention` module and verify output shapes
2. Build a 2-layer Transformer encoder and pass a random input through it
3. Create a causal mask and verify that it blocks future positions correctly
4. Count the total parameters of a Transformer with the original configuration ($d_{model}=512$, 6 layers, 8 heads)

---

In the next lesson, you will dive deeper into **Self-Attention & Multi-Head Attention** — understanding exactly how tokens communicate with each other.
