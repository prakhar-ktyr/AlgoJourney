---
title: Smart Contract Security
---

## Smart Contract Security

Smart contract security is arguably the most critical topic in blockchain development. Unlike traditional software, deployed contracts are immutable, publicly visible, and often control millions of dollars. A single vulnerability can result in irreversible financial loss.

---

## Why Security Is Critical

| Factor | Implication |
|--------|-------------|
| Immutable code | Cannot patch vulnerabilities after deployment |
| Open source | Attackers can read and analyze your code |
| Real money at stake | Exploits immediately drain funds |
| Composability | Bugs can cascade through connected protocols |
| Pseudonymous attackers | Low risk of legal consequences for hackers |
| MEV & front-running | Transactions can be observed and exploited before confirmation |

Historical losses from smart contract exploits exceed **$7 billion** as of 2024.

---

## Common Attack Vectors

### 1. Reentrancy

An external call allows the called contract to re-enter your function before state is updated.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE — do NOT use in production
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        // BUG: external call before state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        balances[msg.sender] = 0; // too late!
    }
}

// SECURE — Checks-Effects-Interactions pattern
contract SecureVault {
    mapping(address => uint256) public balances;

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // Effect: update state BEFORE external call
        balances[msg.sender] = 0;

        // Interaction: external call LAST
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

### 2. Integer Overflow/Underflow

Pre-Solidity 0.8, arithmetic could silently overflow. Since 0.8+, overflow reverts by default.

```solidity
// Solidity 0.8+ is safe by default
uint8 x = 255;
x += 1; // REVERTS (would have wrapped to 0 in older versions)

// If you intentionally need wrapping:
unchecked { x += 1; } // wraps to 0
```

### 3. Access Control Issues

```solidity
// VULNERABLE: anyone can call
function mint(address to, uint256 amount) external {
    _mint(to, amount);
}

// SECURE: restricted to owner
function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
}
```

### 4. Front-Running

Pending transactions are visible in the mempool. Attackers can submit higher-gas transactions to execute before yours.

| Mitigation | How |
|------------|-----|
| Commit-reveal schemes | Hide action until revealed |
| Private mempools | Flashbots Protect, MEV Blocker |
| Slippage tolerance | Limit acceptable price impact |
| Batch auctions | Execute all orders at same price |

---

## Attack Vector Summary

| Attack | Risk Level | Mitigation |
|--------|-----------|------------|
| Reentrancy | Critical | CEI pattern, ReentrancyGuard |
| Access control | Critical | OpenZeppelin Ownable/AccessControl |
| Oracle manipulation | High | Chainlink, TWAP oracles |
| Front-running | High | Commit-reveal, private mempools |
| Denial of Service | Medium | Pull over push, gas limits |
| Precision loss | Medium | Multiply before divide, use higher precision |
| Signature replay | Medium | Nonces, EIP-712, domain separator |
| Delegatecall injection | Critical | Never delegatecall to user input |
| Storage collision (proxies) | Critical | EIP-1967 storage slots |
| Unchecked return values | Medium | Always check low-level call returns |

---

## Security Mindset

### Checks-Effects-Interactions (CEI) Pattern

The most important security pattern in Solidity:

```solidity
function withdraw(uint256 amount) external {
    // 1. CHECKS: validate all conditions
    require(balances[msg.sender] >= amount, "Insufficient");

    // 2. EFFECTS: update state
    balances[msg.sender] -= amount;

    // 3. INTERACTIONS: external calls
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}
```

### Defense in Depth

| Layer | Tools |
|-------|-------|
| Language-level | Solidity 0.8+ (overflow protection) |
| Pattern-level | CEI, ReentrancyGuard, pull payments |
| Library-level | OpenZeppelin battle-tested contracts |
| Analysis-level | Slither, Mythril, Aderyn static analyzers |
| Testing-level | Fuzz testing, invariant testing, fork tests |
| Audit-level | Professional third-party audits |
| Monitoring-level | Forta, Tenderly alerts for live contracts |

---

## The Audit Process

| Phase | Activity | Duration |
|-------|----------|----------|
| 1. Preparation | Freeze code, write docs, add tests | 1–2 weeks |
| 2. Automated analysis | Slither, Mythril, Certora | 1–3 days |
| 3. Manual review | Expert auditors read every line | 2–6 weeks |
| 4. Report | Findings categorized by severity | — |
| 5. Fixes | Team addresses findings | 1–2 weeks |
| 6. Re-audit | Auditors verify fixes | 1 week |

### Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| Critical | Direct fund loss | Reentrancy in withdrawal |
| High | Significant impact | Broken access control |
| Medium | Limited impact | DoS under specific conditions |
| Low | Best practice violation | Missing event emission |
| Informational | Suggestions | Code style, gas optimization |

---

## Formal Verification

Formal verification uses mathematical proofs to guarantee contract behavior:

```
// Certora spec example (simplified)
rule withdrawDoesNotExceedBalance {
    address user;
    uint256 amount;

    require balances[user] >= amount;
    withdraw(amount);
    assert balances[user] >= 0;
}
```

| Tool | Approach | Best For |
|------|----------|----------|
| Certora | Custom specs (CVL) | DeFi protocols |
| Halmos | Symbolic execution | General contracts |
| KEVM | K Framework | EVM-level proofs |

---

## Security Tools

| Tool | Type | Usage |
|------|------|-------|
| Slither | Static analyzer | `slither .` |
| Mythril | Symbolic execution | `myth analyze contract.sol` |
| Aderyn | Static analyzer (Rust) | `aderyn .` |
| Foundry invariants | Invariant testing | `forge test --match-test invariant` |
| OpenZeppelin Defender | Monitoring & automation | Web dashboard |
| Forta | Real-time threat detection | Bot network |

---

## Key Takeaways

- Smart contract bugs are permanent and exploitable for real money — security is non-negotiable
- Follow the Checks-Effects-Interactions pattern in every function with external calls
- Use battle-tested libraries (OpenZeppelin) instead of writing security primitives from scratch
- Run static analysis (Slither) on every commit — it catches common issues instantly
- Professional audits are essential for any contract handling significant value
- Security is layered: language safety + patterns + libraries + analysis + audits + monitoring
- Formal verification provides mathematical guarantees but is resource-intensive

---

[Next: Continue your blockchain journey by building a complete dApp!](./31-blockchain-building-dapps)
