---
title: Retrieval-Augmented Generation
---

# Retrieval-Augmented Generation (RAG)

Large language models are powerful — but they can **hallucinate** (make things up) and their knowledge is frozen at training time. **Retrieval-Augmented Generation (RAG)** solves both problems by letting the model look up real documents before answering.

---

## What Is RAG?

RAG combines two capabilities:

| Component | Role |
|-----------|------|
| **Retriever** | Finds relevant documents from a knowledge base |
| **Generator** | Produces an answer using the retrieved context |

Think of it like an open-book exam — the model doesn't have to memorize everything; it can look things up.

---

## Why RAG?

### Problems with Vanilla LLMs

1. **Hallucination** — the model confidently states incorrect facts
2. **Stale knowledge** — training data has a cutoff date
3. **No source attribution** — you can't verify where the answer came from
4. **Domain gaps** — the model may lack expertise in your specific field

### How RAG Helps

- Grounds answers in **real documents**
- Provides **citations** so users can verify
- Keeps knowledge **up to date** without retraining
- Works with **private/proprietary data** the LLM was never trained on

---

## The RAG Pipeline

The standard RAG workflow has two phases: **indexing** (offline) and **querying** (online).

### Phase 1 — Indexing (Offline)

```
Documents → Chunk → Embed → Store in Vector DB
```

1. **Load** raw documents (PDFs, web pages, databases)
2. **Chunk** them into smaller passages
3. **Embed** each chunk into a vector using an embedding model
4. **Store** vectors in a vector database

### Phase 2 — Querying (Online)

```
User Query → Embed → Retrieve Top-K → Augment Prompt → Generate Answer
```

1. **Embed** the user's question with the same embedding model
2. **Retrieve** the top-K most similar chunks from the vector DB
3. **Augment** the LLM prompt with those chunks as context
4. **Generate** an answer grounded in the retrieved text

---

## Document Chunking Strategies

Raw documents are usually too long to embed as a single vector. We split them into **chunks**.

### Common Strategies

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Fixed-size** | Split every N characters/tokens | Simple, predictable |
| **Sentence** | Split on sentence boundaries | Preserving meaning |
| **Paragraph** | Split on paragraph breaks | Structured documents |
| **Recursive** | Try large splits first, fall back to smaller | General purpose |
| **Semantic** | Group sentences by embedding similarity | Topic coherence |

### Key Parameters

- **Chunk size** — typically 256–1024 tokens
- **Chunk overlap** — 10–20% overlap prevents cutting important context

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""]
)

text = """Natural language processing (NLP) is a field of AI.
It focuses on the interaction between computers and human language.
NLP powers applications like translation, summarization, and chatbots."""

chunks = splitter.split_text(text)
for i, chunk in enumerate(chunks):
    print(f"Chunk {i}: {chunk[:80]}...")
```

> **Tip:** Smaller chunks give more precise retrieval; larger chunks give more context. Experiment to find the sweet spot for your data.

---

## Embedding Models for Retrieval

An **embedding model** converts text into a dense vector so we can measure similarity.

### Popular Embedding Models

| Model | Dimensions | Notes |
|-------|-----------|-------|
| `all-MiniLM-L6-v2` | 384 | Fast, good quality |
| `all-mpnet-base-v2` | 768 | Higher quality |
| `text-embedding-3-small` (OpenAI) | 1536 | Commercial API |
| `bge-large-en-v1.5` | 1024 | Open-source, competitive |
| `e5-large-v2` | 1024 | Strong zero-shot |

### Similarity Search

Once chunks and the query are embedded, we find the closest vectors using **cosine similarity**:

$$\text{cosine\_sim}(\mathbf{a}, \mathbf{b}) = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \, \|\mathbf{b}\|}$$

A score near **1.0** means the texts are very similar.

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

docs = [
    "Python is a popular programming language.",
    "RAG combines retrieval with generation.",
    "The capital of France is Paris.",
]

query = "What is retrieval-augmented generation?"

doc_embeddings = model.encode(docs)
query_embedding = model.encode(query)

# Cosine similarity
similarities = np.dot(doc_embeddings, query_embedding) / (
    np.linalg.norm(doc_embeddings, axis=1) * np.linalg.norm(query_embedding)
)

for doc, score in sorted(zip(docs, similarities), key=lambda x: -x[1]):
    print(f"{score:.4f}  {doc}")
```

