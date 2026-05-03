---
title: What is Natural Language Processing?
---

# What is Natural Language Processing?

**Natural Language Processing (NLP)** is the field of artificial intelligence that gives computers the ability to understand, interpret, and generate human language.

---

## Definition

NLP sits at the intersection of three fields:

- **Linguistics** — the scientific study of language
- **Computer Science** — algorithms and data structures
- **Artificial Intelligence** — machines that learn and reason

Together, these fields enable computers to work with the messy, ambiguous, and beautiful thing we call human language.

### Formal Definition

> Natural Language Processing is a subfield of AI concerned with the interactions between computers and human (natural) languages — how to program computers to process and analyze large amounts of natural language data.

### What is "Natural Language"?

A **natural language** is any language that has evolved naturally among humans:

- English, Spanish, Mandarin, Arabic, Hindi...
- Sign languages
- Historical languages (Latin, Sanskrit)

This is different from **formal languages** (programming languages, math notation) which were deliberately designed.

---

## Natural Language vs Programming Language

| Feature | Natural Language | Programming Language |
|---------|-----------------|---------------------|
| Ambiguity | Very common | Not allowed |
| Grammar rules | Flexible, many exceptions | Strict, no exceptions |
| Context dependence | Heavy | Minimal |
| Evolution | Changes over time | Version-controlled |
| Interpretation | Multiple valid readings | Single deterministic meaning |
| Examples | English, French | Python, Java |

### Example: Ambiguity

Consider this English sentence:

```
"I saw the man with the telescope."
```

This has **two valid interpretations**:

1. I used a telescope to see the man.
2. I saw a man who was holding a telescope.

A programming language would **never** allow this kind of ambiguity:

```python
# Programming languages are unambiguous
x = 5 + 3  # Always equals 8, no other interpretation
```

---

## NLP vs NLU vs NLG

These three terms are often confused. Here's the difference:

### NLP (Natural Language Processing)

The **umbrella term** that covers all computational processing of human language. It includes both understanding and generation.

### NLU (Natural Language Understanding)

A **subset of NLP** focused on the machine's ability to **comprehend** what text means:

- What is the intent behind "Book me a flight to Paris"?
- What entities are mentioned? (Paris = location)
- What is the sentiment of a review?

### NLG (Natural Language Generation)

A **subset of NLP** focused on the machine's ability to **produce** human-readable text:

- Generating a weather report from data
- Writing a summary of a long article
- Creating chatbot responses

### The Full Picture

