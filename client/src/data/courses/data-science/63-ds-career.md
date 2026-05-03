---
title: Data Science Career Guide
---

# Data Science Career Guide

Data science is one of the most dynamic and rewarding career fields. But "data science" is an umbrella term covering many distinct roles. This lesson helps you understand the landscape, build a compelling portfolio, and navigate the job search.

---

## The Data Science Roles Spectrum

### Role Overview

| Role | Focus | Key Skills | Typical Output |
|------|-------|-----------|----------------|
| **Data Analyst** | Describe what happened | SQL, Excel, dashboards | Reports, dashboards |
| **Data Scientist** | Predict and explain | Python, ML, statistics | Models, experiments |
| **Data Engineer** | Build data infrastructure | SQL, Spark, Airflow | Pipelines, warehouses |
| **ML Engineer** | Deploy and scale models | Python, Docker, cloud | Production ML systems |
| **Analytics Engineer** | Model and transform data | SQL, dbt, data modeling | Clean data models |

### Data Analyst

```python
# Day in the life of a Data Analyst
analyst_responsibilities = [
    "Write SQL queries to answer business questions",
    "Build and maintain dashboards (Tableau, Looker, Power BI)",
    "Perform ad-hoc analysis for stakeholders",
    "Track KPIs and report on metrics",
    "Identify trends and anomalies in data",
    "A/B test analysis and reporting"
]

analyst_skills = {
    "must_have": ["SQL", "Excel/Sheets", "Data visualization", "Statistics basics"],
    "nice_to_have": ["Python/R", "Tableau/Power BI", "dbt"],
    "soft_skills": ["Communication", "Business acumen", "Curiosity"]
}
```

### Data Scientist

```python
# Day in the life of a Data Scientist
scientist_responsibilities = [
    "Build predictive models (classification, regression)",
    "Design and analyze A/B tests",
    "Perform deep statistical analysis",
    "Feature engineering and selection",
    "Communicate findings to stakeholders",
    "Research new methods and techniques"
]

scientist_skills = {
    "must_have": ["Python", "Statistics", "Machine Learning", "SQL", "Communication"],
    "nice_to_have": ["Deep Learning", "NLP", "Spark", "Cloud platforms"],
    "soft_skills": ["Problem framing", "Storytelling", "Collaboration"]
}
```

### Data Engineer

```python
# Day in the life of a Data Engineer
engineer_responsibilities = [
    "Design and build data pipelines (ETL/ELT)",
    "Maintain data warehouse (Snowflake, BigQuery, Redshift)",
    "Ensure data quality and reliability",
    "Optimize query performance",
    "Build streaming data systems",
    "Manage infrastructure (Airflow, Spark, Kafka)"
]

engineer_skills = {
    "must_have": ["SQL", "Python", "Distributed systems", "Cloud (AWS/GCP/Azure)"],
    "nice_to_have": ["Spark", "Kafka", "Airflow", "Terraform", "Kubernetes"],
    "soft_skills": ["Systems thinking", "Reliability mindset", "Documentation"]
}
```

### ML Engineer

```python
# Day in the life of an ML Engineer
ml_engineer_responsibilities = [
    "Deploy models to production",
    "Build model serving infrastructure",
    "Monitor model performance and drift",
    "Optimize model inference speed",
    "Build CI/CD for ML pipelines",
    "Scale systems to handle traffic"
]

ml_engineer_skills = {
    "must_have": ["Python", "Docker", "Cloud", "ML frameworks", "APIs"],
    "nice_to_have": ["Kubernetes", "MLflow", "TensorFlow Serving", "Spark"],
    "soft_skills": ["Software engineering mindset", "Ops thinking"]
}
```

### Analytics Engineer

```python
# Day in the life of an Analytics Engineer
analytics_engineer_responsibilities = [
    "Build and maintain dbt models",
    "Define metrics and business logic in code",
    "Create clean, documented data models",
    "Bridge gap between data engineering and analytics",
    "Ensure data consistency across teams",
    "Write tests for data quality"
]

analytics_engineer_skills = {
    "must_have": ["SQL", "dbt", "Data modeling", "Git"],
    "nice_to_have": ["Python", "Airflow", "Looker/Tableau"],
    "soft_skills": ["Attention to detail", "Cross-team communication"]
}
```

---

## Skills by Role

