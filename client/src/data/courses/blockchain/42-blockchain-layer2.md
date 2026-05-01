---
title: Layer 2 Scaling Solutions
---

Layer 2 (L2) solutions are protocols built on top of a Layer 1 blockchain (like Ethereum) to increase transaction throughput and reduce costs while inheriting the security of the underlying chain. As Ethereum mainnet processes only ~15 transactions per second with high gas fees, L2s are essential for mainstream adoption.

---

## Why Layer 2 is Needed

| Metric | Ethereum L1 | Desired for Mass Adoption |
|--------|-------------|--------------------------|
| Transactions per second | ~15 TPS | 10,000+ TPS |
| Transaction cost | $1-$100+ | < $0.01 |
| Finality | ~12 minutes | < 1 second |
| Scalability trilemma | Security + Decentralization | Security + Decentralization + Scalability |

The blockchain trilemma states you can only optimize two of three: decentralization, security, and scalability. Layer 2 solutions attempt to break this trilemma by handling execution off-chain while posting proofs or data to L1 for security.

```
Blockchain Trilemma:

        Decentralization
           /        \
          /    L2    \
         /   breaks   \
        /   trilemma   \
       /________________\
  Security          Scalability

L1: Optimizes security + decentralization
L2: Adds scalability on top of L1 security
```

---

## Types of Layer 2 Solutions

| Type | How It Works | Security | Speed | Examples |
|------|-------------|----------|-------|----------|
| State Channels | Off-chain txs between parties, settle on-chain | High (dispute mechanism) | Instant | Lightning Network, Raiden |
| Sidechains | Independent chain with own consensus | Medium (own validators) | Fast | Polygon PoS, Gnosis Chain |
| Plasma | Child chains posting commitments to L1 | High (exit game) | Fast | OMG Network |
| Optimistic Rollups | Batch txs, assume valid unless challenged | High (fraud proofs) | ~minutes | Arbitrum, Optimism |
| ZK Rollups | Batch txs, prove validity cryptographically | Highest (validity proofs) | ~minutes | zkSync, StarkNet |

---

## State Channels

State channels let two or more parties transact off-chain, only settling the final state on-chain.

```
Alice and Bob open a payment channel:

1. Alice locks 5 ETH on-chain (open channel)
2. Off-chain: Alice sends 1 ETH to Bob (signed message)
3. Off-chain: Bob sends 0.5 ETH to Alice (signed message)
4. Off-chain: Alice sends 2 ETH to Bob (signed message)
   ... (thousands of instant, free txs)
5. Close channel → settle final balances on-chain
   Alice: 2.5 ETH, Bob: 2.5 ETH

Only 2 on-chain txs for unlimited off-chain txs!
```

**Pros**: Instant finality, near-zero fees, privacy
**Cons**: Requires both parties online, limited to channel participants, capital lockup

---

## Sidechains

Sidechains are independent blockchains with their own consensus mechanism, connected to L1 via a bridge.

| Feature | Sidechain | True L2 |
|---------|-----------|---------|
| Consensus | Own validators | Inherits from L1 |
| Security | Only as secure as its own validators | Secured by L1 |
| Data availability | Stored on sidechain | Posted to L1 |
| Bridge | Trust assumptions | Trustless (proofs) |

> **Note**: Polygon PoS is technically a sidechain, not a true L2, because it has its own validator set. However, it is migrating toward a ZK-based L2 architecture.

---

## Rollups: The Dominant L2 Approach

Rollups execute transactions off-chain, then post compressed transaction data back to L1. This gives them L1-level security while dramatically increasing throughput.

```
How rollups work:

┌────────────── Layer 2 (Rollup) ──────────────┐
│                                                │
│  Tx1, Tx2, Tx3, ... Tx1000                    │
│       ↓                                        │
│  Execute off-chain (sequencer)                 │
│       ↓                                        │
│  Compress into batch                           │
│       ↓                                        │
└────────────────────────────────────────────────┘
         ↓  Post batch + proof to L1
┌────────────── Layer 1 (Ethereum) ─────────────┐
│                                                │
│  Verify proof or allow challenge period        │
│  Store compressed data (calldata/blobs)        │
│                                                │
└────────────────────────────────────────────────┘
```

