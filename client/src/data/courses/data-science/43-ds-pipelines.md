---
title: Scikit-Learn Pipelines
---

# Scikit-Learn Pipelines

A Pipeline chains multiple **preprocessing steps and a model** into a single object. It ensures consistent data transformations and prevents data leakage.

---

## Why Pipelines?

| Without Pipeline | With Pipeline |
|-----------------|---------------|
| Manual step-by-step code | Single `.fit()` / `.predict()` |
| Easy to forget a step | All steps automated |
| Data leakage risk | Transforms only fit on train |
| Hard to reproduce | Fully reproducible |
| Messy cross-validation | Clean CV integration |

**Data leakage example:** If you scale all data before splitting, test data statistics "leak" into training. Pipelines prevent this by fitting transforms only on training data during cross-validation.

---

## Basic Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

# Generate sample data
X, y = make_classification(n_samples=500, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create pipeline
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression(max_iter=1000))
])

# Use like a single model
pipe.fit(X_train, y_train)
predictions = pipe.predict(X_test)
score = pipe.score(X_test, y_test)

print(f"Test accuracy: {score:.4f}")
print(f"Predictions (first 5): {predictions[:5]}")
```

**What happens internally:**
1. `pipe.fit(X_train, y_train)`:
   - `scaler.fit_transform(X_train)` → learns mean/std from training data
   - `model.fit(X_scaled, y_train)` → trains on scaled data
2. `pipe.predict(X_test)`:
   - `scaler.transform(X_test)` → applies same scaling (no re-fitting!)
   - `model.predict(X_scaled)` → generates predictions

---

## make_pipeline Shortcut

Auto-generates step names from class names:

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_regression

X, y = make_regression(n_samples=500, n_features=5, noise=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Shorter syntax — names auto-generated
pipe = make_pipeline(
    StandardScaler(),
    PolynomialFeatures(degree=2),
    Ridge(alpha=1.0)
)

pipe.fit(X_train, y_train)
print(f"R² score: {pipe.score(X_test, y_test):.4f}")

# View step names
print(f"\nStep names: {[name for name, _ in pipe.steps]}")

# Access individual steps
print(f"Scaler mean (first 3): {pipe.named_steps['standardscaler'].mean_[:3]}")
```

---

## Accessing Pipeline Steps

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.svm import SVC
from sklearn.datasets import make_classification

X, y = make_classification(n_samples=200, n_features=20, random_state=42)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('pca', PCA(n_components=5)),
    ('svm', SVC(kernel='rbf'))
])

pipe.fit(X, y)

# Access by name
scaler = pipe.named_steps['scaler']
print(f"Scaler mean shape: {scaler.mean_.shape}")

# Access by index
pca = pipe[1]
print(f"PCA explained variance: {pca.explained_variance_ratio_}")

# Slice pipeline (get subset of steps)
preprocessing = pipe[:2]  # scaler + pca only
X_preprocessed = preprocessing.transform(X)
print(f"Preprocessed shape: {X_preprocessed.shape}")
```

---

## ColumnTransformer

Apply **different transformations** to different columns:

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np

# Sample data with mixed types
df = pd.DataFrame({
    'age': [25, 30, np.nan, 45, 22, 35, 50, 28],
    'income': [50000, 60000, 45000, np.nan, 35000, 70000, 80000, 55000],
    'city': ['NYC', 'LA', 'NYC', 'Chicago', 'LA', 'NYC', 'Chicago', 'LA'],
    'education': ['Bachelor', 'Master', 'PhD', 'Bachelor', 'Bachelor',
                  'Master', 'PhD', 'Master'],
    'purchased': [0, 1, 1, 0, 0, 1, 1, 0]
})

X = df.drop('purchased', axis=1)
y = df['purchased']

# Define column groups
num_cols = ['age', 'income']
cat_cols = ['city', 'education']

# Define transformers for each group
num_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('encoder', OneHotEncoder(drop='first', sparse_output=False))
])

# Combine with ColumnTransformer
preprocessor = ColumnTransformer([
    ('num', num_transformer, num_cols),
    ('cat', cat_transformer, cat_cols)
])

# Preview transformation
X_transformed = preprocessor.fit_transform(X)
print(f"Original shape: {X.shape}")
print(f"Transformed shape: {X_transformed.shape}")

# Get feature names
feature_names = preprocessor.get_feature_names_out()
print(f"Feature names: {list(feature_names)}")
```

