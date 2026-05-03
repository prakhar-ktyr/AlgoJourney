---
title: Part-of-Speech Tagging
---

# Part-of-Speech Tagging

**Part-of-Speech (POS) tagging** assigns a grammatical label (noun, verb, adjective, etc.) to every word in a sentence. It's one of the most fundamental NLP tasks and a building block for many downstream applications.

---

## What Is POS Tagging?

Every word in a sentence plays a grammatical role. POS tagging identifies that role automatically:

```
The    quick   brown   fox     jumps   over   the    lazy    dog
DET    ADJ     ADJ     NOUN    VERB    ADP    DET    ADJ     NOUN
```

This is also called **grammatical tagging** or **word-category disambiguation**.

---

## Why POS Tagging Matters

### 1. Word Sense Disambiguation

Many words have different meanings depending on their POS:

| Word | As Noun | As Verb |
|------|---------|---------|
| bank | financial institution | to bank (tilt) |
| run | a jog | to run |
| light | illumination | to light (ignite) |
| book | a publication | to book (reserve) |
| saw | a cutting tool | to see (past tense) |

```python
# "bank" has different meanings based on POS
"I went to the bank"          # bank = NOUN (financial)
"The plane will bank left"    # bank = VERB (tilt)
```

### 2. Lemmatization Accuracy

As we learned, POS is crucial for correct lemmatization:

$$\text{lemma}(\text{"running"}, \text{VERB}) = \text{"run"}$$
$$\text{lemma}(\text{"running"}, \text{NOUN}) = \text{"running"}$$

### 3. Information Extraction

POS helps extract specific types of information:

- **Nouns** → entities, topics, key concepts
- **Verbs** → actions, events, relationships
- **Adjectives** → opinions, descriptions, sentiments

---

## Penn Treebank Tag Set

The **Penn Treebank** tag set is the most widely used in English NLP. It has 36 POS tags plus 12 punctuation/symbol tags.

### Common Tags

| Tag | Description | Examples |
|-----|-------------|----------|
| NN | Noun, singular | dog, city, music |
| NNS | Noun, plural | dogs, cities |
| NNP | Proper noun, singular | London, Alice |
| NNPS | Proper noun, plural | Americans, Himalayas |
| VB | Verb, base form | run, eat, go |
| VBD | Verb, past tense | ran, ate, went |
| VBG | Verb, gerund | running, eating |
| VBN | Verb, past participle | run, eaten, gone |
| VBP | Verb, present (non-3rd) | run, eat |
| VBZ | Verb, present (3rd person) | runs, eats |
| JJ | Adjective | big, green, happy |
| JJR | Adjective, comparative | bigger, greener |
| JJS | Adjective, superlative | biggest, greenest |
| RB | Adverb | quickly, silently |
| RBR | Adverb, comparative | faster, better |
| RBS | Adverb, superlative | fastest, best |
| DT | Determiner | the, a, an, this |
| IN | Preposition/conjunction | in, of, like, after |
| CC | Coordinating conjunction | and, but, or |
| PRP | Personal pronoun | I, he, she, they |
| PRP$ | Possessive pronoun | my, his, her |
| MD | Modal | can, will, should |
| TO | "to" | to |
| CD | Cardinal number | one, two, 100 |

### Full Tag Reference

```python
import nltk
nltk.download('tagsets')

# View all Penn Treebank tags with explanations
nltk.help.upenn_tagset()

# Look up a specific tag
nltk.help.upenn_tagset('VBG')
# VBG: verb, present participle or gerund
#     Examples: telegraphing, currentRede, approaching...
```

---

## Universal POS Tags

The **Universal Dependencies** project defines a simpler, cross-lingual tag set with 17 tags:

| Tag | Description | Examples |
|-----|-------------|----------|
| NOUN | Common noun | dog, music, idea |
| PROPN | Proper noun | London, Alice, Google |
| VERB | Verb | run, eat, think |
| ADJ | Adjective | big, old, green |
| ADV | Adverb | quickly, very, well |
| DET | Determiner | the, a, this |
| ADP | Adposition (preposition) | in, on, to |
| CONJ/CCONJ | Conjunction | and, but, or |
| PRON | Pronoun | I, you, she |
| NUM | Numeral | one, 2024, three |
| AUX | Auxiliary verb | is, has, will |
| PART | Particle | not, 's, up |
| INTJ | Interjection | oh, wow, hello |
| SCONJ | Subordinating conjunction | if, while, that |
| PUNCT | Punctuation | . , ! ? |
| SYM | Symbol | $, %, + |
| X | Other | asdf, hmm |

### Penn Treebank vs Universal

