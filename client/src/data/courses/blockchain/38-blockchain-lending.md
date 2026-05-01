---
title: Lending & Borrowing Protocols
---

DeFi lending protocols allow users to earn interest by supplying assets and borrow against their crypto holdings — all without banks, credit checks, or paperwork. Protocols like Aave and Compound pioneered algorithmic interest rates governed entirely by smart contracts.

---

## How DeFi Lending Works

Unlike traditional loans, DeFi lending is:

1. **Overcollateralized** — you must deposit more than you borrow
2. **Permissionless** — no credit score or application
3. **Instant** — borrow/repay in a single transaction
4. **Liquidatable** — your collateral is sold if its value drops too low

```
Supplier Flow:
  Deposit 10,000 USDC → Receive aUSDC (interest-bearing) → Earn ~3-5% APY

Borrower Flow:
  Deposit 2 ETH (collateral) → Borrow up to 80% value in USDC → Pay interest
```

| Aspect | Traditional Lending | DeFi Lending |
|--------|-------------------|--------------|
| Collateral | Often none (credit-based) | Always overcollateralized |
| Approval time | Days to weeks | Instant |
| Credit check | Required | None |
| Interest rate | Fixed by bank | Algorithmic, variable |
| Liquidation | Court process | Automatic smart contract |
| Operating hours | Business hours | 24/7 |
| Minimum amount | Often $1,000+ | Any amount |

---

## Overcollateralization

Because there's no credit check or identity, borrowers must deposit collateral worth MORE than their loan.

```
Example:
  Collateral deposited: 10 ETH @ $1,800 = $18,000
  Collateral factor: 80%
  Maximum borrow: $18,000 × 80% = $14,400

  You borrow: $10,000 USDC
  Your collateral ratio: $18,000 / $10,000 = 180%
```

| Asset | Typical Collateral Factor | Max LTV |
|-------|--------------------------|---------|
| ETH | 80-82.5% | 80% |
| WBTC | 70-75% | 70% |
| USDC | 85-87% | 85% |
| LINK | 65-70% | 65% |
| Volatile altcoins | 50-60% | 50% |

---

## Liquidation

When your collateral value drops below the required ratio, liquidators can repay part of your debt and seize your collateral at a discount.

```solidity
// Simplified liquidation logic
function liquidate(address borrower, uint256 repayAmount) external {
    // Check if borrower is undercollateralized
    uint256 healthFactor = getHealthFactor(borrower);
    require(healthFactor < 1e18, "Position is healthy");

    // Liquidator repays part of the debt
    debtToken.transferFrom(msg.sender, address(this), repayAmount);

    // Liquidator receives collateral + bonus (typically 5-10%)
    uint256 collateralSeized = repayAmount * (100 + liquidationBonus) / 100;
    collateralToken.transfer(msg.sender, collateralSeized);

    // Update borrower's position
    borrowerDebt[borrower] -= repayAmount;
    borrowerCollateral[borrower] -= collateralSeized;
}
```

### Liquidation Example

```
Initial position:
  Collateral: 10 ETH @ $1,800 = $18,000
  Debt: $14,000 USDC
  Health Factor: 1.03 (barely safe)

ETH drops to $1,600:
  Collateral value: 10 × $1,600 = $16,000
  Health Factor: 0.91 (LIQUIDATABLE!)

Liquidator action:
  Repays: $7,000 of debt
  Receives: $7,000 × 1.05 = $7,350 worth of ETH (4.59 ETH)
  Liquidator profit: $350

After liquidation:
  Remaining collateral: 5.41 ETH ($8,656)
  Remaining debt: $7,000
  New Health Factor: 0.99 → still at risk!
```

---

## Aave Mechanics

Aave is the largest lending protocol by TVL, operating across multiple chains.

| Feature | Description |
|---------|-------------|
| aTokens | Interest-bearing receipt (aUSDC, aETH) |
| Variable rate | Changes with utilization |
| Stable rate | Semi-fixed, can be rebalanced |
| Flash loans | Uncollateralized single-tx loans |
| E-mode | Higher LTV for correlated assets |
| Isolation mode | Risk containment for new assets |

```javascript
// Supply assets to Aave V3
const { ethers } = require("ethers");

const poolAddress = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"; // Aave V3 Pool
const poolAbi = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)",
  "function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf)",
  "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
];

const pool = new ethers.Contract(poolAddress, poolAbi, signer);

// Supply 1000 USDC
await usdc.approve(poolAddress, ethers.parseUnits("1000", 6));
await pool.supply(USDC_ADDRESS, ethers.parseUnits("1000", 6), signer.address, 0);

// Check account health
const accountData = await pool.getUserAccountData(signer.address);
console.log("Health Factor:", ethers.formatUnits(accountData.healthFactor, 18));
console.log("Available to borrow:", ethers.formatUnits(accountData.availableBorrowsBase, 8), "USD");
```

