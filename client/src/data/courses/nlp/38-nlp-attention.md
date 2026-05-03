---
title: The Attention Mechanism
---

# The Attention Mechanism

In this lesson, you will learn about the **Attention Mechanism** — one of the most important breakthroughs in deep learning. Attention allows models to focus on relevant parts of the input when generating each output token, solving the bottleneck problem of basic Seq2Seq models.

---

## The Bottleneck Problem Revisited

In a standard Seq2Seq model, the encoder compresses the **entire** input into a single fixed-size context vector:

```
"The agreement on the European Economic Area was signed in August 1992"
                                │
                                ▼
                  context vector (size 256)  ← ALL info here!
                                │
                                ▼
                  Decoder generates translation
```

Problems:
- Long sentences lose information (early words "forgotten")
- The context vector has a fixed capacity regardless of input length
- Performance degrades significantly for sentences > 20 words

---

## The Attention Idea

**Core insight**: instead of relying on a single compressed vector, let the decoder **look back at all encoder hidden states** at each decoding step.

```
Encoder states: [h_1, h_2, h_3, h_4, h_5]
                  │    │    │    │    │
                  └────┴────┼────┴────┘
                       Attention weights
                            │
                            ▼
               Weighted sum = context for this step
```

At each decoder time step, attention:
1. Looks at **all** encoder hidden states
2. Computes a **relevance score** for each
3. Creates a **weighted combination** as the context

This means the decoder gets a **different context vector** at each step — one that focuses on the most relevant input words.

---

## How Attention Works

### Step 1: Compute Alignment Scores

For decoder state $s_{i-1}$ and each encoder state $h_j$, compute a score:

$$e_{ij} = a(s_{i-1}, h_j)$$

The function $a$ is called the **alignment model** (or energy function). It measures how well the input at position $j$ matches the output at position $i$.

### Step 2: Compute Attention Weights

Normalize scores using softmax to get a probability distribution:

$$\alpha_{ij} = \frac{\exp(e_{ij})}{\sum_{k=1}^{T_x} \exp(e_{ik})}$$

Properties of $\alpha_{ij}$:
- All values between 0 and 1
- Sum to 1 across all encoder positions
- High value = "pay attention here"

### Step 3: Compute Context Vector

The context vector is a weighted sum of encoder states:

$$c_i = \sum_{j=1}^{T_x} \alpha_{ij} h_j$$

This context vector $c_i$ is **specific to decoder step $i$** — it focuses on the input words most relevant to the current output word.

---

## Bahdanau Attention (Additive)

Proposed by **Bahdanau et al. (2015)** — the original attention mechanism for neural machine translation.

### Alignment Function

$$e_{ij} = v_a^T \tanh(W_a s_{i-1} + U_a h_j)$$

Where:
- $W_a$: weight matrix for decoder state
- $U_a$: weight matrix for encoder state
- $v_a$: weight vector for final score
- All are **learnable parameters**

### Why "Additive"?

The decoder state and encoder state are combined by **addition** (after linear transformation), then passed through tanh.

### Decoder Update

The decoder uses both the context vector and previous output:

$$s_i = f(s_{i-1}, y_{i-1}, c_i)$$

$$P(y_i | y_{<i}, x) = g(s_i, y_{i-1}, c_i)$$

---

## Luong Attention (Multiplicative)

Proposed by **Luong et al. (2015)** — a simpler, faster alternative.

### Alignment Functions

Luong defined three scoring functions:

| Type | Formula | Notes |
|---|---|---|
| **Dot** | $e_{ij} = s_i^T h_j$ | Simplest, no extra params |
| **General** | $e_{ij} = s_i^T W_a h_j$ | One weight matrix |
| **Concat** | $e_{ij} = v_a^T \tanh(W_a[s_i; h_j])$ | Similar to Bahdanau |

### Why "Multiplicative"?

The dot product and general forms use **multiplication** between states (dot product or bilinear form), which is computationally cheaper than the additive approach.

### Bahdanau vs Luong

