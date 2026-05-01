---
title: Gas & Transaction Fees
---

## What is Gas?

Gas is the unit of measurement for computational work on Ethereum. Every operation (opcode) in the EVM costs a specific amount of gas. Gas serves two purposes:

1. **Prevents spam** — attackers must pay for computation
2. **Compensates validators** — incentivizes block production and security

```text
Analogy:
  Gas = fuel for your car
  Gas Limit = size of your fuel tank
  Gas Price = price per gallon at the pump
  Transaction Fee = total cost of the trip
```

---

## Gas Limit vs Gas Price

| Concept | Definition | Set By |
|---------|-----------|--------|
| Gas Limit | Maximum gas units you're willing to consume | User (sender) |
| Gas Price | Amount of ETH paid per gas unit | User (market-driven) |
| Gas Used | Actual gas consumed by the transaction | Determined by execution |

### Basic Formula (Pre-EIP-1559)

```text
Transaction Fee = Gas Used × Gas Price

Example:
  Gas Used: 65,000 units
  Gas Price: 50 Gwei
  Fee: 65,000 × 50 Gwei = 3,250,000 Gwei = 0.00325 ETH
```

### What Happens with Gas Limit?

```text
Gas Limit set: 100,000
Gas Used:       65,000
Unused gas:     35,000 (refunded to sender)

If Gas Used > Gas Limit:
  Transaction reverts (out of gas)
  Gas is NOT refunded (you still pay for work done)
```

---

## Common Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| ETH transfer | 21,000 | Fixed base cost |
| ERC-20 transfer | ~65,000 | Depends on contract |
| ERC-20 approve | ~46,000 | Depends on contract |
| Uniswap swap | ~150,000 | Multi-contract interaction |
| NFT mint | ~100,000–250,000 | Varies widely |
| Contract deployment | ~1,000,000–5,000,000+ | Depends on code size |
| Storage write (new) | 20,000 | Most expensive opcode |
| Storage write (update) | 5,000 | Updating existing value |
| Storage read | 2,100 | Cold access |

---

## EIP-1559: The Fee Market Reform

EIP-1559 (activated August 2021, London upgrade) redesigned Ethereum's fee mechanism:

### Before EIP-1559 (First-Price Auction)

```text
User sets: Gas Price (single value)
Problem:   Users overpay; volatile fees; poor UX
```

### After EIP-1559 (Base Fee + Priority Fee)

```text
Transaction Fee = (Base Fee + Priority Fee) × Gas Used

Base Fee:     Set by protocol (algorithmically adjusted)
Priority Fee: Tip to validator (user chooses)
Max Fee:      Maximum total fee user is willing to pay
```

### How Base Fee Works

| Block Fullness | Base Fee Adjustment |
|---------------|-------------------|
| > 50% full | Base fee increases (up to 12.5% per block) |
| = 50% full | Base fee stays the same |
| < 50% full | Base fee decreases (up to 12.5% per block) |

```text
Target block size: 15M gas (50% of 30M max)

Block N:   20M gas used (67% full) → Base fee increases
Block N+1: 10M gas used (33% full) → Base fee decreases
Block N+2: 15M gas used (50% full) → Base fee unchanged
```

### Fee Burn

The base fee is **burned** (destroyed), not paid to validators:

```text
Transaction Fee Breakdown:
  Base Fee × Gas Used    → BURNED (removed from supply)
  Priority Fee × Gas Used → Paid to validator

Impact: When burn > issuance, ETH supply decreases (deflationary)
```

---

## Fee Estimation

### EIP-1559 Transaction Fields

| Field | Description | Typical Value |
|-------|-------------|---------------|
| maxFeePerGas | Maximum total fee (base + priority) | Current base fee × 2 + priority |
| maxPriorityFeePerGas | Tip to validator | 1-3 Gwei (normal), 10+ Gwei (urgent) |
| gasLimit | Max gas units to consume | Depends on operation |

