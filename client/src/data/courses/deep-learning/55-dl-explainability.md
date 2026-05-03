---
title: Explainability & Interpretability
---

# Explainability & Interpretability

Deep learning models are often called **"black boxes"** — they make predictions but don't explain *why*. Explainability techniques help us understand what models learn and how they make decisions.

---

## Why Interpretability Matters

| Reason | Example |
|--------|---------|
| Trust | Would you trust a medical diagnosis you can't explain? |
| Debugging | Model performs well on test set but fails in production — why? |
| Regulation | GDPR requires "right to explanation" for automated decisions |
| Fairness | Detect if model uses race, gender, or other protected attributes |
| Scientific discovery | What patterns did the model discover? |
| Safety | Ensure autonomous systems make decisions for the right reasons |

A model that's 95% accurate but relies on spurious correlations (e.g., detecting hospital equipment instead of disease) is **dangerous**.

---

## Types of Interpretability

| Type | Description | Examples |
|------|-------------|---------|
| Intrinsic | Model is inherently interpretable | Linear regression, decision trees |
| Post-hoc | Explanations applied after training | Saliency maps, SHAP, LIME |
| Local | Explains a single prediction | "Why was THIS image classified as cat?" |
| Global | Explains overall model behavior | "What features matter most in general?" |

---

## Saliency Maps

The simplest gradient-based method: compute the **gradient of the output with respect to the input**.

$$\text{saliency} = \left|\frac{\partial y_c}{\partial x}\right|$$

Where:
- $y_c$ is the model's output for class $c$
- $x$ is the input image

Pixels with large gradients are "important" for the prediction.

```python
import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt


def compute_saliency(model, image_tensor, target_class):
    """Compute vanilla gradient saliency map."""
    model.eval()
    image_tensor.requires_grad_(True)

    # Forward pass
    output = model(image_tensor.unsqueeze(0))
    score = output[0, target_class]

    # Backward pass
    score.backward()

    # Saliency = absolute value of gradients
    saliency = image_tensor.grad.abs()

    # Take max across color channels
    saliency = saliency.max(dim=0)[0]

    return saliency.detach().numpy()


# Usage
model = models.resnet50(pretrained=True)
model.eval()

# Load and preprocess image
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

image = Image.open("cat.jpg")
image_tensor = preprocess(image)
saliency = compute_saliency(model, image_tensor, target_class=281)  # tabby cat

# Visualize
plt.imshow(saliency, cmap='hot')
plt.title("Saliency Map")
plt.colorbar()
plt.show()
```

### Limitations of Vanilla Gradients

- Often noisy and hard to interpret
- Saturated regions have zero gradient (even if important)
- Can be visually misleading

---

## Grad-CAM

**Grad-CAM** (Gradient-weighted Class Activation Mapping) produces a **coarse heatmap** highlighting which regions of an image are important for a specific prediction.

### How It Works

1. Forward pass through the CNN
2. Compute gradients of target class score w.r.t. feature maps of a convolutional layer
3. Global average pool the gradients to get **importance weights**:

$$\alpha_k^c = \frac{1}{Z} \sum_i \sum_j \frac{\partial y^c}{\partial A^k_{ij}}$$

4. Weighted combination of feature maps + ReLU:

$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$

The ReLU removes negative influences (we only care about features that **increase** the class score).

### Code: Grad-CAM Implementation

