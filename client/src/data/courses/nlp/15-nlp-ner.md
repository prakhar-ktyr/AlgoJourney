---
title: Named Entity Recognition
---

# Named Entity Recognition

**Named Entity Recognition (NER)** identifies and classifies named entities in text — things like people, organizations, locations, dates, and monetary amounts. It's one of the most practical NLP tasks for extracting structured information from unstructured text.

---

## What Is NER?

NER locates spans of text that refer to real-world entities and labels them with a category:

```
[Apple]_ORG announced that [Tim Cook]_PERSON will visit
[London]_GPE on [January 15, 2025]_DATE to discuss a
[$2 billion]_MONEY investment.
```

Each bracketed span is an **entity mention**, and the subscript is its **entity type**.

---

## Entity Types

### Common Entity Categories

| Label | Description | Examples |
|-------|-------------|----------|
| PERSON | People's names | Albert Einstein, Marie Curie |
| ORG | Organizations | Google, United Nations, MIT |
| GPE | Geo-political entities | France, New York, Tokyo |
| LOC | Non-GPE locations | Mount Everest, Pacific Ocean |
| DATE | Dates and periods | January 2024, next week, 1990s |
| TIME | Times | 3:00 PM, noon, midnight |
| MONEY | Monetary values | $50, €1 million, 500 rupees |
| PERCENT | Percentages | 25%, ten percent |
| PRODUCT | Products | iPhone, Windows 11 |
| EVENT | Named events | World War II, Olympics |
| WORK_OF_ART | Creative works | Mona Lisa, Harry Potter |
| LAW | Legal documents | First Amendment, GDPR |
| LANGUAGE | Languages | English, Mandarin |
| NORP | Nationalities/groups | American, Buddhist, Republican |
| FAC | Facilities | Golden Gate Bridge, Heathrow |
| QUANTITY | Measurements | 6 kg, 100 miles |
| ORDINAL | Ordinal numbers | first, 2nd, third |
| CARDINAL | Cardinal numbers | one, 42, millions |

---

## Rule-Based vs ML-Based NER

### Rule-Based Approach

Uses handcrafted patterns (regular expressions, gazetteers, dictionaries):

```python
import re

def rule_based_ner(text):
    """Simple rule-based NER using patterns."""
    entities = []

    # Money pattern: $X,XXX or $X million
    money_pattern = r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|trillion))?'
    for match in re.finditer(money_pattern, text):
        entities.append((match.group(), "MONEY", match.span()))

    # Date pattern: Month DD, YYYY
    date_pattern = r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4}'
    for match in re.finditer(date_pattern, text):
        entities.append((match.group(), "DATE", match.span()))

    # Email pattern
    email_pattern = r'[\w.-]+@[\w.-]+\.\w+'
    for match in re.finditer(email_pattern, text):
        entities.append((match.group(), "EMAIL", match.span()))

    return entities

text = "On January 15, 2025 the deal worth $2.5 billion was signed. Contact info@company.com"
results = rule_based_ner(text)
for entity, label, span in results:
    print(f"  {entity:<30} → {label}")
```

**Pros:** Predictable, no training data needed, fast
**Cons:** Brittle, doesn't generalize, misses variations

### ML-Based Approach

Uses trained models that learn patterns from labeled data:

$$P(\text{tag}_i | \text{word}_i, \text{context}) = \text{softmax}(\mathbf{W} \cdot \mathbf{h}_i + \mathbf{b})$$

Where $\mathbf{h}_i$ is the hidden representation of word $i$ from a neural network.

**Pros:** Generalizes to unseen text, handles variations, context-aware
**Cons:** Needs training data, can be unpredictable, slower

---

## BIO Tagging Scheme

NER models typically use the **BIO** (Beginning, Inside, Outside) scheme to handle multi-word entities:

```
Token:   Tim    Cook    visited    New     York     yesterday
BIO:     B-PER  I-PER  O          B-GPE   I-GPE    O
```