**Output:**
```
0.6821  RAG combines retrieval with generation.
0.1543  Python is a popular programming language.
0.0872  The capital of France is Paris.
```

---

## Vector Databases

A **vector database** stores embeddings and supports fast similarity search over millions of vectors.

### Popular Options

| Database | Type | Key Feature |
|----------|------|-------------|
| **FAISS** | Library (Meta) | Blazing fast, in-memory |
| **Chroma** | Embedded DB | Easy to use, Python-native |
| **Pinecone** | Cloud service | Fully managed, scalable |
| **Weaviate** | Self-hosted / cloud | Hybrid search (vector + keyword) |
| **Qdrant** | Self-hosted / cloud | Rich filtering support |
| **Milvus** | Self-hosted | Distributed, high scale |

### FAISS Example

**FAISS** (Facebook AI Similarity Search) is a library for efficient similarity search:

```python
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

# Our knowledge base
documents = [
    "RAG stands for Retrieval-Augmented Generation.",
    "It combines a retriever with a language model.",
    "The retriever finds relevant documents from a database.",
    "The generator produces answers using retrieved context.",
    "RAG reduces hallucination in language models.",
    "Vector databases store document embeddings for fast search.",
    "FAISS is an efficient library for similarity search.",
    "Transformers are the architecture behind modern LLMs.",
]

# Embed all documents
doc_vectors = model.encode(documents).astype("float32")

# Build FAISS index
dimension = doc_vectors.shape[1]  # 384
index = faiss.IndexFlatL2(dimension)
index.add(doc_vectors)

print(f"Index contains {index.ntotal} vectors of dimension {dimension}")
```

**Output:**
```
Index contains 8 vectors of dimension 384
```

---

## Building a Simple RAG System

Let's put it all together — a complete RAG pipeline with FAISS and Hugging Face.

### Step 1 — Index Documents

```python
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Knowledge base (in practice, load from files/databases)
knowledge_base = [
    "Python was created by Guido van Rossum and released in 1991.",
    "Python supports multiple programming paradigms including OOP and functional.",
    "Python's package manager is pip, and packages are hosted on PyPI.",
    "Virtual environments isolate project dependencies in Python.",
    "NumPy provides support for large multi-dimensional arrays in Python.",
    "Pandas is a data manipulation library built on top of NumPy.",
    "Scikit-learn provides machine learning algorithms for Python.",
    "TensorFlow and PyTorch are popular deep learning frameworks.",
    "Flask and Django are popular Python web frameworks.",
    "Python uses indentation to define code blocks instead of braces.",
]

# Embed and index
vectors = embedder.encode(knowledge_base).astype("float32")
index = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)
```

### Step 2 — Retrieve Relevant Documents

```python
def retrieve(query, top_k=3):
    """Retrieve the top-K most relevant documents for a query."""
    query_vector = embedder.encode([query]).astype("float32")
    distances, indices = index.search(query_vector, top_k)

    results = []
    for i, idx in enumerate(indices[0]):
        results.append({
            "text": knowledge_base[idx],
            "score": float(distances[0][i]),
        })
    return results

# Test retrieval
query = "What libraries are used for machine learning in Python?"
results = retrieve(query)

print(f"Query: {query}\n")
for r in results:
    print(f"  [{r['score']:.2f}] {r['text']}")
```

**Output:**
```
Query: What libraries are used for machine learning in Python?

  [0.75] Scikit-learn provides machine learning algorithms for Python.
  [0.98] TensorFlow and PyTorch are popular deep learning frameworks.
  [1.12] NumPy provides support for large multi-dimensional arrays in Python.
```

### Step 3 — Augment the Prompt

```python
def build_rag_prompt(query, retrieved_docs):
    """Build a prompt that includes retrieved context."""
    context = "\n".join(f"- {doc['text']}" for doc in retrieved_docs)

    prompt = f"""Answer the question based on the context below.
If the context doesn't contain the answer, say "I don't know."

Context:
{context}

Question: {query}

Answer:"""
    return prompt

# Build the prompt
retrieved = retrieve("What is pip?")
prompt = build_rag_prompt("What is pip?", retrieved)
print(prompt)
```