```python
import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt


class GradCAM:
    """Grad-CAM implementation for any CNN."""

    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Register hooks
        target_layer.register_forward_hook(self._save_activation)
        target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, target_class=None):
        """Generate Grad-CAM heatmap."""
        self.model.eval()

        # Forward pass
        output = self.model(input_tensor)

        if target_class is None:
            target_class = output.argmax(dim=1).item()

        # Zero gradients
        self.model.zero_grad()

        # Backward pass for target class
        target_score = output[0, target_class]
        target_score.backward()

        # Compute weights: global average pool of gradients
        weights = self.gradients.mean(dim=[2, 3], keepdim=True)  # [1, C, 1, 1]

        # Weighted combination of activation maps
        cam = (weights * self.activations).sum(dim=1, keepdim=True)  # [1, 1, H, W]

        # ReLU (only positive influence)
        cam = F.relu(cam)

        # Normalize to [0, 1]
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)

        # Resize to input image size
        cam = F.interpolate(cam, size=input_tensor.shape[2:],
                            mode='bilinear', align_corners=False)

        return cam.squeeze().numpy()


def visualize_gradcam(image_path, model, target_layer, target_class=None):
    """Generate and display Grad-CAM overlay."""
    # Preprocessing
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    # Load image
    image = Image.open(image_path).convert('RGB')
    input_tensor = preprocess(image).unsqueeze(0)

    # Generate heatmap
    grad_cam = GradCAM(model, target_layer)
    heatmap = grad_cam.generate(input_tensor, target_class)

    # Overlay on original image
    image_resized = image.resize((224, 224))
    image_np = np.array(image_resized) / 255.0

    # Create colored heatmap
    plt.figure(figsize=(12, 4))

    plt.subplot(1, 3, 1)
    plt.imshow(image_np)
    plt.title("Original Image")
    plt.axis('off')

    plt.subplot(1, 3, 2)
    plt.imshow(heatmap, cmap='jet')
    plt.title("Grad-CAM Heatmap")
    plt.axis('off')

    plt.subplot(1, 3, 3)
    plt.imshow(image_np)
    plt.imshow(heatmap, cmap='jet', alpha=0.5)
    plt.title("Overlay")
    plt.axis('off')

    plt.tight_layout()
    plt.show()


# Usage
model = models.resnet50(pretrained=True)
target_layer = model.layer4[-1]  # Last conv layer

# visualize_gradcam("dog.jpg", model, target_layer, target_class=254)
```

---

## SHAP (SHapley Additive exPlanations)

**SHAP** (Lundberg & Lee, 2017) is based on **Shapley values** from cooperative game theory.

### The Idea

For each feature, compute its **marginal contribution** to the prediction across all possible feature combinations.

The Shapley value for feature $i$:

$$\phi_i = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N|-|S|-1)!}{|N|!} [f(S \cup \{i\}) - f(S)]$$

Where:
- $N$ is the set of all features
- $S$ is a subset without feature $i$
- $f(S)$ is the model prediction using only features in $S$

### Properties (Axioms)

SHAP satisfies four desirable axioms: **Efficiency** (contributions sum to prediction − baseline), **Symmetry** (equal features get equal attribution), **Dummy** (irrelevant features get zero), **Additivity** (linear in models).

### DeepSHAP

For deep neural networks, **DeepSHAP** combines SHAP with DeepLift for efficient computation:

```python
# pip install shap
import shap
import torch
from torchvision import models

model = models.resnet50(pretrained=True)
model.eval()

# Create explainer with background samples
background = torch.randn(50, 3, 224, 224)  # Reference distribution
explainer = shap.DeepExplainer(model, background)

# Explain a prediction
test_image = torch.randn(1, 3, 224, 224)
shap_values = explainer.shap_values(test_image)

# Visualize
# shap.image_plot(shap_values, test_image.numpy())
```

---

## LIME (Local Interpretable Model-agnostic Explanations)

**LIME** (Ribeiro et al., 2016) explains individual predictions by fitting a **simple interpretable model** locally.

### How LIME Works

1. **Perturb** the input (e.g., mask random superpixels in an image)
2. Get the model's predictions for each perturbation
3. Fit a **linear model** (weighted by proximity to original)
4. The linear model's coefficients = feature importances

```python
# pip install lime
from lime import lime_image

explainer = lime_image.LimeImageExplainer()

# Explain a prediction
explanation = explainer.explain_instance(
    image_numpy,             # Input image as numpy array
    predict_fn,              # Function: images → probabilities
    top_labels=5,
    hide_color=0,
    num_samples=1000,        # Number of perturbations
)

# Get image highlighting important regions
temp, mask = explanation.get_image_and_mask(
    explanation.top_labels[0], positive_only=True, num_features=5,
)
```

---

## Integrated Gradients

**Integrated Gradients** (Sundararajan et al., 2017) computes attributions by integrating gradients along a path from a **baseline** (e.g., black image) to the actual input:

$$IG_i(x) = (x_i - x'_i) \times \int_0^1 \frac{\partial F(x' + \alpha(x - x'))}{\partial x_i} d\alpha$$

Where $x'$ is the baseline input.

```python
def integrated_gradients(model, input_tensor, target_class,
                         baseline=None, steps=50):
    """Compute Integrated Gradients."""
    if baseline is None:
        baseline = torch.zeros_like(input_tensor)

    # Interpolate between baseline and input
    alphas = torch.linspace(0, 1, steps).view(-1, 1, 1, 1)
    interpolated = baseline + alphas * (input_tensor - baseline)

    # Compute gradients at each step
    interpolated.requires_grad_(True)
    outputs = model(interpolated)
    scores = outputs[:, target_class].sum()
    scores.backward()

    gradients = interpolated.grad  # [steps, C, H, W]

    # Average gradients (approximate integral)
    avg_gradients = gradients.mean(dim=0)

    # Scale by (input - baseline)
    integrated_grad = (input_tensor - baseline).squeeze() * avg_gradients

    return integrated_grad.detach()
```

---

## Attention Visualization for Transformers

Transformers provide interpretability through **attention weights**:

```python
from transformers import ViTModel, ViTFeatureExtractor

model = ViTModel.from_pretrained('google/vit-base-patch16-224',
                                  output_attentions=True)

# outputs = model(**inputs)
# attentions = outputs.attentions
# Shape: [num_layers, batch, num_heads, seq_len, seq_len]
# Visualize attention from [CLS] token to patches
# Shows where the model "looks" for its prediction
```

---

## Feature Visualization

**What maximizes a neuron's activation?** Generate an image via gradient ascent that maximally activates a specific neuron:

```python
def feature_visualization(model, layer, filter_idx, size=224, steps=200):
    """Generate image that maximally activates a filter."""
    image = torch.randn(1, 3, size, size, requires_grad=True)
    optimizer = torch.optim.Adam([image], lr=0.05)

    activation = {}
    def hook(module, input, output):
        activation['value'] = output
    handle = layer.register_forward_hook(hook)

    for step in range(steps):
        optimizer.zero_grad()
        _ = model(image)
        loss = -activation['value'][0, filter_idx].mean()
        loss.backward()
        optimizer.step()
        with torch.no_grad():
            image.clamp_(-2, 2)

    handle.remove()
    return image.detach()
```

---

## Captum: PyTorch's Interpretability Library

**Captum** provides unified implementations of many attribution methods:

```python
# pip install captum
from captum.attr import (
    IntegratedGradients,
    GradientShap,
    Occlusion,
    LayerGradCam,
)
from captum.attr import visualization as viz

model = models.resnet50(pretrained=True)
model.eval()

# Integrated Gradients
ig = IntegratedGradients(model)
attributions = ig.attribute(input_tensor.unsqueeze(0),
                            target=target_class, n_steps=200)

# Grad-CAM on specific layer
layer_gc = LayerGradCam(model, model.layer4[-1])
cam_attr = layer_gc.attribute(input_tensor.unsqueeze(0),
                               target=target_class)

# Occlusion (sliding window approach)
occ = Occlusion(model)
occ_attr = occ.attribute(
    input_tensor.unsqueeze(0),
    target=target_class,
    strides=(3, 8, 8),
    sliding_window_shapes=(3, 15, 15),
)
```

---

## Responsible AI

Interpretability is part of the broader **Responsible AI** framework:

| Principle | Description |
|-----------|-------------|
| Fairness | Model doesn't discriminate against protected groups |
| Transparency | Decisions can be explained |
| Accountability | Clear ownership of model behavior |
| Privacy | Data is protected (differential privacy, federated learning) |
| Robustness | Model handles edge cases safely |

A **model card** documents: intended use, limitations, training data, evaluation metrics, ethical considerations, and bias analysis results.

---

## Methods Comparison

| Method | Type | Scope | Speed | Faithfulness |
|--------|------|-------|-------|-------------|
| Saliency Maps | Gradient | Local | Fast | Low |
| Grad-CAM | Gradient | Local | Fast | Medium |
| Integrated Gradients | Gradient | Local | Medium | High |
| SHAP | Game theory | Local/Global | Slow | High |
| LIME | Perturbation | Local | Medium | Medium |
| Attention maps | Built-in | Local | Free | Debated |
| Feature visualization | Optimization | Global | Slow | Medium |
| Occlusion | Perturbation | Local | Slow | Medium |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| Why explain? | Trust, debugging, regulation, fairness |
| Saliency maps | Gradient of output w.r.t. input |
| Grad-CAM | Gradient-weighted activation maps (visual) |
| SHAP | Shapley values: theoretically grounded attributions |
| LIME | Local linear approximation of the model |
| Integrated Gradients | Path-integrated attributions from baseline |
| Captum | PyTorch library unifying all methods |
| Responsible AI | Fairness + transparency + accountability |

---

## Try It Yourself

1. Apply Grad-CAM to a misclassified image — can you see WHY the model was wrong?
2. Compare saliency maps vs. Integrated Gradients on the same image
3. Use SHAP on a tabular model (XGBoost) and visualize feature importance
4. Check if your model uses spurious correlations (e.g., watermarks, backgrounds)
5. Write a model card for a model you've trained

Explainability isn't just nice to have — it's **essential** for deploying AI systems responsibly in the real world!
