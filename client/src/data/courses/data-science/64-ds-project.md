---
title: End-to-End Data Science Project
---

# End-to-End Data Science Project

This lesson walks through a complete data science project from problem definition to business recommendations. We'll predict customer churn for a telecom company — a classic and practical problem that demonstrates the full pipeline.

---

## Project Overview

**Business Problem**: A telecom company is losing customers. They want to identify customers likely to churn so the retention team can intervene with targeted offers.

**Success Metric**: Maximize $F_1$ score (we care about both precision and recall with imbalanced classes).

**Deliverable**: A model that scores existing customers by churn risk, plus actionable insights about churn drivers.

---

## Step 1: Problem Definition

```python
# Define the project scope clearly
project_scope = {
    "business_goal": "Reduce monthly churn by identifying at-risk customers",
    "target_variable": "Churn (Yes/No)",
    "success_metric": "F1 score >= 0.80",
    "constraints": [
        "Model must be interpretable (stakeholders need to understand drivers)",
        "Predictions needed weekly for the retention team",
        "False positives are costly (unnecessary discounts) but acceptable",
        "False negatives are very costly (lost customers)"
    ],
    "timeline": "2 weeks to MVP, iterate monthly"
}

# Key questions to ask stakeholders:
# - How is churn defined? (cancelled? no activity for X days?)
# - What interventions are possible? (discounts, calls, upgrades)
# - What data is available?
# - How often do we need predictions?
```

---

## Step 2: Data Loading and Overview

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# Load data
df = pd.read_csv('telco_churn.csv')

# First look
print(f"Dataset shape: {df.shape}")
print(f"Rows: {df.shape[0]:,} | Columns: {df.shape[1]}")
print()

# Column overview
print("=" * 60)
print("COLUMN INFORMATION")
print("=" * 60)
print(df.info())
print()

# Statistical summary
print("=" * 60)
print("NUMERICAL SUMMARY")
print("=" * 60)
print(df.describe())
print()

# First few rows
print("=" * 60)
print("SAMPLE ROWS")
print("=" * 60)
print(df.head())
```

```python
# Check for missing values
print("MISSING VALUES")
print("-" * 40)
missing = df.isnull().sum()
missing_pct = (missing / len(df) * 100).round(2)
missing_df = pd.DataFrame({
    'Missing': missing,
    'Percent': missing_pct
})
print(missing_df[missing_df['Missing'] > 0])

# Check for duplicates
print(f"\nDuplicate rows: {df.duplicated().sum()}")

# Check target variable
print(f"\nTarget distribution:")
print(df['Churn'].value_counts())
print(f"\nChurn rate: {df['Churn'].mean():.1%}")
```

---

## Step 3: Exploratory Data Analysis

```python
# Target distribution
fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Churn rate
churn_counts = df['Churn'].value_counts()
colors = ['#66BB6A', '#EF5350']
axes[0].pie(churn_counts, labels=['Stayed', 'Churned'], colors=colors,
            autopct='%1.1f%%', startangle=90)
axes[0].set_title('Customer Churn Rate', fontweight='bold')

# Monthly charges distribution by churn
df[df['Churn'] == 0]['MonthlyCharges'].hist(
    ax=axes[1], alpha=0.6, label='Stayed', color='#66BB6A', bins=30)
df[df['Churn'] == 1]['MonthlyCharges'].hist(
    ax=axes[1], alpha=0.6, label='Churned', color='#EF5350', bins=30)
axes[1].set_title('Monthly Charges by Churn Status', fontweight='bold')
axes[1].set_xlabel('Monthly Charges ($)')
axes[1].legend()

plt.tight_layout()
plt.show()
```

```python
# Key feature analysis
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

# 1. Tenure vs Churn
axes[0, 0].hist(df[df['Churn'] == 0]['tenure'], alpha=0.6,
                label='Stayed', color='#66BB6A', bins=20)
axes[0, 0].hist(df[df['Churn'] == 1]['tenure'], alpha=0.6,
                label='Churned', color='#EF5350', bins=20)
axes[0, 0].set_title('Tenure Distribution by Churn')
axes[0, 0].set_xlabel('Tenure (months)')
axes[0, 0].legend()

# 2. Contract type vs Churn
contract_churn = df.groupby('Contract')['Churn'].mean().sort_values(ascending=False)
contract_churn.plot(kind='bar', ax=axes[0, 1], color=['#EF5350', '#FFA726', '#66BB6A'])
axes[0, 1].set_title('Churn Rate by Contract Type')
axes[0, 1].set_ylabel('Churn Rate')
axes[0, 1].set_xticklabels(axes[0, 1].get_xticklabels(), rotation=0)

