---
title: Stablecoins
---

Stablecoins are cryptocurrencies designed to maintain a stable value — typically pegged 1:1 to the US Dollar. They bridge the gap between volatile crypto assets and stable fiat currencies, serving as the backbone of DeFi trading, lending, and payments.

---

## Why Are Stablecoins Needed?

| Problem | How Stablecoins Help |
|---------|---------------------|
| Crypto volatility | Provide a stable store of value on-chain |
| Fiat on/off ramps are slow | Instant transfers between protocols |
| Cross-border payments expensive | Cheap, fast international transfers |
| DeFi needs a unit of account | Price assets, denominate loans |
| Trading pairs | Trade crypto without converting to fiat |
| Payroll/invoicing | Pay in stable crypto values |

---

## Types of Stablecoins

| Type | Mechanism | Examples | Backing |
|------|-----------|----------|---------|
| Fiat-backed | Reserves held in banks | USDC, USDT | 1:1 USD reserves |
| Crypto-backed | Overcollateralized crypto | DAI, LUSD | 150%+ crypto collateral |
| Algorithmic | Supply/demand algorithms | (FRAX partially) | Code-based mechanisms |
| Hybrid | Combination of above | FRAX | Partial collateral + algo |

---

## Fiat-Backed: USDC and USDT

### USDC (Circle)

```
How USDC works:
1. User deposits $1,000 USD at Circle
2. Circle mints 1,000 USDC tokens on Ethereum
3. $1,000 held in regulated bank accounts / T-bills
4. User can redeem USDC → USD at any time
5. Circle burns redeemed USDC
```

| Feature | USDC | USDT |
|---------|------|------|
| Issuer | Circle | Tether |
| Market cap | ~$30B+ | ~$100B+ |
| Reserves | US Treasuries, cash | Commercial paper, loans, crypto |
| Attestations | Monthly (Grant Thornton) | Quarterly |
| Transparency | High | Controversial |
| Chains | 15+ chains | 15+ chains |
| Regulatory stance | Pro-regulation | Offshore |

### Using Stablecoins in JavaScript

```javascript
const { ethers } = require("ethers");

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = await provider.getSigner();
const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

// Check balance (USDC has 6 decimals, not 18!)
const balance = await usdc.balanceOf(signer.address);
console.log("USDC Balance:", ethers.formatUnits(balance, 6));

// Transfer 100 USDC
const tx = await usdc.transfer(
  recipientAddress,
  ethers.parseUnits("100", 6)
);
await tx.wait();
console.log("Sent 100 USDC!");
```

---

## Crypto-Backed: MakerDAO and DAI

DAI maintains its $1 peg through overcollateralization and a system of smart contracts called the Maker Protocol.

### Collateralized Debt Position (CDP) / Vault

```
How DAI is minted:
1. User deposits 10 ETH (@ $1,800 = $18,000) into a Maker Vault
2. Collateralization ratio required: 150%
3. Maximum DAI mintable: $18,000 / 1.5 = 12,000 DAI
4. User mints 8,000 DAI (225% collateralized — safer)
5. DAI is now in circulation, backed by locked ETH

To get ETH back:
1. Repay 8,000 DAI + stability fee (interest)
2. Maker Vault unlocks and returns 10 ETH
3. Repaid DAI is burned (destroyed)
```

```solidity
// Simplified CDP logic
contract SimplifiedVault {
    mapping(address => uint256) public collateral;  // ETH deposited
    mapping(address => uint256) public debt;        // DAI minted

    uint256 public constant MIN_COLLATERAL_RATIO = 150; // 150%

    function depositAndMint(uint256 daiAmount) external payable {
        collateral[msg.sender] += msg.value;

        uint256 collateralValue = msg.value * getEthPrice() / 1e18;
        uint256 maxDebt = collateralValue * 100 / MIN_COLLATERAL_RATIO;
        require(debt[msg.sender] + daiAmount <= maxDebt, "Undercollateralized");

        debt[msg.sender] += daiAmount;
        daiToken.mint(msg.sender, daiAmount);
    }

    function repayAndWithdraw(uint256 daiAmount, uint256 ethAmount) external {
        daiToken.burn(msg.sender, daiAmount);
        debt[msg.sender] -= daiAmount;

        // Check remaining position is still safe
        uint256 remainingCollateral = (collateral[msg.sender] - ethAmount) * getEthPrice() / 1e18;
        require(remainingCollateral * 100 / MIN_COLLATERAL_RATIO >= debt[msg.sender], "Unsafe");

        collateral[msg.sender] -= ethAmount;
        payable(msg.sender).transfer(ethAmount);
    }
}
```

### How DAI Maintains Its Peg

