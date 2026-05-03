---
title: spaCy Deep Dive
---

# spaCy Deep Dive

**spaCy** is an industrial-strength NLP library designed for **production** use. Unlike NLTK (which is a teaching toolkit) or Hugging Face (which focuses on deep learning models), spaCy provides a complete, opinionated pipeline that is fast, memory-efficient, and easy to deploy.

In this lesson you will explore spaCy's architecture in depth: the processing pipeline, custom components, training custom NER models, and advanced rule-based matching.

---

## Installing spaCy

```python
# Install spaCy and download the English model
# pip install spacy
# python -m spacy download en_core_web_sm

import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Apple is looking at buying U.K. startup for $1 billion")

for token in doc:
    print(f"{token.text:12} {token.pos_:6} {token.dep_:10} {token.head.text}")
```

**Output:**

```
Apple        PROPN  nsubj      looking
is           AUX    aux        looking
looking      VERB   ROOT       looking
at           ADP    prep       looking
buying       VERB   pcomp      at
U.K.         PROPN  dobj       buying
startup      NOUN   dobj       buying
for          ADP    prep       buying
$            SYM    quantmod   billion
1            NUM    compound   billion
billion      NUM    pobj       for
```

---

## The spaCy Pipeline

When you call `nlp(text)`, the text flows through a **pipeline** of components:

```
Text → Tokenizer → Tagger → Parser → NER → ... → Doc
```

Each component adds annotations to the `Doc` object.

### Viewing the Pipeline

```python
nlp = spacy.load("en_core_web_sm")

print("Pipeline components:")
for name, component in nlp.pipeline:
    print(f"  {name:15} → {type(component).__name__}")

# Pipeline components:
#   tok2vec         → Tok2Vec
#   tagger          → Tagger
#   parser          → DependencyParser
#   attribute_ruler → AttributeRuler
#   lemmatizer      → Lemmatizer
#   ner             → EntityRecognizer
```

### What Each Component Does

| Component | Purpose | Annotations Added |
|---|---|---|
| **Tokenizer** | Split text into tokens | `doc[i].text`, whitespace info |
| **Tok2Vec** | Shared word embeddings | Internal vectors |
| **Tagger** | Part-of-speech tagging | `token.pos_`, `token.tag_` |
| **Parser** | Dependency parsing | `token.dep_`, `token.head` |
| **Attribute Ruler** | Map tag → fine-grained attrs | Overrides |
| **Lemmatizer** | Reduce words to base form | `token.lemma_` |
| **NER** | Named entity recognition | `doc.ents` |

### Selective Loading (Speed Optimization)

If you only need NER, skip the other components:

```python
# Disable components you don't need
nlp = spacy.load("en_core_web_sm", disable=["tagger", "parser", "lemmatizer"])

doc = nlp("Apple announced a new iPhone in San Francisco")
print("Entities:", [(ent.text, ent.label_) for ent in doc.ents])
# [('Apple', 'ORG'), ('iPhone', 'ORG'), ('San Francisco', 'GPE')]
```

```python
# Benchmark: full pipeline vs NER only
import time

text = "Google acquired DeepMind in London for $500 million."

nlp_full = spacy.load("en_core_web_sm")
nlp_ner_only = spacy.load("en_core_web_sm", disable=["tagger", "parser", "lemmatizer"])

def benchmark(model, text, n=1000):
    start = time.perf_counter()
    for _ in range(n):
        model(text)
    return (time.perf_counter() - start) / n * 1000

print(f"Full pipeline: {benchmark(nlp_full, text):.2f} ms/doc")
print(f"NER only:      {benchmark(nlp_ner_only, text):.2f} ms/doc")
```

---

## Custom Pipeline Components

You can add your own processing steps to the pipeline.

### Example: Text Statistics Component

