---
title: Information Extraction
---

# Information Extraction

**Information Extraction (IE)** is the task of automatically extracting structured information from unstructured text. It transforms free-form text into organized data that machines can process.

---

## What is Information Extraction?

Every day, vast amounts of text are produced — news articles, research papers, social media posts, and reports. IE helps us pull out the important facts:

| Unstructured Text | Structured Output |
|---|---|
| "Apple acquired Beats Electronics for $3 billion in 2014." | Company: Apple, Action: acquired, Target: Beats Electronics, Amount: $3B, Year: 2014 |
| "Marie Curie was born in Warsaw, Poland." | Person: Marie Curie, Relation: born_in, Location: Warsaw, Poland |

**Key Goals:**

- Convert text into machine-readable format
- Build knowledge bases automatically
- Enable question answering over large corpora

---

## Subtasks of Information Extraction

IE is an umbrella term that includes several specific subtasks:

### 1. Named Entity Recognition (NER)

Identifies and classifies named entities in text:

```python
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Barack Obama was born in Hawaii on August 4, 1961.")

for ent in doc.ents:
    print(f"{ent.text:20} → {ent.label_}")
```

**Output:**

```
Barack Obama         → PERSON
Hawaii               → GPE
August 4, 1961       → DATE
```

### 2. Relation Extraction

Identifies relationships between entities:

```
"Einstein worked at Princeton University"
→ (Einstein, employed_at, Princeton University)
```

### 3. Event Extraction

Identifies events and their participants:

```
"A 7.1 earthquake struck Mexico City on September 19, 2017"
→ Event: earthquake
→ Magnitude: 7.1
→ Location: Mexico City
→ Date: September 19, 2017
```

---

## Relation Extraction: Subject-Predicate-Object Triples

Relation extraction aims to find **triples** of the form:

$$(\text{Subject}, \text{Predicate}, \text{Object})$$

### Examples of Triples

| Sentence | Subject | Predicate | Object |
|---|---|---|---|
| "Jeff Bezos founded Amazon" | Jeff Bezos | founded | Amazon |
| "Paris is the capital of France" | Paris | capital_of | France |
| "Water boils at 100°C" | Water | boils_at | 100°C |

### Approaches to Relation Extraction

1. **Pattern-based**: Hand-crafted rules and patterns
2. **Supervised**: Train classifiers on labeled examples
3. **Distant supervision**: Use existing knowledge bases to generate training data
4. **Neural**: End-to-end deep learning models

```python
# Simple pattern-based relation extraction
import re

def extract_born_in(text):
    """Extract (PERSON, born_in, LOCATION) triples."""
    pattern = r"(\w[\w\s]*\w) was born in ([\w\s,]+)"
    matches = re.findall(pattern, text)
    triples = []
    for person, location in matches:
        triples.append((person.strip(), "born_in", location.strip()))
    return triples

text = "Albert Einstein was born in Ulm, Germany. Marie Curie was born in Warsaw, Poland."
triples = extract_born_in(text)

for subj, pred, obj in triples:
    print(f"({subj}, {pred}, {obj})")
```

**Output:**

```
(Albert Einstein, born_in, Ulm, Germany)
(Marie Curie, born_in, Warsaw, Poland)
```

---

## Open Information Extraction (OpenIE)

Unlike traditional RE which targets predefined relations, **Open IE** extracts all possible relations without a fixed schema:

### How OpenIE Works

1. Parse the sentence
2. Identify verb-based relations
3. Extract (arg1, relation, arg2) triples

```python
# Simulating OpenIE-style extraction
def simple_open_ie(sentence):
    """
    Simple OpenIE using SVO pattern detection.
    Real systems (like Stanford OpenIE) are much more sophisticated.
    """
    import spacy
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(sentence)

    triples = []
    for token in doc:
        if token.dep_ == "ROOT" and token.pos_ == "VERB":
            subject = None
            obj = None

            for child in token.children:
                if child.dep_ in ("nsubj", "nsubjpass"):
                    subject = " ".join(
                        [t.text for t in child.subtree]
                    )
                if child.dep_ in ("dobj", "attr", "prep"):
                    obj = " ".join(
                        [t.text for t in child.subtree]
                    )

            if subject and obj:
                triples.append((subject, token.text, obj))

    return triples

sentences = [
    "Google acquired YouTube in 2006.",
    "The cat sat on the mat.",
    "Scientists discovered a new species in the Amazon.",
]

for sent in sentences:
    results = simple_open_ie(sent)
    for triple in results:
        print(f"  ({triple[0]}, {triple[1]}, {triple[2]})")
```