| Feature | Bahdanau | Luong |
|---|---|---|
| Alignment input | $s_{i-1}$ (previous state) | $s_i$ (current state) |
| Context usage | Input to decoder RNN | Combined after decoder RNN |
| Computation | Slower (tanh + addition) | Faster (dot product) |
| Year | 2015 (earlier) | 2015 (later) |

---

## Attention Weights Are Interpretable!

One of the most powerful properties of attention: the weights $\alpha_{ij}$ show **which input words the model focuses on** for each output word.

### Example: English → French Translation

```
Input:  "The  cat  sat  on  the  mat"
Output: "Le   chat est  sur le   tapis"

Attention matrix:
           The  cat  sat  on  the  mat
Le        [0.8  0.1  0.0  0.0  0.1  0.0]
chat      [0.1  0.8  0.0  0.0  0.0  0.1]
est       [0.0  0.1  0.8  0.0  0.0  0.1]
sur       [0.0  0.0  0.1  0.8  0.1  0.0]
le        [0.1  0.0  0.0  0.1  0.7  0.1]
tapis     [0.0  0.1  0.0  0.0  0.1  0.8]
```

The attention weights form a near-diagonal pattern for simple translations but can show **reordering** for languages with different word orders.

---

## Self-Attention Preview

In standard attention, the decoder attends to the encoder. But what about a sequence attending to **itself**?

**Self-attention** (used in Transformers) lets each position in a sequence attend to all other positions in the **same** sequence:

```
"The cat sat on the mat"
  │    │   │   │   │   │
  └────┴───┼───┴───┴───┘
       Each word looks at all others
```

This captures relationships like:
- "cat" relates to "sat" (subject-verb)
- "mat" relates to "the" (determiner-noun)
- "sat" relates to "on" (verb-preposition)

Self-attention is the foundation of the **Transformer architecture** (next lesson).

---

## Impact of Attention

The attention mechanism was a **breakthrough** for NLP:

| Before Attention | After Attention |
|---|---|
| Fixed context vector | Dynamic, step-specific context |
| Performance drops on long sequences | Handles long sequences well |
| No interpretability | Attention weights explain model |
| BLEU score ~20 (MT) | BLEU score ~30+ (MT) |

Attention also inspired breakthroughs in:
- Computer vision (image captioning, visual QA)
- Speech recognition
- Protein folding (AlphaFold)
- Music generation

---

## Code: Attention Mechanism Implementation

Let's implement attention from scratch and visualize the attention weights:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np


# --- Attention Layers ---
class BahdanauAttention(nn.Module):
    """Additive (Bahdanau) attention mechanism."""

    def __init__(self, encoder_dim, decoder_dim, attention_dim):
        super().__init__()
        self.W_encoder = nn.Linear(encoder_dim, attention_dim, bias=False)
        self.W_decoder = nn.Linear(decoder_dim, attention_dim, bias=False)
        self.v = nn.Linear(attention_dim, 1, bias=False)

    def forward(self, decoder_state, encoder_outputs):
        """
        Args:
            decoder_state: (batch, decoder_dim)
            encoder_outputs: (batch, src_len, encoder_dim)
        Returns:
            context: (batch, encoder_dim)
            weights: (batch, src_len)
        """
        # Expand decoder state for all encoder positions
        # (batch, 1, attention_dim)
        decoder_proj = self.W_decoder(decoder_state).unsqueeze(1)

        # (batch, src_len, attention_dim)
        encoder_proj = self.W_encoder(encoder_outputs)

        # Alignment scores: (batch, src_len, 1)
        energy = self.v(torch.tanh(decoder_proj + encoder_proj))
        energy = energy.squeeze(2)  # (batch, src_len)

        # Attention weights
        weights = F.softmax(energy, dim=1)  # (batch, src_len)

        # Context vector: weighted sum of encoder outputs
        context = torch.bmm(
            weights.unsqueeze(1), encoder_outputs
        ).squeeze(1)  # (batch, encoder_dim)

        return context, weights