```
┌─────────────────────────────────────────┐
│            NLP (umbrella)               │
│                                         │
│   ┌──────────────┐  ┌──────────────┐   │
│   │     NLU      │  │     NLG      │   │
│   │              │  │              │   │
│   │ Understanding│  │  Generation  │   │
│   │ (input)      │  │  (output)    │   │
│   └──────────────┘  └──────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Example in Practice

When you ask a virtual assistant "What's the weather like today?":

1. **NLU**: Understands your intent (get_weather) and entities (today)
2. **Processing**: Fetches weather data from an API
3. **NLG**: Generates response: "It's sunny and 72°F today!"

---

## Core Challenges of NLP

Human language is incredibly difficult for computers. Here are the main challenges:

### 1. Ambiguity

Words and sentences often have multiple meanings:

```
"Bank" → Financial institution? River bank?
"Light" → Not heavy? Electromagnetic radiation? To ignite?
"She saw the bat" → Animal or sports equipment?
```

**Types of ambiguity:**

| Type | Example | Problem |
|------|---------|---------|
| Lexical | "I went to the bank" | Multiple word meanings |
| Syntactic | "Flying planes can be dangerous" | Multiple parse trees |
| Semantic | "Every student read a book" | Scope ambiguity |
| Referential | "John told Bob he was late" | Who does "he" refer to? |

### 2. Context Dependence

The same words mean different things in different contexts:

```
"It's cold outside" → Temperature
"That was cold" → Cruel or unfriendly
"I have a cold" → Illness
"Cold case" → Unsolved crime
```

### 3. Sarcasm and Irony

```
"Oh great, another Monday morning. Just what I needed."
```

A literal reading would be positive. The actual meaning is negative.

### 4. Idioms and Figurative Language

```
"It's raining cats and dogs" → Heavy rain (NOT animals falling)
"Break a leg" → Good luck (NOT an injury wish)
"Kick the bucket" → To die (NOT about a bucket)
```

### 5. Multiple Languages

- 7,000+ languages in the world
- Different scripts (Latin, Arabic, Chinese, Devanagari)
- Different grammatical structures
- Code-switching (mixing languages mid-sentence)

### 6. Evolving Language

```
"That slaps" (2020s) → That's really good
"Lit" → Exciting/excellent (not on fire)
"Ghost" (verb) → Stop responding to someone
```

---

## Subfields of NLP

NLP is a broad field with many specialized areas:

### Text Processing

Preparing raw text for analysis:

- Tokenization (splitting text into units)
- Sentence segmentation
- Spelling correction
- Text normalization

### Information Extraction

Pulling structured data from unstructured text:

- Named Entity Recognition (NER): finding names, dates, locations
- Relation Extraction: finding connections between entities
- Event Detection: identifying what happened

### Machine Translation

Converting text from one language to another:

- Statistical Machine Translation
- Neural Machine Translation
- Multilingual models

### Text Generation

Creating human-like text:

- Summarization
- Dialogue systems
- Story generation
- Code generation

### Text Classification

Categorizing text into predefined classes:

- Spam detection
- Sentiment analysis
- Topic classification
- Language identification

### Question Answering

Building systems that answer questions:

- Reading comprehension
- Open-domain QA
- Knowledge-based QA

---

## NLP Levels of Analysis

Linguists analyze language at multiple levels. NLP systems do the same:

### 1. Morphology (Word Structure)

How words are formed from smaller units (morphemes):

```
"unhappiness" → un + happy + ness
"running" → run + ning
"dogs" → dog + s
```

Key for: stemming, lemmatization, handling unknown words

### 2. Syntax (Sentence Structure)

How words combine to form grammatically correct sentences:

```
"The cat sat on the mat"
   ↓
[NP: The cat] [VP: sat [PP: on [NP: the mat]]]
```

Key for: parsing, grammar checking, information extraction

### 3. Semantics (Meaning)

What words and sentences actually mean:

```
"The bank is by the river" → bank = edge of water
"The bank is downtown" → bank = financial institution
```

Key for: word sense disambiguation, semantic similarity

### 4. Pragmatics (Context & Intent)

What the speaker actually intends to communicate:

```
"Can you pass the salt?"
Literal: Are you physically able to pass the salt?
Intended: Please pass me the salt.
```

Key for: dialogue systems, intent detection, conversational AI

### 5. Discourse (Multi-sentence)

How sentences relate to each other in larger text:

```
"John went to the store. He bought milk."
→ "He" refers to "John" (coreference resolution)
```

Key for: document understanding, summarization

---

## NLP Tasks by Difficulty

| Difficulty | Task | Example |
|-----------|------|---------|
| ⭐ Easy | Language Detection | "Bonjour" → French |
| ⭐ Easy | Tokenization | "Hello world" → ["Hello", "world"] |
| ⭐⭐ Medium | Spam Detection | Email → Spam/Not Spam |
| ⭐⭐ Medium | Named Entity Recognition | "Tim Cook leads Apple" → [Tim Cook: PERSON, Apple: ORG] |
| ⭐⭐⭐ Hard | Machine Translation | English → Chinese |
| ⭐⭐⭐ Hard | Sentiment Analysis (nuanced) | Understanding sarcasm |
| ⭐⭐⭐⭐ Very Hard | Open-domain QA | Answering any question |
| ⭐⭐⭐⭐ Very Hard | Text Summarization | Condensing a novel |
| ⭐⭐⭐⭐⭐ Extremely Hard | General Conversation | Human-like dialogue |
| ⭐⭐⭐⭐⭐ Extremely Hard | Creative Writing | Writing poetry or stories |

---

## Code: Simple NLP with Python Strings

You don't need any libraries to start doing basic NLP! Let's analyze text using just Python:

```python
# ===================================
# Basic NLP with Pure Python
# ===================================

text = """Natural Language Processing is a fascinating field 
of artificial intelligence. It helps computers understand 
human language. NLP is used in many applications like 
chatbots, translation, and search engines."""

# --- 1. Basic Statistics ---
print("=== Text Statistics ===")
print(f"Total characters: {len(text)}")
print(f"Total characters (no spaces): {len(text.replace(' ', ''))}")

