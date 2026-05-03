---
title: Writing Effective Test Cases
---

# Writing Effective Test Cases

Test cases are the fundamental unit of testing. A well-written test case is clear, repeatable, and verifiable. Poor test cases waste time, miss defects, and create confusion. This lesson covers the anatomy of effective test cases and systematic techniques for designing them.

---

## Anatomy of a Test Case

Every test case should contain these essential elements:

| Field | Description | Example |
|-------|-------------|---------|
| **Test Case ID** | Unique identifier for tracking | TC-LOGIN-001 |
| **Title** | Brief, descriptive summary | Verify successful login with valid credentials |
| **Module/Feature** | Area being tested | Authentication |
| **Priority** | Importance level | High / Medium / Low |
| **Preconditions** | State required before execution | User account exists, browser is open |
| **Test Data** | Specific inputs needed | Username: testuser, Password: Test@123 |
| **Steps** | Sequential actions to perform | See below |
| **Expected Result** | What should happen | User redirected to dashboard |
| **Actual Result** | What actually happened (filled during execution) | — |
| **Status** | Pass / Fail / Blocked / Skipped | — |
| **Postconditions** | System state after execution | User session is active |

### Step Format

Each step should be:
- **Atomic** — one action per step
- **Actionable** — starts with a verb
- **Observable** — result can be verified

Example steps:

```
Step 1: Navigate to https://app.example.com/login
Step 2: Enter "testuser" in the Username field
Step 3: Enter "Test@123" in the Password field
Step 4: Click the "Sign In" button
Expected: User is redirected to the dashboard page.
          Welcome message displays "Hello, testuser".
          Session cookie is set in browser.
```

---

## Good vs Bad Test Cases

### Bad Test Case Example

```
ID: TC-001
Title: Test login
Steps: Login to the system
Expected: It should work
```

**Problems:**
- Vague title — "test login" tells nothing specific
- No preconditions — what state is the system in?
- Steps are not detailed — "login to the system" is ambiguous
- No test data — what credentials to use?
- "It should work" — unmeasurable, subjective

### Good Test Case Example

```
ID: TC-LOGIN-001
Title: Verify successful login with valid registered email and password
Priority: High
Preconditions:
  - User with email "qa.tester@example.com" exists in the system
  - User account is active (not locked or suspended)
  - User is not currently logged in
  - Application login page is accessible

Test Data:
  - Email: qa.tester@example.com
  - Password: SecurePass#2024

Steps:
  1. Open browser and navigate to the login page
  2. Verify the login form is displayed with Email and Password fields
  3. Enter "qa.tester@example.com" in the Email field
  4. Enter "SecurePass#2024" in the Password field
  5. Click the "Log In" button

Expected Result:
  - Page redirects to /dashboard within 3 seconds
  - Welcome banner displays "Welcome back, QA Tester"
  - Navigation menu shows user avatar and name
  - Browser stores authentication token in cookies

Postconditions:
  - User session is active
  - Last login timestamp is updated in user profile
```

### Comparison Summary

| Characteristic | Bad Test Case | Good Test Case |
|---------------|---------------|----------------|
| Specific | No | Yes |
| Repeatable | No (ambiguous steps) | Yes (exact data and steps) |
| Measurable | No ("should work") | Yes (specific verifications) |
| Independent | Unknown | Yes (states preconditions) |
| Traceable | No | Yes (linked to requirement) |

---

## Types of Test Cases

### Positive Test Cases

Verify the system works correctly with valid inputs:

```
TC-REG-001: Register with all valid fields
Preconditions: Registration page is displayed
Steps:
  1. Enter "John" in First Name
  2. Enter "Doe" in Last Name
  3. Enter "john.doe@email.com" in Email
  4. Enter "Str0ngP@ss!" in Password
  5. Enter "Str0ngP@ss!" in Confirm Password
  6. Check "I agree to terms" checkbox
  7. Click "Register"
Expected: Account created, confirmation email sent, redirect to welcome page
```

### Negative Test Cases

Verify the system handles invalid inputs gracefully:

```
TC-REG-010: Register with already existing email
Preconditions: User "john.doe@email.com" already exists
Steps:
  1. Fill all fields with valid data
  2. Enter "john.doe@email.com" in Email field
  3. Click "Register"
Expected: Error message "An account with this email already exists"
          displayed below the email field. No account created.
          Existing account is not modified.
```

```
TC-REG-011: Register with empty required fields
Preconditions: Registration page is displayed
Steps:
  1. Leave all fields empty
  2. Click "Register"
Expected: Validation errors displayed for each required field:
          - "First name is required"
          - "Last name is required"
          - "Email is required"
          - "Password is required"
          Form is not submitted.
```

