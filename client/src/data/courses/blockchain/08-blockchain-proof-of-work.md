---
title: Proof of Work
---

## What is Proof of Work?

**Proof of Work (PoW)** is a consensus mechanism where miners compete to solve a computationally difficult puzzle. The first miner to find the solution earns the right to add the next block to the blockchain and receives a reward.

The "work" is the computational effort spent finding a valid hash. It's hard to produce but easy for others to verify — this asymmetry is what makes PoW secure.

```
Difficulty Target: Hash must start with "0000000..."

Miner's task: Find a nonce where
  SHA-256(block_header + nonce) < target

Easy to verify: Just hash once and check
Hard to find:   Must try billions of nonces
```

---

## How PoW Works

The core idea is simple: brute-force a hash until it meets difficulty requirements.

```
┌─────────────────────────────────────────────┐
│              BLOCK HEADER                     │
├─────────────────────────────────────────────┤
│  Previous block hash                         │
│  Merkle root of transactions                 │
│  Timestamp                                   │
│  Difficulty target                           │
│  Nonce ← MINER CHANGES THIS                 │
└─────────────────────────────────────────────┘
                    │
                    ▼
            SHA-256(SHA-256(header))
                    │
                    ▼
         Is hash < difficulty target?
            /              \
          NO                YES
          │                  │
    Try nonce + 1      BLOCK FOUND!
                       Broadcast to network
```

---

## Mining Process Step-by-Step

| Step | Action | Details |
|------|--------|---------|
| 1 | Collect transactions | Miner picks transactions from mempool |
| 2 | Build block header | Include previous hash, merkle root, timestamp |
| 3 | Set nonce = 0 | Starting point for search |
| 4 | Compute hash | SHA-256(SHA-256(block_header)) |
| 5 | Check difficulty | Is hash < target? |
| 6 | If NO → increment nonce | Try nonce = 1, 2, 3, ... |
| 7 | If YES → broadcast block | Announce solution to network |
| 8 | Network verifies | Other nodes check the hash (one computation) |
| 9 | Block accepted | Added to chain, miner gets reward |

**Example mining attempt:**

```
Target: 0000000000000000000fffffffffffffffffffffffffffffffffffffffffffffff

Nonce 0:     a3f8b2c1d4e5f6789012345678abcdef... (too high)
Nonce 1:     7c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f... (too high)
Nonce 2:     f1e2d3c4b5a6978685746352413f2e1d... (too high)
...
Nonce 4,891,234,567:
             00000000000000000004a3f2b1c0d9e8... (BELOW TARGET! ✓)

Winner! This nonce produces a valid hash.
```

---

## Difficulty Adjustment

The network automatically adjusts difficulty to maintain a target block time:

**Bitcoin's difficulty adjustment:**

| Parameter | Value |
|-----------|-------|
| Target block time | 10 minutes |
| Adjustment period | Every 2,016 blocks (~2 weeks) |
| Formula | New difficulty = Old × (2 weeks / actual time taken) |
| Maximum change | 4× increase or ¼ decrease per period |

```
If blocks came too fast (< 2 weeks for 2016 blocks):
  → Difficulty INCREASES (target gets smaller, more zeros needed)

If blocks came too slow (> 2 weeks for 2016 blocks):
  → Difficulty DECREASES (target gets larger, fewer zeros needed)

Timeline:
Week 1-2: 2016 blocks in 13 days (too fast!)
          → Difficulty increases by ~7%
Week 3-4: 2016 blocks in 14.5 days (close enough)
          → Slight adjustment
```

---

## Nonce Searching

The **nonce** (Number used ONCE) is a 32-bit field that miners iterate through:

```
Nonce space: 0 to 4,294,967,295 (2^32 - 1)

What if all nonces are exhausted without finding a valid hash?
  → Change the timestamp (1 second increment)
  → Change the coinbase transaction (extra nonce field)
  → Reorder transactions
  → This effectively creates a new block header to hash
```

**Modern mining speed:**

| Hardware | Hash Rate | Nonces per Second |
|----------|-----------|-------------------|
| CPU | ~20 MH/s | 20 million |
| GPU | ~800 MH/s | 800 million |
| ASIC (Antminer S19) | ~110 TH/s | 110 trillion |
| Bitcoin network total | ~500 EH/s | 500 quintillion |

