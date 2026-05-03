---
title: Question Answering
---

# Question Answering

**Question Answering (QA)** is the task of automatically answering questions posed in natural language. QA systems find or generate answers from a given context, knowledge base, or open corpus.

---

## Types of Question Answering

| Type | Description | Example |
|------|-------------|---------|
| **Extractive** | Find the answer span in a passage | "Paris" from "The capital of France is Paris." |
| **Abstractive** | Generate an answer in new words | Rephrase or combine information |
| **Open-Domain** | Answer from a large corpus (no context given) | Wikipedia-scale search + answer |
| **Closed-Domain** | Answer from a specific domain | Medical, legal, technical QA |

---

## Extractive Question Answering

In extractive QA, the model identifies the **start** and **end** positions of the answer within a given passage.

### How It Works

Given:
- **Context:** "Albert Einstein was born in Ulm, Germany, on March 14, 1879."
- **Question:** "Where was Einstein born?"

The model predicts:
- Start position: token index of "Ulm"
- End position: token index of "Germany"
- **Answer:** "Ulm, Germany"

### Mathematical Formulation

The model produces two probability distributions over token positions:

$$P_{\text{start}}(i) = \frac{e^{S \cdot T_i}}{\sum_j e^{S \cdot T_j}}$$

$$P_{\text{end}}(i) = \frac{e^{E \cdot T_i}}{\sum_j e^{E \cdot T_j}}$$

Where:
- $T_i$ = hidden state of token at position $i$
- $S$ = learned start vector
- $E$ = learned end vector

The answer span is:

$$\hat{a} = \arg\max_{i \leq j} P_{\text{start}}(i) \cdot P_{\text{end}}(j)$$

---

## The SQuAD Dataset

**SQuAD** (Stanford Question Answering Dataset) is the benchmark for extractive QA:

### SQuAD 1.1
- 100,000+ question-answer pairs
- Answers are always spans from the passage
- Every question has an answer in the context

### SQuAD 2.0
- Adds 50,000+ **unanswerable** questions
- Model must determine when no answer exists
- More realistic and challenging

### Example from SQuAD

```
Context: "The Normans were the people who in the 10th and 11th
centuries gave their name to Normandy, a region in France. They
were descended from Norse Vikings."

Question: "In what country is Normandy located?"
Answer: "France"
Start position: 89 (character offset)
```

### Data Format

```python
# SQuAD format (simplified)
squad_example = {
    "context": "The Normans gave their name to Normandy, a region in France.",
    "question": "Where is Normandy?",
    "answers": {
        "text": ["France"],
        "answer_start": [54]
    }
}
```

---

## BERT for Question Answering

**BERT** revolutionized extractive QA by providing rich contextual representations.

### Architecture

```
Input:  [CLS] question tokens [SEP] context tokens [SEP]
         ↓
      BERT encoder (12/24 layers)
         ↓
      Hidden states for each token
         ↓
      Start/End linear layers
         ↓
Output: Start logits, End logits
```

### Fine-tuning BERT for QA

```python
from transformers import BertForQuestionAnswering, BertTokenizer
import torch

# Load pre-trained BERT fine-tuned on SQuAD
model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForQuestionAnswering.from_pretrained(model_name)

def answer_question(question, context):
    """Extract answer from context using BERT."""
    # Tokenize input
    inputs = tokenizer(
        question,
        context,
        return_tensors="pt",
        max_length=512,
        truncation=True,
    )

    # Get predictions
    with torch.no_grad():
        outputs = model(**inputs)

    # Find best start and end positions
    start_logits = outputs.start_logits
    end_logits = outputs.end_logits

    start_idx = torch.argmax(start_logits)
    end_idx = torch.argmax(end_logits)

    # Convert token indices to text
    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    answer = tokenizer.convert_tokens_to_string(
        tokens[start_idx:end_idx + 1]
    )

    # Get confidence score
    start_prob = torch.softmax(start_logits, dim=-1)[0, start_idx].item()
    end_prob = torch.softmax(end_logits, dim=-1)[0, end_idx].item()
    confidence = start_prob * end_prob

    return answer, confidence

# --- Example ---
context = """
Albert Einstein was a German-born theoretical physicist who developed
the theory of relativity. He received the Nobel Prize in Physics in
1921 for his explanation of the photoelectric effect. Einstein was born
in Ulm, in the Kingdom of Württemberg in the German Empire, on 14
March 1879.
"""

questions = [
    "What did Einstein develop?",
    "When did Einstein receive the Nobel Prize?",
    "Where was Einstein born?",
]

for q in questions:
    answer, conf = answer_question(q, context)
    print(f"Q: {q}")
    print(f"A: {answer} (confidence: {conf:.4f})")
    print()
```

---

## Open-Domain Question Answering

**Open-domain QA** answers questions without a pre-specified context. It requires:
1. **Retriever:** Find relevant documents from a large corpus
2. **Reader:** Extract or generate the answer from retrieved documents

### Retriever-Reader Pipeline