---

## Compound Mechanics

Compound pioneered DeFi lending with cTokens — interest-bearing tokens whose exchange rate grows over time.

```javascript
// Supply ETH to Compound V2
const cEthAddress = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";
const cEthAbi = [
  "function mint() payable",
  "function redeem(uint256 redeemTokens) returns (uint256)",
  "function exchangeRateCurrent() view returns (uint256)",
];

const cEth = new ethers.Contract(cEthAddress, cEthAbi, signer);

// Supply 1 ETH
await cEth.mint({ value: ethers.parseEther("1") });

// Check exchange rate (grows over time as interest accrues)
const rate = await cEth.exchangeRateCurrent();
console.log("Exchange rate:", ethers.formatUnits(rate, 28));
```

---

## Interest Rate Models

Interest rates are determined algorithmically based on pool utilization:

```
Utilization Rate = Total Borrows / Total Deposits

When utilization is LOW:  → Low rates (incentivize borrowing)
When utilization is HIGH: → High rates (incentivize supplying, discourage borrowing)
```

| Utilization | Supply APY | Borrow APY | Market Signal |
|-------------|-----------|------------|---------------|
| 10% | 0.2% | 2.0% | Low demand, excess supply |
| 50% | 1.5% | 5.0% | Balanced market |
| 80% | 4.0% | 8.0% | High demand (optimal) |
| 95% | 15.0% | 35.0% | Critical — kink rate kicks in |

### The Kink Model

```
Rate below kink (e.g., 80% utilization):
  Borrow Rate = Base Rate + (Utilization × Slope1)

Rate above kink:
  Borrow Rate = Base Rate + (Kink × Slope1) + ((Utilization - Kink) × Slope2)
  
  Slope2 >> Slope1 (steep increase above kink)
```

This creates a sharp rate increase above the optimal utilization, incentivizing repayment.

---

## Supply vs Borrow APY

| Metric | Meaning | Who Earns/Pays |
|--------|---------|----------------|
| Supply APY | Interest earned on deposits | Suppliers earn |
| Borrow APY | Interest paid on loans | Borrowers pay |
| Net APY | Supply APY - protocol fee | What you actually get |
| Spread | Borrow APY - Supply APY | Protocol revenue |

```
Why Supply APY < Borrow APY:
  - Not all deposits are borrowed (idle capital)
  - Protocol takes a reserve factor (10-20%)
  
  Supply APY ≈ Borrow APY × Utilization × (1 - Reserve Factor)
```

---

## Health Factor

The health factor determines how safe your position is:

```
Health Factor = (Collateral Value × Liquidation Threshold) / Total Debt

HF > 1.0: Safe (cannot be liquidated)
HF = 1.0: Liquidation threshold (partial liquidation begins)
HF < 1.0: Undercollateralized (actively being liquidated)
```

| Health Factor | Risk Level | Recommendation |
|---------------|-----------|----------------|
| > 2.0 | Very safe | Conservative position |
| 1.5 - 2.0 | Safe | Moderate risk |
| 1.1 - 1.5 | Risky | Consider adding collateral |
| 1.0 - 1.1 | Dangerous | Liquidation imminent |
| < 1.0 | Liquidatable | Being liquidated |

---

## Flash Loans

Flash loans are uncollateralized loans that must be repaid within the same transaction. If not repaid, the entire transaction reverts.

```solidity
// Flash loan example: arbitrage between two DEXs
contract FlashLoanExample {
    function executeFlashLoan(uint256 amount) external {
        // Borrow from Aave — no collateral needed!
        aavePool.flashLoanSimple(address(this), USDC, amount, "", 0);
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium, // 0.05% fee
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        // Use the borrowed funds for arbitrage, liquidation, etc.
        // ...

        // Must repay amount + premium, or entire tx reverts
        uint256 amountOwed = amount + premium;
        IERC20(asset).approve(address(aavePool), amountOwed);
        return true;
    }
}
```

---

## Key Takeaways

- DeFi lending is overcollateralized, permissionless, and instant
- Interest rates are algorithmic — high utilization means high rates
- The health factor (> 1.0) determines whether a position can be liquidated
- Liquidators earn a bonus for repaying undercollateralized debt
- Supply APY is always lower than borrow APY due to idle capital and protocol fees
- Flash loans enable uncollateralized borrowing within a single transaction
- Always monitor your health factor — price drops can trigger liquidation quickly
- Use protocols with proven track records (Aave, Compound) and start with small amounts

---

## Next

[Stablecoins](/courses/blockchain/39-blockchain-stablecoins)
