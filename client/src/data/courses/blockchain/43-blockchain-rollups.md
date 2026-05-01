---
title: Rollups
---

Rollups are the leading Layer 2 scaling solution for Ethereum. They execute transactions off-chain, compress the results, and post data back to Layer 1. There are two main types: optimistic rollups (which assume validity and allow challenges) and ZK rollups (which prove validity cryptographically). This lesson explores both in depth.

---

## How Rollups Work

All rollups share the same high-level architecture:

```
┌──────────────────── Rollup (L2) ────────────────────┐
│                                                       │
│  1. Users submit transactions to a sequencer          │
│  2. Sequencer orders and executes transactions        │
│  3. New state root computed                           │
│  4. Batch compressed and posted to L1                 │
│                                                       │
└───────────────────────────────────────────────────────┘
                          ↓
┌──────────────────── Ethereum (L1) ───────────────────┐
│                                                       │
│  - Stores compressed transaction data (calldata/blobs)│
│  - Verifies proofs (fraud or validity)                │
│  - Holds bridge contract (deposits/withdrawals)       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

| Component | Role |
|-----------|------|
| Sequencer | Orders and executes transactions, produces batches |
| Batch | Compressed set of transactions posted to L1 |
| State root | Merkle root representing the current L2 state |
| Bridge contract | L1 smart contract managing deposits/withdrawals |
| Prover/Challenger | Validates state transitions (method differs by type) |

---

## Optimistic Rollups

Optimistic rollups "optimistically" assume all transactions are valid. Anyone can challenge a batch by submitting a fraud proof within a challenge window (typically 7 days).

### How Fraud Proofs Work

```
Optimistic Rollup Flow:

1. Sequencer posts batch to L1: "State changed from A → B"
2. Challenge period begins (7 days)
3a. No challenge → Batch finalized ✓
3b. Challenger submits fraud proof:
    - Re-executes disputed transaction on L1
    - If result ≠ claimed state → batch reverted
    - Sequencer slashed, challenger rewarded

Key insight: Only ONE honest verifier is needed
to keep the system secure (1-of-N trust model)
```

| Property | Detail |
|----------|--------|
| Trust model | 1-of-N (one honest challenger sufficient) |
| Challenge period | 7 days (Arbitrum, Optimism) |
| Withdrawal time | 7 days (waiting for challenge period) |
| EVM compatibility | Full (or near-full) |
| Proof system | Interactive (Arbitrum) or non-interactive (Optimism) |

---

## Arbitrum vs Optimism

| Feature | Arbitrum One | Optimism (OP Mainnet) |
|---------|-------------|----------------------|
| Fraud proof type | Interactive (multi-round) | Non-interactive (single-round, Cannon) |
| VM | ArbOS (custom WASM) | OP Stack (EVM-equivalent) |
| EVM compatibility | EVM-compatible | EVM-equivalent |
| Challenge period | 7 days | 7 days |
| Sequencer | Centralized (decentralizing) | Centralized (decentralizing) |
| Token | ARB | OP |
| Ecosystem | Largest L2 TVL, GMX, Camelot | Superchain vision, Base, Zora |
| Key innovation | Nitro (WASM-based proving) | OP Stack (modular, forkable) |

### The OP Stack & Superchain

```
OP Stack: Modular, open-source rollup framework

Superchain Vision:
┌─────────────────────────────────────────────┐
│              Shared Sequencer                 │
├──────────┬──────────┬──────────┬────────────┤
│ Optimism │   Base   │   Zora   │  Mode      │  ← OP Chains
│ (OP Labs)│(Coinbase)│  (NFTs)  │ (DeFi)    │
├──────────┴──────────┴──────────┴────────────┤
│         Ethereum L1 (shared settlement)      │
└─────────────────────────────────────────────┘

Benefits: Shared bridge, cross-chain messaging,
          interoperability between OP chains
```

---

## ZK Rollups

ZK (Zero-Knowledge) rollups generate a cryptographic validity proof for every batch. The L1 contract verifies this proof, mathematically guaranteeing the batch is correct — no challenge period needed.

### How Validity Proofs Work

```
ZK Rollup Flow:

1. Sequencer executes transactions off-chain
2. Prover generates a validity proof (SNARK or STARK)
   - Proof says: "I correctly executed these txs, resulting in state B"
3. Proof + state root submitted to L1 verifier contract
4. L1 verifies proof (cheap, ~200-500K gas)
5. If valid → state finalized immediately ✓

