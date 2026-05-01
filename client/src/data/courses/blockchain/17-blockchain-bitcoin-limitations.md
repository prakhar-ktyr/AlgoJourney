---
title: Bitcoin Limitations & Scaling
---

## The Scalability Problem

Bitcoin's base layer processes approximately **7 transactions per second (TPS)**. For comparison:

| Network | Transactions Per Second |
|---------|------------------------|
| Bitcoin (base layer) | ~7 TPS |
| Ethereum (base layer) | ~15-30 TPS |
| Visa | ~65,000 TPS (peak capacity) |
| Mastercard | ~5,000 TPS |
| PayPal | ~1,500 TPS |

This fundamental limitation arises from Bitcoin's design choices:

```text
Block size:     ~1-4 MB (with SegWit)
Block time:     ~10 minutes
Avg tx size:    ~250 vBytes
Max tx/block:   ~4,000-8,000 transactions
TPS:            ~4,000 / 600 seconds ≈ 7 TPS
```

---

## The Block Size Debate

One of Bitcoin's most contentious historical debates centered on increasing the block size:

| Position | Argument | Proponents |
|----------|----------|------------|
| Small blocks | Keeps nodes cheap to run; decentralization priority | Bitcoin Core developers |
| Big blocks | More transactions; lower fees; on-chain scaling | Bitcoin Cash supporters |
| Compromise | SegWit increases effective capacity without hard fork | Adopted by Bitcoin |

### Timeline

```text
2015: Block size debate intensifies
2016: SegWit proposed as soft fork solution
2017: Bitcoin Cash hard forks (8 MB blocks)
2017: SegWit activated on Bitcoin (August)
2017: SegWit2x (2 MB hard fork) abandoned (November)
```

---

## Segregated Witness (SegWit)

SegWit (BIP141, activated August 2017) was a soft fork that:

| Feature | Description |
|---------|-------------|
| Separates witness data | Signature data moved outside the base block |
| New weight metric | Block weight limit of 4,000,000 weight units |
| Effective increase | ~1.7-2× more transactions per block |
| Fixes malleability | Transaction IDs no longer affected by signature changes |
| Enables Lightning | Malleability fix was prerequisite for payment channels |

### Block Weight Calculation

```text
Block Weight = (Non-witness data × 4) + (Witness data × 1)
Max Block Weight = 4,000,000 WU

Example transaction:
  Non-witness: 100 bytes × 4 = 400 WU
  Witness:     150 bytes × 1 = 150 WU
  Total:       550 WU (vs 250 bytes in legacy)
```

---

## The Lightning Network

Lightning Network is Bitcoin's primary Layer 2 scaling solution, enabling near-instant, low-fee transactions through payment channels.

### How It Works

```text
1. Open Channel:   Alice and Bob lock BTC in a 2-of-2 multi-sig on-chain
2. Transact:       They exchange signed commitment transactions off-chain
3. Route:          Payments can hop across multiple channels (A→B→C→D)
4. Close Channel:  Final state broadcast to blockchain when done
```

### Payment Channels

```text
Opening:
  Alice deposits 0.5 BTC ──→ [2-of-2 Multi-sig] ←── Bob deposits 0.5 BTC
                              Total: 1.0 BTC locked

After 3 payments:
  Alice: 0.2 BTC  |  Bob: 0.8 BTC  (updated off-chain)

Closing:
  Final balances broadcast to blockchain in one transaction
```

### Lightning Network Features

| Feature | Value |
|---------|-------|
| Transaction speed | Milliseconds |
| Fees | < 1 satoshi for small payments |
| Capacity | Thousands of TPS |
| Privacy | Onion-routed (intermediate nodes don't see endpoints) |
| Min payment | 1 satoshi |
| Requires | On-chain transaction to open/close channels |

### Lightning Limitations

| Limitation | Description |
|-----------|-------------|
| Liquidity | Channel capacity limits payment size |
| Online requirement | Both parties must be online (or use watchtowers) |
| Routing | Finding paths through the network can be complex |
| Channel management | Requires active balance management |
| On-chain dependency | Opening/closing channels still needs base layer |

---

## Sidechains

Sidechains are independent blockchains pegged to Bitcoin:

```text
Main Chain (Bitcoin) ←→ Sidechain
        ↑                    ↑
   Peg-in (lock BTC)    Use features (smart contracts, faster blocks)
   Peg-out (unlock BTC)  Return to main chain
```

| Sidechain | Purpose | Consensus |
|-----------|---------|-----------|
| Liquid Network | Confidential transactions, faster settlement | Federated |
| RSK (Rootstock) | Smart contracts on Bitcoin | Merge-mined |
| Stacks | Smart contracts, DeFi for Bitcoin | Proof of Transfer |

---

## The Scaling Trilemma

Every blockchain must balance three competing properties:

```text
        Decentralization
             /\
            /  \
           /    \
          /      \
  Security ────── Scalability
```

| Property | Bitcoin's Choice |
|----------|-----------------|
| Decentralization | High priority (small blocks, anyone can run a node) |
| Security | High priority (massive hash power, 10-min blocks) |
| Scalability | Sacrificed at base layer (7 TPS) |

Bitcoin's philosophy: optimize Layer 1 for security and decentralization, scale on Layer 2.

---

## Other Scaling Approaches

| Approach | Description | Status |
|----------|-------------|--------|
| Schnorr signatures | Aggregate multiple signatures into one | Active (Taproot) |
| Batching | Combine multiple payments into one transaction | Widely used |
| SegWit adoption | More efficient use of block space | ~80% adoption |
| Channel factories | Open many Lightning channels in one tx | Research |
| Ark | Off-chain protocol for payments | Development |
| Statechains | Transfer UTXO ownership off-chain | Experimental |

---

## Future Developments

| Development | Purpose |
|-------------|---------|
| Covenants (OP_CTV) | Restrict how UTXOs can be spent; enable vaults |
| Cross-input aggregation | Further reduce transaction sizes |
| Channel factories | Reduce on-chain footprint of Lightning |
| FROST | Threshold Schnorr signatures |
| BitVM | Turing-complete computation verified on Bitcoin |

---

## Summary Comparison

| Layer | Speed | Fees | Security | Decentralization |
|-------|-------|------|----------|-----------------|
| Bitcoin L1 | ~10 min | Variable (high in demand) | Maximum | Maximum |
| Lightning (L2) | Milliseconds | < 1 sat | High (anchored to L1) | High |
| Sidechains | Seconds | Low | Medium (separate consensus) | Varies |

---

## Key Takeaways

- Bitcoin's base layer is limited to ~7 TPS by design (security and decentralization trade-off)
- The block size debate split the community; Bitcoin chose SegWit (soft fork) over bigger blocks
- SegWit increased effective capacity ~2× and enabled Layer 2 solutions
- Lightning Network handles payments off-chain with near-instant speed and minimal fees
- Sidechains provide additional features while pegging value to Bitcoin
- The scaling trilemma means you cannot maximize all three properties simultaneously
- Bitcoin's strategy: secure base layer + scalable upper layers

---

## Next

[Ethereum Overview →](18-blockchain-ethereum-overview)