### Boundary Test Cases

Test at the edges of valid input ranges:

```
TC-PWD-001: Password with exactly minimum length (8 characters)
Steps:
  1. Enter password "Abcd@12" (7 chars) → Expected: "Password too short" error
  2. Enter password "Abcd@123" (8 chars) → Expected: Accepted
  3. Enter password "Abcd@1234" (9 chars) → Expected: Accepted
```

---

## Equivalence Class Partitioning

Equivalence class partitioning (ECP) divides input data into groups (partitions) where all values in a partition are expected to be treated the same way. You test one representative value from each partition.

### Principle

If the system behaves the same for all values in a range, testing one value from that range is sufficient.

### Worked Example 1: Age Field

**Requirement:** A form accepts age between 18 and 65 (inclusive).

**Equivalence Classes:**

| Class | Range | Type | Representative Value |
|-------|-------|------|---------------------|
| EC1 | age < 18 | Invalid | 10 |
| EC2 | 18 ≤ age ≤ 65 | Valid | 35 |
| EC3 | age > 65 | Invalid | 70 |
| EC4 | Non-numeric | Invalid | "abc" |
| EC5 | Empty/null | Invalid | "" |
| EC6 | Negative number | Invalid | -5 |
| EC7 | Decimal number | Invalid | 25.5 |

**Test Cases:**

```
TC-AGE-001: Enter age 10 → Expected: "Must be 18 or older" error
TC-AGE-002: Enter age 35 → Expected: Accepted
TC-AGE-003: Enter age 70 → Expected: "Must be 65 or younger" error
TC-AGE-004: Enter "abc" → Expected: "Please enter a valid number" error
TC-AGE-005: Leave empty → Expected: "Age is required" error
TC-AGE-006: Enter -5 → Expected: "Please enter a valid age" error
TC-AGE-007: Enter 25.5 → Expected: "Please enter a whole number" error
```

### Worked Example 2: Discount Calculation

**Requirement:** Order discount based on quantity:
- 1–9 items: no discount
- 10–49 items: 10% discount
- 50–99 items: 20% discount
- 100+ items: 30% discount

**Equivalence Classes:**

| Class | Range | Expected Discount | Representative |
|-------|-------|------------------|----------------|
| EC1 | qty < 1 | Invalid/error | 0 |
| EC2 | 1–9 | 0% | 5 |
| EC3 | 10–49 | 10% | 25 |
| EC4 | 50–99 | 20% | 75 |
| EC5 | 100+ | 30% | 150 |

**Test Cases:**

```
TC-DISC-001: Order 0 items → Expected: Error "Quantity must be at least 1"
TC-DISC-002: Order 5 items at $10 each → Expected: Total = $50 (no discount)
TC-DISC-003: Order 25 items at $10 each → Expected: Total = $225 (10% off)
TC-DISC-004: Order 75 items at $10 each → Expected: Total = $600 (20% off)
TC-DISC-005: Order 150 items at $10 each → Expected: Total = $1050 (30% off)
```

---

## Boundary Value Analysis

Boundary Value Analysis (BVA) focuses on testing at the exact boundaries of equivalence classes, where defects are most likely to occur.

### Principle

Errors tend to cluster at boundaries. Test the boundary value itself, one below, and one above.

### Worked Example 1: Age Field (18–65)

**Boundaries and test values:**

| Boundary | Value Below | Boundary Value | Value Above |
|----------|------------|----------------|-------------|
| Lower (18) | 17 | 18 | 19 |
| Upper (65) | 64 | 65 | 66 |

**Test Cases:**

```
TC-BVA-AGE-001: Enter age 17 → Expected: Rejected ("Must be 18 or older")
TC-BVA-AGE-002: Enter age 18 → Expected: Accepted (minimum valid)
TC-BVA-AGE-003: Enter age 19 → Expected: Accepted
TC-BVA-AGE-004: Enter age 64 → Expected: Accepted
TC-BVA-AGE-005: Enter age 65 → Expected: Accepted (maximum valid)
TC-BVA-AGE-006: Enter age 66 → Expected: Rejected ("Must be 65 or younger")
```

### Worked Example 2: Password Length (8–20 characters)

**Requirement:** Password must be 8–20 characters long.

**Test Cases:**