| Skill | Analyst | Scientist | Engineer | ML Eng | Analytics Eng |
|-------|---------|-----------|----------|--------|---------------|
| SQL | ★★★ | ★★☆ | ★★★ | ★★☆ | ★★★ |
| Python | ★☆☆ | ★★★ | ★★★ | ★★★ | ★☆☆ |
| Statistics | ★★☆ | ★★★ | ★☆☆ | ★★☆ | ★☆☆ |
| Machine Learning | ★☆☆ | ★★★ | ★☆☆ | ★★★ | ☆☆☆ |
| Cloud/Infra | ☆☆☆ | ★☆☆ | ★★★ | ★★★ | ★☆☆ |
| Visualization | ★★★ | ★★☆ | ☆☆☆ | ☆☆☆ | ★★☆ |
| Software Eng | ★☆☆ | ★★☆ | ★★★ | ★★★ | ★★☆ |
| Communication | ★★★ | ★★★ | ★★☆ | ★★☆ | ★★★ |

---

## Building Your Portfolio

### GitHub: Your Technical Resume

```python
# Structure for a great portfolio project on GitHub
project_readme_template = """
# Project Title: Predicting Customer Churn

## Overview
Brief description of the problem and your approach.

## Key Results
- Model achieves 87% accuracy, 0.83 F1 score
- Identified top 3 churn drivers: contract type, tenure, charges
- Potential revenue impact: $2.3M saved annually

## Dataset
- Source: [Telco Customer Churn - Kaggle](link)
- Size: 7,043 customers, 21 features
- Target: Binary (Churn / No Churn)

## Methodology
1. Exploratory Data Analysis
2. Feature Engineering
3. Model Comparison (Logistic Regression, Random Forest, XGBoost)
4. Hyperparameter Tuning
5. Final Evaluation & Business Recommendations

## How to Run
```
pip install -r requirements.txt
python src/train.py
python src/predict.py --input data/new_customers.csv
```

## Project Structure
```
├── data/           # Raw and processed data
├── notebooks/      # EDA and experimentation
├── src/            # Production code
├── models/         # Trained models
├── reports/        # Final analysis and visualizations
└── README.md
```

## Key Visualizations
[Include 2-3 compelling charts]

## Lessons Learned
What you learned, challenges faced, and what you'd do differently.
"""
```

### Blog: Show Your Thinking

Write about your projects and learning:
- Explain your approach step by step
- Share mistakes and how you fixed them
- Discuss trade-offs and decisions
- Make technical topics accessible
- Platforms: Medium, Dev.to, personal blog (GitHub Pages)

### Kaggle: Competitive Edge

- **Competitions**: Show you can solve real problems
- **Notebooks**: Well-explained analysis gets upvotes
- **Discussions**: Help others, demonstrate knowledge
- **Datasets**: Contribute cleaned datasets

---

## Portfolio Project Ideas

### 1. Exploratory Data Analysis Project

```python
# Project: Analyze Airbnb listings data
# Skills demonstrated: pandas, visualization, statistical thinking

project_eda = {
    "dataset": "Inside Airbnb (any city)",
    "questions": [
        "What factors most influence price?",
        "How does location affect availability?",
        "What are the seasonal pricing patterns?",
        "Which neighborhoods are undervalued?"
    ],
    "deliverables": [
        "Jupyter notebook with clear narrative",
        "5-7 compelling visualizations",
        "Summary of actionable findings",
        "Blog post explaining the analysis"
    ]
}
```

### 2. End-to-End ML Project

```python
# Project: Predict housing prices
# Skills demonstrated: full ML pipeline, feature engineering

project_ml = {
    "dataset": "Ames Housing / Zillow data",
    "pipeline": [
        "Data cleaning and imputation",
        "Feature engineering (interactions, polynomials)",
        "Multiple model comparison",
        "Hyperparameter tuning",
        "Model interpretation (SHAP values)",
        "Deployment as API"
    ],
    "deliverables": [
        "Clean, documented codebase",
        "Model comparison report",
        "Deployed API (FastAPI + Docker)",
        "README with results and learnings"
    ]
}
```

### 3. Interactive Dashboard

```python
# Project: COVID-19 / Financial / Sports analytics dashboard
# Skills demonstrated: data engineering, visualization, deployment

project_dashboard = {
    "tool": "Streamlit or Plotly Dash",
    "features": [
        "Interactive filters (date range, categories)",
        "Multiple chart types",
        "Real-time or regularly updated data",
        "Clean, intuitive UI"
    ],
    "deliverables": [
        "Live deployed dashboard",
        "Data pipeline code",
        "Documentation"
    ]
}
```

### 4. NLP Project

```python
# Project: Sentiment analysis of product reviews
# Skills demonstrated: text processing, NLP, classification

project_nlp = {
    "dataset": "Amazon reviews / Twitter data",
    "pipeline": [
        "Text preprocessing (tokenization, cleaning)",
        "Feature extraction (TF-IDF, word embeddings)",
        "Model training (Naive Bayes, BERT fine-tuning)",
        "Error analysis",
        "Deployment with Streamlit"
    ]
}
```