| Prefix | Meaning |
|--------|---------|
| B- | Beginning of an entity |
| I- | Inside (continuation of) an entity |
| O | Outside (not an entity) |

This allows the model to distinguish between:
- Adjacent entities: `[Tim Cook]_PER visited [New York]_GPE`
- Multi-word entities: "New York" is one GPE, not two separate entities

---

## NER with spaCy

spaCy's NER is fast, accurate, and easy to use.

### Basic Usage

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = """Apple Inc. was founded by Steve Jobs, Steve Wozniak, and
Ronald Wayne in Cupertino, California on April 1, 1976. The company
is now worth over $2.8 trillion and employs about 164,000 people
worldwide."""

doc = nlp(text)

print(f"{'Entity':<25} {'Label':<10} {'Description'}")
print("-" * 60)
for ent in doc.ents:
    print(f"{ent.text:<25} {ent.label_:<10} {spacy.explain(ent.label_)}")
```

**Output:**

```
Entity                    Label      Description
------------------------------------------------------------
Apple Inc.                ORG        Companies, agencies, institutions
Steve Jobs                PERSON     People, including fictional
Steve Wozniak             PERSON     People, including fictional
Ronald Wayne              PERSON     People, including fictional
Cupertino                 GPE        Countries, cities, states
California                GPE        Countries, cities, states
April 1, 1976             DATE       Absolute or relative dates
$2.8 trillion             MONEY      Monetary values
about 164,000             CARDINAL   Numerals that do not fall under another type
```

### Accessing Entity Details

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = "Elon Musk sold $4 billion of Tesla stock on December 12"
doc = nlp(text)

for ent in doc.ents:
    print(f"Text: '{ent.text}'")
    print(f"  Label: {ent.label_} ({spacy.explain(ent.label_)})")
    print(f"  Start: character {ent.start_char}, token {ent.start}")
    print(f"  End:   character {ent.end_char}, token {ent.end}")
    print()
```

### Filtering by Entity Type

```python
import spacy
from collections import defaultdict

nlp = spacy.load("en_core_web_sm")

text = """
Google and Microsoft are competing in the AI space. Satya Nadella
announced a $10 billion investment in OpenAI, while Sundar Pichai
revealed Gemini at a December 2023 event in San Francisco. Amazon's
Andy Jassy also joined the race with a $4 billion deal with Anthropic.
"""

doc = nlp(text)

# Group entities by type
entities_by_type = defaultdict(list)
for ent in doc.ents:
    entities_by_type[ent.label_].append(ent.text)

# Display organized results
for label, entities in sorted(entities_by_type.items()):
    print(f"\n{label} ({spacy.explain(label)}):")
    for entity in entities:
        print(f"  • {entity}")
```

**Output:**

```
CARDINAL (Numerals):
  • 10
  • 4

DATE (Absolute or relative dates):
  • December 2023

GPE (Countries, cities, states):
  • San Francisco

MONEY (Monetary values):
  • $10 billion
  • $4 billion

ORG (Companies, agencies, institutions):
  • Google
  • Microsoft
  • OpenAI
  • Amazon
  • Anthropic

PERSON (People, including fictional):
  • Satya Nadella
  • Sundar Pichai
  • Andy Jassy
```

---

## NER with NLTK

NLTK's NER uses a chunking approach with `ne_chunk`.

### Basic Usage

```python
import nltk
from nltk import word_tokenize, pos_tag, ne_chunk
from nltk.tree import Tree

nltk.download('maxent_ne_chunker')
nltk.download('words')
nltk.download('averaged_perceptron_tagger')
nltk.download('punkt')

text = "Barack Obama was born in Honolulu, Hawaii on August 4, 1961."

# Pipeline: tokenize → POS tag → NER
tokens = word_tokenize(text)
tagged = pos_tag(tokens)
tree = ne_chunk(tagged)

print(tree)
```

**Output (tree structure):**

```
(S
  (PERSON Barack/NNP Obama/NNP)
  was/VBD
  born/VBN
  in/IN
  (GPE Honolulu/NNP)
  ,/,
  (GPE Hawaii/NNP)
  on/IN
  August/NNP
  4/CD
  ,/,
  1961/CD
  ./.)
```