```
Penn Treebank:  NN, NNS, NNP, NNPS  →  Universal: NOUN, PROPN
Penn Treebank:  VB, VBD, VBG, VBN, VBP, VBZ  →  Universal: VERB
Penn Treebank:  JJ, JJR, JJS  →  Universal: ADJ
```

Universal tags are simpler but less specific. Penn Treebank tags tell you more (singular vs plural, tense, etc.).

---

## POS Tagging with NLTK

### Basic Usage

```python
import nltk
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

from nltk import pos_tag, word_tokenize

sentence = "The quick brown fox jumps over the lazy dog"
tokens = word_tokenize(sentence)
tagged = pos_tag(tokens)

print(tagged)
# [('The', 'DT'), ('quick', 'JJ'), ('brown', 'JJ'),
#  ('fox', 'NN'), ('jumps', 'VBZ'), ('over', 'IN'),
#  ('the', 'DT'), ('lazy', 'JJ'), ('dog', 'NN')]
```

### Multiple Sentences

```python
import nltk
from nltk import pos_tag, word_tokenize

sentences = [
    "I can fish in the river.",
    "She bought a can of fish.",
    "They fish for compliments.",
]

for sent in sentences:
    tokens = word_tokenize(sent)
    tagged = pos_tag(tokens)
    print(f"\n{sent}")
    for word, tag in tagged:
        print(f"  {word:<15} {tag}")
```

**Output:**

```
I can fish in the river.
  I               PRP
  can             MD
  fish            VB
  in              IN
  the             DT
  river           NN
  .               .

She bought a can of fish.
  She             PRP
  bought          VBD
  a               DT
  can             NN
  of              IN
  fish            NN
  .               .

They fish for compliments.
  They            PRP
  fish            VBP
  for             IN
  compliments     NNS
  .               .
```

Notice how "can" is tagged as `MD` (modal), `NN` (noun), and "fish" is tagged as `VB` (verb) or `NN` (noun) depending on context!

### Universal Tags with NLTK

```python
import nltk
from nltk import pos_tag, word_tokenize

nltk.download('universal_tagset')

sentence = "The cat sat on the mat"
tokens = word_tokenize(sentence)

# Penn Treebank tags
penn_tagged = pos_tag(tokens)
print("Penn Treebank:", penn_tagged)

# Universal tags
uni_tagged = pos_tag(tokens, tagset='universal')
print("Universal:    ", uni_tagged)

# Output:
# Penn Treebank: [('The', 'DT'), ('cat', 'NN'), ('sat', 'VBD'), ('on', 'IN'), ('the', 'DT'), ('mat', 'NN')]
# Universal:     [('The', 'DET'), ('cat', 'NOUN'), ('sat', 'VERB'), ('on', 'ADP'), ('the', 'DET'), ('mat', 'NOUN')]
```

---

## POS Tagging with spaCy

spaCy provides both fine-grained (`.tag_`) and coarse (`.pos_`) POS tags.

### Basic Usage

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "Apple is looking at buying a UK startup for $1 billion"
doc = nlp(text)

print(f"{'Token':<10} {'POS':<8} {'Tag':<6} {'Explanation'}")
print("-" * 55)
for token in doc:
    print(f"{token.text:<10} {token.pos_:<8} {token.tag_:<6} {spacy.explain(token.tag_)}")
```

**Output:**

```
Token      POS      Tag    Explanation
-------------------------------------------------------
Apple      PROPN    NNP    noun, proper singular
is         AUX      VBZ    verb, 3rd person singular present
looking    VERB     VBG    verb, gerund or present participle
at         ADP      IN     conjunction, subordinating or preposition
buying     VERB     VBG    verb, gerund or present participle
a          DET      DT     determiner
UK         PROPN    NNP    noun, proper singular
startup    NOUN     NN     noun, singular or mass
for        ADP      IN     conjunction, subordinating or preposition
$          SYM      $      symbol, currency
1          NUM      CD     cardinal number
billion    NUM      CD     cardinal number
```

### Understanding `.pos_` vs `.tag_`

```python
import spacy

nlp = spacy.load("en_core_web_sm")

doc = nlp("She has been running faster since yesterday")

print(f"{'Token':<12} {'pos_ (coarse)':<15} {'tag_ (fine)':<10}")
print("-" * 37)
for token in doc:
    print(f"{token.text:<12} {token.pos_:<15} {token.tag_:<10}")

# pos_ = Universal POS tag (coarse)
# tag_ = Penn Treebank tag (fine-grained)
```

---

## Accuracy and Common Errors

### How Accurate Is POS Tagging?

Modern POS taggers achieve **97%+ accuracy** on standard benchmarks. However, certain cases are consistently challenging:

### Ambiguous Words

```python
import spacy

