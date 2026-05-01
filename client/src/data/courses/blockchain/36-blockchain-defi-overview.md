---
title: DeFi Overview
---

Decentralized Finance (DeFi) recreates traditional financial services — lending, borrowing, trading, insurance — using smart contracts instead of intermediaries. It operates 24/7, is permissionless, and gives users full control of their assets.

---

## What is DeFi?

DeFi replaces banks, brokers, and exchanges with transparent smart contracts on public blockchains. Anyone with a wallet can access financial services without KYC, credit checks, or minimum balances.

| Aspect | Traditional Finance (TradFi) | DeFi |
|--------|------------------------------|------|
| Access | Bank account required | Wallet only |
| Hours | Business hours | 24/7/365 |
| Intermediary | Banks, brokers | Smart contracts |
| Custody | Institution holds funds | User holds funds |
| Transparency | Opaque | Open-source, auditable |
| Speed | Days (settlements) | Minutes (on-chain) |
| Permissioning | KYC/AML required | Permissionless |
| Composability | Siloed systems | "Money Legos" |

---

## Total Value Locked (TVL)

TVL measures the total assets deposited in DeFi protocols. It's the primary metric for DeFi adoption.

| Period | Approximate TVL | Key Event |
|--------|----------------|-----------|
| Jan 2020 | $600M | DeFi Summer begins |
| Nov 2021 | $180B | All-time high |
| Jun 2022 | $40B | Terra/UST collapse, bear market |
| 2024 | $90B+ | Recovery, L2 growth |

```javascript
// Fetching TVL data from DeFi Llama API
const response = await fetch("https://api.llama.fi/protocols");
const protocols = await response.json();

// Sort by TVL
const topProtocols = protocols
  .sort((a, b) => b.tvl - a.tvl)
  .slice(0, 5);

topProtocols.forEach((p) => {
  console.log(`${p.name}: $${(p.tvl / 1e9).toFixed(2)}B`);
});
```

---

## Key DeFi Protocols

| Protocol | Category | Description | Chain |
|----------|----------|-------------|-------|
| Uniswap | DEX | Automated market maker | Ethereum, L2s |
| Aave | Lending | Borrow/lend crypto assets | Multi-chain |
| MakerDAO | Stablecoin | DAI stablecoin issuer | Ethereum |
| Lido | Staking | Liquid staking (stETH) | Ethereum |
| Curve | DEX | Stablecoin-optimized AMM | Multi-chain |
| Compound | Lending | Algorithmic interest rates | Ethereum |
| Synthetix | Derivatives | Synthetic assets | Ethereum, Optimism |

---

## The DeFi Stack

DeFi is built in layers, each composable with the others:

```
┌─────────────────────────────────────────┐
│  Application Layer                       │
│  (Wallets, Aggregators, Dashboards)      │
├─────────────────────────────────────────┤
│  Protocol Layer                          │
│  (DEXs, Lending, Derivatives, Insurance) │
├─────────────────────────────────────────┤
│  Asset Layer                             │
│  (ERC-20, ERC-721, Stablecoins, LP tokens)│
├─────────────────────────────────────────┤
│  Settlement Layer                        │
│  (Ethereum, L2s, Sidechains)             │
└─────────────────────────────────────────┘
```

| Layer | Purpose | Examples |
|-------|---------|----------|
| Settlement | Transaction finality, security | Ethereum, Arbitrum, Polygon |
| Asset | Tokenized value representation | USDC, WETH, aTokens |
| Protocol | Financial logic and rules | Uniswap, Aave, Maker |
| Application | User-facing interfaces | MetaMask, Zapper, DeBank |

---

## Composability: Money Legos

DeFi protocols can be combined like building blocks:

```solidity
// Example: Flash loan arbitrage (conceptual)
// 1. Borrow 1000 USDC from Aave (no collateral needed)
// 2. Swap USDC → ETH on Uniswap (cheaper price)
// 3. Swap ETH → USDC on Sushiswap (higher price)
// 4. Repay 1000 USDC + fee to Aave
// 5. Keep the profit

// All in a single atomic transaction!
contract FlashLoanArbitrage {
    function executeArbitrage(uint256 amount) external {
        // Borrow from Aave
        aaveLendingPool.flashLoan(address(this), usdc, amount, "");
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // Step 2: Swap on Uniswap
        uint256 ethAmount = uniswapRouter.swapExactTokensForTokens(
            amount, 0, path1, address(this), block.timestamp
        )[1];

        // Step 3: Swap back on Sushiswap
        uint256 usdcReceived = sushiRouter.swapExactTokensForTokens(
            ethAmount, 0, path2, address(this), block.timestamp
        )[1];

        // Step 4: Repay loan + premium
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(aaveLendingPool), amountOwed);

        // Step 5: Profit remains in this contract
        return true;
    }
}
```

---

## DeFi vs CeFi Comparison

| Feature | CeFi (Coinbase, Binance) | DeFi |
|---------|--------------------------|------|
| Custody | Exchange holds keys | You hold keys |
| Account recovery | Customer support | No recovery possible |
| Regulation | Licensed, regulated | Largely unregulated |
| Products | Limited selection | Unlimited composability |
| Insurance | FDIC (fiat), some crypto | Smart contract coverage (Nexus) |
| Privacy | Full KYC required | Pseudonymous |

---

## DeFi Risks

| Risk Type | Description | Example |
|-----------|-------------|---------|
| Smart contract risk | Bugs in protocol code | Harvest Finance exploit ($34M) |
| Impermanent loss | LP value < holding | Providing volatile pair liquidity |
| Oracle manipulation | Price feed attacks | Flash loan oracle exploits |
| Rug pulls | Developers steal funds | Anonymous team drains liquidity |
| Regulatory risk | Government crackdowns | Tornado Cash sanctions |
| Liquidation risk | Collateral value drops | Cascading DeFi liquidations |
| Systemic risk | Protocol dependencies | UST depeg → contagion |

### Risk Mitigation Checklist

```markdown
Before using a DeFi protocol:
✓ Is the code audited? (By whom?)
✓ Is there a bug bounty program?
✓ How long has it been deployed? (Lindy effect)
✓ Is the team doxxed?
✓ What's the TVL trend?
✓ Are admin keys behind a multisig/timelock?
✓ Has it survived a market crash?
```

---

## Getting Started with DeFi

```javascript
// Connect to DeFi with ethers.js
const { ethers } = require("ethers");

// 1. Connect wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// 2. Approve token spending
const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
await usdc.approve(AAVE_POOL_ADDRESS, ethers.parseUnits("1000", 6));

// 3. Supply to Aave
const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, POOL_ABI, signer);
await aavePool.supply(
  USDC_ADDRESS,
  ethers.parseUnits("1000", 6),
  signer.address,
  0 // referral code
);

console.log("Deposited 1000 USDC into Aave!");
```

---

## Key Takeaways

- DeFi recreates traditional finance using smart contracts — no intermediaries needed
- TVL (Total Value Locked) is the primary metric for measuring DeFi adoption
- The DeFi stack has four layers: settlement, asset, protocol, and application
- Composability ("Money Legos") lets protocols build on top of each other
- Key categories include DEXs, lending, stablecoins, derivatives, and insurance
- DeFi risks are real — smart contract bugs, rug pulls, and liquidation cascades
- Always research audits, team reputation, and protocol age before depositing funds
- Start small and understand the risks before committing significant capital

---

## Next

[Decentralized Exchanges](/courses/blockchain/37-blockchain-dex)
