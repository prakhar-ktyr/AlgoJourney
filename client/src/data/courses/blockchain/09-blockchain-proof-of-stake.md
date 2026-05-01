---
title: Proof of Stake
---

## What is Proof of Stake?

**Proof of Stake (PoS)** is a consensus mechanism where validators are chosen to create new blocks based on the amount of cryptocurrency they have "staked" (locked up) as collateral. Instead of competing with computational power, validators put their money at risk.

The core principle: if you have something valuable locked up, you're incentivized to act honestly — because misbehavior means losing your stake.

```
Proof of Work:   Spend ELECTRICITY to earn the right to add blocks
Proof of Stake:  Lock up MONEY to earn the right to add blocks

PoW: "I burned $10,000 in electricity, trust my block"
PoS: "I locked $50,000 at risk, trust my block"
```

---

## Validators vs Miners

| Aspect | Miners (PoW) | Validators (PoS) |
|--------|-------------|------------------|
| Selection method | First to solve puzzle | Chosen by protocol (weighted random) |
| Resource spent | Electricity + hardware | Locked capital (stake) |
| Equipment needed | ASICs, GPUs | Standard computer + internet |
| Entry barrier | Expensive hardware | Minimum stake amount |
| Revenue source | Block reward + fees | Staking reward + fees |
| Punishment | Wasted electricity | Stake gets slashed |
| Environmental impact | Very high | Minimal |
| Ongoing cost | Electricity bills | Opportunity cost of locked funds |

---

## How PoS Works

```
┌───────────────────────────────────────────────────┐
│              PROOF OF STAKE PROCESS                 │
├───────────────────────────────────────────────────┤
│                                                    │
│  1. Validators deposit stake (e.g., 32 ETH)       │
│          │                                         │
│          ▼                                         │
│  2. Protocol selects proposer (pseudo-random)      │
│     Weighted by: stake size, time staked, etc.     │
│          │                                         │
│          ▼                                         │
│  3. Proposer creates and broadcasts block          │
│          │                                         │
│          ▼                                         │
│  4. Other validators attest (vote on validity)     │
│          │                                         │
│          ▼                                         │
│  5. 2/3+ attestations → Block finalized            │
│          │                                         │
│          ▼                                         │
│  6. Proposer + attesters receive rewards           │
│     Misbehavior → Stake slashed                    │
│                                                    │
└───────────────────────────────────────────────────┘
```

---

## Staking Mechanics

### How Staking Works

| Component | Description |
|-----------|-------------|
| **Minimum stake** | Amount required to become a validator (32 ETH for Ethereum) |
| **Lock-up period** | Stake cannot be withdrawn immediately (varies by protocol) |
| **Selection weight** | More stake = higher chance of being chosen |
| **Reward rate** | Annual percentage yield on staked amount (3-15% typical) |
| **Unbonding period** | Time to wait before withdrawing (days to weeks) |

### Staking Example (Ethereum)

```
Alice stakes: 32 ETH
Bob stakes:   64 ETH (2 validators)
Carol stakes: 32 ETH

Total staked: 128 ETH across 4 validator slots

Selection probability per slot:
  Alice: 32/128 = 25%
  Bob:   64/128 = 50% (two slots)
  Carol: 32/128 = 25%

Annual rewards: ~4-5% APR
  Alice earns: ~1.4 ETH/year
  Bob earns:   ~2.8 ETH/year
  Carol earns:  ~1.4 ETH/year
```

### Liquid Staking

For users who don't want to lock up 32 ETH or run a validator:

```
User deposits ETH → Staking Protocol (Lido, Rocket Pool)
                  → Receives stETH/rETH (liquid token)
                  → Can use in DeFi while earning rewards
                  → Protocol runs validators with pooled funds
```

---

## Slashing Conditions

**Slashing** is the penalty for validator misbehavior — part or all of the stake is destroyed:

| Offense | Penalty | Description |
|---------|---------|-------------|
| **Double voting** | Severe slash (1+ ETH) | Voting for two different blocks at same height |
| **Surround voting** | Severe slash | Making contradictory attestations |
| **Prolonged inactivity** | Gradual leak | Being offline when needed (inactivity penalty) |
| **Proposer equivocation** | Severe slash | Proposing two blocks for same slot |

```
Normal operation:
  Validator online → Attests correctly → Earns reward (+0.001 ETH)

Misbehavior detected:
  Double voting found → SLASH! → Lose 1-32 ETH
  
Correlation penalty:
  If many validators misbehave simultaneously:
  → Slash increases proportionally
  → Prevents coordinated attacks
  → Maximum: lose entire 32 ETH stake
```

---

## Nothing-at-Stake Problem