---

### ColumnTransformer Options

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

# remainder='passthrough' — keep untransformed columns
ct = ColumnTransformer([
    ('num', StandardScaler(), ['age', 'income'])
], remainder='passthrough')  # other columns passed as-is

# remainder='drop' — discard untransformed columns (default)
ct_drop = ColumnTransformer([
    ('num', StandardScaler(), ['age', 'income'])
], remainder='drop')

# Using make_column_transformer shortcut
from sklearn.compose import make_column_transformer

ct_short = make_column_transformer(
    (StandardScaler(), ['age', 'income']),
    (OneHotEncoder(), ['city', 'education']),
    remainder='drop'
)
```

---

## Complete Pipeline

Combine ColumnTransformer + model into full pipeline:

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

# Create realistic dataset
np.random.seed(42)
n = 500
df = pd.DataFrame({
    'age': np.random.randint(18, 65, n).astype(float),
    'income': np.random.exponential(50000, n),
    'years_exp': np.random.randint(0, 30, n).astype(float),
    'department': np.random.choice(['Sales', 'Engineering', 'Marketing', 'HR'], n),
    'education': np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n),
    'promoted': np.random.binomial(1, 0.3, n)
})

# Add some missing values
df.loc[np.random.choice(n, 20), 'age'] = np.nan
df.loc[np.random.choice(n, 15), 'income'] = np.nan

X = df.drop('promoted', axis=1)
y = df['promoted']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define column types
num_cols = ['age', 'income', 'years_exp']
cat_cols = ['department', 'education']

# Build complete pipeline
full_pipeline = Pipeline([
    ('preprocessor', ColumnTransformer([
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler())
        ]), num_cols),
        ('cat', Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('encoder', OneHotEncoder(drop='first', sparse_output=False))
        ]), cat_cols)
    ])),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Fit and evaluate
full_pipeline.fit(X_train, y_train)
train_score = full_pipeline.score(X_train, y_train)
test_score = full_pipeline.score(X_test, y_test)

print(f"Train accuracy: {train_score:.4f}")
print(f"Test accuracy:  {test_score:.4f}")
```

---

## Pipeline with GridSearchCV

Use `stepname__parameter` syntax for hyperparameter tuning:

```python
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=500, n_features=15, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Pipeline
pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(random_state=42))
])

# Parameter grid — use 'stepname__param' syntax
param_grid = {
    'model__n_estimators': [50, 100, 200],
    'model__max_depth': [5, 10, None],
    'model__min_samples_split': [2, 5]
}

# Grid search with cross-validation
grid_search = GridSearchCV(
    pipe,
    param_grid,
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    verbose=0
)

grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.4f}")
print(f"Test score: {grid_search.score(X_test, y_test):.4f}")
```

---

### Comparing Multiple Models in Grid Search

```python
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=500, n_features=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', LogisticRegression())  # placeholder
])

# Search across different models AND their hyperparameters
param_grid = [
    {
        'model': [LogisticRegression(max_iter=1000)],
        'model__C': [0.01, 0.1, 1, 10]
    },
    {
        'model': [RandomForestClassifier(random_state=42)],
        'model__n_estimators': [50, 100],
        'model__max_depth': [5, 10]
    },
    {
        'model': [SVC()],
        'model__C': [0.1, 1, 10],
        'model__kernel': ['rbf', 'linear']
    }
]

grid = GridSearchCV(pipe, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid.fit(X_train, y_train)

print(f"Best model: {grid.best_params_['model']}")
print(f"Best params: {grid.best_params_}")
print(f"Best CV score: {grid.best_score_:.4f}")
print(f"Test score: {grid.score(X_test, y_test):.4f}")
```