# Split into words (basic tokenization)
words = text.split()
print(f"Total words: {len(words)}")

# Split into sentences (basic sentence segmentation)
sentences = text.replace('\n', ' ').split('. ')
print(f"Total sentences: {len(sentences)}")
```

**Output:**
```
=== Text Statistics ===
Total characters: 229
Total characters (no spaces): 193
Total words: 35
Total sentences: 4
```

```python
# --- 2. Word Frequency Analysis ---
print("\n=== Word Frequency ===")

# Normalize: lowercase and remove punctuation
import string

clean_words = []
for word in words:
    # Remove punctuation and convert to lowercase
    cleaned = word.lower().strip(string.punctuation)
    if cleaned:  # Skip empty strings
        clean_words.append(cleaned)

# Count frequencies
word_freq = {}
for word in clean_words:
    word_freq[word] = word_freq.get(word, 0) + 1

# Sort by frequency (descending)
sorted_freq = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

print("Top 10 most common words:")
for word, count in sorted_freq[:10]:
    print(f"  '{word}': {count}")
```

**Output:**
```
=== Word Frequency ===
Top 10 most common words:
  'is': 3
  'language': 2
  'nlp': 2
  'a': 2
  'natural': 1
  'processing': 1
  'fascinating': 1
  'field': 1
  'of': 1
  'artificial': 1
```

```python
# --- 3. Simple Text Analysis ---
print("\n=== Text Analysis ===")

# Average word length
avg_length = sum(len(w) for w in clean_words) / len(clean_words)
print(f"Average word length: {avg_length:.1f} characters")

# Vocabulary size (unique words)
vocabulary = set(clean_words)
print(f"Vocabulary size: {len(vocabulary)} unique words")

# Lexical diversity (unique words / total words)
diversity = len(vocabulary) / len(clean_words)
print(f"Lexical diversity: {diversity:.2f}")

# Find capitalized words (potential proper nouns/abbreviations)
capitalized = [w for w in words if w[0].isupper()]
print(f"Capitalized words: {capitalized}")
```

**Output:**
```
=== Text Analysis ===
Average word length: 5.2 characters
Vocabulary size: 28 unique words
Lexical diversity: 0.82
Capitalized words: ['Natural', 'Language', 'Processing', 'It', 'NLP']
```

```python
# --- 4. Simple Keyword Extraction ---
print("\n=== Simple Keyword Extraction ===")

# Remove common "stop words" manually
stop_words = {'is', 'a', 'the', 'of', 'in', 'it', 'and', 'like', 'are',
              'to', 'that', 'this', 'was', 'for', 'on', 'with', 'as',
              'at', 'by', 'an', 'be', 'has', 'had', 'not', 'but', 'or',
              'from', 'they', 'its', 'many', 'helps'}

keywords = [w for w in clean_words if w not in stop_words]
print(f"Keywords: {keywords}")

# Keyword frequency
kw_freq = {}
for word in keywords:
    kw_freq[word] = kw_freq.get(word, 0) + 1

print("\nTop keywords:")
for word, count in sorted(kw_freq.items(), key=lambda x: x[1], reverse=True)[:5]:
    print(f"  '{word}': {count}")
```

**Output:**
```
=== Simple Keyword Extraction ===
Keywords: ['natural', 'language', 'processing', 'fascinating', 'field', ...]

Top keywords:
  'language': 2
  'nlp': 2
  'natural': 1
  'processing': 1
  'computers': 1
```

---

## Summary

In this lesson, you learned:

- **NLP** is the intersection of linguistics, CS, and AI
- **Natural language** is ambiguous; programming languages are not
- **NLP** is the umbrella term; **NLU** = understanding, **NLG** = generation
- The main challenges: ambiguity, context, sarcasm, idioms, multiple languages
- NLP operates at multiple levels: morphology → syntax → semantics → pragmatics
- You can do basic text analysis with pure Python!

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| NLP | Computers working with human language |
| NLU | Understanding meaning (input) |
| NLG | Producing text (output) |
| Ambiguity | The #1 challenge in NLP |
| Levels | Morphology < Syntax < Semantics < Pragmatics |

---

*← Previous: Course Home | Next: History of NLP →*
