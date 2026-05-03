---
title: Knowledge Graphs & NLP
---

# Knowledge Graphs & NLP

Language models are great at generating fluent text — but they often lack **structured knowledge**. A **knowledge graph** (KG) organizes facts as a network of entities and relationships, giving NLP systems a structured backbone to reason over.

---

## What Is a Knowledge Graph?

A knowledge graph is a network of **entities** (nodes) connected by **relationships** (edges).

```
[Albert Einstein] --born_in--> [Ulm, Germany]
[Albert Einstein] --field--> [Physics]
[Albert Einstein] --won--> [Nobel Prize in Physics]
[Nobel Prize in Physics] --year--> [1921]
```

### Key Properties

| Property | Description |
|----------|-------------|
| **Entities** | Real-world things: people, places, concepts |
| **Relations** | How entities connect: "born_in", "works_at", "is_a" |
| **Attributes** | Properties of entities: dates, numbers, descriptions |
| **Schema** | Optional type system defining entity/relation types |

---

## Triples: The Building Block

Every fact in a knowledge graph is stored as a **triple**:

$$(\text{subject}, \text{predicate}, \text{object})$$

| Subject | Predicate | Object |
|---------|-----------|--------|
| Albert Einstein | born_in | Ulm |
| Albert Einstein | occupation | Physicist |
| Python | created_by | Guido van Rossum |
| Python | first_released | 1991 |
| Earth | orbits | Sun |

```python
# Representing triples in Python
knowledge_base = [
    ("Albert Einstein", "born_in", "Ulm, Germany"),
    ("Albert Einstein", "born_year", "1879"),
    ("Albert Einstein", "field", "Physics"),
    ("Albert Einstein", "won", "Nobel Prize in Physics"),
    ("Marie Curie", "born_in", "Warsaw, Poland"),
    ("Marie Curie", "field", "Physics"),
    ("Marie Curie", "field", "Chemistry"),
    ("Marie Curie", "won", "Nobel Prize in Physics"),
    ("Marie Curie", "won", "Nobel Prize in Chemistry"),
    ("Nobel Prize in Physics", "year_first_awarded", "1901"),
]

# Simple queries
def query_kg(subject=None, predicate=None, obj=None):
    """Query the knowledge base with optional filters."""
    results = []
    for s, p, o in knowledge_base:
        if subject and s != subject:
            continue
        if predicate and p != predicate:
            continue
        if obj and o != obj:
            continue
        results.append((s, p, o))
    return results

# Who was born in Warsaw?
print("Born in Warsaw:")
for s, p, o in query_kg(predicate="born_in", obj="Warsaw, Poland"):
    print(f"  {s}")

# What did Marie Curie win?
print("\nMarie Curie won:")
for s, p, o in query_kg(subject="Marie Curie", predicate="won"):
    print(f"  {o}")

# Who works in Physics?
print("\nPhysicists:")
for s, p, o in query_kg(predicate="field", obj="Physics"):
    print(f"  {s}")
```

**Output:**
```
Born in Warsaw:
  Marie Curie

Marie Curie won:
  Nobel Prize in Physics
  Nobel Prize in Chemistry

Physicists:
  Albert Einstein
  Marie Curie
```

---

## Popular Knowledge Graphs

| KG | Creator | Size | Access |
|----|---------|------|--------|
| **Wikidata** | Wikimedia | 100M+ entities | Free, SPARQL endpoint |
| **DBpedia** | Community | 6M+ entities | Free, SPARQL endpoint |
| **YAGO** | Max Planck | 10M+ entities | Free download |
| **Freebase** | Google | 3B+ triples | Archived (use Wikidata) |
| **Google KG** | Google | Billions | Limited API |
| **ConceptNet** | MIT | Common sense knowledge | Free API |

### Wikidata Example

Wikidata uses a structured identifier system:

- **Q-items** = entities (Q937 = Albert Einstein)
- **P-properties** = relationships (P19 = place of birth)

```
Q937 (Einstein) → P19 (place of birth) → Q3012 (Ulm)
Q937 (Einstein) → P166 (award received) → Q38104 (Nobel Prize in Physics)
```

---

## Building KGs from Text

The most common NLP pipeline for building knowledge graphs:

```
Raw Text → NER → Coreference Resolution → Relation Extraction → KG
```

### Step 1 — Named Entity Recognition

Extract entities from text:

```python
import spacy

nlp = spacy.load("en_core_web_sm")

text = """Albert Einstein was born in Ulm, Germany in 1879.
He developed the theory of relativity while working at
the Swiss Patent Office in Bern. Einstein received the
Nobel Prize in Physics in 1921 for his work on the
photoelectric effect."""

doc = nlp(text)

print("Entities found:")
print(f"{'Text':<25} {'Label':<12} {'Description'}")
print("-" * 55)
for ent in doc.ents:
    print(f"{ent.text:<25} {ent.label_:<12} {spacy.explain(ent.label_)}")
```

**Output:**
```
Entities found:
Text                      Label        Description
-------------------------------------------------------
Albert Einstein           PERSON       People, including fictional
Ulm                       GPE          Countries, cities, states
Germany                   GPE          Countries, cities, states
1879                      DATE         Absolute or relative dates
the Swiss Patent Office   ORG          Companies, agencies, institutions
Bern                      GPE          Countries, cities, states
Einstein                  PERSON       People, including fictional
the Nobel Prize in Physics WORK_OF_ART Titles of books, songs, etc.
1921                      DATE         Absolute or relative dates
```

### Step 2 — Relation Extraction

Identify how entities relate to each other:

```python
def extract_relations_simple(doc):
    """Extract simple subject-verb-object relations."""
    relations = []
    for sent in doc.sents:
        for token in sent:
            if token.dep_ == "nsubj" and token.head.pos_ == "VERB":
                verb = token.head
                subject = token.text
                for child in verb.children:
                    if child.dep_ in ("dobj", "attr"):
                        relations.append((subject, verb.text, child.text))
                    elif child.dep_ == "prep":
                        for pobj in child.children:
                            if pobj.dep_ == "pobj":
                                relations.append((subject, f"{verb.text}_{child.text}", pobj.text))
    return relations

relations = extract_relations_simple(doc)
print("Extracted Relations:")
for subj, rel, obj in relations:
    print(f"  ({subj}) --[{rel}]--> ({obj})")
```

### Step 3 — Build the Graph

```python
import networkx as nx

def build_knowledge_graph(text):
    """Build a knowledge graph from raw text."""
    doc = nlp(text)
    G = nx.DiGraph()

    # Add entities as nodes
    for ent in doc.ents:
        G.add_node(ent.text, label=ent.label_)

    # Add relations as edges (simplified: connect co-occurring entities)
    for sent in doc.sents:
        sent_ents = [ent for ent in doc.ents if ent.start >= sent.start and ent.end <= sent.end]
        for i in range(len(sent_ents)):
            for j in range(i + 1, len(sent_ents)):
                G.add_edge(
                    sent_ents[i].text,
                    sent_ents[j].text,
                    relation="co_occurs",
                    sentence=sent.text.strip(),
                )

    return G

# Build the graph
kg = build_knowledge_graph(text)

print(f"Knowledge Graph: {kg.number_of_nodes()} nodes, {kg.number_of_edges()} edges\n")

print("Nodes:")
for node, data in kg.nodes(data=True):
    print(f"  [{data.get('label', '?'):>10}] {node}")

print("\nEdges:")
for u, v, data in kg.edges(data=True):
    print(f"  {u} → {v}")
```

**Output:**
```
Knowledge Graph: 9 nodes, 8 edges

Nodes:
  [    PERSON] Albert Einstein
  [       GPE] Ulm
  [       GPE] Germany
  [      DATE] 1879
  [       ORG] the Swiss Patent Office
  [       GPE] Bern
  [    PERSON] Einstein
  [WORK_OF_ART] the Nobel Prize in Physics
  [      DATE] 1921
```

---

## Knowledge Graph Embeddings

Just like word embeddings map words to vectors, **KG embeddings** map entities and relations to vectors for link prediction and reasoning.

### TransE

The simplest KG embedding model. For a valid triple $(h, r, t)$:

$$\mathbf{h} + \mathbf{r} \approx \mathbf{t}$$

The head entity plus the relation should equal the tail entity in embedding space.

**Scoring function:**