### Extracting Entities from NLTK Tree

```python
import nltk
from nltk import word_tokenize, pos_tag, ne_chunk

def extract_entities_nltk(text):
    """Extract named entities using NLTK."""
    tokens = word_tokenize(text)
    tagged = pos_tag(tokens)
    tree = ne_chunk(tagged)

    entities = []
    for subtree in tree:
        if isinstance(subtree, nltk.Tree):
            entity_text = " ".join(word for word, tag in subtree.leaves())
            entity_label = subtree.label()
            entities.append((entity_text, entity_label))

    return entities

text = """
Microsoft CEO Satya Nadella met with European Union officials
in Brussels to discuss artificial intelligence regulations.
Google and Apple also sent representatives.
"""

entities = extract_entities_nltk(text)
print("Entities found:")
for text, label in entities:
    print(f"  {text:<25} → {label}")
```

### NLTK Entity Categories

| Label | Description |
|-------|-------------|
| PERSON | People |
| ORGANIZATION | Companies, institutions |
| GPE | Geo-political entities |
| LOCATION | Non-GPE locations |
| FACILITY | Buildings, bridges |
| GSP | Geo-socio-political entity |

---

## Visualizing Entities with displaCy

spaCy includes `displaCy`, a built-in visualizer for NER results.

### In Jupyter Notebooks

```python
import spacy
from spacy import displacy

nlp = spacy.load("en_core_web_sm")

text = """When Sebastian Thrun started working on self-driving cars at
Google in 2007, few people outside of the company took him seriously.
Today, autonomous vehicles are a $54 billion industry."""

doc = nlp(text)

# Render in notebook
displacy.render(doc, style="ent", jupyter=True)
```

### Save as HTML

```python
import spacy
from spacy import displacy

nlp = spacy.load("en_core_web_sm")

text = "Apple CEO Tim Cook announced the iPhone 15 at their Cupertino campus on September 12, 2023."
doc = nlp(text)

# Save visualization as HTML file
html = displacy.render(doc, style="ent", page=True)
with open("ner_visualization.html", "w") as f:
    f.write(html)

print("Saved to ner_visualization.html")
```

### Custom Colors

```python
import spacy
from spacy import displacy

nlp = spacy.load("en_core_web_sm")

text = "Elon Musk founded SpaceX in 2002 in Hawthorne, California."
doc = nlp(text)

# Custom colors for entity types
colors = {
    "PERSON": "#ff6b6b",
    "ORG": "#4ecdc4",
    "GPE": "#45b7d1",
    "DATE": "#96ceb4"
}

options = {"colors": colors}
html = displacy.render(doc, style="ent", options=options)
```

---

## Fine-Tuning NER Models (Preview)

When the pre-trained model doesn't recognize your domain-specific entities, you can fine-tune it.

### When You Need Custom NER

- Medical: drug names, diseases, symptoms
- Legal: case numbers, statutes, court names
- Finance: ticker symbols, fund names, financial instruments
- Gaming: character names, item names, location names

### Training Data Format

```python
# spaCy training format: (text, {"entities": [(start, end, label)]})
TRAIN_DATA = [
    ("Aspirin can treat headaches", {"entities": [(0, 7, "DRUG")]}),
    ("Ibuprofen reduces inflammation", {"entities": [(0, 9, "DRUG")]}),
    ("The patient has diabetes mellitus", {"entities": [(16, 33, "DISEASE")]}),
    ("She was prescribed Metformin 500mg", {"entities": [(19, 28, "DRUG")]}),
]
```

### Basic Fine-Tuning (Conceptual)

