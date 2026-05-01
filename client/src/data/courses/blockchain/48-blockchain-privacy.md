---
title: Privacy in Blockchain
---

Public blockchains are radically transparent — every transaction is visible to everyone forever. While transparency enables trustless verification, it creates serious privacy problems. This lesson explores why blockchain privacy matters, the techniques used to achieve it, and the ongoing tension between privacy and regulatory compliance.

---

## The Blockchain Transparency Problem

On Ethereum or Bitcoin, anyone can see every transaction: sender, receiver, amount, and timing. Once an address is linked to an identity, their entire financial history is exposed.

```
Blockchain transparency example:

Alice buys coffee with crypto at a café
         ↓
Café now knows Alice's address
         ↓
Anyone can look up that address and see:
  • Alice's total balance
  • Every transaction she's ever made
  • Who she sends money to
  • Her salary (incoming regular payments)
  • What tokens/NFTs she holds

This is MORE invasive than traditional banking!
Banks keep records private; blockchains publish everything.
```

| Aspect | Traditional Finance | Public Blockchain |
|--------|-------------------|-------------------|
| Transaction visibility | Bank + regulators only | Everyone, forever |
| Balance privacy | Private | Public (if address known) |
| Identity linkage | Account ↔ name (private) | Address ↔ pseudonymous |
| History | Limited retention | Permanent, immutable |
| Surveillance | Requires legal process | Anyone with a block explorer |

---

## Why Privacy Matters

| Use Case | Privacy Need |
|----------|-------------|
| Salary payments | Employer shouldn't broadcast your salary to the world |
| Business operations | Competitors see your supplier payments and strategy |
| Personal safety | Wealthy addresses are targets for extortion |
| Censorship resistance | Authoritarian regimes track dissidents |
| Fungibility | Coins with "tainted" history get blacklisted |
| Human rights | Donations to activists traceable by hostile governments |

---

## Privacy Techniques Overview

| Technique | Privacy Level | Speed | Complexity | Example |
|-----------|--------------|-------|------------|---------|
| Mixing/Tumbling | Medium | Slow | Low | CoinJoin, Wasabi Wallet |
| Ring signatures | High | Fast | Medium | Monero |
| zk-SNARKs | Very High | Medium | High | Zcash, Tornado Cash |
| Stealth addresses | Medium | Fast | Low | Umbra Protocol |
| Confidential transactions | High | Fast | Medium | Liquid Network, MimbleWimble |
| Private smart contracts | Very High | Slow | Very High | Aztec Network |

---

## Mixing and Tumbling

Mixers pool transactions from multiple users to obscure the link between sender and receiver.

```
CoinJoin mixing:

Without mixing:
  Alice (1 BTC) → Bob (1 BTC)      ← easily traced

With CoinJoin:
  ┌─────────────────────────────────────────┐
  │ Joint Transaction                        │
  │                                          │
  │ Inputs:              Outputs:            │
  │   Alice: 1 BTC        Address X: 1 BTC  │
  │   Carol: 1 BTC        Address Y: 1 BTC  │
  │   Dave:  1 BTC        Address Z: 1 BTC  │
  │                                          │
  │ Which output belongs to which input?     │
  │ → Cannot determine!                      │
  └─────────────────────────────────────────┘

Anonymity set = number of equal-value participants
More participants → harder to trace
```

| Mixer Type | Mechanism | Trust Required |
|------------|-----------|----------------|
| Centralized mixer | Service pools funds | Trust operator (can steal/log) |
| CoinJoin | Users jointly sign one tx | No trust (non-custodial) |
| Wasabi Wallet | CoinJoin with Tor | Coordinator for coordination only |
| JoinMarket | Market-based CoinJoin | No trust (market makers earn fees) |

---

## Ring Signatures (Monero)

Monero uses ring signatures to hide the true sender among a group of decoys.

```
Monero ring signature:

Real sender: Alice
Ring size: 16 (Alice + 15 decoys)

Transaction appears signed by ONE of 16 possible signers:
  [Alice, Bob, Carol, Dave, Eve, Frank, Grace, Henry,
   Iris, Jack, Kate, Leo, Mike, Nancy, Oscar, Peggy]

Verifier confirms: "One of these 16 signed it"
Cannot determine WHICH one → sender privacy

Additional Monero privacy features:
  • Stealth addresses → one-time receiver addresses (receiver privacy)
  • RingCT → hidden transaction amounts (amount privacy)
  • Dandelion++ → hidden IP of broadcaster (network privacy)
```

| Monero Feature | Protects | Mechanism |
|---------------|----------|-----------|
| Ring signatures | Sender identity | Sign as one of N possible signers |
| Stealth addresses | Receiver identity | One-time addresses per transaction |
| RingCT | Transaction amount | Pedersen commitments (homomorphic) |
| Dandelion++ | Network identity (IP) | Stem-and-fluff propagation |

---

## zk-SNARKs (Zcash)