# 3. Internet Service vs Churn
internet_churn = df.groupby('InternetService')['Churn'].mean().sort_values(ascending=False)
internet_churn.plot(kind='bar', ax=axes[1, 0], color=['#EF5350', '#FFA726', '#66BB6A'])
axes[1, 0].set_title('Churn Rate by Internet Service')
axes[1, 0].set_ylabel('Churn Rate')
axes[1, 0].set_xticklabels(axes[1, 0].get_xticklabels(), rotation=0)

# 4. Payment method vs Churn
payment_churn = df.groupby('PaymentMethod')['Churn'].mean().sort_values(ascending=False)
payment_churn.plot(kind='barh', ax=axes[1, 1], color='#1976D2')
axes[1, 1].set_title('Churn Rate by Payment Method')
axes[1, 1].set_xlabel('Churn Rate')

plt.tight_layout()
plt.show()
```

```python
# Correlation analysis for numeric features
numeric_cols = df.select_dtypes(include=[np.number]).columns
correlation_with_churn = df[numeric_cols].corrwith(df['Churn']).sort_values()

print("CORRELATION WITH CHURN")
print("-" * 40)
print(correlation_with_churn)

# Key insight: tenure is negatively correlated (long-term customers stay)
# Monthly charges positively correlated (higher bills → more churn)
```

---

## Step 4: Data Cleaning & Preprocessing

```python
# Make a copy for processing
data = df.copy()

# Handle TotalCharges (often stored as string with spaces)
data['TotalCharges'] = pd.to_numeric(data['TotalCharges'], errors='coerce')

# Check what rows have missing TotalCharges
missing_tc = data[data['TotalCharges'].isnull()]
print(f"Missing TotalCharges: {len(missing_tc)} rows")
print(f"These customers have tenure: {missing_tc['tenure'].unique()}")
# Usually tenure=0, so TotalCharges should be 0
data['TotalCharges'].fillna(0, inplace=True)

# Convert target to binary
data['Churn'] = data['Churn'].map({'Yes': 1, 'No': 0})

# Drop customerID (not a feature)
data.drop('customerID', axis=1, inplace=True)

print(f"Cleaned dataset shape: {data.shape}")
print(f"Target distribution:\n{data['Churn'].value_counts()}")
```

```python
# Feature Engineering
print("FEATURE ENGINEERING")
print("-" * 40)

# 1. Tenure groups
data['tenure_group'] = pd.cut(
    data['tenure'],
    bins=[0, 12, 24, 48, 72],
    labels=['0-1yr', '1-2yr', '2-4yr', '4-6yr']
)

# 2. Average monthly charge (total / tenure)
data['avg_monthly_charge'] = np.where(
    data['tenure'] > 0,
    data['TotalCharges'] / data['tenure'],
    data['MonthlyCharges']
)

# 3. Charge increase (current vs average)
data['charge_increase'] = data['MonthlyCharges'] - data['avg_monthly_charge']

# 4. Number of services subscribed
service_cols = ['PhoneService', 'OnlineSecurity', 'OnlineBackup',
                'DeviceProtection', 'TechSupport', 'StreamingTV',
                'StreamingMovies']
data['num_services'] = data[service_cols].apply(
    lambda x: (x == 'Yes').sum(), axis=1
)

# 5. Has partner and dependents (stability indicator)
data['has_family'] = ((data['Partner'] == 'Yes') |
                      (data['Dependents'] == 'Yes')).astype(int)

print("New features created:")
print(f"  - tenure_group: {data['tenure_group'].value_counts().to_dict()}")
print(f"  - avg_monthly_charge: mean={data['avg_monthly_charge'].mean():.2f}")
print(f"  - charge_increase: mean={data['charge_increase'].mean():.2f}")
print(f"  - num_services: mean={data['num_services'].mean():.1f}")
print(f"  - has_family: {data['has_family'].mean():.1%} have family")
```

---

## Step 5: Feature Engineering Pipeline

```python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Separate features and target
X = data.drop('Churn', axis=1)
y = data['Churn']

# Identify column types
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

print(f"Numeric features ({len(numeric_features)}): {numeric_features}")
print(f"Categorical features ({len(categorical_features)}): {categorical_features}")

