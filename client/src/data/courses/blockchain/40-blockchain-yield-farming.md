---
title: Yield Farming & Liquidity Mining
---

Yield farming is the practice of moving crypto assets between DeFi protocols to maximize returns. Liquidity mining — a subset of yield farming — rewards users with governance tokens for providing liquidity. Together, they powered DeFi Summer 2020 and remain a core DeFi activity.

---

## What is Yield Farming?

Yield farming means putting your crypto assets to work in DeFi protocols to earn returns. Instead of holding idle tokens, you deposit them into protocols that pay you interest, fees, or token rewards.

```
Simple yield farming flow:
1. Deposit USDC into Aave → Earn 3% supply APY
2. Borrow ETH against your USDC → Use as collateral
3. Deposit ETH into Lido → Earn 4% staking yield
4. Deposit stETH into Curve → Earn trading fees + CRV rewards
5. Stake CRV for veCRV → Earn protocol fees + boosted rewards

Total yield: Stacked across multiple protocols
```

| Term | Meaning |
|------|---------|
| Yield farming | Maximizing returns by moving capital between protocols |
| Liquidity mining | Earning governance tokens for providing liquidity |
| Staking | Locking tokens to secure a network or earn rewards |
| Compounding | Reinvesting earned rewards to earn more |
| TVL | Total Value Locked — assets deposited in a protocol |

---

## Liquidity Mining Incentives

Protocols distribute their governance tokens to attract liquidity:

```
Why protocols do this:
  - Bootstrap liquidity (chicken-and-egg problem)
  - Decentralize governance (distribute tokens widely)
  - Attract users and TVL (key growth metric)
  - Create network effects (more liquidity → better prices → more users)
```

### Example: Providing Liquidity + Mining Rewards

```javascript
const { ethers } = require("ethers");

// 1. Add liquidity to Uniswap ETH/USDC pool
const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);

await weth.approve(ROUTER_ADDRESS, ethers.parseEther("1"));
await usdc.approve(ROUTER_ADDRESS, ethers.parseUnits("1800", 6));

await router.addLiquidity(
  WETH_ADDRESS,
  USDC_ADDRESS,
  ethers.parseEther("1"),
  ethers.parseUnits("1800", 6),
  0, // min amounts (set properly in production!)
  0,
  signer.address,
  Math.floor(Date.now() / 1000) + 600
);

// 2. Stake LP tokens in reward contract (liquidity mining)
const lpToken = new ethers.Contract(LP_TOKEN_ADDRESS, ERC20_ABI, signer);
const farm = new ethers.Contract(FARM_ADDRESS, FARM_ABI, signer);

const lpBalance = await lpToken.balanceOf(signer.address);
await lpToken.approve(FARM_ADDRESS, lpBalance);
await farm.stake(lpBalance);

// 3. Check pending rewards
const rewards = await farm.earned(signer.address);
console.log("Pending reward tokens:", ethers.formatEther(rewards));

// 4. Claim rewards
await farm.getReward();
```

---

## APY vs APR

| Metric | Formula | Compounding | Example |
|--------|---------|-------------|---------|
| APR | Simple interest per year | No | 10% APR on $1000 = $100/year |
| APY | Includes compounding effect | Yes | 10% APR compounded daily ≈ 10.52% APY |

```javascript
// Converting APR to APY
function aprToApy(apr, compoundsPerYear) {
  return Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1;
}

// Examples:
console.log(aprToApy(0.10, 1));     // Annual: 10.00% APY
console.log(aprToApy(0.10, 12));    // Monthly: 10.47% APY
console.log(aprToApy(0.10, 365));   // Daily:   10.52% APY
console.log(aprToApy(0.10, 8760));  // Hourly:  10.52% APY

// Why "1000% APY" claims are misleading:
// They assume constant token price and reward rate
// Reality: High APY → more farmers → diluted rewards → APY drops
```

### APY Decay Over Time

| Time | Advertised APY | Reality |
|------|---------------|---------|
| Launch day | 5,000% | Early adopters get high rewards |
| Week 1 | 1,000% | More farmers arrive, dilution begins |
| Month 1 | 200% | TVL stabilizes |
| Month 3 | 50% | Rewards decrease, some leave |
| Month 6 | 15% | Sustainable equilibrium |

---

## Auto-Compounding

Manually claiming and reinvesting rewards costs gas. Auto-compounders do this automatically:

```solidity
// Simplified auto-compounder logic
contract AutoCompounder {
    IFarm public farm;
    IRouter public router;
    IERC20 public rewardToken;
    IERC20 public lpToken;

    function harvest() external {
        // 1. Claim pending rewards
        farm.getReward();

        // 2. Swap reward tokens to base pair tokens
        uint256 rewardBalance = rewardToken.balanceOf(address(this));
        uint256 half = rewardBalance / 2;

        router.swapExactTokensForTokens(half, 0, pathToTokenA, address(this), block.timestamp);
        router.swapExactTokensForTokens(half, 0, pathToTokenB, address(this), block.timestamp);

        // 3. Add liquidity to get more LP tokens
        router.addLiquidity(tokenA, tokenB, balA, balB, 0, 0, address(this), block.timestamp);

        // 4. Stake new LP tokens back in farm
        uint256 newLp = lpToken.balanceOf(address(this));
        farm.stake(newLp);

        // Compounding complete! Users' shares appreciate
    }
}
```

---

## Yield Aggregators

Yield aggregators automate strategy selection and compounding:

