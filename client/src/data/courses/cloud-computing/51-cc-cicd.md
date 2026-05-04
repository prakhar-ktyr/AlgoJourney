---
title: "CI/CD Pipelines in the Cloud"
---

# CI/CD Pipelines in the Cloud

In this lesson, you will learn how **Continuous Integration and Continuous Delivery/Deployment (CI/CD)** pipelines automate the process of building, testing, and deploying software in the cloud.

CI/CD is the backbone of modern software delivery — it turns manual, error-prone releases into fast, reliable, and repeatable processes.

---

## What is CI/CD?

CI/CD is a set of practices that automate the stages of software delivery:

| Term | Full Name | What It Does |
|------|-----------|-------------|
| **CI** | Continuous Integration | Automatically build and test code every time a developer pushes changes |
| **CD** | Continuous Delivery | Automatically prepare releases so they *can* be deployed at any time |
| **CD** | Continuous Deployment | Automatically deploy every change that passes tests — no human approval needed |

### The Key Difference

```
Continuous Integration
  → Code is merged and tested automatically

Continuous Delivery
  → Code is ready to deploy (but a human clicks "Deploy")

Continuous Deployment
  → Code is deployed automatically (no human step)
```

> **Think of it like this:**
> CI = "Does my code work?"
> Continuous Delivery = "My code is packaged and ready to ship."
> Continuous Deployment = "My code is already shipped!"

---

## Why CI/CD Matters

Without CI/CD:

- Developers merge code once a week (or less)
- Bugs pile up and are hard to trace
- Deployments are stressful, manual, and error-prone
- Releases happen monthly or quarterly

With CI/CD:

- Code is merged and tested multiple times per day
- Bugs are caught immediately
- Deployments are boring (in a good way!)
- Releases can happen multiple times per day

| Metric | Without CI/CD | With CI/CD |
|--------|--------------|------------|
| Deploy frequency | Monthly | Multiple times/day |
| Lead time for changes | Weeks | Hours |
| Change failure rate | 30-60% | 0-15% |
| Recovery time | Days | Minutes |

---

## CI/CD Pipeline Stages

A CI/CD pipeline is a series of automated steps that code goes through from commit to production:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Source   │───▶│  Build   │───▶│   Test   │───▶│  Stage   │───▶│  Deploy  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
   Push           Compile        Unit tests      Pre-prod        Production
   Trigger        Package        Integration     Approval
                  Lint           E2E tests
```

### Stage 1: Source

The pipeline is triggered when code changes are pushed:

- A developer pushes to a Git branch
- A pull request is opened or updated
- A tag or release is created
- A scheduled trigger fires (e.g., nightly builds)

### Stage 2: Build

The code is compiled, bundled, or packaged:

```bash
# Example build steps
npm install           # Install dependencies
npm run build         # Compile/bundle the application
docker build -t myapp:latest .   # Build a container image
```

### Stage 3: Test

Automated tests verify the code works correctly:

| Test Type | Purpose | Speed |
|-----------|---------|-------|
| **Unit tests** | Test individual functions | Fast (seconds) |
| **Integration tests** | Test components working together | Medium (minutes) |
| **End-to-end tests** | Test the full user workflow | Slow (minutes-hours) |
| **Security scans** | Check for vulnerabilities | Medium |
| **Linting** | Check code style and quality | Fast |

### Stage 4: Stage (Pre-Production)

The application is deployed to a staging environment that mirrors production:

- Smoke tests verify the deployment works
- Manual or automated approval gates
- Performance testing under realistic load

### Stage 5: Deploy

The application is released to production:

- Deployment strategy is executed (rolling, blue-green, etc.)
- Health checks verify the deployment
- Monitoring alerts are active
- Rollback is ready if something goes wrong

---

## Cloud CI/CD Tools

### AWS CI/CD Services

AWS provides a full CI/CD toolchain:

| Service | Purpose |
|---------|---------|
| **CodeCommit** | Git repository hosting (deprecated — use GitHub) |
| **CodeBuild** | Build and test service |
| **CodeDeploy** | Deployment automation |
| **CodePipeline** | Orchestrates the full pipeline |
| **CodeArtifact** | Package/artifact repository |

```yaml
# AWS CodePipeline example (simplified)
pipeline:
  stages:
    - name: Source
      actions:
        - name: SourceAction
          provider: GitHub
          outputArtifacts: [SourceOutput]

    - name: Build
      actions:
        - name: BuildAction
          provider: CodeBuild
          inputArtifacts: [SourceOutput]
          outputArtifacts: [BuildOutput]

    - name: Deploy
      actions:
        - name: DeployAction
          provider: CodeDeploy
          inputArtifacts: [BuildOutput]
```

### Azure DevOps Pipelines

Azure provides a comprehensive DevOps platform:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: "ubuntu-latest"

stages:
  - stage: Build
    jobs:
      - job: BuildJob
        steps:
          - task: NodeTool@0
            inputs:
              versionSpec: "20.x"
          - script: npm install
          - script: npm run build
          - script: npm test

  - stage: Deploy
    dependsOn: Build
    jobs:
      - deployment: DeployWeb
        environment: "production"
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to production..."
```

