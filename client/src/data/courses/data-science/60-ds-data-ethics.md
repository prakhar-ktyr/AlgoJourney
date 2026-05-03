---
title: Data Ethics & Privacy
---

# Data Ethics & Privacy

With great data comes great responsibility. Data science can improve lives — or cause harm if used carelessly.

This lesson covers the ethical principles every data scientist must understand.

---

## Why Ethics Matters

Data science decisions affect real people:

| Scenario | Potential Harm |
|----------|---------------|
| Hiring algorithm | Discriminates against women or minorities |
| Facial recognition | Higher error rates for darker skin tones |
| Credit scoring | Denies loans based on zip code (proxy for race) |
| Predictive policing | Over-polices minority neighborhoods |
| Health insurance | Denies coverage based on predicted risk |
| Social media | Amplifies misinformation and addiction |

**The takeaway:** Algorithms are not neutral — they encode the biases of their training data and creators.

---

## Key Ethical Principles

### The Five Pillars

| Principle | Description |
|-----------|-------------|
| **Transparency** | Explain how data is collected, used, and decisions are made |
| **Fairness** | Ensure equal treatment regardless of protected attributes |
| **Privacy** | Protect personal information and respect consent |
| **Accountability** | Take responsibility for outcomes and harms |
| **Beneficence** | Maximize good, minimize harm |

### Ethical Decision Framework

Before deploying any model, ask:

1. **Who benefits?** Who is helped by this system?
2. **Who is harmed?** Who might be negatively affected?
3. **Is consent given?** Did users agree to this use of their data?
4. **Is it fair?** Does it treat all groups equitably?
5. **What if it's wrong?** What's the cost of errors?

---

## Bias in Data and Models

### Types of Bias

#### 1. Historical Bias

The data reflects past discrimination:

```python
# Example: Historical hiring data
# If a company historically hired mostly men for engineering,
# a model trained on this data will prefer male candidates

import pandas as pd

hiring_data = pd.DataFrame({
    "gender": ["M", "M", "M", "F", "M", "M", "F", "M", "M", "M"],
    "hired": [1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
    "experience": [5, 3, 7, 4, 6, 2, 8, 4, 3, 5]
})

# A naive model learns: gender=M → higher chance of being hired
# This perpetuates historical discrimination
print(f"Hire rate for M: {hiring_data[hiring_data['gender']=='M']['hired'].mean():.0%}")
print(f"Hire rate for F: {hiring_data[hiring_data['gender']=='F']['hired'].mean():.0%}")
```

#### 2. Selection Bias

The sample doesn't represent the population:

```python
# Example: Survey bias
# Online survey about internet access → only reaches people WITH internet
# Medical study using hospital data → misses healthy population
# Loan default data → only includes people who WERE approved

# This leads to models that work poorly for underrepresented groups
print("Selection bias examples:")
print("- Survivorship bias: studying only successful companies")
print("- Sampling bias: phone surveys miss non-phone users")
print("- Self-selection: volunteers differ from general population")
```

#### 3. Measurement Bias

Inconsistent data collection across groups:

```python
# Example: Different arrest rates ≠ different crime rates
# Police patrol more in some neighborhoods → more arrests there
# Diagnosis rates differ by access to healthcare
# Performance reviews subjectively rated → manager bias

print("Measurement bias:")
print("- Same behavior measured differently across groups")
print("- Proxy variables that correlate with protected attributes")
print("- Labeled data that reflects annotator biases")
```

#### 4. Algorithmic Bias

The model amplifies existing patterns:

```python
# Example: Word embeddings learn stereotypes
# "Doctor" is closer to "man" than "woman" in word2vec
# Recommendation systems create filter bubbles
# Autocomplete suggests stereotypical completions

print("Algorithm amplification:")
print("- Models learn AND amplify biases in training data")
print("- Feedback loops: biased predictions → biased actions → biased data")
print("- Optimization for engagement → extremism")
```

---

