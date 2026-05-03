---
title: Modern Tokenization
---

# Modern Tokenization

Tokenization — splitting text into units — is a foundational step in NLP. Modern tokenizers use **subword** algorithms that balance vocabulary size with the ability to handle any text, including rare words and new terms.

---

## The Vocabulary Problem

### Why Simple Tokenization Fails

**Word-level tokenization** has critical limitations:

```
Vocabulary: ["the", "cat", "sat", "on", "mat", ...]

Problem 1: Unknown words
  Input: "transformerization"
  Result: [UNK]  ← Lost all information!

Problem 2: Huge vocabulary
  English has ~170,000 words
  + Proper nouns, technical terms, typos...
  Vocabulary could be 500,000+ tokens

Problem 3: No sharing across word forms
  "run", "running", "runner", "runs" → 4 separate tokens
  Model must learn each independently
```

**Character-level tokenization** has different problems:

```
Input: "Hello world"
Tokens: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd']

Problem 1: Sequences become very long (slow processing)
Problem 2: Individual characters carry little meaning
Problem 3: Model must learn to compose meaning from scratch
```

### The Subword Solution

Subword tokenization is the **sweet spot**:

```
Input: "transformerization"
Subword tokens: ["transform", "er", "ization"]

✓ Common words stay intact: "the" → ["the"]
✓ Rare words split meaningfully: "unhappiness" → ["un", "happiness"]
✓ Manageable vocabulary: ~30,000-50,000 tokens
✓ No unknown tokens (can always fall back to characters)
```

---

## Byte Pair Encoding (BPE)

**BPE** is the tokenizer used by GPT-2, GPT-3, GPT-4, and many other models. Originally a data compression algorithm, it was adapted for NLP.

### How BPE Works

1. Start with a vocabulary of individual characters
2. Count all adjacent pairs in the training text
3. Merge the most frequent pair into a new token
4. Repeat until desired vocabulary size

### Algorithm Walkthrough

```
Training corpus: "low lower lowest low"

Step 0: Split into characters
  Vocabulary: {l, o, w, e, r, s, t, _, <end>}
  Tokens: l o w <end>   l o w e r <end>   l o w e s t <end>   l o w <end>

Step 1: Count pairs
  (l, o): 4  ← MOST FREQUENT
  (o, w): 4
  (w, <end>): 2
  (w, e): 2
  (e, r): 1
  (e, s): 1
  (s, t): 1
  ...

Step 2: Merge (l, o) → "lo"
  Vocabulary: {l, o, w, e, r, s, t, _, <end>, lo}
  Tokens: lo w <end>   lo w e r <end>   lo w e s t <end>   lo w <end>

Step 3: Count pairs again
  (lo, w): 4  ← MOST FREQUENT
  (w, <end>): 2
  (w, e): 2
  ...

Step 4: Merge (lo, w) → "low"
  Vocabulary: {l, o, w, e, r, s, t, _, <end>, lo, low}
  Tokens: low <end>   low e r <end>   low e s t <end>   low <end>

Step 5: Count pairs
  (low, <end>): 2
  (low, e): 2  ← TIE, pick one
  (e, r): 1
  (e, s): 1
  ...

Step 6: Merge (low, <end>) → "low<end>"
  ...

Continue until vocabulary reaches desired size (e.g., 50,000)
```

### BPE Properties

- **Frequency-based**: common words/subwords get their own tokens
- **Deterministic**: same training data → same vocabulary
- **Greedy**: always merges the most frequent pair
- **No unknown tokens**: worst case falls back to characters

### BPE Tokenization Example

```
Vocabulary after training: {a, b, c, ..., z, th, the, ing, er, est, ...}

Tokenizing "unbreakable":
  Start: u n b r e a k a b l e
  Apply merges in order learned:
  → un b r e a k a b le
  → un br e a k ab le
  → un bre ak ab le
  → un break ab le
  → un break able
  Final: ["un", "break", "able"]
```

---

## WordPiece: BERT's Tokenizer

**WordPiece** is used by BERT, DistilBERT, and ELECTRA. It's similar to BPE but uses a **likelihood-based** scoring for merges.

### How WordPiece Differs from BPE

Instead of merging the most **frequent** pair, WordPiece merges the pair that **maximizes likelihood**:

$$\text{score}(x, y) = \frac{\text{freq}(xy)}{\text{freq}(x) \times \text{freq}(y)}$$