### GCP Cloud Build

```yaml
# cloudbuild.yaml
steps:
  # Install dependencies
  - name: "node:20"
    entrypoint: "npm"
    args: ["install"]

  # Run tests
  - name: "node:20"
    entrypoint: "npm"
    args: ["test"]

  # Build Docker image
  - name: "gcr.io/cloud-builders/docker"
    args: ["build", "-t", "gcr.io/$PROJECT_ID/myapp:$COMMIT_SHA", "."]

  # Push to Container Registry
  - name: "gcr.io/cloud-builders/docker"
    args: ["push", "gcr.io/$PROJECT_ID/myapp:$COMMIT_SHA"]

  # Deploy to Cloud Run
  - name: "gcr.io/cloud-builders/gcloud"
    args:
      - "run"
      - "deploy"
      - "myapp"
      - "--image=gcr.io/$PROJECT_ID/myapp:$COMMIT_SHA"
      - "--region=us-central1"
```

---

## Third-Party CI/CD Tools

### GitHub Actions

GitHub Actions is one of the most popular CI/CD tools, built directly into GitHub:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        run: |
          echo "Deploying to production..."
          # Your deployment commands here
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test

deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - main
```

### Tool Comparison

| Feature | GitHub Actions | GitLab CI | Jenkins | CircleCI |
|---------|---------------|-----------|---------|----------|
| **Hosting** | Cloud (GitHub) | Cloud or self-hosted | Self-hosted | Cloud |
| **Config** | YAML | YAML | Groovy (Jenkinsfile) | YAML |
| **Free tier** | 2,000 min/month | 400 min/month | Free (self-hosted) | 6,000 min/month |
| **Marketplace** | 20,000+ actions | Templates | 1,800+ plugins | Orbs |
| **Container support** | Excellent | Excellent | Good (with plugins) | Excellent |
| **Learning curve** | Low | Low | High | Low |

---

## Pipeline as Code (YAML)

Modern CI/CD pipelines are defined in **code** (usually YAML files) that lives alongside your application:

### Benefits of Pipeline as Code

1. **Version controlled** — pipeline changes are tracked in Git
2. **Reviewable** — pipeline changes go through pull requests
3. **Reproducible** — anyone can see exactly what the pipeline does
4. **Portable** — the pipeline definition moves with the code
5. **Testable** — pipeline logic can be validated before merging

### YAML Pipeline Structure

```yaml
# Common structure across most CI/CD tools
name: My Pipeline           # Pipeline name

on:                          # Triggers
  push:
    branches: [main]

env:                         # Environment variables
  NODE_VERSION: "20"

jobs:                        # Jobs to run
  build:
    runs-on: ubuntu-latest   # Runner environment
    steps:                   # Steps within the job
      - name: Step name
        run: command
```

---

## Deployment Strategies

How you deploy new code to production matters a lot. Here are the most common strategies:

### 1. Rolling Deployment

Replace instances one at a time:

```
Time 1:  [v1] [v1] [v1] [v1]    ← All running v1
Time 2:  [v2] [v1] [v1] [v1]    ← First instance updated
Time 3:  [v2] [v2] [v1] [v1]    ← Second instance updated
Time 4:  [v2] [v2] [v2] [v1]    ← Third instance updated
Time 5:  [v2] [v2] [v2] [v2]    ← All running v2
```

**Pros:** No extra infrastructure, gradual rollout
**Cons:** Mixed versions during deployment, slow rollback

### 2. Blue-Green Deployment

Run two identical environments, switch traffic at once:

```
          ┌─────────────────┐
          │   Load Balancer  │
          └────────┬────────┘
                   │
         ┌─────────┴─────────┐
         ▼                    ▼
   ┌───────────┐       ┌───────────┐
   │  Blue     │       │  Green    │
   │  (v1)     │       │  (v2)     │
   │  ACTIVE   │       │  STANDBY  │
   └───────────┘       └───────────┘

After switch:
   ┌───────────┐       ┌───────────┐
   │  Blue     │       │  Green    │
   │  (v1)     │       │  (v2)     │
   │  STANDBY  │       │  ACTIVE   │
   └───────────┘       └───────────┘