```python
from spacy.language import Language

@Language.component("text_stats")
def text_stats_component(doc):
    """Add text statistics as custom Doc attributes."""
    doc._.word_count = len([t for t in doc if not t.is_punct and not t.is_space])
    doc._.sentence_count = len(list(doc.sents))
    doc._.avg_word_length = (
        sum(len(t.text) for t in doc if not t.is_punct and not t.is_space)
        / max(doc._.word_count, 1)
    )
    return doc

# Register custom attributes
from spacy.tokens import Doc
Doc.set_extension("word_count", default=0, force=True)
Doc.set_extension("sentence_count", default=0, force=True)
Doc.set_extension("avg_word_length", default=0.0, force=True)

# Add to pipeline
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("text_stats", last=True)

doc = nlp("spaCy is an amazing library. It processes text very quickly.")
print(f"Words:      {doc._.word_count}")
print(f"Sentences:  {doc._.sentence_count}")
print(f"Avg length: {doc._.avg_word_length:.1f} chars")
```

### Example: Language Detection Component

```python
@Language.component("language_detector")
def language_detector(doc):
    """Simple language detection based on character analysis."""
    text = doc.text

    # Very simplified heuristic
    cjk_count = sum(1 for c in text if "\u4e00" <= c <= "\u9fff")
    latin_count = sum(1 for c in text if c.isascii() and c.isalpha())
    cyrillic_count = sum(1 for c in text if "\u0400" <= c <= "\u04ff")

    total = max(cjk_count + latin_count + cyrillic_count, 1)

    if cjk_count / total > 0.3:
        doc._.language = "zh"
    elif cyrillic_count / total > 0.3:
        doc._.language = "ru"
    else:
        doc._.language = "en"

    return doc

Doc.set_extension("language", default="unknown", force=True)

nlp2 = spacy.load("en_core_web_sm")
nlp2.add_pipe("language_detector", first=True)

doc = nlp2("This is an English sentence.")
print(f"Detected language: {doc._.language}")  # en
```

### Pipeline Order

```python
# View the current order
print("Before:", nlp.pipe_names)

# You can control where a component is inserted
# nlp.add_pipe("my_component", before="ner")
# nlp.add_pipe("my_component", after="tagger")
# nlp.add_pipe("my_component", first=True)
# nlp.add_pipe("my_component", last=True)
```

---

## Training Custom NER Models

spaCy makes it straightforward to train a custom NER model for your domain.

### Step 1: Prepare Training Data

spaCy 3 uses the `.spacy` binary format, but you can convert from JSON or programmatic data.

```python
import spacy
from spacy.tokens import DocBin

nlp = spacy.blank("en")

# Training examples: (text, {"entities": [(start, end, label)]})
TRAIN_DATA = [
    ("Apple released the iPhone 15 in September",
     {"entities": [(0, 5, "COMPANY"), (19, 28, "PRODUCT"), (32, 41, "DATE")]}),
    ("Google announced Pixel 8 at their event",
     {"entities": [(0, 6, "COMPANY"), (17, 24, "PRODUCT")]}),
    ("Microsoft launched Windows 11 last year",
     {"entities": [(0, 9, "COMPANY"), (19, 29, "PRODUCT")]}),
    ("Samsung unveiled Galaxy S24 in January",
     {"entities": [(0, 7, "COMPANY"), (17, 27, "PRODUCT"), (31, 38, "DATE")]}),
    ("Tesla introduced the Model Y in 2020",
     {"entities": [(0, 5, "COMPANY"), (21, 28, "PRODUCT"), (32, 36, "DATE")]}),
    ("Amazon released Alexa Echo in November",
     {"entities": [(0, 6, "COMPANY"), (16, 26, "PRODUCT"), (30, 38, "DATE")]}),
    ("Sony launched PlayStation 5 worldwide",
     {"entities": [(0, 4, "COMPANY"), (14, 27, "PRODUCT")]}),
    ("Nintendo announced Switch 2 for 2025",
     {"entities": [(0, 8, "COMPANY"), (19, 27, "PRODUCT"), (32, 36, "DATE")]}),
    ("Meta released Llama 3 to researchers",
     {"entities": [(0, 4, "COMPANY"), (14, 21, "PRODUCT")]}),
    ("OpenAI launched GPT-4 in March 2023",
     {"entities": [(0, 6, "COMPANY"), (16, 21, "PRODUCT"), (25, 35, "DATE")]}),
]

# Convert to spaCy DocBin format
doc_bin = DocBin()

for text, annotations in TRAIN_DATA:
    doc = nlp.make_doc(text)
    ents = []
    for start, end, label in annotations["entities"]:
        span = doc.char_span(start, end, label=label)
        if span is not None:
            ents.append(span)
    doc.ents = ents
    doc_bin.add(doc)

doc_bin.to_disk("./train.spacy")
print(f"Saved {len(TRAIN_DATA)} training examples")
```

