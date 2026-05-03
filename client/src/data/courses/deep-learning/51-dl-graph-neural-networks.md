---
title: Graph Neural Networks
---

# Graph Neural Networks

Graph Neural Networks (GNNs) extend deep learning to **graph-structured data** — data where relationships between entities matter as much as the entities themselves.

---

## What Are Graphs?

A **graph** is a data structure consisting of:

- **Nodes** (vertices): entities
- **Edges**: connections between entities

| Domain | Nodes | Edges |
|--------|-------|-------|
| Social network | People | Friendships |
| Molecules | Atoms | Chemical bonds |
| Traffic | Intersections | Roads |
| Citation network | Papers | References |
| Knowledge graph | Entities | Relations |
| Protein structure | Amino acids | Interactions |

Graphs can be **directed** or **undirected**, **weighted** or **unweighted**.

---

## Why Standard Neural Networks Fail on Graphs

Traditional neural networks expect **fixed-size, regular** inputs:

- CNNs expect grid-structured data (images)
- RNNs expect sequential data (text, time series)

Graphs are **irregular**:

- Each node can have a different number of neighbors
- There is no natural ordering of nodes
- The structure itself carries information

You cannot simply flatten a graph into a vector without losing structural information.

```python
# A graph is NOT a grid — nodes have varying connections
# Node 0: connected to [1, 2, 3]     (3 neighbors)
# Node 1: connected to [0, 4]         (2 neighbors)
# Node 2: connected to [0, 3, 4, 5]   (4 neighbors)
# How would you feed this into a standard FC layer?
```

---

## The Message Passing Paradigm

GNNs learn by **aggregating information from neighbors**. The core idea:

1. Each node has a feature vector (embedding)
2. At each layer, a node **collects messages** from its neighbors
3. It **aggregates** those messages (sum, mean, max)
4. It **updates** its own representation

This is called the **message passing** framework:

$$h_v^{(l+1)} = \text{UPDATE}\left(h_v^{(l)},\ \text{AGGREGATE}\left(\{h_u^{(l)} : u \in \mathcal{N}(v)\}\right)\right)$$

Where:
- $h_v^{(l)}$ is the feature of node $v$ at layer $l$
- $\mathcal{N}(v)$ is the set of neighbors of node $v$

After $K$ layers, each node's representation captures information from its $K$-hop neighborhood.

---

## Graph Convolutional Networks (GCN)

The **GCN** (Kipf & Welling, 2017) is the foundational GNN architecture.

### The GCN Layer

$$H^{(l+1)} = \sigma\left(\tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}H^{(l)}W^{(l)}\right)$$

Where:
- $A$ is the adjacency matrix
- $\tilde{A} = A + I$ — adjacency with **self-loops** added
- $\tilde{D}$ is the degree matrix of $\tilde{A}$: $\tilde{D}_{ii} = \sum_j \tilde{A}_{ij}$
- $H^{(l)}$ is the node feature matrix at layer $l$
- $W^{(l)}$ is a learnable weight matrix
- $\sigma$ is an activation function (e.g., ReLU)

### Why Self-Loops?

Adding $I$ to $A$ means each node also considers **its own features** during aggregation, not just neighbors.

### Normalization

The $\tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$ term provides **symmetric normalization**, preventing nodes with many connections from dominating.

---

## GraphSAGE: Scalable GNNs

GCN requires the **full graph** in memory. **GraphSAGE** (Hamilton et al., 2017) makes GNNs scalable:

1. **Sample** a fixed number of neighbors (not all)
2. **Aggregate** their features using a learnable function
3. **Concatenate** with the node's own features

```python
# GraphSAGE aggregation strategies
# 1. Mean aggregator
h_neighbors = mean(h_u for u in sampled_neighbors(v))

# 2. LSTM aggregator (permutation-sensitive)
h_neighbors = LSTM(shuffle(h_u for u in sampled_neighbors(v)))

# 3. Pool aggregator
h_neighbors = max(MLP(h_u) for u in sampled_neighbors(v))

# Update
h_v_new = sigma(W * concat(h_v, h_neighbors))
```

GraphSAGE enables **inductive learning** — it can generalize to unseen nodes.