```
Question: "Who invented the telephone?"
    ↓
[Retriever] → searches Wikipedia/corpus
    ↓
Top-k relevant passages
    ↓
[Reader] → extracts answer from passages
    ↓
Answer: "Alexander Graham Bell"
```

### Dense Passage Retrieval (DPR)

Traditional retrieval uses TF-IDF or BM25. **DPR** uses neural encoders:

$$\text{score}(q, p) = E_Q(q)^T \cdot E_P(p)$$

Where $E_Q$ and $E_P$ are BERT-based encoders for questions and passages.

```python
from transformers import DPRQuestionEncoder, DPRContextEncoder
from transformers import DPRQuestionEncoderTokenizer, DPRContextEncoderTokenizer
import torch

# Load DPR encoders
q_encoder = DPRQuestionEncoder.from_pretrained(
    "facebook/dpr-question_encoder-single-nq-base"
)
q_tokenizer = DPRQuestionEncoderTokenizer.from_pretrained(
    "facebook/dpr-question_encoder-single-nq-base"
)

ctx_encoder = DPRContextEncoder.from_pretrained(
    "facebook/dpr-ctx_encoder-single-nq-base"
)
ctx_tokenizer = DPRContextEncoderTokenizer.from_pretrained(
    "facebook/dpr-ctx_encoder-single-nq-base"
)

def encode_question(question):
    """Encode question into dense vector."""
    inputs = q_tokenizer(question, return_tensors="pt")
    with torch.no_grad():
        embedding = q_encoder(**inputs).pooler_output
    return embedding

def encode_passages(passages):
    """Encode passages into dense vectors."""
    inputs = ctx_tokenizer(
        passages, return_tensors="pt", padding=True, truncation=True
    )
    with torch.no_grad():
        embeddings = ctx_encoder(**inputs).pooler_output
    return embeddings

def retrieve(question, passages, top_k=3):
    """Retrieve most relevant passages for a question."""
    q_emb = encode_question(question)
    p_embs = encode_passages(passages)

    # Compute dot product similarity
    scores = torch.matmul(q_emb, p_embs.T).squeeze()
    top_indices = torch.argsort(scores, descending=True)[:top_k]

    return [(passages[i], scores[i].item()) for i in top_indices]

# --- Example ---
passages = [
    "Alexander Graham Bell invented the telephone in 1876.",
    "The internet was created by DARPA in the 1960s.",
    "Thomas Edison invented the light bulb in 1879.",
    "Bell demonstrated the telephone to the public at the Centennial Exhibition.",
]

results = retrieve("Who invented the telephone?", passages)
for passage, score in results:
    print(f"[{score:.4f}] {passage}")
```

---

## Evaluation Metrics

### Exact Match (EM)

The percentage of predictions that exactly match the ground truth answer:

$$EM = \frac{1}{N} \sum_{i=1}^{N} \mathbb{1}[\hat{a}_i = a_i]$$

After normalization (lowercase, remove articles/punctuation).

### F1 Score

Treats the prediction and ground truth as bags of tokens and computes token-level F1:

$$\text{Precision} = \frac{|\text{predicted tokens} \cap \text{true tokens}|}{|\text{predicted tokens}|}$$

$$\text{Recall} = \frac{|\text{predicted tokens} \cap \text{true tokens}|}{|\text{true tokens}|}$$

$$F1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

### Computing Metrics

```python
import re
import string
from collections import Counter

def normalize_answer(text):
    """Normalize answer for evaluation."""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))
    # Remove articles
    text = re.sub(r"\b(a|an|the)\b", " ", text)
    # Remove extra whitespace
    text = " ".join(text.split())
    return text

def exact_match(prediction, ground_truth):
    """Check if prediction exactly matches ground truth."""
    return normalize_answer(prediction) == normalize_answer(ground_truth)

def f1_score(prediction, ground_truth):
    """Compute token-level F1 score."""
    pred_tokens = normalize_answer(prediction).split()
    truth_tokens = normalize_answer(ground_truth).split()

    if not pred_tokens or not truth_tokens:
        return int(pred_tokens == truth_tokens)

    common = Counter(pred_tokens) & Counter(truth_tokens)
    num_common = sum(common.values())

    if num_common == 0:
        return 0.0

    precision = num_common / len(pred_tokens)
    recall = num_common / len(truth_tokens)
    f1 = 2 * precision * recall / (precision + recall)
    return f1

# --- Examples ---
pred = "Albert Einstein"
truth = "Einstein"

print(f"EM: {exact_match(pred, truth)}")       # False
print(f"F1: {f1_score(pred, truth):.4f}")       # 0.6667 (1 common / avg length)

pred2 = "the capital of France is Paris"
truth2 = "Paris"
print(f"F1: {f1_score(pred2, truth2):.4f}")     # Partial match
```

---

## Code: QA Pipeline with Hugging Face