### Step 2: Create a Config File

```python
# Generate a base config
# python -m spacy init config config.cfg --lang en --pipeline ner --optimize efficiency

# Or create programmatically:
config_text = """
[paths]
train = "./train.spacy"
dev = "./train.spacy"

[system]
gpu_allocator = null

[nlp]
lang = "en"
pipeline = ["tok2vec", "ner"]

[components]

[components.tok2vec]
factory = "tok2vec"

[components.tok2vec.model]
@architectures = "spacy.Tok2Vec.v2"

[components.tok2vec.model.embed]
@architectures = "spacy.MultiHashEmbed.v2"
width = 96
attrs = ["NORM", "PREFIX", "SUFFIX", "SHAPE"]
rows = [5000, 1000, 2500, 2500]
include_static_vectors = false

[components.tok2vec.model.encode]
@architectures = "spacy.MaxoutWindowEncoder.v2"
width = 96
depth = 4
window_size = 1

[components.ner]
factory = "ner"

[components.ner.model]
@architectures = "spacy.TransitionBasedParser.v2"
state_type = "ner"
extra_state_tokens = false
hidden_width = 64
maxout_pieces = 2

[components.ner.model.tok2vec]
@architectures = "spacy.Tok2VecListener.v1"
width = ${components.tok2vec.model.encode.width}

[training]
dev_corpus = "corpora.dev"
train_corpus = "corpora.train"

[training.batcher]
@batchers = "spacy.batch_by_words.v1"
size = 3000

[training.optimizer]
@optimizers = "Adam.v1"
learn_rate = 0.001

[corpora]

[corpora.train]
@readers = "spacy.Corpus.v1"
path = ${paths.train}

[corpora.dev]
@readers = "spacy.Corpus.v1"
path = ${paths.dev}
"""

with open("config.cfg", "w") as f:
    f.write(config_text)

print("Config file created!")
```

### Step 3: Train the Model

```bash
# Train from the command line
python -m spacy train config.cfg --output ./output --paths.train ./train.spacy --paths.dev ./train.spacy
```

### Step 4: Use the Trained Model

```python
# Load the best model
nlp_custom = spacy.load("./output/model-best")

test_texts = [
    "Apple unveiled the Vision Pro headset at WWDC",
    "Google launched Gemini Ultra in February 2024",
    "Amazon introduced a new Kindle for the holidays",
]

for text in test_texts:
    doc = nlp_custom(text)
    print(f"\nText: {text}")
    for ent in doc.ents:
        print(f"  {ent.text:20} → {ent.label_}")
```

### Training with the Python API (Alternative)

```python
import spacy
from spacy.training import Example
import random

nlp = spacy.blank("en")
ner = nlp.add_pipe("ner")

# Add entity labels
ner.add_label("COMPANY")
ner.add_label("PRODUCT")
ner.add_label("DATE")

# Training loop
optimizer = nlp.begin_training()

for epoch in range(30):
    random.shuffle(TRAIN_DATA)
    losses = {}

    for text, annotations in TRAIN_DATA:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        nlp.update([example], sgd=optimizer, losses=losses)

    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch + 1:3d}  Loss: {losses['ner']:.4f}")

# Test
doc = nlp("Samsung released Galaxy Z Fold in August")
print("\nPredictions:")
for ent in doc.ents:
    print(f"  {ent.text:20} → {ent.label_}")
```

---

## Rule-Based Matching

spaCy provides powerful rule-based matching that combines regular expressions with linguistic features.

### Token Matcher

The `Matcher` matches sequences of tokens based on their attributes:

```python
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Pattern: adjective + noun + noun (e.g., "Natural Language Processing")
pattern = [
    {"POS": "ADJ"},
    {"POS": "NOUN"},
    {"POS": "NOUN"},
]
matcher.add("ADJ_NOUN_NOUN", [pattern])

doc = nlp("I studied Natural Language Processing and Deep Reinforcement Learning")
matches = matcher(doc)

for match_id, start, end in matches:
    span = doc[start:end]
    print(f"Match: '{span.text}' ({nlp.vocab.strings[match_id]})")
# Match: 'Natural Language Processing' (ADJ_NOUN_NOUN)
# Match: 'Deep Reinforcement Learning' (ADJ_NOUN_NOUN)
```