### 5. Time Series Forecasting

```python
# Project: Forecast energy demand / stock volume / web traffic
# Skills demonstrated: time series analysis, forecasting

project_timeseries = {
    "dataset": "Energy consumption / web traffic data",
    "methods": [
        "Decomposition and seasonality analysis",
        "ARIMA / SARIMA modeling",
        "Prophet for comparison",
        "XGBoost with lag features",
        "Ensemble approach"
    ],
    "deliverables": [
        "Forecast accuracy comparison",
        "Visualization of predictions vs actuals",
        "Automated forecasting pipeline"
    ]
}
```

---

## Resume Tips for Data Science

### Quantify Everything

```python
# BAD resume bullets
bad_bullets = [
    "Worked on machine learning projects",
    "Used Python for data analysis",
    "Built dashboards for the team",
    "Performed statistical analysis"
]

# GOOD resume bullets
good_bullets = [
    "Built churn prediction model (F1=0.83) that identified 2,300 at-risk "
    "customers, enabling $1.8M retention campaign",
    "Automated weekly reporting pipeline, reducing analyst time from 8hrs to "
    "15min per week (96% reduction)",
    "Designed A/B testing framework that increased experiment velocity by 3x, "
    "supporting 12 concurrent tests",
    "Optimized SQL queries for customer segmentation dashboard, reducing load "
    "time from 45s to 2s (96% faster)"
]
```

### Resume Structure

1. **Summary**: 2-3 sentences, role + key skills + impact
2. **Skills**: Languages, tools, methods (tailor to job description)
3. **Experience**: Company, role, dates, 3-5 quantified bullets
4. **Projects**: 2-3 highlighted projects with links
5. **Education**: Degree, relevant coursework, certifications

### Tailor to Job Description

```python
# Match your resume to each job posting
def tailor_resume(job_description, your_skills):
    """Identify skill gaps and emphasis areas."""
    jd_keywords = set(job_description.lower().split())
    your_keywords = set(your_skills)

    # Must emphasize (in both JD and your skills)
    emphasize = jd_keywords & your_keywords

    # Gaps to address (in JD but not your skills)
    gaps = jd_keywords - your_keywords

    # Bonus (in your skills but not JD — mention briefly)
    extras = your_keywords - jd_keywords

    return {
        "emphasize": emphasize,  # Lead with these
        "gaps": gaps,            # Learn or honestly omit
        "extras": extras         # Supporting evidence
    }
```

---

## Interview Preparation

### SQL (Most Common Technical Screen)

Practice these patterns:

```python
sql_topics = {
    "Basic": [
        "SELECT, WHERE, GROUP BY, HAVING",
        "JOINs (INNER, LEFT, FULL)",
        "Aggregations (COUNT, SUM, AVG, MAX)"
    ],
    "Intermediate": [
        "Subqueries and CTEs",
        "CASE WHEN statements",
        "Date functions and manipulation",
        "Self-joins"
    ],
    "Advanced": [
        "Window functions (ROW_NUMBER, RANK, LAG, LEAD)",
        "Running totals and moving averages",
        "Pivot / unpivot",
        "Query optimization"
    ]
}

# Practice platforms: LeetCode, HackerRank, StrataScratch, DataLemur
```

### Statistics Questions

```python
statistics_topics = [
    "Explain p-value in plain English",
    "When would you use a t-test vs z-test?",
    "What is the Central Limit Theorem and why does it matter?",
    "Explain Type I and Type II errors with a business example",
    "How would you design an A/B test?",
    "What's the difference between correlation and causation?",
    "Explain confidence intervals",
    "What is statistical power and how does sample size affect it?",
    "Bayesian vs Frequentist: when to use each?",
    "How do you handle multiple comparisons?"
]
```

### Machine Learning Questions

```python
ml_interview_topics = {
    "Fundamentals": [
        "Bias-variance tradeoff",
        "Overfitting: detection and prevention",
        "Cross-validation: why and how",
        "Feature selection methods"
    ],
    "Algorithms": [
        "Explain how Random Forest works",
        "Logistic Regression vs Decision Tree",
        "When to use SVM vs Neural Networks",
        "How does gradient boosting work?"
    ],
    "Practical": [
        "How do you handle imbalanced classes?",
        "What metrics would you use for [problem]?",
        "How do you handle missing data?",
        "How do you detect and handle outliers?"
    ],
    "System Design": [
        "Design a recommendation system",
        "How would you build a fraud detection system?",
        "Design an A/B testing platform",
        "How would you deploy a model at scale?"
    ]
}
```

