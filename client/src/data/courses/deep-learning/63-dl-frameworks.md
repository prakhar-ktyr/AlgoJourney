---
title: Framework Comparison
---

# Framework Comparison

Choosing the right deep learning framework affects your productivity, deployment options, and community support. Let's compare the major players.

---

## The Big Two: PyTorch vs TensorFlow

As of 2024, PyTorch and TensorFlow dominate the landscape:

| Metric | PyTorch | TensorFlow |
|--------|---------|------------|
| Research papers | ~80% | ~20% |
| Industry adoption | Growing fast | Still dominant in production |
| GitHub stars | ~80k | ~180k |
| Created by | Meta (Facebook) | Google |
| Initial release | 2016 | 2015 |

---

## Historical Context

### TensorFlow 1.x (2015-2019): Static Graphs

```python
# TensorFlow 1.x style (historical — don't use this!)
import tensorflow as tf

# Define computation graph (no execution yet)
x = tf.placeholder(tf.float32, shape=[None, 784])
W = tf.Variable(tf.random_normal([784, 10]))
y = tf.matmul(x, W)

# Execute in a session
with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    result = sess.run(y, feed_dict={x: data})
```

This "define-then-run" approach was powerful for optimization but **terrible for debugging**.

### PyTorch (2016): Dynamic Graphs

```python
# PyTorch style — define-by-run
import torch

x = torch.randn(32, 784)
W = torch.randn(784, 10, requires_grad=True)
y = torch.matmul(x, W)  # Executes immediately!

# Easy debugging — just use print() or breakpoints
print(y.shape)  # Works!
```

Researchers loved PyTorch because it behaved like normal Python.

### TensorFlow 2.x (2019+): Eager Mode

```python
# TensorFlow 2.x — eager by default (caught up with PyTorch)
import tensorflow as tf

x = tf.random.normal([32, 784])
W = tf.Variable(tf.random.normal([784, 10]))
y = tf.matmul(x, W)  # Executes immediately now!

print(y.shape)  # Works!
```

TensorFlow 2.x adopted eager execution by default, but the ecosystem still carries legacy complexity.

---

## PyTorch Strengths

### 1. Pythonic and Intuitive

```python
import torch
import torch.nn as nn

# Clean, readable model definition
class Classifier(nn.Module):
    def __init__(self, input_dim, num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.net(x)

# Standard Python debugging works
model = Classifier(784, 10)
x = torch.randn(1, 784)

# Set a breakpoint anywhere!
import pdb; pdb.set_trace()
output = model(x)
```

### 2. Dynamic Computation Graphs

```python
# Control flow that depends on data — just works!
class DynamicModel(nn.Module):
    def forward(self, x):
        if x.sum() > 0:  # Data-dependent branching
            x = self.branch_a(x)
        else:
            x = self.branch_b(x)

        # Variable-length loops
        for i in range(x.size(0)):
            x[i] = self.process(x[i])

        return x
```

### 3. Hugging Face Ecosystem

```python
from transformers import AutoModel, AutoTokenizer

# One-line access to thousands of pretrained models
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

inputs = tokenizer("Hello world!", return_tensors="pt")
outputs = model(**inputs)
```

### 4. TorchScript for Production

```python
# Convert to optimized, Python-free format
scripted = torch.jit.script(model)
scripted.save("production_model.pt")

# Load and run without Python dependency
loaded = torch.jit.load("production_model.pt")
```

---

## TensorFlow Strengths

### 1. Mature Production Ecosystem

```python
# TensorFlow Serving — battle-tested at Google scale
# Save in SavedModel format
import tensorflow as tf

model.save("saved_model/1/")

# Deploy with one command:
# docker run -p 8501:8501 \
#   --mount type=bind,source=/models,target=/models \
#   tensorflow/serving --model_name=my_model
```

### 2. TensorFlow Lite (Mobile/Edge)

```python
import tensorflow as tf

# Convert to TFLite format
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model/")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Resulting model runs on Android, iOS, Raspberry Pi, microcontrollers
with open("model.tflite", "wb") as f:
    f.write(tflite_model)
```

### 3. TensorFlow.js (Browser)

```javascript
// Run ML directly in the browser — no server needed!
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('model.json');
const prediction = model.predict(tf.tensor2d([[1, 2, 3, 4]]));
prediction.print();
```

### 4. Keras High-Level API

```python
import tensorflow as tf
from tensorflow import keras

# Extremely concise model definition
model = keras.Sequential([
    keras.layers.Dense(256, activation='relu', input_shape=(784,)),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# One-line training with built-in callbacks
model.fit(x_train, y_train, epochs=10, validation_split=0.2,
          callbacks=[keras.callbacks.EarlyStopping(patience=3)])
```

---

## Side-by-Side: Same Model in Both Frameworks

### PyTorch Version

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# Model
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = Net()
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.CrossEntropyLoss()

# Training loop
for epoch in range(10):
    model.train()
    for batch_x, batch_y in train_loader:
        optimizer.zero_grad()
        output = model(batch_x)
        loss = criterion(output, batch_y)
        loss.backward()
        optimizer.step()

    # Evaluation
    model.eval()
    with torch.no_grad():
        correct = 0
        for batch_x, batch_y in test_loader:
            pred = model(batch_x).argmax(dim=1)
            correct += (pred == batch_y).sum().item()
    print(f"Epoch {epoch}: Accuracy = {correct / len(test_set):.4f}")
```

### TensorFlow/Keras Version

```python
import tensorflow as tf
from tensorflow import keras

# Model
model = keras.Sequential([
    keras.layers.Dense(256, activation='relu', input_shape=(784,)),
    keras.layers.Dense(10)
])