```python
from transformers import pipeline

# --- Simple Extractive QA ---
qa_pipeline = pipeline(
    "question-answering",
    model="deepset/roberta-base-squad2"
)

context = """
Python is a high-level, general-purpose programming language. Its design
philosophy emphasizes code readability with the use of significant
indentation. Python was conceived in the late 1980s by Guido van Rossum
at Centrum Wiskunde & Informatica (CWI) in the Netherlands. The first
version was released in 1991.
"""

questions = [
    "Who created Python?",
    "When was Python first released?",
    "What does Python emphasize?",
    "Where was Python conceived?",
]

print("=== Extractive QA ===\n")
for q in questions:
    result = qa_pipeline(question=q, context=context)
    print(f"Q: {q}")
    print(f"A: {result['answer']} (score: {result['score']:.4f})")
    print()

# --- Handling unanswerable questions (SQuAD 2.0) ---
result = qa_pipeline(
    question="What is Python's mascot?",
    context=context
)
# Low score indicates the model is uncertain
THRESHOLD = 0.1
if result["score"] < THRESHOLD:
    print("Question is likely unanswerable from this context.")
```

---

## Code: Custom QA System

```python
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
import torch
import numpy as np

class QASystem:
    """Custom extractive QA system with confidence scoring."""

    def __init__(self, model_name="deepset/roberta-base-squad2"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_name)
        self.model.eval()

    def answer(self, question, context, top_k=3, threshold=0.01):
        """
        Answer a question given context.
        Returns top-k answer candidates with confidence scores.
        """
        inputs = self.tokenizer(
            question, context,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            return_offsets_mapping=True,
        )

        offset_mapping = inputs.pop("offset_mapping")[0]

        with torch.no_grad():
            outputs = self.model(**inputs)

        start_logits = outputs.start_logits[0]
        end_logits = outputs.end_logits[0]

        # Get top-k start and end positions
        start_probs = torch.softmax(start_logits, dim=-1)
        end_probs = torch.softmax(end_logits, dim=-1)

        # Find best spans
        candidates = []
        top_starts = torch.topk(start_probs, top_k).indices
        top_ends = torch.topk(end_probs, top_k).indices

        for s in top_starts:
            for e in top_ends:
                if e >= s and (e - s) < 50:  # Valid span, reasonable length
                    score = start_probs[s].item() * end_probs[e].item()
                    if score > threshold:
                        # Map token positions back to character positions
                        start_char = offset_mapping[s][0].item()
                        end_char = offset_mapping[e][1].item()
                        answer_text = context[start_char:end_char]
                        candidates.append({
                            "answer": answer_text,
                            "score": score,
                            "start": start_char,
                            "end": end_char,
                        })

        # Sort by score and deduplicate
        candidates.sort(key=lambda x: x["score"], reverse=True)
        seen = set()
        unique = []
        for c in candidates:
            if c["answer"] not in seen:
                seen.add(c["answer"])
                unique.append(c)

        return unique[:top_k]

    def batch_answer(self, questions, context):
        """Answer multiple questions about the same context."""
        results = {}
        for q in questions:
            answers = self.answer(q, context)
            results[q] = answers[0] if answers else {"answer": "No answer found", "score": 0}
        return results

# --- Usage ---
qa = QASystem()

context = """
The Transformer architecture was introduced in the 2017 paper
"Attention Is All You Need" by Vaswani et al. at Google. It replaced
recurrent layers with self-attention mechanisms, enabling much faster
training through parallelization. The original Transformer used an
encoder-decoder structure with 6 layers each, 8 attention heads, and
a model dimension of 512. It achieved state-of-the-art results on
English-to-German and English-to-French translation tasks.
"""

questions = [
    "When was the Transformer introduced?",
    "Who created the Transformer?",
    "How many layers does the original Transformer have?",
    "What did the Transformer replace?",
    "How many attention heads does it use?",
]

print("=== Custom QA System ===\n")
results = qa.batch_answer(questions, context)
for q, result in results.items():
    print(f"Q: {q}")
    print(f"A: {result['answer']} (confidence: {result['score']:.4f})")
    print()

# Show multiple answer candidates
print("=== Top-3 Candidates ===\n")
candidates = qa.answer("Who created the Transformer?", context, top_k=3)
for i, c in enumerate(candidates, 1):
    print(f"  {i}. \"{c['answer']}\" (score: {c['score']:.4f})")
```

---

## Summary

| Concept | Key Idea |
|---------|----------|
| Extractive QA | Find answer span in passage |
| Abstractive QA | Generate answer in new words |
| Open-domain QA | Retriever + Reader pipeline |
| SQuAD | Standard extractive QA benchmark |
| BERT for QA | Predict start and end positions |
| DPR | Dense retrieval with neural encoders |
| RAG | Retrieval-augmented generation |
| Exact Match | Binary: correct or not |
| F1 Score | Token-level overlap metric |

### Key Takeaways

1. Extractive QA identifies answer spans — fast and interpretable
2. BERT-based models achieve near-human performance on SQuAD
3. Open-domain QA combines retrieval with reading comprehension
4. Always evaluate with both EM and F1 — they capture different aspects
5. Modern systems should handle unanswerable questions gracefully

---

## Next Steps

Continue your NLP journey with:
- **Text Summarization** — condensing long documents
- **Machine Translation** — translating between languages
- **Text Generation** — generating coherent text from prompts