### Pattern Operators

| Operator | Meaning | Example |
|---|---|---|
| `"OP": "!"` | Negate (token must NOT match) | `{"POS": "PUNCT", "OP": "!"}` |
| `"OP": "?"` | Optional (0 or 1) | `{"POS": "ADJ", "OP": "?"}` |
| `"OP": "+"` | One or more | `{"POS": "NOUN", "OP": "+"}` |
| `"OP": "*"` | Zero or more | `{"POS": "ADV", "OP": "*"}` |

### Complex Matching Examples

```python
nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Pattern 1: Email-like pattern
email_pattern = [
    {"LIKE_EMAIL": True},
]
matcher.add("EMAIL", [email_pattern])

# Pattern 2: Phone number (simple: 3 digits, dash, 3 digits, dash, 4 digits)
phone_pattern = [
    {"SHAPE": "ddd"},
    {"TEXT": "-"},
    {"SHAPE": "ddd"},
    {"TEXT": "-"},
    {"SHAPE": "dddd"},
]
matcher.add("PHONE", [phone_pattern])

# Pattern 3: Money amounts ($X.XX or $X,XXX)
money_pattern = [
    {"TEXT": "$"},
    {"IS_DIGIT": True},
]
matcher.add("MONEY", [money_pattern])

# Pattern 4: Version numbers (v1.2.3)
version_pattern = [
    {"TEXT": {"REGEX": r"^v\d+"}},
    {"TEXT": "."},
    {"IS_DIGIT": True},
]
matcher.add("VERSION", [version_pattern])

doc = nlp("Contact john@example.com or call 555-123-4567. Price: $99. Running v2.1")
matches = matcher(doc)

for match_id, start, end in matches:
    label = nlp.vocab.strings[match_id]
    span = doc[start:end]
    print(f"  {label:10} → '{span.text}'")
```

### PhraseMatcher (Fast Exact Matching)

The `PhraseMatcher` is optimized for matching large lists of exact phrases:

```python
from spacy.matcher import PhraseMatcher

nlp = spacy.load("en_core_web_sm")
phrase_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")

# Programming languages to detect
languages = [
    "python", "javascript", "typescript", "rust", "go",
    "java", "c++", "c#", "ruby", "swift", "kotlin",
    "scala", "haskell", "elixir", "dart", "lua",
]

patterns = [nlp.make_doc(lang) for lang in languages]
phrase_matcher.add("PROGRAMMING_LANGUAGE", patterns)

text = """
We use Python for data science, JavaScript for the frontend,
and Rust for performance-critical systems. Our mobile team
writes Swift for iOS and Kotlin for Android.
"""

doc = nlp(text)
matches = phrase_matcher(doc)

found = set()
for match_id, start, end in matches:
    found.add(doc[start:end].text)

print("Programming languages found:", sorted(found))
# ['JavaScript', 'Kotlin', 'Python', 'Rust', 'Swift']
```

### Combining Matcher + PhraseMatcher

```python
nlp = spacy.load("en_core_web_sm")

# PhraseMatcher for known terms
phrase_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
tech_terms = ["machine learning", "deep learning", "natural language processing",
              "computer vision", "reinforcement learning", "neural network"]
phrase_patterns = [nlp.make_doc(term) for term in tech_terms]
phrase_matcher.add("TECH_TERM", phrase_patterns)

# Token Matcher for patterns
token_matcher = Matcher(nlp.vocab)
# Pattern: "X-based" (e.g., "transformer-based", "attention-based")
based_pattern = [{"TEXT": {"REGEX": r"\w+-based"}}]
token_matcher.add("X_BASED", [based_pattern])

text = """
The transformer-based model uses deep learning for natural language processing.
Attention-based architectures have revolutionized computer vision and
reinforcement learning tasks using sophisticated neural network designs.
"""

doc = nlp(text)

print("Phrase matches (tech terms):")
for match_id, start, end in phrase_matcher(doc):
    print(f"  '{doc[start:end].text}'")

print("\nToken matches (X-based):")
for match_id, start, end in token_matcher(doc):
    print(f"  '{doc[start:end].text}'")
```