**Output:**
```
Answer the question based on the context below.
If the context doesn't contain the answer, say "I don't know."

Context:
- Python's package manager is pip, and packages are hosted on PyPI.
- Virtual environments isolate project dependencies in Python.
- Python supports multiple programming paradigms including OOP and functional.

Question: What is pip?

Answer:
```

### Step 4 — Generate an Answer

```python
from transformers import pipeline

# Use a small model for demonstration
generator = pipeline("text2text-generation", model="google/flan-t5-base")

def rag_answer(query, top_k=3):
    """Full RAG pipeline: retrieve, augment, generate."""
    retrieved = retrieve(query, top_k=top_k)
    prompt = build_rag_prompt(query, retrieved)
    response = generator(prompt, max_new_tokens=100)[0]["generated_text"]
    return response, retrieved

# Ask a question
answer, sources = rag_answer("What is pip in Python?")
print(f"Answer: {answer}")
print(f"\nSources:")
for s in sources:
    print(f"  - {s['text']}")
```

**Output:**
```
Answer: pip is Python's package manager, and packages are hosted on PyPI.

Sources:
  - Python's package manager is pip, and packages are hosted on PyPI.
  - Virtual environments isolate project dependencies in Python.
  - Python supports multiple programming paradigms including OOP and functional.
```

---

## LangChain & LlamaIndex (Overview)

Two popular frameworks simplify building RAG systems:

### LangChain

- Modular framework for LLM applications
- Provides document loaders, splitters, vector stores, and chains
- Supports many LLM providers and vector DBs

```python
# Pseudocode — LangChain RAG in a few lines
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

vectorstore = FAISS.from_texts(documents, HuggingFaceEmbeddings())
qa = RetrievalQA.from_chain_type(llm=my_llm, retriever=vectorstore.as_retriever())
answer = qa.run("What is RAG?")
```

### LlamaIndex

- Focused specifically on RAG and data indexing
- Excellent for connecting LLMs to custom data sources
- Simpler API for common RAG patterns

```python
# Pseudocode — LlamaIndex RAG
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader("./data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("What is RAG?")
```

---

## Evaluating RAG Systems

A RAG system can fail in two ways: **bad retrieval** or **bad generation**. Evaluate both.

### Retrieval Metrics

| Metric | What It Measures |
|--------|-----------------|
| **Recall@K** | % of relevant docs found in top-K |
| **MRR** (Mean Reciprocal Rank) | How high the first relevant doc ranks |
| **nDCG** | Quality of the ranking order |

### Generation Metrics

| Metric | What It Measures |
|--------|-----------------|
| **Faithfulness** | Does the answer stick to the retrieved context? |
| **Answer relevance** | Does the answer actually address the question? |
| **Context relevance** | Were the retrieved documents useful? |

### RAGAS Framework

The **RAGAS** library provides automated evaluation for RAG:

```python
# Pseudocode — RAGAS evaluation
from ragas.metrics import faithfulness, answer_relevancy, context_precision

scores = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision],
)
print(scores)
# {'faithfulness': 0.87, 'answer_relevancy': 0.92, 'context_precision': 0.79}
```

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Chunks too large | Reduce chunk size, add overlap |
| Irrelevant retrieval | Better embeddings, reranking |
| Lost context | Increase top-K, use parent-document retrieval |
| Hallucination despite context | Stricter prompts, faithfulness checks |
| Slow at scale | Use approximate nearest neighbors (HNSW) |

---

## Summary

| Concept | Key Takeaway |
|---------|-------------|
| RAG | Combines retrieval with generation to ground LLM answers |
| Pipeline | Query → Embed → Retrieve → Augment → Generate |
| Chunking | Split documents into 256–1024 token passages |
| Embeddings | Convert text to vectors for similarity search |
| Vector DB | FAISS, Chroma, Pinecone — store and search embeddings |
| Evaluation | Measure retrieval quality AND generation faithfulness |

RAG is the most practical way to build LLM applications over custom data — and it doesn't require fine-tuning a single parameter.

---