nlp = spacy.load("en_core_web_sm")

# Words that are commonly mis-tagged
ambiguous_sentences = [
    "Time flies like an arrow",        # "flies" = verb? noun?
    "Fruit flies like a banana",       # "flies" = noun, "like" = verb
    "I saw her duck",                  # "duck" = noun? verb?
    "The old man the boat",            # "old" = noun, "man" = verb
    "The complex houses married soldiers",  # tricky garden path
]

for sent in ambiguous_sentences:
    doc = nlp(sent)
    print(f"\n'{sent}'")
    for token in doc:
        print(f"  {token.text:<10} → {token.pos_} ({token.tag_})")
```

### Unknown Words

```python
import spacy

nlp = spacy.load("en_core_web_sm")

# POS taggers handle unknown/new words using context
sentences = [
    "I need to google that information",      # "google" as verb
    "She instagrammed her breakfast",          # new verb form
    "The covfefe was trending online",         # nonsense word
]

for sent in sentences:
    doc = nlp(sent)
    print(f"\n'{sent}'")
    for token in doc:
        print(f"  {token.text:<15} {token.pos_}")
```

---

## Using POS for Text Analysis

### Extracting Nouns (Key Topics)

```python
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

text = """
Artificial intelligence and machine learning are transforming healthcare.
Doctors use algorithms to diagnose diseases earlier. Patients benefit from
personalized treatment plans that analyze their genetic information.
Hospitals deploy robots for surgery, reducing human error significantly.
"""

doc = nlp(text)

# Extract all nouns
nouns = [token.lemma_ for token in doc
         if token.pos_ in ("NOUN", "PROPN") and len(token.text) > 2]

noun_freq = Counter(nouns)
print("Key topics (nouns):")
for noun, count in noun_freq.most_common(10):
    print(f"  {noun}: {count}")
```

### Extracting Adjectives (Opinions/Descriptions)

```python
import spacy
from collections import Counter

nlp = spacy.load("en_core_web_sm")

reviews = [
    "The hotel was absolutely beautiful with amazing views.",
    "The food was terrible and the service was slow.",
    "Great location but the rooms were tiny and noisy.",
    "Wonderful staff, clean rooms, perfect vacation spot."
]

all_adjectives = []
for review in reviews:
    doc = nlp(review)
    adjs = [token.text.lower() for token in doc if token.pos_ == "ADJ"]
    all_adjectives.extend(adjs)

adj_freq = Counter(all_adjectives)
print("Adjectives in reviews:")
for adj, count in adj_freq.most_common(10):
    print(f"  {adj}: {count}")
```

### Extracting Verb Phrases (Actions)

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "The company launched a new product and hired fifty engineers."
doc = nlp(text)

# Extract subject-verb pairs
for token in doc:
    if token.pos_ == "VERB":
        # Find the subject
        subjects = [child for child in token.children
                    if child.dep_ in ("nsubj", "nsubjpass")]
        # Find the object
        objects = [child for child in token.children
                   if child.dep_ in ("dobj", "attr")]

        subj = subjects[0].text if subjects else "?"
        obj = objects[0].text if objects else "?"
        print(f"  {subj} → {token.text} → {obj}")
```

---

## POS Frequency Analysis

```python
import spacy
from collections import Counter
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

nlp = spacy.load("en_core_web_sm")

text = """
Natural Language Processing is an exciting field that combines
linguistics, computer science, and artificial intelligence. Researchers
develop algorithms that help computers understand, interpret, and
generate human language. Applications include machine translation,
sentiment analysis, chatbots, and speech recognition. The field has
grown rapidly with deep learning approaches achieving remarkable
results on many challenging benchmarks.
"""

doc = nlp(text)

# Count POS tags
pos_counts = Counter(token.pos_ for token in doc
                     if not token.is_punct and not token.is_space)

# Display as table
print(f"{'POS Tag':<10} {'Count':<8} {'Percentage':<12} {'Examples'}")
print("-" * 60)

total = sum(pos_counts.values())
for pos, count in pos_counts.most_common():
    pct = count / total * 100
    # Get example words for this POS
    examples = list(set(t.text for t in doc if t.pos_ == pos))[:3]
    print(f"{pos:<10} {count:<8} {pct:>5.1f}%       {', '.join(examples)}")
```

---

## POS Tag Patterns

### Finding Adjective-Noun Pairs

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = """
The powerful algorithm processed the large dataset efficiently.
A clever solution solved the complex mathematical problem.
The new deep learning model achieved remarkable accuracy.
"""

doc = nlp(text)