---

## Graph Attention Networks (GAT)

**GAT** (Veličković et al., 2018) uses **attention** to weight neighbor contributions differently.

Instead of treating all neighbors equally:

$$\alpha_{ij} = \frac{\exp\left(\text{LeakyReLU}\left(\vec{a}^T [Wh_i \| Wh_j]\right)\right)}{\sum_{k \in \mathcal{N}(i)} \exp\left(\text{LeakyReLU}\left(\vec{a}^T [Wh_i \| Wh_k]\right)\right)}$$

The updated node feature:

$$h_i' = \sigma\left(\sum_{j \in \mathcal{N}(i)} \alpha_{ij} W h_j\right)$$

Multi-head attention is also used for stability:

$$h_i' = \|_{k=1}^{K} \sigma\left(\sum_{j \in \mathcal{N}(i)} \alpha_{ij}^k W^k h_j\right)$$

---

## GNN Tasks

| Task | Description | Example |
|------|-------------|---------|
| Node classification | Predict label for each node | Categorize users in a social network |
| Graph classification | Predict label for entire graph | Determine if a molecule is toxic |
| Link prediction | Predict missing edges | Recommend friends |
| Node regression | Predict continuous value per node | Estimate traffic at intersections |
| Graph generation | Generate new graphs | Design new molecules |

---

## PyTorch Geometric (PyG)

**PyTorch Geometric** is the go-to library for GNNs in PyTorch.

```python
# Installation
# pip install torch-geometric

import torch
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv
import torch.nn.functional as F

# Load the Cora citation dataset
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]

print(f"Number of nodes: {data.num_nodes}")        # 2708
print(f"Number of edges: {data.num_edges}")        # 10556
print(f"Node feature dim: {data.num_features}")    # 1433
print(f"Number of classes: {dataset.num_classes}") # 7
print(f"Training nodes: {data.train_mask.sum()}")  # 140
```

### Data Format in PyG

```python
# data.x         — Node feature matrix [num_nodes, num_features]
# data.edge_index — Edge connectivity [2, num_edges] (COO format)
# data.y         — Node labels [num_nodes]
# data.train_mask — Boolean mask for training nodes

# Edge index example (COO format):
# edge_index = [[0, 0, 1, 2],   ← source nodes
#               [1, 2, 0, 0]]   ← target nodes
# Means: edges 0→1, 0→2, 1→0, 2→0
```

---

## Code: GCN for Node Classification

```python
import torch
import torch.nn.functional as F
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv

# Load Cora dataset
dataset = Planetoid(root='/tmp/Cora', name='Cora')
data = dataset[0]


class GCN(torch.nn.Module):
    """Simple 2-layer Graph Convolutional Network."""

    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # First GCN layer + ReLU + Dropout
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.5, training=self.training)

        # Second GCN layer (no activation — raw logits)
        x = self.conv2(x, edge_index)
        return x


# Initialize model
model = GCN(
    in_channels=dataset.num_features,   # 1433
    hidden_channels=16,
    out_channels=dataset.num_classes     # 7
)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# Training loop
model.train()
for epoch in range(200):
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)

    # Only compute loss on training nodes
    loss = F.cross_entropy(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()

    if (epoch + 1) % 50 == 0:
        print(f"Epoch {epoch+1:03d}, Loss: {loss:.4f}")

# Evaluation
model.eval()
with torch.no_grad():
    pred = model(data.x, data.edge_index).argmax(dim=1)
    correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()
    accuracy = correct / data.test_mask.sum()
    print(f"\nTest Accuracy: {accuracy:.4f}")
    # Typically ~81% with this simple 2-layer GCN
```

---

## Heterogeneous Graphs

Real-world graphs often have **multiple node and edge types**:

```python
# A citation network is homogeneous (paper → cites → paper)
# A movie database is heterogeneous:
#   Node types: Movie, Actor, Director, Genre
#   Edge types: acted_in, directed, belongs_to

# PyG supports heterogeneous graphs
from torch_geometric.nn import HeteroConv, SAGEConv

class HeteroGNN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = HeteroConv({
            ('actor', 'acted_in', 'movie'): SAGEConv((-1, -1), 64),
            ('director', 'directed', 'movie'): SAGEConv((-1, -1), 64),
            ('movie', 'belongs_to', 'genre'): SAGEConv((-1, -1), 64),
        })

    def forward(self, x_dict, edge_index_dict):
        x_dict = self.conv1(x_dict, edge_index_dict)
        return {key: F.relu(x) for key, x in x_dict.items()}
```

---

## Over-Smoothing Problem

Stacking too many GNN layers causes **over-smoothing** — all node representations converge to the same value.

| Layers | Behavior |
|--------|----------|
| 2–3 | Sweet spot for most tasks |
| 5+ | Representations start to blur together |
| 10+ | Severe over-smoothing |

Mitigation strategies:
- **Skip connections** (residual connections)
- **DropEdge**: randomly remove edges during training
- **JumpingKnowledge**: concatenate representations from all layers
- **PairNorm**: normalize to maintain distance between nodes

```python
# JumpingKnowledge: use outputs from ALL layers
class JKNet(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, num_layers):
        super().__init__()
        self.convs = nn.ModuleList()
        self.convs.append(GCNConv(in_channels, hidden_channels))
        for _ in range(num_layers - 1):
            self.convs.append(GCNConv(hidden_channels, hidden_channels))
        # Concatenate all layer outputs
        self.classifier = nn.Linear(hidden_channels * num_layers, out_channels)

    def forward(self, x, edge_index):
        layer_outputs = []
        for conv in self.convs:
            x = F.relu(conv(x, edge_index))
            layer_outputs.append(x)
        # Concatenate outputs from each layer
        x = torch.cat(layer_outputs, dim=-1)
        return self.classifier(x)
```

---

## Graph Pooling for Graph-Level Tasks

For **graph classification**, we need a single vector representing the entire graph. Pooling strategies:

```python
from torch_geometric.nn import global_mean_pool, global_max_pool
from torch_geometric.nn import GCNConv

class GraphClassifier(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, num_classes):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, hidden_channels)
        self.classifier = torch.nn.Linear(hidden_channels, num_classes)

    def forward(self, x, edge_index, batch):
        # Node-level representations
        x = F.relu(self.conv1(x, edge_index))
        x = F.relu(self.conv2(x, edge_index))

        # Aggregate all nodes in each graph (graph-level)
        # 'batch' tells which graph each node belongs to
        x = global_mean_pool(x, batch)  # [num_graphs, hidden]

        # Classify the graph
        x = self.classifier(x)
        return x
```

| Pooling Method | Description |
|----------------|-------------|
| `global_mean_pool` | Average all node features |
| `global_max_pool` | Max across all node features |
| `global_add_pool` | Sum all node features |
| TopK pooling | Learn to select important nodes |
| SAGPool | Self-attention graph pooling |

---

## Applications of GNNs

| Application | Graph | Task | Impact |
|-------------|-------|------|--------|
| Drug discovery | Molecule graph | Predict properties | Faster drug screening |
| Recommendation | User-item bipartite | Link prediction | Better suggestions |
| Social analysis | Social network | Community detection | Influence modeling |
| Fraud detection | Transaction graph | Node classification | Financial security |
| Physics simulation | Particle system | Predict dynamics | Faster simulations |
| Chip design | Circuit graph | Optimization | Better hardware |
| Traffic prediction | Road network | Node regression | Route planning |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| Graph data | Nodes + edges; irregular structure |
| Message passing | Aggregate neighbor info iteratively |
| GCN | Spectral convolution with normalization |
| GraphSAGE | Sampling for scalability |
| GAT | Attention-weighted aggregation |
| PyG | `torch_geometric` library |
| Tasks | Node/graph classification, link prediction |
| Pooling | Aggregate node features for graph-level tasks |

---

## Try It Yourself

1. Change the GCN to 3 layers — does accuracy improve?
2. Replace `GCNConv` with `GATConv` and compare
3. Try the `CiteSeer` or `PubMed` datasets (also in Planetoid)
4. Add edge features to the model

GNNs unlock deep learning for any data that has **relational structure** — and that covers a surprisingly large fraction of real-world problems!