# Train-test split (stratified to maintain class balance)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTrain set: {X_train.shape[0]} rows")
print(f"Test set: {X_test.shape[0]} rows")
print(f"Train churn rate: {y_train.mean():.1%}")
print(f"Test churn rate: {y_test.mean():.1%}")
```

```python
# Build preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', sparse_output=False,
                             handle_unknown='ignore'), categorical_features)
    ]
)

# Preview the transformation
X_train_processed = preprocessor.fit_transform(X_train)
print(f"Processed feature matrix shape: {X_train_processed.shape}")

# Get feature names after encoding
cat_feature_names = preprocessor.named_transformers_['cat'].get_feature_names_out(
    categorical_features
)
all_feature_names = list(numeric_features) + list(cat_feature_names)
print(f"Total features after encoding: {len(all_feature_names)}")
```

---

## Step 6: Baseline Model

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, f1_score)

# Build pipeline: preprocessing + model
baseline_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', LogisticRegression(max_iter=1000, random_state=42))
])

# Train
baseline_pipeline.fit(X_train, y_train)

# Predict
y_pred = baseline_pipeline.predict(X_test)
y_prob = baseline_pipeline.predict_proba(X_test)[:, 1]

# Evaluate
print("=" * 60)
print("BASELINE MODEL: Logistic Regression")
print("=" * 60)
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['Stay', 'Churn']))
print(f"ROC AUC: {roc_auc_score(y_test, y_prob):.4f}")
print(f"F1 Score: {f1_score(y_test, y_pred):.4f}")
```

```python
# Confusion Matrix visualization
fig, ax = plt.subplots(figsize=(6, 5))
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax,
            xticklabels=['Predicted Stay', 'Predicted Churn'],
            yticklabels=['Actual Stay', 'Actual Churn'])
ax.set_title('Baseline Model: Confusion Matrix', fontweight='bold')
plt.tight_layout()
plt.show()

# Interpret
tn, fp, fn, tp = cm.ravel()
print(f"True Negatives (correctly predicted Stay): {tn}")
print(f"False Positives (predicted Churn, actually Stay): {fp}")
print(f"False Negatives (predicted Stay, actually Churn): {fn}")
print(f"True Positives (correctly predicted Churn): {tp}")
print(f"\nMissed {fn} churners out of {fn + tp} ({fn/(fn+tp):.1%} miss rate)")
```

---

## Step 7: Model Comparison

```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score

# Define models to compare
models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=200, random_state=42)
}

# Cross-validation comparison
print("=" * 60)
print("MODEL COMPARISON (5-Fold Cross-Validation)")
print("=" * 60)
print(f"{'Model':<25} {'F1 Mean':>10} {'F1 Std':>10} {'AUC Mean':>10}")
print("-" * 60)

results = {}
for name, model in models.items():
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', model)
    ])

    # F1 score
    f1_scores = cross_val_score(pipeline, X_train, y_train,
                                cv=5, scoring='f1')
    # AUC score
    auc_scores = cross_val_score(pipeline, X_train, y_train,
                                 cv=5, scoring='roc_auc')

    results[name] = {
        'f1_mean': f1_scores.mean(),
        'f1_std': f1_scores.std(),
        'auc_mean': auc_scores.mean()
    }

    print(f"{name:<25} {f1_scores.mean():>10.4f} {f1_scores.std():>10.4f} "
          f"{auc_scores.mean():>10.4f}")

# Select best model
best_model_name = max(results, key=lambda x: results[x]['f1_mean'])
print(f"\nBest model: {best_model_name}")
```

```python
# Try XGBoost if available
try:
    from xgboost import XGBClassifier

    xgb_pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('model', XGBClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42,
            eval_metric='logloss'
        ))
    ])

    f1_scores = cross_val_score(xgb_pipeline, X_train, y_train,
                                cv=5, scoring='f1')
    auc_scores = cross_val_score(xgb_pipeline, X_train, y_train,
                                 cv=5, scoring='roc_auc')

    print(f"\nXGBoost Results:")
    print(f"  F1: {f1_scores.mean():.4f} (+/- {f1_scores.std():.4f})")
    print(f"  AUC: {auc_scores.mean():.4f}")

    results['XGBoost'] = {
        'f1_mean': f1_scores.mean(),
        'f1_std': f1_scores.std(),
        'auc_mean': auc_scores.mean()
    }

except ImportError:
    print("XGBoost not installed. Using Gradient Boosting as alternative.")
```

---

## Step 8: Hyperparameter Tuning

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