### Priority Levels

| Priority | maxPriorityFeePerGas | Expected Wait |
|----------|---------------------|---------------|
| Low | 0.5-1 Gwei | 5+ minutes |
| Medium | 1-2 Gwei | 1-3 minutes |
| High | 3-5 Gwei | Next block (~12s) |
| Urgent | 10+ Gwei | Guaranteed next block |

---

## Why Fees Spike

| Cause | Example |
|-------|---------|
| NFT mint events | Popular collection launches overwhelm block space |
| DeFi liquidations | Market crashes trigger cascading liquidations |
| Token launches | New tokens cause a rush to buy |
| Airdrop claims | Thousands claim simultaneously |
| Network congestion | Sustained high demand exceeds capacity |
| MEV bots | Bots compete for profitable transaction ordering |

### Historical Fee Spikes

```text
Normal:     5-20 Gwei base fee
Moderate:   50-100 Gwei
Spike:      200-500 Gwei
Extreme:    1000+ Gwei (NFT mints, market crashes)
```

---

## Optimizing Gas Usage

### For Users

| Strategy | Savings |
|----------|---------|
| Time transactions (low activity periods) | 50-80% |
| Use Layer 2 solutions (Arbitrum, Optimism) | 90-95% |
| Batch operations when possible | Variable |
| Set appropriate gas limits | Avoid overpaying |
| Use EIP-1559 properly (set max fee, not just priority) | Avoid overpaying |

### For Developers (Solidity)

| Optimization | Description |
|-------------|-------------|
| Pack storage variables | Multiple uint128 in one 256-bit slot |
| Use `calldata` instead of `memory` | Cheaper for read-only function params |
| Cache storage reads | Read once, store in local variable |
| Short-circuit conditions | Put cheaper checks first |
| Use events instead of storage | Logs are much cheaper than SSTORE |
| Minimize on-chain data | Store hashes, not full data |
| Use mappings over arrays | Direct access vs iteration |

```solidity
// Bad: Multiple storage reads
function bad() public view returns (uint256) {
    return myArray.length + myArray.length + myArray.length;
}

// Good: Cache the storage read
function good() public view returns (uint256) {
    uint256 len = myArray.length;  // single SLOAD
    return len + len + len;
}
```

---

## Gas Tokens (Historical)

Gas tokens were a mechanism to "store" gas when prices were low and use it when prices were high:

| Token | Mechanism | Status |
|-------|-----------|--------|
| CHI (1inch) | Create contracts at low gas, destroy for refund at high gas | Deprecated |
| GST2 | Similar create/destroy pattern | Deprecated |

> **Note**: EIP-3529 (London upgrade, 2021) removed most gas refund mechanics, making gas tokens obsolete.

---

## Layer 2 Fee Comparison

| Network | Average Swap Fee | Relative to L1 |
|---------|-----------------|----------------|
| Ethereum L1 | $5-50+ | 1× (baseline) |
| Arbitrum | $0.10-0.50 | ~100× cheaper |
| Optimism | $0.10-0.50 | ~100× cheaper |
| zkSync Era | $0.05-0.30 | ~150× cheaper |
| Polygon PoS | $0.01-0.05 | ~500× cheaper |

---

## Key Takeaways

- Gas measures computational work; every EVM opcode has a fixed gas cost
- Gas limit is set by the user; gas used is determined by execution
- EIP-1559 introduced base fee (burned) + priority fee (paid to validators)
- Base fee adjusts algorithmically based on block fullness (target: 50%)
- Fee burning makes ETH potentially deflationary when network usage is high
- Fees spike during high-demand events (NFT mints, market crashes, token launches)
- Developers can optimize gas through storage packing, caching, and L2 deployment
- Layer 2 solutions reduce fees by 90-99% compared to Ethereum mainnet

---

## Next

[Smart Contracts & Solidity →](21-blockchain-smart-contracts)
