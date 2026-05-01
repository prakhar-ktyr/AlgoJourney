---
title: Flash Loans & Oracles
---

Flash loans and oracles are two foundational DeFi primitives. Flash loans enable uncollateralized borrowing within a single transaction, while oracles bring real-world data on-chain. Together, they power arbitrage, liquidations, and dynamic pricing — but also introduce unique attack vectors.

---

## What are Flash Loans?

A flash loan lets you borrow any amount of tokens without collateral, as long as you repay the loan within the same transaction. If you fail to repay, the entire transaction reverts as if it never happened.

```
Flash loan lifecycle (single transaction):

1. Borrow 1,000,000 USDC from Aave (no collateral)
2. Use the funds (arbitrage, liquidation, etc.)
3. Repay 1,000,000 USDC + 0.09% fee (900 USDC)
4. Transaction succeeds ✓

If step 3 fails → entire transaction reverts (atomicity)
```

| Property | Traditional Loan | Flash Loan |
|----------|-----------------|------------|
| Collateral | Required (often 150%+) | None |
| Duration | Days to years | One transaction (~12 seconds) |
| Credit check | Yes | No |
| Amount limit | Based on collateral | Limited only by pool liquidity |
| Risk to lender | Borrower default | Zero (atomic repayment) |
| Fee | Interest over time | Flat fee (0.05-0.09%) |

---

## How Flash Loans Work (Aave)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@aave/v3-core/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/v3-core/contracts/interfaces/IPoolAddressesProvider.sol";

contract MyFlashLoan is FlashLoanSimpleReceiverBase {
    constructor(IPoolAddressesProvider provider)
        FlashLoanSimpleReceiverBase(provider)
    {}

    // Entry point: request flash loan
    function requestFlashLoan(address token, uint256 amount) external {
        POOL.flashLoanSimple(
            address(this), // receiver
            token,         // asset to borrow
            amount,        // amount
            "",            // params (passed to executeOperation)
            0              // referral code
        );
    }

    // Callback: Aave calls this after sending you the funds
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,   // fee to repay
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // --- Your logic here ---
        // e.g., arbitrage, liquidation, collateral swap

        // Repay loan + fee
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(POOL), amountOwed);
        return true;
    }
}
```

---

## Flash Loan Use Cases

| Use Case | Description | Example |
|----------|-------------|---------|
| Arbitrage | Exploit price differences between DEXs | Buy cheap on Uniswap, sell high on SushiSwap |
| Liquidation | Liquidate undercollateralized positions | Repay someone's debt, claim their collateral |
| Collateral swap | Change your collateral without closing position | Swap ETH collateral for WBTC in one tx |
| Self-liquidation | Close your own position efficiently | Repay debt and withdraw collateral atomically |
| Governance attacks | Borrow tokens to influence a vote | Flash borrow governance tokens, vote, return |

### Arbitrage Example Flow

```
1. Flash borrow 100,000 DAI from Aave
2. Buy ETH on Uniswap at $2,000/ETH → get 50 ETH
3. Sell 50 ETH on SushiSwap at $2,020/ETH → get 101,000 DAI
4. Repay 100,000 DAI + 90 DAI fee to Aave
5. Profit: 910 DAI (minus gas costs)
```

---

## Flash Loan Providers

| Provider | Fee | Chains | Max Amount |
|----------|-----|--------|------------|
| Aave V3 | 0.05% | Ethereum, Arbitrum, Polygon, etc. | Pool liquidity |
| dYdX | 0% (via internal mechanism) | Ethereum | Pool liquidity |
| Uniswap V3 | 0.3% (flash swap) | Ethereum, L2s | Pool liquidity |
| Balancer | 0% | Ethereum, L2s | Pool liquidity |

---

## The Oracle Problem

Smart contracts cannot access external data (prices, weather, sports scores) on their own. Oracles bridge the gap between off-chain data and on-chain smart contracts.

```
Real world data                      Blockchain
┌───────────────┐                   ┌───────────────┐
│ ETH = $2,000  │                   │ Smart Contract│
│ BTC = $60,000 │ ──── Oracle ───→  │ needs prices  │
│ Temp = 72°F   │                   │ to function   │
└───────────────┘                   └───────────────┘

Without oracles, DeFi protocols cannot:
- Determine liquidation thresholds
- Calculate fair swap prices
- Settle prediction markets
- Trigger insurance payouts
```

---

## Chainlink: The Leading Oracle Network

Chainlink uses a decentralized network of node operators to aggregate data from multiple sources, reducing single points of failure.

| Component | Role |
|-----------|------|
| Data providers | Supply raw data (CoinGecko, CoinMarketCap, exchanges) |
| Node operators | Fetch, validate, and submit data on-chain |
| Aggregator contract | Collects answers, computes median, updates price |
| Consumer contract | Your DeFi protocol reading the price feed |

```solidity
// Reading a Chainlink price feed
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor() {
        // ETH/USD on Ethereum mainnet
        priceFeed = AggregatorV3Interface(
            0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        );
    }

    function getLatestPrice() public view returns (int) {
        (
            /* uint80 roundID */,
            int price,
            /* uint startedAt */,
            uint timeStamp,
            /* uint80 answeredInRound */
        ) = priceFeed.latestRoundData();

        // Check staleness
        require(block.timestamp - timeStamp < 3600, "Stale price");
        return price; // 8 decimals (e.g., 200000000000 = $2,000)
    }
}
```

---

## TWAP (Time-Weighted Average Price)

TWAP oracles use historical price data averaged over time to resist manipulation:

```
TWAP over 30 minutes:

Time    Price       Cumulative
0 min   $2,000      $0
10 min  $2,010      $20,100
20 min  $1,990      $39,900
30 min  $2,005      $60,050

TWAP = ($60,050 - $0) / 30 = $2,001.67

Even if an attacker spikes the price at minute 29,
the TWAP barely moves because it averages over 30 minutes.
```

---

## Oracle Manipulation Attacks

Attackers can combine flash loans with oracle manipulation to drain protocols:

| Attack | Method | Example |
|--------|--------|---------|
| Price manipulation | Flash loan to move DEX price, exploit protocol using that price | Harvest Finance ($34M, 2020) |
| Flash loan + governance | Borrow governance tokens, pass malicious proposal | Beanstalk ($182M, 2022) |
| Stale price exploit | Use outdated oracle price during high volatility | Venus Protocol ($200M, 2021) |

### Attack Pattern

```
1. Flash borrow large amount of Token A
2. Dump Token A on low-liquidity DEX → price crashes
3. Protocol's oracle reads manipulated price
4. Exploit protocol (e.g., borrow against deflated collateral)
5. Repay flash loan, keep profit
```

### Mitigations

- Use Chainlink (decentralized, multi-source) instead of single DEX prices
- Implement TWAP instead of spot prices
- Add price deviation circuit breakers
- Use multiple oracle sources with median aggregation
- Limit borrowing to a percentage of available liquidity

---

## Key Takeaways

- Flash loans allow borrowing without collateral — repayment must happen in the same transaction or everything reverts
- Primary use cases include arbitrage, liquidations, collateral swaps, and unfortunately, attacks
- Oracles solve the problem of getting external data into smart contracts
- Chainlink is the dominant oracle solution using decentralized node operators
- TWAP oracles resist manipulation by averaging prices over time
- Flash loan attacks often combine borrowed capital with oracle manipulation
- Protocols should never rely on a single price source or spot prices from low-liquidity pools
- The combination of flash loans + oracle manipulation has caused billions in DeFi losses

---

[Next: Layer 2 Scaling Solutions](42-blockchain-layer2)