This prefers merges where the combined token is more common **relative to** the individual frequencies.

### Example Comparison

```
Corpus: "hug" appears 10 times, "hugs" appears 5 times
         "h" appears 100 times, "u" appears 50 times
         "hu" appears 15 times, "g" appears 80 times

BPE score (frequency only):
  (h, u): frequency of "hu" = 15

WordPiece score (relative frequency):
  score(h, u) = freq(hu) / (freq(h) × freq(u))
              = 15 / (100 × 50) = 0.003

  score(u, g) = freq(ug) / (freq(u) × freq(g))
              = 15 / (50 × 80) = 0.00375  ← Higher!

WordPiece prefers merging (u, g) because "ug" is more
surprising/informative relative to individual frequencies.
```

### WordPiece Special Features

```python
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# WordPiece uses ## prefix for continuation subwords
text = "unbreakable"
tokens = tokenizer.tokenize(text)
print(tokens)
# ['un', '##break', '##able']

# The ## means "this continues the previous token"
# Without ##: start of a new word
# With ##: continuation of current word

# Another example
text = "embeddings"
tokens = tokenizer.tokenize(text)
print(tokens)
# ['em', '##bed', '##ding', '##s']

# Full encoding
text = "Tokenization is fascinating!"
tokens = tokenizer.tokenize(text)
print(tokens)
# ['token', '##ization', 'is', 'fascinating', '!']
```

### WordPiece Algorithm

```
1. Initialize vocabulary with all characters + ## variants
2. For each potential merge:
   - Calculate score = freq(merged) / (freq(piece1) × freq(piece2))
3. Merge the pair with highest score
4. Repeat until desired vocabulary size

Key difference from BPE:
- BPE: merge most FREQUENT pair
- WordPiece: merge pair with highest LIKELIHOOD SCORE
```

---

## SentencePiece

**SentencePiece** is a language-agnostic tokenizer that treats text as a **raw stream of characters** (including spaces). Used by T5, ALBERT, XLNet, and many multilingual models.

### Key Innovation: Language Agnostic

```
Traditional tokenizers:
  "Hello world" → split by spaces → ["Hello", "world"] → subword split

SentencePiece:
  "Hello world" → treat as raw characters → "▁Hello▁world" → subword split

The ▁ character represents a space. This means:
- No language-specific pre-processing needed
- Works for Japanese, Chinese (no spaces between words)
- Spaces are part of the vocabulary, not separators
```

### Why This Matters

```
English: "I love NLP" → spaces separate words (easy)
Japanese: "私は自然言語処理が好きです" → no spaces! (hard)
Chinese: "我喜欢自然语言处理" → no spaces! (hard)

SentencePiece handles ALL of these uniformly by treating
the raw text as a sequence of characters.
```

### SentencePiece Example

```python
# SentencePiece with T5 tokenizer
from transformers import T5Tokenizer

tokenizer = T5Tokenizer.from_pretrained("t5-small")

text = "Hello, how are you?"
tokens = tokenizer.tokenize(text)
print(tokens)
# ['▁Hello', ',', '▁how', '▁are', '▁you', '?']

# The ▁ indicates "space before this token"
# Allows perfect reconstruction: join tokens and replace ▁ with space

# Encode and decode
ids = tokenizer.encode(text)
decoded = tokenizer.decode(ids)
print(f"Original: '{text}'")
print(f"Decoded:  '{decoded}'")
# Perfect reconstruction!
```

### SentencePiece Training Modes

SentencePiece supports two subword algorithms:

1. **BPE mode**: Same as BPE but on raw characters
2. **Unigram mode**: Probabilistic approach (default)

```python
# Training SentencePiece (standalone library)
import sentencepiece as spm

# Train a SentencePiece model
spm.SentencePieceTrainer.train(
    input="training_text.txt",
    model_prefix="my_tokenizer",
    vocab_size=8000,
    model_type="bpe"  # or "unigram"
)

# Load and use
sp = spm.SentencePieceProcessor()
sp.load("my_tokenizer.model")

# Encode
tokens = sp.encode_as_pieces("Hello world!")
print(tokens)  # ['▁Hello', '▁world', '!']

ids = sp.encode_as_ids("Hello world!")
print(ids)  # [234, 1567, 89]

# Decode
text = sp.decode_pieces(['▁Hello', '▁world', '!'])
print(text)  # "Hello world!"
```

---

## Unigram Model