---

## Dependency Parsing for Relation Extraction

Dependency parsing reveals grammatical relationships between words, making it powerful for IE:

```python
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Microsoft hired Satya Nadella as CEO in 2014.")

print("Dependency Parse:")
print(f"{'Token':<12} {'Dep':<10} {'Head':<12} {'Children'}")
print("-" * 60)
for token in doc:
    children = [child.text for child in token.children]
    print(f"{token.text:<12} {token.dep_:<10} {token.head.text:<12} {children}")
```

**Output:**

```
Token        Dep        Head         Children
------------------------------------------------------------
Microsoft    nsubj      hired        []
hired        ROOT       hired        ['Microsoft', 'Nadella', 'as', 'in', '.']
Satya        compound   Nadella      []
Nadella      dobj       hired        ['Satya']
as           prep       hired        ['CEO']
CEO          pobj       as           []
in           prep       hired        ['2014']
2014         pobj       in           []
.            punct      hired        []
```

### Using Dependency Paths for Relations

```python
def extract_relations_dep(doc):
    """Extract relations using dependency patterns."""
    relations = []

    for token in doc:
        # Pattern: Subject -nsubj-> VERB -dobj-> Object
        if token.pos_ == "VERB":
            subjects = [
                child for child in token.children
                if child.dep_ == "nsubj"
            ]
            objects = [
                child for child in token.children
                if child.dep_ == "dobj"
            ]

            for subj in subjects:
                for obj in objects:
                    subj_span = doc[subj.left_edge.i:subj.right_edge.i + 1]
                    obj_span = doc[obj.left_edge.i:obj.right_edge.i + 1]
                    relations.append((
                        subj_span.text,
                        token.lemma_,
                        obj_span.text
                    ))

    return relations

doc = nlp("Tesla manufactures electric vehicles. Apple designs innovative products.")
relations = extract_relations_dep(doc)

for subj, rel, obj in relations:
    print(f"({subj}, {rel}, {obj})")
```

---

## Template Filling

Template filling extracts information to populate predefined structures:

```python
# Template for a job posting
job_template = {
    "company": None,
    "role": None,
    "location": None,
    "salary": None,
    "skills": [],
}

import spacy
import re

nlp = spacy.load("en_core_web_sm")

def fill_job_template(text):
    """Fill a job posting template from text."""
    template = {
        "company": None,
        "role": None,
        "location": None,
        "salary": None,
        "skills": [],
    }

    doc = nlp(text)

    # Extract organizations
    orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    if orgs:
        template["company"] = orgs[0]

    # Extract locations
    locations = [ent.text for ent in doc.ents if ent.label_ == "GPE"]
    if locations:
        template["location"] = locations[0]

    # Extract salary (pattern-based)
    salary_pattern = r"\$[\d,]+(?:k|K)?\s*(?:-\s*\$[\d,]+(?:k|K)?)?"
    salary_match = re.search(salary_pattern, text)
    if salary_match:
        template["salary"] = salary_match.group()

    # Extract skills (keyword matching)
    skill_keywords = [
        "Python", "Java", "JavaScript", "React",
        "SQL", "AWS", "Docker", "Kubernetes",
        "machine learning", "NLP", "deep learning",
    ]
    for skill in skill_keywords:
        if skill.lower() in text.lower():
            template["skills"].append(skill)

    return template

posting = """
Google is hiring a Senior ML Engineer in Mountain View.
Salary: $180,000 - $250,000. Required skills include Python,
machine learning, deep learning, and Docker experience.
"""

result = fill_job_template(posting)
for key, value in result.items():
    print(f"{key:10}: {value}")
```

**Output:**

```
company   : Google
role      : None
location  : Mountain View
salary    : $180,000 - $250,000
skills    : ['Python', 'Docker', 'machine learning', 'deep learning']
```

---

## spaCy for IE: Combining NER and Dependency Trees

The real power of spaCy for IE comes from combining multiple NLP capabilities:

```python
import spacy
from collections import defaultdict

nlp = spacy.load("en_core_web_sm")

def comprehensive_ie(text):
    """
    Perform comprehensive information extraction using spaCy.
    Combines NER, dependency parsing, and pattern matching.
    """
    doc = nlp(text)
    results = {
        "entities": [],
        "relations": [],
        "facts": [],
    }

    # Step 1: Extract all entities
    for ent in doc.ents:
        results["entities"].append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char,
        })

    # Step 2: Extract relations between entities
    for sent in doc.sents:
        entities_in_sent = [
            ent for ent in doc.ents
            if ent.start >= sent.start and ent.end <= sent.end
        ]

        # Find verb connecting entities
        for token in sent:
            if token.pos_ == "VERB" and token.dep_ == "ROOT":
                subj_ents = []
                obj_ents = []

                for ent in entities_in_sent:
                    ent_head = ent.root.head
                    if ent.root.dep_ in ("nsubj", "nsubjpass"):
                        subj_ents.append(ent)
                    elif ent.root.dep_ in ("dobj", "pobj"):
                        obj_ents.append(ent)

                for subj in subj_ents:
                    for obj in obj_ents:
                        results["relations"].append({
                            "subject": subj.text,
                            "predicate": token.lemma_,
                            "object": obj.text,
                        })

    # Step 3: Extract date-entity associations
    dates = [ent for ent in doc.ents if ent.label_ == "DATE"]
    persons = [ent for ent in doc.ents if ent.label_ == "PERSON"]
    orgs = [ent for ent in doc.ents if ent.label_ == "ORG"]

    return results

# Example usage
text = """
Elon Musk founded SpaceX in 2002 in Hawthorne, California.
The company launched its first Falcon 1 rocket in March 2006.
NASA awarded SpaceX a $1.6 billion contract in December 2008.
"""

results = comprehensive_ie(text)

print("=== Entities ===")
for ent in results["entities"]:
    print(f"  {ent['text']:25} [{ent['label']}]")

print("\n=== Relations ===")
for rel in results["relations"]:
    print(f"  ({rel['subject']}, {rel['predicate']}, {rel['object']})")
```

---

## Applications of Information Extraction

### 1. Knowledge Base Construction

```python
# Building a simple knowledge graph from text
class KnowledgeBase:
    def __init__(self):
        self.triples = []
        self.entities = set()

    def add_triple(self, subject, predicate, obj):
        self.triples.append((subject, predicate, obj))
        self.entities.add(subject)
        self.entities.add(obj)

    def query(self, subject=None, predicate=None, obj=None):
        """Query the knowledge base with optional filters."""
        results = []
        for s, p, o in self.triples:
            if subject and s != subject:
                continue
            if predicate and p != predicate:
                continue
            if obj and o != obj:
                continue
            results.append((s, p, o))
        return results

    def summary(self):
        print(f"Knowledge Base: {len(self.triples)} triples, "
              f"{len(self.entities)} entities")

# Populate from extracted information
kb = KnowledgeBase()
kb.add_triple("Apple", "founded_by", "Steve Jobs")
kb.add_triple("Apple", "headquartered_in", "Cupertino")
kb.add_triple("Apple", "industry", "Technology")
kb.add_triple("Steve Jobs", "born_in", "San Francisco")
kb.add_triple("Tim Cook", "CEO_of", "Apple")

kb.summary()

# Query
print("\nFacts about Apple:")
for triple in kb.query(subject="Apple"):
    print(f"  {triple[0]} → {triple[1]} → {triple[2]}")
```

### 2. News Analysis

```python
def analyze_news_article(text):
    """Extract key information from a news article."""
    doc = nlp(text)

    analysis = {
        "people": set(),
        "organizations": set(),
        "locations": set(),
        "dates": set(),
        "money": set(),
    }

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            analysis["people"].add(ent.text)
        elif ent.label_ == "ORG":
            analysis["organizations"].add(ent.text)
        elif ent.label_ == "GPE":
            analysis["locations"].add(ent.text)
        elif ent.label_ == "DATE":
            analysis["dates"].add(ent.text)
        elif ent.label_ == "MONEY":
            analysis["money"].add(ent.text)

    return analysis

article = """
Amazon announced on Tuesday that it will invest $4 billion
in Anthropic, an artificial intelligence startup based in
San Francisco. CEO Andy Jassy said the deal strengthens
Amazon's position in the AI race against Microsoft and Google.
"""

analysis = analyze_news_article(article)
for category, items in analysis.items():
    if items:
        print(f"{category:15}: {', '.join(items)}")
```

---

## Summary

| Concept | Description |
|---|---|
| Information Extraction | Converting unstructured text → structured data |
| NER | Identifying named entities (people, places, orgs) |
| Relation Extraction | Finding relationships between entities |
| OpenIE | Schema-free relation extraction |
| Template Filling | Populating predefined data structures |
| Knowledge Base | Structured storage of extracted facts |

**Key Takeaway:** Information extraction bridges the gap between human-readable text and machine-processable data, enabling applications from search engines to virtual assistants.

---