---

## Custom Transformers

### FunctionTransformer

Wrap any function as a transformer:

```python
from sklearn.preprocessing import FunctionTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
import numpy as np

# Simple function transformer
log_transformer = FunctionTransformer(np.log1p, inverse_func=np.expm1)

# Use in pipeline
pipe = Pipeline([
    ('log', FunctionTransformer(np.log1p)),
    ('model', LinearRegression())
])

# Custom function
def clip_outliers(X, lower=1, upper=99):
    """Clip values to percentile range."""
    low = np.percentile(X, lower, axis=0)
    high = np.percentile(X, upper, axis=0)
    return np.clip(X, low, high)

clip_transformer = FunctionTransformer(clip_outliers)
```

---

### Custom Class Transformer

For stateful transforms (need to learn from training data):

```python
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
import numpy as np
import pandas as pd

class OutlierClipper(BaseEstimator, TransformerMixin):
    """Clip outliers based on IQR computed from training data."""

    def __init__(self, factor=1.5):
        self.factor = factor

    def fit(self, X, y=None):
        X = np.array(X)
        Q1 = np.percentile(X, 25, axis=0)
        Q3 = np.percentile(X, 75, axis=0)
        IQR = Q3 - Q1
        self.lower_ = Q1 - self.factor * IQR
        self.upper_ = Q3 + self.factor * IQR
        return self

    def transform(self, X):
        X = np.array(X)
        return np.clip(X, self.lower_, self.upper_)


class FeatureAdder(BaseEstimator, TransformerMixin):
    """Add interaction features."""

    def __init__(self, add_interactions=True):
        self.add_interactions = add_interactions

    def fit(self, X, y=None):
        return self  # Nothing to learn

    def transform(self, X):
        X = np.array(X)
        if self.add_interactions and X.shape[1] >= 2:
            interaction = (X[:, 0] * X[:, 1]).reshape(-1, 1)
            return np.hstack([X, interaction])
        return X


# Use custom transformers in pipeline
pipe = Pipeline([
    ('clipper', OutlierClipper(factor=1.5)),
    ('features', FeatureAdder(add_interactions=True)),
    ('scaler', StandardScaler()),
    ('model', LogisticRegression(max_iter=1000))
])

# Works with GridSearchCV too
from sklearn.model_selection import GridSearchCV

param_grid = {
    'clipper__factor': [1.0, 1.5, 2.0],
    'features__add_interactions': [True, False],
    'model__C': [0.1, 1, 10]
}
```

---

## Pipeline Visualization

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn import set_config

# Enable diagram display
set_config(display='diagram')

# Build pipeline
num_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

