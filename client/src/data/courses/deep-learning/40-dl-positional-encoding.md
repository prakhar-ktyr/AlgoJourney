---
title: Positional Encoding
---

# Positional Encoding

In this lesson, you will learn how Transformers understand word order. Unlike RNNs that process tokens sequentially, Transformers see all tokens simultaneously — they need an explicit signal to know where each token is in the sequence.

---

## The Problem: No Sense of Order

Self-attention is **permutation-equivariant**. If you shuffle the input tokens, the attention computation doesn't change (except the output is shuffled the same way). This means:

```
"The cat sat on the mat"  →  Same attention scores as
"mat the on sat cat The"
```

Without positional information, the Transformer treats the input as a **bag of words** — word order is completely lost.

**Solution:** Add positional encodings to the input embeddings:

$$\text{Input} = \text{TokenEmbedding}(x) + \text{PositionalEncoding}(pos)$$

---

## Sinusoidal Positional Encoding

The original Transformer paper uses fixed sinusoidal functions:

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

Where:
- $pos$ = position in the sequence (0, 1, 2, ...)
- $i$ = dimension index (0, 1, 2, ..., $d_{model}/2 - 1$)
- $d_{model}$ = model dimension

Each dimension uses a sinusoid with a different frequency — from high frequency (short wavelength) for small $i$ to low frequency (long wavelength) for large $i$.

```python
import torch
import torch.nn as nn
import math
import matplotlib.pyplot as plt
import numpy as np


class SinusoidalPositionalEncoding(nn.Module):
    """Fixed sinusoidal positional encoding from 'Attention Is All You Need'."""

    def __init__(self, d_model, max_len=5000, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        # Create positional encoding matrix
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        # position: (max_len, 1)

        # Compute the division term: 10000^(2i/d_model)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        # div_term: (d_model/2,)

        # Apply sin to even indices, cos to odd indices
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)

        # Add batch dimension: (1, max_len, d_model)
        pe = pe.unsqueeze(0)

        # Register as buffer (not a parameter — no gradients)
        self.register_buffer("pe", pe)

    def forward(self, x):
        """
        Args:
            x: (batch, seq_len, d_model) — token embeddings
        Returns:
            (batch, seq_len, d_model) — embeddings + positional encoding
        """
        seq_len = x.size(1)
        x = x + self.pe[:, :seq_len, :]
        return self.dropout(x)
```

### Usage Example

```python
# Create positional encoding
d_model = 512
pe = SinusoidalPositionalEncoding(d_model, max_len=1000)

# Simulate token embeddings
batch_size = 2
seq_len = 50
token_embeddings = torch.randn(batch_size, seq_len, d_model)

# Add positional encoding
output = pe(token_embeddings)
print(f"Input shape: {token_embeddings.shape}")
print(f"Output shape: {output.shape}")
# Both: torch.Size([2, 50, 512])
```

---

## Why Sinusoidal Works

The sinusoidal encoding has two key properties:

### 1. Unique Position Representation

Each position gets a unique vector. No two positions share the same encoding.

### 2. Relative Position Through Linear Transformation

For any fixed offset $k$, there exists a linear transformation that maps $PE_{pos}$ to $PE_{pos+k}$:

$$PE_{pos+k} = T_k \cdot PE_{pos}$$

This is because:

$$\sin(pos + k) = \sin(pos)\cos(k) + \cos(pos)\sin(k)$$
$$\cos(pos + k) = \cos(pos)\cos(k) - \sin(pos)\sin(k)$$

This means the model can easily learn to attend to relative positions — "the word 3 positions before me."

```python
# Demonstrate: relative positions are linearly related
pe_layer = SinusoidalPositionalEncoding(64, max_len=100, dropout=0.0)
pe_matrix = pe_layer.pe.squeeze(0)  # (100, 64)

# Compute dot products between position pairs
pos_a = 10
pos_b = 15  # offset = 5

# Dot product between positions at same offset should be similar
dot_same_offset = []
for start in range(0, 50):
    dot = torch.dot(pe_matrix[start], pe_matrix[start + 5])
    dot_same_offset.append(dot.item())

print(f"Dot products (offset=5): mean={np.mean(dot_same_offset):.4f}, "
      f"std={np.std(dot_same_offset):.4f}")
# Very low standard deviation → consistent relative representation
```

