---
title: Attention Mechanisms
---

# Attention Mechanisms

In this lesson, you will learn about attention — one of the most important innovations in deep learning. Attention allows models to focus on the most relevant parts of the input when producing each output.

---

## The Bottleneck Problem

In a standard encoder-decoder (seq2seq) model, the entire input sequence is compressed into a single fixed-size context vector:

```
Input: "The cat sat on the mat"
         ↓ ↓ ↓ ↓ ↓ ↓
       [Encoder LSTM]
              ↓
    Fixed Context Vector (single vector!)
              ↓
       [Decoder LSTM]
         ↓ ↓ ↓ ↓ ↓
Output: "Le chat est assis sur le tapis"
```

**The problem:** All information about the input must fit into one vector. For long sequences, early information gets "forgotten."

This is called the **information bottleneck** — and attention solves it.

---

## The Attention Idea

Instead of compressing everything into one vector, attention lets the decoder **look at all encoder hidden states** and decide which ones are most relevant at each decoding step:

```
Encoder states: [h₁, h₂, h₃, h₄, h₅, h₆]
                  ↑    ↑         ↑
                  |    |         |
            Attention weights: [0.1, 0.5, 0.05, 0.3, 0.03, 0.02]
                              ↓
                    Weighted context vector
                              ↓
                         Decoder step
```

Each decoder step gets a **different** context vector — a weighted combination of all encoder states.

---

## Attention Step by Step

At each decoder time step $i$:

1. **Compute alignment scores** $e_{ij}$ between decoder state $s_{i-1}$ and each encoder state $h_j$
2. **Normalize** with softmax to get attention weights $\alpha_{ij}$
3. **Compute context vector** as weighted sum of encoder states

### Attention Weights

$$\alpha_{ij} = \text{softmax}(e_{ij}) = \frac{\exp(e_{ij})}{\sum_{k=1}^{T} \exp(e_{ik})}$$

### Context Vector

$$c_i = \sum_{j=1}^{T} \alpha_{ij} h_j$$

Where $T$ is the input sequence length.

---

## Bahdanau Attention (Additive)

Proposed by Bahdanau et al. (2015), this computes alignment scores using a small neural network:

$$e_{ij} = v^T \tanh(W_1 s_{i-1} + W_2 h_j)$$

Where:
- $s_{i-1}$ is the previous decoder hidden state
- $h_j$ is the $j$-th encoder hidden state
- $W_1$, $W_2$ are learnable weight matrices
- $v$ is a learnable weight vector

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class BahdanauAttention(nn.Module):
    """Additive (Bahdanau) attention mechanism."""

    def __init__(self, encoder_dim, decoder_dim, attention_dim):
        super().__init__()
        self.W1 = nn.Linear(decoder_dim, attention_dim, bias=False)
        self.W2 = nn.Linear(encoder_dim, attention_dim, bias=False)
        self.v = nn.Linear(attention_dim, 1, bias=False)

    def forward(self, decoder_state, encoder_outputs):
        """
        Args:
            decoder_state: (batch, decoder_dim)
            encoder_outputs: (batch, seq_len, encoder_dim)
        Returns:
            context: (batch, encoder_dim)
            weights: (batch, seq_len)
        """
        # decoder_state: (batch, 1, attention_dim)
        query = self.W1(decoder_state).unsqueeze(1)

        # encoder_outputs: (batch, seq_len, attention_dim)
        keys = self.W2(encoder_outputs)

        # Alignment scores: (batch, seq_len, 1)
        scores = self.v(torch.tanh(query + keys))
        scores = scores.squeeze(-1)  # (batch, seq_len)

        # Attention weights
        weights = F.softmax(scores, dim=-1)  # (batch, seq_len)

        # Context vector: weighted sum of encoder outputs
        context = torch.bmm(
            weights.unsqueeze(1), encoder_outputs
        ).squeeze(1)  # (batch, encoder_dim)

        return context, weights