---

## Energy Consumption

PoW's security comes at an energy cost:

| Metric | Approximate Value (2024) |
|--------|-------------------------|
| Bitcoin annual energy | ~150 TWh |
| Comparable to | Country of Poland |
| Energy per transaction | ~700 kWh |
| Carbon footprint | Debated (depends on energy mix) |
| Renewable percentage | ~50-60% (estimates vary) |

```
Why so much energy?
  More miners → More hashing → More electricity
  
  But the security budget (energy spent) is what makes
  attacking the network prohibitively expensive.
  
  To 51% attack Bitcoin, you'd need:
  - ~$15-20 billion in hardware
  - Electricity for 250+ EH/s
  - Access to chips that are sold out for years
```

---

## 51% Attack

If a single entity controls more than 50% of the network's hash power, they could:

```
Honest chain:    [A]─[B]─[C]─[D]─[E]
                              │
Attacker's chain:             └─[D']─[E']─[F']  (longer = wins)

The attacker can:
  ✗ Double-spend their own transactions
  ✗ Prevent other transactions from confirming
  ✗ Reverse recent transactions

The attacker CANNOT:
  ✗ Steal funds from other addresses (no private key)
  ✗ Create coins out of thin air (invalid blocks rejected)
  ✗ Change old history (too many blocks to redo)
```

**51% attack economics:**

| Factor | Reality |
|--------|---------|
| Cost to sustain | Millions per hour in electricity |
| Hardware needed | More than half the world's ASICs |
| Detection | Network would notice immediately |
| Consequence | Coin price crashes, attacker's investment loses value |
| Historical attacks | Ethereum Classic (2020), Bitcoin Gold (2018) — small chains |

---

## Bitcoin's PoW Specifics

| Feature | Bitcoin Implementation |
|---------|----------------------|
| Hash algorithm | SHA-256 (double: SHA-256(SHA-256(header))) |
| Block time | ~10 minutes |
| Block reward | 3.125 BTC (after 2024 halving) |
| Halving schedule | Every 210,000 blocks (~4 years) |
| Max supply | 21,000,000 BTC |
| Difficulty adjustment | Every 2,016 blocks |
| Block size | ~1-4 MB (with SegWit) |
| Transaction throughput | ~7 transactions per second |

**Block reward halving timeline:**

```
2009: 50 BTC per block
2012: 25 BTC per block
2016: 12.5 BTC per block
2020: 6.25 BTC per block
2024: 3.125 BTC per block
2028: 1.5625 BTC per block
...
~2140: Final bitcoin mined (fees only)
```

---

## Advantages and Disadvantages

| Advantages | Disadvantages |
|-----------|---------------|
| Battle-tested (15+ years for Bitcoin) | Enormous energy consumption |
| Extremely secure against attacks | Slow transaction processing |
| Simple and elegant design | Centralization of mining pools |
| No stake required to participate | Specialized hardware (ASICs) dominance |
| Proven track record | Environmental concerns |
| Sybil resistant | Wasted computation (losers' work is discarded) |

---

## Mining Pools

Individual miners have tiny odds of finding a block, so they form **pools** to share rewards:

```
Solo Mining:
  Your hash rate: 100 TH/s
  Network total:  500,000,000 TH/s (500 EH/s)
  Your odds:      0.00002% per block
  Expected block: Once every ~57 years

Pool Mining:
  Pool hash rate: 50,000,000 TH/s (10% of network)
  Pool finds:     ~14 blocks/day
  Your share:     Proportional to your contribution
  Expected pay:   Small amount every few hours
```

---

## Key Takeaways

- Proof of Work requires miners to find a hash below a target difficulty through brute force
- The process is intentionally hard to compute but trivial to verify (one hash check)
- Difficulty adjusts automatically to maintain consistent block times
- Energy consumption is the cost of security — it makes attacks prohibitively expensive
- A 51% attack requires majority hash power and is economically irrational on large networks
- Bitcoin uses double SHA-256 with 10-minute blocks and halving rewards every ~4 years
- Mining pools distribute rewards to make individual participation viable
- PoW's main criticism is energy waste — leading to alternatives like Proof of Stake

---

[Next: Proof of Stake](09-blockchain-proof-of-stake)