---

## Entity Ruler (Rule-Based NER)

The `EntityRuler` lets you add rule-based entities directly to the NER pipeline:

```python
nlp = spacy.load("en_core_web_sm")

# Add entity ruler before the statistical NER
ruler = nlp.add_pipe("entity_ruler", before="ner")

patterns = [
    {"label": "FRAMEWORK", "pattern": "PyTorch"},
    {"label": "FRAMEWORK", "pattern": "TensorFlow"},
    {"label": "FRAMEWORK", "pattern": "spaCy"},
    {"label": "FRAMEWORK", "pattern": [{"LOWER": "hugging"}, {"LOWER": "face"}]},
    {"label": "LANGUAGE", "pattern": "Python"},
    {"label": "LANGUAGE", "pattern": "Rust"},
    {"label": "METRIC", "pattern": [{"LOWER": "f1"}, {"LOWER": "score"}]},
    {"label": "METRIC", "pattern": [{"LOWER": "accuracy"}]},
]

ruler.add_patterns(patterns)

doc = nlp("We use PyTorch and Hugging Face in Python to maximize F1 score")
for ent in doc.ents:
    print(f"  {ent.text:20} → {ent.label_}")
# PyTorch              → FRAMEWORK
# Hugging Face         → FRAMEWORK
# Python               → LANGUAGE
# F1 score             → METRIC
```

---

## Efficient Processing with `nlp.pipe()`

For processing large volumes of text, use `nlp.pipe()` instead of calling `nlp()` in a loop:

```python
import spacy
import time

nlp = spacy.load("en_core_web_sm")

texts = [
    f"This is document number {i} about natural language processing."
    for i in range(1000)
]

# Slow: one-by-one
start = time.perf_counter()
docs_slow = [nlp(text) for text in texts]
slow_time = time.perf_counter() - start

# Fast: batched with nlp.pipe()
start = time.perf_counter()
docs_fast = list(nlp.pipe(texts, batch_size=50))
fast_time = time.perf_counter() - start

print(f"One-by-one: {slow_time:.2f}s")
print(f"nlp.pipe(): {fast_time:.2f}s")
print(f"Speedup:    {slow_time/fast_time:.1f}x")
```

### Processing with Context

```python
# Attach metadata to each document
data = [
    ("Apple stock rose 5%", {"source": "finance", "id": 1}),
    ("New COVID variant found", {"source": "health", "id": 2}),
    ("Python 3.13 released", {"source": "tech", "id": 3}),
]

for doc, context in nlp.pipe(data, as_tuples=True):
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    print(f"  [{context['source']:8}] {doc.text:30} Entities: {entities}")
```

---

## spaCy vs NLTK vs Hugging Face

| Feature | spaCy | NLTK | Hugging Face |
|---|---|---|---|
| **Focus** | Production NLP | Teaching / research | Deep learning models |
| **Speed** | Very fast (Cython) | Slow (pure Python) | Depends on model |
| **Models** | Pipelines (sm/md/lg) | Corpora + algorithms | 200k+ pretrained |
| **NER** | Built-in, trainable | Basic (MaxEnt) | Fine-tune transformers |
| **Tokenization** | Rule-based + ML | Regex / Punkt | BPE / WordPiece |
| **Dependency Parse** | Yes | External (Stanford) | Not built-in |
| **GPU Support** | Yes (spacy-transformers) | No | Yes (native) |
| **Custom Training** | CLI + Python API | Manual | Trainer API |
| **Best For** | End-to-end pipelines | Learning NLP concepts | State-of-the-art models |

### Quick Comparison: Tokenization