$$f(h, r, t) = -\|\mathbf{h} + \mathbf{r} - \mathbf{t}\|$$

Higher score = more likely to be true.

### Other Models

| Model | Idea | Scoring Function |
|-------|------|-----------------|
| **TransE** | Translation: $h + r \approx t$ | $-\|\mathbf{h} + \mathbf{r} - \mathbf{t}\|$ |
| **TransR** | Separate entity/relation spaces | Project entities into relation space |
| **ComplEx** | Complex-valued embeddings | $\text{Re}(\langle \mathbf{h}, \mathbf{r}, \bar{\mathbf{t}} \rangle)$ |
| **RotatE** | Rotation in complex plane | $\|\mathbf{h} \circ \mathbf{r} - \mathbf{t}\|$ |
| **DistMult** | Bilinear diagonal model | $\langle \mathbf{h}, \mathbf{r}, \mathbf{t} \rangle$ |

```python
import numpy as np

class SimpleTransE:
    """Minimal TransE implementation for demonstration."""

    def __init__(self, entities, relations, dim=50):
        self.entity_emb = {
            e: np.random.randn(dim) * 0.1 for e in entities
        }
        self.relation_emb = {
            r: np.random.randn(dim) * 0.1 for r in relations
        }
        for e in self.entity_emb:
            self.entity_emb[e] /= np.linalg.norm(self.entity_emb[e])

    def score(self, h, r, t):
        """Score a triple: higher = more likely true."""
        return -np.linalg.norm(
            self.entity_emb[h] + self.relation_emb[r] - self.entity_emb[t]
        )

entities = ["Einstein", "Curie", "Ulm", "Warsaw", "Physics", "Chemistry"]
relations = ["born_in", "field"]
triples = [
    ("Einstein", "born_in", "Ulm"),
    ("Curie", "born_in", "Warsaw"),
    ("Einstein", "field", "Physics"),
    ("Curie", "field", "Chemistry"),
]

model = SimpleTransE(entities, relations, dim=20)

print("Triple scores (higher = more plausible):")
for h, r, t in triples:
    print(f"  ({h}, {r}, {t}): {model.score(h, r, t):.4f}")

# A likely false triple
print(f"\n  (Einstein, born_in, Warsaw) [FALSE]: {model.score('Einstein', 'born_in', 'Warsaw'):.4f}")
```

---

## KG-Enhanced NLP

### Grounding Language Models in Knowledge

Language models generate plausible text but may hallucinate facts. KGs provide **verified facts** to ground generation.

| Approach | How It Works |
|----------|-------------|
| **KG-augmented prompts** | Inject relevant triples into the LLM prompt |
| **Entity linking** | Connect text mentions to KG entities |
| **KG-guided generation** | Constrain outputs to facts in the KG |
| **Graph neural networks** | Encode KG structure alongside text |

```python
def kg_augmented_prompt(question, kg_triples):
    """Build a prompt augmented with knowledge graph facts."""
    facts = "\n".join(
        f"- {s} {p.replace('_', ' ')} {o}" for s, p, o in kg_triples
    )

    prompt = f"""Answer the question using the facts below.

Known Facts:
{facts}

Question: {question}

Answer:"""
    return prompt

# Relevant triples from our KG
relevant_triples = [
    ("Marie Curie", "born_in", "Warsaw, Poland"),
    ("Marie Curie", "field", "Physics"),
    ("Marie Curie", "field", "Chemistry"),
    ("Marie Curie", "won", "Nobel Prize in Physics"),
    ("Marie Curie", "won", "Nobel Prize in Chemistry"),
]

question = "What awards did Marie Curie receive?"
prompt = kg_augmented_prompt(question, relevant_triples)
print(prompt)
```

**Output:**
```
Answer the question using the facts below.

Known Facts:
- Marie Curie born in Warsaw, Poland
- Marie Curie field Physics
- Marie Curie field Chemistry
- Marie Curie won Nobel Prize in Physics
- Marie Curie won Nobel Prize in Chemistry

Question: What awards did Marie Curie receive?

Answer:
```

---

## SPARQL: Querying Knowledge Graphs

**SPARQL** is the standard query language for knowledge graphs (like SQL for relational databases).

### Basic Syntax