```
TC-BVA-PWD-001: 7-char password "Abc@12x" → Expected: "Too short" error
TC-BVA-PWD-002: 8-char password "Abc@12xy" → Expected: Accepted
TC-BVA-PWD-003: 9-char password "Abc@12xyz" → Expected: Accepted
TC-BVA-PWD-004: 19-char password → Expected: Accepted
TC-BVA-PWD-005: 20-char password → Expected: Accepted
TC-BVA-PWD-006: 21-char password → Expected: "Too long" error
```

### Worked Example 3: File Upload Size (max 5 MB)

```
TC-BVA-FILE-001: Upload 4.99 MB file → Expected: Upload succeeds
TC-BVA-FILE-002: Upload 5.00 MB file → Expected: Upload succeeds
TC-BVA-FILE-003: Upload 5.01 MB file → Expected: "File exceeds 5 MB limit" error
TC-BVA-FILE-004: Upload 0 byte file → Expected: "File is empty" error
TC-BVA-FILE-005: Upload 1 byte file → Expected: Upload succeeds
```

---

## Decision Tables

Decision tables capture complex business rules with multiple conditions and their combinations.

### Structure

| Conditions / Rules | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|-------------------|--------|--------|--------|--------|
| Condition 1 | T | T | F | F |
| Condition 2 | T | F | T | F |
| **Actions** | | | | |
| Action 1 | X | | X | |
| Action 2 | | X | | X |

### Worked Example: Loan Approval

**Conditions:**
- C1: Credit score ≥ 700
- C2: Income ≥ $50,000
- C3: Debt-to-income ratio < 40%

**Decision Table:**

| Conditions | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|-----------|----|----|----|----|----|----|----|----|
| C1: Credit ≥ 700 | Y | Y | Y | Y | N | N | N | N |
| C2: Income ≥ $50K | Y | Y | N | N | Y | Y | N | N |
| C3: DTI < 40% | Y | N | Y | N | Y | N | Y | N |
| **Actions** | | | | | | | | |
| Approve loan | ✓ | | | | | | | |
| Approve with conditions | | ✓ | ✓ | | ✓ | | | |
| Deny loan | | | | ✓ | | ✓ | ✓ | ✓ |

**Derived Test Cases:**

```
TC-LOAN-001 (R1): Score=750, Income=$60K, DTI=30% → Approved
TC-LOAN-002 (R2): Score=720, Income=$55K, DTI=45% → Approved with conditions
TC-LOAN-003 (R3): Score=710, Income=$40K, DTI=35% → Approved with conditions
TC-LOAN-004 (R4): Score=750, Income=$40K, DTI=45% → Denied
TC-LOAN-005 (R5): Score=650, Income=$60K, DTI=35% → Approved with conditions
TC-LOAN-006 (R6): Score=600, Income=$55K, DTI=50% → Denied
TC-LOAN-007 (R7): Score=680, Income=$35K, DTI=30% → Denied
TC-LOAN-008 (R8): Score=580, Income=$30K, DTI=55% → Denied
```

---

## State Transition Testing

State transition testing models the system as a finite state machine and tests transitions between states.

### Components

- **States** — distinct conditions the system can be in
- **Events** — triggers that cause state changes
- **Transitions** — movement from one state to another
- **Actions** — outputs produced during transitions
- **Guards** — conditions that must be true for a transition

### Worked Example: User Account States

**States:** Inactive, Active, Locked, Suspended, Closed

**State Transition Table:**

| Current State | Event | Guard | Next State | Action |
|--------------|-------|-------|------------|--------|
| Inactive | Verify email | — | Active | Send welcome email |
| Active | Login (valid) | attempts < 3 | Active | Reset attempt counter |
| Active | Login (invalid) | attempts < 3 | Active | Increment counter |
| Active | Login (invalid) | attempts = 3 | Locked | Send lock notification |
| Locked | Wait 30 min | — | Active | Reset attempt counter |
| Locked | Admin unlock | — | Active | Reset attempt counter |
| Active | Admin suspend | — | Suspended | Send suspension notice |
| Suspended | Admin reactivate | — | Active | Send reactivation notice |
| Active | User delete | — | Closed | Send confirmation |
| Closed | — | — | — | No transitions out |

**Derived Test Cases:**

```
TC-STATE-001: New user verifies email → State changes from Inactive to Active
TC-STATE-002: Active user enters wrong password 3 times → State changes to Locked
TC-STATE-003: Locked account after 30 minutes → State changes to Active
TC-STATE-004: Admin suspends active account → State changes to Suspended
TC-STATE-005: Admin reactivates suspended account → State changes to Active
TC-STATE-006: User deletes active account → State changes to Closed
TC-STATE-007: Attempt to login with closed account → Error "Account not found"

Invalid Transitions (should not be possible):
TC-STATE-008: Attempt to suspend an already locked account → No state change
TC-STATE-009: Attempt to reactivate a closed account → Error
TC-STATE-010: Attempt to delete a locked account → Should unlock first or error
```