```python
import spacy
import nltk
from transformers import AutoTokenizer

text = "I can't believe it's not butter!"

# spaCy
nlp = spacy.load("en_core_web_sm")
spacy_tokens = [t.text for t in nlp(text)]

# NLTK
nltk.download("punkt_tab", quiet=True)
nltk_tokens = nltk.word_tokenize(text)

# Hugging Face (BERT tokenizer)
hf_tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
hf_tokens = hf_tokenizer.tokenize(text)

print(f"spaCy ({len(spacy_tokens):2d}): {spacy_tokens}")
print(f"NLTK  ({len(nltk_tokens):2d}): {nltk_tokens}")
print(f"HF    ({len(hf_tokens):2d}): {hf_tokens}")

# spaCy ( 8): ["I", "ca", "n't", "believe", "it", "'s", "not", "butter", "!"]
# NLTK  ( 8): ["I", "ca", "n't", "believe", "it", "'s", "not", "butter", "!"]
# HF    (10): ["i", "can", "'", "t", "believe", "it", "'", "s", "not", "butter", "!"]
```

### When to Use What

- **spaCy**: You need a full NLP pipeline (tokenize → POS → parse → NER) in production.
- **NLTK**: You are learning NLP, doing linguistic research, or need access to corpora.
- **Hugging Face**: You want state-of-the-art performance with transformers, or need a model for a specific task (translation, summarization, QA).

---

## Advanced: Custom Tokenizer Rules

```python
from spacy.lang.en import English

nlp = English()

# Add special case: don't split "e.g."
from spacy.symbols import ORTH
nlp.tokenizer.add_special_case("e.g.", [{ORTH: "e.g."}])
nlp.tokenizer.add_special_case("i.e.", [{ORTH: "i.e."}])
nlp.tokenizer.add_special_case("et al.", [{ORTH: "et al."}])

doc = nlp("See the results, e.g. in Table 1, i.e. the main findings et al.")
print([t.text for t in doc])
# ['See', 'the', 'results', ',', 'e.g.', 'in', 'Table', '1', ',',
#  'i.e.', 'the', 'main', 'findings', 'et al.']
```

---

## Advanced: Span Categorization

spaCy 3.1+ introduced `SpanCategorizer` for overlapping entity detection (unlike NER which requires non-overlapping spans):

```python
import spacy

# SpanCategorizer allows overlapping spans
# Unlike NER where entities cannot overlap, spans can

nlp = spacy.blank("en")

# Example: In "New York City mayor", we might want:
#   - "New York City" as LOCATION
#   - "New York City mayor" as ROLE
# This is impossible with standard NER (overlapping spans)
# but possible with SpanCategorizer

print("SpanCategorizer use cases:")
print("  - Overlapping entities")
print("  - Multi-label span classification")
print("  - Nested entity recognition")
```

---

## Serialization and Deployment

### Saving and Loading Models

```python
# Save a customized pipeline
nlp = spacy.load("en_core_web_sm")
ruler = nlp.add_pipe("entity_ruler", before="ner")
ruler.add_patterns([
    {"label": "TOOL", "pattern": "spaCy"},
    {"label": "TOOL", "pattern": "NLTK"},
])

# Save to disk
nlp.to_disk("./my_custom_model")
print("Model saved!")

# Load it back
nlp2 = spacy.load("./my_custom_model")
doc = nlp2("We compared spaCy and NLTK for tokenization")
for ent in doc.ents:
    print(f"  {ent.text} → {ent.label_}")
```

### Packaging for pip Install

```bash
# Create an installable Python package from your model
python -m spacy package ./my_custom_model ./packages --build wheel

# Install it
pip install ./packages/en_custom_model-0.0.0/dist/*.whl

# Use it
# nlp = spacy.load("en_custom_model")
```

---

## Summary

In this lesson you learned:

- **spaCy's pipeline** architecture: `Tokenizer → Tok2Vec → Tagger → Parser → NER`.
- **Custom components**: add your own processing steps with `@Language.component`.
- **Training custom NER**: prepare data with `DocBin`, configure with `config.cfg`, train from CLI or Python.
- **Rule-based matching**: `Matcher` for token patterns, `PhraseMatcher` for fast exact phrase matching.
- **Entity Ruler**: add rule-based entities directly to the NER pipeline.
- **Efficient processing**: use `nlp.pipe()` for batch processing.
- **Library comparison**: spaCy (production), NLTK (learning), Hugging Face (transformers).

These three tools — spaCy, NLTK, and Hugging Face — complement each other. Many real-world projects use all three: spaCy for the core pipeline, Hugging Face for the model, and NLTK for auxiliary linguistic resources.