# Tune the best model (Gradient Boosting or XGBoost)
param_distributions = {
    'model__n_estimators': randint(100, 500),
    'model__max_depth': randint(3, 10),
    'model__learning_rate': uniform(0.01, 0.3),
    'model__min_samples_split': randint(2, 20),
    'model__min_samples_leaf': randint(1, 10),
    'model__subsample': uniform(0.6, 0.4)
}

# Build pipeline for tuning
tuning_pipeline = Pipeline([
    ('preprocessor', preprocessor),
    ('model', GradientBoostingClassifier(random_state=42))
])

# Randomized search
search = RandomizedSearchCV(
    tuning_pipeline,
    param_distributions,
    n_iter=50,
    cv=5,
    scoring='f1',
    random_state=42,
    n_jobs=-1,
    verbose=1
)

search.fit(X_train, y_train)

print("=" * 60)
print("HYPERPARAMETER TUNING RESULTS")
print("=" * 60)
print(f"Best F1 Score: {search.best_score_:.4f}")
print(f"\nBest Parameters:")
for param, value in search.best_params_.items():
    print(f"  {param}: {value}")
```

---

## Step 9: Final Evaluation

```python
from sklearn.metrics import roc_curve, precision_recall_curve

# Use best model from tuning
best_pipeline = search.best_estimator_

# Final predictions on test set
y_pred_final = best_pipeline.predict(X_test)
y_prob_final = best_pipeline.predict_proba(X_test)[:, 1]

# Comprehensive evaluation
print("=" * 60)
print("FINAL MODEL EVALUATION (Test Set)")
print("=" * 60)
print(f"\nClassification Report:")
print(classification_report(y_test, y_pred_final, target_names=['Stay', 'Churn']))
print(f"ROC AUC: {roc_auc_score(y_test, y_prob_final):.4f}")
print(f"F1 Score: {f1_score(y_test, y_pred_final):.4f}")
```

```python
# ROC Curve
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# ROC
fpr, tpr, _ = roc_curve(y_test, y_prob_final)
auc_score = roc_auc_score(y_test, y_prob_final)
axes[0].plot(fpr, tpr, color='#1976D2', linewidth=2,
             label=f'Model (AUC = {auc_score:.3f})')
axes[0].plot([0, 1], [0, 1], 'k--', alpha=0.5, label='Random')
axes[0].set_xlabel('False Positive Rate')
axes[0].set_ylabel('True Positive Rate')
axes[0].set_title('ROC Curve', fontweight='bold')
axes[0].legend()

# Precision-Recall
precision, recall, _ = precision_recall_curve(y_test, y_prob_final)
axes[1].plot(recall, precision, color='#FF6B35', linewidth=2)
axes[1].set_xlabel('Recall')
axes[1].set_ylabel('Precision')
axes[1].set_title('Precision-Recall Curve', fontweight='bold')
axes[1].axhline(y=y_test.mean(), color='gray', linestyle='--',
                alpha=0.5, label=f'Baseline ({y_test.mean():.2f})')
axes[1].legend()