| Mechanism | When DAI > $1 | When DAI < $1 |
|-----------|---------------|---------------|
| DSR (Dai Savings Rate) | Decrease DSR → less demand | Increase DSR → more demand |
| Stability fee | Decrease → more DAI minted | Increase → DAI repaid/burned |
| Arbitrage | Mint DAI, sell for >$1 | Buy DAI cheap, repay debt |
| PSM (Peg Stability Module) | Swap USDC→DAI at $1 | Swap DAI→USDC at $1 |

---

## Algorithmic Stablecoins

Algorithmic stablecoins attempt to maintain their peg using supply/demand mechanics without full collateral backing.

```
Typical mechanism:
  Price > $1 → Mint more tokens (increase supply, reduce price)
  Price < $1 → Burn tokens or incentivize buying (reduce supply, increase price)
```

### The Problem with Pure Algorithmic Stablecoins

They rely on confidence. If confidence breaks, a "death spiral" can occur:

```
Death Spiral:
1. Price drops slightly below $1
2. Holders panic-sell
3. Algorithm mints governance token to absorb selling
4. Governance token dumps (dilution)
5. Less confidence in the system
6. More selling of stablecoin
7. Repeat until collapse → price → $0
```

---

## Terra/UST Collapse: A $40B Lesson

In May 2022, TerraUSD (UST) — a $20B algorithmic stablecoin — collapsed to near zero, taking its sister token LUNA with it.

### How UST Worked

```
UST Peg Mechanism:
  Mint 1 UST by burning $1 worth of LUNA
  Burn 1 UST to receive $1 worth of LUNA

  UST < $1 → Arbitrageurs burn UST, mint LUNA (reduces UST supply)
  UST > $1 → Arbitrageurs burn LUNA, mint UST (increases UST supply)
```

### What Went Wrong

| Stage | Event | Impact |
|-------|-------|--------|
| 1 | Large UST withdrawals from Anchor | Selling pressure on UST |
| 2 | UST drops to $0.98 | Mild depeg, panic begins |
| 3 | Arbitrageurs burn UST → mint LUNA | LUNA supply explodes |
| 4 | LUNA dumps from dilution | "Backing" disappears |
| 5 | Confidence completely breaks | Bank run on UST |
| 6 | UST → $0.02, LUNA → $0.00 | $40B destroyed |

### Lessons Learned

- Algorithmic pegs depend entirely on market confidence
- Reflexive mechanisms (mint/burn) can amplify crashes
- "Code is law" doesn't override market economics
- Offering unsustainable yields (Anchor's 20% APY) attracted hot money
- Size doesn't equal safety — UST was top 3 stablecoin before collapse

---

## Depegging Risks

Even collateralized stablecoins can briefly depeg:

| Event | Stablecoin | Depeg | Duration | Cause |
|-------|-----------|-------|----------|-------|
| Mar 2023 | USDC | $0.87 | 3 days | SVB bank collapse ($3.3B stuck) |
| May 2022 | UST | $0.00 | Permanent | Algorithmic death spiral |
| Nov 2022 | DAI | $0.97 | Hours | USDC depeg (DAI holds USDC) |
| Mar 2020 | DAI | $1.10 | Days | Black Thursday, ETH crash |

---

## Regulatory Landscape

| Region | Approach | Status |
|--------|----------|--------|
| USA | MiCA-like framework proposed | Evolving (SEC/CFTC oversight) |
| EU | MiCA regulation | Active (reserve requirements) |
| Singapore | Payment Services Act | Licensed |
| Hong Kong | HKMA framework | Developing |
| Global | FATF guidelines | Compliance pressure |

Key regulatory requirements emerging:
- Full reserve backing and regular audits
- Redemption rights for holders
- Adequate capital buffers
- AML/KYC for issuers
- Restrictions on algorithmic models

---

## Choosing a Stablecoin

| Priority | Best Option | Why |
|----------|-------------|-----|
| Maximum safety | USDC | Regulated, transparent reserves |
| Decentralization | DAI | Crypto-backed, governance |
| Liquidity | USDT | Largest by market cap |
| DeFi composability | DAI or USDC | Widely integrated |
| Censorship resistance | LUSD | Fully ETH-backed, immutable |

---

## Key Takeaways

- Stablecoins maintain a ~$1 value and are essential for DeFi, trading, and payments
- Fiat-backed (USDC/USDT) are simplest: $1 in reserves per token minted
- Crypto-backed (DAI) use overcollateralization — deposit $150 of ETH to mint $100 DAI
- Algorithmic stablecoins (UST) rely on confidence and can death-spiral to zero
- The Terra/UST collapse ($40B lost) proved pure algorithmic pegs are fragile
- Even safe stablecoins can briefly depeg during market stress (USDC/SVB)
- Regulation is tightening globally — reserve requirements and transparency are becoming mandatory
- Diversify stablecoin holdings across types and issuers to reduce risk

---

## Next

[Yield Farming & Liquidity Mining](/courses/blockchain/40-blockchain-yield-farming)
