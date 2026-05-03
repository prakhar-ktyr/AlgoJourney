---
title: Bug Reporting & Tracking
---

# Bug Reporting & Tracking

Finding a bug is only half the battle. If a defect is poorly reported, it may never get fixed — developers can't reproduce it, managers can't prioritize it, and it gets lost in the backlog. Effective bug reporting is a critical skill that separates professional testers from amateurs.

---

## What Makes a Good Bug Report

A good bug report answers five questions:

1. **What happened?** — Clear description of the observed behavior
2. **What should have happened?** — Expected behavior based on requirements
3. **How do I reproduce it?** — Step-by-step instructions anyone can follow
4. **Where did it happen?** — Environment, version, configuration
5. **How bad is it?** — Severity and impact assessment

### Characteristics of an Effective Bug Report

| Characteristic | Description |
|---------------|-------------|
| **Reproducible** | Steps consistently produce the defect |
| **Specific** | Describes one issue, not multiple problems |
| **Complete** | Includes all necessary information to investigate |
| **Concise** | No unnecessary words or irrelevant details |
| **Neutral** | States facts without blame or emotion |
| **Verifiable** | Clear criteria for confirming the fix |

### The Golden Rule

Write bug reports as if the reader has never seen the application. They should be able to reproduce the issue with zero additional context.

---

## Bug Report Fields

### Essential Fields

**1. Bug ID**
- Auto-generated unique identifier
- Used for tracking and cross-referencing
- Example: BUG-2024-0142

