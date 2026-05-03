---
title: Self-Attention & Multi-Head Attention
---

# Self-Attention & Multi-Head Attention

In this lesson, you will explore self-attention in depth — the mechanism that allows every token in a sequence to directly communicate with every other token. You'll implement it from scratch and understand why multi-head attention is so powerful.

---

## What Is Self-Attention?

In self-attention, the **query**, **key**, and **value** all come from the **same sequence**. Every token asks: "Which other tokens in this sequence are relevant to me?"

```
Input: "The cat sat on the mat"

For the word "sat":
  Query: What am I looking for?
  Keys:  What does each word offer?
  → "sat" attends strongly to "cat" (subject) and "mat" (object)
```

Unlike cross-attention (where the decoder attends to the encoder), self-attention is **intra-sequence** — the sequence attends to itself.

---

## Computing Q, K, V from Input

Given an input matrix $X \in \mathbb{R}^{n \times d_{model}}$ (where $n$ is the sequence length):

$$Q = XW^Q, \quad K = XW^K, \quad V = XW^V$$

Where:
- $W^Q \in \mathbb{R}^{d_{model} \times d_k}$
- $W^K \in \mathbb{R}^{d_{model} \times d_k}$
- $W^V \in \mathbb{R}^{d_{model} \times d_v}$

Each token gets its own query, key, and value vector:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


class SelfAttention(nn.Module):
    """Single-head self-attention."""

    def __init__(self, d_model, d_k):
        super().__init__()
        self.d_k = d_k
        self.W_q = nn.Linear(d_model, d_k, bias=False)
        self.W_k = nn.Linear(d_model, d_k, bias=False)
        self.W_v = nn.Linear(d_model, d_k, bias=False)

    def forward(self, x, mask=None):
        """
        Args:
            x: (batch, seq_len, d_model)
            mask: optional (batch, 1, seq_len) or (batch, seq_len, seq_len)
        Returns:
            output: (batch, seq_len, d_k)
            weights: (batch, seq_len, seq_len)
        """
        Q = self.W_q(x)  # (batch, seq_len, d_k)
        K = self.W_k(x)  # (batch, seq_len, d_k)
        V = self.W_v(x)  # (batch, seq_len, d_k)

        # Compute attention scores
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        # scores: (batch, seq_len, seq_len)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        # Attention weights
        weights = F.softmax(scores, dim=-1)

        # Weighted sum of values
        output = torch.matmul(weights, V)

        return output, weights
```

---

## Scaled Dot-Product: Why Divide by $\sqrt{d_k}$?

The raw dot product $QK^T$ grows with dimension $d_k$. If $Q$ and $K$ have entries with mean 0 and variance 1, then each dot product has:
- Mean: 0
- Variance: $d_k$

For $d_k = 64$, the dot products have standard deviation $\sqrt{64} = 8$. Softmax on values with such large magnitude produces nearly one-hot outputs — very sharp distributions with vanishing gradients.

Dividing by $\sqrt{d_k}$ normalizes the variance back to 1:

$$\text{Var}\left(\frac{q \cdot k}{\sqrt{d_k}}\right) = \frac{d_k}{d_k} = 1$$

```python
# Demonstration of the scaling effect
d_k = 64
q = torch.randn(1, 10, d_k)
k = torch.randn(1, 10, d_k)

# Without scaling — large magnitudes
raw_scores = torch.matmul(q, k.transpose(-2, -1))
print(f"Raw scores std: {raw_scores.std():.2f}")  # ~8.0

# With scaling — unit variance
scaled_scores = raw_scores / math.sqrt(d_k)
print(f"Scaled scores std: {scaled_scores.std():.2f}")  # ~1.0

# Softmax comparison
raw_weights = F.softmax(raw_scores, dim=-1)
scaled_weights = F.softmax(scaled_scores, dim=-1)

