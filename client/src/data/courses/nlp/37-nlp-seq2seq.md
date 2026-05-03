---
title: Sequence-to-Sequence Models
---

# Sequence-to-Sequence Models

In this lesson, you will learn about **Sequence-to-Sequence (Seq2Seq) models** — architectures that transform one sequence into another. These models power machine translation, text summarization, chatbots, and many other applications.

---

## What Is Seq2Seq?

A Seq2Seq model takes an **input sequence** of variable length and produces an **output sequence** of variable length. The input and output can have **different lengths**.

### Examples

| Task | Input | Output |
|---|---|---|
| Translation | "How are you?" | "Comment allez-vous?" |
| Summarization | Long article (500 words) | Short summary (50 words) |
| Chatbot | "What's the weather?" | "It's sunny and 72°F today." |
| Text reversal | "hello world" | "dlrow olleh" |
| Code generation | "sort a list" | "sorted_list = sorted(my_list)" |

The key insight: input and output lengths are **independent**. This is different from sequence labeling (where output length = input length).

---

## Encoder-Decoder Architecture

The Seq2Seq model consists of two parts:

```
┌──────────────────┐     context     ┌──────────────────┐
│     ENCODER      │ ──── vector ──► │     DECODER      │
│                  │      (h_n)      │                  │
│ Reads input seq  │                 │ Generates output │
└──────────────────┘                 └──────────────────┘
```

### The Encoder

The encoder reads the **entire input sequence** and compresses it into a fixed-size **context vector** (the final hidden state).

```
Input: "I love NLP"

  x_1="I" → [LSTM] → h_1
  x_2="love" → [LSTM] → h_2
  x_3="NLP" → [LSTM] → h_3 ← context vector!
```

The context vector $h_n$ is supposed to capture the **meaning** of the entire input sequence.

### The Decoder

The decoder takes the context vector and generates the output sequence **one token at a time**:

```
Context h_3 → [LSTM] → "J'" → [LSTM] → "adore" → [LSTM] → "le" → [LSTM] → "NLP" → [LSTM] → <EOS>
```

At each step, the decoder:
1. Takes the previous output token as input
2. Updates its hidden state
3. Predicts the next token
4. Stops when it generates `<EOS>` (End of Sequence)

---

## Mathematical Formulation

### Encoder

For input sequence $(x_1, x_2, \ldots, x_T)$:

$$h_t^{enc} = \text{LSTM}(x_t, h_{t-1}^{enc})$$

The context vector is: $c = h_T^{enc}$

### Decoder