```

**Pros:** Instant switch, instant rollback
**Cons:** Double the infrastructure cost

### 3. Canary Deployment

Send a small percentage of traffic to the new version first:

```
Step 1:  5% traffic  → v2,  95% traffic → v1
Step 2:  25% traffic → v2,  75% traffic → v1
Step 3:  50% traffic → v2,  50% traffic → v1
Step 4:  100% traffic → v2
```

**Pros:** Low risk, real user testing, gradual validation
**Cons:** More complex to set up, requires good monitoring

### 4. A/B Testing Deployment

Route specific users to specific versions:

```
Users in group A  →  Version 1 (control)
Users in group B  →  Version 2 (experiment)
```

**Pros:** Data-driven decisions, controlled experiments
**Cons:** Requires feature flagging infrastructure

### Strategy Comparison

| Strategy | Risk | Speed | Cost | Complexity |
|----------|------|-------|------|------------|
| Rolling | Medium | Slow | Low | Low |
| Blue-Green | Low | Fast | High | Medium |
| Canary | Low | Medium | Medium | High |
| A/B Testing | Low | Varies | Medium | High |

---

## Practical: Building a CI/CD Pipeline with GitHub Actions

Let's build a complete CI/CD pipeline for a Node.js application:

### Step 1: Create the Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Job 1: Lint and Test
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests with coverage
        run: npm test -- --coverage

      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  # Job 2: Build Docker Image
  build:
    name: Build Image
    needs: quality
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}

  # Job 3: Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # kubectl set image deployment/myapp \
          #   myapp=${{ needs.build.outputs.image-tag }}

  # Job 4: Deploy to Production
  deploy-production:
    name: Deploy to Production
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production     # Requires manual approval
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
```

### Step 2: Add Branch Protection

Configure your repository settings:

1. Go to **Settings → Branches → Branch protection rules**
2. Add a rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass (select your CI jobs)
   - Require branches to be up to date

### Step 3: Add Environment Protection

1. Go to **Settings → Environments**
2. Create `staging` and `production` environments
3. Add required reviewers for `production`
4. Add deployment branch restrictions

---

## Testing in Pipelines

Automated testing is the most critical part of any CI/CD pipeline:

### Test Pyramid in CI/CD

```
        ╱  E2E Tests  ╲          Slow, expensive, few
       ╱───────────────╲
      ╱ Integration Tests╲      Medium speed, moderate count
     ╱─────────────────────╲
    ╱     Unit Tests         ╲   Fast, cheap, many
   ╱───────────────────────────╲
```

### Running Tests in Parallel

```yaml
# GitHub Actions: Matrix strategy for parallel tests
jobs:
  test:
    strategy:
      matrix:
        test-group: [unit, integration, e2e]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:${{ matrix.test-group }}
```

---

## Artifact Management

**Artifacts** are the outputs of your build process — compiled code, Docker images, packages:

| Artifact Type | Storage | Example |
|--------------|---------|---------|
| Docker images | Container registry | Docker Hub, ECR, GCR, GHCR |
| npm packages | npm registry | npmjs.com, GitHub Packages |
| Build outputs | Object storage | S3, Azure Blob, GCS |
| Test reports | CI/CD artifacts | GitHub Actions artifacts |

```yaml
# Upload and download artifacts in GitHub Actions
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7

# In a later job:
- name: Download build artifact
  uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

---

## Security in CI/CD

CI/CD pipelines are a high-value target for attackers. Follow these best practices:

### 1. Secrets Management

```yaml
# NEVER hard-code secrets — use encrypted secrets
# ❌ Bad
env:
  API_KEY: "sk-abc123secret"

# ✅ Good
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### 2. Dependency Scanning

```yaml
# Add security scanning to your pipeline
- name: Run security audit
  run: npm audit --audit-level=high

- name: Scan for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: "fs"
    severity: "HIGH,CRITICAL"
```

### 3. Least Privilege

- Give CI/CD service accounts only the permissions they need
- Use short-lived credentials (OIDC tokens instead of long-lived keys)
- Rotate secrets regularly

### 4. Pipeline Security Checklist

| Practice | Why |
|----------|-----|
| Pin action versions | Prevent supply chain attacks |
| Use `npm ci` not `npm install` | Ensures reproducible installs |
| Scan dependencies | Catch known vulnerabilities |
| Sign artifacts | Verify artifact integrity |
| Audit pipeline access | Limit who can modify pipelines |
| Review third-party actions | Avoid malicious code |

---

## Key Takeaways

| Concept | Summary |
|---------|---------|
| **CI** | Automatically build and test on every push |
| **Continuous Delivery** | Always ready to deploy (manual trigger) |
| **Continuous Deployment** | Automatically deploy every passing change |
| **Pipeline as Code** | Define pipelines in YAML, version-controlled |
| **Blue-Green** | Two environments, instant switch |
| **Canary** | Gradual traffic shift to new version |
| **Artifact management** | Store and version build outputs |
| **Security** | Never hard-code secrets, scan dependencies |

---

## Exercises

1. **Create a basic CI pipeline** using GitHub Actions that runs linting and tests on every pull request for a Node.js project.

2. **Add a deployment stage** that deploys to a staging environment when code is merged to `main`.

3. **Implement a canary deployment** strategy — how would you configure traffic splitting using your cloud provider's load balancer?

4. **Set up security scanning** in your pipeline: add `npm audit`, a container image scan, and secret detection.

5. **Design a multi-environment pipeline** with `dev`, `staging`, and `production` stages. Include manual approval for production deployment.

---

## Further Reading

- GitHub Actions Documentation — workflows, actions marketplace, and best practices
- AWS CodePipeline User Guide — building pipelines on AWS
- Azure DevOps Pipelines Documentation — multi-stage YAML pipelines
- The DevOps Handbook — principles and practices of CI/CD
- DORA Metrics — measuring software delivery performance

---