---

## L1 vs L2 Comparison

| Feature | Layer 1 (Ethereum) | Layer 2 (Rollup) |
|---------|-------------------|------------------|
| Execution | On-chain (all nodes) | Off-chain (sequencer) |
| Data storage | On-chain | On L1 (compressed) |
| Security source | Own consensus | Inherits from L1 |
| Gas cost | High ($1-$100+) | Low ($0.01-$0.50) |
| TPS | ~15 | 1,000-4,000+ |
| Finality | ~12 min | Seconds (soft), hours (hard) |
| Decentralization | High | Lower (centralized sequencer, improving) |
| Composability | Full (same chain) | Limited (cross-L2 bridges needed) |

---

## Popular Layer 2 Solutions

| L2 | Type | TPS | Avg Fee | TVL | Key Feature |
|----|------|-----|---------|-----|-------------|
| Arbitrum One | Optimistic Rollup | ~4,000 | $0.10 | ~$10B+ | Largest ecosystem, Nitro stack |
| Optimism | Optimistic Rollup | ~2,000 | $0.10 | ~$7B+ | OP Stack (Superchain vision) |
| zkSync Era | ZK Rollup | ~2,000 | $0.05 | ~$1B+ | EVM-compatible ZK rollup |
| StarkNet | ZK Rollup (STARK) | ~1,000 | $0.02 | ~$500M+ | Cairo language, high throughput |
| Base | Optimistic Rollup | ~2,000 | $0.05 | ~$5B+ | Built by Coinbase, OP Stack |
| Polygon zkEVM | ZK Rollup | ~2,000 | $0.03 | ~$500M+ | EVM-equivalent ZK rollup |

---

## How to Use Layer 2 (User Perspective)

```
Steps to use an L2 (e.g., Arbitrum):

1. Bridge assets: Send ETH from Ethereum → Arbitrum
   - Use official bridge (arbitrum.io/bridge)
   - Or third-party bridges (Hop, Stargate) for faster transfers

2. Configure wallet:
   Network: Arbitrum One
   RPC: https://arb1.arbitrum.io/rpc
   Chain ID: 42161
   Currency: ETH

3. Use dApps: Same UX as Ethereum, but cheaper
   - Uniswap, Aave, GMX all deployed on Arbitrum
   - Interact exactly as you would on L1

4. Withdraw: Bridge back to Ethereum (7-day wait for optimistic rollups)
```

---

## The Future: L2 Ecosystem

The Ethereum roadmap is "rollup-centric" — Ethereum will serve as a data availability and settlement layer, while L2s handle execution.

```
Future Ethereum architecture:

┌─────────────────────────────────────────────────┐
│              User-facing applications             │
├───────────┬───────────┬───────────┬─────────────┤
│ Arbitrum  │ Optimism  │ zkSync    │ StarkNet    │  ← L2s
├───────────┴───────────┴───────────┴─────────────┤
│         Ethereum L1 (settlement + DA)            │
│   Proto-danksharding (EIP-4844) → Danksharding  │
└─────────────────────────────────────────────────┘
```

EIP-4844 (Proto-danksharding) introduced "blob" transactions that reduce L2 data posting costs by 10-100x, making L2 transactions even cheaper.

---

## Key Takeaways

- Layer 2 solutions scale Ethereum by executing transactions off-chain while inheriting L1 security
- Rollups (optimistic and ZK) are the dominant L2 approach and the focus of Ethereum's roadmap
- State channels provide instant finality but are limited to specific participants
- Sidechains have their own security model and are technically not true L2s
- Optimistic rollups assume transactions are valid unless challenged (7-day withdrawal delay)
- ZK rollups prove validity cryptographically (faster withdrawals, higher computation cost)
- EIP-4844 dramatically reduced L2 fees by introducing blob data storage
- The ecosystem is converging on a multi-L2 future with bridges connecting them

---

[Next: Rollups](43-blockchain-rollups)