**2. Summary / Title**
- One-line description capturing the essence of the bug
- Format: [Feature/Module] — [What's wrong] — [Condition]

Good titles:
```
Login — "Remember Me" checkbox has no effect after browser restart
Cart — Total price shows negative when 100% discount applied
Search — Application crashes when searching with special characters (%, &, #)
Payment — Credit card form accepts expired dates without validation
```

Bad titles:
```
Bug in login (too vague)
It doesn't work (meaningless)
Error!!! (no information)
The thing on the page is broken (which thing? which page?)
```

**3. Steps to Reproduce**
- Numbered, sequential steps
- Start from a known state
- Include exact data used
- One action per step

```
Steps to Reproduce:
1. Log in as user "test.buyer@example.com" (password: TestPass#1)
2. Navigate to Products → Electronics → Laptops
3. Add "ThinkPad X1 Carbon" to cart (quantity: 1)
4. Go to Shopping Cart page
5. Apply promo code "DISCOUNT100" (100% off coupon)
6. Observe the "Order Total" field

Result: Order Total displays "-$12.50" (negative value)
```

**4. Expected Result**
- What the system should do according to requirements
- Be specific and measurable

```
Expected Result:
Order Total should display "$0.00" when a 100% discount
is applied. Shipping cost ($12.50) should also be waived
per promo code terms, OR displayed separately as a
remaining charge.
```

**5. Actual Result**
- What the system actually does
- Include exact error messages, screenshots, logs

```
Actual Result:
Order Total displays "-$12.50". The discount is applied
to the subtotal ($0.00) but shipping ($12.50) is then
subtracted, resulting in a negative total. The "Place Order"
button remains active, allowing checkout with negative amount.
```

**6. Severity**
- Technical impact of the defect (see severity levels below)

**7. Priority**
- Business urgency for fixing (set by product/project manager)
- Critical / High / Medium / Low

**8. Environment**
```
Environment:
- OS: macOS 14.2 (Sonoma)
- Browser: Chrome 120.0.6099.129 (64-bit)
- App Version: v2.4.1 (build 20240115)
- Server: Production (api.example.com)
- Screen Resolution: 1920×1080
- Network: Wi-Fi, stable connection
```

### Additional Useful Fields

| Field | Purpose |
|-------|---------|
| **Assignee** | Developer responsible for fixing |
| **Reporter** | Person who found the bug |
| **Component/Module** | Affected area of the application |
| **Version Found** | Version where bug was discovered |
| **Version Fixed** | Version where bug was resolved |
| **Attachments** | Screenshots, videos, logs |
| **Related Issues** | Linked bugs or stories |
| **Workaround** | Temporary solution if one exists |
| **Regression** | Was this working before? Which version? |

---

## Severity Levels

Severity measures the technical impact of the defect on the system.

### Critical (S1) — System Down

The defect causes complete system failure or data loss.

**Characteristics:**
- Application crashes or becomes completely unusable
- Data corruption or loss occurs
- Security breach is possible
- No workaround exists

**Examples:**
- Application crashes on startup for all users
- Payment processing charges wrong amounts to credit cards
- User passwords are exposed in API responses
- Database data is corrupted after a specific operation
- Login page returns 500 error for all users

### Major (S2) — Major Feature Broken

A primary feature doesn't work, but the system remains operational.

**Characteristics:**
- Core functionality is broken
- Significant business impact
- Workaround may exist but is difficult

**Examples:**
- Search returns no results for valid queries
- Users cannot complete the checkout process
- Report exports contain incorrect calculations
- Email notifications are not being sent
- User registration fails for Gmail addresses

### Minor (S3) — Minor Feature Broken

A feature doesn't work correctly, but the impact is limited.

**Characteristics:**
- Secondary functionality affected
- Low business impact
- Easy workaround exists

**Examples:**
- Sort order on a list page doesn't persist after navigation
- Profile picture upload fails for PNG files (JPEG works)
- Date picker shows wrong initial month
- Pagination shows wrong total count (all items still accessible)
- Filter options don't reset when navigating away

### Trivial (S4) — Cosmetic

The defect has no functional impact but affects appearance or usability.

**Characteristics:**
- Visual or cosmetic issue only
- No impact on functionality
- May affect user experience slightly

**Examples:**
- Typo in an error message: "Feild is required"
- Misaligned button on the settings page
- Inconsistent font size in table headers
- Wrong shade of brand color on footer
- Extra spacing between navigation items

### Severity vs Priority Matrix

| | High Priority | Low Priority |
|---|---|---|
| **High Severity** | Fix immediately (crash on login) | Schedule for next sprint (crash in admin panel rarely used) |
| **Low Severity** | Fix soon (typo on landing page seen by millions) | Fix when convenient (typo in internal admin tool) |

Key insight: A typo on a landing page (low severity) may be higher priority than a crash in an obscure admin feature (high severity) because of business visibility.

---

## Bug Lifecycle

A bug moves through defined states from discovery to resolution:

### Standard Bug Lifecycle

```
NEW → ASSIGNED → OPEN → FIXED → VERIFIED → CLOSED
         ↓                           ↓
      REJECTED                   REOPENED → ASSIGNED
         ↓
      DEFERRED
```

### State Descriptions

| State | Description | Who Acts |
|-------|-------------|----------|
| **New** | Bug is reported, awaiting triage | Tester reports |
| **Assigned** | Bug is assigned to a developer | Lead/Manager assigns |
| **Open** | Developer acknowledges and begins investigation | Developer |
| **Fixed** | Developer has implemented a fix | Developer |
| **Verified** | Tester confirms the fix resolves the issue | Tester |
| **Closed** | Bug is resolved and verified | Tester/Lead closes |
| **Reopened** | Fix didn't work or issue recurred | Tester reopens |
| **Rejected** | Not a bug (by design, cannot reproduce, duplicate) | Developer/Lead |
| **Deferred** | Valid bug but won't fix in current release | Manager defers |

### Transition Rules

**New → Assigned:**
- Triage confirms it's a valid bug
- Appropriate developer/team is identified
- Priority is set based on severity and business needs

**Assigned → Open:**
- Developer acknowledges receipt
- Developer can reproduce the issue
- Developer begins investigation

**Open → Fixed:**
- Code change is implemented
- Fix is code-reviewed
- Fix is deployed to test environment
- Developer updates bug with fix details (commit reference, build number)

**Fixed → Verified:**
- Tester retests using original steps
- Tester confirms expected behavior
- Tester checks for regression (related features still work)
- Tester updates actual result

**Verified → Closed:**
- Formal closure after verification
- No further action needed
- Bug becomes part of historical record

**Fixed → Reopened:**
- Original issue still occurs after fix
- Fix introduced a new related issue
- Issue recurs under different conditions

**New/Assigned → Rejected:**
- Cannot reproduce (with details of attempts)
- Working as designed (with reference to requirement)
- Duplicate of existing bug (reference the original)
- Out of scope for current system

**Assigned → Deferred:**
- Low priority relative to current release goals
- Requires architectural change planned for later
- Workaround is acceptable for now
- Resource constraints prevent immediate fix

---

## Bug Tracking Tools

### Jira

The most widely used project management and bug tracking tool.

**Strengths:**
- Highly customizable workflows
- Powerful querying with JQL (Jira Query Language)
- Integration with development tools (Bitbucket, GitHub, CI/CD)
- Agile boards (Scrum and Kanban)
- Rich ecosystem of plugins
- Detailed reporting and dashboards

**Bug report in Jira typically includes:**
- Issue type: Bug
- Summary, Description (with steps)
- Priority, Severity (custom field)
- Components, Labels
- Affects Version, Fix Version
- Assignee, Reporter
- Attachments, Links
- Sprint assignment

**Example JQL queries:**
```
project = "MYAPP" AND issuetype = Bug AND status != Closed
priority = Critical AND created >= -7d
reporter = currentUser() AND status = Reopened
component = "Payment" AND severity = "S1"
```

### GitHub Issues

Lightweight, developer-friendly issue tracking integrated with source code.

**Strengths:**
- Tight integration with pull requests and commits
- Markdown-based descriptions
- Labels for categorization
- Milestones for release planning
- Templates for consistent reporting
- Free for public repositories

**Best for:**
- Open-source projects
- Small to medium teams
- Developer-centric workflows
- Projects already on GitHub

**GitHub Issue Template example:**
```markdown
## Bug Report

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS 14]
- Browser: [e.g., Chrome 120]
- Version: [e.g., v2.4.1]

**Additional context**
Any other information.
```

### Bugzilla

Open-source bug tracking system, historically popular in large organizations.

**Strengths:**
- Mature, battle-tested (used by Mozilla, Linux kernel)
- Advanced search and reporting
- Fine-grained access control
- Email integration
- Custom fields and workflows
- Free and self-hosted

**Best for:**
- Organizations wanting full control of data
- Large-scale projects with complex workflows
- Teams preferring self-hosted solutions

### Tool Comparison

| Feature | Jira | GitHub Issues | Bugzilla |
|---------|------|---------------|----------|
| Cost | Paid ($7.75+/user/mo) | Free (public) / Paid (private) | Free (self-hosted) |
| Learning Curve | Steep | Low | Medium |
| Customization | Extensive | Limited (labels, templates) | Moderate |
| Developer Integration | Excellent | Native | Good |
| Reporting | Advanced | Basic (needs extensions) | Good |
| Scalability | Enterprise | Small-Medium | Large |
| Agile Support | Native | Basic (Projects) | Plugin-based |

---

## Tips for Reproducible Bug Reports

### 1. Isolate the Issue

Before reporting, determine:
- Does it happen every time or intermittently?
- Does it happen on all browsers/devices or specific ones?
- Does it happen for all users or specific accounts?
- Does it happen with all data or specific inputs?

### 2. Find the Minimal Reproduction Path

Reduce steps to the absolute minimum needed:

```
Bad: "I was browsing the site for about 20 minutes,
added several items to cart, removed some, changed
quantities, applied a coupon, and then the total was wrong."

Good: "1. Add item X to cart
       2. Apply coupon 'SAVE20'
       3. Change quantity from 1 to 2
       → Total doesn't recalculate with coupon"
```

### 3. Include Environment Details

Capture at time of bug discovery:
- Browser version and OS (use browser's "About" page)
- Application version or build number
- Network conditions (Wi-Fi, mobile, VPN)
- User account type/permissions
- Time of occurrence (for intermittent issues)
- Screen resolution and zoom level

### 4. Attach Evidence

Types of supporting evidence:
- **Screenshots** — annotated with arrows/highlights
- **Screen recordings** — for complex interaction bugs
- **Console logs** — browser developer tools output
- **Network logs** — HAR files for API issues
- **Server logs** — if accessible
- **Test data** — specific files or inputs that trigger the bug

### 5. Note Workarounds

If you found a way to avoid the bug, document it:
```
Workaround: Refreshing the page after applying the coupon
causes the total to recalculate correctly. Issue only occurs
when changing quantity AFTER applying coupon.
```

### 6. Check for Duplicates

Before submitting:
- Search existing bugs by keywords
- Check recently reported bugs
- Look for related/similar issues
- If duplicate, add your details to the existing bug

### 7. One Bug Per Report

```
Bad: "The login page has a typo, the forgot password
link is broken, and the page loads slowly."

Good: Submit three separate reports:
- BUG-001: Login page typo — "Pasword" should be "Password"
- BUG-002: Forgot password link returns 404 error
- BUG-003: Login page takes 8+ seconds to load (SLA: 2 seconds)
```

---

## Sample Bug Reports

### Good Bug Report

```
Bug ID: BUG-2024-0287
Summary: Cart — Item quantity resets to 1 after applying promo code

Severity: Major (S2)
Priority: High
Component: Shopping Cart
Version Found: v3.2.0 (build 20240301)
Reporter: Sarah Chen
Date: March 5, 2024

Description:
When a user updates item quantity in the shopping cart and then
applies a promotional code, all item quantities reset to 1.
The cart total recalculates based on quantity of 1 for each item,
resulting in undercharging if the user doesn't notice and proceeds
to checkout.

Steps to Reproduce:
1. Log in as any registered user
2. Add "Wireless Mouse" (SKU: WM-2024) to cart
3. On the cart page, change quantity from 1 to 3
4. Verify subtotal updates to $89.97 (3 × $29.99)
5. Enter promo code "SPRING10" in the promotional code field
6. Click "Apply Code"

Expected Result:
- 10% discount is applied to the current subtotal ($89.97)
- Quantity remains 3
- New total: $80.97 ($89.97 - $9.00 discount)

Actual Result:
- Quantity resets to 1 for all items
- Subtotal shows $29.99 (1 × $29.99)
- Discount applied to $29.99: total shows $26.99
- User loses items from cart without notification

Environment:
- OS: Windows 11 Pro (23H2)
- Browser: Firefox 123.0 (64-bit)
- Also reproduced on Chrome 122.0 and Safari 17.3
- Network: Corporate LAN
- User account: Premium tier

Frequency: 100% reproducible

Workaround:
User can re-enter the correct quantities after applying the promo
code. The quantities are accepted and total recalculates correctly.

Attachments:
- screenshot_before_code.png — showing quantity = 3
- screenshot_after_code.png — showing quantity reset to 1
- cart_network_log.har — API calls during the operation

Notes:
- This appears to be a regression. Worked correctly in v3.1.0.
- Same issue occurs regardless of promo code used.
- Does NOT occur if promo code is applied before changing quantity.
```

### Bad Bug Report

```
Bug ID: BUG-2024-0288
Summary: Cart is broken

Severity: Not set
Priority: Not set
Component: Not set
Reporter: Anonymous
Date: March 5, 2024

Description:
The shopping cart doesn't work right. When I add stuff and
try to use a coupon it messes up. Please fix ASAP!!!

Steps to Reproduce:
1. Use the cart
2. It breaks

Expected Result:
Should work normally

Actual Result:
Doesn't work

Environment:
Some browser on my computer

Attachments: None
```

### What's Wrong with the Bad Report

| Issue | Problem | Impact |
|-------|---------|--------|
| Vague title | "Cart is broken" — which aspect? | Can't prioritize or assign |
| No severity/priority | Not assessed | Can't triage properly |
| Emotional language | "Please fix ASAP!!!" | Not professional or helpful |
| No real steps | "Use the cart" is not reproducible | Developer can't reproduce |
| Vague expected result | "Should work normally" | No verification criteria |
| No environment info | "Some browser" | Can't determine if browser-specific |
| No attachments | Nothing to help investigation | Developer starts from zero |
| Multiple issues combined | "Messes up" could be many things | Unclear scope |

---

## Bug Report Writing Checklist

Before submitting a bug report, verify:

- [ ] Title clearly describes the specific issue
- [ ] Steps start from a known state (preconditions)
- [ ] Each step contains exactly one action
- [ ] Test data is explicitly specified
- [ ] Expected result cites a requirement or specification
- [ ] Actual result describes precisely what happened
- [ ] Severity is assessed honestly (not inflated)
- [ ] Environment details are complete
- [ ] Screenshots or recordings are attached for visual issues
- [ ] Checked for duplicates before submitting
- [ ] Only one bug per report
- [ ] Language is neutral, factual, and professional
- [ ] Workaround is noted if one exists
- [ ] Reproducibility rate is stated (always / intermittent / once)

---

## Key Takeaways

1. **Good bug reports get fixed faster** — clear reports reduce back-and-forth
2. **Reproducibility is king** — if a developer can't reproduce it, it won't get fixed
3. **Severity ≠ Priority** — they measure different things
4. **One bug, one report** — keeps tracking and resolution clean
5. **Evidence strengthens reports** — screenshots, logs, and recordings prove the issue
6. **Bug lifecycle ensures accountability** — every state has a responsible party
7. **Choose the right tool for your team** — Jira for enterprise, GitHub for dev teams, Bugzilla for open source

---

## Summary

Bug reporting is a communication skill as much as a technical one. A well-written bug report bridges the gap between the tester who found the issue and the developer who must fix it. By following structured formats, providing complete information, and maintaining professional objectivity, testers ensure that defects are understood, prioritized, and resolved efficiently. Master this skill, and you'll earn the respect of every development team you work with.