## Detecting Bias

### Fairness Metrics

#### Demographic Parity

Equal prediction rates across groups:

$$P(\hat{Y}=1 | A=0) = P(\hat{Y}=1 | A=1)$$

Where $A$ is the protected attribute (e.g., race, gender).

#### Equalized Odds

Equal error rates across groups:

$$P(\hat{Y}=1 | Y=1, A=0) = P(\hat{Y}=1 | Y=1, A=1)$$

(Same true positive rate for all groups)

#### Disparate Impact Ratio

$$\text{DI} = \frac{P(\hat{Y}=1 | A=\text{minority})}{P(\hat{Y}=1 | A=\text{majority})}$$

If DI < 0.8, there may be illegal discrimination (US "four-fifths rule").

### Code: Detecting Bias

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Simulated loan approval data
np.random.seed(42)
n = 2000

data = pd.DataFrame({
    "income": np.random.normal(60000, 20000, n),
    "credit_score": np.random.normal(700, 50, n),
    "gender": np.random.choice(["M", "F"], n),
    "race": np.random.choice(["White", "Black", "Hispanic", "Asian"], n,
                              p=[0.6, 0.15, 0.15, 0.10])
})

# Biased approval (income threshold differs by race — simulating historical bias)
data["approved"] = (
    (data["income"] > 50000) &
    (data["credit_score"] > 670)
).astype(int)

# Add bias: lower approval for minority groups (simulating real-world bias)
minority_mask = data["race"].isin(["Black", "Hispanic"])
flip_indices = data[minority_mask & (data["approved"] == 1)].sample(frac=0.2).index
data.loc[flip_indices, "approved"] = 0

# Check approval rates by group
print("Approval rates by race:")
print(data.groupby("race")["approved"].mean().round(3))
print()

# Calculate disparate impact
majority_rate = data[data["race"] == "White"]["approved"].mean()
for race in ["Black", "Hispanic", "Asian"]:
    minority_rate = data[data["race"] == race]["approved"].mean()
    di = minority_rate / majority_rate
    flag = "⚠️ POTENTIAL BIAS" if di < 0.8 else "✓ OK"
    print(f"  {race}: DI = {di:.3f} {flag}")
```

### Using Fairlearn

```python
# pip install fairlearn
from fairlearn.metrics import (
    MetricFrame,
    demographic_parity_difference,
    equalized_odds_difference,
    selection_rate
)
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

# Prepare features (exclude protected attributes from model)
X = data[["income", "credit_score"]].copy()
y = data["approved"]
sensitive = data["race"]

# Train model
X_train, X_test, y_train, y_test, sens_train, sens_test = \
    train_test_split(X, y, sensitive, test_size=0.3, random_state=42)

