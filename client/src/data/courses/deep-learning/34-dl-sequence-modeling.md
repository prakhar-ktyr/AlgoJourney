---
title: Sequence Modeling
---

# Sequence Modeling

So far we've handled fixed-output tasks (classification, single prediction). But what about translating English to French? Or summarizing a paragraph? These require **sequence-to-sequence** models that produce variable-length outputs.

---

## Sequence-to-Sequence Tasks

In seq2seq tasks, both input and output are sequences — often of **different lengths**:

| Task | Input | Output |
|------|-------|--------|
| Machine translation | "I love cats" | "J'aime les chats" |
| Text summarization | Long article | Short summary |
| Chatbot | User message | Bot response |
| Speech recognition | Audio frames | Text words |
| Code generation | Natural language | Code tokens |

The challenge: we can't use a simple many-to-many RNN because input and output lengths differ.

---

## The Encoder-Decoder Architecture

The solution is to split the model into two parts:

```
┌─────────────────────┐     ┌─────────────────────┐
│      ENCODER        │     │      DECODER        │
│                     │     │                     │
│  x₁ → x₂ → x₃     │  c  │  → y₁ → y₂ → y₃   │
│  Process input      │ ──► │  Generate output    │
│  sequence           │     │  sequence           │
└─────────────────────┘     └─────────────────────┘
```

### Encoder

- Reads the **entire input sequence**
- Compresses it into a fixed-size **context vector** $c$
- Usually the final hidden state: $c = h_T^{enc}$

### Decoder

- Takes the context vector $c$ as its initial state
- Generates the output sequence **one token at a time**
- Each output token becomes the input for the next step
- Stops when it generates an end-of-sequence token `<EOS>`

---

## Encoder-Decoder in Detail

### Encoder Processing

The encoder (typically an LSTM or GRU) processes the input:

$$h_t^{enc} = \text{LSTM}(x_t, h_{t-1}^{enc})$$

After processing all input tokens, the final state becomes the context:

$$c = h_T^{enc}$$

### Decoder Generation

The decoder generates output tokens one at a time:

$$h_t^{dec} = \text{LSTM}(y_{t-1}, h_{t-1}^{dec})$$

$$P(y_t) = \text{softmax}(W_{out} \cdot h_t^{dec})$$

The decoder's initial hidden state is the context: $h_0^{dec} = c$

### The Bottleneck Problem

Compressing an entire sentence into a single fixed vector $c$ is limiting. Long sentences lose information. This motivates the **attention mechanism** (covered briefly below and in detail in a later lesson).

---

## Teacher Forcing

During training, we have a choice for the decoder input at each step:

**Option A — Autoregressive (no teacher forcing):**
- Feed the model's own previous prediction as the next input
- If the model makes an error, it compounds over time

**Option B — Teacher forcing:**
- Feed the **ground truth** previous token as the next input
- The model always gets correct context during training

```
Without teacher forcing:
  Input: <SOS>  →  ŷ₁  →  ŷ₂  →  ŷ₃
  (errors compound if ŷ₁ is wrong)

With teacher forcing:
  Input: <SOS>  →  y₁  →  y₂  →  y₃  (ground truth)
  (always correct context)
```

### Teacher Forcing in Code

```python
def train_step(encoder, decoder, source, target, criterion, teacher_forcing_ratio=0.5):
    """One training step with optional teacher forcing."""

    # Encode
    encoder_outputs, encoder_hidden = encoder(source)

    # Decoder initial state = encoder final state
    decoder_hidden = encoder_hidden
    decoder_input = target[:, 0:1]  # <SOS> token

    loss = 0
    target_len = target.size(1)

    for t in range(1, target_len):
        # Decode one step
        decoder_output, decoder_hidden = decoder(decoder_input, decoder_hidden)
        loss += criterion(decoder_output, target[:, t])

        # Teacher forcing: use ground truth or prediction?
        use_teacher_forcing = torch.rand(1).item() < teacher_forcing_ratio

        if use_teacher_forcing:
            decoder_input = target[:, t:t+1]  # Ground truth
        else:
            decoder_input = decoder_output.argmax(dim=-1, keepdim=True)  # Prediction

    return loss / target_len
```