# Find ADJ + NOUN patterns
adj_noun_pairs = []
for i in range(len(doc) - 1):
    if doc[i].pos_ == "ADJ" and doc[i+1].pos_ == "NOUN":
        adj_noun_pairs.append(f"{doc[i].text} {doc[i+1].text}")

print("Adjective-Noun pairs found:")
for pair in adj_noun_pairs:
    print(f"  • {pair}")
```

### Finding Noun Phrases with POS

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "The quick brown fox jumped over the extremely lazy dog in the park"
doc = nlp(text)

# Use spaCy's built-in noun chunks (uses POS internally)
print("Noun phrases:")
for chunk in doc.noun_chunks:
    print(f"  '{chunk.text}' (root: {chunk.root.text}, POS: {chunk.root.pos_})")

# Manual: find DET? ADJ* NOUN patterns
print("\nManual DET-ADJ-NOUN patterns:")
i = 0
while i < len(doc):
    if doc[i].pos_ == "DET":
        phrase = [doc[i].text]
        j = i + 1
        while j < len(doc) and doc[j].pos_ == "ADJ":
            phrase.append(doc[j].text)
            j += 1
        if j < len(doc) and doc[j].pos_ == "NOUN":
            phrase.append(doc[j].text)
            print(f"  {' '.join(phrase)}")
            i = j + 1
            continue
    i += 1
```

---

## Complete Example: POS-Based Text Analysis

```python
import spacy
from collections import Counter, defaultdict

nlp = spacy.load("en_core_web_sm")

def analyze_text_pos(text):
    """Comprehensive POS-based text analysis."""
    doc = nlp(text)

    # 1. POS distribution
    pos_dist = Counter(token.pos_ for token in doc
                       if not token.is_punct and not token.is_space)

    # 2. Vocabulary richness by POS
    pos_vocab = defaultdict(set)
    for token in doc:
        if not token.is_punct and not token.is_space:
            pos_vocab[token.pos_].add(token.lemma_.lower())

    # 3. Key metrics
    total_words = sum(pos_dist.values())
    noun_ratio = (pos_dist.get("NOUN", 0) + pos_dist.get("PROPN", 0)) / total_words
    verb_ratio = pos_dist.get("VERB", 0) / total_words
    adj_ratio = pos_dist.get("ADJ", 0) / total_words

    # 4. Print report
    print("=" * 50)
    print("POS ANALYSIS REPORT")
    print("=" * 50)

    print(f"\nTotal words: {total_words}")
    print(f"Noun ratio:  {noun_ratio:.1%} (higher = more descriptive)")
    print(f"Verb ratio:  {verb_ratio:.1%} (higher = more action-oriented)")
    print(f"Adj ratio:   {adj_ratio:.1%} (higher = more descriptive)")

    print(f"\nPOS Distribution:")
    for pos, count in pos_dist.most_common():
        bar = "█" * int(count / total_words * 40)
        print(f"  {pos:<8} {count:>3} ({count/total_words:>5.1%}) {bar}")

    print(f"\nTop nouns: {list(pos_vocab['NOUN'])[:8]}")
    print(f"Top verbs: {list(pos_vocab['VERB'])[:8]}")
    print(f"Top adjs:  {list(pos_vocab['ADJ'])[:8]}")

    return pos_dist

# Test with different text styles
news = """
The Federal Reserve raised interest rates by 0.25 percentage points
on Wednesday, marking the tenth consecutive increase in its aggressive
campaign to combat persistent inflation. Markets reacted positively,
with major indices closing higher after the announcement.
"""

analyze_text_pos(news)
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **POS tagging** | Assigns grammatical role to each word |
| **Penn Treebank** | 36+ fine-grained tags (NN, VBG, JJ...) |
| **Universal POS** | 17 coarse tags (NOUN, VERB, ADJ...) |
| **NLTK** | `pos_tag()` returns (word, tag) tuples |
| **spaCy** | `token.pos_` (coarse) and `token.tag_` (fine) |
| **Accuracy** | ~97% on standard text |
| **Key use** | Disambiguation, lemmatization, extraction |
| **Challenge** | Ambiguous words (bank, fish, duck) |

**Key takeaway:** POS tagging is a foundational NLP task that enables more accurate lemmatization, better information extraction, and deeper text understanding. Modern tools like spaCy make it effortless.

---

## Exercises

1. POS-tag a paragraph and calculate the noun-to-verb ratio. How does it differ between news articles and fiction?
2. Find all ambiguous words in a text (words that appear with different POS tags).
3. Extract all "subject-verb-object" triples from a paragraph using POS and dependency parsing.
4. Build a simple adjective-based sentiment analyzer using POS filtering.
5. Compare POS tagging accuracy between NLTK and spaCy on sentences with ambiguous words.