class LuongAttention(nn.Module):
    """Multiplicative (Luong) attention mechanism."""

    def __init__(self, encoder_dim, decoder_dim, method="dot"):
        super().__init__()
        self.method = method

        if method == "general":
            self.W = nn.Linear(encoder_dim, decoder_dim, bias=False)
        elif method == "concat":
            self.W = nn.Linear(encoder_dim + decoder_dim, decoder_dim)
            self.v = nn.Linear(decoder_dim, 1, bias=False)

    def forward(self, decoder_state, encoder_outputs):
        """
        Args:
            decoder_state: (batch, decoder_dim)
            encoder_outputs: (batch, src_len, encoder_dim)
        Returns:
            context: (batch, encoder_dim)
            weights: (batch, src_len)
        """
        if self.method == "dot":
            # (batch, src_len)
            energy = torch.bmm(
                encoder_outputs,
                decoder_state.unsqueeze(2)
            ).squeeze(2)

        elif self.method == "general":
            # (batch, src_len, decoder_dim)
            transformed = self.W(encoder_outputs)
            energy = torch.bmm(
                transformed,
                decoder_state.unsqueeze(2)
            ).squeeze(2)

        elif self.method == "concat":
            src_len = encoder_outputs.size(1)
            decoder_expanded = decoder_state.unsqueeze(1).expand(
                -1, src_len, -1
            )
            concat = torch.cat([encoder_outputs, decoder_expanded], dim=2)
            energy = self.v(torch.tanh(self.W(concat))).squeeze(2)

        weights = F.softmax(energy, dim=1)
        context = torch.bmm(
            weights.unsqueeze(1), encoder_outputs
        ).squeeze(1)

        return context, weights


# --- Seq2Seq with Attention ---
class AttentionEncoder(nn.Module):
    """Encoder that returns all hidden states."""

    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers=1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim,
            num_layers=num_layers, batch_first=True,
            bidirectional=True
        )
        # Project bidirectional output to decoder dim
        self.fc_hidden = nn.Linear(hidden_dim * 2, hidden_dim)
        self.fc_cell = nn.Linear(hidden_dim * 2, hidden_dim)

    def forward(self, x):
        embedded = self.embedding(x)
        outputs, (hidden, cell) = self.lstm(embedded)
        # outputs: (batch, seq_len, hidden*2) — all encoder states

        # Combine bidirectional hidden states
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        cell = torch.cat((cell[-2], cell[-1]), dim=1)
        hidden = self.fc_hidden(hidden).unsqueeze(0)
        cell = self.fc_cell(cell).unsqueeze(0)

        return outputs, hidden, cell