```sparql
SELECT ?person ?birthPlace
WHERE {
  ?person wdt:P31 wd:Q5 .        # instance of human
  ?person wdt:P19 ?birthPlace .   # place of birth
  ?person wdt:P166 wd:Q38104 .   # received Nobel Prize in Physics
}
LIMIT 10
```

You can query Wikidata's SPARQL endpoint with Python's `requests` library by sending the query string to `https://query.wikidata.org/sparql` and parsing the JSON response.

---

## Applications

### Question Answering over KGs

```python
def simple_qa(question, knowledge_base):
    """Answer questions using a knowledge graph."""
    doc = nlp(question)

    # Extract entities from the question
    entities = [ent.text for ent in doc.ents]

    # Find matching triples
    answers = []
    for s, p, o in knowledge_base:
        for entity in entities:
            if entity.lower() in s.lower():
                answers.append((s, p, o))
            elif entity.lower() in o.lower():
                answers.append((s, p, o))

    return answers

# Knowledge base
kb = [
    ("Python", "created_by", "Guido van Rossum"),
    ("Python", "first_released", "1991"),
    ("Python", "paradigm", "multi-paradigm"),
    ("JavaScript", "created_by", "Brendan Eich"),
    ("JavaScript", "first_released", "1995"),
    ("Guido van Rossum", "nationality", "Dutch"),
]

questions = [
    "Who created Python?",
    "When was JavaScript released?",
]

for q in questions:
    print(f"Q: {q}")
    for s, p, o in simple_qa(q, kb):
        print(f"  → {s} | {p} | {o}")
    print()
```

### Fact Checking

Use KGs to verify claims — compare a (subject, predicate, object) triple against the knowledge base and return SUPPORTED, REFUTED, or NOT ENOUGH INFO.

```python
def check_fact(claim_triple, knowledge_base):
    """Check if a claim is supported by the knowledge base."""
    s, p, o = claim_triple
    for ks, kp, ko in knowledge_base:
        if ks.lower() == s.lower() and kp.lower() == p.lower():
            if ko.lower() == o.lower():
                return "SUPPORTED"
            return f"REFUTED (expected: {ko})"
    return "NOT ENOUGH INFO"

claims = [
    ("Python", "created_by", "Guido van Rossum"),
    ("Python", "created_by", "Brendan Eich"),
    ("Ruby", "created_by", "Matz"),
]
for c in claims:
    print(f"  {c} → {check_fact(c, kb)}")
```

---

## Complete Example: Text to Knowledge Graph

```python
import spacy
import networkx as nx

nlp = spacy.load("en_core_web_sm")

article = """
Google was founded by Larry Page and Sergey Brin in September 1998.
The company is headquartered in Mountain View, California.
Sundar Pichai became CEO of Google in 2015.
Google developed TensorFlow, an open-source machine learning framework.
"""

doc = nlp(article)
G = nx.DiGraph()

for ent in doc.ents:
    G.add_node(ent.text, type=ent.label_)

for sent in doc.sents:
    ents = [e for e in doc.ents if e.start >= sent.start and e.end <= sent.end]
    for i in range(len(ents)):
        for j in range(i + 1, len(ents)):
            G.add_edge(ents[i].text, ents[j].text)

print(f"Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
for node, data in G.nodes(data=True):
    print(f"  [{data.get('type', '?'):>10}] {node}")

centrality = nx.degree_centrality(G)
print("\nMost connected:")
for entity, score in sorted(centrality.items(), key=lambda x: -x[1])[:3]:
    print(f"  {entity}: {score:.3f}")
```

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| Knowledge graph | Network of entities connected by typed relationships |
| Triples | (subject, predicate, object) — the atomic unit of a KG |
| Building KGs | NER + relation extraction from text |
| Popular KGs | Wikidata, DBpedia, YAGO — millions of facts |
| KG embeddings | TransE, ComplEx — represent entities/relations as vectors |
| KG + LLMs | Ground language model outputs in verified facts |
| SPARQL | Query language for structured knowledge graphs |
| Applications | QA, fact checking, recommendation, reasoning |

Knowledge graphs give NLP systems something language models alone can't provide: **structured, verifiable facts**. Combining the fluency of LLMs with the precision of KGs is one of the most promising directions in modern NLP.

---