| Aggregator | Description | Key Feature |
|------------|-------------|-------------|
| Yearn Finance | Vault strategies, auto-compound | Best yield strategies |
| Beefy Finance | Multi-chain auto-compounder | 1000+ vaults |
| Convex Finance | Boosted Curve rewards | veCRV without locking |
| Harvest Finance | Auto-compound + FARM rewards | Community governance |

### Yearn Vault Architecture

```
User deposits USDC into Yearn USDC Vault
         ↓
Vault allocates to best strategy:
  ├── 40% → Aave (supply USDC, earn interest)
  ├── 30% → Compound (supply USDC, earn COMP + interest)
  └── 30% → Curve (LP in 3pool, earn CRV + fees)
         ↓
Harvester bot auto-compounds rewards
         ↓
User's vault share (yvUSDC) appreciates over time
```

```javascript
// Depositing into a Yearn Vault
const vault = new ethers.Contract(YEARN_VAULT_ADDRESS, VAULT_ABI, signer);

// Approve vault to spend your USDC
await usdc.approve(YEARN_VAULT_ADDRESS, ethers.parseUnits("10000", 6));

// Deposit — receive yvUSDC shares
await vault.deposit(ethers.parseUnits("10000", 6));

// Check share price (increases over time)
const pricePerShare = await vault.pricePerShare();
console.log("Price per share:", ethers.formatUnits(pricePerShare, 6));

// Later: withdraw (yvUSDC → USDC at appreciated rate)
const shares = await vault.balanceOf(signer.address);
await vault.withdraw(shares);
```

---

## Common Yield Farming Strategies

| Strategy | Risk | Complexity | Expected APY |
|----------|------|-----------|--------------|
| Stablecoin lending (Aave) | Low | Low | 3-8% |
| Stablecoin LP (Curve 3pool) | Low-Medium | Medium | 5-15% |
| ETH/stETH LP | Low | Medium | 3-7% |
| Volatile pair LP + mining | High | Medium | 20-100%+ |
| Leveraged farming | Very High | High | 50-200%+ |
| Recursive lending | High | High | Variable |

### Recursive Lending Strategy

```
1. Deposit 1000 USDC into Aave
2. Borrow 800 USDC (80% LTV)
3. Deposit the 800 USDC again
4. Borrow 640 USDC
5. Repeat until gas costs exceed marginal returns

Effective deposit: ~5000 USDC (5x leverage)
Earning supply interest on 5000 USDC
Paying borrow interest on 4000 USDC
Net: Profitable when supply rewards > borrow cost
```

---

## Risks of Yield Farming

| Risk | Description | Mitigation |
|------|-------------|------------|
| Impermanent loss | LP value < holding tokens | Use correlated pairs, single-sided |
| Smart contract risk | Protocol gets hacked | Use audited protocols, diversify |
| Rug pull | Team drains funds | Check team, timelock, multisig |
| Token price decline | Reward tokens dump | Sell rewards regularly |
| Liquidation | Leveraged positions liquidated | Keep health factor > 2.0 |
| Gas costs | Compounding eats profits | Use auto-compounders or L2s |
| Regulatory | Protocol shut down | Diversify across jurisdictions |

### Red Flags to Watch For

```markdown
⚠️ Warning signs of unsustainable/scam farms:
- Anonymous team with no track record
- APY > 1000% with no explanation
- Unaudited contracts
- No timelock on admin functions
- Forked code with minimal changes
- Minting function with no cap
- Locked liquidity with short duration
- Aggressive marketing, no documentation
```

---

## Calculating Real Returns

```javascript
// Realistic yield farming calculator
function calculateRealYield({
  depositUsd,
  baseApy,        // Protocol APY (fees/interest)
  rewardApy,      // Token reward APY
  rewardTokenPriceChange, // Expected price change of reward token
  impermanentLoss,
  gasCostsPerYear,
  compoundFrequency,
}) {
  // Base yield (fees, interest)
  const baseReturn = depositUsd * baseApy;

  // Reward token yield (adjusted for price change)
  const rewardReturn = depositUsd * rewardApy * (1 + rewardTokenPriceChange);

  // Subtract costs
  const ilCost = depositUsd * impermanentLoss;
  const totalReturn = baseReturn + rewardReturn - ilCost - gasCostsPerYear;

  const realApy = totalReturn / depositUsd;
  return { totalReturn, realApy };
}

// Example: ETH/USDC LP with UNI rewards
const result = calculateRealYield({
  depositUsd: 10000,
  baseApy: 0.15,              // 15% from trading fees
  rewardApy: 0.30,            // 30% in UNI tokens
  rewardTokenPriceChange: -0.50, // UNI drops 50%
  impermanentLoss: 0.057,     // 5.7% IL (ETH doubles)
  gasCostsPerYear: 200,       // $200 in gas
  compoundFrequency: 7,       // Weekly compounds
});

console.log("Real return:", result.totalReturn.toFixed(2));
console.log("Real APY:", (result.realApy * 100).toFixed(1) + "%");
// Often much lower than advertised!
```

---

## Key Takeaways

- Yield farming maximizes returns by deploying assets across DeFi protocols
- Liquidity mining rewards users with governance tokens for providing liquidity
- APY includes compounding; APR does not — always compare the same metric
- High APYs are unsustainable — they decay as more capital enters the farm
- Auto-compounders (Yearn, Beefy) save gas and optimize compounding frequency
- Real yields are often much lower than advertised after accounting for IL, gas, and token dumps
- The biggest risks are smart contract exploits, rug pulls, and impermanent loss
- Start with low-risk strategies (stablecoin lending) before attempting complex yield farming
- Never invest more than you can afford to lose — DeFi is still experimental

---

## Next

[Back to Blockchain Course Overview](/courses/blockchain)