The **Unigram** model takes a probabilistic approach to tokenization. Instead of greedily merging pairs, it starts with a large vocabulary and **removes** tokens that contribute least.

### How Unigram Works

1. Start with a large initial vocabulary (all substrings up to length N)
2. Compute the probability of each token using the unigram language model
3. For each token, compute how much the overall likelihood decreases if removed
4. Remove tokens that decrease likelihood the least
5. Repeat until desired vocabulary size

### The Unigram Language Model

For a sentence $x$ tokenized as $(x_1, x_2, \ldots, x_M)$:

$$P(x) = \prod_{i=1}^{M} P(x_i)$$

Each token has a probability: $P(x_i) = \frac{\text{count}(x_i)}{\sum_j \text{count}(x_j)}$

### Tokenization with Unigram

Unlike BPE (which has one deterministic segmentation), Unigram can produce **multiple possible segmentations** and picks the most probable:

```
Input: "unbreakable"

Possible segmentations:
  ["un", "break", "able"]     → P = 0.003 × 0.015 × 0.008 = 3.6e-7
  ["un", "breakable"]         → P = 0.003 × 0.001 = 3.0e-6  ← BEST
  ["unbreak", "able"]         → P = 0.0001 × 0.008 = 8.0e-7
  ["u", "n", "b", "r", ...]  → P = very small

Choose: ["un", "breakable"] (highest probability)
```

### Viterbi Algorithm for Best Segmentation

Finding the optimal segmentation uses the Viterbi algorithm:

$$\text{best\_segmentation}(x) = \arg\max_{\mathbf{s}} \prod_{i=1}^{|\mathbf{s}|} P(s_i)$$

```
"unbreakable" tokenization with Viterbi:

Position:  u  n  b  r  e  a  k  a  b  l  e
           0  1  2  3  4  5  6  7  8  9  10

Best path to position 2: "un" (prob = 0.003)
Best path to position 7: "un" + "break" (prob = 0.003 × 0.015)
Best path to position 10: "un" + "breakable" (prob = 0.003 × 0.001)
                     OR: "un" + "break" + "able" (prob = 0.003 × 0.015 × 0.008)

Compare: 3.0e-6 vs 3.6e-7 → "un" + "breakable" wins
```

---

## Comparison Table

| Feature | BPE | WordPiece | SentencePiece | Unigram |
|---------|-----|-----------|---------------|---------|
| Used by | GPT-2/3/4, RoBERTa | BERT, DistilBERT | T5, ALBERT, XLNet | Part of SentencePiece |
| Merge criterion | Frequency | Likelihood score | BPE or Unigram | Probability-based |
| Direction | Bottom-up (merge) | Bottom-up (merge) | Either | Top-down (prune) |
| Deterministic | Yes | Yes | Depends on mode | Probabilistic |
| Language agnostic | No (needs pre-tokenization) | No | **Yes** | **Yes** |
| Handles spaces | As word boundaries | As word boundaries | As characters (▁) | As characters |
| Continuation marker | None (GPT) / Ġ | ## prefix | ▁ for word start | ▁ for word start |
| Vocabulary building | Merge frequent pairs | Merge high-score pairs | Depends on mode | Remove least useful |

---

## Hugging Face Tokenizers Library

The `tokenizers` library provides fast, production-ready tokenizers:

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE, WordPiece, Unigram
from tokenizers.trainers import BpeTrainer, WordPieceTrainer
from tokenizers.pre_tokenizers import Whitespace

# ============================================
# Train a BPE tokenizer from scratch
# ============================================

# Initialize a BPE tokenizer
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))

# Set pre-tokenizer (split on whitespace first)
tokenizer.pre_tokenizer = Whitespace()

# Configure trainer
trainer = BpeTrainer(
    vocab_size=5000,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    min_frequency=2
)

# Training data (list of files or strings)
training_files = ["training_text.txt"]

# Train!
tokenizer.train(training_files, trainer)

# Use the trained tokenizer
output = tokenizer.encode("Hello, this is a test sentence!")
print(f"Tokens: {output.tokens}")
print(f"IDs: {output.ids}")

# Save
tokenizer.save("my-bpe-tokenizer.json")

# Load
loaded_tokenizer = Tokenizer.from_file("my-bpe-tokenizer.json")
```

### Training a WordPiece Tokenizer

```python
from tokenizers import Tokenizer
from tokenizers.models import WordPiece
from tokenizers.trainers import WordPieceTrainer
from tokenizers.pre_tokenizers import Whitespace

