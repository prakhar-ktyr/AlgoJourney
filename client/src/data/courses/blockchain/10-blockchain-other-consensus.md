---
title: Other Consensus Algorithms
---

## Beyond PoW and PoS

While Proof of Work and Proof of Stake are the most well-known consensus mechanisms, many other algorithms have been developed to solve specific problems or optimize for particular use cases. Each makes different tradeoffs between decentralization, speed, and security.

---

## Delegated Proof of Stake (DPoS)

**Used by:** EOS, TRON, BitShares, Lisk

DPoS is a democratic variation of PoS where token holders vote to elect a fixed number of **delegates** (block producers) who take turns producing blocks.

```
Token Holders (millions of voters)
       │
       ▼ VOTE (weight = tokens held)
       │
┌──────────────────────────────────┐
│  Elected Delegates (21 in EOS)   │
│  [D1] [D2] [D3] ... [D21]       │
│                                   │
│  Round-robin block production:    │
│  D1 → D2 → D3 → ... → D21 → D1 │
│  (0.5 sec per block)             │
└──────────────────────────────────┘
```

**How it works:**

| Step | Action |
|------|--------|
| 1 | Token holders vote for delegate candidates |
| 2 | Top N candidates become active block producers |
| 3 | Delegates take turns in a fixed schedule |
| 4 | If a delegate misses their slot, they may be voted out |
| 5 | Voters can change votes at any time |

**Advantages and Disadvantages:**

| Advantages | Disadvantages |
|-----------|---------------|
| Very fast (0.5-3 sec blocks) | Only 21 block producers (centralized) |
| High throughput (thousands TPS) | Voter apathy (low participation) |
| Democratic governance | Cartels and vote buying possible |
| Energy efficient | Rich voters have more power |

---

## Practical Byzantine Fault Tolerance (PBFT)

**Used by:** Hyperledger Fabric, Tendermint/CometBFT, Zilliqa

PBFT is designed for permissioned networks where participants are known. It achieves consensus through multiple rounds of voting and tolerates up to 1/3 malicious nodes.

```
PBFT Phases:

Client → Leader: "Process this transaction"

Phase 1 - PRE-PREPARE:
  Leader broadcasts proposal to all replicas
  Leader → [R1, R2, R3, R4]

Phase 2 - PREPARE:
  Each replica broadcasts PREPARE to all others
  Need 2/3 agreement (2f+1 where f = faulty nodes)
  R1 ↔ R2 ↔ R3 ↔ R4

Phase 3 - COMMIT:
  Each replica broadcasts COMMIT to all others
  Need 2/3 agreement again
  R1 ↔ R2 ↔ R3 ↔ R4

Result: Transaction committed with ABSOLUTE finality
```

**Fault tolerance:**

```
Total nodes (n) = 3f + 1 (where f = max faulty nodes)

4 nodes  → tolerates 1 fault
7 nodes  → tolerates 2 faults
10 nodes → tolerates 3 faults
100 nodes → tolerates 33 faults
```

| Advantages | Disadvantages |
|-----------|---------------|
| Absolute finality (no forks) | Doesn't scale well (O(n²) messages) |
| Fast for small networks | Requires known participants |
| Energy efficient | Not suitable for public blockchains |
| Low latency (~1-5 seconds) | Leader can be a bottleneck |

---

## Proof of Authority (PoA)

**Used by:** VeChain, private Ethereum networks (Clique), testnets (Goerli, Rinkeby)

In PoA, a set of pre-approved validators (authorities) produce blocks. Their real-world identity and reputation serve as the "stake."

```
Approved Authorities:
  [Company A] [Company B] [Company C] [Company D] [Company E]
     Known identity — reputation at stake

Block production schedule:
  Slot 1: Company A
  Slot 2: Company B
  Slot 3: Company C
  ...
  (Round-robin rotation)

No mining, no staking — just reputation-based trust
```

| Feature | Details |
|---------|---------|
| Validators | Pre-approved, identity known |
| Security model | Reputation and legal accountability |
| Block time | 3-5 seconds typically |
| Throughput | Very high (hundreds of TPS) |
| Best for | Enterprise, consortium, testnets |
| Decentralization | Very low (by design) |

---

## Proof of History (PoH)

**Used by:** Solana

Proof of History is not a full consensus mechanism but a **cryptographic clock** that establishes a verifiable ordering of events. It's combined with PoS for actual consensus.

```
Traditional blockchain:
  "When did this transaction happen?"
  → Need to ask other nodes and agree on time

Proof of History:
  SHA-256(prev_hash) → new_hash → SHA-256(new_hash) → ...
  
  Each hash depends on the previous one
  → Creates a verifiable sequence (passage of time)
  → No need to communicate with other nodes about ordering

Hash Chain (VDF - Verifiable Delay Function):
  H1 = SHA-256(seed)           | timestamp: T0
  H2 = SHA-256(H1)            | timestamp: T0 + Δ
  H3 = SHA-256(H2)            | timestamp: T0 + 2Δ
  ...
  Hn = SHA-256(Hn-1)          | timestamp: T0 + (n-1)Δ
  
  Events are inserted into this sequence:
  H1 → H2 → [TX_A] → H3 → H4 → [TX_B] → H5
  
  We KNOW TX_A happened before TX_B (provably)
```