```python
import spacy
from spacy.training import Example

# Load base model
nlp = spacy.load("en_core_web_sm")

# Get the NER component
ner = nlp.get_pipe("ner")

# Add new entity labels
ner.add_label("DRUG")
ner.add_label("DISEASE")

# Training data
TRAIN_DATA = [
    ("Aspirin treats headaches", {"entities": [(0, 7, "DRUG")]}),
    ("Metformin for diabetes", {"entities": [(0, 9, "DRUG"), (14, 22, "DISEASE")]}),
]

# Fine-tune (simplified — real training uses config files)
optimizer = nlp.resume_training()

for epoch in range(30):
    losses = {}
    for text, annotations in TRAIN_DATA:
        example = Example.from_dict(nlp.make_doc(text), annotations)
        nlp.update([example], drop=0.3, losses=losses)

    if epoch % 10 == 0:
        print(f"Epoch {epoch}, Loss: {losses['ner']:.4f}")

# Test
doc = nlp("The doctor prescribed Ibuprofen for arthritis")
for ent in doc.ents:
    print(f"  {ent.text} → {ent.label_}")
```

> **Note:** For production fine-tuning, use spaCy's `spacy train` CLI with proper config files and evaluation splits.

---

## Applications of NER

### 1. Information Extraction

```python
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_business_info(text):
    """Extract key business entities from text."""
    doc = nlp(text)

    info = {
        "companies": [],
        "people": [],
        "money": [],
        "dates": [],
        "locations": []
    }

    for ent in doc.ents:
        if ent.label_ == "ORG":
            info["companies"].append(ent.text)
        elif ent.label_ == "PERSON":
            info["people"].append(ent.text)
        elif ent.label_ == "MONEY":
            info["money"].append(ent.text)
        elif ent.label_ == "DATE":
            info["dates"].append(ent.text)
        elif ent.label_ in ("GPE", "LOC"):
            info["locations"].append(ent.text)

    return info

news = """
On Tuesday, Microsoft announced a $69 billion acquisition of
Activision Blizzard. CEO Satya Nadella said the deal would close
by June 2023. The transaction was reviewed by regulators in
Washington, Brussels, and London.
"""

result = extract_business_info(news)
for key, values in result.items():
    if values:
        print(f"{key}: {values}")
```

### 2. Anonymization / De-identification

```python
import spacy

nlp = spacy.load("en_core_web_sm")

def anonymize_text(text, entities_to_mask=None):
    """Replace named entities with placeholders."""
    if entities_to_mask is None:
        entities_to_mask = {"PERSON", "ORG", "GPE"}

    doc = nlp(text)

    # Sort entities by start position (reverse for replacement)
    sorted_ents = sorted(doc.ents, key=lambda e: e.start_char, reverse=True)

    anonymized = text
    for ent in sorted_ents:
        if ent.label_ in entities_to_mask:
            placeholder = f"[{ent.label_}]"
            anonymized = (anonymized[:ent.start_char] +
                         placeholder +
                         anonymized[ent.end_char:])

    return anonymized

text = "John Smith works at Google in New York. He earns $150,000 annually."
print("Original:")
print(f"  {text}")
print("\nAnonymized:")
print(f"  {anonymize_text(text)}")

# Output:
# Original:
#   John Smith works at Google in New York. He earns $150,000 annually.
# Anonymized:
#   [PERSON] works at [ORG] in [GPE]. He earns $150,000 annually.
```

### 3. Knowledge Graph Construction

```python
import spacy
from collections import defaultdict

nlp = spacy.load("en_core_web_sm")

def build_entity_relations(text):
    """Extract entity co-occurrences for knowledge graph."""
    doc = nlp(text)

    # Find entities in each sentence
    relations = []
    for sent in doc.sents:
        sent_entities = [ent for ent in sent.ents]
        # Create pairs of co-occurring entities
        for i in range(len(sent_entities)):
            for j in range(i + 1, len(sent_entities)):
                relations.append({
                    "entity1": sent_entities[i].text,
                    "type1": sent_entities[i].label_,
                    "entity2": sent_entities[j].text,
                    "type2": sent_entities[j].label_,
                    "sentence": sent.text.strip()
                })

    return relations

text = """
Tim Cook leads Apple from their headquarters in Cupertino.
Satya Nadella runs Microsoft from Redmond, Washington.
Both companies invested billions in OpenAI during 2023.
"""

relations = build_entity_relations(text)
print("Entity Relations:")
for rel in relations:
    print(f"  {rel['entity1']} ({rel['type1']}) ↔ {rel['entity2']} ({rel['type2']})")
```