This is the classic theoretical attack against PoS:

**The problem:** In PoW, mining on multiple forks costs real electricity. In PoS, voting on multiple forks costs nothing extra — validators might vote on every fork to maximize rewards.

```
                    Fork A: [Block X]───[Block Y]
Main chain: ───────┤
                    Fork B: [Block X']──[Block Y']

PoW miner: Must choose ONE fork (can't mine both efficiently)
PoS naive:  Can validate BOTH forks for free (nothing at stake)
```

**Solutions implemented:**

| Solution | How It Works |
|----------|-------------|
| **Slashing** | Validators caught voting on multiple forks lose their stake |
| **Finality gadgets** | Once finalized, blocks cannot be reverted |
| **Checkpoints** | Periodic irreversible checkpoints prevent long-range attacks |
| **Weak subjectivity** | New nodes must start from a recent trusted checkpoint |

---

## PoW vs PoS Comparison

| Criteria | Proof of Work | Proof of Stake |
|----------|--------------|----------------|
| Energy usage | ~150 TWh/year (Bitcoin) | ~0.01 TWh/year (Ethereum) |
| Hardware | Specialized ASICs | Consumer hardware |
| Security model | Energy expenditure | Economic stake |
| Attack cost | Buy 51% hash power | Buy 33-51% of total stake |
| Finality | Probabilistic (~60 min) | Economic (~15 min) |
| TPS | ~7 (Bitcoin) | ~30 (Ethereum base layer) |
| Centralization risk | Mining pools, ASIC manufacturers | Large stakers, exchanges |
| Minimum to participate | Thousands (ASIC) | 32 ETH (~$50K+ varies) |
| Sybil resistance | Expensive to fake work | Expensive to fake stake |
| Environmental | Criticized heavily | Environmentally friendly |
| Track record | 15+ years (Bitcoin) | ~3 years (Ethereum post-Merge) |
| Revenue model | Block reward + fees | Staking reward + fees |

---

## Ethereum's Merge

On September 15, 2022, Ethereum transitioned from PoW to PoS in an event called **The Merge**:

```
Before Merge (PoW):          After Merge (PoS):
  Execution Layer               Execution Layer
  (transactions,                (transactions,
   smart contracts)              smart contracts)
       +                              +
  PoW Mining                    Beacon Chain (PoS)
  (miners solve puzzles)        (validators stake ETH)
```

**Key statistics from The Merge:**

| Metric | Before (PoW) | After (PoS) | Change |
|--------|-------------|-------------|--------|
| Energy consumption | ~78 TWh/year | ~0.01 TWh/year | -99.95% |
| New ETH issued/day | ~13,000 ETH | ~1,700 ETH | -87% |
| Hardware needed | GPUs/ASICs | Regular PC | Much less |
| Block time | ~13 seconds | 12 seconds | Consistent |
| Validators | 0 | 500,000+ | New role |
| Finality | ~6 minutes | ~15 minutes | Different model |

---

## Validator Lifecycle

```
1. DEPOSIT (32 ETH)
   │
   ▼
2. PENDING (wait in activation queue)
   │  Queue time depends on how many are joining
   ▼
3. ACTIVE (proposing + attesting)
   │  Earning rewards, subject to penalties
   │
   ├── If misbehave → SLASHED → forced exit
   │
   ▼
4. VOLUNTARY EXIT (request to leave)
   │
   ▼
5. EXITING (waiting period)
   │
   ▼
6. WITHDRAWABLE (can withdraw funds)
```

---

## Advantages and Disadvantages of PoS

| Advantages | Disadvantages |
|-----------|---------------|
| 99.95% less energy than PoW | "Rich get richer" concern |
| Lower barrier to entry (no ASICs) | Less battle-tested than PoW |
| Economic penalties deter attacks | Nothing-at-stake (needs slashing) |
| Faster finality possible | Long-range attack vulnerability |
| More scalable (easier to shard) | Minimum stake can be expensive |
| Aligns incentives (validators own the asset) | Complexity of implementation |

---

## Key Takeaways

- Proof of Stake replaces energy expenditure with economic stake as the security mechanism
- Validators lock cryptocurrency as collateral and are chosen to propose blocks based on stake weight
- Slashing destroys a validator's stake for provably malicious behavior (double voting, equivocation)
- The nothing-at-stake problem is solved through slashing conditions and finality gadgets
- PoS uses ~99.95% less energy than PoW while maintaining strong security guarantees
- Ethereum's Merge (Sept 2022) was the largest PoW-to-PoS transition in history
- Tradeoffs: PoS is faster and greener but has different centralization risks and a shorter track record

---

[Next: Other Consensus Algorithms](10-blockchain-other-consensus)