model = GradientBoostingClassifier(random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# Fairness metrics
metric_frame = MetricFrame(
    metrics={
        "accuracy": accuracy_score,
        "selection_rate": selection_rate
    },
    y_true=y_test,
    y_pred=y_pred,
    sensitive_features=sens_test
)

print("Metrics by group:")
print(metric_frame.by_group)
print(f"\nDemographic parity difference: "
      f"{demographic_parity_difference(y_test, y_pred, sensitive_features=sens_test):.4f}")
print(f"Equalized odds difference: "
      f"{equalized_odds_difference(y_test, y_pred, sensitive_features=sens_test):.4f}")
```

### Mitigating Bias with Fairlearn

```python
from fairlearn.reductions import ExponentiatedGradient, DemographicParity
from sklearn.tree import DecisionTreeClassifier

# Constrained model: enforce demographic parity
constraint = DemographicParity()
mitigator = ExponentiatedGradient(
    estimator=DecisionTreeClassifier(max_depth=5),
    constraints=constraint
)
mitigator.fit(X_train, y_train, sensitive_features=sens_train)
y_pred_fair = mitigator.predict(X_test)

# Compare before/after
print(f"BEFORE: DP diff = {demographic_parity_difference(y_test, y_pred, sensitive_features=sens_test):.4f}")
print(f"AFTER:  DP diff = {demographic_parity_difference(y_test, y_pred_fair, sensitive_features=sens_test):.4f}")
```

---

## Privacy

### Major Privacy Regulations

| Regulation | Region | Key Requirements |
|-----------|--------|-----------------|
| **GDPR** | EU | Consent, right to deletion, data minimization |
| **CCPA** | California | Right to know, delete, opt-out of sale |
| **HIPAA** | US | Medical data protection, de-identification |
| **PIPEDA** | Canada | Consent, limited collection, accuracy |

### GDPR Key Principles

1. **Lawfulness** — Must have legal basis for processing
2. **Purpose limitation** — Collect for specified, explicit purposes
3. **Data minimization** — Only collect what's necessary
4. **Accuracy** — Keep data correct and up-to-date
5. **Storage limitation** — Don't keep data longer than needed
6. **Integrity** — Ensure security and confidentiality

### PII (Personally Identifiable Information)

| Direct Identifiers | Quasi-Identifiers |
|-------------------|-------------------|
| Full name | Age |
| Email address | Zip code |
| Phone number | Gender |
| SSN / National ID | Occupation |
| Address | Date of birth |
| IP address | Education level |

**Important:** Combinations of quasi-identifiers can uniquely identify individuals. Research shows 87% of Americans can be identified by zip code + gender + birth date.

---

## Privacy-Preserving Techniques

### 1. Anonymization

```python
import pandas as pd
import hashlib

# Original data with PII
data = pd.DataFrame({
    "name": ["Alice Johnson", "Bob Smith", "Carol Williams"],
    "email": ["alice@email.com", "bob@email.com", "carol@email.com"],
    "age": [34, 45, 28],
    "salary": [75000, 92000, 68000],
    "department": ["Engineering", "Marketing", "Engineering"]
})

# Remove direct identifiers
anonymized = data.drop(columns=["name", "email"])

# Or hash identifiers (for joining without revealing)
def hash_value(val):
    return hashlib.sha256(val.encode()).hexdigest()[:12]

data["user_id"] = data["email"].apply(hash_value)
anonymized = data.drop(columns=["name", "email"])
print(anonymized)
```

### 2. K-Anonymity

Each record is indistinguishable from at least $k-1$ other records:

```python
import pandas as pd
import numpy as np

# Original data
data = pd.DataFrame({
    "age": [25, 26, 34, 35, 42, 43, 55, 56],
    "zip": ["10001", "10001", "10002", "10002", "10003", "10003", "10004", "10004"],
    "condition": ["Flu", "Cold", "Diabetes", "Asthma", "Cancer", "Flu", "Cold", "Cancer"]
})

# Generalize to achieve k-anonymity (k=2)
def generalize_age(age):
    """Group ages into ranges."""
    return f"{(age // 10) * 10}-{(age // 10) * 10 + 9}"

def generalize_zip(zip_code):
    """Remove last 2 digits."""
    return zip_code[:3] + "**"

data_k_anon = data.copy()
data_k_anon["age"] = data["age"].apply(generalize_age)
data_k_anon["zip"] = data["zip"].apply(generalize_zip)

print("K-anonymized data (k=2):")
print(data_k_anon)

# Verify k-anonymity
groups = data_k_anon.groupby(["age", "zip"]).size()
k = groups.min()
print(f"\nAchieved k = {k} (minimum group size)")
```

### 3. Differential Privacy

Add calibrated noise to prevent identifying any individual:

$$\text{Mechanism}(x) = f(x) + \text{Laplace}\left(\frac{\Delta f}{\epsilon}\right)$$

Where:
- $\Delta f$ = sensitivity (max change from one person)
- $\epsilon$ = privacy budget (smaller = more private)

```python
import numpy as np

def laplace_mechanism(true_value, sensitivity, epsilon):
    """Add Laplace noise for differential privacy."""
    noise = np.random.laplace(0, sensitivity / epsilon)
    return true_value + noise

# True statistic
true_mean_salary = 75000
n_records = 1000
sensitivity = 200000 / n_records  # max_salary / n

# Differentially private versions with different privacy budgets
print("Privacy-utility tradeoff (mean salary):")
for eps in [0.1, 0.5, 1.0, 5.0, 10.0]:
    errors = [abs(laplace_mechanism(true_mean_salary, sensitivity, eps) - true_mean_salary)
              for _ in range(1000)]
    print(f"  ε={eps:>5.1f} → avg error: ${np.mean(errors):,.0f}")
```

### 4. Federated Learning

Train models **without centralizing data** — each device keeps its data local and only shares model updates with a central server.

- Used by Google (keyboard predictions), Apple (Siri), hospitals (medical research)
- Data never leaves the device
- Only aggregated model updates are shared
- Provides privacy by design

---

## Responsible AI Practices

### Model Cards

Document your model's capabilities and limitations:

```python
# Model Card Template
model_card = {
    "model": "Loan Approval Classifier v2.1",
    "type": "Gradient Boosted Trees",
    "intended_use": "Pre-screen loan applications (decision SUPPORT only)",
    "training_data": "500K applications (2019-2023)",
    "performance": {"accuracy": 0.89, "fpr": 0.08, "fnr": 0.12},
    "fairness": {
        "demographic_parity_diff": 0.03,
        "equalized_odds_diff": 0.05,
        "disparate_impact_worst": 0.85
    },
    "limitations": [
        "US data only",
        "Degrades for income < $20K",
        "No recent employment changes"
    ],
    "ethical_notes": [
        "NOT sole decision-maker",
        "Quarterly bias audits required",
        "Applicants have right to explanation"
    ]
}

for key, value in model_card.items():
    print(f"{key}: {value}")
```

### Data Ethics Checklist

```python
# Data ethics checklist — ask these for every project
checklist = [
    "Data Collection: Is consent obtained? Is collection minimized?",
    "Processing: Is PII protected? Are proxies for protected attributes checked?",
    "Modeling: Are fairness metrics computed across groups?",
    "Deployment: Is there human oversight for high-stakes decisions?",
    "Monitoring: Is bias tracked over time? Can the model be rolled back?",
    "Documentation: Is a model card published with limitations noted?"
]

print("DATA ETHICS CHECKLIST")
print("=" * 50)
for item in checklist:
    print(f"  [ ] {item}")
```

---

## Case Studies: Ethical Failures

| Case | Issue | Lesson |
|------|-------|--------|
| Amazon Hiring (2018) | Penalized resumes with "women's" — trained on male-dominated history | Historical data encodes discrimination |
| COMPAS Justice (2016) | Black defendants falsely flagged high-risk at 2× the rate | Equal accuracy ≠ equal error rates |
| Healthcare Algorithm (2019) | Used spending as proxy for need; Black patients spend less due to access barriers | Proxy variables encode inequality |
| Clearview AI (2020) | Scraped billions of photos without consent | "Publicly available" ≠ consent |

---

## Summary

| Topic | Key Point |
|-------|-----------|
| Bias | Algorithms learn from biased data and amplify it |
| Fairness | Measure across groups: demographic parity, equalized odds |
| Privacy | Minimize data, anonymize, use differential privacy |
| Regulation | GDPR, CCPA, HIPAA set legal requirements |
| Responsible AI | Model cards, audits, human oversight |
| Accountability | Document decisions, maintain audit trails |

**Key takeaways:**
- Every model has potential for harm — actively check for it
- Fairness is not one metric; different definitions may conflict
- Privacy is a right, not a feature — design for it from the start
- "The algorithm decided" is not an excuse — humans are accountable
- Build diverse teams — homogeneous teams have blind spots
- When in doubt, ask: "Would I be comfortable if this decision were made about me?"
