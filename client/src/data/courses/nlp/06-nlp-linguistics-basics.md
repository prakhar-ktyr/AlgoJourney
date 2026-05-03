---
title: Linguistics Basics for NLP
---

# Linguistics Basics for NLP

In this lesson, you will learn the foundational concepts from linguistics that power modern NLP systems.

Understanding how human language works helps you build better NLP models.

---

## Why Linguistics Matters for NLP

NLP is about teaching computers to understand human language.

Human language has **rules and structures** — linguistics is the scientific study of those rules.

Key reasons linguistics matters:

| Reason | Example |
|--------|---------|
| Ambiguity resolution | "Bank" = river bank or financial bank? |
| Grammar understanding | Subject-verb-object order varies by language |
| Meaning extraction | "Not bad" actually means "good" |
| Context interpretation | "It" refers to different things in different sentences |

Without linguistic knowledge, your NLP system treats text as random symbols.

---

## Phonetics & Phonology

**Phonetics** studies the physical sounds of speech.

**Phonology** studies how sounds are organized in languages.

### Why This Matters for NLP

- Speech recognition (converting audio to text)
- Text-to-speech synthesis
- Pronunciation modeling

### Key Concepts

| Term | Definition | Example |
|------|-----------|---------|
| Phoneme | Smallest unit of sound | /k/ in "cat" |
| Allophone | Variation of a phoneme | aspirated "p" in "pin" vs unaspirated in "spin" |
| Vowel | Open vocal tract sound | /a/, /e/, /i/ |
| Consonant | Restricted vocal tract sound | /b/, /d/, /k/ |

### The International Phonetic Alphabet (IPA)

The IPA provides a symbol for every possible human speech sound:

- "cat" → /kæt/
- "ship" → /ʃɪp/
- "think" → /θɪŋk/

> **Note:** Phonetics is most relevant for speech-based NLP tasks. For text-based NLP, morphology and syntax matter more.

---

## Morphology

**Morphology** is the study of word structure — how words are formed from smaller meaningful units.

### Morphemes

A **morpheme** is the smallest meaningful unit of language.

| Type | Definition | Example |
|------|-----------|---------|
| Free morpheme | Can stand alone as a word | "cat", "run", "happy" |
| Bound morpheme | Must attach to another morpheme | "-ing", "-ed", "un-" |

### Prefixes and Suffixes

**Prefixes** attach to the beginning of a word:

| Prefix | Meaning | Example |
|--------|---------|---------|
| un- | not | unhappy |
| re- | again | rewrite |
| pre- | before | preview |
| dis- | opposite | disagree |

**Suffixes** attach to the end of a word:

| Suffix | Function | Example |
|--------|----------|---------|
| -ing | present participle | running |
| -ed | past tense | walked |
| -ness | noun from adjective | happiness |
| -ly | adverb from adjective | quickly |

### Word Formation Processes

| Process | Description | Example |
|---------|-------------|---------|
| Derivation | Creating new words with affixes | "happy" → "unhappiness" |
| Compounding | Combining two words | "black" + "board" = "blackboard" |
| Inflection | Grammatical variants | "walk" → "walks", "walked" |

### Why Morphology Matters for NLP

- **Stemming** reduces words to their root: "running" → "run"
- **Lemmatization** finds the dictionary form: "better" → "good"
- **Vocabulary reduction**: treating "run", "runs", "running" as related

---

## Syntax

**Syntax** is the study of sentence structure — how words combine into phrases and sentences.

### Phrase Structure

Sentences are built from nested phrases:

```
Sentence (S)
├── Noun Phrase (NP): "The big cat"
│   ├── Determiner (Det): "The"
│   ├── Adjective (Adj): "big"
│   └── Noun (N): "cat"
└── Verb Phrase (VP): "sat on the mat"
    ├── Verb (V): "sat"
    └── Prepositional Phrase (PP): "on the mat"
        ├── Preposition (P): "on"
        └── Noun Phrase (NP): "the mat"
```

### Dependency Structure

In dependency grammar, words are linked by directed relationships:

```
"The cat sat on the mat"

sat (ROOT)
├── cat (nsubj - nominal subject)
│   └── The (det - determiner)
├── on (prep - preposition)
│   └── mat (pobj - object of preposition)
│       └── the (det - determiner)
```