### Case Studies

The STAR framework for data science cases:

```python
case_study_framework = {
    "Situation": "What's the business context? What data is available?",
    "Task": "What specific question are we answering? What metric matters?",
    "Approach": [
        "1. Clarify the problem (ask questions!)",
        "2. Identify data sources and limitations",
        "3. Propose methodology",
        "4. Discuss potential challenges",
        "5. Define success metrics",
        "6. Outline next steps"
    ],
    "Result": "What would you expect? How would you measure success?"
}

# Example case: "How would you reduce customer churn?"
# 1. Define churn (no purchase in 90 days? cancelled subscription?)
# 2. What data? Transaction history, demographics, support tickets
# 3. Approach: EDA → survival analysis → predictive model → intervention
# 4. Challenges: defining churn, data quality, class imbalance
# 5. Metric: reduction in churn rate, revenue retained
# 6. Next steps: A/B test interventions on predicted churners
```

### Take-Home Projects

```python
# How to ace a take-home data science project
take_home_tips = {
    "time_management": [
        "Read the entire prompt first",
        "Allocate time: 30% EDA, 40% modeling, 30% presentation",
        "Set a time limit (usually 4-8 hours)",
        "Submit on time — perfection is the enemy of good"
    ],
    "structure": [
        "Start with a clear problem statement",
        "Document assumptions",
        "Show exploratory analysis before modeling",
        "Compare multiple approaches",
        "End with clear conclusions and next steps"
    ],
    "presentation": [
        "Write for a non-technical audience first",
        "Include executive summary at the top",
        "Use clear visualizations",
        "Explain your reasoning, not just results",
        "Acknowledge limitations honestly"
    ],
    "common_mistakes": [
        "Jumping straight to modeling without EDA",
        "Not validating properly (data leakage!)",
        "Over-engineering when simple works",
        "Submitting a messy notebook"
    ]
}
```

---

## Certifications

Certifications can supplement (not replace) practical experience:

| Certification | Provider | Best For | Duration |
|--------------|----------|----------|----------|
| Google Data Analytics | Coursera | Career switchers | 6 months |
| IBM Data Science | Coursera | Broad foundation | 6 months |
| AWS ML Specialty | AWS | Cloud ML focus | 2-3 months prep |
| TensorFlow Developer | Google | Deep learning | 1-2 months prep |
| dbt Analytics Engineering | dbt Labs | Analytics engineering | 2-4 weeks |
| Databricks Spark | Databricks | Big data | 1-2 months prep |

> **Note**: Portfolios and experience matter more than certifications. Use certifications to fill specific knowledge gaps, not as a substitute for building things.

---

## Continuous Learning

```python
# Stay current in data science
learning_strategy = {
    "daily": [
        "Read 1-2 articles (Towards Data Science, KDnuggets)",
        "Practice SQL or coding (15-30 min)"
    ],
    "weekly": [
        "Work on a side project",
        "Read research paper summaries",
        "Engage in community discussions"
    ],
    "monthly": [
        "Complete a short course or tutorial",
        "Write a blog post about something you learned",
        "Attend a meetup or webinar"
    ],
    "quarterly": [
        "Start a new portfolio project",
        "Learn a new tool or technique",
        "Review and update your resume/portfolio"
    ]
}
```

---

## Networking

- **Meetups**: Local data science meetups (Meetup.com)
- **Conferences**: PyCon, SciPy, NeurIPS (virtual options available)
- **Online**: Twitter/X data science community, LinkedIn, Reddit (r/datascience)
- **Open source**: Contribute to projects you use (pandas, scikit-learn)
- **Mentorship**: Find mentors through ADPList, MentorCruise, or your network

---

## Salary Context

Salaries vary significantly by location, experience, company size, and industry. General factors that increase compensation:

- Industry: Tech and finance pay more than non-profit and government
- Location: Major tech hubs command premiums (offset by cost of living)
- Experience: Senior roles pay 2-3x entry level
- Specialization: ML engineering and data engineering often pay more than analysis
- Company stage: Large tech companies tend to offer higher total compensation

> **Tip**: Focus on building skills and demonstrable impact rather than chasing salary. Compensation follows capability.

---

## Summary

Your data science career path:

1. **Choose your direction**: Analyst → Scientist → Engineer (or hybrid)
2. **Build skills**: Technical foundation + domain expertise + communication
3. **Show your work**: Portfolio projects > certificates
4. **Network**: Community engagement opens doors
5. **Keep learning**: The field evolves rapidly — stay curious

The best career advice: **build things, share what you learn, and help others**. The data science community rewards generosity and genuine curiosity.
