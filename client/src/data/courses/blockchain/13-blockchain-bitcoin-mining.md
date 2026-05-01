---
title: Bitcoin Mining
---

## What is Bitcoin Mining?

Bitcoin mining is the process of adding new blocks to the blockchain by solving a computationally intensive cryptographic puzzle (Proof of Work). Miners compete to find a valid block hash, and the winner earns the block reward plus transaction fees.

---

## How Mining Works

```text
1. Collect pending transactions from the mempool
2. Construct a candidate block with a coinbase transaction (reward)
3. Pick a nonce (random number)
4. Hash the block header: SHA-256(SHA-256(header))
5. Check if hash < target difficulty
   - If NO  → increment nonce, go to step 4
   - If YES → broadcast the valid block to the network
```

The target difficulty determines how many leading zeros the hash must have:

```text
Valid hash example:
0000000000000000000a3b8c...  (many leading zeros = very difficult)

Invalid hash example:
0003f8a9b2c1d4e5f6...       (not enough leading zeros)
```

---

## Hardware Evolution

Bitcoin mining hardware has evolved through four generations:

| Generation | Hardware | Era | Hash Rate | Power Efficiency |
|-----------|----------|-----|-----------|-----------------|
| 1st | CPU | 2009–2010 | ~10 MH/s | Very poor |
| 2nd | GPU | 2010–2013 | ~800 MH/s | Poor |
| 3rd | FPGA | 2011–2013 | ~1 GH/s | Moderate |
| 4th | ASIC | 2013–present | 100+ TH/s | Best |

### ASIC (Application-Specific Integrated Circuit)

Modern ASICs are purpose-built chips designed solely for SHA-256 hashing:

```text
Example: Antminer S21 Pro (2024)
  Hash Rate:    234 TH/s
  Power:        3,531 W
  Efficiency:   15.0 J/TH
  Price:        ~$5,000–$8,000
```

---

## Block Reward & Halving Schedule

Miners receive new bitcoins through the **coinbase transaction** — the first transaction in every block.

| Halving | Block Range | Reward | Total New BTC |
|---------|------------|--------|---------------|
| Pre-halving | 0 – 209,999 | 50 BTC | 10,500,000 |
| 1st | 210,000 – 419,999 | 25 BTC | 5,250,000 |
| 2nd | 420,000 – 629,999 | 12.5 BTC | 2,625,000 |
| 3rd | 630,000 – 839,999 | 6.25 BTC | 1,312,500 |
| 4th | 840,000 – 1,049,999 | 3.125 BTC | 656,250 |

After all halvings complete (~year 2140), miners will rely solely on transaction fees.

---

## Difficulty Adjustment

Bitcoin automatically adjusts mining difficulty every **2,016 blocks** (~2 weeks) to maintain a target block time of ~10 minutes:

```text
New Difficulty = Old Difficulty × (2016 blocks × 10 min) / Actual Time Taken

If blocks were mined too fast → difficulty increases
If blocks were mined too slow → difficulty decreases
```

| Scenario | Actual Time | Adjustment |
|----------|------------|------------|
| Blocks too fast | < 14 days | Difficulty increases (up to 4×) |
| Blocks on target | ~14 days | No change |
| Blocks too slow | > 14 days | Difficulty decreases (max 0.25×) |

This self-regulating mechanism ensures consistent block production regardless of total network hash rate.

---

## Mining Pools

Solo mining is impractical for individuals today. Mining pools allow miners to combine hash power and share rewards:

```text
Solo Mining:
  You: 100 TH/s vs Network: 500,000,000 TH/s
  Chance of finding block: 0.00002%
  Expected time between blocks: ~570 years

Pool Mining:
  Pool: 50,000,000 TH/s (10% of network)
  Pool finds ~14.4 blocks/day
  Your share: proportional to contributed hash rate
```

### Common Reward Methods

| Method | Description |
|--------|-------------|
| PPS (Pay Per Share) | Fixed payment per valid share submitted |
| PPLNS (Pay Per Last N Shares) | Reward based on shares in the last N shares window |
| FPPS (Full Pay Per Share) | PPS + estimated transaction fee share |

### Major Mining Pools (2024)

| Pool | Approximate Hash Share |
|------|----------------------|
| Foundry USA | ~30% |
| AntPool | ~15% |
| F2Pool | ~12% |
| ViaBTC | ~11% |
| Binance Pool | ~8% |

---

## Profitability Factors

| Factor | Impact |
|--------|--------|
| Hash rate | Higher = more shares/blocks found |
| Electricity cost | Largest ongoing expense ($/kWh) |
| Hardware efficiency | J/TH — lower is better |
| Bitcoin price | Revenue denominated in USD |
| Difficulty | Higher difficulty = less BTC per hash |
| Pool fees | Typically 1–3% of rewards |
| Cooling costs | Significant in warm climates |

### Simple Profitability Calculation

```text
Daily Revenue = (Your Hash Rate / Network Hash Rate) × Daily Block Rewards
Daily Cost    = Power Consumption (kW) × 24 hours × Electricity Rate ($/kWh)
Daily Profit  = Daily Revenue - Daily Cost
```

---

## Environmental Debate

Bitcoin mining's energy consumption is a significant topic of discussion:

| Perspective | Argument |
|-------------|----------|
| Critics | High energy use (~150 TWh/year); carbon footprint |
| Proponents | Increasingly renewable (~60% sustainable energy); incentivizes stranded energy use |
| Nuance | Comparison to banking system energy use; mining as grid stabilizer |

Many miners now locate near renewable energy sources (hydroelectric, solar, wind) or capture flared natural gas.

---

## Key Takeaways

- Mining secures the Bitcoin network through Proof of Work (SHA-256 hashing)
- Hardware evolved from CPUs to specialized ASICs over 4 generations
- Block rewards halve every 210,000 blocks; miners increasingly rely on fees
- Difficulty adjusts every 2,016 blocks to maintain ~10-minute block times
- Mining pools make participation viable for individual miners
- Profitability depends on hardware efficiency, electricity costs, and Bitcoin price
- The environmental impact is debated but trending toward renewable energy sources

---

## Next

[Bitcoin Wallets & Addresses →](14-blockchain-bitcoin-wallets)
