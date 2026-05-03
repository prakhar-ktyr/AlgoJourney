---
title: Text Processing with RNNs
---

# Text Processing with RNNs

In this lesson, you will learn how to process text data using Recurrent Neural Networks (RNNs). Text is sequential — word order matters — making RNNs a natural fit.

---

## The Text Processing Pipeline

Processing text with neural networks follows a standard pipeline:

```
Raw Text → Tokenize → Numericalize → Embed → RNN → Output
```

| Step | What It Does |
|------|-------------|
| Tokenize | Split text into words or characters |
| Numericalize | Convert tokens to integer IDs |
| Embed | Map IDs to dense vectors |
| RNN | Process the sequence |
| Output | Classify, generate, or translate |

---

## Step 1: Tokenization

Tokenization splits raw text into individual units (tokens):

```python
import torch
import torch.nn as nn

# Simple word-level tokenization
text = "Deep learning is amazing"
tokens = text.lower().split()
print(tokens)
# ['deep', 'learning', 'is', 'amazing']
```

For real projects, use a proper tokenizer:

```python
# Building a vocabulary from a corpus
corpus = [
    "deep learning is great",
    "neural networks are powerful",
    "deep networks learn features",
]

# Collect all unique words
word_set = set()
for sentence in corpus:
    for word in sentence.lower().split():
        word_set.add(word)

# Create word-to-index mapping
vocab = {word: idx + 2 for idx, word in enumerate(sorted(word_set))}
vocab["<pad>"] = 0  # Padding token
vocab["<unk>"] = 1  # Unknown token

print(f"Vocabulary size: {len(vocab)}")
print(vocab)
```

---

## Step 2: Numericalization

Convert tokens to their integer IDs:

```python
def numericalize(sentence, vocab):
    """Convert a sentence to a list of token IDs."""
    tokens = sentence.lower().split()
    return [vocab.get(word, vocab["<unk>"]) for word in tokens]

# Example
sentence = "deep learning is great"
token_ids = numericalize(sentence, vocab)
print(f"Token IDs: {token_ids}")
```

---

## Step 3: Word Embeddings

Word embeddings map discrete token IDs to continuous vectors. Each word gets a dense vector that captures its meaning.

### Using nn.Embedding

```python
# Create an embedding layer
vocab_size = len(vocab)
embed_dim = 50

embedding = nn.Embedding(
    num_embeddings=vocab_size,
    embedding_dim=embed_dim,
    padding_idx=0  # Padding vectors stay zero
)

# Embed a sequence
token_ids_tensor = torch.tensor([token_ids])  # Shape: (1, seq_len)
embedded = embedding(token_ids_tensor)
print(f"Input shape: {token_ids_tensor.shape}")
print(f"Embedded shape: {embedded.shape}")
# Embedded shape: torch.Size([1, 4, 50])
```

The embedding layer is a lookup table:
- Input: token ID (integer)
- Output: dense vector of size `embed_dim`

### Pre-trained Embeddings (GloVe)

Pre-trained embeddings like GloVe capture semantic relationships learned from large corpora:

```python
import numpy as np

def load_glove_embeddings(glove_path, vocab, embed_dim=50):
    """Load GloVe vectors for words in our vocabulary."""
    embeddings = np.zeros((len(vocab), embed_dim))

    with open(glove_path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.split()
            word = parts[0]
            if word in vocab:
                idx = vocab[word]
                vector = np.array(parts[1:], dtype=np.float32)
                embeddings[idx] = vector

    return torch.tensor(embeddings, dtype=torch.float32)

# Load pre-trained vectors into the embedding layer
# pretrained_weights = load_glove_embeddings("glove.6B.50d.txt", vocab)
# embedding = nn.Embedding.from_pretrained(pretrained_weights, freeze=False)
```

> **Tip:** Set `freeze=False` to fine-tune embeddings during training, or `freeze=True` to keep them fixed.

---

## Padding Sequences

Sentences have different lengths. We must pad them to the same length for batching.

### Using pad_sequence