model.compile(
    optimizer=keras.optimizers.Adam(0.001),
    loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy']
)

# Training (one line!)
history = model.fit(x_train, y_train, epochs=10,
                    validation_data=(x_test, y_test), batch_size=32)
```

> **Observation:** Keras is more concise for standard tasks. PyTorch gives more control for custom behavior.

---

## JAX: The Rising Contender

JAX (Google, 2018) brings **functional transformations** to numerical computing:

```python
import jax
import jax.numpy as jnp
from jax import grad, jit, vmap

# Pure functions + transformations
def predict(params, x):
    for W, b in params:
        x = jnp.dot(x, W) + b
        x = jax.nn.relu(x)
    return x

def loss_fn(params, x, y):
    preds = predict(params, x)
    return jnp.mean((preds - y) ** 2)

# Automatic differentiation
grad_fn = grad(loss_fn)  # Returns a function that computes gradients

# JIT compilation for speed
fast_grad = jit(grad_fn)  # Compiles to XLA — often faster than PyTorch

# Automatic vectorization
batched_predict = vmap(predict, in_axes=(None, 0))  # Vectorize over batch

# Automatic parallelization across devices
parallel_train = jax.pmap(train_step)  # Distribute across GPUs/TPUs
```

### JAX Key Concepts

| Transform | What it does |
|-----------|--------------|
| `grad` | Automatic differentiation |
| `jit` | XLA compilation (massive speedup) |
| `vmap` | Automatic batching/vectorization |
| `pmap` | Automatic multi-device parallelism |

### JAX Strengths

- **Fastest** for research experiments (XLA compilation)
- **Composable** transformations (grad of grad, vmap of grad, etc.)
- **Functional** style prevents hidden state bugs
- Growing ecosystem: Flax, Haiku, Optax

### JAX Limitations

- Steeper learning curve (functional programming required)
- Smaller community than PyTorch/TF
- Debugging JIT-compiled code is harder
- Less mature deployment story

---

## Other Frameworks

| Framework | Creator | Status | Notable Use |
|-----------|---------|--------|-------------|
| Flax | Google | Active | JAX-based, used for PaLM |
| Haiku | DeepMind | Active | JAX-based, simpler API |
| MXNet | Apache | Declining | Was used by Amazon |
| PaddlePaddle | Baidu | Active | Popular in China |
| Caffe2 | Meta | Merged | Absorbed into PyTorch |
| Theano | MILA | Discontinued | Historical importance |

---

## Ecosystem Comparison

| Feature | PyTorch | TensorFlow | JAX |
|---------|---------|------------|-----|
| Research | ★★★★★ | ★★★ | ★★★★ |
| Production | ★★★★ | ★★★★★ | ★★★ |
| Mobile/Edge | ★★★ | ★★★★★ | ★★ |
| Browser | ★★ | ★★★★★ | ★ |
| Debugging | ★★★★★ | ★★★ | ★★★ |
| Speed | ★★★★ | ★★★★ | ★★★★★ |
| Community | ★★★★★ | ★★★★ | ★★★ |
| Learning curve | ★★★★ | ★★★ | ★★ |

---

## Hugging Face: The Unifier

Hugging Face has become the **framework-agnostic** model hub:

```python
# Works with PyTorch (default)
from transformers import AutoModel
model = AutoModel.from_pretrained("bert-base-uncased")

# Also works with TensorFlow
model = AutoModel.from_pretrained("bert-base-uncased", from_tf=True)

# And JAX/Flax
from transformers import FlaxAutoModel
model = FlaxAutoModel.from_pretrained("bert-base-uncased")
```

Key Hugging Face libraries:

| Library | Purpose |
|---------|---------|
| `transformers` | Pretrained models (NLP, vision, audio) |
| `datasets` | Standardized datasets |
| `accelerate` | Multi-GPU/TPU training |
| `diffusers` | Diffusion models |
| `peft` | Parameter-efficient fine-tuning |
| `trl` | Reinforcement learning from human feedback |

---

## Choosing a Framework: Decision Guide

```
Start Here
    │
    ├── Are you a beginner?
    │       → PyTorch (best tutorials, most intuitive)
    │
    ├── Need to deploy on mobile/browser?
    │       → TensorFlow (TFLite, TF.js)
    │
    ├── Doing cutting-edge research?
    │       ├── Need max speed? → JAX
    │       └── Need flexibility? → PyTorch
    │
    ├── Building production ML system?
    │       ├── Google Cloud? → TensorFlow or JAX
    │       └── AWS/Azure? → PyTorch (better support)
    │
    └── Using Hugging Face models?
            → PyTorch (best integration)
```

---

## Why This Course Uses PyTorch

1. **Most popular** for learning and research
2. **Most intuitive** — behaves like normal Python
3. **Best ecosystem** — Hugging Face, Lightning, etc.
4. **Transferable concepts** — neural network principles are framework-agnostic
5. **Industry momentum** — more companies adopting PyTorch

> **Important:** The concepts you learn (backprop, CNNs, attention, etc.) transfer to ANY framework. The framework is just a tool — the math and intuition are universal.

---

## Summary

| Framework | Use When |
|-----------|----------|
| PyTorch | Learning, research, most projects |
| TensorFlow | Mobile deployment, browser ML, legacy systems |
| JAX | Maximum performance, functional programming fans |
| Keras | Quick prototyping (now works with PyTorch too!) |

---

## Next Lesson

Next, we'll build a complete **End-to-End Deep Learning Project** — putting together everything we've learned into a polished, production-ready application.
