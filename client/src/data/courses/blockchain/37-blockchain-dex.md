---
title: Decentralized Exchanges
---

Decentralized Exchanges (DEXs) allow users to trade tokens directly from their wallets without a centralized intermediary. The most popular model — Automated Market Makers (AMMs) — replaced traditional order books with mathematical formulas and liquidity pools.

---

## AMM Model: How Uniswap Works

Instead of matching buyers with sellers, AMMs use liquidity pools — smart contracts holding reserves of two tokens. A mathematical formula determines the price.

```
Traditional Exchange:        AMM (Uniswap):
┌─────────────────┐         ┌─────────────────┐
│  Order Book     │         │  Liquidity Pool  │
│  Buy: $1800     │         │  ETH: 100        │
│  Buy: $1799     │         │  USDC: 180,000   │
│  Sell: $1801    │         │  Price = 180000/100│
│  Sell: $1802    │         │       = $1800/ETH │
└─────────────────┘         └─────────────────┘
```

| Feature | Order Book DEX | AMM DEX |
|---------|---------------|---------|
| Price discovery | Bid/ask spread | Formula-based |
| Liquidity source | Market makers | Anyone (LPs) |
| Capital efficiency | High | Variable |
| Examples | dYdX, Serum | Uniswap, Curve |
| Best for | Professional trading | Retail, long-tail tokens |
| Gas cost | Higher (orders) | Lower (single swap) |

---

## The Constant Product Formula: x * y = k

Uniswap V2 uses the simplest AMM formula:

```
x * y = k

Where:
  x = reserve of token A
  y = reserve of token B
  k = constant (invariant)
```

### Example: Swapping ETH for USDC

```
Pool state: 100 ETH + 180,000 USDC = k (18,000,000)

User wants to buy ETH with 1,800 USDC:
  New USDC reserve: 180,000 + 1,800 = 181,800
  New ETH reserve: 18,000,000 / 181,800 = 99.01 ETH
  ETH received: 100 - 99.01 = 0.99 ETH

Effective price: 1,800 / 0.99 = ~$1,818 per ETH
(Slightly worse than spot due to price impact)
```

```solidity
// Simplified Uniswap V2 swap logic
function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
) public pure returns (uint256 amountOut) {
    uint256 amountInWithFee = amountIn * 997; // 0.3% fee
    uint256 numerator = amountInWithFee * reserveOut;
    uint256 denominator = (reserveIn * 1000) + amountInWithFee;
    amountOut = numerator / denominator;
}
```

### Price Impact vs Trade Size

| Trade Size (USDC) | ETH Received | Effective Price | Slippage |
|-------------------|-------------|-----------------|----------|
| 1,800 | 0.990 | $1,818 | 1.0% |
| 18,000 | 9.73 | $1,850 | 2.8% |
| 90,000 | 44.44 | $2,025 | 12.5% |
| 180,000 | 66.67 | $2,700 | 50.0% |

Larger trades create more slippage — this is why DEXs use aggregators for big swaps.

---

## Liquidity Pools

Liquidity Providers (LPs) deposit equal value of both tokens into a pool and earn trading fees.

```solidity
// Adding liquidity (simplified)
function addLiquidity(uint256 amountA, uint256 amountB) external {
    // Must add in current ratio
    require(amountA / amountB == reserveA / reserveB, "Invalid ratio");

    // Transfer tokens to pool
    tokenA.transferFrom(msg.sender, address(this), amountA);
    tokenB.transferFrom(msg.sender, address(this), amountB);

    // Mint LP tokens proportional to contribution
    uint256 lpTokens = (amountA * totalLPSupply) / reserveA;
    _mint(msg.sender, lpTokens);

    reserveA += amountA;
    reserveB += amountB;
}
```

### LP Token Economics

| Concept | Description |
|---------|-------------|
| LP tokens | Receipt proving your pool share |
| Fee accrual | Trading fees increase pool reserves |
| Redemption | Burn LP tokens to withdraw proportional reserves |
| Fee (Uni V2) | 0.3% per swap, distributed to LPs |

---

## Impermanent Loss Explained

Impermanent loss (IL) occurs when the price ratio of pooled tokens changes compared to when you deposited.