### Scheduled Sampling

A compromise: start with high teacher forcing (e.g., 100%) and gradually reduce it during training. This gives the model correct signals early on but forces it to handle its own errors later.

```python
# Reduce teacher forcing ratio over epochs
teacher_forcing_ratio = max(0.1, 1.0 - epoch * 0.05)
```

---

## Attention Mechanism (Preview)

The attention mechanism solves the bottleneck of compressing everything into one vector. Instead, the decoder can **look at all encoder hidden states** and focus on the relevant ones.

**Intuition:** When translating "the cat sat on the mat," to predict "le" (French for "the"), the decoder should focus on the word "the" in the input.

$$\alpha_{t,i} = \frac{\exp(e_{t,i})}{\sum_j \exp(e_{t,j})}$$

$$c_t = \sum_i \alpha_{t,i} \cdot h_i^{enc}$$

Where:
- $\alpha_{t,i}$ — attention weight for encoder position $i$ at decoder step $t$
- $e_{t,i}$ — alignment score between decoder state and encoder state
- $c_t$ — context vector (now different at each decoder step!)

> We'll cover attention in full detail in a dedicated lesson. For now, know that it dramatically improves encoder-decoder models.

---

## Beam Search for Decoding

At inference time, we need to generate the output sequence. **Greedy decoding** picks the highest-probability token at each step — but this can miss better sequences.

**Beam search** keeps track of the top $k$ (beam width) most likely sequences:

```
Step 1: "I"(0.6), "The"(0.3), "A"(0.1)
           ↓           ↓
Step 2: "I love"(0.4), "I like"(0.15), "The cat"(0.2)
           ↓                              ↓
Step 3: "I love cats"(0.3), "The cat sat"(0.15)
```

### Beam Search Algorithm

```python
def beam_search(decoder, initial_hidden, beam_width=3, max_len=50,
                sos_token=1, eos_token=2):
    """Generate output sequence using beam search."""

    # Each beam: (sequence, score, hidden_state)
    beams = [([sos_token], 0.0, initial_hidden)]
    completed = []

    for step in range(max_len):
        all_candidates = []

        for seq, score, hidden in beams:
            if seq[-1] == eos_token:
                completed.append((seq, score))
                continue

            input_token = torch.tensor([[seq[-1]]])
            output, new_hidden = decoder(input_token, hidden)
            log_probs = torch.log_softmax(output, dim=-1)

            # Get top-k tokens
            topk_probs, topk_ids = log_probs.topk(beam_width)

            for i in range(beam_width):
                new_seq = seq + [topk_ids[0, 0, i].item()]
                new_score = score + topk_probs[0, 0, i].item()
                all_candidates.append((new_seq, new_score, new_hidden))

        # Keep top beam_width candidates
        all_candidates.sort(key=lambda x: x[1], reverse=True)
        beams = all_candidates[:beam_width]

    # Return best sequence (length-normalized score)
    if completed:
        completed.sort(key=lambda x: x[1] / len(x[0]), reverse=True)
        return completed[0][0]
    return beams[0][0]
```

### Beam Width Trade-offs

- **Width 1 (greedy):** Fastest, but may miss better sequences
- **Width 3–5:** Good balance of quality and speed
- **Width 10+:** Diminishing returns, much slower

---

## Sequence Labeling

Not all sequence tasks produce a different-length output. **Sequence labeling** assigns a label to each input token:

### Part-of-Speech (POS) Tagging

```
Input:   The   cat   sat   on   the   mat
Labels:  DET   NOUN  VERB  ADP  DET   NOUN
```

### Named Entity Recognition (NER)

```
Input:   John  works  at   Google  in  London
Labels:  PER   O      O    ORG     O   LOC
```

For sequence labeling, use a **many-to-many** architecture where each time step produces an output:

```python
class SequenceLabeler(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_size, num_tags):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_size, batch_first=True,
                           bidirectional=True)
        self.fc = nn.Linear(hidden_size * 2, num_tags)

    def forward(self, x):
        embedded = self.embedding(x)           # (batch, seq, embed)
        lstm_out, _ = self.lstm(embedded)      # (batch, seq, hidden*2)
        logits = self.fc(lstm_out)             # (batch, seq, num_tags)
        return logits
```

