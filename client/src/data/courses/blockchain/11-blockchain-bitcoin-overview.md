---
title: Bitcoin Overview
---

## Introduction to Bitcoin

Bitcoin is the first decentralized digital currency, introduced in 2008 by the pseudonymous **Satoshi Nakamoto**. It operates without a central authority, using peer-to-peer technology and cryptographic proof to enable trustless transactions.

---

## History & Key Milestones

| Year | Event |
|------|-------|
| 2008 | Satoshi Nakamoto publishes the Bitcoin whitepaper "Bitcoin: A Peer-to-Peer Electronic Cash System" |
| 2009 | Genesis block (Block 0) mined on January 3rd; first Bitcoin transaction |
| 2010 | First real-world purchase — 10,000 BTC for two pizzas (Bitcoin Pizza Day) |
| 2011 | Bitcoin reaches parity with USD ($1 = 1 BTC) |
| 2013 | BTC crosses $1,000 for the first time |
| 2017 | Bitcoin forks into BTC and BCH; reaches ~$20,000 |
| 2020 | Institutional adoption begins (MicroStrategy, Tesla) |
| 2021 | El Salvador adopts Bitcoin as legal tender; BTC hits ~$69,000 |
| 2024 | Spot Bitcoin ETFs approved in the United States |

---

## Bitcoin as Digital Gold

Bitcoin is often referred to as "digital gold" because it shares key properties with the precious metal:

- **Scarcity** — fixed maximum supply of 21 million coins
- **Durability** — exists on a distributed, immutable ledger
- **Divisibility** — each BTC is divisible into 100,000,000 satoshis (sats)
- **Portability** — can be sent anywhere in the world in minutes
- **Fungibility** — each sat is interchangeable with another

---

## Supply Cap & Halving

Bitcoin's monetary policy is encoded in its protocol:

```text
Total Supply:        21,000,000 BTC
Smallest Unit:       1 satoshi = 0.00000001 BTC
Initial Block Reward: 50 BTC
Halving Interval:    Every 210,000 blocks (~4 years)
```

### Halving Schedule

| Halving # | Year | Block Reward | Circulating Supply (approx.) |
|-----------|------|-------------|------------------------------|
| 0 (launch) | 2009 | 50 BTC | 0 |
| 1 | 2012 | 25 BTC | 10.5M |
| 2 | 2016 | 12.5 BTC | 15.75M |
| 3 | 2020 | 6.25 BTC | 18.375M |
| 4 | 2024 | 3.125 BTC | 19.6M |

The last Bitcoin is projected to be mined around the year **2140**.

---

## How Bitcoin Works (High Level)

1. A user creates a transaction (e.g., sends 0.5 BTC to another address)
2. The transaction is broadcast to the Bitcoin network
3. Miners collect pending transactions into a candidate block
4. Miners compete to solve a cryptographic puzzle (Proof of Work)
5. The winning miner broadcasts the new block to the network
6. Nodes verify the block and append it to their copy of the blockchain
7. The recipient sees the confirmed transaction

```text
[Sender] → Transaction → [Mempool] → [Miner] → [New Block] → [Blockchain]
```

---

## Bitcoin vs Traditional Finance

| Feature | Bitcoin | Traditional Finance |
|---------|---------|-------------------|
| Authority | Decentralized (no single entity) | Central banks, governments |
| Supply control | Algorithm-based, fixed cap | Discretionary monetary policy |
| Settlement | ~10 minutes (1 confirmation) | 1–3 business days (wire/ACH) |
| Access | Anyone with internet | Requires bank account, KYC |
| Censorship | Resistant | Accounts can be frozen |
| Transparency | Public ledger | Opaque ledgers |
| Operating hours | 24/7/365 | Business hours, holidays |
| Inflation | Deflationary by design | Target ~2% annual inflation |

---

## The Bitcoin Whitepaper

The original whitepaper is only 9 pages long and addresses a core problem:

> "Commerce on the Internet has come to rely almost exclusively on financial institutions serving as trusted third parties to process electronic payments."

Bitcoin's solution removes the need for trust by replacing it with **cryptographic proof** and **economic incentives** (mining rewards).

---

## Key Takeaways

- Bitcoin was created in 2008/2009 by Satoshi Nakamoto as a decentralized digital currency
- It has a hard cap of 21 million coins, enforced by protocol rules
- Block rewards halve every 210,000 blocks, creating a predictable disinflationary supply
- Bitcoin is often compared to gold due to its scarcity and store-of-value properties
- It operates 24/7 without intermediaries, using Proof of Work consensus
- Key differences from traditional finance include decentralization, transparency, and censorship resistance

---

## Next

[Bitcoin Transactions →](12-blockchain-bitcoin-transactions)