For output sequence $(y_1, y_2, \ldots, y_{T'})$:

$$h_t^{dec} = \text{LSTM}(y_{t-1}, h_{t-1}^{dec})$$

$$P(y_t | y_{<t}, x) = \text{softmax}(W_o h_t^{dec} + b_o)$$

The decoder is initialized with: $h_0^{dec} = c$ (the context vector)

---

## The Bottleneck Problem

The biggest limitation of basic Seq2Seq: **all information** about the input must be compressed into a single fixed-size vector.

```
"The quick brown fox jumped over the lazy dog near the big red barn"
                            │
                            ▼
              [single vector of size 256]  ← TOO MUCH!
                            │
                            ▼
              Generate translation...
```

For long sentences, the context vector **cannot capture everything**. Information about early words gets lost. This is why the **attention mechanism** (next lesson) was invented.

---

## Applications of Seq2Seq

### 1. Machine Translation

```
Encoder input:  "The cat is on the mat"
Decoder output: "Le chat est sur le tapis"
```

### 2. Text Summarization

```
Encoder input:  [Long news article...]
Decoder output: "Stock markets rose 2% on positive earnings reports."
```

### 3. Chatbots / Dialogue

```
Encoder input:  "What time does the store close?"
Decoder output: "The store closes at 9 PM."
```

### 4. Text-to-SQL

```
Encoder input:  "Show me all users from New York"
Decoder output: "SELECT * FROM users WHERE city = 'New York'"
```

---

## Teacher Forcing

During training, the decoder can be fed inputs in two ways:

### Without Teacher Forcing (Autoregressive)

The decoder uses its **own previous prediction** as the next input:

```
<SOS> → predict "Le" → feed "Le" → predict "chat" → feed "chat" → ...
```

Problem: if an early prediction is wrong, errors **accumulate** (exposure bias).

### With Teacher Forcing

The decoder uses the **ground truth** previous token as input:

```
<SOS> → predict "Le" → feed "Le" (ground truth) → predict "chat" → feed "chat" (ground truth) → ...
```

Benefits:
- Faster convergence
- More stable training

Drawbacks:
- Train/test mismatch (at test time, no ground truth available)

### Scheduled Sampling

A compromise: gradually reduce teacher forcing during training.

```python
# Start with 100% teacher forcing, decay over epochs
teacher_forcing_ratio = max(0.1, 1.0 - epoch * 0.05)
```

---

## Beam Search Decoding

At inference time, **greedy decoding** (always picking the highest-probability token) can miss better sequences. **Beam search** keeps the top-$k$ candidates at each step.

### Greedy vs Beam Search

```
Greedy (beam=1):
  Step 1: "The" (p=0.6)
  Step 2: "The cat" (p=0.6 × 0.5 = 0.30)
  Step 3: "The cat sat" (p=0.30 × 0.4 = 0.12)

Beam search (beam=3):
  Step 1: "The" (0.6), "A" (0.3), "That" (0.1)
  Step 2: "The cat" (0.30), "A big" (0.21), "The big" (0.18)
  Step 3: "A big cat" (0.168), "The cat sat" (0.12), ...
  Winner: "A big cat" — better overall probability!
```

### Beam Width Trade-off

| Beam Width | Quality | Speed |
|---|---|---|
| 1 (greedy) | Lower | Fastest |
| 3–5 | Good balance | Moderate |
| 10+ | Diminishing returns | Slow |

In practice, beam width of **3–5** works well for most tasks.

---

## Special Tokens

Seq2Seq models use special tokens to control generation:

| Token | Purpose |
|---|---|
| `<PAD>` | Padding for batch processing |
| `<SOS>` / `<BOS>` | Start of sequence (decoder input) |
| `<EOS>` | End of sequence (stop generating) |
| `<UNK>` | Unknown/out-of-vocabulary word |

---

## Code: Seq2Seq for String Reversal

Let's build a complete Seq2Seq model that learns to **reverse strings**:

```python
import torch
import torch.nn as nn
import torch.optim as optim
import random


# --- Special tokens ---
PAD_TOKEN = 0
SOS_TOKEN = 1
EOS_TOKEN = 2


# --- Encoder ---
class Encoder(nn.Module):
    """LSTM encoder: reads input sequence, produces context."""

    def __init__(self, input_size, embed_size, hidden_size, num_layers=1):
        super().__init__()
        self.embedding = nn.Embedding(input_size, embed_size)
        self.lstm = nn.LSTM(
            embed_size, hidden_size,
            num_layers=num_layers, batch_first=True
        )

    def forward(self, x):
        # x: (batch, seq_len)
        embedded = self.embedding(x)  # (batch, seq_len, embed_size)
        outputs, (hidden, cell) = self.lstm(embedded)
        return hidden, cell


# --- Decoder ---
class Decoder(nn.Module):
    """LSTM decoder: generates output one token at a time."""

    def __init__(self, output_size, embed_size, hidden_size, num_layers=1):
        super().__init__()
        self.embedding = nn.Embedding(output_size, embed_size)
        self.lstm = nn.LSTM(
            embed_size, hidden_size,
            num_layers=num_layers, batch_first=True
        )
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x, hidden, cell):
        # x: (batch, 1) — single token
        embedded = self.embedding(x)  # (batch, 1, embed_size)
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        prediction = self.fc(output.squeeze(1))  # (batch, output_size)
        return prediction, hidden, cell


# --- Seq2Seq ---
class Seq2Seq(nn.Module):
    """Complete encoder-decoder model."""

    def __init__(self, encoder, decoder, device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(self, source, target, teacher_forcing_ratio=0.5):
        batch_size = source.size(0)
        target_len = target.size(1)
        target_vocab_size = self.decoder.fc.out_features

        # Store decoder outputs
        outputs = torch.zeros(batch_size, target_len, target_vocab_size)
        outputs = outputs.to(self.device)

        # Encode
        hidden, cell = self.encoder(source)

        # First decoder input is <SOS>
        decoder_input = torch.full(
            (batch_size, 1), SOS_TOKEN, dtype=torch.long
        ).to(self.device)

        # Decode step by step
        for t in range(target_len):
            prediction, hidden, cell = self.decoder(
                decoder_input, hidden, cell
            )
            outputs[:, t, :] = prediction

            # Teacher forcing
            if random.random() < teacher_forcing_ratio:
                decoder_input = target[:, t].unsqueeze(1)
            else:
                decoder_input = prediction.argmax(dim=1).unsqueeze(1)

        return outputs


# --- Data Preparation ---
def build_char_vocab():
    """Build character-level vocabulary."""
    chars = "abcdefghijklmnopqrstuvwxyz "
    vocab = {"<PAD>": 0, "<SOS>": 1, "<EOS>": 2}
    for ch in chars:
        vocab[ch] = len(vocab)
    return vocab


def encode_sequence(text, vocab, max_len):
    """Convert text to tensor of indices."""
    indices = [vocab.get(ch, vocab["<PAD>"]) for ch in text]
    indices.append(EOS_TOKEN)
    # Pad
    while len(indices) < max_len:
        indices.append(PAD_TOKEN)
    return indices[:max_len]


def create_reversal_data(vocab, num_samples=500, max_len=10):
    """Create training data: input → reversed output."""
    words = ["hello", "world", "python", "deep", "learn",
             "neural", "network", "data", "science", "model",
             "train", "test", "code", "text", "word"]

    sources = []
    targets = []
    seq_len = max_len + 1  # +1 for EOS

    for _ in range(num_samples):
        word = random.choice(words)
        src = encode_sequence(word, vocab, seq_len)
        tgt = encode_sequence(word[::-1], vocab, seq_len)  # Reversed!
        sources.append(src)
        targets.append(tgt)

    return torch.tensor(sources), torch.tensor(targets)


# --- Training ---
def train():
    """Train the seq2seq string reversal model."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    vocab = build_char_vocab()
    vocab_size = len(vocab)

    # Create data
    sources, targets = create_reversal_data(vocab, num_samples=1000)

    # Model
    encoder = Encoder(vocab_size, embed_size=32, hidden_size=64)
    decoder = Decoder(vocab_size, embed_size=32, hidden_size=64)
    model = Seq2Seq(encoder, decoder, device).to(device)

    optimizer = optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss(ignore_index=PAD_TOKEN)

    # Training loop
    model.train()
    batch_size = 32

    for epoch in range(100):
        total_loss = 0
        # Simple batching
        indices = torch.randperm(len(sources))

        for i in range(0, len(sources), batch_size):
            batch_idx = indices[i:i+batch_size]
            src = sources[batch_idx].to(device)
            tgt = targets[batch_idx].to(device)

            optimizer.zero_grad()
            output = model(src, tgt, teacher_forcing_ratio=0.5)

            # Reshape for loss
            output = output.view(-1, vocab_size)
            tgt_flat = tgt.view(-1)

            loss = criterion(output, tgt_flat)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 20 == 0:
            print(f"Epoch {epoch+1}, Loss: {total_loss:.4f}")

    return model, vocab


# --- Inference ---
def reverse_string(model, text, vocab, device, max_len=15):
    """Use the trained model to reverse a string."""
    model.eval()
    idx_to_char = {v: k for k, v in vocab.items()}

    # Encode input
    src = encode_sequence(text, vocab, max_len)
    src_tensor = torch.tensor([src]).to(device)

    with torch.no_grad():
        hidden, cell = model.encoder(src_tensor)

        decoder_input = torch.tensor([[SOS_TOKEN]]).to(device)
        result = []

        for _ in range(max_len):
            prediction, hidden, cell = model.decoder(
                decoder_input, hidden, cell
            )
            top_token = prediction.argmax(dim=1).item()

            if top_token == EOS_TOKEN:
                break
            if top_token in idx_to_char:
                result.append(idx_to_char[top_token])

            decoder_input = torch.tensor([[top_token]]).to(device)

    return "".join(result)


if __name__ == "__main__":
    model, vocab = train()

    # Test
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    test_words = ["hello", "world", "python", "deep"]

    print("\n--- String Reversal Results ---")
    for word in test_words:
        predicted = reverse_string(model, word, vocab, device)
        expected = word[::-1]
        status = "✓" if predicted == expected else "✗"
        print(f"  {status} '{word}' → '{predicted}' (expected: '{expected}')")
```

---

## Key Takeaways

| Concept | Summary |
|---|---|
| Seq2Seq | Maps variable-length input to variable-length output |
| Encoder | Reads input, produces context vector |
| Decoder | Generates output from context vector, one token at a time |
| Bottleneck | Fixed-size context vector limits capacity |
| Teacher forcing | Feed ground truth during training for stability |
| Beam search | Keep top-k candidates for better decoding |
| Special tokens | `<SOS>`, `<EOS>`, `<PAD>`, `<UNK>` control generation |

---

## Next Steps

In the next lesson, you will learn about the **Attention Mechanism** — a breakthrough that eliminates the bottleneck problem by letting the decoder look at all encoder states, not just the last one.