---

## Embedding Layers: nn.Embedding

Before feeding text to an RNN/LSTM/GRU, we need to convert word indices to dense vectors. `nn.Embedding` does this:

```python
import torch.nn as nn

# Create embedding layer
# num_embeddings: vocabulary size
# embedding_dim: dimension of each word vector
embedding = nn.Embedding(num_embeddings=10000, embedding_dim=128)

# Input: token indices
tokens = torch.tensor([[1, 45, 892, 3, 0]])  # (batch=1, seq_len=5)

# Output: dense vectors
vectors = embedding(tokens)  # (1, 5, 128)
```

**Key concepts:**

| Feature | Description |
|---------|-------------|
| Learned | Embeddings are trained with the model |
| Dense | Each word becomes a dense vector (not one-hot) |
| Semantic | Similar words get similar vectors |
| Padding | Use `padding_idx=0` to keep padding at zero |
| Pretrained | Can initialize with Word2Vec, GloVe, etc. |

### Using Pretrained Embeddings

```python
# Load pretrained embeddings (e.g., from GloVe)
pretrained_weights = load_glove_vectors()  # (vocab_size, embed_dim)

embedding = nn.Embedding.from_pretrained(
    torch.tensor(pretrained_weights),
    freeze=False  # Allow fine-tuning
)
```

---

## Code Example: Simple Encoder-Decoder Model

Let's build a complete encoder-decoder for sequence-to-sequence tasks:

```python
import torch
import torch.nn as nn
import torch.optim as optim

# ============================================================
# Step 1: Define Encoder
# ============================================================

class Encoder(nn.Module):
    """Encodes input sequence into a context vector."""

    def __init__(self, vocab_size, embed_dim, hidden_size, num_layers=1,
                 dropout=0.1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embed_dim, hidden_size, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, src):
        # src: (batch, src_len)
        embedded = self.dropout(self.embedding(src))  # (batch, src_len, embed)
        outputs, (hidden, cell) = self.lstm(embedded)
        # hidden: (num_layers, batch, hidden_size)
        # cell: (num_layers, batch, hidden_size)
        return outputs, hidden, cell

# ============================================================
# Step 2: Define Decoder
# ============================================================

class Decoder(nn.Module):
    """Decodes context into output sequence, one token at a time."""

    def __init__(self, vocab_size, embed_dim, hidden_size, num_layers=1,
                 dropout=0.1):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(
            embed_dim, hidden_size, num_layers,
            batch_first=True, dropout=dropout if num_layers > 1 else 0
        )
        self.fc_out = nn.Linear(hidden_size, vocab_size)
        self.dropout = nn.Dropout(dropout)

    def forward(self, input_token, hidden, cell):
        # input_token: (batch, 1) — one token at a time
        embedded = self.dropout(self.embedding(input_token))  # (batch, 1, embed)
        output, (hidden, cell) = self.lstm(embedded, (hidden, cell))
        # output: (batch, 1, hidden_size)
        prediction = self.fc_out(output.squeeze(1))  # (batch, vocab_size)
        return prediction, hidden, cell

# ============================================================
# Step 3: Define Seq2Seq Model
# ============================================================

class Seq2Seq(nn.Module):
    """Complete encoder-decoder sequence-to-sequence model."""

    def __init__(self, encoder, decoder, device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(self, src, trg, teacher_forcing_ratio=0.5):
        # src: (batch, src_len)
        # trg: (batch, trg_len)
        batch_size = src.size(0)
        trg_len = trg.size(1)
        trg_vocab_size = self.decoder.fc_out.out_features

        # Store decoder outputs
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size,
                            device=self.device)

        # Encode
        _, hidden, cell = self.encoder(src)

        # First decoder input is <SOS> token
        decoder_input = trg[:, 0:1]  # (batch, 1)

        for t in range(1, trg_len):
            # Decode one step
            prediction, hidden, cell = self.decoder(decoder_input, hidden, cell)
            outputs[:, t] = prediction

            # Teacher forcing decision
            use_teacher = torch.rand(1).item() < teacher_forcing_ratio
            if use_teacher:
                decoder_input = trg[:, t:t+1]
            else:
                decoder_input = prediction.argmax(dim=-1, keepdim=True)

        return outputs

# ============================================================
# Step 4: Create and Train
# ============================================================

# Configuration
SRC_VOCAB = 1000
TRG_VOCAB = 1200
EMBED_DIM = 64
HIDDEN_SIZE = 128
NUM_LAYERS = 2
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Create model
encoder = Encoder(SRC_VOCAB, EMBED_DIM, HIDDEN_SIZE, NUM_LAYERS)
decoder = Decoder(TRG_VOCAB, EMBED_DIM, HIDDEN_SIZE, NUM_LAYERS)
model = Seq2Seq(encoder, decoder, DEVICE).to(DEVICE)

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
print(f"Model parameters: {total_params:,}")

# Loss and optimizer (ignore padding index)
criterion = nn.CrossEntropyLoss(ignore_index=0)
optimizer = optim.Adam(model.parameters(), lr=0.001)

# ============================================================
# Step 5: Training Loop (Demonstration)
# ============================================================

# Simulate a batch of data
# In practice, load real parallel corpus data
batch_size = 16
src_len = 12
trg_len = 15

# Random source and target sequences
src = torch.randint(1, SRC_VOCAB, (batch_size, src_len)).to(DEVICE)
trg = torch.randint(1, TRG_VOCAB, (batch_size, trg_len)).to(DEVICE)

# One training step
model.train()
optimizer.zero_grad()
output = model(src, trg, teacher_forcing_ratio=0.5)

# Reshape for loss: (batch * trg_len, vocab) vs (batch * trg_len)
output_flat = output[:, 1:].reshape(-1, TRG_VOCAB)
target_flat = trg[:, 1:].reshape(-1)
loss = criterion(output_flat, target_flat)

loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()

print(f"Training loss: {loss.item():.4f}")

# ============================================================
# Step 6: Inference (Greedy Decoding)
# ============================================================

def translate(model, src_sequence, max_len=50, sos_token=1, eos_token=2):
    """Generate translation using greedy decoding."""
    model.eval()
    with torch.no_grad():
        # Encode
        src = src_sequence.unsqueeze(0).to(DEVICE)  # (1, src_len)
        _, hidden, cell = model.encoder(src)

        # Start with <SOS>
        decoder_input = torch.tensor([[sos_token]], device=DEVICE)
        output_tokens = [sos_token]

        for _ in range(max_len):
            prediction, hidden, cell = model.decoder(decoder_input, hidden, cell)
            next_token = prediction.argmax(dim=-1).item()
            output_tokens.append(next_token)

            if next_token == eos_token:
                break

            decoder_input = torch.tensor([[next_token]], device=DEVICE)

    return output_tokens

# Test inference
test_src = torch.randint(1, SRC_VOCAB, (10,))
result = translate(model, test_src)
print(f"Source length: {len(test_src)}, Output length: {len(result)}")
```

---

## Common Patterns and Tips

| Pattern | Use Case |
|---------|----------|
| Bidirectional encoder | Always for encoder (sees full input) |
| Unidirectional decoder | Always for decoder (generates left-to-right) |
| Attention | Must-have for sequences > 20 tokens |
| Copy mechanism | When output may copy from input (summarization) |
| Shared embeddings | When source and target share vocabulary |

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Encoder-decoder | Split model into reading and generating parts |
| Context vector | Encoder's final state passed to decoder |
| Teacher forcing | Use ground truth as decoder input during training |
| Beam search | Keep top-k hypotheses for better decoding |
| Attention | Let decoder focus on relevant encoder states |
| Sequence labeling | Output same-length tag sequence (POS, NER) |
| nn.Embedding | Convert word indices to dense vectors |

---

## What's Next?

In the next lesson, you'll apply these sequence modeling concepts to a practical problem: **Time Series Forecasting** — predicting future values from historical data using LSTM and GRU networks.