**Solana's combined approach:**

| Component | Role |
|-----------|------|
| Proof of History | Orders transactions (cryptographic clock) |
| Tower BFT | Consensus (PoS-based voting with PoH as clock) |
| Gulf Stream | Transaction forwarding |
| Turbine | Block propagation |

| Advantages | Disadvantages |
|-----------|---------------|
| Extremely fast (400ms blocks) | High hardware requirements for validators |
| 65,000+ TPS theoretical | Network outages (less battle-tested) |
| Low fees | Centralization concerns |
| Verifiable time without communication | Complex architecture |

---

## Proof of Burn (PoB)

**Used by:** Slimcoin, Counterparty (for initial distribution)

Validators "burn" (permanently destroy) coins by sending them to an unspendable address. The more you burn, the higher your chance of being selected.

```
Burn Process:
  Send coins → Unspendable address (e.g., 0x000...dead)
  
  These coins are GONE FOREVER
  In return, you get "virtual mining power"
  
  Burn more → Higher selection probability → Earn block rewards

Think of it as:
  PoW:  Burn electricity → Earn blocks
  PoB:  Burn coins → Earn blocks (simulated mining)
```

| Advantages | Disadvantages |
|-----------|---------------|
| No ongoing energy cost | Wasteful (coins destroyed permanently) |
| Simulates mining without hardware | Favors wealthy participants |
| Bootstrap mechanism for new chains | Less proven in production |
| Reduces circulating supply | Complex economics |

---

## Comparison Table: All Consensus Mechanisms

| Mechanism | Speed | Energy | Decentralization | Scalability | Finality | Best For |
|-----------|-------|--------|-----------------|-------------|----------|----------|
| **PoW** | Slow (10 min) | Very High | High | Low (~7 TPS) | Probabilistic | Digital gold, maximum security |
| **PoS** | Medium (12 sec) | Very Low | High | Medium (~30 TPS) | Economic | General-purpose chains |
| **DPoS** | Fast (0.5 sec) | Very Low | Low-Medium | High (~3000 TPS) | Near-instant | High-throughput apps |
| **PBFT** | Fast (1-5 sec) | Very Low | Low | Low-Medium | Absolute | Enterprise, permissioned |
| **PoA** | Fast (3-5 sec) | Very Low | Very Low | High | Near-instant | Private/consortium chains |
| **PoH+PoS** | Very Fast (0.4 sec) | Low | Medium | Very High (~65K TPS) | Probabilistic | High-frequency DeFi |
| **PoB** | Variable | Low | Medium | Medium | Probabilistic | Token distribution |

---

## Choosing the Right Mechanism

```
Decision Tree:

Is it a public, permissionless network?
├── YES: Need maximum security?
│   ├── YES → Proof of Work (Bitcoin model)
│   └── NO: Need high speed?
│       ├── YES: Accept fewer validators?
│       │   ├── YES → DPoS or PoH+PoS
│       │   └── NO → PoS with sharding
│       └── NO → Standard PoS
└── NO (permissioned):
    ├── Known, trusted participants → PoA
    └── Need BFT guarantees → PBFT
```

---

## Hybrid Approaches

Many modern blockchains combine multiple mechanisms:

| Blockchain | Combination | Purpose |
|-----------|-------------|---------|
| Solana | PoH + Tower BFT (PoS) | PoH for ordering, PoS for consensus |
| Ethereum 2.0 | PoS + Casper FFG | PoS for proposing, Casper for finality |
| Algorand | Pure PoS + BFT | Random selection + BFT finality |
| Cosmos | PoS + Tendermint BFT | Stake-weighted BFT voting |
| Polkadot | NPoS + GRANDPA | Nominated PoS + finality gadget |

---

## Emerging Consensus Research

| Concept | Description | Status |
|---------|-------------|--------|
| **Proof of Space** | Use disk storage instead of computation (Chia) | Live |
| **Proof of Elapsed Time** | Trusted hardware generates random wait times (Intel SGX) | Experimental |
| **DAG-based** | Directed Acyclic Graph instead of linear chain (IOTA, Hedera) | Live |
| **Proof of Stake + VRF** | Verifiable Random Functions for fair selection (Algorand) | Live |
| **Avalanche Consensus** | Repeated sub-sampled voting (Avalanche) | Live |

---

## Key Takeaways

- DPoS elects a small set of delegates for fast block production but sacrifices decentralization
- PBFT achieves absolute finality through multi-round voting but doesn't scale to large networks
- Proof of Authority relies on known validator identities — ideal for enterprise and testnets
- Proof of History (Solana) creates a verifiable clock for transaction ordering, enabling extreme speed
- Proof of Burn destroys coins as a form of commitment, simulating mining without hardware
- No single consensus mechanism is universally best — each optimizes for different properties
- Modern blockchains increasingly use hybrid approaches combining multiple mechanisms
- The choice depends on the specific requirements: security, speed, decentralization, and use case

---

[Next: Smart Contracts Introduction](11-blockchain-smart-contracts)