---

## Visualizing Sinusoidal Encoding

```python
def visualize_positional_encoding(d_model=128, max_len=100):
    """Visualize the sinusoidal positional encoding patterns."""
    pe = torch.zeros(max_len, d_model)
    position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
    div_term = torch.exp(
        torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
    )
    pe[:, 0::2] = torch.sin(position * div_term)
    pe[:, 1::2] = torch.cos(position * div_term)

    fig, axes = plt.subplots(2, 1, figsize=(12, 8))

    # Heatmap of full encoding
    ax = axes[0]
    im = ax.imshow(pe.numpy().T, cmap="RdBu", aspect="auto",
                   vmin=-1, vmax=1)
    ax.set_xlabel("Position")
    ax.set_ylabel("Dimension")
    ax.set_title("Sinusoidal Positional Encoding")
    plt.colorbar(im, ax=ax)

    # Individual dimensions at different frequencies
    ax = axes[1]
    for dim in [0, 10, 20, 40, 60]:
        ax.plot(pe[:, dim].numpy(), label=f"dim {dim}")
    ax.set_xlabel("Position")
    ax.set_ylabel("Value")
    ax.set_title("Individual Dimensions (Different Frequencies)")
    ax.legend()
    ax.set_xlim(0, max_len)

    plt.tight_layout()
    plt.savefig("positional_encoding.png", dpi=150)
    plt.show()


visualize_positional_encoding()
```

When you visualize this:
- **Low dimensions** (small $i$): high frequency, rapidly alternating
- **High dimensions** (large $i$): low frequency, slowly changing
- Like a binary counter, but with smooth sinusoids instead of discrete bits

---

## Learned Positional Embeddings

An alternative: let the model **learn** position representations:

```python
class LearnedPositionalEncoding(nn.Module):
    """Learned positional embeddings (used in BERT, GPT-2)."""

    def __init__(self, d_model, max_len=512, dropout=0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        # Learnable position embeddings
        self.position_embedding = nn.Embedding(max_len, d_model)

        # Register position indices as a buffer
        positions = torch.arange(0, max_len)
        self.register_buffer("positions", positions)

    def forward(self, x):
        """
        Args:
            x: (batch, seq_len, d_model)
        Returns:
            (batch, seq_len, d_model)
        """
        seq_len = x.size(1)
        position_ids = self.positions[:seq_len]  # (seq_len,)
        pos_embeddings = self.position_embedding(position_ids)  # (seq_len, d_model)
        x = x + pos_embeddings.unsqueeze(0)  # broadcast over batch
        return self.dropout(x)
```

### Sinusoidal vs. Learned: Comparison

| Feature | Sinusoidal | Learned |
|---------|-----------|---------|
| Parameters | 0 (fixed) | $max\_len \times d_{model}$ |
| Generalization | Can extrapolate to unseen lengths | Limited to training lengths |
| Performance | Slightly worse on short sequences | Slightly better on short sequences |
| Used in | Original Transformer | BERT, GPT-2 |

```python
# Compare parameter counts
d_model = 512
max_len = 512

sinusoidal = SinusoidalPositionalEncoding(d_model, max_len)
learned = LearnedPositionalEncoding(d_model, max_len)

sin_params = sum(p.numel() for p in sinusoidal.parameters())
learn_params = sum(p.numel() for p in learned.parameters())

print(f"Sinusoidal parameters: {sin_params:,}")    # 0
print(f"Learned parameters: {learn_params:,}")      # 262,144
```

---

## Relative Position Encodings (Brief Overview)

Modern Transformers often use **relative** position encodings that directly encode the distance between tokens rather than absolute positions.

### Rotary Position Embedding (RoPE)

Used in LLaMA, PaLM, and many modern LLMs. RoPE encodes positions by rotating the query and key vectors:

$$f_q(x_m, m) = x_m e^{im\theta}$$
$$f_k(x_n, n) = x_n e^{in\theta}$$