```

---

## Luong Attention (Multiplicative)

Proposed by Luong et al. (2015), this is simpler and often faster:

$$e_{ij} = s_i^T W h_j$$

The key difference: Luong uses the **current** decoder state $s_i$, while Bahdanau uses the **previous** state $s_{i-1}$.

### Luong Attention Variants

| Variant | Score Function |
|---------|---------------|
| Dot | $e_{ij} = s_i^T h_j$ |
| General | $e_{ij} = s_i^T W h_j$ |
| Concat | $e_{ij} = v^T \tanh(W[s_i; h_j])$ |

```python
class LuongAttention(nn.Module):
    """Multiplicative (Luong) attention mechanism."""

    def __init__(self, encoder_dim, decoder_dim, method="general"):
        super().__init__()
        self.method = method

        if method == "general":
            self.W = nn.Linear(encoder_dim, decoder_dim, bias=False)
        elif method == "concat":
            self.W = nn.Linear(encoder_dim + decoder_dim, decoder_dim, bias=False)
            self.v = nn.Linear(decoder_dim, 1, bias=False)

    def forward(self, decoder_state, encoder_outputs):
        """
        Args:
            decoder_state: (batch, decoder_dim)
            encoder_outputs: (batch, seq_len, encoder_dim)
        Returns:
            context: (batch, encoder_dim)
            weights: (batch, seq_len)
        """
        if self.method == "dot":
            # Simple dot product
            scores = torch.bmm(
                encoder_outputs,
                decoder_state.unsqueeze(2)
            ).squeeze(2)

        elif self.method == "general":
            # Linear transform then dot product
            energy = self.W(encoder_outputs)  # (batch, seq_len, decoder_dim)
            scores = torch.bmm(
                energy,
                decoder_state.unsqueeze(2)
            ).squeeze(2)

        elif self.method == "concat":
            # Concatenate and pass through network
            seq_len = encoder_outputs.size(1)
            decoder_expanded = decoder_state.unsqueeze(1).expand(-1, seq_len, -1)
            concat = torch.cat([decoder_expanded, encoder_outputs], dim=2)
            scores = self.v(torch.tanh(self.W(concat))).squeeze(2)

        # Attention weights and context
        weights = F.softmax(scores, dim=-1)
        context = torch.bmm(weights.unsqueeze(1), encoder_outputs).squeeze(1)

        return context, weights
```

---

## Seq2Seq with Attention

Here's a complete encoder-decoder model using attention:

```python
class Encoder(nn.Module):
    """Bidirectional LSTM encoder."""

    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers=2, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout,
        )
        # Project bidirectional hidden to decoder size
        self.fc_hidden = nn.Linear(hidden_dim * 2, hidden_dim)
        self.fc_cell = nn.Linear(hidden_dim * 2, hidden_dim)

    def forward(self, src):
        embedded = self.embedding(src)
        outputs, (hidden, cell) = self.lstm(embedded)
        # outputs: (batch, seq_len, hidden_dim * 2)

        # Combine bidirectional states for decoder initialization
        hidden = torch.cat([hidden[-2], hidden[-1]], dim=1)
        cell = torch.cat([cell[-2], cell[-1]], dim=1)
        hidden = torch.tanh(self.fc_hidden(hidden))
        cell = torch.tanh(self.fc_cell(cell))

        return outputs, hidden.unsqueeze(0), cell.unsqueeze(0)


