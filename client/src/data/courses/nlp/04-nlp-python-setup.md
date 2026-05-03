---
title: Python Setup for NLP
---

# Python Setup for NLP

Before diving into NLP, you need a proper Python development environment. This lesson walks you through installing Python, setting up virtual environments, and installing the core NLP libraries.

---

## Installing Python

### Check If Python Is Already Installed

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux):

```python
# Check Python version
# Run in terminal: python --version
# or: python3 --version
```

You need **Python 3.9 or higher** for this course.

### Download Python

If you don't have Python installed:

| Platform | Method |
|----------|--------|
| Windows | Download from [python.org](https://python.org), check "Add to PATH" |
| macOS | `brew install python` (Homebrew) or download from python.org |
| Linux | `sudo apt install python3 python3-pip` (Ubuntu/Debian) |

### Verify Installation

```python
# Run these in your terminal to verify:
# python3 --version
# pip3 --version

# Expected output:
# Python 3.11.5
# pip 23.2.1
```

---

## Virtual Environments

**Always use a virtual environment** for NLP projects. This isolates your project dependencies and prevents conflicts.

### Option 1: venv (Built-in)

```python
# Create a virtual environment
# Run in terminal:
# python3 -m venv nlp-env

# Activate it:
# macOS/Linux:
#   source nlp-env/bin/activate
# Windows:
#   nlp-env\Scripts\activate

# You'll see (nlp-env) in your prompt:
# (nlp-env) $ python --version
```

### Option 2: conda (Recommended for Data Science)

```python
# Install Miniconda from https://docs.conda.io/en/latest/miniconda.html

# Create environment:
# conda create -n nlp-env python=3.11

# Activate:
# conda activate nlp-env

# Verify:
# python --version
```

### Why Virtual Environments Matter

```
Project A needs: spacy==3.5, numpy==1.24
Project B needs: spacy==3.7, numpy==1.26

Without venv → VERSION CONFLICTS! 💥
With venv → Each project has its own packages ✓
```

---

## Installing Core NLP Libraries

### Step 1: Core Libraries

```python
# Install the essential NLP packages
# Run in terminal (with your venv activated):

# pip install nltk spacy scikit-learn numpy pandas matplotlib
```

**What each library does:**

| Library | Purpose | Size |
|---------|---------|------|
| `nltk` | Classic NLP toolkit, great for learning | ~14 MB |
| `spacy` | Industrial-strength NLP pipeline | ~30 MB |
| `scikit-learn` | ML algorithms for classification | ~30 MB |
| `numpy` | Numerical computations | ~20 MB |
| `pandas` | Data manipulation | ~40 MB |
| `matplotlib` | Plotting and visualization | ~40 MB |

### Step 2: Advanced Libraries (For Later Sections)

```python
# Install these when you reach the deep learning sections:
# pip install transformers torch gensim

# Or with conda (better for PyTorch):
# conda install pytorch -c pytorch
# pip install transformers gensim
```

| Library | Purpose | Size |
|---------|---------|------|
| `transformers` | Hugging Face pre-trained models | ~50 MB |
| `torch` | PyTorch deep learning | ~800 MB |
| `gensim` | Word2Vec, topic modeling | ~25 MB |

---

## NLTK Setup

NLTK requires downloading additional data (corpora, models, tokenizers):

```python
import nltk

# Download essential NLTK data
# This will open a download manager the first time:
nltk.download('punkt')          # Tokenizer models
nltk.download('punkt_tab')      # Updated tokenizer data
nltk.download('stopwords')      # Common stop words (English, etc.)
nltk.download('wordnet')        # Lexical database
nltk.download('averaged_perceptron_tagger')  # POS tagger
nltk.download('maxent_ne_chunker')           # Named entity chunker
nltk.download('words')          # English word list

print("NLTK data downloaded successfully!")
```

### Download Everything (Optional)

```python
# If you want ALL NLTK data (about 3.5 GB):
# nltk.download('all')

# Or download just the popular subset (~500 MB):
nltk.download('popular')
```

### Verify NLTK Installation

```python
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Test tokenization
text = "NLTK is a powerful library for NLP tasks."
tokens = word_tokenize(text)
print(f"Tokens: {tokens}")

# Test stopwords
stop_words = set(stopwords.words('english'))
print(f"Number of English stop words: {len(stop_words)}")
print(f"Sample stop words: {list(stop_words)[:10]}")
```

**Output:**
```
Tokens: ['NLTK', 'is', 'a', 'powerful', 'library', 'for', 'NLP', 'tasks', '.']
Number of English stop words: 179
Sample stop words: ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're"]
```

---

## spaCy Setup

spaCy needs a language model downloaded separately:

```python
# Download the English language model
# Run in terminal:
# python -m spacy download en_core_web_sm

# For better accuracy (larger model):
# python -m spacy download en_core_web_md

# For best accuracy (largest model):
# python -m spacy download en_core_web_lg
```

### Model Comparison

| Model | Size | Accuracy | Speed | Includes |
|-------|------|----------|-------|----------|
| `en_core_web_sm` | 12 MB | Good | Fast | No word vectors |
| `en_core_web_md` | 40 MB | Better | Medium | 20k word vectors |
| `en_core_web_lg` | 560 MB | Best | Slower | 685k word vectors |

For this course, start with `en_core_web_sm` (small model).

### Verify spaCy Installation

```python
import spacy

# Load the English model
nlp = spacy.load("en_core_web_sm")

# Process a sentence
doc = nlp("spaCy is an amazing NLP library built in Python.")

# Print tokens with their properties
print(f"{'Token':<12} {'POS':<8} {'Lemma':<12} {'Is Stop?'}")
print("-" * 45)
for token in doc:
    print(f"{token.text:<12} {token.pos_:<8} {token.lemma_:<12} {token.is_stop}")
```

**Output:**
```
Token        POS      Lemma        Is Stop?
---------------------------------------------
spaCy        PROPN    spaCy        False
is           AUX      be           True
an           DET      a            True
amazing      ADJ      amazing      False
NLP          PROPN    NLP          False
library      NOUN     library      False
built        VERB     build        False
in           ADP      in           True
Python       PROPN    Python       False
.            PUNCT    .            False
```

---

## Jupyter Notebooks (Optional but Recommended)

Jupyter notebooks are excellent for NLP experimentation:

```python
# Install Jupyter
# pip install jupyter jupyterlab

# Launch Jupyter Lab:
# jupyter lab

# Or classic Jupyter Notebook:
# jupyter notebook
```

### Why Use Jupyter for NLP?

| Feature | Benefit |
|---------|---------|
| Cell-by-cell execution | Test code incrementally |
| Rich output | Display formatted text, tables, plots |
| Markdown support | Mix code with explanations |
| Easy experimentation | Modify and re-run quickly |

### Alternative: VS Code + Jupyter Extension

You can also run notebooks directly in VS Code:

1. Install the "Jupyter" extension in VS Code
2. Create a file with `.ipynb` extension
3. Run cells directly in the editor

---

## Verifying Your Complete Setup

Run this script to verify everything is working:

```python
# ===================================
# NLP Environment Verification Script
# ===================================

import sys
print(f"Python version: {sys.version}")
print(f"Python path: {sys.executable}")
print()

# Check core libraries
libraries = {
    'nltk': 'nltk',
    'spacy': 'spacy',
    'sklearn': 'scikit-learn',
    'numpy': 'numpy',
    'pandas': 'pandas',
}

print("=== Library Versions ===")
for import_name, display_name in libraries.items():
    try:
        module = __import__(import_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"  ✓ {display_name}: {version}")
    except ImportError:
        print(f"  ✗ {display_name}: NOT INSTALLED")

print()

# Check NLTK data
print("=== NLTK Data ===")
import nltk
required_data = ['punkt', 'stopwords', 'wordnet']
for data in required_data:
    try:
        nltk.data.find(f'tokenizers/{data}' if data == 'punkt' else f'corpora/{data}')
        print(f"  ✓ {data}: available")
    except LookupError:
        print(f"  ✗ {data}: NOT DOWNLOADED")

print()

# Check spaCy model
print("=== spaCy Model ===")
import spacy
try:
    nlp = spacy.load("en_core_web_sm")
    print(f"  ✓ en_core_web_sm: loaded ({nlp.meta['version']})")
except OSError:
    print("  ✗ en_core_web_sm: NOT INSTALLED")
    print("    Run: python -m spacy download en_core_web_sm")

print()
print("=== Setup Complete! ===")
```

**Expected Output:**
```
Python version: 3.11.5 (main, Sep 11 2023, 08:31:25)
Python path: /path/to/nlp-env/bin/python

=== Library Versions ===
  ✓ nltk: 3.8.1
  ✓ spacy: 3.7.2
  ✓ scikit-learn: 1.3.2
  ✓ numpy: 1.26.2
  ✓ pandas: 2.1.4

=== NLTK Data ===
  ✓ punkt: available
  ✓ stopwords: available
  ✓ wordnet: available

=== spaCy Model ===
  ✓ en_core_web_sm: loaded (3.7.1)

=== Setup Complete! ===
```

---

## Your First NLP Script

Now let's do something fun! Here's a complete script that uses both NLTK and spaCy:

```python
# ===================================
# First NLP Script: Text Analysis
# ===================================

import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import spacy

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Sample text
text = """
Artificial Intelligence is transforming the world. Natural Language 
Processing, a subfield of AI, enables computers to understand human 
language. Companies like Google, Microsoft, and OpenAI are building 
increasingly powerful language models. These models can translate 
languages, answer questions, write code, and even generate creative 
content like poetry and stories.
"""

print("=" * 50)
print("TEXT ANALYSIS WITH NLTK AND spaCy")
print("=" * 50)

# --- NLTK Analysis ---
print("\n📚 NLTK Analysis")
print("-" * 30)

# Tokenize into sentences
sentences = sent_tokenize(text)
print(f"Sentences: {len(sentences)}")

# Tokenize into words
tokens = word_tokenize(text)
print(f"Total tokens: {len(tokens)}")

# Remove stopwords and punctuation
stop_words = set(stopwords.words('english'))
filtered_tokens = [
    word.lower() for word in tokens 
    if word.isalpha() and word.lower() not in stop_words
]
print(f"Meaningful words: {len(filtered_tokens)}")

# Word frequency
freq_dist = FreqDist(filtered_tokens)
print(f"\nTop 10 words:")
for word, count in freq_dist.most_common(10):
    print(f"  {word}: {count}")
```

**Output:**
```
==================================================
TEXT ANALYSIS WITH NLTK AND spaCy
==================================================

📚 NLTK Analysis
------------------------------
Sentences: 4
Total tokens: 62
Meaningful words: 30

Top 10 words:
  language: 3
  models: 2
  like: 2
  natural: 1
  processing: 1
  subfield: 1
  ai: 1
  enables: 1
  computers: 1
  understand: 1
```

```python
# --- spaCy Analysis ---
print("\n🔬 spaCy Analysis")
print("-" * 30)

doc = nlp(text)

# Named Entity Recognition
print("Named Entities:")
for ent in doc.ents:
    print(f"  {ent.text:<20} → {ent.label_:<10} ({spacy.explain(ent.label_)})")

# Part-of-Speech statistics
print("\nPart-of-Speech Distribution:")
pos_counts = {}
for token in doc:
    if token.is_alpha:
        pos = token.pos_
        pos_counts[pos] = pos_counts.get(pos, 0) + 1

for pos, count in sorted(pos_counts.items(), key=lambda x: x[1], reverse=True):
    print(f"  {pos:<8}: {count}")

# Noun chunks (phrases)
print("\nNoun Phrases:")
for chunk in doc.noun_chunks:
    print(f"  • {chunk.text}")
```

**Output:**
```
🔬 spaCy Analysis
------------------------------
Named Entities:
  Natural Language      → ORG        (Companies, agencies, institutions)
  AI                   → ORG        (Companies, agencies, institutions)
  Google               → ORG        (Companies, agencies, institutions)
  Microsoft            → ORG        (Companies, agencies, institutions)
  OpenAI               → ORG        (Companies, agencies, institutions)

Part-of-Speech Distribution:
  NOUN    : 14
  VERB    : 9
  ADJ     : 6
  PROPN   : 5
  ADP     : 4
  DET     : 3
  ADV     : 2

Noun Phrases:
  • Artificial Intelligence
  • the world
  • Natural Language Processing
  • a subfield
  • computers
  • human language
  • Companies
  • powerful language models
  • These models
  • languages
  • questions
  • code
  • creative content
  • poetry
  • stories
```

---

## Common Setup Issues

### Problem: "ModuleNotFoundError: No module named 'nltk'"

```python
# Make sure your virtual environment is activated!
# Then install:
# pip install nltk
```

### Problem: NLTK LookupError

```python
# If you get "Resource punkt not found":
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
```

### Problem: "Can't find model 'en_core_web_sm'"

```python
# Download the model:
# python -m spacy download en_core_web_sm

# If that fails, try:
# pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1.tar.gz
```

### Problem: "pip is not recognized"

```python
# Use pip3 instead of pip:
# pip3 install nltk

# Or use python -m pip:
# python3 -m pip install nltk
```

### Problem: Permission denied

```python
# Never use sudo pip install!
# Instead, use a virtual environment (always the right answer)

# Or use --user flag as last resort:
# pip install --user nltk
```

---

## Project Structure Recommendation

Organize your NLP projects like this:

```
nlp-project/
├── nlp-env/           # Virtual environment (don't commit to git)
├── data/
│   ├── raw/           # Original text files
│   └── processed/     # Cleaned/tokenized data
├── notebooks/         # Jupyter notebooks for exploration
├── src/
│   ├── preprocess.py  # Text cleaning functions
│   ├── features.py    # Feature extraction
│   └── model.py       # Model training
├── tests/             # Unit tests
├── requirements.txt   # pip freeze > requirements.txt
└── README.md          # Project documentation
```

### Create requirements.txt

```python
# Save your dependencies:
# pip freeze > requirements.txt

# Install from requirements.txt on another machine:
# pip install -r requirements.txt
```

---

## Summary

In this lesson, you:

- ✓ Installed Python 3.9+
- ✓ Created a virtual environment
- ✓ Installed NLTK, spaCy, and scikit-learn
- ✓ Downloaded NLTK corpora and spaCy models
- ✓ Verified your complete setup
- ✓ Ran your first NLP analysis script

---

## Quick Reference

| Task | Command |
|------|---------|
| Create venv | `python3 -m venv nlp-env` |
| Activate (Mac/Linux) | `source nlp-env/bin/activate` |
| Activate (Windows) | `nlp-env\Scripts\activate` |
| Install packages | `pip install nltk spacy scikit-learn` |
| Download NLTK data | `nltk.download('popular')` |
| Download spaCy model | `python -m spacy download en_core_web_sm` |
| Verify setup | Run the verification script above |
| Deactivate venv | `deactivate` |

---

*← Previous: History of NLP | Next: Working with Text in Python →*