The dot product then depends only on the relative position $(m - n)$:

$$f_q(x_m, m)^T f_k(x_n, n) \propto g(x_m, x_n, m - n)$$

```python
class RotaryPositionalEncoding(nn.Module):
    """Rotary Position Embedding (RoPE) — simplified version."""

    def __init__(self, d_model, max_len=2048, base=10000):
        super().__init__()
        # Compute rotation frequencies
        inv_freq = 1.0 / (base ** (torch.arange(0, d_model, 2).float() / d_model))
        self.register_buffer("inv_freq", inv_freq)

        # Precompute sin/cos
        positions = torch.arange(0, max_len, dtype=torch.float)
        freqs = torch.outer(positions, inv_freq)  # (max_len, d_model/2)
        self.register_buffer("cos_cached", freqs.cos())
        self.register_buffer("sin_cached", freqs.sin())

    def forward(self, q, k, seq_len):
        """
        Apply rotary embeddings to queries and keys.

        Args:
            q, k: (batch, heads, seq_len, d_k)
            seq_len: current sequence length
        """
        cos = self.cos_cached[:seq_len].unsqueeze(0).unsqueeze(0)
        sin = self.sin_cached[:seq_len].unsqueeze(0).unsqueeze(0)

        # Split into pairs and rotate
        q_rot = self._apply_rotation(q, cos, sin)
        k_rot = self._apply_rotation(k, cos, sin)

        return q_rot, k_rot

    def _apply_rotation(self, x, cos, sin):
        """Rotate pairs of dimensions."""
        # Split into even and odd
        x1 = x[..., 0::2]
        x2 = x[..., 1::2]

        # Apply rotation
        rotated = torch.cat([
            x1 * cos - x2 * sin,
            x1 * sin + x2 * cos,
        ], dim=-1)

        return rotated
```

### ALiBi (Attention with Linear Biases)

Used in BLOOM and other models. ALiBi adds a linear bias to attention scores based on distance:

$$\text{score}_{ij} = q_i^T k_j - m \cdot |i - j|$$

Where $m$ is a head-specific slope. No positional encoding is added to embeddings.

```python
def alibi_bias(num_heads, max_len):
    """
    Compute ALiBi attention biases.
    Each head gets a different slope for the distance penalty.
    """
    # Slopes: geometric sequence from 2^(-8/n) to 2^(-8)
    slopes = torch.tensor([
        2 ** (-8 * i / num_heads) for i in range(1, num_heads + 1)
    ])

    # Distance matrix: |i - j|
    positions = torch.arange(max_len)
    distances = (positions.unsqueeze(0) - positions.unsqueeze(1)).abs().float()
    # distances: (max_len, max_len)

    # Bias: -slope * distance for each head
    biases = -slopes.unsqueeze(1).unsqueeze(1) * distances.unsqueeze(0)
    # biases: (num_heads, max_len, max_len)

    return biases


# Example
biases = alibi_bias(num_heads=8, max_len=10)
print(f"ALiBi biases shape: {biases.shape}")
print(f"Head 0 bias (first row): {biases[0, 0, :5]}")
# Linearly increasing penalty with distance
```

---

## Comparing Position Encoding Methods

| Method | Type | Extrapolation | Used In |
|--------|------|--------------|---------|
| Sinusoidal | Absolute, fixed | Moderate | Original Transformer |
| Learned | Absolute, trained | Poor | BERT, GPT-2 |
| RoPE | Relative, rotation | Good | LLaMA, PaLM, Mistral |
| ALiBi | Relative, bias | Excellent | BLOOM, MPT |

---

## Complete Example: Transformer with Positional Encoding