class AttentionDecoder(nn.Module):
    """Decoder with Bahdanau attention."""

    def __init__(self, vocab_size, embed_dim, encoder_dim, decoder_dim,
                 attention_dim, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.attention = BahdanauAttention(encoder_dim, decoder_dim, attention_dim)
        self.lstm = nn.LSTMCell(embed_dim + encoder_dim, decoder_dim)
        self.fc_out = nn.Linear(decoder_dim + encoder_dim + embed_dim, vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, input_token, hidden, cell, encoder_outputs):
        """Single decoding step."""
        # input_token: (batch,)
        embedded = self.dropout(self.embedding(input_token))  # (batch, embed_dim)

        # Compute attention
        context, weights = self.attention(hidden.squeeze(0), encoder_outputs)

        # LSTM input: embedded + context
        lstm_input = torch.cat([embedded, context], dim=1)
        h, c = self.lstm(lstm_input, (hidden.squeeze(0), cell.squeeze(0)))

        # Output prediction
        output = torch.cat([h, context, embedded], dim=1)
        prediction = self.fc_out(output)

        return prediction, h.unsqueeze(0), c.unsqueeze(0), weights
```

---

## Visualizing Attention Weights

Attention weights show which input tokens the model focuses on for each output:

```python
import matplotlib.pyplot as plt
import numpy as np


def plot_attention(attention_weights, source_tokens, target_tokens):
    """
    Visualize attention as a heatmap.

    Args:
        attention_weights: numpy array (target_len, source_len)
        source_tokens: list of source words
        target_tokens: list of target words
    """
    fig, ax = plt.subplots(figsize=(10, 8))

    # Plot heatmap
    im = ax.imshow(attention_weights, cmap="YlOrRd", aspect="auto")

    # Set axis labels
    ax.set_xticks(range(len(source_tokens)))
    ax.set_yticks(range(len(target_tokens)))
    ax.set_xticklabels(source_tokens, rotation=45, ha="right")
    ax.set_yticklabels(target_tokens)

    # Add colorbar
    plt.colorbar(im, ax=ax)

    # Add value annotations
    for i in range(len(target_tokens)):
        for j in range(len(source_tokens)):
            value = attention_weights[i, j]
            color = "white" if value > 0.5 else "black"
            ax.text(j, i, f"{value:.2f}", ha="center", va="center",
                    color=color, fontsize=8)

    ax.set_xlabel("Source (Input)")
    ax.set_ylabel("Target (Output)")
    ax.set_title("Attention Weights")
    plt.tight_layout()
    plt.savefig("attention_heatmap.png", dpi=150)
    plt.show()


# Example usage:
# source = ["The", "cat", "sat", "on", "the", "mat"]
# target = ["Le", "chat", "est", "assis"]
# weights = np.array([[0.7, 0.1, 0.05, 0.05, 0.05, 0.05],
#                     [0.1, 0.7, 0.05, 0.05, 0.05, 0.05],
#                     [0.05, 0.05, 0.6, 0.2, 0.05, 0.05],
#                     [0.05, 0.05, 0.5, 0.3, 0.05, 0.05]])
# plot_attention(weights, source, target)
```

When visualized, you'll typically see a roughly diagonal pattern for translation — each output word attends to its corresponding input word.

---

## Self-Attention Preview

So far, we've discussed **cross-attention** (decoder attends to encoder). There's also **self-attention**, where a sequence attends to itself:

$$\text{Self-Attention}(X) = \text{softmax}\left(\frac{XX^T}{\sqrt{d}}\right)X$$

Self-attention is the foundation of the **Transformer** architecture, which we'll cover in the next lesson.

Key differences:

| Type | Query Source | Key/Value Source |
|------|-------------|-----------------|
| Cross-attention | Decoder | Encoder |
| Self-attention | Same sequence | Same sequence |

---

## Implementing a Full Attention Forward Pass

Let's trace through a complete attention computation step by step:

```python
# Full example: computing attention from scratch with real tensors

batch_size = 2
src_len = 6       # Source sentence: 6 words
decoder_dim = 256
encoder_dim = 512  # Bidirectional encoder → 2 * 256

# Simulated encoder outputs (from bidirectional LSTM)
encoder_outputs = torch.randn(batch_size, src_len, encoder_dim)

# Current decoder hidden state
decoder_state = torch.randn(batch_size, decoder_dim)

# --- Bahdanau Attention ---
attention = BahdanauAttention(
    encoder_dim=encoder_dim,
    decoder_dim=decoder_dim,
    attention_dim=128
)

context, weights = attention(decoder_state, encoder_outputs)
print(f"Context vector shape: {context.shape}")   # (2, 512)
print(f"Attention weights shape: {weights.shape}") # (2, 6)
print(f"Weights sum to 1: {weights.sum(dim=-1)}")  # [1.0, 1.0]

# --- Luong Attention (general) ---
luong_attn = LuongAttention(
    encoder_dim=encoder_dim,
    decoder_dim=encoder_dim,  # Must match for dot product
    method="general"
)

# For Luong, decoder state must match encoder dim
decoder_state_luong = torch.randn(batch_size, encoder_dim)
context_l, weights_l = luong_attn(decoder_state_luong, encoder_outputs)
print(f"Luong context shape: {context_l.shape}")   # (2, 512)
print(f"Luong weights shape: {weights_l.shape}")   # (2, 6)
```

---

## Comparing Attention Mechanisms

| Feature | Bahdanau | Luong |
|---------|----------|-------|
| Score function | Additive (MLP) | Multiplicative (dot) |
| Decoder state used | Previous ($s_{i-1}$) | Current ($s_i$) |
| Computation | Slightly slower | Faster |
| When to use | Small datasets | Large datasets |

---

## Why Attention Works

Attention provides three key benefits:

1. **Removes the bottleneck** — decoder accesses all encoder states
2. **Provides shortcuts** — gradients flow directly to relevant encoder states
3. **Interpretability** — attention weights show what the model "looks at"

---

## Summary

| Concept | Key Formula |
|---------|------------|
| Alignment scores | $e_{ij}$ = how relevant encoder state $j$ is |
| Bahdanau | $e_{ij} = v^T\tanh(W_1 s_{i-1} + W_2 h_j)$ |
| Luong | $e_{ij} = s_i^T W h_j$ |
| Attention weights | $\alpha_{ij} = \text{softmax}(e_{ij})$ |
| Context vector | $c_i = \sum_j \alpha_{ij} h_j$ |

---

## Exercises

1. Implement a seq2seq model with Luong dot attention for a simple translation task
2. Visualize attention weights and verify they form a roughly diagonal pattern
3. Compare Bahdanau vs. Luong attention on the same dataset — which converges faster?
4. Experiment with attention on long sequences (50+ tokens) vs. short ones — where does attention help most?

---

In the next lesson, you will learn about the **Transformer Architecture** — a model built entirely on attention, with no recurrence at all.