```
Scenario: You deposit 1 ETH ($1,800) + 1,800 USDC = $3,600 total

If ETH doubles to $3,600:
  Pool rebalances (arbitrage): ~0.707 ETH + ~2,545 USDC = $5,091
  Just holding: 1 ETH + 1,800 USDC = $5,400

  Impermanent Loss = $5,400 - $5,091 = $309 (5.7%)
```

| Price Change | Impermanent Loss |
|-------------|-----------------|
| 1.25x (25% up) | 0.6% |
| 1.5x (50% up) | 2.0% |
| 2x (100% up) | 5.7% |
| 3x (200% up) | 13.4% |
| 5x (400% up) | 25.5% |

**Key insight**: IL is "impermanent" only if the price returns to the original ratio. If you withdraw at a different ratio, the loss becomes permanent.

### When Is It Worth It?

```
Net LP Return = Trading Fees Earned - Impermanent Loss

Profitable when: Fee APY > IL from price divergence
```

High-volume pools with correlated assets (USDC/DAI) have minimal IL and steady fees.

---

## Uniswap V2 vs V3

| Feature | Uniswap V2 | Uniswap V3 |
|---------|-----------|-----------|
| Liquidity | Spread across 0→∞ | Concentrated in ranges |
| Capital efficiency | Low (~0.5% utilized) | Up to 4000x better |
| LP positions | Fungible (ERC-20) | Non-fungible (NFT) |
| Fee tiers | 0.3% only | 0.01%, 0.05%, 0.3%, 1% |
| Complexity | Simple | Complex |
| IL risk | Standard | Higher if out of range |

### Concentrated Liquidity (V3)

```
V2: Liquidity spread from $0 to ∞
    |||||||||||||||||||||||||||||||||||||||||||
    $0          $1800 (current)           $∞

V3: Liquidity concentrated in a range
                 |||||||||||||
    $0    $1500  $1800  $2100         $∞
          └── Your range ──┘
```

```javascript
// Providing concentrated liquidity in Uniswap V3
const { ethers } = require("ethers");

// Define your price range
const currentPrice = 1800; // ETH/USDC
const lowerPrice = 1500;   // Lower bound
const upperPrice = 2100;   // Upper bound

// Convert to ticks (Uniswap V3 internal representation)
const tickLower = priceToTick(lowerPrice);
const tickUpper = priceToTick(upperPrice);

// Add liquidity in range
const tx = await positionManager.mint({
  token0: WETH_ADDRESS,
  token1: USDC_ADDRESS,
  fee: 3000, // 0.3% fee tier
  tickLower: tickLower,
  tickUpper: tickUpper,
  amount0Desired: ethers.parseEther("1"),
  amount1Desired: ethers.parseUnits("1800", 6),
  amount0Min: 0,
  amount1Min: 0,
  recipient: signer.address,
  deadline: Math.floor(Date.now() / 1000) + 60 * 20,
});
```

---

## DEX Aggregators

Aggregators split trades across multiple DEXs for the best price:

| Aggregator | Description |
|------------|-------------|
| 1inch | Multi-DEX routing, limit orders |
| Paraswap | Gas-optimized routing |
| CoW Swap | MEV-protected batch auctions |
| Matcha (0x) | Professional trading interface |

```javascript
// Using 1inch API to find best swap route
const response = await fetch(
  `https://api.1inch.dev/swap/v6.0/1/swap?` +
  `src=${USDC_ADDRESS}&dst=${WETH_ADDRESS}` +
  `&amount=${ethers.parseUnits("10000", 6)}` +
  `&from=${walletAddress}&slippage=0.5`
);
const swapData = await response.json();
console.log("Best route:", swapData.protocols);
console.log("Expected output:", ethers.formatEther(swapData.toAmount), "ETH");
```

---

## Key Takeaways

- AMMs replaced order books with mathematical formulas and liquidity pools
- The constant product formula (x * y = k) determines swap prices automatically
- Larger trades cause more slippage — use aggregators for big swaps
- Liquidity providers earn trading fees but face impermanent loss risk
- Impermanent loss increases with price divergence between paired tokens
- Uniswap V3's concentrated liquidity improves capital efficiency up to 4000x
- DEX aggregators (1inch, CoW Swap) route trades across multiple pools for best pricing
- Always set a slippage tolerance to protect against sandwich attacks

---

## Next

[Lending & Borrowing Protocols](/courses/blockchain/38-blockchain-lending)