```python
from torch.nn.utils.rnn import pad_sequence, pack_padded_sequence, pad_packed_sequence

# Three sentences of different lengths
sentences = [
    torch.tensor([2, 3, 4, 5]),     # 4 words
    torch.tensor([6, 7]),            # 2 words
    torch.tensor([8, 9, 10, 11, 12])  # 5 words
]

# Pad to the same length (longest sentence)
padded = pad_sequence(sentences, batch_first=True, padding_value=0)
print(f"Padded shape: {padded.shape}")
print(padded)
# tensor([[ 2,  3,  4,  5,  0],
#         [ 6,  7,  0,  0,  0],
#         [ 8,  9, 10, 11, 12]])
```

### Using pack_padded_sequence

Packing tells the RNN to skip padding tokens — this speeds up training and improves results:

```python
# Track the original lengths
lengths = torch.tensor([4, 2, 5])

# Sort by length (descending) — required for packing
sorted_lengths, sort_idx = lengths.sort(descending=True)
sorted_padded = padded[sort_idx]

# Embed the padded sequences
embedded_padded = embedding(sorted_padded)

# Pack the embedded sequences
packed = pack_padded_sequence(
    embedded_padded,
    sorted_lengths.cpu(),
    batch_first=True
)

print(f"Packed data shape: {packed.data.shape}")
```

### Unpacking After RNN

```python
# Pass through RNN
rnn = nn.LSTM(input_size=50, hidden_size=128, batch_first=True)
packed_output, (hidden, cell) = rnn(packed)

# Unpack the output
output, output_lengths = pad_packed_sequence(packed_output, batch_first=True)
print(f"Unpacked output shape: {output.shape}")
```

---

## Text Classification with LSTM

Let's build a complete sentiment classification model:

```python
class TextClassifier(nn.Module):
    """LSTM-based text classifier."""

    def __init__(self, vocab_size, embed_dim, hidden_dim, num_classes,
                 num_layers=2, dropout=0.3, pad_idx=0):
        super().__init__()
        self.embedding = nn.Embedding(
            vocab_size, embed_dim, padding_idx=pad_idx
        )
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
            bidirectional=True,
        )
        # Bidirectional doubles the hidden size
        self.fc = nn.Linear(hidden_dim * 2, num_classes)
        self.dropout = nn.Dropout(dropout)

    def forward(self, text, lengths):
        # text shape: (batch, seq_len)
        embedded = self.dropout(self.embedding(text))

        # Pack padded sequences
        packed = pack_padded_sequence(
            embedded, lengths.cpu(), batch_first=True, enforce_sorted=False
        )

        # LSTM forward pass
        packed_output, (hidden, cell) = self.lstm(packed)

        # Concatenate final hidden states from both directions
        # hidden shape: (num_layers * 2, batch, hidden_dim)
        hidden_fwd = hidden[-2]  # Last layer forward
        hidden_bwd = hidden[-1]  # Last layer backward
        hidden_cat = torch.cat([hidden_fwd, hidden_bwd], dim=1)

        # Classify
        output = self.fc(self.dropout(hidden_cat))
        return output
```

### Training the Classifier

```python
# Hyperparameters
VOCAB_SIZE = 10000
EMBED_DIM = 100
HIDDEN_DIM = 256
NUM_CLASSES = 2  # Positive / Negative
LEARNING_RATE = 0.001

# Create model
model = TextClassifier(VOCAB_SIZE, EMBED_DIM, HIDDEN_DIM, NUM_CLASSES)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

# Training loop (simplified)
def train_epoch(model, dataloader, criterion, optimizer):
    model.train()
    total_loss = 0

    for texts, lengths, labels in dataloader:
        optimizer.zero_grad()
        predictions = model(texts, lengths)
        loss = criterion(predictions, labels)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    return total_loss / len(dataloader)

# Evaluate
def evaluate(model, dataloader):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for texts, lengths, labels in dataloader:
            predictions = model(texts, lengths)
            predicted_classes = predictions.argmax(dim=1)
            correct += (predicted_classes == labels).sum().item()
            total += labels.size(0)

    return correct / total
```

---

## Text Generation with Character-Level RNN

Character-level models generate text one character at a time:

```python
class CharRNN(nn.Module):
    """Character-level RNN for text generation."""

    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers=2):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            embed_dim, hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2,
        )
        self.fc = nn.Linear(hidden_dim, vocab_size)

    def forward(self, x, hidden=None):
        embedded = self.embedding(x)
        output, hidden = self.lstm(embedded, hidden)
        logits = self.fc(output)
        return logits, hidden

    def init_hidden(self, batch_size, device):
        """Initialize hidden state with zeros."""
        h0 = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        c0 = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        return (h0, c0)
```

### Generating Text

```python
def generate_text(model, start_str, char_to_idx, idx_to_char,
                  length=200, temperature=0.8):
    """Generate text character by character."""
    model.eval()
    device = next(model.parameters()).device

    # Convert start string to tensor
    chars = [char_to_idx.get(c, 0) for c in start_str]
    input_seq = torch.tensor([chars]).to(device)

    # Initialize hidden state
    hidden = model.init_hidden(1, device)

    # Feed the start string
    output, hidden = model(input_seq, hidden)

    # Generate new characters
    generated = list(start_str)

    for _ in range(length):
        # Get the last character's logits
        last_logits = output[0, -1, :] / temperature

        # Sample from the distribution
        probs = torch.softmax(last_logits, dim=0)
        next_idx = torch.multinomial(probs, 1).item()
        next_char = idx_to_char[next_idx]

        generated.append(next_char)

        # Prepare next input
        next_input = torch.tensor([[next_idx]]).to(device)
        output, hidden = model(next_input, hidden)

    return "".join(generated)

# Usage example:
# text = generate_text(model, "The ", char_to_idx, idx_to_char)
# print(text)
```

### Temperature Sampling

The `temperature` parameter controls randomness:

| Temperature | Effect |
|------------|--------|
| 0.2 | Very conservative, repetitive |
| 0.8 | Balanced creativity |
| 1.0 | Standard sampling |
| 1.5 | Very creative, may be incoherent |

Lower temperature → more predictable. Higher temperature → more diverse.

---

## Complete Example: Training a Text Classifier

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torch.nn.utils.rnn import pad_sequence

# --- Dataset ---
class TextDataset(Dataset):
    def __init__(self, texts, labels, vocab, max_len=100):
        self.texts = texts
        self.labels = labels
        self.vocab = vocab
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        tokens = self.texts[idx].lower().split()[:self.max_len]
        ids = [self.vocab.get(w, 1) for w in tokens]
        return torch.tensor(ids), self.labels[idx]

def collate_fn(batch):
    """Custom collate to handle variable-length sequences."""
    texts, labels = zip(*batch)
    lengths = torch.tensor([len(t) for t in texts])
    padded_texts = pad_sequence(texts, batch_first=True, padding_value=0)
    labels = torch.tensor(labels)
    return padded_texts, lengths, labels

# --- Build vocabulary and create dataloaders ---
# train_dataset = TextDataset(train_texts, train_labels, vocab)
# train_loader = DataLoader(
#     train_dataset, batch_size=32, shuffle=True, collate_fn=collate_fn
# )

# --- Training ---
# for epoch in range(10):
#     loss = train_epoch(model, train_loader, criterion, optimizer)
#     acc = evaluate(model, val_loader)
#     print(f"Epoch {epoch+1}: Loss={loss:.4f}, Accuracy={acc:.4f}")
```

---

## Summary

In this lesson, you learned:

| Concept | Key Takeaway |
|---------|-------------|
| Text pipeline | Tokenize → Numericalize → Embed → RNN → Output |
| nn.Embedding | Lookup table mapping token IDs to dense vectors |
| Pre-trained (GloVe) | Transfer learning for word representations |
| Padding & packing | Handle variable-length sequences efficiently |
| Text classification | Bidirectional LSTM + final hidden state → classes |
| Text generation | Character-level RNN + temperature sampling |

---

## Exercises

1. Build a sentiment classifier on movie reviews using a bidirectional LSTM
2. Train a character-level RNN on Shakespeare text and generate new passages
3. Compare the effect of different embedding dimensions (50, 100, 300) on classification accuracy
4. Implement top-k sampling as an alternative to temperature sampling for text generation

---

In the next lesson, you will learn about **Attention Mechanisms** — a breakthrough that lets models focus on the most relevant parts of the input sequence.