Zcash uses zk-SNARKs to enable fully shielded transactions where sender, receiver, and amount are all hidden.

```
Zcash transaction types:

Transparent (t-address): Like Bitcoin, fully visible
  t1abc... → t1xyz... (1.5 ZEC) ← public

Shielded (z-address): Sender, receiver, amount ALL hidden
  z1abc... → z1xyz... (??? ZEC) ← private
  Proof: "This transaction is valid (inputs = outputs, no double-spend)"
  Revealed: Nothing about sender, receiver, or amount

Mixed: Convert between transparent and shielded
  t1abc... → z1xyz... (shielding)
  z1abc... → t1xyz... (deshielding)
```

---

## Tornado Cash

Tornado Cash was an Ethereum mixer using zk-SNARKs to break the link between depositor and withdrawer.

```
Tornado Cash flow:

1. Deposit phase:
   Alice deposits exactly 1 ETH + secret note (commitment)
   Bob deposits exactly 1 ETH + secret note
   Carol deposits exactly 1 ETH + secret note
   ... hundreds of deposits into same pool ...

2. Wait (accumulate anonymity set)

3. Withdrawal phase:
   Alice generates ZK proof:
   "I deposited into this pool (I have a valid note)
    but I won't tell you WHICH deposit was mine"
   Withdraws to a fresh address

Anonymity set = total number of deposits in pool
Pool choices: 0.1, 1, 10, 100 ETH (fixed denominations)
```

### Tornado Cash Sanctions (2022)

| Event | Impact |
|-------|--------|
| OFAC sanctioned Tornado Cash contracts | First time smart contracts were sanctioned |
| Developer arrested | Alexey Pertsev charged in Netherlands |
| GitHub repo removed | Open source code taken down |
| RPC providers blocked | Infura/Alchemy blocked Tornado interactions |
| Debate | Privacy tool vs money laundering enabler |

---

## Privacy vs Compliance

The fundamental tension in blockchain privacy:

```
Privacy advocates:                 Regulators:
─────────────────                  ────────────
"Privacy is a right"               "Need to prevent money laundering"
"Financial surveillance            "Terrorist financing must
 is oppressive"                     be trackable"
"Fungibility requires              "Tax evasion undermines
 privacy"                           society"

Middle ground approaches:
├── Selective disclosure (prove compliance without revealing all)
├── View keys (auditor access without public exposure)
├── Compliant privacy pools (exclude known-bad actors)
└── ZK compliance proofs ("I passed KYC" without revealing identity)
```

| Approach | Privacy | Compliance | Example |
|----------|---------|------------|---------|
| Fully transparent | None | Full | Ethereum (base layer) |
| Optional privacy | User choice | Partial | Zcash (t and z addresses) |
| Selective disclosure | High (with auditor access) | Possible | Zcash view keys |
| Privacy pools | High (exclude sanctioned) | Possible | Vitalik's privacy pools proposal |
| Default privacy | Full | Challenging | Monero |
| ZK compliance | High | Full (provable) | Aztec, Espresso |

---

## Emerging Privacy Solutions

| Solution | Approach | Status |
|----------|----------|--------|
| Aztec Network | Private smart contracts (ZK rollup) | Testnet |
| Railgun | On-chain privacy for DeFi (shielded balances) | Live on Ethereum |
| Penumbra | Private PoS chain with shielded DEX | Mainnet |
| Namada | Multi-chain privacy via shielded transfers | Mainnet |
| Privacy Pools | Prove funds are NOT from sanctioned sources | Research/proposal |
| ERC-5564 | Stealth address standard for Ethereum | EIP stage |

---

## Chain Analysis and De-anonymization

Even with privacy tools, sophisticated analysis can sometimes break privacy:

| Attack | Description | Mitigation |
|--------|-------------|------------|
| Timing analysis | Correlate deposit/withdrawal times | Wait random intervals |
| Amount correlation | Match unique amounts | Use fixed denomination pools |
| Address reuse | Link multiple transactions | Use fresh addresses always |
| IP tracking | Link transactions to IP addresses | Use Tor/VPN |
| Dust attacks | Send tiny amounts to track spending | Don't spend dust outputs |
| Social engineering | Phishing for address information | OpSec practices |

---

## Key Takeaways

- Public blockchains are more invasive than traditional banking — every transaction is visible forever
- Privacy is essential for fungibility, personal safety, business confidentiality, and human rights
- Mixing (CoinJoin) obscures links but provides limited anonymity sets
- Ring signatures (Monero) hide the sender among decoys with mandatory privacy
- zk-SNARKs (Zcash, Tornado Cash) provide the strongest privacy guarantees through cryptographic proofs
- Tornado Cash sanctions (2022) raised fundamental questions about code, privacy, and regulation
- The future lies in "compliant privacy" — proving legitimacy without revealing details (ZK compliance proofs)
- Privacy is not about hiding wrongdoing — it's a fundamental requirement for a functional financial system

---

[Next: Blockchain Interoperability](49-blockchain-interoperability)