class AttentionDecoder(nn.Module):
    """Decoder with Bahdanau attention."""

    def __init__(self, vocab_size, embed_dim, hidden_dim, encoder_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.attention = BahdanauAttention(
            encoder_dim, hidden_dim, hidden_dim
        )
        # Input to LSTM: embedding + context
        self.lstm = nn.LSTM(
            embed_dim + encoder_dim, hidden_dim,
            num_layers=1, batch_first=True
        )
        self.fc = nn.Linear(hidden_dim + encoder_dim + embed_dim, vocab_size)

    def forward(self, x, hidden, cell, encoder_outputs):
        """Single decoder step."""
        # x: (batch, 1)
        embedded = self.embedding(x)  # (batch, 1, embed_dim)

        # Attention
        context, weights = self.attention(
            hidden.squeeze(0), encoder_outputs
        )
        # context: (batch, encoder_dim)

        # Combine embedding and context as LSTM input
        lstm_input = torch.cat(
            [embedded, context.unsqueeze(1)], dim=2
        )

        output, (hidden, cell) = self.lstm(lstm_input, (hidden, cell))

        # Prediction
        prediction = self.fc(torch.cat(
            [output.squeeze(1), context, embedded.squeeze(1)], dim=1
        ))

        return prediction, hidden, cell, weights


# --- Visualization ---
def visualize_attention(input_tokens, output_tokens, attention_matrix):
    """Print a text-based attention visualization."""
    print("\n" + "=" * 60)
    print("ATTENTION WEIGHTS VISUALIZATION")
    print("=" * 60)

    # Header
    header = "       " + "".join(f"{tok:>8}" for tok in input_tokens)
    print(header)
    print("       " + "-" * (8 * len(input_tokens)))

    # Rows
    for i, out_tok in enumerate(output_tokens):
        row = f"{out_tok:>6} |"
        for j in range(len(input_tokens)):
            weight = attention_matrix[i][j]
            # Use block characters for visualization
            if weight > 0.5:
                bar = "████"
            elif weight > 0.3:
                bar = "███ "
            elif weight > 0.1:
                bar = "██  "
            elif weight > 0.05:
                bar = "█   "
            else:
                bar = "·   "
            row += f"  {bar}  "
        row += f"  ({attention_matrix[i].max():.2f})"
        print(row)

    print("=" * 60)


# --- Demo ---
def demo_attention():
    """Demonstrate attention mechanism."""
    torch.manual_seed(42)

    # Simulate encoder outputs (batch=1, seq_len=6, hidden=64)
    batch_size = 1
    src_len = 6
    hidden_dim = 64
    encoder_dim = hidden_dim * 2  # Bidirectional

    encoder_outputs = torch.randn(batch_size, src_len, encoder_dim)
    decoder_state = torch.randn(batch_size, hidden_dim)

    # Test Bahdanau attention
    print("--- Bahdanau Attention ---")
    bahdanau = BahdanauAttention(encoder_dim, hidden_dim, hidden_dim)
    context, weights = bahdanau(decoder_state, encoder_outputs)
    print(f"Context shape: {context.shape}")
    print(f"Weights: {weights.detach().numpy().round(3)}")
    print(f"Weights sum: {weights.sum().item():.4f}")

    # Test Luong attention (dot)
    print("\n--- Luong Attention (dot) ---")
    # For dot product, encoder_dim must match decoder_dim
    encoder_outputs_dot = torch.randn(batch_size, src_len, hidden_dim)
    luong = LuongAttention(hidden_dim, hidden_dim, method="dot")
    context, weights = luong(decoder_state, encoder_outputs_dot)
    print(f"Context shape: {context.shape}")
    print(f"Weights: {weights.detach().numpy().round(3)}")

    # Simulated translation attention visualization
    print("\n--- Simulated Translation Attention ---")
    input_tokens = ["The", "cat", "sat", "on", "mat", "."]
    output_tokens = ["Le", "chat", "assis", "sur", "tapis", "."]

    # Simulate near-diagonal attention (typical for translation)
    attention_matrix = np.array([
        [0.70, 0.10, 0.05, 0.05, 0.05, 0.05],
        [0.05, 0.75, 0.05, 0.05, 0.05, 0.05],
        [0.05, 0.05, 0.70, 0.10, 0.05, 0.05],
        [0.05, 0.05, 0.05, 0.75, 0.05, 0.05],
        [0.05, 0.05, 0.05, 0.05, 0.75, 0.10],
        [0.05, 0.05, 0.05, 0.05, 0.05, 0.80],
    ])

    visualize_attention(input_tokens, output_tokens, attention_matrix)


if __name__ == "__main__":
    demo_attention()
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| Bottleneck problem | Single context vector can't capture all input info |
| Attention | Decoder looks at all encoder states at each step |
| Alignment scores | Measure relevance between decoder state and each encoder state |
| Attention weights | Softmax-normalized scores; sum to 1 |
| Context vector | Weighted sum of encoder states (step-specific) |
| Bahdanau | Additive attention: $v^T \tanh(Ws + Uh)$ |
| Luong | Multiplicative: dot product or bilinear form |
| Interpretability | Attention weights show which input words matter |
| Self-attention | A sequence attending to itself (foundation of Transformers) |

---

## Next Steps

In the next lesson, you will learn about the **Transformer Architecture** — the model that replaced RNNs entirely by using self-attention, enabling massive parallelization and powering modern models like BERT and GPT.