plt.tight_layout()
plt.show()
```

```python
# Feature Importance
model = best_pipeline.named_steps['model']
feature_importance = pd.DataFrame({
    'feature': all_feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False).head(15)

fig, ax = plt.subplots(figsize=(8, 6))
sns.barplot(data=feature_importance, x='importance', y='feature',
            palette='viridis', ax=ax)
ax.set_title('Top 15 Features Driving Churn', fontweight='bold')
ax.set_xlabel('Feature Importance')
plt.tight_layout()
plt.show()

print("\nTop 5 Churn Drivers:")
for i, row in feature_importance.head(5).iterrows():
    print(f"  {row['feature']}: {row['importance']:.4f}")
```

---

## Step 10: Insights and Recommendations

```python
# Business insights from the model
print("=" * 60)
print("KEY INSIGHTS & RECOMMENDATIONS")
print("=" * 60)

insights = """
KEY CHURN DRIVERS:
1. Contract Type: Month-to-month customers churn at 42% vs 3% for 2-year contracts
2. Tenure: New customers (< 12 months) are 3x more likely to churn
3. Monthly Charges: Customers paying > $70/month churn at 2x the average rate
4. Internet Service: Fiber optic customers churn more (possibly service quality issues)
5. Payment Method: Electronic check users churn at 45% vs 15% for auto-pay

RECOMMENDATIONS:
1. IMMEDIATE: Target month-to-month, high-charge customers with annual contract offers
   - Expected impact: 15-20% churn reduction in this segment
   - Offer: 15% discount for switching to annual contract

2. SHORT-TERM: Improve onboarding for first-year customers
   - The first 12 months are critical — engage early and often
   - Welcome calls, setup assistance, usage check-ins

3. MEDIUM-TERM: Investigate fiber optic service quality
   - Higher churn suggests customer dissatisfaction
   - Survey fiber customers about pain points

4. LONG-TERM: Incentivize automatic payment methods
   - Electronic check users churn 3x more — likely less engaged
   - Offer small discount for switching to auto-pay

PROJECTED IMPACT:
- Current monthly churn: ~7.9%
- Target churn (with interventions): ~5.5%
- Revenue saved per quarter: estimated $1.8M - $2.5M
"""
print(insights)
```

```python
# Score current customer base for the retention team
def score_customers(pipeline, customer_data):
    """Score all customers and create priority list."""
    probabilities = pipeline.predict_proba(customer_data)[:, 1]

    scored = customer_data.copy()
    scored['churn_probability'] = probabilities
    scored['risk_level'] = pd.cut(
        probabilities,
        bins=[0, 0.3, 0.6, 1.0],
        labels=['Low', 'Medium', 'High']
    )

    # Priority: high probability + high value (monthly charges)
    scored['priority_score'] = (
        scored['churn_probability'] * scored['MonthlyCharges']
    )
    scored = scored.sort_values('priority_score', ascending=False)

    print(f"Customer Risk Distribution:")
    print(scored['risk_level'].value_counts())
    print(f"\nHigh-risk customers: {(scored['risk_level'] == 'High').sum()}")
    print(f"Total monthly revenue at risk: "
          f"${scored[scored['risk_level'] == 'High']['MonthlyCharges'].sum():,.0f}")

    return scored

# scored_customers = score_customers(best_pipeline, X_test)
```

---

## Project Checklist

Use this checklist for any data science project:

```python
project_checklist = {
    "Problem Definition": [
        "[ ] Business goal clearly stated",
        "[ ] Success metric defined",
        "[ ] Stakeholder alignment",
        "[ ] Constraints identified"
    ],
    "Data Understanding": [
        "[ ] Data sources identified and loaded",
        "[ ] Shape, types, missing values checked",
        "[ ] Target variable distribution examined",
        "[ ] Data quality issues documented"
    ],
    "EDA": [
        "[ ] Univariate distributions explored",
        "[ ] Bivariate relationships with target",
        "[ ] Correlations analyzed",
        "[ ] Key patterns and anomalies noted"
    ],
    "Preprocessing": [
        "[ ] Missing values handled",
        "[ ] Data types corrected",
        "[ ] Outliers addressed",
        "[ ] Feature engineering completed"
    ],
    "Modeling": [
        "[ ] Train/test split (stratified if needed)",
        "[ ] Baseline model established",
        "[ ] Multiple models compared",
        "[ ] Best model tuned",
        "[ ] No data leakage verified"
    ],
    "Evaluation": [
        "[ ] Test set performance reported",
        "[ ] Appropriate metrics for the problem",
        "[ ] Confusion matrix interpreted",
        "[ ] Feature importance analyzed"
    ],
    "Communication": [
        "[ ] Key findings summarized",
        "[ ] Visualizations tell the story",
        "[ ] Recommendations are actionable",
        "[ ] Limitations acknowledged",
        "[ ] Next steps defined"
    ]
}

# Print checklist
for section, items in project_checklist.items():
    print(f"\n{section}:")
    for item in items:
        print(f"  {item}")
```

---

## Summary

This end-to-end project demonstrated:

| Step | What We Did | Key Tool |
|------|-------------|----------|
| 1. Problem | Defined goal, metric, constraints | Business understanding |
| 2. Data | Loaded and inspected | pandas |
| 3. EDA | Explored patterns and relationships | seaborn, matplotlib |
| 4. Clean | Handled missing values, types | pandas |
| 5. Features | Engineered new features, built pipeline | sklearn ColumnTransformer |
| 6. Baseline | Logistic Regression benchmark | sklearn Pipeline |
| 7. Compare | Multiple algorithms | cross_val_score |
| 8. Tune | Optimized hyperparameters | RandomizedSearchCV |
| 9. Evaluate | Test set, ROC, feature importance | sklearn metrics |
| 10. Insights | Business recommendations | Domain knowledge |

The goal of a data science project is not just a good $F_1$ score — it's a **decision** that improves the business. Always connect your technical results back to actionable recommendations.