cat_transformer = Pipeline([
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('encoder', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer([
    ('num', num_transformer, ['age', 'income']),
    ('cat', cat_transformer, ['city', 'education'])
])

full_pipe = Pipeline([
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier())
])

# Display pipeline structure
print(full_pipe)

# In Jupyter notebooks, this renders as an interactive HTML diagram
# full_pipe  # just display the object
```

---

## Saving and Loading Pipelines

```python
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# Train pipeline
X, y = make_classification(n_samples=500, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])
pipe.fit(X_train, y_train)
print(f"Training score: {pipe.score(X_train, y_train):.4f}")

# Save pipeline
joblib.dump(pipe, 'model_pipeline.pkl')
print("Pipeline saved to model_pipeline.pkl")

# Load pipeline
loaded_pipe = joblib.load('model_pipeline.pkl')

# Verify it works
score = loaded_pipe.score(X_test, y_test)
print(f"Loaded pipeline test score: {score:.4f}")

# The loaded pipeline includes ALL preprocessing steps
# No need to re-scale or transform new data manually
new_data = X_test[:3]
predictions = loaded_pipe.predict(new_data)
print(f"Predictions on new data: {predictions}")
```

> **Important:** Save the entire pipeline, not just the model. This ensures new data gets the same preprocessing.

---

## Complete Example: Raw Data to Predictions

```python
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import (
    train_test_split, GridSearchCV, cross_val_score
)
import joblib

# --- Create realistic dataset ---
np.random.seed(42)
n = 1000
df = pd.DataFrame({
    'age': np.random.randint(18, 70, n).astype(float),
    'income': np.random.exponential(50000, n),
    'credit_score': np.random.randint(300, 850, n).astype(float),
    'years_employed': np.random.randint(0, 40, n).astype(float),
    'num_products': np.random.randint(1, 5, n),
    'has_mortgage': np.random.choice(['Yes', 'No'], n),
    'region': np.random.choice(['North', 'South', 'East', 'West'], n),
    'account_type': np.random.choice(['Savings', 'Checking', 'Premium'], n),
    'churned': np.random.binomial(1, 0.2, n)
})

# Add missing values
for col in ['age', 'income', 'credit_score']:
    df.loc[np.random.choice(n, 30), col] = np.nan

# --- Prepare data ---
X = df.drop('churned', axis=1)
y = df['churned']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# --- Define column types ---
num_cols = ['age', 'income', 'credit_score', 'years_employed', 'num_products']
cat_cols = ['has_mortgage', 'region', 'account_type']

# --- Build pipeline ---
preprocessor = ColumnTransformer([
    ('num', Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ]), num_cols),
    ('cat', Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(drop='first', sparse_output=False))
    ]), cat_cols)
])

pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', GradientBoostingClassifier(random_state=42))
])

# --- Hyperparameter tuning ---
param_grid = {
    'preprocessor__num__imputer__strategy': ['median', 'mean'],
    'model__n_estimators': [100, 200],
    'model__max_depth': [3, 5],
    'model__learning_rate': [0.05, 0.1]
}

grid_search = GridSearchCV(
    pipeline, param_grid,
    cv=5, scoring='f1',
    n_jobs=-1, verbose=0
)

grid_search.fit(X_train, y_train)

# --- Results ---
print("=" * 50)
print("PIPELINE RESULTS")
print("=" * 50)
print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV F1 score: {grid_search.best_score_:.4f}")
print(f"Test F1 score: {grid_search.score(X_test, y_test):.4f}")

# --- Save best pipeline ---
best_pipeline = grid_search.best_estimator_
joblib.dump(best_pipeline, 'churn_pipeline.pkl')
print("\nPipeline saved to churn_pipeline.pkl")

# --- Predict on new data ---
new_customer = pd.DataFrame({
    'age': [35],
    'income': [65000],
    'credit_score': [720],
    'years_employed': [8],
    'num_products': [3],
    'has_mortgage': ['Yes'],
    'region': ['North'],
    'account_type': ['Premium']
})

prediction = best_pipeline.predict(new_customer)
probability = best_pipeline.predict_proba(new_customer)
print(f"\nNew customer prediction: {'Churn' if prediction[0] else 'Stay'}")
print(f"Churn probability: {probability[0][1]:.2%}")
```

---

## Summary

| Concept | Use |
|---------|-----|
| `Pipeline` | Chain steps sequentially |
| `make_pipeline` | Quick pipeline without naming |
| `ColumnTransformer` | Different transforms per column |
| `GridSearchCV` + Pipeline | Tune entire pipeline |
| Custom Transformer | Reusable custom logic |
| `joblib.dump/load` | Save and deploy pipeline |

**Key Rule:** Everything that touches data should be inside the pipeline. If you preprocess outside, you risk data leakage and deployment issues.

---