```python
class TransformerWithPE(nn.Module):
    """Simple Transformer encoder with positional encoding."""

    def __init__(self, vocab_size, d_model=256, num_heads=4,
                 num_layers=4, d_ff=512, max_len=512, dropout=0.1,
                 pe_type="sinusoidal"):
        super().__init__()
        self.d_model = d_model
        self.embedding = nn.Embedding(vocab_size, d_model)

        # Choose positional encoding type
        if pe_type == "sinusoidal":
            self.pos_encoding = SinusoidalPositionalEncoding(d_model, max_len, dropout)
        elif pe_type == "learned":
            self.pos_encoding = LearnedPositionalEncoding(d_model, max_len, dropout)
        else:
            raise ValueError(f"Unknown PE type: {pe_type}")

        # Transformer encoder layers
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=num_heads,
            dim_feedforward=d_ff,
            dropout=dropout,
            batch_first=True,
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc_out = nn.Linear(d_model, vocab_size)

    def forward(self, x, mask=None):
        """
        Args:
            x: (batch, seq_len) — token IDs
        Returns:
            logits: (batch, seq_len, vocab_size)
        """
        # Scale embeddings (as in original paper)
        x = self.embedding(x) * math.sqrt(self.d_model)

        # Add positional encoding
        x = self.pos_encoding(x)

        # Pass through transformer encoder
        x = self.encoder(x, mask=mask)

        # Project to vocabulary
        logits = self.fc_out(x)
        return logits


# Example usage
vocab_size = 10000
model = TransformerWithPE(vocab_size, pe_type="sinusoidal")

# Random input: batch of 4 sequences, each 32 tokens
input_ids = torch.randint(0, vocab_size, (4, 32))
output = model(input_ids)
print(f"Output shape: {output.shape}")
# torch.Size([4, 32, 10000])
```

---

## Visualizing Position Similarity

```python
def plot_position_similarity(pe_matrix, title="Position Similarity"):
    """
    Plot cosine similarity between position encodings.
    Shows how positions relate to each other.
    """
    # Normalize
    norms = pe_matrix.norm(dim=1, keepdim=True)
    pe_normalized = pe_matrix / norms

    # Cosine similarity matrix
    similarity = torch.matmul(pe_normalized, pe_normalized.T)

    fig, ax = plt.subplots(figsize=(8, 8))
    im = ax.imshow(similarity.numpy(), cmap="RdBu", vmin=-1, vmax=1)
    ax.set_xlabel("Position")
    ax.set_ylabel("Position")
    ax.set_title(title)
    plt.colorbar(im, ax=ax)
    plt.tight_layout()
    plt.savefig("position_similarity.png", dpi=150)
    plt.show()


# Compare sinusoidal and learned
sin_pe = SinusoidalPositionalEncoding(128, max_len=64, dropout=0.0)
sin_matrix = sin_pe.pe.squeeze(0)  # (64, 128)
plot_position_similarity(sin_matrix, "Sinusoidal PE Similarity")

# For learned, initialize and show initial (random) similarity
learn_pe = LearnedPositionalEncoding(128, max_len=64, dropout=0.0)
learn_matrix = learn_pe.position_embedding.weight.detach()  # (64, 128)
plot_position_similarity(learn_matrix, "Learned PE Similarity (Before Training)")
```

When you visualize sinusoidal similarity:
- Nearby positions have high similarity (bright diagonal band)
- Distant positions have low similarity
- The pattern is smooth and periodic

---

## Summary

| Concept | Key Point |
|---------|-----------|
| The problem | Self-attention is permutation-equivariant — needs explicit position info |
| Sinusoidal PE | Fixed formula: sin/cos at different frequencies |
| Why it works | Encodes relative positions via linear transformation |
| Learned PE | Trainable nn.Embedding for positions |
| RoPE | Rotation-based relative encoding (modern LLMs) |
| ALiBi | Distance-based attention bias (no embedding modification) |
| Adding PE | $\text{input} = \text{embedding}(x) + \text{PE}(pos)$ |

---

## Exercises

1. Implement sinusoidal positional encoding and visualize the heatmap for $d_{model}=64$, $max\_len=100$
2. Plot cosine similarity between positions — verify that nearby positions are more similar
3. Compare sinusoidal vs. learned PE on a simple sequence classification task
4. Implement a simplified RoPE and verify that the dot product between rotated Q and K depends only on relative distance
5. Test extrapolation: train a model with max length 50, then evaluate on length 100 — which PE method handles this best?

---

You have now completed the foundations of the Transformer architecture! In the upcoming lessons, you will learn how these ideas come together in models like BERT, GPT, and modern large language models.