print(f"Raw softmax entropy: {-(raw_weights * raw_weights.log()).sum(-1).mean():.3f}")
print(f"Scaled softmax entropy: {-(scaled_weights * scaled_weights.log()).sum(-1).mean():.3f}")
# Scaled has higher entropy → smoother, better gradients
```

---

## Multi-Head Attention in Detail

Multi-head attention splits the model dimension into $h$ independent heads:

$$\text{MultiHead}(Q, K, V) = \text{Concat}(head_1, \ldots, head_h)W^O$$

$$head_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

With $d_{model} = 512$ and $h = 8$:
- Each head operates on $d_k = d_{model} / h = 64$ dimensions
- Total parameters ≈ same as single-head with full $d_{model}$

### Why Multiple Heads?

Each head can learn different attention patterns:

| Head | What It Might Learn |
|------|-------------------|
| Head 1 | Syntactic relationships (subject-verb) |
| Head 2 | Positional proximity (adjacent words) |
| Head 3 | Semantic similarity |
| Head 4 | Coreference (pronouns → nouns) |

```python
class MultiHeadSelfAttention(nn.Module):
    """Multi-Head Self-Attention from scratch."""

    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        # Combined projection for efficiency
        self.W_qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)

    def forward(self, x, mask=None):
        """
        Args:
            x: (batch, seq_len, d_model)
            mask: optional attention mask
        Returns:
            output: (batch, seq_len, d_model)
            weights: (batch, num_heads, seq_len, seq_len)
        """
        batch_size, seq_len, _ = x.shape

        # Project Q, K, V in one shot
        qkv = self.W_qkv(x)  # (batch, seq_len, 3 * d_model)
        qkv = qkv.reshape(batch_size, seq_len, 3, self.num_heads, self.d_k)
        qkv = qkv.permute(2, 0, 3, 1, 4)
        Q, K, V = qkv[0], qkv[1], qkv[2]
        # Each: (batch, num_heads, seq_len, d_k)

        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)

        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        weights = F.softmax(scores, dim=-1)
        attn_output = torch.matmul(weights, V)
        # attn_output: (batch, num_heads, seq_len, d_k)

        # Concatenate heads
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.reshape(batch_size, seq_len, self.d_model)

        # Output projection
        output = self.W_o(attn_output)

        return output, weights
```

---

## Comparing Single-Head vs Multi-Head

```python
# Setup
batch_size = 2
seq_len = 10
d_model = 512
num_heads = 8

x = torch.randn(batch_size, seq_len, d_model)

# Single-head attention (full dimension)
single_head = SelfAttention(d_model, d_model)
single_output, single_weights = single_head(x)
print(f"Single-head output: {single_output.shape}")
print(f"Single-head weights: {single_weights.shape}")
# weights: (2, 10, 10) — one attention pattern

# Multi-head attention
multi_head = MultiHeadSelfAttention(d_model, num_heads)
multi_output, multi_weights = multi_head(x)
print(f"Multi-head output: {multi_output.shape}")
print(f"Multi-head weights: {multi_weights.shape}")
# weights: (2, 8, 10, 10) — eight attention patterns!

# Parameter comparison
single_params = sum(p.numel() for p in single_head.parameters())
multi_params = sum(p.numel() for p in multi_head.parameters())
print(f"Single-head params: {single_params:,}")
print(f"Multi-head params: {multi_params:,}")
```

---

## Masked Self-Attention (Decoder)

In the decoder, each position can only attend to itself and earlier positions. This prevents "cheating" by looking at future tokens during training.

```python
def create_causal_mask(seq_len):
    """Create lower-triangular causal mask."""
    mask = torch.tril(torch.ones(seq_len, seq_len))
    return mask.unsqueeze(0).unsqueeze(0)  # (1, 1, seq_len, seq_len)


# Demonstrate masked attention
seq_len = 6
x = torch.randn(1, seq_len, 512)

# Create causal mask
causal_mask = create_causal_mask(seq_len)
print("Causal mask:")
print(causal_mask.squeeze())
# [[1, 0, 0, 0, 0, 0],
#  [1, 1, 0, 0, 0, 0],
#  [1, 1, 1, 0, 0, 0],
#  [1, 1, 1, 1, 0, 0],
#  [1, 1, 1, 1, 1, 0],
#  [1, 1, 1, 1, 1, 1]]

# Apply masked self-attention
masked_attention = MultiHeadSelfAttention(512, 8)
output, weights = masked_attention(x, mask=causal_mask)

# Verify: position 0 only attends to itself
print(f"Position 0 weights sum: {weights[0, 0, 0, :].sum():.4f}")
print(f"Position 0 attends to future: {weights[0, 0, 0, 1:].sum():.4f}")
# Should be 0.0 — no attention to future positions
```

---

## Cross-Attention (Encoder-Decoder)

In cross-attention, the **query** comes from the decoder, while **key** and **value** come from the encoder:

```python
class CrossAttention(nn.Module):
    """Cross-attention: decoder queries attend to encoder keys/values."""

    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0

        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model, bias=False)
        self.W_k = nn.Linear(d_model, d_model, bias=False)
        self.W_v = nn.Linear(d_model, d_model, bias=False)
        self.W_o = nn.Linear(d_model, d_model, bias=False)

    def forward(self, decoder_state, encoder_output, mask=None):
        """
        Args:
            decoder_state: (batch, tgt_len, d_model) — provides Q
            encoder_output: (batch, src_len, d_model) — provides K, V
        Returns:
            output: (batch, tgt_len, d_model)
            weights: (batch, num_heads, tgt_len, src_len)
        """
        batch_size = decoder_state.size(0)
        tgt_len = decoder_state.size(1)
        src_len = encoder_output.size(1)

        # Queries from decoder, keys/values from encoder
        Q = self.W_q(decoder_state)
        K = self.W_k(encoder_output)
        V = self.W_v(encoder_output)

        # Reshape for multi-head
        Q = Q.view(batch_size, tgt_len, self.num_heads, self.d_k).transpose(1, 2)
        K = K.view(batch_size, src_len, self.num_heads, self.d_k).transpose(1, 2)
        V = V.view(batch_size, src_len, self.num_heads, self.d_k).transpose(1, 2)

        # Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        weights = F.softmax(scores, dim=-1)
        attn_output = torch.matmul(weights, V)

        # Reshape and project
        attn_output = attn_output.transpose(1, 2).contiguous()
        attn_output = attn_output.reshape(batch_size, tgt_len, self.d_model)
        output = self.W_o(attn_output)

        return output, weights