Key insight: Math guarantees correctness.
No need to trust anyone or wait for challenges.
```

| Property | Detail |
|----------|--------|
| Trust model | Trustless (math-based) |
| Finality | Immediate once proof verified on L1 |
| Withdrawal time | Minutes to hours (proof generation time) |
| EVM compatibility | Varies (hard to prove EVM execution in ZK circuits) |
| Proof generation | Computationally expensive (specialized hardware) |

---

## zkSync vs StarkNet

| Feature | zkSync Era | StarkNet |
|---------|-----------|----------|
| Proof system | zk-SNARKs (PLONK) | zk-STARKs |
| Language | Solidity (compiled to zkEVM) | Cairo (custom language) |
| EVM compatibility | EVM-compatible (Type 4 zkEVM) | Not EVM (Cairo VM) |
| Trusted setup | Required (SNARKs) | Not required (STARKs) |
| Proof size | Small (~constant) | Larger (scales with computation) |
| Quantum resistance | No | Yes (hash-based) |
| Developer experience | Familiar (Solidity) | New language (Cairo) |
| Account abstraction | Native (all accounts are smart contracts) | Native |

### Types of zkEVMs

```
zkEVM Compatibility Spectrum:

Type 1: Fully Ethereum-equivalent
         (proves actual EVM execution)
         Example: Taiko, Scroll
         Pro: Perfect compatibility
         Con: Very slow proving

Type 2: Fully EVM-equivalent
         (minor changes for easier proving)
         Example: Scroll, Polygon zkEVM
         Pro: Most Solidity code works unchanged
         Con: Some edge cases differ

Type 3: Almost EVM-equivalent
         (some EVM features removed)
         Example: (transitional stage)
         Pro: Faster proving
         Con: Some contracts need modification

Type 4: High-level language equivalent
         (compiles Solidity to custom VM)
         Example: zkSync Era
         Pro: Fastest proving
         Con: Bytecode-level differences
```

---

## Optimistic vs ZK Rollups: Comparison

| Criteria | Optimistic Rollups | ZK Rollups |
|----------|-------------------|------------|
| Security mechanism | Fraud proofs (reactive) | Validity proofs (proactive) |
| Withdrawal time | 7 days | Minutes to hours |
| Computation cost | Low (just execute) | High (generate proofs) |
| EVM compatibility | Excellent | Improving (zkEVM) |
| Data on-chain | Full transaction data | State diffs (more compressed) |
| Maturity | Production (2021+) | Production (2023+) |
| Best for | General-purpose DeFi/apps | Payments, high-frequency trading |
| Current leaders | Arbitrum, Optimism, Base | zkSync, StarkNet, Scroll |

---

## The Sequencer Problem

Both rollup types currently rely on centralized sequencers — a single entity that orders transactions.

| Concern | Impact | Solution (in progress) |
|---------|--------|----------------------|
| Censorship | Sequencer can ignore your tx | Forced inclusion via L1 |
| MEV extraction | Sequencer can front-run | Decentralized sequencer, fair ordering |
| Liveness | Sequencer goes down → L2 halts | Escape hatch to L1, backup sequencers |
| Single point of failure | One entity controls ordering | Shared sequencers (Espresso, Astria) |

---

## The Future of Rollups

```
Evolution of rollups:

2021-2023: Centralized sequencers, basic fraud/validity proofs
2024-2025: Decentralized sequencers, cross-rollup interop
2025-2027: Shared sequencing, real-time proving, full decentralization
2027+: Millions of TPS, sub-cent fees, seamless cross-chain UX

Technologies driving this:
- EIP-4844 / Danksharding → cheaper data posting
- Shared sequencers → better cross-L2 composability
- Recursive proofs → faster ZK proving
- Based rollups → L1-sequenced (most decentralized)
```

---

## Key Takeaways

- Rollups execute off-chain and post compressed data to L1, inheriting Ethereum's security
- Optimistic rollups assume validity and rely on fraud proofs with a 7-day challenge period
- ZK rollups prove validity cryptographically, enabling faster withdrawals (minutes vs days)
- Arbitrum and Optimism lead optimistic rollups; zkSync and StarkNet lead ZK rollups
- zkEVMs are making ZK rollups compatible with existing Solidity code
- All major rollups currently use centralized sequencers, which is a known centralization risk
- The OP Stack enables an ecosystem of interoperable "OP Chains" (Superchain)
- Rollups are the core of Ethereum's scaling roadmap — the future is rollup-centric

---

[Next: Cross-Chain Bridges](44-blockchain-bridges)