# Initialize WordPiece tokenizer
tokenizer = Tokenizer(WordPiece(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# Configure trainer
trainer = WordPieceTrainer(
    vocab_size=5000,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    min_frequency=2,
    continuing_subword_prefix="##"
)

# Train on files
tokenizer.train(["training_text.txt"], trainer)

# Test
output = tokenizer.encode("transformerization")
print(f"Tokens: {output.tokens}")
# Might produce: ['transform', '##er', '##ization']
```

---

## Comparing Tokenizer Outputs

```python
from transformers import AutoTokenizer

# Load different tokenizers
bert_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")      # WordPiece
gpt2_tokenizer = AutoTokenizer.from_pretrained("gpt2")                   # BPE
t5_tokenizer = AutoTokenizer.from_pretrained("t5-small")                 # SentencePiece

# Compare on the same text
texts = [
    "Hello world!",
    "transformerization",
    "I can't believe it's not butter!",
    "The quick brown fox jumps",
    "pneumonoultramicroscopicsilicovolcanoconiosis"
]

print(f"{'Text':<50} {'BERT (WordPiece)':<30} {'GPT-2 (BPE)':<30} {'T5 (SP)':<30}")
print("=" * 140)

for text in texts:
    bert_tokens = bert_tokenizer.tokenize(text)
    gpt2_tokens = gpt2_tokenizer.tokenize(text)
    t5_tokens = t5_tokenizer.tokenize(text)

    print(f"{text:<50} {str(bert_tokens):<30} {str(gpt2_tokens):<30} {str(t5_tokens):<30}")
```

### Token Count Comparison

```python
from transformers import AutoTokenizer

tokenizers = {
    "BERT (WordPiece)": AutoTokenizer.from_pretrained("bert-base-uncased"),
    "GPT-2 (BPE)": AutoTokenizer.from_pretrained("gpt2"),
    "T5 (SentencePiece)": AutoTokenizer.from_pretrained("t5-small"),
}

text = "Natural language processing with transformers is revolutionizing AI."

print(f"Text: '{text}'\n")
print(f"{'Tokenizer':<25} {'Num Tokens':<12} {'Tokens'}")
print("-" * 80)

for name, tok in tokenizers.items():
    tokens = tok.tokenize(text)
    print(f"{name:<25} {len(tokens):<12} {tokens}")
```

---

## Train a BPE Tokenizer from Scratch

Complete example of training your own tokenizer:

```python
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import ByteLevel
from tokenizers.processors import TemplateProcessing
import os

# ============================================
# Step 1: Prepare training data
# ============================================

# Create sample training text
training_text = """
Natural language processing is a subfield of artificial intelligence.
It focuses on the interaction between computers and human language.
Machine learning models can understand and generate human text.
Transformers have revolutionized the field of NLP.
BERT uses bidirectional attention for language understanding.
GPT uses autoregressive generation for text production.
Transfer learning allows models to leverage pre-trained knowledge.
Fine-tuning adapts pre-trained models to specific tasks.
Tokenization is the first step in any NLP pipeline.
Subword tokenization handles rare and unknown words gracefully.
"""

# Save to file (tokenizers library trains from files)
with open("train_corpus.txt", "w") as f:
    # Repeat to simulate larger corpus
    f.write(training_text * 100)

# ============================================
# Step 2: Configure and train BPE tokenizer
# ============================================

# Initialize tokenizer with BPE model
tokenizer = Tokenizer(BPE(unk_token="<unk>"))

# Pre-tokenizer: how to split before BPE
# ByteLevel handles all Unicode and uses Ġ for spaces
tokenizer.pre_tokenizer = ByteLevel(add_prefix_space=True)

# Configure the trainer
trainer = BpeTrainer(
    vocab_size=1000,  # Small vocab for demonstration
    special_tokens=["<unk>", "<s>", "</s>", "<pad>", "<mask>"],
    min_frequency=2,
    show_progress=True
)

# Train!
tokenizer.train(["train_corpus.txt"], trainer)

print(f"Vocabulary size: {tokenizer.get_vocab_size()}")

# ============================================
# Step 3: Add post-processing (special tokens)
# ============================================

tokenizer.post_processor = TemplateProcessing(
    single="<s> $A </s>",
    pair="<s> $A </s> $B </s>",
    special_tokens=[
        ("<s>", tokenizer.token_to_id("<s>")),
        ("</s>", tokenizer.token_to_id("</s>")),
    ],
)

# ============================================
# Step 4: Test the tokenizer
# ============================================

test_sentences = [
    "Natural language processing is amazing!",
    "Transformers changed everything.",
    "This is an unseen sentence about tokenization.",
    "Supercalifragilisticexpialidocious",  # Very rare word
]

for sentence in test_sentences:
    output = tokenizer.encode(sentence)
    print(f"\nInput: '{sentence}'")
    print(f"Tokens ({len(output.tokens)}): {output.tokens}")
    print(f"IDs: {output.ids}")

    # Decode back
    decoded = tokenizer.decode(output.ids)
    print(f"Decoded: '{decoded}'")

# ============================================
# Step 5: Save and reload
# ============================================

tokenizer.save("my-custom-bpe.json")
loaded = Tokenizer.from_file("my-custom-bpe.json")

# Verify it works
result = loaded.encode("Testing the loaded tokenizer!")
print(f"\nLoaded tokenizer test: {result.tokens}")

# Clean up
os.remove("train_corpus.txt")
```

---

## Vocabulary Size Impact

The choice of vocabulary size affects model behavior:

$$\text{Sequence Length} \propto \frac{1}{\text{Vocab Size}}$$

```
Small vocabulary (1000 tokens):
  "Hello" → ["He", "ll", "o"]  (3 tokens, longer sequences)
  + Smaller embedding matrix
  - Longer sequences (slower)
  - Less semantic meaning per token

Large vocabulary (100000 tokens):
  "Hello" → ["Hello"]  (1 token, shorter sequences)
  + Shorter sequences (faster)
  + More meaning per token
  - Larger embedding matrix (more memory)
  - Rare tokens poorly trained

Sweet spot: 30,000 - 50,000 tokens
  BERT: 30,522
  GPT-2: 50,257
  T5: 32,000
```

---

## Fast vs Slow Tokenizers

Hugging Face provides two tokenizer implementations:

```python
from transformers import AutoTokenizer

# Slow tokenizer (Python)
slow_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased", use_fast=False)

# Fast tokenizer (Rust-based, default)
fast_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased", use_fast=True)

# Fast tokenizer additional features:
text = "Hugging Face is based in New York City"
encoding = fast_tokenizer(text, return_offsets_mapping=True)

# Offset mapping: maps tokens back to original text positions
print("Token → Original text span:")
tokens = fast_tokenizer.convert_ids_to_tokens(encoding["input_ids"])
for token, (start, end) in zip(tokens, encoding["offset_mapping"]):
    if start != end:  # Skip special tokens
        print(f"  '{token}' → text[{start}:{end}] = '{text[start:end]}'")
```

### Speed Comparison

```
Tokenizing 10,000 sentences:
  Slow (Python):  ~12 seconds
  Fast (Rust):    ~0.3 seconds  (40× faster!)

The fast tokenizer is the default in recent versions.
```

---

## Summary

| Tokenizer | Algorithm | Used By | Key Feature |
|-----------|-----------|---------|-------------|
| BPE | Merge frequent pairs | GPT-2/3/4 | Simple, effective |
| WordPiece | Merge by likelihood | BERT | ## continuation prefix |
| SentencePiece | Raw character stream | T5, XLNet | Language agnostic |
| Unigram | Probabilistic pruning | (within SentencePiece) | Multiple segmentations |

---

## Key Takeaways

1. **Subword tokenization** solves the vocabulary problem — handles any word
2. **BPE** merges the most frequent pairs (used by GPT models)
3. **WordPiece** merges by likelihood score, uses ## prefix (used by BERT)
4. **SentencePiece** is language-agnostic — treats spaces as characters
5. **Unigram** is probabilistic — picks the most likely segmentation
6. Vocabulary size of **30K-50K** tokens is the sweet spot for most models
7. Hugging Face **fast tokenizers** (Rust) are 40× faster than Python ones

---

## Exercises

1. Train a BPE tokenizer on a custom corpus and compare with pre-trained ones
2. Tokenize the same sentence with BERT, GPT-2, and T5 tokenizers — observe differences
3. Experiment with different vocabulary sizes (1K, 5K, 30K) — measure sequence lengths
4. Use the offset mapping from fast tokenizers to highlight entities in original text
5. Implement the BPE algorithm from scratch in Python (the merge loop)