### State Transition Diagram Notation

```
[Inactive] --verify email--> [Active]
[Active] --3 failed logins--> [Locked]
[Locked] --30 min timeout--> [Active]
[Locked] --admin unlock--> [Active]
[Active] --admin suspend--> [Suspended]
[Suspended] --admin reactivate--> [Active]
[Active] --user delete--> [Closed]
```

---

## Test Case Design from Requirements

Systematic process for deriving test cases from requirements:

### Step-by-Step Process

1. **Read and understand the requirement**
2. **Identify testable conditions** (what can be verified?)
3. **Choose appropriate technique** (ECP, BVA, decision table, state transition)
4. **Design test cases** (positive, negative, boundary)
5. **Review for completeness** (are all conditions covered?)

### Worked Example

**Requirement:** "The system shall allow users to transfer funds between their own accounts. The minimum transfer amount is $1.00 and the maximum is $10,000.00 per transaction. The source account must have sufficient balance. Transfers are processed immediately during business hours (9 AM – 5 PM) and queued for next business day otherwise."

**Identified Testable Conditions:**

1. Transfer between own accounts (valid source and destination)
2. Amount range: $1.00 – $10,000.00
3. Sufficient balance check
4. Timing: business hours vs off-hours

**Derived Test Cases:**

```
Positive Cases:
TC-TXF-001: Transfer $500 between own accounts during business hours
            → Processed immediately, balances updated
TC-TXF-002: Transfer $1.00 (minimum) → Accepted
TC-TXF-003: Transfer $10,000.00 (maximum) → Accepted
TC-TXF-004: Transfer at 5:00 PM (boundary of business hours) → Processed immediately
TC-TXF-005: Transfer at 5:01 PM → Queued for next business day

Negative Cases:
TC-TXF-006: Transfer $0.99 (below minimum) → Error "Minimum transfer is $1.00"
TC-TXF-007: Transfer $10,000.01 (above maximum) → Error "Maximum transfer is $10,000"
TC-TXF-008: Transfer exceeding source balance → Error "Insufficient funds"
TC-TXF-009: Transfer to another user's account → Error "Can only transfer between own accounts"
TC-TXF-010: Transfer $0.00 → Error "Amount must be greater than zero"
TC-TXF-011: Transfer negative amount → Error / validation failure

Boundary Cases:
TC-TXF-012: Transfer exactly equal to source balance → Accepted, balance = $0
TC-TXF-013: Transfer $0.01 more than balance → Rejected
TC-TXF-014: Transfer at 8:59 AM → Queued
TC-TXF-015: Transfer at 9:00 AM → Processed immediately
```

---

## Test Case Writing Best Practices

### Do

- Write one test case per scenario — don't combine multiple verifications
- Use consistent naming conventions (TC-MODULE-NNN)
- Make preconditions explicit — don't assume system state
- Include both expected results AND postconditions
- Write steps that anyone can follow without domain knowledge
- Specify exact test data — no "enter a valid email"
- Version control your test cases
- Link test cases to requirements for traceability

### Don't

- Don't write implementation-dependent steps ("click the blue button at coordinates 200,300")
- Don't assume sequence — each test case should be independent
- Don't write vague expected results ("system works correctly")
- Don't skip negative cases — they often find more bugs
- Don't duplicate test cases — if covered elsewhere, reference it
- Don't mix manual steps with automation code in the same document

---

## Key Takeaways

1. **Structure matters** — consistent format makes test cases reusable and reviewable
2. **Specificity prevents ambiguity** — exact data, exact steps, exact expectations
3. **Systematic techniques find more bugs** — ECP, BVA, and decision tables are more effective than ad-hoc testing
4. **Test the boundaries** — most defects hide at edges of valid ranges
5. **Cover negative paths** — users will do unexpected things
6. **State transitions reveal hidden bugs** — especially in invalid transition handling
7. **Derive from requirements** — ensures coverage and traceability

---

## Summary

Effective test cases are the backbone of quality assurance. By applying systematic design techniques — equivalence partitioning, boundary value analysis, decision tables, and state transition testing — you can achieve thorough coverage while keeping the test suite manageable. Well-written test cases are assets that retain value across releases, enabling efficient regression testing and knowledge transfer.