---

## Extracting Entities from News Articles

```python
import spacy
from collections import Counter, defaultdict

nlp = spacy.load("en_core_web_sm")

# Simulated news articles
articles = [
    """Tesla CEO Elon Musk announced on Monday that the company would
    invest $5 billion in a new factory in Austin, Texas. The facility
    is expected to create 10,000 jobs by 2025.""",

    """Amazon reported record profits of $21 billion for Q4 2024.
    CEO Andy Jassy credited AWS growth and cost-cutting measures.
    The company's stock rose 8% in after-hours trading in New York.""",

    """The European Union fined Meta $1.3 billion for data privacy
    violations. Mark Zuckerberg responded that the company would appeal
    the decision in Brussels courts by March 2025."""
]

# Analyze all articles
all_entities = defaultdict(list)
entity_freq = Counter()

for i, article in enumerate(articles):
    doc = nlp(article)
    print(f"\n{'='*50}")
    print(f"ARTICLE {i+1}")
    print(f"{'='*50}")

    for ent in doc.ents:
        all_entities[ent.label_].append(ent.text)
        entity_freq[ent.text] += 1
        print(f"  [{ent.label_:<8}] {ent.text}")

# Summary statistics
print(f"\n{'='*50}")
print("SUMMARY ACROSS ALL ARTICLES")
print(f"{'='*50}")

print(f"\nTotal entities found: {sum(entity_freq.values())}")
print(f"\nMost mentioned entities:")
for entity, count in entity_freq.most_common(10):
    print(f"  {entity}: {count} mentions")

print(f"\nEntities by type:")
for label in sorted(all_entities.keys()):
    unique = list(set(all_entities[label]))
    print(f"  {label}: {unique}")
```

---

## Comparing spaCy Models

```python
import spacy

# Small model (faster, less accurate)
nlp_sm = spacy.load("en_core_web_sm")

# For better accuracy, use larger models:
# nlp_md = spacy.load("en_core_web_md")   # medium
# nlp_lg = spacy.load("en_core_web_lg")   # large
# nlp_trf = spacy.load("en_core_web_trf") # transformer-based (best)

text = "Dr. Sarah Chen published her findings in Nature on March 15 at Stanford University."

doc = nlp_sm(text)
print("Entities (en_core_web_sm):")
for ent in doc.ents:
    print(f"  {ent.text:<25} {ent.label_}")

# Tip: For production NER, use en_core_web_trf (transformer model)
# It's slower but significantly more accurate on edge cases
```

---

## Summary

| Concept | Key Point |
|---------|-----------|
| **NER** | Identifies and classifies named entities in text |
| **Entity types** | PERSON, ORG, GPE, DATE, MONEY, etc. |
| **BIO scheme** | B-/I-/O tags for multi-word entities |
| **spaCy** | `doc.ents` — fast, accurate, easy API |
| **NLTK** | `ne_chunk()` — tree-based, less convenient |
| **displaCy** | Built-in visualization for entities |
| **Fine-tuning** | Add custom entities for domain-specific NER |
| **Applications** | Information extraction, anonymization, knowledge graphs |

**Key takeaway:** NER bridges the gap between unstructured text and structured data. Use spaCy for production NER — it's fast, accurate, and provides a clean API. For specialized domains, fine-tune the model with your own labeled data.

---

## Exercises

1. Run NER on a Wikipedia article and extract all organizations and people mentioned.
2. Build an anonymization tool that replaces all personal information with placeholders.
3. Compare NER results between `en_core_web_sm` and `en_core_web_lg` — where does the larger model excel?
4. Create a simple entity-based search: find all articles mentioning a specific person or company.
5. Build a timeline extractor that pairs DATE entities with nearby EVENT or ORG entities.