# Example usage
encoder_output = torch.randn(2, 20, 512)  # Source: 20 tokens
decoder_state = torch.randn(2, 10, 512)   # Target: 10 tokens

cross_attn = CrossAttention(512, 8)
output, weights = cross_attn(decoder_state, encoder_output)
print(f"Cross-attention output: {output.shape}")
# (2, 10, 512) — each decoder position gets info from encoder
print(f"Cross-attention weights: {weights.shape}")
# (2, 8, 10, 20) — each of 10 target positions attends to 20 source positions
```

---

## Computational Complexity

Self-attention has complexity $O(n^2 d)$ where:
- $n$ = sequence length
- $d$ = model dimension

| Operation | Complexity | Why |
|-----------|-----------|-----|
| $QK^T$ computation | $O(n^2 d)$ | Matrix multiply: $(n \times d) \cdot (d \times n)$ |
| Softmax | $O(n^2)$ | Over each row of $n \times n$ matrix |
| Weighted sum | $O(n^2 d)$ | Weights $(n \times n)$ times $V$ $(n \times d)$ |
| **Total** | **$O(n^2 d)$** | Dominated by matrix multiplications |

**Memory:** $O(n^2)$ to store the attention weight matrix.

This quadratic scaling is why Transformers struggle with very long sequences (e.g., $n > 4096$).

```python
# Demonstrate quadratic scaling
import time

d_model = 512
num_heads = 8
attention = MultiHeadSelfAttention(d_model, num_heads)

for seq_len in [64, 128, 256, 512, 1024]:
    x = torch.randn(1, seq_len, d_model)
    start = time.time()
    with torch.no_grad():
        _ = attention(x)
    elapsed = time.time() - start
    print(f"Seq len {seq_len:>5}: {elapsed*1000:.2f} ms")
# Time roughly quadruples when sequence length doubles
```

---

## Attention Patterns Visualization

```python
import matplotlib.pyplot as plt
import numpy as np


def visualize_attention_heads(weights, tokens, num_heads_to_show=4):
    """
    Visualize attention patterns across multiple heads.

    Args:
        weights: (num_heads, seq_len, seq_len) tensor
        tokens: list of token strings
        num_heads_to_show: how many heads to display
    """
    fig, axes = plt.subplots(1, num_heads_to_show, figsize=(4 * num_heads_to_show, 4))

    for i in range(num_heads_to_show):
        ax = axes[i]
        head_weights = weights[i].detach().numpy()

        im = ax.imshow(head_weights, cmap="Blues", vmin=0, vmax=1)
        ax.set_xticks(range(len(tokens)))
        ax.set_yticks(range(len(tokens)))
        ax.set_xticklabels(tokens, rotation=45, ha="right", fontsize=8)
        ax.set_yticklabels(tokens, fontsize=8)
        ax.set_title(f"Head {i + 1}")

    plt.tight_layout()
    plt.savefig("attention_heads.png", dpi=150)
    plt.show()


# Example:
# tokens = ["The", "cat", "sat", "on", "the", "mat"]
# x = embed(tokenize(tokens))  # (1, 6, 512)
# _, weights = multi_head(x)   # weights: (1, 8, 6, 6)
# visualize_attention_heads(weights[0], tokens, num_heads_to_show=4)
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Self-attention | Every token attends to every other in the same sequence |
| Q, K, V | $Q = XW^Q$, $K = XW^K$, $V = XW^V$ |
| Scaling | Divide by $\sqrt{d_k}$ to prevent gradient vanishing |
| Multi-head | $h$ independent attention heads capture different patterns |
| Masked attention | Causal mask prevents future token access |
| Cross-attention | Decoder queries attend to encoder keys/values |
| Complexity | $O(n^2 d)$ — quadratic in sequence length |

---

## Exercises

1. Implement single-head self-attention from scratch and verify that output shape equals input shape
2. Compare attention weight entropy between single-head and multi-head — which produces more diverse patterns?
3. Implement masked self-attention and verify that future positions receive zero attention weight
4. Measure wall-clock time for self-attention with sequence lengths 128, 256, 512, 1024 — verify the quadratic scaling
5. Implement cross-attention and test with different source/target lengths

---

In the next lesson, you will learn about **Positional Encoding** — how Transformers understand the order of tokens without any recurrence.