### Syntactic Ambiguity

The sentence "I saw the man with the telescope" has two meanings:

1. I used a telescope to see the man
2. I saw a man who had a telescope

Syntax parsing helps NLP systems resolve such ambiguity.

---

## Semantics

**Semantics** is the study of meaning — what words and sentences actually mean.

### Word Meaning

| Concept | Definition | Example |
|---------|-----------|---------|
| Synonymy | Same meaning | "big" / "large" |
| Antonymy | Opposite meaning | "hot" / "cold" |
| Hyponymy | "Is-a" relationship | "dog" is a hyponym of "animal" |
| Polysemy | Multiple meanings | "bank" (river/financial) |
| Homonymy | Same form, unrelated meaning | "bat" (animal/sports) |

### Sentence Meaning

Sentence meaning combines word meanings with structure:

- "The dog bit the man" ≠ "The man bit the dog"
- Same words, different meaning due to structure

### Semantic Roles

| Role | Question | Example |
|------|----------|---------|
| Agent | Who did it? | "**John** kicked the ball" |
| Patient | Who/what was affected? | "John kicked **the ball**" |
| Instrument | With what? | "He cut it with **a knife**" |
| Location | Where? | "She lives in **Paris**" |

---

## Pragmatics

**Pragmatics** studies meaning in context — what speakers actually intend.

### Context and Intent

The same sentence means different things in different contexts:

| Sentence | Context | Actual Meaning |
|----------|---------|----------------|
| "Can you pass the salt?" | At dinner | Request (not a question about ability) |
| "Nice weather!" | During a storm | Sarcasm |
| "I'm fine" | After an argument | Possibly not fine |

### Speech Acts

| Type | Purpose | Example |
|------|---------|---------|
| Assertive | Stating facts | "The earth is round" |
| Directive | Making requests | "Close the door" |
| Commissive | Making promises | "I'll be there" |
| Expressive | Expressing feelings | "Congratulations!" |

### Why Pragmatics Matters for NLP

- **Sentiment analysis**: detecting sarcasm and irony
- **Chatbots**: understanding user intent
- **Machine translation**: preserving intended meaning

---

## Parts of Speech

Parts of speech (POS) categorize words by their grammatical function.

### Major POS Categories

| POS | Tag | Example | Function |
|-----|-----|---------|----------|
| Noun | NN | cat, idea | Names things |
| Verb | VB | run, think | Actions/states |
| Adjective | JJ | big, happy | Describes nouns |
| Adverb | RB | quickly, very | Modifies verbs/adjectives |
| Pronoun | PRP | he, she, it | Replaces nouns |
| Preposition | IN | in, on, at | Shows relationships |
| Conjunction | CC | and, but, or | Connects words/phrases |
| Determiner | DT | the, a, this | Specifies nouns |
| Interjection | UH | wow, ouch | Expresses emotion |

### POS Tagging in NLP

POS tagging assigns a grammatical tag to each word:

```
"The    quick   brown   fox    jumps   over   the    lazy   dog"
 DT     JJ      JJ      NN     VBZ     IN     DT     JJ     NN
```

POS tags help with:

- Named entity recognition
- Parsing sentence structure
- Word sense disambiguation
- Information extraction

---

## Constituents and Parse Trees

A **parse tree** shows the hierarchical structure of a sentence.

### Example Parse Tree

For the sentence: **"The cat sat on the mat"**

```
              S
           /     \
         NP       VP
        / \      / \
      Det   N   V    PP
       |    |   |   / \
      The  cat sat  P   NP
                    |  / \
                   on Det  N
                       |   |
                      the mat
```

### Reading a Parse Tree

- **S** = Sentence (top node)
- **NP** = Noun Phrase
- **VP** = Verb Phrase
- **PP** = Prepositional Phrase
- Leaf nodes = actual words

### Constituency vs Dependency Parsing

| Feature | Constituency | Dependency |
|---------|-------------|------------|
| Structure | Hierarchical phrases | Word-to-word links |
| Output | Tree of phrases | Tree of dependencies |
| Focus | What groups together | What modifies what |
| Example tool | Stanford Parser | spaCy |

---

## Code: Linguistic Analysis with spaCy

Let's perform basic linguistic analysis using spaCy:

```python
import spacy

# Load the English model
nlp = spacy.load("en_core_web_sm")

# Analyze a sentence
text = "The quick brown fox jumps over the lazy dog"
doc = nlp(text)

# --- Part-of-Speech Tagging ---
print("=== POS Tagging ===")
print(f"{'Word':<10} {'POS':<8} {'Tag':<6} {'Explanation'}")
print("-" * 50)
for token in doc:
    print(f"{token.text:<10} {token.pos_:<8} {token.tag_:<6} {spacy.explain(token.tag_)}")
```

Output:

```
=== POS Tagging ===
Word       POS      Tag    Explanation
--------------------------------------------------
The        DET      DT     determiner
quick      ADJ      JJ     adjective
brown      ADJ      JJ     adjective
fox        NOUN     NN     noun, singular or mass
jumps      VERB     VBZ    verb, 3rd person singular present
over       ADP      IN     conjunction, subordinating or preposition
the        DET      DT     determiner
lazy       ADJ      JJ     adjective
dog        NOUN     NN     noun, singular or mass
```

### Dependency Parsing

```python
# --- Dependency Parsing ---
print("\n=== Dependency Parsing ===")
print(f"{'Word':<10} {'Dep':<12} {'Head':<10} {'Children'}")
print("-" * 60)
for token in doc:
    children = [child.text for child in token.children]
    print(f"{token.text:<10} {token.dep_:<12} {token.head.text:<10} {children}")
```

Output:

```
=== Dependency Parsing ===
Word       Dep          Head       Children
------------------------------------------------------------
The        det          fox        []
quick      amod         fox        []
brown      amod         fox        []
fox        nsubj        jumps      ['The', 'quick', 'brown']
jumps      ROOT         jumps      ['fox', 'over']
over       prep         jumps      ['dog']
the        det          dog        []
lazy       amod         dog        []
dog        pobj         over       ['the', 'lazy']
```

### Morphological Analysis

```python
# --- Morphological Analysis ---
print("\n=== Morphology ===")
text2 = "She was running quickly towards the unhappiness"
doc2 = nlp(text2)

print(f"{'Word':<15} {'Lemma':<12} {'Morph'}")
print("-" * 60)
for token in doc2:
    print(f"{token.text:<15} {token.lemma_:<12} {token.morph}")
```

### Noun Chunks (Constituency-like)

```python
# --- Noun Chunks ---
print("\n=== Noun Chunks ===")
text3 = "The big brown dog chased the small white cat around the garden"
doc3 = nlp(text3)

for chunk in doc3.noun_chunks:
    print(f"Chunk: '{chunk.text}' | Root: '{chunk.root.text}' | Dep: {chunk.root.dep_}")
```

Output:

```
=== Noun Chunks ===
Chunk: 'The big brown dog' | Root: 'dog' | Dep: nsubj
Chunk: 'the small white cat' | Root: 'cat' | Dep: dobj
Chunk: 'the garden' | Root: 'garden' | Dep: pobj
```

### Sentence Segmentation

```python
# --- Sentence Segmentation ---
print("\n=== Sentence Segmentation ===")
text4 = "NLP is fascinating. It combines linguistics and computer science. Let's learn more!"
doc4 = nlp(text4)

for i, sent in enumerate(doc4.sents, 1):
    print(f"Sentence {i}: {sent.text}")
```

---

## Summary

In this lesson, you learned:

- **Phonetics/Phonology**: sounds of language (speech tasks)
- **Morphology**: word structure (stemming, lemmatization)
- **Syntax**: sentence structure (parsing)
- **Semantics**: meaning (understanding)
- **Pragmatics**: context and intent (chatbots, sentiment)
- **POS tags**: grammatical categories
- **Parse trees**: hierarchical sentence structure
- **spaCy**: practical linguistic analysis in Python

These linguistic concepts form the foundation for every NLP technique you will learn.

---

## Exercises

1. Use spaCy to analyze 5 sentences of your choice — examine POS tags and dependencies
2. Find a sentence with **syntactic ambiguity** and show two possible parse trees
3. List 5 English words and break them into morphemes (prefixes, roots, suffixes)
4. Identify the semantic roles (agent, patient, instrument) in: "The chef cut the vegetables with a sharp knife"
